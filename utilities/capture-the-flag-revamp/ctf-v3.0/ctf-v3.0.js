/*
    CAPTURE THE FLAG (CTF)
    @author JavRedstone
    @version 3.0.0
*/

class Game {
    static shipGroups = [];
    shipGroup = null;

    ships = [];
    teams = [];

    aliens = [];
    asteroids = [];

    logoWaiting = null;

    flags = [];
    flagStands = [];

    portals = [];
    gravityWells = [];
    beacons = [];

    waiting = false;
    waitTimer = -1;

    roundTime = -1;
    timesUp = false;
    betweenTime = -1;
    totalScores = [0, 0];
    numRounds = 0;

    flagHolders = [null, null];
    flagDespawns = [-1, -1];

    static C = {
        OPTIONS: {
            ROOT_MODE: '',
            MAP_SIZE: 60,
            MAP: null,
            ASTEROIDS_STRENGTH: 1e6,
            CRYSTAL_DROP: 0,
            CRYSTAL_VALUE: 0,

            FRIENDLY_COLORS: 2,

            RADAR_ZOOM: 1,

            SPEED_MOD: 2,
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
            SHIP_MANAGER: 30,
            SHIP_MANAGER_FAST: 5,

            GAME_MANAGER: 30,

            FLAGHOLDER_DROP: 5400,
            FLAG_DESPAWN: 5400,

            WAIT: 1800,
            ROUND: 28800,
            BETWEEN: 360
        },
        IS_TESTING: false,
        IS_DEBUGGING: false,
        MIN_PLAYERS: 2,
        ROUND_MAX: 5,
        NUM_ROUNDS: 3
    }

    static setShipGroups() {
        Game.C.OPTIONS.SHIPS = ['{"name":"Invisible","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}', '{"name":"Invisible","level":2,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":2,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'];
        for (let group of ShipGroup.C.GROUPS) {
            let shipGroup = new ShipGroup(group.TIER, group.SHIPS);
            Game.shipGroups.push(shipGroup);
            Game.C.OPTIONS.SHIPS.push(...shipGroup.ships);
        }
    }

    constructor() {
        this.reset();
    }

    tick() {
        this.manageGameState();

        this.manageShips();
        this.spawnAliens();
        this.spawnCollectibles();

        this.manageEntities();
    }

    reset() {
        this.deleteEverything();
        this.resetContainers();
        this.selectRandomTeams();
        this.setMap();
        this.setShipGroup();
        this.spawnFlags();
        this.spawnPortals();
        this.resetShips();
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

        this.deleteFlags();
        this.deletePortals();
        this.deleteBeacons();

        game.removeObject();
    }

    deleteFlags() {
        for (let flag of this.flags) {
            flag.destroySelf();
        }
        this.flags = [];
        for (let flagStand of this.flagStands) {
            flagStand.destroySelf();
        }
        this.flagStands = [];
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

    resetContainers() {
        this.flagHolders = [null, null];
        this.flagDespawns = [-1, -1];
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

    spawnFlags() {
        this.deleteFlags();
        if (this.map) {
            for (let i = 0; i < this.map.flags.length; i++) {
                let flagPos = this.map.flags[i];
                let flag = new Obj(
                    Obj.C.OBJS.FLAG.id,
                    Obj.C.OBJS.FLAG.type,
                    new Vector3(flagPos.x, flagPos.y, Obj.C.OBJS.FLAG.position.z),
                    new Vector3(Obj.C.OBJS.FLAG.rotation.x, Obj.C.OBJS.FLAG.rotation.y, Obj.C.OBJS.FLAG.rotation.z),
                    new Vector3(Obj.C.OBJS.FLAG.scale.x, Obj.C.OBJS.FLAG.scale.y, Obj.C.OBJS.FLAG.scale.z),
                    true,
                    true,
                    this.teams[i].hex
                ).update();
                let flagStand = new Obj(
                    Obj.C.OBJS.FLAGSTAND.id,
                    Obj.C.OBJS.FLAGSTAND.type,
                    new Vector3(flagPos.x, flagPos.y, Obj.C.OBJS.FLAGSTAND.position.z),
                    new Vector3(Obj.C.OBJS.FLAGSTAND.rotation.x, Obj.C.OBJS.FLAGSTAND.rotation.y, Obj.C.OBJS.FLAGSTAND.rotation.z),
                    new Vector3(Obj.C.OBJS.FLAGSTAND.scale.x, Obj.C.OBJS.FLAGSTAND.scale.y, Obj.C.OBJS.FLAGSTAND.scale.z),
                    true,
                    true,
                    this.teams[i].hex
                ).update();
                this.flags.push(flag);
                this.flagStands.push(flagStand);
            }
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

        if (resetTeam) {
            if (!this.teams[1].hasShip(ship) && this.teams[0].ships.length <= this.teams[1].ships.length) {
                ship.setTeam(this.teams[0]);
            }
            else if (!this.teams[0].hasShip(ship) && this.teams[1].ships.length < this.teams[0].ships.length) {
                ship.setTeam(this.teams[1]);
            }

            ship.setType(Helper.getRandomArrayElement(this.shipGroup.chosenTypes));
        }

        if (this.waiting) {
            ship.setPosition(new Vector2(0, 0));
        } else {
            if (this.map) {
                ship.setPosition(this.map.spawns[ship.team.team])
            }
        }
    }

    newRound() {
        this.reset();
        for (let ship of this.ships) {
            ship.chooseShipTime = game.step;
        }
        this.numRounds++;
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
                if (!this.waiting || this.waitTimer != -1) {
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
                    this.newRound();
                }
    
                if (this.roundTime != -1) {
                    if (game.step - this.roundTime > Game.C.TICKS.ROUND) {
                        this.roundTime = -1;
                        this.betweenTime = game.step;
                        this.timesUp = true;
                    }
                }
    
                if (this.betweenTime != -1) {
                    this.roundTime = -1;
                    if (game.step - this.betweenTime > Game.C.TICKS.BETWEEN) {
                        this.betweenTime = -1;
                        let winningTeam = this.getWinningTeam();
                        if (winningTeam != null) {
                            this.totalScores[winningTeam.team]++;
                        }
    
                        this.teams[0].setScore(0);
                        this.teams[1].setScore(0);
    
                        if (this.numRounds < Game.C.NUM_ROUNDS) {
                            this.newRound();
                        } else {
                            this.gameOver();
                        }
                    }
                }
    
                if (this.betweenTime == -1 && (this.teams[0].score >= Game.C.ROUND_MAX || this.teams[1].score >= Game.C.ROUND_MAX)) {
                    this.roundTime = -1;
                    this.betweenTime = game.step;
                }
    
                for (let i = 0; i < this.flagDespawns.length; i++) {
                    if (this.flagDespawns[i] != -1) {
                        if (game.step - this.flagDespawns[i] > Game.C.TICKS.FLAG_DESPAWN) {
                            this.flagDespawns[i] = -1;
                            this.flags[i].reset();
                        }
                    }
                }
    
                for (let i = 0; i < this.flagHolders.length; i++) {
                    if (this.flagHolders[i] != null) {
                        if (this.flagHolders[i].hasFlag && this.flagHolders[i].flagTime != -1) {
                            if (game.step - this.flagHolders[i].flagTime > Game.C.TICKS.FLAGHOLDER_DROP) {
                                let opp = (i + 1) % 2;
                                this.flagHolders[i].flagTime = -1;
                                this.flagHolders[i].hasFlag = false;
                                this.flagHolders[i].setType(this.flagHolders[i].chosenType == 0 ? this.flagHolders[i].ship.type - this.shipGroup.normalShips.length : this.flagHolders[i].chosenType);
                                this.flagHolders[i].setMaxStats();
                                this.flagHolders[i].setHue(this.flagHolders[i].team.hue);
                                this.flagHolders[i].hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                this.flagHolders[i] = null;
    
                                this.flags[opp].show();
                            }
                        }
                    }
                }
            }
    
            if (this.waiting) {
                if (this.map && game.step % Obj.C.OBJS.BEACON.SPAWN_RATE == 0) {
                    for (let i = 0; i < Obj.C.OBJS.BEACON.SPAWN_AMOUNT; i++) {
                        let randPos = Helper.getRandomArrayElement(this.map.spawnArea);
                        this.spawnBeacon(randPos, Helper.getRandomLightHex());
                    }
                }
            }
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
                    if (ship.ship == gameShip) {
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
                } else {
                    if (ship.chosenType == 0) {
                        ship.setPosition(this.map.spawns[ship.team.team]);
                        ship.setVelocity(new Vector2(0, 0));
                        ship.setType(101);
                        ship.setCrystals(0);
                        ship.setCollider(false);
                    }

                    if (this.betweenTime != -1) {
                        ship.setCollider(false);
                        ship.setInvulnerable(Ship.C.INVULNERABLE_TIME);

                        if (ship.hasFlag) {
                            let opp = (ship.team.team + 1) % 2;

                            ship.hasFlag = false;
                            ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                            ship.setMaxStats();
                            ship.setHue(ship.team.hue);

                            this.flagHolders[ship.team.team] = null;

                            this.flags[opp].show();
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
                        if (ship.hasFlag) {
                            let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                            bottomMessage.components[1].value = 'Time left for holding the flag: ' + Helper.formatTime((Game.C.TICKS.FLAGHOLDER_DROP - (game.step - ship.flagTime)));
                            ship.sendUI(bottomMessage);
                        }

                        if (ship.chooseShipTime != -1 && game.step - ship.chooseShipTime < Ship.C.CHOOSE_SHIP_TIME) {
                            ship.choosingShip = true;
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
                                chooseShip.components[8].value = Math.floor(this.shipGroup.chosenTypes[i] / 100);
                                ship.sendUI(chooseShip);
                            }
                            let chooseShipTime = Helper.deepCopy(UIComponent.C.UIS.CHOOSE_SHIP_TIME);
                            chooseShipTime.components[0].value = Helper.formatTime(ship.chooseShipTime - (game.step - Ship.C.CHOOSE_SHIP_TIME));
                            ship.sendUI(chooseShipTime);
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
                            }
                        }

                        if (ship.ship.alive && ship.ship.type != 101) {
                            for (let i = 0; i < this.map.flags.length; i++) {
                                let opp = (i + 1) % 2;
                                let flagPos = new Vector2(this.flags[i].obj.position.x, this.flags[i].obj.position.y);
                                if (flagPos.getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.FLAG.DISTANCE) {
                                    if (this.flagHolders[opp] == null && !ship.hasFlag && this.teams[i].team != ship.team.team) {
                                        ship.hasFlag = true;
                                        ship.flagTime = game.step;
                                        ship.setType((ship.chosenType == 0 ? ship.ship.type : ship.chosenType) + this.shipGroup.normalShips.length);
                                        ship.setMaxStats();
                                        ship.setHue(ship.team.flagged);

                                        this.flagHolders[opp] = ship;

                                        this.flags[i].hide();

                                        this.sendNotifications(`${ship.ship.name} has stolen ${this.teams[i].color.toUpperCase()} team's flag!`, `Bring it back to ${ship.team.color.toUpperCase()} team's stand to score a point.`, ship.team);
                                    }
                                    if (!flagPos.equals(this.map.flags[i]) && this.teams[i].team == ship.team.team) {
                                        this.flags[i].reset();

                                        this.sendNotifications(`${ship.ship.name} has returned the ${this.teams[i].color.toUpperCase()} team's flag!`, `Chance for ${this.teams[(ship.team.team + 1) % 2].color.toUpperCase()} team is over.`, ship.team);
                                    }
                                }
                                if (this.map.flags[i].getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) < Obj.C.OBJS.FLAG.DISTANCE) {
                                    if (ship.hasFlag && this.teams[i].team == ship.team.team) {
                                        ship.hasFlag = false;
                                        ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                                        ship.setMaxStats();
                                        ship.setHue(ship.team.hue);
                                        ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);
                                        ship.setScore(ship.score + 1);
                                        ship.setTotalScore(ship.totalScore + 1);
                                        this.flagHolders[i] = null;

                                        ship.team.setScore(ship.team.score + 1);

                                        this.flags[opp].reset();
                                        this.flags[opp].show();

                                        this.sendNotifications(`${ship.ship.name} has scored a point for the ${ship.team.color.toUpperCase()} team!`, `Will ${this.teams[opp].color.toUpperCase()} team score next?`, ship.team);

                                        this.spawnBeacon(flagPos, this.teams[i].hex);
                                    }

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

                    let mapAuthor = Helper.deepCopy(UIComponent.C.UIS.MAP_AUTHOR);
                    mapAuthor.components[2].value += this.map.name + " by " + this.map.author;
                    ship.sendUI(mapAuthor);

                    let radarBackground = Helper.deepCopy(UIComponent.C.UIS.RADAR_BACKGROUND);
                    if (this.map) {
                        for (let i = 0; i < this.map.flags.length; i++) {
                            let flag = this.flags[i];
                            let flagStand = this.flagStands[i];

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(flagStand.obj.position.x, flagStand.obj.position.y, 100, 100),
                                value: '⬡',
                                color: this.teams[i].hex
                            });

                            if (flag.obj.scale.x > 0.1) {
                                radarBackground.components.push({
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(flag.obj.position.x, flag.obj.position.y, 50, 50),
                                    value: '⚐',
                                    color: this.teams[i].hex
                                });
                            }
                        }
                        for (let i = 0; i < this.map.portals.length; i++) {
                            let portal = this.portals[i];

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(portal.obj.position.x, portal.obj.position.y, 120, 120),
                                value: '⬡',
                                color: '#00ff0080'
                            });

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(portal.obj.position.x, portal.obj.position.y, 80, 80),
                                value: '⬡',
                                color: '#00ff0060'
                            });

                            radarBackground.components.push({
                                type: 'text',
                                position: Helper.getRadarSpotPosition(portal.obj.position.x, portal.obj.position.y, 40, 40),
                                value: '⬡',
                                color: '#00ff0040'
                            });
                        }
                        for (let i = 0; i < this.map.spawns.length; i++) {
                            let spawn = this.map.spawns[i];
                            radarBackground.components.push({
                                type: 'round',
                                position: Helper.getRadarSpotPosition(spawn.x, spawn.y, 25, 25),
                                fill: this.teams[i].hex + '80'
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

                        let firstScore = this.teams[0].score;
                        let secondScore = this.teams[1].score;
                        let total = firstScore + secondScore;
                        if (total == 0) {
                            total = 2;
                            firstScore = 1;
                            secondScore = 1;
                        }
                        topMessage.components[0].position[2] = 100 * firstScore / total;
                        topMessage.components[0].fill = this.teams[0].hex + '66';
                        topMessage.components[1].position[0] = 100 * firstScore / total;
                        topMessage.components[1].position[2] = 100 * secondScore / total;
                        topMessage.components[1].fill = this.teams[1].hex + '66';

                        topMessage.components[2].value = `Round ${this.numRounds} of ${Game.C.NUM_ROUNDS}`;

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
                if (!this.waiting && this.betweenTime == -1 && ship.ship.alive && ship.ship.type != 101) {
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
            ship.sendTimedUI(notification, TimedUI.C.NOTIFICATION_TIME);
        }
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
                ship.setPosition(this.map.spawns[ship.team.team]);
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
            if (ship.hasFlag) {
                let opp = (ship.team.team + 1) % 2;
                this.flags[opp].obj.position.x = ship.ship.x;
                this.flags[opp].obj.position.y = ship.ship.y;
                this.flags[opp].show();

                this.flagDespawns[opp] = game.step;

                ship.hasFlag = false;
                ship.setType(ship.chosenType == 0 ? ship.ship.type - this.shipGroup.normalShips.length : ship.chosenType);
                ship.setHue(ship.team.hue);
                ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);

                this.flagHolders[ship.team.team] = null;

                this.sendNotifications(`${ship.ship.name} has dropped the flag!`, `Will ${ship.team.color.toUpperCase()} team steal it again?`, this.teams[opp]);
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
}

class Ship {
    team = null;
    ship = null;

    allUIs = [];
    timedUIs = [];

    done = false;

    chosenType = 0;

    score = 0;
    totalScore = 0;

    chooseShipTime = -1;
    choosingShip = false;

    flagTime = -1;
    hasFlag = false;

    portalTime = -1;

    static C = {
        INVULNERABLE_TIME: 360,
        CHOOSE_SHIP_TIME: 600,
        PORTAL_TIME: 3600
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

        this.chosenType = 0;
        this.hasFlag = false;
        this.score = 0;
    }

    sendUI(ui, hideMode = false) {
        // TODO: CONVERT HEX CODES TO HSL

        if (this.ship != null) {
            this.ship.setUIComponent(Helper.deepCopy(ui));

            if (!hideMode) {
                let removedUIs = [];
                for (let u of this.allUIs) {
                    if (u.id == ui.id) {
                        removedUIs.push(u);
                    }
                }
                for (let u of removedUIs) {
                    Helper.deleteFromArray(this.allUIs, u);
                }
                this.allUIs.push(ui);
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

    sendTimedUI(ui, time) {
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

    setTotalScore(totalScore) {
        this.totalScore = totalScore;
        return this;
    }

    setType(type) {
        this.ship.type = type;
        if (game.ships.includes(this.ship)) {
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
            this.asteroid.setPosition(this.initialPos.clone().add(this.velocity.clone().multiply(game.step - this.initTime)));
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
                    emissiveColor: '#ffffff',
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
                    emissiveColor: '#ffffff',
                    transparent: false
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
                    emissiveColor: '#ffffff',
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
                INTENSITY: 1,
                SUCK_FACTOR: 3
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
            type: Helper.deepCopy(type),
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
        LOGO_TIME: 480,
        NOTIFICATION_TIME: 300,
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
                        position: [0, 0, 50, 100],
                    },
                    {
                        type: 'box',
                        position: [50, 0, 50, 100],
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
                        value: "Ship Tier",
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
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9                99999999999999999999999999                9\n" +
                    "9 9999 9999 9999999         9999         9999999 9999 9999 9\n" +
                    "9 9 9   9 9 9  999                        999  9 9 9   9 9 9\n" +
                    "9 99     99 9 999                          999 9 99     99 9\n" +
                    "9 9  999  9 9999     99   99999999   99     9999 9  999  9 9\n" +
                    "9    99 9   999       99   999999   99       999   9 99    9\n" +
                    "9 9  9 99  999         99   9999   99         999  99 9  9 9\n" +
                    "9 99  999 9999          99        99          9999 999  99 9\n" +
                    "9 9 9    99999      9    99      99    9      99999    9 9 9\n" +
                    "9 9999  999 99     999    99    99    999     99 999  9999 9\n" +
                    "9      999  99    99999    99  99    99999    99  999      9\n" +
                    "9 999999999999   9999999    9  9    9999999   999999999999 9\n" +
                    "9 9  999999999                                999999999  9 9\n" +
                    "9 9 999                                              999 9 9\n" +
                    "9 9999                                                9999 9\n" +
                    "9 999        9   9999999   9    9   9999999   9        999 9\n" +
                    "9999          9   99999   9      9   99999   9          9999\n" +
                    "999            9   999   9        9   999   9            999\n" +
                    "999             9   9   9    99    9   9   9             999\n" +
                    "999       99                9999                99       999\n" +
                    "999      99                99  99                99      999\n" +
                    "999     99                995  599                99     999\n" +
                    "999    99                99  55  99                99    999\n" +
                    "99    999                99  55  99                999    99\n" +
                    "9     999     99          995  599          99     999     9\n" +
                    "      999    99    9       99  99       9    99    999      \n" +
                    "     9999   99    99  9     9999     9  99    99   9999     \n" +
                    "    99 99   99   999  99     99     99  999   99   99 99    \n" +
                    "   99  99   99  9999  999    99    999  9999  99   99  99   \n" +
                    "   99  99   99  9999  999    99    999  9999  99   99  99   \n" +
                    "    99 99   99   999  99     99     99  999   99   99 99    \n" +
                    "     9999   99    99  9     9999     9  99    99   9999     \n" +
                    "      999    99    9       99  99       9    99    999      \n" +
                    "9     999     99          995  599          99     999     9\n" +
                    "99    999                99  55  99                999    99\n" +
                    "999    99                99  55  99                99    999\n" +
                    "999     99                995  599                99     999\n" +
                    "999      99                99  99                99      999\n" +
                    "999       99                9999                99       999\n" +
                    "999             9   9   9    99    9   9   9             999\n" +
                    "999            9   999   9        9   999   9            999\n" +
                    "9999          9   99999   9      9   99999   9          9999\n" +
                    "9 999        9   9999999   9    9   9999999   9        999 9\n" +
                    "9 9999                                                9999 9\n" +
                    "9 9 999                                              999 9 9\n" +
                    "9 9  999999999                                999999999  9 9\n" +
                    "9 999999999999   9999999    9  9    9999999   999999999999 9\n" +
                    "9      999  99    99999    99  99    99999    99  999      9\n" +
                    "9 9999  999 99     999    99    99    999     99 999  9999 9\n" +
                    "9 9 9    99999      9    99      99    9      99999    9 9 9\n" +
                    "9 99  999 9999          99        99          9999 999  99 9\n" +
                    "9 9  9 99  999         99   9999   99         999  99 9  9 9\n" +
                    "9    99 9   999       99   999999   99       999   9 99    9\n" +
                    "9 9  999  9 9999     99   99999999   99     9999 9  999  9 9\n" +
                    "9 99     99 9 999                          999 9 99     99 9\n" +
                    "9 9 9   9 9 9  999                        999  9 9 9   9 9 9\n" +
                    "9 9999 9999 9999999         9999         9999999 9999 9999 9\n" +
                    "9                99999999999999999999999999                9\n" +
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
                map: "9999999999999999999997999    99    9999999999999999999999999\n" +
                    "97      79    99  9977779          9777799  99    97      79\n" +
                    "9 7    7 9    99999975579          9755799  99    9 7    7 9\n" +
                    "9  7  7  9    99  9975579          9755799  99    9  7  7  9\n" +
                    "9   77   9    99999975579          97557999999    9   77   9\n" +
                    "9   77   9    99999977779          97777999999    9   77   9\n" +
                    "9  7  7  9    99  9999999          9999999  99    9  7  7  9\n" +
                    "9 7    7 9    999999                    99  99    9 7    7 9\n" +
                    "97      79    99  99                    99  99    97      79\n" +
                    "99999999999999999999                    999999    9999999999\n" +
                    "9        99999999999                    999999   7         9\n" +
                    "9        99    99999                        99  7          9\n" +
                    "9        99     999                         99 7           9\n" +
                    "9        99      9                          997            9\n" +
                    "99999999999                                 9999999999999999\n" +
                    "999999999999                                9999999999999999\n" +
                    "9   99   9999                                    99 9 99 9 9\n" +
                    "9   99   99999               99                  99 9 99 9 9\n" +
                    "9999999999999         9999999999                 99999999999\n" +
                    "977799999999           999999  99     99         99999999999\n" +
                    "9777779                 9999    99    99             9777779\n" +
                    "9755579                  99      99                  9755579\n" +
                    "9755579           9     999       99     99          9755579\n" +
                    "9777779           99   999         99    99          9777779\n" +
                    "9999999           999 9977777777777799               9999999\n" +
                    "                  9999997    55    7 99     99              \n" +
                    "                  99999 7   5  5   7  99    99              \n" +
                    "                  999   7  5    5  7   99                   \n" +
                    "                  99    7 5 3333 5 7    99                  \n" +
                    "9                99     75  3  3  57     99                9\n" +
                    "9                99     75  3  3  57     99                9\n" +
                    "                  99    7 5 3333 5 7    99                  \n" +
                    "                   99   7  5    5  7   999                  \n" +
                    "              99    99  7   5  5   7 99999                  \n" +
                    "              99     99 7    55    7999999                  \n" +
                    "9999999               9977777777777799 999           9999999\n" +
                    "9777779          99    99         999   99           9777779\n" +
                    "9755579          99     99       999     9           9755579\n" +
                    "9755579                  99      99                  9755579\n" +
                    "9777779             99    99    9999                 9777779\n" +
                    "99999999999         99     99  999999           999999999999\n" +
                    "99999999999                 9999999999         9999999999999\n" +
                    "9 9 99 9 99                  99               99999   99   9\n" +
                    "9 9 99 9 99                                    9999   99   9\n" +
                    "9999999999999999                                999999999999\n" +
                    "9999999999999999                                 99999999999\n" +
                    "9            799                          9      99        9\n" +
                    "9           7 99                         999     99        9\n" +
                    "9          7  99                        99999    99        9\n" +
                    "9         7   999999                    99999999999        9\n" +
                    "9999999999    999999                    99999999999999999999\n" +
                    "97      79    99  99                    99  99    97      79\n" +
                    "9 7    7 9    99  99                    999999    9 7    7 9\n" +
                    "9  7  7  9    99  9999999          9999999  99    9  7  7  9\n" +
                    "9   77   9    99999977779          97777999999    9   77   9\n" +
                    "9   77   9    99999975579          97557999999    9   77   9\n" +
                    "9  7  7  9    99  9975579          9755799  99    9  7  7  9\n" +
                    "9 7    7 9    99  9975579          97557999999    9 7    7 9\n" +
                    "97      79    99  9977779          9777799  99    97      79\n" +
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
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "933333333333333333339333333333333333333393333333333333333333\n" +
                    "937777737777737777739377777377777377777393777773777773777773\n" +
                    "937333333373337333339373333333733373333393733333337333733333\n" +
                    "937333333373337777739373333333733377777393733333337333777773\n" +
                    "937333333373337333339373333333733373333393733333337333733333\n" +
                    "937777733373337333339377777333733373333393777773337333733333\n" +
                    "933333333333333333339333333333333333333393333333333333333333\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9                                                          9\n" +
                    "9                                                          9\n" +
                    "9                                                          9\n" +
                    "9                                                          9\n" +
                    "9                  99                   99                 9\n" +
                    "9                99999                 99999               9\n" +
                    "9              99955599               99555999             9\n" +
                    "9            99955555599             99555555999           9\n" +
                    "9          99955555555599           99555555555999         9\n" +
                    "9        99955555555555599         99555555555555999       9\n" +
                    "9       9955555555555555999       9995555555555555799      9\n" +
                    "9        9955555555555999 99     99 9995555555555597       9\n" +
                    "9         9955555555999    99   99    9995555555599        9\n" +
                    "9          9955555999       99 99       9995555599         9\n" +
                    "99          9955999          999          9995599         99\n" +
                    "999          9999            999            9999         999\n" +
                    "9999          9             99 99             9         9999\n" +
                    "                           99   99                          \n" +
                    "       9                  99     99                 9       \n" +
                    "      99999           99999       9999           99999      \n" +
                    "       9              9999         999              9       \n" +
                    "                      999           99                      \n" +
                    "9999              9   99             99  9              9999\n" +
                    "999               9  99       999     99 9               999\n" +
                    "99       5        9 99        95999    999        5       99\n" +
                    "9       55        999         9555999   99        55       9\n" +
                    "9      5 5        99          955555999  99       5 5      9\n" +
                    "9      5 5       99           955555559   99      5 5      9\n" +
                    "9      55       99            999555759    99      55      9\n" +
                    "9      5       99             9 9995559     99      5      9\n" +
                    "9      5                      9   99959             5      9\n" +
                    "9      5                      9     999             5      9\n" +
                    "99                            9                           99\n" +
                    "999                         99999                        999\n" +
                    "9 99                     9999 9 9999                    99 9\n" +
                    "9  99                  999   797   999                 99  9\n" +
                    "9   99                99    7 9 7    99               99   9\n" +
                    "9    99               999    797    999              99    9\n" +
                    "9     99              9  999     999  9             99     9\n" +
                    "9      99             99    99999    99            99      9\n" +
                    "9       99             999         999            99       9\n" +
                    "9 777777 99              9999   9999             99 777777 9\n" +
                    "9 733337  99                99999               99  733337 9\n" +
                    "9 733337   99                                  99   733337 9\n" +
                    "9 777777    99                                99    777777 9\n" +
                    "9      7     99                              99     7      9\n" +
                    "9      7      99                            99      7      9\n" +
                    "9      7       99                          99       7      9\n" +
                    "9      7        99                        99        7      9\n" +
                    "9                99                      99                9\n" +
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
                map: "335579999999999999999933399939939993339999999999999999975533\n" +
                    "355799999999999999999999939399993939999999999999999999997553\n" +
                    "5579999999          99999939999993999999          9999999755\n" +
                    "779999 99            999399939939993999            99 999977\n" +
                    "779999999            999339339933933999            999999977\n" +
                    "779999 99            999933399993339999            99 999977\n" +
                    "577999999            999993999999399999            999999775\n" +
                    "357799 99  999  999  999999999999999999  999  999  99 997753\n" +
                    "355799999  999  999  999 7999779997 999  999  999  999997553\n" +
                    "557799999  999  999  999  999  999  999  999  999  999997755\n" +
                    "55799999    7    9    9    9    9    9    9    7    99999755\n" +
                    "5799999          7    7    7    7    7    7          9999975\n" +
                    "799999                                                999997\n" +
                    "99999                                                  99999\n" +
                    "9999    898   99   99   99   99   99   99   99   988    9999\n" +
                    "999      9    89    8    9   89   9    8    98    9      999\n" +
                    "999                                                      999\n" +
                    "9999                                                    9999\n" +
                    "99999                                                  99999\n" +
                    "9  998  99    99    99    99    99    99    99    99  899  9\n" +
                    "9  998  9     99    9     99    99     9    99     9  899  9\n" +
                    "99999                                                  99999\n" +
                    "9999                                                    9999\n" +
                    "999                                                      999\n" +
                    "99   98    89    88          66          88    98    89   99\n" +
                    "99   9      9    99          88          99    9      9   99\n" +
                    "999                          99                          999\n" +
                    "9999                        9999                        9999\n" +
                    "99999                      995599                      99999\n" +
                    "9  998  99    89      6789995555999876      98    99  899  9\n" +
                    "9  998  99    89      6789995555999876      98    99  899  9\n" +
                    "99999                      995599                      99999\n" +
                    "9999                        9999                        9999\n" +
                    "999                          99                          999\n" +
                    "99   9      9    89          88          99    9      9   99\n" +
                    "99   98    89    88          66          88    98    89   99\n" +
                    "999                                                      999\n" +
                    "9999                                                    9999\n" +
                    "99999                                                  99999\n" +
                    "9  998  9     98    9     99    99     9    99     9  899  9\n" +
                    "9  998  99    99    99    99    99    98    98    99  899  9\n" +
                    "99999                                                  99999\n" +
                    "9999                                                    9999\n" +
                    "999                                                      999\n" +
                    "999      9    89    8    9   99   9    8    98    9      999\n" +
                    "9999    899   99   99   99   99   99   99   99   998    9999\n" +
                    "99999                                                  99999\n" +
                    "799999                                                999997\n" +
                    "5799999          7    7    7    7    7    7          9999975\n" +
                    "55799999    7    9    9    9    9    9    9    7    99999755\n" +
                    "557799999  999  999  999  999  999  999  999  999  999997755\n" +
                    "355799999  999  999  999 7999779997 999  999  999  999997553\n" +
                    "357799 99  999  999  999999999999999999  999  999  99 997753\n" +
                    "577999999            999993999999399999            999999775\n" +
                    "779999 99            999933399993339999            99 999977\n" +
                    "779999999            999339339933933999            999999977\n" +
                    "779999 99            999399939939993999            99 999977\n" +
                    "5579999999          99999939999993999999          9999999755\n" +
                    "355799999999999999999999939399993939999999999999999999997553\n" +
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
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9   999  999  9999999999999999999999999999999999999999999999\n" +
                    "9   999  999  9999999  9999 99999999999999999999999999999999\n" +
                    "9   99999999999999999  999   9999999999999999999999999999999\n" +
                    "9999999999999999999999999     999999999999999999999999999999\n" +
                    "99999               9999   9   99999999999999999999999999999\n" +
                    "99999               999   999   9999999999999999999999999999\n" +
                    "9  99           99  99    9999   9999999999999999999 9999999\n" +
                    "9  99   9999    99  9      9999   9999999999999999  99999999\n" +
                    "99999   999                 9999   999999999999999  99999999\n" +
                    "99999   99                   9999   99999999999   9999999999\n" +
                    "99999   9                     9999   9999999999   9999999999\n" +
                    "9  99            99            9999   999999999   9999999999\n" +
                    "9  99        8   99      99     9999   999999999999999999999\n" +
                    "99999         999      9999      9999         99999999999999\n" +
                    "99999         999      9 9        9999        99999999999999\n" +
                    "99999  99     999     9999         9999       99999999999999\n" +
                    "99999  99   99   9    99  9         999       99999999999999\n" +
                    "99999       99    9        9                  99999999999999\n" +
                    "99999              9        9                 99999999999999\n" +
                    "999999999           9        9                99999999999999\n" +
                    "99  9999             9        9           99   9999999999999\n" +
                    "99  999         99    9        9    99    999   999999999999\n" +
                    "999999        9999     9        999999    9999   99999999999\n" +
                    "99999         9 9       99      97779      9999   9999999999\n" +
                    "9999         9999       99      97579       9999   999999999\n" +
                    "999   99     99  9              97779        9999   99999999\n" +
                    "99   9999         9            999999         9999   9999999\n" +
                    "999   9999         9           99    9         9999   999999\n" +
                    "9999   9999         9                 9         9999   99999\n" +
                    "99999   9999         9                 9         9999   9999\n" +
                    "999999   9999         9    99           9         9999   999\n" +
                    "9999999   9999         999999            9         9999   99\n" +
                    "99999999   9999        97779              9  99     99   999\n" +
                    "999999999   9999       97579      99       9999         9999\n" +
                    "9999999999   9999      97779      99       9 9         99999\n" +
                    "99999999999   9999    999999        9     9999        999999\n" +
                    "999999999999   999    99    9        9    99         999  99\n" +
                    "9999999999999   99           9        9             9999  99\n" +
                    "99999999999999                9        9           999999999\n" +
                    "99999999999999                 9        9              99999\n" +
                    "99999999999999                  9        9    99       99999\n" +
                    "99999999999999       999         9  99    9   99   99  99999\n" +
                    "99999999999999       9999         9999     999     99  99999\n" +
                    "99999999999999        9999        9 9      999         99999\n" +
                    "99999999999999         9999      9999      999         99999\n" +
                    "999999999999999999999   9999     99      99   8        99  9\n" +
                    "9999999999   999999999   9999            99            99  9\n" +
                    "9999999999   9999999999   9999                     9   99999\n" +
                    "9999999999   99999999999   9999                   99   99999\n" +
                    "99999999  999999999999999   9999                 999   99999\n" +
                    "99999999  9999999999999999   9999      9  99    9999   99  9\n" +
                    "9999999 9999999999999999999   9999    99  99           99  9\n" +
                    "9999999999999999999999999999   999   999               99999\n" +
                    "99999999999999999999999999999   9   9999               99999\n" +
                    "999999999999999999999999999999     9999999999999999999999999\n" +
                    "9999999999999999999999999999999   999  99999999999999999   9\n" +
                    "99999999999999999999999999999999 9999  9999999  999  999   9\n" +
                    "9999999999999999999999999999999999999999999999  999  999   9\n" +
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
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9999     99                                               99\n" +
                    "99999    99                                               99\n" +
                    "99 999   99     99  99       99    99    999   999        99\n" +
                    "99  999 999     99  999      99    99    9       9        99\n" +
                    "99   9999           9999    9999   99    9       9        99\n" +
                    "99    99            99 99   9  9  9999               99   99\n" +
                    "99   99             99  99  9  9  9  9               99   99\n" +
                    "999999     9   9    999999999999999  9                    99\n" +
                    "999999    99   9    999999999999999  9   9       9        99\n" +
                    "99       999   9    999   9999  999999   9       9   99   99\n" +
                    "99             9    99   9 99    99999   999   999   99   99\n" +
                    "99             99   99  9  99    99999                    99\n" +
                    "99             99   99 9   999  999 999                   99\n" +
                    "99       99999999   999   999999999  99999999       9999  99\n" +
                    "99  99       9999   9999999999999999999999999       9999  99\n" +
                    "99  99               99999999         99  999       9999  99\n" +
                    "99                                    99 9 99       9999  99\n" +
                    "99                              9     999  99             99\n" +
                    "99  9999999999999         9    999    9999999             99\n" +
                    "99  99999999999999        9   99 99   99999999            99\n" +
                    "99   99  99     99    99  9  99 9 99       9999999999     99\n" +
                    "99    99 99 99  99    99 99   99 99        9 9999   9999  99\n" +
                    "99     9999 999 99      9999   999         9  999   9999  99\n" +
                    "99      999  99 99     999999   9   999    9999999999     99\n" +
                    "99       99     99  999999  99     99 99   99999999       99\n" +
                    "99        99999999      99  99     9 9 9   999  999       99\n" +
                    "99    999999999999       99999     99 99   99    99999    99\n" +
                    "99  999  999  999         999       999    99    99  999  99\n" +
                    "99  999  99 99 99    999       999         999  999  999  99\n" +
                    "99    99999 99 99   99 99     99999       999999999999    99\n" +
                    "99       999  999   9 9 9     99  99      999999999       99\n" +
                    "99       99999999   99 99     99  999999  99     99       99\n" +
                    "99     9999999999    999   9   999999     99 99  999      99\n" +
                    "99  9999   999  9         999   9999      99 999 9999     99\n" +
                    "99  9999   9999 9        99 99   99 99    99  99 99 99    99\n" +
                    "99     9999999999       99 9 99  9  99    99     99  99   99\n" +
                    "99            99999999   99 99   9        99999999999999  99\n" +
                    "99             9999999    999    9         9999999999999  99\n" +
                    "99             99  999     9                              99\n" +
                    "99   9999      99 9 99                                    99\n" +
                    "99   9999      999  99         99999999               99  99\n" +
                    "99   9999      9999999999999999999999999   9999       99  99\n" +
                    "99   9999      99999999  999999999   999   99999999       99\n" +
                    "99                   999 999  999   9 99   99             99\n" +
                    "99                    99999 99 99  9  99   99             99\n" +
                    "99    99  999   999   99999 99 99 9   99    9             99\n" +
                    "99    99  9       9   999999  9999   999    9   999       99\n" +
                    "99        9       9   9  999999999999999    9   99    999999\n" +
                    "99                    9  999999999999999    9   9     999999\n" +
                    "99    99              9  9  9  9  99  99             99   99\n" +
                    "99    99              9999  9  9   99 99            99    99\n" +
                    "99        9       9    99   9999    9999           9999   99\n" +
                    "99        9       9    99    99      999  99     999 999  99\n" +
                    "99        999   999    99    99       99  99     99   999 99\n" +
                    "99                                               99    99999\n" +
                    "99                                               99     9999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
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
                    x: -240,
                    y: 0
                }, {
                    x: 240,
                    y: 0
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
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9999999999999999999999999999999999999999999             9999\n" +
                    "999999999999999999999999999999999999999999               999\n" +
                    "99999999999999999999999999999999999999999   999999        99\n" +
                    "99999999999999999999                       99999999       99\n" +
                    "9999999999999999999                              99       99\n" +
                    "999999999999999999                                        99\n" +
                    "99999999999999999                                         99\n" +
                    "9999999999999999                                     99   99\n" +
                    "999999999999999        99999    9999999999           999  99\n" +
                    "99999999999999        999999    99999999999    99     99  99\n" +
                    "9999999999999        999                999    99     99  99\n" +
                    "999999999999        999                 999           99  99\n" +
                    "99999999999        999                 999            99  99\n" +
                    "9999999999         999                999             99  99\n" +
                    "999999999           999              999              9   99\n" +
                    "99999999             9              999       999        999\n" +
                    "9999999                            999       99999      9999\n" +
                    "999999        99         9        999       999999     99999\n" +
                    "99999        9999       999      999         9  99     99999\n" +
                    "99999       999999       999      9             99     99999\n" +
                    "99999      999  999       999            9      99     99999\n" +
                    "99999     999    999       9999         999     99     99999\n" +
                    "99999     99      999       9999       999      99     99999\n" +
                    "99999     99       9         99       999       99     99999\n" +
                    "99999     99                         999        99     99999\n" +
                    "99999     99           9            999         99     99999\n" +
                    "99999                 999          999                 99999\n" +
                    "99999                  999        999                  99999\n" +
                    "99999                  999        999                  99999\n" +
                    "99999                 999          999                 99999\n" +
                    "99999     99         999            9           99     99999\n" +
                    "99999     99        999                         99     99999\n" +
                    "99999     99       999       99         9       99     99999\n" +
                    "99999     99      999       9999       999      99     99999\n" +
                    "99999     99     999         9999       999     99     99999\n" +
                    "99999     99      9            999       999  999      99999\n" +
                    "99999     99             9      999       999999       99999\n" +
                    "99999     99  9         999      999       9999        99999\n" +
                    "99999     999999       999        9         99        999999\n" +
                    "9999      99999       999                            9999999\n" +
                    "999        999       999              9             99999999\n" +
                    "99   9              999              999           999999999\n" +
                    "99  99             999                999         9999999999\n" +
                    "99  99            999                 999        99999999999\n" +
                    "99  99           999                 999        999999999999\n" +
                    "99  99     99    999                999        9999999999999\n" +
                    "99  99     99    99999999999    999999        99999999999999\n" +
                    "99  999           9999999999    99999        999999999999999\n" +
                    "99   99                                     9999999999999999\n" +
                    "99                                         99999999999999999\n" +
                    "99                                        999999999999999999\n" +
                    "99       99                              9999999999999999999\n" +
                    "99       99999999                       99999999999999999999\n" +
                    "99        999999   99999999999999999999999999999999999999999\n" +
                    "999               999999999999999999999999999999999999999999\n" +
                    "9999             9999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
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
                map: "9999999999       9999999999      9999999999       9999999999\n" +
                    "99999999999     999999999999    999999999999     99999999999\n" +
                    "9         99                                    99         9\n" +
                    "9 9999999999   9999999999999    9999999999999   9999999999 9\n" +
                    "9 9999999999    999999999999    999999999999    9999999999 9\n" +
                    "9 99      99             99      99             99      99 9\n" +
                    "9 9                                                      9 9\n" +
                    "9 9                                                      9 9\n" +
                    "9 9                       99    99                       9 9\n" +
                    "9 9      999    9999999999999  9999999999999    999      9 9\n" +
                    "9 9     9999                                    9999     9 9\n" +
                    "9 9   999999                                    999999   9 9\n" +
                    "9 9   999999   99999999999999  99999999999999   999999   9 9\n" +
                    "999   99999     9999999999999  9999999999999     99999   999\n" +
                    "9     9999              99999  99999              9999     9\n" +
                    "9      999               999    999               999      9\n" +
                    "9      999      999999                999999      999      9\n" +
                    "9     9999                   99                   9999     9\n" +
                    "9    9999                9   99   9                9999    9\n" +
                    "9     99           99    9   99   9    99           99     9\n" +
                    "9  9   9          99     9   99   9     99          9   9  9\n" +
                    "99999        999999      9        9      999999        99999\n" +
                    "999999                                                999999\n" +
                    "9999                 99    99  99    99                 9999\n" +
                    "999      99999       9    999  999    9       99999      999\n" +
                    "99      99999        9    99    99    9        99999      99\n" +
                    "99                   9    99    99    9                   99\n" +
                    "99     99         9       99    99       9         99     99\n" +
                    "99      9         9       9      9       9         9      99\n" +
                    "99      9         9          99          9         9      99\n" +
                    "99      9         9          99          9         9      99\n" +
                    "99      9         9       9      9       9         9      99\n" +
                    "99     99         9       99    99       9         99     99\n" +
                    "99                   9    99    99    9                   99\n" +
                    "99      99999        9    99    99    9        99999      99\n" +
                    "999      99999       9    999  999    9       99999      999\n" +
                    "9999                 99    99  99    99                 9999\n" +
                    "999999                                                999999\n" +
                    "99999        999999      9        9      999999        99999\n" +
                    "9  9   9          99     9   99   9     99          9   9  9\n" +
                    "9     99           99    9   99   9    99           99     9\n" +
                    "9    9999                9   99   9                9999    9\n" +
                    "9     9999                   99                   9999     9\n" +
                    "9      999      999999                999999      999      9\n" +
                    "9      999               999    999               999      9\n" +
                    "9     9999              99999  99999              9999     9\n" +
                    "999   99999     9999999999999  9999999999999     99999   999\n" +
                    "9 9   999999   99999999999999  99999999999999   999999   9 9\n" +
                    "9 9   999999                                    999999   9 9\n" +
                    "9 9     9999                                    9999     9 9\n" +
                    "9 9      999    9999999999999  9999999999999    999      9 9\n" +
                    "9 9                       99    99                       9 9\n" +
                    "9 9                                                      9 9\n" +
                    "9 9                                                      9 9\n" +
                    "9 99      99             99      99             99      99 9\n" +
                    "9 9999999999    999999999999    999999999999    9999999999 9\n" +
                    "9 9999999999   9999999999999    9999999999999   9999999999 9\n" +
                    "9         99                                    99         9\n" +
                    "99999999999     999999999999    999999999999     99999999999\n" +
                    "9999999999       9999999999      9999999999       9999999999",
                flags: [{
                    x: -245,
                    y: 0
                }, {
                    x: 245,
                    y: 0
                }],
                portals: [
                    {
                        x: 0,
                        y: 235
                    },
                    {
                        x: 0,
                        y: -235
                    }
                ],
                spawns: [{
                    x: -185,
                    y: 0
                }, {
                    x: 185,
                    y: 0
                }],
                tiers: [5, 6],
                asteroids: []
            },
            {
                name: "Dots",
                author: "Healer",
                map: '9  999999999999999999999999999999999999999999999999999999  9\n' +
                    '   993566533364536434555539999999935555434635463335665399   \n' +
                    '    9999999999999999999999999  9999999999999999999999999    \n' +
                    '                       9999      9999                       \n' +
                    '999999                9999        9999                999999\n' +
                    '9399999             79999    99    99997             9999939\n' +
                    '9399 99   99                9999                99   99 9939\n' +
                    '969       99               999999               99       969\n' +
                    '969        99            9999  9999            99        969\n' +
                    '949        999    99      99    99      99    999        949\n' +
                    '939         99    99                    99    99         939\n' +
                    '939                                                      939\n' +
                    '939  9999                                          9999  939\n' +
                    '939  9999     99       99          99       99     9999  939\n' +
                    '939            99      99          99      99            939\n' +
                    '969             99           99           99             969\n' +
                    '969                          99                          969\n' +
                    '959    999          99                99          999    959\n' +
                    '949     999         99999          99999         999     949\n' +
                    '939      999          999999    999999          999      939\n' +
                    '9399     9999    99                      99    9999     9939\n' +
                    '9499       999   99                      99   999       9949\n' +
                    '95999       999                              999       99959\n' +
                    '95999   99  999          999    999          999  99   99959\n' +
                    '9499    99   88           99999999           88   99    9949\n' +
                    '999           6    99       9999       99    6           999\n' +
                    '99                 99                  99                 99\n' +
                    '                                                            \n' +
                    '   9                                                    9   \n' +
                    '  999     99          99            99          99     999  \n' +
                    '  999     99          99            99          99     999  \n' +
                    '   9                                                    9   \n' +
                    '                                                            \n' +
                    '99                 99                  99                 99\n' +
                    '999           6    99       9999       99    6           999\n' +
                    '9499    99   88           99999999           88   99    9949\n' +
                    '95999   99  999          999    999          999  99   99959\n' +
                    '95999       999                              999       99959\n' +
                    '9499       999   99                      99   999       9949\n' +
                    '9399     9999    99                      99    9999     9939\n' +
                    '939      999          999999    999999          999      939\n' +
                    '949     999         99999          99999         999     949\n' +
                    '959    999          99                99          999    959\n' +
                    '969                          99                          969\n' +
                    '969             99           99           99             969\n' +
                    '939            99      99          99      99            939\n' +
                    '939  9999     99       99          99       99     9999  939\n' +
                    '939  9999                                          9999  939\n' +
                    '939                                                      939\n' +
                    '939         99    99                    99    99         939\n' +
                    '949        999    99      99    99      99    999        949\n' +
                    '969        99            9999  9999            99        969\n' +
                    '969       99               999999               99       969\n' +
                    '9399 99   99                9999                99   99 9939\n' +
                    '9399999             79999    99    99997             9999939\n' +
                    '999999                9999        9999                999999\n' +
                    '                       9999      9999                       \n' +
                    '    9999999999999999999999999  9999999999999999999999999    \n' +
                    '   993566533364536434555539999999935555434635463335665399   \n' +
                    '9  999999999999999999999999999999999999999999999999999999  9',
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
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9999994 99  99  99  99  499999999994  99  99  99  99 4999999\n" +
                    "9999999 66  66  66  66   4999999994   66  66  66  66 9999999\n" +
                    "9994999                   49999994                   9994999\n" +
                    "999                        444444                        999\n" +
                    "999                                                      999\n" +
                    "99996                                                  69999\n" +
                    "99996                                                  69999\n" +
                    "999            94499999999        99999999449            999\n" +
                    "99996      99  9949999999          9999999499  99      69999\n" +
                    "99996      999999                          999999      69999\n" +
                    "999         9999                            9999         999\n" +
                    "999         999                              999         999\n" +
                    "99996     9999     99                  99     9999     69999\n" +
                    "99996     499     9999                9999     994     69999\n" +
                    "999       44     999                    999     44       999\n" +
                    "999       99    9997                    7999    99       999\n" +
                    "99996     99   999777                  777999   99     69999\n" +
                    "99996     99   99  777                777  99   99     69999\n" +
                    "999       99    9   777              777   9    99       999\n" +
                    "999                  777            777                  999\n" +
                    "99996                 77            77                 69999\n" +
                    "99996     79                                    97     69999\n" +
                    "999       798                                  897       999\n" +
                    "999         88                                88         999\n" +
                    "9999         86                              68         9999\n" +
                    "99999         66                            66         99999\n" +
                    "9999996        0                            0        6999999\n" +
                    "9999996        0                            0        6999999\n" +
                    "99999         66                            66         99999\n" +
                    "9999         86                              68         9999\n" +
                    "999         88                                88         999\n" +
                    "999       798                                  897       999\n" +
                    "99996     79                                    97     69999\n" +
                    "99996                 77            77                 69999\n" +
                    "999                  777            777                  999\n" +
                    "999       99    9   777              777   9    99       999\n" +
                    "99996     99   99  777                777  99   99     69999\n" +
                    "99996     99   999777                  777999   99     69999\n" +
                    "999       99    9997                    7999    99       999\n" +
                    "999       44     999                    999     44       999\n" +
                    "99996     499     9999                9999     994     69999\n" +
                    "99996     9999     99                  99     9999     69999\n" +
                    "999         999                              999         999\n" +
                    "999         9999                            9999         999\n" +
                    "99996      999999                          999999      69999\n" +
                    "99996      99  9949999999          9999999499  99      69999\n" +
                    "999            94499999999        99999999449            999\n" +
                    "99996                                                  69999\n" +
                    "99996                                                  69999\n" +
                    "999                                                      999\n" +
                    "999                        444444                        999\n" +
                    "9994999                   49999994                   9994999\n" +
                    "9999999 66  66  66  66   4999999994   66  66  66  66 9999999\n" +
                    "9999994 99  99  99  99  499999999994  99  99  99  99 4999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
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
                    x: -210,
                    y: 0
                }, {
                    x: 210,
                    y: 0
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Temple",
                author: "Kirito",
                map: "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "99     9999                                      9999     99\n" +
                    "99   9999                                          9999   99\n" +
                    "99 9999            9999999        9999999            9999 99\n" +
                    "99999            999999  9        9  999999            99999\n" +
                    "9999             99  99  9        9  99  99             9999\n" +
                    "9999         9   99  99999        99999  99   9         9999\n" +
                    "999          99  99  9999    77    9999  99  99          999\n" +
                    "999       9  99  999999     7997     999999  99  9       999\n" +
                    "999      99  99  9999       9  9       9999  99  99      999\n" +
                    "9999     99  99  99                      99  99  99     9999\n" +
                    "99999    99  99                              99  99    99999\n" +
                    "9999     99  9                                9  99     9999\n" +
                    "999       9                                      9       999\n" +
                    "999                                                      999\n" +
                    "999                     9999    9999                     999\n" +
                    "999                   999999    999999                   999\n" +
                    "999               9   99  99    99  99   9               999\n" +
                    "999     99        99  99  99    99  99  99        99     999\n" +
                    "999    9999    9  99  99  99    99  99  99  9    9999    999\n" +
                    "999    999    99  99  9999        9999  99  99    999    999\n" +
                    "999    999    99  99  99            99  99  99    999    999\n" +
                    "999    999    99  99                    99  99    999    999\n" +
                    "999    9999   99  9         7777         9  99   9999    999\n" +
                    "999    9999   99          77999977          99   9999    999\n" +
                    "999    9999    9          99    99          9    9999    999\n" +
                    "999   99999                                      99999   999\n" +
                    "999  9999                                          9999  999\n" +
                    "999                                                      999\n" +
                    "999                                                      999\n" +
                    "999  9999                                          9999  999\n" +
                    "999   99999                                      99999   999\n" +
                    "999    9999    9          99    99          9    9999    999\n" +
                    "999    9999   99          77999977          99   9999    999\n" +
                    "999    9999   99  9         7777         9  99   9999    999\n" +
                    "999    999    99  99                    99  99    999    999\n" +
                    "999    999    99  99  99            99  99  99    999    999\n" +
                    "999    999    99  99  9999        9999  99  99    999    999\n" +
                    "999    9999    9  99  99  99    99  99  99  9    9999    999\n" +
                    "999     99        99  99  99    99  99  99        99     999\n" +
                    "999               9   99  99    99  99   9               999\n" +
                    "999                   999999    999999                   999\n" +
                    "999                     9999    9999                     999\n" +
                    "999                                                      999\n" +
                    "999       9                                      9       999\n" +
                    "9999     99  9                                9  99     9999\n" +
                    "99999    99  99                              99  99    99999\n" +
                    "9999     99  99  99                      99  99  99     9999\n" +
                    "999      99  99  9999       9  9       9999  99  99      999\n" +
                    "999       9  99  999999     7997     999999  99  9       999\n" +
                    "999          99  99  9999    77    9999  99  99          999\n" +
                    "9999         9   99  99999        99999  99   9         9999\n" +
                    "9999             99  99  9        9  99  99             9999\n" +
                    "99999            999999  9        9  999999            99999\n" +
                    "99 9999            9999999        9999999            9999 99\n" +
                    "99   9999                                          9999   99\n" +
                    "99     9999                                      9999     99\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
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
                map: "9999989999999999999999999999999999988888888899999   9999    \n" +
                    " 99999999999 999999999    99999999999888888999999   99999   \n" +
                    "  999999999   9999999      9999999999998889999999   999999  \n" +
                    "   999999999 9999999        88999999999999999999     999999 \n" +
                    "    9999999999999999          8889999999999999         99999\n" +
                    "8    999999999989999        88   888888999999           9999\n" +
                    "99    99999999989999        99888      888999           9999\n" +
                    "999    99999999999999      999999888888   88             999\n" +
                    "9999      999999999999    9999999999999888               999\n" +
                    "99999      999999999999   999999999999999988             999\n" +
                    "9999        99999899999   999999999999889999             999\n" +
                    "999          99999899999   99999998988889999             999\n" +
                    "99           99999889999   9999 9999999999999           9999\n" +
                    "99            9999989999   999999999999999999           9999\n" +
                    "99            99999989999   9999999999999999           89999\n" +
                    "99            99999999999   999999999999999          8 89999\n" +
                    "99            999999999999   9         999       99998 89999\n" +
                    "99             99999999999                      999998 89999\n" +
                    "999              99999999                      99999998 8999\n" +
                    "9999        99     99999    99                999999998 8999\n" +
                    "999999    999999     99    9999              99999  998 8999\n" +
                    "9999999   99999999         9999              99999  9998 899\n" +
                    "9999999   9999999999        99               99999999998 899\n" +
                    "9 99999   99999999999                         9999999998 899\n" +
                    "9999999   99899999999                         999999999   99\n" +
                    "9999999   9999999888                           9999888     9\n" +
                    "9999999   9999988                          99  9888        9\n" +
                    "899998     8888  888                       99      888     9\n" +
                    "98999          88999                            8889999   99\n" +
                    "99999       88899999  99                        999999999999\n" +
                    "99999       99999999  99                        999999999999\n" +
                    "999999     999999999                            999999999999\n" +
                    "9999999   9999999999                            999999999998\n" +
                    "9 99999   999999999                             9999 9999988\n" +
                    "   9999   99999999                             9999999999888\n" +
                    "9 99999   9999999                              9999999999888\n" +
                    "9999999   999999                               9999999999998\n" +
                    "9999999   9999                                99999999999999\n" +
                    "999999      9                      99         99999999999999\n" +
                    "9999                              9999       999999999999999\n" +
                    "999                  99           9999      99999999999  999\n" +
                    "99                 99999           99       99999999999  999\n" +
                    "99                9999999                    999999999999999\n" +
                    "9                9999999999                   99999999999999\n" +
                    "9                9999999999999       999      99999999999999\n" +
                    "9                999999999999999999999999      9999999999999\n" +
                    "9                9999999999999999999999999      999999999999\n" +
                    "9                99999989999999999999999999      99999999999\n" +
                    "9               999999888999999999999999999          9999999\n" +
                    "99              9999998899999999999999999999           99999\n" +
                    "99              99999889999999999988888899999          99999\n" +
                    "999            9999998999999999998889999899999          9999\n" +
                    "9999          9999998899999 999998899999989999          9999\n" +
                    "9999999    999999999889999   99998999999999999          9999\n" +
                    "999999999999999999998899999 999999999999999999          9999\n" +
                    "9999999999999999999888999999999999999 999999999         9999\n" +
                    "89999999999999999988889999999999899999999999999         9999\n" +
                    "888899999999999888888889999999998999999999999999         999\n" +
                    "8888889999998888888888889999999888999999999999999   99    99\n" +
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
                map: "9 99343545559333559333433343999934333433395533395554534399 9\n" +
                    " 9945645564595445494446546545995456456444945445954655465499 \n" +
                    "999976656657967557976575577779977775575679755769756656679999\n" +
                    "959999999999999999999999999999999999999999999999999999999959\n" +
                    "557999999999999999999999999999999999999999999999999999999755\n" +
                    "56699     999   999                                    99665\n" +
                    "35599    999   999                                     99553\n" +
                    "45699   999   999                                      99654\n" +
                    "36599  999   999                               999     99563\n" +
                    "54599 999   999      99999                      999    99545\n" +
                    "45799999   999      999999                       999   99754\n" +
                    "9999999   999      999  99         999   999      99   99999\n" +
                    "346999   999      999   99        999     999      9   99643\n" +
                    "54599   999      999    99       999       999         99545\n" +
                    "44699  999      999     99      999    9    999        99644\n" +
                    "34599 999      999      99      99    99     99        99543\n" +
                    "54599999      999       99      99   99      99        99545\n" +
                    "9999999       99        99      99   9       99        99999\n" +
                    "556999        9         99      99           99        99655\n" +
                    "55799      9            99      99           99        99755\n" +
                    "55699     99           999      999          99        99655\n" +
                    "45799    999            999      999         99        99754\n" +
                    "54799    99          9   999      999        99        99745\n" +
                    "34799    99   9     999   999      999       999       99743\n" +
                    "36799    99   9    999     999      999       999      99763\n" +
                    "46599    99   9   999       999      999       999     99564\n" +
                    "46799    99   9   99         999      999       999    99764\n" +
                    "55699    99   9   99                   999       99    99655\n" +
                    "96599    99   9   99                    99   9   99    99569\n" +
                    "99999    99   9   99                    99   9   99    99999\n" +
                    "99999    99   9   99                    99   9   99    99999\n" +
                    "96599    99       99                    99   9   99    99569\n" +
                    "55699    999      999                   99   9   99    99655\n" +
                    "46799     999      999      999         99   9   99    99764\n" +
                    "46599      999      999      999       999   9   99    99564\n" +
                    "36799       999      999      999     999    9   99    99763\n" +
                    "34799        99       999      999   999     9   99    99743\n" +
                    "54799        99        999      999   9          99    99745\n" +
                    "45799        99         999      999            999    99754\n" +
                    "55699        99          999      999           99     99655\n" +
                    "55799        99           99      99            9      99755\n" +
                    "55699        99           99      99         9        999655\n" +
                    "99999        99       9   99      99        99       9999999\n" +
                    "54599        99      99   99      99       999      99999545\n" +
                    "34599        99     99    99      99      999      999 99543\n" +
                    "44699        999    9    999      99     999      999  99644\n" +
                    "54599         999       999       99    999      999   99545\n" +
                    "34699          999     999        99   999      999   999643\n" +
                    "99999   9       999   999         99  999      999   9999999\n" +
                    "45799   99                        999999      999   99999754\n" +
                    "54599   999                       99999      999   999 99545\n" +
                    "36599    999                                999   999  99563\n" +
                    "45699                                      999   999   99654\n" +
                    "35599                                     999   999    99553\n" +
                    "56699                                    999   999     99665\n" +
                    "557999999999999999999999999999999999999999999999999999999755\n" +
                    "959999999999999999999999999999999999999999999999999999999959\n" +
                    "999976656657967557976575577779977775575679755769756656679999\n" +
                    " 9945645564595445494446546545995456456444945445954655465499 \n" +
                    "9 99343545559333559333433343999934333433395533395554534399 9",
                flags: [{
                    x: -180,
                    y: -190
                }, {
                    x: 180,
                    y: 190
                }],
                portals: [
                    {
                        x: -110,
                        y: -110
                    },
                    {
                        x: 110,
                        y: 110
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
                    x: -165,
                    y: -222
                }, {
                    x: 242,
                    y: 150
                }],
                tiers: [],
                asteroids: []
            },
            {
                name: "Agony",
                author: "Liberal",
                map: "              99   99                  99   99              \n" +
                    "              99   99                  99   99              \n" +
                    "              99   99                  999999999999         \n" +
                    "     9999     999  99                  9999999999999    9999\n" +
                    "9     9999     999 99                  99         999    999\n" +
                    "99     9999     99999                  99          999    99\n" +
                    "999     9999     9999                  99           999    9\n" +
                    "9999     9999     999                  99   9999     999    \n" +
                    "                   99                  99    9999     99    \n" +
                    "                   99        999999999999     9999    99    \n" +
                    "9999999999999999   99        999999999999      9999   999999\n" +
                    "9999999999999999   99                                 999999\n" +
                    "                   99                                 99    \n" +
                    "                   99                                 99    \n" +
                    "99999999999999999999999999999999   999999   9999999   999999\n" +
                    "99999999999999999999999999999999   999999   9999999   999999\n" +
                    "                                       99   99   99         \n" +
                    "                                       99   99   99         \n" +
                    "9999999999999999   99                  99   99   99   999999\n" +
                    "999999999999999   999   999999999999   99   9999999   999999\n" +
                    "           999   9999   999999999999   99   9999999   99    \n" +
                    "          999   99999                                 99    \n" +
                    "         999   999 99                                 99    \n" +
                    "        999   999  99                                 99    \n" +
                    "       999   999   99   99999   9999   99999999999999999    \n" +
                    "      999   999    99   99999   9999   999999999999         \n" +
                    "     999   999     99   99        99   99                   \n" +
                    "9999999   999      99   99        99   99           99999999\n" +
                    "999999   999       99   99        99   99          999999999\n" +
                    "        999             99   99   99              999       \n" +
                    "       999              99   99   99             999        \n" +
                    "999999999          99   99        99   99       999   999999\n" +
                    "99999999           99   99        99   99      999   9999999\n" +
                    "                   99   99        99   99     999   999     \n" +
                    "         999999999999   9999   99999   99    999   999      \n" +
                    "    99999999999999999   9999   99999   99   999   999       \n" +
                    "    99                                 99  999   999        \n" +
                    "    99                                 99 999   999         \n" +
                    "    99                                 99999   999          \n" +
                    "    99   9999999   99   999999999999   9999   999           \n" +
                    "999999   9999999   99   999999999999   999   999999999999999\n" +
                    "999999   99   99   99                  99   9999999999999999\n" +
                    "         99   99   99                                       \n" +
                    "         99   99   99                                       \n" +
                    "999999   9999999   999999   99999999999999999999999999999999\n" +
                    "999999   9999999   999999   99999999999999999999999999999999\n" +
                    "    99                                 99                   \n" +
                    "    99                                 99                   \n" +
                    "999999                                 99   9999999999999999\n" +
                    "999999   9999      999999999999        99   9999999999999999\n" +
                    "    99    9999     999999999999        99                   \n" +
                    "    99     9999    99                  99                   \n" +
                    "    999     9999   99                  999     9999     9999\n" +
                    "9    999           99                  9999     9999     999\n" +
                    "99    999          99                  99999     9999     99\n" +
                    "999    999         99                  99 999     9999     9\n" +
                    "9999    9999999999999                  99  999     9999     \n" +
                    "         999999999999                  99   99              \n" +
                    "              99   99                  99   99              \n" +
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
                map: "   999999999999999999999            999999999999999999999   \n" +
                    "    9 9  9      99    999          999    99      9  9 9    \n" +
                    "     99 9 9999999      999        999      9999999 9 99     \n" +
                    "9     9999999999        999      999        9999999999     9\n" +
                    "99     9  99  9          99      99          9  99  9     99\n" +
                    "9 9     999  9            9      9            9  999     9 9\n" +
                    "9999     9  9     99                    99     9  9     9999\n" +
                    "9  99     99     99                      99     99     99  9\n" +
                    "9 99 9          99                        99          9 99 9\n" +
                    "99 9 99        99     9              9     99        99 9 99\n" +
                    "9 9999 9      99     99              99     99      9 9999 9\n" +
                    "9 999  99    99     99                99     99    99  999 9\n" +
                    "9 99  99 9  99     99                  99     99  9 99  99 9\n" +
                    "9 99 9 9  999     99                    99     999  9 9 99 9\n" +
                    "9 999  9  99     99                      99     99  9  999 9\n" +
                    "9 99   9 99     99     999        999     99     99 9   99 9\n" +
                    "9999999999     99     999          999     99     9999999999\n" +
                    "999  9 99     99     999   9    9   999     99     99 9  999\n" +
                    "99999 99     99     999   99    99   999     99     99 99999\n" +
                    "9999999     99     999    99    99    999     99     9999999\n" +
                    "99999      99     999    999    999    999     99      99999\n" +
                    "99        99     999    9999    9999    999     99        99\n" +
                    "99       99      99    99999    99999    99      99       99\n" +
                    "99               9    99999      99999    9               99\n" +
                    " 9                   99999        99999                   9 \n" +
                    " 99      99999                                99999      99 \n" +
                    " 99   9   99999                              99999   9   99 \n" +
                    "999   99              9999999  9999999              99   999\n" +
                    "999   99         9     99999    99999     9         99   999\n" +
                    "99    99         99                      99         99    99\n" +
                    "99    99         99                      99         99    99\n" +
                    "999   99         9     99999    99999     9         99   999\n" +
                    "999   99              9999999  9999999              99   999\n" +
                    " 99   9   99999                              99999   9   99 \n" +
                    " 99      99999                                99999      99 \n" +
                    " 9                   99999        99999                   9 \n" +
                    "99               9    99999      99999    9               99\n" +
                    "99       99      99    99999    99999    99      99       99\n" +
                    "99        99     999    9999    9999    999     99        99\n" +
                    "99999      99     999    999    999    999     99      99999\n" +
                    "9999999     99     999    99    99    999     99     9999999\n" +
                    "99999 99     99     999   99    99   999     99     99 99999\n" +
                    "999  9 99     99     999   9    9   999     99     99 9  999\n" +
                    "9999999999     99     999          999     99     9999999999\n" +
                    "9 99   9 99     99     999        999     99     99 9   99 9\n" +
                    "9 999  9  99     99                      99     99  9  999 9\n" +
                    "9 99 9 9  999     99                    99     999  9 9 99 9\n" +
                    "9 99  99 9  99     99                  99     99  9 99  99 9\n" +
                    "9 999  99    99     99                99     99    99  999 9\n" +
                    "9 9999 9      99     99              99     99      9 9999 9\n" +
                    "99 9 99        99     9              9     99        99 9 99\n" +
                    "9 99 9          99                        99          9 99 9\n" +
                    "9  99     99     99                      99     99     99  9\n" +
                    "9999     9  9     99                    99     9  9     9999\n" +
                    "9 9     999  9            9      9            9  999     9 9\n" +
                    "99     9  99  9          99      99          9  99  9     99\n" +
                    "9     9999999999        999      999        9999999999     9\n" +
                    "     99 9 9999999      999        999      9999999 9 99     \n" +
                    "    9 9  9      99    999          999    99      9  9 9    \n" +
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
                    x: -225,
                    y: 0
                }, {
                    x: 225,
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
                    x: -175,
                    y: -175
                }, {
                    x: 175,
                    y: 175
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
                map: "                                                            \n" +
                    " 99 999999 99             9  99  9             99 999999 99 \n" +
                    " 99 999999 99 9  9    99  9 9999 9  99    9  9 99 999999 99 \n" +
                    "   99   99    9 999    9  999  999  9    999 9   999   999  \n" +
                    " 9999   9999999  9   9999999    9999999   9  999999     999 \n" +
                    " 99     99999    9 99999999      99999999 9    999       99 \n" +
                    " 99        9999999999                  9999999999        99 \n" +
                    " 99        999999999                    999999999        99 \n" +
                    " 99999                9999        9999                  999 \n" +
                    " 99999      99999    99999        99999    99999      99999 \n" +
                    "    99      99499  9 994499      994499 9  99499      99    \n" +
                    " 99 9999     999  99 994 499    994 499 99  999     9999 99 \n" +
                    " 99 9999 99      999 994  499  994  499 999      99 9999 99 \n" +
                    "    9 99 999    9949 994  499  994  499 9499    999 99 9    \n" +
                    "  999 99 949    9949 994  499  994  499 9499    949 99 999  \n" +
                    "      99 999     999 994  499  994  499 999     999 99      \n" +
                    "   9  99 99  99   99 994  499  994  499 99   99  99 99  9   \n" +
                    "  999999    9999   9 994 4999  9994 499 9   9999    999999  \n" +
                    "   9  99   994499    994499      994499    994499   99  9   \n" +
                    "     999  99999999   99999        99999   99999999  999     \n" +
                    "     99               999  99  99  999               99     \n" +
                    "    99   99999999999      999  999      99999999999   99    \n" +
                    "    99  9999999999999    9949  9499    9999999999999  99    \n" +
                    "    99  9944444444499    9949  9499    9944444444499  99    \n" +
                    "  9999  9994      499     999  999     994      4999  9999  \n" +
                    "    99  99994    499  99   99  99   99  994    49999  99    \n" +
                    " 99999     99444499  9999          9999  99444499     99999 \n" +
                    "   99       999999  994499        994499  999999       99   \n" +
                    "  99         99999  999999        999999  99999         99  \n" +
                    " 99                          99                          99 \n" +
                    " 99                          99                          99 \n" +
                    "  99         99999  999999        999999  99999         99  \n" +
                    "   99       999999  994499        994499  999999       99   \n" +
                    " 99999     99444499  9999          9999  99444499     99999 \n" +
                    "    99  99994    499  99   99  99   99  994    49999  99    \n" +
                    "  9999  9994      499     999  999     994      4999  9999  \n" +
                    "    99  9944444444499    9949  9499    9944444444499  99    \n" +
                    "    99  9999999999999    9949  9499    9999999999999  99    \n" +
                    "    99   99999999999      999  999      99999999999   99    \n" +
                    "     99               999  99  99  999               99     \n" +
                    "     999  99999999   99999        99999   99999999  999     \n" +
                    "   9  99   994499    994499      994499    994499   99  9   \n" +
                    "  999999    9999   9 994 4999  9994 499 9   9999    999999  \n" +
                    "   9  99 99  99   99 994  499  994  499 99   99  99 99  9   \n" +
                    "      99 999     999 994  499  994  499 999     999 99      \n" +
                    "  999 99 949    9949 994  499  994  499 9499    949 99 999  \n" +
                    "    9 99 999    9949 994  499  994  499 9499    999 99 9    \n" +
                    " 99 9999 99      999 994  499  994  499 999      99 9999 99 \n" +
                    " 99 9999     999  99 994 499    994 499 99  999     9999 99 \n" +
                    "    99      99499  9 994499      994499 9  99499      99    \n" +
                    " 99999      99999    99999        99999    99999      99999 \n" +
                    " 999                  9999        9999                99999 \n" +
                    " 99        999999999                    999999999        99 \n" +
                    " 99        9999999999                  9999999999        99 \n" +
                    " 99       999    9 99999999      99999999 9    99999     99 \n" +
                    " 999     999999  9   9999999    9999999   9  9999999   9999 \n" +
                    "  999   999   9 999    9  999  999  9    999 9    99   99   \n" +
                    " 99 999999 99 9  9    99  9 9999 9  99    9  9 99 999999 99 \n" +
                    " 99 999999 99             9  99  9             99 999999 99 \n" +
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
                map: "  99999   79997  7999977  79999997 79999999  7997   99999   \n" +
                    " 99999   999975  79977    79999997 7999999   797   99999    \n" +
                    "99999   999775   777       9999999 999999     7   99999     \n" +
                    "9999   999                  999999 99999   9     99999     9\n" +
                    "999   999   577         77   99999 9999   977   99999     99\n" +
                    "99   999     99     5  7999   9997 999   97      999     999\n" +
                    "9   999      99       799999   777 99   97        9     9999\n" +
                    "   999       99           997      99  97    777       99999\n" +
                    "  999     9  999   5      777      99   7   99999     99999 \n" +
                    " 999     79  9999      5       7 77997     99999     99999  \n" +
                    "799     99    9999    575      9   9997   99999     99999   \n" +
                    "997          9 9999  57975     999 997   99999     79999   7\n" +
                    "997 5           9999  575   7  999997   99999      5999   79\n" +
                    "975  57777       9999  5   79   9997   99999        57   799\n" +
                    "75  5799999       9999          997   99999     75        77\n" +
                    "          99 9     9999        797   99999     9995    7    \n" +
                    "          999       9999999     7   99999     99997   79    \n" +
                    "777  577  9999       999999997     99999     99999   79   77\n" +
                    "997  597  7 999       999999997   99999     99999   799   79\n" +
                    "77    55  5  999 9         997   99999     99999   799     7\n" +
                    "              999           7   99999     99999   799       \n" +
                    "     5         999    777      99999     79999     9        \n" +
                    "77  795  77     999  99997    99999      7999   7          9\n" +
                    "997  7  7997     999 99997   99999      7999   799        99\n" +
                    "997    799997     9999997   99999     77999   79999       99\n" +
                    "9997  7999 997     99997   79999     99999   7999999      99\n" +
                    "99997799 999997     997     799     99999   799999999    999\n" +
                    "999999999    997     7       7     99999   79999999999999999\n" +
                    "999999999 777999  7               99999     999    999999999\n" +
                    "999999999 7  999       7 7       79999      999 77 999999999\n" +
                    "999999999 77 999      99997       7 7       999  7 999999999\n" +
                    "999999999    999     99999               7  999777 999999999\n" +
                    "99999999999999997   99999     7       7     799    999999999\n" +
                    "999    999999997   99999     997     799     799999 99779999\n" +
                    "99      9999997   99999     99997   79999     799 9997  7999\n" +
                    "99       99997   99977     99999   7999999     799997    799\n" +
                    "99        997   9997      99999   79999 999     7997  7  799\n" +
                    "9          7   9997      99999    79999  999     77  597  77\n" +
                    "        9     99997     99999      777    999         5     \n" +
                    "       997   99999     99999   7           999              \n" +
                    "7     997   99999     99999   799         9 999  5  55    77\n" +
                    "97   997   99999     99999   799999999       999 7  795  799\n" +
                    "77   97   99999     99999     799999999       9999  775  777\n" +
                    "    97   79999     99999   7     9999999       999          \n" +
                    "    7    5999     99999   797        9999     9 99          \n" +
                    "77        57     99999   799          9999       9999975  57\n" +
                    "997   75        99999   7999   97   5  9999       77775  579\n" +
                    "97   9995      99999   799999  7   575  9999           5 799\n" +
                    "7   99997     99999   799 999     57975  9999 9          799\n" +
                    "   99999     99999   7999   9      575    9999    99     999\n" +
                    "  99999     99999     79977 7       5      9999  97     999 \n" +
                    " 99999     99999   7   99      777      5   999  9     999  \n" +
                    "99999       777    79  99      799           99       999   \n" +
                    "9999     9        79   99 777   999997       99      999   9\n" +
                    "999     999      79   999 7999   9997  5     99     999   99\n" +
                    "99     99999   779   9999 99999   77         775   999   999\n" +
                    "9     99999     9   99999 999999                  999   9999\n" +
                    "     99999   7     999999 9999999       777   577999   99999\n" +
                    "    99999   797   9999997 79999997    77997  579999   99999 \n" +
                    "   99999   7997  99999997 79999997  7799997  79999   99999  ",
                flags: [{
                    x: -190,
                    y: 190
                }, {
                    x: 190,
                    y: -190
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
                    x: -225,
                    y: 225
                }, {
                    x: 225,
                    y: -225
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
                    // MCST
                    '{"name":"Scythe","level":3,"model":1,"size":1.45,"specs":{"shield":{"capacity":[115,175],"reload":[4,6]},"generator":{"capacity":[70,125],"reload":[23,35]},"ship":{"mass":75,"speed":[90,120],"rotation":[70,90],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-50,-40,-20,20,30,40,35],"z":[0,0,0,0,0,0,0,0]},"width":[0,10,20,25,25,20,15,0],"height":[0,10,20,20,20,20,15,0],"propeller":true,"texture":[4,63,2,10,2,12,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,15,17,12,5],"height":[0,21,25,20,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-55,-60,-20,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,10,16,17,14,0],"height":[0,10,16,17,14,0],"angle":0,"laser":{"damage":[3.5,6],"rate":10,"type":1,"speed":[180,240],"number":1,"error":15,"recoil":0},"propeller":false,"texture":[3,3,2,3]},"side_props":{"section_segments":8,"offset":{"x":50,"y":42,"z":-30},"position":{"x":[0,0,0,0,0,0],"y":[-35,-40,-20,0,20,15],"z":[0,0,0,0,0,0]},"width":[0,8,12,12,10,0],"height":[0,8,12,12,10,0],"angle":0,"propeller":true,"texture":[3,2,10,2,17]}},"wings":{"spikes":{"doubleside":true,"offset":{"x":17,"y":-10,"z":0},"length":[10,0,15],"width":[30,40,160,50],"angle":[0,0,0],"position":[20,20,-15,0],"texture":[3,63,63],"bump":{"position":30,"size":10}},"below":{"doubleside":true,"offset":{"x":20,"y":10,"z":-5},"length":[40],"width":[50,30],"angle":[-40],"position":[0,30],"texture":[11],"bump":{"position":30,"size":10}},"belowFins":{"doubleside":true,"offset":{"x":58,"y":33,"z":-30},"length":[14],"width":[55,35],"angle":[0],"position":[0,0],"texture":[63],"bump":{"position":30,"size":10}}},"typespec":{"name":"Scythe","level":3,"model":1,"code":301,"specs":{"shield":{"capacity":[115,175],"reload":[4,6]},"generator":{"capacity":[70,125],"reload":[23,35]},"ship":{"mass":75,"speed":[90,120],"rotation":[70,90],"acceleration":[80,110]}},"shape":[2.325,2.338,3.144,2.797,2.312,1.998,1.777,1.636,1.505,1.389,1.309,1.255,1.227,1.785,2.154,2.245,2.379,2.55,2.536,2.502,2.333,1.777,1.376,1.372,1.328,1.307,1.328,1.372,1.376,1.777,2.333,2.502,2.536,2.55,2.379,2.245,2.154,1.785,1.227,1.255,1.309,1.389,1.505,1.636,1.777,1.998,2.312,2.797,3.144,2.338],"lasers":[{"x":0,"y":-2.32,"z":0,"angle":0,"damage":[3.5,6],"rate":10,"type":1,"speed":[180,240],"number":1,"spread":0,"error":15,"recoil":0}],"radius":3.144}}';
                    '{"name":"Pulse-Fighter","level":3,"model":2,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":120,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-50,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,25,30,35,20,0],"height":[0,10,15,25,25,20,0],"propeller":true,"texture":[63,1,1,10,2,12]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"cannon":{"section_segments":6,"offset":{"x":0,"y":-40,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":3},"deco":{"section_segments":8,"offset":{"x":50,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":4}},"wings":{"main":{"length":[80,20],"width":[120,50,40],"angle":[-10,20],"position":[30,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":0,"z":0}},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Pulse-Fighter","level":3,"model":2,"code":302,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":120,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.343,2.204,1.998,1.955,2.088,1.91,1.085,0.974,0.895,0.842,0.829,0.95,1.429,2.556,2.618,2.726,2.851,2.837,2.825,2.828,2.667,2.742,2.553,2.766,2.779,2.735,2.779,2.766,2.553,2.742,2.667,2.828,2.825,2.837,2.851,2.726,2.618,2.556,1.43,0.95,0.829,0.842,0.895,0.974,1.085,1.91,2.088,1.955,1.998,2.204],"lasers":[{"x":0,"y":-2.34,"z":-0.26,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.851}}';
                    '{"name":"Harpy","level":3,"model":3,"size":1.7,"specs":{"shield":{"capacity":[125,180],"reload":[5,7]},"generator":{"capacity":[70,100],"reload":[22,31]},"ship":{"mass":90,"speed":[105,125],"rotation":[80,120],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":1,"y":20,"z":0},"position":{"x":[-1,-1,-1,-1,-1,5,8,8,8,8],"y":[-56,-53,-30,-20,20,30,32,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,17,25,25,15,9,9,0],"height":[0,7,12,16,15,10,9,9,0],"texture":[3,3,63,10,63,63,15,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":1,"z":8},"position":{"x":[0,0,0,0,0],"y":[-10,0,20,30,35],"z":[0,2,0,0,0]},"width":[0,10,14,10,0],"height":[0,10,12,8,0],"propeller":false,"texture":[7,9,9,7]},"cannons":{"section_segments":8,"offset":{"x":20,"y":0,"z":0},"position":{"x":[0,0,0,0,-3,-3],"y":[-50,-60,-20,0,20,25],"z":[0,0,0,0,0,0]},"width":[0,4,5,10,5,0],"height":[0,4,5,10,5,0],"angle":0,"laser":{"damage":[10,18],"rate":1.5,"type":1,"speed":[130,180],"number":1,"error":0},"propeller":false,"texture":[1,63,1,3,3,4]},"cannons2":{"section_segments":8,"offset":{"x":46,"y":20,"z":-12},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-10,0,20,22],"z":[0,0,0,0,0,0]},"width":[0,3,3,5,2,0],"height":[0,3,3,5,2,0],"angle":0,"laser":{"damage":[1,2],"rate":5,"type":1,"speed":[180,210],"number":1,"error":0},"propeller":false,"texture":[1,2,4,4,4,4]}},"wings":{"xwing1":{"doubleside":true,"offset":{"x":0,"y":22,"z":0},"length":[33,3,30],"width":[25,25,45,45],"angle":[0,0,-35],"position":[0,0,-10,-30],"texture":[8,3,11],"bump":{"position":10,"size":10}}},"typespec":{"name":"Harpy","level":3,"model":3,"code":303,"specs":{"shield":{"capacity":[125,180],"reload":[5,7]},"generator":{"capacity":[70,100],"reload":[22,31]},"ship":{"mass":90,"speed":[105,125],"rotation":[80,120],"acceleration":[70,100]}},"shape":[1.224,1.202,2.145,2.197,1.926,1.549,1.312,1.158,1.953,2.306,2.212,2.123,2.075,2.074,2.118,2.085,1.935,2.044,2.124,1.697,1.519,1.729,1.93,2.454,2.423,2.385,2.423,2.454,1.93,1.729,1.519,1.697,2.124,2.044,1.935,2.085,2.118,2.074,2.075,2.123,2.212,2.306,1.953,1.158,1.312,1.549,1.926,2.197,2.145,1.202],"lasers":[{"x":0.68,"y":-2.04,"z":0,"angle":0,"damage":[10,18],"rate":1.5,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.68,"y":-2.04,"z":0,"angle":0,"damage":[10,18],"rate":1.5,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.564,"y":-1.02,"z":-0.408,"angle":0,"damage":[1,2],"rate":5,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.564,"y":-1.02,"z":-0.408,"angle":0,"damage":[1,2],"rate":5,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.454}}',
                    '{"name":"Xenon","level":3,"model":4,"size":2.2,"specs":{"shield":{"capacity":[145,225],"reload":[3,6]},"generator":{"capacity":[50,70],"reload":[21,33]},"ship":{"mass":150,"speed":[95,110],"rotation":[80,110],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-39,-35,-25,-10,10,30,47,55,52],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,8,11,14,17,12,5,0],"height":[0,5,8,8,10,11,11,5,0],"propeller":true,"texture":[6,3,4,63,2,4,3,17]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-5,"z":2},"position":{"x":[0,0,0,0,0,0,0],"y":[-5,0,20,30,34],"z":[7,3,0,0,0]},"width":[0,7,9,8,0],"height":[0,7,13,8,5],"propeller":false,"texture":[9,9,3,4,4]},"detail1":{"section_segments":12,"offset":{"x":7,"y":15,"z":4},"position":{"x":[0,0,0,2,2,0],"y":[-20,-20,-20,0,0,3],"z":[0,0,0,1,1,0]},"width":[0,4,4,4,4,0],"height":[0,4,4,4,4,0],"angle":0,"propeller":false,"texture":[12,8,8,13]},"detail2":{"section_segments":12,"offset":{"x":0,"y":-5,"z":4.1},"position":{"x":[0,0,0,0,0,0],"y":[-30,-30,-20,0,0,3],"z":[0,-0.1,0,2.5,3.5,0]},"width":[0,4,4,4,4,0],"height":[0,4,4,3.4,4,0],"angle":0,"propeller":false,"texture":[12,3,10.24,13]},"cannon1":{"section_segments":12,"offset":{"x":37,"y":39,"z":-1},"position":{"x":[0,0,0,0,0,0],"y":[-30,-40,-20,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,2,2,3,3,0],"height":[0,2,2,3,3,0],"angle":0,"laser":{"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"error":0},"propeller":true,"texture":[12,12,10,17]},"cannon2":{"section_segments":12,"offset":{"x":16,"y":39,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-30,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,2,3,4,4,0],"height":[0,2,3,4,4,0],"angle":0,"laser":{"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"error":0},"propeller":true,"texture":[12,12,63,17]}},"wings":{"main":{"length":[40,10],"width":[30,30,10],"angle":[10,49],"position":[60,70,90],"doubleside":true,"offset":{"x":0,"y":-47,"z":-4},"bump":{"position":10,"size":10},"texture":[8,63]}},"typespec":{"name":"Xenon","level":3,"model":4,"code":304,"specs":{"shield":{"capacity":[145,225],"reload":[3,6]},"generator":{"capacity":[50,70],"reload":[21,33]},"ship":{"mass":150,"speed":[95,110],"rotation":[80,110],"acceleration":[80,120]}},"shape":[2.376,2.261,1.785,1.365,1.11,0.939,0.824,0.823,0.928,0.904,0.861,0.831,1.717,1.729,1.809,1.945,2.142,2.427,2.772,2.924,2.018,1.928,1.896,1.804,1.772,1.763,1.772,1.804,1.896,1.928,2.018,2.924,2.772,2.427,2.142,1.945,1.809,1.729,1.717,0.831,0.861,0.904,0.928,0.823,0.824,0.939,1.11,1.365,1.785,2.261],"lasers":[{"x":1.628,"y":-0.044,"z":-0.044,"angle":0,"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.628,"y":-0.044,"z":-0.044,"angle":0,"damage":[1.5,3],"rate":5,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.704,"y":-0.484,"z":0.044,"angle":0,"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.704,"y":-0.484,"z":0.044,"angle":0,"damage":[1.75,3],"rate":5,"type":1,"speed":[180,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.924}}',
                    '{"name":"Shadow X-1","level":3,"model":5,"size":1,"zoom":0.8,"specs":{"shield":{"capacity":[90,130],"reload":[4,7]},"generator":{"capacity":[45,70],"reload":[22,32]},"ship":{"mass":70,"speed":[140,165],"rotation":[75,100],"acceleration":[75,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-98,-95,-70,-40,0,40,70,80,90,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,40,20,20,40,40,40,20,0],"height":[0,4,4,20,20,10,10,15,15,15,10,10],"texture":[12,5,63,4,4,63,4,4,5]},"back":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,19,2],"height":[3,5,7,8,2],"texture":[63],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-25,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-25,0,5],"z":[0,0,0,0,0,0]},"width":[0,10,15,13,0],"height":[0,10,15,5,0],"texture":[9]},"laser":{"section_segments":10,"offset":{"x":70,"y":10,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,5,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[3,4,10,3],"propeller":true,"laser":{"damage":[4,5],"rate":10,"type":1,"speed":[180,210],"number":1}}},"wings":{"top":{"doudleside":true,"offset":{"x":0,"y":50,"z":5},"length":[30],"width":[70,30],"angle":[90],"position":[0,50],"texture":[4],"bump":{"position":10,"size":15}},"side_joins":{"doubleside":true,"offset":{"x":0,"y":30,"z":-3},"length":[100],"width":[100,40],"angle":[0],"position":[-50,50],"texture":[4],"bump":{"position":10,"size":10}}},"typespec":{"name":"Shadow X-1","level":3,"model":5,"code":310,"specs":{"shield":{"capacity":[90,130],"reload":[4,7]},"generator":{"capacity":[45,70],"reload":[22,32]},"ship":{"mass":70,"speed":[140,165],"rotation":[75,100],"acceleration":[75,100]}},"shape":[2,1.978,1.939,1.641,1.422,1.261,1.149,0.937,0.86,0.885,0.916,1.446,1.622,1.699,1.74,1.789,2.12,2.469,2.739,2.828,2.076,1.786,1.975,2.035,2.131,2.294,2.131,2.035,1.975,1.786,2.076,2.828,2.739,2.469,2.12,1.789,1.74,1.699,1.622,1.446,0.916,0.885,0.86,0.937,1.149,1.261,1.422,1.641,1.939,1.978],"lasers":[{"x":1.4,"y":-0.2,"z":-0.4,"angle":0,"damage":[4,5],"rate":10,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.4,"y":-0.2,"z":-0.4,"angle":0,"damage":[4,5],"rate":10,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.828}}',
                    '{"name":"Swept-Wing","level":3,"model":6,"size":1.25,"specs":{"shield":{"capacity":[110,180],"reload":[4,6]},"generator":{"capacity":[60,80],"reload":[20,31]},"ship":{"mass":125,"speed":[115,145],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-130,-115,-90,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,25,30,35,20,0],"height":[0,10,15,25,25,20,0],"propeller":true,"texture":[63,3,2,10,4,12],"laser":{"damage":[12,21],"rate":1.5,"type":2,"speed":[190,225],"number":1,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-70,-30,-10,20,70,80],"z":[0,0,0,0,0]},"width":[0,12,15,15,10,5],"height":[0,18,25,25,18,5],"propeller":false,"texture":[9,9,9,4]},"spike":{"section_segments":6,"offset":{"x":0,"y":-100,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-70,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,10,10,15,0],"angle":0,"texture":[63],"laser":{"damage":[8,15],"rate":1.5,"type":2,"speed":[190,225],"number":1,"error":0}},"cannon":{"section_segments":6,"offset":{"x":15,"y":-65,"z":-5},"position":{"x":[0,0,0,-10,-15,-15],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,210],"number":1,"error":2.5},"propeller":false,"texture":[4,4,10,3]},"deco":{"section_segments":8,"offset":{"x":30,"y":50,"z":-5},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,30],"z":[12.5,12.5,12.5,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,10,15,10,10,0],"angle":0,"texture":[4,4,4,63,3,17],"propeller":true},"deco2":{"section_segments":8,"offset":{"x":30,"y":50,"z":20},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,30],"z":[-12.5,-12.5,-12.5,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,10,15,10,10,0],"angle":0,"texture":[4,4,4,63,3,17],"propeller":true}},"wings":{"main":{"length":[30,20],"width":[120,50,40],"angle":[-10,20],"position":[100,-50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":-60,"z":0}},"winglets":{"length":[45],"width":[40,20,30],"angle":[12.5,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":-10}},"stab":{"length":[80,10],"width":[60,40,50],"angle":[0,30],"position":[50,75,90],"doubleside":true,"texture":[63,4],"bump":{"position":0,"size":20},"offset":{"x":0,"y":-20,"z":10}}},"typespec":{"name":"Swept-Wing","level":3,"model":6,"code":311,"specs":{"shield":{"capacity":[110,180],"reload":[4,6]},"generator":{"capacity":[60,80],"reload":[20,31]},"ship":{"mass":125,"speed":[115,145],"rotation":[60,80],"acceleration":[80,100]}},"shape":[4.25,3.134,3.455,2.857,2.369,2.049,1.827,1.654,1.489,1.377,1.297,1.248,0.874,0.919,0.985,1.083,2.526,2.734,3.036,3.249,2.297,2.394,2.462,2.659,2.672,2.63,2.672,2.659,2.462,2.394,2.297,3.249,3.036,2.734,2.526,1.083,0.985,0.919,0.875,1.248,1.297,1.377,1.489,1.654,1.827,2.049,2.369,2.857,3.455,3.134],"lasers":[{"x":0,"y":-3.25,"z":0.25,"angle":0,"damage":[12,21],"rate":1.5,"type":2,"speed":[190,225],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-4.25,"z":0.25,"angle":0,"damage":[8,15],"rate":1.5,"type":2,"speed":[190,225],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.375,"y":-2.875,"z":-0.125,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,210],"number":1,"spread":0,"error":2.5,"recoil":0},{"x":-0.375,"y":-2.875,"z":-0.125,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,210],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":4.25}}',
                    '{"name":"Penetrator","level":3,"model":7,"size":1.5,"specs":{"shield":{"capacity":[100,150],"reload":[4,7]},"generator":{"capacity":[70,105],"reload":[20,32]},"ship":{"mass":115,"speed":[120,140],"rotation":[70,90],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-80,-82.5,-75,-50,0,50,105,100],"z":[0,0,0,0,0,0,10,10]},"width":[0,6,12,20,25,25,12,0],"height":[0,3,8,15,25,25,12,0],"propeller":true,"texture":[17,63,4,63,10,3,12],"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[150,180],"number":1,"error":0}},"main_sides":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-55,-55,-65,-50,0,10,90,90],"z":[0,0,0,0,0,0,10,10]},"width":[0,10,15,10,30,45,30,0],"height":[0,5,10,15,15,15,10,0],"propeller":false,"texture":[1,1,1,2,3,18,1]},"cockpit_front":{"section_segments":10,"offset":{"x":0,"y":-30,"z":5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-10,10,30,35,90],"z":[0,0,0,0,7,10]},"width":[0,12,15,15,5,3],"height":[0,18,25,25,18,5],"propeller":false,"texture":[9,9,4]},"engines":{"section_segments":12,"offset":{"x":20,"y":70,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,3,5,5,9,8,0],"height":[0,3,5,5,5,5,0],"texture":[12,6,63,63,13,17],"angle":0,"propeller":true},"cannons":{"section_segments":10,"offset":{"x":23,"y":-10,"z":0},"position":{"x":[0,0,0,0,-3,-13],"y":[-30,-27,-20,0,20,60],"z":[0,0,0,0,0,0,0]},"width":[0,4,8,10,12,3],"height":[0,3,5,15,15,3],"texture":[6,4,2,4],"angle":1,"laser":{"damage":[1,3],"rate":8,"type":1,"speed":[120,165],"number":1,"error":0}},"cannons2":{"section_segments":10,"offset":{"x":60,"y":18,"z":-5},"position":{"x":[0,0,0,0,-3,-13],"y":[-30,-26,-10,20],"z":[0,0,0,0,0,0,0]},"width":[0,4,5,7,8,0],"height":[0,3,4,5,6,0],"texture":[6,4,63,4,4],"angle":1.5,"laser":{"damage":[1,3],"rate":8,"type":1,"speed":[120,165],"number":1,"error":0}}},"wings":{"main":{"length":[40,25],"width":[60,50,40],"angle":[-5,-20],"position":[100,70,80],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":20,"y":-40,"z":5}},"main2":{"length":[40,25],"width":[60,50,40],"angle":[-5,-20],"position":[100,70,80],"doubleside":true,"bump":{"position":30,"size":10},"texture":[63,63],"offset":{"x":20,"y":-39,"z":5}},"stab":{"length":[40],"width":[50,20,20],"angle":[70,30],"position":[30,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":10,"y":30,"z":5}}},"typespec":{"name":"Penetrator","level":3,"model":7,"code":312,"specs":{"shield":{"capacity":[100,150],"reload":[4,7]},"generator":{"capacity":[70,105],"reload":[20,32]},"ship":{"mass":115,"speed":[120,140],"rotation":[70,90],"acceleration":[90,120]}},"shape":[2.48,2.482,2.146,1.759,1.445,1.368,1.322,1.252,1.153,1.084,1.038,1.909,1.914,1.959,2.58,2.687,2.853,3.084,3.098,2.457,2.476,2.545,2.846,3.522,3.311,3.156,3.311,3.522,2.846,2.545,2.476,2.457,3.098,3.084,2.853,2.687,2.58,1.959,1.914,1.909,1.038,1.084,1.153,1.252,1.322,1.368,1.445,1.759,2.146,2.482],"lasers":[{"x":0,"y":-2.475,"z":0,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.674,"y":-1.2,"z":0,"angle":1,"damage":[1,3],"rate":8,"type":1,"speed":[120,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.674,"y":-1.2,"z":0,"angle":-1,"damage":[1,3],"rate":8,"type":1,"speed":[120,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.776,"y":-0.36,"z":-0.15,"angle":1.5,"damage":[1,3],"rate":8,"type":1,"speed":[120,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.776,"y":-0.36,"z":-0.15,"angle":-1.5,"damage":[1,3],"rate":8,"type":1,"speed":[120,165],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.522}}',
                    '{"name":"Calypso","level":3,"model":8,"size":8,"specs":{"shield":{"capacity":[140,200],"reload":[2,4]},"generator":{"capacity":[60,100],"reload":[23,32]},"ship":{"mass":155,"speed":[90,110],"rotation":[60,80],"acceleration":[90,115]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-25,-20,-20,-10,0,10,20,15],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,4,4,0],"height":[0,4,4,5,5,5,5,0],"texture":[3,11,11,4,63,13,13,0],"propeller":true},"side_pipes":{"section_segments":8,"offset":{"x":4.4,"y":-10,"z":0},"position":{"x":[-3,-3,-0.5,0,-1,-1,0,0,0],"y":[-10,-10,-6,4,10,20,25,32,30],"z":[0,0,0,0,3,3,0,0,0]},"width":[0,2,2,2,2,2,2,2,0],"height":[0,2,2,2,2,2,2,2,0],"texture":[3,3,3,8,3,8,3,13,13],"propeller":true},"back_things":{"section_segments":8,"angle":0,"offset":{"x":10.5,"y":11,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-10,-8,-1,4,5,5],"z":[0,0,0,0,0,0]},"width":[0,3,3,3,2.5,0],"height":[0,3,3,3,2.5,0],"texture":[3,63,13,4,3,3]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-12,"z":4},"position":{"x":[0,0,0,0,0,0],"y":[-7,-4,0,0,5,7],"z":[0,-0.5,-1,-1,-0.5,0]},"width":[0,1,2,2,1,0],"height":[0,2,3,3,2,0],"texture":9},"front_gun":{"section_segments":8,"offset":{"x":0,"y":-21,"z":-4.5},"position":{"x":[0,0,0,0,0],"y":[-4,-5,2,5,5],"z":[0,0,0,2,2]},"width":[0,1,1,1,0],"height":[0,1,1,1,0],"texture":[17,4,4,4,4],"laser":{"damage":[10,15],"speed":[180,250],"rate":4,"angle":0,"type":1,"error":0,"number":1,"recoil":30}},"back_guns":{"section_segments":8,"offset":{"x":10.5,"y":4,"z":0},"position":{"x":[0,0,0,0],"y":[-5,-6,-3,-1],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[17,4,4,4],"laser":{"damage":[6,10],"speed":[80,100],"rate":4,"angle":0,"type":1,"error":0,"number":1,"recoil":30}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-21,"z":0},"length":[10],"width":[5,5],"angle":[0],"position":[24,30],"texture":4,"bump":{"position":15,"size":10}},"winglets":{"doubleside":true,"offset":{"x":2,"y":17,"z":3},"length":[3],"width":[5,4],"angle":[50],"position":[0,1],"texture":63,"bump":{"position":0,"size":20}}},"typespec":{"name":"Calypso","level":3,"model":8,"code":313,"specs":{"shield":{"capacity":[140,200],"reload":[2,4]},"generator":{"capacity":[60,100],"reload":[23,32]},"ship":{"mass":155,"speed":[90,110],"rotation":[60,80],"acceleration":[90,115]}},"shape":[4.163,3.623,3.173,2.814,2.266,1.843,1.582,1.404,1.212,1.083,0.994,1.868,1.854,1.847,2.228,2.321,2.464,2.668,2.96,3.285,3.298,3.032,3.313,3.666,3.583,3.206,3.583,3.666,3.313,3.032,3.298,3.285,2.96,2.668,2.464,2.321,2.228,1.847,1.854,1.868,0.994,1.083,1.212,1.404,1.582,1.843,2.266,2.814,3.173,3.623],"lasers":[{"x":0,"y":-4.16,"z":-0.72,"angle":0,"damage":[10,15],"rate":4,"type":1,"speed":[180,250],"number":1,"spread":0,"error":0,"recoil":30},{"x":1.68,"y":-0.32,"z":0,"angle":0,"damage":[6,10],"rate":4,"type":1,"speed":[80,100],"number":1,"spread":0,"error":0,"recoil":30},{"x":-1.68,"y":-0.32,"z":0,"angle":0,"damage":[6,10],"rate":4,"type":1,"speed":[80,100],"number":1,"spread":0,"error":0,"recoil":30}],"radius":4.163}}',
                    '{"name":"Phantom","level":3,"model":9,"size":3.05,"specs":{"shield":{"capacity":[135,195],"reload":[2,4]},"generator":{"capacity":[65,90],"reload":[23,34]},"ship":{"mass":150,"speed":[75,100],"rotation":[70,95],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-45,-35,-25,-5,15,40,55,45],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,4,7,7.5,10,20,17.5,10,0],"height":[0,3,5.8,10,10,15,15,10,0],"texture":[4,3,2,1,63,10,4,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-23,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-17,-6,4,15,40],"z":[-5.5,-2,0,0,-1.7]},"width":[3,5,5,5,3],"height":[2,5,5,5,3],"texture":[9,9,4,0],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":28,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,-2.5,-5],"y":[-45,-50,-30,-15,5,25,35,50,55],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,6,7.5,7.5,9,9,5,0],"height":[0,5,7.5,7.5,7.5,10,10,5,0],"angle":0,"laser":{"damage":[17,25],"rate":2,"type":1,"speed":[140,190],"number":1,"angle":0,"error":0,"recoil":75},"propeller":false,"texture":[6,3,2,63,10,1,3,63]},"side":{"section_segments":7,"offset":{"x":15,"y":5,"z":0},"position":{"x":[5,2.5,2.5,5,2,-7,-15,-8],"y":[-10,-5,0,15,30,40,45],"z":[0,0,0,0,0,0,0,0]},"width":[0,20,20,10,10,10,10,0,0,0],"height":[0,4,6,8,7,8,6,0,0,0],"propeller":false,"texture":[63,4,4,3,63,4,12]}},"wings":{"winglets":{"doubleside":true,"length":[15],"width":[20,10],"angle":[20,-10],"position":[-20,-5,-55],"bump":{"position":0,"size":5},"texture":63,"offset":{"x":7.5,"y":45,"z":10}}},"typespec":{"name":"Phantom","level":3,"model":9,"code":314,"specs":{"shield":{"capacity":[135,195],"reload":[2,4]},"generator":{"capacity":[65,90],"reload":[23,34]},"ship":{"mass":150,"speed":[75,100],"rotation":[70,95],"acceleration":[90,110]}},"shape":[2.75,2.756,2.211,4.67,4.505,3.817,3.329,2.965,2.67,2.468,2.332,2.263,2.247,2.275,2.329,2.426,2.445,2.494,2.585,2.61,2.741,3.045,2.999,3.369,3.41,3.361,3.41,3.369,2.999,3.045,2.741,2.61,2.585,2.494,2.445,2.426,2.329,2.275,2.257,2.263,2.332,2.468,2.67,2.965,3.329,3.817,4.505,4.67,2.211,2.756],"lasers":[{"x":1.708,"y":-4.27,"z":0,"angle":0,"damage":[17,25],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":75},{"x":-1.708,"y":-4.27,"z":0,"angle":0,"damage":[17,25],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":75}],"radius":4.67}}',
                    '{"name":"Flounder","level":3,"model":10,"size":1.6,"specs":{"shield":{"capacity":[165,230],"reload":[3,6]},"generator":{"capacity":[70,100],"reload":[21,34]},"ship":{"mass":200,"speed":[85,100],"rotation":[50,75],"acceleration":[45,70]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-75,-75,-50,0,75,105,90],"z":[7.5,7.5,0,0,0,0,0]},"width":[0,20,30,30,35,15,0],"height":[0,0,10,25,25,15,0],"propeller":true,"texture":[63,3,2,11,13,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-25,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-12,10,40,100],"z":[0,0,5,5,13]},"width":[0,7.5,14,17,0],"height":[0,10,14,17,0],"propeller":false,"texture":[9,9,9,4]},"cannons":{"section_segments":9,"offset":{"x":20,"y":-30,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[-45,-50,-45,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,10,10,5,5],"angle":0,"laser":{"damage":[2,3],"rate":6,"type":1,"speed":[70,120],"number":1,"error":8},"propeller":false,"texture":[16.9,4,10,4,4]},"cannon":{"section_segments":9,"offset":{"x":0,"y":-35,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[-45,-50,-45,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,10,10,10,0],"angle":0,"laser":{"damage":[3,4],"rate":6,"type":1,"speed":[90,140],"number":1,"error":2.5},"propeller":false,"texture":[16.9,4,2,4,4]}},"wings":{"main":{"length":[25,20],"width":[130,120,40],"angle":[-10,-20],"position":[30,50,30],"doubleside":true,"bump":{"position":-30,"size":5},"texture":[4,63],"offset":{"x":20,"y":-35,"z":0}},"winglets":{"length":[25],"width":[30,20],"angle":[30],"position":[30,50],"doubleside":true,"bump":{"position":-30,"size":10},"texture":[63],"offset":{"x":25,"y":35,"z":10}}},"typespec":{"name":"Flounder","level":3,"model":10,"code":315,"specs":{"shield":{"capacity":[165,230],"reload":[3,6]},"generator":{"capacity":[70,100],"reload":[21,34]},"ship":{"mass":200,"speed":[85,100],"rotation":[50,75],"acceleration":[45,70]}},"shape":[2.725,2.711,2.681,2.664,2.239,2.08,2.038,2.042,2.091,2.178,2.181,2.094,2.045,2.045,2.085,2.084,2.121,2.193,2.307,2.474,2.714,3.387,3.284,3.226,3.394,3.367,3.394,3.226,3.284,3.387,2.714,2.474,2.307,2.193,2.121,2.084,2.085,2.045,2.045,2.094,2.181,2.178,2.091,2.042,2.038,2.08,2.239,2.664,2.681,2.711],"lasers":[{"x":0.64,"y":-2.56,"z":-0.16,"angle":0,"damage":[2,3],"rate":6,"type":1,"speed":[70,120],"number":1,"spread":0,"error":8,"recoil":0},{"x":-0.64,"y":-2.56,"z":-0.16,"angle":0,"damage":[2,3],"rate":6,"type":1,"speed":[70,120],"number":1,"spread":0,"error":8,"recoil":0},{"x":0,"y":-2.72,"z":-0.16,"angle":0,"damage":[3,4],"rate":6,"type":1,"speed":[90,140],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":3.394}}',
                    '{"name":"Enforcer","level":3,"model":11,"size":1.7,"specs":{"shield":{"capacity":[170,245],"reload":[4,6]},"generator":{"capacity":[55,95],"reload":[17,28]},"ship":{"mass":225,"speed":[85,100],"rotation":[60,90],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-50,-20,10,30,75,95,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,18,30,30,30,30,30,20,0],"height":[0,18,30,30,30,30,30,20,0],"texture":[4,63,10,11,1,8,63,11],"propeller":false},"cannon":{"section_segments":8,"offset":{"x":0,"y":-20,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-53,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,7,15,10,15,0],"height":[0,7,15,15,10,0],"texture":[6],"laser":{"damage":[15,30],"rate":0.75,"type":2,"speed":[130,180],"number":1,"error":0}},"side":{"section_segments":8,"offset":{"x":40,"y":-1,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,-20,-20,-20,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,5,5],"height":[0,15,10,10,10,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[1,2],"rate":4,"type":1,"speed":[130,170],"number":1,"angle":0,"error":0}},"side2":{"section_segments":8,"offset":{"x":30,"y":-1,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,-20,-20,-20,-10,20,0],"z":[0,0,0,0,0,0,0,0]},"width":[0,15,5,5,5,5],"height":[0,15,10,10,10,10,0],"texture":[6,6,1,1,11,2,12],"laser":{"damage":[2,3],"rate":3,"type":1,"speed":[130,170],"number":2,"angle":0,"error":0}},"cockpit":{"section_segments":20,"offset":{"x":0,"y":-35,"z":32},"position":{"x":[0,0,0,0,0,0,0],"y":[-16,0,20,50,80],"z":[3,0,0,0,0]},"width":[0,12,15,10,5],"height":[0,10,15,8,5],"propeller":false,"texture":[9,9,9,4,4]},"partofthisship":{"section_segments":12,"offset":{"x":35,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-35,-40,-35,-20,20,40,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,14,20,25,25,25,25,15,0,5,0],"height":[0,14,20,25,25,25,25,15,0,5,0,0],"texture":[2,63,4,10,3,2,63,17,17,12],"propeller":true},"partofthisship2":{"section_segments":12,"offset":{"x":27,"y":0,"z":20},"position":{"x":[-15,-5,-5,-5,-15],"y":[-40,0,20,40,80],"z":[-5,0,0,0,-5]},"width":[10,15,15,15,10,0],"height":[10,15,15,15,10,0,0],"texture":[3,63,10,3],"propeller":false}},"wings":{"winglets":{"doubleside":true,"offset":{"x":15,"y":70,"z":25},"length":[25],"width":[40,10],"angle":[20],"position":[0,20,20],"texture":[4],"bump":{"position":0,"size":10}},"winglets2":{"doubleside":true,"offset":{"x":20,"y":-50,"z":5},"length":[25],"width":[40,10],"angle":[20],"position":[0,-20,20],"texture":[3],"bump":{"position":0,"size":10}}},"typespec":{"name":"Enforcer","level":3,"model":11,"code":316,"specs":{"shield":{"capacity":[170,245],"reload":[4,6]},"generator":{"capacity":[55,95],"reload":[17,28]},"ship":{"mass":225,"speed":[85,100],"rotation":[60,90],"acceleration":[70,100]}},"shape":[2.555,2.596,2.622,2.744,2.948,2.759,2.39,2.416,2.367,2.295,2.192,2.104,2.055,2.055,2.106,2.192,2.325,2.514,2.79,3.156,3.369,3.501,3.485,3.333,3.288,3.236,3.288,3.333,3.485,3.501,3.369,3.156,2.79,2.514,2.325,2.192,2.106,2.055,2.055,2.104,2.192,2.295,2.367,2.416,2.39,2.759,2.948,2.744,2.622,2.596],"lasers":[{"x":0,"y":-2.482,"z":0.238,"angle":0,"damage":[15,30],"rate":0.75,"type":2,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.36,"y":-1.734,"z":0,"angle":0,"damage":[1,2],"rate":4,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.36,"y":-1.734,"z":0,"angle":0,"damage":[1,2],"rate":4,"type":1,"speed":[130,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.02,"y":-1.734,"z":0,"angle":0,"damage":[2,3],"rate":3,"type":1,"speed":[130,170],"number":2,"spread":0,"error":0,"recoil":0},{"x":-1.02,"y":-1.734,"z":0,"angle":0,"damage":[2,3],"rate":3,"type":1,"speed":[130,170],"number":2,"spread":0,"error":0,"recoil":0}],"radius":3.501}}',
                ]
            },
            {
                TIER: 4,
                SHIPS: [
                    // MCST
                    '{"name":"Valence","level":4,"model":1,"size":1.6,"specs":{"shield":{"capacity":[165,225],"reload":[3,6]},"generator":{"capacity":[90,150],"reload":[32,46]},"ship":{"mass":150,"speed":[105,120],"rotation":[80,130],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-110,-100,-70,-25,25,55,80,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,14,20,25,28,27,23,20,15,0],"height":[0,14,20,21,23,25,23,20,15,0],"texture":[4,31,11,31,4,10,3,12,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,-20,5,35,60,55],"z":[-5,0,0,0,0,3,3]},"width":[5,12,15,14,14,10,0],"height":[0,3,10,13,13,8,0],"texture":[31,9,9,3,31,4,3,31]},"sides":{"section_segments":8,"offset":{"x":25,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,-3,0],"y":[0,20,45,65,90,115,120],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,14,15,13,10,0],"height":[0,10,12,15,15,10,0],"texture":[1,11,63,3,4,11],"propeller":false},"gun1":{"section_segments":12,"offset":{"x":0,"y":-68,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-47,-50,-47,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,5,6,6,7,0],"height":[0,5,6,6,10,0],"angle":0,"laser":{"damage":[5,7],"rate":10,"type":2,"speed":[170,200],"number":1,"error":5},"propeller":false,"texture":[17,31,3,3]},"gun2":{"section_segments":12,"offset":{"x":6,"y":-68,"z":-4},"position":{"x":[0,0,0,0,0,0],"y":[-47,-50,-47,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,5,6,6,7,0],"height":[0,5,6,6,10,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"error":0},"propeller":false,"texture":[17,31,3,3]},"bumps":{"section_segments":8,"offset":{"x":75,"y":50,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-31,-35,-30,-15,-5,-4,14,15,35,45,42],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,12,14,14,14,11,11,14,14,12,0],"height":[0,8,12,14,14,14,11,11,14,14,12,0],"texture":[4,17,31,11,31,4,13,4,3,31,17],"propeller":true}},"wings":{"top":{"doubleside":true,"offset":{"x":5,"y":20,"z":15},"length":[20],"width":[60,30],"angle":[15],"position":[0,60],"texture":[31],"bump":{"position":-30,"size":5}},"back":{"doubleside":true,"offset":{"x":10,"y":30,"z":-5},"length":[70,15],"width":[120,60,35],"angle":[-5,0],"position":[0,30,20],"texture":[3,31],"bump":{"position":0,"size":5}},"back2":{"doubleside":true,"offset":{"x":10,"y":30,"z":0},"length":[75,0],"width":[45,24,0],"angle":[-5,0],"position":[-12,35,45],"texture":[31],"bump":{"position":0,"size":10}},"front":{"doubleside":true,"offset":{"x":10,"y":-50,"z":-5},"length":[30,15],"width":[80,40,25],"angle":[-5,0],"position":[0,-10,-10],"texture":[4,31],"bump":{"position":0,"size":5}}},"typespec":{"name":"Valence","level":4,"model":1,"code":401,"specs":{"shield":{"capacity":[165,225],"reload":[3,6]},"generator":{"capacity":[90,150],"reload":[32,46]},"ship":{"mass":150,"speed":[105,120],"rotation":[80,130],"acceleration":[90,110]}},"shape":[3.783,3.792,3.294,2.852,2.875,2.91,2.753,2.408,1.16,1.149,1.165,1.247,1.414,1.694,2.94,3.259,3.454,3.723,3.903,4.122,3.945,3.404,3.179,3.138,3.236,3.206,3.236,3.138,3.179,3.404,3.945,4.122,3.903,3.723,3.454,3.259,2.94,1.694,1.436,1.247,1.165,1.149,1.16,2.408,2.753,2.91,2.875,2.852,3.294,3.792],"lasers":[{"x":0,"y":-3.776,"z":0.224,"angle":0,"damage":[5,7],"rate":10,"type":2,"speed":[170,200],"number":1,"spread":0,"error":5,"recoil":0},{"x":0.192,"y":-3.776,"z":-0.128,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.192,"y":-3.776,"z":-0.128,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.122}}';
                    '{"name":"Rokton","level":4,"model":2,"size":1.75,"specs":{"shield":{"capacity":[170,250],"reload":[4,6]},"generator":{"capacity":[90,140],"reload":[23,38]},"ship":{"mass":215,"speed":[80,100],"rotation":[55,75],"acceleration":[60,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-85,-90,-55,-30,25,50,90,80],"z":[0,0,0,0,0,0,0,0]},"width":[0,13,21,24,28,25,18,0],"height":[0,9,14,20,22,20,17,0],"texture":[63,63,4,11,63,10,17],"propeller":true,"laser":{"damage":[30,50],"rate":1,"type":1,"speed":[170,220],"number":1,"recoil":10,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-62,"z":12},"position":{"x":[0,0,0,0,0,0,0],"y":[-18,-5,20,30,40],"z":[0,0,0,0,0]},"width":[0,8,13,10,0],"height":[0,7,14,12,0],"texture":[7,9,4,4]},"side":{"section_segments":10,"offset":{"x":42,"y":45,"z":0},"position":{"x":[-8,-8,-2,0,0,0,0],"y":[-95,-100,-50,-20,-5,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,10,18,14,19,12,0],"height":[0,10,20,19,25,14,0],"texture":[16.9,10,11,63,8,16.9],"propeller":true,"laser":{"damage":[18,25],"rate":1,"type":1,"speed":[160,200],"number":1,"recoil":50,"error":0}},"cannons":{"section_segments":8,"offset":{"x":65,"y":-5,"z":-18},"position":{"x":[0,0,0,0,0],"y":[-30,-35,8,30,40],"z":[0,0,0,0,0]},"width":[0,6,12,15,0],"height":[0,5,8,8,0],"texture":[2,2,63,63],"angle":2,"laser":{"damage":[8,12],"rate":1,"type":1,"speed":[120,150],"number":1,"recoil":0,"error":0}}},"wings":{"side":{"doubleside":true,"offset":{"x":0,"y":40,"z":1},"length":[50],"width":[70,40],"angle":[-10],"position":[-30,20],"texture":[8],"bump":{"position":-20,"size":14}},"main":{"offset":{"x":30,"y":50,"z":-10},"length":[50,20],"width":[50,40,10],"texture":[4,63],"angle":[0,10],"position":[10,-20,-50],"doubleside":true,"bump":{"position":-10,"size":10}}},"typespec":{"name":"Rokton","level":4,"model":2,"code":402,"specs":{"shield":{"capacity":[170,250],"reload":[4,6]},"generator":{"capacity":[90,140],"reload":[23,38]},"ship":{"mass":215,"speed":[80,100],"rotation":[55,75],"acceleration":[60,90]}},"shape":[3.507,3.529,3.04,2.375,2.28,2.455,2.412,2.232,2.818,2.798,2.702,2.656,3.494,3.494,3.406,3.307,3.28,3.302,3.21,3.104,3.554,3.815,3.674,3.496,2.85,2.805,2.85,3.496,3.674,3.815,3.554,3.104,3.21,3.302,3.28,3.307,3.406,3.494,3.494,2.656,2.702,2.798,2.818,2.232,2.412,2.455,2.28,2.375,3.04,3.529],"lasers":[{"x":0,"y":-3.5,"z":0,"angle":0,"damage":[30,50],"rate":1,"type":1,"speed":[170,220],"number":1,"spread":0,"error":0,"recoil":10},{"x":1.19,"y":-1.925,"z":0,"angle":0,"damage":[18,25],"rate":1,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":-1.19,"y":-1.925,"z":0,"angle":0,"damage":[18,25],"rate":1,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":2.232,"y":-1.399,"z":-0.63,"angle":2,"damage":[8,12],"rate":1,"type":1,"speed":[120,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.232,"y":-1.399,"z":-0.63,"angle":-2,"damage":[8,12],"rate":1,"type":1,"speed":[120,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.815}}';
                    '{"name":"Ateon","level":4,"model":3,"size":1.75,"specs":{"shield":{"capacity":[140,200],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[25,43]},"ship":{"mass":175,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-82.5,-75,-50,5,50,105,95,95],"z":[0,0,0,0,0,0,0,0]},"width":[5,15,25,30,40,20,15,0],"height":[0,10,15,25,25,15,10,0],"propeller":true,"texture":[9,4,63,63,18,13,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-82.5,-75,-50,-25,40,75,90],"z":[0,0,5,5,0,10,15]},"width":[5,15,22.5,25,35,20,10],"height":[0,10,15,20,25,20,0],"propeller":false,"texture":[9,9,9,10,8,63]},"central_cannon":{"section_segments":8,"offset":{"x":22.5,"y":0,"z":0},"position":{"x":[0,0,5,5,0,0,0],"y":[-55,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"error":0,"angle":3},"propeller":false,"texture":[6,4]},"wing_laser":{"section_segments":10,"offset":{"x":60,"y":-5,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,50,70,60,60],"z":[5,5,5,5,5,5,5,0,0,0,0]},"width":[0,5,10,10,5,5,5,10,6,5,0],"height":[0,5,10,10,5,5,5,10,5,4,0],"texture":[6,4,10,3,4,3,2,2,15.9,17],"propeller":true,"laser":{"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"error":0,"recoil":0}},"cockpit_ring":{"section_segments":12,"offset":{"x":0,"y":-21,"z":12.6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-5,-5,0,5,6,7,7],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,0,28,30,30,17,15,0],"height":[5,22.5,22.5,22.5,22.5,22.5,15,0],"texture":63},"cockpit_deco":{"section_segments":12,"offset":{"x":0,"y":-50,"z":31},"position":{"x":[0,0,0,0,0,0,0],"y":[-32,-32.8,-25,0,20,30,30],"z":[-20,-20.4,-13.8,-4.7,-1,-0.9,-5]},"width":[0,0.5,3,4,4,9,0],"height":[0,0,3,4,5,5,0],"texture":[9,63],"angle":0},"wingdeco1":{"section_segments":8,"offset":{"x":70,"y":30,"z":4},"position":{"x":[-2,0,1,1,-1,-4,-4.5],"y":[-40,-30,-10,0,15,25,32],"z":[-7,-5,-3,-2,0,-5,-15]},"width":[0,1,2,2,1,1,0],"height":[0,1,2,3,2,1,0],"angle":0,"texture":4},"wingdeco2":{"section_segments":8,"offset":{"x":50,"y":35,"z":8},"position":{"x":[5,2,-1,-2,-1,1,4,4.1],"y":[-45,-40,-30,-10,0,20,28,25],"z":[-10,-7,-5,-3,-2,0,-5,-19]},"width":[0,1,1,2,2,1,1,0.5],"height":[0,1,1,2,3,2,1,0],"angle":0,"texture":4},"back_spikes":{"section_segments":12,"offset":{"x":35,"y":65,"z":10},"position":{"x":[-5,-2,-2,-5,-5],"y":[-30,-23,0,25,33],"z":[0,0,0,0,0]},"width":[0,3,3,3,0],"height":[0,5,5,5,0],"texture":[6,4,4,1],"angle":0}},"wings":{"main":{"doubleside":true,"length":[80,10],"width":[80,40,30],"angle":[-10,20],"position":[30,0,40],"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":10,"y":20,"z":10}},"top":{"length":[40,10],"width":[50,20,20],"angle":[10,30],"position":[70,75,100],"doubleside":true,"texture":[3.25,63],"bump":{"position":0,"size":10},"offset":{"x":0,"y":0,"z":20}}},"typespec":{"name":"Ateon","level":4,"model":3,"code":403,"specs":{"shield":{"capacity":[140,200],"reload":[4,6]},"generator":{"capacity":[100,150],"reload":[25,43]},"ship":{"mass":175,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.898,2.888,2.688,2.228,2.039,1.888,1.728,1.612,2.446,2.498,2.465,2.427,2.484,3.214,3.386,3.642,3.917,4.243,4.324,3.235,2.867,3.946,4.201,3.664,3.735,3.682,3.735,3.664,4.201,3.946,2.867,3.235,4.324,4.243,3.917,3.642,3.386,3.214,3.107,2.427,2.465,2.498,2.446,1.612,1.728,1.888,2.039,2.228,2.688,2.888],"lasers":[{"x":0.787,"y":-1.925,"z":0,"angle":0,"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"spread":3,"error":0,"recoil":0},{"x":-0.787,"y":-1.925,"z":0,"angle":0,"damage":[1.5,2.25],"rate":5,"type":1,"speed":[100,150],"number":2,"spread":3,"error":0,"recoil":0},{"x":2.1,"y":-1.225,"z":-0.35,"angle":0,"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.1,"y":-1.225,"z":-0.35,"angle":0,"damage":[9,15],"rate":3,"type":1,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.324}}';
                    '{"name":"Mercury","level":4,"model":4,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[100,150],"reload":[30,50]},"ship":{"mass":200,"speed":[85,105],"rotation":[60,90],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-50,-40,-30,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,15,20,30,35,20,0],"height":[1,5,10,15,25,15,10,0],"texture":[1,4,3,63,11,10,12],"propeller":true,"laser":{"damage":[20,40],"rate":1,"type":2,"speed":[170,200],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-20,0,20,50],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":[4,9,4,4],"propeller":false},"deco":{"section_segments":8,"offset":{"x":70,"y":0,"z":-10},"position":{"x":[0,0,0,10,-5,0,0,0],"y":[-115,-80,-100,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,15,15,20,10,0],"height":[1,5,15,20,35,30,10,0],"texture":[6,6,4,63,63,4,12],"angle":0,"propeller":true},"wingends":{"section_segments":8,"offset":{"x":115,"y":25,"z":-5},"position":{"x":[0,2,4,2,0,0],"y":[-20,-10,0,10,20,15],"z":[0,0,0,0,0,0]},"width":[2,3,6,3,4,0],"height":[5,15,22,17,5,0],"texture":[4,4,4,4,6],"propeller":true,"angle":2,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"error":0}}},"wings":{"main":{"length":[80,40],"width":[40,30,20],"angle":[-10,20],"position":[30,50,30],"texture":[11,11],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}},"font":{"length":[80,30],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Mercury","level":4,"model":4,"code":404,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[100,150],"reload":[30,50]},"ship":{"mass":200,"speed":[85,105],"rotation":[60,90],"acceleration":[60,80]}},"shape":[1.303,1.306,1.221,1.135,3.514,3.457,3.283,3.008,2.819,2.69,2.614,2.461,2.233,3.14,3.312,3.323,3.182,2.865,2.958,3.267,3.33,3.079,2.187,2.651,2.647,2.605,2.647,2.651,2.187,3.079,3.33,3.267,2.958,2.865,3.182,3.323,3.312,3.14,2.233,2.461,2.614,2.69,2.819,3.008,3.283,3.457,3.514,1.135,1.221,1.306],"lasers":[{"x":0,"y":-1.3,"z":0.26,"angle":0,"damage":[20,40],"rate":1,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.972,"y":0.13,"z":-0.13,"angle":2,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.972,"y":0.13,"z":-0.13,"angle":-2,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.514}}';
                    '{"name":"Comet","level":4,"model":5,"size":1.55,"specs":{"shield":{"capacity":[140,185],"reload":[5,8]},"generator":{"capacity":[80,115],"reload":[33,45]},"ship":{"mass":120,"speed":[90,115],"rotation":[70,90],"acceleration":[100,140]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-80,-80,-75,-50,0,50,65],"z":[0,0,0,0,0,0,8.9]},"width":[0,5,12.5,20,30,25,10],"height":[0,4,10,15,15,15,0],"propeller":false,"texture":[4,4,63,4,10,18]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-45,"z":17.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-20,5,35,70,70],"z":[-5,-2.5,0,0,0,0]},"width":[5,10,15,14,10,5],"height":[0,10,15,14,10,5],"propeller":false,"texture":[7,9,3,63]},"cannon1":{"section_segments":12,"offset":{"x":60,"y":20,"z":15},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,0,20,55],"z":[0,0,0,0,0,0]},"width":[0,2.5,5,5,7.5,5],"height":[0,2.5,5,5,7.5,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"error":0},"propeller":false,"texture":[17,18,13,4,4]},"cannon2":{"section_segments":12,"offset":{"x":60,"y":20,"z":5},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,0,20,55],"z":[0,0,0,0,0,0]},"width":[0,2.5,5,5,7.5,5],"height":[0,2.5,5,5,7.5,0],"angle":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"error":0},"propeller":false,"texture":[17,18,13,4,4]},"deco":{"section_segments":8,"offset":{"x":70,"y":55,"z":10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,20,22],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"texture":[4,63,3,63,4]},"propulsors":{"section_segments":6,"offset":{"x":17.5,"y":20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,50,40],"z":[0,0,0,0,0,5,5,0,0,0]},"width":[0,10,10,20,17.5,15,15,20,15,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[18,2,3,4,63,8,4,63,16.9],"propeller":true}},"wings":{"main":{"length":[80],"width":[90,30,40],"angle":[0,0],"position":[0,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63],"offset":{"x":0,"y":0,"z":10}}},"typespec":{"name":"Comet","level":4,"model":5,"code":405,"specs":{"shield":{"capacity":[140,185],"reload":[5,8]},"generator":{"capacity":[80,115],"reload":[33,45]},"ship":{"mass":120,"speed":[90,115],"rotation":[70,90],"acceleration":[100,140]}},"shape":[2.485,2.483,2.249,1.825,1.527,1.31,1.171,1.07,1.024,2.149,2.098,2.036,2.014,2.39,2.562,2.812,3.005,3.161,3.255,3.288,3.017,2.303,2.367,2.281,2.209,2.165,2.209,2.281,2.367,2.303,3.017,3.288,3.255,3.161,3.005,2.812,2.562,2.39,2.015,2.036,2.098,2.149,1.024,1.07,1.171,1.31,1.527,1.825,2.249,2.483],"lasers":[{"x":1.86,"y":-0.93,"z":0.465,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.86,"y":-0.93,"z":0.465,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[140,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.86,"y":-0.93,"z":0.155,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.86,"y":-0.93,"z":0.155,"angle":0,"damage":[3,5],"rate":4,"type":1,"speed":[160,195],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.288}}';
                    '{"name":"Axis","level":4,"model":6,"size":1.6,"specs":{"shield":{"capacity":[155,195],"reload":[4,7]},"generator":{"capacity":[80,125],"reload":[25,42]},"ship":{"mass":175,"speed":[60,105],"rotation":[50,75],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":11,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-75,-50,-34,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4,14,20,24,25,25,25,20,0],"height":[0,5,10,12,12,20,15,15,15,0],"texture":[6,4,63,10,3,8,4,12,17],"propeller":true,"laser":{"damage":[10,16],"rate":3,"type":1,"speed":[130,190],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-85,"z":19},"position":{"x":[0,0,0,0,0,0],"y":[25,45,60,95,105],"z":[-1,-4,-3,-6,3]},"width":[4,12,14,15,5],"height":[0,12,15,15,0],"texture":[8.98,8.98,4]},"MainGun":{"section_segments":10,"offset":{"x":0,"y":-12,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-100,-110,-45,0,30,40,70,75,80,84],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,10,15,15,15,15,10,0],"height":[0,5,5,15,15,15,15,15,10,0],"texture":[17,12,4,63,4,18,4,13,3],"laser":{"damage":[4,8],"rate":5,"type":1,"speed":[125,190],"recoil":0,"number":1,"error":0},"propeller":false},"UselessGun":{"section_segments":12,"offset":{"x":35,"y":-5,"z":0},"position":{"x":[0,0,5,5,-3,0,0,0,0,0],"y":[-40,-30,-5,35,60,65,70,75,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,10,5,0],"height":[0,5,10,10,15,10,10,5,0],"texture":[6,4,12,4,63,18,4,17],"propeller":true,"laser":{"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"recoil":0,"number":1,"error":0}}},"wings":{"main":{"length":[20,50,20],"width":[0,50,40,60],"angle":[0,-10,20],"position":[20,50,10,25],"texture":[3,8,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":0,"y":-10,"z":0}},"front":{"length":[45],"width":[180,25],"angle":[-16],"position":[-30,26],"texture":[63],"doubleside":true,"bump":{"position":-50,"size":2},"offset":{"x":6,"y":0,"z":10}},"shields":{"doubleside":true,"offset":{"x":46,"y":10,"z":-11},"length":[0,10,20,10],"width":[20,20,55,55,20,20],"angle":[0,50,110,190],"position":[10,10,0,0,10],"texture":[7],"bump":{"position":0,"size":4}}},"typespec":{"name":"Axis","level":4,"model":6,"code":406,"specs":{"shield":{"capacity":[155,195],"reload":[4,7]},"generator":{"capacity":[80,125],"reload":[25,42]},"ship":{"mass":175,"speed":[60,105],"rotation":[50,75],"acceleration":[80,100]}},"shape":[3.908,3.695,2.824,2.294,1.984,1.824,1.799,1.717,1.654,1.616,2.425,2.858,2.838,2.838,2.905,3.029,3.164,2.071,2.11,2.335,2.55,2.58,2.475,2.328,2.28,2.304,2.28,2.328,2.475,2.58,2.55,2.335,2.11,2.071,3.164,3.029,2.905,2.838,2.838,2.858,2.425,1.616,1.654,1.717,1.799,1.824,1.984,2.294,2.824,3.695],"lasers":[{"x":0,"y":-3.04,"z":0.32,"angle":0,"damage":[10,16],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":0,"y":-3.904,"z":0,"angle":0,"damage":[4,8],"rate":5,"type":1,"speed":[125,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.12,"y":-1.44,"z":0,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.12,"y":-1.44,"z":0,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[150,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.908}}';
                    '{"name":"Starslicer","level":4,"model":7,"size":1.6,"specs":{"shield":{"capacity":[160,210],"reload":[4,6]},"generator":{"capacity":[90,165],"reload":[26,42]},"ship":{"mass":170,"speed":[90,110],"rotation":[40,90],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-97,-80,-76,-20,0,20,60,80,90,100,90],"z":[-7,-7,-4,-4,0,0,0,0,0,0,0,0]},"width":[0,10,20,20,20,15,25,25,20,20,15,0],"height":[0,7,11,11,11,10,11,14,14,14,11,0],"texture":[1,2,4,10,63,3,10,63,4,13,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-18,-5,0,10,16,18],"z":[0,0,0,0,0,0,0]},"width":[0,7,9,9,9,4,0],"height":[0,6,8,8,8,6,0],"texture":9},"guns_1":{"section_segments":8,"offset":{"x":28,"y":-30,"z":-5},"position":{"x":[0,0,0,0,0,0,0,-3,-3],"y":[-45,-40,-12,0,40,50,60,80,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,8,8,8,8,0],"height":[0,5,5,5,5,5,5,5,0],"texture":[6,63,4,12,4,4,3],"laser":{"damage":[3,5],"speed":[130,190],"rate":4,"number":1,"angle":0}},"guns_2":{"section_segments":8,"offset":{"x":50,"y":39,"z":-18},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-10,25,45,40],"z":[0,0,0,0,0,0]},"width":[0,5,7,7,6,0],"height":[0,5,7,7,6,0],"texture":[6,63,4,3,18],"angle":2,"laser":{"damage":[3,5],"speed":[130,190],"rate":4,"number":1,"angle":0}}},"wings":{"wing_1":{"length":[50,20],"width":[110,50,40],"angle":[-30,10],"position":[40,70,60],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":10,"y":-15,"z":5}}},"typespec":{"name":"Starslicer","level":4,"model":7,"code":407,"specs":{"shield":{"capacity":[160,210],"reload":[4,6]},"generator":{"capacity":[90,165],"reload":[26,42]},"ship":{"mass":170,"speed":[90,110],"rotation":[40,90],"acceleration":[100,130]}},"shape":[3.2,3.147,2.801,2.562,2.476,1.965,1.67,1.517,1.383,1.285,1.218,1.171,1.718,1.753,1.822,2.509,2.661,2.887,3.128,3.112,3.252,3.18,2.824,3.063,3.236,3.206,3.236,3.063,2.824,3.18,3.252,3.112,3.128,2.887,2.661,2.509,1.822,1.753,1.718,1.171,1.218,1.285,1.383,1.517,1.67,1.965,2.476,2.562,2.801,3.147],"lasers":[{"x":0.896,"y":-2.4,"z":-0.16,"angle":0,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.896,"y":-2.4,"z":-0.16,"angle":0,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.55,"y":-0.191,"z":-0.576,"angle":2,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.55,"y":-0.191,"z":-0.576,"angle":-2,"damage":[3,5],"rate":4,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.252}}';
                    '{"name":"Guardian","level":4,"model":8,"size":1.85,"specs":{"shield":{"capacity":[180,250],"reload":[4,6]},"generator":{"capacity":[80,110],"reload":[24,37]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-90,-85,-50,-40,-20,0,30,70,75],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,25,28,25,20,15,10,0],"height":[0,7,20,20,20,20,15,10,0],"texture":[6,10,3,63,12,4,8,3],"propeller":false,"laser":{"damage":[40,75],"rate":1,"type":1,"speed":[130,185],"number":1,"recoil":75,"error":0}},"ShieldSection":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-30,"z":0},"position":{"x":[0,0,10,13,13,13,-10,-10,0],"y":[-5,-5,0,30,30,50,60,100,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,20,0],"height":[0,5,5,5,5,5,5,5,0],"texture":[3,12,63,2,2,3,4,7],"propeller":false},"Engines1":{"section_segments":12,"offset":{"x":43,"y":-31,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-19,-10,-14,30,30,50,60,100,95],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,10,10,10,13,13,13,0],"height":[0,3,10,10,10,10,10,10,0],"texture":[6,18,4,3,63,2,3,17],"propeller":true,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[130,190],"number":1,"recoil":0,"error":0}},"Engines2":{"section_segments":12,"offset":{"x":15,"y":-31,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[10,0,0,20,40,50,60,100,95],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,8,8,8,8,10,10,0],"height":[0,8,8,8,8,8,10,10,0],"texture":[12,63,7,3,63,2,3,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-45,"z":11},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,-4,15,15],"z":[0,-2,0,0,8]},"width":[0,8,12,10,0],"height":[0,10,15,12,0],"texture":[9,9,4],"propeller":false}},"wings":{"join":{"offset":{"x":44,"y":30,"z":0},"length":[45,23],"width":[60,30,16],"angle":[-20,9],"position":[0,20,0,50],"texture":[8],"bump":{"position":10,"size":10}}},"typespec":{"name":"Guardian","level":4,"model":8,"code":408,"specs":{"shield":{"capacity":[180,250],"reload":[4,6]},"generator":{"capacity":[80,110],"reload":[24,37]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"shape":[3.33,3.229,2.768,2.341,2.049,2.16,2.44,2.572,2.422,2.328,2.232,2.171,2.157,2.174,4.163,4.269,4.205,4.069,4.001,3.378,3.288,3.024,2.862,2.723,2.69,2.775,2.69,2.723,2.862,3.024,3.288,3.378,4.001,4.069,4.205,4.269,4.163,2.174,2.158,2.171,2.232,2.328,2.422,2.572,2.44,2.16,2.049,2.341,2.768,3.229],"lasers":[{"x":0,"y":-3.33,"z":0,"angle":0,"damage":[40,75],"rate":1,"type":1,"speed":[130,185],"number":1,"spread":0,"error":0,"recoil":75},{"x":1.591,"y":-1.85,"z":0,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.591,"y":-1.85,"z":0,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[130,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.269}}';
                    '{"name":"Wolverine","level":4,"model":17,"size":1.7,"specs":{"shield":{"capacity":[100,140],"reload":[5,8]},"generator":{"capacity":[90,150],"reload":[24,38]},"ship":{"mass":125,"speed":[115,140],"rotation":[50,90],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-79,-84,-82,-60,-10,36,30],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,5,17,22,14,0],"height":[0,2,5,18,29,15,0],"propeller":true,"texture":[12,5,63,1,10,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":15,"z":13.45},"position":{"x":[0,0,0,0],"y":[-50,-40,-25,-10],"z":[0,-2,0,-1.5]},"width":[0,10,12,10,0],"height":[0,10,15,16,0],"texture":[9]},"cannon":{"section_segments":6,"offset":{"x":38,"y":0,"z":-8.75},"position":{"x":[0,0,0,0,0,0],"y":[-50,-56,-20,-10,10,0],"z":[0,0,0,0,5,0]},"width":[0,4,6,10,7,0],"height":[0,4,6,15,5,0],"angle":0,"laser":{"damage":[4,6],"rate":3,"type":1,"speed":[130,160],"number":5,"angle":20,"error":0},"propeller":false,"texture":[3,3,10,3]},"side_propulsors":{"section_segments":12,"offset":{"x":24,"y":-5,"z":0},"position":{"x":[-2,-7,-3,-9,-12,-10],"y":[10,0,20,50,70,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,8,6,0],"height":[0,10,18,10,12,0],"texture":[17,63,4,12,17],"propeller":true}},"wings":{"top_join":{"doubleside":true,"offset":{"x":16,"y":5,"z":0},"length":[20],"width":[40,30],"angle":[40],"position":[0,50],"texture":[63],"bump":{"position":10,"size":10}},"side_joins":{"doubleside":true,"offset":{"x":11,"y":0,"z":0},"length":[38,-4,14],"width":[45,40,100,30],"angle":[-10,0,10],"position":[35,-5,0,0],"texture":[11,63],"bump":{"position":15,"size":23}}},"typespec":{"name":"Wolverine","level":4,"model":17,"code":417,"specs":{"shield":{"capacity":[100,140],"reload":[5,8]},"generator":{"capacity":[90,150],"reload":[24,38]},"ship":{"mass":125,"speed":[115,140],"rotation":[50,90],"acceleration":[90,110]}},"shape":[2.007,1.973,1.692,1.48,2.254,2.369,2.274,2.18,2.093,2.043,2.044,2.041,1.994,1.994,2.041,2.044,2.043,2.093,2.18,2.274,1.986,2.496,2.607,2.293,2.25,2.078,2.25,2.293,2.607,2.496,1.986,2.274,2.18,2.093,2.043,2.044,2.041,1.994,1.994,2.041,2.044,2.043,2.093,2.18,2.274,2.369,2.254,1.48,1.692,1.973],"lasers":[{"x":1.292,"y":-1.904,"z":-0.298,"angle":0,"damage":[4,6],"rate":3,"type":1,"speed":[130,160],"number":5,"spread":20,"error":0,"recoil":0},{"x":-1.292,"y":-1.904,"z":-0.298,"angle":0,"damage":[4,6],"rate":3,"type":1,"speed":[130,160],"number":5,"spread":20,"error":0,"recoil":0}],"radius":2.607}}';
                    '{"name":"Boomerang","level":4,"model":18,"size":1.6,"specs":{"shield":{"capacity":[125,175],"reload":[4,6.5]},"generator":{"capacity":[50,80],"reload":[27,40]},"ship":{"mass":170,"speed":[110,140],"rotation":[70,85],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-125,-120,-100,-50,0,40,90,120,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,15,20,25,30,20,20,0],"height":[0,5,15,20,25,30,20,20,0],"texture":[4,63,2,1,4,10,13,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-85,"z":11},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,10,30,60],"z":[-2,0,0,0,10]},"width":[0,6,8,10,0],"height":[0,5,14,14,0],"texture":[3,9,9,4],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":26,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,-5,-10,-10],"y":[-80,-90,-75,-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,8,8,10,10,16,18,15,0],"height":[0,5,7,8,10,10,10,15,15,0],"angle":0,"laser":{"damage":[25,40],"rate":1,"type":2,"speed":[130,195],"number":1,"error":0,"recoil":100,"angle":0},"propeller":false,"texture":[13,3,2,3,10,3,63,4,18]},"side_propulsors":{"section_segments":10,"offset":{"x":25,"y":35,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-1,6,8,25,30,40,60,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,9,10,10,8,8,0,0,0],"height":[0,8,9,10,10,8,8,0,0,0],"propeller":true,"texture":[4,2,10,2,63,13,17,17]}},"wings":{"main":{"offset":{"x":0,"y":70,"z":0},"length":[50,22,12],"width":[70,50,50,20],"texture":[4,8,63],"angle":[-10,-10,-10],"position":[10,-10,-40,-90],"bump":{"position":-10,"size":5}}},"typespec":{"name":"Boomerang","level":4,"model":18,"code":418,"specs":{"shield":{"capacity":[125,175],"reload":[4,6.5]},"generator":{"capacity":[50,80],"reload":[27,40]},"ship":{"mass":170,"speed":[110,140],"rotation":[70,85],"acceleration":[90,110]}},"shape":[4,3.7,2.786,1.97,1.895,1.9,1.672,1.489,1.341,1.239,2.816,2.733,2.668,2.587,2.552,2.596,2.682,2.824,2.894,2.963,3.088,3.16,3.227,3.411,3.893,3.847,3.893,3.411,3.227,3.16,3.088,2.963,2.894,2.824,2.682,2.596,2.552,2.587,2.668,2.733,2.816,1.239,1.341,1.489,1.672,1.9,1.895,1.97,2.786,3.7],"lasers":[{"x":0.832,"y":-1.6,"z":0,"angle":0,"damage":[25,40],"rate":1,"type":2,"speed":[130,195],"number":1,"spread":0,"error":0,"recoil":100},{"x":-0.832,"y":-1.6,"z":0,"angle":0,"damage":[25,40],"rate":1,"type":2,"speed":[130,195],"number":1,"spread":0,"error":0,"recoil":100}],"radius":4}}';
                    '{"name":"Shuriken","level":4,"model":19,"size":2.4,"specs":{"shield":{"capacity":[100,150],"reload":[5,8]},"generator":{"capacity":[75,120],"reload":[27,41]},"ship":{"mass":120,"speed":[115,145],"rotation":[80,120],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":10,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-60,-56,-45,-20,-10,30,35,29],"z":[-7,-7,-7,-4,0,0,0,0]},"width":[0,7,13,9,13,9,8,0],"height":[0,7,14,10,14,8,6,0],"propeller":true,"texture":[6,3,1,10,8,4,17],"laser":{"damage":[35,55],"rate":1,"type":2,"speed":[130,200],"number":1,"error":0,"angle":7}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-35,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-9,0,18,30,34],"z":[0,0,0,-8,0]},"width":[0,6,7,2,0],"height":[0,8,7,6,5],"propeller":false,"texture":[9,9,9,3,4]},"cannon":{"section_segments":8,"offset":{"x":17,"y":29,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,0,-1],"z":[0,0,0,0,0,0]},"width":[0,3,4,4,4,0],"height":[0,3,9,4,4,0],"angle":0,"laser":{"damage":[2.5,4],"rate":5,"type":1,"speed":[90,150],"number":1,"error":0},"propeller":false,"texture":[12,3,10,17]},"boosters":{"section_segments":8,"offset":{"x":36,"y":34,"z":14},"position":{"x":[0,0,0,0,0,1,0,0],"y":[-52.5,-48,-33,-22.5,-15,-6,9,0,null],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,10.5,4.5,6,9,6,0,null],"height":[0,7.5,12,6,7.5,9,6,0,null],"angle":0,"propeller":true,"texture":[1,10,4,5,63,12,17]}},"wings":{"main":{"length":[21,22,18],"width":[20,30,20,10],"angle":[20,50,10,0],"position":[0,-10,0,0],"doubleside":true,"offset":{"x":0,"y":30,"z":0},"bump":{"position":10,"size":13},"texture":[63,11,63]}},"typespec":{"name":"Shuriken","level":4,"model":19,"code":419,"specs":{"shield":{"capacity":[100,150],"reload":[5,8]},"generator":{"capacity":[75,120],"reload":[27,41]},"ship":{"mass":120,"speed":[115,145],"rotation":[80,120],"acceleration":[100,130]}},"shape":[2.4,2.32,2.13,1.861,1.26,1.308,1.392,1.314,1.192,2.048,2.126,2.153,2.217,2.233,2.122,2.14,2.825,2.993,2.915,2.885,2.678,2.051,1.895,2.126,2.194,2.164,2.194,2.126,1.895,2.051,2.678,2.885,2.915,2.993,2.825,2.14,2.122,2.233,2.217,2.153,2.126,2.048,1.192,1.314,1.392,1.308,1.26,1.861,2.13,2.32],"lasers":[{"x":0,"y":-2.4,"z":-0.192,"angle":0,"damage":[35,55],"rate":1,"type":2,"speed":[130,200],"number":1,"spread":7,"error":0,"recoil":0},{"x":0.816,"y":-1.008,"z":0.24,"angle":0,"damage":[2.5,4],"rate":5,"type":1,"speed":[90,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.816,"y":-1.008,"z":0.24,"angle":0,"damage":[2.5,4],"rate":5,"type":1,"speed":[90,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.993}}';
                    '{"name":"Robin","level":4,"model":20,"size":1.5,"specs":{"shield":{"capacity":[110,165],"reload":[5,7]},"generator":{"capacity":[80,110],"reload":[27,42]},"ship":{"mass":125,"speed":[110,145],"rotation":[50,70],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-70,-75,-50,0,50,105,120,110],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,35,25,20,0],"height":[0,7.5,13,17.5,17.5,17.5,13,0],"propeller":1,"texture":[6,63,4,8,11,4],"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[140,205],"number":1,"angle":0,"error":0}},"cockpit":{"section_segments":10,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-10,10,25,65,130],"z":[0,0,0,0,0,0]},"width":[5,10,15,18,15,0],"height":[0,15,20,18,15,0],"propeller":false,"texture":[9,9,4,63,4]},"cannons":{"section_segments":12,"offset":{"x":25,"y":-10,"z":-5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"texture":[6,4,10,4,63,2],"laser":{"damage":[4,7],"rate":8,"type":1,"speed":[100,150],"number":1,"error":0}},"winglets":{"section_segments":12,"offset":{"x":60,"y":40,"z":0},"position":{"x":[-5,-5,0,0,0,0,0],"y":[-52,-50,-20,15,40,50,51],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,8,2,0],"height":[0,2,15,15,15,2,0],"angle":-5,"propeller":false,"texture":[4,4,63,3,4,3]}},"wings":{"main":{"length":[50],"width":[110,50],"angle":[0,20],"position":[30,60,30],"doubleside":true,"bump":{"position":10,"size":10},"texture":[11,63],"offset":{"x":10,"y":-10,"z":0}},"stab2":{"length":[45],"width":[65,20],"angle":[30],"position":[70,135],"doubleside":true,"texture":63,"bump":{"position":0,"size":5},"offset":{"x":-5,"y":-35,"z":0}}},"typespec":{"name":"Robin","level":4,"model":20,"code":420,"specs":{"shield":{"capacity":[110,165],"reload":[5,7]},"generator":{"capacity":[80,110],"reload":[27,42]},"ship":{"mass":125,"speed":[110,145],"rotation":[50,70],"acceleration":[80,100]}},"shape":[2.856,2.866,2.481,2.036,1.916,1.743,1.551,1.418,1.297,1.198,1.129,1.958,1.999,2.079,2.2,2.291,2.4,2.559,2.773,3.051,3.206,3.203,3.294,3.454,3.054,3.006,3.054,3.454,3.294,3.203,3.206,3.051,2.773,2.559,2.4,2.291,2.2,2.079,1.999,1.958,1.129,1.198,1.297,1.418,1.551,1.743,1.916,2.036,2.481,2.866],"lasers":[{"x":0,"y":-2.85,"z":0,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[140,205],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.75,"y":-1.8,"z":-0.15,"angle":0,"damage":[4,7],"rate":8,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.75,"y":-1.8,"z":-0.15,"angle":0,"damage":[4,7],"rate":8,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.454}}';
                    '{"name":"Optimus","level":4,"model":21,"size":1.25,"specs":{"shield":{"capacity":[155,205],"reload":[6,8]},"generator":{"capacity":[80,115],"reload":[23,32]},"ship":{"mass":150,"speed":[115,155],"rotation":[50,65],"acceleration":[70,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-125,-110,-50,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,20,25,30,30,20,0],"height":[0,20,25,30,35,20,0],"propeller":true,"texture":[63,10,2,63,4,12]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-30,"z":30},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,90],"z":[0,0,0,0,12]},"width":[0,10,13,10,0],"height":[0,18,22,18,0],"propeller":false,"texture":[9,9,9,4]},"cannon":{"section_segments":8,"offset":{"x":40,"y":-70,"z":0},"position":{"x":[0,0,0,0,0,5],"y":[-40,-50,-20,10,35,60],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,10,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[9,15],"rate":10,"type":2,"speed":[150,210],"number":1,"error":0},"propeller":false,"texture":[17,4,63,10,3]},"propulsors":{"section_segments":10,"offset":{"x":35,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-30,-35,-20,5,15,30,50,60,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,13,18,20,20,20,20,15,0],"height":[0,10,13,18,20,20,20,20,15,0],"texture":[4,4,63,3,2,63,4,12,17],"propeller":true}},"wings":{"main":{"length":[20],"width":[80,30],"angle":[0,20],"position":[30,50,30],"doubleside":true,"bump":{"position":30,"size":5},"texture":[3],"offset":{"x":40,"y":-100,"z":-2}},"main2":{"length":[70,20],"width":[100,50,30],"angle":[-10,20],"position":[0,40,0],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":40,"z":10}},"winglets":{"length":[40],"width":[80,40,100],"angle":[10,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":-5}},"stab":{"length":[20,30],"width":[80,50,30],"angle":[40,30],"position":[70,75,100],"doubleside":true,"texture":[3,4],"bump":{"position":0,"size":5},"offset":{"x":10,"y":-12,"z":30}}},"typespec":{"name":"Optimus","level":4,"model":21,"code":421,"specs":{"shield":{"capacity":[155,205],"reload":[6,8]},"generator":{"capacity":[80,115],"reload":[23,32]},"ship":{"mass":150,"speed":[115,155],"rotation":[50,65],"acceleration":[70,120]}},"shape":[3.125,2.989,3.154,3.204,2.818,2.435,2.263,2.057,1.851,1.377,1.252,1.168,0.749,0.937,1.028,2.358,2.501,2.629,2.745,2.922,3.14,3.09,3.013,2.891,2.799,2.63,2.799,2.891,3.013,3.09,3.14,2.922,2.745,2.629,2.501,2.358,1.028,0.937,0.875,1.168,1.252,1.377,1.851,2.057,2.263,2.435,2.818,3.204,3.154,2.989],"lasers":[{"x":1,"y":-3,"z":0,"angle":0,"damage":[9,15],"rate":10,"type":2,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1,"y":-3,"z":0,"angle":0,"damage":[9,15],"rate":10,"type":2,"speed":[150,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.204}}';
                    '{"name":"Prototype-T1","level":4,"model":22,"size":1.55,"specs":{"shield":{"capacity":[145,185],"reload":[4,8]},"generator":{"capacity":[70,110],"reload":[25,39]},"ship":{"mass":130,"speed":[115,145],"rotation":[55,80],"acceleration":[110,160]}},"bodies":{"front":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-150,-105,-25,0,25],"z":[-5,0,0,0,0]},"width":[7,17,17,17,20],"height":[0,20,30,20,5],"texture":[63,11,2,63],"laser":{"damage":[20,35],"rate":2,"type":1,"speed":[120,180],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0],"y":[-70,-70,-25,0,100],"z":[0,0,0,0,9]},"width":[0,10,15,15,10],"height":[0,15,25,20,0],"texture":[9,9,9,4]},"side":{"section_segments":8,"offset":{"x":40,"y":90,"z":10},"position":{"x":[-30,-10,-5,0],"y":[-200,-50,0,20],"z":[-5,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[4,63,3]},"bigpropel":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[10,20,30,100,95],"z":[0,0,0,0,0]},"width":[10,20,20,20,0],"height":[10,20,40,30,0],"texture":[63,63,10,4],"propeller":true},"propulsors":{"section_segments":8,"offset":{"x":15,"y":50,"z":10},"position":{"x":[0,0,0,0,0,5,10,10,10,10],"y":[-160,-130,-110,10,20,25,30,40,50,40],"z":[-5,-5,-5,-5,0,0,0,0,0,0]},"width":[0,10,15,15,10,10,10,10,10,0],"height":[0,10,15,15,10,10,10,10,10,0],"texture":[3,63,3,3,3,63,4],"propeller":true}},"wings":{"main":{"doubleside":true,"offset":{"x":15,"y":-30,"z":-3},"length":[20,15],"width":[150,90,10],"angle":[-20,-20,0],"position":[-20,0,70],"texture":[4,63],"bump":{"position":20,"size":5}},"winglets":{"doubleside":true,"offset":{"x":20,"y":60,"z":10},"length":[20,60,20],"width":[20,40,20],"angle":[0,0,0],"position":[0,0,10,0],"texture":[63,3],"bump":{"position":30,"size":10}}},"typespec":{"name":"Prototype-T1","level":4,"model":22,"code":422,"specs":{"shield":{"capacity":[145,185],"reload":[4,8]},"generator":{"capacity":[70,110],"reload":[25,39]},"ship":{"mass":130,"speed":[115,145],"rotation":[55,80],"acceleration":[110,160]}},"shape":[4.655,4.394,3.441,2.871,2.463,2.075,1.825,1.63,1.521,1.433,1.372,1.342,1.345,1.376,1.428,1.514,1.641,3.831,3.97,3.619,3.211,3.208,3.628,3.259,3.156,3.106,3.156,3.259,3.628,3.208,3.211,3.619,3.97,3.831,1.641,1.514,1.428,1.376,1.345,1.342,1.372,1.433,1.521,1.63,1.825,2.075,2.463,2.871,3.441,4.394],"lasers":[{"x":0,"y":-4.65,"z":0,"angle":0,"damage":[20,35],"rate":2,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.655}}';
                    '{"name":"Centauri-Warrior","level":4,"model":23,"size":1.7,"specs":{"shield":{"capacity":[130,200],"reload":[6,9]},"generator":{"capacity":[80,115],"reload":[24,39]},"ship":{"mass":130,"speed":[100,155],"rotation":[50,100],"acceleration":[75,115]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-105,-95,-100,-60,-30,25,50,55,60,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,25,25,25,25,25,15,0],"height":[0,5,7.5,15,15,15,15,15,10,0],"texture":[6,6,10,63,3,63,12,12,17],"propeller":true,"laser":{"damage":[22,31],"rate":1,"type":1,"speed":[200,250],"number":1,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-100,-70,-45,-20,40,0],"z":[0,0,0,0,-5,0]},"width":[0,10,15,15,10,0],"height":[0,15,20,20,15,0],"texture":[4,9,9,11,4,4]},"tube":{"section_segments":12,"offset":{"x":30,"y":40,"z":5},"position":{"x":[-15,-2,-2,-6,-5,-5,-5],"y":[-120,-90,-50,-20,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,12,15,10,0],"height":[0,5,12.5,12,15,10,0],"texture":[3,63,10,4,12,17],"propeller":true,"angle":0},"cannons":{"section_segments":12,"offset":{"x":80,"y":50,"z":-32},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,0,20,30,40],"z":[0,0,0,0,0,0]},"width":[0,5,5,7,7,0],"height":[0,5,10,10,7,0],"texture":[6,3,2,4,4],"propeller":false,"angle":0,"laser":{"damage":[3,4],"rate":3,"type":1,"speed":[120,180],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":34,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,0,20,50,60],"z":[0,0,0,0,0,0]},"width":[0,5,5,7,7,0],"height":[0,5,10,10,7,0],"texture":[6,3,2,4,4],"propeller":false,"angle":0,"laser":{"damage":[3,4],"rate":3,"type":1,"speed":[120,180],"number":1,"error":0}}},"wings":{"xwing1":{"doubleside":true,"offset":{"x":0,"y":65,"z":5},"length":[45,35],"width":[70,40,30],"angle":[50,-20],"position":[-70,-10,-20],"texture":[4,10],"bump":{"position":10,"size":10}},"xwing2":{"doubleside":true,"offset":{"x":0,"y":70,"z":5},"length":[55,35],"width":[70,40,30],"angle":[-10,-50],"position":[-70,-10,-20],"texture":[4,1],"bump":{"position":10,"size":15}}},"typespec":{"name":"Centauri-Warrior","level":4,"model":23,"code":423,"specs":{"shield":{"capacity":[130,200],"reload":[6,9]},"generator":{"capacity":[80,115],"reload":[24,39]},"ship":{"mass":130,"speed":[100,155],"rotation":[50,100],"acceleration":[75,115]}},"shape":[3.57,3.417,2.895,2.432,2.494,2.439,2.071,1.814,1.632,1.509,1.442,1.403,1.393,2.912,2.982,3.108,3.293,3.624,4.024,4.094,3.302,2.964,2.733,2.502,2.236,2.044,2.236,2.502,2.733,2.964,3.302,4.094,4.024,3.624,3.293,3.108,2.982,2.912,1.394,1.403,1.442,1.509,1.632,1.814,2.071,2.439,2.494,2.432,2.895,3.417],"lasers":[{"x":0,"y":-3.57,"z":0.34,"angle":0,"damage":[22,31],"rate":1,"type":1,"speed":[200,250],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.72,"y":0.17,"z":-1.088,"angle":0,"damage":[3,4],"rate":3,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.72,"y":0.17,"z":-1.088,"angle":0,"damage":[3,4],"rate":3,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.156,"y":-2.21,"z":0,"angle":0,"damage":[3,4],"rate":3,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.156,"y":-2.21,"z":0,"angle":0,"damage":[3,4],"rate":3,"type":1,"speed":[120,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.094}}';
                    '{"name":"Outrider","level":4,"model":24,"size":1.65,"specs":{"shield":{"capacity":[120,175],"reload":[5,8]},"generator":{"capacity":[75,105],"reload":[25,37]},"ship":{"mass":150,"speed":[125,155],"rotation":[60,80],"acceleration":[70,95]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-70,-70,-50,-25,-5,40,65,85,65],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,16,20,25,27,30,27,16,0],"height":[0,8,10,10,13,17,19,17,12,0],"texture":[12,5,4,63,2,10.24,2,3,17],"propeller":true,"angle":0,"laser":{"damage":[4,6],"rate":8,"type":1,"speed":[150,230],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":18},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-35,-30,-10,15,25,34],"z":[-2,-7,-9,-10,-6,0]},"width":[0,10,13,15,13,0],"height":[0,10,16,17,10,0],"texture":[4,9,9,3,4],"propeller":false},"Systems":{"section_segments":8,"offset":{"x":0,"y":-40,"z":6.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-25,-20,0,11,19,29],"z":[3,-4,-2,-1,0,0,0]},"width":[3,7,7,7,7,0],"height":[0,10,10,10,10,0],"texture":[4,8,15,4,3],"propeller":false},"cannon":{"section_segments":6,"offset":{"x":20,"y":-30,"z":0},"position":{"x":[-5,-5,0,3,0,0],"y":[-55,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,5,5,5,0],"height":[0,5,5,5,5,0],"angle":0,"laser":{"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":[6,3,4]},"propulsors":{"section_segments":12,"offset":{"x":50,"y":60,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-45,-55,-50,-20,0,20,30,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,7,10,15,15,15,15,10,0],"height":[0,7,10,15,15,15,15,10,0],"texture":[13,11,10,4,3,12,4,17],"angle":0,"propeller":true}},"wings":{"main":{"length":[40,15],"width":[60,40,40],"angle":[0,0],"position":[55,55,55],"texture":[8,15],"doubleside":true,"offset":{"x":0,"y":1,"z":-3},"bump":{"position":30,"size":10}},"FinThings1":{"length":[50],"width":[25,20],"angle":[-8],"position":[2,40],"texture":[63],"doubleside":true,"offset":{"x":10,"y":0,"z":3},"bump":{"position":10,"size":5}},"FinThings2":{"length":[10,15],"width":[50,31,20],"angle":[-22,-22],"position":[12,20,20],"texture":[4,63],"doubleside":true,"offset":{"x":60,"y":40,"z":-4},"bump":{"position":10,"size":5}}},"typespec":{"name":"Outrider","level":4,"model":24,"code":424,"specs":{"shield":{"capacity":[120,175],"reload":[5,8]},"generator":{"capacity":[75,105],"reload":[25,37]},"ship":{"mass":150,"speed":[125,155],"rotation":[60,80],"acceleration":[70,95]}},"shape":[2.645,2.848,2.817,2.298,1.868,1.581,1.391,1.199,1.082,1.013,0.965,0.937,0.924,1.943,2.073,2.216,2.427,3.392,3.588,3.49,3.788,3.848,3.647,2.759,2.798,2.838,2.798,2.759,3.647,3.848,3.788,3.49,3.588,3.392,2.427,2.216,2.073,1.943,0.924,0.937,0.965,1.013,1.082,1.199,1.391,1.581,1.868,2.298,2.817,2.848],"lasers":[{"x":0,"y":-2.64,"z":0,"angle":0,"damage":[4,6],"rate":8,"type":1,"speed":[150,230],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.495,"y":-2.805,"z":0,"angle":0,"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.495,"y":-2.805,"z":0,"angle":0,"damage":[5,7],"rate":5,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.848}}';
                    '{"name":"Pioneer","level":4,"model":25,"size":1.6,"specs":{"shield":{"capacity":[175,230],"reload":[4,8]},"generator":{"capacity":[50,100],"reload":[25,32]},"ship":{"mass":250,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-95,-85,-60,-10,0,20,50,80,100,90],"z":[-10,-5,0,0,0,0,0,0,0,0,0]},"width":[10,35,45,50,30,40,50,50,20,0],"height":[0,15,20,20,20,30,30,20,10,0],"texture":[2,2,10,2,4,11,11,63,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,15,10,0],"height":[0,18,25,18,0],"texture":[9],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":25,"y":-70,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-25,-30,-20,0,20,30],"z":[0,0,0,0,0,0]},"width":[0,3,5,5,5,3],"height":[0,3,5,5,5,3],"texture":[6,6,4,4,4],"angle":0,"laser":{"damage":[6,11],"rate":3,"type":1,"speed":[105,160],"number":1,"error":0}},"shield":{"section_segments":12,"offset":{"x":60,"y":-40,"z":0},"position":{"x":[0,5,3,5,0,0],"y":[-30,-20,0,20,30,20],"z":[0,0,0,0,0,0]},"width":[0,10,10,10,5,0],"height":[10,25,30,25,15,0],"propeller":true,"texture":[4,4,4,4,17],"angle":0},"shield2":{"section_segments":12,"offset":{"x":60,"y":60,"z":0},"position":{"x":[0,5,3,5,0,0],"y":[-30,-20,0,20,30,20],"z":[0,0,0,0,0,0]},"width":[0,10,10,10,5,0],"height":[10,25,30,25,15,0],"propeller":true,"texture":[4,4,4,4,17],"angle":0}},"wings":{"side_joins":{"offset":{"x":0,"y":56,"z":0},"length":[70],"width":[70,30],"angle":[0],"position":[0,0,0,50],"texture":[3],"bump":{"position":10,"size":10}},"side_joins2":{"offset":{"x":0,"y":-37,"z":-3},"length":[70],"width":[70,30],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":10,"size":10}}},"typespec":{"name":"Pioneer","level":4,"model":25,"code":425,"specs":{"shield":{"capacity":[175,230],"reload":[4,8]},"generator":{"capacity":[50,100],"reload":[25,32]},"ship":{"mass":250,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"shape":[3.046,3.057,3.323,3.076,2.803,2.524,3.006,3.073,2.942,2.664,2.548,2.441,1.29,1.032,1.136,1.287,2.732,2.911,3.245,3.523,3.553,3.411,3.132,3.263,3.258,3.206,3.258,3.263,3.132,3.411,3.553,3.523,3.245,2.911,2.732,1.287,1.136,1.032,1.29,2.441,2.548,2.664,2.942,3.073,3.006,2.524,2.803,3.076,3.323,3.057],"lasers":[{"x":0.8,"y":-3.2,"z":0.48,"angle":0,"damage":[6,11],"rate":3,"type":1,"speed":[105,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.8,"y":-3.2,"z":0.48,"angle":0,"damage":[6,11],"rate":3,"type":1,"speed":[105,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.553}}';
                    '{"name":"W-Defender","level":4,"model":26,"size":1.5,"specs":{"shield":{"capacity":[180,240],"reload":[4.5,7.5]},"generator":{"capacity":[120,200],"reload":[23,37]},"ship":{"mass":150,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-80,-40,0,15,60],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,25,20,25,0],"height":[0,7,10,20,25,20,0],"propeller":true,"texture":[3,12,1,10,2,12]},"back":{"section_segments":12,"offset":{"x":0,"y":25,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,20,60,50,60],"z":[0,0,0,0,0,0]},"width":[0,25,23,15,0],"height":[0,20,20,10,0],"texture":[12,4,10,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-40,"z":17},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"wing_deco":{"section_segments":8,"offset":{"x":75,"y":80,"z":0},"position":{"x":[5,0,5,5,0,0,0],"y":[-140,-40,-20,4,20,40,38],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,7,5,0],"height":[3,6,10,15,10,5,0],"angle":0,"propeller":true,"texture":[63,63,4,4,13,17]},"cannons":{"section_segments":8,"offset":{"x":77.5,"y":-80,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8,10,27,34,60,68,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,4,4,5,7],"height":[0,3,5,5,5,4,4,5,7],"texture":[6,4,63,8,63,4,63,3],"propeller":false,"angle":2,"laser":{"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"recoil":50,"number":1,"error":0}},"cannons2":{"section_segments":8,"offset":{"x":77.5,"y":-80,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8,10,27,34,60,68,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,5,4,4,5,7],"height":[0,3,5,5,5,4,4,5,7],"texture":[6,4,63,3,63,4,63,3],"propeller":false,"angle":2,"laser":{"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"recoil":50,"number":1,"error":0}},"front_deco":{"section_segments":6,"offset":{"x":45,"y":-33,"z":2.5},"position":{"x":[0,0,0,0,0],"y":[-30,-10,10,20,20],"z":[0,0,0,0,0]},"width":[0,5,5,2,0],"height":[0,15,15,10,0],"angle":0,"propeller":false,"texture":[2,2,2]},"engine":{"section_segments":12,"offset":{"x":0,"y":40,"z":50},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-20,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,15,15,15,10,10,15,10,0],"height":[0,5,10,15,15,15,10,10,15,10,0],"texture":[3,12,10,4,63,63,4,4,3,17],"propeller":true}},"wings":{"main":{"length":[80,20],"width":[80,40,20],"angle":[-10,-12],"position":[30,90,60],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":0,"y":0,"z":10}},"main_overlay":{"length":[80],"width":[40,20,20],"angle":[-10,-12],"position":[30,85,60],"doubleside":true,"bump":{"position":30,"size":10},"texture":[63],"offset":{"x":0,"y":10,"z":12}},"main_overlay2":{"length":[80],"width":[20,20,20],"angle":[-10,-12],"position":[30,95,60],"doubleside":true,"bump":{"position":30,"size":10},"texture":[4],"offset":{"x":0,"y":-7.5,"z":13}},"winglets":{"doubleside":true,"length":[40],"width":[40,20,30],"angle":[-20,-10],"position":[50,70,65],"bump":{"position":0,"size":10},"texture":63,"offset":{"x":10,"y":-100,"z":15}},"top_join":{"offset":{"x":0,"y":35,"z":0},"length":[0,60],"width":[0,70,30],"angle":[0,90],"position":[0,0,40,0,50],"texture":[63],"bump":{"position":10,"size":20}}},"typespec":{"name":"W-Defender","level":4,"model":26,"code":426,"specs":{"shield":{"capacity":[180,240],"reload":[4.5,7.5]},"generator":{"capacity":[120,200],"reload":[23,37]},"ship":{"mass":150,"speed":[90,110],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.7,2.419,2.151,1.953,1.877,2.323,2.184,3.21,3.055,2.864,2.714,2.617,2.537,2.559,2.663,2.798,3.366,3.626,3.738,3.917,4.327,4.263,3.03,2.634,3.314,3.306,3.314,2.634,3.03,4.263,4.327,3.917,3.738,3.626,3.366,2.798,2.663,2.559,2.537,2.617,2.714,2.864,3.055,3.21,2.184,2.323,1.877,1.953,2.151,2.419],"lasers":[{"x":2.333,"y":-2.16,"z":-0.15,"angle":2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":-2.333,"y":-2.16,"z":-0.15,"angle":-2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":2.333,"y":-2.16,"z":0.15,"angle":2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50},{"x":-2.333,"y":-2.16,"z":0.15,"angle":-2,"damage":[10,18],"rate":3,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":50}],"radius":4.327}}';
                ]
            },
            {
                TIER: 5,
                SHIPS: [
                    
                ]
            },
            {
                TIER: 6,
                SHIPS: [
                    
                ]
            }
        ]
    }

    constructor(tier, ships) {
        this.tier = tier;

        this.processShips(ships);
    }

    processShips(ships) {
        for (let ship of ships) {
            let jship = JSON.parse(ship);

            jship.next = [];
            jship.typespec.next = [];

            this.normalShips.push(JSON.stringify(jship));

            jship.bodies.flag = ShipGroup.C.FLAG.FLAG_OBJ;
            jship.bodies.flagpole = ShipGroup.C.FLAG.FLAGPOLE_OBJ;
            jship.model += ships.length;

            jship.typespec.specs.ship.speed[1] /= ShipGroup.C.FLAG.FLAG_WEIGHT;
            jship.specs.ship.speed[1] /= ShipGroup.C.FLAG.FLAG_WEIGHT;
            jship.typespec.specs.ship.mass *= ShipGroup.C.FLAG.FLAG_WEIGHT;
            jship.specs.ship.mass *= ShipGroup.C.FLAG.FLAG_WEIGHT;

            let flagShip = JSON.stringify(jship);
            this.flagShips.push(flagShip);
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
        for (let ship of this.chosenShips) {
            let jship = JSON.parse(ship);
            this.chosenNames.push(jship.name);
            this.chosenTypes.push(jship.level * 100 + jship.model);
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

    static getRandomLightValue() {
        return Math.floor(Math.random()*156)+100;
    }

    static getRandomLightHex() {
        let r = Helper.getRandomLightValue().toString(16);
        let g = Helper.getRandomLightValue().toString(16);
        let b = Helper.getRandomLightValue().toString(16);
        return "#" + r + g + b;
    }

    static getRandomHex() {
        return "#" + Math.floor(Math.random()*16777215).toString(16);
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
