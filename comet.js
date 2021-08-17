// Comets in starblast

/* 
  This project was to create a simple comet (that never dies)
  Beware of changing the values as you might crash your mod editor / chrome / 
  computer if you are not careful. Close the tab entirely when you find that the
  asteroids are not destorying themselves anymore and that it is getting laggy
  on the the end of the mod editor.
  
  Enjoy!
*/

this.options = {
  root_mode: "survival",
  map_size: 30,
  custom_map: ""
};

this.tick = function(game) {
  if (game.step === 0) {
    game.addAsteroid({
      x: 0,
      y: 0,
      vx: 0.5,
      vy: 0,
      size: 25
    });
  }
  
  if (game.step % 5 === 0) {
    for (let i = 1; i < game.asteroids.length; i++) {
      var asteroid = game.asteroids[i];
      asteroid.set({kill: true});
    }
    game.addAsteroid({
      x: game.asteroids[0].x,
      y: game.asteroids[0].y,
      size: 25
    });
  }
  
  game.asteroids[0].set({vx: 0.5, vy: 0})
}
