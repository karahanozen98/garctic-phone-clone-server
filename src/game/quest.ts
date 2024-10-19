import { v4 } from "uuid";
import { QuestType } from "./enums/index.js";
import { Player } from "./player.js";

export class Quest {
  id: string;
  type: QuestType;
  owner: Player;
  assignee: Player;
  content: string | [];
  isCompleted: boolean = false;

  constructor(
    type: QuestType,
    owner: Player,
    assignee: Player,
    content: string | []
  ) {
    if (owner.id === assignee.id) {
      throw new Error(
        "Assignee and Owner can not be the same person for a quest"
      );
    }

    this.id = v4();
    this.type = type;
    this.owner = owner;
    this.assignee = assignee;
    this.content = content;
  }

  setContent(content: string) {
    this.content = content;
    this.isCompleted = true;
  }
}