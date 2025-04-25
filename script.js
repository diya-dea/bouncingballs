const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.75;

let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
let timeLeft = 60;  // 1 minute timer
let gameActive = true;

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomColor() {
  return `rgb(${random(50, 255)}, ${random(50, 255)}, ${random(50, 255)})`;
}

class Ball {
  constructor(x, y, velX, velY, color, size) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    if ((this.x + this.size) >= canvas.width || (this.x - this.size) <= 0) {
      this.velX = -this.velX;
    }

    if ((this.y + this.size) >= canvas.height || (this.y - this.size) <= 0) {
      this.velY = -this.velY;
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  isMouseOver(mouseX, mouseY) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size;
  }
}

let balls = [];

while (balls.length < 15) {
  const size = random(15, 25);
  const ball = new Ball(
    random(size, canvas.width - size),
    random(size, canvas.height - size),
    random(-2, 2) || 1, // Increased speed, never 0
    random(-2, 2) || 1,
    randomColor(),
    size
  );
  balls.push(ball);
}

function loop() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  balls.forEach((ball) => {
    ball.draw();
    ball.update();
  });

  if (gameActive) {
    requestAnimationFrame(loop);
  }
}

loop();

// 🖱️ Catch the ball when mouse moves over it
canvas.addEventListener('mousemove', function(event) {
  if (!gameActive) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  let ballCaught = false;
  
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    
    if (ball.isMouseOver(mouseX, mouseY)) {
      ballCaught = true;  // Ball is under the cursor

      // Catch the ball
      ball.color = randomColor();
      score++;
      document.getElementById('score').textContent = score;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); // Save high score to local storage
        document.getElementById('highScore').textContent = highScore;
      }
      
      break;  // Only catch one ball at a time
    }
  }
  
  // Change cursor to hand when hovering over a ball
  if (ballCaught) {
    document.body.style.cursor = 'grab';  // Hand cursor
  } else {
    document.body.style.cursor = 'pointer';  // Default pointer
  }
});

// ⏱️ Timer logic
let timerInterval = setInterval(() => {
  if (timeLeft > 0) {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
  } else {
    clearInterval(timerInterval);
    gameActive = false;
    setTimeout(() => {
      alert(`⏰ Time’s up! You scored ${score} points.`);
      // Check if current score is higher than high score
      if (score > highScore) {
        alert(`🎉 New High Score: ${score}!`);
        localStorage.setItem('highScore', score); // Update high score
      }
      // Reset game to start again
      resetGame();
    }, 100);
  }
}, 1000);

// Reset game for next round
function resetGame() {
  score = 0;
  timeLeft = 60;
  document.getElementById('score').textContent = score;
  document.getElementById('timer').textContent = timeLeft;

  // Create new balls for the next game
  balls = [];
  while (balls.length < 15) {
    const size = random(15, 25);
    const ball = new Ball(
      random(size, canvas.width - size),
      random(size, canvas.height - size),
      random(-2, 2) || 1, // Increased speed, never 0
      random(-2, 2) || 1,
      randomColor(),
      size
    );
    balls.push(ball);
  }

  // Restart the game
  gameActive = true;
  loop();
}
