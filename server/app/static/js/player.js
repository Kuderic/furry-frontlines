import { Character } from './Character.js';

const RAND_COLOR = `hsl(${Math.random() * 360}, 80%, 80%)`;

export class Player extends Character {
    constructor(scene, x, y, speed, name, hp=10, width=150, height=150) {
        // Create sprite
        const randBunnyTextureName = 'player' + String(Math.floor(Math.random() * 4));
        super(scene, x, y, speed, name, randBunnyTextureName, 10, width=width, height=height);
    }
}
