const Group = require('../models/groupModel');
const GroupMember = require('../models/groupMemberModel');
const User = require('../models/userModel');

// 📍 Create group
exports.createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const creatorId = req.user.id;

        // Create group
        const group = await Group.create({ name, createdBy: creatorId });

        // Add creator as admin
        await GroupMember.create({ userId: creatorId, groupId: group.id, isAdmin: true });

        // Add other members safely
        if (members && members.length) {
            const membersToAdd = members.filter(id => id !== creatorId); // remove duplicates
            const groupMembers = membersToAdd.map(userId => ({
                userId,
                groupId: group.id,
                isAdmin: false
            }));
            await GroupMember.bulkCreate(groupMembers, { ignoreDuplicates: true });
        }

        // Reload group with members and creator
        const fullGroup = await Group.findByPk(group.id, {
            include: [
                { model: User, as: 'Members', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'Creator', attributes: ['id', 'name', 'email'] }
            ]
        });

        return res.json({ msg: "Group created", group: fullGroup });

    } catch (err) {
        // Return validation errors if any
        return res.status(500).json({
            error: err.message,
            details: err.errors ? err.errors.map(e => e.message) : undefined
        });
    }
};


// 📍 Get groups user belongs to
exports.getMyGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        return res.json(groups);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 📍 Add member
exports.addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        await GroupMember.create({ groupId, userId });
        return res.json({ msg: "Member added" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// 📍 Remove member
exports.removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        await GroupMember.destroy({ where: { groupId, userId } });
        return res.json({ msg: "Member removed" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
