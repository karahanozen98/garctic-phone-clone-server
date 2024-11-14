import { Room, rooms } from "../game/rooms.js";
import { NotFoundException } from "../exceptions/notFoundException.js";
import RoomDto from "../dto/roomDto.js";
import { GameStatus, QuestType } from "../game/enums/index.js";
import { Player } from "../game/player.js";
import { ISocketIO } from "../types";

export const create = async (
  user: Player,
  maxPlayers: number,
  numberOfTurns: number
): Promise<Room> => {
  let roomId = Math.floor(Math.random() * 10000 + 1000);

  while (rooms.some((room) => room.id === roomId)) {
    ++roomId;
  }

  const room = new Room(roomId, user, maxPlayers, numberOfTurns);
  rooms.push(room);
  return room;
};

export const getById = async (id: string): Promise<RoomDto> => {
  const room = rooms.find((room) => room.id.toString() === id);

  if (!room) {
    throw new NotFoundException("Room not found");
  }

  return new RoomDto(room);
};

export const getByIdDetailed = async (id: string): Promise<Room> => {
  const room = rooms.find((room) => room.id.toString() === id);

  if (!room) {
    throw new NotFoundException("Room not found");
  }

  return room;
};

export const deleteAll = async () => {
  rooms.length = 0;
};

export const getMyQuest = async (userId: string, roomId: string) => {
  const room = rooms.find(
    (room) =>
      String(room.id) === roomId &&
      room.players.some((player) => player.id === userId)
  );

  if (!room) {
    throw new Error("No such room exists");
  }

  const quest = room.getLatestQuest(userId);
  if (!quest) {
    throw new NotFoundException("No quest found for this user");
  }

  return quest;
};

export const join = async (user: Player, roomId: string, io: ISocketIO) => {
  const room = rooms.find((room) => String(room.id) === roomId);

  if (!room) {
    throw new Error("No such room exists");
  }

  if (room.players.find((u) => u.id === user.id) == null) {
    room.players.push(user);
    io.emit(`room-update-${roomId}`, { room: new RoomDto(room) });
  }
};

export const start = async (userId: string, roomId: string, io: ISocketIO) => {
  const room = rooms.find((room) => String(room.id) === roomId);

  if (!room) {
    throw new Error("No such room exists");
  }

  if (room.owner.id !== userId) {
    throw new Error("Only the room owner can perform this operation");
  }

  if (room.players.length < 2) {
    throw new Error("At least 2 players are required before starting");
  }

  room.startGame();
  io.emit(`room-update-${roomId}`, { room: new RoomDto(room) });
};

export const postSentence = async (
  userId: string,
  roomId: string,
  sentence: string,
  io: ISocketIO
) => {
  const room = rooms.find(
    (room) =>
      String(room.id) === roomId &&
      room.players.some((player) => player.id === userId)
  );

  if (!room) {
    throw new Error("No such room exists");
  }

  if (!room.isWaitingForSentences()) {
    throw new Error("Game does not expect for sentences");
  }

  // assign the sentence as a drawaing quest to a random person
  room.createNewQuest(QuestType.Drawing, userId, sentence);

  // all users entered their quests change room state
  if (room.isAllQuestsReady()) {
    room.isLastTurn() ? room.startShowcase() : room.completeCurrentTurn();
    io.emit(`room-update-${roomId}`, { room: new RoomDto(room) });
  } else {
    io.emit(`player-update-${roomId}`, {
      players: room.players,
    });
  }
};

export const postDrawing = async (
  userId: string,
  roomId: string,
  drawing: any[],
  io: ISocketIO
) => {
  const room = rooms.find(
    (room) =>
      String(room.id) === roomId &&
      room.players.some((player) => player.id === userId)
  );

  if (!room) {
    throw new Error("No such room exists");
  }

  if (room.status !== GameStatus.WaitingForDrawings) {
    throw new Error("Game does not expect for drawings");
  }

  // assign the drawing as a sentence quest to a random person
  room.createNewQuest(QuestType.Sentence, userId, drawing);

  if (room.isAllQuestsReady()) {
    // all users completed their drawing quests
    room.isLastTurn() ? room.startShowcase() : room.completeCurrentTurn();
    io.emit(`room-update-${roomId}`, { room: new RoomDto(room) });
  } else {
    io.emit(`player-update-${roomId}`, {
      players: room.players,
    });
  }
};

export const getShowcase = async (
  userId: string,
  roomId: string,
  io: ISocketIO
) => {
  const room = rooms.find(
    (room) =>
      String(room.id) === roomId &&
      room.players.some((player) => player.id === userId)
  );

  if (!room) {
    throw new Error("No such room exists");
  }

  return room.getShowCase();
};

export const moveToNextShowcase = async (
  userId: string,
  roomId: string,
  io: ISocketIO
) => {
  const room = rooms.find(
    (room) =>
      String(room.id) === roomId &&
      room.players.some((player) => player.id === userId)
  );

  if (!room) {
    throw new Error("No such room exists");
  }

  const showcase = room.moveToNextShowcase();

  if (room.isGameFinished()) {
    io.emit(`room-update-${roomId}`, { room: new RoomDto(room) });
    return showcase;
  }

  io.emit("showcase-update", { showcase });
  return showcase;
};
