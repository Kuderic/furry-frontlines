import json
import os
import uuid
from random import randint

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from typing import List, Dict

class Player():
    def __init__(self, x, y, name):
        self.x = x
        self.y = y
        self.name = name
        rand_hue = randint(0,255)
        self.color = f"hsl({rand_hue}, 100%, 80%)"

    def to_dict(self) -> Dict[str, any]:
        return {
            "x": self.x,
            "y": self.y,
            "name": self.name,
            "color": self.color
        }

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
player_list: Dict[str, Player] = {}

def print_ips():
    ips = []
    for websocket in connected_clients.values():
        ips.append(websocket.client.host)
    print(f"List of connected client IPs: {ips}")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.middleware("http")
async def log_requests(request: Request, call_next):
    body = await request.body()
    response = await call_next(request)
    return response

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Initialize player for this websocket and send it to websocket
    client_id = await create_new_player(websocket)
    connected_clients[client_id] = websocket
    print_ips()
    await send_new_player(websocket, client_id)

    # Let this websocket know about all players
    await broadcast_player_data()

    # Listen to websocket messages loop
    try:

        while True:
            data = await websocket.receive_text()
            message  = json.loads(data)
            # print(f"Received message. JSON: {message}")

            if message["type"] == "move":
                player_list[client_id].x = message["x"]
                player_list[client_id].y = message["y"]
                await broadcast_player_data()
            elif (message['type'] == "chat_message"):
                await broadcast_message(client_id, message["data"])
            else:
                print(f"Unknown message type")

    except WebSocketDisconnect:
        print(f"WebSocket connection closed by {client_id}")
        del connected_clients[client_id]
        del player_list[client_id]
        print_ips()
        await broadcast_disconnect(client_id)
        await broadcast_player_data()

async def create_new_player(websocket):
    """
    Creates a new player and stores it in player_data.
    Returns: Unique ID for the player. Should only be known by server 
    """
    id = str(uuid.uuid4())
    new_player = Player(x=randint(0, 100),
                        y=randint(0, 100),
                        name=await generate_name(id))
    player_list[id] = new_player

    print("New Player:", new_player.to_dict())
    return id

async def generate_name(id):
    # TO-DO add name generator library
    return "Eric-"+str(id)[:2]

async def send_new_player(websocket, client_id):
    player = player_list[client_id]
    await websocket.send_text(json.dumps({
        "type": "new_player",
        "client_id": client_id,
        "player": player.to_dict()
    }))

async def broadcast_player_data():
    player_dict = {client_id: player.to_dict() for client_id, player in player_list.items()}
    message_str = json.dumps({"type":
                              "update_players",
                              "players": player_dict
                            })
    for webSocket in connected_clients.values():
        await webSocket.send_text(message_str)

async def broadcast_message(client_id: str, message: str):
    message_str = json.dumps({"type": "chat_message",
                              "client_id": client_id,
                              "data": message
                            })
    for webSocket in connected_clients.values():
        await webSocket.send_text(message_str)
        
async def broadcast_disconnect(client_id: str):
    message_str = json.dumps({"type":
                              "disconnect_player",
                              "client_id": client_id
                            })
    for webSocket in connected_clients.values():
        await webSocket.send_text(message_str)

# The following block is only for local development purposes.
# When deploying with a production server, this block is not used.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="info")
