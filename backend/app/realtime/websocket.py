import asyncio
import json
from typing import List, Dict, Any, Set
from fastapi import WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState


class ConnectionManager:
    """
    Manages active WebSocket connections for the Admin Security Operations Center (SOC) dashboard.
    Broadcasts real-time security alerts, threat telemetry, and telemetry metric updates.
    """
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        """
        Broadcasts a JSON message to all connected clients with safe disconnect handling.
        """
        payload = json.dumps(message)
        disconnected = []

        async with self.lock:
            for connection in list(self.active_connections):
                if connection.client_state == WebSocketState.CONNECTED:
                    try:
                        await connection.send_text(payload)
                    except Exception:
                        disconnected.append(connection)
                else:
                    disconnected.append(connection)

            for dead in disconnected:
                if dead in self.active_connections:
                    self.active_connections.remove(dead)

    async def broadcast_threat_alert(self, threat_data: Dict[str, Any]):
        message = {
            "type": "THREAT_ALERT",
            "data": threat_data,
            "timestamp": threat_data.get("created_at"),
        }
        await self.broadcast(message)

    async def broadcast_security_event(self, event_data: Dict[str, Any]):
        message = {
            "type": "SECURITY_EVENT",
            "data": event_data,
            "timestamp": event_data.get("created_at"),
        }
        await self.broadcast(message)

    async def broadcast_stats_update(self, stats_data: Dict[str, Any]):
        message = {
            "type": "STATS_UPDATE",
            "data": stats_data,
        }
        await self.broadcast(message)


ws_manager = ConnectionManager()
