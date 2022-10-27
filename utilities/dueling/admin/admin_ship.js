// Admin ship that is unorthodox

this.options = {
  root_mode: "",
  custom_map: "",
  map_size: 30,
  starting_ship_maxed: true,
  choose_ship: [101, 201]
};

const aspectX = 16;
const aspectY = 9;

const multiplier = 6.675; // FOV specifc, NEEDS TRIAL AND ERROR, for example: Fly is 5.5, Delta is 6.675
const resMultiplier = 0.69420; // It works, and its funny

const resolutionX = aspectX * resMultiplier;
const resolutionY = aspectY * resMultiplier;

// *** PLEASE USE THIS FOR TESTING IN ORDER TO CHANGE THE multiplier VALUE, NOT THE resMultiplier VALUE ***
// TEST UNTIL GRID PERFECTLY MATCHES UI. MAKE SURE YOUR SCREEN IS 16:9 (doesnt matter fullscreen or not) AND NOT ON A PHONE OR A VERTICALLY PLACED SCREEN
// MAKE SURE THE UI GRIDS ARE SQUARES
const hasGrid = false; // Please set off during gameplay unless you want an extreme delay before you kill someone who has just joned the game

const gameStep = 20;
const instructorDelay = 30; // Actual # of seconds is instructorDelay * gameStep / 60, this is 10s

let setButtons = function(ship) {
  for (let i = 0; i < aspectX; i++) {
    for (let j = 0; j < aspectY; j++) {
      ship.setUIComponent({
        id: `${i} ${j}`,
        position: [i * resolutionY, j * resolutionX, resolutionY, resolutionX],
        clickable: true,
        components: [
          { type: "box", position: [0, 0, 100, 100], stroke: "#f00", width: 2 },
        ]
      });
    }
  }
  ship.setUIComponent({
    id: 'ALL',
    position: [0, 0, 0, 0],
    clickable: true,
    shortcut: 'J'
  });
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
        position: { x: ship.x +  (i - aspectX / 2 + 0.5) * multiplier, y: ship.y - (j - aspectY / 2 + 0.5) * multiplier, z: 0 },
        rotation: { x: 0, y: 0, z: Math.PI },
        scale: { x: multiplier, y: multiplier, z: multiplier }
      });
    }
  }
}

let deleteGrid = function(ship) {
  for (let i = 0; i < aspectX; i++) {
    for (let j = 0; j < aspectY; j++) {
      game.removeObject(`${ship.id} ${i} ${j}`);
    }
  }
}

let searchEntity = function(ship, entity, x, y, all) {
  // echo(entity.x + " " + entity.y + " " + x + " " + y + " " + (ship.x + (x - aspectX / 2) * multiplier) + " " + (ship.y -  (y - aspectY / 2) * multiplier) + " " + (ship.x + (x + 1 - aspectX / 2) * multiplier) + " " + (ship.y - (y + 1 - aspectY / 2) * multiplier));
  return entity.x >= ship.x + (x - aspectX / 2) * multiplier && entity.y <= ship.y - (y - aspectY / 2) * multiplier && entity.x <= ship.x + (x + (all ? 16 : 1) - aspectX / 2) * multiplier && entity.y >= ship.y - (y + (all ? 16 : 1) - aspectY / 2) * multiplier;
}

let findEntity = function(ship, x, y, all) {
  for (let _ship of game.ships) {
    if (ship.id != _ship.id && searchEntity(ship, _ship, x, y, all)) {
      _ship.set({ kill: true });
      _ship.gameover({ "Skill": "Issue" });
    }
  }
  for (let alien of game.aliens) {
    if (searchEntity(ship, alien, x, y, all)) {
      alien.set({ kill: true });
    }
  }
  for (let asteroid of game.asteroids) {
    if (searchEntity(ship, asteroid, x, y, all)) {
      asteroid.set({ kill: true });
    }
  }
}

this.tick = function() {
  if (game.step % 500 == 0 && game.asteroids.length <= 50 && game.aliens.length <= 50) {
    for (let i = 0; i < 50; i++) {
      game.addAsteroid({ x: Math.random() * 150, y: Math.random() * 150, size: 50 });
      game.addAlien({ x: -Math.random() * 150, y: -Math.random() * 150 });
    }
  }
  if (game.step % gameStep == 0) {
    for (let ship of game.ships) {
      ship.set({ shield: 1000 });
      if (ship.type == 201) {
        if (!ship.custom.admin) {
          setButtons(ship);
          setClicked(ship);
          ship.custom.admin = true;
          ship.instructorSays('Firstly, make sure you are on a 16:9 screen, fullscreen does not matter. Please do not use this on a phone or a vertically placed screen. Use arrow keys to move. Press a square on any entity (ship, alien, or asteroid) to kill it; ships will be gameovered. To kill everything on your screen, press [J]. Have fun!');
          ship.custom.instructorDelay = instructorDelay;
        }
        else {
          if (hasGrid) {
            setGrid(ship);
          }
          else {
            deleteGrid(ship);
          }
          if (ship.custom.instructorDelay <= 0) {
            ship.hideInstructor();
          }
          else {
            ship.custom.instructorDelay--;
          }
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
      if (id == 'ALL') {
        findEntity(ship, 0, 0, true);
      }
      else {
        let x = parseInt(id.split(' ')[0]);
        let y = parseInt(id.split(' ')[1]);
        findEntity(ship, x, y, false);
      }
      break;
  }
}
