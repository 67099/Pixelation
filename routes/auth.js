// في ملف routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();


const MOCK_USER_ID = 'test_user_id'; 
const MOCK_USERNAME = 'admin'; 
const JWT_SECRET = 'your_super_secret_key'; 

// ------------------------------------
// 1. مسار تسجيل الدخول (POST /api/auth/login)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 
    if (username && password) { 
        
        // 
        const token = jwt.sign({ userId: MOCK_USER_ID, username: username }, JWT_SECRET, { expiresIn: '24h' });
        
        //
        return res.json({ 
            msg: 'Login successful (MOCK)', 
            token: token, 
            userId: MOCK_USER_ID,
            username: username
        });
    }

    // 
    return res.status(401).json({ msg: 'Invalid credentials' });
});

// ------------------------------------
// 2. مسار التسجيل (POST /api/auth/register)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }
    
    // محاكاة تسجيل ناجح بصلاحية 24 ساعة
    const token = jwt.sign({ userId: 'new_temp_id', username: username }, JWT_SECRET, { expiresIn: '24h' });
    
    return res.json({ 
        msg: 'Registration successful (MOCK)', 
        token: token, 
        userId: 'new_temp_id',
        username: username
    });
});

module.exports = router;
