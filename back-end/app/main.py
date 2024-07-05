from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    body = await request.body()
    print(f"Invalid Request Body: {body}")
    response = await call_next(request)
    return response

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>WebSocket Example</title>
    </head>
    <body>
        <h1>WebSocket Example</h1>
        <button onclick="sendMessage()">Send Message</button>
        <script>
            let ws = new WebSocket("ws://ec2-3-133-93-0.us-east-2.compute.amazonaws.com:8000/ws");
            ws.onmessage = function(event) {
                alert("Message from server: " + event.data);
            };
            function sendMessage() {
                ws.send("Hello, Server!");
            }
        </script>
    </body>
</html>
"""

@app.get("/")
async def get():
    return HTMLResponse(html)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")

# Run the app using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
