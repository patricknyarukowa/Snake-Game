class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 1;
        this.decay = Math.random() * 0.05 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;
        this.backgroundColor = '#000000';
        this.particles = [];
        this.foodMoveInterval = null;
        this.foodSpeed = 1000; // Move food every 1 second initially
        this.gameStarted = false;

        // Initialize game
        this.setupCanvas();
        this.setupEventListeners();
        this.showWelcomeScreen();
    }

    getRandomColor() {
        const colors = [
            '#1a1a1a', '#2d0f44', '#1a4422', '#442f0f',
            '#440f0f', '#0f2944', '#440f2f', '#2f440f'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }    setupCanvas() {
        this.canvas.width = 600;
        this.canvas.height = 600;
    }

    showWelcomeScreen() {
        // Clear the canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);        // Draw welcome box
        this.ctx.fillStyle = '#333333';
        const boxWidth = 500;
        const boxHeight = 400;
        const boxX = (this.canvas.width - boxWidth) / 2;
        const boxY = (this.canvas.height - boxHeight) / 2;
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Add border to the box
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);        // Welcome message
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Snake - By Peezy', this.canvas.width / 2, boxY + 50);

        // Instructions
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px Arial';
        const lineHeight = 30;
        let textY = boxY + 100;

        this.ctx.fillText('How to Play:', this.canvas.width / 2, textY);
        textY += lineHeight;
        this.ctx.fillText('Use the following controls to move:', this.canvas.width / 2, textY);
        textY += lineHeight;
        this.ctx.fillText('I - Move Up', this.canvas.width / 2, textY);
        textY += lineHeight;
        this.ctx.fillText('K - Move Down', this.canvas.width / 2, textY);
        textY += lineHeight;
        this.ctx.fillText('J - Move Left', this.canvas.width / 2, textY);
        textY += lineHeight;
        this.ctx.fillText('L - Move Right', this.canvas.width / 2, textY);
        textY += lineHeight + 10;
        this.ctx.fillText('Catch the moving apple (🍎) to grow', this.canvas.width / 2, textY);
        textY += lineHeight;
        this.ctx.fillText('Game ends if you hit the wall or yourself', this.canvas.width / 2, textY);

        // Start prompt
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press ENTER to Start', this.canvas.width / 2, boxY + 270);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'i':
                    if (this.gameStarted && this.direction !== 'down') this.direction = 'up';
                    break;
                case 'k':
                    if (this.gameStarted && this.direction !== 'up') this.direction = 'down';
                    break;
                case 'j':
                    if (this.gameStarted && this.direction !== 'right') this.direction = 'left';
                    break;
                case 'l':
                    if (this.gameStarted && this.direction !== 'left') this.direction = 'right';
                    break;
                case 'enter':
                    if (!this.gameLoop) {
                        this.startGame();
                        this.gameStarted = true;
                    }
                    break;
            }
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
            this.gameStarted = true;
        });
    }

    generateFood() {
        const maxX = (this.canvas.width / this.gridSize) - 1;
        const maxY = (this.canvas.height / this.gridSize) - 1;
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    createExplosion(x, y) {
        const colors = ['#ff0000', '#ff6b6b', '#ff8787', '#ffa500'];
        for (let i = 0; i < 30; i++) {
            this.particles.push(new Particle(
                x * this.gridSize + this.gridSize / 2,
                y * this.gridSize + this.gridSize / 2,
                colors[Math.floor(Math.random() * colors.length)]
            ));
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas with current background color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food (apple emoji)
        this.ctx.font = `${this.gridSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🍎', 
            (this.food.x * this.gridSize) + (this.gridSize / 2),
            (this.food.y * this.gridSize) + (this.gridSize / 2)
        );

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    move() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('scoreValue').textContent = this.score;
            this.createExplosion(this.food.x, this.food.y);
            this.food = this.generateFood();
            // Change background color
            this.backgroundColor = this.getRandomColor();
            // Increase speed
            if (this.speed > 50) {
                this.speed -= 5;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.gameStep(), this.speed);
            }
        } else {
            this.snake.pop();
        }
    }

    moveFood() {
        const possibleMoves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // left, right, up, down
        
        directions.forEach(([dx, dy]) => {
            const newX = this.food.x + dx;
            const newY = this.food.y + dy;
            
            if (newX >= 0 && newX < this.canvas.width / this.gridSize &&
                newY >= 0 && newY < this.canvas.height / this.gridSize &&
                !this.snake.some(segment => segment.x === newX && segment.y === newY)) {
                possibleMoves.push([newX, newY]);
            }
        });

        if (possibleMoves.length > 0) {
            const [newX, newY] = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.food = { x: newX, y: newY };
        }
    }

    startFoodMovement() {
        if (this.foodMoveInterval) {
            clearInterval(this.foodMoveInterval);
        }
        this.foodMoveInterval = setInterval(() => this.moveFood(), this.foodSpeed);
    }    gameStep() {
        this.move();
        this.updateParticles();
        this.draw();
    }    startGame() {
        // Clear any existing intervals
        if (this.gameOverInterval) {
            clearInterval(this.gameOverInterval);
        }

        // Reset game state
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.speed = 150;
        this.backgroundColor = '#000000';
        document.getElementById('scoreValue').textContent = this.score;
        this.food = this.generateFood();
        this.particles = [];
            
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        if (this.foodMoveInterval) {
            clearInterval(this.foodMoveInterval);
        }

        // Start game loop and food movement
        this.gameLoop = setInterval(() => this.gameStep(), this.speed);
        this.startFoodMovement();        document.getElementById('startButton').textContent = 'Restart Game';
    }    gameOver() {
        clearInterval(this.gameLoop);
        clearInterval(this.foodMoveInterval);
        this.gameLoop = null;

        // Save the current game state
        const currentState = {
            snake: [...this.snake],
            food: {...this.food},
            score: this.score,
            backgroundColor: this.backgroundColor
        };

        // Function to draw the game over screen
        const drawGameOver = () => {
            // Clear the entire canvas
            this.ctx.fillStyle = currentState.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw the final state of the snake
            this.ctx.fillStyle = '#4CAF50';
            currentState.snake.forEach(segment => {
                this.ctx.fillRect(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
            });

            // Create dark overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);            // Draw game over box
            this.ctx.fillStyle = '#333333';
            const boxWidth = 400;
            const boxHeight = 250;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = (this.canvas.height - boxHeight) / 2;
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Add border to the box
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Game Over message
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, boxY + 60);

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${currentState.score}`, this.canvas.width / 2, boxY + 100);
            
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Press ENTER to play again', this.canvas.width / 2, boxY + 150);
        };

        // Draw the game over screen
        drawGameOver();

        // Redraw the game over screen periodically to ensure it stays visible
        this.gameOverInterval = setInterval(drawGameOver, 100);
    }
}

// Initialize game when window loads
window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    new Snake(canvas);
};
