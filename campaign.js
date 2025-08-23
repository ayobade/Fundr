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

function saveImagesToIndexedDB(campaignId, imageData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction(['campaignImages'], 'readwrite');
        const store = transaction.objectStore('campaignImages');
        
        const data = {
            campaignId: campaignId,
            coverImage: imageData.coverImage,
            galleryImages: imageData.galleryImages,
            timestamp: Date.now()
        };
        
        const request = store.put(data);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
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

function deleteImagesFromIndexedDB(campaignId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const transaction = db.transaction(['campaignImages'], 'readwrite');
        const store = transaction.objectStore('campaignImages');
        const request = store.delete(campaignId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const backToHome = document.getElementById('backToHome');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const publishBtn = document.getElementById('publishBtn');
    const stepText = document.getElementById('stepText');
    const progressFill = document.getElementById('progressFill');
    const uploadArea = document.getElementById('uploadArea');
    const coverUpload = document.getElementById('coverUpload');
    const galleryUpload = document.getElementById('galleryUpload');
    const galleryFiles = document.getElementById('galleryFiles');
    
    let currentStep = 1;
    const totalSteps = 6;
    let galleryImages = [];
    const maxGalleryImages = 5;
    let coverImageData = null;
    
    if (!nextBtn || !prevBtn || !publishBtn) return;
    
    initIndexedDB().catch(error => {
        console.error('Failed to initialize IndexedDB:', error);
    });
    
    if (backToHome) {
        backToHome.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
    
    function updateStep() {
        const steps = document.querySelectorAll('.form-step');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            step.classList.toggle('active', isActive);
            step.style.display = isActive ? 'block' : 'none';
        });
        
        stepText.textContent = `Step ${currentStep} of ${totalSteps}`;
        progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
        
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            publishBtn.style.display = 'inline-block';
            updateSummary();
        } else {
            nextBtn.style.display = 'inline-block';
            publishBtn.style.display = 'none';
        }
        
        if (currentStep === 3) {
            const existingSkipBtn = document.querySelector('.skip-btn');
            if (!existingSkipBtn) {
                const skipBtn = document.createElement('button');
                skipBtn.type = 'button';
                skipBtn.className = 'btn-secondary skip-btn';
                skipBtn.textContent = 'Skip step';
                skipBtn.style.marginLeft = '10px';
                skipBtn.addEventListener('click', () => {
                    currentStep++;
                    updateStep();
                });
                nextBtn.parentNode.insertBefore(skipBtn, nextBtn.nextSibling);
            }
        } else {
            const existingSkipBtn = document.querySelector('.skip-btn');
            if (existingSkipBtn) existingSkipBtn.remove();
        }
    }
    
    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        requiredFields.forEach(field => {
            const hasValue = field.value.trim();
            field.style.borderColor = hasValue ? '#444' : '#ff4444';
            if (!hasValue) isValid = false;
        });
        
        return isValid;
    }
    
    function updateSummary() {
        const title = document.getElementById('campaignTitle').value;
        const tagline = document.getElementById('shortTagline').value;
        const category = document.getElementById('campaignCategory').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('fullStory').value;
        
        const amount = document.getElementById('targetAmount').value;
        const currency = document.getElementById('currency').value || 'USD';
        const minContribution = document.getElementById('minContribution').value;
        const deadline = document.getElementById('deadline').value;
        
        const companyName = document.getElementById('companyName').value;
        const companyWebsite = document.getElementById('companyWebsite').value;
        const industry = document.getElementById('companyIndustry').value;
        const companyLocation = document.getElementById('companyLocation').value;
        
        const wallet = document.getElementById('walletAddress').value;
        const preferredToken = document.getElementById('preferredToken').value;
        const payoutWallet = document.getElementById('payoutWallet').value;
        
        document.getElementById('summaryTitle').textContent = title || 'Untitled Campaign';
        
        updateSummaryItem('summaryTaglineItem', 'summaryTagline', tagline);
        updateSummaryItem('summaryCategoryItem', 'summaryCategory', category);
        updateSummaryItem('summaryLocationItem', 'summaryLocation', location);
        updateSummaryItem('summaryDescriptionItem', 'summaryDescription', description ? description.substring(0, 100) + (description.length > 100 ? '...' : '') : '');
        
        document.getElementById('summaryGoal').textContent = amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : 'Not set';
        document.getElementById('summaryDeadline').textContent = deadline ? new Date(deadline).toLocaleDateString() : 'Not set';
        updateSummaryItem('summaryMinContributionItem', 'summaryMinContribution', minContribution ? `${currency} ${parseFloat(minContribution).toLocaleString()}` : '');
        
        const hasCompanyInfo = companyName || companyWebsite || industry || companyLocation;
        document.getElementById('summaryCompanySection').style.display = hasCompanyInfo ? 'block' : 'none';
        
        updateSummaryItem('summaryCompanyNameItem', 'summaryCompanyName', companyName);
        updateSummaryItem('summaryCompanyWebsiteItem', 'summaryCompanyWebsite', companyWebsite);
        updateSummaryItem('summaryIndustryItem', 'summaryIndustry', industry);
        updateSummaryItem('summaryCompanyLocationItem', 'summaryCompanyLocation', companyLocation);
        
        document.getElementById('summaryWallet').textContent = wallet ? `${wallet.substring(0, 15)}...` : 'Not set';
        updateSummaryItem('summaryPreferredTokenItem', 'summaryPreferredToken', preferredToken);
        updateSummaryItem('summaryPayoutWalletItem', 'summaryPayoutWallet', payoutWallet ? `${payoutWallet.substring(0, 15)}...` : '');
        
        const coverContainer = document.getElementById('summaryCoverContainer');
        const coverImage = document.getElementById('summaryCoverImage');
        
        if (coverImageData) {
            coverImage.src = coverImageData.src;
            coverContainer.style.display = 'block';
        } else {
            coverContainer.style.display = 'none';
        }
        
        const gallerySection = document.getElementById('summaryGallerySection');
        const galleryContainer = document.getElementById('summaryGallery');
        
        if (galleryImages && galleryImages.length > 0) {
            gallerySection.style.display = 'block';
            galleryContainer.innerHTML = '';
            
            galleryImages.forEach((img, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = img.src;
                imgElement.alt = `Gallery Image ${index + 1}`;
                imgElement.className = 'summary-gallery-thumb';
                galleryContainer.appendChild(imgElement);
            });
        } else {
            gallerySection.style.display = 'none';
        }
    }
    
    function updateSummaryItem(itemId, valueId, value) {
        const item = document.getElementById(itemId);
        const valueElement = document.getElementById(valueId);
        
        if (value && value.trim()) {
            valueElement.textContent = value;
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    }
    
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep() && currentStep < totalSteps) {
            currentStep++;
            updateStep();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });
    
    if (uploadArea && coverUpload) {
        uploadArea.addEventListener('click', () => coverUpload.click());
        
        coverUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    showImagePreview(e.target.result, file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    function showImagePreview(imageSrc, fileName) {
        const uploadArea = document.getElementById('uploadArea');
        
        coverImageData = { src: imageSrc, name: fileName };
        
        uploadArea.innerHTML = `
            <div class="image-preview-container">
                <img src="${imageSrc}" alt="${fileName}" class="uploaded-image">
                <button type="button" class="remove-image-btn" aria-label="Remove image">×</button>
            </div>
        `;
        
        uploadArea.classList.add('has-image');
        
        const removeBtn = uploadArea.querySelector('.remove-image-btn');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeImage();
        });
    }
    
    function removeImage() {
        const uploadArea = document.getElementById('uploadArea');
        const coverUpload = document.getElementById('coverUpload');
        
        coverImageData = null;
        
        uploadArea.innerHTML = `
            <div class="upload-content">
                <span>📁</span>
                <p>Click to upload or drag & drop</p>
                <small>PNG, JPG up to 10MB</small>
            </div>
        `;
        
        uploadArea.classList.remove('has-image');
        coverUpload.value = '';
        
        uploadArea.addEventListener('click', () => coverUpload.click());
    }
    
    if (galleryUpload && galleryFiles) {
        galleryUpload.addEventListener('click', () => galleryFiles.click());
        
        galleryFiles.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            const remainingSlots = maxGalleryImages - galleryImages.length;
            const filesToProcess = files.slice(0, remainingSlots);
            
            filesToProcess.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        addGalleryImage(e.target.result, file.name);
                    };
                    reader.readAsDataURL(file);
                }
            });
            e.target.value = '';
        });
    }
    
    function addGalleryImage(imageSrc, fileName) {
        galleryImages.push({ src: imageSrc, name: fileName });
        updateGalleryDisplay();
    }
    
    function removeGalleryImage(index) {
        galleryImages.splice(index, 1);
        updateGalleryDisplay();
    }
    
    function updateGalleryDisplay() {
        const galleryUpload = document.getElementById('galleryUpload');
        
        if (galleryImages.length === 0) {
            galleryUpload.innerHTML = `
                <div class="upload-content">
                    <span>🖼️</span>
                    <p>+ Add Images/Videos</p>
                </div>
            `;
            galleryUpload.classList.remove('has-gallery-images');
            galleryUpload.addEventListener('click', () => document.getElementById('galleryFiles').click());
        } else {
            let imagesHtml = '';
            
            galleryImages.forEach((image, index) => {
                imagesHtml += `
                    <div class="gallery-image-container">
                        <img src="${image.src}" alt="${image.name}" class="gallery-uploaded-image">
                        <button type="button" class="remove-gallery-btn" data-index="${index}" aria-label="Remove image">×</button>
                    </div>
                `;
            });
            
            if (galleryImages.length < maxGalleryImages) {
                imagesHtml += `
                    <div class="gallery-add-container" id="galleryAddContainer">
                        <span class="add-icon">+</span>
                        <p>Add More</p>
                        <small>${galleryImages.length}/${maxGalleryImages}</small>
                    </div>
                `;
            }
            
            galleryUpload.innerHTML = `<div class="gallery-images-grid">${imagesHtml}</div>`;
            galleryUpload.classList.add('has-gallery-images');
            
            const removeButtons = galleryUpload.querySelectorAll('.remove-gallery-btn');
            removeButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    removeGalleryImage(index);
                });
            });
            
            const addContainer = galleryUpload.querySelector('#galleryAddContainer');
            if (addContainer) {
                addContainer.addEventListener('click', () => document.getElementById('galleryFiles').click());
            }
        }
    }
    
    if (publishBtn) {
        publishBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const confirmCheckbox = document.getElementById('confirmInfo');
            
            if (!confirmCheckbox || !confirmCheckbox.checked) {
                showAlert('Please confirm that all information is correct before publishing.', 'warning');
                return;
            }
            
            const campaignTitle = document.getElementById('campaignTitle').value || 'Your Campaign';
            const confirmPublish = confirm(
                `Are you sure you want to publish "${campaignTitle}"?\n\n` +
                'Once published, your campaign will be live and visible to potential backers.\n\n' +
                'Click OK to proceed or Cancel to review your campaign.'
            );
            
            if (confirmPublish) {
                try {
                    await saveCampaignData();
                    showCustomAlert('success', 'Campaign Published!', 'Your campaign is now live and ready to receive backing.', () => {
                        window.location.href = 'Funding.html';
                    });
                } catch (error) {
                    showCustomAlert('error', 'Campaign Save Error', error.message);
                }
            }
        });
    }
    
    async function saveCampaignData() {
        const campaignId = Date.now().toString();
        
        const campaignData = {
            id: campaignId,
            title: document.getElementById('campaignTitle').value || '',
            shortTagline: document.getElementById('shortTagline').value || '',
            category: document.getElementById('campaignCategory').value || '',
            location: document.getElementById('location').value || '',
            targetAmount: document.getElementById('targetAmount').value || '',
            currency: document.getElementById('currency').value || 'USD',
            minContribution: document.getElementById('minContribution').value || '',
            deadline: document.getElementById('deadline').value || '',
            description: document.getElementById('fullStory').value || '',
            companyName: document.getElementById('companyName').value || '',
            companyWebsite: document.getElementById('companyWebsite').value || '',
            industry: document.getElementById('companyIndustry').value || '',
            companyLocation: document.getElementById('companyLocation').value || '',
            walletAddress: document.getElementById('walletAddress').value || '',
            preferredToken: document.getElementById('preferredToken').value || '',
            payoutWallet: document.getElementById('payoutWallet').value || '',
            createdAt: new Date().toISOString(),
            creator: document.getElementById('companyName').value || 'Campaign Creator',
            raised: '0',
            backers: '0',
            daysLeft: calculateDaysLeft(),
            progress: '0',
            hasImages: !!(coverImageData || galleryImages.length > 0)
        };

        try {
            if (coverImageData || galleryImages.length > 0) {
                const imageData = {
                    coverImage: coverImageData ? coverImageData.src : null,
                    galleryImages: galleryImages.map(img => img.src) || []
                };
                
                await saveImagesToIndexedDB(campaignId, imageData);
            }
            
            let allCampaigns = JSON.parse(localStorage.getItem('userCampaigns') || '[]');
            allCampaigns.push(campaignData);
            localStorage.setItem('userCampaigns', JSON.stringify(allCampaigns));
            
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                try {
                    let allCampaigns = JSON.parse(localStorage.getItem('userCampaigns') || '[]');
                    if (allCampaigns.length > 10) {
                        const removedCampaigns = allCampaigns.splice(0, allCampaigns.length - 10);
                        for (const campaign of removedCampaigns) {
                            try {
                                await deleteImagesFromIndexedDB(campaign.id);
                            } catch (deleteError) {
                                console.warn('Failed to delete images for campaign:', campaign.id);
                            }
                        }
                    }
                    
                    allCampaigns.push(campaignData);
                    localStorage.setItem('userCampaigns', JSON.stringify(allCampaigns));
                    showCustomAlert('warning', 'Storage Cleaned', 'Campaign saved. Older campaigns were removed to make space.');
                    
                } catch (stillError) {
                    campaignData.hasImages = false;
                    let allCampaigns = [campaignData];
                    localStorage.setItem('userCampaigns', JSON.stringify(allCampaigns));
                    showCustomAlert('warning', 'Storage Reset', 'Campaign saved. Previous campaigns were cleared due to storage limits.');
                }
            } else {
                throw error;
            }
        }
    }

    function calculateDaysLeft() {
        const deadline = document.getElementById('deadline').value;
        if (!deadline) return '30';
        
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const timeDiff = deadlineDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return Math.max(0, daysDiff).toString();
    }

    function showCustomAlert(type = 'info', title = '', message = '', callback = null) {
        const alertTypes = {
            success: { icon: '✅', title: title || 'Success' },
            error: { icon: '❌', title: title || 'Error' },
            warning: { icon: '⚠️', title: title || 'Warning' },
            info: { icon: 'ℹ️', title: title || 'Information' }
        };
        
        const alertConfig = alertTypes[type] || alertTypes.info;
        
        const existingAlerts = document.querySelectorAll('.custom-alert-overlay');
        existingAlerts.forEach(alert => alert.remove());
        
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        const alertBox = document.createElement('div');
        alertBox.className = `custom-alert-box ${type}`;
        
        alertBox.innerHTML = `
            <div class="alert-icon">${alertConfig.icon}</div>
            <div class="alert-title">${alertConfig.title}</div>
            <div class="alert-message">${message}</div>
            <div class="alert-buttons">
                <button class="alert-btn primary" id="alertOkBtn">OK</button>
            </div>
        `;
        
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        
        const okBtn = alertBox.querySelector('#alertOkBtn');
        okBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            if (callback) callback();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                if (callback) callback();
            }
        });
        
        setTimeout(() => okBtn.focus(), 100);
    }

    function showAlert(message, type = 'warning') {
        showCustomAlert(type, '', message);
    }
    
    updateStep();
});