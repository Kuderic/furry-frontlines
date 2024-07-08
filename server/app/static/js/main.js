import { Player } from './player.js';
// import rexvirtualjoystickplugin from './plugins/rexvirtualjoystickplugin.min.js';

const NEW_PLAYER_SPEED = 400;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.otherPlayers = {};
        this.myPlayerId = "";
        this.lastSentTime = 0;
        this.throttleInterval = 100; // 10 updates per second
        this.musicStarted = false; // Flag to check if music has started
    }
    preload() {
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
        // Attach sendMessage to the window object
        window.sendMessage = this.sendMessage.bind(this);
        this.ws = this.createWebsocket();
        this.cursors = this.input.keyboard.createCursorKeys();
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
            if (pointer.x <= this.cameras.main.width * 0.4) {
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
    }
    
    update() {
        if (!this.player) return;

        const { cursors, player, ws, myPlayerId: myPlayerId, playerManager, lastSentTime, throttleInterval } = this;

        let x = this.player.sprite.x;
        let y = this.player.sprite.y;

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

    displayMessage(playerId, message) {
        let messagesList = document.getElementById("messagesList");
        let messageItem = document.createElement("li");
        let name = "";
        if (playerId === this.myPlayerId) {
            name = this.player.name;
        } else {
            name = this.otherPlayers[playerId].name;
        }
        messageItem.textContent = name + ': ' + message;
        messagesList.appendChild(messageItem);
    }

    handleMessage(data) {
        const message = JSON.parse(data);

        switch (message.type) {
            case "new_player": // message with client's character info
                const newPlayerData = message.player_data;

                // Create new Player object
                const randBunnyTextureName = 'player'+String(Math.floor(Math.random()*3));
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
                        const randBunnyTextureName = 'player'+String(Math.floor(Math.random()*3));
                        const sprite = this.physics.add.sprite(playerData.x, playerData.y, randBunnyTextureName).setOrigin(0.5, 0.5).setDisplaySize(150, 150);
                        const newPlayer = new Player(sprite, playerData.speed, playerData.name, playerData.color);
                        this.otherPlayers[id] = newPlayer;
                    }
                }
                console.log("update players");
                break;

            case "disconnect_player":
                console.log("disconnect_player_message received");
                const disconnectId = message.client_id;
                this.otherPlayers[disconnectId].sprite.destroy(); // Destroy the sprite
                delete this.otherPlayers[disconnectId]; // Remove from dictionary
                break;

            default:
                console.log("Unknown message type. Message: ", message);
        }
    }
}

export const phaserConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
      activePointers: 3, // 2 is default for mouse + pointer, +1 is required for dual touch
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    transparent: true,
    scene: [GameScene]
};

const game = new Phaser.Game(phaserConfig);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

export default GameScene;
