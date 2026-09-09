// في ملف js/views/GameRoomView.js

class GameRoomView {
    constructor(containerElement, guessSubmitCallback, logoutCallback) {
        this.container = containerElement;
        this.guessSubmitHandler = guessSubmitCallback;
        this.logoutHandler = logoutCallback;

        this.renderGameLayout();

        this.playersList = this.container.querySelector('#players-list');
        this.chatMessages = this.container.querySelector('#chat-messages');
        this.progressFill = this.container.querySelector('#pixel-progress-fill');
        this.progressLabel = this.container.querySelector('#pixel-progress-label');
        this.logoutButton = this.container.querySelector('#logout-btn');
        this.usernameLabel = this.container.querySelector('#current-username');

        this.setupEventListeners();
    }

renderGameLayout() {
        this.container.innerHTML = `
            <div class="game-topbar">
                <span id="current-username"></span>
                <button id="logout-btn" class="pixel-btn pixel-btn-ghost">تسجيل الخروج</button>
            </div>

            <div class="game-layout">

                <div class="game-main">
                    <div class="crt-frame">
                        <canvas id="game-canvas" width="600" height="400"></canvas>
                    </div>

                    <div id="pixel-progress">
                        <div id="pixel-progress-track">
                            <div id="pixel-progress-fill"></div>
                        </div>
                        <span id="pixel-progress-label">وضوح الصورة: 0%</span>
                    </div>

                    <div id="scoreboard-area" class="pixel-panel">
                        <div class="panel-header">لوحة المتصدرين</div>
                        <ul id="players-list"></ul>
                    </div>
                </div>

                <div id="chat-area" class="pixel-panel">
                    <div class="panel-header">اكتب توقعك (Real-Time)</div>

                    <div id="chat-messages"></div>

                    <form id="guess-form" class="guess-bar">
                        <input type="text" id="guess-input" class="pixel-input" placeholder="بالانقليزي اكتب تخمينك هنا" required>
                        <button class="pixel-btn pixel-btn-alt" type="submit" id="send-guess-btn">إرسال</button>
                    </form>
                </div>

            </div>
        `;
    }

    setupEventListeners() {
        const form = this.container.querySelector('#guess-form');
        form.addEventListener('submit', this.handleSubmit.bind(this));

        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => {
                if (this.logoutHandler) this.logoutHandler();
            });
        }
    }

    setSession(username, isGuest) {
        if (this.usernameLabel) this.usernameLabel.textContent = username || '';
        if (this.logoutButton) this.logoutButton.textContent = isGuest ? 'رجوع' : 'تسجيل الخروج';
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

    updatePixelProgress(pixelLevel, maxPixelLevel, minPixelLevel = 2) {
        const range = Math.max(1, maxPixelLevel - minPixelLevel);
        const clarity = Math.round(((maxPixelLevel - pixelLevel) / range) * 100);
        const clamped = Math.min(100, Math.max(0, clarity));

        if (this.progressFill) this.progressFill.style.width = `${clamped}%`;
        if (this.progressLabel) this.progressLabel.textContent = `وضوح الصورة: ${clamped}%`;
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
            msgElement.appendChild(document.createTextNode(text));
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
