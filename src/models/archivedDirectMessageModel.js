// models/archivedDirectMessageModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArchivedDirectMessage = sequelize.define('ArchivedDirectMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    media: {
        type: DataTypes.STRING, allowNull: true
    }
}, {
    timestamps: true
});

module.exports = ArchivedDirectMessage;
