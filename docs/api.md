# API Reference Documentation

## Authentication & Users
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token.
- `GET /api/auth/me` — Retrieve current authenticated session identity.
- `GET /api/users/profile` — Get user profile details.
- `GET /api/users/security-status` — Retrieve client security health & event summary.

## Products & Cart
- `GET /api/products` — List security products with optional search and category filters.
- `GET /api/products/{id}` — Get single product details.
- `POST /api/products` — Create new product (Admin only).
- `GET /api/cart` — View current user shopping cart items and subtotal.
- `POST /api/cart` — Add product to cart with quantity.
- `DELETE /api/cart/{id}` — Remove item from cart.
- `DELETE /api/cart` — Clear all items in cart.

## Payments & Security Verification
- `POST /api/payments` — Execute demo payment through behavioral risk engine.
- `POST /api/payments/verify` — Step-up identity challenge verification endpoint.
- `GET /api/payments/history` — List user transaction history with risk scores.

## Security Telemetry & Threats
- `GET /api/logs` — Query filtered audit logs (Admin only).
- `GET /api/threats` — List active/resolved threat incidents (Admin only).
- `GET /api/threats/{id}` — Retrieve full threat details with XAI attributions & LLM analysis.
- `POST /api/threats/{id}/action` — Apply SOC action (`ACKNOWLEDGE`, `MITIGATE`, `FALSE_POSITIVE`).

## Admin Operations Center
- `GET /api/admin/stats` — Retrieve SOC overview metrics, traffic trends, and risk distribution.
- `GET /api/admin/graph` — Retrieve directed API Flow Graph structure (nodes & edges).
- `GET /api/admin/telemetry` — Endpoint latency, error rate, and request volume table.
- `GET /api/admin/users` — List users with aggregated threat counts.
- `GET /api/admin/users/{id}/investigate` — Chronological behavioral timeline reconstruction.
- `GET /api/admin/models/evaluate` — Execute scientific model evaluation benchmark.
- `POST /api/admin/models/train-gnn` — Train PyTorch GNN on current flow graph.
- `POST /api/admin/simulate` — Trigger synthetic security attack scenario.

## Real-Time Streaming
- `WS /api/realtime/ws` — WebSocket real-time incident and telemetry stream.
- `GET /api/realtime/sse` — Server-Sent Events fallback.
