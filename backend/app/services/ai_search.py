"""
AI-enhanced natural language search parser.

Parses plain-English queries like:
  "2 bed flat in Manchester under £1200 near station furnished"
into structured filters + relevance scoring for search results.
"""

import re
from dataclasses import dataclass, field
from typing import Optional

from app.models import Property


# --------------- Known UK cities & areas for matching ---------------

UK_CITIES = [
    "london", "manchester", "birmingham", "leeds", "glasgow", "bristol",
    "liverpool", "sheffield", "edinburgh", "cardiff", "newcastle",
    "nottingham", "reading", "brighton", "cambridge", "oxford", "bath",
    "hove",
]

UK_AREAS = [
    "canary wharf", "stratford", "clapham", "shoreditch", "greenwich",
    "dulwich", "northern quarter", "salford quays", "didsbury",
    "city centre", "jewellery quarter", "edgbaston", "brindleyplace",
    "headingley", "leeds dock", "chapel allerton", "west end",
    "merchant city", "southside", "clifton", "harbourside", "bishopston",
    "baltic triangle", "albert dock", "sefton park", "kelham island",
    "ecclesall", "new town", "leith", "stockbridge", "morningside",
    "cardiff bay", "pontcanna", "jesmond", "quayside", "gosforth",
    "lace market", "west bridgford", "station quarter", "the lanes",
    "mill road", "jericho", "royal crescent",
]

PROPERTY_TYPES = {
    "flat": "Flat", "apartment": "Flat", "studio": "Studio",
    "house": "House", "terrace": "House", "terraced": "House",
    "semi-detached": "House", "detached": "House", "bungalow": "Bungalow",
    "room": "Room",
}


@dataclass
class ParsedQuery:
    """Structured result of parsing a natural language property query."""
    keyword: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    bedrooms: Optional[int] = None
    property_type: Optional[str] = None
    furnished: Optional[bool] = None
    bills_included: Optional[bool] = None
    parking: Optional[bool] = None
    near_station: bool = False
    garden: Optional[bool] = None
    extracted_terms: list[str] = field(default_factory=list)


def parse_natural_query(q: str) -> ParsedQuery:
    """Parse a natural language query into structured property filters."""
    result = ParsedQuery()
    if not q:
        return result

    text = q.lower().strip()
    remaining = text

    # --- Extract price constraints ---
    # "under £1200", "below 1500", "max 1000", "up to £2000"
    price_max_patterns = [
        r"(?:under|below|max|up\s*to|less\s*than|budget)\s*£?\s*(\d[\d,]*)",
        r"£(\d[\d,]*)\s*(?:max|or\s*less|budget)",
    ]
    for pat in price_max_patterns:
        m = re.search(pat, remaining)
        if m:
            result.max_price = float(m.group(1).replace(",", ""))
            result.extracted_terms.append(f"Max £{result.max_price:.0f}")
            remaining = remaining[:m.start()] + remaining[m.end():]
            break

    # "above £800", "min 500", "at least 600", "from £700"
    price_min_patterns = [
        r"(?:above|over|min|at\s*least|from|more\s*than)\s*£?\s*(\d[\d,]*)",
        r"£(\d[\d,]*)\s*(?:min|\+|or\s*more)",
    ]
    for pat in price_min_patterns:
        m = re.search(pat, remaining)
        if m:
            result.min_price = float(m.group(1).replace(",", ""))
            result.extracted_terms.append(f"Min £{result.min_price:.0f}")
            remaining = remaining[:m.start()] + remaining[m.end():]
            break

    # "£800-£1200", "800 to 1200"
    range_pat = r"£?\s*(\d[\d,]*)\s*[-–to]+\s*£?\s*(\d[\d,]*)"
    m = re.search(range_pat, remaining)
    if m and result.min_price is None and result.max_price is None:
        result.min_price = float(m.group(1).replace(",", ""))
        result.max_price = float(m.group(2).replace(",", ""))
        result.extracted_terms.append(f"£{result.min_price:.0f}–£{result.max_price:.0f}")
        remaining = remaining[:m.start()] + remaining[m.end():]

    # --- Extract bedrooms ---
    bed_patterns = [
        r"(\d)\s*(?:bed(?:room)?s?|br)\b",
        r"(\d)\s*-?\s*bed",
    ]
    for pat in bed_patterns:
        m = re.search(pat, remaining)
        if m:
            result.bedrooms = int(m.group(1))
            result.extracted_terms.append(f"{result.bedrooms} bedroom(s)")
            remaining = remaining[:m.start()] + remaining[m.end():]
            break

    # --- Extract property type ---
    for keyword, ptype in PROPERTY_TYPES.items():
        pat = r"\b" + re.escape(keyword) + r"\b"
        m = re.search(pat, remaining)
        if m:
            result.property_type = ptype
            result.extracted_terms.append(f"Type: {ptype}")
            remaining = remaining[:m.start()] + remaining[m.end():]
            break

    # --- Extract boolean features ---
    feature_patterns = [
        (r"\b(?:furnished|fully\s*furnished)\b", "furnished", True),
        (r"\bunfurnished\b", "furnished", False),
        (r"\b(?:bills?\s*inc(?:luded)?|inc\s*bills?)\b", "bills_included", True),
        (r"\bparking\b", "parking", True),
        (r"\bgarden\b", "garden", True),
        (r"\b(?:near\s*(?:a\s*)?station|close\s*to\s*station|station\s*nearby)\b", "near_station", True),
    ]
    for pat, attr, val in feature_patterns:
        m = re.search(pat, remaining)
        if m:
            setattr(result, attr, val)
            label = attr.replace("_", " ").title()
            if not val and attr == "furnished":
                label = "Unfurnished"
            result.extracted_terms.append(label)
            remaining = remaining[:m.start()] + remaining[m.end():]

    # --- Extract area (check multi-word areas first) ---
    for area_name in sorted(UK_AREAS, key=len, reverse=True):
        if area_name in remaining:
            result.area = area_name.title()
            result.extracted_terms.append(f"Area: {result.area}")
            remaining = remaining.replace(area_name, "", 1)
            break

    # --- Extract city ---
    for city_name in UK_CITIES:
        pat = r"\b" + re.escape(city_name) + r"\b"
        m = re.search(pat, remaining)
        if m:
            result.city = city_name.title()
            result.extracted_terms.append(f"City: {result.city}")
            remaining = remaining[:m.start()] + remaining[m.end():]
            break

    # --- "in <location>" fallback for unrecognised places ---
    if not result.city and not result.area:
        m = re.search(r"\bin\s+([a-z][a-z\s]{1,30}?)(?:\s+under|\s+with|\s+near|$)", remaining)
        if m:
            loc = m.group(1).strip().title()
            result.city = loc
            result.extracted_terms.append(f"Location: {loc}")
            remaining = remaining[:m.start()] + remaining[m.end():]

    # --- Remaining text becomes a keyword search ---
    # Clean up leftover noise words
    noise = {"in", "a", "an", "the", "with", "and", "or", "for", "i", "want",
             "looking", "need", "find", "me", "please", "get", "show", "search",
             "property", "properties", "rental", "rent", "uk", "to", "that", "is",
             "are", "has", "have", "my", "some", "any", "good", "nice", "cheap",
             "affordable", "per", "month", "monthly", "pcm", "pw"}
    leftover = remaining.strip()
    leftover_words = [w for w in re.split(r"\s+", leftover) if w and w not in noise]
    if leftover_words:
        result.keyword = " ".join(leftover_words)

    return result


def score_property_relevance(prop: Property, parsed: ParsedQuery) -> float:
    """
    Score how relevant a property is to the parsed query (0.0 to 1.0).
    Used to rank results by AI relevance when a natural language query is used.
    """
    scores: list[float] = []
    weights: list[float] = []

    # Budget match (high weight)
    if parsed.max_price is not None:
        w = 0.30
        weights.append(w)
        if prop.price <= parsed.max_price:
            ratio = prop.price / parsed.max_price
            scores.append(w * (0.7 + 0.3 * ratio))  # Prefer closer to budget
        else:
            overshoot = (prop.price - parsed.max_price) / parsed.max_price
            scores.append(w * max(0, 1 - overshoot / 0.3))

    if parsed.min_price is not None:
        w = 0.10
        weights.append(w)
        scores.append(w * (1.0 if prop.price >= parsed.min_price else 0.3))

    # City match
    if parsed.city:
        w = 0.20
        weights.append(w)
        if parsed.city.lower() == prop.city.lower():
            scores.append(w * 1.0)
        elif parsed.city.lower() in prop.city.lower():
            scores.append(w * 0.7)
        else:
            scores.append(w * 0.0)

    # Area match
    if parsed.area:
        w = 0.15
        weights.append(w)
        if parsed.area.lower() in prop.area.lower():
            scores.append(w * 1.0)
        else:
            scores.append(w * 0.0)

    # Bedrooms match
    if parsed.bedrooms is not None:
        w = 0.15
        weights.append(w)
        if prop.bedrooms == parsed.bedrooms:
            scores.append(w * 1.0)
        elif abs(prop.bedrooms - parsed.bedrooms) == 1:
            scores.append(w * 0.5)
        else:
            scores.append(w * 0.0)

    # Property type
    if parsed.property_type:
        w = 0.10
        weights.append(w)
        if prop.property_type.lower() == parsed.property_type.lower():
            scores.append(w * 1.0)
        else:
            scores.append(w * 0.0)

    # Feature bonuses
    feature_weight = 0.05
    if parsed.furnished is not None:
        weights.append(feature_weight)
        scores.append(feature_weight * (1.0 if prop.furnished == parsed.furnished else 0.0))
    if parsed.bills_included is not None:
        weights.append(feature_weight)
        scores.append(feature_weight * (1.0 if prop.bills_included == parsed.bills_included else 0.0))
    if parsed.parking is not None:
        weights.append(feature_weight)
        scores.append(feature_weight * (1.0 if prop.parking == parsed.parking else 0.0))
    if parsed.garden is not None:
        weights.append(feature_weight)
        scores.append(feature_weight * (1.0 if prop.garden == parsed.garden else 0.0))
    if parsed.near_station:
        weights.append(feature_weight)
        close = prop.station_distance_mins is not None and prop.station_distance_mins <= 10
        scores.append(feature_weight * (1.0 if close else 0.0))

    total_weight = sum(weights)
    if total_weight == 0:
        return 0.5  # No criteria = neutral

    return round(sum(scores) / total_weight, 2)
