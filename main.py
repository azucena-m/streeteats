from fastapi import FastAPI
from fastapi.security import HTTPBearer
from backend.core.database import engine
from backend.models.models import Base
from backend.routers import trucks, auth, favorites

# This line reads all the models and creates the tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='StreetEats API',
    swagger_ui_parameters={"persistAuthorization": True}
)

security = HTTPBearer

app.include_router(trucks.router)
app.include_router(auth.router)
app.include_router(favorites.router)

@app.get("/")
def root():
    return {"message": "StreetEats API is running"}