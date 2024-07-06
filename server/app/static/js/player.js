export class Player {
    constructor(x, y, speed, name) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.name = name;
        this.color = `hsl(${Math.random() * 360}, 80%, 80%)`;
    }
    // Method to move the player
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
}
