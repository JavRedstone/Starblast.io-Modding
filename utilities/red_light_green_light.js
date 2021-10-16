var Triplet_101 = '{"name":"Triplet","level":1,"model":1,"size":2,"zoom":0.7,"specs":{"shield":{"capacity":[200,200],"reload":[10,10]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":200,"speed":[200,200],"rotation":[100,100],"acceleration":[150,150]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,30,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[5,10,25,30,25,10,15,0],"height":[5,10,25,30,25,10,15,0],"texture":[1,3,12,13,3,4,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,10,10],"height":[0,10,10],"texture":[5,9,5],"propeller":false},"cannons1":{"section_segments":12,"offset":{"x":60,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,2,12,13,2,12],"angle":0,"laser":{"damage":[2.5,2.5],"rate":10,"type":1,"speed":[200,200],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":10,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,2,12,13,2,12],"angle":0,"laser":{"damage":[25,25],"rate":6,"type":1,"speed":[200,200],"number":1,"error":0}}},"wings":{"join":{"doubleside":true,"offset":{"x":0,"y":0,"z":0},"length":[60],"width":[10,6],"angle":[0],"position":[0,0,0,50],"texture":12,"bump":{"position":10,"size":20}}},"typespec":{"name":"Triplet","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[200,200],"reload":[10,10]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":200,"speed":[200,200],"rotation":[100,100],"acceleration":[150,150]}},"shape":[1.202,2.848,2.81,1.935,1.406,1.119,1.039,1.104,1.166,2.791,2.751,2.683,2.621,2.621,2.683,2.751,2.791,1.166,1.104,1.039,0.998,1.342,1.326,1.261,1.221,1.202,1.221,1.261,1.326,1.342,0.998,1.039,1.104,1.166,2.791,2.751,2.683,2.621,2.621,2.683,2.751,2.791,1.166,1.104,1.039,1.119,1.406,1.935,2.81,2.848],"lasers":[{"x":2.4,"y":-1.2,"z":0,"angle":0,"damage":[2.5,2.5],"rate":10,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.4,"y":-1.2,"z":0,"angle":0,"damage":[2.5,2.5],"rate":10,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.4,"y":-2.8,"z":0,"angle":0,"damage":[25,25],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.4,"y":-2.8,"z":0,"angle":0,"damage":[25,25],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.848}}';

var ships = [
  Triplet_101
];

var control = {
  wait: {
    started: false,
    players: 4
  }
};

this.options = {
  map_size: 20,
  custom_map: "",
  reset_tree: true,
  ships: ships,
  starting_ship: 801,
  starting_ship_maxed: true
};

function generate_message (message, ship) {
  ship.setUIComponent ({
    id: "message",
    position: [0, 10, 100, 5],
    visible: true,
    components: [
      {
        type: "text",
        position: [0, 0, 100, 100],
        value: message,
        color: "cde"
      }
    ]
  });
}

function hide_message (ship, pos = [0, 10, 100, 5]) {
  ship.setUIComponent ({
    id: `message_${pos[0]}_${pos[1]}_${pos[2]}_${pos[3]}`,
    visible: false,
  });
}

this.tick = function(game) {
  switch (true) {
    case game.step % 30 === 0:
      
      break;
  }
};

this.event = function(event, game) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.set({
        crystals: 20
      });
      break;
  }
};
