title = "Prototype 2";

description = `
  [Click] Fire
`;

characters = [];

options = {
  viewSize: { x: 100, y: 150 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  theme: `pixel`,
  isShowingScore: false,
  isShowingTime: false,
};

let cannon;
const cannonSpeed = 1.2;

let bullets = [];
let bulletCount = 10; // 初始子弹数为10发

let discs = []; // 存储所有飞盘
let discLauncherCooldown = 180; // 发射器冷却时间，以帧为单位（这里以60FPS计算，即3秒）
let discSpeedValue = 0.5;
const upGradeTime = 1200;
let isGameOver = false;

let gameScore = 0;

let hitDiscCount = 0; // 玩家击中蓝色飞盘的数量
const specialDiscSpeedValue = 1; // 特殊飞盘的速度
let specialDiscGenerated = false; // 是否已经生成了特殊飞盘
let specialDiscExitTime = 0; // 记录特殊飞盘离开屏幕的时间

let scorePopups = [];

function update() {
  // The init function running at startup
  if (!ticks) {
    // Initialize the cannon at the bottom third of the screen
    cannon = { pos: vec(50, (150 * 7) / 8), speed: cannonSpeed };
  }

  if (isGameOver) {
    // 如果游戏结束，显示提示信息
    color("black");
    text("Game Over", 25, 55);
    text("Your Score:" + gameScore, 15, 65);
    text("Click to Restart", 5, 75);
    // 检查玩家是否点击来重置游戏
    if (input.isJustPressed) {
      // 重置游戏状态
      bulletCount = 10; // 子弹数重置为10
      bullets = []; // 清空子弹数组
      discs = []; // 清空飞盘数组
      isGameOver = false; // 游戏结束标志设为false
      gameScore = 0;
      hitDiscCount = 0;
      specialDiscGenerated = false;
      specialDiscExitTime = 0;
      discSpeedValue = 0.5;
      ticks = 0; // 重置帧数
      // 这里可以添加其他需要重置的游戏状态
    }
    return; // 早期返回，不运行游戏的其他更新逻辑
  }

  // Move the cannon horizontally
  cannon.pos.x += cannon.speed;

  // Reverse direction when hitting screen bounds
  if (cannon.pos.x > 100 || cannon.pos.x < 0) {
    cannon.speed *= -1;
  }

  // Draw the cannon
  color("light_purple");
  box(cannon.pos, 10, 10);
  box(cannon.pos.x, cannon.pos.y - 5, 3, 5);

  color("black");
  text(`Bullets:${bulletCount}`, 3, 3);

  color("black");
  text(`Score:${gameScore}`, 3, 10);

  if (bulletCount === 0 && bullets.length === 0) {
    // 如果没有子弹了，设置游戏结束标志
    isGameOver = true;
  }

  // Fire bullets
  if (input.isJustPressed && bulletCount > 0 && !isGameOver) {
    const bullet = {
      pos: vec(cannon.pos.x, cannon.pos.y - 8), // 初始位置在炮台上方
      speed: vec(0, -2), // 炮弹速度向上
    };
    bullets.push(bullet); // 将炮弹加入数组
    play("click"); // 播放音效
    bulletCount--; // 子弹数减少
  }

  //更新子弹位置并检测与飞盘的碰撞
  bullets.forEach((bullet, bulletIndex) => {
    bullet.pos.add(bullet.speed); // 更新炮弹位置
    // 如果炮弹飞出屏幕，则移除
    if (bullet.pos.y < 0) {
      bullets.splice(bulletIndex, 1);
    } else {
      // 检查每个飞盘是否与当前子弹相撞
      discs.forEach((disc, discIndex) => {
        if (
          bullet.pos.x >= disc.pos.x - 7 &&
          bullet.pos.x <= disc.pos.x + 7 &&
          bullet.pos.y >= disc.pos.y - 7 &&
          bullet.pos.y <= disc.pos.y + 7
        ) {
          if (disc.color === "blue") {
            hitDiscCount++; // 增加击中蓝色飞盘的计数
            gameScore += 5;
            bulletCount++; // 子弹数增加
          }
          if (disc.color === "green") {
            gameScore += 10;
            specialDiscExitTime = ticks;
            if (bulletCount < 5) {
              bulletCount += 5;
            } else {
              bulletCount = 10;
            }
          }
          // 碰撞！
          color("yellow"); // 粒子效果的颜色
          particle(bullet.pos); // 在子弹位置生成粒子效果
          play("hit"); // 播放爆炸音效
          discs.splice(discIndex, 1); // 移除击中的飞盘
          bullets.splice(bulletIndex, 1); // 移除击中飞盘的子弹
          let scorePopup = {
            pos: vec(disc.pos.x, disc.pos.y), // 分数显示的位置
            score: disc.color === "blue" ? "+5" : "+10", // 根据飞盘颜色决定分数
            life: 30, // 分数显示的持续帧数
          };
          scorePopups.push(scorePopup);

          // 因为我们移除了一个飞盘，后面的索引会发生变化
          // 所以我们减少 discIndex 和 bulletIndex
          discIndex--;
          bulletIndex--;
        }
      });
    }
  });

  // 绘制所有炮弹
  color("red");
  bullets.forEach((bullet) => {
    box(bullet.pos, 3, 3); // 绘制炮弹
  });

  // 每三秒发射一个飞盘
  if (ticks % discLauncherCooldown === 0) {
    const angle = rnd(Math.PI / 4, (3 * Math.PI) / 4);
    const discSpeed = vec(
      Math.cos(angle) * discSpeedValue,
      Math.sin(angle) * discSpeedValue
    );
    const disc = {
      pos: vec(rnd(0, 100), 10), // 飞盘在顶部随机位置生成
      speed: discSpeed, // 飞盘的速度和方向随机
      color: "blue", // 飞盘的颜色为蓝色
    };
    discs.push(disc);
  }

  //更新飞盘位置
  discs.forEach((disc, index) => {
    disc.pos.add(disc.speed); // 移动飞盘
    // 检查飞盘是否碰到左右边界
    if (disc.pos.x < 0 || disc.pos.x > 100) {
      disc.speed.x *= -1; // 水平速度反向
    }
    // 检查飞盘是否触碰到屏幕底部
    if (disc.color === "blue") {
      if (disc.pos.y > 150) {
        isGameOver = true; // 触碰到底部，游戏结束
      } else {
        // 绘制飞盘
        color(disc.color);
        arc(disc.pos, 5);
      }
    } else if (disc.color === "green") {
      // 绘制特殊飞盘
      if (disc.pos.y > 150) {
        discs.splice(index, 1);
        specialDiscExitTime = ticks;
      } else {
        color(disc.color);
        arc(disc.pos, 5);
      }
    }
  });

  if (hitDiscCount % 10 == 0 && hitDiscCount > 0 && !specialDiscGenerated) {
    specialDiscGenerated = true;
    generateSpecialDisc();
  }

  for (let i = scorePopups.length - 1; i >= 0; i--) {
    let popup = scorePopups[i];
    popup.life--;
    if (popup.life <= 0) {
      scorePopups.splice(i, 1); // 生命周期结束则移除
    } else {
      // 显示分数
      color("black");
      text(popup.score, popup.pos.x, popup.pos.y);
      popup.pos.y--; // 让分数上浮效果
    }
  }

  if (
    specialDiscGenerated &&
    specialDiscExitTime > 0 &&
    ticks - specialDiscExitTime > 600
  ) {
    // 假设游戏运行在60FPS
    specialDiscGenerated = false;
    specialDiscExitTime = 0; // 重置计时器
  }

  if (ticks % upGradeTime === 0 && !isGameOver && ticks > 0) {
    if (discSpeedValue < 1.5) {
      discSpeedValue += 0.1;
    }
  }
}

// 生成特殊飞盘的函数
function generateSpecialDisc() {
  const angle = rnd(Math.PI / 4, (3 * Math.PI) / 4);
  const discSpeed = vec(
    Math.cos(angle) * specialDiscSpeedValue,
    Math.sin(angle) * specialDiscSpeedValue
  );
  const specialDisc = {
    pos: vec(rnd(0, 100), 10),
    speed: discSpeed,
    color: "green", // 特殊飞盘的颜色
  };
  discs.push(specialDisc);
}
