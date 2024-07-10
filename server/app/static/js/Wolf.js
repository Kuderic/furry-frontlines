import { Character } from './Character.js';

export class Wolf extends Character {
    constructor(scene, x, y, speed, name) {
        super(scene, x, y, speed, name, 'wolf');
    }
}
