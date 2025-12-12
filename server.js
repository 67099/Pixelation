// في ملف server.js

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
// const mongoose = require('mongoose'); 

const app = express();
const server = http.createServer(app); 
const io = socketio(server); 

// ------------------------------------------------
// **1. تفعيل JSON ومسارات التوثيق (Auth Routes):**
// يجب أن يكون هذا في البداية المطلقة!
app.use(express.json()); 
app.use('/api/auth', require('./routes/auth')); 
// ------------------------------------------------

// 2. تفعيل الملفات الثابتة (Static Files):
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// 3. حل مشكلة Cannot GET / (مسار index.html):
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles', 'index.html')); 
});

// 4. تحميل منطق اللعبة (Socket.IO)
require('./socket_handler')(io); 

// ... (بقية الكود)

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));