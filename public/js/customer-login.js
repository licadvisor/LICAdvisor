// Add this validation script
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Real-time validation for email
    emailInput.addEventListener('input', function() {
        const formGroup = this.parentElement;
        if (this.value.length > 0) {
            if (validateEmail(this.value)) {
                formGroup.classList.remove('invalid');
                formGroup.classList.add('valid');
            } else {
                formGroup.classList.remove('valid');
                formGroup.classList.add('invalid');
            }
        } else {
            formGroup.classList.remove('valid', 'invalid');
        }
    });

    // Real-time validation for password
    passwordInput.addEventListener('input', function() {
        const formGroup = this.parentElement;
        if (this.value.length > 0) {
            if (this.value.length >= 6) {
                formGroup.classList.remove('invalid');
                formGroup.classList.add('valid');
            } else {
                formGroup.classList.remove('valid');
                formGroup.classList.add('invalid');
            }
        } else {
            formGroup.classList.remove('valid', 'invalid');
        }
    });

    // Form submission handler
    // Add this function before the form submission handler
    function showSuccessPopup(userName) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        document.body.appendChild(overlay);
    
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.innerHTML = `
            <div class="icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Welcome Back!</h2>
            <p class="user-name">${userName || 'User'}</p>
            <p class="redirect-text">Redirecting to your dashboard<span class="loading-dots"></span></p>
        `;
        document.body.appendChild(popup);
    
        // Show overlay and popup with animation
        setTimeout(() => {
            overlay.classList.add('active');
            popup.classList.add('active');
        }, 100);
    }
    
    // Update the form submission handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('/customer/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value,
                    remember: document.querySelector('input[name="remember"]').checked
                })
            });
    
            const data = await response.json();
    
            if (data.success) {
                showSuccessPopup(data.userName);
                setTimeout(() => {
                    window.location.href = data.redirectUrl;
                }, 2000);
            } else {
                showMessage(data.message || 'Invalid credentials', 'error');
                generateCaptcha();
                document.getElementById('captchaInput').value = '';
            }
        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        }
    });

    // Message display function
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        loginForm.insertBefore(messageDiv, loginForm.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Add this form reset functionality
    window.addEventListener('pageshow', function(event) {
        // Reset form if page is loaded from cache
        if (event.persisted) {
            loginForm.reset();
        }
    });

    // Reset form when page loads
    loginForm.reset();
    
    // Remove any validation classes
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('valid', 'invalid');
    });

    // Clear captcha input and generate new captcha
    if (typeof generateCaptcha === 'function') {
        generateCaptcha();
    }
});