// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken } = require('../utils/jwt');

// Add a new contact (mutual)
router.post("/add", verifyToken, contactController.addContact);

// Get all contacts of logged-in user
router.get("/all", verifyToken, contactController.getAllContacts);

// Get single contact by contactId
router.get("/:contactId", verifyToken, contactController.getContact);



module.exports = router;
