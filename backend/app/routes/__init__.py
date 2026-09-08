from backend.app.routes.auth import router as auth_router
from backend.app.routes.users import router as users_router
from backend.app.routes.products import router as products_router
from backend.app.routes.cart import router as cart_router
from backend.app.routes.wishlist import router as wishlist_router
from backend.app.routes.addresses import router as addresses_router
from backend.app.routes.coupons import router as coupons_router
from backend.app.routes.reviews import router as reviews_router
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
    "wishlist_router",
    "addresses_router",
    "coupons_router",
    "reviews_router",
    "orders_router",
    "payments_router",
    "logs_router",
    "threats_router",
    "admin_router",
    "realtime_router",
]
