// Estimate Pi In Starblast

/*
  Estimate_PI: https://github.com/JavRedstone/Small-Project-Repos/tree/main/Estimate_PI is now in starblast!
  
  Enjoy!
*/

const map_size = 30;

this.options = {
  root_mode: "survival",
  map_size: map_size,
  custom_map: ""
};

this.tick = function(game) {
  if (game.step % 50 === 0) {
    for (var asteroid of game.asteroids) asteroid.set({kill: true});
    // estimate_pi function
    const estimate_pi = (n) => {
        num_point_circle = 0;
        num_point_total = 0;
        for (let i = 0; i < n; i++) {
            let x = Math.random();
            let y = Math.random();
            game.addAsteroid({
              x: x * map_size * 10 / 2,
              y: y * map_size * 10 / 2,
              size: 10
            });
            let distance = Math.pow(x, 2) + Math.pow(y, 2);
            if (distance <= 1) num_point_circle++;
            num_point_total++;
        }
        return 4 * num_point_circle / num_point_total;
    };
    var result = estimate_pi(300);
    for (var ship of game.ships) ship.instructorSays(`Result of estimate_pi: ${result}`);
  }
}
