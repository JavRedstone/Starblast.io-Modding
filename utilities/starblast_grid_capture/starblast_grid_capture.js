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

function get_team_pos (team) {
  switch (team) {
    case 0:
      return {
        x: curr_team_A.position.x,
        y: curr_team_A.position.y
      };
    case 1:
      return {
        x: curr_team_B.position.x,
        y: curr_team_B.position.y
      };
    case 2:
      return {
        x: curr_team_C.position.x,
        y: curr_team_C.position.y
      };
    case 3:
      return {
        x: curr_team_D.position.x,
        y: curr_team_D.position.y
      };
  }
}

function generate_ui (ship) {
  for (let i = 0; i < dir_names.length; i++) {
    ship.setUIComponent({
      id: dir_names[i],
      position: [60 + i * 4, 1, 4, 6.4],
      clickable: ship.custom.restrictions[i].clickable,
      shortcut: `${dir_shortcuts[i]}`,
      visible: true,
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

var num = 0;
var running_round = null;

var scores = [0, 0, 0, 0];

function generate_scoreboard (ship) {
  var scoreboard = {
    id: "scoreboard",
    components: [
      {
        type: "box",
        position: [0, 75, 100, 15],
        stroke: "magenta",
        width: 2
      },
      {
        type: "text",
        position: [0, 75, 60, 15],
        value: "ROUND:",
        color: "magenta",
        align: "left"
      },
      {
        type: "text",
        position: [0, 75, 100, 15],
        value: num,
        color: "magenta",
        align: "right"
      }  
    ]
  };
  
  for (let i = 0; i < team_colors.length; i++) {
    scoreboard.components.push (
      {
        type: "box",
        position: [0, i * 15, 100, 15],
        fill: ship.custom.team == i ? "rgba(96, 255, 255, 0.3)" : "rgba(0, 0, 0, 0)",
        stroke: team_colors[i],
        width: 2
      },
      {
        type: "text",
        position: [0, i * 15, 40, 15],
        value: `${team_colors[i].toUpperCase()}:`,
        color: team_colors[i],
        align: "left"
      },
      {
        type: "text",
        position: [0, i * 15, 100, 15],
        value: scores[i],
        color: team_colors[i],
        align: "right"
      }
    );
  }
  
  ship.setUIComponent (scoreboard);
}

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
      id: ID,
      type: image,
      position: { x: px, y: py },
    }) {
      this.id = ID;
      this.position = { x: px, y: py, z: depth };
      this.rotation = { x: 0, y: Math.PI, z: Math.PI }
      this.scale = { x: tile_size, y: tile_size, z: 0 };
      this.type = {
        id: ID,
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
      this.num = num + 1;
      this.tiles = [];
    }
    
    start() {
      num++;
      return this;
    }
}

var map_size = map_size_small * 5;
var tile_size = 20;

var corner_A = { x: -map_size + tile_size, y: map_size - tile_size };
var corner_B = { x: map_size - tile_size, y: map_size - tile_size };
var corner_C = { x: map_size - tile_size, y: -map_size + tile_size };
var corner_D = { x: -map_size + tile_size, y: -map_size + tile_size };

var corner_tile_center = new Tile ({
  id: "corner_tile_center",
  type: white_tile,
  position: { x: map_size, y: map_size }
}).initiate(game);

var corner_tile_A = new Tile ({
  id: "corner_tile_A",
  type: white_tile,
  position: { x: corner_A.x, y: corner_A.y }
}).initiate(game);

var corner_tile_B = new Tile ({
  id: "corner_tile_B",
  type: white_tile,
  position: { x: corner_B.x, y: corner_B.y }
}).initiate(game);

var corner_tile_C = new Tile ({
  id: "corner_tile_C",
  type: white_tile,
  position: { x: corner_C.x, y: corner_C.y }
}).initiate(game);

var corner_tile_D = new Tile ({
  id: "corner_tile_D",
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
  for (let i = 0; i < map_size * 2 / tile_size - 3; i++) {
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

function get_winning_team () {
  var _team_colors = team_colors;
  var _scores = scores;
  
  let n = _scores.length;
  for (let i = 1; i < n; i++) {
    let curr = _scores[i];
    let j = i - 1; 
    while (j > -1 && curr < _scores[j]) {
      _scores[j + 1] = _scores[j];
      _team_colors[j + 1] = _team_colors[j];
      j--;
    }
    _scores[j + 1] = curr;
  }
  
    var winning_teams = [
      {
        color: _team_colors[0],
        score: _scores[0]
      }
    ];
  
  for (let i = 1; i < _team_colors.length; i++) {
    if (_scores[i] == _scores[0]) {
      winning_teams.push(
        {
          color: _team_colors[i],
          score: _scores[i]
        }
      );
    }
  }
  
  return winning_teams;
}

this.tick = function (game) {
  switch (true) {
    case game.step === 0:
      generate_border ();
      generate_base ();
      break;
    case game.step % 20 === 0:
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
        
        generate_scoreboard (ship);
        
        if (check_there (running_round.tiles[0], ship.custom.position)) {
          ship.scores++;
          scores[ship.custom.team]++;
          
          var pos = get_team_pos (ship.custom.team);
          
          for (var _ship of game.ships) {
             _ship.custom.position = pos;
            
            var msg = `${team_colors[ship.custom.team].toUpperCase()} has scored a point!`;
            
            if (num == 25) {
              var teams = get_winning_team ();
              
              var team_msg = "";
              
              for (var team of teams) {
                team_msg += `[${team.color.toUpperCase()}] `;
              }
              
              msg += `\n 25 rounds have been reached! The winning team(s): ${team_msg}with score ${teams[0].score}`;
            }
            
            generate_message (msg, _ship);
            
            ship.custom.message_on = game.step;
          }
        }
        
        if (ship.custom.message_on && ship.custom.message_on - game.step <= -500) {
          hide_message (ship);
        }
      }
      
      if (running_round && game.step % 1000 === 0) {
        for (var tile of running_round.tiles) {
          var replaced_tile = new Tile ({
            id: tile.id,
            type: "",
            position: {}
          }).initiate (game);
          
          replaced_tile.position = { x: tile.position.x, y: tile.position.y };
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
          
          // Check if it is inside an existing tile
          for (var _tile of tiles) {
            if (check_there (_tile, position)) {
              return generate_pos ();
            }
          }
        }
        
        // Create a goal tile
        var goal_tile_tile = new Tile ({
          id: `goal_tile`,
          type: goal_tile,
          position: position
        }).initiate (game);
        
        running_round.tiles.push (goal_tile_tile);
        
        var dir_link = directions[Math.round (Math.random () * (directions.length - 1))];
        
        var path_tile_tile = goal_tile_tile;
        var path;
        
        var i = 0;
        
        // Create the path tiles
        while (true) {
          path = path ? dir_link (path.tile, path_tile, true) : dir_link (path_tile_tile, path_tile, true);
          path_tile_tile = path.tile;
          path_tile_tile.id = `${num}_path_tile_${i}`;
          running_round.tiles.push(path_tile_tile);
          i++;
          if (path.check) break;
          path_tile_tile.initiate (game);
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
      
      ship.custom.position = get_team_pos (ship.custom.team);
      
      ship.set ({
        x: ship.custom.position.x,
        y: ship.custom.position.y
      });
      
      ship.custom.scores = 0;
      generate_scoreboard (ship);
      break;
    case "ui_component_clicked":
      if (!ship.custom.ui_tick || ship.custom.ui_tick - game.step < -20) {
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
