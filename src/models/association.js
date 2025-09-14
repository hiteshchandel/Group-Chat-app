const User = require('./userModel');
// const Message = require('./messageModel');
const Contact = require('./contactModel');
const DirectMessage = require('./directMessageModel');
// const Group = require('./groupModel');
// const GroupMember = require('./groupMemberModel');
const sequelize = require('../config/db');

// A user can have many contacts
User.hasMany(Contact, {
    foreignKey: 'userId',
    as: 'MyContacts',
    onDelete: 'CASCADE'
});

// Each contact belongs to a user (the one who owns the list)
Contact.belongsTo(User, {
    foreignKey: 'userId',
    as: 'Owner',
});

// Contact also references another user (the actual friend)
Contact.belongsTo(User, {
    foreignKey: 'contactId',
    as: 'ContactUser',
});

// =========================
// 📌 Direct Message Associations
// =========================
User.hasMany(DirectMessage, {
    foreignKey: 'senderId',
    as: 'SentMessages',
    onDelete: 'CASCADE'
});
User.hasMany(DirectMessage, {
    foreignKey: 'receiverId',
    as: 'ReceivedMessages',
    onDelete: 'CASCADE'
});

DirectMessage.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'Sender'
});
DirectMessage.belongsTo(User, {
    foreignKey: 'receiverId',
    as: 'Receiver'
});

// // 👥 Groups
// User.hasMany(Group, { foreignKey: 'createdBy', as: 'CreatedGroups', onDelete: 'CASCADE' });
// Group.belongsTo(User, { as: 'Creator', foreignKey: 'createdBy' });

// 👥 Group Members (many-to-many)
// User.belongsToMany(Group, {
//     through: GroupMember,
//     as: 'Groups',
//     foreignKey: 'userId',
//     otherKey: 'groupId', 
//     onDelete: 'CASCADE'
// });
// Group.belongsToMany(User, {
//     through: GroupMember,
//     as: 'Members',
//     foreignKey: 'groupId',
//     otherKey: 'userId', 
//     onDelete: 'CASCADE'
// });

// // 💬 Group Messages
// Group.hasMany(Message, { foreignKey: 'groupId', as: 'Messages', onDelete: 'CASCADE' });
// Message.belongsTo(Group, { foreignKey: 'groupId', as: 'Group' });

// User.hasMany(Message, { foreignKey: 'userId', as: 'Messages', onDelete: 'CASCADE' });
// Message.belongsTo(User, { foreignKey: 'userId', as: 'Sender' });

module.exports = {
    User,
    // Group,
    // GroupMember,
    Contact,
    DirectMessage,
    // Message,
    sequelize
};
