// Start preliminary settings ----------

const gameSkip = 30;

const customMap = "99999999999999999999999999999999999999999999999999\n"+
"99999999999999999999999999999999999999999999999999\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99                                              99\n"+
"99999999999999999999999999999999999999999999999999\n"+
"99999999999999999999999999999999999999999999999999";
const customShips = {
  waiter: '{"name":"Waiter","level":1.1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Waiter","level":1.1,"model":1,"code":121,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'
};

const playersReq = 4;

// End preliminary settings ----------

// Start preliminary functions ----------

const rand = function (n) {
  return ~~(Math.random() * n);
};

const hideUI = function (id, ship) {
  ship.setUIComponent({
    id: id,
    position: [0, 0, 0, 0],
    visible: false,
    clickable: false
  });
};
const getCrystals = function (ship) {
  return ((Math.pow((Math.trunc(ship.type / 100) || 0), 2)) * 20) / 2;
};

// End preliminary functions ----------

// Start preliminary constants ----------

const uis = {
  waitPlayers: {
    id: "waitPlayers",
    position: [40, 15, 20, 10],
    visible: true,
    components: [{
        type: "text",
        position: [0, 0, 100, 50],
        value: "Waiting for more players...️",
        color: "#cde"
      },
      {
        type: "text",
        position: [0, 50, 100, 50],
        color: "#cde"
      }
    ]
  }
};

// End preliminary constants ----------

// Start preliminary variables ----------

let genFinished = false;
let started = false;

let currTeamNum = 0;

// End preliminary variables ----------

// Start object settings ----------

const blockProps = {
  size: 5,
  depth: -50,
  obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
  colors: ["#1a3", "#2a3", "#3a3", "#4a3", "#5a3", "#6a3", "#7a3", "#8a3", "#9a3"]
};

const bedProps = {
  size: 10,
  depth: -45,
  obj: "",
  tex: "",

  maxHP: 1000
};

// End object settings ----------

// Start preliminary position constants ----------

const sizes = {
	centre: 16,
	median: 4,
	base: 8
};

const dists = {
	base: 40,
	median: 20,
	
	spawn: sizes.base / 2,
	bed: sizes.base * 1 / 4
};

const seedPos = {
	centre: { x: 0, y: 0 },
	
	median1: { x: -dists.median, y: 0 },
	median2: { x: 0, y: dists.median },
	median3: { x: dists.median, y: 0 },
	median4: { x: 0, y: -dists.median },
	
	base1: { x: -dists.base, y: 0 },
	base2: { x: 0, y: dists.base },
	base3: { x: dists.base, y: 0 },
	base4: { x: 0, y: -dists.base }
};

const spawnPos = [
  { x: -dists.base - dists.spawn, y: 0 },
  { x: 0, y: dists.base + dists.spawn },
  { x: dists.base + dists.spawn, y: 0 },
  { x: 0, y: -dists.base - dists.spawn }
];

const bedPos = [
  { x: -dists.base - dists.bed, y: 0 },
  { x: 0, y: dists.base + dists.bed },
  { x: dists.base + dists.bed, y: 0 },
  { x: 0, y: -dists.base - dists.bed }
];

// End preliminary position constants ----------

// Start object storage constants ----------

const blocks = [];
const beds = [];

const seeds = {};

// End object storage constants ----------

// Start object classes ----------

class Block {
  constructor({
    pos: POS,
    auto: AUTO
  }) {
    this.id = `block-${blocks.length}`;
    this.pos = POS;
    this.auto = AUTO;
  }

  init() {
    blocks.push(this);
    game.setObject({
      id: this.id,
      position: {
        x: this.pos.x * blockProps.size,
        y: this.pos.y * blockProps.size,
        z: blockProps.depth
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: blockProps.size,
        y: blockProps.size,
        z: blockProps.size
      },
      type: {
        id: this.id,
        obj: blockProps.obj,
        emissiveColor: blockProps.colors[rand(blockProps.colors.length)]
      }
    });
    return this;
  }
}

class Bed {
  constructor({
    pos: POS,
    rot: ROT
  }) {
    this.id = `bed-${beds.length}`;
    this.pos = POS;
    this.rot = ROT;
    this.HP = bedProps.maxHP;
  }

  init() {
    beds.push(this);
    game.setObject({
      id: this.id,
      position: {
        x: this.pos.x * bedProps.size,
        y: this.pos.y * bedProps.size,
        z: bedProps.depth
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      scale: {
        x: bedProps.size,
        y: bedProps.size,
        z: bedProps.size
      },
      type: {
        id: this.id,
        obj: bedProps.obj,
        emissive: bedProps.tex
      }
    });
    return this;
  }
}

// End object classes ----------

// Start helper functions for this.tick ----------

const checkThere = function (block) {
	blocks.forEach((b) => {
		if (b.pos.x == block.pos.x && b.pos.y == block.pos.y) {
			return true;
		}
	});
	return false;
};

const move = function (block, dir = "left", remove = false, auto = true) {
	let newPos = {};
	switch (dir) {
		case "left":
			newPos = { x: block.pos.x - 1, y: block.pos.y };
			break;
		case "up":
			newPos = { x: block.pos.x, y: block.pos.y + 1 };
			break;
		case "right":
			newPos = { x: block.pos.x + 1, y: block.pos.y };
			break;
		case "down":
			newPos = { x: block.pos.x, y: block.pos.y - 1 };
			break;
	}
	let newBlock = new Block({
		pos: newPos,
		auto: true
	});
	let checkRes = checkThere(newBlock);
	if (!remove) {
		if (auto) {
			if (!checkRes) {
				newBlock.init();
			}
		}
		else {
			newBlock.init();
		}
	}
	return newBlock;
};

// End helper functions for this.tick ----------

// Start functions for this.tick ----------

const genSeeds = function () {
	for (let seed in seedPos) {
		seeds[seed] = new Block({
			pos: { x: seedPos[seed].x, y: seedPos[seed].y },
			auto: true
		});
	}
};

const genIsle = function (seed, size) {
	let flip = 0;
	let currBlock = new Block({
		pos: { x: seed.pos.x + size / 2, y: seed.pos.y + size / 2 },
		auto: true
	}).init();
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size - 1; j++) {
			currBlock = flip == 0 ? move(currBlock, "down") : move(currBlock, "up");
		}
		if (i < size - 1) {
			currBlock = move(currBlock, "left");
		}
		flip = flip == 0 ? 1 : 0;
	}
};

const waitPlayers = function () {
  if (game.ships.length < playersReq) {
    uis.waitPlayers.components[1].value = `${playersReq - game.ships.length} player(s) remaining`;
    game.setUIComponent(uis.waitPlayers);
    game.ships.forEach((ship) => {
      if (ship.custom.teamNum != null) {
        ship.set({
          x: spawnPos[ship.custom.teamNum].x * blockProps.size,
          y: spawnPos[ship.custom.teamNum].y * blockProps.size,
          vx: 0,
          vy: 0,
          type: 111,
          crystals: getCrystals(ship),
          stats: 99999999,
          collider: false,
          idle: true
        });
      }
    });
  }
  else {
    hideUI("waitPlayers", game);
    game.ships.forEach((ship) => {
      ship.set({
        collider: true,
        idle: false
      });
    });
    started = true;
  }
};

// End functions for this.tick ----------

// Start functions for this.event ----------



// End functions for this.event

this.options = {
  root_mode: "",
  friendly_colors: 4,
  map_size: 50,
  custom_map: customMap,
  asteroids_strength: 1000000,
  ships: Object.values(customShips),
  radar_zoom: 1,
  max_players: 20
};

this.tick = function() {
  if (game.step % gameSkip == 0) {
		if (genFinished) {
		  if (started) {
		    
		  }
		  else {
		    waitPlayers();
		  }
		}
		else {
			genSeeds();
			
			genIsle(seeds.centre, sizes.centre);
			
			genIsle(seeds.median1, sizes.median);
			genIsle(seeds.median2, sizes.median);
			genIsle(seeds.median3, sizes.median);
			genIsle(seeds.median4, sizes.median);
			
			genIsle(seeds.base1, sizes.base);
			genIsle(seeds.base2, sizes.base);
			genIsle(seeds.base3, sizes.base);
			genIsle(seeds.base4, sizes.base);
			
			genFinished = true;
		}
  }
};

this.event = function(event) {
  switch (event.name) {
    case "ship_spawned":
      ship.custom = {
        teamNum: currTeamNum
      };
      currTeamNum = currTeamNum < 4 ? currTeamNum + 1 : 0;
      break;
    case "ui_component_clicked":
      break;
  }
};
