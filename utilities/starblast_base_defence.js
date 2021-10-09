var Triplet_101 = '{"name":"Triplet","level":1,"model":1,"size":2,"zoom":0.7,"specs":{"shield":{"capacity":[200,200],"reload":[10,10]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":200,"speed":[100,100],"rotation":[100,100],"acceleration":[150,150]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,30,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[5,10,25,30,25,10,15,0],"height":[5,10,25,30,25,10,15,0],"texture":[1,3,12,13,3,4,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,10,10],"height":[0,10,10],"texture":[5,9,5],"propeller":false},"cannons1":{"section_segments":12,"offset":{"x":60,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,2,12,13,2,12],"angle":5,"laser":{"damage":[2.5,2.5],"rate":10,"type":1,"speed":[200,200],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":10,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,2,12,13,2,12],"angle":0,"laser":{"damage":[25,25],"rate":6,"type":1,"speed":[200,200],"number":1,"error":0}}},"wings":{"join":{"doubleside":true,"offset":{"x":0,"y":0,"z":0},"length":[60],"width":[10,6],"angle":[0],"position":[0,0,0,50],"texture":12,"bump":{"position":10,"size":20}}},"typespec":{"name":"Triplet","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[200,200],"reload":[10,10]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":200,"speed":[100,100],"rotation":[100,100],"acceleration":[150,150]}},"shape":[1.202,2.848,2.81,1.935,1.406,1.119,1.039,1.104,1.166,2.699,2.667,2.625,2.601,2.649,2.744,2.838,2.879,1.166,1.104,1.039,0.998,1.342,1.326,1.261,1.221,1.202,1.221,1.261,1.326,1.342,0.998,1.039,1.104,1.166,2.879,2.838,2.744,2.649,2.601,2.625,2.667,2.699,1.166,1.104,1.039,1.119,1.406,1.935,2.81,2.848],"lasers":[{"x":2.295,"y":-1.195,"z":0,"angle":5,"damage":[2.5,2.5],"rate":10,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.295,"y":-1.195,"z":0,"angle":-5,"damage":[2.5,2.5],"rate":10,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.4,"y":-2.8,"z":0,"angle":0,"damage":[25,25],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.4,"y":-2.8,"z":0,"angle":0,"damage":[25,25],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.879}}';

var ships = [];

ships.push (Triplet_101);

var map = "999999999999999999999999999999\n"+
"9      9 4  9    9  4 9      9\n"+
"9      9  4 994499 4  9      9\n"+
"9      4   4      4   4      9\n"+
"9      4  4   44   4  4      9\n"+
"9      9 4   4  4   4 9      9\n"+
"9      94   4    4   49      9\n"+
"944444499999994499999994444449\n"+
"9         4        4         9\n"+
"9         4        4         9\n"+
"9         4        4         9\n"+
"94444444444        44444444449\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"9                            9\n"+
"999999999999999999999999999999";

var control = {
  wait: {
    started: false,
    players: 4
  },
  waves: {
    num: 0,
    types: [],
    amount: []
  }
};

this.options = {
  map_size: 30,
  custom_map: map,
  asteroids_strength: 1000000,
  crystal_value: 0,
  reset_tree: true,
  ships: ships,
  starting_ship: 801,
  weapons_store: false,
  friendly_colors: 1
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
        color: "rgb(128, 181, 233)"
      }
    ]
  });
}

function hide_message (ship) {
  ship.setUIComponent ({
    id: "message",
    visible: false,
  });
}

this.tick = function (game) {
  switch (true) {
    case game.step % 30 === 0:
      for (var ship of game.ships) {
        if (ship.x < -70 || ship.x > 70 || ship.y < 70) {
          ship.set ({
            x: 0,
            y: 120,
            invulnerable: 360
          });
        }
        
        switch (control.wait.started) {
          case true:
            break;
          case false:
            if (game.ships.length >= control.wait.players) {
              for (var _ship of game.ships) {
                hide_message (_ship);
              }
              
              control.wait.started = true;
            }
            
            else {
              generate_message (`Waiting for more players... — ${control.wait.players - game.ships.length} player(s) remaining.`, ship);
            }
            break;
        }
      }
      break;
  }
};

this.event = function (event, game) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.set ({
        shield: 1000,
        crystals: 20,
        stats: 11111111,
        hue: 180,
        invulnerable: 360
      });
      break;
  }
};
