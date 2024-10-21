import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookies from "cookie-parser";
import { Server, Socket } from "socket.io";
import authenticationRouter from "./routes/authentication.js";
import roomRouter from "./routes/room.js";
import { exception } from "./middlewares/exception.js";
import { session } from "./middlewares/session.js";
import bodyParser from "body-parser";
import { socketIO } from "./middlewares/socketIO.js";
import { connectMongo } from "./helpers/mongo.js";
import GameCleanupJob from "./helpers/gameCleanupJob.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

connectMongo();
io.on("connection", (socket: Socket) => {
  console.log("A user is connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cookies());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(session);
app.use(socketIO(io));

app.get("/", (req, res) => {
  res.json("Healthy");
});

app.use("/authentication", authenticationRouter);
app.use("/room", roomRouter);
app.use(exception);
GameCleanupJob.Add();

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
