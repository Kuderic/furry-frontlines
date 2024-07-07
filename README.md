# 😺 Furry Frontiers XV (aka ff15 😿)

[<img src="https://i.ibb.co/RTyPwJM/upscaled.png">](https://furryfrontiers.com/)

## 😸 Server

The server code is made using the FastAPI, Uvicorn, and websockets.

The server is meant to be hosted on an AWS EC2 virtual machine, but you can host it on your own machine, too. Just make sure that you open all the ports and connections correctly.

The server can be ran and tested locally using `python main.py`, and then going to `localhost:8000` in a browser. It can also be ran using uvicorn, which will host a dedicated server on the designated ports. Example usage: `uvicorn server.app.main:app --host 0.0.0.0 --port 8000`.

See README in server directory for more info.

## 😼 Client 

I need graphics libraries for javascript. I heard paperio is good ?


# 😻 File Structure

### Server

This folder contains all the code to start the server application.

    app/: Main application directory.
        main.py: Entry point for the FastAPI application.
        static/: Contains static files: assets, html, javascript, styling
        templates/: Jinja2Templates served by FastAPI
        tests/: Contains test cases.

    requirements.txt: Lists Python dependencies.

    Dockerfile: Instructions to build a Docker image for the backend.

### Root Directory

    docker-compose.yml: Configuration for Docker Compose to manage multi-container Docker applications.
    README.md: Documentation for the overall project.