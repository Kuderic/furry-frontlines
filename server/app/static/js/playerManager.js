export class PlayerManager {
    constructor() {
        this.playerList = [];
    }

    addPlayer(player) {
        console.log("Player added");
        this.playerList.push(player);
        this.printPlayers();
    }

    getPlayers() {
        return this.playerList;
    }

    getPlayer(name) {
        return this.playerList.find(player => player.name === name);
    }

    removePlayer(name) {
        console.log("Player removed");
        this.playerList = this.playerList.filter(player => player.name !== name);
        this.printPlayers();
    }

    updatePlayer(name, x, y) {
        const player = this.getPlayer(name);
        if (player) {
            player.x = x;
            player.y = y;
        }
    }

    printPlayers() {
        console.log(this.playerList);
    }
}
