import time
import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from backend.app.database import SessionLocal
from backend.app.models.api_log import ApiLog
from backend.app.security.auth import decode_access_token


class SecurityAuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Record start time
        start_time = time.perf_counter()

        # Extract user identity if Authorization Bearer header is present
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_access_token(token)
            if payload and "sub" in payload:
                try:
                    user_id = int(payload["sub"])
                except ValueError:
                    user_id = None

        # Request metadata
        path = request.url.path
        method = request.method
        ip_address = request.client.host if request.client else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "Unknown")[:490]
        content_length = request.headers.get("content-length", 0)
        try:
            request_size = int(content_length)
        except ValueError:
            request_size = 0

        # Categorize event type
        event_type = "API_CALL"
        if "/auth" in path:
            event_type = "AUTH"
        elif "/payment" in path:
            event_type = "PAYMENT"
        elif "/admin" in path:
            event_type = "ADMIN"
        elif "/cart" in path:
            event_type = "CART"
        elif method == "GET":
            event_type = "READ"
        elif method in ("POST", "PUT", "DELETE", "PATCH"):
            event_type = "WRITE"

        # Process request
        try:
            response: Response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            # Latency in ms
            response_time_ms = (time.perf_counter() - start_time) * 1000.0

            # Don't log static files, health check probes or openapi/docs to reduce clutter
            if not (path.startswith("/docs") or path.startswith("/openapi.json") or path.startswith("/static") or path == "/health" or path.startswith("/api/realtime/ws")):
                try:
                    db = SessionLocal()
                    log_entry = ApiLog(
                        user_id=user_id,
                        endpoint=path,
                        method=method,
                        status_code=status_code,
                        timestamp=datetime.datetime.utcnow(),
                        response_time=round(response_time_ms, 2),
                        ip_address=ip_address,
                        user_agent=user_agent,
                        request_size=request_size,
                        event_type=event_type,
                    )
                    db.add(log_entry)
                    db.commit()
                    db.close()
                except Exception:
                    # Never crash the actual response if logging encounters an issue
                    pass

        return response
