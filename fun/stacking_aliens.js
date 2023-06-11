// Stacking Aliens

/*
  This is the ultimate alien stack --- it stacks a certain number of aliens on top of each other
*/

this.options = {
  root_mode: "team",
  map_size: 60,
  crystal_value: 8,
  asteroids_strength: 0.1,
  station_crystal_capacity: 0.1,
  station_size: 5,
  station_regeneration: 2,
  all_ships_can_dock: true,
  friendly_colors: 2
};

const amount = 10;

this.tick = function(game) {
  // So you can click the link lol
  if (game.step > 500) {
    if (game.aliens.length < amount) game.addAlien({code: 10, level: 0, crystal_drop: 20});
    for (let i = 0; i < game.aliens.length; i++) {
      var alien = game.aliens[i];
      if (i > 0) alien.set({x: game.aliens[0].x, y: game.aliens[0].y, vx: 0, vy: 0});
      alien.set({rate: 10, damage: 15, laser_speed: 240});
    }
    
    if (game.step % 1800 === 0) {
      game.aliens[0].set({x:(Math.round(Math.random()) == 0 ? 1 : -1) * Math.random() * 60 * 5, y: (Math.round(Math.random()) == 0 ? 1 : -1) * Math.random() * 60 * 5});
    }
  }
}
