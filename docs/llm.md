# LLM Threat Synthesis & Incident Explanation

## 1. Safety Principles & Decision Authority
- **LLM NEVER decides ALLOW vs BLOCK**: Security enforcement is strictly evaluated by deterministic heuristics and validated ML/GNN risk engines.
- **Role of LLM**: Review structured XAI feature attributions and telemetry to synthesize human-readable root-cause explanations and actionable SOC recommendations.

## 2. Fallback & Execution Modes
- **OpenAI / Compatible API**: Used when `LLM_API_KEY` is configured in environment. Calls standard Chat Completion endpoint with temperature 0.2.
- **Deterministic Rule Engine Fallback**: Used when no API key is present or external API fails. Generates structured domain-specific security synthesis with exact telemetry attribution.
