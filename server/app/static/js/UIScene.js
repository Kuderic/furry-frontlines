export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene'});
    }

    preload() {
    }

    create() {
        this.gameScene = this.scene.get('GameScene');
        // Create a UI camera
        this.uiCamera = this.cameras.add(0, 0, this.game.config.width, this.game.config.height);
        this.uiCamera.setScroll(0, 0); // Make sure it does not move

        // FPS Counter
        this.fpsText = this.add.bitmapText(75, 25, 'rainyhearts', '', 40).setOrigin(0.5);
        this.fpsText.setTint(0xff0000);
        this.cameras.main.ignore(this.fpsText);

        // Adding a mute button
        this.muteButton = this.add.image(50, 75, 'mute').setInteractive().setDisplaySize(50,50);
        this.muteButton.on('pointerup', () => {
            this.toggleSound();
        });
        // Set the cursor to 'pointer' when hovering over an interactive object
        this.muteButton.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
        });

        // Revert the cursor to 'default' when not hovering over the object
        this.muteButton.on('pointerout', () => {
            this.input.setDefaultCursor('default');
        });
    }
    

    update() {
        
        // Debug
        this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(0));
    }

    updateScore(score) {
        this.scoreText.setText('Score: ' + score);
    }
    
    toggleSound() {
        console.log("sound");
        this.gameScene.sound.mute = !this.gameScene.sound.mute;
        this.muteButton.setTexture(this.sound.mute ? 'unmute' : 'mute');
    }
}
