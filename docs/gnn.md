# Graph Neural Network (GNN) Structural Modeling

## 1. NetworkX API Flow Graph Construction
The API Flow Graph models API endpoints as graph nodes $V$ and user transitions between endpoints as directed weighted edges $E$:
- **Nodes**: API endpoint routes (e.g. `/api/auth/login`, `/api/products`, `/api/cart`, `/api/payments`).
- **Node Features**: Request volume, error rate, average latency, unique client count, risk sensitivity.
- **Edges**: Directed session transitions between endpoint $A$ and endpoint $B$ with transition frequencies.

## 2. PyTorch Graph Convolution Architecture
The structural anomaly detector implements a 2-layer Graph Convolution Network (GCN) with symmetric normalized adjacency $\hat{A} = \tilde{D}^{-\frac{1}{2}} \tilde{A} \tilde{D}^{-\frac{1}{2}}$:

```
H^{(0)} = X (Node Feature Matrix)
H^{(1)} = ReLU(\hat{A} H^{(0)} W^{(0)})
H^{(2)} = \hat{A} H^{(1)} W^{(1)}
z = GlobalMeanPool(H^{(2)})
\hat{y} = Sigmoid(Linear(z))
```

## 3. Honest Status Reporting
If the GNN model weights are not yet trained, the system explicitly reports:
`GNN model not trained yet.`
Once trained via the SOC Model Hub (`POST /api/admin/models/train-gnn`), checkpoints are persisted to `data/gnn_checkpoint.pt` and inference is activated.
