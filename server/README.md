# Server

The server is meant to be hosted on an AWS EC2 virtual machine running Amazon Linux 2, but you can host it on your own machine, too. Just make sure that you open all the ports and connections correctly.

# Installation

## Installing Dependencies

Run this command to install the required dependencies. I recommend creating a python virtual environment for this.

```bash
pip install -r requirements.txt
```

## Server Hosting

There are two ways to run the server. One is in local testing mode, and the other is opening the server to the internet.

###  1. Local Server Testing

Run in the terminal `python main.py`, and then go to `localhost:8000` in a browser.

### 2. Server Hosting

Can either use Docker or simply run uvicorn locally.

Running in a Docker container:

```bash
source run_server.sh
```

Running without docker:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
