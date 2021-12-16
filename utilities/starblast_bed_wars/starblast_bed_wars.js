// Start preliminary settings ----------

const gameSkip = 30;

const bedConfig = {
	scale: 10,
	obj: "",
	emissives: [];
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
	}
];

const customShips = {
	waiter: '{"name":"Waiter","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Waiter","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'
};

// End preliminary constants ----------

// Start preliminary functions ----------

const rand = function (n) {
	return ~~(Math.random() * n);
};

// End prelminary functions ----------

// Start preliminary variables ----------

let customMap = maps[rand(maps.length)];

let started = false;

let currTeamNum = 0;

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

// Start this.tick functions ----------

const waitPlayers = function () {
	if (game.ships.length < playersReq) {
		game.ships.forEach((ship) => {
			ship.set({
				x: customMap.shipSpawn.x,
				y: customMap.shipSpawn.y,
				vx: 0,
				vy: 0,
				
				type: 101,
				shield: 1000,
				crystals: 0,
				stats: 99999999
				
				idle: true,
				collider: false
			});
		});
	}
	else {
		started = true;
	}
};

// End this.tick functions ----------

// Start this.event functions ----------



// End this.event functions ----------

this.options = {
	root_mode: "",
	
	map_size: 60,
	custom_map: customMap,
	asteroids_strength: 1000000,
	
	reset_tree: true,
	ships: Object.values(customShips),
	
	radar_zoom: 1,
	max_players: 20
};

this.tick = function () {

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
