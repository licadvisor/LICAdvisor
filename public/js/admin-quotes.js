document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentPage = 1;
    let searchQuery = '';
    let sortOrder = 'newest';

    // Fetch and display quotes
    async function loadQuotes() {
        try {
            const response = await fetch(`/admin/quotes-data?page=${currentPage}&search=${searchQuery}&sort=${sortOrder}`);
            const data = await response.json();
            
            const quotesList = document.getElementById('quotesList');
            quotesList.innerHTML = '';

            if (data.quotes.length === 0) {
                quotesList.innerHTML = '<p class="no-quotes">No quote requests found</p>';
                return;
            }

            data.quotes.forEach(quote => {
                const quoteElement = document.createElement('div');
                quoteElement.className = 'quote-item';
                quoteElement.innerHTML = `
                    <div class="quote-card">
                        <div class="quote-header">
                            <div class="quote-primary-info">
                                <div class="user-avatar">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <div class="user-details">
                                    <h3>${quote.name}</h3>
                                    <div class="contact-info">
                                        <span>
                                            <i class="fas fa-envelope"></i>
                                            <a href="mailto:${quote.email}" class="contact-link">${quote.email}</a>
                                        </span>
                                        <span>
                                            <i class="fas fa-phone"></i>
                                            <a href="tel:${quote.mobile || ''}" class="contact-link">${quote.mobile || 'N/A'}</a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="quote-meta">
                                <div class="timestamp">
                                    <i class="far fa-clock"></i>
                                    ${new Date(quote.createdAt).toLocaleString()}
                                </div>
                                <div class="quote-actions">
                                    <button class="view-btn" onclick="viewQuoteDetails(this)">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    <button class="delete-btn" onclick="deleteQuote('${quote._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="quote-details" style="display: none;">
                            <div class="details-grid">
                                <div class="detail-card">
                                    <div class="detail-icon"><i class="fas fa-map-marker-alt"></i></div>
                                    <div class="detail-content">
                                        <h4>Location</h4>
                                        <p>${quote.city || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="detail-card">
                                    <div class="detail-icon"><i class="fas fa-clipboard-list"></i></div>
                                    <div class="detail-content">
                                        <h4>Plan Interest</h4>
                                        <p>${quote.planInterest || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="detail-card">
                                    <div class="detail-icon"><i class="fas fa-calendar-alt"></i></div>
                                    <div class="detail-content">
                                        <h4>Submitted</h4>
                                        <p>${new Date(quote.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="message-section">
                                <h4><i class="fas fa-comment-alt"></i> Message</h4>
                                <p>${quote.message || 'No message provided'}</p>
                            </div>
                        </div>
                    `;
                    quotesList.appendChild(quoteElement);
                });
            updatePagination(data.totalPages);
        } catch (error) {
            console.error('Error loading quotes:', error);
        }
    }

    // Update pagination controls
    function updatePagination(totalPages) {
        const pagination = document.getElementById('quotesPagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            button.textContent = i;
            button.onclick = () => {
                currentPage = i;
                loadQuotes();
            };
            pagination.appendChild(button);
        }
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            currentPage = 1;
            loadQuotes();
        }, 300);
    });

    // Sort functionality
    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', (e) => {
        sortOrder = e.target.value;
        currentPage = 1;
        loadQuotes();
    });

    // Initial load
    loadQuotes();
});

// View quote details function
function viewQuoteDetails(button) {
    const quoteItem = button.closest('.quote-item');
    const detailsSection = quoteItem.querySelector('.quote-details');
    const isVisible = detailsSection.style.display === 'block';
    
    detailsSection.style.display = isVisible ? 'none' : 'block';
    button.innerHTML = isVisible ? 
        '<i class="fas fa-eye"></i> View' : 
        '<i class="fas fa-eye-slash"></i> Hide';
}

// Delete quote function
async function deleteQuote(quoteId) {
    // Create and show confirmation modal
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon warning">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="modal-title">Confirm Deletion</h3>
            <p class="modal-message">Are you sure you want to delete this quote request? This action cannot be undone.</p>
            <div class="modal-buttons">
                <button class="modal-btn confirm">Delete</button>
                <button class="modal-btn cancel">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);

    // Handle button clicks
    return new Promise((resolve) => {
        modal.querySelector('.modal-btn.confirm').onclick = async () => {
            try {
                const response = await fetch(`/admin/delete-quote/${quoteId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Show success message
                    modal.querySelector('.modal-box').innerHTML = `
                        <div class="modal-icon success">
                            <i class="fas fa-check success-checkmark"></i>
                        </div>
                        <h3 class="modal-title">Successfully Deleted</h3>
                        <p class="modal-message">The quote request has been deleted.</p>
                    `;
                    
                    setTimeout(() => {
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.remove();
                            location.reload();
                        }, 300);
                    }, 1500);
                }
            } catch (error) {
                console.error('Delete error:', error);
                modal.remove();
            }
        };

        modal.querySelector('.modal-btn.cancel').onclick = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };
    });
}