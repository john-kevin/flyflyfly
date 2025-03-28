const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const welcomeScreen = document.getElementById('welcomeScreen');
const startButton = document.getElementById('startButton');
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');
const dialogBox = document.getElementById('dialogBox');
const infoButton = document.getElementById('infoButton');
const powerUpModal = document.getElementById('powerUpModal');
const closeButton = document.querySelector('.close-button');
const collisionToggle = document.getElementById('collisionToggle'); // Get the checkbox element
const jokes = [
    "Bakit hindi pwedeng magtanim ng puno sa gitna ng kalsada? Kasi baka magka-traffic!",
    "Anong tawag sa isdang mahilig mag-party? TUNA-turn up!",
    "Bakit hindi nag-aaway ang mga keyboard? Kasi may SPACE sila!",
    "Anong sabi ng kalendaryo sa relo? 'I’m DATE-ing someone else!'"
];
let jokeIndex = 0;

canvas.width = 400;
canvas.height = 600;

starsCanvas.width = window.innerWidth;
starsCanvas.height = window.innerHeight;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

let bird = { 
    x: 50, 
    y: 300, 
    radius: 15, 
    velocity: 0, 
    gravity: isMobile ? 0.4 : 0.2, // Double gravity on mobile
    lift: -6 
}; 

let pipes = [];
let frame = 0;
let gameOver = false;
let score = 0; // Initialize score
let stars = [];
let powerUps = []; // Array to store power-ups
const powerUpTypes = [
    { type: 'gravityReduction', color: '#0000ff', effect: () => { bird.gravity /= 2; }, reset: () => { bird.gravity *= 2; }, duration: 5000 },
    { type: 'invincibility', color: '#ff00ff', effect: () => { invincible = true; }, reset: () => { invincible = false; }, duration: 5000 },
    { type: 'scoreMultiplier', color: '#ffff00', effect: () => { scoreMultiplier = 2; }, reset: () => { scoreMultiplier = 1; }, duration: 5000 },
];

let pipeSpeed = isMobile ? 2 : 1; // Faster on mobile, slower on desktop
let frameIncrement = isMobile ? 1.5 : 1; // Faster frame increment on mobile
let invincible = false; // Flag for invincibility
let activePowerUpName = ''; // Store the name of the active power-up
let powerUpDisplayTimeout; // Timeout for clearing the power-up name display
let powerUpRemainingTime = 0; // Store the remaining time for the active power-up
let powerUpTimerInterval; // Interval for updating the timer
let shakeTimeout; // Timeout for stopping the shake effect
let pipeCount = 0; // Counter to track the number of pipes generated
let pipesSinceLastPowerUp = 0; // Counter to track pipes traversed since the last power-up
let availablePowerUps = [...powerUpTypes]; // Copy of powerUpTypes to track available power-ups
let cannonballs = []; // Array to store cannonballs
let cannonballSpeed = 3; // Speed of cannonballs
let particles = []; // Array to store particles for the fire trail

function resetGame() {
    bird = { 
        x: 50, 
        y: 300, 
        radius: 15, 
        velocity: 0, 
        gravity: isMobile ? 0.4 : 0.2, 
        lift: -6 
    }; 
    pipes = [];
    frame = 0;
    score = 0;
    updateScore();
    gameOver = false;

    // Reset all power-up effects
    clearTimeout(powerUpDisplayTimeout); // Clear power-up display timeout
    clearInterval(powerUpTimerInterval); // Clear power-up timer interval
    activePowerUpName = ''; // Clear active power-up name
    powerUpRemainingTime = 0; // Reset remaining time
    invincible = false; // Reset invincibility
    pipeSpeed = isMobile ? 2 : 1; // Reset pipe speed
    bird.gravity = isMobile ? 0.4 : 0.2; // Reset gravity
    scoreMultiplier = 1; // Reset score multiplier
}

function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00'; // Yellow neon bird color
    ctx.shadowColor = '#ffff00'; // Yellow neon glow
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
    ctx.strokeStyle = '#b3b300'; // Yellow border
    ctx.stroke();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        let topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        let bottomGradient = ctx.createLinearGradient(pipe.x, canvas.height, pipe.x + pipe.width, canvas.height);
        let neonColor = '#00ffcc';
        let darkBase = '#1a1a1a';

        if (invincible) {
            neonColor = '#ff00ff'; // Change neon color for invincibility
        }

        topGradient.addColorStop(0, darkBase);
        topGradient.addColorStop(0.5, neonColor);
        topGradient.addColorStop(1, darkBase);
        ctx.fillStyle = topGradient;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

        // Add glowing stripes to the top pipe
        for (let i = 0; i < pipe.top; i += 20) {
            ctx.fillStyle = i % 40 === 0 ? neonColor : darkBase; // Alternating neon and dark stripes
            ctx.fillRect(pipe.x, i, pipe.width, 10);
        }

        // Bottom pipe
        bottomGradient.addColorStop(0, darkBase);
        bottomGradient.addColorStop(0.5, neonColor);
        bottomGradient.addColorStop(1, darkBase);
        ctx.fillStyle = bottomGradient;
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);

        // Add glowing stripes to the bottom pipe
        for (let i = canvas.height - pipe.bottom; i < canvas.height; i += 20) {
            ctx.fillStyle = i % 40 === 0 ? neonColor : darkBase; // Alternating neon and dark stripes
            ctx.fillRect(pipe.x, i, pipe.width, 10);
        }

        // Pipe borders with glowing effect
        ctx.shadowColor = neonColor; // Neon glow
        ctx.shadowBlur = 15;
        ctx.strokeStyle = neonColor; // Neon edge color
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
        ctx.shadowBlur = 0; // Reset shadow

        // Draw power-ups in the middle of the pipe gap
        powerUps.forEach(powerUp => {
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, 10, 0, Math.PI * 2); // Power-up size is 10
            ctx.fillStyle = powerUp.color; // Power-up color
            ctx.shadowColor = powerUp.color; // Glow matches the power-up color
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
            ctx.strokeStyle = '#ffffff'; // White border
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    });
}

function drawGround() {
    ctx.fillStyle = '#003333'; // Futuristic ground color
    ctx.shadowColor = '#00ffcc'; // Neon glow
    ctx.shadowBlur = 10;
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20); // Ground height
    ctx.shadowBlur = 0; // Reset shadow
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        gameOver = true;
    }
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function drawRestartScreen() {
    ctx.font = '30px Arial';
    ctx.fillStyle = '#00ffcc'; // Neon text color
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM FAILURE', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press Restart to Reboot', canvas.width / 2, canvas.height / 2 + 20);
    restartButton.style.display = 'block'; // Show the restart button
}

restartButton.addEventListener('click', () => {
    resetGame();
    restartButton.style.display = 'none'; // Hide the restart button
    gameLoop();
});

startButton.addEventListener('click', () => {
    welcomeScreen.style.display = 'none'; // Hide the welcome screen
    canvas.style.display = 'block'; // Show the game canvas
    scoreElement.style.display = 'block'; // Show the score
    resetGame(); // Reset game state
    gameLoop(); // Start the game loop
});

infoButton.addEventListener('click', () => {
    powerUpModal.style.display = 'flex'; // Show the modal
});

closeButton.addEventListener('click', () => {
    powerUpModal.style.display = 'none'; // Hide the modal
});

window.addEventListener('click', (event) => {
    if (event.target === powerUpModal) {
        powerUpModal.style.display = 'none'; // Hide the modal
    }
});

function applyShakeEffect() {
    const intensity = 5; // Shake intensity
    const duration = 100; // Shake duration in milliseconds

    let startTime = Date.now();
    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            const offsetX = (Math.random() * 2 - 1) * intensity;
            const offsetY = (Math.random() * 2 - 1) * intensity;
            canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            requestAnimationFrame(shake);
        } else {
            canvas.style.transform = ''; // Reset canvas position
        }
    }
    shake();
}

function updatePipes() {
    // Adjust difficulty based on score
    const baseGap = 180; // Initial vertical gap
    const minGap = 120; // Minimum vertical gap
    const gapReductionRate = 2; // Reduce gap by 2 pixels every 10 points
    const adjustedGap = Math.max(baseGap - Math.floor(score / 10) * gapReductionRate, minGap);

    const basePipeSpeed = isMobile ? 2 : 1; // Initial pipe speed
    const maxPipeSpeed = isMobile ? 4 : 3; // Maximum pipe speed
    const speedIncreaseRate = 0.1; // Increase speed by 0.1 every 10 points
    pipeSpeed = Math.min(basePipeSpeed + Math.floor(score / 10) * speedIncreaseRate, maxPipeSpeed);

    if (frame % (isMobile ? 180 : 240) === 0) { // Horizontal gap remains constant
        let minHeight = 70; // Minimum height for the top pipe
        let top = Math.random() * (canvas.height / 2 - minHeight) + minHeight; // Ensure top pipe is not too small
        pipes.push({ x: canvas.width, width: 50, top: top, bottom: canvas.height - top - adjustedGap, passed: false }); // Add a 'passed' flag

        pipeCount++; // Increment the pipe counter
        pipesSinceLastPowerUp++; // Increment the counter for pipes since the last power-up

        // Ensure the first power-up appears on the 5th pipe
        if (pipeCount === 5) {
            spawnSpecificPowerUp(top, adjustedGap, 'gravityReduction'); // Replace 'speedBoost' with another power-up if needed
        } 
        // Ensure a power-up appears if 10 pipes are traversed without one
        else if (pipesSinceLastPowerUp >= 10) {
            spawnPowerUp(top, adjustedGap);
        } 
        // Randomly spawn power-ups after the 5th pipe
        else if (pipeCount > 5 && !activePowerUpName && Math.random() < 0.1) { // 10% chance for subsequent power-ups
            spawnPowerUp(top, adjustedGap);
        }
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed; // Adjust pipe movement speed based on device

        // Increment score only when the bird passes the pipe
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true; // Mark the pipe as passed
            score += scoreMultiplier; // Increment score based on multiplier
            updateScore(); // Update score UI
        }

        // Check for collisions with the bird
        if (
            collisionToggle.checked && // Only check collision if the toggle is enabled
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipe.width &&
            (bird.y - bird.radius < pipe.top || bird.y + bird.radius > canvas.height - pipe.bottom)
        ) {
            if (!invincible) { // If the bird does not have invincibility, apply shake and game over
                applyShakeEffect(); // Apply the shake effect
                gameOver = true;
            }
        }
    });

    powerUps.forEach(powerUp => {
        powerUp.x -= pipeSpeed; // Move power-ups with the pipes
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
    powerUps = powerUps.filter(powerUp => powerUp.x + powerUp.radius > 0); // Remove power-ups that go off-screen
}

function spawnPowerUp(top, gap) {
    if (availablePowerUps.length === 0) {
        availablePowerUps = [...powerUpTypes]; // Reset available power-ups if all have been spawned
    }

    const randomIndex = Math.floor(Math.random() * availablePowerUps.length);
    const randomPowerUp = availablePowerUps.splice(randomIndex, 1)[0]; // Get and remove a power-up from the available list

    powerUps.push({
        x: canvas.width + 25, // Center of the pipe
        y: top + gap / 2, // Center of the gap
        radius: 10, // Power-up size
        color: randomPowerUp.color,
        type: randomPowerUp.type,
        effect: randomPowerUp.effect,
        reset: randomPowerUp.reset,
        duration: randomPowerUp.duration,
    });
    pipesSinceLastPowerUp = 0; // Reset the counter after spawning a power-up
}

function spawnSpecificPowerUp(top, gap, powerUpType) {
    const specificPowerUp = powerUpTypes.find(p => p.type === powerUpType);
    if (specificPowerUp) {
        powerUps.push({
            x: canvas.width + 25, // Center of the pipe
            y: top + gap / 2, // Center of the gap
            radius: 10, // Power-up size
            color: specificPowerUp.color,
            type: specificPowerUp.type,
            effect: specificPowerUp.effect,
            reset: specificPowerUp.reset,
            duration: specificPowerUp.duration,
        });
        pipesSinceLastPowerUp = 0; // Reset the counter after spawning a power-up
    }
}

function checkPowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        const dist = Math.sqrt((bird.x - powerUp.x) ** 2 + (bird.y - powerUp.y) ** 2);
        if (dist < bird.radius + powerUp.radius) {
            powerUps.splice(index, 1);
            activePowerUpName = powerUp.type;
            powerUpRemainingTime = powerUp.duration / 1000;

            clearTimeout(powerUpDisplayTimeout);
            clearInterval(powerUpTimerInterval);

            const startTime = Date.now();
            powerUpTimerInterval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                powerUpRemainingTime = Math.max((powerUp.duration / 1000) - elapsed, 0);
                if (powerUpRemainingTime <= 0) {
                    clearInterval(powerUpTimerInterval);
                    activePowerUpName = '';
                    resetVisualEffect(powerUp.type); // Reset visual effect when time runs out
                }
            }, 16);

            applyVisualEffect(powerUp.type); // Apply visual effect based on power-up type
            powerUp.effect();
            setTimeout(() => {
                powerUp.reset();
            }, powerUp.duration);
        }
    });
}

function applyVisualEffect(powerUpType) {
    switch (powerUpType) {
        case 'speedBoost':
            // No visual effect, the speed boost is handled in the effect function
            break;
        case 'gravityReduction':
            canvas.style.filter = 'blur(5px)';
            break;
        case 'invincibility':
            bird.shadowColor = '#ff00ff';
            bird.shadowBlur = 20;
            break;
        case 'scoreMultiplier':
            scoreElement.style.color = '#ffff00';
            scoreElement.style.fontSize = '28px';
            break;
    }
}

function resetVisualEffect(powerUpType) {
    switch (powerUpType) {
        case 'speedBoost':
            // No visual effect to reset
            break;
        case 'gravityReduction':
            canvas.style.filter = 'none';
            break;
        case 'invincibility':
            bird.shadowColor = '#ffff00';
            bird.shadowBlur = 15;
            break;
        case 'scoreMultiplier':
            scoreElement.style.color = '#00ffcc';
            scoreElement.style.fontSize = '24px';
            break;
    }
}

function drawPowerUpName() {
    if (activePowerUpName) {
        // Draw background overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
        ctx.fillRect(canvas.width / 2 - 120, 30, 240, 50); // Background dimensions

        // Draw power-up name text
        ctx.font = '20px Arial';
        ctx.fillStyle = '#00ffcc'; // Neon text color
        ctx.textAlign = 'center';
        ctx.fillText(`Power-Up: ${activePowerUpName}`, canvas.width / 2, 55); // Display at the top center

        // Draw diminishing line for timer
        const totalDuration = powerUpTypes.find(p => p.type === activePowerUpName)?.duration / 1000; // Total duration in seconds
        const elapsedTime = totalDuration - powerUpRemainingTime; // Elapsed time
        const timerWidth = ((totalDuration - elapsedTime) / totalDuration) * 200; // Calculate line width
        ctx.fillStyle = '#00ffcc'; // Neon line color
        ctx.fillRect(canvas.width / 2 - 100, 70, Math.max(timerWidth, 0), 5); // Draw the line
    }
}

function spawnCannonball() {
    cannonballs.push({
        x: canvas.width, // Start at the right edge of the canvas
        y: Math.random() * (canvas.height - 50) + 25, // Random vertical position
        radius: 10, // Size of the cannonball
    });
}

function updateCannonballs() {
    cannonballs.forEach(cannonball => {
        cannonball.x -= cannonballSpeed; // Move cannonballs to the left
    });

    // Remove cannonballs that go off-screen
    cannonballs = cannonballs.filter(cannonball => cannonball.x + cannonball.radius > 0);
}

function spawnParticles(cannonball) {
    for (let i = 0; i < 5; i++) { // Generate multiple particles per frame
        particles.push({
            x: cannonball.x,
            y: cannonball.y,
            size: Math.random() * 3 + 1, // Random size for particles
            speedX: (Math.random() - 0.5) * 2, // Random horizontal speed
            speedY: (Math.random() - 0.5) * 2, // Random vertical speed
            life: Math.random() * 30 + 20, // Random lifespan
            color: `rgba(255, ${Math.floor(Math.random() * 150 + 100)}, 0, 1)` // Random orange/yellow color
        });
    }
}

function updateParticles() {
    particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 1; // Decrease lifespan
    });

    // Remove particles that have expired
    particles = particles.filter(particle => particle.life > 0);
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
    });
}

function drawCannonballs() {
    cannonballs.forEach(cannonball => {
        // Spawn particles for the fire trail
        spawnParticles(cannonball);

        // Draw the flame effect
        const gradient = ctx.createRadialGradient(
            cannonball.x, cannonball.y, 0,
            cannonball.x, cannonball.y, cannonball.radius * 2
        );
        gradient.addColorStop(0, 'rgba(255, 69, 0, 1)'); // Bright orange
        gradient.addColorStop(0.5, 'rgba(255, 140, 0, 0.8)'); // Lighter orange
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // Transparent yellow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cannonball.x, cannonball.y, cannonball.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw the cannonball
        ctx.beginPath();
        ctx.arc(cannonball.x, cannonball.y, cannonball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#333333'; // Dark gray for the cannonball
        ctx.shadowColor = '#ff4500'; // Glow effect for the cannonball
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
    });
}

function checkCannonballCollision() {
    if (!collisionToggle.checked) return; // Skip collision check if the toggle is disabled

    cannonballs.forEach(cannonball => {
        const dist = Math.sqrt((bird.x - cannonball.x) ** 2 + (bird.y - cannonball.y) ** 2);
        if (dist < bird.radius + cannonball.radius) {
            if (!invincible) {
                applyShakeEffect(); // Apply shake effect on collision
                gameOver = true; // End the game
            }
        }
    });
}

function gameLoop() {
    if (gameOver) {
        // Reset power-up effects, timer, and display when the game is over
        clearTimeout(powerUpDisplayTimeout);
        clearInterval(powerUpTimerInterval);
        activePowerUpName = '';
        powerUpRemainingTime = 0;

        drawRestartScreen();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    drawGround(); // Draw ground
    drawPowerUpName(); // Draw the active power-up name

    if (score >= 10) {
        if (frame % 120 === 0) spawnCannonball(); // Spawn a cannonball every 120 frames
        updateCannonballs();
        drawCannonballs();
        updateParticles();
        drawParticles(); // Draw the fire trail particles
        checkCannonballCollision();
    }

    updateBird();
    updatePipes();
    checkPowerUpCollision(); // Check for collisions with power-ups

    frame += frameIncrement; // Adjust frame increment based on device
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        bird.velocity = bird.lift;
    } else if (e.key.toLowerCase() === 'r' && gameOver) {
        resetGame();
        restartButton.style.display = 'none'; // Hide the restart button
        gameLoop();
    }
});

canvas.addEventListener('touchstart', () => {
    bird.velocity = bird.lift; // Allow tap to make the bird jump
});

function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            size: Math.random() * 2,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
        });
    }
}

function drawStars() {
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    stars.forEach(star => {
        starsCtx.beginPath();
        starsCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        starsCtx.fillStyle = '#00ffcc'; // Neon star color
        starsCtx.shadowBlur = 10;
        starsCtx.shadowColor = '#00ffcc';
        starsCtx.fill();
    });
}

function updateStars() {
    stars.forEach(star => {
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0 || star.x > starsCanvas.width || star.y < 0 || star.y > starsCanvas.height) {
            star.x = Math.random() * starsCanvas.width;
            star.y = Math.random() * starsCanvas.height;
            star.size = Math.random() * 2;
            star.speedX = Math.random() * 2 - 1;
            star.speedY = Math.random() * 2 - 1;
        }
    });
}

function animateStars() {
    drawStars();
    updateStars();
    requestAnimationFrame(animateStars);
}

createStars();
animateStars();

function cycleJokes() {
    dialogBox.textContent = jokes[jokeIndex];
    jokeIndex = (jokeIndex + 1) % jokes.length;
    setTimeout(cycleJokes, 8000); // Change joke every 6 seconds (increased from 4 seconds)
}

cycleJokes();

// Do not start the game loop immediately; wait for the start button
