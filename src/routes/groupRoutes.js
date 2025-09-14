// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken } = require('../utils/jwt');

// Groups
router.post('/create', verifyToken, groupController.createGroup);
router.get('/my', verifyToken, groupController.getMyGroups);
router.post('/add-member', verifyToken, groupController.addMember);
router.post('/remove-member', verifyToken, groupController.removeMember);

module.exports = router;
