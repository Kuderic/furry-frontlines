## Installation

Run this command to install the required dependencies:

```bash
pip install -r requirements.txt
```

## Hosting the Server

The server code is made using the FastAPI, Uvicorn, and Websocket libraries.

The server is meant to be hosted on an AWS EC2 virtual machine, but you can host it on your own machine, too. Just make sure that you open all the ports and connections correctly.

To start the server, run the following code from this directory:


```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
