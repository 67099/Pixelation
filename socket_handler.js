// في ملف socket_handler.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key'; 

let currentGameState = {
    answer: 'MONA LISA', 
    currentPixelLevel: 30, // مستوى التغبيش الأولي
    players: {}, 
    challengeTimer: null,
    
    // الإجابات الإنجليزية فقط (للتوافق مع المنطق الحالي)
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

// الدوال المساعدة (تم نقلها للأعلى لتجنب ReferenceError)

function calculateScore(pixelLevel) {
    // 10 + (30 * 5) = 160 نقطة في البداية
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

// دالة لتنظيف حالة اللعبة من المراجع الدائرية (لحل RangeError)
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
            
            // 🚨 استخدام الكائن النظيف عند الانضمام
            io.to(roomId).emit('updateGameState', getCleanGameState());

            // 🚨🚨 إضافة رسالة التعليمات هنا 🚨🚨
            const instructions = `🏆 كيف ألعب؟: ستعرض صورة مبكسلة، خمنها! النقاط تعتمد على سرعتك في تخمين الصوره البداية 160 نقطة.
            سيقل التغبيش تلقائيا مع الوقت اضغط زر التلميح لتسريع فك التغبيش عند الحاجة !
 كل ما قل التغبيش قلت النقاط الكتسبة! 🍀`;

            io.to(roomId).emit('guessMessage', { 
                username: "النظام", 
                text: instructions 
            });
            // 🚨 نهاية إضافة رسالة التعليمات
            
            if (Object.keys(currentGameState.players).length === 1) {
                startNewChallenge(io, roomId);
            }
        });

        // **منطق زر HINT**
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
                
                // استخدام الكائن النظيف عند تحديث النقاط (لحل RangeError)
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
            // استخدام الكائن النظيف عند قطع الاتصال (لحل RangeError)
            io.emit('updateGameState', getCleanGameState());
            console.log(`✗ ${socket.username} disconnected`);
        });
    });
};