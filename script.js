const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const welcomeScreen = document.getElementById('welcomeScreen');
const startButton = document.getElementById('startButton');

canvas.width = 400;
canvas.height = 600;

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

let pipeSpeed = isMobile ? 2 : 1; // Faster on mobile, slower on desktop
let frameIncrement = isMobile ? 1.5 : 1; // Faster frame increment on mobile

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
}

function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffcc'; // Neon bird color
    ctx.shadowColor = '#00ffcc'; // Neon glow
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow
    ctx.strokeStyle = '#00b3a1'; // Neon border
    ctx.stroke();
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = '#005f5f'; // Futuristic pipe color
        ctx.shadowColor = '#00ffcc'; // Neon glow
        ctx.shadowBlur = 10;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
        ctx.shadowBlur = 0; // Reset shadow

        ctx.strokeStyle = '#00b3a1'; // Neon border
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
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

function updatePipes() {
    if (frame % (isMobile ? 150 : 200) === 0) { // Faster pipe generation on mobile
        let gap = 150; // Increase the gap for better gameplay
        let minHeight = 50; // Minimum height for the top pipe
        let top = Math.random() * (canvas.height / 2 - minHeight) + minHeight; // Ensure top pipe is not too small
        pipes.push({ x: canvas.width, width: 50, top: top, bottom: canvas.height - top - gap });
        score++; // Increment score when a new pipe is generated
        updateScore(); // Update score UI
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed; // Adjust pipe movement speed based on device

        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + pipe.width &&
            (bird.y - bird.radius < pipe.top || bird.y + bird.radius > canvas.height - pipe.bottom)
        ) {
            gameOver = true;
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function gameLoop() {
    if (gameOver) {
        drawRestartScreen();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    drawGround(); // Draw ground

    updateBird();
    updatePipes();

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

// Do not start the game loop immediately; wait for the start button
