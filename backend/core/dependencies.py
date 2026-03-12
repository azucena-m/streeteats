from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.security import decode_access_token
from backend.models.models import User

# OAuth2PasswordBearer tells FastAPI to look for a token in the request's Authorization header in the format
# Bearer <token>. It handles all the header parsing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
)  -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=201, detail="User not found")
    
    return user

#get_current_admin builds on top of get_current_user
def get_current_admin(current_user: User = Depends(get_current_user)) -> User: #Any route that needs a logged in user adds Depends(get_current_user)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user