const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480; // Increased width from 320 to 480
canvas.height = 640; // Increased height from 480 to 640

const bird = {
    x: 50,
    y: 150,
    width: 40, // Keep the bird size the same
    height: 40,
    gravity: 0.4,  // Reduced from 0.6 for slower falling
    lift: -6,      // Reduced from -8 for gentler jumps
    velocity: 0,
    draw() {
        // Draw the bird's body
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Draw the bird's wing
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 4, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Draw the bird's beak
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2 + 12, this.y + this.height / 2 - 4);
        ctx.lineTo(this.x + this.width / 2 + 20, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2 + 12, this.y + this.height / 2 + 4);
        ctx.closePath();
        ctx.fill();

        // Draw the bird's eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 8, this.y + this.height / 2 - 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Draw the bird's pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 10, this.y + this.height / 2 - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }

        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.velocity = this.lift;
    }
};

const pipes = [];
const pipeWidth = 40;
const pipeGap = 250; // Increased gap from 200 to 250 for even easier gameplay
let frameCount = 0;
let score = 0;

function createPipe() {
    const minHeight = 50; // Minimum height for the top pipe
    const maxHeight = canvas.height - pipeGap - 50; // Maximum height for the top pipe
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight; // Randomize topHeight
    const bottomHeight = canvas.height - topHeight - pipeGap;

    pipes.push({
        x: canvas.width,
        topHeight,
        bottomHeight
    });
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw the top pipe
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Add reflection effect to the top pipe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(pipe.x + 5, 0, pipeWidth - 10, pipe.topHeight / 2);

        // Draw the bottom pipe
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);

        // Add reflection effect to the bottom pipe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(pipe.x + 5, canvas.height - pipe.bottomHeight, pipeWidth - 10, pipe.bottomHeight / 2);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        // If bird passes the pipe, increase score
        if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
            pipe.passed = true;
            score++;
        }
        pipe.x -= 1.2; // Reduced speed from 1.5 to 1.2 for slower pipe movement
    });

    if (pipes.length && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
    }
}

function checkCollision() {
    for (const pipe of pipes) {
        // Check horizontal overlap
        const horizontalCollision = bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x;

        // Check vertical overlap (either top or bottom pipe)
        const verticalCollision =
            bird.y < pipe.topHeight || bird.y + bird.height > canvas.height - pipe.bottomHeight;

        if (horizontalCollision && verticalCollision) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

const restartButton = document.getElementById('restartButton');
const gameOverScreen = document.getElementById('gameOverScreen');

function endGame() {
    cancelAnimationFrame(gameLoopId);
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    frameCount = 0;
    score = 0; // Reset score
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
}

// Add event listener for restart button
restartButton.addEventListener('click', restartGame);

const welcomeScreen = document.getElementById('welcomeScreen');
const startButton = document.getElementById('startButton');

startButton.addEventListener('click', () => {
    welcomeScreen.style.display = 'none'; // Explicitly set to "none"
    canvas.style.display = 'block'; // Explicitly set to "block"
    gameLoop();
});

let gameLoopId;
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bird.update();
    bird.draw();

    drawPipes(); // Draw pipes first
    updatePipes();

    drawScore(); // Ensure score is drawn on top of pipes

    if (checkCollision()) {
        endGame();
        return;
    }

    if (frameCount % 120 === 0) {
        createPipe();
    }

    frameCount++;
    gameLoopId = requestAnimationFrame(gameLoop);
}

function drawScore() {
    ctx.save(); // Save the current canvas state
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10); // Position the score at the top-left corner
    ctx.restore(); // Restore the canvas state
}

canvas.addEventListener('click', () => bird.flap());

// Add event listener for spacebar to make the bird jump
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        bird.flap();
    }
});

module.exports = {
    bird,
    pipes,
    checkCollision,
    restartGame,
    frameCount,
    score
};
