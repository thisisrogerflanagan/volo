/**
 * Volo Scroll-Reveal Logic
 * Animates text opacity based on viewport position.
 */

document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal-text');
    
    const handleScroll = () => {
        const viewportHeight = window.innerHeight;
        const centerPoint = viewportHeight / 2;
        
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // We'll use the top of the element for a cleaner "line-by-line" feel
            const elementTop = rect.top;
            
            // The point where the text should be 100% opaque (e.g., 60% from the top of the screen)
            const triggerPoint = viewportHeight * 0.6;
            
            // The range over which it fades in (from the bottom)
            const fadeRange = viewportHeight * 0.2;
            
            if (elementTop < triggerPoint) {
                // Once it's passed the trigger point moving up, it stays at 100%
                el.style.opacity = 1;
            } else {
                // Calculate fade based on distance to trigger point
                const distanceToTrigger = elementTop - triggerPoint;
                let progress = 1.0 - (distanceToTrigger / fadeRange);
                
                // Clamp and apply base opacity
                let opacity = 0.2 + (Math.max(0, progress) * 0.8);
                el.style.opacity = Math.min(1.0, opacity);
            }
        });
    };

    // Initial check
    handleScroll();
    
    // Optimized scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
});
