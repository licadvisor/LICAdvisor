document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let searchQuery = '';
    let sortOrder = 'newest';

    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const dashboard = document.querySelector('.dashboard-container');
    
    sidebarToggle.addEventListener('click', () => {
        dashboard.classList.toggle('sidebar-collapsed');
    });

    async function loadMessages() {
        try {
            const response = await fetch(`/admin/contacts/contacts-data?page=${currentPage}&search=${searchQuery}&sort=${sortOrder}`);
            const data = await response.json();
            
            const messagesList = document.getElementById('messagesList');
            messagesList.innerHTML = '';

            if (data.messages.length === 0) {
                messagesList.innerHTML = '<p class="no-quotes">No messages found</p>';
                return;
            }
            // Remove client-side sorting and use data directly as received from server
            data.messages.forEach(message => {
                const messageElement = document.createElement('div');
                messageElement.className = 'quote-item';
                messageElement.innerHTML = `
                    <div class="quote-card">
                        <div class="quote-header">
                            <div class="quote-primary-info">
                                <div class="user-avatar">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="user-details">
                                    <h3>${message.name}</h3>
                                    <div class="contact-info">
                                        <span>
                                            <i class="fas fa-envelope"></i>
                                            <a href="mailto:${message.email}" class="contact-link">${message.email}</a>
                                        </span>
                                        <span>
                                            <i class="fas fa-phone"></i>
                                            <a href="tel:${message.phone}" class="contact-link">${message.phone || 'N/A'}</a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="quote-meta">
                                <div class="timestamp">
                                    <i class="far fa-clock"></i>
                                    ${message._id ? new Date(parseInt(message._id.substring(0, 8), 16) * 1000).toLocaleString() : 'N/A'}
                                </div>
                                <div class="quote-actions">
                                    <button class="view-btn" onclick="viewMessageDetails(this)">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    <button class="delete-btn" onclick="deleteMessage('${message._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="quote-details" style="display: none;">
                            <div class="details-grid">
                                <div class="detail-card">
                                    <div class="detail-icon"><i class="fas fa-tag"></i></div>
                                    <div class="detail-content">
                                        <h4>Subject</h4>
                                        <p>${message.subject || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="detail-card">
                                    <div class="detail-icon"><i class="fas fa-calendar-alt"></i></div>
                                    <div class="detail-content">
                                        <h4>Received On</h4>
                                        <p>${message._id ? new Date(parseInt(message._id.substring(0, 8), 16) * 1000).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="message-section">
                                <h4><i class="fas fa-comment-alt"></i> Message</h4>
                                <p>${message.message || 'No message provided'}</p>
                            </div>
                        </div>
                    </div>
                `;
                messagesList.appendChild(messageElement);
            });

            updatePagination(data.totalPages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    function updatePagination(totalPages) {
        const pagination = document.getElementById('messagesPagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            button.textContent = i;
            button.onclick = () => {
                currentPage = i;
                loadMessages();
            };
            pagination.appendChild(button);
        }
    }

    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            currentPage = 1;
            loadMessages();
        }, 300);
    });

    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', (e) => {
        sortOrder = e.target.value;
        currentPage = 1;
        loadMessages();
    });

    loadMessages();
});

function viewMessageDetails(button) {
    const messageItem = button.closest('.quote-item');
    const detailsSection = messageItem.querySelector('.quote-details');
    const isVisible = detailsSection.style.display === 'block';
    
    detailsSection.style.display = isVisible ? 'none' : 'block';
    button.innerHTML = isVisible ? 
        '<i class="fas fa-eye"></i> View Details' : 
        '<i class="fas fa-eye-slash"></i> Hide Details';
}

async function deleteMessage(messageId) {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon warning">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="modal-title">Confirm Deletion</h3>
            <p class="modal-message">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div class="modal-buttons">
                <button class="modal-btn confirm">Delete</button>
                <button class="modal-btn cancel">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 10);

    return new Promise((resolve) => {
        modal.querySelector('.modal-btn.confirm').onclick = async () => {
            try {
                const response = await fetch(`/admin/contacts/delete-contact/${messageId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    modal.querySelector('.modal-box').innerHTML = `
                        <div class="modal-icon success">
                            <i class="fas fa-check success-checkmark"></i>
                        </div>
                        <h3 class="modal-title">Successfully Deleted</h3>
                        <p class="modal-message">The message has been deleted.</p>
                    `;
                    
                    setTimeout(() => {
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.remove();
                            window.location.reload(); // Reload to show updated list
                        }, 300);
                    }, 1500);
                } else {
                    throw new Error('Failed to delete message');
                }
            } catch (error) {
                console.error('Delete error:', error);
                modal.remove();
                alert('Failed to delete message. Please try again.');
            }
        };

        modal.querySelector('.modal-btn.cancel').onclick = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };
    });
}