var Spectator_102 = '{"name":"Spectator","level":1,"model":2,"size":0.1,"zoom":0.3,"specs":{"shield":{"capacity":[10000,10000],"reload":[10000,10000]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0.1,"speed":[1000,1000],"rotation":[500,500],"acceleration":[100000,100000]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,0,0,0,0,0,0],"height":[0,0,0.1,0.1,0.1,0.1,0,0,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]}},"typespec":{"name":"Spectator","level":1,"model":2,"code":102,"specs":{"shield":{"capacity":[10000,10000],"reload":[10000,10000]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0.1,"speed":[1000,1000],"rotation":[500,500],"acceleration":[100000,100000]}},"shape":[0.13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.15}}';

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
  { text: "I'm Dueling", icon: "\u00be", key: "D" },
  { text: "Thanks", icon: "\u0041", key: "X" },
  { text: "Kill", icon: "\u005b", key: "K" },
  { text: "Follow", icon: "\u0050", key: "F" },
  { text: "Me", icon: "\u004f", key: "E" },
  { text: "Leave", icon:"\u00b3", key: "L" },
];

var switch_arr = [1, 2, 4, 6, 7, 8, 4];

this.options = {
  map_name: "Dueling by JavRedstone",
  ships: [Spectator_102],
  starting_ship: 605,
  reset_tree: false,
  max_players: 60,
  vocabulary: vocabulary,
  lives: 5,
  map_size: 70,
  custom_map: [],
  crystal_value: 0,
  asteroids_strength: 3,
  speed_mod: 1.2,
};

function get_crystals(type) {
  switch(Math.trunc(type/100)) {
    case 1:
      return 20;
    case 2:
      return 80;
    case 3:
      return 180;
    case 4:
      return 320;
    case 5:
      return 500;
    case 6:
      return 720;
    case 7:
      return 980;
  }
}

function get_stats(type) {
  switch(Math.trunc(type/100)) {
    case 1:
      return 11111111;
    case 2:
      return 22222222;
    case 3:
      return 33333333;
    case 4:
      return 44444444;
    case 5:
      return 55555555;
    case 6:
      return 66666666;
    case 7:
      return 77777777;
  }
}

function list_players() {
  var list = "PLAYER LIST:\n";
  for (var ship of game.ships) {
    list += `${ship.id}: ${ship.name}\n`;
  }
  return list;
}

var names = ["switch_left", "switch_right", "spawn", "spectate", "reset", "heal"];
var values = ["<", ">", "🏠", "🧐", "↩️", "💖"];

function generate_ui(ship) {
  for (var i = 0; i < names.length; i++) {
    ship.setUIComponent({
      id: names[i],
      position: [56 + i * 4, 1, 4, 6.4],
      clickable: true,
      shortcut: `${i + 1}`,
      visible: true,
      components: [
        { type: "box", position: [0,0,100,100], stroke: "white", width: 2},
        { type: "text", position: [5, 10, 90, 60], value: values[i], color: "white"},
        { type: "text", position: [5, 65, 90, 25], value: `[${i + 1}]`, color: "white"}
      ]
    });
  }
}

this.tick = function(game) {
  switch(true) {
    case game.step % 30 === 0:
      for (var ship of game.ships) {
        switch(true) {
          case !ship.custom.ui_installed:
            generate_ui(ship);
            ship.custom.ui_installed = true;
            break;
          case ship.custom.spectate:
            ship.set({
              type: 102,
              crystals: 0,
              collider: false
            });
            break;
        }
      }
      break;
  }
};

this.event = function(event, game) {
  var ship = event.ship;
  switch(event.name) {
    case "ship_spawned":
      ship.set({
        x: 0,
        y: 0,
        invulnerable: 360,
        crystals: get_crystals(game.options.starting_ship),
        stats: get_stats(game.options.starting_ship)
      });
      echo(list_players());
      break;
    case "ship_destroyed":
      echo(list_players());
      break;
    case "ui_component_clicked":
      switch(event.id) {
        case "switch_left":
          var previous = 704;
          if (`${ship.type}`.charAt(2) == '1') {
            switch(Math.trunc(ship.type/100)) {
              case 1:
                break;
              case 2:
                previous = 101;
                break;
              case 3:
                previous = 202;
                break;
              case 4:
                previous = 304;
                break;
              case 5:
                previous = 406;
                break;
              case 6:
                previous = 507;
                break;
              case 7:
                previous = 608;
                break;
            }
          }
          else {
            previous = ship.type - 1;
          }
          if (!ship.custom.spectate) {
            ship.set({
              type: previous,
              shield: 999,
              crystals: get_crystals(previous),
              stats: get_stats(previous)
            });
          }
          break;
        case "switch_right":
          var next = 701;
          if (parseInt(`${ship.type}`.charAt(2)) == switch_arr[Math.trunc(ship.type/100) - 1]) {
            next = ship.type < 704 ? parseInt(`${Math.trunc((ship.type + 100)/100)}` + "01") : 101;
          }
          else {
            next = ship.type + 1;
          }
          if (!ship.custom.spectate) {
            ship.set({
              type: next,
              shield: 999,
              crystals: get_crystals(next),
              stats: get_stats(next)
            });
          }
          break;
        case "spectate":
          ship.custom.spectate ? ship.set({
            type: game.options.starting_ship,
            crystals: get_crystals(game.options.starting_ship),
            stats: get_stats(game.options.starting_ship),
            collider: true
          }) : ship.set({
            type: 102,
            crystals: 0,
            collider: false,
            stats: get_stats(102)
          });
          ship.custom.spectate = !ship.custom.spectate;
          break;
        case "reset":
          if (!ship.custom.spectate) {
            ship.set({
              type: 101,
              shield: 999,
              crystals: get_crystals(101),
              stats: get_stats(101)
            });
          }
          break;
        case "heal":
          ship.set({
            shield: 999,
            crystals: get_crystals(ship.type),
            stats: get_stats(ship.type)
          });
          break;
        case "spawn":
          ship.set({
            x: 0,
            y: 0
          });
      }
      break;
  }
}
