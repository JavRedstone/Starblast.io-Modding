// Set map size for this.options
const map_size = 50;

// Custom map
const map = "99999999999999999999999999999999999999999999999999\n"+
"9                                                9\n"+
"9 999999                           5      999999 9\n"+
"9 9                     5                      9 9\n"+
"9 9                            3               9 9\n"+
"9 9               6                        8   9 9\n"+
"9 9                                            9 9\n"+
"9 9                  4                         9 9\n"+
"9                       5     6                  9\n"+
"9                                                9\n"+
"9  9                                             9\n"+
"9              5                             9   9\n"+
"9       61       7       2       7               9\n"+
"9                7               7               9\n"+
"9                7    4       7  7               9\n"+
"9                7               738    3        9\n"+
"9                7      1 1      7               9\n"+
"9     8     77777999999     99999977777          9\n"+
"9  1        5    96    1 1 1    69         4     9\n"+
"9                9 6           6 9            8  9\n"+
"9                9  6         6  9  7            9\n"+
"9                9   999   999   9               9\n"+
"9    6           9   97     79   9               9\n"+
"9          3      1  9       9  1     5 1        9\n"+
"9               1                 1        2     9\n"+
"9                 1             1                9\n"+
"9         7     1                 1    3      1  9\n"+
"9  5              1  9       9  1                9\n"+
"9           2    9   97     79   9               9\n"+
"9                9   999   999   9         4     9\n"+
"9     3          9  6         6  9               9\n"+
"9   7            9 6           6 9     3      5  9\n"+
"9                96    1 1 1    69               9\n"+
"9          177777999999     99999977777          9\n"+
"9         1      7      1 1      7               9\n"+
"9        7       7               7  7       6    9\n"+
"9                7         9     7               9\n"+
"9     5          7   6           7               9\n"+
"9                7               7               9\n"+
"9  4           4                  2              9\n"+
"9                               9                9\n"+
"9                                                9\n"+
"9 9                        6                   9 9\n"+
"9 9                4                           9 9\n"+
"9 9                     7                      9 9\n"+
"9 9                                 8          9 9\n"+
"9 9              7                             9 9\n"+
"9 999999     2               9            999999 9\n"+
"9                                                9\n"+
"99999999999999999999999999999999999999999999999999";

// this.options
this.options = {
  root_mode: "survival",
  map_size: map_size,
  custom_map: map,
  radar_zoom: 1
};

/*
  This is an array that describes the set positions for our dominators.

  These are five dominators, one on each corner of the map, and one in the middle of the map
*/

var mult = 3;

var dominator_positions = [
  { x: 0, y: 0, z: 0 },
  { x: map_size * mult, y: map_size * mult, z: 0 },
  { x: map_size * mult, y: -map_size * mult, z: 0 },
  { x: -map_size * mult, y: -map_size * mult, z: 0 },
  { x: -map_size * mult, y: map_size * mult, z: 0 }
];

var dominator_scales = [1, 178/135, 178/135, 178/135, 178/135];

// Dominator storage array
var dominators = [];

// Trap storage array
var traps = [];

// Bullet Dominators
var red_bullet_dominator = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Red_Bullet_Dominator.png';
var blue_bullet_dominator = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Blue_Bullet_Dominator.png';
var yellow_bullet_dominator = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Yellow_Bullet_Dominator.png';

// Trap Dominators
var red_trap_dominator = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Red_Trap_Dominator.png';
var blue_trap_dominator = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Blue_Trap_Dominator.png';
var yellow_trap_dominator = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Yellow_Trap_Dominator.png';

// Bullets
var red_bullet = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Red_Bullet.png';
var blue_bullet = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Blue_Bullet.png';
var yellow_bullet = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Yellow_Bullet.png';

// Traps
var red_trap = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Red_Trap.png';
var blue_trap = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Blue_Trap.png';
var yellow_trap = 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_domination/Yellow_Trap.png';

// Dominator image array
var dominator_images = [yellow_trap_dominator, red_bullet_dominator, red_bullet_dominator, blue_bullet_dominator, blue_bullet_dominator];

// Trap image array
var trap_image = yellow_trap;

//This is the dominator class. This class is used as a storage for all our dominator objects. The reason why we need this is because we cannot access a list of objects of the game -- we can only do game.setObject

/** @class Dominator */
class Dominator {
    constructor({
      id: id,
      type: { emissive: image },
      position: { x: px, y: py, z: pz },
      rotation: { x: rx, y: ry, z: rz },
      scale: { x: sx, y: sy, z: sz },
    }) {
        this.id = id;
        this.position = { x: px, y: py, z: pz };
        this.rotation = { x: rx, y: ry, z: rz };
        this.scale = { x: sx, y: sy, z: sz };
        this.type = {
          id: id,
          obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
          emissive: image
        };
    }
    
    initiate(game) {
      game.setObject({
        id: this.id,
        type: this.type,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale 
      });
      
      return this;
    }
}

//This is the trap class. This class is used as a storage for all our trap objects. The reason why we need this is because we cannot access a list of objects of the game -- we can only do game.setObject

/** @class Trap */
class Trap {
    constructor({
      id: id,
      type: { emissive: image },
      position: { x: px, y: py, z: pz },
      velocity: { vx: vvx, vy: vvy },
      rotation: { x: rx, y: ry, z: rz },
      scale: { x: sx, y: sy, z: sz },
    }) {
        this.id = id;
        this.position = { x: px, y: py, z: pz };
        this.velocity = { vx: vvx, vy: vvy };
        this.rotation = { x: rx, y: ry, z: rz };
        this.scale = { x: sx, y: sy, z: sz };
        this.type = {
          id: id,
          obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
          emissive: image
        };
    }
    
    initiate(game) {
      game.setObject({
        id: this.id,
        type: this.type,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale
      });
      
      return this;
    }
}

// this.tick function
this.tick = function (game) {
  // If the game just starts
  if (game.step === 0) {
    // For every i in the range of the length of the dominator_positions array
    for (let i = 0; i < dominator_positions.length; i++) {
      // We occupy a space inside the dominators array, by creating a new dominator, and using the dominator's own function, initiate, to return the dominator object, which will be stored
      dominators[i] = new Dominator ({
        id: `dominator_${i}`,
        type: { emissive: dominator_images[i] },
        position: dominator_positions[i],
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 10, y: dominator_scales[i] * 10, z: 10 }
      }).initiate(game);
    }
  }
  
  // Every game.step that is divisible by 2
  if (game.step % 10 === 0) {
    // Again, loop through the array
    for (let i = 0; i < dominators.length; i++) {
      // Again, create a new dominator, but we change its rotation a little bit at a time
      dominators[i] = new Dominator ({
        id: `dominator_${i}`,
        type: { emissive: dominator_images[i] },
        position: dominator_positions[i],
        rotation: { x: 0, y: 0, z: dominators[i].rotation.z + 0.05 },
        scale: { x: 10, y: dominator_scales[i] * 10, z: 10 }
      }).initiate(game);
    }
    
    for (let i = 0; i < traps.length; i++) {
      traps[i] = new Trap ({
        id: `trap_${i}`,
        type: { emissive: trap_image },
        position: { x: traps[i].position.x + traps[i].velocity.vx, y: traps[i].position.y + traps[i].velocity.vy, z: 0 },
        velocity: { vx: traps[i].velocity.vx / 1.1, vy: traps[i].velocity.vy / 1.1 },
        rotation: { x: 0, y: 0, z: traps[i].rotation.z + 0.05 },
        scale: { x: 2 * 150/131, y: 2, z: 2 }
      }).initiate(game);
    }
  }
  
  // Every game.step that is divisible by 120
  
  var angles = [0, 45, 90, 135, 180, -45, -90, -135];
  
  if (game.step % 120 === 0) {
    for (let i = 0; i < angles.length; i++) {
      var vx = (Math.cos(dominators[0].rotation.z) + Math.PI / 180 * angles[i]);
      var vy = (Math.sin(dominators[0].rotation.z) + Math.PI / 180 * angles[i]);
      echo(dominators[0].rotation.z % Math.PI)
      traps[i] = new Trap ({
        id: `trap_${i}`,
        type: { emissive: trap_image },
        position: { x: 0, y: 0, z: 0 },
        velocity: { vx: vx, vy: vy },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 2 * 150/131, y: 2, z: 2 }
      }).initiate(game);
    }
  }
}
