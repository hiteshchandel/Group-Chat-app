const express = require("express");
const { verifyToken } = require("../utils/jwt");
const messageController = require("../controllers/messageController");
const router = express.Router();

router.post('/send', verifyToken, messageController.sendMessage);
router.get('/:groupId', verifyToken, messageController.getGroupMessages);

module.exports = router;