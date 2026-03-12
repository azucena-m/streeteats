from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.models import Favorite, FoodTruck, User
from backend.schemas.schemas import FavoriteOut

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.get("", response_model=List[FavoriteOut])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    return favorites

@router.post("/{truck_id}", status_code=201)
def add_favorite(
    truck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # check truck exists
    truck = db.query(FoodTruck).filter(FoodTruck.id == truck_id).first()
    if not truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    # check not already favorited using direct column comparison
    existing = db.execute(
        text("SELECT id FROM favorites WHERE user_id = :user_id AND truck_id = :truck_id"),
        {"user_id": current_user.id, "truck_id": truck_id}
    ).first()

    print(f"User: {current_user.id} Truck: {truck_id} Existing: {existing}")
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    favorite = Favorite(user_id=current_user.id, truck_id=truck_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return {"message": f"Added {truck.name} to favorites"}

@router.delete("/{truck_id}", status_code=204)
def remove_favorite(
    truck_id: int,
    db: Session = Depends(get_db),
    current_user: Session = Depends(get_current_user)
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.truck_id == truck_id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(favorite)
    db.commit()
    db.close()