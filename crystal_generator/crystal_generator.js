// Crystal Generator

/*
  Starblast crystal generator is now here!
  It works on setting aliens with a certain "crystal_drop" value that serves
  as a gem holder, and then casting the alien to death will make it drop
  it's gems. (As because how starblast works, you will get some alien lasers fired at you)
  Make sure that the game.step is divisible by something that is at least 5 (not 4), as
  the mod editor may blackscreen and freeze, or no aliens will be destroyed at all and
  it has a chance to crash your starblast / chrome / computer, so watch out!
*/

this.options = {
  root_mode: "survival",
  map_size: 20,
  custom_map: "",
};

this.tick = function(game) {
  if (game.step % 5 === 0) {
    for (var alien of game.aliens) alien.set({kill: true});
    game.addAlien({
      crystal_drop: 10,
    });
  }
}
