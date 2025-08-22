document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    const searchSubmit = document.querySelector('.search-submit');
    const campaignCards = document.querySelectorAll('.campaign-card');

    // Filter functionality
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            filterCampaigns(filterValue);
        });
    });

    // Sort functionality
    sortSelect.addEventListener('change', function() {
        sortCampaigns(this.value);
    });

    // Search functionality
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        searchCampaigns(searchTerm);
    }

    searchSubmit.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Filter campaigns by category
    function filterCampaigns(category) {
        campaignCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Search campaigns
    function searchCampaigns(searchTerm) {
        campaignCards.forEach(card => {
            const title = card.querySelector('.campaign-title').textContent.toLowerCase();
            const description = card.querySelector('.campaign-description').textContent.toLowerCase();
            const category = card.querySelector('.campaign-category').textContent.toLowerCase();
            const creator = card.querySelector('.campaign-creator').textContent.toLowerCase();

            if (title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                category.includes(searchTerm) || 
                creator.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Sort campaigns
    function sortCampaigns(sortBy) {
        const campaignsGrid = document.getElementById('campaignsGrid');
        const cardsArray = Array.from(campaignCards);
        
        cardsArray.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return 0; // Keep original order for demo
                case 'ending-soon':
                    const daysA = parseInt(a.querySelector('.stat:last-child .stat-value').textContent);
                    const daysB = parseInt(b.querySelector('.stat:last-child .stat-value').textContent);
                    return daysA - daysB;
                case 'most-funded':
                    const raisedA = parseInt(a.querySelector('.stat:first-child .stat-value').textContent.replace(/[^0-9]/g, ''));
                    const raisedB = parseInt(b.querySelector('.stat:first-child .stat-value').textContent.replace(/[^0-9]/g, ''));
                    return raisedB - raisedA;
                case 'goal-amount':
                    const goalA = parseInt(a.querySelector('.stat:nth-child(2) .stat-value').textContent.replace(/[^0-9]/g, ''));
                    const goalB = parseInt(b.querySelector('.stat:nth-child(2) .stat-value').textContent.replace(/[^0-9]/g, ''));
                    return goalB - goalA;
                default:
                    return 0;
            }
        });

        // Clear and re-append sorted cards
        campaignsGrid.innerHTML = '';
        cardsArray.forEach(card => {
            campaignsGrid.appendChild(card);
        });
    }

    // Support button functionality
    document.querySelectorAll('.support-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const campaignTitle = this.closest('.campaign-card').querySelector('.campaign-title').textContent;
            alert(`Thank you for your interest in supporting "${campaignTitle}"!\n\nThis would redirect to the campaign details page.`);
        });
    });

    // Add hover animations
    campaignCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Animate progress bars on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress-fill');
                const width = progressBar.style.width;
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 200);
            }
        });
    }, observerOptions);

    campaignCards.forEach(card => {
        observer.observe(card);
    });
});
