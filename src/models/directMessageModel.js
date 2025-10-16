const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DirectMessage = sequelize.define('DirectMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    media: {
        type: DataTypes.STRING, allowNull: true
    }
}, {
    timestamps: true
});

module.exports = DirectMessage;
