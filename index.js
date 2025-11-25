// =========================
// Global Variables
// =========================

let gameScreen = 0;

let ballX, ballY;
let ballSize = 20;
let ballColor;

let gravity = 1;
let ballSpeedVert = 0;
let airfriction = 0.0001;
let friction = 0.1;

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

let walls = [];

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let score = 0;

// Daftar warna wall
let wallColorList = [
  [0, 120, 255],   // Biru
  [255, 50, 50],   // Merah
  [255, 220, 0],   // Kuning
  [50, 200, 70],   // Hijau
  [180, 60, 255],  // Ungu
  [255, 120, 0]    // Oranye
];

function setup() {
  createCanvas(500, 500);

  ballX = width / 4;
  ballY = height / 5;
  ballColor = color(0);
}

function draw() {
  if (gameScreen === 0) initScreen();
  else if (gameScreen === 1) gamePlayScreen();
  else if (gameScreen === 2) gameOverScreen();
}

// =========================
// Screens
// =========================

function initScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(16);
  text("Klik untuk memulai", width / 2, height / 2);
}

function gamePlayScreen() {
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

function mousePressed() {
  if (gameScreen === 0) startGame();
  else if (gameScreen === 2) restartGame();
}

function startGame() {
  gameScreen = 1;
}

function restartGame() {
  score = 0;
  health = maxHealth;
  walls = [];
  ballX = width / 4;
  ballY = height / 5;
  lastAddTime = 0;

  gameScreen = 0;
}

// =========================
// Ball & Movement
// =========================

function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airfriction;
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airfriction;
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

function keepInScreen() {
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
}

// =========================
// Racket
// =========================

function drawRacket() {
  fill(0);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
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

// =========================
// Walls
// =========================

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {

    let randHeight = int(random(minGapHeight, maxGapHeight));
    let randY = int(random(0, height - randHeight));

    let randColor = wallColorList[int(random(wallColorList.length))];

    // Wall: [x, y, width, height, scored, r, g, b]
    walls.push([
      width,
      randY,
      wallWidth,
      randHeight,
      0,
      randColor[0],
      randColor[1],
      randColor[2]
    ]);

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

function wallMover(index) {
  walls[index][0] -= wallSpeed;
}

function wallDrawer(index) {
  let w = walls[index];

  let x = w[0];
  let y = w[1];
  let gapW = w[2];
  let gapH = w[3];

  let r = w[5];
  let g = w[6];
  let b = w[7];

  fill(r, g, b);
  rectMode(CORNER);

  rect(x, 0, gapW, y, 10);
  rect(x, y + gapH, gapW, height - (y + gapH), 10);
}

function wallRemover(index) {
  if (walls[index][0] + walls[index][2] <= 0) {
    walls.splice(index, 1);
  }
}

function watchWallCollision(index) {
  let w = walls[index];

  let x = w[0];
  let y = w[1];
  let gapW = w[2];
  let gapH = w[3];
  let scored = w[4];

  // top wall
  if (
    ballX + ballSize / 2 > x &&
    ballX - ballSize / 2 < x + gapW &&
    ballY - ballSize / 2 < y
  ) {
    decreaseHealth();
  }

  // bottom wall
  if (
    ballX + ballSize / 2 > x &&
    ballX - ballSize / 2 < x + gapW &&
    ballY + ballSize / 2 > y + gapH
  ) {
    decreaseHealth();
  }

  // scoring
  if (ballX > x + gapW / 2 && scored === 0) {
    w[4] = 1;
    score++;
  }
}

// =========================
// Health & Score
// =========================

function drawHealthBar() {
  noStroke();
  rectMode(CORNER);

  fill(236);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 5);

  if (health > 60) fill(50, 200, 120);
  else if (health > 30) fill(255, 160, 40);
  else fill(230, 60, 60);

  rect(
    ballX - healthBarWidth / 2,
    ballY - 30,
    (healthBarWidth * health) / maxHealth,
    5
  );
}

function decreaseHealth() {
  health -= healthDecrease;

  if (health <= 0) {
    gameScreen = 2;
  }
}

function printScore() {
  fill(0);
  textSize(30);
  textAlign(CENTER);
  text(score, width / 2, 50);
}
