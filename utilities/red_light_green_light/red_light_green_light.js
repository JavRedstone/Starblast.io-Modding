// Red light green light from squid game

/*
  Mod in 1 day challenge
  
  Enjoy!
*/

var map = "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999\n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"                                                                                                    \n"+
"9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999";

var Triplet_101 = '{"name":"Triplet","level":1,"model":1,"size":2,"zoom":0.7,"specs":{"shield":{"capacity":[200,200],"reload":[10,10]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":200,"speed":[100,100],"rotation":[100,100],"acceleration":[1000,1000]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,30,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[5,10,25,30,25,10,15,0],"height":[5,10,25,30,25,10,15,0],"texture":[1,3,12,13,3,4,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,10,10],"height":[0,10,10],"texture":[5,9,5],"propeller":false},"fakecannons1":{"section_segments":12,"offset":{"x":60,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,2,12,13,2,12],"angle":0},"fakecannons2":{"section_segments":12,"offset":{"x":10,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,2,12,13,2,12],"angle":0}},"wings":{"join":{"doubleside":true,"offset":{"x":0,"y":0,"z":0},"length":[60],"width":[10,6],"angle":[0],"position":[0,0,0,50],"texture":12,"bump":{"position":10,"size":20}}},"typespec":{"name":"Triplet","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[200,200],"reload":[10,10]},"generator":{"capacity":[150,150],"reload":[75,75]},"ship":{"mass":200,"speed":[100,100],"rotation":[100,100],"acceleration":[1000,1000]}},"shape":[1.202,2.848,2.81,1.935,1.406,1.119,1.039,1.104,1.166,2.791,2.751,2.683,2.621,2.621,2.683,2.751,2.791,1.166,1.104,1.039,0.998,1.342,1.326,1.261,1.221,1.202,1.221,1.261,1.326,1.342,0.998,1.039,1.104,1.166,2.791,2.751,2.683,2.621,2.621,2.683,2.751,2.791,1.166,1.104,1.039,1.119,1.406,1.935,2.81,2.848],"lasers":[],"radius":2.848}}';

var ships = [
  Triplet_101
];

var vocabulary = [
  { text: "You", icon:"\u004e", key: "O" },
  { text: "GG", icon:"\u00a3", key: "G" },
  { text: "Sorry", icon:"\u00a1", key: "S" },
  { text: "No Problem", icon:"\u0047", key: "P" },
  { text: "Hmm?", icon: "\u004b", key: "Q" },
  { text: "Wait", icon: "\u0048", key: "T" },
  { text: "Yes", icon: "\u004c", key: "Y" },
  { text: "No", icon: "\u004d", key: "N" },
  { text: "Attack", icon: "\u00b4", key: "A" },
  { text: "Heal", icon: "\u0037", key: "H" },
  { text: "Thanks", icon: "\u0041", key: "X" },
  { text: "Kill", icon: "\u005b", key: "K" },
  { text: "Follow", icon: "\u0050", key: "F" },
  { text: "Me", icon: "\u004f", key: "E" },
];

var control = {
  light: {
    timer: {
      timer: 7200,
      max: 7200,
      up: false
    },
    sum: 0,
    base: 300,
    times: [],
    curr: {
      tick: 0,
      i: null
    },
    level: 0,
    tolerance: 100
  },
  lines: {
    starting: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/red_light_green_light/Starting_Line.png",
    finishing: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/red_light_green_light/Finishing_Line.png"
  },
  wait: {
    started: false,
    players: 4,
    i: null
  },
  instructions: []
};

this.options = {
  map_size: 100,
  map_name: "Red Light Green Light",
  custom_map: map,
  reset_tree: true,
  ships: ships,
  lives: 0,
  starting_ship_maxed: true,
  weapons_store: false,
  radar_zoom: 1,
  vocabulary: vocabulary
};

function generate_times() {
  while (control.light.sum <= control.light.timer.timer) {
    var time = Math.round(Math.random() * control.light.base);
    control.light.times.push(time);
    control.light.sum += time;
  }
}

control.instructions = [
  "When you see green light, go.",
  "When you see red light, stop.",
  "If you run over the red light, you get disqualified.",
  `One game lasts ${control.light.timer.max / 60} seconds.`,
  "If you didn't cross the line on time, you get disqualified.",
];

function generate_instructions (ship) {
  var instructions = {
    id: "instructions",
    visible: true,
    clickable: true,
    position: [1, 60, 30, 39],
    components: [
      {
        type: "box",
        position: [0, 0, 100, 100],
        fill: "rgba(23, 32, 42, 0.5)",
        stroke: "white",
        width: 2
      },
      {
        type: "box",
        position: [0, 0, 100, 5],
        stroke: "rgba(241, 196, 15, 0.5)",
        width: 2
      },
      {
        type: "text",
        position: [0, 0, 100, 5],
        value: "Instructions",
        color: "white"
      },
      {
        type: "box",
        position: [40, 85, 20, 10],
        stroke: "white",
        width: 2
      },
      {
        type: "text",
        position: [40, 85, 20, 10],
        value: "Got it",
        color: "white"
      }
    ]
  };
  
  for (let i = 0; i < control.instructions.length; i++) {
    instructions.components.push ({
      type: "text",
      position: [5, 5 + 10 * i, 90, 15],
      value: `➢ ${control.instructions[i]}`,
      color: "white",
      align: "left"
    });
  }
  
  ship.setUIComponent (instructions);
}

function hide_instructions (ship) {
  ship.setUIComponent ({
    id: "instructions",
    position: [0, 0, 0, 0],
    visible: false,
    clickable: false
  });
}


function generate_message(message) {
  game.setUIComponent({
    id: "message",
    position: [0, 10, 100, 5],
    visible: true,
    components: [
      {
        type: "text",
        position: [0, 0, 100, 100],
        value: message,
        color: "#cde"
      }
    ]
  });
}

function hide_message() {
  game.setUIComponent({
    id: "message",
    position: [0, 0, 0, 0],
    visible: false,
  });
}

function generate_light(ship, light = 0) {
  ship.setUIComponent({
    id: "light",
    position: [47, 15, 6, 24],
    visible: true,
    components: [
      {
        type: "box",
        position: [0, 0, 100, 100],
        fill: "rgba(23, 32, 42, 0.5)",
        stroke: "white",
        width: 2
      },
      {
        type: "round",
        position: [20, 7.5, 60, 25],
        fill: light == 1 ? "red" : "rgba(255, 0, 0, 0.1)",
        stroke: "white",
        width: 2
      },
      {
        type: "round",
        position: [20, 37.5, 60, 25],
        fill: light == 2 ? "yellow" : "rgba(255, 255, 0, 0.1)",
        stroke: "white",
        width: 2
      },
      {
        type: "round",
        position: [20, 67.5, 60, 25],
        fill: light == 3 ? "green" : "rgba(0, 255, 0, 0.1)",
        stroke: "white",
        width: 2
      }
    ]
  });
}

function hide_light(ship) {
  ship.setUIComponent({
    id: "light",
    position: [0, 0, 0, 0],
    visible: false
  });
}

this.tick = function() {
  if (game.step === 0) {
    generate_times ();
    
    control.wait.i = -game.options.map_size * 5;
    
    game.setObject({
      id: "starting",
      type: {
        id: "starting_image",
        obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
        emissive: control.lines.starting
      },
      position: {x: 0, y: -game.options.map_size * 4, z: -20},
      rotation: {x: 0, y: Math.PI, z: Math.PI},
      scale: {x: game.options.map_size * 10, y: 5, z: 0}
    });
    
    game.setObject({
      id: "finishing",
      type: {
        id: "finishing_image",
        obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
        emissive: control.lines.finishing
      },
      position: {x: 0, y: game.options.map_size * 4, z: -20},
      rotation: {x: 0, y: Math.PI, z: Math.PI},
      scale: {x: game.options.map_size * 10, y: 5, z: 0}
    });
  }
  else if (game.step % 15 === 0) {
    switch (control.wait.started) {
      case true:
        if (!control.light.curr.i) {
          control.light.curr.i = 0;
        }
        if (game.step - control.light.curr.tick >= control.light.times[control.light.curr.i]) { 
          control.light.level = control.light.curr.i % 2 === 0 ? 3 : 1;
          control.light.curr.tick = game.step;
          control.light.curr.i++;
        }
        
        for (var ship of game.ships) {
          if (!ship.custom.finished) {
            generate_light(ship, control.light.level);
            if (control.light.curr.i && control.light.curr.i % 2 === 0 && game.step - control.light.curr.tick >= control.light.tolerance && (ship.vx >= 0.2 || ship.vy >= 0.2)) {
              ship.gameover({
                "You passed the red light": "You are disqualified",
                "Max rounds reached": control.light.curr.i + 1,
                "Time elapsed": `${control.light.timer.max / 60 - control.light.timer.timer / 60} second(s)`
              });
            }
            if (ship.y >= game.options.map_size * 4) {
              ship.custom.finished = true;
            }
          }
          else {
            hide_light(ship);
          }
        }
        
        if (game.step % 60 === 0) {
          if (control.light.timer.timer > 0) {
            control.light.timer.timer -= 60;
            generate_message(`Time: ${control.light.timer.timer / 60} seconds`);
          }
          else {
            control.light.timer.up = true;
            for (var ship of game.ships) {
              if (ship.custom.finished) {
                ship.gameover({
                  "Congratulations": "You have passed"
                });
              }
              else {
                ship.gameover({
                  "Good try": "You are disqualified"
                });
              }
            }
          }
        }
        break;
      case false:
        if (game.ships.length >= control.wait.players) {
          control.light.curr.tick = game.step;
          control.light.level = 3;
          control.wait.started = true;
        }
        
        else {
          for (var ship of game.ships) {
            ship.set(ship.custom.pos);
          }
          generate_light (game, 2);
          generate_message(`Waiting for more players... — ${control.wait.players - game.ships.length} player(s) remaining.`);
        }
        break;
    }
  }
};

this.event = function(event) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.custom.pos = {
        x: control.wait.i,
        y: -game.options.map_size * 4
      };
      
      ship.set({
        x: ship.custom.pos.x,
        y: ship.custom.pos.y,
        crystals: 20
      });
      
      control.wait.i += 50;
      
      if (control.wait.started) {
        ship.gameover({
          "Round already started": "Wait until next time"
        });
      }
      
      generate_instructions(ship);
      break;
    case "ui_component_clicked":
      switch (event.id) {
        case "instructions":
          hide_instructions (ship);
          break;
      }
  }
};
