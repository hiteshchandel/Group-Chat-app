const express = require("express");
const { verifyToken } = require("../utils/jwt");
const messageController = require("../controllers/messageController");
const router = express.Router();

// ✅ Send message in a group
router.post("/:groupId/send", verifyToken, messageController.sendGroupMessage);

// ✅ Get all messages of a group
router.get("/:groupId/messages", verifyToken, messageController.getGroupMessages);

module.exports = router;