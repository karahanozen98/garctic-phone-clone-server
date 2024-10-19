import { Router } from "express";
import { Room, rooms } from "../game/rooms.js";
import { NotFoundException } from "../exceptions/notFoundException.js";
import RoomDto from "../dto/roomDto.js";
import { GameStatus } from "../game/enums/index.js";
const router = Router();
router.post("/", (req, res, next) => {
    try {
        const { maxPlayers, numberOfTurns } = req.body;
        const user = req.session.user;
        let roomId = Math.floor(Math.random() * 10000 + 1000);
        while (rooms.some((room) => room.id === roomId)) {
            ++roomId;
        }
        const room = new Room(roomId, user, maxPlayers, numberOfTurns);
        rooms.push(room);
        res.json(room);
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id", (req, res, next) => {
    try {
        const room = rooms.find((room) => room.id.toString() === req.params.id);
        if (!room) {
            throw new NotFoundException("Room not found");
        }
        res.json(new RoomDto(room));
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id/detailed", (req, res, next) => {
    try {
        const room = rooms.find((room) => room.id.toString() === req.params.id);
        if (!room) {
            throw new NotFoundException("Room not found");
        }
        res.json(room);
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id/getMyQuest", (req, res, next) => {
    try {
        const user = req.session.user;
        const room = rooms.find((room) => String(room.id) === req.params.id &&
            room.players.some((player) => player.id === user.id));
        if (!room) {
            throw new Error("No such room exists");
        }
        const currentTurn = room.getPreviousTurn();
        const quest = currentTurn.quests.find((quest) => quest.assignee.id === user.id);
        if (!quest) {
            throw new NotFoundException("No quest found for this user");
        }
        res.json(quest);
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id/join", (req, res, next) => {
    var _a;
    try {
        const room = rooms.find((room) => String(room.id) === req.params.id);
        if (!room) {
            throw new Error("No such room exists");
        }
        const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
        if (room.players.find((u) => u.id === user.id) == null) {
            room.players.push(user);
            req.io.emit(`room-update-${req.params.id}`, { room: new RoomDto(room) });
        }
        res.json();
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id/start", (req, res, next) => {
    var _a;
    try {
        const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
        const room = rooms.find((room) => String(room.id) === req.params.id);
        if (!room) {
            throw new Error("No such room exists");
        }
        if (room.owner.id !== user.id) {
            throw new Error("Only the room owner can perform this operation");
        }
        if (room.players.length < 2) {
            throw new Error("At least 2 players are required before starting");
        }
        room.isStarted = true;
        room.status = GameStatus.WaitingForInitialSentences;
        req.io.emit(`room-update-${req.params.id}`, { room: new RoomDto(room) });
        res.json();
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id/sentence", (req, res, next) => {
    var _a;
    try {
        const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
        const room = rooms.find((room) => String(room.id) === req.params.id &&
            room.players.some((player) => player.id === user.id));
        if (!room) {
            throw new Error("No such room exists");
        }
        if (!room.isWaitingForSentences()) {
            throw new Error("Game does not expect for sentences");
        }
        room.createNewDrawingQuest(user, req.body.sentence);
        // all users entered their quests change room state
        if (room.isAllQuestsReady()) {
            room.completeCurrentTurn();
            req.io.emit(`room-update-${req.params.id}`, { room: new RoomDto(room) });
        }
        res.json();
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id/drawing", (req, res, next) => {
    var _a;
    try {
        const user = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user;
        const room = rooms.find((room) => String(room.id) === req.params.id &&
            room.players.some((player) => player.id === user.id));
        if (!room) {
            throw new Error("No such room exists");
        }
        if (room.status !== GameStatus.WaitingForDrawings) {
            throw new Error("Game does not expect for drawings");
        }
        const quest = room
            .getPreviousTurn()
            .quests.find((q) => q.id === req.body.quest.id && q.assignee.id === user.id);
        if (!quest) {
            throw new NotFoundException("Quest not found");
        }
        room.createNewSentenceQuest(user, req.body.drawing);
        quest.isCompleted = true;
        quest.setContent(req.body.drawing);
        if (room.isAllQuestsCompleted()) {
            // all users completed their drawing quests
            room.completeCurrentTurn();
            req.io.emit(`room-update-${req.params.id}`, { room: new RoomDto(room) });
        }
        res.json();
    }
    catch (error) {
        next(error);
    }
});
export default router;
