/*
    CAPTURE THE FLAG (CTF)
    @author JavRedstone
    @version 3.0.0

    Map help from F14DSupertomcat
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

            WAIT: 7200,
            ROUND: 28800,
            BETWEEN: 360
        },
        IS_TESTING: false,
        IS_DEBUGGING: false,
        MIN_PLAYERS: 2,
        ROUND_MAX: 5,
        NUM_ROUNDS: 3,
        TEAM_PLAYER_DEFICIT: 2,
        TEAM_SCORE_DEFICIT: 2
    }

    static setShipGroups() {
        Game.C.OPTIONS.SHIPS = ['{"name":"Invisible","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'];
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
                } else if (this.waiting && this.waitTimer != -1) {
                    this.waitTimer = -1
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
                        if (this.teams.length == 2 && Math.abs(this.teams[0].ships.length - this.teams[1].ships.length) >= Game.C.TEAM_PLAYER_DEFICIT) {
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
                                if (!ship.left && ship.ship.alive && ship.ship.type != 101) {
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
                                    chooseShip.shortcut = `${i + 1}`;
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

                            if (ship.chosenType == 0) {
                                if (this.map && this.map.spawns.length == 2 && ship.team) {
                                    ship.setPosition(this.map.spawns[ship.team.team]);
                                }
                                ship.setType(101);
                                ship.setCrystals(0);
                                ship.setMaxStats();
                                ship.setCollider(false);
                            }
                        } else {
                            if (ship.choosingShip) {
                                if (ship.chosenType == 0) {
                                    ship.chosenType = Helper.getRandomArrayElement(this.shipGroup.chosenTypes);
                                    ship.setType(ship.chosenType);
                                    ship.fillUp();
                                    ship.setInvulnerable(Ship.C.INVULNERABLE_TIME);
                                }
                                ship.setCollider(true);
                                ship.hideUIsIncludingID(UIComponent.C.UIS.CHOOSE_SHIP);
                                ship.hideUI(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                                ship.choosingShip = false;

                                if (this.map && this.map.spawns.length == 2 && ship.team) {
                                    this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                                }
                            }
                        }

                        if (!ship.left && ship.ship.alive && ship.ship.type != 101) {
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
                    scoreboard.components[1].value = `${this.teams[0].color.toUpperCase()} TEAM (${this.teams[0].ships.length} player${this.teams[0].ships.length == 1 ? '' : 's'})`;
                    if (this.teams[0].color == 'Yellow' || this.teams[0].color == 'Cyan') {
                        scoreboard.components[1].color = '#000000';
                    }
                    scoreboard.components[3].value = `${this.teams[1].color.toUpperCase()} TEAM (${this.teams[1].ships.length} player${this.teams[1].ships.length == 1 ? '' : 's'})`;
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
                if (!this.waiting && this.betweenTime == -1 && !ship.left && ship.ship.alive && ship.ship.type != 101) {
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
                if (this.betweenTime == -1) {
                    ship.sendTimedUI(UIComponent.C.UIS.CHANGE_SHIP);
                    ship.fillUp();
                }
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
                    if (ship.chosenType == 0 && this.map && this.map.spawns.length == 2 && ship.team) {
                        this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                    }

                    ship.chosenType = this.shipGroup.chosenTypes[parseInt(id.split('-')[1])];
                    ship.setType(ship.chosenType);
                    ship.fillUp();
                    ship.setCollider(true);
                    ship.setInvulnerable(Ship.C.INVULNERABLE_TIME)
                    ship.hideUIsIncludingID(UIComponent.C.UIS.CHOOSE_SHIP);
                    ship.hideUI(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                    ship.chooseShipTime = -1;
                    ship.choosingShip = false;
                }
            }
            if (id == UIComponent.C.UIS.CHANGE_SHIP.id) {
                ship.chooseShipTime = game.step;
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
            CHANGE_SHIP: {
                id: "change_ship",
                position: [2, 40, 15, 5],
                clickable: true,
                shortcut: 'C',
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#008B0080",
                    },
                    {
                        type: "text",
                        position: [5, 0, 90, 100],
                        value: "Change Ship [C]",
                        color: "#00ff00"
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
                        position: [10, 82.5, 80, 15],
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
                    x: -110,
                    y: -120
                }, {
                    x: 110,
                    y: 120
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
                    "999                  9  9  444444  9  9                  999\n"+
                    "999              9                        9              999\n"+
                    "99996               9  9            9  9               69999\n"+
                    "99996                                                  69999\n"+
                    "999            94499999999        99999999449            999\n"+
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
                    "999   9        94499999999        99999999449            999\n"+
                    "99996                                                  69999\n"+
                    "99996               9  9            9  9               69999\n"+
                    "999              9                        9              999\n"+
                    "999                  9  9  444444  9  9                  999\n"+
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
                    x: -95,
                    y: -120
                }, {
                    x: 95,
                    y: 120
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
                    " 999     99  9999              7 77997     99999     99999  \n"+
                    "799     99    9999             9   9997   99999     99999   \n"+
                    "997            9999            999 997   99999     79999   7\n"+
                    "997             9999        9  999997   99999      5999   79\n"+
                    "975  99999       9999      99   9997   99999        57   799\n"+
                    "75   999999       9999          997   99999     75        77\n"+
                    "          99       9999         97   99999     9995    7    \n"+
                    "          999       9999999         99999     99997   79    \n"+
                    "          9999       99999999      99999     99999   79   77\n"+
                    "            999       99999999    99999     99999   799   79\n"+
                    "             999           997   99999     99999   799     7\n"+
                    "              999           7   99999     99999   799  99  9\n"+
                    "               999    777      99999     79999     9  99  99\n"+
                    "77       77     999  99997    99999      7999   7     9  999\n"+
                    "997     7997     999 99997   99999      7999   799      9999\n"+
                    "997    799997     9999997   99999     77999   79999    99999\n"+
                    "9997  7999 997     99997   79999     99999   7999999  999999\n"+
                    "99997799 999997     997     799     99999   7999999999999999\n"+
                    "999999999    997     7       7     99999    9999999999999999\n"+
                    "999999999 777999                  99999     999    999999999\n"+
                    "999999999 7  999       7 7       79999      999 77 999999999\n"+
                    "999999999 77 999      99997       7 7       999  7 999999999\n"+
                    "999999999    999     99999                  999777 999999999\n"+
                    "99999999999999997   99999     7       7     799    999999999\n"+
                    "999999 999999997   99999     997     799     799999 99779999\n"+
                    "99999   9999997   99999     99997   79999     799 9997  7999\n"+
                    "9999     99997   99977     99999   7999999     799997    799\n"+
                    "999  9    997   9997      99999   79999 999     7997     799\n"+
                    "99  99     7   9997      99999    79999  999     77       77\n"+
                    "9  99   9     99997     99999      777    999               \n"+
                    "       997   99999     99999   7           999              \n"+
                    "7     997   99999     99999   799           999             \n"+
                    "97   997   99999     99999    99999999       999            \n"+
                    "77   97   99999     99999      99999999       9999          \n"+
                    "    97   79999     99999         9999999       999          \n"+
                    "    7    5999     99999   79         9999       99          \n"+
                    "77        57     99999   799          9999       999999   57\n"+
                    "997   75        99999   7999   99      9999       99999  579\n"+
                    "97   9995      99999   799999  9        9999             799\n"+
                    "7   99997     99999   799 999            9999            799\n"+
                    "   99999     99999   7999   9             9999    99     999\n"+
                    "  99999     99999     79977 7              9999  99     999 \n"+
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
                    x: 130,
                    y: -130
                }, {
                    x: -130,
                    y: 130
                }],
                portals: [
                    {
                        x: 230,
                        y: -100
                    },
                    {
                        x: -230,
                        y: 100
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
                    ...Array.from({ length: 4 }, (_, i) => i).map(i => ({
                        x: 600 / 4 * i,
                        y: 600 / 4 * i + 90,
                        vx: 0.4,
                        vy: 0.4,
                        size: 40
                    })),
                    ...Array.from({ length: 4 }, (_, i) => i).map(i => ({
                        x: 600 / 4 * i,
                        y: 600 / 4 * i - 90,
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
            this.tiers = Helper.deepCopy(ShipGroup.C.ALLOWED_TIERS);
        } else {
            this.tiers = this.tiers.filter(tier => ShipGroup.C.ALLOWED_TIERS.includes(tier));
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
        ALLOWED_TIERS: [5, 6],
        GROUPS: [
            {
                TIER: 5,
                SHIPS: [
                    {
                        ORIGIN: "Vanilla Revamp",
                        CODES: [
                            '{"name": "Khepri", "level": 5, "model": 1, "code":501, "next":[601,602], "size": 1.5, "specs": {"shield": {"capacity": [150, 250], "reload": [5, 7]}, "generator": {"capacity": [60, 90], "reload": [21, 43]}, "ship": {"mass": 240, "speed": [85, 105], "rotation": [35, 65], "acceleration": [130, 170]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -30, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-85, -80, -85, -60, -35, -4, 38, 53, 86, 125, 120], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 9, 17, 22, 25, 27, 29, 25, 22, 0], "height": [0, 7, 8, 13, 23, 26, 26, 24, 22, 17, 0], "texture": [17, 4, 13, 63, 4, 10, 63, 4, 12, 17], "propeller": true, "laser": {"damage": [20, 30], "rate": 10, "type": 1, "speed": [150, 200], "number": 1, "error": 3}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 30, "z": 19}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-95, -63, -31, -16, -4, -5], "z": [-6, 1, 0, -3, -3, 0]}, "width": [11, 14, 13, 10, 3, 0], "height": [10, 12, 16, 17, 16, 0], "texture": [9, 9, 63, 3, 63], "propeller": false}, "Thrusters": {"section_segments": 12, "offset": {"x": 27, "y": 20, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-65, -50, -25, -8, 40, 60, 50], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 7, 8, 8, 7, 0], "height": [0, 5, 9, 12, 8, 9, 0], "texture": [4, 63, 4, 18, 13, 12], "propeller": true, "angle": 0}}, "wings": {"wing0": {"doubleside": true, "length": [16, 20, 0, 32], "width": [98, 87, 77, 113, 3], "angle": [-1, -5, -5, -6], "position": [-19, 35, 50, 50, -10], "offset": {"x": 23, "y": 25, "z": 3}, "bump": {"position": 40, "size": 7}, "texture": [3, 4, 13, 63]}, "wing1": {"doubleside": true, "length": [2, 35], "width": [77, 53, 17], "angle": [10, 0, 11], "position": [25, 25, -10], "offset": {"x": 25, "y": 0, "z": -8}, "bump": {"position": 0, "size": 5}, "texture": [13, 13]}, "winglets": {"offset": {"x": 0, "y": 33, "z": 22}, "length": [9, 18], "width": [15, 25, 80], "angle": [0, -20], "position": [0, -5, 30], "texture": [4, 63], "bump": {"position": 10, "size": 30}}, "winglets2": {"offset": {"x": 0, "y": 33, "z": 22}, "length": [9, 13], "width": [15, 25, 120], "angle": [90, 90, 0], "position": [0, -5, 50], "texture": [4, 63], "bump": {"position": 10, "size": 30}}}, "typespec": {"name": "Khepri", "level": 5, "model": 1, "code":501, "next":[601,602], "specs": {"shield": {"capacity": [175, 250], "reload": [5, 7]}, "generator": {"capacity": [60, 90], "reload": [21, 43]}, "ship": {"mass": 240, "speed": [85, 105], "rotation": [40, 70], "acceleration": [130, 170]}}, "shape": [3.457, 3.461, 2.734, 2.099, 1.652, 1.541, 1.408, 1.316, 1.204, 1.127, 1.94, 1.918, 1.874, 1.828, 2.767, 2.771, 2.83, 2.933, 3.106, 3.347, 3.702, 4.214, 4.323, 3.167, 2.901, 4.259, 2.901, 3.167, 4.323, 4.214, 3.702, 3.347, 3.106, 2.933, 2.83, 2.771, 2.767, 1.828, 1.874, 1.918, 1.94, 1.127, 1.204, 1.316, 1.408, 1.541, 1.652, 2.099, 2.734, 3.461], "lasers": [{"x": 0, "y": -3.45, "z": 0, "angle": 0, "damage": [20, 30], "rate": 10, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 7, "recoil": 75}], "radius": 4.323}}',
                            '{"name": "U-Sniper", "level": 5, "model": 2, "code":502, "next":[602,603], "size": 1.8, "specs": {"shield": {"capacity": [200, 300], "reload": [4, 6]}, "generator": {"capacity": [80, 160], "reload": [40, 60]}, "ship": {"mass": 200, "speed": [70, 90], "rotation": [50, 70], "acceleration": [60, 110]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [0, -10, 40, 100, 90, 100], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 23, 10, 0], "height": [0, 5, 23, 10, 0], "texture": [12, 1, 10, 12], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 30}, "position": {"x": [0, 0, 0, 0], "y": [20, 40, 80], "z": [-4, 0, -6]}, "width": [5, 10, 5], "height": [0, 8, 0], "texture": [9]}, "uwings": {"section_segments": 8, "offset": {"x": 50, "y": -20, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-90, -100, 40, 80, 90, 100], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 25, 20, 0], "height": [0, 5, 25, 20, 0], "texture": [12, 2, 3, 4]}, "cannons": {"section_segments": 12, "offset": {"x": 70, "y": 20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-60, -70, -20, 0, 20, 50, 45], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 6, 10, 15, 5, 0], "height": [0, 5, 5, 10, 10, 5, 0], "angle": 0, "laser": {"damage": [40, 60], "rate": 2, "type": 2, "speed": [190, 240], "recoil": 200, "number": 1, "error": 0}, "propeller": false, "texture": [4, 4, 10, 4, 63, 4]}, "side_propulsors": {"section_segments": 10, "offset": {"x": 30, "y": 30, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [0, 10, 13, 25, 30, 40, 60, 50], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 5, 5, 10, 5, 0], "height": [0, 5, 10, 10, 10, 5, 5, 10, 5, 0], "propeller": true, "texture": [5, 2, 11, 2, 63, 11, 12]}}, "typespec": {"name": "U-Sniper", "level": 5, "model": 2, "code": 502,"next":[602, 603], "specs": {"shield": {"capacity": [250, 350], "reload": [4, 6]}, "generator": {"capacity": [80, 160], "reload": [40, 60]}, "ship": {"mass": 220, "speed": [70, 90], "rotation": [55, 75], "acceleration": [70, 120]}}, "shape": [0.361, 0.366, 0.378, 4.774, 4.83, 4.17, 3.608, 3.248, 3.245, 3.083, 2.915, 2.807, 2.751, 2.829, 2.976, 3.22, 3.412, 3.521, 3.693, 3.681, 3.138, 2.937, 3.473, 3.407, 3.618, 3.607, 3.618, 3.407, 3.473, 2.937, 3.138, 3.681, 3.693, 3.521, 3.412, 3.22, 2.976, 2.829, 2.751, 2.807, 2.915, 3.083, 3.245, 3.248, 3.608, 4.17, 4.83, 4.774, 0.378, 0.366], "lasers": [{"x": 2.52, "y": -1.8, "z": 0, "angle": 0, "damage": [40, 60], "rate": 2, "type": 2, "speed": [210, 260], "number": 1, "spread": 0, "error": 0, "recoil": 220}, {"x": -2.52, "y": -1.8, "z": 0, "angle": 0, "damage": [40, 60], "rate": 2, "type": 2, "speed": [210, 240], "number": 1, "spread": 0, "error": 0, "recoil": 220}], "radius": 4.83}}',
                            '{"name": "Toscain", "level": 5, "model": 3, "code":503, "next":[604,605], "size": 1.7, "zoom": 1.08, "specs": {"shield": {"capacity": [275, 350], "reload": [5, 8]}, "generator": {"capacity": [75, 100], "reload": [32, 45]}, "ship": {"mass": 320, "speed": [70, 90], "rotation": [50, 75], "acceleration": [80, 110]}}, "bodies": {"front": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [-100, -95, -25, 0, 25], "z": [0, 0, 0, 0, 0]}, "width": [0, 20, 40, 40, 20], "height": [0, 10, 35, 20, 5], "texture": [63, 11, 2, 63], "laser": {"damage": [25, 45], "rate": 1, "type": 2, "speed": [200, 275], "number": 1, "recoil": 50, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0], "y": [-70, -70, -25, 0, 100], "z": [0, 0, 0, 0, 10]}, "width": [0, 10, 15, 15, 10], "height": [0, 15, 35, 20, 0], "texture": [9, 9, 9, 4]}, "lasers": {"section_segments": 8, "angle": 15, "offset": {"x": 1, "y": -5, "z": -3}, "position": {"x": [0, 0, 0], "y": [-90, -70, -100], "z": [0, 0, 0]}, "width": [5, 5, 0], "height": [5, 5, 0], "texture": [6], "laser": {"damage": [4, 6], "rate": 2, "type": 1, "speed": [100, 130], "number": 2, "angle": 35, "error": 0}}, "motor": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [10, 20, 30, 100, 95], "z": [0, 0, 0, 0, 0]}, "width": [0, 40, 50, 50, 0], "height": [0, 10, 15, 20, 0], "texture": [63, 63, 10, 4]}, "propulsors": {"section_segments": 8, "offset": {"x": 25, "y": 0, "z": 0}, "position": {"x": [0, 0, 0], "y": [30, 105, 100], "z": [0, 0, 0]}, "width": [15, 15, 0], "height": [10, 10, 0], "propeller": true, "texture": [12]}}, "wings": {"main": {"doubleside": true, "offset": {"x": 30, "y": 80, "z": 0}, "length": [70, 20], "width": [80, 20], "angle": [0, 0], "position": [-20, 0], "texture": [11], "bump": {"position": 20, "size": 10}}, "winglets": {"doubleside": true, "offset": {"x": 98, "y": 81, "z": -20}, "length": [20, 50, 20], "width": [20, 35, 20], "angle": [90, 90, 90], "position": [0, 0, 0, 0], "texture": [63], "bump": {"position": 30, "size": 50}}}, "typespec": {"name": "Toscain", "level": 5, "model": 3, "code":503, "next":[604,605], "zoom": 1.08, "specs": {"shield": {"capacity": [275, 350], "reload": [5, 8]}, "generator": {"capacity": [75, 100], "reload": [35, 53]}, "ship": {"mass": 280, "speed": [70, 100], "rotation": [55, 80], "acceleration": [85, 115]}}, "shape": [3.4, 3.354, 3.556, 2.748, 2.336, 2.055, 1.858, 1.732, 1.634, 1.548, 1.462, 1.404, 1.371, 1.36, 1.241, 1.161, 1.723, 4.485, 5.01, 4.795, 4.111, 3.842, 3.82, 3.753, 3.634, 3.407, 3.634, 3.753, 3.82, 3.842, 4.111, 4.795, 5.01, 4.485, 1.723, 1.161, 1.241, 1.353, 1.371, 1.404, 1.462, 1.548, 1.634, 1.732, 1.858, 2.055, 2.336, 2.748, 3.556, 3.354], "lasers": [{"x": 0, "y": -3.4, "z": 0, "angle": 0, "damage": [30, 50], "rate": 1, "type": 2, "speed": [190, 220], "number": 1, "spread": 0, "error": 0, "recoil": 50}, {"x": -0.846, "y": -3.454, "z": -0.102, "angle": 15, "damage": [4, 6], "rate": 2, "type": 1, "speed": [100, 130], "number": 2, "spread": 35, "error": 0, "recoil": 0}, {"x": 0.846, "y": -3.454, "z": -0.102, "angle": -15, "damage": [4, 6], "rate": 2, "type": 1, "speed": [100, 130], "number": 2, "spread": 35, "error": 0, "recoil": 0}], "radius": 5.01}}',
                            '{"name": "FuryStar", "level": 5, "model": 4, "code":504, "next":[605,606],  "size": 1.5, "zoom": 1.08, "specs": {"shield": {"capacity": [200, 275], "reload": [6, 7]}, "generator": {"capacity": [100, 150], "reload": [30, 45]}, "ship": {"mass": 260, "speed": [80, 110], "rotation": [120, 180], "acceleration": [150, 180]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-50, -45, 0, 10, 15, 35, 55, 40], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 20, 25, 17, 25, 20, 15, 0], "height": [0, 15, 15, 15, 20, 20, 15, 0], "texture": [1, 4, 63, 4, 2, 12, 17], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -43, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, -4, 10], "z": [-5, 0, 0]}, "width": [1, 18, 20], "height": [1, 15, 10], "texture": [9]}, "missiles": {"section_segments": 12, "offset": {"x": 35, "y": -5, "z": 10}, "position": {"x": [0, 0, 0, 0, 0], "y": [-30, -23, 0, 23, 30], "z": [0, 0, 0, 0, 0]}, "width": [0, 5, 5, 5, 0], "height": [0, 5, 5, 5, 0], "texture": [6, 4, 4, 10], "angle": 0, "laser": {"damage": [1, 2], "rate": 4, "type": 1, "speed": [100, 125], "number": 1, "error": 0}}, "cannon": {"section_segments": 6, "offset": {"x": 15, "y": -10, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-40, -50, -20, 0, 20, 30], "z": [0, 0, 0, 0, 0, 20]}, "width": [0, 5, 8, 11, 7, 0], "height": [0, 5, 8, 11, 10, 0], "angle": 0, "laser": {"damage": [14, 20], "rate": 2, "type": 1, "speed": [200, 250], "number": 1, "error": 0}, "propeller": false, "texture": [3, 3, 10, 3]}, "top_propulsors": {"section_segments": 10, "offset": {"x": 75, "y": 45, "z": 40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "propeller": true, "texture": [4, 4, 2, 2, 5, 63, 5, 63, 17]}, "bottom_propulsors": {"section_segments": 10, "offset": {"x": 100, "y": 0, "z": -40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "propeller": true, "texture": [4, 4, 2, 2, 5, 63, 5, 4, 17]}}, "wings": {"rooftop": {"doubleside": true, "offset": {"x": 0, "y": -20, "z": 20}, "length": [20, 15, 25, 25, 5], "width": [50, 40, 35, 35, 35, 30], "angle": [0, -20, 30, 30, 30], "position": [0, 10, 20, 50, 80, 100], "texture": [8, 63, 3, 3], "bump": {"position": -40, "size": 5}}, "bottom": {"doubleside": true, "offset": {"x": 10, "y": -20, "z": 0}, "length": [30, 30, 30], "width": [60, 50, 50, 50], "angle": [-27, -27, -27], "position": [0, 10, 30, 40], "texture": [1], "bump": {"position": -40, "size": 5}}, "topwinglets": {"doubleside": true, "offset": {"x": 80, "y": 87, "z": 45}, "length": [20], "width": [40, 30], "angle": [60], "position": [0, 50], "texture": [63], "bump": {"position": 10, "size": 10}}, "bottomwinglets": {"doubleside": true, "offset": {"x": 100, "y": 50, "z": -45}, "length": [20], "width": [40, 30], "angle": [-60], "position": [0, 50], "texture": [4], "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "FuryStar", "level": 5, "model": 4, "code": 504, "zoom": 1.08, "next":[605,606], "specs": {"shield": {"capacity": [200, 275], "reload": [6, 7]}, "generator": {"capacity": [100, 150], "reload": [27, 42]}, "ship": {"mass": 240, "speed": [75, 105], "rotation": [110, 160], "acceleration": [150, 175]}}, "shape": [1.59, 1.832, 1.891, 1.874, 1.458, 1.479, 1.524, 1.571, 1.645, 1.757, 1.925, 3.322, 3.427, 3.455, 3.48, 3.666, 3.822, 4.057, 4.521, 4.774, 5.039, 5.299, 1.577, 1.71, 1.679, 1.653, 1.679, 1.71, 1.577, 5.299, 5.039, 4.774, 4.521, 4.057, 3.822, 3.666, 3.48, 3.455, 3.428, 3.322, 1.925, 1.757, 1.645, 1.571, 1.524, 1.479, 1.458, 1.874, 1.891, 1.832], "lasers": [{"x": 1.05, "y": -1.05, "z": 0.3, "angle": 0, "damage": [1, 2], "rate": 4, "type": 1, "speed": [100, 125], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.05, "y": -1.05, "z": 0.3, "angle": 0, "damage": [1, 2], "rate": 4, "type": 1, "speed": [100, 125], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.45, "y": -1.8, "z": -0.45, "angle": 0, "damage": [14, 20], "rate": 2, "type": 1, "speed": [200, 250], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.45, "y": -1.8, "z": -0.45, "angle": 0, "damage": [14, 20], "rate": 2, "type": 1, "speed": [200, 250], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 5.299}}',
                            '{"name": "T-Warrior", "level": 5, "model": 5, "code":505, "next":[606,607],"size": 1.6, "specs": {"shield": {"capacity": [225, 325], "reload": [4, 7]}, "generator": {"capacity": [80, 140], "reload": [35, 50]}, "ship": {"mass": 280, "speed": [90, 110], "rotation": [50, 80], "acceleration": [90, 120]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-95, -100, -98, -70, 0, 90, 91], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 6, 20, 30, 20, 3], "height": [0, 2, 4, 20, 30, 25, 3], "texture": [12, 5, 63, 1, 10, 12]}, "cannon": {"section_segments": 6, "offset": {"x": 0, "y": -45, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-40, -50, -20, 0, 20, 30], "z": [0, 0, 0, 0, 0, 20]}, "width": [0, 5, 8, 11, 7, 0], "height": [0, 5, 8, 11, 10, 0], "angle": 0, "laser": {"damage": [7, 12], "rate": 5, "type": 1, "speed": [130, 160], "number": 5, "angle": 30, "error": 0}, "propeller": false, "texture": [3, 3, 10, 3]}, "back": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0], "y": [90, 95, 95], "z": [0, 0, 0]}, "width": [15, 18, 2], "height": [18, 23, 2], "texture": [63]}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-50, -40, -25, 0, 5], "z": [0, 0, 0, 0, 9, 9]}, "width": [0, 10, 15, 10, 0], "height": [0, 10, 15, 16, 0], "texture": [9]}, "top_propulsor": {"section_segments": 10, "offset": {"x": 0, "y": 30, "z": 60}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "height": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "texture": [4, 63, 1, 1, 1, 63, 1, 1, 12], "propeller": true}, "side_propulsors": {"section_segments": 10, "offset": {"x": 80, "y": 30, "z": -30}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "height": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "texture": [4, 63, 1, 1, 1, 63, 1, 1, 12], "propeller": true}}, "wings": {"top_join": {"offset": {"x": 0, "y": 50, "z": 0}, "length": [60], "width": [70, 30], "angle": [90], "position": [0, 0, 0, 50], "texture": [11], "bump": {"position": 10, "size": 20}}, "side_joins": {"offset": {"x": 0, "y": 50, "z": 0}, "length": [80], "width": [70, 30], "angle": [-20], "position": [0, 0, 0, 50], "texture": [11], "bump": {"position": 10, "size": 20}}}, "typespec": {"name": "T-Warrior", "level": 5, "model": 5, "code":505, "next":[606,607], "specs": {"shield": {"capacity": [225, 325], "reload": [4, 7]}, "generator": {"capacity": [80, 140], "reload": [35, 50]}, "ship": {"mass": 280, "speed": [85, 105], "rotation": [50, 80], "acceleration": [90, 120]}}, "shape": [3.204, 3.125, 2.591, 2.145, 1.713, 1.46, 1.282, 1.155, 1.073, 1.009, 0.977, 0.955, 0.957, 2.594, 3.217, 3.408, 3.55, 3.898, 4.204, 4.633, 5.051, 4.926, 2.67, 2.95, 4.171, 4.168, 4.171, 2.95, 2.67, 4.926, 5.051, 4.633, 4.204, 3.898, 3.55, 3.408, 3.217, 2.594, 0.96, 0.955, 0.977, 1.009, 1.073, 1.155, 1.282, 1.46, 1.713, 2.145, 2.591, 3.125], "lasers": [{"x": 0, "y": -3.04, "z": -0.48, "angle": 0, "damage": [7, 12], "rate": 5, "type": 1, "speed": [130, 160], "number": 5, "spread": 30, "error": 0, "recoil": 0}], "radius": 5.051}}',
                            '{"name": "Aetos", "level": 5, "model": 6, "code":506, "next":[607,608], "size": 1.5, "zoom": 0.96, "specs": {"shield": {"capacity": [200, 300], "reload": [5, 7]}, "generator": {"capacity": [80, 140], "reload": [35, 47]}, "ship": {"mass": 175, "speed": [90, 120], "rotation": [70, 90], "acceleration": [110, 130]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-100, -99, -98, -50, 0, 100, 80], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 6, 17, 28, 20, 0], "height": [0, 2, 4, 15, 25, 25, 0], "texture": [4, 6, 10, 10, 11, 12], "propeller": true, "laser": {"damage": [6, 11], "rate": 5, "type": 1, "speed": [140, 200], "number": 1, "angle": 0, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -60, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 0], "height": [0, 5, 10, 12, 0], "texture": [9]}, "lasers": {"section_segments": 8, "offset": {"x": 81, "y": -15, "z": -30}, "position": {"x": [0, 0, 0, 0, 0], "y": [25, 70, 10, 80, 90], "z": [0, 0, 0, 0, 0]}, "width": [5, 0, 0, 5, 0], "height": [5, 5, 0, 5, 0], "texture": [63, 63, 6], "angle": 2, "laser": {"damage": [6, 11], "rate": 5, "type": 1, "speed": [120, 180], "number": 1, "angle": 0, "error": 0}}}, "wings": {"top": {"doubleside": true, "offset": {"x": 15, "y": 40, "z": 0}, "length": [50], "width": [70, 30], "angle": [70], "position": [0, 30], "texture": [63], "bump": {"position": 10, "size": 10}}, "main": {"doubleside": true, "offset": {"x": 0, "y": 25, "z": 15}, "length": [90, 40], "width": [70, 50, 30], "angle": [-30, -40], "position": [30, 20, -20], "texture": [8, 63], "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "Aetos", "level": 5, "model": 6, "zoom": 0.96, "code":506, "next":[607,608], "specs": {"shield": {"capacity": [200, 300], "reload": [5, 7]}, "generator": {"capacity": [80, 140], "reload": [45, 55]}, "ship": {"mass": 250, "speed": [90, 110], "rotation": [70, 90], "acceleration": [110, 120]}}, "shape": [3, 2.917, 2.069, 1.61, 1.343, 1.158, 1.037, 0.95, 0.895, 0.853, 0.83, 0.824, 3.271, 3.283, 3.312, 3.232, 3.135, 3.283, 3.38, 3.09, 2.882, 2.75, 2.726, 3.059, 3.054, 3.006, 3.054, 3.059, 2.726, 2.75, 2.882, 3.09, 3.38, 3.283, 3.135, 3.232, 3.312, 3.283, 3.271, 0.824, 0.83, 0.853, 0.895, 0.95, 1.037, 1.158, 1.343, 1.61, 2.069, 2.917], "lasers": [{"x": 0, "y": -3, "z": 0, "angle": 0, "damage": [6, 11], "rate": 5, "type": 1, "speed": [140, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.44, "y": -0.15, "z": -0.9, "angle": 2, "damage": [6, 11], "rate": 5, "type": 1, "speed": [120, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.44, "y": -0.15, "z": -0.9, "angle": -2, "damage": [6, 11], "rate": 5, "type": 1, "speed": [120, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.38}}',
                            '{"name": "Shadow X-2", "level": 5, "model": 7, "code":507, "next":[608,609],"size": 1.3, "specs": {"shield": {"capacity": [150, 220], "reload": [5, 7]}, "generator": {"capacity": [80, 145], "reload": [20, 34]}, "ship": {"mass": 150, "speed": [110, 145], "rotation": [35, 55], "acceleration": [90, 130]}}, "bodies": {"main": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-100, -98, -95, -70, -40, 0, 40, 70, 80, 90, 100], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 20, 30, 20, 20, 30, 30, 30, 20, 0], "height": [0, 4, 4, 20, 20, 10, 10, 15, 15, 15, 10, 10], "texture": [12, 5, 63, 4, 4, 3, 4, 4, 5]}, "thrusters": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [90, 95, 100, 105, 90], "z": [0, 0, 0, 0, 0]}, "width": [10, 15, 18, 19, 2], "height": [3, 5, 7, 8, 2], "texture": [63], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -25, "z": 12}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-45, -40, -25, 0, 5], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 5, 0], "height": [0, 10, 15, 5, 0], "texture": [9]}, "laser": {"section_segments": 10, "offset": {"x": 50, "y": 10, "z": -13}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-30, -25, 0, 10, 20, 25, 30, 40, 70, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "texture": [6, 4, 10, 3, 4, 3, 2], "propeller": true, "laser": {"damage": [5, 7], "rate": 10, "type": 1, "speed": [160, 190], "number": 1}}}, "wings": {"top": {"doubleside": true, "offset": {"x": 10, "y": 60, "z": 5}, "length": [30], "width": [50, 30], "angle": [60], "position": [0, 50], "texture": [3], "bump": {"position": 10, "size": 10}}, "side": {"doubleside": true, "offset": {"x": 10, "y": 70, "z": 5}, "length": [30], "width": [40, 20], "angle": [-13], "position": [0, 60], "texture": [63], "bump": {"position": 10, "size": 10}}, "wings": {"offset": {"x": 0, "y": 35, "z": 0}, "length": [80], "width": [100, 70], "angle": [0], "position": [-80, 50], "texture": [4], "bump": {"position": 10, "size": 15}}}, "typespec": {"name": "Shadow X-2", "level": 5, "model": 7, "code":507, "next":[608,609], "specs": {"shield": {"capacity": [170, 240], "reload": [5, 7]}, "generator": {"capacity": [80, 145], "reload": [20, 34]}, "ship": {"mass": 200, "speed": [110, 145], "rotation": [35, 55], "acceleration": [90, 130]}}, "shape": [2.6, 2.53, 2.111, 1.751, 1.503, 1.341, 1.272, 1.223, 1.201, 1.404, 1.587, 1.596, 1.62, 1.674, 1.725, 1.848, 2.231, 2.565, 2.842, 3.253, 3.735, 2.463, 3.297, 3.78, 3.139, 2.735, 3.139, 3.78, 3.297, 2.463, 3.735, 3.253, 2.842, 2.565, 2.231, 1.848, 1.725, 1.674, 1.621, 1.596, 1.587, 1.404, 1.201, 1.223, 1.272, 1.341, 1.503, 1.751, 2.111, 2.53], "lasers": [{"x": 1.3, "y": -0.52, "z": -0.338, "angle": 0, "damage": [5, 7], "rate": 10, "type": 1, "speed": [160, 190], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.3, "y": -0.52, "z": -0.338, "angle": 0, "damage": [5, 7], "rate": 10, "type": 1, "speed": [160, 190], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.78}}',
                            '{"name": "Howler", "level": 5, "model": 8, "code":508, "next":[610,611],"size": 1.4, "zoom": 1, "specs": {"shield": {"capacity": [275, 340], "reload": [5, 7]}, "generator": {"capacity": [80, 110], "reload": [35, 53]}, "ship": {"mass": 300, "speed": [85, 100], "rotation": [70, 95], "acceleration": [90, 120]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-145, -135, -125, -130, -100, -55, 5, 60, 85, 120, 118], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 5, 8, 20, 30, 35, 35, 30, 22, 0], "height": [0, 5, 5, 8, 15, 20, 33, 30, 30, 22, 0], "texture": [17, 4, 13, 3, 2, 1, 10, 31, 12, 17], "propeller": true, "laser": {"damage": [3, 5], "rate": 6, "speed": [160, 210], "number": 2, "recoil": 0, "type": 1}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -80, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -16, 30, 60], "z": [-4, -4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 16, 12], "height": [0, 4, 16, 12], "texture": [2, 9, 31]}, "front1": {"section_segments": 8, "offset": {"x": 22, "y": -125, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, -5], "y": [-22.5, -12, -4.5, -7.5, 22.5, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 4.5, 4.5, 6, 12, 9], "height": [0, 4.5, 4.5, 6, 12, 9], "texture": [17, 4, 3], "laser": {"damage": [11, 20], "rate": 1, "speed": [150, 200], "number": 1, "recoil": 25, "type": 2}}, "front2": {"section_segments": 10, "offset": {"x": 32, "y": -95, "z": 0}, "position": {"x": [-4, -4, 0, -1], "y": [0, -12, 22.5, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7.5, 12, 9], "height": [0, 12, 18, 15], "texture": [13, 2, 63], "angle": 0}, "propulsors": {"section_segments": 8, "offset": {"x": 40, "y": 30, "z": -5}, "position": {"x": [-12, -12, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-90, -100, -60, 20, 50, 48], "z": [5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 3.6, 12, 24, 14.4, 0], "height": [0, 3.6, 15.6, 24, 14.4, 0], "texture": [4, 31, 10, 13, 17], "propeller": true}, "uwing": {"section_segments": [0, 60, 120, 180], "offset": {"x": -20, "y": -30, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-65, -70, 40, 80, 110], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 5, 25, 25, 0], "height": [0, 10, 25, 25, 20], "texture": [4]}}, "wings": {"main": {"doubleside": true, "offset": {"x": 20, "y": -20, "z": 5}, "length": [89, 0], "width": [130, 60], "angle": [-12, -12], "position": [0, 80, 80], "texture": 18, "bump": {"position": 20, "size": 5}}, "sides": {"doubleside": true, "offset": {"x": 20, "y": -20, "z": 10}, "length": [84, -3, 5, 12, -5], "width": [25, 25, 140, 140, 50, 50], "angle": [-12, 5, 5, 5, 5], "position": [40, 85, 55, 55, 70, 70], "texture": [63, 4, 63, 4, 17], "bump": {"position": 35, "size": 15}}}, "typespec": {"name": "Howler", "level": 5, "model": 8, "code":508, "next":[610,611], "specs": {"shield": {"capacity": [275, 340], "reload": [5, 7]}, "generator": {"capacity": [80, 110], "reload": [32, 50]}, "ship": {"mass": 320, "speed": [77, 102], "rotation": [70, 95], "acceleration": [80, 110]}}, "shape": [4.62, 4.176, 3.92, 3.153, 2.641, 2.233, 1.931, 1.892, 1.901, 1.948, 3.077, 3.059, 3.111, 3.216, 3.358, 3.503, 3.728, 3.918, 4.079, 4.141, 2.709, 2.652, 2.475, 2.867, 2.85, 2.805, 2.85, 2.867, 2.475, 2.652, 2.709, 4.141, 4.079, 3.918, 3.728, 3.503, 3.358, 3.216, 3.111, 3.059, 3.077, 1.948, 1.901, 1.892, 1.931, 2.233, 2.641, 3.153, 3.92, 4.176], "lasers": [{"x": 0, "y": -4.62, "z": 0, "angle": 0, "damage": [2, 4], "rate": 6, "type": 1, "speed": [160, 210], "number": 2, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.616, "y": -4.13, "z": 0, "angle": 0, "damage": [11, 16], "rate": 1, "type": 2, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 25}, {"x": -0.616, "y": -4.13, "z": 0, "angle": 0, "damage": [11, 16], "rate": 1, "type": 2, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 25}], "radius": 4.62}}',
                            '{"name":"Bat-Defender","level":5,"model":9,"code":509, "next":[611,612],"size":1.8,"specs":{"shield":{"capacity":[300,400],"reload":[7,10]},"generator":{"capacity":[70,100],"reload":[25,35]},"ship":{"mass":400,"speed":[70,90],"rotation":[40,70],"acceleration":[80,90]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-99,-100,-97,-45,-40,-25,-23,15,20,55,50],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,30,17,27,25,25,27,15,5],"height":[0,2,2,25,27,27,25,25,27,20,0],"texture":[6,5,1,4,6,4,63,6,2,12]},"propulsors":{"section_segments":8,"offset":{"x":30,"y":-20,"z":0},"position":{"x":[-5,-2,0,0,0,0,0,0,0,0,0],"y":[30,55,60,80,95,100,90,95],"z":[0,0,0,0,0,0,0,0]},"width":[12,14,14,10,12,10,0],"height":[5,14,14,10,12,10,0],"texture":[2,6,4,11,6,12],"propeller":true},"lasers":{"section_segments":8,"offset":{"x":70,"y":-40,"z":10},"position":{"x":[0,0,0,0,0],"y":[25,90,10,50,60],"z":[0,0,0,0,0]},"width":[5,5,0,10,5],"height":[5,1,0,0,5],"texture":[63,6],"angle":3,"laser":{"damage":[10,15],"rate":2.5,"type":1,"speed":[150,200],"number":1,"error":0},"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-40,-25,0,5],"z":[-10,-5,0,0,0]},"width":[0,5,10,10,0],"height":[0,10,15,16,0],"texture":[9]}},"wings":{"wings":{"offset":{"x":20,"y":0,"z":0},"length":[35,15,20,15],"width":[100,50,50,40,45],"angle":[-10,20,0,0],"position":[0,0,10,30,0],"texture":[11,4],"bump":{"position":-20,"size":15}},"side":{"doubleside":true,"offset":{"x":105,"y":30,"z":-30},"length":[30,10,30],"width":[40,60,60,40],"angle":[90,110,110,90],"position":[0,-30,-30,0],"texture":[63],"bump":{"position":0,"size":15}}},"typespec":{"name":"Bat-Defender","level":5,"model":9,"code":509, "next":[611,612],"specs":{"shield":{"capacity":[350,450],"reload":[9,12]},"generator":{"capacity":[70,120],"reload":[30,45]},"ship":{"mass":380,"speed":[65,80],"rotation":[55,75],"acceleration":[80,105]}},"shape":[3.604,3.424,2.813,2.415,2.149,1.968,1.913,1.973,2.073,2.759,3.932,3.974,4.081,4.084,4.04,4.116,4.187,3.661,2.16,2.365,2.719,3.22,3.183,3.028,2.016,1.984,2.016,3.028,3.183,3.22,2.719,2.365,2.16,3.661,4.187,4.116,4.04,4.081,4.084,3.974,3.932,2.759,2.073,1.973,1.913,1.968,2.149,2.415,2.813,3.424],"lasers":[{"x":2.539,"y":-1.08,"z":0.36,"angle":3,"damage":[15,20],"rate":2.5,"type":1,"speed":[175,225],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.539,"y":-1.08,"z":0.36,"angle":-3,"damage":[15,20],"rate":2.5,"type":1,"speed":[175,225],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.187}}',
                        ]
                    }
                ]
            },
            {
                TIER: 6,
                SHIPS: [
                    {
                        ORIGIN: "Vanilla Revamp",
                        CODES: [
                            '{"name": "Scorpion", "level": 6, "model": 1,"code":601, "next":[701,702],"size": 2, "specs": {"shield": {"capacity": [225, 400], "reload": [5, 7]}, "generator": {"capacity": [80, 175], "reload": [38, 50]}, "ship": {"mass": 450, "speed": [75, 90], "rotation": [50, 70], "acceleration": [80, 100]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-90, -40, -30, 0, 50, 100, 120, 110], "z": [-10, -5, 0, 0, 0, 0, 20, 20]}, "width": [0, 12, 20, 15, 25, 10, 5], "height": [0, 10, 15, 25, 15, 10, 5], "texture": [1, 4, 63, 11, 11, 4], "propeller": false}, "tail": {"section_segments": 14, "offset": {"x": 0, "y": 70, "z": 50}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-70, -25, -10, 20, 40, 50], "z": [0, 0, 0, 0, -10, -20]}, "width": [0, 5, 35, 25, 5, 5], "height": [0, 5, 25, 20, 5, 5], "texture": [6, 4, 63, 10, 4], "laser": {"damage": [50, 100], "rate": 0.9, "type": 2, "speed": [170, 230], "number": 1, "angle": 0, "error": 0, "recoil": 100}}, "cockpit": {"section_segments": 8, "offset": {"x": 13, "y": -44, "z": 12}, "position": {"x": [-5, 0, 0, 0, 0], "y": [-15, -5, 0, 5, 15], "z": [0, 0, 0, 1, 0]}, "width": [0, 8, 10, 8, 0], "height": [0, 5, 5, 5, 0], "texture": [6, 5], "propeller": false}, "deco": {"section_segments": 8, "offset": {"x": 70, "y": 0, "z": -10}, "position": {"x": [0, 0, 0, 10, -5, 0, 0, 0], "y": [-115, -80, -100, -60, -30, -10, 20, 0], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [1, 5, 10, 15, 15, 20, 10, 0], "height": [1, 5, 15, 20, 35, 30, 10, 0], "texture": [6, 6, 1, 1, 11, 2, 12], "laser": {"damage": [2, 3], "rate": 1.8, "type": 1, "speed": [130, 170], "number": 2, "angle": 5, "error": 0}, "propeller": true}, "wingends": {"section_segments": 8, "offset": {"x": 105, "y": -80, "z": -10}, "position": {"x": [0, 2, 4, 2, 0], "y": [-20, -10, 0, 10, 20], "z": [0, 0, 0, 0, 0]}, "width": [2, 3, 6, 3, 2], "height": [5, 15, 22, 17, 5], "texture": 4, "angle": 0, "propeller": false}}, "wings": {"main": {"length": [80, 30], "width": [40, 30, 20], "angle": [-10, 20], "position": [30, -50, -80], "texture": 63, "bump": {"position": 30, "size": 10}, "offset": {"x": 0, "y": 0, "z": 0}}, "font": {"length": [80, 30], "width": [20, 15], "angle": [-10, 20], "position": [-20, -40], "texture": 4, "bump": {"position": 30, "size": 10}, "offset": {"x": 0, "y": 0, "z": 0}}}, "typespec": {"name": "Scorpion", "level": 6, "model": 1, "code": 601,"next":[701, 702], "specs": {"shield": {"capacity": [225, 400], "reload": [5, 7]}, "generator": {"capacity": [80, 175], "reload": [38, 50]}, "ship": {"mass": 450, "speed": [75, 90], "rotation": [50, 70], "acceleration": [80, 100]}}, "shape": [3.6, 2.846, 2.313, 2.192, 5.406, 5.318, 5.843, 5.858, 5.621, 4.134, 3.477, 3.601, 3.622, 3.464, 3.351, 3.217, 1.458, 1.391, 1.368, 1.37, 1.635, 2.973, 3.47, 3.911, 4.481, 4.804, 4.481, 3.911, 3.47, 2.973, 1.635, 1.37, 1.368, 1.391, 1.458, 3.217, 3.351, 3.464, 3.622, 3.601, 3.477, 4.134, 5.621, 5.858, 5.843, 5.318, 5.406, 2.192, 2.313, 2.846], "lasers": [{"x": 0, "y": 0, "z": 2, "angle": 0, "damage": [50, 100], "rate": 0.9, "type": 2, "speed": [180, 230], "number": 1, "spread": 0, "error": 0, "recoil": 100}, {"x": 2.8, "y": -4.6, "z": -0.4, "angle": 0, "damage": [2, 3], "rate": 1.8, "type": 1, "speed": [130, 170], "number": 2, "spread": 5, "error": 0, "recoil": 0}, {"x": -2.8, "y": -4.6, "z": -0.4, "angle": 0, "damage": [2, 3], "rate": 1.8, "type": 1, "speed": [130, 170], "number": 2, "spread": 5, "error": 0, "recoil": 0}], "radius": 5.858}}',
                            '{"name": "Xenolith", "level": 6, "model": 2,"code":602, "next":[702,703], "size": 1.7, "specs": {"shield": {"capacity": [230, 320], "reload": [5, 8]}, "generator": {"capacity": [110, 180], "reload": [38, 55]}, "ship": {"mass": 300, "speed": [80, 110], "rotation": [50, 70], "acceleration": [85, 100]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": -20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-86, -90, -50, 0, 30, 70, 120, 110], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 25, 25, 30, 30, 25, 0], "height": [0, 10, 20, 20, 30, 30, 10, 0], "texture": [12, 2, 10, 11, 3, 8, 17], "propeller": true, "laser": {"damage": [28, 35], "speed": [110, 165], "rate": 4, "type": 1, "number": 1, "angle": 0, "recoil": 100}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -40, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -30, 10, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [7, 15, 17, 17, 0], "height": [5, 15, 15, 12, 0], "texture": [9, 9, 4], "propeller": false}, "propeller": {"section_segments": 12, "offset": {"x": 75, "y": 50, "z": -45}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-38, -35, -20, 0, 10, 40, 35], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 13, 0], "height": [0, 10, 13, 13, 13, 13, 0], "texture": [13, 3, 4, 18, 63, 13], "propeller": true}, "Side": {"section_segments": 9, "offset": {"x": 25, "y": 30, "z": -12}, "position": {"x": [-5, -5, -2, 0, -4, -4], "y": [-90, -100, -60, 20, 50, 58], "z": [5, 5, 5, 0, 0, 0, 0, 0]}, "width": [0, 8, 12, 24, 14, 0], "height": [0, 4, 15.6, 24, 14, 0], "texture": [4, 4, 63, 4, 3]}, "cannon": {"section_segments": 12, "offset": {"x": 0, "y": 50, "z": 45}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-40, -48, -45, -20, 0, 20, 40, 35], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 10, 15, 15, 15, 10, 0], "height": [0, 6, 10, 13, 13, 13, 13, 0], "angle": 0, "laser": {"damage": [10, 25], "speed": [100, 150], "rate": 4, "type": 1, "number": 1, "angle": 0, "error": 0}, "propeller": true, "texture": [6, 2, 3, 4, 12, 63, 13]}}, "wings": {"main": {"offset": {"x": 0, "y": 20, "z": 0}, "length": [80, 0, 20], "width": [70, 50, 60, 50], "texture": [11, 63, 63], "angle": [-20, -40, -40], "position": [10, 40, 40, 40], "doubleside": 1, "bump": {"position": -10, "size": 15}}, "main2": {"offset": {"x": 0, "y": 20, "z": 0}, "length": [80, 0, 20], "width": [70, 50, 60, 50], "texture": [11, 63, 63], "angle": [-40, -20, -20], "position": [10, 40, 40, 40], "doubleside": 1, "bump": {"position": -10, "size": 15}}, "main3": {"offset": {"x": 15, "y": 20, "z": 0}, "length": [40, 0, 20], "width": [70, 50, 60, 50], "texture": [11, 63, 63], "angle": [90, 100, 100], "position": [10, 40, 40, 40], "doubleside": 1, "bump": {"position": -30, "size": 15}}, "main4": {"doubleside": true, "offset": {"x": 10, "y": -5, "z": -10}, "length": [0, 35, 20, 0], "width": [0, 160, 70, 30, 30], "angle": [-40, -30, -20, -20], "position": [30, -20, 30, 60, 60], "texture": [13, 63, 13, 8], "bump": {"position": 35, "size": 10}}, "front": {"doubleside": true, "offset": {"x": -5, "y": -90, "z": 5}, "length": [20, 15, 0, 20], "width": [40, 40, 90, 100, 30], "angle": [-30, -30, -30, -30], "position": [30, 30, 10, 5, 30], "texture": [13, 2, 13, 4], "bump": {"position": 35, "size": 7}}, "winglets": {"offset": {"x": 74, "y": 58, "z": -8}, "length": [25, 15, 15, 25], "width": [25, 100, 105, 100, 25], "angle": [-60, -70, -110, -120], "position": [0, 0, 0, 0, 0], "texture": [63, 4, 4, 63], "doubleside": true, "bump": {"position": 0, "size": 5}}}, "typespec": {"name": "Xenolith", "level": 6, "model": 2, "code": 602,"next":[702, 703], "specs": {"shield": {"capacity": [230, 320], "reload": [5, 8]}, "generator": {"capacity": [110, 180], "reload": [38, 55]}, "ship": {"mass": 300, "speed": [80, 115], "rotation": [50, 75], "acceleration": [85, 115]}}, "shape": [3.747, 4.67, 4.632, 3.735, 3.18, 2.697, 2.268, 1.599, 1.484, 1.43, 1.411, 1.44, 1.492, 3.157, 3.276, 3.453, 3.726, 4.007, 4.37, 4.881, 4.867, 3.286, 3.013, 3.505, 3.461, 3.407, 3.461, 3.505, 3.013, 3.286, 4.867, 4.881, 4.37, 4.007, 3.726, 3.453, 3.276, 3.157, 1.498, 1.44, 1.411, 1.43, 1.484, 1.599, 2.268, 2.697, 3.18, 3.735, 4.632, 4.67], "lasers": [{"x": 0, "y": -3.74, "z": 0, "angle": 0, "damage": [28, 35], "rate": 4, "type": 1, "speed": [110, 165], "number": 1, "spread": 0, "error": 0, "recoil": 100}, {"x": 0, "y": 0.068, "z": 1.53, "angle": 0, "damage": [10, 25], "rate": 4, "type": 1, "speed": [100, 150], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 4.881}}',
                            '{"name":"Advanced-Fighter","level":6,"model":3,"code":603, "next":[703,704],"size":2,"specs":{"shield":{"capacity":[200,350],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":400,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-100,-80,-90,-50,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,15,25,40,25,20,0],"height":[0,5,10,30,25,20,10,0],"propeller":true,"texture":[4,4,1,1,10,1,1],"laser":{"damage":[90,150],"rate":1,"type":2,"speed":[180,240],"number":1,"recoil":150,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-35,"z":33},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,10,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,12,15,10,0],"height":[0,12,18,12,0],"propeller":false,"texture":[7,9,9,7]},"side_propellers":{"section_segments":10,"offset":{"x":30,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-50,-20,0,20,80,70],"z":[0,0,0,0,0,0]},"width":[15,20,10,25,10,0],"height":[10,15,15,10,5,0],"angle":0,"propeller":true,"texture":[3,63,4,10,3]},"cannons":{"section_segments":12,"offset":{"x":70,"y":50,"z":-30},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"propeller":false,"texture":[4,4,10,4,63,4],"laser":{"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":95,"y":50,"z":-40},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[2,5,5,2],"height":[2,15,15,2],"angle":0,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}}},"wings":{"main":{"length":[100,30,20],"width":[100,50,40,30],"angle":[-25,20,25],"position":[30,70,50,50],"bump":{"position":-20,"size":20},"offset":{"x":0,"y":0,"z":0},"texture":[11,11,63],"doubleside":true},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-50,-70,-65],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Advanced-Fighter","level":6,"model":3,"code":603,"next":[703, 704], "specs":{"shield":{"capacity":[200,350],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":400,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"shape":[4,3.65,3.454,3.504,3.567,2.938,1.831,1.707,1.659,1.943,1.92,1.882,1.896,3.96,5.654,5.891,6.064,5.681,5.436,5.573,5.122,4.855,4.675,4.626,4.479,4.008,4.479,4.626,4.675,4.855,5.122,5.573,5.436,5.681,6.064,5.891,5.654,3.96,3.88,1.882,1.92,1.943,1.659,1.707,1.831,2.938,3.567,3.504,3.454,3.65],"lasers":[{"x":0,"y":-4,"z":0.4,"angle":0,"damage":[90,150],"rate":1,"type":2,"speed":[190,260],"number":1,"spread":0,"error":0,"recoil":150},{"x":2.8,"y":0,"z":-1.2,"angle":0,"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.8,"y":0,"z":-1.2,"angle":0,"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.8,"y":0,"z":-1.6,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.8,"y":0,"z":-1.6,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.064}}',
                            '{"name": "Condor", "level": 6, "model": 4, "code":604, "next":[703,704],"size": 1.5, "zoom": 0.96, "specs": {"shield": {"capacity": [225, 400], "reload": [7, 10]}, "generator": {"capacity": [70, 130], "reload": [30, 48]}, "ship": {"mass": 200, "speed": [95, 120], "rotation": [50, 70], "acceleration": [80, 120]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-110, -95, -100, -100, -45, -40, -25, -23, 15, 20, 55, 80, 100, 90], "z": [-10, -9, -8, -7, -6, -4, -2, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 2, 5, 10, 25, 27, 27, 25, 25, 27, 40, 35, 30, 0], "height": [0, 2, 5, 10, 25, 27, 27, 25, 25, 27, 20, 15, 10, 0], "texture": [6, 2, 3, 10, 5, 63, 5, 2, 5, 3, 63, 11, 4], "propeller": true, "laser": {"damage": [30, 60], "rate": 2, "type": 2, "speed": [150, 200], "number": 1, "angle": 0, "error": 0}}, "cannons": {"section_segments": 12, "offset": {"x": 75, "y": 30, "z": -25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -45, -20, 0, 20, 50, 55], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 10, 0], "height": [0, 5, 15, 15, 10, 5, 0], "angle": 0, "laser": {"damage": [3, 6], "rate": 4, "type": 1, "speed": [100, 130], "number": 1, "angle": 0, "error": 0}, "propeller": false, "texture": [6, 4, 10, 4, 63, 4]}, "cockpit": {"section_segments": 12, "offset": {"x": 0, "y": -60, "z": 8}, "position": {"x": [0, 0, 0, 0], "y": [-25, -8, 20, 65], "z": [0, 0, 0, 0]}, "width": [0, 10, 10, 0], "height": [0, 12, 15, 5], "texture": [9]}}, "wings": {"back": {"offset": {"x": 0, "y": 25, "z": 10}, "length": [90, 40], "width": [70, 50, 30], "angle": [-30, 40], "position": [0, 20, 0], "texture": [11, 63], "doubleside": true, "bump": {"position": 10, "size": 20}}, "front": {"offset": {"x": 0, "y": 55, "z": 10}, "length": [90, 40], "width": [70, 50, 30], "angle": [-30, -40], "position": [-60, -20, -20], "texture": [11, 63], "doubleside": true, "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "Condor", "level": 6, "model": 4, "code":604, "next":[703,704], "zoom": 0.96, "specs": {"shield": {"capacity": [225, 400], "reload": [7, 10]}, "generator": {"capacity": [70, 130], "reload": [30, 48]}, "ship": {"mass": 260, "speed": [95, 110], "rotation": [50, 80], "acceleration": [80, 110]}}, "shape": [3.3, 3.015, 2.45, 1.959, 1.658, 1.477, 1.268, 1.11, 1.148, 1.237, 2.34, 2.448, 2.489, 3.283, 3.363, 3.501, 3.586, 3.333, 3.496, 3.502, 3.154, 2.52, 3.016, 3.132, 3.054, 3.006, 3.054, 3.132, 3.016, 2.52, 3.154, 3.502, 3.496, 3.333, 3.586, 3.501, 3.363, 3.283, 2.49, 2.448, 2.34, 1.237, 1.148, 1.11, 1.268, 1.477, 1.658, 1.959, 2.45, 3.015], "lasers": [{"x": 0, "y": -3.3, "z": 0, "angle": 0, "damage": [30, 60], "rate": 2, "type": 2, "speed": [165,225], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.25, "y": -0.6, "z": -0.75, "angle": 0, "damage": [3, 6], "rate": 4, "type": 1, "speed": [100, 130], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.25, "y": -0.6, "z": -0.75, "angle": 0, "damage": [3, 6], "rate": 4, "type": 1, "speed": [100, 130], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.586}}',
                            '{"name": "A-Speedster", "level": 6, "model": 5, "code":605, "next":[704,705], "size": 1.6, "specs": {"shield": {"capacity": [200, 300], "reload": [6, 8]}, "generator": {"capacity": [80, 140], "reload": [30, 45]}, "ship": {"mass": 230, "speed": [90, 130], "rotation": [60, 85], "acceleration": [90, 140]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-100, -95, 0, 0, 70, 65], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 40, 20, 20, 0], "height": [0, 5, 30, 30, 15, 0], "texture": [6, 11, 5, 63, 12], "propeller": true, "laser": {"damage": [38, 84], "rate": 1, "type": 2, "speed": [175, 230], "recoil": 50, "number": 1, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -60, "z": 15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-20, 0, 20, 40, 50], "z": [-7, -5, 0, 0, 0]}, "width": [0, 10, 10, 10, 0], "height": [0, 10, 15, 12, 0], "texture": [9]}, "side_propulsors": {"section_segments": 10, "offset": {"x": 50, "y": 25, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "height": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "propeller": true, "texture": [4, 4, 2, 2, 5, 63, 5, 4, 12]}, "cannons": {"section_segments": 12, "offset": {"x": 30, "y": 40, "z": 45}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -45, -20, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 7, 10, 3, 5, 0], "height": [0, 5, 7, 8, 3, 5, 0], "angle": -10, "laser": {"damage": [8, 12], "rate": 2, "type": 1, "speed": [100, 130], "number": 1, "angle": -10, "error": 0}, "propeller": false, "texture": [6, 4, 10, 4, 63, 4]}}, "wings": {"join": {"offset": {"x": 0, "y": 0, "z": 10}, "length": [40, 0], "width": [10, 20], "angle": [-1], "position": [0, 30], "texture": [63], "bump": {"position": 0, "size": 25}}, "winglets": {"offset": {"x": 0, "y": -40, "z": 10}, "doubleside": true, "length": [45, 10], "width": [5, 20, 30], "angle": [50, -10], "position": [90, 80, 50], "texture": [4], "bump": {"position": 10, "size": 30}}}, "typespec": {"name": "A-Speedster", "level": 6, "model": 5, "code": 605,"next":[704, 705], "specs": {"shield": {"capacity": [200, 300], "reload": [6, 8]}, "generator": {"capacity": [80, 140], "reload": [30, 45]}, "ship": {"mass": 235, "speed": [90, 120], "rotation": [60, 90], "acceleration": [90, 135]}}, "shape": [3.2, 3.109, 2.569, 2.082, 1.786, 1.589, 1.439, 1.348, 1.278, 1.24, 1.222, 1.338, 1.372, 1.801, 2.197, 2.375, 2.52, 2.637, 3.021, 3.288, 3.665, 3.862, 3.713, 2.645, 2.28, 2.244, 2.28, 2.645, 3.713, 3.862, 3.665, 3.288, 3.021, 2.637, 2.52, 2.375, 2.197, 1.801, 1.372, 1.338, 1.222, 1.24, 1.278, 1.348, 1.439, 1.589, 1.786, 2.082, 2.569, 3.109], "lasers": [{"x": 0, "y": -3.2, "z": 0, "angle": 0, "damage": [38, 84], "rate": 1, "type": 2, "speed": [175, 230], "number": 1, "spread": 0, "error": 0, "recoil": 50}, {"x": 1.238, "y": -0.296, "z": 1.44, "angle": -10, "damage": [8, 12], "rate": 2, "type": 1, "speed": [100, 130], "number": 1, "spread": -10, "error": 0, "recoil": 0}, {"x": -1.238, "y": -0.296, "z": 1.44, "angle": 10, "damage": [8, 12], "rate": 2, "type": 1, "speed": [100, 130], "number": 1, "spread": -10, "error": 0, "recoil": 0}], "radius": 3.862}}',
                            '{"name": "T-Fighter", "level": 6, "model": 6, "code":606, "next":[705,706], "size": 2.25, "zoom": 0.96, "specs": {"shield": {"capacity": [220, 350], "reload": [6, 8]}, "generator": {"capacity": [120, 170], "reload": [35, 60]}, "ship": {"mass": 325, "speed": [85, 105], "rotation": [50, 70], "acceleration": [80, 110]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-95, -65, -47, -20, 15, 17, 29, 50, 60, 75, 72], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 11, 15, 20, 25, 25, 25, 22, 20, 15, 0], "height": [0, 6, 8, 12, 20, 20, 20, 20, 18, 15, 0], "propeller": true, "texture": [2, 63, 63, 11, 5, 3, 63, 4, 13, 17]}, "cockpit": {"section_segments": 7, "offset": {"x": 0, "y": -59, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-15, 0, 16, 35, 50], "z": [-7, -6, -7, -1, -1]}, "width": [0, 5, 10, 8, 5], "height": [0, 6, 11, 6, 5], "propeller": false, "texture": [7, 9, 9, 4, 4]}, "cannon_wing_top": {"section_segments": 8, "offset": {"x": 0, "y": 60, "z": 40}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-25, -30, -10, 10, 20, 15], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 3, 4.8, 6.6, 4.2, 0], "height": [0, 2.5, 4, 5.5, 5, 0], "angle": 0, "laser": {"damage": [5, 10], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "error": 0, "angle": 0}, "propeller": 0, "texture": [6, 4, 10, 13, 17]}, "side_thruster": {"section_segments": 8, "offset": {"x": 19, "y": 57, "z": -10}, "position": {"x": [1, 1, 1, 0, 0, 0], "y": [-45, -30, -10, 10, 20, 15], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 3.25, 5.2, 7.15, 4.55, 0], "height": [0, 2.5, 4, 5.5, 5, 0], "angle": 0, "propeller": true, "texture": [4, 4, 10, 13, 17]}, "cannon_side": {"section_segments": 8, "offset": {"x": 10, "y": -43, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, -2], "y": [-35, -40, -20, 10, 25, 40], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 3.2, 5.6, 8, 4.8, 0], "height": [0, 2.4, 4.2, 6, 4.2, 0], "angle": 0, "laser": {"damage": [10, 15], "rate": 4, "type": 1, "speed": [100, 155], "number": 5, "error": 0, "angle": 25}, "propeller": false, "texture": [4, 4, 11, 4]}, "cannon_wings": {"section_segments": 8, "offset": {"x": 56, "y": 50, "z": -3}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-66.5, -59.5, -56, -60.2, -52.5, -47.6, -44.8, -44.8, -31.5, -10.5, 7, 17.5, 14.7], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 1.35, 0, 2.7, 4.5, 5.4, 6.93, 6.93, 7.65, 8.55, 6.75, 4.5, 0], "height": [0, 1.35, 0, 2.7, 4.5, 5.4, 6.93, 6.93, 7.65, 8.55, 6.75, 4.5, 0], "texture": [63, 63, 13, 4, 4, 63, 8, 10, 8, 4, 13, 17], "angle": 0, "laser": {"damage": [6, 7], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "angle": 3.5, "error": 0}, "propeller": 0}, "cannon_pulse_fix": {"section_segments": 0, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0], "y": [0], "z": [0]}, "width": [0], "height": [0], "texture": [0], "angle": 0, "laser": {"damage": [100, 150], "rate": 10, "type": 1, "speed": [1, 1], "number": 100, "error": 0, "angle": 0}, "propeller": false}}, "wings": {"main": {"length": [60, 15, 5], "width": [80, 30, 20, 20], "angle": [0, 40, 0], "position": [10, 24, 3, -10], "doubleside": true, "texture": [11, 63, 4], "offset": {"x": 1, "y": 13, "z": -5.31}, "bump": {"position": 10, "size": 10}}, "winglets": {"length": [19, 3], "width": [30, 30, 59], "angle": [0, 50, 0], "position": [-20, 23, 50], "doubleside": true, "texture": [3], "offset": {"x": 1, "y": -58, "z": 0}, "bump": {"position": 30, "size": 15}}, "winglets_cannon_top_2": {"length": [13, 3], "width": [15, 15, 20], "angle": [30, 30, 0], "position": [-12, 0, -2], "doubleside": true, "texture": [4, 13], "offset": {"x": 1, "y": 65, "z": 40}, "bump": {"position": 10, "size": 10}}, "top": {"doubleside": true, "offset": {"x": 0, "y": 44, "z": 20}, "length": [0, 20], "width": [0, 50, 20], "angle": [0, 90], "position": [0, 0, 20], "texture": [63], "bump": {"position": 0, "size": 10}}}, "typespec": {"name": "T-Fighter", "level": 6, "model": 6, "code": 606,"next":[705, 706], "zoom": 0.96, "specs": {"shield": {"capacity": [220, 350], "reload": [6, 8]}, "generator": {"capacity": [120, 170], "reload": [35, 60]}, "ship": {"mass": 310, "speed": [85, 105], "rotation": [50, 70], "acceleration": [80, 110]}}, "shape": [4.275, 3.782, 3.409, 2.591, 2.202, 1.865, 1.634, 1.434, 1.279, 1.172, 2.627, 2.691, 3.501, 3.514, 3.536, 3.488, 3.469, 3.55, 3.852, 4.079, 3.941, 3.014, 3.521, 3.623, 3.527, 3.605, 3.527, 3.623, 3.521, 3.014, 3.941, 4.079, 3.852, 3.55, 3.469, 3.488, 3.536, 3.514, 3.501, 2.691, 2.627, 1.172, 1.279, 1.434, 1.634, 1.865, 2.202, 2.591, 3.409, 3.782], "lasers": [{"x": 0, "y": 1.35, "z": 1.8, "angle": 0, "damage": [5, 10], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.45, "y": -3.735, "z": -0.45, "angle": 0, "damage": [10, 15], "rate": 4, "type": 1, "speed": [100, 155], "number": 5, "spread": 25, "error": 0, "recoil": 0}, {"x": -0.45, "y": -3.735, "z": -0.45, "angle": 0, "damage": [10, 15], "rate": 4, "type": 1, "speed": [100, 155], "number": 5, "spread": 25, "error": 0, "recoil": 0}, {"x": 2.52, "y": -0.743, "z": -0.135, "angle": 0, "damage": [6, 7], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "spread": 3.5, "error": 0, "recoil": 0}, {"x": -2.52, "y": -0.743, "z": -0.135, "angle": 0, "damage": [6, 7], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "spread": 3.5, "error": 0, "recoil": 0}, {"x": 0, "y": 0, "z": 0, "angle": 0, "damage": [100, 150], "rate": 10, "type": 1, "speed": [1, 1], "number": 100, "spread": 0, "error": 0, "recoil": 0}], "radius": 4.275}}',
                            '{"name":"H-Mercury","level":6,"model":7,"code":607, "next":[706,707], "size":1.85, "zoom": 0.96,"specs":{"shield":{"capacity":[250,320],"reload":[6,8]},"generator":{"capacity":[100,150],"reload":[45,61]},"ship":{"mass":500,"speed":[75,95],"rotation":[50,60],"acceleration":[65,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-70,-60,-40,0,50,110,100],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,20,30,25,10,0],"height":[1,5,10,15,25,20,10,0],"texture":[6,4,4,63,11,63,12],"propeller":true,"laser":{"damage":[5,9],"rate":8,"type":1,"speed":[100,150],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":35},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,15,25],"z":[0,0,0,0,0]},"width":[0,10,12,10,5],"height":[0,10,13,12,5],"texture":[9,9,4,4],"propeller":false},"arms":{"section_segments":8,"offset":{"x":60,"y":-10,"z":-10},"position":{"x":[0,0,0,5,10,0,0,-10],"y":[-85,-70,-80,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,6,15,15,15,10,0],"height":[1,5,6,20,30,25,10,0],"texture":[6,4,4,4,4,4,12],"angle":1,"propeller":true,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,200],"number":1,"error":0}},"canon":{"section_segments":12,"offset":{"x":100,"y":17,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,7,3,5,0],"height":[0,5,15,15,3,5,0],"angle":3,"laser":{"damage":[5,11],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0},"propeller":false,"texture":[6,4,10,4,4,4]}},"wings":{"main":{"offset":{"x":0,"y":-25,"z":20},"length":[60,40],"width":[60,30,20],"angle":[-20,10],"position":[30,50,30],"texture":[11,11],"bump":{"position":30,"size":10}},"font":{"length":[60],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":-10,"z":0}},"font2":{"offset":{"x":0,"y":30,"z":8},"length":[60],"width":[20,15],"angle":[-10,20],"position":[20,40],"texture":[63],"bump":{"position":30,"size":10}}},"typespec":{"name":"H-Mercury", "level":6,"model":7,"code":607,"next":[706, 707], "zoom": 0.96, "specs":{"shield":{"capacity":[250,330],"reload":[6,8]},"generator":{"capacity":[170,220],"reload":[60,78]},"ship":{"mass":350,"speed":[71,95],"rotation":[51,75],"acceleration":[81,105]}},"shape":[3.206,3.202,2.648,2.29,4.484,4.459,4.216,3.914,3.713,3.585,4.258,4.248,4.244,4.307,4.355,4.529,4.673,4.676,3.99,4.494,4.598,4.267,3.073,3.218,4.02,4.008,4.02,3.218,3.073,4.267,4.598,4.494,3.99,4.676,4.673,4.529,4.355,4.307,4.244,4.248,4.258,3.585,3.713,3.914,4.216,4.459,4.484,2.29,2.648,3.202],"lasers":[{"x":0,"y":-3.2,"z":0.8,"angle":0,"damage":[14,20],"rate":2,"type":1,"speed":[175,205],"number":1,"spread":0,"error":0,"recoil":120},{"x":2.341,"y":-3.799,"z":-0.4,"angle":1,"damage":[12,18],"rate":2,"type":1,"speed":[155,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.341,"y":-3.799,"z":-0.4,"angle":-1,"damage":[12,18],"rate":2,"type":1,"speed":[155,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.895,"y":-1.317,"z":0.2,"angle":3,"damage":[3,6],"rate":6,"type":1,"speed":[175, 205],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.895,"y":-1.317,"z":0.2,"angle":-3,"damage":[3,6],"rate":6,"type":1,"speed":[175,205],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.676}}',
                            '{"name": "Typhoon", "level": 6, "model": 8, "code":608, "next":[707,708], "size": 1.85, "specs": {"shield": {"capacity": [215, 335], "reload": [4, 7]}, "generator": {"capacity": [175, 250], "reload": [45, 70]}, "ship": {"mass": 375, "speed": [70, 95], "rotation": [35, 58], "acceleration": [85, 100]}}, "bodies": {"body": {"section_segments": 8, "offset": {"x": 0, "y": -12.5, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-110, -105, -90, -40, -20, 0, 20, 78, 120, 137, 130], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 16, 25, 25, 32, 35, 35, 25, 20, 0], "height": [0, 17, 26, 35, 35, 35, 35, 35, 24, 20, 0], "texture": [4, 63, 10, 63, 63, 3, 10, 63, 3, 17], "propeller": true}, "sidethrusters": {"section_segments": 8, "offset": {"x": 30, "y": 27.5, "z": 0}, "position": {"x": [-10, -5, 4, -3, -3], "y": [-70, -50, 0, 90, 80], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 15, 16, 10, 0], "height": [0, 15, 16, 10, 0], "texture": [4, 11, 1, 17], "propeller": true}, "cannons1": {"section_segments": 8, "offset": {"x": 83, "y": 22.5, "z": -25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 63, 4, 3], "propeller": false, "angle": -2, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [110, 160], "number": 1}}, "cannons2": {"section_segments": 8, "offset": {"x": 45, "y": 46.5, "z": 25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 3, 4, 3], "propeller": false, "angle": -1, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1}}, "cannons3": {"section_segments": 8, "offset": {"x": 20, "y": -62.5, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 3, 4, 3], "propeller": false, "angle": -0.5, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [150, 200], "number": 1}}, "cannons4": {"section_segments": 8, "offset": {"x": 60, "y": -12.5, "z": -38}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 3, 4, 3], "propeller": false, "angle": -1.5, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -46.5, "z": 26}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-50, -30, 0, 40, 70, 100], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 14, 14, 13, 0], "height": [0, 10, 16, 14, 10, 0], "texture": [4, 9, 9, 63, 4]}}, "wings": {"wingsmain": {"offset": {"x": 30, "y": 37.5, "z": 6}, "length": [60, 10, 0, 25], "width": [100, 80, 60, 100, 55], "angle": [-30, -30, -30, -30], "position": [-20, 0, 16, 10, 40], "texture": [3, 13, 17, 63], "doubleside": true, "bump": {"position": -20, "size": 4}}, "wingsmain2": {"offset": {"x": 20, "y": 57.5, "z": 20}, "length": [30, 10, 0, 15], "width": [70, 60, 50, 90, 35], "angle": [10, 10, 10, 10], "position": [-20, 0, 16, 10, 40], "texture": [2, 13, 17, 63], "doubleside": true, "bump": {"position": -20, "size": 5}}, "wingsmain3": {"offset": {"x": 10, "y": -12.5, "z": -10}, "length": [50], "width": [70, 50], "angle": [-30, 0], "position": [-20, 5], "texture": [2], "doubleside": true, "bump": {"position": -20, "size": 5}}}, "typespec": {"name": "Typhoon", "level": 6, "model": 8, "code": 608,"next":[707, 708], "specs": {"shield": {"capacity": [230, 350], "reload": [4, 7]}, "generator": {"capacity": [220, 280], "reload": [44, 60]}, "ship": {"mass": 375, "speed": [67, 85], "rotation": [40, 70], "acceleration": [85, 95]}}, "shape": [4.533, 4.403, 3.757, 3.197, 2.589, 2.187, 2.193, 2.905, 2.886, 2.804, 2.7, 3.219, 3.385, 3.606, 3.905, 4.354, 4.737, 5.13, 5.688, 5.657, 5.063, 5.03, 4.467, 4.558, 4.666, 4.615, 4.666, 4.558, 4.467, 5.03, 5.063, 5.657, 5.688, 5.13, 4.737, 4.354, 3.905, 3.606, 3.385, 3.219, 2.7, 2.804, 2.886, 2.905, 2.193, 2.187, 2.589, 3.197, 3.757, 4.403], "lasers": [{"x": 3.119, "y": -0.536, "z": -0.925, "angle": -2, "damage": [8, 12], "rate": 3, "type": 1, "speed": [110, 160], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -3.119, "y": -0.536, "z": -0.925, "angle": 2, "damage": [8, 12], "rate": 3, "type": 1, "speed": [110, 160], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 1.689, "y": 0.352, "z": 0.925, "angle": -1, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.689, "y": 0.352, "z": 0.925, "angle": 1, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.752, "y": -3.681, "z": 0, "angle": -0.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.752, "y": -3.681, "z": 0, "angle": 0.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.256, "y": -1.831, "z": -1.406, "angle": -1.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.256, "y": -1.831, "z": -1.406, "angle": 1.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 5.688}}',
                            '{"name": "Marauder", "level": 6, "model": 9, "code":609, "next":[708,709], "size": 1.4, "zoom": 0.96, "specs": {"shield": {"capacity": [210, 350], "reload": [8, 11]}, "generator": {"capacity": [85, 160], "reload": [25, 45]}, "ship": {"mass": 280, "speed": [85, 115], "rotation": [60, 80], "acceleration": [80, 120]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-65, -75, -55, -40, 0, 30, 60, 80, 90, 80], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 18, 23, 30, 25, 25, 30, 35, 0], "height": [0, 5, 10, 12, 12, 20, 15, 15, 15, 0], "texture": [6, 4, 1, 10, 1, 1, 11, 12, 17], "propeller": true, "laser": {"damage": [10, 16], "rate": 10, "type": 1, "speed": [170, 200], "recoil": 0, "number": 1, "error": 0}}, "cockpit": {"section_segments": [40, 90, 180, 270, 320], "offset": {"x": 0, "y": -85, "z": 22}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [15, 35, 60, 95, 125], "z": [-1, -2, -1, -1, 3]}, "width": [5, 12, 14, 15, 5], "height": [0, 12, 15, 15, 0], "texture": [8.98, 8.98, 4]}, "outriggers": {"section_segments": 10, "offset": {"x": 25, "y": 0, "z": -10}, "position": {"x": [-5, -5, 8, -5, 0, 0, 0, 0, 0, 0], "y": [-100, -125, -45, 0, 30, 40, 70, 80, 100, 90], "z": [10, 10, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 10, 10, 15, 15, 15, 15, 10, 0], "height": [0, 10, 20, 25, 25, 25, 25, 25, 20, 0], "texture": [13, 4, 4, 63, 4, 18, 4, 13, 17], "laser": {"damage": [4, 8], "rate": 3, "type": 1, "speed": [110, 140], "recoil": 0, "number": 1, "error": 0}, "propeller": true}, "intake": {"section_segments": 12, "offset": {"x": 25, "y": -5, "z": 10}, "position": {"x": [0, 0, 5, 0, -3, 0, 0, 0, 0, 0], "y": [-10, -30, -5, 35, 60, 70, 85, 100, 85], "z": [0, -6, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 15, 10, 10, 5, 0], "height": [0, 15, 15, 20, 20, 15, 15, 5, 0], "texture": [6, 4, 63, 4, 63, 18, 4, 17]}}, "wings": {"main": {"length": [20, 70, 35], "width": [50, 55, 40, 20], "angle": [0, -20, 0], "position": [20, 20, 70, 25], "texture": [3, 18, 63], "doubleside": true, "bump": {"position": 30, "size": 15}, "offset": {"x": 0, "y": 0, "z": 13}}, "spoiler": {"length": [20, 45, 0, 5], "width": [40, 40, 20, 30, 0], "angle": [0, 20, 90, 90], "position": [60, 60, 80, 80, 90], "texture": [10, 11, 63], "doubleside": true, "bump": {"position": 30, "size": 18}, "offset": {"x": 0, "y": 0, "z": 30}}, "font": {"length": [37], "width": [40, 15], "angle": [-10], "position": [0, -45], "texture": [63], "doubleside": true, "bump": {"position": 30, "size": 10}, "offset": {"x": 35, "y": -20, "z": 10}}, "shields": {"doubleside": true, "offset": {"x": 12, "y": 60, "z": -15}, "length": [0, 15, 45, 20], "width": [30, 30, 65, 65, 30, 30], "angle": [30, 30, 90, 150], "position": [10, 10, 0, 0, 10], "texture": [4], "bump": {"position": 0, "size": 4}}}, "typespec": {"name": "Marauder", "level": 6, "model": 9, "code": 609,"next":[708,709], "zoom": 0.96, "specs": {"shield": {"capacity": [210, 350], "reload": [8, 11]}, "generator": {"capacity": [85, 160], "reload": [30, 50]}, "ship": {"mass": 270, "speed": [85, 115], "rotation": [60, 80], "acceleration": [80, 120]}}, "shape": [2.665, 3.563, 3.573, 2.856, 2.359, 2.03, 2.85, 2.741, 2.228, 1.71, 1.404, 1.199, 1.11, 3.408, 3.491, 3.521, 3.44, 3.385, 3.439, 3.481, 3.181, 2.932, 2.962, 2.944, 2.85, 2.244, 2.85, 2.944, 2.962, 2.932, 3.181, 3.481, 3.439, 3.385, 3.44, 3.521, 3.491, 3.408, 1.11, 1.199, 1.404, 1.71, 2.228, 2.741, 2.85, 2.03, 2.359, 2.856, 3.573, 3.563], "lasers": [{"x": 0, "y": -2.66, "z": 0.28, "angle": 0, "damage": [10, 16], "rate": 10, "type": 1, "speed": [170, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.56, "y": -3.5, "z": -0.28, "angle": 0, "damage": [4, 8], "rate": 3, "type": 1, "speed": [110, 140], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.56, "y": -3.5, "z": -0.28, "angle": 0, "damage": [4, 8], "rate": 3, "type": 1, "speed": [110, 140], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.573}}',
                            '{"name": "Rock-Tower", "level": 6, "model": 10, "code":610, "next":[708,709], "size": 2.1, "specs": {"shield": {"capacity": [300, 500], "reload": [8, 11]}, "generator": {"capacity": [120, 140], "reload": [34, 52]}, "ship": {"mass": 400, "speed": [85, 105], "rotation": [50, 70], "acceleration": [80, 90]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-90, -85, -70, -60, -20, -25, 40, 85, 70], "z": [-10, -8, -5, 0, 0, 0, 0, 0, 0]}, "width": [0, 40, 45, 10, 12, 30, 30, 20, 0], "height": [0, 10, 12, 8, 12, 10, 25, 20, 0], "texture": [4, 63, 4, 4, 4, 11, 10, 12], "propeller": true}, "cockpit": {"section_segments": 12, "offset": {"x": 0, "y": 30, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-30, -20, 0, 10, 20, 30], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 10, 5], "height": [0, 10, 15, 15, 10, 5], "texture": 9, "propeller": false}, "dimeds_banhammer": {"section_segments": 6, "offset": {"x": 25, "y": -70, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-20, -10, -20, 0, 10, 12], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 0, 5, 7, 6, 0], "height": [0, 0, 5, 7, 6, 0], "texture": [6, 6, 6, 10, 12], "angle": 0, "laser": {"damage": [4, 6], "rate": 8, "type": 1, "speed": [150, 230], "number": 1, "error": 5}}, "propulsors": {"section_segments": 8, "offset": {"x": 30, "y": 50, "z": 0}, "position": {"x": [0, 0, 5, 5, 0, 0, 0], "y": [-45, -50, -20, 0, 20, 50, 40], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 0], "height": [0, 15, 20, 25, 20, 10, 0], "texture": [11, 2, 3, 4, 5, 12], "angle": 0, "propeller": true}}, "wings": {"main": {"length": [55, 15], "width": [60, 40, 30], "angle": [-10, 20], "position": [30, 40, 30], "texture": 63, "doubleside": true, "offset": {"x": 0, "y": 20, "z": -5}, "bump": {"position": 30, "size": 20}}, "finalizer_fins": {"length": [20], "width": [20, 10], "angle": [-70], "position": [-42, -30], "texture": 63, "doubleside": true, "offset": {"x": 35, "y": -35, "z": 0}, "bump": {"position": 0, "size": 30}}}, "typespec": {"name": "Rock-Tower", "level": 6, "model": 10, "code": 610,"next":[708, 709], "specs": {"shield": {"capacity": [300, 500], "reload": [8, 11]}, "generator": {"capacity": [120, 140], "reload": [36, 54]}, "ship": {"mass": 400, "speed": [85, 103], "rotation": [50, 70], "acceleration": [80, 90]}}, "shape": [3.78, 3.758, 3.974, 3.976, 3.946, 3.508, 1.532, 1.64, 1.556, 1.426, 1.347, 1.298, 1.269, 1.764, 1.894, 2.075, 3.269, 3.539, 3.933, 3.989, 4.058, 4.127, 4.524, 4.416, 3.634, 3.577, 3.634, 4.416, 4.524, 4.127, 4.058, 3.989, 3.933, 3.539, 3.269, 2.075, 1.894, 1.764, 1.68, 1.298, 1.347, 1.426, 1.556, 1.64, 1.532, 3.508, 3.946, 3.976, 3.974, 3.758], "lasers": [{"x": 1.05, "y": -3.78, "z": -0.42, "angle": 0, "damage": [5, 8], "rate": 8, "type": 1, "speed": [150, 230], "number": 1, "spread": 0, "error": 3, "recoil": 0}, {"x": -1.05, "y": -3.78, "z": -0.42, "angle": 0, "damage": [5, 8], "rate": 8, "type": 1, "speed": [150, 230], "number": 1, "spread": 0, "error": 5, "recoil": 0}], "radius": 4.524}}',
                            '{"name":"Barracuda","level":6,"model":11,"code":611, "next":[709,710],"size":2.4,"specs":{"shield":{"capacity":[300,500],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[8,14]},"ship":{"mass":675,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"bodies":{"body":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-100,-60,-10,0,20,50,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,20,25,35,40,40,35,30,0],"height":[0,5,40,45,40,60,70,60,30,0],"texture":[10,2,10,2,3,13,13,63,12],"propeller":true},"front":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-20],"z":[0,0,0,0,0]},"width":[0,40,45,10,12],"height":[0,15,18,8,12],"texture":[8,63,4,4,4],"propeller":true},"propeller":{"section_segments":10,"offset":{"x":40,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,20,15,0],"height":[0,10,15,15,15,10,10,18,8,0],"texture":[4,4,10,3,3,63,4,63,12],"propeller":true},"sides":{"section_segments":6,"angle":90,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-75,-60,-50,-10,10,50,60,75,80],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,30,35,10,12,12,10,35,30,0],"height":[0,10,12,8,12,12,8,12,10,0],"texture":[4,63,4,4,4,4,4,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,0,10,30,50],"z":[0,0,0,0,0,0]},"width":[0,12,18,20,15,0],"height":[0,20,22,24,20,0],"texture":[9]}},"wings":{"top":{"doubleside":true,"offset":{"x":0,"y":20,"z":15},"length":[70],"width":[70,30],"angle":[90],"position":[0,30],"texture":[63],"bump":{"position":10,"size":30}},"top2":{"doubleside":true,"offset":{"x":0,"y":51,"z":5},"length":[70],"width":[50,20],"angle":[90],"position":[0,60],"texture":[63],"bump":{"position":10,"size":30}}},"typespec":{"name":"Barracuda","level":6,"model":11,"code":611,"specs":{"shield":{"capacity":[300,500],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[8,14]},"ship":{"mass":675,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"shape":[5.28,5.25,5.332,5.393,4.944,1.997,1.745,1.556,1.435,3.587,3.81,3.779,3.838,3.84,3.779,3.81,3.587,3.205,3.571,3.9,5.132,5.888,5.835,5.551,4.886,5.808,4.886,5.551,5.835,5.888,5.132,3.9,3.571,3.205,3.587,3.81,3.779,3.838,3.84,3.779,3.81,3.587,1.435,1.556,1.745,1.997,4.944,5.393,5.332,5.25],"lasers":[],"radius":5.888}}',
                            '{"name":"O-Defender","level":6,"model":12,"code":612, "next":[710,711],"size":2.2, "zoom": 0.96,"specs":{"shield":{"capacity":[400,550],"reload":[9,13]},"generator":{"capacity":[70,100],"reload":[25,40]},"ship":{"mass":550,"speed":[70,80],"rotation":[30,40],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-88,0,40,90,95,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[5,6,25,25,15,18,15,0],"height":[2,10,40,40,20,18,15,0],"texture":[63,1,4,10,63,63,17],"propeller":true,"laser":{"damage":[35,60],"rate":2,"type":2,"speed":[145,225],"number":1,"angle":0,"error":0}},"side":{"section_segments":10,"offset":{"x":50,"y":0,"z":0},"position":{"x":[-40,-5,15,25,20,0,-50],"y":[-100,-70,-40,-10,20,50,90],"z":[0,0,0,0,0,0,0]},"width":[5,20,20,20,20,20,5],"height":[15,25,30,30,30,25,15],"texture":[0,1,2,3,4,63]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":18},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9]},"innersides":{"section_segments":8,"offset":{"x":20,"y":-100,"z":0},"position":{"x":[-3,0,0,0,0,-5,-5],"y":[70,75,100,120,150,175,175],"z":[0,0,0,0,0,0,0]},"width":[0,10,20,22,20,10,0],"height":[0,20,25,25,25,15,0],"propeller":false,"texture":[2,3,63,11,1]}},"wings":{"join":{"offset":{"x":0,"y":20,"z":0},"length":[80,0],"width":[130,50],"angle":[-1],"position":[0,-30],"texture":[8],"bump":{"position":-20,"size":15}}},"typespec":{"name":"O-Defender","level":6,"model":12,"code":612, "next":[710,711], "zoom": 0.96,"specs":{"shield":{"capacity":[450,550],"reload":[11,14]},"generator":{"capacity":[70,110],"reload":[30,50]},"ship":{"mass":500,"speed":[65,75],"rotation":[42,54],"acceleration":[75,95]}},"shape":[4.409,4.448,4.372,4.204,4.119,4.136,4.174,4.107,4.066,4.094,4.073,4.141,4.16,4.062,4.015,3.966,3.83,3.76,3.742,3.591,3.502,3.494,3.575,3.764,4.449,4.409,4.449,3.764,3.575,3.494,3.502,3.591,3.742,3.76,3.83,3.966,4.015,4.062,4.16,4.141,4.073,4.094,4.066,4.107,4.174,4.136,4.119,4.204,4.372,4.448],"lasers":[{"x":0,"y":-3.96,"z":0,"angle":0,"damage":[35,60],"rate":2,"type":2,"speed":[215,275],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.449}}',
                        ]
                    }
                ]
            },
            {
                TIER: 7,
                SHIPS: [
                    {
                        ORIGIN: "Vanilla Revamp",
                        CODES: [
                            '{"name": "Odyssey", "level": 7, "model": 1, "size": 3.1, "specs": {"shield": {"capacity": [750, 750], "reload": [15, 15]}, "generator": {"capacity": [330, 330], "reload": [120, 120]}, "ship": {"mass": 600, "speed": [45, 45], "rotation": [30, 30], "acceleration": [150, 150]}}, "tori": {"circle": {"segments": 20, "radius": 95, "section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20], "height": [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], "texture": [63, 63, 4, 10, 4, 4, 10, 4, 63, 63, 63, 63, 3, 10, 3, 3, 10, 3, 63]}}, "bodies": {"main": {"section_segments": 16, "offset": {"x": 0, "y": -10, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-130, -130, -85, -70, -60, -20, -25, 40, 40, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 25, 40, 45, 10, 12, 30, 30, 40, 30, 0], "height": [0, 20, 25, 25, 10, 12, 25, 25, 20, 10, 0], "texture": [4, 15, 63, 4, 4, 4, 11, 10, 4, 12]}, "cannonmain": {"section_segments": 6, "offset": {"x": 0, "y": -115, "z": 0}, "position": {"x": [0, 0, 0, 0], "y": [-25, -30, -20, 0], "z": [0, 0, 0, 0]}, "width": [0, 20, 15, 7], "height": [0, 10, 9, 7], "texture": [6, 6, 6, 10], "laser": {"damage": [250, 250], "rate": 1, "type": 1, "speed": [105, 105], "number": 1, "error": 0, "recoil": 400}}, "laser1": {"section_segments": 8, "offset": {"x": 110, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0], "y": [-25, -30, -20, 0], "z": [0, 0, 0, 0]}, "width": [0, 3, 5, 5], "height": [0, 3, 5, 5], "texture": [12, 6, 63], "laser": {"damage": [20, 20], "rate": 3, "type": 1, "speed": [200, 200], "number": 1, "error": 0}}, "laser2": {"section_segments": 8, "offset": {"x": 110, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0], "y": [-25, -30, -20, 0], "z": [0, 0, 0, 0]}, "width": [0, 3, 5, 5], "height": [0, 3, 5, 5], "texture": [12, 6, 63], "angle": 180, "laser": {"damage": [20, 20], "rate": 3, "type": 1, "speed": [200, 200], "number": 1, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-30, -10, 0, 10, 30], "z": [0, 0, 0, 0, 0]}, "width": [0, 12, 15, 10, 0], "height": [0, 20, 22, 18, 0], "texture": [9]}, "bumpers": {"section_segments": 8, "offset": {"x": 85, "y": 20, "z": 0}, "position": {"x": [-10, -5, 5, 10, 5, -10, -15], "y": [-90, -85, -40, 0, 20, 60, 65], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 5, 0], "height": [0, 20, 35, 35, 25, 15, 0], "texture": [11, 2, 63, 4, 3], "angle": 0}, "toppropulsors": {"section_segments": 8, "offset": {"x": 17, "y": 50, "z": 15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, -5, 10, 20, 25, 30, 40, 50, 40], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "texture": [3, 4, 10, 3, 3, 63, 4, 13, 17], "propeller": true}, "bottompropulsors": {"section_segments": 8, "offset": {"x": 17, "y": 50, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, -5, 10, 20, 25, 30, 40, 50, 40], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "texture": [3, 4, 10, 3, 3, 63, 4, 4, 17], "propeller": true}}, "wings": {"topjoin": {"offset": {"x": 0, "y": -3, "z": 0}, "doubleside": true, "length": [100], "width": [20, 20], "angle": [25], "position": [0, 0, 0, 50], "texture": [1], "bump": {"position": 10, "size": 30}}, "bottomjoin": {"offset": {"x": 0, "y": -3, "z": 0}, "doubleside": true, "length": [100], "width": [20, 20], "angle": [-25], "position": [0, 0, 0, 50], "texture": [1], "bump": {"position": -10, "size": 30}}}, "typespec": {"name": "Odyssey", "level": 7, "model": 1, "code": 701, "specs": {"shield": {"capacity": [600, 600], "reload": [10, 10]}, "generator": {"capacity": [320, 320], "reload": [110, 110]}, "ship": {"mass": 500, "speed": [60, 60], "rotation": [30, 30], "acceleration": [130, 130]}}, "shape": [9.007, 9.054, 8.611, 7.078, 6.102, 2.816, 2.858, 6.866, 6.883, 6.673, 7.249, 7.245, 7.186, 7.186, 7.245, 7.249, 6.945, 6.851, 6.966, 7.014, 6.83, 4.817, 6.083, 6.422, 6.312, 6.107, 6.312, 6.422, 6.083, 4.817, 6.83, 7.014, 6.966, 6.851, 6.945, 7.249, 7.245, 7.186, 7.186, 7.245, 7.249, 6.673, 6.883, 6.866, 2.858, 2.816, 6.102, 7.078, 8.611, 9.054], "lasers": [{"x": 0, "y": -8.99, "z": 0, "angle": 0, "damage": [230, 230], "rate": 2, "type": 1, "speed": [90, 90], "number": 1, "spread": 0, "error": 0, "recoil": 280}, {"x": 6.82, "y": -1.86, "z": 0, "angle": 0, "damage": [20, 20], "rate": 3, "type": 1, "speed": [200, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -6.82, "y": -1.86, "z": 0, "angle": 0, "damage": [20, 20], "rate": 3, "type": 1, "speed": [200, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 6.82, "y": 1.86, "z": 0, "angle": 180, "damage": [20, 20], "rate": 3, "type": 1, "speed": [200, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -6.82, "y": 1.86, "z": 0, "angle": -180, "damage": [20, 20], "rate": 3, "type": 1, "speed": [200, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 9.054}}',
                            '{"name": "Weaver", "level": 7, "model": 2, "size": 2.9, "specs": {"shield": {"capacity": [300, 300], "reload": [7, 7]}, "generator": {"capacity": [205, 205], "reload": [73, 73]}, "ship": {"mass": 280, "speed": [105, 105], "rotation": [65, 65], "acceleration": [85, 85]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": -22, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-70, -68, -15, 0, 30, 40, 60, 70, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 20, 21, 18, 20, 20, 18, 15, 0], "height": [0, 5, 20, 21, 18, 20, 20, 18, 15, 0], "texture": [11, 2, 63, 3, 4, 8, 15, 63, 17], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -42, "z": 15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-25, -20, 0, 25, 60, 62], "z": [-3.2, -3, 0, 0, 0, 0]}, "width": [4, 8, 11, 8, 5, 0], "height": [0, 2, 6, 8, 4, 0], "propeller": false, "texture": [4, 9, 9, 63, 4]}, "deco": {"section_segments": 8, "offset": {"x": 50, "y": 43, "z": -10}, "position": {"x": [-3, -2, 5, 8, 5, 0, 0], "y": [-62, -60, -20, 0, 20, 40, 42], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 9, 10, 5, 0], "height": [0, 5, 10, 9, 10, 5, 0], "angle": 0, "propeller": false, "texture": [11, 2, 8, 10, 63, 4]}, "cannons": {"section_segments": 8, "offset": {"x": 38, "y": 43, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 10, 10], "y": [-52, -50, -20, 0, 20, 40, 42], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 4, 5, 10, 10, 5, 0], "height": [0, 8, 8, 13, 13, 5, 0], "angle": 0, "laser": {"damage": [80, 80], "rate": 2, "type": 1, "speed": [215, 215], "number": 1, "recoil": 125}, "propeller": false, "texture": [17, 13, 4, 10, 63, 4]}, "bottompropulsors": {"section_segments": 12, "offset": {"x": 16, "y": -12, "z": -1}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [15, 5, 13, 25, 30, 40, 60, 50], "z": [5, 6, 0.1, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 7, 7, 0], "height": [0, 5, 10, 10, 10, 7, 7, 0], "propeller": true, "texture": [3, 2, 10, 63, 4, 8, 17]}, "toppropulsors": {"section_segments": 8, "offset": {"x": 46.5, "y": 28, "z": -2}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [11, 7, 13, 25, 30, 40, 60, 50], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 7, 7, 0], "height": [0, 5, 10, 10, 10, 7, 7, 0], "propeller": true, "texture": [4, 2, 15, 63, 4, 8, 17]}}, "wings": {"main": {"length": [22], "width": [17, 18], "angle": [-40], "position": [1, 15], "doubleside": true, "bump": {"position": 0, "size": 15}, "texture": [18, 63], "offset": {"x": 20, "y": 4, "z": 5.8}}, "main2": {"length": [50], "width": [20, 20], "angle": [-20], "position": [-40, 30], "doubleside": true, "bump": {"position": 30, "size": 15}, "texture": [63, 63], "offset": {"x": 0, "y": 42, "z": 10}}, "sides": {"doubleside": true, "offset": {"x": 59, "y": 23, "z": -10}, "length": [-3, 5, 13, 10], "width": [5, 10, 60, 30, 10], "angle": [5, 5, 25, 35], "position": [0, 0, 20, 45, 58], "texture": [4, 3, 11, 63], "bump": {"position": 30, "size": 10}}, "front": {"length": [-3, 20], "width": [0, 90, 10], "angle": [0, -10], "position": [0, 0, 40], "doubleside": true, "bump": {"position": 30, "size": 10}, "texture": [15, 3.3], "offset": {"x": 10, "y": -67, "z": 0}}, "top": {"doubleside": true, "offset": {"x": 14, "y": 30, "z": 11}, "length": [0, 15], "width": [0, 30, 15], "angle": [0, 40], "position": [0, 0, 20], "texture": [11], "bump": {"position": 30, "size": 10}}}, "typespec": {"name": "Weaver", "level": 7, "model": 2, "code": 702, "specs": {"shield": {"capacity": [350, 350], "reload": [7, 7]}, "generator": {"capacity": [205, 205], "reload": [73, 73]}, "ship": {"mass": 300, "speed": [105, 105], "rotation": [65, 65], "acceleration": [85, 85]}}, "shape": [6.509, 6.483, 4.633, 3.665, 3.081, 2.694, 2.417, 2.121, 1.445, 2.963, 3.23, 3.269, 3.366, 3.525, 3.758, 4.071, 4.51, 5.202, 6.441, 6.851, 5.786, 5.973, 5.641, 3.475, 3.424, 3.37, 3.424, 3.475, 5.641, 5.973, 5.786, 6.851, 6.441, 5.202, 4.51, 4.071, 3.758, 3.525, 3.366, 3.269, 3.23, 2.963, 1.445, 2.121, 2.417, 2.694, 3.081, 3.665, 4.633, 6.483], "lasers": [{"x": 2.204, "y": -0.522, "z": -0.58, "angle": 0, "damage": [80, 80], "rate": 2, "type": 1, "speed": [225, 225], "number": 1, "spread": 0, "error": 0, "recoil": 130}, {"x": -2.204, "y": -0.522, "z": -0.58, "angle": 0, "damage": [80, 80], "rate": 2, "type": 1, "speed": [225, 225], "number": 1, "spread": 0, "error": 0, "recoil": 130}], "radius": 6.851}}',
                            '{"name": "Ballista", "level": 7, "model": 3, "size": 2.9, "zoom": 1, "specs": {"shield": {"capacity": [400, 400], "reload": [8, 8]}, "generator": {"capacity": [300, 300], "reload": [80, 80]}, "ship": {"mass": 500, "speed": [85, 85], "rotation": [50, 50], "acceleration": [100, 100]}}, "bodies": {"main_body": {"section_segments": 12, "offset": {"x": 0, "y": 25, "z": 11}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-145, -135, -115, -60, -30, 10, 30, 50, 60, 70, 65], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [2, 7, 12, 25, 20, 20, 25, 26.5, 20, 18, 0], "height": [0, 8, 16, 23, 20, 20, 25, 26.5, 20, 18, 0], "texture": [4, 63, 10, 1, 11, 2, 13, 2, 4, 17], "propeller": true}, "top_pew1": {"section_segments": 10, "offset": {"x": 0, "y": 30, "z": 55}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-50, -27, -35, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 8, 14, 20, 14, 14, 18, 9, 0], "height": [0, 7, 9, 15, 17, 15, 15, 20, 10, 0], "texture": [6, 16.9, 10, 3, 1, 63, 2, 1, 16.9], "propeller": true, "laser": {"damage": [15, 15], "rate": 1, "speed": [200, 200], "number": 15, "recoil": 20, "type": 2}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -60, "z": 25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-15, -3, 25, 43, 55, 100], "z": [0, 0, 0, 0, -1, 1, 0, 0, 1, 0, 0, 0]}, "width": [1, 7, 12.4, 11, 9.5, 0], "height": [1, 8, 15, 11, 12, 0], "texture": [7, 9, 9, 8, 31]}, "gun1": {"section_segments": 8, "offset": {"x": 85, "y": 15, "z": -22}, "position": {"x": [0, 0, 0, 0, 0, 0, -1], "y": [-28, -40, -34, -14, -5, 22, 40], "z": [0, 0, 0, 0, 0, 0, 5]}, "width": [0, 3.4, 5, 5.5, 8, 5, 0], "height": [0, 3.4, 5, 5.5, 8, 5, 0], "texture": [17, 63, 4, 8, 2, 3], "angle": 4, "laser": {"damage": [8, 8], "rate": 3, "speed": [110, 110], "number": 1, "recoil": 0, "type": 1}}, "side_inner": {"section_segments": 8, "offset": {"x": 56, "y": 45, "z": -5}, "position": {"x": [-8, -4, -7, 0, 0, -10, -15], "y": [-60, -45, -25, -14, 22.5, 40, 50], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 10, 9, 9, 7, 0], "height": [0, 8, 15, 15, 15, 12, 0], "texture": [2, 3, 63, 13, 63, 2], "angle": 5}, "propulsors": {"section_segments": 8, "offset": {"x": 38, "y": 50, "z": 0}, "position": {"x": [-15, -15, -8, -12.5, -12, -5, 0, -1, -1, -1, 0, 0, 0, 0, 0], "y": [-95, -100, -80, -50, -40, -20, 20, 39, 50, 48], "z": [2.5, 2.5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 20, 20, 11, 10, 0], "height": [0, 10, 13, 15, 15, 20, 20, 16, 12, 0], "texture": [6, 63, 2, 13, 63, 10, 2, 13, 17], "propeller": true}}, "wings": {"main": {"doubleside": true, "offset": {"x": 57, "y": 45, "z": -5}, "length": [29, 10, 20], "width": [70, 42, 42, 15], "angle": [-20, -15, 10], "position": [0, -20, -31, -10], "texture": [11, 63, 4], "bump": {"position": 10, "size": 10}}, "stab": {"length": [13, 2, 15], "width": [40, 30, 75, 10], "angle": [-20, 0, 10], "position": [35, 45, 30, 55], "doubleside": true, "texture": [8, 4, 63], "bump": {"position": 20, "size": 10}, "offset": {"x": 5, "y": -125, "z": 12}}, "join": {"offset": {"x": 0, "y": 10, "z": 23}, "length": [0, 37, 0, 34], "width": [0, 28, 45, 45, 10], "angle": [90, 90, 90, -10], "position": [0, 10, 40, 40, 65], "texture": [8, 8, 63], "doubleside": true, "bump": {"position": 20, "size": 8}}}, "typespec": {"name": "Ballista", "level": 7, "model": 3, "code": 703, "specs": {"shield": {"capacity": [450, 450], "reload": [8, 8]}, "generator": {"capacity": [300, 300], "reload": [70, 70]}, "ship": {"mass": 500, "speed": [75, 75], "rotation": [40, 40], "acceleration": [100, 100]}}, "shape": [6.481, 7.23, 6.527, 5.177, 4.309, 3, 2.847, 2.748, 2.654, 2.375, 4.828, 4.844, 5.284, 5.731, 6.333, 6.55, 5.448, 5.548, 5.118, 5.26, 5.539, 5.962, 5.967, 5.678, 5.958, 5.952, 5.958, 5.678, 5.967, 5.962, 5.539, 5.26, 5.118, 5.548, 5.448, 6.55, 6.333, 5.731, 5.284, 4.844, 4.828, 2.375, 2.654, 2.748, 2.847, 3, 4.309, 5.177, 6.527, 7.23], "lasers": [{"x": 0, "y": -1.08, "z": 2.97, "angle": 0, "damage": [15, 15], "rate": 1, "type": 2, "speed": [185, 185], "number": 15, "spread": 0, "error": 0, "recoil": 20}, {"x": 4.439, "y": -1.345, "z": -1.188, "angle": 4, "damage": [12, 12], "rate": 3, "type": 1, "speed": [150, 150], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -4.439, "y": -1.345, "z": -1.188, "angle": -4, "damage": [12, 12], "rate": 3, "type": 1, "speed": [150, 150], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 7.23}}',
                            '{"name":"Bumblebee","level":7,"model":4,"size":2.6,"specs":{"shield":{"capacity":[400,400],"reload":[10,10]},"generator":{"capacity":[225,225],"reload":[65,65]},"ship":{"mass":225,"speed":[110,110],"rotation":[50,50],"acceleration":[90,90]}},"bodies":{"cockpit":{"section_segments":[0,0,0,0,0,45,90,135,180,225,270,315],"offset":{"x":0,"y":-6,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-16,2,21,30,62],"z":[-4,-2,-1,7,6.1]},"width":[6,11,13,10,5],"height":[7,16,18,9,5],"propeller":false,"texture":[9,9,63,4]},"main":{"section_segments":[0,0,0,0,0,45,90,135,180,225,270,315],"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-165,-149,-153,-135,-130,-90,-70,-48,-10,-5,20,45,70,60],"z":[-9,-9,-9,-8,-7,-6,-4,-2,0,0,5,10,10,0,0]},"width":[0,7,11,16,17,18,22,20,25,27,23,20,17,0],"height":[0,7,9,14,16,18,22,23,25,27,23,20,17,0],"texture":[17,17,4,63,10,4,63,2,3,8,63,12,17],"propeller":true,"laser":{"damage":[200,200],"rate":2,"type":1,"speed":[150,150],"number":1,"recoil":200}},"decotop":{"section_segments":8,"offset":{"x":40,"y":70,"z":20},"position":{"x":[-2,-2,-2,-2,-2,-7,0,-2,-2,-2],"y":[-85,-88,-80,-65,-60,-30,0,20,21],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,11,13,13,15,10,0],"height":[0,8,10,11,14,15,14,10,0],"texture":[17,3,2,4,63,11,3,12],"laser":{"damage":[25,25],"rate":1,"type":1,"speed":[150,150],"number":1},"propeller":false},"decobottom":{"section_segments":8,"offset":{"x":50,"y":40,"z":-20},"position":{"x":[6,6,6,6,1,-4,0,3,0],"y":[-103,-100,-90,-64,-45,-25,5,38,0],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,9,12,15,15,15,18,12,0],"height":[0,9,13,18,15,12,18,12,0],"texture":[12,63,10,2,3,63,4,17],"propeller":true}},"wings":{"mainbottom":{"length":[60,30,22],"width":[70,55,50,34],"angle":[-25,-25,-30],"position":[30,50,33,4],"bump":{"position":-28,"size":15},"offset":{"x":0,"y":-30,"z":0},"texture":[11,2.3,63],"doubleside":true},"maintop":{"length":[50,20,20],"width":[60,50,40,30],"angle":[25,25,30],"position":[50,40,50,90],"bump":{"position":30,"size":15},"offset":{"x":0,"y":0,"z":0},"texture":[2,11,63],"doubleside":true},"winglets":{"doubleside":true,"length":[18],"width":[70,40],"angle":[0,-10],"position":[-40,-60],"bump":{"position":60,"size":20},"texture":63,"offset":{"x":10,"y":-33,"z":-7}}},"typespec":{"name":"Bumblebee","level":7,"model":4,"code":704,"specs":{"shield":{"capacity":[400,400],"reload":[10,10]},"generator":{"capacity":[250,250],"reload":[65,65]},"ship":{"mass":270,"speed":[110,110],"rotation":[60,60],"acceleration":[90,90]}},"shape":[6.67,6.139,5.355,4.152,2.331,3.653,4.048,4.069,3.865,5.033,4.974,4.777,4.664,4.409,4.173,4.023,3.838,4.084,5.089,5.824,6.093,4.692,4.603,4.358,4.213,4.148,4.213,4.358,4.603,4.692,6.093,5.824,5.089,4.084,3.838,4.023,4.173,4.409,4.664,4.777,4.974,5.033,3.865,4.069,4.048,3.653,2.331,4.152,5.355,6.139],"lasers":[{"x":0,"y":-6.25,"z":0,"angle":0,"damage":[200,200],"rate":2,"type":1,"speed":[145,145],"number":1,"spread":0,"error":0,"recoil":200},{"x":1.75,"y":-2.25,"z":-0.75,"angle":0,"damage":[25,25],"rate":1,"type":1,"speed":[145,145],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.75,"y":-2.25,"z":-0.75,"angle":0,"damage":[25,25],"rate":1,"type":1,"speed":[145,145],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.807}}',
                            '{"name": "Kyvos", "level": 7, "model": 5, "size": 1.4, "zoom": 1.0, "specs": {"shield": {"capacity": [280, 280], "reload": [8, 8]}, "generator": {"capacity": [200, 200], "reload": [55, 55]}, "ship": {"mass": 200, "speed": [150, 150], "rotation": [65, 65], "acceleration": [125, 125]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-157, -150, -114, -72, -22, 5, 20, 80, 102, 130, 160, 150], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 11, 26, 30, 37, 38, 31, 29, 28, 26, 24, 0], "height": [0, 11, 25, 26, 29, 35, 39, 30, 27, 26, 24, 0], "texture": [4, 9, 9, 10, 2, 4, 11, 63, 2, 12, 17], "laser": {"damage": [120, 120], "rate": 1, "type": 1, "speed": [55, 55], "number": 1, "recoil": 0}, "propeller": true}, "tubes": {"section_segments": 8, "offset": {"x": 35, "y": 57, "z": 0}, "position": {"x": [-9, -11, -6, -9, -11, -13, -15, 0, 0, 0], "y": [-188, -140, -99, -72, -36, 0, 49, 75, 115, 110], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 22, 21, 25, 22, 23, 30, 16, 12, 0], "height": [0, 13, 16, 18, 15, 15, 14, 14, 13, 0], "texture": [2, 3, 2, 63, 10, 63, 3, 12, 17], "propeller": true}, "outsidethings": {"section_segments": 8, "offset": {"x": 36, "y": 8, "z": 0}, "position": {"x": [-3, 20, 42, 29, -7], "y": [-91, -60, -5, 50, 88], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [13, 13, 16, 16, 20], "height": [8, 11, 13, 13, 8], "texture": [2, 63, 4, 63], "propeller": false}, "toptube": {"section_segments": 8, "offset": {"x": 0, "y": 45, "z": 27}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-110, -86, -44, 16, 39, 60], "z": [-9, -4, 0, 0, -4, -12]}, "width": [17, 18, 19, 18, 15, 13], "height": [10, 16, 16, 12, 11, 11], "texture": [3, 63, 11, 3, 13], "propeller": false}}, "wings": {"wing0": {"doubleside": true, "length": [43, 30, 30], "width": [170, 128, 70, 40], "angle": [0, -16, -19], "position": [0, 28, 54, 54], "offset": {"x": 40, "y": 19, "z": 0}, "bump": {"position": 25, "size": 4}, "texture": [4, 3.3, 63]}, "nothing": {"doubleside": true, "length": [36, 0], "width": [150, 70, 0], "angle": [-7, -7], "position": [0, 0, 0], "offset": {"x": 40, "y": 18, "z": -5}, "bump": {"position": -22, "size": 5}, "texture": [111]}, "winglet0": {"doubleside": true, "length": [34, 23], "width": [70, 59, 30], "angle": [25, 20], "position": [10, 25, 35], "offset": {"x": 6, "y": 46, "z": 20}, "bump": {"position": 28, "size": 7}, "texture": [18, 63]}, "winglet1": {"doubleside": true, "length": [26, 20], "width": [50, 35, 22], "angle": [-12, -12], "position": [8, 20, 18], "offset": {"x": 46, "y": 130, "z": -6}, "bump": {"position": 10, "size": 6}, "texture": [4, 63]}}, "typespec": {"name": "Kyvos", "level": 8, "model": 4, "code": 708, "specs": {"shield": {"capacity": [280, 280], "reload": [8, 8]}, "generator": {"capacity": [220, 220], "reload": [60, 60]}, "ship": {"mass": 250, "speed": [130, 130], "rotation": [70, 70], "acceleration": [130, 130]}}, "shape": [4.602, 4.433, 3.566, 2.966, 2.607, 2.405, 2.312, 2.261, 2.237, 2.198, 2.225, 2.294, 2.405, 2.575, 2.846, 3.92, 4.159, 4.374, 4.279, 4.061, 4.415, 4.763, 4.736, 4.636, 4.553, 3.647, 4.553, 4.636, 4.736, 4.763, 4.415, 4.061, 4.279, 4.374, 4.159, 3.92, 2.846, 2.575, 2.405, 2.294, 2.225, 2.198, 2.237, 2.261, 2.312, 2.405, 2.607, 2.966, 3.566, 4.433], "lasers": [{"x": 0, "y": -4.602, "z": 0, "angle": 0, "damage": [140, 140], "rate": 2, "type": 1, "speed": [60, 60], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 4.763}}',
                            '{"name":"Bass-Cannon","level":7,"model":6,"size":3.4,"specs":{"shield":{"capacity":[550,550],"reload":[12,12]},"generator":{"capacity":[330,330],"reload":[122,122]},"ship":{"mass":500,"speed":[90,90],"rotation":[30,30],"acceleration":[90,90]}},"bodies":{"mainCannon":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-128,-127.5,-125,-127.5,-130,-125,-115,-80,80,95,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,7.5,15,20,25,27.5,27.5,25,20,0],"height":[0,3,7.5,15,20,25,25,25,25,20,0],"texture":[63,4,3,4,2,3,11,3,13,17],"propeller":true,"laser":{"damage":[60,60],"rate":2,"type":1,"speed":[170,170],"number":1,"angle":0,"error":0,"recoil":200}},"cannon2":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0],"y":[-128],"z":[0]},"width":[0],"height":[0],"texture":[63],"propeller":true,"laser":{"damage":[60,60],"rate":2,"type":1,"speed":[140,140],"number":3,"angle":20,"error":0}},"cannon3":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0],"y":[-128],"z":[0]},"width":[0],"height":[0],"texture":[63],"propeller":true,"laser":{"damage":[25,25],"rate":2,"type":1,"speed":[110,110],"number":6,"angle":35,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":70,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-75,-60,-45,-30,0,15,20],"z":[7.5,3,3,0,0,0,0,-4,0,0]},"width":[3,9,11,12,18,15,10,0],"height":[0,10,12,15,15,15,10,0],"texture":[9,9,9,4,10,63,4,3,63]},"side":{"section_segments":8,"offset":{"x":30,"y":10,"z":0},"position":{"x":[-5,-3,-1,0,0,0,0,0,-9],"y":[-100,-90,-70,-50,-15,20,35,60,95],"z":[0,0,0,0,0,0,0,0,3]},"width":[0,12,15,15,17,35,36,28,0],"height":[0,15,15,15,15,15,15,15,0],"texture":[3,63,3,10,63,4,11,2,13,3],"propeller":false},"side2":{"section_segments":8,"offset":{"x":20,"y":10,"z":5},"position":{"x":[-3,0,0,0,0,0,-3],"y":[-85,-45,0,40,75,95],"z":[10,0,0,0,0,0,0]},"width":[0,15,17,28,15,0],"height":[0,15,18,16,15,0],"angle":0,"propeller":false,"texture":[4,2,3,63,3,4]},"mid":{"section_segments":10,"offset":{"x":0,"y":-25,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-80,-70,-44,-5,40,80,115,120],"z":[8,1,1,0,0,0,0,0]},"width":[0,13,18,20,20,20,20,0],"height":[0,15,18,18,18,16,15,0],"angle":0,"propeller":false,"texture":[63,4,3,11,4,63,4]}},"wings":{"winglet":{"doubleside":true,"offset":{"x":10,"y":55,"z":30},"length":[20],"width":[50,35],"angle":[0],"position":[0,0],"texture":[3.5],"bump":{"position":10,"size":5}},"winglet2":{"doubleside":true,"offset":{"x":20,"y":-100,"z":0},"length":[17],"width":[30,20],"angle":[0],"position":[0,0],"texture":[3],"bump":{"position":10,"size":10}},"winglet3":{"doubleside":true,"offset":{"x":43,"y":-25,"z":0},"length":[16],"width":[80,125],"angle":[0],"position":[0,0],"texture":[3.5],"bump":{"position":10,"size":1}}},"typespec":{"name":"Bass-Cannon","level":7,"model":6,"code":706,"specs":{"shield":{"capacity":[550,550],"reload":[12,12]},"generator":{"capacity":[330,330],"reload":[120,120]},"ship":{"mass": 500, "speed": [80, 80], "rotation": [30, 30], "acceleration": [70, 70]}},"shape":[8.176,8.273,8.138,7.892,6.066,7.176,6.29,5.485,4.945,4.54,4.294,4.14,4.034,4.034,4.14,4.538,5.071,5.48,5.765,6.182,6.278,6.484,6.816,7.281,7.268,7.154,7.268,7.281,6.816,6.484,6.278,6.182,5.765,5.48,5.071,4.538,4.14,4.034,4.034,4.14,4.294,4.54,4.945,5.485,6.29,7.176,6.066,7.892,8.138,8.273],"lasers":[{"x":0,"y":-8.16,"z":0,"angle":0,"damage":[60,60],"rate":0.36,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":220},{"x":0,"y":-8.024,"z":0,"angle":0,"damage":[45,45],"rate":0.36,"type":1,"speed":[142,142],"number":2,"spread":6,"error":0,"recoil":0},{"x":0,"y":-8.024,"z":0,"angle":0,"damage":[30,30],"rate":0.36,"type":1,"speed":[124,124],"number":6,"spread":35,"error":0,"recoil":0}],"radius":8.273}}',
                            '{"name": "Bastion", "level": 7, "model": 7, "size": 3.2, "zoom": 1.08, "specs": {"shield": {"capacity": [450, 450], "reload": [10, 10]}, "generator": {"capacity": [350, 350], "reload": [110, 110]}, "ship": {"mass": 250, "speed": [85, 85], "rotation": [30, 30], "acceleration": [105, 105]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 30, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-40, -50, -20, 0, 20, 40, 25], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 22, 18, 16, 15, 0], "height": [0, 2, 12, 16, 16, 15, 0], "texture": [10, 1, 1, 10, 8, 17], "propeller": true}, "thrusters": {"section_segments": 8, "offset": {"x": 40, "y": 23, "z": -24}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-25, -20, 0, 20, 40, 30], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 8, 12, 8, 8, 0], "height": [0, 12, 12, 8, 8, 0], "texture": [63, 2, 2, 2, 17], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 10, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-15, -10, 0, 11, 35], "z": [-5, -3, -1, 0, 0]}, "width": [0, 5, 10, 10, 0], "height": [0, 3, 5, 7, 0], "texture": [9]}, "cannon1": {"section_segments": 4, "offset": {"x": 10, "y": -100, "z": 1}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 2, 4, 7, 3], "height": [0, 1, 3, 6, 0], "texture": [17, 4], "laser": {"damage": [8, 8], "rate": 4, "type": 1, "speed": [165, 165], "number": 1}}, "cannon2": {"section_segments": 4, "offset": {"x": 42.5, "y": -149, "z": 8}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 2, 4, 7, 3], "height": [0, 1, 3, 6, 0], "texture": [17, 4], "angle": 1, "laser": {"damage": [8, 8], "rate": 6, "type": 1, "speed": \[160, 160\], "number": 1}}, "cannon3": {"section_segments": 4, "offset": {"x": 75, "y": -125, "z": -8}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 2, 4, 7, 3], "height": [0, 1, 3, 6, 0], "texture": [17, 4], "angle": 3, "laser": {"damage": [8, 8], "rate": 3, "type": 1, "speed": \[160, 160\], "number": 1}}}, "wings": {"main1": {"doubleside": true, "offset": {"x": 9, "y": -5, "z": 0}, "length": [0, 15, 0, 7], "width": [0, 160, 70, 30, 30], "angle": [0, 20, 0, -10], "position": [30, -20, 30, 30, 30], "texture": [13, 63, 13, 8], "bump": {"position": 35, "size": 5}}, "main2": {"doubleside": true, "offset": {"x": 30, "y": -5, "z": 0}, "length": [0, 15, 0, 20], "width": [0, 80, 90, 200, 30], "angle": [30, 30, 30, 30], "position": [30, 30, 10, -45, 30], "texture": [13, 3, 13, 4], "bump": {"position": 35, "size": 7}}, "main3": {"doubleside": true, "offset": {"x": 0, "y": 5, "z": -7}, "length": [45, 35, 0, 20], "width": [40, 40, 40, 200, 40], "angle": [-20, 20, -20, -5], "position": [20, 30, 0, -30, 10], "texture": [0, 8, 13, 63], "bump": {"position": 35, "size": 20}}}, "typespec": {"name": "Bastion", "level": 7, "model": 7, "code": 707, "zoom": 1.08, "specs": {"shield": {"capacity": [500, 500], "reload": [10, 10]}, "generator": {"capacity": [300, 300], "reload": [95, 95]}, "ship": {"mass": 420, "speed": [80, 80], "rotation": [30, 30], "acceleration": [90, 90]}}, "shape": [4.867, 7.069, 10.53, 9.426, 9.867, 9.246, 8.247, 7.253, 6.749, 6.417, 6.187, 6.076, 6.095, 6.133, 6.28, 6.485, 6.469, 6.534, 6.727, 6.796, 5.069, 4.774, 4.582, 4.582, 4.561, 4.489, 4.561, 4.582, 4.582, 4.774, 5.069, 6.796, 6.727, 6.534, 6.469, 6.485, 6.28, 6.133, 6.095, 6.076, 6.187, 6.417, 6.749, 7.253, 8.247, 9.246, 9.867, 9.426, 10.53, 7.069], "lasers": [{"x": 0.64, "y": -7.04, "z": 0.064, "angle": 0, "damage": [6, 6], "rate": 6, "type": 1, "speed": [140, 140], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.64, "y": -7.04, "z": 0.064, "angle": 0, "damage": [6, 6], "rate": 6, "type": 1, "speed": [140, 140], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.709, "y": -10.176, "z": 0.512, "angle": 2, "damage": [8, 8], "rate": 4, "type": 1, "speed": [145, 145], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.709, "y": -10.176, "z": 0.512, "angle": -2, "damage": [8, 8], "rate": 4, "type": 1, "speed": [145, 145], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 4.767, "y": -8.639, "z": -0.512, "angle": 4, "damage": [18, 18], "rate": 1.2, "type": 1, "speed": [155, 155], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -4.767, "y": -8.639, "z": -0.512, "angle": -4, "damage": [18, 18], "rate": 1.2, "type": 1, "speed": [155, 155], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 11.03}}',
                            '{"name": "Shadow X-3", "level": 7, "model": 8, "size": 1.8, "zoom": 1.04, "specs": {"shield": {"capacity": [400, 400], "reload": [10, 10]}, "generator": {"capacity": [250, 250], "reload": [65, 65]}, "ship": {"mass": 275, "speed": [120, 120], "rotation": [50, 50], "acceleration": [90, 90]}}, "bodies": {"main": {"section_segments": 20, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-125, -123, -110, -70, -40, 0, 40, 70, 80, 90, 100], "z": [0, 0, 0, -2, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 20, 30, 20, 20, 30, 30, 30, 20, 0], "height": [0, 5, 10, 20, 20, 20, 20, 15, 15, 15, 10, 10], "texture": [12, 4, 15, 4, 63, 3, 4, 4, 5]}, "air": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [0, -80, -30, -10, 10, 30, 50], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 35, 30, 30, 32, 20], "height": [0, 15, 10, 10, 10, 10, 10, 15, 15, 15, 10, 10], "texture": [4, 3, 2, 2, 2, 3]}, "back": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [90, 95, 100, 105, 90], "z": [0, 0, 0, 0, 0]}, "width": [10, 15, 18, 22, 2], "height": [3, 5, 7, 8, 2], "texture": [63], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -30, "z": 18}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-40, -25, 0, 25, 60, 90, 100], "z": [0, 0, 0, 0, -10, -8, -10]}, "width": [0, 10, 15, 10, 20, 15, 10], "height": [0, 10, 20, 20, 20, 15, 10], "texture": [9, 9, 9, 10, 63, 3]}, "booster1": {"section_segments": 10, "offset": {"x": 32.5, "y": -15, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, -5, -10], "y": [-35, -25, 0, 10, 20, 25, 30, 40, 70, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0, 5, 10]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "texture": [6, 4, 10, 3, 4, 3, 4, 3, 4], "propeller": false, "laser": {"damage": [25, 25], "rate": 10, "type": 1, "speed": [200, 200], "number": 1, "recoil": 50}}, "booster2": {"section_segments": 10, "offset": {"x": 55, "y": 5, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-35, -25, 0, 10, 20, 25, 30, 40, 70, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 12, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "texture": [4, 4, 10, 3, 4, 3, 13], "propeller": true}}, "wings": {"wings": {"doubleside": true, "offset": {"x": 10, "y": 0, "z": 5}, "length": [28, 10, 15, 40], "width": [100, 60, 80, 50, 70], "angle": [-10, 5, 0, -40], "position": [-40, 0, 40, 10, 70], "texture": [4, 4, 4, 4], "bump": {"position": -20, "size": 15}}, "sideBack": {"doubleside": true, "offset": {"x": 20, "y": 68, "z": 0}, "length": [30], "width": [30, 15], "angle": [-13], "position": [0, 30], "texture": [63], "bump": {"position": 10, "size": 10}}, "sideFront": {"doubleside": true, "offset": {"x": 10, "y": -95, "z": 0}, "length": [30], "width": [30, 15], "angle": [-13], "position": [0, 40], "texture": [63], "bump": {"position": 10, "size": 10}}, "top": {"doubleside": true, "offset": {"x": 10, "y": 60, "z": 5}, "length": [30], "width": [50, 30], "angle": [50], "position": [0, 50], "texture": [3], "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "Shadow X-3", "level": 7, "model": 8, "code": 708, "zoom": 1.04, "specs": {"shield": {"capacity": [260, 260], "reload": [10, 10]}, "generator": {"capacity": [160, 160], "reload": [70, 70]}, "ship": {"mass": 220, "speed": [140, 140], "rotation": [53, 53], "acceleration": [95, 95]}}, "shape": [5.75, 5.382, 4.507, 3.99, 3.637, 3.365, 2.687, 2.656, 2.475, 3, 3.107, 3.093, 3.286, 3.594, 4.029, 4.602, 4.888, 5.285, 5.88, 6.458, 4.476, 5.318, 5.355, 5.906, 4.973, 4.84, 4.973, 5.906, 5.355, 5.318, 4.476, 6.458, 5.88, 5.285, 4.888, 4.602, 4.029, 3.594, 3.3, 3.093, 3.107, 3, 2.475, 2.656, 2.687, 3.365, 3.637, 3.99, 4.507, 5.382], "lasers": [{"x": 1.495, "y": -2.3, "z": -0.69, "angle": 0, "damage": [18, 18], "rate": 10, "type": 1, "speed": [175, 175], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.495, "y": -2.3, "z": -0.69, "angle": 0, "damage": [18, 18], "rate": 10, "type": 1, "speed": [175, 175], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 6.458}}',
                            '{"name": "Inertia", "level": 7, "model": 9, "size": 2.7, "zoom": 1.04, "specs": {"shield": {"capacity": [450, 450], "reload": [8, 8]}, "generator": {"capacity": [200, 200], "reload": [55, 55]}, "ship": {"mass": 425, "speed": [120, 120], "rotation": [34, 34], "acceleration": [80, 80]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 10, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-125, -120, -110, -85, -70, -60, -20, 0, 40, 70, 90, 100, 95], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 25, 30, 37, 36, 35, 33, 32, 28, 20, 0], "height": [0, 15, 25, 27, 28, 27, 26, 25, 23, 22, 18, 15, 0], "texture": [4, 31, 11, 1, 31, 3, 2, 4, 11, 3, 31, 17], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -50, "z": 25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-35, -25, -7, 15, 50, 70, 100], "z": [0, 0, 0, 0, 0, -1, -1.8]}, "width": [0, 8, 13, 15, 18, 16, 5], "height": [0, 10, 15, 15, 12, 11, 5], "texture": [9, 9, 9, 11, 63, 4, 4]}, "topengines": {"section_segments": 8, "offset": {"x": 25, "y": 60, "z": 18}, "position": {"x": [-5, -5, -4, -2, -2, -2, -2, -2], "y": [-60, -55, -40, -6, 15, 45, 58, 53], "z": [-10, -10, -8, -2, -1, 0, 0, 0]}, "width": [0, 7, 9.5, 12, 12, 11, 9, 0], "height": [0, 7, 9.5, 10, 10, 11, 9, 0], "texture": [31, 4, 2, 8, 63, 4, 17], "propeller": true}, "cannons": {"section_segments": 12, "offset": {"x": 45, "y": -50, "z": 0}, "position": {"x": [0, 0.95, 1, 2, 3, 5, 2, 1, 0, 0], "y": [-30, -40, -38, -20, 0, 20, 30, 40, 42], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 5, 6, 10, 10, 8, 4, 0], "height": [0, 5, 5, 6, 10, 10, 8, 5, 0], "texture": [17, 31, 12, 31, 8, 3, 3, 31], "propeller": false, "angle": 0, "laser": {"damage": [35, 35], "rate": 4, "type": 1, "speed": [155, 155], "recoil": 0, "number": 1, "error": 0, "angle": 0}}, "sidetopengines": {"section_segments": 8, "offset": {"x": 50, "y": 70, "z": 28}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-65, -55, -60, -45, -15, 10, 45, 58, 53], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 10, 15, 14, 15, 12, 9, 0], "height": [0, 7, 10, 15, 12, 14, 12, 9, 0], "texture": [4, 17, 63, 3, 4, 10, 3, 17], "propeller": true, "angle": 0}, "sidebottomengines": {"section_segments": 8, "offset": {"x": 65, "y": 60, "z": -28}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-65, -55, -60, -40, 5, 25, 45, 58, 53], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 10, 15, 13, 14, 12, 9, 0], "height": [0, 7, 10, 15, 13, 14, 12, 9, 0], "texture": [4, 17, 4, 11, 31, 2, 4, 17], "propeller": true, "angle": 0}, "sides": {"section_segments": 8, "offset": {"x": 10, "y": -20, "z": 0}, "position": {"x": [-10, -2, 0, 5, 7, 0], "y": [-95, -90, -80, -40, -30, 10], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 20, 20, 0], "height": [0, 15, 22, 26, 21, 0], "propeller": false, "texture": [4, 31, 10, 31, 31, 2, 12]}}, "wings": {"cannonjointop": {"doubleside": true, "offset": {"x": 15, "y": -50, "z": 15}, "length": [32, 25], "width": [50, 60, 20], "angle": [-25, -20], "position": [20, 0, 15], "texture": [18, 63], "bump": {"position": 10, "size": 5}}, "cannonjoinbottom": {"doubleside": true, "offset": {"x": 15, "y": -50, "z": -15}, "length": [32, 25], "width": [50, 60, 20], "angle": [25, 20], "position": [20, 0, 15], "texture": [18, 63], "bump": {"position": 10, "size": 5}}, "enginejointop": {"doubleside": true, "offset": {"x": 15, "y": 55, "z": 5}, "length": [50], "width": [50, 60], "angle": [38], "position": [20, 0], "texture": [63], "bump": {"position": 10, "size": 10}}, "enginejoinbottom": {"doubleside": true, "offset": {"x": 15, "y": 55, "z": 0}, "length": [62], "width": [50, 60], "angle": [-30], "position": [20, 0], "texture": [63], "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "Inertia", "level": 7, "model": 9, "code": 709, "zoom": 1.04, "specs": {"shield": {"capacity": [450, 450], "reload": [12, 12]}, "generator": {"capacity": [220, 220], "reload": [80, 80]}, "ship": {"mass": 550, "speed": [90, 90], "rotation": [45, 45], "acceleration": [45, 45]}}, "shape": [6.9, 6.794, 6.512, 5.968, 6.205, 5.784, 5.094, 4.932, 4.87, 4.618, 4.353, 3.196, 4.106, 4.68, 4.953, 5.125, 5.406, 5.81, 6.453, 7.341, 8.312, 8.368, 8.457, 8.075, 7.207, 6.613, 7.207, 8.075, 8.457, 8.368, 8.312, 7.341, 6.453, 5.81, 5.406, 5.125, 4.953, 4.68, 4.5, 3.196, 4.353, 4.618, 4.87, 4.932, 5.094, 5.784, 6.205, 5.968, 6.512, 6.794], "lasers": [{"x": 2.757, "y": -5.4, "z": 0, "angle": 0, "damage": [40, 40], "rate": 6, "type": 1, "speed": [150, 150], "number": 1, "spread": 0, "error": 0, "recoil": 80}, {"x": -2.757, "y": -5.4, "z": 0, "angle": 0, "damage": [40, 40], "rate": 6, "type": 1, "speed": [150, 150], "number": 1, "spread": 0, "error": 0, "recoil": 80}], "radius": 9.457}}',
                            '{"name": "Sagittarius", "level": 7, "model": 10, "size": 1.6, "zoom": 1.0, "specs": {"shield": {"capacity": [400, 400], "reload": [6, 6]}, "generator": {"capacity": [300, 300], "reload": [60, 60]}, "ship": {"mass": 425, "speed": [80, 80], "rotation": [30, 30], "acceleration": [80, 80]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 45, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-130, -125, -90, -45, 5, 50, 100, 140, 130], "z": [-6, -6, -6, -6, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 12, 20, 22, 35, 45, 30, 25, 0], "height": [0, 6, 15, 15, 18, 22, 24, 20, 0], "texture": [9, 9, 9, 2, 10, 63, 8, 17], "propeller": true}, "propulors": {"section_segments": 8, "offset": {"x": 48, "y": 75, "z": 5}, "position": {"x": [-5, -5, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-105, -95, -50, -10, 30, 100, 140, 130], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 14, 25, 22, 30, 35, 25, 0], "height": [0, 14, 25, 22, 30, 35, 25, 0], "texture": [2, 63, 4, 11, 4, 2, 17], "propeller": true, "angle": 0}, "reinforcements": {"section_segments": 8, "offset": {"x": 100, "y": -115, "z": -30}, "position": {"x": [0, 0, 0, 20, 5, 8], "y": [-100, -93, -70, -20, 35, 100], "z": [-15, -15, -10, 0, 0, 0]}, "width": [0, 10, 14, 18, 13, 0], "height": [0, 10, 14, 15, 13, 0], "texture": [4, 63, 2, 3, 4], "propeller": false, "angle": 45}, "exhausts": {"section_segments": 8, "offset": {"x": 60, "y": 25, "z": -20}, "position": {"x": [0, 0, -5, 0, -10, -10, 0, 10, 10, 20, 20], "y": [-130, -125, -80, -30, -10, 10, 40, 60, 100, 130, 110], "z": [-6, -6, -6, -6, -3, 0, 6, 6, 6, 0, 0]}, "width": [0, 10, 15, 20, 20, 15, 15, 20, 25, 20, 0], "height": [0, 10, 15, 20, 20, 15, 15, 20, 25, 20, 0], "texture": [63, 4, 3, 3, 63, 4, 63, 10, 4, 13], "propeller": false, "angle": 15}, "exhausts2": {"section_segments": 8, "offset": {"x": 70, "y": -15, "z": -40}, "position": {"x": [-5, -5, -10, -10, 0, -8, -4, 8, 10, 20, 20], "y": [-130, -125, -95, -60, -30, 10, 40, 60, 100, 130, 110], "z": [-6, -6, -6, -6, -6, -3, 0, 6, 6, 6, 0, 0]}, "width": [0, 10, 15, 20, 20, 15, 20, 25, 25, 20, 0], "height": [0, 10, 15, 20, 20, 15, 20, 25, 25, 20, 0], "texture": [63, 4, 13, 1, 3, 4, 63, 3, 4, 13], "propeller": false, "angle": 30}, "impulse": {"section_segments": 12, "offset": {"x": 0, "y": -65, "z": -40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-160, -120, -140, -120, -100, -85, -70, -30, 0, 20, 50, 40], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 20, 24, 30, 20, 30, 40, 30, 25, 25, 0], "height": [0, 10, 20, 24, 30, 20, 30, 40, 30, 25, 25, 0], "texture": [6, 18, 13, 4, 63, 63, 8, 4, 4], "propeller": true, "angle": 0, "laser": {"damage": [75, 75], "rate": 2, "type": 1, "speed": [240, 240], "number": 1, "error": 0, "angle": 0, "recoil": 125}}}, "wings": {"topppp": {"offset": {"x": 5, "y": 85, "z": -2}, "length": [60, 60, 80], "width": [100, 90, 60, 20], "angle": [60, 0, -30], "position": [-20, 50, 80, 145], "texture": [3, 11, 3], "doubleside": true, "bump": {"position": 0, "size": 10}}, "main": {"offset": {"x": 0, "y": -15, "z": -35}, "length": [50, 60, 120], "width": [100, 70, 50, 20], "angle": [-40, 0, 30], "position": [-40, 20, 80, 155], "texture": [2, 63, 1], "doubleside": true, "bump": {"position": 0, "size": 10}}, "mainmain": {"offset": {"x": 0, "y": -45, "z": -35}, "length": [50, 60, 70], "width": [100, 70, 40, 20], "angle": [-10, 0, -30], "position": [-20, 20, 70, 100], "texture": [2, 4, 1], "doubleside": true, "bump": {"position": 0, "size": 10}}, "wing": {"offset": {"x": 0, "y": -175, "z": -20}, "length": [120], "width": [60, 20], "angle": [-20], "position": [80, 0], "texture": [63], "doubleside": true, "bump": {"position": 0, "size": 12}}, "lets": {"offset": {"x": 0, "y": -175, "z": -20}, "length": [130], "width": [40, 15], "angle": [-5], "position": [100, 75], "texture": [63], "doubleside": true, "bump": {"position": 0, "size": 12}}}, "typespec": {"name": "Sagittarius", "level": 7, "model": 10, "code": 710, "specs": {"shield": {"capacity": [400, 400], "reload": [6, 6]}, "generator": {"capacity": [200, 200], "reload": [60, 60]}, "ship": {"mass": 450, "speed": [80, 80], "rotation": [30, 30], "acceleration": [80, 80]}}, "shape": [7.2, 6.591, 6.154, 5.938, 6.933, 6.732, 5.953, 5.661, 5.541, 5.676, 5.866, 3.021, 3.342, 4.051, 5.491, 5.82, 5.969, 7.996, 8.057, 6.169, 9.307, 8.58, 7.266, 7.234, 7.004, 5.931, 7.004, 7.234, 7.266, 8.58, 9.307, 6.169, 8.057, 7.996, 5.969, 5.82, 5.491, 4.051, 3.342, 3.021, 5.866, 5.676, 5.541, 5.661, 5.953, 6.732, 6.933, 5.938, 6.154, 6.591], "lasers": [{"x": 0, "y": -7.2, "z": -1.28, "angle": 0, "damage": [60, 60], "rate": 4, "type": 1, "speed": [305, 305], "number": 1, "spread": 0, "error": 0, "recoil": 150}], "radius": 8.307}}',
                            '{"name": "Aries", "level": 7, "model": 11, "size": 3.9, "specs": {"shield": {"capacity": [700, 700], "reload": [11, 11]}, "generator": {"capacity": [180, 180], "reload": [100, 100]}, "ship": {"mass": 700, "speed": [80, 80], "rotation": [30, 30], "acceleration": [95, 95]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": -5, "z": 8}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-60, -40, -30, -15, 0, 15, 25, 45, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 22, 22, 18, 15, 10, 0], "height": [0, 10, 13, 15, 15, 15, 12, 10, 0], "texture": [2, 15, 15, 3, 4, 3, 63, 15]}, "mainlow": {"section_segments": 6, "angle": 0, "offset": {"x": 0, "y": 5, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-100, -95, -80, -70, -10, 10, 60, 70, 85, 90, 85], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 20, 25, 10, 12, 12, 15, 20, 20, 16, 0], "height": [0, 10, 12, 8, 12, 12, 8, 12, 10, 7, 0], "texture": [3.9, 63, 3.9, 3.9, 3.9, 3.9, 3.9, 63, 12.9, 16.9], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 7}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-30, -15, 0, 30, 60], "z": [9, 0, 0, 3, 5]}, "width": [3, 12, 15, 10, 0], "height": [0, 20, 24, 19, 0], "texture": [9, 9, 63, 4]}, "frontjoin": {"section_segments": 6, "angle": 45, "offset": {"x": 8, "y": 0, "z": -3}, "position": {"x": [0, 0, 0, 0], "y": [-60, -55, -40, -30], "z": [0, 0, 0, 0]}, "width": [0, 10, 15, 10], "height": [0, 10, 12, 8], "texture": [3.9, 63, 3.9]}, "arm110": {"section_segments": 6, "angle": 110, "offset": {"x": 10, "y": -10, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [-90, -85, -70, -60, -10], "z": [0, 0, 0, 0, 0]}, "width": [0, 18, 22, 10, 12], "height": [0, 10, 12, 8, 12], "texture": [3.9, 63, 3.9]}, "arm140": {"section_segments": 6, "angle": 140, "offset": {"x": 10, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [-90, -85, -70, -60, -10], "z": [0, 0, 0, 0, 0]}, "width": [0, 18, 22, 10, 12], "height": [0, 10, 12, 8, 12], "texture": [3.9, 63, 3.9]}, "cannon": {"section_segments": 6, "offset": {"x": 0, "y": -68, "z": 0}, "position": {"x": [0, 0, 0], "y": [-28, -30, -20], "z": [0, 0, 0]}, "width": [0, 10, 8], "height": [0, 5, 5], "texture": [5.9], "laser": {"damage": [120, 120], "rate": 2, "type": 1, "speed": [115, 115], "number": 1, "error": 0, "recoil": 150}}, "spike1": {"section_segments": 6, "offset": {"x": 59, "y": 15.5, "z": 9}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-35, -30, -20, 0, 10, 12], "z": [0, 0, 0, 0, -5, -10]}, "width": [0, 3, 5, 7, 6, 0], "height": [0, 3, 5, 7, 6, 0], "texture": [2, 3, 12.9, 3.9], "angle": -120, "laser": {"damage": [15, 15], "rate": 2, "type": 1, "speed": [155, 155], "number": 1, "error": 0, "recoil": 0, "angle": 180}}, "spike2": {"section_segments": 6, "offset": {"x": 40, "y": 58, "z": 11}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-35, -30, -20, 0, 10, 12], "z": [0, 0, 0, 0, -5, -10]}, "width": [0, 3, 5, 7, 6, 0], "height": [0, 3, 5, 7, 6, 0], "texture": [2, 3, 12.9, 3.9], "angle": 215, "laser": {"damage": [15, 15], "rate": 2, "type": 1, "speed": [155, 155], "number": 1, "error": 0, "recoil": 0, "angle": 180}}, "frontside": {"section_segments": 6, "offset": {"x": 38, "y": -35, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -35, -20, 0, 20, 35, 50], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 10, 10, 10, 7, 0], "height": [10, 15, 15, 15, 15, 15, 0], "texture": [2.9, 63, 3.9, 3.9, 63, 2.9], "angle": 18}}, "wings": {"side_joins": {"offset": {"x": 0, "y": 5, "z": 5}, "length": [40, 30], "width": [50, 30, 0], "angle": [30, -10], "position": [0, 0, 50], "texture": [11, 3], "bump": {"position": 10, "size": 20}}}, "typespec": {"name": "Aries", "level": 7, "model": 11, "code": 711, "specs": {"shield": {"capacity": [700, 700], "reload": [11, 11]}, "generator": {"capacity": [180, 180], "reload": [95, 95]}, "ship": {"mass": 700, "speed": [80, 80], "rotation": [30, 30], "acceleration": [95, 95]}}, "shape": [7.659, 7.674, 7.149, 6.467, 6.039, 5.561, 5.132, 4.793, 4.558, 4.415, 4.346, 4.278, 5.332, 5.896, 6.029, 7.427, 5.82, 5.603, 6.593, 6.339, 8.225, 7.32, 6.398, 7.159, 7.488, 7.425, 7.488, 7.159, 6.398, 7.32, 8.225, 6.339, 6.593, 5.603, 5.82, 7.427, 6.029, 5.896, 5.332, 4.278, 4.346, 4.415, 4.558, 4.793, 5.132, 5.561, 6.039, 6.467, 7.149, 7.674], "lasers": [{"x": 0, "y": -7.644, "z": 0, "angle": 0, "damage": [120, 120], "rate": 2, "type": 1, "speed": [115, 115], "number": 1, "spread": 0, "error": 0, "recoil": 150}, {"x": 6.966, "y": 2.574, "z": 0.702, "angle": -120, "damage": [15, 15], "rate": 2, "type": 1, "speed": [155, 155], "number": 1, "spread": 180, "error": 0, "recoil": 0}, {"x": -6.966, "y": 2.574, "z": 0.702, "angle": 120, "damage": [15, 15], "rate": 2, "type": 1, "speed": [155, 155], "number": 1, "spread": 180, "error": 0, "recoil": 0}, {"x": 4.686, "y": 6.76, "z": 0.858, "angle": 215, "damage": [15, 15], "rate": 2, "type": 1, "speed": [155, 155], "number": 1, "spread": 180, "error": 0, "recoil": 0}, {"x": -4.686, "y": 6.76, "z": 0.858, "angle": -215, "damage": [15, 15], "rate": 2, "type": 1, "speed": [155, 155], "number": 1, "spread": 180, "error": 0, "recoil": 0}], "radius": 8.225}}',
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
