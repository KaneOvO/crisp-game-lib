title = "Prototype 2";

description = `
  [Click] Fire
`;

characters = [];

options = {
  viewSize: { x: 100, y: 150 },
};

let cannon;
let cannonSpeed = 0.8;

let bullets = [];

function update() {
  // The init function running at startup
  if (!ticks) {
    // Initialize the cannon at the bottom third of the screen
    cannon = { pos: vec(50, (150 * 7) / 8), speed: cannonSpeed };
  }

  // Move the cannon horizontally
  cannon.pos.x += cannon.speed;

  // Reverse direction when hitting screen bounds
  if (cannon.pos.x > 100 || cannon.pos.x < 0) {
    cannon.speed *= -1;
  }

  // Draw the cannon
  color("black");
  box(cannon.pos, 10, 10);
  box(cannon.pos.x, cannon.pos.y - 5, 3, 5);


  // Fire bullets
  if (input.isJustPressed) {
    const bullet = {
      pos: vec(cannon.pos.x, cannon.pos.y - 8), // 初始位置在炮台上方
      speed: vec(0, -2) // 炮弹速度向上
    };
    bullets.push(bullet); // 将炮弹加入数组
  }

  bullets.forEach(bullet => {
    bullet.pos.add(bullet.speed); // 更新炮弹位置
    // 如果炮弹飞出屏幕，则移除
    if (bullet.pos.y < 0) {
      bullets.splice(bullets.indexOf(bullet), 1);
    }
  });

  // 绘制所有炮弹
  color("red");
  bullets.forEach(bullet => {
    box(bullet.pos, 3, 3); // 绘制炮弹
  });
}
