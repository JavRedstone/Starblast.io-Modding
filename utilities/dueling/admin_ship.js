this.options = {
  root_mode: "",
  map_size: 30
};

const aspectX = 16;
const aspectY = 9;

const multiplier = 10;
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
        shortcut: "X",
        components: [
          { type: "box", position: [0, 0, 100, 100], stroke: "#CDE", width:2 },
        ]
      });
    }
  }
}

let searchEntity = function(ship, entity, x, y) {
  return entity.x >= x * multiplier && entity.y >= y * multiplier && entity.x <= (x + 1) * multiplier && entity.y <= (y + 1) + multiplier;
}

let findEntity = function(ship, x, y) {
  for (let _ship of game.ships) {
    if (ship.id != _ship.id && searchEntity(_ship)) {
      _ship.gameover({ "Skill": "Issue" });
    }
  }
  for (let alien of game.aliens) {
    if (searchEntity(alien)) {
      alien.set({ kill: true });
    }
  }
  for (let asteroid of game.asteroids) {
    if (searchEntity(asteroid)) {
      asteroid.set({ kill: true });
    }
  }
}

this.tick = function() {
  if (game.step % 20 == 0) {
    for (let ship of game.ships) {
      if (!ship.custom.admin) {
        setButtons(ship);
        ship.custom.admin = true;
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
      let component = event.id;
      let x = parseInt(component.charAt(0));
      let y = parseInt(component.charAt(2));
      findEntity(ship, x, y);
      break
  }
}
