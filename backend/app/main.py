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
from backend.app.models.category import Category
from backend.app.models.product import Product
from backend.app.models.coupon import Coupon
from backend.app.models.address import Address
from backend.app.models.review import ProductReview
from backend.app.models.api_log import ApiLog
from backend.app.graph.graph_builder import graph_builder
from backend.app.gnn.inference import gnn_engine
from backend.app.routes import (
    auth_router,
    users_router,
    products_router,
    cart_router,
    wishlist_router,
    addresses_router,
    coupons_router,
    reviews_router,
    orders_router,
    payments_router,
    logs_router,
    threats_router,
    admin_router,
    realtime_router,
)


def seed_initial_data(db_session=None):
    """
    Seeds initial admin, demo user, categories, coupons, verified reviews, demo addresses,
    rich Indian E-Commerce catalog products (with INR pricing), and flow graph telemetry.
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
                phone="+91 98765 43210",
                created_at=datetime.datetime.utcnow(),
            )
            db.add(user)
        db.commit()

        # 3. Seed Default Address for Demo Customer
        if user and db.query(Address).filter(Address.user_id == user.id).count() == 0:
            addr = Address(
                user_id=user.id,
                full_name="Priya Sharma",
                phone="+91 98765 43210",
                address_line="Flat 402, Lotus Heights, Outer Ring Road, Bellandur",
                city="Bengaluru",
                state="Karnataka",
                postal_code="560103",
                country="India",
                is_default=True,
            )
            db.add(addr)
            db.commit()

        # 4. Seed Categories
        if db.query(Category).count() == 0:
            cats = [
                Category(name="Fashion", slug="fashion", description="Ethnic & Western Wear, Footwear, Accessories", icon="Shirt"),
                Category(name="Electronics", slug="electronics", description="Gadgets, TWS Audio, Smartwatches & Accessories", icon="Smartphone"),
                Category(name="Home & Lifestyle", slug="home-lifestyle", description="Decor, Kitchen, Aromatherapy & Bedding", icon="Home"),
                Category(name="Beauty & Personal Care", slug="beauty-personal-care", description="Skincare, Fragrances, Ayurvedic Wellness", icon="Sparkles"),
                Category(name="Footwear", slug="footwear", description="Sneakers, Traditional Juttis, Running Shoes", icon="Footprints"),
                Category(name="Grocery & Gourmet", slug="grocery", description="Organic Spices, Darjeeling Tea, Roasted Dry Fruits", icon="ShoppingBag"),
            ]
            db.add_all(cats)
            db.commit()

        # 5. Seed Coupons
        if db.query(Coupon).count() == 0:
            coupons = [
                Coupon(
                    code="WELCOME50",
                    description="50% Off up to ₹200 on your first purchase",
                    discount_type="PERCENTAGE",
                    discount_value=50.0,
                    min_order_value=299.0,
                    max_discount=200.0,
                    is_active=True,
                ),
                Coupon(
                    code="FESTIVE200",
                    description="Flat ₹200 Off on orders above ₹999",
                    discount_type="FLAT",
                    discount_value=200.0,
                    min_order_value=999.0,
                    is_active=True,
                ),
                Coupon(
                    code="SUPERSEC10",
                    description="10% Instant Discount on all AI Security Demo orders",
                    discount_type="PERCENTAGE",
                    discount_value=10.0,
                    min_order_value=499.0,
                    max_discount=500.0,
                    is_active=True,
                ),
                Coupon(
                    code="FREESHIP",
                    description="Free Express Shipping coupon on all orders",
                    discount_type="FLAT",
                    discount_value=50.0,
                    min_order_value=199.0,
                    is_active=True,
                ),
            ]
            db.add_all(coupons)
            db.commit()

        # 6. Seed Indian E-Commerce Products (18 items)
        if db.query(Product).count() == 0:
            products = [
                # --- Fashion Category ---
                Product(
                    name="Pure Cotton Regular Fit Casual Shirt",
                    brand="FabIndia",
                    description="100% breathable organic cotton shirt with mandarin collar, ideal for Indian summer and smart casual occasions.",
                    specifications="Material: 100% Cotton | Fit: Regular | Sleeve: Full | Collar: Mandarin",
                    price=799.0,
                    original_price=1299.0,
                    category="Fashion",
                    stock=120,
                    rating=4.6,
                    review_count=38,
                    image_url="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Handcrafted Banarasi Silk Saree with Zari Border",
                    brand="Varanasi Weaves",
                    description="Authentic Banarasi woven silk saree adorned with intricate golden zari floral motifs, perfect for festive weddings.",
                    specifications="Fabric: Pure Silk | Length: 5.5m + 0.8m Blouse Piece | Weave: Jacquard Kadwa",
                    price=2999.0,
                    original_price=4999.0,
                    category="Fashion",
                    stock=45,
                    rating=4.9,
                    review_count=52,
                    image_url="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Embroidered Rayon Anarkali Kurta Set",
                    brand="Biba",
                    description="Flared floor-length Anarkali kurta accompanied by matching pants and a lightweight chiffon dupatta.",
                    specifications="Fabric: Rayon Slub | Work: Thread Embroidery | Includes: Kurta, Pant, Dupatta",
                    price=1499.0,
                    original_price=2499.0,
                    category="Fashion",
                    stock=70,
                    rating=4.7,
                    review_count=29,
                    image_url="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Slim-Fit Washed Indigo Stretch Denim Jeans",
                    brand="Spykar",
                    description="Durable washed indigo blue denim jeans with flexible comfort stretch and signature 5-pocket styling.",
                    specifications="Material: 98% Cotton 2% Elastane | Fit: Slim | Wash: Dark Enzyme Wash",
                    price=1299.0,
                    original_price=1999.0,
                    category="Fashion",
                    stock=80,
                    rating=4.7,
                    review_count=41,
                    image_url="https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Classic Chronograph Analog Watch with Leather Strap",
                    brand="Titan",
                    description="Water-resistant stainless steel wrist watch with multi-function sub-dials, mineral glass, and genuine brown leather strap.",
                    specifications="Movement: Quartz Chronograph | Case: Stainless Steel | Water Resistance: 50M",
                    price=2499.0,
                    original_price=3995.0,
                    category="Fashion",
                    stock=40,
                    rating=4.8,
                    review_count=64,
                    image_url="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Travel Essential Waterproof Laptop Backpack (30L)",
                    brand="Wildcraft",
                    description="Spacious water-repellent multipurpose backpack with padded 15.6-inch laptop sleeve and ergonomic airflow back support.",
                    specifications="Capacity: 30 Liters | Material: Polyamide Ripstop | Compartments: 3 Main + Rain Cover",
                    price=899.0,
                    original_price=1499.0,
                    category="Fashion",
                    stock=75,
                    rating=4.5,
                    review_count=19,
                    image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Electronics Category ---
                Product(
                    name="Active Noise Cancelling True Wireless Earbuds",
                    brand="boAt",
                    description="Bluetooth 5.3 earbuds with 32dB active noise cancellation, dual-mic AI beamforming, and 42-hour combined battery backup.",
                    specifications="Driver: 11mm Dynamic | ANC: Up to 32dB | Latency: 50ms Beast Mode | IPX5",
                    price=1299.0,
                    original_price=2999.0,
                    category="Electronics",
                    stock=150,
                    rating=4.6,
                    review_count=112,
                    image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="1.96-inch AMOLED Curved Display Smartwatch",
                    brand="Noise",
                    description="Vibrant always-on AMOLED curved smartwatch with Bluetooth calling, SpO2 sensor, 100+ sports modes, and metallic frame.",
                    specifications="Display: 1.96'' AMOLED (410x502) | Battery: 7 Days | Sensors: Heart Rate, SpO2, Sleep",
                    price=1899.0,
                    original_price=3499.0,
                    category="Electronics",
                    stock=90,
                    rating=4.7,
                    review_count=87,
                    image_url="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="20,000mAh 22.5W Fast Charging Power Bank",
                    brand="Mi",
                    description="Dual USB-A and Type-C PD 3.0 ultra-compact power bank capable of rapid 22.5W two-way fast charging for smartphones.",
                    specifications="Capacity: 20000mAh | Output: 22.5W Max Type-C PD | Protection: 12-Layer Circuit",
                    price=1299.0,
                    original_price=1999.0,
                    category="Electronics",
                    stock=110,
                    rating=4.8,
                    review_count=94,
                    image_url="https://images.unsplash.com/photo-1609592424364-7c222ff4b9ca?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="20W Deep Bass Portable Bluetooth Speaker",
                    brand="JBL",
                    description="Rugged IPX7 waterproof cylindrical speaker with dual passive bass radiators, party sync, and 12-hour continuous playtime.",
                    specifications="Output: 20W RMS | Connectivity: Bluetooth 5.1 | Battery: 12 Hours | IPX7 Waterproof",
                    price=2499.0,
                    original_price=3999.0,
                    category="Electronics",
                    stock=60,
                    rating=4.9,
                    review_count=48,
                    image_url="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Home & Lifestyle Category ---
                Product(
                    name="Handcrafted Brass Diya & Bell Pooja Gift Set",
                    brand="Pooja Ghar",
                    description="Traditional high-grade brass handcrafted peacock oil lamp and prayer bell set with antique golden polish.",
                    specifications="Material: 100% Solid Brass | Weight: 650g | Finish: Antique Lacquered Gold",
                    price=699.0,
                    original_price=1199.0,
                    category="Home & Lifestyle",
                    stock=85,
                    rating=4.8,
                    review_count=33,
                    image_url="https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="100% Cotton 300 TC Double Bedsheet with 2 Pillow Covers",
                    brand="Bombay Dyeing",
                    description="Luxurious sateen weave breathable pure cotton king-size double bedsheet with elegant floral jaipuri print.",
                    specifications="Thread Count: 300 TC | Size: 274 cm x 274 cm | Includes: 1 Bedsheet, 2 Pillow Covers",
                    price=999.0,
                    original_price=1899.0,
                    category="Home & Lifestyle",
                    stock=70,
                    rating=4.6,
                    review_count=27,
                    image_url="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Ceramic Essential Oil Diffuser with Lavender & Sandalwood Oils",
                    brand="Phool",
                    description="Hand-carved stoneware aroma burner with tealight holder and 2 bottles of pure distilled natural Indian essential oils.",
                    specifications="Material: Glazed Ceramic | Oils Included: 10ml Lavender + 10ml Mysore Sandalwood",
                    price=499.0,
                    original_price=899.0,
                    category="Home & Lifestyle",
                    stock=95,
                    rating=4.7,
                    review_count=21,
                    image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Beauty & Personal Care Category ---
                Product(
                    name="Pure Kumkumadi Ayurvedic Radiance Face Oil (30ml)",
                    brand="Kama Ayurveda",
                    description="Ancient Ayurvedic formula with Kashmiri saffron, lotus extracts, and 16 precious herbs for radiant glowing skin.",
                    specifications="Volume: 30ml | Ingredients: Saffron, Sandalwood, Licorice | Skin Type: All Skin Types",
                    price=899.0,
                    original_price=1599.0,
                    category="Beauty & Personal Care",
                    stock=65,
                    rating=4.8,
                    review_count=76,
                    image_url="https://images.unsplash.com/photo-1608248597359-3221c97a5b3d?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Bhringraj Herbal Anti-Hairfall Ayurvedic Hair Oil (200ml)",
                    brand="Forest Essentials",
                    description="Traditional cold-pressed sesame oil infused with fresh Bhringraj, Amla, and Shikakai to nourish hair follicles.",
                    specifications="Volume: 200ml | Key Actives: Bhringraj, Brahmi, Amla | 100% Natural Cold-Pressed",
                    price=499.0,
                    original_price=799.0,
                    category="Beauty & Personal Care",
                    stock=120,
                    rating=4.7,
                    review_count=58,
                    image_url="https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="Natural Sandalwood & Turmeric Ubtan Glowing Face Mask (100g)",
                    brand="Mamaearth",
                    description="Gentle exfoliating clarifying clay pack with Haldi and Chandan to remove tan and restore natural skin brightness.",
                    specifications="Weight: 100g | Dermatologically Tested | Sulfate & Paraben Free",
                    price=349.0,
                    original_price=499.0,
                    category="Beauty & Personal Care",
                    stock=140,
                    rating=4.6,
                    review_count=43,
                    image_url="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=60",
                ),

                # --- Footwear & Grocery ---
                Product(
                    name="Handcrafted Pure Leather Royal Kolhapuri Chappal",
                    brand="Heritage Crafts",
                    description="Authentic vegetable-tanned handcrafted Maharashtrian Kolhapuri sandals with traditional braiding and cushioned base.",
                    specifications="Material: Genuine Buffalo Leather | Sole: Leather | Style: Slip-On Toe-Loop",
                    price=999.0,
                    original_price=1699.0,
                    category="Footwear",
                    stock=50,
                    rating=4.8,
                    review_count=31,
                    image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
                ),
                Product(
                    name="First Flush Organic Single-Estate Darjeeling Tea (250g Tin)",
                    brand="Makaibari",
                    description="Directly sourced whole-leaf aromatic first-flush black tea from the Himalayan slopes of Darjeeling.",
                    specifications="Weight: 250g | Grade: FTGFOP1 | Tasting Notes: Floral Muscatel & Honey",
                    price=649.0,
                    original_price=999.0,
                    category="Grocery & Gourmet",
                    stock=80,
                    rating=4.9,
                    review_count=39,
                    image_url="https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
                ),
            ]
            db.add_all(products)
            db.commit()

            # Seed verified reviews
            all_prods = db.query(Product).limit(5).all()
            for p in all_prods:
                r1 = ProductReview(
                    product_id=p.id,
                    user_id=user.id if user else 1,
                    user_name="Priya Sharma",
                    rating=5.0,
                    title="Exceptional quality & fast delivery!",
                    comment=f"Loved this {p.name}! Exactly as described, premium packaging and received within 2 days in Bengaluru.",
                    is_verified_purchase=True,
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                )
                r2 = ProductReview(
                    product_id=p.id,
                    user_id=admin.id if admin else 1,
                    user_name="Rahul V.",
                    rating=4.5,
                    title="Worth every rupee",
                    comment="Great build quality and very comfortable to use daily. Highly recommended for the price.",
                    is_verified_purchase=True,
                    created_at=datetime.datetime.utcnow() - datetime.timedelta(days=7),
                )
                db.add_all([r1, r2])
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
app.include_router(wishlist_router, prefix=settings.API_V1_PREFIX)
app.include_router(addresses_router, prefix=settings.API_V1_PREFIX)
app.include_router(coupons_router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews_router, prefix=settings.API_V1_PREFIX)
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
