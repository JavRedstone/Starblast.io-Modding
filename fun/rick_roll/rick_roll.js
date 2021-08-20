// Rickroll in Starblast

/*
  The rick is sorta hidden in the center so you have to go to the bottom in order to see him.
  Makes up for a good troll. The bigger the map the better.

  Enjoy your rickrolling!
*/

this.options = {
  root_mode: "survival",
  map_size: 30
};

this.tick = function(game) {
  if (game.step === 0) {
    game.setObject ({
      id: "Rick Astley",
      type: {
        id: "Rick Roll",
        obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
        diffuse: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/fun/rickroll/Rick_Astley.jpg"
      },
      position: {x:0,y:0,z:-100},
      rotation: {x:0,y:0,z:Math.PI},
      scale: {x:100,y:100,z:100}
    });
  }
}
