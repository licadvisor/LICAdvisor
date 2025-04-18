document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('premiumForm');
    
    // Show error message
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message') || document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(errorDiv);
        }
        input.classList.add('error');
    }
    
    // Remove error message
    function removeError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            formGroup.removeChild(errorDiv);
        }
        input.classList.remove('error');
    }
    
    // Validate form before submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
    
        // Plan Type validation
        const planType = document.getElementById('planType');
        if (!planType.value) {
            showError(planType, 'Please select a plan type');
            isValid = false;
        } else {
            removeError(planType);
        }
    
        // DOB validation
        const dob = document.getElementById('dob');
        if (!dob.value) {
            showError(dob, 'Please enter your date of birth');
            isValid = false;
        } else {
            removeError(dob);
        }
    
        // Gender validation
        const gender = document.getElementById('gender');
        if (!gender.value) {
            showError(gender, 'Please select your gender');
            isValid = false;
        } else {
            removeError(gender);
        }
    
        // Sum Assured validation
        const sumAssured = document.getElementById('sumAssured');
        if (!sumAssured.value) {
            showError(sumAssured, 'Please enter sum assured amount');
            isValid = false;
        } else if (parseInt(sumAssured.value.replace(/,/g, '')) < 100000) {
            showError(sumAssured, 'Sum assured must be at least ₹1,00,000');
            isValid = false;
        } else {
            removeError(sumAssured);
        }
    
        // Term validation
        const term = document.getElementById('term');
        if (!term.value) {
            showError(term, 'Please enter policy term');
            isValid = false;
        } else if (term.value < 5 || term.value > 40) {
            showError(term, 'Policy term must be between 5 and 40 years');
            isValid = false;
        } else {
            removeError(term);
        }
    
        // Payment Mode validation
        const paymentMode = document.getElementById('paymentMode');
        if (!paymentMode.value) {
            showError(paymentMode, 'Please select payment mode');
            isValid = false;
        } else {
            removeError(paymentMode);
        }
    
        if (isValid) {
            calculatePremium();
        }
    });
    
    // Real-time validation on input
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function() {
            removeError(this);
        });
    });

    // DOB input formatting
    const dobInput = document.getElementById('dob');
    dobInput.setAttribute('placeholder', 'DD-MM-YYYY');
    
    dobInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        let formattedDate = '';
        
        if (value.length > 0) {
            if (value.length <= 2) {
                formattedDate = value;
            } else if (value.length <= 4) {
                formattedDate = value.slice(0, 2) + '-' + value.slice(2);
            } else {
                formattedDate = value.slice(0, 2) + '-' + value.slice(2, 4) + '-' + value.slice(4, 8);
            }
        }
        
        this.value = formattedDate;
    });

    dobInput.addEventListener('keydown', function(e) {
        // Allow: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        // Stop if not a number
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
            (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
});
// Update the calculatePremium function
function calculatePremium() {
    const planType = document.getElementById('planType').value;
    const dob = document.getElementById('dob').value;
    const gender = document.getElementById('gender').value;
    const sumAssured = parseInt(document.getElementById('sumAssured').value.replace(/,/g, ''));
    const term = parseInt(document.getElementById('term').value);
    const paymentMode = document.getElementById('paymentMode').value;

    // Calculate age
    const age = calculateAge(dob);

    // Basic premium calculation
    let premium = calculateBasicPremium(sumAssured, age, term, planType, gender, paymentMode);

    // Store results in localStorage
    const results = {
        planType: document.getElementById('planType').options[document.getElementById('planType').selectedIndex].text,
        age: age,
        sumAssured: sumAssured,
        term: term,
        paymentMode: document.getElementById('paymentMode').options[document.getElementById('paymentMode').selectedIndex].text,
        premium: premium
    };
    
    localStorage.setItem('premiumResults', JSON.stringify(results));

    // Redirect to results page
    window.location.href = '/calculator/results';
}
function calculateAge(dob) {
    const [day, month, year] = dob.split('-');
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateBasicPremium(sumAssured, age, term, planType, gender, paymentMode) {
    // Base rate per thousand of sum assured (based on LIC's typical rates)
    let baseRate;
    
    if (age < 25) {
        baseRate = 70;  // per 1000 sum assured
    } else if (age <= 35) {
        baseRate = 75;
    } else if (age <= 45) {
        baseRate = 85;
    } else if (age <= 55) {
        baseRate = 100;
    } else {
        baseRate = 120;
    }

    // Calculate basic annual premium
    let basePremium = (sumAssured / 1000) * baseRate;

    // Plan type adjustments (based on LIC's typical plan factors)
    const planFactors = {
        'endowment': 1.15,    // Higher premium due to savings component
        'wholeLife': 1.25,    // Higher due to lifetime coverage
        'moneyBack': 1.20,    // Higher due to money-back benefits
        'term': 0.35,         // Lower as pure risk coverage
        'pension': 1.30,      // Higher due to pension benefits
        'ulip': 1.10          // Market-linked returns
    };
    basePremium *= planFactors[planType] || 1;

    // Payment mode factors (standard LIC factors)
    const modeFactors = {
        'yearly': 1,
        'halfYearly': 0.512,  // LIC's standard half-yearly factor
        'quarterly': 0.259,   // LIC's standard quarterly factor
        'monthly': 0.087      // LIC's standard monthly factor
    };
    basePremium *= modeFactors[paymentMode];

    // Gender adjustment (females generally get a lower premium)
    if (gender === 'female') {
        basePremium *= 0.95;
    }

    // Term length adjustment
    if (term > 25) {
        basePremium *= 1.1;
    }

    return basePremium;
}

function displayResults(premium) {
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('basicPremium').textContent = `₹${Math.round(premium).toLocaleString('en-IN')}`;
    document.getElementById('totalPremium').textContent = `₹${Math.round(premium).toLocaleString('en-IN')}`;
}

function resetForm() {
    document.getElementById('premiumForm').reset();
    document.getElementById('resultSection').style.display = 'none';
}