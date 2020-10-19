document.addEventListener("DOMContentLoaded", (_event) => {
  console.log('domcontentloaded');

  // Connect to socket.io
  const socket = io(); // automatically tries to connect on same port app was served from
  const username = document.getElementById("uname").innerText;
  const form = document.getElementById("chatForm");
  const messages = document.getElementById("messages");
  const messageToSend = document.getElementById("txt");

  //display welcome message and notify other users
  socket.emit("welcome", username);
  socket.emit("join", username);

  form.addEventListener("submit", (event) => {
    socket.emit("message", {
      user: username,
      message: messageToSend.value,
    });
    messageToSend.value = "";
    event.preventDefault();
  });

  // append the chat text message
  socket.on("message", (msg) => {
    console.log("script/message");
    const message = document.createElement("li");
    message.innerHTML = `<strong>${msg.user}</strong>: ${msg.message}`;
    message
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight; //auto-scroll when text overflow
  });

  // new user enter chatroom
  socket.on("welcome", (user) => {
    console.log("script/welcome");
    const message = document.createElement("li");
    message.innerHTML = `<strong>BlooChatApp</strong>: Welcome ${user.username}!`; //display welcome message
    console.log(message);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight; //auto-scroll when text overflow
    const displayUsers = document.createElement("li");
    const allUsers = user.users.join(',');
    if (allUsers === '') { //display users' names that are online
      displayUsers.innerHTML = `<p style="color:green"><strong>BlooChatApp</strong>: Unfortunately no one is online right now...</p>`;
    } else {
      displayUsers.innerHTML = `<p style="color:green"><strong><strong>BlooChatApp</strong>: ${allUsers} is online~</p>`;
    }
    messages.appendChild(displayUsers);
    messages.scrollTop = messages.scrollHeight; //auto-scroll when text overflow
  });

  //notify all users in the chat that a user has entered
  socket.on("join", (user) => {
    const message = document.createElement("li");
    message.innerHTML = `<p style="color:green"><strong>BlooChatApp</strong>: <strong>${user}</strong> has joined the chat!</p>`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight; //auto-scroll when text overflow
  });

  //notify all users in the chat that a user has disconnected
  socket.on("exit", (user) => {
    const message = document.createElement("li");
    message.innerHTML = `<p style="color:red"><strong>BlooChatApp</strong>: <strong>${user}</strong> has left the chat</p>`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight; //auto-scroll when text overflow
  });
});

