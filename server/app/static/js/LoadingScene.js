export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        // Add loading bar
        let loadingBar = this.add.graphics({
            fillStyle: { color: 0xffffff }
        });

        // Display loading progress
        this.load.on('progress', (percent) => {
            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
        });

        // Remove loading bar when complete
        this.load.on('complete', () => {
            loadingBar.destroy();
            this.scene.start('GameScene');
        });

        // Load assets
        this.load.audio('shootSound', 'static/sounds/laserShoot.wav');
        this.load.image('projectile', 'static/images/projectile.png');
        this.load.image('grass1', 'static/images/margarass.png');
        this.load.image('wolf', 'static/images/wolf.png');
        this.load.image('player0', 'static/images/bunny1.png'); // Replace with your player image path
        this.load.image('player1', 'static/images/bunny2.png'); // Replace with your player image path
        this.load.image('player2', 'static/images/bunny3.png'); // Replace with your player image path
        this.load.image('player3', 'static/images/bunny4.png'); // Replace with your player image path
        this.load.audio('bgMusic', 'static/sounds/billie-eilish-meow.mp3'); // Load the background music
        this.load.image('leftButton', 'static/images/leftButton.png'); // Load left button image
        this.load.image('rightButton', 'static/images/rightButton.png'); // Load right button image
        this.load.image('upButton', 'static/images/upButton.png'); // Load up button image
        this.load.image('downButton', 'static/images/downButton.png'); // Load down button image
        this.load.image('joystick', 'static/images/joystick.png');
        this.load.plugin('rexvirtualjoystickplugin',
            'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
        this.load.bitmapFont('rainyhearts', 'static/fonts/rainyhearts_0.png', 'static/fonts/rainyhearts.fnt');
        this.load.image('mute', 'static/images/mute.png');
        this.load.image('unmute', 'static/images/unmute.png');
    }

    create() {
        // You can add additional setup if needed here
    }
}
