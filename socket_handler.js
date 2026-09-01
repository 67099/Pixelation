const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

let currentGameState = {
    answer: 'MONA LISA',
    currentPixelLevel: 30,
    players: {},
    challengeTimer: null,

    // answers must stay English — guess matching does an uppercase compare
    challenges: [
        { answer: 'MONA LISA', image: 'mona_lisa.jpg' }, 
        { answer: 'PEPSI', image: 'pepsi.jpg' },
        { answer: 'TIGER', image: 'tiger.jpg' },
        
        { answer: 'PANDA', image: 'panda.jpg' },
        { answer: 'PIZZA', image: 'pizza.jpg' },
        { answer: 'SHARK', image: 'shark.jpg' },
        { answer: 'SUPERMAN', image: 'SUPERMAN.jpg' } 
    ]
};



function calculateScore(pixelLevel) {

    return 10 + (pixelLevel * 5); 
}

function startNewChallenge(io, roomId) {
    const newChallenge = currentGameState.challenges[Math.floor(Math.random() * currentGameState.challenges.length)];

    currentGameState.answer = newChallenge.answer; 
    currentGameState.currentPixelLevel = 30; 
    
    io.to(roomId).emit('newChallenge', { 
        image: newChallenge.image, 
        pixelLevel: currentGameState.currentPixelLevel 
    });

    currentGameState.challengeTimer = setInterval(() => {
        if (currentGameState.currentPixelLevel > 2) {
            currentGameState.currentPixelLevel -= 4; 
            currentGameState.currentPixelLevel = Math.max(2, currentGameState.currentPixelLevel);
            io.to(roomId).emit('updatePixelLevel', currentGameState.currentPixelLevel);
        } else {
            clearInterval(currentGameState.challengeTimer);
        }
    }, 5000); 
}


const getCleanGameState = () => {
    return {
        answer: currentGameState.answer,
        currentPixelLevel: currentGameState.currentPixelLevel,
        players: currentGameState.players,
    };
};


module.exports = (io) => {
    
    const socketAuthMiddleware = async (socket, next) => {
        const token = socket.handshake.query.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId; 
            socket.username = decoded.username; 
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    };
    
    io.use(socketAuthMiddleware); 
    
    io.on('connection', (socket) => {
        console.log(`✓ ${socket.username} connected via Socket.IO`);
        
        socket.on('joinRoom', async (roomId) => {
            socket.join(roomId);
            
            if (!currentGameState.players[socket.id]) {
                currentGameState.players[socket.id] = { 
                    userId: socket.userId, 
                    username: socket.username, 
                    score: 0 
                };
            }
            
            
            io.to(roomId).emit('updateGameState', getCleanGameState());

            
            const instructions = `🏆 كيف ألعب؟: ستعرض صورة مبكسلة، خمنها! النقاط تعتمد على سرعتك في تخمين الصوره البداية 160 نقطة.
            سيقل التغبيش تلقائيا مع الوقت اضغط زر التلميح لتسريع فك التغبيش عند الحاجة !
 كل ما قل التغبيش قلت النقاط الكتسبة! 🍀`;

            io.to(roomId).emit('guessMessage', { 
                username: "النظام", 
                text: instructions 
            });
            
            
            if (Object.keys(currentGameState.players).length === 1) {
                startNewChallenge(io, roomId);
            }
        });

   
        socket.on('requestHint', (roomId) => {
            if (currentGameState.currentPixelLevel > 2) {
                currentGameState.currentPixelLevel = Math.max(2, currentGameState.currentPixelLevel - 3); 
                io.to(roomId).emit('updatePixelLevel', currentGameState.currentPixelLevel);
            }
        });
        
        socket.on('submitGuess', async ({ guessText }) => {
            const normalizedGuess = guessText.toUpperCase().trim();
            const roomId = Array.from(socket.rooms)[1]; 

            if (normalizedGuess === currentGameState.answer.toUpperCase()) { 
                const score = calculateScore(currentGameState.currentPixelLevel);
                
                currentGameState.players[socket.id].score += score;
                
                io.to(roomId).emit('roundWinner', { 
                    winner: socket.username, 
                    score: score, 
                    answer: currentGameState.answer 
                });
                
           
                io.to(roomId).emit('updateGameState', getCleanGameState()); 

                clearInterval(currentGameState.challengeTimer);
                setTimeout(() => startNewChallenge(io, roomId), 5000);
            } else {
                io.to(roomId).emit('guessMessage', { 
                    username: socket.username, 
                    text: guessText 
                });
            }
        });

        socket.on('disconnect', () => {
            delete currentGameState.players[socket.id];
       
            io.emit('updateGameState', getCleanGameState());
            console.log(`✗ ${socket.username} disconnected`);
        });
    });
};
