# Admin SOC Dashboard & Visual Specifications

## 1. Visual Theme: White Base + Deep Blue Text + Electric Blue Neon
The SOC dashboard uses a modern **White Base** aesthetic:
- **Base Background**: `#f8fafc` / `#ffffff`
- **Surface Cards**: `#ffffff` with subtle border `#e2e8f0` and soft elevation.
- **Primary Typography**: Deep slate `#0f172a` for maximum contrast and readability.
- **Electric Blue Neon Accents**: `#0066ff` / `#38bdf8` with subtle box-shadow glows.
- **Status Indicators**: Emerald Green (`#059669`), Amber (`#d97706`), Rose (`#e11d48`).

## 2. Views & Capabilities
1. **SOC Overview (`/admin/dashboard`)**:
   - KPIs: Total API Requests, Active Threats, UPI Payment Events, PyTorch GNN Core status.
   - Live Security Monitor banner with instant investigation link.
   - Live traffic & error velocity area charts.
   - Risk distribution pie chart.
2. **Live Threat Monitor (`/admin/threats`)**: Zero-latency incident stream with severity/status filters and quick action controls.
3. **Threat Detail (`/admin/threats/:id`)**: Full telemetry inspect, XAI/SHAP feature attributions, and LLM incident synthesis.
4. **UPI Payment Security (`/admin/payments`)**: Indian Rupee transaction volume, risk distribution, completed vs flagged vs held payments.
5. **Interactive API Flow Graph (`/admin/graph`)**: NetworkX directed transition topology with zoom/pan and node inspector.
6. **User Behavioral Investigation (`/admin/users`)**: Searchable user directory and chronological session sequence reconstruction.
7. **API Telemetry (`/admin/apis`)**: Endpoint latency, error rates, and client counts.
8. **ML / GNN Hub (`/admin/models`)**: Real-time benchmark evaluation matrix across Isolation Forest and PyTorch GNN.
9. **Attack Simulator (`/admin/simulator`)**: Deterministic local synthetic attack scenarios (Normal, Payment Flood, Workflow Bypass, Brute Force).
10. **SOC Settings (`/admin/settings`)**: Risk engine cutoffs, UPI merchant VPAs, and model configuration.
