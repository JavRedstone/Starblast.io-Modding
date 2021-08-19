// Anti-troll

/*
  Prevents excessive trolling of players by means of unprecedented killing, basecamping, etc
  although this is vulnerable to high damage burst shots, it at least protects the player
  from accidently killing themselves, or getting killed by a troll against the rules.
  
  Have fun and enjoy!
*/

this.options = {
  root_mode: "survival",
  map_size: 30
};

const max_tier = 600;

this.tick = function(game) {
  for (var ship of game.ships) {
    if (ship.shield < ship.type / 5 && ship.type < max_tier) {
      ship.set({
        invulnerable: 360,
        shield: ship.shield + 2
      });
    }
  }
}
