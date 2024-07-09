export class GrassGenerator {
    constructor(scene, numGrassTypes=1) {
        this.scene = scene;
        this.numGrassTypes = numGrassTypes;
    }

    generateGrass(density=0.00005) {
        const area = this.scene.physics.world.bounds.width * this.scene.physics.world.bounds.height;
        const numGrass = area * density;
        for (let i = 0; i < numGrass; i++) {
            const x = Phaser.Math.Between(0, this.scene.physics.world.bounds.width);
            const y = Phaser.Math.Between(0, this.scene.physics.world.bounds.height);
            const grassType = `grass${Phaser.Math.Between(1, this.numGrassTypes)}`; // Assuming you have 2 grass types
            const grass = this.scene.add.image(x, y, grassType);
            grass.setDisplaySize(300, 300);
            grass.setDepth(-1); // Set depth below the bunny layer
        }
    }
}
