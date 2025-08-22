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

    // Update summary calculations
    function updateSummary() {
        const fee = Math.round(currentAmount * 0.05 * 100) / 100;
        const total = currentAmount + fee;

        summaryAmount.textContent = `$${currentAmount.toFixed(2)}`;
        summaryFee.textContent = `$${fee.toFixed(2)}`;
        summaryTotal.textContent = `$${total.toFixed(2)}`;
        btnAmount.textContent = `$${total.toFixed(2)}`;
    }

    // Handle contribution amount input
    contributionAmountInput.addEventListener('input', function() {
        currentAmount = parseFloat(this.value) || 0;
        updateSummary();
        
        // Hide error message when user starts typing
        if (currentAmount > 0) {
            hideAmountError();
        }
    });

    // Add event listeners to clear field errors on input
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

    // Step navigation
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

    // Navigate to next step
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep() && currentStep < totalSteps) {
            currentStep++;
            updateStep();
        }
    });

    // Navigate to previous step
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    // Validate current step
    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        
        // Special validation for step 1 (amount)
        if (currentStep === 1) {
            if (currentAmount <= 0) {
                showAmountError();
                return false;
            } else {
                hideAmountError();
            }
        }
        
        // Clear any existing field errors first
        clearFieldErrors();
        
        requiredFields.forEach(field => {
            if (!field.disabled && !field.value.trim()) {
                showFieldError(field);
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Show amount error state
    function showAmountError() {
        const amountContainer = document.querySelector('.amount-input-container');
        const amountError = document.getElementById('amountError');
        
        amountContainer.classList.add('error');
        amountError.classList.add('show');
        contributionAmountInput.focus();
        
        // Remove error state after animation
        setTimeout(() => {
            amountContainer.classList.remove('error');
        }, 500);
    }

    // Hide amount error state
    function hideAmountError() {
        const amountContainer = document.querySelector('.amount-input-container');
        const amountError = document.getElementById('amountError');
        
        amountContainer.classList.remove('error');
        amountError.classList.remove('show');
    }

    // Show field error state
    function showFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        formGroup.classList.add('error');
        
        // Get field-specific error message
        const fieldName = field.name || field.id;
        const errorElement = document.getElementById(fieldName + 'Error');
        if (errorElement) {
            errorElement.classList.add('show');
        }
        
        // Remove error state after animation
        setTimeout(() => {
            formGroup.classList.remove('error');
        }, 500);
    }

    // Clear all field errors
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

    // Update review data in step 3
    function updateReviewData() {
        const isAnonymous = anonymousToggle.checked;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        
        // Update donor info
        const donorName = isAnonymous ? 'Anonymous Donor' : `${firstName} ${lastName}`;
        document.getElementById('reviewDonor').textContent = donorName;
        
        // Update email
        document.getElementById('reviewEmail').textContent = isAnonymous ? 'Not provided' : email;
        
        // Update payment method
        const paymentText = selectedPayment ? selectedPayment.value.charAt(0).toUpperCase() + selectedPayment.value.slice(1) : 'Cryptocurrency';
        document.getElementById('reviewPayment').textContent = paymentText;
    }

    // Handle anonymous donation toggle
    if (anonymousToggle) {
        anonymousToggle.addEventListener('change', function() {
            toggleAnonymousMode(this.checked);
        });
    }

    // Toggle anonymous mode
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
            // Disable fields and remove required attribute
            firstNameInput.disabled = true;
            lastNameInput.disabled = true;
            emailInput.disabled = true;
            phoneInput.disabled = true;
            
            firstNameInput.removeAttribute('required');
            emailInput.removeAttribute('required');
            
            // Clear values
            firstNameInput.value = '';
            lastNameInput.value = '';
            emailInput.value = '';
            phoneInput.value = '';
            
            // Add disabled class to labels
            firstNameLabel.classList.add('disabled');
            lastNameLabel.classList.add('disabled');
            emailLabel.classList.add('disabled');
            phoneLabel.classList.add('disabled');
            
            // Set placeholder values
            firstNameInput.placeholder = 'Anonymous';
            lastNameInput.placeholder = 'Donor';
            emailInput.placeholder = 'Not provided';
            phoneInput.placeholder = 'Not provided';
        } else {
            // Enable fields and restore required attribute
            firstNameInput.disabled = false;
            lastNameInput.disabled = false;
            emailInput.disabled = false;
            phoneInput.disabled = false;
            
            firstNameInput.setAttribute('required', '');
            emailInput.setAttribute('required', '');
            
            // Remove disabled class from labels
            firstNameLabel.classList.remove('disabled');
            lastNameLabel.classList.remove('disabled');
            emailLabel.classList.remove('disabled');
            phoneLabel.classList.remove('disabled');
            
            // Restore original placeholders
            firstNameInput.placeholder = '';
            lastNameInput.placeholder = '';
            emailInput.placeholder = '';
            phoneInput.placeholder = '';
        }
    }

    // Wallet addresses for different cryptocurrencies
    const walletAddresses = {
        'BTC': 'bc1q5wh95h7vdwuu80nhpdhuxpznrxmcxnkndaswum',
        'ETH': '0xe7Ae6f99700B3463Ddf6B7fa807Ff735aDf7EAC4',
        'SOL': '26vvjS3DM9f9uMwEK2rRwh7T6MhUsmXpp9JjpmtEtLcC'
    };

    // Handle payment method selection
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

    // Handle cryptocurrency type change
    const cryptoTypeSelect = document.getElementById('cryptoType');
    if (cryptoTypeSelect) {
        cryptoTypeSelect.addEventListener('change', updateWalletAddress);
    }

    // Update wallet address based on selected cryptocurrency
    function updateWalletAddress() {
        const selectedCrypto = cryptoTypeSelect.value;
        const walletText = document.getElementById('walletText');
        
        if (walletText && walletAddresses[selectedCrypto]) {
            walletText.textContent = walletAddresses[selectedCrypto];
        }
    }

    // Form validation for final submission
    function validateForm() {
        const confirmCheckbox = document.getElementById('confirmSupport');
        
        if (!confirmCheckbox.checked) {
            alert('Please confirm that you want to support this project.');
            return false;
        }
        
        if (currentAmount <= 0) {
            // Go back to step 1 and show error
            currentStep = 1;
            updateStep();
            showAmountError();
            return false;
        }

        return true;
    }

    // Handle form submission
    supportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(supportForm);

        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        
        // Get form data
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

        // Show confirmation
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

        alert(confirmMessage);
        
        console.log('Support Data:', supportData);
        
        // In a real application, you would send this data to your backend
        // Redirect to browse projects page after successful support
        window.location.href = 'Funding.html';
    });

    // Load campaign data from URL parameters (if available)
    function loadCampaignData() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Get all campaign data from URL
        const campaignData = {
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
        
        // Update campaign details
        if (campaignData.title) {
            const titleElement = document.getElementById('campaignTitle');
            if (titleElement) {
                titleElement.textContent = campaignData.title;
            }
        }
        
        if (campaignData.category) {
            const categoryElement = document.getElementById('campaignCategory');
            if (categoryElement) {
                categoryElement.textContent = campaignData.category.charAt(0).toUpperCase() + campaignData.category.slice(1);
            }
        }
        
        if (campaignData.description) {
            const descriptionElement = document.getElementById('campaignDescription');
            if (descriptionElement) {
                descriptionElement.textContent = campaignData.description;
            }
        }
        
        if (campaignData.creator) {
            const creatorElement = document.getElementById('campaignCreator');
            if (creatorElement) {
                creatorElement.textContent = campaignData.creator;
            }
        }
        
        if (campaignData.image) {
            const campaignImage = document.getElementById('campaignImage');
            if (campaignImage) {
                campaignImage.src = campaignData.image;
                campaignImage.alt = campaignData.title || 'Campaign Image';
            }
        }
        
        // Update funding stats
        if (campaignData.raised) {
            const raisedElement = document.querySelector('.campaign-details .stat-value');
            if (raisedElement) {
                raisedElement.textContent = campaignData.raised;
            }
        }
        
        if (campaignData.target) {
            const statValues = document.querySelectorAll('.campaign-details .stat-value');
            if (statValues[1]) {
                statValues[1].textContent = campaignData.target;
            }
        }
        
        if (campaignData.days) {
            const statValues = document.querySelectorAll('.campaign-details .stat-value');
            if (statValues[2]) {
                statValues[2].textContent = campaignData.days;
            }
        }
        
        // Update progress bar
        if (campaignData.progress) {
            const progressFill = document.querySelector('.campaign-details .progress-fill');
            if (progressFill) {
                progressFill.style.width = `${campaignData.progress}%`;
            }
        }
        
        if (campaignData.id) {
            console.log('Loading campaign data for ID:', campaignData.id);
        }
    }

    // Animate progress bar on load
    function animateProgressBar() {
        const progressBar = document.querySelector('.progress-fill');
        const width = progressBar.style.width;
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = width;
        }, 500);
    }



    // Real-time validation
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

    // Initialize
    loadCampaignData();
    animateProgressBar();
    addRealTimeValidation();
    updateSummary();
    updateStep();
    addFieldErrorClearListeners();
    
    // Set default crypto details visibility
    cryptoDetails.style.display = 'block';
    
    // Initialize wallet address
    updateWalletAddress();
});

// Copy wallet address function (global scope for onclick)
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

// Fallback copy method
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
        console.error('Copy failed:', err);
        btn.textContent = 'Copy Failed';
        setTimeout(() => {
            btn.textContent = 'Copy';
        }, 2000);
    }
    
    document.body.removeChild(textArea);
}
