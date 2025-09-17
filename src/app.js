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

// ✅ Authenticate socket with JWT
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = verifyTokenSocket(token);
    socket.userId = user.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.userId);

  // Save mapping userId -> socketId
  socket.on("join", ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    console.log("📌 Online users:", onlineUsers);
  });

  // 🔹 Direct message
  socket.on("newMessage", (msg) => {
    const { senderId, receiverId } = msg;

    io.to(socket.id).emit("message", msg);

    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", msg);
    }
  });

  // 🔹 Group message
  socket.on("newGroupMessage", async (msg) => {
    const { senderId, groupId } = msg;

    try {
      // ✅ Correct (uses groupId, userId — matches your DB schema)
      const isMember = await GroupMember.findOne({
        where: { groupId: groupId, userId: senderId },
      });

      if (!isMember) {
        console.warn(`❌ User ${senderId} is not in group ${groupId}`);
        return;
      }

      // ✅ Correct
      const members = await GroupMember.findAll({
        where: { groupId},
        include: [{ model: User, as:'Member', attributes: ["id"] }],
      });


      // ✅ Send to all except sender
      for (const member of members) {
        if (member.Member && member.Member.id !== senderId) {
          const memberSocketId = onlineUsers.get(member.Member.id);
          if (memberSocketId) {
            io.to(memberSocketId).emit("groupMessage", msg);
          }
        }
      }

    } catch (err) {
      console.error("❌ Error sending group message:", err);
      socket.emit("error", { message: "Failed to send group message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.userId);
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
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
