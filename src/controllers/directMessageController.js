const User = require("../models/userModel");
const DirectMessage = require("../models/directMessageModel");
const ArchivedDirectMessage = require("../models/archivedDirectMessageModel");
const { Op } = require("sequelize");

// ✉️ Send Direct Message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) return res.status(400).json({ message: "ReceiverId and content are required" });

        const receiver = await User.findByPk(receiverId);
        if (!receiver) return res.status(404).json({ message: "Receiver not found" });

        const message = await DirectMessage.create({ senderId, receiverId, content });

        return res.status(201).json({ message: "Message sent successfully", data: message });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// // 💬 Get Conversation between two users
// exports.getConversation = async (req, res) => {
//     try {
//         const { contactId } = req.params;
//         const userId = req.user.id;

//         const messages = await DirectMessage.findAll({
//             where: {
//                 [Op.or]: [
//                     { senderId: userId, receiverId: contactId },
//                     { senderId: contactId, receiverId: userId }
//                 ]
//             },
//             include: [
//                 { model: User, as: "Sender", attributes: ["id", "name"] },
//                 { model: User, as: "Receiver", attributes: ["id", "name"] }
//             ],
//             order: [["createdAt", "ASC"]]
//         });

//         return res.status(200).json(messages);

//     } catch (err) {
//         return res.status(500).json({ message: "Internal server error", error: err.message });
//     }
// };

// 💬 Get Conversation between two users (live + archived)
exports.getConversation = async (req, res) => {
    try {
        const { contactId } = req.params;
        const userId = req.user.id;

        // 🔹 Live messages
        const liveMessages = await DirectMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId }
                ]
            },
            include: [
                { model: User, as: "Sender", attributes: ["id", "name"] },
                { model: User, as: "Receiver", attributes: ["id", "name"] }
            ],
        });

        // 🔹 Archived messages
        const archivedMessages = await ArchivedDirectMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId }
                ]
            },
            include: [
                { model: User, as: "Sender", attributes: ["id", "name"] },
                { model: User, as: "Receiver", attributes: ["id", "name"] }
            ],
        });

        // Merge + sort by time
        const allMessages = [...archivedMessages, ...liveMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        return res.status(200).json(allMessages);

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

