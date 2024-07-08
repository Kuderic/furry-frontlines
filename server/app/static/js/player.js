const RAND_COLOR = `hsl(${Math.random() * 360}, 80%, 80%)`;

export class Player {
    constructor(sprite, speed, name, color=RAND_COLOR, nameTag) {
        this.sprite = sprite;
        this.speed = speed;
        this.name = name;
        this.color = color;
        this.nameTag = nameTag;
    }
    // Method to move the player
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
