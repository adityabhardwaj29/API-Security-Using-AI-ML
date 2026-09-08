# Real-World Indian E-Commerce + API Security Using AI/ML

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch%20%26%20PyG-EE4C2C.svg?style=flat&logo=pytorch)](https://pytorch.org)
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation%20Forest-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org)
[![NetworkX](https://img.shields.io/badge/Graph-NetworkX-3178C6.svg?style=flat)](https://networkx.org)
[![SHAP](https://img.shields.io/badge/XAI-SHAP-brightgreen.svg?style=flat)](https://shap.readthedocs.io)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-success.svg?style=flat)](file:///c:/api-security-ai-ml/backend/tests)

---

## 🌟 Dual Connected Systems: Market + Defense

This platform is engineered as **TWO interconnected systems working in real-time**:

```
 [ PRODUCT A: INDIAN E-COMMERCE PLATFORM ]
  Register → Login → Catalog → PIN Delivery Check → Wishlist → Cart → Server-Validated Coupons → Multi-Step Checkout → Dynamic UPI QR (₹0 Demo) → Order Tracking Lifecycle
                                          │
                                   HTTP Telemetry
                                          ▼
 [ PRODUCT B: AI/ML API SECURITY SOC INTELLIGENCE ]
  1. API Interceptor → 2. Structured Logger → 3. 14-Feature Sliding Window → 4. Isolation Forest ML → 5. NetworkX Flow Graph → 6. PyTorch Geometric GNN → 7. Multi-Signal Risk Engine → 8. SHAP XAI → 9. LLM Synthesizer → 10. Real-Time WebSocket Alert
```

---

## 📋 Comprehensive Feature Architecture

### 1. Storefront Features (Product A)
- **Indian Rupee Catalog (`₹`, `INR`)**: 18 authentic Indian products across Fashion, Electronics, Home & Lifestyle, Beauty & Personal Care, Footwear, and Gourmet Grocery.
- **Product Details & Verified Reviews**: High-resolution image previews, key specifications, 1-5 star ratings, verified purchase reviews, and real-time 6-digit Indian PIN code delivery estimators.
- **Wishlist Manager (`/wishlist`)**: Save favorite products, stock awareness, and 1-click move to shopping cart.
- **Server-Side Coupon Engine**: Backend-validated coupons (`WELCOME50`, `FESTIVE200`, `SUPERSEC10`, `FREESHIP`) enforcing minimum order values and discount caps.
- **Delivery Address Book (`/profile/addresses`)**: Add, edit, and set default shipping addresses.
- **Multi-Step Checkout**: Clear 5-step progress indicator (Cart → Address → Payment Mode → Security Check → Order Placed).
- **Dynamic UPI QR & ₹0 Demo Mode**: Dynamic scannable UPI QR code generation (`aadityabhardwaj5398@oksbi`) and ₹0 risk-free demonstration mode with honest labeling.
- **Order Tracking Lifecycle (`/orders/:id`)**: Step-by-step progress tracking: `PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED`.

### 2. SOC Security & AI/ML Pipeline (Product B)
- **10-Step Investigation Story (`/admin/threats/:id`)**: Complete end-to-end evidence trace from raw request to final SOC remediation.
- **"Why was this flagged?" Drawer**: Data-backed explanation breakdown citing velocity metrics, error spikes, payment bursts, and sequence anomalies.
- **Interactive Security Pipeline Visualizer (`/admin/security-pipeline`)**: Clickable 10-stage architecture showing inputs, outputs, algorithms, and database tables.
- **Academic Learn & Viva Defense Guide (`/admin/learn` & `/docs`)**: Detailed plain-language documentation explaining all ML, GNN, XAI, and risk math.
- **Live SOC Dashboard (`/admin/dashboard`)**: Database-backed metrics, live WebSocket threat feed, risk distributions, and suspicious endpoint counters.
- **NetworkX API Interaction Graph (`/admin/graph`)**: Interactive directed state transition graph detecting workflow sequence jumps.
- **PyTorch Geometric GNN Hub (`/admin/models`)**: GraphSAGE graph convolutional network modeling multi-hop API transitions with retrain triggers.
- **Controlled Demo Attack Simulator (`/admin/simulator`)**: Safe local test scenarios (Normal Journey, Payment Flood, Sequence Bypass, Brute-Force Login) clearly badged `DEMO / SIMULATED`.

---

## 🔬 AI/ML & Explainability Pipeline

### 1. 14-Feature Behavioral Extractor
Every active user session is analyzed across a 60-second sliding window:
1. `requests_per_minute`: Request velocity
2. `request_count`: Total requests in window
3. `unique_endpoints`: Diversity of accessed endpoints
4. `error_rate`: Ratio of 4xx/5xx HTTP errors
5. `average_response_time`: Server latency
6. `payment_frequency`: Payment verification attempts
7. `failed_login_count`: Authentication failure rate
8. `admin_access_frequency`: Administrative route probing
9. `sensitive_endpoint_access`: Critical API calls
10. `endpoint_transition_frequency`: Markov state changes
11. `status_4xx_ratio`: Client-side error proportion
12. `status_5xx_ratio`: Server-side error proportion
13. `behavior_deviation`: Deviation from baseline profile
14. `activity_velocity_score`: Exponential decay activity score

### 2. Isolation Forest ML
- **Algorithm**: `IsolationForest(n_estimators=100, contamination=0.08)`
- **Function**: Isolates outliers in 14-dimensional feature space.

### 3. PyTorch Geometric GNN
- **Model**: GraphSAGE / GCN (2-layer `SAGEConv`, Hidden Dim = 32, ReLU, Dropout = 0.2)
- **Function**: Detects structural sequence bypasses (e.g., jumping from `/api/products` directly to `/api/payments/verify` without visiting `/api/cart`).

### 4. Multi-Signal Risk Engine
- **Formula**: `Risk = 0.40 * ML_Score + 0.35 * GNN_Score + 0.25 * Heuristic_Criticality`
- **Output Levels**: `LOW` (0-44), `MEDIUM` (45-74), `HIGH` (75-89), `CRITICAL` (90-100).

### 5. Explainable AI (SHAP & LLM)
- **SHAP**: Shapley additive feature importance rankings (`TreeExplainer`).
- **LLM Synthesizer**: Converts structured evidence into clear SOC incident summaries using `gpt-4o-mini` (or deterministic rule synthesizer fallback).

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/adityabhardwaj29/API-Security-Using-AI-ML.git
cd API-Security-Using-AI-ML
```

### 2. Backend Setup & Startup
```powershell
# From project root:
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```
> **Backend API Docs (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
> **Backend Health**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Frontend Setup & Startup
```powershell
cd frontend
npm install
npm run dev
```
> **Storefront & Admin Console**: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## 🔑 Default Credentials

| Account | Email | Password | Role |
|---|---|---|---|
| **Admin SOC** | `admin@apisecurity.io` | `admin123` | **ADMIN** |
| **Demo Customer** | `user@apisecurity.io` | `User@123456` | **USER** |
| **New Customer** | Any valid email on [Sign Up](http://127.0.0.1:5173/register) | Custom | **USER** |

---

## 🐳 Docker Deployment

To launch the complete multi-service stack with PostgreSQL 16 Alpine, Backend, and Frontend:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## 🧪 Running Automated Tests

```powershell
python -m pytest backend/tests/ -v
```
**Test Results**: 20/20 Test Cases Passing (`test_auth.py`, `test_products_cart.py`, `test_payments_security.py`, `test_ml_detector.py`, `test_ecommerce_features.py`, `test_scenarios.py`).

---

## 📜 License
MIT License. Built for advanced cybersecurity research, academic demonstration, and production API defense.
