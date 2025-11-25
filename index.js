// Global Variables
let gameScreen = 0;

let ballX, ballY;
let ballSize = 20;
let ballColor;

let gravity = 1;
let ballSpeedVert = 0;
let airfriction = 0.0001;
let friction = 0.1;

let racketColor;
let racketWidth = 100;
let racketHeight = 10;
let racketBounceRate = 20;

let ballSpeedHorizon = 10;

let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;

let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;
let wallColors;

let walls = [];

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let score = 0;

function setup() {
  createCanvas(500, 500);
  ballX = width / 4;
  ballY = height / 5;

  ballColor = color(0);
  racketColor = color(0);
  wallColors = color(120, 80, 255);
}

function draw() {
  if (gameScreen === 0) {
    initScreen();
  } else if (gameScreen === 1) {
    gameMainScreen();
  } else if (gameScreen === 2) {
    gameOverScreen();
  }
}

function initScreen() {
  background(0);
  textAlign(CENTER);
  textSize(16);
  fill(255);
  text("Klik untuk memulai", width / 2, height / 2);
}

function gameMainScreen() {
  background(255);

  drawBall();
  applyGravity();
  keepInScreen();

  drawRacket();
  watchRacketBounce();

  applyHorizontalSpeed();

  wallAdder();
  wallHandler();

  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(30);
  text("Game Over", width / 2, height / 2 - 20);
  textSize(15);
  text("Click to Restart", width / 2, height / 2 + 10);
  textSize(20);
  text("Score: " + score, width / 2, height / 2 + 40);
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  lastAddTime = 0;
  walls = [];
  gameScreen = 0;
}

function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize);
}

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airfriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airfriction;
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;

  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    if (dist(ballX, ballY, ballX, mouseY) <= ballSize / 2 + abs(overhead)) {
      makeBounceBottom(mouseY);
      ballSpeedHorizon = (ballX - mouseX) / 5;

      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }
    }
  }
}

function keepInScreen() {
  if (ballY + ballSize / 2 > height) {
    makeBounceBottom(height);
  }
  if (ballY - ballSize / 2 < 0) {
    makeBounceTop(0);
  }
  if (ballX - ballSize / 2 < 0) {
    makeBounceLeft(0);
  }
  if (ballX + ballSize / 2 > width) {
    makeBounceRight(width);
  }
}

function mousePressed() {
  if (gameScreen === 0) {
    startGame();
  }
  if (gameScreen === 2) {
    restart();
  }
}

function startGame() {
  gameScreen = 1;
}

function gameOver() {
  gameScreen = 2;
}

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let randHeight = int(random(minGapHeight, maxGapHeight));
    let randY = int(random(0, height - randHeight));

    // generate warna random
    let r = random(50, 255);
    let g = random(50, 255);
    let b = random(50, 255);

    // {x, y, width, height, scoredFlag, r, g, b}
    let randWall = [width, randY, wallWidth, randHeight, 0, r, g, b];

    walls.push(randWall);
    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
    wallRemover(i);
  }
}

function wallDrawer(index) {
  let wall = walls[index];

  let gapWallX = wall[0];
  let gapWallY = wall[1];
  let gapWallWidth = wall[2];
  let gapWallHeight = wall[3];

  // ambil warna per-wall
  let r = wall[5];
  let g = wall[6];
  let b = wall[7];

  fill(r, g, b);
  rectMode(CORNER);

  rect(gapWallX, 0, gapWallWidth, gapWallY, 10);
  rect(gapWallX, gapWallY + gapWallHeight, gapWallWidth, height - (gapWallY + gapWallHeight), 10);
}

function watchWallCollision(index) {
  let wall = walls[index];

  let gapWallX = wall[0];
  let gapWallY = wall[1];
  let gapWallWidth = wall[2];
  let gapWallHeight = wall[3];
  let wallScored = wall[4];

  let topX = gapWallX;
  let topY = 0;
  let topW = gapWallWidth;
  let topH = gapWallY;

  let bottomX = gapWallX;
  let bottomY = gapWallY + gapWallHeight;
  let bottomW = gapWallWidth;
  let bottomH = height - (gapWallY + gapWallHeight);

  if (
    ballX + ballSize / 2 > topX &&
    ballX - ballSize / 2 < topX + topW &&
    ballY + ballSize / 2 > topY &&
    ballY - ballSize / 2 < topY + topH
  ) {
    decreaseHealth();
  }

  if (
    ballX + ballSize / 2 > bottomX &&
    ballX - ballSize / 2 < bottomX + bottomW &&
    ballY + ballSize / 2 > bottomY &&
    ballY - ballSize / 2 < bottomY + bottomH
  ) {
    decreaseHealth();
  }

  if (ballX > gapWallX + gapWallWidth / 2 && wallScored === 0) {
    wall[4] = 1;
    scoreUp();
  }
}

function scoreUp() {
  score++;
}

function printScore() {
  fill(0);
  textAlign(CENTER);
  textSize(30);
  text(score, width / 2, 50);
}

function drawHealthBar() {
  noStroke();
  fill(236, 240, 241);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 5);

  if (health > 60) fill(46, 204, 113);
  else if (health > 30) fill(230, 126, 34);
  else fill(231, 76, 60);

  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth * (health / maxHealth), 5);
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    gameOver();
  }
}
