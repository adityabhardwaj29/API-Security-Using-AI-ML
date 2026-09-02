import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from sse_starlette.sse import EventSourceResponse
from backend.app.realtime.websocket import ws_manager

router = APIRouter(prefix="/realtime", tags=["Real-time Streaming"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Real-time bidirectional WebSocket connection for Admin SOC alerts and live telemetry streaming.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Heartbeat / message receiver
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception:
        await ws_manager.disconnect(websocket)


@router.get("/sse")
async def sse_endpoint(request: Request):
    """
    Server-Sent Events fallback endpoint for real-time security alerts.
    """
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            # Send periodic heartbeat
            yield {
                "event": "heartbeat",
                "data": json.dumps({"status": "healthy"}),
            }
            await asyncio.sleep(15)

    return EventSourceResponse(event_generator())
