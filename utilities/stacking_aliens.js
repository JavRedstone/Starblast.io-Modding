// Stacking Aliens

/*
  This is the ultimate alien stack --- it stacks a certain number of aliens on top of each other
*/

this.options = {
  root_mode: "survival",
  map_size: 30
};

const amount = 10;

this.tick = function(game) {
  // So you can click the link lol
  if (game.step > 600) {
    if (game.aliens.length < amount) game.addAlien({code: 10, level: 0, crystal_drop: 20});
    for (let i = 0; i < game.aliens.length; i++) {
      var alien = game.aliens[i];
      if (i > 0) alien.set({x: game.aliens[0].x, y: game.aliens[0].y, vx: 0, vy: 0});
      alien.set({rate: 10, damage: 15, laser_speed: 240});
    }
  }
}
