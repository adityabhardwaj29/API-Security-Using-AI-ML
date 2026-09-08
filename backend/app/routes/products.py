from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.product import Product
from backend.app.models.category import Category
from backend.app.schemas.product import ProductResponse, ProductCreate
from backend.app.schemas.category import CategoryResponse
from backend.app.security.permissions import require_admin

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    if not cats:
        # Seed default Indian e-commerce categories if table empty
        default_cats = [
            Category(name="Fashion", slug="fashion", description="Ethnic & Western Wear", icon="Shirt"),
            Category(name="Electronics", slug="electronics", description="Gadgets, Audio & Accessories", icon="Smartphone"),
            Category(name="Home & Lifestyle", slug="home-lifestyle", description="Decor, Kitchen & Bedding", icon="Home"),
            Category(name="Beauty & Personal Care", slug="beauty-personal-care", description="Skincare, Fragrances & Wellness", icon="Sparkles"),
            Category(name="Footwear", slug="footwear", description="Sneakers, Sandals & Formal Shoes", icon="Footprints"),
            Category(name="Grocery & Gourmet", slug="grocery", description="Spices, Tea & Snacks", icon="ShoppingBag"),
        ]
        db.add_all(default_cats)
        db.commit()
        cats = db.query(Category).all()
    return cats


@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = Query(None, description="Category filter"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    search: Optional[str] = Query(None, description="Search keyword"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    min_rating: Optional[float] = Query(None, description="Minimum rating filter"),
    in_stock_only: Optional[bool] = Query(False, description="Filter only in-stock items"),
    sort: Optional[str] = Query(None, description="'price_asc', 'price_desc', 'rating', 'newest'"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category and category.strip().lower() not in ("all", ""):
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))

    if brand and brand.strip().lower() not in ("all", ""):
        query = query.filter(Product.brand.ilike(f"%{brand.strip()}%"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Product.name.ilike(term)) | 
            (Product.description.ilike(term)) | 
            (Product.brand.ilike(term))
        )

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)

    if in_stock_only:
        query = query.filter(Product.stock > 0)

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.id.asc())

    return query.all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return prod


@router.post("/{product_id}/check-pincode")
def check_delivery_pincode(product_id: int, pincode: str = Query(..., min_length=6, max_length=6)):
    """Check standard delivery availability for Indian 6-digit PIN code."""
    if not pincode.isdigit() or len(pincode) != 6:
        return {"available": False, "message": "Invalid 6-digit Indian PIN code."}
    
    first_digit = pincode[0]
    # Realistic regional delivery estimate
    days = 2 if first_digit in ["1", "2", "5", "6"] else 4
    return {
        "available": True,
        "pincode": pincode,
        "estimated_days": days,
        "delivery_type": "Express Delivery" if days == 2 else "Standard Delivery",
        "message": f"Delivery available to {pincode} in {days} business days."
    }


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    req: ProductCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    prod = Product(
        name=req.name,
        brand=req.brand or "Generic",
        description=req.description,
        specifications=req.specifications,
        price=req.price,
        original_price=req.original_price or req.price * 1.25,
        category=req.category,
        image_url=req.image_url,
        stock=req.stock,
        rating=req.rating,
        review_count=req.review_count,
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod
