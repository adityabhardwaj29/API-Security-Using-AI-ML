import torch
import numpy as np
import networkx as nx
from typing import Tuple, Dict, List


class GraphDatasetBuilder:
    """
    Translates NetworkX API Flow Graphs into normalized PyTorch node feature matrices (X)
    and normalized symmetric adjacency matrices (A_hat) for graph convolution.
    """
    NODE_FEATURES = [
        "request_count",
        "error_count",
        "error_rate",
        "avg_response_time",
        "unique_users",
        "risk_score"
    ]

    def build_tensors_from_graph(self, G: nx.DiGraph) -> Tuple[torch.Tensor, torch.Tensor, List[str]]:
        nodes = list(G.nodes)
        n = len(nodes)
        if n == 0:
            return torch.zeros((1, len(self.NODE_FEATURES))), torch.eye(1), ["/"]

        # Build feature matrix X (n x d)
        X_data = []
        for node in nodes:
            data = G.nodes[node]
            feat = [
                float(data.get("request_count", 0)),
                float(data.get("error_count", 0)),
                float(data.get("error_rate", 0.0)),
                float(data.get("avg_response_time", 40.0)),
                float(data.get("unique_users", 1)),
                float(data.get("risk_score", 0.1)),
            ]
            X_data.append(feat)

        X = np.array(X_data, dtype=np.float32)
        # Normalize features
        means = np.mean(X, axis=0)
        stds = np.std(X, axis=0) + 1e-6
        X_norm = (X - means) / stds
        x_tensor = torch.tensor(X_norm, dtype=torch.float32)

        # Build Normalized Adjacency with Self-Loops: D^(-1/2) * (A + I) * D^(-1/2)
        adj = nx.to_numpy_array(G, nodelist=nodes)
        adj_self = adj + np.eye(n)
        row_sum = np.sum(adj_self, axis=1)
        d_inv_sqrt = np.power(row_sum, -0.5, where=row_sum > 0)
        d_inv_sqrt[row_sum <= 0] = 0.0
        d_mat_inv_sqrt = np.diag(d_inv_sqrt)
        adj_norm = d_mat_inv_sqrt.dot(adj_self).dot(d_mat_inv_sqrt)

        adj_tensor = torch.tensor(adj_norm, dtype=torch.float32)

        return x_tensor, adj_tensor, nodes


ApiFlowGraphDatasetBuilder = GraphDatasetBuilder
dataset_builder = GraphDatasetBuilder()
