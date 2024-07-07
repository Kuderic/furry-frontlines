import { Player } from './player.js';

export class PlayerManager {
    constructor() {
        this.players = {}; // Change from array to object (dictionary)
    }

    addPlayer(id, player) {
        console.log("Player added");
        this.players[id] = player;
        this.printPlayers();
    }

    getPlayers() {
        return this.players;
    }

    getPlayer(id) {
        return this.players[id];
    }

    removePlayer(id) {
        console.log("Player removed");
        delete this.players[id];
        this.printPlayers();
    }

    updatePlayer(id, x, y) {
        const player = this.getPlayer(id);
        if (player) {
            player.x = x;
            player.y = y;
        }
    }

    printPlayers() {
        console.log(this.players);
    }
}
