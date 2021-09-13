// Starblast invasion wave 5 simulation

this.options = {
  map_size: 20,
  custom_map: "",
  // Just to get ahead a little bit
  starting_ship: 704
};

var asteroid_rate = 15;
var asteroid_counter = 0;
var asteroid_amount = 15;
var asteroid_done;

var alien_probability = [
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [10, 2],
  [16, 1],
  [16, 1],
  [16, 1],
  [16, 1],
  [11, 2],
  [11, 2],
  [11, 2],
  [11, 2],
  [14, 0],
  [14, 0],
  [14, 0],
  [14, 0],
];
var alien_rate = 200;
var alien_counter = 0;
var alien_amount = 50;
var alien_done;

this.tick = function(game) {
  if (game.step === 0) echo("Wave 5 has started...");
  if (game.step == 500) {
    echo("Preparing to spawn asteroids...");
    echo("Preparing to spawn aliens...");
  }
  if (game.step > 500 & game.step % asteroid_rate === 0) {
    if (asteroid_counter < asteroid_amount) {
      game.addAsteroid({
        x: Math.random() * game.options.map_size * (Math.round(Math.random()) === 0 ? -1 : 1),
        y: Math.random() * game.options.map_size * (Math.round(Math.random()) === 0 ? -1 : 1),
        size: 25 + Math.random() * 25
      });
      asteroid_counter++;
      echo(`Asteroid [${asteroid_counter}] spawned.`);
    }
    else if (!asteroid_done) {
      asteroid_done = game.step;
      echo("Asteroid spawn finished.");
    }
  }
  if (game.step > 500 & game.step % alien_rate === 0) {
    if (alien_counter < alien_amount) {
      var alien = alien_probability[Math.round(Math.random() * alien_probability.length - 1)];
      game.addAlien({
        x: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
        y: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
        code: alien[0],
        level: alien[1],
        crystal_drop: 10
      });
      alien_counter++;
      echo(`Alien [${alien_counter}] spawned.`);
    }
    else if (!alien_done) {
      for(let i = 0; i < 2; i++) {
        game.addAlien({
          x: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
          y: Math.random() * game.options.map_size * 5 * (Math.round(Math.random()) === 0 ? -1 : 1),
          code: 15,
          level: 0,
          crystal_drop: 25,
          weapon_drop: 12
        });
        echo(`Hirsute [${i + 1}] spawned.`);
      }
      alien_done = game.step;
      echo("Alien spawn finished.");
    }
  }
}

this.event = function(event, game) {
  echo(`Event [${event.name}]`);
  switch(event.name) {
    case "alien_destroyed":
      var alien = event.alien;
      var amount = 0;
      var level = 0;
      if (alien.code == 11 && alien.level == 2) {
        amount = 2;
        level = 1;
      }
      else if (alien.code == 10 && alien.level == 2) {
        amount = 4;
        level = 0;
      }
      else if (alien.code == 16 && alien.level == 1) {
        amount = 4;
        level = 0;
      }
      for (let i = 0; i < amount; i++) {
        game.addAlien({
           x: alien.x,
           y: alien.y,
           code: alien.code,
           level: level
        });
        echo(`Killed Alien [${i + 1}] spawned.`);
      }
  }
}
