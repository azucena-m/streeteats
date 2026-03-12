from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./streeteats.db")

engine = create_engine( #database connection
    DATABASE_URL,
    connect_args={"check_same_thread": False}  #SQLite only needs this
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  #factory that createsindividual database sessions

Base = declarative_base()  #every model(table) created will inherit from this

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()