"""
Seed script: reads properties.csv and inserts rows into Postgres.

Usage:
    cd backend
    python -m app.seed.seed_from_csv
"""

import csv
import os
import sys

# Ensure the backend directory is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.db import engine, SessionLocal, Base
from app.models import Property

CSV_PATH = os.path.join(os.path.dirname(__file__), "properties.csv")


def str_to_bool(val: str) -> bool:
    return val.strip().lower() in ("true", "1", "yes")


def maybe_int(val: str):
    val = val.strip()
    return int(val) if val else None


def maybe_float(val: str):
    val = val.strip()
    return float(val) if val else None


def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Property).count()
        if existing > 0:
            print(f"Database already has {existing} properties. Skipping seed.")
            return

        with open(CSV_PATH, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                prop = Property(
                    title=row["title"].strip(),
                    price=float(row["price"]),
                    area=row["area"].strip(),
                    city=row["city"].strip(),
                    region=row.get("region", "").strip() or None,
                    postcode=row.get("postcode", "").strip() or None,
                    bedrooms=int(row["bedrooms"]),
                    bathrooms=int(row["bathrooms"]),
                    property_type=row["property_type"].strip(),
                    furnished=str_to_bool(row["furnished"]),
                    bills_included=str_to_bool(row["bills_included"]),
                    parking=str_to_bool(row["parking"]),
                    garden=str_to_bool(row["garden"]),
                    nearest_station=row.get("nearest_station", "").strip() or None,
                    station_distance_mins=maybe_int(row.get("station_distance_mins", "")),
                    description=row.get("description", "").strip() or None,
                    image_url=row.get("image_url", "").strip() or None,
                    listing_url=row.get("listing_url", "").strip() or None,
                )
                db.add(prop)
                count += 1

            db.commit()
            print(f"Seeded {count} properties successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
