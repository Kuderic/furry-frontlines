export var phaserConfig = {
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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(phaserConfig);
let player;
let cursors;
let backgroundMusic;
let musicStarted = false; // Flag to check if music has started


function preload() {
    this.load.image('player', 'static/images/bunny1.png'); // Replace with your player image path
    this.load.audio('bgMusic', 'static/sounds/billie-eilish-meow.mp3'); // Load the background music
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();

    // Add and play background music
    backgroundMusic = this.sound.add('bgMusic');

    // Add a click listener to start the music
    this.input.once('pointerdown', () => {
        if (!musicStarted) {
            backgroundMusic.play({
                loop: true,
                volume: 0.25
            });
            musicStarted = true; // Update the flag
        }
    });

    // Also listen for keyboard interactions
    this.input.keyboard.on('keydown', () => {
        if (!musicStarted) {
            backgroundMusic.play({
                loop: true,
                volume: 0.25
            });
            musicStarted = true; // Update the flag
        }
    });
}

function update() {
    if (!player) return;

    let x = player.x;
    let y = player.y;

    if (cursors.left.isDown) {
        player.setVelocityX(-150);
    } else if (cursors.right.isDown) {
        player.setVelocityX(150);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-150);
    } else if (cursors.down.isDown) {
        player.setVelocityY(150);
    } else {
        player.setVelocityY(0);
    }

    if (player.x !== x || player.y !== y) {
        socket.send(JSON.stringify({
            type: 'move',
            id: player.id,
            x: player.x,
            y: player.y
        }));
    }
}
