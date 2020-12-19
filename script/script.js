console.log("this")
const body = document.querySelector("body");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const s = document.querySelector("#score");
canvas.width = 2500;
canvas.height = 2500;
//Class
class Circle {
  constructor (x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
		if(this.radius > 0) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		}
  }
}
class Projectile extends Circle {
  constructor (x, y, radius, color, velocity, dmg, penetration) {
    super (x, y, radius, color, velocity)
    this.velocity = {x: velocity.x, y: velocity.y};
    this.dmg = dmg;
		this.penetration = penetration;
    this.age = 0;
  }
  move() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.age += 1;
  }
}
class Cannon extends Projectile {
  constructor (x, y, radius, color, velocity, dmg, penetration) {
    super (x, y, radius, color, velocity, dmg, penetration)
    this.age = 0;
  }
}
class Shotgun extends Projectile {
  constructor (x, y, radius, color, velocity, dmg, penetration) {
    super (x, y, radius, color, velocity, dmg, penetration)
    this.age = 0;
  }
  move() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.age += 1;
    if(this.dmg > 5) {
      this.dmg -= 2 * (this.age / 30);
    }
  }
}
class Gatling extends Projectile {
  constructor (x, y, radius, color, velocity, dmg, penetration) {
    super (x, y, radius, color, velocity, dmg, penetration)
    this.age = 0;
  }
}
class Boomerang extends Projectile {
  constructor (x, y, radius, color, velocity, dmg, penetration) {
    super (x, y, radius, color, velocity, dmg, penetration)
    this.age = 0;
  }
}
class Enemy extends Circle {
  constructor (x, y, radius, color, velocity, score) {
    super (x, y, radius, color, velocity)
    this.velocity = {x: velocity.x, y: velocity.y};
    this.score = score;
		this.age = 0;
  }
  move() {
		this.age += 1;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
//Varibable opt(must not change in progress )
const opt = {
  player: {
		life: 3,
    color: "white",
    radius: 10,
    speed: 10
  },
  proj: {
    list: ["cannon", "shotgun", "gatling", "boomerang"],
    cannon: {
      color: "white",
      radius: 100,
      speed: 30,
      dmg: 75,
			penetration: true,
      attackInterval: 2000 //(msec)
    },
    shotgun: {
      color: "white",
      radius: 5,
      speed: 15,
      dmg: 150,
			penetration: false,
      precision: 20, //(degree)
      pellet: 16,
      attackInterval: 750 //(msec)
    },
    gatling: {
      color: "white",
      radius: 3,
      speed: 20,
      dmg: 40,
			penetration: false,
      precision: 10, //(degree)
      attackInterval: 100 //(msec)
    },
		boomerang: {
			color: "white",
      radius: 8,
      speed: 40,
			turnspeed: 20,
			turnage: 25,
      dmg: 3,
			backdmg: 30,
			penetration: true,
      attackInterval: 250 //(msec)
		}
  },
  enemy: {
    aliveRadius: 20,
    basic: {
      spawnInterval: 500, // (msec)
      color: 350,//hue value of hsl
      minRadius: 80,
      maxRadius: 100,
      speed: 0.1,
      score: 1000
    },
    chase: {
      spawnInterval: 750, // (msec)
      color: 250,//hue value of hsl
      minRadius: 30,
      maxRadius: 60,
      speed: 4,
      score: 500
    },
		bounce: {
			spawnInterval: 1500, // (msec)
      color: 80,//hue value of hsl
      minRadius: 50,
      maxRadius: 100,
      speed: 1,
      score: 1500
		}
  }
}
//Current State
const state = {
  isGameOver: false,
  leftLife: 3,
  score: 0,
  proj: "cannon",
  launchable: true
}

const mousePoint = {
	isMouseOverInCanvas: false,
	x: 0,
  y: 0
}
const keyPress = {
  click: false,
  up: false,
  left: false,
  right: false,
  down: false,
  change: false
}
//Create Obj
const player = new Circle(canvas.width / 2, canvas.height / 2, opt.player.radius, opt.player.color)
const projectiles = {
  cannon: [],
  shotgun: [],
	gatling: [],
	boomerang: []
}
const enemies = {
  basic: [],
  chase: [],
	bounce: []
};
const enemyCall = {
	basic: null,
	chase: null,
	bounce: null
}
function createCannonProj() {
  state.launchable = false;
  setTimeout(function() {state.launchable = true}, opt.proj.cannon.attackInterval)
  const angle = Math.atan2(mousePoint.y - player.y, mousePoint.x - player.x)
  const projectile = new Cannon(
    player.x, player.y, opt.proj.cannon.radius, opt.proj.cannon.color, {
      x: Math.cos(angle) * opt.proj.cannon.speed,
      y: Math.sin(angle) * opt.proj.cannon.speed
    }, opt.proj.cannon.dmg, opt.proj.cannon.penetration
  )
  projectiles.cannon.push(projectile);
}
function createShotgunProj() {
  state.launchable = false;
  setTimeout(function() {state.launchable = true}, opt.proj.shotgun.attackInterval)
  const angle = Math.atan2(mousePoint.y - player.y, mousePoint.x - player.x)
  for (i = 0; i < opt.proj.shotgun.pellet; i++) {
    const randAngle = random.arrange(
      angle + (opt.proj.shotgun.precision / 180 * Math.PI),
      angle - (opt.proj.shotgun.precision / 180 * Math.PI)
    )
    const projectile = new Shotgun(
      player.x, player.y, opt.proj.shotgun.radius, opt.proj.shotgun.color, {
        x: Math.cos(randAngle) * opt.proj.shotgun.speed,
        y: Math.sin(randAngle) * opt.proj.shotgun.speed
      }, opt.proj.shotgun.dmg, opt.proj.shotgun.penetration
    )
    projectiles.shotgun.push(projectile);
  }
}
function createGatlingProj() {
  state.launchable = false;
  setTimeout(function() {state.launchable = true}, opt.proj.gatling.attackInterval)
  const angle = Math.atan2(mousePoint.y - player.y, mousePoint.x - player.x)
  const randAngle = random.arrange(
    angle + (opt.proj.gatling.precision / 180 * Math.PI),
    angle - (opt.proj.gatling.precision / 180 * Math.PI)
  )
  const projectile = new Gatling(
    player.x, player.y, opt.proj.gatling.radius, opt.proj.gatling.color, {
      x: Math.cos(randAngle) * opt.proj.gatling.speed,
      y: Math.sin(randAngle) * opt.proj.gatling.speed
    }, opt.proj.gatling.dmg, opt.proj.gatling.penetration
  )
  projectiles.gatling.push(projectile);
}
function createBoomerangProj() {
  state.launchable = false;
  setTimeout(function() {state.launchable = true}, opt.proj.boomerang.attackInterval)
  const projectile = new Boomerang(
    player.x, player.y, opt.proj.boomerang.radius, opt.proj.boomerang.color, {
      x: 0,
      y: 0
    }, opt.proj.boomerang.dmg, opt.proj.boomerang.penetration
  )
  projectiles.boomerang.push(projectile);
}
function createBasicEnemy() {
  enemyCall.basic = setTimeout(createBasicEnemy, opt.enemy.basic.spawnInterval);
  const radius = random.arrange(opt.enemy.basic.maxRadius, opt.enemy.basic.minRadius);
  let x;
  let y;
  random.event(
    function(){
      x = 0 - radius;
      y = Math.random() * canvas.height;
    }, function() {
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
    }, function() {
      x = Math.random() * canvas.width;
      y = 0 - radius;
    }, function() {
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
    }
  )
  const angle = Math.atan2(player.y - y, player.x - x);
  enemies.basic.push(new Enemy(x, y, radius, `hsl(${opt.enemy.basic.color}, ${random.arrange(50,80)}%, ${random.arrange(50,80)}%)`, {
    x: Math.cos(angle)
      / (radius**0.5)
      * (opt.enemy.basic.maxRadius + opt.enemy.basic.minRadius) / 2
      * opt.enemy.basic.speed,
    y: Math.sin(angle)
      / (radius**0.5)
      * (opt.enemy.basic.maxRadius + opt.enemy.basic.minRadius) / 2
      * opt.enemy.basic.speed
  }, opt.enemy.basic.score))
}
function createChaseEnemy() {
  enemyCall.chase = setTimeout(createChaseEnemy, opt.enemy.chase.spawnInterval);
  const radius = random.arrange(opt.enemy.chase.maxRadius, opt.enemy.chase.minRadius);
  let x;
  let y;
  random.event(
    function(){
      x = 0 - radius;
      y = Math.random() * canvas.height;
    }, function() {
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
    }, function() {
      x = Math.random() * canvas.width;
      y = 0 - radius;
    }, function() {
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
    }
  )
  const angle = Math.atan2(player.y - y, player.x - x);
  enemies.chase.push(new Enemy(x, y, radius, `hsl(${opt.enemy.chase.color}, ${random.arrange(50,80)}%, ${random.arrange(50,80)}%)`, {
    x: 0,
    y: 0
  }, opt.enemy.chase.score))
}
function createBounceEnemy() {
  enemyCall.bounce = setTimeout(createBounceEnemy, opt.enemy.bounce.spawnInterval);
  const radius = random.arrange(opt.enemy.bounce.maxRadius, opt.enemy.bounce.minRadius);
  let x;
  let y;
  random.event(
    function(){
      x = 0 - radius;
      y = Math.random() * canvas.height;
    }, function() {
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
    }, function() {
      x = Math.random() * canvas.width;
      y = 0 - radius;
    }, function() {
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
    }
  )
  const angle = Math.atan2(player.y - y, player.x - x);
  enemies.bounce.push(new Enemy(x, y, radius, `hsl(${opt.enemy.bounce.color}, ${random.arrange(50,80)}%, ${random.arrange(50,80)}%)`, {
    x: Math.cos(angle)
      / (radius**0.5)
      * (opt.enemy.bounce.maxRadius + opt.enemy.bounce.minRadius) / 2
      * opt.enemy.bounce.speed,
    y: Math.sin(angle)
      / (radius**0.5)
      * (opt.enemy.bounce.maxRadius + opt.enemy.bounce.minRadius) / 2
      * opt.enemy.bounce.speed
  }, opt.enemy.bounce.score))
}
//EventListener
window.addEventListener("keydown", keydownHandler);
window.addEventListener("keyup", keyupHandler);
window.addEventListener("mousemove", mousemoveHandler);
window.addEventListener("mousedown", mousedownHandler);
window.addEventListener("mouseup", mouseupHandler);
canvas.addEventListener("mouseover", mouseoverHandler);
canvas.addEventListener("mouseout", mouseoutHandler);
//key control functiona
function mousemoveHandler(e) {
	if(mousePoint.isMouseOverInCanvas === true) {
		const bodyWidth = parseFloat(window.getComputedStyle(body).width.slice(0,-2));
	const bodyHeight = parseFloat(window.getComputedStyle(body).height.slice(0,-2));
	const canvasSide = 0.8 * smaller(bodyWidth, bodyHeight);
		mousePoint.x = ((e.clientX / bodyWidth) - (0.5 - (canvasSide / (2 * bodyWidth)))) * bodyWidth * canvas.width / canvasSide
		mousePoint.y = ((e.clientY / bodyHeight) - (0.5 - (canvasSide / (2 * bodyHeight)))) * bodyHeight * canvas.height / canvasSide
	}
}
function mouseoverHandler() {
	mousePoint.isMouseOverInCanvas = true;
}
function mouseoutHandler() {
	mousePoint.isMouseOverInCanvas = false;
}
function mousedownHandler() {
  keyPress.click = true;
}
function mouseupHandler() {
  keyPress.click = false;
}
function keydownHandler(e) {
  if(e.code === "KeyW") {
    keyPress.up = true;
  } else if (e.code === "KeyA") {
    keyPress.left = true;
  } else if (e.code === "KeyS") {
    keyPress.down = true;
  } else if (e.code === "KeyD") {
    keyPress.right = true;
  } else if (e.code === "KeyE") {
    keyPress.change = true;
    changeProj();
  }
}
function keyupHandler(e) {
  if(e.code === "KeyW") {
    keyPress.up = false;
  } else if (e.code === "KeyA") {
    keyPress.left = false;
  } else if (e.code === "KeyS") {
    keyPress.down = false;
  } else if (e.code === "KeyD") {
    keyPress.right = false;
  } else if (e.code === "KeyE") {
    keyPress.change = false;
  }
}
//object update
function playerUpdate() {
  if (keyPress.up === true && player.y > player.radius) {
    player.y -= opt.player.speed;
  }
  if (keyPress.left === true && player.x > player.radius) {
    player.x -= opt.player.speed;
  }
  if (keyPress.right === true && player.x < canvas.width - player.radius) {
    player.x += opt.player.speed;
  }
  if (keyPress.down === true && player.y < canvas.height - player.radius) {
    player.y += opt.player.speed;
  }
  player.draw();
}
function projectilesUpdate() {
  for(key in projectiles) {
    projectiles[key].forEach(function(proj, projIndex) {
      proj.draw();
      proj.move();
      if (
        proj.x < 0 - proj.radius ||
        proj.x > canvas.width + proj.radius ||
        proj.y < 0 - proj.radius ||
        proj.y > canvas.height + proj.radius
      ) {
        projectiles[key].splice(projIndex, 1);
      }
    })
  }
}
function boomerangUpdate() {
	projectiles.boomerang.forEach(function(boo,booIndex) {
		const dist = Math.hypot(player.x - boo.x, player.y - boo.y)
		if(dist <= player.radius + boo.radius && boo.age >= opt.proj.boomerang.turnage) {
			 projectiles.boomerang.splice(booIndex, 1);
		}
		if (
				boo.age >= opt.proj.boomerang.turnage ||
				boo.x < 0 - boo.radius + 100 ||
				boo.x > canvas.width + boo.radius - 100 ||
				boo.y < 0 - boo.radius + 100 ||
				boo.y > canvas.height + boo.radius - 100
			) {
			const angleWithPlayer = Math.atan2(player.y - boo.y, player.x - boo.x);
			boo.dmg = opt.proj.boomerang.backdmg;
			boo.velocity.x = Math.cos(angleWithPlayer) * opt.proj.boomerang.turnspeed;
			boo.velocity.y = Math.sin(angleWithPlayer) * opt.proj.boomerang.turnspeed;
		} else if(boo.age < opt.proj.boomerang.turnage) {
			const angleWithMouse = Math.atan2(mousePoint.y - player.y, mousePoint.x - player.x)
			boo.velocity.x = Math.cos(angleWithMouse) * opt.proj.boomerang.speed;
			boo.velocity.y = Math.sin(angleWithMouse) * opt.proj.boomerang.speed;
		}
		
	})
}
function changeProj() {
  const length = opt.proj.list.length;
  const c = opt.proj.list.indexOf(state.proj);
  state.proj = opt.proj.list[parseInt((c + 1) % length)]
}
function enemiesUpdate() {
  for(enemyKey in enemies){
    enemies[enemyKey].forEach(function (enemy, enemyIndex) {
      enemy.draw();
      enemy.move();
      if(enemy.radius <= opt.enemy.aliveRadius) {
        addScore(enemy.score)
        enemies[enemyKey].splice(enemyIndex, 1);
      }
      if (
        enemy.x < 0 - enemy.radius ||
        enemy.x > canvas.width + enemy.radius ||
        enemy.y < 0 - enemy.radius ||
        enemy.y > canvas.height + enemy.radius
      ) {
        enemies[enemyKey].splice(enemyIndex, 1);
      }
      //touch player
      if(state.isGameOver === false) {
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist <= player.radius + enemy.radius) {
          enemies[enemyKey].splice(enemyIndex, 1);
          state.leftLife -= 1;
        }

      }
      //touch proj
      for(projKey in projectiles) {
        projectiles[projKey].forEach(function (proj, projIndex) {
          const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y)
          if(dist <= proj.radius + enemy.radius) {
						if(proj.penetration !== true) {
            	projectiles[projKey].splice(projIndex, 1);
						}
            gsap.to (enemy, {
              radius: enemy.radius - proj.dmg
            })
          }

        })
      }
    })
  }
}
function chaseUpdate() {
  enemies.chase.forEach(function(chase, chaseIndex) {
    const angle = Math.atan2(player.y - chase.y, player.x - chase.x);
    chase.velocity.x = Math.cos(angle) * opt.enemy.chase.speed;
    chase.velocity.y = Math.sin(angle) * opt.enemy.chase.speed;
  })
}
function bounceUpdate() {
  enemies.bounce.forEach(function(bounce, bounceIndex) {
    const angle = Math.atan2(player.y - bounce.y, player.x - bounce.x);
    if(
			bounce.age > 100 &&
			(bounce.x <= bounce.radius + opt.enemy.bounce.speed ||
			bounce.x >= canvas.width - bounce.radius  - opt.enemy.bounce.speed)
		) {
			bounce.velocity.x *= -1	
		}
		if(
			bounce.age > 100 &&
			(bounce.y <= bounce.radius + opt.enemy.bounce.speed ||
			bounce.y >= canvas.height - bounce.radius  - opt.enemy.bounce.speed)
		) {
			bounce.velocity.y *= -1
		}
  })
}
//gameState update
function drawState() {
  const score = document.querySelector("#score");
  const life = document.querySelector("#life");
  score.innerText = `score : ${state.score}`;
  life.innerText = `life : ${state.leftLife}`;
}
function addScore(score) {
  state.score += parseInt(score);
}
//add object bundle
function startEnemy() {
  createBasicEnemy();
  createChaseEnemy();
	createBounceEnemy();
}
function makeProj() {
  if(state.launchable === true && keyPress.click === true) {
    if(state.proj === "cannon") {
      createCannonProj();
    } else if (state.proj === "shotgun") {
      createShotgunProj();
    } else if (state.proj === "gatling") {
      createGatlingProj();
    } else if (state.proj === "boomerang") {
			createBoomerangProj();
		}
  }
}
//main animationLoof
function animationLoof() {
  let animate = requestAnimationFrame(animationLoof);
  if (state.leftLife <= 0) {
    state.isGameOver = true;
  }
  if (state.isGameOver === true) {
    cancelAnimationFrame(animate);
    init();
  }
	addScore(1)
  drawState();
  ctx.fillStyle = `rgba(0, 0, 0, 0.1)`
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  playerUpdate();
  makeProj();
  projectilesUpdate();
	boomerangUpdate();
  enemiesUpdate();
  chaseUpdate();
	bounceUpdate();
}
function gameStart() {
  const board = document.querySelector(".board");
  state.leftLife = opt.player.life;
  state.isGameOver = false;
  state.score = 0;
	state.proj = "gatling";
  for(key in projectiles) {
    while(projectiles[key].length > 0) {
      projectiles[key].pop()
    }
  }
  for(key in enemies) {
    while(enemies[key].length > 0) {
      enemies[key].pop()
    }
  }
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  board.classList.add("displayNone");
  startEnemy();
  animationLoof();
}
function init() {
  const board = document.querySelector(".board");
  const points = board.querySelector("#points");
	for(key in enemyCall) {
		clearTimeout(enemyCall[key]);
	}
  window.clearTimeout();
  points.innerText = state.score;
  board.classList.remove("displayNone");
}

//display control
function displayControl() {
  const board = document.querySelector(".board");
  const gameStartBtn = board.querySelector("#gameStart");
  gameStartBtn.addEventListener("click", gameStart)
}

displayControl();