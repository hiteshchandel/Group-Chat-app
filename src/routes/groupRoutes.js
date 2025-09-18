// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken } = require('../utils/jwt');

// ✅ Create a new group
router.post("/create", verifyToken, groupController.createGroup);

// ✅ Get all groups where logged-in user is a member
router.get("/my-groups", verifyToken, groupController.getUserGroups);

// Get all members of a group
router.get("/:groupId/members", verifyToken, groupController.getGroupMembers);

// ✅ Add a member to group (admin only)
router.post("/:groupId/add-member", verifyToken, groupController.addMember);

// ✅ Remove a member from group (admin only)
router.delete("/:groupId/remove-member/:memberId", verifyToken, groupController.removeMember);

// ✅ Make another member admin (admin only)
router.put("/:groupId/make-admin/:memberId", verifyToken, groupController.makeAdmin);

router.get("/:groupId/isAdmin", verifyToken, groupController.isAdmin);

module.exports = router;
