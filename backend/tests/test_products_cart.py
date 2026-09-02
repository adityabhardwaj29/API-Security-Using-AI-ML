def test_get_products(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert "name" in products[0]
    assert "price" in products[0]


def test_cart_operations(client):
    # 1. Login user
    login_resp = client.post("/api/auth/login", json={
        "email": "user@apisecurity.io",
        "password": "User@123456"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Products to find product id
    prods = client.get("/api/products").json()
    p_id = prods[0]["id"]

    # 3. Add to cart
    add_resp = client.post("/api/cart", json={"product_id": p_id, "quantity": 2}, headers=headers)
    assert add_resp.status_code == 201
    item_id = add_resp.json()["id"]

    # 4. View cart
    cart_resp = client.get("/api/cart", headers=headers)
    assert cart_resp.status_code == 200
    cart_data = cart_resp.json()
    assert cart_data["total_items"] >= 2
    assert cart_data["total_amount"] > 0

    # 5. Remove item
    del_resp = client.delete(f"/api/cart/{item_id}", headers=headers)
    assert del_resp.status_code == 200
