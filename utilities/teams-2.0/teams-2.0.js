class Game {
    timeouts = [];
    conditions = [];

    ships = [];
    leftShips = [];
    teams = [];

    aliens = [];

    asteroids = [];
    timedAsteroids = [];
    
    isGameOver = false;

    static C = {
        OPTIONS: {
            ROOT_MODE: '',
            MAP_SIZE: 100,
            MAP: null,
            ASTEROIDS_STRENGTH: 1,
            RELEASE_CRYSTAL: true,
            CRYSTAL_DROP: 1,
            CRYSTAL_VALUE: 2,

            FRIENDLY_COLORS: 2,

            RADAR_ZOOM: 3,

            SPEED_MOD: 1.5,
            FRICTION_RATIO: 1,

            WEAPONS_STORE: false,
            PROJECTILE_SPEED: 1,

            STARTING_SHIP: 800,
            RESET_TREE: false,
            CHOOSE_SHIP: null,
            SHIPS: [],
            MAX_PLAYERS: 20,

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
                { text: "Follow", icon: "\u0050", key: "F" },
                { text: "Love", icon: "\u0024", key: "L" },
                { text: "Base", icon: "\u0034", key: "B" },
                { text: "Bruh", icon: "˙ ͜ʟ˙", key: "M" },
                { text: "WTF", icon: "ಠ_ಠ", key: "W" }
            ],
        },
        TICKS: {
            TICKS_PER_SECOND: 60,
            MILLISECONDS_PER_TICK: 1000 / 60,

            ENTITY_MANAGER: 60,
            SHIP_MANAGER: 20,
            SHIP_MANAGER_FAST: 5,
            TEAM_MANAGER: 20,
            
            RESET_STAGGER: 5,

            GAME_MANAGER: 30
        },
        IS_DEBUGGING: false,
    }

    constructor() {
        this.reset();
    }

    tick() {
        this.manageTimeouts();
        this.manageConditions();

        this.manageGameState();

        this.manageShips();

        this.manageTeams();

        this.tickTimedEntities();
        
        this.manageEntities();
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

    reset() {
        this.deleteEverything();
        this.resetShips();
        this.resetContainers();
        this.timeouts.push(new TimeoutCreator(() => {
            this.selectRandomTeams();
            this.spawnBases();
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
                    teamOption.HUE,
                    teamOption.FLAGGED
                )
                );
            }
            }
        }
    }

    spawnBases() {
        for (let team of this.teams) {
            team.spawnBase();
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            ship.timeouts.push(new TimeoutCreator(() => {
                this.resetShip(ship);                
            }, Game.C.TICKS.RESET_STAGGER * i).start())
        }
        this.timeouts.push(new TimeoutCreator(() => {
            this.isResetting = false;
        }, Game.C.TICKS.RESET_STAGGER * (this.ships.length + 1)).start());
    }

    resetShip(ship) {
        ship.isResetting = true;

        ship.reset();
        
        ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);

        this.resetShipNext(ship);
    }

    resetShipNext(ship) {
        if (this.teams.length == 2) {
            if (this.teams[0].ships.length < this.teams[1].ships.length) {
                this.teams[1].removeShip(ship);
                ship.setTeam(this.teams[0]);
            }
            else if (this.teams[1].ships.length < this.teams[0].ships.length) {
                this.teams[0].removeShip(ship);
                ship.setTeam(this.teams[1]);
            } else {
                if (this.teams[0].score < this.teams[1].score) {
                    this.teams[1].removeShip(ship);
                    ship.setTeam(this.teams[0]);
                } else if (this.teams[1].score < this.teams[0].score) {
                    this.teams[0].removeShip(ship);
                    ship.setTeam(this.teams[1]);
                } else {
                    let randTeam = this.teams[Helper.getRandomInt(0, 1)];
                    this.teams[(randTeam.team + 1) % 2].removeShip(ship);
                    ship.setTeam(randTeam);
                }
            }
        }
        ship.hideAllUIs();
        ship.isResetting = false;
    }

    gameOver() {
        this.isGameOver = true;
        for (let ship of this.ships) {
            ship.gameOver();
        }
    }

    getMinScore(team) {
        let minScore = Infinity;
        for (let ship of team.ships) {
            if (ship.score < minScore) {
                minScore = ship.score;
            }
        }
        return minScore;
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
                    if (asteroid.asteroid == gameAsteroid) {
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
                    if (alien.alien == gameAlien) {
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

            let notFoundShips = [];
            for (let ship of this.ships) {
                let found = false;
                for (let gameShip of game.ships) {
                    if (ship.ship.id == gameShip.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    notFoundShips.push(ship);
                }
            }
            for (let ship of notFoundShips) {
                if (ship.team) {
                    Helper.deleteFromArray(ship.team.ships, ship);
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
                if (!ship.done) {
                    this.resetShip(ship);
                    ship.done = true;

                    this.handleShipSpawnLerp(ship);
                }

                if (!ship.isResetting) {

                }
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                ship.tick();
            }
        }
    }

    manageTeams() {
        if (game.step % Game.C.TICKS.TEAM_MANAGER === 0) {
            for (let team of this.teams) {
                team.tick();
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

    sendNotifications(title, message, supportingTeam) {
        for (let ship of this.ships) {
            let notification = Helper.deepCopy(UIComponent.C.UIS.NOTIFICATION);
            if (supportingTeam.team == ship.team.team) {
                notification.components[0].stroke = '#00ff00';
            }
            else {
                notification.components[0].stroke = '#ff0000';
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

    findSafeAlien(gameAlien) {
        for (let team of this.teams) {
            if (team.base) {
                for (let safeAlien of team.base.safeAliens) {
                    if (safeAlien.alien.alien == gameAlien || safeAlien.alien.alien.custom.id == gameAlien.custom.id) {
                        return safeAlien;
                    }
                }
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

    handleShipSpawnLerp(ship) {
        if (ship.team) {
            let spawnModule = Helper.getRandomArrayElement(ship.team.base.getModulesByType(BaseModule.C.TYPES.SPAWN));
            if (spawnModule) {
                ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.EXIT_SPAWN.NAME, new Pose(spawnModule.pose.position.clone(), spawnModule.pose.rotation + Math.PI, spawnModule.pose.scale.clone()), ShipLerp.C.TYPES.EXIT_SPAWN.BLEND_FACTOR, spawnModule);
            }
        }
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

            this.handleShipSpawnLerp(ship);
        }
    }

    onShipDestroyed(gameShip) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            ship.ship.alive = false;
        }
    }

    onUIComponentClicked(gameShip, id) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {
        let safeAlien = this.findSafeAlien(gameAlien);
        if (safeAlien != null) {
            safeAlien.handleAlienDestroyed(gameAlien, gameShip);
        }
    }
}

class Team {
    team = 0;
    color = '';
    hex = 0;
    hue = 0;

    score = 0;

    ships = [];

    base = null;

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

    constructor(team, color, hex, hue) {
        this.team = team;
        this.color = color;
        this.hex = hex;
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

    setScore(score) {
        this.score = score;
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
}

class ShipLerp {
    ship = null;
    
    name = '';

    targetPose = null;

    t = 0;
    
    baseModule = null;
    targetDifference = null;

    running = true;

    prevTime = 0;

    static C = {
        TYPES: {
            EXIT_SPAWN: {
                NAME: 'exit-spawn',
                BLEND_FACTOR: 0.2
            },
            ENTER_DEPOT: {
                NAME: 'enter-depot',
                BLEND_FACTOR: 0.1
            },
            EXIT_DEPOT: {
                NAME: 'exit-depot',
                BLEND_FACTOR: 0.2
            }
        }
    }

    constructor(ship, name, targetPose, t = 0.1, baseModule = null) {
        this.ship = ship;
        this.name = name;
        this.targetPose = targetPose;
        this.t = t;
        this.baseModule = baseModule;

        if (this.baseModule) {
            this.targetDifference = this.targetPose.subtract(this.baseModule.pose);
        }

        this.running = true;
        this.prevTime = game.step;
    }

    tick() {
        if (this.running) {
            this.ship.setIdle(true);
            this.ship.setGenerator(0);
            this.ship.setInvulnerable(Ship.C.LERP_INVULNERABLE_TIME);
            this.ship.setCollider(false);

            if (this.baseModule) {
                this.targetPose = this.baseModule.pose.add(this.targetDifference);
            }
            
            let lerpPose = this.ship.getPose().lerp(this.targetPose, this.t);
            // let velocity = lerpPose.position.subtract(this.ship.getPosition()).divide(game.step - this.prevTime);
            this.ship.setPosition(lerpPose.position);
            // this.ship.setVelocity(velocity);
            this.ship.setAngle(lerpPose.rotation);
            this.prevTime = game.step;
        } else {
            this.ship.setIdle(false);
            this.ship.setCollider(true);
        }
    }

    stop() {
        this.running = false;
        this.ship.setIdle(false);
        this.ship.setCollider(true);
    }
}

class Ship {    
    team = null;
    ship = null;

    timeouts = [];
    conditions = [];
    lerp = null;

    allUIs = [];
    timedUIs = [];

    left = false;
    done = false;

    score = 0;

    isResetting = false;

    static C = {
        INVULNERABLE_TIME: 360,
        LERP_INVULNERABLE_TIME: 240
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

        this.score = 0;

        this.ship.emptyWeapons();
    }

    convertUIHexToHsla(ui) {
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
        return ui;
    }

    sendUI(ui, hideMode = false) {
        if (this.ship != null) {
            let cUI = this.convertUIHexToHsla(Helper.deepCopy(ui));
            let removedUIs = [];
            for (let u of this.allUIs) {
                if (u.id == cUI.id) {
                    removedUIs.push(u);
                }
            }
            if (!(removedUIs.length == 1 && Helper.areObjectsEqual(removedUIs[0], cUI))) {
                this.ship.setUIComponent(cUI);
            }

            if (!hideMode) {
                for (let u of removedUIs) {
                    Helper.deleteFromArray(this.allUIs, u);
                }
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

        let removedUIs = [];
        for (let u of this.allUIs) {
            if (u.id == cUI.id) {
                removedUIs.push(u);
            }
        }
        for (let u of removedUIs) {
            Helper.deleteFromArray(this.allUIs, u);
        }

        if (!(removedUIs.length == 1 && Helper.areObjectsEqual(removedUIs[0], cUI))) {
            this.sendUI(cUI, true);
        }
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

    getLevel() {
        return Math.trunc(this.ship.type / 100);
    }

    getModel() {
        return this.ship.type % 100;
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

    setTeam(team) {
        this.team = team;
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
        this.score = score;
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
            this.setMaxStats();
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

class Base {
    team = null;
    pose = null;
    baseModules = [];
    safeAliens = [];
    baseLevel = 4;
    dead = false;

    static C = {
        SCALES: [
            1,
            1.2,
            1.5,
            2
        ],
        NUM_SIDES: [
            2,
            3,
            3,
            4
        ],
        RADIUS: 80,
        ROTATION_RATE: -Math.PI / (60 * 60 * 8),
        ORBIT_RADIUS: 200,
        ORBIT_RATE: Math.PI / (60 * 60 * 8),
    };

    constructor(team) {
        this.team = team;
        let angle = (this.team.team * 2 * Math.PI) / Game.C.OPTIONS.FRIENDLY_COLORS;
        this.pose = new Pose(
            new Vector2(
                Math.cos(angle) * Base.C.ORBIT_RADIUS,
                Math.sin(angle) * Base.C.ORBIT_RADIUS
            ),
            Math.PI * this.team.team
        );
    }

    spawnBase() {
        this.baseModules = [];
        this.safeAliens = [];

        for (let i = 0; i < Base.C.NUM_SIDES[this.baseLevel - 1]; i++) {
            let angle = (i * 2 * Math.PI) / Base.C.NUM_SIDES[this.baseLevel - 1];
            let container = new ContainerBaseModule(
                this,
                new Pose(
                    new Vector2(
                        Math.cos(angle),
                        Math.sin(angle)
                    ).multiply(Base.C.RADIUS),
                    angle,
                    new Vector3(1, 1, 1).multiply(Base.C.SCALES[this.baseLevel - 1])
                ),
                [
                    new StaticBaseModule(this, new Pose(new Vector2(), Math.PI * 9/8, new Vector3(1, 1, 1).multiply(BaseModule.C.TYPES.STATIC.SCALE))),
                    new AlienBaseModule(this, new Pose(new Vector2(9, -2.5), Math.PI, new Vector3(1, 1, 1).multiply(BaseModule.C.TYPES.ALIEN.SCALE))),
                    new SpawnBaseModule(this, new Pose(new Vector2(0, 9.5), Math.PI * -1.9 / 3, new Vector3(1, 1, 1).multiply(BaseModule.C.TYPES.SPAWN.SCALE))),
                    // new TurretBaseModule(this, new Pose()),
                ]
            );
            for (let j = 0; j < 2; j++) {
                let angle = Math.PI * 1 / 8;
                let depotPose = new Pose(
                    new Vector2(
                        -5 + Math.cos(angle + Math.PI / 2) * j * BaseModule.C.TYPES.DEPOT.STEP,
                        -6.5 + Math.sin(angle + Math.PI / 2) * j * BaseModule.C.TYPES.DEPOT.STEP
                    ),
                    angle,
                    new Vector3(1, 1, 1).multiply(BaseModule.C.TYPES.DEPOT.SCALE)
                );
                let depotModule = new DepotBaseModule(this, depotPose);
                container.baseModules.push(depotModule);
            }
            this.baseModules.push(container);
            for (let baseModule of container.baseModules) {
                baseModule.container = container;
            }
        }

        for (let baseModule of this.baseModules) {
            baseModule.spawnBaseModule();
        }
        return this;
    }

    tick() {
        this.pose.rotation += Base.C.ROTATION_RATE;
        this.pose.position = this.pose.position.rotateBy(Base.C.ORBIT_RATE);
        for (let baseModule of this.baseModules) {
            baseModule.tick();
        }
        return this;
    }

    getModulesByType(type) {
        let baseModules = [];
        for (let baseModule of this.baseModules) {
            if (baseModule.type == type) {
                baseModules.push(baseModule);
            } else if (baseModule.type == BaseModule.C.TYPES.CONTAINER) {
                let containerModules = baseModule.getModulesByType(type);
                for (let containerModule of containerModules) {
                    baseModules.push(containerModule);
                }
            }
        }
        return baseModules;
    }

    destroySelf() {
        for (let baseModule of this.baseModules) {
            baseModule.destroySelf();
        }
        for (let safeAlien of this.safeAliens) {
            safeAlien.destroySelf();
        }
        this.baseModules = [];
        this.dead = true;
        return this;
    }
}

class BaseModule {
    base = null;
    container = null;
    type = '';
    relativePose = null;
    pose = null;
    objs = [];
    dead = false;

    static C = {
        TYPES: {
            ALIEN: {
                NAME: 'alien',
                SCALE: 10
            },
            SPAWN: {
                NAME: 'spawn',
                SCALE: 5
            },
            DEPOT: {
                NAME: 'depot',
                SCALE: 5,
                STEP: 8
            },
            TURRET: {
                NAME: 'turret',
                SCALE: 5
            },
            STATIC: {
                NAME: 'static',
                SCALE: 5
            },
            CONTAINER: {
                NAME: 'container',
                SCALE: 5
            }
        },
        RESET_MULTIPLIER: 200
    };

    constructor(base, type, relativePose) {
        this.base = base;
        this.container = base;
        this.type = type;
        this.relativePose = relativePose;
    }

    tick() {
        this.setAbsolutePose();
        this.updateObjs();
        return this;
    }
    
    spawnBaseModule() {
        this.setAbsolutePose();
        this.createObjs();
        return this;
    }

    createObjs() {
        for (let obj of this.objs) {
            obj.destroySelf();
        }
        this.objs = [];
        return this;
    }

    updateObjs() {
        let gamestep = (game.step % (Game.C.TICKS.TEAM_MANAGER * BaseModule.C.RESET_MULTIPLIER)) / Game.C.TICKS.TEAM_MANAGER;
        if (gamestep == 0) {
            for (let obj of this.objs) {
                obj.destroySelf();
            }
        } else if (gamestep == 1) {
            game.removeObject();
        } else {
            for (let obj of this.objs) {
                obj.show();
                obj.setPosition(new Vector3(this.pose.position.x, this.pose.position.y, obj.obj.position.z));
                obj.setRotation(new Vector3(obj.obj.rotation.x, obj.obj.rotation.y, this.pose.rotation));
                obj.setScale(this.pose.scale);
                obj.update();
            }
        }
    }

    createUShape() {
        let uShape = Helper.deepCopy(Obj.C.OBJS.U_SHAPE);
        uShape = this.pose.transformObj(uShape);
        let uShapeObj = new Obj(uShape.id, uShape.type, uShape.position, uShape.rotation, uShape.scale, true, true, this.base.team.hex).update();
        this.objs.push(uShapeObj);
        return this;
    }

    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.container.pose);
    }

    destroySelf() {
        this.dead = true;
        return this;
    }
}

class ContainerBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.CONTAINER;
    baseModules = [];

    constructor(base, relativePose, baseModules = []) {
        super(base, BaseModule.C.TYPES.CONTAINER, relativePose);
        this.baseModules = baseModules;
        for (let baseModule of this.baseModules) {
            baseModule.container = this;
        }
    }

    tick() {
        super.tick();
        for (let baseModule of this.baseModules) {
            baseModule.tick();
        }
        return this;
    }

    getModulesByType(type) {
        let baseModules = [];
        for (let baseModule of this.baseModules) {
            if (baseModule.type == type) {
                baseModules.push(baseModule);
            } else if (baseModule.type == BaseModule.C.TYPES.CONTAINER) {
                let containerModules = baseModule.getModulesByType(type);
                for (let containerModule of containerModules) {
                    baseModules.push(containerModule);
                }
            }
        }
        return baseModules;
    }

    spawnBaseModule() {
        super.spawnBaseModule();
        for (let baseModule of this.baseModules) {
            baseModule.spawnBaseModule();
        }
        return this;
    }
    
    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.container.pose);
        for (let baseModule of this.baseModules) {
            baseModule.setAbsolutePose();
        }
    }

    createObjs() {
        super.createObjs();
        for (let baseModule of this.baseModules) {
            baseModule.createObjs();
        }
        return this;
    }
}

class AlienBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.ALIEN;
    safeAlien = null;

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.ALIEN, pose);
        this.createSafeAlien();
    }

    createSafeAlien() {
        this.safeAlien = new SafeAlien(new Pose(new Vector2(-0.5, 0)), this);
        if (this.base) {
            this.base.safeAliens.push(this.safeAlien);
        }
    }
    
    spawnBaseModule() {
        super.spawnBaseModule();
        if (this.safeAlien) {
            this.safeAlien.spawnAlien();
        }
        return this;
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }

    tick() {
        super.tick();
        if (this.safeAlien) {
            this.safeAlien.tick();
        }
        return this;
    }

    destroySelf() {
        super.destroySelf();
        if (this.safeAlien) {
            this.safeAlien.destroySelf();
        }
        return this;
    }
}

class SpawnBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.SPAWN;

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.SPAWN, pose);
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }
}

class DepotBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.DEPOT;

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.DEPOT, pose);
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }
}

class TurretBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.TURRET;
}

class StaticBaseModule extends BaseModule {
    type = BaseModule.C.TYPES.STATIC; // Essentially will house all the other objects that do nothing but look pretty

    constructor(base, pose) {
        super(base, BaseModule.C.TYPES.STATIC, pose);
    }

    createObjs() {
        super.createObjs();
        this.createTriangle();
    }

    createTriangle() {
        let triangle = Helper.deepCopy(Obj.C.OBJS.TRIANGLE);
        triangle = this.pose.transformObj(triangle);
        let triangleObj = new Obj(triangle.id, triangle.type, triangle.position, triangle.rotation, triangle.scale, true, true, this.base.team.hex).update();
        this.objs.push(triangleObj);
        return this;
    }
}

class SafeAlien {
    alien = null;
    relativePose = null;
    pose = null;
    baseModule = null;
    baseLevelFields = SafeAlien.C.BASE_LEVELS[0];
    setOneTimers = false;

    timeouts = [];

    static C = {
        TICKS: {
            SPAWN_DELAY: 10,
        },
        ALL: {
            VELOCITY: {
                x: 0,
                y: 0
            },
            REGEN: 0,
            DAMAGE: 1,
            LASER_SPEED: 1,
            RATE: 0.1
        },
        BASE_LEVELS: [
            {
                BASE_LEVEL: 1,
                NAME: 'Saucer',
                SHIELD: 25,
                POINTS: 10,
                CRYSTAL_DROP: 5,
                CODE: 19,
                LEVEL: 0
            },
            {
                BASE_LEVEL: 2,
                NAME: 'Saucer',
                SHIELD: 50,
                POINTS: 20,
                CRYSTAL_DROP: 10,
                CODE: 19,
                LEVEL: 1
            },
            {
                BASE_LEVEL: 3,
                NAME: 'Saucer',
                SHIELD: 100,
                POINTS: 50,
                CRYSTAL_DROP: 20,
                CODE: 19,
                LEVEL: 2
            },
            {
                BASE_LEVEL: 4,
                NAME: 'Boss',
                SHIELD: 200,
                POINTS: 100,
                CRYSTAL_DROP: 40,
                CODE: 12,
                LEVEL: 1
            }
            
        ]
    }

    constructor(relativePose, baseModule = null) {
        this.relativePose = relativePose;
        this.baseModule = baseModule;
    }

    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.baseModule.pose);
    }

    spawnAlien() {
        this.setAbsolutePose();
        if (this.pose) {
            this.baseLevelFields = this.baseModule && this.baseModule.base ? SafeAlien.C.BASE_LEVELS.find(level => level.BASE_LEVEL === this.baseModule.base.baseLevel) : SafeAlien.C.BASE_LEVELS[0];
            this.alien = new Alien(this.pose.position, new Vector2(SafeAlien.C.ALL.VELOCITY.x, SafeAlien.C.ALL.VELOCITY.y), this.baseLevelFields.NAME, this.baseLevelFields.CODE, this.baseLevelFields.LEVEL, this.baseLevelFields.POINTS, this.baseLevelFields.CRYSTAL_DROP, this.baseLevelFields.WEAPON_DROP);
            this.alien.setID(`${this.baseModule.base.team.team}-${Helper.getRandomString(10)}`);
            this.alien.setPosition(this.pose.position);
            this.setOneTimers = false;
        }
        return this;
    }

    tick() {
        this.setAbsolutePose();
        this.tickTimeouts();
        if (this.alien && game.aliens.includes(this.alien.alien)) {
            if (!this.setOneTimers) {
                this.setOneTimers = true;
                this.timeouts.push(new TimeoutCreator(() => {
                    this.alien.setShield(this.baseLevelFields.SHIELD);
                }, SafeAlien.C.TICKS.SPAWN_DELAY).start());
            }
            this.alien.setPosition(this.pose.position);
            this.alien.setVelocity(new Vector2(SafeAlien.C.ALL.VELOCITY.x, SafeAlien.C.ALL.VELOCITY.y));
            this.alien.setRegen(SafeAlien.C.ALL.REGEN);
            this.alien.setDamage(SafeAlien.C.ALL.DAMAGE);
            this.alien.setLaserSpeed(SafeAlien.C.ALL.LASER_SPEED);
            this.alien.setRate(SafeAlien.C.ALL.RATE);
        }
        return this;
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
        return this;
    }

    handleAlienDestroyed(gameAlien, gameShip) {
        if (this.alien.alien == gameAlien && this.alien.alien.custom.id === gameAlien.custom.id) {
            this.alien.destroySelf();
            if (this.baseModule && !this.baseModule.dead) {
                this.spawnAlien();
            }
        }
        return this;
    }

    destroySelf() {
        if (this.alien) {
            this.alien.destroySelf();
        }
        return this;
    }
}

class Alien {
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

class Collectible {
    name = '';

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
                NAME: 'Defence pod',
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
        MAX_AMOUNT: 10,
        SPAWN_RATE: 1800
    }

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

class AsteroidPath {
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

class TimedAsteroid {
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

class Obj {
    originalObj = null;
    obj = null;

    static C = {
        GHOST_SUFFIX: '-ghost',
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
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
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
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/grid.png'
                }
            },
            U_SHAPE: {
                id: 'u_shape',
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
                    z: 1
                },
                type: {
                    id: 'u_shape',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/u_shape.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    physics: {
                        mass: 500,
                        shape: [0,0,0,1.412,1.329,1.13,1.003,0.918,0.855,0.812,0.783,0.771,0.78,0.806,0.813,0.832,0.867,0.901,0.881,0.909,1.008,0,0,0,0,0,0,0,0,0,1.008,0.909,0.881,0.901,0.867,0.832,0.813,0.806,0.78,0.771,0.783,0.812,0.855,0.918,1.003,1.13,1.329,1.412,0,0]
                    } // WHEN CREATING A NEW OBJECT, PUT PHYSICS AS {}, THEN THE SHAPE WILL BE PRINTED IN CONSOLE
                },
            },
            TRIANGLE: {
                id: 'triangle',
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
                    z: 1
                },
                type: {
                    id: 'triangle',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/triangle.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    physics: {
                        mass: 500,
                        shape: [0.921,0.873,0.843,0.828,0.834,0.859,0.9,0.957,1.048,1.171,1.354,1.633,1.963,1.935,1.767,1.853,1.911,1.711,1.398,1.197,1.069,0.976,0.908,0.865,0.839,0.827,0.839,0.865,0.908,0.976,1.069,1.197,1.398,1.711,1.911,1.853,1.767,2.08,2.026,1.812,1.664,1.561,1.492,1.45,1.434,1.185,1.278,1.236,1.091,0.99]
                    }
                }
            }
        }
    }

    constructor(
        id,
        type,
        position, rotation, scale,
        randomizeID = false,
        randomizeTypeID = false,
        color = "#ffffff"
    ) {
        this.obj = {
            id: id,
            type: this.convertTypeHexToHsla(Helper.deepCopy(type)),
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

        if (color) {
            this.obj.type.emissiveColor = color;
        }
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

    update(createGhost = false) {
        game.setObject(this.obj);
        if (createGhost) {
            let ghostObj = Helper.deepCopy(this.obj);
            ghostObj.id += Obj.C.GHOST_SUFFIX;
            ghostObj.type.id += Obj.C.GHOST_SUFFIX;
            ghostObj.physics = null;
            game.setObject(ghostObj);
        }
        return this;
    }

    reset() {
        this.obj = Helper.deepCopy(this.originalObj);
        this.update();
        return this;
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

    hide(hideGhost = true) {
        this.obj.position.z = -1e5;
        this.obj.scale.x *= 1e-5;
        this.obj.scale.y *= 1e-5;
        this.obj.scale.z *= 1e-5;
        this.update(hideGhost);
    }

    show(showGhost = true) {
        this.obj.position.z = this.originalObj.position.z;
        this.obj.scale.x = this.originalObj.scale.x;
        this.obj.scale.y = this.originalObj.scale.y;
        this.obj.scale.z = this.originalObj.scale.z;
        this.update(showGhost);
    }

    destroySelf(deleteGhost = true) {
        this.hide(deleteGhost);
        game.removeObject(this.obj.id);
        if (deleteGhost) {
            game.removeObject(this.obj.id + Obj.C.GHOST_SUFFIX);
        }
    }
}

class TimedObj {
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

class TimedUI {
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

class UIComponent {
    uiComponent = null;

    static C = {
        UIS: {
            SCOREBOARD: {
                id: 'scoreboard',
                visible: true,
                components: [

                ],
                START: 8,
                HEIGHT: 6.5
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
            LIVES_BLOCKER: {
                id: "lives_blocker",
                visible: true,
                clickable: true,
                shortcut: String.fromCharCode(187),
                position: [65, 0, 10, 10],
                components: []
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
                position: [5, 75, 60, 10],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 0, 100],
                        width: 10
                    },
                    {
                        type: "text",
                        position: [2.5, 5, 90, 50],
                        align: "left",
                        color: '#ffffff'
                    },
                    {
                        type: "text",
                        position: [2.5, 52.5, 60, 42.5],
                        align: "left",
                        color: '#ffffffaa'
                    }
                ]
            },
            MIDDLE_MESSAGE: {
                id: "middle_message",
                position: [20, 47.5, 40, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 0],
                        stroke: '#ffffff',
                        width: 4
                    },
                    {
                        type: 'box',
                        position: [0, 100, 100, 0],
                        stroke: '#ffffff',
                        width: 4
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        color: '#ffffff'
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

class Pose {
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
        const newRotation = this.rotation.clone().addScalar(angle);
        return new Pose(newPosition, newRotation, this.scale.clone());
    }

    transformObj(obj) {
        let objPosition = new Vector2(obj.position.x, obj.position.y);
        let transformedPosition = this.position.add(objPosition.rotateBy(this.rotation));
        
        obj.position.x = transformedPosition.x;
        obj.position.y = transformedPosition.y;

        obj.rotation.z = this.rotation + obj.rotation.z;
        
        obj.scale.x *= this.scale.x;
        obj.scale.y *= this.scale.y;
        obj.scale.z *= this.scale.z;
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

    lerpRotation(rotation, t) {
        const newRotation = this.rotation + (rotation - this.rotation) * t;
        return new Pose(this.position.clone(), newRotation, this.scale.clone());
    }

    lerp(pose, t) {
        const newPosition = this.position.lerp(pose.position, t);
        const newRotation = this.lerpRotation(pose.rotation, t).rotation;
        const newScale = this.scale.lerp(pose.scale, t);
        return new Pose(newPosition, newRotation, newScale);
    }

    clone() {
        return new Pose(
            this.position.clone(),
            this.rotation.clone(),
            this.scale.clone()
        );
    }
}

class Vector2 {
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
        return new Vector2(
            this.x + (vector.x - this.x) * t,
            this.y + (vector.y - this.y) * t
        );
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }
}

class Vector3 {
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
        return new Vector3(
            this.x + (vector.x - this.x) * t,
            this.y + (vector.y - this.y) * t,
            this.z + (vector.z - this.z) * t
        );
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    equals(vector) {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }
}

class TimeoutCreator {
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

class ConditionCreator {
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

    static getRandomVividHSL(alpha = 100) {
        let hue = Math.floor(Math.random() * 361);
        let saturation = 100;
        let lightness = Math.floor(Math.random() * 21) + 40;
        
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    static hexToHsla(hex) {
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

    static getNGonCorners(n, angleOffset=0) {
        let corners = [];
        for (let i = 0; i < n; i++) {
            let angle = i * 2 * Math.PI / n + angleOffset;
            corners.push(new Vector2(Math.cos(angle), Math.sin(angle)));
        }
        return corners;
    }

    static toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static toRadians(degrees) {
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
}

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
            let list = "PLAYER LIST:\n";
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
                g.onShipDestroyed(gameShip);
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
