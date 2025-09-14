const User = require("../models/userModel");
const Contact = require("../models/contactModel");

// ➕ Add Contact (Mutual)
exports.addContact = async (req, res) => {
    try {
        const { mobile } = req.body;
        const userId = req.user.id;

        // Find user by mobile
        const contactUser = await User.findOne({
            where: { mobile },
            attributes: ["id", "name", "mobile", "email"]
        });

        if (!contactUser) return res.status(404).json({ message: "Contact not found" });
        const contactId = contactUser.id;

        if (contactId === userId) return res.status(400).json({ message: "You cannot add yourself" });

        // Check if already exists
        const exists = await Contact.findOne({ where: { userId, contactId } });
        if (exists) return res.status(400).json({ message: "Contact already exists" });

        // Save mutual contacts
        await Contact.create({ userId, contactId });
        await Contact.create({ userId: contactId, contactId: userId });

        return res.json({ message: "Contact added", contact: contactUser });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 📍 Get single contact
exports.getContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const userId = req.user.id;

        const contact = await Contact.findOne({
            where: { userId, contactId },
            include: [{ model: User, as: "ContactUser", attributes: ["id", "name", "email", "mobile"] }]
        });

        if (!contact) return res.status(404).json({ message: "Contact not found" });
        return res.status(200).json(contact);

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 📍 Get all contacts
exports.getAllContacts = async (req, res) => {
    try {
        const userId = req.user.id;

        const contacts = await Contact.findAll({
            where: { userId },
            include: [{ model: User, as: "ContactUser", attributes: ["id", "name", "email", "mobile"] }]
        });

        return res.status(200).json(contacts);

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
