import { Player } from './player.js';

// Throttle updates to 10 times per second (10 Hz)
let lastSentTime = 0;
const throttleInterval = 100; // 100 ms = 10 updates per second

// Game logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Create an instance of the Player class
let player = new Player(canvas.width / 2, canvas.height / 2, 5, "Player1");
const playerList = [player];

const heldKeys = {
    w: false,
    a: false,
    s: false,
    d: false
};

function updatePlayerPosition() {
    player = playerList[0]
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
    for (let i = 0; i < playerList.length; i++) {
        player = playerList[0];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, 50, 50);
        ctx.strokeStyle = 'black';
        ctx.shadowColor = "#d53";
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
    wsUrl = "ws://ec2-3-133-93-0.us-east-2.compute.amazonaws.com:8000/ws"; // Production server
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
    console.log("received server message " + parsedData);
    if (parsedData.type === "chat_message") {
        console.log('is chat message')
        displayMessage(parsedData.sender_ip, parsedData.data)
    }
    else if (parsedData.type === "update") {
        player.x = parsedData.x;
        player.y = parsedData.y;
    } else {
        console.log('idk what kind of message this is')
    }
}

// Send message button logic
function sendMessage() {
    let message = document.getElementById("messageInput").value;
    if (message) {
        let data = JSON.stringify({type: "chat_message", data: message});
        ws.send(data);
        document.getElementById("messageInput").value = ''; // Clear the input field after sending the message
    } else {
        alert("Please enter a message to send");
    }
}
window.sendMessage = sendMessage; // Attach sendMessage to the window object to make it global

function displayMessage(ip, message) {
    let messagesList = document.getElementById("messagesList");
    let messageItem = document.createElement("li");
    messageItem.textContent = ip+' says "'+message+'"';
    messagesList.appendChild(messageItem);
}

// Start the update loop
requestAnimationFrame(updatePlayerPosition);
drawPlayers();
