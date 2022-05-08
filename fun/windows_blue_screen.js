// Windows Blue Screen

/*
  Blue screen! :(
*/

this.options = {
  root_mode: 'survival',
  map_size: 30
};

this.tick = function() {
  if (game.step % 100 === 0) {
    game.ships.forEach(
      (ship) => {
          if (!ship.custom.blueScreenPercent) {
            ship.custom.blueScreenPercent = 0;
          }
          ship.setUIComponent({
            id: 'blue-screen',
            position: [0,0,100,100],
            clickable: false,
            visible: true,
            components: [
              { type: 'box', position: [0,0,100,100], fill: '#00A4EF' },
              { type: 'text', position: [10,10,30,30], align: 'left', color: '#fff', value: ':(' },
              { type: 'text', position: [10,40,50,5], align: 'left', value: "Your PC ran into an issue and needs to restart. We're" },
              { type: 'text', position: [10,45,50,5], align: 'left', value: "just collecting some error info, then we'll restart for" },
              { type: 'text', position: [10,50,50,5], align: 'left', value: 'you.' },
              { type: 'text', position: [10,60,50,5], align: 'left', value: `${ship.custom.blueScreenPercent}% complete` },
              { type: 'box', position: [10,70,10,18], fill: '#fff' },
              { type: 'text', position: [22.5,70,40,5], align: 'left', value: 'For more information on this issue, please visit https://windows.com/stopcode' },
              { type: 'text', position: [22.5,80,20,5], align: 'left', value: 'If you call a support person, give them this info:' },
              { type: 'text', position: [22.5,82.5,15,5], align: 'left', value: 'Stop code: CRITICAL_PROCESS_DIED' },
            ]
          });
          if (ship.custom.blueScreenPercent < 100) {
            ship.custom.blueScreenPercent++;
          }
      }
    );
  }
}
