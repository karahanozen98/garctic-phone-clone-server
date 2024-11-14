import { QuestType } from "./enums";
import { Player } from "./player";
import { Quest } from "./quest";

export default class ShowcaseItem {
  id: string;
  type: QuestType;
  content: string | any[];
  owner: Player;

  constructor(quest: Quest) {
    this.id = quest.id;
    this.type = quest.type;
    this.owner = quest.owner;
    this.content = quest.content;
  }
}
