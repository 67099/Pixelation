

class App {
    constructor() {
        this.token = localStorage.getItem('jwtToken');
        this.username = localStorage.getItem('username');
        this.imageRenderer = null; 
        this.gameRoomView = null;

        const serverUrl = window.location.protocol + '//' + window.location.host;
        
        this.roomManager = new RoomManager(
            '/api/auth', 
            serverUrl,
            this.handleRoomUpdates.bind(this)
        );
        
        if (this.token) {
            this.roomManager.setToken(this.token);
            this.initGameView(); 
        } else {
            this.initAuthView(); 
        }
    }

    initAuthView() {
        document.getElementById('game-room-section').style.display = 'none';
        const authContainer = document.getElementById('auth-section');
        this.authView = new AuthenticatorView(authContainer, this.handleAuth.bind(this));
    }

    initGameView() {
        document.getElementById('auth-section').style.display = 'none';
        const gameContainer = document.getElementById('game-room-section');
        gameContainer.style.display = 'block';

        if (!this.gameRoomView) {
        
            this.gameRoomView = new GameRoomView(
                gameContainer, 
                this.handleGuessSubmission.bind(this),
                this.handleHintRequest.bind(this) 
            );
        }
        
        if (!this.imageRenderer) {
            this.imageRenderer = new ImageRenderer('game-canvas'); 
        }
        
        if (!this.roomManager.socket && this.roomManager.token) {
            this.roomManager.connectSocket();
            
            if (this.roomManager.socket) {
                this.roomManager.socket.on('connect', () => {
                    console.log("Socket connected, joining room.");
                    this.roomManager.joinStaticRoom('main-room'); 
                });
            }
        }
        
      
        const infoModal = document.getElementById('info-modal');
        const howToPlayBtn = document.getElementById('how-to-play-btn');
        const closeBtn = document.getElementsByClassName('close-btn')[0];

        if (howToPlayBtn && infoModal) {
           
            howToPlayBtn.onclick = function() {
                infoModal.style.display = 'block';
            }
            
            
            closeBtn.onclick = function() {
                infoModal.style.display = 'none';
            }
            
         
            window.onclick = function(event) {
                if (event.target == infoModal) {
                    infoModal.style.display = 'none';
                }
            }
        }
    }

    handleHintRequest() {
        this.roomManager.requestHint();
    }
    
    handleGuessSubmission(guessText) {
        if (this.roomManager.socket) {
            this.roomManager.submitGuess(guessText);
        }
    }

    async handleAuth(mode, username, password) {
        if (!username || !password) {
            alert("Please enter username and password.");
            return;
        }

        try {
            const data = await this.roomManager.authenticate(mode, username, password);
            
            localStorage.setItem('username', data.username || username);
            localStorage.setItem('jwtToken', data.token); 
            localStorage.setItem('userId', data.userId);

            this.roomManager.setToken(data.token);
            this.initGameView(); 

        } catch (error) {
            alert(error.message);
            console.error(error);
        }
    }

    handleRoomUpdates(type, payload) {
        if (type === 'updateGameState') {
            if (this.gameRoomView) {
                this.gameRoomView.updateScoreboard(payload.players);
            }
        } else if (type === 'newChallenge') {
            if (this.imageRenderer) {
                this.imageRenderer.loadNewImage(`/images/${payload.image}`, payload.pixelLevel);
            }
        } else if (type === 'updatePixelLevel') {
            if (this.imageRenderer) {
                this.imageRenderer.render(payload); 
            }
        } else if (type === 'correctGuess') {
            if (this.imageRenderer && this.gameRoomView) {
                this.imageRenderer.render(1); 
                this.gameRoomView.addChatMessage(payload.winner, `خمّن الإجابة الصحيحة: ${payload.answer}`, true);
                
                if (typeof confetti !== 'undefined') {
                    confetti({
                        particleCount: 150,
                        spread: 90,
                        origin: { x: 0.5, y: 0.6 },
                        colors: ['#ff2e63', '#08f7fe', '#f9ed69', '#39ff88']
                    });
                }
            }
        } else if (type === 'guessMessage') {
             if (this.gameRoomView) {
                this.gameRoomView.addChatMessage(payload.username, payload.text);
             }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});