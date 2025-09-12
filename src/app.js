require("dotenv").config();
const express = require("express");
const path = require('path')
const sequelize = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "views")));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

app.use('/api/auth', authRoutes);

// Sync DB & start server
sequelize.sync({ alter: true })
    .then(() => {
        console.log('✅ Database & tables ready!');
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Error creating database & tables:', err);
    });
