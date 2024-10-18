export class Game {
  isStarted: boolean = false;
  users: User[] = [];

  constructor() {}

  addUser(user: User) {
    this.users.push(user);
  }
}

export class User {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class Room {
  id: number;
  owner: User;
  players: User[];
  isStarted: boolean;
  maxPlayers: number = 5;
  numberOfTurns: number = 10;
  status: GameStatus;

  constructor(
    id: number,
    owner: User,
    maxPlayers: number,
    numberOfTurns: number
  ) {
    this.id = id;
    this.owner = owner;
    this.players = [owner];
    this.isStarted = false;
    this.maxPlayers = maxPlayers;
    this.numberOfTurns = numberOfTurns;
    this.status = GameStatus.WaitingForStart;
  }
}

enum GameStatus {
  WaitingForStart,
  WaitingForSentences,
  WaitingForDrawings,
}
