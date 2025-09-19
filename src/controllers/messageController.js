const Group = require('../models/groupModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const ArchivedMessage = require('../models/archivedMessageModel');
const GroupMember = require('../models/groupMemberModel');

// =========================
// 8. Send Message to Group
// =========================
exports.sendGroupMessage = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const { content } = req.body;
        const userId = req.user.id;

        // Check if user is part of group
        const isMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (!isMember) return res.status(403).json({ error: "You are not a member of this group" });

        const message = await Message.create({
            groupId,
            userId,
            content
        });

        res.status(201).json({ message: "Message sent", data: message });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
};


// exports.getGroupMessages = async (req, res) => {
//     try {
//         const { groupId } = req.params;
//         const userId = req.user.id;

//         // Check if user is part of group
//         const isMember = await GroupMember.findOne({ where: { groupId, userId } });
//         if (!isMember) return res.status(403).json({ error: "You are not a member of this group" });

//         const messages = await Message.findAll({
//             where: { groupId },
//             include: [
//                 {
//                     model: User,
//                     as: 'Sender',
//                     attributes: ['id', 'name', 'email']
//                 }
//             ],
//             order: [['createdAt', 'ASC']]
//         });

//         res.json(messages);
//     } catch (error) {
//         console.error("Get Group Messages Error:", error);
//         res.status(500).json({ error: "Failed to fetch messages" });
//     }
// };


// =========================
// 9. Get All Messages in Group (live + archived)
// =========================


exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Check if user is part of group
        const isMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (!isMember) return res.status(403).json({ error: "You are not a member of this group" });

        // 🔹 Live messages
        const liveMessages = await Message.findAll({
            where: { groupId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'name', 'email'] }
            ],
        });

        // 🔹 Archived messages
        const archivedMessages = await ArchivedMessage.findAll({
            where: { groupId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'name', 'email'] }
            ],
        });

        // Merge + sort by createdAt
        const allMessages = [...archivedMessages, ...liveMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        res.json(allMessages);

    } catch (error) {
        console.error("Get Group Messages Error:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};
