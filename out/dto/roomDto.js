export default class RoomDto {
    constructor(room) {
        this.maxPlayers = 5;
        this.numberOfTurns = 10;
        this.id = room.id;
        this.owner = room.owner;
        this.players = room.players;
        this.isStarted = room.isStarted;
        this.numberOfTurns = room.numberOfTurns;
        this.currentTurn = room.currentTurn;
        this.status = room.status;
    }
}
