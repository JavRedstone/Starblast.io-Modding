// Plume expansion
/*
    @author JavRedstone
    @version 1.0.0
*/

const C = {
    GAME_OPTIONS: {
        ROOT_MODE: '',
        MAP_SIZE: 60,
        MAP: null,
        CRYSTAL_VALUE: 0,

        FRIENDLY_COLORS: 2,

        RADAR_ZOOM: 1,

        SPEED_MOD: 1.4,
        FRICTION_RATIO: 1,

        WEAPONS_STORE: false,
        PROJECTILE_SPEED: 1,

        STARTING_SHIP: 800,
        RESET_TREE: true,
        CHOOSE_SHIP: [101],
        SHIP_NAMES: ['Fly'],
        SHIP_CODES: [101],
        SHIPS: [
            '{"name":"Fly","level":1,"model":1,"size":1.05,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}',

        ],

        VOCABULARY: [
            { text: 'Heal', icon:'\u0038', key:'H' },
            { text: 'Me', icon:'\u004f', key:'E' },
            { text: 'Wait', icon:'\u0048', key:'T' },
            { text: 'Yes', icon:'\u004c', key:'Y' },
            { text: 'No', icon:'\u004d', key:'N' },
            { text: 'Sorry', icon:'\u00a1', key:'S' },
            { text: 'Attack', icon:'\u0049', key:'A' },
            { text: 'Follow Me', icon:'\u0050', key:'F' },
            { text: 'Good Game', icon:'\u00a3', key:'G' },
            { text: 'Bruh', icon:'\u{1F480}', key:'I' },
            { text: 'Hmm?', icon:'\u004b', key:'Q' },
            { text: 'No Problem', icon:'\u0047', key:'P' },
            { text: 'Defend', icon:'\u0025', key:'D' },
            { text: 'Thanks', icon:'\u0041', key:'X' },
            { text: '', icon: '>:D', key: 'L' }
        ],

        TICKS_PER_SECOND: 60,
        MILLISECONDS_PER_TICK: 1000 / 60,

        ENTITY_MANAGER: 60,
        SHIP_MANAGER: 30,

        MESSAGE_TIME: 120
    },
    TEAM_OPTIONS: {
        TEAMS: [
            [   
                {
                    TEAM: 0,
                    COLOR: 'Red',
                    HEX: '#ff0000',
                    NAME: 'Anarchist Concord Vega',
                    HUE: 0
                },
                {
                    TEAM: 1,
                    COLOR: 'Blue',
                    HEX: '#0000ff',
                    NAME: 'Andromeda Union',
                    HUE: 240
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Yellow',
                    HEX: '#ffff00',
                    NAME: 'Solaris Dominion',
                    HUE: 60
                },
                {
                    TEAM: 1,
                    COLOR: 'Purple',
                    HEX: '#ff00ff',
                    NAME: 'Galactic Empire',
                    HUE: 300
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Green',
                    HEX: '#00ff00',
                    NAME: 'Rebel Alliance',
                    HUE: 120
                },
                {
                    TEAM: 1,
                    COLOR: 'Orange',
                    HEX: '#ff8000',
                    NAME: 'Sovereign Trappist Colonies',
                    HUE: 30
                }
            ]
        ]
    },
    UIS: {
        SCOREBOARD: {
            id: 'scoreboard',
            visible: true,
            components: [
                {
                    type: 'box',
                    position: [0, 0, 100, 100 / 12],
                    stroke: '#ffffff',
                    fill: '#ffffff'
                },
                {
                    type: 'text',
                    position: [0, 0, 100, 100 / 12],
                    color: '#000000',
                    value: 'Team Name'
                },
                {
                    type: 'box',
                    position: [0, 50, 100, 100 / 12],
                    stroke: '#ffffff',
                    fill: '#ffffff'
                },
                {
                    type: 'text',
                    position: [0, 50, 100, 100 / 12],
                    color: '#000000',
                    value: 'Team Name'
                }
            ]
        },
        RADAR_BACKGROUND: {
            id: 'radar_background',
            visible: true,
            components: [
                
            ]
        },
        LIVES_BLOCKER: {
            id: "lives_blocker",
            visible: true,
            clickable: true,
            shortcut: String.fromCharCode(187),
            position: [65,0,10,10],
            components: []
        },
        MESSAGE: {
            id: 'message',
            position: [20, 45, 60, 10],
            visible: true,
            components: [
                {
                    type: 'box',
                    position: [0, 0, 100, 100],
                    stroke: '#ff0000',
                    fill: '#ff000080',
                    width: 2
                },
                {
                    type: 'text',
                    position: [5, 0, 90, 100],
                    value: '',
                    color: '#ffffff'
                }
            ]
        },
    },
    OBJECTS: {
        PLUME: {
            id: 'PLUME',
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            rotation: {
                x: 0,
                y: 0,
                z: 0
            },
            scale: {
                x: 10,
                y: 10,
                z: 0
            },
            type: {
                id: 'grid',
                obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                emissive: ''
            }
        }
    },
    ALIEN_OPTIONS: {
        ALIENS: [
            {
                NAME: 'Chicken',
                CODE: 10,
                LEVELS: [0, 1, 2],
                POINTS: [10, 20, 50],
                CRYSTAL_DROPS: [10, 20, 30],
                WEAPON_DROPS: [10, 20, 11]
            },
            {
                NAME: 'Crab',
                CODE: 11,
                LEVELS: [0, 1, 2],
                POINTS: [30, 60, 120],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [10, 20, 11]
            },
            {
                NAME: 'Caterpillar',
                CODE: 13,
                LEVELS: [0],
                POINTS: [50],
                CRYSTAL_DROPS: [10],
                WEAPON_DROPS: [11]
            },
            {
                NAME: 'Candlestick',
                CODE: 14,
                LEVELS: [0, 1, 2],
                POINTS: [80, 100, 120],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [10, 11, 12]
            },
            {
                NAME: 'Piranha',
                CODE: 16,
                LEVELS: [0, 1, 2],
                POINTS: [40, 75, 120],
                CRYSTAL_DROPS: [30, 40, 50],
                WEAPON_DROPS: [11, 21, 12]
            },
            {
                NAME: 'Pointu',
                CODE: 17,
                LEVELS: [0, 1, 2],
                POINTS: [80, 100, 150],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [11, 21, 12]
            },
            {
                NAME: 'Fork',
                CODE: 18,
                LEVELS: [0, 1, 2],
                POINTS: [100, 200, 300],
                CRYSTAL_DROPS: [20, 30, 40],
                WEAPON_DROPS: [10, 11, 12]
            },
            {
                NAME: 'Saucer',
                CODE: 19,
                LEVELS: [0, 1, 2],
                POINTS: [1000, 2500, 4000],
                CRYSTAL_DROPS: [100, 200, 300],
                WEAPON_DROPS: [21, 12, 12]
            }
        ],
        MAX_AMOUNT: 20,
        SPAWN_RATE: 60
    },
    COLLECTIBLE_OPTIONS: {
        COLLECTIBLES: [
            {
                NAME: '4 rockets pack',
                CODE: 10,
            },
            {
                NAME: '2 missiles pack',
                CODE: 11
            },
            {
                NAME: '1 torpedo',
                CODE: 12
            },
            {
                NAME: '8 light mines pack',
                CODE: 20
            },
            {
                NAME: '4 heavy mines pack',
                CODE: 21
            },
            // {
            //     NAME: 'Mining pod',
            //     CODE: 40
            // },
            // {
            //     NAME: 'Attack pod',
            //     CODE: 41
            // },
            // {
            //     NAME: 'Defence pod',
            //     CODE: 42
            // },
            {
                NAME: 'Energy refill',
                CODE: 90
            },
            {
                NAME: 'Shield refill',
                CODE: 91
            }
        ],
        MAX_AMOUNT: 30,
        SPAWN_RATE: 1200
    }
};

class Game {
    ships = [];
    teams = [];

    aliens = [];
    asteroids = [];

    plumes = [];

    constructor() {
        this.reset();
    }

    tick() {
        this.manageShips();
        // this.spawnAliens();
        this.spawnCollectibles();

        this.spawnActiveObjects();
        
        this.manageEntities();
    }

    reset() {
        this.deleteEverything();
        this.spawnInactiveObjects();
        // this.selectRandomTeams();
        this.resetShips();
    }

    deleteEverything() {
        for (let alien of game.aliens) {
            alien.set({ kill: true });
        }
        for (let asteroid of game.asteroids) {
            asteroid.set({ size: 1, kill: true });
        }
        for (let ship of game.ships) {
            ship.emptyWeapons();
        }
        game.removeObject();
    }

    spawnInactiveObjects() {
        
    }

    selectRandomTeams() {
        this.teams = [];
        let randTeamOption = Helper.getRandomArrayElement(C.TEAM_OPTIONS.TEAMS);
        for (let teamOption of randTeamOption) {
            this.teams.push(
                new Team(
                    teamOption.NAME,
                    teamOption.TEAM,
                    teamOption.COLOR,
                    teamOption.HEX,
                    teamOption.HUE
                )
            );
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        for (let ship of this.ships) {
            this.resetShip(ship);
            this.hideShipUIs(ship);
        }
    }

    resetShip(ship, resetTeam = true) {
        ship.setCrystals(ship.getMaxCrystals());
        ship.setShield(999999);
        ship.setStats(99999999);
        // if (resetTeam) {
        //     if (this.teams[0].numShips <= this.teams[1].numShips) {
        //         ship.setTeam(this.teams[0]);
        //         this.teams[0].numShips++;
        //     }
        //     else {
        //         ship.setTeam(this.teams[1]);
        //         this.teams[1].numShips++;
        //     }

        //     ship.setType(Helper.getRandomArrayElement(C.GAME_OPTIONS.SHIP_CODES));
        // }
        ship.setHue(45); // orange yellow
        ship.setVelocity(new Vector2(0, 0));
    }

    manageEntities() {
        if (game.step % C.GAME_OPTIONS.ENTITY_MANAGER === 0) {
            for (let asteroid of this.asteroids) {
                let found = false;
                for (let gameAsteroid of game.asteroids) {
                    if (asteroid.asteroid == gameAsteroid) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    Helper.deleteFromArray(this.asteroids, asteroid);
                }
            }
    
            for (let alien of this.aliens) {
                let found = false;
                for (let gameAlien of game.aliens) {
                    if (alien.alien == gameAlien) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    Helper.deleteFromArray(this.aliens, alien);
                }
            }
    
            for (let ship of this.ships) {
                let found = false;
                for (let gameShip of game.ships) {
                    if (ship.ship == gameShip) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    ship.team.numShips--;
                    Helper.deleteFromArray(this.ships, ship);
                }
            }

            // check if the gameShip is there, but is not recorded in this.ships, if so, then this.onShipSpawned
            for (let gameShip of game.ships) {
                let found = false;
                for (let ship of this.ships) {
                    if (ship.ship == gameShip) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.onShipSpawned(gameShip);
                }
            }
        }
    }

    manageShips() {
        for (let plume of this.plumes) {
            plume.destroySelf();
        }
        if (game.step % C.GAME_OPTIONS.SHIP_MANAGER === 0) {
            for (let ship of this.ships) {
                if (!ship.done) {
                    this.resetShip(ship, true);
                    ship.done = true;
                }



                ship.sendUI(Helper.deepCopy(C.UIS.LIVES_BLOCKER));

                let radarBackground = Helper.deepCopy(C.UIS.RADAR_BACKGROUND);
                ship.sendUI(radarBackground);

                let scoreboard = Helper.deepCopy(C.UIS.SCOREBOARD);
                scoreboard.components[0].fill = this.teams[0].hex;
                scoreboard.components[2].fill = this.teams[1].hex;
                scoreboard.components[1].value = this.teams[0].name;
                scoreboard.components[3].value = this.teams[1].name;
                let players1 = [];
                let players2 = [];
                for (let ship of this.ships) {
                    if (ship.team != null) {
                        if (ship.team.team == 0) {
                            players1.push(ship);
                        }
                        else if (ship.team.team == 1) {
                            players2.push(ship);
                        }
                    }
                }
                players1.sort((a, b) => b.score - a.score);
                players2.sort((a, b) => b.score - a.score);
                for (let i = 0; i < 5; i++) {
                    if (players1[i]) {
                        scoreboard.components.push({
                            type: 'player',
                            position: [0, (i + 1) * 100 / 12, 100, 100 / 12],
                            id: players1[i].ship.id,
                            color: '#ffffff',
                            align: 'left'
                        },
                        {
                            type: 'text',
                            position: [0, (i + 1) * 100 / 12, 100, 100 / 12],
                            value: players1[i].score,
                            color: '#ffffff',
                            align: 'right'
                        });
                    }
                    else {
                        break;
                    }
                }
                for (let i = 0; i < 5; i++) {
                    if (players2[i]) {
                        scoreboard.components.push({
                            type: 'player',
                            position: [0, 50 + (i + 1) * 100 / 12, 100, 100 / 12],
                            id: players2[i].ship.id,
                            color: '#ffffff',
                            align: 'left'
                        },
                        {
                            type: 'text',
                            position: [0, 50 + (i + 1) * 100 / 12, 100, 100 / 12],
                            value: players2[i].score,
                            color: '#ffffff',
                            align: 'right'
                        });
                    }
                    else {
                        break;
                    }
                }
                ship.sendUI(scoreboard);
                ship.tick();
            }
        }
    }

    hideShipUIs(ship) {
        ship.hideUI(Helper.deepCopy(C.UIS.LIVES_BLOCKER));
        ship.hideUI(Helper.deepCopy(C.UIS.SCOREBOARD));
        ship.hideUI(Helper.deepCopy(C.UIS.RADAR_BACKGROUND));        
    }

    spawnAliens() {
        if (
            game.step % C.ALIEN_OPTIONS.SPAWN_RATE === 0 &&
            game.aliens.length < C.ALIEN_OPTIONS.MAX_AMOUNT
        ) {
            let pos = Helper.getRandomMapCoordinate();

            let as = Helper.deepCopy(C.ALIEN_OPTIONS.ALIENS);
            as.splice(7, 1);
            let alienOption = Helper.getRandomArrayElement(as);
            let level = Helper.getRandomArrayElement(alienOption.LEVELS);

            this.aliens.push(
                new Alien(
                    pos,
                    new Vector2(0, 0),

                    alienOption.NAME,
                    alienOption.CODE,
                    level,

                    alienOption.POINTS[level],
                    alienOption.CRYSTAL_DROPS[level],
                    alienOption.WEAPON_DROPS[level]
                )
            );
        }
    }

    spawnCollectibles() {
        if (
            game.step % C.COLLECTIBLE_OPTIONS.SPAWN_RATE === 0 &&
            game.collectibles.length < C.COLLECTIBLE_OPTIONS.MAX_AMOUNT
        ) {
            for (let i = 0; i < C.COLLECTIBLE_OPTIONS.MAX_AMOUNT; i++) {
                let pos = Helper.getRandomMapCoordinate();
                let collectibleOption = Helper.getRandomArrayElement(C.COLLECTIBLE_OPTIONS.COLLECTIBLES);
                new Collectible(
                    pos,
                    collectibleOption.NAME,
                    collectibleOption.CODE,
                )
            }
        }
    }

    spawnActiveObjects() {
        
    }

    findShip(gameShip) {
        for (let ship of this.ships) {
            if (ship.ship == gameShip || ship.ship.id == gameShip.id) {
                return ship;
            }
        }
        return null;
    }

    findAlien(gameAlien) {
        for (let alien of this.aliens) {
            if (alien.alien == gameAlien || alien.alien.id == gameAlien.id) {
                return alien;
            }
        }
    }

    onShipSpawned(gameShip) {
        if (this.findShip(gameShip) == null) {
            let ship = new Ship(gameShip);
            this.ships.push(ship);
        }
        else { // on respawn
            let ship = this.findShip(gameShip);
            ship.setCrystals(ship.getMaxCrystals());
            ship.setShield(999999);
            ship.setStats(99999999);
        }
    }

    onShipDestroyed(gameShip) {
        // Nothing
    }

    onUIComponentClicked(gameShip, id) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {
        
    }
}

class Message {
    startTime = 0;
    running = false;

    ship = null;
    text = '';
    baseColor = 0;

    constructor(ship, text, baseColor) {
        this.startTime = game.step;
        this.running = true;

        this.ship = ship;
        this.text = text;
        this.baseColor = baseColor;
        
        let message = Helper.deepCopy(C.UIS.MESSAGE);
        message.components[0].stroke = this.baseColor;
        message.components[0].fill = this.baseColor + '80';
        message.components[1].value = this.text;
        this.ship.sendUI(message);
    }

    tick() {
        if (this.running) {
            if (game.step - this.startTime >= C.GAME_OPTIONS.MESSAGE_TIME) {
                this.ship.hideUI(Helper.deepCopy(C.UIS.MESSAGE));
                this.running = false;
            }
        }
    }
}

class Team {
    name = '';
    team = 0;
    color = '';
    hex = 0;
    hue = 0;

    score = 0;
    totalScore = 0;

    numShips = 0;

    constructor(name, team, color, hex, hue) {
        this.name = name;
        this.team = team;
        this.color = color;
        this.hex = hex;
        this.hue = hue;
    }

    setScore(score) {
        this.score = score;
    }
}

class Ship {
    team = null;
    ship = null;

    message = null;

    done = false;

    score = 0;

    constructor(ship) {
        this.ship = ship;
    }

    sendUI(ui) {
        if (this.ship != null) {
            this.ship.setUIComponent(ui);
        }
    }

    hideUI(ui) {
        ui.position = [0, 0, 0, 0];
        ui.visible = false;
        ui.clickable = false;
        ui.components = [];

        this.sendUI(ui);
    }

    tick() {
        if (this.message != null) {
            if (this.message.running) {
                this.message.tick();
            }
            else {
                this.message = null;
            }
        }

        this.ship.set({ score: this.score });
    }

    sendMessage(text, baseColor) {
        this.message = new Message(this, text, baseColor);
    }

    sendChooseShip() {
        this.chooseShipVisible = true;
    }

    getLevel() {
        return Math.trunc(this.ship.type / 100);
    }

    getModel() {
        return this.ship.type % 100;
    }

    getMaxCrystals() {
        switch(this.getLevel()) {
            case 1:
                return 20;
            case 2:
                return 80;
            case 3:
                return 180;
            case 4:
                return 360;
            case 5:
                return 500;
            case 6:
                return 720;
            case 7:
                return 980;
            default:
                return 0;
        }
    }

    setPosition(position) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ x: position.x, y: position.y });
        }
        return this;
    }

    setVelocity(velocity) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    setCrystals(crystals) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ crystals: crystals });
        }
        return this;
    }

    setShield(shield) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ shield: shield });
        }
        return this;
    }

    setStats(stats) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ stats: stats });
        }
        return this;
    }

    setInvulnerable(invulnerable) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ invulnerable: invulnerable });
        }
        return this;
    }

    setIdle(idle) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ idle: idle });
        }
        return this;
    }

    setCollider(collider) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ collider: collider });
        }
        return this;
    }

    setTeam(team) {
        this.team = team;
        if (game.ships.includes(this.ship)) {
            this.ship.set({ team: team.team, hue: team.hue });
        }
        return this;
    }

    setHue(hue) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ hue: hue });
        }
        return this;
    }

    setScore(score) {
        this.score = score;
        if (game.ships.includes(this.ship)) {
            this.ship.set({ score: score });
        }
        return this;
    }

    setType(type) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ type: type });
        }
        return this;
    }

    destroySelf() {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ kill: true });
        }
        return this;
    }
}

class Alien {
    name = '';

    alien = null;

    constructor(
        position, velocity,
        name, code, level,
        points, crystalDrop, weaponDrop
    ) {
        this.name = name;

        this.alien = game.addAlien({
            x: position.x, y: position.y, vx: velocity.x, vy: velocity.y,
            code: code, level: level,
            points: points, crystal_drop: crystalDrop, weapon_drop: weaponDrop,
        });
    }

    setPosition(position) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ x: position.x, y: position.y });
        }
        return this;
    }

    setVelocity(velocity) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    setShield(shield) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ shield: shield });
        }
        return this;
    }

    setRegen(regen) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ regen: regen });
        }
        return this;
    }

    setDamage(damage) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ damage: damage });
        }
        return this;
    }

    setLaserSpeed(laserSpeed) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ laser_speed: laserSpeed });
        }
        return this;
    }

    setRate(rate) {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ rate: rate });
        }
        return this;
    }

    destroySelf() {
        if (game.aliens.includes(this.alien)) {
            this.alien.set({ kill: true });
        }
        return this;
    }
}

class Collectible {
    name = '';

    constructor(
        position,
        name,
        code
    ) {
        this.name = name;

        game.addCollectible({
            x: position.x, y: position.y,
            code: code
        });
    }
}

class Asteroid {
    asteroid = null;

    constructor(position, velocity, size) {
        this.asteroid = game.addAsteroid({
            x: position.x, y: position.y, vx: velocity.x, vy: velocity.y,
            size: size
        });
    }

    setPosition(position) {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ x: position.x, y: position.y });
        }
        return this;
    }

    setVelocity(velocity) {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    setSize(size) {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ size: size });
        }
        return this;
    }

    destroySelf() {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ kill: true });
        }
        return this;
    }

    destroySelfNoRemains() {
        if (game.asteroids.includes(this.asteroid)) {
            this.asteroid.set({ size: 1, kill: true });
        }
        return this;
    }
}

class Obj {
    obj = null;

    constructor(
        id,
        type,
        position, rotation, scale
    ) {
        this.obj = {
            id: id,
            type: type,
            position: position, rotation: rotation, scale: scale
        };
    }

    update() {
        game.setObject(this.obj);
    }

    setPosition(position) {
        this.obj.position = position;
        return this;
    }

    setRotation(rotation) {
        this.object.rotation = rotation;
        return this;
    }

    setScale(scale) {
        this.obj.scale = scale;
        return this;
    }

    destroySelf() {
        this.obj.position.z = -10000;
        this.obj.scale.x *= 0.00001;
        this.obj.scale.y *= 0.00001;
        this.obj.scale.z *= 0.00001;
        this.update();
        game.removeObject(this.obj.id);
    }
}

class ObjectType {
    objectType = null;

    constructor(
        id,
        obj,
        diffuse, emissive, specular, bump,
        diffuseColor, emissiveColor,
        transparent,
        bumpScale,
        physics
    ) {
        this.objectType = {
            id: id,
            obj: obj,
            diffuse: diffuse, emissive: emissive, specular: specular, bump: bump,
            diffuseColor: diffuseColor, emissiveColor: emissiveColor,
            transparent: transparent,
            bumpScale: bumpScale,
            physics: physics
        };
    }
}

class ObjectPhysics {
    objectPhysics = null;

    constructor(
        mass,
        shape
    ) {
        this.objectPhysics = {
            mass: mass,
            shape: shape
        };
    }
}

class UIComponent {
    uiComponent = null;

    constructor(
        id,
        position,
        visible,
        clickable, shortcut,
        components
    ) {
        this.uiComponent = {
            id: id,
            position: position,
            visible: visible,
            clickable: clickable, shortcut: shortcut,
            components: components
        };
        game.setUIComponent(this.uiComponent);
    }
    
    setPosition(position) {
        this.uiComponent.position = position;
        return this;
    }

    setVisible(visible) {
        this.uiComponent.visible = visible;
        return this;
    }

    setClickable(clickable) {
        this.uiComponent.clickable = clickable;
        return this;
    }

    setShortcut(shortcut) {
        this.uiComponent.shortcut = shortcut;
        return this;
    }

    setComponents(components) {
        this.uiComponent.components = components;
        return this;
    }

    addComponent(component) {
        this.uiComponent.components.push(component);
        return this;
    }

    removeComponent(component) {
        Helper.deleteFromArray(this.uiComponent.components, component);
        return this;
    }

    destroySelf() {
        this.uiComponent.visible = false;
        this.uiComponent.position = [0, 0, 0, 0];
        game.setUIComponent(this.uiComponent);
    }
}

class UISubComponent {
    uiSubComponent = null;

    constructor(
        type,
        id, // player id for badge
        position,
        value,
        color,
        fill,
        width,
        stroke,
        align
    ) {
        this.uiSubComponent = {
            type: type,
            id: id,
            position: position,
            value: value,
            color: color,
            fill: fill,
            width: width,
            stroke: stroke,
            align: align
        };
    }

    setId(id) {
        this.uiSubComponent.id = id;
        return this;
    }

    setPosition(position) {
        this.uiSubComponent.position = position;
        return this;
    }

    setValue(value) {
        this.uiSubComponent.value = value;
        return this;
    }

    setColor(color) {
        this.uiSubComponent.color = color;
        return this;
    }

    setFill(fill) {
        this.uiSubComponent.fill = fill;
        return this;
    }

    setWidth(width) {
        this.uiSubComponent.width = width;
        return this;
    }

    setStroke(stroke) {
        this.uiSubComponent.stroke = stroke;
        return this;
    }

    setAlign(align) {
        this.uiSubComponent.align = align;
        return this;
    }
}

class Vector2 {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    addScalar(scalar) {
        return new Vector2(this.x + scalar, this.y + scalar);
    }

    subtractScalar(scalar) {
        return new Vector2(this.x - scalar, this.y - scalar);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    normalize() {
        return this.divide(this.length());
    }

    getDistanceTo(vector) {
        return Math.sqrt(this.getDistanceSquaredTo(vector));
    }

    getDistanceSquaredTo(vector) {
        const dx = vector.x - this.x;
        const dy = vector.y - this.y;
        return dx * dx + dy * dy;
    }

    getAngleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

class Vector3 {
    x = 0;
    y = 0;
    z = 0;

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vector) {
        return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }

    subtract(vector) {
        return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    divide(scalar) {
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    addScalar(scalar) {
        return new Vector3(this.x + scalar, this.y + scalar, this.z + scalar);
    }

    subtractScalar(scalar) {
        return new Vector3(this.x - scalar, this.y - scalar, this.z - scalar);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y + this.z * vector.z;
    }

    cross(vector) {
        return new Vector3(
            this.y * vector.z - this.z * vector.y,
            this.z * vector.x - this.x * vector.z,
            this.x * vector.y - this.y * vector.x
        );
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        return this.divide(this.length());
    }

    getDistanceTo(vector) {
        return this.subtract(vector).length();
    }

    getDistanceSquaredTo(vector) {
        return this.subtract(vector).lengthSquared();
    }

    getAngleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
}

class Helper {
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.getRandomInt(0, i);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static getRandomRectCoordinate(min, max) {
        return new Vector2(
            this.getRandomInt(min.x, max.x),
            this.getRandomInt(min.y, max.y)
        );
    }

    static getRandomRadialCoordinate(radius, center) {
        // https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
        let r = radius * Math.sqrt(Math.random());
        let theta = this.getRandomAngle();
        return new Vector2(
            center.x + r * Math.cos(theta),
            center.y + r * Math.sin(theta)
        );
    }

    static getRandomMapCoordinate() {
        return Helper.getRandomRectCoordinate(
            new Vector2(-C.GAME_OPTIONS.MAP_SIZE / 2 * 10, -C.GAME_OPTIONS.MAP_SIZE / 2 * 10),
            new Vector2(C.GAME_OPTIONS.MAP_SIZE / 2 * 10, C.GAME_OPTIONS.MAP_SIZE / 2 * 10)
        );
    }

    static getRandomAngle() {
        return Math.random() * 2  * Math.PI;
    }

    static getRandomArrayElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    static formatTime(time) {
        let minutes = 0;
        let seconds = Math.floor(time / 60);
        minutes = Math.floor(seconds / 60);
        seconds %= 60;
        return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
    }
    
    static deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static deleteFromArray(array, element) {
        let index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    static getRadarSpotPosition(x, y, w, h) {
        let scalePos = 10 / C.GAME_OPTIONS.MAP_SIZE;
        let scaleSize = 10 / C.GAME_OPTIONS.MAP_SIZE;
        return [
            50 + x * scalePos - w * scaleSize / 2,
            50 - y * scalePos - h * scaleSize / 2,
            w * scaleSize,
            h * scaleSize
        ];
    }
}

this.options = {
    root_mode: C.GAME_OPTIONS.ROOT_MODE,
    map_size: C.GAME_OPTIONS.MAP_SIZE,
    custom_map: C.GAME_OPTIONS.MAP,
    crystal_value: C.GAME_OPTIONS.CRYSTAL_VALUE,

    friendly_colors: C.GAME_OPTIONS.FRIENDLY_COLORS,
    
    radar_zoom: C.GAME_OPTIONS.RADAR_ZOOM,

    speed_mod: C.GAME_OPTIONS.SPEED_MOD,
    friction_ratio: C.GAME_OPTIONS.FRICTION_RATIO,

    weapons_store: C.GAME_OPTIONS.WEAPONS_STORE,
    projectile_speed: C.GAME_OPTIONS.PROJECTILE_SPEED,

    starting_ship: C.GAME_OPTIONS.STARTING_SHIP,
    reset_tree: C.GAME_OPTIONS.RESET_TREE,
    choose_ship: C.GAME_OPTIONS.CHOOSE_SHIP,
    ships: C.GAME_OPTIONS.SHIPS,

    vocabulary: C.GAME_OPTIONS.VOCABULARY
}

let g = null;

this.tick = function() {
    if (g != null) {
        g.tick();
    }
    else {
        g = new Game();
    }
}

this.event = function(event) {
    let gameShip = event.ship;
    if (gameShip != null && g != null) {
        switch(event.name) {
            case 'ship_spawned':
                g.onShipSpawned(gameShip);
                break;
            case 'ship_destroyed':
                g.onShipDestroyed(gameShip);
                break;
            case'ui_component_clicked':
                g.onUIComponentClicked(gameShip, event.id);
                break;
        }
    }

    let gameAlien = event.alien;
    if (gameAlien != null && g != null) {
        switch(event.name) {
            case 'alien_destroyed':
                g.onAlienDestroyed(gameAlien, event.killer);
                break;
        }
    }
}
