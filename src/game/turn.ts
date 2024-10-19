import { Quest } from "./quest.js";

export class Turn {
  quests: Quest[];

  constructor() {
    this.quests = [];
  }
}
