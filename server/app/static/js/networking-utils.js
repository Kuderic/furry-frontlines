
// NETWORKING LOGIC
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