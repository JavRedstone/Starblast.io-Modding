this.options = {
  map_size: 30,
  custom_map: "",
  weapons_store: false
}

var control = {
  teams: {
    colors: ["red", "yellow", "lime", "blue"],
    abbrev: ["R", "Y", "L", "B"],
    hues: [0, 60, 120, 240]
  },
  dirs: {
    names: ["left", "right", "up", "down"],
    values: ["🡸", "🡺", "🡹", "🡻"],
    shortcuts: ["A", "D", "W", "S"]
  },
  wait: {
    started: false,
    player: 4
  }
};

function generate_dirs (ship) {
  for (let i = 0; i < control.dirs.names.length; i++) {
    ship.setUIComponent({
      id: control.dirs.names[i],
      position: [60 + i * 4, 1, 4, 6.4],
      clickable: ship.custom.dir_rest[i].clickable,
      shortcut: `${control.dirs.shortcuts[i]}`,
      components: [
        { type: "box", position: [0,0,100,100], stroke: ship.custom.dir_rest[i].stroke, width: 2},
        { type: "text", position: [5, 10, 90, 60], value: control.dirs.values[i], color: ship.custom.dir_rest[i].color},
        { type: "text", position: [5, 65, 90, 25], value: `[${control.dirs.shortcuts[i]}]`, color: ship.custom.dir_rest[i].color}
      ]
    });
  }
}

this.tick = function (game) {
  switch (true) {
    case game.step === 0:
      
      break;
    case game.step % 30 === 0:
      switch (control.wait.started) {
        case true:
          
          break;
        case false:
          if (game.ships.length >= control.wait.player) {
            control.wait.started = true;
          }
          
          else {
            
          }
          break;
      }
      break;
  }
}

this.event = function (event, game) {
  var ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      for (let i = 0; i < control.dirs.names.length; i++) {
        ship.custom.rest.push({
          clickable: false,
          stroke: "grey",
          color: "grey"
        });
      }
      generate_dirs (ship);
      break;
  }
}
