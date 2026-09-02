from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.product import Product
from backend.app.schemas.product import ProductResponse, ProductCreate
from backend.app.security.permissions import require_admin

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = Query(None, description="Category filter (Fashion, Electronics, Home & Lifestyle, Beauty & Personal Care)"),
    search: Optional[str] = Query(None, description="Search term for product name/description"),
    sort: Optional[str] = Query(None, description="'price_asc', 'price_desc', 'rating', 'newest'"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category and category.strip().lower() not in ("all", ""):
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter((Product.name.ilike(term)) | (Product.description.ilike(term)))

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


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    req: ProductCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin)
):
    prod = Product(
        name=req.name,
        description=req.description,
        price=req.price,
        category=req.category,
        image_url=req.image_url,
        stock=req.stock,
        rating=req.rating,
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod
