document.addEventListener("DOMContentLoaded", () => {

    // --- FUNZIONI DI UTILITÀ E INIZIALIZZAZIONE ---

    /**
     * Carica dinamicamente contenuto HTML da un file parziale in un elemento.
     * @param {string} url Il percorso del file HTML parziale.
     * @param {string} elementId L'ID dell'elemento dove inserire l'HTML.
     */
    const loadHTML = async (url, elementId) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Could not load ${url}: ${response.statusText}`);
            const text = await response.text();
            const element = document.getElementById(elementId);
            if (element) element.innerHTML = text;
        } catch (error) { 
            console.error(`Errore nel caricamento di ${elementId}:`, error); 
        }
    };
    
    /**
     * Imposta la classe 'active' sul link di navigazione corrispondente alla pagina corrente.
     */
    const setActiveNavLink = () => {
        const navLinks = document.querySelectorAll('.nav-menu a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html'; 
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    };

    /**
     * Crea e aggiunge particelle fluttuanti al background.
     */
    const createParticles = () => {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        const particleCount = window.innerWidth > 768 ? 40 : 20; 
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.animationDuration = `${Math.random() * 4 + 4}s`;
            particlesContainer.appendChild(particle);
        }
    };
    
    /**
     * Abilita lo scrolling fluido per i link che puntano ad ancore (#).
     */
    const initSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    };

    /**
     * Aggiunge un effetto "scrolled" alla navbar quando si scorre la pagina.
     * Nasconde la navbar quando si scorre verso il basso e la mostra quando si scorre verso l'alto.
     */
    const initNavbarScroll = () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateNavbar = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
                
                // Nasconde la navbar quando si scorre verso il basso
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.style.transform = 'translateX(-50%) translateY(-100%)';
                    navbar.style.opacity = '0';
                } else {
                    // Mostra la navbar quando si scorre verso l'alto
                    navbar.style.transform = 'translateX(-50%) translateY(0)';
                    navbar.style.opacity = '1';
                }
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.transform = 'translateX(-50%) translateY(0)';
                navbar.style.opacity = '1';
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll);
    };

    /**
     * Gestisce l'apertura e la chiusura del menu di navigazione su mobile.
     */
    const initMobileNav = () => {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    };

    /**
     * Gestisce la logica del banner dei cookie.
     */
    const initCookieBanner = () => {
        const cookieBanner = document.getElementById('cookieBanner');
        const acceptCookieBtn = document.getElementById('acceptCookieBtn');
        if (!cookieBanner || !acceptCookieBtn) return;

        const setCookie = (name, value, days) => {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        };

        const getCookie = (name) => {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for(let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        };

        if (!getCookie('cookie_consent_cv')) {
            cookieBanner.style.display = 'flex';
        }

        acceptCookieBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setCookie('cookie_consent_cv', 'true', 365);
            cookieBanner.style.display = 'none';
        });
    };

    /**
     * Aggiorna l'anno del copyright nel footer con l'anno corrente.
     */
    const updateCopyrightYear = () => {
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) {
            const currentYear = new Date().getFullYear();
            yearElement.textContent = currentYear;
        }
    };

    /**
     * Rileva se il dispositivo è Apple (iOS/iPadOS/macOS)
     */
    const isAppleDevice = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        
        // Rilevamento per iOS/iPadOS
        const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                     (platform === 'macintel' && navigator.maxTouchPoints > 1);
        
        // Rilevamento per macOS (Safari)
        const isMacOS = /macintosh|mac os x/.test(userAgent) && !isIOS;
        
        // Rilevamento per WebKit (Safari)
        const isWebKit = /webkit/.test(userAgent) && !/chrome|chromium|edge/.test(userAgent);
        
        return isIOS || isMacOS || isWebKit;
    };

    /**
     * Gestisce la Bottom Navigation Bar solo su dispositivi Apple.
     */
    const initBottomNav = () => {
        const bottomNav = document.getElementById('bottomNav');
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        
        if (!bottomNav) return;
        
        // Mostra solo su dispositivi Apple
        if (isAppleDevice()) {
            bottomNav.style.display = 'flex';
        } else {
            bottomNav.style.display = 'none';
            return;
        }
        
        // Imposta l'elemento attivo
        const setActiveBottomNavItem = () => {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            bottomNavItems.forEach(item => {
                const itemPage = item.getAttribute('href').split('/').pop();
                if (itemPage === currentPage) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        };

        setActiveBottomNavItem();
    };

    // --- FUNZIONE PRINCIPALE DI INIZIALIZZAZIONE ---

    const init = async () => {
        // Carica i componenti HTML parziali in parallelo
        await Promise.all([
            loadHTML('partials/header.html', 'header-placeholder'),
            loadHTML('partials/footer.html', 'footer-placeholder')
        ]);

        // Una volta caricati i parziali, inizializza le funzioni che dipendono da essi
        setActiveNavLink();
        initMobileNav();
        initCookieBanner();
        initNavbarScroll();
        updateCopyrightYear();
        initBottomNav(); // <-- Inizializza la Bottom Navigation Bar

        // Inizializza le funzionalità globali
        createParticles();
        initSmoothScrolling();
    };

    // Avvia l'applicazione
    init();
});