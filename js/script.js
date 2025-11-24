document.addEventListener("DOMContentLoaded", () => {

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');

        // Only run if cursor elements exist in HTML
        if (dot && ring) {
            // Use GSAP quickSetter for maximum performance
            const setDotX = gsap.quickSetter(dot, "x", "px");
            const setDotY = gsap.quickSetter(dot, "y", "px");
            
            // Simple mouse follow
            window.addEventListener("mousemove", (e) => {
                setDotX(e.clientX);
                setDotY(e.clientY);
                
                // Ring follows with delay (Lag effect)
                gsap.to(ring, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.15,
                    ease: "power2.out"
                });
            });

            // Hover State
            const hoverables = document.querySelectorAll('a, .magnetic, .project-card, .comm-node, .home-btn');
            hoverables.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    document.body.classList.add('hovering');
                    gsap.to(ring, { scale: 1.5 }); // Optional scale boost
                });
                el.addEventListener('mouseleave', () => {
                    document.body.classList.remove('hovering');
                    gsap.to(ring, { scale: 1 });
                });
            });

            // Magnetic Effect Logic
            const magnetics = document.querySelectorAll('.magnetic');
            magnetics.forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    const strength = el.getAttribute("data-strength") || 50; // Default strength
                    
                    gsap.to(el, {
                        x: x / (100 / strength),
                        y: y / (100 / strength),
                        duration: 0.5,
                        ease: "power3.out"
                    });
                });

                el.addEventListener('mouseleave', () => {
                    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
                });
            });
        }
    }

    const canvas = document.getElementById('bg-canvas');
    if (canvas && window.matchMedia("(min-width: 768px)").matches) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Create Particles
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.5
            });
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = "rgba(255,255,255,0.03)"; // Subtle particle color

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }

    // Check if we are on the 404 page
    if (document.querySelector('.error-code')) {
        const tl = gsap.timeline();
        tl.to(".error-code", { opacity: 1, y: 0, duration: 1, ease: "power4.out", delay: 0.2 })
          .to(".error-content", { opacity: 1, y: 0, duration: 1, ease: "power4.out" }, "-=0.5");
        return; // STOP HERE if on 404 page (don't run homepage scripts)
    }

    
    // Utils
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Smooth Scroll (Lenis) - only needed for long pages
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // GSAP ScrollTrigger Logic
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Reveal
        const heroTl = gsap.timeline();
        heroTl.to(".line", { y: 0, stagger: 0.15, duration: 1.5, ease: "power4.out", delay: 0.2 })
              .from(".hero-sub", { opacity: 0, y: 20, duration: 1 }, "-=0.8")
              .from(".status-pill", { opacity: 0, y: -20, duration: 1 }, "-=0.8");

        // Fade Up Elements
        gsap.utils.toArray('.fade-up').forEach(el => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top 85%" },
                y: 50, opacity: 0, duration: 1, ease: "power3.out"
            });
        });

        // Tech Stack Stagger
        gsap.from(".tech-pill", {
            scrollTrigger: { trigger: ".tech-stack", start: "top 90%" },
            y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.7)"
        });
    }

    // Mobile Menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.m-link');
    let isMenuOpen = false;

    const toggleMenu = () => {
        isMenuOpen = !isMenuOpen;
        if (mobileMenu) mobileMenu.classList.toggle('active', isMenuOpen);
        if (menuBtn) menuBtn.classList.toggle('active', isMenuOpen);
    };

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', () => {
        if (isMenuOpen) toggleMenu();
    }));

    
    // Project Card 3D Tilt (Desktop Only)
    if (window.matchMedia("(hover: hover)").matches) {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Spotlight
                const spotlight = card.querySelector('.spotlight');
                if(spotlight) {
                    spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 40%)`;
                    spotlight.style.opacity = 1;
                }

                // Tilt
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotateX = ((y - cy) / cy) * -3;
                const rotateY = ((x - cx) / cx) * 3;

                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                    duration: 0.1
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, { transform: `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`, duration: 0.5 });
                const spotlight = card.querySelector('.spotlight');
                if(spotlight) spotlight.style.opacity = 0;
            });
        });
    }
});