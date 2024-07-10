import { Player } from './player.js';
import { GrassGenerator } from './grassGenerator.js';
import { UIScene } from './UIScene.js';
// import './plugins/phaser.js';
// import rexvirtualjoystickplugin from './plugins/rexvirtualjoystickplugin.min.js';

const NEW_PLAYER_SPEED = 400;
let WORLD_WIDTH = 2500;
let WORLD_HEIGHT = 2000;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.players = {};
        this.myPlayerId = "";
        this.lastSentTime = 0;
        this.throttleInterval = 50; // 10 updates per second
        this.musicStarted = false; // Flag to check if music has started
        this.lastSentPlayerInfo = {}; // keep track of player state on server. if doesnt match, then send 
    }
    preload() {
        this.load.image('grass1', 'static/images/margarass.png');
        this.load.image('player0', 'static/images/bunny1.png'); // Replace with your player image path
        this.load.image('player1', 'static/images/bunny2.png'); // Replace with your player image path
        this.load.image('player2', 'static/images/bunny3.png'); // Replace with your player image path
        this.load.audio('bgMusic', 'static/sounds/billie-eilish-meow.mp3'); // Load the background music
        this.load.image('leftButton', 'static/images/leftButton.png'); // Load left button image
        this.load.image('rightButton', 'static/images/rightButton.png'); // Load right button image
        this.load.image('upButton', 'static/images/upButton.png'); // Load up button image
        this.load.image('downButton', 'static/images/downButton.png'); // Load down button image
        this.load.image('joystick', 'static/images/joystick.png');
        this.load.plugin('rexvirtualjoystickplugin',
            'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);

    }
    
    create() {
        // Access the UI scene
        this.uiScene = this.scene.get('UIScene');

        this.createChatBox();

        // Set world and camera bounds
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.scale.on('resize', this.resize, this);

        // Create graphics
        this.graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xff00ff }, fillStyle: { color: 0xff00ff } });
        this.arrowGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });

        // Generate grass under the bunny layer
        const gg = new GrassGenerator(this); // Adjust density as needed
        gg.generateGrass();

        // Attach sendMessage to the window object
        window.sendMessage = this.sendMessage.bind(this);
        window.stopPropagation = this.stopPropagation;
        
        // Create websocket
        this.ws = this.createWebsocket();

        this.cursors = this.input.keyboard.createCursorKeys();
        if (this.cursors.space) {
            console.log("removing listeners");
            this.input.keyboard.clearCaptures();
        }

        this.addBackgroundMusic();

        // Create movement joystick
        this.movementJoyStick = this.plugins.get('rexvirtualjoystickplugin').add(this.scene, {
            x: 100,
            y: this.cameras.main.height - 125,
            radius: 40,
            forceMin: 0,
            base: this.add.circle(0, 0, 60, 0x888888).setDepth(100).setAlpha(0.25),
            thumb: this.add.image(0, 0, 'joystick').setDisplaySize(80, 80).setDepth(100).setAlpha(0.5),
        }).on('update', () => {}, this)
        

        // Move joysticks dynamically based on pointer-down
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x <= this.cameras.main.width * 0.7) {
                this.movementJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(0.5)
                this.movementJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(1)
            }
        })

        // Add transparency to joysticks on pointer-up
        this.input.on('pointerup', (pointer) => {
            if (!this.movementJoyStick.force) {
                this.movementJoyStick.base.setAlpha(0.15)
                this.movementJoyStick.thumb.setAlpha(0.35)
            }
        })
        
        window.addEventListener('blur', this.onBlur.bind(this));
        window.addEventListener('focus', this.onFocus.bind(this));
    }

    onBlur() {
        // Method to handle when the game window loses focus
        this.input.keyboard.enabled = false;  // Disable keyboard input
        // Optionally, you might want to pause the game
        // this.scene.pause();
        console.log('Game paused because it lost focus');
    }

    onFocus() {
        // Method to handle when the game window gains focus
        this.input.keyboard.enabled = true;  // Re-enable keyboard input
        // Optionally, you might want to resume the game
        // this.scene.resume();
        console.log('Game resumed on focus');
    }

    createChatBox() {
        // // Create a graphics object for the chat box background
        // let chatBox = this.add.graphics();
        // chatBox.fillStyle(0x000000, 0.5); // Set the color and transparency
        // chatBox.fillRect(10, this.cameras.main.height - 110, 300, 100); // Position and size

        // // Add static text as a placeholder
        // this.chatText = this.add.text(15, this.cameras.main.height - 105, '', { font: '16px Arial', color: '#FFFFFF' });
        // this.input.keyboard.on('keydown', event => {
        //     this.handleChatInput(event);
        // });
        
        // this.cameras.main.ignore(chatBox);
        // this.cameras.main.ignore(this.chatText);
    }
    
    resize(gameSize, baseSize, displaySize, resolution) {
        const width = gameSize.width;
        const height = gameSize.height;
    
        this.cameras.resize(width, height);
    
        // If you have UI elements or other game objects that need manual adjustment:
        // this.yourUIElement.setPosition(width / 2, height - 50); // Example: reposition an element
    }
    
    update() {

        if (!this.player) return;

        this.calculatePlayerVelocity();
        
        // Update all the players
        Object.keys(this.players).forEach(id => {
                this.players[id].update();
            }
        );
        // this.graphics.clear();
        // Object.keys(this.players).forEach(id => {
        //     const player = this.players[id];
        //     const bbox = player.sprite.getBounds();
        //     this.graphics.strokeRectShape(bbox);
        //     const tagBox = player.nameTag.getBounds();
        //     this.graphics.strokeRectShape(tagBox);
        // });

        // Draw player direction indicator
        // Assuming 'player' is your player sprite
        const player = this.player;
        const angle = player.rotation; // Player's current rotation in radians

        // Clear previous graphics
        this.arrowGraphics.clear();

        // Draw arc around the player
        this.arrowGraphics.strokeCircle(player.x, player.y, 50); // Draw a circle with radius 50 pixels

        // Calculate arrow points based on player's angle
        const endX = player.x + 100 * Math.cos(angle); // Extend the arrow out 60 pixels from player
        const endY = player.y + 100 * Math.sin(angle);
        const startX = player.x + 100 * Math.cos(angle); // Start the arrow a bit away from player center
        const startY = player.y + 100 * Math.sin(angle);

        // Draw the line for the arrow
        this.arrowGraphics.lineBetween(startX, startY, endX, endY);

        // Draw arrow head
        const arrowAngle = 0.5; // Angle of the arrow head in radians
        const arrowLength = 10; // Length of the sides of the arrow head
        this.arrowGraphics.lineBetween(endX, endY,
            endX - arrowLength * Math.cos(angle - arrowAngle), endY - arrowLength * Math.sin(angle - arrowAngle));
        this.arrowGraphics.lineBetween(endX, endY,
            endX - arrowLength * Math.cos(angle + arrowAngle), endY - arrowLength * Math.sin(angle + arrowAngle));
    }

    calculatePlayerVelocity() {
        const { cursors, player, ws, myPlayerId: myPlayerId, lastSentTime, throttleInterval } = this;

        if (cursors.left.isDown || this.moveLeft) {
            player.sprite.setVelocityX(-1 * player.speed);
        } else if (cursors.right.isDown || this.moveRight) {
            player.sprite.setVelocityX(1 * player.speed);
        } else {
            player.sprite.setVelocityX(0);
        }

        if (cursors.up.isDown || this.moveUp) {
            player.sprite.setVelocityY(-1 * player.speed);
        } else if (cursors.down.isDown || this.moveDown) {
            player.sprite.setVelocityY(1 * player.speed);
        } else {
            player.sprite.setVelocityY(0);
        }

        // Joystick movement
        let forceX = 0
        let forceY = 0;

        if (this.movementJoyStick.forceX > 0) {
            forceX = Math.min(this.movementJoyStick.forceX / 100, 1);
        } else if (this.movementJoyStick.forceX < 0) {
            forceX = Math.max(this.movementJoyStick.forceX / 100, -1);
        }
        if (this.movementJoyStick.forceY > 0) {
            forceY = Math.min(this.movementJoyStick.forceY / 100, 1);
        } else if (this.movementJoyStick.forceY < 0) {
            forceY = Math.max(this.movementJoyStick.forceY / 100, -1);
        }
        // console.log(forceX, forceY);

        if (forceX || forceY) {
            player.sprite.setVelocityX(forceX * player.speed);
            player.sprite.setVelocityY(forceY * player.speed);
        }

        if (player.sprite.body.velocity.x !== this.lastSentPlayerInfo.velocity_x ||
            player.sprite.body.velocity.y !== this.lastSentPlayerInfo.velocity_y) {
            const currentTime = Date.now();
            if (currentTime - lastSentTime > throttleInterval && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'player_move',
                    id: myPlayerId,
                    x: player.sprite.x,
                    y: player.sprite.y,
                    velocity_x: player.sprite.body.velocity.x,
                    velocity_y: player.sprite.body.velocity.y
                }));
                
                this.lastSentPlayerInfo = {
                    x: player.sprite.x,
                    y: player.sprite.y,
                    velocity_x: player.sprite.body.velocity.x,
                    velocity_y: player.sprite.body.velocity.y
                }
                
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
        }
        return false;
    }

    displayMessage(playerId, message) {
        this.players[playerId].say(message);

        let messagesList = document.getElementById("messagesList");
        let messageItem = document.createElement("li");
        let name = this.players[playerId].name;
    
        // Create a timestamp
        let timestamp = new Date().toLocaleTimeString(); // This gives you a human-readable time format
    
        // Include the timestamp in the message text
        messageItem.textContent = `[${timestamp}] ${name}: ${message}`;
    
        // Append the message item to the list
        messagesList.appendChild(messageItem);
        messageItem.className = "chatMessage";
        messagesList.addEventListener('wheel', function(event) {
            event.preventDefault();
            document.getElementById('messagesList').scrollTop += event.deltaY;
        });
    
        // Call to remove the message item after a delay (10 seconds)
        // removeElementAfterDelay(messageItem, 10000);
        scrollToBottom();
    }

    displayServerMessage(message) {
        let messagesList = document.getElementById("messagesList");
        let messageItem = document.createElement("li");
        messageItem.className = "serverMessage";
        // Create a timestamp
        let timestamp = new Date().toLocaleTimeString(); // This gives you a human-readable time format
        // Include the timestamp in the message text
        messageItem.textContent = `[${timestamp}]: ${message}`;
        // Append the message item to the list
        messagesList.appendChild(messageItem);
        scrollToBottom();
    }

    handleMessage(data) {
        const message = JSON.parse(data);
        // console.log(message);

        switch (message.type) {
            case "new_player": // message with client's character info
                const newPlayerData = message.player_data;

                // Create new Player object
                const newPlayer = new Player(this, newPlayerData.x, newPlayerData.y, NEW_PLAYER_SPEED, newPlayerData.name, newPlayerData.color);
                
                // Store new player
                const newPlayerId = message.client_id;
                this.myPlayerId = newPlayerId;
                this.player = newPlayer;
                this.players[this.myPlayerId] = newPlayer;
                this.displayServerMessage(`${newPlayerData.name} has connected.`)
                
                // // Set up the camera
                // this.cameras.main.setBounds(0, 0, WORLD_HEIGHT, WORLD_WIDTH); // Set the boundaries of the camera
                this.cameras.main.startFollow(this.player.sprite, true, 0.1, .1); // Make the camera follow the player
                // Make fpsText ignore camera movements
                break;

            case "chat_message":
                this.displayMessage(message.client_id, message.data);
                break;

            case "update_players":
                const playersData = message.players_data;
                for (const [id, playerData] of Object.entries(playersData)) {
                    if (this.players[id]) {
                        // Update existing player position
                        if (id === this.myPlayerId) {
                            continue;
                        }
                        this.players[id].sprite.setPosition(playerData.x, playerData.y);
                        this.players[id].sprite.setVelocityX(playerData.velocity_x);
                        this.players[id].sprite.setVelocityY(playerData.velocity_y);
                    } else {
                        // Create new player
                        const newPlayer = new Player(this, playerData.x, playerData.y, NEW_PLAYER_SPEED, playerData.name, playerData.color);
                        this.players[id] = newPlayer;
                        this.displayServerMessage(`${playerData.name} has connected.`)
                    }
                }
                break;

            case "disconnect_player":
                console.log("disconnect_player_message received");
                const disconnectId = message.client_id;
                this.displayServerMessage(`${this.players[disconnectId].name} has disconnected.`)
                this.players[disconnectId].sprite.destroy(); // Destroy the sprite
                this.players[disconnectId].nameTag.destroy(); // Destroy the sprite
                delete this.players[disconnectId]; // Remove from dictionary
                break;

            default:
                console.log("Unknown message type. Message: ", message);
        }
    }
}

document.getElementById('chatBox').addEventListener('wheel', function(event) {
    document.getElementById('messagesList').scrollTop += event.deltaY;
});

export const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.RESIZE,  // Adjust to RESIZE to have the canvas resize dynamically
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas in the parent
    },
    input: {
      activePointers: 3, // 2 is default for mouse + pointer, +1 is required for dual touch
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    fps: {
        min: 10,
        target: 165,
        forceSetTimeOut: false,
        deltaHistory: 10,
        panicMax: 120
    },
    transparent: true,
    scene: [GameScene, UIScene]
};

function removeElementAfterDelay(element, delay) {
    setTimeout(() => {
        if (element) {
            element.parentNode.removeChild(element);
        }
    }, delay);
}

function scrollToBottom() {
    const messagesList = document.getElementById('messagesList');
    messagesList.scrollTop = messagesList.scrollHeight;
}

const game = new Phaser.Game(phaserConfig);

export default GameScene;
