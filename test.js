document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------
    // 1. LENIS SMOOTH SCROLL (60FPS targeting)
    // --------------------------------------------------------
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

    // Integrate Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    // --------------------------------------------------------
    // 2. CUSTOM SPLIT-TEXT FUNCTION
    // --------------------------------------------------------
    function splitText(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.innerText;
            el.innerHTML = '';
            // Split into words, then characters, preserving spaces
            const words = text.split(' ');
            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap';
                
                const chars = word.split('');
                chars.forEach(char => {
                    const charSpan = document.createElement('span');
                    charSpan.style.display = 'inline-block';
                    charSpan.style.opacity = '0'; // Initial state for GSAP
                    charSpan.className = 'split-char';
                    charSpan.innerText = char;
                    wordSpan.appendChild(charSpan);
                });
                
                el.appendChild(wordSpan);
                
                // Add space after word (except last)
                if (wordIndex < words.length - 1) {
                    const space = document.createElement('span');
                    space.style.display = 'inline-block';
                    space.innerHTML = '&nbsp;';
                    el.appendChild(space);
                }
            });
        });
    }

    // Apply split text to Hero H1
    if (document.querySelector('.hero h1')) {
        splitText('.hero h1');
    }

    // --------------------------------------------------------
    // 4. PRELOADER & PAGE LOAD SEQUENCE
    // --------------------------------------------------------
    if (typeof gsap !== 'undefined') {
        const masterTimeline = gsap.timeline();

        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';

        // Preloader Animation
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
                }}, "-=0.1")
                // Trigger Hero Animations
                .add(heroAnimations(), "-=0.5");
        } else {
            // No preloader, just run hero animations
            if (window.lenisInstance) window.lenisInstance.start();
            document.body.style.overflow = '';
            masterTimeline.add(heroAnimations());
        }

        function heroAnimations() {
            const tl = gsap.timeline();
            
            // Split text reveal
            if (document.querySelectorAll('.split-char').length > 0) {
                tl.fromTo('.split-char', 
                    { y: 120, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, stagger: 0.02, ease: 'power4.out' }
                );
            }

            // Fade up other hero elements independently
            if(document.querySelector('.hero p')) {
                tl.fromTo('.hero p', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, "-=0.8");
            }
            if(document.querySelector('.hero-actions')) {
                tl.fromTo('.hero-actions', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, "-=0.6");
            }
            if(document.querySelector('.hero-image')) {
                tl.fromTo('.hero-image', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, "-=0.8");
            }
              
            return tl;
        }

        // --------------------------------------------------------
        // 5. NAVBAR SCROLL SHRINK
        // --------------------------------------------------------
        const navbar = document.querySelector('.navbar');
        if (navbar && typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                toggleClass: { className: 'nav-scrolled', targets: navbar }
            });
        }

        // --------------------------------------------------------
        // 6. SCROLLTRIGGER SECTION ANIMATIONS
        // --------------------------------------------------------
        if (typeof ScrollTrigger !== 'undefined') {
            // Generic fade-in-up replacement
            gsap.utils.toArray('.fade-in-up:not(.hero-content), .section-header, .footer-col, .footer-newsletter').forEach(el => {
                gsap.fromTo(el, 
                    { y: 40, opacity: 0 },
                    { 
                        y: 0, opacity: 1, 
                        duration: 0.8, 
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });

            // Staggered grids (Services, About, FAQ, etc)
            const grids = document.querySelectorAll('.services-grid, .faq-grid, .about-grid, .process-wrapper, .stats-row, .pricing-grid, .team-grid, .stats-grid, .dashboard-grid, .integration-grid, .journey-grid, .feature-list, .blog-grid, .workflow-interactive-container, .use-cases-grid, .spa-features-grid, .premium-values-grid, .timeline-nodes, .timeline-track');
            grids.forEach(grid => {
                const cards = grid.querySelectorAll('.service-card, .faq-card, .accordion-item, .process-box, .stat-box, .pricing-card, .team-card, .feature-item, .blog-card, .workflow-card, .timeline-card, .case-card, .premium-value-card, .timeline-node');
                if(cards.length > 0) {
                    gsap.fromTo(cards, 
                        { y: 50, opacity: 0 },
                        { 
                            y: 0, opacity: 1, 
                            duration: 0.8, 
                            stagger: 0.15, 
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: grid,
                                start: 'top 85%',
                                toggleActions: 'play none none none'
                            }
                        }
                    );
                }
            });

            // Parallax Images (Only on desktop for performance)
            if (window.innerWidth > 768) {
                gsap.utils.toArray('.hero-image img, .about-image img, .rounded-img').forEach(img => {
                    gsap.fromTo(img, 
                        { y: -20, scale: 1.05 },
                        { 
                            y: 20, scale: 1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: img.parentElement,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: true
                            }
                        }
                    );
                });
            }
            
            // Magnetic Buttons
            const magnets = document.querySelectorAll('.btn-primary, .btn-outline');
            magnets.forEach(btn => {
                if(window.innerWidth > 768) {
                    btn.addEventListener('mousemove', (e) => {
                        const rect = btn.getBoundingClientRect();
                        const h = rect.width / 2;
                        const v = rect.height / 2;
                        
                        const x = e.clientX - rect.left - h;
                        const y = e.clientY - rect.top - v;
                        
                        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
                    });
                    btn.addEventListener('mouseleave', () => {
                        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
                    });
                }
            });
        }
    }

    // --------------------------------------------------------
    // 7. ACCORDION LOGIC (Preserved)
    // --------------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const body = this.nextElementSibling;
            const icon = this.querySelector('.icon');
            
            // Close others
            document.querySelectorAll('.accordion-body').forEach(el => {
                if (el !== body) {
                    el.classList.remove('open');
                    el.style.maxHeight = null;
                    const prevIcon = el.previousElementSibling.querySelector('.icon');
                    if(prevIcon) prevIcon.textContent = '+';
                }
            });
            
            // Toggle current
            if (body.classList.contains('open')) {
                body.classList.remove('open');
                body.style.maxHeight = null;
                icon.textContent = '+';
            } else {
                body.classList.add('open');
                body.style.maxHeight = body.scrollHeight + "px";
                icon.textContent = '-';
            }
        });
    });

    // Handle Mobile Menu Logic (Assuming it's not handled by HTML inline onclicks)
    // Note: index.html has inline onclicks for nav-drawer, so we leave it as is.
    
    // --------------------------------------------------------
    // 8. COUNTER ANIMATIONS
    // --------------------------------------------------------
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
            const counterObj = { val: 0 };
            
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    gsap.to(counterObj, {
                        val: target,
                        duration: 2.5,
                        ease: 'power3.out',
                        onUpdate: () => {
                            counter.innerText = counterObj.val.toFixed(decimals);
                        }
                    });
                }
            });
        });
    }


    // --------------------------------------------------------
    // 8. UI/UX OVERHAUL ENHANCEMENTS
    // --------------------------------------------------------

    // A. Button Ripple Effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // B. Number Count-up Animation
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const statElements = document.querySelectorAll('.stat-number, .stat-value, .s-stat h4, .stat-box h3');
        statElements.forEach(stat => {
            // Check if it contains a number
            const text = stat.innerText;
            const match = text.match(/([0-9,.]+)/);
            if(match) {
                const originalNumStr = match[1].replace(/,/g, '');
                const originalNum = parseFloat(originalNumStr);
                
                if(!isNaN(originalNum)) {
                    const isInt = originalNumStr.indexOf('.') === -1;
                    const suffix = text.replace(match[0], ''); // keeps %, K, +, etc.
                    const prefix = text.indexOf(match[0]) > 0 ? text.substring(0, text.indexOf(match[0])) : '';
                    
                    gsap.fromTo(stat, 
                        { textContent: 0 },
                        {
                            textContent: originalNum,
                            duration: 2,
                            ease: 'power3.out',
                            snap: { textContent: isInt ? 1 : 0.1 },
                            scrollTrigger: {
                                trigger: stat,
                                start: 'top 90%',
                                toggleActions: 'play none none none'
                            },
                            onUpdate: function() {
                                stat.innerText = prefix + Number(this.targets()[0].textContent).toFixed(isInt ? 0 : 1) + suffix;
                            }
                        }
                    );
                }
            }
        });

        // C. Parallax Mousemove on Hero Images
        const heroImages = document.querySelectorAll('.hero-image img, .about-image img');
        document.addEventListener('mousemove', (e) => {
            if(window.innerWidth > 768) {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                
                gsap.to(heroImages, {
                    x: x,
                    y: y,
                    duration: 1,
                    ease: 'power2.out'
                });
            }
        });
    }

    // D. Form Focus State Handling (Floating Labels logic backup)
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                input.classList.add('has-val');
            } else {
                input.classList.remove('has-val');
            }
        });
    });


    // E. Dynamic Active Nav State
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if(link.getAttribute('href') === currentPath) {
            link.style.color = 'var(--primary)';
            link.style.position = 'relative';
            
            const dot = document.createElement('span');
            dot.style.position = 'absolute';
            dot.style.bottom = '-5px';
            dot.style.left = '50%';
            dot.style.transform = 'translateX(-50%)';
            dot.style.width = '5px';
            dot.style.height = '5px';
            dot.style.backgroundColor = 'var(--primary)';
            dot.style.borderRadius = '50%';
            dot.style.boxShadow = '0 0 8px var(--primary)';
            link.appendChild(dot);
        }
    });

    // F. Password Visibility Toggle
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        const toggleBtn = document.createElement('i');
        toggleBtn.className = 'fas fa-eye';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.right = '15px';
        toggleBtn.style.color = 'var(--text-muted)';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.zIndex = '10';
        
        toggleBtn.addEventListener('click', () => {
            if(input.type === 'password') {
                input.type = 'text';
                toggleBtn.className = 'fas fa-eye-slash';
                toggleBtn.style.color = 'var(--primary)';
            } else {
                input.type = 'password';
                toggleBtn.className = 'fas fa-eye';
                toggleBtn.style.color = 'var(--text-muted)';
            }
        });
        
        wrapper.appendChild(toggleBtn);
    });

});
// Premium Stats Section Animations (About Page)
if (document.querySelector('.premium-stats-section')) {
    
    // Counter & SVG Circle animation
    gsap.utils.toArray('.glass-stat-card').forEach(card => {
        let counter = card.querySelector('.counter');
        let circle = card.querySelector('.progress');
        
        if(counter && circle) {
            let target = parseFloat(counter.getAttribute('data-target'));
            let percent = parseFloat(circle.getAttribute('data-percent'));
            let decimals = counter.getAttribute('data-decimals') ? parseInt(counter.getAttribute('data-decimals')) : 0;
            
            ScrollTrigger.create({
                trigger: card,
                start: "top 80%",
                onEnter: () => {
                    // Animate SVG
                    let offset = 283 - (283 * percent) / 100;
                    circle.style.strokeDashoffset = offset;
                    
                    // Animate Counter
                    let obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 2,
                        ease: "power2.out",
                        onUpdate: function() {
                            if(decimals > 0) {
                                counter.innerHTML = obj.val.toFixed(decimals);
                            } else {
                                counter.innerHTML = Math.round(obj.val);
                            }
                        }
                    });
                },
                once: true
            });
        }
    });

    // Timeline Stagger
    gsap.from('.t-stagger', {
        scrollTrigger: {
            trigger: '.workflow-timeline',
            start: "top 85%"
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)"
    });

    // Particles Generation
    const container = document.getElementById('particlesContainer');
    if (container) {
        for(let i = 0; i < 30; i++) {
            let p = document.createElement('div');
            p.className = 'particle';
            let size = Math.random() * 4 + 1;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.opacity = Math.random() * 0.5 + 0.1;
            
            // Random movement
            gsap.to(p, {
                y: `+=${Math.random() * 100 - 50}`,
                x: `+=${Math.random() * 100 - 50}`,
                opacity: Math.random() * 0.5 + 0.1,
                duration: Math.random() * 5 + 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            
            container.appendChild(p);
        }
    }
}

    // Premium Modules Spotlight Tracking
    const moduleCards = document.querySelectorAll('.premium-module-card');
    
    moduleCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Premium Modules GSAP Stagger Entrance
    if (moduleCards.length > 0) {
        gsap.to(moduleCards, {
            scrollTrigger: {
                trigger: '.premium-modules-section',
                start: "top 80%"
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)"
        });
        
        // Initial setup for GSAP animation
        gsap.set(moduleCards, { y: 50, opacity: 0 });
    }

    // Premium Process Workflow GSAP Animations
    const workflowCore = document.querySelector('.workflow-core');
    const workflowLeft = document.querySelectorAll('.wf-left');
    const workflowRight = document.querySelectorAll('.wf-right');
    const wfCounters = document.querySelectorAll('.wf-stat .counter');

    if (workflowCore) {
        // Core Animation
        gsap.fromTo(workflowCore, 
            { scale: 0.5, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '.premium-workflow-section',
                    start: "top 75%"
                },
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            }
        );

        // Stagger Left Cards
        gsap.fromTo(workflowLeft, 
            { x: -50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '.premium-workflow-section',
                    start: "top 70%"
                },
                x: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            }
        );

        // Stagger Right Cards
        gsap.fromTo(workflowRight, 
            { x: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '.premium-workflow-section',
                    start: "top 70%"
                },
                x: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                delay: 0.1 // Slight delay after left cards
            }
        );

        // Animate new counters at the bottom
        wfCounters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const suffix = counter.getAttribute('data-suffix') || '';
            const isFloat = counter.getAttribute('data-decimals') !== null;
            
            ScrollTrigger.create({
                trigger: '.workflow-stats',
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(counter, {
                        innerHTML: target,
                        duration: 2.5,
                        ease: "power2.out",
                        snap: { innerHTML: isFloat ? 0.1 : 1 },
                        onUpdate: function() {
                            counter.innerHTML = (isFloat ? parseFloat(this.targets()[0].innerHTML).toFixed(1) : Math.round(this.targets()[0].innerHTML)) + suffix;
                        }
                    });
                }
            });
        });
    }

    // Premium FAQ Accordion Logic
    const premiumAccordionHeaders = document.querySelectorAll('.premium-accordion .accordion-header');
    
    // Set initial active state for initially open items
    document.querySelectorAll('.premium-accordion .accordion-body.open').forEach(body => {
        const header = body.previousElementSibling;
        if(header) {
            header.classList.add('active');
            // Set max-height for open items precisely
            body.style.maxHeight = body.scrollHeight + "px";
            // Replace plus with minus visually via transform in CSS (45deg)
        }
    });

    premiumAccordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const body = this.nextElementSibling;
            
            // Close others
            document.querySelectorAll('.premium-accordion .accordion-body').forEach(el => {
                if (el !== body) {
                    el.classList.remove('open');
                    el.style.maxHeight = null;
                    const h = el.previousElementSibling;
                    if(h) h.classList.remove('active');
                }
            });
            
            // Toggle current
            if (body.classList.contains('open')) {
                body.classList.remove('open');
                body.style.maxHeight = null;
                this.classList.remove('active');
            } else {
                body.classList.add('open');
                body.style.maxHeight = body.scrollHeight + "px";
                this.classList.add('active');
            }
        });
    });

    // Premium FAQ GSAP Stagger Entrance
    const faqStaggers = document.querySelectorAll('.faq-stagger');
    if (faqStaggers.length > 0) {
        gsap.fromTo(faqStaggers, 
            { y: 30, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '.premium-faq-section',
                    start: "top 75%"
                },
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: "back.out(1.5)"
            }
        );
    }
    
    const faqLeft = document.querySelector('.faq-left-col');
    if (faqLeft) {
        gsap.fromTo(faqLeft,
            { x: -50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: '.premium-faq-section',
                    start: "top 75%"
                },
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            }
        );
    }
    
    // FAQ Particles Generation
    const faqContainer = document.getElementById('faq-particles') || document.getElementById('faq-particles-services');
    if (faqContainer) {
        for(let i = 0; i < 20; i++) {
            let p = document.createElement('div');
            p.className = 'particle';
            let size = Math.random() * 3 + 1;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.opacity = Math.random() * 0.4 + 0.1;
            
            gsap.to(p, {
                y: `-=${Math.random() * 100 + 50}`,
                x: `+=${Math.random() * 50 - 25}`,
                opacity: 0,
                duration: Math.random() * 5 + 3,
                repeat: -1,
                ease: "linear"
            });
            
            faqContainer.appendChild(p);
        }
    }

    // Premium Timeline Interactions
    if (document.querySelector('.premium-timeline-section')) {
        
        // 1. Draw the glowing vertical track
        gsap.to('.timeline-progress', {
            scrollTrigger: {
                trigger: '.timeline-interactive-container',
                start: "top center",
                end: "bottom center",
                scrub: 1
            },
            height: "100%",
            ease: "none"
        });

        // 2. Animate Left Cards
        gsap.utils.toArray('.t-left').forEach(card => {
            gsap.fromTo(card, 
                { x: -50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%"
                    },
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }
            );
        });

        // 3. Animate Right Cards
        gsap.utils.toArray('.t-right').forEach(card => {
            gsap.fromTo(card, 
                { x: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%"
                    },
                    x: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: "power2.out"
                }
            );
        });

        // 4. 3D Tilt Effect on Hub
        const hub3D = document.getElementById('hub3D');
        if (hub3D) {
            document.querySelector('.timeline-hub').addEventListener('mousemove', (e) => {
                const rect = hub3D.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Calculate rotation (max 15 deg)
                const rotX = -(y / (rect.height / 2)) * 15;
                const rotY = (x / (rect.width / 2)) * 15;
                
                hub3D.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            });
            
            document.querySelector('.timeline-hub').addEventListener('mouseleave', () => {
                hub3D.style.transform = `rotateX(0deg) rotateY(0deg)`;
            });
        }
        
        // 5. Timeline Particles
        const tParticles = document.getElementById('timeline-particles');
        if (tParticles) {
            for(let i = 0; i < 30; i++) {
                let p = document.createElement('div');
                p.className = 'particle';
                let size = Math.random() * 4 + 1;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.opacity = Math.random() * 0.4;
                
                gsap.to(p, {
                    y: `-=${Math.random() * 200 + 100}`,
                    opacity: 0,
                    duration: Math.random() * 10 + 5,
                    repeat: -1,
                    ease: "linear"
                });
                
                tParticles.appendChild(p);
            }
        }
    }

    // Premium Core Values Section Logic
    const valuesGrid = document.getElementById('values-grid');
    if (valuesGrid) {
        
        const valueCards = document.querySelectorAll('.premium-value-card');
        
        // 1. GSAP Stagger Entrance
        gsap.fromTo(valueCards, 
            { y: 50, opacity: 0, scale: 0.9 },
            {
                scrollTrigger: {
                    trigger: '.premium-values-section',
                    start: "top 75%"
                },
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.5)"
            }
        );

        // 2. 3D Tilt and Spotlight Interaction
        valueCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Update Spotlight Position (CSS variables)
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                
                // Calculate 3D Tilt (max 10 deg)
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotX = -((y - centerY) / centerY) * 10;
                const rotY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });

        // 3. Values Particles Generation
        const vParticles = document.getElementById('values-particles');
        if (vParticles) {
            for(let i = 0; i < 25; i++) {
                let p = document.createElement('div');
                p.className = 'particle';
                let size = Math.random() * 3 + 1;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.opacity = Math.random() * 0.5;
                
                gsap.to(p, {
                    y: `-=${Math.random() * 150 + 50}`,
                    x: `+=${Math.random() * 40 - 20}`,
                    opacity: 0,
                    duration: Math.random() * 8 + 4,
                    repeat: -1,
                    ease: "linear"
                });
                
                vParticles.appendChild(p);
            }
        }
    }

    // ==========================================
    // PREMIUM SPA SERVICES DATA & LOGIC
    // ==========================================
    const servicesData = {
        "managed-security": {
            title: "Managed Security Services",
            subtitle: "Comprehensive Security Managed by Experts",
            image: "images/about_mission_lock.webp",
            desc1: "Stackly Managed Security Services provide continuous protection for your IT infrastructure through advanced monitoring, AI-powered threat detection, vulnerability management, and rapid incident response. Our security experts work as an extension of your team, ensuring your systems remain secure, compliant, and always available.",
            desc2: "Our end-to-end managed security solutions cover every layer of your digital environment, providing proactive defense against evolving cyber threats.",
            stats: [
                { val: "24/7", label: "Monitoring" },
                { val: "99.9%", label: "Uptime" },
                { val: "<15min", label: "Response Time" }
            ],
            features: [
                { icon: "fa-desktop", title: "24/7 Monitoring", desc: "Continuously monitor networks, endpoints, and cloud environments to detect suspicious activity in real time." },
                { icon: "fa-shield", title: "Threat Detection", desc: "Identify and neutralize advanced persistent threats and zero-day vulnerabilities before they cause harm." },
                { icon: "fa-bolt", title: "Incident Response", desc: "Contain and mitigate cyber incidents quickly to minimize downtime and business disruption." },
                { icon: "fa-clipboard-check", title: "Compliance Support", desc: "Maintain compliance with industry regulations through continuous assessments and reporting." }
            ]
        },
        "cloud-security": {
            title: "Advanced Cloud Security",
            subtitle: "Secure Your Cloud Infrastructure",
            image: "images/about_hero_banner.webp",
            desc1: "Protect your cloud workloads, applications, and data with our comprehensive cloud security solutions. We implement zero-trust architectures and continuous monitoring to defend against unauthorized access, data breaches, and misconfigurations.",
            desc2: "Whether you use AWS, Azure, or multi-cloud environments, our centralized security platform provides complete visibility and automated threat mitigation.",
            stats: [
                { val: "Multi", label: "Cloud Support" },
                { val: "Zero", label: "Trust Model" },
                { val: "100%", label: "Visibility" }
            ],
            features: [
                { icon: "fa-cloud", title: "Cloud Workload Protection", desc: "Secure your VMs, containers, and serverless architectures from advanced attacks." },
                { icon: "fa-lock", title: "Data Encryption", desc: "End-to-end encryption for data at rest and in transit to ensure complete privacy." },
                { icon: "fa-server", title: "Configuration Management", desc: "Automatically identify and remediate dangerous cloud misconfigurations." },
                { icon: "fa-eye", title: "Access Control", desc: "Strict IAM policies and multi-factor authentication to prevent credential theft." }
            ]
        },
        "network-security": {
            title: "Network Security Solutions",
            subtitle: "Fortify Your Digital Perimeter",
            image: "images/process.webp",
            desc1: "Defend your corporate network against internal and external threats. Our network security services combine Next-Gen Firewalls (NGFW), Intrusion Prevention Systems (IPS), and AI-driven traffic analysis to stop attacks before they reach your critical assets.",
            desc2: "We build resilient network architectures that ensure secure connectivity for your global workforce without compromising on performance.",
            stats: [
                { val: "10Gbps+", label: "Throughput" },
                { val: "Real-time", label: "Traffic Analysis" },
                { val: "DDoS", label: "Protection" }
            ],
            features: [
                { icon: "fa-network-wired", title: "Next-Gen Firewalls", desc: "Advanced firewall protection with deep packet inspection and application control." },
                { icon: "fa-wifi", title: "Secure VPN", desc: "Encrypted tunnels for secure remote access for your distributed workforce." },
                { icon: "fa-bug-slash", title: "Intrusion Prevention", desc: "Automatically block known and emerging network exploits in real time." },
                { icon: "fa-magnifying-glass-chart", title: "Traffic Analysis", desc: "AI-based behavioral analysis to detect lateral movement and anomalies." }
            ]
        },
        "endpoint-protection": {
            title: "Endpoint Protection Platform",
            subtitle: "Defend Every Device, Anywhere",
            image: "images/about_expert_laptop.webp",
            desc1: "Endpoints are the most common entry point for cyberattacks. Our Endpoint Protection Platform (EPP) and Endpoint Detection & Response (EDR) solutions secure every laptop, mobile device, and server in your organization against ransomware, malware, and fileless attacks.",
            desc2: "Our lightweight agents provide maximum security with zero impact on device performance.",
            stats: [
                { val: "AI", label: "Driven EDR" },
                { val: "Zero", label: "Performance Hit" },
                { val: "Automated", label: "Containment" }
            ],
            features: [
                { icon: "fa-laptop-medical", title: "Anti-Malware & Ransomware", desc: "Next-gen antivirus that stops malicious files and rolls back ransomware damage." },
                { icon: "fa-microchip", title: "Behavioral AI", desc: "Detect unknown threats by analyzing suspicious file and process behavior." },
                { icon: "fa-mobile-screen", title: "Mobile Threat Defense", desc: "Protect iOS and Android devices from malicious apps and phishing." },
                { icon: "fa-power-off", title: "Automated Isolation", desc: "Instantly disconnect compromised devices from the network to stop spread." }
            ]
        },
        "penetration-testing": {
            title: "Penetration Testing Services",
            subtitle: "Find Vulnerabilities Before Hackers Do",
            image: "images/faq_support.webp",
            desc1: "Our ethical hackers simulate real-world cyberattacks to identify hidden vulnerabilities in your applications, networks, and infrastructure. We provide actionable insights and detailed remediation steps to patch security holes before they can be exploited.",
            desc2: "From web applications to social engineering, we test every attack vector to ensure your defenses are truly impenetrable.",
            stats: [
                { val: "CREST", label: "Certified" },
                { val: "OWASP", label: "Top 10 Focus" },
                { val: "Detailed", label: "Remediation" }
            ],
            features: [
                { icon: "fa-code", title: "Web App Testing", desc: "Identify SQLi, XSS, and authentication bypass vulnerabilities in custom software." },
                { icon: "fa-server", title: "Network Pen Testing", desc: "Simulate internal and external attacks on your corporate infrastructure." },
                { icon: "fa-users-viewfinder", title: "Social Engineering", desc: "Phishing simulations and physical security testing to train your staff." },
                { icon: "fa-file-shield", title: "Comprehensive Reporting", desc: "Detailed executive summaries and technical remediation guidelines." }
            ]
        },
        "incident-response": {
            title: "Incident Response & Forensics",
            subtitle: "Rapid Recovery from Cyber Attacks",
            image: "images/about_mission_lock.webp",
            desc1: "When a breach occurs, every second counts. Our elite Incident Response team is available 24/7 to contain threats, eradicate attackers, and restore normal business operations. We combine digital forensics with rapid mitigation strategies to minimize impact and data loss.",
            desc2: "We also provide proactive IR planning and tabletop exercises to prepare your team for the worst-case scenarios.",
            stats: [
                { val: "1hr", label: "SLA Response" },
                { val: "Deep", label: "Forensic Analysis" },
                { val: "Full", label: "Recovery" }
            ],
            features: [
                { icon: "fa-truck-fast", title: "Rapid Containment", desc: "Immediate action to stop active attacks and prevent further data exfiltration." },
                { icon: "fa-magnifying-glass", title: "Digital Forensics", desc: "Identify the root cause, timeline, and scope of the security breach." },
                { icon: "fa-rotate-right", title: "System Recovery", desc: "Safely restore systems and data to return to normal business operations." },
                { icon: "fa-book-open", title: "Post-Incident Reports", desc: "Detailed analysis and recommendations to prevent future occurrences." }
            ]
        },
        "security-compliance": {
            title: "Security Compliance & Risk",
            subtitle: "Navigate Complex Security Regulations",
            image: "images/process.webp",
            desc1: "Achieving and maintaining regulatory compliance is complex. Our compliance experts help you navigate frameworks like SOC 2, ISO 27001, GDPR, HIPAA, and PCI DSS. We conduct gap assessments, build security policies, and manage continuous compliance monitoring.",
            desc2: "Turn compliance from a burden into a competitive advantage by demonstrating verifiable security to your clients.",
            stats: [
                { val: "SOC 2", label: "ISO 27001, HIPAA" },
                { val: "Continuous", label: "Auditing" },
                { val: "Custom", label: "Policies" }
            ],
            features: [
                { icon: "fa-scale-balanced", title: "Gap Assessments", desc: "Evaluate your current security posture against major regulatory frameworks." },
                { icon: "fa-file-signature", title: "Policy Development", desc: "Create and implement custom security policies tailored to your organization." },
                { icon: "fa-shield-halved", title: "Third-Party Risk", desc: "Assess and manage the cybersecurity risks introduced by your vendors." },
                { icon: "fa-check-double", title: "Audit Preparation", desc: "Expert guidance to ensure you successfully pass official compliance audits." }
            ]
        }
    };

    const spaNavItems = document.querySelectorAll('.spa-nav-item');
    const spaMainContent = document.getElementById('spa-main-content');
    
    if (spaNavItems.length > 0 && spaMainContent) {
        
        spaNavItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Prevent clicking if already active
                if(this.classList.contains('active')) return;
                
                // Update active state in sidebar
                spaNavItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                const serviceKey = this.getAttribute('data-service');
                const data = servicesData[serviceKey];
                
                if (data) {
                    // 1. GSAP Exit Animation
                    gsap.to(spaMainContent, {
                        opacity: 0,
                        x: 20,
                        duration: 0.3,
                        onComplete: () => {
                            
                            // 2. Swap Content
                            document.getElementById('dynamic-image').src = data.image;
                            document.getElementById('dynamic-title').innerText = data.title;
                            document.getElementById('dynamic-subtitle').innerText = data.subtitle;
                            document.getElementById('dynamic-desc-container').innerHTML = `<p>${data.desc1}</p><p>${data.desc2}</p>`;
                            
                            // Swap Stats
                            let statsHtml = '';
                            data.stats.forEach(stat => {
                                statsHtml += `<div class="s-stat"><h4 style="color:#fff;margin:0;">${stat.val}</h4><span style="color:var(--primary);font-size:0.8rem;text-transform:uppercase;">${stat.label}</span></div>`;
                            });
                            document.getElementById('dynamic-stats').innerHTML = statsHtml;
                            
                            // Swap Features
                            let featuresHtml = '';
                            data.features.forEach(f => {
                                featuresHtml += `
                                <div class="spa-feature-card">
                                    <div class="spa-f-icon"><i class="fa-solid ${f.icon}"></i></div>
                                    <h4>${f.title}</h4>
                                    <p>${f.desc}</p>
                                </div>`;
                            });
                            document.getElementById('dynamic-features').innerHTML = featuresHtml;
                            
                            // 3. GSAP Entrance Animation
                            gsap.fromTo(spaMainContent,
                                { opacity: 0, x: -20 },
                                { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
                            );
                            
                            // Stagger animate the new feature cards
                            gsap.fromTo('.spa-feature-card',
                                { opacity: 0, y: 20, scale: 0.9 },
                                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "back.out(1.5)" }
                            );
                        }
                    });
                }
            });
        });
        
        // SPA Particles Generation
        const sParticles = document.getElementById('spa-particles');
        if (sParticles) {
            for(let i = 0; i < 20; i++) {
                let p = document.createElement('div');
                p.className = 'particle';
                let size = Math.random() * 3 + 1;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.opacity = Math.random() * 0.4;
                
                gsap.to(p, {
                    y: `-=${Math.random() * 100 + 50}`,
                    opacity: 0,
                    duration: Math.random() * 6 + 4,
                    repeat: -1,
                    ease: "linear"
                });
                
                sParticles.appendChild(p);
            }
        }
    }





    // C. Newsletter form submit loading animation
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            if (btn) {
                btn.classList.add('loading');
                setTimeout(() => {
                    btn.classList.remove('loading');
                    window.location.href = '404.html';
                }, 2000);
            }
        });
    }



    // D. Global Body Scroll Lock for Dashboard Sidebar
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
        
        // Close sidebar on navigation item click for mobile
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

    // F. Premium Team Section Animation
    const teamSection = document.querySelector('.team.section');
    if (teamSection && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const teamGrid = teamSection.querySelector('.team-grid');
        const cards = teamSection.querySelectorAll('.team-card');

        // Setup Background FX
        const bgFx = document.createElement('div');
        bgFx.className = 'team-bg-fx';
        teamSection.insertBefore(bgFx, teamSection.firstChild);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'team-particles';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            bgFx.appendChild(particle);

            gsap.to(particle, {
                y: `random(-100, 100)`,
                x: `random(-50, 50)`,
                opacity: `random(0.1, 0.8)`,
                duration: `random(5, 10)`,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        cards.forEach((card, index) => {
            // Remove stagger-up class to avoid old GSAP conflicts
            card.classList.remove('stagger-up');
            card.classList.remove('fade-in-up');
            
            const info = card.querySelector('.team-info');
            const h4 = info.querySelector('h4');
            const originalName = h4.innerText;
            h4.innerHTML = '';
            
            originalName.split('').forEach(char => {
                const span = document.createElement('span');
                span.className = 'name-char';
                span.innerText = char === ' ' ? '\u00A0' : char;
                h4.appendChild(span);
            });

            const designationMap = ['Lead Security Architect', 'Senior Threat Analyst', 'Cloud Security Engineer'];
            const desigText = designationMap[index] || 'Cybersecurity Expert';
            const desig = document.createElement('div');
            desig.className = 'designation';
            desig.innerText = desigText;
            info.appendChild(desig);

            const underline = document.createElement('div');
            underline.className = 'underline';
            info.appendChild(underline);

            const socialWrap = document.createElement('div');
            socialWrap.className = 'social-icons';
            
            const linkedinIcon = '<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>';
            const twitterIcon = '<svg viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>';
            
            socialWrap.innerHTML = `
                <a href="#">${linkedinIcon}</a>
                <a href="#">${twitterIcon}</a>
            `;
            info.appendChild(socialWrap);

            const spotlight = document.createElement('div');
            spotlight.className = 'spotlight';
            card.appendChild(spotlight);

            // Hide the old plus-icon to avoid clutter
            const oldIcon = card.querySelector('.plus-icon');
            if (oldIcon) oldIcon.style.display = 'none';

            // Scroll Entrance Animation
            gsap.fromTo(card,
                { opacity: 0, y: 80, scale: 0.92, filter: 'blur(8px)' },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 75%',
                        toggleActions: 'play none none none'
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power4.out',
                    delay: index * 0.15,
                    onComplete: () => {
                        // Start Idle Animation (Floating) after entrance
                        gsap.to(card, {
                            y: `+=${Math.random() * 2 + 2}`,
                            duration: Math.random() * 1.5 + 2,
                            repeat: -1,
                            yoyo: true,
                            ease: 'sine.inOut'
                        });
                    }
                }
            );

            // Hover Events
            const img = card.querySelector('img');
            const nameChars = h4.querySelectorAll('.name-char');
            const icons = socialWrap.querySelectorAll('svg');

            card.addEventListener('mouseenter', () => {
                teamGrid.classList.add('is-hovering');

                gsap.to(card, {
                    y: -15, 
                    scale: 1.03,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 255, 204, 0.2)',
                    duration: 0.4,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });

                gsap.to(img, {
                    scale: 1.08,
                    filter: 'brightness(1.1)',
                    duration: 0.5,
                    ease: 'power2.out'
                });

                // Text Re-reveal
                gsap.fromTo(nameChars, 
                    { opacity: 0, y: 10 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.03,
                        duration: 0.3,
                        ease: 'power1.out'
                    }
                );

                gsap.to(desig, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    delay: 0.2,
                    ease: 'power2.out'
                });

                gsap.to(underline, {
                    width: '100%',
                    duration: 0.4,
                    delay: 0.3,
                    ease: 'power3.out'
                });

                gsap.to(icons, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.5,
                    delay: 0.3,
                    ease: 'back.out(1.7)'
                });
            });

            card.addEventListener('mousemove', (e) => {
                if(window.innerWidth > 768) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    spotlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 255, 204, 0.15) 0%, transparent 60%)`;

                    // 3D Tilt
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -5;
                    const rotateY = ((x - centerX) / centerX) * 5;

                    gsap.to(card, {
                        rotationX: rotateX,
                        rotationY: rotateY,
                        rotationZ: rotateY * 0.1, // Subtle image rotation 1-2deg via parent
                        duration: 0.1,
                        ease: 'none'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                teamGrid.classList.remove('is-hovering');

                gsap.to(card, {
                    scale: 1,
                    boxShadow: 'none',
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
                
                // Return to floating
                gsap.to(card, {
                    y: `+=${Math.random() * 2 + 2}`,
                    duration: Math.random() * 1.5 + 2,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });

                gsap.to(img, {
                    scale: 1,
                    filter: 'brightness(1)',
                    duration: 0.5,
                    ease: 'power2.out'
                });

                gsap.to(desig, {
                    opacity: 0,
                    y: 10,
                    duration: 0.2
                });

                gsap.to(underline, {
                    width: '0%',
                    duration: 0.3
                });

                gsap.to(icons, {
                    opacity: 0,
                    y: 15,
                    duration: 0.2
                });
                
                spotlight.style.opacity = 0;
            });
        });
    }
});
