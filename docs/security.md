# API Security & Threat Mitigation Framework

## 1. Zero-Trust API Interception
All inbound requests pass through `SecurityMiddleware` in FastAPI:
- Intercepts method, path, headers, client IP, payload size, and JWT claims.
- Captures microsecond execution latency and HTTP status code.
- Enforces rate limiting per IP / session token.

## 2. Threat Classification Matrix
| Threat Category | Anomaly Trigger | Severity | Action |
|---|---|---|---|
| `HIGH_RATE_PAYMENT_ANOMALY` | Payment velocity > 5 req / window | HIGH / CRITICAL | Step-up challenge or payment hold |
| `UNAUTHORIZED_ADMIN_PROBE` | Non-admin accessing `/admin/*` routes | HIGH | 403 Forbidden + SOC alert |
| `BRUTE_FORCE_AUTHENTICATION_ATTEMPT` | Repeated 401s on `/auth/login` | HIGH | Exponential rate limit + challenge |
| `UNUSUAL_API_WORKFLOW_BYPASS` | Sequence skip on graph transition | HIGH | Security challenge |
| `HIGH_FREQUENCY_TRAFFIC_FLOOD` | General request velocity > 60 RPM | MEDIUM / HIGH | Token bucket rate limit |

## 3. Human-in-the-Loop SOC Mitigation
Admin SOC analysts can review live threat alerts and execute:
- **Acknowledge**: Acknowledges incident without blocking traffic.
- **Mitigate**: Enforces strict rate limiting, invalidates active user sessions, and blocks suspicious transitions.
- **False Positive**: Marks event as benign to calibrate detection thresholds.
