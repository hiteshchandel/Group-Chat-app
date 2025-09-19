// cron/archiveChats.js
const cron = require('node-cron');
const { Message, DirectMessage, ArchivedMessage, ArchivedDirectMessage } = require('../models/association');
const { Op } = require('sequelize');

// Runs daily at 2 AM
cron.schedule('0 2 * * *', async () => {
    console.log("Archiving old messages...");

    try {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 🔹 Archive Group Messages
        const oldGroupMessages = await Message.findAll({
            where: { createdAt: { [Op.lt]: cutoff } }
        });

        if (oldGroupMessages.length > 0) {
            await ArchivedMessage.bulkCreate(
                oldGroupMessages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    groupId: msg.groupId,
                    userId: msg.userId,
                    createdAt: msg.createdAt
                }))
            );
            await Message.destroy({ where: { id: oldGroupMessages.map(m => m.id) } });
            console.log(`Archived ${oldGroupMessages.length} group messages`);
        }

        // 🔹 Archive Direct Messages
        const oldDirectMessages = await DirectMessage.findAll({
            where: { createdAt: { [Op.lt]: cutoff } }
        });

        if (oldDirectMessages.length > 0) {
            await ArchivedDirectMessage.bulkCreate(
                oldDirectMessages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    createdAt: msg.createdAt
                }))
            );
            await DirectMessage.destroy({ where: { id: oldDirectMessages.map(m => m.id) } });
            console.log(`Archived ${oldDirectMessages.length} direct messages`);
        }

    } catch (err) {
        console.error("Error archiving messages:", err);
    }
});
