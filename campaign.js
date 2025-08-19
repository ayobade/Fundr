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
    }
    
    function resetForm() {
        currentStep = 1;
        campaignForm.reset();
        
        const steps = document.querySelectorAll('.form-step');
        steps.forEach((step, index) => {
            const isFirst = index === 0;
            step.classList.toggle('active', isFirst);
            step.style.display = isFirst ? 'block' : 'none';
        });
        
        nextBtn.style.display = 'inline-block';
        publishBtn.style.display = 'none';
        
        updateStep();
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
    }
    
    if (galleryUpload && galleryFiles) {
        galleryUpload.addEventListener('click', () => galleryFiles.click());
    }
    
    campaignForm.addEventListener('submit', e => {
        e.preventDefault();
        const confirmCheckbox = document.getElementById('confirmInfo');
        if (confirmCheckbox && confirmCheckbox.checked) {
            alert('Campaign published successfully!');
            window.location.href = 'index.html';
        } else {
            alert('Please confirm that all information is correct before publishing.');
        }
    });
    
    updateStep();
});
