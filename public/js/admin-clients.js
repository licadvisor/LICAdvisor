document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let currentFilter = 'all';
    const searchInput = document.getElementById('searchInput');
    const filterChips = document.querySelectorAll('.filter-chip');

    // Load initial data
    loadClients();

    // Search functionality with debouncing
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadClients();
        }, 300);
    });

    // Filter functionality
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            loadClients();
        });
    });

    function loadClients() {
        const searchQuery = searchInput.value;
        fetch(`/admin/clients-data?page=${currentPage}&search=${searchQuery}&filter=${currentFilter}`)
            .then(response => response.json())
            .then(data => {
                displayClients(data.clients);
                updatePagination(data.totalPages);
            })
            .catch(error => console.error('Error:', error));
    }

    function displayClients(clients) {
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = '';

        clients.forEach(client => {
            const row = document.createElement('tr');
            const createdDate = new Date(client.createdAt).toLocaleDateString();
            
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone || client.mobile}</td>
                <td>${client.policyType || 'N/A'}</td>
                <td><span class="status-badge ${client.status?.toLowerCase()}">${client.status || 'New'}</span></td>
                <td>${createdDate}</td>
                <td class="client-actions">
                    <button class="view-btn" onclick="viewClient('${client._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-btn" onclick="editClient('${client._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteClient('${client._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function updatePagination(totalPages) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.classList.toggle('active', i === currentPage);
            button.addEventListener('click', () => {
                currentPage = i;
                loadClients();
            });
            pagination.appendChild(button);
        }
    }

    // Client actions
    window.viewClient = function(id) {
        fetch(`/admin/client/${id}`)
            .then(response => response.json())
            .then(client => {
                const modal = document.getElementById('clientModal');
                const details = document.getElementById('clientDetails');
                details.innerHTML = `
                    <p><strong>Name:</strong> ${client.name}</p>
                    <p><strong>Email:</strong> ${client.email}</p>
                    <p><strong>Phone:</strong> ${client.phone || client.mobile}</p>
                    <p><strong>Policy Type:</strong> ${client.policyType || 'N/A'}</p>
                    <p><strong>Status:</strong> ${client.status || 'New'}</p>
                    <p><strong>Created:</strong> ${new Date(client.createdAt).toLocaleString()}</p>
                    <p><strong>Message:</strong> ${client.message || 'No message'}</p>
                `;
                modal.style.display = 'block';
            });
    };

    // Close modal
    const modal = document.getElementById('clientModal');
    const span = document.getElementsByClassName('close')[0];
    span.onclick = function() {
        modal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});