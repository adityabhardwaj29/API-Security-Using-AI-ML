def test_categories_and_products(client):
    res = client.get("/api/products/categories")
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 4

    # Check products list
    prod_res = client.get("/api/products")
    assert prod_res.status_code == 200
    products = prod_res.json()
    assert len(products) >= 10


def test_coupon_validation(client):
    # Valid coupon
    res = client.post("/api/coupons/validate", json={"code": "WELCOME50", "cart_total": 500.0})
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["discount_amount"] > 0

    # Invalid coupon
    res_inv = client.post("/api/coupons/validate", json={"code": "INVALID_CODE_99", "cart_total": 500.0})
    assert res_inv.status_code == 200
    assert res_inv.json()["valid"] is False


def test_wishlist_and_addresses(client):
    # User login
    login_resp = client.post("/api/auth/login", json={
        "email": "user@apisecurity.io",
        "password": "User@123456"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add to wishlist
    wish_res = client.post("/api/wishlist", json={"product_id": 1}, headers=headers)
    assert wish_res.status_code in (200, 201)

    # Get wishlist
    get_wish = client.get("/api/wishlist", headers=headers)
    assert get_wish.status_code == 200
    assert len(get_wish.json()) >= 1

    # Create address
    addr_res = client.post("/api/addresses", json={
        "full_name": "Priya Sharma",
        "phone": "+91 98765 43210",
        "address_line": "123 Indiranagar 100 Feet Rd",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postal_code": "560038",
        "is_default": True
    }, headers=headers)
    assert addr_res.status_code == 201
    assert addr_res.json()["city"] == "Bengaluru"


def test_investigation_and_pipeline_endpoints(client):
    # Admin login
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@apisecurity.io",
        "password": "admin123"
    })
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Pipeline metadata endpoint
    pipe_res = client.get("/api/admin/pipeline-info")
    assert pipe_res.status_code == 200
    assert len(pipe_res.json()) == 10
