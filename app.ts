import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import cookies from "cookie-parser";
import { Server, Socket } from "socket.io";
import authenticationRouter from "./routes/authentication.js";
import roomRouter from "./routes/room.js";
import { exceptionMiddleware } from "./middlewares/exceptionMiddleware.js";
import { sessionMiddleware } from "./middlewares/sessionMiddleware.js";
import bodyParser from "body-parser";
import { ioMiddleware } from "./middlewares/ioMiddleware.js";
import { connectMongo } from "./helpers/mongo.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

connectMongo();
io.on("connection", (socket: Socket) => {
  console.log("A user is connected");

  socket.on("draw", (data: any) => {
    console.log("Drawing received", data);

    io.emit("painting", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cookies());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(sessionMiddleware);
app.use(ioMiddleware(io));

app.get("/", (req, res) => {
  res.json("Healthy");
});

app.use("/authentication", authenticationRouter);
app.use("/room", roomRouter);
app.use(exceptionMiddleware);

server.listen(4000, () => {
  console.log("Listening on *:4000");
});
