const Group = require('../models/groupModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
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

// =========================
// 9. Get All Messages in Group
// =========================
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Check if user is part of group
        const isMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (!isMember) return res.status(403).json({ error: "You are not a member of this group" });

        const messages = await Message.findAll({
            where: { groupId },
            include: [
                {
                    model: User,
                    as: 'Sender',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        console.error("Get Group Messages Error:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};
