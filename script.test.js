// Mock the DOM before requiring the script
document.body.innerHTML = `
    <canvas id="gameCanvas" style="display: none;"></canvas>
    <div id="gameOverScreen" style="display: none;">
        <h2>Game Over!</h2>
        <p>Score: <span id="finalScore">0</span></p>
        <button id="restartButton" style="display: none;">Restart</button>
    </div>
    <div id="welcomeScreen" style="display: flex;">Welcome to the game!</div>
    <button id="startButton">Start</button>
`;

// Mock the getContext method
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    strokeRect: jest.fn(),
    strokeText: jest.fn(),
}));

// Require the script to initialize event listeners
require('./script');

const { bird, checkCollision, pipes, restartGame, frameCount } = require('./script');

beforeEach(() => {
    // Mock the DOM
    document.body.innerHTML = `
        <canvas id="gameCanvas" style="display: none;"></canvas>
        <div id="gameOverScreen" style="display: none;">
            <h2>Game Over!</h2>
            <p>Score: <span id="finalScore">0</span></p>
            <button id="restartButton" style="display: none;">Restart</button>
        </div>
        <div id="welcomeScreen" style="display: flex;">Welcome to the game!</div>
        <button id="startButton">Start</button>
    `;
    const canvas = document.getElementById('gameCanvas');
    canvas.width = 280; // Match new mobile width
    canvas.height = 400; // Match new mobile height
});

describe('Bird Movement', () => {
    test('Bird should fall due to gravity', () => {
        bird.y = 150;
        bird.velocity = 0;
        bird.update();
        expect(bird.y).toBeGreaterThan(150);
    });

    test('Bird should move up when flapped', () => {
        bird.y = 150;
        bird.velocity = 0;
        bird.flap();
        bird.update();
        expect(bird.y).toBeLessThan(150);
    });

    test('Bird should not fall below the canvas', () => {
        bird.y = 400; // Simulate bird at the bottom
        bird.update();
        expect(bird.y + bird.height).toBeLessThanOrEqual(400);
    });

    test('Bird should not go above the canvas', () => {
        bird.y = -10; // Simulate bird above the canvas
        bird.update();
        expect(bird.y).toBeGreaterThanOrEqual(0);
    });
});

describe('Collision Detection', () => {
    test('Bird should collide with a pipe', () => {
        bird.x = 50;
        bird.y = 100;
        bird.width = 20; // Ensure bird dimensions match the game logic
        bird.height = 20;

        pipes.length = 0; // Clear any existing pipes
        pipes.push({
            x: 50, // Align pipe's x-coordinate with bird's x-coordinate
            topHeight: 110, // Ensure bird's y-coordinate overlaps with pipe's topHeight
            bottomHeight: 300 // Ensure bird's y-coordinate does not overlap with bottomHeight
        });

        expect(checkCollision()).toBe(true);
    });

    test('Bird should not collide when far from pipes', () => {
        bird.x = 50;
        bird.y = 100;
        pipes.length = 0; // Clear pipes
        pipes.push({ x: 300, topHeight: 80, bottomHeight: 300 });
        expect(checkCollision()).toBe(false);
    });
});

describe('Welcome Screen', () => {
    test('Welcome screen should be visible initially', () => {
        const welcomeScreen = document.getElementById('welcomeScreen');
        expect(welcomeScreen.style.display).not.toBe('none');
    });

    test('Game canvas should be hidden initially', () => {
        const canvas = document.getElementById('gameCanvas');
        expect(canvas.style.display).toBe('none'); // Fixed typo: Changed .Be to .toBe
    });
});

describe('Bird Physics', () => {
    test('Bird should fall smoothly due to gravity', () => {
        bird.y = 150;
        bird.velocity = 0;
        bird.update();
        expect(bird.velocity).toBeCloseTo(0.8); // Match new gravity value
        expect(bird.y).toBeGreaterThan(150);
    });

    test('Bird should jump lower with reduced lift', () => {
        bird.y = 150;
        bird.velocity = 0;
        bird.flap();
        expect(bird.velocity).toBeCloseTo(-12); // Match new lift value
        bird.update();
        expect(bird.y).toBeLessThan(150);
    });

    test('Bird should not fall below the canvas', () => {
        bird.y = 400; // Simulate bird at the bottom
        bird.update();
        expect(bird.y + bird.height).toBeLessThanOrEqual(400);
    });

    test('Bird should not go above the canvas', () => {
        bird.y = -10; // Simulate bird above the canvas
        bird.update();
        expect(bird.y).toBeGreaterThanOrEqual(0);
    });
});

describe('Game Restart Functionality', () => {
    test('Restart should reset score to 0', () => {
        const { score, restartGame } = require('./script');
        // Simulate some score
        let testScore = score;
        testScore = 10;
        restartGame();
        expect(score).toBe(0);
    });
});

