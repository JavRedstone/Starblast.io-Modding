// Announcements in Starblast Revamped

/*
  Alright, for those who know what "ship.instructorSays()" is, this is simply
  a nice revamp of that one. It is announcements:
  
  lets say "ship" here is a ship object of the game.ships array:
  
    ship.custom.announce("Hello");
  
  ^ This will announce "Hello" to the specified ship, with the icon of a Loudspeaker
  
    ship.custom.announce("Hello", 1);
  
  ^ This does the same thing
  
    ship.custom.announce("Hello", 2);
  
  ^ This will announce "Hello" to the specified ship, with the icon of a Speaker instead
  
    ship.custom.hide_announcement();
  
  ^ This will hide the announcement from the specified ship
  
    ship.custom.announcements;
  
  ^ To access the list of announcements provided to each ship
  
  Enjoy announcing!
*/

this.options = {
  map_size: 30
};

this.tick = function(game) {
  // Examples of how to use (put in console ->)
  /*
  game.ships[0].custom.announce("Hello");
  
  for (var ship of game.ships) ship.custom.announce("Hi", 2);
  
  game.ships[0].custom.hide_announcement();
  */
}

this.event = function(event, game) {
  switch (event.name) {
    case "ship_spawned":
      var ship = event.ship;
      
      ship.custom.announcements = [];

      ship.custom.announce = function(announcement, type = 1) {
        if (type == 1) emoji = "📢";
        else if (type == 2) emoji = "🔊";
        
        ship.custom.announcements.push(announcement);
        
        var components = [
          {
            type: "box",
            position: [0, 0, 100, 20],
            fill: "rgba(0, 0, 0, 0.4)",
            stroke: "rgb(255, 215, 0)",
            width: 3
          },
          {
            type: "text",
            position: [5, 2, 90, 16],
            color: "white",
            value: `Announcements for ${ship.name}:`
          },
          {
            type: "box",
            position: [20, 20, 80, 80],
            fill: "rgba(0, 0, 0, 0.2)",
            stroke: "white",
            width: 3
          },
          {
            type: "box",
            position: [0, 20, 20, 80],
            fill: "rgba(0, 0, 0, 0.2)",
            stroke: "white",
            width: 3
          },
          {
            type: "text",
            position: [0, 20, 20, 80],
            color: "white",
            value: emoji
          }
        ];
        
        var amount = 3;
        for (let i = 0; i < amount; i++) {
          var value = ship.custom.announcements[ship.custom.announcements.length - i - 1];
          if (value) {
            var text = {
              type: "text",
              position: [25, 10 + (i + 1) * 20, 70, 20],
              color: "white",
              align: "left",
              value: value
            }
            components.push(text);
          }
        }
        
        ship.setUIComponent({
          id: "announcement",
          position: [20, 10, 60, 20],
          clickable: false,
          visible: true,
          components: components
        });
      }
      
      ship.custom.hide_announcement = function() {
        ship.setUIComponent({
          id: "announcement",
          clickable: false,
          visible: false,
        });
      }
  }
}
