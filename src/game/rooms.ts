import { GameStatus, QuestType } from "./enums/index.js";
import { Player } from "./player.js";
import { Quest } from "./quest.js";
import ShowcaseItem from "./showcase.js";
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
  private shuffledPlayers: Player[];
  private showCaseTurn = 0;
  private showCaseUserIndex = 0;
  private showcase: ShowcaseItem[] = [];

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
    this.turns = new Array(numberOfTurns).fill(0).map(() => new Turn());
  }

  startGame() {
    this.isStarted = true;
    this.status = GameStatus.WaitingForInitialSentences;
    this.shufflePlayers();
  }

  startShowcase() {
    this.status = GameStatus.DrawingShowcase;
  }

  finishGame() {
    this.status = GameStatus.Finished;
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

  isLastTurn(): boolean {
    return this.currentTurn === this.numberOfTurns - 1;
  }

  isGameFinished(): boolean {
    return this.status === GameStatus.Finished;
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

  getRandomPlayer(id: string) {
    const index = this.shuffledPlayers.findIndex((p) => p.id === id);
    if (index + 1 === this.shuffledPlayers.length) {
      return this.shuffledPlayers[0];
    }

    return this.shuffledPlayers[index + 1];
  }

  isAllQuestsReady() {
    return this.players.every((player) =>
      this.getCurrentTurn().quests.some(
        (quest) => quest.assignee.id === player.id
      )
    );
  }

  createNewQuest(type: QuestType, ownerId: string, content: string | any[]) {
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
        this.getRandomPlayer(owner.id),
        content,
        parentQuest?.id
      )
    );
    owner.isReady = true;
  }

  completeCurrentTurn() {
    ++this.currentTurn;
    this.players.forEach((p) => (p.isReady = false));
    this.shufflePlayers();
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

  getShowCase(): ShowcaseItem[] {
    if (this.showCaseTurn === 0 && this.showcase.length <= 0) {
      const quest = this.turns[this.showCaseTurn].quests.find(
        (quest) => quest.owner.id === this.players[this.showCaseUserIndex].id
      );

      this.showcase.push(new ShowcaseItem(quest));
      return this.showcase;
    }

    return this.showcase;
  }

  moveToNextShowcase(): ShowcaseItem[] {
    const lastShowcaseItem = this.showcase.at(this.showcase.length - 1);
    const isLastTurn = this.showCaseTurn === this.numberOfTurns - 1;
    const isLastPlayer = this.showCaseUserIndex === this.players.length - 1;

    if (isLastTurn && isLastPlayer) {
      this.finishGame();
      return this.showcase;
    }

    // move to next player's showcase
    if (isLastTurn) {
      this.showcase = [];
      ++this.showCaseUserIndex;
      this.showCaseTurn = 0;
      return this.getShowCase();
    }

    ++this.showCaseTurn;
    const quest = this.turns[this.showCaseTurn].quests.find(
      (q) => q.parentQuestId === lastShowcaseItem.id
    );
    this.showcase.push(new ShowcaseItem(quest));
    return this.showcase;
  }

  private shufflePlayers() {
    const copyArr = [...this.players];
    let currentIndex = this.players.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [copyArr[currentIndex], copyArr[randomIndex]] = [
        copyArr[randomIndex],
        copyArr[currentIndex],
      ];
    }

    this.shuffledPlayers = copyArr;
  }
}

export const rooms: Room[] = [];
