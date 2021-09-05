// Freeze ship shield and gems in starblast

/*
  This code `freezes` every ship shield and gems in starblast.
  You can modify this code to freeze only shield / freeze only gems
  as well as only freeze one person's values.
  
  Enjoy!
*/

this.options = {
  root_mode: "survival",
  map_size: 30
};

const when = 1000;

// To unfreeze
function unfreeze() {
  ship.custom.crystals = null;
  ship.custom.shield = null;
}

this.tick = function(game) {
  // For each ship of game.ships array
  for (var ship of game.ships) {
    
    // If you reach that point of 'when'
    if (game.step % when === 0) {
      // Set this to a ship.custom object
      
      ship.custom.crystals = ship.crystals;
      ship.custom.shield = ship.shield;
    }
    
    // Make sure the custom values are there, and it freezes it
    
    if (ship.custom.crystals) ship.set({ crystals: ship.custom.crystals });
    if (ship.custom.shield) ship.set({ shield: ship.custom.shield });
  }
}
