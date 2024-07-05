from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

app = FastAPI()


# Mount the static files directory
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Initialize the templates directory
templates = Jinja2Templates(directory="app/templates")

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
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")
            await websocket.send_text(f"We love gay furries!")
    except WebSocketDisconnect:
        print(f"WebSocket connection closed by {client_ip}")
