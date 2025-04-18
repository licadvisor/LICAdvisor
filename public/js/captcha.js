// Add this function at the beginning of the file
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    const ctx = canvas.getContext('2d');
    const captchaText = generateRandomString(6);
    
    // Store captcha text in window object for global access
    window.currentCaptcha = captchaText;
    
    // Set canvas size
    canvas.width = 200;
    canvas.height = 40;
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise (dots)
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            2,
            2
        );
    }
    
    // Add lines
    for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // Add text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#1e4c9a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(captchaText, canvas.width/2, canvas.height/2);
    
    return captchaText;
}

// Add click event listener for refresh button
document.getElementById('refreshCaptcha')?.addEventListener('click', generateCaptcha);

// Call generateCaptcha when page loads
document.addEventListener('DOMContentLoaded', generateCaptcha);