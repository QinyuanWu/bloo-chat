const debug = require("debug")("bloo-chat");
const nunjucks = require("nunjucks");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 7000;

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.use(express.static("assets"));

app.get("/", (req, res) => {
  res.render("index.njk", null);
});

app.get("/chatroom", (req, res) => {
  res.render("chatroom.njk", { uname: req.query.uname });

});

//arrays to store use infos who are online
const users = [];
const ids = [];

io.on("connection", function (socket) {
  socket.on("message", (msg) => {
    console.log('index');
    debug(`${msg.user}: ${msg.message}`);
    //Broadcast the message to everyone
    io.emit("message", msg);
  });

  socket.on("welcome", (username) => {
    //welcome new user
    socket.emit("welcome", {
      username,
      users,
    });
    //update user arrays
    users.push(username);
    ids.push({id:socket.id, name:username});
  });

  socket.on("join",(username) => {
    //notify other users that a new user has joined
    socket.broadcast.emit("join", username);
  });

  socket.on("disconnect", () => {
    //identify the user that has disconnected
    const index = ids.findIndex(element => element.id === socket.id);
    console.log(socket.id);
    console.log(ids);
    const username = ids[index].name;
    //notify other users that someone has left the chat
    socket.broadcast.emit("exit", username);
    ids.splice(index, 1); //delete the disconnected user in ids array
    const userIndex = users.findIndex(element => element === username);
    users.splice(userIndex, 1); //delete the disconnected user in users array
  });
});

http.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
