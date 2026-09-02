# Machine Learning Anomaly Detection Pipeline

## 1. 14-Feature Behavioral Vector
The feature extraction engine computes 14 continuous behavioral metrics across a 5-minute sliding window:

1. `requests_per_minute` (RPM velocity)
2. `request_count` (Total window requests)
3. `unique_endpoints` (Distinct path diversity)
4. `error_rate` (4xx/5xx failure proportion)
5. `average_response_time` (Mean millisecond latency)
6. `payment_frequency` (Payment endpoint invocations)
7. `admin_access_frequency` (Administrative route attempts)
8. `failed_login_count` (Consecutive 401s)
9. `endpoint_transition_frequency` (Transition count per minute)
10. `request_size` (Payload size in bytes)
11. `status_code_distribution` (Entropy / ratio of non-200 codes)
12. `recent_activity_score` (Exponential decay activity score)
13. `sensitive_endpoint_access` (Binary flag for sensitive routes)
14. `behaviour_deviation` (Distance from normal baseline)

## 2. Isolation Forest Anomaly Detection
- Trained on normal user behavioral distributions.
- 120 isolation trees with continuous anomaly score normalization in $[0.0, 1.0]$.
- Calibrated with `StandardScaler` to prevent feature dominance.
