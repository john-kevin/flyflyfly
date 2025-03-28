// Mock the DOM before requiring the script
document.body.innerHTML = `
    <canvas id="gameCanvas"></canvas>
    <button id="restartButton" style="display: none;">Restart</button>
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

const { bird, checkCollision, pipes } = require('./script');

beforeEach(() => {
    // Mock the DOM
    document.body.innerHTML = `
        <canvas id="gameCanvas"></canvas>
        <button id="restartButton" style="display: none;">Restart</button>
    `;
    const canvas = document.getElementById('gameCanvas');
    canvas.width = 320;
    canvas.height = 480;
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
        bird.y = 480; // Simulate bird at the bottom
        bird.update();
        expect(bird.y + bird.height).toBeLessThanOrEqual(480);
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
