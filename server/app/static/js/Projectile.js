export class Projectile {
    constructor(scene, x, y, direction) {
        this.scene = scene;
        this.speed = 800;
        this.direction = direction;

        this.sprite = scene.physics.add.sprite(x, y, 'projectile').setOrigin(0.5, 0.5);
        // Add to characters physics group 
        this.scene.projectiles.add(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.setDataEnabled();
        this.sprite.data.set('parent', this);

        // Set the velocity based on direction
        const velocity = scene.physics.velocityFromRotation(direction, this.speed);

        // Set the velocity
        this.sprite.setVelocity(velocity.x, velocity.y);

        // Destroy the projectile after it travels a certain distance or time
        scene.time.delayedCall(1000, () => {
            this.destroy();
        });
        

        // Log the group contents after adding the projectile
        // console.log(this.scene.projectiles.getChildren());
    }

    destroy() {
        this.sprite.destroy();
        this.scene.projectiles.remove(this.sprite);
    }
}
