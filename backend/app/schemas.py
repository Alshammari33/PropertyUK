"""Pydantic schemas for request/response validation."""

from typing import Optional
from pydantic import BaseModel


# ---------- Property ----------

class PropertyOut(BaseModel):
    id: int
    title: str
    price: float
    area: str
    city: str
    region: Optional[str] = None
    postcode: Optional[str] = None
    bedrooms: int
    bathrooms: int
    property_type: str
    furnished: bool
    bills_included: bool
    parking: bool
    garden: bool
    nearest_station: Optional[str] = None
    station_distance_mins: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    listing_url: Optional[str] = None

    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    items: list[PropertyOut]
    total: int


# ---------- AI Smart Search ----------

class ParsedFilter(BaseModel):
    """What the AI extracted from the natural language query."""
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
    extracted_terms: list[str] = []


class ScoredPropertyItem(BaseModel):
    """A property with an AI relevance score."""
    property: PropertyOut
    relevance: float


class SmartSearchResponse(BaseModel):
    """Response from AI-powered smart search."""
    items: list[ScoredPropertyItem]
    total: int
    parsed: ParsedFilter


# ---------- Recommendation ----------

class Priorities(BaseModel):
    near_station: bool = False
    furnished: bool = False
    bills_included: bool = False
    parking: bool = False
    garden: bool = False


class RecommendRequest(BaseModel):
    budget_max: float
    preferred_areas: list[str] = []
    bedrooms: int = 1
    property_type: str = ""
    priorities: Priorities = Priorities()


class ScoredProperty(BaseModel):
    property: PropertyOut
    score: float
    reasons: list[str]


class RecommendResponse(BaseModel):
    results: list[ScoredProperty]
