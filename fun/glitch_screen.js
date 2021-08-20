// Glitch Screen

/* 
  This one is something that can hurt your eyes and impede your gameplay so play
  with caution. It's a surprise so you have to run it yourself to know!
  
  Enjoy!
*/

this.options = {
  root_mode: "survival",
  map_size: 30
};

const x = 5;
const y = 5;

const opacity = 5;

this.tick = function(game) {
  for (var ship of game.ships) {
    if (!ship.custom.ready){
      ship.custom.ready = true;
      for (let i = 0; i < 100; i+=y) {
        for (let j = 0; j < 100; j+=x) {
          var fill_random = [`#f00${opacity}`, `#00f${opacity}`, `#ff0${opacity}`, `#0ff${opacity}`, `#fff${opacity}`];
          var fill_value = fill_random[Math.round(Math.random() * (fill_random.length - 1))];
          ship.setUIComponent({
            id: `${[i, j]}`,
            position: [j,i,x,y],
            clickable: false,
            visible: true,
            components: [
              { type: "box", position: [0,0,100,100], fill: fill_value},
            ]
          });
        }
      }
    }
  }
};
