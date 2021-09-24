var Ship_101 = '{"name":"Ship","level":1,"model":1,"size":1,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":1000,"speed":[1,1],"rotation":[1000,1000],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Ship","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[1000,1000],"reload":[1000,1000]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":1000,"speed":[1,1],"rotation":[1000,1000],"acceleration":[1,1]}},"shape":[1.3,1.253,1.041,0.919,0.841,0.788,0.753,0.73,0.722,0.74,0.807,0.906,1.04,1.587,1.626,1.692,1.767,1.74,1.661,1.607,1.452,1.348,1.272,1.53,1.527,1.503,1.527,1.53,1.272,1.348,1.452,1.607,1.661,1.74,1.767,1.692,1.626,1.587,1.576,0.906,0.807,0.74,0.722,0.73,0.753,0.788,0.841,0.919,1.041,1.253],"lasers":[],"radius":1.767}}';

var ships = [];

ships.push(Ship_101);

this.options = {
  map_size: 30,
  custom_map: "",
  ships: ships,
  reset_tree: true
};

var team_colors = ["red", "yellow", "green", "blue"];
var team_values = ["R", "Y", "G", "B"];
var hue_values = [0, 60, 120, 240];
var current_team = team_colors.length - 1;

var dir_names = ["left", "right", "up", "down", "team"];
var dir_values = ["🡸", "🡺", "🡹", "🡻"];
var dir_shortcuts = ["A", "S", "W", "D"];

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

var map_size;
var grid_size = 20;
var move_in = 1;

var white_grid = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/White_Grid.png";
var red_grid = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Red_Grid.png";
var yellow_grid = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Yellow_Grid.png";
var green_grid = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Green_Grid.png";
var blue_grid = "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_grid_capture/Blue_Grid.png";

var depth = -10;

function generate_grid (i, j, image) {
  game.setObject({
    id: `grid_${i}_${j}`,
    type: {
      id: `grid_${i}_${j}_image`,
      obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
      emissive: image
    },
    position: {x: i, y: j, z: depth},
    rotation: {x: 0, y: Math.PI, z: Math.PI},
    scale: {x: grid_size, y: grid_size, z: 0}
  });
}

function generate_map () {
  for (let i = -map_size + grid_size * move_in; i < map_size - grid_size * move_in; i += grid_size) {
    generate_grid(i, -map_size + grid_size * move_in, white_grid);
    generate_grid(i, map_size - grid_size * (1 + move_in), white_grid);
    generate_grid(-map_size + grid_size * move_in, i, white_grid);
    generate_grid(map_size - grid_size * (1 + move_in), i, white_grid);
  }

  for (let i = 0; i < grid_size * 2; i += grid_size){
    for (let j = 0; j < grid_size * 2; j += grid_size){
      generate_grid(-map_size + grid_size * (1 + move_in) + i, -map_size + grid_size * (1 + move_in) + j, red_grid);
      generate_grid(map_size - grid_size * (3 + move_in) + i, -map_size + grid_size * (1 + move_in) + j, yellow_grid);
      generate_grid(-map_size + grid_size * (1 + move_in) + i, map_size - grid_size * (3 + move_in) + j, green_grid);
      generate_grid(map_size - grid_size * (3 + move_in) + i, map_size - grid_size * (3 + move_in) + j, blue_grid);
    }
  }
}

this.tick = function (game) {
  switch (true) {
    case game.step === 0:
      map_size = game.options.map_size * 5;
      generate_map ();
      break;
    case game.step % 30 === 0:
      for (var ship of game.ships) {
        if (!ship.custom.position) {
          ship.set ({
            x: ship.custom.position.x,
            y: ship.custom.position.y
          });
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
            x: -map_size + grid_size * (2 + move_in + 0.25),
            y: -map_size + grid_size * (2 + move_in + 0.25)
          };
          break;
        case 1:
          ship.custom.position = {
            x: map_size - grid_size * (3 + move_in - 0.25),
            y: -map_size + grid_size * (2 + move_in + 0.25)
          };
          break;
        case 2:
          ship.custom.position = {
            x: -map_size + grid_size * (2 + move_in + 0.25),
            y: map_size - grid_size * (3 + move_in - 0.25)
          };
          break;
        case 3:
          ship.custom.position = {
            x: map_size - grid_size * (3 + move_in - 0.25),
            y: map_size - grid_size * (3 + move_in - 0.25)
          };
          break;
      }
      ship.set({
        x: ship.custom.position.x,
        y: ship.custom.position.y
      })
      break;
    case "ui_component_clicked":
      switch (event.id) {
        case "left":
          ship.custom.position = { x: ship.custom.position.x - grid_size, y: ship.custom.position.y };
          break;
        case "right":
          ship.custom.position = { x: ship.custom.position.x + grid_size, y: ship.custom.position.y };
          break;
        case "up":
          ship.custom.position = { x: ship.custom.position.x, y: ship.custom.position.y + grid_size };
          break;
        case "down":
          ship.custom.position = { x: ship.custom.position.x, y: ship.custom.position.y - grid_size };
          break;
      }
      break;
  }
}
