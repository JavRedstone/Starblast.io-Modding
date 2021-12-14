// Start preliminary settings ----------

const gameSkip = 30;

// End preliminary settings ----------

// Start preliminary functions ----------

const rand = function(n) {
  return ~~(Math.random() * n);
};

// End preliminary functions ----------

// Start preliminary variables ----------

let genFinished = false;

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
	centre: 8,
	median: 2,
	base: 4
};
const dists = {
	base: 25,
	median: 15,
	
	spawn: sizes.base / 2,
	bed: sizes.base * 3 / 4
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

// End preliminary position constants ----------

// Start object storage variables ----------

const blocks = [];
const beds = [];

const seeds = {};

// End object storage variables ----------

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
		pos: { x: seed.pos.x + size, y: seed.pos.y + size },
		auto: true
	}).init();
	for (let i = 0; i < 2 * size; i++) {
		for (let j = 0; j < 2 * size - 1; j++) {
			currBlock = flip == 0 ? move(currBlock, "down") : move(currBlock, "up");
		}
		if (i < size * 2 - 1) {
			currBlock = move(currBlock, "left");
		}
		flip = flip == 0 ? 1 : 0;
	}
};

// End functions for this.tick ----------

// Start functions for this.event ----------



// End functions for this.event

this.options = {
  root_mode: "",
  friendly_colors: 4,
  map_size: 50,
  custom_map: "",
  asteroids_strength: 1000000,

  radar_zoom: 1,

  max_players: 20
};

this.tick = function() {
  if (game.step % gameSkip == 0) {
		if (genFinished) {
		
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

};
