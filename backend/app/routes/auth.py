from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import datetime
from backend.app.database import get_db
from backend.app.models.user import User, UserRole
from backend.app.models.security_event import SecurityEvent
from backend.app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from backend.app.schemas.user import UserResponse
from backend.app.security.auth import hash_password, verify_password, create_access_token
from backend.app.security.permissions import get_current_user
from backend.app.security.rate_limit import rate_limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "127.0.0.1"

    # Check duplicate email
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash password with bcrypt
    hashed = hash_password(req.password)
    user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hashed,
        role=UserRole.USER.value,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log security event
    sec_event = SecurityEvent(
        user_id=user.id,
        event_type="AUTH",
        severity="INFO",
        risk_score=0.05,
        message=f"User registered successfully: {user.email}",
        source_ip=ip,
        endpoint="/api/auth/register",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(sec_event)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
    )


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "127.0.0.1"

    # Rate limiting on login attempts (prevent credential stuffing)
    allowed, count, limit = rate_limiter.is_allowed(f"login_{ip}", custom_limit=20)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please wait 1 minute before retrying."
        )

    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        # Record failed auth event
        sec_event = SecurityEvent(
            user_id=user.id if user else None,
            event_type="AUTH",
            severity="MEDIUM" if count > 3 else "LOW",
            risk_score=0.35 if count > 3 else 0.15,
            message=f"Failed login attempt for: {req.email} from IP {ip}",
            source_ip=ip,
            endpoint="/api/auth/login",
            created_at=datetime.datetime.utcnow(),
        )
        db.add(sec_event)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Successful login
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    sec_event = SecurityEvent(
        user_id=user.id,
        event_type="AUTH",
        severity="INFO",
        risk_score=0.05,
        message=f"User logged in successfully: {user.email}",
        source_ip=ip,
        endpoint="/api/auth/login",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(sec_event)
    db.commit()

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
