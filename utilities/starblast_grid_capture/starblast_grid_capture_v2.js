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
  started: false,
};

this.tick = function (game) {
  switch (true) {
    case game.step === 0:
      
      break;
    case game.step % 30 === 0:
      
      break;
  }
}
