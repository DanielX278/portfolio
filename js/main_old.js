// Global SVG scaling factor
const svgScaleFactor = 1.0; // Adjust this value to scale all SVGs (1.0 = 100%, 1.5 = 150%, etc.)

// Bio Segment Hover Animation
const bioSegments = document.querySelectorAll('.bio-segment');
const overlayContainer = document.querySelector('.overlay-container');
const overlayContent = document.querySelector('.overlay-content');

// Combined configuration for SVG overlays
const svgConfig = {
    'EPFL': {
        filename: 'epfl.svg',
        scale: 0.85,
        width: 200,
        height: 100,
        position: { right: '15%', topOffset: '0%' }
    },
    'Economics': {
        filename: 'bocconi.svg',
        scale: 0.9,
        width: 350,
        height: 150,
        position: { right: '18%', topOffset: '5%' }
    },
    'Design': {
        filename: 'pentagram.svg',
        scale: 0.75,
        width: 250,
        height: 100,
        position: { right: '16%', topOffset: '-8%' }
    },
    'Urban': {
        filename: 'melb.svg',
        scale: 0.85,
        width: 350,
        height: 120,
        position: { right: '20%', topOffset: '4%' }
    },
    'Music': {
        filename: 'falais.svg',
        scale: 0.8,
        width: 400,
        height: 120,
        position: { right: '14%', topOffset: '-6%' }
    },
    'Easter': {
        filename: 'hehe.svg',
        scale: 0.7,
        width: 120,
        height: 80,
        position: { right: '17%', topOffset: '7%' }
    },
    'Archives': {
        filename: 'yap.svg',
        scale: 0.85,
        width: 380,
        height: 100,
        position: { right: '15%', topOffset: '-3%' }
    },
    'Research': {
        filename: 'business.svg',
        scale: 0.85,
        width: 350,
        height: 150,
        position: { right: '19%', topOffset: '2%' }
    }
};

// Set up bio segment event listeners
function setupBioSegments() {
    bioSegments.forEach(segment => {
        // Set initial transition
        segment.style.transition = 'color 0.3s ease';
        
        segment.addEventListener('mouseenter', function() {
            // Get the assigned color
            const color = this.getAttribute('data-color');
            
            // Highlight the text with simple color change
            this.style.color = color;
            
            // Show the overlay with the specific image
            const overlayType = this.getAttribute('data-overlay');
            const config = svgConfig[overlayType];
            
            // Clear previous content and create image element
            overlayContent.innerHTML = '';
            const img = document.createElement('img');
            img.src = config.filename;
            img.alt = overlayType;
            img.width = config.width * config.scale * svgScaleFactor;
            img.height = config.height * config.scale * svgScaleFactor;
            overlayContent.appendChild(img);
            
            // Apply varied positioning
            overlayContainer.style.right = config.position.right;
            overlayContainer.style.display = 'flex';
            
            // Position the overlay next to the text with variation
            const rect = this.getBoundingClientRect();
            const topOffsetPercent = config.position.topOffset;
            const topOffset = rect.height * (parseFloat(topOffsetPercent) / 100);
            overlayContainer.style.top = `${rect.top + topOffset}px`;
            
            // Fade in the overlay with animation
            setTimeout(() => {
                overlayContainer.style.opacity = '1';
            }, 10);
        });

        segment.addEventListener('mouseleave', function() {
            // Reset the text color
            this.style.color = 'rgba(0, 0, 0, 0.5)';
            
            // Fade out the overlay
            overlayContainer.style.opacity = '0';
            
            // After fade-out completes, hide the overlay
            setTimeout(() => {
                if (overlayContainer.style.opacity === '0') {
                    overlayContainer.style.display = 'none';
                    overlayContent.innerHTML = '';
                }
            }, 300);
        });
    });
}

// Footer links hover effect
function setupFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-link');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Handle link actions here (for future implementation)
            console.log('Clicked on', this.textContent);
        });
    });
}

// Project Filtering
function setupProjectFiltering() {
    const tags = document.querySelectorAll('.tag');
    const projects = document.querySelectorAll('.project');
    const projectsContainer = document.querySelector('.projects-container');
    let originalOrder = [];
    let activeFilter = null;

    // Store the original order of projects
    projects.forEach(project => {
        originalOrder.push(project);
    });

    tags.forEach(tag => {
        tag.addEventListener('click', function() {
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
                if (project.classList.contains('circle') && filter === 'research') {
                    matchingProjectsCircle.push(project);
                } else if (project.classList.contains('square') && filter === 'entrepreneurship') {
                    matchingProjectsSquare.push(project);
                } else if (project.classList.contains('octagon') && filter === 'design') {
                    matchingProjectsOctagon.push(project);
                } else {
                    // This is a matching project but not of the primary shape for this filter
                    if (filter === 'research' && !project.classList.contains('circle')) {
                        matchingProjectsOctagon.push(project);
                    } else if (filter === 'entrepreneurship' && !project.classList.contains('square')) {
                        matchingProjectsCircle.push(project);
                    } else if (filter === 'design' && !project.classList.contains('octagon')) {
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
        if (filter === 'research') {
            matchingProjectsCircle.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsSquare.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsOctagon.forEach(project => projectsContainer.appendChild(project));
        } else if (filter === 'entrepreneurship') {
            matchingProjectsSquare.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsCircle.forEach(project => projectsContainer.appendChild(project));
            matchingProjectsOctagon.forEach(project => projectsContainer.appendChild(project));
        } else if (filter === 'design') {
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

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupBioSegments();
    setupFooterLinks();
    setupProjectFiltering();
});