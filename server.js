/* FinCaL Production Server: Express API + MongoDB + Static Frontend */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fincal';

// --- Production Middlewares ---
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static frontend files directly
app.use(express.static(path.join(__dirname)));

// --- MongoDB Schemas & Models ---
const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    pin: { type: String, required: true, trim: true }
}, { timestamps: true });

const userDataSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    expensesData: { 
        type: Object, 
        default: () => ({ budget: 0, list: [], lastActiveMonth: '', historyStats: {} }) 
    },
    peopleData: { type: Array, default: [] },
    notesData: { type: Array, default: [] },
    userNoteCategories: { type: Array, default: ['Personal', 'Work', 'Study', 'Ideas'] },
    settings: { type: Object, default: {} }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const UserData = mongoose.model('UserData', userDataSchema);

// --- REST API Endpoints ---

// 1. Health Check
app.get('/api/health', (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
        status: 'ok',
        database: isDbConnected ? 'connected' : 'connecting',
        uptime: process.uptime()
    });
});

// 2. User Registry
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('id name pin createdAt').sort({ createdAt: 1 });
        res.json({ success: true, users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { id, name, pin } = req.body;
        if (!id || !name || !pin) {
            return res.status(400).json({ success: false, error: "id, name, and pin are required" });
        }

        const user = await User.findOneAndUpdate(
            { id },
            { id, name, pin },
            { upsert: true, new: true }
        );
        res.json({ success: true, user });
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).json({ success: false, error: "Failed to register user" });
    }
});

// 3. Complete User Financial Data (Expenses, Ledgers, Notes, Settings)
app.get('/api/data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await UserData.findOne({ userId });
        if (!data) {
            return res.json({
                success: true,
                isNewUser: true,
                expensesData: { budget: 0, list: [], lastActiveMonth: '', historyStats: {} },
                peopleData: [{ id: 'myself', name: 'Myself', transactions: [], interestMode: 'none', isGroup: false }],
                notesData: [],
                userNoteCategories: ['Personal', 'Work', 'Study', 'Ideas'],
                settings: {}
            });
        }
        res.json({
            success: true,
            isNewUser: false,
            expensesData: data.expensesData,
            peopleData: data.peopleData,
            notesData: data.notesData,
            userNoteCategories: data.userNoteCategories,
            settings: data.settings
        });
    } catch (err) {
        console.error("Error loading user data:", err);
        res.status(500).json({ success: false, error: "Failed to load data" });
    }
});

app.post('/api/data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { expensesData, peopleData, notesData, userNoteCategories, settings } = req.body;

        const updated = await UserData.findOneAndUpdate(
            { userId },
            {
                userId,
                expensesData: expensesData || { budget: 0, list: [], lastActiveMonth: '', historyStats: {} },
                peopleData: peopleData || [],
                notesData: notesData || [],
                userNoteCategories: userNoteCategories || ['Personal', 'Work', 'Study', 'Ideas'],
                settings: settings || {}
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: "Data synced with MongoDB", updatedAt: updated.updatedAt });
    } catch (err) {
        console.error("Error saving user data:", err);
        res.status(500).json({ success: false, error: "Failed to save data" });
    }
});

// 4. Reset All Data
app.post('/api/reset', async (req, res) => {
    try {
        await User.deleteMany({});
        await UserData.deleteMany({});
        res.json({ success: true, message: "All database records reset" });
    } catch (err) {
        console.error("Error resetting database:", err);
        res.status(500).json({ success: false, error: "Failed to reset database" });
    }
});

// Fallback SPA routing to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- MongoDB Connection & Server Initialization ---
async function startServer() {
    try {
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ Successfully connected to MongoDB!");

        app.listen(PORT, () => {
            console.log(`\n======================================================`);
            console.log(`🚀 FinCaL Production Server running at:`);
            console.log(`   http://localhost:${PORT}`);
            console.log(`   Frontend and Backend are running simultaneously!`);
            console.log(`======================================================\n`);
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        console.log("⚠️ Starting server in offline-tolerant mode...");
        app.listen(PORT, () => {
            console.log(`🚀 FinCaL Server running on port ${PORT} (Database pending reconnection)`);
        });
    }
}

// Graceful Shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed on app termination.");
    process.exit(0);
});

startServer();
