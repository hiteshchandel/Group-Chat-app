// src/controllers/chatController.js
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Store a new chat message
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const newMessage = await Message.create({
            message,
            userId
        });

        return res.status(201).json({
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (error) {
        console.error("❌ Error sending message:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Fetch all messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            include: [{ model: User, attributes: ["id", "name", "email"] }],
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("❌ Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
