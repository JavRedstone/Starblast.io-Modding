// Earth and the Moon

/*
  Example of incorporating circular motion into asteroids
  - The Earth is the slow moving asteroid that orbits around the center
  - The Moon is the fast moving asteroid that orbits around the Earth
  
  Enjoy!
*/

this.options = {
  root_mode: "survival",
  map_size: 30,
  custom_map: "" //If you don't want the Earth and Moon to collide into anything, and possibly breaking.
};

// Distance
const d1 = 100;
const d2 = 20;

// Angle
var a1 = 0;
var a2 = 0;

// Amount added to the angle to create the change in speed / period of motion
const m1 = 0.001;
const m2 = 0.1;

// Orbit function
const orbit = (d, a, m, asteroid, cx, cy) => {
  a += m;
  
  var x = d * Math.cos(a) + cx;
  var y = d * Math.sin(a) + cy;
  
  asteroid.set({
    x: x,
    y: y
  });
  
  return a;
};

this.tick = function(game) {
  // When the game first starts
  if (game.step === 0) {
    // Earth
    game.addAsteroid({
      x: d1,
      y: 0,
      size: 50
    });
    
    // Moon
    game.addAsteroid({
      x: d1 + d2,
      y: 0,
      size: 25
    });
  }
  // Orbit the asteroids
  a1 = orbit(d1, a1, m1, game.asteroids[0], 0, 0);
  a2 = orbit(d2, a2, m2, game.asteroids[1], game.asteroids[0].x, game.asteroids[0].y);
}
