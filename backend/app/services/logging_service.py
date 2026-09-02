from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import datetime
from backend.app.models.api_log import ApiLog
from backend.app.models.user import User


class LoggingService:
    """
    Handles API log retrieval, filtering, and statistical aggregations for admin analytics.
    """
    def get_logs(
        self,
        db: Session,
        user_id: Optional[int] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        event_type: Optional[str] = None,
        status_code: Optional[int] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ApiLog]:
        query = db.query(ApiLog)
        if user_id is not None:
            query = query.filter(ApiLog.user_id == user_id)
        if endpoint:
            query = query.filter(ApiLog.endpoint.contains(endpoint))
        if method:
            query = query.filter(ApiLog.method == method.upper())
        if event_type:
            query = query.filter(ApiLog.event_type == event_type.upper())
        if status_code is not None:
            query = query.filter(ApiLog.status_code == status_code)

        return query.order_by(desc(ApiLog.timestamp)).offset(offset).limit(limit).all()

    def get_endpoint_telemetry(self, db: Session) -> List[Dict[str, Any]]:
        """
        Aggregates request volumes, errors, average response times, and unique users per endpoint.
        """
        results = db.query(
            ApiLog.endpoint,
            func.count(ApiLog.id).label("requests"),
            func.avg(ApiLog.response_time).label("avg_latency"),
            func.count(func.distinct(ApiLog.user_id)).label("unique_users"),
        ).group_by(ApiLog.endpoint).order_by(desc("requests")).limit(20).all()

        telemetry = []
        for ep, reqs, lat, users in results:
            err_count = db.query(func.count(ApiLog.id)).filter(
                ApiLog.endpoint == ep,
                ApiLog.status_code >= 400
            ).scalar() or 0

            err_rate = round(err_count / reqs, 3) if reqs > 0 else 0.0
            risk_score = 0.1
            if "/payment" in ep:
                risk_score += 0.4
            elif "/admin" in ep:
                risk_score += 0.35
            if err_rate > 0.1:
                risk_score += 0.25

            telemetry.append({
                "endpoint": ep,
                "requests": reqs,
                "errors": err_count,
                "error_rate": err_rate,
                "avg_latency": round(float(lat or 40.0), 1),
                "unique_users": max(users, 1),
                "risk_score": min(round(risk_score, 2), 1.0),
            })
        return telemetry


logging_service = LoggingService()
