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

const x = 3;
const y = 3;

this.tick = function(game) {
  if (game.step % 150 === 0){
    for (var ship of game.ships) {
      for (let i = 0; i < 100; i+=y) {
        for (let j = 0; j < 100; j+=x) {
          var fill_value = ["#000","#fff","#fff"];
          ship.setUIComponent({
            id: `${[i, j]}`,
            position: [j,i,x,y],
            clickable: false,
            visible: true,
            components: [
              { type: "box", position: [0,0,100,100], fill: fill_value[Math.round(Math.random() * (fill_value.length - 1))]},
            ]
          });
        }
      }
    }
  }
}
