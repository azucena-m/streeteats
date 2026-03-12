from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class FoodTruckBase(BaseModel):
    name: str
    description: Optional[str] = None
    cuisine: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    is_open: bool = True    
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None

class FoodTruckCreate(FoodTruckBase):
    # Inherits everything from Base
    # Used when someone POSTs a new truck
    pass 

class FoodTruckUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    is_open: Optional[bool] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None

class FoodTruckOut(FoodTruckBase):
    # Used in responses = includes db-generated fields
    id: int
    created_at: datetime

    class Config:
        from_attributes = True #lets pydantic read SQLAlchemy objects


# FoodTruckBase       ← shared fields (name, cuisine, lat, lng...)
#     ├── FoodTruckCreate   ← for POST requests (no id, no created_at)
#     └── FoodTruckOut      ← for responses (adds id + created_at)
# FoodTruckUpdate     ← for PUT requests (everything optional)

class UserCreate(BaseModel):
    email: EmailStr # special pydantic type that automatically validates the email format
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class FavoriteOut(BaseModel):
    id: int 
    user_id: int
    truck_id: int
    created_at: datetime
    truck: FoodTruckOut #this tells pydantic to also serialize the related truck object when returning a favorite, instead of getting an id back you get the full truck details

    class Config:
        from_attributes = True