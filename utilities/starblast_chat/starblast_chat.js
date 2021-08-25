// Starblast in game chat

/*
  Starblast in game chat is here!
  - Uses 26 text buttons in order to simulate a keyboard
  - UI allows people to play with ease, without the fear of the chat clogging up
  - Using vanilla starblast modding, allowing for the most flexibility
*/

this.options = {
  root_mode: "survival",
  map_size: 30,
  weapons_store: false,
  vocabulary: []
};

var A = { id: "A", position: [0,0,0,0], clickable: true, shortcut: "A", visible: false };
var B = { id: "B", position: [0,0,0,0], clickable: true, shortcut: "B", visible: false };
var C = { id: "C", position: [0,0,0,0], clickable: true, shortcut: "C", visible: false };
var D = { id: "D", position: [0,0,0,0], clickable: true, shortcut: "D", visible: false };
var E = { id: "E", position: [0,0,0,0], clickable: true, shortcut: "E", visible: false };
var F = { id: "F", position: [0,0,0,0], clickable: true, shortcut: "F", visible: false };
var G = { id: "G", position: [0,0,0,0], clickable: true, shortcut: "G", visible: false };
var H = { id: "H", position: [0,0,0,0], clickable: true, shortcut: "H", visible: false };
var I = { id: "I", position: [0,0,0,0], clickable: true, shortcut: "I", visible: false };
var J = { id: "J", position: [0,0,0,0], clickable: true, shortcut: "J", visible: false };
var K = { id: "K", position: [0,0,0,0], clickable: true, shortcut: "K", visible: false };
var L = { id: "L", position: [0,0,0,0], clickable: true, shortcut: "L", visible: false };
var M = { id: "M", position: [0,0,0,0], clickable: true, shortcut: "M", visible: false };
var N = { id: "N", position: [0,0,0,0], clickable: true, shortcut: "N", visible: false };
var O = { id: "O", position: [0,0,0,0], clickable: true, shortcut: "O", visible: false };
var P = { id: "P", position: [0,0,0,0], clickable: true, shortcut: "P", visible: false };
var Q = { id: "Q", position: [0,0,0,0], clickable: true, shortcut: "Q", visible: false };
var R = { id: "R", position: [0,0,0,0], clickable: true, shortcut: "R", visible: false };
var S = { id: "S", position: [0,0,0,0], clickable: true, shortcut: "S", visible: false };
var T = { id: "T", position: [0,0,0,0], clickable: true, shortcut: "T", visible: false };
var U = { id: "U", position: [0,0,0,0], clickable: true, shortcut: "U", visible: false };
var V = { id: "V", position: [0,0,0,0], clickable: true, shortcut: "V", visible: false };
var W = { id: "W", position: [0,0,0,0], clickable: true, shortcut: "W", visible: false };
var X = { id: "X", position: [0,0,0,0], clickable: true, shortcut: "X", visible: false };
var Y = { id: "Y", position: [0,0,0,0], clickable: true, shortcut: "Y", visible: false };
var Z = { id: "Z", position: [0,0,0,0], clickable: true, shortcut: "Z", visible: false };

var space = {
  id: " ",
  position: [1, 52, 10, 3],
  clickable: true,
  shortcut: "8",
  visible: true,
  components: [{
    type: "box",
    position: [0, 0, 100, 100],
    fill: "rgba(241, 196, 15, 0.5)",
    stroke: "#fff",
    width: 2
  }, {
    type: "text",
    position: [0, 0, 100, 100],
    color: "#fff",
    value: "Space [8]"
  }]
};

var enter = {
  id: "enter",
  position: [11, 52, 10, 3],
  clickable: true,
  shortcut: "9",
  visible: true,
  components: [{
    type: "box",
    position: [0, 0, 100, 100],
    fill: "rgba(241, 196, 15, 0.5)",
    stroke: "#fff",
    width: 2
  }, {
    type: "text",
    position: [0, 0, 100, 100],
    color: "#fff",
    value: "Enter [9]"
  }]
};

var backspace = {
  id: "backspace",
  position: [21, 52, 10, 3],
  clickable: true,
  shortcut: "0",
  visible: true,
  components: [{
    type: "box",
    position: [0, 0, 100, 100],
    fill: "rgba(241, 196, 15, 0.5)",
    stroke: "#fff",
    width: 2
  }, {
    type: "text",
    position: [0, 0, 100, 100],
    color: "#fff",
    value: "Backspace [0]"
  }]
};

var hide_show_chat = {
  id: "hide_show_chat",
  position: [1, 40, 10, 10],
  clickable: true,
  shortcut: "7",
  visible: true,
  components: [{
    type: "box",
    position: [0, 0, 100, 100],
    fill: "rgba(23, 32, 42, 0.5)",
    stroke: "rgba(241, 196, 15, 0.5)",
    width: 2
  }, {
    type: "text",
    position: [0, 0, 100, 100],
    color: "#fff",
    value: "Hide Chat [7]"
  }]
};

var stuck_on_upgrade = {
  id: "stuck_on_upgrade",
  position: [1, 25, 10, 10],
  clickable: true,
  shortcut: "6",
  visible: true,
  components: [{
    type: "box",
    position: [0, 0, 100, 100],
    fill: "rgba(23, 32, 42, 0.5)",
    stroke: "rgba(241, 196, 15, 0.5)",
    width: 2
  }, {
    type: "text",
    position: [0, 0, 100, 100],
    color: "#fff",
    value: "Stuck on upgrade [6]"
  }]
};

var chat = {
  id: "chat",
  position: [1, 55, 30, 40],
  clickable: false,
  visible: true,
  components: [{
    type: "box",
    position: [0, 0, 100, 100],
    fill: "rgba(23, 32, 42, 0.5)",
    stroke: "#fff",
    width: 2
  }, {
    type: "box",
    position: [0, 0, 100, 10],
    fill: "rgba(52, 152, 219, 0.5)",
    stroke: "#fff",
    width: 2
  }, {
    type: "text",
    position: [0, 0, 100, 10],
    color: "#fff",
    value: "Starblast Chat"
  }, {
    type: "text",
    position: [0, 10, 100, 10],
    color: "#fff",
    value: "",
    align: "left"
  }, {
    type: "text",
    position: [0, 20, 100, 10],
    value: "",
    align: "left"
  }, {
    type: "text",
    position: [0, 30, 100, 10],
    value: "",
    align: "left"
  }, {
    type: "text",
    position: [0, 40, 100, 10],
    value: "",
    align: "left"
  }, {
    type: "text",
    position: [0, 50, 100, 10],
    value: "",
    align: "left"
  }, {
    type: "text",
    position: [0, 60, 100, 10],
    value: "",
    align: "left"
  }, {
    type: "text",
    position: [0, 70, 100, 10],
    value: "",
    align: "left"
  }, {
    type: "box",
    position: [0, 80, 100, 5],
    fill: "rgba(241, 196, 15, 0.5)",
    stroke: "#fff",
    width: 2
  }, {
    type: "text",
    position: [0, 80, 100, 5],
    color: "#fff",
    value: "Enter your chat message:"
  }, {
    type: "box",
    position: [0, 85, 100, 15],
    fill: "rgba(255, 255, 255, 0.2)",
    stroke: "#fff",
    width: 2
  }, {
    type: "text",
    position: [0, 85, 100, 15],
    color: "rgb(255,255,0)",
    value: ""
  }]
};

const rate_limit = 5;

this.tick = function(game) {
  for (var ship of game.ships) {
    if (!ship.custom.installed) {
      ship.custom.installed = true;
      ship.custom.text = "";
      ship.custom.hide_show_chat = false;
    }
    
    if (ship.custom.wait_tick && ship.custom.wait_tick.tick - game.step == -2) ship.set({crystals: ship.custom.wait_tick.crystals});
    
    // Make it less laggy / ratelimit
    if (game.step % rate_limit === 0) {
      chat.components[chat.components.length - 1].value = ship.custom.text;
      
      if (ship.custom.hide_show_chat) {
        chat.visible = false;
        space.visible = false;
        enter.visible = false;
        backspace.visible = false;
        hide_show_chat.components[1].value = "Show Chat [7]";
      }
      
      else {
        chat.visible = true;
        space.visible = true;
        enter.visible = true;
        backspace.visible = true;
        hide_show_chat.components[1].value = "Hide Chat [7]";
      }
      
      ship.setUIComponent(space);
      ship.setUIComponent(enter);
      ship.setUIComponent(backspace);
      
      ship.setUIComponent(chat);
      
      ship.setUIComponent(hide_show_chat);
      
      ship.setUIComponent(stuck_on_upgrade);
    }
    
    if (game.step % 60 === 0) {
      ship.setUIComponent(A);
      ship.setUIComponent(B);
      ship.setUIComponent(C);
      ship.setUIComponent(D);
      ship.setUIComponent(E);
      ship.setUIComponent(F);
      ship.setUIComponent(G);
      ship.setUIComponent(H);
      ship.setUIComponent(I);
      ship.setUIComponent(J);
      ship.setUIComponent(K);
      ship.setUIComponent(L);
      ship.setUIComponent(M);
      ship.setUIComponent(N);
      ship.setUIComponent(O);
      ship.setUIComponent(P);
      ship.setUIComponent(Q);
      ship.setUIComponent(R);
      ship.setUIComponent(S);
      ship.setUIComponent(T);
      ship.setUIComponent(U);
      ship.setUIComponent(V);
      ship.setUIComponent(W);
      ship.setUIComponent(X);
      ship.setUIComponent(Y);
      ship.setUIComponent(Z);
    }
  }
}

this.event = function(event, game) {
  switch (event.name) {
    case "ui_component_clicked":
      if (event.id == "enter") {
        if (event.ship.custom.text !== "") {
          var empty = null;
          for (let i = 3; i < chat.components.length - 3; i++) {
            var text = chat.components[i];
            if (text.value === "") {
              empty = chat.components.indexOf(text);
              break;
            }
          }
          if (empty !== null) chat.components[empty].value = `${event.ship.name}: ${event.ship.custom.text}`;
          else {
            for (let i = 3; i < chat.components.length - 5; i ++) {
              chat.components[i].value = chat.components[i + 1].value;
            }
            chat.components[chat.components.length - 5].value = `${event.ship.name}: ${event.ship.custom.text}`;
          }
          event.ship.custom.text = "";
        }
      }
      else if (event.id == "backspace") {
        if (event.ship.custom.text.length > 0) {
          event.ship.custom.text = event.ship.custom.text.substring(0, event.ship.custom.text.length - 1);
        }
      }
      
      else if (event.id == "hide_show_chat") {
        if (event.ship.custom.hide_show_chat) event.ship.custom.hide_show_chat = false;
        else event.ship.custom.hide_show_chat = true;
      }
      
      else if (event.id == "stuck_on_upgrade") {
        var crystals = event.ship.crystals;
        if (crystals > 0) {
          if (event.ship.custom.wait_tick) {
            if (event.ship.custom.wait_tick.tick - game.step <= -10) {
              event.ship.set({crystals: crystals - 1});
              event.ship.custom.wait_tick = {tick: game.step, crystals: crystals};
            }
          }
          else event.ship.custom.wait_tick = {tick: game.step, crystals: crystals};
        }
      }
    
      else event.ship.custom.text += event.id;
      
      break;
  }
}
