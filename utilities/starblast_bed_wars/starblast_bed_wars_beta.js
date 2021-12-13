// Start preliminary settings ----------

const gameStep = 30;

const blockWidth = 10;
const scaleSize = blockWidth * 2 / 3;
const blockDepth = -50;

const baseDist = 200;
const spawnDist = 5

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
  centre: 16,
  median: 4,
  base: 8
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

let genFinished = false;
let gameStarted = false;

let blocks = [];

let seeds = {
  centre: { x: sizes.centre, y: sizes.centre },
  
  median1: { x: sizes.median - baseDist / 2, y: sizes.median },
  median2: { x: sizes.median, y: sizes.median + baseDist / 2 },
  median3: { x: sizes.median + baseDist / 2, y: sizes.median },
  median4: { x: sizes.median, y: sizes.median - baseDist / 2 },
  
  base1: { x: sizes.base - baseDist, y: sizes.base },
  base2: { x: sizes.base, y: sizes.base + baseDist },
  base3: { x: sizes.base + baseDist, y: sizes.base },
  base4: { x: sizes.base, y: sizes.base - baseDist }
};

let spawns = [
  { x: -baseDist - spawnDist, y: 0 },
  { x: 0, y: baseDist + spawnDist },
  { x: baseDist + spawnDist, y: 0 },
  { x: 0, y: -baseDist - spawnDist }
];

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

const genSeeds = function () {
  for (let seed in seeds) {
    seed = new Block({
      position: { x: seed.x, y: seed.y, z: blockDepth },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: scaleSize, y: scaleSize, z: scaleSize },
      obj: objects.block,
      emissive: emissiveTexs.block[rand(emissiveTexs.block.length)]
    }).init();
  }
}

const genIsle = function (seed, size) {
  let flip = 0;
  let currBlock = seed;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size - 1; j++) {
      currBlock = flip == 0 ? move(currBlock, "down") : move(currBlock, "up");
    }
    if (i < size) {
      move(currBlock, "left");
    }
    flip = flip == 0 ? 1 : 0;
  }
};

// End functions for this.tick ----------

this.tick = function () {
  if (game.step % gameStep == 0) {
    if (genFinished) {
      
    }
    else {
      genSeeds();
      
      genIsle(seeds.centre, sizes.centre);
      genIsle(seeds.median1, sizes.median1);
      genIsle(seeds.median2, sizes.median2);
      genIsle(seeds.median3, sizes.median3);
      genIsle(seeds.median4, sizes.median4);
      genIsle(seeds.base1, sizes.base1);
      genIsle(seeds.base2, sizes.base2);
      genIsle(seeds.base3, sizes.base3);
      genIsle(seeds.base4, sizes.base4);
      
      started = true;
    }
  }
};

this.event = function (event) {
  let ship = event.ship;
  switch (event.name) {
    case "ship_spawned":
      ship.custom = {
        teamNum: 
      };
      
      break;
  }
};
