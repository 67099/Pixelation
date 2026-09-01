// في ملف js/views/GameRoomView.js

class GameRoomView {
    constructor(containerElement, guessSubmitCallback, hintRequestCallback) { 
        this.container = containerElement;
        this.guessSubmitHandler = guessSubmitCallback;
        this.hintRequestHandler = hintRequestCallback; 

        this.renderGameLayout(); 
        
        this.playersList = this.container.querySelector('#players-list');
        this.chatMessages = this.container.querySelector('#chat-messages');
        this.hintButton = this.container.querySelector('#hint-button'); 
        
        this.setupEventListeners();
    }

renderGameLayout() {
        this.container.innerHTML = `
            <div class="game-layout">

                <div class="game-main">
                    <div class="crt-frame">
                        <canvas id="game-canvas" width="600" height="400"></canvas>
                    </div>

                    <button id="hint-button" class="pixel-btn">!اضغط لتقليل تشويش الصورة!</button>

                    <div id="scoreboard-area" class="pixel-panel">
                        <div class="panel-header">لوحة المتصدرين</div>
                        <ul id="players-list"></ul>
                    </div>
                </div>

                <div id="chat-area" class="pixel-panel">
                    <div class="panel-header">اكتب توقعك (Real-Time)</div>

                    <div id="chat-messages"></div>

                    <form id="guess-form" class="guess-bar">
                        <input type="text" id="guess-input" class="pixel-input" placeholder="...بالانقليزي اكتب تخمينك هنا" required>
                        <button class="pixel-btn pixel-btn-alt" type="submit" id="send-guess-btn">إرسال</button>
                    </form>
                </div>

            </div>
        `;
    }

    setupEventListeners() {
        const form = this.container.querySelector('#guess-form');
        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        if (this.hintButton) {
            this.hintButton.addEventListener('click', this.handleHint.bind(this));
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const input = this.container.querySelector('#guess-input');
        const guessText = input.value.trim();
        if (guessText) {
            this.guessSubmitHandler(guessText);
            input.value = ''; 
        }
    }
    
    handleHint() {
        if (this.hintRequestHandler) {
            this.hintRequestHandler(); 
        }
    }

// في ملف js/views/GameRoomView.js (دالة addChatMessage)

    addChatMessage(username, text, isWinner = false) {
        const messages = this.container.querySelector('#chat-messages');
        const msgElement = document.createElement('p');

        if (username === "النظام") {
            msgElement.className = 'chat-msg system';
            msgElement.textContent = text;
        } else if (isWinner) {
            msgElement.className = 'chat-msg winner';
            const who = document.createElement('span');
            who.className = 'who';
            who.textContent = username;
            msgElement.appendChild(who);
            msgElement.appendChild(document.createElement('br'));
            msgElement.appendChild(document.createTextNode(`صح عليك!: ${text}`));
        } else {
            msgElement.className = 'chat-msg';
            const who = document.createElement('span');
            who.className = 'who';
            who.textContent = `${username}:`;
            msgElement.appendChild(who);
            msgElement.appendChild(document.createTextNode(` ${text}`));
        }

        messages.appendChild(msgElement);
        messages.scrollTop = messages.scrollHeight;
    }

    updateScoreboard(playersState) {
        this.playersList.innerHTML = '';
        const sortedPlayers = Object.values(playersState).sort((a, b) => b.score - a.score);

        sortedPlayers.forEach((player, i) => {
            const listItem = document.createElement('li');
            const rankLabel = `#${i + 1}`;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${rankLabel} ${player.username}`;

            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'score-badge';
            scoreSpan.textContent = player.score;

            listItem.appendChild(nameSpan);
            listItem.appendChild(scoreSpan);
            this.playersList.appendChild(listItem);
        });
    }
}