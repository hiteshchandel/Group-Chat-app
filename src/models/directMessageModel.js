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
    }
}, {
    timestamps: true
});

module.exports = DirectMessage;
