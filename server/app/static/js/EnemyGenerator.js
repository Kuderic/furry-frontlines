import {Wolf} from './Wolf.js';

export class EnemyGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    createEnemy(x, y) {
        console.log("creating enemy");
        const wolf = new Wolf(this.scene, x, y, 300, 'Tyloki');
        this.scene.enemies.add(enemy.sprite);
        wolf.sprite.body.setCollideWorldBounds(true);
    }

    update() {
        // Update all the enemies
        const enemyList = this.scene.enemies.getChildren();
        // console.log(enemyList);
        if (enemyList.length === 0) {
            this.createEnemy(900, 900);
        }
        for (let i = 0; i < enemyList.length; i++) {
            enemyList[i].data.values.parent.update();
        }
    }
}
