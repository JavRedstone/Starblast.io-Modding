/*
    CAPTURE THE FLAG (CTF)
    
    @author JavRedstone
    @version 3.0.0

    Developed in 2025 by JavRedstone
    Poster designed by JavRedstone

    Special thanks to Nanoray (Halycon), EDEN, and 5470p3_ for the continual support in this project, as well as countless others in SChickenMan's Starblast Test Games and my Capture the Flag Discord servers for aiding with testing the mod

    Ship trees picked from Vanilla Revamp (V3), MCST, and CTF v1.5 (Robonuko)
    Ships contributed by ASC-095
*/

// IF YOU DON'T USE CLASS EXPRESSION IT IS NOT MODDING SPACE COMPATIBLE!!!
const Game = class {
    static shipGroups = [];
    shipGroup = null;

    timeouts = [];
    conditions = [];

    shipResetQueue = null;

    ships = [];
    leftShips = [];
    changeTeamShip = null;
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

    isWaiting = true;
    waitTimer = -2;

    isResetting = false;
    roundTime = -1;
    timesUp = false;
    betweenTime = -1;
    numRounds = 0;

    isGameOver = false;

    static C = {
        OPTIONS: {
            ROOT_MODE: '',
            MAP_SIZE: 60,
            MAP: null,
            ASTEROIDS_STRENGTH: 1e6,
            RELEASE_CRYSTAL: false,
            CRYSTAL_DROP: 0.25,
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

            SOUNDTRACK: 'warp_drive.mp3',

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
                { text: "Wait", icon: "\u0048", key: "J" },
                { text: 'Time', icon: "⌛", key: "T" },
                { text: "Follow", icon: "\u0050", key: "F" },
                { text: "Love", icon: "\u0024", key: "L" },
                { text: "Base", icon: "\u0034", key: "B" },
                { text: "Flag", icon: "⚑", key: "I" },
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

            RESET_STAGGER: 5,

            GAME_MANAGER: 30,

            WAIT: 3600 * 0.1, // 3
            ROUND: 3600 * 10,
            BETWEEN: 60 * 10
        },
        IS_TESTING: false,
        IS_DEBUGGING: false,
        IS_SINGLE: false,
        IS_EVENT: false,
        MIN_PLAYERS: 2,
        ROUND_MAX: 5,
        NUM_ROUNDS: 3,
        DISABLED_GAP: 2,
        TEAM_PLAYER_DEFICIT: 2,
        TEAM_SCORE_DEFICIT: 2
    }

    static setShipGroups() {
        Game.shipGroups = [];
        Game.C.OPTIONS.SHIPS = ['{"name":"Invisible","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'];
        for (let group of ShipGroup.C.GROUPS) {
            if (ShipGroup.C.ALLOWED_TIERS.includes(group.TIER)) {
                let shipGroup = new ShipGroup(group.TIER, group.SHIPS);
                Game.shipGroups.push(shipGroup);
                Game.C.OPTIONS.SHIPS.push(...shipGroup.ships);
            }
        }
    }

    constructor() {
        if (Game.C.IS_SINGLE) {
            Game.C.TICKS.ROUND = 3600 * 12;
            Game.C.NUM_ROUNDS = 1;
        }
        if (Game.C.IS_EVENT) {
            Game.C.MIN_PLAYERS = 6;
            Game.C.TICKS.ROUND = 3600 * 12;
            Game.C.NUM_ROUNDS = 5;

            ShipGroup.C.NUM_SHIPS = 7;
        }
        this.shipResetQueue = new StaggeredQueueCreator(Game.C.TICKS.RESET_STAGGER);
        // this.reset();
    }

    tick() {
        this.manageEntities();
        this.manageTimeouts();
        this.manageConditions();
        this.manageQueues();

        this.manageGameState();

        this.manageShips();
        this.spawnAliens();
        this.spawnCollectibles();

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
    }

    reset(newRound = false, resetUIs = false) {
        this.isResetting = true;
        this.deleteEverything();
        this.resetContainers();
        this.timeouts.push(new TimeoutCreator(() => {
            this.selectRandomTeams();
            this.setMap();
            this.setShipGroup();
            this.spawnSpawns();
            this.spawnFlags();
            this.spawnPortals();
            this.timeouts.push(new TimeoutCreator(() => {
                this.resetShips(newRound, resetUIs);
                if (newRound) {
                    this.numRounds++;
                }
            }, Game.C.TICKS.RESET_STAGGER).start());
        }, Game.C.TICKS.RESET_STAGGER).start());
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
        this.changeTeamShip = null;
    }

    setMap() {
        let newMap = Helper.getRandomArrayElement(GameMap.C.MAPS);
        if (Game.C.IS_TESTING) {
            newMap = GameMap.C.TEST_MAPS[1];
        }
        if (this.isWaiting) {
            newMap = GameMap.C.WAITING_MAP
        }
        this.map = new GameMap(newMap.name, newMap.author, newMap.map, newMap.flags, newMap.portals, newMap.spawns, newMap.tiers, newMap.asteroids).spawn();
    }

    setShipGroup() {
        if (this.map) {
            for (let shipGroup of Game.shipGroups) {
                if (this.map.tier == shipGroup.tier) {
                    this.shipGroup = shipGroup;
                    this.shipGroup.chooseShips();
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
                this.portals.push(new Portal(this.map.portals[i]).spawn());
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

    resetShips(newRound = false, resetUIs = false) {
        this.ships = Helper.shuffleArray(this.ships);
        for (let i = 0; i < this.ships.length; i++) {
            let ship = this.ships[i];
            this.shipResetQueue.add(() => {
                this.resetShip(ship, false, newRound, resetUIs);
            });
        }
        this.timeouts.push(new TimeoutCreator(() => {
            this.isResetting = false;
        }, Game.C.TICKS.RESET_STAGGER * (this.ships.length + 1)).start());
    }

    resetShip(ship, fast = false, newRound = false, resetUIs = false) {
        if (!ship) return;

        ship.isResetting = true;

        ship.reset();
        
        ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);

        if (fast) {
            this.resetShipNext(ship, newRound);
        } else {
            ship.timeouts.push(new TimeoutCreator(() => {
                this.resetShipNext(ship, newRound, resetUIs);
            }, Game.C.TICKS.RESET_STAGGER).start());
        }
    }
    
    resetShipNext(ship, newRound = false, resetUIs = false) {
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
        if (this.isWaiting) {
            ship.setPosition(new Vector2(0, 0));
            if (this.shipGroup) {
                ship.chosenType = Helper.getRandomArrayElement(this.shipGroup.chosenTypes);
                ship.setType(ship.chosenType);
                ship.fillUp();
            }
        } else {
            if (this.map && this.map.spawns.length == 2 && ship.team) {
                ship.setPosition(this.map.spawns[ship.team.team])
            }
        }
        if (resetUIs) {
            ship.hideAllUIs();
        } else {
            if (!this.isWaiting) {
                ship.chooseShipTime = game.step;
            }
            ship.portalTime = -1;
        }

        ship.sendUI(UIComponent.C.UIS.LIVES_BLOCKER);
        ship.sendUI(UIComponent.C.UIS.RULES_TOGGLE);
        ship.isResetting = false;
        ship.done = true;
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
        if (this.map) {
            this.map.tick();
        }
        if (game.step % Game.C.TICKS.GAME_MANAGER == 0) {
            if (this.isWaiting) {
                if (this.teams.length == 2 && Math.abs(this.teams[0].ships.length - this.teams[1].ships.length) >= Game.C.TEAM_PLAYER_DEFICIT) {
                    let diff = this.teams[0].ships.length - this.teams[1].ships.length;
                    let t = diff > 0 ? 0 : 1;
                    let randShip = Helper.getRandomArrayElement(this.teams[t].ships);
                    if (randShip) {
                        this.shipResetQueue.add(() => {
                            this.resetShip(randShip, true);
                        });
                    }
                }
            }
            if (this.ships.length < Game.C.MIN_PLAYERS) {
                if (!this.isWaiting || this.waitTimer == -2) {
                    this.isWaiting = true;
                    this.waitTimer = -1;
                    this.reset(false, true);

                    this.logoWaiting = new Obj(
                        Obj.C.OBJS.LOGO_WAITING.id,
                        Obj.C.OBJS.LOGO_WAITING.type,
                        new Vector3(Obj.C.OBJS.LOGO_WAITING.position.x, Obj.C.OBJS.LOGO_WAITING.position.y, Obj.C.OBJS.LOGO_WAITING.position.z),
                        new Vector3(Obj.C.OBJS.LOGO_WAITING.rotation.x, Obj.C.OBJS.LOGO_WAITING.rotation.y, Obj.C.OBJS.LOGO_WAITING.rotation.z),
                        new Vector3(Obj.C.OBJS.LOGO_WAITING.scale.x, Obj.C.OBJS.LOGO_WAITING.scale.y, Obj.C.OBJS.LOGO_WAITING.scale.z),
                        true,
                        false
                    ).update();
                } else if (this.isWaiting && this.waitTimer != -1) {
                    this.waitTimer = -1
                }
            } else if (this.isWaiting && this.waitTimer == -1 || game.step - this.waitTimer < Game.C.TICKS.WAIT) {
                if (this.waitTimer == -1) {
                    this.waitTimer = game.step;
                }
            } else {
                if (this.isWaiting) {
                    this.waitTimer = -1;
                    this.isWaiting = false;
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
                    } else if (this.teams.length == 2) {
                        let diff = this.teams[0].ships.length - this.teams[1].ships.length;
                        if (Math.abs(diff) >= Game.C.TEAM_PLAYER_DEFICIT) {
                            let t = diff > 0 ? 0 : 1;
                            let minScore = this.teams[t].getMinScore();
                            let randShip = Helper.getRandomArrayElement(this.teams[t].ships.filter(ship => !ship.left && ship.ship.alive && ship.ship.type != 101 && !(ship.team && ship.team.flag && ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id) && ship.score == minScore));
                            if (randShip && !this.changeTeamShip) {
                                this.changeTeamShip = randShip;
                                randShip.changeTeamTime = game.step;
                            }
                        }
                        
                        if (this.changeTeamShip) {
                            if (this.changeTeamShip.left || !this.changeTeamShip.ship.alive || this.changeTeamShip.ship.type == 101 || (this.changeTeamShip.team && this.changeTeamShip.team.flag && this.changeTeamShip.team.flagHolder && this.changeTeamShip.team.flagHolder.ship.id == this.changeTeamShip.ship.id) || Math.abs(diff) < Game.C.TEAM_PLAYER_DEFICIT) {
                                this.changeTeamShip.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                this.changeTeamShip.changeTeamTime = -1;
                                this.changeTeamShip = null;
                            }
                            if (this.changeTeamShip) {
                                if (this.changeTeamShip.changeTeamTime != -1 && game.step - this.changeTeamShip.changeTeamTime < Ship.C.SWITCH_SHIP_TIME) {
                                    let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                    let oppTeam = this.getOppTeam(this.changeTeamShip.team);
                                    bottomMessage.components[1].value = `You will be switched to the ${oppTeam.color.toUpperCase()} team in ${Helper.formatTime(Ship.C.SWITCH_SHIP_TIME - (game.step - this.changeTeamShip.changeTeamTime))}.`;
                                    bottomMessage.components[0].fill = '#8B8B0080';
                                    this.changeTeamShip.sendUI(bottomMessage);
                                } else {
                                    let team = this.changeTeamShip.team;
                                    let oppTeam = this.getOppTeam(team);
                                    if (team.flag && team.flagHolder && team.flagHolder.id == this.changeTeamShip.ship.id) {
                                        team.flagHolder = null;
                                        oppTeam.flag.reset();
                                    }
                                    this.shipResetQueue.add(() => {
                                        this.resetShip(this.changeTeamShip, true);

                                        this.changeTeamShip.chosenType = 0;
                                        this.changeTeamShip.chooseShipTime = game.step;
                                        let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                        bottomMessage.components[1].value = `You have been moved to the ${oppTeam.color.toUpperCase()} team due to team player imbalance.`;
                                        bottomMessage.components[0].fill = '#8B008B80';
                                        this.changeTeamShip.sendTimedUI(bottomMessage);

                                        this.changeTeamShip.changeTeamTime = -1;
                                        this.changeTeamShip = null;
                                    });
                                }
                            }
                        }
                    }
                }
    
                if (this.teams.length == 2) {
                    if (this.betweenTime != -1) {
                        this.roundTime = -1;
                        if (game.step - this.betweenTime > Game.C.TICKS.BETWEEN) {
                            this.betweenTime = -1;

                            if (this.numRounds >= Game.C.NUM_ROUNDS) {
                                this.gameOver();
                            }

                            this.teams[0].setScore(0);
                            this.teams[1].setScore(0);
        
                            if (this.numRounds < Game.C.NUM_ROUNDS) {
                                this.reset(true);
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
                            if (game.step - this.teams[i].flagHolder.flagTime > Obj.C.OBJS.FLAG.DROP) {
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
                                if (game.step - this.teams[i].flag.despawn > Obj.C.OBJS.FLAG.DESPAWN) {
                                    this.teams[i].flag.reset();
                                }
                            }
                        }
                    }

                    if (this.map) {
                        if (this.teams[0].flagHolder && this.teams[1].flagHolder) {
                            for (let i = 0; i < this.teams.length; i++) {
                                if (this.teams[i].flag) {
                                    this.teams[i].flag.showWarn();
                                }
                            }
                        } else {
                            for (let i = 0; i < this.teams.length; i++) {
                                if (this.teams[i].flag) {
                                    this.teams[i].flag.hideWarn();
                                }
                            }
                        }
                    }
                }
            }
        }

        if (this.isWaiting) {
            if (this.map && game.step % Obj.C.OBJS.BEACON.SPAWN_RATE == 0) {
                for (let i = 0; i < Obj.C.OBJS.BEACON.SPAWN_AMOUNT; i++) {
                    let randPos = Helper.getRandomArrayElement(this.map.spawnArea);
                    if (randPos.getDistanceTo(new Vector2(0, 0)) > Obj.C.OBJS.BEACON.DISTANCE_FROM_CENTER) {
                        let hsla = Helper.getRandomVividHSLA(100, true);
                        this.beacons.push(new Beacon(randPos, Helper.hslaToHex(hsla.h, hsla.s, hsla.l, hsla.a), true).spawn());
                    }
                }
            }
        } else if (this.betweenTime == -1) {
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
                if (this.changeTeamShip && this.changeTeamShip.ship.id == ship.ship.id) {
                    this.changeTeamShip = null;
                }
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
            if (!this.isWaiting && this.betweenTime == -1) {
                for (let team of this.teams) {
                    team.setDisabledIdxs(this.shipGroup);
                }
            }
            for (let ship of this.ships) {
                if (ship) {
                    if (!ship.done) {
                        this.shipResetQueue.add(() => {
                            this.resetShip(ship);

                            ship.sendTimedUI(UIComponent.C.UIS.LOGO, TimedUI.C.LOGO_TIME);

                            if (!this.isWaiting) {
                                ship.chooseShipTime = game.step;
                            }
                        });
                    }

                    if (this.isWaiting) {
                        ship.sendUI(UIComponent.C.UIS.WAITING_SCOREBOARD);
                        let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                        bottomMessage.components[1].value = "Waiting for players... (" + this.ships.length + "/" + Game.C.MIN_PLAYERS + ")";
                        if (this.waitTimer != -1) {
                            bottomMessage.components[1].value = "Game starts in: " + Helper.formatTime(Game.C.TICKS.WAIT - (game.step - this.waitTimer));
                        }
                        ship.sendUI(bottomMessage);

                        let radarBackground = Helper.deepCopy(UIComponent.C.UIS.RADAR_BACKGROUND);
                        for (let beacon of this.beacons) {
                            radarBackground.components.push({
                                type: "text",
                                position: Helper.getRadarSpotPosition(beacon.beaconPos, new Vector2(20, 20)),
                                value: '⬢',
                                color: beacon.color.substring(0, 7) + '80'
                            });
                        }
                        ship.sendUI(radarBackground);

                        ship.sendUI(UIComponent.C.UIS.CHANGE_SHIP);
                        ship.allowChooseShip = true;

                        ship.setMaxStats();
                    } else if (this.map && !ship.isResetting) {
                        if (ship.chosenType == 0) {
                            if (this.map.spawns.length == 2 && ship.team) {
                                ship.setPosition(this.map.spawns[ship.team.team]);
                            }
                            ship.setVelocity(new Vector2(0, 0));
                            if (ship.ship.type != 101) {
                                ship.setType(101);
                            }
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
                                if (Game.C.IS_SINGLE) {
                                    bottomMessage.components[1].value += 'Good game everyone!';
                                } else {
                                    bottomMessage.components[1].value += `${Game.C.NUM_ROUNDS} rounds have been played!`;
                                }
                            }
                            ship.sendUI(bottomMessage);

                            ship.hideUI(UIComponent.C.UIS.TIMER);
                            ship.hideUI(UIComponent.C.UIS.PORTAL_COOLDOWN);
                        } else {
                            ship.setCollider(true);
                            if (ship.team) {
                                let oppTeam = this.getOppTeam(ship.team);
                                if (ship.team.flag && ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id) {
                                    let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                    bottomMessage.components[1].value = 'Time left for holding the flag: ' + Helper.formatTime((Obj.C.OBJS.FLAG.DROP - (game.step - ship.flagTime)));
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

                                if (this.map && this.map.spawns.length == 2 && ship.team) {
                                    if (this.map.spawns[ship.team.team].getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.SPAWN.CHOOSE_SHIP_DISTANCE) {
                                        ship.sendUI(UIComponent.C.UIS.CHANGE_SHIP);
                                        ship.allowChooseShip = true;
                                    } else {
                                        ship.hideUI(UIComponent.C.UIS.CHANGE_SHIP);
                                        ship.allowChooseShip = false;
                                    }
                                }

                                if (!ship.left && ship.ship.alive && ship.ship.type != 101) {
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
                                    if (!oppTeam.flagHolder && ship.team.flag && ship.team.flagHolder && ship.team.flagHolder.ship.id == ship.ship.id && ship.team.flag.flagStandPos.getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.FLAG.DISTANCE) {
                                        ship.team.flagHolder = null;
                                        oppTeam.flag.reset();

                                        ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                                        ship.setMaxStats();
                                        ship.setHue(ship.team.hue);
                                        ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                        ship.setScore(ship.score + 1);
                                        ship.setTotalScore(ship.totalScore + 1);

                                        ship.team.setScore(ship.team.score + 1);

                                        this.beacons.push(new Beacon(ship.team.flag.flagStandPos, ship.team.hex).spawn());

                                        this.sendNotifications(`${ship.ship.name} has scored a point for the ${ship.team.color.toUpperCase()} team!`, `Will ${oppTeam.color.toUpperCase()} team score next?`, ship.team);
                                    }
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
                                        value: '⚑',
                                        color: this.teams[i].hex
                                    });
                                }

                                let oppTeam = this.getOppTeam(this.teams[i]);
                                if (oppTeam && this.teams[i].flagHolder) {
                                    radarBackground.components.push({
                                        type: 'text',
                                        position: Helper.getRadarSpotPosition(new Vector2(this.teams[i].flagHolder.ship.x, this.teams[i].flagHolder.ship.y), new Vector2(50, 50)),
                                        value: '⚑',
                                        color: oppTeam.hex
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
                                    color: this.teams[i].hex + '40'
                                });
                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(new Vector2(spawn.x, spawn.y), new Vector2(40, 40)),
                                    value: '⬡',
                                    color: this.teams[i].hex
                                });
                            }
                            for (let i = 0; i < this.map.portals.length; i++) {
                                let portal = this.map.portals[i];

                                let portalColor = '#00ff00';
                                if (ship.portalTime != -1 && game.step - ship.portalTime < Ship.C.PORTAL_TIME) {
                                    portalColor = '#808080';
                                }

                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(100, 100)),
                                    value: '⬡',
                                    color: portalColor + '80'
                                });

                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(70, 70)),
                                    value: '⬡',
                                    color: portalColor + '60'
                                });

                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(40, 40)),
                                    value: '⬡',
                                    color: portalColor + '40'
                                });
                                
                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(new Vector2(portal.x, portal.y), new Vector2(20, 20)),
                                    value: '⬡',
                                    color: portalColor + '20'
                                });
                            }
                        }
                        ship.sendUI(radarBackground);

                        let scoreboard = Helper.deepCopy(UIComponent.C.UIS.SCOREBOARD);
                        scoreboard.components[0].fill = this.teams[0].hex + 'BF';
                        scoreboard.components[2].fill = this.teams[1].hex + 'BF';
                        scoreboard.components[1].value = `${this.teams[0].color.toUpperCase()} (${this.teams[0].ships.length}♟)`;
                        if (this.teams[0].color == 'Yellow' || this.teams[0].color == 'Cyan') {
                            scoreboard.components[1].color = '#000000';
                        }
                        scoreboard.components[3].value = `${this.teams[1].color.toUpperCase()} (${this.teams[1].ships.length}♟)`;
                        if (this.teams[1].color == 'Yellow' || this.teams[1].color == 'Cyan') {
                            scoreboard.components[3].color = '#000000';
                        }

                        for (let i = 0; i < this.teams.length; i++) {
                            let team = this.teams[i];
                            if (team.ships) {
                                let players = team.ships.sort((a, b) => b.score - a.score);
                                let flagHolder = team.flagHolder;
                                if (flagHolder) {
                                    Helper.deleteFromArray(players, flagHolder);
                                    players.unshift(flagHolder);
                                }
                                for (let j = 0; j < players.length; j++) {
                                    let player = players[j];
                                    let color = '#ffffff';

                                    let pos = [i * 50, UIComponent.C.UIS.SCOREBOARD.START + UIComponent.C.UIS.SCOREBOARD.HEIGHT * j, 50, UIComponent.C.UIS.SCOREBOARD.HEIGHT];

                                    if (flagHolder && flagHolder.ship.id == player.ship.id) {
                                        if (ship.team && ship.team.team == team.team) {
                                            color = '#00ff00';
                                        } else {
                                            color = '#ff0000';
                                        }

                                        scoreboard.components.push({
                                            type: 'box',
                                            position: pos,
                                            fill: color + '40'
                                        });
                                    }
                                    else if (player.ship.id == ship.ship.id) {
                                        scoreboard.components.push({
                                            type: 'box',
                                            position: pos,
                                            fill: '#ffffff20'
                                        });
                                    }
                                    scoreboard.components.push({
                                        type: 'text',
                                        position: [pos[0] + 1, pos[1] + 0.5, pos[2] - 7.5, pos[3] - 1],
                                        value: '',
                                        color: '#ffffff',
                                        align: 'left'
                                    },
                                    {
                                        type: 'player',
                                        position: [pos[0] + 1, pos[1] + 0.5, pos[2] - 7.5, pos[3] - 1],
                                        id: player.ship.id,
                                        color: color,
                                        align: 'left'
                                    },
                                    {
                                        type: 'text',
                                        position: [pos[0], pos[1] + 0.5, pos[2] - 1, pos[3] - 1],
                                        value: `${flagHolder && flagHolder.ship.id == player.ship.id ? '⚑ ' : ''}${player.score}`,
                                        color: color,
                                        align: 'right'
                                    });
                                }
                            }
                        }

                        ship.sendUI(scoreboard);

                        if (ship.team && !ship.hasUI(UIComponent.C.UIS.LOGO) && this.teams) {
                            let topMessage = Helper.deepCopy(UIComponent.C.UIS.TOP_MESSAGE);
                            if (!Game.C.IS_SINGLE) {
                                topMessage.components[1].value = `Round ${this.numRounds} of ${Game.C.NUM_ROUNDS}`;
                            }
                            let oppTeam = this.getOppTeam(ship.team);
                            if (oppTeam && oppTeam.flagHolder) {
                                topMessage.components[1].value = `Your flag is stolen. Kill the enemy flag carrier to be able to score!`;
                                topMessage.components[0].fill = '#8B000080';
                            }

                            if ((Game.C.IS_SINGLE && oppTeam && oppTeam.flagHolder) || !Game.C.IS_SINGLE) {
                                ship.sendUI(topMessage);
                            } else {
                                ship.hideUI(topMessage);
                            }

                            let roundScores = Helper.deepCopy(UIComponent.C.UIS.ROUND_SCORES);
                            let winningTeam = this.getWinningTeam();
                            if (winningTeam == null) {
                                roundScores.components[0].value = 'TIE';
                                roundScores.components[0].color = '#ffffff';
                            }
                            else {
                                roundScores.components[0].value = winningTeam.color.toUpperCase();
                                roundScores.components[0].color = winningTeam.hex;
                            }
                            if (this.teams[0].flagHolder) {
                                roundScores.components[1].value = '⚑';
                                roundScores.components[1].color = this.teams[0].hex;
                            }
                            if (this.teams[1].flagHolder) {
                                roundScores.components[5].value = '⚑';
                                roundScores.components[5].color = this.teams[1].hex;
                            }
                            roundScores.components[2].value = this.teams[0].score;
                            roundScores.components[2].color = this.teams[0].hex;
                            roundScores.components[4].value = this.teams[1].score;
                            roundScores.components[4].color = this.teams[1].hex;
                            roundScores = UIComponent.addTextShadow(roundScores, '#2C2C2C', 0, 0.04, true);
                            ship.sendUI(roundScores);

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

                    let mapAuthor = Helper.deepCopy(UIComponent.C.UIS.MAP_AUTHOR);
                    if (this.map) {
                        mapAuthor.components[2].value += this.map.name + " by " + this.map.author;
                        ship.sendUI(mapAuthor);
                    } else {
                        ship.hideUI(mapAuthor);
                    }

                    if (this.betweenTime != -1) {
                        ship.chooseShipTime = -1;
                    }
                    if (ship.ship.alive && ship.chooseShipTime != -1 && game.step - ship.chooseShipTime < Ship.C.CHOOSE_SHIP_TIME) {
                        if (!ship.loadingChooseShip) {
                            if (!ship.choosingShip && !ship.loadingChooseShip) {
                                ship.loadingChooseShip = true;
                            }
                            ship.choosingShip = true;

                            if (this.map && this.map.spawns.length == 2 && ship.team) {
                                if (this.map.spawns[ship.team.team].getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) >= Obj.C.OBJS.SPAWN.CHOOSE_SHIP_DISTANCE) {
                                    ship.chooseShipTime = -1;
                                }
                            }

                            for (let i = 0; i < ShipGroup.C.NUM_SHIPS; i++) {
                                let isDisabled = false;
                                if (ship.team && !this.isWaiting) {
                                    isDisabled = ship.team.disabledIdxs.includes(i);
                                }
                                let chooseShip = Helper.deepCopy(UIComponent.C.UIS.CHOOSE_SHIP);
                                chooseShip.clickable = !isDisabled;
                                chooseShip.shortcut = isDisabled ? '' : `${i + 1}`;
                                chooseShip.id += '-' + i;
                                let separation = 100 / (ShipGroup.C.NUM_SHIPS * 9/5);
                                let width = separation * 9 / 10;
                                let start = (100 - (separation * (ShipGroup.C.NUM_SHIPS - 1) + width)) / 2;
                                chooseShip.position[0] = start + separation * i;
                                chooseShip.position[2] = width;
                                let opacity = 'BF';
                                let disabledOpacity = '80';
                                const colorPalette = [
                                    { fill: '#e74c3c', accent: '#c0392b' },   // Red
                                    { fill: '#27ae60', accent: '#145a32' },   // Green
                                    { fill: '#2980b9', accent: '#154360' },   // Blue
                                    { fill: '#f1c40f', accent: '#b7950b' },   // Yellow
                                    { fill: '#9b59b6', accent: '#512e5f' },   // Purple
                                    { fill: '#e67e22', accent: '#784212' },   // Orange
                                    { fill: '#16a085', accent: '#0e6251' },   // Teal
                                    { fill: '#34495e', accent: '#212f3c' },   // Navy
                                    { fill: '#fd79a8', accent: '#6c3483' },   // Pink
                                    { fill: '#95a5a6', accent: '#566573' }    // Gray
                                ];
                                const palette = colorPalette[i % colorPalette.length];
                                chooseShip.components[0].fill = palette.fill + opacity;
                                chooseShip.components[2].fill = palette.accent + opacity;
                                if (isDisabled) {
                                    chooseShip.components[0].fill = '#8B8B8B' + disabledOpacity;
                                    chooseShip.components[2].fill = '#222222' + disabledOpacity;

                                    for (let component of chooseShip.components) {
                                        if (component.type == 'text') {
                                            if (component.color.length == 9) {
                                                component.color = component.color.substring(0, 7) + '60';
                                            } else if (component.color.length == 7) {
                                                component.color += '80';
                                            }
                                        } else if (component.type == 'box' && component.position[3] == 0) {
                                            component.fill += '80';
                                        }
                                    }
                                }
                                chooseShip.components[1].value = i + 1;
                                chooseShip.components[5].value = this.shipGroup.chosenNames[i];
                                chooseShip.components[8].value = this.shipGroup.chosenOrigins[i];
                                if (ship.loadingChooseShip) {
                                    let distFromMiddle = Math.abs(i - Math.round((ShipGroup.C.NUM_SHIPS - 1) / 2));
                                    ship.timeouts.push(new TimeoutCreator(() => {
                                        ship.sendUI(chooseShip);
                                        if (i == ShipGroup.C.NUM_SHIPS - 1) {
                                            ship.loadingChooseShip = false;
                                        }
                                    }, distFromMiddle * Ship.C.CHOOSE_SHIP_ANIMATION_TIME).start());
                                } else {
                                    ship.sendUI(chooseShip);
                                }
                            }
                        }

                        let chooseShipTime = Helper.deepCopy(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                        chooseShipTime.components[1].value = Helper.formatTime(ship.chooseShipTime - (game.step - Ship.C.CHOOSE_SHIP_TIME));
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
                        if (ship.choosingShip && !ship.loadingChooseShip) {
                            if (ship.chosenType == 0 && this.map && this.map.spawns.length == 2 && ship.team) {
                                this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                            }

                            if (ship.chosenType == 0) {
                                if (!ship.team || this.isWaiting) {
                                    ship.chosenType = Helper.getRandomArrayElement(this.shipGroup.chosenTypes);
                                } else {
                                    ship.chosenType = Helper.getRandomArrayElement(this.shipGroup.chosenTypes.filter((type, idx) => !ship.team.disabledIdxs.includes(idx)));
                                }
                                ship.setType(ship.chosenType);
                                ship.fillUp();
                                ship.setInvulnerable(Ship.C.INVULNERABLE_TIME);
                            }
                            ship.setMaxStats();
                            ship.setCollider(true);
                            ship.hideUIsIncludingID(UIComponent.C.UIS.CHOOSE_SHIP);
                            ship.hideUI(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                            ship.choosingShip = false;
                            ship.chooseShipTime = -1;
                        }
                    }

                    if (ship.instructionsStep != -1) {
                        let instructions = Helper.deepCopy(UIComponent.C.UIS.RULES);
                        instructions.components[1].value = Ship.C.RULES[ship.instructionsStep];
                        instructions.components[2].position[2] = 100 * (ship.instructionsStep + 1) / Ship.C.RULES.length;
                        ship.sendUI(instructions);
                        let instructionsNext = Helper.deepCopy(UIComponent.C.UIS.RULES_NEXT);
                        ship.sendUI(instructionsNext);
                    }
                }
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                if (!this.isResetting && !this.isWaiting && this.betweenTime == -1 && !ship.left && ship.ship.alive && ship.ship.type != 101) {
                    for (let portal of this.portals) {
                        this.suckPortalShip(ship, portal.portal, portal.gravityWell);
                    }
                }
                ship.tick();
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
                    this.beacons.push(new Beacon(spawnPos, '#00ff00').spawn());
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
                    Helper.adjustBrightness(hex, 0.5)
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
            if (this.isWaiting) {
                ship.setPosition(new Vector2(0, 0));
                ship.fillUp();
            } else {
                if (this.map && this.map.spawns.length == 2 && ship.team) {
                    ship.setPosition(this.map.spawns[ship.team.team]);
                    if (ship.chosenType != 0) {
                        this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                    } else {
                        ship.chooseShipTime = game.step;
                    }
                }
                ship.setVelocity(new Vector2(0, 0));
                ship.fillUp();
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
            if (ship.hiddenUIIDs.has(id)) {
                return;
            }
            if (id.includes(UIComponent.C.UIS.CHOOSE_SHIP.id)) {
                if (ship.allowChooseShip && ship.choosingShip) {
                    if (ship.chosenType == 0 && this.map && this.map.spawns.length == 2 && ship.team) {
                        this.spawnShipBeacon(this.map.spawns[ship.team.team], ship.team.hex);
                    }

                    let chooseShipIdx = parseInt(id.split('-')[1]);
                    if (ship.team && !ship.team.disabledIdxs.includes(chooseShipIdx)) {
                        ship.team.setDisabledIdxs(this.shipGroup);

                        let chosenType = this.shipGroup.chosenTypes[chooseShipIdx];
                        
                        ship.setType(chosenType);
                        if (ship.chosenType == 0) {
                            ship.fillUp();
                            ship.setInvulnerable(Ship.C.INVULNERABLE_TIME)
                        }
                        ship.chosenType = chosenType;
                        ship.setMaxStats();
                        ship.setCollider(true);
                        ship.chooseShipTime = -1;
                    }
                }
            }
            if (id == UIComponent.C.UIS.CHANGE_SHIP.id) {
                if (ship.allowChooseShip) {
                    ship.chooseShipTime = ship.chooseShipTime == -1 ? game.step : -1;
                }
            }
            if (id == UIComponent.C.UIS.RULES_TOGGLE.id) {
                ship.instructionsStep = ship.instructionsStep == -1 ? 0 : -1;
                if (ship.instructionsStep == -1) {
                    ship.hideUI(UIComponent.C.UIS.RULES);
                    ship.hideUI(UIComponent.C.UIS.RULES_NEXT);
                }
            }
            if (id == UIComponent.C.UIS.RULES_NEXT.id) {
                ship.instructionsStep++;
                if (ship.instructionsStep >= Ship.C.RULES.length) {
                    ship.instructionsStep = -1;
                    ship.hideUI(UIComponent.C.UIS.RULES);
                    ship.hideUI(UIComponent.C.UIS.RULES_NEXT);
                }
            }
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {

    }
}

const Team = class {
    team = 0;
    color = '';
    hex = 0;
    hue = 0;
    flagged = 0;

    score = 0;

    ships = [];

    disabledIdxs = [];

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
                    FLAGGED: 60
                },
                {
                    TEAM: 1,
                    COLOR: 'Blue',
                    HEX: '#0000ff',
                    HUE: 240,
                    FLAGGED: 180
                }
            ],
        ]
    }

    constructor(team, color, hex, hue, flagged) {
        this.team = team;
        this.color = color;
        this.hex = hex;
        this.hue = hue;
        this.flagged = flagged;
    }

    setDisabledIdxs(shipGroup) {
        this.disabledIdxs = [];
        let chosenTypeFreqs = Array(shipGroup.chosenTypes.length).fill(0);
        for (let ship of this.ships) {
            if (ship.chosenType != 0 && shipGroup) {
                let idx = shipGroup.chosenTypes.indexOf(ship.chosenType);
                if (idx != -1) {
                    chosenTypeFreqs[idx]++;
                }
            }
        }
        let maxFreq = Math.max(...chosenTypeFreqs);
        let remaining = chosenTypeFreqs.filter((freq, idx) => freq != maxFreq);
        if (remaining.length > 0) {
            let nextHighest = Math.max(...remaining);
            if (maxFreq - nextHighest >= Game.C.DISABLED_GAP) {
                for (let i = 0; i < chosenTypeFreqs.length; i++) {
                    if (chosenTypeFreqs[i] == maxFreq) {
                        this.disabledIdxs.push(i);
                    }
                }
            }
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

    getMinScore() {
        let minScore = Infinity;
        for (let ship of this.ships) {
            if (ship.score < minScore) {
                minScore = ship.score;
            }
        }
        return minScore;
    }

    getMaxScore() {
        let maxScore = 0;
        for (let ship of this.ships) {
            if (ship.score > maxScore) {
                maxScore = ship.score;
            }
        }
        return maxScore;
    }
}

const Ship = class {
    team = null;
    ship = null;

    timeouts = [];
    conditions = [];

    allUIs = [];
    timedUIs = [];
    hiddenUIIDs = new Set();

    left = false;
    done = false;

    instructionsStep = -1

    chosenType = 0;

    score = 0;
    totalScore = 0;

    chooseShipTime = -1;
    allowChooseShip = false;
    choosingShip = false;
    loadingChooseShip = false;

    flagTime = -1;

    portalTime = -1;

    changeTeamTime = -1;

    isResetting = false;

    static C = {
        INVULNERABLE_TIME: 180,
        CHOOSE_SHIP_TIME: 600,
        CHOOSE_SHIP_ANIMATION_TIME: 10,
        CHOOSE_SHIP_TIMEOUT: 15,
        PORTAL_TIME: 3600,
        SWITCH_SHIP_TIME: 300,
        RULES: [
            'Choose from 5 randomly selected ships on the spawn hexagon.',
            'Capture the enemy flag and bring it back to win points.',
            (Game.C.IS_SINGLE ? `Scoring ${Game.C.ROUND_MAX} points causes your team to win.` : `Scoring ${Game.C.ROUND_MAX} points causes your team to win the round. There are ${Game.C.IS_EVENT ? 5 : Game.C.NUM_ROUNDS} rounds.`),
            'If both teams have a flagholder, you must kill the enemy flagholder to be able to score.',
            'Teleport using the green hexagonal portals.',
            'Use collectibles to your advantage.',
            'Good luck and have fun!'
        ]
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
        this.allowChooseShip = false;
        this.loadingChooseShip = false;
        this.chooseShipTime = -1;
        this.chosenType = 0;
        this.score = 0;

        this.flagTime = -1;
        this.portalTime = -1;

        this.changeTeamTime = -1;

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
            if (!(removedUIs.length == 1 && Helper.areObjectsEqual(removedUIs[0], cUI))) {
                this.ship.setUIComponent(cUI);

                if (hideMode) {
                    this.hiddenUIIDs.add(cUI.id);
                } else {
                    this.hiddenUIIDs.delete(cUI.id);
                }
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
                return 640; // 20
            case 2:
                return 1280; // 80
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
            if (Game.C.IS_SINGLE) {
                let winningTeam = g.getWinningTeam();
                this.ship.gameover({
                    "Good game!": "Thanks for playing!",
                    "Flags Captured": this.totalScore,
                    "Team Played": this.team.color,
                    "Team Score": this.team.score,
                    "Team Won": winningTeam ? winningTeam.color : "It was a tie!",
                });
            } else {
                this.ship.gameover({
                    "Good game!": "Thanks for playing!",
                    "Flags Captured": this.totalScore
                });
            }
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

const Flag = class {
    flagPos = null;
    flag = null;
    flagHidden = false;
    flagStandPos = null;
    flagStand = null;
    flagStandGlow = null;
    warningRule = null;
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
        this.flagStandGlow = new Obj(
            Obj.C.OBJS.FLAGSTAND_GLOW.id,
            Obj.C.OBJS.FLAGSTAND_GLOW.type,
            new Vector3(this.flagStandPos.x, this.flagStandPos.y, Obj.C.OBJS.FLAGSTAND_GLOW.position.z),
            new Vector3(Obj.C.OBJS.FLAGSTAND_GLOW.rotation.x, Obj.C.OBJS.FLAGSTAND_GLOW.rotation.y, Obj.C.OBJS.FLAGSTAND_GLOW.rotation.z),
            new Vector3(Obj.C.OBJS.FLAGSTAND_GLOW.scale.x, Obj.C.OBJS.FLAGSTAND_GLOW.scale.y, Obj.C.OBJS.FLAGSTAND_GLOW.scale.z),
            true,
            true,
            this.color
        ).update();
        this.warningRule = new Obj(
            Obj.C.OBJS.WARNING_RULE.id,
            Obj.C.OBJS.WARNING_RULE.type,
            new Vector3(this.flagStandPos.x + Obj.C.OBJS.WARNING_RULE.position.x, this.flagStandPos.y + Obj.C.OBJS.WARNING_RULE.position.y, Obj.C.OBJS.WARNING_RULE.position.z),
            new Vector3(Obj.C.OBJS.WARNING_RULE.rotation.x, Obj.C.OBJS.WARNING_RULE.rotation.y, Obj.C.OBJS.WARNING_RULE.rotation.z),
            new Vector3(Obj.C.OBJS.WARNING_RULE.scale.x, Obj.C.OBJS.WARNING_RULE.scale.y, Obj.C.OBJS.WARNING_RULE.scale.z),
            true,
            false
        ).hide();
        return this;
    }

    hide() {
        if (this.flag) {
            this.flag.hide();
            this.flagHidden = true;
        }
    }

    show() {
        if (this.flag) {
            this.flag.show();
            this.flagHidden = false;
        }
    }

    showWarn() {
        if (this.warningRule && this.flagStandGlow) {
            this.warningRule.show();
            this.flagStandGlow.hide();
        }
    }

    hideWarn() {
        if (this.warningRule && this.flagStandGlow) {
            this.warningRule.hide();
            this.flagStandGlow.show();
        }
    }

    setPosition(position) {
        if (this.flag) {
            this.flagPos = position.clone();
            this.flag.setPosition(position);
        }
    }

    reset() {
        if (this.flag) {
            this.flagPos = this.flagStandPos.clone();
            this.flag.setPosition(this.flagPos);
            this.despawn = -1;
            this.show();
        }
    }

    isAtStand() {
        return this.flagPos.equals(this.flagStandPos);
    }

    destroySelf() {
        if (this.flag) {
            this.flag.destroySelf();
        }
        if (this.flagStand) {
            this.flagStand.destroySelf();
        }
        if (this.flagStandGlow) {
            this.flagStandGlow.destroySelf();
        }
        if (this.warningRule) {
            this.warningRule.destroySelf();
        }
    }
}

const Portal = class {
    portalPos = null;
    portal = null;
    portalGlow = null;
    portalRimGlow = null;
    gravityWell = null;

    constructor(portalPos) {
        this.portalPos = portalPos;
    }

    spawn() {
        this.portal = new Obj(
            Obj.C.OBJS.PORTAL.id,
            Obj.C.OBJS.PORTAL.type,
            new Vector3(this.portalPos.x, this.portalPos.y, Obj.C.OBJS.PORTAL.position.z),
            new Vector3(Obj.C.OBJS.PORTAL.rotation.x, Obj.C.OBJS.PORTAL.rotation.y, Obj.C.OBJS.PORTAL.rotation.z),
            new Vector3(Obj.C.OBJS.PORTAL.scale.x, Obj.C.OBJS.PORTAL.scale.y, Obj.C.OBJS.PORTAL.scale.z),
            true,
            true,
            '#00ff00'
        ).update();
        this.portalGlow = new Obj(
            Obj.C.OBJS.PORTAL_GLOW.id,
            Obj.C.OBJS.PORTAL_GLOW.type,
            new Vector3(this.portalPos.x, this.portalPos.y, Obj.C.OBJS.PORTAL_GLOW.position.z),
            new Vector3(Obj.C.OBJS.PORTAL_GLOW.rotation.x, Obj.C.OBJS.PORTAL_GLOW.rotation.y, Obj.C.OBJS.PORTAL_GLOW.rotation.z),
            new Vector3(Obj.C.OBJS.PORTAL_GLOW.scale.x, Obj.C.OBJS.PORTAL_GLOW.scale.y, Obj.C.OBJS.PORTAL_GLOW.scale.z),
            true,
            true,
            '#00ff00'
        ).update();
        this.portalRimGlow = new Obj(
            Obj.C.OBJS.PORTAL_RIM_GLOW.id,
            Obj.C.OBJS.PORTAL_RIM_GLOW.type,
            new Vector3(this.portalPos.x, this.portalPos.y, Obj.C.OBJS.PORTAL_RIM_GLOW.position.z),
            new Vector3(Obj.C.OBJS.PORTAL_RIM_GLOW.rotation.x, Obj.C.OBJS.PORTAL_RIM_GLOW.rotation.y, Obj.C.OBJS.PORTAL_RIM_GLOW.rotation.z),
            new Vector3(Obj.C.OBJS.PORTAL_RIM_GLOW.scale.x, Obj.C.OBJS.PORTAL_RIM_GLOW.scale.y, Obj.C.OBJS.PORTAL_RIM_GLOW.scale.z),
            true,
            true,
            '#00ff00'
        ).update();
        this.gravityWell = new Obj(
            Obj.C.OBJS.GRAVITY_WELL.id,
            Obj.C.OBJS.GRAVITY_WELL.type,
            new Vector3(this.portalPos.x, this.portalPos.y, Obj.C.OBJS.GRAVITY_WELL.position.z),
            new Vector3(Obj.C.OBJS.GRAVITY_WELL.rotation.x, Obj.C.OBJS.GRAVITY_WELL.rotation.y, Obj.C.OBJS.GRAVITY_WELL.rotation.z),
            new Vector3(Obj.C.OBJS.GRAVITY_WELL.scale.x, Obj.C.OBJS.GRAVITY_WELL.scale.y, Obj.C.OBJS.GRAVITY_WELL.scale.z),
            true,
            true,
            '#00ff00'
        ).update();
        return this;
    }

    destroySelf() {
        if (this.portal) {
            this.portal.destroySelf();
        }
        if (this.portalGlow) {
            this.portalGlow.destroySelf();
        }
        if (this.portalRimGlow) {
            this.portalRimGlow.destroySelf();
        }
        if (this.gravityWell) {
            this.gravityWell.destroySelf();
        }
    }
}

const Beacon = class {
    beaconPos = null;
    color = '';
    beacon = null;
    beaconGlow = null;
    glow = false;

    running = false;

    constructor(beaconPos, color, glow = false) {
        this.beaconPos = beaconPos;
        this.color = color;
        this.glow = glow;
    }

    spawn() {
        this.beacon = new TimedObj(new Obj(
            Obj.C.OBJS.BEACON.id,
            Obj.C.OBJS.BEACON.type,
            new Vector3(this.beaconPos.x, this.beaconPos.y, Obj.C.OBJS.BEACON.position.z),
            new Vector3(Obj.C.OBJS.BEACON.rotation.x, Obj.C.OBJS.BEACON.rotation.y, Obj.C.OBJS.BEACON.rotation.z),
            new Vector3(Obj.C.OBJS.BEACON.scale.x, Obj.C.OBJS.BEACON.scale.y, Obj.C.OBJS.BEACON.scale.z),
            true,
            true,
            this.color
        ), Obj.C.OBJS.BEACON.EXISTENCE_TIME).spawn();
        if (this.glow) {
            this.beaconGlow = new TimedObj(new Obj(
                Obj.C.OBJS.BEACON_GLOW.id,
                Obj.C.OBJS.BEACON_GLOW.type,
                new Vector3(this.beaconPos.x, this.beaconPos.y, Obj.C.OBJS.BEACON_GLOW.position.z),
                new Vector3(Obj.C.OBJS.BEACON_GLOW.rotation.x, Obj.C.OBJS.BEACON_GLOW.rotation.y, Obj.C.OBJS.BEACON_GLOW.rotation.z),
                new Vector3(Obj.C.OBJS.BEACON_GLOW.scale.x, Obj.C.OBJS.BEACON_GLOW.scale.y, Obj.C.OBJS.BEACON_GLOW.scale.z),
                true,
                true,
                this.color
            ), Obj.C.OBJS.BEACON.EXISTENCE_TIME).spawn();
        }

        this.running = true;
        return this;
    }

    tick() {
        if (this.running) {
            if (this.beacon) {
                if (!this.beacon.running) {
                this.running = false;
                this.destroySelf();
                }
                this.beacon.tick();
            }
            if (this.beaconGlow) {
                if (!this.beaconGlow.running) {
                    this.running = false;
                    this.destroySelf();
                }
                this.beaconGlow.tick();
            }
        }
    }

    destroySelf() {
        if (this.beacon) {
            this.beacon.destroySelf();
        }
        if (this.beaconGlow) {
            this.beaconGlow.destroySelf();
        }
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
            LOGO_WAITING: {
                id: 'logo_waiting',
                position: {
                    x: 0,
                    y: 0,
                    z: -30
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 120,
                    y: 120,
                    z: 0
                },
                type: {
                    id: 'logo_waiting',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/logo_waiting.png',
                }
            },
            WARNING_RULE: {
                id: 'warning_rule',
                position: {
                    x: 0,
                    y: 0,
                    z: 5
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 50,
                    y: 50,
                    z: 0
                },
                type: {
                    id: 'warning_rule',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/warning_rule.png',
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
            SPAWN: {
                id: 'spawn',
                position: {
                    x: 0,
                    y: 0,
                    z: -7
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 52.5,
                    y: 52.5,
                    z: 52.5
                },
                type: {
                    id: 'spawn',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/spawn.png',
                },
                CHOOSE_SHIP_DISTANCE: 7.5
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
                DISTANCE: 8,
                DESPAWN: 1800,
                DROP: 3600
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
                    z: Math.PI / 6
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
                N_GON_OFFSET: Math.PI / 6,
            },
            FLAGSTAND_GLOW: {
                id: 'flagstand_glow',
                position: {
                    x: 0,
                    y: 0,
                    z: -7
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 120,
                    y: 120,
                    z: 1
                },
                type: {
                    id: 'flagstand_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/flagstand_glow.png',
                }
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
                TELEPORT_FACTOR: 0.5
            },
            PORTAL_GLOW: {
                id: 'portal_glow',
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
                    x: 43,
                    y: 43,
                    z: 43
                },
                type: {
                    id: 'portal_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/portal_glow.png',
                }
            },
            PORTAL_RIM_GLOW: {
                id: 'portal_rim_glow',
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
                    x: 90,
                    y: 90,
                    z: 90
                },
                type: {
                    id: 'portal_rim_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/portal_rim_glow.png',
                }
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
                    x: 20,
                    y: 20,
                    z: 20
                },
                type: {
                    id: 'gravity',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/gravity.obj',
                    transparent: false
                },
                MAX_VELOCITY: 1,
                VELOCITY_FACTOR: 0.5,
                INTENSITY: 0.5,
                SUCK_FACTOR: 2
            },
            SHIP_BEACON: {
                id: 'ship_beacon',
                position: {
                    x: 0,
                    y: 0,
                    z: 5
                },
                rotation: {
                    x: Math.PI / 2,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 7.5,
                    y: 24,
                    z: 7.5
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
                    y: 1e3,
                    z: 1
                },
                type: {
                    id: 'beacon',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/beacon.obj',
                    transparent: false
                },
                EXISTENCE_TIME: 300,
                SPAWN_RATE: 30,
                SPAWN_AMOUNT: 1,
                DISTANCE_FROM_CENTER: 60
            },
            BEACON_GLOW: {
                id: 'beacon_glow',
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
                    x: 20,
                    y: 20,
                    z: 20
                },
                type: {
                    id: 'beacon_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v3.0/beacon_glow.png',
                }
            },
            LASER: {
                id: 'laser',
                position: {
                    x: 0,
                    y: 0,
                    z: -3.4
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 0.2,
                    y: 0.2,
                    z: 0.2
                },
                type: {
                    id: 'laser',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/laser.obj',
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
        return this;
    }

    show() {
        this.obj.position.z = this.originalObj.position.z;
        this.obj.scale.x = this.originalObj.scale.x;
        this.obj.scale.y = this.originalObj.scale.y;
        this.obj.scale.z = this.originalObj.scale.z;
        this.update();
        return this;
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
                    {
                        type: 'box',
                        position: [0, 0, 50, 8],
                        fill: '#ffffff'
                    },
                    {
                        type: 'text',
                        position: [0, 0, 50, 8],
                        color: '#ffffff',
                    },
                    {
                        type: 'box',
                        position: [50, 0, 50, 8],
                        fill: '#ffffff'
                    },
                    {
                        type: 'text',
                        position: [50, 0, 50, 8],
                        color: '#ffffff',
                    }
                ],
                START: 8,
                HEIGHT: 6
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
                        fill: "#FFBBBB"
                    },
                    {
                        type: "box",
                        position: [48.5, 5, 3, 35],
                        fill: "#BBBBFF"
                    },
                    {
                        type: "box",
                        position: [52.5, 5, 3, 35],
                        fill: "#BBFFBB"
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
                        value: "⚑ Capture The Flag ⚑",
                        color: "#ffffff"
                    },
                    {
                        type: "text",
                        position: [30, 62.5, 40, 15],
                        value: "Version 3.0",
                        color: "#00ff00"
                    },
                    {
                        type: "text",
                        position: [30, 80, 40, 15],
                        value: "Developed by JavRedstone",
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
                        position: [5, 5, 90, 5],
                        value: "Waiting for players...",
                        color: "#ffffff80"
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
                        position: [2.5, 5, 95, 50],
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
            RULES_TOGGLE: {
                id: "rules_toggle",
                position: [0, 90, 5, 5],
                clickable: true,
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#00d5ff80",
                    },
                    {
                        type: "text",
                        position: [5, 0, 90, 100],
                        value: "Rules",
                        color: "#ffffff"
                    }
                ]
            },
            RULES: {
                id: "rules",
                position: [20, 90, 55, 5],
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#00d5ff80",
                    },
                    {
                        type: "text",
                        position: [5, 5, 90, 90],
                        value: "",
                        color: "#ffffff"
                    },
                    {
                        type: "box",
                        position: [0, 90, 0, 10],
                        fill: "#ffffff"
                    }
                ]
            },
            RULES_NEXT: {
                id: "rules_next",
                position: [75, 90, 5, 5],
                clickable: true,
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#00000080",
                    },
                    {
                        type: "text",
                        position: [5, 5, 90, 90],
                        value: ">",
                        color: "#ffffff"
                    }
                ]
            },
            CHANGE_SHIP: {
                id: "change_ship",
                position: [2, 40, 15, 5],
                clickable: true,
                shortcut: '0',
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
                        value: "Change Ship [0]",
                        color: "#00ff00"
                    }
                ]
            },
            CHOOSE_SHIP: {
                id: "choose_ship",
                position: [0, 30, 15, 30],
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
                        value: "NAME",
                        color: "#ffffff80"
                    },
                    {
                        type: "box",
                        position: [10, 41, 80, 0],
                        stroke: "#ffffff80",
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
                        value: "TREE",
                        color: "#ffffff80"
                    },
                    {
                        type: "box",
                        position: [10, 81, 80, 0],
                        stroke: "#ffffff80",
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
                position: [40, 65, 20, 10],
                visible: true,
                components: [
                    {
                        type: "box",
                        position: [0, 0, 100, 100],
                        fill: "#00000080",
                    },
                    {
                        type: "text",
                        position: [0, 0, 100, 100],
                        color: "#ffffff"
                    }
                ]
            },
            ROUND_SCORES: {
                id: "round_scores",
                position: [35, 5, 30, 15],
                visible: true,
                components: [
                    {
                        type: "text",
                        position: [0, 10, 100, 20],
                    },
                    {
                        type: "text",
                        position: [10, 0, 10, 100],
                        value: "",
                        align: "right"
                    },
                    {
                        type: "text",
                        position: [20, 0, 20, 100],
                        align: "right"
                    },
                    {
                        type: "text",
                        position: [40, 0, 20, 100],
                        value: "-",
                        color: "#ffffff"
                    },
                    {
                        type: "text",
                        position: [60, 0, 20, 100],
                        align: "left"
                    },
                    {
                        type: "text",
                        position: [80, 0, 10, 100],
                        value: "",
                        align: "left"
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
    spawnArea = [];
    gridObjs = [];
    flags = [];
    portals = [];
    spawns = [];
    tiers = [];
    asteroidPaths = [];

    tier = 0;

    static C = {
        FILL_IN: true,
        WAITING_MAP: {
            name: 'Tunnels',
            author: 'SChickenMan',
            map: "   99999999999999    99999999999999   9999999999999999999   \n"+
                "    9999999999999    99999999999999   999999999999999999    \n"+
                "      99999999999     9999999999999   99999999999999999     \n"+
                "       999999          99999999999    999999999999999       \n"+
                "9                      99999999999     9999999999999       9\n"+
                "999                     99999999999    999999999999       99\n"+
                "9999            9999    99999999999    99999999999      9999\n"+
                "99999     9999999999     9999999999    9999999999      99999\n"+
                "999999     9999999999     999999999    9999999999     999999\n"+
                "9999999    9999999999      99999999    9999999999    9999999\n"+
                "9999999     9999999999      9999999     999999999     999999\n"+
                "99999999    99999999999      9999999    999999999      99999\n"+
                "99999999    9999999999        999999     999999999     99999\n"+
                "9999999     999999999           99999     999999999     9999\n"+
                "999999      99999999     9        999     9999999999    9999\n"+
                "99999      99999999      99         99    9999999999    9999\n"+
                "9999      999999999     99999                  999999    999\n"+
                "  99     999999999     99999999                  9999       \n"+
                "        999999999     999999999999                99        \n"+
                "       9999999999     999999999999999999                    \n"+
                "         99999       999999999999999999     99              \n"+
                "999                 999999999999999999      999        99999\n"+
                "9999                999999999999999999     99999      999999\n"+
                "99999                999999999999999      99999999    999999\n"+
                "99999        9999    99999999999999      999999999     99999\n"+
                "99999    99999999    9999999999999       9999999999     9999\n"+
                "9999    9999999999    9999             9999999999999    9999\n"+
                "9999    9999999999    99              99999999999999    9999\n"+
                "9999    9999999999                   9999999999999999   9999\n"+
                "999    999999999999                 9999999999999999    9999\n"+
                "999    999999999999                99999999999999999    9999\n"+
                "999    99999999999                999999999999999999    9999\n"+
                "999    9999999999                999999999999999999    99999\n"+
                "999    999999999                9999999999999999999    99999\n"+
                "9999   999999999     9999999    9999999999999999999    99999\n"+
                "9999   99999999     99999999     9999999999999999     999999\n"+
                "9999    9999999    9999999999     99999999999999      999999\n"+
                "9999     999999    9999999999      99999999999      99999999\n"+
                "99999     99999   999999999999      999999999       99999999\n"+
                "99999     99999   9999999999         9999999        99999999\n"+
                "999999     999    999999999           99999         99999999\n"+
                "9999999     99    9999999       9       9       9    9999999\n"+
                "9999999      9   9999999       999             99    9999999\n"+
                "99999999         999999       99999           999     999999\n"+
                "9999999          9999        99999999       999999    999999\n"+
                "999999           999          99999999999999999999     99999\n"+
                "999999           9             99999999999999999999    99999\n"+
                "999999    9999          99      9999999999999999999    99999\n"+
                "999999   99999         9999       999999999999999999   99999\n"+
                "999999   99999       9999999       99999999999999999   99999\n"+
                "999999   999999     9999999999      9999999999999999   99999\n"+
                "99999    999999    999999999999     999999999999999    99999\n"+
                "99999    9999999   9999999999999            999999     99999\n"+
                "9999     9999999    9999999999999                      99999\n"+
                "999     999999999   9999999999999                        999\n"+
                "99      999999999   9999999999999     999                 99\n"+
                "9      9999999999   99999999999999   9999999999999999      9\n"+
                "      99999999999   99999999999999   99999999999999999      \n"+
                "     999999999999   99999999999999    99999999999999999     \n"+
                "    9999999999999   999999999999999   999999999999999999    ",
            flags: [],
            portals: [],
            spawns: [],
            tiers: [6, 7],
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
                    "9 9999 9999 9999999                      9999999 9999 9999 9\n"+
                    "9 9 9   9 9 9  999                        999  9 9 9   9 9 9\n"+
                    "9 99     99 9 999    9                9    999 9 99     99 9\n"+
                    "9 9  999  9 9999    99999999999999999999    9999 9  999  9 9\n"+
                    "9    99 9   999       999  999999  999       999   9 99    9\n"+
                    "9 9  9 99  9999999     99          99     9999999  99 9  9 9\n"+
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
                    "9 9  9 99  9999999     99          99     9999999  99 9  9 9\n"+
                    "9    99 9   999       999  999999  999       999   9 99    9\n"+
                    "9 9  999  9 9999    99999999999999999999    9999 9  999  9 9\n"+
                    "9 99     99 9 999    9                9    999 9 99     99 9\n"+
                    "9 9 9   9 9 9  999                        999  9 9 9   9 9 9\n"+
                    "9 9999 9999 9999999                      9999999 9999 9999 9\n"+
                    "9                99999999999999999999999999                9\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: 0,
                    y: -200
                }, {
                    x: 0,
                    y: 200
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
                    y: -265
                }, {
                    x: 0,
                    y: 265
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Square Roundabout",
                author: "JavRedstone",
                map: "     99 99  99   99  99      99      99  99   99  99 99     \n"+
                    " 999 9999  999   99 99       99       99 99   999  9999 999 \n"+
                    " 999 999  9999   9999        99        9999   9999  999 999 \n"+
                    " 999 99  99 99   999       999999       999   99999  99 999 \n"+
                    "     99 99  99   99                      99   999999 99     \n"+
                    "999999999   999  99                      99  9999  999999999\n"+
                    "99999999    9999 99                      99 99999   99999999\n"+
                    " 99  99      999999                      999999 9   999  99 \n"+
                    "99  99        99999                      99999  9 9 9 99  99\n"+
                    "9  99                    9999999999         999   9 9  99  9\n"+
                    "  99                      99999999           999  9 9  999  \n"+
                    " 99                        999999             999 9   99999 \n"+
                    "9999999                     9999               9999  9999999\n"+
                    "99999999                     99                 999 99999999\n"+
                    "     9999                    99                  999999     \n"+
                    "      999                    99                   9999      \n"+
                    "       99           999999  9999  999999           99       \n"+
                    "999999999            9999  999999  9999            999999999\n"+
                    "999999999             99  999  999  99             999999999\n"+
                    "  99                     999    999                     99  \n"+
                    " 99             9       999      999       9             99 \n"+
                    "99              99     999        9       99              99\n"+
                    "9               999   9999  9999         999               9\n"+
                    "                999  99999   999         999                \n"+
                    "                99  9999999            9  99                \n"+
                    "         9      9  999999999          999  9      9         \n"+
                    "         99       999   99999          999       99         \n"+
                    "   9     999     999     99999          999     999     9   \n"+
                    "   9     9999   999   9   99999     99   999   9999     9   \n"+
                    "9999     999999999    99   99999    99    999999999     9999\n"+
                    "9999     999999999    99    99999   99    999999999     9999\n"+
                    "   9     9999   999   99     99999   9   999   9999     9   \n"+
                    "   9     999     999          99999     999     999     9   \n"+
                    "         99       999          99999   999       99         \n"+
                    "         9      9  999          999999999  9      9         \n"+
                    "                99  9            9999999  99                \n"+
                    "                999         999   99999  999                \n"+
                    "9               999         9999  9999   999               9\n"+
                    "99              99       9        999     99              99\n"+
                    " 99             9       999      999       9             99 \n"+
                    "  99                     999    999                     99  \n"+
                    "999999999             99  999  999  99             999999999\n"+
                    "999999999            9999  999999  9999            999999999\n"+
                    "       99           999999  9999  999999           99       \n"+
                    "      9999                   99                    999      \n"+
                    "     999999                  99                    9999     \n"+
                    "99999999 999                 99                     99999999\n"+
                    "9999999  9999               9999                     9999999\n"+
                    " 99999   9 999             999999                        99 \n"+
                    "  999  9 9  999           99999999                      99  \n"+
                    "9  99  9 9   999         9999999999                    99  9\n"+
                    "99  99 9 9 9  99999                      99999        99  99\n"+
                    " 99  999   9 999999                      999999      99  99 \n"+
                    "99999999   99999 99                      99 9999    99999999\n"+
                    "999999999  9999  99                      99  999   999999999\n"+
                    "     99 999999   99                      99   99  99 99     \n"+
                    " 999 99  99999   999       999999       999   99 99  99 999 \n"+
                    " 999 999  9999   9999        99        9999   9999  999 999 \n"+
                    " 999 9999  999   99 99       99       99 99   999  9999 999 \n"+
                    "     99 99  99   99  99      99      99  99   99  99 99     ",
                flags: [{
                    x: -30,
                    y: -30
                }, {
                    x: 30,
                    y: 30
                }],
                portals: [
                    {
                        x: 200,
                        y: -200
                    },
                    {
                        x: -200,
                        y: 200,
                    }
                ],
                spawns: [{
                    x: -90,
                    y: 90
                }, {
                    x: 90,
                    y: -90
                }],
                tiers: [],
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
                    "9   999  999  9999999  9999 99999999999999999999999      999\n"+
                    "9   99999999999999999  999   999999999999999999999999    999\n"+
                    "9999999999999999999999999     99999999999999999        9 999\n"+
                    "99999               9999   9   99999999999999999 9 9  9  999\n"+
                    "99999               999   999   9999999999999999       9 999\n"+
                    "9  99               99    9999   99999999999999999999 9  999\n"+
                    "9  99   999999999   9      9999   9999999999999999999  9 999\n"+
                    "99999   999                 9999   999999999999999999 9  999\n"+
                    "99999   99                   9999   99999999999999 99  9 999\n"+
                    "99999   9                     9999   9999999999999    9  999\n"+
                    "9  99   9        99            9999   999999999999999  9 999\n"+
                    "9  99   9    8   99      99     9999   99999999999999 9  999\n"+
                    "99999   9     999      9999      9999         9999999  9 999\n"+
                    "99999   9     999      9 9        9999        9999999 9  999\n"+
                    "99999   9     999     9999         9999       9999999  9 999\n"+
                    "99999       99   9    99  9         999       9999999 9  999\n"+
                    "99999       99    9        9                  999   9  9 999\n"+
                    "99999              9        9                 999 9 9 9  999\n"+
                    "999999999           9        9                999 9 9    999\n"+
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
                    "99999 999   9999       97579      99       9999         9999\n"+
                    "9999   999   9999      97779      99       9 9         99999\n"+
                    "999     999   9999    999999        9     9999        999999\n"+
                    "9999   99999   999    99    9        9    99         999  99\n"+
                    "9999   999999   99           9        9             9999  99\n"+
                    "9999   9999999                9        9           999999999\n"+
                    "9999   9999999                 9        9              99999\n"+
                    "999     999999                  9        9    99       99999\n"+
                    "999     999999       999         9  99    9   99       99999\n"+
                    "9999   9999999       9999         9999     999     9   99999\n"+
                    "999     999999        9999        9 9      999     9   99999\n"+
                    "9999   9999999         9999      9999      999     9   99999\n"+
                    "9999   99999999999999   9999     99      99   8    9   99  9\n"+
                    "9999   999999999999999   9999            99        9   99  9\n"+
                    "9999   9999999999999999   9999                     9   99999\n"+
                    "9999   99999999999999999   9999                   99   99999\n"+
                    "9999   999999999999999999   9999                 999   99999\n"+
                    "9999   9999999999999999999   9999      9   999999999   99  9\n"+
                    "9999   99999999999999999999   9999    99               99  9\n"+
                    "999     99999999999999999999   999   999               99999\n"+
                    "999     999999999999999999999   9   9999               99999\n"+
                    "999     9999999999999999999999     9999999999999999999999999\n"+
                    "999     99999999999999999999999   999  99999999999999999   9\n"+
                    "9999   9999999999999999999999999 9999  9999999  999  999   9\n"+
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
                    "99 999   99     99   9                   999   999        99\n"+
                    "99  999 999     999 999                  9       9        99\n"+
                    "99   9999       999 9999                 9       9        99\n"+
                    "99    99       9999 99999         9999               99   99\n"+
                    "99   99       99999 999999        9999               99   99\n"+
                    "999999     99999999 9999999999  999999                    99\n"+
                    "999999    999       9999999999  999999   9       9        99\n"+
                    "99       999    999 999   9999  999999   9       9   99   99\n"+
                    "99       99    999                       999   999   99   99\n"+
                    "99       9      9                                         99\n"+
                    "99      99                                                99\n"+
                    "99     999  9       999   9999  999  999999         9999  99\n"+
                    "99  999999 999      9999999999  9999999999          9999  99\n"+
                    "99  999999 99        99999999         99    9       9999  99\n"+
                    "99   99999 9                          99   99       9999  99\n"+
                    "99                              9     9    99             99\n"+
                    "99   999999999999        99    999       9999             99\n"+
                    "99  99999999999999   99   9   99999     999999            99\n"+
                    "99   999999     99   999  9  9999999       9999999999     99\n"+
                    "99    99999 99  99    99 99   99999        99999999999999999\n"+
                    "99     9999 999 99      9999   999         99999999999999999\n"+
                    "99      999  99 99  9  999999   9   999    9999999999     99\n"+
                    "99       99     99  999999999      99999   99999999       99\n"+
                    "99        99999999      99999      99999   999  999       99\n"+
                    "99       999999999       9999      99999                  99\n"+
                    "99       999  999                   999                   99\n"+
                    "99                   999                   999  999       99\n"+
                    "99                  99999      9999       999999999       99\n"+
                    "99       999  999   99999      99999      999999999       99\n"+
                    "99       99999999   99999      999999999  99     99       99\n"+
                    "99     9999999999    999   9   999999  9  99 99  999      99\n"+
                    "99999999999999999         999   9999      99 999 9999     99\n"+
                    "99999999999999999        99999   99 99    99  99 99999    99\n"+
                    "99     9999999999       9999999  9  999   99     999999   99\n"+
                    "99            999999     99999   9   99   99999999999999  99\n"+
                    "99             9999       999    99        999999999999   99\n"+
                    "99             99    9     9                              99\n"+
                    "99   9999      99   99                          9 99999   99\n"+
                    "99   9999      9    99         99999999        99 999999  99\n"+
                    "99   9999         9999999999  9999999999      999 999999  99\n"+
                    "99   9999        999999  999  9999   999       9  999     99\n"+
                    "99                                                99      99\n"+
                    "99                                         9      9       99\n"+
                    "99    99  999   999                       999    99       99\n"+
                    "99    99  9       9   999999  9999   999 999    999       99\n"+
                    "99        9       9   999999  9999999999       999    999999\n"+
                    "99                    999999  9999999999 99999999     999999\n"+
                    "99    99              9999        999999 99999       99   99\n"+
                    "99    99              9999         99999 9999       99    99\n"+
                    "99        9       9                 9999 999       9999   99\n"+
                    "99        9       9                  999 999     999 999  99\n"+
                    "99        999   999                   9   99     99   999 99\n"+
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
                tiers: [3, 4, 5, 6],
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
                    "9999999999999999999                              999      99\n"+
                    "999999999999999999                                999     99\n"+
                    "99999999999999999                                  999    99\n"+
                    "9999999999999999                                    999   99\n"+
                    "9999999999             99999    9999999999           999  99\n"+
                    "9999999999            999999    99999999999   999     99  99\n"+
                    "9999999999           999                999    99     99  99\n"+
                    "9999999999   99     999                 999     9     99  99\n"+
                    "9999999999   99    999                 999            99  99\n"+
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
                    "99999                  999   99   999                  99999\n"+
                    "99999                  999   99   999                  99999\n"+
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
                    "99  99            999                 999    99   9999999999\n"+
                    "99  99     9     999                 999     99   9999999999\n"+
                    "99  99     99    999                999           9999999999\n"+
                    "99  99     999   99999999999    999999            9999999999\n"+
                    "99  999           9999999999    99999             9999999999\n"+
                    "99   999                                    9999999999999999\n"+
                    "99    999                                  99999999999999999\n"+
                    "99     999                                999999999999999999\n"+
                    "99      999                              9999999999999999999\n"+
                    "99       99999999                       99999999999999999999\n"+
                    "99        999999    9999999999999999999999999999999999999999\n"+
                    "999                99999999999999999999999999999999999999999\n"+
                    "9999              999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -250,
                    y: -250
                }, {
                    x: 250,
                    y: 250
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
                    x: -200,
                    y: -200
                }, {
                    x: 200,
                    y: 200
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Walls",
                author: "Healer",
                map: "999999999999     9999999999      9999999999     999999999999\n"+
                    "999999999999     9999999999      9999999999     999999999999\n"+
                    "9         99                                    99         9\n"+
                    "9 9999999999     9999999999      9999999999     9999999999 9\n"+
                    "9 9999999999     9999999999      9999999999     9999999999 9\n"+
                    "9 99      99                                    99      99 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9    999      999999999999    999999999999      999    9 9\n"+
                    "9 9    999                                        999    9 9\n"+
                    "9 9    999                                        999    9 9\n"+
                    "9 9    999      999999999999    999999999999      999    9 9\n"+
                    "999    999      999999999999    999999999999      999    999\n"+
                    "9                                                          9\n"+
                    "9                                                          9\n"+
                    "9               999999                999999               9\n"+
                    "9       9999                 99                 9999       9\n"+
                    "9       9                9   99   9                9       9\n"+
                    "9       9                9   99   9                9       9\n"+
                    "9       9                9   99   9                9       9\n"+
                    "999     9                9        9                9     999\n"+
                    "999     9                                          9     999\n"+
                    "999     9            99    9    9    99            9     999\n"+
                    "999     99  9999     9    99    99    9     9999  99     999\n"+
                    "99     999  9999     9    99    99    9     9999  999     99\n"+
                    "99     999           9    99    99    9           999     99\n"+
                    "99     999        9       99    99       9        999     99\n"+
                    "99      99        9                      9        99      99\n"+
                    "99      99        9          99          9        99      99\n"+
                    "99      99        9          99          9        99      99\n"+
                    "99      99        9                      9        99      99\n"+
                    "99     999        9       99    99       9        999     99\n"+
                    "99     999           9    99    99    9           999     99\n"+
                    "99     999  9999     9    99    99    9     9999  999     99\n"+
                    "999     99  9999     9    99    99    9     9999  99     999\n"+
                    "999     9            99    9    9    99            9     999\n"+
                    "999     9                                          9     999\n"+
                    "999     9                9        9                9     999\n"+
                    "9       9                9   99   9                9       9\n"+
                    "9       9                9   99   9                9       9\n"+
                    "9       9                9   99   9                9       9\n"+
                    "9       9999                 99                 9999       9\n"+
                    "9               999999                999999               9\n"+
                    "9                                                          9\n"+
                    "9                                                          9\n"+
                    "999    999      999999999999    999999999999      999    999\n"+
                    "9 9    999      999999999999    999999999999      999    9 9\n"+
                    "9 9    999                                        999    9 9\n"+
                    "9 9    999                                        999    9 9\n"+
                    "9 9    999      999999999999    999999999999      999    9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 9                                                      9 9\n"+
                    "9 99      99                                    99      99 9\n"+
                    "9 9999999999     9999999999      9999999999     9999999999 9\n"+
                    "9 9999999999     9999999999      9999999999     9999999999 9\n"+
                    "9         99                                    99         9\n"+
                    "999999999999     9999999999      9999999999     999999999999\n"+
                    "999999999999     9999999999      9999999999     999999999999",
                flags: [{
                    x: -165,
                    y: 0
                }, {
                    x: 165,
                    y: 0
                }],
                portals: [],
                spawns: [{
                    x: -250,
                    y: 0
                }, {
                    x: 250,
                    y: 0
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Dots",
                author: "Healer",
                map: "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999993566533364536434555539999999935555434635463335665399999\n"+
                    "99999999999999999999999999999  99999999999999999999999999999\n"+
                    "999999                 9999      9999                 999999\n"+
                    "9999999               9999        9999               9999999\n"+
                    "9999999             79999    99    99997             9999999\n"+
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
                    "9999999             79999    99    99997             9999999\n"+
                    "9999999               9999        9999               9999999\n"+
                    "999999                 9999      9999                 999999\n"+
                    "99999999999999999999999999999  99999999999999999999999999999\n"+
                    "999993566533364536434555539999999935555434635463335665399999\n"+
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
                tiers: [],
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
                    x: -190,
                    y: 0
                }, {
                    x: 190,
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
                    "99 9999        9   99  9999      9999  99   9        9999 99\n"+
                    "99999            9999  99999    99999  9999            99999\n"+
                    "9999     9       9999  999 99  99 999  9999       9     9999\n"+
                    "9999         9   9999  999  9999  999  9999   9         9999\n"+
                    "999          99  9999  99999999999999  9999  99          999\n"+
                    "999       9  99  9999  999        999  9999  99  9       999\n"+
                    "999      99  99  9999                  9999  99  99      999\n"+
                    "9999     99  99  99                      99  99  99     9999\n"+
                    "99999    99  99        9            9        99  99    99999\n"+
                    "9999     99  9     9                    9     9  99     9999\n"+
                    "999       9          9                9          9       999\n"+
                    "              9  9                        9  9              \n"+
                    "                         999    999                         \n"+
                    "             9        99 999    999 99        9             \n"+
                    "                  9   99 999    999 99   9                  \n"+
                    "999 9   99        99  99 999    999 99  99        99   9 999\n"+
                    "999    9999    9  99  99 999    999 99  99  9    9999    999\n"+
                    "999    999    99  99  99 9        9 99  99  99    999    999\n"+
                    "999    999    99  99  99            99  99  99    999    999\n"+
                    "999  9 999    99  99                    99  99    999 9  999\n"+
                    "999    9999   99  9     9 99999999 9     9  99   9999    999\n"+
                    "999    9999   99            9999            99   9999    999\n"+
                    "999    9999    9             99             9    9999    999\n"+
                    "999   99999            9     99     9            99999   999\n"+
                    "999  9999              9     99     9              9999  999\n"+
                    "                       9     99     9                       \n"+
                    "                       9     99     9                       \n"+
                    "999  9999              9     99     9              9999  999\n"+
                    "999   99999            9     99     9            99999   999\n"+
                    "999    9999    9             99             9    9999    999\n"+
                    "999    9999   99            9999            99   9999    999\n"+
                    "999    9999   99  9     9 99999999 9     9  99   9999    999\n"+
                    "999  9 999    99  99                    99  99    999 9  999\n"+
                    "999    999    99  99  99            99  99  99    999    999\n"+
                    "999    999    99  99  99 9        9 99  99  99    999    999\n"+
                    "999    9999    9  99  99 999    999 99  99  9    9999    999\n"+
                    "999 9   99        99  99 999    999 99  99        99   9 999\n"+
                    "                  9   99 999    999 99   9                  \n"+
                    "             9        99 999    999 99        9             \n"+
                    "                         999    999                         \n"+
                    "              9  9                        9  9              \n"+
                    "999       9          9                9          9       999\n"+
                    "9999     99  9     9                    9     9  99     9999\n"+
                    "99999    99  99        9            9        99  99    99999\n"+
                    "9999     99  99  99                      99  99  99     9999\n"+
                    "999      99  99  9999                  9999  99  99      999\n"+
                    "999       9  99  9999  999        999  9999  99  9       999\n"+
                    "999          99  9999  99999999999999  9999  99          999\n"+
                    "9999         9   9999  999  9999  999  9999   9         9999\n"+
                    "9999     9       9999  999 99  99 999  9999       9     9999\n"+
                    "99999            9999  99999    99999  9999            99999\n"+
                    "99 9999        9   99  9999      9999  99   9        9999 99\n"+
                    "99   9999                                          9999   99\n"+
                    "99     9999                                      9999     99\n"+
                    "999999999999999999999999999999999999999999999999999999999999\n"+
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: 0,
                    y: -170
                }, {
                    x: 0,
                    y: 170
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
                    y: -260
                }, {
                    x: 0,
                    y: 260
                }],
                tiers: [3, 4, 5, 6],
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
                    "8    999999999989999        8    888888999999           9999\n"+
                    "99    99999999989999        9988       888999           9999\n"+
                    "999    99999999999999      99999988888    88             999\n"+
                    "9999      999999999999    999999999999988                999\n"+
                    "99999      999999999999   999999999999999988             999\n"+
                    "9999        99999899999   999999999999889999             999\n"+
                    "999          99999899999   99999998988889999             999\n"+
                    "99           99999889999   9999 9999999999999           9999\n"+
                    "99            9999989999   999999999999999999           9999\n"+
                    "99            99999989999   9999999999999999           89999\n"+
                    "99            99999999999   999999999999999          8 89999\n"+
                    "99            999999999999   9         999       99998 89999\n"+
                    "99             99999999999                      999998 89999\n"+
                    "999              99999999            9         9999999  8999\n"+
                    "9999        99     99999    99                999999998 8999\n"+
                    "999999    999999     99    9999              99999  998 8999\n"+
                    "9999999   99999999         9999              99999  999  899\n"+
                    "9999999   9999999999        99    9     9    99999999998 899\n"+
                    "9 99999   99999999999    9                    9999999998 899\n"+
                    "9999999   99899999999                         999999999   99\n"+
                    "9999999   9999999888                           9999888     9\n"+
                    "9999999   9999988                  9       99  9888        9\n"+
                    "899998     8888   88        9          9   99       88     9\n"+
                    "98999           8999                            8889999   99\n"+
                    "99999       88899999  99        9               999999999999\n"+
                    "99999       99999999  99              9         999999999999\n"+
                    "999999     999999999                            999999999999\n"+
                    "9999999   9999999999        9     9             9999 9999998\n"+
                    "9 99999   999999999                         9   999   999988\n"+
                    "   9999   99999999    9                  9     99999 9999888\n"+
                    "9 99999   9999999        9             9       9999999999888\n"+
                    "9999999   999999                 9             9999999999998\n"+
                    "9999999   9999                                99999999999999\n"+
                    "999999      9                  9   99         99999999999999\n"+
                    "9999                              9999       999999999999999\n"+
                    "999                  99    9      9999      9999999  99  999\n"+
                    "99                 99999           99       9999999  99  999\n"+
                    "99                9999999                    99999999  99999\n"+
                    "9                9999999999                   999999    9999\n"+
                    "9                9999999999999       999      999999    9999\n"+
                    "9                999999999999999999999999      99999 99 9999\n"+
                    "9                9999999999999999999999999      999999999999\n"+
                    "9                99999989999999999999999999      99999999999\n"+
                    "9               999999888999999999999999999          9999999\n"+
                    "99              9999998899999999999999999999           99999\n"+
                    "99              99999889999999999988888899999          99999\n"+
                    "999            9999998999999999998889999899999          9999\n"+
                    "9999          9999998899999 999998899999989999          9999\n"+
                    "9999999    999999999889999   99998999 99999999          9999\n"+
                    "999999999999999999998899999 99999999   9999999          9999\n"+
                    "99999999999999999998889999999999999     9999999         9999\n"+
                    "899999999999999999888899999999998999   99999999         9999\n"+
                    "8888999999999998888888899999999989999 9999999999         999\n"+
                    "8888889999998888888888889999999888999999999999999   99    99\n"+
                    "8888888888888888888888888888888888899999989999999   999    9",
                flags: [{
                    x: -220,
                    y: -170
                }, {
                    x: 210,
                    y: 210
                }],
                portals: [
                    {
                        x: -220,
                        y: 150
                    },
                    {
                        x: -60,
                        y: 240
                    }
                ],
                spawns: [
                    {
                        x: -215,
                        y: 0
                    }, 
                    {
                        x: 210,
                        y: -240
                    }
                ],
                tiers: [],
                asteroids: []
            },
            {
                name: "Oblivion",
                author: "Liberal",
                map: "9 99343545559333559333433343977934333433395533395554534399 9\n"+
                    " 9945645564595445494446546547777456456444945445954655465499 \n"+
                    "999976656657967557976575577777777775575679755769756656679999\n"+
                    "959999999999999999999999999999999999999999999999999999999959\n"+
                    "557999999999999999999999999999999999999999999999999999999755\n"+
                    "5669999999999999999                                    99665\n"+
                    "355999999999999999                                     99553\n"+
                    "45699999999999999                                      99654\n"+
                    "3659999999999999                               999     99563\n"+
                    "545999999999999      99999                      999    99545\n"+
                    "45799999999999      999999                       999   99754\n"+
                    "9999999999999      999  99         999   999      99   99999\n"+
                    "346999999999      999   99        999     999      9   99643\n"+
                    "54599999999      999    99       999       999         99545\n"+
                    "4469999999      999     99      999    9    999        99644\n"+
                    "345999999      999      99      99    999    99        99543\n"+
                    "54599999      999               99   99 99   99        99545\n"+
                    "9999999       99                99   9   9             99999\n"+
                    "556999        9                 99                     99655\n"+
                    "55799      9            9       99                     99755\n"+
                    "55699     99           999      999          99        99655\n"+
                    "45799    999            999      999         99        99754\n"+
                    "54799    99          9   999      999        99        99745\n"+
                    "34799    99   9     999   999      999   99  999       99743\n"+
                    "36799    99   9    999     999      999       999      99763\n"+
                    "46599    99   9   999       999      999       999     99564\n"+
                    "46799    99   9   99         999      999       999    99764\n"+
                    "55699    99   9   99                   999       99    99655\n"+
                    "77799    99   9   99                    99   9   99    99777\n"+
                    "77799    99   9   99                    99   9   99    99777\n"+
                    "77799    99   9   99                    99   9   99    99777\n"+
                    "77799    99       99                    99   9   99    99777\n"+
                    "55699    999      999                   99   9   99    99655\n"+
                    "46799     999      999      999         99   9   99    99764\n"+
                    "46599      999      999      999       999   9   99    99564\n"+
                    "36799       999      999      999     999    9   99    99763\n"+
                    "34799        99  99   999      999   999     9   99    99743\n"+
                    "54799        99        999      999   9          99    99745\n"+
                    "45799        99         999      999            999    99754\n"+
                    "55699        99          999      999           99     99655\n"+
                    "55799                     99       9            9      99755\n"+
                    "55699                     99                 9        999655\n"+
                    "99999             9   9   99                99       9999999\n"+
                    "54599        99   99 99   99               999      99999545\n"+
                    "34599        99    999    99      99      999      999999543\n"+
                    "44699        999    9    999      99     999      9999999644\n"+
                    "54599         999       999       99    999      99999999545\n"+
                    "34699          999     999        99   999      999999999643\n"+
                    "99999   9       999   999         99  999      9999999999999\n"+
                    "45799   99                        999999      99999999999754\n"+
                    "54599   999                       99999      999999999999545\n"+
                    "36599    999                                9999999999999563\n"+
                    "45699                                      99999999999999654\n"+
                    "35599                                     999999999999999553\n"+
                    "56699                                    9999999999999999665\n"+
                    "557999999999999999999999999999999999999999999999999999999755\n"+
                    "959999999999999999999999999999999999999999999999999999999959\n"+
                    "999976656657967557976575577777777775575679755769756656679999\n"+
                    " 9945645564595445494446546547777456456444945445954655465499 \n"+
                    "9 99343545559333559333433343977934333433395533395554534399 9",
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
                    x: -230,
                    y: -230
                }, {
                    x: 230,
                    y: 230
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
                    y: 115
                }, {
                    x: 170,
                    y: -115
                }],
                tiers: [3, 4, 5, 6],
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
                    "99       99999  999999  99999999999    99999999999          \n"+
                    "99       99999  999999  999999999999    99999999999         \n"+
                    "99                                99       99    999        \n"+
                    "99                                99       99     999       \n"+
                    "99   99   999                              99999999999      \n"+
                    "99   99  999                               999999999999     \n"+
                    "99   99  99      999       999999999       99        999    \n"+
                    "99   99  9        999      999999999       99         999   \n"+
                    "99   99            999     99    999                   999  \n"+
                    "99                  999    99     999                   999 \n"+
                    "99                         99      999             9     999\n"+
                    "99   99                    99       999            99    999\n"+
                    "99   99    9               99        99   999999   999999999\n"+
                    "99   99    99              99        99   999999   999999999\n"+
                    "99   99    999             99        99       99   999      \n"+
                    "99   99     999            99        99       99   999      \n"+
                    "99   99      99      99     9        99       99   999      \n"+
                    "99            9      999             99       99   999      \n"+
                    "99                    999       9   999       99   999      \n"+
                    "99   99                999      99 999             999      \n"+
                    "99   99                 99      99999              9999     \n"+
                    "99   99                          999               99999    \n"+
                    "99   99    9999999999                      9999999999 999   \n"+
                    "99   99    99999999999                     9999999999  999  \n"+
                    "99   99    99                99            99      99   999 \n"+
                    "99   99    99                999           99      99    999\n"+
                    "99   99    99                 999          99      99     99\n"+
                    "99         99          999     999         99      99     99\n"+
                    "99         999          999     999        99      99     99\n"+
                    "99   9999999999          99      999       99      99     99\n"+
                    "99    9999999999        999       999      99      99     99\n"+
                    "999           999      999         999     999     99     99\n"+
                    " 999           9999999999           999     999    99     99\n"+
                    "  999           99999999             999     999   99     99\n"+
                    "   999                                999     999  99     99\n"+
                    "    999                                999     999 99     99\n"+
                    "     99                                 999     99999     99\n"+
                    "9    99          99                      999     9999     99\n"+
                    "99   99999999    99        9999999999     99      999     99\n"+
                    "999  99999999    99        99999999999             99     99\n"+
                    " 999 99  99      99        99       999            99     99\n"+
                    "  99999  99      9999999   99        999           99     99\n"+
                    "   9999  99      9999999   99         999          99     99\n"+
                    "    999  99                99          999         999    99\n"+
                    "     999 99                99           999         999   99\n"+
                    "      99999                99            999         999  99\n"+
                    "       9999    9999999999999999999999999999999999     999 99\n"+
                    "        999     9999999999999999999999999999999999     99999\n"+
                    "         999     9999999999                     999     9999\n"+
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
                map: "              99   99  999999          99   99              \n"+
                    "              99   99                  99   99              \n"+
                    "              99   99          999999  999999999999         \n"+
                    "     9999     999  99                  9999999999999    9999\n"+
                    "9     9999     999 99                  99         999    999\n"+
                    "99     9999     99999                  99          999    99\n"+
                    "999     9999     9999   999999         99           999    9\n"+
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
                    "9    999           99   999999         9999     9999     999\n"+
                    "99    999          99                  99999     9999     99\n"+
                    "999    999         99                  99 999     9999     9\n"+
                    "9999    9999999999999                  99  999     9999     \n"+
                    "         999999999999          999999  99   99              \n"+
                    "              99   99                  99   99              \n"+
                    "              99   99  999999          99   99              ",
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
                    x: -205,
                    y: -225
                }, {
                    x: 205,
                    y: 225
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Fortress",
                author: "Liberal",
                map: "455799   9999    99  974444444435345432334453325545444433555\n"+
                    "556799            9  976555666555765756565545555666555555664\n"+
                    "766799               977565655655666565665555665665556566565\n"+
                    "776699               996667767677766767667676777666776666776\n"+
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
                    "9   99665699    99  99647799     99                997777799\n"+
                    "99  99754699        99757799    99                 999999999\n"+
                    "    99764699        99757799   99         9999999           \n"+
                    "    997537999999999999657699   99         9999999           \n"+
                    "9999997557999999999999656799   99         999967999   999999\n"+
                    "7779996546766676676677764799   99         999977779   977777\n"+
                    "6557997656563425445656566699   99  9      999976539   943344\n"+
                    "6656677655556545443565566799   99 99      999984439   933333\n"+
                    "4666766667667676766667776999   9999       999963339   933443\n"+
                    "465799999999999999999999999    999         99975339   944233\n"+
                    "55579999999999999999999999           999    9997639   943234\n"+
                    "456799                              99999    999799   934443\n"+
                    "456699                             999 999    99999   943433\n"+
                    "566799                            999   999    9999   933433\n"+
                    "566699   999999    99999999        9     999    999   944432\n"+
                    "465699   99999    999999999               99     99   934334\n"+
                    "556799   9999    99      99               99      9   963424\n"+
                    "456799   999    99      99    9          999          956644\n"+
                    "556699   99    99      99    999        999    9      955534\n"+
                    "455699   9    99            999        999    999     995644\n"+
                    "556799       9999          999          9    99999    997543\n"+
                    "465799                     99               9997999   996634\n"+
                    "465699                     999      9      999655999  996534\n"+
                    "466699                      999    999    99976456999 997663\n"+
                    "366799   999999              999  999    9997554567999996653\n"+
                    "355699   99999     9999999    999999    99977565556799996554\n"+
                    "466699   9999      99999999    9999    999776655656659996564\n"+
                    "455699   999       999999999          9997565776676457777443\n"+
                    "555799   99    9   9999999999        99975556999997555555524\n"+
                    "555699   9    99   99778757999      9997655579   96555555533\n"+
                    "525799       999   997645556999    99977555579   97644444534\n"+
                    "366799             9997545567999    9998755679   96667455343\n"+
                    "355799               975556666999    99966676999999997755433\n"+
                    "455799               9999999999999    999656677669  96743343\n"+
                    "365699   9999  9999                    99966566679  97544334\n"+
                    "355699   9999  9999                     99976677699996634443\n"+
                    "455799    999  9779                      9997546777666444444\n"+
                    "457699     99  9779  999999999999999999999996654456767336333\n"+
                    "265699      9  9779  974554344355667999999996554333544444434\n"+
                    "365699         9779  974324434343465766666776544453334334334\n"+
                    "365699   9     9979  973443344443455652244344224243334432323\n"+
                    "556799   99    9999  973433233334435453445444334322232232424\n"+
                    "466799   999    999  974333444432344334344434333334334344344",
                flags: [{
                    x: -275,
                    y: 150
                }, {
                    x: -150,
                    y: 275
                }],
                portals: [
                    {
                        x: 60,
                        y: -60
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
                tiers: [3, 4, 5, 6],
                asteroids: []
            },
            {
                name: "Paths",
                author: "Healer",
                map: "   999999999999999999999            999999999999999999999   \n"+
                    "                      999          999                      \n"+
                    "                       999        999                       \n"+
                    "9     9999999999        999      999        9999999999     9\n"+
                    "99     99999999          99      99          99999999     99\n"+
                    "999     999999            9      9            999999     999\n"+
                    "9999     9999     99                    99     9999     9999\n"+
                    "9999      99     99                      99     99      9999\n"+
                    "9999            99                        99            9999\n"+
                    "9999           99     9              9     99           9999\n"+
                    "9999   9      99     99              99     99      9   9999\n"+
                    "9999   99    99     99                99     99    99   9999\n"+
                    "9999   999  99     99                  99     99  999   9999\n"+
                    "9999   999999     99                    99     999999   9999\n"+
                    "9999   99999     99                      99     99999   9999\n"+
                    "9999   9999     99     999        999     99     9999   9999\n"+
                    "9999   999      9     999          999     9      999   9999\n"+
                    "9999   99            999            999            99   9999\n"+
                    "9999   9            999    9    9    999            9   9999\n"+
                    "9999        99     999    99    99    999     99        9999\n"+
                    "9999       99     999    999    999    999     99       9999\n"+
                    "999       99     999    9999    9999    999     99       999\n"+
                    "999      99      99    99999    99999    99      99      999\n"+
                    "999     99       9    99999      99999    9       99     999\n"+
                    "999    99            99999        99999            99    999\n"+
                    "999   99   999                                999   99   999\n"+
                    "999   99  99999                              99999  99   999\n"+
                    "999   99              9999999  9999999              99   999\n"+
                    "999   99         9     99999    99999     9         99   999\n"+
                    "999   99         99                      99         99   999\n"+
                    "999   99         99                      99         99   999\n"+
                    "999   99         9     99999    99999     9         99   999\n"+
                    "999   99              9999999  9999999              99   999\n"+
                    "999   99  99999                              99999  99   999\n"+
                    "999   99   999                                999   99   999\n"+
                    "999    99            99999        99999            99    999\n"+
                    "999     99       9    99999      99999    9       99     999\n"+
                    "999      99      99    99999    99999    99      99      999\n"+
                    "999       99     999    9999    9999    999     99       999\n"+
                    "9999       99     999    999    999    999     99       9999\n"+
                    "9999        99     999    99    99    999     99        9999\n"+
                    "9999   9            999    9    9    999            9   9999\n"+
                    "9999   99            999            999            99   9999\n"+
                    "9999   999      9     999          999     9      999   9999\n"+
                    "9999   9999     99     999        999     99     9999   9999\n"+
                    "9999   99999     99                      99     99999   9999\n"+
                    "9999   999999     99                    99     999999   9999\n"+
                    "9999   999  99     99                  99     99  999   9999\n"+
                    "9999   99    99     99                99     99    99   9999\n"+
                    "9999   9      99     99              99     99      9   9999\n"+
                    "9999           99     9              9     99           9999\n"+
                    "9999            99                        99            9999\n"+
                    "9999      99     99                      99     99      9999\n"+
                    "9999     9999     99                    99     9999     9999\n"+
                    "999     999999            9      9            999999     999\n"+
                    "99     99999999          99      99          99999999     99\n"+
                    "9     9999999999        999      999        9999999999     9\n"+
                    "                       999        999                       \n"+
                    "                      999          999                      \n"+
                    "   999999999999999999999            999999999999999999999   ",
                flags: [{
                    x: -255,
                    y: 0
                }, {
                    x: 255,
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
                tiers: [],
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
                    x: -165,
                    y: 0
                }, {
                    x: 165,
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
                tiers: [],
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
                    x: -110,
                    y: -110
                }, {
                    x: 110,
                    y: 110
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
                map: "666666877775535333345666368666666863666543333535568668666666\n"+
                    "667777799977346644534448688699996886844435446643779999999966\n"+
                    "677999999996686686876676677999999776676678686686699999999996\n"+
                    "77999   999956867767777876899  998678777767768659999   99996\n"+
                    "79999   99999999999999999999    9999999999999999999     9998\n"+
                    "799     9999999999999999999      99999999999999999       998\n"+
                    "799                                                      998\n"+
                    "799                        99  99                        996\n"+
                    "769999      99999     9999999  9999999     99999        9965\n"+
                    "569999      99999     9799999  9999979     99999       99965\n"+
                    "366999      99499  9  9777799  9977779  9  99499      999663\n"+
                    "486999       999  99  9867779  9777689  99  999       999684\n"+
                    "467899  999      999  9666779  9776669  999      999  998764\n"+
                    "567799  9999    9949  9644779  9774469  9499    9999  997765\n"+
                    "466699  9949    9949  9664779  9774669  9499    9499  996664\n"+
                    "478699  9999     999  9667779  9777669  999     9999  996874\n"+
                    "366899  999  99   99  9667699  9967669  99   99  999  998663\n"+
                    "437699      9999   9  9887999  9997889  9   9999      996734\n"+
                    "447699     994499     9779999    99779     994499     996744\n"+
                    "586799    99999999    9799 99     9979    99999999    997685\n"+
                    "537799   999     99   999  99  99  999                997735\n"+
                    "337899  999       99   99 999  999                    998733\n"+
                    "346699 99999999999999   99949  9499    9999999999999  996643\n"+
                    "567699999778666666779    9949  94999   9776666668779  996765\n"+
                    "77689999 976444466799     999  999 99  9976644446799  998677\n"+
                    "7769999  97664466779  99   99  99   99  97766446679   999677\n"+
                    "779999   9776666779  9999       99 9999  9776666779   999977\n"+
                    "79999    977777779  994499       9994499  977777779    99997\n"+
                    "7999     999999999  999999        999999  999999999     9997\n"+
                    "799                                                      997\n"+
                    "799                                                      997\n"+
                    "7999     999999999  999999        999999  999999999     9997\n"+
                    "79999    977777779  9944999       994499  977777779    99997\n"+
                    "779999   9776666779  9999 99       9999  9776666779   999977\n"+
                    "776999   97664466779  99   99  99   99  97766446679  9999677\n"+
                    "776899  9976444466799  99 999  999     997664444679 99998677\n"+
                    "567699  9778666666779   99949  9499    977666666877999996765\n"+
                    "346699  9999999999999    9949  94999   99999999999999 996643\n"+
                    "337899                    999  999 99   99       999  998733\n"+
                    "537799                999  99  99  999   99     999   997735\n"+
                    "586799    99999999    9799     99 9979    99999999    997685\n"+
                    "447699     994499     97799    9999779     994499     996744\n"+
                    "437699      9999   9  9887999  9997889  9   9999      996734\n"+
                    "366899  999  99   99  9667699  9967669  99   99  999  998663\n"+
                    "478699  9999     999  9667779  9777669  999     9999  996874\n"+
                    "466699  9949    9949  9664779  9774669  9499    9499  996664\n"+
                    "567799  9999    9949  9644779  9774469  9499    9999  997765\n"+
                    "467899  999      999  9666779  9776669  999      999  998764\n"+
                    "486999       999  99  9867779  9777689  99  999       999684\n"+
                    "366999      99499  9  9777799  9977779  9  99499      999663\n"+
                    "56999       99999     9799999  9999979     99999      999965\n"+
                    "5699        99999     9999999  9999999     99999      999965\n"+
                    "699                        99  99                        997\n"+
                    "899                                                      997\n"+
                    "899       99999999999999999      9999999999999999999     997\n"+
                    "8999     9999999999999999999    99999999999999999999   99978\n"+
                    "69999   999956867767777876899  998678777767768659999   99776\n"+
                    "699999999996686686876676677999999776676678686686699999997796\n"+
                    "669999999977346644534448688699996886844435446643777777777966\n"+
                    "666666866865535333345666368666666863666543333535568668666666",
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
                tiers: [3, 4, 5, 6],
                asteroids: []
            },
            {
                name: "Shortcut",
                author: "Gummie",
                map: "  99999   799    7999977  7999999  79999999  7997   99999   \n"+
                    " 99999   999     79977    7999999  79999999  797   99999    \n"+
                    "99999   999      777       999999  99999999   7   99999     \n"+
                    "9999   999                  99999  999999999     99999     9\n"+
                    "999   999               77   9999  9999999999   99999     99\n"+
                    "99   999     99        7999   999  999999999     999     999\n"+
                    "9   999      99       799999   77  99999999   9   9     9999\n"+
                    "   999       99                    9999999   999       99999\n"+
                    "  999     9  999                   999999   99999     99999 \n"+
                    " 999     99  9999               99999999   99999     99999  \n"+
                    "799     99    9999              9999997   99999     99999   \n"+
                    "99             9999             999997   99999     79999   7\n"+
                    "9               9999        9   99997   99999      5999   79\n"+
                    "     99999       9999      99   9997   99999        57   799\n"+
                    "     999999       9999          997   99999     75        77\n"+
                    "          99       9999         97   99999     9995    7    \n"+
                    "          999       9999999         99999     99997   79    \n"+
                    "          9999       9999999       99999     99999   79   77\n"+
                    "            999       9999999     99999     99999   799   79\n"+
                    "             999           99    99999     99999   799     7\n"+
                    "              999           7   99999     99999   799  99  9\n"+
                    "               999             99999      9999     99 99  99\n"+
                    "7        77     99     9      99999       999   7     9  999\n"+
                    "99      7997          999    99999             799      9999\n"+
                    "997    799997      999997   99999             79999    99999\n"+
                    "9997  7999 997     99997   79999     999     7999999  999999\n"+
                    "99997799 999997     997     799     9999    7999999999999999\n"+
                    "999999999    997     7       7     99999    9999999999999999\n"+
                    "999999999 777999                  99999     999    999999999\n"+
                    "999999999 7  999       7           999      999 77 999999999\n"+
                    "999999999 77 999      999           7       999  7 999999999\n"+
                    "999999999    999     99999                  999777 999999999\n"+
                    "9999999999999999    99999     7       7     799    999999999\n"+
                    "999999 999999997    9999     997     799     799999 99779999\n"+
                    "99999   9999997     999     99997   79999     799 9997  7999\n"+
                    "9999     99997             99999   799999      799997    799\n"+
                    "999  9    997             99999    999          7997     799\n"+
                    "99  99     7   999       99999      9     99     77       77\n"+
                    "9  99   9     9999      99999             999               \n"+
                    "       997   99999     99999   7           999              \n"+
                    "7     997   99999     99999    99           999             \n"+
                    "97   997   99999     99999     9999999       999            \n"+
                    "77   97   99999     99999      99999999       9999          \n"+
                    "    97   79999     99999        99999999       999          \n"+
                    "    7    5999     99999   79         9999       99          \n"+
                    "77        57     99999   799          9999       999999     \n"+
                    "997   75        99999   7999   99      9999       99999     \n"+
                    "97   9995      99999   79999   9        9999               9\n"+
                    "7   99997     99999   799999             9999             99\n"+
                    "   99999     99999   9999999              9999    99     999\n"+
                    "  99999     99999   99999999               9999  99     999 \n"+
                    " 99999     99999   999999                   999  9     999  \n"+
                    "99999       999   999999                     99       999   \n"+
                    "9999     9   9   9999999  777   999997       99      999   9\n"+
                    "999     999     99999999  7999   9997        99     999   99\n"+
                    "99     99999   999999999  99999   77               999   999\n"+
                    "9     99999     99999999  999999                  999   9999\n"+
                    "     99999   7   9999999  9999999       777      999   99999\n"+
                    "    99999   797  9999999  79999997    77997     999   99999 \n"+
                    "   99999   7997  9999999  79999997  7799997    999   99999  ",
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
        if (GameMap.C.FILL_IN) {
            this.map = this.map.replace(/[1-8]/g, '9');
        }
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
            if (this.tiers.length == 0) {
                this.tiers = Helper.deepCopy(ShipGroup.C.ALLOWED_TIERS);
            }
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

const ShipGroup = class {
    tier = 0;
    ships = [];
    normalShips = [];
    flagShips = [];

    chosenShips = [];
    chosenNames = [];
    chosenTypes = [];
    chosenOrigins = [];

    static C = {
        NUM_SHIPS: 5,
        FLAG: {
            FLAG_SPEED_REDUCTION: 0.75,
            FLAG_MASS_MULTIPLIER: 1.1,
            FLAG_ACCELERATION_MULTIPLIER: 1.1,
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
        ALLOWED_TIERS: [1, 2], // [1,2,3,4,5,6,7]
        GROUPS: [
            {
                TIER: 1,
                SHIPS: [
                    {
                        ORIGIN: "CTF v1.5",
                        CODES: [
                            '{"name":"Atreyu","level":1,"model":1,"size":0.8,"specs":{"shield":{"capacity":[435,435],"reload":[5,5]},"generator":{"capacity":[170,170],"reload":[72,72]},"ship":{"mass":100,"speed":[145,145],"rotation":[105,105],"acceleration":[120,120]}},"bodies":{"ring3":{"section_segments":6,"offset":{"x":0,"y":-10,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.3975,-2.6425,-1.8875,0,1.8875,2.6425,3.3975,2.6425,1.8875,0,-1.8875,-2.6425,-3.3975],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[26,27.5,29,29.75,29,27.5,26,24.5,23,22.25,23,24.5,26],"height":[13,14.5,16,16.75,16,14.5,13,11.5,10,9.25,10,11.5,13],"vertical":0,"texture":[17,4,17,4,17,4,17],"angle":0},"ring4":{"section_segments":6,"offset":{"x":0,"y":30,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.3975,-2.6425,-1.8875,0,1.8875,2.6425,3.3975,2.6425,1.8875,0,-1.8875,-2.6425,-3.3975],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[26,27.5,29,29.75,29,27.5,26,24.5,23,22.25,23,24.5,26],"height":[13,14.5,16,16.75,16,14.5,13,11.5,10,9.25,10,11.5,13],"vertical":0,"texture":[17,4,17,4,17,4,17],"angle":0},"ring5":{"section_segments":6,"offset":{"x":0,"y":-82,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring6":{"section_segments":6,"offset":{"x":0,"y":-67,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring7":{"section_segments":6,"offset":{"x":0,"y":-52,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring8":{"section_segments":6,"offset":{"x":0,"y":-37,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring9":{"section_segments":6,"offset":{"x":0,"y":-22,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"reactors":{"section_segments":[45,135,225,315],"offset":{"x":18,"y":11,"z":-53},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,1,0],"height":[9,7.5,6.5,6,5,1,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":32},"reactor":{"section_segments":20,"offset":{"x":0,"y":10,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[17.1,14.25,12.35,11.4,9.5,1.9000000000000001,0],"height":[17.1,14.25,12.35,11.4,9.5,1.9000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"main":{"section_segments":6,"offset":{"x":0,"y":-80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-100,-90,-20,25,50,95,100,107.5,112.5,165,180,180,170],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,13,15,30,31.5,35.5,35,35,35,35,35,30,28,0],"height":[0,4,4.9,12,15,15,15,15,15,15,15,13,11,0],"propeller":true,"texture":[3,1,10,11,4,18,63,18,63,16.9,12.96,16.9]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-80,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-52,-50,-30,-5,70,5],"z":[0,0.4,-2,-1,0,0,0]},"width":[0,4,12,14,14,0],"height":[0,2,8,10,10,0],"texture":[9,9,9,4]},"toploader":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":7,"z":-53},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-10,0,11,11,10,10],"z":[0,0,0,0,0,0,0]},"width":[0,45,45,20,17,17,0],"height":[0,32,32,32,29,29,0],"texture":[4,4,[8],63,17,17],"vertical":true},"chunk":{"section_segments":6,"offset":{"x":0,"y":55.900000000000006,"z":0.6},"position":{"x":[0,0,0,0,0,0],"y":[-18,-18,-15.5,21.3,24,24],"z":[0,0,0,0,0,0]},"width":[0,30,30,30,30,0],"height":[0,15,15,15,15,0],"texture":[4,[15],16,[15]]},"propeller":{"section_segments":6,"offset":{"x":32,"y":20,"z":-12},"position":{"x":[-5,-5,0,0,0,0,0,-3,-3,-3],"y":[-80,-75,-50,-20,10,30,55,75,75,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,15,15,12,10,0],"height":[0,10,15,15,15,15,15,13,11,0],"propeller":true,"texture":[63,63,10,11,4,18,12,16.9],"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[160,160],"number":1,"error":0}},"cannon":{"section_segments":6,"offset":{"x":26,"y":-80,"z":-7},"position":{"x":[0,0,0,0,0,0,-10],"y":[-50,-60,-60,-20,0,20,30],"z":[0,0,0,0,0,0,0]},"width":[0,4,5,8,8,8,0],"height":[0,4,5,8,8,8,0],"texture":[16.9,16.9,3,10,18,63],"laser":{"damage":[7,7],"rate":10,"type":2,"speed":[140,180],"number":1,"angle":-2,"error":0}},"light":{"section_segments":6,"offset":{"x":0,"y":-135,"z":14.5},"position":{"x":[0,0,0,0],"y":[-50,-50,45,45],"z":[-4,-4,-12,-12]},"width":[0,5,2.5,0],"height":[0,5,2,0],"texture":[3.9,16.9,3.9],"angle":180},"bump":{"section_segments":[45,135,225,315],"offset":{"x":8,"y":2,"z":48},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,53,53,51,0],"texture":[63,17,63],"angle":30,"vertical":true},"stab":{"section_segments":6,"offset":{"x":29.5,"y":2,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-5,0,3,3,1,1],"z":[0,0,0,0,0,0]},"width":[0,9,4,1.5,1,0],"height":[0,30,20,16,16,0],"texture":[3.9,3.9,16.9,63,0.9],"vertical":true,"angle":30},"hexagon":{"section_segments":6,"offset":{"x":25,"y":38,"z":4},"position":{"x":[0,0,0,0,0],"y":[0,0,5.5,5.5,0],"z":[0,0,0,0,0]},"width":[9,12,12,9,9],"height":[7.5,10,10,7.5,7.5],"texture":[17]},"hexagon2":{"section_segments":6,"offset":{"x":25,"y":62,"z":4},"position":{"x":[0,0,0,0,0],"y":[0,0,5.5,5.5,0],"z":[0,0,0,0,0]},"width":[9,12,12,9,9],"height":[7.5,10,10,7.5,7.5],"texture":[17]}},"wings":{"front":{"offset":{"x":0,"y":-115,"z":0},"length":[75],"width":[50,10],"angle":[-20],"position":[15,70],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10}},"front_light":{"offset":{"x":0,"y":-111.5,"z":4.5},"length":[76],"width":[6,3],"angle":[-23],"position":[22,68],"texture":[17],"doubleside":true,"bump":{"position":30,"size":15}},"front_light2":{"offset":{"x":0,"y":-116.5,"z":3.5},"length":[76],"width":[6,3],"angle":[-22],"position":[2,70],"texture":[17],"doubleside":true,"bump":{"position":30,"size":15}},"top":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[0,20,0,5,-2,0],"width":[40,40,40,80,60,45,0],"angle":[90,90,90,90,90,90],"position":[-30,-30,-15,-15,-10,-8,-14],"texture":[4,4,4,18,63,17],"bump":{"position":35,"size":20}},"main":{"offset":{"x":0,"y":22,"z":0},"length":[150,2.5,20],"width":[80,50,50,30],"angle":[-20,20,20],"position":[0,70,70,50],"texture":[18,17,63],"doubleside":true,"bump":{"position":30,"size":5}},"main2":{"offset":{"x":0,"y":24,"z":0},"length":[150,2.5,20],"width":[80,50,50,30],"angle":[-20,20,20],"position":[0,70,70,50],"texture":[11,17,63],"doubleside":true,"bump":{"position":30,"size":5}},"main3":{"offset":{"x":0,"y":24,"z":2},"length":[131],"width":[39,22],"angle":[-20,20],"position":[2.5,60.5],"texture":[63],"doubleside":true,"bump":{"position":20,"size":10}},"main_lights":{"offset":{"x":0,"y":28,"z":5.5},"length":[131],"width":[5,3],"angle":[-21.3,20],"position":[2.5,60.5],"texture":[17],"doubleside":true,"bump":{"position":20,"size":10}},"main_lights2":{"offset":{"x":0,"y":19,"z":5},"length":[131],"width":[5,3],"angle":[-21,20],"position":[-2.5,60.5],"texture":[17],"doubleside":true,"bump":{"position":20,"size":10}},"main_deco":{"offset":{"x":0,"y":19,"z":0},"length":[150,2.5,20],"width":[80,50,50,30],"angle":[-20,20,20],"position":[0,70,70,50],"texture":[17],"doubleside":true,"bump":{"position":30,"size":0}}},"typespec":{"name":"Atreyu","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[435,435],"reload":[5,5]},"generator":{"capacity":[170,170],"reload":[72,72]},"ship":{"mass":100,"speed":[145,145],"rotation":[105,105],"acceleration":[120,120]}},"shape":[2.96,2.881,2.292,1.696,1.47,1.411,1.379,1.38,1.383,0.82,0.774,0.743,0.725,0.725,1.001,2.789,2.959,2.96,2.98,2.543,1.953,1.606,1.645,1.653,1.629,1.603,1.629,1.653,1.645,1.606,1.953,2.543,2.98,2.96,2.959,2.789,1.001,0.725,0.725,0.743,0.774,0.82,1.383,1.38,1.379,1.411,1.47,1.696,2.292,2.881],"lasers":[{"x":0.432,"y":-0.96,"z":-0.192,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.432,"y":-0.96,"z":-0.192,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.416,"y":-2.24,"z":-0.112,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[140,180],"number":1,"spread":-2,"error":0,"recoil":0},{"x":-0.416,"y":-2.24,"z":-0.112,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[140,180],"number":1,"spread":-2,"error":0,"recoil":0}],"radius":2.98}}',
                            '{"name":"Daedalus","level":1,"model":2,"size":1.5,"specs":{"shield":{"capacity":[510,510],"reload":[6,6]},"generator":{"capacity":[120,120],"reload":[88,88]},"ship":{"mass":290,"speed":[120,120],"rotation":[80,80],"acceleration":[100,100]}},"bodies":{"reactor":{"section_segments":16,"offset":{"x":0,"y":11,"z":-46.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,1,0],"height":[9,7.5,6.5,6,5,1,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"ring":{"section_segments":6,"offset":{"x":7.5,"y":49,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":0,"texture":16.9,"angle":0},"ring2":{"section_segments":6,"offset":{"x":7.5,"y":42,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":0,"texture":16.9,"angle":0},"ring3":{"section_segments":[45,135,225,315],"offset":{"x":38,"y":-8,"z":30},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":1,"texture":16.9,"angle":0},"ring4":{"section_segments":6,"offset":{"x":6,"y":3,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.4,8.8,9,8.8,8.4,8,7.6,7.2,7,7.2,7.6,8],"height":[6,6.4,6.8,7,6.8,6.4,6,5.6,5.2,5,5.2,5.6,6],"vertical":0,"texture":[63,2,17,63,2,17],"angle":0},"ring5":{"section_segments":6,"offset":{"x":6.3,"y":10,"z":3.6},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.4,8.8,9,8.8,8.4,8,7.6,7.2,7,7.2,7.6,8],"height":[6,6.4,6.8,7,6.8,6.4,6,5.6,5.2,5,5.2,5.6,6],"vertical":0,"texture":[63,2,17,63,2,17],"angle":0},"ring6":{"section_segments":6,"offset":{"x":6.7,"y":17,"z":3.9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.4,8.8,9,8.8,8.4,8,7.6,7.2,7,7.2,7.6,8],"height":[6,6.4,6.8,7,6.8,6.4,6,5.6,5.2,5,5.2,5.6,6],"vertical":0,"texture":[63,2,17,63,2,17],"angle":0},"main":{"section_segments":6,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-64,-60,-50,10,15,17.5,56,65,75,75,65],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.2,6.6000000000000005,11,16.5,16.5,16.5,17.6,19.8,16.5,15.400000000000002,0],"height":[0,1,4,5.12,14.4,15,15,15,15,10,9,0],"propeller":true,"texture":[3.9,3.9,2.9,2.9,3.9,17,18,3.9,13,16.9]},"head":{"section_segments":[0,60,120,180],"offset":{"x":-2,"y":10,"z":0},"position":{"x":[0.5,0.5,0,0,-10,-10],"y":[-60,-60,-52,-36,-20,-20],"z":[0,0,0,0,2.5,0]},"width":[0,5.5,9,11,0.1,0],"height":[0,4,5.5,8,2.5,0],"texture":[3.9,3.9,3.9,2.9]},"head_deco":{"section_segments":[0,60,120,180],"offset":{"x":-2.6,"y":10,"z":0},"position":{"x":[0.5,0.5,0,0,-9.5,-9.5],"y":[-60,-60,-52,-36,-20,-20],"z":[0,0,0,0,0.2,0]},"width":[0,5.5,9,11,0.1,0],"height":[0,1,2,2,2,0],"texture":[3.9,63]},"shield":{"section_segments":6,"offset":{"x":5,"y":35,"z":-2},"position":{"x":[0,0,-1,0,0,-1,-1.2,9,9],"y":[-70,-65,-50,-27,-25,33,35,43,35],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,14,15,15,18,18,2,0],"height":[0,2.9411764705882355,5.294117647058823,5.294117647058823,5.294117647058823,5.294117647058823,5.294117647058823,2.9411764705882355,0],"texture":[3.9,3.9,63,16.9,8,16.9,63,16.9]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-20,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-4,-2,0,5,30,40,42],"z":[-4,-4,-4,-3,0,0,0]},"width":[0,2,4,8,10,10,0],"height":[0,5,7,8,8,6,0],"propeller":false,"texture":[7,7,9,9,4]},"outer_arms":{"section_segments":6,"offset":{"x":58,"y":0,"z":-8},"position":{"x":[1.5,4.5,4.5,4.5,8,11,14,16,16,14,12,10,8.5,0],"y":[-100,-86,-85,-85,-60,-40,-20,0,20,40,60,80,80,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0.55,2.2,5.5,6.6000000000000005,8.8,8.8,8.8,8.8,8.8,8.8,7.700000000000001,5.5,4.4,0],"height":[0.5,2,5,6,6,6,7,9,12,15,15,8,8,0],"texture":[16.9,17.9,16.9,3.9,11,2.9,11,16,63,16,[15]],"laser":{"damage":[40,40],"rate":1,"type":1,"speed":[150,180],"number":1,"error":1,"recoil":90}},"outer_arms2":{"section_segments":6,"offset":{"x":58.5,"y":0,"z":-8},"position":{"x":[1.5,4.5,4.5,4.5,8,11,14,16,16,14,12,10,8.5,0],"y":[-100,-86,-85,-85,-60,-40,-20,0,20,40,60,80,80,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0.55,2.2,5.5,6.6000000000000005,8.8,8.8,8.8,8.8,8.8,8.8,7.700000000000001,5.5,4.4,0],"height":[0.5,2,5,6,6,6,7,9,12,15,15,8,8,0],"propeller":false,"texture":[16.9,17.9,16.9,0.9,18,8,18,3.9,16.9,3.9,[15]],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[150,160],"number":1,"error":1,"recoil":0}},"outer_arms_deco":{"section_segments":6,"offset":{"x":56.5,"y":0,"z":-8},"position":{"x":[4.5,4.5,8,11,14,16,16,14,14,10,8,0],"y":[-84.9,-84.9,-60,-40,-20,0,20,40,60,80,90,90],"z":[0,0,0,0,0,0,0,0,0,0,-5,0]},"width":[2.2,6.6000000000000005,8.8,8.8,8.8,8.8,8.8,8.8,7.700000000000001,5.5,4.4,0],"height":[1,1,1,1,1,1,1,1,1,1],"propeller":false,"texture":[63]},"propeller":{"section_segments":6,"offset":{"x":68,"y":70,"z":-8},"position":{"x":[3,3,3,0,0,0,0],"y":[-16,-16,-12,7,15,15,10],"z":[0,0,0,0,0,0,0]},"width":[0,8,10,10,8,7,0],"height":[0,15,17,12,10,9,0],"propeller":true,"texture":[2.9,16.9,3.9,12.9,16.9]},"inner_arm":{"section_segments":6,"offset":{"x":43,"y":-60,"z":-7.5},"position":{"x":[-3,-3,0,0,0,0],"y":[40,40,60,90,107,110],"z":[0,0,0,0,0,0]},"width":[0,10,10,12,12,0],"height":[0,5,5,5,5,0],"propeller":false,"texture":[[15],18,17,63]},"inner_arm2":{"section_segments":6,"offset":{"x":43.5,"y":-60,"z":-7.5},"position":{"x":[-3,-3,0,0,0,0],"y":[40,40,60,90,107,110],"z":[0,0,0,0,0,0]},"width":[0,10,10,12,12,0],"height":[0,5,5,5,5,0],"propeller":false,"texture":[[15],11,4,63]},"inner_arm_jaw":{"section_segments":[0,180,225,315],"offset":{"x":40.5,"y":-40,"z":-7.5},"position":{"x":[-3.8,-3,0,0],"y":[-6,0,20,20],"z":[0,0,0,0]},"width":[0.1,12,12,0],"height":[0.1,4,4,0],"propeller":false,"texture":[16.9,2.9]},"inner_arm_deco":{"section_segments":[45,135,225,315],"offset":{"x":40.5,"y":-60,"z":-7.5},"position":{"x":[0.5,-3,0,0,0,0],"y":[40,40,60,80,100,100],"z":[0,0,0,0,0,0]},"width":[5,10,10,12,12,0],"height":[1,1,1,1,1,0],"propeller":false,"texture":[63]},"cannon":{"section_segments":6,"offset":{"x":37,"y":-10,"z":-7.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-35,-40,-40,-37,-30,-25,0],"z":[0,0,0,0,0,0,0,2,2,2,2,2,2]},"width":[0,2,2.5,3,3,3,3,3,3,3,3,3,0],"height":[0,2,2.5,3,3,3,3,3,3,3,3,0],"angle":7,"texture":[16.9,16.9,63,4,18,17,2,11,4,4]},"cannon2":{"section_segments":6,"offset":{"x":37,"y":-10,"z":-7.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,2,2,2,2,2,2]},"width":[0,2,2.5,3,3,3,3,3,3,3,3,3,0],"height":[0,2,2.5,3,3,3,3,3,3,3,3,0],"angle":0,"texture":[16.9,16.9,63,4,18,17,2,11,4,4],"laser":{"damage":[8,8],"rate":6.2,"type":2,"speed":[160,180],"number":1,"error":3}},"box":{"section_segments":[45,135,225,315],"offset":{"x":1.5,"y":-3,"z":-9},"position":{"x":[0,0,0,0,0],"y":[5,5,15,16,16],"z":[0,0,0,0,0]},"width":[0,2,2,1,0],"height":[0,15,15,13,0],"texture":[63,17,63],"angle":35,"vertical":true},"lights":{"section_segments":8,"offset":{"x":10,"y":41,"z":4},"position":{"x":[-2,-2,7,7],"y":[0,0,50,50],"z":[0,0,-9,-9]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"angle":90,"texture":[63,17,63]},"lights2":{"section_segments":8,"offset":{"x":10,"y":46.5,"z":4},"position":{"x":[-4,-4,7,7],"y":[0,0,50,50],"z":[1,1,-9,-9]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"angle":90,"texture":[63,17,63]}},"wings":{"main":{"offset":{"x":0,"y":50,"z":6},"length":[70],"width":[40,35],"angle":[-10],"position":[0,-15],"doubleside":true,"bump":{"position":30,"size":5},"texture":[18]},"main_lights":{"offset":{"x":0,"y":48,"z":6},"length":[70],"width":[40,35],"angle":[-10],"position":[0,-15],"doubleside":true,"bump":{"position":30,"size":0},"texture":[17]},"main2":{"offset":{"x":0,"y":50,"z":6.7},"length":[61],"width":[20,15],"angle":[-10],"position":[0,-13],"doubleside":true,"bump":{"position":40,"size":10},"texture":[63]}},"typespec":{"name":"Daedalus","level":1,"model":2,"code":102,"specs":{"shield":{"capacity":[510,510],"reload":[6,6]},"generator":{"capacity":[120,120],"reload":[88,88]},"ship":{"mass":290,"speed":[120,120],"rotation":[80,80],"acceleration":[100,100]}},"shape":[1.65,1.579,1.398,1.088,3.506,3.44,3.246,2.976,2.779,2.629,2.531,2.479,2.463,2.483,2.54,2.611,2.722,2.951,3.183,3.399,3.309,2.139,2.071,2.471,2.586,2.555,2.586,2.471,2.071,2.139,3.309,3.399,3.183,2.951,2.722,2.611,2.54,2.483,2.464,2.479,2.531,2.629,2.779,2.976,3.246,3.44,3.506,1.088,1.398,1.579],"lasers":[{"x":1.785,"y":-3,"z":-0.24,"angle":0,"damage":[40,40],"rate":1,"type":1,"speed":[150,180],"number":1,"spread":0,"error":1,"recoil":90},{"x":-1.785,"y":-3,"z":-0.24,"angle":0,"damage":[40,40],"rate":1,"type":1,"speed":[150,180],"number":1,"spread":0,"error":1,"recoil":90},{"x":1.8,"y":-3,"z":-0.24,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[150,160],"number":1,"spread":0,"error":1,"recoil":0},{"x":-1.8,"y":-3,"z":-0.24,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[150,160],"number":1,"spread":0,"error":1,"recoil":0},{"x":1.11,"y":-0.3,"z":-0.225,"angle":0,"damage":[8,8],"rate":6.2,"type":2,"speed":[160,180],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.11,"y":-0.3,"z":-0.225,"angle":0,"damage":[8,8],"rate":6.2,"type":2,"speed":[160,180],"number":1,"spread":0,"error":3,"recoil":0}],"radius":3.506}}',
                            '{"name":"Dugares","level":1,"model":3,"size":1.2,"specs":{"shield":{"capacity":[665,665],"reload":[5,5]},"generator":{"capacity":[120,120],"reload":[84,84]},"ship":{"mass":340,"speed":[128,128],"rotation":[90,90],"acceleration":[70,70]}},"bodies":{"main":{"section_segments":[-180,-90,-50,-45,-40,40,45,50,90,180],"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-156,-155,-150,-135,-120,-110,60,59.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2.142857142857143,5.714285714285714,7.857142857142858,9.285714285714286,10.714285714285715,14.285714285714286,0],"height":[0,2,3,8,12,14,24,0],"propeller":0,"texture":[2,4,3,3,3,3,4]},"main1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-15,"z":-2.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-156,-155,-150,-135,-120,-110,60,59.5],"z":[2.5,1.6,0,0,0,0,0,0,0,0,0]},"width":[0,3,8,11,13,15,20,0],"height":[0,1.25,3.75,5,7.5,10,15,0],"propeller":0,"texture":[2,3,2,3,3,3,4]},"main2":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-150,-150,-143,-110,-45,0,60,60],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8.399999999999999,12.6,16.799999999999997,23.799999999999997,37.8,37.8,0],"height":[0,4.8,6,13.2,15.6,15.6,15.6,0],"propeller":0,"texture":[3.9,2.9,3.9,2.9,3.9,2.9]},"main25":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-15,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-150,-150,-143,-110,-45,0,50,50],"z":[3,3,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10.26,15.39,20.52,29.07,46.17,46.17,0],"height":[0,1.2,6,9.6,15.6,15.6,15.6,0],"propeller":0,"texture":[4,3,4,3,4,3]},"main3":{"section_segments":[60,65,70,110,115,120,220,225,230,310,315,320],"offset":{"x":0,"y":-15,"z":-9},"position":{"x":[-14,-14,-17,-31,-30,-30,-5,-5],"y":[-103,-100,-45,0,0,30,59,59],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0.1,6,9,12,27,27,30,0],"height":[4,10,12,14,14,14,14,0],"propeller":0,"texture":[3,3,3,3,3,3,4]},"main35":{"section_segments":[40,45,50,130,135,140,240,245,250,290,295,300],"offset":{"x":0,"y":-15,"z":-9},"position":{"x":[14,14,17,31,30,30,5,5],"y":[-103,-100,-45,0,0,30,59,59],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0.1,6,9,12,27,27,30,0],"height":[4,10,12,14,14,14,14,0],"propeller":0,"texture":[3.2,3.2,3.2,3.2,3.2,3.2,4]},"guns":{"section_segments":10,"offset":{"x":47.5,"y":-10,"z":-9},"position":{"x":[0,0,0,0],"y":[-18,-20,0,0],"z":[0,0,0,0]},"width":[0,4,5,0],"height":[0,4,5,0],"texture":[3]},"guns_front":{"section_segments":10,"offset":{"x":14,"y":-115,"z":-9},"position":{"x":[-3,-3,0,0],"y":[-35,-32,0,0],"z":[0,0,0,0]},"width":[0,4,5,0],"height":[0,4,5,0],"texture":[4]},"cannons":{"section_segments":12,"offset":{"x":61,"y":-17,"z":-16.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-30,-56,-56,-56,-55,-49,-47,-40,-36,-32,0,1,2],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,2.5,2.5,3.7,5.3,5.3,3.5,3.5,6,6,6,3,0],"height":[0,2,2.5,2.5,3.7,5.3,5.3,3.5,3.5,6,6,6,3,0],"texture":[3,3,4,4,4,4,4,3,4],"laser":{"damage":[21,21],"rate":3.5,"type":1,"speed":[120,120],"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-40,"z":14},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,60,70,85,84.5],"z":[0,0.2,-2,-1,-1,3]},"width":[0,7,10,10,10,5],"height":[0,2,12,14,14,0],"texture":[7,8.98,4,4,4]},"cockpit_deco":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":2,"y":40,"z":18},"position":{"x":[0,0,0,0],"y":[0,0,2.5,2.5],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[3],"angle":90},"back_plate":{"section_segments":[45,135,225,315],"offset":{"x":3,"y":43,"z":37.4},"position":{"x":[0,0,0,0,0,0],"y":[0,0,30,50,90,90],"z":[-5,-5,0,0,-3,-3]},"width":[0,12,12,12,9,0],"height":[0,1,1,1,1,0],"texture":[3],"angle":0},"back_plate2":{"section_segments":[0,45,90,90],"offset":{"x":0,"y":43,"z":33},"position":{"x":[-11.5,-11.5,-11.5,-11.5,-8.5,-8.5],"y":[-7,-7,30,50,100,100],"z":[-6.2,-6.2,0,0,-3.5,-3.5]},"width":[5,5,5,5,5,0],"height":[5,5,5,5,5,0],"texture":[3]},"back_plate3":{"section_segments":[-90,-45,0,0],"offset":{"x":0,"y":43,"z":33},"position":{"x":[11.5,11.5,11.5,11.5,8.5,8.5],"y":[-7,-7,30,50,100,100],"z":[-6.2,-6.2,0,0,-3.5,-3.5]},"width":[5,5,5,5,5,0],"height":[5,5,5,5,5,0],"texture":[3]},"back_plate4":{"section_segments":[45,135,225,315],"offset":{"x":16,"y":43,"z":22.8},"position":{"x":[0,0,0,0,0,-3,-3],"y":[-7,-7,5,30,50,90,100],"z":[3.2,3.2,-1.6,0,0,-3.5,6.8]},"width":[0,0.5,0.5,0.5,0.5,1,1],"height":[0,1,11,15,15,15,0.1],"texture":[3]},"back_deco":{"section_segments":4,"offset":{"x":0,"y":53,"z":26},"position":{"x":[0,0,0,0],"y":[-16,-16,16,16],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,2,2,0],"texture":[8],"angle":90},"turbine":{"section_segments":[-140,-120,-100,-50,-45,-40,40,45,50,100,120,140,180],"offset":{"x":0,"y":49,"z":8},"position":{"x":[30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],"y":[24,18,0,6,18,54,62.4,72,72,72,42,42,42,48,42,42],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"height":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"texture":[4,3,3,3,4,3,3,17],"propeller":true},"turbine2":{"section_segments":[-140,-120,-100,-50,-45,-40,40,45,50,100,120,140,180],"offset":{"x":0,"y":49,"z":8},"position":{"x":[-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30],"y":[24,18,0,6,18,54,62.4,72,72,72,42,42,42,48,42,42],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"height":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"texture":[4,3,3,3,4,3,3,17],"propeller":true},"engine":{"section_segments":12,"offset":{"x":30,"y":47,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-1.5,-1.5,-1,-1,0,10,10],"z":[0,0,0,0,0,0,0]},"width":[0,5.5,6,8,10,10,0],"height":[0,5.5,6,8,10,10,0],"texture":[2,4,3,3,4,3,37]},"turbinedeco":{"section_segments":[43,45,47,90,270,310,313,315,317],"offset":{"x":0,"y":89,"z":21},"position":{"x":[0,0,0,0],"y":[0,0,22,22],"z":[0,0,0,0]},"width":[0,27,27,0],"height":[0,15,15,0],"texture":[3],"angle":0},"turbinedeco2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":45,"y":73,"z":14},"position":{"x":[0,0,0,0],"y":[0,0,11,11],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,4,4,0],"texture":[4]},"grill":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":18,"y":67,"z":27},"position":{"x":[0,0,0,0,0,0],"y":[0,0,0,0,19,19],"z":[0,0,0,0,0,0]},"width":[0,3,5,6,6,0],"height":[0,2.5,5,6,6,0],"texture":[3,4,3],"angle":-15},"stab":{"section_segments":[45,135,225,315],"offset":{"x":10,"y":125,"z":33.5},"position":{"x":[-2,-2,-2,-2.5,-2.5,-2.5,-2.5,-2.5],"y":[-32,-30,2,6,16,20,21.5,21.5],"z":[1,2,0,1,2,1.5,0.5,0]},"width":[1.2,2,2,2,2,2,2,0],"height":[5,5,5,6,4,4,2.5,0],"texture":[4]},"winglet":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-120},"position":{"x":[0,0,0,0],"y":[0,0,40,40],"z":[0,1,-21,-21]},"width":[0,2,2,0],"height":[0,42,6,0],"texture":[3],"vertical":true,"angle":65},"winglet_lights":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-117},"position":{"x":[0,0,0,0],"y":[0,3,42,42],"z":[0,-2,-23,-21]},"width":[0,1.5,1.5,0],"height":[0,42,6,0],"texture":[17,17,4],"vertical":true,"angle":65},"winglet1":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-120},"position":{"x":[0,0,0,0],"y":[0,5,35,40],"z":[0,1,-17,-21]},"width":[0,2.1,2.1,0],"height":[0,26,0.1,0],"texture":[4],"vertical":true,"angle":65},"winglet2":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-155},"position":{"x":[0,0,0,0],"y":[0,0,8,8],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,15,15,0],"texture":[3],"vertical":true,"angle":65},"winglet3":{"section_segments":[45,135,225,315],"offset":{"x":45.5,"y":36.7,"z":-151},"position":{"x":[0,0,0,0],"y":[0,0,12,12],"z":[0,0,6,0]},"width":[0,2,2,0],"height":[0,12,12,0],"texture":[3],"vertical":true,"angle":65},"winglet3_lights":{"section_segments":[45,135,225,315],"offset":{"x":45.5,"y":36.7,"z":-151},"position":{"x":[0,0,0,0],"y":[0,0,13.9,13.9],"z":[0,0,6,6]},"width":[0,1.5,1.5,0],"height":[0,12,10,0],"texture":[17,17,4],"vertical":true,"angle":65},"winglet4":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":24,"z":-154},"position":{"x":[0,0,0,0],"y":[0,0,30,30],"z":[0,0,5,0]},"width":[0,0.5,0.5,0],"height":[0,12,8,0],"texture":[4],"vertical":true,"angle":65},"wing":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-85},"position":{"x":[0,0,0,0],"y":[0,0,60,60],"z":[0,-4,-55,-55]},"width":[0,3,3,0],"height":[0,34,4,0],"texture":[4],"vertical":true,"angle":130},"wing1":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-85},"position":{"x":[0,0,0,0],"y":[0,15,60,60],"z":[0,10,-50,-55]},"width":[0,3,3,0],"height":[0,20,4,0],"texture":[4],"vertical":true,"angle":130},"wing2":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-70},"position":{"x":[0,0,0,0],"y":[25,25,67,67],"z":[3,3,-58,-58]},"width":[0,4,4,0],"height":[0,30,25,0],"texture":[3],"vertical":true,"angle":130},"wing2_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-70},"position":{"x":[0,0,0,0],"y":[25,25,69,69],"z":[3,8,-59,-60]},"width":[0,3.5,3.5,0],"height":[0,30,27,0],"texture":[3,17],"vertical":true,"angle":130},"wing3":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-45},"position":{"x":[0,0,0,0],"y":[25,25,55,55],"z":[6,6,-55,-55]},"width":[0,4,4,0],"height":[0,30,10,0],"texture":[3],"vertical":true,"angle":130},"wing3_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-45},"position":{"x":[0,0,0,0],"y":[25,25,57.5,57.5],"z":[10,10,-55,-55]},"width":[0,3.5,3.5,0],"height":[0,30,10,0],"texture":[3,17],"vertical":true,"angle":130},"wing4":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":4},"position":{"x":[0,0,0,0],"y":[25,25,45,45],"z":[6,6,-73,-73]},"width":[0,4,4,0],"height":[0,40,0,0],"texture":[3],"vertical":true,"angle":130},"wing4_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":4},"position":{"x":[0,0,0,0],"y":[25,25,47.5,45],"z":[6,6,-73,-73]},"width":[0,3.5,3.5,0],"height":[0,50,0,0],"texture":[3,17],"vertical":true,"angle":130},"wing5":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-80},"position":{"x":[0,0,0,0],"y":[0,0,30,30],"z":[0,1,20,20]},"width":[0,3,3,0],"height":[0,20,33,0],"texture":[4],"vertical":true,"angle":130},"wing5_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-80},"position":{"x":[0,0,0,0],"y":[0,0,30,30],"z":[0,1,20,20]},"width":[0,2.5,2.5,0],"height":[0,23,36,0],"texture":[4,17,4],"vertical":true,"angle":130},"wing6":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":8},"position":{"x":[0,0,0,0],"y":[25,25,32,32],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,50,42,0],"texture":[3],"vertical":true,"angle":130},"wing7_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":8},"position":{"x":[0,0,0,0],"y":[25,25,34,32],"z":[0,0,0,0]},"width":[0,3.5,3.5,0],"height":[0,50,39,0],"texture":[3,17],"vertical":true,"angle":130},"wing7":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":8},"position":{"x":[0,0,0,0],"y":[18,18,25,25],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,33,50,0],"texture":[3],"vertical":true,"angle":130},"wing_block":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":60,"y":-18,"z":-0.5},"position":{"x":[0,0,-12,-12],"y":[0,0,15,15],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,17,17,0],"texture":[8],"vertical":true},"main_deco":{"section_segments":[45,135,225,315],"offset":{"x":22,"y":6.5,"z":-32},"position":{"x":[0,0,4,4],"y":[0,0,5,5],"z":[0,4,0,0]},"width":[0,5,5,0],"height":[0,23,17,0],"texture":[4],"vertical":true},"ring0":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":-10,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring20":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":-10,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring1":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":-4,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring21":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":-4,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring2":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":2,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring22":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":2,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring3":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":8,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring23":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":8,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0}},"wings":{"main":{"length":[20,15],"width":[85,60,5],"angle":[-10,-20],"position":[40,20,30],"doubleside":true,"offset":{"x":0,"y":-103,"z":-4},"bump":{"position":40,"size":5},"texture":[3]},"main_lights":{"length":[20,15],"width":[85,60,5],"angle":[-10,-20],"position":[40,20,30],"doubleside":true,"offset":{"x":0,"y":-105,"z":-4},"bump":{"position":40,"size":4},"texture":[17]},"main2":{"length":[10,0,20],"width":[16,14,45,7],"angle":[-30,-30,-30],"position":[-5,0,15,28],"doubleside":true,"offset":{"x":43,"y":77,"z":8},"bump":{"position":0,"size":5},"texture":[3,3]},"main2_lights":{"length":[10,0,20],"width":[16,14,45,7],"angle":[-30,-30,-30],"position":[-2,1,15,28],"doubleside":true,"offset":{"x":43,"y":75,"z":8},"bump":{"position":0,"size":4},"texture":[17,3,17]}},"typespec":{"name":"Dugares","level":1,"model":3,"code":103,"specs":{"shield":{"capacity":[665,665],"reload":[5,5]},"generator":{"capacity":[120,120],"reload":[84,84]},"ship":{"mass":340,"speed":[128,128],"rotation":[90,90],"acceleration":[70,70]}},"shape":[4.104,3.838,2.709,2.26,1.905,2.274,2.349,2.122,1.983,1.898,1.822,1.749,1.708,1.736,1.818,1.928,2.097,2.351,2.765,3.664,4.255,4.056,3.957,3.984,4.03,3.523,4.03,3.984,3.957,4.056,4.255,3.664,2.765,2.351,2.097,1.928,1.818,1.736,1.708,1.749,1.822,1.898,1.983,2.122,2.349,2.274,1.905,2.26,2.709,3.838],"lasers":[{"x":1.464,"y":-1.752,"z":-0.396,"angle":0,"damage":[21,21],"rate":3.5,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.464,"y":-1.752,"z":-0.396,"angle":0,"damage":[21,21],"rate":3.5,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.255}}',
                            '{"name":"Goliath","level":1,"model":4,"size":1.25,"specs":{"shield":{"capacity":[645,645],"reload":[8,8]},"generator":{"capacity":[140,140],"reload":[72,72]},"ship":{"mass":390,"speed":[110,110],"rotation":[75,75],"acceleration":[135,135]}},"bodies":{"ball":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":7,"y":0,"z":-35},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-9,-8.559508646656381,-7.281152949374527,-5.2900672706322585,-2.781152949374527,-5.51091059616309e-16,2.781152949374526,5.290067270632258,7.281152949374526,8.559508646656381,9],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"height":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"texture":17,"vertical":1,"angle":0},"ball2":{"section_segments":30,"offset":{"x":53,"y":14,"z":-22},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-1,-0.9510565162951535,-0.8090169943749475,-0.5877852522924731,-0.30901699437494745,-6.123233995736766e-17,0.30901699437494734,0.587785252292473,0.8090169943749473,0.9510565162951535,1],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"height":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"texture":17,"vertical":1,"angle":0},"main":{"section_segments":8,"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,35,100,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,20,20,20,20,20,17,14.5,0],"height":[0,5,15,15,15,15,16,16,15,12.5,0],"texture":[4,3,3,3,3,4,4,18,16.97],"propeller":true},"main2":{"section_segments":8,"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,35,90,90],"z":[0,0,0,0,0,0,0,0,1.5,0,0]},"width":[0,10.5,21,21,21,21,21,21,17.85,15.225000000000001,0],"height":[0,2.5,7.5,7.5,7.5,7.5,8,8,10,6.25,0],"texture":[63],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":16,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,0,20,40,90,92],"z":[-7,-5,-4,-4,-6,0]},"width":[0,10,10,10,10,0],"height":[0,10,10,12,12,0],"texture":[9,9,9,4]},"claws":{"section_segments":6,"offset":{"x":50,"y":-35,"z":0},"position":{"x":[-33,-25,5,20,25,20,20,20,0,0,0,-50],"y":[-105,-100,-70,-40,-10,20,20,20,48,48,48,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,19,19,15,0,0,0,0,15,14],"height":[0,5,15,16,15,15,0,0,0,0,13,0],"texture":[17,3.9,11,2.9,11,3.9,1,1,1,3.9,18]},"claws2":{"section_segments":6,"offset":{"x":51,"y":-35,"z":0},"position":{"x":[-33,-25,5,20,25,20,20,20,0,0,0,-50],"y":[-105,-100,-70,-40,-10,20,20,20,48,48,48,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,19,19,15,0,0,0,0,15,14],"height":[0,5,15,16,15,15,0,0,0,0,13,0],"texture":[63,10,18,8,18,3.9,1,1,1,3.9,18]},"claw_joint":{"section_segments":[45,135,225,315],"offset":{"x":82,"y":20,"z":0},"position":{"x":[29,29,4,4],"y":[0,0,35,35],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,8,8,0],"texture":[17],"angle":180},"claw_joint2":{"section_segments":[45,135,225,315],"offset":{"x":65,"y":20,"z":0},"position":{"x":[28,28,4,4],"y":[0,0,35,35],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,8,8,0],"texture":[17],"angle":180},"claws_color":{"section_segments":6,"offset":{"x":47,"y":-35,"z":0},"position":{"x":[-27.5,-21,5,20,25,20,20,20,0,-50],"y":[-100,-95,-70,-40,-10,20,20,48,48,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,19,19,15,0,0,15,12],"height":[0,2,2,2,2,2,0,0,2,0],"texture":[63,63,63,63,63,4,4,4,63]},"cannon":{"section_segments":6,"offset":{"x":0,"y":40,"z":-30},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-70,-20,0,20,30],"z":[0,0,0,0,0,0,20]},"width":[0,4,5,8,8,7,5],"height":[0,4,5,8,8,10,5],"texture":[16.9,16.9,10,1,1],"laser":{"damage":[11,11],"rate":0.8,"type":1,"speed":[170,170],"number":9,"recoil":30}},"side_cannons":{"section_segments":6,"offset":{"x":75,"y":-60,"z":-18},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,-10,10,20,30],"z":[0,0,0,0,0,20]},"width":[0,2,3,4,4,3],"height":[0,2,3,4,4,3],"texture":[16.9,16.9,10,1,1],"laser":{"damage":[3,3],"rate":1,"type":2,"speed":[160,200],"number":2,"angle":5,"error":0}},"tri_deco":{"section_segments":[20,30,40,140,150,160,300,310,320],"offset":{"x":0,"y":0,"z":-25},"position":{"x":[55,55,55,55,55,55,55,55,55,55],"y":[-13.636363636363635,-13.636363636363635,-13.636363636363635,-13.636363636363635,0,13.636363636363635,13.636363636363635,13.636363636363635,13.636363636363635],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,15,0],"propeller":false,"texture":[2.9,3,3,4,4,3,3,3],"vertical":true},"tri_deco2":{"section_segments":[20,30,40,140,150,160,300,310,320],"offset":{"x":0,"y":0,"z":-25},"position":{"x":[55,55,55,55,55,55,55,55,55,55],"y":[-13.636363636363635,-13.636363636363635,-13.636363636363635,-13.636363636363635,0,13.636363636363635,13.636363636363635,13.636363636363635,13.636363636363635],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,15,0],"propeller":false,"texture":[2.9,3,3,4,4,3,3,3],"vertical":true,"angle":180},"disc2":{"section_segments":18,"offset":{"x":53,"y":13,"z":-22},"position":{"x":[0,0,0,0],"y":[0,0,2,2],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"texture":[[15]],"vertical":true},"cannon_ring0":{"section_segments":6,"offset":{"x":0,"y":-25,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5,6,6,5,5],"height":[5,6,6,5,5],"texture":[17]},"cannon_ring1":{"section_segments":6,"offset":{"x":0,"y":-19,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.5,6.5,6.5,5.5,5.5],"height":[5.5,6.5,6.5,5.5,5.5],"texture":[17]},"cannon_ring2":{"section_segments":6,"offset":{"x":0,"y":-13,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[6,7,7,6,6],"height":[6,7,7,6,6],"texture":[17]},"cannon_ring3":{"section_segments":6,"offset":{"x":0,"y":-7,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[6.5,7.5,7.5,6.5,6.5],"height":[6.5,7.5,7.5,6.5,6.5],"texture":[17]},"cannon_ring4":{"section_segments":6,"offset":{"x":0,"y":-1,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[7,8,8,7,7],"height":[7,8,8,7,7],"texture":[17]},"cannon_ring5":{"section_segments":6,"offset":{"x":0,"y":5,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[7.5,8.5,8.5,7.5,7.5],"height":[7.5,8.5,8.5,7.5,7.5],"texture":[17]},"cannon_ring6":{"section_segments":6,"offset":{"x":0,"y":11,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[8,9,9,8,8],"height":[8,9,9,8,8],"texture":[17]},"cannon_ring7":{"section_segments":6,"offset":{"x":0,"y":17,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[8.5,9.5,9.5,8.5,8.5],"height":[8.5,9.5,9.5,8.5,8.5],"texture":[17]},"cannon_ring8":{"section_segments":6,"offset":{"x":0,"y":23,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[9,10,10,9,9],"height":[9,10,10,9,9],"texture":[17]},"cannon_ring9":{"section_segments":6,"offset":{"x":0,"y":29,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[9.5,10.5,10.5,9.5,9.5],"height":[9.5,10.5,10.5,9.5,9.5],"texture":[17]},"cannon_ring10":{"section_segments":6,"offset":{"x":0,"y":35,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[10,11,11,10,10],"height":[10,11,11,10,10],"texture":[17]},"cannon_ring11":{"section_segments":6,"offset":{"x":0,"y":41,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[10.5,11.5,11.5,10.5,10.5],"height":[10.5,11.5,11.5,10.5,10.5],"texture":[17]},"body_joint0":{"section_segments":6,"offset":{"x":16,"y":53,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]},"body_joint1":{"section_segments":6,"offset":{"x":16.5,"y":68,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]},"body_joint2":{"section_segments":6,"offset":{"x":17,"y":83,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]},"body_joint3":{"section_segments":6,"offset":{"x":17.5,"y":98,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]}},"wings":{"side":{"doubleside":true,"offset":{"x":80,"y":-35,"z":0},"length":[50],"width":[53,10],"angle":[-5],"position":[-20,0],"texture":[3],"bump":{"position":30,"size":5}},"side2":{"doubleside":true,"offset":{"x":80,"y":-35,"z":0},"length":[52],"width":[58,12],"angle":[-5],"position":[-20,0],"texture":[17],"bump":{"position":30,"size":0}},"side3":{"doubleside":true,"offset":{"x":80,"y":-32.2,"z":1.8},"length":[50],"width":[23.6,10],"angle":[-5],"position":[-4.5,-3],"texture":[18],"bump":{"position":20,"size":5}},"back":{"doubleside":true,"offset":{"x":0,"y":105,"z":-1},"length":[90],"width":[80,10],"angle":[0],"position":[-35,0],"texture":[18],"bump":{"position":30,"size":5}},"back2":{"doubleside":true,"offset":{"x":0,"y":104,"z":-1},"length":[92],"width":[82,12],"angle":[0],"position":[-35,0],"texture":[17],"bump":{"position":40,"size":0}},"back3":{"doubleside":true,"offset":{"x":0,"y":106,"z":-0.1},"length":[75],"width":[66.66666666666667,8.333333333333334],"angle":[0],"position":[-29.166666666666668,0],"texture":[[15.8]],"bump":{"position":30,"size":7}},"back4":{"doubleside":true,"offset":{"x":0,"y":106,"z":1.3},"length":[56.25],"width":[50,6.25],"angle":[0],"position":[-21.875,0],"texture":[18],"bump":{"position":30,"size":9}},"top":{"doubleside":true,"offset":{"x":17,"y":90,"z":0},"length":[0,-8.4,-3.5999999999999996,-1.2,-14.399999999999999,-3.5999999999999996,0],"width":[0,26,26,78,78,52,13,0],"angle":[280,280,255,315,325,350,0],"position":[0,0,0,-20,-20,-8.125,8.125,8.125],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":17,"y":92,"z":0},"length":[0,-8.4,-3.5999999999999996,-1.2,-14.399999999999999,-3.5999999999999996,0],"width":[0,26,26,78,78,52,13,0],"angle":[280,280,255,315,325,350,0],"position":[0,0,0,-20,-20,-8.125,8.125,8.125],"texture":[63,63,63,17,4,17,63],"bump":{"position":30,"size":-4}}},"typespec":{"name":"Goliath","level":1,"model":4,"code":104,"specs":{"shield":{"capacity":[645,645],"reload":[8,8]},"generator":{"capacity":[140,140],"reload":[72,72]},"ship":{"mass":390,"speed":[110,110],"rotation":[75,75],"acceleration":[135,135]}},"shape":[0.751,3.529,3.479,3.328,3.208,3.145,3.003,2.985,3.104,3.295,3.451,3.402,1.96,1.77,1.86,1.842,1.711,1.623,1.566,3.585,3.556,3.26,3.043,2.892,2.906,2.881,2.906,2.892,3.043,3.26,3.556,3.585,1.566,1.623,1.711,1.842,1.86,1.77,1.96,3.402,3.451,3.295,3.104,2.985,3.003,3.145,3.208,3.328,3.479,3.529],"lasers":[{"x":0,"y":-0.75,"z":-0.75,"angle":0,"damage":[11,11],"rate":0.8,"type":1,"speed":[170,170],"number":9,"spread":0,"error":0,"recoil":30},{"x":1.875,"y":-1.75,"z":-0.45,"angle":0,"damage":[3,3],"rate":1,"type":2,"speed":[160,200],"number":2,"spread":5,"error":0,"recoil":0},{"x":-1.875,"y":-1.75,"z":-0.45,"angle":0,"damage":[3,3],"rate":1,"type":2,"speed":[160,200],"number":2,"spread":5,"error":0,"recoil":0}],"radius":3.585}}',
                            '{"name":"Romulus","level":1,"model":5,"size":1.32,"specs":{"shield":{"capacity":[560,560],"reload":[5,6]},"generator":{"capacity":[80,123],"reload":[73,73]},"ship":{"mass":260,"speed":[128,128],"rotation":[69,69],"acceleration":[105,105]}},"bodies":{"ring":{"section_segments":8,"offset":{"x":10,"y":-64,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[4,4,63],"angle":0},"ring2":{"section_segments":8,"offset":{"x":11.7,"y":-54,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8.5,9,9.5,9.75,9.5,9,8.5,8,7.5,7.25,7.5,8,8.5],"vertical":0,"texture":[4,4,63],"angle":0},"ring3":{"section_segments":8,"offset":{"x":13.5,"y":-44,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[4,4,63],"angle":0},"ring4":{"section_segments":8,"offset":{"x":15.8,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[9.5,10,10.5,10.75,10.5,10,9.5,9,8.5,8.25,8.5,9,9.5],"vertical":0,"texture":[4,4,63],"angle":0},"ring7":{"section_segments":8,"offset":{"x":10,"y":42,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"vertical":0,"texture":[4,4,17,17,4,4],"angle":0},"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-124,-96,-98,-60,8,65,68,80,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.4,4.4,12,27,24,24,22,21,0],"height":[0,2.4,4.4,11,16,16,16,14,13,0],"texture":[6,17,63,10,2,17,13,17],"propeller":true,"laser":{"damage":[120,120],"rate":1,"type":1,"speed":[100,100],"recoil":250,"number":1,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":4,"z":11},"position":{"x":[0,0,0,0,0,0],"y":[-36,-34,-15,4,12,16],"z":[0,0,0,0,0,0]},"width":[0,6,12,12,8,0],"height":[0,6,12,12,8,0],"texture":[7,9,9,4]},"shield":{"section_segments":[0,60,120,180],"offset":{"x":-8,"y":-5,"z":15},"position":{"x":[6,6,0,0,0.5,0.5],"y":[-30,-30,-6,13,30,30],"z":[-3.5,-3.5,0,0,-8,-8]},"width":[0,3,10,10,9,0],"height":[0,4,5,5,4,0],"texture":[16.9,3.9,18,63,3.9]},"cannons":{"section_segments":6,"offset":{"x":63.2,"y":44,"z":-9.6},"position":{"x":[0,0,0,0,0,0,0,2.4,4],"y":[-36,-44,-44,-16,0,24,45.6,49.6,52.8],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3.2,4,4.8,4.8,4.8,4.8,2.4,0],"height":[0,2.4,3.2,4.8,5.6,5.6,3.2,2.4,0],"texture":[16.9,16.9,4,10,18],"laser":{"damage":[4,6.5],"rate":7,"type":2,"speed":[110,175],"number":1,"error":1}},"cannons2":{"section_segments":6,"offset":{"x":63.3,"y":44,"z":-9.6},"position":{"x":[0,0,0,0,0,0,0,2.4,4],"y":[-36,-44,-44,-16,0,24,45.6,49.6,52.8],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3.2,4,4.8,4.8,4.8,4.8,2.4,0],"height":[0,2.4,3.2,4.8,5.6,5.6,3.2,2.4,0],"texture":[16.9,16.9,11,10,18]},"propellers":{"section_segments":12,"offset":{"x":24.8,"y":-40,"z":-11.44},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[53.6,56,80,96,100,108,108,98],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2.4,6.4,6.4,6,4.6,3.8,0],"height":[0,1.6,8,9.6,9.2,7.8,7,0],"texture":[4,10,1,11,12,17],"propeller":true},"lights":{"section_segments":6,"offset":{"x":0,"y":-15,"z":10},"position":{"x":[0,0,0,0],"y":[-10,-10,65,65],"z":[0,3.6,-1.8,0]},"width":[0,4,3,0],"height":[0,3,3,0],"texture":[17],"angle":180},"reactor":{"section_segments":6,"offset":{"x":0,"y":0,"z":-26.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,11,22,22,20,20,20],"z":[0,0,0,-4,-4,-4,-4,-4]},"width":[0,21.126760563380284,21.126760563380284,9.15492957746479,7.042253521126761,7.042253521126761,5.633802816901409,0],"height":[0,22.22222222222222,22.22222222222222,10,7.777777777777778,8.333333333333334,6.666666666666666,0],"texture":[2.9,2.9,10.6,16.92,3.9,3,16.92],"vertical":true},"reactor2":{"section_segments":6,"offset":{"x":0,"y":0,"z":-26.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,11,22,22.1,20.1,20,20],"z":[0,0,0,-4,-4,-4,-4,-4]},"width":[0,20.97902097902098,20.97902097902098,9.090909090909092,7.6923076923076925,6.993006993006993,5.594405594405595,0],"height":[0,23.529411764705884,23.529411764705884,10.588235294117647,8.647058823529411,8.823529411764707,7.0588235294117645,0],"texture":[2.9,2.9,18,17.92,3.9,63,16.92],"vertical":true},"bar":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":7.5,"z":-29},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,2,2,2,0],"height":[0,10,10,8,0],"texture":[63,17,63],"angle":50,"vertical":true},"hexagon":{"section_segments":6,"offset":{"x":15,"y":0,"z":11.4},"position":{"x":[0,0,0,0,0],"y":[0,0,2.5,2.5,0],"z":[0,0,0,0,0]},"width":[5.4,7.2,7.2,5.4,5.4],"height":[6,8,8,6,6],"texture":[17]},"hexagon2":{"section_segments":6,"offset":{"x":15,"y":-5.5,"z":11.4},"position":{"x":[0,0,0,0,0],"y":[0,0,2.5,2.5,0],"z":[0,0,0,0,0]},"width":[5.4,7.2,7.2,5.4,5.4],"height":[6,8,8,6,6],"texture":[17]},"cannon_ring2":{"section_segments":6,"offset":{"x":64,"y":34,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4,5,5,4,4],"height":[4,5,5,4,4],"texture":[17]},"cannon_ring2.5":{"section_segments":6,"offset":{"x":64,"y":40,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4.25,5.25,5.25,4.25,4.25],"height":[4.25,5.25,5.25,4.25,4.25],"texture":[17]},"cannon_ring3":{"section_segments":6,"offset":{"x":64,"y":46,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4.5,5.5,5.5,4.5,4.5],"height":[4.5,5.5,5.5,4.5,4.5],"texture":[17]},"cannon_ring3.5":{"section_segments":6,"offset":{"x":64,"y":52,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4.75,5.75,5.75,4.75,4.75],"height":[4.75,5.75,5.75,4.75,4.75],"texture":[17]},"cannon_ring4":{"section_segments":6,"offset":{"x":64,"y":58,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5,6,6,5,5],"height":[5,6,6,5,5],"texture":[17]},"cannon_ring4.5":{"section_segments":6,"offset":{"x":64,"y":64,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.25,6.25,6.25,5.25,5.25],"height":[5.25,6.25,6.25,5.25,5.25],"texture":[17]},"cannon_ring5":{"section_segments":6,"offset":{"x":64,"y":70,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.5,6.5,6.5,5.5,5.5],"height":[5.5,6.5,6.5,5.5,5.5],"texture":[17]},"cannon_ring5.5":{"section_segments":6,"offset":{"x":64,"y":76,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.75,6.75,6.75,5.75,5.75],"height":[5.75,6.75,6.75,5.75,5.75],"texture":[17]},"spike0":{"section_segments":6,"offset":{"x":0,"y":-138,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[1,2,2,1,1],"height":[1,2,2,1,1],"texture":[17]},"spike1":{"section_segments":6,"offset":{"x":0,"y":-132,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[1.5,2.5,2.5,1.5,1.5],"height":[1.5,2.5,2.5,1.5,1.5],"texture":[17]},"spike2":{"section_segments":6,"offset":{"x":0,"y":-126,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[2,3,3,2,2],"height":[2,3,3,2,2],"texture":[17]},"spike3":{"section_segments":6,"offset":{"x":0,"y":-120,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[2.5,3.5,3.5,2.5,2.5],"height":[2.5,3.5,3.5,2.5,2.5],"texture":[17]}},"wings":{"main":{"doubleside":true,"offset":{"x":12,"y":6.4,"z":0},"length":[72],"width":[72,48],"angle":[-10],"position":[8,80],"texture":[11],"bump":{"position":10,"size":10}},"mainw":{"doubleside":true,"offset":{"x":12,"y":7.4,"z":0},"length":[72],"width":[72,48],"angle":[-10],"position":[8,80],"texture":[18],"bump":{"position":0,"size":11}},"main_lights":{"doubleside":true,"offset":{"x":12,"y":3.4,"z":0},"length":[72],"width":[72,48],"angle":[-10],"position":[8,80],"texture":[17],"bump":{"position":10,"size":0}},"top":{"doubleside":true,"offset":{"x":12,"y":24.8,"z":4},"length":[64],"width":[56,24],"angle":[15],"position":[0,60],"texture":[63],"bump":{"position":10,"size":10}},"top_lights":{"doubleside":true,"offset":{"x":12,"y":21,"z":4},"length":[66],"width":[56,25],"angle":[15],"position":[0,64],"texture":[17],"bump":{"position":10,"size":0}},"winglets":{"doubleside":true,"offset":{"x":67.2,"y":46.4,"z":-9.6},"length":[0,16],"width":[0,120,48],"angle":[-10,-10],"position":[-8.8,-8.8,40],"texture":[17,63],"bump":{"position":40,"size":7}},"winglets_lights":{"doubleside":true,"offset":{"x":67.2,"y":46.4,"z":-9.6},"length":[0,17.5],"width":[0,121,48],"angle":[-10,-10],"position":[-8.8,-8.8,40],"texture":[4,17],"bump":{"position":40,"size":0}}},"typespec":{"name":"Romulus","level":1,"model":5,"code":105,"specs":{"shield":{"capacity":[560,560],"reload":[5,6]},"generator":{"capacity":[80,123],"reload":[73,73]},"ship":{"mass":260,"speed":[128,128],"rotation":[69,69],"acceleration":[105,105]}},"shape":[3.802,2.81,1.931,1.545,1.285,1.107,0.959,0.887,0.829,0.793,1.874,1.863,1.892,1.956,2.058,2.216,2.421,2.738,3.056,3.491,3.669,2.767,1.987,1.888,1.613,1.587,1.613,1.888,1.987,2.767,3.669,3.491,3.056,2.738,2.421,2.216,2.058,1.956,1.892,1.863,1.874,0.793,0.829,0.887,0.959,1.107,1.285,1.545,1.931,2.81],"lasers":[{"x":0,"y":-3.802,"z":0,"angle":0,"damage":[120,120],"rate":1,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":250},{"x":1.668,"y":0,"z":-0.253,"angle":0,"damage":[4,6.5],"rate":7,"type":2,"speed":[110,175],"number":1,"spread":0,"error":1,"recoil":0},{"x":-1.668,"y":0,"z":-0.253,"angle":0,"damage":[4,6.5],"rate":7,"type":2,"speed":[110,175],"number":1,"spread":0,"error":1,"recoil":0}],"radius":3.802}}',
                            '{"name":"Ulysses","level":1,"model":6,"size":1.22,"specs":{"shield":{"capacity":[160,480],"reload":[4,4]},"generator":{"capacity":[30,145],"reload":[71,71]},"ship":{"mass":140,"speed":[100,140],"rotation":[50,85],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":[10,15,20,140,160,180,200,220,340,345,350],"offset":{"x":0,"y":-50,"z":-1},"position":{"x":[0,0,0,0,0,0,0],"y":[-72,-70,-40,20,80,135,135],"z":[0,0,0,4,4,4,4]},"width":[0,3,10,20,20,20,0],"height":[0,1,4,7,7,7,0],"texture":[2.8,3.8,2.8,3.8,3.8]},"main2":{"section_segments":[90,140,180,220,270,360],"offset":{"x":0,"y":-50,"z":1.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-72,-70,-40,20,80,140,140],"z":[-3,-3,-5.5,-4,-4,-4,-4]},"width":[0,1.875,6.25,12.5,12.5,12.5,0],"height":[0,1,4,7,7,7,0],"texture":[3,4,3,4,4]},"detail17":{"section_segments":12,"offset":{"x":100,"y":39,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[0,-3,-5,3,5,10,10],"z":[0,0,0,0,0,0,0]},"width":[0,3.5,4,4,5,4,0],"height":[0,3.5,4,4,5,4,0],"texture":[17,2,2,63],"angle":2,"laser":{"damage":[13,13],"rate":4.7,"type":2,"speed":[140,180],"number":1,"angle":2,"recoil":10,"error":0}},"detail1":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":-35,"z":2.37},"position":{"x":[0,-0.3,0,3,0],"y":[-55,-55,-50,5,0],"z":[0,0,0.5,6.75,0]},"width":[0,0.5,0.9,0.9,0],"height":[0,1,1,1,0],"texture":[63]},"detail2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-23,"z":2.9},"position":{"x":[0,0,0],"y":[-30,-7,-7],"z":[-2.6,0,0]},"width":[0.01,9.7,0],"height":[10,10,0],"texture":[4]},"detail3":{"section_segments":12,"offset":{"x":7,"y":-41,"z":3.5},"position":{"x":[0,0,0,-0.2,0],"y":[-15,-15,-14,5,5],"z":[0,0,0,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,1.5,1.5,1.5,0],"texture":[4,63,2],"angle":-2,"laser":{"damage":[40,40],"rate":1.2,"type":2,"speed":[140,160],"number":1,"angle":0,"error":1}},"detail4":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-18,"z":4},"position":{"x":[0,0,0,0,0],"y":[-28,-12,-12,45,45],"z":[-2.3,-0.4,-0.4,6.4,0.4]},"width":[0.01,7.7,8.7,8.7,0],"height":[10,10,10,0],"texture":[3]},"detail5":{"section_segments":6,"offset":{"x":0,"y":-35,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[4,16,32,52,60,60,64],"z":[2.12,2.8,3,2,2,2,0]},"width":[1.2,4,4.8,4.8,4.8,4.8,0],"height":[0,4,6,6,6,6,0],"texture":[9,9,4]},"detail6":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":18,"z":7.600000000000001},"position":{"x":[2,2,6.5,0,0],"y":[-25,-25,-20,-7,-7],"z":[0,0,0,0,0]},"width":[0,1,1,1,0],"height":[0,30,30,30,0],"texture":[4],"vertical":true},"detail7":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":18,"z":29.5},"position":{"x":[2,2,6.5,0,0],"y":[-25,-25,-20,-7,-7],"z":[0,0,0,0,0]},"width":[0,1,1,1,0],"height":[0,1,1,1,0],"texture":[63],"vertical":true},"detail8":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,50,50,45,15,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,18.2,2],"angle":90},"detail85":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.1},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,33.333333333333336,33.333333333333336,30,10,0],"height":[0,1,1,1,1,0],"texture":[1,18,63],"angle":90},"detail852":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.2},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,20,20,18,6,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,18.2,1],"angle":90},"detail88":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.3},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,8.333333333333334,8.333333333333334,7.5,2.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,63],"angle":90},"detail881":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.35},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,1.6666666666666667,1.6666666666666667,1.5,0.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,17],"angle":90},"detail882":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":43,"z":9.35},"position":{"x":[12,12,12.5,6,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,1.6666666666666667,1.6666666666666667,1.5,0.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,17],"angle":90},"detail883":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":80,"z":9.35},"position":{"x":[12,12,12.5,9,10,10],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,1.6666666666666667,1.6666666666666667,1.5,0.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,17],"angle":90},"detail9":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":-9},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[2,2,-5,-7,9,9]},"width":[0,50,50,45,15,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,18.2,2],"angle":90},"detail95":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":-8.5},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[2,2,-5,-7,9,9]},"width":[0,25,25,22.5,7.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,63],"angle":90},"detail10":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":41,"z":9},"position":{"x":[26,26,26,18,-13,-13],"y":[-31,-31,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail11":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":61,"z":9},"position":{"x":[-22,-22,-22,-24,-13,-13],"y":[-30,-30,-10,10,58,58],"z":[0,0,2,12,-8,-8]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail12":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":41,"z":-9},"position":{"x":[26,26,26,18,-13,-13],"y":[-30,-30,-10,10,60,60],"z":[0,2,-5,-7,9,9]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail13":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":61,"z":-9},"position":{"x":[-22,-22,-22,-24,-13,-13],"y":[-30,-30,-10,10,58,58],"z":[0,2,-5,-7,8,8]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail14":{"section_segments":12,"offset":{"x":0,"y":96.6,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-15,-9,-7,-5,-4,-3,-1,0,1,3,4,10,10,5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,13,13,11,11,13,11,11,13,11,11,13,13,11,0],"height":[0,13,13,11,11,13,11,11,13,11,11,13,13,11,0],"texture":[4,4,4,7,[15],[15],7,[15],[15],7,4,4,17],"propeller":true},"detail15":{"section_segments":[15,65,115,165,195,245,295,345],"offset":{"x":100,"y":63,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-17,-17,-15,15,17,17,7],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,10,10,8,0],"height":[0,18,18,18,18,16,0],"texture":[[15],63,3,63,16.94],"propeller":true},"detail16":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":100,"y":44.900000000000006,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,0,1],"z":[0,0,0,0]},"width":[8,6.5,6.5,8],"height":[8,6.5,6.5,8],"texture":[2]},"detail18":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":65,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-25,-25,-8,18,20,20],"z":[-5,-5,0,0,0,0]},"width":[0,11,11,11,11,0],"height":[0,0.1,12,12,12,0],"texture":[3,3,3,63,17.99]},"detail19":{"section_segments":12,"offset":{"x":19.5,"y":80,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-10,6,11,13,13,6.5],"z":[0,0,0,0,0,0,0]},"width":[0,7,7,9,9,8,0],"height":[0,9,9,11,9,8,0],"texture":[7,7,3,7,16.99,16.99],"propeller":true},"detail20":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":40,"z":11},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-10,-8,20],"z":[0,0,0,0,0]},"width":[0,7,8,8,8],"height":[0,2,3,3,3],"texture":[5,2,63,2]},"detail21":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":92,"z":23},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,0,5,10,10],"z":[0,0,5,6,5,5]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail21_5":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":92,"z":23},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,0,5,10,10],"z":[0,0,5,6,5,5]},"width":[0,2.8,2.8,2.8,1.0499999999999998,0],"height":[0,0.5,0.5,0.5,0.5,0],"texture":[17]},"detail22":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":92,"z":15.2},"position":{"x":[0,0,5,6,5,5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail22_5":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":92,"z":15.2},"position":{"x":[0,0,5,6,5,5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2.8,2.8,2.8,1.0499999999999998,0],"height":[0,0.5,0.5,0.5,0.5,0],"texture":[17]},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":14,"y":92,"z":15.2},"position":{"x":[0,0,-5,-6,-5,-5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail23_5":{"section_segments":[45,135,225,315],"offset":{"x":14,"y":92,"z":15.2},"position":{"x":[0,0,-5,-6,-5,-5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2.8,2.8,2.8,1.0499999999999998,0],"height":[0,0.5,0.5,0.5,0.5,0],"texture":[17]},"detail24":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":92,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,0,5,10,10],"z":[0,0,-5,-6,-5,-5]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail29":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":14,"z":-70},"position":{"x":[0,0,0,0,0],"y":[0,0,13.333333333333334,12.333333333333334,12.333333333333334],"z":[0,0,0,0,0]},"width":[0,10,3.3333333333333335,0.6666666666666666,0],"height":[0,20,16,5.333333333333334,0],"angle":0,"vertical":true,"texture":[17,4,16.93]},"disc":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":76,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":65,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":70.5,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc3_5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":59.5,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc4":{"section_segments":[20,40,60,120,140,160,180,200,220,240,260,280,300,320,340,360],"offset":{"x":9,"y":4.5,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":60},"disc5":{"section_segments":[20,40,60,120,140,160,180,200,220,240,260,280,300,320,340,360],"offset":{"x":9,"y":4.5,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":60},"disc6":{"section_segments":6,"offset":{"x":1,"y":9,"z":-41.599999999999994},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[5.555555555555555,5.555555555555555,5.555555555555555,6.666666666666666,6.666666666666666,6.666666666666666,6.666666666666666,6.666666666666666,5.555555555555555,5.555555555555555],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":90},"disc7":{"section_segments":10,"offset":{"x":-1,"y":36,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":false,"angle":135},"disc8":{"section_segments":6,"offset":{"x":0.9,"y":9,"z":-29},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":90},"disc9":{"section_segments":6,"offset":{"x":0.01,"y":48.3,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":false,"angle":70},"disc10":{"section_segments":6,"offset":{"x":0,"y":9,"z":-65},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.32,1.32,-1.0633333333333335,-1.0633333333333335,-1.0633333333333335,-0.6966666666666668,0.77,1.32,1.32,1.32],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[17.500000000000004,17.500000000000004,17.500000000000004,21,21,21,21,21,17.500000000000004,17.500000000000004],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":90},"disc11":{"section_segments":20,"offset":{"x":99,"y":59.5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[6.25,6.25,6.25,7.5,7.5,7.5,7.5,7.5,6.25,6.25],"height":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"texture":[4,4,4,4,4,17,4,4]},"disc12":{"section_segments":20,"offset":{"x":99,"y":63.5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[6.25,6.25,6.25,7.5,7.5,7.5,7.5,7.5,6.25,6.25],"height":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"texture":[4,4,4,4,4,17,4,4]},"disc13":{"section_segments":[15,65,115,165,195,245,295,345],"offset":{"x":100,"y":72,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"height":[15.384615384615383,15.384615384615383,15.384615384615383,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,15.384615384615383,15.384615384615383],"texture":[17,17.87,17,17,17,17.87,17,17]},"disc14":{"section_segments":[15,65,115,165,195,245,295,345],"offset":{"x":100,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"height":[15.384615384615383,15.384615384615383,15.384615384615383,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,15.384615384615383,15.384615384615383],"texture":[17,17.87,17,17,17,17.87,17,17]},"rod":{"section_segments":[65,155,245,335],"offset":{"x":10.5,"y":-10,"z":5.5},"position":{"x":[0,0,0,0,0.2,0.5,0,0,0,0.5,0.2,0,0,0,0],"y":[-10,-10,-8.5,-7,-5,-4,-2,0,2,4,5,7,8.5,10,10],"z":[0,0,0,0,-0.5,-1,0,0,0,-1,-0.5,0,0,0,0]},"width":[0,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0],"height":[0,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0],"texture":[4]},"circ":{"section_segments":30,"offset":{"x":4.5,"y":2,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,8,8,8,8,8],"z":[0,0,0,0,0,0,0]},"width":[0,2.4,2.4,1.8,0.4,0],"height":[0,2.4,2.4,1.8,0.4,0],"angle":60,"vertical":true,"texture":[17,4,16.93,17.93]},"circ2":{"section_segments":30,"offset":{"x":4.5,"y":2,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,8,8,8,8,8],"z":[0,0,0,0,0,0,0]},"width":[0,2.4,2.4,1.8,0.4,0],"height":[0,2.4,2.4,1.8,0.4,0],"angle":60,"vertical":true,"texture":[17,4,16.93,17.93]},"circ3":{"section_segments":30,"offset":{"x":4.5,"y":2,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,8,8,8,8,8],"z":[0,0,0,0,0,0,0]},"width":[0,2.4,2.4,1.8,0.4,0],"height":[0,2.4,2.4,1.8,0.4,0],"angle":60,"vertical":true,"texture":[17,4,16.93,17.93]},"hub":{"section_segments":20,"offset":{"x":0,"y":10,"z":-70},"position":{"x":[0,0,0,0,0,0,0],"y":[0,5,2.5,2.5,5,3],"z":[0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,0],"height":[9,7.5,6.5,6,5,0],"texture":[18,17,17,18,18],"vertical":true},"hub2":{"section_segments":20,"offset":{"x":106,"y":10,"z":-63},"position":{"x":[0,0,0,0,0,0,0],"y":[0,3.3333333333333335,1.6666666666666667,1.6666666666666667,3.3333333333333335,2],"z":[0,0,0,0,0,0,0]},"width":[6,5,4.333333333333333,4,3.3333333333333335,0],"height":[6,5,4.333333333333333,4,3.3333333333333335,0],"texture":[18,17,17,18,18],"vertical":true,"angle":55},"bar":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":4,"y":20,"z":10},"position":{"x":[4,4,4,4,2,2,0,0,0],"y":[-4,-4,0,18,22,30,35,60,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,2.5,2.5,2.5,2.5,2.5,2.5,0],"height":[0,0.5,2.5,2.5,2.5,2.5,2.5,2.5,0],"texture":[18.17,17,18.17,4,18.17,17,4]},"bar2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0.001,"y":20,"z":10},"position":{"x":[4,4,3,3,2,2,0,0,0],"y":[-4,-4,0,18,22,30,35,50,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2.598,4.5465,4.5465,3.2474999999999996,3.2474999999999996,3.2474999999999996,3.2474999999999996,0],"height":[0,0.25,1.25,1.25,1.25,1.25,1.25,1.25,0],"texture":[[15]]},"bar3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":107,"y":47.5,"z":0},"position":{"x":[0,0,0,0,1.5,0],"y":[0,0,7.692307692307692,23.076923076923077,30.769230769230766,30.769230769230766],"z":[0,0,0,0,0,0]},"width":[0,3,6,6,1,0],"height":[0,6,6,6,6,0],"texture":[8,8,4,8]},"bar4":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":109,"y":55.5,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3.5714285714285716,10.714285714285715,14.285714285714286,14.285714285714286],"z":[0,0,0,0,0,0]},"width":[0,3,6,6,3,0],"height":[0,7,7,7,7,0],"texture":[3,3,17.95,3]},"engine_detail":{"section_segments":[45,135,225,315],"offset":{"x":17,"y":32,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,8,10,12,15,17,20,22,22],"z":[0,0,10,10,10,10,10,10,10]},"width":[0,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,0],"height":[0,2,2,2,2,2,2,2,2,0],"texture":[5,18.2,13,18,13,18,13,18]},"engine_detail2":{"section_segments":[45,135,225,315],"offset":{"x":22,"y":32,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,8,10,12,15,17,20,22,22],"z":[0,0,10,10,10,10,10,10,10]},"width":[0,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,0],"height":[0,2,2,2,2,2,2,2,2,0],"texture":[5,18.2,13,18,13,18,13,18]},"engine_shield1":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":45,"vertical":true},"engine_shield2":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":90,"vertical":true},"engine_shield3":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":135,"vertical":true},"engine_shield4":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":180,"vertical":true},"engine_shield5":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":225,"vertical":true},"engine_shield6":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":270,"vertical":true},"engine_shield7":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":315,"vertical":true},"engine_shield8":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":360,"vertical":true},"eqwe00":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":42,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe01":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":42,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe10":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":46,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe11":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":46,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe20":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":50,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe21":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":50,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe30":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":54,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe31":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":54,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe40":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":58,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe41":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":58,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140}},"wings":{"main":{"doubleside":true,"offset":{"x":100,"y":75,"z":7},"length":[0,4],"width":[0,40,0],"angle":[90,90],"position":[0,-30,-10],"texture":[63],"bump":{"position":35,"size":20}},"main2":{"doubleside":true,"offset":{"x":100,"y":75,"z":-7},"length":[0,4],"width":[0,40,0],"angle":[-90,-90],"position":[0,-30,-10],"texture":[63],"bump":{"position":35,"size":20}},"main3":{"doubleside":true,"offset":{"x":100,"y":75,"z":7.01},"length":[0,3],"width":[0,42,0],"angle":[90,90],"position":[0,-30,-10],"texture":[17],"bump":{"position":35,"size":20}},"main4":{"doubleside":true,"offset":{"x":100,"y":75,"z":-7.1},"length":[0,0.2],"width":[0,44,0],"angle":[90,90],"position":[0,-30,-10],"texture":[17],"bump":{"position":35,"size":20}},"sides":{"length":[35],"width":[13,8],"angle":[130],"position":[0,30],"doubleside":true,"offset":{"x":92,"y":65,"z":5},"bump":{"position":10,"size":20},"texture":[3]},"sides2":{"length":[2],"width":[7.6,7],"angle":[130],"position":[0,0],"doubleside":true,"offset":{"x":70,"y":95,"z":31.7},"bump":{"position":0,"size":0},"texture":[63]},"sides3":{"length":[35],"width":[13,8],"angle":[-130],"position":[0,30],"doubleside":true,"offset":{"x":92,"y":65,"z":0},"bump":{"position":10,"size":20},"texture":[3]},"sides4":{"length":[2],"width":[7.8,6.5],"angle":[-130],"position":[0,0],"doubleside":true,"offset":{"x":69.4,"y":95,"z":-26},"bump":{"position":0,"size":0},"texture":[63]}},"typespec":{"name":"Ulysses","level":1,"model":6,"code":106,"specs":{"shield":{"capacity":[160,480],"reload":[4,4]},"generator":{"capacity":[30,145],"reload":[71,71]},"ship":{"mass":140,"speed":[100,140],"rotation":[50,85],"acceleration":[100,130]}},"shape":[2.977,2.281,1.327,0.941,0.814,0.64,0.539,0.472,0.426,0.393,0.372,0.356,0.349,0.349,2.533,2.732,3.171,3.289,3.3,2.895,2.954,2.448,2.536,2.599,2.897,2.874,2.897,2.599,2.536,2.448,2.954,2.895,3.3,3.289,3.171,2.732,2.533,0.349,0.349,0.356,0.372,0.393,0.426,0.472,0.539,0.64,0.814,0.941,1.327,2.281],"lasers":[{"x":2.436,"y":0.83,"z":0,"angle":2,"damage":[13,13],"rate":4.7,"type":2,"speed":[140,180],"number":1,"spread":2,"error":0,"recoil":10},{"x":-2.436,"y":0.83,"z":0,"angle":-2,"damage":[13,13],"rate":4.7,"type":2,"speed":[140,180],"number":1,"spread":2,"error":0,"recoil":10},{"x":0.184,"y":-1.366,"z":0.085,"angle":-2,"damage":[40,40],"rate":1.2,"type":2,"speed":[140,160],"number":1,"spread":0,"error":1,"recoil":0},{"x":-0.184,"y":-1.366,"z":0.085,"angle":2,"damage":[40,40],"rate":1.2,"type":2,"speed":[140,160],"number":1,"spread":0,"error":1,"recoil":0}],"radius":3.3}}',
                            '{"name":"Zirnitron","level":1,"model":7,"size":1,"specs":{"shield":{"capacity":[210,430],"reload":[6,6]},"generator":{"capacity":[100,145],"reload":[73,73]},"ship":{"mass":120,"speed":[148,148],"rotation":[60,60],"acceleration":[110,110]}},"bodies":{"main":{"section_segments":[30,60,120,150,210,240,300,330,360],"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-173,-172,-158,-125,70,120,125,125,115],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,1,6,13,18,23,17,16,0],"height":[0,1,9,13,18,18,13,12,0],"texture":[2,2,2,2,2,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-115,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,32,45],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9,9,9,4]},"engines":{"section_segments":18,"offset":{"x":19,"y":44,"z":-1.2},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-45,-45,0,25,50,52,43,43,49,48],"z":[2,2,1,0,0,0,3,3,3,3]},"width":[0,10,10,10,10,9,3,2,1,0],"height":[0,10,10,10,10,9,3,2,1,0],"texture":[3,3,3,3,3,13,17,13],"angle":182},"backengines":{"section_segments":18,"offset":{"x":20.5,"y":110,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-40,-30,20,25,25,15],"z":[0,0,0,0,0,0,0]},"width":[0,9,13,13,10,9,0],"height":[0,9,13,13,10,9,0],"propeller":true,"texture":[3,3,3,17,17]},"backengines2":{"section_segments":18,"offset":{"x":21,"y":110,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-40,-30,20,25,25,15],"z":[0,0,0,0,0,0,0]},"width":[0,9,13,13,10,9,0],"height":[0,9,13,13,10,9,0],"texture":[3,3,8,17,17]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[17,17],"rate":4,"recoil":30,"type":1,"speed":[170,190],"number":1}},"cannon2":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[7.5,7.5],"rate":10,"recoil":20,"type":1,"speed":[220,220],"number":1}},"cannon3":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[7.5,7.5],"rate":8,"recoil":20,"type":1,"speed":[240,240],"number":1}},"cannon4":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[7.5,7.5],"rate":6,"recoil":20,"type":1,"speed":[200,200],"number":1}},"frontsupport":{"section_segments":6,"offset":{"x":1,"y":-61,"z":-7},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-20,-13,-9,-5,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,15,10,10,0,0],"height":[0,1,5,7,5,5,5,5,0],"angle":90,"texture":[17,11,1]},"topsupport":{"section_segments":[30,60,90,120,150,210,240,300,330,360],"offset":{"x":5,"y":-30,"z":10},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-8,-8,0,2,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,0,5,30,0,0,0,0,0],"height":[0,1,5,7,0,5,5,5,0],"angle":-90,"texture":[4]},"wingsRail":{"section_segments":12,"offset":{"x":38,"y":-20,"z":-2},"position":{"x":[-0.8,0,0,0.8],"y":[-20,-17,0.4,2],"z":[0,0,0,0]},"width":[0,1.5,1.5,0],"height":[0,1,1,0],"texture":[[15]]},"wingsRail2":{"section_segments":12,"offset":{"x":74,"y":97,"z":-18},"position":{"x":[-2,0,0,0,1],"y":[-34.5,-28,30,45,46],"z":[-4,-4,-1,-5,-5]},"width":[0,1.5,1.5,1.5,0],"height":[0,1,1,1,0],"texture":[[15]]},"lights":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":70,"z":12.4},"position":{"x":[0,0,0,0],"y":[-65,-65,150,150],"z":[6,6,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[17],"angle":180},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":70,"z":12.4},"position":{"x":[0,0,0,0],"y":[-65,-65,150,150],"z":[6,6,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[[15]],"angle":180},"lights3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":70,"z":12.4},"position":{"x":[0,0,0,0],"y":[-65,-65,150,150],"z":[6,6,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[18],"angle":180},"ring":{"section_segments":16,"offset":{"x":19.5,"y":65,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring2":{"section_segments":16,"offset":{"x":19,"y":55,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring3":{"section_segments":16,"offset":{"x":19,"y":45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring4":{"section_segments":16,"offset":{"x":18.6,"y":35,"z":-0.8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring5":{"section_segments":16,"offset":{"x":18,"y":25,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring6":{"section_segments":16,"offset":{"x":0,"y":120,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-6.75,-5.25,-3.75,0,3.75,5.25,6.75,5.25,3.75,0,-3.75,-5.25,-6.75],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[27,28,29,29.5,29,28,27,26,25,24.5,25,26,27],"height":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"vertical":0,"texture":[4,4,16,16,4,4,4],"angle":0},"ring7":{"section_segments":16,"offset":{"x":0,"y":90,"z":8.1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-6.75,-5.25,-3.75,0,3.75,5.25,6.75,5.25,3.75,0,-3.75,-5.25,-6.75],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[27,28,29,29.5,29,28,27,26,25,24.5,25,26,27],"height":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"vertical":0,"texture":[4,4,16,16,4,4,4],"angle":0},"ring8":{"section_segments":16,"offset":{"x":0,"y":4,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring9":{"section_segments":16,"offset":{"x":0,"y":15,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring10":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":24,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring11":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":32,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring12":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":11},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring13":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":48,"z":11},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring14":{"section_segments":[45,135,225,315],"offset":{"x":30,"y":115,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,5.7,6.4,6.75,6.4,5.7,5,4.3,3.6,3.25,3.6,4.3,5],"height":[13,13.7,14.4,14.75,14.4,13.7,13,12.3,11.6,11.25,11.6,12.3,13],"vertical":0,"texture":[17],"angle":0},"ring15":{"section_segments":[45,135,225,315],"offset":{"x":30,"y":105,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,5.7,6.4,6.75,6.4,5.7,5,4.3,3.6,3.25,3.6,4.3,5],"height":[13,13.7,14.4,14.75,14.4,13.7,13,12.3,11.6,11.25,11.6,12.3,13],"vertical":0,"texture":[17],"angle":0},"ring16":{"section_segments":[45,135,225,315],"offset":{"x":30,"y":95,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,5.7,6.4,6.75,6.4,5.7,5,4.3,3.6,3.25,3.6,4.3,5],"height":[13,13.7,14.4,14.75,14.4,13.7,13,12.3,11.6,11.25,11.6,12.3,13],"vertical":0,"texture":[17],"angle":0},"ring17":{"section_segments":18,"offset":{"x":18.5,"y":101.5,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.125,-0.875,-0.625,0,0.625,0.875,1.125,0.875,0.625,0,-0.625,-0.875,-1.125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.3,8.6,8.75,8.6,8.3,8,7.7,7.4,7.25,7.4,7.7,8],"height":[6,6.3,6.6,6.75,6.6,6.3,6,5.7,5.4,5.25,5.4,5.7,6],"vertical":0,"texture":[17,4,17,4,17,4],"angle":25},"ring18":{"section_segments":18,"offset":{"x":19,"y":104.5,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.125,-0.875,-0.625,0,0.625,0.875,1.125,0.875,0.625,0,-0.625,-0.875,-1.125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.3,8.6,8.75,8.6,8.3,8,7.7,7.4,7.25,7.4,7.7,8],"height":[6,6.3,6.6,6.75,6.6,6.3,6,5.7,5.4,5.25,5.4,5.7,6],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring19":{"section_segments":18,"offset":{"x":18.5,"y":107.5,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.125,-0.875,-0.625,0,0.625,0.875,1.125,0.875,0.625,0,-0.625,-0.875,-1.125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.3,8.6,8.75,8.6,8.3,8,7.7,7.4,7.25,7.4,7.7,8],"height":[6,6.3,6.6,6.75,6.6,6.3,6,5.7,5.4,5.25,5.4,5.7,6],"vertical":0,"texture":[17,4,17,4,17,4],"angle":-25},"ring20":{"section_segments":6,"offset":{"x":8,"y":-50,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring21":{"section_segments":6,"offset":{"x":8,"y":-60,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring22":{"section_segments":6,"offset":{"x":8,"y":-70,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring23":{"section_segments":6,"offset":{"x":0,"y":-75,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[3,3.5,4,4.25,4,3.5,3,2.5,2,1.75,2,2.5,3],"vertical":0,"texture":[17,4,4,4,17,4],"angle":0},"ring24":{"section_segments":6,"offset":{"x":0,"y":-65,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[3,3.5,4,4.25,4,3.5,3,2.5,2,1.75,2,2.5,3],"vertical":0,"texture":[17,4,4,4,17,4],"angle":0},"ring25":{"section_segments":6,"offset":{"x":0,"y":-55,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[3,3.5,4,4.25,4,3.5,3,2.5,2,1.75,2,2.5,3],"vertical":0,"texture":[17,4,4,4,17,4],"angle":0},"reactor":{"section_segments":16,"offset":{"x":13,"y":13,"z":-105},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"hub":{"section_segments":8,"offset":{"x":13,"y":6,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"hub2":{"section_segments":8,"offset":{"x":13,"y":6,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"deco":{"section_segments":[45,135,225,315],"offset":{"x":-5,"y":105,"z":6},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8,-5,2,2],"z":[-2,-2,0,0,0,0]},"width":[0,25.5,25.5,25.5,25.5,0],"height":[0,15,15,10,10,0],"texture":[0.9,18,16.9,15,3.9],"angle":89},"wings_bottom":{"section_segments":10,"offset":{"x":-3,"y":75,"z":6},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8,-5,2,2],"z":[-2,-2,0,0,0,0]},"width":[0,15,15,15,15,0],"height":[0,15,15,10,10,0],"texture":[0.9,18,16.9,15,3.9],"angle":89},"front_streak":{"section_segments":[45,135,225,315],"offset":{"x":1,"y":1,"z":65},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,25,25,23,0],"texture":[63,17,63],"angle":20,"vertical":true},"back_streak":{"section_segments":[45,135,225,315],"offset":{"x":1,"y":5,"z":-105},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,25,25,18,0],"texture":[63,17,63],"angle":20,"vertical":true}},"wings":{"main":{"offset":{"x":0,"y":255,"z":5},"length":[100,1.5,5],"width":[170,50,50,5],"angle":[-20,0,0],"position":[-230,-130,-128,-100],"texture":[6.28,17,[15]],"doubleside":true,"bump":{"position":30,"size":4}},"main2":{"offset":{"x":0,"y":256,"z":5},"length":[100,1.5,5],"width":[170,50,50,5],"angle":[-20,0,0],"position":[-230,-130,-128,-100],"texture":[3.28,17,[15]],"doubleside":true,"bump":{"position":30,"size":4}},"main3":{"offset":{"x":0,"y":252,"z":4},"length":[100,1.5],"width":[170,50,50],"angle":[-20,0],"position":[-230,-130,-128],"texture":[17],"doubleside":true,"bump":{"position":30,"size":0}},"headwings":{"doubleside":true,"offset":{"x":0,"y":-55,"z":1},"length":[50,1],"width":[50,10,10],"angle":[-5,20],"position":[-20,40,41],"texture":[6.3,17],"bump":{"position":30,"size":4}},"headwings2":{"doubleside":true,"offset":{"x":0,"y":-57,"z":0.8},"length":[50,1],"width":[50,10,10],"angle":[-5,20],"position":[-20,40,41],"texture":[17],"bump":{"position":30,"size":0}},"headwings3":{"doubleside":true,"offset":{"x":0,"y":-54,"z":1},"length":[50,1],"width":[50,10,10],"angle":[-5,20],"position":[-20,40,41],"texture":[3.3,17],"bump":{"position":30,"size":4}},"rear":{"offset":{"x":-0.01,"y":100,"z":15},"length":[19,9,9,9,8,7,14],"width":[85,60,45,34,25,20,15,0],"angle":[90,90,90,90,90,90,90],"position":[-10,10,19,28,34,40,45,63],"texture":[3],"bump":{"position":30,"size":5}},"top":{"doubleside":true,"offset":{"x":15,"y":50,"z":10},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":15,"y":51,"z":10},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,4,17,63],"bump":{"position":30,"size":-4}}},"typespec":{"name":"Zirnitron","level":1,"model":7,"code":107,"specs":{"shield":{"capacity":[210,430],"reload":[6,6]},"generator":{"capacity":[100,145],"reload":[73,73]},"ship":{"mass":120,"speed":[148,148],"rotation":[60,60],"acceleration":[110,110]}},"shape":[3.5,2.555,1.814,1.406,1.283,1.191,1.135,1.098,1.081,1.098,1.091,1.048,0.733,0.794,0.89,1.028,1.242,1.572,2.235,3.042,3.75,3.753,3.06,2.77,2.815,3.26,2.815,2.77,3.06,3.753,3.75,3.042,2.235,1.572,1.242,1.028,0.89,0.794,0.733,1.048,1.091,1.098,1.081,1.098,1.135,1.191,1.283,1.406,1.814,2.555],"lasers":[{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[17,17],"rate":4,"type":1,"speed":[170,190],"number":1,"spread":0,"error":0,"recoil":30},{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[7.5,7.5],"rate":10,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":20},{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[7.5,7.5],"rate":8,"type":1,"speed":[240,240],"number":1,"spread":0,"error":0,"recoil":20},{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[7.5,7.5],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":20}],"radius":3.753}}',
                            '{"name":"Brotaur","level":1,"model":8,"size":1.03,"specs":{"shield":{"capacity":[300,520],"reload":[9,7]},"generator":{"capacity":[150,150],"reload":[70,70]},"ship":{"mass":260,"speed":[90,100],"rotation":[65,78],"acceleration":[90,140]}},"bodies":{"main":{"section_segments":[30,60,120,150,210,240,300,330,360],"offset":{"x":0,"y":80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-240,-240,-228,-175,10,60,63,63,58],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,1,6,17,20,24,16,15,0],"height":[0,1,9,13,18,18,13,12,0],"texture":[2,2,2,2,2,13,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-110,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,32,45],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9,9,9,4]},"frontsupport":{"section_segments":6,"offset":{"x":1,"y":-56,"z":-7},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-20,-13,-9,-5,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,15,10,10,0,0],"height":[0,1,5,7,5,5,5,5,0],"angle":90,"texture":[1,2,2]},"topsupport":{"section_segments":[30,60,90,120,150,210,240,300,330,360],"offset":{"x":5,"y":-30,"z":10},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-8,-8,0,2,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,0,5,30,0,0,0,0,0],"height":[0,1,5,7,0,5,5,5,0],"angle":-90,"texture":[4]},"engines":{"section_segments":[40,45,50,130,135,140,220,225,230,270,310,315,320],"offset":{"x":20,"y":54,"z":0},"position":{"x":[0,-2,0,1,22,22,0],"y":[-45,-45,0,75,120,119],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,10,10,0],"height":[0,12.5,12.5,10,10,0],"texture":[3,3,3,12,15],"angle":180},"backengines":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":22,"y":135,"z":0},"position":{"x":[0,0,0,0,0],"y":[-70,-40,10,10,5],"z":[0,0,0,0,0]},"width":[0,11,11,9,0],"height":[0,14,14,12,0],"propeller":true,"texture":[3,3,17],"angle":0},"grill_toploader":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":18,"y":-13,"z":0},"position":{"x":[0,0,0,2,22,12,0],"y":[0,0,0,-0.7,16,5],"z":[0,0,0,0,0,1,0]},"width":[0,0,0,28.1,14,0],"height":[0,0,0,10.1,10,0],"texture":[1,1,1,4,4],"angle":120},"cannon":{"section_segments":6,"offset":{"x":0,"y":-105,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[32,32],"rate":1,"type":1,"speed":[160,180],"number":3,"error":0,"angle":0,"recoil":30}},"side_propellers":{"section_segments":8,"offset":{"x":90,"y":55,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-24,-24,-34,-35,-35,-20,45,45,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,4,7,9,9,12,11,10,0],"height":[0,3,4,9,11,11,13,12,11,0],"propeller":true,"texture":[13,17,13,3,17,3,3,17],"laser":{"damage":[8,8],"rate":5.3,"type":1,"speed":[170,200],"recoil":0,"number":2,"angle":3,"error":0}},"wingsRail":{"section_segments":[45,135,225,315],"offset":{"x":135,"y":85,"z":-13},"position":{"x":[0,0,0,1.2],"y":[-7,-5,12.1,13.6],"z":[-1,-1,-0.7,-0.7]},"width":[1,2,2,0],"height":[1,2,2,0],"texture":[63],"angle":0},"wingsRail2":{"section_segments":[45,135,225,315],"offset":{"x":86.5,"y":45,"z":4},"position":{"x":[0,0,0,0],"y":[-7,-5,9,10],"z":[-2,0,0,-1]},"width":[1,2,2,0],"height":[0,2,2,0],"texture":[63],"angle":0},"wingsRail3":{"section_segments":[45,135,225,315],"offset":{"x":93.5,"y":45,"z":4},"position":{"x":[0,0,0,0],"y":[-7,-5,9,10],"z":[-2,0,0,0]},"width":[1,2,2,0],"height":[0,2,2,0],"texture":[63],"angle":0},"wingsRail4":{"section_segments":[45,135,225,315],"offset":{"x":59,"y":117,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,4,5],"z":[0,0,-1,-1,0,0,0,0,0]},"width":[1,1.6,1.6,0],"height":[1,1.6,1.6,0],"texture":[63],"angle":0},"wingsRail5":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":25,"z":8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,5,7],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,1.7,1.7,0],"height":[1,1.7,1.7,0],"texture":[63],"angle":87},"wingsRail6":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":14,"z":8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,4,6],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,1.7,1.7,0],"height":[1,1.7,1.7,0],"texture":[63],"angle":87},"wingsRail7":{"section_segments":6,"offset":{"x":28.8,"y":143.2,"z":51},"position":{"x":[4,4,3,3,0,0,0,0],"y":[-3,-2,4,4.5],"z":[-3,-3,-3,-3,0,0,0,0,0]},"width":[0.5,0.7,0.7,0],"height":[1,2,2,0],"texture":[63],"angle":10},"wingsRail8":{"section_segments":[45,135,225,315],"offset":{"x":72,"y":25,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,4,6],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,1.7,1.7,0],"height":[1,1.7,1.7,0],"texture":[63]},"wingstail":{"section_segments":6,"offset":{"x":65.5,"y":77.3,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-41,-39,19,20],"z":[10.5,10.5,0,0,0,0,0,0,0]},"width":[1,2,2,0],"height":[1,2,2,0],"texture":[4],"angle":74},"wingstail2":{"section_segments":8,"offset":{"x":115,"y":90.7,"z":-11},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-17,-15,23,23],"z":[4,4,-3,-3,0,0,0,0,0]},"width":[1,1.5,1.5,0],"height":[1,1,1,0],"texture":[4],"angle":75},"box":{"section_segments":[45,135,225,315],"offset":{"x":21.5,"y":-1,"z":-50},"position":{"x":[0,0,0,0,0],"y":[0,0,13.333333333333334,12.333333333333334,12.333333333333334],"z":[0,0,0,0,0]},"width":[0,10,5,1,0],"height":[0,33.333333333333336,26.666666666666668,8.88888888888889,0],"angle":0,"vertical":true,"texture":[17,4,16.93]},"ring":{"section_segments":16,"offset":{"x":25,"y":60,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,7,8,8.5,8,7,6,5,4,3.5,4,5,6],"height":[7,8,9,9.5,9,8,7,6,5,4.5,5,6,7],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring2":{"section_segments":16,"offset":{"x":25,"y":50,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,7,8,8.5,8,7,6,5,4,3.5,4,5,6],"height":[7,8,9,9.5,9,8,7,6,5,4.5,5,6,7],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring3":{"section_segments":16,"offset":{"x":25,"y":40,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,7,8,8.5,8,7,6,5,4,3.5,4,5,6],"height":[7,8,9,9.5,9,8,7,6,5,4.5,5,6,7],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring4":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":25,"y":-3,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.7,7.4,7.75,7.4,6.7,6,5.3,4.6,4.25,4.6,5.3,6],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":25,"y":-11,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.7,7.4,7.75,7.4,6.7,6,5.3,4.6,4.25,4.6,5.3,6],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring6":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":29,"y":116,"z":-1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14,14.7,15.4,15.75,15.4,14.7,14,13.3,12.6,12.25,12.6,13.3,14],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring7":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":29,"y":109,"z":-1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,10.7,11.4,11.75,11.4,10.7,10,9.3,8.6,8.25,8.6,9.3,10],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":29,"y":102,"z":-1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.7,7.4,7.75,7.4,6.7,6,5.3,4.6,4.25,4.6,5.3,6],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":6.5,"z":-100},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[20,21,22,22.5,22,21,20,19,18,17.5,18,19,20],"height":[24,25,26,26.5,26,25,24,23,22,21.5,22,23,24],"vertical":1,"texture":[4,17,[15],[15],17,4,4],"angle":90},"ring10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":100,"z":6.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[24,25,26,26.5,26,25,24,23,22,21.5,22,23,24],"height":[20,21,22,22.5,22,21,20,19,18,17.5,18,19,20],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring11":{"section_segments":16,"offset":{"x":89.7,"y":75,"z":6.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,10.6,11.2,11.5,11.2,10.6,10,9.4,8.8,8.5,8.8,9.4,10],"height":[5,5.6,6.2,6.5,6.2,5.6,5,4.4,3.8,3.5,3.8,4.4,5],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":90},"ring12":{"section_segments":16,"offset":{"x":0,"y":-3,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring13":{"section_segments":16,"offset":{"x":0,"y":8,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring14":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":19,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring15":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":27,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring16":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":35,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring17":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":43,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring18":{"section_segments":16,"offset":{"x":0,"y":130,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,17,17,4,4,4],"angle":0},"reactor":{"section_segments":20,"offset":{"x":0,"y":10,"z":-100},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor_top":{"section_segments":10,"offset":{"x":0,"y":23,"z":-100},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,1.8,1.4,1.4,2,1.4,1.6],"z":[0,0,0,0,0,0,0,0]},"width":[3.6,3,2.6,2.4,2,0.4,0],"height":[3.6,3,2.6,2.4,2,0.4,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":16,"z":-60},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,2.0999999999999996,2.4000000000000004],"z":[0,0,0,0,0,0,0,0]},"width":[14.4,12,10.4,9.6,8,1.6,0],"height":[14.4,12,10.4,9.6,8,1.6,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor3":{"section_segments":20,"offset":{"x":10,"y":16,"z":-130},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,2.0999999999999996,2.4000000000000004],"z":[0,0,0,0,0,0,0,0]},"width":[5.4,4.5,3.9000000000000004,3.5999999999999996,3,0.6000000000000001,0],"height":[5.4,4.5,3.9000000000000004,3.5999999999999996,3,0.6000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":15},"propeller_reactor":{"section_segments":8,"offset":{"x":89.7,"y":1,"z":-65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"height":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"propeller_reactor2":{"section_segments":8,"offset":{"x":89.7,"y":1,"z":-85},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"height":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"hub":{"section_segments":8,"offset":{"x":13,"y":6,"z":3},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"hub2":{"section_segments":8,"offset":{"x":13,"y":6,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"lights":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":75,"z":12.4},"position":{"x":[0,0,0,0],"y":[-10,-10,150,150],"z":[0,4.1,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[17],"angle":180},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":75,"z":12.4},"position":{"x":[0,0,0,0],"y":[-10,-10,150,150],"z":[0,4.1,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[[15]],"angle":180},"lights3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":75,"z":12.4},"position":{"x":[0,0,0,0],"y":[-10,-10,150,150],"z":[0,4.1,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[18],"angle":180}},"wings":{"headwings":{"doubleside":true,"offset":{"x":12,"y":120,"z":0},"length":[50],"width":[40,10,40],"angle":[-5,20],"position":[-20,0,0],"texture":[3.2],"bump":{"position":40,"size":12}},"headwings_lights":{"doubleside":true,"offset":{"x":12,"y":118.5,"z":-0.3},"length":[50],"width":[40,10,40],"angle":[-5,20],"position":[-20,0,0],"texture":[17],"bump":{"position":40,"size":0}},"topwings":{"doubleside":true,"offset":{"x":15,"y":140,"z":0},"length":[55],"width":[40,10,40],"angle":[70,70],"position":[-30,5,0],"texture":3.2,"bump":{"position":40,"size":30}},"headwings2":{"doubleside":true,"offset":{"x":20,"y":20,"z":0},"length":[45,10],"width":[30,15,10],"angle":[-5,-5],"position":[-35,0,8],"texture":[8,4],"bump":{"position":45,"size":10}},"headwings2_lights":{"doubleside":true,"offset":{"x":20,"y":18,"z":-0.5},"length":[45,10],"width":[30,15,10],"angle":[-5,-5],"position":[-35,0,8],"texture":[17],"bump":{"position":45,"size":0}},"back":{"offset":{"x":0,"y":210,"z":9},"length":[80,50,10.5],"width":[70,44,23,18],"angle":[-10,-9.5,-9.5],"position":[-175,-143,-125.5,-122],"texture":[8.12,3,4],"doubleside":true,"bump":{"position":35,"size":5}},"back2":{"offset":{"x":0,"y":212,"z":8.9},"length":[80,60],"width":[70,44,26],"angle":[-10,-9.5],"position":[-175,-143,-121],"texture":[18],"doubleside":true,"bump":{"position":35,"size":5}},"back3":{"offset":{"x":0,"y":208,"z":8.8},"length":[80,60],"width":[70,44,26],"angle":[-10,-9.5],"position":[-175,-143,-118],"texture":[17],"doubleside":true,"bump":{"position":35,"size":0}},"top":{"doubleside":true,"offset":{"x":15,"y":65,"z":13},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":15,"y":66,"z":13},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,4,17,63],"bump":{"position":30,"size":-4}},"diamond":{"doubleside":true,"offset":{"x":5,"y":130,"z":10},"length":[15,3,3,-1],"width":[12,12,35,15,0],"angle":[140,140,140,140],"position":[0,0,-8,-6,4],"texture":[4,4,18,17],"bump":{"position":30,"size":25}},"diamond2":{"doubleside":true,"offset":{"x":5,"y":129,"z":10},"length":[15,3,3,-1],"width":[12,12,35,15,0],"angle":[140,140,140,140],"position":[0,0,-8,-6,4],"texture":[4,4,4,17],"bump":{"position":30,"size":25}}},"typespec":{"name":"Brotaur","level":1,"model":8,"code":108,"specs":{"shield":{"capacity":[300,520],"reload":[9,7]},"generator":{"capacity":[150,150],"reload":[70,70]},"ship":{"mass":260,"speed":[90,100],"rotation":[65,78],"acceleration":[90,140]}},"shape":[3.502,2.705,1.784,1.056,0.955,0.884,0.837,0.774,0.799,0.835,0.895,0.983,1.105,1.28,2.13,2.257,2.389,3.512,3.559,2.928,2.673,2.873,2.835,3.168,3.041,2.952,3.041,3.168,2.835,2.873,2.673,2.928,3.559,3.512,2.389,2.257,2.13,1.28,1.105,0.983,0.895,0.835,0.799,0.774,0.837,0.884,0.955,1.056,1.784,2.705],"lasers":[{"x":0,"y":-3.502,"z":-0.288,"angle":0,"damage":[32,32],"rate":1,"type":1,"speed":[160,180],"number":3,"spread":0,"error":0,"recoil":30},{"x":1.854,"y":0.412,"z":-0.144,"angle":0,"damage":[8,8],"rate":5.3,"type":1,"speed":[170,200],"number":2,"spread":3,"error":0,"recoil":0},{"x":-1.854,"y":0.412,"z":-0.144,"angle":0,"damage":[8,8],"rate":5.3,"type":1,"speed":[170,200],"number":2,"spread":3,"error":0,"recoil":0}],"radius":3.559}}',
                            '{"name":"Icarus","level":1,"model":9,"size":2.4,"specs":{"shield":{"capacity":[625,625],"reload":[4,6]},"generator":{"capacity":[100,145],"reload":[60,77]},"ship":{"mass":360,"speed":[90,110],"rotation":[80,95],"acceleration":[70,90]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-61.5,-61,-64.8,-65,-59,-55,-20,-20,-5,40,40,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,1,2.7,3,8,9,11,11,11,11,11,0],"height":[0,1,1.7,2,6,7,9,9,8,8,8,0],"texture":[17,17,17,63,63,10,10,1,11,2,18]},"main2":{"section_segments":8,"offset":{"x":0,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-61.5,-60,-63,-59,-55,-20,-20,-5,39.5,39.5,39.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,2,5.333333333333333,6,7.333333333333333,7.333333333333333,7.333333333333333,7.333333333333333,7.333333333333333,0],"height":[0,2.4,2.4,6.6,8.4,10.799999999999999,10.799999999999999,9.6,9.6,9.6,0],"texture":[17,17,63,63,3,4,4,18],"propeller":true,"laser":{"damage":[9,9],"rate":4.5,"type":1,"speed":[160,200],"number":1,"recoil":0,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-20,"z":15.8},"position":{"x":[0,0,0,0,0,0],"y":[-25,-10,4,7.5,15],"z":[0.5,-2.7,-2.5,-1.5,-2]},"width":[3,6,6,5,4],"height":[3,10,10,8,1],"texture":[9,9,4]},"motor":{"section_segments":8,"offset":{"x":6,"y":-25,"z":10},"position":{"x":[0,0,0,0,0],"y":[5,10,15,60,52],"z":[0,0,0,-2.5,-2.5]},"width":[0,10,10,10,0],"height":[0,5,5,8,0],"texture":[63,63,18,4]},"propulsors":{"section_segments":8,"offset":{"x":10,"y":-17,"z":7.5},"position":{"x":[0,0,0,0],"y":[15,55,56,52],"z":[0,0,0,0]},"width":[4,4,3.2,0],"height":[5,5,4.2,0],"propeller":true,"texture":[12,17]},"propulsors2":{"section_segments":8,"offset":{"x":0,"y":-15,"z":10},"position":{"x":[0,0,0,0],"y":[15,55,56,50],"z":[0,0,0,0]},"width":[6,6,5.2,0],"height":[7,7,6.2,0],"propeller":false,"texture":[12,17]},"wing_holders":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[15,15,20,25,25],"z":[0,0,-5,-10,-10,0]},"width":[0,10,10,10,0],"height":[0,12.5,12.5,12.5,0],"vertical":true,"texture":[1,17.955,4]},"lights":{"section_segments":8,"offset":{"x":0,"y":-10,"z":14},"position":{"x":[0,0,0,0],"y":[10,10,50,50],"z":[0,1.9,-0.4,0]},"width":[0,3.7,2.5,0],"height":[0,5,5,0],"texture":[17],"angle":180},"wings":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":7,"y":-40,"z":13},"position":{"x":[0,5,0,0],"y":[0,0,6,6],"z":[0,0,-5,-5]},"width":[0,5,4,0],"height":[0,1,1,0],"texture":[2],"angle":90},"cannons":{"section_segments":10,"offset":{"x":14,"y":35.5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-91,-89,-88,-80,-80,-73,-72,-71.5,-72],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2,2.5,2,2,2.3,2.3,1.5,0],"height":[0,2,2.5,2,2,2.3,2.3,1.5,0],"texture":[17,1,17,4,17,8,63,18],"angle":0,"laser":{"damage":[52,52],"rate":1,"type":2,"speed":[120,140],"recoil":0,"number":1,"error":1}},"wing_cross":{"section_segments":10,"offset":{"x":0,"y":16,"z":26.6},"position":{"x":[0,0,0,0],"y":[-6,-6,8,8],"z":[1.5909090909090908,1.5909090909090908,-0.13636363636363635,0]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,1,1,0],"texture":[5,17],"angle":180},"wing_cross2":{"section_segments":10,"offset":{"x":0,"y":3,"z":26.6},"position":{"x":[0,0,0,0],"y":[-6,-6,0.4,0.4],"z":[-1.3636363636363635,-1.3636363636363635,-0.045454545454545456,0]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,0.45454545454545453,0.45454545454545453,0],"texture":[5,17],"angle":0},"wing_cross3":{"section_segments":10,"offset":{"x":0,"y":6,"z":28},"position":{"x":[0,0,0,0],"y":[-9.09090909090909,-9.09090909090909,-2.2727272727272725,-2.2727272727272725],"z":[0,0,-1.3636363636363635,-1.3636363636363635]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,0.45454545454545453,0.45454545454545453,0],"texture":[5,17],"angle":90},"wing_cross4":{"section_segments":10,"offset":{"x":0,"y":6,"z":28},"position":{"x":[0,0,0,0],"y":[-9.09090909090909,-9.09090909090909,-2.2727272727272725,-2.2727272727272725],"z":[0,0,-1.3636363636363635,-1.3636363636363635]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,0.45454545454545453,0.45454545454545453,0],"texture":[5,17],"angle":-90},"reactor":{"section_segments":30,"offset":{"x":0,"y":32,"z":-6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-6.4935064935064934,-4.220779220779221,-3.2467532467532467,-3.8961038961038956,-4.058441558441558,-3.2467532467532467,-3.2467532467532467,-3.8961038961038956],"z":[0,0,0,0,0,0,0,0]},"width":[5.416666666666667,5.416666666666667,4.166666666666667,3.75,2.5,1.7500000000000002,1.6666666666666667,0],"height":[5.416666666666667,5.416666666666667,4.166666666666667,3.75,2.5,1.7500000000000002,1.6666666666666667,0],"texture":[1,3,18,17,18,16,17],"vertical":true}},"wings":{"main":{"offset":{"x":0,"y":0,"z":10},"length":[33.333333333333336,8.333333333333334,0,4.166666666666667,0,2.5,12.5,25],"width":[60,35,29,14,14,35,32,5],"angle":[-10,20,20,0,0,0,0],"position":[0,12.5,15,18.333333333333336,20,15.833333333333334,17.5,34.16666666666667],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63,17,4,17,4]},"main2":{"offset":{"x":0,"y":-1,"z":10},"length":[33.333333333333336,8.333333333333334,0,4.166666666666667,0,2.5,10.833333333333334,25],"width":[60,35,29,14,14,35,32,5],"angle":[-10,20,20,0,0,0,0],"position":[0,12.5,15,18.333333333333336,20,15.833333333333334,17.5,34.16666666666667],"doubleside":true,"bump":{"position":30,"size":10},"texture":[8.06,63,17,18,17,17,63]},"main_lights":{"offset":{"x":0,"y":-2,"z":10},"length":[33.333333333333336,8.333333333333334,0,4.166666666666667,0,2.5,12.5,25],"width":[60,35,29,14,14,35,32,5],"angle":[-10,20,20,0,0,0,0],"position":[0,12.5,15,18.333333333333336,20,15.833333333333334,17.5,34.16666666666667],"doubleside":true,"bump":{"position":30,"size":0},"texture":[17]},"detail4":{"doubleside":true,"offset":{"x":23,"y":18,"z":5},"length":[0,5,3.5,3.5,5,0],"width":[0,8,20,40,20,8,0],"angle":[0,0,0,0,-1.5,-1.5],"position":[-2.5,-2.5,-1,-7.5,0,4.5,4.5],"texture":[63,63,17,63,4],"bump":{"position":35,"size":15}},"detail41":{"doubleside":true,"offset":{"x":11,"y":15,"z":6.8},"length":[0,5.882352941176471,4.11764705882353,4.11764705882353,5.882352941176471,0],"width":[0,9.6,24,48,24,9.6,0],"angle":[0,0,0,0,-1.5,-1.5],"position":[-2.5,-2.5,-1,-7.5,0,4.5,4.5],"texture":[63,63,63,4,4],"bump":{"position":35,"size":15}},"top":{"doubleside":true,"offset":{"x":0,"y":20,"z":25},"length":[12.5,1,25,0,3,0,5],"width":[35,35,30,25,10,10,27,20],"angle":[7.5,-25,-25,-25,-25,-25,10],"position":[-7.5,-7.5,-6.5,0,2,3,0,5],"texture":[4,17,4,17,4,4],"bump":{"position":35,"size":10}},"top2":{"doubleside":true,"offset":{"x":0,"y":19.5,"z":25},"length":[12.5,1,25,0,3,0,4.3],"width":[35,35,30,25,10,10,27,20],"angle":[7.5,-25,-25,-25,-25,-25,10],"position":[-7.5,-7.5,-6.5,0,2,3,0,5],"texture":[4,17,18,17,13,17],"bump":{"position":35,"size":10}}},"typespec":{"name":"Icarus","level":1,"model":9,"code":109,"specs":{"shield":{"capacity":[625,625],"reload":[4,6]},"generator":{"capacity":[100,145],"reload":[60,77]},"ship":{"mass":360,"speed":[90,110],"rotation":[80,95],"acceleration":[70,90]}},"shape":[3.363,3.277,2.771,2.468,1.249,1.226,1.238,1.282,1.334,1.425,1.579,1.752,2.278,2.422,2.627,2.932,3.276,3.368,2.728,2.252,1.907,1.788,1.976,1.968,1.984,1.972,1.984,1.968,1.976,1.788,1.907,2.252,2.728,3.368,3.276,2.932,2.627,2.422,2.278,1.752,1.579,1.425,1.334,1.282,1.238,1.226,1.249,2.468,2.771,3.277],"lasers":[{"x":0,"y":-3.264,"z":0.48,"angle":0,"damage":[9,9],"rate":4.5,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.672,"y":-2.664,"z":0.384,"angle":0,"damage":[52,52],"rate":1,"type":2,"speed":[120,140],"number":1,"spread":0,"error":1,"recoil":0},{"x":-0.672,"y":-2.664,"z":0.384,"angle":0,"damage":[52,52],"rate":1,"type":2,"speed":[120,140],"number":1,"spread":0,"error":1,"recoil":0}],"radius":3.368}}',
                            '{"name":"Ragnarok","level":1,"model":10,"size":1,"specs":{"shield":{"capacity":[400,450],"reload":[5,5]},"generator":{"capacity":[150,165],"reload":[90,90]},"ship":{"mass":160,"speed":[110,120],"rotation":[45,80],"acceleration":[85,100]}},"bodies":{"ring":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-130,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"ring2":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-115,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"ring3":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-100,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"disc4":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-85,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"disc5":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-70,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"disc6":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":-56.5,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,12,13,13.5,13,12,11,10,9,8.5,9,10,11],"height":[14,15,16,16.5,16,15,14,13,12,11.5,12,13,14],"vertical":false,"texture":[4,17,4,4,17,4],"angle":0},"disc7":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-40,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-40,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc11":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-20,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc12":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":0,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc13":{"section_segments":6,"offset":{"x":0,"y":-63,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"disc14":{"section_segments":6,"offset":{"x":0,"y":-77,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"disc15":{"section_segments":6,"offset":{"x":0,"y":-91,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"disc16":{"section_segments":6,"offset":{"x":0,"y":-106,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"hub":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":122},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub2":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":107},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub3":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":92},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub4":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":77},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub5":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub6":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":134},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub7":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":25,"z":40},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,1.7999999999999998,2.0999999999999996],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub8":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":25,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,1.7999999999999998,2.0999999999999996],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub9":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,1.7999999999999998,2.0999999999999996],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":55,"y":20,"z":-126},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,7,7,10,6,7],"z":[0,0,0,0,0,0,0,0]},"width":[28.8,24,20.8,19.2,16,3.2,0],"height":[28.8,24,20.8,19.2,16,3.2,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub11":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":-35,"y":126,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,7,7,10,6,7],"z":[0,0,0,0,0,0,0,0]},"width":[28.8,24,20.8,19.2,16,3.2,0],"height":[28.8,24,20.8,19.2,16,3.2,0],"texture":[18,17,17,18,18,17],"vertical":false,"angle":90},"main":{"section_segments":6,"offset":{"x":0,"y":-180,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,-10,-10,30,70,120,100],"z":[0,0,0,0,0,0,0,0]},"width":[0,19,20,30,30,30,0],"height":[0,4,5,20,25,25,0],"texture":[15,17,4,3,8,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-180,"z":15},"position":{"x":[0,0,0,0,0],"y":[0,30,70,120,115],"z":[-8,-1,0,0,0]},"width":[3,11,14,14,0],"height":[0,10,15,15,0],"texture":[9,9,4]},"cockpit_shield":{"section_segments":[0,60,120,180],"offset":{"x":-12,"y":-110,"z":12},"position":{"x":[2,2,0,0,0,0,0],"y":[-40,-38,0,44,46,50,50],"z":[0,1,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,14,14,14,14,0],"texture":[17.3,1,18,63,4,63]},"cockpit_shield2":{"section_segments":[0,60,120,180],"offset":{"x":-11.95,"y":-110,"z":12},"position":{"x":[2,2,0,0,0,0,0],"y":[-40,-38,0,38,40,50,50],"z":[0,1,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,14,14,14,14,0],"texture":[63]},"cannons":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-180,"z":-5},"position":{"x":[-10,-10,-10,-3,-3,-3,-3,-3],"y":[20,11,10,40,70,120,100],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,5,10,10,10,0],"height":[0,4,5,15,15,15,0],"texture":[17,17,3,2,2,2,17]},"tong_joints":{"section_segments":8,"offset":{"x":61.8,"y":-20,"z":0},"position":{"x":[-14,-14,-25,-15,0,0.6,0,0],"y":[-120,-120,-40,-30,100,120,120],"z":[-5,-5,-3.5,0,0,0,0,0]},"width":[0,7,7,7,7,4,0],"height":[0,10,10,25,30,30,0],"texture":[4,63,63],"angle":10},"tong_joints_deco":{"section_segments":8,"offset":{"x":40,"y":-50,"z":0},"position":{"x":[0,0,0,0],"y":[100,100,110,110],"z":[0,0,0,0]},"width":[1,8,8,1],"height":[1,31,31,1],"texture":[17,[15],17],"angle":17},"tong_joints_deco2":{"section_segments":8,"offset":{"x":34.099999999999994,"y":-70,"z":0},"position":{"x":[0,0,0,0],"y":[100,100,110,110],"z":[0,0,0,0]},"width":[1,8,8,1],"height":[0,30,30,0],"texture":[17,[15],17],"angle":17},"tong_joints_deco3":{"section_segments":8,"offset":{"x":28.199999999999996,"y":-90,"z":0},"position":{"x":[0,0,0,0],"y":[100,100,110,110],"z":[0,0,0,0]},"width":[1,8,8,1],"height":[-1,29,29,-1],"texture":[17,[15],17],"angle":17},"shields":{"section_segments":12,"offset":{"x":64,"y":-60,"z":-125},"position":{"x":[10,10,20,25,20,10,10],"y":[20,20,40,60,80,100,100],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,50,50,50,50,50,0],"vertical":true,"angle":0,"texture":[3,8,8,8,8,3]},"shields_deco":{"section_segments":6,"offset":{"x":65,"y":-60,"z":-105},"position":{"x":[10,10,20,25,20,10,10],"y":[20,20,40,60,80,100,100],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,12.5,12.5,12.5,12.5,12.5,0],"vertical":true,"texture":[2.9,63,63,63,63,2.9]},"shields_deco2":{"section_segments":6,"offset":{"x":65,"y":-60,"z":-145},"position":{"x":[10,10,20,25,20,10,10],"y":[20,20,40,60,80,100,100],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,12.5,12.5,12.5,12.5,12.5,0],"vertical":true,"texture":[2.9,63,63,63,63,2.9]},"shields_deco3":{"section_segments":12,"offset":{"x":66,"y":-30,"z":-125},"position":{"x":[10,10,20,25,20,10,10],"y":[10,10,20,30,40,50,50],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,25,25,25,25,25,0],"vertical":true,"angle":0,"texture":[63]},"joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-48,-48,-10,0,10,48,48],"z":[0,0,20,20,20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"angle":90,"texture":[13,13,3,3,13,13]},"joint2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,20,20,20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"angle":90,"texture":[13,13,3,3,13,13]},"joint3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-48,-48,-10,0,10,48,48],"z":[0,0,-20,-20,-20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"joint4":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,-20,-20,-20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"joint5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,20,20,20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"joint6":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,-20,-20,-20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"propeller1":{"section_segments":8,"offset":{"x":68,"y":80,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller2":{"section_segments":8,"offset":{"x":68,"y":80,"z":-12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller3":{"section_segments":8,"offset":{"x":42,"y":80,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller4":{"section_segments":8,"offset":{"x":42,"y":80,"z":-12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller_band":{"section_segments":[30,60,120,150,210,240,300,330],"offset":{"x":55,"y":102,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-4.5,-7,-7,-4.5,4.5,7,4.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[27,27,29,32,34,34,32,29,27,27],"height":[27,27,29,32,34,34,32,29,27,27],"texture":[7]},"propeller_band2":{"section_segments":[30,60,120,150,210,240,300,330],"offset":{"x":55,"y":150,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-4.5,-7,-7,-4.5,4.5,7,4.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[27,27,29,32,34,34,32,29,27,27],"height":[27,27,29,32,34,34,32,29,27,27],"texture":[7]},"propeller_front":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":-75,"y":80,"z":0},"position":{"x":[10,10,10,-5,-10,-10],"y":[-4,0,20,40,42,42],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,18,18,18,17,0],"angle":90,"texture":[7]},"cannon_rear":{"section_segments":12,"offset":{"x":0,"y":-80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-112.5,-90,-93,-94.5,-90,-67.5,-70.5,-73.5,-67.5,-45,-49.5,-52.5,-45,-22.5,-27,-30,-22.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,3,4,6,3,4,6,8,5,6,7,11,7,8,12,15,8,10],"height":[0,2,3,4,6,3,4,6,8,5,6,7,11,7,8,12,15,8,10],"angle":180,"propeller":false,"texture":[4,4,8,13,17,4,2,2,17,4,2,2,17,4,2,2,17,4]},"disc":{"section_segments":6,"offset":{"x":0,"y":-57,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-5,-3,-3,3,3,5,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24.200000000000003,24.200000000000003,24.200000000000003,27.500000000000004,27.500000000000004,27.500000000000004,27.500000000000004,24.200000000000003,24.200000000000003,24.200000000000003],"height":[26.4,26.4,26.4,30,30,30,30,26.4,26.4,26.4],"texture":[18,18,18,18,18,17]},"backrecoil":{"section_segments":12,"offset":{"x":55,"y":140,"z":0},"position":{"x":[1,1],"y":[1,5],"z":[1,1]},"width":[1,1],"height":[1,1],"angle":180,"laser":{"damage":[28,28],"rate":1.5,"type":2,"speed":[180,230],"number":2,"angle":3,"error":2,"recoil":80}},"backrecoil2":{"section_segments":12,"offset":{"x":0,"y":30,"z":0},"position":{"x":[0,0],"y":[1,5],"z":[0,0]},"width":[1,1],"height":[1,1],"angle":180,"laser":{"damage":[13,13],"rate":6,"type":2,"speed":[180,200],"number":1,"angle":0,"error":5,"recoil":30}}},"typespec":{"name":"Ragnarok","level":1,"model":10,"code":110,"specs":{"shield":{"capacity":[400,450],"reload":[5,5]},"generator":{"capacity":[150,165],"reload":[90,90]},"ship":{"mass":160,"speed":[110,120],"rotation":[45,80],"acceleration":[85,100]}},"shape":[3.808,3.816,3.144,2.27,1.693,1.375,1.37,1.346,1.276,1.235,1.212,1.224,1.258,1.343,1.405,1.563,1.712,1.989,2.522,2.995,3.521,3.927,3.868,3.659,3.543,0.651,3.543,3.659,3.868,3.927,3.521,2.995,2.522,1.989,1.712,1.563,1.405,1.343,1.258,1.224,1.212,1.235,1.276,1.346,1.37,1.375,1.693,2.27,3.144,3.816],"lasers":[{"x":1.08,"y":2.78,"z":0,"angle":180,"damage":[28,28],"rate":1.5,"type":2,"speed":[180,230],"number":2,"spread":3,"error":2,"recoil":80},{"x":-1.08,"y":2.78,"z":0,"angle":-180,"damage":[28,28],"rate":1.5,"type":2,"speed":[180,230],"number":2,"spread":3,"error":2,"recoil":80},{"x":0,"y":0.58,"z":0,"angle":180,"damage":[13,13],"rate":6,"type":2,"speed":[180,200],"number":1,"spread":0,"error":5,"recoil":30}],"radius":3.927}}',
                        ]
                    },
                    {
                        ORIGIN: "ASC-095's Ships",
                        CODES: [
                            '{"name":"Prototype M-1","level":1,"model":1,"size":2,"specs":{"shield":{"capacity":[375,375],"reload":[18,18]},"generator":{"capacity":[320,320],"reload":[45,45]},"ship":{"mass":250,"speed":[95,95],"rotation":[70,70],"acceleration":[110,110]}},"bodies":{"cannonSideInner":{"section_segments":6,"offset":{"x":20,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-96,-98,-100,-96,-60,-24,-20,0,40,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3.2,4.800000000000001,6.4,8,11.200000000000001,14.4,14.4,11.200000000000001,0],"height":[0,3.2,4.800000000000001,6.4,8,11.200000000000001,14.4,17.6,16,0],"angle":0,"laser":{"damage":[10,10],"rate":4,"type":1,"speed":[100,100],"number":15,"error":0,"recoil":10},"propeller":false,"texture":[16.9,4,16.9,13,4,17,10,63,4]},"cannonSideOuter":{"section_segments":6,"offset":{"x":70,"y":35,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-48,-49,-50,-48,-30,-12,-10,0,20,30],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,1.6,2.4000000000000004,3.2,4,5.6000000000000005,7.2,7.2,5.6000000000000005,0],"height":[0,1.6,2.4000000000000004,3.2,4,5.6000000000000005,7.2,8.8,8,0],"angle":3,"laser":{"damage":[6,6],"rate":8,"type":1,"speed":[160,160],"number":1,"error":5},"propeller":false,"texture":[16.9,4,16.9,13,4,17,11,63,4]},"top":{"section_segments":6,"offset":{"x":28,"y":-47,"z":-25},"position":{"x":[0,0,0,0,0],"y":[-79,-79.5,-80,-60],"z":[0,0,0,0,0,0]},"width":[0,6,8,10,0],"height":[0,6,8,10,0],"angle":150,"vertical":true,"propeller":false,"texture":[16.9,15.4,3.9]},"sidething":{"section_segments":6,"offset":{"x":11,"y":35,"z":0},"position":{"x":[0,0,0,0,0],"y":[-79,-79.5,-80,-60],"z":[0,0,0,0,0,0]},"width":[0,13.200000000000001,17.6,22,0],"height":[0,7.5,10,12.5,0],"angle":90,"propeller":false,"texture":[16.9,13,3.9]},"mainBody":{"section_segments":6,"offset":{"x":0,"y":5,"z":5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-62,-60,-40,-4,0,40,60,56],"z":[0,0,0,0,0,0,0,0]},"width":[0,8,14.4,20.8,22.400000000000002,19.200000000000003,12.8,0],"height":[0,8,14.4,20.8,22.400000000000002,19.200000000000003,12.8,0],"propeller":true,"texture":[3.9,9,9,17,10,13,16.9]},"outer":{"section_segments":[0,60,120,180],"offset":{"x":-40,"y":-25,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-70,-70,40,80,110],"z":[0,0,0,0,0,0]},"width":[0,5,25,25,0],"height":[0,10,25,25,0],"texture":[2.9,4,63,2.9]},"inner":{"section_segments":[0,60,120,180],"offset":{"x":40,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-53.84615384615385,-53.84615384615385,30.769230769230766,61.53846153846153,69.23076923076923],"z":[0,0,0,0,0,0]},"width":[0,3.3333333333333335,16.666666666666668,16.666666666666668,0],"height":[0,7.692307692307692,19.23076923076923,11.538461538461538,0],"texture":[3.9,3,18,63]}},"wings":{"main":{"length":[0,10],"width":[50,50,10],"angle":[90,90],"position":[10,10,40],"doubleside":true,"offset":{"x":0,"y":15,"z":25},"bump":{"position":30,"size":10},"texture":[63]}},"typespec":{"name":"Prototype M-1","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[375,375],"reload":[18,18]},"generator":{"capacity":[320,320],"reload":[45,45]},"ship":{"mass":250,"speed":[95,95],"rotation":[70,70],"acceleration":[110,110]}},"shape":[2.28,4.683,4.7,4.193,4.156,3.523,3.115,2.816,2.615,2.477,2.394,2.858,2.857,2.919,3.043,3.269,3.471,3.745,3.866,3.394,3.536,3.758,2.529,2.525,2.638,2.605,2.638,2.525,2.529,3.758,3.536,3.394,3.866,3.745,3.471,3.269,3.043,2.919,2.857,2.858,2.394,2.477,2.615,2.816,3.115,3.523,4.156,4.193,4.7,4.683],"lasers":[{"x":0.8,"y":-4.6,"z":-0.4,"angle":0,"damage":[10,10],"rate":4,"type":1,"speed":[100,100],"number":15,"spread":0,"error":0,"recoil":10},{"x":-0.8,"y":-4.6,"z":-0.4,"angle":0,"damage":[10,10],"rate":4,"type":1,"speed":[100,100],"number":15,"spread":0,"error":0,"recoil":10},{"x":2.695,"y":-0.597,"z":0,"angle":3,"damage":[6,6],"rate":8,"type":1,"speed":[160,160],"number":1,"spread":0,"error":5,"recoil":0},{"x":-2.695,"y":-0.597,"z":0,"angle":-3,"damage":[6,6],"rate":8,"type":1,"speed":[160,160],"number":1,"spread":0,"error":5,"recoil":0}],"radius":4.7}}'
                        ]
                    }
                ]
            },
            {
                TIER: 2,
                SHIPS: [
                    {
                        ORIGIN: "CTF v1.5",
                        CODES: [  
                            '{"name":"Vanquisher","level":2,"model":1,"size":2.2,"specs":{"shield":{"capacity":[730,730],"reload":[7,7]},"generator":{"capacity":[280,280],"reload":[135,135]},"ship":{"mass":460,"speed":[70,70],"rotation":[50,50],"acceleration":[170,170]}},"bodies":{"main":{"section_segments":12,"offset":{"x":50,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-80,-37,-30,-17,-10,10,17,30,40,40,45,45,80,80,85,85,99,99,90,86],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6.7,6.7,12.5,12.5,15,15,20,25,25,23,23,25,25,20,20,25,22,17,15,0],"height":[0,6.7,6.7,12.5,12.5,15,15,20,25,25,23,23,25,25,20,20,25,22,17,15,0],"texture":[12,18,8,10,1,17,4,18,8,4,17,4,13,4,17,4,63,63,12,17],"propeller":1,"laser":{"damage":[22.22,22.22],"rate":0.5,"type":1,"speed":[210,210],"recoil":40,"number":5,"error":0.1}},"main1":{"section_segments":12,"offset":{"x":0,"y":-20,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-42,-46,-45,-35,-15,30,65,65,80,79,85,84,93,93,85],"z":[0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5]},"width":[10,13,15,18,22,24,22,24,23,20,20,15,15,10,0],"height":[0,7,10,15,15,15,15,24,23,20,20,15,15,10,0],"texture":[17,63,63,4,3,4,3,2,17,3,17,4,18,17],"propeller":1},"main2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":12,"y":-20,"z":-15},"position":{"x":[-1,-1,0,2,4,5,5,5],"y":[-50,-50,-45,-35,-15,30,55,65,55],"z":[-1,-1,2,3,8,8,8,8,0]},"width":[0,5,5,5,5,5,5,5,0],"height":[0,6,11,11,7,7,7,7,0],"texture":[63]},"main2b":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":11.8,"y":-20.5,"z":-14},"position":{"x":[-1,-1,0,2,4,5,0,0],"y":[-50,-50,-45,-35,-15,30,5,65,55],"z":[-1,-1,2,3,8,8,0,0,0]},"width":[0,2,2,2,2,2,2,2,0],"height":[0,6,11,11,7,7,7,7,0],"texture":[3]},"Connector":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":22,"y":-10,"z":-28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-16,-20,-20,-13,-8,11,17,23,23,23],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,3,5,5,5,5,5,5,3,0],"height":[12,12,10,20,23,23,23,10,16,16,0],"texture":[12.06,17,4,63,17,18,17,63,63,17],"angle":70,"vertical":1},"Connector2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":22,"y":-15,"z":37},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-16,-20,-20,-13,-8,11,17,23,23,23],"z":[0,0,0,0,0,0,-5,-5,-5,0,0,0,0,0]},"width":[0,3,3,3,3,3,3,3,3,3,0],"height":[0,3,3,3,3,3,3,3,3,3,0],"texture":[17],"angle":70,"vertical":1},"Connector3":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":22,"y":-15,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-16,-20,-20,-13,-8,11,17,23,23,23],"z":[0,0,0,0,0,0,-5,-5,-5,0,0,0,0,0]},"width":[0,3,3,3,3,3,3,3,3,3,0],"height":[0,3,3,3,3,3,3,3,3,3,0],"texture":[17],"angle":70,"vertical":1},"cockpitTop":{"section_segments":[45,125,235,315],"offset":{"x":0,"y":-29.5,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-17,-11.5,10,30,30],"z":[0,0,0,-1.5,0,0,0,0,0]},"width":[0,9.5,16.5,17,0],"height":[1.8,2,2,4,0],"texture":[3]},"cockpitTop2":{"section_segments":[45,125,235,315],"offset":{"x":5,"y":-29.5,"z":9.5},"position":{"x":[-3,-1,3,3,0,0,0,0,0],"y":[-12,-7,10,30,30],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[0.5,2,3,3,0],"height":[1.8,2,2,4,0],"texture":[63]},"cockpitTop3":{"section_segments":[45,125,235,315],"offset":{"x":0,"y":-29.5,"z":9.5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-5,0,10,30,30],"z":[0,0,0,-1.5,0,0,0,0,0]},"width":[0.5,2,4,4,0],"height":[1.8,2,2,4,0],"texture":[4]},"windshield":{"section_segments":3,"offset":{"x":0,"y":-30,"z":4},"position":{"x":[-30,-11,10,15,10,-11,-30],"y":[-14,-12,-7,0,7,12,14],"z":[0,0,0,0,0,0,0]},"width":[0,20,10,10,10,20,0],"height":[0,5,5,5,5,5,0],"texture":[7,8.7,8.3,8.3,8.7,7],"angle":90},"cockpitbottom":{"section_segments":[45,132,228,315],"offset":{"x":0,"y":-29.5,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-24,-18.5,-5,30,30],"z":[0,0,0,1.5,0,0,0,0,0]},"width":[0,10.5,18,20,0],"height":[5,5,5,7,0],"texture":[4]},"disc":{"section_segments":6,"offset":{"x":50,"y":-106,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-10,-7,-7,7,7,10,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[5.199999999999999,5.199999999999999,5.199999999999999,9.2,9.2,9.2,9.2,5.199999999999999,5.199999999999999,5.199999999999999],"height":[6,6,6,10,10,10,10,6,6,6],"texture":[1,1,1,1,16.9,1],"propeller":0},"ring1":{"section_segments":8,"offset":{"x":50,"y":37,"z":31},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-17,-15,-5,-4,4,5,10,8,5,5],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,9,9,10,10,10,8,5,5,0],"height":[0,9,9,9,10,10,10,8,5,5,0],"texture":[63,63,8,63,18,4,10,63,17],"propeller":false},"ring2":{"section_segments":8,"offset":{"x":50,"y":1,"z":31},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-3,-2,-2,2,2,3,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[8,8,8,9,9,9,9,8,8,8],"height":[8,8,8,9,9,9,9,8,8,8],"texture":[1,1,1,1,63,1],"propeller":false},"ring3":{"section_segments":16,"offset":{"x":50,"y":75,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-3,-7,-5,5,10,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[13,13,13,25,26,28,27,13,20,20],"height":[13,13,13,25,26,28,27,13,20,20],"texture":[17,17,17,63,8,63,17,1],"propeller":false},"rocketlauncherguns1":{"section_segments":8,"offset":{"x":50,"y":15,"z":35},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-38,-35,-20,-17,10],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,3,2.8,3,4,4,0],"height":[0,2,3,3,3,2.8,3,4,4,0],"texture":[17,3,17,13,2,2,3,17,3],"laser":{"damage":[7,7],"rate":10,"type":2,"speed":[160,160],"number":1,"angle":0,"error":1,"recoil":5}},"rocketlauncherguns2":{"section_segments":8,"offset":{"x":54,"y":15,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-38,-35,-20,-17,10],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,3,2.8,3,4,4,0],"height":[0,2,3,3,3,2.8,3,4,4,0],"texture":[17,3,17,13,2,2,3,17,3],"laser":{"damage":[10,10],"rate":4,"type":2,"speed":[180,180],"number":1,"angle":0,"error":1,"recoil":5}},"rocketlauncherguns3":{"section_segments":8,"offset":{"x":46,"y":15,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-38,-35,-20,-17,10],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,3,2.8,3,4,4,0],"height":[0,2,3,3,3,2.8,3,4,4,0],"texture":[17,3,17,13,2,2,3,17,3],"laser":{"damage":[10,10],"rate":5,"type":2,"speed":[190,190],"number":1,"angle":0,"error":1,"recoil":5}},"cannon":{"section_segments":8,"offset":{"x":50,"y":-33,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,-10,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,8,10,10,8,0],"height":[0,8,9,9,8,0],"angle":0,"texture":[3,3,17,3,3]},"cannon2":{"section_segments":8,"offset":{"x":60,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,-10,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,0,9,9,8,0],"height":[0,8,10,10,8,0],"angle":0,"texture":[3,3,17,3,3]},"cannon3":{"section_segments":8,"offset":{"x":40,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,-10,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,0,9,9,8,0],"height":[0,8,10,10,8,0],"angle":0,"texture":[3,3,17,3,3]},"cannon4":{"section_segments":[45,135,225,315],"offset":{"x":55,"y":-5,"z":18},"position":{"x":[0,0,0,0,0,2],"y":[0,0,0,10,12,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon5":{"section_segments":[45,135,225,315],"offset":{"x":45,"y":-5,"z":18},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,10,12,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon6":{"section_segments":[45,135,225,315],"offset":{"x":63,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,4],"y":[0,0,0,10,12,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon7":{"section_segments":[45,135,225,315],"offset":{"x":-37,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,4],"y":[0,0,0,10,12,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon8":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-24,"z":3},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,20,20,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,5,0],"height":[0,6,0,5,5,0],"angle":180,"texture":[63]},"cannon9":{"section_segments":[45,135,225,315],"offset":{"x":-62.5,"y":-24,"z":3},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,20,20,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,5,0],"height":[0,6,0,5,5,0],"angle":180,"texture":[63]},"cannon10":{"section_segments":[45,135,225,315],"offset":{"x":-60,"y":-24,"z":9},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,18,20,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"cannon11":{"section_segments":[45,135,225,315],"offset":{"x":54,"y":-24,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[0,0,0,18,20,28],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"cannon12":{"section_segments":[45,135,225,315],"offset":{"x":-46,"y":-24,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[0,0,0,18,20,28],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"cannon13":{"section_segments":[45,135,225,315],"offset":{"x":-40,"y":-24,"z":9},"position":{"x":[0,0,0,0,0,2],"y":[0,0,0,18,20,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"Gunsnsnss":{"section_segments":[45,135,225,315],"offset":{"x":33,"y":-5,"z":0},"position":{"x":[0,0,0,-10,-10],"y":[34,34,90,100,100],"z":[0,0,0,0,0]},"width":[0,2,2,2,2],"height":[0,2,2,2,2],"texture":[17],"angle":180},"Gunsnsnss2":{"section_segments":[45,135,225,315],"offset":{"x":67,"y":-5,"z":0},"position":{"x":[0,0,0,10,10],"y":[34,34,90,100,100],"z":[0,0,0,0,0]},"width":[0,2,2,2,2],"height":[0,2,2,2,2],"texture":[17],"angle":180},"Holder":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":50,"y":25,"z":22},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4,4,4,63,4,4],"angle":0},"Holder2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":50,"y":34,"z":22},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4,4,4,63,4,4],"angle":0},"Holder3":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":48,"y":63,"z":24},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,-2,-2,-2,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,10,10,10],"height":[0,0,0,3,3,0,0,0],"texture":[4],"angle":90},"Holder4":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":73,"y":0,"z":-63},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,-2,-2,-2,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,3,3,0,0,0],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0,"vertical":1},"Holder5":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":26,"y":0,"z":-63},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,-2,-2,-2,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,3,3,0,0,0],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0,"vertical":1},"Side":{"section_segments":10,"offset":{"x":83,"y":24,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-24,-22,-17,-7,-7,17,17,27,32,34],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,10,8,8,10,10,7,0],"height":[0,7,10,10,8,8,10,10,7,0],"texture":[11,63,18,4,17,4,18,63,11],"angle":0},"side2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":17,"y":-38,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-22,-17,-7,-7,17,17,27,32,34],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,10,8,8,10,10,7,0],"height":[0,7,10,10,8,8,10,10,7,0],"texture":[17,63,18,4,17,4,18,63,11],"angle":0},"d1":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":83,"y":-2,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[25,25,25,27,27,25,25,25],"texture":[63],"angle":0,"vertical":10},"d2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":79.5,"y":0,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,1,1,1,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[25,25,25,27,27,25,25,25],"texture":[63],"angle":90,"vertical":10},"d3":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":70,"y":11,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[15,15,15,18,18,15,15,15],"texture":[4],"angle":0},"d4":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":70,"y":41,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[15,15,15,18,18,15,15,15],"texture":[4],"angle":0},"d5":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":5,"y":-45,"z":-6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[3,0,0,0,3,3,3,2],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,5,5,25,17,5,5,5],"height":[5,5,5,7,7,5,5,5],"texture":[3],"angle":95},"d6":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":10,"y":-10,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[8,8,8,12,12,8,8,8],"texture":[17],"angle":0},"d7":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":10,"y":-20,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[8,8,8,12,12,8,8,8],"texture":[17],"angle":0},"d8":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":10,"y":-30,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[8,8,8,12,12,8,8,8],"texture":[17],"angle":0},"d9":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":0,"y":46,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,10,17,17,10,10,10],"height":[8,8,8,12,12,8,8,8],"texture":[4],"angle":0},"d10":{"section_segments":8,"offset":{"x":25,"y":30,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[12,12,12,19,19,12,12,12],"height":[10,10,10,17,17,10,10,10],"texture":[3],"angle":0},"d11":{"section_segments":8,"offset":{"x":25,"y":20,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[12,12,12,19,19,12,12,12],"height":[10,10,10,17,17,10,10,10],"texture":[3],"angle":0},"C1":{"section_segments":[45,85,135,225,275,315],"offset":{"x":0,"y":22,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-24,-24,-18,-13,-10,20,23,30,34,34],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,23,23,18,18,23,23,22,0],"height":[0,20,23,23,18,18,23,23,22,0],"texture":[3,63,4,4,17,4,8,63,63],"angle":0},"C2":{"section_segments":[45,125,235,315],"offset":{"x":7,"y":20.5,"z":11},"position":{"x":[0,0,-4,-4,0,0,-1,-1,0],"y":[-12,-5,0,12,16,30,70,70],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[4,4,4,4,4,4,2,0],"height":[4,4,4,4,4,4,2,0],"texture":[63]},"C3":{"section_segments":[45,125,235,315],"offset":{"x":11,"y":20.5,"z":9},"position":{"x":[0,0,0,0,0,0,-2,-2,0],"y":[-12,-5,0,12,16,30,60,60],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[3,3,3,3,3,3,2,0],"height":[4,4,4,4,4,4,2,0],"texture":[3.1]},"C4":{"section_segments":[45,125,235,315],"offset":{"x":19,"y":20.5,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-12,-5,0,12,16,30],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[3,3,3,3,3,3,0],"height":[4,4,4,4,4,4,0],"texture":[63]},"C5":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":8,"y":14,"z":1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0},"C6":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":8,"y":24,"z":1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0},"C7":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":8,"y":34,"z":1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0}},"wings":{"main1":{"doubleside":true,"offset":{"x":50,"y":-83,"z":10},"length":[2,8,0,5],"width":[10,12,10,61,10],"angle":[70,30,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[0,8,13,63],"bump":{"position":35,"size":10}},"main2":{"doubleside":true,"offset":{"x":-50,"y":-83,"z":10},"length":[2,8,0,5],"width":[10,12,10,61,10],"angle":[70,30,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[0,8,13,63],"bump":{"position":35,"size":10}},"main3":{"doubleside":true,"offset":{"x":-58,"y":-78,"z":-20},"length":[1,8,0,5],"width":[10,12,10,80,10],"angle":[0,40,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[63,63,63,63],"bump":{"position":35,"size":10}},"main4":{"doubleside":true,"offset":{"x":43,"y":-78,"z":-20},"length":[1,8,0,5],"width":[10,12,10,80,10],"angle":[0,40,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[63,63,63,63],"bump":{"position":35,"size":10}}},"typespec":{"name":"Vanquisher","level":2,"model":1,"code":201,"specs":{"shield":{"capacity":[730,730],"reload":[7,7]},"generator":{"capacity":[280,280],"reload":[135,135]},"ship":{"mass":460,"speed":[70,70],"rotation":[50,50],"acceleration":[170,170]}},"shape":[2.91,3.149,6.058,6.368,6.018,5.209,4.722,4.128,3.719,3.462,3.263,3.236,3.305,4.102,4.185,4.359,4.644,4.651,4.605,5.046,4.852,4.429,4.133,3.932,3.996,3.99,3.996,3.932,4.133,4.429,4.852,5.046,4.605,4.651,4.644,4.359,4.185,4.102,3.652,3.236,3.263,3.462,3.719,4.128,4.722,5.209,6.018,6.368,6.058,3.149],"lasers":[{"x":2.2,"y":-5.016,"z":0,"angle":0,"damage":[22.22,22.22],"rate":0.5,"type":1,"speed":[210,210],"number":5,"spread":0,"error":0.1,"recoil":40},{"x":-2.2,"y":-5.016,"z":0,"angle":0,"damage":[22.22,22.22],"rate":0.5,"type":1,"speed":[210,210],"number":5,"spread":0,"error":0.1,"recoil":40},{"x":2.2,"y":-1.012,"z":1.54,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[160,160],"number":1,"spread":0,"error":1,"recoil":5},{"x":-2.2,"y":-1.012,"z":1.54,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[160,160],"number":1,"spread":0,"error":1,"recoil":5},{"x":2.376,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":4,"type":2,"speed":[180,180],"number":1,"spread":0,"error":1,"recoil":5},{"x":-2.376,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":4,"type":2,"speed":[180,180],"number":1,"spread":0,"error":1,"recoil":5},{"x":2.024,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":5,"type":2,"speed":[190,190],"number":1,"spread":0,"error":1,"recoil":5},{"x":-2.024,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":5,"type":2,"speed":[190,190],"number":1,"spread":0,"error":1,"recoil":5}],"radius":6.368}}',
                            '{"name":"Sunder","level":2,"model":2,"size":1.6,"specs":{"shield":{"capacity":[800,800],"reload":[8,8]},"generator":{"capacity":[240,240],"reload":[240,240]},"ship":{"mass":555,"speed":[65,65],"rotation":[25,25],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":6,"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-195,-160,-80,0,80,120,141,141,131],"z":[6,2,0,0,0,0,0,0,0]},"width":[10,25,30,30,30,10,13,12,0],"height":[0,20,20,20,20,20,16,15,0],"texture":[63,1.9,1.9,1.9,1.9,4,16.9],"propeller":true},"center_ridge":{"section_segments":7,"offset":{"x":0,"y":15,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-197,-195,-190,-160,-156,0,80,120,140,140],"z":[-11,-11,-10,0,0,0,0,-4,0,0]},"width":[4,8,12,20,20,20,20,17,17,0],"height":[0,2,3,13,13,13,13,10,6,0],"texture":[63,63,7,63,2.9,2.9,8,12.9]},"big_guns":{"section_segments":8,"offset":{"x":30,"y":-35,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-110,-130,-125,-50,-46,-20,-16,-16],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,7,7,8,8,7,0],"height":[0,5,7,7,8,8,7,0],"texture":[17,63,2,13,3,63,2],"laser":{"damage":[14,14],"recoil":0,"speed":[220,220],"error":0,"angle":0,"rate":10,"number":1}},"turret_platforms":{"section_segments":[45,135,225,315],"angle":90,"offset":{"x":45,"y":15,"z":0},"position":{"x":[0,0,0,-20,-10,-10,0,0],"y":[-20,-20,10,10,25,25],"z":[0,0,0,0,-10,-10,0,0]},"width":[0,120,80,50,35,0],"height":[0,10,5,3,3,0],"texture":[2,1,63]},"angled_plate_thing":{"section_segments":[45,135,225,315],"angle":47.5,"offset":{"x":67,"y":-26,"z":3},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3},"angled_plate_thing1":{"section_segments":[45,135,225,315],"angle":47.5,"offset":{"x":67,"y":-26,"z":3.1},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,0.5,0.5,0],"height":[0,4,4,0],"texture":17},"angled_plate_thing2":{"section_segments":[45,135,225,315],"angle":133.5,"offset":{"x":67,"y":55,"z":3},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3},"angled_plate_thing3":{"section_segments":[45,135,225,315],"angle":133.5,"offset":{"x":67,"y":55,"z":3.1},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,0.5,0.5,0],"height":[0,4,4,0],"texture":17},"bigbaccengines1":{"section_segments":12,"offset":{"x":25,"y":110,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,5,-1,1,15,20,40,45,60,60,50],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,9,10,11,11,10,9,6,5,0],"height":[0,7,9,10,11,11,10,9,6,5,0],"texture":[3,17,4,2,17,2,17,4,17],"propeller":true},"bigbaccengines2":{"section_segments":12,"offset":{"x":40,"y":50,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,5,-1,1,15,20,40,45,60,60,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,9,10,11,11,10,9,6,5,0],"height":[0,3,4,5,6,6,5,4,3,2,0],"texture":[3,17,4,2,17,2,17,4,17],"propeller":true},"ring1":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-79,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring2":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-73,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring3":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-67,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring4":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-61,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring5":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-55,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring7":{"vertical":false,"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-70,"z":18},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[10,20,20,10],"height":[10,20,20,10],"texture":[2,17,2,2],"angle":90},"ring8":{"vertical":false,"section_segments":20,"offset":{"x":0,"y":-70,"z":17},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[10,20,20,10],"height":[7.5,15,15,7.5],"texture":[2,17,2,2],"angle":0},"ring9":{"vertical":false,"section_segments":20,"offset":{"x":0,"y":128,"z":15},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[8.5,17,17,8.5],"height":[6,12,12,6],"texture":[2,17,2,2],"angle":0},"ring10":{"vertical":false,"section_segments":[-95,-90,-80,-70,-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60,70,80,90,95],"offset":{"x":0,"y":153.1,"z":13},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[8.5,17,17,8.5],"height":[7.5,15,15,7.5],"texture":[2,17,2,2],"angle":0},"tubething1":{"section_segments":6,"offset":{"x":30,"y":-11,"z":95},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":20},"tubething2":{"section_segments":6,"offset":{"x":30,"y":-11,"z":112},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":20},"tubething3":{"section_segments":6,"offset":{"x":0,"y":24,"z":-15},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":0},"tubething4":{"section_segments":6,"offset":{"x":0,"y":24,"z":20},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":0},"tubething5":{"section_segments":6,"offset":{"x":0,"y":24,"z":-50},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":0},"plate1":{"section_segments":[45,135,225,315],"offset":{"x":32,"y":-104,"z":-6},"position":{"x":[0,0,0,0],"y":[-4,-4,4,4],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3,"angle":0},"plate2":{"section_segments":[45,135,225,315],"offset":{"x":32,"y":-137,"z":-4.5},"position":{"x":[0,0,0,0],"y":[-23,-23,23,23],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":3,"angle":0},"plate3":{"section_segments":[45,135,225,315],"offset":{"x":52,"y":15,"z":3},"position":{"x":[0,0,0,0],"y":[-55,-55,55,55],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3,"angle":0},"plate4":{"section_segments":[45,135,225,315],"offset":{"x":19.7,"y":-25,"z":12},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,1,1,0],"texture":63,"angle":0},"plate5":{"section_segments":[45,135,225,315],"offset":{"x":52,"y":15,"z":3.1},"position":{"x":[0,0,0,0],"y":[-55,-55,55,55],"z":[0,0,0,0]},"width":[0,0.5,0.5,0],"height":[0,4,4,0],"texture":17,"angle":0},"deco1":{"vertical":true,"section_segments":[-140,-130,-50,-40,40,50,130,140],"offset":{"x":32,"y":-4,"z":138},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,20,20,0],"texture":[3,2,16.99,17],"angle":20},"deco2":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":17.7,"y":20,"z":-94},"position":{"x":[0,0,0,0],"y":[-9,-9,9,9],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":63,"angle":-19},"deco3":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":7.7,"y":30,"z":-94},"position":{"x":[0,0,0,0],"y":[-8.4,-8.4,8.4,8.4],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":63,"angle":-74},"cover1":{"section_segments":6,"offset":{"x":25,"y":155,"z":18},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-3,-3]},"width":[0,5,2,0],"height":[0,1,1,0],"texture":2.9,"angle":0},"cover2":{"section_segments":6,"offset":{"x":25,"y":155,"z":18.5},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-3,-3]},"width":[0,1.5,0.5,0],"height":[0,1,1,0],"texture":16.9,"angle":0},"cover3":{"section_segments":6,"offset":{"x":25,"y":155,"z":2},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,3,3]},"width":[0,5,2,0],"height":[0,1,1,0],"texture":2.9,"angle":0},"cover4":{"section_segments":6,"offset":{"x":33.1,"y":155,"z":10},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1.5,0.5,0],"texture":16.9,"angle":0},"cover5":{"section_segments":6,"offset":{"x":33,"y":155,"z":10},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,5,2,0],"texture":2.9,"angle":0},"cover6":{"section_segments":6,"offset":{"x":17,"y":155,"z":10},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,5,2,0],"texture":2.9,"angle":0},"cover7":{"section_segments":6,"offset":{"x":16.9,"y":155,"z":10},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1.5,0.5,0],"texture":16.9,"angle":0},"cover8":{"section_segments":6,"offset":{"x":40,"y":95,"z":3},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-1,-1]},"width":[0,4,1.8,0],"height":[0,1,0.5,0],"texture":2.9,"angle":0},"cover9":{"section_segments":6,"offset":{"x":40,"y":95,"z":3.2},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-1,-1]},"width":[0,1.6,0.5,0],"height":[0,1,0.5,0],"texture":16.9,"angle":0},"cover10":{"section_segments":6,"offset":{"x":40,"y":95,"z":-5},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,1,1]},"width":[0,4,1.8,0],"height":[0,1,0.5,0],"texture":2.9,"angle":0},"cover11":{"section_segments":6,"offset":{"x":40,"y":95,"z":-5},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,1,1]},"width":[0,4,1.8,0],"height":[0,1,0.5,0],"texture":2.9,"angle":0},"cover12":{"section_segments":6,"offset":{"x":48,"y":95,"z":-1},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,0.5,0],"height":[0,3,1.8,0],"texture":2.9,"angle":0},"cover13":{"section_segments":6,"offset":{"x":48.1,"y":95,"z":-1},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,0.5,0],"height":[0,1.4,0.8,0],"texture":16.9,"angle":0},"cover14":{"section_segments":6,"offset":{"x":32.2,"y":95,"z":-1},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,0.5,0],"height":[0,3,1.8,0],"texture":2.9,"angle":0},"cover15":{"section_segments":6,"offset":{"x":32,"y":95,"z":-1},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,0.8,0.5,0],"height":[0,1.8,1.4,0],"texture":16.9,"angle":0},"front":{"section_segments":6,"offset":{"x":1,"y":-145,"z":31},"position":{"x":[4,7,13,0,16,16],"y":[-35,-30,0,0,58,58],"z":[-24,-22,-6,-0.7,-6,-6]},"width":[0,2,3,2,2,0],"height":[0,2,2,2,2,0],"texture":63,"angle":0},"front2":{"section_segments":6,"offset":{"x":17,"y":-87,"z":26},"position":{"x":[0,0,2,2],"y":[0,0,15,15],"z":[-1,-1,-13,-13]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":63,"angle":0},"bacc":{"section_segments":6,"offset":{"x":0,"y":128,"z":25},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-2,-2]},"width":[0,4,4,0],"height":[0,1,1,0],"texture":[[15]],"angle":0},"back":{"section_segments":6,"offset":{"x":0,"y":94,"z":27},"position":{"x":[0,0,0,0],"y":[0,0,35,35],"z":[0,0,-2,-2]},"width":[0,8,4,0],"height":[0,6.5,1,0],"texture":[[15]],"angle":0},"top":{"section_segments":6,"offset":{"x":0,"y":-70,"z":27},"position":{"x":[0,0,0,0],"y":[0,0,165,165],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,4,4,0],"texture":[[15]],"angle":0},"top2":{"section_segments":6,"offset":{"x":0,"y":-145,"z":27},"position":{"x":[0,0,0,0],"y":[-35,3,75,75],"z":[-22,3,1,0]},"width":[3,3,8,0],"height":[4,4,4,0],"texture":[63,15.1],"angle":0},"base2":{"section_segments":20,"offset":{"x":37,"y":2,"z":29},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base22":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":29},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand2":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-85},"stand22":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":5},"circle2":{"section_segments":20,"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":5},"circle22":{"section_segments":20,"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":5},"rails2":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-85,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails22":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-85},"outerplating2":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-85},"outerplating22":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-85},"base3":{"section_segments":20,"offset":{"x":37,"y":2,"z":-0.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base23":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":-0.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand3":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-90},"stand23":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":0},"circle3":{"section_segments":20,"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"circle23":{"section_segments":20,"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"rails3":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails23":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90},"outerplating3":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"outerplating23":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"base4":{"section_segments":20,"offset":{"x":37,"y":2,"z":-29.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base24":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":-29.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand4":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-90},"stand24":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":0},"circle4":{"section_segments":20,"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"circle24":{"section_segments":20,"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"rails4":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails24":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90},"outerplating4":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"outerplating24":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"base5":{"section_segments":20,"offset":{"x":37,"y":2,"z":-59},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base25":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":-59},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand5":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-95},"stand25":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-5},"circle5":{"section_segments":20,"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":-5},"circle25":{"section_segments":20,"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":-5},"rails5":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-95,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails25":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-95},"outerplating5":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-95},"outerplating25":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-95},"reactorsegment0":{"section_segments":4,"offset":{"x":0,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":0,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment1":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":30,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment2":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":60,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment3":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":90,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment4":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":120,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment5":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":150,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment6":{"section_segments":4,"offset":{"x":0,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":180,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment0":{"section_segments":4,"offset":{"x":0,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":0,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment1":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":30,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment2":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":60,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment3":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":90,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment4":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":120,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment5":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":150,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment6":{"section_segments":4,"offset":{"x":0,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":180,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment0":{"section_segments":4,"offset":{"x":0,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":0,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment1":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":30,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment2":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":60,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment3":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":90,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment4":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":120,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment5":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":150,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment6":{"section_segments":4,"offset":{"x":0,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":180,"texture":[18,17,17,17,16,2,2,17,17,63]},"W1":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":0,"y":37,"z":-118},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-60,-30,0,0,10,10],"z":[-30,-30,-15,0,3,7,0]},"width":[0,2,2,2,2,2,0],"height":[0,15,20,25,20,20,0],"texture":[63,63,11,4,3,4],"angle":180,"vertical":1},"W2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":0,"y":37,"z":-118},"position":{"x":[0,0,0,0,0,0,0],"y":[-55,-55,-30,0,0,10,10],"z":[-36,-36,-23,-8,0,7,0]},"width":[0,3,3,3,3,3,0],"height":[0,7,10,15,10,10,0],"texture":[4,4,4,3],"angle":180,"vertical":1}},"typespec":{"name":"Sunder","level":2,"model":2,"code":202,"specs":{"shield":{"capacity":[800,800],"reload":[8,8]},"generator":{"capacity":[240,240],"reload":[240,240]},"ship":{"mass":555,"speed":[65,65],"rotation":[25,25],"acceleration":[100,120]}},"shape":[5.825,5.637,5.397,3.874,2.872,2.308,2.179,2.206,2.175,2.005,1.889,1.816,2.038,2.257,2.311,2.406,2.554,2.748,2.769,2.836,3.017,3.59,4.096,5.457,5.839,5.104,5.839,5.457,4.096,3.59,3.017,2.836,2.769,2.748,2.554,2.406,2.311,2.257,2.038,1.816,1.889,2.005,2.175,2.206,2.179,2.308,2.872,3.874,5.397,5.637],"lasers":[{"x":0.96,"y":-5.28,"z":-0.32,"angle":0,"damage":[14,14],"rate":10,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.96,"y":-5.28,"z":-0.32,"angle":0,"damage":[14,14],"rate":10,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.562,"y":-0.93,"z":0.064,"angle":-85,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.562,"y":-0.93,"z":0.064,"angle":85,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":1.56,"y":0.047,"z":0.064,"angle":-90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.56,"y":0.047,"z":0.064,"angle":90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":1.56,"y":0.975,"z":0.064,"angle":-90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.56,"y":0.975,"z":0.064,"angle":90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":1.556,"y":1.951,"z":0.064,"angle":-95,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.556,"y":1.951,"z":0.064,"angle":95,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0}],"radius":5.839}}',
                            '{"name":"Cairngorgon","level":2,"model":3,"size":1.3,"specs":{"shield":{"capacity":[740,740],"reload":[9,9]},"generator":{"capacity":[210,210],"reload":[100,100]},"ship":{"mass":470,"speed":[110,110],"rotation":[50,50],"acceleration":[40,40]}},"bodies":{"sideEngineBody":{"section_segments":10,"offset":{"x":100,"y":-135,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[30,0,20,30,100,130,190,220,290,300,320,320,290],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,30,40,40,40,0,0,40,40,40,30,28,0],"height":[0,30,40,40,40,0,0,40,40,40,30,28,0],"texture":[17,3.9,2,10,3.9,3.9,3.9,10,2,4,17],"propeller":true,"laser":{"damage":[90,90],"rate":0.8,"type":1,"recoil":10,"speed":[100,100],"number":1,"error":0}},"sideEngineBody1":{"section_segments":10,"offset":{"x":0,"y":-215,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[30,0,20,30,100,130,190,220,290,340,360,360,348],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,45,55,55,55,55,55,55,55,55,45,43,0],"height":[0,30,40,40,40,40,40,40,40,40,32,30,0],"texture":[17,3.9,2,10,3.9,3.9,3.9,10,2,4,17],"propeller":true},"sideEngineTop":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":100,"y":-135,"z":24},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[20,25,100,120,200,220,295,300],"z":[0,0,0,20,20,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,0],"texture":[3,3,4,16,4,3]},"sideEngineBottom":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":100,"y":-135,"z":-44},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[20,25,100,120,200,220,295,300],"z":[0,0,0,-20,-20,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,0],"texture":[4,4,4,16,4]},"reactor_cubes":{"section_segments":4,"offset":{"x":100,"y":-10,"z":-25},"position":{"x":[0,0,0,0,0,20,20,-20,-20],"y":[-20,20,20,-20,-20,-19.9,20,-19.9,20],"z":[-20,-20,20,20,-20,0,0,0,0]},"width":[20,20,20,20,20,0,0,0,0],"height":[0,0,0,0,0,20,20,20,20],"texture":[177],"vertical":true,"angle":45,"propeller":false},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-135,"z":29},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-25,0,25,60,190,230],"z":[0,0,0,0,-10,-10,0]},"width":[0,20,20,20,40,40,0],"height":[0,10,12,12,20,20,0],"texture":[9,8.98,8.98,3,8.18,8.18]},"backsupport":{"section_segments":10,"offset":{"x":0,"y":-285,"z":6},"position":{"x":[0,0,0,0],"y":[360,340,410,420],"z":[0,0,-1,-10]},"width":[40,50,40,50],"height":[0,30,30,0],"texture":[3,4]},"cannons":{"section_segments":12,"offset":{"x":40,"y":35,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-130,-140,-140,-70,-10,0,10,70,80,85],"z":[-4,-4,-3,-2,0,0,0,0,0,0]},"width":[0,11,12,13,14,18,20,20,18,0],"height":[0,11,12,13,14,18,20,20,18,0],"laser":{"damage":[15,15],"rate":3,"recoil":0,"type":2,"speed":[130,130],"number":1,"error":2},"texture":[17,4,4,4,2,4,17,4]},"cannons1":{"section_segments":12,"offset":{"x":30,"y":45,"z":40},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-140,-140,-70,-10,0,10,50,60,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,6,7,8,12,14,14,14,0],"height":[0,5,6,7,8,12,14,14,14,0],"laser":{"damage":[10,10],"rate":3,"recoil":0,"type":2,"speed":[140,140],"number":1,"error":0},"texture":[17,4,4,4,2,4,17,4]},"cannon_deco":{"section_segments":10,"offset":{"x":26.5,"y":-25,"z":45},"position":{"x":[0,0,-2.2,-2.2],"y":[-70,-70,80,80],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[63]},"cannon_deco2":{"section_segments":10,"offset":{"x":25,"y":-25,"z":45.5},"position":{"x":[0,0.2,-2.2,-2.2],"y":[-80,-80,70,70],"z":[0,0.6,0.1,0.1]},"width":[0,0.5,0.5,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"cannon_deco3":{"section_segments":10,"offset":{"x":33.5,"y":-25,"z":44.8},"position":{"x":[0,0,2.2,2.2],"y":[-70,-70,80,80],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[63]},"cannon_deco4":{"section_segments":10,"offset":{"x":35,"y":-25,"z":45.5},"position":{"x":[0,-0.4,2.2,2.2],"y":[-80,-80,70,70],"z":[0,0.4,0.2,0]},"width":[0,0.5,0.5,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"cannon_deco5":{"section_segments":10,"offset":{"x":47,"y":-25,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[0,0,4,0]},"width":[0,1.5,1.5,0],"height":[0,1.5,1.5,0],"texture":[63]},"cannon_deco6":{"section_segments":10,"offset":{"x":45.5,"y":-35,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[4.5,4.5,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[17],"angle":180},"cannon_deco7":{"section_segments":10,"offset":{"x":33,"y":-25,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[0,0,4,0]},"width":[0,1.5,1.5,0],"height":[0,1.5,1.5,0],"texture":[63]},"cannon_deco8":{"section_segments":10,"offset":{"x":34.5,"y":-35,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[4.5,4.5,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[17],"angle":180},"hub":{"section_segments":20,"offset":{"x":100,"y":32,"z":90},"position":{"x":[0,0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,4.375,6.875],"z":[0,0,0,0,0,0]},"width":[10,10,8,8,3,0],"height":[10,10,8,8,3,0],"texture":[3,17,3,18,17],"vertical":true},"hub2":{"section_segments":20,"offset":{"x":100,"y":32,"z":55},"position":{"x":[0,0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,4.375,6.875],"z":[0,0,0,0,0,0]},"width":[10,10,8,8,3,0],"height":[10,10,8,8,3,0],"texture":[3,17,3,18,17],"vertical":true},"hub3":{"section_segments":20,"offset":{"x":100,"y":32,"z":-143},"position":{"x":[0,0,0,0,0,0],"y":[-2.75,8.25,8.25,7.562500000000001,4.8125,7.562500000000001,null],"z":[0,0,0,0,0,0]},"width":[11,11,8.8,8.8,3.3000000000000003,0,null],"height":[11,11,8.8,8.8,3.3000000000000003,0,null],"texture":[3,17,3,18,17],"vertical":true},"hub4":{"section_segments":20,"offset":{"x":100,"y":32,"z":-104.50000000000001},"position":{"x":[0,0,0,0,0,0],"y":[-2.75,8.25,8.25,7.562500000000001,4.8125,7.562500000000001,null],"z":[0,0,0,0,0,0]},"width":[11,11,8.8,8.8,3.3000000000000003,0,null],"height":[11,11,8.8,8.8,3.3000000000000003,0,null],"texture":[3,17,3,18,17],"vertical":true},"hub_joints":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":-73,"z":31.4},"position":{"x":[0,0,0,0],"y":[-10,-10,11,11],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[8]},"hub_joints2":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":124.30000000000001,"z":31.4},"position":{"x":[0,0,0,0],"y":[-11,-11,12.100000000000001,12.100000000000001,null],"z":[0,0,0,0]},"width":[0,11,11,0,null],"height":[0,11,11,0,null],"texture":[8]},"hub_joints_deco":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":-77,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,-8,8,10,10],"z":[-5,-5,0,0,-5,-5]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[1,1,10,1,1],"angle":90},"hub_joints_deco2":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":-68,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,-8,8,10,10],"z":[-5,-5,0,0,-5,-5]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[1,1,10,1,1],"angle":90},"hub_joints_deco3":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":117.70000000000002,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8.8,8.8,11,11,null],"z":[-5.5,-5.5,0,0,-5.5,-5.5,null]},"width":[0,2.2,2.2,2.2,2.2,0,null],"height":[0,3.3000000000000003,3.3000000000000003,3.3000000000000003,3.3000000000000003,0,null],"texture":[1,1,10,1,1],"angle":90},"hub_joints_deco4":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":128.70000000000002,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8.8,8.8,11,11,null],"z":[-5.5,-5.5,0,0,-5.5,-5.5,null]},"width":[0,2.2,2.2,2.2,2.2,0,null],"height":[0,3.3000000000000003,3.3000000000000003,3.3000000000000003,3.3000000000000003,0,null],"texture":[1,1,10,1,1],"angle":90},"front_deco":{"section_segments":[45,135,225,315],"offset":{"x":42,"y":-129.5,"z":16},"position":{"x":[0,0,0,0,0,0,-5.5,-5.5,-5.5,-5.5,0,0,-11,-11,-11,-11,0,0,-16.5,-16.5,-16.5,-16.5,0,0,-22,-22,-22,-22,0,0,-27.5,-27.5,-27.5,-27.5,0,0,-34,-33,-33,-33,0,0,-38.5,-38.5,-38.5,-38.5,0,0,-44,-44,-44,-44],"y":[-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10],"z":[-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0]},"width":[0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0],"height":[0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0],"texture":[4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16],"angle":270},"front_deco_joints":{"section_segments":[45,135,225,315],"offset":{"x":32,"y":-151,"z":22},"position":{"x":[0,0,0,0],"y":[-27,-27,27,27],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":[1,7,1]},"front_deco_joints2":{"section_segments":[45,135,225,315],"offset":{"x":51,"y":-151,"z":3},"position":{"x":[0,0,0,0],"y":[-27,-27,27,27],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":[1,7,1]},"back":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":10,"z":37},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-62,-62,-42,-32,12,22,45,45],"z":[-1,-1,0,0,0,0,-3,-3]},"width":[0,21,20,20,20,20,12,0],"height":[0,4,5,5,5,5,2,0],"texture":[7,7,8,5,8,7]},"back2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":15,"z":37.1},"position":{"x":[0,0,0,0],"y":[-12,-12,12,12],"z":[0,0,0,0]},"width":[0,19.9,19.9,0],"height":[0,5,5,0],"texture":[5,17,5]},"back3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-15,"z":37.1},"position":{"x":[0,0,0,0],"y":[-12,-12,12,12],"z":[0,0,0,0]},"width":[0,19.9,19.9,0],"height":[0,5,5,0],"texture":[5,17,5],"angle":180},"back4":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":-27,"z":37},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,17,17,0],"height":[0,10,10,0],"texture":[63],"angle":180},"back5":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":-5.5,"z":36},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,16,16,0],"height":[0,10,10,0],"texture":[63],"angle":180},"back6":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":5.5,"z":36},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,16,16,0],"height":[0,10,10,0],"texture":[63],"angle":180},"back7":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":27,"z":37},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,17,17,0],"height":[0,10,10,0],"texture":[63],"angle":180},"front":{"section_segments":[45,135,225,315],"offset":{"x":12.6,"y":-72,"z":36.7},"position":{"x":[1,1,1,6,1,1,6,1,0.2,0.2],"y":[-38,-38,-25,-20,-15,5,10,15,40,40],"z":[0,0,0,0,0,0,0,0,2,2]},"width":[0,2,2,2,2,2,2,2,2,0],"height":[0,3,3,3,3,3,3,3,3,0],"texture":[63]},"front2":{"section_segments":[45,135,225,315],"offset":{"x":12.7,"y":42,"z":39},"position":{"x":[0,0,-5.6,-5.6],"y":[-10,-10,13,13],"z":[0,0,-5.6,-5.6]},"width":[0,2,2,0],"height":[0,3,3,0],"texture":[63]},"front3":{"section_segments":[45,135,225,315],"offset":{"x":5,"y":-72,"z":36},"position":{"x":[1,1,1,6,1,1,6,1,1,1],"y":[-38,-38,-25,-20,-15,5,10,15,20,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,10,10,10,10,10,10,10,0],"height":[0,3,3,2,3,3,2,3,4,0],"texture":[7,7,13,13,7,13,13,7,7]},"front4":{"section_segments":4,"offset":{"x":6,"y":-110,"z":36},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,13,13,23,23,23,43,43,53,53,78,78],"z":[0,0,0,0,0,0,0,0,0,0,0,2,2]},"width":[0,7,7,0,0,0,7,7,0,0,7,7,0],"height":[0,3,4,0,0,0,4,4,0,0,4,4,0],"texture":[7]},"front5":{"section_segments":4,"offset":{"x":6,"y":42,"z":36},"position":{"x":[0,0,0,-6,-6],"y":[-10,-10,-9,13,13],"z":[1.7,1.7,2.5,-2.5,-2.5]},"width":[0,8,7,7,0],"height":[0,4,4,4,0],"texture":[7]},"diamond":{"section_segments":4,"offset":{"x":0,"y":38.7,"z":92},"position":{"x":[0,0,0],"y":[-1,-1,0],"z":[0,0,0]},"width":[0,4,0],"height":[0,4,0],"texture":[17],"vertical":true},"diamond2":{"section_segments":4,"offset":{"x":0,"y":38.7,"z":62},"position":{"x":[0,0,0],"y":[-1,-1,0],"z":[0,0,0]},"width":[0,4,0],"height":[0,4,0],"texture":17,"vertical":true}},"wings":{"topjoin":{"offset":{"x":0,"y":-95,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[0],"position":[0,0,0,50],"texture":[1],"bump":{"position":10,"size":30}},"topjoin_lights":{"offset":{"x":0,"y":-98,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[0],"position":[0,0,0,50],"texture":[17],"bump":{"position":10,"size":0}},"bottomjoin":{"offset":{"x":0,"y":-95,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[1],"bump":{"position":-10,"size":30}},"bottomjoin_lights":{"offset":{"x":0,"y":-98,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[17],"bump":{"position":-10,"size":0}},"topjoin1":{"offset":{"x":0,"y":135,"z":0},"doubleside":true,"length":[100],"width":[40,40],"angle":[0],"position":[-210,0,0,50],"texture":[11],"bump":{"position":10,"size":30}},"topjoin1_lights":{"offset":{"x":0,"y":131,"z":0},"doubleside":true,"length":[100],"width":[40,40],"angle":[0],"position":[-210,0,0,50],"texture":[17],"bump":{"position":10,"size":0}},"bottomjoin1":{"offset":{"x":0,"y":98,"z":0},"doubleside":true,"length":[100],"width":[60,60],"angle":[-25],"position":[-210,0,0,50],"texture":[11],"bump":{"position":-10,"size":30}},"bottomjoin1_lights":{"offset":{"x":0,"y":94,"z":0},"doubleside":true,"length":[100],"width":[60,60],"angle":[-25],"position":[-210,0,0,50],"texture":[17],"bump":{"position":-10,"size":0}}},"typespec":{"name":"Cairngorgon","level":2,"model":3,"code":203,"specs":{"shield":{"capacity":[740,740],"reload":[9,9]},"generator":{"capacity":[210,210],"reload":[100,100]},"ship":{"mass":470,"speed":[110,110],"rotation":[50,50],"acceleration":[40,40]}},"shape":[5.601,5.691,5.7,4.409,4.155,4.555,4.846,4.751,4.433,4.092,3.86,3.703,3.021,3.362,3.443,3.535,3.412,4.427,4.914,5.605,5.857,5.697,5.315,3.931,3.838,3.777,3.838,3.931,5.315,5.697,5.857,5.605,4.914,4.427,3.412,3.535,3.443,3.362,3.021,3.703,3.86,4.092,4.433,4.751,4.846,4.555,4.155,4.409,5.7,5.691],"lasers":[{"x":2.6,"y":-3.51,"z":-0.26,"angle":0,"damage":[90,90],"rate":0.8,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":10},{"x":-2.6,"y":-3.51,"z":-0.26,"angle":0,"damage":[90,90],"rate":0.8,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":10},{"x":1.04,"y":-2.73,"z":0.65,"angle":0,"damage":[15,15],"rate":3,"type":2,"speed":[130,130],"number":1,"spread":0,"error":2,"recoil":0},{"x":-1.04,"y":-2.73,"z":0.65,"angle":0,"damage":[15,15],"rate":3,"type":2,"speed":[130,130],"number":1,"spread":0,"error":2,"recoil":0},{"x":0.78,"y":-2.47,"z":1.04,"angle":0,"damage":[10,10],"rate":3,"type":2,"speed":[140,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.78,"y":-2.47,"z":1.04,"angle":0,"damage":[10,10],"rate":3,"type":2,"speed":[140,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.857}}',
                            '{"name":"Epiloguer","level":2,"model":4,"size":1.2,"specs":{"shield":{"capacity":[650,650],"reload":[6,6]},"generator":{"capacity":[320,330],"reload":[110,110]},"ship":{"mass":330,"speed":[100,100],"rotation":[105,105],"acceleration":[180,180]}},"bodies":{"ball":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":113,"vertical":false,"angle":0},"ball2":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":17,"vertical":false,"angle":45},"ball3":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":17,"vertical":false,"angle":90},"ball4":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":17,"vertical":false,"angle":135},"ring":{"section_segments":6,"offset":{"x":27,"y":18,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":0},"ring2":{"section_segments":6,"offset":{"x":27,"y":0,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":0},"ring3":{"section_segments":6,"offset":{"x":18,"y":-20.5,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":50},"ring4":{"section_segments":6,"offset":{"x":18,"y":38,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":-50},"ring5":{"section_segments":16,"offset":{"x":25,"y":15,"z":-49},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[12,12.5,13,13.25,13,12.5,12,11.5,11,10.75,11,11.5,12],"height":[10,10.5,11,11.25,11,10.5,10,9.5,9,8.75,9,9.5,10],"vertical":1,"texture":17,"angle":5},"ring6":{"section_segments":12,"offset":{"x":32,"y":-46,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[7,7.5,8,8.25,8,7.5,7,6.5,6,5.75,6,6.5,7],"height":[13,13.5,14,14.25,14,13.5,13,12.5,12,11.75,12,12.5,13],"vertical":0,"texture":17,"angle":0},"ring7":{"section_segments":12,"offset":{"x":32,"y":-56,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[7,7.5,8,8.25,8,7.5,7,6.5,6,5.75,6,6.5,7],"height":[13,13.5,14,14.25,14,13.5,13,12.5,12,11.75,12,12.5,13],"vertical":0,"texture":17,"angle":0},"reactor":{"section_segments":20,"offset":{"x":0,"y":20,"z":-91},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor2":{"section_segments":20,"offset":{"x":12,"y":15,"z":48},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":10},"uwu":{"section_segments":6,"offset":{"x":0,"y":-53,"z":11.5},"position":{"x":[0,0,0,0,0,0],"y":[-3,-3,-2,2,3,3],"z":[0,0,0,0,0,0]},"width":[0,15,15,15,15,0],"height":[0,10,10,10,10,0],"texture":[3.9,16.9,18,3.9,3.9]},"back":{"section_segments":6,"offset":{"x":0,"y":27,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[16,26,36,48,60,75,90,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[30,38,40,40,40,43,34,32,0],"height":[15,23,25,28,29,28,20,18,0],"texture":[13,[15],3.9,63,3.9,18,16.9,16.9,16.9],"propeller":0},"back_sides":{"section_segments":6,"offset":{"x":0,"y":27,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[16,26,36,48,60,75,90,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[30.3,38.38,40.4,40.4,40.4,43.43,34.34,34.34,0],"height":[14.285714285714285,21.904761904761905,23.80952380952381,26.666666666666664,27.619047619047617,26.666666666666664,19.047619047619047,17.142857142857142,0],"texture":[13,[15],3.9,63,2.9,3.9,16.9,16.9,16.9]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-48,"z":2},"angle":180,"position":{"x":[0,0,0,0,0],"y":[10,40,66,84,95],"z":[-8,-3,-7,-7,-10]},"width":[13,18,16,6,0],"height":[5,15,15,8,0],"texture":[7,9,9,4],"propeller":false},"core_shield":{"angle":180,"section_segments":6,"vertical":true,"offset":{"x":0,"y":15,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-9.1,-6.5,-6.5,-5.2,0,26,32.5,35.1,26,0,-9.1],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[30,40,42,45,50,50,45,30,25,25,30],"height":[42,56,58.8,62.99999999999999,70,70,62.99999999999999,42,35,35,42],"texture":[17.95,17,4,[15],4,[15],18,4,112.9,3.9]},"main":{"section_segments":8,"offset":{"x":0,"y":-85,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-13.2,-7.199999999999999,0,12,24,33.6,54,30],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,26,28,32,32,32,32,0],"height":[0,15,18,20,20,19,20,0],"texture":[18,4,8,63,4,[15],17]},"main2":{"section_segments":8,"offset":{"x":0,"y":-130,"z":-5},"position":{"x":[0,0,0,0,0,0,0],"y":[0,-15,-15,20,45,45,45],"z":[0,0,0,0,8,8,8]},"width":[0,7.2,9,20.7,23.400000000000002,0],"height":[0,1.5,2.5,11.5,5,0],"texture":[17,17,3,18,12]},"cannons":{"section_segments":12,"offset":{"x":30,"y":-77,"z":0},"position":{"x":[0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0],"y":[-51.61290322580645,-21.93548387096774,-22.58064516129032,-23.225806451612904,-23.870967741935484,-21.93548387096774,-20.64516129032258,-7.741935483870967,1.2903225806451613,3.225806451612903,12.903225806451612,16.129032258064516,35.483870967741936,38.70967741935484,48.387096774193544,51.61290322580645,50.32258064516129],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,4,6,8,5,3,3,3,5,8,8,8,8,8,8,0],"height":[0,2,4,6,8,5,3,3,5,10,14,15,15,15,15,15,0],"texture":[17,4,4,4,4,17,18,8,13,18,17,8,17,18,17,18],"laser":{"damage":[16,16],"rate":1.7,"recoil":30,"type":1,"speed":[216,284],"number":4,"error":3}},"cannon_discs":{"section_segments":12,"offset":{"x":30,"y":-115,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5,-5,-3.3333333333333335,-3.3333333333333335,0,0,1.6666666666666667,1.6666666666666667,5,5,6.666666666666667,6.666666666666667,10,10,11.666666666666668,11.666666666666668],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,0,0,3.3333333333333335,3.3333333333333335,0,0,4.166666666666667,4.166666666666667,0,0,5,5,0],"height":[0,2.5,2.5,0,0,3.3333333333333335,3.3333333333333335,0,0,4.166666666666667,4.166666666666667,0,0,5,5,0],"texture":[4,17,4,4,4,17,4,4,4,17,4,4,4,17,4],"laser":{"damage":[1,1],"rate":8,"recoil":0,"type":1,"speed":[206,204],"number":5,"error":0}},"poker":{"section_segments":12,"offset":{"x":2,"y":3,"z":0},"position":{"x":[0,0,0,0,0],"y":[9,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1.5,3,4.5,6,0],"height":[0,1.5,3,4.5,6,0],"angle":120,"texture":[18,17,4]},"poker2":{"section_segments":12,"offset":{"x":2,"y":15,"z":0},"position":{"x":[0,0,0,0,0],"y":[9,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1.5,3,4.5,6,0],"height":[0,1.5,3,4.5,6,0],"angle":60,"texture":[18,17,4]},"poker3":{"section_segments":12,"offset":{"x":0,"y":7,"z":0},"position":{"x":[0,0,0,0,0],"y":[12.6,28,29.4,32.199999999999996,33.599999999999994],"z":[0,0,0,0,0]},"width":[0,1.8,3.6,5.4,7.2,0],"height":[0,1.8,3.6,5.4,7.2,0],"angle":180,"texture":[18,17,4]},"poker4":{"section_segments":12,"offset":{"x":0,"y":11,"z":0},"position":{"x":[0,0,0,0,0],"y":[12.6,28,29.4,32.199999999999996,33.599999999999994],"z":[0,0,0,0,0]},"width":[0,1.8,3.6,5.4,7.2,0],"height":[0,1.8,3.6,5.4,7.2,0],"angle":0,"texture":[18,17,4]},"circle":{"section_segments":12,"offset":{"x":-12,"y":-42,"z":-70},"position":{"x":[0,0,0,0,0,0,0],"y":[-68.5,-71,-72.5,-72.5,-67.5,-61.5,-52.5,-47.5],"z":[0,0,0,0,0,0,0]},"width":[0,2.5,4,4,4,4,7,0],"height":[0,2.5,4,4,4,4,7,0],"texture":[17,16,18,18],"angle":195,"vertical":true},"box":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":10,"y":75,"z":10},"position":{"x":[0,0,0,0,0],"y":[-30,-5,15,25],"z":[2,0,-4,-5]},"width":[15,20,20,15],"height":[0,18,18,0],"texture":[17,17.96,17],"angle":90},"box2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-70,"z":9.5},"position":{"x":[0,0,0,0,0],"y":[-25,-15,15,25],"z":[-5,-4,-4,-5]},"width":[15,15,15,15],"height":[0,18,18,0],"texture":[63,17.96,63],"angle":90},"hubs2":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":0,"y":-2,"z":65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[15,25,23.5,23.5,25,27,25],"z":[0,0,0,0,0,0,-4,0]},"width":[8,5,3,3,3,0.2,0],"height":[18,15,13,13,13,-4,-5],"texture":[4,17,17,18,18,18,17]},"hubs":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":5.5,"y":1,"z":-79.55},"position":{"x":[0,0,0,0,0,0,0],"y":[15,25,23.5,23.5,25,28],"z":[0,0,0,0,0,0,0]},"width":[8,5,3,3,3,0],"height":[23,20,18,18,18,0],"texture":[63,17,17,18],"angle":25},"disc1":{"section_segments":12,"offset":{"x":20,"y":68,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc2":{"section_segments":12,"offset":{"x":20,"y":85,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc3":{"section_segments":12,"offset":{"x":20,"y":77,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc4":{"section_segments":12,"offset":{"x":5,"y":-63,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc5":{"section_segments":12,"offset":{"x":5,"y":-72,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"wire":{"section_segments":8,"angle":90,"offset":{"x":30,"y":92,"z":15},"position":{"x":[-10,-10,-10,-2,-2,-2,-2,0,1,0,0],"y":[-30,-30,-21.5,-10,-8,-1,4,7,10,11.5],"z":[8,8,7,6,6,3,1,-2,-12,-12,-12]},"width":[4,4,4,4,4,4,4,4,4,0],"height":[0,4,4,4,4,4,4,4,10,0],"propeller":false,"texture":[13,13,13,13,17,13,17,13,17]},"wire2":{"section_segments":12,"angle":0,"offset":{"x":30,"y":80,"z":5},"position":{"x":[5,5,5,3,3,5,6,6,7,7,7],"y":[-65,-64,-51.5,-40,-28,-18,-8,2,12,11],"z":[0,0,0,-1,-2,-1,1,1,0,0,0]},"width":[4,4,4,4,4,4,4,4,3,0],"height":[0,3,3,3,3,3,3,3,3,0],"propeller":false,"texture":[13,13,17,13,17,13,17,13,17]},"wire3":{"section_segments":12,"angle":0,"offset":{"x":30,"y":80,"z":-2},"position":{"x":[5,5,5,3,3,5,6,6,7,7,7],"y":[-65,-64,-51.5,-40,-28,-18,-8,2,12,11],"z":[0,0,0,-2,-3,-3,-2,-2,0,0,0]},"width":[4,4,4,4,4,4,4,4,3,0],"height":[0,3,3,3,3,3,3,3,3,0],"propeller":false,"texture":[13,17,13,17,13,17,13,17,13]},"wire4":{"section_segments":8,"angle":90,"offset":{"x":20,"y":-45,"z":15},"position":{"x":[2,2,5,3,1,-2,-2,0,1,0,0],"y":[-18,-18,-14,-10,-8,-1,4,7,10,11.5],"z":[0,0.5,0.5,3,3,3,1,-2,-12,-12,-12]},"width":[4,4,4,4,4,4,4,4,4,0],"height":[0,4,4,4,4,4,4,4,10,0],"propeller":false,"texture":[13,13,13,13,17,13,17,13,17]},"back_propeller":{"section_segments":6,"offset":{"x":0,"y":137,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[34],"height":[18],"propeller":1}},"wings":{"main":{"offset":{"x":40,"y":-43,"z":9},"length":[0,22,0,22,2,22,16,0,7,0,20],"width":[55,55,55,146,320,333,167,122,35,35,192,10],"angle":[15,-35,11,11,-28,-28,-8,-8,-28,-28,0],"position":[52,50,66,54,47,47,89,80,85,93,70,130],"texture":[4,8,17,18,17,4,3,17,18,17,4],"doubleside":true,"bump":{"position":20,"size":5}},"main2":{"offset":{"x":40,"y":-41,"z":9},"length":[0,22,0,22,2,20,16,0,9,0,18.5],"width":[55,55,55,146,320,333,167,122,35,35,160,40],"angle":[15,-35,11,11,-28,-28,-8,-8,-28,-28,0],"position":[52,50,66,54,47,47,89,80,85,93,70,100],"texture":[4,12,17,4,17,63,3,17,4,17,63],"doubleside":true,"bump":{"position":20,"size":5}},"main_deco":{"offset":{"x":100.5,"y":-24,"z":-7},"length":[12,0],"width":[87,52,35],"angle":[-7,0],"position":[60,64,64],"texture":[63],"doubleside":true,"bump":{"position":50,"size":7}},"main_deco2":{"offset":{"x":62,"y":-63,"z":0},"length":[10,8,0],"width":[81,87,85,35],"angle":[20,20,0],"position":[61,65,45,64],"texture":[63],"doubleside":true,"bump":{"position":50,"size":7}},"main_deco3":{"offset":{"x":67,"y":62,"z":0},"length":[15,0],"width":[30,50],"angle":[43,43,0],"position":[16,40,40,50],"texture":[63],"doubleside":true,"bump":{"position":-50,"size":15}},"main_lights":{"offset":{"x":40,"y":-46,"z":9},"length":[0,22,0,22,2,23.5,16.5,0,9,-4,21],"width":[55,55,55,151,325,338,166,119,29,26,197,47],"angle":[15,-35,11,11,-28,-28,-9,-8,-28,-28,0],"position":[52,50,66,54,47,47,89,80,85,93,75,116],"texture":[17],"doubleside":true,"bump":{"position":20,"size":0}}},"typespec":{"name":"Epiloguer","level":2,"model":4,"code":204,"specs":{"shield":{"capacity":[650,650],"reload":[6,6]},"generator":{"capacity":[320,330],"reload":[110,110]},"ship":{"mass":330,"speed":[100,100],"rotation":[105,105],"acceleration":[180,180]}},"shape":[3.487,3.478,3.17,2.656,4.48,3.869,3.409,3.088,3.387,3.369,3.261,3.205,3.246,3.353,3.515,3.712,3.938,4.128,4.2,4.249,4.153,4.578,2.707,2.897,2.859,2.813,2.859,2.897,2.707,4.578,4.153,4.249,4.2,4.128,3.938,3.712,3.515,3.353,3.246,3.205,3.261,3.369,3.387,3.088,3.409,3.869,4.48,2.656,3.17,3.478],"lasers":[{"x":0.72,"y":-3.087,"z":0,"angle":0,"damage":[16,16],"rate":1.7,"type":1,"speed":[216,284],"number":4,"spread":0,"error":3,"recoil":30},{"x":-0.72,"y":-3.087,"z":0,"angle":0,"damage":[16,16],"rate":1.7,"type":1,"speed":[216,284],"number":4,"spread":0,"error":3,"recoil":30},{"x":0.72,"y":-2.88,"z":0,"angle":0,"damage":[1,1],"rate":8,"type":1,"speed":[206,204],"number":5,"spread":0,"error":0,"recoil":0},{"x":-0.72,"y":-2.88,"z":0,"angle":0,"damage":[1,1],"rate":8,"type":1,"speed":[206,204],"number":5,"spread":0,"error":0,"recoil":0}],"radius":4.578}}',
                            '{"name":"Vuaniha","level":2,"model":5,"size":0.6,"specs":{"shield":{"capacity":[460,610],"reload":[9,9]},"generator":{"capacity":[320,350],"reload":[70,100]},"ship":{"mass":370,"speed":[70,85],"rotation":[50,90],"acceleration":[130,130]}},"bodies":{"ring":{"section_segments":6,"offset":{"x":100,"y":-400,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[30.5,30.5,30.5,36.6,36.6,36.6,36.6,36.6,30.5,30.5],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"ring2":{"section_segments":6,"offset":{"x":100,"y":-360,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"reactor":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":85,"y":27,"z":230},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":-30},"reactor2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":85,"y":27,"z":260},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":-30},"ring3":{"section_segments":6,"offset":{"x":101,"y":-265,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"ring4":{"section_segments":6,"offset":{"x":101,"y":-235,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"reactor3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":114,"y":30,"z":50},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[23.400000000000002,19.5,16.900000000000002,15.6,13,2.6,0],"height":[23.400000000000002,19.5,16.900000000000002,15.6,13,2.6,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":30},"ring5":{"section_segments":6,"offset":{"x":99,"y":-63.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":3.9,"angle":0,"vertical":0},"ring6":{"section_segments":6,"offset":{"x":99,"y":-23.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9.299999999999999,9.299999999999999,0,0,0,0,0,9.299999999999999,9.299999999999999,9.299999999999999],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":3.9,"angle":0,"vertical":0},"ring7":{"section_segments":[45,135,225,315],"offset":{"x":65,"y":20,"z":39},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1,1,1,1.2,1.2,1.2,1.2,1.2,1,1],"height":[20,20,20,24,24,24,24,24,20,20],"texture":4,"angle":65,"vertical":1},"reactor4":{"section_segments":12,"offset":{"x":141,"y":0,"z":35},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"height":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"reactor5":{"section_segments":12,"offset":{"x":141,"y":0,"z":5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"height":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"reactor6":{"section_segments":12,"offset":{"x":141,"y":0,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"height":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"ring8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":45,"y":210,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[12,12,0,0,0,0,0,12,12,12],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[50,50,50,60,60,60,60,60,50,50],"height":[45,45,45,54,54,54,54,54,45,45],"texture":17.96,"angle":-40,"vertical":0},"ring9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":37,"y":160,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[12,12,0,0,0,0,0,12,12,12],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[50,50,50,60,60,60,60,60,50,50],"height":[44,44,44,52.8,52.8,52.8,52.8,52.8,44,44],"texture":17.96,"angle":38,"vertical":0},"reactor7":{"section_segments":[-40,-30,-20,80,90,100,200,210,220],"offset":{"x":55,"y":30,"z":-188},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[28.8,24,20.8,19.2,16,3.2,0],"texture":[17.7,16.7,16.7,17.7,17.7,16.7],"vertical":1,"angle":0},"reactor8":{"section_segments":[27,37,47,147,157,167,267,277,287],"offset":{"x":35,"y":25,"z":-135},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[17.7,16.7,16.7,17.7,17.7,16.7],"vertical":1,"angle":0},"reactor9":{"section_segments":[27,37,47,127,137,147,257,267,277],"offset":{"x":32,"y":30,"z":-240},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[25.2,21,18.2,16.8,14,2.8000000000000003,0],"texture":[17.7,16.7,16.7,17.7,17.7,16.7],"vertical":1,"angle":0},"ring10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":42.5,"y":212.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[4.5,4.5,0,0,0,0,0,4.5,4.5,4.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[51,51,51,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,51,51],"height":[46,46,46,55.199999999999996,55.199999999999996,55.199999999999996,55.199999999999996,55.199999999999996,46,46],"texture":17,"angle":-40,"vertical":0},"ring11":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":38,"y":163,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[4.5,4.5,0,0,0,0,0,4.5,4.5,4.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[51,51,51,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,51,51],"height":[45,45,45,54,54,54,54,54,45,45],"texture":17,"angle":38,"vertical":0},"reactor10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":178,"y":19,"z":65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[19.8,16.5,14.3,13.2,11,2.2,0],"height":[36,30,26,24,20,4,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":-30},"ring12":{"section_segments":6,"offset":{"x":191,"y":-85,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8.4,8.4,0,0,0,0,0,8.4,8.4,8.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[29.5,29.5,29.5,35.4,35.4,35.4,35.4,35.4,29.5,29.5],"height":[29,29,29,34.8,34.8,34.8,34.8,34.8,29,29],"texture":16.9,"angle":0,"vertical":0},"ring13":{"section_segments":6,"offset":{"x":191,"y":-55,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8.4,8.4,0,0,0,0,0,8.4,8.4,8.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[29.5,29.5,29.5,35.4,35.4,35.4,35.4,35.4,29.5,29.5],"height":[29,29,29,34.8,34.8,34.8,34.8,34.8,29,29],"texture":16.9,"angle":0,"vertical":0},"ring14":{"section_segments":[45,135,225,315],"offset":{"x":166,"y":-5,"z":40},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[12,12,0,0,0,0,0,12,12,12],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[70,70,70,84,84,84,84,84,70,70],"texture":16.9,"angle":0,"vertical":1},"reactor11":{"section_segments":[70,75,80,160,165,170,250,255,260,340,345,350],"offset":{"x":0,"y":40,"z":-55},"position":{"x":[105,105,105,105,105,105,105,105],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor12":{"section_segments":[10,15,20,100,105,110,190,195,200,280,285,290],"offset":{"x":0,"y":40,"z":-55},"position":{"x":[-105,-105,-105,-105,-105,-105,-105,-105],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"ring15":{"section_segments":6,"offset":{"x":95,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[36,36,36,43.199999999999996,43.199999999999996,43.199999999999996,43.199999999999996,43.199999999999996,36,36],"height":[30,30,30,36,36,36,36,36,30,30],"texture":16.9,"angle":210,"vertical":0},"bottom":{"section_segments":6,"offset":{"x":0,"y":-50,"z":-200},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,-0.16000000000000003,-0.6400000000000001,-1.4400000000000004,-2.5600000000000005,-4,-5.760000000000002,-7.840000000000002,-10.240000000000002,-12.96,-12.96,-7.248000000000003,-2.208000000000002,2.1599999999999984,5.856000000000002,8.88,11.232,12.912,13.920000000000002,14.256000000000002],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,16,24,32,40,48,56,64,72,79.2,70.4,61.60000000000001,52.800000000000004,44,35.2,26.400000000000002,17.6,8.8,0],"height":[0,8,16,24,32,40,48,56,64,72,79.2,70.4,61.60000000000001,52.800000000000004,44,35.2,26.400000000000002,17.6,8.8,0],"texture":[1,1,1,1,1,1,1,1,1,1,16.9,[15.9]],"angle":180,"vertical":1},"ball":{"section_segments":12,"offset":{"x":104,"y":145,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-19.02113032590307,-16.18033988749895,-11.755705045849464,-6.180339887498949,-1.2246467991473533e-15,6.180339887498947,11.75570504584946,16.180339887498945,19.02113032590307,20],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"height":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"texture":[4,4,4,4,4,4,17,4,17,4],"vertical":0,"angle":25},"ball2":{"section_segments":16,"offset":{"x":158,"y":107,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-9,-8.559508646656381,-7.281152949374527,-5.2900672706322585,-2.781152949374527,-5.51091059616309e-16,2.781152949374526,5.290067270632258,7.281152949374526,8.559508646656381,9],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":4,"vertical":0,"angle":25},"ball3":{"section_segments":16,"offset":{"x":197,"y":88,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-8,-7.608452130361228,-6.47213595499958,-4.702282018339785,-2.4721359549995796,-4.898587196589413e-16,2.4721359549995787,4.702282018339784,6.472135954999579,7.608452130361228,8],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"height":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"texture":4,"vertical":0,"angle":30},"ball4":{"section_segments":16,"offset":{"x":225.5,"y":79,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":4,"vertical":0,"angle":30},"ball5":{"section_segments":16,"offset":{"x":225,"y":110,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-15.216904260722456,-12.94427190999916,-9.40456403667957,-4.944271909999159,-9.797174393178826e-16,4.944271909999157,9.404564036679568,12.944271909999157,15.216904260722456,16],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.944271909999158,9.40456403667957,12.94427190999916,15.216904260722456,16,15.216904260722458,12.94427190999916,9.404564036679572,4.94427190999916,1.959434878635765e-15],"height":[0,4.944271909999158,9.40456403667957,12.94427190999916,15.216904260722456,16,15.216904260722458,12.94427190999916,9.404564036679572,4.94427190999916,1.959434878635765e-15],"texture":[4],"vertical":0,"angle":30},"ring16":{"section_segments":10,"offset":{"x":210,"y":105,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":16.9,"angle":120,"vertical":0},"ring17":{"section_segments":10,"offset":{"x":223,"y":97,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":16.9,"angle":120,"vertical":0},"reactor13":{"section_segments":[20,25,30,110,115,120,200,205,210,290,295,300],"offset":{"x":0,"y":25,"z":-285},"position":{"x":[135,135,135,135,135,135,135,135],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[27,22.5,19.5,18,15,3,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor14":{"section_segments":[20,25,30,110,115,120,200,205,210,290,295,300],"offset":{"x":0,"y":25,"z":-305},"position":{"x":[130,130,130,130,130,130,130,130],"y":[0,9,7,7,10,7,8],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor15":{"section_segments":[60,65,70,150,155,160,240,245,250,330,335,340],"offset":{"x":0,"y":25,"z":-285},"position":{"x":[-135,-135,-135,-135,-135,-135,-135,-135],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[27,22.5,19.5,18,15,3,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor16":{"section_segments":12,"offset":{"x":205,"y":19,"z":-14},"position":{"x":[20,20,20,20,20,20,20,20],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"ring18":{"section_segments":8,"offset":{"x":103,"y":75,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[35,35,35,42,42,42,42,42,35,35],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":120,"vertical":0},"ring19":{"section_segments":8,"offset":{"x":118,"y":68,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":120,"vertical":0},"ring20":{"section_segments":[45,135,225,315],"offset":{"x":138,"y":310,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":-20,"vertical":0},"ring21":{"section_segments":[45,135,225,315],"offset":{"x":144,"y":290,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":-20,"vertical":0},"ring22":{"section_segments":[10,100,190,280],"offset":{"x":120,"y":0,"z":-300},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[16.5,16.5,0,0,0,0,0,16.5,16.5,16.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[13,13,13,15.6,15.6,15.6,15.6,15.6,13,13],"height":[25,25,25,30,30,30,30,30,25,25],"texture":17,"angle":0,"vertical":1},"ring23":{"section_segments":6,"offset":{"x":205,"y":13,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[15,15,0,0,0,0,0,15,15,15],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,0,0,54,54,54,54,54,0,0],"height":[0,0,0,42,42,42,42,42,0,0],"texture":18,"angle":90,"vertical":0},"ring24":{"section_segments":14,"offset":{"x":32,"y":8,"z":-240},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring25":{"section_segments":14,"offset":{"x":32,"y":-8,"z":-245},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring26":{"section_segments":14,"offset":{"x":210,"y":-12,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[30,30,30,36,36,36,36,36,30,30],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring27":{"section_segments":14,"offset":{"x":213,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,24,24,24,24,24,20,20],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring28":{"section_segments":14,"offset":{"x":213,"y":4,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring29":{"section_segments":14,"offset":{"x":150,"y":43,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[22,22,22,26.4,26.4,26.4,26.4,26.4,22,22],"height":[35,35,35,42,42,42,42,42,35,35],"texture":18,"angle":-68,"vertical":0},"ring30":{"section_segments":14,"offset":{"x":170,"y":33,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[22,22,22,26.4,26.4,26.4,26.4,26.4,22,22],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":18,"angle":-68,"vertical":0},"ring31":{"section_segments":14,"offset":{"x":190,"y":23,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[22,22,22,26.4,26.4,26.4,26.4,26.4,22,22],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":18,"angle":-68,"vertical":0},"cannons":{"section_segments":6,"offset":{"x":100,"y":-125,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-200,-200,-295,-295,-280,-220,-200,-190,-50,-45,-55,30,25,30,120,144,152,176,176],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,23.5,25,35,40,40,40,40,35,0,0,35,40,40,40,40,40,0],"height":[0,4,28.5,30,40,40,40,40,40,35,0,0,35,40,40,40,40,40,0],"texture":[16.9,3.9,17,3.9,3.9,3.9,16.9,18,16.9,112.9,1,112.9,16.9,18,3.9,16.9,3.9],"laser":{"damage":[30,30],"rate":10,"type":1,"speed":[10,180],"recoil":90,"error":3,"number":1}},"side_cannons":{"section_segments":6,"offset":{"x":190,"y":-170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[48,53,55,70,65,70,118,174,174],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,18.18181818181818,27.27272727272727,27.27272727272727,31.818181818181817,36.36363636363636,36.36363636363636,36.36363636363636,0],"height":[0,16.666666666666668,25,25,29.166666666666668,33.333333333333336,33.333333333333336,33.333333333333336,0],"texture":[3.9,16.9,16,18,16.9,3.9,18]},"rear_cannons":{"section_segments":12,"offset":{"x":130,"y":200,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[70,59,60,70,65,70,120,160],"z":[0,0,0,0,0,0,0,0]},"width":[0,20,23.076923076923077,23.076923076923077,26.923076923076923,30.769230769230766,30.769230769230766,0],"height":[0,20,23.076923076923077,23.076923076923077,26.923076923076923,30.769230769230766,30.769230769230766,0],"texture":[4,17,16,18,17,4],"angle":-155},"blocc":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":195,"y":230,"z":0},"position":{"x":[10,10,5,5,5,0,0,0,0,0,0],"y":[84,85.5,93,93,105,105,108,124.5,132,180,180],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,9.5,11,12.5,20,20,20,20,20,0],"height":[0,10,16.666666666666668,18.333333333333332,18.333333333333332,22.22222222222222,22.22222222222222,22.22222222222222,22.22222222222222,22.22222222222222,0],"texture":[4,4,17,18,4,17,4,17,4],"angle":-155},"antenna":{"section_segments":12,"offset":{"x":157,"y":125,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,10,15,90,92],"z":[0,0,0,0,0,0]},"width":[0,5,3,3,1.5,0],"height":[0,5,3,3,1.5,0],"texture":[4,4,18,17,4],"angle":-335},"antenna2":{"section_segments":12,"offset":{"x":147,"y":130,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,20,22,70,72],"z":[0,0,0,0,0,0]},"width":[0,5,3,2,1.5,0],"height":[0,5,3,2,1.5,0],"texture":[4,4,4,17,4],"angle":-335},"pipe":{"section_segments":12,"offset":{"x":155,"y":104.5,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,7,18,25,25],"z":[0,0,0,0,0,0]},"width":[0,5,5,5,5,0],"height":[0,5,5,5,5,0],"texture":[4,17,4,17,4,17,4,17,4],"angle":-155},"pipe2":{"section_segments":6,"offset":{"x":220,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,37.5,45,62.5,62.5],"z":[0,0,0,0,0,0]},"width":[0,16.666666666666668,16.666666666666668,16.666666666666668,16.666666666666668,0],"height":[0,25,25,25,25,0],"texture":[4,4,17,4,4,17,4,17,4],"angle":-155},"pipe3":{"section_segments":10,"offset":{"x":200,"y":95,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,10.5,15,42,45,52.5,52.5],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,7,7,7,9,9,0],"height":[0,7,7,7,7,9,9,0],"texture":[4,4,17,4,4,4],"angle":-155},"pipe4":{"section_segments":10,"offset":{"x":228,"y":85,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,10.5,15,42,45,67.5,67.5],"z":[0,0,0,0,0,0,0,0]},"width":[0,9,9,9,9,11,11,0],"height":[0,9,9,9,9,11,11,0],"texture":[4,4,17,4,4,4],"angle":-155},"pipe5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":220,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,37.5,45,62.5,62.5],"z":[0,0,0,0,0,0]},"width":[0,20.4,30,30,30,0],"height":[0,12.5,12.5,12.5,12.5,0],"texture":[4,4,17,4,4,17,4,17,4],"angle":-155},"pipe6":{"section_segments":[60,75,90,150,165,180,240,255,270,330,345,360],"offset":{"x":225,"y":0,"z":-110},"position":{"x":[0,0,0,0,0,0,0],"y":[-3,-3,-2,1,3,5,5],"z":[0,0,0,0,0,0,0]},"width":[0,10,20,20,15,10,0],"height":[0,10,20,20,15,10,0],"texture":[4,18,17,18,4],"vertical":true},"shield":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":40,"y":60,"z":0},"position":{"x":[0,0,0,0,4,5,0,0,0],"y":[-5,-5,5,20,45,55,85,85,85],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,10,20,30,30,30,30,8,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":20},"shield2":{"section_segments":12,"offset":{"x":95,"y":210,"z":5},"position":{"x":[-7,-7,-6,-5,0,0,0,0,0],"y":[-4.166666666666667,-4.166666666666667,4.166666666666667,16.666666666666668,33.333333333333336,41.66666666666667,62.5,70.83333333333334,70.83333333333334],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,8.333333333333334,16.666666666666668,25,25,25,16.666666666666668,6.666666666666667,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":-20},"shield3":{"section_segments":12,"offset":{"x":84,"y":168,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-4.166666666666667,-4.166666666666667,4.166666666666667,16.666666666666668,33.333333333333336,41.66666666666667,62.5,70.83333333333334,70.83333333333334],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,8.333333333333334,16.666666666666668,25,25,25,16.666666666666668,6.666666666666667,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":0},"shield4":{"section_segments":12,"offset":{"x":81,"y":130,"z":-9},"position":{"x":[-7,-7,-6,-5,0,0,0,0,0],"y":[-4.166666666666667,-4.166666666666667,4.166666666666667,16.666666666666668,33.333333333333336,41.66666666666667,62.5,70.83333333333334,70.83333333333334],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,8.333333333333334,16.666666666666668,25,25,25,16.666666666666668,6.666666666666667,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":0},"head":{"section_segments":[30,45,60,120,135,150,210,225,240,300,315,330],"offset":{"x":0.001,"y":105,"z":0},"position":{"x":[0,0,5,0,0,0,0,0,0,0,0,5,0,0],"y":[-60,-60,-30,-22.5,-15,-15,-7.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,15,30,30,50,50,50,50,30,30,15,15,0],"height":[0,15,15,30,30,50,50,50,50,30,30,15,15,0],"texture":[4,13,4,17,17.97,4,17,4,17.97,17,4,13,4],"angle":90},"disc":{"section_segments":14,"offset":{"x":0,"y":22,"z":-187},"position":{"x":[0,0,0,0,0,0],"y":[0,0,20,20,20,25],"z":[0,0,0,0,0,0]},"width":[0,36,36,33.6,24,0],"height":[0,48,36,33.6,24,0],"texture":[1,13,17,18.03,13],"vertical":true},"disc2":{"section_segments":14,"offset":{"x":0,"y":25,"z":-260},"position":{"x":[0,0,0,0,0,0],"y":[0,0,20,20,20,25],"z":[0,0,0,0,0,0]},"width":[0,11.538461538461538,11.538461538461538,10.769230769230768,7.692307692307692,0],"height":[0,11.538461538461538,11.538461538461538,10.769230769230768,7.692307692307692,0],"texture":[1,13,17,18.03,13],"vertical":true},"back":{"section_segments":6,"offset":{"x":0,"y":270,"z":35},"position":{"x":[2,2,-10,2,2],"y":[-20,-20,0,20,20],"z":[-7,-7,0,-7,-7]},"width":[0,11,11,11,0],"height":[0,10,10,10,0],"texture":[4,4,4,4],"angle":90},"backtop":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":236,"z":33},"position":{"x":[0,0,0,-10,0,0,0],"y":[-15,-15,-10,0,10,15,15],"z":[0,0,0,5,0,0,0]},"width":[0,50,50,50,50,50,0],"height":[0,10,10,10,10,10,0],"texture":[4,17,4,4,17,4],"angle":90},"back_front":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":35,"z":-160},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,-15,-10,0,10,10,12],"z":[0,0,0,0,0,0,0]},"width":[0,23,23,23,23,18,0],"height":[0,60,60,60,60,55,0],"texture":[4,17,4,4,17,4],"vertical":true},"main":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0.1,"y":191,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,75,85,85],"z":[0,0,0,0,0]},"width":[0,1,50,40,0],"height":[0,50,50,40,0],"texture":[1,4,17,4],"angle":30},"main2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0.1,"y":190,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,70,80,80],"z":[0,0,0,0,0]},"width":[0,1,70,60,0],"height":[0,50,50,40,0],"texture":[1,4,17,4],"angle":90},"main3":{"section_segments":8,"offset":{"x":0,"y":30,"z":-160},"position":{"x":[0,0,0,0,0],"y":[0,0,60,60,60],"z":[0,0,0,0,0]},"width":[0,85,85,85,0],"height":[0,60,60,60,0],"texture":[4],"angle":180,"vertical":true},"hook":{"section_segments":[45,135,225,315],"offset":{"x":42,"y":50,"z":0},"position":{"x":[-5,-5,0,0,0,-20,-20],"y":[-12,-10,-5,30,70,99,99],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,15,25,50,49,47,0],"texture":[4,17,4,4,18,4],"angle":30},"arm":{"section_segments":6,"offset":{"x":200,"y":20,"z":0},"position":{"x":[-15,-15,0,0,0,0],"y":[-30,-30,-5,140,140,155],"z":[0,0,0,0,0,0]},"width":[0,1.4,42,42,42,42],"height":[0,33,40,40,40,30],"texture":[4,3.9,3.9,18],"angle":-63},"arm2":{"section_segments":12,"offset":{"x":260,"y":0,"z":0},"position":{"x":[1,1,0,0],"y":[5,5,50,50],"z":[0,0,0,0]},"width":[0,24,37,0],"height":[0,20,30,0],"texture":[4,3.9,3.9,18],"angle":-70},"arm2_shield":{"section_segments":[30,45,60,120,135,150,210,225,240,300,315,330],"offset":{"x":250,"y":-20,"z":0},"position":{"x":[-50,-50,0,0,0,0,0,0,-85,-85],"y":[-20,-20,5,5,22,28,45,45,70,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,10,7,7,7,7,15,20,0],"height":[0,20,24,24,28,26,18,15,10,0],"texture":[4,16,16,17.9,17,17.9,16],"angle":20},"arm_deco":{"section_segments":[45,135,225,315],"offset":{"x":120,"y":40,"z":10},"position":{"x":[0,0,0,0],"y":[0,0,96.5,69.5],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,34,34,0],"texture":[17],"angle":117},"arm_deco2":{"section_segments":[45,135,225,315],"offset":{"x":120,"y":75,"z":10},"position":{"x":[0,0,0,0],"y":[0,0,96.5,69.5],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,34,34,0],"texture":[17],"angle":117},"box":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":135,"y":-90,"z":0},"position":{"x":[0,-8,0,0,0],"y":[0,0,40,140,140],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,17,19,19,0],"texture":[5,5,17]},"box2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":90,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,6,54,60,60],"z":[0,0,0,0,0,0]},"width":[0,23.076923076923077,30.769230769230766,30.769230769230766,23.076923076923077,0],"height":[0,53,55,55,53,0],"texture":[4],"angle":30},"deco":{"section_segments":6,"offset":{"x":100,"y":-5,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,65,65],"z":[0,0,0,0]},"width":[0,40,40,0],"height":[0,40,40,0],"texture":[16.9],"angle":180.5},"propeller":{"section_segments":[30,45,60,120,135,150,210,225,240,300,315,330],"offset":{"x":0,"y":250,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,40,60,62,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,50,50,40,35,35,0],"height":[0,35,35,30,25,25,0],"texture":[18,17.9,4,17,16,17],"propeller":true},"reactor_deco":{"section_segments":6,"offset":{"x":100,"y":-130,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[20],"height":[20],"propeller":true},"tube":{"section_segments":6,"offset":{"x":100,"y":-95,"z":24},"position":{"x":[0,0,0,0,0,23,23],"y":[0,0,90,0,0,0,90,90],"z":[2,2,2,0,0,-11,-11]},"width":[0,6,6,0,0,6,6],"height":[0,6,6,0,0,6,6],"texture":[3.9],"angle":180},"tube2":{"section_segments":6,"offset":{"x":100,"y":-95,"z":24},"position":{"x":[-23,-23,-23,-23,0,-23,-23],"y":[0,0,90,0,0,0,90,90],"z":[0,-37,-37,-32,0,-11,-11]},"width":[0,6,6,0,0,6,6],"height":[0,6,6,0,0,6,6],"texture":[3.9],"angle":180},"tube3":{"section_segments":6,"offset":{"x":100,"y":-95,"z":24},"position":{"x":[23,23,23,23,0,0,0],"y":[0,0,90,0,0,0,90,90],"z":[0,-37,-37,-32,0,-50,-50]},"width":[0,6,6,0,0,6,6],"height":[0,6,6,0,0,6,6],"texture":[3.9],"angle":180},"wire":{"section_segments":10,"offset":{"x":60,"y":-108,"z":10},"position":{"x":[12,12,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-117,-117,-91,-65,-39,-13,13,39,65,91,117,156,156],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6,6,6,6,6,6,6,6,6,6,6,0],"height":[0,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,0],"propeller":false,"texture":[13,13,17,13,17,13,17,13,17,13,17]},"wire2":{"section_segments":10,"offset":{"x":60,"y":-108,"z":-10},"position":{"x":[12,12,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-117,-117,-91,-65,-39,-13,13,39,65,91,117,156,156],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6,6,6,6,6,6,6,6,6,6,6,0],"height":[0,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,0],"propeller":false,"texture":[13,13,17,13,17,13,17,13,17,13,17]},"rear_propellers":{"section_segments":10,"offset":{"x":130,"y":280,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[30,30,56,60,62,65,65,55],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,27.27272727272727,27.27272727272727,27.27272727272727,24.545454545454543,24.545454545454543,22.727272727272727,0],"height":[0,27.27272727272727,27.27272727272727,27.27272727272727,24.545454545454543,24.545454545454543,22.727272727272727,0],"texture":[4,4,18,17,16,17],"angle":0,"propeller":true},"rear_propellers2":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":153,"y":255,"z":0},"position":{"x":[15,15,0,0,0,0,0,0,0],"y":[-16,-15,0,75,75,84],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,36,36,36,0],"height":[0,24,36,36,36,0],"texture":[4,4,4,18,4,16,17],"angle":-18},"rear_propellers_joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":80,"y":255,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,75,75],"z":[5,5,0,0]},"width":[0,11,11,0],"height":[0,15,25,0],"texture":[4],"angle":55},"rear_propellers_joint2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":80,"y":235,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,75,75],"z":[5,5,0,0]},"width":[0,11,11,0],"height":[0,15,25,0],"texture":[4],"angle":55},"rear_propellers_deco":{"section_segments":[20,30,40,100,110,110,285,295,305],"offset":{"x":0,"y":0,"z":-280},"position":{"x":[137,137,137,137,137,137,137,137],"y":[-32,-32,32,32,32,32,32],"z":[0,0,0,0,0,0,0,0]},"width":[0,27.27272727272727,27.27272727272727,22.727272727272727,18.18181818181818,13.636363636363635,0],"height":[0,33,33,27.500000000000004,22,16.5,0],"texture":[4,4,17,4,17,4],"vertical":true},"rear_propellers_deco2":{"section_segments":[20,30,40,100,110,110,285,295,305],"offset":{"x":0,"y":0,"z":-280},"position":{"x":[137,137,137,137,137,137,137],"y":[-32,-32,-32,-32,-32,32,32],"z":[0,0,0,0,0,0,0]},"width":[0,13.636363636363635,18.18181818181818,22.727272727272727,27.27272727272727,27.27272727272727,0],"height":[0,16.5,22,27.500000000000004,33,33,0],"texture":[4,17,4,17,4],"vertical":true,"angle":180},"rear_propellers_deco3":{"section_segments":12,"offset":{"x":125,"y":0,"z":-250},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-35,-35,-10,-5,15,20,35,37,40,41],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,8,8,8,8,8,6,3,0],"height":[0,8,8,8,8,8,8,6,3,0],"texture":[4,4,17,4,17,4,18,4,18],"vertical":true},"wing_main0600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,165,165,165,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":180},"wing_main20600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,165,165],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":180},"wing_deco0600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":180},"wing_deco20600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":180},"wing_deco30600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco40600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco50600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco60600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco70600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":180},"wing_main40500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,220,220,220,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":220},"wing_main240500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,220,220],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":220},"wing_deco40500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":220},"wing_deco240500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":220},"wing_deco340500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco440500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco540500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco640500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco740500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":220},"wing_main65370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,220,220,220,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":245},"wing_main265370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,220,220],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":245},"wing_deco65370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":245},"wing_deco265370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":245},"wing_deco365370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco465370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco565370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco665370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco765370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":245},"wing_main110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,220,220,220,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":290},"wing_main2110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,220,220],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":290},"wing_deco110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":290},"wing_deco2110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":290},"wing_deco3110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco4110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco5110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco6110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco7110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":290}},"wings":{"main":{"offset":{"x":0,"y":200,"z":48},"length":[2,20,2,2],"width":[65,65,65,65,65],"angle":[0,-15,-15,-15],"position":[-3,0,20,25,20],"doubleside":true,"bump":{"position":30,"size":10},"texture":[4,18,4]}},"typespec":{"name":"Vuaniha","level":2,"model":5,"code":205,"specs":{"shield":{"capacity":[460,610],"reload":[9,9]},"generator":{"capacity":[320,350],"reload":[70,100]},"ship":{"mass":370,"speed":[70,85],"rotation":[50,90],"acceleration":[130,130]}},"shape":[0,5.131,5.247,5.065,3.789,3.008,2.408,2.109,2.883,2.916,2.858,2.893,3.165,3.895,3.892,3.3,3.245,4.437,3.935,3.432,4.868,4.449,4.531,5.293,3.762,3.751,3.762,5.293,4.531,4.449,4.868,3.432,3.935,4.437,3.223,3.3,3.892,3.895,3.165,2.893,2.858,2.916,2.883,2.109,2.408,3.008,3.789,5.065,5.247,5.131],"lasers":[{"x":1.2,"y":-5.04,"z":0,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[10,180],"number":1,"spread":0,"error":3,"recoil":90},{"x":-1.2,"y":-5.04,"z":0,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[10,180],"number":1,"spread":0,"error":3,"recoil":90}],"radius":5.293}}',
                            '{"name":"Raigeki","level":2,"model":6,"size":2.2,"zoom":0.9,"specs":{"shield":{"capacity":[480,580],"reload":[6,6]},"generator":{"capacity":[320,360],"reload":[850,850]},"ship":{"mass":280,"speed":[120,120],"rotation":[64,64],"acceleration":[80,80]}},"bodies":{"ring":{"section_segments":12,"offset":{"x":41,"y":93,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"height":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring2":{"section_segments":12,"offset":{"x":41,"y":73.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"height":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring3":{"section_segments":12,"offset":{"x":9.8,"y":93,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring4":{"section_segments":12,"offset":{"x":9.8,"y":86,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring5":{"section_segments":12,"offset":{"x":12.4,"y":93,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring6":{"section_segments":12,"offset":{"x":12.4,"y":86,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring7":{"section_segments":[45,135,225,315],"offset":{"x":42.4,"y":1,"z":-85},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[19.5,20.3,21.1,21.5,21.1,20.3,19.5,18.7,17.9,17.5,17.9,18.7,19.5],"height":[12,12.8,13.6,14,13.6,12.8,12,11.2,10.4,10,10.4,11.2,12],"vertical":1,"texture":[17],"angle":45},"ring8":{"section_segments":[45,135,225,315],"offset":{"x":42.4,"y":-1,"z":-85},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[19.5,20.3,21.1,21.5,21.1,20.3,19.5,18.7,17.9,17.5,17.9,18.7,19.5],"height":[12,12.8,13.6,14,13.6,12.8,12,11.2,10.4,10,10.4,11.2,12],"vertical":1,"texture":[17],"angle":125},"ball":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":113,"vertical":false,"angle":0},"ball2":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":17,"vertical":false,"angle":45},"ball3":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":17,"vertical":false,"angle":90},"ball4":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":17,"vertical":false,"angle":135},"ring9":{"section_segments":12,"offset":{"x":0,"y":2.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,2.1,2.2,2.25,2.2,2.1,2,1.9,1.8,1.75,1.8,1.9,2],"height":[2,2.1,2.2,2.25,2.2,2.1,2,1.9,1.8,1.75,1.8,1.9,2],"vertical":0,"texture":113,"angle":0},"ring10":{"section_segments":12,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"height":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"vertical":0,"texture":113,"angle":0},"ring11":{"section_segments":12,"offset":{"x":0,"y":7.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"height":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"vertical":0,"texture":113,"angle":0},"ring12":{"section_segments":12,"offset":{"x":16,"y":31.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,2.2,2.4,2.5,2.4,2.2,2,1.8,1.6,1.5,1.6,1.8,2],"height":[2,2.2,2.4,2.5,2.4,2.2,2,1.8,1.6,1.5,1.6,1.8,2],"vertical":0,"texture":113,"angle":60},"ring13":{"section_segments":12,"offset":{"x":11,"y":28.8,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"height":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"vertical":0,"texture":113,"angle":60},"ring14":{"section_segments":12,"offset":{"x":13.5,"y":30.15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"height":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"vertical":0,"texture":113,"angle":60},"ring15":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":21.5,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.8,9.6,10,9.6,8.8,8,7.2,6.4,6,6.4,7.2,8],"height":[10,10.8,11.6,12,11.6,10.8,10,9.2,8.4,8,8.4,9.2,10],"vertical":0,"texture":[4,17,63,63,17,4],"angle":30},"ring16":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":15,"y":7,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.8,9.6,10,9.6,8.8,8,7.2,6.4,6,6.4,7.2,8],"height":[10,10.8,11.6,12,11.6,10.8,10,9.2,8.4,8,8.4,9.2,10],"vertical":0,"texture":[4,17,63,63,17,4],"angle":30},"ring17":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":10,"y":42.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.8,9.6,10,9.6,8.8,8,7.2,6.4,6,6.4,7.2,8],"height":[10,10.8,11.6,12,11.6,10.8,10,9.2,8.4,8,8.4,9.2,10],"vertical":0,"texture":[4,17,63,63,17,4],"angle":90},"main":{"section_segments":8,"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-80,-60,-60,-22,-20,-20,-20,34.5,34.5,36.5,50,51.5,70,68],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,18.5,20,19,20,0,0,0,60,60,40,40,16,15],"height":[0,8,8.5,10,11,12,0,0,0,12,12,20,20,15,0],"texture":[3,2,17,8,17,4,17,4,4,4,63,17,18,17]},"head":{"section_segments":[0,30,90,150,180],"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,-4,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,6,5],"height":[0,0,6.5,6],"texture":[2]},"head2":{"section_segments":[180,210,270,330,360],"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,4,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,6,5],"height":[0,0,6.5,6],"texture":[2],"angle":0},"head3":{"section_segments":8,"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,0,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,6,5],"height":[0,0,5,6],"texture":[16],"angle":0},"head4":{"section_segments":[-30,30,45,135,225,315],"offset":{"x":0.01,"y":4,"z":0},"position":{"x":[0,0,0,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,3,5],"height":[0,0,8.5,6],"texture":[2],"angle":0},"side":{"section_segments":[152,272,392],"offset":{"x":0,"y":-16,"z":0},"position":{"x":[16,16,48,48],"y":[0,0,55,55],"z":[0,0,0,0]},"width":[0,4,11,0],"height":[0,9,9.1,0],"texture":[4]},"side2":{"section_segments":[332,452,572],"offset":{"x":0,"y":-16,"z":0},"position":{"x":[-16.5,-16.5,-48.5,-48.5],"y":[0,0,55,55],"z":[0,0,0,0]},"width":[0,4,11,0],"height":[0,9,9.1,0],"texture":[4]},"box2":{"vertical":true,"angle":45,"section_segments":[45,135,225,315],"offset":{"x":17,"y":4,"z":34},"position":{"x":[0,0,0,0,0],"y":[-5,-1,1,1,1],"z":[0,0,0,0,0]},"width":[3.3333333333333335,4.666666666666667,3.3333333333333335,2,2],"height":[26,26,19.5,16.900000000000002,0],"texture":[4,17.95,17,15]},"joint":{"section_segments":6,"offset":{"x":11,"y":-25,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-2,0.7,2,2,-2,-2],"z":[0,0,0,0,0,0]},"width":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"height":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"texture":[3.9,63,3.9]},"joint2":{"section_segments":6,"offset":{"x":11,"y":-43,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-2,0.7,2,2,-2,-2],"z":[0,0,0,0,0,0]},"width":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"height":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"texture":[3.9,63,3.9]},"joint3":{"section_segments":6,"offset":{"x":11,"y":-34,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-2,0.7,2,2,-2,-2],"z":[0,0,0,0,0,0]},"width":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"height":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"texture":[3.9,63,3.9]},"box":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":0,"z":33.5},"position":{"x":[0,0,0,0,0],"y":[-5,-5,12,13,13],"z":[0,0,0,0,0]},"width":[0,3,3,1.8,0],"height":[0,18,18,16.2,0],"texture":[63,4,63,17],"angle":30,"vertical":true},"pipe":{"section_segments":12,"offset":{"x":15,"y":-17,"z":2},"position":{"x":[0,0,0,0,0,-0.5,-1,-1.5,-2,0],"y":[0,0,10,20,30,40,50,60,70],"z":[0,0,0,0,0,0,-0.5,-1,-3]},"width":[0,3,3,3,3,3,3,3,3,3],"height":[0,3,3,3,3,3,3,3,3],"texture":[17,17,18,17,18,17,18,17],"angle":36},"gap":{"section_segments":[45,135,225,315],"offset":{"x":12,"y":-16,"z":0},"position":{"x":[0,0,29.5,30],"y":[0,0,55,55],"z":[0,0,0,0]},"width":[0,2.8,1.1,0],"height":[0,12,12,0],"texture":[4]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-40,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-32.5,-12.5,0,12.5,13.2,25,25,25],"z":[0,0,0,0,-0.2,-0.2,-2,-5]},"width":[0,5,7.5,5,6.2,8,7.5,5],"height":[0,7.5,10,5,5,5,5,5],"texture":[9,9,9,17,4,63,3]},"core_shield":{"section_segments":[115,120,125,235,240,245,355,360,365],"offset":{"x":0,"y":5,"z":-22},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9411764705882355,-2.9411764705882355,-2.9411764705882355,-2.3529411764705883,-2.3529411764705883,11.764705882352942,14.705882352941178,17.647058823529413,11.764705882352942,0,-2.9411764705882355],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[28.57142857142857,38.095238095238095,41.904761904761905,47.61904761904762,47.61904761904762,47.61904761904762,42.857142857142854,28.57142857142857,23.80952380952381,23.80952380952381,28.57142857142857],"height":[30,40,44,50,50,50,45,30,25,25,30],"texture":[[15.7],16.7,17.7,3.7,63,3.7,[15.7],17.7,112.7,17.7],"angle":180,"vertical":true},"cannons":{"section_segments":6,"offset":{"x":50,"y":36,"z":-9.5},"position":{"x":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-15,-20,-20,-20,-20,-20],"y":[-93,-97,-97,-92,-90,-49,-47,-45,-10,0,10,10,10,10,10],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5.5,6,7,6.7,6.7,8,8,12.5,12,7,7,7,7,0,0],"height":[0,3.5,4,5,3,3,4,5,12.5,15,7,7,7,7,0,0],"texture":[16.9,16.9,16,12,11,5,17,1,4],"laser":{"damage":[65,65],"rate":0.5,"type":1,"speed":[210,200],"recoil":180,"number":1,"error":0}},"cannons2":{"section_segments":6,"offset":{"x":49.5,"y":36,"z":-9.5},"position":{"x":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-15,-20,-20,-20,-20,-20],"y":[-93,-97,-97,-92,-90,-49,-47,-45,-10,0,10,10,10,10,10],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5.5,6,7,6.7,6.7,8,8,12.5,12,7,7,7,7,0,0],"height":[0,3.5,4,5,3,3,4,5,12.5,15,7,7,7,7,0,0],"texture":[16.9,16.9,16,12,18,5,17,4,4]},"cannon_deco":{"section_segments":8,"offset":{"x":43.5,"y":-12,"z":-7},"position":{"x":[0,0,0,0],"y":[0,0,44,0],"z":[-0.5,-0.5,0,0]},"width":[0,1.5,1.5,0],"height":[0,1,1,0],"texture":[17],"angle":189},"cannon_deco2":{"section_segments":8,"offset":{"x":36.5,"y":-12,"z":-7},"position":{"x":[0,0,0,0],"y":[0,0,44,0],"z":[-0.5,-0.5,0,0]},"width":[0,1.5,1.5,0],"height":[0,1,1,0],"texture":[17],"angle":-189},"poker":{"section_segments":12,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0],"y":[9,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1,2,3,4,0],"height":[0,1,2,3,4,0],"angle":180,"texture":[18,17,4]},"poker2":{"section_segments":12,"offset":{"x":1,"y":23,"z":0},"position":{"x":[0,0,0,0,0],"y":[8,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1,2,3,4,0],"height":[0,1,2,3,4,0],"angle":60,"texture":[18,17,4]},"main_engine":{"section_segments":8,"offset":{"x":0,"y":36.14285714285711,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,14.285714285714286,25.714285714285715,37.142857142857146,44.57142857142857,45.714285714285715,57.142857142857146,57.142857142857146,42.857142857142854],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,17.142857142857142,17.142857142857142,12.857142857142858,11.428571428571429,11.428571428571429,10,9.142857142857142,0],"height":[0,12.857142857142858,12.857142857142858,12.857142857142858,11.428571428571429,11.428571428571429,10,9.142857142857142,0],"texture":[3.9,3.9,3.9,8,17,2.9,17],"propeller":true},"engine_top":{"section_segments":8,"offset":{"x":9.714285714285714,"y":56.14285714285711,"z":10.285714285714286},"position":{"x":[-9.714285714285714,-9.714285714285714,-2,0,0,0,0,0,0,0,0,0],"y":[0,2.857142857142857,14.285714285714286,22.857142857142858,24.285714285714285,25.714285714285715,41.42857142857143,42.857142857142854,51.42857142857143,54.285714285714285,54.285714285714285,42.857142857142854],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8.571428571428571,10.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"height":[0,8.571428571428571,8.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"texture":[4,4,4,4,17,18,17,[15],17,17],"propeller":true},"engine_bottom":{"section_segments":8,"offset":{"x":12.571428571428571,"y":56.14285714285711,"z":-8.571428571428571},"position":{"x":[-9.714285714285714,-9.714285714285714,-2,0,0,0,0,0,0,0,0,0],"y":[0,2.857142857142857,14.285714285714286,22.857142857142858,24.285714285714285,25.714285714285715,41.42857142857143,42.857142857142854,51.42857142857143,54.285714285714285,54.285714285714285,42.857142857142854],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8.571428571428571,10.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"height":[0,8.571428571428571,8.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"texture":[4,4,4,4,17,18,17,[15],17,17],"propeller":true},"side_engine":{"section_segments":8,"offset":{"x":50,"y":-16,"z":0},"position":{"x":[-25,-9,-9,-9,-9,-9],"y":[60,80,82,120,122,110],"z":[0,0,0,0,0,0]},"width":[8,15,15,15,13,0],"height":[8,15,15,15,13,0],"texture":[4,17,18,17,17],"propeller":true},"hubs":{"vertical":true,"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":41,"y":11,"z":-83},"position":{"x":[0,0,0,0,0,0,0],"y":[0,5,4,4,5,4.5],"z":[0,0,0,0,0,0,0]},"width":[10.588235294117647,8.823529411764707,7.647058823529412,7.0588235294117645,5.882352941176471,0],"height":[10.588235294117647,8.823529411764707,7.647058823529412,7.0588235294117645,5.882352941176471,0],"texture":[11,18,17,18,18]},"lights":{"section_segments":[90,180,270,360],"offset":{"x":0.01,"y":-115,"z":0},"position":{"x":[0,18.5,10,0,0],"y":[-59,-59,-39,10,10],"z":[0,0,0,0,0]},"width":[0,0.5,0.5,0.4,0],"height":[0,0.2,0.2,0.2,0],"texture":[17],"angle":180},"lights2":{"section_segments":[90,180,270,360],"offset":{"x":0.01,"y":-115,"z":0},"position":{"x":[11,12.9,6.7,0,0],"y":[-59,-59,-39,10,10],"z":[0,5.4,5.3,0,0]},"width":[0,0.75,0.75,0.4,0],"height":[0,1,1,0.2,0],"texture":[17],"angle":180},"lights3":{"section_segments":[90,180,270,360],"offset":{"x":19,"y":-36,"z":0},"position":{"x":[0,0,-0.9,0],"y":[-20,-20,20,20],"z":[0.5,0.5,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.2,0.2,0],"texture":[17],"angle":180},"lights4":{"section_segments":[90,180,270,360],"offset":{"x":4.7,"y":-25,"z":10},"position":{"x":[0,-1,1.5,0],"y":[-10,-10,5,5],"z":[-0.4,-0.4,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.2,0.2,0],"texture":[17],"angle":180},"lights5":{"section_segments":[90,180,270,360],"offset":{"x":0,"y":-22,"z":11.35},"position":{"x":[0,0,0,0],"y":[-6,-6,5,5],"z":[0,0,0.4,0.4]},"width":[0,0.75,0.75,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"lights6":{"section_segments":[90,180,270,360],"offset":{"x":19.5,"y":-11,"z":0},"position":{"x":[-40,-40,0,0],"y":[-50,-50,5,5],"z":[0,0,0.4,0.4]},"width":[0,0.75,0.75,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"lights7":{"section_segments":4,"offset":{"x":13.5,"y":-11,"z":8},"position":{"x":[-29,-29,0,0],"y":[-49.5,-49.5,5,5],"z":[0,0,0.3,0.3]},"width":[0,0.75,0.75,0],"height":[0,0.8,0.5,0],"texture":[17],"angle":180},"lights8":{"section_segments":[90,180,270,360],"offset":{"x":40,"y":65,"z":0},"position":{"x":[25,25,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.8,0.8,0],"texture":[17],"angle":180},"lights9":{"section_segments":[90,180,270,360],"offset":{"x":28,"y":65,"z":14},"position":{"x":[17,17,0,0],"y":[-10,-10,10,10],"z":[-3,-3,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.8,0.8,0],"texture":[17],"angle":180},"lights10":{"section_segments":[90,180,270,360],"offset":{"x":0,"y":-115,"z":0},"position":{"x":[0,0,0,0],"y":[-49,-39,5,5],"z":[7.7,7.5,0,0]},"width":[0.75,0.75,0.75,0],"height":[0.8,0.8,0.8,0],"texture":[17],"angle":180},"lights11":{"section_segments":20,"offset":{"x":40,"y":1,"z":-5},"position":{"x":[0,0,0,0],"y":[-39,-39,10,10],"z":[9.7,9.7,0,0]},"width":[0.75,0.75,0.75,0],"height":[0.8,0.8,0.8,0],"texture":[17],"angle":180},"lights12":{"section_segments":20,"offset":{"x":13.5,"y":-45.900000000000006,"z":6.5},"position":{"x":[0,0.5,0,0],"y":[-29,-29,10,10],"z":[0,0.8,0.2,0]},"width":[0.75,0.75,0.75,0],"height":[0.8,0.8,0.8,0],"texture":[17],"angle":180},"propeller_main":{"section_segments":16,"offset":{"x":0,"y":110,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[15],"height":[10],"texture":[0],"propeller":true},"end_laser":{"section_segments":4,"offset":{"x":30,"y":-900,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[20,20],"rate":0.5,"speed":[0.0001,123],"number":1}},"end_laser2":{"section_segments":4,"offset":{"x":30,"y":-900,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[20,20],"rate":0.5,"speed":[-60,-60],"number":1}},"laser1":{"section_segments":4,"offset":{"x":30,"y":-150,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,30],"number":1}},"laser2":{"section_segments":4,"offset":{"x":30,"y":-200,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,35],"number":1}},"laser3":{"section_segments":4,"offset":{"x":30,"y":-250,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,40],"number":1}},"laser4":{"section_segments":4,"offset":{"x":30,"y":-300,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,45],"number":1}},"laser5":{"section_segments":4,"offset":{"x":30,"y":-350,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,50],"number":1}},"laser6":{"section_segments":4,"offset":{"x":30,"y":-400,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,55],"number":1}},"laser7":{"section_segments":4,"offset":{"x":30,"y":-450,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,60],"number":1}},"laser8":{"section_segments":4,"offset":{"x":30,"y":-500,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,65],"number":1}},"laser9":{"section_segments":4,"offset":{"x":30,"y":-550,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,70],"number":1}},"laser10":{"section_segments":4,"offset":{"x":30,"y":-600,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,75],"number":1}},"laser11":{"section_segments":4,"offset":{"x":30,"y":-650,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,80],"number":1}},"laser12":{"section_segments":4,"offset":{"x":30,"y":-700,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,85],"number":1}},"laser13":{"section_segments":4,"offset":{"x":30,"y":-750,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,90],"number":1}},"laser14":{"section_segments":4,"offset":{"x":30,"y":-800,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,95],"number":1}},"laser15":{"section_segments":4,"offset":{"x":30,"y":-850,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,100],"number":1}}},"wings":{"main":{"doubleside":true,"offset":{"x":2,"y":15,"z":-10},"length":[45,0,1.5,6],"width":[0,0,33.333333333333336,66.66666666666667,33.333333333333336],"angle":[0,0,0,0],"position":[16.666666666666668,25,-25,-25,8.333333333333334],"texture":[0,4,17,63],"bump":{"position":75,"size":17}}},"typespec":{"name":"Raigeki","level":2,"model":6,"code":206,"specs":{"shield":{"capacity":[480,580],"reload":[6,6]},"generator":{"capacity":[320,360],"reload":[850,850]},"ship":{"mass":280,"speed":[120,120],"rotation":[64,64],"acceleration":[80,80]}},"shape":[5.544,4.28,3.109,2.638,3.179,3.34,3.175,2.862,2.685,2.524,2.421,2.366,2.361,2.416,2.472,2.575,2.73,3.185,3.14,3.86,4.591,5.234,5.154,4.903,4.925,4.868,4.925,4.903,5.154,5.234,4.591,3.86,3.14,3.185,2.73,2.575,2.472,2.416,2.361,2.366,2.421,2.524,2.685,2.862,3.175,3.34,3.179,2.638,3.109,4.28],"lasers":[{"x":1.76,"y":-2.684,"z":-0.418,"angle":0,"damage":[65,65],"rate":0.5,"type":1,"speed":[210,200],"number":1,"spread":0,"error":0,"recoil":180},{"x":-1.76,"y":-2.684,"z":-0.418,"angle":0,"damage":[65,65],"rate":0.5,"type":1,"speed":[210,200],"number":1,"spread":0,"error":0,"recoil":180},{"x":1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[0.0001,123],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[0.0001,123],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[-60,-60],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[-60,-60],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-6.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,30],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-6.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,30],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-8.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,35],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-8.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,35],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-11,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-11,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-13.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,45],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-13.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,45],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-15.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,50],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-15.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,50],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-17.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,55],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-17.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,55],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-19.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,60],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-19.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,60],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-22,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,65],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-22,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,65],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-24.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,70],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-24.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,70],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-26.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,75],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-26.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,75],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-28.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,80],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-28.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,80],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-30.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,85],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-30.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,85],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-33,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,90],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-33,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,90],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-35.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,95],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-35.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,95],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-37.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,100],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-37.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,100],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.544}}',
                            '{"name":"Tiaramisu","level":2,"model":7,"size":1.2,"specs":{"shield":{"capacity":[530,630],"reload":[8,8]},"generator":{"capacity":[310,310],"reload":[130,130]},"ship":{"mass":330,"speed":[95,95],"rotation":[70,70],"acceleration":[100,100]}},"bodies":{"ring":{"section_segments":[45,135,225,315],"offset":{"x":90,"y":74,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,13,18,20.5,18,13,8,3,-2,-4.5,-2,3,8],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":90},"ring2":{"section_segments":6,"offset":{"x":122.2,"y":-80,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5.4,-4.2,-3,-0.8,0.8,3,4.2,5.4,4.2,3,0,-3,-4.2,-5.4],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6.800000000000001,8,8.4,8.4,8.4,8.4,8,7.6000000000000005,6,5.2,4.800000000000001,5.2,6,6.800000000000001],"height":[4,5,5.5,5.5,5.5,5.5,5,4.5,3,2,1.5,2,3,4],"vertical":0,"texture":[4,17,4,17,4,17,4],"angle":9},"ring3":{"section_segments":6,"offset":{"x":119.7,"y":-100,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5.4,-4.2,-3,-0.8,0.8,3,4.2,5.4,4.2,3,0,-3,-4.2,-5.4],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5.949999999999999,7,7.35,7.35,7.35,7.35,7,6.6499999999999995,5.25,4.55,4.199999999999999,4.55,5.25,5.949999999999999],"height":[3.28,4.1,4.51,4.51,4.51,4.51,4.1,3.69,2.46,1.64,1.23,1.64,2.46,3.28],"vertical":0,"texture":[4,17,4,17,4,17,4],"angle":10},"ring4":{"section_segments":6,"offset":{"x":116.7,"y":-120,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5.4,-4.2,-3,-0.8,0.8,3,4.2,5.4,4.2,3,0,-3,-4.2,-5.4],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4.760000000000001,5.6000000000000005,5.880000000000001,5.880000000000001,5.880000000000001,5.880000000000001,5.6000000000000005,5.32,4.2,3.6400000000000006,3.3600000000000003,3.6400000000000006,4.2,4.760000000000001],"height":[3.04,3.8,4.18,4.18,4.18,4.18,3.8,3.42,2.2800000000000002,1.52,1.1400000000000001,1.52,2.2800000000000002,3.04],"vertical":0,"texture":[4,17,4,17,4,17,4],"angle":9},"ring5":{"section_segments":6,"offset":{"x":126,"y":40,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":17,"angle":0},"ring6":{"section_segments":6,"offset":{"x":125,"y":29,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":17,"angle":0},"ring7":{"section_segments":[45,135,225,315],"offset":{"x":119,"y":63,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,13,18,20.5,18,13,8,3,-2,-4.5,-2,3,8],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":94},"ring8":{"section_segments":6,"offset":{"x":137,"y":68,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[7,12,17,19.5,17,12,7,2,-3,-5.5,-3,2,7],"vertical":0,"texture":16.9,"angle":5},"ring9":{"section_segments":6,"offset":{"x":136,"y":55,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[6.3,11.3,16.3,18.8,16.3,11.3,6.3,1.2999999999999998,-3.7,-6.2,-3.7,1.2999999999999998,6.3],"vertical":0,"texture":16.9,"angle":5},"ring10":{"section_segments":6,"offset":{"x":130,"y":1,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":16.9,"angle":10},"ring11":{"section_segments":6,"offset":{"x":128.7,"y":-11,"z":0.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[4.5,9.5,14.5,17,14.5,9.5,4.5,-0.5,-5.5,-8,-5.5,-0.5,4.5],"vertical":0,"texture":16.9,"angle":10},"ring12":{"section_segments":6,"offset":{"x":127.4,"y":-24,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,7,12,14.5,12,7,2,-3,-8,-10.5,-8,-3,2],"height":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"vertical":0,"texture":16.9,"angle":10},"ring13":{"section_segments":6,"offset":{"x":126.8,"y":-37,"z":0.6},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,6,11,13.5,11,6,1,-4,-9,-11.5,-9,-4,1],"height":[0.5,5.5,10.5,13,10.5,5.5,0.5,-4.5,-9.5,-12,-9.5,-4.5,0.5],"vertical":0,"texture":16.9,"angle":10},"ring14":{"section_segments":6,"offset":{"x":0,"y":133,"z":50},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14,14.5,15,15.25,15,14.5,14,13.5,13,12.75,13,13.5,14],"height":[5,5.5,6,6.25,6,5.5,5,4.5,4,3.75,4,4.5,5],"vertical":0,"texture":16.9,"angle":90},"ring15":{"section_segments":[25,155,225,315],"offset":{"x":36,"y":80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"height":[10,15,20,22.5,20,15,10,5,0,-2.5,0,5,10],"vertical":0,"texture":16.9,"angle":0},"ring16":{"section_segments":[25,155,225,315],"offset":{"x":36,"y":70,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"height":[10,15,20,22.5,20,15,10,5,0,-2.5,0,5,10],"vertical":0,"texture":16.9,"angle":0},"reactor":{"section_segments":[45,135,225,315],"offset":{"x":91,"y":0,"z":-74},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"reactor2":{"section_segments":[45,135,225,315],"offset":{"x":118,"y":0,"z":-63},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":270},"lips":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":58,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":17,"vertical":0,"angle":180},"reactor3":{"section_segments":16,"offset":{"x":144,"y":38,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":0,"angle":95},"reactor4":{"section_segments":16,"offset":{"x":142,"y":18,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,1,0],"height":[9,7.5,6.5,6,5,1,0],"texture":[18,17,17,18,18,17],"vertical":0,"angle":95},"reactor5":{"section_segments":16,"offset":{"x":0,"y":47,"z":-145},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"height":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor6":{"section_segments":16,"offset":{"x":0,"y":47,"z":-121},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"height":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor7":{"section_segments":16,"offset":{"x":35,"y":17,"z":-116},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":15},"main":{"section_segments":[45,135,245,295],"offset":{"x":2.5,"y":115,"z":0},"position":{"x":[0,0,18.5,16.5,16.5,16.5],"y":[-145,-145,-60,-60,60,60],"z":[0,0,0,0,0,0]},"width":[0,1,25,27,27,0],"height":[0,1,26,26,26,0],"texture":[17,2.8,2.8,2.8,16.8],"laser":{"damage":[20,25],"rate":1,"type":1,"speed":[200,200],"number":1,"angle":1,"recoil":40,"error":0}},"lights":{"section_segments":[45,135,225,315],"offset":{"x":3.5,"y":-75,"z":0},"position":{"x":[0,0,1,1],"y":[-140,-140,-60,-60],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,20,0.5,0],"texture":[17],"angle":180},"cockpit":{"section_segments":6,"offset":{"x":0,"y":65,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-10,-2,20,30,110,110],"z":[0,0,0,0,0,0]},"width":[0,10,13,13,13,0],"height":[0,8,11,13,13,0],"propeller":false,"texture":[7,9,9,4,4]},"propeller":{"section_segments":6,"offset":{"x":0,"y":148,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,30,30,25],"z":[0,0,0,0,0]},"width":[0,40,35,28,0],"height":[0,19,19,17,0],"propeller":true,"texture":[16.9]},"stand":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":75,"z":33},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[27,28,30,45,45,70,85,88,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,20.4,28.799999999999997,33.6,33.6,33.6,28.799999999999997,18,0],"height":[0,5,7.5,10,10,10,8.5,6.5,0],"texture":[2,2,2,2,10,2]},"shield":{"section_segments":[0,50,130,180],"offset":{"x":-20,"y":128,"z":0},"position":{"x":[14,14,8.5,0,0,0,0,0,0,-6.5,-7.5,-7.5],"y":[-145,-145,-105,-73,-70,-43,-40,17,20,56,59,50],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,22.5,35,35,35,35,35,35,25,23,10],"height":[0,3.5,12,20,20.3,22,22,25,25,25,23,0],"texture":[16.9,4,18,17,3.9,17,18,17,3.9,16.9]},"shield2":{"section_segments":[0,50,130,180],"offset":{"x":-19.9,"y":128,"z":0},"position":{"x":[14,8.5,0,0,0,-6.5,-6.5,-6.5],"y":[-145,-105,-73,-40,20,56,56,47],"z":[0,0,0,0,0,0,0,0]},"width":[5,22.5,35,35,35,25,25,25],"height":[3.5,12,20,22,25,25,25,25],"texture":[3.6]},"shield3":{"section_segments":[0,50,130,180],"offset":{"x":-20.1,"y":128,"z":0},"position":{"x":[14,8.5,0,0,0,-6.5,-6.5,-6.5],"y":[-145,-105,-73,-40,20,56,56,47],"z":[0,0,0,0,0,0,0,0]},"width":[5,22.5,35,35,35,25,25,25],"height":[3.1818181818181817,10.909090909090908,18.18181818181818,20,22.727272727272727,22.727272727272727,22.727272727272727,22.727272727272727],"texture":[3.6,17.6,3.6,17.6,3.6]},"deco":{"section_segments":[0,50,130,180],"offset":{"x":-22,"y":157,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[8,33,33,8],"height":[0,25.8,25.8,0],"texture":[63]},"deco2":{"section_segments":[0,50,130,180],"offset":{"x":-25,"y":170,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[3,28,28,3],"height":[0,25.4,25.4,0],"texture":[63]},"arm":{"section_segments":6,"offset":{"x":131,"y":47,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-105,-104,-100,-30,0,30,34,36],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,12,17,17,17,10,0],"height":[0,5,10,20,21,22,10,0],"texture":[3.9,3.9,18,3.9,18,3.9],"angle":5},"arm2":{"section_segments":6,"offset":{"x":122,"y":-83,"z":-3},"position":{"x":[-6,-6,0,0],"y":[-80,-80,30,30],"z":[0,0,0,0]},"width":[0,2,10,0],"height":[0,2,5,0],"texture":[16.9,2.9],"angle":5,"laser":{"damage":[8,8],"rate":8,"type":2,"speed":[140,200],"number":1,"angle":0,"error":2}},"arm3":{"section_segments":6,"offset":{"x":122,"y":-83,"z":-3},"position":{"x":[-6,-6.5,-4,0],"y":[-60,-60,30,30],"z":[0,0,0,0]},"width":[0,1.5,5,0],"height":[0,4,8,0],"texture":[16.9,63],"angle":5},"arm4":{"section_segments":6,"offset":{"x":110,"y":-132,"z":-3},"position":{"x":[0.5,0.5,0,0],"y":[-80,-80,30,30],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,4.5,1.5,0],"texture":[16.9],"angle":185},"arm5":{"section_segments":6,"offset":{"x":131.5,"y":47,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-105,-104,-100,-30,0,30,34,36],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,12,17,17,17,10,0],"height":[0,5,10,20,21,22,10,0],"texture":[2.9,2.9,8,2.9,8,3.9],"angle":5},"arm6":{"section_segments":6,"offset":{"x":134,"y":6.5,"z":10},"position":{"x":[-6,-6.5,-6.5,-6.5,-6.5],"y":[-60,-60,10,70,70],"z":[0,-3,3.5,5.5,5.5]},"width":[0,3,5,5,0],"height":[0,4,8,8,0],"texture":[16.9,63],"angle":5},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":120,"y":-23,"z":0},"position":{"x":[0,5,7,0],"y":[-50,-50,29,29],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,5,1.5,0],"texture":[17],"angle":180},"box":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":38,"z":-133},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,8,6,6],"z":[0,0,0,0,0,0]},"width":[0,4.666666666666667,4.666666666666667,2,0.6666666666666666,0.6666666666666666],"height":[0,31.5,31.5,27.3,25.200000000000003,0],"texture":[3,3,63,17],"vertical":true,"angle":30},"box2":{"section_segments":[45,135,225,315],"offset":{"x":8,"y":13,"z":-106},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,8,6,6],"z":[0,0,0,0,0,0]},"width":[0,4.666666666666667,4.666666666666667,2,0.6666666666666666,0.6666666666666666],"height":[0,31.5,31.5,27.3,25.200000000000003,0],"texture":[3,3,63,17],"vertical":true,"angle":30},"joint":{"section_segments":6,"offset":{"x":142,"y":18,"z":0},"position":{"x":[-90,-90,0,0],"y":[-150,-150,0,0],"z":[0,0,0,0]},"width":[0,20,20,0],"height":[0,7,7,0],"texture":[1,8],"angle":90},"joint2":{"section_segments":[45,135,225,315],"offset":{"x":142,"y":18,"z":0},"position":{"x":[-90,-90,0,0],"y":[-150,-150,0,0],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,9,9,0],"texture":[17],"angle":90},"joint_box":{"section_segments":[45,135,225,315],"offset":{"x":90,"y":72,"z":0},"position":{"x":[-42,-42,0,0],"y":[-70,-70,0,0],"z":[0,0,0,0]},"width":[0,16,16,0],"height":[0,13,13,0],"texture":[1,2],"angle":90},"joint_box2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":90,"y":77,"z":0},"position":{"x":[-42,-42,0,0],"y":[-70,-70,0,2],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,14,14,0],"texture":[3],"angle":90},"joint3":{"section_segments":[45,135,225,315],"offset":{"x":121,"y":57,"z":0},"position":{"x":[-20,-20,0,0],"y":[-30,-30,0,0],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,5,5,0],"texture":[9.96],"angle":90},"cannon":{"section_segments":6,"offset":{"x":0,"y":150,"z":43},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-93,-97,-97,-92,-90,-49,-47,-40,5,8,8],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,6,7,6,6,6,11,11,0],"height":[0,3,4,5,3,3,5,7,8,0],"texture":[16.9,16.9,16.9,4,18,4,16.9,3.9],"laser":{"damage":[8,8],"rate":6,"type":2,"speed":[140,200],"number":2,"error":0,"angle":6}},"propeller_sides":{"section_segments":6,"offset":{"x":35,"y":205,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[14],"height":[23],"propeller":true},"bump":{"section_segments":[45,135,225,315],"offset":{"x":70,"y":65,"z":9},"position":{"x":[0,0,0,0,0],"y":[-1,-1,12,20,20],"z":[-4.9,-4.9,-1,0,0]},"width":[0,3,3,3,0],"height":[0,4,4,4,0],"texture":[63,63,4],"angle":30},"bump2":{"section_segments":[45,135,225,315],"offset":{"x":60,"y":71,"z":9},"position":{"x":[0,0,0,0,0],"y":[-1,-1,12,20,20],"z":[-4.9,-4.9,-1,0,0]},"width":[0,3,3,3,0],"height":[0,4,4,4,0],"texture":[63,63,4],"angle":30},"flap1":{"section_segments":6,"offset":{"x":114.66666666666667,"y":-130,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-13,-13,-10,-2,-2],"z":[0,0,0,0,0]},"width":[0,5.5,4.5,4.5,0],"height":[0,1,1.5,1.5,0],"texture":[111,16.9,[15]],"angle":90},"flap2":{"section_segments":6,"offset":{"x":115.33333333333333,"y":-110,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-13.5,-13.5,-10,-1,-1],"z":[0,0,0,0,0]},"width":[0,6,5,5,0],"height":[0,1,2,2,0],"texture":[111,16.9,[15]],"angle":90},"flap3":{"section_segments":6,"offset":{"x":116,"y":-90,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-14,-14,-10,0,0],"z":[0,0,0,0,0]},"width":[0,6.5,5.5,5.5,0],"height":[0,1,2.5,2.5,0],"texture":[111,16.9,[15]],"angle":90},"flap4":{"section_segments":6,"offset":{"x":116.66666666666667,"y":-70,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-14.5,-14.5,-10,1,1],"z":[0,0,0,0,0]},"width":[0,7,6,6,0],"height":[0,1,3,3,0],"texture":[111,16.9,[15]],"angle":90},"a0":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[0,1,2,2.5,2,1,0,-1,-2,-2.5,-2,-1,0],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c0":{"section_segments":6,"offset":{"x":0,"y":63,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0,5.5,7,7,0],"height":[0,3.5,5,5,0],"texture":[[15],16.9]},"a1":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[2.5,3.5,4.5,5,4.5,3.5,2.5,1.5,0.5,0,0.5,1.5,2.5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c1":{"section_segments":6,"offset":{"x":0,"y":69.5,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0.25,5.75,7.25,7.25,0.25],"height":[0.25,3.75,5.25,5.25,0.25],"texture":[[15],16.9]},"a2":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c2":{"section_segments":6,"offset":{"x":0,"y":76,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0.5,6,7.5,7.5,0.5],"height":[0.5,4,5.5,5.5,0.5],"texture":[[15],16.9]},"a3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[7.5,8.5,9.5,10,9.5,8.5,7.5,6.5,5.5,5,5.5,6.5,7.5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c3":{"section_segments":6,"offset":{"x":0,"y":82.5,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0.75,6.25,7.75,7.75,0.75],"height":[0.75,4.25,5.75,5.75,0.75],"texture":[[15],16.9]},"a4":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[10,11,12,12.5,12,11,10,9,8,7.5,8,9,10],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c4":{"section_segments":6,"offset":{"x":0,"y":89,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[1,6.5,8,8,1],"height":[1,4.5,6,6,1],"texture":[[15],16.9]},"a5":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[12.5,13.5,14.5,15,14.5,13.5,12.5,11.5,10.5,10,10.5,11.5,12.5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c5":{"section_segments":6,"offset":{"x":0,"y":95.5,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[1.25,6.75,8.25,8.25,1.25],"height":[1.25,4.75,6.25,6.25,1.25],"texture":[[15],16.9]},"a6":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[15,16,17,17.5,17,16,15,14,13,12.5,13,14,15],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c6":{"section_segments":6,"offset":{"x":0,"y":102,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[1.5,7,8.5,8.5,1.5],"height":[1.5,5,6.5,6.5,1.5],"texture":[[15],16.9]}},"wings":{"top":{"doubleside":true,"offset":{"x":35,"y":105,"z":14.5},"length":[0,0,-6,-1,-19,-1.5,-1.5,-10],"width":[0,40,40,40,40,120,60,60,0],"angle":[280,280,255,295,300,300,300,0],"position":[50,50,50,50,50,8,28,28,50],"texture":[63,63,63,17,11,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":35,"y":106,"z":14.5},"length":[0,0,-6,-1,-19,-1.5,-1.5,-10],"width":[0,40,40,40,40,120,60,60,0],"angle":[280,280,255,295,300,300,300,0],"position":[50,50,50,50,50,8,28,28,50],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}}},"typespec":{"name":"Tiaramisu","level":2,"model":7,"code":207,"specs":{"shield":{"capacity":[530,630],"reload":[8,8]},"generator":{"capacity":[310,310],"reload":[130,130]},"ship":{"mass":330,"speed":[95,95],"rotation":[70,70],"acceleration":[100,100]}},"shape":[0.721,0.725,0.632,0.546,0.486,4.716,4.347,3.98,3.719,3.55,3.449,3.413,3.437,3.558,3.693,3.811,4.005,3.948,3.043,3.043,2.884,2.866,3.631,4.617,4.569,4.28,4.569,4.617,3.631,2.866,2.884,3.043,3.043,3.948,4.005,3.811,3.693,3.558,3.437,3.413,3.449,3.55,3.719,3.98,4.347,4.716,0.486,0.546,0.632,0.725],"lasers":[{"x":0.06,"y":-0.72,"z":0,"angle":0,"damage":[20,25],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":1,"error":0,"recoil":40},{"x":-0.06,"y":-0.72,"z":0,"angle":0,"damage":[20,25],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":1,"error":0,"recoil":40},{"x":2.617,"y":-3.892,"z":-0.072,"angle":5,"damage":[8,8],"rate":8,"type":2,"speed":[140,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":-2.617,"y":-3.892,"z":-0.072,"angle":-5,"damage":[8,8],"rate":8,"type":2,"speed":[140,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":0,"y":1.272,"z":1.032,"angle":0,"damage":[8,8],"rate":6,"type":2,"speed":[140,200],"number":2,"spread":6,"error":0,"recoil":0}],"radius":4.716}}',
                            '{"name":"Tsimtsum","level":2,"model":8,"size":1,"specs":{"shield":{"capacity":[520,520],"reload":[7,7]},"generator":{"capacity":[270,270],"reload":[110,115]},"ship":{"mass":240,"speed":[125,125],"rotation":[95,95],"acceleration":[90,90]}},"bodies":{"ring":{"section_segments":12,"offset":{"x":0,"y":-100,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[4.2,4.2,0,0,0,0,0,4.2,4.2,4.2],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[10,10,10,12,12,12,12,12,10,10],"texture":17,"angle":0.2,"vertical":0},"ring2":{"section_segments":12,"offset":{"x":19,"y":-117,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.5999999999999996,3.5999999999999996,0,0,0,0,0,3.5999999999999996,3.5999999999999996,3.5999999999999996],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"height":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"texture":17,"angle":0,"vertical":0},"ring3":{"section_segments":12,"offset":{"x":19,"y":-107,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.5999999999999996,3.5999999999999996,0,0,0,0,0,3.5999999999999996,3.5999999999999996,3.5999999999999996],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"height":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"texture":17,"angle":0,"vertical":0},"main":{"section_segments":8,"offset":{"x":0,"y":90,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-215,-210,-200,-170,10,30,55,75,75,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,45,35,40,35,30,25,24,0],"height":[0,6,20,20,20,20,20,20,19,0],"propeller":true,"texture":[4,63,4,4,4,4,12,17]},"side_main":{"section_segments":8,"offset":{"x":0.4,"y":90,"z":-5.48},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-215,-210,-200,-170,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,45,35,40,35,30,25,0],"height":[0,6,20,20,20,20,20,20,0],"texture":[4,4,4,18,4,4,4,17]},"head":{"section_segments":[0,55,90,150,210,270,305],"offset":{"x":0,"y":-220,"z":-5},"position":{"x":[0,0,0,0],"y":[0,100,120,140],"z":[0,0,0,0]},"width":[0,50,50,0],"height":[0,25,25,0],"propeller":false,"texture":[63]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-150,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-27.85,-17,17.85,37.71,50,50],"z":[-8.25,-7.46,0,0,0,0]},"width":[0,8.92,13.39,13.39,13,0],"height":[0,8.92,13.39,15.71,14,0],"texture":[7,9,9,4]},"shield":{"section_segments":[0,60,120,180],"offset":{"x":-9,"y":-105,"z":0},"position":{"x":[5,5,-2,-2,-2,-2],"y":[-73,-73,-30,-15,5,5],"z":[0,-1,1,5,5,5]},"width":[0,5,15,15,15,0],"height":[0,11,20,20,20,0],"texture":[16.9,3.9,18,2.9]},"bars":{"section_segments":8,"offset":{"x":30,"y":90,"z":10},"position":{"x":[10,10,5,-2,0,-4,-5,-10,-12,-12,-12,-12,-12],"y":[-215,-210,-200,-170,-53,-40,0,10,30,30,30,30],"z":[-3,-3,-8,0,0,0,2,0,-10,-10,-10,-10]},"width":[0,2,7.5,7.5,7.5,8.75,8.75,8.75,8.75,5,5,0],"height":[0,1.5,5,5,5,5,5,5,5,5,5,0],"propeller":false,"texture":[4,63,18,4,18,8,18,17,13,4]},"under_bars":{"section_segments":8,"offset":{"x":30,"y":90,"z":-20},"position":{"x":[10,10,5,-2,0,0,-12,-12,-12,-12,-12],"y":[-205,-200,-200,-170,-60,-20,30,30,30,30],"z":[9,9,9,0,0,10,10,10,10,10]},"width":[0,2,7.5,7.5,7.5,8.75,8.75,5,5,0],"height":[0,1.5,5,5,5,5,5,5,5,0],"propeller":false,"texture":[4,63,18,4,4,17,13,4]},"cannons":{"section_segments":12,"offset":{"x":160,"y":99,"z":36},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-65,-70,-57,-55,-3,0,5,10,30,30,20],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,12,15,15,13,15,16,16,12,12,11,0],"height":[0,12,15,15,13,15,16,16,12,12,11,0],"texture":[3,17,63,63,4,63,63,63,13,17],"propeller":true,"angle":4,"laser":{"damage":[18,18],"rate":3,"type":1,"speed":[160,200],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":90,"y":84,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-65,-70,-57,-55,-3,0,5,10,25,25,15],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,12.5,12.5,10.83,12.5,13.3,13.3,10,10,9,0],"height":[0,10,12.5,12.5,10.83,12.5,13.3,13.3,10,10,9,0],"texture":[3,17,63,63,4,63,63,63,13,17],"propeller":true,"angle":3,"laser":{"damage":[7,7],"rate":7,"type":2,"speed":[180,180],"number":2,"angle":2,"error":0}},"side_propeller":{"section_segments":8,"offset":{"x":30,"y":110,"z":-5},"position":{"x":[0,0,0,-2,-2,-2,-2],"y":[-50,10,20,36,50,50,40],"z":[10,0,0,0,0,0,0]},"width":[0,6,7.5,7.5,6.5,5,0],"height":[0,12,15,15,13,11.5,0],"texture":[3,17,3,13,17,17],"propeller":true},"wing_holders":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-20,"z":-125},"position":{"x":[0,0,0,0,0,0],"y":[30,30,40,50,50],"z":[0,0,-10,-20,-20,0]},"width":[0,20,20,20,0],"height":[0,25,25,25,0],"propeller":false,"vertical":true,"texture":[3]},"blocc":{"section_segments":[45,135,225,315],"offset":{"x":0.01,"y":-89.99,"z":15.01},"position":{"x":[0,0,0,0,0,0],"y":[-25,-25,-20,0,0,0],"z":[0,0,0,0,0,0]},"width":[0,12,12,12,12,12,0],"height":[0,3,3,3,3,0],"texture":[3,3,17,3,3],"angle":270},"bars2":{"section_segments":[45,90,135,225,270,315],"offset":{"x":18,"y":-49,"z":12},"position":{"x":[5,5,0,0,0,-8,-8],"y":[-50,-50,-30,50,86,49,55],"z":[-5,-5,0,0,0,0,-5]},"width":[0,12,12,12,12,12,0,0],"height":[0,5,5,5,5,0,0],"texture":[63,63,3,63,3]},"box":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-41.5,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-40,-40,10,12.5,15,15],"z":[0,0,0,0,0,0]},"width":[0,13,13,13,13,0],"height":[0,5,5,5,5,0],"texture":[1,18.2,17,3]},"back_support":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":4.5,"z":17.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-18,-14,-4,0,7.5,7.5],"z":[-3.5,-2.5,-2,-2,-2,-5.4,-5.4]},"width":[5,5,5,5,5,5,0],"height":[2,2,2,2,2,2,2,0],"texture":[3,63,4,63,3],"angle":90},"back_support2":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":34.5,"z":17.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-18,-14,-4,0,8,8.5],"z":[-3.5,-2.5,-2,-2,-2,-4,-4]},"width":[5,5,5,5,5,5,0],"height":[2,2,2,2,2,2,2,0],"texture":[3,63,4,63,3],"angle":90},"back_support3":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":19.5,"z":17.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-18,-14,-4,0,8,8.5],"z":[-3.5,-2.5,-2,-2,-2,-4,-4]},"width":[5,5,5,5,5,5,0],"height":[2,2,2,2,2,2,2,0],"texture":[3,63,4,63,3],"angle":90},"back_lights":{"section_segments":4,"offset":{"x":0,"y":21,"z":14},"position":{"x":[0,0,0,0,0,0],"y":[-13,-13,-5,2,10,10],"z":[0,0,0,0,0,0]},"width":[0,8,8,8,8,0],"height":[0,1,1,1,1,0],"texture":[17]},"reactor":{"section_segments":12,"offset":{"x":0,"y":28,"z":12.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-20,-13,-10,-12,-12.5,-10,-10,-12],"z":[0,0,0,0,0,0,0,0]},"width":[13,13,10,9,6,4.2,4,0],"height":[13,13,10,9,6,4.2,4,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"reactor_joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-12,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-15,-15,-5,10,15,15],"z":[0,1.2,0,0,-2.8,-2.8]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[4]},"reactor_joint2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-12.5,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-15,-15,-10,10,15,15],"z":[-2.8,-2.8,0,0,-2.8,-2.8]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[4],"angle":90},"reactor2":{"section_segments":12,"offset":{"x":0,"y":50,"z":-150},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-14.285714285714286,-9.285714285714286,-7.142857142857143,-8.571428571428571,-8.928571428571429,-7.142857142857143,-7.142857142857143,-8.571428571428571],"z":[0,0,0,0,0,0,0,0]},"width":[13,13,10,9,6,4.2,4,0],"height":[13,13,10,9,6,4.2,4,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"back":{"section_segments":[40,45,50,130,135,140,220,225,310,315,320],"offset":{"x":15,"y":53,"z":15},"position":{"x":[0,3,3,0,0,0,0,0],"y":[-15.5,-15,-10,5,30,45,50,52],"z":[0,-1.8,0,0,0,0,0,0]},"width":[0,12,12,12,12,12,10.5,0],"height":[0,5,5,5,5,5,5,0],"texture":[63,63,3,13,3,63]},"back_bars":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":53,"z":18},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,-3.5,3.5,7,7],"z":[0,0,0,-2,-5,-5]},"width":[0,3.5,3.5,3.5,3.5,0],"height":[0,3,3,3,3,0],"texture":[4],"angle":90},"back_bars2":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":88,"z":18},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,-3.5,3.5,7,7],"z":[0,0,0,-2,-5,-5]},"width":[0,3.5,3.5,3.5,3.5,0],"height":[0,3,3,3,3,0],"texture":[4],"angle":90},"back_hubs":{"section_segments":12,"offset":{"x":18,"y":33,"z":-77},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-20,-13,-11,-12,-12.5,-10,-10,-12],"z":[0,0,0,0,0,0,0,0]},"width":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"height":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"back_hubs2":{"section_segments":12,"offset":{"x":18,"y":33,"z":-64},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-20,-13,-11,-12,-12.5,-10,-10,-12],"z":[0,0,0,0,0,0,0,0]},"width":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"height":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"cannon_lights":{"section_segments":[45,135,225,315],"offset":{"x":166,"y":71,"z":47.3},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,30,30],"z":[-2,-2,-1.5,0,0]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[3,3,63],"angle":4},"cannon_lights2":{"section_segments":[45,135,225,315],"offset":{"x":150,"y":71,"z":47.3},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,30,30],"z":[-2,-2,-1.5,0,0]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[3,3,63],"angle":4},"cannon_lights3":{"section_segments":[45,135,225,315],"offset":{"x":165,"y":71,"z":47.3},"position":{"x":[0,0,0,0],"y":[-30,-30,30,30],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[17],"angle":4},"cannon_lights4":{"section_segments":[45,135,225,315],"offset":{"x":151,"y":71,"z":47.3},"position":{"x":[0,0,0,0],"y":[-30,-30,30,30],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[17],"angle":4},"cannon_light":{"section_segments":[45,135,225,315],"offset":{"x":158,"y":71,"z":49},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[18],"angle":18},"cannon_light2":{"section_segments":[45,135,225,315],"offset":{"x":158,"y":71,"z":49},"position":{"x":[0,0,0,0],"y":[-30,-30,27,27],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[18],"angle":-9},"lower_cannon_lights":{"section_segments":[45,135,225,315],"offset":{"x":96,"y":56.5,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,25,25],"z":[-3,-3,-3.5,-2.5,-2.5]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[4,4,63],"angle":4},"lower_cannon_lights2":{"section_segments":[45,135,225,315],"offset":{"x":81,"y":56.5,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,25,25],"z":[-3,-3,-3.5,-2.5,-2.5]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[4,4,63],"angle":2},"lower_cannon_lights3":{"section_segments":[45,135,225,315],"offset":{"x":94.5,"y":56.5,"z":-4.4},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3.4,-2.5,-2.5]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[17],"angle":4},"lower_cannon_lights4":{"section_segments":[45,135,225,315],"offset":{"x":82.5,"y":56.5,"z":-5},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3,-2.5,-2.5]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[17],"angle":2},"lower_cannon_lights5":{"section_segments":[45,135,225,315],"offset":{"x":89,"y":56.5,"z":-2.6},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3,-2.5,-2.5]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[18],"angle":17},"lower_cannon_lights6":{"section_segments":[45,135,225,315],"offset":{"x":87.2,"y":56.5,"z":-2.9},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3,-3,-3]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[18],"angle":-12},"wing_cross":{"section_segments":10,"offset":{"x":0,"y":165,"z":35},"position":{"x":[0,0,0,0],"y":[-15,-15,20,20],"z":[0,3.5,-0.3,0]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":180},"wing_cross2":{"section_segments":10,"offset":{"x":0,"y":145,"z":35},"position":{"x":[0,0,0,0],"y":[-15,-15,1,1],"z":[0,-3,-0.1,0]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":0},"wing_cross3":{"section_segments":10,"offset":{"x":0,"y":150,"z":38},"position":{"x":[0,0,0,0],"y":[-20,-20,-5,-5],"z":[0,0,-3,-3]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":90},"wing_cross4":{"section_segments":10,"offset":{"x":0,"y":150,"z":38},"position":{"x":[0,0,0,0],"y":[-20,-20,-5,-5],"z":[0,0,-3,-3]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":-90},"wing_cross5":{"section_segments":10,"offset":{"x":3,"y":150,"z":35},"position":{"x":[0,0,0,0],"y":[-20,-20,30,30],"z":[0,-1,4.5,4.5]},"width":[0,0.5,0.5,0],"height":[0,1,1,0],"texture":[5],"angle":0},"wing_cross6":{"section_segments":10,"offset":{"x":0,"y":152,"z":35},"position":{"x":[0,0,0,0,0],"y":[-20,-20,0,20,20],"z":[4,4,0.8,4,4]},"width":[0,0.5,0.5,0.5,0],"height":[0,1,1,1,0],"texture":[5],"angle":90},"wing_cross7":{"section_segments":10,"offset":{"x":0,"y":147,"z":35},"position":{"x":[0,0,0,0,0],"y":[-20,-20,0,20,20],"z":[4,4,0.5,4,4]},"width":[0,0.5,0.5,0.5,0],"height":[0,1,1,1,0],"texture":[5],"angle":90},"wing_bump":{"section_segments":6,"offset":{"x":75,"y":186,"z":15},"position":{"x":[0,0,0,0,0],"y":[-3,4,4,-3,-3],"z":[0,0,0,0,0]},"width":[13,13,11,11,13],"height":[5,5,0,0,5],"angle":90,"texture":[17,4]},"wing_bump2":{"section_segments":6,"offset":{"x":85,"y":188,"z":17},"position":{"x":[0,0,0,0,0],"y":[-3,4,4,-3,-3],"z":[0,0,0,0,0]},"width":[11,11,9,9,11],"height":[5,5,0,0,5],"angle":90,"texture":[17,4]},"lights":{"section_segments":[45,135,225,315],"offset":{"x":14,"y":5,"z":38},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,53,53,51,0],"texture":[63,17,63],"angle":40,"vertical":true},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":3,"y":16,"z":59},"position":{"x":[0,0,0,0,0],"y":[-5,-5,5,6,6],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,23,23,21,0],"texture":[63,17,63],"angle":30,"vertical":true},"lights3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":13,"z":-77},"position":{"x":[0,0,0,0,0],"y":[-5,-5,5,6,6],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,33,33,31,0],"texture":[63,17,63],"angle":30,"vertical":true},"asa0":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-75,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as0":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-73.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa1":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-65,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as1":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-63.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa2":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-55,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as2":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-53.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa3":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-45,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as3":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-43.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa4":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-35,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as4":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-33.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[45,2,20,2,12,2,20,2,55],"width":[70,61,61,61,61,58,58,55,55,45],"angle":[15,15,15,15,15,15,15,15,15],"position":[0,0,0,0,0,0,0,0,0,0],"texture":[8,17,4,17,18,17,8,17,18],"bump":{"position":20,"size":10}},"main_lights":{"doubleside":true,"offset":{"x":0,"y":68,"z":0},"length":[45,2,20,2,12,2,20,2,55],"width":[70,61,61,61,61,58,58,55,55,45],"angle":[15,15,15,15,15,15,15,15,15],"position":[0,0,0,0,0,0,0,0,0,0],"texture":[17],"bump":{"position":30,"size":0}},"main2":{"doubleside":true,"offset":{"x":0,"y":71,"z":0},"length":[45,2,20,2,12,2,20,2,54],"width":[70,61,61,61,61,58,58,55,55,45],"angle":[15,15,15,15,15,15,15,15,15],"position":[0,0,0,0,0,0,0,0,0,0],"texture":[8,17,4,17,4,17,3,17,4],"bump":{"position":20,"size":10}},"bottom":{"doubleside":true,"offset":{"x":0,"y":70,"z":5},"length":[35,50],"width":[67.5,57.5,47.5],"angle":[-15,-10],"position":[0,-10,-17.5],"texture":[4,17.8],"bump":{"position":30,"size":10}},"bottom_lights":{"doubleside":true,"offset":{"x":0,"y":68,"z":5},"length":[35,50],"width":[67.5,57.5,47.5],"angle":[-15,-10],"position":[0,-10,-17.5],"texture":[17],"bump":{"position":30,"size":0}},"top":{"doubleside":true,"offset":{"x":0,"y":170,"z":30},"length":[25,2,50,2,35,100],"width":[70,60,60,50,48,20],"angle":[15,-30,-30,20,20],"position":[-15,-13,-13,10,10,20],"texture":[4,17,18,17,4],"bump":{"position":35,"size":10}},"top_lights":{"doubleside":true,"offset":{"x":0,"y":168,"z":30},"length":[25,2,50,2,35,100],"width":[70,60,60,50,48,20],"angle":[15,-30,-30,20,20],"position":[-15,-13,-13,10,10,20],"texture":[17],"bump":{"position":35,"size":0}}},"typespec":{"name":"Tsimtsum","level":2,"model":8,"code":208,"specs":{"shield":{"capacity":[520,520],"reload":[7,7]},"generator":{"capacity":[270,270],"reload":[110,115]},"ship":{"mass":240,"speed":[125,125],"rotation":[95,95],"acceleration":[90,90]}},"shape":[4.4,3.908,3.238,2.799,2.348,1.342,1.142,0.993,0.903,0.832,0.792,1.742,3.095,3.277,3.517,3.692,4.002,4.299,4.322,2.968,2.83,4.508,4.444,4.284,3.895,3.8,3.895,4.284,4.444,4.508,2.83,2.968,4.322,4.299,4.002,3.692,3.517,3.277,3.095,1.742,0.792,0.832,0.903,0.993,1.142,1.342,2.348,2.799,3.238,3.908],"lasers":[{"x":3.054,"y":-0.115,"z":0.72,"angle":4,"damage":[18,18],"rate":3,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.054,"y":-0.115,"z":0.72,"angle":-4,"damage":[18,18],"rate":3,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.695,"y":-0.317,"z":-0.3,"angle":3,"damage":[7,7],"rate":7,"type":2,"speed":[180,180],"number":2,"spread":2,"error":0,"recoil":0},{"x":-1.695,"y":-0.317,"z":-0.3,"angle":-3,"damage":[7,7],"rate":7,"type":2,"speed":[180,180],"number":2,"spread":2,"error":0,"recoil":0}],"radius":4.508}}',
                            '{"name":"Pusat","level":2,"model":9,"size":1.3,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[240,240],"reload":[88,88]},"ship":{"mass":240,"speed":[130,130],"rotation":[75,75],"acceleration":[90,90]}},"bodies":{"ring":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":34.5,"y":79,"z":1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13,13.6,14.2,14.5,14.2,13.6,13,12.4,11.8,11.5,11.8,12.4,13],"height":[12,12.6,13.2,13.5,13.2,12.6,12,11.4,10.8,10.5,10.8,11.4,12],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":34.5,"y":69,"z":1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13,13.6,14.2,14.5,14.2,13.6,13,12.4,11.8,11.5,11.8,12.4,13],"height":[12,12.6,13.2,13.5,13.2,12.6,12,11.4,10.8,10.5,10.8,11.4,12],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring3":{"section_segments":[45,135,225,315],"offset":{"x":38.5,"y":5,"z":-74},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8.1,8.7,9.299999999999999,9.6,9.299999999999999,8.7,8.1,7.5,6.8999999999999995,6.6,6.8999999999999995,7.5,8.1],"height":[7,7.6,8.2,8.5,8.2,7.6,7,6.4,5.8,5.5,5.8,6.4,7],"vertical":1,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring4":{"section_segments":[45,135,225,315],"offset":{"x":38.5,"y":-2,"z":-74},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8.1,8.7,9.299999999999999,9.6,9.299999999999999,8.7,8.1,7.5,6.8999999999999995,6.6,6.8999999999999995,7.5,8.1],"height":[7,7.6,8.2,8.5,8.2,7.6,7,6.4,5.8,5.5,5.8,6.4,7],"vertical":1,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-95,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring6":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-90,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring7":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-85,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-80,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-75,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring10":{"section_segments":6,"offset":{"x":0,"y":40,"z":9.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.6,17.2,17.5,17.2,16.6,16,15.4,14.8,14.5,14.8,15.4,16],"height":[16,16.6,17.2,17.5,17.2,16.6,16,15.4,14.8,14.5,14.8,15.4,16],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring11":{"section_segments":6,"offset":{"x":0,"y":50,"z":14.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.6,17.2,17.5,17.2,16.6,16,15.4,14.8,14.5,14.8,15.4,16],"height":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring12":{"section_segments":8,"offset":{"x":12,"y":45,"z":14.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.6,9.2,9.5,9.2,8.6,8,7.4,6.8,6.5,6.8,7.4,8],"height":[8,8.6,9.2,9.5,9.2,8.6,8,7.4,6.8,6.5,6.8,7.4,8],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":0},"ring13":{"section_segments":8,"offset":{"x":7,"y":68,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3499999999999999,-1.05,-0.75,0,0.75,1.05,1.3499999999999999,1.05,0.75,0,-0.75,-1.05,-1.3499999999999999],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"height":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":0},"ring14":{"section_segments":8,"offset":{"x":0,"y":61,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3499999999999999,-1.05,-0.75,0,0.75,1.05,1.3499999999999999,1.05,0.75,0,-0.75,-1.05,-1.3499999999999999],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"height":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":90},"ring15":{"section_segments":8,"offset":{"x":0,"y":75,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3499999999999999,-1.05,-0.75,0,0.75,1.05,1.3499999999999999,1.05,0.75,0,-0.75,-1.05,-1.3499999999999999],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"height":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":90},"front":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-126,-126,-115,-70,-23,-5,-5,-5],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,9.6,25,25,25,23,0],"height":[0,5.3,8.4,20,20,15,13,0],"texture":[12,2,3.9,18,10,63,4],"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[240,240],"number":1,"error":0,"recoil":10}},"back":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,-10,-8,40,70,80,90,100,100,100,85],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,25,25,25,25,25,35,35,35,30,28,0],"height":[0,15,20,20,19,20,20,20,20,15,13,0],"texture":[63,18,17,4,18,3.9,3.9,4.9,4.9,16.84],"propeller":true},"head":{"section_segments":6,"offset":{"x":0,"y":-2,"z":0},"position":{"x":[0,0,0,0,0],"y":[-130,-128,-115,-70,-70],"z":[0,0,0,0,0]},"width":[0,5,10,25,25],"height":[0,4.545454545454545,7.363636363636362,18.18181818181818,18.18181818181818],"texture":[3.9]},"head_top":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-115,-115,-115,-70,-70],"z":[0,0,0,0,0]},"width":[0,0,8.615384615384615,22.307692307692307,19.23076923076923],"height":[0,0,9.240000000000002,22,22],"texture":[17,63,3]},"head_top2":{"section_segments":5,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-115,-115,-115,-70,-70],"z":[0,0,1.1,2.4,0]},"width":[0,0,8,20.714285714285715,17.857142857142858],"height":[0,0,8.4,20,20],"texture":[17,18]},"head_top3":{"section_segments":5,"offset":{"x":0,"y":0,"z":-0.1},"position":{"x":[0,0,0,0,0],"y":[-115,-115,-115,-70,-70],"z":[0,0,1.1,2.4,0]},"width":[0,0,8.615384615384615,22.307692307692307,19.23076923076923],"height":[0,0,8.4,20,20],"texture":[63,63,17]},"bottom":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[0,-80,-30,-25,0,20,50,80],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,20,30,30,25,0],"height":[0,2,15,15,20,20,20,0],"texture":[4,3,2,3,11,18]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":30,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-20,0,10,20,30,48],"z":[0,0,-2,-4,0,-9,0]},"width":[0,10,15,15,15,10,0],"height":[0,10,15,15,5,10,0],"texture":[9,9,9,4,4]},"cannons_main":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-100,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[5,0,0,30,35,45,47,74,76,97,102,173],"z":[-17,-17,-17,-17,-10,-10,-10,-11,-10,-10,-10,-10,-10]},"width":[0,5,6.5,6.5,7,7,0,0,7,7,10,10],"height":[0,3.5,5,5,8,10,0,0,10,10,8,8],"texture":[17,17,13,4,8,18,1,18,7,7,7,8],"propeller":false,"laser":{"damage":[9,9],"rate":8,"type":2,"speed":[280,280],"number":1,"error":2,"recoil":4}},"joints":{"section_segments":[45,135,225,315],"offset":{"x":16,"y":8.5,"z":-25},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,8,6,6],"z":[0,0,0,0,0,0]},"width":[0,7,7,3,1,1],"height":[0,35.699999999999996,35.699999999999996,30.939999999999998,28.56,0],"texture":[8,8,63,17,18],"vertical":true,"angle":30},"sides":{"section_segments":[0,60,120,180],"offset":{"x":-14,"y":32,"z":14},"position":{"x":[0,0,0,0,0,0,-8,-8],"y":[-20,-20,4,6,18,20,35,35],"z":[-7,-4,-4,-3,-3,-3,-6,-6]},"width":[0,5,15,15,15,15,5,0],"height":[0,5,10,10,10,10,3,0],"texture":[16.9,4,63,18,63,4]},"joins":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-54.5,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-5,0,5,10,15,20,25,30,35,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,1,5,1,5,1,5,1,5,1,0],"height":[0,1,7,1,7,1,7,1,7,1,0],"texture":[17,18,17,18,17,18,17,18,17,18],"propeller":false},"cannon_joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-13.5,"z":49},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[5,5,19,19,0,0,5,5,19,19,0,0,5,5,19,19,0,0,5,5,19,19,0,0,5,5,19,19],"z":[0,0,0,0,0,0,-5,-5,-5,-5,0,0,-10,-10,-10,-10,0,0,-15,-15,-15,-15,0,0,-20,-20,-20,-20]},"width":[0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0],"height":[0,1.3,1.3,0,0,0,0,1.3,1.3,0,0,0,0,1.3,1.3,0,0,0,0,1.3,1.3,0,0,0,0,1.3,1.3,0],"texture":[17,18,17,18,17,18,17,18,17,18,17,18,1,18,17,18,17,18,17,18,17,18,17,18,17,18,17,18],"propeller":false,"vertical":true},"cannon_joint_side":{"section_segments":[80,90,100],"offset":{"x":-20,"y":-55,"z":-2},"position":{"x":[53,53,53,53],"y":[-0.3,-0.3,31,31],"z":[0,0,0,0]},"width":[8,8,8,8],"height":[0,42,42,0],"texture":[3],"propeller":false},"cannon_joint_side2":{"section_segments":[-100,-90,-80],"offset":{"x":-10.52,"y":-55,"z":-2},"position":{"x":[38,38,38,38],"y":[-0.3,-0.3,31,31],"z":[0,0,0,0]},"width":[8,8,8,8],"height":[0,42,42,0],"texture":[3],"propeller":false},"rear_cannon":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":40,"y":65,"z":-3},"position":{"x":[-5,0,0,0,0],"y":[-40,-20,0,10,20],"z":[0,0,10,0,0]},"width":[4,4,4,4,4],"height":[5,5,5,5,5],"texture":[3,18,4,8,9],"propeller":false},"rear_cannon1":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":40,"y":65,"z":-3},"position":{"x":[-5,0,0],"y":[-40,-20,0],"z":[0,0,0]},"width":[4,4.01,4.01],"height":[5,5,5],"texture":[3,18,4],"propeller":false},"rear_cannon2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":65,"z":-3},"position":{"x":[-5,0,0,0,0],"y":[-40,-20,0,10,20],"z":[0,0,10,0,0]},"width":[4,4,4,4,4],"height":[5,5,5,5,5],"texture":[3,18,4,8,9],"propeller":false},"rear_propeller":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":34.5,"y":75.5,"z":1.7},"position":{"x":[0,0,0,0,0,-4,-4,-4],"y":[-10,-10,-8,5,7,20,20,10],"z":[0,0,0,0,0,0,0,0]},"width":[0,12,13,13,13,13,12,0],"height":[5,12,12,12,12,10,9,0],"texture":[3,17,13,17,5,17],"propeller":true},"rear_propeller2":{"section_segments":[45,135,225,315],"offset":{"x":21,"y":0,"z":25},"position":{"x":[-10,-10,-4,-4],"y":[0,0,94,94],"z":[-5,-5,-11,-10]},"width":[0,3,1.3,0],"height":[0,2,0.3,0],"texture":[17],"angle":180},"hubs":{"section_segments":8,"offset":{"x":5,"y":17,"z":-45},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3.5714285714285716,-5,-2.857142857142857,-2.857142857142857,-4.285714285714286,-4.285714285714286,5.714285714285714,5.714285714285714],"z":[0,0,0,0,0,0,0,0]},"width":[-2.1052631578947367,2.1052631578947367,2.1052631578947367,2.6315789473684212,2.6315789473684212,3.1578947368421053,3.1578947368421053,0],"height":[-2.1052631578947367,2.1052631578947367,2.1052631578947367,2.6315789473684212,2.6315789473684212,3.1578947368421053,3.1578947368421053,0],"vertical":true,"texture":[17,18,18,18,63,4],"angle":205},"reactor":{"section_segments":12,"angle":0,"offset":{"x":0,"y":14,"z":-68},"position":{"x":[0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,6.875],"z":[0,0,0,0,0]},"width":[10.4,10.4,9.4,9.4,9.4],"height":[10.4,10.4,9.4,9.4,0],"texture":[17,2,17,11],"vertical":true},"reactor_top":{"section_segments":8,"angle":0,"offset":{"x":0,"y":19,"z":-68},"position":{"x":[0,0,0,0],"y":[-10,-10,0,5],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[18],"vertical":true},"reactor_bottom":{"section_segments":12,"angle":0,"offset":{"x":0,"y":13,"z":-68},"position":{"x":[0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,6.875],"z":[0,0,0,0,0]},"width":[16,16,14,14,0],"height":[16,16,14,14,0],"texture":[3,17,3,18],"vertical":true},"reactor_reactor":{"section_segments":8,"offset":{"x":10,"y":16.5,"z":-68},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"height":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"reactor_reactor2":{"section_segments":8,"offset":{"x":0,"y":16.5,"z":-58},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"height":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"reactor_reactor3":{"section_segments":8,"offset":{"x":0,"y":16.5,"z":-78},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"height":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"body_deco":{"section_segments":[45,135,225,315],"offset":{"x":12,"y":-15,"z":14},"position":{"x":[0,0,0,5,5,5],"y":[-40,-40,-5,5,25,25],"z":[2,2,1,0,0,0]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[3]},"body_deco2":{"section_segments":[45,135,225,315],"offset":{"x":11.2,"y":-15,"z":13.99},"position":{"x":[-5,-5,0,0,0,0],"y":[-4.95,-4.95,5,40,40,39.95],"z":[0,0,1,2,2,2,2]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[7,18,17,7,7],"angle":180},"body_deco3":{"section_segments":[45,135,225,315],"offset":{"x":11.2,"y":-15,"z":13.99},"position":{"x":[5,5,5],"y":[5,25,25],"z":[0,0,0]},"width":[2,2,2],"height":[3,3,3],"texture":[17]},"cannon_base":{"section_segments":[45,135,225,315],"angle":0,"offset":{"x":0,"y":-48,"z":17},"position":{"x":[0,0,0,0,0,0],"y":[-22,-22,-10,-5,25,25],"z":[0,0,0,0,-1,-1]},"width":[0,10,12.5,9,9,0],"height":[0,5,5,5,5,0],"texture":[7]},"cannon_base_deco":{"section_segments":[45,135,225,315],"angle":0,"offset":{"x":0,"y":-31,"z":19},"position":{"x":[0,0,0,0],"y":[-7.5,-7.5,7.5,7.5],"z":[0,0,0,0]},"width":[0,6,6,0],"height":[0,2.5,2.5,0],"texture":[4,15,4]},"cannon_base_deco2":{"section_segments":[45,135,225,315],"angle":0,"offset":{"x":5,"y":-62.4,"z":20},"position":{"x":[0.5,2,0,0.5,0.5,0.5],"y":[-7.6,4.5,8.5,14,39.5,39.5],"z":[0,0,0,0,-0.8,-0.8]},"width":[0.8,1,1,1,1,0],"height":[1,1,1,1,1,0],"texture":[63]},"cannon_front":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":20,"z":23},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-93,-96,-92,-90,-53,-50,-48,-43.5,-43.5],"z":[0,0,0,0,0,0,0,-2,-2]},"width":[0,3.5999999999999996,4.2,4.02,4.02,4.8,4.8,4.8,0],"height":[0,2.4,3,1.7999999999999998,1.7999999999999998,2.4,3,3,0],"texture":[17,13,5,1,5,17,3,4],"laser":{"damage":[80,80],"rate":1,"type":1,"speed":[240,260],"number":1,"error":0,"recoil":130}},"front_cannon_deco":{"section_segments":8,"offset":{"x":0,"y":-32.5,"z":24},"position":{"x":[-2.3,-2.3,-2.4,-2.2],"y":[0,0,38,0],"z":[0,0,0,0]},"width":[0,0.8999999999999999,0.8999999999999999,0],"height":[0,0.6,0.6,0],"texture":[7.5],"angle":187},"front_cannon_deco2":{"section_segments":8,"offset":{"x":0,"y":-32.5,"z":24},"position":{"x":[2.3,2.3,2.4,2.2],"y":[0,0,38,0],"z":[0,0,0,0]},"width":[0,0.8999999999999999,0.8999999999999999,0],"height":[0,0.6,0.6,0],"texture":[7.5],"angle":-187},"stripe1":{"section_segments":[45,135,225,315],"offset":{"x":8.5,"y":-71.5,"z":11.5},"position":{"x":[0,0,0,0,0],"y":[-5,-5,7,8,8],"z":[0,0,-6.8,-6.8,-6.8]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[11,11,17],"angle":90},"stripe2":{"section_segments":[45,135,225,315],"offset":{"x":8.25,"y":-78,"z":10.799999999999999},"position":{"x":[0,0,0,0,0],"y":[-5,-5,5.5,6.5,6.5],"z":[0,-1,-6.8999999999999995,-6.8999999999999995,-6.8999999999999995]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[11,11,17],"angle":90},"stripe3":{"section_segments":[45,135,225,315],"offset":{"x":8,"y":-84.5,"z":10.1},"position":{"x":[0,0,0,0,0],"y":[-5,-5,4,5,5],"z":[0,-2,-7,-7,-7]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[8,8,17],"angle":90},"stripe4":{"section_segments":[45,135,225,315],"offset":{"x":7.75,"y":-91,"z":9.399999999999999},"position":{"x":[0,0,0,0,0],"y":[-5,-5,2.5,3.5,3.5],"z":[0,-3,-7.3,-7.3,-7.3]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[18,18,17],"angle":90},"stripe5":{"section_segments":[45,135,225,315],"offset":{"x":7.5,"y":-97.5,"z":8.7},"position":{"x":[0,0,0,0,0],"y":[-5,-5,1,2,2],"z":[0,-4,-7.5,-7.5,-7.5]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[8,8,17],"angle":90},"stripe6":{"section_segments":[45,135,225,315],"offset":{"x":7.25,"y":-104,"z":8},"position":{"x":[0,0,0,0,0],"y":[-5,-5,-0.5,0.5,0.5],"z":[0,-5,-7.7,-7.7,-7.7]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[18,18,17],"angle":90},"stripe7":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":-110.5,"z":7.300000000000001},"position":{"x":[0,0,0,0,0],"y":[-5,-5,-2,-1,-1],"z":[0,-6,-7.9,-7.9,-7.9]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[8,8,17],"angle":90}},"wings":{"winglets":{"doubleside":true,"offset":{"x":10,"y":60,"z":5},"length":[30],"width":[50,30],"angle":[60],"position":[0,50],"texture":[3],"bump":{"position":10,"size":10}},"winglets2":{"doubleside":true,"offset":{"x":10,"y":61,"z":5},"length":[30],"width":[50,30],"angle":[60],"position":[0,50],"texture":[18],"bump":{"position":10,"size":9}},"back":{"doubleside":true,"offset":{"x":10,"y":70,"z":10},"length":[30],"width":[40,20],"angle":[3],"position":[0,60],"texture":[63],"bump":{"position":10,"size":10}},"back2":{"doubleside":true,"offset":{"x":10,"y":75,"z":10},"length":[30],"width":[40,20],"angle":[3],"position":[0,60],"texture":[7],"bump":{"position":10,"size":9}},"main":{"doubleside":true,"offset":{"x":25,"y":-70,"z":14},"length":[1,25],"width":[0,190,76],"angle":[10,20],"position":[30,70,130],"texture":[63,63],"bump":{"position":20,"size":7}},"main2":{"doubleside":true,"offset":{"x":22.8,"y":-70,"z":14},"length":[1,25],"width":[0,190,36],"angle":[10,20],"position":[30,70,130],"texture":[63,17],"bump":{"position":20,"size":7}},"main3":{"doubleside":true,"offset":{"x":25,"y":-65,"z":13},"length":[0,30],"width":[0,184,76],"angle":[10,20],"position":[30,70,130],"texture":[63,7],"bump":{"position":20,"size":6}},"top_loader":{"doubleside":true,"offset":{"x":4,"y":75,"z":15},"length":[0,6,12,0],"width":[0,50,50,30,20],"angle":[0,0,-10,-10],"position":[-20,-6,-13,-20,-20],"texture":[12,17,8.3,3.9],"bump":{"position":-45,"size":5}},"top_loader2":{"doubleside":true,"offset":{"x":4,"y":70,"z":15},"length":[0,6,12,0],"width":[0,50,50,30,20],"angle":[0,0,-10,-10],"position":[-20,-6,-13,-20,-20],"texture":[17],"bump":{"position":-45,"size":5}}},"typespec":{"name":"Pusat","level":2,"model":9,"code":209,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[240,240],"reload":[88,88]},"ship":{"mass":240,"speed":[130,130],"rotation":[75,75],"acceleration":[90,90]}},"shape":[3.432,3.133,2.734,2.754,2.173,1.715,1.474,1.348,1.261,1.212,1.183,1.181,1.207,1.251,1.326,1.438,1.569,1.706,1.894,2.168,2.568,3.014,3.358,3.911,3.187,2.605,3.187,3.911,3.358,3.014,2.568,2.168,1.894,1.706,1.569,1.438,1.326,1.251,1.207,1.181,1.183,1.212,1.261,1.348,1.474,1.715,2.173,2.754,2.734,3.133],"lasers":[{"x":0,"y":-3.276,"z":0,"angle":0,"damage":[20,20],"rate":3,"type":1,"speed":[240,240],"number":1,"spread":0,"error":0,"recoil":10},{"x":0.78,"y":-2.6,"z":0.208,"angle":0,"damage":[9,9],"rate":8,"type":2,"speed":[280,280],"number":1,"spread":0,"error":2,"recoil":4},{"x":-0.78,"y":-2.6,"z":0.208,"angle":0,"damage":[9,9],"rate":8,"type":2,"speed":[280,280],"number":1,"spread":0,"error":2,"recoil":4},{"x":0,"y":-1.976,"z":0.598,"angle":0,"damage":[80,80],"rate":1,"type":1,"speed":[240,260],"number":1,"spread":0,"error":0,"recoil":130}],"radius":3.911}}',
                            '{"name":"Trisbaena","level":2,"model":10,"size":0.7,"zoom":0.8,"specs":{"shield":{"capacity":[655,655],"reload":[9,9]},"generator":{"capacity":[250,250],"reload":[88,88]},"ship":{"mass":455,"speed":[80,80],"rotation":[50,50],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5,382.5],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-330,-330,-350,-350,-310,-310,-300,-300,-270,-266,-230,-230,-200,-200,-180,-180,-150,-150,-130,-130,-100,-100,-80,-80,-50,-50,-30,-30,0,0,40,44,230,230,270,270,370,370,350,350],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,50,50,60,60,58,58,61,61,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,80,80,70,70,50,50,45,45,0],"height":[0,50,50,60,60,58,58,61,61,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,80,80,70,70,50,50,45,45,0],"texture":[4,11,18.1,18.1,4,17,4,18.1,4,4,4,18,17,17,17,18,17,17,17,18,17,17,17,18,17,17,17,18,4,18.1,18.1,4,18.1,18.1,4,18.1,17,18,17],"propeller":true,"laser":{"damage":[50,50],"rate":1,"type":1,"speed":[280,280],"number":1,"angle":0,"error":0,"recoil":100}},"front_spike":{"section_segments":[35,55,125,145,215,235,305,325],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-340,-340,-335,-330,-330,-340,-340,-345,-330],"z":[0,0,0,0,0,0,0,0,0]},"width":[20,40,45,45,20,20,0,0,10],"height":[20,40,45,45,20,20,0,0,10],"laser":{"damage":[250,250],"rate":1,"type":1,"speed":[240,240],"number":1,"angle":0,"error":0,"recoil":600},"texture":[17,3,1,2,4,81]},"cockpit":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":50},"position":{"x":[0,0,0,0,0],"y":[60,65,100,140,165],"z":[0,0,0,0,20]},"width":[0,35,35,35,0],"height":[0,30,60,64,0],"texture":[7,7,7,4]},"cockpit_detail1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":90,"z":98},"position":{"x":[0,0,0,0],"y":[-40,10,50,50],"z":[-35,-3,0,0]},"width":[3,3,3,0],"height":[3,3,3,0],"texture":[4]},"cockpit_detail2":{"section_segments":[90,180,270,360],"offset":{"x":23,"y":90,"z":97},"position":{"x":[0,0,0,0],"y":[-40,10,50,50],"z":[-35,-3,0,0]},"width":[3,3,3,0],"height":[3,3,3,0],"texture":[4]},"cockpit_detail3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":140,"z":98},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-27,-27,-23,-23,23,23,27,27],"z":[-11,-11,0,0,0,0,-11,-11]},"width":[0,3,3,3,3,3,3,0],"height":[0,13,3,3,3,3,13,0],"texture":[4],"angle":90},"cockpit_detail4":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":100,"z":95},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-27,-27,-23,-23,23,23,27,27],"z":[-12,-12,0,0,0,0,-12,-12]},"width":[0,3,3,3,3,3,3,0],"height":[0,15,3,3,3,3,15,0],"texture":[4],"angle":90},"cockpit_back1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-10,"z":60},"position":{"x":[0,0,0,0,0],"y":[120,120,180,190,190],"z":[0,0,0,0,0,0,0]},"width":[0,60,60,60,0],"height":[0,40,40,30,0],"texture":[3,[15],[15]]},"cockpit_back2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-10,"z":40},"position":{"x":[0,0,0,0],"y":[130,130,195,195],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,70,70,0],"height":[0,60,60,0],"texture":[3,17]},"cockpit_back3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-10,"z":35},"position":{"x":[0,0,0,0],"y":[140,140,205,205],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,80,80,0],"height":[0,60,60,0],"texture":[3,18]},"back_joint1":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":15,"y":195,"z":69},"position":{"x":[0,0,0,0,0],"y":[0,0,30,60,60],"z":[0,0,0,-10,-10]},"width":[0,10,10,10,0],"height":[0,10,10,10,0],"texture":[17,17.95,17,4]},"back_joint2":{"section_segments":[90,180,270,360],"offset":{"x":37,"y":195,"z":60},"position":{"x":[0,0,0,-5,-5],"y":[0,0,30,60,60],"z":[0,0,0,-5,-5]},"width":[0,10,10,10,0],"height":[0,10,10,10,0],"texture":[17,17.95,17,4]},"back_joint3":{"section_segments":[90,180,270,360],"offset":{"x":57,"y":195,"z":40},"position":{"x":[0,0,0,-5,-5],"y":[0,0,30,60,60],"z":[0,0,0,-5,-5]},"width":[0,10,10,10,0],"height":[0,10,10,10,0],"texture":[17,17.95,17,4]},"wing_shields1":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":0,"y":95,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,30,50,50,60,60,90,105,125,125],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,100,130,130,120,123,140,140,120,115,0],"height":[0,30,30,30,25,25,25,25,25,25,0],"texture":[18,3,4,4,4,4,18.1,4,3]},"wing_shields2":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":0.01,"y":95,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[1,0,30,50,50,59,59,90,105,125,126],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,100,130,130,120,123,140,140,120,115,0],"height":[0,6,6,6,5,5,5,5,5,5,0],"texture":[63]},"wing_shields3":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":0.01,"y":95,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[1,0,30,50,50,59,59,90,105,125,126],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,100,130,130,120,123,140,140,120,115,0],"height":[0,6,6,6,5,5,5,5,5,5,0],"texture":[63]},"joint1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":150,"z":0},"position":{"x":[0,0,0,0],"y":[-5,10,30,50],"z":[0,0,0,0]},"width":[0,210,210,0],"height":[0,15,15,0],"texture":[3]},"joint2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":150,"z":5},"position":{"x":[0,0,0,0],"y":[-5,10,30,50],"z":[0,0,0,0]},"width":[0,211,211,0],"height":[0,3,3,0],"texture":[63]},"joint3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":150,"z":-5},"position":{"x":[0,0,0,0],"y":[-5,10,30,50],"z":[0,0,0,0]},"width":[0,211,211,0],"height":[0,3,3,0],"texture":[63]},"disc1":{"section_segments":12,"offset":{"x":80,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"height":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"texture":[4,4,4,4,4,4,17,4],"angle":-90},"disc2":{"section_segments":12,"offset":{"x":90,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"height":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"texture":[4,4,4,4,4,4,17,4],"angle":-90},"disc3":{"section_segments":12,"offset":{"x":100,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"height":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"texture":[4,4,4,4,4,4,17,4],"angle":-90},"disc4":{"section_segments":12,"offset":{"x":115,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[16],"angle":90},"disc5":{"section_segments":12,"offset":{"x":125,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[16],"angle":90},"disc6":{"section_segments":16,"offset":{"x":0,"y":200,"z":75},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[6,6,6,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,6,6],"texture":[4,4,4,4,4,17,4]},"disc7":{"section_segments":16,"offset":{"x":0,"y":210,"z":75},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[6,6,6,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,6,6],"texture":[4,4,4,4,4,17,4]},"disc8":{"section_segments":16,"offset":{"x":45,"y":200,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":[4,4,4,4,4,17,4]},"disc9":{"section_segments":16,"offset":{"x":45,"y":210,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":[4,4,4,4,4,17,4]},"disc10":{"section_segments":16,"offset":{"x":45,"y":90,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,24,24,24,24,24,20,20],"height":[20,20,20,24,24,24,24,24,20,20],"texture":[4,4,4,4,17,4,17,4]},"disc11":{"section_segments":16,"offset":{"x":45,"y":70,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,24,24,24,24,24,20,20],"height":[20,20,20,24,24,24,24,24,20,20],"texture":[4,4,4,4,17,4,17,4]},"disc12":{"section_segments":16,"offset":{"x":50,"y":50,"z":-160},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[16,16,16,19.200000000000003,19.200000000000003,19.200000000000003,19.200000000000003,19.200000000000003,16,16],"height":[20,20,20,24,24,24,24,24,20,20],"texture":[4,4,4,4,17,4,17,18],"angle":45,"vertical":true},"disc13":{"section_segments":24,"offset":{"x":0,"y":160,"z":80},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[4,4,4,4,4,17,4,4],"angle":180},"disc14":{"section_segments":24,"offset":{"x":0,"y":160,"z":80},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[4,4,4,4,4,17,4,4]},"disc15":{"section_segments":6,"offset":{"x":0,"y":-17.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc16":{"section_segments":6,"offset":{"x":0,"y":-12.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc17":{"section_segments":6,"offset":{"x":0,"y":-67.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc18":{"section_segments":6,"offset":{"x":0,"y":-62.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc19":{"section_segments":6,"offset":{"x":0,"y":-117.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc20":{"section_segments":6,"offset":{"x":0,"y":-112.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc21":{"section_segments":6,"offset":{"x":0,"y":-167.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc22":{"section_segments":6,"offset":{"x":0,"y":-162.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc23":{"section_segments":6,"offset":{"x":0,"y":-217.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc24":{"section_segments":6,"offset":{"x":0,"y":-212.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"box":{"section_segments":[45,135,225,315],"offset":{"x":50,"y":35,"z":-85},"position":{"x":[0,0,0,0,0],"y":[-10,15,15,19,19],"z":[0,0,0,0,0]},"width":[10,10,20,20,20],"height":[30,30,50,35,0],"texture":[4,4,18,17],"vertical":true,"angle":50},"hubs1":{"section_segments":20,"offset":{"x":80,"y":20,"z":-128},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[18,15,13,12,10,0],"height":[18,15,13,12,10,0],"texture":[18,17,17,18,18],"vertical":true},"hubs2":{"section_segments":20,"offset":{"x":80,"y":15,"z":-204},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.399999999999999,7,0],"height":[12.6,10.5,9.1,8.399999999999999,7,0],"texture":[18,17,17,18,18],"vertical":true},"hubs3":{"section_segments":20,"offset":{"x":0,"y":45,"z":-310},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[32.4,27,23.400000000000002,21.6,18,0],"height":[32.4,27,23.400000000000002,21.6,18,0],"texture":[18,17,17,18,18],"vertical":true},"hubs4":{"section_segments":20,"offset":{"x":50,"y":55,"z":-160},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[18,15,13,12,10,0],"height":[18,15,13,12,10,0],"texture":[18,17,17,18,18],"vertical":true,"angle":70},"hubs5":{"section_segments":20,"offset":{"x":35,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs6":{"section_segments":20,"offset":{"x":35,"y":-65,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs7":{"section_segments":20,"offset":{"x":35,"y":-115,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs8":{"section_segments":20,"offset":{"x":35,"y":-165,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs9":{"section_segments":20,"offset":{"x":35,"y":-215,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"propeller1":{"section_segments":10,"offset":{"x":20,"y":350,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,30,30,30,20],"z":[0,0,0,0,0,0]},"width":[0,15,15,13,13,0],"height":[0,15,15,13,13,0],"propeller":true,"texture":[3,3,16.9]},"propeller2":{"section_segments":10,"offset":{"x":20,"y":350,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,30,30,30,20],"z":[0,0,0,0,0,0]},"width":[0,15,15,13,13,0],"height":[0,10,15,13,13,0],"propeller":true,"texture":[3,3,16.9]},"propeller_joint1":{"section_segments":4,"offset":{"x":10,"y":261,"z":-5},"position":{"x":[0,0,-30,-50,-50],"y":[0,0,60,70,70],"z":[0,0,0,-20,-20]},"width":[0,10,10,13,0],"height":[0,10,10,10,0],"angle":90,"texture":[17,18,17,17]},"propeller_joint2":{"section_segments":4,"offset":{"x":30,"y":305,"z":-5},"position":{"x":[0,0,-15,-30,-30],"y":[0,0,30,40,40],"z":[0,0,0,-20,-20]},"width":[0,10,10,13,0],"height":[0,10,10,10,0],"angle":90,"texture":[17,18,17,17]},"propeller_joint3":{"section_segments":4,"offset":{"x":10,"y":280,"z":-56},"position":{"x":[0,0,0,-30,-50,-50],"y":[0,0,20,60,70,70],"z":[15,15,0,0,20,20]},"width":[0,10,10,10,13,0],"height":[0,10,10,10,10,0],"angle":90,"texture":[4,4,18]},"propeller_joint4":{"section_segments":4,"offset":{"x":10,"y":310,"z":-56},"position":{"x":[0,0,0,-20,-40,-40],"y":[0,0,20,50,50,50],"z":[15,15,0,0,20,20]},"width":[0,10,10,10,13,0],"height":[0,10,10,10,10,0],"angle":90,"texture":[4,4,18]},"propeller_side":{"section_segments":16,"offset":{"x":80,"y":290,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,14,4,0,-6,0,60,66,48,48,48,78,78,72],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,20,20,22.5,25,25,20,20,19,14,10,9,0],"height":[0,5,20,20,22.5,25,25,20,20,19,14,10,9,0],"propeller":true,"texture":[3,12,4,3,4,18,4,18,17,17,3,17]},"propeller_side2":{"section_segments":16,"offset":{"x":80,"y":380,"z":-40},"position":{"x":[0],"y":[0],"z":[0]},"width":[25],"height":[25],"propeller":true},"top":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-220,"z":52.9},"position":{"x":[0,0,0,0],"y":[-20,-20,240,180],"z":[0,0,0,0]},"width":[0,35,35,0],"height":[0,10,10,0],"texture":[4]},"bottom":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-235,"z":-52.9},"position":{"x":[0,0,0,0],"y":[0,0,240,180],"z":[0,0,0,0]},"width":[0,35,35,0],"height":[0,10,10,0],"texture":[4]},"side":{"section_segments":[45,135,225,315],"offset":{"x":52.9,"y":-235,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,240,180],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,35,35,0],"texture":[4]},"propeller_support1":{"section_segments":[45,135,225,315],"offset":{"x":15,"y":10,"z":-300},"position":{"x":[0,0,0,0],"y":[0,0,40,40],"z":[0,0,0,0]},"width":[0,25,10,0],"height":[0,100,80,0],"angle":45,"vertical":true,"texture":[17,4,17]},"propeller_support2":{"section_segments":[45,135,225,315],"offset":{"x":15,"y":-10,"z":-300},"position":{"x":[0,0,0,0],"y":[0,0,40,40],"z":[0,0,0,0]},"width":[0,25,10,0],"height":[0,100,80,0],"angle":135,"vertical":true,"texture":[17,4,17]},"gun_holder1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":10},"position":{"x":[0,0,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,20,20,0],"height":[0,80,90,0],"texture":[1]},"gun_holder2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":0},"position":{"x":[0,0,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,100,90,0],"height":[0,20,20,0],"angle":180,"texture":[1]},"gun_holder3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":-10},"position":{"x":[0,0,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,20,20,0],"height":[0,80,90,0],"texture":[1]},"bars_top1":{"section_segments":6,"offset":{"x":31,"y":-110,"z":41},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]},"bars_top2":{"section_segments":6,"offset":{"x":40,"y":-110,"z":32},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]},"bars_bottom1":{"section_segments":6,"offset":{"x":31,"y":-110,"z":-41},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]},"bars_bottom2":{"section_segments":6,"offset":{"x":40,"y":-110,"z":-32},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]}},"wings":{"main":{"length":[40,2,70,2,40],"width":[40,88,90,90,88,40],"angle":[50,90,90,130,130],"position":[0,0,0,0,0,0],"doubleside":true,"offset":{"x":120,"y":170,"z":-65},"bump":{"position":0,"size":15},"texture":[4,17,18,17,4]}},"typespec":{"name":"Trisbaena","level":2,"model":10,"code":210,"specs":{"shield":{"capacity":[655,655],"reload":[9,9]},"generator":{"capacity":[250,250],"reload":[88,88]},"ship":{"mass":455,"speed":[80,80],"rotation":[50,50],"acceleration":[120,120]}},"shape":[4.91,4.961,4.207,2.72,2.004,1.569,1.405,1.229,1.039,0.978,0.964,0.925,0.903,0.847,0.867,0.903,1.05,1.276,2.89,3.386,3.636,3.217,4.755,5.304,5.342,5.331,5.342,5.304,4.755,3.217,3.636,3.386,2.89,1.276,1.05,0.903,0.867,0.847,0.903,0.925,0.964,0.978,1.039,1.229,1.405,1.569,2.004,2.72,4.207,4.961],"lasers":[{"x":0,"y":-4.9,"z":0,"angle":0,"damage":[50,50],"rate":1,"type":1,"speed":[280,280],"number":1,"spread":0,"error":0,"recoil":100},{"x":0,"y":-4.83,"z":0,"angle":0,"damage":[250,250],"rate":1,"type":1,"speed":[240,240],"number":1,"spread":0,"error":0,"recoil":600}],"radius":5.342}}',
                        ]
                    },
                    {
                        ORIGIN: "ASC-095's Ships",
                        CODES: [
                            '{"name":"Prototype M-2","level":2,"model":1,"size":2.3,"specs":{"shield":{"capacity":[525,525],"reload":[20,20]},"generator":{"capacity":[300,300],"reload":[90,90]},"ship":{"mass":400,"speed":[115,115],"rotation":[70,70],"acceleration":[130,130]}},"bodies":{"main":{"section_segments":6,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-63,-60,-45,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,15,19,23,23,18,11,0],"height":[0,6,11,16,20,20,18,11,0],"propeller":true,"texture":[3.9,63,10,2,3,4,13,16.9]},"cannon":{"section_segments":6,"offset":{"x":20,"y":-35,"z":0},"position":{"x":[0,0,0,0,1,3,0,-2],"y":[-50,-51,-52,-50,-25,0,20,30],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,4,5,8,11,7,0],"height":[0,3,4,6,12,15,15,12],"angle":0,"laser":{"damage":[20,20],"rate":6,"type":1,"speed":[200,200],"number":1,"error":2},"propeller":false,"texture":[16.9,4,16.9,63,11,4,17]},"topCannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-50,-51,-52,-50,-22,-20,0,20,30],"z":[0,0,0,0,0,0,-3,-2,0]},"width":[0,3,4,5,6,8,8,7,0],"height":[0,3,4,5,6,8,8,10,0],"angle":0,"laser":{"damage":[90,90],"rate":4,"type":1,"speed":[140,140],"number":1},"propeller":false,"texture":[16.9,4,16.9,3,16.9,4,7]},"top":{"vertical":true,"section_segments":8,"offset":{"x":9,"y":-30,"z":-42},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-58,-60,-50,-40],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,10,0],"height":[0,6,10,0],"angle":160,"texture":[17,13]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-20,"z":21},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-10,0,20,40,60],"z":[-8,0,0,0,0,0,0]},"width":[4,6,13,14,10,5],"height":[4,5,10,13,10,5],"propeller":false,"texture":[17,7,9,9,9,7]},"circle1":{"section_segments":8,"offset":{"x":13,"y":5,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-12,-5,-12,-12,-5,-5],"z":[0,0,0,0,0,0]},"width":[10,10,10,13,13,10],"height":[10,10,10,13,13,10],"texture":[4,17,17,63,17,13],"propeller":false},"circle2":{"section_segments":8,"offset":{"x":15,"y":20,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-12,-5,-12,-12,-5,-5],"z":[0,0,0,0,0,0]},"width":[10,10,10,13,13,10],"height":[10,10,10,13,13,10],"texture":[4,17,17,4,17,13],"propeller":false},"circle3":{"section_segments":8,"offset":{"x":13,"y":35,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-12,-5,-12,-12,-5,-5],"z":[0,0,0,0,0,0]},"width":[10,10,10,13,13,10],"height":[10,10,10,13,13,10],"texture":[4,17,17,13,17,13],"propeller":false},"uwing":{"section_segments":[0,60,120,180],"offset":{"x":-20,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-65,-70,40,80,110],"z":[0,0,0,0,0,0]},"width":[0,5,25,25,0],"height":[0,10,25,25,20],"texture":[3.9]}},"wings":{"main":{"length":[25,10],"width":[100,60,40],"angle":[0,50],"position":[0,30,60],"doubleside":true,"offset":{"x":25,"y":0,"z":0},"bump":{"position":30,"size":10},"texture":[11,63]},"main2":{"length":[25],"width":[100,60],"angle":[0],"position":[0,29],"doubleside":true,"offset":{"x":25,"y":-5,"z":-3},"bump":{"position":30,"size":0},"texture":[17]},"main3":{"length":[25],"width":[100,30],"angle":[10],"position":[0,29],"doubleside":true,"offset":{"x":27,"y":20,"z":-5},"bump":{"position":30,"size":0},"texture":[13]},"top":{"length":[0,15],"width":[50,50,20],"angle":[90,90],"position":[0,0,30],"doubleside":true,"offset":{"x":0,"y":35,"z":25},"bump":{"position":30,"size":10},"texture":[11,63]}},"typespec":{"name":"Prototype M-2","level":2,"model":1,"code":201,"specs":{"shield":{"capacity":[525,525],"reload":[20,20]},"generator":{"capacity":[300,300],"reload":[90,90]},"ship":{"mass":400,"speed":[115,115],"rotation":[70,70],"acceleration":[130,130]}},"shape":[3.086,4.074,4.734,3.99,3.24,2.753,2.427,2.26,2.2,2.183,2.225,2.308,2.317,2.366,2.473,2.634,2.875,3.203,3.555,4.065,4.503,3.612,3.583,3.793,3.478,3.457,3.478,3.793,3.583,3.612,4.503,4.065,3.555,3.203,2.875,2.634,2.473,2.366,2.317,2.308,2.225,2.183,2.2,2.26,2.427,2.753,3.24,3.99,4.734,4.074],"lasers":[{"x":0.92,"y":-4.002,"z":0,"angle":0,"damage":[20,20],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":-0.92,"y":-4.002,"z":0,"angle":0,"damage":[20,20],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":0,"y":-3.082,"z":0.92,"angle":0,"damage":[90,90],"rate":4,"type":1,"speed":[140,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.734}}'
                        ]
                    }
                ]
            },
            {
                TIER: 3,
                SHIPS: [
                    {
                        ORIGIN: "MCST",
                        CODES: [
                            '{"name":"Harpy","level":3,"model":3,"size":1.7,"specs":{"shield":{"capacity":[125,180],"reload":[5,7]},"generator":{"capacity":[70,100],"reload":[22,31]},"ship":{"mass":90,"speed":[105,125],"rotation":[80,120],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":1,"y":20,"z":0},"position":{"x":[-1,-1,-1,-1,-1,5,8,8,8,8],"y":[-56,-53,-30,-20,20,30,32,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,17,25,25,15,9,9,0],"height":[0,7,12,16,15,10,9,9,0],"texture":[3,3,63,10,63,63,15,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":1,"z":8},"position":{"x":[0,0,0,0,0],"y":[-10,0,20,30,35],"z":[0,2,0,0,0]},"width":[0,10,14,10,0],"height":[0,10,12,8,0],"propeller":false,"texture":[7,9,9,7]},"cannons":{"section_segments":8,"offset":{"x":20,"y":0,"z":0},"position":{"x":[0,0,0,0,-3,-3],"y":[-50,-60,-20,0,20,25],"z":[0,0,0,0,0,0]},"width":[0,4,5,10,5,0],"height":[0,4,5,10,5,0],"angle":0,"laser":{"damage":[10,18],"rate":1.5,"type":1,"speed":[130,180],"number":1,"error":0},"propeller":false,"texture":[1,63,1,3,3,4]},"cannons2":{"section_segments":8,"offset":{"x":46,"y":20,"z":-12},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-10,0,20,22],"z":[0,0,0,0,0,0]},"width":[0,3,3,5,2,0],"height":[0,3,3,5,2,0],"angle":0,"laser":{"damage":[1,2],"rate":5,"type":1,"speed":[180,210],"number":1,"error":0},"propeller":false,"texture":[1,2,4,4,4,4]}},"wings":{"xwing1":{"doubleside":true,"offset":{"x":0,"y":22,"z":0},"length":[33,3,30],"width":[25,25,45,45],"angle":[0,0,-35],"position":[0,0,-10,-30],"texture":[8,3,11],"bump":{"position":10,"size":10}}},"typespec":{"name":"Harpy","level":3,"model":3,"code":303,"specs":{"shield":{"capacity":[125,180],"reload":[5,7]},"generator":{"capacity":[70,100],"reload":[22,31]},"ship":{"mass":90,"speed":[105,125],"rotation":[80,120],"acceleration":[70,100]}},"shape":[1.224,1.202,2.145,2.197,1.926,1.549,1.312,1.158,1.953,2.306,2.212,2.123,2.075,2.074,2.118,2.085,1.935,2.044,2.124,1.697,1.519,1.729,1.93,2.454,2.423,2.385,2.423,2.454,1.93,1.729,1.519,1.697,2.124,2.044,1.935,2.085,2.118,2.074,2.075,2.123,2.212,2.306,1.953,1.158,1.312,1.549,1.926,2.197,2.145,1.202],"lasers":[{"x":0.68,"y":-2.04,"z":0,"angle":0,"damage":[10,18],"rate":1.5,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.68,"y":-2.04,"z":0,"angle":0,"damage":[10,18],"rate":1.5,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.564,"y":-1.02,"z":-0.408,"angle":0,"damage":[1,2],"rate":5,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.564,"y":-1.02,"z":-0.408,"angle":0,"damage":[1,2],"rate":5,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.454}}',
                            '{"name":"Calypso","level":3,"model":13,"size":8,"specs":{"shield":{"capacity":[140,200],"reload":[2,4]},"generator":{"capacity":[60,100],"reload":[23,32]},"ship":{"mass":155,"speed":[90,110],"rotation":[60,80],"acceleration":[90,115]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-25,-20,-20,-10,0,10,20,15],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,4,4,0],"height":[0,4,4,5,5,5,5,0],"texture":[3,11,11,4,63,13,13,0],"propeller":true},"side_pipes":{"section_segments":8,"offset":{"x":4.4,"y":-10,"z":0},"position":{"x":[-3,-3,-0.5,0,-1,-1,0,0,0],"y":[-10,-10,-6,4,10,20,25,32,30],"z":[0,0,0,0,3,3,0,0,0]},"width":[0,2,2,2,2,2,2,2,0],"height":[0,2,2,2,2,2,2,2,0],"texture":[3,3,3,8,3,8,3,13,13],"propeller":true},"back_things":{"section_segments":8,"angle":0,"offset":{"x":10.5,"y":11,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-10,-8,-1,4,5,5],"z":[0,0,0,0,0,0]},"width":[0,3,3,3,2.5,0],"height":[0,3,3,3,2.5,0],"texture":[3,63,13,4,3,3]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-12,"z":4},"position":{"x":[0,0,0,0,0,0],"y":[-7,-4,0,0,5,7],"z":[0,-0.5,-1,-1,-0.5,0]},"width":[0,1,2,2,1,0],"height":[0,2,3,3,2,0],"texture":9},"front_gun":{"section_segments":8,"offset":{"x":0,"y":-21,"z":-4.5},"position":{"x":[0,0,0,0,0],"y":[-4,-5,2,5,5],"z":[0,0,0,2,2]},"width":[0,1,1,1,0],"height":[0,1,1,1,0],"texture":[17,4,4,4,4],"laser":{"damage":[10,15],"speed":[180,250],"rate":4,"angle":0,"type":1,"error":0,"number":1,"recoil":30}},"back_guns":{"section_segments":8,"offset":{"x":10.5,"y":4,"z":0},"position":{"x":[0,0,0,0],"y":[-5,-6,-3,-1],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[17,4,4,4],"laser":{"damage":[6,10],"speed":[80,100],"rate":4,"angle":0,"type":1,"error":0,"number":1,"recoil":30}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-21,"z":0},"length":[10],"width":[5,5],"angle":[0],"position":[24,30],"texture":4,"bump":{"position":15,"size":10}},"winglets":{"doubleside":true,"offset":{"x":2,"y":17,"z":3},"length":[3],"width":[5,4],"angle":[50],"position":[0,1],"texture":63,"bump":{"position":0,"size":20}}},"typespec":{"name":"Calypso","level":3,"model":13,"code":313,"specs":{"shield":{"capacity":[140,200],"reload":[2,4]},"generator":{"capacity":[60,100],"reload":[23,32]},"ship":{"mass":155,"speed":[90,110],"rotation":[60,80],"acceleration":[90,115]}},"shape":[4.163,3.623,3.173,2.814,2.266,1.843,1.582,1.404,1.212,1.083,0.994,1.868,1.854,1.847,2.228,2.321,2.464,2.668,2.96,3.285,3.298,3.032,3.313,3.666,3.583,3.206,3.583,3.666,3.313,3.032,3.298,3.285,2.96,2.668,2.464,2.321,2.228,1.847,1.854,1.868,0.994,1.083,1.212,1.404,1.582,1.843,2.266,2.814,3.173,3.623],"lasers":[{"x":0,"y":-4.16,"z":-0.72,"angle":0,"damage":[10,15],"rate":4,"type":1,"speed":[180,250],"number":1,"spread":0,"error":0,"recoil":30},{"x":1.68,"y":-0.32,"z":0,"angle":0,"damage":[6,10],"rate":4,"type":1,"speed":[80,100],"number":1,"spread":0,"error":0,"recoil":30},{"x":-1.68,"y":-0.32,"z":0,"angle":0,"damage":[6,10],"rate":4,"type":1,"speed":[80,100],"number":1,"spread":0,"error":0,"recoil":30}],"radius":4.163}}',
                            '{"name":"Phantom","level":3,"model":14,"size":3.05,"specs":{"shield":{"capacity":[135,195],"reload":[2,4]},"generator":{"capacity":[65,90],"reload":[23,34]},"ship":{"mass":150,"speed":[75,100],"rotation":[70,95],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-45,-35,-25,-5,15,40,55,45],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,4,7,7.5,10,20,17.5,10,0],"height":[0,3,5.8,10,10,15,15,10,0],"texture":[4,3,2,1,63,10,4,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-23,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-17,-6,4,15,40],"z":[-5.5,-2,0,0,-1.7]},"width":[3,5,5,5,3],"height":[2,5,5,5,3],"texture":[9,9,4,0],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":28,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,-2.5,-5],"y":[-45,-50,-30,-15,5,25,35,50,55],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,6,7.5,7.5,9,9,5,0],"height":[0,5,7.5,7.5,7.5,10,10,5,0],"angle":0,"laser":{"damage":[17,25],"rate":2,"type":1,"speed":[140,190],"number":1,"angle":0,"error":0,"recoil":75},"propeller":false,"texture":[6,3,2,63,10,1,3,63]},"side":{"section_segments":7,"offset":{"x":15,"y":5,"z":0},"position":{"x":[5,2.5,2.5,5,2,-7,-15,-8],"y":[-10,-5,0,15,30,40,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,20,20,10,10,10,10,0,0,0],"height":[0,4,6,8,7,8,6,0,0,0],"propeller":false,"texture":[63,4,4,3,63,4,12]}},"wings":{"winglets":{"doubleside":true,"length":[15],"width":[20,10],"angle":[20,-10],"position":[-20,-5,-55],"bump":{"position":0,"size":5},"texture":63,"offset":{"x":7.5,"y":45,"z":10}}},"typespec":{"name":"Phantom","level":3,"model":14,"code":314,"specs":{"shield":{"capacity":[135,195],"reload":[2,4]},"generator":{"capacity":[65,90],"reload":[23,34]},"ship":{"mass":150,"speed":[75,100],"rotation":[70,95],"acceleration":[90,110]}},"shape":[2.75,2.756,2.211,4.67,4.505,3.817,3.329,2.965,2.67,2.468,2.332,2.263,2.247,2.275,2.329,2.426,2.445,2.494,2.585,2.61,2.741,3.045,2.999,3.369,3.41,3.361,3.41,3.369,2.999,3.045,2.741,2.61,2.585,2.494,2.445,2.426,2.329,2.275,2.257,2.263,2.332,2.468,2.67,2.965,3.329,3.817,4.505,4.67,2.211,2.756],"lasers":[{"x":1.708,"y":-4.27,"z":0,"angle":0,"damage":[17,25],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":75},{"x":-1.708,"y":-4.27,"z":0,"angle":0,"damage":[17,25],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":75}],"radius":4.67}}',
                            '{"name":"Flounder","level":3,"model":15,"size":1.6,"specs":{"shield":{"capacity":[165,230],"reload":[3,6]},"generator":{"capacity":[70,100],"reload":[21,34]},"ship":{"mass":200,"speed":[85,100],"rotation":[50,75],"acceleration":[45,70]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-75,-75,-50,0,75,105,90],"z":[7.5,7.5,0,0,0,0,0]},"width":[0,20,30,30,35,15,0],"height":[0,0,10,25,25,15,0],"propeller":true,"texture":[63,3,2,11,13,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-25,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-12,10,40,100],"z":[0,0,5,5,13]},"width":[0,7.5,14,17,0],"height":[0,10,14,17,0],"propeller":false,"texture":[9,9,9,4]},"cannons":{"section_segments":9,"offset":{"x":20,"y":-30,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[-45,-50,-45,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,10,10,5,5],"angle":0,"laser":{"damage":[2,3],"rate":6,"type":1,"speed":[70,120],"number":1,"error":8},"propeller":false,"texture":[16.9,4,10,4,4]},"cannon":{"section_segments":9,"offset":{"x":0,"y":-35,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[-45,-50,-45,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,10,10,10,0],"angle":0,"laser":{"damage":[3,4],"rate":6,"type":1,"speed":[90,140],"number":1,"error":2.5},"propeller":false,"texture":[16.9,4,2,4,4]}},"wings":{"main":{"length":[25,20],"width":[130,120,40],"angle":[-10,-20],"position":[30,50,30],"doubleside":true,"bump":{"position":-30,"size":5},"texture":[4,63],"offset":{"x":20,"y":-35,"z":0}},"winglets":{"length":[25],"width":[30,20],"angle":[30],"position":[30,50],"doubleside":true,"bump":{"position":-30,"size":10},"texture":[63],"offset":{"x":25,"y":35,"z":10}}},"typespec":{"name":"Flounder","level":3,"model":15,"code":315,"specs":{"shield":{"capacity":[165,230],"reload":[3,6]},"generator":{"capacity":[70,100],"reload":[21,34]},"ship":{"mass":200,"speed":[85,100],"rotation":[50,75],"acceleration":[45,70]}},"shape":[2.725,2.711,2.681,2.664,2.239,2.08,2.038,2.042,2.091,2.178,2.181,2.094,2.045,2.045,2.085,2.084,2.121,2.193,2.307,2.474,2.714,3.387,3.284,3.226,3.394,3.367,3.394,3.226,3.284,3.387,2.714,2.474,2.307,2.193,2.121,2.084,2.085,2.045,2.045,2.094,2.181,2.178,2.091,2.042,2.038,2.08,2.239,2.664,2.681,2.711],"lasers":[{"x":0.64,"y":-2.56,"z":-0.16,"angle":0,"damage":[2,3],"rate":6,"type":1,"speed":[70,120],"number":1,"spread":0,"error":8,"recoil":0},{"x":-0.64,"y":-2.56,"z":-0.16,"angle":0,"damage":[2,3],"rate":6,"type":1,"speed":[70,120],"number":1,"spread":0,"error":8,"recoil":0},{"x":0,"y":-2.72,"z":-0.16,"angle":0,"damage":[3,4],"rate":6,"type":1,"speed":[90,140],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":3.394}}',
                            '{"name":"Enforcer","level":3,"model":16,"size":1.7,"specs":{"shield":{"capacity":[170,245],"reload":[4,6]},"generator":{"capacity":[55,95],"reload":[17,28]},"ship":{"mass":225,"speed":[85,100],"rotation":[60,90],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-50,-20,10,30,75,95,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,18,30,30,30,30,30,20,0],"height":[0,18,30,30,30,30,30,20,0],"texture":[4,63,10,11,1,8,63,11],"propeller":false},"cannon":{"section_segments":8,"offset":{"x":0,"y":-20,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-53,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,7,15,10,15,0],"height":[0,7,15,15,10,0],"texture":[6],"laser":{"damage":[15,30],"rate":0.75,"type":2,"speed":[130,180],"number":1,"error":0}},"side":{"section_segments":8,"offset":{"x":40,"y":-1,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,-20,-20,-20,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,5,5],"height":[0,15,10,10,10,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[1,2],"rate":4,"type":1,"speed":[130,170],"number":1,"angle":0,"error":0}},"side2":{"section_segments":8,"offset":{"x":30,"y":-1,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,-20,-20,-20,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,5,5],"height":[0,15,10,10,10,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[2,3],"rate":3,"type":1,"speed":[130,170],"number":2,"angle":0,"error":0}},"cockpit":{"section_segments":20,"offset":{"x":0,"y":-35,"z":32},"position":{"x":[0,0,0,0,0,0,0],"y":[-16,0,20,50,80],"z":[3,0,0,0,0]},"width":[0,12,15,10,5],"height":[0,10,15,8,5],"propeller":false,"texture":[9,9,9,4,4]},"partofthisship":{"section_segments":12,"offset":{"x":35,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-35,-40,-35,-20,20,40,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,14,20,25,25,25,25,15,0,5,0],"height":[0,14,20,25,25,25,25,15,0,5,0,0],"texture":[2,63,4,10,3,2,63,17,17,12],"propeller":true},"partofthisship2":{"section_segments":12,"offset":{"x":27,"y":0,"z":20},"position":{"x":[-15,-5,-5,-5,-15],"y":[-40,0,20,40,80],"z":[-5,0,0,0,-5]},"width":[10,15,15,15,10,0],"height":[10,15,15,15,10,0,0],"texture":[3,63,10,3],"propeller":false}},"wings":{"winglets":{"doubleside":true,"offset":{"x":15,"y":70,"z":25},"length":[25],"width":[40,10],"angle":[20],"position":[0,20,20],"texture":[4],"bump":{"position":0,"size":10}},"winglets2":{"doubleside":true,"offset":{"x":20,"y":-50,"z":5},"length":[25],"width":[40,10],"angle":[20],"position":[0,-20,20],"texture":[3],"bump":{"position":0,"size":10}}},"typespec":{"name":"Enforcer","level":3,"model":16,"code":316,"specs":{"shield":{"capacity":[170,245],"reload":[4,6]},"generator":{"capacity":[55,95],"reload":[17,28]},"ship":{"mass":225,"speed":[85,100],"rotation":[60,90],"acceleration":[70,100]}},"shape":[2.555,2.596,2.622,2.744,2.948,2.759,2.39,2.416,2.367,2.295,2.192,2.104,2.055,2.055,2.106,2.192,2.325,2.514,2.79,3.156,3.369,3.501,3.485,3.333,3.288,3.236,3.288,3.333,3.485,3.501,3.369,3.156,2.79,2.514,2.325,2.192,2.106,2.055,2.055,2.104,2.192,2.295,2.367,2.416,2.39,2.759,2.948,2.744,2.622,2.596],"lasers":[{"x":0,"y":-2.482,"z":0.238,"angle":0,"damage":[15,30],"rate":0.75,"type":2,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.36,"y":-1.734,"z":0,"angle":0,"damage":[1,2],"rate":4,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.36,"y":-1.734,"z":0,"angle":0,"damage":[1,2],"rate":4,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.02,"y":-1.734,"z":0,"angle":0,"damage":[2,3],"rate":3,"type":1,"speed":[130,170],"number":2,"spread":0,"error":0,"recoil":0},{"x":-1.02,"y":-1.734,"z":0,"angle":0,"damage":[2,3],"rate":3,"type":1,"speed":[130,170],"number":2,"spread":0,"error":0,"recoil":0}],"radius":3.501}}',
                            '{"name":"Xenon","level":3,"model":4,"size":2.2,"specs":{"shield":{"capacity":[145,225],"reload":[3,6]},"generator":{"capacity":[50,70],"reload":[21,33]},"ship":{"mass":150,"speed":[95,110],"rotation":[80,110],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-39,-35,-25,-10,10,30,47,55,52],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,8,11,14,17,12,5,0],"height":[0,5,8,8,10,11,11,5,0],"propeller":true,"texture":[6,3,4,63,2,4,3,17]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-5,"z":2},"position":{"x":[0,0,0,0,0,0,0],"y":[-5,0,20,30,34],"z":[7,3,0,0,0]},"width":[0,7,9,8,0],"height":[0,7,13,8,5],"propeller":false,"texture":[9,9,3,4,4]},"detail1":{"section_segments":12,"offset":{"x":7,"y":15,"z":4},"position":{"x":[0,0,0,2,2,0],"y":[-20,-20,-20,0,0,3],"z":[0,0,0,1,1,0]},"width":[0,4,4,4,4,0],"height":[0,4,4,4,4,0],"angle":0,"propeller":false,"texture":[12,8,8,13]},"detail2":{"section_segments":12,"offset":{"x":0,"y":-5,"z":4.1},"position":{"x":[0,0,0,0,0,0],"y":[-30,-30,-20,0,0,3],"z":[0,-0.1,0,2.5,3.5,0]},"width":[0,4,4,4,4,0],"height":[0,4,4,3.4,4,0],"angle":0,"propeller":false,"texture":[12,3,10.24,13]},"cannon1":{"section_segments":12,"offset":{"x":37,"y":39,"z":-1},"position":{"x":[0,0,0,0,0,0],"y":[-30,-40,-20,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,2,2,3,3,0],"height":[0,2,2,3,3,0],"angle":0,"laser":{"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"error":0},"propeller":true,"texture":[12,12,10,17]},"cannon2":{"section_segments":12,"offset":{"x":16,"y":39,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-30,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,2,3,4,4,0],"height":[0,2,3,4,4,0],"angle":0,"laser":{"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"error":0},"propeller":true,"texture":[12,12,63,17]}},"wings":{"main":{"length":[40,10],"width":[30,30,10],"angle":[10,49],"position":[60,70,90],"doubleside":true,"offset":{"x":0,"y":-47,"z":-4},"bump":{"position":10,"size":10},"texture":[8,63]}},"typespec":{"name":"Xenon","level":3,"model":4,"code":304,"specs":{"shield":{"capacity":[145,225],"reload":[3,6]},"generator":{"capacity":[50,70],"reload":[21,33]},"ship":{"mass":150,"speed":[95,110],"rotation":[80,110],"acceleration":[80,120]}},"shape":[2.376,2.261,1.785,1.365,1.11,0.939,0.824,0.823,0.928,0.904,0.861,0.831,1.717,1.729,1.809,1.945,2.142,2.427,2.772,2.924,2.018,1.928,1.896,1.804,1.772,1.763,1.772,1.804,1.896,1.928,2.018,2.924,2.772,2.427,2.142,1.945,1.809,1.729,1.717,0.831,0.861,0.904,0.928,0.823,0.824,0.939,1.11,1.365,1.785,2.261],"lasers":[{"x":1.628,"y":-0.044,"z":-0.044,"angle":0,"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.628,"y":-0.044,"z":-0.044,"angle":0,"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.704,"y":-0.484,"z":0.044,"angle":0,"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.704,"y":-0.484,"z":0.044,"angle":0,"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.924}}',
                        ]
                    },
                    {
                        ORIGIN: "Vanilla Revamp",
                        CODES: [
                            '{"name":"Y-Defender","level":3,"model": 1,"code":301,"next":[401,402],"size":1.5,"specs":{"shield":{"capacity":[175,225],"reload":[4,6]},"generator":{"capacity":[50,80],"reload":[18,26]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-100,-95,-50,-40,-20,-10,30,70,65],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,10,20,15,20,0],"height":[0,10,20,15,15,20,25,15,0],"texture":[1,2,2,63,2,10,2,12],"laser":{"damage":[20,40],"rate":2,"type":1,"speed":[140,190],"number":1,"recoil":75,"error":0}},"propulsors":{"section_segments":8,"offset":{"x":50,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-25,20,25,40,50,60,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,15,5,25,20,15,15,0],"height":[0,20,15,5,25,20,20,10,0],"texture":[63,63,63,2,2,3,4,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-70,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,10,20],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,10,15,12,0],"texture":[9],"propeller":false}},"wings":{"join":{"offset":{"x":14,"y":0,"z":0},"length":[25],"width":[20,10],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":10,"size":40}},"join2":{"offset":{"x":14,"y":50,"z":0},"length":[25],"width":[20,10],"angle":[0],"position":[0,0,0,50],"texture":[3],"bump":{"position":10,"size":40}},"winglets":{"offset":{"x":5,"y":40,"z":10},"length":[10,20],"width":[15,30,50],"angle":[60,-20],"position":[0,5,60],"texture":[63],"bump":{"position":10,"size":60}}},"typespec":{"name":"Y-Defender","level":3,"model":1,"code":301,"next":[401,402],"specs":{"shield":{"capacity":[175,225],"reload":[4,6]},"generator":{"capacity":[50,80],"reload":[18,26]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"shape":[3,2.959,2.915,2.203,1.734,0.652,0.639,1.358,1.816,2.118,2.23,2.139,2.06,2.016,2.023,2.04,2.551,2.584,2.67,3.055,3.578,3.552,3.315,3.834,2.269,2.104,2.269,3.834,3.315,3.552,3.578,3.055,2.67,2.584,2.551,2.04,2.023,2.016,2.06,2.139,2.23,2.118,1.816,1.358,0.639,0.652,1.734,2.203,2.915,2.959],"lasers":[{"x":0,"y":-3,"z":0,"angle":0,"damage":[20,40],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":75}],"radius":3.834}}',
                            '{"name":"Pulse-Fighter","level":3,"model": 2,"code":302,"next":[402,403],"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":135,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-50,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,25,30,35,20,0],"height":[0,10,15,25,25,20,0],"propeller":true,"texture":[63,1,1,10,2,12]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"cannon":{"section_segments":6,"offset":{"x":0,"y":-40,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":3},"deco":{"section_segments":8,"offset":{"x":50,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":4}},"wings":{"main":{"length":[80,20],"width":[120,50,40],"angle":[-10,20],"position":[30,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":0,"z":0}},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Pulse-Fighter","level":3,"model":2,"code":302,"next":[402,403],"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":135,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.343,2.204,1.998,1.955,2.088,1.91,1.085,0.974,0.895,0.842,0.829,0.95,1.429,2.556,2.618,2.726,2.851,2.837,2.825,2.828,2.667,2.742,2.553,2.766,2.779,2.735,2.779,2.766,2.553,2.742,2.667,2.828,2.825,2.837,2.851,2.726,2.618,2.556,1.43,0.95,0.829,0.842,0.895,0.974,1.085,1.91,2.088,1.955,1.998,2.204],"lasers":[{"x":0,"y":-2.34,"z":-0.26,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.851}}',
                            '{"name":"Side-Fighter","level":3,"model": 3,"code":303,"next":[404,405],"size":1.5,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,36]},"ship":{"mass":100,"speed":[100,130],"rotation":[50,70],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,25,30,25,17,15,0],"height":[5,10,25,30,25,17,15,0],"texture":[5,63,63,63,63,12,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,10,10],"height":[0,10,10],"texture":[9],"propeller":false,"laser":{"damage":[4,7],"rate":10,"type":1,"speed":[150,240],"number":1,"error":20}}},"wings":{"wings1":{"doubleside":true,"offset":{"x":60,"y":0,"z":-80},"length":[0,50,50,50],"width":[0,0,100,100,0],"angle":[95,90,90,95],"position":[0,0,0,0,0],"texture":[7],"bump":{"position":0,"size":8}},"join":{"offset":{"x":0,"y":0,"z":0},"length":[61],"width":[10,6],"angle":[0],"position":[0,0,0,50],"texture":[8],"bump":{"position":10,"size":20}}},"typespec":{"name":"Side-Fighter","level":3,"model":3,"code":303,"next":[404,405],"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,36]},"ship":{"mass":100,"speed":[100,130],"rotation":[50,70],"acceleration":[100,130]}},"shape":[0.902,0.912,0.888,0.892,0.731,0.749,0.779,2.343,2.255,2.136,2.061,2.022,2.038,2.04,2.022,2.061,2.136,2.255,2.343,0.836,0.924,1.106,1.282,1.262,1.222,1.202,1.222,1.262,1.282,1.106,0.924,0.836,2.343,2.255,2.136,2.061,2.022,2.038,2.04,2.022,2.061,2.136,2.255,2.343,0.779,0.749,0.731,0.892,0.888,0.912],"lasers":[{"x":0,"y":-0.9,"z":0,"angle":0,"damage":[4,7],"rate":10,"type":1,"speed":[150,240],"number":1,"spread":0,"error":20,"recoil":0}],"radius":2.343}}',
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
                            '{"name":"Rokton","level":4,"model":2,"size":1.75,"specs":{"shield":{"capacity":[170,250],"reload":[4,6]},"generator":{"capacity":[90,140],"reload":[23,38]},"ship":{"mass":215,"speed":[80,100],"rotation":[55,75],"acceleration":[60,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-85,-90,-55,-30,25,50,90,80],"z":[0,0,0,0,0,0,0,0]},"width":[0,13,21,24,28,25,18,0],"height":[0,9,14,20,22,20,17,0],"texture":[63,63,4,11,63,10,17],"propeller":true,"laser":{"damage":[30,50],"rate":1,"type":1,"speed":[170,220],"number":1,"recoil":10,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-62,"z":12},"position":{"x":[0,0,0,0,0,0,0],"y":[-18,-5,20,30,40],"z":[0,0,0,0,0]},"width":[0,8,13,10,0],"height":[0,7,14,12,0],"texture":[7,9,4,4]},"side":{"section_segments":10,"offset":{"x":42,"y":45,"z":0},"position":{"x":[-8,-8,-2,0,0,0,0],"y":[-95,-100,-50,-20,-5,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,10,18,14,19,12,0],"height":[0,10,20,19,25,14,0],"texture":[16.9,10,11,63,8,16.9],"propeller":true,"laser":{"damage":[18,25],"rate":1,"type":1,"speed":[160,200],"number":1,"recoil":50,"error":0}},"cannons":{"section_segments":8,"offset":{"x":65,"y":-5,"z":-18},"position":{"x":[0,0,0,0,0],"y":[-30,-35,8,30,40],"z":[0,0,0,0,0]},"width":[0,6,12,15,0],"height":[0,5,8,8,0],"texture":[2,2,63,63],"angle":2,"laser":{"damage":[8,12],"rate":1,"type":1,"speed":[120,150],"number":1,"recoil":0,"error":0}}},"wings":{"side":{"doubleside":true,"offset":{"x":0,"y":40,"z":1},"length":[50],"width":[70,40],"angle":[-10],"position":[-30,20],"texture":[8],"bump":{"position":-20,"size":14}},"main":{"offset":{"x":30,"y":50,"z":-10},"length":[50,20],"width":[50,40,10],"texture":[4,63],"angle":[0,10],"position":[10,-20,-50],"doubleside":true,"bump":{"position":-10,"size":10}}},"typespec":{"name":"Rokton","level":4,"model":2,"code":402,"specs":{"shield":{"capacity":[170,250],"reload":[4,6]},"generator":{"capacity":[90,140],"reload":[23,38]},"ship":{"mass":215,"speed":[80,100],"rotation":[55,75],"acceleration":[60,90]}},"shape":[3.507,3.529,3.04,2.375,2.28,2.455,2.412,2.232,2.818,2.798,2.702,2.656,3.494,3.494,3.406,3.307,3.28,3.302,3.21,3.104,3.554,3.815,3.674,3.496,2.85,2.805,2.85,3.496,3.674,3.815,3.554,3.104,3.21,3.302,3.28,3.307,3.406,3.494,3.494,2.656,2.702,2.798,2.818,2.232,2.412,2.455,2.28,2.375,3.04,3.529],"lasers":[{"x":0,"y":-3.5,"z":0,"angle":0,"damage":[30,50],"rate":1,"type":1,"speed":[170,220],"number":1,"spread":0,"error":0,"recoil":10},{"x":1.19,"y":-1.925,"z":0,"angle":0,"damage":[18,25],"rate":1,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":-1.19,"y":-1.925,"z":0,"angle":0,"damage":[18,25],"rate":1,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":2.232,"y":-1.399,"z":-0.63,"angle":2,"damage":[8,12],"rate":1,"type":1,"speed":[120,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.232,"y":-1.399,"z":-0.63,"angle":-2,"damage":[8,12],"rate":1,"type":1,"speed":[120,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.815}}',
                            '{"name":"Ateon","level":4,"model":3,"size":1.75,"specs":{"shield":{"capacity":[140,200],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[25,43]},"ship":{"mass":175,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-82.5,-75,-50,5,50,105,95,95],"z":[0,0,0,0,0,0,0,0]},"width":[5,15,25,30,40,20,15,0],"height":[0,10,15,25,25,15,10,0],"propeller":true,"texture":[9,4,63,63,18,13,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-82.5,-75,-50,-25,40,75,90],"z":[0,0,5,5,0,10,15]},"width":[5,15,22.5,25,35,20,10],"height":[0,10,15,20,25,20,0],"propeller":false,"texture":[9,9,9,10,8,63]},"central_cannon":{"section_segments":8,"offset":{"x":22.5,"y":0,"z":0},"position":{"x":[0,0,5,5,0,0,0],"y":[-55,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"error":0,"angle":3},"propeller":false,"texture":[6,4]},"wing_laser":{"section_segments":10,"offset":{"x":60,"y":-5,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,50,70,60,60],"z":[5,5,5,5,5,5,5,0,0,0,0]},"width":[0,5,10,10,5,5,5,10,6,5,0],"height":[0,5,10,10,5,5,5,10,5,4,0],"texture":[6,4,10,3,4,3,2,2,15.9,17],"propeller":true,"laser":{"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"error":0,"recoil":0}},"cockpit_ring":{"section_segments":12,"offset":{"x":0,"y":-21,"z":12.6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-5,-5,0,5,6,7,7],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,0,28,30,30,17,15,0],"height":[5,22.5,22.5,22.5,22.5,22.5,15,0],"texture":63},"cockpit_deco":{"section_segments":12,"offset":{"x":0,"y":-50,"z":31},"position":{"x":[0,0,0,0,0,0,0],"y":[-32,-32.8,-25,0,20,30,30],"z":[-20,-20.4,-13.8,-4.7,-1,-0.9,-5]},"width":[0,0.5,3,4,4,9,0],"height":[0,0,3,4,5,5,0],"texture":[9,63],"angle":0},"wingdeco1":{"section_segments":8,"offset":{"x":70,"y":30,"z":4},"position":{"x":[-2,0,1,1,-1,-4,-4.5],"y":[-40,-30,-10,0,15,25,32],"z":[-7,-5,-3,-2,0,-5,-15]},"width":[0,1,2,2,1,1,0],"height":[0,1,2,3,2,1,0],"angle":0,"texture":4},"wingdeco2":{"section_segments":8,"offset":{"x":50,"y":35,"z":8},"position":{"x":[5,2,-1,-2,-1,1,4,4.1],"y":[-45,-40,-30,-10,0,20,28,25],"z":[-10,-7,-5,-3,-2,0,-5,-19]},"width":[0,1,1,2,2,1,1,0.5],"height":[0,1,1,2,3,2,1,0],"angle":0,"texture":4},"back_spikes":{"section_segments":12,"offset":{"x":35,"y":65,"z":10},"position":{"x":[-5,-2,-2,-5,-5],"y":[-30,-23,0,25,33],"z":[0,0,0,0,0]},"width":[0,3,3,3,0],"height":[0,5,5,5,0],"texture":[6,4,4,1],"angle":0}},"wings":{"main":{"doubleside":true,"length":[80,10],"width":[80,40,30],"angle":[-10,20],"position":[30,0,40],"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":10,"y":20,"z":10}},"top":{"length":[40,10],"width":[50,20,20],"angle":[10,30],"position":[70,75,100],"doubleside":true,"texture":[3.25,63],"bump":{"position":0,"size":10},"offset":{"x":0,"y":0,"z":20}}},"typespec":{"name":"Ateon","level":4,"model":3,"code":403,"specs":{"shield":{"capacity":[140,200],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[25,43]},"ship":{"mass":175,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.898,2.888,2.688,2.228,2.039,1.888,1.728,1.612,2.446,2.498,2.465,2.427,2.484,3.214,3.386,3.642,3.917,4.243,4.324,3.235,2.867,3.946,4.201,3.664,3.735,3.682,3.735,3.664,4.201,3.946,2.867,3.235,4.324,4.243,3.917,3.642,3.386,3.214,3.107,2.427,2.465,2.498,2.446,1.612,1.728,1.888,2.039,2.228,2.688,2.888],"lasers":[{"x":0.787,"y":-1.925,"z":0,"angle":0,"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"spread":3,"error":0,"recoil":0},{"x":-0.787,"y":-1.925,"z":0,"angle":0,"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"spread":3,"error":0,"recoil":0},{"x":2.1,"y":-1.225,"z":-0.35,"angle":0,"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.1,"y":-1.225,"z":-0.35,"angle":0,"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.324}}',
                            '{"name":"Comet","level":4,"model":5,"size":1.55,"specs":{"shield":{"capacity":[140,185],"reload":[5,8]},"generator":{"capacity":[80,115],"reload":[33,45]},"ship":{"mass":120,"speed":[90,115],"rotation":[70,90],"acceleration":[100,140]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-80,-80,-75,-50,0,50,65],"z":[0,0,0,0,0,0,8.9]},"width":[0,5,12.5,20,30,25,10],"height":[0,4,10,15,15,15,0],"propeller":false,"texture":[4,4,63,4,10,18]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-45,"z":17.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-20,5,35,70,70],"z":[-5,-2.5,0,0,0,0]},"width":[5,10,15,14,10,5],"height":[0,10,15,14,10,5],"propeller":false,"texture":[7,9,3,63]},"cannon1":{"section_segments":12,"offset":{"x":60,"y":20,"z":15},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,0,20,55],"z":[0,0,0,0,0,0]},"width":[0,2.5,5,5,7.5,5],"height":[0,2.5,5,5,7.5,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"error":0},"propeller":false,"texture":[17,18,13,4,4]},"cannon2":{"section_segments":12,"offset":{"x":60,"y":20,"z":5},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,0,20,55],"z":[0,0,0,0,0,0]},"width":[0,2.5,5,5,7.5,5],"height":[0,2.5,5,5,7.5,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"error":0},"propeller":false,"texture":[17,18,13,4,4]},"deco":{"section_segments":8,"offset":{"x":70,"y":55,"z":10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,20,22],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"texture":[4,63,3,63,4]},"propulsors":{"section_segments":6,"offset":{"x":17.5,"y":20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,5,5,0,0,0]},"width":[0,10,10,20,17.5,15,15,20,15,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[18,2,3,4,63,8,4,63,16.9],"propeller":true}},"wings":{"main":{"length":[80],"width":[90,30,40],"angle":[0,0],"position":[0,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63],"offset":{"x":0,"y":0,"z":10}}},"typespec":{"name":"Comet","level":4,"model":5,"code":405,"specs":{"shield":{"capacity":[140,185],"reload":[5,8]},"generator":{"capacity":[80,115],"reload":[33,45]},"ship":{"mass":120,"speed":[90,115],"rotation":[70,90],"acceleration":[100,140]}},"shape":[2.485,2.483,2.249,1.825,1.527,1.31,1.171,1.07,1.024,2.149,2.098,2.036,2.014,2.39,2.562,2.812,3.005,3.161,3.255,3.288,3.017,2.303,2.367,2.281,2.209,2.165,2.209,2.281,2.367,2.303,3.017,3.288,3.255,3.161,3.005,2.812,2.562,2.39,2.015,2.036,2.098,2.149,1.024,1.07,1.171,1.31,1.527,1.825,2.249,2.483],"lasers":[{"x":1.86,"y":-0.93,"z":0.465,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.86,"y":-0.93,"z":0.465,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.86,"y":-0.93,"z":0.155,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.86,"y":-0.93,"z":0.155,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.288}}',
                            '{"name":"Axis","level":4,"model":6,"size":1.6,"specs":{"shield":{"capacity":[155,195],"reload":[4,7]},"generator":{"capacity":[80,125],"reload":[25,42]},"ship":{"mass":175,"speed":[60,105],"rotation":[50,75],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":11,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-50,-34,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4,14,20,24,25,25,25,20,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,63,10,3,8,4,12,17],"propeller":true,"laser":{"damage":[10,16],"rate":3,"type":1,"speed":[130,190],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-85,"z":19},"position":{"x":[0,0,0,0,0,0],"y":[25,45,60,95,105],"z":[-1,-4,-3,-6,3]},"width":[4,12,14,15,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4]},"MainGun":{"section_segments":10,"offset":{"x":0,"y":-12,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-100,-110,-45,0,30,40,70,75,80,84],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,15,15,15,10,0],"height":[0,5,5,15,15,15,15,15,10,0],"texture":[17,12,4,63,4,18,4,13,3],"laser":{"damage":[4,8],"rate":5,"type":1,"speed":[125,190],"recoil":0,"number":1,"error":0},"propeller":false},"UselessGun":{"section_segments":12,"offset":{"x":35,"y":-5,"z":0},"position":{"x":[0,0,5,5,-3,0,0,0,0,0],"y":[-40,-30,-5,35,60,65,70,75,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,5,10,10,15,10,10,5,0],"texture":[6,4,12,4,63,18,4,17],"propeller":true,"laser":{"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"recoil":0,"number":1,"error":0}}},"wings":{"main":{"length":[20,50,20],"width":[0,50,40,60],"angle":[0,-10,20],"position":[20,50,10,25],"texture":[3,8,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":-10,"z":0}},"front":{"length":[45],"width":[180,25],"angle":[-16],"position":[-30,26],"texture":[63],"doubleside":true,"bump":{"position":-50,"size":2},"offset":{"x":6,"y":0,"z":10}},"shields":{"doubleside":true,"offset":{"x":46,"y":10,"z":-11},"length":[0,10,20,10],"width":[20,20,55,55,20,20],"angle":[0,50,110,190],"position":[10,10,0,0,10],"texture":[7],"bump":{"position":0,"size":4}}},"typespec":{"name":"Axis","level":4,"model":6,"code":406,"specs":{"shield":{"capacity":[155,195],"reload":[4,7]},"generator":{"capacity":[80,125],"reload":[25,42]},"ship":{"mass":175,"speed":[60,105],"rotation":[50,75],"acceleration":[80,100]}},"shape":[3.908,3.695,2.824,2.294,1.984,1.824,1.799,1.717,1.654,1.616,2.425,2.858,2.838,2.838,2.905,3.029,3.164,2.071,2.11,2.335,2.55,2.58,2.475,2.328,2.28,2.304,2.28,2.328,2.475,2.58,2.55,2.335,2.11,2.071,3.164,3.029,2.905,2.838,2.838,2.858,2.425,1.616,1.654,1.717,1.799,1.824,1.984,2.294,2.824,3.695],"lasers":[{"x":0,"y":-3.04,"z":0.32,"angle":0,"damage":[10,16],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-3.904,"z":0,"angle":0,"damage":[4,8],"rate":5,"type":1,"speed":[125,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.12,"y":-1.44,"z":0,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.12,"y":-1.44,"z":0,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.908}}',
                            '{"name":"Starslicer","level":4,"model":7,"size":1.6,"specs":{"shield":{"capacity":[160,210],"reload":[4,6]},"generator":{"capacity":[90,165],"reload":[26,42]},"ship":{"mass":170,"speed":[90,110],"rotation":[40,90],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-97,-80,-76,-20,0,20,60,80,90,100,90],"z":[-7,-7,-4,-4,0,0,0,0,0,0,0,0]},"width":[0,10,20,20,20,15,25,25,20,20,15,0],"height":[0,7,11,11,11,10,11,14,14,14,11,0],"texture":[1,2,4,10,63,3,10,63,4,13,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-18,-5,0,10,16,18],"z":[0,0,0,0,0,0,0]},"width":[0,7,9,9,9,4,0],"height":[0,6,8,8,8,6,0],"texture":9},"guns_1":{"section_segments":8,"offset":{"x":28,"y":-30,"z":-5},"position":{"x":[0,0,0,0,0,0,0,-3,-3],"y":[-45,-40,-12,0,40,50,60,80,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,8,8,8,8,0],"height":[0,5,5,5,5,5,5,5,0],"texture":[6,63,4,12,4,4,3],"laser":{"damage":[3,5],"speed":[130,190],"rate":4,"number":1,"angle":0}},"guns_2":{"section_segments":8,"offset":{"x":50,"y":39,"z":-18},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-10,25,45,40],"z":[0,0,0,0,0,0]},"width":[0,5,7,7,6,0],"height":[0,5,7,7,6,0],"texture":[6,63,4,3,18],"angle":2,"laser":{"damage":[3,5],"speed":[130,190],"rate":4,"number":1,"angle":0}}},"wings":{"wing_1":{"length":[50,20],"width":[110,50,40],"angle":[-30,10],"position":[40,70,60],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":10,"y":-15,"z":5}}},"typespec":{"name":"Starslicer","level":4,"model":7,"code":407,"specs":{"shield":{"capacity":[160,210],"reload":[4,6]},"generator":{"capacity":[90,165],"reload":[26,42]},"ship":{"mass":170,"speed":[90,110],"rotation":[40,90],"acceleration":[100,130]}},"shape":[3.2,3.147,2.801,2.562,2.476,1.965,1.67,1.517,1.383,1.285,1.218,1.171,1.718,1.753,1.822,2.509,2.661,2.887,3.128,3.112,3.252,3.18,2.824,3.063,3.236,3.206,3.236,3.063,2.824,3.18,3.252,3.112,3.128,2.887,2.661,2.509,1.822,1.753,1.718,1.171,1.218,1.285,1.383,1.517,1.67,1.965,2.476,2.562,2.801,3.147],"lasers":[{"x":0.896,"y":-2.4,"z":-0.16,"angle":0,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.896,"y":-2.4,"z":-0.16,"angle":0,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.55,"y":-0.191,"z":-0.576,"angle":2,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.55,"y":-0.191,"z":-0.576,"angle":-2,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.252}}',
                            '{"name":"Guardian","level":4,"model":8,"size":1.85,"specs":{"shield":{"capacity":[180,250],"reload":[4,6]},"generator":{"capacity":[80,110],"reload":[24,37]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-85,-50,-40,-20,0,30,70,75],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,25,28,25,20,15,10,0],"height":[0,7,20,20,20,20,15,10,0],"texture":[6,10,3,63,12,4,8,3],"propeller":false,"laser":{"damage":[40,75],"rate":1,"type":1,"speed":[130,185],"number":1,"recoil":75,"error":0}},"ShieldSection":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-30,"z":0},"position":{"x":[0,0,10,13,13,13,-10,-10,0],"y":[-5,-5,0,30,30,50,60,100,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,20,0],"height":[0,5,5,5,5,5,5,5,0],"texture":[3,12,63,2,2,3,4,7],"propeller":false},"Engines1":{"section_segments":12,"offset":{"x":43,"y":-31,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-19,-10,-14,30,30,50,60,100,95],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,10,10,10,13,13,13,0],"height":[0,3,10,10,10,10,10,10,0],"texture":[6,18,4,3,63,2,3,17],"propeller":true,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[130,190],"number":1,"recoil":0,"error":0}},"Engines2":{"section_segments":12,"offset":{"x":15,"y":-31,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[10,0,0,20,40,50,60,100,95],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,8,8,8,8,10,10,0],"height":[0,8,8,8,8,8,10,10,0],"texture":[12,63,7,3,63,2,3,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-45,"z":11},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,-4,15,15],"z":[0,-2,0,0,8]},"width":[0,8,12,10,0],"height":[0,10,15,12,0],"texture":[9,9,4],"propeller":false}},"wings":{"join":{"offset":{"x":44,"y":30,"z":0},"length":[45,23],"width":[60,30,16],"angle":[-20,9],"position":[0,20,0,50],"texture":[8],"bump":{"position":10,"size":10}}},"typespec":{"name":"Guardian","level":4,"model":8,"code":408,"specs":{"shield":{"capacity":[180,250],"reload":[4,6]},"generator":{"capacity":[80,110],"reload":[24,37]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"shape":[3.33,3.229,2.768,2.341,2.049,2.16,2.44,2.572,2.422,2.328,2.232,2.171,2.157,2.174,4.163,4.269,4.205,4.069,4.001,3.378,3.288,3.024,2.862,2.723,2.69,2.775,2.69,2.723,2.862,3.024,3.288,3.378,4.001,4.069,4.205,4.269,4.163,2.174,2.158,2.171,2.232,2.328,2.422,2.572,2.44,2.16,2.049,2.341,2.768,3.229],"lasers":[{"x":0,"y":-3.33,"z":0,"angle":0,"damage":[40,75],"rate":1,"type":1,"speed":[130,185],"number":1,"spread":0,"error":0,"recoil":75},{"x":1.591,"y":-1.85,"z":0,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.591,"y":-1.85,"z":0,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.269}}',
                            // '{"name":"Harpoon","level":4,"model":14,"size":1.7,"specs":{"shield":{"capacity":[200,350],"reload":[5,8]},"generator":{"capacity":[85,140],"reload":[25,35]},"ship":{"mass":350,"speed":[80,95],"rotation":[35,60],"acceleration":[80,100],"dash":{"rate":4,"burst_speed":[130,190],"speed":[120,150],"acceleration":[70,70],"initial_energy":[20,45],"energy":[25,37]}}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-91.5,-90,-40,0,-40,30,90],"z":[0,0,0,0,0,0,9.5]},"width":[0,15,25,30,25,35,20],"height":[0,10,20,20,25,25,0],"propeller":false,"texture":[63,11,1,13,2,4]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":30},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,10,30,60],"z":[-15,-7.5,2.5,5,0]},"width":[7.5,10,15,10,5],"height":[0,5,7.5,5,0],"propeller":false,"texture":[3,9,13,63]},"deco":{"section_segments":8,"offset":{"x":22,"y":10,"z":10},"position":{"x":[-10,-20,5,3.75,0,-10,-5],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,5,10,10,10]},"width":[0,5,10,10,5,5,0],"height":[0,5,15,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":[4,4,10,18,4]},"propulsors":{"section_segments":12,"offset":{"x":55,"y":5,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,10,-10,25,40,50,70,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,15,20,25,25,22.5,20,15,0],"height":[0,10,15,20,15,15,15,15,0],"texture":[4,12,63,10,3,4,13,17],"propeller":true},"intake":{"section_segments":12,"offset":{"x":15,"y":5,"z":15},"position":{"x":[0,0,5,0,-2,0,0,0,0,0],"y":[-10,-30,-5,35,60,70,85,100,85],"z":[0,-6,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,15,15,20,20,15,15,5,0],"texture":[6,4,63,12,63,18,4,17],"propeller":true}},"wings":{"main":{"length":[80,20],"width":[120,50,40],"angle":[-10,-70],"position":[60,50,35],"doubleside":true,"bump":{"position":-30,"size":10},"texture":[8.225,63],"offset":{"x":0,"y":-10,"z":22.5}},"stab":{"length":[35,10],"width":[20,10,5],"angle":[-20,30],"position":[70,75,80],"doubleside":true,"texture":[63,3],"bump":{"position":0,"size":20},"offset":{"x":0,"y":-147.5,"z":15}}},"typespec":{"name":"Harpoon","level":4,"model":14,"code":414,"specs":{"shield":{"capacity":[200,350],"reload":[5,8]},"generator":{"capacity":[85,140],"reload":[25,35]},"ship":{"mass":350,"speed":[80,95],"rotation":[35,60],"acceleration":[80,100],"dash":{"rate":4,"burst_speed":[130,190],"speed":[120,150],"acceleration":[70,70],"initial_energy":[20,45],"energy":[25,37]}}},"shape":[3.111,3.102,2.909,2.862,2.829,2.636,1.396,1.261,1.174,2.054,2.06,2.106,2.574,2.933,3.004,3.13,3.298,3.398,3.52,3.882,4.291,4.228,3.945,3.629,3.634,3.74,3.634,3.629,3.945,4.228,4.291,3.882,3.52,3.398,3.298,3.13,3.004,2.933,2.574,2.106,2.06,2.054,1.174,1.261,1.396,2.636,2.829,2.862,2.909,3.102],"lasers":[{"x":0.408,"y":-1.428,"z":0.34,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.408,"y":-1.428,"z":0.34,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.291}}',
                            '{"name":"W-Defender","level":4,"model":26,"size":1.5,"specs":{"shield":{"capacity":[180,240],"reload":[4.5,7.5]},"generator":{"capacity":[120,200],"reload":[23,37]},"ship":{"mass":150,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-80,-40,0,15,60],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,25,20,25,0],"height":[0,7,10,20,25,20,0],"propeller":true,"texture":[3,12,1,10,2,12]},"back":{"section_segments":12,"offset":{"x":0,"y":25,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,20,60,50,60],"z":[0,0,0,0,0,0]},"width":[0,25,23,15,0],"height":[0,20,20,10,0],"texture":[12,4,10,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-40,"z":17},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"wing_deco":{"section_segments":8,"offset":{"x":75,"y":80,"z":0},"position":{"x":[5,0,5,5,0,0,0],"y":[-140,-40,-20,4,20,40,38],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,7,5,0],"height":[3,6,10,15,10,5,0],"angle":0,"propeller":true,"texture":[63,63,4,4,13,17]},"cannons":{"section_segments":8,"offset":{"x":77.5,"y":-80,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8,10,27,34,60,68,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,4,4,5,7],"height":[0,3,5,5,5,4,4,5,7],"texture":[6,4,63,8,63,4,63,3],"propeller":false,"angle":2,"laser":{"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"recoil":50,"number":1,"error":0}},"cannons2":{"section_segments":8,"offset":{"x":77.5,"y":-80,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8,10,27,34,60,68,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,4,4,5,7],"height":[0,3,5,5,5,4,4,5,7],"texture":[6,4,63,3,63,4,63,3],"propeller":false,"angle":2,"laser":{"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"recoil":50,"number":1,"error":0}},"front_deco":{"section_segments":6,"offset":{"x":45,"y":-33,"z":2.5},"position":{"x":[0,0,0,0,0],"y":[-30,-10,10,20,20],"z":[0,0,0,0,0]},"width":[0,5,5,2,0],"height":[0,15,15,10,0],"angle":0,"propeller":false,"texture":[2,2,2]},"engine":{"section_segments":12,"offset":{"x":0,"y":40,"z":50},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-20,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,15,15,15,10,10,15,10,0],"height":[0,5,10,15,15,15,10,10,15,10,0],"texture":[3,12,10,4,63,63,4,4,3,17],"propeller":true}},"wings":{"main":{"length":[80,20],"width":[80,40,20],"angle":[-10,-12],"position":[30,90,60],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":0,"y":0,"z":10}},"main_overlay":{"length":[80],"width":[40,20,20],"angle":[-10,-12],"position":[30,85,60],"doubleside":true,"bump":{"position":30,"size":10},"texture":[63],"offset":{"x":0,"y":10,"z":12}},"main_overlay2":{"length":[80],"width":[20,20,20],"angle":[-10,-12],"position":[30,95,60],"doubleside":true,"bump":{"position":30,"size":10},"texture":[4],"offset":{"x":0,"y":-7.5,"z":13}},"winglets":{"doubleside":true,"length":[40],"width":[40,20,30],"angle":[-20,-10],"position":[50,70,65],"bump":{"position":0,"size":10},"texture":63,"offset":{"x":10,"y":-100,"z":15}},"top_join":{"offset":{"x":0,"y":35,"z":0},"length":[0,60],"width":[0,70,30],"angle":[0,90],"position":[0,0,40,0,50],"texture":[63],"bump":{"position":10,"size":20}}},"typespec":{"name":"W-Defender","level":4,"model":26,"code":426,"specs":{"shield":{"capacity":[180,240],"reload":[4.5,7.5]},"generator":{"capacity":[120,200],"reload":[23,37]},"ship":{"mass":150,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.7,2.419,2.151,1.953,1.877,2.323,2.184,3.21,3.055,2.864,2.714,2.617,2.537,2.559,2.663,2.798,3.366,3.626,3.738,3.917,4.327,4.263,3.03,2.634,3.314,3.306,3.314,2.634,3.03,4.263,4.327,3.917,3.738,3.626,3.366,2.798,2.663,2.559,2.537,2.617,2.714,2.864,3.055,3.21,2.184,2.323,1.877,1.953,2.151,2.419],"lasers":[{"x":2.333,"y":-2.16,"z":-0.15,"angle":2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":-2.333,"y":-2.16,"z":-0.15,"angle":-2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":2.333,"y":-2.16,"z":0.15,"angle":2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":-2.333,"y":-2.16,"z":0.15,"angle":-2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.327}}',
                            '{"name":"Trauma","level":4,"model":27,"size":1.4,"specs":{"shield":{"capacity":[170,245],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[32,51]},"ship":{"mass":200,"speed":[80,100],"rotation":[70,85],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-110,-100,-50,0,30,70,100,105],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,25,25,30,30,25,0],"height":[0,15,20,20,30,30,25,0],"texture":[63,4,2,11,10,13,4],"propeller":false},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-60,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,30,60],"z":[-10,-5,-5,0,-5]},"width":[0,10,10,10,10],"height":[0,10,15,12,10],"texture":[3,4,9,2],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":70,"y":0,"z":31.2},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-20,0,20,50,60],"z":[2,2,0,0,0,-3,-3]},"width":[0,10,10,15,15,13,1],"height":[0,5,10,15,15,13,1],"angle":0,"laser":{"damage":[5,10],"rate":8,"type":2,"speed":[190,240],"recoil":0,"number":1,"error":5},"propeller":false,"texture":[13,4,10,4,3,2]},"Arm_propulsor":{"section_segments":12,"offset":{"x":70,"y":10,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-120,-100,-110,-65,-20,0,20,50,55,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,20,20,25,25,25,20,0],"height":[0,10,15,20,20,25,25,25,20,0],"angle":0,"propeller":true,"texture":[6,4,63,13,18,4,63,4,17],"laser":{"damage":[5,10],"rate":8,"type":2,"speed":[190,240],"recoil":0,"number":1,"error":5}},"bottompropulsors":{"section_segments":8,"offset":{"x":100,"y":0,"z":0},"position":{"x":[-10,-10,-5,-5,-5,-5,-5,0,0,0],"y":[-30,-25,0,10,20,25,30,40,80,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[6,4,13,18,3,63,4,8,17],"propeller":true}},"wings":{"main":{"offset":{"x":0,"y":60,"z":0},"length":[40,20],"width":[60,60,80],"texture":[4,63],"angle":[0,0],"position":[10,-50,-70],"bump":{"position":-10,"size":15}},"topjoin":{"offset":{"x":20,"y":-25,"z":-4},"doubleside":true,"length":[30,40],"width":[40,20,40],"angle":[20,0],"position":[0,-50,-20,0,0],"texture":[3,63],"bump":{"position":10,"size":30}}},"typespec":{"name":"Trauma","level":4,"model":27,"code":427,"specs":{"shield":{"capacity":[170,245],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[32,51]},"ship":{"mass":200,"speed":[80,100],"rotation":[70,85],"acceleration":[90,110]}},"shape":[3.08,2.96,2.551,1.959,3.315,3.651,3.675,3.34,3.076,2.871,2.865,2.955,3.077,3.104,3.13,3.443,3.586,3.803,3.808,2.658,2.361,1.969,2.494,2.886,2.908,2.94,2.908,2.886,2.494,1.969,2.361,2.658,3.808,3.803,3.586,3.443,3.13,3.104,3.08,2.955,2.865,2.871,3.076,3.34,3.675,3.651,3.315,1.959,2.551,2.96],"lasers":[{"x":1.96,"y":-1.96,"z":0.874,"angle":0,"damage":[5,10],"rate":8,"type":2,"speed":[190,240],"number":1,"spread":0,"error":5,"recoil":0},{"x":-1.96,"y":-1.96,"z":0.874,"angle":0,"damage":[5,10],"rate":8,"type":2,"speed":[190,240],"number":1,"spread":0,"error":5,"recoil":0},{"x":1.96,"y":-3.08,"z":0.28,"angle":0,"damage":[5,10],"rate":8,"type":2,"speed":[190,240],"number":1,"spread":0,"error":5,"recoil":0},{"x":-1.96,"y":-3.08,"z":0.28,"angle":0,"damage":[5,10],"rate":8,"type":2,"speed":[190,240],"number":1,"spread":0,"error":5,"recoil":0}],"radius":3.808}}',
                            '{"name":"Mangler","level":4,"model":28,"size":2.2,"specs":{"shield":{"capacity":[150,200],"reload":[4,6]},"generator":{"capacity":[90,130],"reload":[30,43]},"ship":{"mass":150,"speed":[75,95],"rotation":[50,80],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":7,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-30,-45,10,30,50,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,4,17,17,8,0],"height":[0,2,3,10,10,3,0],"propeller":true,"texture":[4,1,2,10,15,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-25,"z":6.5},"position":{"x":[0,0,0,0,0,0],"y":[0,15,30,40,75],"z":[0,0,0,0,-2]},"width":[2,6,8,7,0],"height":[0,6,6,6,0],"texture":[9,9,63,4],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":-16,"y":-100,"z":0},"position":{"x":[1,1,1,1,1,0,0,-2,-2,-2,-2],"y":[35,30,35,38,65,69,96,101,145,155,150],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,1.5,3,2,3,5,5,5,5,3,0],"height":[0,1.5,3,2,3,5,5,9,9,4,0],"texture":[17,4,10,13,11,63,10,18,12,17],"propeller":true,"laser":{"damage":[18,25],"rate":3,"type":2,"speed":[170,200],"number":1,"recoil":90}},"cannons2":{"section_segments":8,"offset":{"x":20,"y":-24,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-20,-45,40],"z":[-2,-2,-2,0,0,0]},"width":[0,1.8,2],"height":[0,2,3],"texture":[17,1,63,4,12],"propeller":false,"laser":{"damage":[18,25],"rate":3,"type":2,"speed":[170,200],"number":1,"recoil":90}}},"wings":{"outer":{"offset":{"x":0,"y":40,"z":-5},"length":[30,-2,5,4,10],"width":[60,30,70,130,130,30],"angle":[10,0,-10,5,5],"position":[-40,-10,-20,-55,-55,-20],"texture":[63,17,4,63,1],"doubleside":true,"bump":{"position":30,"size":15}}},"typespec":{"name":"Mangler","level":4,"model":28,"code":428,"specs":{"shield":{"capacity":[150,200],"reload":[4,6]},"generator":{"capacity":[90,130],"reload":[30,43]},"ship":{"mass":150,"speed":[75,95],"rotation":[50,80],"acceleration":[90,110]}},"shape":[1.675,3.075,3.184,3.868,3.772,3.159,2.746,2.481,2.279,2.152,2.07,2.019,2.016,2.057,2.108,2.194,2.328,2.519,2.589,2.667,2.723,2.707,2.59,2.544,2.533,2.513,2.533,2.544,2.59,2.707,2.723,2.667,2.589,2.519,2.328,2.194,2.108,2.057,2.016,2.019,2.07,2.152,2.279,2.481,2.746,3.159,3.772,3.868,3.184,3.075],"lasers":[{"x":-0.66,"y":-3.08,"z":0,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":90},{"x":0.66,"y":-3.08,"z":0,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":90},{"x":0.88,"y":-3.036,"z":0.132,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":90},{"x":-0.88,"y":-3.036,"z":0.132,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":90}],"radius":3.868}}',
                            '{"name":"H-Strafer","level":4,"model":29,"size":1.6,"specs":{"shield":{"capacity":[185,250],"reload":[3,6]},"generator":{"capacity":[65,100],"reload":[37,50]},"ship":{"mass":180,"speed":[80,105],"rotation":[50,60],"acceleration":[55,90]}},"bodies":{"main":{"section_segments":10,"offset":{"x":50,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-73,-65,-70,-40,10,30,50,110,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,5,20,25,20,25,15,0],"height":[0,3,5,15,20,20,25,10,0],"texture":[6,6,4,10,63,11,3,17],"propeller":true,"laser":{"damage":[2.5,4],"rate":6,"type":1,"speed":[100,150],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-5,"z":32.5},"position":{"x":[-50,-50,-50,-50,-50,-50,-50],"y":[-30,-17,0,15,25],"z":[0,0,0,0,0]},"width":[0,10,12,10,5],"height":[0,10,13,12,5],"texture":[9,9,4,13],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":30,"y":0,"z":18},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-20,0,20,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,3,6,10,10,5,0],"height":[0,5,5,15,15,5,0],"angle":0,"texture":[4,4,63,4,18,4],"laser":{"damage":[2.5,4],"rate":6,"type":1,"speed":[150,200],"number":1,"error":0},"propeller":false},"deco":{"section_segments":12,"offset":{"x":100,"y":30,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,10,5,0],"height":[0,5,15,15,10,5,0],"angle":0,"texture":[13,4,10,4,63,4]},"deco2":{"section_segments":12,"offset":{"x":0,"y":10,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,10,5,0],"height":[0,5,15,15,10,5,0],"angle":0,"texture":[13,4,10,4,63,4]}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-5,"z":25},"length":[60,40,20],"width":[60,60,50,30],"angle":[-10,10,0],"position":[30,0,50,20],"texture":[8,4,63],"bump":{"position":-19,"size":10}},"back":{"length":[25,15],"width":[40,30,10],"angle":[-10,20],"position":[30,55,90],"texture":[4],"doubleside":true,"offset":{"x":54,"y":45,"z":25},"bump":{"position":30,"size":10}},"font":{"doubleside":true,"length":[40,30],"width":[20,25],"angle":[0,0],"position":[20,5],"texture":[4],"bump":{"position":-20,"size":20},"offset":{"x":0,"y":80,"z":20}}},"typespec":{"name":"H-Strafer","level":4,"model":29,"code":429,"specs":{"shield":{"capacity":[185,250],"reload":[3,6]},"generator":{"capacity":[65,100],"reload":[37,50]},"ship":{"mass":180,"speed":[80,105],"rotation":[50,60],"acceleration":[55,90]}},"shape":[1.28,1.206,0.994,2.476,2.476,2.844,2.802,2.671,2.588,2.527,2.413,3.397,3.454,3.82,3.911,3.908,3.955,4.171,4.224,4.188,5.373,4.077,3.889,3.701,3.459,3.52,3.459,3.701,3.889,4.077,5.373,4.188,4.224,4.171,3.955,3.908,3.911,3.82,3.791,3.397,2.413,2.527,2.588,2.671,2.802,2.844,2.476,2.476,0.994,1.206],"lasers":[{"x":1.6,"y":-2.336,"z":0.64,"angle":0,"damage":[2.5,4],"rate":6,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.6,"y":-2.336,"z":0.64,"angle":0,"damage":[2.5,4],"rate":6,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.96,"y":-2.24,"z":0.576,"angle":0,"damage":[2.5,4],"rate":6,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.96,"y":-2.24,"z":0.576,"angle":0,"damage":[2.5,4],"rate":6,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.373}}',
                            '{"name":"Magnum","level":4,"model":30,"size":1.6,"zoom":1,"specs":{"shield":{"capacity":[190,260],"reload":[4,7]},"generator":{"capacity":[90,145],"reload":[30,42]},"ship":{"mass":210,"speed":[75,95],"rotation":[50,65],"acceleration":[120,150]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-135,-125,-130,-100,-55,5,40,55,60,58],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,13,17,30,30,30,30,17,0],"height":[0,5,5,8,15,20,22,22,22,17,0],"texture":[17,4,13,3,2,63,4,13,16,17],"propeller":true,"laser":{"damage":[25,44],"rate":1,"speed":[140,180],"number":1,"recoil":60,"type":1}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-50,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-16,30,60],"z":[-4,-4,-5,-4,0,0,0,0,0,0,0,0]},"width":[0,9,16,15],"height":[0,4,16,12],"texture":[4,9,4]},"cannons":{"section_segments":12,"offset":{"x":94,"y":-40,"z":-19},"position":{"x":[0,0,0,0,0,0,-5],"y":[-10.5,-22,-4.5,22.5,22.5,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.5,4.5,5,9,9],"height":[0,4.5,4.5,5,9,9],"texture":[17,4,3],"laser":{"damage":[25,44],"rate":1,"speed":[140,180],"number":1,"recoil":60,"type":1}},"propulsors":{"section_segments":12,"offset":{"x":70,"y":15,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-49,-47,-40,20,50,48],"z":[5,5,5,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.6,10,13,11.4,0],"height":[0,3.6,10,14,12.4,0],"texture":[7,12,8,13,17],"propeller":true},"Edge":{"section_segments":[0,50,120,180],"offset":{"x":-20,"y":-85,"z":0},"position":{"x":[10,10,4,0,0,0],"y":[-44,-25,40,180,180],"z":[0,0,0,0,0,0]},"width":[0,10,20,20,0],"height":[0,6,15,15,10],"texture":[3,2,11,15.6]}},"wings":{"main":{"doubleside":true,"offset":{"x":20,"y":25,"z":0},"length":[84,0],"width":[80,40],"angle":[-12,-12],"position":[0,-10,80],"texture":12,"bump":{"position":0,"size":4}}},"typespec":{"name":"Magnum","level":4,"model":30,"code":430,"specs":{"shield":{"capacity":[190,260],"reload":[4,7]},"generator":{"capacity":[90,145],"reload":[30,42]},"ship":{"mass":210,"speed":[75,95],"rotation":[50,65],"acceleration":[120,150]}},"shape":[3.524,4.14,3.394,2.652,2.194,1.908,1.655,1.466,3.724,3.597,3.391,3.343,3.322,3.322,3.401,3.536,3.476,3.231,3.333,3.038,2.301,2.766,3.266,3.195,2.769,2.725,2.769,3.195,3.266,2.766,2.301,3.038,3.333,3.231,3.476,3.536,3.401,3.322,3.322,3.343,3.391,3.597,3.724,1.466,1.655,1.908,2.194,2.652,3.394,4.14],"lasers":[{"x":0,"y":-3.52,"z":0,"angle":0,"damage":[25,44],"rate":1,"type":1,"speed":[140,180],"number":1,"spread":0,"error":0,"recoil":60},{"x":3.008,"y":-1.984,"z":-0.608,"angle":0,"damage":[25,44],"rate":1,"type":1,"speed":[140,180],"number":1,"spread":0,"error":0,"recoil":60},{"x":-3.008,"y":-1.984,"z":-0.608,"angle":0,"damage":[25,44],"rate":1,"type":1,"speed":[140,180],"number":1,"spread":0,"error":0,"recoil":60}],"radius":4.14}}',
                            '{"name":"Gemini","level":4,"model":31,"size":1.5,"zoom":1,"specs":{"shield":{"capacity":[180,265],"reload":[5,8]},"generator":{"capacity":[90,140],"reload":[24,37]},"ship":{"mass":235,"speed":[75,90],"rotation":[67,75],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-95,-105,-100,-80,-45,5,60,85,110,100],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,8,20,25,30,25,25,20,0],"height":[0,5,5,8,15,23,33,25,25,20,0],"texture":[17,4,15,3,63,8,4,31,12,17],"propeller":true,"laser":{"damage":[40,70],"rate":1,"speed":[125,190],"number":1,"recoil":125,"type":2}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-62,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-10,20,60],"z":[-7,-7,-7,0,0,0,0,0,0,0,0,0]},"width":[0,6,16,12],"height":[0,4,16,12],"texture":[4,9,4]},"front1":{"section_segments":12,"offset":{"x":82,"y":-20,"z":-6},"position":{"x":[0,0,0,0,0,0,-5],"y":[-30.5,-32,-4.5,-7.5,22.5,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.5,4.5,8,8,0],"height":[0,4.5,4.5,8,8,0],"texture":[17,8,3,11,10],"laser":{"damage":[9,15],"rate":2,"speed":[150,230],"number":1,"recoil":25,"type":1}},"front2":{"section_segments":10,"offset":{"x":82,"y":5,"z":-6},"position":{"x":[0,0,0,0],"y":[0,-12,22.5,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7.5,12,9],"height":[0,7,18,15],"texture":[13,12,63],"angle":0},"propulsors":{"section_segments":12,"offset":{"x":45,"y":50,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-93,-90,-60,20,50,48],"z":[5,5,5,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.6,12,15,14.4,0],"height":[0,3.6,15.6,20,14.4,0],"texture":[2,31,10.24,13,17],"propeller":true}},"wings":{"main":{"doubleside":true,"offset":{"x":20,"y":40,"z":5},"length":[89,0],"width":[130,60],"angle":[-12,-12],"position":[0,-30,50],"texture":18,"bump":{"position":20,"size":5}},"sides":{"doubleside":true,"offset":{"x":19,"y":-42,"z":6},"length":[84,-3,5,12,15],"width":[25,25,140,140,50,20],"angle":[-12,25,25,25,25],"position":[40,45,25,45,90,120],"texture":[7,12,63,4,3],"bump":{"position":35,"size":15}}},"typespec":{"name":"Gemini","level":4,"model":31,"code":431,"specs":{"shield":{"capacity":[180,265],"reload":[5,8]},"generator":{"capacity":[90,140],"reload":[24,37]},"ship":{"mass":235,"speed":[75,90],"rotation":[67,75],"acceleration":[90,120]}},"shape":[2.854,2.811,2.394,2.021,1.615,1.369,1.869,3.941,3.761,3.564,3.419,3.336,3.331,3.409,3.589,3.912,4.362,4.646,3.528,3.286,3.33,3.489,3.315,3.436,3.65,3.607,3.65,3.436,3.315,3.489,3.33,3.286,3.528,4.646,4.362,3.912,3.589,3.409,3.331,3.336,3.419,3.564,3.761,3.941,1.869,1.369,1.615,2.021,2.394,2.811],"lasers":[{"x":0,"y":-2.85,"z":0,"angle":0,"damage":[40,70],"rate":1,"type":2,"speed":[125,190],"number":1,"spread":0,"error":0,"recoil":125},{"x":2.46,"y":-1.56,"z":-0.18,"angle":0,"damage":[9,15],"rate":2,"type":1,"speed":[150,230],"number":1,"spread":0,"error":0,"recoil":25},{"x":-2.46,"y":-1.56,"z":-0.18,"angle":0,"damage":[9,15],"rate":2,"type":1,"speed":[150,230],"number":1,"spread":0,"error":0,"recoil":25}],"radius":4.646}}',
                            '{"name":"Enforcer II","level":4,"model":32,"size":1.75,"specs":{"shield":{"capacity":[190,270],"reload":[4,8]},"generator":{"capacity":[65,105],"reload":[23,36]},"ship":{"mass":250,"speed":[90,105],"rotation":[50,70],"acceleration":[50,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-50,-20,10,30,75,95,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,18,30,30,30,30,30,20,0],"height":[0,18,30,30,30,30,30,20,0],"texture":[15,4,63,11,63,10,3,11],"propeller":false,"laser":{"damage":[1.6,3],"rate":3,"type":1,"speed":[180,230],"number":2,"angle":10,"error":0}},"cannon":{"section_segments":8,"offset":{"x":0,"y":-20,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-53,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,7,15,10,15,0],"height":[0,7,15,15,10,0],"texture":[6],"laser":{"damage":[25,40],"rate":1,"type":2,"speed":[150,200],"number":1,"error":0}},"side":{"section_segments":8,"offset":{"x":35,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,-20,-20,-20,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,5,5],"height":[0,15,10,10,10,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[1.6,3],"rate":3,"type":1,"speed":[130,170],"number":1,"angle":0,"error":0}},"side2":{"section_segments":8,"offset":{"x":50,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,-20,-20,-20,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,5,5],"height":[0,15,10,10,10,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[1.6,3],"rate":3,"type":1,"speed":[130,170],"number":2,"angle":0,"error":0}},"cockpit":{"section_segments":16,"offset":{"x":0,"y":-35,"z":32},"position":{"x":[0,0,0,0,0,0,0],"y":[-19,0,30,60,100],"z":[3,0,0,0,0]},"width":[0,12,15,10,5],"height":[0,10,15,10,5],"propeller":false,"texture":[9,9,9,4,4]},"partofthisship":{"section_segments":12,"offset":{"x":43,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-28,-35,-20,10,40,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,14,20,25,25,25,25,20,0],"height":[0,14,20,25,25,25,25,20,0,0],"texture":[15,17,4,3,63,11,12,17],"propeller":true}},"wings":{"winglets":{"doubleside":true,"offset":{"x":40,"y":-20,"z":0},"length":[30,30],"width":[50,90,20],"angle":[20,-20],"position":[0,40,80],"texture":[4],"bump":{"position":10,"size":10}},"winglets2":{"doubleside":true,"offset":{"x":20,"y":-50,"z":10},"length":[20,30],"width":[40,20],"angle":[20,-20],"position":[0,-20,-80],"texture":[3],"bump":{"position":10,"size":10}},"winglets3":{"doubleside":true,"offset":{"x":0,"y":50,"z":15},"length":[50,30],"width":[50,20],"angle":[30,-20],"position":[0,40,80],"texture":[4],"bump":{"position":10,"size":10}}},"typespec":{"name":"Enforcer II","level":4,"model":32,"code":432,"specs":{"shield":{"capacity":[190,270],"reload":[4,8]},"generator":{"capacity":[65,105],"reload":[23,36]},"ship":{"mass":250,"speed":[90,105],"rotation":[50,70],"acceleration":[50,100]}},"shape":[2.63,2.672,2.7,3.058,3.112,2.53,2.475,2.679,2.71,2.632,2.557,2.608,2.712,2.873,3.091,3.423,3.846,4.169,4.16,3.602,3.845,3.73,3.814,3.398,3.385,3.331,3.385,3.398,3.814,3.73,3.845,3.602,4.16,4.169,3.846,3.423,3.091,2.873,2.712,2.608,2.557,2.632,2.71,2.679,2.475,2.53,3.112,3.058,2.7,2.672],"lasers":[{"x":0,"y":-2.625,"z":0.245,"angle":0,"damage":[1.6,3],"rate":3,"type":1,"speed":[180,230],"number":2,"spread":10,"error":0,"recoil":0},{"x":0,"y":-2.555,"z":0.245,"angle":0,"damage":[25,40],"rate":1,"type":2,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.225,"y":-1.75,"z":0,"angle":0,"damage":[1.6,3],"rate":3,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.225,"y":-1.75,"z":0,"angle":0,"damage":[1.6,3],"rate":3,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.75,"y":-1.75,"z":0,"angle":0,"damage":[1.6,3],"rate":3,"type":1,"speed":[130,170],"number":2,"spread":0,"error":0,"recoil":0},{"x":-1.75,"y":-1.75,"z":0,"angle":0,"damage":[1.6,3],"rate":3,"type":1,"speed":[130,170],"number":2,"spread":0,"error":0,"recoil":0}],"radius":4.169}}',
                        ]
                    },
                    {
                        ORIGIN: "Vanilla Revamp",
                        CODES: [
                            '{"name":"Pegasus","level":4,"model":1,"next":[501,502],"size":1.65,"specs":{"shield":{"capacity":[170,240],"reload":[4,6]},"generator":{"capacity":[90,130],"reload":[21,29]},"ship":{"mass":260,"speed":[70,90],"rotation":[40,60],"acceleration":[80,95]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-124,-129,-104,-75,-46,-20,40,83,105,95],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,24,30,26,38,38,34,18,-2],"height":[0,4,16,23,26,25,25,24,12,-8],"texture":[6,4,3,2,63,2,10,63,17],"propeller":true,"laser":{"damage":[75,120],"rate":1,"type":2,"speed":[155,200],"number":1,"error":0}},"thrusters":{"section_segments":8,"offset":{"x":56,"y":9,"z":0},"position":{"x":[-1,-1,-1,10,13,5,3,0],"y":[-80,-68,-74,-40,3,55,70,65],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,10,16,18,16,11,-4],"height":[0,4,12,17,19,17,12,-4],"texture":[6,3,3,63,4,4,17],"propeller":true,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[180,210],"number":1,"error":2}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":5,"z":18.9},"position":{"x":[0,0,0,0,0,0,0],"y":[-105,-80,-56,-25,20,55],"z":[-2,0,0,-6,-7,-10]},"width":[4,13,10,23,24,12],"height":[0,12,9,20,20,10],"texture":[9,9,3,11,4],"propeller":false}},"wings":{"wing":{"doubleside":true,"length":[44,20,25],"width":[92,70,70,30],"angle":[10,-10,-20],"position":[28,0,20,55],"offset":{"x":13,"y":-5,"z":0},"bump":{"position":30,"size":8},"texture":[11,4,63]},"winglet_top":{"doubleside":true,"length":[25,10],"width":[60,25,15],"angle":[35,0],"position":[-10,18,8],"offset":{"x":9,"y":76,"z":20},"bump":{"position":9,"size":7},"texture":[4,63]},"winglet_front":{"doubleside":true,"length":[25],"width":[70,30],"angle":[-20],"position":[0,-35],"offset":{"x":10,"y":-65,"z":0},"bump":{"position":6,"size":9},"texture":[63]}},"typespec":{"name":"Pegasus","level":4,"model":2,"code":402,"specs":{"shield":{"capacity":[170,240],"reload":[4,6]},"generator":{"capacity":[90,130],"reload":[21,29]},"ship":{"mass":260,"speed":[70,90],"rotation":[40,60],"acceleration":[80,95]}},"shape":[4.099,4.059,3.953,3.574,2.226,2.964,3.033,3.003,2.916,2.888,2.893,2.831,2.825,2.965,3.228,3.53,3.744,3.923,3.363,3.483,3.382,3.088,3.514,3.647,3.678,3.637,3.678,3.647,3.514,3.088,3.382,3.483,3.363,3.923,3.744,3.53,3.228,2.965,2.825,2.831,2.893,2.888,2.916,3.003,3.033,2.964,2.226,3.574,3.953,4.059],"lasers":[{"x":0,"y":-4.092,"z":0,"angle":0,"damage":[75,120],"rate":1,"type":2,"speed":[155,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.815,"y":-2.343,"z":0,"angle":0,"damage":[6,8],"rate":4,"type":1,"speed":[180,210],"number":1,"spread":0,"error":2,"recoil":0},{"x":-1.815,"y":-2.343,"z":0,"angle":0,"damage":[6,8],"rate":4,"type":1,"speed":[180,210],"number":1,"spread":0,"error":2,"recoil":0}],"radius":4.099,"next":[501,502]}}',
                            '{"name":"Vanguard","level":4,"model":2,"next":[502,503],"size":1.2,"specs":{"shield":{"capacity":[140,190],"reload":[3,4]},"generator":{"capacity":[80,140],"reload":[25,35]},"ship":{"mass":200,"speed":[75,90],"rotation":[80,110],"acceleration":[75,100]}},"bodies":{"main":{"section_segments":11,"offset":{"x":0,"y":-47,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6,12,48,77,110,137,141],"z":[0,0,0,0,0,0,0,0]},"width":[0,22,24,35,37,34,23,0],"height":[0,22,24,35,37,34,23,0],"texture":[9,3,2,8,3,2,3]},"engines":{"section_segments":12,"offset":{"x":28,"y":-27,"z":-10},"position":{"x":[25,-2,-4,-2,0,0],"y":[0,40,74,98,108,105],"z":[18,10,0,0,0,0]},"width":[9,10,9,14,11,0],"height":[2,10,9,14,11,0],"texture":[3,3,3,3,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-30,"z":15},"position":{"x":[0,0,0,0,0],"y":[0,40,66,84,89],"z":[-8,-2,-1,1,20]},"width":[20,30,30,23,0],"height":[20,30,30,23,0],"texture":[9],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":18,"y":-183,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[5,0,23,27,62,62,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,7,4,4,7,7],"height":[0,5,5,7,7,4,4,7,7],"texture":[12,13,4,8,4,4,3,8],"propeller":false,"laser":{"damage":[18,25],"rate":3,"type":2,"speed":[130,210],"recoil":70,"number":1,"error":0}}},"wings":{"outer":{"offset":{"x":37,"y":-115,"z":15},"length":[0,12,12,22,4,38],"width":[165,235,246,232,167,122,35],"angle":[-15,-15,-15,-8,-8,-8],"position":[20,54,54,47,79,100,101],"texture":[4,3,4,4,1,8],"doubleside":true,"bump":{"position":30,"size":4}},"inner":{"offset":{"x":-37,"y":-115,"z":15},"length":[12],"width":[165,112],"angle":[0],"position":[20,0],"texture":[63,63],"doubleside":true,"bump":{"position":30,"size":4}},"winglet":{"offset":{"x":104,"y":-13,"z":55},"length":[45,15,15,45],"width":[25,70,35,70,25],"angle":[-70,-70,-110,-110],"position":[0,0,0,0,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Vanguard","level":4,"model":1,"code":401,"specs":{"shield":{"capacity":[150,200],"reload":[4,6]},"generator":{"capacity":[95,155],"reload":[25,40]},"ship":{"mass":220,"speed":[75,90],"rotation":[80,110],"acceleration":[75,100]}},"shape":[1.128,4.427,4.643,4.646,4.01,3.568,3.144,2.81,2.808,3.088,3.087,3.077,3.045,2.998,2.935,2.552,2.417,2.317,1.954,1.88,1.891,2.158,2.148,2.228,2.236,2.256,2.236,2.228,2.148,2.158,1.891,1.88,1.954,2.317,2.417,2.552,2.935,2.998,3.045,3.077,3.087,3.088,2.808,2.81,3.144,3.568,4.01,4.646,4.643,4.427],"lasers":[{"x":0.432,"y":-4.392,"z":0.192,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[170,220],"number":1,"spread":0,"error":0,"recoil":70},{"x":-0.432,"y":-4.392,"z":0.192,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[170,220],"number":1,"spread":0,"error":0,"recoil":70}],"radius":4.646,"next":[502,503]}}',
                            '{"name":"Mercury","level":4,"model":3,"next":[504,505],"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,6]},"generator":{"capacity":[100,120],"reload":[30,55]},"ship":{"mass":260,"speed":[90,100],"rotation":[60,90],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-50,-40,-30,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,15,20,30,35,20,0],"height":[1,5,10,15,25,15,10,0],"texture":[1,4,3,63,11,10,12],"propeller":true,"laser":{"damage":[20,40],"rate":1,"type":2,"speed":[150,210],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-20,0,20,50],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":[4,9,4,4],"propeller":false},"sides":{"section_segments":8,"offset":{"x":70,"y":0,"z":-10},"position":{"x":[0,0,0,10,-5,0,0,0],"y":[-115,-80,-100,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,15,15,20,10,0],"height":[1,5,15,20,35,30,10,0],"texture":[6,6,4,63,63,4,12],"angle":0,"propeller":true},"wingends":{"section_segments":8,"offset":{"x":115,"y":25,"z":-5},"position":{"x":[0,2,4,2,0,0],"y":[-20,-10,0,10,20,15],"z":[0,0,0,0,0,0]},"width":[2,3,6,3,4,0],"height":[5,15,22,17,5,0],"texture":[4,4,4,4,6],"propeller":true,"angle":2,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"error":0}}},"wings":{"main":{"length":[80,40],"width":[40,30,20],"angle":[-10,20],"position":[30,50,30],"texture":[11,11],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}},"font":{"length":[80,30],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Mercury","level":4,"model":3,"code":403,"specs":{"shield":{"capacity":[150,200],"reload":[3,6]},"generator":{"capacity":[100,120],"reload":[30,50]},"ship":{"mass":260,"speed":[90,100],"rotation":[60,90],"acceleration":[70,90]}},"shape":[1.303,1.306,1.221,1.135,3.514,3.457,3.283,3.008,2.819,2.69,2.614,2.461,2.233,3.14,3.312,3.323,3.182,2.865,2.958,3.267,3.33,3.079,2.187,2.651,2.647,2.605,2.647,2.651,2.187,3.079,3.33,3.267,2.958,2.865,3.182,3.323,3.312,3.14,2.233,2.461,2.614,2.69,2.819,3.008,3.283,3.457,3.514,1.135,1.221,1.306],"lasers":[{"x":0,"y":-1.3,"z":0.26,"angle":0,"damage":[20,40],"rate":1,"type":2,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.972,"y":0.13,"z":-0.13,"angle":2,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.972,"y":0.13,"z":-0.13,"angle":-2,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.514,"next":[504,505]}}',
                            '{"name":"X-Warrior","level":4,"model":4,"next":[505,506],"size":1.6,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[90,150],"reload":[35,60]},"ship":{"mass":240,"speed":[75,100],"rotation":[50,90],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-100,-99,-50,0,10,30,50,80,100,90],"z":[-10,-10,-5,0,0,0,0,0,0,0,0]},"width":[0,5,30,35,25,30,50,50,20,0],"height":[0,5,20,20,20,20,20,20,10,0],"texture":[4,2,10,2,63,11,4,63,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":9,"propeller":false},"frontcannons":{"section_segments":12,"offset":{"x":30,"y":-70,"z":0},"position":{"x":[0,0,0,0,0],"y":[-30,-20,0,20,30],"z":[0,0,0,0,0]},"width":[3,5,5,5,3],"height":[3,5,15,15,3],"texture":[6,4,4,6],"angle":0,"laser":{"damage":[5,9],"rate":3,"type":1,"speed":[120,200],"number":1,"error":0}},"wingendtop":{"section_segments":12,"offset":{"x":105,"y":50,"z":40},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-70,-20,0,20,30,5],"z":[0,0,0,0,0,0,0]},"width":[0,2,3,7,7,5,0],"height":[0,2,3,7,7,5,0],"texture":[12,63,63,11,63,12],"angle":0},"wingendbottom":{"section_segments":12,"offset":{"x":105,"y":50,"z":-40},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-70,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,2,3,7,7,5,0],"height":[0,2,3,7,7,5,0],"texture":[12,63,63,11,63,12],"angle":0,"laser":{"damage":[3,6],"rate":2.5,"type":1,"speed":[100,180],"number":1,"error":0}},"propellers":{"section_segments":12,"offset":{"x":40,"y":60,"z":0},"position":{"x":[0,0,5,3,5,0,0],"y":[-35,-40,-30,0,40,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,25,30,25,5,0],"texture":4,"angle":0,"propeller":true}},"wings":{"xwing1":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[80,35],"width":[50,40,30],"angle":[20,20],"position":[0,-10,-20],"texture":[1,10],"bump":{"position":10,"size":20}},"xwing2":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[80,35],"width":[50,40,30],"angle":[-20,-20],"position":[0,-10,-20],"texture":[1,1],"bump":{"position":10,"size":20}},"winglets2":{"offset":{"x":30,"y":-40,"z":0},"length":[20,10],"width":[30,20,5],"angle":[-10,20],"position":[0,0,0],"texture":63,"bump":{"position":30,"size":10}}},"typespec":{"name":"X-Warrior","level":4,"model":4,"code":404,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[90,150],"reload":[35,55]},"ship":{"mass":245,"speed":[75,100],"rotation":[50,90],"acceleration":[90,110]}},"shape":[3.2,3.096,3.365,3.37,2.625,2.149,2.266,2.325,2.329,1.208,1.156,3.483,3.455,3.472,3.565,3.811,4.087,4.351,4.352,3.594,3.502,3.848,3.867,3.701,3.258,3.206,3.258,3.701,3.867,3.848,3.502,3.594,4.352,4.351,4.087,3.811,3.565,3.472,3.455,3.483,1.156,1.208,2.329,2.325,2.266,2.149,2.625,3.37,3.365,3.096],"lasers":[{"x":0.96,"y":-3.2,"z":0,"angle":0,"damage":[5,9],"rate":3,"type":1,"speed":[120,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.96,"y":-3.2,"z":0,"angle":0,"damage":[5,9],"rate":3,"type":1,"speed":[120,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.36,"y":-0.64,"z":-1.28,"angle":0,"damage":[3,6],"rate":2.5,"type":1,"speed":[100,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.36,"y":-0.64,"z":-1.28,"angle":0,"damage":[3,6],"rate":2.5,"type":1,"speed":[100,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.352,"next":[505,506]}}',
                            '{"name":"Side-Interceptor","level":4,"model":5,"next":[507,508],"size":1.6,"specs":{"shield":{"capacity":[175,225],"reload":[3,6]},"generator":{"capacity":[100,150],"reload":[30,40]},"ship":{"mass":140,"speed":[95,125],"rotation":[50,100],"acceleration":[110,140]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,30,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[5,10,25,30,25,10,15,0],"height":[5,10,25,30,25,10,15,0],"texture":[1,3,63,63,3,4,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,10,10],"height":[0,10,10],"texture":[5,9,5],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":60,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,5,3,0],"height":[0,3,5,5,5,3,0],"texture":[12,6,63,63,6,12],"angle":0,"laser":{"damage":[5,7],"rate":7,"type":1,"speed":[125,225],"number":1,"error":5}}},"wings":{"wings1":{"doubleside":true,"offset":{"x":60,"y":20,"z":0},"length":[-20,-10,-40],"width":[50,50,130,30],"angle":[280,315,315],"position":[0,0,-50,0],"texture":4,"bump":{"position":10,"size":-10}},"wings2":{"doubleside":true,"offset":{"x":60,"y":20,"z":0},"length":[20,10,40],"width":[50,50,130,30],"angle":[-100,-135,-135],"position":[0,0,-50,0],"texture":4,"bump":{"position":10,"size":10}},"join":{"doubleside":true,"offset":{"x":0,"y":0,"z":0},"length":[61],"width":[10,6],"angle":[0],"position":[0,0,0,50],"texture":63,"bump":{"position":10,"size":20}}},"typespec":{"name":"Side-Interceptor","level":4,"model":5,"code":405,"specs":{"shield":{"capacity":[175,225],"reload":[3,6]},"generator":{"capacity":[100,150],"reload":[30,40]},"ship":{"mass":140,"speed":[95,125],"rotation":[50,100],"acceleration":[110,140]}},"shape":[0.962,0.973,0.948,0.951,3.427,3.044,2.657,2.383,2.207,2.233,2.2,2.147,2.096,2.096,2.147,2.2,2.233,2.37,2.4,1.63,1.451,1.323,1.061,1.009,0.977,0.962,0.977,1.009,1.061,1.323,1.451,1.63,2.4,2.37,2.233,2.2,2.147,2.096,2.096,2.147,2.2,2.233,2.207,2.383,2.657,3.044,3.427,0.951,0.948,0.973],"lasers":[{"x":1.92,"y":-0.96,"z":0,"angle":0,"damage":[5,7],"rate":7,"type":1,"speed":[125,225],"number":1,"spread":0,"error":5,"recoil":0},{"x":-1.92,"y":-0.96,"z":0,"angle":0,"damage":[5,7],"rate":7,"type":1,"speed":[125,225],"number":1,"spread":0,"error":5,"recoil":0}],"radius":3.427,"next":[507,508]}}',
                            '{"name":"Pioneer","level":4,"model":6,"next":[508,509],"size":1.6,"specs":{"shield":{"capacity":[175,230],"reload":[4,7]},"generator":{"capacity":[50,100],"reload":[25,30]},"ship":{"mass":280,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-100,-60,-10,0,20,50,80,100,90],"z":[-10,-5,0,0,0,0,0,0,0,0]},"width":[5,50,50,30,40,50,50,20,0],"height":[5,20,20,20,30,30,20,10,0],"texture":[2,10,2,4,11,11,63,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":[9],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":30,"y":-70,"z":0},"position":{"x":[0,0,0,0,0],"y":[-30,-20,0,20,30],"z":[0,0,0,0,0]},"width":[3,5,5,5,3],"height":[3,5,15,15,3],"texture":[6,4,4,6],"angle":0,"laser":{"damage":[6,11],"rate":3,"type":1,"speed":[120,180],"number":1,"error":0}},"shield":{"section_segments":12,"offset":{"x":60,"y":-40,"z":0},"position":{"x":[0,5,3,5,0,0],"y":[-30,-20,0,20,30,20],"z":[0,0,0,0,0,0]},"width":[5,10,10,10,5,0],"height":[5,25,30,25,5,0],"propeller":true,"texture":4,"angle":0},"shield2":{"section_segments":12,"offset":{"x":60,"y":60,"z":0},"position":{"x":[0,5,3,5,0,0],"y":[-30,-20,0,20,30,20],"z":[0,0,0,0,0,0]},"width":[5,10,10,10,5,0],"height":[5,25,30,25,5,0],"propeller":true,"texture":4,"angle":0}},"wings":{"join":{"offset":{"x":40,"y":-40,"z":0},"length":[31],"width":[40,20],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":0,"size":10}},"join2":{"offset":{"x":40,"y":60,"z":0},"length":[31],"width":[40,20],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":0,"size":10}}},"typespec":{"name":"Pioneer","level":4,"model":6,"code":406,"specs":{"shield":{"capacity":[175,230],"reload":[4,7]},"generator":{"capacity":[50,100],"reload":[25,30]},"ship":{"mass":280,"speed":[90,120],"rotation":[45,80],"acceleration":[65,105]}},"shape":[3.204,3.168,3.365,3.37,2.625,2.907,3.057,3.073,2.942,2.664,2.548,2.441,1.29,1.032,1.136,1.287,2.732,2.911,3.245,3.523,3.553,3.411,3.132,3.263,3.258,3.206,3.258,3.263,3.132,3.411,3.553,3.523,3.245,2.911,2.732,1.287,1.136,1.032,1.29,2.441,2.548,2.664,2.942,3.073,3.057,2.907,2.625,3.37,3.365,3.168],"lasers":[{"x":0.96,"y":-3.2,"z":0,"angle":0,"damage":[6,11],"rate":3,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.96,"y":-3.2,"z":0,"angle":0,"damage":[6,11],"rate":3,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.553,"next":[508,509]}}',
                        ]
                    }
                ]
            },
            {
                TIER: 5,
                SHIPS: [
                    {
                        ORIGIN: "Vanilla Revamp",
                        CODES: [
                            '{"name":"FuryStar","level":5,"model":1,"size":1.5,"specs":{"shield":{"capacity":[225,300],"reload":[6,7]},"generator":{"capacity":[100,150],"reload":[30,40]},"ship":{"mass":200,"speed":[65,95],"rotation":[120,180],"acceleration":[150,180]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,0,10,15,35,55,40],"z":[0,0,0,0,0,0,0,0]},"width":[0,20,25,17,25,20,15,0],"height":[0,15,15,15,20,20,15,0],"texture":[1,4,63,4,2,12,17],"propeller":true},"OI1l1":{"section_segments":8,"offset":{"x":0,"y":-43,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-4,10],"z":[-5,0,0]},"width":[1,18,20],"height":[1,15,10],"texture":[9]},"missiles":{"section_segments":12,"offset":{"x":35,"y":-5,"z":10},"position":{"x":[0,0,0,0,0],"y":[-30,-23,0,23,30],"z":[0,0,0,0,0]},"width":[0,5,5,5,0],"height":[0,5,5,5,0],"texture":[6,4,4,10],"angle":0,"laser":{"damage":[1,2],"rate":4,"type":1,"speed":[100,125],"number":1,"error":0}},"cannon":{"section_segments":6,"offset":{"x":15,"y":-10,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[12,18],"rate":2,"type":1,"speed":[200,250],"number":1,"error":0},"propeller":false,"texture":[3,3,10,3]},"top_propulsors":{"section_segments":10,"offset":{"x":75,"y":45,"z":40},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"propeller":true,"texture":[4,4,2,2,5,63,5,63,17]},"bottom_propulsors":{"section_segments":10,"offset":{"x":100,"y":0,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,17]}},"wings":{"rooftop":{"doubleside":true,"offset":{"x":0,"y":-20,"z":20},"length":[20,15,25,25,5],"width":[50,40,35,35,35,30],"angle":[0,-20,30,30,30],"position":[0,10,20,50,80,100],"texture":[8,63,3,3],"bump":{"position":-40,"size":5}},"bottom":{"doubleside":true,"offset":{"x":10,"y":-20,"z":0},"length":[30,30,30],"width":[60,50,50,50],"angle":[-27,-27,-27],"position":[0,10,30,40],"texture":[1],"bump":{"position":-40,"size":5}},"topwinglets":{"doubleside":true,"offset":{"x":80,"y":87,"z":45},"length":[20],"width":[40,30],"angle":[60],"position":[0,50],"texture":[63],"bump":{"position":10,"size":10}},"bottomwinglets":{"doubleside":true,"offset":{"x":100,"y":50,"z":-45},"length":[20],"width":[40,30],"angle":[-60],"position":[0,50],"texture":[4],"bump":{"position":10,"size":10}}},"typespec":{"name":"FuryStar","level":5,"model":2,"code":502,"specs":{"shield":{"capacity":[225,300],"reload":[6,7]},"generator":{"capacity":[100,150],"reload":[32,42]},"ship":{"mass":270,"speed":[70,100],"rotation":[110,160],"acceleration":[120,150]}},"shape":[1.59,1.832,1.891,1.874,1.458,1.479,1.524,1.571,1.645,1.757,1.925,3.322,3.427,3.455,3.48,3.666,3.822,4.057,4.521,4.774,5.039,5.299,1.577,1.71,1.679,1.653,1.679,1.71,1.577,5.299,5.039,4.774,4.521,4.057,3.822,3.666,3.48,3.455,3.428,3.322,1.925,1.757,1.645,1.571,1.524,1.479,1.458,1.874,1.891,1.832],"lasers":[{"x":1.05,"y":-1.05,"z":0.3,"angle":0,"damage":[1,2],"rate":4,"type":1,"speed":[100,125],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.05,"y":-1.05,"z":0.3,"angle":0,"damage":[1,2],"rate":4,"type":1,"speed":[100,125],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.45,"y":-1.8,"z":-0.45,"angle":0,"damage":[14,20],"rate":2,"type":1,"speed":[200,250],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.45,"y":-1.8,"z":-0.45,"angle":0,"damage":[14,20],"rate":2,"type":1,"speed":[200,250],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.299,"next":[601,602]}}',
                            '{"name":"U-Sniper","level":5,"model":2,"next":[602,603],"size":1.8,"specs":{"shield":{"capacity":[250,350],"reload":[4,6]},"generator":{"capacity":[80,160],"reload":[40,60]},"ship":{"mass":220,"speed":[70,90],"rotation":[55,75],"acceleration":[70,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,40,100,90,100],"z":[0,0,0,0,0,0]},"width":[0,10,23,10,0],"height":[0,5,23,10,0],"texture":[12,1,10,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":30},"position":{"x":[0,0,0,0],"y":[20,40,80],"z":[-4,0,-6]},"width":[5,10,5],"height":[0,8,0],"texture":[9]},"uwings":{"section_segments":8,"offset":{"x":50,"y":-20,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-90,-100,40,80,90,100],"z":[0,0,0,0,0,0]},"width":[0,10,25,20,0],"height":[0,5,25,20,0],"texture":[12,2,3,4]},"cannons":{"section_segments":12,"offset":{"x":70,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-20,0,20,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,10,15,5,0],"height":[0,5,5,10,10,5,0],"angle":0,"laser":{"damage":[40,60],"rate":2,"type":2,"speed":[210,260],"recoil":220,"number":1,"error":0},"propeller":false,"texture":[4,4,10,4,63,4]},"side_propulsors":{"section_segments":10,"offset":{"x":30,"y":30,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,13,25,30,40,60,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,10,10,10,5,5,10,5,0],"height":[0,5,10,10,10,5,5,10,5,0],"propeller":true,"texture":[5,2,11,2,63,11,12]}},"typespec":{"name":"U-Sniper","level":5,"model":2,"code":502,"specs":{"shield":{"capacity":[230,310],"reload":[4,6]},"generator":{"capacity":[90,160],"reload":[40,60]},"ship":{"mass":220,"speed":[70,90],"rotation":[55,75],"acceleration":[70,120]}},"shape":[0.361,0.366,0.378,4.774,4.83,4.17,3.608,3.248,3.245,3.083,2.915,2.807,2.751,2.829,2.976,3.22,3.412,3.521,3.693,3.681,3.138,2.937,3.473,3.407,3.618,3.607,3.618,3.407,3.473,2.937,3.138,3.681,3.693,3.521,3.412,3.22,2.976,2.829,2.751,2.807,2.915,3.083,3.245,3.248,3.608,4.17,4.83,4.774,0.378,0.366],"lasers":[{"x":2.52,"y":-1.8,"z":0,"angle":0,"damage":[40,60],"rate":2,"type":2,"speed":[210,260],"number":1,"spread":0,"error":0,"recoil":220},{"x":-2.52,"y":-1.8,"z":0,"angle":0,"damage":[40,60],"rate":2,"type":2,"speed":[210,260],"number":1,"spread":0,"error":0,"recoil":220}],"radius":4.83,"next":[602,603]}}',
                            '{"name":"Khepri","level":5,"model":3,"next":[601,602],"size":1.5,"specs":{"shield":{"capacity":[175,250],"reload":[5,7]},"generator":{"capacity":[60,90],"reload":[21,43]},"ship":{"mass":240,"speed":[85,105],"rotation":[40,70],"acceleration":[130,170]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-80,-85,-60,-35,-4,38,53,86,125,120],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,9,17,22,25,27,29,25,22,0],"height":[0,7,8,13,23,26,26,24,22,17,0],"texture":[17,4,13,63,4,10,63,4,12,17],"propeller":true,"laser":{"damage":[20,30],"rate":10,"type":1,"speed":[150,200],"number":1,"error":7,"recoil":75}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":30,"z":19},"position":{"x":[0,0,0,0,0,0],"y":[-95,-63,-31,-16,-4,-5],"z":[-6,1,0,-3,-3,0]},"width":[11,14,13,10,3,0],"height":[10,12,16,17,16,0],"texture":[9,9,63,3,63],"propeller":false},"Thrusters":{"section_segments":12,"offset":{"x":27,"y":20,"z":-10},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-50,-25,-8,40,60,50],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,8,8,7,0],"height":[0,5,9,12,8,9,0],"texture":[4,63,4,18,13,12],"propeller":true,"angle":0}},"wings":{"wing0":{"doubleside":true,"length":[16,20,0,32],"width":[98,87,77,113,3],"angle":[-1,-5,-5,-6],"position":[-19,35,50,50,-10],"offset":{"x":23,"y":25,"z":3},"bump":{"position":40,"size":7},"texture":[3,4,13,63]},"wing1":{"doubleside":true,"length":[2,35],"width":[77,53,17],"angle":[10,0,11],"position":[25,25,-10],"offset":{"x":25,"y":0,"z":-8},"bump":{"position":0,"size":5},"texture":[13,13]},"winglets":{"offset":{"x":0,"y":33,"z":22},"length":[9,18],"width":[15,25,80],"angle":[0,-20],"position":[0,-5,30],"texture":[4,63],"bump":{"position":10,"size":30}},"winglets2":{"offset":{"x":0,"y":33,"z":22},"length":[9,13],"width":[15,25,120],"angle":[90,90,0],"position":[0,-5,50],"texture":[4,63],"bump":{"position":10,"size":30}}},"typespec":{"name":"Khepri","level":5,"model":3,"code":503,"specs":{"shield":{"capacity":[200,275],"reload":[4,6]},"generator":{"capacity":[100,125],"reload":[25,40]},"ship":{"mass":240,"speed":[85,105],"rotation":[85,115],"acceleration":[130,170]}},"shape":[3.457,3.461,2.734,2.099,1.652,1.541,1.408,1.316,1.204,1.127,1.94,1.918,1.874,1.828,2.767,2.771,2.83,2.933,3.106,3.347,3.702,4.214,4.323,3.167,2.901,4.259,2.901,3.167,4.323,4.214,3.702,3.347,3.106,2.933,2.83,2.771,2.767,1.828,1.874,1.918,1.94,1.127,1.204,1.316,1.408,1.541,1.652,2.099,2.734,3.461],"lasers":[{"x":0,"y":-3.45,"z":0,"angle":0,"damage":[35,45],"rate":6,"type":1,"speed":[175,225],"number":1,"spread":0,"error":3,"recoil":60}],"radius":4.323,"next":[604,605]}}',
                            '{"name":"Toscain","level":5,"model":4,"next":[604,605],"size":1.7,"zoom":1.08,"specs":{"shield":{"capacity":[275,350],"reload":[5,8]},"generator":{"capacity":[75,100],"reload":[35,53]},"ship":{"mass":280,"speed":[70,100],"rotation":[55,80],"acceleration":[85,115]}},"bodies":{"front":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-100,-95,-25,0,25],"z":[0,0,0,0,0]},"width":[0,20,40,40,20],"height":[0,10,35,20,5],"texture":[63,11,2,63],"laser":{"damage":[30,50],"rate":1,"type":2,"speed":[190,220],"number":1,"recoil":50,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0],"y":[-70,-70,-25,0,100],"z":[0,0,0,0,10]},"width":[0,10,15,15,10],"height":[0,15,35,20,0],"texture":[9,9,9,4]},"lasers":{"section_segments":8,"angle":15,"offset":{"x":1,"y":-5,"z":-3},"position":{"x":[0,0,0],"y":[-90,-70,-100],"z":[0,0,0]},"width":[5,5,0],"height":[5,5,0],"texture":[6],"laser":{"damage":[4,6],"rate":2,"type":1,"speed":[100,130],"number":2,"angle":35,"error":0}},"motor":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[10,20,30,100,95],"z":[0,0,0,0,0]},"width":[0,40,50,50,0],"height":[0,10,15,20,0],"texture":[63,63,10,4]},"propulsors":{"section_segments":8,"offset":{"x":25,"y":0,"z":0},"position":{"x":[0,0,0],"y":[30,105,100],"z":[0,0,0]},"width":[15,15,0],"height":[10,10,0],"propeller":true,"texture":[12]}},"wings":{"main":{"doubleside":true,"offset":{"x":30,"y":80,"z":0},"length":[70,20],"width":[80,20],"angle":[0,0],"position":[-20,0],"texture":[11],"bump":{"position":20,"size":10}},"winglets":{"doubleside":true,"offset":{"x":98,"y":81,"z":-20},"length":[20,50,20],"width":[20,35,20],"angle":[90,90,90],"position":[0,0,0,0],"texture":[63],"bump":{"position":30,"size":50}}},"typespec":{"name":"Toscain","level":5,"model":3,"code":503,"specs":{"shield":{"capacity":[275,350],"reload":[5,8]},"generator":{"capacity":[75,100],"reload":[35,53]},"ship":{"mass":270,"speed":[70,100],"rotation":[55,80],"acceleration":[85,115]}},"shape":[3.4,3.354,3.556,2.748,2.336,2.055,1.858,1.732,1.634,1.548,1.462,1.404,1.371,1.36,1.241,1.161,1.723,4.485,5.01,4.795,4.111,3.842,3.82,3.753,3.634,3.407,3.634,3.753,3.82,3.842,4.111,4.795,5.01,4.485,1.723,1.161,1.241,1.353,1.371,1.404,1.462,1.548,1.634,1.732,1.858,2.055,2.336,2.748,3.556,3.354],"lasers":[{"x":0,"y":-3.4,"z":0,"angle":0,"damage":[30,50],"rate":1,"type":2,"speed":[190,220],"number":1,"spread":0,"error":0,"recoil":50},{"x":-0.846,"y":-3.454,"z":-0.102,"angle":15,"damage":[4,6],"rate":2,"type":1,"speed":[100,130],"number":2,"spread":35,"error":0,"recoil":0},{"x":0.846,"y":-3.454,"z":-0.102,"angle":-15,"damage":[4,6],"rate":2,"type":1,"speed":[100,130],"number":2,"spread":35,"error":0,"recoil":0}],"radius":5.01,"next":[605,606]}}',
                            '{"name":"T-Warrior","level":5,"model":5,"next":[606,607],"size":1.6,"specs":{"shield":{"capacity":[225,325],"reload":[4,7]},"generator":{"capacity":[80,140],"reload":[35,50]},"ship":{"mass":280,"speed":[85,105],"rotation":[50,80],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-95,-100,-98,-70,0,90,91],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,20,30,20,3],"height":[0,2,4,20,30,25,3],"texture":[12,5,63,1,10,12]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-45,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[7,12],"rate":5,"type":1,"speed":[130,160],"number":5,"angle":30,"error":0},"propeller":false,"texture":[3,3,10,3]},"back":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0],"y":[90,95,95],"z":[0,0,0]},"width":[15,18,2],"height":[18,23,2],"texture":[63]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0],"y":[-50,-40,-25,0,5],"z":[0,0,0,0,9,9]},"width":[0,10,15,10,0],"height":[0,10,15,16,0],"texture":[9]},"top_propulsor":{"section_segments":10,"offset":{"x":0,"y":30,"z":60},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,20,10,0],"height":[0,15,20,20,20,15,15,20,10,0],"texture":[4,63,1,1,1,63,1,1,12],"propeller":true},"side_propulsors":{"section_segments":10,"offset":{"x":80,"y":30,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,20,10,0],"height":[0,15,20,20,20,15,15,20,10,0],"texture":[4,63,1,1,1,63,1,1,12],"propeller":true}},"wings":{"top_join":{"offset":{"x":0,"y":50,"z":0},"length":[60],"width":[70,30],"angle":[90],"position":[0,0,0,50],"texture":[11],"bump":{"position":10,"size":20}},"side_joins":{"offset":{"x":0,"y":50,"z":0},"length":[80],"width":[70,30],"angle":[-20],"position":[0,0,0,50],"texture":[11],"bump":{"position":10,"size":20}}},"typespec":{"name":"T-Warrior","level":5,"model":5,"code":505,"specs":{"shield":{"capacity":[225,325],"reload":[5,8]},"generator":{"capacity":[80,140],"reload":[35,50]},"ship":{"mass":280,"speed":[85,105],"rotation":[50,80],"acceleration":[90,120]}},"shape":[3.204,3.125,2.591,2.145,1.713,1.46,1.282,1.155,1.073,1.009,0.977,0.955,0.957,2.594,3.217,3.408,3.55,3.898,4.204,4.633,5.051,4.926,2.67,2.95,4.171,4.168,4.171,2.95,2.67,4.926,5.051,4.633,4.204,3.898,3.55,3.408,3.217,2.594,0.96,0.955,0.977,1.009,1.073,1.155,1.282,1.46,1.713,2.145,2.591,3.125],"lasers":[{"x":0,"y":-3.04,"z":-0.48,"angle":0,"damage":[7,12],"rate":5,"type":1,"speed":[130,160],"number":5,"spread":30,"error":0,"recoil":0}],"radius":5.051,"next":[606,607]}}',
                            '{"name":"Aetos","level":5,"model":6,"next":[607,608],"size":1.5,"zoom":0.96,"specs":{"shield":{"capacity":[200,300],"reload":[5,7]},"generator":{"capacity":[80,140],"reload":[45,55]},"ship":{"mass":250,"speed":[90,110],"rotation":[70,90],"acceleration":[110,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-100,-99,-98,-50,0,100,80],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,17,28,20,0],"height":[0,2,4,15,25,25,0],"texture":[4,6,10,10,11,12],"propeller":true,"laser":{"damage":[6,11],"rate":5,"type":1,"speed":[140,200],"number":1,"angle":0,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9]},"lasers":{"section_segments":8,"offset":{"x":81,"y":-15,"z":-30},"position":{"x":[0,0,0,0,0],"y":[25,70,10,80,90],"z":[0,0,0,0,0]},"width":[5,0,0,5,0],"height":[5,5,0,5,0],"texture":[63,63,6],"angle":2,"laser":{"damage":[6,11],"rate":5,"type":1,"speed":[120,180],"number":1,"angle":0,"error":0}}},"wings":{"top":{"doubleside":true,"offset":{"x":15,"y":40,"z":0},"length":[50],"width":[70,30],"angle":[70],"position":[0,30],"texture":[63],"bump":{"position":10,"size":10}},"main":{"doubleside":true,"offset":{"x":0,"y":25,"z":15},"length":[90,40],"width":[70,50,30],"angle":[-30,-40],"position":[30,20,-20],"texture":[8,63],"bump":{"position":10,"size":10}}},"typespec":{"name":"Aetos","level":5,"model":6,"code":506,"specs":{"shield":{"capacity":[200,300],"reload":[5,7]},"generator":{"capacity":[90,140],"reload":[40,50]},"ship":{"mass":250,"speed":[90,110],"rotation":[70,90],"acceleration":[110,120]}},"shape":[3,2.917,2.069,1.61,1.343,1.158,1.037,0.95,0.895,0.853,0.83,0.824,3.271,3.283,3.312,3.232,3.135,3.283,3.38,3.09,2.882,2.75,2.726,3.059,3.054,3.006,3.054,3.059,2.726,2.75,2.882,3.09,3.38,3.283,3.135,3.232,3.312,3.283,3.271,0.824,0.83,0.853,0.895,0.95,1.037,1.158,1.343,1.61,2.069,2.917],"lasers":[{"x":0,"y":-3,"z":0,"angle":0,"damage":[10,15],"rate":4,"type":1,"speed":[140,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.44,"y":-0.15,"z":-0.9,"angle":2,"damage":[3,8],"rate":7,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.44,"y":-0.15,"z":-0.9,"angle":-2,"damage":[3,8],"rate":7,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.38,"next":[607,608]}}',
                            '{"name":"Shadow X-2","level":5,"model":7,"next":[608,609],"size":1.3,"specs":{"shield":{"capacity":[170,240],"reload":[5,7]},"generator":{"capacity":[80,145],"reload":[20,34]},"ship":{"mass":200,"speed":[110,145],"rotation":[35,55],"acceleration":[90,130]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-98,-95,-70,-40,0,40,70,80,90,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,30,20,20,30,30,30,20,0],"height":[0,4,4,20,20,10,10,15,15,15,10,10],"texture":[12,5,63,4,4,3,4,4,5]},"thrusters":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,19,2],"height":[3,5,7,8,2],"texture":[63],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-25,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-25,0,5],"z":[0,0,0,0,0,0]},"width":[0,10,15,5,0],"height":[0,10,15,5,0],"texture":[9]},"laser":{"section_segments":10,"offset":{"x":50,"y":10,"z":-13},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,3,2],"propeller":true,"laser":{"damage":[5,7],"rate":10,"type":1,"speed":[160,190],"number":1}}},"wings":{"top":{"doubleside":true,"offset":{"x":10,"y":60,"z":5},"length":[30],"width":[50,30],"angle":[60],"position":[0,50],"texture":[3],"bump":{"position":10,"size":10}},"side":{"doubleside":true,"offset":{"x":10,"y":70,"z":5},"length":[30],"width":[40,20],"angle":[-13],"position":[0,60],"texture":[63],"bump":{"position":10,"size":10}},"wings":{"offset":{"x":0,"y":35,"z":0},"length":[80],"width":[100,70],"angle":[0],"position":[-80,50],"texture":[4],"bump":{"position":10,"size":15}}},"typespec":{"name":"Shadow X-2","level":5,"model":7,"code":507,"specs":{"shield":{"capacity":[170,240],"reload":[7,9]},"generator":{"capacity":[80,145],"reload":[20,34]},"ship":{"mass":200,"speed":[110,145],"rotation":[35,55],"acceleration":[90,130]}},"shape":[2.6,2.53,2.111,1.751,1.503,1.341,1.272,1.223,1.201,1.404,1.587,1.596,1.62,1.674,1.725,1.848,2.231,2.565,2.842,3.253,3.735,2.463,3.297,3.78,3.139,2.735,3.139,3.78,3.297,2.463,3.735,3.253,2.842,2.565,2.231,1.848,1.725,1.674,1.621,1.596,1.587,1.404,1.201,1.223,1.272,1.341,1.503,1.751,2.111,2.53],"lasers":[{"x":1.3,"y":-0.52,"z":-0.338,"angle":0,"damage":[6,9],"rate":10,"type":1,"speed":[160,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-0.52,"z":-0.338,"angle":0,"damage":[6,9],"rate":10,"type":1,"speed":[160,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.78,"next":[608,609]}}',
                            '{"name":"Howler","level":5,"model":8,"next":[610,611],"size":1.4,"specs":{"shield":{"capacity":[275,340],"reload":[5,7]},"generator":{"capacity":[80,110],"reload":[32,50]},"ship":{"mass":320,"speed":[80,105],"rotation":[70,95],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-145,-135,-125,-130,-100,-55,5,60,85,120,118],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,8,20,30,35,35,30,22,0],"height":[0,5,5,8,15,20,33,30,30,22,0],"texture":[17,4,13,3,2,1,10,31,12,17],"propeller":true,"laser":{"damage":[2,4],"rate":6,"speed":[160,210],"number":2,"recoil":0,"type":1}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-80,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-16,30,60],"z":[-4,-4,1,0,0,0,0,0,0,0,0,0]},"width":[0,6,16,12],"height":[0,4,16,12],"texture":[2,9,31]},"front1":{"section_segments":8,"offset":{"x":22,"y":-125,"z":0},"position":{"x":[0,0,0,0,0,0,-5],"y":[-22.5,-12,-4.5,-7.5,22.5,60],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.5,4.5,6,12,9],"height":[0,4.5,4.5,6,12,9],"texture":[17,4,3],"laser":{"damage":[11,16],"rate":1,"speed":[150,200],"number":1,"recoil":25,"type":2}},"front2":{"section_segments":10,"offset":{"x":32,"y":-95,"z":0},"position":{"x":[-4,-4,0,-1],"y":[0,-12,22.5,60],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7.5,12,9],"height":[0,12,18,15],"texture":[13,2,63],"angle":0},"propulsors":{"section_segments":8,"offset":{"x":40,"y":30,"z":-5},"position":{"x":[-12,-12,-2,0,0,0,0,0,0,0,0,0,0],"y":[-90,-100,-60,20,50,48],"z":[5,5,5,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.6,12,24,14.4,0],"height":[0,3.6,15.6,24,14.4,0],"texture":[4,31,10,13,17],"propeller":true},"uwing":{"section_segments":[0,60,120,180],"offset":{"x":-20,"y":-30,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-65,-70,40,80,110],"z":[0,0,0,0,0,0]},"width":[0,5,25,25,0],"height":[0,10,25,25,20],"texture":[4]}},"wings":{"main":{"doubleside":true,"offset":{"x":20,"y":-20,"z":5},"length":[89,0],"width":[130,60],"angle":[-12,-12],"position":[0,80,80],"texture":18,"bump":{"position":20,"size":5}},"sides":{"doubleside":true,"offset":{"x":20,"y":-20,"z":10},"length":[84,-3,5,12,-5],"width":[25,25,140,140,50,50],"angle":[-12,5,5,5,5],"position":[40,85,55,55,70,70],"texture":[63,4,63,4,17],"bump":{"position":35,"size":15}}},"typespec":{"name":"Howler","level":5,"model":8,"code":508,"specs":{"shield":{"capacity":[275,340],"reload":[5,7]},"generator":{"capacity":[80,110],"reload":[32,50]},"ship":{"mass":320,"speed":[80,105],"rotation":[70,95],"acceleration":[80,110]}},"shape":[4.62,4.176,3.92,3.153,2.641,2.233,1.931,1.892,1.901,1.948,3.077,3.059,3.111,3.216,3.358,3.503,3.728,3.918,4.079,4.141,2.709,2.652,2.475,2.867,2.85,2.805,2.85,2.867,2.475,2.652,2.709,4.141,4.079,3.918,3.728,3.503,3.358,3.216,3.111,3.059,3.077,1.948,1.901,1.892,1.931,2.233,2.641,3.153,3.92,4.176],"lasers":[{"x":0,"y":-4.62,"z":0,"angle":0,"damage":[2,4],"rate":6,"type":1,"speed":[163,213],"number":2,"spread":0,"error":0,"recoil":0},{"x":0.616,"y":-4.13,"z":0,"angle":0,"damage":[11,16],"rate":1,"type":2,"speed":[153,203],"number":1,"spread":0,"error":0,"recoil":25},{"x":-0.616,"y":-4.13,"z":0,"angle":0,"damage":[11,16],"rate":1,"type":2,"speed":[153,203],"number":1,"spread":0,"error":0,"recoil":25}],"radius":4.62,"next":[610,611]}}',
                            '{"name":"Bat-Defender","level":5,"model":9,"next":[611,612],"size":1.8,"specs":{"shield":{"capacity":[350,450],"reload":[9,12]},"generator":{"capacity":[80,130],"reload":[30,45]},"ship":{"mass":380,"speed":[65,80],"rotation":[55,75],"acceleration":[80,105]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-99,-100,-97,-45,-40,-25,-23,15,20,55,50],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,30,17,27,25,25,27,15,5],"height":[0,2,2,25,27,27,25,25,27,20,0],"texture":[6,5,1,4,6,4,63,6,2,12]},"propulsors":{"section_segments":8,"offset":{"x":30,"y":-20,"z":0},"position":{"x":[-5,-2,0,0,0,0,0,0,0,0,0],"y":[30,55,60,80,95,100,90,95],"z":[0,0,0,0,0,0,0,0]},"width":[12,14,14,10,12,10,0],"height":[5,14,14,10,12,10,0],"texture":[2,6,4,11,6,12],"propeller":true},"lasers":{"section_segments":8,"offset":{"x":70,"y":-40,"z":10},"position":{"x":[0,0,0,0,0],"y":[25,90,10,50,60],"z":[0,0,0,0,0]},"width":[5,5,0,10,5],"height":[5,1,0,0,5],"texture":[63,6],"angle":3,"laser":{"damage":[15,20],"rate":2.5,"type":1,"speed":[175,225],"number":1,"error":0},"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-40,-25,0,5],"z":[-10,-5,0,0,0]},"width":[0,5,10,10,0],"height":[0,10,15,16,0],"texture":[9]}},"wings":{"wings":{"offset":{"x":20,"y":0,"z":0},"length":[35,15,20,15],"width":[100,50,50,40,45],"angle":[-10,20,0,0],"position":[0,0,10,30,0],"texture":[11,4],"bump":{"position":-20,"size":15}},"side":{"doubleside":true,"offset":{"x":105,"y":30,"z":-30},"length":[30,10,30],"width":[40,60,60,40],"angle":[90,110,110,90],"position":[0,-30,-30,0],"texture":[63],"bump":{"position":0,"size":15}}},"typespec":{"name":"Bat-Defender","level":5,"model":9,"code":509,"specs":{"shield":{"capacity":[350,450],"reload":[9,12]},"generator":{"capacity":[90,130],"reload":[30,45]},"ship":{"mass":380,"speed":[65,80],"rotation":[55,75],"acceleration":[80,105]}},"shape":[3.604,3.424,2.813,2.415,2.149,1.968,1.913,1.973,2.073,2.759,3.932,3.974,4.081,4.084,4.04,4.116,4.187,3.661,2.16,2.365,2.719,3.22,3.183,3.028,2.016,1.984,2.016,3.028,3.183,3.22,2.719,2.365,2.16,3.661,4.187,4.116,4.04,4.081,4.084,3.974,3.932,2.759,2.073,1.973,1.913,1.968,2.149,2.415,2.813,3.424],"lasers":[{"x":2.539,"y":-1.08,"z":0.36,"angle":3,"damage":[15,20],"rate":2.5,"type":1,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.539,"y":-1.08,"z":0.36,"angle":-3,"damage":[15,20],"rate":2.5,"type":1,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.187,"next":[611,612]}}',
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
                            '{"name":"Scorpion","level":6,"model":1,"next":[701,702],"size":2,"specs":{"shield":{"capacity":[225,400],"reload":[5,7]},"generator":{"capacity":[80,175],"reload":[38,50]},"ship":{"mass":450,"speed":[75,90],"rotation":[50,70],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-40,-30,0,50,100,120,110],"z":[-10,-5,0,0,0,0,20,20]},"width":[0,12,20,15,25,10,5],"height":[0,10,15,25,15,10,5],"texture":[1,4,63,11,11,4],"propeller":false},"tail":{"section_segments":14,"offset":{"x":0,"y":70,"z":50},"position":{"x":[0,0,0,0,0,0],"y":[-70,-25,-10,20,40,50],"z":[0,0,0,0,-10,-20]},"width":[0,5,35,25,5,5],"height":[0,5,25,20,5,5],"texture":[6,4,63,10,4],"laser":{"damage":[50,100],"rate":0.9,"type":2,"speed":[180,230],"number":1,"angle":0,"error":0,"recoil":100}},"cockpit":{"section_segments":8,"offset":{"x":13,"y":-44,"z":12},"position":{"x":[-5,0,0,0,0],"y":[-15,-5,0,5,15],"z":[0,0,0,1,0]},"width":[0,8,10,8,0],"height":[0,5,5,5,0],"texture":[6,5],"propeller":false},"deco":{"section_segments":8,"offset":{"x":70,"y":0,"z":-10},"position":{"x":[0,0,0,10,-5,0,0,0],"y":[-115,-80,-100,-60,-30,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,15,15,20,10,0],"height":[1,5,15,20,35,30,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[2,3],"rate":1.8,"type":1,"speed":[130,170],"number":2,"angle":5,"error":0},"propeller":true},"wingends":{"section_segments":8,"offset":{"x":105,"y":-80,"z":-10},"position":{"x":[0,2,4,2,0],"y":[-20,-10,0,10,20],"z":[0,0,0,0,0]},"width":[2,3,6,3,2],"height":[5,15,22,17,5],"texture":4,"angle":0,"propeller":false}},"wings":{"main":{"length":[80,30],"width":[40,30,20],"angle":[-10,20],"position":[30,-50,-80],"texture":63,"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}},"font":{"length":[80,30],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":4,"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Scorpion","level":6,"model":1,"code":601,"specs":{"shield":{"capacity":[225,400],"reload":[7,9]},"generator":{"capacity":[80,175],"reload":[38,50]},"ship":{"mass":460,"speed":[75,90],"rotation":[50,70],"acceleration":[80,100]}},"shape":[3.6,2.846,2.313,2.192,5.406,5.318,5.843,5.858,5.621,4.134,3.477,3.601,3.622,3.464,3.351,3.217,1.458,1.391,1.368,1.37,1.635,2.973,3.47,3.911,4.481,4.804,4.481,3.911,3.47,2.973,1.635,1.37,1.368,1.391,1.458,3.217,3.351,3.464,3.622,3.601,3.477,4.134,5.621,5.858,5.843,5.318,5.406,2.192,2.313,2.846],"lasers":[{"x":0,"y":0,"z":2,"angle":0,"damage":[50,100],"rate":0.9,"type":2,"speed":[180,230],"number":1,"spread":0,"error":0,"recoil":100},{"x":2.8,"y":-4.6,"z":-0.4,"angle":0,"damage":[2,3],"rate":1.8,"type":1,"speed":[130,170],"number":2,"spread":5,"error":0,"recoil":0},{"x":-2.8,"y":-4.6,"z":-0.4,"angle":0,"damage":[2,3],"rate":1.8,"type":1,"speed":[130,170],"number":2,"spread":5,"error":0,"recoil":0}],"radius":5.858,"next":[701,702]}}',
                            '{"name":"Xenolith","level":6,"model":2,"next":[702,703],"size":1.7,"specs":{"shield":{"capacity":[230,320],"reload":[5,8]},"generator":{"capacity":[110,180],"reload":[38,55]},"ship":{"mass":300,"speed":[70,105],"rotation":[50,75],"acceleration":[85,115]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-86,-90,-50,0,30,70,120,110],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,25,25,30,30,25,0],"height":[0,10,20,20,30,30,10,0],"texture":[12,2,10,11,3,8,17],"propeller":true,"laser":{"damage":[28,35],"speed":[121,165],"rate":4,"type":1,"number":1,"angle":0,"recoil":120}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-30,10,30,40],"z":[0,0,0,0,0]},"width":[7,15,17,17,0],"height":[5,15,15,12,0],"texture":[9,9,4],"propeller":false},"propeller":{"section_segments":12,"offset":{"x":75,"y":50,"z":-45},"position":{"x":[0,0,0,0,0,0,0],"y":[-38,-35,-20,0,10,40,35],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,13,0],"height":[0,10,13,13,13,13,0],"texture":[13,3,4,18,63,13],"propeller":true},"Side":{"section_segments":9,"offset":{"x":25,"y":30,"z":-12},"position":{"x":[-5,-5,-2,0,-4,-4],"y":[-90,-100,-60,20,50,58],"z":[5,5,5,0,0,0,0,0]},"width":[0,8,12,24,14,0],"height":[0,4,15.6,24,14,0],"texture":[4,4,63,4,3]},"cannon":{"section_segments":12,"offset":{"x":0,"y":50,"z":45},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-48,-45,-20,0,20,40,35],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,10,15,15,15,10,0],"height":[0,6,10,13,13,13,13,0],"angle":0,"laser":{"damage":[10,25],"speed":[100,150],"rate":4,"type":1,"number":1,"angle":0,"error":0},"propeller":true,"texture":[6,2,3,4,12,63,13]}},"wings":{"main":{"offset":{"x":0,"y":20,"z":0},"length":[80,0,20],"width":[70,50,60,50],"texture":[11,63,63],"angle":[-20,-40,-40],"position":[10,40,40,40],"doubleside":1,"bump":{"position":-10,"size":15}},"main2":{"offset":{"x":0,"y":20,"z":0},"length":[80,0,20],"width":[70,50,60,50],"texture":[11,63,63],"angle":[-40,-20,-20],"position":[10,40,40,40],"doubleside":1,"bump":{"position":-10,"size":15}},"main3":{"offset":{"x":15,"y":20,"z":0},"length":[40,0,20],"width":[70,50,60,50],"texture":[11,63,63],"angle":[90,100,100],"position":[10,40,40,40],"doubleside":1,"bump":{"position":-30,"size":15}},"main4":{"doubleside":true,"offset":{"x":10,"y":-5,"z":-10},"length":[0,35,20,0],"width":[0,160,70,30,30],"angle":[-40,-30,-20,-20],"position":[30,-20,30,60,60],"texture":[13,63,13,8],"bump":{"position":35,"size":10}},"front":{"doubleside":true,"offset":{"x":-5,"y":-90,"z":5},"length":[20,15,0,20],"width":[40,40,90,100,30],"angle":[-30,-30,-30,-30],"position":[30,30,10,5,30],"texture":[13,2,13,4],"bump":{"position":35,"size":7}},"winglets":{"offset":{"x":74,"y":58,"z":-8},"length":[25,15,15,25],"width":[25,100,105,100,25],"angle":[-60,-70,-110,-120],"position":[0,0,0,0,0],"texture":[63,4,4,63],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Xenolith","level":6,"model":2,"code":602,"specs":{"shield":{"capacity":[230,320],"reload":[5,8]},"generator":{"capacity":[110,180],"reload":[38,55]},"ship":{"mass":300,"speed":[70,105],"rotation":[60,90],"acceleration":[90,125]}},"shape":[3.747,4.67,4.632,3.735,3.18,2.697,2.268,1.599,1.484,1.43,1.411,1.44,1.492,3.157,3.276,3.453,3.726,4.007,4.37,4.881,4.867,3.286,3.013,3.505,3.461,3.407,3.461,3.505,3.013,3.286,4.867,4.881,4.37,4.007,3.726,3.453,3.276,3.157,1.498,1.44,1.411,1.43,1.484,1.599,2.268,2.697,3.18,3.735,4.632,4.67],"lasers":[{"x":0,"y":-3.74,"z":0,"angle":0,"damage":[28,35],"rate":4,"type":1,"speed":[155,200],"number":1,"spread":0,"error":0,"recoil":120},{"x":0,"y":0.068,"z":1.53,"angle":0,"damage":[10,25],"rate":4,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.881,"next":[702,703]}}',
                            '{"name":"Advanced-Fighter","level":6,"model":3,"next":[703,704],"size":2,"specs":{"shield":{"capacity":[200,350],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":400,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-100,-80,-90,-50,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,15,25,40,25,20,0],"height":[0,5,10,30,25,20,10,0],"propeller":true,"texture":[4,4,1,1,10,1,1],"laser":{"damage":[90,150],"rate":1,"type":2,"speed":[190,260],"number":1,"recoil":150,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-35,"z":33},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,10,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,12,15,10,0],"height":[0,12,18,12,0],"propeller":false,"texture":[7,9,9,7]},"side_propellers":{"section_segments":10,"offset":{"x":30,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-50,-20,0,20,80,70],"z":[0,0,0,0,0,0]},"width":[15,20,10,25,10,0],"height":[10,15,15,10,5,0],"angle":0,"propeller":true,"texture":[3,63,4,10,3]},"cannons":{"section_segments":12,"offset":{"x":70,"y":50,"z":-30},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"propeller":false,"texture":[4,4,10,4,63,4],"laser":{"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":95,"y":50,"z":-40},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[2,5,5,2],"height":[2,15,15,2],"angle":0,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}}},"wings":{"main":{"length":[100,30,20],"width":[100,50,40,30],"angle":[-25,20,25],"position":[30,70,50,50],"bump":{"position":-20,"size":20},"offset":{"x":0,"y":0,"z":0},"texture":[11,11,63],"doubleside":true},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-50,-70,-65],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Advanced-Fighter","level":6,"model":3,"code":603,"specs":{"shield":{"capacity":[200,350],"reload":[5,7]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":410,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"shape":[4,3.65,3.454,3.504,3.567,2.938,1.831,1.707,1.659,1.943,1.92,1.882,1.896,3.96,5.654,5.891,6.064,5.681,5.436,5.573,5.122,4.855,4.675,4.626,4.479,4.008,4.479,4.626,4.675,4.855,5.122,5.573,5.436,5.681,6.064,5.891,5.654,3.96,3.88,1.882,1.92,1.943,1.659,1.707,1.831,2.938,3.567,3.504,3.454,3.65],"lasers":[{"x":0,"y":-4,"z":0.4,"angle":0,"damage":[90,150],"rate":1,"type":2,"speed":[190,260],"number":1,"spread":0,"error":0,"recoil":150},{"x":2.8,"y":0,"z":-1.2,"angle":0,"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.8,"y":0,"z":-1.2,"angle":0,"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.8,"y":0,"z":-1.6,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.8,"y":0,"z":-1.6,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.064,"next":[703,704]}}',
                            '{"name":"Condor","level":6,"model":4,"next":[703,704],"size":1.5,"zoom":0.96,"specs":{"shield":{"capacity":[225,400],"reload":[7,10]},"generator":{"capacity":[70,130],"reload":[30,48]},"ship":{"mass":260,"speed":[95,110],"rotation":[50,80],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-110,-95,-100,-100,-45,-40,-25,-23,15,20,55,80,100,90],"z":[-10,-9,-8,-7,-6,-4,-2,0,0,0,0,0,0,0]},"width":[0,2,5,10,25,27,27,25,25,27,40,35,30,0],"height":[0,2,5,10,25,27,27,25,25,27,20,15,10,0],"texture":[6,2,3,10,5,63,5,2,5,3,63,11,4],"propeller":true,"laser":{"damage":[30,60],"rate":2,"type":2,"speed":[165,225],"number":1,"angle":0,"error":0}},"cannons":{"section_segments":12,"offset":{"x":75,"y":30,"z":-25},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":4,"type":1,"speed":[100,130],"number":1,"angle":0,"error":0},"propeller":false,"texture":[6,4,10,4,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-60,"z":8},"position":{"x":[0,0,0,0],"y":[-25,-8,20,65],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,12,15,5],"texture":[9]}},"wings":{"back":{"offset":{"x":0,"y":25,"z":10},"length":[90,40],"width":[70,50,30],"angle":[-30,40],"position":[0,20,0],"texture":[11,63],"doubleside":true,"bump":{"position":10,"size":20}},"front":{"offset":{"x":0,"y":55,"z":10},"length":[90,40],"width":[70,50,30],"angle":[-30,-40],"position":[-60,-20,-20],"texture":[11,63],"doubleside":true,"bump":{"position":10,"size":10}}},"typespec":{"name":"Condor","level":6,"model":4,"code":604,"specs":{"shield":{"capacity":[225,400],"reload":[7,10]},"generator":{"capacity":[70,130],"reload":[30,48]},"ship":{"mass":260,"speed":[95,110],"rotation":[50,80],"acceleration":[80,110]}},"shape":[3.3,3.015,2.45,1.959,1.658,1.477,1.268,1.11,1.148,1.237,2.34,2.448,2.489,3.283,3.363,3.501,3.586,3.333,3.496,3.502,3.154,2.52,3.016,3.132,3.054,3.006,3.054,3.132,3.016,2.52,3.154,3.502,3.496,3.333,3.586,3.501,3.363,3.283,2.49,2.448,2.34,1.237,1.148,1.11,1.268,1.477,1.658,1.959,2.45,3.015],"lasers":[{"x":0,"y":-3.3,"z":0,"angle":0,"damage":[30,60],"rate":2,"type":2,"speed":[165,225],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.25,"y":-0.6,"z":-0.75,"angle":0,"damage":[3,6],"rate":4,"type":1,"speed":[100,130],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.25,"y":-0.6,"z":-0.75,"angle":0,"damage":[3,6],"rate":4,"type":1,"speed":[100,130],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.586,"next":[703,704]}}',
                            '{"name":"A-Speedster","level":6,"model":5,"next":[704,705],"size":1.6,"specs":{"shield":{"capacity":[200,300],"reload":[6,8]},"generator":{"capacity":[80,140],"reload":[30,45]},"ship":{"mass":235,"speed":[90,120],"rotation":[60,90],"acceleration":[90,135]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-100,-95,0,0,70,65],"z":[0,0,0,0,0,0]},"width":[0,10,40,20,20,0],"height":[0,5,30,30,15,0],"texture":[6,11,5,63,12],"propeller":true,"laser":{"damage":[38,84],"rate":1,"type":2,"speed":[175,230],"recoil":50,"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,0,20,40,50],"z":[-7,-5,0,0,0]},"width":[0,10,10,10,0],"height":[0,10,15,12,0],"texture":[9]},"side_propulsors":{"section_segments":10,"offset":{"x":50,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,20,10,0],"height":[0,15,20,20,20,15,15,20,10,0],"propeller":true,"texture":[4,4,2,2,5,63,5,4,12]},"cannons":{"section_segments":12,"offset":{"x":30,"y":40,"z":45},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,10,3,5,0],"height":[0,5,7,8,3,5,0],"angle":-10,"laser":{"damage":[8,12],"rate":2,"type":1,"speed":[100,130],"number":1,"angle":-10,"error":0},"propeller":false,"texture":[6,4,10,4,63,4]}},"wings":{"join":{"offset":{"x":0,"y":0,"z":10},"length":[40,0],"width":[10,20],"angle":[-1],"position":[0,30],"texture":[63],"bump":{"position":0,"size":25}},"winglets":{"offset":{"x":0,"y":-40,"z":10},"doubleside":true,"length":[45,10],"width":[5,20,30],"angle":[50,-10],"position":[90,80,50],"texture":[4],"bump":{"position":10,"size":30}}},"typespec":{"name":"A-Speedster","level":6,"model":5,"code":605,"specs":{"shield":{"capacity":[200,300],"reload":[6,8]},"generator":{"capacity":[80,140],"reload":[30,45]},"ship":{"mass":235,"speed":[90,120],"rotation":[60,90],"acceleration":[90,135]}},"shape":[3.2,3.109,2.569,2.082,1.786,1.589,1.439,1.348,1.278,1.24,1.222,1.338,1.372,1.801,2.197,2.375,2.52,2.637,3.021,3.288,3.665,3.862,3.713,2.645,2.28,2.244,2.28,2.645,3.713,3.862,3.665,3.288,3.021,2.637,2.52,2.375,2.197,1.801,1.372,1.338,1.222,1.24,1.278,1.348,1.439,1.589,1.786,2.082,2.569,3.109],"lasers":[{"x":0,"y":-3.2,"z":0,"angle":0,"damage":[38,84],"rate":1,"type":2,"speed":[175,230],"number":1,"spread":0,"error":0,"recoil":50},{"x":1.238,"y":-0.296,"z":1.44,"angle":-10,"damage":[8,12],"rate":2,"type":1,"speed":[100,130],"number":1,"spread":-10,"error":0,"recoil":0},{"x":-1.238,"y":-0.296,"z":1.44,"angle":10,"damage":[8,12],"rate":2,"type":1,"speed":[100,130],"number":1,"spread":-10,"error":0,"recoil":0}],"radius":3.862,"next":[704,705]}}',
                            '{"name":"T-Fighter","level":6,"model":6,"next":[705,706],"size":2.25,"zoom":0.96,"specs":{"shield":{"capacity":[220,350],"reload":[6,8]},"generator":{"capacity":[120,170],"reload":[35,60]},"ship":{"mass":310,"speed":[85,105],"rotation":[50,70],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-95,-65,-47,-20,15,17,29,50,60,75,72],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,15,20,25,25,25,22,20,15,0],"height":[0,6,8,12,20,20,20,20,18,15,0],"propeller":true,"texture":[2,63,63,11,5,3,63,4,13,17]},"cockpit":{"section_segments":7,"offset":{"x":0,"y":-59,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,16,35,50],"z":[-7,-6,-7,-1,-1]},"width":[0,5,10,8,5],"height":[0,6,11,6,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon_wing_top":{"section_segments":8,"offset":{"x":0,"y":60,"z":40},"position":{"x":[0,0,0,0,0,0],"y":[-25,-30,-10,10,20,15],"z":[0,0,0,0,0,0]},"width":[0,3,4.8,6.6,4.2,0],"height":[0,2.5,4,5.5,5,0],"angle":0,"laser":{"damage":[5,10],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0,"angle":0},"propeller":0,"texture":[6,4,10,13,17]},"side_thruster":{"section_segments":8,"offset":{"x":19,"y":57,"z":-10},"position":{"x":[1,1,1,0,0,0],"y":[-45,-30,-10,10,20,15],"z":[0,0,0,0,0,0]},"width":[0,3.25,5.2,7.15,4.55,0],"height":[0,2.5,4,5.5,5,0],"angle":0,"propeller":true,"texture":[4,4,10,13,17]},"cannon_side":{"section_segments":8,"offset":{"x":10,"y":-43,"z":-10},"position":{"x":[0,0,0,0,0,-2],"y":[-35,-40,-20,10,25,40],"z":[0,0,0,0,0,0]},"width":[0,3.2,5.6,8,4.8,0],"height":[0,2.4,4.2,6,4.2,0],"angle":0,"laser":{"damage":[10,15],"rate":4,"type":1,"speed":[100,155],"number":5,"error":0,"angle":25},"propeller":false,"texture":[4,4,11,4]},"cannon_wings":{"section_segments":8,"offset":{"x":56,"y":50,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-66.5,-59.5,-56,-60.2,-52.5,-47.6,-44.8,-44.8,-31.5,-10.5,7,17.5,14.7],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,1.35,0,2.7,4.5,5.4,6.93,6.93,7.65,8.55,6.75,4.5,0],"height":[0,1.35,0,2.7,4.5,5.4,6.93,6.93,7.65,8.55,6.75,4.5,0],"texture":[63,63,13,4,4,63,8,10,8,4,13,17],"angle":0,"laser":{"damage":[6,7],"rate":2,"type":1,"speed":[150,200],"number":1,"angle":3.5,"error":0},"propeller":0},"cannon_pulse_fix":{"section_segments":0,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[0],"height":[0],"texture":[0],"angle":0,"laser":{"damage":[100,150],"rate":10,"type":1,"speed":[1,1],"number":100,"error":0,"angle":0},"propeller":false}},"wings":{"main":{"length":[60,15,5],"width":[80,30,20,20],"angle":[0,40,0],"position":[10,24,3,-10],"doubleside":true,"texture":[11,63,4],"offset":{"x":1,"y":13,"z":-5.31},"bump":{"position":10,"size":10}},"winglets":{"length":[19,3],"width":[30,30,59],"angle":[0,50,0],"position":[-20,23,50],"doubleside":true,"texture":[3],"offset":{"x":1,"y":-58,"z":0},"bump":{"position":30,"size":15}},"winglets_cannon_top_2":{"length":[13,3],"width":[15,15,20],"angle":[30,30,0],"position":[-12,0,-2],"doubleside":true,"texture":[4,13],"offset":{"x":1,"y":65,"z":40},"bump":{"position":10,"size":10}},"top":{"doubleside":true,"offset":{"x":0,"y":44,"z":20},"length":[0,20],"width":[0,50,20],"angle":[0,90],"position":[0,0,20],"texture":[63],"bump":{"position":0,"size":10}}},"typespec":{"name":"T-Fighter","level":6,"model":6,"code":606,"specs":{"shield":{"capacity":[220,350],"reload":[6,8]},"generator":{"capacity":[120,170],"reload":[35,60]},"ship":{"mass":310,"speed":[85,105],"rotation":[50,70],"acceleration":[80,110]}},"shape":[4.275,3.782,3.409,2.591,2.202,1.865,1.634,1.434,1.279,1.172,2.627,2.691,3.501,3.514,3.536,3.488,3.469,3.55,3.852,4.079,3.941,3.014,3.521,3.623,3.527,3.605,3.527,3.623,3.521,3.014,3.941,4.079,3.852,3.55,3.469,3.488,3.536,3.514,3.501,2.691,2.627,1.172,1.279,1.434,1.634,1.865,2.202,2.591,3.409,3.782],"lasers":[{"x":0,"y":1.35,"z":1.8,"angle":0,"damage":[5,10],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.45,"y":-3.735,"z":-0.45,"angle":0,"damage":[10,15],"rate":4,"type":1,"speed":[100,155],"number":5,"spread":25,"error":0,"recoil":0},{"x":-0.45,"y":-3.735,"z":-0.45,"angle":0,"damage":[10,15],"rate":4,"type":1,"speed":[100,155],"number":5,"spread":25,"error":0,"recoil":0},{"x":2.52,"y":-0.743,"z":-0.135,"angle":0,"damage":[6,7],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":3.5,"error":0,"recoil":0},{"x":-2.52,"y":-0.743,"z":-0.135,"angle":0,"damage":[6,7],"rate":2,"type":1,"speed":[150,200],"number":1,"spread":3.5,"error":0,"recoil":0}],"radius":4.275,"next":[705,706]}}',
                            '{"name":"H-Mercury","level":6,"model":7,"next":[706,707],"size":1.85,"zoom":0.96,"specs":{"shield":{"capacity":[250,330],"reload":[6,8]},"generator":{"capacity":[140,200],"reload":[54,66]},"ship":{"mass":350,"speed":[71,95],"rotation":[51,75],"acceleration":[81,105]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-70,-60,-40,0,50,110,100],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,20,30,25,10,0],"height":[1,5,10,15,25,20,10,0],"texture":[6,4,4,63,11,63,12],"propeller":true,"laser":{"damage":[14,20],"rate":2,"type":1,"speed":[150,210],"number":1,"error":0,"recoil":120}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":35},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,15,25],"z":[0,0,0,0,0]},"width":[0,10,12,10,5],"height":[0,10,13,12,5],"texture":[9,9,4,4],"propeller":false},"arms":{"section_segments":8,"offset":{"x":60,"y":-10,"z":-10},"position":{"x":[0,0,0,5,10,0,0,-10],"y":[-85,-70,-80,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,6,15,15,15,10,0],"height":[1,5,6,20,30,25,10,0],"texture":[6,4,4,4,4,4,12],"angle":1,"propeller":true,"laser":{"damage":[9,18],"rate":2,"type":1,"speed":[140,190],"number":1,"error":0}},"canon":{"section_segments":12,"offset":{"x":100,"y":17,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,7,3,5,0],"height":[0,5,15,15,3,5,0],"angle":3,"laser":{"damage":[1,4],"rate":6,"type":1,"speed":[160,220],"number":1,"error":0},"propeller":false,"texture":[6,4,10,4,4,4]}},"wings":{"main":{"offset":{"x":0,"y":-25,"z":20},"length":[60,40],"width":[60,30,20],"angle":[-20,10],"position":[30,50,30],"texture":[11,11],"bump":{"position":30,"size":10}},"font":{"length":[60],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":-10,"z":0}},"font2":{"offset":{"x":0,"y":30,"z":8},"length":[60],"width":[20,15],"angle":[-10,20],"position":[20,40],"texture":[63],"bump":{"position":30,"size":10}}},"typespec":{"name":"H-Mercury","level":6,"model":7,"code":607,"specs":{"shield":{"capacity":[250,330],"reload":[6,8]},"generator":{"capacity":[140,200],"reload":[54,66]},"ship":{"mass":350,"speed":[70,95],"rotation":[51,75],"acceleration":[81,105]}},"shape":[2.966,2.962,2.449,2.118,4.148,4.125,3.9,3.621,3.435,3.316,3.938,3.929,3.926,3.984,4.028,4.189,4.323,4.325,3.691,4.157,4.253,3.947,2.843,2.977,3.718,3.707,3.718,2.977,2.843,3.947,4.253,4.157,3.691,4.325,4.323,4.189,4.028,3.984,3.926,3.929,3.938,3.316,3.435,3.621,3.9,4.125,4.148,2.118,2.449,2.962],"lasers":[{"x":0,"y":-2.96,"z":0.74,"angle":0,"damage":[14,20],"rate":2,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":120},{"x":2.165,"y":-3.515,"z":-0.37,"angle":1,"damage":[9,18],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.165,"y":-3.515,"z":-0.37,"angle":-1,"damage":[9,18],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.603,"y":-1.218,"z":0.185,"angle":3,"damage":[1,4],"rate":6,"type":1,"speed":[160,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.603,"y":-1.218,"z":0.185,"angle":-3,"damage":[1,4],"rate":6,"type":1,"speed":[160,220],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.325,"next":[706,707]}}',
                            '{"name":"Typhoon","level":6,"model":8,"next":[707,708],"size":1.85,"specs":{"shield":{"capacity":[230,350],"reload":[4,7]},"generator":{"capacity":[250,350],"reload":[46,64]},"ship":{"mass":375,"speed":[67,85],"rotation":[40,70],"acceleration":[85,95]}},"bodies":{"body":{"section_segments":8,"offset":{"x":0,"y":-12.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-110,-105,-90,-40,-20,0,20,78,120,137,130],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,16,25,25,32,35,35,25,20,0],"height":[0,17,26,35,35,35,35,35,24,20,0],"texture":[4,63,10,63,63,3,10,63,3,17],"propeller":true},"sidethrusters":{"section_segments":8,"offset":{"x":30,"y":27.5,"z":0},"position":{"x":[-10,-5,4,-3,-3],"y":[-70,-50,0,90,80],"z":[0,0,0,0,0,0]},"width":[0,15,16,10,0],"height":[0,15,16,10,0],"texture":[4,11,1,17],"propeller":true},"cannons1":{"section_segments":8,"offset":{"x":83,"y":22.5,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-37,-29,0,45,60,61],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,8,0],"height":[0,5,10,10,8,0],"texture":[6,4,63,4,3],"propeller":false,"angle":-1.5,"laser":{"damage":[8,12],"rate":3,"type":1,"speed":[110,170],"number":1}},"cannons2":{"section_segments":8,"offset":{"x":45,"y":46.5,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-37,-29,0,45,60,61],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,8,0],"height":[0,5,10,10,8,0],"texture":[6,4,3,4,3],"propeller":false,"angle":-0.5,"laser":{"damage":[8,12],"rate":3,"type":1,"speed":[130,190],"number":1}},"cannons3":{"section_segments":8,"offset":{"x":20,"y":-62.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-37,-29,0,45,60,61],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,8,0],"height":[0,5,10,10,8,0],"texture":[6,4,3,4,3],"propeller":false,"laser":{"damage":[8,12],"rate":3,"type":1,"speed":[150,210],"number":1}},"cannons4":{"section_segments":8,"offset":{"x":60,"y":-12.5,"z":-38},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-37,-29,0,45,60,61],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,8,0],"height":[0,5,10,10,8,0],"texture":[6,4,3,4,3],"propeller":false,"angle":-1,"laser":{"damage":[8,12],"rate":3,"type":1,"speed":[130,190],"number":1}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-46.5,"z":26},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-30,0,40,70,100],"z":[0,0,0,0,0,0]},"width":[0,10,14,14,13,0],"height":[0,10,16,14,10,0],"texture":[4,9,9,63,4]}},"wings":{"wingsmain":{"offset":{"x":30,"y":37.5,"z":6},"length":[60,10,0,25],"width":[100,80,60,100,55],"angle":[-30,-30,-30,-30],"position":[-20,0,16,10,40],"texture":[3,13,17,63],"doubleside":true,"bump":{"position":-20,"size":4}},"wingsmain2":{"offset":{"x":20,"y":57.5,"z":20},"length":[30,10,0,15],"width":[70,60,50,90,35],"angle":[10,10,10,10],"position":[-20,0,16,10,40],"texture":[2,13,17,63],"doubleside":true,"bump":{"position":-20,"size":5}},"wingsmain3":{"offset":{"x":10,"y":-12.5,"z":-10},"length":[50],"width":[70,50],"angle":[-30,0],"position":[-20,5],"texture":[2],"doubleside":true,"bump":{"position":-20,"size":5}}},"typespec":{"name":"Typhoon","level":6,"model":8,"code":608,"specs":{"shield":{"capacity":[230,350],"reload":[4,7]},"generator":{"capacity":[250,350],"reload":[46,64]},"ship":{"mass":375,"speed":[67,85],"rotation":[40,70],"acceleration":[85,95]}},"shape":[4.533,4.403,3.755,3.188,2.592,2.187,2.193,2.896,2.877,2.795,2.694,3.21,3.385,3.606,3.905,4.354,4.737,5.13,5.688,5.657,5.063,5.03,4.467,4.558,4.666,4.615,4.666,4.558,4.467,5.03,5.063,5.657,5.688,5.13,4.737,4.354,3.905,3.606,3.385,3.21,2.694,2.795,2.877,2.896,2.193,2.187,2.592,3.188,3.755,4.403],"lasers":[{"x":3.107,"y":-0.536,"z":-0.925,"angle":-1.5,"damage":[8,12],"rate":3,"type":1,"speed":[110,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.107,"y":-0.536,"z":-0.925,"angle":1.5,"damage":[8,12],"rate":3,"type":1,"speed":[110,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.677,"y":0.352,"z":0.925,"angle":-0.5,"damage":[8,12],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.677,"y":0.352,"z":0.925,"angle":0.5,"damage":[8,12],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.74,"y":-3.682,"z":0,"angle":0,"damage":[8,12],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.74,"y":-3.682,"z":0,"angle":0,"damage":[8,12],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.244,"y":-1.831,"z":-1.406,"angle":-1,"damage":[8,12],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.244,"y":-1.831,"z":-1.406,"angle":1,"damage":[8,12],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.688,"next":[707,708]}}',
                            '{"name":"Marauder","level":6,"model":9,"next":[708,709],"size":1.4,"zoom":0.96,"specs":{"shield":{"capacity":[210,350],"reload":[8,11]},"generator":{"capacity":[85,160],"reload":[30,50]},"ship":{"mass":270,"speed":[85,115],"rotation":[60,80],"acceleration":[80,115]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-55,-40,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,18,23,30,25,25,30,35,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,1,10,1,1,11,12,17],"propeller":true,"laser":{"damage":[10,16],"rate":10,"type":1,"speed":[170,200],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-85,"z":22},"position":{"x":[0,0,0,0,0,0],"y":[15,35,60,95,125],"z":[-1,-2,-1,-1,3]},"width":[5,12,14,15,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4]},"outriggers":{"section_segments":10,"offset":{"x":25,"y":0,"z":-10},"position":{"x":[-5,-5,8,-5,0,0,0,0,0,0],"y":[-100,-125,-45,0,30,40,70,80,100,90],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,15,15,15,10,0],"height":[0,10,20,25,25,25,25,25,20,0],"texture":[13,4,4,63,4,18,4,13,17],"laser":{"damage":[4,8],"rate":3,"type":1,"speed":[110,140],"recoil":0,"number":1,"error":0},"propeller":true},"intake":{"section_segments":12,"offset":{"x":25,"y":-5,"z":10},"position":{"x":[0,0,5,0,-3,0,0,0,0,0],"y":[-10,-30,-5,35,60,70,85,100,85],"z":[0,-6,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,15,15,20,20,15,15,5,0],"texture":[6,4,63,4,63,18,4,17]}},"wings":{"main":{"length":[20,70,35],"width":[50,55,40,20],"angle":[0,-20,0],"position":[20,20,70,25],"texture":[3,18,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":0,"z":13}},"spoiler":{"length":[20,45,0,5],"width":[40,40,20,30,0],"angle":[0,20,90,90],"position":[60,60,80,80,90],"texture":[10,11,63],"doubleside":true,"bump":{"position":30,"size":18},"offset":{"x":0,"y":0,"z":30}},"font":{"length":[37],"width":[40,15],"angle":[-10],"position":[0,-45],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":35,"y":-20,"z":10}},"shields":{"doubleside":true,"offset":{"x":12,"y":60,"z":-15},"length":[0,15,45,20],"width":[30,30,65,65,30,30],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[4],"bump":{"position":0,"size":4}}},"typespec":{"name":"Marauder","level":6,"model":9,"code":609,"specs":{"shield":{"capacity":[210,350],"reload":[8,11]},"generator":{"capacity":[85,160],"reload":[30,50]},"ship":{"mass":270,"speed":[85,115],"rotation":[60,80],"acceleration":[80,115]}},"shape":[2.665,3.563,3.573,2.856,2.359,2.03,2.85,2.741,2.228,1.71,1.404,1.199,1.11,3.408,3.491,3.521,3.44,3.385,3.439,3.481,3.181,2.932,2.962,2.944,2.85,2.244,2.85,2.944,2.962,2.932,3.181,3.481,3.439,3.385,3.44,3.521,3.491,3.408,1.11,1.199,1.404,1.71,2.228,2.741,2.85,2.03,2.359,2.856,3.573,3.563],"lasers":[{"x":0,"y":-2.66,"z":0.28,"angle":0,"damage":[10,16],"rate":10,"type":1,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.56,"y":-3.5,"z":-0.28,"angle":0,"damage":[4,8],"rate":3,"type":1,"speed":[110,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.56,"y":-3.5,"z":-0.28,"angle":0,"damage":[4,8],"rate":3,"type":1,"speed":[110,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.573,"next":[708,709]}}',
                            '{"name":"Rock-Tower","level":6,"model":10,"next":[708,709],"size":2.1,"specs":{"shield":{"capacity":[300,500],"reload":[8,11]},"generator":{"capacity":[120,140],"reload":[36,54]},"ship":{"mass":400,"speed":[85,103],"rotation":[50,70],"acceleration":[80,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-85,-70,-60,-20,-25,40,85,70],"z":[-10,-8,-5,0,0,0,0,0,0]},"width":[0,40,45,10,12,30,30,20,0],"height":[0,10,12,8,12,10,25,20,0],"texture":[4,63,4,4,4,11,10,12],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":30,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-20,0,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,10,15,15,10,5],"height":[0,10,15,15,10,5],"texture":9,"propeller":false},"dimeds_banhammer":{"section_segments":6,"offset":{"x":25,"y":-70,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-20,-10,-20,0,10,12],"z":[0,0,0,0,0,0]},"width":[0,0,5,7,6,0],"height":[0,0,5,7,6,0],"texture":[6,6,6,10,12],"angle":0,"laser":{"damage":[5,8],"rate":8,"type":1,"speed":[150,230],"number":1,"error":3}},"propulsors":{"section_segments":8,"offset":{"x":30,"y":50,"z":0},"position":{"x":[0,0,5,5,0,0,0],"y":[-45,-50,-20,0,20,50,40],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,0],"height":[0,15,20,25,20,10,0],"texture":[11,2,3,4,5,12],"angle":0,"propeller":true}},"wings":{"main":{"length":[55,15],"width":[60,40,30],"angle":[-10,20],"position":[30,40,30],"texture":63,"doubleside":true,"offset":{"x":0,"y":20,"z":-5},"bump":{"position":30,"size":20}},"finalizer_fins":{"length":[20],"width":[20,10],"angle":[-70],"position":[-42,-30],"texture":63,"doubleside":true,"offset":{"x":35,"y":-35,"z":0},"bump":{"position":0,"size":30}}},"typespec":{"name":"Rock-Tower","level":6,"model":10,"code":610,"specs":{"shield":{"capacity":[300,500],"reload":[8,11]},"generator":{"capacity":[120,140],"reload":[36,54]},"ship":{"mass":400,"speed":[85,103],"rotation":[45,70],"acceleration":[80,90]}},"shape":[3.78,3.758,3.974,3.976,3.946,3.508,1.532,1.64,1.556,1.426,1.347,1.298,1.269,1.764,1.894,2.075,3.269,3.539,3.933,3.989,4.058,4.127,4.524,4.416,3.634,3.577,3.634,4.416,4.524,4.127,4.058,3.989,3.933,3.539,3.269,2.075,1.894,1.764,1.68,1.298,1.347,1.426,1.556,1.64,1.532,3.508,3.946,3.976,3.974,3.758],"lasers":[{"x":1.05,"y":-3.78,"z":-0.42,"angle":0,"damage":[5,8],"rate":8,"type":1,"speed":[150,230],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.05,"y":-3.78,"z":-0.42,"angle":0,"damage":[5,8],"rate":8,"type":1,"speed":[150,230],"number":1,"spread":0,"error":3,"recoil":0}],"radius":4.524,"next":[708,709]}}',
                            '{"name":"O-Defender","level":6,"model":12,"next":[710,711],"size":2.2,"zoom":0.96,"specs":{"shield":{"capacity":[450,550],"reload":[11,14]},"generator":{"capacity":[70,110],"reload":[30,50]},"ship":{"mass":500,"speed":[65,75],"rotation":[42,54],"acceleration":[75,95]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-88,0,40,90,95,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[5,6,25,25,15,18,15,0],"height":[2,10,40,40,20,18,15,0],"texture":[63,1,4,10,63,63,17],"propeller":true,"laser":{"damage":[35,60],"rate":2,"type":2,"speed":[215,275],"number":1,"angle":0,"error":0}},"side":{"section_segments":10,"offset":{"x":50,"y":0,"z":0},"position":{"x":[-40,-5,15,25,20,0,-50],"y":[-100,-70,-40,-10,20,50,90],"z":[0,0,0,0,0,0,0]},"width":[5,20,20,20,20,20,5],"height":[15,25,30,30,30,25,15],"texture":[0,1,2,3,4,63]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":18},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9]},"innersides":{"section_segments":8,"offset":{"x":20,"y":-100,"z":0},"position":{"x":[-3,0,0,0,0,-5,-5],"y":[70,75,100,120,150,175,175],"z":[0,0,0,0,0,0,0]},"width":[0,10,20,22,20,10,0],"height":[0,20,25,25,25,15,0],"propeller":false,"texture":[2,3,63,11,1]}},"wings":{"join":{"offset":{"x":0,"y":20,"z":0},"length":[80,0],"width":[130,50],"angle":[-1],"position":[0,-30],"texture":[8],"bump":{"position":-20,"size":15}}},"typespec":{"name":"O-Defender","level":6,"model":12,"code":612,"specs":{"shield":{"capacity":[450,550],"reload":[11,14]},"generator":{"capacity":[70,110],"reload":[30,50]},"ship":{"mass":500,"speed":[65,75],"rotation":[42,54],"acceleration":[75,95]}},"shape":[4.409,4.448,4.372,4.204,4.119,4.136,4.174,4.107,4.066,4.094,4.073,4.141,4.16,4.062,4.015,3.966,3.83,3.76,3.742,3.591,3.502,3.494,3.575,3.764,4.449,4.409,4.449,3.764,3.575,3.494,3.502,3.591,3.742,3.76,3.83,3.966,4.015,4.062,4.16,4.141,4.073,4.094,4.066,4.107,4.174,4.136,4.119,4.204,4.372,4.448],"lasers":[{"x":0,"y":-3.96,"z":0,"angle":0,"damage":[35,60],"rate":2,"type":2,"speed":[215,275],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.449,"next":[710,711]}}',
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
                            '{"name":"Odyssey","level":7,"model":1,"size":3.1,"specs":{"shield":{"capacity":[600,600],"reload":[12,12]},"generator":{"capacity":[320,320],"reload":[110,110]},"ship":{"mass":520,"speed":[60,60],"rotation":[30,30],"acceleration":[130,130]}},"tori":{"circle":{"segments":20,"radius":95,"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],"height":[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],"texture":[63,63,4,10,4,4,10,4,63,63,63,63,3,10,3,3,10,3,63]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-105,-65,-53,-45,-36,-20,-25,40,40,100,90],"z":[0,0,0,0,0,0,0,0,0,1,3,3]},"width":[0,20,40,40,32,15,15,30,30,40,30,0],"height":[0,16,25,25,23,20,16,25,25,20,10,0],"texture":[4,15,63,3,2,4,4,11,10,4,12]},"cannonmain":{"section_segments":6,"offset":{"x":0,"y":-90,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,19,19,7],"height":[0,10,17,7],"texture":[5.9,5.9,2,17],"laser":{"damage":[230,230],"rate":2,"type":1,"speed":[95,95],"number":1,"error":0,"recoil":350}},"laser1":{"section_segments":8,"offset":{"x":109,"y":0,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,3,5,5],"height":[0,3,5,5],"texture":[12,6,63],"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"error":0}},"laser2":{"section_segments":8,"offset":{"x":109,"y":0,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,3,5,5],"height":[0,3,5,5],"texture":[12,6,63],"angle":180,"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,0,10,30],"z":[0,0,0,0,0]},"width":[0,12,15,10,0],"height":[0,20,22,18,0],"texture":[9]},"bumpers":{"section_segments":8,"offset":{"x":85,"y":20,"z":0},"position":{"x":[-10,-5,5,10,5,-10,-15],"y":[-90,-85,-40,0,20,60,65],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,5,0],"height":[0,20,35,35,25,15,0],"texture":[11,2,63,4,3],"angle":0},"frontbumpers":{"section_segments":8,"offset":{"x":23,"y":-100,"z":0},"position":{"x":[-7.5,-3.5,0,11,2,-8,-8],"y":[-44,-41,10,27,45,60,85],"z":[0,0,0,0,0,0,0]},"width":[0,7,14,13,14,9,7],"height":[0,10,19,29,29,17,8],"texture":[2,2,63,4,4,1],"angle":0},"toppropulsors":{"section_segments":10,"offset":{"x":17,"y":55,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,-5,10,20,25,30,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[3,4,10,3,3,63,4],"propeller":true},"bottompropulsors":{"section_segments":8,"offset":{"x":17,"y":55,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-20,30,40,50,40],"z":[0,0,0,0,0]},"width":[0,12,17,12,0],"height":[0,12,17,12,0],"texture":[3,4,4],"propeller":true}},"wings":{"topjoin":{"offset":{"x":0,"y":-3,"z":0},"doubleside":true,"length":[99],"width":[20,20],"angle":[25],"position":[0,0,0,50],"texture":[1],"bump":{"position":10,"size":30}},"bottomjoin":{"offset":{"x":0,"y":-3,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[1],"bump":{"position":-10,"size":30}},"winglets":{"length":[25],"width":[41,26,30],"angle":[10,-10],"position":[-40,-56,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":27,"y":-23.5,"z":-6}}},"typespec":{"name":"Odyssey","level":7,"model":1,"code":701,"specs":{"shield":{"capacity":[600,600],"reload":[12,12]},"generator":{"capacity":[320,320],"reload":[110,110]},"ship":{"mass":520,"speed":[55,55],"rotation":[25,25],"acceleration":[130,130]}},"shape":[7.454,8.98,8.835,6.801,6.568,5.972,2.858,6.866,6.883,6.673,7.189,7.184,7.124,7.124,7.184,7.189,6.945,6.851,6.966,7.014,6.83,4.817,6.436,6.754,6.627,6.523,6.627,6.754,6.436,4.817,6.83,7.014,6.966,6.851,6.945,7.189,7.184,7.124,7.124,7.184,7.189,6.673,6.883,6.866,2.858,5.972,6.568,6.801,8.835,8.98],"lasers":[{"x":0,"y":-7.44,"z":0,"angle":0,"damage":[230,230],"rate":2,"type":1,"speed":[95,95],"number":1,"spread":0,"error":0,"recoil":350},{"x":6.758,"y":-1.86,"z":0,"angle":0,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-6.758,"y":-1.86,"z":0,"angle":0,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":6.758,"y":1.86,"z":0,"angle":180,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-6.758,"y":1.86,"z":0,"angle":-180,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":8.98}}',
                            '{"name":"Weaver","level":7,"model":2,"size":2.9,"specs":{"shield":{"capacity":[350,350],"reload":[7,7]},"generator":{"capacity":[205,205],"reload":[75,75]},"ship":{"mass":300,"speed":[105,105],"rotation":[65,65],"acceleration":[85,85]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-22,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-70,-68,-15,0,30,40,60,70,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,21,18,20,20,18,15,0],"height":[0,5,20,21,18,20,20,18,15,0],"texture":[11,2,63,3,4,8,15,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-42,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-25,-20,0,25,60,62],"z":[-3.2,-3,0,0,0,0]},"width":[4,8,11,8,5,0],"height":[0,2,6,8,4,0],"propeller":false,"texture":[4,9,9,63,4]},"deco":{"section_segments":8,"offset":{"x":50,"y":43,"z":-10},"position":{"x":[-3,-2,5,8,5,0,0],"y":[-62,-60,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,9,10,5,0],"height":[0,5,10,9,10,5,0],"angle":0,"propeller":false,"texture":[11,2,8,10,63,4]},"cannons":{"section_segments":8,"offset":{"x":38,"y":43,"z":-10},"position":{"x":[0,0,0,0,0,10,10],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,4,5,10,10,5,0],"height":[0,8,8,13,13,5,0],"angle":0,"laser":{"damage":[80,80],"rate":2,"type":1,"speed":[225,225],"number":1,"recoil":130},"propeller":false,"texture":[17,13,4,10,63,4]},"bottompropulsors":{"section_segments":12,"offset":{"x":16,"y":-12,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[15,5,13,25,30,40,60,50],"z":[5,6,0.1,0,0,0,0,0]},"width":[0,5,10,10,10,7,7,0],"height":[0,5,10,10,10,7,7,0],"propeller":true,"texture":[3,2,10,63,4,8,17]},"toppropulsors":{"section_segments":8,"offset":{"x":46.5,"y":28,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0],"y":[11,7,13,25,30,40,60,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,10,10,10,7,7,0],"height":[0,5,10,10,10,7,7,0],"propeller":true,"texture":[4,2,15,63,4,8,17]}},"wings":{"main":{"length":[22],"width":[17,18],"angle":[-40],"position":[1,15],"doubleside":true,"bump":{"position":0,"size":15},"texture":[18,63],"offset":{"x":20,"y":4,"z":5.8}},"main2":{"length":[50],"width":[20,20],"angle":[-20],"position":[-40,30],"doubleside":true,"bump":{"position":30,"size":15},"texture":[63,63],"offset":{"x":0,"y":42,"z":10}},"sides":{"doubleside":true,"offset":{"x":59,"y":23,"z":-10},"length":[-3,5,13,10],"width":[5,10,60,30,10],"angle":[5,5,25,35],"position":[0,0,20,45,58],"texture":[4,3,11,63],"bump":{"position":30,"size":10}},"front":{"length":[-3,20],"width":[0,90,10],"angle":[0,-10],"position":[0,0,40],"doubleside":true,"bump":{"position":30,"size":10},"texture":[15,3.3],"offset":{"x":10,"y":-67,"z":0}},"top":{"doubleside":true,"offset":{"x":14,"y":30,"z":11},"length":[0,15],"width":[0,30,15],"angle":[0,40],"position":[0,0,20],"texture":[11],"bump":{"position":30,"size":10}}},"typespec":{"name":"Weaver","level":7,"model":2,"code":702,"specs":{"shield":{"capacity":[350,350],"reload":[9,9]},"generator":{"capacity":[205,205],"reload":[75,75]},"ship":{"mass":300,"speed":[105,105],"rotation":[65,65],"acceleration":[85,85]}},"shape":[6.509,6.483,4.633,3.665,3.081,2.694,2.417,2.121,1.445,2.963,3.23,3.269,3.366,3.525,3.758,4.071,4.51,5.202,6.441,6.851,5.786,5.973,5.641,3.475,3.424,3.37,3.424,3.475,5.641,5.973,5.786,6.851,6.441,5.202,4.51,4.071,3.758,3.525,3.366,3.269,3.23,2.963,1.445,2.121,2.417,2.694,3.081,3.665,4.633,6.483],"lasers":[{"x":2.204,"y":-0.522,"z":-0.58,"angle":0,"damage":[80,80],"rate":2,"type":1,"speed":[227,227],"number":1,"spread":0,"error":0,"recoil":130},{"x":-2.204,"y":-0.522,"z":-0.58,"angle":0,"damage":[80,80],"rate":2,"type":1,"speed":[225,225],"number":1,"spread":0,"error":0,"recoil":130}],"radius":6.851}}',
                            '{"name":"Ballista","level":7,"model":3,"size":2.9,"specs":{"shield":{"capacity":[450,450],"reload":[8,8]},"generator":{"capacity":[300,300],"reload":[70,70]},"ship":{"mass":500,"speed":[77,77],"rotation":[42,42],"acceleration":[100,100]}},"bodies":{"main_body":{"section_segments":12,"offset":{"x":0,"y":25,"z":11},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-145,-135,-115,-60,-30,10,30,50,60,70,65],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[2,7,12,25,20,20,25,26.5,20,18,0],"height":[0,8,16,23,20,20,25,26.5,20,18,0],"texture":[4,63,10,1,11,2,13,2,4,17],"propeller":true},"top_pew1":{"section_segments":10,"offset":{"x":0,"y":30,"z":55},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-27,-35,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,14,20,14,14,18,9,0],"height":[0,7,9,15,17,15,15,20,10,0],"texture":[6,16.9,10,3,1,63,2,1,16.9],"propeller":true,"laser":{"damage":[20,20],"rate":1,"speed":[185,185],"number":11,"recoil":20,"type":2}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-3,25,43,55,100],"z":[0,0,0,0,-1,1,0,0,1,0,0,0]},"width":[1,7,12.4,11,9.5,0],"height":[1,8,15,11,12,0],"texture":[7,9,9,8,31]},"gun1":{"section_segments":8,"offset":{"x":85,"y":15,"z":-22},"position":{"x":[0,0,0,0,0,0,-1],"y":[-28,-40,-34,-14,-5,22,40],"z":[0,0,0,0,0,0,5]},"width":[0,3.4,5,5.5,8,5,0],"height":[0,3.4,5,5.5,8,5,0],"texture":[17,63,4,8,2,3],"angle":4,"laser":{"damage":[15,15],"rate":3,"speed":[185,185],"number":1,"recoil":0,"type":1}},"side_inner":{"section_segments":8,"offset":{"x":56,"y":45,"z":-5},"position":{"x":[-8,-4,-7,0,0,-10,-15],"y":[-60,-45,-25,-14,22.5,40,50],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,9,9,7,0],"height":[0,8,15,15,15,12,0],"texture":[2,3,63,13,63,2],"angle":5},"propulsors":{"section_segments":8,"offset":{"x":38,"y":50,"z":0},"position":{"x":[-15,-15,-8,-12.5,-12,-5,0,-1,-1,-1,0,0,0,0,0],"y":[-95,-100,-80,-50,-40,-20,20,39,50,48],"z":[2.5,2.5,5,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,10,20,20,11,10,0],"height":[0,10,13,15,15,20,20,16,12,0],"texture":[6,63,2,13,63,10,2,13,17],"propeller":true}},"wings":{"main":{"doubleside":true,"offset":{"x":57,"y":45,"z":-5},"length":[29,10,20],"width":[70,42,42,15],"angle":[-20,-15,10],"position":[0,-20,-31,-10],"texture":[11,63,4],"bump":{"position":10,"size":10}},"stab":{"length":[13,2,15],"width":[40,30,75,10],"angle":[-20,0,10],"position":[35,45,30,55],"doubleside":true,"texture":[8,4,63],"bump":{"position":20,"size":10},"offset":{"x":5,"y":-125,"z":12}},"join":{"offset":{"x":0,"y":10,"z":23},"length":[0,37,0,34],"width":[0,28,45,45,10],"angle":[90,90,90,-10],"position":[0,10,40,40,65],"texture":[8,8,63],"doubleside":true,"bump":{"position":20,"size":8}}},"typespec":{"name":"Ballista","level":7,"model":3,"code":703,"specs":{"shield":{"capacity":[450,450],"reload":[10,10]},"generator":{"capacity":[280,280],"reload":[70,70]},"ship":{"mass":500,"speed":[75,75],"rotation":[45,45],"acceleration":[100,100]}},"shape":[6.961,7.765,7.01,5.56,4.628,3.222,3.058,2.951,2.85,2.551,5.185,5.203,5.675,6.156,6.803,7.035,5.852,5.959,5.497,5.65,5.949,6.403,6.409,6.098,6.399,6.393,6.399,6.098,6.409,6.403,5.949,5.65,5.497,5.959,5.852,7.035,6.803,6.156,5.675,5.203,5.185,2.551,2.85,2.951,3.058,3.222,4.628,5.56,7.01,7.765],"lasers":[{"x":0,"y":-1.66,"z":3.19,"angle":0,"damage":[20,20],"rate":1,"type":2,"speed":[185,185],"number":11,"spread":0,"error":0,"recoil":20},{"x":4.768,"y":-1.444,"z":-1.276,"angle":4,"damage":[15,15],"rate":3,"type":1,"speed":[185,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.768,"y":-1.444,"z":-1.276,"angle":-4,"damage":[15,15],"rate":3,"type":1,"speed":[185,185],"number":1,"spread":0,"error":0,"recoil":0}],"radius":7.765}}',
                            '{"name":"Icarus","level":7,"model":4,"size":2.5,"specs":{"shield":{"capacity":[350,350],"reload":[11,11]},"generator":{"capacity":[250,250],"reload":[52,52]},"ship":{"mass":300,"speed":[110,110],"rotation":[55,55],"acceleration":[90,90]}},"bodies":{"main":{"section_segments":20,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-128,-115,-70,-40,0,40,60,75,90,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,24,20,20,27,29,26,20,0],"height":[0,5,13,30,20,10,10,15,15,15,10,0],"texture":[18,3,13,4,63,63,3,4,63,13,17],"propeller":true,"laser":{"damage":[170,170],"rate":1,"type":1,"speed":[150,150],"number":1,"error":0,"recoil":350}},"air":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-83,-80,-30,-10,10,30,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,23,25,35,30,30,32,20],"height":[0,10,10,10,10,10,10,10,15,15,15,10,10],"texture":[4,63,4,3,2,63,3]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":18},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-65,-25,0,25,60,90,100],"z":[0,0,0,0,-10,-8,-10]},"width":[0,10,13,10,20,15,10],"height":[0,15,20,10,10,10,10],"texture":[9,9,9,10,63,3]},"laser":{"section_segments":10,"offset":{"x":90,"y":0,"z":-19},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,40,70,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,4,3,13,17],"propeller":true,"angle":4,"laser":{"damage":[14,14],"rate":2,"type":1,"speed":[220,220],"number":1}},"laser2":{"section_segments":10,"offset":{"x":50,"y":-20,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,40,70,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,12,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,4,3,13,17],"propeller":true,"angle":2,"laser":{"damage":[23,23],"rate":2,"type":1,"speed":[190,190],"number":1}}},"wings":{"wings":{"offset":{"x":10,"y":0,"z":0},"length":[35,15,30,25],"width":[100,50,60,50,40],"angle":[-10,20,0,0],"position":[0,0,10,30,-10],"texture":[4,63,18,63],"doubleside":true,"bump":{"position":-20,"size":15}},"wings2":{"offset":{"x":10,"y":0,"z":0},"length":[35,15,30,20],"width":[100,50,60,50,25],"angle":[-10,20,0,0],"position":[0,0,10,30,65],"texture":[4,63,18,4],"doubleside":true,"bump":{"position":-20,"size":15}}},"typespec":{"name":"Icarus","level":7,"model":4,"code":704,"specs":{"shield":{"capacity":[400,400],"reload":[9,9]},"generator":{"capacity":[250,250],"reload":[52,52]},"ship":{"mass":300,"speed":[110,110],"rotation":[55,55],"acceleration":[90,90]}},"shape":[6.5,6.068,4.366,3.971,3.26,2.789,3.551,3.705,3.653,3.495,5.873,5.858,5.721,5.7,5.6,5.739,6.19,6.669,5.933,3.646,3.265,2.741,4.401,5.099,5.09,5.01,5.09,5.099,4.401,2.741,3.265,3.646,5.933,6.669,6.19,5.739,5.6,5.7,5.721,5.858,5.873,3.495,3.653,3.705,3.551,2.789,3.26,3.971,4.366,6.068],"lasers":[{"x":0,"y":-6.5,"z":0,"angle":0,"damage":[170,170],"rate":1,"type":1,"speed":[152,152],"number":1,"spread":0,"error":0,"recoil":350},{"x":4.395,"y":-1.496,"z":-0.95,"angle":4,"damage":[14,14],"rate":2,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.395,"y":-1.496,"z":-0.95,"angle":-4,"damage":[14,14],"rate":2,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.448,"y":-2.499,"z":-1,"angle":2,"damage":[23,23],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.448,"y":-2.499,"z":-1,"angle":-2,"damage":[23,23],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.669}}',
                            '{"name":"Kyvos","level":7,"model":5,"size":1.4,"zoom":0.97,"specs":{"shield":{"capacity":[280,280],"reload":[8,8]},"generator":{"capacity":[220,220],"reload":[60,60]},"ship":{"mass":250,"speed":[130,130],"rotation":[70,70],"acceleration":[130,130]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-157,-150,-114,-72,-22,5,20,80,102,130,160,150],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,26,30,37,38,31,29,28,26,24,0],"height":[0,11,25,26,29,35,39,30,27,26,24,0],"texture":[4,9,9,10,2,4,11,63,2,12,17],"laser":{"damage":[140,140],"rate":2,"type":1,"speed":[60,60],"number":1,"recoil":0},"propeller":true},"tubes":{"section_segments":8,"offset":{"x":35,"y":57,"z":0},"position":{"x":[-9,-11,-6,-9,-11,-13,-15,0,0,0],"y":[-188,-140,-99,-72,-36,0,49,75,115,110],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,22,21,25,22,23,30,16,12,0],"height":[0,13,16,18,15,15,14,14,13,0],"texture":[2,3,2,63,10,63,3,12,17],"propeller":true},"outsidethings":{"section_segments":8,"offset":{"x":36,"y":8,"z":0},"position":{"x":[-3,20,42,29,-7],"y":[-91,-60,-5,50,88],"z":[0,0,0,0,0,0,0]},"width":[13,13,16,16,20],"height":[8,11,13,13,8],"texture":[2,63,4,63],"propeller":false},"toptube":{"section_segments":8,"offset":{"x":0,"y":45,"z":27},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-110,-86,-44,16,39,60],"z":[-9,-4,0,0,-4,-12]},"width":[17,18,19,18,15,13],"height":[10,16,16,12,11,11],"texture":[3,63,11,3,13],"propeller":false}},"wings":{"wing0":{"doubleside":true,"length":[43,30,30],"width":[170,128,70,40],"angle":[0,-16,-19],"position":[0,28,54,54],"offset":{"x":40,"y":19,"z":0},"bump":{"position":25,"size":4},"texture":[4,3.3,63]},"nothing":{"doubleside":true,"length":[36,0],"width":[150,70,0],"angle":[-7,-7],"position":[0,0,0],"offset":{"x":40,"y":18,"z":-5},"bump":{"position":-22,"size":5},"texture":[111]},"winglet0":{"doubleside":true,"length":[34,23],"width":[70,59,30],"angle":[25,20],"position":[10,25,35],"offset":{"x":6,"y":46,"z":20},"bump":{"position":28,"size":7},"texture":[18,63]},"winglet1":{"doubleside":true,"length":[26,20],"width":[50,35,22],"angle":[-12,-12],"position":[8,20,18],"offset":{"x":46,"y":130,"z":-6},"bump":{"position":10,"size":6},"texture":[4,63]}},"typespec":{"name":"Kyvos","level":7,"model":5,"code":705,"specs":{"shield":{"capacity":[280,280],"reload":[9,9]},"generator":{"capacity":[220,220],"reload":[60,60]},"ship":{"mass":250,"speed":[130,130],"rotation":[70,70],"acceleration":[130,130]}},"shape":[4.956,4.773,3.84,3.194,2.808,2.59,2.49,2.435,2.409,2.367,2.396,2.47,2.59,2.773,3.065,4.221,4.479,4.711,4.608,4.373,4.755,5.13,5.101,4.993,4.903,3.927,4.903,4.993,5.101,5.13,4.755,4.373,4.608,4.711,4.479,4.221,3.065,2.773,2.59,2.47,2.396,2.367,2.409,2.435,2.49,2.59,2.808,3.194,3.84,4.773],"lasers":[{"x":0,"y":-4.956,"z":0,"angle":0,"damage":[140,140],"rate":2,"type":1,"speed":[65,65],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.13}}',
                            '{"name":"Bass-Cannon","level":7,"model":6,"size":3.4,"specs":{"shield":{"capacity":[600,600],"reload":[10,10]},"generator":{"capacity":[330,330],"reload":[120,120]},"ship":{"mass":520,"speed":[76,76],"rotation":[30,30],"acceleration":[70,70]}},"bodies":{"mainCannon":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-128,-127.5,-125,-127.5,-130,-125,-115,-80,80,95,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,7.5,15,20,25,27.5,27.5,25,20,0],"height":[0,3,7.5,15,20,25,25,25,25,20,0],"texture":[63,4,3,4,2,3,11,3,13,17],"propeller":true,"laser":{"damage":[60,60],"rate":0.36,"type":1,"speed":[115,115],"number":1,"angle":0,"error":0,"recoil":220}},"cannon2":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0],"y":[-128],"z":[0]},"width":[0],"height":[0],"texture":[63],"propeller":true,"laser":{"damage":[45,45],"rate":0.36,"type":1,"speed":[137,137],"number":2,"angle":6,"error":0}},"cannon3":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0],"y":[-128],"z":[0]},"width":[0],"height":[0],"texture":[63],"propeller":true,"laser":{"damage":[30,30],"rate":0.36,"type":1,"speed":[119,119],"number":6,"angle":35,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":70,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-75,-60,-45,-30,0,15,20],"z":[7.5,3,3,0,0,0,0,-4,0,0]},"width":[3,9,11,12,18,15,10,0],"height":[0,10,12,15,15,15,10,0],"texture":[9,9,9,4,10,63,4,3,63]},"side":{"section_segments":8,"offset":{"x":30,"y":10,"z":0},"position":{"x":[-5,-3,-1,0,0,0,0,0,-9],"y":[-100,-90,-70,-50,-15,20,35,60,95],"z":[0,0,0,0,0,0,0,0,3]},"width":[0,12,15,15,17,35,36,28,0],"height":[0,15,15,15,15,15,15,15,0],"texture":[3,63,3,10,63,4,11,2,13,3],"propeller":false},"side2":{"section_segments":8,"offset":{"x":20,"y":10,"z":5},"position":{"x":[-3,0,0,0,0,0,-3],"y":[-85,-45,0,40,75,95],"z":[10,0,0,0,0,0,0]},"width":[0,15,17,28,15,0],"height":[0,15,18,16,15,0],"angle":0,"propeller":false,"texture":[4,2,3,63,3,4]},"mid":{"section_segments":10,"offset":{"x":0,"y":-25,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-80,-70,-44,-5,40,80,115,120],"z":[8,1,1,0,0,0,0,0]},"width":[0,13,18,20,20,20,20,0],"height":[0,15,18,18,18,16,15,0],"angle":0,"propeller":false,"texture":[63,4,3,11,4,63,4]}},"wings":{"winglet":{"doubleside":true,"offset":{"x":10,"y":55,"z":30},"length":[20],"width":[50,35],"angle":[0],"position":[0,0],"texture":[3.5],"bump":{"position":10,"size":5}},"winglet2":{"doubleside":true,"offset":{"x":20,"y":-100,"z":0},"length":[17],"width":[30,20],"angle":[0],"position":[0,0],"texture":[3],"bump":{"position":10,"size":10}},"winglet3":{"doubleside":true,"offset":{"x":43,"y":-25,"z":0},"length":[16],"width":[80,125],"angle":[0],"position":[0,0],"texture":[3.5],"bump":{"position":10,"size":1}}},"typespec":{"name":"Bass-Cannon","level":7,"model":6,"code":706,"specs":{"shield":{"capacity":[600,600],"reload":[10,10]},"generator":{"capacity":[330,330],"reload":[110,110]},"ship":{"mass":520,"speed":[75,75],"rotation":[30,30],"acceleration":[75,75]}},"shape":[8.176,8.273,8.138,7.892,6.066,7.176,6.29,5.485,4.945,4.54,4.294,4.14,4.034,4.034,4.14,4.538,5.071,5.48,5.765,6.182,6.278,6.484,6.816,7.281,7.268,7.154,7.268,7.281,6.816,6.484,6.278,6.182,5.765,5.48,5.071,4.538,4.14,4.034,4.034,4.14,4.294,4.54,4.945,5.485,6.29,7.176,6.066,7.892,8.138,8.273],"lasers":[{"x":0,"y":-8.16,"z":0,"angle":0,"damage":[60,60],"rate":0.33,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":220},{"x":0,"y":-8.024,"z":0,"angle":0,"damage":[45,45],"rate":0.33,"type":1,"speed":[142,142],"number":2,"spread":6,"error":0,"recoil":0},{"x":0,"y":-8.024,"z":0,"angle":0,"damage":[30,30],"rate":0.33,"type":1,"speed":[124,124],"number":6,"spread":35,"error":0,"recoil":0}],"radius":8.273}}',
                            '{"name":"Bastion","level":7,"model":7,"size":3.2,"zoom":1.03,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[300,300],"reload":[95,95]},"ship":{"mass":420,"speed":[80,80],"rotation":[30,30],"acceleration":[90,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":30,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-50,-20,0,20,40,25],"z":[0,0,0,0,0,0,0]},"width":[0,5,22,18,16,15,0],"height":[0,2,12,16,16,15,0],"texture":[10,1,1,10,8,17],"propeller":true},"thrusters":{"section_segments":8,"offset":{"x":40,"y":23,"z":-24},"position":{"x":[0,0,0,0,0,0],"y":[-25,-20,0,20,40,30],"z":[0,0,0,0,0,0]},"width":[0,8,12,8,8,0],"height":[0,12,12,8,8,0],"texture":[63,2,2,2,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":10,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,-10,0,11,35],"z":[-5,-3,-1,0,0]},"width":[0,5,10,10,0],"height":[0,3,5,7,0],"texture":[9]},"cannon1":{"section_segments":4,"offset":{"x":10,"y":-100,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,2,4,7,3],"height":[0,1,3,6,0],"texture":[17,4],"laser":{"damage":[6,6],"rate":6,"type":1,"speed":[160,160],"number":1}},"cannon2":{"section_segments":4,"offset":{"x":42.5,"y":-149,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,2,4,7,3],"height":[0,1,3,6,0],"texture":[17,4],"angle":2,"laser":{"damage":[8,8],"rate":4,"type":1,"speed":[165,165],"number":1}},"cannon3":{"section_segments":4,"offset":{"x":75,"y":-125,"z":-8},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,2,4,7,3],"height":[0,1,3,6,0],"texture":[17,4],"angle":4,"laser":{"damage":[18,18],"rate":1.2,"type":1,"speed":[180,180],"number":1}}},"wings":{"main1":{"doubleside":true,"offset":{"x":9,"y":-5,"z":0},"length":[0,15,0,7],"width":[0,160,70,30,30],"angle":[0,20,0,-10],"position":[30,-20,30,30,30],"texture":[13,63,13,8],"bump":{"position":35,"size":5}},"main2":{"doubleside":true,"offset":{"x":30,"y":-5,"z":0},"length":[0,15,0,20],"width":[0,80,90,200,30],"angle":[30,30,30,30],"position":[30,30,10,-45,30],"texture":[13,3,13,4],"bump":{"position":35,"size":7}},"main3":{"doubleside":true,"offset":{"x":0,"y":5,"z":-7},"length":[45,35,0,20],"width":[40,40,40,200,40],"angle":[-20,20,-20,-5],"position":[20,30,0,-30,10],"texture":[0,8,13,63],"bump":{"position":35,"size":20}}},"typespec":{"name":"Bastion","level":7,"model":7,"code":707,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[300,300],"reload":[95,95]},"ship":{"mass":420,"speed":[80,80],"rotation":[30,30],"acceleration":[90,90]}},"shape":[4.867,7.069,10.527,9.455,9.861,9.25,8.281,7.253,6.749,6.417,6.187,6.076,6.095,6.133,6.28,6.485,6.469,6.534,6.727,6.796,5.069,4.774,4.582,4.582,4.561,4.489,4.561,4.582,4.582,4.774,5.069,6.796,6.727,6.534,6.469,6.485,6.28,6.133,6.095,6.076,6.187,6.417,6.749,7.253,8.281,9.25,9.861,9.455,10.527,7.069],"lasers":[{"x":0.64,"y":-7.04,"z":0.064,"angle":0,"damage":[6,6],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.64,"y":-7.04,"z":0.064,"angle":0,"damage":[6,6],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.698,"y":-10.176,"z":0.512,"angle":2,"damage":[8,8],"rate":4,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.698,"y":-10.176,"z":0.512,"angle":-2,"damage":[8,8],"rate":4,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":4.755,"y":-8.638,"z":-0.512,"angle":4,"damage":[18,18],"rate":1.2,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.755,"y":-8.638,"z":-0.512,"angle":-4,"damage":[18,18],"rate":1.2,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":10.527}}',
                            '{"name":"Shadow X-3","level":7,"model":8,"size":1.8,"zoom":1,"specs":{"shield":{"capacity":[260,260],"reload":[11,11]},"generator":{"capacity":[170,170],"reload":[58,58]},"ship":{"mass":220,"speed":[140,140],"rotation":[58,58],"acceleration":[105,105]}},"bodies":{"main":{"section_segments":20,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-125,-123,-110,-70,-40,0,40,70,80,90,100],"z":[0,0,0,-2,0,0,0,0,0,0,0]},"width":[0,5,10,20,30,20,20,30,30,30,20,0],"height":[0,5,10,20,20,20,20,15,15,15,10,10],"texture":[12,4,15,4,63,3,4,4,5]},"air":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-80,-30,-10,10,30,50],"z":[0,0,0,0,0,0,0]},"width":[0,5,35,30,30,32,20],"height":[0,15,10,10,10,10,10,15,15,15,10,10],"texture":[4,3,2,2,2,3]},"back":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,22,2],"height":[3,5,7,8,2],"texture":[63],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":18},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-25,0,25,60,90,100],"z":[0,0,0,0,-10,-8,-10]},"width":[0,10,15,10,20,15,10],"height":[0,10,20,20,20,15,10],"texture":[9,9,9,10,63,3]},"booster1":{"section_segments":10,"offset":{"x":32.5,"y":-15,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,-5,-10],"y":[-35,-25,0,10,20,25,30,40,70,90],"z":[0,0,0,0,0,0,0,0,5,10]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,3,4,3,4],"propeller":false,"laser":{"damage":[13,13],"rate":10,"type":1,"speed":[190,190],"number":1}},"booster2":{"section_segments":10,"offset":{"x":55,"y":5,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-35,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,12,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[4,4,10,3,4,3,13],"propeller":true}},"wings":{"wings":{"doubleside":true,"offset":{"x":10,"y":0,"z":5},"length":[28,10,15,40],"width":[100,60,80,50,70],"angle":[-10,5,0,-40],"position":[-40,0,40,10,70],"texture":[4,4,4,4],"bump":{"position":-20,"size":15}},"sideBack":{"doubleside":true,"offset":{"x":20,"y":68,"z":0},"length":[30],"width":[30,15],"angle":[-13],"position":[0,30],"texture":[63],"bump":{"position":10,"size":10}},"sideFront":{"doubleside":true,"offset":{"x":10,"y":-95,"z":0},"length":[30],"width":[30,15],"angle":[-13],"position":[0,40],"texture":[63],"bump":{"position":10,"size":10}},"top":{"doubleside":true,"offset":{"x":10,"y":60,"z":5},"length":[30],"width":[50,30],"angle":[50],"position":[0,50],"texture":[3],"bump":{"position":10,"size":10}}},"typespec":{"name":"Shadow X-3","level":7,"model":8,"code":708,"specs":{"shield":{"capacity":[260,260],"reload":[11,11]},"generator":{"capacity":[185,185],"reload":[55,55]},"ship":{"mass":235,"speed":[140,140],"rotation":[58,58],"acceleration":[105,105]}},"shape":[4.5,4.212,3.527,3.123,2.846,2.634,2.103,2.078,1.937,2.348,2.431,2.421,2.571,2.813,3.153,3.601,3.826,4.136,4.602,5.054,3.503,4.162,4.191,4.622,3.892,3.787,3.892,4.622,4.191,4.162,3.503,5.054,4.602,4.136,3.826,3.601,3.153,2.813,2.582,2.421,2.431,2.348,1.937,2.078,2.103,2.634,2.846,3.123,3.527,4.212],"lasers":[{"x":1.17,"y":-1.8,"z":-0.54,"angle":0,"damage":[13,13],"rate":10,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.17,"y":-1.8,"z":-0.54,"angle":0,"damage":[13,13],"rate":10,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.054}}',
                            '{"name":"Inertia","level":7,"model":9,"size":2.7,"zoom":1.04,"specs":{"shield":{"capacity":[550,550],"reload":[12,12]},"generator":{"capacity":[220,220],"reload":[80,80]},"ship":{"mass":500,"speed":[90,90],"rotation":[45,45],"acceleration":[63,63]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-125,-120,-110,-85,-70,-60,-20,0,40,70,90,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,25,30,37,36,35,33,32,28,20,0],"height":[0,15,25,27,28,27,26,25,23,22,18,15,0],"texture":[4,31,11,1,31,3,2,4,11,3,31,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-35,-25,-7,15,50,70,100],"z":[0,0,0,0,0,-1,-1.8]},"width":[0,8,13,15,18,16,5],"height":[0,10,15,15,12,11,5],"texture":[9,9,9,11,63,4,4]},"topengines":{"section_segments":8,"offset":{"x":25,"y":60,"z":18},"position":{"x":[-5,-5,-4,-2,-2,-2,-2,-2],"y":[-60,-55,-40,-6,15,45,58,53],"z":[-10,-10,-8,-2,-1,0,0,0]},"width":[0,7,9.5,12,12,11,9,0],"height":[0,7,9.5,10,10,11,9,0],"texture":[31,4,2,8,63,4,17],"propeller":true},"cannons":{"section_segments":12,"offset":{"x":36.1,"y":-50,"z":0},"position":{"x":[0,0.95,1,2,3,5,2,1,0,0],"y":[-30,-40,-38,-20,0,20,30,40,42],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,5,6,10,10,8,4,0],"height":[0,5,5,6,10,10,8,5,0],"texture":[17,31,12,31,8,3,3,31],"propeller":false,"angle":0,"laser":{"damage":[40,40],"rate":6,"type":1,"speed":[165,165],"recoil":85,"number":1,"error":0,"angle":0}},"sidetopengines":{"section_segments":8,"offset":{"x":50,"y":70,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-55,-60,-45,-15,10,45,58,53],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,7,10,15,14,15,12,9,0],"height":[0,7,10,15,12,14,12,9,0],"texture":[4,17,63,3,4,10,3,17],"propeller":true,"angle":0},"sidebottomengines":{"section_segments":8,"offset":{"x":65,"y":60,"z":-28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-55,-60,-40,5,25,45,58,53],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,15,13,14,12,9,0],"height":[0,7,10,15,13,14,12,9,0],"texture":[4,17,4,11,31,2,4,17],"propeller":true,"angle":0},"sides":{"section_segments":8,"offset":{"x":10,"y":-20,"z":0},"position":{"x":[-10,-2,0,5,7,0],"y":[-95,-90,-80,-40,-30,10],"z":[0,0,0,0,0,0]},"width":[0,10,15,20,20,0],"height":[0,15,22,26,21,0],"propeller":false,"texture":[4,31,10,31,31,2,12]}},"wings":{"cannonjointop":{"doubleside":true,"offset":{"x":6,"y":-50,"z":15},"length":[32,25],"width":[50,60,20],"angle":[-25,-20],"position":[20,0,15],"texture":[18,63],"bump":{"position":10,"size":5}},"cannonjoinbottom":{"doubleside":true,"offset":{"x":6,"y":-50,"z":-15},"length":[32,25],"width":[50,60,20],"angle":[25,20],"position":[20,0,15],"texture":[18,63],"bump":{"position":10,"size":5}},"enginejointop":{"doubleside":true,"offset":{"x":15,"y":55,"z":5},"length":[50],"width":[50,60],"angle":[38],"position":[20,0],"texture":[63],"bump":{"position":10,"size":10}},"enginejoinbottom":{"doubleside":true,"offset":{"x":15,"y":55,"z":0},"length":[62],"width":[50,60],"angle":[-30],"position":[20,0],"texture":[63],"bump":{"position":10,"size":10}}},"typespec":{"name":"Inertia","level":7,"model":9,"code":709,"specs":{"shield":{"capacity":[550,550],"reload":[12,12]},"generator":{"capacity":[220,220],"reload":[80,80]},"ship":{"mass":500,"speed":[85,85],"rotation":[45,45],"acceleration":[68,68]}},"shape":[6.21,6.114,5.861,5.364,5.334,4.452,4.145,4.029,3.901,3.6,2.613,2.308,3.695,4.212,4.458,4.613,4.865,5.229,5.808,6.607,7.481,7.531,7.611,7.268,6.487,5.952,6.487,7.268,7.611,7.531,7.481,6.607,5.808,5.229,4.865,4.613,4.458,4.212,4.05,2.308,2.613,3.6,3.901,4.029,4.145,4.452,5.334,5.364,5.861,6.114],"lasers":[{"x":2.001,"y":-4.86,"z":0,"angle":0,"damage":[40,40],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":85},{"x":-2.001,"y":-4.86,"z":0,"angle":0,"damage":[40,40],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":85}],"radius":7.611}}',
                            '{"name":"Sagittarius","level":7,"model":10,"size":1.6,"specs":{"shield":{"capacity":[400,400],"reload":[6,6]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":450,"speed":[80,80],"rotation":[30,30],"acceleration":[80,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-125,-90,-45,5,50,100,140,130],"z":[-6,-6,-6,-6,0,0,0,0,0,0,0]},"width":[0,12,20,22,35,45,30,25,0],"height":[0,6,15,15,18,22,24,20,0],"texture":[9,9,9,2,10,63,8,17],"propeller":true},"propulors":{"section_segments":8,"offset":{"x":48,"y":75,"z":5},"position":{"x":[-5,-5,0,0,0,0,0,0,0,0],"y":[-105,-95,-50,-10,30,100,140,130],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,14,25,22,30,35,25,0],"height":[0,14,25,22,30,35,25,0],"texture":[2,63,4,11,4,2,17],"propeller":true,"angle":0},"reinforcements":{"section_segments":8,"offset":{"x":100,"y":-115,"z":-30},"position":{"x":[0,0,0,20,5,8],"y":[-100,-93,-70,-20,35,100],"z":[-15,-15,-10,0,0,0]},"width":[0,10,14,18,13,0],"height":[0,10,14,15,13,0],"texture":[4,63,2,3,4],"propeller":false,"angle":45},"exhausts":{"section_segments":8,"offset":{"x":60,"y":25,"z":-20},"position":{"x":[0,0,-5,0,-10,-10,0,10,10,20,20],"y":[-130,-125,-80,-30,-10,10,40,60,100,130,110],"z":[-6,-6,-6,-6,-3,0,6,6,6,0,0]},"width":[0,10,15,20,20,15,15,20,25,20,0],"height":[0,10,15,20,20,15,15,20,25,20,0],"texture":[63,4,3,3,63,4,63,10,4,13],"propeller":false,"angle":15},"exhausts2":{"section_segments":8,"offset":{"x":70,"y":-15,"z":-40},"position":{"x":[-5,-5,-10,-10,0,-8,-4,8,10,20,20],"y":[-130,-125,-95,-60,-30,10,40,60,100,130,110],"z":[-6,-6,-6,-6,-6,-3,0,6,6,6,0,0]},"width":[0,10,15,20,20,15,20,25,25,20,0],"height":[0,10,15,20,20,15,20,25,25,20,0],"texture":[63,4,13,1,3,4,63,3,4,13],"propeller":false,"angle":30},"impulse":{"section_segments":12,"offset":{"x":0,"y":-65,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-160,-120,-140,-120,-100,-85,-70,-30,0,20,50,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,24,30,20,30,40,30,25,25,0],"height":[0,10,20,24,30,20,30,40,30,25,25,0],"texture":[6,18,13,4,63,63,8,4,4],"propeller":true,"angle":0,"laser":{"damage":[60,60],"rate":4,"type":1,"speed":[305,305],"number":1,"error":0,"angle":0,"recoil":150}}},"wings":{"topppp":{"offset":{"x":5,"y":85,"z":-2},"length":[60,60,80],"width":[100,90,60,20],"angle":[60,0,-30],"position":[-20,50,80,145],"texture":[3,11,3],"doubleside":true,"bump":{"position":0,"size":10}},"main":{"offset":{"x":0,"y":-15,"z":-35},"length":[50,60,120],"width":[100,70,50,20],"angle":[-40,0,30],"position":[-40,20,80,155],"texture":[2,63,1],"doubleside":true,"bump":{"position":0,"size":10}},"mainmain":{"offset":{"x":0,"y":-45,"z":-35},"length":[50,60,70],"width":[100,70,40,20],"angle":[-10,0,-30],"position":[-20,20,70,100],"texture":[2,4,1],"doubleside":true,"bump":{"position":0,"size":10}},"wing":{"offset":{"x":0,"y":-175,"z":-20},"length":[120],"width":[60,20],"angle":[-20],"position":[80,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":12}},"lets":{"offset":{"x":0,"y":-175,"z":-20},"length":[130],"width":[40,15],"angle":[-5],"position":[100,75],"texture":[63],"doubleside":true,"bump":{"position":0,"size":12}}},"typespec":{"name":"Sagittarius","level":7,"model":10,"code":710,"specs":{"shield":{"capacity":[500,500],"reload":[9,9]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":450,"speed":[80,80],"rotation":[30,30],"acceleration":[80,80]}},"shape":[7.2,6.591,6.154,5.938,6.933,6.732,5.953,5.661,5.541,5.676,5.866,3.021,3.342,4.051,5.491,5.82,5.969,7.996,8.057,6.169,9.307,8.58,7.266,7.234,7.004,5.931,7.004,7.234,7.266,8.58,9.307,6.169,8.057,7.996,5.969,5.82,5.491,4.051,3.342,3.021,5.866,5.676,5.541,5.661,5.953,6.732,6.933,5.938,6.154,6.591],"lasers":[{"x":0,"y":-7.2,"z":-1.28,"angle":0,"damage":[60,60],"rate":4,"type":1,"speed":[305,305],"number":1,"spread":0,"error":0,"recoil":150}],"radius":9.307}}',
                            '{"name":"Aries","level":7,"model":11,"size":3.9,"specs":{"shield":{"capacity":[750,750],"reload":[13,13]},"generator":{"capacity":[200,200],"reload":[95,95]},"ship":{"mass":600,"speed":[65,65],"rotation":[35,35],"acceleration":[95,95]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-60,-40,-30,-15,0,15,25,45,70],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,15,20,22,22,18,15,10,0],"height":[0,10,13,15,15,15,12,10,0],"texture":[2,15,15,3,4,3,63,15]},"mainlow":{"section_segments":6,"angle":0,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-80,-70,-10,10,60,70,85,90,85],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,12,12,15,20,20,16,0],"height":[0,10,12,8,12,12,8,12,10,7,0],"texture":[3.9,63,3.9,3.9,3.9,3.9,3.9,63,12.9,16.9],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":7},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-15,0,30,60],"z":[9,0,0,3,5]},"width":[3,12,15,10,0],"height":[0,20,24,19,0],"texture":[9,9,63,4]},"frontjoin":{"section_segments":6,"angle":45,"offset":{"x":8,"y":0,"z":-3},"position":{"x":[0,0,0,0],"y":[-60,-55,-40,-30],"z":[0,0,0,0]},"width":[0,10,15,10],"height":[0,10,12,8],"texture":[3.9,63,3.9]},"arm110":{"section_segments":6,"angle":110,"offset":{"x":10,"y":-10,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-10],"z":[0,0,0,0,0]},"width":[0,18,22,10,12],"height":[0,10,12,8,12],"texture":[3.9,63,3.9]},"arm140":{"section_segments":6,"angle":140,"offset":{"x":10,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-10],"z":[0,0,0,0,0]},"width":[0,18,22,10,12],"height":[0,10,12,8,12],"texture":[3.9,63,3.9]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-68,"z":0},"position":{"x":[0,0,0],"y":[-28,-30,-20],"z":[0,0,0]},"width":[0,10,8],"height":[0,5,5],"texture":[5.9],"laser":{"damage":[120,120],"rate":3,"type":1,"speed":[155,155],"number":1,"error":0,"recoil":150}},"spike1":{"section_segments":6,"offset":{"x":59,"y":15.5,"z":9},"position":{"x":[0,0,0,0,0,0],"y":[-35,-30,-20,0,10,12],"z":[0,0,0,0,-5,-10]},"width":[0,3,5,7,6,0],"height":[0,3,5,7,6,0],"texture":[2,3,12.9,3.9],"angle":-120,"laser":{"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"error":0,"recoil":0,"angle":180}},"spike2":{"section_segments":6,"offset":{"x":40,"y":58,"z":11},"position":{"x":[0,0,0,0,0,0],"y":[-35,-30,-20,0,10,12],"z":[0,0,0,0,-5,-10]},"width":[0,3,5,7,6,0],"height":[0,3,5,7,6,0],"texture":[2,3,12.9,3.9],"angle":215,"laser":{"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"error":0,"recoil":0,"angle":180}},"frontside":{"section_segments":6,"offset":{"x":38,"y":-35,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-35,-20,0,20,35,50],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,10,10,7,0],"height":[10,15,15,15,15,15,0],"texture":[2.9,63,3.9,3.9,63,2.9],"angle":18}},"wings":{"side_joins":{"offset":{"x":0,"y":5,"z":5},"length":[40,30],"width":[50,30,0],"angle":[30,-10],"position":[0,0,50],"texture":[11,3],"bump":{"position":10,"size":20}}},"typespec":{"name":"Aries","level":7,"model":11,"code":711,"specs":{"shield":{"capacity":[750,750],"reload":[13,13]},"generator":{"capacity":[200,200],"reload":[95,95]},"ship":{"mass":600,"speed":[63,63],"rotation":[35,35],"acceleration":[95,95]}},"shape":[7.659,7.674,7.149,6.467,6.039,5.561,5.132,4.793,4.558,4.415,4.346,4.278,5.332,5.896,6.029,7.427,5.82,5.603,6.593,6.339,8.225,7.32,6.398,7.159,7.488,7.425,7.488,7.159,6.398,7.32,8.225,6.339,6.593,5.603,5.82,7.427,6.029,5.896,5.332,4.278,4.346,4.415,4.558,4.793,5.132,5.561,6.039,6.467,7.149,7.674],"lasers":[{"x":0,"y":-7.644,"z":0,"angle":0,"damage":[120,120],"rate":3,"type":1,"speed":[155,155],"number":1,"spread":0,"error":0,"recoil":150},{"x":6.966,"y":2.574,"z":0.702,"angle":-120,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0},{"x":-6.966,"y":2.574,"z":0.702,"angle":120,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0},{"x":4.686,"y":6.76,"z":0.858,"angle":215,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0},{"x":-4.686,"y":6.76,"z":0.858,"angle":-215,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0}],"radius":8.225}}',
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
        let prevLength = 0;
        for (let i = 0; i < ships.length; i++) {
            let origin = ships[i].ORIGIN;
            let codes = ships[i].CODES;
            for (let j = 0; j < codes.length; j++) {
                let ship = codes[j];
                let jship = JSON.parse(ship);

                jship.level = this.tier;
                jship.model = prevLength + (this.tier == 1 ? j + 1 : j) + 1;
                jship.typespec.level = jship.level;
                jship.typespec.model = jship.model;
                jship.typespec.code = jship.level * 100 + jship.model;

                jship.origin = origin;

                jship.next = [];
                jship.typespec.next = [];

                this.normalShips.push(JSON.stringify(jship));

                jship.bodies.flag = ShipGroup.C.FLAG.FLAG_OBJ;
                jship.bodies.flagpole = ShipGroup.C.FLAG.FLAGPOLE_OBJ;
                jship.model = jship.model + totalLength;
                jship.typespec.model = jship.model;
                jship.typespec.code = jship.level * 100 + jship.model;

                jship.typespec.specs.ship.speed[1] *= ShipGroup.C.FLAG.FLAG_SPEED_REDUCTION;
                jship.specs.ship.speed[1] *= ShipGroup.C.FLAG.FLAG_SPEED_REDUCTION;
                jship.typespec.specs.ship.acceleration[1] *= ShipGroup.C.FLAG.FLAG_ACCELERATION_MULTIPLIER;
                jship.specs.ship.acceleration[1] *= ShipGroup.C.FLAG.FLAG_ACCELERATION_MULTIPLIER;
                jship.typespec.specs.ship.mass *= ShipGroup.C.FLAG.FLAG_MASS_MULTIPLIER;
                jship.specs.ship.mass *= ShipGroup.C.FLAG.FLAG_MASS_MULTIPLIER;

                let flagShip = JSON.stringify(jship);
                this.flagShips.push(flagShip);
            }
            prevLength += codes.length;
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

const Vector2 = class {
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

const Vector3 = class {
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

Game.setShipGroups();
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

    soundtrack: Game.C.OPTIONS.SOUNDTRACK,

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
