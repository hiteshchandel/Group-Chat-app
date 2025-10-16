const express = require("express");
const router = express.Router();
const directMessageController = require("../controllers/directMessageController");
const { verifyToken } = require("../utils/jwt");
const upload = require("../utils/upload");

// Text-only message
router.post("/send", verifyToken, directMessageController.sendTextMessage);

// Media + optional text message
router.post(
    "/send-media",
    verifyToken,
    upload.single("media"),
    directMessageController.sendMediaMessage
);

// Get conversation between logged-in user and another contact
router.get(
    "/conversation/:contactId",
    verifyToken,
    directMessageController.getConversation
);

module.exports = router;
