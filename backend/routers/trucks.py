from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.models.models import FoodTruck, User
from backend.schemas.schemas import FoodTruckCreate, FoodTruckUpdate, FoodTruckOut
from backend.core.dependencies import get_current_admin

router = APIRouter(prefix="/api/trucks", tags=["trucks"])

@router.get("", response_model=List[FoodTruckOut])
def get_all_trucks(db: Session = Depends(get_db)):
    trucks = db.query(FoodTruck).all() # SQLAlchemy equivalent of SELECT * FROM food_trucks
    return trucks

@router.get("/{truck_id}", response_model=FoodTruckOut)
def get_truck(truck_id: int, db: Session = Depends(get_db)): #this is a FastAPI's dependency injection
    truck = db.query(FoodTruck).filter(FoodTruck.id == truck_id).first()   #equivalent of SELECT * FROM food_trucks WHERE id = ? LIMIT 1
    if not truck:
        raise HTTPException(status_code=404, detail='Truck not found')
    return truck

@router.post("", response_model=FoodTruckOut, status_code=201)
def create_truck(truck_in: FoodTruckCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    truck = FoodTruck(**truck_in.model_dump()) #converts the Pydantic schema to a plain dict, then ** unpacks it as keyword arguments into the FoodTruck constructor
    db.add(truck)
    db.commit()
    db.refresh(truck)
    return truck

@router.put("/{truck_id}", response_model=FoodTruckOut)
def update_truck(truck_id: int, truck_in: FoodTruckUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    truck = db.query(FoodTruck).filter(FoodTruck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    for field, value in truck_in.model_dump(exclude_unset=True).items(): #exclude_unset=True — on the update route, this only returns fields the user actually sent. So if they only send {"is_open": false}, you only update that one field instead of overwriting everything else with None
        setattr(truck, field, value)
    db.commit()
    db.refresh(truck)
    return truck

@router.delete("/{truck_id}", status_code=204)
def delete_truck(truck_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    truck = db.query(FoodTruck).filter(FoodTruck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    print(f"Deleting truck: {truck.id} - {truck.name}")
    db.delete(truck)
    db.commit()
    print("Delete committed")