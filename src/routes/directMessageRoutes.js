// routes/directMessageRoutes.js
const express = require('express');
const router = express.Router();
const directMessageController = require('../controllers/directMessageController');
const { verifyToken } = require('../utils/jwt');

// Send a message to another user
router.post("/send", verifyToken, directMessageController.sendMessage);

// Get conversation between logged-in user and another contact
router.get("/conversation/:contactId", verifyToken, directMessageController.getConversation);

module.exports = router;
