import {Wolf} from './Wolf.js';

export class EnemyGenerator {
    constructor(scene) {
        this.scene = scene;
        this.enemyList = [];
    }

    createEnemy(x, y) {
        const enemy = new Wolf(this.scene, x, y, 300, 'Tyloki');
        this.enemyList.push(enemy);
    }

    update() {
        // Update all the enemies
        for (let i = 0; i < this.enemyList.length; i++) {
            this.enemyList[i].update();
        }
    }
}
