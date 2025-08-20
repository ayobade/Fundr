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
    const campaignForm = document.getElementById('campaignForm');
    
    let currentStep = 1;
    const totalSteps = 6;
    let galleryImages = [];
    const maxGalleryImages = 5;
    let coverImageData = null;
    
    if (!nextBtn || !prevBtn || !publishBtn) return;
    
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
        const title = document.getElementById('campaignTitle').value || '-';
        const amount = document.getElementById('targetAmount').value || '-';
        const currency = document.getElementById('currency').value || 'USD';
        const deadline = document.getElementById('deadline').value || '-';
        const companyName = document.getElementById('companyName').value || '-';
        const wallet = document.getElementById('walletAddress').value || '-';
        
        document.getElementById('summaryTitle').textContent = title;
        document.getElementById('summaryGoal').textContent = amount ? `${currency} ${amount}` : '-';
        document.getElementById('summaryDeadline').textContent = deadline !== '-' ? deadline : '-';
        document.getElementById('summaryRewards').textContent = companyName !== '-' ? 'Company Profile' : 'No Company Profile';
        document.getElementById('summaryWallet').textContent = wallet !== '-' ? `${wallet.substring(0, 10)}...` : '-';
        
        const coverContainer = document.getElementById('summaryCoverContainer');
        const coverImage = document.getElementById('summaryCoverImage');
        
        if (coverImageData) {
            coverImage.src = coverImageData.src;
            coverContainer.style.display = 'block';
        } else {
            coverContainer.style.display = 'none';
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
    
    if (campaignForm) {
        campaignForm.addEventListener('submit', e => {
            e.preventDefault();
            console.log('Form submission triggered');
            
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
                showAlert('🎉 Campaign published successfully!\n\nYour campaign is now live and ready to receive backing.', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        });
    }
    
    // Also add direct click handler as backup
    if (publishBtn) {
        publishBtn.addEventListener('click', function(e) {
            console.log('Publish button clicked');
            // Since this is a submit button, prevent default and handle manually
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
                showAlert('🎉 Campaign published successfully!\n\nYour campaign is now live and ready to receive backing.', 'success');
                setTimeout(() => {
            window.location.href = 'index.html';
                }, 2000);
            }
        });
    }
    
    function showAlert(message, type = 'info') {
        const alertTypes = {
            success: { icon: '✅', color: '#338f42' },
            warning: { icon: '⚠️', color: '#ff9500' },
            error: { icon: '❌', color: '#ff4444' },
            info: { icon: 'ℹ️', color: '#0066cc' }
        };
        
        const alertConfig = alertTypes[type] || alertTypes.info;
        alert(`${alertConfig.icon} ${message}`);
    }
    
    updateStep();
});
