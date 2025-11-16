// Enhanced Interactive Symptom Categories
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.category-card');
    const sections = document.querySelectorAll('.detail-section');
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const categoryDetails = document.getElementById('categoryDetails');

    // Card click handler with enhanced animations
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.dataset.target;
            
            // Remove active class from all cards
            cards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            card.classList.add('active');
            
            // Hide all sections with animation
            sections.forEach(sec => {
                sec.classList.remove('active');
            });
            
            // Show the selected section with delay for smooth transition
            setTimeout(() => {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    
                    // Smooth scroll to section
                    setTimeout(() => {
                        targetSection.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }, 100);
                }
            }, 200);
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // Show/hide clear button
            if (searchTerm.length > 0) {
                clearSearch.style.display = 'flex';
            } else {
                clearSearch.style.display = 'none';
            }
            
            // Filter cards
            cards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // If search is cleared, show all cards
            if (searchTerm === '') {
                cards.forEach(card => {
                    card.style.display = 'block';
                });
            }
        });
    }

    // Clear search
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            clearSearch.style.display = 'none';
            cards.forEach(card => {
                card.closest('.category-card').style.display = 'block';
            });
            searchInput.focus();
        });
    }

    // Close detail section function (called from HTML)
    window.closeDetailSection = function() {
        sections.forEach(sec => sec.classList.remove('active'));
        cards.forEach(c => c.classList.remove('active'));
        
        // Scroll to top of categories
        setTimeout(() => {
            document.querySelector('.categories-grid').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Close detail section with Escape key
        if (e.key === 'Escape') {
            const activeSection = document.querySelector('.detail-section.active');
            if (activeSection) {
                closeDetailSection();
            }
        }
    });

    // Add fade-in animation for cards on load
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe info cards
    document.querySelectorAll('.info-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
});
