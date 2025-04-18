// Add this after your existing form validation code
let emailVerified = false;
let resendTimer;
let resendCount = 0;

// Keep only one showOTPVerification function (the first one with better styling)
function showOTPVerification() {
    const otpHTML = `
        <div id="otpVerification" class="modal fade show" style="display: block; background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050;">
            <div class="modal-dialog modal-dialog-centered" style="margin-top: 15vh;">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Email Verification</h5>
                    </div>
                    <div class="modal-body">
                        <p class="text-center">We've sent a verification code to <strong id="verificationEmail"></strong></p>
                        <div class="otp-input-container d-flex justify-content-center gap-2 mb-3">
                            <input type="text" maxlength="6" class="form-control text-center" id="otpInput" placeholder="Enter 6-digit code">
                        </div>
                        <div class="text-center">
                            <button class="btn btn-primary px-4" id="verifyButton" onclick="verifyOTP()">
                                <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                                <span class="button-text">Verify Code</span>
                            </button>
                            <button class="btn btn-link" onclick="resendOTP()">Resend Code</button>
                        </div>
                        <div id="otpMessage" class="mt-3 text-center"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('otpVerification');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', otpHTML);
    document.getElementById('verificationEmail').textContent = document.getElementById('email').value;
}


// Remove the duplicate verifyOTP function and keep only one version
// Remove the duplicate event listeners at the bottom of the file
// Keep the cleanupOTPVerification function
async function verifyOTP() {
    const verifyButton = document.getElementById('verifyButton');
    const spinner = verifyButton.querySelector('.spinner-border');
    const buttonText = verifyButton.querySelector('.button-text');
    const otpInput = document.getElementById('otpInput');
    
    verifyButton.disabled = true;
    spinner.classList.remove('d-none');
    buttonText.textContent = 'Verifying...';

    try {
        const response = await fetch('/customer/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: otpInput.value })
        });
        const data = await response.json();
        
        if (data.success) {
            emailVerified = true;
            document.getElementById('otpVerification').remove();
            // Get form data and submit
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };
            
            const registerResponse = await fetch('/customer/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const registerData = await registerResponse.json();
            if (registerData.success) {
                toastr.success('Registration successful!');
                setTimeout(() => {
                    window.location.href = '/customer/login';
                }, 2000);
            } else {
                toastr.error(registerData.message);
            }
        } else {
            document.getElementById('otpMessage').innerHTML = `
                <div class="alert alert-danger">${data.message}</div>
            `;
        }
    } catch (error) {
        document.getElementById('otpMessage').innerHTML = `
            <div class="alert alert-danger">Failed to verify code</div>
        `;
    } finally {
        verifyButton.disabled = false;
        spinner.classList.add('d-none');
        buttonText.textContent = 'Verify Code';
    }
}



// Remove any duplicate event listeners from customer-register.js
// Remove the duplicate verifyOTP function and keep only one version
// Remove the duplicate event listeners at the bottom of the file
// Keep the cleanupOTPVerification function
// Remove the first verifyOTP function and keep this updated version
async function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    try {
        const response = await fetch('/customer/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                otp,
                registrationData: window.registrationData 
            })
        });
        
        const data = await response.json();
        if (data.success) {
            // Hide OTP modal
            document.getElementById('otpModal').style.display = 'none';
            
            // Remove any existing success popup
            const existingOverlay = document.querySelector('.popup-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Show success popup
            const successPopupHTML = `
                <div class="popup-overlay active">
                    <div class="success-popup active">
                        <div class="icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2>Registration Successful!</h2>
                        <p>Your account has been created successfully.</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', successPopupHTML);
            
            // Remove toastr success message if any
            if (typeof toastr !== 'undefined') {
                toastr.clear();
            }
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = '/customer/login';
            }, 2000);
        } else {
            document.getElementById('otpError').textContent = data.message || 'Verification failed';
        }
    } catch (error) {
        document.getElementById('otpError').textContent = 'Verification failed. Please try again.';
    }
}



function cleanupOTPVerification() {
    if (resendTimer) {
        clearInterval(resendTimer);
    }
    const modal = document.getElementById('otpVerification');
    if (modal) {
        modal.remove();
    }
    resendCount = 0;
    emailVerified = false;
} // Added missing closing brace


// Keep only one DOMContentLoaded event listener and form submission handler
// Update the form submission handler with loading state
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Add loading state to submit button
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating account...';
            
            const formData = {
                email: document.getElementById('email').value,
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value
            };
            
            try {
                const response = await fetch('/customer/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (data.requireOTP) {
                    window.registrationData = formData;
                    
                    // Clear previous OTP inputs
                    const otpInputs = document.querySelectorAll('.otp-input');
                    otpInputs.forEach(input => input.value = '');
                    
                    // Show OTP modal
                    document.getElementById('otpModal').style.display = 'block';
                    document.getElementById('userEmail').textContent = formData.email;
                    
                    // Focus on first OTP input
                    if (otpInputs.length > 0) {
                        otpInputs[0].focus();
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                toastr.error('Failed to process registration');
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    }
});

// Fix the resend OTP function
window.resendOTP = async function() {
    const resendButton = document.querySelector('.resend-code');
    if (!resendButton || resendButton.disabled) return;
    
    try {
        // Disable button and show loading
        resendButton.disabled = true;
        const originalText = resendButton.textContent;
        resendButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
        
        const response = await fetch('/customer/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: window.registrationData.email 
            })
        });
        
        const data = await response.json();
        if (data.success) {
            // Clear existing OTP inputs
            const otpInputs = document.querySelectorAll('.otp-input');
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
            
            // Show success message
            toastr.success('New verification code sent!');
            
            // Start countdown timer
            let countdown = 30;
            resendButton.disabled = true;
            const timer = setInterval(() => {
                resendButton.textContent = `Resend in ${countdown}s`;
                countdown--;
                if (countdown < 0) {
                    clearInterval(timer);
                    resendButton.disabled = false;
                    resendButton.textContent = 'Resend Code';
                }
            }, 1000);
        } else {
            toastr.error(data.message || 'Failed to send code');
            resendButton.disabled = false;
            resendButton.textContent = originalText;
        }
    } catch (error) {
        console.error('Resend error:', error);
        toastr.error('Failed to send verification code');
        resendButton.disabled = false;
        resendButton.textContent = originalText;
    }
};