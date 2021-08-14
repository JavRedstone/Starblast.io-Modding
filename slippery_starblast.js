// Slippery Starblast

/*
  Example of incorporating changing the velocity of the ship in order to acheive a
  slipping effect. Play with the values, but be careful.
  
  For instance:
  - The value of 1 does nothing
  - The value of 1.01 is a bit laggy
  - The value of 1.01 is pretty good
  - Anything higher makes it hard to even control the ship and it will speed out of control
  - The values under 1 can be used to make your ship go slower and eventually stop, which
  may be fun to use, but will not be so "slippery" :(
  
  Have fun!
*/


this.options = {
  root_mode: "survival",
  map_size: 100,
  custom_map: ""
};

this.tick = function(game) {
  for (var ship of game.ships) {
    const vx = ship.vx * 1.02;
    const vy = ship.vy * 1.02;
    ship.set({vx: vx, vy: vy});
  }
}