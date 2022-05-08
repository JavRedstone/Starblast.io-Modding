// Windows Blue Screen

/*
  Blue screen! :(
*/

this.options = {
  root_mode: 'survival',
  map_size: 30
};

const NUM_SQUARES = 10;

let components = [
  { type: 'box', position: [0,0,100,100], fill: '#00A4EF' },
  { type: 'text', position: [10,10,30,30], align: 'left', color: '#fff', value: ':(' },
  { type: 'text', position: [10,40,50,5], align: 'left', value: "Your PC ran into an issue and needs to restart. We're" },
  { type: 'text', position: [10,45,50,5], align: 'left', value: "just collecting some error info, then we'll restart for" },
  { type: 'text', position: [10,50,50,5], align: 'left', value: 'you.' },
  { type: 'box', position: [10,70,10,18], fill: '#fff' },
  { type: 'text', position: [22.5,70,40,5], align: 'left', value: 'For more information on this issue, please visit https://windows.com/stopcode' },
  { type: 'text', position: [22.5,80,20,5], align: 'left', value: 'If you call a support person, give them this info:' },
  { type: 'text', position: [22.5,82.5,15,5], align: 'left', value: 'Stop code: CRITICAL_PROCESS_DIED' },
];

this.tick = function() {
  if (game.step % 100 === 0) {
    game.ships.forEach(
      (ship) => {
        if (!ship.custom.blueScreenPercent) {
          ship.custom.blueScreenPercent = 0;
        }
        if (!ship.custom.components) {
          ship.custom.components = [...components];
        }
        if (!ship.custom.genQR) {
          for (let i = 0; i < NUM_SQUARES; i++) {
            for (let j = 0; j < NUM_SQUARES; j++) {
              let randNum = Math.round(Math.random());
              ship.custom.components.push(
                { type: 'box', position: [10 + i * 10 / NUM_SQUARES,70 + j * 18 / NUM_SQUARES,10 / NUM_SQUARES,18 / NUM_SQUARES], fill: randNum == 0 ? '#fff' : '#00A4EF' }
              );
            }
          }
          ship.custom.genQR = true;
        }
        if (ship.custom.blueScreenPercent < 100) {
          if (ship.custom.blueScreenPercent > 0) {
            let index = ship.custom.components.indexOf({ type: 'text', position: [10,60,50,5], align: 'left', value: `${ship.custom.blueScreenPercent - 1}% complete` });
            ship.custom.components.splice(index, 1);
          }
          ship.custom.components.push(
            { type: 'text', position: [10,60,50,5], align: 'left', value: `${ship.custom.blueScreenPercent}% complete` }
          );
          ship.custom.blueScreenPercent++;
        }
        ship.setUIComponent({
          id: 'blue-screen',
          position: [0,0,100,100],
          clickable: false,
          visible: true,
          components: ship.custom.components
        });
      }
    );
  }
}
