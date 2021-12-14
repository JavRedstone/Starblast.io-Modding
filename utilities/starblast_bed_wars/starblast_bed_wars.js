// Start preliminary settings ----------
const gameSkip = 30;

// End preliminary settings ----------

// Start preliminary functions ----------

const rand = function(n) {
  return ~~(Math.random() * n);
};

// End preliminary functions ----------

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

// Start object storage variables ----------

const blocks = [];
const beds = [];

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

// Start functions for this.tick ----------



// End functions for this.tick ----------

// Start functions for this.event ----------



// End functions for this.event

this.options = {
  root_mode: "",
  friendly_colors: 4,
  map_size: 100,
  custom_map: "",
  asteroids_strength: 1000000,

  radar_zoom: 1,

  max_players: 20
};

this.tick = function() {
  if (game.step % gameSkip == 0) {

  }
};

this.event = function(event) {

};
