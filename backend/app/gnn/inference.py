import os
import torch
import torch.nn.functional as F
import networkx as nx
from typing import Dict, Any, Optional, Tuple
from backend.app.gnn.model import ApiGNNAnomalyDetector
from backend.app.gnn.dataset import dataset_builder


MODEL_SAVE_PATH = "data/gnn_checkpoint.pt"


class GNNInferenceEngine:
    """
    Production-safe GNN Inference Engine.
    Handles inference cleanly and reports 'GNN model not trained yet' if no checkpoint exists.
    """
    def __init__(self):
        self.model: Optional[ApiGNNAnomalyDetector] = None
        self.is_loaded = False
        self._load_if_available()

    def _load_if_available(self) -> bool:
        if os.path.exists(MODEL_SAVE_PATH):
            try:
                checkpoint = torch.load(MODEL_SAVE_PATH, map_location=torch.device("cpu"), weights_only=False)
                self.model = ApiGNNAnomalyDetector(
                    in_channels=checkpoint.get("in_channels", 6),
                    hidden_dim=checkpoint.get("hidden_dim", 32),
                    embedding_dim=checkpoint.get("embedding_dim", 16),
                    num_classes=checkpoint.get("num_classes", 2)
                )
                self.model.load_state_dict(checkpoint["state_dict"])
                self.model.eval()
                self.is_loaded = True
                return True
            except Exception:
                self.is_loaded = False
                return False
        return False

    def predict_graph_anomaly(self, G: nx.DiGraph) -> Tuple[Optional[float], str]:
        """
        Calculates structural graph anomaly probability.
        Returns (gnn_anomaly_score, status_message).
        """
        if not self.is_loaded:
            if not self._load_if_available():
                return None, "GNN model not trained yet."

        try:
            x, adj, nodes = dataset_builder.build_tensors_from_graph(G)
            with torch.no_grad():
                logits, embeddings = self.model(x, adj)
                probs = F.softmax(logits, dim=1)
                anomaly_prob = float(probs[0][1].item())
                return round(anomaly_prob, 3), "GNN inference successful."
        except Exception as e:
            return None, f"GNN inference error: {str(e)}"

    @property
    def status(self) -> str:
        if self.is_loaded or os.path.exists(MODEL_SAVE_PATH):
            return "TRAINED"
        return "GNN model not trained yet."


gnn_engine = GNNInferenceEngine()
