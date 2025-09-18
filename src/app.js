require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { sequelize} = require("./models/association");
const GroupMember = require('./models/groupMemberModel');
const User = require('./models/userModel');
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const directMessageRoutes = require("./routes/directMessageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { verifyTokenSocket } = require("./utils/jwt");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chat.html"));
});
app.get("/group", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "group.html"));
});

// APIs
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", directMessageRoutes); 
app.use("/api/groups", groupRoutes);
app.use("/api/group-messages", messageRoutes);   

// Track online users
const onlineUsers = new Map();

// Authenticate socket with JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error("No token provided");

    const user = verifyTokenSocket(token); // must throw if invalid
    socket.data.userId = user.id;
    next();
  } catch (err) {
    console.warn("❌ Socket authentication failed:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  onlineUsers.set(userId, socket.id);

  console.log("✅ User connected:", userId);

  // Join a group room (when user selects a group on UI)
  socket.on("joinGroup", async (groupId) => {
    try {
      const isMember = await GroupMember.findOne({ where: { groupId, userId } });
      if (!isMember) return socket.emit("error", { message: "You are not in this group" });

      socket.join(`group_${groupId}`);
      console.log(`✅ User ${userId} joined group ${groupId}`);
    } catch (err) {
      console.error("❌ Error joining group:", err);
    }
  });

  // Direct message
  socket.on("newMessage", (msg) => {
    const { receiverId, content } = msg;
    const senderId = userId; // trusted

    // Send to sender (echo)
    io.to(socket.id).emit("message", { senderId, receiverId, content, createdAt: new Date() });

    // Send to receiver if online
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", { senderId, receiverId, content, createdAt: new Date() });
    }
  });

  // Group message
  socket.on("newGroupMessage", async (msg) => {
    try {
      const senderId = userId;
      const { groupId, content } = msg;

      const isMember = await GroupMember.findOne({ where: { groupId, userId: senderId } });
      if (!isMember) return socket.emit("error", { message: "You are not in this group" });

      // const members = await GroupMember.findAll({
      //   where: { groupId },
      //   include: [{ model: User, as: 'Member', attributes: ["id","name"] }]
      // });

      const senderUser = await User.findByPk(senderId, { attributes: ["id", "name"] });

      // for (const member of members) {
      //   if (member.Member.id !== senderId) {
      //     const memberSocketId = onlineUsers.get(member.Member.id);
      //     if (memberSocketId) {
      //       io.to(memberSocketId).emit("groupMessage", {
      //         groupId,
      //         content,
      //         senderId,
      //         Sender: { id: senderUser.id, name: senderUser.name }, // ✅ correct
      //         createdAt: new Date()
      //       });
      //     }
      //   }
      // }
      // ✅ Broadcast to all users in the group room
      io.to(`group_${groupId}`).emit("groupMessage", {
        groupId,
        content,
        senderId,
        Sender: { id: senderUser.id, name: senderUser.name },
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("❌ Error in newGroupMessage:", err);
      socket.emit("error", { message: "Failed to send group message" });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);
    onlineUsers.delete(userId);
  });
});


// Sync DB & start server
sequelize
  .sync()
  .then(() => {
    console.log("✅ Database & tables ready!");
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error creating database & tables:", err);
  });
