import { Player } from './player.js';
import { PlayerManager } from './playerManager.js';

// Throttle updates to 10 times per second (10 Hz)
let lastSentTime = 0;
const throttleInterval = 100; // 100 ms = 10 updates per second

// Game logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let clientId = "";

// Create an instance of the PlayerManager class
const playerManager = new PlayerManager();

const heldKeys = {
    w: false,
    a: false,
    s: false,
    d: false
};

function updatePlayerPosition() {
    if (playerManager.getPlayers().length === 0) {
        console.log("no players found");
        requestAnimationFrame(updatePlayerPosition);
        return;
    }
    const player = playerManager.getPlayer(clientId);
    const starting_pos = {x: player.x, y: player.y}
    if (heldKeys.w) {
        player.y -= player.speed;
    }
    if (heldKeys.s) {
        player.y += player.speed;
    }
    if (heldKeys.a) {
        player.x -= player.speed;
    }
    if (heldKeys.d) {
        player.x += player.speed;
    }
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y > canvas.height) {
        player.y = canvas.height;
    }
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x > canvas.width) {
        player.x = canvas.width;
    }
    
    if (player.x !== starting_pos.x || player.y !== starting_pos.y) {
        // Send updated position to the server at 50hz max
        const currentTime = Date.now();
        if (currentTime - lastSentTime > throttleInterval && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'move',
                x: player.x,
                y: player.y
            }));
            lastSentTime = currentTime;
        }
    }
    drawPlayers();
    requestAnimationFrame(updatePlayerPosition);
}

document.addEventListener('keydown', (event) => {
    // console.log("keydown");
    if (event.key in heldKeys) {
        heldKeys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    // console.log("keyup");
    if (event.key in heldKeys) {
        heldKeys[event.key] = false;
    }
});

function drawPlayers() {
    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const players = playerManager.getPlayers();
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, 50, 50);
        ctx.strokeStyle = 'black';
        ctx.lineJoin = "bevel";
        ctx.lineWidth = 4;
        ctx.strokeRect(player.x-2, player.y-2, 52, 52);
    }
}

// WebSocket logic
// Determine WebSocket URL based on the environment
let wsUrl;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    wsUrl = "ws://localhost:8000/ws"; // Local server
} else {
    wsUrl = "wss://furryfrontiers.com/ws"; // Production server
}

let ws = new WebSocket(wsUrl);

ws.onopen = function() {
    console.log("WebSocket connection established");
};

ws.onmessage = function(event) {
    handleMessage(event.data)
};

ws.onclose = function(event) {
    console.log("WebSocket connection closed", event);
};

ws.onerror = function(error) {
    console.error("WebSocket error:", error);
};

// Parse websocket JSON message
function handleMessage(data) {
    let parsedData = JSON.parse(data);

    switch (parsedData.type) {

        case "client_id":
            clientId = parsedData.client_id;
            const player = new Player(canvas.width / 2, canvas.height / 2, 5, clientId);
            playerManager.addPlayer(player);
            break;

        case "chat_message":
            displayMessage(parsedData.client_id, parsedData.data);
            break;

        case "update_players":
            const players = parsedData.players;
            for (const [id, playerData] of Object.entries(players)) {
                if (playerManager.getPlayer(id)) {
                    playerManager.updatePlayer(id, playerData.x, playerData.y);
                } else {
                    const newPlayer = new Player(playerData.x, playerData.y, 5, id);
                    playerManager.addPlayer(newPlayer);
                }
            }
            break;

        case "disconnect_player":
            console.log("disconnect_player_message received");
            playerManager.removePlayer(parsedData.client_id);
            break;
            
        default:
            console.log("Unknown message type:", parsedData);
    }
}

// Form logic for chat box
function sendMessage(event) {
    event.preventDefault(); // Used to stop form reloading page
    let message = document.getElementById("messageInput").value;
    if (message) {
        let data = JSON.stringify({type: "chat_message", data: message});
        ws.send(data);
        document.getElementById("messageInput").value = ''; // Clear the input field after sending the message
    } else {
        alert("Please enter a message to send");
    }
    return false;
}
window.sendMessage = sendMessage; // Attach sendMessage to the window object to make it global

function displayMessage(client_id, message) {
    let messagesList = document.getElementById("messagesList");
    let messageItem = document.createElement("li");
    messageItem.textContent = client_id + ' says "' + message + '"';
    messagesList.appendChild(messageItem);
}

// Start the update loop
requestAnimationFrame(updatePlayerPosition);
drawPlayers();
