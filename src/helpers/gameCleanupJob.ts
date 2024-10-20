import { rooms } from "../game/rooms.js";

export default class GameCleanupJob {
  static Add() {
    const oneHourInMiliseconds = 3600000;
    setInterval(() => {
      for (let i = 0; i < rooms.length; i++) {
        if (Date.now() - rooms[i].createdAt > oneHourInMiliseconds) {
          rooms.splice(i, 1);
        }
      }
    }, oneHourInMiliseconds);
  }
}
