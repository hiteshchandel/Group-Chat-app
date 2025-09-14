const Group = require('../models/groupModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const GroupMember = require('../models/groupMemberModel');

// 📍 Send message in group
exports.sendMessage = async (req, res) => {
    try {
        const { groupId, content } = req.body;
        const userId = req.user.id;

        const isMember = await GroupMember.findOne({
            where: { groupId, userId }
        });

        if (!isMember) {
            return res.status(403).json({ error: "Access denied: You are not a member of this group" });
        }

        const message = await Message.create({ groupId, userId, content });
        return res.json({ msg: "Message sent", message });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 📍 Get group messages
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const isMember = await GroupMember.findOne({
            where: { groupId, userId }
        });

        if (!isMember) {
            return res.status(403).json({ error: "Access denied: You are not a member of this group" });
        }

        const messages = await Message.findAll({
            where: { groupId },
            include: [
                { model: User, as: "Sender", attributes: ["id", "name"] },
                { model: Group, as: "Group", attributes: ["id", "name"] }
            ],
            order: [["createdAt", "ASC"]]
        });

        return res.json(messages);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
