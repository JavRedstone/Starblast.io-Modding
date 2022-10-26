this.options = {
  root_mode: "",
  map_size: 30,
  choose_ship: [101, 201]
};

const aspectX = 16;
const aspectY = 9;

const multiplier = 5.5;
const resMultiplier = 0.69420; // It works, and its funny

const resolutionX = aspectX * resMultiplier;
const resolutionY = aspectY * resMultiplier;

let setButtons = function(ship) {
  for (let i = 0; i < aspectX; i++) {
    for (let j = 0; j < aspectY; j++) {
      ship.setUIComponent({
        id: `${i} ${j}`,
        position: [i * resolutionY, j * resolutionX, resolutionY, resolutionX],
        clickable: true,
        shortcut: "H",
        components: [
          { type: "box", position: [0, 0, 100, 100], stroke: "#CDE", width:2 },
        ]
      });
    }
  }
}

let setClicked = function(ship) {
  ship.custom.clicked = [];
  for(let i = 0; i < aspectX; i++) {
    ship.custom.clicked.push(new Array(aspectY));
  }
}

let setGrid = function(ship) {
  for (let i = 0; i < aspectX; i++) {
    for (let j = 0; j < aspectY; j++) {
      game.setObject ({
        id: `${ship.id} ${i} ${j}`,
        type: {
          id: `${ship.id} ${i} ${j}`,
          obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
          emissive: !ship.custom.clicked[i][j] ? "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/dueling/admin/admin_tile.png" : "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/dueling/admin/admin_selected_tile.png"
        },
        position: { x: ship.x +  (i - aspectX / 2 + 0.5) * multiplier, y: ship.y + (j - aspectY / 2 + 0.5) * multiplier, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: multiplier, y: multiplier, z: multiplier }
      });
    }
  }
}

let searchEntity = function(ship, entity, x, y) {
  echo(entity.x + " " + entity.y + " " + ship.x +  (x - aspectX / 2 + 0.5) * multiplier + " " + ship.y +  (y - aspectY / 2 + 0.5) * multiplier);
  return entity.x >= ship.x +  (x - aspectX / 2 + 0.5) * multiplier && entity.y >= ship.y +  (y - aspectY / 2 + 0.5) * multiplier && entity.x <= ship.x +  (x - aspectX / 2 + 1.5) * multiplier && entity.y <= ship.y +  (y - aspectY / 2 + 1.5) * multiplier;
}

let findEntity = function(ship, x, y) {
  for (let _ship of game.ships) {
    if (ship.id != _ship.id && searchEntity(ship, _ship, x, y)) {
      _ship.gameover({ "Skill": "Issue" });
    }
  }
  for (let alien of game.aliens) {
    if (searchEntity(ship, alien, x, y)) {
      alien.set({ kill: true });
    }
  }
  for (let asteroid of game.asteroids) {
    if (searchEntity(ship, asteroid, x, y)) {
      asteroid.set({ kill: true });
    }
  }
}

this.tick = function() {
  if (game.step % 120 == 0) {
    for (let ship of game.ships) {
      if (ship.type == 101) {
        if (!ship.custom.admin) {
          setButtons(ship);
          setClicked(ship);
          ship.custom.admin = true;
        }
        else {
          setGrid(ship);
        }
      }
    }
  }
}

this.event = function(event) {
  let ship = event.ship;
  switch (event.name) {
    case 'ship_spawned':
      ship.custom.admin = false;
      break;
    case 'ui_component_clicked':
      let id = event.id;
      let x = parseInt(id.charAt(0));
      let y = parseInt(id.charAt(2));
      findEntity(ship, x, y);
      break
  }
}
