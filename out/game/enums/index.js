export var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["WaitingForStart"] = 0] = "WaitingForStart";
    GameStatus[GameStatus["WaitingForInitialSentences"] = 1] = "WaitingForInitialSentences";
    GameStatus[GameStatus["WaitingForDrawings"] = 2] = "WaitingForDrawings";
    GameStatus[GameStatus["WaitingForSentences"] = 3] = "WaitingForSentences";
})(GameStatus || (GameStatus = {}));
export var EntryType;
(function (EntryType) {
    EntryType[EntryType["Drawing"] = 0] = "Drawing";
    EntryType[EntryType["Sentence"] = 1] = "Sentence";
})(EntryType || (EntryType = {}));
export var QuestType;
(function (QuestType) {
    QuestType[QuestType["Drawing"] = 0] = "Drawing";
    QuestType[QuestType["Sentence"] = 1] = "Sentence";
})(QuestType || (QuestType = {}));
//# sourceMappingURL=index.js.map