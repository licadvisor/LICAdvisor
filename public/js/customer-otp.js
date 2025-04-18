// Global OTP handling functions
window.sendOTP = async function(email) {
    try {
        const response = await fetch('/customer/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('otpModal').style.display = 'block';
            toastr.success('Verification code sent to your email');
        } else {
            toastr.error(data.message || 'Failed to send verification code');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        toastr.error('Failed to send verification code');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value) {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });

        input.addEventListener('focus', function() {
            this.select();
        });
    });

    // Update verifyOTP function to work with new input fields
    window.verifyOTP = async function() {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        const email = document.getElementById('email').value;
        
        try {
            const response = await fetch('/customer/verify-otp', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Add this to ensure session cookies are sent
                    'credentials': 'include'
                },
                body: JSON.stringify({ 
                    otp,
                    email, // Include email in verification request
                    registrationData: window.registrationData // Include registration data
                })
            });
        
            const data = await response.json();
            if (data.success) {
                // Hide OTP modal
                document.getElementById('otpModal').style.display = 'none';
                toastr.success('Registration successful!');
                
                // Redirect to login page after success
                setTimeout(() => {
                    window.location.href = '/customer/login';
                }, 2000);
            } else {
                document.getElementById('otpError').textContent = data.message || 'Verification failed';
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            document.getElementById('otpError').textContent = 'Verification failed. Please try again.';
        }
    };

    // Add this function to store registration data
    window.storeRegistrationData = function(data) {
        window.registrationData = data;
    };
    
    // Show user's email in the modal
    window.showOTPModal = function(email) {
        document.getElementById('userEmail').textContent = email;
        document.getElementById('otpModal').style.display = 'block';
        otpInputs[0].focus();
    };
});