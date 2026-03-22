"""SQLAlchemy ORM models."""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text

from app.db import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    price = Column(Float, nullable=False)
    area = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    region = Column(String(100), nullable=True)
    postcode = Column(String(10), nullable=True)
    bedrooms = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    property_type = Column(String(50), nullable=False)
    furnished = Column(Boolean, default=False)
    bills_included = Column(Boolean, default=False)
    parking = Column(Boolean, default=False)
    garden = Column(Boolean, default=False)
    nearest_station = Column(String(100), nullable=True)
    station_distance_mins = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    listing_url = Column(String(500), nullable=True)
