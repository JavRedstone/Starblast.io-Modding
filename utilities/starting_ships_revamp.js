// Starting ships revamp

/*
  Starblast starting ships revamp, useful especially for large amounts of starting ships
  
  Enjoy!
*/

// Example ships
var Rock_101 = '{"name":"Rock","level":1,"model":1,"size":2,"zoom":0.7,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[150,150],"reload":[150,150]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100]}},"bodies":{"arm":{"section_segments":6,"angle":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-70,-60,-10,10,60,70,85,90,85],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,12,12,15,20,20,15,0],"height":[0,10,12,8,12,12,8,12,10,5,0],"texture":[2,1,12,2,4,2,12,16,17],"propeller":true},"cannon":{"section_segments":6,"offset":{"x":0,"y":-63,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-25,-30,-20,0,10,12],"z":[0,0,0,0,0,0]},"width":[0,5,5,7,6,0],"height":[0,5,5,7,6,0],"texture":[6,6,6,6,6],"laser":{"damage":[150,150],"rate":1,"type":1,"speed":[250,250],"number":1,"error":0}},"arm45":{"section_segments":6,"angle":45,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-70,-60,-10,10,60,70,85,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,12,12,10,25,20,0],"height":[0,10,12,8,12,12,8,12,10,0],"texture":[2,1,12,63,4,63,12,1,2]},"arm90":{"section_segments":6,"angle":90,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-70,-60,-10,10,60,70,85,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,12,12,10,25,20,0],"height":[0,10,12,8,12,12,8,12,10,0],"texture":[2,1,12,2,4,2,12,1,2]},"arm135":{"section_segments":6,"angle":-45,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-70,-60,-10,10,60,70,85,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,12,12,10,25,20,0],"height":[0,10,12,8,12,12,8,12,10,0],"texture":[2,1,12,63,4,63,12,1,2]}},"typespec":{"name":"Rock","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[150,150],"reload":[150,150]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100]}},"shape":[3.724,3.541,3.474,1.242,3.349,3.52,3.6,3.568,3.485,3.01,3.164,3.5,3.598,3.6,3.5,3.164,3.01,3.485,3.568,3.6,3.52,3.349,1.515,3.502,3.637,3.607,3.637,3.502,1.515,3.349,3.52,3.6,3.568,3.485,3.01,3.164,3.5,3.598,3.6,3.5,3.164,3.01,3.485,3.568,3.6,3.52,3.349,1.242,3.474,3.541],"lasers":[{"x":0,"y":-3.72,"z":0,"angle":0,"damage":[150,150],"rate":1,"type":1,"speed":[250,250],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.724}}';
var Sniper_102 = '{"name":"Sniper","level":1,"model":2,"size":2,"zoom":0.7,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,40,80,70,80],"z":[0,0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,5,23,10,0],"texture":[12,1,63,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":25},"position":{"x":[0,0,0,0],"y":[20,40,80],"z":[-4,0,-6]},"width":[5,10,5],"height":[0,8,0],"texture":[9]},"wings":{"section_segments":8,"offset":{"x":15,"y":-20,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-85,-95,50,60,50,60],"z":[0,0,0,0,0,0]},"width":[0,5,25,10,0],"height":[0,5,25,10,0],"texture":[12,2,3,4],"propeller":true},"cannons":{"section_segments":12,"offset":{"x":35,"y":-10,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,10,10,5,0],"height":[0,5,5,10,10,5,0],"angle":5,"laser":{"damage":[75,75],"rate":2,"type":1,"speed":[250,250],"number":1,"error":0},"texture":[3,1,63,3,12,2]}},"typespec":{"name":"Sniper","level":1,"model":2,"code":102,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100]}},"shape":[3.098,4.669,4.391,3.481,3.239,2.698,2.358,2.11,1.961,1.891,1.856,1.85,1.836,1.872,1.903,1.885,1.873,1.959,2,1.935,1.895,1.887,1.768,2.04,2.036,2.004,2.036,2.04,1.768,1.887,1.895,1.935,2,1.959,1.873,1.885,1.903,1.872,1.836,1.85,1.856,1.891,1.961,2.11,2.358,2.698,3.239,3.481,4.391,4.669],"lasers":[{"x":1.156,"y":-3.189,"z":-0.4,"angle":5,"damage":[75,75],"rate":2,"type":1,"speed":[250,250],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.156,"y":-3.189,"z":-0.4,"angle":-5,"damage":[75,75],"rate":2,"type":1,"speed":[250,250],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.669}}';
var Attacker_103 = '{"name":"Attacker","level":1,"model":3,"size":2,"zoom":0.7,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[150,150],"reload":[37.5,37.5]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-50,0,80,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,20,25,27,15,0],"height":[0,15,20,25,27,15,0],"propeller":true,"texture":[63,2,1,2,16,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-33,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"cannon":{"section_segments":6,"offset":{"x":0,"y":-60,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-30,-20,-10,0,10],"z":[0,0,0,0,0,0]},"width":[0,5,5,5,5,5],"height":[0,5,5,5,5,5],"angle":0,"laser":{"damage":[37.5,37.5],"rate":4,"type":1,"speed":[250,250],"number":1,"error":1},"propeller":false,"texture":6}},"wings":{"end":{"length":[25,19],"width":[100,50,25],"angle":[0,45],"position":[70,75,80],"doubleside":true,"texture":[1,63],"bump":{"position":0,"size":0},"offset":{"x":20,"y":-20,"z":0}}},"typespec":{"name":"Attacker","level":1,"model":3,"code":103,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[150,150],"reload":[37.5,37.5]},"ship":{"mass":1000,"speed":[100,100],"rotation":[1000,1000],"acceleration":[100,100]}},"shape":[4,3.391,3.074,2.398,1.926,1.611,1.387,1.243,1.144,1.081,1.034,1.005,0.998,1.007,1.041,1.279,1.676,2.449,3.203,3.663,3.725,3.724,3.871,4.079,4.243,4.208,4.243,4.079,3.871,3.724,3.725,3.663,3.203,2.449,1.676,1.279,1.041,1.007,1,1.005,1.034,1.081,1.144,1.243,1.387,1.611,1.926,2.398,3.074,3.391],"lasers":[{"x":0,"y":-4,"z":0.4,"angle":0,"damage":[37.5,37.5],"rate":4,"type":1,"speed":[250,250],"number":1,"spread":0,"error":1,"recoil":0}],"radius":4.243}}';

var ships = [
  Rock_101,
  Sniper_102,
  Attacker_103
];

var starting_ships = [
  Rock_101,
  Sniper_102,
  Attacker_103
];

this.options = {
  map_size: 30,
  reset_tree: true,
  ships: ships
};

function mod_ship (ship) {
  var t = [];
  for (var i of [[],["typespec"]]) {
    var param = ship;
    
    for (var j of i) {
      param = param[j];
    }
    
    t.push (param);
  }
  return t;
};

function generate_chooser (ship) {
  ship.custom.starting_values = [];
  ship.custom.starting_ui_ids = [];
  
  for (let i = 0; i < starting_ships.length; i++) {
    var _ship = starting_ships[i];
    var __ship = JSON.parse (_ship);
    
    var code = __ship.typespec.code;
    var name;
    
    for (var j of mod_ship (__ship)) {
      name = j.name;
    }
    
    var ui_id = `ship_option_${code}_${name}`;
    
    ship.custom.starting_values.push ({
      code: code,
      name: name,
    });
    
    ship.custom.starting_ui_ids.push (ui_id);
    
    ship.setUIComponent ({
      id: ui_id,
      position: [20 + (60 / starting_ships.length) * (i + 0.1), 25, (60 / starting_ships.length * 0.8), 50],
      clickable: true,
      visible: true,
      components: [
        {
          type: "box",
          position: [0, 0, 100, 100],
          fill: "rgba(23, 32, 42, 0.5)",
          stroke: "#cde",
          width: 3
        },
        {
          type: "text",
          position: [10, 0, 80, 70],
          value: name,
          color: "#cde"
        },
        {
          type: "text",
          position: [10, 60, 80, 10],
          value: code,
          color: "#cde"
        },
        {
          type: "box",
          position: [0, 0, 10, 10],
          fill: "#cde"
        },
        {
          type: "box",
          position: [90, 90, 10, 10],
          fill: "#cde"
        },
      ]
    });
  }
}

function hide_chooser (ship) {
  for (let i = 0; i < ship.custom.starting_ui_ids.length; i++) {
    ship.setUIComponent ({
      id: ship.custom.starting_ui_ids[i],
      clickable: false,
      visible: false,
    });
  }
}

this.tick = function (game) {
  for (var ship of game.ships) {
    if (!ship.custom.chosen_ui) {
      ship.set ({
        idle: true,
        collider: false
      });
    }
    
    else {
      ship.set ({
        idle: false,
        collider: true
      });
    }
  }
};

this.event = function (event, game) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      if (!ship.custom.chosen) {
        generate_chooser (ship);
        
        ship.custom.chosen = true;
      }
      break;
    case "ui_component_clicked":
      if (event.id.substring (0, 11) == "ship_option") {
        ship.set ({
          type: ship.custom.starting_values[ship.custom.starting_ui_ids.indexOf (event.id)].code,
          shield: 1000,
          invulnerable: 360
        });
        
        hide_chooser (ship);
        ship.custom.chosen_ui = true;
      }
      break;
  }
};
