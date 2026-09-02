from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class GraphNode(BaseModel):
    id: str  # Endpoint name
    label: str
    request_count: int
    error_count: int
    error_rate: float
    avg_response_time: float
    unique_users: int
    risk_score: float
    is_sensitive: bool


class GraphEdge(BaseModel):
    source: str
    target: str
    transition_count: int
    probability: float
    avg_latency: float
    is_anomalous: bool


class ApiFlowGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_endpoints: int
    total_transitions: int
    graph_density: float
    generated_at: str
