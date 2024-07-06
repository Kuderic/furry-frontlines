import json
import os
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import List, Dict

# from starlette.websockets import WebSocketState

app = FastAPI()

# Get the absolute path of the current file
base_dir = os.path.dirname(os.path.abspath(__file__))

# Define the paths for static and template directories
static_dir = os.path.join(base_dir, "static")
templates_dir = os.path.join(base_dir, "templates")

# Mount the static files directory using the defined path
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Initialize the templates directory using the defined path
templates = Jinja2Templates(directory=templates_dir)

# Store connected clients and player states
connected_clients: Dict[str, WebSocket] = {}
player_positions: Dict[str, Dict[str, float]] = {}

def print_ips():
    ips = []
    for websocket in connected_clients.values():
        ips.append(websocket.client.host)
    print(f"List of connected client IPs: {ips}")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.middleware("http")
async def log_requests(request: Request, call_next):
    body = await request.body()
    if body:
        print(f"Request Body: {body}")
    else:
        print("Request has no body.")
    response = await call_next(request)
    return response

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = str(uuid.uuid4())
    connected_clients[client_id] = websocket
    player_positions[client_id] = {"x": 0, "y": 0}

    print(f"{client_id} has started a new websocket connection.")
    print_ips()

    # Listen to websocket messages loop
    try:
        await websocket.send_text(json.dumps({"type": "client_id", "client_id": client_id}))
        while True:
            data = await websocket.receive_text()
            message  = json.loads(data)
            print(f"Received message. JSON: {message}")

            if message["type"] == "move":
                player_positions[client_id]["x"] = message["x"]
                player_positions[client_id]["y"] = message["y"]
                await broadcast_positions()
            elif (message['type'] == "chat_message"):
                await broadcast_message(client_id, message["data"])
            else:
                print(f"Unknown message type")

    except WebSocketDisconnect:
        print(f"WebSocket connection closed by {client_id}")
        del connected_clients[client_id]
        del player_positions[client_id]
        print_ips()
        await broadcast_positions()

async def broadcast_positions():
    print("Broadcasting player positions")
    positions = json.dumps({"type": "update", "players": player_positions})
    for webSocket in connected_clients.values():
        await webSocket.send_text(positions)

async def broadcast_message(client_id: str, message: str):
    print("Broadcasting message")
    chat_message = json.dumps({"type": "chat_message", "sender_id": client_id, "data": message})
    for webSocket in connected_clients.values():
        await webSocket.send_text(chat_message)

# The following block is only for local development purposes.
# When deploying with a production server, this block is not used.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app", host="127.0.0.1", port=8000, reload=True, log_level="info")
