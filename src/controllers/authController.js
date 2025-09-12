const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const sequelize = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');

exports.signup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { name, email, password, mobile } = req.body;

        // Check if email OR mobile already exists
        const existingUser = await User.findOne({
            where: { email },
            transaction: t
        });
        const existingMobile = await User.findOne({
            where: { mobile },
            transaction: t
        });

        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ message: "Email already registered" });
        }
        if (existingMobile) {
            await t.rollback();
            return res.status(400).json({ message: "Mobile number already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user inside transaction
        const newUser = await User.create(
            { name, email, password: hashedPassword, mobile },
            { transaction: t }
        );

        await t.commit();


        return res.status(201).json({
            message: "User registered successfully",
            user : newUser
        });
    } catch (error) {
        await t.rollback();
        console.error("❌ Error during signup:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        if ((!email && !mobile) || !password) {
            return res.status(400).json({ message: "Email or Mobile and password are required" });
        }

        const whereClause = email ? { email } : { mobile };

        const user = await User.findOne({
            where: whereClause
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            },
            token
        });
    } catch (error) {
        console.error("❌ Error during login:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

