# Furry Frontlines XV (FF15)

Run in back-end
```
pip install -r requirements.txt
```

## Server

The server code is made using the FastAPI, Uvicorn, and Websocket libraries.

The server is meant to be hosted on an AWS EC2 virtual machine, but you can host it on your own machine, too. Just make sure that you open all the ports and connections correctly.

## Client

insert graphics libraries for javascript



## File Structure

Explanation of Directories and Files


### Backend

    app/: Main application directory.
        main.py: Entry point for the FastAPI application.
        routers/: Contains route definitions, separated by functionality (e.g., users, game).
        models/: Contains database models.
        schemas/: Contains Pydantic schemas for data validation.
        services/: Contains business logic and service layer code.
        utils/: Contains utility functions and helper modules.
        tests/: Contains test cases.

    requirements.txt: Lists Python dependencies.

    Dockerfile: Instructions to build a Docker image for the backend.

    .env: Environment variables for configuration.

    README.md: Documentation for the backend.

### Frontend

    public/: Contains static files like index.html.

    src/: Main source directory for the front-end code.
        assets/: Contains images, styles, and other static assets.
        components/: Contains React components.
        services/: Contains API service functions to communicate with the backend.
        utils/: Contains utility functions and helper modules.
        App.js: Main React component.
        index.js: Entry point for the React application.

    package.json: Lists JavaScript dependencies and scripts.

    webpack.config.js: Webpack configuration for bundling the front-end code.

    Dockerfile: Instructions to build a Docker image for the frontend.

    README.md: Documentation for the frontend.

### Root Directory

    docker-compose.yml: Configuration for Docker Compose to manage multi-container Docker applications.
    README.md: Documentation for the overall project.