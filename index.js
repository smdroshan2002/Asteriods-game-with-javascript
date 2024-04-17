const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor({ position, velocity }) {
    this.position = position; // {x, y}
    this.velocity = velocity;
    this.rotation = 0;
  }

  draw() {
    c.save();

    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);

    c.beginPath();
    c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
    c.fillStyle = 'red';
    c.fill();
    c.closePath();

    c.beginPath();
    c.moveTo(this.position.x + 30, this.position.y);
    c.lineTo(this.position.x - 10, this.position.y - 10);
    c.lineTo(this.position.x - 10, this.position.y + 10);
    c.closePath();

    c.strokeStyle = 'white';
    c.stroke();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  getVertices() {
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ];
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.closePath();
    c.fillStyle = 'white';
    c.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Asteroid {
  constructor({ position, velocity, radius }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    c.closePath();
    c.strokeStyle = 'white';
    c.stroke();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Score {
  constructor() {
    this.value = 0;
    this.highScore = localStorage.getItem('highScore') || 0;
  }

  increase() {
    this.value += 10;
    if (this.value > this.highScore) {
      this.highScore = this.value;
      localStorage.setItem('highScore', this.highScore);
    }
  }

  draw() {
    c.font = '20px Arial';
    c.fillStyle = 'white';
    c.fillText('Score: ' + this.value, 20, 30);
    c.fillText('High Score: ' + this.highScore, canvas.width - 150, 30);
  }
}
const score = new Score();

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const SPEED = 3;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 3;

const projectiles = [];
const asteroids = [];
const TIMER_DURATION = 120;
let timer = TIMER_DURATION; 
let gameOver = false

const intervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4);
  let x, y;
  let vx, vy;
  let radius = 50 * Math.random() + 10;

  switch (index) {
    case 0:
      x = 0 - radius;
      y = Math.random() * canvas.height;
      vx = 1;
      vy = 0;
      break;
    case 1:
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      vx = 0;
      vy = -1;
      break;
    case 2:
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      vx = -1;
      vy = 0;
      break;
    case 3:
      x = Math.random() * canvas.width;
      y = 0 - radius;
      vx = 0;
      vy = 1;
      break;
  }

  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  );
}, 3000);


class Timer {
  static draw() {
    c.font = '20px Arial';
    c.fillStyle = 'white';
    c.fillText('Time: ' + timer + 's', canvas.width / 2 - 50, 30);
  }
}



class Graphics {
  static drawPlayer() {
    c.save();
    c.beginPath();
    c.arc(player.position.x, player.position.y, 15, 0, Math.PI * 2, false);
    c.fillStyle = 'red';
    c.fill();
    c.closePath();
    c.beginPath();
    c.moveTo(player.position.x + 45, player.position.y);
    c.lineTo(player.position.x - 15, player.position.y - 15);
    c.lineTo(player.position.x - 15, player.position.y + 15);
    c.closePath();
    c.strokeStyle = 'white';
    c.stroke();
    c.restore();
  }

  static drawProjectile() {
    c.beginPath();
    c.arc(
      projectiles[projectiles.length - 1].position.x,
      projectiles[projectiles.length - 1].position.y,
      5,
      0,
      Math.PI * 2,
      false
    );
    c.closePath();
    c.fillStyle = 'white';
    c.fill();
  }

  static drawAsteroid() {
    c.beginPath();
    c.arc(
      asteroids[asteroids.length - 1].position.x,
      asteroids[asteroids.length - 1].position.y,
      asteroids[asteroids.length - 1].radius,
      0,
      Math.PI * 2,
      false
    );
    c.closePath();
    c.strokeStyle = 'white';
    c.stroke();
  }

  static drawGameOverText() {
    c.font = 'bold 60px Arial';
    c.fillStyle = 'red';
    c.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2 - 30);
    c.fillStyle = 'white';
    c.fillText('Game Over', canvas.width / 2 - 153, canvas.height / 2 - 33);
  }
  static drawGameOverText() {
    // Simulated 3D effect for the "Game Over" text
    c.font = 'bold 60px Arial';
    c.fillStyle = 'red';
    c.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2 - 30);
    c.fillStyle = 'white';
    c.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2 - 28);
  }
}

function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x;
  const yDifference = circle2.position.y - circle1.position.y;

  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  );

  return distance <= circle1.radius + circle2.radius;
}

function circleTriangleCollision(circle, triangle) {
  for (let i = 0; i < 3; i++) {
    let start = triangle[i];
    let end = triangle[(i + 1) % 3];

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let length = Math.sqrt(dx * dx + dy * dy);

    let dot =
      ((circle.position.x - start.x) * dx + (circle.position.y - start.y) * dy) /
      Math.pow(length, 2);

    let closestX = start.x + dot * dx;
    let closestY = start.y + dot * dy;

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x;
      closestY = closestY < start.y ? start.y : end.y;
    }

    dx = closestX - circle.position.x;
    dy = closestY - circle.position.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= circle.radius) {
      return true;
    }
  }

  return false;
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  );
}

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  c.fillStyle = 'black';
  c.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    player.update();
    score.draw();

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      projectile.update();
      Graphics.drawProjectile();

      if (
        projectile.position.x + projectile.radius < 0 ||
        projectile.position.x - projectile.radius > canvas.width ||
        projectile.position.y - projectile.radius > canvas.height ||
        projectile.position.y + projectile.radius < 0
      ) {
        projectiles.splice(i, 1);
      }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.update();
      Graphics.drawAsteroid();

      if (circleTriangleCollision(asteroid, player.getVertices())) {
        console.log('GAME OVER');
        gameOver = true;
        window.cancelAnimationFrame(animationId);
        clearInterval(intervalId);
      }

      if (
        asteroid.position.x + asteroid.radius < 0 ||
        asteroid.position.x - asteroid.radius > canvas.width ||
        asteroid.position.y - asteroid.radius > canvas.height ||
        asteroid.position.y + asteroid.radius < 0
      ) {
        asteroids.splice(i, 1);
      }

      for (let j = projectiles.length - 1; j >= 0; j--) {
        const projectile = projectiles[j];

        if (circleCollision(asteroid, projectile)) {
          asteroids.splice(i, 1);
          projectiles.splice(j, 1);
          score.increase();
        }
      }
    }

    if (keys.w.pressed) {
      player.velocity.x = Math.cos(player.rotation) * SPEED;
      player.velocity.y = Math.sin(player.rotation) * SPEED;
    } else if (!keys.w.pressed) {
      player.velocity.x *= FRICTION;
      player.velocity.y *= FRICTION;
    }

    if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED;
    else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED;

    Graphics.drawPlayer();
  } else {
    Graphics.drawGameOverText();
  }


  if (timer > 0) {
    timer -= 1 / 120; // Decrease timer by 1 second per frame
  } else {
    gameOver = true;
    timer = 0; // Ensure timer doesn't go below 0
  }

  Timer.draw();

}


animate();

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true;
      break;
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
    case 'Space':
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + Math.cos(player.rotation) * 30,
            y: player.position.y + Math.sin(player.rotation) * 30,
          },
          velocity: {
            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
          },
        })
      );
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false;
      break;
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
  }
});
