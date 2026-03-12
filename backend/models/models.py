from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.core.database import Base

class FoodTruck(Base):
    __tablename__ = "food_trucks"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    description  = Column(Text, nullable=True)
    cuisine      = Column(String, nullable=False)
    latitude     = Column(Float, nullable=False)
    longitude    = Column(Float, nullable=False)
    address      = Column(String, nullable=True)
    is_open      = Column(Boolean, default=True)
    opening_time = Column(String, nullable=True)
    closing_time = Column(String, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    favorites = relationship("Favorite", back_populates="truck")

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, nullable=False, unique=True, index=True)
    username        = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_admin        = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    favorites = relationship("Favorite", back_populates="user")

class Favorite(Base):
    __tablename__ = "favorites"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    truck_id   = Column(Integer, ForeignKey("food_trucks.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user    = relationship("User", back_populates="favorites")
    truck   = relationship("FoodTruck", back_populates="favorites")