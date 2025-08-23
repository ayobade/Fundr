let dbName = 'CampaignImageDB';
let dbVersion = 1;
let db = null;

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            if (!db.objectStoreNames.contains('campaignImages')) {
                const store = db.createObjectStore('campaignImages', { keyPath: 'campaignId' });
                store.createIndex('campaignId', 'campaignId', { unique: true });
            }
        };
    });
}

function getImagesFromIndexedDB(campaignId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction(['campaignImages'], 'readonly');
        const store = transaction.objectStore('campaignImages');
        const request = store.get(campaignId);
        
        request.onsuccess = () => {
            if (request.result) {
                resolve({
                    coverImage: request.result.coverImage,
                    galleryImages: request.result.galleryImages
                });
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    const searchSubmit = document.querySelector('.search-submit');
    let campaignCards = document.querySelectorAll('.campaign-card');
    let observer;

    initIndexedDB().then(() => {
        loadUserCampaigns();
    }).catch(error => {
        console.error('Failed to initialize IndexedDB:', error);
        loadUserCampaigns();
    });

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            filterCampaigns(filterValue);
        });
    });

    sortSelect.addEventListener('change', function() {
        sortCampaigns(this.value);
    });

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

    function sortCampaigns(sortBy) {
        const campaignsGrid = document.getElementById('campaignsGrid');
        const cardsArray = Array.from(campaignCards);
        
        cardsArray.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return 0;
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

        campaignsGrid.innerHTML = '';
        cardsArray.forEach(card => {
            campaignsGrid.appendChild(card);
        });
    }

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    observer = new IntersectionObserver((entries) => {
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

    bindCampaignCardEvents();

    campaignCards.forEach(card => {
        observer.observe(card);
    });

    async function loadUserCampaigns() {
        const userCampaigns = JSON.parse(localStorage.getItem('userCampaigns') || '[]');
        const campaignsGrid = document.getElementById('campaignsGrid');
        
        if (!campaignsGrid) return;

        const sortedCampaigns = userCampaigns.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.id);
            const dateB = new Date(b.createdAt || b.id);
            return dateB.getTime() - dateA.getTime();
        });

        for (const campaign of sortedCampaigns.reverse()) {
            const campaignCard = await createCampaignCard(campaign);
            campaignsGrid.insertBefore(campaignCard, campaignsGrid.firstChild);
        }

        campaignCards = document.querySelectorAll('.campaign-card');
        bindCampaignCardEvents();
    }

    async function createCampaignCard(campaign) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'campaign-card';
        cardDiv.setAttribute('data-category', campaign.category || 'other');
        
        let campaignWithImages = { ...campaign };
        
        if (campaign.hasImages && db) {
            try {
                const images = await getImagesFromIndexedDB(campaign.id);
                if (images) {
                    campaignWithImages.image = images.coverImage || 'img1.png';
                    campaignWithImages.galleryImages = images.galleryImages || [];
                }
            } catch (error) {
                console.warn('Failed to load images for campaign:', campaign.id, error);
                campaignWithImages.image = 'img1.png';
                campaignWithImages.galleryImages = [];
            }
        } else {
            campaignWithImages.image = 'img1.png';
            campaignWithImages.galleryImages = [];
        }
        
        cardDiv.setAttribute('data-campaign', JSON.stringify(campaignWithImages));
        
        const targetAmount = parseFloat(campaign.targetAmount) || 0;
        const raisedAmount = parseFloat(campaign.raised) || 0;
        const progressPercent = targetAmount > 0 ? Math.min((raisedAmount / targetAmount) * 100, 100) : 0;
        
        let cardHTML = `<div class="campaign-image">`;
        
        if (campaignWithImages.image && campaignWithImages.image !== 'img1.png') {
            cardHTML += `<img src="${campaignWithImages.image}" alt="${campaign.title || 'Campaign Image'}">`;
        } else {
            cardHTML += `<img src="img1.png" alt="Default Campaign Image">`;
        }
        
        cardHTML += `</div><div class="campaign-content">`;
        
        if (campaign.category) {
            cardHTML += `<div class="campaign-category">${campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}</div>`;
        }
        
        cardHTML += `<h3 class="campaign-title">${campaign.title || 'Untitled Campaign'}</h3>`;
        
        if (campaign.description) {
            cardHTML += `<p class="campaign-description">${campaign.description.substring(0, 120)}${campaign.description.length > 120 ? '...' : ''}</p>`;
        }
        
        const creatorName = campaign.companyName || campaign.creator || 'Anonymous Creator';
        cardHTML += `<div class="campaign-creator">by <span>${creatorName}</span></div>`;
        
        if (targetAmount > 0) {
            cardHTML += `
                <div class="campaign-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                <div class="campaign-stats">
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-value">${campaign.currency || 'USD'} ${raisedAmount.toLocaleString()}</span>
                            <span class="stat-label">raised</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${campaign.currency || 'USD'} ${targetAmount.toLocaleString()}</span>
                            <span class="stat-label">goal</span>
                        </div>`;
            
            if (campaign.daysLeft) {
                cardHTML += `
                        <div class="stat">
                            <span class="stat-value">${campaign.daysLeft}</span>
                            <span class="stat-label">days left</span>
                        </div>`;
            }
            
            cardHTML += `    </div>
                </div>`;
        }
        
        cardHTML += `<button class="support-btn">Support This Project</button>`;
        cardHTML += `</div>`;
        
        cardDiv.innerHTML = cardHTML;
        return cardDiv;
    }

    function bindCampaignCardEvents() {
        document.querySelectorAll('.support-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const campaignCard = this.closest('.campaign-card');
                
                const campaignDataStr = campaignCard.getAttribute('data-campaign');
                
                if (campaignDataStr) {
                    try {
                        const campaignData = JSON.parse(campaignDataStr);
                        
                        const campaignId = (campaignData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-');
                        
                        const compactData = {
                            ...campaignData,
                            image: campaignData.image === 'img1.png' ? 'img1.png' : '[uploaded-image]',
                            galleryImages: campaignData.galleryImages ? `[${campaignData.galleryImages.length} images]` : []
                        };
                        
                        const params = new URLSearchParams({
                            campaign: campaignId,
                            data: JSON.stringify(compactData),
                            hasImage: campaignData.image !== 'img1.png' ? 'true' : 'false',
                            imageCount: campaignData.galleryImages ? campaignData.galleryImages.length.toString() : '0'
                        });
                        
                        window.location.href = `support.html?${params.toString()}`;
                    } catch (error) {
                        const campaignTitle = campaignCard.querySelector('.campaign-title').textContent;
                        const campaignId = campaignTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        window.location.href = `support.html?campaign=${campaignId}&title=${encodeURIComponent(campaignTitle)}`;
                    }
                } else {
                    const campaignTitle = campaignCard.querySelector('.campaign-title').textContent;
                    const campaignId = campaignTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
                    window.location.href = `support.html?campaign=${campaignId}&title=${encodeURIComponent(campaignTitle)}`;
                }
            });
        });

        campaignCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        if (observer) {
            campaignCards.forEach(card => {
                observer.observe(card);
            });
        }
    }
});