// const Group = require('../models/groupModel');
// const GroupMember = require('../models/groupMemberModel');
// const User = require('../models/userModel');
const { Group, GroupMember, User } = require("../models/association");


// =========================
// 1. Create Group
// =========================
exports.createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const userId = req.user.id; // assume from auth middleware

        // Create Group
        const group = await Group.create({ name, createdBy: userId });

        // Add creator as admin
        await GroupMember.create({
            userId,
            groupId: group.id,
            isAdmin: true
        });

        // Add selected contacts as members
        if (Array.isArray(memberIds) && memberIds.length > 0) {
            const membersToAdd = memberIds.map(id => ({
                userId: id,
                groupId: group.id,
                isAdmin: false
            }));
            await GroupMember.bulkCreate(membersToAdd);
        }

        return res.status(201).json({ message: "Group created successfully", group });
    } catch (error) {
        console.error("Create Group Error:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
};

// =========================
// 2. Get All Groups for User
// =========================
exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.findAll({
            include: [
                {
                    model: User,
                    as: 'Members',
                    where: { id: userId },
                    attributes : ['id','name','email']
                }
            ]
        });

        res.json(groups);
    } catch (error) {
        console.error("Get User Groups Error:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
};

// =========================
// 5. Add Member (Admin Only)
// =========================
exports.addMember = async (req, res) => {
    try {
        const { groupId, newUserId } = req.body;
        const userId = req.user.id;

        // Check if requester is admin
        const adminCheck = await GroupMember.findOne({
            where: { groupId, userId, isAdmin: true }
        });
        if (!adminCheck) return res.status(403).json({ error: "Only admin can add members" });

        // Add member
        const member = await GroupMember.create({
            userId: newUserId,
            groupId,
            isAdmin: false
        });

        res.json({ message: "Member added", member });
    } catch (error) {
        console.error("Add Member Error:", error);
        res.status(500).json({ error: "Failed to add member" });
    }
};

// =========================
// 6. Remove Member (Admin Only)
// =========================
exports.removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.body;
        const userId = req.user.id;

        const adminCheck = await GroupMember.findOne({
            where: { groupId, userId, isAdmin: true }
        });
        if (!adminCheck) return res.status(403).json({ error: "Only admin can remove members" });

        await GroupMember.destroy({ where: { groupId, userId: memberId } });

        res.json({ message: "Member removed" });
    } catch (error) {
        console.error("Remove Member Error:", error);
        res.status(500).json({ error: "Failed to remove member" });
    }
};

// =========================
// 7. Make Another Member Admin
// =========================
exports.makeAdmin = async (req, res) => {
    try {
        const { groupId, memberId } = req.body;
        const userId = req.user.id;

        const adminCheck = await GroupMember.findOne({
            where: { groupId, userId, isAdmin: true }
        });
        if (!adminCheck) return res.status(403).json({ error: "Only admin can make another admin" });

        await GroupMember.update(
            { isAdmin: true },
            { where: { groupId, userId: memberId } }
        );

        res.json({ message: "Member promoted to admin" });
    } catch (error) {
        console.error("Make Admin Error:", error);
        res.status(500).json({ error: "Failed to make admin" });
    }
};
