import {Wolf} from './Wolf.js';

export class EnemyGenerator {
    constructor(scene) {
        this.scene = scene;
        this.enemyList = [];
    }

    createEnemy(x, y) {
        const enemy = new Enemy(this, x, y, 300, 10, 'Tyloki');
        this.enemyList.push(enemy);
    }
}
