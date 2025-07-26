document.addEventListener('DOMContentLoaded', function() {
    const svg = document.querySelector('.flow-lines');
    const steps = document.querySelectorAll('.flow-step');
    const flowContainer = document.querySelector('.mechanics-flow');
    const mechanicsSection = document.querySelector('.mechanics');

    if (!svg || steps.length === 0 || !flowContainer || !mechanicsSection) {
        console.error("Required elements for flow diagram not found.");
        return;
    }

    // Create an intersection observer to detect when the mechanics section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                svg.classList.add('animate-lines');
                // Once animation is triggered, we can stop observing
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // Start animation when 20% of the section is visible

    observer.observe(mechanicsSection);

    function isDesktop() {
        return window.innerWidth >= 768;
    }

    function getCenter(element) {
        // Gets the center coordinates of an element relative to its container
        const rect = element.getBoundingClientRect();
        const containerRect = flowContainer.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
    }

    function drawLines() {
        // Clear previous lines
        svg.innerHTML = '';
        
        // Determine number of connections based on viewport
        const numberOfSteps = isDesktop() ? steps.length : (steps.length - 1);
        
        // Draw lines between steps
        for (let i = 0; i < numberOfSteps; i++) {
            const startStep = steps[i];
            const endStep = steps[(i + 1) % steps.length]; // Modulo only affects desktop layout

            const start = getCenter(startStep);
            const end = getCenter(endStep);

            // Calculate a control point to make the line curve outwards
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // This creates the "loopy" effect by finding a perpendicular offset
            const normalX = -dy;
            const normalY = dx;
            const normalLength = Math.sqrt(normalX*normalX + normalY*normalY);
            const unitNormalX = normalLength > 0 ? normalX / normalLength : 0;
            const unitNormalY = normalLength > 0 ? normalY / normalLength : 0;
            
            // The 'loopiness' factor determines how much the line curves
            const loopiness = distance * 0.4;
            const controlX = (start.x + end.x) / 2 + unitNormalX * loopiness;
            const controlY = (start.y + end.y) / 2 + unitNormalY * loopiness;
            
            // Create the SVG path element
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // M = Move to, Q = Quadratic Bezier Curve to
            path.setAttribute('d', `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`);
            path.setAttribute('stroke', '#BDBDBD');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-dasharray', '5, 5');
            path.setAttribute('fill', 'none');
            path.setAttribute('pathLength', '100'); // For more precise animation control
            
            svg.appendChild(path);
        }
    }

    // A small timeout ensures all elements are rendered before we calculate their positions
    setTimeout(drawLines, 100);

    // Redraw lines on window resize to keep it responsive
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(drawLines, 200);
    });
    
    // 3D Mouse tracking effect for phone mockup
    const phoneMockup = document.querySelector('.phone-mockup');
    const phoneImg = phoneMockup.querySelector('img');
    
    let rect = phoneMockup.getBoundingClientRect();
    let mouseX = 0;
    let mouseY = 0;
    let centerX = rect.left + rect.width / 2;
    let centerY = rect.top + rect.height / 2;
    
    function updateMousePosition(e) {
        mouseX = e.clientX - centerX;
        mouseY = e.clientY - centerY;
    }
    
    function updateTransform() {
        if (!phoneMockup.classList.contains('hovering')) return;
        
        // Convert mouse position to rotation angles
        const rotateY = (mouseX / centerX) * 15; // max 15 degrees
        const rotateX = -(mouseY / centerY) * 10; // max 10 degrees
        
        // Apply transform with damping
        const currentTransform = phoneImg.style.transform || '';
        const targetTransform = `translateZ(50px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${window.innerWidth >= 768 ? 1.08 : 1.05})`;
        
        phoneImg.style.transform = targetTransform;
    }
    
    function startTracking() {
        rect = phoneMockup.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
        phoneMockup.classList.add('hovering');
        updateTransform();
    }
    
    function stopTracking() {
        phoneMockup.classList.remove('hovering');
        phoneImg.style.transform = 'rotateY(0) rotateX(0) scale(1)';
    }
    
    phoneMockup.addEventListener('mouseenter', startTracking);
    phoneMockup.addEventListener('mouseleave', stopTracking);
    phoneMockup.addEventListener('mousemove', (e) => {
        updateMousePosition(e);
        requestAnimationFrame(updateTransform);
    });
    
    // Update center point on resize
    window.addEventListener('resize', () => {
        rect = phoneMockup.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
    });
});