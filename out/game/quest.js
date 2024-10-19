import { v4 } from "uuid";
export class Quest {
    constructor(type, owner, assignee, content) {
        this.isCompleted = false;
        if (owner.id === assignee.id) {
            throw new Error("Assignee and Owner can not be the same person for a quest");
        }
        this.id = v4();
        this.type = type;
        this.owner = owner;
        this.assignee = assignee;
        this.content = content;
    }
    setContent(content) {
        this.content = content;
        this.isCompleted = true;
    }
}
//# sourceMappingURL=quest.js.map