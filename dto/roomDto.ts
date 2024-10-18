import { GameStatus } from "../game/enums/index.js";
import { Player } from "../game/player.js";
import { Room } from "../game/rooms.js";

export default class RoomDto {
  id: number;
  owner: Player;
  players: Player[];
  isStarted: boolean;
  maxPlayers: number = 5;
  numberOfTurns: number = 10;
  currentTurn: number;
  status: GameStatus;

  constructor(room: Room) {
    this.id = room.id;
    this.owner = room.owner;
    this.players = room.players;
    this.isStarted = room.isStarted;
    this.numberOfTurns = room.numberOfTurns;
    this.currentTurn = room.currentTurn;
    this.status = room.status;
  }
}
