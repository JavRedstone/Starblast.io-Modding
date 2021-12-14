// Start preliminary settings ----------

const gameStep = 30;

const blockWidth = 5;
const scaleSize = blockWidth * 2 / 3;
const blockDepth = -10;

// End preliminary settings ----------

// Start preliminary constants ----------

const objects = {
  block: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/starblast_block.obj",
  bed: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/starblast_bed.obj"
};
const emissiveTexs = {
  block: [
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_block1.png",
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_block2.png",
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_block3.png"
  ],
  bed: [
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_bed1.png",
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_bed2.png",
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_bed3.png",
    "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/emissive_bed4.png"
  ]
};
const sizes = {
  centre: 15,
  median: 5,
  base: 10
};

// End preliminary constants ----------

// Start preliminary functions ----------

const rand = function (n) {
  return ~~(Math.random() * n);
};

// End preliminary functions ----------

// Start preliminary classes ----------

class Block {
  constructor({
    position: POSITION,
    rotation: ROTATION,
    scale: SCALE,
    obj: OBJ,
    emissive: EMISSIVE
  }) {
    this.id = `block-${blocks.length}`;
    this.position = POSITION;
    this.rotation = ROTATION;
    this.scale = SCALE;
    this.type = { id: this.id, obj: OBJ, emissive: EMISSIVE };
  }
  
  init () {
    blocks.push(this);
    game.setObject(this);
    
    return this;
  }
}

// End preliminary classes ----------

// Start preliminary variables ----------

let started = false;

let blocks = [];

let seeds = {
  centre: new Block({
    position: { x: 0, y: 0, z: blockDepth },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: scaleSize, y: scaleSize, z: scaleSize },
    obj: objects.block,
    emissive: emissiveTexs.block[rand(emissiveTexs.block.length)]
  }).init()
};

// End preliminary variables ----------

this.options = {
  map_size: 60,
  custom_map: "",
  radar_zoom: 1
};

// Start helper functions for this.tick ----------

const checkThere = function (block) {
  blocks.forEach((b) => {
    if (b.position.x == block.position.x && b.position.y == block.position.y && b.position.z == block.position.z) {
      return true;
    }
  });
};

const move = function (block, dir = "left", auto = true, remove = false) {
  var newPos;
  switch (dir) {
    case "left":
      newPos = { x: block.position.x - blockWidth, y: block.position.y, z: block.position.z };
      break;
    case "right":
      newPos = { x: block.position.x + blockWidth, y: block.position.y, z: block.position.z };
      break;
    case "up":
      newPos = { x: block.position.x, y: block.position.y + blockWidth, z: block.position.z };
      break;
    case "down":
      newPos = { x: block.position.x, y: block.position.y - blockWidth, z: block.position.z };
      break;
  }
  let newBlock = new Block({
    position: newPos,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: scaleSize, y: scaleSize, z: scaleSize },
    obj: objects.block,
    emissive: emissiveTexs.block[rand(emissiveTexs.block.length)]
  });
  let checkResult = checkThere(newBlock);
  if (auto && !checkResult) {
    newBlock.init();
  }
  else if (!remove) {
    newBlock.init();
  }
  return newBlock;
};

// End helper functions for this.tick ----------

// Start functions for this.tick ----------

const genCentreIsle = function () {
  let flip = 0;
  let currBlock = seeds.centre;
  for (let i = 0; i < sizes.centre; i++) {
    for (let j = 0; j < i + 1; j++) {
      currBlock = flip == 0 ? move(currBlock, "up") : move(currBlock, "down");
    }
    for (let j = 0; j < i + 1; j++) {
      currBlock = flip == 0 ? move(currBlock, "left") : move(currBlock, "right");
    }
    flip = flip == 0 ? 1 : 0;
  }
};

// End functions for this.tick ----------

this.tick = function () {
  if (game.step % gameStep == 0) {
    if (started) {
      
    }
    else {
      genCentreIsle();
      started = true;
    }
  }
};

this.event = function (event) {
  let ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.set({
        x: 0,
        y: 0
      });
      break;
  }
};
