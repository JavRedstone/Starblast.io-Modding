// Ring of fire

/*
  The name is self-explanatory
  
  Enjoy!
*/

var Fast_Cuda_101 = '{"name":"Fast Cuda","level":1,"model":1,"size":3,"specs":{"shield":{"capacity":[2000,2000],"reload":[2000,2000]},"generator":{"capacity":[1000,1000],"reload":[1000,1000]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100],"dash":{"rate":10,"burst_speed":[200,200],"speed":[150,150],"acceleration":[70,70],"initial_energy":[100,100],"energy":[50,50]}}},"bodies":{"body":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-100,-60,-10,0,20,50,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,20,25,35,40,40,35,30,0],"height":[0,5,40,45,40,60,70,60,30,0],"texture":[10,2,10,2,3,13,13,63,12],"propeller":true},"front":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-20],"z":[0,0,0,0,0]},"width":[0,40,45,10,12],"height":[0,15,18,8,12],"texture":[8,63,4,4,4],"propeller":true},"propeller":{"section_segments":10,"offset":{"x":40,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,20,15,0],"height":[0,10,15,15,15,10,10,18,8,0],"texture":[4,4,10,3,3,63,4,63,12],"propeller":true},"sides":{"section_segments":6,"angle":90,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-75,-60,-50,-10,10,50,60,75,80],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,30,35,10,12,12,10,35,30,0],"height":[0,10,12,8,12,12,8,12,10,0],"texture":[4,63,4,4,4,4,4,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,0,10,30,50],"z":[0,0,0,0,0,0]},"width":[0,12,18,20,15,0],"height":[0,20,22,24,20,0],"texture":[9]}},"wings":{"top":{"doubleside":true,"offset":{"x":0,"y":20,"z":15},"length":[70],"width":[70,30],"angle":[90],"position":[0,30],"texture":[63],"bump":{"position":10,"size":30}},"top2":{"doubleside":true,"offset":{"x":0,"y":51,"z":5},"length":[70],"width":[50,20],"angle":[90],"position":[0,60],"texture":[63],"bump":{"position":10,"size":30}}},"typespec":{"name":"Fast Cuda","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[2000,2000],"reload":[2000,2000]},"generator":{"capacity":[1000,1000],"reload":[1000,1000]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100],"dash":{"rate":10,"burst_speed":[200,200],"speed":[150,150],"acceleration":[70,70],"initial_energy":[100,100],"energy":[50,50]}}},"shape":[6.6,6.562,6.665,6.742,6.18,2.496,2.182,1.945,1.794,4.484,4.762,4.723,4.797,4.8,4.723,4.762,4.484,4.007,4.464,4.875,6.415,7.359,7.294,6.939,6.108,7.26,6.108,6.939,7.294,7.359,6.415,4.875,4.464,4.007,4.484,4.762,4.723,4.797,4.8,4.723,4.762,4.484,1.794,1.945,2.182,2.496,6.18,6.742,6.665,6.562],"lasers":[],"radius":7.359}}';

var ships = [
  Fast_Cuda_101
];

this.options = {
  map_name: "Ring of Fire",
  map_size: 30,
  custom_map: "",
  ships: ships,
  reset_tree: true,
  starting_ship: 801
};

function orbit (distance, alien, center) {
  alien.custom.angle += 0.01;
  
  alien.set ({
    x: distance * Math.cos (alien.custom.angle) + center.x,
    y: distance * Math.sin (alien.custom.angle) + center.y,
    vx: 0,
    vy: 0
  });
};

// for (let i = 1; i < game.aliens.length; i++) game.aliens[i].set({kill: true})

this.tick = function(game) {
  if (game.step === 0) {
    game.addAlien ({
      code: 12,
      level: 2
    });
  }
  
  if (game.step > 100) {
    if (game.step % 20 === 0 && game.aliens.length < 32) {
      game.addAlien ({
        code: 19,
        level: 0
      });
      game.aliens[game.aliens.length - 1].custom.angle = 0;
    }
    
    for (var alien of game.aliens) {
      if (alien.code == 19) {
        orbit (50, alien, game.aliens[0]);
      }
      
      else {
        alien.set ({
          x: 0,
          y: 0,
          vx: 0,
          vy: 0
        });
      }
      
      alien.set ({
        shield: 10000,
      });
    }
  }
};

this.event = function (event, game) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.set ({
        x: 0,
        y: 0
      });
      break;
  }
}
