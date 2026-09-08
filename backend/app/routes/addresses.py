from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.address import Address
from backend.app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from backend.app.security.permissions import require_user

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressResponse])
def list_addresses(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    req: AddressCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    # If this is default or first address, unset previous defaults if needed
    if req.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    count = db.query(Address).filter(Address.user_id == current_user.id).count()
    is_def = req.is_default or (count == 0)

    addr = Address(
        user_id=current_user.id,
        full_name=req.full_name,
        phone=req.phone,
        address_line=req.address_line,
        city=req.city,
        state=req.state,
        postal_code=req.postal_code,
        country=req.country or "India",
        is_default=is_def
    )
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    req: AddressUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")

    if req.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(addr, field, val)

    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/{address_id}", status_code=status.HTTP_200_OK)
def delete_address(
    address_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")

    db.delete(addr)
    db.commit()
    return {"message": "Address deleted successfully.", "deleted_id": address_id}


@router.post("/{address_id}/set-default", response_model=AddressResponse)
def set_default_address(
    address_id: int,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found.")

    db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    addr.is_default = True
    db.commit()
    db.refresh(addr)
    return addr
