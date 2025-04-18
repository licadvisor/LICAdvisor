document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top on page refresh
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                const formMessage = document.querySelector('.form-message');
                if (result.success) {
                    formMessage.textContent = result.message;
                    formMessage.className = 'form-message success';
                    this.reset(); // Reset form on success
                } else {
                    formMessage.textContent = result.message;
                    formMessage.className = 'form-message error';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                const formMessage = document.querySelector('.form-message');
                formMessage.textContent = 'An error occurred. Please try again later.';
                formMessage.className = 'form-message error';
            }
        });
    }
    // Fix form field navigation
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
    
    formInputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            // Only handle Tab key navigation
            if (e.key === 'Tab') {
                const nextInput = formInputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                }
            }
        });
    });
    // Image Slider
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    
    // Only initialize slider if slides exist
    if (slides.length > 0) {
        // Show first slide initially
        slides[0].classList.add('active');
        
        // Function to change slide
        function showSlide(index) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = index;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }
        
        // Handle dot clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Auto advance slides
        function nextSlide() {
            let nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        }
        
        // Change slide every 5 seconds
        setInterval(nextSlide, 5000);
    }
    // Testimonial Slider - Updated code
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (testimonialSlider && testimonialCards.length > 0) {
        let currentIndex = 0;
        const totalCards = testimonialCards.length;
        const visibleCards = Math.min(4, totalCards);
    
        // Initialize slider
        function initSlider() {
            // Reset all cards
            testimonialCards.forEach(card => card.style.display = 'none');
            
            // Show initial set of cards
            for (let i = 0; i < visibleCards; i++) {
                testimonialCards[i].style.display = 'block';
            }
        }
    
        // Slide to next card
        function slideNext() {
            // Hide first visible card
            testimonialCards[currentIndex].style.display = 'none';
            
            // Calculate next card to show
            let nextShowIndex = (currentIndex + visibleCards) % totalCards;
            testimonialCards[nextShowIndex].style.display = 'block';
            
            // Update current index
            currentIndex = (currentIndex + 1) % totalCards;
        }
    
        // Initialize the slider
        initSlider();
    
        // Only start auto-sliding if we have more than visible cards
        if (totalCards > visibleCards) {
            setInterval(slideNext, 3000);
        }
    }
    // Remove everything after this point (remove the duplicate initTestimonialSlider function)
});