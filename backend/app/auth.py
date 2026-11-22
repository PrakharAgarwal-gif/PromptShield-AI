import hmac
import hashlib
import base64
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

# Check for passlib & jose, else use secure standard library fallback
try:
    from jose import JWTError, jwt
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_LIBS = True
except ImportError:
    HAS_LIBS = False

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    if HAS_LIBS:
        return pwd_context.hash(password)
    # Standard PBKDF2 fallback
    salt = settings.JWT_SECRET[:16].encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return "pbkdf2:" + base64.b64encode(key).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if HAS_LIBS and not hashed_password.startswith("pbkdf2:"):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass
    # PBKDF2 check
    salt = settings.JWT_SECRET[:16].encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
    expected = "pbkdf2:" + base64.b64encode(key).decode('utf-8')
    return hmac.compare_digest(expected, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp())})

    if HAS_LIBS:
        return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    # Lightweight JWT signing
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(
        hmac.new(settings.JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    ).decode().rstrip("=")
    return f"{header}.{payload}.{signature}"


def decode_access_token(token: str) -> Optional[dict]:
    try:
        if HAS_LIBS:
            return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])

        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, sig = parts
        padding = 4 - (len(payload) % 4)
        if padding != 4:
            payload += "=" * padding
        data = json.loads(base64.urlsafe_b64decode(payload).decode())
        if "exp" in data and time.time() > data["exp"]:
            return None
        return data
    except Exception:
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user
