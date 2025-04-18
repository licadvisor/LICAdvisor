document.addEventListener('DOMContentLoaded', function() {
    const mobileInput = document.getElementById('mobile');
    const emailInput = document.getElementById('email');
    const emailValidationMessage = document.querySelector('.email-validation-message');
    const quoteForm = document.getElementById('quoteForm');

    // Mobile validation
    mobileInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });

    // Email validation
    emailInput.addEventListener('input', function() {
        const email = this.value;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (email && !emailRegex.test(email)) {
            emailValidationMessage.textContent = 'Please enter a valid email address';
            this.setCustomValidity('Invalid email address');
        } else {
            emailValidationMessage.textContent = '';
            this.setCustomValidity('');
        }
    });

    // Form submission
    quoteForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate mobile
        if (mobileInput.value.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }

        // Create form data
        const formData = {
            name: document.getElementById('name').value,
            mobile: mobileInput.value,
            email: emailInput.value,
            city: document.getElementById('city').value,
            planInterest: document.getElementById('planInterest').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/submit-quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = '/thank-you';
            } else {
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit form. Please try again.');
        }
    });
});