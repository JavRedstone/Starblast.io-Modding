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
  depth: -10,
  obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
  colors: ["3a3", "3b3", "3c3", "3d3", "3e3", "3f3"]
};

const bedProps = {
  size: 10,
  depth: -7.5,
  obj: "",
  tex: "",

  maxHP: 1000
};

// End object settings ----------

// Start preliminary position constants ----------

const sizes = {
	centre: 16
};
const dists = {
	base: 100,
	spawn: sizes.base / 2,
	bed: sizes.base * 3 / 4
};
const seedPos = {
	centre: { x: 0, y: 0 }
};

// End preliminary position constants ----------

// Start object storage variables ----------

const blocks = [];
const beds = [];

const seeds = [];

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
			newPos = { x: block.pos.x - blockProps.size, y: block.pos.y };
			break;
		case "right":
			newPos = { x: block.pos.x + blockProps.size, y: block.pos.y };
			break;
		case "up":
			newPos = { x: block.pos.x, y: block.pos.y + blockProps.size };
			break;
		case "down":
			newPos = { x: block.pos.x, y: block.pos.y - blockProps.size };
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

const genIsle = function (seed, size) {
	let flip = 0;
	let currBlock = new Block({
		pos: { x: seed.pos.x + size, y: seed.pos.y + size },
		auto: true
	});
	for (let i = 0; i < 2 * size; i++) {
		for (let j = 0; j < 2 * size - 1; j++) {
			currBlock = flip == 0 ? move(currBlock, "down") : move(currBlock, "up");
		}
		if (i < size * 2 - 1) {
			currBlock = move(currBlock, "left");
		}
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
			genFinished = true;
		}
  }
};

this.event = function(event) {

};
