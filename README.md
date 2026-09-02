# Real-World Indian E-Commerce + API Security Using AI/ML

A full-stack, production-grade cybersecurity web platform natively integrated with an Indian E-Commerce marketplace. Combines real-time behavioral API telemetry, NetworkX transition flow graphs, Machine Learning (Isolation Forest), PyTorch Graph Neural Networks (GNN), Explainable AI (SHAP), LLM Threat Synthesis, and a dynamic UPI QR payment engine.

---

## 🌟 Dual Operational Environments

### 1. Customer Storefront (Indian E-Commerce)
- **Indian Rupee Standard (`₹`, `INR`)**: Realistic catalog across 4 categories:
  1. *Fashion* (T-Shirts, Jeans, Hoodies, Sneakers, Watches, Bags)
  2. *Electronics* (Earbuds, Smart Watches, Power Banks, Chargers)
  3. *Home & Lifestyle* (Desk Lamps, Steel Flasks, Eco Mats, Aroma Diffusers)
  4. *Beauty & Personal Care* (Face Serums, Beard Trimmers, Sunscreen, Moisturizers)
- **Dynamic UPI QR Scan & Pay**: Generates compliant `upi://pay?pa=...` URI strings for Google Pay, PhonePe, Paytm, BHIM, CRED, Navi, and custom VPAs.
- **Safe ₹0 Demo Mode**: Clear badge `Demo transaction — no real money transferred` allowing safe exploration of payment risk flows without real money transfers.
- **Human-Friendly Security Challenges**: If an anomalous transaction occurs, users receive a clean `⚠️ SECURITY CHECK REQUIRED` step-up modal with `[ Verify Identity ]` and `[ Cancel Payment ]` rather than internal ML scores.
- **Ledger & Audit Trail**: Real-time order tracking and UPI transaction history.

### 2. Admin Security Operations Center (SOC)
- **Visual Design**: Modern **White Base (`#ffffff` / `#f8fafc`) + Deep Blue Typography (`#0f172a`) + Electric Blue Neon Highlights (`#0066ff`)**.
- **Live Threat Stream**: Zero-latency WebSocket threat broadcast stream with real-time alert banners.
- **UPI Payment Security View (`/admin/payments`)**: Indian Rupee transaction volume, completed vs flagged vs held transactions, and payment risk breakdowns.
- **Interactive API Flow Graph (`/admin/graph`)**: Interactive NetworkX directed multi-graph canvas with zoom/pan and node inspector.
- **Explainable AI (XAI / SHAP)**: Local feature attribution graphs for 14 continuous behavioral metrics with transparent fallback reporting.
- **LLM Threat Synthesis**: OpenAI-compatible / deterministic intelligence engine providing root cause analysis and actionable SOC recommendations (LLM never decides Allow/Block).
- **User Behavioral Investigation (`/admin/users`)**: Searchable user directory and chronological session sequence reconstruction.
- **PyTorch GNN & ML Hub (`/admin/models`)**: Real-time evaluation matrix (Accuracy, Precision, Recall, F1, ROC-AUC, FPR) and flow graph GNN training trigger.
- **Attack Simulator (`/admin/simulator`)**: One-click synthetic attack generator (Normal Flow, Payment Flood, Admin Probing, Brute-Force Login).
- **SOC Settings (`/admin/settings`)**: Risk engine calibrated thresholds, UPI merchant VPAs, and model configuration.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Recharts, Lucide React, Modern CSS Tokens |
| **Backend** | Python 3.12+, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2 |
| **Database** | SQLite (Zero-config local) / PostgreSQL (Production & Docker) |
| **Machine Learning** | Scikit-Learn (Isolation Forest), NumPy, Pandas |
| **API Flow Graph** | NetworkX (Directed Flow Graph) |
| **Deep Learning (GNN)** | PyTorch & PyTorch Geometric (Graph Convolution Network) |
| **Explainability (XAI)** | SHAP (TreeExplainer & KernelExplainer) + Standardized Evidence Fallback |
| **Threat Synthesis** | OpenAI-Compatible LLM API (`gpt-4o-mini`) + Deterministic Rule Engine |
| **Realtime Stream** | WebSockets (`/api/realtime/ws`) |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📂 Project Structure

```
api-security-ai-ml/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application factory, CORS, routers & seeding
│   │   ├── config.py                   # Settings (INR, UPI ID, Payment Mode, LLM, Risk Thresholds)
│   │   ├── database.py                 # SQLAlchemy engine, session maker, Base
│   │   ├── models/                     # User, Product, CartItem, Order, Payment, Threat, etc.
│   │   ├── schemas/                    # Pydantic v2 request/response models
│   │   ├── security/                   # Bcrypt, JWT, RBAC permissions, audit middleware, rate limiter
│   │   ├── ml/                         # 14-Feature Engineer, Isolation Forest, Risk Engine, Evaluator
│   │   ├── graph/                      # NetworkX Flow Graph constructor (nodes, edges, metrics)
│   │   ├── gnn/                        # PyTorch GNN model, dataset builder, train & inference
│   │   ├── explainability/             # SHAP explainer & feature attribution analyzer
│   │   ├── llm/                        # Structured LLM Threat Synthesizer
│   │   ├── realtime/                   # WebSocket ConnectionManager & broadcast channels
│   │   ├── services/                   # Logging, Payment, Threat & Synthetic Demo Generator
│   │   └── routes/                     # Auth, Users, Products, Cart, Orders, Payments, Threats, Admin
│   ├── tests/                          # Automated pytest suite (Scenarios 1–5)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Badge, Modal, ThreatAlertBanner, FlowGraphView, XAIBarChart
│   │   ├── layouts/                    # UserLayout, AdminLayout (White/Blue Neon)
│   │   ├── pages/
│   │   │   ├── user/                   # Home, Products, Cart, Checkout, Payment (UPI), Dashboard, Transactions
│   │   │   └── admin/                  # SOCDashboard, ThreatMonitor, ThreatDetail, PaymentSecurity, Graph, Users, APIs, Models, Simulator, Settings
│   │   ├── services/                   # api.js (Axios), websocket.js
│   │   ├── styles/                     # index.css, admin.css
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/                               # 8 Comprehensive Architecture & Technical Documents
├── data/                               # Saved model weights (data/gnn_checkpoint.pt)
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quickstart & Installation

### Option 1: Direct Local Execution

#### 1. Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```
*OpenAPI Documentation: `http://localhost:8000/docs`.*

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend: `http://localhost:5173`.*

---

### Option 2: Docker Compose

```bash
docker compose up --build
```
- Storefront & SOC UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🔑 Default Credentials

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **SOC Administrator** | `admin@apisecurity.io` | `Admin@123456` | `/admin/dashboard` or `/admin/login` |
| **Demo Customer** | `user@apisecurity.io` | `User@123456` | `/login` → `/products` |

*Step-Up Verification Sandbox Code:* `123456`

---

## 🔬 Automated Test Suite

Run the full end-to-end test suite including Scenarios 1–5 (Section 43):

```bash
cd backend
python -m pytest tests/ -v
```

---

## 📚 Technical Documentation Index

- [Architecture Overview](file:///c:/api-security-ai-ml/docs/architecture.md)
- [UPI Payment Flow & ₹0 Demo Mode](file:///c:/api-security-ai-ml/docs/payment-flow.md)
- [API Security & Threat Mitigation](file:///c:/api-security-ai-ml/docs/security.md)
- [Machine Learning & 14-Feature Pipeline](file:///c:/api-security-ai-ml/docs/ml-pipeline.md)
- [PyTorch GNN Structural Modeling](file:///c:/api-security-ai-ml/docs/gnn.md)
- [Explainable AI (XAI / SHAP)](file:///c:/api-security-ai-ml/docs/xai.md)
- [LLM Threat Synthesis](file:///c:/api-security-ai-ml/docs/llm.md)
- [Admin SOC Visual Specifications](file:///c:/api-security-ai-ml/docs/admin-dashboard.md)
