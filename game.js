// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GAME_SPEED = 100; // 游戏速度（毫秒）

// 游戏变量
let canvas;
let ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let isPaused = false;
let gameOver = false;

// DOM 元素
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');

// 初始化游戏
function initGame() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // 检查是否需要调整画布大小（响应式）
    adjustCanvasSize();
    
    // 初始化蛇
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    // 生成第一个食物
    generateFood();
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    isPaused = false;
    gameOver = false;
    
    // 绘制初始游戏状态
    draw();
    
    // 添加事件监听器
    document.addEventListener('keydown', handleKeyPress);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    
    // 添加移动设备控制
    setupMobileControls();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
}

// 开始游戏
function startGame() {
    if (gameInterval) clearInterval(gameInterval);
    if (!isPaused && !gameOver) {
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }
}

// 游戏主循环
function gameLoop() {
    if (isPaused || gameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        endGame();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 不移除蛇尾，让蛇变长
        generateFood();
    } else {
        // 移除蛇尾
        snake.pop();
    }
    
    // 重新绘制游戏
    draw();
}

// 移动蛇
function moveSnake() {
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 添加新的头部
    snake.unshift(head);
}

// 生成食物
function generateFood() {
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    // 随机生成食物位置
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 蛇头用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            ctx.fillStyle = '#8BC34A';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // 添加边框
        ctx.strokeStyle = '#388E3C';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // 为蛇头添加眼睛
        if (index === 0) {
            drawSnakeEyes(segment);
        }
    });
}

// 绘制蛇眼睛
function drawSnakeEyes(head) {
    const eyeSize = GRID_SIZE / 5;
    const eyeOffset = GRID_SIZE / 4;
    
    ctx.fillStyle = 'white';
    
    // 根据方向绘制眼睛
    switch (direction) {
        case 'up':
            // 左眼
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset,
                head.y * GRID_SIZE + eyeOffset,
                eyeSize,
                eyeSize
            );
            // 右眼
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                head.y * GRID_SIZE + eyeOffset,
                eyeSize,
                eyeSize
            );
            break;
        case 'down':
            // 左眼
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                eyeSize,
                eyeSize
            );
            // 右眼
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                eyeSize,
                eyeSize
            );
            break;
        case 'left':
            // 上眼
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset,
                head.y * GRID_SIZE + eyeOffset,
                eyeSize,
                eyeSize
            );
            // 下眼
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                eyeSize,
                eyeSize
            );
            break;
        case 'right':
            // 上眼
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                head.y * GRID_SIZE + eyeOffset,
                eyeSize,
                eyeSize
            );
            // 下眼
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize,
                eyeSize,
                eyeSize
            );
            break;
    }
    
    // 眼球
    ctx.fillStyle = 'black';
    
    switch (direction) {
        case 'up':
            // 左眼球
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset + eyeSize/4,
                head.y * GRID_SIZE + eyeOffset + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            // 右眼球
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                head.y * GRID_SIZE + eyeOffset + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            break;
        case 'down':
            // 左眼球
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset + eyeSize/4,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            // 右眼球
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            break;
        case 'left':
            // 上眼球
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset + eyeSize/4,
                head.y * GRID_SIZE + eyeOffset + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            // 下眼球
            ctx.fillRect(
                head.x * GRID_SIZE + eyeOffset + eyeSize/4,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            break;
        case 'right':
            // 上眼球
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                head.y * GRID_SIZE + eyeOffset + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            // 下眼球
            ctx.fillRect(
                head.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                head.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize + eyeSize/4,
                eyeSize/2,
                eyeSize/2
            );
            break;
    }
}

// 绘制食物
function drawFood() {
    // 绘制苹果形状的食物
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制苹果柄
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 1,
        food.y * GRID_SIZE + 2,
        2,
        4
    );
    
    // 绘制叶子
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.ellipse(
        food.x * GRID_SIZE + GRID_SIZE / 2 + 3,
        food.y * GRID_SIZE + 3,
        4,
        2,
        Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 处理键盘输入
function handleKeyPress(event) {
    // 防止方向键滚动页面
    if ([37, 38, 39, 40, 65, 87, 68, 83].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // 如果游戏结束，忽略按键
    if (gameOver) return;
    
    // 根据按键更新方向
    switch (event.keyCode) {
        // 上箭头或W
        case 38:
        case 87:
            if (direction !== 'down') nextDirection = 'up';
            break;
        // 下箭头或S
        case 40:
        case 83:
            if (direction !== 'up') nextDirection = 'down';
            break;
        // 左箭头或A
        case 37:
        case 65:
            if (direction !== 'right') nextDirection = 'left';
            break;
        // 右箭头或D
        case 39:
        case 68:
            if (direction !== 'left') nextDirection = 'right';
            break;
        // 空格键 - 暂停/继续
        case 32:
            togglePause();
            break;
    }
}

// 暂停/继续游戏
function togglePause() {
    if (gameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
    
    if (isPaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }
}

// 结束游戏
function endGame() {
    clearInterval(gameInterval);
    gameOver = true;
    
    // 绘制游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = '16px Arial';
    ctx.fillText('按"重新开始"按钮再玩一次', canvas.width / 2, canvas.height / 2 + 50);
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    initGame();
    startGame();
}

// 调整画布大小
function adjustCanvasSize() {
    // 检查窗口宽度，如果是移动设备则调整画布大小
    if (window.innerWidth <= 768) {
        canvas.width = 300;
        canvas.height = 300;
    } else {
        canvas.width = 400;
        canvas.height = 400;
    }
}

// 处理窗口大小变化
function handleResize() {
    // 保存当前游戏状态
    const wasRunning = !isPaused && !gameOver;
    
    // 如果游戏正在运行，暂停游戏
    if (wasRunning) {
        clearInterval(gameInterval);
    }
    
    // 调整画布大小
    adjustCanvasSize();
    
    // 重新绘制游戏
    draw();
    
    // 如果游戏之前在运行，继续游戏
    if (wasRunning) {
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }
}

// 设置移动设备控制
function setupMobileControls() {
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // 添加触摸事件监听器
    upBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (direction !== 'down') nextDirection = 'up';
    });
    
    downBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (direction !== 'up') nextDirection = 'down';
    });
    
    leftBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (direction !== 'right') nextDirection = 'left';
    });
    
    rightBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (direction !== 'left') nextDirection = 'right';
    });
    
    // 添加点击事件（用于非触摸设备）
    upBtn.addEventListener('click', function() {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    downBtn.addEventListener('click', function() {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    leftBtn.addEventListener('click', function() {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    rightBtn.addEventListener('click', function() {
        if (direction !== 'left') nextDirection = 'right';
    });
}

// 页面加载完成后初始化游戏
window.onload = function() {
    initGame();
};