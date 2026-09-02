from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.api_log import ApiLog
from backend.app.schemas.log import ApiLogResponse
from backend.app.security.permissions import require_admin
from backend.app.services.logging_service import logging_service

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("", response_model=List[ApiLogResponse])
def get_logs(
    user_id: Optional[int] = Query(None),
    endpoint: Optional[str] = Query(None),
    method: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    status_code: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    return logging_service.get_logs(
        db=db,
        user_id=user_id,
        endpoint=endpoint,
        method=method,
        event_type=event_type,
        status_code=status_code,
        limit=limit,
        offset=offset
    )
