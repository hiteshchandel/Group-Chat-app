// models/archivedMessageModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ArchivedMessage = sequelize.define('ArchivedMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userId: {
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

module.exports = ArchivedMessage;
