this.options = {
  map_size: 30,
  custom_map: "",
  weapons_store: false
}

var control = {
  teams: {
    length: 4,
    current: 0,
    colors: ["red", "yellow", "lime", "blue"],
    abbrev: ["R", "Y", "L", "B"],
    hues: [0, 60, 120, 240],
    scores: [0, 0, 0, 0]
  },
  dirs: {
    length: 4,
    names: ["left", "right", "up", "down"],
    values: ["🡸", "🡺", "🡹", "🡻"],
    shortcuts: ["A", "D", "W", "S"]
  },
  map: {
    size: 0
  },
  tiles: {
    size: 20,
    tiles: [],
    tile_types: []
  },
  rounds: {
    num: 0,
    curr: null
  },
  wait: {
    started: false,
    players: 4
  },
};

const white_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/White_Tile.png";
const red_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Red_Tile.png";
const yellow_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Yellow_Tile.png";
const lime_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Lime_Tile.png";
const blue_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Blue_Tile.png";

const goal_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Goal_Tile.png";
const path_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Path_Tile.png";

const grey_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Grey_Tile.png";

control.tiles.tile_types = [red_tile, yellow_tile, lime_tile, blue_tile, white_tile, goal_tile, path_tile];

class Tile {
    constructor({
      id: id,
      type: {
        id: type_id,
        emissive: image
      },
      position: { x: px, y: py },
    }) {
      this.id = id;
      this.position = { x: px, y: py, z: -20 };
      this.rotation = { x: 0, y: Math.PI, z: Math.PI }
      this.scale = { x: control.tiles.size, y: control.tiles.size, z: 0 };
      this.type = {
        id: type_id,
        obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
        emissive: image
      };
      this.hidden = false;
    }
    
    initiate(game) {
      game.setObject({
        id: this.id,
        type: this.type,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale 
      });
      
      tiles.push(this);
      
      return this;
    }
}

class Round {
    constructor() {
      this.tiles = [];
    }
    
    start() {
      control.rounds.num++;
      return this;
    }
}

var corner_A, corner_B, corner_C, corner_D, center_tile, corner_tile_A, corner_tile_B, corner_tile_C, corner_tile_D;

function generate_stones () {
  var map_size = control.map.size;
  
  corner_A = { x: -map_size + control.tiles.size, y: map_size - control.tiles.size };
  corner_B = { x: map_size - control.tiles.size, y: map_size - control.tiles.size };
  corner_C = { x: map_size - control.tiles.size, y: -map_size + control.tiles.size };
  corner_D = { x: -map_size + control.tiles.size, y: -map_size + control.tiles.size };
  
  center_tile = new Tile ({
    id: "center_tile",
    type: white_tile,
    position: { x: map_size, y: map_size }
  }).initiate(game);
  
  corner_tile_A = new Tile ({
    id: "corner_tile_A",
    type: white_tile,
    position: { x: corner_A.x, y: corner_A.y }
  }).initiate(game);
  
  corner_tile_B = new Tile ({
    id: "corner_tile_B",
    type: white_tile,
    position: { x: corner_B.x, y: corner_B.y }
  }).initiate(game);
  
  corner_tile_C = new Tile ({
    id: "corner_tile_C",
    type: white_tile,
    position: { x: corner_C.x, y: corner_C.y }
  }).initiate(game);
  
  corner_tile_D = new Tile ({
    id: "corner_tile_D",
    type: white_tile,
    position: { x: corner_D.x, y: corner_D.y }
  }).initiate(game);
}

function check_there (pos) {
  for (var tile of tiles) {
    if (tile.position.x == pos.x && tile.position.y == pos.y && tile_types.includes (tile.type.emmissive)) {
      return true;
    }
  }
  
  return false;
}

function left (tile, image = white_tile, remove = false) {
  var pos = { x: tile.position.x - tile_size, y: tile.position.y };
  return {
    check: check_there (pos),
    tile: remove ? new Tile ({
      id: `tile_${pos}`,
      type: image,
      position: pos
    }) : null
  };
}

function right (tile, image = white_tile, remove = false) {
  var pos = { x: tile.position.x + tile_size, y: tile.position.y };
  return {
    check: check_there (pos),
    tile: remove ? new Tile ({
      id: `tile_${pos}`,
      type: image,
      position: pos
    }) : null
  };
}

function up (tile, image = white_tile, remove = false) {
  var pos = { x: tile.position.x, y: tile.position.y + tile_size };
  return {
    check: check_there (pos),
    tile: remove ? new Tile ({
      id: `tile_${pos}`,
      type: image,
      position: pos
    }) : null
  };
}

function down (tile, image = white_tile, remove = false) {
  var pos = { x: tile.position.x, y: tile.position.y - tile_size };
  return {
    check: check_there (pos),
    tile: remove ? new Tile ({
      id: `tile_${pos}`,
      type: image,
      position: pos
    }) : null
  };
}

function generate_dirs (ship) {
  for (let i = 0; i < control.dirs.length; i++) {
    ship.setUIComponent({
      id: control.dirs.names[i],
      position: [60 + i * 4, 1, 4, 6.4],
      clickable: ship.custom.rest[i].clickable,
      shortcut: `${control.dirs.shortcuts[i]}`,
      components: [
        { type: "box", position: [0,0,100,100], stroke: ship.custom.rest[i].stroke, width: 2},
        { type: "text", position: [5, 10, 90, 60], value: control.dirs.values[i], color: ship.custom.rest[i].color},
        { type: "text", position: [5, 65, 90, 25], value: `[${control.dirs.shortcuts[i]}]`, color: ship.custom.rest[i].color}
      ]
    });
  }
}

function enable_dir (dir, ship) {
   ship.custom.rest[dir_id] = {
    clickable: true,
    stroke: "white",
    color: "white"
  };
  
  generate_dirs(ship);
}

function disable_dir (dir, ship) {
   ship.custom.rest[dir_id] = {
    clickable: false,
    stroke: "grey",
    color: "grey"
  };
  
  generate_dirs(ship);
}

function generate_team (ship) {
  var team_color = control.teams.colors[control.teams.current];
  var team_abbrev = control.teams.abbrev[control.teams.current];
  var team_hue = control.teams.hues[control.teams.current];

  ship.setUIComponent({
    id: "team",
    position: [76, 1, 4, 6.4],
    components: [
      { type: "box", position: [0,0,100,100], stroke: team_color, width: 2},
      { type: "text", position: [5, 10, 90, 60], value: team_abbrev, color: team_color},
      { type: "text", position: [5, 65, 90, 25], value: `[${team_color.toUpperCase()}]`, color: team_color}
    ]
  });
}

function generate_scoreboard (ship) {
  var scoreboard = {
    id: "scoreboard",
    components: [
      {
        type: "box",
        position: [0, 75, 100, 15],
        stroke: "magenta",
        width: 3
      },
      {
        type: "text",
        position: [0, 75, 50, 15],
        value: "ROUND:",
        color: "magenta",
        align: "left"
      },
      {
        type: "text",
        position: [0, 75, 100, 15],
        value: control.rounds.num,
        color: "magenta",
        align: "right"
      }  
    ]
  };
  
  for (let i = 0; i < control.teams.length; i++) {
    scoreboard.components.push (
      {
        type: "box",
        position: [0, i * 15, 100, 15],
        fill: ship.custom.team == i ? "rgba(0, 255, 255, 0.2)" : "rgba(0, 0, 0, 0)",
        stroke: control.teams.colors[i],
        width: 3
      },
      {
        type: "text",
        position: [0, i * 15, 50, 15],
        value: `${control.teams.colors[i].toUpperCase()}:`,
        color: control.teams.colors[i],
        align: "left"
      },
      {
        type: "text",
        position: [0, i * 15, 100, 15],
        value: control.teams.scores[i],
        color: control.teams.colors[i],
        align: "right"
      }
    );
  }
  
  ship.setUIComponent (scoreboard);
}

function generate_message (message, ship, color = "rgb(128, 181, 233)") {
  ship.setUIComponent ({
    id: "message",
    position: [0, 10, 100, 5],
    visible: true,
    components: [
      {
        type: "text",
        position: [0, 0, 100, 100],
        value: message,
        color: color
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

function general_update (ship) {
  if (ship.custom.pos) {
    ship.set ({
      x: ship.custom.pos.x,
      y: ship.custom.pos.y
    });
  }
  
  generate_scoreboard (ship);
}

function generate_border () {
  for (let i = 0; i < control.map.size * 2 / control.tiles.size - 3; i++) {
    right (curr_A);
    down (curr_B);
    left (curr_C);
    up (curr_D);
  }
}

this.tick = function (game) {
  switch (true) {
    case game.step === 0:
      control.map.size = game.options.map_size * 5;
      
      generate_stones ();
      
      generate_border ();
      
      break;
    case game.step % 30 === 0:
      for (var ship of game.ships) {
        general_update (ship);
        
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
      ship.custom.rest = [];
      for (let i = 0; i < control.dirs.length; i++) {
        ship.custom.rest.push ({
          clickable: false,
          stroke: "grey",
          color: "grey"
        });
      }
      
      generate_dirs (ship);
      
      generate_team (ship);
      
      generate_scoreboard (ship);
      
      ship.custom.team = control.teams.current;
      control.teams.current = control.teams.current < control.teams.length - 1 ? control.teams.current + 1 : 0;
      break;
  }
}
