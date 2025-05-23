// Global SVG scaling factor
const svgScaleFactor = 1.0; // Adjust this value to scale all SVGs (1.0 = 100%, 1.5 = 150%, etc.)

// Bio Segment Hover Animation
const bioSegments = document.querySelectorAll('.bio-segment');
const overlayContainer = document.querySelector('.overlay-container');
const overlayContent = document.querySelector('.overlay-content');

// Track active segment globally
let activeSegment = null;
let isHovering = false;

// Track if we're in mobile mode
let isMobile = window.innerWidth <= 768;

// Track active footer link
let activeFooterLink = null;
let footerOverlayContainer = null;
let footerOverlayContent = null;

// Add these global variables at the top of the file
let overlayTimer = null;
let footerOverlayTimer = null;


// Update the svgConfig object to include mobile versions
const svgConfig = {
    'EPFL': {
        filename: 'epfl-icon.svg',
        mobileFilename: 'epfl-icon-mobile.svg', // Add mobile versions
        scale: 0.85,
        width: 200,
        height: 100,
        position: { left: '45%', topOffset: '0%' }
    },
    'Economics': {
        filename: 'bocconi-icon.svg',
        mobileFilename: 'bocconi-icon-mobile.svg',
        scale: 0.9,
        width: 350,
        height: 150,
        position: { left: '48%', topOffset: '5%' }
    },
    'Design': {
        filename: 'pentagram.svg',
        mobileFilename: 'pentagram-mobile.svg',
        scale: 0.75,
        width: 250,
        height: 100,
        position: { left: '46%', topOffset: '-8%' }
    },
    'Urban': {
        filename: 'melb.svg',
        mobileFilename: 'melb-mobile.svg',
        scale: 0.85,
        width: 350,
        height: 120,
        position: { left: '50%', topOffset: '4%' }
    },
    'Music': {
        filename: 'falais.svg',
        mobileFilename: 'falais-mobile.svg',
        scale: 0.8,
        width: 400,
        height: 120,
        position: { left: '44%', topOffset: '-6%' }
    },
    'Easter': {
        filename: 'hehe.svg',
        mobileFilename: 'hehe.svg',
        scale: 0.7,
        width: 120,
        height: 80,
        position: { left: '47%', topOffset: '7%' }
    },
    'Archives': {
        filename: 'yap.svg',
        mobileFilename: 'yap-mobile.svg', 
        scale: 0.85,
        width: 380,
        height: 100,
        position: { left: '45%', topOffset: '-3%' }
    },
    'Research': {
        filename: 'business.svg',
        mobileFilename: 'business-mobile.svg',
        scale: 0.85,
        width: 350,
        height: 150,
        position: { left: '49%', topOffset: '2%' }
    }
};

// Update the footerSvgConfig object similarly
const footerSvgConfig = {
    'email': {
        filename: 'email.png',
        mobileFilename: 'email.png',
        scale: 0.4,
        width: 664,
        height: 228,
        position: { topOffset: '-120px', horizontalOffset: '-160px' },
        url: 'mailto:daniele.belfiore@epfl.ch'
    },
    'linkedin': {
        filename: 'linkedin.svg',
        mobileFilename: 'linkedin.svg',
        scale: 2.2,
        width: 120,
        height: 100,
        position: { topOffset: '-200px', horizontalOffset: '-100px' },
        url: 'https://www.linkedin.com/in/daniele-belfiore/'
    },
    'onepage': {
        filename: 'one-page.svg',
        mobileFilename: 'one-page.svg',
        scale: 3.0,
        width: 120,
        height: 100,
        position: { topOffset: '-200px', horizontalOffset: '-110px' },
        url: 'https://drive.google.com/file/d/1OVP0UWB3uUI2WuLKzDw5_xCm5Pn5TZEi/view?usp=sharing'
    },
    'fullcv': {
        filename: 'fullcv.svg',
        mobileFilename: 'fullcv.svg',
        scale: 1.7,
        width: 120,
        height: 100,
        position: { topOffset: '-140px', horizontalOffset: '-30px' },
        url: 'assets/full-cv.pdf'
    }
};

// Function to update overlay position when scrolling
function updateOverlayPosition() {
    // Bio overlay positioning
    if (activeSegment && overlayContainer.style.display === 'flex') {
        const overlayType = activeSegment.getAttribute('data-overlay');
        const config = svgConfig[overlayType];
        
        const rect = activeSegment.getBoundingClientRect();
        const topOffsetPercent = config.position.topOffset;
        const topOffset = rect.height * (parseFloat(topOffsetPercent) / 100);
        overlayContainer.style.top = `${rect.top + topOffset}px`;
    }
    
    // Footer overlay positioning
    if (activeFooterLink && footerOverlayContainer && footerOverlayContainer.style.display === 'flex') {
        const rect = activeFooterLink.getBoundingClientRect();
        
        // Determine which link was hovered
        let linkType = '';
        if (activeFooterLink.classList.contains('email')) linkType = 'email';
        else if (activeFooterLink.classList.contains('linkedin')) linkType = 'linkedin';
        else if (activeFooterLink.classList.contains('onepage')) linkType = 'onepage';
        else if (activeFooterLink.classList.contains('fullcv')) linkType = 'fullcv';
        else linkType = activeFooterLink.classList[1];
        
        const config = footerSvgConfig[linkType];
        
        if (config) {
            footerOverlayContainer.style.top = `${rect.top + parseFloat(config.position.topOffset)}px`;
            footerOverlayContainer.style.left = `${rect.left + (rect.width/2) + parseFloat(config.position.horizontalOffset)}px`;
        }
    }
}

// Function to reset all text colors
function resetAllTextColors() {
    bioSegments.forEach(segment => {
        segment.style.color = 'rgba(0, 0, 0, 0.5)';
    });
}

// Function to hide bio overlay
function hideOverlay() {
    // Reset active segment text color
    if (activeSegment) {
        activeSegment.style.color = 'rgba(0, 0, 0, 0.5)';
        activeSegment = null;
    }
    
    // Reset all segment text colors as a safeguard
    resetAllTextColors();
    
    // Hide overlay
    overlayContainer.style.opacity = '0';
    isHovering = false;
    
    setTimeout(() => {
        if (overlayContainer.style.opacity === '0') {
            overlayContainer.style.display = 'none';
            overlayContent.innerHTML = '';
        }
    }, 300);
}

// Function to hide footer overlay
function hideFooterOverlay() {
    if (!footerOverlayContainer) return;
    
    // Reset active footer link
    activeFooterLink = null;
    
    // Fade out the overlay
    footerOverlayContainer.style.opacity = '0';
    
    // After fade-out completes, hide the overlay
    setTimeout(() => {
        if (footerOverlayContainer.style.opacity === '0') {
            footerOverlayContainer.style.display = 'none';
            if (footerOverlayContent) {
                footerOverlayContent.innerHTML = '';
            }
        }
    }, 300);
}

// Function to show overlay for a segment
function showOverlay(segment) {
    // Reset any previous highlighting
    resetAllTextColors();
    
    // Set as active segment
    activeSegment = segment;
    isHovering = true;
    
    // Apply color to current segment
    const color = segment.getAttribute('data-color');
    segment.style.color = color;
    
    // Create and position the overlay
    const overlayType = segment.getAttribute('data-overlay');
    const config = svgConfig[overlayType];
    
    overlayContent.innerHTML = '';
    const img = document.createElement('img');
    img.src = config.filename;
    img.alt = overlayType;
    img.width = config.width * config.scale * svgScaleFactor;
    img.height = config.height * config.scale * svgScaleFactor;
    overlayContent.appendChild(img);
    
    overlayContainer.style.left = config.position.left;
    overlayContainer.style.display = 'flex';
    
    const rect = segment.getBoundingClientRect();
    const topOffsetPercent = config.position.topOffset;
    const topOffset = rect.height * (parseFloat(topOffsetPercent) / 100);
    overlayContainer.style.top = `${rect.top + topOffset}px`;
    
    setTimeout(() => {
        overlayContainer.style.opacity = '1';
    }, 10);
}

// Modify the showMobileOverlay function
function showMobileOverlay(segment) {
    // Clear any existing timers
    if (overlayTimer) {
        clearTimeout(overlayTimer);
    }
    
    // Reset any previous highlighting
    resetAllTextColors();
    
    // Set as active segment
    activeSegment = segment;
    isHovering = true;
    
    // Apply color to current segment
    const color = segment.getAttribute('data-color');
    segment.style.color = color;
    
    // Create and position the overlay
    const overlayType = segment.getAttribute('data-overlay');
    const config = svgConfig[overlayType];
    
    overlayContent.innerHTML = '';
    const img = document.createElement('img');
    
    // Check if there's a mobile-specific filename
    if (window.innerWidth <= 768 && config.mobileFilename) {
        img.src = config.mobileFilename;
    } else {
        img.src = config.filename;
    }
    
    img.alt = overlayType;
    
    // Adjust image size for mobile header
    if (window.innerWidth <= 768) {
        img.width = 120;
        img.height = 40;
    } else {
        img.width = config.width * config.scale * svgScaleFactor;
        img.height = config.height * config.scale * svgScaleFactor;
    }
    
    overlayContent.appendChild(img);
    
    // Mobile-specific positioning
    if (window.innerWidth <= 768) {
        overlayContainer.style.right = '0';
        overlayContainer.style.top = '0';
        overlayContainer.classList.add('active');
        document.querySelector('.site-header .name-tag').style.opacity = '0';
    } else {
        // Desktop positioning (unchanged)
        overlayContainer.style.right = config.position.right;
        
        const rect = segment.getBoundingClientRect();
        const topOffsetPercent = config.position.topOffset;
        const topOffset = rect.height * (parseFloat(topOffsetPercent) / 100);
        overlayContainer.style.top = `${rect.top + topOffset}px`;
    }
    
    overlayContainer.style.display = 'flex';
    
    setTimeout(() => {
        overlayContainer.style.opacity = '1';
    }, 10);
    
    // Set a timer to hide the overlay after 5 seconds on mobile
    if (window.innerWidth <= 768) {
        overlayTimer = setTimeout(() => {
            hideMobileOverlay();
        }, 5000);
    }
}

// Function to hide bio overlay on mobile
function hideMobileOverlay() {
    // Reset active segment text color
    if (activeSegment) {
        activeSegment.style.color = 'rgba(0, 0, 0, 0.5)';
        activeSegment = null;
    }
    
    // Reset all segment text colors as a safeguard
    resetAllTextColors();
    
    // Hide overlay
    overlayContainer.style.opacity = '0';
    overlayContainer.classList.remove('active');
    document.querySelector('.site-header .name-tag').style.opacity = '1';
    isHovering = false;
    
    setTimeout(() => {
        if (overlayContainer.style.opacity === '0') {
            overlayContainer.style.display = 'none';
            overlayContent.innerHTML = '';
        }
    }, 300);
}


// Modify the showFooterOverlay function
function showFooterOverlay(link) {
    if (!footerOverlayContainer || !footerOverlayContent) return;
    
    // Clear any existing timers
    if (footerOverlayTimer) {
        clearTimeout(footerOverlayTimer);
    }
    
    // Set as active footer link
    activeFooterLink = link;
    
    // Determine which link was hovered
    let linkType = '';
    if (link.classList.contains('email')) linkType = 'email';
    else if (link.classList.contains('linkedin')) linkType = 'linkedin';
    else if (link.classList.contains('onepage')) linkType = 'onepage';
    else if (link.classList.contains('fullcv')) linkType = 'fullcv';
    else linkType = link.classList[1];
    
    const config = footerSvgConfig[linkType];
    
    if (!config) {
        console.error('No config found for link type:', linkType);
        return;
    }
    
    // Clear previous content
    footerOverlayContent.innerHTML = '';
    
    // Create image element
    const img = document.createElement('img');
    
    // Check if there's a mobile-specific filename
    if (window.innerWidth <= 768 && config.mobileFilename) {
        img.src = config.mobileFilename;
    } else {
        img.src = config.filename;
    }
    
    img.alt = linkType;
    img.width = config.width * config.scale * svgScaleFactor;
    img.height = config.height * config.scale * svgScaleFactor;
    footerOverlayContent.appendChild(img);
    
    // Position the overlay - different for mobile vs desktop
    const rect = link.getBoundingClientRect();
    
    if (window.innerWidth <= 768) {
        // Mobile: center horizontally and position above footer
        footerOverlayContainer.style.left = '50%';
        footerOverlayContainer.style.transform = 'translateX(-50%)';
        footerOverlayContainer.style.top = 'auto';
        footerOverlayContainer.style.bottom = '100px';
    } else {
        // Desktop: use original positioning
        footerOverlayContainer.style.top = `${rect.top + parseFloat(config.position.topOffset)}px`;
        footerOverlayContainer.style.left = `${rect.left + (rect.width/2) + parseFloat(config.position.horizontalOffset)}px`;
        footerOverlayContainer.style.transform = 'none';
        footerOverlayContainer.style.bottom = 'auto';
    }
    
    footerOverlayContainer.style.display = 'flex';
    
    // Fade in the overlay with animation
    setTimeout(() => {
        footerOverlayContainer.style.opacity = '1';
    }, 10);
    
    // Set a timer to hide the footer overlay after 5 seconds
    if (window.innerWidth <= 768) {
        footerOverlayTimer = setTimeout(() => {
            hideFooterOverlay();
        }, 5000);
    }
}


// Throttled function to check if mouse is still over active segment
let isCheckingActiveSegment = false;
function checkActiveSegment(event) {
    if (!activeSegment || isCheckingActiveSegment) return;
    
    isCheckingActiveSegment = true;
    setTimeout(() => { isCheckingActiveSegment = false; }, 50);
    
    const rect = activeSegment.getBoundingClientRect();
    if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
    ) {
        hideOverlay();
    }
}

// Throttled function to check if mouse is still over active footer link
let isCheckingActiveFooterLink = false;
function checkActiveFooterLink(event) {
    if (!activeFooterLink || isCheckingActiveFooterLink) return;
    
    isCheckingActiveFooterLink = true;
    setTimeout(() => { isCheckingActiveFooterLink = false; }, 50);
    
    const rect = activeFooterLink.getBoundingClientRect();
    if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
    ) {
        hideFooterOverlay();
    }
}

// Update bio segment interactions to use mobile-specific functions on mobile
function setupBioSegments() {
    bioSegments.forEach(segment => {
        segment.style.transition = 'color 0.3s ease';
        
        if (window.innerWidth <= 768) {
            // For mobile: use click/tap events instead of hover
            segment.addEventListener('click', function(e) {
                e.preventDefault();
                if (activeSegment === this) {
                    hideMobileOverlay();
                } else {
                    showMobileOverlay(this);
                }
            });
        } else {
            // For desktop: use original hover behavior
            segment.addEventListener('mouseenter', function() {
                showOverlay(this);
            });

            segment.addEventListener('mouseleave', function() {
                // Short delay to avoid flickering when moving between segments
                setTimeout(() => {
                    if (activeSegment === this && !isMouseOverElement(this)) {
                        hideOverlay();
                    }
                }, 50);
            });
        }
    });
    
    // Add global listeners for scroll and mouse movement
    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 768) return; // Skip for mobile
        
        updateOverlayPosition();
        
        // Safety check - if we're scrolling and not actively hovering, reset everything
        if (!isElementVisible(activeSegment)) {
            hideOverlay();
        }
        
        // Check footer overlay visibility on scroll too
        if (!isElementVisible(activeFooterLink)) {
            hideFooterOverlay();
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 768) return; // Skip for mobile
        
        checkActiveSegment(e);
        checkActiveFooterLink(e);
        
        // Extra safety check - if no segment is being hovered, make sure all are reset
        if (!isCursorOverAnySegment(e)) {
            resetAllTextColors();
        }
    });
}

// Check if cursor is over any bio segment
function isCursorOverAnySegment(event) {
    for (let segment of bioSegments) {
        const rect = segment.getBoundingClientRect();
        if (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        ) {
            return true;
        }
    }
    return false;
}

// Check if mouse is over a specific element
function isMouseOverElement(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
    );
}

// Check if element is visible in viewport
function isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
    );
}

// Create footer overlay container once on page load
function createFooterOverlayContainer() {
    console.log("Creating footer overlay container");
    
    // Remove any existing container first
    const existingContainer = document.querySelector('.footer-overlay-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    const container = document.createElement('div');
    container.className = 'footer-overlay-container';
    
    // Use fixed positioning for better visibility
    container.style.position = 'fixed';
    container.style.zIndex = '1000';
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';
    container.style.pointerEvents = 'none';
    
    const content = document.createElement('div');
    content.className = 'footer-overlay-content';
    content.style.display = 'flex';
    content.style.justifyContent = 'center';
    content.style.alignItems = 'center';
    
    container.appendChild(content);
    document.body.appendChild(container);
    
    footerOverlayContainer = container;
    footerOverlayContent = content;
    
    console.log("Footer overlay container created");
    return container;
}

// Enhanced Footer links hover effect with URL linking
function setupFooterLinks() {
    console.log("Setting up footer links...");
    
    const footerLinks = document.querySelectorAll('.footer-link');
    console.log("Found footer links:", footerLinks.length);
    
    if (footerLinks.length === 0) {
        console.error("No footer links found! Check your HTML classes.");
        return;
    }
    
    const container = createFooterOverlayContainer();
    
    // First, convert all footer links to be clickable
    footerLinks.forEach(link => {
        // Identify the link type
        let linkType = '';
        if (link.classList.contains('email')) linkType = 'email';
        else if (link.classList.contains('linkedin')) linkType = 'linkedin';
        else if (link.classList.contains('onepage')) linkType = 'onepage';
        else if (link.classList.contains('fullcv')) linkType = 'fullcv';
        else linkType = link.classList[1];
        
        // Get the URL from config
        const config = footerSvgConfig[linkType];
        if (!config || !config.url) {
            console.warn(`No URL configured for ${linkType}`);
            return;
        }
        
        // Make the link clickable to open the specified URL in a new tab
        link.style.cursor = 'pointer';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(config.url, '_blank');
            console.log(`Opening ${config.url} in new tab`);
        });
        
        // Set up hover effects with SVG popups
        link.addEventListener('mouseenter', function() {
            showFooterOverlay(this);
        });
        
        link.addEventListener('mouseleave', function() {
            // Short delay to avoid flickering
            setTimeout(() => {
                if (activeFooterLink === this && !isMouseOverElement(this)) {
                    hideFooterOverlay();
                }
            }, 50);
        });
    });
    
    console.log("Footer links setup complete");
}

// Load projects from JSON
async function loadProjects() {
    try {
        const response = await fetch('js/projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const projects = await response.json();
        renderProjects(projects);
        
        // Store original projects for filtering
        window.originalProjects = Array.from(document.querySelectorAll('.project'));
        
        // Setup filtering after projects are loaded
        setupProjectFiltering();
    } catch (error) {
        console.error('Error loading projects:', error);
        // Display error message
        const projectsContainer = document.querySelector('.projects-container');
        projectsContainer.innerHTML = '<div class="error-message">Unable to load projects. Please try again later.</div>';
    }
}

// Render projects to the DOM
function renderProjects(projects) {
    const projectsContainer = document.querySelector('.projects-container');
    projectsContainer.innerHTML = ''; // Clear existing content
    
    projects.forEach(project => {
        const projectElement = createProjectElement(project);
        projectsContainer.appendChild(projectElement);
    });
}

// Create a project element
function createProjectElement(project) {
    // Create a wrapper link for the entire project
    const projectLink = document.createElement('a');
    projectLink.href = project.link || '#'; // Use project link or fallback to '#'
    projectLink.className = `project ${project.shape}`;
    projectLink.setAttribute('data-categories', project.categories.join(' '));
    projectLink.setAttribute('data-id', project.id);
    projectLink.setAttribute('target', '_blank'); // Open in new tab
    
    // Remove default link styling
    projectLink.style.textDecoration = 'none';
    projectLink.style.color = 'inherit';
    
    // Create shape div
    const shapeDiv = document.createElement('div');
    shapeDiv.className = `project-shape ${project.shape}`;
    projectLink.appendChild(shapeDiv);
    
    // Create image
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    projectLink.appendChild(img);
    
    // Create project info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'project-info';
    
    // Create simple title with no hover effects
    const titleH3 = document.createElement('h3');
    titleH3.className = 'project-title';
    titleH3.textContent = project.title;
    infoDiv.appendChild(titleH3);
    
    const descP = document.createElement('p');
    descP.className = 'project-description';
    descP.textContent = project.description;
    infoDiv.appendChild(descP);
    
    projectLink.appendChild(infoDiv);
    
    // Add octagon outline if needed
    if (project.shape === 'octagon') {
        const octagonOutline = document.createElement('div');
        octagonOutline.className = 'octagon-outline';
        octagonOutline.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 330 330" fill="none">
                <path d="M99 0L231 0L330 99L330 231L231 330L99 330L0 231L0 99L99 0Z" stroke="#BF42D8" stroke-width="6" fill="none"/>
            </svg>
        `;
        projectLink.appendChild(octagonOutline);
    }
    
    return projectLink;
}

// Project Filtering
function setupProjectFiltering() {
    const tags = document.querySelectorAll('.tag');
    const projects = document.querySelectorAll('.project');
    const projectsContainer = document.querySelector('.projects-container');
    let originalOrder = window.originalProjects || Array.from(projects);
    let activeFilter = null;

    tags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            // Prevent text selection when clicking tags
            e.preventDefault();
            
            const filter = this.getAttribute('data-tag');
            
            // If clicking the same tag, reset everything
            if (this.classList.contains('active')) {
                resetProjects();
                tags.forEach(t => t.classList.remove('active'));
                activeFilter = null;
            } else {
                // Remove active class from all tags
                tags.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tag
                this.classList.add('active');
                activeFilter = filter;
                
                // Reorder projects based on filter
                reorderProjects(filter);
            }
        });
    });

    function resetProjects() {
        // Reset to original order
        projectsContainer.innerHTML = '';
        originalOrder.forEach(project => {
            project.style.opacity = '1';
            project.style.filter = 'grayscale(0%)';
            projectsContainer.appendChild(project);
        });
        
        // Ensure links still work after reset
        setupProjectLinks();
    }
    
    // Helper function to ensure project links work properly
    function setupProjectLinks() {
        document.querySelectorAll('.project').forEach(project => {
            project.style.cursor = 'pointer';
        });
    }

    // Add this function after setupProjectLinks() or loadProjects()
function enhanceProjectTouchInteractions() {
    console.log("Enhancing project touch interactions...");
    document.querySelectorAll('.project').forEach(project => {
        // Add touchstart handler to show info immediately on touch
        project.addEventListener('touchstart', function(e) {
            // Get the info element and other parts
            const infoElement = this.querySelector('.project-info');
            const imgElement = this.querySelector('img');
            const outlineElement = this.querySelector('.octagon-outline');
            
            // Show project info
            if (infoElement) infoElement.style.opacity = '1';
            
            // Hide the image
            if (imgElement) imgElement.style.opacity = '0';
            
            // Show the octagon outline if applicable
            if (this.classList.contains('octagon') && outlineElement) {
                outlineElement.style.opacity = '1';
            }
            
            // Add border if applicable
            if (this.classList.contains('circle')) {
                this.style.border = '4px solid #F2C41C';
            } else if (this.classList.contains('square')) {
                this.style.border = '4px solid #3D88E8';
            }
        });
        
        // Add touchmove handler to reset if touch moved away
        project.addEventListener('touchmove', function(e) {
            // Only reset if touch moved significantly
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            
            if (touch.clientX < rect.left || touch.clientX > rect.right || 
                touch.clientY < rect.top || touch.clientY > rect.bottom) {
                
                // Reset project display
                resetProjectDisplay(this);
            }
        });
        
        // Add touchcancel to reset
        project.addEventListener('touchcancel', function() {
            resetProjectDisplay(this);
        });
        
        // Add touchend that doesn't interfere with link clicking
        project.addEventListener('touchend', function(e) {
            // Don't do anything on touchend - let the link be followed naturally
        });
    });
    console.log("Touch enhancements complete");
}

// Add this helper function to reset project display
function resetProjectDisplay(project) {
    // Hide project info
    const infoElement = project.querySelector('.project-info');
    if (infoElement) {
        infoElement.style.opacity = '0';
    }
    
    // Show the image
    const imgElement = project.querySelector('img');
    if (imgElement) {
        imgElement.style.opacity = '1';
    }
    
    // Hide the octagon outline if applicable
    if (project.classList.contains('octagon')) {
        const outlineElement = project.querySelector('.octagon-outline');
        if (outlineElement) {
            outlineElement.style.opacity = '0';
        }
    }
    
    // Remove border if applicable
    project.style.border = 'none';
}

    function reorderProjects(filter) {
        // Create arrays for the filtered order
        let matchingProjectsCircle = [];
        let matchingProjectsSquare = [];
        let matchingProjectsOctagon = [];
        let nonMatchingProjects = [];
        
        projects.forEach(project => {
            const categories = project.getAttribute('data-categories').split(' ');
            
            if (categories.includes(filter)) {
                // Check the shape of the project and sort accordingly
                if (project.classList.contains('circle') && filter === 'design') {
                    matchingProjectsCircle.push(project);
                } else if (project.classList.contains('square') && filter === 'research') {
                    matchingProjectsSquare.push(project);
                } else if (project.classList.contains('octagon') && filter === 'product') {
                    matchingProjectsOctagon.push(project);
                } else {
                    // This is a matching project but not of the primary shape for this filter
                    if (filter === 'design' && !project.classList.contains('circle')) {
                        matchingProjectsOctagon.push(project);
                    } else if (filter === 'research' && !project.classList.contains('square')) {
                        matchingProjectsCircle.push(project);
                    } else if (filter === 'product' && !project.classList.contains('octagon')) {
                        matchingProjectsSquare.push(project);
                    }
                }
                project.style.opacity = '1';
                project.style.filter = 'grayscale(0%)';
            } else {
                nonMatchingProjects.push(project);
                project.style.opacity = '0.3';
                project.style.filter = 'grayscale(100%)';
            }
        });
        
        // Clear container
        projectsContainer.innerHTML = '';
        
        // Add matching projects first by shape, then non-matching
        if (filter === 'design') {
            matchingProjectsCircle.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsSquare.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsOctagon.forEach(project => projectsContainer.appendChild(project));
        } else if (filter === 'research') {
            matchingProjectsSquare.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsCircle.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsOctagon.forEach(project => projectsContainer.appendChild(project));
        } else if (filter === 'product') {
            matchingProjectsOctagon.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsCircle.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsSquare.forEach(project => projectsContainer.appendChild(project));
        }
        
        nonMatchingProjects.forEach(project => {
            projectsContainer.appendChild(project);
        });
    }
}

// Helper function to get random color (used by flow animation)
function getRandomColor() {
    const colors = ['#D84242', '#3D88E8', '#F2C41C', '#BF42D8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add CSS to document head to ensure links maintain normal appearance
function addLinkStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .project {
            text-decoration: none !important;
            color: inherit !important;
        }
        
        .project:hover, .project:visited, .project:active, .project:focus {
            text-decoration: none !important;
            color: inherit !important;
        }
        
        .project-title {
            color: inherit !important;
            text-decoration: none !important;
        }
        
        .project-title:hover {
            color: inherit !important;
            text-decoration: none !important;
        }
        
        /* Prevent text selection on tags */
        .tag {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
    `;
    document.head.appendChild(styleElement);
}

// Helper function to add custom CSS for footer links
function addFooterLinkStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .footer-link {
            cursor: pointer !important;
            transition: color 0.3s ease;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .footer-link:hover {
            /* Colors already defined in your CSS */
        }
    `;
    document.head.appendChild(styleElement);
}

// Helper function to setup project links
function setupProjectLinks() {
    document.querySelectorAll('.project').forEach(project => {
        project.style.cursor = 'pointer';
    });
}

// Add window resize handler to switch between mobile and desktop behavior
window.addEventListener('resize', function() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    // If we crossed the breakpoint, reset everything and reinitialize
    if (wasMobile !== isMobile) {
        // Hide any active overlays
        if (activeSegment) {
            if (isMobile) {
                hideMobileOverlay();
            } else {
                hideOverlay();
            }
        }
        
        // Re-initialize components with new behavior
        setupBioSegments();
    }
});

// Add document click handler to close overlays when clicking elsewhere
document.addEventListener('click', function(e) {
    // Check if we have an active bio segment overlay
    if (activeSegment && overlayContainer.style.display === 'flex') {
        // Check if the click was outside the bio segment and overlay
        if (!activeSegment.contains(e.target) && !overlayContainer.contains(e.target)) {
            if (window.innerWidth <= 768) {
                hideMobileOverlay();
            } else {
                hideOverlay();
            }
        }
    }
    
    // Check if we have an active footer overlay
    if (activeFooterLink && footerOverlayContainer && footerOverlayContainer.style.display === 'flex') {
        // Check if the click was outside the footer link and overlay
        if (!activeFooterLink.contains(e.target) && !footerOverlayContainer.contains(e.target)) {
            hideFooterOverlay();
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing components...");
    // Set initial mobile state
isMobile = window.innerWidth <= 768;

    setupBioSegments();
    addFooterLinkStyles();
    setupFooterLinks();
    addLinkStyles(); // Add styles before loading projects
    loadProjects(); // Load projects from JSON
    
    // Initialize project links and touch behaviors with a slight delay
    // to ensure projects are loaded
    setTimeout(function() {
        setupProjectLinks();
        enhanceProjectTouchInteractions(); // Add our new function
    }, 500);
});