const {User} = require("../models/association");
const {DirectMessage} = require("../models/association");
const {ArchivedDirectMessage} = require("../models/association");
const { Op } = require("sequelize");

// Send text-only message
exports.sendTextMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content)
            return res
                .status(400)
                .json({ message: "receiverId and content are required" });

        const message = await DirectMessage.create({ senderId, receiverId, content });

        return res.status(201).json({
            content: message.content,
            mediaUrl: null,
            createdAt: message.createdAt,
        });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};

// Send media + optional text
exports.sendMediaMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        const media = req.file ? `/uploads/${req.file.filename}` : null;

        if (!receiverId || (!content && !media))
            return res.status(400).json({ message: "receiverId and content or media are required" });

        const message = await DirectMessage.create({
            senderId,
            receiverId,
            content: content || "",
            media, // original filename preserved with timestamp
        });

        return res.status(201).json({
            content: message.content,
            mediaUrl: message.media,
            createdAt: message.createdAt,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// Get conversation (live + archived)
exports.getConversation = async (req, res) => {
    try {
        const contactId = parseInt(req.params.contactId, 10);
        const userId = req.user.id;

        if (isNaN(contactId)) return res.status(400).json({ message: "Invalid contactId" });

        const liveMessages = await DirectMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId },
                ],
            },
            order: [["createdAt", "ASC"]],
        });

        const archivedMessages = await ArchivedDirectMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId },
                ],
            },
            order: [["createdAt", "ASC"]],
        });

        const allMessages = [...archivedMessages, ...liveMessages].map(msg => ({
            id: msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content || "",
            mediaUrl: msg.media || null,
            createdAt: msg.createdAt,
        }));

        return res.status(200).json(allMessages);
    } catch (err) {
        console.error("❌ getConversation error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};


