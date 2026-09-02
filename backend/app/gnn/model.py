import torch
import torch.nn as nn
import torch.nn.functional as F


class GraphConvolution(nn.Module):
    """
    Standard Spectral/Spatial Graph Convolution Layer implemented with PyTorch tensor ops.
    Supports adjacency matrix or edge index messaging without requiring C++ extensions.
    """
    def __init__(self, in_features: int, out_features: int, bias: bool = True):
        super(GraphConvolution, self).__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.weight = nn.Parameter(torch.FloatTensor(in_features, out_features))
        if bias:
            self.bias = nn.Parameter(torch.FloatTensor(out_features))
        else:
            self.register_parameter('bias', None)
        self.reset_parameters()

    def reset_parameters(self):
        nn.init.kaiming_uniform_(self.weight)
        if self.bias is not None:
            nn.init.zeros_(self.bias)

    def forward(self, x: torch.Tensor, adj: torch.Tensor) -> torch.Tensor:
        support = torch.mm(x, self.weight)
        output = torch.spmm(adj, support)
        if self.bias is not None:
            output = output + self.bias
        return output


class ApiGNNAnomalyDetector(nn.Module):
    """
    Graph Neural Network for API Flow Graph structural anomaly detection.
    Encodes endpoint node attributes and transition flow relationships to score sequence structural anomalies.
    """
    def __init__(self, in_channels: int = 6, hidden_dim: int = 32, embedding_dim: int = 16, num_classes: int = 2):
        super(ApiGNNAnomalyDetector, self).__init__()
        self.gc1 = GraphConvolution(in_channels, hidden_dim)
        self.gc2 = GraphConvolution(hidden_dim, embedding_dim)
        self.dropout = nn.Dropout(p=0.2)
        
        # Classifier head operating on pooled graph/node embeddings
        self.classifier = nn.Sequential(
            nn.Linear(embedding_dim, 16),
            nn.ReLU(),
            nn.Linear(16, num_classes)
        )

    def forward(self, x: torch.Tensor, adj: torch.Tensor) -> torch.Tensor:
        # Layer 1
        h = self.gc1(x, adj)
        h = F.relu(h)
        h = self.dropout(h)

        # Layer 2: Graph Node Embeddings
        embeddings = self.gc2(h, adj)
        embeddings = F.relu(embeddings)

        # Global pooling (Mean representation over flow nodes)
        graph_embedding = torch.mean(embeddings, dim=0, keepdim=True)
        logits = self.classifier(graph_embedding)
        return logits, embeddings
