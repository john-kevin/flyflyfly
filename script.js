const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');

canvas.width = 400;
canvas.height = 600;

let bird = { x: 50, y: 300, radius: 15, velocity: 0, gravity: 0.2, lift: -6 }; // Reduced gravity
let pipes = [];
let frame = 0;
let gameOver = false;
let restart = false;
let score = 0; // Initialize score

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
    // Restart the game
    bird = { x: 50, y: 300, radius: 15, velocity: 0, gravity: 0.2, lift: -6 }; // Reduced gravity
    pipes = [];
    frame = 0;
    score = 0; // Reset score
    updateScore(); // Update score UI
    gameOver = false;
    restartButton.style.display = 'none'; // Hide the restart button
    gameLoop();
});

function updatePipes() {
    if (frame % 150 === 0) { // Slightly faster pipe generation
        let gap = 150; // Increase the gap for better gameplay
        let minHeight = 50; // Minimum height for the top pipe
        let top = Math.random() * (canvas.height / 2 - minHeight) + minHeight; // Ensure top pipe is not too small
        pipes.push({ x: canvas.width, width: 50, top: top, bottom: canvas.height - top - gap });
        score++; // Increment score when a new pipe is generated
        updateScore(); // Update score UI
    }

    pipes.forEach(pipe => {
        pipe.x -= 2; // Increase pipe movement speed for smoother gameplay

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

    frame += 1.5; // Increase frame increment for smoother gameplay
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        bird.velocity = bird.lift;
    } else if (e.key.toLowerCase() === 'r' && gameOver) {
        // Restart the game
        bird = { x: 50, y: 300, radius: 15, velocity: 0, gravity: 0.2, lift: -6 }; // Reduced gravity
        pipes = [];
        frame = 0;
        gameOver = false;
        gameLoop();
    }
});

canvas.addEventListener('touchstart', () => {
    bird.velocity = bird.lift; // Allow tap to make the bird jump
});

gameLoop();
