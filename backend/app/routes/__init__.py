from backend.app.routes.auth import router as auth_router
from backend.app.routes.users import router as users_router
from backend.app.routes.products import router as products_router
from backend.app.routes.cart import router as cart_router
from backend.app.routes.orders import router as orders_router
from backend.app.routes.payments import router as payments_router
from backend.app.routes.logs import router as logs_router
from backend.app.routes.threats import router as threats_router
from backend.app.routes.admin import router as admin_router
from backend.app.routes.realtime import router as realtime_router

__all__ = [
    "auth_router",
    "users_router",
    "products_router",
    "cart_router",
    "orders_router",
    "payments_router",
    "logs_router",
    "threats_router",
    "admin_router",
    "realtime_router",
]
