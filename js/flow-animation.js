// Flow animation configuration
const flowConfig = {
    colors: ['#BF42D8', '#F2C41C', '#3D88E8'], // Purple, Yellow, Blue
    strokeWidth: 6, // Reduced thickness
    lineCount: 20, // Fewer lines on screen
    baseSpeed: 240, // Base speed (pixels per second)
    
    // Line personalities - each line will take one of these movement styles
    personalities: [
        {
            name: "gentle", // Gentle flowing with minimal vertical change
            frequency: 0.5,  // Lower frequency = fewer curves
            minAmplitude: 20, 
            maxAmplitude: 70,
            speedFactor: 1.0,
            lengthFactor: 1.0,
            rarity: 0.3 // 30% of lines
        },
        {
            name: "wavy", // More pronounced waves
            frequency: 2.0, // Higher frequency = more curves
            minAmplitude: 40,
            maxAmplitude: 120,
            speedFactor: 0.9, // Slightly slower
            lengthFactor: 1.1, // Slightly longer
            rarity: 0.25 // 25% of lines
        },
        {
            name: "dramatic", // Big sweeping curves
            frequency: 0.7,
            minAmplitude: 80, // Much larger amplitude
            maxAmplitude: 180,
            speedFactor: 0.8, // Slower
            lengthFactor: 1.3, // Longer
            rarity: 0.2 // 20% of lines
        },
        {
            name: "swift", // Quick with subtle curves
            frequency: 1.1,
            minAmplitude: 65, // Higher minimum amplitude
            maxAmplitude: 110,
            speedFactor: 1.4, // Faster
            lengthFactor: 0.9, // Shorter
            rarity: 0.25 // 25% of lines
        }
    ],
    
    // General parameters
    minLength: 250, // Shorter minimum line length
    maxLength: 700, // Reduced maximum line length
    minSpeed: 140,  // Minimum speed
    maxSpeed: 340,  // Maximum speed
    
    // Amplitude constraints (to limit maximum amplitude in certain conditions)
    amplitudeConstraints: {
        maxUpperBound: 140,  // Absolute maximum amplitude allowed
        speedLimit: 200,     // Speeds above this value get reduced amplitude
        speedFactor: 0.85,   // How much speed affects amplitude reduction
        shortLineLimit: 400, // Lines shorter than this get reduced amplitude
        shortLineFactor: 0.8 // Amplitude reduction for short lines
    },
    
    // Loop formation (rare)
    loopFormation: {
        enabled: true,
        probability: 0.06,   // 6% chance for a line to have a loop capability
        minTimeBetween: 12,  // Minimum seconds between loops on same line
        maxTimeBetween: 30,  // Maximum seconds between loops on same line
        loopSize: 0.6,       // Base size of loops relative to line amplitude
        loopVariation: 0.3,  // Variation in loop size (± this percentage)
        smoothness: 0.92     // How smooth the loop transition is (0-1)
    },
    
    // Speed variation (for occasional sprinting/slowing)
    speedVariation: {
        enabled: true,
        frequency: 0.3,    // How often speed changes occur (higher = more often)
        intensity: 0.25,   // How dramatic the speed changes are (0-1)
        minDuration: 0.8,  // Minimum duration of speed change in seconds
        maxDuration: 2.0   // Maximum duration of speed change in seconds
    },
    
    // Additional smoothing parameters
    smoothingParameters: {
        pathTension: 0.88,        // Higher values create smoother paths (0-1)
        curveBlending: 0.92,      // How smoothly curves blend together
        tangentSmoothing: 0.85,   // Smooth tangent vectors for Bezier curves
        endpointContinuity: true  // Ensure smooth connections between segments
    },
    // Smoothness controls
    controlPointSpan: 0.4, // Control point distance factor
    pathSmoothing: 0.92,   // Path smoothing factor
    verticalVariation: 0.6  // How much vertical position varies
};

// Get the SVG element for flow animation - targeting specifically the one in thoughts section
const flowCanvas = document.getElementById('flow-canvas');
let flowWidth, flowHeight;

// Initialize flow dimensions based on the thoughts section size
function updateFlowDimensions() {
    const thoughtsSection = document.querySelector('.thoughts-section');
    flowWidth = thoughtsSection.offsetWidth;
    flowHeight = thoughtsSection.offsetHeight;
}

// Call initially and on resize
updateFlowDimensions();
window.addEventListener('resize', updateFlowDimensions);

// FlowLine class - each line will be a flowing entity with distinct personality
class FlowLine {
    constructor() {
        this.initialize();
    }

    // Select a personality based on rarity weights
    selectPersonality() {
        const totalWeight = flowConfig.personalities.reduce((sum, p) => sum + p.rarity, 0);
        let randomValue = Math.random() * totalWeight;
        
        for (const personality of flowConfig.personalities) {
            if (randomValue < personality.rarity) {
                return personality;
            }
            randomValue -= personality.rarity;
        }
        
        // Fallback
        return flowConfig.personalities[0];
    }

    initialize() {
        // Select a movement personality
        this.personality = this.selectPersonality();
        
        // Random color from our palette
        this.color = flowConfig.colors[Math.floor(Math.random() * flowConfig.colors.length)];
        
        // Line length based on personality with bias toward shorter lines
        const lengthRandom = Math.pow(Math.random(), 1.5); // Bias toward shorter values
        this.lineLength = (flowConfig.minLength + lengthRandom * (flowConfig.maxLength - flowConfig.minLength)) * 
                        this.personality.lengthFactor;
        
        // Speed based on personality
        this.speed = (flowConfig.minSpeed + Math.random() * (flowConfig.maxSpeed - flowConfig.minSpeed)) * 
                    this.personality.speedFactor;
        this.baseSpeed = this.speed; // Store the base speed for variations
        
        // Speed variation state
        this.speedVariationState = {
            active: false,
            factor: 1.0,
            timeLeft: 0,
            nextChangeTime: this.getRandomSpeedChangeTime()
        };
        
        // Amplitude based on personality
        let baseAmplitude = this.personality.minAmplitude + 
                        Math.random() * (this.personality.maxAmplitude - this.personality.minAmplitude);
        
        // Apply amplitude constraints
        if (this.speed > flowConfig.amplitudeConstraints.speedLimit) {
            // Fast-moving lines get reduced amplitude
            const reductionFactor = 1 - (this.speed - flowConfig.amplitudeConstraints.speedLimit) / 
                                (flowConfig.maxSpeed - flowConfig.amplitudeConstraints.speedLimit) * 
                                (1 - flowConfig.amplitudeConstraints.speedFactor);
            baseAmplitude *= reductionFactor;
        }
        
        if (this.lineLength < flowConfig.amplitudeConstraints.shortLineLimit) {
            // Short lines get reduced amplitude
            const reductionFactor = flowConfig.amplitudeConstraints.shortLineFactor + 
                                (1 - flowConfig.amplitudeConstraints.shortLineFactor) * 
                                (this.lineLength / flowConfig.amplitudeConstraints.shortLineLimit);
            baseAmplitude *= reductionFactor;
        }
        
        // Ensure amplitude never exceeds the maximum allowed
        this.amplitude = Math.min(baseAmplitude, flowConfig.amplitudeConstraints.maxUpperBound);
        
        // Determine if this line can form loops (rare)
        this.canFormLoops = flowConfig.loopFormation.enabled && Math.random() < flowConfig.loopFormation.probability;
        
        // Loop state if this line can form loops
        if (this.canFormLoops) {
            this.loopState = {
                active: false,
                position: 0,  // 0-1 position along the line's length
                timeLeft: 0,
                nextLoopTime: flowConfig.loopFormation.minTimeBetween + 
                            Math.random() * (flowConfig.loopFormation.maxTimeBetween - 
                                            flowConfig.loopFormation.minTimeBetween),
                size: flowConfig.loopFormation.loopSize * (1 - flowConfig.loopFormation.loopVariation + 
                    Math.random() * flowConfig.loopFormation.loopVariation * 2) * this.amplitude,
                direction: Math.random() > 0.5 ? 1 : -1 // Clockwise or counter-clockwise
            };
        }
        
        // Frequency based on personality (with slight randomization)
        this.frequency = this.personality.frequency * (0.8 + Math.random() * 0.4);
        
        // Random vertical position with more variation
        this.centerY = flowHeight * (0.2 + Math.random() * flowConfig.verticalVariation);
        
        // Random phase
        this.phase = Math.random() * Math.PI * 2;
        
        // Generate guide points specific to this line's personality
        this.generateGuidePoints();
        
        // Position tracking
        this.x = -this.lineLength; // Start off-screen to the left
        this.progress = 0;
        
        // Create SVG path element
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.element.classList.add('path');
        this.element.setAttribute('stroke', this.color);
        this.element.setAttribute('stroke-width', flowConfig.strokeWidth);
        
        // Add to SVG
        flowCanvas.appendChild(this.element);
    }

    // Generate guide points based on the line's personality
    generateGuidePoints() {
        this.guidePoints = [];
        
        // Number of points varies by personality
        let numPoints;
        if (this.personality.name === "gentle") {
            numPoints = 3 + Math.floor(Math.random() * 2); // 3-4 points
        } else if (this.personality.name === "dramatic") {
            numPoints = 4 + Math.floor(Math.random() * 3); // 4-6 points (more dramatic changes)
        } else {
            numPoints = 4 + Math.floor(Math.random() * 2); // 4-5 points (default)
        }
        
        // Starting point
        this.guidePoints.push({
            x: 0,
            y: 0
        });
        
        // Generate distinct pattern based on personality
        if (this.personality.name === "dramatic") {
            // Big sweeping curves - more extreme y positions
            for (let i = 1; i < numPoints - 1; i++) {
                const normalizedX = i / (numPoints - 1);
                // Alternating up and down with large movements
                const direction = i % 2 === 0 ? 1 : -1;
                const yOffset = direction * (0.7 + Math.random() * 0.3) * this.amplitude;
                
                this.guidePoints.push({
                    x: normalizedX,
                    y: yOffset
                });
            }
        } else if (this.personality.name === "wavy") {
            // More frequent waves
            for (let i = 1; i < numPoints - 1; i++) {
                const normalizedX = i / (numPoints - 1);
                // Sine-based waves with higher frequency
                const yOffset = Math.sin(normalizedX * Math.PI * 2 + this.phase) * this.amplitude * 0.8;
                
                this.guidePoints.push({
                    x: normalizedX,
                    y: yOffset
                });
            }
        } else if (this.personality.name === "swift") {
            // Quicker with smaller movements
            for (let i = 1; i < numPoints - 1; i++) {
                const normalizedX = i / (numPoints - 1);
                // Slight movements with some randomness
                const yOffset = (Math.sin(normalizedX * Math.PI * 1.5 + this.phase) * 0.7 + 
                                (Math.random() * 0.6 - 0.3)) * this.amplitude;
                
                this.guidePoints.push({
                    x: normalizedX,
                    y: yOffset
                });
            }
        } else {
            // Gentle default pattern
            for (let i = 1; i < numPoints - 1; i++) {
                const normalizedX = i / (numPoints - 1);
                // Smoother, more subtle curves
                const yOffset = Math.sin(normalizedX * Math.PI + this.phase) * this.amplitude * 0.6;
                
                this.guidePoints.push({
                    x: normalizedX,
                    y: yOffset
                });
            }
        }
        
        // End point - with some variance
        this.guidePoints.push({
            x: 1,
            y: (Math.random() * 2 - 1) * this.amplitude * 0.4
        });
        
        // Add subtle variations to keep things natural
        // Only do this for personalities that should have extra variation
        if (this.personality.name === "wavy" || this.personality.name === "dramatic") {
            for (let i = 1; i < this.guidePoints.length - 1; i++) {
                // Add subtle adjustment to prevent perfect regularity
                this.guidePoints[i].y += (Math.random() * 2 - 1) * this.amplitude * 0.15;
            }
        }
    }

    update(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // Update speed variation if enabled
        if (flowConfig.speedVariation.enabled) {
            this.updateSpeedVariation(deltaTime);
        }
        
        // Update loop formation if this line can form loops
        if (this.canFormLoops) {
            this.updateLoopFormation(deltaSeconds);
        }
        
        // Move based on current speed (which may include variation)
        this.progress += (this.speed * deltaTime) / 1000;
        this.x = this.progress - this.lineLength;
        
        // Reset when it moves off-screen
        if (this.x > flowWidth) {
            flowCanvas.removeChild(this.element);
            this.initialize();
            return;
        }
        
        // Draw the flowing line
        this.drawFlowingLine();
    }
    
    // Update loop formation state
    updateLoopFormation(deltaSeconds) {
        if (this.loopState.active) {
            // Currently in a loop, update time left
            this.loopState.timeLeft -= deltaSeconds;
            
            // End loop if time is up
            if (this.loopState.timeLeft <= 0) {
                this.loopState.active = false;
                this.loopState.nextLoopTime = flowConfig.loopFormation.minTimeBetween + 
                                            Math.random() * (flowConfig.loopFormation.maxTimeBetween - 
                                                            flowConfig.loopFormation.minTimeBetween);
            }
        } else {
            // Not in a loop, check if it's time to start one
            this.loopState.nextLoopTime -= deltaSeconds;
            
            if (this.loopState.nextLoopTime <= 0 && this.x > 0 && this.x < flowWidth - this.lineLength) {
                // Start a new loop at a random position along the line
                // But make sure the line is fully visible on screen
                this.loopState.active = true;
                this.loopState.position = 0.3 + Math.random() * 0.4; // Position 30-70% along visible line
                this.loopState.timeLeft = 1.2 + Math.random() * 0.8; // Loop lasts 1.2-2.0 seconds
                this.loopState.direction = Math.random() > 0.5 ? 1 : -1; // Random direction
            }
        }
    }
    
    // Get random time for next speed change
    getRandomSpeedChangeTime() {
        return 1.5 + Math.random() * 5; // 1.5 to 6.5 seconds
    }
    
    // Update speed variation - occasionally speed up or slow down
    updateSpeedVariation(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // Check if we need to start/end a speed variation
        if (this.speedVariationState.active) {
            // Currently in a speed change, update time left
            this.speedVariationState.timeLeft -= deltaSeconds;
            
            // End speed change if time is up
            if (this.speedVariationState.timeLeft <= 0) {
                this.speedVariationState.active = false;
                this.speedVariationState.nextChangeTime = this.getRandomSpeedChangeTime();
                this.speed = this.baseSpeed; // Reset to base speed
            }
        } else {
            // Not in a speed change, check if it's time to start one
            this.speedVariationState.nextChangeTime -= deltaSeconds;
            
            if (this.speedVariationState.nextChangeTime <= 0) {
                // Start a new speed variation
                const intensity = flowConfig.speedVariation.intensity;
                
                // Determine if speeding up or slowing down (2/3 chance to speed up)
                const isSpeedup = Math.random() < 0.6;
                
                // Calculate speed factor: speedup = 1+intensity, slowdown = 1-intensity*0.8
                const speedFactor = isSpeedup ? 
                                (1 + intensity * (0.8 + Math.random() * 0.4)) : 
                                (1 - intensity * (0.5 + Math.random() * 0.3));
                
                // Apply the speed change
                this.speedVariationState.active = true;
                this.speedVariationState.factor = speedFactor;
                this.speed = this.baseSpeed * speedFactor;
                
                // Set duration of this speed change
                this.speedVariationState.timeLeft = flowConfig.speedVariation.minDuration + 
                                                    Math.random() * (flowConfig.speedVariation.maxDuration - 
                                                                    flowConfig.speedVariation.minDuration);
            }
        }
    }

    // Get a y-position that smoothly follows our guide points
    getYForX(normalizedX) {
        // Find the guide point segment we're in
        let beforePoint = this.guidePoints[0];
        let afterPoint = this.guidePoints[this.guidePoints.length - 1];
        
        for (let i = 0; i < this.guidePoints.length - 1; i++) {
            if (normalizedX >= this.guidePoints[i].x && normalizedX <= this.guidePoints[i + 1].x) {
                beforePoint = this.guidePoints[i];
                afterPoint = this.guidePoints[i + 1];
                break;
            }
        }
        
        // Calculate how far we are between these two guide points (0-1)
        const segmentLength = afterPoint.x - beforePoint.x;
        if (segmentLength === 0) return this.centerY + beforePoint.y;
        
        const segmentProgress = (normalizedX - beforePoint.x) / segmentLength;
        
        // Use a smooth easing function for interpolation
        const t = this.smoothStep(segmentProgress);
        
        // Interpolate between the two guide points
        const yPosition = beforePoint.y + (afterPoint.y - beforePoint.y) * t;
        
        // Add a very subtle drift to prevent mechanical look
        // This varies by personality
        let driftFactor = 0.05; // Default subtle drift
        
        if (this.personality.name === "wavy") {
            driftFactor = 0.12; // More pronounced for wavy
        } else if (this.personality.name === "dramatic") {
            driftFactor = 0.15; // Most pronounced for dramatic
        } else if (this.personality.name === "swift") {
            driftFactor = 0.08; // Moderate for swift
        }
        
        const drift = Math.sin(normalizedX * Math.PI * this.frequency * 2 + this.phase) * 
                    this.amplitude * driftFactor;
        
        let finalY = this.centerY + yPosition + drift;
        
        // Add loop if active
        if (this.canFormLoops && this.loopState.active) {
            // Define the loop region
            const loopCenter = this.loopState.position;
            const loopWidth = 0.15; // Width of the loop region along the line
            
            // Distance from the loop center (0-1)
            const distFromCenter = Math.abs(normalizedX - loopCenter);
            
            if (distFromCenter < loopWidth) {
                // Inside the loop region
                // Calculate loop effect using a smooth bell curve
                const loopProgress = 1 - distFromCenter / loopWidth;
                const loopStrength = Math.pow(loopProgress, 2) * (3 - 2 * loopProgress); // Smooth bell curve
                
                // Create a circular/elliptical displacement
                const loopPhase = (normalizedX - (loopCenter - loopWidth)) / (loopWidth * 2) * Math.PI * 2;
                const loopY = Math.sin(loopPhase) * this.loopState.size * this.loopState.direction;
                
                // Apply loop displacement with smooth transition
                finalY += loopY * loopStrength;
            }
        }
        
        return finalY;
    }
    
    // Smooth interpolation function - enhanced for ultra-smooth transitions
    smoothStep(t) {
        // Septic (7th degree) smoothstep for super-smooth transitions
        // This creates smoother acceleration/deceleration at endpoints
        return t * t * t * t * (t * (t * (t * -20 + 70) - 84) + 35);
    }

    drawFlowingLine() {
        // Generate more points for ultra-smooth curves
        const numPoints = 75; // Increased from 50 for smoother curves
        const points = [];
        
        // Calculate all the points
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            let lineX = this.x + t * this.lineLength;
            
            // Map to normalized position (0-1) across the entire animation space
            const normalizedX = (lineX + this.lineLength) / (flowWidth + this.lineLength * 2);
            
            // Handle X-displacement for loops
            if (this.canFormLoops && this.loopState.active) {
                // Define the loop region
                const loopCenter = this.loopState.position;
                const loopWidth = 0.15; // Width of the loop region
                
                // Distance from the loop center (0-1)
                const distFromCenter = Math.abs(normalizedX - loopCenter);
                
                if (distFromCenter < loopWidth) {
                    // Inside the loop region
                    // Calculate loop effect using a smooth bell curve
                    const loopProgress = 1 - distFromCenter / loopWidth;
                    const loopStrength = Math.pow(loopProgress, 2) * (3 - 2 * loopProgress); // Smooth bell curve
                    
                    // Create a circular x-displacement
                    const loopPhase = (normalizedX - (loopCenter - loopWidth)) / (loopWidth * 2) * Math.PI * 2;
                    const loopX = (Math.cos(loopPhase) - 1) * this.loopState.size * 0.5; // X-displacement for loop
                    
                    // Apply loop displacement with smooth transition
                    lineX += loopX * loopStrength;
                }
            }
            
            // Get y-position with personality-based variation and possible loop
            const lineY = this.getYForX(normalizedX);
            
            points.push({ x: lineX, y: lineY });
        }
        
        // Build a smooth SVG path using natural spline technique
        let pathData = `M${points[0].x},${points[0].y}`;
        
        // Use a more sophisticated curve calculation for maximum smoothness
        // Process points in smaller groups for smoother overall curve
        for (let i = 1; i < points.length - 2; i += 2) {
            // Get a window of points for this curve segment
            const p0 = i > 1 ? points[i - 2] : points[i - 1];
            const p1 = points[i - 1];
            const p2 = points[i];
            const p3 = points[i + 1]; 
            const p4 = i + 2 < points.length ? points[i + 2] : points[i + 1];
            
            // Generate optimized control points using a 5-point window
            const cp1 = this.getEnhancedControlPoint(p0, p1, p2, p3, p4, false);
            const cp2 = this.getEnhancedControlPoint(p0, p1, p2, p3, p4, true);
            
            // Add cubic Bezier curve with enhanced control points
            pathData += ` C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
        }
        
        // Handle remaining points with simple but smooth curves
        for (let i = Math.floor((points.length - 2) / 2) * 2; i < points.length - 1; i++) {
            const p0 = points[i - 1 >= 0 ? i - 1 : i];
            const p1 = points[i];
            const p2 = points[i + 1];
            
            // Simple but effective control points for the final segments
            const cp1 = {
                x: p1.x * 0.75 + p2.x * 0.25,
                y: p1.y * 0.75 + p2.y * 0.25
            };
            const cp2 = {
                x: p1.x * 0.25 + p2.x * 0.75,
                y: p1.y * 0.25 + p2.y * 0.75
            };
            
            pathData += ` C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
        }
        
        // Update the path
        this.element.setAttribute('d', pathData);
    }

    // Enhanced control point calculation for smoother curves
    getEnhancedControlPoint(p0, p1, p2, p3, p4, isSecond) {
        // Calculate tangent vectors using 5-point window
        // This creates smoother transitions between curve segments
        let tx, ty;
        
        if (isSecond) {
            // Second control point - use points p1, p2, p3, p4
            tx = (p3.x - p1.x) * 0.5 + (p4.x - p2.x) * 0.1;
            ty = (p3.y - p1.y) * 0.5 + (p4.y - p2.y) * 0.1;
        } else {
            // First control point - use points p0, p1, p2, p3
            tx = (p2.x - p0.x) * 0.1 + (p3.x - p1.x) * 0.5;
            ty = (p2.y - p0.y) * 0.1 + (p3.y - p1.y) * 0.5;
        }
        
        // Scale tangent vector based on distance
        const distance = Math.sqrt(tx * tx + ty * ty);
        if (distance > 0) {
            // Normalize and scale
            const scale = flowConfig.controlPointSpan * (isSecond ? 
                        (p3.x - p2.x) : (p2.x - p1.x)) * 0.5;
            tx = tx / distance * scale;
            ty = ty / distance * scale;
        }
        
        // Create control point
        const controlPoint = {
            x: (isSecond ? p2.x : p1.x) + (isSecond ? -tx : tx),
            y: (isSecond ? p2.y : p1.y) + (isSecond ? -ty : ty)
        };
        
        // Apply personality-specific smoothing
        let smoothingFactor = 0.85;
        if (this.personality.name === "dramatic") {
            smoothingFactor = 0.9; // More smoothing for dramatic curves
        } else if (this.personality.name === "swift") {
            smoothingFactor = 0.92; // Extra smoothing for swift
        }
        
        // Smooth the control point position
        if (isSecond) {
            controlPoint.x = p2.x - (p2.x - controlPoint.x) * smoothingFactor;
            controlPoint.y = p2.y - (p2.y - controlPoint.y) * smoothingFactor;
        } else {
            controlPoint.x = p1.x + (controlPoint.x - p1.x) * smoothingFactor;
            controlPoint.y = p1.y + (controlPoint.y - p1.y) * smoothingFactor;
        }
        
        return controlPoint;
    }
}

// Initialize the flow animation
function initFlowAnimation() {
    // Initialize the flow section if visible
    const thoughtsSection = document.querySelector('.thoughts-section');
    if (!thoughtsSection) return;

    // Check if we're already initialized
    if (flowCanvas.getAttribute('data-initialized') === 'true') return;
    flowCanvas.setAttribute('data-initialized', 'true');

    // Create initial set of lines with staggered positions
    const flowLines = [];
    for (let i = 0; i < flowConfig.lineCount; i++) {
        const line = new FlowLine();
        // Distribute lines across the screen initially
        const startOffset = (flowWidth + line.lineLength) * (i / flowConfig.lineCount);
        line.progress = startOffset;
        line.x = line.progress - line.lineLength;
        line.drawFlowingLine();
        flowLines.push(line);
    }

    // Animation loop
    let lastTime = 0;
    function animate(timestamp) {
        const deltaTime = timestamp - lastTime || 0;
        lastTime = timestamp;
        
        // Update each line
        for (let line of flowLines) {
            line.update(deltaTime);
        }
        
        // Continue animation
        requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);
}

// Initialize the animation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFlowAnimation();
});