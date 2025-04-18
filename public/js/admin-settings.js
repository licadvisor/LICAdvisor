document.addEventListener('DOMContentLoaded', function() {
    const recoveryForm = document.getElementById('recovery-form');
    const notification = document.getElementById('notification');

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function showPopup(message, type) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        overlay.style.display = 'block';
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = `popup ${type}`;
        popup.style.display = 'block';
        
        const icon = document.createElement('i');
        icon.className = `popup-icon fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'popup-message';
        messageDiv.textContent = message;
        
        const button = document.createElement('button');
        button.className = 'popup-button';
        button.textContent = 'OK';
        
        popup.appendChild(icon);
        popup.appendChild(messageDiv);
        popup.appendChild(button);
        document.body.appendChild(popup);
        
        button.onclick = function() {
            overlay.remove();
            popup.remove();
        };
    }

    recoveryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(recoveryForm);

        try {
            const response = await fetch('/admin/settings/update-recovery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: formData.get('currentPassword'),
                    newRecoveryCode: formData.get('newRecoveryCode')
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                showPopup('Recovery code updated successfully!', 'success');
                recoveryForm.reset();
            } else {
                showPopup(data.error || 'Failed to update recovery code', 'error');
            }
        } catch (error) {
            console.error('Recovery code update error:', error);
            showPopup('Error updating recovery code. Please try again.', 'error');
        }
    });
});