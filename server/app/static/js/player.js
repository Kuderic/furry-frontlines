const RAND_COLOR = `hsl(${Math.random() * 360}, 80%, 80%)`;

export class Player {
    constructor(scene, x, y, speed, name, color = RAND_COLOR) {
        // Create sprite
        this.scene = scene;
        const randBunnyTextureName = 'player' + String(Math.floor(Math.random() * 3));
        const sprite = scene.physics.add.sprite(x, y, randBunnyTextureName).setOrigin(0.5, 0.5).setDisplaySize(125, 125);
        sprite.setCollideWorldBounds(true);

        // Create name tag
        const nameTag = scene.add.bitmapText(x, y - 200, 'rainyhearts', name, 40).setOrigin(0.5);

        // Create a graphics object for the bubble
        this.bubble = scene.add.graphics();
        this.bubble.fillStyle(0xffffff, 0.8);
        // Draw the bubble (e.g., a simple rectangle or rounded rectangle)
        this.bubble.fillRoundedRect(0, 0, 150, 50, 12);
        this.bubble.setVisible(false);  // Initially hidden
        // Create a text object for the message
        this.bubbleText = scene.add.bitmapText(0, 0, 'rainyhearts', '', 24);
        this.bubbleText.setVisible(false);
        this.bubble.setDepth(1);
        this.bubbleText.setDepth(1);

        this.sprite = sprite;
        this.speed = speed;
        this.name = name;
        this.color = color;
        this.nameTag = nameTag;
    }

    update() {
        // Update nametag position
        this.nameTag.setPosition(this.sprite.x, this.sprite.y - 20);

        if (this.bubble.visible) {
            // Keep the bubble positioned above the player
            this.bubbleText.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight / 2 - 60);

            this.bubble.setPosition(this.bubbleText.x - 5, this.bubbleText.y - 5);
        }
    }

    say(message) {
        this.bubble.setVisible(true);
        this.bubbleText.setText(message);
        this.bubbleText.setVisible(true);
        console.log(this.bubble.visible);

        // Position the text within the bubble
        this.bubbleText.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight / 2 - 60);

        // Position the bubble around the text
        this.bubble.setPosition(this.bubbleText.x - 5, this.bubbleText.y - 5);  // Some padding

        this.scene.time.delayedCall(3800, () => {
            this.bubble.setVisible(false);
            this.bubbleText.setVisible(false);
        }, [], this);
    }
}
