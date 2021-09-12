// Starblast invasion wave 4 simulation

this.options = {
  map_size: 20,
  custom_map: "",
  // Just to get ahead a little bit
  starting_ship: 704
};

var asteroid_rate = 15;
var asteroid_counter = 0;
var asteroid_amount = 100;
var asteroid_done;

var alien_rate = 25;
var alien_counter = 0;
var alien_amount = 100;
var alien_done;

this.tick = function(game) {
  if (game.step === 0) echo("Wave 4 has started...");
  if (game.step == 500) echo("Preparing to spawn asteroids...");
  if (game.step > 500 & game.step % asteroid_rate === 0) {
    if (asteroid_counter < asteroid_amount) {
      game.addAsteroid({
        x: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
        y: -game.options.map_size * 5,
        vy: -(1 + Math.random() / 2),
        size: 20 + Math.random() * 20
      });
      asteroid_counter++;
      echo(`Asteroid [${asteroid_counter}] spawned.`);
    }
    else if (!asteroid_done) {
      asteroid_done = game.step;
      echo("Asteroid spawn finished.");
    }
  }
  if (game.step - asteroid_done == 500) echo("Preparing to spawn aliens...");
  if (game.step - asteroid_done > 500 & game.step % alien_rate === 0) {
    if (alien_counter < alien_amount) {
      game.addAlien({
        x: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
        y: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
        code: 16,
        crystal_drop: 10
      });
      alien_counter++;
      echo(`Alien [${alien_counter}] spawned.`);
    }
    else if (!alien_done) {
      alien_done = game.step;
      echo("Alien spawn finished.");
    }
  }
  if(alien_done && game.aliens.length === 0) echo("Wave 4 finished.");
}
