import * as chai from "chai";
import * as roomService from "../src/services/roomService.js";
import { Player } from "../src/game/player.js";
import { GameStatus } from "../src/game/enums/index.js";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

const players = [
  new Player("1", "John"),
  new Player("2", "Jane"),
  new Player("3", "Jax"),
  new Player("3", "Jack"),
];

const ioMock = {
  emit(eventName: string, value: any) {},
};

const initGame = async () => {
  const gameRoom = await roomService.create(players[0], 10, 10);
  await roomService.join(players[1], gameRoom.id.toString(), ioMock);
  await roomService.join(players[2], gameRoom.id.toString(), ioMock);

  return gameRoom;
};

describe("create new game", async () => {
  const gameRoom = await roomService.create(players[0], 10, 10);

  it("is started should be false", () => {
    expect(gameRoom.isStarted).to.equals(false);
  });

  it("game shouldn't be ready", () => {
    expect(gameRoom.isAllQuestsReady()).to.be.equals(false);
  });
});

describe("Test basic game initializations and verifications", () => {
  it("should not contain duplicate players", async () => {
    const gameRoom = await initGame();
    await roomService.join(players[0], gameRoom.id.toString(), ioMock);
    await roomService.join(players[1], gameRoom.id.toString(), ioMock);
    await roomService.join(players[1], gameRoom.id.toString(), ioMock);
    await roomService.join(players[2], gameRoom.id.toString(), ioMock);
    await roomService.join(players[2], gameRoom.id.toString(), ioMock);
    expect(gameRoom.players)
      .to.have.members([players[0], players[1], players[2]])
      .with.lengthOf(3);
  });

  it("should be started", async () => {
    const gameRoom = await initGame();
    await roomService.start(players[0].id, gameRoom.id.toString(), ioMock);
    expect(gameRoom.isStarted).to.be.equal(true);
    expect(gameRoom.status).to.be.equal(GameStatus.WaitingForInitialSentences);
  });

  it("should throw an error if a non-owner tries to start the room", async () => {
    const gameRoom = await initGame();

    return expect(
      roomService.start(players[1].id, gameRoom.id.toString(), ioMock)
    ).to.eventually.rejectedWith(
      "Only the room owner can perform this operation"
    );
  });

  it("should be started with waiting for initial sentences state", async () => {
    const gameRoom = await initGame();
    await roomService.start(players[0].id, gameRoom.id.toString(), ioMock);
    expect(gameRoom.isStarted).to.be.equal(true);
    expect(gameRoom.status).to.be.equal(GameStatus.WaitingForInitialSentences);
  });

  it("should not be able to post sentences before start", async () => {
    const gameRoom = await initGame();
    return expect(
      roomService.postSentence(
        players[0].id,
        gameRoom.id.toString(),
        "",
        ioMock
      )
    ).to.eventually.rejectedWith("Game does not expect for sentences");
  });

  it("should not be able to post drawings before start", async () => {
    const gameRoom = await initGame();
    return expect(
      roomService.postDrawing(players[0].id, gameRoom.id.toString(), [], ioMock)
    ).to.eventually.rejectedWith("Game does not expect for drawings");
  });
});

//#region Game flow tests for 1 player
describe("Gameflow test for 1 player", () => {
  it("should prevent game starting ", async () => {
    const gameRoom = await roomService.create(players[0], 10, 10);
    return expect(
      roomService.start(players[0].id, gameRoom.id.toString(), ioMock)
    ).is.eventually.rejectedWith(
      "At least 2 players are required before starting"
    );
  });
});
//#endregion

//#region Game flow tests for 2 players
describe("Gameflow test for 2 player", () => {
  it("should start the game ", async () => {
    const gameRoom = await roomService.create(players[0], 10, 10);
    await roomService.join(players[1], gameRoom.id.toString(), ioMock);
    return expect(
      roomService.start(players[0].id, gameRoom.id.toString(), ioMock)
    ).is.eventually.fulfilled;
  });

  it("should be able to play ", async () => {
    const gameRoom = await roomService.create(players[0], 10, 10);
    await roomService.join(players[1], gameRoom.id.toString(), ioMock);
    await roomService.start(players[0].id, gameRoom.id.toString(), ioMock);

    await roomService.postSentence(
      gameRoom.players[0].id,
      gameRoom.id.toString(),
      "Sample sentence by player 1",
      ioMock
    );

    await roomService.postSentence(
      gameRoom.players[1].id,
      gameRoom.id.toString(),
      "Sample sentence by player 2",
      ioMock
    );

    await expect(
      roomService.getMyQuest(gameRoom.players[0].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("string")
      .and.is.equal("Sample sentence by player 2");

    await expect(
      roomService.getMyQuest(gameRoom.players[1].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("string")
      .and.is.equal("Sample sentence by player 1");
  });
});
//#endregion

//#region  Game Flow tests for 3 players
describe("Gameflow tests for 3 players", () => {
  it("should be able to play", async () => {
    const gameRoom = await initGame();
    await roomService.start(players[0].id, gameRoom.id.toString(), ioMock);
    expect(gameRoom.isStarted).to.be.equal(true);
    expect(gameRoom.status).to.be.equal(GameStatus.WaitingForInitialSentences);

    await roomService.postSentence(
      gameRoom.players[0].id,
      gameRoom.id.toString(),
      "Sample sentence by player 1",
      ioMock
    );

    await roomService.postSentence(
      gameRoom.players[2].id,
      gameRoom.id.toString(),
      "Sample sentence by player 3",
      ioMock
    );

    expect(gameRoom.isAllQuestsReady()).to.be.equal(false);
    expect(gameRoom.currentTurn).to.be.equal(0);

    await roomService.postSentence(
      gameRoom.players[1].id,
      gameRoom.id.toString(),
      "Sample sentence by player 2",
      ioMock
    );

    expect(gameRoom.currentTurn).to.be.equal(1);

    await expect(
      roomService.getMyQuest(gameRoom.players[0].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("string")
      .and.is.oneOf([
        "Sample sentence by player 2",
        "Sample sentence by player 3",
      ])
      .and.not.oneOf(["Sample sentence by player 1"]);

    await expect(
      roomService.getMyQuest(gameRoom.players[1].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("string")
      .and.is.oneOf([
        "Sample sentence by player 1",
        "Sample sentence by player 3",
      ])
      .and.not.oneOf(["Sample sentence by player 2"]);

    await expect(
      roomService.getMyQuest(gameRoom.players[2].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("string")
      .and.is.oneOf([
        "Sample sentence by player 1",
        "Sample sentence by player 2",
      ])
      .and.not.oneOf(["Sample sentence by player 3"]);

    await roomService.postDrawing(
      gameRoom.players[0].id,
      gameRoom.id.toString(),
      ["Sample drawing by player 1"],
      ioMock
    );

    await roomService.postDrawing(
      gameRoom.players[1].id,
      gameRoom.id.toString(),
      ["Sample drawing by player 2"],
      ioMock
    );

    await roomService.postDrawing(
      gameRoom.players[1].id,
      gameRoom.id.toString(),
      ["Updated drawing by player 2"],
      ioMock
    );

    await roomService.postDrawing(
      gameRoom.players[2].id,
      gameRoom.id.toString(),
      ["Sample drawing by player 3"],
      ioMock
    );

    expect(gameRoom.currentTurn).to.be.equal(2);
    await expect(
      roomService.getMyQuest(gameRoom.players[0].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("array").and.is.not.empty;

    await expect(
      roomService.getMyQuest(gameRoom.players[1].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("array").and.is.not.empty;

    await expect(
      roomService.getMyQuest(gameRoom.players[2].id, gameRoom.id.toString())
    )
      .to.eventually.to.have.property("content")
      .that.is.an("array").and.is.not.empty;
  });
});
//#endregion
