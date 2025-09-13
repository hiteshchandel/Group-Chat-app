const User = require('./userModel');
const Message = require('./messageModel');
const sequelize = require('../config/db');

User.hasMany(Message, { foreignKey: 'userId', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'userId' });

module.exports = {User , sequelize, Message}