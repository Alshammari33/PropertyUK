"""AI recommendation endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import RecommendRequest, RecommendResponse
from app.services.ranking import rank_properties

router = APIRouter(tags=["Recommendations"])


@router.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    """Return top 20 ranked properties with explainable scores."""
    results = rank_properties(db, req)
    return RecommendResponse(results=results)
