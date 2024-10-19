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

console.log("APP INIT");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });

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
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

server.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

export default app;
