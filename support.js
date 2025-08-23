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
    const supportForm = document.getElementById('supportForm');
    const contributionAmountInput = document.getElementById('contributionAmount');
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cryptoDetails = document.getElementById('cryptoDetails');
    const anonymousToggle = document.getElementById('donateAnonymously');
    
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const supportBtn = document.getElementById('supportBtn');
    const stepText = document.getElementById('stepText');
    const progressFill = document.getElementById('progressFill');
    
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryFee = document.getElementById('summaryFee');
    const summaryTotal = document.getElementById('summaryTotal');
    const btnAmount = document.getElementById('btnAmount');

    let currentStep = 1;
    const totalSteps = 3;
    let currentAmount = 0;

    function updateSummary() {
        const fee = Math.round(currentAmount * 0.05 * 100) / 100;
        const total = currentAmount + fee;

        summaryAmount.textContent = `$${currentAmount.toFixed(2)}`;
        summaryFee.textContent = `$${fee.toFixed(2)}`;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
        btnAmount.textContent = `$${total.toFixed(2)}`;
    }

    contributionAmountInput.addEventListener('input', function() {
        currentAmount = parseFloat(this.value) || 0;
        updateSummary();
        
        if (currentAmount > 0) {
            hideAmountError();
        }
    });

    function addFieldErrorClearListeners() {
        const requiredFields = document.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    const formGroup = this.closest('.form-group');
                    if (formGroup && formGroup.classList.contains('error')) {
                        formGroup.classList.remove('error');
                        
                        const fieldName = this.name || this.id;
                        const errorElement = document.getElementById(fieldName + 'Error');
                        if (errorElement) {
                            errorElement.classList.remove('show');
                        }
                    }
                }
            });
        });
    }

    function updateStep() {
        const steps = document.querySelectorAll('.form-step');
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            step.classList.toggle('active', isActive);
        });
        
        stepText.textContent = `Step ${currentStep} of ${totalSteps}`;
        progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
        
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            supportBtn.style.display = 'inline-block';
            updateReviewData();
        } else {
            nextBtn.style.display = 'inline-block';
            supportBtn.style.display = 'none';
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

    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        
        if (currentStep === 1) {
            if (currentAmount <= 0) {
                showAmountError();
                return false;
            } else {
                hideAmountError();
            }
        }
        
        clearFieldErrors();
        
        requiredFields.forEach(field => {
            if (!field.disabled && !field.value.trim()) {
                showFieldError(field);
                isValid = false;
            }
        });
        
        return isValid;
    }

    function showAmountError() {
        const amountContainer = document.querySelector('.amount-input-container');
        const amountError = document.getElementById('amountError');
        
        amountContainer.classList.add('error');
        amountError.classList.add('show');
        contributionAmountInput.focus();
        
        setTimeout(() => {
            amountContainer.classList.remove('error');
        }, 500);
    }

    function hideAmountError() {
        const amountContainer = document.querySelector('.amount-input-container');
        const amountError = document.getElementById('amountError');
        
        amountContainer.classList.remove('error');
        amountError.classList.remove('show');
    }

    function showFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        formGroup.classList.add('error');
        
        const fieldName = field.name || field.id;
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.classList.add('show');
        }
        
        setTimeout(() => {
            formGroup.classList.remove('error');
        }, 500);
    }

    function clearFieldErrors() {
        const errorGroups = document.querySelectorAll('.form-group.error');
        const errorMessages = document.querySelectorAll('.field-error-message.show');
        
        errorGroups.forEach(group => {
            group.classList.remove('error');
        });
        
        errorMessages.forEach(message => {
            message.classList.remove('show');
        });
    }

    function updateReviewData() {
        const isAnonymous = anonymousToggle.checked;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        
        const donorName = isAnonymous ? 'Anonymous Donor' : `${firstName} ${lastName}`;
        document.getElementById('reviewDonor').textContent = donorName;
        
        document.getElementById('reviewEmail').textContent = isAnonymous ? 'Not provided' : email;
        
        const paymentText = selectedPayment ? selectedPayment.value.charAt(0).toUpperCase() + selectedPayment.value.slice(1) : 'Cryptocurrency';
        document.getElementById('reviewPayment').textContent = paymentText;
    }

    if (anonymousToggle) {
        anonymousToggle.addEventListener('change', function() {
            toggleAnonymousMode(this.checked);
        });
    }

    function toggleAnonymousMode(isAnonymous) {
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        
        const firstNameLabel = document.querySelector('label[for="firstName"]');
        const lastNameLabel = document.querySelector('label[for="lastName"]');
        const emailLabel = document.querySelector('label[for="email"]');
        const phoneLabel = document.querySelector('label[for="phone"]');

        if (isAnonymous) {
            firstNameInput.disabled = true;
            lastNameInput.disabled = true;
            emailInput.disabled = true;
            phoneInput.disabled = true;
            
            firstNameInput.removeAttribute('required');
            emailInput.removeAttribute('required');
            
            firstNameInput.value = '';
            lastNameInput.value = '';
            emailInput.value = '';
            phoneInput.value = '';
            
            firstNameLabel.classList.add('disabled');
            lastNameLabel.classList.add('disabled');
            emailLabel.classList.add('disabled');
            phoneLabel.classList.add('disabled');
            
            firstNameInput.placeholder = 'Anonymous';
            lastNameInput.placeholder = 'Donor';
            emailInput.placeholder = 'Not provided';
            phoneInput.placeholder = 'Not provided';
        } else {
            firstNameInput.disabled = false;
            lastNameInput.disabled = false;
            emailInput.disabled = false;
            phoneInput.disabled = false;
            
            firstNameInput.setAttribute('required', '');
            emailInput.setAttribute('required', '');
            
            firstNameLabel.classList.remove('disabled');
            lastNameLabel.classList.remove('disabled');
            emailLabel.classList.remove('disabled');
            phoneLabel.classList.remove('disabled');
            
            firstNameInput.placeholder = '';
            lastNameInput.placeholder = '';
            emailInput.placeholder = '';
            phoneInput.placeholder = '';
        }
    }

    const walletAddresses = {
        'BTC': 'bc1q5wh95h7vdwuu80nhpdhuxpznrxmcxnkndaswum',
        'ETH': '0xe7Ae6f99700B3463Ddf6B7fa807Ff735aDf7EAC4',
        'SOL': '26vvjS3DM9f9uMwEK2rRwh7T6MhUsmXpp9JjpmtEtLcC'
    };

    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            if (this.value === 'crypto') {
                cryptoDetails.style.display = 'block';
                updateWalletAddress();
            } else {
                cryptoDetails.style.display = 'none';
            }
        });
    });

    const cryptoTypeSelect = document.getElementById('cryptoType');
    if (cryptoTypeSelect) {
        cryptoTypeSelect.addEventListener('change', updateWalletAddress);
    }

    function updateWalletAddress() {
        const selectedCrypto = cryptoTypeSelect.value;
        const walletText = document.getElementById('walletText');
        
        if (walletText && walletAddresses[selectedCrypto]) {
            walletText.textContent = walletAddresses[selectedCrypto];
        }
    }

    function validateForm() {
        const confirmCheckbox = document.getElementById('confirmSupport');
        
        if (!confirmCheckbox.checked) {
            alert('Please confirm that you want to support this project.');
            return false;
        }
        
        if (currentAmount <= 0) {
            currentStep = 1;
            updateStep();
            showAmountError();
            return false;
        }

        return true;
    }

    supportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(supportForm);

        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        
        const isAnonymous = anonymousToggle.checked;
        const supportData = {
            amount: currentAmount,
            isAnonymous: isAnonymous,
            firstName: isAnonymous ? 'Anonymous' : formData.get('firstName'),
            lastName: isAnonymous ? 'Donor' : formData.get('lastName'),
            email: isAnonymous ? 'anonymous@donor.com' : formData.get('email'),
            phone: isAnonymous ? '' : formData.get('phone'),
            note: formData.get('note'),
            paymentMethod: selectedPayment ? selectedPayment.value : 'crypto',
            cryptoType: formData.get('cryptoType'),
            destinationWallet: document.getElementById('walletText').textContent
        };

        const campaignTitle = document.getElementById('campaignTitle').textContent;
        const total = currentAmount + (currentAmount * 0.05);
        
        const donorName = isAnonymous ? 'Anonymous Donor' : `${supportData.firstName} ${supportData.lastName}`;
        const confirmMessage = `Thank you for supporting "${campaignTitle}"!\n\n` +
            `Donor: ${donorName}\n` +
            `Contribution: $${currentAmount}\n` +
            `Platform Fee: $${(currentAmount * 0.05).toFixed(2)}\n` +
            `Total: $${total.toFixed(2)}\n\n` +
            `Payment Method: ${selectedPayment.value.charAt(0).toUpperCase() + selectedPayment.value.slice(1)}\n\n` +
            `${isAnonymous ? 'Your donation will remain anonymous.' : 'You will receive a confirmation email shortly with payment instructions.'}`;

        showCustomAlert('success', 'Support Successful!', confirmMessage, () => {
            window.location.href = 'Funding.html';
        });
        
    });

    async function loadCampaignData() {
        const urlParams = new URLSearchParams(window.location.search);
        
        let campaignData = {};
        
        const dataParam = urlParams.get('data');
        if (dataParam) {
            try {
                campaignData = JSON.parse(dataParam);
            } catch (error) {
                campaignData = {
                    id: urlParams.get('campaign'),
                    title: urlParams.get('title'),
                    category: urlParams.get('category'),
                    description: urlParams.get('description'),
                    creator: urlParams.get('creator'),
                    image: urlParams.get('image'),
                    raised: urlParams.get('raised'),
                    target: urlParams.get('target'),
                    days: urlParams.get('days'),
                    progress: urlParams.get('progress')
                };
            }
        } else {
            campaignData = {
                id: urlParams.get('campaign'),
                title: urlParams.get('title'),
                category: urlParams.get('category'),
                description: urlParams.get('description'),
                creator: urlParams.get('creator'),
                image: urlParams.get('image'),
                raised: urlParams.get('raised'),
                target: urlParams.get('target'),
                days: urlParams.get('days'),
                progress: urlParams.get('progress')
            };
        }
        
        updateElement('campaignTitle', campaignData.title || 'Untitled Campaign');
        updateElement('campaignCategory', campaignData.category || 'Uncategorized');
        updateElement('campaignCreator', campaignData.companyName || campaignData.creator || 'Anonymous Creator');
        
        const description = campaignData.description || campaignData.shortTagline || 'No description available.';
        updateElement('campaignDescription', description);
        
        const imageElement = document.getElementById('campaignImage');
        if (imageElement) {
            let imageSrc = 'img1.png';
            
            if (campaignData.hasImages && campaignData.id && db) {
                try {
                    const images = await getImagesFromIndexedDB(campaignData.id);
                    if (images && images.coverImage) {
                        imageSrc = images.coverImage;
                        campaignData.galleryImages = images.galleryImages || [];
                    }
                } catch (error) {
                    console.warn('Failed to load images for campaign:', campaignData.id, error);
                }
            } else if (campaignData.image && campaignData.image !== '[uploaded-image]' && campaignData.image !== 'img1.png') {
                imageSrc = campaignData.image;
            }
            
            imageElement.src = imageSrc;
            imageElement.alt = campaignData.title || 'Campaign Image';
            
            if (imageSrc !== 'img1.png') {
                imageElement.style.cursor = 'pointer';
                imageElement.onclick = function() {
                    // Include gallery images if available
                    const allImages = [imageSrc];
                    if (campaignData.galleryImages && campaignData.galleryImages.length > 0) {
                        campaignData.galleryImages.forEach(galleryImg => {
                            if (!allImages.includes(galleryImg)) {
                                allImages.push(galleryImg);
                            }
                        });
                    }
                    openImageModal(imageSrc, allImages.length > 1 ? allImages : null);
                };
            }
        }
        
        const currency = campaignData.currency || 'USD';
        const targetAmount = parseFloat(campaignData.targetAmount) || 0;
        let raisedAmount = parseFloat(campaignData.raised) || 0;
        
        if (isNaN(raisedAmount) || raisedAmount < 0) {
            raisedAmount = 0;
        }
        
        const progressPercent = targetAmount > 0 ? Math.min((raisedAmount / targetAmount) * 100, 100) : 0;
        
        updateElement('raisedAmount', `${currency} ${raisedAmount.toLocaleString()}`);
        updateElement('goalAmount', `${currency} ${targetAmount.toLocaleString()}`);
        updateElement('daysLeft', campaignData.daysLeft || campaignData.days || 'N/A');
        updateElement('backersCount', campaignData.backers || '0');
        
        const progressFill = document.getElementById('progressBar');
        if (progressFill) {
            progressFill.style.setProperty('width', `${Math.max(0, progressPercent)}%`, 'important');
        }
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(progressPercent)}% funded`;
        }
        
        addAdditionalDetails(campaignData);
    }
    
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element && value) {
            element.textContent = value;
        }
    }
    
    function addAdditionalDetails(campaignData) {
        const campaignDescription = document.querySelector('.campaign-description');
        if (!campaignDescription) return;
        
        let additionalDetails = document.getElementById('additionalDetails');
        if (!additionalDetails) {
            additionalDetails = document.createElement('div');
            additionalDetails.id = 'additionalDetails';
            additionalDetails.className = 'campaign-additional-info';
            campaignDescription.appendChild(additionalDetails);
        } else {
            additionalDetails.innerHTML = '';
        }
        
        const detailsHTML = [];
        
        if (campaignData.shortTagline && campaignData.shortTagline !== campaignData.description) {
            detailsHTML.push(`<div class="detail-item"><strong>Tagline:</strong> ${campaignData.shortTagline}</div>`);
        }
        
        if (campaignData.location) {
            detailsHTML.push(`<div class="detail-item"><strong>Location:</strong> 📍 ${campaignData.location}</div>`);
        }
        
        if (campaignData.minContribution && parseFloat(campaignData.minContribution) > 0) {
            detailsHTML.push(`<div class="detail-item"><strong>Minimum Contribution:</strong> ${campaignData.currency || 'USD'} ${parseFloat(campaignData.minContribution).toLocaleString()}</div>`);
        }
        
        if (campaignData.deadline) {
            const deadlineDate = new Date(campaignData.deadline);
            detailsHTML.push(`<div class="detail-item"><strong>Deadline:</strong> ${deadlineDate.toLocaleDateString()}</div>`);
        }
        
        if (campaignData.preferredToken) {
            detailsHTML.push(`<div class="detail-item"><strong>Preferred Token:</strong> ${campaignData.preferredToken}</div>`);
        }
        
        if (campaignData.companyWebsite) {
            detailsHTML.push(`<div class="detail-item"><strong>Website:</strong> <a href="${campaignData.companyWebsite}" target="_blank">${campaignData.companyWebsite}</a></div>`);
        }
        
        if (campaignData.companyIndustry || campaignData.industry) {
            detailsHTML.push(`<div class="detail-item"><strong>Industry:</strong> ${campaignData.companyIndustry || campaignData.industry}</div>`);
        }
        
        if (campaignData.companyLocation) {
            detailsHTML.push(`<div class="detail-item"><strong>Company Location:</strong> 🏢 ${campaignData.companyLocation}</div>`);
        }
        
        if (campaignData.walletAddress) {
            detailsHTML.push(`<div class="detail-item"><strong>Funding Wallet:</strong> <code>${campaignData.walletAddress.substring(0, 20)}...</code></div>`);
        }
        
        if (campaignData.payoutWallet) {
            detailsHTML.push(`<div class="detail-item"><strong>Payout Wallet:</strong> <code>${campaignData.payoutWallet.substring(0, 20)}...</code></div>`);
        }
        
        let actualGalleryImages = [];
        
        if (campaignData.galleryImages) {
            if (Array.isArray(campaignData.galleryImages)) {
                actualGalleryImages = campaignData.galleryImages;
            } else if (typeof campaignData.galleryImages === 'string' && campaignData.galleryImages.includes('images]')) {
                const urlParams = new URLSearchParams(window.location.search);
                const imageCount = parseInt(urlParams.get('imageCount') || '0');
                
                if (imageCount > 0) {
                    const userCampaigns = JSON.parse(localStorage.getItem('userCampaigns') || '[]');
                    const fullCampaign = userCampaigns.find(c => c.title === campaignData.title);
                    if (fullCampaign && Array.isArray(fullCampaign.galleryImages)) {
                        actualGalleryImages = fullCampaign.galleryImages;
                    }
                }
            }
        }
        
        if (actualGalleryImages.length > 0) {
            detailsHTML.push(`<div class="detail-item"><strong>Gallery:</strong></div>`);
            detailsHTML.push(`<div class="campaign-gallery">`);
            actualGalleryImages.slice(0, 5).forEach((img, index) => {
                detailsHTML.push(`<img src="${img}" alt="Gallery Image ${index + 1}" class="gallery-thumb" data-gallery-index="${index}" style="cursor: pointer;">`);
            });
            if (actualGalleryImages.length > 5) {
                detailsHTML.push(`<span class="gallery-more">+${actualGalleryImages.length - 5} more</span>`);
            }
            detailsHTML.push(`</div>`);
        }
        
        if (detailsHTML.length > 0) {
            additionalDetails.innerHTML += detailsHTML.join('');
            
            // Add click listeners to gallery images
            if (actualGalleryImages.length > 0) {
                const galleryThumbs = additionalDetails.querySelectorAll('.gallery-thumb[data-gallery-index]');
                galleryThumbs.forEach((thumb, index) => {
                    thumb.addEventListener('click', function() {
                        const clickedIndex = parseInt(this.getAttribute('data-gallery-index'));
                        openImageModal(actualGalleryImages[clickedIndex], actualGalleryImages);
                    });
                });
            }
        } else {
            additionalDetails.style.display = 'none';
        }
    }

    function animateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const currentWidth = progressBar.style.width;
            progressBar.style.setProperty('width', '0%', 'important');
            setTimeout(() => {
                progressBar.style.setProperty('width', currentWidth, 'important');
            }, 500);
        }
    }

    function addRealTimeValidation() {
        const inputs = supportForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#ff4444';
                } else {
                    this.style.borderColor = '#444';
                }
            });
            
            input.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(255, 68, 68)' && this.value.trim()) {
                    this.style.borderColor = '#444';
                }
            });
        });
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

    initIndexedDB().then(() => {
        loadCampaignData();
    }).catch(error => {
        console.error('Failed to initialize IndexedDB:', error);
        loadCampaignData();
    });
    animateProgressBar();
    addRealTimeValidation();
    updateSummary();
    updateStep();
    addFieldErrorClearListeners();
    
    cryptoDetails.style.display = 'block';
    updateWalletAddress();
});

function copyWalletAddress() {
    const walletText = document.getElementById('walletText').textContent;
    const copyBtn = document.querySelector('.copy-btn');
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(walletText).then(() => {
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#2d7a3a';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.style.background = '#338f42';
            }, 2000);
        }).catch(() => {
            fallbackCopyTextToClipboard(walletText, copyBtn);
        });
    } else {
        fallbackCopyTextToClipboard(walletText, copyBtn);
    }
}

function fallbackCopyTextToClipboard(text, btn) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        btn.textContent = 'Copied!';
        btn.style.background = '#2d7a3a';
        setTimeout(() => {
            btn.textContent = 'Copy';
            btn.style.background = '#338f42';
        }, 2000);
    } catch (err) {
        btn.textContent = 'Copy Failed';
        setTimeout(() => {
            btn.textContent = 'Copy';
        }, 2000);
    }
    
    document.body.removeChild(textArea);
}

// Image Modal Variables
let currentGalleryImages = [];
let currentImageIndex = 0;

// Image Modal Functions
window.openImageModal = function(imageSrc, galleryImages = null) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageCounter = document.getElementById('imageCounter');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    
    if (!modal || !modalImage) return;
    
    // If galleryImages is provided, use it; otherwise create array with single image
    if (galleryImages && Array.isArray(galleryImages)) {
        currentGalleryImages = galleryImages;
        currentImageIndex = galleryImages.indexOf(imageSrc);
        if (currentImageIndex === -1) currentImageIndex = 0;
    } else {
        currentGalleryImages = [imageSrc];
        currentImageIndex = 0;
    }
    
    showCurrentImage();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

function showCurrentImage() {
    const modalImage = document.getElementById('modalImage');
    const imageCounter = document.getElementById('imageCounter');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    
    if (!modalImage || currentGalleryImages.length === 0) return;
    
    modalImage.src = currentGalleryImages[currentImageIndex];
    imageCounter.textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
    
    // Show/hide navigation arrows based on gallery size and position
    if (currentGalleryImages.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        prevBtn.disabled = currentImageIndex === 0;
        nextBtn.disabled = currentImageIndex === currentGalleryImages.length - 1;
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function showPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        showCurrentImage();
    }
}

function showNextImage() {
    if (currentImageIndex < currentGalleryImages.length - 1) {
        currentImageIndex++;
        showCurrentImage();
    }
}

function hideImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Modal event listeners - Initialize after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideImageModal);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', showPreviousImage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', showNextImage);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideImageModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (modal && modal.style.display === 'block') {
            switch (e.key) {
                case 'Escape':
                    hideImageModal();
                    break;
                case 'ArrowLeft':
                    showPreviousImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        }
    });
});