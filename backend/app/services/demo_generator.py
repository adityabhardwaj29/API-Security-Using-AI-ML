import datetime
import random
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.api_log import ApiLog
from backend.app.models.user import User
from backend.app.ml.features import feature_engineer
from backend.app.ml.risk_engine import risk_engine
from backend.app.services.threat_service import threat_service


class DemoTrafficGenerator:
    """
    Generates safe, deterministic local synthetic traffic to simulate security scenarios in real time.
    All data is clearly labelled as synthetic.
    """
    def run_scenario(
        self,
        db: Session,
        scenario: str,
        target_user_email: Optional[str] = None
    ) -> Dict[str, Any]:
        user = None
        if target_user_email:
            user = db.query(User).filter(User.email == target_user_email).first()
        if not user:
            user = db.query(User).filter(User.role == "USER").first()
        user_id = user.id if user else 1

        now = datetime.datetime.utcnow()
        generated_logs = []
        threat_detected = False
        risk_level = "LOW"
        risk_score = 0.12
        threat_type = None
        action_taken = "ALLOW"
        summary = ""

        if scenario in ("NORMAL_FLOW", "NORMAL_PURCHASE"):
            # Normal Flow: Login -> Browse Products -> Add to Cart -> Place Order -> UPI Payment
            flow_steps = [
                ("/api/auth/login", "POST", 200, 42.0, "AUTH"),
                ("/api/products", "GET", 200, 25.0, "READ"),
                ("/api/products/1", "GET", 200, 18.0, "READ"),
                ("/api/cart", "POST", 201, 35.0, "CART"),
                ("/api/orders", "POST", 201, 48.0, "CHECKOUT"),
                ("/api/payments", "POST", 200, 110.0, "PAYMENT"),
            ]
            for idx, (ep, method, status, lat, etype) in enumerate(flow_steps):
                t = now - datetime.timedelta(seconds=(len(flow_steps) - idx) * 5)
                log = ApiLog(
                    user_id=user_id,
                    endpoint=ep,
                    method=method,
                    status_code=status,
                    timestamp=t,
                    response_time=lat,
                    ip_address="192.168.1.55",
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) DemoBrowser/1.0",
                    request_size=random.randint(150, 450),
                    event_type=etype,
                )
                db.add(log)
                generated_logs.append({"endpoint": ep, "method": method, "status": status})
            db.commit()

            summary = "Simulated normal Indian e-commerce customer journey (Login -> Products -> Cart -> Order -> UPI Payment). Verified LOW risk profile."

        elif scenario in ("HIGH_FREQUENCY_PAYMENT", "PAYMENT_BURST"):
            # Rapid burst of 8 payments in under 20 seconds
            for i in range(8):
                t = now - datetime.timedelta(seconds=(8 - i) * 2)
                log = ApiLog(
                    user_id=user_id,
                    endpoint="/api/payments",
                    method="POST",
                    status_code=200 if i == 0 else 429,
                    timestamp=t,
                    response_time=random.uniform(90.0, 160.0),
                    ip_address="10.0.4.18",
                    user_agent="Python-Automated-Script/1.4",
                    request_size=320,
                    event_type="PAYMENT",
                )
                db.add(log)
                generated_logs.append({"endpoint": "/api/payments", "method": "POST", "status": log.status_code})
            db.commit()

            features = feature_engineer.extract_user_features(db, user_id=user_id)
            evaluation = risk_engine.evaluate(features, "/api/payments", "POST", "USER")
            threat = threat_service.create_threat_and_broadcast(
                db=db,
                user_id=user_id,
                endpoint="/api/payments",
                event_type="PAYMENT",
                risk_evaluation=evaluation,
                features=features,
                ip_address="10.0.4.18"
            )
            threat_detected = True
            risk_level = threat.risk_level
            risk_score = threat.anomaly_score
            threat_type = threat.threat_type
            action_taken = threat.action_taken
            summary = f"Simulated high-frequency payment burst attack. Threat triggered ({threat.threat_type}, Risk: {threat.risk_level}). Live WebSocket alert pushed to Admin SOC."

        elif scenario in ("UNUSUAL_API_SEQUENCE", "UNUSUAL_TRANSITION", "ADMIN_PROBE"):
            # Non-admin user probing admin threat APIs and jumping straight into payments
            steps = [
                ("/api/auth/login", "POST", 200, 40.0, "AUTH"),
                ("/api/admin/threats", "GET", 403, 22.0, "ADMIN"),
                ("/api/admin/users", "GET", 403, 19.0, "ADMIN"),
                ("/api/admin/models/train", "POST", 403, 25.0, "ADMIN"),
                ("/api/payments", "POST", 200, 105.0, "PAYMENT"),
            ]
            for idx, (ep, method, status, lat, etype) in enumerate(steps):
                t = now - datetime.timedelta(seconds=(len(steps) - idx) * 3)
                log = ApiLog(
                    user_id=user_id,
                    endpoint=ep,
                    method=method,
                    status_code=status,
                    timestamp=t,
                    response_time=lat,
                    ip_address="172.16.88.92",
                    user_agent="curl/7.88.1",
                    request_size=180,
                    event_type=etype,
                )
                db.add(log)
                generated_logs.append({"endpoint": ep, "method": method, "status": status})
            db.commit()

            features = feature_engineer.extract_user_features(db, user_id=user_id)
            evaluation = risk_engine.evaluate(features, "/api/admin/threats", "GET", "USER")
            threat = threat_service.create_threat_and_broadcast(
                db=db,
                user_id=user_id,
                endpoint="/api/admin/threats",
                event_type="ADMIN",
                risk_evaluation=evaluation,
                features=features,
                ip_address="172.16.88.92"
            )
            threat_detected = True
            risk_level = threat.risk_level
            risk_score = threat.anomaly_score
            threat_type = threat.threat_type
            action_taken = threat.action_taken
            summary = f"Simulated unauthorized admin probing & anomalous sequence transition bypass. Threat triggered ({threat.threat_type}). Live alert pushed to SOC."

        elif scenario in ("BRUTE_FORCE_LOGIN", "FAILED_LOGINS"):
            for i in range(6):
                t = now - datetime.timedelta(seconds=(6 - i) * 3)
                log = ApiLog(
                    user_id=None,
                    endpoint="/api/auth/login",
                    method="POST",
                    status_code=401,
                    timestamp=t,
                    response_time=random.uniform(35.0, 55.0),
                    ip_address="198.51.100.44",
                    user_agent="Hydra-Auth-Probe/9.2",
                    request_size=195,
                    event_type="AUTH",
                )
                db.add(log)
                generated_logs.append({"endpoint": "/api/auth/login", "method": "POST", "status": 401})
            db.commit()

            features = feature_engineer.extract_user_features(db, user_id=None, ip_address="198.51.100.44")
            evaluation = risk_engine.evaluate(features, "/api/auth/login", "POST", "ANONYMOUS")
            threat = threat_service.create_threat_and_broadcast(
                db=db,
                user_id=None,
                endpoint="/api/auth/login",
                event_type="AUTH",
                risk_evaluation=evaluation,
                features=features,
                ip_address="198.51.100.44"
            )
            threat_detected = True
            risk_level = threat.risk_level
            risk_score = threat.anomaly_score
            threat_type = threat.threat_type
            action_taken = threat.action_taken
            summary = f"Simulated credential brute-force authentication attack. Threat triggered ({threat.threat_type}). Live alert pushed to SOC."

        else:
            summary = f"Executed generic traffic simulation for scenario: {scenario}"

        return {
            "scenario": scenario,
            "events_generated": len(generated_logs),
            "threat_detected": threat_detected,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "threat_type": threat_type,
            "action_taken": action_taken,
            "summary": summary,
        }


demo_generator = DemoTrafficGenerator()
