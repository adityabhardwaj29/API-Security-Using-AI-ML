import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.database import init_db, SessionLocal
from backend.app.security.middleware import SecurityAuditMiddleware
from backend.app.security.auth import hash_password
from backend.app.models.user import User, UserRole
from backend.app.models.product import Product
from backend.app.models.api_log import ApiLog
from backend.app.graph.graph_builder import graph_builder
from backend.app.gnn.inference import gnn_engine
from backend.app.routes import (
    auth_router,
    users_router,
    products_router,
    cart_router,
    orders_router,
    payments_router,
    logs_router,
    threats_router,
    admin_router,
    realtime_router,
)


def seed_initial_data(db_session=None):
    """
    Seeds initial admin, demo user, rich Indian E-Commerce catalog products (4 categories with INR pricing),
    and initial flow graph telemetry.
    """
    db = db_session if db_session is not None else SessionLocal()
    should_close = db_session is None
    try:
        # 1. Seed Admin User
        admin_email = "admin@apisecurity.io"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Security Operations Admin",
                email=admin_email,
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN.value,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(admin)

        # 2. Seed Standard Demo Customer
        demo_email = "user@apisecurity.io"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                name="Priya Sharma",
                email=demo_email,
                password_hash=hash_password("User@123456"),
                role=UserRole.USER.value,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(user)

        # 3. Seed Realistic Indian E-Commerce Products (Fashion, Electronics, Home & Lifestyle, Beauty & Personal Care)
        if db.query(Product).count() == 0:
            sample_products = [
                # --- Fashion Category ---
                Product(
                    name="Classic Cotton Casual T-Shirt",
                    description="100% breathable organic combed cotton t-shirt with premium stitched crew neckline.",
                    price=499.0,
                    category="Fashion",
                    stock=120,
                    rating=4.6,
                    image_url="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Slim-Fit Stretch Denim Jeans",
                    description="Durable washed indigo blue denim jeans with flexible comfort stretch.",
                    price=1299.0,
                    category="Fashion",
                    stock=80,
                    rating=4.7,
                    image_url="https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Urban Streetwear Comfort Hoodie",
                    description="Fleece-lined heavyweight pull-over hoodie with kangaroo pocket and drawstring hood.",
                    price=1499.0,
                    category="Fashion",
                    stock=65,
                    rating=4.8,
                    image_url="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Breathable Pro Running Sneakers",
                    description="Lightweight shock-absorbing athletic running shoes with responsive memory foam sole.",
                    price=1999.0,
                    category="Fashion",
                    stock=50,
                    rating=4.9,
                    image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Classic Chronograph Analog Watch",
                    description="Water-resistant stainless steel wrist watch with genuine leather strap and mineral glass.",
                    price=2499.0,
                    category="Fashion",
                    stock=40,
                    rating=4.7,
                    image_url="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Travel Essential Canvas Backpack",
                    description="Spacious water-repellent multipurpose backpack with padded 15.6-inch laptop compartment.",
                    price=899.0,
                    category="Fashion",
                    stock=75,
                    rating=4.5,
                    image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Electronics Category ---
                Product(
                    name="True Wireless Stereo Earbuds",
                    description="Bluetooth 5.3 earbuds with active noise cancellation, environmental mic, and 36h playtime.",
                    price=899.0,
                    category="Electronics",
                    stock=150,
                    rating=4.6,
                    image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Smart Fitness Tracker Watch",
                    description="1.85-inch AMOLED curved display smartwatch with SpO2, 24/7 heart rate monitor, and IP68 rating.",
                    price=1499.0,
                    category="Electronics",
                    stock=90,
                    rating=4.7,
                    image_url="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="20,000mAh Fast Charging Power Bank",
                    description="22.5W Power Delivery multi-port external battery with LED power display and overcharge protection.",
                    price=1199.0,
                    category="Electronics",
                    stock=110,
                    rating=4.8,
                    image_url="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Studio Over-Ear Wireless Headphones",
                    description="Deep bass 40mm dynamic drivers with plush memory foam earcups and 50-hour battery life.",
                    price=1899.0,
                    category="Electronics",
                    stock=60,
                    rating=4.8,
                    image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="65W GaN Fast Wall Charger",
                    description="Triple-port USB-C/USB-A ultra-compact GaN fast charger compatible with laptops and smartphones.",
                    price=799.0,
                    category="Electronics",
                    stock=85,
                    rating=4.6,
                    image_url="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Home & Lifestyle Category ---
                Product(
                    name="Modern Ambient LED Desk Lamp",
                    description="Touch-controlled dimmable minimalist desk lamp with 3 color temperatures and flexible gooseneck.",
                    price=699.0,
                    category="Home & Lifestyle",
                    stock=70,
                    rating=4.5,
                    image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Stainless Steel Insulated Water Bottle",
                    description="Double-wall vacuum insulated 1000ml flask keeping beverages cold for 24h or hot for 12h.",
                    price=499.0,
                    category="Home & Lifestyle",
                    stock=130,
                    rating=4.8,
                    image_url="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Non-Slip Eco Yoga Mat (6mm)",
                    description="High-density anti-tear TPE exercise mat with alignment guide lines and carry strap.",
                    price=799.0,
                    category="Home & Lifestyle",
                    stock=95,
                    rating=4.7,
                    image_url="https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Aromatic Ceramic Diffuser & Essential Oils",
                    description="Ultrasonic cool mist aromatherapy diffuser with 7 ambient color lights and whisper quiet operation.",
                    price=999.0,
                    category="Home & Lifestyle",
                    stock=60,
                    rating=4.6,
                    image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Beauty & Personal Care Category ---
                Product(
                    name="Hydrating Vitamin C Face Serum",
                    description="Brightening anti-oxidant facial serum infused with Hyaluronic Acid and botanical extracts.",
                    price=599.0,
                    category="Beauty & Personal Care",
                    stock=140,
                    rating=4.7,
                    image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="All-in-One Beard & Hair Grooming Kit",
                    description="Cordless precision waterproof trimmer with self-sharpening titanium blades and 5 guide combs.",
                    price=1199.0,
                    category="Beauty & Personal Care",
                    stock=80,
                    rating=4.8,
                    image_url="https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Natural Aloe Vera Deep Moisturizer",
                    description="Soothing non-greasy organic daily face cream suitable for all skin types.",
                    price=349.0,
                    category="Beauty & Personal Care",
                    stock=160,
                    rating=4.6,
                    image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60",
                ),
            ]
            db.add_all(sample_products)

        db.commit()

        # Build initial flow graph
        graph_builder.build_flow_graph(db, limit=1000)

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        if should_close:
            db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables and Seeds
    init_db()
    seed_initial_data()
    # Check GNN state
    gnn_engine._load_if_available()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack Indian E-Commerce platform integrated with AI/ML behavioral API security, Isolation Forest, PyTorch GNN, XAI/SHAP, LLM Synthesis, and UPI payment pipeline.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit & Security Telemetry Middleware
app.add_middleware(SecurityAuditMiddleware)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(users_router, prefix=settings.API_V1_PREFIX)
app.include_router(products_router, prefix=settings.API_V1_PREFIX)
app.include_router(cart_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(payments_router, prefix=settings.API_V1_PREFIX)
app.include_router(logs_router, prefix=settings.API_V1_PREFIX)
app.include_router(threats_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(realtime_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "gnn_status": gnn_engine.status,
        "environment": settings.ENVIRONMENT,
        "currency": settings.CURRENCY,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_PREFIX,
        "currency": settings.CURRENCY,
    }
