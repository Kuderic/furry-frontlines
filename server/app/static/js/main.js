import { Player } from './player.js';

const NEW_PLAYER_SPEED = 300;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player;
        this.otherPlayers = {};
        this.myPlayerId = "";
        this.lastSentTime = 0;
        this.throttleInterval = 100; // 10 updates per second
        this.musicStarted = false; // Flag to check if music has started
    }
    preload() {
        this.load.image('player', 'static/images/bunny1.png'); // Replace with your player image path
        this.load.image('player1', 'static/images/bunny2.png'); // Replace with your player image path
        this.load.image('player2', 'static/images/bunny3.png'); // Replace with your player image path
        this.load.audio('bgMusic', 'static/sounds/billie-eilish-meow.mp3'); // Load the background music
    }
    
    create() {
        this.ws = this.createWebsocket();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.addBackgroundMusic();
        // Attach sendMessage to the window object
        window.sendMessage = this.sendMessage.bind(this);
    }
    
    update() {
        if (!this.player) return;

        const { cursors, player, ws, myPlayerId: myPlayerId, playerManager, lastSentTime, throttleInterval } = this;

        let x = this.player.sprite.x;
        let y = this.player.sprite.y;

        if (cursors.left.isDown) {
            player.sprite.setVelocityX(-1 * player.speed);
        } else if (cursors.right.isDown) {
            player.sprite.setVelocityX(1 * player.speed);
        } else {
            player.sprite.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            player.sprite.setVelocityY(-1 * player.speed);
        } else if (cursors.down.isDown) {
            player.sprite.setVelocityY(1 * player.speed);
        } else {
            player.sprite.setVelocityY(0);
        }

        if (player.sprite.body.velocity.x !== 0 ||
            player.sprite.body.velocity.y !== 0) {
            const currentTime = Date.now();
            if (currentTime - lastSentTime > throttleInterval && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'player_move',
                    id: myPlayerId,
                    x: player.sprite.x,
                    y: player.sprite.y
                }));
                this.lastSentTime = currentTime;
            }
        }
    }
    
    addBackgroundMusic() {
        // Add and play background music
        this.backgroundMusic = this.sound.add('bgMusic');
        // Add a click listener to start the music
        this.input.once('pointerdown', () => {
            if (!this.musicStarted) {
                this.backgroundMusic.play({
                    loop: true,
                    volume: 0.25
                });
                this.musicStarted = true; // Update the flag
            }
        });
        // Also listen for keyboard interactions
        this.input.keyboard.on('keydown', () => {
            if (!this.musicStarted) {
                this.backgroundMusic.play({
                    loop: true,
                    volume: 0.25
                });
                this.musicStarted = true; // Update the flag
            }
        });
    }

    drawPlayers() {
        const players = this.playerManager.getPlayers();
        for (const [client_id, player] of Object.entries(players)) {
            // Draw player logic here
        }
    }

    // NETWORKING FUNCTIONS
    
    createWebsocket() {
        // NETWORKING LOGIC
        // Determine WebSocket URL based on the environment
        let wsUrl;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            wsUrl = "ws://localhost:8000/ws"; // Local server
        } else {
            wsUrl = "wss://furryfrontiers.com/ws"; // Production server
        }
        let ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            console.log("WebSocket Connection Established");
        };
        ws.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        ws.onclose = (event) => {
            console.log("WebSocket Connection Closed", event);
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        return ws;
    }

    sendMessage(event) {
        console.log("SEND BUTTON CLICKED");
        event.preventDefault(); // Used to stop form reloading page
        const message = document.getElementById("messageInput").value;
        if (message) {
            const data = JSON.stringify({
                type: "chat_message",
                data: message
            });
            this.ws.send(data);
            document.getElementById("messageInput").value = ''; // Clear the input field after sending the message
        } else {
            alert("Please enter a message to send");
        }
        return false;
    }

    displayMessage(client_id, message) {
        let messagesList = document.getElementById("messagesList");
        let messageItem = document.createElement("li");
        messageItem.textContent = this.player.name + ': ' + message;
        messagesList.appendChild(messageItem);
    }

    handleMessage(data) {
        const message = JSON.parse(data);

        switch (message.type) {
            case "new_player": // message with client's character info
                const newPlayerData = message.player_data;

                // Create new Player object
                const randBunnyTextureName = 'player'+String(Math.round(Math.random()*3));
                const sprite = this.physics.add.sprite(newPlayerData.x, newPlayerData.y, randBunnyTextureName).setOrigin(0.5, 0.5).setDisplaySize(150, 150);
                const newPlayer = new Player(sprite, NEW_PLAYER_SPEED, newPlayerData.name, newPlayerData.color);
                
                // Store new player
                const newPlayerId = message.client_id;
                this.player = newPlayer;
                // this.otherPlayers[newPlayerId] = newPlayer;
                // Store id
                this.myPlayerId = newPlayerId;
                
                break;

            case "chat_message":
                this.displayMessage(message.client_id, message.data);
                break;

            case "update_players":
                const playersData = message.players_data;
                for (const [id, playerData] of Object.entries(playersData)) {
                    if (id === this.myPlayerId) {
                        continue;
                    }
                    if (this.otherPlayers[id]) {
                        // Update existing player position
                        this.otherPlayers[id].sprite.setPosition(playerData.x, playerData.y);
                    } else {
                        // Create new player
                        const randBunnyTextureName = 'player'+String(Math.round(Math.random()*3));
                        const sprite = this.physics.add.sprite(playerData.x, playerData.y, randBunnyTextureName).setOrigin(0.5, 0.5).setDisplaySize(150, 150);
                        const newPlayer = new Player(sprite, playerData.speed, playerData.name, playerData.color);
                        this.otherPlayers[id] = newPlayer;
                    }
                }
                console.log("update players");
                break;

            case "disconnect_player":
                console.log("disconnect_player_message received");
                // this.playerManager.removePlayer(message.client_id);
                break;

            default:
                console.log("Unknown message type. Message: ", message);
        }
    }
}

export const phaserConfig = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'canvasContainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [GameScene]
};

var game = new Phaser.Game(phaserConfig);

export default GameScene;
