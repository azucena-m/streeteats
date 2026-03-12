import sys 
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.database import SessionLocal, engine
from backend.core.security import hash_password
from backend.models.models import Base, User, FoodTruck

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Create admin user
        existing_admin = db.query(User).filter(User.email == "admin@streeteats.com").first()
        if not existing_admin:
            admin = User(
                email="admin@streeteats.com",
                username="admin",
                hashed_password=hash_password("admin123"),
                is_admin=True
            )
            db.add(admin)
            print("Admin user created")
        else:
            print("Admin user already exists")

        # Create sample trucks
        if db.query(FoodTruck).count() == 0:
            trucks = [
                FoodTruck(
                    name="Smoky Joe's BBQ",
                    description="Slow smoked brisket and ribs",
                    cuisine="BBQ",
                    latitude=29.7604,
                    longitude=-95.3698,
                    address="Downtown Houston TX",
                    is_open=True,
                    opening_time="11:00",
                    closing_time="20:00"
                ),
                FoodTruck(
                    name="Taco Loco",
                    description="Authentic street tacos made fresh daily",
                    cuisine="Mexican",
                    latitude=29.7550,
                    longitude=-95.3650,
                    address="Midtown Houston TX",
                    is_open=True,
                    opening_time="10:00",
                    closing_time="22:00"
                ),
                FoodTruck(
                    name="Seoul Food",
                    description="Korean BBQ tacos and bibimbap bowls",
                    cuisine="Korean",
                    latitude=29.7490,
                    longitude=-95.3750,
                    address="Montrose Houston TX",
                    is_open=False,
                    opening_time="11:30",
                    closing_time="21:00"
                ),
            ]
            for truck in trucks:
                db.add(truck)
            print(f"{len(trucks)} trucks seeded")
        else:
            print("Trucks already exist, skipping")

        db.commit()
        print("Database ready!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()