document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    
    if (!mobileMenuToggle || !headerNav) return;
    
    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        headerNav.classList.toggle('active');
    }
    
    function closeMobileMenu() {
        mobileMenuToggle.classList.remove('active');
        headerNav.classList.remove('active');
    }
    
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    document.addEventListener('click', event => {
        if (!mobileMenuToggle.contains(event.target) && !headerNav.contains(event.target)) {
            closeMobileMenu();
        }
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
});