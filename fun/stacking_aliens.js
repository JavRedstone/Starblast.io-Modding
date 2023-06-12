// Stacking Aliens

/*
  This is the ultimate alien stack --- it stacks a certain number of aliens on top of each other
*/

this.options = {
  root_mode: "team",
  map_size: 60,
  crystal_value: 6,
  asteroids_strength: 0.1,
  station_crystal_capacity: 0.75,
  station_size: 2,
  station_regeneration: 1.5,
  all_ships_can_dock: true,
  friendly_colors: 1
};

const amount = 20;



this.tick = function(game) {
  if (game.step > 500 && game.step % 5 === 0) {
    var arr = [10, 11, 14, 16, 17, 18];
    if (game.aliens.length < amount) game.addAlien({code: arr[Math.floor(Math.random() * arr.length)], level: Math.floor(Math.random() * 3), crystal_drop: 200});
    for (let i = 0; i < game.aliens.length; i++) {
      var alien = game.aliens[i];
      if (i > 0) alien.set({x: game.aliens[0].x, y: game.aliens[0].y, vx: 0, vy: 0});
      alien.set({rate: 10, damage: 20, laser_speed: 250});
    }
    
    if (game.step % 1200 === 0) {
      game.aliens[0].set({x:(Math.round(Math.random()) == 0 ? 1 : -1) * Math.random() * 60 * 5, y: (Math.round(Math.random()) == 0 ? 1 : -1) * Math.random() * 60 * 5});
    }
  }
}
