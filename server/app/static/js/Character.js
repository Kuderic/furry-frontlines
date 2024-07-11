import { Projectile } from './Projectile.js';

// pls dont instantiate this directly
export class Character {
    constructor(scene, x, y, speed, name, texture, maxHealth=10, width=125, height=125) {
        this.scene = scene;
        // Create sprite
        let sprite = scene.physics.add.sprite(x, y, texture).setOrigin(0.5, 0.5).setDisplaySize(width, height);
        this.sprite = sprite;
        this.sprite.setDepth(1);
        sprite.body.setCollideWorldBounds(true);
        this.sprite.setDataEnabled();
        this.sprite.data.set('parent', this);

        // Create name tag
        const nameTag = scene.add.bitmapText(x, y - 200, 'rainyhearts', name, 40).setOrigin(0.5);
        this.scene = scene;
        this.speed = speed;
        this.name = name;
        this.nameTag = nameTag;
        this.nameTag.setDepth(3);

        // Create a graphics object for the bubble
        this.bubble = scene.add.graphics();
        this.bubble.fillStyle(0xffffff, 0.8);
        // Draw the bubble (e.g., a simple rectangle or rounded rectangle)
        this.bubble.fillRoundedRect(0, 0, 150, 50, 12);
        this.bubble.setVisible(false);  // Initially hidden
        // Create a text object for the message
        this.bubbleText = scene.add.bitmapText(0, 0, 'rainyhearts', '', 24);
        this.bubbleText.setVisible(false);
        this.bubble.setDepth(10);
        this.bubbleText.setDepth(11);

        // RPG stats
        this.maxHealth = maxHealth;
        this.currentHealth = this.maxHealth;

        // Create health bar
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(2);

        this.drawHealthBar();
    }

    update() {
        // Update nametag position
        this.nameTag.setPosition(this.sprite.x, this.sprite.y - 20);

        if (this.bubble.visible) {
            // Keep the bubble positioned above the player
            this.bubbleText.setPosition(this.sprite.x, this.sprite.y - this.sprite.displayHeight / 2 - 60);

            this.bubble.setPosition(this.bubbleText.x - 5, this.bubbleText.y - 5);
        }

        // Update health bar position and size
        this.drawHealthBar();
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


    drawHealthBar() {
        this.healthBar.clear();

        // Define the size and position of the health bar
        const barWidth = 100;
        const barHeight = 10;
        const barX = this.sprite.x - barWidth / 2;
        const barY = this.sprite.y - this.sprite.displayHeight / 2 - 30;

        // Calculate health bar width based on current Health
        const healthWidth = (this.currentHealth / this.maxHealth) * barWidth;

        // Draw the background (empty part of the health bar)
        this.healthBar.fillStyle(0xff0000, 0.5);
        this.healthBar.fillRect(barX, barY, barWidth, barHeight);

        // Draw the foreground (filled part of the health bar)
        this.healthBar.fillStyle(0x00ff00, 0.8);
        this.healthBar.fillRect(barX, barY, healthWidth, barHeight);
    }
    
    shootProjectile(targetX, targetY) {
        const direction = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, targetX, targetY);
        const p = new Projectile(this.scene, this.sprite.x, this.sprite.y, direction);
        console.log(p.sprite.body.velocity);
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
        this.drawHealthBar();

        if (this.currentHealth <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
        this.nameTag.destroy();
        this.healthBar.destroy();
        this.bubble.destroy();
        this.bubbleText.destroy();

        this.scene.characters.remove(this.sprite);
    }
}
