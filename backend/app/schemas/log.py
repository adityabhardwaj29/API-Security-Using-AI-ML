from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ApiLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: int
    timestamp: datetime
    response_time: float
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_size: int
    event_type: str
