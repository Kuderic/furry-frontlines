import { Character } from './Character.js';

const RAND_COLOR = `hsl(${Math.random() * 360}, 80%, 80%)`;

export class Player extends Character {
    constructor(scene, x, y, speed, name, color = RAND_COLOR) {
        // Create sprite
        const randBunnyTextureName = 'player' + String(Math.floor(Math.random() * 3));
        super(scene, x, y, speed, name, randBunnyTextureName);
    }
}
