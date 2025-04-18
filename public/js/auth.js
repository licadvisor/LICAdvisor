// Captcha generation and validation
function generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captchaText').textContent = captcha;
    return captcha;
}

let currentCaptcha = generateCaptcha();

document.getElementById('refreshCaptcha').addEventListener('click', () => {
    currentCaptcha = generateCaptcha();
});

// Form handling
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const captchaInput = document.getElementById('captchaInput').value;

    if (captchaInput !== currentCaptcha) {
        showMessage('Invalid captcha', 'error');
        return;
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, captcha: captchaInput })
        });

        const data = await response.json();
        
        if (data.success) {
            showMessage('Login successful', 'success');
            window.location.href = data.redirectUrl;
        } else {
            showMessage(data.message, 'error');
            currentCaptcha = generateCaptcha();
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
        currentCaptcha = generateCaptcha();
    }
});

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.querySelector('.auth-box').prepend(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}