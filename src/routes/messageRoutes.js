const express = require("express");
const { verifyToken } = require("../utils/jwt");
const messageController = require("../controllers/messageController");
const upload = require("../utils/upload");
const router = express.Router();

// ✅ Send message in a group
router.post("/:groupId/send", verifyToken, upload.single('media'), messageController.sendGroupMessage);

// ✅ Get all messages of a group
router.get("/:groupId/messages", verifyToken, messageController.getGroupMessages);

module.exports = router;