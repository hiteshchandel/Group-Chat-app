const {Message} = require('../models/association');
const {ArchivedMessage} = require('../models/association');
const {GroupMember} = require('../models/association');
const {User} = require('../models/association');

// ✅ Send message to group (text + media)
exports.sendGroupMessage = async (req, res) => {
    try {
        const groupId = req.params.groupId; // ✅ fixed
        const content = req.body.content;
        const userId = req.user.id;
        const media = req.file ? `/uploads/${req.file.filename}` : null;

        const isMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (!isMember) return res.status(403).json({ message: "Not a group member" });

        if (!content && !media) return res.status(400).json({ message: "Content or media required" });

        const message = await Message.create({ groupId, userId, content, media });
        return res.status(201).json({ message: "Group message sent", data: message });
    } catch (err) {
        console.error("ERROR", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};


// ✅ Get all messages (live + archived)
exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const isMember = await GroupMember.findOne({ where: { groupId, userId } });
        if (!isMember) return res.status(403).json({ message: "Not a group member" });

        const liveMessages = await Message.findAll({
            where: { groupId },
            include: [{ model: User, as: 'Sender', attributes: ['id', 'name', 'email'] }],
        });

        const archivedMessages = await ArchivedMessage.findAll({
            where: { groupId },
            include: [{ model: User, as: 'Sender', attributes: ['id', 'name', 'email'] }],
        });

        const allMessages = [...archivedMessages, ...liveMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        res.json(allMessages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};
