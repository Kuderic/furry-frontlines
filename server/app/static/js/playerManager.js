export class PlayerManager {
    constructor() {
        this.playerList = [];
    }

    addPlayer(player) {
        this.playerList.push(player);
    }

    getPlayers() {
        return this.playerList;
    }

    getPlayer(name) {
        return this.playerList.find(player => player.name === name);
    }

    removePlayer(name) {
        this.playerList = this.playerList.filter(player => player.name !== name);
    }

    updatePlayer(name, x, y) {
        const player = this.getPlayer(name);
        if (player) {
            player.x = x;
            player.y = y;
        }
    }
}
