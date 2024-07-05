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
connected_clients = []

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
    connected_clients.append(websocket)
    print(f"{client_ip} has started a new websocket connection.\n List of connected clients:\
          {connected_clients}")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")
            for client in connected_clients:
                if client.application_state == WebSocketState.CONNECTED:
                    await client.send_text(f"{client.client.host} says {data}")
    except WebSocketDisconnect:
        print(f"WebSocket connection closed by {client_ip}")
        connected_clients.remove(websocket)
