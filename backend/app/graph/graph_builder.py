import networkx as nx
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
import datetime
from backend.app.models.api_log import ApiLog


class GraphBuilder:
    """
    Constructs directed API flow transition graphs from historical API telemetry using NetworkX.
    Nodes represent API endpoints, edges represent behavioral transitions between endpoints.
    """
    SENSITIVE_ENDPOINTS = [
        "/api/payments",
        "/api/payments/checkout",
        "/api/admin/threats",
        "/api/admin/users",
        "/api/admin/models/train",
    ]

    def __init__(self):
        self.graph = nx.DiGraph()

    def build_flow_graph(self, db: Session, limit: int = 1500) -> nx.DiGraph:
        """
        Extract recent user chronological activity and construct weighted transition flow graph.
        """
        logs = db.query(ApiLog).order_by(ApiLog.timestamp.desc()).limit(limit).all()
        # Sort chronologically
        logs = list(reversed(logs))

        G = nx.DiGraph()

        # Group logs by user_id or IP to trace session sequences
        user_sessions: Dict[str, List[ApiLog]] = {}
        node_stats: Dict[str, Dict[str, Any]] = {}

        for log in logs:
            ep = log.endpoint
            # Clean endpoint parameters (e.g. /api/cart/5 -> /api/cart/{id})
            clean_ep = self._normalize_endpoint(ep)

            # Accumulate node statistics
            if clean_ep not in node_stats:
                node_stats[clean_ep] = {
                    "requests": 0,
                    "errors": 0,
                    "latencies": [],
                    "users": set(),
                }
            node_stats[clean_ep]["requests"] += 1
            if log.status_code >= 400:
                node_stats[clean_ep]["errors"] += 1
            node_stats[clean_ep]["latencies"].append(log.response_time)
            user_key = f"user_{log.user_id}" if log.user_id else f"ip_{log.ip_address}"
            node_stats[clean_ep]["users"].add(user_key)

            # Session grouping
            if user_key not in user_sessions:
                user_sessions[user_key] = []
            user_sessions[user_key].append((clean_ep, log.response_time, log.timestamp))

        # Add Nodes with computed attributes
        for ep, stats in node_stats.items():
            reqs = stats["requests"]
            errs = stats["errors"]
            err_rate = round(errs / reqs, 3) if reqs > 0 else 0.0
            avg_lat = round(sum(stats["latencies"]) / len(stats["latencies"]), 2) if stats["latencies"] else 0.0
            users_count = len(stats["users"])
            is_sensitive = any(clean_sens in ep for clean_sens in self.SENSITIVE_ENDPOINTS)

            # Dynamic node risk score
            node_risk = 0.1
            if is_sensitive:
                node_risk += 0.35
            if err_rate > 0.15:
                node_risk += 0.30

            G.add_node(
                ep,
                label=ep,
                request_count=reqs,
                error_count=errs,
                error_rate=err_rate,
                avg_response_time=avg_lat,
                unique_users=users_count,
                risk_score=min(round(node_risk, 2), 1.0),
                is_sensitive=is_sensitive,
            )

        # Trace Edges (Transitions)
        edge_counts: Dict[tuple, int] = {}
        edge_latencies: Dict[tuple, List[float]] = {}

        for user_key, session_logs in user_sessions.items():
            for i in range(len(session_logs) - 1):
                src = session_logs[i][0]
                dst = session_logs[i + 1][0]
                lat = session_logs[i + 1][1]
                edge = (src, dst)
                edge_counts[edge] = edge_counts.get(edge, 0) + 1
                if edge not in edge_latencies:
                    edge_latencies[edge] = []
                edge_latencies[edge].append(lat)

        # Calculate Edge Transition Probabilities and add edges
        for (src, dst), count in edge_counts.items():
            src_out_total = sum(c for (s, d), c in edge_counts.items() if s == src)
            prob = round(count / src_out_total, 3) if src_out_total > 0 else 1.0
            avg_edge_lat = round(sum(edge_latencies[(src, dst)]) / len(edge_latencies[(src, dst)]), 2)

            # Anomaly check on edge (e.g. low probability transition into payment or admin)
            is_anom = False
            if "/admin" in dst and not ("/auth" in src or "/admin" in src):
                is_anom = True
            elif "/payment" in dst and not ("/cart" in src or "/checkout" in src or "/payment" in src):
                is_anom = True

            G.add_edge(
                src,
                dst,
                transition_count=count,
                probability=prob,
                avg_latency=avg_edge_lat,
                is_anomalous=is_anom,
            )

        # If graph is empty (e.g. fresh database), seed standard canonical API nodes
        if len(G.nodes) == 0:
            self._populate_canonical_graph(G)

        self.graph = G
        return G

    def _normalize_endpoint(self, endpoint: str) -> str:
        parts = endpoint.split("?")[0].rstrip("/").split("/")
        # Replace integer IDs with {id}
        normalized = []
        for p in parts:
            if p.isdigit():
                normalized.append("{id}")
            else:
                normalized.append(p)
        return "/".join(normalized) if normalized else "/"

    def _populate_canonical_graph(self, G: nx.DiGraph):
        canonical_nodes = [
            ("/api/auth/register", "Register", 15, 0, 0.0, 65.0, 10, 0.1, False),
            ("/api/auth/login", "Login", 40, 2, 0.05, 45.0, 25, 0.15, False),
            ("/api/products", "Browse Products", 90, 0, 0.0, 30.0, 35, 0.05, False),
            ("/api/cart", "Cart Management", 65, 1, 0.015, 40.0, 30, 0.1, False),
            ("/api/payments/checkout", "Checkout Flow", 30, 0, 0.0, 55.0, 20, 0.45, True),
            ("/api/payments", "Payment Execution", 25, 2, 0.08, 120.0, 18, 0.60, True),
            ("/api/users/profile", "User Profile", 20, 0, 0.0, 25.0, 15, 0.05, False),
            ("/api/admin/threats", "Admin Threats", 10, 0, 0.0, 35.0, 3, 0.50, True),
        ]
        for ep, label, reqs, errs, err_r, lat, users, risk, sens in canonical_nodes:
            G.add_node(
                ep,
                label=ep,
                request_count=reqs,
                error_count=errs,
                error_rate=err_r,
                avg_response_time=lat,
                unique_users=users,
                risk_score=risk,
                is_sensitive=sens
            )

        canonical_edges = [
            ("/api/auth/login", "/api/products", 30, 0.75, 30.0, False),
            ("/api/products", "/api/cart", 60, 0.67, 40.0, False),
            ("/api/cart", "/api/payments/checkout", 25, 0.38, 55.0, False),
            ("/api/payments/checkout", "/api/payments", 22, 0.88, 120.0, False),
            ("/api/auth/login", "/api/admin/threats", 5, 0.12, 35.0, False),
        ]
        for src, dst, count, prob, lat, anom in canonical_edges:
            G.add_edge(
                src,
                dst,
                transition_count=count,
                probability=prob,
                avg_latency=lat,
                is_anomalous=anom
            )

    def to_dict(self) -> Dict[str, Any]:
        """
        Serialize graph structure to JSON payload compatible with React flow and SVG visualizers.
        """
        nodes_list = []
        for node_id, data in self.graph.nodes(data=True):
            nodes_list.append({
                "id": node_id,
                "label": data.get("label", node_id),
                "request_count": data.get("request_count", 0),
                "error_count": data.get("error_count", 0),
                "error_rate": data.get("error_rate", 0.0),
                "avg_response_time": data.get("avg_response_time", 0.0),
                "unique_users": data.get("unique_users", 0),
                "risk_score": data.get("risk_score", 0.0),
                "is_sensitive": data.get("is_sensitive", False),
            })

        edges_list = []
        for src, dst, data in self.graph.edges(data=True):
            edges_list.append({
                "source": src,
                "target": dst,
                "transition_count": data.get("transition_count", 1),
                "probability": data.get("probability", 1.0),
                "avg_latency": data.get("avg_latency", 50.0),
                "is_anomalous": data.get("is_anomalous", False),
            })

        density = nx.density(self.graph) if len(self.graph.nodes) > 1 else 0.0

        return {
            "nodes": nodes_list,
            "edges": edges_list,
            "total_endpoints": len(nodes_list),
            "total_transitions": len(edges_list),
            "graph_density": round(density, 4),
            "generated_at": datetime.datetime.utcnow().isoformat(),
        }


graph_builder = GraphBuilder()
