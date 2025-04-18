document.addEventListener('DOMContentLoaded', function() {
    const policyDropdowns = document.querySelectorAll('.dropdown');

    policyDropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const content = dropdown.querySelector('.dropdown-content');

        // Handle hover for desktop
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                content.style.display = 'block';
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                content.style.display = 'none';
            }
        });

        // Handle click for mobile
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
    });
});