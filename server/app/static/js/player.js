const RAND_COLOR = `hsl(${Math.random() * 360}, 80%, 80%)`;

export class Player {
    constructor(x, y, speed, name, color=RAND_COLOR) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.name = name;
        this.color = color;
    }
    // Method to move the player
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
