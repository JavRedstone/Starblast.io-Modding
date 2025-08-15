/*
    Starblast Mod Template

    @author JavRedstone
    @version 3.0.0

    Developed in 2025
*/

const Game = class {
    static shipGroups = [];

    timeouts = [];
    conditions = [];
    
    shipResetQueue = null;

    ships = [];
    leftShips = [];
    teams = [];

    aliens = [];

    timedObjs = [];

    asteroids = [];
    timedAsteroids = [];
    
    isGameOver = false;

    resettingAliens = false;

    static C = {
        OPTIONS: {
            ROOT_MODE: '',

            MAP_SIZE: 100,
            MAP: "",

            ASTEROIDS_STRENGTH: 0.75,
            RELEASE_CRYSTAL: true,
            CRYSTAL_DROP: 2,
            CRYSTAL_VALUE: 2,

            FRIENDLY_COLORS: 2,

            RADAR_ZOOM: 2,

            SPEED_MOD: 1.2,
            FRICTION_RATIO: 1,

            WEAPONS_STORE: false,
            PROJECTILE_SPEED: 1,

            STARTING_SHIP: 102,
            RESET_TREE: true,
            CHOOSE_SHIP: null,

            LIVES: 4,
            MAX_TIER_LIVES: 0,
            MAX_LEVEL: 7,

            SHIPS: [],
            MAX_PLAYERS: 60,

            VOCABULARY: [
                { text: "Yes", icon: "\u004c", key: "Y" },
                { text: "No", icon: "\u004d", key: "N" },
                { text: "Defend", icon: "\u0025", key: "D" },
                { text: "Kill", icon: "\u007f", key: "K" },
                { text: "Sorry", icon: "\u00a1", key: "S" },
                { text: "Thanks", icon: "\u0041", key: "X" },
                { text: "You", icon: "\u004e", key: "O" },
                { text: "Me", icon: "\u004f", key: "E" },
                { text: "No Problem", icon: "\u0047", key: "P" },
                { text: "Attack", icon: "\u0049", key: "A" },
                { text: "Help", icon: "\u004a", key: "H" },
                { text: "Hmmm?", icon: "\u004b", key: "Q" },
                { text: "GoodGame", icon: "\u00a3", key: "G" },
                { text: "Wait", icon: "\u0048", key: "T" },
                { text: 'Time', icon: "⌛", key: "J" },
                { text: "Follow", icon: "\u0050", key: "F" },
                { text: "Love", icon: "\u0024", key: "L" },
                { text: "Base", icon: "\u0034", key: "B" },
                { text: "Flag", icon: "⚑", key: "I" },
                { text: "Bruh", icon: "˙ ͜ʟ˙", key: "M" },
                { text: "WTF", icon: "ಠ_ಠ", key: "W" }
            ]
        },
        TICKS: {
            TICKS_PER_SECOND: 60,
            MILLISECONDS_PER_TICK: 1000 / 60,

            ENTITY_MANAGER: 60,
            SHIP_MANAGER: 30,
            SHIP_MANAGER_FAST: 15,

            RESET_STAGGER: 5,

            GAME_MANAGER: 30
        },
        IS_DEBUGGING: false,
    }

    static setShipGroups(shipGroups) {
        Game.C.OPTIONS.SHIPS = ['{"name":"Invisible","level":1,"model":2,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":1,"model":2,"code":102,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'];
        for (let [tier, shipMap] of Object.entries(shipGroups)) {
            let shipGroup = new ShipGroup(parseInt(tier), shipMap);
            Game.shipGroups.push(shipGroup);
            Game.C.OPTIONS.SHIPS.push(...shipGroup.ships);
        }
    }

    constructor() {
        this.shipResetQueue = new StaggeredQueueCreator(Game.C.TICKS.RESET_STAGGER);
        this.reset();
    }

    tick() {
        this.manageTimeouts();
        this.manageConditions();
        this.manageQueues();
        this.manageEntities();

        this.manageGameState();

        this.manageShips();

        this.tickTimedEntities();
    }

    manageTimeouts() {
        let removedTimeouts = [];
        for (let i = 0; i < this.timeouts.length; i++) {
            let timeout = this.timeouts[i];
            if (timeout.running) {
                timeout.tick();
            } else {
                removedTimeouts.push(timeout);
            }
        }
        for (let timeout of removedTimeouts) {
            Helper.deleteFromArray(this.timeouts, timeout);
        }
    }

    manageConditions() {
        let removedConditions = [];
        for (let i = 0; i < this.conditions.length; i++) {
            let condition = this.conditions[i];
            if (condition.running) {
                condition.tick();
            } else {
                removedConditions.push(condition);
            }
        }
        for (let condition of removedConditions) {
            Helper.deleteFromArray(this.conditions, condition);
        }
    }

    manageQueues() {
        this.shipResetQueue.tick();
        for (let team of this.teams) {
            if (team.base) {
                for (let subBaseModule of team.base.subBaseModules) {
                    subBaseModule.manageQueues();
                }
            }
        }
    }

    reset() {
        this.deleteEverything();
        this.resetContainers();
        this.timeouts.push(new TimeoutCreator(() => {
            this.selectRandomTeams();
            this.resetShips();
        }, Game.C.TICKS.RESET_STAGGER).start());
    }

    resetContainers() {
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

        this.deleteObjs();

        game.removeObject();
    }

    deleteObjs() {
        for (let team of this.teams) {
            team.base.destroySelf();
        }
    }

    selectRandomTeams() {
        this.teams = [];
        let availableTeamOptions = Helper.deepCopy(Team.C.TEAMS);
        for (let i = 0; i < Game.C.OPTIONS.FRIENDLY_COLORS / 2; i++) {
            let randIndex = Helper.getRandomInt(0, availableTeamOptions.length - 1);
            let randTeamOption = availableTeamOptions[randIndex];
            availableTeamOptions.splice(randIndex, 1);
            for (let teamOption of randTeamOption) {
            if (this.teams.length < Game.C.OPTIONS.FRIENDLY_COLORS) {
                this.teams.push(
                    new Team(
                        this.teams.length,
                        teamOption.COLOR,
                        teamOption.HEX,
                        teamOption.NAME,
                        teamOption.HUE,
                        teamOption.FLAGGED
                    )
                );
            }
            }
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            this.shipResetQueue.add(() => {
                this.resetShip(ship);
            });
        }
        this.timeouts.push(new TimeoutCreator(() => {
            this.isResetting = false;
        }, Game.C.TICKS.RESET_STAGGER * (this.ships.length + 1)).start());
    }

    resetShip(ship) {
        ship.isResetting = true;

        ship.reset();

        ship.setType(102);
        ship.setPosition(new Vector2());

        ship.hideAllUIs();

        ship.sendUI(UIComponent.C.UIS.SCOREBOARD_SWITCH);

        ship.done = true;
        ship.isResetting = false;

        ship.selectingTeam = true;
    }

    gameOver() {
        this.isGameOver = true;
        for (let ship of this.ships) {
            ship.gameOver();
        }
    }

    getWinningTeam() {
        let team0 = this.teams[0];
        let team1 = this.teams[1];
        if (team0.score > team1.score) {
            return team0;
        }
        else if (team1.score > team0.score) {
            return team1;
        }
        else {
            return null;
        }
    }

    manageGameState() {
        if (this.isGameOver) {
            this.gameOver();
        }
        if (this.isResetting) return;
        if (game.step % Game.C.TICKS.GAME_MANAGER == 0) {
            
        }
    }

    tickTimedEntities() {
        let removedTimedObjs = [];
        for (let timedObj of this.timedObjs) {
            timedObj.tick();
            if (!timedObj.running) {
                removedTimedObjs.push(timedObj);
            }
        }
        for (let timedObj of removedTimedObjs) {
            Helper.deleteFromArray(this.timedObjs, timedObj);
        }

        let removedTimedAsteroids = [];
        let removedAsteroids = [];
        for (let timedAsteroid of this.timedAsteroids) {
            timedAsteroid.tick();
            if (!timedAsteroid.running) {
                removedTimedAsteroids.push(timedAsteroid);
                removedAsteroids.push(timedAsteroid.asteroid);
            }
        }
        for (let timedAsteroid of removedTimedAsteroids) {
            Helper.deleteFromArray(this.timedAsteroids, timedAsteroid);
            Helper.deleteFromArray(this.asteroids, timedAsteroid.asteroid);
        }
    }

    manageEntities() {
        if (game.step % Game.C.TICKS.ENTITY_MANAGER === 0) {
            let notFoundAsteroids = [];
            for (let asteroid of this.asteroids) {
                let found = false;
                for (let gameAsteroid of game.asteroids) {
                    if (asteroid.asteroid.id == gameAsteroid.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundAsteroids.push(asteroid);
                }
            }
            for (let asteroid of notFoundAsteroids) {
                Helper.deleteFromArray(this.asteroids, asteroid);
            }

            let notFoundAliens = [];
            for (let alien of this.aliens) {
                let found = false;
                for (let gameAlien of game.aliens) {
                    if (alien.alien.id == gameAlien.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundAliens.push(alien);
                }
            }
            for (let alien of notFoundAliens) {
                Helper.deleteFromArray(this.aliens, alien);
            }

            let notFoundShips = new Set([]);
            for (let ship of this.ships) {
                let found = false;
                for (let gameShip of game.ships) {
                    if (ship.ship.id == gameShip.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundShips.add(ship);
                }
            }
            for (let team of this.teams) {
                for (let ship of team.ships) {
                    let found = false;
                    for (let gameShip of game.ships) {
                        if (ship.ship.id == gameShip.id) {
                            found = true;
                            break;
                        }
                    }
                    if (!found && !notFoundShips.has(ship)) {
                        notFoundShips.add(ship);
                    }
                }
            }
            for (let ship of notFoundShips.values()) {
                if (ship.team) {
                    ship.team.removeShip(ship);
                }
                Helper.deleteFromArray(this.ships, ship);
                let hasLeftShip = false;
                for (let leftShip of this.leftShips) {
                    if (leftShip.ship.id == ship.ship.id) {
                        hasLeftShip = true;
                        break;
                    }
                }
                if (!hasLeftShip) {
                    ship.left = true;
                    this.leftShips.push(ship);
                }
            }

            // check if the gameShip is there, but is not recorded in this.ships, if so, then this.onShipSpawned
            for (let gameShip of game.ships) {
                let found = false;
                for (let ship of this.ships) {
                    if (ship.ship.id == gameShip.id) {
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
        if (!this.isResetting && game.step % Game.C.TICKS.SHIP_MANAGER === 0) {
            for (let ship of this.ships) {
                if (ship) {
                    if (!ship.done && !ship.isResetting) {
                        this.shipResetQueue.add(() => {
                            ship.isResetting = true;
                            this.resetShip(ship);
                        });
                    }

                    if (!ship.isResetting) {

                    }
                }
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                if (!ship.resetting) {
                }

                ship.tick();
            }
        }
    }

    getOppTeam(team) {
        for (let i = 0; i < this.teams.length; i++) {
            if (this.teams[i].team != team.team) {
                return this.teams[i];
            }
        }
    }

    sendNotifications(title, message, team = null, supportingTeam = null) {
        let targetShips = [];
        if (team) {
            targetShips = team.ships;
        } else {
            targetShips = this.ships;
        }
        for (let ship of targetShips) {
            let notification = Helper.deepCopy(UIComponent.C.UIS.NOTIFICATION);
            if (supportingTeam && supportingTeam.team == ship.team.team) {
                notification.components[0].fill = '#00ff0020';
            }
            else {
                notification.components[0].fill = '#ff000020';
            }
            notification.components[1].value = title;
            notification.components[2].value = message;
            ship.sendTimedUI(notification);
        }
    }

    findShip(gameShip) {
        for (let ship of this.ships) {
            if (ship.ship == gameShip || ship.ship.id == gameShip.id) {
                return ship;
            }
        }
        for (let ship of this.leftShips) {
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
        return null;
    }

    onShipSpawned(gameShip) {
        let ship = this.findShip(gameShip);
        if (ship == null) {
            ship = new Ship(gameShip);
            this.ships.push(ship);
        }
        else { // on respawn
            ship.setInvulnerable(Ship.C.INVULNERABLE_TIME)
            ship.setVelocity(new Vector2(0, 0));
            ship.fillUp();
        }
    }

    onShipDestroyed(gameShip, gameShipKiller) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            ship.ship.alive = false;
            ship.deaths++;
            ship.setScore(ship.ship.score / 2);
            if (gameShipKiller) {
                let shipKiller = this.findShip(gameShipKiller);
                if (shipKiller != null) {
                    shipKiller.kills++;
                }
            }
        }
    }

    onUIComponentClicked(gameShip, id) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            if (ship.hiddenUIIDs.has(id)) {
                return;
            }
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {
        let safeAlien = this.findSafeAlien(gameAlien);
        if (safeAlien != null) {
            safeAlien.handleAlienDestroyed(gameAlien, gameShip);
        }
    }
}

const Team = class {
    team = 0;
    color = '';
    hex = 0;
    hue = 0;

    ships = [];

    static C = {
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
    }

    constructor(team, color, hex, name, hue) {
        this.team = team;
        this.color = color;
        this.hex = hex;
        this.name = name;
        this.hue = hue;
    }

    spawnBase() {
        this.base = new Base(this).spawnBase();
    }

    tick() {
        if (this.base) {
            this.base.tick();
        }
    }

    hasShip(ship) {
        for (let s of this.ships) {
            if (s.ship.id == ship.ship.id) {
                return true;
            }
        }
        return false;
    }

    addShip(ship) {
        if (!this.hasShip(ship)) {
            this.ships.push(ship);
        }
    }

    removeShip(ship) {
        let removeShips = [];
        for (let s of this.ships) {
            if (s.ship.id == ship.ship.id) {
                removeShips.push(s);
                break;
            }
        }
        for (let s of removeShips) {
            Helper.deleteFromArray(this.ships, s);
        }
    }

    getMinScore() {
        let minScore = Infinity;
        for (let ship of this.ships) {
            if (ship.ship.score < minScore) {
                minScore = ship.ship.score;
            }
        }
        return minScore;
    }

    getMaxScore() {
        let maxScore = 0;
        for (let ship of this.ships) {
            if (ship.ship.score > maxScore) {
                maxScore = ship.ship.score;
            }
        }
        return maxScore;
    }

    getKills() {
        let kills = 0;
        for (let ship of this.ships) {
            kills += ship.kills;
        }
        return kills;
    }

    getDeaths() {
        let deaths = 0;
        for (let ship of this.ships) {
            deaths += ship.deaths;
        }
        return deaths;
    }

    getKD() {
        let kills = this.getKills();
        let deaths = this.getDeaths();
        if (deaths == 0) {
            return kills;
        }
        return kills / deaths;
    }

    getTotalLevel() {
        let totalLevel = 0;
        for (let ship of this.ships) {
            totalLevel += ship.getLevel();
        }
        return totalLevel;
    }
}

const ShipGroup = class {
    tier = 0;
    ships = [];

    static C = {
        SHIPS: {
            '1': {
                '101': { // When adding fly, add the `next: [201, 202] fields`
                    SHIP: '{"name":"Fly","level":1,"model":1,"size":1.05,"next":[201,202],"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856,"next":[201,202]}}',
                },
            },
        }
    }

    constructor(tier, shipMap) {
        this.tier = tier;

        this.processShips(shipMap);
    }

    processShips(shipMap) {
        for (let value of Object.values(shipMap)) {
            let ship = value.SHIP;
            this.ships.push(ship);
        }
    }

    static getShipInfo(type) {
        let level = Math.floor(type / 100);
        return ShipGroup.C.SHIPS[`${level}`][`${type}`];
    }

    static getShipName(type) {
        let shipInfo = ShipGroup.getShipInfo(type);
        if (shipInfo && shipInfo.SHIP) {
            let jShip = JSON.parse(shipInfo.SHIP);
            return jShip.typespec.name;
        }
        return '';
    }
}

const Ship = class {
    team = null;
    ship = null;

    kills = 0;
    deaths = 0;

    timeouts = [];
    conditions = [];
    lerp = null;

    allUIs = [];
    timedUIs = [];
    hiddenUIIDs = new Set();
    highScore = 0;

    selectingTeam = false;
    scoreboardTeam = null;

    upgradeHistory = [];

    left = false;
    done = false;

    isResetting = false;

    static C = {
        INVULNERABLE_TIME: 360,
        LERP_INVULNERABLE_TIME: 540,
    }

    constructor(ship) {
        this.ship = ship;
    }

    reset() {
        this.fillUp();
        this.setVelocity(new Vector2(0, 0));
        this.setCollider(true);
        this.setIdle(false);
        this.setScore(0);
        
        this.highScore = 0;

        this.ship.emptyWeapons();
    }

    sendUI(ui, hideMode = false) {
        if (this.ship != null) {
            let cUI = UIComponent.convertUIHexToHsla(Helper.deepCopy(ui));
            let removedUIs = [];
            for (let u of this.allUIs) {
                if (u.id == cUI.id) {
                    removedUIs.push(u);
                }
            }
            if (!(removedUIs.length >= 1 && Helper.areObjectsEqual(removedUIs[0], cUI))) {
                this.ship.setUIComponent(cUI);

                if (hideMode) {
                    this.hiddenUIIDs.add(cUI.id);
                } else {
                    this.hiddenUIIDs.delete(cUI.id);
                }
            }

            for (let u of removedUIs) {
                Helper.deleteFromArray(this.allUIs, u);
            }
            if (!hideMode) {
                this.allUIs.push(cUI);
            }
        }
    }

    hideUI(ui) {
        let cUI = Helper.deepCopy(ui);

        cUI.position = [0, 0, 0, 0];
        cUI.visible = false;
        cUI.clickable = false;
        cUI.components = [];

        this.sendUI(cUI, true);
    }

    hideUIsIncludingID(ui) {
        let uiID = ui.id;
        let removedUIs = [];
        for (let u of this.allUIs) {
            if (u.id.includes(uiID)) {
                removedUIs.push(u);
            }
        }
        for (let u of removedUIs) {
            this.hideUI(u);
        }
    }

    sendTimedUI(ui, time = TimedUI.C.DEFAULT_TIME) {
        let removedUIs = [];
        for (let timedUI of this.timedUIs) {
            if (timedUI.ui.id == ui.id) {
                timedUI.running = false;
                removedUIs.push(timedUI);
            }
        }
        for (let timedUI of removedUIs) {
            Helper.deleteFromArray(this.timedUIs, timedUI);
        }
        let tui = new TimedUI(this, ui, time);
        this.timedUIs.push(tui);
    }

    hideAllUIs() {
        let removedUIs = [];
        for (let ui of this.allUIs) {
            removedUIs.push(ui);
        }
        for (let ui of removedUIs) {
            this.hideUI(ui);
        }
        removedUIs = [];
        for (let uiGeneric in UIComponent.C.UIS) {
            this.hideUI(UIComponent.C.UIS[uiGeneric]);
            this.hideUIsIncludingID(UIComponent.C.UIS[uiGeneric]);
        }
        this.allUIs = [];
        this.timedUIs = [];
    }

    hasUI(ui) {
        for (let u of this.allUIs) {
            if (u.id == ui.id) {
                return true;
            }
        }
        return false;
    }

    tick() {
        this.tickTimeouts();
        this.tickConditions();
        this.tickLerp();
        this.tickTimedUIs();
        this.checkHighScore();
    }

    tickTimeouts() {
        let removeTimeouts = [];
        for (let timeout of this.timeouts) {
            if (timeout.running) {
                timeout.tick();
            } else {
                removeTimeouts.push(timeout);
            }
        }
        for (let timeout of removeTimeouts) {
            Helper.deleteFromArray(this.timeouts, timeout);
        }
    }

    tickConditions() {
        let removeConditions = [];
        for (let condition of this.conditions) {
            if (condition.running) {
                condition.tick();
            } else {
                removeConditions.push(condition);
            }
        }
        for (let condition of removeConditions) {
            Helper.deleteFromArray(this.conditions, condition);
        }
    }

    tickLerp() {
        if (this.lerp != null) {
            this.lerp.tick();
            if (!this.lerp.running) {
                this.lerp = null;
            }
        }
    }

    tickTimedUIs() {
        let removeTimedUIs = [];
        for (let timedUI of this.timedUIs) {
            if (timedUI.running) {
                timedUI.tick();
            } else {
                removeTimedUIs.push(timedUI);
            }
        }
        for (let timedUI of removeTimedUIs) {
            Helper.deleteFromArray(this.timedUIs, timedUI);
        }
    }

    checkHighScore() {
        if (this.ship && this.ship.score > this.highScore) {
            this.highScore = this.ship.score;
        }
    }

    getLevel() {
        return Math.trunc(this.ship.type / 100);
    }

    getModel() {
        return this.ship.type % 100;
    }

    getShipInfo() {
        return ShipGroup.getShipInfo(this.ship.type);
    }

    getShipName() {
        return ShipGroup.getShipName(this.ship.type);
    }

    getMaxCrystals() {
        switch (this.getLevel()) {
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

    getMaxShield() {
        let shipInfo = this.getShipInfo();
        if (shipInfo && shipInfo.SHIP) {
            let jShip = JSON.parse(shipInfo.SHIP);
            let stats = this.getStats();
            let level = this.getLevel();
            if (stats && jShip.specs && jShip.specs.shield && jShip.specs.shield.capacity) {
                return jShip.specs.shield.capacity[0] + (jShip.specs.shield.capacity[1] - jShip.specs.shield.capacity[0]) * stats[0] / level;
            }
        }
        return 0;
    }

    getMaxSecondaries() {
        let level = this.getLevel();
        return level < 7 ? level : 6;
    }

    setPosition(position) {
        if (game.ships.includes(this.ship)) {
            this.ship.x = position.x;
            this.ship.y = position.y;
            this.ship.set({ x: position.x, y: position.y });
        }
        return this;
    }

    getPosition() {
        if (game.ships.includes(this.ship)) {
            return new Vector2(this.ship.x, this.ship.y);
        }
        return null;
    }

    setVelocity(velocity) {
        if (game.ships.includes(this.ship)) {
            this.ship.vx = velocity.x;
            this.ship.vy = velocity.y;
            this.ship.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
    }

    getVelocity() {
        if (game.ships.includes(this.ship)) {
            return new Vector2(this.ship.vx, this.ship.vy);
        }
        return null;
    }

    setAngle(angle) {
        if (game.ships.includes(this.ship)) {
            this.ship.angle = angle;
            this.ship.set({ angle: Helper.toDegrees(angle) });
        }
        return this;
    }

    getPose() {
        if (game.ships.includes(this.ship)) {
            return new Pose(
                new Vector2(this.ship.x, this.ship.y),
                this.ship.r
            );
        }
        return null;
    }

    setCrystals(crystals) {
        if (game.ships.includes(this.ship)) {
            this.ship.crystals = crystals;
            this.ship.set({ crystals: crystals });
        }
        return this;
    }

    setShield(shield) {
        if (game.ships.includes(this.ship)) {
            this.ship.shield = shield;
            this.ship.set({ shield: shield });
        }
        return this;
    }
    
    takeDamage(damage) {
        if (this.ship.shield <= damage && this.ship.crystals <= damage) {
            this.destroySelf();
        } else if (this.ship.shield <= damage) {
            this.setShield(0);
            this.setCrystals(this.ship.crystals - damage);
        } else {
            this.setShield(this.ship.shield - damage);
        }
    }

    setStats(stats) {
        if (game.ships.includes(this.ship)) {
            this.ship.stats = stats;
            this.ship.set({ stats: stats });
        }
        return this;
    }

    getStats() {
        if (game.ships.includes(this.ship)) {
            return String(this.ship.stats).split('').map(Number);
        }
        return null;
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

    setGenerator(generator) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ generator: generator });
        }
        return this;
    }

    setHealing(healing) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ healing: healing });
        }
        return this;
    }

    setTeam(team) {
        this.team = team;
        this.scoreboardTeam = team;
        this.team.addShip(this);
        if (game.ships.includes(this.ship)) {
            this.ship.team = team.team;
            this.ship.hue = team.hue;
            this.ship.set({ team: team.team, hue: team.hue });
        }
        return this;
    }

    setTeamDefault(t) {
        if (game.ships.includes(this.ship)) {
            this.ship.set({ team: t });
        }
    }

    setHue(hue) {
        if (game.ships.includes(this.ship)) {
            this.ship.hue = hue;
            this.ship.set({ hue: hue });
        }
        return this;
    }

    setScore(score) {
        if (game.ships.includes(this.ship)) {
            this.ship.score = score;
            this.ship.set({ score: score });
        }
        return this;
    }

    setType(type) {
        if (game.ships.includes(this.ship)) {
            this.ship.type = type;
            this.ship.set({ type: type });
        }
        return this;
    }

    fillUp() {
        if (game.ships.includes(this.ship)) {
            this.setMaxShield();
            // this.setMaxStats();
            this.setMaxGenerator();
        }
        return this;
    }

    setMaxShield() {
        this.setShield(999999);
        return this;
    }

    setMaxStats() {
        this.setStats(99999999);
        return this;
    }

    setMaxGenerator() {
        this.setGenerator(999999);
        return this;
    }

    gameOver() {
        if (game.ships.includes(this.ship)) {
            this.ship.gameover({
                "Good game!": "Thanks for playing!",
            });
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


const Alien = class {
    name = '';

    alien = null;

    static C = {
        TYPES: [
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
        ALLOWED: [],
        MAX_AMOUNT: 0,
        SPAWN_RATE: 60
    }

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

    setID(id) {
        if (game.aliens.includes(this.alien)) {
            this.alien.custom.id = id;
        }
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

const Collectible = class {
    static C = {
        TYPES: [
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
            {
                NAME: 'Mining pod',
                CODE: 40
            },
            {
                NAME: 'Attack pod',
                CODE: 41
            },
            {
                NAME: 'Defense pod',
                CODE: 42
            },
            {
                NAME: 'Energy refill',
                CODE: 90
            },
            {
                NAME: 'Shield refill',
                CODE: 91
            }
        ],
        ALLOWED: [10, 11, 90, 91],
        MAX_AMOUNT: 0,
        SPAWN_RATE: 0
    }

    constructor(
        position,
        code
    ) {
        this.name = name;

        game.addCollectible({
            x: position.x, y: position.y,
            code: code
        });
    }
}

const AsteroidPath = class {
    asteroid = null;
    initialPos = null;
    velocity = null;
    size = 1;

    initTime = -1;

    constructor(initialPos, velocity, size) {
        this.initialPos = initialPos;
        this.velocity = velocity;
        this.size = size;
    }

    spawn() {
        this.asteroid = new Asteroid(this.initialPos, this.velocity, this.size);
        this.initTime = game.step;
        return this;
    }

    tick() {
        if (this.initTime != -1) {
            let astPos = this.initialPos.clone().add(this.velocity.clone().multiply(game.step - this.initTime));
            this.asteroid.setPosition(new Vector2(astPos.x % (Game.C.OPTIONS.MAP_SIZE * 10), astPos.y % (Game.C.OPTIONS.MAP_SIZE * 10)));
            this.asteroid.setVelocity(this.velocity);
        }
        return this;
    }

    stop() {
        this.initTime = -1;
        return this;
    }

    destroySelf() {
        this.asteroid.destroySelfNoRemains();
        return this;
    }
}

const Asteroid = class {
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

const TimedAsteroid = class {
    asteroid = null;
    time = 0;

    spawnTime = -1;
    running = false;

    constructor(asteroid, time) {
        this.asteroid = asteroid;
        this.time = time;
        this.spawnTime = game.step;
        this.running = true;
    }

    tick() {
        if (this.running) {
            if (game.step - this.spawnTime >= this.time) {
                this.asteroid.destroySelfNoRemains();
                this.running = false;
            }
        }
        return this;
    }

    destroySelf() {
        this.asteroid.destroySelfNoRemains();
    }
}

const Obj = class {
    originalObj = null;
    prevObj = null;
    obj = null;

    static C = {
        OBJS: {
            PLANE: {
                id: 'plane',
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
                    x: 1,
                    y: 1,
                    z: 0
                },
                type: {
                    id: 'plane',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: '',
                }
            },
            GRID: {
                id: 'grid',
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
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/grid.png'
                }
            },
        }
    }

    constructor(
        id,
        type,
        position, rotation, scale,
        randomizeID = false,
        randomizeTypeID = false,
        color = "#ffffff",
    ) {
        let typeCopy = Helper.deepCopy(type);
        if (typeCopy) {
            if (color) {
                typeCopy.emissiveColor = color;
            }
        }
        this.obj = {
            id: id,
            type: this.convertTypeHexToHsla(typeCopy),
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z
            },
            scale: {
                x: scale.x,
                y: scale.y,
                z: scale.z
            }
        };

        if (randomizeID) {
            this.obj.id += '-' + Helper.getRandomString(10);
        }
        if (randomizeTypeID) {
            this.obj.type.id += '-' + Helper.getRandomString(10);
        }

        this.originalObj = Helper.deepCopy(this.obj);
    }
    
    convertTypeHexToHsla(type) {
        if (type.diffuseColor) {
            type.diffuseColor = Helper.hexToHsla(type.diffuseColor);
        }
        if (type.emissiveColor) {
            type.emissiveColor = Helper.hexToHsla(type.emissiveColor);
        }
        return type;
    }

    update() {
        if (JSON.stringify(this.obj) == JSON.stringify(this.prevObj)) {
            return;
        }
        game.setObject(this.obj);
        this.prevObj = Helper.deepCopy(this.obj);
        return this;
    }

    reset() {
        this.obj = Helper.deepCopy(this.originalObj);
        this.update();
        return this;
    }

    setPose(pose, disregardZScale = false) {
        this.obj.position = {
            x: pose.position.x,
            y: pose.position.y,
            z: this.obj.position.z
        };
        this.obj.rotation = {
            x: this.obj.rotation.x,
            y: this.obj.rotation.y,
            z: pose.rotation
        };
        this.obj.scale = {
            x: pose.scale.x,
            y: pose.scale.y,
            z: disregardZScale ? this.obj.scale.z : pose.scale.z
        };
        return this;
    }

    setPoseTransformed(pose, disregardZScale = false) {
        this.obj = pose.transformObj(Helper.deepCopy(this.originalObj), disregardZScale);
        return this;
    }

    getPose() {
        return new Pose(
            new Vector2(this.obj.position.x, this.obj.position.y),
            this.obj.rotation.z,
            new Vector3(this.obj.scale.x, this.obj.scale.y, this.obj.scale.z)
        );
    }

    setPosition(position) {
        this.obj.position = {
            x: position.x,
            y: position.y,
            z: position.z
        };
        return this;
    }

    setRotation(rotation) {
        this.obj.rotation = {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z
        };
        return this;
    }

    setScale(scale) {
        this.obj.scale = {
            x: scale.x,
            y: scale.y,
            z: scale.z
        };
        return this;
    }

    hide() {
        this.obj.position.z = -1e5;
        this.obj.scale.x *= 1e-5;
        this.obj.scale.y *= 1e-5;
        this.obj.scale.z *= 1e-5;
        this.update();
    }

    show() {
        this.obj.position.z = this.originalObj.position.z;
        this.obj.scale.x = this.originalObj.scale.x;
        this.obj.scale.y = this.originalObj.scale.y;
        this.obj.scale.z = this.originalObj.scale.z;
        this.update();
    }

    destroySelf() {
        this.hide();
        game.removeObject(this.obj.id);
    }
}

const TimedObj = class {
    obj = null;
    time = 0;

    spawnTime = 0;
    running = false;

    constructor(obj, time) {
        this.obj = obj;
        this.time = time;
    }

    spawn() {
        this.spawnTime = game.step;
        this.running = true;
        this.obj.update();
        return this;
    }

    tick() {
        if (this.running) {
            if (game.step - this.spawnTime >= this.time) {
                this.obj.destroySelf();
                this.running = false;
            }
        }
        return this;
    }

    destroySelf() {
        this.obj.destroySelf();
    }
}

const ObjectType = class {
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

const ObjectPhysics = class {
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

const TimedUI = class {
    startTime = 0;
    running = false;

    ship = null;
    ui = null;

    static C = {
        DEFAULT_TIME: 300,
        LOGO_TIME: 480
    }

    constructor(ship, ui, time = TimedUI.C.DEFAULT_TIME) {
        this.ship = ship;
        this.ui = ui;
        this.time = time;
        this.startTime = game.step;

        this.running = true;

        this.ship.sendUI(this.ui);
    }

    tick() {
        if (this.running) {
            if (game.step - this.startTime >= this.time) {
                this.ship.hideUI(this.ui);
                this.running = false;
            }
        }
    }
}

const UIComponent = class {
    uiComponent = null;

    static C = {
        UIS: {
            SCOREBOARD: {
                id: 'scoreboard',
                visible: true,
                components: [
                ],
            },
            SCOREBOARD_SWITCH: {
                id: 'scoreboard_switch',
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(9), // TAB
                position: [0, 0, 0, 0],
            },
            RADAR_BACKGROUND: {
                id: 'radar_background',
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 0, 0]
                    }
                ]
            },
            ONE_TO_TWO: {
                id: 'one_to_two',
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 3.75, 10, 0],
                        stroke: '#ffffff80',
                        width: 1
                    },
                    {
                        type: 'box',
                        position: [10, 0, 0, 7.5],
                        stroke: '#ffffff80',
                        width: 1
                    },
                    {
                        type: 'box',
                        position: [10, 0, 10, 0],
                        stroke: '#ffffff80',
                        width: 1
                    },
                    {
                        type: 'box',
                        position: [10, 7.5, 10, 0],
                        stroke: '#ffffff80',
                        width: 1
                    },
                ]
            },
            TWO_TO_ONE: {
                id: 'two_to_one',
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 10, 0],
                        stroke: '#ffffff80',
                        width: 1
                    },
                    {
                        type: 'box',
                        position: [0, 7.5, 10, 0],
                        stroke: '#ffffff80',
                        width: 1
                    },
                    {
                        type: 'box',
                        position: [10, 0, 0, 7.5],
                        stroke: '#ffffff80',
                        width: 1
                    },
                    {
                        type: 'box',
                        position: [10, 3.75, 10, 0],
                        stroke: '#ffffff80',
                        width: 1
                    },
                ]
            },
            LIVES_BLOCKER: {
                id: "lives_blocker",
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(187),
                position: [65, 0, 10, 10],
                components: []
            },
            LEFT_LEVELUP_BLOCKER: {
                id: "levelup_blocker",
                visible: true,
                clickable: true,
                shortcut: '9',
                position: [20, 0, 25, 15],
            },
            RIGHT_LEVELUP_BLOCKER: {
                id: "right_levelup_blocker",
                visible: true,
                clickable: true,
                shortcut: '0',
                position: [45, 0, 25, 15],
            },
            TOP_MESSAGE: {
                id: "top_message",
                position: [0, 0, 100, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000080',
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        value: '',
                        color: '#ffffff'
                    }
                ]
            },
            BOTTOM_MESSAGE: {
                id: "bottom_message",
                position: [0, 95, 100, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000080',
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        value: '',
                        color: '#ffffff'
                    }
                ]
            },
            NOTIFICATION: {
                id: "notification",
                position: [25, 5, 50, 10],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100]
                    },
                    {
                        type: "text",
                        position: [2.5, 5, 95, 50],
                        align: "center",
                        color: '#ffffff'
                    },
                    {
                        type: "text",
                        position: [2.5, 52.5, 95, 42.5],
                        align: "center",
                        color: '#ffffffaa'
                    }
                ]
            },
        },
        TICKS: {

        }
    }

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

    static convertUIHexToHsla(ui) {
        if (ui.components) {
            for (let c of ui.components) {
                if (c.fill) {
                    c.fill = Helper.hexToHsla(c.fill);
                }
                if (c.stroke) {
                    c.stroke = Helper.hexToHsla(c.stroke);
                }
                if (c.color) {
                    c.color = Helper.hexToHsla(c.color);
                }
            }
        }
        return ui;
    }

    static addTextShadow(ui, shadowColor = '#2C2C2C', offsetX = 1, offsetY = 1, scaling = true) {
        let textShadowComponents = [];
        for (let c of ui.components) {
            if (c.type == 'text') {
                let textShadowComponent = Helper.deepCopy(c);
                textShadowComponent.position[0] += scaling ? offsetX * textShadowComponent.position[2] : offsetX;
                textShadowComponent.position[1] += scaling ? offsetY * textShadowComponent.position[3] : offsetY;
                textShadowComponent.color = shadowColor;
                textShadowComponents.push(textShadowComponent);
            }
        }
        ui.components.unshift(...textShadowComponents);
        return ui;
    }

    static transformUIComponents(uiComponents, translate = new Vector2(0, 0), scale = new Vector2(1, 1)) {
        for (let ui of uiComponents) {
            ui.position[0] *= scale.x;
            ui.position[1] *= scale.y;
            ui.position[0] += translate.x;
            ui.position[1] += translate.y;
            ui.position[2] *= scale.x;
            ui.position[3] *= scale.y;
        }
        return uiComponents;
    }

    destroySelf() {
        this.uiComponent.visible = false;
        this.uiComponent.position = [0, 0, 0, 0];
        game.setUIComponent(this.uiComponent);
    }
}

const UISubComponent = class {
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

const GameMap = class {
    name = '';
    author = '';
    map = '';
    orbitRadius = 0;

    static C = {
        MAP_GENERATOR: {

        }
    }
}

const Rectangle = class {
    center = null;
    size = null;
    angle = 0;

    constructor(center = new Vector2(0, 0), size = new Vector2(1, 1), angle = 0) {
        this.center = center;
        this.size = size;
        this.angle = angle;
    }

    getVertices() {
        const halfWidth = this.size.x / 2;
        const halfHeight = this.size.y / 2;

        const vertices = [
            new Vector2(-halfWidth, -halfHeight),
            new Vector2(halfWidth, -halfHeight),
            new Vector2(halfWidth, halfHeight),
            new Vector2(-halfWidth, halfHeight)
        ];

        return vertices.map(vertex => vertex.rotateBy(this.angle).add(this.center));
    }

    containsPoint(point) {
        const localPoint = point.subtract(this.center).rotateBy(-this.angle);

        const halfWidth = this.size.x / 2;
        const halfHeight = this.size.y / 2;

        return (
            localPoint.x >= -halfWidth && localPoint.x <= halfWidth &&
            localPoint.y >= -halfHeight && localPoint.y <= halfHeight
        );
    }

    mapPointToEdge(point) {
        const localPoint = point.subtract(this.center).rotateBy(-this.angle);

        const halfWidth = this.size.x / 2;
        const halfHeight = this.size.y / 2;

        let mappedX = Math.max(-halfWidth, Math.min(halfWidth, localPoint.x));
        let mappedY = Math.max(-halfHeight, Math.min(halfHeight, localPoint.y));

        return new Vector2(mappedX, mappedY).rotateBy(this.angle).add(this.center);
    }
}

const Pose = class {
    position = null;
    rotation = null;
    scale = null;

    constructor(position = new Vector2(0, 0), rotation = 0, scale = new Vector3(1, 1, 1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    getAbsolutePose(prevPose) {
        const rotatedPosition = this.position.rotateBy(prevPose.rotation);
        const scaledPosition = new Vector2(
            rotatedPosition.x * prevPose.scale.x,
            rotatedPosition.y * prevPose.scale.y
        );
        const absolutePosition = prevPose.position.add(scaledPosition);
        const absoluteRotation = prevPose.rotation + this.rotation;
        const absoluteScale = prevPose.scale.multiplyComponents(this.scale);
        return new Pose(absolutePosition, absoluteRotation, absoluteScale);
    }

    rotateBy(angle) {
        const newPosition = this.position.clone().rotateBy(angle);
        const newRotation = this.rotation + angle;
        return new Pose(newPosition, newRotation, this.scale.clone());
    }

    transformObj(obj, disregardZScale = false) {
        let objPosition = new Vector2(obj.position.x, obj.position.y);
        let transformedPosition = this.position.add(objPosition.rotateBy(this.rotation).multiplyComponents(this.scale));

        obj.position.x = transformedPosition.x;
        obj.position.y = transformedPosition.y;

        obj.rotation.z += this.rotation;
        
        obj.scale.x *= this.scale.x;
        obj.scale.y *= this.scale.y;
        if (!disregardZScale) {
            obj.scale.z *= this.scale.z;
        }
        return obj;
    }

    add(pose) {
        const newPosition = this.position.add(pose.position);
        const newRotation = this.rotation + pose.rotation;
        const newScale = this.scale.multiplyComponents(pose.scale);
        return new Pose(newPosition, newRotation, newScale);
    }

    subtract(pose) {
        const newPosition = this.position.subtract(pose.position);
        const newRotation = this.rotation - pose.rotation;
        const newScale = this.scale.divideComponents(pose.scale);
        return new Pose(newPosition, newRotation, newScale);
    }

    lerpRotation(rotation, t, maxAngVel = Infinity) {
        let a = ((this.rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let b = ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        let delta = b - a;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        let newRotation = a + delta * t;
        newRotation = ((newRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        return new Pose(this.position.clone(), newRotation, this.scale.clone());
    }

    lerp(pose, t, maxScaleVel = Infinity) {
        const newPosition = this.position.lerp(pose.position, t);
        const newRotation = this.lerpRotation(pose.rotation, t).rotation;
        const newScale = this.scale.lerp(pose.scale, t, maxScaleVel);
        return new Pose(newPosition, newRotation, newScale);
    }

    clone() {
        return new Pose(
            this.position.clone(),
            this.rotation,
            this.scale.clone()
        );
    }
}

const Vector2 = class {
    x = 0;
    y = 0;

    constructor(x = 0, y = 0) {
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

    multiplyComponents(vector) {
        return new Vector2(this.x * vector.x, this.y * vector.y);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    divideComponents(vector) {
        return new Vector2(this.x / vector.x, this.y / vector.y);
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

    rotateBy(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    lerp(vector, t) {
        let dx = vector.x - this.x;
        let dy = vector.y - this.y;

        dx *= t;
        dy *= t;

        return new Vector2(
            this.x + dx,
            this.y + dy
        );
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }
}

const Vector3 = class {
    x = 0;
    y = 0;
    z = 0;

    constructor(x = 0, y = 0, z = 0) {
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

    multiplyComponents(vector) {
        return new Vector3(this.x * vector.x, this.y * vector.y, this.z * vector.z);
    }

    divide(scalar) {
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    divideComponents(vector) {
        return new Vector3(this.x / vector.x, this.y / vector.y, this.z / vector.z);
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

    lerp(vector, t) {
        let dx = vector.x - this.x;
        let dy = vector.y - this.y;
        let dz = vector.z - this.z;

        dx *= t;
        dy *= t;
        dz *= t;

        return new Vector3(
            this.x + dx,
            this.y + dy,
            this.z + dz
        );
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }
}

const TimeoutCreator = class {
    startTime = 0;
    duration = 0;
    callback = null;
    running = false;

    constructor(callback, duration) {
        this.callback = callback;
        this.duration = duration;
    }

    start() {
        this.startTime = game.step;
        this.running = true;
        return this;
    }

    tick() {
        if (this.running) {
            if (game.step - this.startTime >= this.duration) {
                this.callback();
                this.running = false;
            }
        }
        return this;
    }
}

const ConditionCreator = class {
    condition = null;
    callback = null;
    running = false;

    constructor(condition, callback) {
        this.condition = condition;
        this.callback = callback;
    }

    start() {
        this.running = true;
        return this;
    }

    tick() {
        if (this.running) {
            if (this.condition()) {
                this.callback();
                this.running = false;
            }
        }
        return this;
    }
}

const StaggeredQueueCreator = class {
    queue = [];
    stagger = 0;
    processingCurrent = false;

    constructor(stagger) {
        this.stagger = stagger;
    }

    add(callback) {
        this.queue.push(callback);
        return this;
    }

    tick() {
        if (this.queue.length > 0 && !this.processingCurrent) {
            const callback = this.queue[0];
            this.processingCurrent = true;
            g.timeouts.push(new TimeoutCreator(() => {
                this.queue.shift();
                this.processingCurrent = false;
                callback();
            }, this.stagger).start());
        }
        return this;
    }
}

const Helper = class {
    static getCounterValue(counter) {
        if (counter < 1000) {
            return Math.round(counter).toString();
        } else if (counter < 1000000) {
            return (counter / 1000).toFixed(1) + 'K';
        } else {
            return (counter / 1000000).toFixed(1) + 'M';
        }
    }

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

    static getRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    static getRandomHue() {
        return this.getRandomInt(0, 360);
    }

    static getRandomHex() {
        return "#" + Math.floor(Math.random()*16777215).toString(16);
    }

    static getRandomVividHSLA(a = 100, returnObject = false) {
        let h = Math.floor(Math.random() * 361);
        let s = 100;
        let l = Math.floor(Math.random() * 21) + 40;

        if (returnObject) {
            return { h, s, l, a };
        }

        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }

    static hexToHsla(hex, returnObject = false) {
        hex = hex.replace(/^#/, '');
    
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
    
        let r = parseInt(hex.substring(0, 2), 16) / 255;
        let g = parseInt(hex.substring(2, 4), 16) / 255;
        let b = parseInt(hex.substring(4, 6), 16) / 255;
        let a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
    
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
    
            h = Math.round(h * 60);
        }
    
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        if (returnObject) {
            return { h, s, l, a };
        }

        return `hsla(${h}, ${s}%, ${l}%, ${parseFloat(a.toFixed(2))})`;
    }

    static hslaToHex(h, s, l, a = 1) {
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        
        let r, g, b;

        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        let hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

        if (a < 1) {
            let alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
            hex += alphaHex;
        }

        return hex;
    }

    static adjustSaturation(hex, percent) {
        let { h, s, l, a } = Helper.hexToHsla(hex, true);
        s = Math.min(100, Math.max(0, s + percent * 100));
        return Helper.hslaToHex(h, s, l, a);
    }


    static adjustBrightness(hex, percent) {
        hex = hex.replace(/^#/, '');

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        if (percent > 0) {
            r += (255 - r) * percent;
            g += (255 - g) * percent;
            b += (255 - b) * percent;
        } else {
            r *= 1 + percent;
            g *= 1 + percent;
            b *= 1 + percent;
        }

        r = Math.round(Math.min(255, Math.max(0, r)));
        g = Math.round(Math.min(255, Math.max(0, g)));
        b = Math.round(Math.min(255, Math.max(0, b)));

        return (
            '#' +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0')
        ).toUpperCase();
    }

    static hexToRgb(hex, returnObject = false) {
        hex = hex.replace(/^#/, '');

        if (hex.length === 3) {
            hex = hex.split('').map(ch => ch + ch).join('');
        }

        if (hex.length === 4) {
            hex = hex.split('').map(ch => ch + ch).join('');
        }

        let r, g, b, a = 1;

        if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else if (hex.length === 8) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            a = parseInt(hex.slice(6, 8), 16) / 255;
            a = parseFloat(a.toFixed(3)); // optional: keep 3 decimal places
        }

        if (returnObject) {
            return { r, g, b, a };
        }

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    static rgbToHex(r, g, b, a = 1) {
        r = Math.max(0, Math.min(255, Math.round(r)));
        g = Math.max(0, Math.min(255, Math.round(g)));
        b = Math.max(0, Math.min(255, Math.round(b)));

        const hex = (
            (1 << 24) + (r << 16) + (g << 8) + b
        ).toString(16).slice(1).toUpperCase();

        a = Math.max(0, Math.min(1, a));
        const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
        return `#${hex}${alphaHex}`;
    }

    static interpolateColor(color1, color2, percent) {
        const c1 = this.hexToRgb(color1, true);
        const c2 = this.hexToRgb(color2, true);

        const r = Math.round(c1.r + (c2.r - c1.r) * percent);
        const g = Math.round(c1.g + (c2.g - c1.g) * percent);
        const b = Math.round(c1.b + (c2.b - c1.b) * percent);
        const a = parseFloat((c1.a + (c2.a - c1.a) * percent).toFixed(2));

        return this.rgbToHex(r, g, b, a);
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
            new Vector2(-Game.C.OPTIONS.MAP_SIZE / 2 * 10, -Game.C.OPTIONS.MAP_SIZE / 2 * 10),
            new Vector2(Game.C.OPTIONS.MAP_SIZE / 2 * 10, Game.C.OPTIONS.MAP_SIZE / 2 * 10)
        );
    }

    static getRandomAngle() {
        return Math.random() * 2 * Math.PI;
    }

    static getRandomArrayElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static getRandomArraySubset(array, size) {
        let subset = [];
        let usedIndices = new Set();
        while (subset.length < size) {
            let element = this.getRandomArrayElement(array);
            if (!usedIndices.has(element)) {
                subset.push(element);
                usedIndices.add(element);
            }
        }
        return subset;
    }

    static getCubicEaseInOut(t) {
        if (t < 0.5) {
            return 4 * t * t * t;
        } else {
            return 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    }

    static angleWithinThreshold(angle, target, threshold) {
        let diff = Math.abs(angle - target) % (2 * Math.PI);
        return diff <= threshold || diff >= 2 * Math.PI - threshold;
    }

    static getNGonCorners(n, angleOffset=0) {
        let corners = [];
        for (let i = 0; i < n; i++) {
            let angle = i * 2 * Math.PI / n + angleOffset;
            corners.push(new Vector2(Math.cos(angle), Math.sin(angle)));
        }
        return corners;
    }
    static toDegrees(radians) {
        let deg = radians * (180 / Math.PI);
        deg = ((deg % 360) + 360) % 360;
        return deg;
    }

    static toRadians(degrees) {
        degrees = ((degrees % 360) + 360) % 360;
        return degrees * (Math.PI / 180);
    }

    static formatTime(time) {
        if (time < 0) {
            time = 0;
        }
        let minutes = 0;
        let seconds = Math.floor(time / 60);
        minutes = Math.floor(seconds / 60);
        seconds %= 60;
        return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
    }

    static deepCopy(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static areObjectsEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    static deleteFromArray(array, element) {
        let index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    static getRadarSpotPosition(xy, wh) {
        let x = xy.x;
        let y = xy.y;
        let w = wh.x;
        let h = wh.y;
        let scalePos = 10 / Game.C.OPTIONS.MAP_SIZE;
        let scaleSize = 10 / Game.C.OPTIONS.MAP_SIZE;
        return [
            50 + x * scalePos - w * scaleSize / 2,
            50 - y * scalePos - h * scaleSize / 2,
            w * scaleSize,
            h * scaleSize
        ];
    }

    static getGridUIPosition(startX, startY, separationX, separationY, indexX, indexY, numX, numY) {
        let totalAvailableWidth = (100 - startX * 2) - (numX - 1) * separationX;
        let totalAvailableHeight = (100 - startY * 2) - (numY - 1) * separationY;

        let width = totalAvailableWidth / numX;
        let height = totalAvailableHeight / numY;

        let x = startX + indexX * (width + separationX);
        let y = startY + indexY * (height + separationY);

        return [x, y, width, height];
    }
}

Game.setShipGroups(ShipGroup.C.SHIPS);
this.options = {
    root_mode: Game.C.OPTIONS.ROOT_MODE,
    
    map_size: Game.C.OPTIONS.MAP_SIZE,
    custom_map: Game.C.OPTIONS.MAP,

    asteroids_strength: Game.C.OPTIONS.ASTEROIDS_STRENGTH,
    release_crystal: Game.C.OPTIONS.RELEASE_CRYSTAL,
    crystal_drop: Game.C.OPTIONS.CRYSTAL_DROP,
    crystal_value: Game.C.OPTIONS.CRYSTAL_VALUE,

    friendly_colors: Game.C.OPTIONS.FRIENDLY_COLORS,

    radar_zoom: Game.C.OPTIONS.RADAR_ZOOM,

    speed_mod: Game.C.OPTIONS.SPEED_MOD,
    friction_ratio: Game.C.OPTIONS.FRICTION_RATIO,

    weapons_store: Game.C.OPTIONS.WEAPONS_STORE,
    projectile_speed: Game.C.OPTIONS.PROJECTILE_SPEED,

    starting_ship: Game.C.OPTIONS.STARTING_SHIP,
    reset_tree: Game.C.OPTIONS.RESET_TREE,
    choose_ship: Game.C.OPTIONS.CHOOSE_SHIP,
    ships: Game.C.OPTIONS.SHIPS,

    lives: Game.C.OPTIONS.LIVES,
    maxtierlives: Game.C.OPTIONS.MAX_TIER_LIVES,
    max_level: Game.C.OPTIONS.MAX_LEVEL,

    max_players: Game.C.OPTIONS.MAX_PLAYERS,

    vocabulary: Game.C.OPTIONS.VOCABULARY
}

let g = null;

this.tick = function () {
    if (g == null) {
        g = new Game();
    }
    if (g != null) {
        // This overwrites the `this.tick` function with just `g.tick();`
        (this.tick = function () {
            g.tick();
        })();

        game.custom.kick = function (shipID) {
            game.findShip(shipID).gameover ({ "": "" });
        };

        game.custom.showIDs = function () {
            let list = `Player List ${game.ships.length}:\n`
            for (let ship of game.ships) {
                list += `${ship.id}: ${ship.name}\n`;
            }
            return list;
        }
    }
};

this.event = function (event) {
    let gameShip = event.ship;
    if (gameShip != null && g != null) {
        switch (event.name) {
            case 'ship_spawned':
                g.onShipSpawned(gameShip);
                echo(game.custom.showIDs());
                break;
            case 'ship_destroyed':
                g.onShipDestroyed(gameShip, event.killer);
                echo(game.custom.showIDs());
                break;
            case 'ui_component_clicked':
                g.onUIComponentClicked(gameShip, event.id);
                break;
        }
    }

    let gameAlien = event.alien;
    if (gameAlien != null && g != null) {
        switch (event.name) {
            case 'alien_destroyed':
                g.onAlienDestroyed(gameAlien, event.killer);
                break;
        }
    }
}
