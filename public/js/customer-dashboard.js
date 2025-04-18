// Make showRequestForm globally accessible
window.showRequestForm = function(type) {
    const modal = document.getElementById('requestModal');
    const requestType = document.getElementById('requestType');
    const policyTypeGroup = document.getElementById('policyTypeGroup');
    
    modal.style.display = 'block';
    requestType.value = type;
    
    if (type === 'policy') {
        policyTypeGroup.style.display = 'block';
    } else {
        policyTypeGroup.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Handle notifications
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            // Add notification functionality here
            alert('Notifications feature coming soon!');
        });
    }

    // Handle policy card clicks
    const policyCards = document.querySelectorAll('.view-details-btn');
    policyCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add policy details view functionality here
            alert('Policy details view coming soon!');
        });
    });

    // Add active class to current nav item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.parentElement.classList.add('active');
        }
    });

    // Request Form Handling
    // Initialize modal close handlers
    const closeModal = document.querySelector('.close-modal');
    const requestModal = document.getElementById('requestModal');
    
    if (closeModal && requestModal) {
        closeModal.onclick = function() {
            requestModal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == requestModal) {
                requestModal.style.display = 'none';
            }
        }
    }

    // Initialize form submission
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const formData = {
                requestType: document.getElementById('requestType').value,
                policyType: document.getElementById('policyType').value,
                preferredTime: document.getElementById('preferredTime').value,
                message: document.getElementById('message').value
            };
        
            try {
                const response = await fetch('/customer/submit-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
        
                const data = await response.json();
                if (data.success) {
                    alert('Request submitted successfully!');
                    requestModal.style.display = 'none';
                    requestForm.reset();
                } else {
                    alert(data.message || 'Failed to submit request');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }
    }
});