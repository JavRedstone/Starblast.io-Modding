// Start preliminary settings ----------

const gameSkip = 30;

const playersReq = 1;

const bedConfig = {
	scale: 10,
	obj: "",
	emissives: []
};

// End preliminary settings ----------

// Start preliminary constants ----------

const maps = [
	{
		name: "X",
		author: "JavRedstone",
		map: "999999999999999999999999999999999999999999999999999999999999\n"+
			"977999999999999999999999999999999999999999999999999999999779\n"+
			"975799777777777799999                  999997777777777997579\n"+
			"99757997555555799  99                  99  99755555579975799\n"+
			"9997579975335799                            9975335799757999\n"+
			"999975799755799                              997557997579999\n"+
			"99799757997799       99              99       99779975799799\n"+
			"9977997579999         99            99         9799757997799\n"+
			"997579975799           99          99           997579975799\n"+
			"9975579975799           99        99           9975799755799\n"+
			"99753579975799           999    999           99757997535799\n"+
			"997535799975799           99    99           997579997535799\n"+
			"99755799 9975799                            9975799 99755799\n"+
			"9975799   9975799                          9975799   9975799\n"+
			"997799     9975799                        9975799     997799\n"+
			"99799       9975799                      9975799       99799\n"+
			"9999         997799      9999999999      997799         9999\n"+
			"999           9999        97777779        9999           999\n"+
			"999            99          975579          99            999\n"+
			"9999                        9779                        9999\n"+
			"9999                         99                         9999\n"+
			"99    9              9999          9999              9    99\n"+
			"99    99             9779          9779             99    99\n"+
			"99     99            9779          9779            99     99\n"+
			"99      99           9999          9999           99      99\n"+
			"99       99     9                          9     99       99\n"+
			"99        99    99                        99    99        99\n"+
			"99        99    979          99          979    99        99\n"+
			"99              9779        9999        9779              99\n"+
			"99              97579      997799      97579              99\n"+
			"99              97579      997799      97579              99\n"+
			"99              9779        9999        9779              99\n"+
			"99        99    979          99          979    99        99\n"+
			"99        99    99                        99    99        99\n"+
			"99       99     9                          9     99       99\n"+
			"99      99           9999          9999           99      99\n"+
			"99     99            9779          9779            99     99\n"+
			"99    99             9779          9779             99    99\n"+
			"99    9              9999          9999              9    99\n"+
			"9999                         99                         9999\n"+
			"9999                        9779                        9999\n"+
			"999            99          975579          99            999\n"+
			"999           9999        97777779        9999           999\n"+
			"9999         997799      9999999999      997799         9999\n"+
			"99799       9975799                      9975799       99799\n"+
			"997799     9975799                        9975799     997799\n"+
			"9975799   9975799                          9975799   9975799\n"+
			"99755799 9975799                            9975799 99755799\n"+
			"997535799975799           99    99           997579997535799\n"+
			"99753579975799           999    999           99757997535799\n"+
			"9975579975799           99        99           9975799755799\n"+
			"997579975799           99          99           997579975799\n"+
			"9977997579999         99            99         9999757997799\n"+
			"99799757997799       99              99       99779975799799\n"+
			"999975799755799                              997557997579999\n"+
			"9997579975335799                            9975335799757999\n"+
			"99757997555555799  99                  99  99755555579975799\n"+
			"975799777777777799999                  999997777777777997579\n"+
			"977999999999999999999999999999999999999999999999999999999779\n"+
			"999999999999999999999999999999999999999999999999999999999999",
		shipSpawn: [
			{ x: -270, y: 0 },
			{ x: 0, y: 270 },
			{ x: 270, y: 0 },
			{ x: 0, y: -270 }
		],
		bedSpawn: [
			{ x: -220, y: 0 },
			{ x: 0, y: 220 },
			{ x: 220, y: 0 },
			{ x: 0, y: -220 }
		]
	},
	{
		name: "Arena",
		author: "JavRedstone",
		map: "767775757775767657999999999999999999999999776665756657667676\n"+
			"676676565557765655799999999999999999999997577567767555657765\n"+
			"7766576757566755676699                9976775677775575565565\n"+
			"56777757755676667667599              99776556657565577675757\n"+
			"675566665755557757667599            997755567776765775775557\n"+
			"7567777576775557675755599          9977566666576675557776567\n"+
			"57657577655776665656765699        99577555757765767757667576\n"+
			"756756799999975755756756799      996556767776579999995755675\n"+
			"77766769    996565567775559      976667657576799    95776565\n"+
			"76676759 999 99666766577569      95576577567799 999 97777765\n"+
			"77667569 9799 9967655557569      9577765675699 9979 97756565\n"+
			"75576769 99799 996776775679      965776565599 99799 97677776\n"+
			"677567699 99799 96755675569      97557556679 99799 997567657\n"+
			"5656555699 9979 96775775659      97575657569 9799 9975767766\n"+
			"67565556799 999 96667657579      97566676569 999 99566577667\n"+
			"766656557799    97577657759      96555657579    995765567576\n"+
			"676665557579999996766655999      999777556599977955557676766\n"+
			"5767767577776657599999999          9999999956655777566567655\n"+
			"955667565767567779                        966666775657667669\n"+
			"996565756656757579                        966766765766566699\n"+
			"999675566766775559                        967565665767777999\n"+
			"999965667555665659   9999          9999   966555757556679999\n"+
			"99 996576565557659   977999      999779   966676655576599 99\n"+
			"99  99676677675759   975579      975579   96657656665799  99\n"+
			"99   9967655775599   995579      975599   9957566576599   99\n"+
			"99    99656567579     97799      99779     95757677699    99\n"+
			"99     9999999999     9999        9999     9999999999     99\n"+
			"99                                                        99\n"+
			"99                           99                           99\n"+
			"99                          9779                          99\n"+
			"99                          9779                          99\n"+
			"99                           99                           99\n"+
			"99                                                        99\n"+
			"99     9999999999     9999        9999     9999999999     99\n"+
			"99    99657677779     97799      99779     96566656599    99\n"+
			"99   9956565755699   995579      975599   9965555665699   99\n"+
			"99  99565667576659   975579      975579   95576667766599  99\n"+
			"99 996575657667779   977999      999779   966666575757599 99\n"+
			"999976667555567759   9999          9999   965755775777569999\n"+
			"999766757777676579                        957555567556656999\n"+
			"996775567665766659                        955575776557655699\n"+
			"955667565777666579                        977777676666775769\n"+
			"5775767756666757799999999          9999999956775566775655775\n"+
			"657765557669999995665567999      999555756799999957675666666\n"+
			"757765575799    95575565579      95565767759    995565565556\n"+
			"65657666599 999 95556565559      97656775679 999 99567666677\n"+
			"7677556799 9979 95655777559      96577755669 9799 9977666666\n"+
			"657765599 99799 95665775569      97566766669 99799 997767657\n"+
			"67566559 99799 996565766669      965666655599 99799 97567667\n"+
			"67775759 9799 9967555757559      9765775667699 9979 96565655\n"+
			"75766759 999 99756565757659      96757577556799 999 96566577\n"+
			"57767659    997767755556759      977577765575699    95557677\n"+
			"675676699999975767575556699      995565565757779999995776755\n"+
			"75575566765566567575765799        99757665577766576565566677\n"+
			"6567767566757767766655699          9966676757677576557765775\n"+
			"676575566677665755665599            997566667777657566765577\n"+
			"67565565656557566556699              99767767555665556755567\n"+
			"7677565676666667766799                9976776766777756657656\n"+
			"656765665655565656699999999999999999999996766657567777675677\n"+
			"566757765576765566999999999999999999999999557565556667777666",
		shipSpawn: [
			{ x: -270, y: 0 },
			{ x: 0, y: 270 },
			{ x: 270, y: 0 },
			{ x: 0, y: -270 }
		],
		bedSpawn: [
			{ x: -220, y: 0 },
			{ x: 0, y: 220 },
			{ x: 220, y: 0 },
			{ x: 0, y: -220 }
		]
	}
];

const uis = {
  waitPlayers: {
    id: "waitPlayers",
    position: [40, 15, 20, 10],
    visible: true,
    components: [{
        type: "text",
        position: [0, 0, 100, 50],
        value: "Waiting for more players...️",
        color: "#cde"
      },
      {
        type: "text",
        position: [0, 50, 100, 50],
        color: "#cde"
      }
    ]
  },
  waitPlayersBoard: {
    id: "scoreboard",
    visible: true,
    components: [
      {
        type: "text",
        position: [5, 0, 90, 10],
        value: "Waiting for more players...",
        color: "#cde"
      }
    ]
  },
  chosenShip: {
    id: "chosenShip",
    position: [40, 36, 20, 32],
    visible: true,
    components: [
      {
        type: "text",
        position: [20, 0, 60, 60],
        value: "Your ship is:",
        color: "#cde"
      },
      {
        type: "text",
        position: [20, 0, 60, 100],
        color: "#cde"
      }
    ]
  }
};

const timers = {
  chooseShip: 300
};

const customShips = {
	waiter: '{"name":"Waiter","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Waiter","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}',

  double: '{"name":"Double","level":6,"model":1,"size":2,"zoom":1,"specs":{"shield":{"capacity":[200,200],"reload":[20,20]},"generator":{"capacity":[150,150],"reload":[50,50]},"ship":{"mass":200,"speed":[150,150],"rotation":[150,150],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,40,80,70,80],"z":[0,0,0,0,0,0]},"width":[0,15,25,20,0],"height":[0,15,25,20,0],"texture":[12,1,63,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":25},"position":{"x":[0,0,0,0],"y":[20,40,80],"z":[-4,0,-6]},"width":[5,10,5],"height":[0,8,0],"texture":[9]},"wings":{"section_segments":8,"offset":{"x":15,"y":-20,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-85,-95,50,60,50,60],"z":[0,0,0,0,0,0]},"width":[0,5,25,10,0],"height":[0,5,25,10,0],"texture":[12,2,3,4],"propeller":true},"cannons":{"section_segments":12,"offset":{"x":35,"y":-10,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,10,10,5,0],"height":[0,5,6,10,10,5,0],"angle":5,"laser":{"damage":[100,100],"rate":2,"type":1,"speed":[250,250],"number":1,"error":0,"recoil":50},"texture":[3,1,63,3,12,2]}},"typespec":{"name":"Double","level":6,"model":1,"code":601,"specs":{"shield":{"capacity":[200,200],"reload":[20,20]},"generator":{"capacity":[150,150],"reload":[50,50]},"ship":{"mass":200,"speed":[150,150],"rotation":[150,150],"acceleration":[100,100]}},"shape":[3.098,4.669,4.391,3.481,3.239,2.698,2.358,2.11,1.961,1.891,1.856,1.85,1.836,1.872,1.903,1.885,1.873,1.959,2,1.935,1.895,1.946,2.154,2.102,2.036,2.004,2.036,2.102,2.154,1.946,1.895,1.935,2,1.959,1.873,1.885,1.903,1.872,1.836,1.85,1.856,1.891,1.961,2.11,2.358,2.698,3.239,3.481,4.391,4.669],"lasers":[{"x":1.156,"y":-3.189,"z":-0.4,"angle":5,"damage":[100,100],"rate":2,"type":1,"speed":[250,250],"number":1,"spread":0,"error":0,"recoil":50},{"x":-1.156,"y":-3.189,"z":-0.4,"angle":-5,"damage":[100,100],"rate":2,"type":1,"speed":[250,250],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.669}}'
};

const shipChoices = ["Double"];

// End preliminary constants ----------

// Start preliminary functions ----------

const rand = function (n) {
	return ~~(Math.random() * n);
};

const hideUI = function (id, ship) {
  ship.setUIComponent({
    id: id,
    position: [0, 0, 0, 0],
    visible: false,
    clickable: false
  });
};

// End prelminary functions ----------

// Start preliminary variables ----------

let customMap = maps[rand(maps.length)];

let started = false;

let gameStatus = 0;

let currTeamNum = 0;

let pickedShip = rand(shipChoices.length);
let chosenShip = {
  name: shipChoices[pickedShip],
  type: 601 + pickedShip,
};

// End preliminary variables ----------

// Start object storage constants ----------

const beds = [];

// End object storage constants ----------

// Start object classes ----------

class Bed {
	constructor({
		position: POSITION
	}) {
		this.id = `bed-${beds.length}`;
		this.position = POSITION;
		this.rotation = { x: 0, y: 0, z: 0 };
		this.scale = { x: bedConfig.scale, y: bedConfig.scale, z: bedConfig.scale };
		this.type = { id: this.id, obj: bedConfig.obj, emissive: bedConfig.emissives[this.id] };
	};
	
	init () {
		beds.push(this);
		game.setObject(this);
		return true;
	}
};

// End object classes ----------

// Start this.tick helper functions ----------

const genChosenShipUI = function (n, space, dec) {
  for (let i = 0; i < n; i++) {
    uis.chosenShip.components.push({
      type: "box",
      position: [i * space, i * space, 100 - 2 * i * space, 100 - 2 * i * space],
      stroke: `rgba(204, 221, 238, ${1 - i * dec})`,
      width: 3
    });
  }
};

genChosenShipUI(5, 5, 0.1);

// End this.tick helper functions ----------

// Start this.tick functions ----------

const sendBack = function () {
	game.ships.forEach((ship) => {
		ship.set({
  		x: customMap.shipSpawn[ship.custom.teamNum].x,
			y: customMap.shipSpawn[ship.custom.teamNum].y,
			vx: 0,
			vy: 0,
		  
			shield: 1000,
			crystals: 0,
			stats: 99999999
		});
	});
};

const waitPlayers = function () {
	if (game.ships.length < playersReq) {
	  uis.waitPlayers.components[1].value = `${playersReq - game.ships.length} player(s) remaining`;
	  game.setUIComponent(uis.waitPlayers);
	  game.setUIComponent(uis.waitPlayersBoard);
		game.ships.forEach((ship) => {
			ship.set({
				type: 101,
				idle: true,
				collider: false
			});
		});
	}
	else {
	  hideUI("waitPlayers", game);
	  hideUI("waitPlayersBoard", game);
		started = true;
	}
};

const chooseShip = function () {
  if (timers.chooseShip > 0) {
    uis.chosenShip.components[1].value = chosenShip.name;
    game.setUIComponent(uis.chosenShip);
    timers.chooseShip -= gameSkip;
  }
  else {
    hideUI("chosenShip", game);
    game.ships.forEach((ship) => {
      ship.set({
        type: chosenShip.type,
        idle: false,
				collider: true
      });
    });
    gameStatus++;
  }
};

// End this.tick functions ----------

// Start this.event functions ----------



// End this.event functions ----------

this.options = {
	root_mode: "",
	
	map_size: 60,
	custom_map: customMap.map,
	asteroids_strength: 1000000,
	
	reset_tree: true,
	ships: Object.values(customShips),
	
	radar_zoom: 1,
	max_players: 20
};

this.tick = function () {
  if (game.step % gameSkip == 0) {
	  if (started) {
		  switch (gameStatus) {
		  	case 0:
		  	  chooseShip();
		  	  sendBack();
		  		break;
		  	case 1:
		  	  break;
		  	case 2:
		  	  break;
		  }
	  }
	  else {
	    waitPlayers();
	    sendBack();
	  }
  }
};

this.event = function (event) {
	let ship = event.ship;
	switch (event.name) {
		case "ship_spawned":
			ship.custom = {
				teamNum: currTeamNum
			};
			currTeamNum = currTeamNum < 3 ? currTeamNum + 1 : 0;
			break;
		case "ui_component_clicked":
			break;
	}
};
