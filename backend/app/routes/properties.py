"""Property search and detail endpoints with AI-enhanced smart search."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db import get_db
from app.models import Property
from app.schemas import (
    PropertyOut, PropertyListResponse,
    SmartSearchResponse, ScoredPropertyItem, ParsedFilter,
)
from app.services.ai_search import parse_natural_query, score_property_relevance

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("", response_model=PropertyListResponse)
def list_properties(
    q: Optional[str] = None,
    city: Optional[str] = None,
    area: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    property_type: Optional[str] = None,
    furnished: Optional[bool] = None,
    bills_included: Optional[bool] = None,
    parking: Optional[bool] = None,
    sort: Optional[str] = Query(None, description="price_asc or price_desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search and filter properties with pagination."""
    query = db.query(Property)

    # Keyword search across title, area, city, description
    if q:
        pattern = f"%{q}%"
        query = query.filter(
            or_(
                Property.title.ilike(pattern),
                Property.area.ilike(pattern),
                Property.city.ilike(pattern),
                Property.description.ilike(pattern),
            )
        )

    if city:
        query = query.filter(Property.city.ilike(f"%{city}%"))
    if area:
        query = query.filter(Property.area.ilike(f"%{area}%"))
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if bedrooms is not None:
        query = query.filter(Property.bedrooms == bedrooms)
    if property_type:
        query = query.filter(Property.property_type.ilike(property_type))
    if furnished is not None:
        query = query.filter(Property.furnished == furnished)
    if bills_included is not None:
        query = query.filter(Property.bills_included == bills_included)
    if parking is not None:
        query = query.filter(Property.parking == parking)

    total = query.count()

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Property.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Property.price.desc())
    else:
        query = query.order_by(Property.id.asc())

    items = query.offset(skip).limit(limit).all()

    return PropertyListResponse(
        items=[PropertyOut.model_validate(p) for p in items],
        total=total,
    )


@router.get("/smart-search", response_model=SmartSearchResponse)
def smart_search(
    q: str = Query(..., description="Natural language query, e.g. '2 bed flat in Manchester under £1200'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    AI-enhanced search: parses natural language into structured filters,
    fetches matching properties, and ranks them by relevance score.
    """
    parsed = parse_natural_query(q)

    # Build DB query from parsed filters (soft filtering — allow broader results)
    query = db.query(Property)

    if parsed.city:
        query = query.filter(Property.city.ilike(f"%{parsed.city}%"))
    if parsed.area:
        query = query.filter(Property.area.ilike(f"%{parsed.area}%"))
    if parsed.max_price is not None:
        # Allow 20% over to show "close" options
        query = query.filter(Property.price <= parsed.max_price * 1.2)
    if parsed.min_price is not None:
        query = query.filter(Property.price >= parsed.min_price * 0.8)
    if parsed.property_type:
        query = query.filter(Property.property_type.ilike(parsed.property_type))

    # If only keyword remains and no structured filters matched, do text search
    if parsed.keyword and not parsed.city and not parsed.area:
        pattern = f"%{parsed.keyword}%"
        query = query.filter(
            or_(
                Property.title.ilike(pattern),
                Property.area.ilike(pattern),
                Property.city.ilike(pattern),
                Property.description.ilike(pattern),
            )
        )

    all_props = query.all()

    # Score every property for relevance
    scored = []
    for prop in all_props:
        relevance = score_property_relevance(prop, parsed)
        scored.append((prop, relevance))

    # Sort by relevance descending
    scored.sort(key=lambda x: x[1], reverse=True)
    total = len(scored)

    # Paginate
    page = scored[skip : skip + limit]

    return SmartSearchResponse(
        items=[
            ScoredPropertyItem(
                property=PropertyOut.model_validate(p),
                relevance=rel,
            )
            for p, rel in page
        ],
        total=total,
        parsed=ParsedFilter(
            keyword=parsed.keyword,
            city=parsed.city,
            area=parsed.area,
            min_price=parsed.min_price,
            max_price=parsed.max_price,
            bedrooms=parsed.bedrooms,
            property_type=parsed.property_type,
            furnished=parsed.furnished,
            bills_included=parsed.bills_included,
            parking=parsed.parking,
            near_station=parsed.near_station,
            garden=parsed.garden,
            extracted_terms=parsed.extracted_terms,
        ),
    )


@router.get("/{property_id}", response_model=PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get a single property by ID."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return PropertyOut.model_validate(prop)
