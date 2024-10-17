import express from "express"
import http from "http";
import cors from "cors"
import { Server, Socket} from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: {origin: "*"}});

app.use(cors())

io.on("connection", (socket: Socket) => {
    console.log("A user is connected");
    
    socket.on("draw", (data: any) => {
        console.log("Drawing received", data);
        
        io.emit("painting", data)
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
    })
});

app.get("/", (req, res) => {
    res.json("Healthy")
})

server.listen(4000, () => {
  console.log("Listening on *:4000");
});
