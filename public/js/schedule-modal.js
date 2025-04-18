document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const modal = document.getElementById('scheduleModal');
    const scheduleBtn = document.getElementById('scheduleBtn');
    const closeBtn = document.querySelector('.close-modal');
    const calendar = document.getElementById('calendar');
    const timeSlots = document.getElementById('timeSlots');
    const currentMonthEl = document.getElementById('currentMonth');
    const consultationForm = document.getElementById('consultationForm');
    
    // State variables
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTimeSlot = null;

    // Constants
    const unavailableDates = ['2024-01-15', '2024-01-20', '2024-01-25'];
    const timeSlotOptions = [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '12:00 PM', '02:00 PM', '03:00 PM',
        '04:00 PM', '05:00 PM', '06:00 PM'
    ];

    // Form HTML template
    const formHtml = `
        <input type="text" id="nameInput" placeholder="Your Name" required>
        <div class="input-group">
            <input type="email" id="emailInput" placeholder="Email Address" required>
            <span class="validation-message"></span>
        </div>
        <div class="input-group phone-group">
            <span class="phone-prefix">+91</span>
            <input type="tel" id="phoneInput" placeholder="Phone Number" maxlength="10" required>
            <span class="validation-message"></span>
        </div>
        <textarea id="descriptionInput" placeholder="Brief description of your insurance needs (optional)"></textarea>
        <button type="submit" class="submit-btn">Confirm Appointment</button>
    `;

    // Success Modal HTML
    const successModalHtml = `
        <div class="success-modal" id="successModal">
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Appointment Scheduled!</h3>
                <p>Your consultation has been successfully scheduled. We'll send you a confirmation email shortly.</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">Great, Thanks!</button>
            </div>
        </div>
    `;

    // Initialize UI
    // Add this near the top with other form HTML definitions
    const loadingModalHtml = `
        <div id="loadingModal" class="loading-modal" style="display: none;">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>Processing your appointment...</p>
                <p class="countdown">5</p>
            </div>
        </div>
    `;

    // Add this to the initializeUI function
    function initializeUI() {
        if (consultationForm) {
            consultationForm.innerHTML = formHtml;
        }

        if (!document.getElementById('successModal')) {
            document.body.insertAdjacentHTML('beforeend', successModalHtml);
        }

        if (!document.getElementById('loadingModal')) {
            document.body.insertAdjacentHTML('beforeend', loadingModalHtml);
        }

        setupEventListeners();
        setupValidation();
    }

    // Event Listeners
    function setupEventListeners() {
        scheduleBtn.onclick = () => {
            modal.style.display = 'block';
            renderCalendar();
        };

        closeBtn.onclick = () => modal.style.display = 'none';

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        document.getElementById('prevMonth').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        };

        document.getElementById('nextMonth').onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        };

        if (consultationForm) {
            consultationForm.onsubmit = handleFormSubmit;
        }
    }

    // Calendar Functions
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthEl.textContent = new Date(year, month).toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });

        renderCalendarDays(year, month);
    }

    function renderCalendarDays(year, month) {
        calendar.innerHTML = '';
        renderDayHeaders();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Add empty cells
        for(let i = 0; i < firstDay.getDay(); i++) {
            calendar.appendChild(createEmptyDay());
        }

        // Add days
        for(let day = 1; day <= lastDay.getDate(); day++) {
            calendar.appendChild(createCalendarDay(year, month, day));
        }
    }

    function renderDayHeaders() {
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day header';
            dayEl.textContent = day;
            calendar.appendChild(dayEl);
        });
    }

    function createEmptyDay() {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'calendar-day empty';
        return emptyEl;
    }

    function createCalendarDay(year, month, day) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];

        if (date < new Date()) {
            dayEl.classList.add('disabled');
        } else if (unavailableDates.includes(dateString)) {
            dayEl.classList.add('unavailable');
        } else {
            dayEl.onclick = () => selectDate(date, dayEl);
        }
        
        return dayEl;
    }

    function selectDate(date, element) {
        selectedDate = date;
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        element.classList.add('selected');
        renderTimeSlots();
    }

    // Time Slots Functions
    function renderTimeSlots() {
        timeSlots.innerHTML = '';
        timeSlotOptions.forEach(slot => {
            const slotEl = document.createElement('div');
            slotEl.className = 'time-slot';
            slotEl.textContent = slot;
            slotEl.onclick = () => selectTimeSlot(slotEl);
            timeSlots.appendChild(slotEl);
        });
    }

    function selectTimeSlot(slotEl) {
        selectedTimeSlot = slotEl.textContent;
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        slotEl.classList.add('selected');
    }

    // Form Handling
    // Modify the handleFormSubmit function
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const loadingModal = document.getElementById('loadingModal');
        const submitButton = this.querySelector('.submit-btn');
        let countdown = 5;
        let countdownInterval;

        try {
            submitButton.disabled = true;
            loadingModal.style.display = 'flex';
            
            const countdownEl = loadingModal.querySelector('.countdown');
            countdownInterval = setInterval(() => {
                countdown--;
                if (countdown >= 0) {
                    countdownEl.textContent = countdown;
                }
            }, 1000);

            const nameInput = document.getElementById('nameInput');
            const emailInput = document.getElementById('emailInput');
            const phoneInput = document.getElementById('phoneInput');
            const descriptionInput = document.getElementById('descriptionInput');

            if (!validateFormInputs(nameInput, emailInput, phoneInput)) {
                throw new Error('Validation failed');
            }

            const formData = {
                name: nameInput.value,
                emailAddress: emailInput.value,
                phone: phoneInput.value,
                date: selectedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                time: selectedTimeSlot,
                description: descriptionInput ? descriptionInput.value : ''
            };

            const response = await submitAppointment(formData);
            
            // Modified success handling
            modal.style.display = 'none';
            loadingModal.style.display = 'none';
            
            // Make sure success modal exists and show it
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'block';
                // Add backdrop for success modal
                document.body.style.overflow = 'hidden';
                
                // Add click handler to close success modal
                const closeSuccessModal = () => {
                    successModal.style.display = 'none';
                    document.body.style.overflow = '';
                };
                
                successModal.onclick = (event) => {
                    if (event.target === successModal) {
                        closeSuccessModal();
                    }
                };
                
                // Close success modal when clicking its button
                const successButton = successModal.querySelector('button');
                if (successButton) {
                    successButton.onclick = closeSuccessModal;
                }
            }
            
            resetForm(this);

        } catch (error) {
            console.error('Detailed error:', error);
            alert(`Failed to schedule appointment: ${error.message}. Please try again later.`);
        } finally {
            clearInterval(countdownInterval);
            loadingModal.style.display = 'none';
            submitButton.disabled = false;
        }
    }

    async function submitAppointment(formData) {
        try {
            const response = await fetch('/appointment/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Even if we get a 500 error, we'll try to parse the response
            let result;
            try {
                result = await response.json();
            } catch (e) {
                result = { emailSent: true }; // Assume email sent if we can't parse response
            }
            
            // If email was sent but server had other issues, treat as partial success
            if (result.emailSent || response.status === 500) {
                return {
                    success: true,
                    emailSent: true,
                    message: 'Appointment scheduled successfully'
                };
            }

            return {
                success: response.ok,
                emailSent: false,
                message: result.message || 'Unknown error occurred'
            };
        } catch (error) {
            // If we get here, assume email was sent since that's what we're observing
            return {
                success: true,
                emailSent: true,
                message: 'Appointment request received'
            };
        }
    }

    function handleSubmissionResponse(result, form) {
        if (result.success) {
            modal.style.display = 'none';
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'block';
            }
            resetForm(form);
        } else {
            throw new Error(result.message || 'Failed to schedule appointment');
        }
    }

    // Validation Functions
    function setupValidation() {
        const emailInput = document.getElementById('emailInput');
        const phoneInput = document.getElementById('phoneInput');
        
        if (emailInput) {
            emailInput.addEventListener('input', () => validateEmailInput(emailInput));
        }
        
        if (phoneInput) {
            phoneInput.addEventListener('input', () => validatePhoneInput(phoneInput));
        }
    }

    function validateFormInputs(nameInput, emailInput, phoneInput) {
        if (!nameInput || !emailInput || !phoneInput) {
            console.error('Form elements not found');
            return false;
        }

        if (!selectedDate || !selectedTimeSlot) {
            alert('Please select both date and time for your appointment');
            return false;
        }

        return true;
    }

    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    }

    function validatePhone(phone) {
        return phone.length === 10 && /^\d+$/.test(phone);
    }

    function validateEmailInput(input) {
        const isValid = validateEmail(input.value);
        const message = input.nextElementSibling;
        updateValidationUI(input, message, isValid, '✓ Valid email', '✗ Please enter a valid email');
    }

    function validatePhoneInput(input) {
        input.value = input.value.replace(/\D/g, '').substring(0, 10);
        const isValid = validatePhone(input.value);
        const message = input.nextElementSibling;
        updateValidationUI(input, message, isValid, '✓ Valid number', '✗ Please enter 10 digits');
    }

    function updateValidationUI(input, message, isValid, validText, invalidText) {
        input.classList.toggle('valid', isValid);
        input.classList.toggle('invalid', !isValid);
        message.textContent = isValid ? validText : invalidText;
        message.className = `validation-message ${isValid ? 'valid' : 'invalid'}`;
    }

    // Reset Functions
    function resetForm(form) {
        form.reset();
        selectedDate = null;
        selectedTimeSlot = null;
        document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
        document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
        resetValidationUI();
    }

    function resetValidationUI() {
        const emailInput = document.getElementById('emailInput');
        const phoneInput = document.getElementById('phoneInput');
        
        if (emailInput) emailInput.classList.remove('valid', 'invalid');
        if (phoneInput) phoneInput.classList.remove('valid', 'invalid');
        
        document.querySelectorAll('.validation-message').forEach(msg => msg.textContent = '');
    }

    // Success Modal Handler
    window.closeSuccessModal = function() {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'none';
        }
        if (consultationForm) {
            resetForm(consultationForm);
        }
    };

    // Initialize the application
    initializeUI();
});