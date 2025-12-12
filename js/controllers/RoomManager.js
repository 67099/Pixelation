// في ملف js/controllers/RoomManager.js

class RoomManager {
    constructor(apiBaseUrl, wsUrl, roomUpdateCallback) {
        this.apiBaseUrl = apiBaseUrl;
        this.wsUrl = wsUrl;
        this.roomUpdateCallback = roomUpdateCallback;
        this.token = null; 
        this.socket = null;
    }

    setToken(token) {
        this.token = token;
    }

    async authenticate(mode, username, password) {
        const endpoint = mode === 'login' ? '/login' : '/register';
        
        try {
            const response = await fetch(this.apiBaseUrl + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                // الخطأ الذي كان يظهر (Unexpected token '<') كان هنا قبل تصحيح server.js
                throw new Error(data.msg || 'Authentication failed');
            }

            this.token = data.token;
            localStorage.setItem('jwtToken', this.token);
            
            return data;
        } catch (error) {
            console.error('Auth Error:', error.message);
            throw error;
        }
    }

    connectSocket() {
        if (!this.token) {
            console.error('Cannot connect Socket: Token is missing.');
            return;
        }

        // **التصحيح:** إرسال التوكن في الـ query فقط
        this.socket = io(this.wsUrl, {
            query: { token: this.token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });

        this.setupSocketListeners();
        this.socket.on('connect', () => {
            console.log('✓ Socket connected');
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    setupSocketListeners() {
        this.socket.on('updateGameState', (gameState) => {
            this.roomUpdateCallback('updateGameState', gameState);
        });
        
        this.socket.on('newChallenge', (challengeData) => {
            this.roomUpdateCallback('newChallenge', challengeData);
        });

        this.socket.on('updatePixelLevel', (pixelLevel) => {
            this.roomUpdateCallback('updatePixelLevel', pixelLevel);
        });

        this.socket.on('roundWinner', (data) => {
            this.roomUpdateCallback('correctGuess', data);
        });
        
        this.socket.on('guessMessage', (data) => {
            this.roomUpdateCallback('guessMessage', data);
        });
    }

    joinStaticRoom(roomId) {
        if (this.socket) {
            this.socket.emit('joinRoom', roomId);
        }
    }
    
    submitGuess(guessText) {
        if (this.socket && guessText) {
            this.socket.emit('submitGuess', { guessText });
        }
    }
    
    // دالة جديدة لإرسال طلب HINT إلى الخادم
    requestHint(roomId = 'main-room') {
        if (this.socket) {
            this.socket.emit('requestHint', roomId);
        }
    }
}