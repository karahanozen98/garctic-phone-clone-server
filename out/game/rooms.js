import { GameStatus, QuestType } from "./enums/index.js";
import { Quest } from "./quest.js";
import { Turn } from "./turn.js";
export class Room {
    constructor(id, owner, maxPlayers, numberOfTurns) {
        this.maxPlayers = 5;
        this.numberOfTurns = 10;
        this.id = id;
        this.owner = owner;
        this.players = [owner];
        this.isStarted = false;
        this.maxPlayers = maxPlayers;
        this.numberOfTurns = numberOfTurns;
        this.currentTurn = 0;
        this.status = GameStatus.WaitingForStart;
        this.turns = new Array(numberOfTurns).fill(0).map(() => new Turn());
    }
    isWaitingForSentences() {
        return (this.status === GameStatus.WaitingForInitialSentences ||
            this.status === GameStatus.WaitingForSentences);
    }
    isFirstTurn() {
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
    getNextPlayer(id) {
        const index = this.players.findIndex((p) => p.id === id);
        if (index + 1 === this.players.length) {
            return this.players[0];
        }
        return this.players[index + 1];
    }
    isAllQuestsReady() {
        return this.players.every((player) => this.getCurrentTurn().quests.some((quest) => quest.assignee.id === player.id));
    }
    isAllQuestsCompleted() {
        return this.getPreviousTurn().quests.every((q) => q.isCompleted);
    }
    createNewSentenceQuest(owner, content) {
        this.getCurrentTurn().quests.push(new Quest(QuestType.Sentence, owner, this.getNextPlayer(owner.id), content));
    }
    createNewDrawingQuest(owner, content) {
        this.getCurrentTurn().quests.push(new Quest(QuestType.Drawing, owner, this.getNextPlayer(owner.id), content));
    }
    completeCurrentTurn() {
        switch (this.status) {
            case GameStatus.WaitingForInitialSentences:
                this.status = GameStatus.WaitingForDrawings;
                ++this.currentTurn;
                break;
            case GameStatus.WaitingForSentences:
                this.status = GameStatus.WaitingForDrawings;
                ++this.currentTurn;
                break;
            case GameStatus.WaitingForDrawings:
                this.status = GameStatus.WaitingForSentences;
                ++this.currentTurn;
                break;
            default:
                break;
        }
    }
}
export const rooms = [];
//# sourceMappingURL=rooms.js.map