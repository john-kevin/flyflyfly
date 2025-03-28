const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

canvas.width = 400;
canvas.height = 600;

let bird = { x: 50, y: 300, radius: 15, velocity: 0, gravity: 0.2, lift: -6 }; // Reduced gravity
let pipes = [];
let frame = 0;
let gameOver = false;
let restart = false;

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

function drawRestartScreen() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 20);
    restartButton.style.display = 'block'; // Show the restart button
}

restartButton.addEventListener('click', () => {
    // Restart the game
    bird = { x: 50, y: 300, radius: 15, velocity: 0, gravity: 0.2, lift: -6 }; // Reduced gravity
    pipes = [];
    frame = 0;
    gameOver = false;
    restartButton.style.display = 'none'; // Hide the restart button
    gameLoop();
});

function updatePipes() {
    if (frame % 200 === 0) { // Slower pipe generation
        let gap = 150; // Increase the gap for better gameplay
        let minHeight = 50; // Minimum height for the top pipe
        let top = Math.random() * (canvas.height / 2 - minHeight) + minHeight; // Ensure top pipe is not too small
        pipes.push({ x: canvas.width, width: 50, top: top, bottom: canvas.height - top - gap });
    }

    pipes.forEach(pipe => {
        pipe.x -= 1; // Slower pipe movement

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

    frame++; // Ensure frame increments on every loop iteration
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

gameLoop();
