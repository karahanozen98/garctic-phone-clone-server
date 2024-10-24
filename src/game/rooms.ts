import { GameStatus, QuestType } from "./enums/index.js";
import { Player } from "./player.js";
import { Quest } from "./quest.js";
import { Turn } from "./turn.js";

export class Room {
  id: number;
  owner: Player;
  players: Player[];
  isStarted: boolean;
  maxPlayers: number = 5;
  numberOfTurns: number = 10;
  currentTurn: number;
  status: GameStatus;
  turns: Turn[];
  createdAt: number;

  constructor(
    id: number,
    owner: Player,
    maxPlayers: number,
    numberOfTurns: number
  ) {
    this.id = id;
    this.createdAt = Date.now();
    this.owner = owner;
    this.players = [owner];
    this.isStarted = false;
    this.maxPlayers = maxPlayers;
    this.numberOfTurns = numberOfTurns;
    this.currentTurn = 0;
    this.status = GameStatus.WaitingForStart;
    // TODO add game finish case
    this.turns = new Array(100).fill(0).map(() => new Turn());
  }

  isWaitingForSentences(): boolean {
    return (
      this.status === GameStatus.WaitingForInitialSentences ||
      this.status === GameStatus.WaitingForSentences
    );
  }

  isFirstTurn(): boolean {
    return this.currentTurn === 0;
  }

  getPreviousTurn() {
    if (this.currentTurn <= 0) {
      throw new Error("There is no previos turn");
    }
    return this.turns[this.currentTurn - 1];
  }

  getCurrentTurn() {
    return this.turns[this.currentTurn];
  }

  getNextPlayer(id: string) {
    const index = this.players.findIndex((p) => p.id === id);
    if (index + 1 === this.players.length) {
      return this.players[0];
    }
    return this.players[index + 1];
  }

  isAllQuestsReady() {
    return this.players.every((player) =>
      this.getCurrentTurn().quests.some(
        (quest) => quest.assignee.id === player.id
      )
    );
  }

  createNewQuest(type: QuestType, ownerId: string, content: string | []) {
    const quest = this.getCurrentTurn().quests.find(
      (q) => q.owner.id === ownerId
    );

    // if quest already exist just update content
    if (quest) {
      quest.content = content;
      return;
    }
    const parentQuest = this.getLatestQuest(ownerId);

    if (parentQuest) {
      parentQuest.isCompleted = true;
    }
    const owner = this.players.find((p) => p.id === ownerId);
    this.getCurrentTurn().quests.push(
      new Quest(
        type,
        owner,
        this.getNextPlayer(owner.id),
        content,
        parentQuest?.id
      )
    );
    owner.isReady = true;
  }

  completeCurrentTurn() {
    ++this.currentTurn;
    this.players.forEach((p) => (p.isReady = false));
    switch (this.status) {
      case GameStatus.WaitingForInitialSentences:
        this.status = GameStatus.WaitingForDrawings;
        break;
      case GameStatus.WaitingForSentences:
        this.status = GameStatus.WaitingForDrawings;
        break;
      case GameStatus.WaitingForDrawings:
        this.status = GameStatus.WaitingForSentences;
        break;
      default:
        break;
    }
  }

  getLatestQuest(playerId: string): Quest | null {
    if (this.currentTurn <= 0) {
      return null;
    }

    const previousTurn = this.getPreviousTurn();
    const quest = previousTurn.quests.find(
      (quest) => quest.assignee.id === playerId
    );

    return quest;
  }
}

export const rooms: Room[] = [];
