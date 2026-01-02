/*
    +--------------------------------------------------+
    �  ?? LANDING PAGE - Navigation & Interaction     �
    �  Hauptmen�-Logik der Landing Page               �
    �                                                  �
    �  Entwickler: Nico Kaschube                      �
    �  Berufsbildungswerk im Oberlinhaus Potsdam | 2025                  �
    +--------------------------------------------------+
*/

// ==================== MAIN PAGE MANAGER ====================

class MainPage {
    constructor() {
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.setupNavigation();
        this.setupSmoothScroll();
        this.setupMobileMenu();
        this.setupAuthIntegration();
        console.log('?? Main Page initialized');
    }
    
    // =========================================================================
    // NAVIGATION
    // =========================================================================
    
    setupNavigation() {
        // Active link highlighting
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-open');
                mobileToggle.classList.toggle('active');
            });
            
            // Close menu when clicking a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('mobile-open');
                    mobileToggle.classList.remove('active');
                });
            });
        }
    }
    
    // =========================================================================
    // AUTH INTEGRATION
    // =========================================================================
    
    setupAuthIntegration() {
        // Wait for authManager to be available
        const checkAuth = setInterval(() => {
            if (window.authManager) {
                clearInterval(checkAuth);
                this.connectAuthUI();
            }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkAuth), 5000);
    }
    
    connectAuthUI() {
        // Update UI for navigation auth buttons
        const loginBtnNav = document.getElementById('loginBtnNav');
        const logoutBtnNav = document.getElementById('logoutBtnNav');
        const userDisplayNav = document.getElementById('userDisplayNav');
        
        // Override authManager's updateUI to also update nav
        const originalUpdateUI = window.authManager.updateUI.bind(window.authManager);
        window.authManager.updateUI = function() {
            originalUpdateUI();
            
            // Update navigation auth display
            if (this.isLoggedIn()) {
                if (loginBtnNav) loginBtnNav.style.display = 'none';
                if (logoutBtnNav) logoutBtnNav.style.display = 'inline-flex';
                if (userDisplayNav) {
                    userDisplayNav.style.display = 'inline-flex';
                    userDisplayNav.textContent = `?? ${this.currentUser.username}`;
                }
            } else {
                if (loginBtnNav) loginBtnNav.style.display = 'inline-flex';
                if (logoutBtnNav) logoutBtnNav.style.display = 'none';
                if (userDisplayNav) userDisplayNav.style.display = 'none';
            }
        };
        
        // Connect buttons
        if (loginBtnNav && window.authUI) {
            loginBtnNav.addEventListener('click', () => window.authUI.openLoginModal());
        }
        
        if (logoutBtnNav) {
            logoutBtnNav.addEventListener('click', () => {
                if (confirm('M�chtest du dich wirklich abmelden?')) {
                    window.authManager.logout();
                }
            });
        }
        
        // Initial UI update
        window.authManager.updateUI();
        
        console.log('? Auth integration complete');
    }
}

// ============================================================================= 
// ANIMATIONS & EFFECTS                                                        
// ============================================================================= 

class PageEffects {
    constructor() {
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.setupScrollAnimations();
        this.setupParallax();
    }
    
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        document.querySelectorAll('.game-card, .about-card, .contact-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupParallax() {
        const floatingIcons = document.querySelectorAll('.floating-icon');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            floatingIcons.forEach((icon, index) => {
                const speed = 0.1 + (index * 0.05);
                icon.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
}

// ============================================================================= 
// INITIALIZE                                                                  
// ============================================================================= 

const mainPage = new MainPage();
const pageEffects = new PageEffects();

// Make globally accessible
window.mainPage = mainPage;

// ============================================================================= 
// ============================================================================= 

