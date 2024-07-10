export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: true });
    }

    preload() {
        this.load.bitmapFont('rainyhearts', 'static/fonts/rainyhearts_0.png', 'static/fonts/rainyhearts.fnt');
    }

    create() {
        // Create a UI camera
        this.uiCamera = this.cameras.add(0, 0, this.game.config.width, this.game.config.height);
        this.uiCamera.setScroll(0, 0); // Make sure it does not move

        // FPS Counter
        this.fpsText = this.add.bitmapText(75, 25, 'rainyhearts', '', 40).setOrigin(0.5);
        this.fpsText.setTint(0xff0000);
        this.cameras.main.ignore(this.fpsText);
    }

    update() {
        
        // Debug
        this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(0));
    }

    updateScore(score) {
        this.scoreText.setText('Score: ' + score);
    }
}
