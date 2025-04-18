function initializeDownloadButtons() {
    const downloadButtons = document.querySelectorAll('.brochure-btn--download');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const downloadUrl = this.href;
            const originalText = this.innerHTML;
            
            const progress = document.createElement('div');
            progress.className = 'download-progress';
            
            this.innerHTML = `<span class="download-text">0%</span>`;
            this.appendChild(progress);
            this.classList.add('downloading');
            
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    this.innerHTML = `<span class="download-text">Success!</span>`;
                    
                    // Start download immediately at 100%
                    window.location.href = downloadUrl;
                    
                    setTimeout(() => {
                        this.innerHTML = `<span class="download-text">Downloaded</span>`;
                        
                        // Reset button after download starts
                        setTimeout(() => {
                            this.innerHTML = originalText;
                            this.classList.remove('downloading');
                        }, 1500);
                    }, 800);
                } else {
                    width += 2;
                    progress.style.width = width + '%';
                    this.querySelector('.download-text').textContent = width + '%';
                }
            }, 30);
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeDownloadButtons);