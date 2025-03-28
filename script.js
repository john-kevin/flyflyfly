const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 320;
canvas.height = 480;

const bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 1.5,
    lift: -20,
    velocity: 0,
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
