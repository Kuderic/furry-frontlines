// import './plugins/phaser.js';

const RAND_COLOR = `hsl(${Math.random() * 360}, 80%, 80%)`;

export class Player {
    constructor(scene, x, y, speed, name, color=RAND_COLOR) {
        // Create sprite
        const randBunnyTextureName = 'player'+String(Math.floor(Math.random()*3));
        const sprite = scene.physics.add.sprite(x, y, randBunnyTextureName).setOrigin(0.5, 0.5).setDisplaySize(125, 125);
        sprite.setCollideWorldBounds(true)
        
        // Create name tag
        const nameTag = scene.add.bitmapText(x, y - 200, 'rainyhearts', name, 40).setOrigin(0.5);

        this.sprite = sprite;
        this.speed = speed;
        this.name = name;
        this.color = color;
        this.nameTag = nameTag;
    }
}
