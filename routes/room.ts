import { Router } from "express";
import { Room } from "../game/game.js";
import { rooms } from "../game/rooms.js";

const router = Router();

router.post("/", (req: any, res, next) => {
  try {
    const { maxPlayers, numberOfTurns } = req.body;
    const user = req.session.user;
    let roomId = Math.floor(Math.random() * 10000);

    while (rooms.some((room) => room.id === roomId)) {
      ++roomId;
    }

    const room = new Room(roomId, user, maxPlayers, numberOfTurns);
    rooms.push(room);
    res.json(room);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req: any, res, next) => {
  try {
    const room = rooms.find((room) => room.id == req.params.id);
    res.json(room);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/join", (req: any, res, next) => {
  try {
    const room = rooms.find((room) => String(room.id) === req.params.id);

    if (!room) {
      throw new Error("No such room exists");
    }

    const user = req.session?.user;
    if (room?.players.find((u) => u.id === user.id) == null) {
      room?.players.push(user);
      req.io.emit("room-update", { room });
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/start", (req: any, res, next) => {
  try {
    const room = rooms.find((room) => String(room.id) === req.params.id);
    const user = req.session?.user;

    if (room?.owner.id !== user.id) {
      throw new Error("Only the room owner can perform this operation");
    }

    if (room?.players.find((u) => u.id === user.id) == null) {
      room?.players.push(user);
      req.io.emit("room-update", { room });
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
});

export default router;
