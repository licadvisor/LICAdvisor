document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Update the validateName function
    function validateName(name) {
        const nameRegex = /^[A-Za-z\s]+$/;
        return name.length >= 3 && nameRegex.test(name);
    }

    // Update the validatePhone function
    function validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone);
    }

    // Add this to handle phone input
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        this.value = value;
        
        const formGroup = this.parentElement;
        if (value.length > 0) {
            if (validatePhone(value)) {
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

    // Add this to handle name input
    fullNameInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^A-Za-z\s]/g, '');
        this.value = value;
    });
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Real-time validation for full name
    fullNameInput.addEventListener('input', function() {
        const formGroup = this.parentElement;
        if (this.value.length > 0) {
            if (validateName(this.value)) {
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

    // Real-time validation for phone
    phoneInput.addEventListener('input', function() {
        const formGroup = this.parentElement;
        if (this.value.length > 0) {
            if (validatePhone(this.value)) {
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
            if (validatePassword(this.value)) {
                formGroup.classList.remove('invalid');
                formGroup.classList.add('valid');
            } else {
                formGroup.classList.remove('valid');
                formGroup.classList.add('invalid');
            }
        } else {
            formGroup.classList.remove('valid', 'invalid');
        }
        validateConfirmPassword();
    });

    // Real-time validation for confirm password
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    function validateConfirmPassword() {
        const formGroup = confirmPasswordInput.parentElement;
        if (confirmPasswordInput.value.length > 0) {
            if (confirmPasswordInput.value === passwordInput.value) {
                formGroup.classList.remove('invalid');
                formGroup.classList.add('valid');
            } else {
                formGroup.classList.remove('valid');
                formGroup.classList.add('invalid');
            }
        } else {
            formGroup.classList.remove('valid', 'invalid');
        }
    }

    

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        registerForm.insertBefore(messageDiv, registerForm.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Reset form on page load
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            registerForm.reset();
        }
    });

    registerForm.reset();
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('valid', 'invalid');
    });

    if (typeof generateCaptcha === 'function') {
        generateCaptcha();
    }
});