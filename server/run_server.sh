#!/bin/bash

# Configuration
APP_MODULE="furry-frontlines.server.app.main:app"  # Change this to your app's module
HOST="0.0.0.0"         # Change this to the desired host
PORT="8000"            # Change this to the desired port
LOG_LEVEL="info"       # Change this to your desired log level (debug, info, warning, error, critical)

# Activate virtual environment if needed
# source /path/to/your/venv/bin/activate

# Start Uvicorn server
uvicorn $APP_MODULE --host $HOST --port $PORT --log-level $LOG_LEVEL

# Example: to run the script as:
# ./start_uvicorn.sh

