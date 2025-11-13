// Performance-optimized script with debouncing and RAF
(function() {
    'use strict';
    
    // Debounce utility for better performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle utility using requestAnimationFrame
    function rafThrottle(func) {
        let rafId = null;
        return function(...args) {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                func.apply(this, args);
                rafId = null;
            });
        };
    }

    // Optimized mouse move with RAF throttling - only for desktop
    if (window.innerWidth > 768) {
        const shapes = document.querySelectorAll('.shape');
        const handleMouseMove = rafThrottle((e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 20;
                const xMove = (x - 0.5) * speed;
                const yMove = (y - 0.5) * speed;
                shape.style.transform = `translate(${xMove}px, ${yMove}px)`;
            });
        });
        
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Optimized card tilt effect with RAF and only for desktop
    if (window.innerWidth > 768) {
        const cards = document.querySelectorAll('.game-card');
        
        cards.forEach(card => {
            const handleCardMove = rafThrottle((e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.03)`;
            });
            
            card.addEventListener('mousemove', handleCardMove, { passive: true });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            }, { passive: true });
        });
    }

    // Optimized ripple effect with reduced animations
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            Object.assign(ripple.style, {
                position: 'absolute',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.6)',
                width: '20px',
                height: '20px',
                pointerEvents: 'none',
                animation: 'ripple 0.6s ease-out',
                willChange: 'transform, opacity'
            });
            
            const rect = card.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left - 10) + 'px';
            ripple.style.top = (e.clientY - rect.top - 10) + 'px';
            
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }, { passive: true });
    });

    // Add ripple animation efficiently
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                    margin-left: -100px;
                    margin-top: -100px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Intersection Observer for lazy animations (more efficient)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Prefetch on hover for even faster navigation
    if ('requestIdleCallback' in window) {
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const href = this.getAttribute('href');
                if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                    requestIdleCallback(() => {
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.href = href;
                        document.head.appendChild(link);
                    });
                }
            }, { once: true, passive: true });
        });
    }

    // Network information API for adaptive loading
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection && connection.effectiveType) {
            // Disable heavy animations on slow connections
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('reduce-animations');
                const style = document.createElement('style');
                style.textContent = '.reduce-animations * { animation-duration: 0.1s !important; transition-duration: 0.1s !important; }';
                document.head.appendChild(style);
            }
        }
    }

    // Visibility API to pause animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.querySelectorAll('.shape').forEach(shape => {
                shape.style.animationPlayState = 'paused';
            });
        } else {
            document.querySelectorAll('.shape').forEach(shape => {
                shape.style.animationPlayState = 'running';
            });
        }
    });

})();
