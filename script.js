document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. LENIS SMOOTH SCROLL (60FPS targeting)
    // =========================================
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        // Stop scroll immediately for preloader
        lenis.stop();
        window.lenisInstance = lenis; // Expose to timeline
    }

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // =========================================
    // 2. PRELOADER SEQUENCE
    // =========================================
    if (typeof gsap !== 'undefined') {
        const masterTimeline = gsap.timeline();

        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';

        if(document.querySelector('.preloader')) {
            const counterObj = { val: 0 };
            masterTimeline
                .to('.term-line', { opacity: 1, duration: 0.2, stagger: 0.3, ease: 'none' })
                .to(counterObj, {
                    val: 100,
                    duration: 1.5,
                    ease: 'power3.inOut',
                    onUpdate: () => {
                        const pctElement = document.querySelector('.percentage-counter');
                        if (pctElement) pctElement.innerText = Math.round(counterObj.val) + '%';
                    }
                }, "<")
                .to({}, { duration: 0.3 })
                .to('.preloader-terminal, .preloader-overlay', { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' })
                .to('.preloader', { yPercent: -100, duration: 0.8, ease: 'power4.inOut', onComplete: () => {
                    if (window.lenisInstance) window.lenisInstance.start();
                    document.body.style.overflow = '';
                }}, "-=0.1");
        } else {
            if (window.lenisInstance) window.lenisInstance.start();
            document.body.style.overflow = '';
        }
    }

    // =========================================
    // 3. BASE UI LOGIC
    // =========================================
    const dashToggle = document.getElementById('mobileToggle');
    const dashOverlay = document.getElementById('sidebarOverlay');
    const dashSidebar = document.getElementById('sidebar');
    if (dashToggle && dashOverlay && dashSidebar) {
        dashToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-open');
        });
        dashOverlay.addEventListener('click', function() {
            document.body.classList.remove('sidebar-open');
        });
        
        const navItems = dashSidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    dashSidebar.classList.remove('active');
                    dashOverlay.classList.remove('active');
                    document.body.classList.remove('sidebar-open');
                }
            });
        });
    }

    // FAQ Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const body = header.nextElementSibling;
            const isOpen = body.classList.contains('open');

            // Close all
            document.querySelectorAll('.accordion-body').forEach(b => {
                b.classList.remove('open');
                b.style.maxHeight = null;
                b.previousElementSibling.classList.remove('active');
            });

            if (!isOpen) {
                header.classList.add('active');
                body.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            if (btn) {
                btn.classList.add('loading');
                setTimeout(() => {
                    btn.classList.remove('loading');
                }, 2000);
            }
        });
    }

    // =========================================
    // 4. AMBIENT ENGINE & GSAP ANIMATIONS
    // =========================================
    
    // CUSTOM SPLIT TEXT FUNCTION
    function splitText(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.innerText;
            el.innerHTML = '';
            const words = text.split(' ');
            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';
                
                const chars = word.split('');
                chars.forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.style.display = 'inline-block';
                    charSpan.style.opacity = '1'; 
                    charSpan.className = 'split-char';
                    charSpan.innerText = char;
                    wordSpan.appendChild(charSpan);
                });
                
                el.appendChild(wordSpan);
                if (wordIndex < words.length - 1) {
                    const space = document.createElement('span');
                    space.style.display = 'inline-block';
                    space.innerHTML = '&nbsp;';
                    el.appendChild(space);
                }
            });
        });
    }
    
    const isMobile = window.innerWidth < 768;

    // Add Aurora Background
    const aurora = document.createElement('div');
    aurora.className = 'ambient-aurora';
    document.body.insertBefore(aurora, document.body.firstChild);

    if (!isMobile) {
        // Custom Cyber Cursor
        const cursor = document.createElement('div');
        cursor.className = 'cyber-cursor';
        document.body.appendChild(cursor);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mousedown', () => cursor.classList.add('active'));
        document.addEventListener('mouseup', () => cursor.classList.remove('active'));

        // Enterprise Floating Particles & Blobs
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'fixed';
        particleContainer.style.inset = '0';
        particleContainer.style.pointerEvents = 'none';
        particleContainer.style.zIndex = '-1';
        particleContainer.style.overflow = 'hidden';
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 12; i++) {
            const blob = document.createElement('div');
            blob.style.position = 'absolute';
            
            // Randomly create either small particles or large soft blobs
            const isBlob = Math.random() > 0.5;
            const size = isBlob ? (Math.random() * 300 + 100) : (Math.random() * 10 + 4);
            
            blob.style.width = size + 'px';
            blob.style.height = size + 'px';
            blob.style.borderRadius = '50%';
            
            if(isBlob) {
                // Soft gradient blobs (Cloudflare/Okta style)
                blob.style.background = 'radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 70%)';
                blob.style.filter = 'blur(20px)';
            } else {
                // Subtle floating dots
                blob.style.background = 'rgba(6, 182, 212, 0.2)';
            }
            
            blob.style.left = Math.random() * 100 + 'vw';
            blob.style.top = Math.random() * 100 + 'vh';
            particleContainer.appendChild(blob);

            gsap.to(blob, {
                y: `random(-150, 150)`,
                x: `random(-150, 150)`,
                scale: `random(0.8, 1.2)`,
                duration: `random(20, 40)`,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }


        function ambientRaf() {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            gsap.set(cursor, { x: cursorX, y: cursorY, xPercent: -50, yPercent: -50 });
            requestAnimationFrame(ambientRaf);
        }
        requestAnimationFrame(ambientRaf);
    }

    // HERO CINEMATIC SEQUENCE
    const hero = document.querySelector('.hero');
    if (hero) {
        splitText('.hero h1');
        const tl = gsap.timeline({ delay: document.querySelector('.preloader') ? 3.5 : 0.5 });
        
        const h1Spans = hero.querySelectorAll('h1 .split-word, h1 .split-char');
        const p = hero.querySelector('p');
        const btns = hero.querySelectorAll('.btn');
        const dashMockup = hero.querySelector('.dashboard-mockup, .hero-image');

        if(h1Spans.length) {
            tl.fromTo(h1Spans, 
                { opacity: 0, y: 50, rotateX: -90 },
                { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.05, ease: 'power4.out' }
            );
        }
        if (p) tl.fromTo(p, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
        if (btns.length) tl.fromTo(btns, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.5)' }, "-=0.4");
        if (dashMockup) tl.fromTo(dashMockup, { opacity: 0, scale: 0.9, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' }, "-=0.5");
    }

    // DIVERSE SECTION TRANSITIONS
    const sections = document.querySelectorAll('section:not(.hero)');
    const animations = ['mask', 'blur', 'scale', 'slide'];
    
    sections.forEach((section, index) => {
        const animType = animations[index % animations.length];
        const children = section.children;
        gsap.set(section, { opacity: 1 });

        if (animType === 'mask') {
            gsap.fromTo(children, 
                { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', opacity: 0 },
                { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1, duration: 1.2, scrollTrigger: { trigger: section, start: 'top 75%' } }
            );
        } else if (animType === 'blur') {
            gsap.fromTo(children, 
                { filter: 'blur(15px)', opacity: 0, scale: 1.05 },
                { filter: 'blur(0px)', opacity: 1, scale: 1, duration: 1.5, scrollTrigger: { trigger: section, start: 'top 75%' } }
            );
        } else if (animType === 'scale') {
            gsap.fromTo(children, 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.2)', scrollTrigger: { trigger: section, start: 'top 80%' } }
            );
        } else {
            gsap.fromTo(children, 
                { x: (index % 2 === 0 ? -100 : 100), opacity: 0 },
                { x: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 80%' } }
            );
        }
    });

    // AMBIENT CARD & TEAM MOTION (Post-Entrance)
    const allCards = document.querySelectorAll('.card, .stat-box, .team-card, .service-card, .dashboard-card');
    allCards.forEach(card => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                gsap.to(card, {
                    y: `random(-10, -5)`,
                    duration: `random(3, 5)`,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random() 
                });
            }
        });
    });

    // SIMULATED LIVE DASHBOARD
    setInterval(() => {
        const counters = document.querySelectorAll('.stat-value, .dashboard-number');
        if (counters.length === 0) return;
        const target = counters[Math.floor(Math.random() * counters.length)];
        if(target && !target.innerText.includes('%')) {
            const current = parseInt(target.innerText.replace(/,/g, ''));
            if (!isNaN(current)) {
                target.innerText = (current + Math.floor(Math.random() * 5)).toLocaleString();
                gsap.fromTo(target, { scale: 1.2, color: '#3B82F6' }, { scale: 1, color: '', duration: 0.5 });
            }
        }
    }, 3000);

    const aiIndicators = document.querySelectorAll('.status-indicator');
    aiIndicators.forEach(ind => {
        ind.classList.add('blinking-status');
    });

        // =========================================
    // STAT COUNTERS ANIMATION
    // =========================================
    const countersList = document.querySelectorAll('.counter');
    countersList.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target')) || 0;
        const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
        const suffix = counter.getAttribute('data-suffix') || '';
        
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2.5,
                    ease: 'power3.out',
                    onUpdate: function() {
                        counter.innerText = this.targets()[0].val.toFixed(decimals) + suffix;
                    }
                });
            }
        });
    });

    // PAGE TRANSITIONS
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname && !link.hash && link.target !== '_blank') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetUrl = link.href;
                gsap.to(document.body, {
                    opacity: 0,
                    filter: 'blur(10px)',
                    duration: 0.4,
                    onComplete: () => {
                        window.location = targetUrl;
                    }
                });
            });
        }
    });

    // Reset body state when loading from BFCache (e.g. clicking Back)
    window.addEventListener('pageshow', (e) => {
        if (e.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
            gsap.set(document.body, { opacity: 1, filter: 'blur(0px)' });
        }
    });


});




    // =========================================
    // ULTIMATE OVERHAUL GSAP LOGIC
    // =========================================
    
    // Stagger Up Elements
    const staggerSections = document.querySelectorAll('.section');
    staggerSections.forEach(section => {
        const staggerItems = section.querySelectorAll('.stagger-up, .service-card, .blog-card, .pricing-card, .feature-item');
        if (staggerItems.length > 0) {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.to(staggerItems, {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: 'power3.out'
                    });
                }
            });
        }
    });

    // Pricing Checkmark Stagger
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const listItems = card.querySelectorAll('ul li');
        if(listItems.length > 0) {
            gsap.set(listItems, { opacity: 0, x: -20 });
            ScrollTrigger.create({
                trigger: card,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(listItems, {
                        x: 0,
                        opacity: 1,
                        duration: 0.5,
                        stagger: 0.1,
                        ease: 'power2.out',
                        delay: 0.4
                    });
                }
            });
        }
    });

    // Testimonial Carousel Auto-Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    if (testimonialSlides.length > 0) {
        let currentSlideIndex = 0;
        
        function updateCarousel() {
            testimonialSlides.forEach((slide, index) => {
                slide.classList.remove('active', 'next', 'prev');
                
                if (index === currentSlideIndex) {
                    slide.classList.add('active');
                } else if (index === (currentSlideIndex + 1) % testimonialSlides.length) {
                    slide.classList.add('next');
                } else {
                    slide.classList.add('prev');
                }
            });
        }
        
        setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % testimonialSlides.length;
            updateCarousel();
        }, 4500);
        
        updateCarousel(); // Initialize
    }

    // =========================================
    // BLOG MOUSE PARALLAX
    // =========================================
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Subtle tilt based on cursor position
            const rotateY = (x / rect.width) * 10;
            const rotateX = -(y / rect.height) * 10;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
            
            // Move image slightly in opposite direction for depth
            const img = card.querySelector('img');
            if (img) {
                gsap.to(img, {
                    x: -x * 0.05,
                    y: -y * 0.05,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 4, // Reset to standard hover tilt
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
            const img = card.querySelector('img');
            if (img) {
                gsap.to(img, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
            }
        });
    });

    // =========================================
    // SERVICES MOUSE PARALLAX
    // =========================================
    const serviceCards = document.querySelectorAll('.premium-module-card');
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Subtle tilt based on cursor position
            const rotateY = (x / rect.width) * 10;
            const rotateX = -(y / rect.height) * 10;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 4, // Reset to standard hover tilt
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // =========================================
    // PRICING MOUSE PARALLAX
    // =========================================
    const pricingCardsForParallax = document.querySelectorAll('.pricing-card');
    pricingCardsForParallax.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateY = (x / rect.width) * 10;
            const rotateX = -(y / rect.height) * 10;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 4, // Reset to standard hover tilt
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });

    // =========================================
    // NEWSLETTER FORM HANDLER
    // =========================================
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload or redirect
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                // Show a sleek alert or custom notification (using basic alert for now)
                alert('Thank you for subscribing to the Stackly newsletter with ' + emailInput.value + '!');
                emailInput.value = ''; // Clear the input
            }
        });
    });

// --- Mobile Sidebar Auto-Close ---
document.querySelectorAll('.sidebar-nav a, .nav-item').forEach(link => {
    link.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    });
});
