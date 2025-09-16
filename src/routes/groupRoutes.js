// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken } = require('../utils/jwt');

// ✅ Create a new group
router.post("/create", verifyToken, groupController.createGroup);

// ✅ Get all groups where logged-in user is a member
router.get("/my-groups", verifyToken, groupController.getUserGroups);

// ✅ Add a member to group (admin only)
router.post("/:groupId/add-member", verifyToken, groupController.addMember);

// ✅ Remove a member from group (admin only)
router.delete("/:groupId/remove-member/:userId", verifyToken, groupController.removeMember);

// ✅ Make another member admin (admin only)
router.put("/:groupId/make-admin/:userId", verifyToken, groupController.makeAdmin);

module.exports = router;
