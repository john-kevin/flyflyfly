const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

const bird = {
    x: 50,
    y: 150,
    width: 50,
    height: 50,
    gravity: 1.2, // Reduced gravity for smoother descent
    lift: -15, // Reduced lift for a lower jump
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
        ctx.moveTo(this.x + this.width / 2 + 15, this.y + this.height / 2 - 5);
        ctx.lineTo(this.x + this.width / 2 + 25, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2 + 15, this.y + this.height / 2 + 5);
        ctx.closePath();
        ctx.fill();

        // Draw the bird's eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 10, this.y + this.height / 2 - 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Draw the bird's pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 12, this.y + this.height / 2 - 10, 2, 0, Math.PI * 2);
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
const pipeGap = 120;
let frameCount = 0;

function createPipe() {
    const topHeight = 110; // Adjusted topHeight for testing
    const bottomHeight = canvas.height - topHeight - pipeGap;

    pipes.push({
        x: canvas.width,
        topHeight,
        bottomHeight
    });
}

function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
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

function endGame() {
    cancelAnimationFrame(gameLoopId);
    restartButton.style.display = 'block';
    restartButton.addEventListener('click', restartGame);
}

function restartGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    frameCount = 0;
    restartButton.style.display = 'none';
    gameLoop();
}

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

    if (frameCount % 90 === 0) {
        createPipe();
    }

    drawPipes();
    updatePipes();

    if (checkCollision()) {
        endGame();
        return;
    }

    frameCount++;
    gameLoopId = requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', () => bird.flap());

module.exports = {
    bird,
    pipes,
    checkCollision
};
