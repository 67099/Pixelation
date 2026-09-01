

require('dotenv').config({ quiet: true });

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));

app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles', 'index.html')); 
});

require('./socket_handler')(io); 



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
