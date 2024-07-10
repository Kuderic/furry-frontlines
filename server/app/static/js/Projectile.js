export class Projectile {
    constructor(scene, x, y, direction) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'projectile').setOrigin(0.5, 0.5);
        this.speed = 800;
        this.direction = direction;

        // Set the velocity based on direction
        scene.physics.velocityFromRotation(direction, this.speed, this.sprite.body.velocity);

        // Destroy the projectile after it travels a certain distance or time
        scene.time.delayedCall(1000, () => {
            this.sprite.destroy();
        });
    }
}
