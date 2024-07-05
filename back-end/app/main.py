import json

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

from starlette.websockets import WebSocketState

app = FastAPI()

# Mount the static files directory
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Initialize the templates directory
templates = Jinja2Templates(directory="app/templates")

# Variable to manage connected clients
connected_websockets = []

def print_ips(connected_websockets):
    ips = []
    for websocket in connected_websockets:
        ips.append(websocket.client.host)
    print(f"List of connected clients:{ips}")


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
    client_ip = websocket.client.host
    await websocket.accept()
    connected_websockets.append(websocket)
    print(f"{client_ip} has started a new websocket connection.")
    print_ips(connected_websockets)
          
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message_type = message.get("type")
            print(f"Received message:{message}")

            if (message_type == "chat_message"):
                print(f"Server has parsed this as chat message.")
                out_json = {"type": "chat_message",
                            "data": data,
                            "sender_ip": websocket.client.host}
                for ws in connected_websockets:
                    if ws.application_state == WebSocketState.CONNECTED:
                        await ws.send_text(out_json)
            else:
                print(f"idk what kind of message this is")

    except WebSocketDisconnect:
        print(f"WebSocket connection closed by {client_ip}")
        connected_websockets.remove(websocket)
        print_ips(connected_websockets)
