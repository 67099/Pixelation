// في ملف js/views/AuthenticatorView.js

class AuthenticatorView {
    constructor(containerElement, submitCallback) {
        this.container = containerElement;
        this.submitHandler = submitCallback;
        this.isLoginMode = true; 
        
   
        this.form = this.container.querySelector('#auth-form');
        this.title = this.container.querySelector('#auth-title');
        this.submitButton = this.container.querySelector('#auth-submit'); 
        this.toggleLink = this.container.querySelector('#toggle-auth-mode');
        this.usernameInput = this.container.querySelector('#username');
        this.passwordInput = this.container.querySelector('#password');
        
        this.setupEventListeners(); 
        this.render(); 
    }

    setupEventListeners() {
        if (this.form && this.toggleLink) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            this.toggleLink.addEventListener('click', this.toggleMode.bind(this));
        } else {
             console.error("Auth elements not found in DOM.");
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        const mode = this.isLoginMode ? 'login' : 'register';

        if (this.submitHandler) {
            this.submitHandler(mode, username, password);
        }
    }

    toggleMode(event) {
        event.preventDefault();
        this.isLoginMode = !this.isLoginMode;
        this.render();
    }

    render() {
        // **التأكد من وجود العناصر قبل تعيين النص**
        if (this.title && this.toggleLink && this.submitButton) {
            if (this.isLoginMode) {
                this.title.textContent = 'تسجيل الدخول إلى Pixel Hunt';
                this.toggleLink.textContent = 'ليس لديك حساب؟ اشترك الآن';
                this.submitButton.textContent = 'دخول'; 
            } else {
                this.title.textContent = 'إنشاء حساب جديد';
                this.toggleLink.textContent = 'هل لديك حساب بالفعل؟ تسجيل الدخول';
                this.submitButton.textContent = 'اشتراك'; 
            }
        }
        this.container.style.display = 'block';
    }
}
