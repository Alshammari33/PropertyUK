"""
Explainable weighted scoring engine for property recommendations.

Weights (Phase 1):
  - Budget match:    40%
  - Area match:      25%
  - Bedrooms match:  15%
  - Property type:   10%
  - Priorities:      10%

Each component returns a 0-1 score and an optional reason string.
Top 20 results are returned, sorted by descending score.
"""

from sqlalchemy.orm import Session

from app.models import Property
from app.schemas import RecommendRequest, PropertyOut, ScoredProperty


# ---------- Weight constants ----------

W_BUDGET = 0.40
W_AREA = 0.25
W_BEDROOMS = 0.15
W_TYPE = 0.10
W_PRIORITIES = 0.10

TOP_N = 20


def _score_budget(price: float, budget_max: float) -> tuple[float, str | None]:
    """Score how well the price fits within the budget."""
    if price <= budget_max:
        # Closer to budget = still good; well under = great
        ratio = price / budget_max if budget_max > 0 else 0
        score = 1.0
        if ratio <= 0.8:
            reason = f"Well within budget (£{price:.0f}/mo)"
        else:
            reason = f"Within budget (£{price:.0f}/mo)"
        return score, reason
    else:
        # Over budget – linearly penalise up to 30% over, then 0
        overshoot = (price - budget_max) / budget_max if budget_max > 0 else 1
        score = max(0.0, 1.0 - overshoot / 0.3)
        return score, None


def _score_area(area: str, city: str, preferred: list[str]) -> tuple[float, str | None]:
    """Score area/city match against preferred areas."""
    if not preferred:
        return 1.0, None  # No preference = neutral score

    area_lower = area.lower()
    city_lower = city.lower()
    for pref in preferred:
        pref_lower = pref.lower()
        if pref_lower in area_lower or pref_lower in city_lower:
            return 1.0, f"Located in {area}, {city}"
    return 0.0, None


def _score_bedrooms(actual: int, wanted: int) -> tuple[float, str | None]:
    """Score bedroom count match."""
    if actual == wanted:
        return 1.0, f"Matches {wanted}-bed requirement"
    diff = abs(actual - wanted)
    if diff == 1:
        return 0.5, None
    return 0.0, None


def _score_type(actual: str, wanted: str) -> tuple[float, str | None]:
    """Score property type match."""
    if not wanted:
        return 1.0, None
    if actual.lower() == wanted.lower():
        return 1.0, f"Property type: {actual}"
    return 0.0, None


def _score_priorities(prop: Property, req: RecommendRequest) -> tuple[float, str | None]:
    """Score based on priority toggles. Returns average of matched priorities."""
    checks: list[tuple[bool, bool, str]] = [
        (req.priorities.near_station, prop.station_distance_mins is not None and prop.station_distance_mins <= 10, "Close to station"),
        (req.priorities.furnished, prop.furnished, "Furnished"),
        (req.priorities.bills_included, prop.bills_included, "Bills included"),
        (req.priorities.parking, prop.parking, "Parking available"),
        (req.priorities.garden, prop.garden, "Has garden"),
    ]

    active = [(met, reason) for wanted, met, reason in checks if wanted]
    if not active:
        return 1.0, None  # No priorities selected

    matched = sum(1 for met, _ in active if met)
    score = matched / len(active)

    # Pick the best reason from matched priorities
    reasons = [reason for met, reason in active if met]
    best_reason = reasons[0] if reasons else None
    return score, best_reason


def rank_properties(db: Session, req: RecommendRequest) -> list[ScoredProperty]:
    """Run the weighted scoring engine and return the top 20 results."""
    # Pre-filter: only consider properties up to 30% over budget
    ceiling = req.budget_max * 1.3 if req.budget_max else None
    query = db.query(Property)
    if ceiling:
        query = query.filter(Property.price <= ceiling)

    properties = query.all()
    scored: list[ScoredProperty] = []

    for prop in properties:
        reasons: list[str] = []

        # Compute each component
        s_budget, r_budget = _score_budget(prop.price, req.budget_max)
        s_area, r_area = _score_area(prop.area, prop.city, req.preferred_areas)
        s_bed, r_bed = _score_bedrooms(prop.bedrooms, req.bedrooms)
        s_type, r_type = _score_type(prop.property_type, req.property_type)
        s_pri, r_pri = _score_priorities(prop, req)

        # Weighted total
        total = (
            W_BUDGET * s_budget
            + W_AREA * s_area
            + W_BEDROOMS * s_bed
            + W_TYPE * s_type
            + W_PRIORITIES * s_pri
        )

        # Collect up to 3 reasons (highest-weight first)
        for r in [r_budget, r_area, r_bed, r_type, r_pri]:
            if r and len(reasons) < 3:
                reasons.append(r)

        scored.append(
            ScoredProperty(
                property=PropertyOut.model_validate(prop),
                score=round(total, 2),
                reasons=reasons,
            )
        )

    # Sort descending by score, return top N
    scored.sort(key=lambda s: s.score, reverse=True)
    return scored[:TOP_N]
