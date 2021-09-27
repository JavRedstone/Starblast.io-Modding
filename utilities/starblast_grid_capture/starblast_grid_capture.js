var Ship_101 = '{"name":"Ship","level":1,"model":1,"size":1,"zoom":0.5,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":1000,"speed":[1,1],"rotation":[1000,1000],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Ship","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":1000,"speed":[1,1],"rotation":[1000,1000],"acceleration":[1,1]}},"shape":[1.3,1.253,1.041,0.919,0.841,0.788,0.753,0.73,0.722,0.74,0.807,0.906,1.04,1.587,1.626,1.692,1.767,1.74,1.661,1.607,1.452,1.348,1.272,1.53,1.527,1.503,1.527,1.53,1.272,1.348,1.452,1.607,1.661,1.74,1.767,1.692,1.626,1.587,1.576,0.906,0.807,0.74,0.722,0.73,0.753,0.788,0.841,0.919,1.041,1.253],"lasers":[],"radius":1.767}}';

var ships = [];

ships.push(Ship_101);

var map_size_small = 30;

this.options = {
  map_size: map_size_small,
  custom_map: "",
  weapons_store: false,
  ships: ships,
  starting_ship: 101,
  reset_tree: false
};

var team_colors = ["red", "yellow", "green", "blue"];
var team_values = ["R", "Y", "G", "B"];
var hue_values = [0, 60, 120, 240];
var current_team = team_colors.length - 1;

var dir_names = ["left", "right", "up", "down"];
var dir_values = ["🡸", "🡺", "🡹", "🡻"];
var dir_shortcuts = ["A", "D", "W", "S"];

function generate_ui (ship) {
  for (let i = 0; i < dir_names.length; i++) {
    ship.setUIComponent({
      id: dir_names[i],
      position: [60 + i * 4, 1, 4, 6.4],
      clickable: ship.custom.restrictions[i].clickable,
      shortcut: `${dir_shortcuts[i]}`,
      visible: ship.custom.restrictions[i].visible,
      components: [
        { type: "box", position: [0,0,100,100], stroke: ship.custom.restrictions[i].stroke, width: 2},
        { type: "text", position: [5, 10, 90, 60], value: dir_values[i], color: ship.custom.restrictions[i].color},
        { type: "text", position: [5, 65, 90, 25], value: `[${dir_shortcuts[i]}]`, color: ship.custom.restrictions[i].color}
      ]
    });
  }
}

function disable_ui (dir_id, ship) {
  ship.custom.restrictions[dir_id] = {
    clickable: false,
    stroke: "grey",
    color: "grey"
  };
  
  generate_ui(ship);
}

function enable_ui (dir_id, ship) {
  ship.custom.restrictions[dir_id] = {
    clickable: true,
    stroke: "white",
    color: "white"
  };
  
  generate_ui(ship);
}

var white_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/White_Tile.png";
var red_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Red_Tile.png";
var yellow_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Yellow_Tile.png";
var green_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Green_Tile.png";
var blue_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Blue_Tile.png";

var goal_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Goal_Tile.png";
var path_tile = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Path_Tile.png";

var tile_types = [red_tile, yellow_tile, green_tile, blue_tile];

var depth = -10;

var tiles = [];

class Tile {
    constructor({
      id: id,
      type: image,
      position: { x: px, y: py },
    }) {
      this.id = id;
      this.position = { x: px, y: py, z: depth };
      this.rotation = { x: 0, y: Math.PI, z: Math.PI }
      this.scale = { x: tile_size, y: tile_size, z: 0 };
      this.type = {
        id: id,
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

var num = 0;
var running_round = null;

class Round {
    constructor() {
      this.num = num + 1;
      this.tiles = [];
    }
    
    start() {
      num += 1;
      return this;
    }
}

var map_size = map_size_small * 5;
var tile_size = 20;
var move_in = 1;

var corner_A = { x: -map_size + tile_size * move_in, y: map_size - tile_size * move_in };
var corner_B = { x: map_size - tile_size * move_in, y: map_size - tile_size * move_in };
var corner_C = { x: map_size - tile_size * move_in, y: -map_size + tile_size * move_in };
var corner_D = { x: -map_size + tile_size * move_in, y: -map_size + tile_size * move_in };


var corner_tile_A = new Tile ({
  id: `tile_${corner_A.x}_${corner_A.y}`,
  type: white_tile,
  position: { x: corner_A.x, y: corner_A.y }
}).initiate(game);

var corner_tile_B = new Tile ({
  id: `tile_${corner_B.x}_${corner_B.y}`,
  type: white_tile,
  position: { x: corner_B.x, y: corner_B.y }
}).initiate(game);

var corner_tile_C = new Tile ({
  id: `tile_${corner_C.x}_${corner_C.y}`,
  type: white_tile,
  position: { x: corner_C.x, y: corner_C.y }
}).initiate(game);

var corner_tile_D = new Tile ({
  id: `tile_${corner_D.x}_${corner_D.y}`,
  type: white_tile,
  position: { x: corner_D.x, y: corner_D.y }
}).initiate(game);

function check_there (tile, pos) {
  return tile.position.x == pos.x && tile.position.y == pos.y && tile.type.emissive !== "";
}

function left (tile, image, remove = false) {
  // echo(["left", tile.position.x, tile.position.y]);
  var new_tile = new Tile ({
    id: `tile_${tile.position.x - tile_size}_${tile.position.y}`,
    type: image,
    position: { x: tile.position.x - tile_size, y: tile.position.y }
  });
  check = false;
  for (var _tile of tiles) {
    if (check_there (_tile, new_tile.position)) {
      check = true;
    }
  }
  return {
    check: check,
    tile: remove ? new_tile : new_tile.initiate (game)
  };
}

function right (tile, image, remove = false) {
  // echo(["right", tile.position.x, tile.position.y]);
  var new_tile = new Tile ({
    id: `tile_${tile.position.x + tile_size}_${tile.position.y}`,
    type: image,
    position: { x: tile.position.x + tile_size, y: tile.position.y }
  });
  check = false;
  for (var _tile of tiles) {
    if (check_there (_tile, new_tile.position)) {
      check = true;
    }
  }
  return {
    check: check,
    tile: remove ? new_tile : new_tile.initiate (game)
  };
}

function up (tile, image, remove = false) {
  // echo(["up", tile.position.x, tile.position.y]);
  var new_tile = new Tile ({
    id: `tile_${tile.position.x}_${tile.position.y + tile_size}`,
    type: image,
    position: { x: tile.position.x, y: tile.position.y + tile_size }
  });
  check = false;
  for (var _tile of tiles) {
    if (check_there (_tile, new_tile.position)) {
      check = true;
    }
  }
  return {
    check: check,
    tile: remove ? new_tile : new_tile.initiate (game)
  };
}

function down (tile, image, remove = false) {
  // echo(["down", tile.position.x, tile.position.y]);
  var new_tile = new Tile ({
    id: `tile_${tile.position.x}_${tile.position.y - tile_size}`,
    type: image,
    position: { x: tile.position.x, y: tile.position.y - tile_size }
  });
  check = false;
  for (var _tile of tiles) {
    if (check_there (_tile, new_tile.position)) {
      check = true;
    }
  }
  return {
    check: check,
    tile: remove ? new_tile : new_tile.initiate (game)
  };
}

var directions = [left, right, up, down];

var curr_A = corner_tile_A;
var curr_B = corner_tile_B;
var curr_C = corner_tile_C;
var curr_D = corner_tile_D;

function generate_border () {
  for (let i = 0; i < map_size * 2 / tile_size - move_in * 2 - 1; i++) {
    curr_A = right(curr_A, white_tile).tile;
    curr_B = down(curr_B, white_tile).tile;
    curr_C = left(curr_C, white_tile).tile;
    curr_D = up(curr_D, white_tile).tile;
  }
}

var team_A = down(right(right(corner_tile_A, white_tile).tile, white_tile).tile, red_tile).tile;
var team_B = left(down(down(corner_tile_B, white_tile).tile, white_tile).tile, yellow_tile).tile;
var team_C = up(left(left(corner_tile_C, white_tile).tile, white_tile).tile, green_tile).tile;
var team_D = right(up(up(corner_tile_D, white_tile).tile, white_tile).tile, blue_tile).tile;

var curr_team_A = team_A;
var curr_team_B = team_B;
var curr_team_C = team_C;
var curr_team_D = team_D;

function generate_base () {
  for (let i = 0; i < 2; i++) {
    curr_team_A = down(curr_team_A, red_tile).tile;
    curr_team_B = left(curr_team_B, yellow_tile).tile;
    curr_team_C = up(curr_team_C, green_tile).tile;
    curr_team_D = right(curr_team_D, blue_tile).tile;
  }
}

this.tick = function (game) {
  switch (true) {
    case game.step === 0:
      generate_border ();
      generate_base ();
      break;
    case game.step % 30 === 0:
      for (var ship of game.ships) {
        if (ship.custom.position) {
          ship.set ({
            vx: 0,
            vy: 0,
            x: ship.custom.position.x,
            y: ship.custom.position.y
          });
        }
        
        ship.custom.surr_left = { x: ship.custom.position.x - tile_size, y: ship.custom.position.y };
        ship.custom.surr_right = { x: ship.custom.position.x + tile_size, y: ship.custom.position.y };
        ship.custom.surr_up = { x: ship.custom.position.x, y: ship.custom.position.y + tile_size };
        ship.custom.surr_down = { x: ship.custom.position.x, y: ship.custom.position.y - tile_size };
        
        ship.custom.surr_left_avail = false;
        ship.custom.surr_right_avail = false;
        ship.custom.surr_up_avail = false;
        ship.custom.surr_down_avail = false;
        
        for (var tile of tiles) {
          if (check_there (tile, ship.custom.surr_left)) ship.custom.surr_left_avail = true;
          if (check_there (tile, ship.custom.surr_right)) ship.custom.surr_right_avail = true;
          if (check_there (tile, ship.custom.surr_up)) ship.custom.surr_up_avail = true;
          if (check_there (tile, ship.custom.surr_down)) ship.custom.surr_down_avail = true;
        }
        
        ship.custom.surr_left_avail ? enable_ui (0, ship) : disable_ui (0, ship);
        ship.custom.surr_right_avail ? enable_ui (1, ship) : disable_ui (1, ship);
        ship.custom.surr_up_avail ? enable_ui (2, ship) : disable_ui (2, ship);
        ship.custom.surr_down_avail ? enable_ui (3, ship) : disable_ui (3, ship);
      }
      
      if (running_round && game.step % 1000 === 0) {
        for (var tile of running_round.tiles) {
          new Tile ({
            id: tile.id,
            type: "",
            position: {}
          }).initiate (game);
        }
      
        running_round = null;
      }
      
      if (!running_round) {
        running_round = new Round ().start();
        
        var position;
        
        generate_pos ();
        
        function generate_pos () {
          position = {
            x: tile_size * (Math.floor(Math.random() * (map_size / tile_size))) * (Math.round(Math.random()) === 0 ? -1 : 1) + tile_size / 2,
            y: tile_size * (Math.floor(Math.random() * (map_size / tile_size))) * (Math.round(Math.random()) === 0 ? -1 : 1) + tile_size / 2
          }
          
          for (var _tile of tiles) {
            if (check_there (_tile, position)) {
              generate_pos ();
            }
          }
        }
        
        running_round.tiles.push(
          new Tile ({
            id: `goal_tile`,
            type: goal_tile,
            position: position
          }).initiate (game)
        )
        
        var dir_link = directions[Math.round(Math.random() * (directions.length - 1))];
        
        var path_tile_tile = running_round.tiles[0];
        var path;
        
        while (true) {
          path = path ? dir_link (path.tile, path_tile, true) : dir_link (path_tile_tile, path_tile, true);
          path_tile_tile = path.tile;
          running_round.tiles.push(path_tile_tile);
          if (path.check) break;
          else path_tile_tile.initiate (game);
        }
      }
      break;
  }
}

this.event = function (event, game) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.custom.restrictions = [];
      for (let i = 0; i < dir_names.length; i++) {
        ship.custom.restrictions.push({
          clickable: false,
          visible: true,
          stroke: "grey",
          color: "grey"
        });
      }
      
      generate_ui (ship);
      
      current_team = current_team == team_colors.length - 1 ? 0 : current_team + 1;
      
      var team_color = team_colors[current_team];
      var team_value = team_values[current_team];
      var hue_value = hue_values[current_team];
      
      ship.setUIComponent({
        id: "team",
        position: [76, 1, 4, 6.4],
        components: [
          { type: "box", position: [0,0,100,100], stroke: team_color, width: 2},
          { type: "text", position: [5, 10, 90, 60], value: team_value, color: team_color},
          { type: "text", position: [5, 65, 90, 25], value: `[${team_color.toUpperCase()}]`, color: team_color}
        ]
      });
      
      ship.set ({
        hue: hue_value
      });
      
      ship.custom.team = current_team;
      
      switch (ship.custom.team) {
        case 0:
          ship.custom.position = {
            x: curr_team_A.position.x,
            y: curr_team_A.position.y
          };
          break;
        case 1:
          ship.custom.position = {
            x: curr_team_B.position.x,
            y: curr_team_B.position.y
          };
          break;
        case 2:
          ship.custom.position = {
            x: curr_team_C.position.x,
            y: curr_team_C.position.y
          };
          break;
        case 3:
          ship.custom.position = {
            x: curr_team_D.position.x,
            y: curr_team_D.position.y
          };
          break;
      }
      ship.set({
        x: ship.custom.position.x,
        y: ship.custom.position.y
      })
      break;
    case "ui_component_clicked":
      if (!ship.custom.ui_tick || ship.custom.ui_tick - game.step < -30) {
        ship.custom.ui_tick = game.step;
        switch (event.id) {
          case "left":
            if (ship.custom.surr_left_avail) {
              ship.custom.position = { x: ship.custom.position.x - tile_size, y: ship.custom.position.y };
            }
            break;
          case "right":
            if (ship.custom.surr_right_avail) {
              ship.custom.position = { x: ship.custom.position.x + tile_size, y: ship.custom.position.y };
            }
            break;
          case "up":
            if (ship.custom.surr_up_avail) {
              ship.custom.position = { x: ship.custom.position.x, y: ship.custom.position.y + tile_size };
            }
            break;
          case "down":
            if (ship.custom.surr_down_avail) {
              ship.custom.position = { x: ship.custom.position.x, y: ship.custom.position.y - tile_size };
            }
            break;
        }
      }
      break;
  }
}
