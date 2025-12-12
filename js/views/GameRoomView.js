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
        // هذا الكود يستعيد الترتيب النظيف الذي كان مستقراً في واجهتك
        this.container.innerHTML = `
            <div class="row justify-content-center">
                
                <div class="col-md-7 text-center">
                    
                    <div class="image-frame mb-4 mx-auto" style="width: fit-content;">
                        <canvas id="game-canvas" width="600" height="400"></canvas>
                    </div>
                    
                    <div class="d-grid gap-2 mb-4 mx-auto" style="max-width: 600px;">
                        <button id="hint-button" class="btn btn-warning btn-lg">!اضغط لتقليل تشويش الصورة!</button>
                    </div>

                    <div id="scoreboard-area" class="card mx-auto" style="max-width: 600px;">
                        <div class="card-header">
                            <h5 class="mb-0 text-center">🏆 لوحة المتصدرين 🏆</h5>
                        </div>
                        <ul id="players-list" class="list-group list-group-flush">
                        </ul>
                    </div>
                </div>

                <div class="col-md-5">
                    <div id="chat-area" class="card">
                        <div class="card-header">
                            <span>اكتب توقعك !(Real-Time)</span>
                        </div>
                        
                        <div id="chat-messages" class="card-body d-flex flex-column" style="height: 450px; overflow-y: auto;">
                        </div>
                        
                        <div class="card-footer">
                            <form id="guess-form" class="input-group">
                                <input type="text" id="guess-input" class="form-control" placeholder="...بالانقليزي اكتب تخمينك هنا" required>
                                <button class="btn btn-success" type="submit" id="send-guess-btn">إرسال</button>
                            </form>
                        </div>
                    </div>
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
        
        // 🚨 التصحيح: معالجة رسالة النظام أولاً لضمان ظهورها بتنسيق alert
        if (username === "النظام") {
            msgElement.className = 'alert alert-info py-1 mb-1 text-center'; 
            msgElement.innerHTML = `<strong>${text}</strong>`;
        } else if (isWinner) {
            // منطق رسالة الفائز (تنسيق أصفر/أحمر)
            msgElement.className = 'mb-1 p-2 border border-warning rounded';
            msgElement.style.backgroundColor = 'var(--accent-yellow)';
            msgElement.innerHTML = `<strong style="color: red;">🔥 ${username}</strong><span style="display: block; font-weight: bold;"> صح عليك !: ${text}</span>`;
        } else {
            // منطق الرسائل العادية
            msgElement.className = 'mb-1 small text-muted';
            msgElement.innerHTML = `<strong>${username}:</strong> ${text}`;
        }
        
        messages.appendChild(msgElement);
        messages.scrollTop = messages.scrollHeight; 
    }

    updateScoreboard(playersState) {
        this.playersList.innerHTML = '';
        const sortedPlayers = Object.values(playersState).sort((a, b) => b.score - a.score);

        sortedPlayers.forEach(player => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <span>${player.username}</span>
                <span class="badge bg-info rounded-pill">${player.score}</span>
            `;
            this.playersList.appendChild(listItem);
        });
    }
}