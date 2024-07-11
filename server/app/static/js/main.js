import { Player } from './player.js';
import { GrassGenerator } from './grassGenerator.js';
import { UIScene } from './UIScene.js';
import { LoadingScene } from './LoadingScene.js';
import {EnemyGenerator} from './EnemyGenerator.js';

// import './plugins/phaser.js';
// import rexvirtualjoystickplugin from './plugins/rexvirtualjoystickplugin.min.js';

const NEW_PLAYER_SPEED = 400;
let WORLD_WIDTH = 3500;
let WORLD_HEIGHT = 3000;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.players = {};
        this.myPlayerId = "";
        this.lastSentTime = 0;
        this.lastShotTime = 0;
        this.throttleInterval = 200; // 5 updates per second
        this.musicStarted = false; // Flag to check if music has started
        this.lastSentPlayerInfo = {}; // keep track of player state on server. if doesnt match, then send 
        this.shootDelay = 250; // Delay in milliseconds between shots
        this.isMobile = isMobile();
    }
    preload() {
        // Done in LoadingScene
    }
    
    create() {
        messageInput.addEventListener('focus', this.onMessageInputFocus.bind(this));
        messageInput.addEventListener('blur', this.onMessageInputBlur.bind(this));
        // Disable context menu
        this.input.mouse.disableContextMenu();
        // Attach sendMessage to the window object
        window.sendMessage = this.sendMessage.bind(this);
        window.stopPropagation = this.stopPropagation;
        // Launch the UI Scene alongside the Main Scene
        this.scene.launch('UIScene');
        // Access the UI scene
        this.uiScene = this.scene.get('UIScene');

        // Set world and camera bounds
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setBounds(-50, -50, WORLD_WIDTH + 50, WORLD_HEIGHT + 50);
        this.cameras.main.setScroll(WORLD_WIDTH / 2, WORLD_HEIGHT / 2); // Center the camera initially
        // this.scale.on('resize', this.resize, this);

        // Generate grass under the bunny layer
        this.grassGenerator = new GrassGenerator(this); // Adjust density as needed
        this.grassGenerator.generateGrass();

        // Create physics groups
        this.projectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();

        // Add collision detection between projectiles and enemies
        this.physics.add.collider(this.projectiles, this.enemies, this.hitCharacter, null, this);

        // Create enemies
        this.enemyGenerator = new EnemyGenerator(this);
        
        // Create websocket
        this.ws = this.createWebsocket();

        // Handlers
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        // Add right-click handling
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.pointer = pointer;
                this.shouldShoot = true;
            }
        });
        this.input.on('pointerup', () => {
            this.shouldShoot = false;
        });

        // Add sounds
        this.shootSound = this.sound.add('shoot');
        this.addBackgroundMusic();

        // Create movement joystick
        if (this.isMobile) {
            this.createJoysticks();
        }
        
        window.addEventListener('blur', this.onBlur.bind(this));
        window.addEventListener('focus', this.onFocus.bind(this));
    }

    addKeyboardListeners() {
        this.input.keyboard.addCapture([
            Phaser.Input.Keyboard.KeyCodes.A,
            Phaser.Input.Keyboard.KeyCodes.D,
            Phaser.Input.Keyboard.KeyCodes.W,
            Phaser.Input.Keyboard.KeyCodes.S
        ]);
    }

    onMessageInputFocus() {
        this.input.keyboard.clearCaptures(); // Clear all keyboard listeners
        console.log('Phaser keyboard input disabled');
    }

    onMessageInputBlur() {
        this.addKeyboardListeners();
        console.log('Phaser keyboard input enabled');
    }
    
    hitCharacter(projectileSprite, characterSprite) {
        console.log(projectileSprite, characterSprite);

        // Trigger effect, e.g., reduce HP
        const character = characterSprite.data.values.parent;
        character.takeDamage(1);

        // Destroy the projectile
        const projectile = projectileSprite.data.values.parent;
        projectile.destroy();

        // Optionally, add other effects like playing a sound or animation
        console.log(`${character.name} hit! HP: ${character.currentHp}`);
    }

    createJoysticks() {
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
            if (pointer.leftButtonDown() &&
                pointer.x <= this.cameras.main.width * 0.7) {
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
    
    update(time) {

        if (!this.player) return;

        this.calculatePlayerVelocity();
        this.enemyGenerator.update();
        
        // Update all the players
        Object.keys(this.players).forEach(id => {
                this.players[id].update();
            }
        );

        // Shooting logic
        if (this.shouldShoot && time > this.lastShotTime + this.shootDelay) {
            console.log("shooting");
            this.player.shootProjectile(this.pointer.worldX, this.pointer.worldY);
            this.shootSound.play({
                loop: false,
                volume: 0.75
            });
            
            console.log(this.projectiles.getChildren());
            this.lastShotTime = time;
        }
    }

    calculatePlayerVelocity() {
        const { cursors, player, ws, myPlayerId: myPlayerId, lastSentTime, throttleInterval } = this;


        // Handle player movement with arrow keys
        if (this.keyLeft.isDown) {
            this.player.sprite.setVelocityX(-this.player.speed);
        } else if (this.keyRight.isDown) {
            this.player.sprite.setVelocityX(this.player.speed);
        } else {
            this.player.sprite.setVelocityX(0);
        }

        if (this.keyUp.isDown) {
            this.player.sprite.setVelocityY(-this.player.speed);
        } else if (this.keyDown.isDown) {
            this.player.sprite.setVelocityY(this.player.speed);
        } else {
            this.player.sprite.setVelocityY(0);
        }


        // Joystick movement
        let forceX = 0
        let forceY = 0;

        if (this.isMobile) {
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
        }

        if (player.sprite.body.velocity.x !== this.lastSentPlayerInfo.velocity_x ||
            player.sprite.body.velocity.y !== this.lastSentPlayerInfo.velocity_y) {
            const currentTime = Date.now();
            if (currentTime - lastSentTime > throttleInterval && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'player_move',
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
        messageItem.textContent = `[${timestamp}] ${message}`;
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
                this.cameras.main.startFollow(this.player.sprite, true, 0.1, .1); // Make the camera follow the player
                // Make fpsText ignore camera movements
                break;

            case "chat_message":
                this.displayMessage(message.client_id, message.data);
                scrollToBottom();
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
                this.players[disconnectId].destroy();
                delete this.players[disconnectId]; // Remove from dictionary
                break;

            default:
                console.log("Unknown message type. Message: ", message);
        }
    }
}
document.getElementById('messageInput').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.getElementById('chatBox').addEventListener('wheel', function(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('messagesList').scrollTop += event.deltaY;
});

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

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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
    scene: [LoadingScene, GameScene, UIScene]
};

const game = new Phaser.Game(phaserConfig);

export default GameScene;
