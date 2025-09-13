const express = require("express");
const { verifyToken } = require("../utils/jwt");
const { sendMessage, getMessages } = require("../controllers/messageController");
const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/all", verifyToken, getMessages);

module.exports = router;