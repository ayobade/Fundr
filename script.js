document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    
    mobileMenuToggle.addEventListener('click', function() {
        mobileMenuToggle.classList.toggle('active');
        headerNav.classList.toggle('active');
    });
    
    document.addEventListener('click', function(event) {
        if (!mobileMenuToggle.contains(event.target) && !headerNav.contains(event.target)) {
            mobileMenuToggle.classList.remove('active');
            headerNav.classList.remove('active');
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            headerNav.classList.remove('active');
        }
    });
});
