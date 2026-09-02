# Explainable AI (XAI) & SHAP Feature Attributions

## 1. SHAP (SHapley Additive exPlanations)
When an anomaly score crosses the alert threshold, the XAI engine computes Shapley values to assign credit to each of the 14 behavioral features:
$$\phi_i = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} (f(S \cup \{i\}) - f(S))$$

## 2. Transparent Fallback Principle
If the SHAP library or background background explainer is unavailable:
- The system immediately uses deterministic feature attribution evidence based on standardized distance vectors.
- The UI and API explicitly display: `SHAP unavailable — displaying fallback feature evidence.`
- Fallback output is **never** falsely labeled as SHAP.

## 3. Output Schema
Each feature attribution includes:
- `feature`: Name of the metric.
- `importance`: Relative impact in $[0.0, 1.0]$.
- `direction`: `INCREASES_RISK` or `DECREASES_RISK`.
- `importance_level`: `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
- `observed_value`: Exact value recorded in the session.
- `description`: Plain-English explanation of why this metric contributed to the risk decision.
