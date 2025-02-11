/*
    CAPTURE THE FLAG (CTF)
    @author JavRedstone
    @version 3.0.0
*/

class Game {
    static shipGroups = [];
    shipGroup = null;

    timeouts = [];

    ships = [];
    leftShips = [];
    teams = [];

    aliens = [];
    asteroids = [];
    timedAsteroids = [];

    logoWaiting = null;

    spawns = [];
    shipBeacons = [];
    beacons = [];
    portals = [];
    gravityWells = [];
    lasers = [];

    waiting = true;
    waitTimer = -2;

    roundTime = -1;
    timesUp = false;
    betweenTime = -1;
    totalScores = [0, 0];
    numRounds = 0;

    static C = {
        OPTIONS: {
            ROOT_MODE: '',
            MAP_SIZE: 60,
            MAP: null,
            ASTEROIDS_STRENGTH: 1e6,
            RELEASE_CRYSTAL: false,
            CRYSTAL_DROP: 0,
            CRYSTAL_VALUE: 0,

            FRIENDLY_COLORS: 2,

            RADAR_ZOOM: 1,

            SPEED_MOD: 1.5,
            FRICTION_RATIO: 1,

            WEAPONS_STORE: false,
            PROJECTILE_SPEED: 1,

            STARTING_SHIP: 800,
            RESET_TREE: true,
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
                { text: "Flag", icon: "🏳️", key: "I" },
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

            RESET_STAGGER: 15,

            GAME_MANAGER: 30,

            FLAGHOLDER_DROP: 5400,
            FLAG_DESPAWN: 5400,

            WAIT: 0,
            ROUND: 28800,
            BETWEEN: 360
        },
        IS_TESTING: false,
        IS_DEBUGGING: false,
        MIN_PLAYERS: 2,
        ROUND_MAX: 3,
        NUM_ROUNDS: 3,
        TEAM_PLAYER_DEFICIT: 2,
        TEAM_SCORE_DEFICIT: 2
    }

    static setShipGroups() {
        Game.C.OPTIONS.SHIPS = ['{"name":"Invisible","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}', '{"name":"Invisible","level":2,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":2,"model":1,"code":201,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'];
        for (let group of ShipGroup.C.GROUPS) {
            let shipGroup = new ShipGroup(group.TIER, group.SHIPS);
            Game.shipGroups.push(shipGroup);
            Game.C.OPTIONS.SHIPS.push(...shipGroup.ships);
        }
    }

    constructor() {
        // this.reset();
    }

    tick() {
        this.manageTimeouts();

        this.manageGameState();

        this.manageShips();
        this.spawnAliens();
        this.spawnCollectibles();

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

    reset(newRound = false) {
        this.deleteEverything();
        this.resetContainers();
        this.selectRandomTeams();
        this.timeouts.push(new TimeoutCreator(() => {
            this.setMap();
            this.timeouts.push(new TimeoutCreator(() => {
                this.setShipGroup();
                this.spawnSpawns();
                this.spawnFlags();
                this.spawnPortals();
                this.timeouts.push(new TimeoutCreator(() => {
                    this.timeouts.push(new TimeoutCreator(() => {
                        this.resetShips();
                        this.timeouts.push(new TimeoutCreator(() => {
                            if (newRound) {
                                for (let ship of this.ships) {
                                    ship.chooseShipTime = game.step;
                                }
                                this.numRounds++;
                            }
                        }
                        , Game.C.TICKS.RESET_STAGGER).start());
                    }
                    , Game.C.TICKS.RESET_STAGGER).start());
                }
                , Game.C.TICKS.RESET_STAGGER).start());
            }
            , Game.C.TICKS.RESET_STAGGER).start());
        },
        Game.C.TICKS.RESET_STAGGER).start());
    }

    deleteEverything() {
        if (this.map) {
            this.map.destroySelf();
        }
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
        this.deleteSpawns();
        this.deleteFlags();
        this.deletePortals();
        this.deleteBeacons();
        this.deleteLasers();
    }

    deleteSpawns() {
        for (let spawn of this.spawns) {
            spawn.destroySelf();
        }
        this.spawns = [];
        for (let shipBeacon of this.shipBeacons) {
            shipBeacon.destroySelf();
        }
        this.shipBeacons = [];
    }

    deleteFlags() {
        for (let team of this.teams) {
            if (team.flag) {
                team.flag.destroySelf();
                team.flag = null;
            }
        }
    }

    deletePortals() {
        for (let portal of this.portals) {
            portal.destroySelf();
        }
        this.portals = [];
        for (let gravityWell of this.gravityWells) {
            gravityWell.destroySelf();
        }
        this.gravityWells = [];
    }

    deleteBeacons() {
        for (let beacon of this.beacons) {
            beacon.destroySelf();
        }
        this.beacons = [];
    }

    deleteLasers() {
        for (let laser of this.lasers) {
            laser.destroySelf();
        }
        this.lasers = [];
    }

    resetContainers() {
        this.roundTime = game.step;
        this.timesUp = false;
        this.betweenTime = -1;
    }

    setMap() {
        let newMap = Helper.getRandomArrayElement(GameMap.C.MAPS);
        if (Game.C.IS_TESTING) {
            newMap = GameMap.C.TEST_MAPS[1];
        }
        if (this.waiting) {
            newMap = GameMap.C.WAITING_MAP
        }
        this.map = new GameMap(newMap.name, newMap.author, newMap.map, newMap.flags, newMap.portals, newMap.spawns, newMap.tiers, newMap.asteroids).spawn();
    }

    setShipGroup() {
        if (this.map) {
            for (let shipGroup of Game.shipGroups) {
                if (this.map.tier == shipGroup.tier) {
                    this.shipGroup = shipGroup;
                    this.shipGroup.chooseShips(!this.waiting);
                }
            }
        }
    }

    spawnSpawns() {
        this.deleteSpawns();
        if (this.map && this.teams.length == 2) {
            for (let i = 0; i < this.map.spawns.length; i++) {
                let spawnPos = this.map.spawns[i];
                let spawn = new Obj(
                    Obj.C.OBJS.SPAWN.id,
                    Obj.C.OBJS.SPAWN.type,
                    new Vector3(spawnPos.x, spawnPos.y, Obj.C.OBJS.SPAWN.position.z),
                    new Vector3(Obj.C.OBJS.SPAWN.rotation.x, Obj.C.OBJS.SPAWN.rotation.y, Obj.C.OBJS.SPAWN.rotation.z),
                    new Vector3(Obj.C.OBJS.SPAWN.scale.x, Obj.C.OBJS.SPAWN.scale.y, Obj.C.OBJS.SPAWN.scale.z),
                    true,
                    true,
                    this.teams[i].hex
                ).update();
                this.spawns.push(spawn);
            }
        }
    }

    spawnFlags() {
        this.deleteFlags();
        if (this.map && this.teams.length == 2 && this.map.flags.length == 2) {
            this.teams[0].flag = new Flag(this.map.flags[0], this.teams[0].hex).spawn();
            this.teams[1].flag = new Flag(this.map.flags[1], this.teams[1].hex).spawn();
        }
    }

    spawnPortals() {
        this.deletePortals();
        if (this.map) {
            for (let i = 0; i < this.map.portals.length; i++) {
                let portalPos = this.map.portals[i];
                let portal = new Obj(
                    Obj.C.OBJS.PORTAL.id,
                    Obj.C.OBJS.PORTAL.type,
                    new Vector3(portalPos.x, portalPos.y, Obj.C.OBJS.PORTAL.position.z),
                    new Vector3(Obj.C.OBJS.PORTAL.rotation.x, Obj.C.OBJS.PORTAL.rotation.y, Obj.C.OBJS.PORTAL.rotation.z),
                    new Vector3(Obj.C.OBJS.PORTAL.scale.x, Obj.C.OBJS.PORTAL.scale.y, Obj.C.OBJS.PORTAL.scale.z),
                    true,
                    true,
                    '#00ff00'
                ).update();
                let gravityWell = new Obj(
                    Obj.C.OBJS.GRAVITY_WELL.id,
                    Obj.C.OBJS.GRAVITY_WELL.type,
                    new Vector3(portalPos.x, portalPos.y, Obj.C.OBJS.GRAVITY_WELL.position.z),
                    new Vector3(Obj.C.OBJS.GRAVITY_WELL.rotation.x, Obj.C.OBJS.GRAVITY_WELL.rotation.y, Obj.C.OBJS.GRAVITY_WELL.rotation.z),
                    new Vector3(Obj.C.OBJS.GRAVITY_WELL.scale.x, Obj.C.OBJS.GRAVITY_WELL.scale.y, Obj.C.OBJS.GRAVITY_WELL.scale.z),
                    true,
                    true,
                    '#00ff00'
                ).update();
                this.portals.push(portal);
                this.gravityWells.push(gravityWell);
            }
        }
    }

    selectRandomTeams() {
        this.teams = [];
        let randTeamOption = Helper.getRandomArrayElement(Team.C.TEAMS);
        for (let teamOption of randTeamOption) {
            this.teams.push(
                new Team(
                    teamOption.TEAM,
                    teamOption.COLOR,
                    teamOption.HEX,
                    teamOption.HUE,
                    teamOption.FLAGGED
                )
            );
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        for (let ship of this.ships) {
            this.resetShip(ship);
            ship.hideAllUIs();
        }
    }

    resetShip(ship, resetTeam = true) {
        ship.reset();

        if (this.waiting) {
            ship.setHue(Helper.getRandomHue());
            ship.setTeamDefault(Helper.getRandomInt(0, 1));
        } else {
            if (resetTeam && this.teams.length == 2) {
                if (this.teams[0].ships.length <= this.teams[1].ships.length) {
                    ship.setTeam(this.teams[0]);
                    this.teams[1].removeShip(ship);
                }
                else if (this.teams[1].ships.length < this.teams[0].ships.length) {
                    ship.setTeam(this.teams[1]);
                    this.teams[0].removeShip(ship);
                }
            }
        }
        
        if (this.shipGroup) {
            ship.setType(Helper.getRandomArrayElement(this.shipGroup.chosenTypes));
        }

        if (this.waiting) {
            ship.setPosition(new Vector2(0, 0));
        } else {
            if (this.map && this.map.spawns.length == 2 && ship.team) {
                ship.setPosition(this.map.spawns[ship.team.team])
            }
        }
    }

    gameOver() {
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
        if (this.map) {
            this.map.tick();
        }
        if (game.step % Game.C.TICKS.GAME_MANAGER == 0) {
            if (this.ships.length < Game.C.MIN_PLAYERS) {
                if (!this.waiting || this.waitTimer == -2) {
                    this.waiting = true;
                    this.waitTimer = -1;
                    this.reset();

                    this.logoWaiting = new Obj(
                        Obj.C.OBJS.LOGO_WAITING.id,
                        Obj.C.OBJS.LOGO_WAITING.type,
                        new Vector3(Obj.C.OBJS.LOGO_WAITING.position.x, Obj.C.OBJS.LOGO_WAITING.position.y, Obj.C.OBJS.LOGO_WAITING.position.z),
                        new Vector3(Obj.C.OBJS.LOGO_WAITING.rotation.x, Obj.C.OBJS.LOGO_WAITING.rotation.y, Obj.C.OBJS.LOGO_WAITING.rotation.z),
                        new Vector3(Obj.C.OBJS.LOGO_WAITING.scale.x, Obj.C.OBJS.LOGO_WAITING.scale.y, Obj.C.OBJS.LOGO_WAITING.scale.z),
                        true,
                        false
                    ).update();
                }
            } else if (this.waiting && this.waitTimer == -1 || game.step - this.waitTimer < Game.C.TICKS.WAIT) {
                if (this.waitTimer == -1) {
                    this.waitTimer = game.step;
                }
            } else {
                if (this.waiting) {
                    this.waitTimer = -1;
                    this.waiting = false;
                    if (this.logoWaiting) {
                        this.logoWaiting.destroySelf();
                        this.logoWaiting = null;
                    }
                    this.reset(true);
                }
    
                if (this.roundTime != -1) {
                    if (game.step - this.roundTime > Game.C.TICKS.ROUND) {
                        this.roundTime = -1;
                        this.betweenTime = game.step;
                        this.timesUp = true;
                    } else {
                        if (Math.abs(this.teams[0].ships.length - this.teams[1].ships.length) >= Game.C.TEAM_PLAYER_DEFICIT) {
                            let diff = this.teams[0].ships.length - this.teams[1].ships.length;
                            let t = diff > 0 ? 0 : 1;
                            let opp = t + 1 % 2;
                            let randShip = Helper.getRandomArrayElement(this.teams[t].ships);
                            if (this.teams[t].flag && this.teams[t].flagHolder && this.teams[t].flagHolder.id == randShip.ship.id) {
                                this.teams[t].flagHolder = null;
                                this.teams[opp].flag.reset();
                            }
                            this.resetShip(randShip);
                            randShip.chooseShipTime = game.step;
                            let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                            bottomMessage.components[1].value = `You have been moved to the ${this.teams[opp].color.toUpperCase()} team due to team player imbalance.`;
                            bottomMessage.components[0].fill = '#8B8B0080';
                            randShip.sendTimedUI(bottomMessage);
                        }
                    }
                }
    
                if (this.teams.length == 2) {
                    if (this.betweenTime != -1) {
                        this.roundTime = -1;
                        if (game.step - this.betweenTime > Game.C.TICKS.BETWEEN) {
                            this.betweenTime = -1;
                            let winningTeam = this.getWinningTeam();
                            if (winningTeam != null) {
                                this.   totalScores[winningTeam.team]++;
                            }
        
                            this.teams[0].setScore(0);
                            this.teams[1].setScore(0);
        
                            if (this.numRounds < Game.C.NUM_ROUNDS) {
                                this.reset(true);
                            } else {
                                this.gameOver();
                            }
                        }
                    }
        
                    if (this.betweenTime == -1 && (this.teams[0].score >= Game.C.ROUND_MAX || this.teams[1].score >= Game.C.ROUND_MAX)) {
                        this.roundTime = -1;
                        this.betweenTime = game.step;
                    }

                    for (let i = 0; i < this.teams.length; i++) {
                        let oppTeam = this.getOppTeam(this.teams[i]);
                        if (this.teams[i].flag && this.teams[i].flagHolder) {
                            if (game.step - this.teams[i].flagHolder.flagTime > Game.C.TICKS.FLAGHOLDER_DROP) {
                                this.teams[i].flagHolder.flagTime = -1;
                                this.teams[i].flagHolder.setType(this.teams[i].flagHolder.chosenType == 0 ? this.teams[i].flagHolder.ship.type - this.shipGroup.normalShips.length : this.teams[i].flagHolder.chosenType);
                                this.teams[i].flagHolder.setMaxStats();
                                this.teams[i].flagHolder.setHue(this.teams[i].hue);
                                this.teams[i].flagHolder.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);

                                this.sendNotifications(`${this.teams[i].flagHolder.ship.name} has ran out of time holding the flag!`, `Will ${this.teams[i].flagHolder.team.color.toUpperCase()} team steal it again?`, oppTeam);

                                this.teams[i].flagHolder = null;

                                oppTeam.flag.reset();
                            }
                        }

                        if (this.teams[i].flag && !this.teams[i].flagHidden) {
                            if (this.teams[i].flag.despawn != -1) {
                                if (game.step - this.teams[i].flag.despawn > Game.C.TICKS.FLAG_DESPAWN) {
                                    this.teams[i].flag.reset();
                                }
                            }
                        }
                    }
                }
            }
        }

        if (this.waiting) {
            if (this.map && game.step % Obj.C.OBJS.BEACON.SPAWN_RATE == 0) {
                for (let i = 0; i < Obj.C.OBJS.BEACON.SPAWN_AMOUNT; i++) {
                    let randPos = Helper.getRandomArrayElement(this.map.spawnArea);
                    this.spawnBeacon(randPos, Helper.getRandomVividHSL());
                }
            }
        } else {
            if (this.map && game.step % Obj.C.OBJS.LASER.SHOOT_RATE == 0) {
                for (let i = 0; i < this.teams.length; i++) {
                    let team = this.teams[i];
                    let oppTeam = this.getOppTeam(team);
                    if (oppTeam.score - team.score >= Game.C.TEAM_SCORE_DEFICIT) {
                        let corners = Helper.getNGonCorners(Obj.C.OBJS.FLAGSTAND.N_GON, Obj.C.OBJS.FLAGSTAND.N_GON_OFFSET);
                        for (let j = 0; j < corners.length; j++) {
                            corners[j] = corners[j].multiply(Obj.C.OBJS.FLAGSTAND.N_GON_SCALE);
                            corners[j] = corners[j].add(this.map.flags[i]);

                            let closestShip = null;
                            let closestDistance = -1;

                            for (let ship of oppTeam.ships) {
                                if (!ship.left && ship.ship.alive && ship.ship.type != 101 && ship.ship.type != 201) {
                                    if (closestShip == null) {
                                        closestShip = ship;
                                        closestDistance = new Vector2(closestShip.ship.x, closestShip.ship.y).getDistanceTo(new Vector2(corners[j].x, corners[j].y));
                                    } else {
                                        let distance = new Vector2(ship.ship.x, ship.ship.y).getDistanceTo(new Vector2(corners[j].x, corners[j].y));
                                        if (distance < closestDistance) {
                                            closestShip = ship;
                                            closestDistance = distance;
                                        }
                                    }
                                }
                            }

                            if (closestShip && new Vector2(closestShip.ship.x, closestShip.ship.y).getDistanceTo(new Vector2(corners[j].x, corners[j].y)) < Obj.C.OBJS.LASER.DISTANCE) {
                                this.spawnLaser(corners[j], closestShip, team.hex);
                                // let asteroid = new Asteroid(
                                //     new Vector2(closestShip.ship.x, closestShip.ship.y),
                                //     new Vector2(0, 0),
                                //     closestShip.getLevel() * Obj.C.OBJS.LASER.ASTEROID_SIZE_LEVEL
                                // );
                                // this.asteroids.push(asteroid);
                                // // this.timedAsteroids.push(
                                // //     new TimedAsteroid(asteroid, Obj.C.OBJS.LASER.ASTEROID_TIME)
                                // // );
                                closestShip.takeDamage(closestShip.getLevel() * Obj.C.OBJS.LASER.DAMAGE_LEVEL);
                            }
                        }
                    }
                }
            }
        }
    }

    tickTimedEntities() {
        let removedShipBeacons = [];
        for (let shipBeacon of this.shipBeacons) {
            shipBeacon.tick();
            if (!shipBeacon.running) {
                removedShipBeacons.push(shipBeacon);
            }
        }
        for (let shipBeacon of removedShipBeacons) {
            Helper.deleteFromArray(this.shipBeacons, shipBeacon);
        }


        let removedBeacons = [];
        for (let beacon of this.beacons) {
            beacon.tick();
            if (!beacon.running) {
                removedBeacons.push(beacon);
            }
        }
        for (let beacon of removedBeacons) {
            Helper.deleteFromArray(this.beacons, beacon);
        }

        let removedLasers = [];
        for (let laser of this.lasers) {
            laser.tick();
            if (!laser.running) {
                removedLasers.push(laser);
            }
        }
        for (let laser of removedLasers) {
            Helper.deleteFromArray(this.lasers, laser);
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
                Helper.deleteFromArray(ship.team.ships, ship);
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
        if (game.step % Game.C.TICKS.SHIP_MANAGER === 0) {
            for (let ship of this.ships) {
                if (!ship.done) {
                    this.resetShip(ship);
                    ship.done = true;

                    ship.sendTimedUI(UIComponent.C.UIS.LOGO, TimedUI.C.LOGO_TIME);

                    if (!this.waiting) {
                        ship.chooseShipTime = game.step;
                    }
                }

                ship.sendUI(UIComponent.C.UIS.LIVES_BLOCKER);

                if (this.waiting) {
                    ship.sendUI(UIComponent.C.UIS.WAITING_SCOREBOARD);
                    let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                    bottomMessage.components[1].value = "Waiting for more players... (" + this.ships.length + "/" + Game.C.MIN_PLAYERS + ")";
                    if (this.waitTimer != -1) {
                        bottomMessage.components[1].value = "Game starts in: " + Helper.formatTime(Game.C.TICKS.WAIT - (game.step - this.waitTimer));
                    }
                    ship.sendUI(bottomMessage);
                    ship.sendUI(UIComponent.C.UIS.RADAR_BACKGROUND);

                    ship.setInvulnerable(Ship.C.INVULNERABLE_TIME);
                    ship.fillUp();
                } else if (this.map) {
                    if (ship.chosenType == 0) {
                        if (this.map.spawns.length == 2 && ship.team) {
                            ship.setPosition(this.map.spawns[ship.team.team]);
                        }
                        ship.setVelocity(new Vector2(0, 0));
                        ship.setType(101);
                        ship.setCrystals(0);
                        ship.setCollider(false);
                    }

                    if (this.betweenTime != -1) {
                        ship.setCollider(false);
                        ship.setInvulnerable(Ship.C.INVULNERABLE_TIME);

                        if (ship.team && ship.team.flag && ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id) {
                            ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                            ship.setMaxStats();
                            ship.setHue(ship.team.hue);

                            ship.team.flagHolder = null;
                            this.getOppTeam(ship.team).flag.reset();
                        }

                        let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);

                        let winningTeam = this.getWinningTeam();
                        if (this.timesUp) {
                            bottomMessage.components[1].value = "Time's up! ";
                        }
                        if (winningTeam != null) {
                            bottomMessage.components[1].value += "The " + winningTeam.color.toUpperCase() + " team won! ";
                            bottomMessage.components[0].fill = ship.team.team == winningTeam.team ? '#008B0080' : '#8B000080';
                        } else {
                            bottomMessage.components[1].value += "It's a tie and no team won. ";
                        }
                        if (this.numRounds < Game.C.NUM_ROUNDS) {
                            bottomMessage.components[1].value += "Next round starts in: " + Helper.formatTime(Game.C.TICKS.BETWEEN - (game.step - this.betweenTime));
                        } else {
                            bottomMessage.components[1].value += `${Game.C.NUM_ROUNDS} rounds have been played!`;
                        }
                        ship.sendUI(bottomMessage);

                        ship.hideUI(UIComponent.C.UIS.TIMER);
                        ship.hideUI(UIComponent.C.UIS.PORTAL_COOLDOWN);
                    } else {
                        ship.setCollider(true);
                        if (ship.team && ship.team.flag && ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id) {
                            let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                            bottomMessage.components[1].value = 'Time left for holding the flag: ' + Helper.formatTime((Game.C.TICKS.FLAGHOLDER_DROP - (game.step - ship.flagTime)));
                            ship.sendUI(bottomMessage);

                            if (ship.ship.type != ship.chosenType + this.shipGroup.normalShips.length) {
                                ship.setType(ship.chosenType + this.shipGroup.normalShips.length);
                                ship.setMaxStats();
                            }
                            if (ship.ship.hue != ship.team.flagged) {
                                ship.setHue(ship.team.flagged);
                            }
                        } else if (ship.chosenType != 0) {
                            if (ship.ship.type != ship.chosenType) {
                                ship.setType(ship.chosenType);
                                ship.setMaxStats();
                            }
                            if (ship.ship.hue != ship.team.hue) {
                                ship.setHue(ship.team.hue);
                            }
                        }

                        if (ship.chooseShipTime != -1 && game.step - ship.chooseShipTime < Ship.C.CHOOSE_SHIP_TIME) {
                            if (!ship.choosingShip) {
                                for (let i = 0; i < ShipGroup.C.NUM_SHIPS; i++) {
                                    let chooseShip = Helper.deepCopy(UIComponent.C.UIS.CHOOSE_SHIP);
                                    chooseShip.id += '-' + i;
                                    chooseShip.position[0] = 22.5 + 20 * i;
                                    if (i == 0) {
                                        chooseShip.components[0].fill = '#ff000080';
                                        chooseShip.components[2].fill = '#22000080';
                                    } else if (i == 1) {
                                        chooseShip.components[0].fill = '#00ff0080';
                                        chooseShip.components[2].fill = '#00220080';
                                    } else {
                                        chooseShip.components[0].fill = '#0000ff80';
                                        chooseShip.components[2].fill = '#00002280';
                                    }
                                    chooseShip.components[1].value = i + 1;
                                    chooseShip.components[5].value = this.shipGroup.chosenNames[i];
                                    chooseShip.components[8].value = this.shipGroup.chosenOrigins[i];
                                    ship.sendUI(chooseShip);
                                }
                            }
                            ship.choosingShip = true;
                            let chooseShipTime = Helper.deepCopy(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                            chooseShipTime.components[0].value = Helper.formatTime(ship.chooseShipTime - (game.step - Ship.C.CHOOSE_SHIP_TIME));
                            ship.sendUI(chooseShipTime);

                            if (this.map && this.map.spawns.length == 2 && ship.team) {
                                ship.setPosition(this.map.spawns[ship.team.team]);
                            }
                            ship.setType(101);
                            ship.setCrystals(0);
                            ship.setMaxStats();
                            ship.setCollider(false);
                        } else {
                            if (ship.choosingShip) {
                                ship.chosenType = Helper.getRandomArrayElement(this.shipGroup.chosenTypes);
                                ship.setType(ship.chosenType);
                                ship.fillUp();
                                ship.setCollider(true);
                                ship.setInvulnerable(Ship.C.INVULNERABLE_TIME)
                                ship.hideUIsIncludingID(UIComponent.C.UIS.CHOOSE_SHIP);
                                ship.hideUI(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                                ship.choosingShip = false;

                                if (this.map && this.map.spawns.length == 2 && ship.team) {
                                    this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                                }
                            }
                        }

                        if (!ship.left && ship.ship.alive && ship.ship.type != 101 && ship.ship.type != 201) {
                            let oppTeam = this.getOppTeam(ship.team);
                            if (ship.team.flag && !ship.team.flagHolder && !oppTeam.flag.flagHidden && oppTeam.flag.flagPos.getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.FLAG.DISTANCE) {
                                ship.team.flagHolder = ship;
                                oppTeam.flag.hide();

                                ship.flagTime = game.step;
                                ship.setType((ship.chosenType == 0 ? ship.ship.type : ship.chosenType) + this.shipGroup.normalShips.length);
                                ship.setMaxStats();
                                ship.setHue(ship.team.flagged);
                                
                                this.sendNotifications(`${ship.ship.name} has stolen ${oppTeam.color.toUpperCase()} team's flag!`, `Bring it back to ${ship.team.color.toUpperCase()} team's stand to score a point.`, ship.team);
                            }
                            if (ship.team.flag && !ship.team.flag.flagHidden && !ship.team.flag.isAtStand() && ship.team.flag.flagPos.getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.FLAG.DISTANCE) {
                                ship.team.flag.reset();

                                this.sendNotifications(`${ship.ship.name} has returned the ${ship.team.color.toUpperCase()} team's flag!`, `Chance for ${oppTeam.color.toUpperCase()} team is over.`, ship.team);
                            }
                            if (ship.team.flag && ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id && ship.team.flag.flagStandPos.getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.FLAG.DISTANCE) {
                                ship.team.flagHolder = null;
                                oppTeam.flag.reset();

                                ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                                ship.setMaxStats();
                                ship.setHue(ship.team.hue);
                                ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                ship.setScore(ship.score + 1);
                                ship.setTotalScore(ship.totalScore + 1);

                                ship.team.setScore(ship.team.score + 1);

                                this.spawnBeacon(ship.team.flag.flagStandPos, ship.team.hex);

                                this.sendNotifications(`${ship.ship.name} has scored a point for the ${ship.team.color.toUpperCase()} team!`, `Will ${oppTeam.color.toUpperCase()} team score next?`, ship.team);
                            }
                        }

                        if (Game.C.TICKS.ROUND - (game.step - this.roundTime) >= 0) {
                            let timer = Helper.deepCopy(UIComponent.C.UIS.TIMER);
                            let timeLeft = Game.C.TICKS.ROUND - (game.step - this.roundTime);
                            timer.components[1].value = 'Time left: ' + Helper.formatTime(timeLeft);
                            if (timeLeft <= UIComponent.C.TICKS.WARNING) {
                                timer.components[0].fill = '#8B000080';
                                timer.components[0].stroke = '#FFBBBB';
                                timer.components[0].width = 2;
                                timer.components[1].color = '#FFBBBB';
                            }
                            ship.sendUI(timer);
                        }
                    }

                    let mapAuthor = Helper.deepCopy(UIComponent.C.UIS.MAP_AUTHOR);
                    mapAuthor.components[2].value += this.map.name + " by " + this.map.author;
                    ship.sendUI(mapAuthor);

                    let radarBackground = Helper.deepCopy(UIComponent.C.UIS.RADAR_BACKGROUND);
                    for (let i = 0; i < this.teams.length; i++) {
                        if (this.teams[i].flag) {
                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(this.teams[i].flag.flagStandPos, new Vector2(100, 100)),
                                value: '⬡',
                                color: this.teams[i].hex
                            });

                            if (!this.teams[i].flag.flagHidden) {
                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(this.teams[i].flag.flagPos, new Vector2(50, 50)),
                                    value: '⚐',
                                    color: this.teams[i].hex
                                });
                            }
                        }
                    }
                    if (this.map) {
                        for (let i = 0; i < this.map.spawns.length; i++) {
                            let spawn = this.map.spawns[i];
                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(new Vector2(spawn.x, spawn.y), new Vector2(40, 40)),
                                value: '⬢',
                                color: this.teams[i].hex + '80'
                            });
                        }
                        for (let i = 0; i < this.map.portals.length; i++) {
                            let portal = this.map.portals[i];

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(120, 120)),
                                value: '⬡',
                                color: '#00ff0080'
                            });

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(80, 80)),
                                value: '⬡',
                                color: '#00ff0060'
                            });

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(40, 40)),
                                value: '⬡',
                                color: '#00ff0040'
                            });
                        }
                    }
                    ship.sendUI(radarBackground);

                    let scoreboard = Helper.deepCopy(UIComponent.C.UIS.SCOREBOARD);
                    scoreboard.components[0].fill = this.teams[0].hex + 'BF';
                    scoreboard.components[2].fill = this.teams[1].hex + 'BF';
                    scoreboard.components[1].value = this.teams[0].color.toUpperCase() + ' TEAM';
                    if (this.teams[0].color == 'Yellow' || this.teams[0].color == 'Cyan') {
                        scoreboard.components[1].color = '#000000';
                    }
                    scoreboard.components[3].value = this.teams[1].color.toUpperCase() + ' TEAM';
                    if (this.teams[1].color == 'Yellow' || this.teams[1].color == 'Cyan') {
                        scoreboard.components[3].color = '#000000';
                    }
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
                            if (players1[i].ship.id == ship.ship.id) {
                                scoreboard.components.push({
                                    type: 'box',
                                    position: [0, (i + 1) * 100 / 12, 100, 100 / 12],
                                    fill: '#ffffff20'
                                });
                            }
                            scoreboard.components.push({
                                type: 'player',
                                position: [0, (i + 1) * 100 / 12, 85, 100 / 12],
                                id: players1[i].ship.id,
                                color: '#ffffff',
                                align: 'left'
                            },
                            {
                                type: 'text',
                                position: [87.5, (i + 1) * 100 / 12, 10, 100 / 12],
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
                            if (players2[i].ship.id == ship.ship.id) {
                                scoreboard.components.push({
                                    type: 'box',
                                    position: [0, 50 + (i + 1) * 100 / 12, 100, 100 / 12],
                                    fill: '#ffffff20'
                                });
                            }
                            scoreboard.components.push({
                                type: 'player',
                                position: [0, 50 + (i + 1) * 100 / 12, 85, 100 / 12],
                                id: players2[i].ship.id,
                                color: '#ffffff',
                                align: 'left'
                            },
                            {
                                type: 'text',
                                position: [87.5, 50 + (i + 1) * 100 / 12, 10, 100 / 12],
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

                    if (!ship.hasUI(UIComponent.C.UIS.LOGO) && this.teams) {
                        let topMessage = Helper.deepCopy(UIComponent.C.UIS.TOP_MESSAGE);
                        topMessage.components[1].value = `Round ${this.numRounds} of ${Game.C.NUM_ROUNDS}`;
                        ship.sendUI(topMessage);

                        let roundScore = Helper.deepCopy(UIComponent.C.UIS.ROUND_SCORES);
                        let winningTeam = this.getWinningTeam();
                        if (winningTeam == null) {
                            roundScore.components[0].value = 'TIE';
                            roundScore.components[0].color = '#ffffff';
                        }
                        else {
                            roundScore.components[0].value = winningTeam.color.toUpperCase();
                            roundScore.components[0].color = winningTeam.hex;
                        }
                        roundScore.components[1].value = this.teams[0].score;
                        roundScore.components[1].color = this.teams[0].hex;
                        roundScore.components[3].value = this.teams[1].score;
                        roundScore.components[3].color = this.teams[1].hex;
                        ship.sendUI(roundScore);

                        let totalScore = Helper.deepCopy(UIComponent.C.UIS.TOTAL_SCORES);
                        totalScore.components[1].value = this.totalScores[0];
                        totalScore.components[3].value = this.totalScores[1];
                        ship.sendUI(totalScore);

                        if (this.betweenTime == -1) {
                            let portalCooldown = Helper.deepCopy(UIComponent.C.UIS.PORTAL_COOLDOWN);
                            let portalTime = Ship.C.PORTAL_TIME - (game.step - ship.portalTime);
                            if (portalTime < 0) {
                                portalTime = 0;
                            }
                            portalCooldown.components[2].value = Helper.formatTime(portalTime);
                            if (portalTime == 0) {
                                portalCooldown.components[0].stroke = "#00ff00";
                                portalCooldown.components[2].color = "#00ff00";
                            } else {
                                portalCooldown.components[0].stroke = "#ff0000";
                                portalCooldown.components[2].color = "#ff0000";
                            }
                            ship.sendUI(portalCooldown);
                        }
                    }
                }

                ship.tick();
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                if (!this.waiting && this.betweenTime == -1 && !ship.left && ship.ship.alive && ship.ship.type != 101 && ship.ship.type != 201) {
                    for (let portal of this.portals) {
                        this.suckPortalShip(ship, portal, this.gravityWells[this.portals.indexOf(portal)]);
                    }
                }
            }
        }
    }

    spawnAliens() {
        if (
            this.map &&
            game.step % Alien.C.SPAWN_RATE === 0 &&
            game.aliens.length < Alien.C.MAX_AMOUNT
        ) {
            let pos = Helper.getRandomArrayElement(this.map.spawnArea);

            let as = [];
            for (let i = 0; i < Alien.C.TYPES.length; i++) {
                let type = Alien.C.TYPES[i];
                if (Alien.C.ALLOWED.includes(type.CODE)) {
                    as.push(Helper.deepCopy(type));
                }
            }
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
            this.map &&
            game.step % Collectible.C.SPAWN_RATE === 0 &&
            game.collectibles.length < Collectible.C.MAX_AMOUNT
        ) {
            for (let i = 0; i < Collectible.C.MAX_AMOUNT; i++) {
                let pos = Helper.getRandomArrayElement(this.map.spawnArea);
                let cs = [];
                for (let j = 0; j < Collectible.C.TYPES.length; j++) {
                    let type = Collectible.C.TYPES[j];
                    if (Collectible.C.ALLOWED.includes(type.CODE)) {
                        cs.push(Helper.deepCopy(type));
                    }
                }
                let collectibleOption = Helper.getRandomArrayElement(cs);
                new Collectible(
                    pos,
                    collectibleOption.NAME,
                    collectibleOption.CODE,
                );
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

    suckPortalShip(ship, portal, gravityWell, teleport = true, careCooldown = true, customSuckingDistance = -1, customIntensity = -1) {
        if (ship.ship.alive && !ship.ship.idle && ((careCooldown && (ship.portalTime == -1 || game.step - ship.portalTime >= Ship.C.PORTAL_TIME)) || !careCooldown)) {
            let portalDistance = new Vector2(ship.ship.x, ship.ship.y).getDistanceTo(new Vector2(portal.obj.position.x, portal.obj.position.y));
            let teleportingDistance = Obj.C.OBJS.PORTAL.TELEPORT_FACTOR * portal.obj.scale.x * 10 / Obj.C.OBJS.PORTAL.scale.x;
            let suckingDistance = Obj.C.OBJS.GRAVITY_WELL.SUCK_FACTOR * gravityWell.obj.scale.x * 10 / Obj.C.OBJS.GRAVITY_WELL.scale.x;
            if (customSuckingDistance != -1) {
                suckingDistance = customSuckingDistance;
            }
            if (portalDistance <= teleportingDistance) {
                if (teleport && this.map) {
                    let portalCoords = Helper.deepCopy(this.map.portals);
                    for (let i = 0; i < portalCoords.length; i++) {
                        let portalCoord = portalCoords[i];
                        if (new Vector2(portalCoord.x, portalCoord.y).equals(new Vector2(portal.obj.position.x, portal.obj.position.y))) {
                            portalCoords.splice(i, 1);
                            break;
                        }
                    }
                    let spawnPos = Helper.getRandomArrayElement(portalCoords);
                    this.spawnBeacon(spawnPos, '#00ff00');
                    ship.setPosition(spawnPos);
                    ship.setVelocity(new Vector2(0, 0));
                    ship.portalTime = game.step;
                } else {
                    let shipVelocity = new Vector2(ship.ship.vx, ship.ship.vy);
                    if (shipVelocity.length() >= Obj.C.OBJS.GRAVITY_WELL.MAX_VELOCITY) {
                        ship.setVelocity(shipVelocity.clone().normalize().multiply(Obj.C.OBJS.GRAVITY_WELL.MAX_VELOCITY));
                    }
                    ship.setVelocity(shipVelocity.clone().multiply(Obj.C.OBJS.GRAVITY_WELL.VELOCITY_FACTOR));
                }
            }
            else if (portalDistance <= suckingDistance) {
                let portalAngle = new Vector2(ship.ship.x, ship.ship.y).getAngleTo(new Vector2(portal.obj.position.x, portal.obj.position.y));
                let intensity = customIntensity != -1 ? customIntensity : Obj.C.OBJS.GRAVITY_WELL.INTENSITY;
                ship.setVelocity(new Vector2(
                    ship.ship.vx + Math.cos(portalAngle) * intensity * suckingDistance / Math.pow(portalDistance, 2),
                    ship.ship.vy + Math.sin(portalAngle) * intensity * suckingDistance / Math.pow(portalDistance, 2)
                ));
            }
        }
    }

    spawnShipBeacon(pos, hex) {
        this.shipBeacons.push(
            new TimedObj(
                new Obj(
                    Obj.C.OBJS.SHIP_BEACON.id,
                    Obj.C.OBJS.SHIP_BEACON.type,
                    new Vector3(pos.x, pos.y, Obj.C.OBJS.SHIP_BEACON.position.z),
                    new Vector3(Obj.C.OBJS.SHIP_BEACON.rotation.x, Obj.C.OBJS.SHIP_BEACON.rotation.y, Obj.C.OBJS.SHIP_BEACON.rotation.z),
                    new Vector3(Obj.C.OBJS.SHIP_BEACON.scale.x, Obj.C.OBJS.SHIP_BEACON.scale.y, Obj.C.OBJS.SHIP_BEACON.scale.z),
                    true,
                    true,
                    hex
                ),
                Obj.C.OBJS.SHIP_BEACON.EXISTENCE_TIME
            ).spawn()
        );
    }

    spawnBeacon(pos, hex) {
        this.beacons.push(
            new TimedObj(
                new Obj(
                    Obj.C.OBJS.BEACON.id,
                    Obj.C.OBJS.BEACON.type,
                    new Vector3(pos.x, pos.y, Obj.C.OBJS.BEACON.position.z),
                    new Vector3(Obj.C.OBJS.BEACON.rotation.x, Obj.C.OBJS.BEACON.rotation.y, Obj.C.OBJS.BEACON.rotation.z),
                    new Vector3(Obj.C.OBJS.BEACON.scale.x, Obj.C.OBJS.BEACON.scale.y, Obj.C.OBJS.BEACON.scale.z),
                    true,
                    true,
                    hex
                ),
                Obj.C.OBJS.BEACON.EXISTENCE_TIME
            ).spawn()
        );
    }

    spawnLaser(pos, ship, hex) {
        let laserRotation = new Vector2(ship.ship.x, ship.ship.y).getAngleTo(new Vector2(pos.x, pos.y));
        let laserDistance = new Vector2(ship.ship.x, ship.ship.y).getDistanceTo(new Vector2(pos.x, pos.y));
        this.lasers.push(
            new TimedObj(
                new Obj(
                    Obj.C.OBJS.LASER.id,
                    Obj.C.OBJS.LASER.type,
                    new Vector3(pos.x - Math.cos(laserRotation) * laserDistance / 2, pos.y - Math.sin(laserRotation) * laserDistance / 2, Obj.C.OBJS.LASER.position.z),
                    new Vector3(Obj.C.OBJS.LASER.rotation.x, Obj.C.OBJS.LASER.rotation.y, laserRotation + Math.PI / 2),
                    new Vector3(Obj.C.OBJS.LASER.scale.x, laserDistance, Obj.C.OBJS.LASER.scale.z),
                    true,
                    true,
                    hex
                ),
                Obj.C.OBJS.LASER.EXISTENCE_TIME
            ).spawn()
        );
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

    findAlien(gameAlien) {
        for (let alien of this.aliens) {
            if (alien.alien == gameAlien || alien.alien.id == gameAlien.id) {
                return alien;
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
            if (this.waiting) {
                ship.setPosition(new Vector2(0, 0));
                ship.fillUp();
            } else {
                if (this.map && this.map.spawns.length == 2 && ship.team) {
                    ship.setPosition(this.map.spawns[ship.team.team]);
                }
                ship.setVelocity(new Vector2(0, 0));
                ship.setType(101);
                ship.setCrystals(0);
                ship.setCollider(false);
                ship.chooseShipTime = game.step;
            }
        }
    }

    onShipDestroyed(gameShip) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            ship.ship.alive = false;

            if (ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id) {
                let oppTeam = this.getOppTeam(ship.team);
                oppTeam.flag.setPosition(new Vector2(ship.ship.x, ship.ship.y));
                oppTeam.flag.show();
                oppTeam.flag.despawn = game.step;

                ship.team.flagHolder = null;

                ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                ship.setHue(ship.team.hue);
                ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);

                this.sendNotifications(`${ship.ship.name} has dropped the flag!`, `Will ${ship.team.color.toUpperCase()} team steal it again?`, oppTeam);
            }
        }
    }

    onUIComponentClicked(gameShip, id) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            if (id.includes(UIComponent.C.UIS.CHOOSE_SHIP.id)) {
                if (ship.choosingShip) {
                    ship.chosenType = this.shipGroup.chosenTypes[parseInt(id.split('-')[1])];
                    ship.setType(ship.chosenType);
                    ship.fillUp();
                    ship.setCollider(true);
                    ship.setInvulnerable(Ship.C.INVULNERABLE_TIME)
                    ship.hideUIsIncludingID(UIComponent.C.UIS.CHOOSE_SHIP);
                    ship.hideUI(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                    ship.chooseShipTime = -1;
                    ship.choosingShip = false;

                    if (this.map && this.map.spawns.length == 2 && ship.team) {
                        this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                    }
                }
            }
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {

    }
}

class Team {
    team = 0;
    color = '';
    hex = 0;
    hue = 0;
    flagged = 0;

    score = 0;

    ships = [];

    flag = null;
    flagHolder = null;

    static C = {
        TEAMS: [
            [
                {
                    TEAM: 0,
                    COLOR: 'Red',
                    HEX: '#ff0000',
                    HUE: 0,
                    FLAGGED: 40
                },
                {
                    TEAM: 1,
                    COLOR: 'Blue',
                    HEX: '#0000ff',
                    HUE: 240,
                    FLAGGED: 180
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Yellow',
                    HEX: '#ffff00',
                    HUE: 60,
                    FLAGGED: 100
                },
                {
                    TEAM: 1,
                    COLOR: 'Purple',
                    HEX: '#ff00ff',
                    HUE: 300,
                    FLAGGED: 260
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Cyan',
                    HEX: '#00ffff',
                    HUE: 180,
                    FLAGGED: 200
                },
                {
                    TEAM: 1,
                    COLOR: 'Orange',
                    HEX: '#ff8000',
                    HUE: 30,
                    FLAGGED: 0
                }
            ]
        ]
    }

    constructor(team, color, hex, hue, flagged) {
        this.team = team;
        this.color = color;
        this.hex = hex;
        this.hue = hue;
        this.flagged = flagged;
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

class Ship {
    team = null;
    ship = null;

    timeouts = [];

    allUIs = [];
    timedUIs = [];

    left = false;
    done = false;

    chosenType = 0;

    score = 0;
    totalScore = 0;

    chooseShipTime = -1;
    choosingShip = false;

    flagTime = -1;

    portalTime = -1;

    static C = {
        INVULNERABLE_TIME: 360,
        CHOOSE_SHIP_TIME: 600,
        CHOOSE_SHIP_TIMEOUT: 15,
        PORTAL_TIME: 7200
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

        this.choosingShip = false;
        this.chooseShipTime = -1;
        this.chosenType = 0;
        this.score = 0;

        this.flagTime = -1;
        this.portalTime = -1;

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

            this.ship.setUIComponent(cUI);

            if (!hideMode) {
                let removedUIs = [];
                for (let u of this.allUIs) {
                    if (u.id == cUI.id) {
                        removedUIs.push(u);
                    }
                }
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

        this.ship.set({ score: this.score });
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

    setVelocity(velocity) {
        if (game.ships.includes(this.ship)) {
            this.ship.vx = velocity.x;
            this.ship.vy = velocity.y;
            this.ship.set({ vx: velocity.x, vy: velocity.y });
        }
        return this;
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

    setTotalScore(totalScore) {
        this.totalScore = totalScore;
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
            this.setCrystals(this.getMaxCrystals() / 2);
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
                "Congratulations": "Thanks for playing!",
                "Flags Captured": this.totalScore
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

class Flag {
    flagPos = null;
    flag = null;
    flagHidden = false;
    flagStandPos = null;
    flagStand = null;
    color = '';

    holder = null;
    despawn = -1;

    constructor(flagPos, color) {
        this.flagPos = flagPos.clone();
        this.flagStandPos = flagPos.clone();
        this.color = color;
    }

    spawn() {
        this.flag = new Obj(
            Obj.C.OBJS.FLAG.id,
            Obj.C.OBJS.FLAG.type,
            new Vector3(this.flagPos.x, this.flagPos.y, Obj.C.OBJS.FLAG.position.z),
            new Vector3(Obj.C.OBJS.FLAG.rotation.x, Obj.C.OBJS.FLAG.rotation.y, Obj.C.OBJS.FLAG.rotation.z),
            new Vector3(Obj.C.OBJS.FLAG.scale.x, Obj.C.OBJS.FLAG.scale.y, Obj.C.OBJS.FLAG.scale.z),
            true,
            true,
            this.color
        ).update();
        this.flagStand = new Obj(
            Obj.C.OBJS.FLAGSTAND.id,
            Obj.C.OBJS.FLAGSTAND.type,
            new Vector3(this.flagStandPos.x, this.flagStandPos.y, Obj.C.OBJS.FLAGSTAND.position.z),
            new Vector3(Obj.C.OBJS.FLAGSTAND.rotation.x, Obj.C.OBJS.FLAGSTAND.rotation.y, Obj.C.OBJS.FLAGSTAND.rotation.z),
            new Vector3(Obj.C.OBJS.FLAGSTAND.scale.x, Obj.C.OBJS.FLAGSTAND.scale.y, Obj.C.OBJS.FLAGSTAND.scale.z),
            true,
            true,
            this.color
        ).update();
        return this;
    }

    hide() {
        this.flag.hide();
        this.flagHidden = true;
    }

    show() {
        this.flag.show();
        this.flagHidden = false;
    }

    setPosition(position) {
        this.flagPos = position.clone();
        this.flag.setPosition(position);
    }

    reset() {
        this.flagPos = this.flagStandPos.clone();
        this.flag.setPosition(this.flagPos);
        this.despawn = -1;
        this.show();
    }

    isAtStand() {
        return this.flagPos.equals(this.flagStandPos);
    }

    destroySelf() {
        this.flag.destroySelf();
        this.flagStand.destroySelf();
    }
}

class Obj {
    originalObj = null;
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
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: '',
                }
            },
            LOGO_WAITING: {
                id: 'logo_waiting',
                position: {
                    x: 0,
                    y: 0,
                    z: -500
                },
                rotation: {
                    x: Math.PI,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 500,
                    y: 500,
                    z: 0
                },
                type: {
                    id: 'logo_waiting',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/logo_waiting.png',
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
            SPAWN: {
                id: 'spawn',
                position: {
                    x: 0,
                    y: 0,
                    z: -5
                },
                rotation: {
                    x: Math.PI / 2,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 5,
                    y: 5,
                    z: 5
                },
                type: {
                    id: 'spawn',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/spawn.obj',
                    transparent: false,
                }
            },
            FLAG: {
                id: 'flag',
                position: {
                    x: 0,
                    y: 0,
                    z: -4
                },
                rotation: {
                    x: Math.PI / 2,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 0.8,
                    z: 1
                },
                type: {
                    id: "flag",
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/flag.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                },
                DISTANCE: 8
            },
            FLAGSTAND: {
                id: 'flagstand',
                position: {
                    x: 0,
                    y: 0,
                    z: -5
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 60,
                    y: 60,
                    z: 30
                },
                type: {
                    id: 'flagstand',
                    obj: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/flagstand.obj",
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false
                },
                N_GON: 6,
                N_GON_SCALE: 6.5,
                N_GON_OFFSET: 0,
            },
            PORTAL: {
                id: 'portal',
                position: {
                    x: 0,
                    y: 0,
                    z: -5
                },
                rotation: {
                    x: 0,
                    y: -Math.PI / 2,
                    z: 0
                },
                scale: {
                    x: 2.5,
                    y: 2.5,
                    z: 2.5
                },
                type: {
                    id: 'portal',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/portal.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false
                },
                MAIN_SCALE: 3,
                TELEPORT_FACTOR: 0.5
            },
            GRAVITY_WELL: {
                id: 'gravity_well',
                position: {
                    x: 0,
                    y: 0,
                    z: -5
                },
                rotation: {
                    x: Math.PI / 2,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 30,
                    y: 30,
                    z: 30
                },
                type: {
                    id: 'gravity',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/gravity.obj',
                    transparent: false
                },
                MAIN_SCALE: 12,
                MAIN_INTENSITY: 2,
                MAX_VELOCITY: 1,
                VELOCITY_FACTOR: 0.5,
                INTENSITY: 0.5,
                SUCK_FACTOR: 3
            },
            SHIP_BEACON: {
                id: 'ship_beacon',
                position: {
                    x: 0,
                    y: 0,
                    z: 7
                },
                rotation: {
                    x: Math.PI / 2,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 5,
                    y: 24,
                    z: 5
                },
                type: {
                    id: 'ship_beacon',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/beacon.obj',
                    transparent: false
                },
                EXISTENCE_TIME: 150,
            },
            BEACON: {
                id: 'beacon',
                position: {
                    x: 0,
                    y: 0,
                    z: -5
                },
                rotation: {
                    x: Math.PI / 2,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 1,
                    y: 1e4,
                    z: 1
                },
                type: {
                    id: 'beacon',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/beacon.obj',
                    transparent: false
                },
                EXISTENCE_TIME: 300,
                SPAWN_RATE: 30,
                SPAWN_AMOUNT: 2
            },
            LASER: {
                id: 'laser',
                position: {
                    x: 0,
                    y: 0,
                    z: -4
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 0.25,
                    y: 0.25,
                    z: 0.25
                },
                type: {
                    id: 'laser',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/beacon.obj',
                    transparent: false
                },
                EXISTENCE_TIME: 15,
                SHOOT_RATE: 60,
                DISTANCE: 30,
                DAMAGE_LEVEL: 2,
                ASTEROID_SIZE_LEVEL: 5,
                ASTEROID_TIME: 10
            }
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

    update() {
        game.setObject(this.obj);
        return this;
    }

    reset() {
        this.obj = Helper.deepCopy(this.originalObj);
        this.update();
        return this;
    }

    setPosition(position) {
        this.obj.position = position;
        return this;
    }

    setRotation(rotation) {
        this.obj.rotation = rotation;
        return this;
    }

    setScale(scale) {
        this.obj.scale = scale;
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
                    {
                        type: 'box',
                        position: [0, 0, 100, 100 / 12],
                        fill: '#ffffff'
                    },
                    {
                        type: 'text',
                        position: [0, 0, 100, 100 / 12],
                        color: '#ffffff',
                        value: 'Team Name'
                    },
                    {
                        type: 'box',
                        position: [0, 50, 100, 100 / 12],
                        fill: '#ffffff'
                    },
                    {
                        type: 'text',
                        position: [0, 50, 100, 100 / 12],
                        color: '#ffffff',
                        value: 'Team Name'
                    }
                ]
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
            TIMER: {
                id: "timer",
                position: [2, 30, 15, 5],
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#00000080",
                    },
                    {
                        type: "text",
                        position: [5, 0, 90, 100],
                        color: "#ffffff"
                    }
                ]
            },
            MAP_AUTHOR: {
                id: "map_author",
                position: [80, 45, 20, 5],
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#00000080",
                    },
                    {
                        type: "box",
                        position: [0, 0, 0, 100],
                        stroke: "#ffffff",
                        width: 5
                    },
                    {
                        type: "text",
                        position: [5, 0, 90, 100],
                        value: "Map: ",
                        color: "#ffffff"
                    }
                ]
            },
            LOGO: {
                id: 'logo',
                position: [0, 5, 100, 20],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000080',
                    },
                    {
                        type: "box",
                        position: [44.5, 5, 3, 35],
                        fill: "#FFB4BB"
                    },
                    {
                        type: "box",
                        position: [48.5, 5, 3, 35],
                        fill: "#FFFFB9"
                    },
                    {
                        type: "box",
                        position: [52.5, 5, 3, 35],
                        fill: "#BAE1FF"
                    },
                    {
                        type: "text",
                        position: [44.5, 5, 3, 35],
                        value: "C",
                        color: "#000000"
                    },
                    {
                        type: "text",
                        position: [48.5, 5, 3, 35],
                        value: "T",
                        color: "#000000"
                    },
                    {
                        type: "text",
                        position: [52.5, 5, 3, 35],
                        value: "F",
                        color: "#000000"
                    },
                    {
                        type: "text",
                        position: [30, 42.5, 40, 17.5],
                        value: "⚐ Capture The Flag ⚐",
                        color: "#ffffff"
                    },
                    {
                        type: "text",
                        position: [30, 62.5, 40, 15],
                        value: "Version 3.0.0",
                        color: "#00ff00"
                    },
                    {
                        type: "text",
                        position: [30, 80, 40, 15],
                        value: "Reworked by JavRedstone",
                        color: "#ffffff"
                    }
                ]
            },
            WAITING_SCOREBOARD: {
                id: "scoreboard",
                visible: true,
                components: [
                    {
                        type: "text",
                        position: [5, 0, 90, 10],
                        value: "Waiting for more players...",
                        color: "#ffffff"
                    }
                ]
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
            CHOOSE_SHIP: {
                id: "choose_ship",
                position: [0, 30, 15, 40],
                clickable: true,
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 20],
                    },
                    {
                        type: "text",
                        position: [10, 2.5, 80, 15],
                        color: "#ffffff",
                    },
                    {
                        type: "box",
                        position: [0, 20, 100, 80],
                        fill: "#00000080",
                    },
                    {
                        type: "text",
                        position: [10, 30, 80, 10],
                        value: "Ship Name",
                        color: "#ffffff80"
                    },
                    {
                        type: "box",
                        position: [10, 41, 80, 0],
                        stroke: "#ffffff",
                        width: 1
                    },
                    {
                        type: "text",
                        position: [10, 42.5, 80, 25],
                        color: "#ffffff"
                    },
                    {
                        type: "text",
                        position: [10, 70, 80, 10],
                        value: "Ship Origin",
                        color: "#ffffff80"
                    },
                    {
                        type: "box",
                        position: [10, 81, 80, 0],
                        stroke: "#ffffff",
                        width: 1
                    },
                    {
                        type: "text",
                        position: [30, 82.5, 35, 15],
                        color: "#ffffff"
                    },
                ]
            },
            CHOOSE_SHIP_TIME: {
                id: "choose_ship_time",
                position: [25, 75, 50, 10],
                visible: true,
                components: [
                    {
                        type: "text",
                        position: [0, 0, 100, 100],
                        color: "#ffffff"
                    }
                ]
            },
            ROUND_SCORES: {
                id: "round_scores",
                position: [40, 5, 20, 15],
                visible: true,
                components: [
                    {
                        type: "text",
                        position: [0, 10, 100, 20]
                    },
                    {
                        type: "text",
                        position: [5, 0, 25, 100],
                    },
                    {
                        type: "text",
                        position: [25, 0, 50, 100],
                        value: "-",
                        color: "#ffffffBF"
                    },
                    {
                        type: "text",
                        position: [70, 0, 25, 100],
                    }
                ]
            },
            TOTAL_SCORES: {
                id: "total_scores",
                position: [45, 17.5, 10, 10],
                visible: true,
                components: [
                    {
                        type: "text",
                        position: [0, 0, 100, 25],
                        value: "TOTAL",
                        color: "#ffffffBF"
                    },
                    {
                        type: "text",
                        position: [0, 0, 25, 100],
                        color: "#ffffffBF"
                    },
                    {
                        type: "text",
                        position: [25, 0, 50, 100],
                        value: "-",
                        color: "#ffffff80"
                    },
                    {
                        type: "text",
                        position: [75, 0, 25, 100],
                        color: "#ffffffBF"
                    }
                ]
            },
            PORTAL_COOLDOWN: {
                id: 'portal_cooldown',
                position: [57.5, 7.5, 20, 5],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [100, 0, 0, 100],
                        width: 5
                    },
                    {
                        type: 'text',
                        position: [5, 0, 90, 50],
                        value: 'Portal cooldown',
                        align: 'right',
                        color: '#ffffff'
                    },
                    {
                        type: 'text',
                        position: [5, 50, 90, 50],
                        align: 'right',
                        color: '#ffffff'
                    }
                ]
            },
        },
        TICKS: {
            WARNING: 600,
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

class GameMap {
    name = '';
    author = '';
    map = '';
    spawnArea = [];
    gridObjs = [];
    flags = [];
    portals = [];
    spawns = [];
    tiers = [];
    asteroidPaths = [];

    tier = 0;

    static C = {
        WAITING_MAP: {
            name: 'Tunnels',
            author: 'SChickenMan',
            map: '   99999999999999    99999999999999   9999999999999999999   \n' +
                '    9999999999999    99999999999999   999999999999999999    \n' +
                '      99999999999     9999999999999   99999999999999999     \n' +
                '       999999          99999999999    999999999999999       \n' +
                '9                      99999999999     9999999999999       9\n' +
                '999                     99999999999    999999999999       99\n' +
                '9999            9999    99999999999    99999999999      9999\n' +
                '99999     9999999999     9999999999    9999999999      99999\n' +
                '999999     9999999999     999999999    9999999999     999999\n' +
                '9999999    9999999999      99999999    9999999999    9999999\n' +
                '9999999     9999999999      9999999     999999999     999999\n' +
                '99999999    99999999999      9999999    999999999      99999\n' +
                '99999999    9999999999        999999     999999999     99999\n' +
                '9999999     999999999           99999     999999999     9999\n' +
                '999999      99999999     9        999     9999999999    9999\n' +
                '99999      99999999      99         99    9999999999    9999\n' +
                '9999      999999999     99999                  999999    999\n' +
                '  99     999999999     99999999                  9999       \n' +
                '        999999999     999999999999                99        \n' +
                '       9999999999     999999999999999999                    \n' +
                '         99999       999999999999999999     99              \n' +
                '999                 999999999999999999      999        99999\n' +
                '9999                999999999999999999     99999      999999\n' +
                '99999                999999999999999      99999999    999999\n' +
                '99999        9999    99999999999999      999999999     99999\n' +
                '99999    99999999    99999999999999      9999999999     9999\n' +
                '9999    9999999999    99999999999      9999999999999    9999\n' +
                '9999    9999999999    9999999999      99999999999999    9999\n' +
                '9999    9999999999     99999       999999999999999999   9999\n' +
                '999    999999999999    9999       999999999999999999    9999\n' +
                '999    999999999999      99      9999999999999999999    9999\n' +
                '999    99999999999              99999999999999999999    9999\n' +
                '999    9999999999              99999999999999999999    99999\n' +
                '999    999999999               99999999999999999999    99999\n' +
                '9999   999999999     9999999    9999999999999999999    99999\n' +
                '9999   99999999     99999999     9999999999999999     999999\n' +
                '9999    9999999    9999999999     99999999999999      999999\n' +
                '9999     999999    9999999999      99999999999      99999999\n' +
                '99999     99999   999999999999      999999999       99999999\n' +
                '99999     99999   9999999999         9999999        99999999\n' +
                '999999     999    999999999           99999         99999999\n' +
                '9999999     99    9999999       9       9       9    9999999\n' +
                '9999999      9   9999999       999             99    9999999\n' +
                '99999999         999999       99999           999     999999\n' +
                '9999999          9999        99999999       999999    999999\n' +
                '999999           999          99999999999999999999     99999\n' +
                '999999           9             99999999999999999999    99999\n' +
                '999999    9999          99      9999999999999999999    99999\n' +
                '999999   99999         9999       999999999999999999   99999\n' +
                '999999   99999       9999999       99999999999999999   99999\n' +
                '999999   999999     9999999999      9999999999999999   99999\n' +
                '99999    999999    999999999999     999999999999999    99999\n' +
                '99999    9999999   9999999999999            999999     99999\n' +
                '9999     9999999    9999999999999                      99999\n' +
                '999     999999999   9999999999999                        999\n' +
                '99      999999999   9999999999999     999                 99\n' +
                '9      9999999999   99999999999999   9999999999999999      9\n' +
                '      99999999999   99999999999999   99999999999999999      \n' +
                '     999999999999   99999999999999    99999999999999999     \n' +
                '    9999999999999   999999999999999   999999999999999999    ',
            flags: [],
            portals: [],
            spawns: [],
            tiers: [6],
            asteroids: []
        },
        TEST_MAPS: [
            {
                name: "Testing V1",
                author: "JavRedstone",
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9999999999999999999999999          9999999999999999999999999\n" +
                    "9999999999999999999999999          9999999999999999999999999\n" +
                    "9999999999999999999999999          9999999999999999999999999\n" +
                    "9999999999999999999999999  9    9  9999999999999999999999999\n" +
                    "9999999999999999999999999  9    9  9999999999999999999999999\n" +
                    "9999999999999999999999999  9    9  9999999999999999999999999\n" +
                    "9999999999999999999999999  9    9  9999999999999999999999999\n" +
                    "9999999999999999999999999          9999999999999999999999999\n" +
                    "9999999999999999999999999          9999999999999999999999999\n" +
                    "9999999999999999999999999          9999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -15,
                    y: 0
                }, {
                    x: 15,
                    y: 0
                }],
                portals: [],
                spawns: [{
                    x: -45,
                    y: 0
                }, {
                    x: 45,
                    y: 0
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Testing V2",
                author: "JavRedstone",
                map: "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            \n" +
                    "                                                            ",
                flags: [{
                    x: -60,
                    y: 0
                }, {
                    x: 60,
                    y: 0
                }],
                portals: [
                    {
                        x: 0,
                        y: 50
                    },
                    {
                        x: 0,
                        y: -50
                    }
                ],
                spawns: [{
                    x: -45,
                    y: 0
                }, {
                    x: 45,
                    y: 0
                }],
                tiers: [],
                asteroids: []
            }
        ],
        MAPS: [
            {
                name: "Triangles",
                author: "JavRedstone",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "9                99999999999999999999999999                9\n"+
                    "9 9999 9999 9999999         9999         9999999 9999 9999 9\n"+
                    "9 9 9   9 9 9  999                        999  9 9 9   9 9 9\n"+
                    "9 99     99 9 999    9                9    999 9 99     99 9\n"+
                    "9 9  999  9 9999    99999999999999999999    9999 9  999  9 9\n"+
                    "9    99 9   999       999  999999  999       999   9 99    9\n"+
                    "9 9  9 99  9999999     99   9999   99     9999999  99 9  9 9\n"+
                    "9 99  999 9999          9          9          9999 999  99 9\n"+
                    "9 9 9    99999      9                  9      99999    9 9 9\n"+
                    "9 9999  999 99     999    99    99    999     99 999  9999 9\n"+
                    "9      999  99    99999    99  99    99999    99  999      9\n"+
                    "9 999999999999   9999999    9  9    9999999   999999999999 9\n"+
                    "9 9  999999999                                999999999  9 9\n"+
                    "9 9 999                                              999 9 9\n"+
                    "9 9999                                                9999 9\n"+
                    "9 999        9   9999999   9    9   9999999   9        999 9\n"+
                    "9999   99     9   99999   9      9   99999   9     99   9999\n"+
                    "999     99     9   999   9        9   999   9     99     999\n"+
                    "999      99     9   9   9    99    9   9   9     99      999\n"+
                    "999       99                9999                99       999\n"+
                    "999      99                99  99                99      999\n"+
                    "999     99                995  599                99     999\n"+
                    "999    99                99  55  99                99    999\n"+
                    "99    999                99  55  99                999    99\n"+
                    "9     999     99          995  599          99     999     9\n"+
                    "      999    99    9       99  99       9    99    999      \n"+
                    "     9999   99    99  9     9999     9  99    99   9999     \n"+
                    "    99 99   99   999  99     99     99  999   99   99 99    \n"+
                    "   99  99   99  9999  999    99    999  9999  99   99  99   \n"+
                    "   99  99   99  9999  999    99    999  9999  99   99  99   \n"+
                    "    99 99   99   999  99     99     99  999   99   99 99    \n"+
                    "     9999   99    99  9     9999     9  99    99   9999     \n"+
                    "      999    99    9       99  99       9    99    999      \n"+
                    "9     999     99          995  599          99     999     9\n"+
                    "99    999                99  55  99                999    99\n"+
                    "999    99                99  55  99                99    999\n"+
                    "999     99                995  599                99     999\n"+
                    "999      99                99  99                99      999\n"+
                    "999       99                9999                99       999\n"+
                    "999      99     9   9   9    99    9   9   9     99      999\n"+
                    "999     99     9   999   9        9   999   9     99     999\n"+
                    "9999   99     9   99999   9      9   99999   9     99   9999\n"+
                    "9 999        9   9999999   9    9   9999999   9        999 9\n"+
                    "9 9999                                                9999 9\n"+
                    "9 9 999                                              999 9 9\n"+
                    "9 9  999999999                                999999999  9 9\n"+
                    "9 999999999999   9999999    9  9    9999999   999999999999 9\n"+
                    "9      999  99    99999    99  99    99999    99  999      9\n"+
                    "9 9999  999 99     999    99    99    999     99 999  9999 9\n"+
                    "9 9 9    99999      9                  9      99999    9 9 9\n"+
                    "9 99  999 9999          9          9          9999 999  99 9\n"+
                    "9 9  9 99  9999999     99   9999   99     9999999  99 9  9 9\n"+
                    "9    99 9   999       999  999999  999       999   9 99    9\n"+
                    "9 9  999  9 9999    99999999999999999999    9999 9  999  9 9\n"+
                    "9 99     99 9 999    9                9    999 9 99     99 9\n"+
                    "9 9 9   9 9 9  999                        999  9 9 9   9 9 9\n"+
                    "9 9999 9999 9999999         9999         9999999 9999 9999 9\n"+
                    "9                99999999999999999999999999                9\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: 0,
                    y: -210
                }, {
                    x: 0,
                    y: 210
                }],
                portals: [
                    {
                        x: -100,
                        y: -70
                    },
                    {
                        x: 100,
                        y: -70
                    },
                    {
                        x: -100,
                        y: 70
                    },
                    {
                        x: 100,
                        y: 70
                    },
                ],
                spawns: [{
                    x: 0,
                    y: -260
                }, {
                    x: 0,
                    y: 260
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Square Roundabout",
                author: "JavRedstone",
                map: "9999999999999999999997999    99    9999999999999999999999999\n"+
                    "97      79    99  9977779          9777799  99    97      79\n"+
                    "9 7    7 9    99999975579          9755799  99    9 7    7 9\n"+
                    "9  7  7  9    99  9975579          9755799  99    9  7  7  9\n"+
                    "9   77   9    99999975579          97557999999    9   77   9\n"+
                    "9   77   9    99999977779          97777999999    9   77   9\n"+
                    "9  7  7  9    99  9999999          9999999  99    9  7  7  9\n"+
                    "9 7    7 9    999999                    99  99    9 7    7 9\n"+
                    "97      79    99  99                    99  99    97      79\n"+
                    "99999999999999999999      99999999      999999    9999999999\n"+
                    "9        99999999999       999999       999999   7         9\n"+
                    "9        99    99999        9999            99  7          9\n"+
                    "9        99     999          99             99 7           9\n"+
                    "9        99      9                          997            9\n"+
                    "99999999999                                 9999999999999999\n"+
                    "999999999999                                9999999999999999\n"+
                    "9   99   9999     99                             99 9 99 9 9\n"+
                    "9   99   99999   99          99                  99 9 99 9 9\n"+
                    "9999999999999   99    9999999999                 99999999999\n"+
                    "977799999999    9      999999  99     99         99999999999\n"+
                    "9777779                 9999    99    99             9777779\n"+
                    "9755579                  99      99                  9755579\n"+
                    "9755579           9     999       99     99          9755579\n"+
                    "9777779           99   999         99    99          9777779\n"+
                    "9999999           999 9977777777777799               9999999\n"+
                    "                  9999997    55    7 99     99              \n"+
                    "                  99999 7   5  5   7  99    99              \n"+
                    "                  999   7  5    5  7   99                   \n"+
                    "       9          99    7 5 3333 5 7    99          9       \n"+
                    "99999999         99     75  3  3  57     99         99999999\n"+
                    "99999999         99     75  3  3  57     99         99999999\n"+
                    "       9          99    7 5 3333 5 7    99          9       \n"+
                    "                   99   7  5    5  7   999                  \n"+
                    "              99    99  7   5  5   7 99999                  \n"+
                    "              99     99 7    55    7999999                  \n"+
                    "9999999               9977777777777799 999           9999999\n"+
                    "9777779          99    99         999   99           9777779\n"+
                    "9755579          99     99       999     9           9755579\n"+
                    "9755579                  99      99                  9755579\n"+
                    "9777779             99    99    9999                 9777779\n"+
                    "99999999999         99     99  999999      9    999999999999\n"+
                    "99999999999                 9999999999    99   9999999999999\n"+
                    "9 9 99 9 99                  99          99   99999   99   9\n"+
                    "9 9 99 9 99                             99     9999   99   9\n"+
                    "9999999999999999                                999999999999\n"+
                    "9999999999999999                                 99999999999\n"+
                    "9            799                          9      99        9\n"+
                    "9           7 99             99          999     99        9\n"+
                    "9          7  99            9999        99999    99        9\n"+
                    "9         7   999999       999999       99999999999        9\n"+
                    "9999999999    999999      99999999      99999999999999999999\n"+
                    "97      79    99  99                    99  99    97      79\n"+
                    "9 7    7 9    99  99                    999999    9 7    7 9\n"+
                    "9  7  7  9    99  9999999          9999999  99    9  7  7  9\n"+
                    "9   77   9    99999977779          97777999999    9   77   9\n"+
                    "9   77   9    99999975579          97557999999    9   77   9\n"+
                    "9  7  7  9    99  9975579          9755799  99    9  7  7  9\n"+
                    "9 7    7 9    99  9975579          97557999999    9 7    7 9\n"+
                    "97      79    99  9977779          9777799  99    97      79\n"+
                    "9999999999999999999999999    99    9999999999999999999999999",
                flags: [{
                    x: -160,
                    y: 160
                }, {
                    x: 160,
                    y: -160
                }],
                portals: [
                    {
                        x: 150,
                        y: 100
                    },
                    {
                        x: -150,
                        y: -100,
                    }
                ],
                spawns: [{
                    x: -90,
                    y: 90
                }, {
                    x: 90,
                    y: -90
                }],
                tiers: [4, 5, 6],
                asteroids: []
            },
            {
                name: "CTF",
                author: "JavRedstone",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "933333333333333333339333333333333333333393333333333333333333\n"+
                    "937777737777737777739377777377777377777393777773777773777773\n"+
                    "937333333373337333339373333333733373333393733333337333733333\n"+
                    "937333333373337777739373333333733377777393733333337333777773\n"+
                    "937333333373337333339373333333733373333393733333337333733333\n"+
                    "937777733373337333339377777333733373333393777773337333733333\n"+
                    "933333333333333333339333333333333333333393333333333333333333\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "9                                                          9\n"+
                    "9                                                          9\n"+
                    "9                                                          9\n"+
                    "9                                                          9\n"+
                    "9                  99                   99                 9\n"+
                    "9                99999                 99999               9\n"+
                    "9              99955599               99555999             9\n"+
                    "9            99955555599             99555555999           9\n"+
                    "9          99955555555599           99555555555999         9\n"+
                    "9        99955555555555599         99555555555555999       9\n"+
                    "9       9975555555555555999       9995555555555557799      9\n"+
                    "9        9975555555555999 99     99 9995555555557597       9\n"+
                    "9         9975555577999    99   99    9977555557599        9\n"+
                    "9          9975577999       99 99       9977557599         9\n"+
                    "99          9977999          999          9977599         99\n"+
                    "999          9999            999            9999         999\n"+
                    "999999        9             99 99             9       999999\n"+
                    "                           99   99                          \n"+
                    "                          99     99                         \n"+
                    "                    9999999       999999                    \n"+
                    "                      9999         999                      \n"+
                    "                      999           99                      \n"+
                    "999999            9   99             99  9            999999\n"+
                    "999               9  99       999     99 9               999\n"+
                    "99       9        9 99        95999    999        9       99\n"+
                    "9       99        999         9555999   99        99       9\n"+
                    "9      9 9        99          955555999  99       9 9      9\n"+
                    "9      9 9       99           955555559   99      9 9      9\n"+
                    "9      99       99            999555759    99      99      9\n"+
                    "9      9       99             9 9995559     99      9      9\n"+
                    "9      9                      9   99959             9      9\n"+
                    "9      9                      9     999             9      9\n"+
                    "99                            9                           99\n"+
                    "999                         99999                        999\n"+
                    "9 99                     9999 9 9999                    99 9\n"+
                    "9  99                  999   797   999                 99  9\n"+
                    "9   99                99    7 9 7    99               99   9\n"+
                    "9    99               999    797    999              99    9\n"+
                    "9     99              9  999     999  9             99     9\n"+
                    "9      99             99    99999    99            99      9\n"+
                    "9       99             999         999            99       9\n"+
                    "9 777777 99              9999   9999             99 777777 9\n"+
                    "9 733337  99                99999               99  733337 9\n"+
                    "9 733337   99                                  99   733337 9\n"+
                    "9 777777    99                                99    777777 9\n"+
                    "9      7     99                              99     7      9\n"+
                    "9      7      99                            99      7      9\n"+
                    "9      7       99                          99       7      9\n"+
                    "9      7        99                        99        7      9\n"+
                    "9                99                      99                9\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -40,
                    y: 60
                }, {
                    x: 40,
                    y: 60
                }],
                portals: [
                    {
                        x: 5,
                        y: 150
                    },
                    {
                        x: 5,
                        y: -250
                    }
                ],
                spawns: [{
                    x: -90,
                    y: 0
                }, {
                    x: 90,
                    y: 0
                }],
                tiers: [4, 5, 6],
                asteroids: []
            },
            {
                name: "Plinko",
                author: "Robonuko",
                map: "335579999999999999999933399939939993339999999999999999975533\n"+
                    "355799999999999999999999939399993939999999999999999999997553\n"+
                    "5579999999          99999939999993999999          9999999755\n"+
                    "779999 99            999399939939993999            99 999977\n"+
                    "779999999            999339339933933999            999999977\n"+
                    "779999 99            999933399993339999            99 999977\n"+
                    "577999999            999993999999399999            999999775\n"+
                    "357799 99  999  999  999999999999999999  999  999  99 997753\n"+
                    "355799999  999  999  999 7999779997 999  999  999  999997553\n"+
                    "557799999  999  999  999  999  999  999  999  999  999997755\n"+
                    "55799999    7    9    9    9    9    9    9    7    99999755\n"+
                    "5799999          7    7    7    7    7    7          9999975\n"+
                    "799999                                                999997\n"+
                    "99999                                                  99999\n"+
                    "9999    898   99   99   99   99   99   99   99   988    9999\n"+
                    "999      9    89    8    9   89   9    8    98    9      999\n"+
                    "999                                                      999\n"+
                    "9999                                                    9999\n"+
                    "99999                                                  99999\n"+
                    "9  998  99    99    99    99    99    99    99    99  899  9\n"+
                    "9  998  9     99    9     99    99     9    99     9  899  9\n"+
                    "99999                                                  99999\n"+
                    "9999                         99                         9999\n"+
                    "999                          999                         999\n"+
                    "99   98    89    88          9979        88    98    89   99\n"+
                    "99   9      9    99          88579       99    9      9   99\n"+
                    "999                          994579                      999\n"+
                    "9999                        99994579                    9999\n"+
                    "99999                      9955994579                  99999\n"+
                    "9  998  99    89999999998999555599989999999998    99  899  9\n"+
                    "9  998  99    89999999998999555599989999999998    99  899  9\n"+
                    "99999                  9754995599                      99999\n"+
                    "9999                    97549999                        9999\n"+
                    "999                      975499                          999\n"+
                    "99   9      9    89       97588          99    9      9   99\n"+
                    "99   98    89    88        9799          88    98    89   99\n"+
                    "999                         999                          999\n"+
                    "9999                         99                         9999\n"+
                    "99999                                                  99999\n"+
                    "9  998  9     98    9     99    99     9    99     9  899  9\n"+
                    "9  998  99    99    99    99    99    98    98    99  899  9\n"+
                    "99999                                                  99999\n"+
                    "9999                                                    9999\n"+
                    "999                                                      999\n"+
                    "999      9    89    8    9   99   9    8    98    9      999\n"+
                    "9999    899   99   99   99   99   99   99   99   998    9999\n"+
                    "99999                                                  99999\n"+
                    "799999                                                999997\n"+
                    "5799999          7    7    7    7    7    7          9999975\n"+
                    "55799999    7    9    9    9    9    9    9    7    99999755\n"+
                    "557799999  999  999  999  999  999  999  999  999  999997755\n"+
                    "355799999  999  999  999 7999779997 999  999  999  999997553\n"+
                    "357799 99  999  999  999999999999999999  999  999  99 997753\n"+
                    "577999999            999993999999399999            999999775\n"+
                    "779999 99            999933399993339999            99 999977\n"+
                    "779999999            999339339933933999            999999977\n"+
                    "779999 99            999399939939993999            99 999977\n"+
                    "5579999999          99999939999993999999          9999999755\n"+
                    "355799999999999999999999939399993939999999999999999999997553\n"+
                    "335579999999999999999933399939939993339999999999999999975533",
                flags: [{
                    x: 150,
                    y: 250
                }, {
                    x: -150,
                    y: -250
                }],
                portals: [
                    {
                        x: -60,
                        y: 60
                    },
                    {
                        x: 60,
                        y: -60
                    },
                ],
                spawns: [{
                    x: -150,
                    y: 250
                }, {
                    x: 150,
                    y: -250
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Cutoff",
                author: "JavRedstone",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "9   999  999  9999999999999999999999999999999999999999999999\n"+
                    "9   999  999  9999999  9999 99999999999999999999999999999999\n"+
                    "9   99999999999999999  999   9999999999999999999999999999999\n"+
                    "9999999999999999999999999     999999999999999999999999999999\n"+
                    "99999               9999   9   99999999999999999999999999999\n"+
                    "99999               999   999   9999999999999999999999999999\n"+
                    "9  99               99    9999   9999999999999999999 9999999\n"+
                    "9  99   999999999   9      9999   9999999999999999  99999999\n"+
                    "99999   999                 9999   999999999999999  99999999\n"+
                    "99999   99                   9999   99999999999   9999999999\n"+
                    "99999   9                     9999   9999999999   9999999999\n"+
                    "9  99   9        99            9999   999999999   9999999999\n"+
                    "9  99   9    8   99      99     9999   999999999999999999999\n"+
                    "99999   9     999      9999      9999         99999999999999\n"+
                    "99999   9     999      9 9        9999        99999999999999\n"+
                    "99999   9     999     9999         9999       99999999999999\n"+
                    "99999       99   9    99  9         999       99999999999999\n"+
                    "99999       99    9        9                  99999999999999\n"+
                    "99999              9        9                 99999999999999\n"+
                    "999999999           9        9                99999999999999\n"+
                    "99  9999             9        9           99   9999999999999\n"+
                    "99  999         99    9        9    99    999   999999999999\n"+
                    "999999        9999     9        999999    9999   99999999999\n"+
                    "99999         9 9       99      97779      9999   9999999999\n"+
                    "9999         9999       99      97579       9999   999999999\n"+
                    "999   99     99  9              97779        9999   99999999\n"+
                    "99   9999         9            999999         9999   9999999\n"+
                    "999   9999         9           99    9         9999   999999\n"+
                    "9999   9999         9                 9         9999   99999\n"+
                    "99999   9999         9                 9         9999   9999\n"+
                    "999999   9999         9    99           9         9999   999\n"+
                    "9999999   9999         999999            9         9999   99\n"+
                    "99999999   9999        97779              9  99     99   999\n"+
                    "999999999   9999       97579      99       9999         9999\n"+
                    "9999999999   9999      97779      99       9 9         99999\n"+
                    "99999999999   9999    999999        9     9999        999999\n"+
                    "999999999999   999    99    9        9    99         999  99\n"+
                    "9999999999999   99           9        9             9999  99\n"+
                    "99999999999999                9        9           999999999\n"+
                    "99999999999999                 9        9              99999\n"+
                    "99999999999999                  9        9    99       99999\n"+
                    "99999999999999       999         9  99    9   99       99999\n"+
                    "99999999999999       9999         9999     999     9   99999\n"+
                    "99999999999999        9999        9 9      999     9   99999\n"+
                    "99999999999999         9999      9999      999     9   99999\n"+
                    "999999999999999999999   9999     99      99   8    9   99  9\n"+
                    "9999999999   999999999   9999            99        9   99  9\n"+
                    "9999999999   9999999999   9999                     9   99999\n"+
                    "9999999999   99999999999   9999                   99   99999\n"+
                    "99999999  999999999999999   9999                 999   99999\n"+
                    "99999999  9999999999999999   9999      9   999999999   99  9\n"+
                    "9999999 9999999999999999999   9999    99               99  9\n"+
                    "9999999999999999999999999999   999   999               99999\n"+
                    "99999999999999999999999999999   9   9999               99999\n"+
                    "999999999999999999999999999999     9999999999999999999999999\n"+
                    "9999999999999999999999999999999   999  99999999999999999   9\n"+
                    "99999999999999999999999999999999 9999  9999999  999  999   9\n"+
                    "9999999999999999999999999999999999999999999999  999  999   9\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -180,
                    y: 180
                }, {
                    x: 180,
                    y: -180
                }],
                portals: [
                    {
                        x: -120,
                        y: -120
                    },
                    {
                        x: 120,
                        y: 120
                    }
                ],
                spawns: [{
                    x: -230,
                    y: 230
                }, {
                    x: 230,
                    y: -230
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Machinery",
                author: "Robonuko",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "9999     99                                               99\n"+
                    "99999    99                                               99\n"+
                    "99 999   99     999999                   999   999        99\n"+
                    "99  999 999     99  999                  9       9        99\n"+
                    "99   9999       9   9999                 9       9        99\n"+
                    "99    99       99   99 99         9999               99   99\n"+
                    "99   99       999   99  99        9999               99   99\n"+
                    "999999     999999   9999999999  999  9                    99\n"+
                    "999999    99   99   9999999999  999  9   9       9        99\n"+
                    "99       999   99   999   9999  999999   9       9   99   99\n"+
                    "99       9     99                99999   999   999   99   99\n"+
                    "99       9      9                99999                    99\n"+
                    "99      99                       99 999                   99\n"+
                    "99     999999       999   9999  999  999999         9999  99\n"+
                    "99  9999999999      9999999999  9999999999          9999  99\n"+
                    "99  99               99999999         99    9       9999  99\n"+
                    "99  9                                 99   99       9999  99\n"+
                    "99  9                           9     9    99             99\n"+
                    "99  9999999999999         9    999       9999             99\n"+
                    "99  99999999999999        9   99 99     999999            99\n"+
                    "99   99  99     99    99  9  99 9 99       9999999999     99\n"+
                    "99    99 99 99  99    99 99   99 99        9 9999   99999999\n"+
                    "99     9999 999 99      9999   999         9  999   99999999\n"+
                    "99      999  99 99     999999   9   999    9999999999     99\n"+
                    "99       99     99  999999  99     99 99   99999999       99\n"+
                    "99        99999999      99  99     9 9 9   999  999       99\n"+
                    "99       999999999       99999     99 99                  99\n"+
                    "99       999  999         999       999                   99\n"+
                    "99                   999       999         999  999       99\n"+
                    "99                  99 99     99999       999999999       99\n"+
                    "99       999  999   9 9 9     99  99      999999999       99\n"+
                    "99       99999999   99 99     99  999999  99     99       99\n"+
                    "99     9999999999    999   9   999999     99 99  999      99\n"+
                    "99999999   999  9         999   9999      99 999 9999     99\n"+
                    "99999999   9999 9        99 99   99 99    99  99 99 99    99\n"+
                    "99     9999999999       99 9 99  9  99    99     99  99   99\n"+
                    "99            999999     99 99   9        99999999999999  99\n"+
                    "99             9999       999    9         9999999999999  99\n"+
                    "99             99    9     9                           9  99\n"+
                    "99   9999      99   99                                 9  99\n"+
                    "99   9999      9    99         99999999               99  99\n"+
                    "99   9999         9999999999  9999999999      9999999999  99\n"+
                    "99   9999        999999  999  9999   999       999999     99\n"+
                    "99                   999 99                       99      99\n"+
                    "99                    99999                9      9       99\n"+
                    "99    99  999   999   99999                99     9       99\n"+
                    "99    99  9       9   999999  9999   999   99   999       99\n"+
                    "99        9       9   9  999  9999999999   99   99    999999\n"+
                    "99                    9  999  9999999999   999999     999999\n"+
                    "99    99              9999        99  99   999       99   99\n"+
                    "99    99              9999         99 99   99       99    99\n"+
                    "99        9       9                 9999   9       9999   99\n"+
                    "99        9       9                  999  99     999 999  99\n"+
                    "99        999   999                   999999     99   999 99\n"+
                    "99                                               99    99999\n"+
                    "99                                               99     9999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -170,
                    y: 170
                }, {
                    x: 170,
                    y: -170
                }],
                portals: [
                    {
                        x: -155,
                        y: -215
                    },
                    {
                        x: 155,
                        y: 215
                    }
                ],
                spawns: [{
                    x: -210,
                    y: 210
                }, {
                    x: 210,
                    y: -210
                }],
                tiers: [3, 4, 5],
                asteroids: []
            },
            {
                name: "Highway",
                author: "Gummie",
                map: "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999                                        9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999           99                    99           9999999\n" +
                    "999999            99                    99            999999\n" +
                    "99999                                                  99999\n" +
                    "99999                        99                        99999\n" +
                    "9999                         99                         9999\n" +
                    "9999                         99                         9999\n" +
                    "9999                         99                         9999\n" +
                    "9999                         99                         9999\n" +
                    "99999                        99                        99999\n" +
                    "99999                                                  99999\n" +
                    "999999            99                    99            999999\n" +
                    "9999999           99                    99           9999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                   99                   9999999999\n" +
                    "9999999999                                        9999999999\n" +
                    "9999999999        99                    99        9999999999\n" +
                    "9999999999        99                    99        9999999999",
                flags: [{
                    x: -200,
                    y: 0
                }, {
                    x: 200,
                    y: 0
                }],
                portals: [
                    {
                        x: 0,
                        y: -180
                    },
                    {
                        x: 0,
                        y: 180
                    }
                ],
                spawns: [{
                    x: 105,
                    y: 125
                }, {
                    x: -105,
                    y: -125
                }],
                tiers: [],
                asteroids: [
                    { x: -180, y: 280, vx: 0, vy: 0.7, size: 40 },
                    { x: -140, y: 295, vx: 0, vy: -0.9, size: 40 },
                    { x: -75, y: 250, vx: 0, vy: 0.7, size: 40 },
                    { x: -35, y: 200, vx: 0, vy: -0.8, size: 40 },
                    { x: 35, y: 225, vx: 0, vy: 0.9, size: 40 },
                    { x: 75, y: 290, vx: 0, vy: 0.7, size: 40 },
                    { x: 140, y: 100, vx: 0, vy: 0.8, size: 40 },
                    { x: 180, y: 50, vx: 0, vy: -0.8, size: 40 }
                ]
            },
            {
                name: "Dimension 2.0",
                author: "Liberal",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999              9999\n"+
                    "99999999999999999999999999999999999999999                999\n"+
                    "9999999999999999999999999999999999999999    999999        99\n"+
                    "99999999999999999999                       99999999       99\n"+
                    "9999999999999999999                              99       99\n"+
                    "999999999999999999                                99      99\n"+
                    "99999999999999999                                  99     99\n"+
                    "9999999999999999                                    999   99\n"+
                    "999999999999999        99999    9999999999           999  99\n"+
                    "99999999999999        999999    99999999999   999     99  99\n"+
                    "9999999999999        999                999    99     99  99\n"+
                    "999999999999        999                 999     9     99  99\n"+
                    "99999999999        999                 999            99  99\n"+
                    "9999999999         999                999             99  99\n"+
                    "999999999           999              999              9   99\n"+
                    "99999999             9              999       999         99\n"+
                    "9999999                            999       99999       999\n"+
                    "999999        99         9        999       999999      9999\n"+
                    "99999        9999       999      999         9  99     99999\n"+
                    "99999       999999       999      9             99     99999\n"+
                    "99999      999  999       999            9      99     99999\n"+
                    "99999     999    999       9999         999     99     99999\n"+
                    "99999     99      999       9999       999      99     99999\n"+
                    "99999     99       9         99       999       99     99999\n"+
                    "99999     99                         999        99     99999\n"+
                    "99999     99           9            999         99     99999\n"+
                    "99999                 999          999                 99999\n"+
                    "99999                  999        999                  99999\n"+
                    "99999                  999        999                  99999\n"+
                    "99999                 999          999                 99999\n"+
                    "99999     99         999            9           99     99999\n"+
                    "99999     99        999                         99     99999\n"+
                    "99999     99       999       99         9       99     99999\n"+
                    "99999     99      999       9999       999      99     99999\n"+
                    "99999     99     999         9999       999     99     99999\n"+
                    "99999     99      9            999       999  999      99999\n"+
                    "99999     99             9      999       999999       99999\n"+
                    "99999     99  9         999      999       9999        99999\n"+
                    "9999      999999       999        9         99        999999\n"+
                    "999       99999       999                            9999999\n"+
                    "99         999       999              9             99999999\n"+
                    "99   9              999              999           999999999\n"+
                    "99  99             999                999         9999999999\n"+
                    "99  99            999                 999        99999999999\n"+
                    "99  99     9     999                 999        999999999999\n"+
                    "99  99     99    999                999        9999999999999\n"+
                    "99  99     999   99999999999    999999        99999999999999\n"+
                    "99  999           9999999999    99999        999999999999999\n"+
                    "99   999                                    9999999999999999\n"+
                    "99     99                                  99999999999999999\n"+
                    "99      99                                999999999999999999\n"+
                    "99       99                              9999999999999999999\n"+
                    "99       99999999                       99999999999999999999\n"+
                    "99        999999    9999999999999999999999999999999999999999\n"+
                    "999                99999999999999999999999999999999999999999\n"+
                    "9999              999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -235,
                    y: -235
                }, {
                    x: 235,
                    y: 235
                }],
                portals: [
                    {
                        x: -140,
                        y: 0
                    },
                    {
                        x: 140,
                        y: 0
                    },
                    {
                        x: 0,
                        y: -140
                    },
                    {
                        x: 0,
                        y: 140
                    }
                ],
                spawns: [{
                    x: -195,
                    y: -195
                }, {
                    x: 195,
                    y: 195
                }],
                tiers: [5, 6],
                asteroids: []
            },
            {
                name: "Walls",
                author: "Healer",
                map: "9999999999       9999999999      9999999999       9999999999\n"+
                    "99999999999     999999999999    999999999999     99999999999\n"+
                    "9         99                                    99         9\n"+
                    "9 9999999999   9999999999999    9999999999999   9999999999 9\n"+
                    "9 9999999999    999999999999    999999999999    9999999999 9\n"+
                    "9 99      99             99      99             99      99 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                       99    99                       9 9\n"+
                    "9 9      999    9999999999999  9999999999999    999      9 9\n"+
                    "9 9     9999                                    9999     9 9\n"+
                    "9 9   999999                                    999999   9 9\n"+
                    "9 9   999999   99999999999999  99999999999999   999999   9 9\n"+
                    "999   99999     9999999999999  9999999999999     99999   999\n"+
                    "9     9999              99999  99999              9999     9\n"+
                    "9      999               999    999               999      9\n"+
                    "9      999      999999                999999      999      9\n"+
                    "9     9999                   99                   9999     9\n"+
                    "9    9999                9   99   9                9999    9\n"+
                    "9     99           99    9   99   9    99           99     9\n"+
                    "9  9   9          99     9   99   9     99          9   9  9\n"+
                    "99999        999999      9        9      999999        99999\n"+
                    "999999                                                999999\n"+
                    "9999                 99    99  99    99                 9999\n"+
                    "999      99999       9    999  999    9       99999      999\n"+
                    "99      99999        9    99    99    9        99999      99\n"+
                    "99      99           9    99    99    9           99      99\n"+
                    "99     99         9       99    99       9         99     99\n"+
                    "99      9         9       9      9       9         9      99\n"+
                    "99      9         9          99          9         9      99\n"+
                    "99      9         9          99          9         9      99\n"+
                    "99      9         9       9      9       9         9      99\n"+
                    "99     99         9       99    99       9         99     99\n"+
                    "99      99           9    99    99    9           99      99\n"+
                    "99      99999        9    99    99    9        99999      99\n"+
                    "999      99999       9    999  999    9       99999      999\n"+
                    "9999                 99    99  99    99                 9999\n"+
                    "999999                                                999999\n"+
                    "99999        999999      9        9      999999        99999\n"+
                    "9  9   9          99     9   99   9     99          9   9  9\n"+
                    "9     99           99    9   99   9    99           99     9\n"+
                    "9    9999                9   99   9                9999    9\n"+
                    "9     9999                   99                   9999     9\n"+
                    "9      999      999999                999999      999      9\n"+
                    "9      999               999    999               999      9\n"+
                    "9     9999              99999  99999              9999     9\n"+
                    "999   99999     9999999999999  9999999999999     99999   999\n"+
                    "9 9   999999   99999999999999  99999999999999   999999   9 9\n"+
                    "9 9   999999                                    999999   9 9\n"+
                    "9 9     9999                                    9999     9 9\n"+
                    "9 9      999    9999999999999  9999999999999    999      9 9\n"+
                    "9 9                       99    99                       9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 99      99             99      99             99      99 9\n"+
                    "9 9999999999    999999999999    999999999999    9999999999 9\n"+
                    "9 9999999999   9999999999999    9999999999999   9999999999 9\n"+
                    "9         99                                    99         9\n"+
                    "99999999999     999999999999    999999999999     99999999999\n"+
                    "9999999999       9999999999      9999999999       9999999999",
                flags: [{
                    x: -185,
                    y: 0
                }, {
                    x: 185,
                    y: 0
                }],
                portals: [],
                spawns: [{
                    x: -245,
                    y: 0
                }, {
                    x: 245,
                    y: 0
                }],
                tiers: [5, 6],
                asteroids: []
            },
            {
                name: "Dots",
                author: "Healer",
                map: "9  999999999999999999999999999999999999999999999999999999  9\n"+
                    "   993566533364536434555539999999935555434635463335665399   \n"+
                    "    9999999999999999999999999  9999999999999999999999999    \n"+
                    "                       9999      9999                       \n"+
                    "999999                9999        9999                999999\n"+
                    "9399999             79999    99    99997             9999939\n"+
                    "9399 99   99                9999                99   99 9939\n"+
                    "969       99               999999               99       969\n"+
                    "969        99            9999  9999            99        969\n"+
                    "949        999    9999999999    9999999999    999        949\n"+
                    "939         99    999                   99    99         939\n"+
                    "939                                                      939\n"+
                    "939  9999                                          9999  939\n"+
                    "939  9999     99       99          99       99     9999  939\n"+
                    "939            99      99          99      99            939\n"+
                    "969             99           99           99             969\n"+
                    "969                          99                          969\n"+
                    "959    999          99                99          999    959\n"+
                    "949     999         99999          99999         999     949\n"+
                    "939      999          999999    999999          999      939\n"+
                    "9399     9999    99                      99    9999     9939\n"+
                    "9499       999   99                      99   999       9949\n"+
                    "95999       999                              999       99959\n"+
                    "95999   99  999          999    999          999  99   99959\n"+
                    "9499    99   88           99999999           88   99    9949\n"+
                    "999           6    99       9999       99    6           999\n"+
                    "99                 99                  99                 99\n"+
                    "                                                            \n"+
                    "   9                                                    9   \n"+
                    "  999     99          99            99          99     999  \n"+
                    "  999     99          99            99          99     999  \n"+
                    "   9                                                    9   \n"+
                    "                                                            \n"+
                    "99                 99                  99                 99\n"+
                    "999           6    99       9999       99    6           999\n"+
                    "9499    99   88           99999999           88   99    9949\n"+
                    "95999   99  999          999    999          999  99   99959\n"+
                    "95999       999                              999       99959\n"+
                    "9499       999   99                      99   999       9949\n"+
                    "9399     9999    99                      99    9999     9939\n"+
                    "939      999          999999    999999          999      939\n"+
                    "949     999         99999          99999         999     949\n"+
                    "959    999          99                99          999    959\n"+
                    "969                          99                          969\n"+
                    "969             99           99           99             969\n"+
                    "939            99      99          99      99            939\n"+
                    "939  9999     99       99          99       99     9999  939\n"+
                    "939  9999                                          9999  939\n"+
                    "939                                                      939\n"+
                    "939         99    99                    99    99         939\n"+
                    "949        999    9999999999    9999999999    999        949\n"+
                    "969        99            9999  9999            99        969\n"+
                    "969       99               999999               99       969\n"+
                    "9399 99   99                9999                99   99 9939\n"+
                    "9399999             79999    99    99997             9999939\n"+
                    "999999                9999        9999                999999\n"+
                    "                       9999      9999                       \n"+
                    "    9999999999999999999999999  9999999999999999999999999    \n"+
                    "   993566533364536434555539999999935555434635463335665399   \n"+
                    "9  999999999999999999999999999999999999999999999999999999  9",
                flags: [{
                    x: 0,
                    y: -205
                }, {
                    x: 0,
                    y: 205
                }],
                portals: [
                    {
                        x: -140,
                        y: 0
                    },
                    {
                        x: 140,
                        y: 0
                    }
                ],
                spawns: [{
                    x: 0,
                    y: -265
                }, {
                    x: 0,
                    y: 265
                }],
                tiers: [5, 6],
                asteroids: []
            },
            {
                name: "Concentration",
                author: "Kirito",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "9999994 99  99  99  99  499999999994  99  99  99  99 4999999\n"+
                    "9999999 66  66  66  66   4999999994   66  66  66  66 9999999\n"+
                    "9994999                   49999994                   9994999\n"+
                    "999            9     9  9  444444  9  9     9            999\n"+
                    "999              9                        9              999\n"+
                    "99996               9  9            9  9               69999\n"+
                    "99996                                                  69999\n"+
                    "999   9        94499999999        99999999449        9   999\n"+
                    "99996    9 99  9949999999          9999999499  99 9    69999\n"+
                    "99996      999999                          999999      69999\n"+
                    "999    9    9999                            9999    9    999\n"+
                    "999         999                              999         999\n"+
                    "99996   9 9999     99    9999999999    99     9999 9   69999\n"+
                    "99996 9   499     9999                9999     994   9 69999\n"+
                    "999       44     999                    999     44       999\n"+
                    "999    9  99    9997                    7999    99  9    999\n"+
                    "99996     99   999777                  777999   99     69999\n"+
                    "99996     99   99  777                777  99   99     69999\n"+
                    "999       99    9   777              777   9    99       999\n"+
                    "999                  779            977                  999\n"+
                    "99996                 99            99                 69999\n"+
                    "99996     79                                    97     69999\n"+
                    "999       798                                  897       999\n"+
                    "999         88            99    99            88         999\n"+
                    "9999         86           959    9           68         9999\n"+
                    "99999                      959                         99999\n"+
                    "9999996                     959                      6999999\n"+
                    "9999996                      959                     6999999\n"+
                    "99999                         959                      99999\n"+
                    "9999         86           9    959           68         9999\n"+
                    "999         88            99    99            88         999\n"+
                    "999       798                                  897       999\n"+
                    "99996     79                                    97     69999\n"+
                    "99996                 99            99                 69999\n"+
                    "999                  779            977                  999\n"+
                    "999       99    9   777              777   9    99       999\n"+
                    "99996     99   99  777                777  99   99     69999\n"+
                    "99996     99   999777                  777999   99     69999\n"+
                    "999    9  99    9997                    7999    99  9    999\n"+
                    "999       44     999                    999     44       999\n"+
                    "99996 9   499     9999                9999     994   9 69999\n"+
                    "99996   9 9999     99    9999999999    99     9999 9   69999\n"+
                    "999         999                              999         999\n"+
                    "999    9    9999                            9999    9    999\n"+
                    "99996      999999                          999999      69999\n"+
                    "99996    9 99  9949999999          9999999499  99 9    69999\n"+
                    "999   9        94499999999        99999999449        9   999\n"+
                    "99996                                                  69999\n"+
                    "99996               9  9            9  9               69999\n"+
                    "999              9                        9              999\n"+
                    "999            9     9  9  444444  9  9     9            999\n"+
                    "9994999                   49999994                   9994999\n"+
                    "9999999 66  66  66  66   4999999994   66  66  66  66 9999999\n"+
                    "9999994 99  99  99  99  499999999994  99  99  99  99 4999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -180,
                    y: 0
                }, {
                    x: 180,
                    y: 0
                }],
                portals: [
                    {
                        x: -210,
                        y: -210
                    },
                    {
                        x: -210,
                        y: 210
                    },
                    {
                        x: 210,
                        y: -210
                    },
                    {
                        x: 210,
                        y: 210
                    }
                ],
                spawns: [{
                    x: 0,
                    y: 210
                }, {
                    x: 0,
                    y: -210
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Temple",
                author: "Kirito",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "99     9999                                      9999     99\n"+
                    "99   9999                                          9999   99\n"+
                    "99 9999            9999999        9999999            9999 99\n"+
                    "99999            999999  9        9  999999            99999\n"+
                    "9999             99  99  9        9  99  99             9999\n"+
                    "9999         9   99  99999        99999  99   9         9999\n"+
                    "999          99  99  99999   99   99999  99  99          999\n"+
                    "999       9  99  999999  9  9999  9  999999  99  9       999\n"+
                    "999      99  99  9999      99  99      9999  99  99      999\n"+
                    "9999     99  99  99       99    99       99  99  99     9999\n"+
                    "99999    99  99          99      99          99  99    99999\n"+
                    "9999     99  9           9        9           9  99     9999\n"+
                    "999       9          9                9          9       999\n"+
                    "999              9                        9              999\n"+
                    "999                     9999    9999                     999\n"+
                    "999          9        999999    999999        9          999\n"+
                    "999               9   99  99    99  99   9               999\n"+
                    "999     99        99  99  99    99  99  99        99     999\n"+
                    "999    9999    9  99  99 999    999 99  99  9    9999    999\n"+
                    "999    999    99  99  9999        9999  99  99    999    999\n"+
                    "999    999    99  99  99            99  99  99    999    999\n"+
                    "999    999    99  99                    99  99    999    999\n"+
                    "999    9999   99  9         9999         9  99   9999    999\n"+
                    "999    9999   99          99999999          99   9999    999\n"+
                    "999    9999    9          99 99 99          9    9999    999\n"+
                    "999   99999            9     99     9            99999   999\n"+
                    "999  9999              9     99     9              9999  999\n"+
                    "               9       9     99     9       9               \n"+
                    "               9       9     99     9       9               \n"+
                    "999  9999              9     99     9              9999  999\n"+
                    "999   99999            9     99     9            99999   999\n"+
                    "999    9999    9          99 99 99          9    9999    999\n"+
                    "999    9999   99          99999999          99   9999    999\n"+
                    "999    9999   99  9         9999         9  99   9999    999\n"+
                    "999    999    99  99                    99  99    999    999\n"+
                    "999    999    99  99  99            99  99  99    999    999\n"+
                    "999    999    99  99  9999        9999  99  99    999    999\n"+
                    "999    9999    9  99  99 999    999 99  99  9    9999    999\n"+
                    "999     99        99  99  99    99  99  99        99     999\n"+
                    "999               9   99  99    99  99   9               999\n"+
                    "999          9        999999    999999        9          999\n"+
                    "999                     9999    9999                     999\n"+
                    "999              9                        9              999\n"+
                    "999       9          9                9          9       999\n"+
                    "9999     99  9           9        9           9  99     9999\n"+
                    "99999    99  99          99      99          99  99    99999\n"+
                    "9999     99  99  99       99    99       99  99  99     9999\n"+
                    "999      99  99  9999      99  99      9999  99  99      999\n"+
                    "999       9  99  999999  9  9999  9  999999  99  9       999\n"+
                    "999          99  99  99999   99   99999  99  99          999\n"+
                    "9999         9   99  99999        99999  99   9         9999\n"+
                    "9999             99  99  9        9  99  99             9999\n"+
                    "99999            999999  9        9  999999            99999\n"+
                    "99 9999            9999999        9999999            9999 99\n"+
                    "99   9999                                          9999   99\n"+
                    "99     9999                                      9999     99\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: 0,
                    y: -185
                }, {
                    x: 0,
                    y: 185
                }],
                portals: [
                    {
                        x: 160,
                        y: 0
                    },
                    {
                        x: -160,
                        y: 0
                    }
                ],
                spawns: [{
                    x: 0,
                    y: -235
                }, {
                    x: 0,
                    y: 235
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Crop Circles",
                author: "Gummie",
                map: "9999989999999999999999999999999999988888888899999   9999    \n"+
                    " 99999999999 999999999    99999999999888888999999   99999   \n"+
                    "  999999999   9999999      9999999999998889999999   999999  \n"+
                    "   999999999 9999999        88999999999999999999     999999 \n"+
                    "    9999999999999999          8889999999999999         99999\n"+
                    "8    999999999989999        88   888888999999           9999\n"+
                    "99    99999999989999        99888      888999           9999\n"+
                    "999    99999999999999      999999888888   88             999\n"+
                    "9999      999999999999    9999999999999888               999\n"+
                    "99999      999999999999   999999999999999988             999\n"+
                    "9999        99999899999   999999999999889999             999\n"+
                    "999          99999899999   99999998988889999             999\n"+
                    "99           99999889999   9999 9999999999999           9999\n"+
                    "99            9999989999   999999999999999999           9999\n"+
                    "99            99999989999   9999999999999999           89999\n"+
                    "99            99999999999   999999999999999          8 89999\n"+
                    "99            999999999999   9         999       99998 89999\n"+
                    "99             99999999999                      999998 89999\n"+
                    "999              99999999            9         99999998 8999\n"+
                    "9999        99     99999    99                999999998 8999\n"+
                    "999999    999999     99    9999              99999  998 8999\n"+
                    "9999999   99999999         9999              99999  9998 899\n"+
                    "9999999   9999999999        99    9     9    99999999998 899\n"+
                    "9 99999   99999999999    9                    9999999998 899\n"+
                    "9999999   99899999999                         999999999   99\n"+
                    "9999999   9999999888                           9999888     9\n"+
                    "9999999   9999988                  9       99  9888        9\n"+
                    "899998     8888  888        9          9   99      888     9\n"+
                    "98999          88999                            8889999   99\n"+
                    "99999       88899999  99        9               999999999999\n"+
                    "99999       99999999  99              9         999999999999\n"+
                    "999999     999999999                            999999999999\n"+
                    "9999999   9999999999        9     9             999999999998\n"+
                    "9 99999   999999999                         9   9999 9999988\n"+
                    "   9999   99999999    9                  9     9999999999888\n"+
                    "9 99999   9999999        9             9       9999999999888\n"+
                    "9999999   999999                 9             9999999999998\n"+
                    "9999999   9999                                99999999999999\n"+
                    "999999      9                  9   99         99999999999999\n"+
                    "9999                              9999       999999999999999\n"+
                    "999                  99    9      9999      99999999999  999\n"+
                    "99                 99999           99       99999999999  999\n"+
                    "99                9999999                    999999999999999\n"+
                    "9                9999999999                   99999999999999\n"+
                    "9                9999999999999       999      99999999999999\n"+
                    "9                999999999999999999999999      9999999999999\n"+
                    "9                9999999999999999999999999      999999999999\n"+
                    "9                99999989999999999999999999      99999999999\n"+
                    "9               999999888999999999999999999          9999999\n"+
                    "99              9999998899999999999999999999           99999\n"+
                    "99              99999889999999999988888899999          99999\n"+
                    "999            9999998999999999998889999899999          9999\n"+
                    "9999          9999998899999 999998899999989999          9999\n"+
                    "9999999    999999999889999   99998999999999999          9999\n"+
                    "999999999999999999998899999 999999999999999999          9999\n"+
                    "9999999999999999999888999999999999999 999999999         9999\n"+
                    "89999999999999999988889999999999899999999999999         9999\n"+
                    "888899999999999888888889999999998999999999999999         999\n"+
                    "8888889999998888888888889999999888999999999999999   99    99\n"+
                    "8888888888888888888888888888888888899999989999999   999    9",
                flags: [{
                    x: -190,
                    y: -150
                }, {
                    x: 190,
                    y: 190
                }],
                portals: [
                    {
                        x: -220,
                        y: 160
                    },
                    {
                        x: 210,
                        y: -240
                    },
                    {
                        x: -60,
                        y: 240
                    }
                ],
                spawns: [{
                    x: -240,
                    y: -180
                }, {
                    x: 230,
                    y: 230
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Oblivion",
                author: "Liberal",
                map: '9 99343545559333559333433343999934333433395533395554534399 9\n'+
                    ' 9945645564595445494446546545995456456444945445954655465499 \n'+
                    '999976656657967557976575577779977775575679755769756656679999\n'+
                    '959999999999999999999999999999999999999999999999999999999959\n'+
                    '557999999999999999999999999999999999999999999999999999999755\n'+
                    '5669999999999999999                                    99665\n'+
                    '355999999999999999                                     99553\n'+
                    '45699999999999999                                      99654\n'+
                    '3659999999999999                               999     99563\n'+
                    '545999999999999      99999                      999    99545\n'+
                    '45799999999999      999999                       999   99754\n'+
                    '9999999999999      999  99         999   999      99   99999\n'+
                    '346999999999      999   99        999     999      9   99643\n'+
                    '54599999999      999    99       999       999         99545\n'+
                    '4469999999      999     99      999    9    999        99644\n'+
                    '345999999      999      99      99    999    99        99543\n'+
                    '54599999      999       99      99   99 99   99        99545\n'+
                    '9999999       99        99      99   9   9   99        99999\n'+
                    '556999        9         99      99           99        99655\n'+
                    '55799      9            99      99           99        99755\n'+
                    '55699     99           999      999          99        99655\n'+
                    '45799    999            999      999         99        99754\n'+
                    '54799    99          9   999      999        99        99745\n'+
                    '34799    99   9     999   999      999       999       99743\n'+
                    '36799    99   9    999     999      999       999      99763\n'+
                    '46599    99   9   999       999      999       999     99564\n'+
                    '46799    99   9   99         999      999       999    99764\n'+
                    '55699    99   9   99                   999       99    99655\n'+
                    '96599    99   9   99                    99   9   99    99569\n'+
                    '99999    99   9   99                    99   9   99    99999\n'+
                    '99999    99   9   99                    99   9   99    99999\n'+
                    '96599    99       99                    99   9   99    99569\n'+
                    '55699    999      999                   99   9   99    99655\n'+
                    '46799     999      999      999         99   9   99    99764\n'+
                    '46599      999      999      999       999   9   99    99564\n'+
                    '36799       999      999      999     999    9   99    99763\n'+
                    '34799        99       999      999   999     9   99    99743\n'+
                    '54799        99        999      999   9          99    99745\n'+
                    '45799        99         999      999            999    99754\n'+
                    '55699        99          999      999           99     99655\n'+
                    '55799        99           99      99            9      99755\n'+
                    '55699        99           99      99         9        999655\n'+
                    '99999        99   9   9   99      99        99       9999999\n'+
                    '54599        99   99 99   99      99       999      99999545\n'+
                    '34599        99    999    99      99      999      999999543\n'+
                    '44699        999    9    999      99     999      9999999644\n'+
                    '54599         999       999       99    999      99999999545\n'+
                    '34699          999     999        99   999      999999999643\n'+
                    '99999   9       999   999         99  999      9999999999999\n'+
                    '45799   99                        999999      99999999999754\n'+
                    '54599   999                       99999      999999999999545\n'+
                    '36599    999                                9999999999999563\n'+
                    '45699                                      99999999999999654\n'+
                    '35599                                     999999999999999553\n'+
                    '56699                                    9999999999999999665\n'+
                    '557999999999999999999999999999999999999999999999999999999755\n'+
                    '959999999999999999999999999999999999999999999999999999999959\n'+
                    '999976656657967557976575577779977775575679755769756656679999\n'+
                    ' 9945645564595445494446546545995456456444945445954655465499 \n'+
                    '9 99343545559333559333433343999934333433395533395554534399 9',
                flags: [{
                    x: -100,
                    y: -100
                }, {
                    x: 100,
                    y: 100
                }],
                portals: [
                    {
                        x: -110,
                        y: 110
                    },
                    {
                        x: 110,
                        y: -110
                    }
                ],
                spawns: [{
                    x: -230,
                    y: -230
                }, {
                    x: 230,
                    y: 230
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Fusion",
                author: "Liberal",
                map: "433434433243232424322332244433444545456676767667767667676767\n" +
                    "223233344554433224323333344425444545566999999999999999999996\n" +
                    "322234224545454454544544544554445555579999999999999999999997\n" +
                    "3443334559999999999999999944554445676999                 996\n" +
                    "434223444999999999999999995455555577999                  997\n" +
                    "42334545599             99554456567999                   996\n" +
                    "22222254599             9955445566999    999    9        996\n" +
                    "232444455999999999999999995456676999    999    99        996\n" +
                    "24234255499999999999999999446667999    999    999        996\n" +
                    "4425422545445455555455454455676999    999    999         997\n" +
                    "523222245444454554554444444567999    999    999          996\n" +
                    "43225254599544994459945499676999    9999   999    9999   996\n" +
                    "3344434559955699566996659976999    99999   99    99999   996\n" +
                    "332245555997779966699666997999    999 99   99   999 99   996\n" +
                    "43342556799776996669977699999    999  99   99   99  99   997\n" +
                    "2424456769999999999999999999    999   99   99   99 999   996\n" +
                    "32455666999999999999999999999    999  99   99   99999    997\n" +
                    "4445566999             999 999    999 99   99   9999    9997\n" +
                    "244676999             999   999    99999   99   999    99975\n" +
                    "34467999             999     999    9999   99   99    999666\n" +
                    "3426699    9999     9999999999999    999   99   99   9997565\n" +
                    "3426799   999999   999999999999999    99   99   99   9975545\n" +
                    "4436699                               99   99   99   9965544\n" +
                    "3526699                               99   99   99   9976445\n" +
                    "3255799                               99   99   99   9976542\n" +
                    "4256799   999999   999                99        99   9975444\n" +
                    "4345799   999999   999                          99   9966453\n" +
                    "2356799             99                          99   9965553\n" +
                    "3355699             99                          99   9975443\n" +
                    "2446799             99                99        99   9976543\n" +
                    "3246699   99        99                99             9974444\n" +
                    "2355799   99                          99             9975552\n" +
                    "2446799   99                          99             9975553\n" +
                    "3346799   99                          999   999999   9965454\n" +
                    "4346699   99        99                999   999999   9965442\n" +
                    "3455699   99   99   99                               9975452\n" +
                    "2456799   99   99   99                               9976553\n" +
                    "3455699   99   99   99                               9976552\n" +
                    "5457699   99   99   99    999999999999999   999999   9965422\n" +
                    "5666999   99   99   999    9999999999999     9999    9975544\n" +
                    "566999    99   99   9999    999     999             99966544\n" +
                    "77999    999   99   99999    999   999             999765524\n" +
                    "7999    9999   99   99 999    999 999             9997664524\n" +
                    "799    99999   99   99  999    99999999999999999999977545424\n" +
                    "699   999 99   99   99   999    9999999999999999999776553224\n" +
                    "799   99  99   99   99  999    99999767997669976699665453243\n" +
                    "799   99 999   99   99 999    999799667996779976799655454343\n" +
                    "699   99999    99   99999    9997699656996669965699544443443\n" +
                    "699   9999    999   9999    99966699444994549954599554545224\n" +
                    "799          999    999    999766454544445544454554545454442\n" +
                    "699         999    999    9996755555555454545554554554252224\n" +
                    "699        999    999    99966655599999999999999999453343343\n" +
                    "699        99    999    999776545499999999999999999553432222\n" +
                    "799        9    999    9996755545499             99444324324\n" +
                    "799                   99976544545499             99454442334\n" +
                    "699                  999666555544599999999999999999543424242\n" +
                    "699                 9997655445422599999999999999999544434423\n" +
                    "799999999999999999999967654543423222233244455454452444422432\n" +
                    "799999999999999999999675554553432222333434224423422233434322\n" +
                    "677677766666666667767755555455544445554544553445444444554445",
                flags: [{
                    x: -232,
                    y: -225
                }, {
                    x: 232,
                    y: 225
                }],
                portals: [
                    {
                        x: -140,
                        y: -10
                    },
                    {
                        x: 140,
                        y: 10
                    }
                ],
                spawns: [{
                    x: -170,
                    y: 110
                }, {
                    x: 170,
                    y: -110
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Stadium",
                author: "Liberal",
                map: "   9999999999999999999999999999999999     999          999  \n"+
                    "    9999999999999999999999999999999999     999          999 \n"+
                    "                                    999     999          999\n"+
                    "9                                    999     999          99\n"+
                    "99                                    999     999          9\n"+
                    "99      999999999999999999999999999    99999999999          \n"+
                    "99     99999999999999999999999999999    99999999999         \n"+
                    "99    999   999                            99    999        \n"+
                    "99   999   999                             99     999       \n"+
                    "99   99   999                              99999999999      \n"+
                    "99   99  999                               999999999999     \n"+
                    "99   99 999      999       9999999         99        999    \n"+
                    "99   99999        999      99999999        99         999   \n"+
                    "99   9999          999     99    999                   999  \n"+
                    "99   999            999    99     999                   999 \n"+
                    "99   99                    99      999             9     99 \n"+
                    "99   99                    99       999            99    99 \n"+
                    "99   99    9               99        99   999999   99999999 \n"+
                    "99   99    99              99        99   999999   99999999 \n"+
                    "99   99    999             99        99       99            \n"+
                    "99   99     999            99        99       99            \n"+
                    "99   99      99      99     9        99       99            \n"+
                    "99   99       9      999             99       99            \n"+
                    "99   99               999       9   999       99            \n"+
                    "99   99                999      99 99999           999      \n"+
                    "99   99                 99      999999999          9999     \n"+
                    "99   99                          999   999         99999    \n"+
                    "99   99    9999999999                   9999999999999 999   \n"+
                    "99   99    99999999999                   999999999999  999  \n"+
                    "99   99    99                99           999      99   999 \n"+
                    "99   99    99                999           99      99    999\n"+
                    "99   99    99                 999          99      99     99\n"+
                    "99   99    99          999     999         99      99     99\n"+
                    "99   99    999          999     999        99      99     99\n"+
                    "99   99     999          99      999       99      99     99\n"+
                    "99    9      999        999       999      99      99     99\n"+
                    "999           999      999         999     999     99     99\n"+
                    " 999           99999999999          999     999    99     99\n"+
                    "  999           9999999999           999     999   99     99\n"+
                    "   999                  999           999     999  99     99\n"+
                    "    999                  999           999     999 99     99\n"+
                    "     99                   999           999     99999     99\n"+
                    "9    99          99        999           999     9999     99\n"+
                    "99   99999999    99        9999999999     99      999     99\n"+
                    "999  99999999    99        99999999999             99     99\n"+
                    " 999 99  99      99        99       999            99     99\n"+
                    "  99999  99      9999999   99        999           99     99\n"+
                    "   9999  99      9999999   99         999          99     99\n"+
                    "    999  99                99          999         999    99\n"+
                    "     999 99                99           999         999   99\n"+
                    "      99999                99            999         999  99\n"+
                    "       9999    9999     9999999999999999999999999     999 99\n"+
                    "        999     999     99999999999999999999999999     99999\n"+
                    "         999     99     999                     999     9999\n"+
                    "          999    99      999                     999     999\n"+
                    "9          999   99       999                     999     99\n"+
                    "99          999  99        999                     999     9\n"+
                    "999          999999         999                     999     \n"+
                    " 999          99999          999999999999999999999999999    \n"+
                    "  999                         999999999999999999999999999   ",
                flags: [{
                    x: -80,
                    y: -135
                }, {
                    x: 135,
                    y: 80
                }],
                portals: [
                    {
                        x: -120,
                        y: -20
                    },
                    {
                        x: 20,
                        y: 120
                    }
                ],
                spawns: [{
                    x: -200,
                    y: 70
                }, {
                    x: -70,
                    y: 200
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Agony",
                author: "Liberal",
                map: "              99   99                  99   99              \n"+
                    "              99   99                  99   99              \n"+
                    "              99   99                  999999999999         \n"+
                    "     9999     999  99                  9999999999999    9999\n"+
                    "9     9999     999 99                  99         999    999\n"+
                    "99     9999     99999                  99          999    99\n"+
                    "999     9999     9999                  99           999    9\n"+
                    "9999     9999     999                  99   9999     999    \n"+
                    "                   99                  99    9999     99    \n"+
                    "                   99        999999999999     9999    99    \n"+
                    "9999999999999999   99        999999999999      9999   999999\n"+
                    "9999999999999999   99                                 999999\n"+
                    "                   99                                 99    \n"+
                    "                   99                                 99    \n"+
                    "99999999999999999999999999999999   999999   9999999   999999\n"+
                    "99999999999999999999999999999999   999999   9999999   999999\n"+
                    "                                       99   99   99         \n"+
                    "                                       99   99   99         \n"+
                    "9999999999999999   99                  99   99   99   999999\n"+
                    "999999999999999   999   999999999999   99   9999999   999999\n"+
                    "           999   9999   999999999999   99   9999999   99    \n"+
                    "          999   99999                                 99    \n"+
                    "         999   999 99                                 99    \n"+
                    "        999   999  99                                 99    \n"+
                    "       999   999   99   99999   9999   99999999999999999    \n"+
                    "      999   999    99   99999   9999   999999999999         \n"+
                    "     999   999     99   99        99   99                   \n"+
                    "9999999   999      9999999        99   99           99999999\n"+
                    "999999   999       9999999        99   99          999999999\n"+
                    "        999             99   99   99              999       \n"+
                    "       999              99   99   99             999        \n"+
                    "999999999          99   99        9999999       999   999999\n"+
                    "99999999           99   99        9999999      999   9999999\n"+
                    "                   99   99        99   99     999   999     \n"+
                    "         999999999999   9999   99999   99    999   999      \n"+
                    "    99999999999999999   9999   99999   99   999   999       \n"+
                    "    99                                 99  999   999        \n"+
                    "    99                                 99 999   999         \n"+
                    "    99                                 99999   999          \n"+
                    "    99   9999999   99   999999999999   9999   999           \n"+
                    "999999   9999999   99   999999999999   999   999999999999999\n"+
                    "999999   99   99   99                  99   9999999999999999\n"+
                    "         99   99   99                                       \n"+
                    "         99   99   99                                       \n"+
                    "999999   9999999   999999   99999999999999999999999999999999\n"+
                    "999999   9999999   999999   99999999999999999999999999999999\n"+
                    "    99                                 99                   \n"+
                    "    99                                 99                   \n"+
                    "999999                                 99   9999999999999999\n"+
                    "999999   9999      999999999999        99   9999999999999999\n"+
                    "    99    9999     999999999999        99                   \n"+
                    "    99     9999    99                  99                   \n"+
                    "    999     9999   99                  999     9999     9999\n"+
                    "9    999           99                  9999     9999     999\n"+
                    "99    999          99                  99999     9999     99\n"+
                    "999    999         99                  99 999     9999     9\n"+
                    "9999    9999999999999                  99  999     9999     \n"+
                    "         999999999999                  99   99              \n"+
                    "              99   99                  99   99              \n"+
                    "              99   99                  99   99              ",
                flags: [{
                    x: -130,
                    y: -180
                }, {
                    x: 130,
                    y: 180
                }],
                portals: [
                    {
                        x: 140,
                        y: -10
                    },
                    {
                        x: -140,
                        y: 10
                    }
                ],
                spawns: [{
                    x: -200,
                    y: -225
                }, {
                    x: 200,
                    y: 225
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Fortress",
                author: "Liberal",
                map: "455799   9999    9996564444444435345432334453325545444433555\n"+
                    "556799            999666555666555765756565545555666555555664\n"+
                    "766799             99977565655655666565665555665665556566565\n"+
                    "776699              9996667767677766767667676777666776666776\n"+
                    "999999999999999999999999769999999999999999999999999999999999\n"+
                    "999999999999999999999999669999999999999999999999999999999999\n"+
                    "    996767777777776676775699                                \n"+
                    "    996565434544534464565799                                \n"+
                    "    997663556665562566576699                                \n"+
                    "9   996566766666777766675799   999999    999999    99    999\n"+
                    "9   997557999999999999654799   99999     99999     999    99\n"+
                    "9   997647999999999999655799   9999      9999      9999    9\n"+
                    "9   99656699        99663799   999       999       99999    \n"+
                    "    99666799        99673699   99    9   99    9            \n"+
                    "    99656699  99    99754799   9    99   9    99            \n"+
                    "    99665799  999   99745699       999       999   99999999 \n"+
                    "    99655799   999  99746699      99 9             997777999\n"+
                    "9   99665699    99  99647799     99                996567799\n"+
                    "99  99754699        99757799    99                 997655569\n"+
                    "999 99764699        99757799   99         999999999997646466\n"+
                    "6999997537999999999999657699   99         999999999997633355\n"+
                    "5799997557999999999999656799   99         999967766767433365\n"+
                    "5579996546766676676677764799   99         999976536565443345\n"+
                    "6557997656563425445656566699   99  9      999976534663443344\n"+
                    "6656677655556545443565566799   99 99      999984433433333333\n"+
                    "4666766667667676766667776999   9999       999963333434333443\n"+
                    "465799999999999999999999999    999         99975334434444233\n"+
                    "55579999999999999999999999           999    9997634334443234\n"+
                    "456799                              99999    999764344334443\n"+
                    "456699                             999 999    99966343343433\n"+
                    "566799                            999   999    9997654333433\n"+
                    "566699   999999    99999999        9     999   9999755644432\n"+
                    "465699   99999    999999999               99   9999977634334\n"+
                    "556799   9999    99      99               99   99 9996763424\n"+
                    "456799   999    99      99    9          999   99  999656644\n"+
                    "556699   99    99      99    999        999    99   99955534\n"+
                    "455699   9    99            999        999    999    9995644\n"+
                    "556799       9999          999          9    99999    997543\n"+
                    "465799                     99               9997999   996634\n"+
                    "465699                     999      9      999655999  996534\n"+
                    "466699                      999    999    99976456999 997663\n"+
                    "366799   999999              999  999    9997554567999996653\n"+
                    "355699   99999     9999999    999999    99977565556799996554\n"+
                    "466699   9999      99999999    9999    999776655656659996564\n"+
                    "455699   999       999999999          9997565776676457777443\n"+
                    "555799   99    9   9999999999        99975556999997555555524\n"+
                    "555699   9    99   99678757999      9997655579   96555555533\n"+
                    "525799       999   996645556999999999977555579   97644444534\n"+
                    "366799             996654556799999999998755679   96667455343\n"+
                    "355799             99655556666999    99966676999999997755433\n"+
                    "455799             997554556567999    999656677669  96743343\n"+
                    "365699   9999  99999975645456656999    99966566679  97544334\n"+
                    "355699   9999  999999665455555666999    99976677699996634443\n"+
                    "455799    999  9767766654554565676999    9997546777666444444\n"+
                    "457699     99  977555565542355666769999999996654456767336333\n"+
                    "265699      9  975555554554344355667999999996554333544444434\n"+
                    "365699         975656454324434343465766666776544453334334334\n"+
                    "365699   9     996564243443344443455652244344224243334432323\n"+
                    "556799   99    999755553433233334435453445444334322232232424\n"+
                    "466799   999    99966544333444432344334344434333334334344344",
                flags: [{
                    x: -275,
                    y: 130
                }, {
                    x: -130,
                    y: 275
                }],
                portals: [
                    {
                        x: 50,
                        y: -50
                    },
                    {
                        x: -100,
                        y: -70
                    },
                    {
                        x: 70,
                        y: 100
                    }
                ],
                spawns: [{
                    x: -5,
                    y: 225
                }, {
                    x: -225,
                    y: 5
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Paths",
                author: "Healer",
                map: "   999999999999999999999            999999999999999999999   \n"+
                    "    9 9  9      99    999          999    99      9  9 9    \n"+
                    "     99 9 9999999      999        999      9999999 9 99     \n"+
                    "9     9999999999        999      999        9999999999     9\n"+
                    "99     9  99  9          99      99          9  99  9     99\n"+
                    "9 9     999  9            9      9            9  999     9 9\n"+
                    "9999     9  9     99                    99     9  9     9999\n"+
                    "9  99     99     99                      99     99     99  9\n"+
                    "9 99 9          99                        99          9 99 9\n"+
                    "99 9 99        99     9              9     99        99 9 99\n"+
                    "9 9999 9      99     99              99     99      9 9999 9\n"+
                    "9 999  99    99     99                99     99    99  999 9\n"+
                    "9 99  99 9  99     99                  99     99  9 99  99 9\n"+
                    "9 99 9 9  999     99                    99     999  9 9 99 9\n"+
                    "9 999  9  99     99                      99     99  9  999 9\n"+
                    "9 99   9 99     99     999        999     99     99 9   99 9\n"+
                    "9999999999     99     999          999     99     9999999999\n"+
                    "999  9 99     99     999   9    9   999     99     99 9  999\n"+
                    "99999 99     99     999   99    99   999     99     99 99999\n"+
                    "9999999     99     999    99    99    999     99     9999999\n"+
                    "99999      99     999    999    999    999     99      99999\n"+
                    "99        99     999    9999    9999    999     99        99\n"+
                    "99       99      99    99999    99999    99      99       99\n"+
                    "99               9    99999      99999    9               99\n"+
                    " 9                   99999        99999                   9 \n"+
                    " 99      99999                                99999      99 \n"+
                    " 99   999999999                              999999999   99 \n"+
                    "999   99              9999999  9999999              99   999\n"+
                    "999   99         9     99999    99999     9         99   999\n"+
                    "99    99         99                      99         99    99\n"+
                    "99    99         99                      99         99    99\n"+
                    "999   99         9     99999    99999     9         99   999\n"+
                    "999   99              9999999  9999999              99   999\n"+
                    " 99   999999999                              999999999   99 \n"+
                    " 99      99999                                99999      99 \n"+
                    " 9                   99999        99999                   9 \n"+
                    "99               9    99999      99999    9               99\n"+
                    "99       99      99    99999    99999    99      99       99\n"+
                    "99        99     999    9999    9999    999     99        99\n"+
                    "99999      99     999    999    999    999     99      99999\n"+
                    "9999999     99     999    99    99    999     99     9999999\n"+
                    "99999 99     99     999   99    99   999     99     99 99999\n"+
                    "999  9 99     99     999   9    9   999     99     99 9  999\n"+
                    "9999999999     99     999          999     99     9999999999\n"+
                    "9 99   9 99     99     999        999     99     99 9   99 9\n"+
                    "9 999  9  99     99                      99     99  9  999 9\n"+
                    "9 99 9 9  999     99                    99     999  9 9 99 9\n"+
                    "9 99  99 9  99     99                  99     99  9 99  99 9\n"+
                    "9 999  99    99     99                99     99    99  999 9\n"+
                    "9 9999 9      99     99              99     99      9 9999 9\n"+
                    "99 9 99        99     9              9     99        99 9 99\n"+
                    "9 99 9          99                        99          9 99 9\n"+
                    "9  99     99     99                      99     99     99  9\n"+
                    "9999     9  9     99                    99     9  9     9999\n"+
                    "9 9     999  9            9      9            9  999     9 9\n"+
                    "99     9  99  9          99      99          9  99  9     99\n"+
                    "9     9999999999        999      999        9999999999     9\n"+
                    "     99 9 9999999      999        999      9999999 9 99     \n"+
                    "    9 9  9      99    999          999    99      9  9 9    \n"+
                    "   999999999999999999999            999999999999999999999   ",
                flags: [{
                    x: -250,
                    y: 0
                }, {
                    x: 250,
                    y: 0
                }],
                portals: [
                    {
                        x: 0,
                        y: 180
                    },
                    {
                        x: 0,
                        y: -180
                    }
                ],
                spawns: [{
                    x: -180,
                    y: 0
                }, {
                    x: 180,
                    y: 0
                }],
                tiers: [4, 5, 6],
                asteroids: []
            },
            {
                name: "Boxes 4.0",
                author: "EDEN",
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "956868576568775887856657765658856567756658788577865675868659\n" +
                    "977686856999999999999999999999999999999999999999999658686779\n" +
                    "98768766999        99       9999       99        99966786789\n" +
                    "9568657899                   99                   9987568659\n" +
                    "976577869                                          968775679\n" +
                    "977568899    99999    999999    999999    99999    998865779\n" +
                    "977755999   9975399999965769    9675699999935799   999557779\n" +
                    "95699999     993533563554339    933455365335399     99999659\n" +
                    "9699999       99999999999969    96999999999999       9999969\n" +
                    "959989                   979    979                   989959\n" +
                    "979769                   969    969                   967979\n" +
                    "979879   8556            979    979            6558   978979\n" +
                    "969959   755            999      999            557   959969\n" +
                    "959999   57            999        999            75   999959\n" +
                    "979999   6            999          999            6   999979\n" +
                    "96999                999            999                99969\n" +
                    "9999                999              999                9999\n" +
                    "999                 949              949                 999\n" +
                    "99                 9959              9599                 99\n" +
                    "99              9999459              9549999              99\n" +
                    "99             99674439              93447699             99\n" +
                    "99            9939999999            9999999399            99\n" +
                    "99           99499    999          999    99499           99\n" +
                    "99           9499      99999    99999      9949           99\n" +
                    "99      9     99        977      779        99     9      99\n" +
                    "99  9    9              96        69              9    9  99\n" +
                    "99   9   9              9          9              9   9   99\n" +
                    "99   9   9       87          99          78       9   9   99\n" +
                    "99   9   9       6777       9999       7776       9   9   99\n" +
                    "99   9   9       6777       9999       7776       9   9   99\n" +
                    "99   9   9       87          99          78       9   9   99\n" +
                    "99   9   9              9          9              9   9   99\n" +
                    "99  9    9              96        69              9    9  99\n" +
                    "99      9     99        977      779        99     9      99\n" +
                    "99           9499      99999    99999      9949           99\n" +
                    "99           99499    999          999    99499           99\n" +
                    "99            9939999999            9999999399            99\n" +
                    "99             99674439              93447699             99\n" +
                    "99              9999459              9549999              99\n" +
                    "99                 9959              9599                 99\n" +
                    "999                 949              949                 999\n" +
                    "9999                999              999                9999\n" +
                    "96999                999            999                99969\n" +
                    "979999   6            999          999            6   999979\n" +
                    "959999   57            999        999            75   999959\n" +
                    "969959   755            999      999            557   959969\n" +
                    "979879   8556            979    979            6558   978979\n" +
                    "979769                   969    969                   967979\n" +
                    "959989                   979    979                   989959\n" +
                    "9699999       99999999999969    96999999999999       9999969\n" +
                    "95699999     993533563554339    933455365335399     99999659\n" +
                    "977755999   9975399999965769    9675699999935799   999557779\n" +
                    "977568899    99999    999999    999999    99999    998865779\n" +
                    "976577869                                          968775679\n" +
                    "9568657899                   99                   9987568659\n" +
                    "98768766999        99       9999       99        99966786789\n" +
                    "977686856999999999999999999999999999999999999999999658686779\n" +
                    "956868576568775887856657765658856567756658788577865675868659\n" +
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -180,
                    y: 0
                }, {
                    x: 180,
                    y: 0
                }],
                portals: [
                    {
                        x: 0,
                        y: -100
                    },
                    {
                        x: 0,
                        y: 100
                    }
                ],
                spawns: [{
                    x: -265,
                    y: 0
                }, {
                    x: 265,
                    y: 0
                }],
                tiers: [3, 4],
                asteroids: []
            },

            {
                name: "Speedster's Rift",
                author: "Robonuko",
                map: "334344443554666667999999999999999999999999999999999999976553\n" +
                    "333544547766799999999999999999999999999999999999999999997743\n" +
                    "3545547679999999999                                   999766\n" +
                    "44444679999999                                         99976\n" +
                    "4555669999                   9999           9           9997\n" +
                    "55577999               9    99      9999    99   99      999\n" +
                    "3466999               99   99      999999   99   99       99\n" +
                    "556999                99   99     99   999       99       99\n" +
                    "47799     99       99999   99    99     99       99       99\n" +
                    "56999     99     9999999   99    99     99       999999   99\n" +
                    "5799    9999   9999        9     99    999       999999   99\n" +
                    "5799    9999   99                 9   999   99            99\n" +
                    "6699           9     9999                   99            99\n" +
                    "7999                999999                  99            99\n" +
                    "799                99   99       99         99999    99   99\n" +
                    "699                99   99       99         99999    999  99\n" +
                    "799       9        99             99                      99\n" +
                    "699      99         99            99                      99\n" +
                    "999      99  99      99           99                      99\n" +
                    "99       99  99       99           99           9999      99\n" +
                    "99       99           99           99          999999     99\n" +
                    "99       99           99     99    99          99  999    99\n" +
                    "99       99999999   9999     99    99          9    99    99\n" +
                    "99   9   9999999   99999    9999   999999           99    99\n" +
                    "99   99                     9  9   999999999        99    99\n" +
                    "99   99                                  999       99     99\n" +
                    "99   99                                    99   9999      99\n" +
                    "99   99                                    99  9999       99\n" +
                    "99   9999              99          99                 9   99\n" +
                    "99   9999            999            999              99   99\n" +
                    "99   99              999            999            9999   99\n" +
                    "99   9                 99          99              9999   99\n" +
                    "99       9999  99                                    99   99\n" +
                    "99      9999   99                                    99   99\n" +
                    "99     99       999                                  99   99\n" +
                    "99    99        999999999   9  9                     99   99\n" +
                    "99    99           999999   9999    99999   9999999   9   99\n" +
                    "99    99               99    99     9999   99999999       99\n" +
                    "99    99    9          99    99     99           99       99\n" +
                    "99    999  99          99           99           99       99\n" +
                    "99     999999          99           99       99  99       99\n" +
                    "99      9999            99           99      99  99      999\n" +
                    "99                      99            99         99      996\n" +
                    "99                      9999           99        9       996\n" +
                    "99  999    99999          99      99   99                997\n" +
                    "99   99    99999                  99   99                997\n" +
                    "99            99                  999999                9996\n" +
                    "99            99    999    9       9999     9           9967\n" +
                    "99            99   999    99               99   9999    9974\n" +
                    "99   999999        99     99    9        9999   9999    9964\n" +
                    "99   999999        99     99   99   9999999     99     99974\n" +
                    "99       99        999   99    99   99999       99     99664\n" +
                    "99       99         999999     99   99                999645\n" +
                    "99       99   99     9999      99   99               9997655\n" +
                    "999      99   99              99    9               99967455\n" +
                    "7999           9           9999                   9999764454\n" +
                    "66999                                         99999996655454\n" +
                    "476999                                   9999999999666455453\n" +
                    "356699999999999999999999999999999999999999999997677754454333\n" +
                    "334669999999999999999999999999999999999999776667454554453333",
                flags: [{
                    x: -100,
                    y: -100
                }, {
                    x: 100,
                    y: 100
                }],
                portals: [
                    {
                        x: 160,
                        y: -30
                    },
                    {
                        x: -160,
                        y: 30
                    }
                ],
                spawns: [{
                    x: -235,
                    y: -235
                }, {
                    x: 235,
                    y: 235
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Snowflake",
                author: "Robonuko",
                map: "                                                            \n"+
                    " 99 999999 99             9  99  9             99 999999 99 \n"+
                    " 99 999999 99 9  9    99  9 9999 9  99    9  9 99 999999 99 \n"+
                    "   99   99    9 999    9  999  999  9    999 9   999   999  \n"+
                    " 9999   9999999  9   9999999    9999999   9  999999     999 \n"+
                    " 99     9999999999999999999      99999999999999999       99 \n"+
                    " 99                                                      99 \n"+
                    " 99                                                      99 \n"+
                    " 99999                                                  999 \n"+
                    " 99999      99999    99999        99999    99999       9999 \n"+
                    "    99      99499  9 994499      994499 9  99499      99    \n"+
                    " 99 99       999  99 994 499    994 499 99  999       99 99 \n"+
                    " 99 99   99      999 994  499  994  499 999      99   99 99 \n"+
                    "    99   999    9949 994  499  994  499 9499    999   99    \n"+
                    "  9999   949    9949 994  499  994  499 9499    949   9999  \n"+
                    "     9   999     999 994  499  994  499 999     999   9     \n"+
                    "   9 9   99  99   99 994  499  994  499 99   99  99   9 9   \n"+
                    "  9999      9999   9 994 4999  9994 499 9   9999      9999  \n"+
                    "   9 9     994499    994499      994499    994499     9 9   \n"+
                    "     9    99999999   99999        99999   99999999    9     \n"+
                    "     9                999  99  99  999                9     \n"+
                    "    99   99999999999      999  999      99999999999   99    \n"+
                    "    99   999999999999    9949  9499    999999999999   99    \n"+
                    "    99   944444444499    9949  9499    994444444449   99    \n"+
                    "  9999   994      499     999  999     994      499   9999  \n"+
                    "    99   9994    499  99   99  99   99  994    4999   99    \n"+
                    " 99999     99444499  9999          9999  99444499     99999 \n"+
                    "   99       999999  994499        994499  999999       99   \n"+
                    "  99         99999  999999        999999  99999         99  \n"+
                    " 99                          99                          99 \n"+
                    " 99                          99                          99 \n"+
                    "  99         99999  999999        999999  99999         99  \n"+
                    "   99       999999  994499        994499  999999       99   \n"+
                    " 99999     99444499  9999          9999  99444499     99999 \n"+
                    "    99   9994    499  99   99  99   99  994    4999   99    \n"+
                    "  9999   994      499     999  999     994      499   9999  \n"+
                    "    99   944444444499    9949  9499    994444444449   99    \n"+
                    "    99   999999999999    9949  9499    999999999999   99    \n"+
                    "    99   99999999999      999  999      99999999999   99    \n"+
                    "     9                999  99  99  999                9     \n"+
                    "     9    99999999   99999        99999   99999999    9     \n"+
                    "   9 9     994499    994499      994499    994499     9 9   \n"+
                    "  9999      9999   9 994 4999  9994 499 9   9999      9999  \n"+
                    "   9 9   99  99   99 994  499  994  499 99   99  99   9 9   \n"+
                    "     9   999     999 994  499  994  499 999     999   9     \n"+
                    "  9999   949    9949 994  499  994  499 9499    949   9999  \n"+
                    "    99   999    9949 994  499  994  499 9499    999   99    \n"+
                    " 99 99   99      999 994  499  994  499 999      99   99 99 \n"+
                    " 99 99       999  99 994 499    994 499 99  999       99 99 \n"+
                    "    99      99499  9 994499      994499 9  99499      99    \n"+
                    " 9999       99999    99999        99999    99999      99999 \n"+
                    " 999                                                  99999 \n"+
                    " 99                                                      99 \n"+
                    " 99                                                      99 \n"+
                    " 99       99999999999999999      9999999999999999999     99 \n"+
                    " 999     999999  9   9999999    9999999   9  9999999   9999 \n"+
                    "  999   999   9 999    9  999  999  9    999 9    99   99   \n"+
                    " 99 999999 99 9  9    99  9 9999 9  99    9  9 99 999999 99 \n"+
                    " 99 999999 99             9  99  9             99 999999 99 \n"+
                    "                                                            ",
                flags: [{
                    x: -220,
                    y: 220
                }, {
                    x: 220,
                    y: -220
                }],
                portals: [
                    {
                        x: -230,
                        y: -230
                    },
                    {
                        x: 230,
                        y: 230
                    }
                ],
                spawns: [{
                    x: -255,
                    y: 0
                }, {
                    x: 255,
                    y: 0
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Shortcut",
                author: "Gummie",
                map: "  99999   79997  7999977  79999997 79999999  7997   99999   \n"+
                    " 99999   999975  79977    79999997 7999999   797   99999    \n"+
                    "99999   999775   777       9999999 999999     7   99999     \n"+
                    "9999   999                  999999 99999   9     99999     9\n"+
                    "999   999               77   99999 9999   977   99999     99\n"+
                    "99   999     99        7999   9997 999   97      999     999\n"+
                    "9   999      99       799999   777 99   97        9     9999\n"+
                    "   999       99           997      99  97    777       99999\n"+
                    "  999     9  999          777      99   7   99999     99999 \n"+
                    " 999     79  9999              7 77997     99999     99999  \n"+
                    "799     99    9999             9   9997   99999     99999   \n"+
                    "997            9999            999 997   99999     79999   7\n"+
                    "997             9999        9  999997   99999      5999   79\n"+
                    "975  57777       9999      99   9997   99999        57   799\n"+
                    "75   799999       9999          997   99999     75        77\n"+
                    "          99       9999         97   99999     9995    7    \n"+
                    "          999       9999999         99999     99997   79    \n"+
                    "          9999       99999999      99999     99999   79   77\n"+
                    "            999       99999999    99999     99999   799   79\n"+
                    "             999           997   99999     99999   799     7\n"+
                    "              999           7   99999     99999   799       \n"+
                    "               999    777      99999     79999     9        \n"+
                    "77       77     999  99997    99999      7999   7          9\n"+
                    "997     7997     999 99997   99999      7999   799        99\n"+
                    "997    799997     9999997   99999     77999   79999       99\n"+
                    "9997  7999 997     99997   79999     99999   7999999      99\n"+
                    "99997799 999997     997     799     99999   799999999    999\n"+
                    "999999999    997     7       7     99999    9999999999999999\n"+
                    "999999999 777999                  99999     999    999999999\n"+
                    "999999999 7  999       7 7       79999      999 77 999999999\n"+
                    "999999999 77 999      99997       7 7       999  7 999999999\n"+
                    "999999999    999     99999                  999777 999999999\n"+
                    "99999999999999997   99999     7       7     799    999999999\n"+
                    "999    999999997   99999     997     799     799999 99779999\n"+
                    "99      9999997   99999     99997   79999     799 9997  7999\n"+
                    "99       99997   99977     99999   7999999     799997    799\n"+
                    "99        997   9997      99999   79999 999     7997     799\n"+
                    "9          7   9997      99999    79999  999     77       77\n"+
                    "        9     99997     99999      777    999               \n"+
                    "       997   99999     99999   7           999              \n"+
                    "7     997   99999     99999   799           999             \n"+
                    "97   997   99999     99999    99999999       999            \n"+
                    "77   97   99999     99999      99999999       9999          \n"+
                    "    97   79999     99999         9999999       999          \n"+
                    "    7    5999     99999   79         9999       99          \n"+
                    "77        57     99999   799          9999       999997   57\n"+
                    "997   75        99999   7999   99      9999       77775  579\n"+
                    "97   9995      99999   799999  9        9999             799\n"+
                    "7   99997     99999   799 999            9999            799\n"+
                    "   99999     99999   7999   9             9999    99     999\n"+
                    "  99999     99999     79977 7              9999  97     999 \n"+
                    " 99999     99999   7   99      777          999  9     999  \n"+
                    "99999       777    79  99      799           99       999   \n"+
                    "9999     9        79   99 777   999997       99      999   9\n"+
                    "999     999      79   999 7999   9997        99     999   99\n"+
                    "99     99999   779   9999 99999   77               999   999\n"+
                    "9     99999     9   99999 999999                  999   9999\n"+
                    "     99999   7     999999 9999999       777   577999   99999\n"+
                    "    99999   797   9999997 79999997    77997  579999   99999 \n"+
                    "   99999   7997  99999997 79999997  7799997  79999   99999  ",
                flags: [{
                    x: -130,
                    y: 130
                }, {
                    x: 130,
                    y: -130
                }],
                portals: [
                    {
                        x: -250,
                        y: -70
                    },
                    {
                        x: 250,
                        y: 70
                    }
                ],
                spawns: [{
                    x: 40,
                    y: -190
                }, {
                    x: -40,
                    y: 190
                }],
                tiers: [],
                asteroids: [
                    ...Array.from({ length: 4 }, (_, i) => i).map(i => ({
                        x: 600 / 4 * i,
                        y: 600 / 4 * i,
                        vx: 0.25,
                        vy: 0.25,
                        size: 100
                    })),
                    ...Array.from({ length: 7 }, (_, i) => i).map(i => ({
                        x: 600 / 7 * i,
                        y: 600 / 7 * i + 90,
                        vx: 0.4,
                        vy: 0.4,
                        size: 40
                    })),
                    ...Array.from({ length: 7 }, (_, i) => i).map(i => ({
                        x: 600 / 7 * i,
                        y: 600 / 7 * i - 90,
                        vx: -0.4,
                        vy: -0.4,
                        size: 40
                    })),
                ]
            }
        ]
    }

    constructor(name, author, map, flags, portals, spawns, tiers, asteroids) {
        this.name = name;
        this.author = author;
        this.map = map;
        this.getSpawnArea();
        this.flags = [];
        if (flags) {
            for (let i = 0; i < flags.length; i++) {
                this.flags.push(new Vector2(flags[i].x, flags[i].y));
            }
        }
        this.portals = [];
        if (portals) {
            for (let i = 0; i < portals.length; i++) {
                this.portals.push(new Vector2(portals[i].x, portals[i].y));
            }
        }
        this.spawns = [];
        if (spawns) {
            for (let i = 0; i < spawns.length; i++) {
                this.spawns.push(new Vector2(spawns[i].x, spawns[i].y));
            }
        }
        this.tiers = tiers;
        if (!this.tiers || this.tiers.length == 0) {
            this.tiers = [3, 4, 5, 6];
        }
        this.tier = Helper.getRandomArrayElement(this.tiers);

        this.asteroidPaths = [];
        for (let i = 0; i < asteroids.length; i++) {
            this.asteroidPaths.push(new AsteroidPath(
                new Vector2(asteroids[i].x, asteroids[i].y),
                new Vector2(asteroids[i].vx, asteroids[i].vy),
                asteroids[i].size
            ));
        }
    }

    getSpawnArea() {
        let sMap = this.map.split('\n');
        this.spawnArea = [];
        for (let i = 0; i < Game.C.OPTIONS.MAP_SIZE; i++) {
            for (let j = 0; j < Game.C.OPTIONS.MAP_SIZE; j++) {
                let char = sMap[i].charAt(j);
                if (char == ' ') {
                    this.spawnArea.push(new Vector2(
                        (j - Game.C.OPTIONS.MAP_SIZE / 2 + 0.5) * 10,
                        (Game.C.OPTIONS.MAP_SIZE / 2 - 0.5 - i) * 10
                    ));
                }
            }
        }

        if (Game.C.IS_DEBUGGING) {
            for (let i = 0; i < this.spawnArea.length; i++) {
                let grid = Helper.deepCopy(Obj.C.OBJS.GRID);
                this.gridObjs.push(new Obj(
                    grid.id,
                    grid.type,
                    new Vector3(this.spawnArea[i].x * 10, this.spawnArea[i].y * 10, grid.position.z),
                    new Vector3(grid.rotation.x, grid.rotation.y, grid.rotation.z),
                    new Vector3(grid.scale.x, grid.scale.y, grid.scale.z),
                    true,
                    false
                ).update());
            }
        }
    }

    spawn() {
        game.setCustomMap(this.map);
        for (let asteroidPath of this.asteroidPaths) {
            asteroidPath.spawn();
        }
        return this;
    }

    tick() {
        for (let asteroidPath of this.asteroidPaths) {
            asteroidPath.tick();
        }
        return this;
    }

    stop() {
        for (let asteroidPath of this.asteroidPaths) {
            asteroidPath.stop();
        }
        return this;
    }

    destroySelf() {
        for (let gridObj of this.gridObjs) {
            gridObj.destroySelf();
        }
        for (let asteroidPath of this.asteroidPaths) {
            asteroidPath.destroySelf();
        }
        return this;
    }
}

class ShipGroup {
    tier = 0;
    ships = [];
    normalShips = [];
    flagShips = [];

    chosenShips = [];
    chosenNames = [];
    chosenTypes = [];
    chosenOrigins = [];

    static C = {
        NUM_SHIPS: 3,
        FLAG: {
            FLAG_WEIGHT: 1.2,
            FLAG_OBJ: {
                section_segments: [44, 45, 46, 135, 225, 310, 315, 320],
                offset: { x: 0, y: 25, z: 65 },
                position: {
                    x: [0, 0, 1.6, 1.6, 1.6, -1.6, -1.6, -1.6, 1.6, 1.6, 1.6, -1.6, -1.6, -1.6, 0],
                    y: [0, 0, 14.4, 16, 17.6, 30.4, 32, 33.6, 46.4, 48, 49.6, 62.4, 64, 65.6, 65.6],
                    z: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                width: [0, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 0],
                height: [0, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 0],
                texture: [63]
            },
            FLAGPOLE_OBJ: {
                section_segments: 10,
                offset: { x: 0, y: 10, z: -25 },
                position: {
                    x: [0, 0, 0, 0],
                    y: [0, 0, 80, 80],
                    z: [0, 0, 0, 0]
                },
                width: [0, 3.2, 3.2, 0],
                height: [0, 3.2, 3.2, 0],
                texture: [2, 2, 2],
                vertical: true
            }
        },
        GROUPS: [
            {
                TIER: 3,
                SHIPS: [
                    {
                        ORIGIN: "MCST",
                        CODES: [
                            '{"name":"Scythe","level":3,"model":1,"size":1.45,"specs":{"shield":{"capacity":[115,175],"reload":[4,6]},"generator":{"capacity":[70,125],"reload":[23,35]},"ship":{"mass":75,"speed":[90,120],"rotation":[70,90],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-50,-40,-20,20,30,40,35],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,20,25,25,20,15,0],"height":[0,10,20,20,20,20,15,0],"propeller":true,"texture":[4,63,2,10,2,12,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,15,17,12,5],"height":[0,21,25,20,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-55,-60,-20,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,10,16,17,14,0],"height":[0,10,16,17,14,0],"angle":0,"laser":{"damage":[3.5,6],"rate":10,"type":1,"speed":[180,240],"number":1,"error":15,"recoil":0},"propeller":false,"texture":[3,3,2,3]},"side_props":{"section_segments":8,"offset":{"x":50,"y":42,"z":-30},"position":{"x":[0,0,0,0,0,0],"y":[-35,-40,-20,0,20,15],"z":[0,0,0,0,0,0]},"width":[0,8,12,12,10,0],"height":[0,8,12,12,10,0],"angle":0,"propeller":true,"texture":[3,2,10,2,17]}},"wings":{"spikes":{"doubleside":true,"offset":{"x":17,"y":-10,"z":0},"length":[10,0,15],"width":[30,40,160,50],"angle":[0,0,0],"position":[20,20,-15,0],"texture":[3,63,63],"bump":{"position":30,"size":10}},"below":{"doubleside":true,"offset":{"x":20,"y":10,"z":-5},"length":[40],"width":[50,30],"angle":[-40],"position":[0,30],"texture":[11],"bump":{"position":30,"size":10}},"belowFins":{"doubleside":true,"offset":{"x":58,"y":33,"z":-30},"length":[14],"width":[55,35],"angle":[0],"position":[0,0],"texture":[63],"bump":{"position":30,"size":10}}},"typespec":{"name":"Scythe","level":3,"model":1,"code":301,"specs":{"shield":{"capacity":[115,175],"reload":[4,6]},"generator":{"capacity":[70,125],"reload":[23,35]},"ship":{"mass":75,"speed":[90,120],"rotation":[70,90],"acceleration":[80,110]}},"shape":[2.325,2.338,3.144,2.797,2.312,1.998,1.777,1.636,1.505,1.389,1.309,1.255,1.227,1.785,2.154,2.245,2.379,2.55,2.536,2.502,2.333,1.777,1.376,1.372,1.328,1.307,1.328,1.372,1.376,1.777,2.333,2.502,2.536,2.55,2.379,2.245,2.154,1.785,1.227,1.255,1.309,1.389,1.505,1.636,1.777,1.998,2.312,2.797,3.144,2.338],"lasers":[{"x":0,"y":-2.32,"z":0,"angle":0,"damage":[3.5,6],"rate":10,"type":1,"speed":[180,240],"number":1,"spread":0,"error":15,"recoil":0}],"radius":3.144}}',
                            '{"name":"Pulse-Fighter","level":3,"model":2,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":120,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-50,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,25,30,35,20,0],"height":[0,10,15,25,25,20,0],"propeller":true,"texture":[63,1,1,10,2,12]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"cannon":{"section_segments":6,"offset":{"x":0,"y":-40,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":3},"deco":{"section_segments":8,"offset":{"x":50,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":4}},"wings":{"main":{"length":[80,20],"width":[120,50,40],"angle":[-10,20],"position":[30,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":0,"z":0}},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Pulse-Fighter","level":3,"model":2,"code":302,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":120,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.343,2.204,1.998,1.955,2.088,1.91,1.085,0.974,0.895,0.842,0.829,0.95,1.429,2.556,2.618,2.726,2.851,2.837,2.825,2.828,2.667,2.742,2.553,2.766,2.779,2.735,2.779,2.766,2.553,2.742,2.667,2.828,2.825,2.837,2.851,2.726,2.618,2.556,1.43,0.95,0.829,0.842,0.895,0.974,1.085,1.91,2.088,1.955,1.998,2.204],"lasers":[{"x":0,"y":-2.34,"z":-0.26,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.851}}',
                            '{"name":"Xenon","level":3,"model":4,"size":2.2,"specs":{"shield":{"capacity":[145,225],"reload":[3,6]},"generator":{"capacity":[50,70],"reload":[21,33]},"ship":{"mass":150,"speed":[95,110],"rotation":[80,110],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-39,-35,-25,-10,10,30,47,55,52],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,8,11,14,17,12,5,0],"height":[0,5,8,8,10,11,11,5,0],"propeller":true,"texture":[6,3,4,63,2,4,3,17]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-5,"z":2},"position":{"x":[0,0,0,0,0,0,0],"y":[-5,0,20,30,34],"z":[7,3,0,0,0]},"width":[0,7,9,8,0],"height":[0,7,13,8,5],"propeller":false,"texture":[9,9,3,4,4]},"detail1":{"section_segments":12,"offset":{"x":7,"y":15,"z":4},"position":{"x":[0,0,0,2,2,0],"y":[-20,-20,-20,0,0,3],"z":[0,0,0,1,1,0]},"width":[0,4,4,4,4,0],"height":[0,4,4,4,4,0],"angle":0,"propeller":false,"texture":[12,8,8,13]},"detail2":{"section_segments":12,"offset":{"x":0,"y":-5,"z":4.1},"position":{"x":[0,0,0,0,0,0],"y":[-30,-30,-20,0,0,3],"z":[0,-0.1,0,2.5,3.5,0]},"width":[0,4,4,4,4,0],"height":[0,4,4,3.4,4,0],"angle":0,"propeller":false,"texture":[12,3,10.24,13]},"cannon1":{"section_segments":12,"offset":{"x":37,"y":39,"z":-1},"position":{"x":[0,0,0,0,0,0],"y":[-30,-40,-20,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,2,2,3,3,0],"height":[0,2,2,3,3,0],"angle":0,"laser":{"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"error":0},"propeller":true,"texture":[12,12,10,17]},"cannon2":{"section_segments":12,"offset":{"x":16,"y":39,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-30,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,2,3,4,4,0],"height":[0,2,3,4,4,0],"angle":0,"laser":{"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"error":0},"propeller":true,"texture":[12,12,63,17]}},"wings":{"main":{"length":[40,10],"width":[30,30,10],"angle":[10,49],"position":[60,70,90],"doubleside":true,"offset":{"x":0,"y":-47,"z":-4},"bump":{"position":10,"size":10},"texture":[8,63]}},"typespec":{"name":"Xenon","level":3,"model":4,"code":304,"specs":{"shield":{"capacity":[145,225],"reload":[3,6]},"generator":{"capacity":[50,70],"reload":[21,33]},"ship":{"mass":150,"speed":[95,110],"rotation":[80,110],"acceleration":[80,120]}},"shape":[2.376,2.261,1.785,1.365,1.11,0.939,0.824,0.823,0.928,0.904,0.861,0.831,1.717,1.729,1.809,1.945,2.142,2.427,2.772,2.924,2.018,1.928,1.896,1.804,1.772,1.763,1.772,1.804,1.896,1.928,2.018,2.924,2.772,2.427,2.142,1.945,1.809,1.729,1.717,0.831,0.861,0.904,0.928,0.823,0.824,0.939,1.11,1.365,1.785,2.261],"lasers":[{"x":1.628,"y":-0.044,"z":-0.044,"angle":0,"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.628,"y":-0.044,"z":-0.044,"angle":0,"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.704,"y":-0.484,"z":0.044,"angle":0,"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.704,"y":-0.484,"z":0.044,"angle":0,"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.924}}',
                        ]
                    }
                ]
            },
            {
                TIER: 4,
                SHIPS: [
                    {
                        ORIGIN: "MCST",
                        CODES: [
                            '{"name":"Valence","level":4,"model":1,"size":1.6,"specs":{"shield":{"capacity":[165,225],"reload":[3,6]},"generator":{"capacity":[90,150],"reload":[32,46]},"ship":{"mass":150,"speed":[105,120],"rotation":[80,130],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-110,-100,-70,-25,25,55,80,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,14,20,25,28,27,23,20,15,0],"height":[0,14,20,21,23,25,23,20,15,0],"texture":[4,31,11,31,4,10,3,12,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-20,5,35,60,55],"z":[-5,0,0,0,0,3,3]},"width":[5,12,15,14,14,10,0],"height":[0,3,10,13,13,8,0],"texture":[31,9,9,3,31,4,3,31]},"sides":{"section_segments":8,"offset":{"x":25,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,-3,0],"y":[0,20,45,65,90,115,120],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,14,15,13,10,0],"height":[0,10,12,15,15,10,0],"texture":[1,11,63,3,4,11],"propeller":false},"gun1":{"section_segments":12,"offset":{"x":0,"y":-68,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-47,-50,-47,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,5,6,6,7,0],"height":[0,5,6,6,10,0],"angle":0,"laser":{"damage":[5,7],"rate":10,"type":2,"speed":[170,200],"number":1,"error":5},"propeller":false,"texture":[17,31,3,3]},"gun2":{"section_segments":12,"offset":{"x":6,"y":-68,"z":-4},"position":{"x":[0,0,0,0,0,0],"y":[-47,-50,-47,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,5,6,6,7,0],"height":[0,5,6,6,10,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"error":0},"propeller":false,"texture":[17,31,3,3]},"bumps":{"section_segments":8,"offset":{"x":75,"y":50,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-31,-35,-30,-15,-5,-4,14,15,35,45,42],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,12,14,14,14,11,11,14,14,12,0],"height":[0,8,12,14,14,14,11,11,14,14,12,0],"texture":[4,17,31,11,31,4,13,4,3,31,17],"propeller":true}},"wings":{"top":{"doubleside":true,"offset":{"x":5,"y":20,"z":15},"length":[20],"width":[60,30],"angle":[15],"position":[0,60],"texture":[31],"bump":{"position":-30,"size":5}},"back":{"doubleside":true,"offset":{"x":10,"y":30,"z":-5},"length":[70,15],"width":[120,60,35],"angle":[-5,0],"position":[0,30,20],"texture":[3,31],"bump":{"position":0,"size":5}},"back2":{"doubleside":true,"offset":{"x":10,"y":30,"z":0},"length":[75,0],"width":[45,24,0],"angle":[-5,0],"position":[-12,35,45],"texture":[31],"bump":{"position":0,"size":10}},"front":{"doubleside":true,"offset":{"x":10,"y":-50,"z":-5},"length":[30,15],"width":[80,40,25],"angle":[-5,0],"position":[0,-10,-10],"texture":[4,31],"bump":{"position":0,"size":5}}},"typespec":{"name":"Valence","level":4,"model":1,"code":401,"specs":{"shield":{"capacity":[165,225],"reload":[3,6]},"generator":{"capacity":[90,150],"reload":[32,46]},"ship":{"mass":150,"speed":[105,120],"rotation":[80,130],"acceleration":[90,110]}},"shape":[3.783,3.792,3.294,2.852,2.875,2.91,2.753,2.408,1.16,1.149,1.165,1.247,1.414,1.694,2.94,3.259,3.454,3.723,3.903,4.122,3.945,3.404,3.179,3.138,3.236,3.206,3.236,3.138,3.179,3.404,3.945,4.122,3.903,3.723,3.454,3.259,2.94,1.694,1.436,1.247,1.165,1.149,1.16,2.408,2.753,2.91,2.875,2.852,3.294,3.792],"lasers":[{"x":0,"y":-3.776,"z":0.224,"angle":0,"damage":[5,7],"rate":10,"type":2,"speed":[170,200],"number":1,"spread":0,"error":5,"recoil":0},{"x":0.192,"y":-3.776,"z":-0.128,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.192,"y":-3.776,"z":-0.128,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.122}}',
                            '{"name":"Ateon","level":4,"model":3,"size":1.75,"specs":{"shield":{"capacity":[140,200],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[25,43]},"ship":{"mass":175,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-82.5,-75,-50,5,50,105,95,95],"z":[0,0,0,0,0,0,0,0]},"width":[5,15,25,30,40,20,15,0],"height":[0,10,15,25,25,15,10,0],"propeller":true,"texture":[9,4,63,63,18,13,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-82.5,-75,-50,-25,40,75,90],"z":[0,0,5,5,0,10,15]},"width":[5,15,22.5,25,35,20,10],"height":[0,10,15,20,25,20,0],"propeller":false,"texture":[9,9,9,10,8,63]},"central_cannon":{"section_segments":8,"offset":{"x":22.5,"y":0,"z":0},"position":{"x":[0,0,5,5,0,0,0],"y":[-55,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"error":0,"angle":3},"propeller":false,"texture":[6,4]},"wing_laser":{"section_segments":10,"offset":{"x":60,"y":-5,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,50,70,60,60],"z":[5,5,5,5,5,5,5,0,0,0,0]},"width":[0,5,10,10,5,5,5,10,6,5,0],"height":[0,5,10,10,5,5,5,10,5,4,0],"texture":[6,4,10,3,4,3,2,2,15.9,17],"propeller":true,"laser":{"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"error":0,"recoil":0}},"cockpit_ring":{"section_segments":12,"offset":{"x":0,"y":-21,"z":12.6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-5,-5,0,5,6,7,7],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,0,28,30,30,17,15,0],"height":[5,22.5,22.5,22.5,22.5,22.5,15,0],"texture":63},"cockpit_deco":{"section_segments":12,"offset":{"x":0,"y":-50,"z":31},"position":{"x":[0,0,0,0,0,0,0],"y":[-32,-32.8,-25,0,20,30,30],"z":[-20,-20.4,-13.8,-4.7,-1,-0.9,-5]},"width":[0,0.5,3,4,4,9,0],"height":[0,0,3,4,5,5,0],"texture":[9,63],"angle":0},"wingdeco1":{"section_segments":8,"offset":{"x":70,"y":30,"z":4},"position":{"x":[-2,0,1,1,-1,-4,-4.5],"y":[-40,-30,-10,0,15,25,32],"z":[-7,-5,-3,-2,0,-5,-15]},"width":[0,1,2,2,1,1,0],"height":[0,1,2,3,2,1,0],"angle":0,"texture":4},"wingdeco2":{"section_segments":8,"offset":{"x":50,"y":35,"z":8},"position":{"x":[5,2,-1,-2,-1,1,4,4.1],"y":[-45,-40,-30,-10,0,20,28,25],"z":[-10,-7,-5,-3,-2,0,-5,-19]},"width":[0,1,1,2,2,1,1,0.5],"height":[0,1,1,2,3,2,1,0],"angle":0,"texture":4},"back_spikes":{"section_segments":12,"offset":{"x":35,"y":65,"z":10},"position":{"x":[-5,-2,-2,-5,-5],"y":[-30,-23,0,25,33],"z":[0,0,0,0,0]},"width":[0,3,3,3,0],"height":[0,5,5,5,0],"texture":[6,4,4,1],"angle":0}},"wings":{"main":{"doubleside":true,"length":[80,10],"width":[80,40,30],"angle":[-10,20],"position":[30,0,40],"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":10,"y":20,"z":10}},"top":{"length":[40,10],"width":[50,20,20],"angle":[10,30],"position":[70,75,100],"doubleside":true,"texture":[3.25,63],"bump":{"position":0,"size":10},"offset":{"x":0,"y":0,"z":20}}},"typespec":{"name":"Ateon","level":4,"model":3,"code":403,"specs":{"shield":{"capacity":[140,200],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[25,43]},"ship":{"mass":175,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.898,2.888,2.688,2.228,2.039,1.888,1.728,1.612,2.446,2.498,2.465,2.427,2.484,3.214,3.386,3.642,3.917,4.243,4.324,3.235,2.867,3.946,4.201,3.664,3.735,3.682,3.735,3.664,4.201,3.946,2.867,3.235,4.324,4.243,3.917,3.642,3.386,3.214,3.107,2.427,2.465,2.498,2.446,1.612,1.728,1.888,2.039,2.228,2.688,2.888],"lasers":[{"x":0.787,"y":-1.925,"z":0,"angle":0,"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"spread":3,"error":0,"recoil":0},{"x":-0.787,"y":-1.925,"z":0,"angle":0,"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"spread":3,"error":0,"recoil":0},{"x":2.1,"y":-1.225,"z":-0.35,"angle":0,"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.1,"y":-1.225,"z":-0.35,"angle":0,"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.324}}',
                            '{"name":"Mercury","level":4,"model":4,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[100,150],"reload":[30,50]},"ship":{"mass":200,"speed":[85,105],"rotation":[60,90],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-50,-40,-30,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,15,20,30,35,20,0],"height":[1,5,10,15,25,15,10,0],"texture":[1,4,3,63,11,10,12],"propeller":true,"laser":{"damage":[20,40],"rate":1,"type":2,"speed":[170,200],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-20,0,20,50],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":[4,9,4,4],"propeller":false},"deco":{"section_segments":8,"offset":{"x":70,"y":0,"z":-10},"position":{"x":[0,0,0,10,-5,0,0,0],"y":[-115,-80,-100,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,15,15,20,10,0],"height":[1,5,15,20,35,30,10,0],"texture":[6,6,4,63,63,4,12],"angle":0,"propeller":true},"wingends":{"section_segments":8,"offset":{"x":115,"y":25,"z":-5},"position":{"x":[0,2,4,2,0,0],"y":[-20,-10,0,10,20,15],"z":[0,0,0,0,0,0]},"width":[2,3,6,3,4,0],"height":[5,15,22,17,5,0],"texture":[4,4,4,4,6],"propeller":true,"angle":2,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"error":0}}},"wings":{"main":{"length":[80,40],"width":[40,30,20],"angle":[-10,20],"position":[30,50,30],"texture":[11,11],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}},"font":{"length":[80,30],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Mercury","level":4,"model":4,"code":404,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[100,150],"reload":[30,50]},"ship":{"mass":200,"speed":[85,105],"rotation":[60,90],"acceleration":[60,80]}},"shape":[1.303,1.306,1.221,1.135,3.514,3.457,3.283,3.008,2.819,2.69,2.614,2.461,2.233,3.14,3.312,3.323,3.182,2.865,2.958,3.267,3.33,3.079,2.187,2.651,2.647,2.605,2.647,2.651,2.187,3.079,3.33,3.267,2.958,2.865,3.182,3.323,3.312,3.14,2.233,2.461,2.614,2.69,2.819,3.008,3.283,3.457,3.514,1.135,1.221,1.306],"lasers":[{"x":0,"y":-1.3,"z":0.26,"angle":0,"damage":[20,40],"rate":1,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.972,"y":0.13,"z":-0.13,"angle":2,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.972,"y":0.13,"z":-0.13,"angle":-2,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.514}}',
                            '{"name":"Comet","level":4,"model":5,"size":1.55,"specs":{"shield":{"capacity":[140,185],"reload":[5,8]},"generator":{"capacity":[80,115],"reload":[33,45]},"ship":{"mass":120,"speed":[90,115],"rotation":[70,90],"acceleration":[100,140]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-80,-80,-75,-50,0,50,65],"z":[0,0,0,0,0,0,8.9]},"width":[0,5,12.5,20,30,25,10],"height":[0,4,10,15,15,15,0],"propeller":false,"texture":[4,4,63,4,10,18]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-45,"z":17.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-20,5,35,70,70],"z":[-5,-2.5,0,0,0,0]},"width":[5,10,15,14,10,5],"height":[0,10,15,14,10,5],"propeller":false,"texture":[7,9,3,63]},"cannon1":{"section_segments":12,"offset":{"x":60,"y":20,"z":15},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,0,20,55],"z":[0,0,0,0,0,0]},"width":[0,2.5,5,5,7.5,5],"height":[0,2.5,5,5,7.5,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"error":0},"propeller":false,"texture":[17,18,13,4,4]},"cannon2":{"section_segments":12,"offset":{"x":60,"y":20,"z":5},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,0,20,55],"z":[0,0,0,0,0,0]},"width":[0,2.5,5,5,7.5,5],"height":[0,2.5,5,5,7.5,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"error":0},"propeller":false,"texture":[17,18,13,4,4]},"deco":{"section_segments":8,"offset":{"x":70,"y":55,"z":10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,20,22],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"texture":[4,63,3,63,4]},"propulsors":{"section_segments":6,"offset":{"x":17.5,"y":20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,5,5,0,0,0]},"width":[0,10,10,20,17.5,15,15,20,15,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[18,2,3,4,63,8,4,63,16.9],"propeller":true}},"wings":{"main":{"length":[80],"width":[90,30,40],"angle":[0,0],"position":[0,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63],"offset":{"x":0,"y":0,"z":10}}},"typespec":{"name":"Comet","level":4,"model":5,"code":405,"specs":{"shield":{"capacity":[140,185],"reload":[5,8]},"generator":{"capacity":[80,115],"reload":[33,45]},"ship":{"mass":120,"speed":[90,115],"rotation":[70,90],"acceleration":[100,140]}},"shape":[2.485,2.483,2.249,1.825,1.527,1.31,1.171,1.07,1.024,2.149,2.098,2.036,2.014,2.39,2.562,2.812,3.005,3.161,3.255,3.288,3.017,2.303,2.367,2.281,2.209,2.165,2.209,2.281,2.367,2.303,3.017,3.288,3.255,3.161,3.005,2.812,2.562,2.39,2.015,2.036,2.098,2.149,1.024,1.07,1.171,1.31,1.527,1.825,2.249,2.483],"lasers":[{"x":1.86,"y":-0.93,"z":0.465,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.86,"y":-0.93,"z":0.465,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.86,"y":-0.93,"z":0.155,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.86,"y":-0.93,"z":0.155,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.288}}',
                            '{"name":"Axis","level":4,"model":6,"size":1.6,"specs":{"shield":{"capacity":[155,195],"reload":[4,7]},"generator":{"capacity":[80,125],"reload":[25,42]},"ship":{"mass":175,"speed":[60,105],"rotation":[50,75],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":11,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-50,-34,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4,14,20,24,25,25,25,20,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,63,10,3,8,4,12,17],"propeller":true,"laser":{"damage":[10,16],"rate":3,"type":1,"speed":[130,190],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-85,"z":19},"position":{"x":[0,0,0,0,0,0],"y":[25,45,60,95,105],"z":[-1,-4,-3,-6,3]},"width":[4,12,14,15,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4]},"MainGun":{"section_segments":10,"offset":{"x":0,"y":-12,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-100,-110,-45,0,30,40,70,75,80,84],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,15,15,15,10,0],"height":[0,5,5,15,15,15,15,15,10,0],"texture":[17,12,4,63,4,18,4,13,3],"laser":{"damage":[4,8],"rate":5,"type":1,"speed":[125,190],"recoil":0,"number":1,"error":0},"propeller":false},"UselessGun":{"section_segments":12,"offset":{"x":35,"y":-5,"z":0},"position":{"x":[0,0,5,5,-3,0,0,0,0,0],"y":[-40,-30,-5,35,60,65,70,75,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,5,10,10,15,10,10,5,0],"texture":[6,4,12,4,63,18,4,17],"propeller":true,"laser":{"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"recoil":0,"number":1,"error":0}}},"wings":{"main":{"length":[20,50,20],"width":[0,50,40,60],"angle":[0,-10,20],"position":[20,50,10,25],"texture":[3,8,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":-10,"z":0}},"front":{"length":[45],"width":[180,25],"angle":[-16],"position":[-30,26],"texture":[63],"doubleside":true,"bump":{"position":-50,"size":2},"offset":{"x":6,"y":0,"z":10}},"shields":{"doubleside":true,"offset":{"x":46,"y":10,"z":-11},"length":[0,10,20,10],"width":[20,20,55,55,20,20],"angle":[0,50,110,190],"position":[10,10,0,0,10],"texture":[7],"bump":{"position":0,"size":4}}},"typespec":{"name":"Axis","level":4,"model":6,"code":406,"specs":{"shield":{"capacity":[155,195],"reload":[4,7]},"generator":{"capacity":[80,125],"reload":[25,42]},"ship":{"mass":175,"speed":[60,105],"rotation":[50,75],"acceleration":[80,100]}},"shape":[3.908,3.695,2.824,2.294,1.984,1.824,1.799,1.717,1.654,1.616,2.425,2.858,2.838,2.838,2.905,3.029,3.164,2.071,2.11,2.335,2.55,2.58,2.475,2.328,2.28,2.304,2.28,2.328,2.475,2.58,2.55,2.335,2.11,2.071,3.164,3.029,2.905,2.838,2.838,2.858,2.425,1.616,1.654,1.717,1.799,1.824,1.984,2.294,2.824,3.695],"lasers":[{"x":0,"y":-3.04,"z":0.32,"angle":0,"damage":[10,16],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-3.904,"z":0,"angle":0,"damage":[4,8],"rate":5,"type":1,"speed":[125,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.12,"y":-1.44,"z":0,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.12,"y":-1.44,"z":0,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.908}}',
                            '{"name":"Starslicer","level":4,"model":7,"size":1.6,"specs":{"shield":{"capacity":[160,210],"reload":[4,6]},"generator":{"capacity":[90,165],"reload":[26,42]},"ship":{"mass":170,"speed":[90,110],"rotation":[40,90],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-97,-80,-76,-20,0,20,60,80,90,100,90],"z":[-7,-7,-4,-4,0,0,0,0,0,0,0,0]},"width":[0,10,20,20,20,15,25,25,20,20,15,0],"height":[0,7,11,11,11,10,11,14,14,14,11,0],"texture":[1,2,4,10,63,3,10,63,4,13,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-18,-5,0,10,16,18],"z":[0,0,0,0,0,0,0]},"width":[0,7,9,9,9,4,0],"height":[0,6,8,8,8,6,0],"texture":9},"guns_1":{"section_segments":8,"offset":{"x":28,"y":-30,"z":-5},"position":{"x":[0,0,0,0,0,0,0,-3,-3],"y":[-45,-40,-12,0,40,50,60,80,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,8,8,8,8,0],"height":[0,5,5,5,5,5,5,5,0],"texture":[6,63,4,12,4,4,3],"laser":{"damage":[3,5],"speed":[130,190],"rate":4,"number":1,"angle":0}},"guns_2":{"section_segments":8,"offset":{"x":50,"y":39,"z":-18},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-10,25,45,40],"z":[0,0,0,0,0,0]},"width":[0,5,7,7,6,0],"height":[0,5,7,7,6,0],"texture":[6,63,4,3,18],"angle":2,"laser":{"damage":[3,5],"speed":[130,190],"rate":4,"number":1,"angle":0}}},"wings":{"wing_1":{"length":[50,20],"width":[110,50,40],"angle":[-30,10],"position":[40,70,60],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":10,"y":-15,"z":5}}},"typespec":{"name":"Starslicer","level":4,"model":7,"code":407,"specs":{"shield":{"capacity":[160,210],"reload":[4,6]},"generator":{"capacity":[90,165],"reload":[26,42]},"ship":{"mass":170,"speed":[90,110],"rotation":[40,90],"acceleration":[100,130]}},"shape":[3.2,3.147,2.801,2.562,2.476,1.965,1.67,1.517,1.383,1.285,1.218,1.171,1.718,1.753,1.822,2.509,2.661,2.887,3.128,3.112,3.252,3.18,2.824,3.063,3.236,3.206,3.236,3.063,2.824,3.18,3.252,3.112,3.128,2.887,2.661,2.509,1.822,1.753,1.718,1.171,1.218,1.285,1.383,1.517,1.67,1.965,2.476,2.562,2.801,3.147],"lasers":[{"x":0.896,"y":-2.4,"z":-0.16,"angle":0,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.896,"y":-2.4,"z":-0.16,"angle":0,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.55,"y":-0.191,"z":-0.576,"angle":2,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.55,"y":-0.191,"z":-0.576,"angle":-2,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.252}}',
                            '{"name":"Pioneer","level":4,"model":17,"size":1.6,"specs":{"shield":{"capacity":[175,230],"reload":[4,8]},"generator":{"capacity":[50,100],"reload":[25,32]},"ship":{"mass":250,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-95,-85,-60,-10,0,20,50,80,100,90],"z":[-10,-5,0,0,0,0,0,0,0,0,0]},"width":[10,35,45,50,30,40,50,50,20,0],"height":[0,15,20,20,20,30,30,20,10,0],"texture":[2,2,10,2,4,11,11,63,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":[9],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":25,"y":-70,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,3,5,5,5,3],"height":[0,3,5,5,5,3],"texture":[6,6,4,4,4],"angle":0,"laser":{"damage":[6,11],"rate":3,"type":1,"speed":[105,160],"number":1,"error":0}},"shield":{"section_segments":12,"offset":{"x":60,"y":-40,"z":0},"position":{"x":[0,5,3,5,0,0],"y":[-30,-20,0,20,30,20],"z":[0,0,0,0,0,0]},"width":[0,10,10,10,5,0],"height":[10,25,30,25,15,0],"propeller":true,"texture":[4,4,4,4,17],"angle":0},"shield2":{"section_segments":12,"offset":{"x":60,"y":60,"z":0},"position":{"x":[0,5,3,5,0,0],"y":[-30,-20,0,20,30,20],"z":[0,0,0,0,0,0]},"width":[0,10,10,10,5,0],"height":[10,25,30,25,15,0],"propeller":true,"texture":[4,4,4,4,17],"angle":0}},"wings":{"side_joins":{"offset":{"x":0,"y":56,"z":0},"length":[70],"width":[70,30],"angle":[0],"position":[0,0,0,50],"texture":[3],"bump":{"position":10,"size":10}},"side_joins2":{"offset":{"x":0,"y":-37,"z":-3},"length":[70],"width":[70,30],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":10,"size":10}}},"typespec":{"name":"Pioneer","level":4,"model":17,"code":417,"specs":{"shield":{"capacity":[175,230],"reload":[4,8]},"generator":{"capacity":[50,100],"reload":[25,32]},"ship":{"mass":250,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"shape":[3.046,3.057,3.323,3.076,2.803,2.524,3.006,3.073,2.942,2.664,2.548,2.441,1.29,1.032,1.136,1.287,2.732,2.911,3.245,3.523,3.553,3.411,3.132,3.263,3.258,3.206,3.258,3.263,3.132,3.411,3.553,3.523,3.245,2.911,2.732,1.287,1.136,1.032,1.29,2.441,2.548,2.664,2.942,3.073,3.006,2.524,2.803,3.076,3.323,3.057],"lasers":[{"x":0.8,"y":-3.2,"z":0.48,"angle":0,"damage":[6,11],"rate":3,"type":1,"speed":[105,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.8,"y":-3.2,"z":0.48,"angle":0,"damage":[6,11],"rate":3,"type":1,"speed":[105,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.553}}',
                        ]
                    }
                ]
            },
            {
                TIER: 5,
                SHIPS: [
                    {
                        ORIGIN: "MCST",
                        CODES: [
                            '{"name":"Stinger","level":5,"model":1,"size":1.65,"specs":{"shield":{"capacity":[200,275],"reload":[5,8]},"generator":{"capacity":[100,150],"reload":[27,45]},"ship":{"mass":190,"speed":[95,118],"rotation":[60,90],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-125,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[10,20,15,47,50,80,120,135,145,190,210,200],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,6,15,16,23,24,21,30,35,25,0],"height":[0,5,6,14,15,17,20,20.5,20,30,20,0],"propeller":true,"texture":[6,6,4,5,10,3,63,2,11,13,17],"laser":{"damage":[6,9],"rate":10,"type":1,"speed":[190,240],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-78,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,15,35,50,65,75],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,13,13,10,0],"height":[0,15,20,20,15,0],"propeller":false,"texture":[7,9,4,4,4]},"side_cannon":{"section_segments":6,"offset":{"x":45,"y":-59,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,10,-10,20,50,60,120,130,120],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,5,8,8,10,10,6,0],"height":[0,2,5,8,8,20,20,6,0],"propeller":true,"texture":[4,4,4,4,63,10,12,17],"laser":{"damage":[4,7],"rate":10,"type":1,"speed":[190,240],"recoil":0,"number":1,"error":0}}},"wings":{"wing":{"length":[40],"width":[30,20],"angle":[0],"position":[0,35],"doubleside":true,"offset":{"x":0,"y":-80,"z":0},"bump":{"position":19,"size":20},"texture":[63]},"wingmain":{"length":[45,30],"width":[70,30,10],"angle":[0,-40],"position":[20,0,-45],"doubleside":true,"offset":{"x":20,"y":30,"z":0},"bump":{"position":19,"size":20},"texture":[4,63]},"top":{"length":[50],"width":[40,10],"angle":[30],"position":[0,35],"doubleside":true,"offset":{"x":0,"y":30,"z":10},"bump":{"position":19,"size":10},"texture":[63]}},"typespec":{"name":"Stinger","level":5,"model":1,"code":501,"specs":{"shield":{"capacity":[200,275],"reload":[5,8]},"generator":{"capacity":[100,150],"reload":[27,45]},"ship":{"mass":190,"speed":[95,118],"rotation":[60,90],"acceleration":[100,130]}},"shape":[3.795,3.51,2.67,2.482,2.697,2.799,2.587,2.315,2.114,1.955,1.841,2.977,2.926,2.765,2.647,2.577,2.566,2.609,2.591,2.729,2.869,2.775,2.783,2.913,2.855,2.81,2.855,2.913,2.783,2.775,2.869,2.729,2.591,2.609,2.566,2.577,2.647,2.765,2.926,2.977,1.841,1.955,2.114,2.315,2.587,2.799,2.697,2.482,2.67,3.51],"lasers":[{"x":0,"y":-3.795,"z":0,"angle":0,"damage":[6,9],"rate":10,"type":1,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.485,"y":-2.277,"z":0,"angle":0,"damage":[4,7],"rate":10,"type":1,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.485,"y":-2.277,"z":0,"angle":0,"damage":[4,7],"rate":10,"type":1,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.795}}',
                            '{"name":"Delta-Sniper","level":5,"model":3,"size":1.5,"specs":{"shield":{"capacity":[185,260],"reload":[5,8]},"generator":{"capacity":[80,130],"reload":[25,47]},"ship":{"mass":175,"speed":[80,115],"rotation":[55,80],"acceleration":[80,95]}},"bodies":{"cockpit":{"section_segments":8,"offset":{"x":0,"y":-10,"z":12},"position":{"x":[0,0,0,0,0],"y":[-45,-30,0,30,40],"z":[-7,-3,0,5,3]},"width":[0,8,15,16,3],"height":[0,6,8,6,3],"texture":[3,9]},"cockpit2":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-10,"z":10},"position":{"x":[0,0,0,0],"y":[-10,0,50,60],"z":[0,0,5,3]},"width":[5,15,15,3],"height":[5,8,10,5],"texture":[9,2,63]},"propulsor2":{"section_segments":8,"offset":{"x":0,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-30,-30,20,30,60,50],"z":[0,0,0,0,0]},"width":[0,12,10,25,20,0],"height":[0,15,15,15,10,0],"texture":[3,63,4,3,12],"propeller":true},"propulsor":{"section_segments":8,"offset":{"x":90,"y":80,"z":5},"position":{"x":[-75,-10,0,0,0,0],"y":[-110,-45,0,10,40,30],"z":[0,0,0,0,0]},"width":[3,12,10,12,10,0],"height":[0,15,15,15,10,0],"texture":[3,63,4,3,12],"propeller":true},"bumps":{"section_segments":8,"offset":{"x":45,"y":50,"z":5},"position":{"x":[25,5,5,5,5,2],"y":[-90,-45,0,10,40,85],"z":[0,0,0,0,0,0]},"width":[0,5,8,12,5,0],"height":[0,15,18,12,15,0],"texture":[63,3,4,63,4],"angle":40},"gunsupport":{"section_segments":8,"offset":{"x":30,"y":-40,"z":5},"position":{"x":[-30,-20,-10,-10,0,0],"y":[-20,-15,-5,10,60,65],"z":[-20,-20,-10,0,0,0]},"width":[0,5,8,10,5,0],"height":[5,5,8,12,15,0],"texture":[63,63,4,63,63]},"gun":{"section_segments":8,"offset":{"x":0,"y":-60,"z":-5},"position":{"x":[0,0,0,0],"y":[-20,-10,0,50],"z":[0,0,0,0]},"width":[3,10,12,5],"height":[3,7,8,3],"texture":[6,63,4],"laser":{"damage":[15,25],"rate":2,"type":1,"speed":[180,250],"number":2,"angle":6,"error":0}},"gun2":{"section_segments":8,"offset":{"x":35,"y":-25,"z":-5},"position":{"x":[0,0,0,0],"y":[-20,-10,0,50],"z":[0,0,0,0]},"width":[3,8,10,0],"height":[3,7,8,3],"texture":[6,63,4],"laser":{"damage":[10,18],"rate":2,"type":1,"speed":[180,250],"number":2,"angle":4,"error":0}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-30,"z":5},"length":[85],"width":[110,50,40],"angle":[0,20],"position":[30,100],"texture":18,"bump":{"position":30,"size":10}}},"typespec":{"name":"Delta-Sniper","level":5,"model":3,"code":503,"specs":{"shield":{"capacity":[185,260],"reload":[5,8]},"generator":{"capacity":[80,130],"reload":[25,47]},"ship":{"mass":175,"speed":[80,115],"rotation":[55,80],"acceleration":[80,95]}},"shape":[2.402,2.324,1.875,1.679,1.619,1.752,1.767,1.694,1.619,1.534,1.398,1.373,1.561,1.818,2.276,2.974,3.252,3.65,4.182,4.686,4.672,2.773,2.34,2.766,2.748,2.705,2.748,2.766,2.34,2.773,4.672,4.686,4.182,3.65,3.252,2.974,2.276,1.818,1.561,1.373,1.398,1.534,1.619,1.694,1.767,1.752,1.619,1.679,1.875,2.324],"lasers":[{"x":0,"y":-2.4,"z":-0.15,"angle":0,"damage":[15,25],"rate":2,"type":1,"speed":[180,250],"number":2,"spread":6,"error":0,"recoil":0},{"x":1.05,"y":-1.35,"z":-0.15,"angle":0,"damage":[10,18],"rate":2,"type":1,"speed":[180,250],"number":2,"spread":4,"error":0,"recoil":0},{"x":-1.05,"y":-1.35,"z":-0.15,"angle":0,"damage":[10,18],"rate":2,"type":1,"speed":[180,250],"number":2,"spread":4,"error":0,"recoil":0}],"radius":4.686}}',
                            '{"name":"Raptor","level":5,"model":7,"size":1.1,"specs":{"shield":{"capacity":[190,280],"reload":[6,10]},"generator":{"capacity":[60,130],"reload":[29,48]},"ship":{"mass":220,"speed":[85,110],"rotation":[50,65],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-150,-120,-50,0,70,120,160,185,200,200],"z":[-10,-10,-5,0,0,0,2,3,5,5,5]},"width":[0,15,30,35,35,30,20,15,5,0],"height":[0,15,20,20,20,20,20,15,10,0],"texture":[63,4,3,8,63,11,4,3,13],"propeller":false},"observe":{"section_segments":8,"offset":{"x":0,"y":-70,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-40,25,70,100],"z":[0,0,0,0,0]},"width":[0,10,18,13,0],"height":[0,11,18,15,0],"texture":[4,9,4],"propeller":false},"propulsors":{"section_segments":10,"offset":{"x":38,"y":110,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-15,0,10,20,25,30,45,60,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,20,23,20,20,23,23,23,15,0],"height":[0,20,25,20,20,20,20,25,20,0],"texture":[4,3,63,5,63,3,4],"propeller":true},"vents":{"section_segments":8,"offset":{"x":60,"y":20,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-32,-20,-20,-22,-5,5,20,50,70,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,10,12,15,15,15,15,15,0],"height":[0,5,8,11,11,11,11,11,11,0],"texture":[6,17,3,4,63,8,4,4,4],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":35,"y":-15,"z":-5},"position":{"x":[0,0,0,0,0,0,0],"y":[-75,-70,-20,0,20,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,10,10,5,0],"height":[0,10,10,10,10,5,0],"angle":0,"laser":{"damage":[6,10],"rate":6,"type":1,"speed":[135,190],"number":1,"error":2},"texture":[6,4,3,8,3,8]}},"wings":{"main":{"offset":{"x":0,"y":-5,"z":3},"length":[26,28,60,20],"width":[23,100,112,35,20],"angle":[0,4,-10,10],"position":[47,69,100,20,20],"texture":[4,63,3,63],"doubleside":true,"bump":{"position":0,"size":6}}},"typespec":{"name":"Raptor","level":5,"model":7,"code":507,"specs":{"shield":{"capacity":[190,280],"reload":[6,10]},"generator":{"capacity":[60,130],"reload":[29,48]},"ship":{"mass":220,"speed":[85,110],"rotation":[50,65],"acceleration":[80,100]}},"shape":[4.4,3.913,2.836,2.175,2.116,1.84,1.546,1.354,1.222,1.128,1.065,1.376,2.629,2.943,2.971,2.688,2.553,2.576,2.654,2.773,2.959,3.24,3.849,3.913,3.807,3.302,3.807,3.913,3.849,3.24,2.959,2.773,2.654,2.576,2.553,2.688,2.971,2.943,2.629,1.376,1.065,1.128,1.222,1.354,1.546,1.84,2.116,2.175,2.836,3.913],"lasers":[{"x":0.77,"y":-1.98,"z":-0.11,"angle":0,"damage":[6,10],"rate":6,"type":1,"speed":[135,190],"number":1,"spread":0,"error":2,"recoil":0},{"x":-0.77,"y":-1.98,"z":-0.11,"angle":0,"damage":[6,10],"rate":6,"type":1,"speed":[135,190],"number":1,"spread":0,"error":2,"recoil":0}],"radius":4.4}}',
                            '{"name":"Xeroc","level":5,"model":15,"size":1.95,"specs":{"shield":{"capacity":[240,350],"reload":[5,7]},"generator":{"capacity":[80,150],"reload":[31,52]},"ship":{"mass":325,"speed":[95,110],"rotation":[55,75],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-105,-90,-75,-50,0,30,80,105,120,110],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,14,18,22,25,20,17.5,13.5,0],"height":[0,5,10,15,17.5,17.5,17.5,17.5,13.5,10,0],"propeller":true,"texture":[13,4,63,11,3,4,3,63,13,17]},"Thruster":{"section_segments":12,"offset":{"x":27,"y":-45,"z":0},"position":{"x":[-10,-10,-8,-2,0,0,0,0,0,0],"y":[-15,-30,-15,20,50,90,135,150,140],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,12,17,18,18,18,15,12,0],"height":[0,8,12,14,14,14,10,8,0],"texture":[3,4,3,63,10,4,13,17],"angle":0,"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-95,"z":13},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-17,-5,20,40,90,140],"z":[0,0,0,0,0,0,0]},"width":[5,9,12,12,12,5],"height":[0,12,17,17,17,5],"propeller":false,"texture":[9,9,9,3,63]},"cannon":{"section_segments":12,"offset":{"x":20,"y":-33,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,3,6,6,6,0],"height":[0,3,6,6,6,0],"angle":0,"laser":{"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":[17,4]},"cannoninner":{"section_segments":12,"offset":{"x":20,"y":33,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50],"z":[0,0,0,0,0,0]},"width":[0,3,6,6,6,0],"height":[0,3,6,6,6,0],"angle":0,"laser":{"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":[17,4]},"cannon2":{"section_segments":8,"offset":{"x":45,"y":10,"z":-5},"position":{"x":[0,0,0,-1,-1,-8,-10],"y":[-40,-50,-45,-10,40,70,80],"z":[0,0,0,0,5,5,5]},"width":[0,6,10,18,18,18,0],"height":[0,6,10,10,8,7,0],"angle":3,"laser":{"damage":[3,4],"rate":6,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":[17,63,3,4,63,63]},"cannon3":{"section_segments":8,"offset":{"x":64,"y":21,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[5,-5,5,25,50,55],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,0],"height":[0,3,5,5,5,0],"angle":0,"laser":{"damage":[3,4],"rate":6,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":[17,4,3,4,4]}},"wings":{"main":{"length":[10,50,30,13],"width":[200,165,70,40,20],"angle":[0,0,-20,-10],"position":[-20,-5,60,40,65],"doubleside":true,"bump":{"position":40,"size":1},"texture":[4,3.6,11,63],"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[35],"width":[40,20],"angle":[50],"position":[60,80],"doubleside":true,"texture":[2],"bump":{"position":0,"size":10},"offset":{"x":25,"y":5,"z":5}}},"typespec":{"name":"Xeroc","level":5,"model":15,"code":515,"specs":{"shield":{"capacity":[240,350],"reload":[5,7]},"generator":{"capacity":[80,150],"reload":[31,52]},"ship":{"mass":325,"speed":[95,110],"rotation":[55,75],"acceleration":[80,100]}},"shape":[5.269,4.93,3.484,3.136,2.942,2.648,2.364,2.465,2.475,2.406,2.349,2.348,2.398,2.432,3.591,3.959,4.492,4.865,4.906,4.231,4.376,4.382,4.368,4.306,4.169,3.517,4.169,4.306,4.368,4.382,4.376,4.231,4.906,4.865,4.492,3.959,3.591,2.432,2.398,2.348,2.349,2.406,2.475,2.465,2.364,2.648,2.942,3.136,3.484,4.93],"lasers":[{"x":0.78,"y":-3.237,"z":-0.39,"angle":0,"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.78,"y":-3.237,"z":-0.39,"angle":0,"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.78,"y":-0.663,"z":-0.39,"angle":0,"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.78,"y":-0.663,"z":-0.39,"angle":0,"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.653,"y":-1.557,"z":-0.195,"angle":3,"damage":[3,4],"rate":6,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.653,"y":-1.557,"z":-0.195,"angle":-3,"damage":[3,4],"rate":6,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.496,"y":0.624,"z":-0.39,"angle":0,"damage":[3,4],"rate":6,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.496,"y":0.624,"z":-0.39,"angle":0,"damage":[3,4],"rate":6,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.269}}',
                            '{"name":"Scyther","level":5,"model":52,"size":3,"specs":{"shield":{"capacity":[175,290],"reload":[6,8]},"generator":{"capacity":[100,160],"reload":[33,55]},"ship":{"mass":280,"speed":[90,120],"rotation":[70,90],"acceleration":[110,150]}},"bodies":{"main":{"section_segments":13,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-33,-30,-24,-20,10,13,25,58,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,6.5,8,15,13.5,13,14,16,14,10,0],"height":[0,2,4,5,16,15,14,14.5,15,14,10,0],"texture":[6,2,2,10,5,63,3,5,4,13,17],"propeller":true,"laser":{"damage":[13,20],"rate":3,"type":1,"speed":[150,200],"recoil":0,"number":1,"angle":0,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-72,"z":4},"position":{"x":[0,0,0,0,0,0],"y":[23,35,50,55,55],"z":[0,-2,2,0,0]},"width":[3,8,7,6,4],"height":[1.7,10,10,10,0],"texture":[9,9,9]},"cannons1":{"section_segments":10,"offset":{"x":37,"y":7,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-45,-20,0,20,30,33],"z":[0,0,0,0,0,0,0]},"width":[0,2,4,5,5,5,0],"height":[0,2,4,5,5,5,0],"angle":0,"laser":{"damage":[6,8],"rate":5,"type":1,"speed":[150,180],"number":1,"angle":0,"error":0},"propeller":false,"texture":[17,4,2,3,63,4]},"Engine_top":{"section_segments":12,"offset":{"x":0,"y":25,"z":30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-24,-20,-23,-20,0,20,30,25],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,4,5,5,5,3,0],"height":[0,2,4,5,5,5,3,0],"angle":0,"propeller":true,"texture":[4,13,63,8,4,63,17],"laser":{"damage":[13,20],"rate":3,"type":1,"speed":[150,200],"recoil":0,"number":1,"angle":0,"error":0}},"Engines1":{"section_segments":12,"offset":{"x":47,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-24,-23,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,2,5,5,5,3,0],"height":[0,2,5,5,5,3,0],"angle":0,"propeller":true,"texture":[4,63,8,4,63,17]}},"wings":{"wing_1":{"doubleside":true,"offset":{"x":7,"y":-4,"z":6},"length":[40],"width":[40,30],"angle":[-6],"position":[20,10],"texture":[11],"bump":{"position":0,"size":8}},"wing_top":{"doubleside":true,"offset":{"x":0,"y":-4,"z":6},"length":[0,25],"width":[0,40,30],"angle":[0,90],"position":[20,20,40],"texture":[3],"bump":{"position":0,"size":8}}},"typespec":{"name":"Scyther","level":5,"model":52,"code":552,"specs":{"shield":{"capacity":[175,290],"reload":[6,8]},"generator":{"capacity":[100,160],"reload":[33,55]},"ship":{"mass":280,"speed":[90,120],"rotation":[70,90],"acceleration":[110,150]}},"shape":[3.78,3.531,2.816,2.209,1.844,1.596,3.263,3.206,2.936,3.06,3.247,3.219,3.144,3.144,3.219,3.352,3.516,3.662,3.573,3.321,2.288,2.215,2.802,3.506,3.649,3.607,3.649,3.506,2.802,2.215,2.288,3.321,3.573,3.662,3.516,3.352,3.219,3.144,3.144,3.219,3.247,3.06,2.936,3.206,3.263,1.596,1.844,2.209,2.816,3.531],"lasers":[{"x":0,"y":-3.78,"z":0,"angle":0,"damage":[13,20],"rate":3,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.22,"y":-2.28,"z":0.06,"angle":0,"damage":[6,8],"rate":5,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.22,"y":-2.28,"z":0.06,"angle":0,"damage":[6,8],"rate":5,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":0.06,"z":1.8,"angle":0,"damage":[13,20],"rate":3,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.78}}',
                            '{"name":"Piercer","level":5,"model":55,"size":2.4,"specs":{"shield":{"capacity":[190,260],"reload":[5,7]},"generator":{"capacity":[110,170],"reload":[34,50]},"ship":{"mass":275,"speed":[60,115],"rotation":[50,70],"acceleration":[60,80]}},"bodies":{"command":{"section_segments":12,"offset":{"x":0,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-70,-60,-40,-5,10,20,30,45,40],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,15,18,14,13,11,8,0],"height":[0,11,16,22,20,15,13,10,0],"texture":[63,10,3,11,63,4,12,17],"propeller":1},"sneak":{"section_segments":8,"offset":{"x":-41,"y":70,"z":-7},"position":{"x":[20,21,22,8,8,6,5,5,5,10],"y":[-140,-145,-150,-100,-90,-70,-62,-50,-40,-30],"z":[-13,-13,-13,-15,-13,-8,-5,0,0,0]},"width":[0,5,8,14,10,10,15,10,7,0],"height":[0,5,8,10,10,10,10,8,5,0],"texture":[17,63,4,63,8,63,4,3,63],"propeller":0,"laser":{"damage":[2.5,4],"rate":8,"type":1,"speed":[140,190],"number":1,"error":2}},"advance":{"section_segments":8,"offset":{"x":26,"y":95,"z":5},"position":{"x":[0,0,0,0,0],"y":[-54,-48,-30,-20,-30],"z":[0,0,0,0,0]},"width":[0,8,11,6,0],"height":[0,8,14,6,0],"texture":[63,8,4,17],"propeller":true},"observe":{"section_segments":8,"offset":{"x":0,"y":22,"z":12},"position":{"x":[0,0,0,0,0],"y":[-45,-30,-14,0,20],"z":[-6,-1,3,0,0]},"width":[0,5,8,7,0],"height":[0,8,12,15,0],"texture":[7,9,9,4],"propeller":false},"oblivion":{"section_segments":8,"offset":{"x":0,"y":-3,"z":-25},"position":{"x":[0,0,0,0,0],"y":[-55,-40,-40,-20,40],"z":[5,4,4,5,8]},"width":[0,3,5,8,0],"height":[0,3,5,10,0],"angle":0,"laser":{"damage":[35,50],"rate":1,"type":1,"speed":[120,185],"number":1,"error":0},"propeller":false,"texture":[6,10,3]},"resource":{"section_segments":8,"offset":{"x":40,"y":-10,"z":-25},"position":{"x":[-4,0,10,7],"y":[-55,-45,-20,-10],"z":[0,0,0,0]},"width":[0,5,9,0],"height":[0,5,10,0],"angle":3,"propeller":false,"texture":[6,63,4]}},"wings":{"unite":{"offset":{"x":8,"y":-10,"z":-6},"length":[35,0],"width":[25,15],"angle":[-35,0],"position":[0,0],"texture":63,"doubleside":true,"bump":{"position":0,"size":25}},"negative":{"offset":{"x":5,"y":50,"z":-9},"length":[15,15,0],"width":[20,17,7],"angle":[30,20,0],"position":[0,10,15],"texture":[63],"doubleside":true,"bump":{"position":-10,"size":15}}},"typespec":{"name":"Piercer","level":5,"model":55,"code":555,"specs":{"shield":{"capacity":[190,260],"reload":[5,7]},"generator":{"capacity":[110,170],"reload":[34,50]},"ship":{"mass":275,"speed":[60,115],"rotation":[50,70],"acceleration":[60,80]}},"shape":[2.784,3.909,4.038,4.053,3.586,3.401,3.308,3.201,3.151,3.153,2.233,2.174,2.159,2.403,2.478,2.432,2.445,2.517,2.503,2.446,3.175,3.798,3.914,3.785,3.62,3.607,3.62,3.785,3.914,3.798,3.175,2.446,2.503,2.517,2.445,2.432,2.478,2.403,2.16,2.174,2.233,3.153,3.151,3.201,3.308,3.401,3.586,4.053,4.038,3.909],"lasers":[{"x":-0.912,"y":-3.84,"z":-0.336,"angle":0,"damage":[2.5,4],"rate":8,"type":1,"speed":[140,190],"number":1,"spread":0,"error":2,"recoil":0},{"x":0.912,"y":-3.84,"z":-0.336,"angle":0,"damage":[2.5,4],"rate":8,"type":1,"speed":[140,190],"number":1,"spread":0,"error":2,"recoil":0},{"x":0,"y":-2.784,"z":-1.2,"angle":0,"damage":[35,50],"rate":1,"type":1,"speed":[120,185],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.053}}',
                            '{"name":"Fortitude","level":5,"model":56,"size":1.6,"specs":{"shield":{"capacity":[200,325],"reload":[5,10]},"generator":{"capacity":[100,145],"reload":[32,42]},"ship":{"mass":200,"speed":[70,110],"rotation":[60,80],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-75,-55,-40,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,18,23,30,30,35,30,25,0],"height":[0,5,10,15,20,25,20,15,15,0],"texture":[12,4,63,2,3,10,18,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-25,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-20,0,25,70],"z":[0,0,0,5,0]},"width":[0,15,17,12,0],"height":[0,18,25,18,0],"texture":[9,9,4,13]},"cannons":{"section_segments":8,"offset":{"x":52.5,"y":-100,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-2,0,23,27,62,68,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,4,4,5,7],"height":[0,3,5,5,5,4,4,5,7],"texture":[6,4,63,3,63,4,63,3],"propeller":false,"laser":{"damage":[18,25],"rate":3,"type":2,"speed":[155,200],"recoil":70,"number":1,"error":0}},"cannons2":{"section_segments":8,"offset":{"x":42.5,"y":-105,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-2,0,23,27,62,68,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,4,4,5,7],"height":[0,3,5,5,5,4,4,5,7],"texture":[6,4,63,3,63,4,63,3],"propeller":false,"laser":{"damage":[18,25],"rate":3,"type":2,"speed":[155,200],"recoil":70,"number":1,"error":0}}},"wings":{"main3":{"doubleside":true,"offset":{"x":0,"y":50,"z":5},"length":[25,35,0,10],"width":[40,70,40,200,80],"angle":[-20,-10,-20,20],"position":[-20,-30,0,-30,-20],"texture":[0,11,13,4],"bump":{"position":35,"size":10}},"side_joins":{"offset":{"x":20,"y":28,"z":3},"length":[40],"width":[40,20],"angle":[-10],"position":[0,30],"texture":[63],"bump":{"position":35,"size":10}},"font":{"doubleside":true,"offset":{"x":10,"y":-70,"z":3},"length":[52],"width":[20,5],"angle":[-15],"position":[0,20],"texture":[4],"bump":{"position":35,"size":30}},"top":{"doubleside":true,"offset":{"x":10,"y":20,"z":15},"length":[0,30],"width":[0,70,20],"angle":[0,40],"position":[0,0,50],"texture":[4],"bump":{"position":10,"size":5}}},"typespec":{"name":"Fortitude","level":5,"model":56,"code":556,"specs":{"shield":{"capacity":[200,325],"reload":[5,10]},"generator":{"capacity":[100,145],"reload":[32,42]},"ship":{"mass":200,"speed":[70,110],"rotation":[60,80],"acceleration":[80,120]}},"shape":[3.2,3.046,2.593,3.684,3.671,3.372,2.955,2.671,2.469,2.329,2.242,2.194,2.172,2.172,2.225,2.31,2.45,2.654,2.947,3.316,3.744,4.264,2.769,2.355,2.28,2.244,2.28,2.355,2.769,4.264,3.744,3.316,2.947,2.654,2.45,2.31,2.225,2.172,2.172,2.194,2.242,2.329,2.469,2.671,2.955,3.372,3.671,3.684,2.593,3.046],"lasers":[{"x":1.68,"y":-3.264,"z":-0.32,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[155,200],"number":1,"spread":0,"error":0,"recoil":70},{"x":-1.68,"y":-3.264,"z":-0.32,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[155,200],"number":1,"spread":0,"error":0,"recoil":70},{"x":1.36,"y":-3.424,"z":-0.256,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[155,200],"number":1,"spread":0,"error":0,"recoil":70},{"x":-1.36,"y":-3.424,"z":-0.256,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[155,200],"number":1,"spread":0,"error":0,"recoil":70}],"radius":4.264}}',
                            '{"name":"Genesis","level":5,"model":58,"size":2.4,"specs":{"shield":{"capacity":[215,315],"reload":[5,7]},"generator":{"capacity":[150,200],"reload":[36,49]},"ship":{"mass":270,"speed":[80,110],"rotation":[55,85],"acceleration":[60,100]}},"bodies":{"main":{"section_segments":13,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-82,-75,-59,-20,0,20,30,50,55,56],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,13,18,17,17,17,17,10,0],"height":[0,3.4,10,12,13,13,13,13,10,0],"texture":[63,2,10,2,3,4,4,3,1],"propeller":false},"cockpit":{"section_segments":7,"offset":{"x":0,"y":-32,"z":3.6},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-20,6,20,20],"z":[7,2,0,0,0]},"width":[0,7,10,7,0],"height":[0,8,13,8,0],"texture":[9,9,4],"propeller":false},"Body":{"section_segments":12,"offset":{"x":7,"y":13,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-16,-10,-1,22,25,25,30,30,35,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,18,20,20,20,20,20,20,20,0],"height":[0,10,10,10,10,10,10,10,10,10,0],"propeller":false,"texture":[4,3,2,10,2,2,2,3,3,4]},"cannons":{"section_segments":12,"offset":{"x":15,"y":-34,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-20,-22,0,20,20],"z":[0,0,0,0,0]},"width":[0,2,2,2,1],"height":[0,2,2,2,1],"texture":[12,3,4,4],"angle":0,"laser":{"damage":[4.5,7.5],"rate":5,"type":1,"speed":[140,190],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":35,"y":-43,"z":-8},"position":{"x":[0,0,0,0,0],"y":[-20,-22,0,20,25],"z":[0,0,0,0,0]},"width":[0,2.5,2.5,2.5,0],"height":[0,2.5,2.5,2.5,0],"texture":[12,12,4,2],"angle":0,"laser":{"damage":[8,14],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0}},"propulsor":{"section_segments":12,"offset":{"x":0,"y":40,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-28,-30,-25,0,10,10,25,30,30,40,30],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,10,10,6,6,5,5,0],"height":[0,6,10,10,10,10,6,6,5,5,0],"propeller":true,"texture":[13,63,8,63,63,3,4,5,12,17]},"propulsor2":{"section_segments":12,"offset":{"x":50,"y":41,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-28,-30,-25,0,10,10,25,30,30,40,30],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,10,10,6,6,5,5,0],"height":[0,6,10,10,10,10,6,6,5,5,0],"propeller":true,"texture":[13,63,8,63,63,3,4,5,12,17]}},"wings":{"main1":{"doubleside":true,"offset":{"x":-6,"y":-38,"z":3},"length":[15,32,0,15],"width":[30,30,30,80,0],"angle":[-30,-10,-20,26],"position":[10,10,0,0,0],"texture":[0,18,13,63],"bump":{"position":5,"size":15}},"main2":{"doubleside":true,"offset":{"x":15,"y":43,"z":0},"length":[0,0,0,10],"width":[20,20,20,55,0],"angle":[0,0,0,20],"position":[0,0,0,0,0],"texture":[0,18,12,63],"bump":{"position":3,"size":15}},"Boosters":{"doubleside":true,"offset":{"x":10,"y":20,"z":0},"length":[0,0,15,19,5],"width":[20,20,20,20,20,20],"angle":[0,10,10,10,10],"position":[10,10,10,10,10,10],"texture":[1,1,18,18],"bump":{"position":-40,"size":5}},"Engine_Support":{"offset":{"x":0,"y":-60,"z":10},"doubleside":true,"length":[5,20],"width":[30,30,30],"angle":[90,90],"position":[90,90,90],"texture":[4],"bump":{"position":10,"size":10}},"frontthing":{"doubleside":true,"offset":{"x":10,"y":-52,"z":0},"length":[0,13,0],"width":[0,70,30,0],"angle":[10,10,10],"position":[0,20,60,60],"texture":[1,63,63],"bump":{"position":50,"size":12}}},"typespec":{"name":"Genesis","level":5,"model":58,"code":558,"specs":{"shield":{"capacity":[215,315],"reload":[5,7]},"generator":{"capacity":[150,200],"reload":[36,49]},"ship":{"mass":270,"speed":[80,110],"rotation":[55,85],"acceleration":[60,100]}},"shape":[3.936,3.671,3.009,2.638,4.175,3.782,3.465,3.236,3.074,2.633,2.324,2.12,1.972,1.881,2.944,3.097,3.281,3.557,3.874,4.215,4.7,4.605,2.95,3.46,3.819,3.847,3.819,3.46,2.95,4.605,4.7,4.215,3.874,3.557,3.281,3.097,2.944,1.874,1.972,2.12,2.324,2.633,3.074,3.236,3.465,3.782,4.175,2.638,3.009,3.671],"lasers":[{"x":0.72,"y":-2.688,"z":-0.24,"angle":0,"damage":[4.5,7.5],"rate":5,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.72,"y":-2.688,"z":-0.24,"angle":0,"damage":[4.5,7.5],"rate":5,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.68,"y":-3.12,"z":-0.384,"angle":0,"damage":[8,14],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.68,"y":-3.12,"z":-0.384,"angle":0,"damage":[8,14],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.7}}',
                            '{"name":"Cobalt","level":5,"model":60,"size":1.5,"specs":{"shield":{"capacity":[210,325],"reload":[6,8]},"generator":{"capacity":[80,120],"reload":[34,57]},"ship":{"mass":285,"speed":[85,115],"rotation":[55,80],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-95,-95,-110,-90,-70,0,95,85],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,10,15,20,30,20,0],"height":[0,2,4,15,20,30,25,0],"texture":[17,12,63,1,10,4,17],"propeller":true,"laser":{"damage":[4,6],"rate":5,"type":1,"speed":[140,220],"number":3,"angle":3,"error":0}},"cannon":{"section_segments":6,"offset":{"x":0,"y":-65,"z":-18},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[7,12],"rate":2,"type":1,"speed":[120,180],"number":2,"angle":5,"error":0},"propeller":false,"texture":[3,3,10,3]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":23},"position":{"x":[0,0,0,0,0,0],"y":[-60,-40,-10,70,85],"z":[-3,-3,0,0,3]},"width":[0,12,15,15,5],"height":[0,15,15,15,0],"texture":[9,9,4]},"propulsors":{"section_segments":8,"offset":{"x":30,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-15,-10,0,10,20,25,30,75,90,85],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,15,20,20,20,18,18,15,10,0],"height":[0,15,15,20,20,20,18,18,15,10,0],"texture":[18,4,63,10,1,1,63,18,4,17],"propeller":true},"side_segments":{"angle":80,"section_segments":4,"offset":{"x":70,"y":10,"z":-5},"position":{"x":[0,0,0,0,-25,-35,0,0,0,0],"y":[-10,0,5,10,20,35],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,65,70,70,30,0],"height":[0,15,20,20,10,0],"texture":[4,63,1,1,63]}},"wings":{"front":{"doubleside":true,"offset":{"x":12,"y":-94,"z":-2},"length":[0,20,15],"width":[0,140,60,0],"angle":[0,0,0],"position":[0,20,40,50],"texture":[1,1,63],"bump":{"position":50,"size":10}},"bridge":{"offset":{"x":0,"y":30,"z":20},"length":[40,40],"width":[70,70,30],"angle":[0,-40],"position":[0,0,0,50],"texture":[8,1],"doubleside":true,"bump":{"position":-40,"size":10}},"main":{"offset":{"x":0,"y":20,"z":-25},"length":[80],"width":[90,40],"angle":[15],"position":[0,10],"texture":[4],"doubleside":true,"bump":{"position":10,"size":20}}},"typespec":{"name":"Cobalt","level":5,"model":60,"code":560,"specs":{"shield":{"capacity":[210,325],"reload":[6,8]},"generator":{"capacity":[80,120],"reload":[34,57]},"ship":{"mass":285,"speed":[85,115],"rotation":[55,80],"acceleration":[90,120]}},"shape":[3.908,4.335,3.483,2.861,2.483,2.233,2.056,1.931,3.25,3.137,2.953,2.823,2.75,2.755,2.89,3.098,3.318,3.285,3.182,3.159,3.133,2.885,2.955,2.839,2.291,2.254,2.291,2.839,2.955,2.885,3.133,3.159,3.182,3.285,3.318,3.098,2.89,2.755,2.75,2.823,2.953,3.137,3.25,1.931,2.056,2.233,2.483,2.861,3.483,4.335],"lasers":[{"x":0,"y":-3.9,"z":0,"angle":0,"damage":[4,6],"rate":5,"type":1,"speed":[140,220],"number":3,"spread":3,"error":0,"recoil":0},{"x":0,"y":-3.45,"z":-0.54,"angle":0,"damage":[7,12],"rate":2,"type":1,"speed":[120,180],"number":2,"spread":5,"error":0,"recoil":0}],"radius":4.335}}',
                        ]
                    }
                ]
            },
            {
                TIER: 6,
                SHIPS: [
                    {
                        ORIGIN: "MCST",
                        CODES: [
                            '{"name":"Xenolith","level":6,"model":3,"size":1.7,"specs":{"shield":{"capacity":[230,320],"reload":[6,9]},"generator":{"capacity":[150,210],"reload":[40,65]},"ship":{"mass":325,"speed":[80,110],"rotation":[60,75],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-86,-90,-50,0,30,70,120,110],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,25,25,30,30,25,0],"height":[0,10,20,20,30,30,10,0],"texture":[12,2,10,11,3,8,17],"propeller":true,"laser":{"damage":[28,35],"speed":[190,200],"rate":4,"type":1,"number":1,"angle":0,"recoil":100}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-30,10,30,40],"z":[0,0,0,0,0]},"width":[7,15,17,17,0],"height":[5,15,15,12,0],"texture":[9,9,4],"propeller":false},"propeller":{"section_segments":12,"offset":{"x":75,"y":70,"z":-45},"position":{"x":[0,0,0,0,0,0,0],"y":[-38,-35,-20,0,10,40,35],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,13,0],"height":[0,10,13,13,13,13,0],"texture":[13,3,4,18,63,13],"propeller":true},"Side":{"section_segments":9,"offset":{"x":25,"y":50,"z":-12},"position":{"x":[-5,-5,-2,0,-4,-4],"y":[-90,-100,-60,20,50,58],"z":[5,5,5,0,0,0,0,0]},"width":[0,8,12,24,14,0],"height":[0,4,15.6,24,14,0],"texture":[4,4,63,4,3]},"cannon":{"section_segments":12,"offset":{"x":0,"y":70,"z":45},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-48,-45,-20,0,20,40,35],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,10,15,15,15,10,0],"height":[0,6,10,13,13,13,13,0],"angle":0,"laser":{"damage":[10,25],"speed":[140,180],"rate":4,"type":1,"number":1,"angle":0,"error":0},"propeller":true,"texture":[6,2,3,4,12,63,13]}},"wings":{"main":{"offset":{"x":0,"y":40,"z":0},"length":[80,0,20],"width":[70,50,60,50],"texture":[11,63,63],"angle":[-20,-40,-40],"position":[10,40,40,40],"doubleside":1,"bump":{"position":-10,"size":15}},"main2":{"offset":{"x":0,"y":40,"z":0},"length":[80,0,20],"width":[70,50,60,50],"texture":[11,63,63],"angle":[-40,-20,-20],"position":[10,40,40,40],"doubleside":1,"bump":{"position":-10,"size":15}},"main3":{"offset":{"x":15,"y":40,"z":0},"length":[40,0,20],"width":[70,50,60,50],"texture":[11,63,63],"angle":[90,100,100],"position":[10,40,40,40],"doubleside":1,"bump":{"position":-30,"size":15}},"main4":{"doubleside":true,"offset":{"x":10,"y":15,"z":-10},"length":[0,35,20,0],"width":[0,160,70,30,30],"angle":[-40,-30,-20,-20],"position":[30,-20,30,60,60],"texture":[13,63,13,8],"bump":{"position":35,"size":10}},"front":{"doubleside":true,"offset":{"x":-5,"y":-75,"z":5},"length":[20,15,0,20],"width":[40,40,90,100,30],"angle":[-30,-30,-30,-30],"position":[30,30,10,5,30],"texture":[13,2,13,4],"bump":{"position":35,"size":7}},"winglets":{"offset":{"x":74,"y":73,"z":-8},"length":[25,15,15,25],"width":[25,100,105,100,25],"angle":[-60,-70,-110,-120],"position":[0,0,0,0,0],"texture":[63,4,4,63],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Xenolith","level":6,"model":3,"code":603,"specs":{"shield":{"capacity":[230,320],"reload":[6,9]},"generator":{"capacity":[150,210],"reload":[40,65]},"ship":{"mass":325,"speed":[80,110],"rotation":[60,75],"acceleration":[90,120]}},"shape":[3.066,3.102,4.17,3.478,2.957,2.612,2.268,1.985,1.79,1.291,1.248,1.227,1.257,1.317,3.221,3.405,3.67,4.044,4.422,4.944,5.283,4.429,3.772,4.168,4.154,4.088,4.154,4.168,3.772,4.429,5.283,4.944,4.422,4.044,3.67,3.405,3.221,1.317,1.257,1.227,1.248,1.291,1.79,1.985,2.268,2.612,2.957,3.478,4.17,3.102],"lasers":[{"x":0,"y":-3.06,"z":0,"angle":0,"damage":[28,35],"rate":4,"type":1,"speed":[190,200],"number":1,"spread":0,"error":0,"recoil":100},{"x":0,"y":0.748,"z":1.53,"angle":0,"damage":[10,25],"rate":4,"type":1,"speed":[140,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.283}}',
                            '{"name":"Kelper","level":6,"model":8,"size":2.05,"specs":{"shield":{"capacity":[325,425],"reload":[4,7]},"generator":{"capacity":[150,240],"reload":[49,72]},"ship":{"mass":375,"speed":[80,115],"rotation":[60,90],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-95,-75,-65,-20,0,45,90,105,95],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,18,20,25,26,27,23,13,0],"height":[0,8,18,20,24,26,27,25,15,0],"texture":[2,63,4,11,1,10,4,12,17],"propeller":true},"cannon":{"section_segments":8,"offset":{"x":31,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-15,0,10,20,20],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,6,4,5,0],"height":[0,5,6,6,4,5,0],"angle":1,"laser":{"damage":[6,10],"rate":3,"type":1,"speed":[130,160],"number":1,"angle":0,"error":0},"propeller":false,"texture":[6,2,3,3,63,3]},"cannon2":{"section_segments":8,"offset":{"x":83.5,"y":28,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,-20,-5,5,10,20,20],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,6,4,5,0],"height":[0,5,6,6,4,5,0],"angle":1,"laser":{"damage":[6,10],"rate":3,"type":1,"speed":[130,160],"number":1,"angle":0,"error":0},"propeller":false,"texture":[6,3,4,3,63,3]},"cannon3":{"section_segments":8,"offset":{"x":8,"y":30,"z":40},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-15,-3,5,10,20,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,4,4.5,3,3.5,0],"height":[0,3,4,4.5,3,3.5,0],"angle":0,"laser":{"damage":[3,6],"rate":5,"type":1,"speed":[160,190],"number":1,"angle":0,"error":0},"propeller":false,"texture":[6,2,2,3,63,3]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":18},"position":{"x":[0,0,0,0,0,0,0],"y":[-55,-40,-25,-10,0,5],"z":[0,0,0,0,1,6,9]},"width":[0,10,13,13,10,0],"height":[0,10,15,15,10,0],"texture":[9,9]},"top":{"section_segments":8,"offset":{"x":0,"y":10,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,-5,10,20,25,30,40,60,70],"z":[1,0,0,0,0,0,0,-3,-4,-10]},"width":[0,10,15,16,16,13,14,14,11,0],"height":[0,10,15,15,16,17,17,17,10,0],"texture":[63,63,3,3,63,3,4,10,1,12],"propeller":false},"side_propulsors":{"section_segments":12,"offset":{"x":83,"y":30,"z":-28},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-17,-15,-5,10,20,30,40,35],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,12,18,18,17,14,15,0,0],"height":[0,13,18,18,17,14,15,0,0],"texture":[4,63,1,1,3,12,17,1,12],"propeller":true},"side_propulsors2":{"section_segments":12,"offset":{"x":47,"y":3,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,-1,-1],"y":[-10,-15,-5,10,15,25,30,35,42,90,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,12,17,17,17,14,14,18,18,14,12,0],"height":[0,12,17,17,17,14,14,18,18,15,12,0],"texture":[18,63,2,3,2,63,2,4,2,3,17],"propeller":true}},"wings":{"side_joins":{"doubleside":true,"offset":{"x":0,"y":35,"z":0},"length":[60,40],"width":[105,65,30],"angle":[-20,-20],"position":[-10,0,15,50],"texture":[11,3],"bump":{"position":10,"size":10}},"cannons_joins":{"doubleside":true,"offset":{"x":20,"y":-45,"z":0},"length":[11],"width":[25,20],"angle":[10],"position":[0,0],"texture":[63],"bump":{"position":10,"size":5}},"winglets":{"doubleside":true,"offset":{"x":59,"y":75,"z":-6},"length":[15],"width":[50,25],"angle":[10],"position":[-10,10],"texture":[63],"bump":{"position":10,"size":5}}},"typespec":{"name":"Kelper","level":6,"model":8,"code":608,"specs":{"shield":{"capacity":[325,425],"reload":[4,7]},"generator":{"capacity":[150,240],"reload":[49,72]},"ship":{"mass":375,"speed":[80,115],"rotation":[60,90],"acceleration":[90,120]}},"shape":[4.519,4.529,3.815,3.174,3.221,2.793,2.374,2.013,1.807,1.297,1.977,2.525,2.625,3.653,4.275,4.452,4.618,4.938,4.882,4.74,5.013,4.847,4.667,3.551,3.728,3.697,3.728,3.551,4.667,4.847,5.013,4.74,4.882,4.938,4.618,4.452,4.275,3.653,2.625,2.525,1.977,1.297,1.807,2.013,2.374,2.793,3.221,3.174,3.815,4.529],"lasers":[{"x":1.25,"y":-2.87,"z":0,"angle":1,"damage":[6,10],"rate":3,"type":1,"speed":[130,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.25,"y":-2.87,"z":0,"angle":-1,"damage":[6,10],"rate":3,"type":1,"speed":[130,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.409,"y":0.328,"z":-0.41,"angle":1,"damage":[6,10],"rate":3,"type":1,"speed":[130,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.409,"y":0.328,"z":-0.41,"angle":-1,"damage":[6,10],"rate":3,"type":1,"speed":[130,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.328,"y":0.615,"z":1.64,"angle":0,"damage":[3,6],"rate":5,"type":1,"speed":[160,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.328,"y":0.615,"z":1.64,"angle":0,"damage":[3,6],"rate":5,"type":1,"speed":[160,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.013}}',
                            '{"name":"Hyperion","level":6,"model":9,"size":2.4,"specs":{"shield":{"capacity":[200,345],"reload":[8,10]},"generator":{"capacity":[120,200],"reload":[40,69]},"ship":{"mass":350,"speed":[90,115],"rotation":[50,80],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":24},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-80,-69,-47,-10,20,50,70,92,60],"z":[-35,-35,-28,-21,-14,-10,-8,0,0]},"width":[0,9,12,23,20,19,20,15,0],"height":[0,6,8,10,11,17,18,5,0],"texture":[4,63,10,3,11,63,4,17],"propeller":false,"laser":{"damage":[15,25],"rate":2,"type":1,"speed":[120,150],"number":6,"angle":12,"error":0}},"frontcannons":{"section_segments":8,"offset":{"x":18,"y":8,"z":-10},"position":{"x":[0,0,0,0,0],"y":[-72,-65,-35,-12,-5],"z":[-8,-7,0,5,7]},"width":[0,5,8,7,0],"height":[0,5,6,6,0],"texture":[6,4,3,63]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":-2},"position":{"x":[0,0,0,0,0,0],"y":[-45,-38,-10,15,45,55],"z":[6,5,13,23,24,28]},"width":[0,6,11,6,6,7],"height":[0,8,12,8,5,0],"texture":[9,9,9,4],"propeller":false},"side_propellers":{"section_segments":8,"offset":{"x":21,"y":30,"z":-7},"position":{"x":[0,0,0,0,0,0,0],"y":[-54,-47,-15,3,20,40,30],"z":[0,0,0,0,0,0,0]},"width":[0,7,12,15,11,10,0],"height":[0,4,10,10,11,6,0],"texture":[3,10,63,4,13,17],"propeller":1},"wingends":{"section_segments":8,"offset":{"x":47,"y":50,"z":-8},"position":{"x":[0,0,5,0],"y":[-54,-43,-15,-1],"z":[-6,-5,0,0]},"width":[0,5,7,0],"height":[0,8,8,0],"texture":4,"propeller":false}},"wings":{"main":{"offset":{"x":0,"y":30,"z":15},"length":[39,15,20],"width":[70,50,30,20],"angle":[-36,-8,-20,0],"position":[0,0,-10,0],"texture":[11,63,63],"doubleside":true,"bump":{"position":10,"size":9}},"connecxnj":{"offset":{"x":-6,"y":30,"z":10},"length":[33,20],"width":[30,30,20],"angle":[35,-30,0],"position":[0,10,30],"texture":[4,63],"doubleside":true,"bump":{"position":0,"size":15}}},"typespec":{"name":"Hyperion","level":6,"model":9,"code":609,"specs":{"shield":{"capacity":[200,345],"reload":[8,10]},"generator":{"capacity":[120,200],"reload":[40,69]},"ship":{"mass":350,"speed":[90,115],"rotation":[50,80],"acceleration":[100,120]}},"shape":[3.84,3.573,3.191,3.093,2.66,2.218,1.926,1.702,1.572,1.544,1.488,1.46,2.342,2.503,2.923,3.366,3.57,3.672,3.254,3.259,3.434,3.831,3.675,4.195,4.474,4.425,4.474,4.195,3.675,3.831,3.434,3.259,3.254,3.672,3.57,3.366,2.923,2.503,2.342,1.46,1.488,1.544,1.572,1.702,1.926,2.218,2.66,3.093,3.191,3.573],"lasers":[{"x":0,"y":-3.84,"z":1.152,"angle":0,"damage":[15,25],"rate":2,"type":1,"speed":[120,150],"number":6,"spread":12,"error":0,"recoil":0}],"radius":4.474}}',
                            '{"name":"Aurora","level":6,"model":10,"size":2.3,"specs":{"shield":{"capacity":[230,380],"reload":[5,7]},"generator":{"capacity":[150,230],"reload":[40,61]},"ship":{"mass":400,"speed":[60,115],"rotation":[50,70],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-92,-95,-85,-50,-20,30,65,75,65],"z":[0,0,0,0,0,0,0,0,0]},"width":[4,7,10,15,20,20,15,10,0],"height":[0,4,8,12,20,20,18,15,0],"propeller":true,"texture":[13,63,1,1,10,4,12,17]},"jet":{"section_segments":12,"offset":{"x":30,"y":-15,"z":-5},"position":{"x":[-20,-10,-5,5,5,0,0,0,0,0],"y":[-60,-35,-10,20,50,80,90,95,85],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,9,10,10,10,10,10,7.5,0],"height":[0,8,10,13,13,13,10,7.5,0],"propeller":true,"texture":[3,63,4,10,1,3,12,17]},"deco":{"section_segments":12,"offset":{"x":15,"y":-15,"z":0},"position":{"x":[-9,0,3,6,5,5,0,0,0,0],"y":[-70,-45,-20,10,40,70,95,105,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,8,10,15,10,10,7.5,0],"height":[0,6,8,10,10,10,10,7.5,0],"propeller":true,"texture":[4,11,63,2,3,4,15,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":9},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-35,-20,0,20,50,100],"z":[-3,-2,0,0,5,7,0]},"width":[3,8,10,9,6,0],"height":[0,12,12,12,10,0],"propeller":false,"texture":[9,9,9,2,4]},"cannon":{"section_segments":10,"offset":{"x":10,"y":-45,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-40,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,3,5,5,5,0],"height":[0,3,5,5,5,0],"angle":0,"laser":{"damage":[6,8],"rate":10,"type":1,"speed":[135,185],"number":1,"error":0},"propeller":false,"texture":[16.9,13,4,63,2]},"cannon2":{"section_segments":10,"offset":{"x":45,"y":15,"z":-5},"position":{"x":[0,0,0,0,-3,-8],"y":[-20,-30,-20,0,25,40],"z":[0,0,0,0,0,0]},"width":[0,3,5,5,4,0],"height":[0,3,5,5,5,0],"angle":5,"laser":{"damage":[10,12],"rate":2,"type":1,"speed":[120,170],"number":1,"error":0},"propeller":false,"texture":[16.9,13,4,3]}},"wings":{"main2":{"length":[40],"width":[50,20],"angle":[50,10],"position":[0,20,20],"doubleside":true,"offset":{"x":0,"y":50,"z":0},"bump":{"position":10,"size":15},"texture":[63]},"main":{"length":[50,10],"width":[70,30,20],"angle":[-15,20],"position":[-45,-15,-5],"doubleside":true,"offset":{"x":20,"y":70,"z":0},"bump":{"position":30,"size":10},"texture":[11,63]}},"typespec":{"name":"Aurora","level":6,"model":10,"code":610,"specs":{"shield":{"capacity":[230,380],"reload":[5,7]},"generator":{"capacity":[150,230],"reload":[40,61]},"ship":{"mass":400,"speed":[60,115],"rotation":[50,70],"acceleration":[100,120]}},"shape":[3.955,4.41,3.606,2.987,2.763,2.55,2.289,2.107,1.983,1.92,2.194,2.216,2.229,2.27,2.352,2.441,3.303,4.416,4.898,4.967,4.023,4.059,4.064,4.267,4.214,3.918,4.214,4.267,4.064,4.059,4.023,4.967,4.898,4.416,3.303,2.441,2.352,2.27,2.229,2.216,2.194,1.92,1.983,2.107,2.289,2.55,2.763,2.987,3.606,4.41],"lasers":[{"x":0.46,"y":-4.37,"z":-0.46,"angle":0,"damage":[6,8],"rate":10,"type":1,"speed":[135,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.46,"y":-4.37,"z":-0.46,"angle":0,"damage":[6,8],"rate":10,"type":1,"speed":[135,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.95,"y":-0.685,"z":-0.23,"angle":5,"damage":[10,12],"rate":2,"type":1,"speed":[120,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.95,"y":-0.685,"z":-0.23,"angle":-5,"damage":[10,12],"rate":2,"type":1,"speed":[120,170],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.967}}',
                            '{"name":"Crucio","level":6,"model":11,"size":2.1,"specs":{"shield":{"capacity":[205,375],"reload":[5,8]},"generator":{"capacity":[110,180],"reload":[33,57]},"ship":{"mass":365,"speed":[90,115],"rotation":[60,85],"acceleration":[90,130]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-70,-85,-65,-45,-10,30,65,75,110,100],"z":[-5,-5,-5,-5,0,0,0,0,0,0,0]},"width":[0,5,11,18,15,30,23,18,13,0],"height":[0,5,12,17,20,25,20,20,10,0],"texture":[17,4,11,2,11,11,4,4,17],"propeller":true,"laser":{"damage":[5,8],"rate":10,"type":2,"speed":[180,300],"number":1,"angle":0,"error":0,"recoil":5}},"side_thruster":{"section_segments":12,"offset":{"x":17,"y":67,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-30,-20,0,20,35,30],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,10,9,7,0],"height":[0,5,5,14,10,5,0],"propeller":true,"texture":[6,4,10,4,63,4]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-35,-20,0,20,55,85,115,130],"z":[-7,-4,-2,0,0,0,0,-2,0,0]},"width":[0,10,13,10,18.5,16,10,0],"height":[0,8,12,12,15,16,8,0],"texture":[7,9,9,3,8,4,63,2],"propeller":false},"side":{"section_segments":10,"offset":{"x":15,"y":-40,"z":0},"position":{"x":[-10.3,-4,3,5,2,4,-5],"y":[-60,-50,-25,0,20,50,40],"z":[-5,-5,-6,2,0,0,0]},"width":[0,3,8,8,8,8,0],"height":[1.5,5,12,15,15,0,0],"texture":[63,4,10,63,4,12],"angle":0},"intakes":{"section_segments":6,"offset":{"x":20,"y":15,"z":0},"position":{"x":[0,-1,-1,-2,0,0,0,0],"y":[-25,-25,-30,-20,0,20,30,20],"z":[1,1,1,0,0,0,0,0]},"width":[0,10,13,15,12,7,3,0],"height":[0,11,16,16,13,5,3,0],"texture":[13,63,4,8,63,6,12],"angle":0},"laser":{"section_segments":12,"offset":{"x":55,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-10,-15,0,10,20,25,30,40,70,75],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,12,15,13,12,15,13,8,0],"height":[0,7,8,13,15,15,15,13,12,8,0],"texture":[6,4,13,63,8,4,4,63,2,4],"propeller":false,"angle":1,"laser":{"damage":[5,8],"rate":10,"type":2,"speed":[180,300],"number":1,"angle":0,"error":0,"recoil":5}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":55,"z":-10},"length":[60,40],"width":[70,50,30],"texture":[4,63],"angle":[15,-40],"position":[10,-10,-50],"bump":{"position":-10,"size":11}},"winglets":{"doubleside":true,"length":[30,20],"width":[40,25,0],"angle":[50,20],"position":[80,95,125],"texture":[3.25,63],"bump":{"position":10,"size":20},"offset":{"x":0,"y":-15,"z":0}}},"typespec":{"name":"Crucio","level":6,"model":11,"code":611,"specs":{"shield":{"capacity":[205,375],"reload":[5,8]},"generator":{"capacity":[110,180],"reload":[33,57]},"ship":{"mass":365,"speed":[90,115],"rotation":[60,85],"acceleration":[90,130]}},"shape":[4.205,4.137,3.625,3.115,2.59,2.141,1.735,1.448,1.305,1.418,1.376,2.399,3.745,3.75,3.815,3.777,3.663,3.622,3.847,4.244,4.304,4.111,4.889,4.718,4.361,4.2,4.361,4.718,4.889,4.111,4.304,4.244,3.847,3.622,3.663,3.777,3.815,3.75,3.745,2.399,1.376,1.418,1.305,1.448,1.735,2.141,2.59,3.115,3.625,4.137],"lasers":[{"x":0,"y":-4.2,"z":0,"angle":0,"damage":[5,8],"rate":10,"type":2,"speed":[180,300],"number":1,"spread":0,"error":0,"recoil":5},{"x":2.295,"y":-0.42,"z":0,"angle":1,"damage":[5,8],"rate":10,"type":2,"speed":[180,300],"number":1,"spread":0,"error":0,"recoil":5},{"x":-2.295,"y":-0.42,"z":0,"angle":-1,"damage":[5,8],"rate":10,"type":2,"speed":[180,300],"number":1,"spread":0,"error":0,"recoil":5}],"radius":4.889}}',
                            '{"name":"Marauder","level":6,"model":12,"size":1.4,"specs":{"shield":{"capacity":[210,350],"reload":[8,11]},"generator":{"capacity":[85,160],"reload":[41,65]},"ship":{"mass":350,"speed":[70,110],"rotation":[60,80],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-55,-40,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,18,23,30,25,25,30,35,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,1,10,1,1,11,12,17],"propeller":true,"laser":{"damage":[10,16],"rate":10,"type":1,"speed":[170,200],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-85,"z":22},"position":{"x":[0,0,0,0,0,0],"y":[15,35,60,95,125],"z":[-1,-2,-1,-1,3]},"width":[5,12,14,15,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4]},"outriggers":{"section_segments":10,"offset":{"x":25,"y":0,"z":-10},"position":{"x":[-5,-5,8,-5,0,0,0,0,0,0],"y":[-100,-125,-45,0,30,40,70,80,100,90],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,15,15,15,10,0],"height":[0,10,20,25,25,25,25,25,20,0],"texture":[13,4,4,63,4,18,4,13,17],"laser":{"damage":[4,8],"rate":3,"type":1,"speed":[110,140],"recoil":0,"number":1,"error":0},"propeller":true},"intake":{"section_segments":12,"offset":{"x":25,"y":-5,"z":10},"position":{"x":[0,0,5,0,-3,0,0,0,0,0],"y":[-10,-30,-5,35,60,70,85,100,85],"z":[0,-6,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,15,15,20,20,15,15,5,0],"texture":[6,4,63,4,63,18,4,17]}},"wings":{"main":{"length":[20,70,35],"width":[50,55,40,20],"angle":[0,-20,0],"position":[20,20,70,25],"texture":[3,18,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":0,"z":13}},"spoiler":{"length":[20,45,0,5],"width":[40,40,20,30,0],"angle":[0,20,90,90],"position":[60,60,80,80,90],"texture":[10,11,63],"doubleside":true,"bump":{"position":30,"size":18},"offset":{"x":0,"y":0,"z":30}},"font":{"length":[37],"width":[40,15],"angle":[-10],"position":[0,-45],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":35,"y":-20,"z":10}},"shields":{"doubleside":true,"offset":{"x":12,"y":60,"z":-15},"length":[0,15,45,20],"width":[30,30,65,65,30,30],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[4],"bump":{"position":0,"size":4}}},"typespec":{"name":"Marauder","level":6,"model":12,"code":612,"specs":{"shield":{"capacity":[210,350],"reload":[8,11]},"generator":{"capacity":[85,160],"reload":[41,65]},"ship":{"mass":350,"speed":[70,110],"rotation":[60,80],"acceleration":[80,120]}},"shape":[2.665,3.563,3.573,2.856,2.359,2.03,2.85,2.741,2.228,1.71,1.404,1.199,1.11,3.408,3.491,3.521,3.44,3.385,3.439,3.481,3.181,2.932,2.962,2.944,2.85,2.244,2.85,2.944,2.962,2.932,3.181,3.481,3.439,3.385,3.44,3.521,3.491,3.408,1.11,1.199,1.404,1.71,2.228,2.741,2.85,2.03,2.359,2.856,3.573,3.563],"lasers":[{"x":0,"y":-2.66,"z":0.28,"angle":0,"damage":[10,16],"rate":10,"type":1,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.56,"y":-3.5,"z":-0.28,"angle":0,"damage":[4,8],"rate":3,"type":1,"speed":[110,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.56,"y":-3.5,"z":-0.28,"angle":0,"damage":[4,8],"rate":3,"type":1,"speed":[110,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.573}}',
                            '{"name":"Scarabaeus","level":6,"model":14,"size":1.9,"specs":{"shield":{"capacity":[255,325],"reload":[6,9]},"generator":{"capacity":[120,195],"reload":[41,63]},"ship":{"mass":350,"speed":[80,110],"rotation":[60,85],"acceleration":[55,95]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-112,-105,-90,-50,0,30,70,100,102],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,15,20,20,20,20,17,0],"height":[0,8,15,20,20,22,22,12,0],"texture":[6,63,4,10,1,11,4,18],"laser":{"damage":[30,54],"rate":1.5,"type":1,"speed":[145,185],"number":1,"recoil":45,"angle":0,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-35,-30,0,30,40],"z":[0,0,0,0,0]},"width":[5,10,15,15,0],"height":[5,10,17,17,0],"texture":[3,9],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":42,"y":40,"z":-5},"position":{"x":[-5,-5,-5,-5,-5,-5,-5,0],"y":[-60,-50,-55,-20,0,40,60,45],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,15,15,15,10,0],"height":[0,5,10,15,15,15,10,0],"angle":0,"laser":{"damage":[10,14],"rate":2.5,"type":1,"speed":[130,158],"number":1,"angle":0,"error":0},"propeller":true,"texture":[6,12,10,3,4,63,17]},"cannons2":{"section_segments":8,"offset":{"x":76,"y":42,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-56,-48,-35,-20,0,20,50,52],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,6,7,8,11,7,0],"height":[0,5,6,7,8,11,7,0],"angle":2,"laser":{"damage":[4,6],"rate":1.5,"type":1,"speed":[140,180],"number":1,"angle":0,"error":0},"propeller":true,"texture":[6,12,2,8,4,63,18]},"shield":{"section_segments":8,"offset":{"x":0,"y":42,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-50,-55,-20,0,20,60,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,17,15,15,15,10,0],"height":[0,5,17,15,15,15,10,0],"angle":0,"propeller":true,"texture":[6,12,2,13,4,8,17]}},"wings":{"wing":{"length":[20,15,15,35],"width":[80,100,100,110,30],"angle":[0,0,0,-10],"position":[0,0,20,10,0],"texture":[4,63,3,4],"doubleside":true,"bump":{"position":10,"size":6},"offset":{"x":15,"y":40,"z":0}},"wing2":{"length":[20,15,15,45],"width":[80,100,70,70,30],"angle":[-30,0,0,5],"position":[0,0,20,10,0],"texture":[4,63,3,63],"doubleside":true,"bump":{"position":10,"size":6},"offset":{"x":15,"y":40,"z":-8}},"wing3":{"length":[10,5,5,15],"width":[80,50,100,110,30],"angle":[-30,-30,-30,-30],"position":[0,0,20,10,0],"texture":[4,63,63,4],"doubleside":true,"bump":{"position":10,"size":6},"offset":{"x":15,"y":-30,"z":-10}}},"typespec":{"name":"Scarabaeus","level":6,"model":14,"code":614,"specs":{"shield":{"capacity":[255,325],"reload":[6,9]},"generator":{"capacity":[120,195],"reload":[41,63]},"ship":{"mass":350,"speed":[80,110],"rotation":[60,85],"acceleration":[55,95]}},"shape":[4.256,4.041,3.204,3.103,3.011,2.729,2.533,2.355,2.123,1.965,1.875,2.945,3.04,3.162,4.203,4.379,4.577,4.499,4.474,4.745,4.665,4.693,4.598,3.995,3.895,3.884,3.895,3.995,4.598,4.693,4.665,4.745,4.474,4.499,4.577,4.379,4.203,3.162,3.04,2.945,1.875,1.965,2.123,2.355,2.533,2.729,3.011,3.103,3.204,4.041],"lasers":[{"x":0,"y":-4.256,"z":0,"angle":0,"damage":[30,54],"rate":1.5,"type":1,"speed":[145,185],"number":1,"spread":0,"error":0,"recoil":45},{"x":1.406,"y":-0.76,"z":-0.19,"angle":0,"damage":[10,14],"rate":2.5,"type":1,"speed":[130,158],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.406,"y":-0.76,"z":-0.19,"angle":0,"damage":[10,14],"rate":2.5,"type":1,"speed":[130,158],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.814,"y":-0.531,"z":-0.38,"angle":2,"damage":[4,6],"rate":1.5,"type":1,"speed":[140,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.814,"y":-0.531,"z":-0.38,"angle":-2,"damage":[4,6],"rate":1.5,"type":1,"speed":[140,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.745}}',
                            '{"name":"Avalon","level":6,"model":15,"size":1.3,"specs":{"shield":{"capacity":[235,320],"reload":[6,9]},"generator":{"capacity":[140,215],"reload":[39,66]},"ship":{"mass":375,"speed":[85,110],"rotation":[50,85],"acceleration":[80,110]}},"bodies":{"Body_Plate":{"section_segments":12,"offset":{"x":20,"y":-145,"z":0},"position":{"x":[0,0,-10,-10],"y":[30,140,230,200],"z":[0,0,0,2,2]},"width":[1,35,45,0],"height":[1,20,20,0],"propeller":false,"texture":[3,4,13]},"main":{"section_segments":12,"offset":{"x":0,"y":-215,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[40,60,130,240,310,330,355],"z":[0,0,0,0,0,0,0]},"width":[1,12,25,29,35,30,25],"height":[1,15,20,30,30,20,18],"propeller":true,"texture":[4,2,1,10,63,4]},"deco":{"section_segments":8,"offset":{"x":65,"y":55,"z":-10},"position":{"x":[0,0,0,3,5,0,0,0],"y":[-80,-80,-90,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,15,20,25,10,0],"height":[1,5,10,20,25,20,10,0],"texture":[17,12,4,63,11,4,12],"angle":0,"propeller":true,"laser":{"damage":[45,85],"rate":1,"type":1,"speed":[150,200],"recoil":200,"number":1,"error":0,"angle":10}},"Tail_Diamond":{"section_segments":12,"offset":{"x":0,"y":-55,"z":0},"position":{"x":[0,0],"y":[130,165],"z":[0,0]},"width":[25,1],"height":[1,1],"propeller":false,"texture":2},"Thruster":{"section_segments":12,"offset":{"x":34,"y":-65,"z":-6},"position":{"x":[-10,-10,0,0,0],"y":[15,73,190,250,240],"z":[0,0,0,5,5]},"width":[1,17,25,16,0],"height":[10,17,25,16,0],"texture":[3,4,63,13],"angle":0,"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-65,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-20,10,30,60],"z":[-10,0,0,0,-10]},"width":[10,15,15,15,5],"height":[10,10,15,10,5],"propeller":false,"texture":[9,9,4]},"Tactical_Laser_System":{"section_segments":8,"offset":{"x":0,"y":-135,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[5,0,23,37,72,82,97,102,143,143],"z":[2.5,2.5,2.5,2.5,2.5,2.5,2.5,5,20,30,30]},"width":[0,7,9,11,11,9,10,14,20,10],"height":[0,7,9,11,11,9,10,14,20,0],"texture":[17,3,3,13,3,8,3,13,3],"propeller":false,"laser":{"damage":[7,12],"rate":10,"type":2,"speed":[150,190],"recoil":0,"number":1,"error":2}}},"wings":{"main":{"length":[30,45,0,50,10],"width":[30,190,95,95,60,20],"angle":[-5,-10,0,10,30],"position":[0,70,110,110,120,120],"bump":{"position":40,"size":5},"offset":{"x":2,"y":-55,"z":1},"texture":[4,3,3,18,63],"doubleside":true},"Canards":{"length":[40],"width":[90,10,20,10],"angle":[20,-20,-20],"position":[0,10,20,30],"bump":{"position":0,"size":0},"offset":{"x":5,"y":-115,"z":0},"texture":[63],"doubleside":true},"sides":{"doubleside":true,"offset":{"x":50,"y":45,"z":0},"length":[10,10,25,25,0,20],"width":[25,25,50,50,50,120,100],"angle":[-12,5,5,5,5,5],"position":[40,55,55,55,40,30,30],"texture":[63,4,63,4,13,63],"bump":{"position":35,"size":15}}},"typespec":{"name":"Avalon","level":6,"model":15,"code":615,"specs":{"shield":{"capacity":[235,320],"reload":[6,9]},"generator":{"capacity":[140,215],"reload":[39,66]},"ship":{"mass":375,"speed":[85,110],"rotation":[50,85],"acceleration":[80,110]}},"shape":[4.55,4.132,3.509,3.174,2.125,1.953,1.826,1.748,1.889,2.152,2.114,2.067,2.071,3.138,3.739,3.898,4.13,4.477,4.87,4.826,4.099,4.477,4.468,4.983,4.897,3.647,4.897,4.983,4.468,4.477,4.099,4.826,4.87,4.477,4.13,3.898,3.739,3.138,2.071,2.067,2.114,2.152,1.889,1.748,1.826,1.953,2.125,3.174,3.509,4.132],"lasers":[{"x":1.69,"y":-0.91,"z":-0.26,"angle":0,"damage":[45,85],"rate":1,"type":1,"speed":[150,200],"number":1,"spread":10,"error":0,"recoil":200},{"x":-1.69,"y":-0.91,"z":-0.26,"angle":0,"damage":[45,85],"rate":1,"type":1,"speed":[150,200],"number":1,"spread":10,"error":0,"recoil":200},{"x":0,"y":-3.51,"z":-1.04,"angle":0,"damage":[7,12],"rate":10,"type":2,"speed":[150,190],"number":1,"spread":0,"error":2,"recoil":0}],"radius":4.983}}',
                            '{"name":"Arachnid","level":6,"model":16,"size":2.5,"specs":{"shield":{"capacity":[250,300],"reload":[6,11]},"generator":{"capacity":[145,220],"reload":[44,68]},"ship":{"mass":350,"speed":[75,110],"rotation":[60,80],"acceleration":[100,140]}},"bodies":{"gary":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-10,10,30,40,50,60,70,90,80],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,11,14,20,15,6,12,15,5,0],"height":[0,11,11,15,10,5,10,15,10,0],"texture":[9,9,11,4,4,3,10,2,17],"propeller":true},"top_pulsors":{"section_segments":8,"offset":{"x":28,"y":40,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-45,-30,-20,0,-10],"z":[0,0,0,0,0,0]},"width":[0,6,9,9,4,0],"height":[0,5,8,10,5,0],"texture":[6,10,4,63,17],"propeller":1,"laser":{"damage":[5,9],"rate":2,"type":1,"speed":[90,140],"number":1,"error":0}},"bottom_pulsors":{"section_segments":8,"offset":{"x":22,"y":33,"z":-8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-45,-30,-20,0,-10],"z":[0,0,0,0,0,0]},"width":[0,6,9,9,4,0],"height":[0,5,10,10,5,0],"texture":[6,4,4,3,17],"propeller":1,"laser":{"damage":[6,10],"rate":2,"type":1,"speed":[90,150],"number":1,"error":0}},"foot_top":{"section_segments":8,"offset":{"x":52,"y":33,"z":50},"position":{"x":[0,0,0,-7,0],"y":[-32,-30,-10,10,-5],"z":[0,0,0,0,0]},"width":[0,4,7,2,0],"height":[0,4,7,2,0],"texture":[6,4,3,13],"angle":1.5,"propeller":0,"laser":{"damage":[4,5],"rate":4,"type":1,"speed":[100,160],"number":1,"error":0}},"foot_middle":{"section_segments":8,"offset":{"x":74,"y":10,"z":-2},"position":{"x":[0,0,0,-7,0],"y":[-32,-30,-10,10,-5],"z":[0,0,0,0,0]},"width":[0,5,7,2,0],"height":[0,5,7,2,0],"texture":[6,4,3,13],"angle":2,"propeller":0,"laser":{"damage":[4,6],"rate":4,"type":1,"speed":[110,170],"number":1,"error":0}},"foot_bottom":{"section_segments":8,"offset":{"x":60,"y":47,"z":-50},"position":{"x":[0,0,0,-7,0],"y":[-32,-30,-10,10,-5],"z":[0,0,0,0,0]},"width":[0,4,7,2,0],"height":[0,4,7,2,0],"texture":[6,4,3,13],"angle":1.5,"propeller":0},"EAT":{"section_segments":8,"offset":{"x":0,"y":-9,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-50,-45,-30,-20,0,-10],"z":[0,0,0,0,0,0]},"width":[0,6,9,12,5,0],"height":[0,5,5,8,5,0],"texture":[6,63,4,4,17],"propeller":1,"laser":{"damage":[10,20],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0}}},"wings":{"leg_top":{"offset":{"x":10,"y":0,"z":-1},"length":[30,8,40],"width":[50,20,20,10],"angle":[50,-30,60,0],"position":[0,30,35,20],"texture":[63,4,8],"doubleside":true,"bump":{"position":0,"size":11}},"leg_main":{"offset":{"x":10,"y":0,"z":-1},"length":[24,15,26],"width":[50,25,25,10],"angle":[-20,30,0,0],"position":[0,15,20,0],"texture":[11,11,63],"doubleside":true,"bump":{"position":0,"size":15}},"leg_bottom":{"offset":{"x":10,"y":0,"z":-1},"length":[30,6,45],"width":[50,20,20,10],"angle":[-60,30,-42,0],"position":[0,40,45,35],"texture":[2,4,8],"doubleside":true,"bump":{"position":0,"size":11}},"assistance_top":{"offset":{"x":50,"y":25,"z":48},"length":[20],"width":[35,10],"angle":[40,0],"position":[-5,20],"texture":[63],"doubleside":true,"bump":{"position":0,"size":11}},"assistance_mid":{"offset":{"x":70,"y":-2,"z":-3},"length":[15],"width":[35,10],"angle":[0,0],"position":[0,20],"texture":[63],"doubleside":true,"bump":{"position":0,"size":11}},"assistance_bot":{"offset":{"x":60,"y":34,"z":-52},"length":[20],"width":[35,10],"angle":[-40,0],"position":[0,20],"texture":[63],"doubleside":true,"bump":{"position":0,"size":11}}},"typespec":{"name":"Arachnid","level":6,"model":16,"code":616,"specs":{"shield":{"capacity":[250,300],"reload":[6,11]},"generator":{"capacity":[145,220],"reload":[44,68]},"ship":{"mass":350,"speed":[75,110],"rotation":[60,80],"acceleration":[100,140]}},"shape":[2.95,2.808,2.184,1.74,1.373,1.24,1.2,1.399,1.457,1.523,4.026,4.025,4.032,4.222,4.388,4.403,4.015,4.654,4.784,3.974,3.242,3.157,2.127,2.943,3.509,3.507,3.509,2.943,2.127,3.157,3.242,3.974,4.784,4.654,4.015,4.403,4.388,4.222,4.032,4.025,4.026,1.523,1.457,1.399,1.2,1.24,1.373,1.74,2.184,2.808],"lasers":[{"x":1.4,"y":-0.5,"z":0.4,"angle":0,"damage":[5,9],"rate":2,"type":1,"speed":[90,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.4,"y":-0.5,"z":0.4,"angle":0,"damage":[5,9],"rate":2,"type":1,"speed":[90,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.1,"y":-0.85,"z":-0.4,"angle":0,"damage":[6,10],"rate":2,"type":1,"speed":[90,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.1,"y":-0.85,"z":-0.4,"angle":0,"damage":[6,10],"rate":2,"type":1,"speed":[90,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.558,"y":0.051,"z":2.5,"angle":1.5,"damage":[4,5],"rate":4,"type":1,"speed":[100,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.558,"y":0.051,"z":2.5,"angle":-1.5,"damage":[4,5],"rate":4,"type":1,"speed":[100,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.644,"y":-1.099,"z":-0.1,"angle":2,"damage":[4,6],"rate":4,"type":1,"speed":[110,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.644,"y":-1.099,"z":-0.1,"angle":-2,"damage":[4,6],"rate":4,"type":1,"speed":[110,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-2.95,"z":-0.75,"angle":0,"damage":[10,20],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.784}}',
                            '{"name":"Sphinx","level":6,"model":17,"size":1.5,"specs":{"shield":{"capacity":[230,350],"reload":[4,7]},"generator":{"capacity":[110,200],"reload":[42,63]},"ship":{"mass":385,"speed":[90,110],"rotation":[65,85],"acceleration":[100,120]}},"bodies":{"main1":{"section_segments":12,"offset":{"x":0,"y":-15,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-93,-90,-80,-20,10,70,125,140,130],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,15,33,37,27,25,17,0],"height":[0,5,10,26,27,27,20,15,0],"propeller":true,"texture":[11,63,2,63,3,10,12,17],"laser":{"damage":[5,7],"rate":10,"type":1,"speed":[130,180],"number":2,"angle":5,"error":0}},"main2":{"section_segments":12,"offset":{"x":80,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-55,-35,-25,-5,10,50,65,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,15,20,20,23,19,14,0],"height":[0,8,15,18,18,22,17,12,0],"propeller":true,"texture":[18,3,63,10,4,63,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-65,"z":30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-17,-5,20,40,90,140],"z":[-7,-6,-1.5,0,0,0,0]},"width":[5,12,18,18,12,5],"height":[0,12,17,17,17,5],"propeller":false,"texture":[9,9,9,3,63]},"cannon":{"section_segments":10,"offset":{"x":20,"y":-75,"z":10},"position":{"x":[-5,-5,-5,0,10,12,10],"y":[-50,-60,-30,20,40,80,100],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,6,15,15,10,0],"height":[0,5,6,10,10,5,0],"angle":0,"laser":{"damage":[5,7],"rate":10,"type":1,"speed":[130,180],"number":1,"error":0},"propeller":false,"texture":[6,4,63,2,10,3]}},"wings":{"main1":{"length":[35,20],"width":[85,50,60],"angle":[0,20],"position":[3,0,70],"doubleside":true,"offset":{"x":0,"y":65,"z":15},"bump":{"position":10,"size":5},"texture":[11,63]},"main2":{"length":[30,10],"width":[55,30,50],"angle":[-30,-30],"position":[0,20,50],"doubleside":true,"offset":{"x":85,"y":15,"z":-10},"bump":{"position":30,"size":10},"texture":[11,63]},"main3":{"length":[30,10],"width":[55,30,50],"angle":[30,30],"position":[0,20,50],"doubleside":true,"offset":{"x":85,"y":15,"z":-5},"bump":{"position":30,"size":10},"texture":[11,63]},"main4":{"length":[30,20],"width":[55,50,50],"angle":[-20,-25],"position":[0,0,10],"doubleside":true,"offset":{"x":20,"y":-28,"z":10},"bump":{"position":0,"size":10},"texture":[8,63]}},"typespec":{"name":"Sphinx","level":6,"model":17,"code":617,"specs":{"shield":{"capacity":[230,350],"reload":[4,7]},"generator":{"capacity":[110,200],"reload":[42,63]},"ship":{"mass":385,"speed":[90,110],"rotation":[65,85],"acceleration":[100,120]}},"shape":[3.24,4.093,3.298,2.602,2.191,2.074,3.068,3.373,3.324,3.231,3.224,3.097,3.094,3.19,3.562,3.856,4.092,4.429,4.491,1.687,2.394,3.782,5.206,3.525,3.785,3.757,3.785,3.525,5.206,3.782,2.394,1.687,4.491,4.429,4.092,3.856,3.562,3.19,3.094,3.097,3.224,3.231,3.324,3.373,3.068,2.074,2.191,2.602,3.298,4.093],"lasers":[{"x":0,"y":-3.24,"z":0.3,"angle":0,"damage":[5,7],"rate":10,"type":1,"speed":[130,180],"number":2,"spread":5,"error":0,"recoil":0},{"x":0.45,"y":-4.05,"z":0.3,"angle":0,"damage":[5,7],"rate":10,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.45,"y":-4.05,"z":0.3,"angle":0,"damage":[5,7],"rate":10,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.206}}',
                            '{"name":"Nomad","level":6,"model":19,"size":1.45,"specs":{"shield":{"capacity":[250,360],"reload":[5,8]},"generator":{"capacity":[100,170],"reload":[39,66]},"ship":{"mass":350,"speed":[75,120],"rotation":[60,80],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-160,-145,-110,-50,-20,30,75,90,125,130,125],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[10,15,25,30,33,35,35,35,25,20,0],"height":[0,6,10,15,20,20,20,18,16,10,0],"propeller":false,"texture":[4,3,63,11,4,3,3,63,4,18]},"jet":{"section_segments":8,"offset":{"x":40,"y":-30,"z":5},"position":{"x":[-25,-22,-15,-5,3,20,25,30,30,30,30,0,0,0],"y":[-110,-90,-50,-20,0,30,50,100,130,155,150],"z":[5,4,2,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,20,20,20,20,20,20,15,0],"height":[0,5,9,12,13,15,15,15,15,10,0],"propeller":true,"texture":[63,4,10,3,63,4,10,3,12,17]},"jet2":{"section_segments":8,"offset":{"x":20,"y":-20,"z":25},"position":{"x":[-5,-10,-6,-5,-3,-1,0,0,0,0,0,0,0],"y":[-30,10,35,50,60,80,90,110,140,155,150],"z":[5,4,2,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,15,15,15,15,15,15,15,10,0],"height":[0,10,12,12,12,15,15,15,15,10,0],"propeller":true,"texture":[4,63,3,4,4,63,3,11,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-40,"z":18.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-70,-50,-25,0,40,80,100,150,165],"z":[-1,0,1,0,0,0,0,0,0,7.5,0]},"width":[2,12,15,15,20,25,25,25,25,10],"height":[0,12,20,25,30,30,30,25,15,0],"texture":[9,9,9,2,3,11,63,4,3]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-90,"z":-4},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-45,0,40,30],"z":[0,0,0,0,4,3]},"width":[0,6,10,10,10,10],"height":[0,6,10,10,10,10],"angle":0,"laser":{"damage":[25,42],"rate":3,"type":1,"speed":[150,210],"number":1,"error":0},"propeller":false,"texture":[17,13,4,3]}},"wings":{"main":{"length":[60,50,30,30],"width":[150,150,50,34,20],"angle":[0,0,0,0],"position":[-30,-30,0,0,-45],"doubleside":true,"offset":{"x":0,"y":70,"z":6},"bump":{"position":0,"size":5},"texture":[63,11,3,63]}},"typespec":{"name":"Nomad","level":6,"model":19,"code":619,"specs":{"shield":{"capacity":[250,360],"reload":[5,8]},"generator":{"capacity":[100,170],"reload":[39,66]},"ship":{"mass":350,"speed":[75,120],"rotation":[60,80],"acceleration":[60,80]}},"shape":[4.649,4.641,3.72,3.209,2.823,2.542,2.323,2.171,2.083,2.046,2.112,2.209,2.364,4.969,5.033,4.957,4.828,4.78,4.484,4.126,4.384,4.292,4.006,4.011,3.985,3.777,3.985,4.011,4.006,4.292,4.384,4.126,4.484,4.78,4.828,4.957,5.033,4.969,2.364,2.209,2.112,2.046,2.083,2.171,2.323,2.542,2.823,3.209,3.72,4.641],"lasers":[{"x":0,"y":-4.06,"z":-0.116,"angle":0,"damage":[25,42],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.033}}',
                            '{"name":"Hydrus","level":6,"model":20,"size":1.7,"specs":{"shield":{"capacity":[250,350],"reload":[5,9]},"generator":{"capacity":[120,200],"reload":[35,58]},"ship":{"mass":375,"speed":[75,115],"rotation":[50,80],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-125,-80,-50,0,10,30,80,110,130,120],"z":[-10,-10,-5,0,0,0,0,0,0,0,0,0]},"width":[10,20,28,30,30,30,35,45,30,20,0],"height":[0,5,15,15,20,20,20,20,20,10,0],"texture":[4,2,63,11,2,4,10,63,12,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-20,10,40,100],"z":[3,0,0,5,11]},"width":[7,15,16,15,0],"height":[3,18,22,15,0],"texture":[9,9,63,4],"propeller":false},"cannon1":{"section_segments":12,"offset":{"x":8.25,"y":-70,"z":-15},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-70,-65,0,20],"z":[0,0,0,5,5,0,0]},"width":[0,2,4,12,7,5,0],"height":[0,2,4,5,7,5,0],"texture":[13,6,3,11,63,12],"angle":0,"laser":{"damage":[15,30],"rate":2,"type":1,"speed":[130,170],"number":1,"error":0}},"cannon2":{"section_segments":12,"offset":{"x":22.5,"y":-65,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-70,-65,0,20],"z":[0,0,0,5,0,5,0,0]},"width":[0,2,4,12,7,5,0],"height":[0,2,4,5,4,5,0],"texture":[13,6,4,11,63,12],"angle":0,"laser":{"damage":[10,15],"rate":2,"type":1,"speed":[140,190],"number":1,"error":0}},"wingend":{"section_segments":12,"offset":{"x":80,"y":70,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-35,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,10,14,14,14,10,0],"height":[0,10,14,14,14,10,0],"texture":[18,63,4,11,63,12],"angle":0},"propellers":{"section_segments":12,"offset":{"x":40,"y":60,"z":0},"position":{"x":[-11,-14,-9,0,0,0,0],"y":[-65,-55,-25,0,40,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,15,15,10,0],"height":[0,10,10,15,15,10,0],"texture":[3,4,63,11,12,17],"angle":0,"propeller":true}},"wings":{"wing1":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[60,25],"width":[70,40,30],"angle":[0,0],"position":[0,0,0],"texture":[11,3],"bump":{"position":10,"size":10}},"wing2":{"doubleside":true,"offset":{"x":15,"y":55,"z":10},"length":[20,10],"width":[50,40,30],"angle":[30,0],"position":[0,40,60],"texture":[4,3],"bump":{"position":10,"size":5}},"winglets":{"doubleside":true,"offset":{"x":25,"y":-50,"z":-5},"length":[12.5,0,20,10],"width":[50,40,100,35,20],"angle":[-10,-10,-10,-10],"position":[0,0,0,0,0],"texture":[18,4,63,4],"bump":{"position":0,"size":5}}},"typespec":{"name":"Hydrus","level":6,"model":20,"code":620,"specs":{"shield":{"capacity":[250,350],"reload":[5,9]},"generator":{"capacity":[120,200],"reload":[35,58]},"ship":{"mass":375,"speed":[75,115],"rotation":[50,80],"acceleration":[90,110]}},"shape":[4.769,4.773,4.598,3.629,3.416,3.177,3.042,3.054,2.806,2.164,1.787,1.543,1.379,1.269,1.286,3.296,3.646,3.949,4.383,4.574,4.412,4.063,4.648,4.637,4.472,4.429,4.472,4.637,4.648,4.063,4.412,4.574,4.383,3.949,3.646,3.296,1.286,1.222,1.379,1.543,1.787,2.164,2.806,3.054,3.042,3.177,3.416,3.629,4.598,4.773],"lasers":[{"x":0.281,"y":-4.76,"z":-0.51,"angle":0,"damage":[15,30],"rate":2,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.281,"y":-4.76,"z":-0.51,"angle":0,"damage":[15,30],"rate":2,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.765,"y":-4.59,"z":-0.34,"angle":0,"damage":[10,15],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.765,"y":-4.59,"z":-0.34,"angle":0,"damage":[10,15],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.773}}',
                            '{"name":"Scorcher","level":6,"model":21,"size":2.4,"specs":{"shield":{"capacity":[250,375],"reload":[3,8]},"generator":{"capacity":[170,250],"reload":[35,57]},"ship":{"mass":400,"speed":[80,115],"rotation":[50,70],"acceleration":[90,120]}},"bodies":{"front":{"section_segments":12,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0],"y":[-45,-50,-50,-11,5.5],"z":[0,0,0,0,0]},"width":[0,5,7,16,20],"height":[0,5,7,16,19],"texture":[17,12,2,63],"laser":{"damage":[6,10],"rate":1,"type":1,"speed":[150,210],"number":10,"angle":30,"recoil":0}},"front2":{"section_segments":12,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0],"y":[-45,-50,-50],"z":[0,0,0,0,0]},"width":[0,5,7,16,20],"height":[0,5,7,16,19],"texture":[17,12,2,63],"laser":{"damage":[10,20],"rate":1,"type":1,"speed":[120,180],"number":5,"angle":30,"recoil":0}},"cockpit":{"section_segments":7,"offset":{"x":0,"y":-35,"z":14},"position":{"x":[0,0,0,0,0,0],"y":[-35,-13,0,10,40,41],"z":[-7,-4,0,0,0,-2]},"width":[0,8,10,10,7,5],"height":[0,8,9,9,5,0],"texture":[9,9,9,4]},"barrels":{"section_segments":12,"angle":2,"offset":{"x":58.5,"y":5,"z":-1},"position":{"x":[0,0,0,0,0],"y":[-6,-9,5,29,29],"z":[0,0,0,0,0]},"width":[0,4,4.5,5,0],"height":[0,4,4.5,5,0],"texture":[17,3,3],"laser":{"damage":[5,10],"rate":3,"type":1,"speed":[120,165],"number":1,"angle":0,"error":0,"recoil":0}},"motor":{"section_segments":12,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[5,5,20,35,55,80,100,110,110],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,21,22,24,22,25,20,0],"height":[0,19,20,18,20,18,23,19,0],"texture":[2,2,8,63,10,3,4,3]},"shit_that_chickenman_asked_me_to_add":{"section_segments":12,"offset":{"x":25,"y":-28,"z":0},"position":{"x":[-15,-15,-10,-5,-2.5,-5,-10,-15,-20],"y":[4.5,4.5,18,32,50,73,91,100,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,7,10,10,10,10,10,7,0],"height":[0,7,10,10,10,10,10,7,0],"texture":[3,4,4,63,63,4,4,4]},"fuel_2":{"section_segments":12,"offset":{"x":59,"y":-8,"z":-1},"position":{"x":[0,0,0,0,0,0],"y":[30,30,34,67,80,68],"z":[0,0,0,0,0,0]},"width":[0,5.5,8,8,7,0],"height":[0,5.5,6,6,5,0],"texture":[5,63,8,13,17],"angle":0,"propeller":true},"propulsors":{"section_segments":12,"offset":{"x":8,"y":-23,"z":8},"position":{"x":[0,0,0],"y":[30,105,103],"z":[0,0,0]},"width":[5,7,0],"height":[5,7,0],"propeller":true,"texture":[4,17]},"propulsors2":{"section_segments":12,"offset":{"x":8,"y":-23,"z":-8},"position":{"x":[0,0,0],"y":[30,105,103],"z":[0,0,0]},"width":[5,7,0],"height":[5,7,0],"propeller":true,"texture":[4,17]}},"wings":{"main":{"doubleside":true,"offset":{"x":25,"y":65,"z":-2},"length":[40,20],"width":[45,30,20],"angle":[2,-30],"position":[-30,-10,-35],"texture":[11,63],"bump":{"position":0,"size":7.5}},"winglets":{"doubleside":true,"offset":{"x":8,"y":40,"z":10},"length":[35,20],"width":[40,10],"angle":[55,0],"position":[0,35],"texture":[63],"bump":{"position":50,"size":20}}},"typespec":{"name":"Scorcher","level":6,"model":21,"code":621,"specs":{"shield":{"capacity":[250,375],"reload":[3,8]},"generator":{"capacity":[170,250],"reload":[35,57]},"ship":{"mass":400,"speed":[80,115],"rotation":[50,70],"acceleration":[90,120]}},"shape":[3.848,3.855,2.938,2.307,1.93,1.677,1.505,1.338,1.282,1.292,1.297,1.321,2.999,3.049,4.077,4.245,4.392,4.404,4.498,4.688,4.485,3.511,4.07,3.958,4.001,3.944,4.001,3.958,4.07,3.511,4.485,4.688,4.498,4.404,4.392,4.245,4.077,3.049,2.999,1.321,1.297,1.292,1.282,1.338,1.505,1.677,1.93,2.307,2.938,3.855],"lasers":[{"x":0,"y":-3.84,"z":0,"angle":0,"damage":[6,10],"rate":1,"type":1,"speed":[150,210],"number":10,"spread":30,"error":0,"recoil":0},{"x":0,"y":-3.84,"z":0,"angle":0,"damage":[10,20],"rate":1,"type":1,"speed":[120,180],"number":5,"spread":30,"error":0,"recoil":0},{"x":2.793,"y":-0.192,"z":-0.048,"angle":2,"damage":[5,10],"rate":3,"type":1,"speed":[120,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.793,"y":-0.192,"z":-0.048,"angle":-2,"damage":[5,10],"rate":3,"type":1,"speed":[120,165],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.688}}',
                            '{"name":"Jupiter","level":6,"model":28,"size":2.5,"specs":{"shield":{"capacity":[225,350],"reload":[6,9]},"generator":{"capacity":[150,210],"reload":[30,52]},"ship":{"mass":390,"speed":[90,115],"rotation":[50,65],"acceleration":[90,140]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-79,-75,-23,-3,10,25,50,90,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,12,23,28,22,22,22,20,15,0],"height":[0,5,21,24,21,20,20,17,15,0],"texture":[3,10,2,4,3,8,4,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-80,"z":13},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,40,50],"z":[-7,-9,-5,2,10]},"width":[0,7,9,11,0],"height":[0,10,12,10,0],"texture":[4,9,9,4]},"big_cannons":{"section_segments":12,"offset":{"x":22,"y":-10,"z":22},"position":{"x":[0,0,0,0,0,0,0,3,3,10],"y":[3,-5,5,30,45,55,77,115,110],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,6,7,7,7,7,5,0],"height":[0,4,6,6,6,6,6,5,0],"texture":[17,4,63,2,3,11,4,8],"propeller":false,"angle":0,"laser":{"damage":[20,30],"rate":1,"type":2,"speed":[140,190],"recoil":0,"number":2,"angle":1,"error":0}},"cannons1":{"section_segments":12,"offset":{"x":43.5,"y":-20,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,-8,-2,0,40,52,57,52,63],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,4,6,6,6,6,6,6,6],"height":[0,4,6,6,6,6,6,6,6],"texture":[12,63,5,3,8,15,18,8],"propeller":false,"angle":1.5,"laser":{"damage":[10,15],"rate":4,"type":1,"speed":[170,220],"recoil":10,"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":69.2,"y":-13,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,-8,-2,0,40,52,57,52,63],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,4,4,4,4,4],"height":[0,2,3,3,4,4,4,4,4],"texture":[12,3,3,3,12,15,18,3],"angle":0,"propeller":false,"laser":{"damage":[2,4],"rate":10,"type":2,"speed":[140,200],"recoil":0,"number":1,"error":0}},"propulsors":{"section_segments":12,"offset":{"x":20,"y":-30,"z":0},"position":{"x":[-6,0,0,0,0,0,0,0,0],"y":[0,20,35,60,80,90,105,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,10,15,15,13,10,0],"height":[10,10,10,13,13,13,10,0],"propeller":true,"texture":[12,63,4,10,3,13,17]},"booster":{"section_segments":12,"offset":{"x":45,"y":44,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-20,-10,0,20,25,20],"z":[-4,0,0,0,0,0]},"width":[0,8,8,8,5,0],"height":[0,8,8,8,5,0],"propeller":true,"texture":[2,3,4,63,17],"angle":0}},"wings":{"main1":{"doubleside":true,"offset":{"x":71,"y":19,"z":-7},"length":[0,0,0,15],"width":[10,10,10,-115,0],"angle":[20,20,20,50],"position":[20,20,20,20,10],"texture":[0,18,12,63],"bump":{"position":3,"size":15}},"main2":{"doubleside":true,"offset":{"x":11,"y":80,"z":10},"length":[0,13,10,6],"width":[10,10,10,75,0],"angle":[20,47,47,47],"position":[-20,-20,-20,-10,0],"texture":[0,18,12,63],"bump":{"position":3,"size":15}},"main3":{"doubleside":true,"offset":{"x":20,"y":40,"z":0},"length":[50,30],"width":[90,40],"angle":[-10,0],"position":[-20,0],"texture":[11],"bump":{"position":40,"size":10}}},"typespec":{"name":"Jupiter","level":6,"model":28,"code":628,"specs":{"shield":{"capacity":[225,350],"reload":[6,9]},"generator":{"capacity":[150,210],"reload":[30,52]},"ship":{"mass":390,"speed":[90,115],"rotation":[50,65],"acceleration":[90,140]}},"shape":[4.95,4.858,4.043,3.137,2.583,2.254,2.029,1.873,2.75,2.734,3.712,3.698,3.775,3.923,4.153,4.489,4.68,4.904,5.233,5.711,5.99,4.086,4.874,5.538,5.345,4.008,5.345,5.538,4.874,4.086,5.99,5.711,5.233,4.904,4.68,4.489,4.153,3.923,3.775,3.698,3.712,2.734,2.75,1.873,2.029,2.254,2.583,3.137,4.043,4.858],"lasers":[{"x":1.1,"y":-0.75,"z":1.1,"angle":0,"damage":[20,30],"rate":1,"type":2,"speed":[140,190],"number":2,"spread":1,"error":0,"recoil":0},{"x":-1.1,"y":-0.75,"z":1.1,"angle":0,"damage":[20,30],"rate":1,"type":2,"speed":[140,190],"number":2,"spread":1,"error":0,"recoil":0},{"x":2.165,"y":-1.4,"z":-0.05,"angle":1.5,"damage":[10,15],"rate":4,"type":1,"speed":[170,220],"number":1,"spread":0,"error":0,"recoil":10},{"x":-2.165,"y":-1.4,"z":-0.05,"angle":-1.5,"damage":[10,15],"rate":4,"type":1,"speed":[170,220],"number":1,"spread":0,"error":0,"recoil":10},{"x":3.46,"y":-1.05,"z":-0.45,"angle":0,"damage":[2,4],"rate":10,"type":2,"speed":[140,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.46,"y":-1.05,"z":-0.45,"angle":0,"damage":[2,4],"rate":10,"type":2,"speed":[140,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.99}}',
                            '{"name":"Hammerhead","level":6,"model":55,"size":2.65,"specs":{"shield":{"capacity":[360,430],"reload":[4,8]},"generator":{"capacity":[100,150],"reload":[28,46]},"ship":{"mass":650,"speed":[80,115],"rotation":[35,50],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-87.5,-82.5,-70,-65,-40,-30,-5,10,30,40,65,90,95,90],"z":[-5,-5,-5,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,10,15,20,25,30,32.5,32.5,30,20,15,0],"height":[0,28,35,35,15,15,20,20,25,25,25,25,15,10,0],"texture":[13,63,4,2,11,3,63,4,2,3,4,11,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":30,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-45,-25,-5,20,50],"z":[4,0,0,0,0,-1]},"width":[0,9,12,10,5,0],"height":[0,12,15,15,10,0],"texture":[9,9,9,11,63],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":17.5,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-30,-40,-35,-15,12],"z":[0,0,0,0,0,0]},"width":[0,3,5,7,7],"height":[0,3,5,7,7],"texture":[6,6,10,63,12],"angle":0,"laser":{"damage":[4,8],"rate":10,"type":1,"speed":[150,220],"number":1,"error":5}},"propulsors":{"section_segments":12,"offset":{"x":20,"y":50,"z":0},"position":{"x":[-1,3,6,-1,-1,5,5,5,5,5,5,5,0],"y":[-70,-60,-35,-15,-5,20,35,45,50,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,25,25,15,15,12.5,10,0],"height":[0,10,15,15,15,15,15,15,7.5,0],"texture":[2,4,63,3,10,63,2,12,17],"angle":0,"propeller":true}},"wings":{"main":{"length":[45,10],"width":[60,40,30],"angle":[10,20],"position":[0,20,40],"texture":[8,63],"doubleside":true,"offset":{"x":5,"y":30,"z":0},"bump":{"position":30,"size":5}},"main2":{"length":[45,10],"width":[60,40,30],"angle":[-10,-10],"position":[0,20,40],"texture":[8,63],"doubleside":true,"offset":{"x":5,"y":30,"z":0},"bump":{"position":30,"size":5}},"winglets":{"length":[30],"width":[50,20],"angle":[40],"position":[-40,-10],"texture":63,"doubleside":true,"offset":{"x":5,"y":90,"z":15},"bump":{"position":0,"size":5}}},"typespec":{"name":"Hammerhead","level":6,"model":55,"code":655,"specs":{"shield":{"capacity":[360,430],"reload":[4,8]},"generator":{"capacity":[100,150],"reload":[28,46]},"ship":{"mass":650,"speed":[80,115],"rotation":[35,50],"acceleration":[90,110]}},"shape":[4.77,4.705,4.242,3.36,2.871,2.388,2.036,1.776,1.603,1.722,1.83,1.858,1.914,2.015,2.154,2.345,2.554,3.434,4.292,4.919,5.489,4.979,5.615,5.573,5.395,5.045,5.395,5.573,5.615,4.979,5.489,4.919,4.292,3.434,2.554,2.345,2.154,2.015,1.919,1.858,1.83,1.722,1.603,1.776,2.036,2.388,2.871,3.36,4.242,4.705],"lasers":[{"x":0.928,"y":-3.18,"z":0,"angle":0,"damage":[4,8],"rate":10,"type":1,"speed":[150,220],"number":1,"spread":0,"error":5,"recoil":0},{"x":-0.928,"y":-3.18,"z":0,"angle":0,"damage":[4,8],"rate":10,"type":1,"speed":[150,220],"number":1,"spread":0,"error":5,"recoil":0}],"radius":5.615}}',
                            '{"name":"Ivo","level":6,"model":100,"size":2.1,"specs":{"shield":{"capacity":[320,450],"reload":[8,12]},"generator":{"capacity":[250,400],"reload":[65,100]},"ship":{"mass":400,"speed":[90,115],"rotation":[50,70],"acceleration":[70,90]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-155,-140,-115,-90,-80,-60,-45,-15,0,20,35,55,70,100,110,100],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,15,20,22,22,22,30,33,35,35,30,30,30,25,20,0],"height":[0,12,20,22,24,25,25,25,25,25,25,25,25,25,15,0],"texture":[3,2,63,4,4,63,3,2,63,63,4,2,63,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":25,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-140,-130,-120,-100,-80,-65,-50,-15,15,55,65,85,95],"z":[-2,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,8,10,12,17,18,18,18,18,16.5,16,15,0,0],"height":[0,12,17,20,20,23,25,25,25,25,25,25,0,0],"texture":[9,9,9,4,3,11,63,10,3,63,4,3,4],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":20,"y":-10,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,-1,-2],"y":[-95,-105,-90,-75,-50,-20],"z":[0,0,0,0,0,0,0,0,0,3,5]},"width":[0,4,8,10,10,10,10,10,10,10,0],"height":[0,4,8,10,10,10,10,10,10,10,0],"texture":[17,4,2,63,3,11,63,4,3,63],"propeller":false,"angle":0,"laser":{"damage":[10,20],"rate":1,"type":1,"speed":[150,200],"number":1,"error":0}},"sidecannons1":{"section_segments":8,"offset":{"x":32.5,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,-1,-2],"y":[-90,-95,-90,-90,-70,-20],"z":[0,0,0,0,0,0,0,0,0,3,5]},"width":[0,10,10,8,9,9,10,10,10,10,0],"height":[0,10,10,8,9,9,10,10,10,10,0],"texture":[6,4,2,2,3,11,63,4,3,63],"propeller":false,"angle":85,"laser":{"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0}},"sidecannons2":{"section_segments":8,"offset":{"x":30,"y":20,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,-1,-2],"y":[-90,-95,-90,-90,-70,-20],"z":[0,0,0,0,0,0,0,0,0,3,5]},"width":[0,10,10,8,9,9,10,10,10,10,0],"height":[0,10,10,8,9,9,10,10,10,10,0],"texture":[6,4,2,63,3,11,63,4,3,63],"propeller":false,"angle":90,"laser":{"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0}},"sidecannons3":{"section_segments":8,"offset":{"x":30,"y":47.5,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,-1,-2],"y":[-90,-95,-90,-90,-70,-20],"z":[0,0,0,0,0,0,0,0,0,3,5]},"width":[0,10,10,8,9,9,10,10,10,10,0],"height":[0,10,10,8,9,9,10,10,10,10,0],"texture":[6,4,2,3,3,11,63,4,3,63],"propeller":false,"angle":90,"laser":{"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0}},"sidecannons4":{"section_segments":8,"offset":{"x":32.5,"y":65,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,-1,-2],"y":[-90,-95,-90,-90,-70,-20],"z":[0,0,0,0,0,0,0,0,0,3,5]},"width":[0,10,10,8,9,9,10,10,10,10,0],"height":[0,10,10,8,9,9,10,10,10,10,0],"texture":[6,4,2,4,3,11,63,4,3,63],"propeller":false,"angle":97.5,"laser":{"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0}},"bottompropulsors":{"section_segments":12,"offset":{"x":30,"y":50,"z":0},"position":{"x":[-11,-5,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-115,-85,-50,-40,-25,-5,5,20,40,30],"z":[2,0,0,0,0,0,0,0,0,0]},"width":[0,15,23,25,25,25,25,20,15,0],"height":[0,10,13,13,13,13,13,13,10,0],"texture":[63,11,3,4,10,3,63,12,17],"propeller":true,"angle":2}},"wings":{"join":{"offset":{"x":0,"y":38,"z":30},"doubleside":true,"length":[28,15,10],"width":[130,125,85,30],"angle":[10,10,10],"position":[0,0,0,0],"texture":[4,63,3],"bump":{"position":0,"size":2}}},"typespec":{"name":"Ivo","level":6,"model":100,"code":700,"specs":{"shield":{"capacity":[320,450],"reload":[8,12]},"generator":{"capacity":[250,400],"reload":[65,100]},"ship":{"mass":400,"speed":[90,115],"rotation":[50,70],"acceleration":[70,90]}},"shape":[5.674,5.479,4.934,3.98,2.959,2.345,2.191,2.137,2.059,2.014,2.685,2.666,2.64,2.647,2.818,2.936,3.007,3.374,3.645,4.086,4.459,4.232,4.227,5.259,5.524,5.471,5.524,5.259,4.227,4.232,4.459,4.086,3.645,3.374,3.007,2.936,2.818,2.647,2.64,2.666,2.685,2.014,2.059,2.137,2.191,2.345,2.959,3.98,4.934,5.479],"lasers":[{"x":0.84,"y":-4.83,"z":-0.42,"angle":0,"damage":[10,20],"rate":1,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.84,"y":-4.83,"z":-0.42,"angle":0,"damage":[10,20],"rate":1,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.61,"y":-0.348,"z":0.84,"angle":85,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.61,"y":-0.348,"z":0.84,"angle":-85,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.73,"y":0.84,"z":0.84,"angle":90,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.73,"y":0.84,"z":0.84,"angle":-90,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.73,"y":1.995,"z":0.84,"angle":90,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.73,"y":1.995,"z":0.84,"angle":-90,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.591,"y":3.251,"z":0.84,"angle":97.5,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.591,"y":3.251,"z":0.84,"angle":-97.5,"damage":[30,50],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.674}}',
                            '{"name":"Sigma-Defender","level":6,"model":103,"size":1.6,"specs":{"shield":{"capacity":[250,375],"reload":[7,10]},"generator":{"capacity":[80,150],"reload":[42,64]},"ship":{"mass":375,"speed":[80,115],"rotation":[60,80],"acceleration":[40,70]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-45,-30,-20,0,80,110,120],"z":[0,0,0,0,0,0,0,-5]},"width":[1,10,20,25,20,20,7.5,0],"height":[0,5,10,15,15,15,7.5,0],"texture":[13,63,4,4,2,63,63],"propeller":false,"laser":{"damage":[45,70],"rate":2.25,"type":2,"speed":[150,220],"number":1,"error":0}},"mainback":{"section_segments":12,"offset":{"x":0,"y":-10,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-70,-40,-10,20,40,70,80,100,95],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,15,17.5,25,25,25,15,10,0],"height":[0,27.5,30,30,30,25,20,15,0],"texture":[4,4,3,11,4,4,13,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-50,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,0,25,30],"z":[0,0,0,2.5,0]},"width":[0,10,15,10,0],"height":[0,10,17,17,0],"texture":[7,9,4,4],"propeller":false},"side_deco":{"section_segments":8,"offset":{"x":21,"y":-25,"z":-5},"position":{"x":[0,-10,0,-5,-20,-10],"y":[-20,0,20,90,105,115],"z":[0,0,0,0,0,0]},"width":[0,15,5,10,0,0],"height":[5,20,20,20,0,0],"texture":[63,63,4,63],"propeller":false,"angle":0},"prongs":{"section_segments":8,"offset":{"x":65,"y":0,"z":0},"position":{"x":[-41.5,-30,0,15,20,16,10,-7.55,-7.5,-7.5],"y":[-110,-100,-60,-30,0,20,60,105,115,110],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,20,15,13,10,0],"height":[0,5,15,10,10,10,10,7,5,0],"texture":[4,63,2,10,4,3,63,13,17],"propeller":true}},"wings":{"main":{"doubleside":true,"length":[45,40],"width":[100,50,40,10],"angle":[0,0,0],"position":[-30,25,0,-35],"texture":[8,63],"bump":{"position":-20,"size":10},"offset":{"x":0,"y":10,"z":0}},"front":{"doubleside":true,"offset":{"x":10,"y":-55,"z":8},"length":[30],"width":[30,10],"angle":[0],"position":[0,20],"texture":[3],"bump":{"position":10,"size":10}}},"typespec":{"name":"Sigma-Defender","level":6,"model":103,"code":703,"specs":{"shield":{"capacity":[250,375],"reload":[7,10]},"generator":{"capacity":[80,150],"reload":[42,64]},"ship":{"mass":375,"speed":[80,115],"rotation":[60,80],"acceleration":[40,70]}},"shape":[2.725,2.739,3.599,3.534,3.481,3.324,3.231,3.2,3.191,3.159,3.188,3.168,3.198,3.245,3.295,3.305,3.378,3.489,3.615,3.82,4.135,4.267,4.067,2.398,2.901,2.886,2.901,2.398,4.067,4.267,4.135,3.82,3.615,3.489,3.378,3.305,3.295,3.245,3.2,3.168,3.188,3.159,3.191,3.2,3.231,3.324,3.481,3.534,3.599,2.739],"lasers":[{"x":0,"y":-2.72,"z":0,"angle":0,"damage":[45,70],"rate":2.25,"type":2,"speed":[150,220],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.267}}',
                            '{"name":"Imperius","level":6,"model":110,"size":1.4,"specs":{"shield":{"capacity":[270,400],"reload":[5,9]},"generator":{"capacity":[130,190],"reload":[32,57]},"ship":{"mass":350,"speed":[85,115],"rotation":[55,55],"acceleration":[100,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-170,-180,-160,-130,-115,-80,-50,0,40,90,115,125,120],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,15,23,28,29,30,34,34,33,32,30,25,0],"height":[0,8,14,20,22,25,30,30,30,30,30,25,0],"texture":[4,63,2,3,11,4,3,10,4,63,13,17],"propeller":true,"laser":{"damage":[50,75],"rate":1,"type":1,"speed":[130,180],"number":1,"angle":0,"recoil":100,"error":0}},"pieces":{"section_segments":12,"offset":{"x":85,"y":70,"z":2},"position":{"x":[-30,-30,-26,-10,-3,0,0,0,0,0,0,0,0],"y":[-205,-210,-200,-145,-100,-75,-25,25,75,90,85],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,20,25,27,30,30,25,15,0],"height":[0,10,15,20,20,20,20,20,20,10,0],"texture":[17,3,4,10,3,63,11,2,12,17,17],"propeller":true,"angle":0,"laser":{"damage":[14,20],"rate":1,"type":1,"speed":[130,180],"number":1,"angle":0,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-75,"z":22},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-55,-45,-15,13,45,80,160,170],"z":[-8,-7,-5,-3,0,0,0,0]},"width":[5,15,20,20,20,20,15,0],"height":[0,12,21,23,18,18,15,0],"propeller":false,"texture":[9,9,9,3,10,63,3]},"cannon1":{"section_segments":12,"offset":{"x":85,"y":70,"z":30},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-100,-80,-30,10,30,60,65],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,7,10,13,13,13,10,0,0],"height":[0,7,10,10,10,10,8,0,0],"angle":0,"laser":{"damage":[3,5],"rate":6,"type":1,"speed":[130,180],"number":1,"angle":0,"error":0},"propeller":false,"texture":[17,3,4,10,4,63,4]}},"wings":{"main":{"length":[45,50,20],"width":[250,140,50,40],"angle":[0,0],"position":[-30,10,30],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":0,"y":55,"z":0}}},"typespec":{"name":"Imperius","level":6,"model":110,"code":710,"specs":{"shield":{"capacity":[270,400],"reload":[5,9]},"generator":{"capacity":[130,190],"reload":[32,57]},"ship":{"mass":350,"speed":[85,115],"rotation":[55,55],"acceleration":[100,100]}},"shape":[4.208,4.221,4.122,4.322,4.312,4.026,3.711,3.495,3.33,3.202,3.131,3.11,3.144,3.192,3.295,3.463,3.672,3.979,4.365,4.874,5.267,5.283,4.951,4.228,4.396,4.349,4.396,4.228,4.951,5.283,5.267,4.874,4.365,3.979,3.672,3.463,3.295,3.192,3.144,3.11,3.131,3.202,3.33,3.495,3.711,4.026,4.312,4.322,4.122,4.221],"lasers":[{"x":0,"y":-4.2,"z":0,"angle":0,"damage":[50,75],"rate":1,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":100},{"x":1.54,"y":-3.92,"z":0.056,"angle":0,"damage":[14,20],"rate":1,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.54,"y":-3.92,"z":0.056,"angle":0,"damage":[14,20],"rate":1,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.38,"y":-0.84,"z":0.84,"angle":0,"damage":[3,5],"rate":6,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.38,"y":-0.84,"z":0.84,"angle":0,"damage":[3,5],"rate":6,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.283}}',
                            '{"name":"Penumbra","level":6,"model":118,"size":2.2,"specs":{"shield":{"capacity":[350,425],"reload":[7,12]},"generator":{"capacity":[125,220],"reload":[54,70]},"ship":{"mass":350,"speed":[75,110],"rotation":[50,65],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-35,-20,0,30,50,70,80,90,120,113],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,15,20,25,20,20,20,25,15,0],"height":[0,2,10,16,20,20,20,20,20,15,0],"texture":[17,3,2,11,4,63,3,4,8,3],"propeller":true},"main2":{"section_segments":10,"offset":{"x":20,"y":-30,"z":0},"position":{"x":[-6,-6,-8,-3,-4,0,0,-2,-2,-5,-5],"y":[-10,-15,-10,10,30,50,70,80,80,85,90],"z":[0,0,-2,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,10,10,10,10,10,0],"height":[0,3,7,7,7,7,7,10,10,10,0],"texture":[17,4,3,2,4,10,4,63,3,4],"propeller":true,"laser":{"damage":[10,18],"rate":1,"type":1,"speed":[120,190],"number":1,"angle":0,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-16,-10,10,30,50,80],"z":[0,-4,-1,0,0,0,0,0]},"width":[0,7,12,13,10,0],"height":[0,10,12,12,12,0],"texture":[4,9,9,4,3],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":40,"y":-10,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-70,-35,-20,0,20,50,55],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,7,7,8,8,8,0],"height":[0,4,7,7,8,8,8,0],"angle":0,"laser":{"damage":[18,30],"rate":1,"type":1,"speed":[120,190],"number":1,"angle":0,"error":0},"propeller":false,"texture":[17,4,3,63,4,4,4]},"cannons2":{"section_segments":8,"offset":{"x":75,"y":-10,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-70,-35,-20,0,20,50,55],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,7,7,8,8,8,0],"height":[0,4,7,7,8,8,8,0],"angle":0,"laser":{"damage":[18,30],"rate":1,"type":1,"speed":[120,190],"number":1,"angle":0,"error":0},"propeller":false,"texture":[17,4,3,63,4,4,4]},"propulsors":{"section_segments":12,"offset":{"x":57,"y":20,"z":-24},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-55,-50,-20,0,20,30,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,13,15,19,19,19,19,15,0],"height":[0,13,15,19,19,19,19,15,0],"texture":[4,3,10,4,63,4,3,17],"angle":0,"propeller":true}},"wings":{"main":{"offset":{"x":0,"y":40,"z":0},"length":[30,10,20,10,20],"width":[70,50,60,50,60,30],"texture":[4,3,11,63,4],"angle":[0,0,-10,-30,-30],"position":[10,-20,-20,-30,-25,-40],"doubleside":1,"bump":{"position":-10,"size":10}},"main2":{"offset":{"x":0,"y":80,"z":-17},"length":[10,0,20,10,20],"width":[30,30,30,30,60,30],"texture":[4,3,4,8,63],"angle":[90,90,90,90,90],"position":[-50,-20,-20,-30,-25,10],"doubleside":1,"bump":{"position":-10,"size":5}},"main3":{"offset":{"x":0,"y":80,"z":20},"length":[10,0,10,10,20],"width":[30,30,30,30,60,30],"texture":[4,3,4,4,63],"angle":[-40,-40,-40,-40,-40],"position":[-50,-20,-20,-30,-25,10],"doubleside":1,"bump":{"position":-10,"size":5}},"main4":{"offset":{"x":15,"y":40,"z":-5},"length":[10,0,10,10,20],"width":[30,30,40,50,60,30],"texture":[4,3,4,4,63],"angle":[-40,-40,-40,-40,-40],"position":[-50,-20,-20,-30,-25,10],"doubleside":1,"bump":{"position":-10,"size":5}},"main5":{"offset":{"x":55,"y":0,"z":-25},"length":[10,0,10,5,0,10,15],"width":[30,30,40,50,60,130,130,60],"texture":[4,3,3,4,13,4,63],"angle":[0,0,0,0,0,0,0],"position":[0,0,0,0,-25,-35,-25,25],"doubleside":1,"bump":{"position":-10,"size":5}},"main6":{"offset":{"x":-60,"y":0,"z":-25},"length":[10,0,10,5,0,10,15],"width":[30,30,40,50,60,130,130,60],"texture":[4,3,3,4,13,4,63],"angle":[0,0,0,0,0,0,0],"position":[0,0,0,0,-25,-35,-25,25],"doubleside":1,"bump":{"position":-10,"size":5}}},"typespec":{"name":"Penumbra","level":6,"model":118,"code":718,"specs":{"shield":{"capacity":[350,425],"reload":[7,12]},"generator":{"capacity":[125,220],"reload":[54,70]},"ship":{"mass":350,"speed":[75,110],"rotation":[50,65],"acceleration":[80,100]}},"shape":[2.866,2.882,4.45,4.662,4.017,5.635,5.625,5.473,5.099,4.84,4.682,4.599,4.625,4.655,4.768,4.963,5.215,4.045,4.124,3.854,3.699,3.954,4.918,4.413,4.015,4.62,4.015,4.413,4.918,3.954,3.699,3.854,4.124,4.045,5.215,4.963,4.768,4.655,4.625,4.599,4.682,4.84,5.099,5.473,5.625,5.635,4.017,4.662,4.45,2.882],"lasers":[{"x":0.616,"y":-1.98,"z":0,"angle":0,"damage":[10,18],"rate":1,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.616,"y":-1.98,"z":0,"angle":0,"damage":[10,18],"rate":1,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.76,"y":-3.52,"z":-1.1,"angle":0,"damage":[18,30],"rate":1,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.76,"y":-3.52,"z":-1.1,"angle":0,"damage":[18,30],"rate":1,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.3,"y":-3.52,"z":-1.1,"angle":0,"damage":[18,30],"rate":1,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.3,"y":-3.52,"z":-1.1,"angle":0,"damage":[18,30],"rate":1,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.635}}',
                            '{"name":"Spectre","level":6,"model":122,"size":2,"specs":{"shield":{"capacity":[225,350],"reload":[7,12]},"generator":{"capacity":[140,200],"reload":[35,67]},"ship":{"mass":350,"speed":[90,110],"rotation":[80,110],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-50,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,-10,30,70,100,110,100],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,19,17,14,12,0],"height":[0,5,15,17,14,12,0],"texture":[12,1,3,11,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":10,"z":21},"position":{"x":[0,0,0,0,0],"y":[-50,-40,-25,-10,40],"z":[-2,-1,0,0,2]},"width":[0,7,10,9,0],"height":[0,8,12,10,0],"texture":[9,9,9,4]},"side":{"section_segments":8,"offset":{"x":50,"y":-65,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-61,-60,-40,10,40,35],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,15,12,0],"height":[0,10,10,15,12,0],"texture":[3,63,4,3,18],"propeller":false},"thrusterss":{"section_segments":12,"offset":{"x":50,"y":80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-66,-65,-60,-40,-20,0,10,30,40,35],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,12.5,15,15,15,15,12,0],"height":[0,5,10,12.5,15,15,15,15,12,0],"texture":[3,12,4,10,2,63,4,12,17],"propeller":true},"cannons":{"section_segments":8,"offset":{"x":51,"y":-75,"z":0},"position":{"x":[0,0,0,0,0,-3],"y":[-50,-60,-20,0,20,45],"z":[0,0,0,0,0,1]},"width":[0,5,6,8,7,0],"height":[0,5,5,8,8,0],"angle":2.5,"laser":{"damage":[6,11],"rate":10,"type":1,"speed":[180,250],"recoil":0,"number":1,"error":0},"propeller":false,"texture":[6,3,63,10,2]},"sidemain":{"section_segments":8,"offset":{"x":15,"y":20,"z":10},"position":{"x":[-1,2,2,1,1,1,1],"y":[-60,-13,10,40,60,55],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,10,8,0],"height":[0,10,13,13,10,0],"propeller":true,"texture":[2,63,10,2,17]}},"wings":{"main":{"doubleside":true,"offset":{"x":10,"y":-40,"z":5},"length":[45],"width":[50,40],"angle":[-10],"position":[20,-25],"texture":11,"bump":{"position":30,"size":10}},"main2":{"doubleside":true,"offset":{"x":10,"y":40,"z":5},"length":[45],"width":[60,50],"angle":[0],"position":[-20,35],"texture":11,"bump":{"position":30,"size":10}},"bump":{"doubleside":true,"offset":{"x":15,"y":40,"z":14},"length":[30],"width":[45,20],"angle":[30],"position":[0,20],"texture":63,"bump":{"position":30,"size":10}},"side":{"doubleside":true,"offset":{"x":57,"y":-55,"z":-10},"length":[23],"width":[55,20],"angle":[10],"position":[0,20],"texture":63,"bump":{"position":30,"size":10}},"side2":{"doubleside":true,"offset":{"x":57,"y":70,"z":0},"length":[23],"width":[85,30],"angle":[10],"position":[0,20],"texture":63,"bump":{"position":-30,"size":5}}},"typespec":{"name":"Spectre","level":6,"model":122,"code":722,"specs":{"shield":{"capacity":[225,350],"reload":[7,12]},"generator":{"capacity":[140,200],"reload":[35,67]},"ship":{"mass":350,"speed":[90,110],"rotation":[80,110],"acceleration":[60,80]}},"shape":[2.405,2.433,5.667,5.813,5.546,4.532,3.946,3.738,3.67,3.632,3.425,0.883,0.9,0.931,0.982,2.6,2.815,3.305,4.357,4.99,5.272,5.403,5.304,5.047,3.257,2.405,3.257,5.047,5.304,5.403,5.272,4.99,4.357,3.305,2.815,2.6,0.982,0.931,0.9,0.883,3.425,3.632,3.67,3.738,3.946,4.532,5.546,5.813,5.667,2.433],"lasers":[{"x":1.935,"y":-5.398,"z":0,"angle":2.5,"damage":[6,11],"rate":10,"type":1,"speed":[180,250],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.935,"y":-5.398,"z":0,"angle":-2.5,"damage":[6,11],"rate":10,"type":1,"speed":[180,250],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.813}}',
                            '{"name":"Cybernost","level":6,"model":123,"size":2.85,"specs":{"shield":{"capacity":[300,415],"reload":[5,9]},"generator":{"capacity":[140,220],"reload":[42,67]},"ship":{"mass":400,"speed":[85,110],"rotation":[45,70],"acceleration":[50,70]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-55,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,-10,10,25,50,60,80,110,120,110],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,18,18,28,30,20,15,0],"height":[0,5,13,15,15,15,15,15,10,0],"texture":[1,2,2,63,10,4,11,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-55,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,15,30,50,60,75,85,100,110],"z":[0,1,0,0,0,0,0,0,0,0]},"width":[0,7,11,11,11,13,13,11,0],"height":[0,12,19,20,22.5,23,22,18,0],"texture":[9,9,9,4,11,3,63,1]},"side":{"section_segments":12,"offset":{"x":21,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,-2,-8],"y":[-45,-50,-40,-30,-10,0,15,30,50,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,10,10,10,10,8,0],"height":[0,5,10,10,10,10,10,10,8,0],"texture":[17,4,3,10,63,4,3,63,4],"laser":{"damage":[30,50],"rate":1,"type":2,"speed":[170,210],"recoil":250,"number":1,"error":0}},"cannons2":{"section_segments":8,"offset":{"x":33,"y":-95,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,-3],"y":[8,10,27,34,60,68,97,102,160,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,7,7,5,5,0],"height":[0,3,5,5,5,7,7,5,5,3],"texture":[6,4,63,8,63,4,63,3],"propeller":false,"angle":0,"laser":{"damage":[30,50],"rate":1,"type":2,"speed":[170,210],"recoil":10,"number":1,"error":0}}},"wings":{"main":{"length":[25,15],"width":[40,30,10],"angle":[15,-10],"position":[-2,10,30],"doubleside":true,"offset":{"x":20,"y":34,"z":0},"bump":{"position":0,"size":5},"texture":[4,63]},"main2":{"length":[40,-2,5,15],"width":[50,40,150,150,30],"angle":[10,0,-10,-10],"position":[0,25,-20,-20,10],"doubleside":true,"offset":{"x":0,"y":15,"z":-10},"bump":{"position":30,"size":5},"texture":[11,12,63,4]},"main3":{"length":[5,15],"width":[30,30,10],"angle":[0,0],"position":[-2,0,-20],"doubleside":true,"offset":{"x":57,"y":27,"z":-6},"bump":{"position":0,"size":0},"texture":[2,3]}},"typespec":{"name":"Cybernost","level":6,"model":123,"code":723,"specs":{"shield":{"capacity":[300,415],"reload":[5,9]},"generator":{"capacity":[140,220],"reload":[42,67]},"ship":{"mass":400,"speed":[85,110],"rotation":[45,70],"acceleration":[50,70]}},"shape":[3.712,3.716,3.146,5.304,5.159,4.677,4.129,3.75,3.488,3.305,3.192,3.13,3.153,4.424,4.442,4.329,4.247,4.269,4.34,5.172,4.888,4.662,4.243,3.802,3.772,3.712,3.772,3.802,4.243,4.662,4.888,5.172,4.34,4.269,4.247,4.329,4.442,4.424,3.153,3.13,3.192,3.305,3.488,3.75,4.129,4.677,5.159,5.304,3.146,3.716],"lasers":[{"x":1.197,"y":-2.565,"z":0,"angle":0,"damage":[30,50],"rate":1,"type":2,"speed":[170,210],"number":1,"spread":0,"error":0,"recoil":250},{"x":-1.197,"y":-2.565,"z":0,"angle":0,"damage":[30,50],"rate":1,"type":2,"speed":[170,210],"number":1,"spread":0,"error":0,"recoil":250},{"x":1.881,"y":-4.959,"z":-0.285,"angle":0,"damage":[30,50],"rate":1,"type":2,"speed":[170,210],"number":1,"spread":0,"error":0,"recoil":10},{"x":-1.881,"y":-4.959,"z":-0.285,"angle":0,"damage":[30,50],"rate":1,"type":2,"speed":[170,210],"number":1,"spread":0,"error":0,"recoil":10}],"radius":5.304}}',
                        ]
                    }
                ]
            }
        ]
    }

    constructor(tier, ships) {
        this.tier = tier;

        this.processShips(ships);
    }

    processShips(ships) {
        let totalLength = 0;
        for (let i = 0; i < ships.length; i++) {
            totalLength += ships[i].CODES.length;
        }
        for (let i = 0; i < ships.length; i++) {
            let origin = ships[i].ORIGIN;
            let codes = ships[i].CODES;
            for (let j = 0; j < codes.length; j++) {
                let ship = codes[j];
                let jship = JSON.parse(ship);

                jship.model = (i + 1) * (j + 1);
                jship.typespec.model = (i + 1) * (j + 1);
                jship.typespec.code = jship.level * 100 + jship.model;

                jship.origin = origin;

                jship.next = [];
                jship.typespec.next = [];

                this.normalShips.push(JSON.stringify(jship));

                jship.bodies.flag = ShipGroup.C.FLAG.FLAG_OBJ;
                jship.bodies.flagpole = ShipGroup.C.FLAG.FLAGPOLE_OBJ;
                jship.model += totalLength;

                jship.typespec.specs.ship.speed[1] /= ShipGroup.C.FLAG.FLAG_WEIGHT;
                jship.specs.ship.speed[1] /= ShipGroup.C.FLAG.FLAG_WEIGHT;
                jship.typespec.specs.ship.mass *= ShipGroup.C.FLAG.FLAG_WEIGHT;
                jship.specs.ship.mass *= ShipGroup.C.FLAG.FLAG_WEIGHT;

                let flagShip = JSON.stringify(jship);
                this.flagShips.push(flagShip);
            }
        }

        this.ships.push(...Helper.deepCopy(this.normalShips));
        this.ships.push(...Helper.deepCopy(this.flagShips));
    }

    chooseShips(select = true) {
        if (select) {
            this.chosenShips = Helper.getRandomArraySubset(this.normalShips, ShipGroup.C.NUM_SHIPS);
        } else {
            this.chosenShips = Helper.deepCopy(this.normalShips);
        }
        this.chosenNames = [];
        this.chosenTypes = [];
        this.chosenOrigins = [];
        for (let ship of this.chosenShips) {
            let jship = JSON.parse(ship);
            this.chosenNames.push(jship.name);
            this.chosenTypes.push(jship.level * 100 + jship.model);
            this.chosenOrigins.push(jship.origin);
        }
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

    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
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

Game.setShipGroups();
this.options = {
    root_mode: Game.C.OPTIONS.ROOT_MODE,
    map_size: Game.C.OPTIONS.MAP_SIZE,
    custom_map: Game.C.OPTIONS.MAP,
    asteroids_strength: Game.C.OPTIONS.ASTEROIDS_STRENGTH,
    release_crystals: Game.C.OPTIONS.RELEASE_CRYSTAL,
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
    if (g != null) {
        g.tick();
    }
    else {
        g = new Game();
    }
}

this.event = function (event) {
    let gameShip = event.ship;
    if (gameShip != null && g != null) {
        switch (event.name) {
            case 'ship_spawned':
                g.onShipSpawned(gameShip);
                break;
            case 'ship_destroyed':
                g.onShipDestroyed(gameShip);
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
