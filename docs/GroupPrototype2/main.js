title = "Tap Boss";

description = `
   [Tap]
 Deal damge 
to the enemy
`;

characters = [`
 r r 
rrrrr
 rrr 
  r   
`];

options = {
  viewSize: { x: 100, y: 150 },
  isPlayingBgm: true,
  theme: `pixel`,
  //seed: rndi(1,89),
  isReplayEnabled: true,
  isCapturing: true,
  isCapturingGameCanvasOnly: true,
  captureCanvasScale: 2,
  isShowingScore: false,
  isShowingTime: false,
};
/**
 * @typedef { object } Boss
 * @property { Vector } pos
 * @property { number } hp
 * @property { number } maxHp
 * @property { bool } isTakenDamage
 */
/**
 * @type {Boss} boss
 */
let boss;

/**
 * @typedef { object } player
 * @property { number } hp
 */
/**
 * @type {player} player
 */
let player;

let timer = 0;

let gameTime = 3000;

let bossShake = {
  duration: 0,
  intensity: 2,
};

function update() {
  if (!ticks) {
    Initialize();
  }
  if (player.hp <= 0) {
    end();
  }
  let ts = drawTime(gameTime, 3, 10);
  if (boss.hp <= 0) {
    color("black");
    text("You Win", 30, 55);
    text("Your spend:", 20, 65);
    text(ts, 30, 75);
    text("Go to Next Level", 5, 85);
    // 检查玩家是否点击来重置游戏
    if (input.isJustPressed) {
      // 重置游戏状态
      boss.maxHp *= 2;
      boss.hp = boss.maxHp;
      player.hp = 100;
      time = 0;
      timer = 0;
    }
    return; // 早期返回，不运行游戏的其他更新逻辑
  }

  timer++;
  gameTime--;
  color("red");
  text(`Boss HP:${boss.hp}`, 20, 10);
  let bossRatio = boss.hp / boss.maxHp;
  rect(10, 20, 80 * bossRatio, 5);
  drawBoss(boss.pos);

  if (timer > 0 && timer % 60 == 0) {
    player.hp -= 1;
  }

  color("cyan");
  text(`Your HP:${player.hp}`, 20, 150 - 20);
  let playerHpRatio = player.hp / 100;
  rect(5, 150 - 10, (player.hp * 9) / 10, 5);

  if (input.isJustPressed) {
    boss.isTakenDamage = true;
    boss.hp -= 1;
    color(`yellow`);
    particle(input.pos, 10, 1, 0, PI * 2);
    play("coin");
    bossShake.duration = 30; // 抖动持续的帧数
  }

  if (bossShake.duration > 0) {
    bossShake.duration--;
  }
  boss.isTakenDamage = bossShake.duration <= 0 ? false : true;
}

let isShaking = false;
let shakeTimer = 0;
let previousHp;

function drawBoss(pos) {
  if (!previousHp && boss && boss.hp) {
    previousHp = boss.hp;
  }
  color("light_red");
  if (boss && boss.hp < previousHp && !isShaking) {
    isShaking = true;
    shakeTimer = bossShake.duration; // Duration of shake in seconds
  }
  if (isShaking) {
    // Apply shake effect
    const shakeIntensity = 3;
    const shakeX = pos.x + (Math.random() - 0.5) * shakeIntensity;
    const shakeY = pos.y + (Math.random() - 0.5) * shakeIntensity;
    drawArcs(shakeX, shakeY);

    // Update shake timer
    shakeTimer -= 1;
    if (shakeTimer <= 0) {
      isShaking = false;
    }
  } else {
    drawArcs(pos.x, pos.y);
  }

  if (boss) {
    previousHp = boss.hp;
  }

  drawHeart();
}

function drawArcs(x, y) {
  arc(x * 0.25, y * 0.25, 10, 5, PI, PI / 2);
  arc(x * 0.75, y * 0.25, 10, 5, 0, PI / 2);
  if (!boss.isTakenDamage) {
    arc(x * 0.5, y * 0.5, 10, 5, 0, PI);
  } else {
    arc(x * 0.5, y * 0.5, 10, 5, PI, PI * 2);
  }
}

function Initialize() {
  boss = {
    pos: vec(100, 150),
    maxHp: 25,
    isTakenDamage: false,
  };
  boss.hp = boss.maxHp;

  player = {
    hp: 100,
  };
}

function drawTime(time, x, y) {
  let t = Math.floor((time * 100) / 50);
  if (t >= 10 * 60 * 100) {
    t = 10 * 60 * 100 - 1;
  }
  const ts =
    getPaddedNumber(Math.floor(t / 6000), 1) +
    "'" +
    getPaddedNumber(Math.floor((t % 6000) / 100), 2) +
    '"' +
    getPaddedNumber(Math.floor(t % 100), 2);
  // color("red");
  // text(ts, x, y);

  return ts;
}

function getPaddedNumber(v, digit) {
  return ("0000" + v).slice(-digit);
}

function drawHeart(){
  color("red");
  char("a",vec(50,100));
}