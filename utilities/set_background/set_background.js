// Setting a map background in starblast!

/*
  Use the function 'setBackground()', with the parameter as your background image
  - Keep in mind starblast image type restrictions are still present
  
  Lasers cannot be seen though, no matter the z level :(
*/

this.options = {
    root_mode: "survival",
    map_size: 30
};
  
// Variable depth of the background
const depth = -100;

// setBackground function
function setBackground(image_url) {
    game.setObject({
        id: "background",
        type: {
          id: "background_image",
          obj: "https://starblast.data.neuronality.com/mods/objects/plane.obj",
          emissive: image_url
        },
        position: {x: 0, y: 0, z: depth},
        rotation: {x: 0, y: Math.PI, z: Math.PI},
        scale: {x: game.options.map_size * 10, y: game.options.map_size * 10, z: 0}
    });
}


this.tick = function(game) {
    // An example of how to use this
    if (game.step === 0) {
        setBackground("https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/set_background/Background.png");
    }
}
