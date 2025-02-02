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

    flags = [];
    flagStands = [];

    mainPortal = null;
    mainGravityWell = null;
    portals = [];
    gravityWells = [];

    waiting = true;
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

            SPEED_MOD: 30,
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

            FLAGHOLDER_DROP: 5400,
            FLAG_DESPAWN: 5400,

            WAIT: 0, // 1800
            ROUND: 28800,
            BETWEEN: 360
        },
        IS_TESTING: true,
        IS_DEBUGGING: false,
        MIN_PLAYERS: 1,
        ROUND_MAX: 3,
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

            console.log(this)
        }
    }

    selectRandomTeams() {
        this.teams = [];
        let randTeamOption = Helper.getRandomArrayElement(Team.C.TEAMS);
        for (let teamOption of randTeamOption) {
            this.teams.push(
                new Team(
                    teamOption.NAME,
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
        if (this.ships.length < Game.C.MIN_PLAYERS) {
            if (!this.waiting || this.waitTimer != -1) {
                this.waiting = true;
                this.waitTimer = -1;
                this.reset();
            }
        } else if (this.waiting && this.waitTimer == -1 || game.step - this.waitTimer < Game.C.TICKS.WAIT) {
            if (this.waitTimer == -1) {
                this.waitTimer = game.step;
            }
        } else {
            if (this.waiting) {
                this.waitTimer = -1;
                this.waiting = false;
                this.newRound();
            }

            if (this.roundTime != -1) {
                if (game.step - this.roundTime > Game.C.TICKS.ROUND) {
                    this.roundTime = -1;
                    this.betweenTime = game.step;
                    this.timesUp = true;
                    this.spawnMainPortal();
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
                this.spawnMainPortal();
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
    }

    manageEntities() {
        if (game.step % Game.C.TICKS.ENTITY_MANAGER === 0) {
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
                    ship.hideUI(UIComponent.C.UIS.RADAR_BACKGROUND);

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
                                chooseShip.components[8].value = this.shipGroup.chosenTypes[i];
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

                                        this.flags[opp].show();

                                        this.sendNotifications(`${ship.ship.name} has scored a point for the ${ship.team.color.toUpperCase()} team!`, `Will ${this.teams[opp].color.toUpperCase()} team score next?`, ship.team);
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

                    let radarBackground = Helper.deepCopy(UIComponent.C.UIS.RADAR_BACKGROUND);
                    ship.sendUI(radarBackground);

                    let scoreboard = Helper.deepCopy(UIComponent.C.UIS.SCOREBOARD);
                    scoreboard.components[0].fill = this.teams[0].hex + 'BF';
                    scoreboard.components[2].fill = this.teams[1].hex + 'BF';
                    scoreboard.components[1].value = this.teams[0].color.toUpperCase() + ' TEAM';
                    if (this.teams[0].color == 'Yellow') {
                        scoreboard.components[1].color = '#000000';
                    }
                    scoreboard.components[3].value = this.teams[1].color.toUpperCase() + ' TEAM';
                    if (this.teams[1].color == 'Yellow') {
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
                    }
                }

                ship.tick();
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                if (this.betweenTime == -1) {
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

    sendNotifications(title, message, supportingTeam) {
        for (let ship of this.ships) {
            let leftMessage = Helper.deepCopy(UIComponent.C.UIS.NOTIFICATION);
            if (supportingTeam.team == ship.team.team) {
                leftMessage.components[0].fill = '#008B00';
            }
            else {
                leftMessage.components[0].fill = '#8B0000';
            }
            leftMessage.components[1].value = title;
            leftMessage.components[2].value = message;
            ship.sendTimedUI(leftMessage, TimedUI.C.NOTIFICATION_TIME);
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

    onAlienDestroyed(gameAlien, gameShip) {

    }
}

class Team {
    name = '';
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
                    NAME: 'Anarchist Concord Vega',
                    HUE: 0,
                    FLAGGED: 40
                },
                {
                    TEAM: 1,
                    COLOR: 'Blue',
                    HEX: '#0000ff',
                    NAME: 'Andromeda Union',
                    HUE: 240,
                    FLAGGED: 180
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Yellow',
                    HEX: '#ffff00',
                    NAME: 'Solaris Dominion',
                    HUE: 60,
                    FLAGGED: 100
                },
                {
                    TEAM: 1,
                    COLOR: 'Purple',
                    HEX: '#ff00ff',
                    NAME: 'Galactic Empire',
                    HUE: 300,
                    FLAGGED: 260
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Green',
                    HEX: '#00ff00',
                    NAME: 'Rebel Alliance',
                    HUE: 120,
                    FLAGGED: 80
                },
                {
                    TEAM: 1,
                    COLOR: 'Orange',
                    HEX: '#ff8000',
                    NAME: 'Sovereign Trappist Colonies',
                    HUE: 30,
                    FLAGGED: 0
                }
            ]
        ]
    }

    constructor(name, team, color, hex, hue, flagged) {
        this.name = name;
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
        PORTAL_TIME: 120 // 3600
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
                    this.allUIs.splice(this.allUIs.indexOf(u), 1);
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
            this.allUIs.splice(this.allUIs.indexOf(u), 1);
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
            this.timedUIs.splice(this.timedUIs.indexOf(timedUI), 1);
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
            this.timedUIs.splice(this.timedUIs.indexOf(timedUI), 1);
        }

        this.ship.set({ score: this.score });
    }

    sendMessage(text, baseColor) {
        this.message = new Message(this, text, baseColor);
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
        ALLOWED: [10, 11, 12, 20, 21],
        MAX_AMOUNT: 30,
        SPAWN_RATE: 1200
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
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/gravity2.obj',
                    emissiveColor: '#ffffff',
                    transparent: false
                },
                MAIN_SCALE: 12,
                MAIN_INTENSITY: 2,
                MAX_VELOCITY: 1,
                VELOCITY_FACTOR: 0.5,
                INTENSITY: 0.5,
                SUCK_FACTOR: 3
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
        this.object.rotation = rotation;
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
                position: [3, 30, 15, 5],
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
            SCORE_DIVISION: {
                id: "score_division",
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
                position: [5, 75, 60, 15],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 2.5, 100],
                        fill: '#ffffff',
                    },
                    {
                        type: "text",
                        position: [5, 15, 90, 40],
                        align: "left",
                        color: '#ffffff'
                    },
                    {
                        type: "text",
                        position: [5, 57.5, 80, 27.5],
                        align: "left",
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
                        value: "Ship Code",
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
                    x: -15,
                    y: 0
                }, {
                    x: 15,
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
                portals: [],
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
                portals: [],
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
                portals: [],
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
                    "99   98    89    88    99    66    99    88    98    89   99\n" +
                    "99   9      9    99    9     88     9    99    9      9   99\n" +
                    "999                          99                          999\n" +
                    "9999                        9999                        9999\n" +
                    "99999                      995599                      99999\n" +
                    "9  998  99    89      6789995555999876      98    99  899  9\n" +
                    "9  998  99    89      6789995555999876      98    99  899  9\n" +
                    "99999                      995599                      99999\n" +
                    "9999                        9999                        9999\n" +
                    "999                          99                          999\n" +
                    "99   9      9    89    9     88     9    99    9      9   99\n" +
                    "99   98    89    88    99    66    99    88    98    89   99\n" +
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
                portals: [],
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
                    "9   999  999  9999999  9999999999999999999999999999999999999\n" +
                    "9   99999999999999999  9999  9999999999999999999999999999999\n" +
                    "999999999999999999999999999   999999999999999999999999999999\n" +
                    "99999               99999999   99999999999999999999999999999\n" +
                    "99999               999  9999   9999999999999999999999999999\n" +
                    "9  99           99  99    9999   999999999999999999999999999\n" +
                    "9  99   9999    99  9      9999   99999999999999999999999999\n" +
                    "99999   999                 9999   9999999999999999999999999\n" +
                    "99999   99                   9999   999999999999999999999999\n" +
                    "99999   9                     9999   99999999999999999999999\n" +
                    "9  99            99            9999   99999999  999999999999\n" +
                    "9  99        8   99      99     9999   9999999  999999999999\n" +
                    "99999         999      9999      9999   99999999999999999999\n" +
                    "99999         999      9 9        9999  99   999999999999999\n" +
                    "99999  99     999     9999         9999999   999999999999999\n" +
                    "99999  99   99   9    99  9         999999   999999999999999\n" +
                    "99999       99    9        9              999999999999999999\n" +
                    "99999              9        9             999999999999999999\n" +
                    "999999999           9        9            99  99999999999999\n" +
                    "99  9999             9        9           99   9999999999999\n" +
                    "99  999         99    9        9    99    999   999999999999\n" +
                    "999999        9999     9        999999    9999   99999999999\n" +
                    "999999        9 9       99      97779      9999   9999999999\n" +
                    "9999999      9999       99      97579       9999   999999999\n" +
                    "99999999     99  9              97779        9999   99999999\n" +
                    "999  9999         9            999999         9999   9999999\n" +
                    "999   9999         9           99    9         9999   999999\n" +
                    "9999   9999         9                 9         9999   99999\n" +
                    "99999   9999         9                 9         9999   9999\n" +
                    "999999   9999         9    99           9         9999   999\n" +
                    "9999999   9999         999999            9         9999  999\n" +
                    "99999999   9999        97779              9  99     99999999\n" +
                    "999999999   9999       97579      99       9999      9999999\n" +
                    "9999999999   9999      97779      99       9 9        999999\n" +
                    "99999999999   9999    999999        9     9999        999999\n" +
                    "999999999999   999    99    9        9    99         999  99\n" +
                    "9999999999999   99           9        9             9999  99\n" +
                    "99999999999999  99            9        9           999999999\n" +
                    "999999999999999999             9        9              99999\n" +
                    "999999999999999999              9        9    99       99999\n" +
                    "999999999999999   999999         9  99    9   99   99  99999\n" +
                    "999999999999999   9999999         9999     999     99  99999\n" +
                    "999999999999999   999  999        9 9      999         99999\n" +
                    "999999999999999999999   999      9999      999         99999\n" +
                    "999999999999  99999999   999     99      99   8        99  9\n" +
                    "999999999999  999999999   999            99            99  9\n" +
                    "999999999999999999999999   999                     9   99999\n" +
                    "9999999999999999999999999   999                   99   99999\n" +
                    "99999999999999999999999999   999                 999   99999\n" +
                    "999999999999999999999999999   999      9  99    9999   99  9\n" +
                    "9999999999999999999999999999   999    99  99           99  9\n" +
                    "99999999999999999999999999999   999  999               99999\n" +
                    "999999999999999999999999999999   9999999               99999\n" +
                    "9999999999999999999999999999999   99999999999999999999999999\n" +
                    "99999999999999999999999999999999  999  99999999999999999   9\n" +
                    "9999999999999999999999999999999999999  9999999  999  999   9\n" +
                    "9999999999999999999999999999999999999999999999  999  999   9\n" +
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -180,
                    y: 180
                }, {
                    x: 180,
                    y: -180
                }],
                portals: [],
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
                    "9999     99       99         99    99                     99\n" +
                    "99999    99        99        99    99                     99\n" +
                    "99 999   99     99  99       99    99    9999999999       99\n" +
                    "99  999 999     99  999      99    99    9        9       99\n" +
                    "99   9999           9999    9999   99    9 999999 9       99\n" +
                    "99    99            99 99   9  9  9999   9 9    9 9  99   99\n" +
                    "99   99             99  99  9  9  9  9   9 9 9  9 9  99   99\n" +
                    "999999     9   9    999999999999999  9   9 9 9999 9       99\n" +
                    "999999    99   9    999999999999999  9   9 9      9       99\n" +
                    "99       999   9    999   9999  999999   9 99999999  99   99\n" +
                    "99             9    99   9 99    99999   9        9  99   99\n" +
                    "99             99   99  9  99    99999   9999999999       99\n" +
                    "99             99   99 9   999  999 999                   99\n" +
                    "99       99999999   999   999999999  99999999       9999  99\n" +
                    "99  99       9999   9999999999999999999999999       9999  99\n" +
                    "99  99               99999999         99  999       9999  99\n" +
                    "999                                   99 9 99       9999  99\n" +
                    "9999                            9     999  99             99\n" +
                    "99 99999999999999         9    999    9999999             99\n" +
                    "99  99999999999999        9   99 99   99999999            99\n" +
                    "99   99  99     99    99  9  99 9 99       9999999999     99\n" +
                    "99    99 99 99  99    99 99   99 99        9 9999   99999999\n" +
                    "99     9999 999 99      9999   999         9  999   99999999\n" +
                    "99      999  99 99     999999   9   999    9999999999     99\n" +
                    "99       99     99  999999  99     99 99   99999999       99\n" +
                    "99        99999999      99  99     9 9 9   999  999       99\n" +
                    "99    999999999999       99999     99 99   99    99999    99\n" +
                    "9999999  999  999         999       999    99    99  9999999\n" +
                    "9999999  99 99 99    999       999         999  999  9999999\n" +
                    "99    99999 99 99   99 99     99999       999999999999    99\n" +
                    "99       999  999   9 9 9     99  99      999999999       99\n" +
                    "99       99999999   99 99     99  999999  99     99       99\n" +
                    "99     9999999999    999   9   999999     99 99  999      99\n" +
                    "99999999   999  9         999   9999      99 999 9999     99\n" +
                    "99999999   9999 9        99 99   99 99    99  99 99 99    99\n" +
                    "99     9999999999       99 9 99  9  99    99     99  99   99\n" +
                    "99            99999999   99 99   9        99999999999999  99\n" +
                    "99             9999999    999    9         99999999999999 99\n" +
                    "99             99  999     9                            9999\n" +
                    "99   9999      99 9 99                                   999\n" +
                    "99   9999      999  99         99999999               99  99\n" +
                    "99   9999      9999999999999999999999999   9999       99  99\n" +
                    "99   9999      99999999  999999999   999   99999999       99\n" +
                    "99                   999 999  999   9 99   99             99\n" +
                    "99       9999999999   99999 99 99  9  99   99             99\n" +
                    "99    99 9        9   99999 99 99 9   99    9             99\n" +
                    "99    99 9 999999 9   999999  9999   999    9   999       99\n" +
                    "99       9      9 9   9  999999999999999    9   99    999999\n" +
                    "99       9 9999 9 9   9  999999999999999    9   9     999999\n" +
                    "99    99 9 9  9 9 9   9  9  9  9  99  99             99   99\n" +
                    "99    99 9 9    9 9   9999  9  9   99 99            99    99\n" +
                    "99       9 999999 9    99   9999    9999           9999   99\n" +
                    "99       9        9    99    99      999  99     999 999  99\n" +
                    "99       9999999999    99    99       99  99     99   999 99\n" +
                    "99                     99    99        99        99    99999\n" +
                    "99                     99    99         99       99     9999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -170,
                    y: 170
                }, {
                    x: 170,
                    y: -170
                }],
                portals: [],
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
                portals: [],
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
                        x: -150,
                        y: 0
                    },
                    {
                        x: 150,
                        y: 0
                    },
                    {
                        x: 0,
                        y: -150
                    },
                    {
                        x: 0,
                        y: 150
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
                    '  999     99    99    99            99    99    99     999  \n' +
                    '  999     99    99    99            99    99    99     999  \n' +
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
                        x: 0,
                        y: -180
                    },
                    {
                        x: 0,
                        y: 180
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
                    "999994  99  99  99  99  499999999994  99  99  99  99  499999\n" +
                    "9999994 66  66  66  66   4999999994   66  66  66  66 4999999\n" +
                    "99949994                  49999994                  49994999\n" +
                    "999 4999                   444444                   9994 999\n" +
                    "999  499                                            994  999\n" +
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
                    "999  499                                            994  999\n" +
                    "999 4999                   444444                   9994 999\n" +
                    "99949994                  49999994                  49994999\n" +
                    "9999994 66  66  66  66   4999999994   66  66  66  66 4999999\n" +
                    "999994  99  99  99  99  499999999994  99  99  99  99  499999\n" +
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
                        x: -220,
                        y: -220
                    },
                    {
                        x: -220,
                        y: 220
                    },
                    {
                        x: 220,
                        y: -220
                    },
                    {
                        x: 220,
                        y: 220
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
                    x: -180,
                    y: -125
                }, {
                    x: 188,
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
                    x: -220,
                    y: -160
                }, {
                    x: 210,
                    y: 210
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
                    "34599 999      999      99      99    999    99        99543\n" +
                    "54599999      999       99      99   99 99   99        99545\n" +
                    "9999999       99        99      99   9   9   99        99999\n" +
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
                    "99999        99   9   9   99      99        99       9999999\n" +
                    "54599        99   99 99   99      99       999      99999545\n" +
                    "34599        99    999    99      99      999      999 99543\n" +
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
                    "4256799   999999   999                99   99   99   9975444\n" +
                    "4345799   999999   999                     99   99   9966453\n" +
                    "2356799   99        99                     99   99   9965553\n" +
                    "3355699   99        99                     99   99   9975443\n" +
                    "2446799   99        99                99   99   99   9976543\n" +
                    "3246699   99   99   99                99        99   9974444\n" +
                    "2355799   99   99   99                99        99   9975552\n" +
                    "2446799   99   99                     99        99   9975553\n" +
                    "3346799   99   99                     999   999999   9965454\n" +
                    "4346699   99   99                     999   999999   9965442\n" +
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
                portals: [],
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
                map: "   9999999999999999999999999999999999     999          999  \n" +
                    "    9999999999999999999999999999999999     999          999 \n" +
                    "                                    999     999          999\n" +
                    "9                                    999     999          99\n" +
                    "99                                    999     999          9\n" +
                    "99      999999999999999999999999999    99999999999          \n" +
                    "99     99999999999999999999999999999    99999999999         \n" +
                    "99    999   999                            99    999        \n" +
                    "99   999   999                             99     999       \n" +
                    "99   99   999                              99999999999      \n" +
                    "99   99  999                               999999999999     \n" +
                    "99   99 999      999       9999999         99        999    \n" +
                    "99   99999        999      99999999        99         999   \n" +
                    "99   9999          999     99    999                   999  \n" +
                    "99   999            999    99     999                   999 \n" +
                    "99   99                    99      999             9     99 \n" +
                    "99   99                    99       999            99    99 \n" +
                    "99   99    9               99        99   999999   99999999 \n" +
                    "99   99    99              99        99   999999   99999999 \n" +
                    "99   99    999             99        99       99   99       \n" +
                    "99   99     999            999       99       99   99       \n" +
                    "99   99      99      99     999      99       99   99       \n" +
                    "99   99       9      999     999     99       99   99       \n" +
                    "99   99               999     999   999       99   99       \n" +
                    "99   99                999     999 999             999      \n" +
                    "99   99                 99      99999              9999     \n" +
                    "99   99                          999               99999    \n" +
                    "99   99    9999999999                      9999999999 999   \n" +
                    "99   99    99999999999                     9999999999  999  \n" +
                    "99   99    99       999      99            99      99   999 \n" +
                    "99   99    99        999     999           99      99    999\n" +
                    "99   99    99         999     999          99      99     99\n" +
                    "99   99    99          999     999         99      99     99\n" +
                    "99   99    999          999     999        99      99     99\n" +
                    "99   99     999          99      999       99      99     99\n" +
                    "99    9      999        999       999      99      99     99\n" +
                    "999           999      999         999     999     99     99\n" +
                    " 999           9999999999           999     999    99     99\n" +
                    "  999           99999999             999     999   99     99\n" +
                    "   999                                999     999  99     99\n" +
                    "    999                                999     999 99     99\n" +
                    "     99                                 999     99999     99\n" +
                    "9    99          99                      999     9999     99\n" +
                    "99   99999999    99        9999999999     99      999     99\n" +
                    "999  99999999    99        99999999999             99     99\n" +
                    " 999 99  99      99        99       999            99     99\n" +
                    "  99999  99      9999999   99        999           99     99\n" +
                    "   9999  99      9999999   99         999          99     99\n" +
                    "    999  99                99          999         999    99\n" +
                    "     999 99                99           999         999   99\n" +
                    "      99999                99            999         999  99\n" +
                    "       9999    9999999999999999999999999999999999     999 99\n" +
                    "        999     9999999999999999999999999999999999     99999\n" +
                    "         999     99     999                     999     9999\n" +
                    "          999    99      999                     999     999\n" +
                    "9          999   99       999                     999     99\n" +
                    "99          999  99        999                     999     9\n" +
                    "999          999999         999                     999     \n" +
                    " 999          99999          999999999999999999999999999    \n" +
                    "  999                         999999999999999999999999999   ",
                flags: [{
                    x: -80,
                    y: -135
                }, {
                    x: 135,
                    y: 80
                }],
                portals: [],
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
                    "9999999999999999   99         36                      999999\n" +
                    "                   99         36                      99    \n" +
                    "                   99         36                      99    \n" +
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
                    "      999   999    99   99999   9999   99999999999999999    \n" +
                    "     999   999     99   99        99   99                   \n" +
                    "9999999   999      99   99        99   99           99999999\n" +
                    "999999   999       99   99        99   99          999999999\n" +
                    "        999        99   99   99   99   99         999       \n" +
                    "       999         99   99   99   99   99        999        \n" +
                    "999999999          99   99        99   99       999   999999\n" +
                    "99999999           99   99        99   99      999   9999999\n" +
                    "                   99   99        99   99     999   999     \n" +
                    "    99999999999999999   9999   99999   99    999   999      \n" +
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
                    "    99                      63         99                   \n" +
                    "    99                      63         99                   \n" +
                    "999999                      63         99   9999999999999999\n" +
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
                portals: [],
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
                map: "455799   9999    9996564444444435345432334453325545444433555\n" +
                    "556799            999666555666555765756565545555666555555664\n" +
                    "766799             99977565655655666565665555665665556566565\n" +
                    "776699              9996667767677766767667676777666776666776\n" +
                    "999999999999999999999999769999999999999999999999999999999999\n" +
                    "999999999999999999999999669999999999999999999999999999999999\n" +
                    "    996767777777776676775699                                \n" +
                    "    996565434544534464565799                                \n" +
                    "    997663556665562566576699                                \n" +
                    "9   996566766666777766675799   999999    999999    99    999\n" +
                    "9   997557999999999999654799   99999     99999     999    99\n" +
                    "9   997647999999999999655799   9999      9999      9999    9\n" +
                    "9   99656699        99663799   999       999       99999    \n" +
                    "    99666799        99673699   99    9   99    9            \n" +
                    "    99656699  99    99754799   9    99   9    99            \n" +
                    "    99665799  999   99745699       999       999   99999999 \n" +
                    "    99655799   999  99746699      9999             997777999\n" +
                    "9   99665699    99  99647799     99999             996567799\n" +
                    "99  99754699        99757799    999 99             997655569\n" +
                    "999 99764699        99757799   999  99    999999999997646466\n" +
                    "6999997537999999999999657699   99   99    999999999997633355\n" +
                    "5799997557999999999999656799   99   99    999967766767433365\n" +
                    "5579996546766676676677764799   99  999    999976536565443345\n" +
                    "6557997656563425445656566699   99 999     999976534663443344\n" +
                    "6656677655556545443565566799   99999      999984433433333333\n" +
                    "4666766667667676766667776999   9999       999963333434333443\n" +
                    "465799999999999999999999999    999         99975334434444233\n" +
                    "55579999999999999999999999           999    9997634334443234\n" +
                    "456799                              99999    999764344334443\n" +
                    "456699                             999 999    99966343343433\n" +
                    "566799                            999   999    9997654333433\n" +
                    "566699   999999    99999999      999     999   9999755644432\n" +
                    "465699   99999    999999999     999       99   9999977634334\n" +
                    "556799   9999    999    999    999        99   99 9996763424\n" +
                    "456799   999    999    999    999        999   99  999656644\n" +
                    "556699   99    999    999    999        999    99   99955534\n" +
                    "455699   9    9999999999    999        999    999    9995644\n" +
                    "556799       9999999999    999        999    99999    997543\n" +
                    "465799                     99        999    9997999   996634\n" +
                    "465699                     999      999    999655999  996534\n" +
                    "466699                      999    999    99976456999 997663\n" +
                    "366799   999999              999  999    9997554567999996653\n" +
                    "355699   99999     9999999    999999    99977565556799996554\n" +
                    "466699   9999      99999999    9999    999776655656659996564\n" +
                    "455699   999       999999999          9997565776676457777443\n" +
                    "555799   99    9   9999999999        99975556999997555555524\n" +
                    "555699   9    99   99678757999      9997655579   96555555533\n" +
                    "525799       999   996645556999999999977555579   97644444534\n" +
                    "366799             996654556799999999998755679   96667455343\n" +
                    "355799             99655556666999    99966676999999997755433\n" +
                    "455799             997554556567999    999656677669  96743343\n" +
                    "365699   9999  99999975645456656999    99966566679  97544334\n" +
                    "355699   9999  999999665455555666999    99976677699996634443\n" +
                    "455799    999  9767766654554565676999    9997546777666444444\n" +
                    "457699     99  977555565542355666769999999996654456767336333\n" +
                    "265699      9  975555554554344355667999999996554333544444434\n" +
                    "365699         975656454324434343465766666776544453334334334\n" +
                    "365699   9     996564243443344443455652244344224243334432323\n" +
                    "556799   99    999755553433233334435453445444334322232232424\n" +
                    "466799   999    99966544333444432344334344434333334334344344",
                flags: [{
                    x: -275,
                    y: 130
                }, {
                    x: -130,
                    y: 275
                }],
                portals: [],
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
                    "9 999  99    99     99     999999     99     99    99  999 9\n" +
                    "9 99  99 9  99     99       9999       99     99  9 99  99 9\n" +
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
                    "9 99  99 9  99     99       9999       99     99  9 99  99 9\n" +
                    "9 999  99    99     99     999999     99     99    99  999 9\n" +
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
                        y: 16
                    },
                    {
                        x: 0,
                        y: -16
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
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "9999999999999999999  999999999999999999  9999999999999999999\n" +
                    "99999999999        99                  99        99999999999\n" +
                    "9999999999                                        9999999999\n" +
                    "999999999                                          999999999\n" +
                    "999999999    99999    999999    999999    99999    999999999\n" +
                    "999999999   99    9999     9    9     9999    99   999999999\n" +
                    "99999999     99            9    9            99     99999999\n" +
                    "9999999       999999999999 9    9 999999999999       9999999\n" +
                    "99                       9 9    9 9                       99\n" +
                    "99                       9 9    9 9                       99\n" +
                    "99                       9 9    9 9                       99\n" +
                    "99                      9 9      9 9                      99\n" +
                    "99                     9 9        9 9                     99\n" +
                    "99                    9 9          9 9                    99\n" +
                    "99                   9 9            9 9                   99\n" +
                    "99                  9 9              9 9                  99\n" +
                    "99                  9 9              9 9                  99\n" +
                    "99                  9 9              9 9                  99\n" +
                    "99               999  9              9  999               99\n" +
                    "99              9     9              9     9              99\n" +
                    "99             9 99999 9            9 99999 9             99\n" +
                    "99            9 9     9 9          9 9     9 9            99\n" +
                    "99           9 9       9 999    999 9       9 9           99\n" +
                    "99            9         9          9         9            99\n" +
                    "99       9              9          9              9       99\n" +
                    "99   9   9              9          9              9   9   99\n" +
                    "99   9   9                   99                   9   9   99\n" +
                    "99   9   9                   99                   9   9   99\n" +
                    "99   9   9                   99                   9   9   99\n" +
                    "99   9   9                   99                   9   9   99\n" +
                    "99   9   9              9          9              9   9   99\n" +
                    "99       9              9          9              9       99\n" +
                    "99            9         9          9         9            99\n" +
                    "99           9 9       9 999    999 9       9 9           99\n" +
                    "99            9 9     9 9          9 9     9 9            99\n" +
                    "99             9 99999 9            9 99999 9             99\n" +
                    "99              9     9              9     9              99\n" +
                    "99               999  9              9  999               99\n" +
                    "99                  9 9              9 9                  99\n" +
                    "99                  9 9              9 9                  99\n" +
                    "99                  9 9              9 9                  99\n" +
                    "99                   9 9            9 9                   99\n" +
                    "99                    9 9          9 9                    99\n" +
                    "99                     9 9        9 9                     99\n" +
                    "99                      9 9      9 9                      99\n" +
                    "99                       9 9    9 9                       99\n" +
                    "99                       9 9    9 9                       99\n" +
                    "99                       9 9    9 9                       99\n" +
                    "9999999       999999999999 9    9 999999999999       9999999\n" +
                    "99999999     99            9    9            99     99999999\n" +
                    "999999999   99    9999     9    9     9999    99   999999999\n" +
                    "999999999    99999    999999    999999    99999    999999999\n" +
                    "999999999                                          999999999\n" +
                    "9999999999                                        9999999999\n" +
                    "99999999999        99                  99        99999999999\n" +
                    "9999999999999999999  999999999999999999  9999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999\n" +
                    "999999999999999999999999999999999999999999999999999999999999",
                flags: [{
                    x: -215,
                    y: 0
                }, {
                    x: 215,
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
                    "99   99  999999                            99  9999       99\n" +
                    "99   999999999         99          99                 9   99\n" +
                    "99   9999            999            999              99   99\n" +
                    "99   99              999            999            9999   99\n" +
                    "99   9                 99          99         999999999   99\n" +
                    "99       9999  99                            999999  99   99\n" +
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
                        x: -180,
                        y: -50
                    },
                    {
                        x: 180,
                        y: 50
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
                    "   99   99    9 999    9  999  999  9    999 9    99   99   \n" +
                    " 9999   9999999  9   9999999    9999999   9  9999999   9999 \n" +
                    " 99     99999    9 99999999      99999999 9    99999     99 \n" +
                    " 99        9999999999                  9999999999        99 \n" +
                    " 99        999999999                    999999999        99 \n" +
                    " 99999                9999        9999                99999 \n" +
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
                    " 99999                9999        9999                99999 \n" +
                    " 99        999999999                    999999999        99 \n" +
                    " 99        9999999999                  9999999999        99 \n" +
                    " 99     99999    9 99999999      99999999 9    99999     99 \n" +
                    " 9999   9999999  9   9999999    9999999   9  9999999   9999 \n" +
                    "   99   99    9 999    9  999  999  9    999 9    99   99   \n" +
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
                    },
                    {
                        x: 0,
                        y: -230
                    },
                    {
                        x: 0,
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
                    "     5         999    777      99999     79999     9    9   \n" +
                    "77  795  77     999  99997    99999      7999   7      9   9\n" +
                    "997  7  7997     999 99997   99999      7999   799    99  99\n" +
                    "997    799997     9999997   99999     77999   79999    9  99\n" +
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
                    "99  9    99997   99977     99999   7999999     799997    799\n" +
                    "99  99    997   9997      99999   79999 999     7997  7  799\n" +
                    "9   9      7   9997      99999    79999  999     77  597  77\n" +
                    "   9    9     99997     99999      777    999         5     \n" +
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
                portals: [],
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
                    '{"name":"Pulse-Fighter","level":3,"model":1,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,100],"reload":[20,33]},"ship":{"mass":130,"speed":[105,120],"rotation":[60,85],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-75,-70,-50,0,50,70,105,95],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3,15,18,23,29,32,29,20,0],"height":[0,10,13,17,25,25,23,20,0],"propeller":true,"texture":[63,4,11,1,10,8,18,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-25,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-37,-15,10,30,60],"z":[0,0,0,0,0,0,0]},"width":[5,12,15,15,9],"height":[2,18,24,23,10],"propeller":false,"texture":[9,9,9,63]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-40,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-40,-58,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,3,8,10,15,0],"height":[0,3,8,10,15,0],"angle":0,"laser":{"damage":[15,30],"rate":1.15,"type":2,"speed":[150,185],"number":1,"error":0},"propeller":false,"texture":[17,4]},"cannon2":{"section_segments":8,"offset":{"x":40,"y":40,"z":-13},"position":{"x":[0,0,0,0,0,0],"y":[-40,-55,-15,-5,20,30],"z":[0,0,0,0,0,-2]},"width":[0,3,5,8,8,8],"height":[0,5,8,10,10,8],"angle":0,"texture":[17,63,63,10,63],"laser":{"damage":[3,6],"rate":3.15,"type":1,"speed":[100,160],"number":1,"error":0},"propeller":false},"deco":{"section_segments":8,"offset":{"x":45,"y":50,"z":-16},"position":{"x":[2,2,7,7,0,0,0],"y":[-52,-50,-20,10,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,4,10,10,10,5,0],"height":[0,10,15,15,13,10,0],"angle":0,"texture":4,"propeller":false}},"wings":{"main":{"length":[75,2,25],"width":[110,50,60,30],"angle":[-25,20,20],"position":[30,50,50,30],"doubleside":true,"bump":{"position":30,"size":5},"texture":[11,63],"offset":{"x":0,"y":0,"z":10}},"winglets":{"doubleside":true,"length":[40],"width":[40,16,30],"angle":[-20,-10],"position":[-30,-60,-55],"bump":{"position":0,"size":20},"texture":63,"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[35,0,40],"width":[50,30,40,20],"angle":[20,60,60],"position":[70,75,80,100],"doubleside":true,"texture":63,"bump":{"position":30,"size":10},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Pulse-Fighter","level":3,"model":1,"code":301,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,100],"reload":[20,33]},"ship":{"mass":130,"speed":[105,120],"rotation":[60,85],"acceleration":[80,100]}},"shape":[2.549,2.263,2.002,1.848,2.02,1.823,1.031,0.922,0.852,1.059,1.184,1.159,1.325,1.399,2.504,2.61,2.694,2.677,2.702,2.761,2.555,3.173,3.137,2.771,2.779,2.735,2.779,2.771,3.137,3.173,2.555,2.761,2.702,2.677,2.694,2.61,2.504,1.399,1.326,1.159,1.184,1.059,0.852,0.922,1.031,1.823,2.02,1.848,2.002,2.263],"lasers":[{"x":0,"y":-2.548,"z":-0.364,"angle":0,"damage":[15,30],"rate":1.15,"type":2,"speed":[150,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.04,"y":-0.39,"z":-0.338,"angle":0,"damage":[3,6],"rate":3.15,"type":1,"speed":[100,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.04,"y":-0.39,"z":-0.338,"angle":0,"damage":[3,6],"rate":3.15,"type":1,"speed":[100,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.173}}',
                    '{"name":"Side-Fighter","level":3,"model":2,"size":1.5,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":100,"speed":[100,125],"rotation":[50,85],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":16,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-22,-14,0,15,22,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,23,28,25,17,15,0],"height":[5,10,23,28,25,17,15,0],"texture":[5,2,63,63,3,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-11,-10,0,0,5],"z":[0,0,0,0,0,0,0,0]},"width":[0,13,16.5,18,19],"height":[0,13,16.5,18,19],"texture":[7,7,2,2],"propeller":false},"cockpit2":{"section_segments":6,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-10,-12,-11.5,0],"z":[0,0,0,0,0,0]},"width":[10,10,13,17],"height":[10,10,13,17],"texture":[1.9],"propeller":false},"gun":{"section_segments":8,"offset":{"x":0,"y":-30,"z":-16},"position":{"x":[0,0,0,0],"y":[-30,-28,15,15],"z":[0,0,0,0]},"width":[0,1,2,0],"height":[0,1,2,0],"texture":[2,2,5],"laser":{"damage":[4,8],"rate":10,"type":1,"speed":[150,240],"number":1,"error":14}},"tail":{"section_segments":8,"offset":{"x":-22,"y":30,"z":-15},"position":{"x":[0,0,0,0],"y":[-62,-60,15,15],"z":[-10,-10,0,0]},"width":[0,1,2,0],"height":[0,1,2,0],"texture":[4],"angle":170},"tail2":{"section_segments":8,"offset":{"x":0,"y":30,"z":25},"position":{"x":[0,0,0,0],"y":[-40,-58,15,15],"z":[10,10,0,0]},"width":[0,1,2,0],"height":[0,1,2,0],"texture":[4],"angle":180}},"wings":{"wings1":{"doubleside":true,"offset":{"x":30,"y":0,"z":-55},"length":[0,40,45,40],"width":[0,0,100,100,0],"angle":[0,60,90,120],"position":[0,0,0,0,0],"texture":[14],"bump":{"position":0,"size":2}},"wings2":{"doubleside":true,"offset":{"x":30,"y":0,"z":-55},"length":[0,40,45,40,0],"width":[0,6,6,6,6,0],"angle":[60,60,90,120,120],"position":[0,0,-48,-48,0,0],"texture":[2],"bump":{"position":-20,"size":10}},"wings3":{"doubleside":true,"offset":{"x":30,"y":0,"z":-55},"length":[0,40,45,40,0],"width":[0,6,6,6,6,0],"angle":[60,60,90,120,120],"position":[0,0,48,48,0,0],"texture":[2],"bump":{"position":20,"size":10}},"wings4":{"doubleside":true,"offset":{"x":29.5,"y":0,"z":-55},"length":[0,40,45,40],"width":[0,0,100,100,0],"angle":[0,60,90,120],"position":[0,0,0,0,0],"texture":[4],"bump":{"position":0,"size":2}},"join":{"doubleside":true,"offset":{"x":10,"y":0,"z":0},"length":[40,0],"width":[15,10,0],"angle":[0,0],"position":[0,0,0,0],"texture":[8],"bump":{"position":10,"size":20}}},"typespec":{"name":"Side-Fighter","level":3,"model":2,"code":302,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,35]},"ship":{"mass":100,"speed":[100,125],"rotation":[50,85],"acceleration":[100,130]}},"shape":[1.8,0.977,0.999,1.004,0.949,0.847,2.143,2.07,1.87,1.736,1.649,1.593,1.564,1.564,1.593,1.649,1.736,1.87,2.07,2.143,1.424,2.018,2.903,1.262,1.221,2.64,1.221,1.262,2.903,2.018,1.424,2.143,2.07,1.87,1.736,1.649,1.593,1.564,1.564,1.593,1.649,1.736,1.87,2.07,2.143,0.847,0.949,1.004,0.999,0.977],"lasers":[{"x":0,"y":-1.8,"z":-0.48,"angle":0,"damage":[4,8],"rate":10,"type":1,"speed":[150,240],"number":1,"spread":0,"error":14,"recoil":0}],"radius":2.903}}',
                    '{"name":"Shadow X-1","level":3,"model":3,"size":0.9,"zoom":0.9,"specs":{"shield":{"capacity":[90,130],"reload":[3,6]},"generator":{"capacity":[50,90],"reload":[18,27]},"ship":{"mass":90,"speed":[120,135],"rotation":[35,63],"acceleration":[110,130]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-100,-95,-65,-30,-20,0,30,50,60,70,80,50],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,15,20,29,35,35,23,23,30,30,30,20,0],"height":[0,5,10,20,20,20,10,10,15,15,15,10,0],"texture":[12,3,63,4,3,4,8,4,63,4,63,17]},"back":{"section_segments":10,"offset":{"x":0,"y":-18,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,19,2],"height":[3,5,7,8,2],"texture":[63,63,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-25,"z":13},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-15,5,35],"z":[0,0,0,0,-14,0]},"width":[0,10,13,11,7],"height":[0,3,10,5,5],"texture":[9,9,9,63]},"laser":{"section_segments":12,"offset":{"x":60,"y":-18,"z":-13},"position":{"x":[0,0,0,0,0,0,0,0,0,-3,-3,0,0],"y":[-35,-23,-25,0,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,10,15,15,15,10,10,15,9,0],"height":[0,9,10,15,15,15,10,10,15,9,0],"texture":[6,17,3,4,10,4,63,8,13],"propeller":true,"angle":0.5,"laser":{"damage":[3,4],"rate":8,"type":1,"speed":[180,210],"number":1}}},"wings":{"top":{"offset":{"x":0,"y":50,"z":6},"length":[0,35],"width":[50,50,20],"angle":[90,90],"position":[0,0,20],"texture":[4],"bump":{"position":-40,"size":10}},"side":{"offset":{"x":90,"y":59,"z":14},"length":[20,0],"width":[45,20,0],"angle":[20,20],"position":[-10,15,15],"texture":[4],"bump":{"position":40,"size":3}},"wing1":{"doubleside":1,"offset":{"x":10,"y":30,"z":-5},"length":[30,2,10,2,30,2,20],"width":[140,80,90,80,70,50,60,40],"angle":[0,20,20,20,20,20,20,20],"position":[-90,-50,-33,-25,-25,5,10,30],"texture":[4],"bump":{"position":30,"size":6}},"wing2":{"doubleside":1,"offset":{"x":10,"y":30,"z":-5},"length":[30,2,10,2,31,3,22],"width":[140,80,90,80,70,50,60,40],"angle":[0,20,20,20,20,19,19,20],"position":[-90,-50,-35,-25,-18,12,10,30],"texture":[3],"bump":{"position":30,"size":4}},"wing3":{"doubleside":1,"offset":{"x":10,"y":29,"z":-5},"length":[30,2,10,2,31,3,22],"width":[150,91,90,80,70,50,60,40],"angle":[0,19,19,19,19,19,19,20],"position":[-90,-50,-36,-32,-28,5,10,30],"texture":[3],"bump":{"position":40,"size":3}}},"typespec":{"name":"Shadow X-1","level":3,"model":3,"code":303,"specs":{"shield":{"capacity":[90,130],"reload":[3,6]},"generator":{"capacity":[50,90],"reload":[18,27]},"ship":{"mass":90,"speed":[120,135],"rotation":[35,63],"acceleration":[110,130]}},"shape":[1.804,2.455,2.021,1.709,1.507,1.356,1.201,1.437,1.476,1.452,1.408,1.39,1.375,1.571,1.787,2.054,2.18,2.42,2.474,1.629,1.45,1.206,1.41,1.599,1.594,1.569,1.594,1.599,1.41,1.206,1.45,1.629,2.474,2.42,2.18,2.054,1.787,1.571,1.375,1.39,1.408,1.452,1.476,1.437,1.201,1.356,1.507,1.709,2.021,2.455],"lasers":[{"x":1.075,"y":-0.954,"z":-0.234,"angle":0.5,"damage":[3,4],"rate":8,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.075,"y":-0.954,"z":-0.234,"angle":-0.5,"damage":[3,4],"rate":8,"type":1,"speed":[180,210],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.474}}',
                    '{"name":"Y-Defender","level":3,"model":4,"size":1.5,"specs":{"shield":{"capacity":[175,225],"reload":[4,6]},"generator":{"capacity":[50,80],"reload":[20,30]},"ship":{"mass":200,"speed":[80,115],"rotation":[40,65],"acceleration":[70,85]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-98,-100,-91,-55,-50,-40,-20,-10,30,70,75,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,16,19,20,23,23,13,13,20,17,20,18,0],"height":[0,7,10,11,20,20,15,15,20,20,15,15,0],"texture":[17,63,63,2,3,13,63,8,10,11,63,12],"laser":{"damage":[20,40],"rate":2,"type":1,"speed":[130,180],"number":1,"recoil":80,"error":0}},"propulsors":{"section_segments":8,"offset":{"x":45,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-24,-22,-24,-30,-28,10,15,26,32,45,55,60,95,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,14,16,21,18,11,11,22,18,15,15,13,0],"height":[0,5,14,16,21,18,11,11,22,18,15,15,13,0],"texture":[63,11,2,63,63,63,8,4,10,2,4,13,17],"propeller":true,"angle":0},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-70,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-22,-5,16,30,60],"z":[-1,0,0,0,0]},"width":[7,10,12,8,8],"height":[2,12,15,10,10],"texture":[9,9,9,18],"propeller":false}},"wings":{"join":{"doubleside":1,"offset":{"x":14,"y":0,"z":0},"length":[25,0],"width":[20,10,0],"angle":[0,0],"position":[0,0,0,0],"texture":[63],"bump":{"position":0,"size":40}},"join2":{"doubleside":1,"offset":{"x":14,"y":50,"z":0},"length":[25,0],"width":[20,10,0],"angle":[0,0],"position":[0,0,0,0],"texture":[3],"bump":{"position":0,"size":40}},"winglets":{"doubleside":1,"offset":{"x":5,"y":40,"z":10},"length":[0,15,0,15],"width":[0,15,30,30,50],"angle":[70,70,0,0],"position":[0,0,6,5,50],"texture":[63],"bump":{"position":-40,"size":30}},"join3":{"doubleside":1,"offset":{"x":14,"y":-60,"z":0},"length":[20,0],"width":[25,10,0],"angle":[-10,-10],"position":[5,-10,-10,-10],"texture":[63],"bump":{"position":0,"size":10}},"join5":{"doubleside":1,"offset":{"x":57,"y":50,"z":0},"length":[0,0,0,0,12],"width":[0,35,30,50,40,30],"angle":[0,0,0,0,0],"position":[0,0,5,15,20,40],"texture":[63],"bump":{"position":-40,"size":20}}},"typespec":{"name":"Y-Defender","level":3,"model":4,"code":304,"specs":{"shield":{"capacity":[175,225],"reload":[4,6]},"generator":{"capacity":[50,80],"reload":[20,30]},"ship":{"mass":200,"speed":[80,115],"rotation":[40,65],"acceleration":[70,85]}},"shape":[3.006,3.054,3.046,2.467,2.381,0.726,1.314,1.531,1.866,2.151,2.12,2.015,1.947,1.913,1.914,1.807,2.25,2.329,2.468,3.247,3.769,3.339,3.149,3.531,2.32,2.254,2.32,3.531,3.149,3.339,3.769,3.247,2.468,2.329,2.25,1.807,1.914,1.913,1.947,2.015,2.12,2.151,1.866,1.531,1.314,0.726,2.381,2.467,3.046,3.054],"lasers":[{"x":0,"y":-3,"z":0,"angle":0,"damage":[20,40],"rate":2,"type":1,"speed":[130,180],"number":1,"spread":0,"error":0,"recoil":80}],"radius":3.769}}',
                ]
            },
            {
                TIER: 4,
                SHIPS: [
                    '{"name":"Vanguard","level":4,"model":1,"size":1.2,"specs":{"shield":{"capacity":[160,255],"reload":[3,5]},"generator":{"capacity":[90,165],"reload":[35,50]},"ship":{"mass":200,"speed":[75,110],"rotation":[90,125],"acceleration":[75,110]}},"bodies":{"main":{"section_segments":16,"offset":{"x":0,"y":-41,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,6,12,42,80,90,105,110,120,112],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,22,24,33,33,28,27,20,16,0],"height":[0,22,24,27,30,27,27,20,16,0],"texture":[1,63,1,11,63,10,63,8,17],"propeller":true},"engines":{"section_segments":12,"offset":{"x":28,"y":-20,"z":-15},"position":{"x":[20,-4,-5,-2,-3,-3],"y":[0,40,74,98,108,100],"z":[3,0,0,0,0,0]},"width":[9,10,9,14,11,0],"height":[2,10,9,14,11,0],"texture":[2,2,13,63,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-11,-10,0,0,5],"z":[0,0,0,0,0,0,0,0]},"width":[0,13.5,19.5,21,22],"height":[0,13.5,19.5,21,22],"texture":[7,7,2,2],"propeller":false},"cockpit2":{"section_segments":6,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-10,-12,-11.5,0],"z":[0,0,0,0,0,0]},"width":[10,10,13,20],"height":[10,10,13,20],"texture":[1.9],"propeller":false},"cockpit3":{"section_segments":12,"offset":{"x":0,"y":-27,"z":14},"position":{"x":[0,0,0,0,0],"y":[0,20,35,50,70],"z":[-8,-2,-1,-1,0]},"width":[11,16,18,16,0],"height":[17,25,25,23,0],"texture":[9,9,9,63],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":15,"y":-170,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10,5,23,27,62,62,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5.3,6,7,7,4,4,7,7],"height":[0,5.3,6,7,7,4,4,7,7],"texture":[12,13,63,10.25,17,4,63,8],"propeller":false,"laser":{"damage":[18,25],"rate":1.9,"type":2,"speed":[170,230],"recoil":110,"number":1,"error":0}}},"wings":{"outer":{"offset":{"x":37,"y":-102,"z":-5},"length":[0,4,6,8,10,4,1,9,3,40],"width":[0,213,215,200,160,140,135,95,85,110,35],"angle":[-15,-15,-15,-15,-15,-15,-15,0,30,30,28,8],"position":[50,50,49,65,80,100,102,115,105,115,180],"texture":[4,5,3,4,4,3,5,63,5,8],"doubleside":true,"bump":{"position":30,"size":4}},"inner":{"offset":{"x":-37,"y":-95,"z":-5},"length":[12],"width":[165,112],"angle":[0],"position":[20,0],"texture":[63,63],"doubleside":true,"bump":{"position":30,"size":4}},"winglet":{"offset":{"x":98,"y":73,"z":60},"length":[45,15,15,45],"width":[25,60,35,60,25],"angle":[-70,-70,-110,-110],"position":[10,0,0,0,10],"texture":[63],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Vanguard","level":4,"model":1,"code":401,"specs":{"shield":{"capacity":[160,255],"reload":[3,5]},"generator":{"capacity":[90,165],"reload":[35,50]},"ship":{"mass":200,"speed":[75,110],"rotation":[90,125],"acceleration":[75,110]}},"shape":[3.968,3.99,3.975,3.547,2.948,2.587,2.364,2.239,2.03,2.179,2.158,2.192,2.264,2.39,2.555,2.951,3.272,3.526,3.677,3.476,1.891,2.168,2.282,2.221,2.15,1.9,2.15,2.221,2.282,2.168,1.891,3.476,3.677,3.526,3.272,2.951,2.555,2.39,2.264,2.192,2.158,2.179,2.03,2.239,2.364,2.587,2.948,3.547,3.975,3.99],"lasers":[{"x":0.36,"y":-3.96,"z":-0.48,"angle":0,"damage":[18,25],"rate":1.9,"type":2,"speed":[170,230],"number":1,"spread":0,"error":0,"recoil":110},{"x":-0.36,"y":-3.96,"z":-0.48,"angle":0,"damage":[18,25],"rate":1.9,"type":2,"speed":[170,230],"number":1,"spread":0,"error":0,"recoil":110}],"radius":3.99}}',
                    '{"name":"Mercury","level":4,"model":2,"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[100,150],"reload":[30,48]},"ship":{"mass":205,"speed":[85,105],"rotation":[60,90],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-60,-40,-45,-40,-30,0,50,100,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,9,15,20,30,35,20,0],"height":[0,6,7,10,15,25,25,20,0],"texture":[6,17,4,3,63,11,10,17],"propeller":true,"laser":{"damage":[20,42],"rate":1.05,"type":2,"speed":[170,200],"number":1,"error":0,"recoil":30}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-55,-45,-15,5,45],"z":[0,0,0,0,0]},"width":[0,11,16,15,10],"height":[0,8,23,23,5],"texture":[4,9,9,4],"propeller":false},"deco":{"section_segments":12,"offset":{"x":55,"y":0,"z":5},"position":{"x":[-13,-8,-10,15,5,8,2,5,15,10,10,10],"y":[-125,-100,-110,-45,-20,-10,20,25,60,100,105,95],"z":[-20,-20,-20,-20,-15,-15,-3,0,4,0,0,0,0,0]},"width":[0,5,10,18,20,15,15,17,20,15,13,0],"height":[0,5,10,25,25,15,15,20,25,20,17,0],"texture":[6,17,4,18,4,63,1,8,13,12,17],"angle":1,"propeller":0,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"error":3}},"propulsor":{"section_segments":8,"offset":{"x":66,"y":105,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-20,-10],"z":[0,0,0,0,0,0]},"width":[2,13],"height":[5,13],"texture":[4,4,4,4,6],"propeller":true,"angle":0},"wingends":{"section_segments":8,"offset":{"x":107,"y":10,"z":-18},"position":{"x":[0,2,8,2,0,0],"y":[-30,-15,0,15,30,30],"z":[0,0,0,0,0,0]},"width":[1,3,6,3,1,0],"height":[1,5,10,5,1,0],"texture":[4],"propeller":0,"angle":2}},"wings":{"main":{"doubleside":1,"length":[65,0,45,0],"width":[70,50,50,10,0],"angle":[-5,-30,-30,-30],"position":[30,60,50,10,10],"texture":[11,63],"bump":{"position":30,"size":10},"offset":{"x":10,"y":0,"z":10}},"font":{"doubleside":1,"length":[80,0],"width":[20,15,0],"angle":[-10,0],"position":[-10,-47,-47],"texture":[63],"bump":{"position":-30,"size":10},"offset":{"x":0,"y":0,"z":10}},"bac":{"doubleside":1,"length":[0,50,0],"width":[0,40,15,0],"angle":[70,70,0],"position":[-25,-25,-7,-7],"texture":[63],"bump":{"position":-30,"size":10},"offset":{"x":15,"y":100,"z":20}},"stab1":{"doubleside":1,"length":[0,25,0],"width":[0,10,30,0],"angle":[0,0,0],"position":[-10,-10,-30,-40],"texture":3,"bump":{"position":30,"size":20},"offset":{"x":30,"y":-45,"z":-10}}},"typespec":{"name":"Mercury","level":4,"model":2,"code":402,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[100,150],"reload":[30,48]},"ship":{"mass":205,"speed":[85,105],"rotation":[60,90],"acceleration":[60,80]}},"shape":[1.56,1.287,3.405,3.384,3.175,2.938,2.764,2.649,2.582,2.558,2.333,2.853,2.985,3.155,3.091,3.019,2.746,2.881,3.068,3.336,3.421,3.227,2.7,2.743,2.647,2.605,2.647,2.743,2.7,3.227,3.421,3.336,3.068,2.881,2.746,3.019,3.091,3.155,2.985,2.853,2.333,2.558,2.582,2.649,2.764,2.938,3.175,3.384,3.405,1.287],"lasers":[{"x":0,"y":-1.56,"z":0.26,"angle":0,"damage":[20,42],"rate":1.05,"type":2,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":30},{"x":1.035,"y":-3.244,"z":0.13,"angle":1,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.035,"y":-3.244,"z":0.13,"angle":-1,"damage":[3,5],"rate":4,"type":1,"speed":[150,180],"number":1,"spread":0,"error":3,"recoil":0}],"radius":3.421}}',
                    '{"name":"X-Warrior","level":4,"model":3,"size":1.6,"specs":{"shield":{"capacity":[150,225],"reload":[3,5]},"generator":{"capacity":[90,170],"reload":[35,50]},"ship":{"mass":230,"speed":[75,100],"rotation":[50,90],"acceleration":[90,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-75,-50,-45,-5,5,25,45,50,80,110,90],"z":[-5,-5,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,13,20,21,25,22,23,30,30,30,20,0],"height":[0,5,15,16,21,19,18,20,20,20,10,0],"texture":[13,2,63,11,13,63,11,4,8,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-29,-5,18,50,52],"z":[0,0,2,3,1,0,0,0]},"width":[0,8,11,11,8,5],"height":[0,10,17,17,15,12],"texture":[9,9,9,4],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":23,"y":-75,"z":-5},"position":{"x":[-2,-2,-1,0,0,0,0],"y":[-33,-30,0,5,20,30],"z":[0,0,0,0,0,0,0]},"width":[0,2,3,4,4,1],"height":[0,2,3,4,4,1],"texture":[6,4,63,12,63],"angle":0.5,"laser":{"damage":[4,7],"rate":3.5,"type":1,"speed":[120,190],"number":1,"error":0}},"wingendtop":{"section_segments":12,"offset":{"x":65,"y":30,"z":31},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-70,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,2,3,7,7,5,0],"height":[0,2,3,7,7,5,0],"texture":[17,4,63,11,63,12],"angle":1.5,"laser":{"damage":[3,4],"rate":3.2,"type":1,"speed":[110,180],"number":1,"error":0}},"wingendbottom":{"section_segments":12,"offset":{"x":85,"y":77,"z":-23},"position":{"x":[0,0,0,0,0,0,0],"y":[-65,-70,-20,0,20,30,25],"z":[0,0,0,0,0,0,0]},"width":[0,2,3,7,7,5,0],"height":[0,2,3,7,7,5,0],"texture":[17,4,63,18,63,12],"angle":1.5,"laser":{"damage":[2,3],"rate":2.8,"type":1,"speed":[100,170],"number":1,"error":0}},"propellers":{"section_segments":8,"offset":{"x":27,"y":50,"z":5},"position":{"x":[-3,-3,3,3,3,4,0,0,0],"y":[-44,-49,-30,-5,15,40,50,40],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,12,10,10,12,8,0],"height":[0,7,15,13,13,15,12,0],"texture":[13,2,3,63,4,13,17],"angle":0,"propeller":true}},"wings":{"xwing1":{"doubleside":true,"offset":{"x":15,"y":70,"z":-5},"length":[35,24,0],"width":[60,50,40,0],"angle":[50,20,20],"position":[-20,-10,-30,-30],"texture":[1,10],"bump":{"position":40,"size":5}},"xwing2":{"doubleside":true,"offset":{"x":25,"y":70,"z":0},"length":[35,30,0],"width":[60,50,40,0],"angle":[-30,-10,-10],"position":[-5,-5,15,15],"texture":[63,8],"bump":{"position":40,"size":5}},"winglets2":{"doubleside":true,"offset":{"x":15,"y":-30,"z":0},"length":[25,0],"width":[30,17,0],"angle":[-10,0],"position":[0,-25,-25],"texture":63,"bump":{"position":30,"size":10}},"winglets1":{"doubleside":true,"offset":{"x":10,"y":80,"z":-5},"length":[0,25,25],"width":[0,30,30,20,0],"angle":[80,70,70,70],"position":[-20,-20,-10,10,10],"texture":[1],"bump":{"position":40,"size":5}}},"typespec":{"name":"X-Warrior","level":4,"model":3,"code":403,"specs":{"shield":{"capacity":[150,225],"reload":[3,5]},"generator":{"capacity":[90,170],"reload":[35,50]},"ship":{"mass":230,"speed":[75,100],"rotation":[50,90],"acceleration":[90,100]}},"shape":[3.046,3.509,3.518,2.575,2.395,2.366,1.988,1.067,2.447,2.381,2.265,2.185,2.148,2.751,2.836,2.971,3.172,3.527,4.049,4.487,4.44,3.462,3.39,3.365,3.258,2.886,3.258,3.365,3.39,3.462,4.44,4.487,4.049,3.527,3.172,2.971,2.836,2.751,2.148,2.185,2.265,2.381,2.447,1.067,1.988,2.366,2.395,2.575,3.518,3.509],"lasers":[{"x":0.663,"y":-3.455,"z":-0.16,"angle":0.5,"damage":[4,7],"rate":3.5,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.663,"y":-3.455,"z":-0.16,"angle":-0.5,"damage":[4,7],"rate":3.5,"type":1,"speed":[120,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.021,"y":-1.279,"z":0.992,"angle":1.5,"damage":[3,4],"rate":3.2,"type":1,"speed":[110,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.021,"y":-1.279,"z":0.992,"angle":-1.5,"damage":[3,4],"rate":3.2,"type":1,"speed":[110,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.661,"y":0.225,"z":-0.736,"angle":1.5,"damage":[2,3],"rate":2.8,"type":1,"speed":[100,170],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.661,"y":0.225,"z":-0.736,"angle":-1.5,"damage":[2,3],"rate":2.8,"type":1,"speed":[100,170],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.487}}',
                    '{"name":"Side-Interceptor","level":4,"model":4,"size":1.6,"specs":{"shield":{"capacity":[175,225],"reload":[3,6]},"generator":{"capacity":[100,155],"reload":[30,44]},"ship":{"mass":130,"speed":[80,118],"rotation":[50,100],"acceleration":[110,140]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,25,35,20],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,10,23,28,25,15,14,16,0],"height":[5,10,23,28,25,15,14,16,0],"texture":[1,3,63,63,3,63,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-11,-10,0,0,5],"z":[0,0,0,0,0,0,0,0]},"width":[0,13,16.5,18,19],"height":[0,13,16.5,18,19],"texture":[7,7,2,2],"propeller":false},"cockpit2":{"section_segments":6,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-10,-12,-11.5,0],"z":[0,0,0,0,0,0]},"width":[10,10,13,17],"height":[10,10,13,17],"texture":[1.9],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":48,"y":-25,"z":0},"position":{"x":[-3,-3,-1.5,-1,0,0,0],"y":[-25,-30,-10,-5,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[0,2,4,3,5,2,0],"height":[0,2,4,3,5,2,0],"texture":[17,2,63,2,2],"angle":3,"laser":{"damage":[5,7],"rate":7,"type":1,"speed":[100,200],"number":1,"error":0}},"stick":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[17,17,17,17],"y":[-30,-28,15,15],"z":[0,0,0,0]},"width":[0,1,2,0],"height":[0,1,2,0],"texture":[3,2,5]}},"wings":{"wings1":{"doubleside":true,"offset":{"x":50,"y":20,"z":0},"length":[0,-20,-20,-5,-20],"width":[0,30,20,110,110,0],"angle":[290,290,315,315,315],"position":[-20,-20,-30,-60,-60,-30],"texture":[3,3,3,4,3],"bump":{"position":10,"size":-10}},"wings2":{"doubleside":true,"offset":{"x":50,"y":20,"z":0},"length":[0,40,15,0,15],"width":[0,30,20,110,110,0],"angle":[-115,-115,-155,-155,-155],"position":[-20,-20,-10,-40,-40,-10],"texture":[3,3,63,63,63],"bump":{"position":10,"size":10}},"wings3":{"doubleside":true,"offset":{"x":22,"y":-10,"z":-15},"length":[0,0,-15,-5,-15],"width":[0,0,0,70,70,0],"angle":[270,270,260,270,280],"position":[20,20,30,40,40,30],"texture":[3,3,13,2,13],"bump":{"position":-20,"size":-15}},"wings4":{"doubleside":true,"offset":{"x":45,"y":-30,"z":-17},"length":[0,0,-15,-5,-15],"width":[0,0,0,70,70,0],"angle":[270,270,260,270,280],"position":[20,20,30,40,40,30],"texture":[3,3,13,2,12],"bump":{"position":-20,"size":-15}},"join":{"doubleside":true,"offset":{"x":0,"y":0,"z":0},"length":[50,0],"width":[30,10,0],"angle":[0,0],"position":[0,5,5,0],"texture":63,"bump":{"position":10,"size":20}}},"typespec":{"name":"Side-Interceptor","level":4,"model":4,"code":404,"specs":{"shield":{"capacity":[175,225],"reload":[3,6]},"generator":{"capacity":[100,155],"reload":[30,44]},"ship":{"mass":130,"speed":[80,118],"rotation":[50,100],"acceleration":[110,140]}},"shape":[1.026,1.042,3.179,3.071,2.513,2.28,2.28,2.095,1.967,1.83,1.769,1.823,1.864,1.829,1.797,1.814,1.867,1.955,2.088,2.096,1.709,1.988,2.224,1.177,1.14,1.122,1.14,1.177,2.224,1.988,1.709,2.096,2.088,1.955,1.867,1.814,1.797,1.829,1.864,1.823,1.769,1.83,1.967,2.095,2.28,2.28,2.513,3.071,3.179,1.042],"lasers":[{"x":1.39,"y":-1.754,"z":0,"angle":3,"damage":[5,7],"rate":7,"type":1,"speed":[100,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.39,"y":-1.754,"z":0,"angle":-3,"damage":[5,7],"rate":7,"type":1,"speed":[100,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.179}}',
                    '{"name":"Pioneer","level":4,"model":5,"size":1.6,"specs":{"shield":{"capacity":[175,245],"reload":[4,7]},"generator":{"capacity":[50,135],"reload":[25,45]},"ship":{"mass":270,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-97,-100,-64,-55,-10,0,13,25,55,80,100,90],"z":[-10,-10,-6,-5,2,0,0,0,0,0,0,0,0,0]},"width":[15,15,39,40,43,33,33,43,44,43,20,0],"height":[0,5,20,20,20,20,20,27,30,27,15,0],"texture":[13,2,1,11,2,63,4,13,18,63,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-30,"z":12},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-25,-5,15,60],"z":[0,0,2,3,0]},"width":[11,15,17,15,0],"height":[0,14,17,18,0],"texture":[7,9,9,63],"propeller":false},"Headlights":{"section_segments":12,"offset":{"x":28,"y":-60,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-30,-20,0,20,30],"z":[0,0,0,0,0,0,0]},"width":[0,5,9,8,5,5],"height":[0,5,10,10,10,5],"texture":[17,63,4,18,2],"angle":0,"laser":{"damage":[6,11],"rate":4,"type":1,"speed":[100,140],"number":1,"error":0}},"shield":{"section_segments":6,"offset":{"x":57,"y":-50,"z":-10},"position":{"x":[0,0,3,2,3,0,0],"y":[-26,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[8,8,13,13,13,8,0],"height":[0,15,25,20,25,15,0],"propeller":true,"texture":[13,3.8,8,17.8,12.8,16.8],"angle":0},"shield2":{"section_segments":6,"offset":{"x":60,"y":65,"z":10},"position":{"x":[0,0,3,2,3,0,0],"y":[-26,-30,-20,0,20,30,20],"z":[0,0,0,0,0,0,0]},"width":[10,10,16,16,16,10,0],"height":[0,15,25,20,25,15,0],"propeller":true,"texture":[13,1.8,10,11,11.8,16.8],"angle":0}},"wings":{"join":{"doubleside":1,"offset":{"x":0,"y":-40,"z":-5},"length":[55,0],"width":[40,40,0],"angle":[-10,-10],"position":[0,-10,-10,0],"texture":[63],"bump":{"position":10,"size":20}},"join2":{"doubleside":1,"offset":{"x":0,"y":55,"z":0},"length":[55,0],"width":[40,40,0],"angle":[10,10],"position":[0,10,10,0],"texture":[63],"bump":{"position":10,"size":20}},"Downforce":{"doubleside":1,"offset":{"x":65,"y":60,"z":20},"length":[0,40,5,20,26,0],"width":[0,40,30,20,20,20,0],"angle":[100,120,120,150,180,180],"position":[0,0,27,35,45,45,46],"texture":[4,4,63,2,8],"bump":{"position":20,"size":10}}},"typespec":{"name":"Pioneer","level":4,"model":5,"code":405,"specs":{"shield":{"capacity":[175,245],"reload":[4,7]},"generator":{"capacity":[50,135],"reload":[25,45]},"ship":{"mass":270,"speed":[90,120],"rotation":[40,80],"acceleration":[50,100]}},"shape":[3.206,3.236,3.095,3.067,3.032,3.277,3.262,3.117,2.779,2.584,2.386,1.418,1.216,1.064,1.09,1.135,2.653,3.018,3.341,3.694,3.751,3.6,3.669,3.767,3.746,3.687,3.746,3.767,3.669,3.6,3.751,3.694,3.341,3.018,2.653,1.135,1.09,1.064,1.216,1.418,2.386,2.584,2.779,3.117,3.262,3.277,3.032,3.067,3.095,3.236],"lasers":[{"x":0.896,"y":-2.88,"z":0,"angle":0,"damage":[6,11],"rate":4,"type":1,"speed":[100,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.896,"y":-2.88,"z":0,"angle":0,"damage":[6,11],"rate":4,"type":1,"speed":[100,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.767}}',
                    '{"name":"Crusader","level":4,"model":6,"size":1.6,"specs":{"shield":{"capacity":[250,330],"reload":[5,7]},"generator":{"capacity":[50,125],"reload":[20,40]},"ship":{"mass":305,"speed":[75,100],"rotation":[40,70],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-85,-100,-95,-50,-25,-20,60,90,80],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,13,30,30,20,25,20,0],"height":[0,7,11,21,19,15,25,20,0],"texture":[12,63,10,2,63,63,12,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-70,"z":17},"position":{"x":[0,0,0,0,0],"y":[-35,-13,12,25,80],"z":[-9,-2,0,-2,0]},"width":[8,11,13,12,3],"height":[5,11,12,7,3],"texture":[9,9,9,4]},"main_propulsor":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0],"y":[50],"z":[0]},"width":[20],"height":[20],"propeller":true},"side_propulsors":{"section_segments":8,"offset":{"x":45,"y":0,"z":3},"position":{"x":[-35,-15,-10,0,0,0,0],"y":[-65,-30,0,35,60,50],"z":[0,0,0,0,0,0,0,0]},"width":[15,10,12,14,8,0],"height":[12,10,12,10,8,0],"texture":[63,63,63,63,17],"propeller":true},"side_propulsors2":{"section_segments":8,"offset":{"x":30,"y":-5,"z":-10},"position":{"x":[-30,-15,-10,0,0,0,0],"y":[-60,-30,0,35,60,50],"z":[0,0,0,0,0,0,0,0]},"width":[15,15,15,14,5,0],"height":[0,0,5,13,5,0],"texture":[63,63,63,63,17],"propeller":true},"lasers":{"section_segments":8,"offset":{"x":43,"y":-35,"z":2},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-5,30,70],"z":[0,0,0,0,0,0,0]},"width":[0,4,8,9,1],"height":[0,4,12,14,1],"texture":[17,2,63],"angle":1,"laser":{"damage":[2,5],"rate":3,"type":1,"speed":[130,160],"number":1,"error":0}},"lasers2":{"section_segments":8,"offset":{"x":60,"y":-5,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-30,-5,30,70],"z":[0,0,0,0,0,0,0]},"width":[0,4,8,9,1],"height":[0,4,12,14,1],"texture":[17,2,63],"angle":1,"laser":{"damage":[2,5],"rate":3,"type":1,"speed":[120,150],"number":1,"error":0}}},"wings":{"main":{"doubleside":1,"offset":{"x":0,"y":-40,"z":0},"length":[5,10,30,5,10,0],"width":[135,135,135,80,80,80,0],"angle":[0,0,0,0,0,0],"position":[15,15,10,35,45,60,60],"texture":[4,2,11,2,1,1],"bump":{"position":55,"size":20}},"mainn":{"doubleside":1,"offset":{"x":0,"y":-40,"z":0},"length":[5,10,30,5,10,0],"width":[135,135,135,80,80,80,0],"angle":[0,0,0,0,0,0],"position":[15,15,10,35,45,60,60],"texture":[4,2,11,2,1,1],"bump":{"position":-30,"size":11}},"main2":{"doubleside":1,"offset":{"x":0,"y":-39,"z":0},"length":[5,10,30,5,10,0],"width":[135,135,135,80,80,80,0],"angle":[0,0,0,0,0,0],"position":[15,15,10,35,45,60,60],"texture":[4],"bump":{"position":55,"size":20}},"outer":{"doubleside":1,"offset":{"x":60,"y":25,"z":0},"length":[2,31],"width":[80,110,50],"angle":[0,0,0,0,0,0],"position":[0,0,10],"texture":[63,18],"bump":{"position":49,"size":20}},"outer2":{"doubleside":1,"offset":{"x":60,"y":26,"z":0},"length":[2,30],"width":[80,110,50],"angle":[0,0,0,0,0,0],"position":[0,0,10],"texture":[1],"bump":{"position":49,"size":19}},"outer3":{"doubleside":1,"offset":{"x":60,"y":26,"z":0},"length":[2,30,20],"width":[80,110,50,30],"angle":[0,0,40,0,0,0,0],"position":[0,0,10,20],"texture":[63],"bump":{"position":49,"size":1}},"tail":{"doubleside":1,"offset":{"x":0,"y":90,"z":55},"length":[0,32,50,0],"width":[0,20,20,20,0],"angle":[0,0,-55,-55],"position":[0,0,0,-25,-25],"texture":[63],"bump":{"position":30,"size":15}}},"typespec":{"name":"Crusader","level":4,"model":6,"code":406,"specs":{"shield":{"capacity":[250,330],"reload":[5,7]},"generator":{"capacity":[50,125],"reload":[20,40]},"ship":{"mass":305,"speed":[75,100],"rotation":[40,70],"acceleration":[80,100]}},"shape":[3.848,3.853,3.233,2.691,2.462,2.559,2.395,2.182,2.321,2.318,2.347,2.501,2.718,2.999,3.434,3.693,3.917,3.95,3.473,3.344,3.274,3.205,3.35,3.36,3.257,3.206,3.257,3.36,3.35,3.205,3.274,3.344,3.473,3.95,3.917,3.693,3.434,2.999,2.728,2.501,2.347,2.318,2.321,2.182,2.395,2.559,2.462,2.691,3.233,3.853],"lasers":[{"x":1.359,"y":-2.08,"z":0.064,"angle":1,"damage":[2,5],"rate":3,"type":1,"speed":[130,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.359,"y":-2.08,"z":0.064,"angle":-1,"damage":[2,5],"rate":3,"type":1,"speed":[130,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.903,"y":-1.12,"z":0,"angle":1,"damage":[2,5],"rate":3,"type":1,"speed":[120,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.903,"y":-1.12,"z":0,"angle":-1,"damage":[2,5],"rate":3,"type":1,"speed":[120,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.95}}',
                ]
            },
            {
                TIER: 5,
                SHIPS: [
                    '{"name":"U-Sniper","level":5,"model":1,"size":1.8,"specs":{"shield":{"capacity":[200,300],"reload":[4,6]},"generator":{"capacity":[80,160],"reload":[40,55]},"ship":{"mass":220,"speed":[70,90],"rotation":[50,70],"acceleration":[70,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-12,-15,-10,40,50,90,105,100],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,12,23,23,15,11,0],"height":[0,5,6,23,23,11,10,0],"texture":[12,4,10,63,11,12,17],"propeller":true},"cockpit":{"section_segments":10,"offset":{"x":0,"y":0,"z":30},"position":{"x":[0,0,0,0,0,0],"y":[20,40,50,80],"z":[-4,0,0,-6]},"width":[5,10,10,5],"height":[0,8,8,0],"texture":[9,9,9]},"uwingsshell":{"section_segments":8,"offset":{"x":50,"y":-20,"z":-10},"position":{"x":[-7,-7,2,2,0,0,0,0],"y":[-80,-83,40,45,85,90,85],"z":[0,0,0,0,0,0,0,0]},"width":[10,10,23,23,20,18,0],"height":[0,10,23,23,20,18,0],"texture":[12,4,63,63,63,18]},"uwings":{"section_segments":8,"offset":{"x":49,"y":-20,"z":-10},"position":{"x":[-7,-7,2,2,0,0,0],"y":[-86,-90,40,45,80,95,100],"z":[0,0,0,0,0,0]},"width":[10,10,23,23,20,0],"height":[0,10,23,23,20,0],"texture":[12,2,3,18,63]},"cannons":{"section_segments":12,"offset":{"x":67,"y":-5,"z":-10},"position":{"x":[-3,-3,-3,-4,0,0,0,0,0],"y":[-60,-70,-20,0,20,45,55,65],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4,5,10,10,10,10,0],"height":[0,4,5,10,10,10,10,0],"angle":0.5,"laser":{"damage":[40,60],"rate":2,"type":2,"speed":[190,240],"recoil":200,"number":1,"error":0},"propeller":false,"texture":[17,4,63,11,63,4,63]},"side_propulsors":{"section_segments":12,"offset":{"x":28,"y":30,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-10,5,10,25,30,40,65,50],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,12,12,7,10,6,0],"height":[0,5,12,12,7,11,6,0],"propeller":true,"texture":[2,63,11,10,8,13,12]}},"wings":{"main":{"doubleside":1,"length":[25,0,55,0],"width":[40,40,50,15,0],"angle":[-30,-30,-5,-5],"position":[80,60,60,110,110],"texture":[11,63],"bump":{"position":30,"size":10},"offset":{"x":10,"y":-35,"z":5}},"font":{"doubleside":1,"length":[60,0],"width":[20,15,0],"angle":[-30,-30],"position":[10,-65,-65],"texture":[63],"bump":{"position":-30,"size":10},"offset":{"x":0,"y":15,"z":10}},"winglets2":{"doubleside":true,"offset":{"x":10,"y":80,"z":15},"length":[0,35],"width":[0,30,17],"angle":[70,70],"position":[0,0,15],"texture":63,"bump":{"position":30,"size":15}}},"typespec":{"name":"U-Sniper","level":5,"model":1,"code":501,"specs":{"shield":{"capacity":[200,300],"reload":[4,6]},"generator":{"capacity":[80,160],"reload":[40,55]},"ship":{"mass":220,"speed":[70,90],"rotation":[50,70],"acceleration":[70,110]}},"shape":[0.541,0.55,4.163,4.376,4.38,3.722,3.63,3.342,3.022,2.811,2.66,2.618,2.666,2.759,2.868,2.991,3.179,3.432,4.271,4.302,3.27,3.107,3.632,3.809,3.801,3.787,3.801,3.809,3.632,3.107,3.27,4.302,4.271,3.432,3.179,2.991,2.868,2.759,2.666,2.618,2.66,2.811,3.022,3.342,3.63,3.722,4.38,4.376,4.163,0.55],"lasers":[{"x":2.282,"y":-2.699,"z":-0.36,"angle":0.5,"damage":[40,60],"rate":2,"type":2,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":200},{"x":-2.282,"y":-2.699,"z":-0.36,"angle":-0.5,"damage":[40,60],"rate":2,"type":2,"speed":[190,240],"number":1,"spread":0,"error":0,"recoil":200}],"radius":4.38}}',
                    '{"name":"FuryStar","level":5,"model":2,"size":1.5,"specs":{"shield":{"capacity":[200,295],"reload":[6,8]},"generator":{"capacity":[100,160],"reload":[30,50]},"ship":{"mass":210,"speed":[70,105],"rotation":[120,180],"acceleration":[150,180]}},"bodies":{"main":{"section_segments":16,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-50,-45,0,10,15,35,55,40],"z":[0,0,0,0,0,0,0,0]},"width":[0,20,25,17,25,20,15,0],"height":[0,20,20,20,25,20,15,0],"texture":[1,4,63,4,2,12,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-11,-10,0,0,5],"z":[0,0,0,0,0,0,0,0]},"width":[0,13,16.5,18,19],"height":[0,13,16.5,18,19],"texture":[7,7,2,63],"propeller":false},"cockpit2":{"section_segments":6,"offset":{"x":0,"y":-50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-10,-12,-11.5,0],"z":[0,0,0,0,0,0]},"width":[10,10,13,17],"height":[10,10,13,17],"texture":[1.9],"propeller":false},"missiles":{"section_segments":12,"offset":{"x":23,"y":-20,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[-30,-23,0,25,30,31],"z":[0,0,0,0,0,0]},"width":[0,3,5,5,2,0],"height":[0,3,5,5,2,0],"texture":[6,4,4,63],"angle":0,"laser":{"damage":[1,2],"rate":6,"type":1,"speed":[100,155],"number":1,"error":0}},"cannon":{"section_segments":8,"offset":{"x":15,"y":-10,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-40,-60,-20,0,20,30],"z":[0,0,0,0,0,10]},"width":[0,4,6,8,5,0],"height":[0,4,6,8,5,0],"angle":0,"laser":{"damage":[14,24],"rate":2.2,"type":1,"speed":[200,260],"number":1,"error":0},"propeller":false,"texture":[17,3,10,3]},"top_propulsors":{"section_segments":12,"offset":{"x":50,"y":10,"z":40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-10,-15,0,5,20,25,30,40,45,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,10,15,15,15,10,10,15,15,10,0],"height":[0,10,10,15,15,15,10,10,15,15,10,0],"propeller":true,"texture":[63,13,4,63,2,4,63,8,4,63,17]},"bottom_propulsors":{"section_segments":12,"offset":{"x":87,"y":-60,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-25,-10,-15,0,5,20,25,30,40,45,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,10,15,15,15,10,10,15,15,10,0],"height":[0,10,10,15,15,15,10,10,15,15,10,0],"propeller":true,"texture":[63,13,4,63,2,4,63,8,63,4,17]}},"wings":{"rooftop":{"doubleside":true,"offset":{"x":0,"y":-20,"z":22},"length":[16,10,10,10,5],"width":[55,50,45,45,45,40],"angle":[0,-20,30,30,30],"position":[5,8,20,46,55,70],"texture":[8,63,3,3],"bump":{"position":-40,"size":5}},"bottom":{"doubleside":true,"offset":{"x":10,"y":-20,"z":0},"length":[30,20,30],"width":[65,45,45,45],"angle":[-35,-20,-30],"position":[10,0,-20,-15],"texture":[1,10,11],"bump":{"position":-40,"size":5}},"topwinglets":{"doubleside":true,"offset":{"x":55,"y":57,"z":45},"length":[20,0],"width":[40,20,0],"angle":[40,0],"position":[0,40,40],"texture":[63],"bump":{"position":10,"size":10}},"bottomwinglets":{"doubleside":true,"offset":{"x":90,"y":-20,"z":-35},"length":[30,0],"width":[50,20,0],"angle":[-50,0],"position":[0,40,40],"texture":[3],"bump":{"position":10,"size":10}}},"typespec":{"name":"FuryStar","level":5,"model":2,"code":502,"specs":{"shield":{"capacity":[200,295],"reload":[6,8]},"generator":{"capacity":[100,160],"reload":[30,50]},"ship":{"mass":210,"speed":[70,105],"rotation":[120,180],"acceleration":[150,180]}},"shape":[1.864,2.138,2.176,1.893,1.637,1.849,3.649,3.678,3.641,3.492,3.29,3.118,3.169,3.305,3.384,3.4,2.148,2.328,2.642,3.254,3.841,3.197,2.984,1.71,1.68,1.653,1.68,1.71,2.984,3.197,3.841,3.254,2.642,2.328,2.148,3.4,3.384,3.305,3.169,3.118,3.29,3.492,3.641,3.678,3.649,1.849,1.637,1.893,2.176,2.138],"lasers":[{"x":0.69,"y":-1.5,"z":-0.15,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[100,155],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.69,"y":-1.5,"z":-0.15,"angle":0,"damage":[1,2],"rate":6,"type":1,"speed":[100,155],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.45,"y":-2.1,"z":-0.45,"angle":0,"damage":[14,24],"rate":2.2,"type":1,"speed":[200,260],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.45,"y":-2.1,"z":-0.45,"angle":0,"damage":[14,24],"rate":2.2,"type":1,"speed":[200,260],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.841}}',
                    '{"name":"T-Warrior","level":5,"model":3,"size":1.6,"specs":{"shield":{"capacity":[225,335],"reload":[4,7]},"generator":{"capacity":[80,155],"reload":[35,56]},"ship":{"mass":260,"speed":[80,100],"rotation":[50,95],"acceleration":[90,120]}},"bodies":{"main":{"section_segments":16,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-90,-80,-65,-57,-15,15,25,60,91],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,13,19,21,23,23,23,20,15],"height":[0,2,9,14,15,20,21,21,20,15],"texture":[12,13,63,4,1,10,63,8,12]},"cannon":{"section_segments":8,"offset":{"x":0,"y":-55,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-40,-60,-20,10,20,30],"z":[0,0,0,0,0,10]},"width":[0,2,4,8,5,0],"height":[0,2,4,8,5,0],"angle":0,"laser":{"damage":[4,6],"rate":3.2,"type":1,"speed":[130,190],"number":5,"angle":19,"error":0},"propeller":false,"texture":[17,63,10,63]},"anus":{"section_segments":16,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0],"y":[80,93,95,60,60],"z":[0,0,0,0,0]},"width":[15,18,10,7,0],"height":[15,18,10,7,0],"texture":[63,63,17]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":11},"position":{"x":[0,0,0,0,0,0],"y":[-50,-50,-20,0,25],"z":[0,-1,0,0,0,0]},"width":[0,10,14,13,11],"height":[0,5,15,17,12],"texture":[9,9,9,63]},"top_propulsor":{"section_segments":12,"offset":{"x":0,"y":30,"z":65},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,45,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,20,20,10,0],"height":[0,15,20,20,20,15,15,20,20,10,0],"texture":[4,63,1,1,1,63,8,63,12,17],"propeller":true},"side_propulsors":{"section_segments":12,"offset":{"x":70,"y":20,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,45,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,20,20,20,15,15,20,20,10,0],"height":[0,15,20,20,20,15,15,20,20,10,0],"texture":[4,63,1,1,1,63,8,63,12,17],"propeller":true}},"wings":{"top_join":{"doubleside":1,"offset":{"x":0,"y":40,"z":0},"length":[0,44,30,0],"width":[0,70,40,30,0],"angle":[90,90,90,90],"position":[-35,-35,0,5,0],"texture":[1],"bump":{"position":-40,"size":8}},"side_joins":{"doubleside":1,"offset":{"x":0,"y":30,"z":0},"length":[44,30,0],"width":[70,40,30,10],"angle":[-15,-15,-15],"position":[-35,0,5,0],"texture":[10],"bump":{"position":40,"size":10}},"side_joins2":{"doubleside":1,"offset":{"x":0,"y":50,"z":70},"length":[0,60,55,0],"width":[0,30,30,10,0],"angle":[-60,-60,-40,-40],"position":[0,10,-10,-5,0],"texture":[63],"bump":{"position":40,"size":10}},"winglet1":{"doubleside":1,"offset":{"x":78,"y":80,"z":-20},"length":[0,10,15,0],"width":[0,25,25,10,0],"angle":[-20,-20,-20,-20],"position":[0,0,-5,6,0],"texture":[63],"bump":{"position":40,"size":10}},"winglet2":{"doubleside":1,"offset":{"x":8,"y":95,"z":60},"length":[0,10,15,0],"width":[0,25,25,10,0],"angle":[20,20,20,20],"position":[0,0,-5,6,0],"texture":[2],"bump":{"position":40,"size":10}}},"typespec":{"name":"T-Warrior","level":5,"model":3,"code":503,"specs":{"shield":{"capacity":[225,335],"reload":[4,7]},"generator":{"capacity":[80,155],"reload":[35,56]},"ship":{"mass":260,"speed":[80,100],"rotation":[50,95],"acceleration":[90,120]}},"shape":[3.681,3.453,2.921,2.224,1.683,1.362,1.155,1.007,0.91,0.87,0.916,0.988,1.075,2.804,2.973,3.097,3.152,3.553,4.362,4.178,4.352,4.169,3.267,3.539,3.853,3.848,3.853,3.539,3.267,4.169,4.352,4.178,4.362,3.553,3.152,3.097,2.973,2.804,2.24,0.988,0.916,0.87,0.91,1.007,1.155,1.362,1.683,2.224,2.921,3.453],"lasers":[{"x":0,"y":-3.68,"z":-0.48,"angle":0,"damage":[4,6],"rate":3.2,"type":1,"speed":[130,190],"number":5,"spread":19,"error":0,"recoil":0}],"radius":4.362}}',
                    '{"name":"Aetos","level":5,"model":4,"size":1.5,"specs":{"shield":{"capacity":[200,310],"reload":[5,8]},"generator":{"capacity":[80,170],"reload":[37,57]},"ship":{"mass":195,"speed":[90,120],"rotation":[70,93],"acceleration":[110,145]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-90,-50,0,10,13,85,88,120,100],"z":[-18,-17,-16,-10,0,0,0,0,0,0,0]},"width":[1,3,4.5,13,22,24,21,20,21,14,0],"height":[0,2,3,12,20,21,20,20,21,14,0],"texture":[4,63,10,10,3,4,11,63,12,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-5,-10,20,45,65],"z":[0,0,0,0,0]},"width":[0,11,13,12,12],"height":[0,5,12,13,5],"texture":[9,9,9,63]},"lasers":{"section_segments":8,"offset":{"x":73,"y":-5,"z":-34},"position":{"x":[0,0,0,0,0],"y":[-35,0,-15,10,50],"z":[0,0,0,0,0]},"width":[0,3,5,9,1],"height":[0,3,5,9,1],"texture":[6,6,11,2],"angle":2.5,"laser":{"damage":[6,10],"rate":7,"type":1,"speed":[130,235],"number":1,"angle":0,"error":0}}},"wings":{"top":{"doubleside":true,"offset":{"x":27,"y":40,"z":-40},"length":[40,0,60],"width":[5,60,60,5],"angle":[100,70,70],"position":[40,-20,-20,40],"texture":[63],"bump":{"position":50,"size":15}},"top2":{"doubleside":true,"offset":{"x":27,"y":41,"z":-40},"length":[40,0,60],"width":[5,60,60,5],"angle":[100,70,70],"position":[40,-20,-20,40],"texture":[1],"bump":{"position":50,"size":14}},"main":{"doubleside":true,"offset":{"x":19,"y":-5,"z":0},"length":[10,0,5,40,9,40,0],"width":[50,50,70,70,54,50,25,0],"angle":[-30,-30,-30,-30,-30,-50,-50],"position":[20,30,30,35,23,20,-10,-10],"texture":[1,3,63,8,3,63],"bump":{"position":-20,"size":6}}},"typespec":{"name":"Aetos","level":5,"model":4,"code":504,"specs":{"shield":{"capacity":[200,310],"reload":[5,8]},"generator":{"capacity":[80,170],"reload":[37,57]},"ship":{"mass":195,"speed":[90,120],"rotation":[70,93],"acceleration":[110,145]}},"shape":[4.2,3.499,2.398,1.815,1.479,1.276,0.975,0.849,2.457,2.449,3.115,3.11,3.048,2.958,2.765,2.642,2.622,2.653,2.372,2.263,2.198,2.785,2.66,2.633,2.436,2.405,2.436,2.633,2.66,2.785,2.198,2.263,2.372,2.653,2.622,2.642,2.765,2.958,3.048,3.11,3.115,2.449,2.457,0.849,0.975,1.276,1.479,1.815,2.398,3.499],"lasers":[{"x":2.144,"y":-1.199,"z":-1.02,"angle":2.5,"damage":[6,10],"rate":7,"type":1,"speed":[130,235],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.144,"y":-1.199,"z":-1.02,"angle":-2.5,"damage":[6,10],"rate":7,"type":1,"speed":[130,235],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.2}}',
                    '{"name":"Shadow X-2","level":5,"model":5,"size":1.15,"specs":{"shield":{"capacity":[150,220],"reload":[5,7]},"generator":{"capacity":[80,155],"reload":[19,48]},"ship":{"mass":130,"speed":[110,135],"rotation":[35,55],"acceleration":[140,160]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-85,-94,-90,-60,-50,-20,0,20,35,40,50,65,55],"z":[0,0,0,-5,-5,-5,0,0,0,0,0,0,0,0,0]},"width":[0,8,10,20,23,23,18,18,23,23,23,22,0],"height":[0,4,7,20,20,20,10,10,15,15,15,13,0],"texture":[12,2,63,3,4,4,8,3,63,4,13,5]},"back":{"section_segments":16,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,98,105,90],"z":[0,0,0,0,0]},"width":[18,19,20,19,0],"height":[8,9,10,10,0],"texture":[63,63,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-15,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-47,-45,-25,-5,15],"z":[0,0,0,4,2,0]},"width":[0,9,11,11,10],"height":[0,12,18,10,3],"texture":[9,9,9,63]},"laser":{"section_segments":12,"offset":{"x":45,"y":-5,"z":-13},"position":{"x":[0,0,0,2,2,2,0,0,1,-1,-1],"y":[-40,-21,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,13,13,13,10,10,15,10,0],"height":[0,7,8,13,13,13,10,10,15,5,0],"texture":[6,17,4,10,3,4,63,4,13,17],"propeller":true,"angle":0.9,"laser":{"damage":[4,6],"rate":8,"type":1,"speed":[160,200],"number":1}}},"wings":{"top":{"doubleside":true,"offset":{"x":10,"y":40,"z":5},"length":[0,30,0],"width":[50,50,30,0],"angle":[80,80,60],"position":[0,0,40,40],"texture":[3],"bump":{"position":-40,"size":10}},"side":{"doubleside":true,"offset":{"x":10,"y":40,"z":0},"length":[25,0],"width":[40,20,0],"angle":[-5,-5],"position":[0,50,50],"texture":[63],"bump":{"position":20,"size":10}},"front":{"doubleside":true,"offset":{"x":5,"y":-93,"z":-5},"length":[20,0],"width":[40,15,0],"angle":[5,0],"position":[0,40,40],"texture":[4],"bump":{"position":40,"size":10}},"wing":{"doubleside":1,"offset":{"x":10,"y":45,"z":-5},"length":[15,5,20,5,25,0],"width":[80,70,50,40,55,30,0],"angle":[10,10,10,10,40,40,40],"position":[-90,-75,-45,-25,-7,25,25],"texture":[4,4,4,4,4],"bump":{"position":-20,"size":6}},"wings":{"doubleside":1,"offset":{"x":10,"y":45,"z":-5},"length":[15,5,20,5,25,0],"width":[80,70,60,40,60,30,0],"angle":[10,10,10,10,40,40,40],"position":[-75,-55,-55,-25,-5,25,25],"texture":[4,4,4,4,4],"bump":{"position":40,"size":7}},"wings2":{"doubleside":1,"offset":{"x":10,"y":45,"z":-5},"length":[15,5,21,6,25],"width":[70,70,60,45,60,30],"angle":[10,10,10,10,40,40],"position":[-80,-55,-44,-14,-3,25],"texture":[3,3,3,3,63],"bump":{"position":40,"size":6}}},"typespec":{"name":"Shadow X-2","level":5,"model":5,"code":505,"specs":{"shield":{"capacity":[150,220],"reload":[5,7]},"generator":{"capacity":[80,155],"reload":[19,48]},"ship":{"mass":130,"speed":[110,135],"rotation":[35,55],"acceleration":[140,160]}},"shape":[2.602,2.483,1.958,1.654,1.399,1.174,1.453,1.43,1.394,1.388,1.362,1.374,1.385,1.395,1.428,1.53,1.768,2.138,2.376,2.614,2.327,1.772,2.436,2.215,2.213,1.728,2.213,2.215,2.436,1.772,2.327,2.614,2.376,2.138,1.768,1.53,1.428,1.395,1.385,1.374,1.362,1.388,1.394,1.43,1.453,1.174,1.399,1.654,1.958,2.483],"lasers":[{"x":1.021,"y":-1.035,"z":-0.299,"angle":0.9,"damage":[4,6],"rate":8,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.021,"y":-1.035,"z":-0.299,"angle":-0.9,"damage":[4,6],"rate":8,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.614}}',
                    '{"name":"Bat-Defender","level":5,"model":6,"size":1.8,"specs":{"shield":{"capacity":[300,400],"reload":[7,10]},"generator":{"capacity":[70,125],"reload":[25,47]},"ship":{"mass":360,"speed":[70,97],"rotation":[40,70],"acceleration":[90,100]}},"bodies":{"main":{"section_segments":16,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-99,-98,-95,-45,-40,-38,-32,-28,-18,-13,-2,15,20,25,55,53],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,11,30,27,20,21,27,27,24,25,25,27,27,15,15],"height":[0,4,6,25,23,20,22,25,25,23,25,25,27,27,17,0],"texture":[6,6,1,2,18,8,6,10,4,63,63,6,1,12,11]},"propulsors":{"section_segments":8,"offset":{"x":25,"y":-35,"z":8},"position":{"x":[-3,-3,-2,0,0,0,0,0,0,0,0,0],"y":[33,30,55,60,80,95,100,90,95],"z":[-5,-5,-5,-3,0,0,0,0]},"width":[0,10,14,14,10,14,12,0],"height":[0,8,14,14,10,13,12,0],"texture":[13,10,6,4,12,6,17],"propeller":true},"propulsors2":{"section_segments":8,"offset":{"x":15,"y":-38,"z":-12},"position":{"x":[-3,-3,-2,0,0,0,0,0,0,0,0,0],"y":[33,30,55,60,80,95,100,90,95],"z":[-5,-5,-5,-3,0,0,0,0]},"width":[0,10,12,12,8,12,10,0],"height":[0,8,14,14,10,12,10,0],"texture":[13,8,63,18,4,63,17],"propeller":true},"lasers":{"section_segments":8,"offset":{"x":65,"y":30,"z":8},"position":{"x":[0,0,0,2,1,-4,-4],"y":[-73,-50,-55,-35,-10,25,15],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,10,9,4,0],"height":[0,5,6,10,9,4,0],"texture":[6,6,11,18,63],"angle":2,"laser":{"damage":[5,8],"rate":3.5,"type":1,"speed":[150,200],"number":1,"error":0}},"lasers2":{"section_segments":8,"offset":{"x":42,"y":14,"z":-10},"position":{"x":[0,0,0,2,1,-4,-4],"y":[-73,-50,-55,-35,-10,25,15],"z":[0,0,0,0,0,0,0]},"width":[0,5,6,10,9,4,0],"height":[0,5,6,10,9,4,0],"texture":[6,6,11,18,63],"angle":1,"laser":{"damage":[5,8],"rate":3.5,"type":1,"speed":[150,200],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-45,-25,-2,5],"z":[-8,-8,0,0,0]},"width":[0,9,11,18,0],"height":[0,8,15,16,0],"texture":[9]}},"wings":{"wings":{"doubleside":true,"offset":{"x":20,"y":3,"z":0},"length":[20,10,15,18,17,0],"width":[120,75,70,70,60,50,0],"angle":[-10,20,20,-10,20,20,20],"position":[5,0,5,15,-12,-20,-20],"texture":[11,63,4,4,18],"bump":{"position":-20,"size":13}},"side":{"doubleside":true,"offset":{"x":97,"y":10,"z":-25},"length":[20,20,20],"width":[50,80,80,60],"angle":[80,110,130,90],"position":[10,-30,-30,10],"texture":[63],"bump":{"position":30,"size":10}},"winglets":{"doubleside":true,"length":[20],"width":[50,20],"angle":[-10,0],"position":[-30,-65,-65],"bump":{"position":0,"size":10},"texture":4,"offset":{"x":10,"y":-20,"z":0}},"winglets2":{"doubleside":true,"length":[50],"width":[30,10],"angle":[70,70],"position":[-10,15,-15],"bump":{"position":0,"size":6},"texture":1,"offset":{"x":15,"y":20,"z":10}}},"typespec":{"name":"Bat-Defender","level":5,"model":8,"code":508,"specs":{"shield":{"capacity":[300,400],"reload":[7,10]},"generator":{"capacity":[70,125],"reload":[25,47]},"ship":{"mass":360,"speed":[70,97],"rotation":[40,70],"acceleration":[90,100]}},"shape":[3.564,3.546,3.583,3.453,2.193,2.581,2.397,2.249,4.213,4.149,3.973,3.879,3.869,3.89,3.827,3.817,3.849,3.42,3.089,2.905,2.595,2.693,2.585,2.552,2.276,2.117,2.276,2.552,2.585,2.693,2.595,2.905,3.089,3.42,3.849,3.817,3.827,3.89,3.869,3.879,3.973,4.149,4.213,2.249,2.397,2.581,2.193,3.453,3.583,3.546],"lasers":[{"x":2.248,"y":-1.546,"z":0.288,"angle":2,"damage":[5,8],"rate":3.5,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.248,"y":-1.546,"z":0.288,"angle":-2,"damage":[5,8],"rate":3.5,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.466,"y":-2.124,"z":-0.36,"angle":1,"damage":[5,8],"rate":3.5,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.466,"y":-2.124,"z":-0.36,"angle":-1,"damage":[5,8],"rate":3.5,"type":1,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.213}}',

                ]
            },
            {
                TIER: 6,
                SHIPS: [
                    '{"name":"Advanced-Fighter","level":6,"model":1,"size":2,"specs":{"shield":{"capacity":[220,390],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":415,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-135,-110,-115,-70,-20,0,15,80,105,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,25,33,38,35,25,20,0],"height":[0,7,10,20,30,30,30,25,20,0],"propeller":true,"texture":[6,17,10,11,3,63,10,12,17],"laser":{"damage":[90,150],"rate":1,"type":2,"speed":[180,240],"number":1,"recoil":220,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-55,"z":23},"position":{"x":[0,0,0,0,0,0,0],"y":[-35,-20,10,30,50],"z":[-8,-5,0,0,0,0,0]},"width":[5,12,15,12,10],"height":[2,12,18,14,6],"propeller":false,"texture":[7,9,9,4]},"side_propellers":{"section_segments":12,"offset":{"x":30,"y":10,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-70,-80,-70,-25,-5,5,20,50,90,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,20,13,13,25,20,12,0],"height":[0,7,10,20,13,13,20,20,12,0],"angle":0,"propeller":true,"texture":[12,63,10.25,2,63,4,8,18,17]},"cannonbase":{"section_segments":12,"offset":{"x":80,"y":35,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-40,-40,-20,0,10,15,35,50,55],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,13,14,10,8,0],"height":[0,3,9,9,14,15,10,8,0],"angle":0,"propeller":false,"texture":[4,4,12,18,63,4,63]},"cannons2":{"section_segments":12,"offset":{"x":87,"y":30,"z":-25},"position":{"x":[0,0,0,0,0,0],"y":[-52,-50,-20,20,40],"z":[0,0,0,0,0,0]},"width":[0,2,5,5,2],"height":[0,2,10,10,2],"angle":0,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}},"cannons3":{"section_segments":12,"offset":{"x":73,"y":30,"z":-25},"position":{"x":[0,0,0,0,0,0],"y":[-52,-50,-20,20,40],"z":[0,0,0,0,0,0]},"width":[0,2,5,5,2],"height":[0,2,10,10,2],"angle":0,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}}},"wings":{"main":{"length":[86,35,15],"width":[130,70,40,30],"angle":[-20,30,15],"position":[10,73,45,55],"bump":{"position":-20,"size":5},"offset":{"x":0,"y":-23,"z":0},"texture":[11,11,63],"doubleside":true},"mainb":{"length":[86,35,15],"width":[130,70,40,30],"angle":[-20,30,15],"position":[10,73,45,70],"bump":{"position":-30,"size":4},"offset":{"x":0,"y":-20,"z":0},"texture":[3,3,13],"doubleside":true},"main2":{"length":[18,3,0],"width":[85,70,65,0],"angle":[-20,-20,-20],"position":[35,75,77,55],"bump":{"position":-40,"size":2},"offset":{"x":42,"y":5,"z":-14},"texture":[12],"doubleside":true},"main3":{"length":[18,3,0],"width":[70,50,45,0],"angle":[30,30,30],"position":[45,75,77,55],"bump":{"position":-40,"size":4},"offset":{"x":80,"y":0,"z":-29},"texture":[13],"doubleside":true},"winglets":{"doubleside":1,"length":[40],"width":[40,20,30],"angle":[-10,-10],"position":[-50,-70,-65],"bump":{"position":0,"size":20},"texture":63,"offset":{"x":0,"y":-45,"z":-5}},"winglets2":{"doubleside":1,"length":[45],"width":[45,10,30],"angle":[60,60],"position":[0,5,20],"bump":{"position":20,"size":20},"texture":63,"offset":{"x":15,"y":46,"z":15}}},"typespec":{"name":"Advanced-Fighter","level":6,"model":1,"code":601,"specs":{"shield":{"capacity":[220,390],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":415,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"shape":[6.2,5.433,5.242,5.098,3.167,2.938,2.631,2.414,2.265,2.166,3.105,3.649,3.639,5.012,5.185,5.404,5.657,4.88,5.393,5.592,4.601,5.203,4.338,4.205,4.072,3.407,4.072,4.205,4.338,5.203,4.601,5.592,5.393,4.88,5.657,5.404,5.185,5.012,3.639,3.649,3.105,2.166,2.265,2.414,2.631,2.938,3.167,5.098,5.242,5.433],"lasers":[{"x":0,"y":-6.2,"z":0,"angle":0,"damage":[90,150],"rate":1,"type":2,"speed":[180,240],"number":1,"spread":0,"error":0,"recoil":220},{"x":3.48,"y":-0.88,"z":-1,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.48,"y":-0.88,"z":-1,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.92,"y":-0.88,"z":-1,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.92,"y":-0.88,"z":-1,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.2}}',
                    '{"name":"Scorpion","level":6,"model":2,"size":2,"specs":{"shield":{"capacity":[245,405],"reload":[5,7]},"generator":{"capacity":[80,175],"reload":[38,53]},"ship":{"mass":440,"speed":[75,95],"rotation":[50,70],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-95,-40,-30,0,50,100,120,110],"z":[-10,-5,0,0,0,0,20,20]},"width":[0,15,25,17,25,10,5],"height":[0,10,15,25,15,10,5],"texture":[1,4,63,11,11,4],"propeller":false},"tail":{"section_segments":12,"offset":{"x":0,"y":70,"z":50},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-60,-23,-25,-18,-20,-12,-8,20,40,50,50],"z":[0,0,0,0,0,0,0,0,-10,-20,-20]},"width":[0,5,10,15,22,26,35,25,8,5,0],"height":[0,5,10,15,20,22,25,20,8,5,0],"texture":[6,17,63,18,3,4,63,10,4,4],"laser":{"damage":[50,100],"rate":0.95,"type":2,"speed":[170,230],"number":1,"angle":0,"error":0,"recoil":150}},"eyes":{"section_segments":8,"offset":{"x":16,"y":-44,"z":12},"position":{"x":[-5,0,0,0,0],"y":[-15,-5,2,9,18],"z":[0,0,0,1,0]},"width":[0,8,10,8,0],"height":[0,5,5,5,0],"texture":[6,4],"propeller":false},"deco":{"section_segments":8,"offset":{"x":70,"y":10,"z":-10},"position":{"x":[-10,-8,-10,10,-5,-3,0,0,0,0],"y":[-140,-100,-120,-70,-35,-25,-10,20,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,17,17,22,13,0],"height":[0,5,10,20,25,30,25,13,0],"texture":[6,17,1,1,10,11,2,12],"laser":{"damage":[2,3],"rate":1.8,"type":1,"speed":[130,170],"number":2,"angle":5,"error":0},"propeller":true},"decoshell":{"section_segments":8,"offset":{"x":71,"y":10,"z":-10},"position":{"x":[-11,-8,-10,10,-5,-3,0,0,0,0],"y":[-140,-100,-120,-70,-35,-25,-10,20,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,17,17,22,13,0],"height":[0,5,10,20,25,30,25,13,0],"texture":[6,17,4,4,8,18,13,12],"propeller":0},"wingends":{"section_segments":8,"offset":{"x":105,"y":-20,"z":-10},"position":{"x":[0,0,2,4,2,0,0],"y":[-20,-20,-10,0,10,20,20],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,3,6,3,2,0],"height":[0,8,12,15,12,8,0],"texture":4,"angle":0,"propeller":false}},"wings":{"main":{"doubleside":1,"length":[0,80,0,35,0],"width":[0,40,30,30,20,0],"angle":[0,-20,20,20,20],"position":[30,30,-20,-40,-15,-15],"texture":63,"bump":{"position":-30,"size":15},"offset":{"x":0,"y":0,"z":10}},"font":{"doubleside":1,"length":[80,0],"width":[20,15,0],"angle":[-20,0],"position":[-20,-40,-40],"texture":4,"bump":{"position":30,"size":20},"offset":{"x":0,"y":0,"z":10}},"stab1":{"doubleside":1,"length":[0,25,0],"width":[0,10,30,0],"angle":[0,0,0],"position":[-10,-10,-30,-40],"texture":3,"bump":{"position":30,"size":20},"offset":{"x":40,"y":-60,"z":-10}},"stab2":{"doubleside":1,"length":[0,25,0],"width":[0,30,10,0],"angle":[-30,-30,0],"position":[-10,-10,-35,-35],"texture":3,"bump":{"position":30,"size":20},"offset":{"x":20,"y":75,"z":45}},"stab3":{"doubleside":1,"length":[0,25,0],"width":[0,30,10,0],"angle":[90,90,0],"position":[-10,-10,-35,-35],"texture":3,"bump":{"position":-20,"size":20},"offset":{"x":0,"y":75,"z":60}}},"typespec":{"name":"Scorpion","level":6,"model":2,"code":602,"specs":{"shield":{"capacity":[245,405],"reload":[5,7]},"generator":{"capacity":[80,175],"reload":[38,53]},"ship":{"mass":440,"speed":[75,95],"rotation":[50,70],"acceleration":[80,100]}},"shape":[3.8,3.08,2.395,5.727,5.661,5.237,4.976,4.805,4.716,4.462,4.574,4.669,4.517,4.28,3.612,3.568,3.257,1.767,2.285,2.491,2.621,3.051,3.516,3.967,4.525,4.804,4.525,3.967,3.516,3.051,2.621,2.491,2.285,1.767,3.257,3.568,3.612,3.716,4.517,4.669,4.574,4.462,4.716,4.805,4.976,5.237,5.661,5.727,2.395,3.08],"lasers":[{"x":0,"y":0.4,"z":2,"angle":0,"damage":[50,100],"rate":0.95,"type":2,"speed":[170,230],"number":1,"spread":0,"error":0,"recoil":150},{"x":2.4,"y":-5.2,"z":-0.4,"angle":0,"damage":[2,3],"rate":1.8,"type":1,"speed":[130,170],"number":2,"spread":5,"error":0,"recoil":0},{"x":-2.4,"y":-5.2,"z":-0.4,"angle":0,"damage":[2,3],"rate":1.8,"type":1,"speed":[130,170],"number":2,"spread":5,"error":0,"recoil":0}],"radius":5.727}}',
                    '{"name":"H-Mercury","level":6,"model":3,"size":2.1,"specs":{"shield":{"capacity":[260,425],"reload":[6,9]},"generator":{"capacity":[100,170],"reload":[45,65]},"ship":{"mass":435,"speed":[75,100],"rotation":[50,60],"acceleration":[55,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-70,-60,-55,-40,-5,0,35,45,70,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,12,15,21,20,22,23,17,14,0],"height":[0,5,10,13,15,20,20,20,20,15,14,0],"texture":[17,13,63,10,63,4,11,8,63,13,17],"propeller":true,"laser":{"damage":[8,16],"rate":10,"type":1,"speed":[180,260],"number":1,"error":0,"recoil":35}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-35,"z":13},"position":{"x":[0,0,0,0,0,0,0],"y":[-25,-5,15,20,75],"z":[-4,0,0,0,0]},"width":[7,10,12,13,8],"height":[4,10,13,12,5],"texture":[9,9,4,18],"propeller":false},"arms":{"section_segments":8,"offset":{"x":60,"y":-5,"z":0},"position":{"x":[-9,-9,-9,-10,-4,-5,10,-5,-6,-19,-17,-17],"y":[-100,-80,-90,-50,-25,-20,10,35,40,65,100,85],"z":[-25,-25,-25,-30,-30,-30,-20,-10,-6,0,0,0,0,0,0]},"width":[0,5,8,15,16,15,15,18,15,17,12,0],"height":[0,5,10,25,25,20,20,20,20,15,12,0],"texture":[6,17,3,4,63,13,8,63,4,3,17],"angle":1,"propeller":true,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,220],"number":1,"error":0}},"canon":{"section_segments":12,"offset":{"x":90,"y":-18,"z":-27},"position":{"x":[-9,-9,-6,5,3,6,6],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,4,5,9,3,5,0],"height":[0,4,10,10,3,5,0],"angle":2,"laser":{"damage":[6,8],"rate":1,"type":1,"speed":[160,230],"number":1,"error":0},"propeller":false,"texture":[6,4,10,4,63,63]}},"wings":{"main":{"doubleside":1,"offset":{"x":0,"y":-15,"z":10},"length":[65,0],"width":[50,30,0],"angle":[-25,-25],"position":[5,35,35],"texture":[11],"bump":{"position":-20,"size":10}},"font":{"doubleside":1,"length":[60,0],"width":[25,15,0],"angle":[-30,-30],"position":[-20,-40,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":-10,"z":10}},"bac":{"doubleside":1,"offset":{"x":0,"y":40,"z":10},"length":[50,0],"width":[20,15,0],"angle":[-10,-10],"position":[-10,23,23],"texture":[63],"bump":{"position":30,"size":10}},"out":{"doubleside":1,"length":[35,0],"width":[35,20,0],"angle":[-20,-20],"position":[-20,-50,-50],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":60,"y":30,"z":-15}},"inside":{"doubleside":1,"length":[-25,0],"width":[30,10,0],"angle":[-20,-20],"position":[-10,5,5],"texture":[63],"bump":{"position":30,"size":-10},"offset":{"x":50,"y":-70,"z":-30}},"inside2":{"doubleside":1,"length":[35,0],"width":[20,10,0],"angle":[60,60],"position":[-10,0,0],"texture":[3],"bump":{"position":30,"size":10},"offset":{"x":10,"y":70,"z":10}}},"typespec":{"name":"H-Mercury","level":6,"model":3,"code":603,"specs":{"shield":{"capacity":[260,425],"reload":[6,9]},"generator":{"capacity":[100,170],"reload":[45,65]},"ship":{"mass":435,"speed":[75,100],"rotation":[50,60],"acceleration":[55,100]}},"shape":[3.576,3.548,2.84,4.865,4.858,4.546,4.011,4.386,4.349,4.141,4.271,4.436,4.316,4.313,4.295,3.384,3.336,3.354,3.484,3.847,4.47,4.65,4.423,3.267,3.204,3.156,3.204,3.267,4.423,4.65,4.47,3.847,3.484,3.354,3.336,3.384,4.295,4.313,4.316,4.436,4.271,4.141,4.349,4.386,4.011,4.546,4.858,4.865,2.84,3.548],"lasers":[{"x":0,"y":-3.57,"z":0,"angle":0,"damage":[8,16],"rate":10,"type":1,"speed":[180,260],"number":1,"spread":0,"error":0,"recoil":35},{"x":2.069,"y":-4.403,"z":0,"angle":1,"damage":[3,5],"rate":4,"type":1,"speed":[150,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.069,"y":-4.403,"z":0,"angle":-1,"damage":[3,5],"rate":4,"type":1,"speed":[150,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.329,"y":-2.842,"z":-1.134,"angle":2,"damage":[6,8],"rate":1,"type":1,"speed":[160,230],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.329,"y":-2.842,"z":-1.134,"angle":-2,"damage":[6,8],"rate":1,"type":1,"speed":[160,230],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.865}}',
                    '{"name":"Marauder","level":6,"model":4,"size":1.2,"specs":{"shield":{"capacity":[210,320],"reload":[8,10]},"generator":{"capacity":[85,160],"reload":[25,43]},"ship":{"mass":185,"speed":[70,115],"rotation":[60,80],"acceleration":[80,120]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-75,-80,-60,-50,-30,0,30,60,80,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6,16,20,25,30,25,25,25,22,0],"height":[0,5,10,12,12,12,20,15,15,15,0],"texture":[6,4,63,2,10,1,1,11,12,17],"propeller":true,"laser":{"damage":[10,16],"rate":10,"type":1,"speed":[170,240],"recoil":0,"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-85,"z":22},"position":{"x":[0,0,0,0,0,0],"y":[15,45,70,95,125],"z":[-1,-2,-1,-1,0]},"width":[5,12,13,13,5],"height":[1,12,15,15,4],"texture":[8.98,8.98,18,4]},"outriggers":{"section_segments":10,"offset":{"x":25,"y":0,"z":-5},"position":{"x":[-5,-5,6,-5,0,2,2,0,0,0],"y":[-130,-135,-55,-10,30,40,70,80,100,90],"z":[10,10,5,5,0,0,0,0,0,0,0,0]},"width":[0,6,10,15,18,20,20,18,10,0],"height":[0,10,20,20,20,20,20,20,20,0],"texture":[13,4,18,63,4,18,4,13,17],"laser":{"damage":[3,5],"rate":5,"type":1,"speed":[160,230],"recoil":0,"number":1,"error":0},"propeller":true},"intake":{"section_segments":12,"offset":{"x":25,"y":-5,"z":20},"position":{"x":[1,-1,6,-3,-3,0,0,0,0,0],"y":[-20,-30,0,35,60,70,85,100,95],"z":[0,-6,0,0,0,0,0,0,0,0]},"width":[8,9,12,10,15,10,10,5,0],"height":[0,15,15,20,20,15,15,5,0],"texture":[12,8,63,4,63,18,4,17]}},"wings":{"main":{"length":[22,35,35],"width":[60,60,40,15],"angle":[0,-20,20],"position":[40,30,65,20],"texture":[13,18,63],"doubleside":true,"bump":{"position":30,"size":15},"offset":{"x":20,"y":0,"z":0}},"spoiler":{"length":[20,45,0,5],"width":[40,40,20,50,0],"angle":[0,20,90,90],"position":[60,60,90,85,90],"texture":[10,11,63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":0,"y":-15,"z":40}},"font":{"length":[40],"width":[40,10],"angle":[-10],"position":[0,-50],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":35,"y":-30,"z":5}},"ont":{"length":[19],"width":[30,10],"angle":[-10],"position":[0,-25],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10},"offset":{"x":30,"y":-80,"z":5}},"shields":{"doubleside":true,"offset":{"x":12,"y":40,"z":-5},"length":[0,15,45,20],"width":[30,30,65,65,50,50],"angle":[30,30,90,150],"position":[10,10,0,0,10],"texture":[8],"bump":{"position":0,"size":4}}},"typespec":{"name":"Marauder","level":6,"model":4,"code":604,"specs":{"shield":{"capacity":[210,320],"reload":[8,10]},"generator":{"capacity":[85,160],"reload":[25,43]},"ship":{"mass":185,"speed":[70,115],"rotation":[60,80],"acceleration":[80,120]}},"shape":[2.404,3.298,3.28,2.887,2.745,2.21,2.711,2.2,1.527,1.184,1.019,1.036,1.039,2.607,2.67,2.665,2.598,2.588,2.644,2.719,2.726,2.26,2.539,2.523,2.443,1.683,2.443,2.523,2.539,2.26,2.726,2.719,2.644,2.588,2.598,2.665,2.67,2.607,1.039,1.036,1.019,1.184,1.527,2.2,2.711,2.21,2.745,2.887,3.28,3.298],"lasers":[{"x":0,"y":-2.4,"z":0.24,"angle":0,"damage":[10,16],"rate":10,"type":1,"speed":[170,240],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.48,"y":-3.24,"z":-0.12,"angle":0,"damage":[3,5],"rate":5,"type":1,"speed":[160,230],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.48,"y":-3.24,"z":-0.12,"angle":0,"damage":[3,5],"rate":5,"type":1,"speed":[160,230],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.298}}',
                    '{"name":"A-Speedster","level":6,"model":5,"size":1.5,"specs":{"shield":{"capacity":[200,300],"reload":[6,8]},"generator":{"capacity":[80,140],"reload":[30,45]},"ship":{"mass":175,"speed":[90,120],"rotation":[60,80],"acceleration":[90,140]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-110,-95,-100,-95,-10,0,2,10,13,30,55,65,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,9,11,38,36,29,27,21,20,21,23,20,0],"height":[0,5,5,7,33,30,29,27,21,20,21,23,20,0],"texture":[6,17,4,11,8,4,63,4,18,4,3,13,17],"propeller":true,"laser":{"damage":[38,84],"rate":1,"type":2,"speed":[175,210],"recoil":50,"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":16},"position":{"x":[0,0,0,0,0,0,0],"y":[-17,0,20,45,50],"z":[-7,-5,0,0,0]},"width":[6,10,12,12,0],"height":[2,10,15,12,0],"texture":[9]},"side_propulsors":{"section_segments":12,"offset":{"x":45,"y":26,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-10,-15,0,10,20,25,30,40,45,85,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,12,15,20,20,20,15,15,20,20,11,0],"height":[0,12,15,20,20,20,15,15,20,20,11,0],"propeller":true,"texture":[63,13,4,63,2,4,63,8,4,13,17]},"cannons":{"section_segments":12,"offset":{"x":25,"y":50,"z":45},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,4,7,10,3,5,0],"height":[0,4,7,8,3,5,0],"angle":-6,"laser":{"damage":[8,12],"rate":2,"type":1,"speed":[100,130],"number":1,"angle":-10,"error":0},"propeller":false,"texture":[6,4,10,18,63,4]}},"wings":{"join":{"doubleside":1,"offset":{"x":0,"y":0,"z":0},"length":[40,10,34],"width":[30,30,50,15],"angle":[0,0,0],"position":[-20,35,35,105],"texture":[63],"bump":{"position":20,"size":15}},"winglets2":{"offset":{"x":50,"y":-40,"z":10},"doubleside":true,"length":[0,40,35],"width":[0,10,15,15],"angle":[120,120,180],"position":[95,95,95,95],"texture":[63],"bump":{"position":40,"size":20}}},"typespec":{"name":"A-Speedster","level":6,"model":5,"code":605,"specs":{"shield":{"capacity":[200,300],"reload":[6,8]},"generator":{"capacity":[80,140],"reload":[30,45]},"ship":{"mass":175,"speed":[90,120],"rotation":[60,80],"acceleration":[90,140]}},"shape":[3.3,3.012,2.461,2.008,1.718,1.535,1.392,1.302,1.234,1.196,1.18,1.175,1.418,1.549,1.908,2.091,2.225,2.389,2.976,3.95,4.212,3.73,3.68,3.501,2.748,2.705,2.748,3.501,3.68,3.73,4.212,3.95,2.976,2.389,2.225,2.091,1.908,1.549,1.422,1.175,1.18,1.196,1.234,1.302,1.392,1.535,1.718,2.008,2.461,3.012],"lasers":[{"x":0,"y":-3.3,"z":0,"angle":0,"damage":[38,84],"rate":1,"type":2,"speed":[175,210],"number":1,"spread":0,"error":0,"recoil":50},{"x":0.907,"y":0.008,"z":1.35,"angle":-6,"damage":[8,12],"rate":2,"type":1,"speed":[100,130],"number":1,"spread":-10,"error":0,"recoil":0},{"x":-0.907,"y":0.008,"z":1.35,"angle":6,"damage":[8,12],"rate":2,"type":1,"speed":[100,130],"number":1,"spread":-10,"error":0,"recoil":0}],"radius":4.212}}',
                    '{"name":"Condor","level":6,"model":6,"size":1.35,"specs":{"shield":{"capacity":[225,380],"reload":[6,9]},"generator":{"capacity":[70,130],"reload":[30,45]},"ship":{"mass":200,"speed":[75,110],"rotation":[50,70],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":16,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-115,-95,-105,-100,-43,-40,-25,-22,16,17,30,50,52,60,62,71,90,80,90],"z":[-5,-5,-5,-5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,8,10,25,28,28,25,25,27,32,33,30,30,33,29,23,10,0],"height":[0,5,8,10,25,28,28,25,25,27,32,33,30,30,33,29,23,10,0],"texture":[6,17,4,10,4,63,4,2,4,63,4,63,8,63,18,13,17,6],"propeller":true,"laser":{"damage":[30,60],"rate":2,"type":2,"speed":[150,200],"number":1,"angle":0,"error":0}},"cannons":{"section_segments":12,"offset":{"x":55,"y":30,"z":-13},"position":{"x":[-6,-6,-4,0,0,0,0,-2,-2,-2,-2,0],"y":[-55,-50,-25,-7,-3,4,10,20,30,45,50],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,12,12,10,10,12,12,15,10,0],"height":[0,7,15,15,13,13,15,15,15,10,0],"angle":0,"laser":{"damage":[3,6],"rate":4,"type":1,"speed":[100,130],"number":1,"angle":0,"error":0},"propeller":false,"texture":[6,13,3,63,8,63,4,18,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-60,"z":10},"position":{"x":[0,0,0,0],"y":[-25,-8,20,65],"z":[-1,1,9,5]},"width":[5,9,12,10],"height":[1,12,15,10],"texture":[9,9,8]}},"wings":{"back":{"offset":{"x":0,"y":25,"z":15},"length":[70,0,40,0],"width":[70,50,50,30,0],"angle":[-30,-40,40,40],"position":[0,20,20,30,30],"texture":[11,63],"doubleside":true,"bump":{"position":30,"size":15}},"front":{"offset":{"x":0,"y":55,"z":15},"length":[70,40,0],"width":[70,50,30,0],"angle":[-30,-40,-40],"position":[-60,-20,-40,-40],"texture":[11,63],"doubleside":true,"bump":{"position":25,"size":10}},"winglet":{"length":[0,15,7],"width":[0,30,20,20],"angle":[50,50,50],"position":[0,0,3,8],"doubleside":true,"offset":{"x":15,"y":75,"z":15},"bump":{"position":30,"size":10},"texture":[11,63]},"winglet2":{"length":[0,20],"width":[0,40,17],"angle":[0,0],"position":[0,13,-10],"doubleside":true,"offset":{"x":10,"y":-70,"z":0},"bump":{"position":30,"size":10},"texture":[11,63]}},"typespec":{"name":"Condor","level":6,"model":6,"code":606,"specs":{"shield":{"capacity":[225,380],"reload":[6,9]},"generator":{"capacity":[70,130],"reload":[30,45]},"ship":{"mass":200,"speed":[75,110],"rotation":[50,70],"acceleration":[80,110]}},"shape":[3.105,2.843,2.486,2.523,1.472,1.33,1.183,1.035,0.897,1.539,1.561,1.592,1.65,2.51,2.588,2.594,2.851,3.09,3.105,2.758,2.64,2.505,2.544,2.631,2.474,2.435,2.474,2.631,2.544,2.505,2.64,2.758,3.105,3.09,2.851,2.594,2.588,2.51,2.464,1.592,1.561,1.539,0.897,1.035,1.183,1.33,1.472,2.523,2.486,2.843],"lasers":[{"x":0,"y":-3.105,"z":0,"angle":0,"damage":[30,60],"rate":2,"type":2,"speed":[150,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.323,"y":-0.675,"z":-0.351,"angle":0,"damage":[3,6],"rate":4,"type":1,"speed":[100,130],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.323,"y":-0.675,"z":-0.351,"angle":0,"damage":[3,6],"rate":4,"type":1,"speed":[100,130],"number":1,"spread":0,"error":0,"recoil":0}],"radius":3.105}}',
                    '{"name":"Rock-Tower","level":6,"model":7,"size":2.1,"specs":{"shield":{"capacity":[300,500],"reload":[8,10]},"generator":{"capacity":[75,130],"reload":[35,59]},"ship":{"mass":500,"speed":[75,112],"rotation":[50,70],"acceleration":[70,85]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-75,-23,-25,-20,40,50,70,85,80],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,12,26,27,30,30,25,20,0],"height":[9,15,15,15,25,25,23,20,0],"texture":[15.1,11,63,11,63,8,12,17],"propeller":true},"bonk":{"section_segments":6,"offset":{"x":0,"y":-7,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-87,-90,-85,-70,-65,-62,-63],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,36,38,41,45,44,35,0],"height":[0,8,10,12,15,12,10,0],"texture":[18,63,63,11,63,4,18],"propeller":0},"cockpit":{"section_segments":8,"offset":{"x":0,"y":20,"z":14},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,30,30],"z":[0,-5,0,0,2,0]},"width":[0,10,13,13,10,5],"height":[0,10,15,15,10,5],"texture":9,"propeller":false},"Headlights":{"section_segments":6,"offset":{"x":23,"y":-79,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-18,-20,-20,10,15,16],"z":[0,0,0,0,0,0]},"width":[0,4,5,8,5,0],"height":[0,4,5,6,5,0],"texture":[17,6,6,63,63],"angle":1,"laser":{"damage":[4,6],"rate":9,"type":1,"speed":[150,250],"number":1,"error":5}},"propulsors":{"section_segments":8,"offset":{"x":30,"y":50,"z":-5},"position":{"x":[0,0,0,2,5,0,0,-4,-4,0],"y":[-56,-60,-55,-25,0,15,25,50,45],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[9,9,10,14,15,15,14,10,0],"height":[0,13,15,20,25,20,20,15,0],"texture":[12,63,10,2,4,8,12,17],"angle":0,"propeller":true}},"wings":{"main":{"length":[23,0,5,0,20],"width":[60,45,40,40,70,40],"angle":[0,0,0,30,30],"position":[30,43,43,43,33,13,30],"texture":[3,5,63,5,8],"doubleside":true,"offset":{"x":25,"y":30,"z":-5},"bump":{"position":30,"size":5}},"bonkwing":{"length":[20,0],"width":[20,10,0],"angle":[-50,-50],"position":[-42,-30,-30],"texture":63,"doubleside":true,"offset":{"x":35,"y":-40,"z":-5},"bump":{"position":30,"size":10}},"spoilers":{"length":[0,20,30],"width":[0,40,30,20],"angle":[70,70,160],"position":[-42,-42,-30,-25],"texture":[63,63,11],"doubleside":true,"offset":{"x":30,"y":105,"z":10},"bump":{"position":30,"size":5}}},"typespec":{"name":"Rock-Tower","level":6,"model":7,"code":607,"specs":{"shield":{"capacity":[300,500],"reload":[8,10]},"generator":{"capacity":[75,130],"reload":[35,59]},"ship":{"mass":500,"speed":[75,112],"rotation":[50,70],"acceleration":[70,85]}},"shape":[4.082,4.23,4.313,4.302,3.956,3.74,1.515,1.503,1.397,1.299,1.689,1.693,1.72,1.779,1.87,3.176,3.369,3.648,3.988,4.182,4.464,4.679,4.464,4.415,4.276,3.577,4.276,4.415,4.464,4.679,4.464,4.182,3.988,3.648,3.369,3.176,1.87,1.779,1.72,1.693,1.689,1.299,1.397,1.503,1.515,3.74,3.956,4.302,4.313,4.23],"lasers":[{"x":0.951,"y":-4.158,"z":0,"angle":1,"damage":[4,6],"rate":9,"type":1,"speed":[150,250],"number":1,"spread":0,"error":5,"recoil":0},{"x":-0.951,"y":-4.158,"z":0,"angle":-1,"damage":[4,6],"rate":9,"type":1,"speed":[150,250],"number":1,"spread":0,"error":5,"recoil":0}],"radius":4.679}}',
                    '{"name":"Barracuda","level":6,"model":8,"size":2.4,"specs":{"shield":{"capacity":[300,530],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[10,20]},"ship":{"mass":580,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"bodies":{"body":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-60,-53,0,5,20,45,55,80,100,91,115],"z":[0,0,0,0,5,5,5,5,5,0,0,0]},"width":[15,17,20,27,31,35,36,36,35,25,15,0],"height":[13,13,20,25,30,35,35,35,30,25,15,0],"texture":[15.1,63,11,63,8,12,63,13,63,17,6],"propeller":0},"propulsor":{"section_segments":8,"offset":{"x":0,"y":105,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-20,-10],"z":[0,0,0,0,0,0]},"width":[2,20],"height":[5,20],"texture":[4,4,4,4,6],"propeller":1,"angle":0},"front":{"section_segments":10,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-92,-88,-90,-85,-70,-65,-67,-62,-62],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,35,38,40,43,40,29,25,0],"height":[0,13,15,18,20,18,15,15,0],"texture":[11,63,63,3,4,18,63,4],"propeller":0},"propeller":{"section_segments":12,"offset":{"x":38,"y":40,"z":5},"position":{"x":[-3,-3,-3,0,0,0,0,0,0,0,0],"y":[-18,-20,-18,-5,10,20,25,30,45,70,60],"z":[5,5,5,5,5,5,0,0,5,0,0]},"width":[10,10,12,16,19,19,13,13,20,15,0],"height":[0,13,15,20,20,20,15,15,20,15,0],"texture":[12,63,18,10,3,8,63,4,63,17],"propeller":true},"sides":{"section_segments":6,"angle":90,"offset":{"x":-1,"y":-20,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-70,-67,-68,-55,-50,-50,-27,-25,-10],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,28,30,35,30,10,11,13,13],"height":[0,13,15,18,15,8,11,13,13],"texture":[18,63,63,11,18,15.1,4,63]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":13},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-30,0,20,30,50],"z":[0,0,4,5,5,0]},"width":[0,10,12,12,15,0],"height":[0,7,15,15,15,0],"texture":[9,9,9,63]}},"wings":{"top":{"doubleside":true,"offset":{"x":0,"y":25,"z":15},"length":[0,50],"width":[0,60,30],"angle":[90,90],"position":[0,0,30],"texture":[63],"bump":{"position":30,"size":10}},"top2":{"doubleside":true,"offset":{"x":0,"y":51,"z":5},"length":[0,50],"width":[0,50,20],"angle":[90,90],"position":[0,0,40],"texture":[63],"bump":{"position":30,"size":10}},"top3":{"doubleside":true,"offset":{"x":40,"y":71,"z":5},"length":[0,35],"width":[0,50,20],"angle":[80,80],"position":[0,0,20],"texture":[4],"bump":{"position":30,"size":10}}},"typespec":{"name":"Barracuda","level":6,"model":8,"code":608,"specs":{"shield":{"capacity":[300,530],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[10,20]},"ship":{"mass":580,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"shape":[5.376,5.373,5.551,5.558,2.365,1.993,2.059,3.858,3.98,3.779,3.613,3.505,3.366,3.324,3.049,1.711,2.73,3.263,3.752,3.972,5.105,5.861,5.835,5.551,5.023,5.52,5.023,5.551,5.835,5.861,5.105,3.972,3.752,3.263,2.73,1.711,3.049,3.324,3.366,3.505,3.613,3.779,3.98,3.858,2.059,1.993,2.365,5.558,5.551,5.373],"lasers":[],"radius":5.861}}',
                    '{"name":"O-Defender","level":6,"model":9,"size":2.2,"specs":{"shield":{"capacity":[400,580],"reload":[10,13]},"generator":{"capacity":[70,125],"reload":[25,43]},"ship":{"mass":580,"speed":[70,89],"rotation":[30,50],"acceleration":[60,80]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-100,-105,-80,-40,0,40,80,115,120,110],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,30,40,40,35,23,17,0],"height":[0,10,15,20,25,35,35,35,25,20,0],"texture":[5,16.9,3,63,4,3,63,4,12,16.9],"propeller":true,"laser":{"damage":[45,70],"rate":2.5,"type":2,"speed":[130,200],"number":1,"angle":0,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-30,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-55,-35,-20,0,20,30,60,110,130,145],"z":[-5,0,0,0,0,0,0,0,0,0]},"width":[0,10,13,15,16,20,23,18,15,0],"height":[0,10,20,22,22,22,27,26,20,0],"texture":[9,9,9,4,63,8,10,63,1],"propeller":false},"side_tongs":{"section_segments":10,"offset":{"x":40,"y":-30,"z":0},"position":{"x":[-10,10,23,27,34,34,32,25,13,-10],"y":[-90,-60,-30,-10,10,25,50,80,110,150],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,10,15,15,20,20,20,20,15,5],"height":[10,20,25,30,30,30,30,25,20,10],"texture":[4,4,8,11,63,13,2,63,3],"propeller":false},"side_tongs2":{"section_segments":12,"offset":{"x":1,"y":-20,"z":0},"position":{"x":[-5,15,25,25,30,25,17,10],"y":[-70,-50,-10,10,25,50,80,130],"z":[-5,-5,0,0,5,5,5,5,5,5]},"width":[10,15,15,20,20,20,25,10,0],"height":[10,20,23,23,23,23,20,10,10],"texture":[4,4,3,63,63,18,3,4],"propeller":false},"side":{"section_segments":10,"offset":{"x":35,"y":-10,"z":0},"position":{"x":[-25,0,0,0,0,-5,-15],"y":[-80,-40,-30,10,50,90,110],"z":[0,0,0,0,0,0,0]},"width":[1,25,40,40,40,30,5],"height":[5,10,10,10,10,10,5],"angle":0,"propeller":false,"texture":[63,4,11,63,4,3]},"side2":{"section_segments":16,"offset":{"x":70,"y":-20,"z":0},"position":{"x":[-50,-50,-5,15,25,20,12,-13,-50,-50],"y":[-109,-110,-70,-40,0,40,63,106,150,150],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4,20,25,25,25,20,15,5,0],"height":[0,10,25,30,35,35,30,25,15,0],"texture":[0,3,2,10,8,18,63,3]}},"typespec":{"name":"O-Defender","level":6,"model":9,"code":609,"specs":{"shield":{"capacity":[400,580],"reload":[10,13]},"generator":{"capacity":[70,125],"reload":[25,43]},"ship":{"mass":580,"speed":[70,89],"rotation":[30,50],"acceleration":[60,80]}},"shape":[4.629,5.817,5.792,5.555,5.414,5.393,5.447,5.42,5.507,5.513,5.381,5.353,5.292,5.17,5.136,5.008,4.884,4.79,4.813,4.937,5.014,5.174,5.431,5.825,5.823,5.29,5.823,5.825,5.431,5.174,5.014,4.937,4.813,4.79,4.884,5.008,5.136,5.168,5.292,5.353,5.381,5.513,5.507,5.42,5.447,5.393,5.414,5.555,5.792,5.817],"lasers":[{"x":0,"y":-4.62,"z":0,"angle":0,"damage":[45,70],"rate":2.5,"type":2,"speed":[130,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.825}}',
                ]
            },
            /*
            {
                TIER: 1,
                SHIPS: [
                    '{"name":"Atreyu","level":1,"model":1,"size":0.8,"specs":{"shield":{"capacity":[435,435],"reload":[5,5]},"generator":{"capacity":[170,170],"reload":[72,72]},"ship":{"mass":100,"speed":[145,145],"rotation":[105,105],"acceleration":[120,120]}},"bodies":{"ring3":{"section_segments":6,"offset":{"x":0,"y":-10,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.3975,-2.6425,-1.8875,0,1.8875,2.6425,3.3975,2.6425,1.8875,0,-1.8875,-2.6425,-3.3975],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[26,27.5,29,29.75,29,27.5,26,24.5,23,22.25,23,24.5,26],"height":[13,14.5,16,16.75,16,14.5,13,11.5,10,9.25,10,11.5,13],"vertical":0,"texture":[17,4,17,4,17,4,17],"angle":0},"ring4":{"section_segments":6,"offset":{"x":0,"y":30,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.3975,-2.6425,-1.8875,0,1.8875,2.6425,3.3975,2.6425,1.8875,0,-1.8875,-2.6425,-3.3975],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[26,27.5,29,29.75,29,27.5,26,24.5,23,22.25,23,24.5,26],"height":[13,14.5,16,16.75,16,14.5,13,11.5,10,9.25,10,11.5,13],"vertical":0,"texture":[17,4,17,4,17,4,17],"angle":0},"ring5":{"section_segments":6,"offset":{"x":0,"y":-82,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring6":{"section_segments":6,"offset":{"x":0,"y":-67,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring7":{"section_segments":6,"offset":{"x":0,"y":-52,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring8":{"section_segments":6,"offset":{"x":0,"y":-37,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"ring9":{"section_segments":6,"offset":{"x":0,"y":-22,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13.5,14,14.5,14.75,14.5,14,13.5,13,12.5,12.25,12.5,13,13.5],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[63,63,63,3,3],"angle":0},"reactors":{"section_segments":[45,135,225,315],"offset":{"x":18,"y":11,"z":-53},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,1,0],"height":[9,7.5,6.5,6,5,1,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":32},"reactor":{"section_segments":20,"offset":{"x":0,"y":10,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[17.1,14.25,12.35,11.4,9.5,1.9000000000000001,0],"height":[17.1,14.25,12.35,11.4,9.5,1.9000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"main":{"section_segments":6,"offset":{"x":0,"y":-80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-100,-90,-20,25,50,95,100,107.5,112.5,165,180,180,170],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,13,15,30,31.5,35.5,35,35,35,35,35,30,28,0],"height":[0,4,4.9,12,15,15,15,15,15,15,15,13,11,0],"propeller":true,"texture":[3,1,10,11,4,18,63,18,63,16.9,12.96,16.9]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-80,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-52,-50,-30,-5,70,5],"z":[0,0.4,-2,-1,0,0,0]},"width":[0,4,12,14,14,0],"height":[0,2,8,10,10,0],"texture":[9,9,9,4]},"toploader":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":7,"z":-53},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-10,0,11,11,10,10],"z":[0,0,0,0,0,0,0]},"width":[0,45,45,20,17,17,0],"height":[0,32,32,32,29,29,0],"texture":[4,4,[8],63,17,17],"vertical":true},"chunk":{"section_segments":6,"offset":{"x":0,"y":55.900000000000006,"z":0.6},"position":{"x":[0,0,0,0,0,0],"y":[-18,-18,-15.5,21.3,24,24],"z":[0,0,0,0,0,0]},"width":[0,30,30,30,30,0],"height":[0,15,15,15,15,0],"texture":[4,[15],16,[15]]},"propeller":{"section_segments":6,"offset":{"x":32,"y":20,"z":-12},"position":{"x":[-5,-5,0,0,0,0,0,-3,-3,-3],"y":[-80,-75,-50,-20,10,30,55,75,75,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,15,15,12,10,0],"height":[0,10,15,15,15,15,15,13,11,0],"propeller":true,"texture":[63,63,10,11,4,18,12,16.9],"laser":{"damage":[12,12],"rate":4,"type":1,"speed":[160,160],"number":1,"error":0}},"cannon":{"section_segments":6,"offset":{"x":26,"y":-80,"z":-7},"position":{"x":[0,0,0,0,0,0,-10],"y":[-50,-60,-60,-20,0,20,30],"z":[0,0,0,0,0,0,0]},"width":[0,4,5,8,8,8,0],"height":[0,4,5,8,8,8,0],"texture":[16.9,16.9,3,10,18,63],"laser":{"damage":[7,7],"rate":10,"type":2,"speed":[140,180],"number":1,"angle":-2,"error":0}},"light":{"section_segments":6,"offset":{"x":0,"y":-135,"z":14.5},"position":{"x":[0,0,0,0],"y":[-50,-50,45,45],"z":[-4,-4,-12,-12]},"width":[0,5,2.5,0],"height":[0,5,2,0],"texture":[3.9,16.9,3.9],"angle":180},"bump":{"section_segments":[45,135,225,315],"offset":{"x":8,"y":2,"z":48},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,53,53,51,0],"texture":[63,17,63],"angle":30,"vertical":true},"stab":{"section_segments":6,"offset":{"x":29.5,"y":2,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-5,0,3,3,1,1],"z":[0,0,0,0,0,0]},"width":[0,9,4,1.5,1,0],"height":[0,30,20,16,16,0],"texture":[3.9,3.9,16.9,63,0.9],"vertical":true,"angle":30},"hexagon":{"section_segments":6,"offset":{"x":25,"y":38,"z":4},"position":{"x":[0,0,0,0,0],"y":[0,0,5.5,5.5,0],"z":[0,0,0,0,0]},"width":[9,12,12,9,9],"height":[7.5,10,10,7.5,7.5],"texture":[17]},"hexagon2":{"section_segments":6,"offset":{"x":25,"y":62,"z":4},"position":{"x":[0,0,0,0,0],"y":[0,0,5.5,5.5,0],"z":[0,0,0,0,0]},"width":[9,12,12,9,9],"height":[7.5,10,10,7.5,7.5],"texture":[17]}},"wings":{"front":{"offset":{"x":0,"y":-115,"z":0},"length":[75],"width":[50,10],"angle":[-20],"position":[15,70],"texture":[63],"doubleside":true,"bump":{"position":30,"size":10}},"front_light":{"offset":{"x":0,"y":-111.5,"z":4.5},"length":[76],"width":[6,3],"angle":[-23],"position":[22,68],"texture":[17],"doubleside":true,"bump":{"position":30,"size":15}},"front_light2":{"offset":{"x":0,"y":-116.5,"z":3.5},"length":[76],"width":[6,3],"angle":[-22],"position":[2,70],"texture":[17],"doubleside":true,"bump":{"position":30,"size":15}},"top":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[0,20,0,5,-2,0],"width":[40,40,40,80,60,45,0],"angle":[90,90,90,90,90,90],"position":[-30,-30,-15,-15,-10,-8,-14],"texture":[4,4,4,18,63,17],"bump":{"position":35,"size":20}},"main":{"offset":{"x":0,"y":22,"z":0},"length":[150,2.5,20],"width":[80,50,50,30],"angle":[-20,20,20],"position":[0,70,70,50],"texture":[18,17,63],"doubleside":true,"bump":{"position":30,"size":5}},"main2":{"offset":{"x":0,"y":24,"z":0},"length":[150,2.5,20],"width":[80,50,50,30],"angle":[-20,20,20],"position":[0,70,70,50],"texture":[11,17,63],"doubleside":true,"bump":{"position":30,"size":5}},"main3":{"offset":{"x":0,"y":24,"z":2},"length":[131],"width":[39,22],"angle":[-20,20],"position":[2.5,60.5],"texture":[63],"doubleside":true,"bump":{"position":20,"size":10}},"main_lights":{"offset":{"x":0,"y":28,"z":5.5},"length":[131],"width":[5,3],"angle":[-21.3,20],"position":[2.5,60.5],"texture":[17],"doubleside":true,"bump":{"position":20,"size":10}},"main_lights2":{"offset":{"x":0,"y":19,"z":5},"length":[131],"width":[5,3],"angle":[-21,20],"position":[-2.5,60.5],"texture":[17],"doubleside":true,"bump":{"position":20,"size":10}},"main_deco":{"offset":{"x":0,"y":19,"z":0},"length":[150,2.5,20],"width":[80,50,50,30],"angle":[-20,20,20],"position":[0,70,70,50],"texture":[17],"doubleside":true,"bump":{"position":30,"size":0}}},"typespec":{"name":"Atreyu","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[435,435],"reload":[5,5]},"generator":{"capacity":[170,170],"reload":[72,72]},"ship":{"mass":100,"speed":[145,145],"rotation":[105,105],"acceleration":[120,120]}},"shape":[2.96,2.881,2.292,1.696,1.47,1.411,1.379,1.38,1.383,0.82,0.774,0.743,0.725,0.725,1.001,2.789,2.959,2.96,2.98,2.543,1.953,1.606,1.645,1.653,1.629,1.603,1.629,1.653,1.645,1.606,1.953,2.543,2.98,2.96,2.959,2.789,1.001,0.725,0.725,0.743,0.774,0.82,1.383,1.38,1.379,1.411,1.47,1.696,2.292,2.881],"lasers":[{"x":0.432,"y":-0.96,"z":-0.192,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.432,"y":-0.96,"z":-0.192,"angle":0,"damage":[12,12],"rate":4,"type":1,"speed":[160,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.416,"y":-2.24,"z":-0.112,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[140,180],"number":1,"spread":-2,"error":0,"recoil":0},{"x":-0.416,"y":-2.24,"z":-0.112,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[140,180],"number":1,"spread":-2,"error":0,"recoil":0}],"radius":2.98}}',
                    '{"name":"Daedalus","level":1,"model":2,"size":1.5,"specs":{"shield":{"capacity":[510,510],"reload":[6,6]},"generator":{"capacity":[120,120],"reload":[88,88]},"ship":{"mass":290,"speed":[120,120],"rotation":[80,80],"acceleration":[100,100]}},"bodies":{"reactor":{"section_segments":16,"offset":{"x":0,"y":11,"z":-46.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,1,0],"height":[9,7.5,6.5,6,5,1,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"ring":{"section_segments":6,"offset":{"x":7.5,"y":49,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":0,"texture":16.9,"angle":0},"ring2":{"section_segments":6,"offset":{"x":7.5,"y":42,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":0,"texture":16.9,"angle":0},"ring3":{"section_segments":[45,135,225,315],"offset":{"x":38,"y":-8,"z":30},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":1,"texture":16.9,"angle":0},"ring4":{"section_segments":6,"offset":{"x":6,"y":3,"z":3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.4,8.8,9,8.8,8.4,8,7.6,7.2,7,7.2,7.6,8],"height":[6,6.4,6.8,7,6.8,6.4,6,5.6,5.2,5,5.2,5.6,6],"vertical":0,"texture":[63,2,17,63,2,17],"angle":0},"ring5":{"section_segments":6,"offset":{"x":6.3,"y":10,"z":3.6},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.4,8.8,9,8.8,8.4,8,7.6,7.2,7,7.2,7.6,8],"height":[6,6.4,6.8,7,6.8,6.4,6,5.6,5.2,5,5.2,5.6,6],"vertical":0,"texture":[63,2,17,63,2,17],"angle":0},"ring6":{"section_segments":6,"offset":{"x":6.7,"y":17,"z":3.9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.4,8.8,9,8.8,8.4,8,7.6,7.2,7,7.2,7.6,8],"height":[6,6.4,6.8,7,6.8,6.4,6,5.6,5.2,5,5.2,5.6,6],"vertical":0,"texture":[63,2,17,63,2,17],"angle":0},"main":{"section_segments":6,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-64,-60,-50,10,15,17.5,56,65,75,75,65],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.2,6.6000000000000005,11,16.5,16.5,16.5,17.6,19.8,16.5,15.400000000000002,0],"height":[0,1,4,5.12,14.4,15,15,15,15,10,9,0],"propeller":true,"texture":[3.9,3.9,2.9,2.9,3.9,17,18,3.9,13,16.9]},"head":{"section_segments":[0,60,120,180],"offset":{"x":-2,"y":10,"z":0},"position":{"x":[0.5,0.5,0,0,-10,-10],"y":[-60,-60,-52,-36,-20,-20],"z":[0,0,0,0,2.5,0]},"width":[0,5.5,9,11,0.1,0],"height":[0,4,5.5,8,2.5,0],"texture":[3.9,3.9,3.9,2.9]},"head_deco":{"section_segments":[0,60,120,180],"offset":{"x":-2.6,"y":10,"z":0},"position":{"x":[0.5,0.5,0,0,-9.5,-9.5],"y":[-60,-60,-52,-36,-20,-20],"z":[0,0,0,0,0.2,0]},"width":[0,5.5,9,11,0.1,0],"height":[0,1,2,2,2,0],"texture":[3.9,63]},"shield":{"section_segments":6,"offset":{"x":5,"y":35,"z":-2},"position":{"x":[0,0,-1,0,0,-1,-1.2,9,9],"y":[-70,-65,-50,-27,-25,33,35,43,35],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,10,14,15,15,18,18,2,0],"height":[0,2.9411764705882355,5.294117647058823,5.294117647058823,5.294117647058823,5.294117647058823,5.294117647058823,2.9411764705882355,0],"texture":[3.9,3.9,63,16.9,8,16.9,63,16.9]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-20,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-4,-2,0,5,30,40,42],"z":[-4,-4,-4,-3,0,0,0]},"width":[0,2,4,8,10,10,0],"height":[0,5,7,8,8,6,0],"propeller":false,"texture":[7,7,9,9,4]},"outer_arms":{"section_segments":6,"offset":{"x":58,"y":0,"z":-8},"position":{"x":[1.5,4.5,4.5,4.5,8,11,14,16,16,14,12,10,8.5,0],"y":[-100,-86,-85,-85,-60,-40,-20,0,20,40,60,80,80,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0.55,2.2,5.5,6.6000000000000005,8.8,8.8,8.8,8.8,8.8,8.8,7.700000000000001,5.5,4.4,0],"height":[0.5,2,5,6,6,6,7,9,12,15,15,8,8,0],"texture":[16.9,17.9,16.9,3.9,11,2.9,11,16,63,16,[15]],"laser":{"damage":[40,40],"rate":1,"type":1,"speed":[150,180],"number":1,"error":1,"recoil":90}},"outer_arms2":{"section_segments":6,"offset":{"x":58.5,"y":0,"z":-8},"position":{"x":[1.5,4.5,4.5,4.5,8,11,14,16,16,14,12,10,8.5,0],"y":[-100,-86,-85,-85,-60,-40,-20,0,20,40,60,80,80,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0.55,2.2,5.5,6.6000000000000005,8.8,8.8,8.8,8.8,8.8,8.8,7.700000000000001,5.5,4.4,0],"height":[0.5,2,5,6,6,6,7,9,12,15,15,8,8,0],"propeller":false,"texture":[16.9,17.9,16.9,0.9,18,8,18,3.9,16.9,3.9,[15]],"laser":{"damage":[20,20],"rate":1,"type":1,"speed":[150,160],"number":1,"error":1,"recoil":0}},"outer_arms_deco":{"section_segments":6,"offset":{"x":56.5,"y":0,"z":-8},"position":{"x":[4.5,4.5,8,11,14,16,16,14,14,10,8,0],"y":[-84.9,-84.9,-60,-40,-20,0,20,40,60,80,90,90],"z":[0,0,0,0,0,0,0,0,0,0,-5,0]},"width":[2.2,6.6000000000000005,8.8,8.8,8.8,8.8,8.8,8.8,7.700000000000001,5.5,4.4,0],"height":[1,1,1,1,1,1,1,1,1,1],"propeller":false,"texture":[63]},"propeller":{"section_segments":6,"offset":{"x":68,"y":70,"z":-8},"position":{"x":[3,3,3,0,0,0,0],"y":[-16,-16,-12,7,15,15,10],"z":[0,0,0,0,0,0,0]},"width":[0,8,10,10,8,7,0],"height":[0,15,17,12,10,9,0],"propeller":true,"texture":[2.9,16.9,3.9,12.9,16.9]},"inner_arm":{"section_segments":6,"offset":{"x":43,"y":-60,"z":-7.5},"position":{"x":[-3,-3,0,0,0,0],"y":[40,40,60,90,107,110],"z":[0,0,0,0,0,0]},"width":[0,10,10,12,12,0],"height":[0,5,5,5,5,0],"propeller":false,"texture":[[15],18,17,63]},"inner_arm2":{"section_segments":6,"offset":{"x":43.5,"y":-60,"z":-7.5},"position":{"x":[-3,-3,0,0,0,0],"y":[40,40,60,90,107,110],"z":[0,0,0,0,0,0]},"width":[0,10,10,12,12,0],"height":[0,5,5,5,5,0],"propeller":false,"texture":[[15],11,4,63]},"inner_arm_jaw":{"section_segments":[0,180,225,315],"offset":{"x":40.5,"y":-40,"z":-7.5},"position":{"x":[-3.8,-3,0,0],"y":[-6,0,20,20],"z":[0,0,0,0]},"width":[0.1,12,12,0],"height":[0.1,4,4,0],"propeller":false,"texture":[16.9,2.9]},"inner_arm_deco":{"section_segments":[45,135,225,315],"offset":{"x":40.5,"y":-60,"z":-7.5},"position":{"x":[0.5,-3,0,0,0,0],"y":[40,40,60,80,100,100],"z":[0,0,0,0,0,0]},"width":[5,10,10,12,12,0],"height":[1,1,1,1,1,0],"propeller":false,"texture":[63]},"cannon":{"section_segments":6,"offset":{"x":37,"y":-10,"z":-7.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-35,-40,-40,-37,-30,-25,0],"z":[0,0,0,0,0,0,0,2,2,2,2,2,2]},"width":[0,2,2.5,3,3,3,3,3,3,3,3,3,0],"height":[0,2,2.5,3,3,3,3,3,3,3,3,0],"angle":7,"texture":[16.9,16.9,63,4,18,17,2,11,4,4]},"cannon2":{"section_segments":6,"offset":{"x":37,"y":-10,"z":-7.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,2,2,2,2,2,2]},"width":[0,2,2.5,3,3,3,3,3,3,3,3,3,0],"height":[0,2,2.5,3,3,3,3,3,3,3,3,0],"angle":0,"texture":[16.9,16.9,63,4,18,17,2,11,4,4],"laser":{"damage":[8,8],"rate":6.2,"type":2,"speed":[160,180],"number":1,"error":3}},"box":{"section_segments":[45,135,225,315],"offset":{"x":1.5,"y":-3,"z":-9},"position":{"x":[0,0,0,0,0],"y":[5,5,15,16,16],"z":[0,0,0,0,0]},"width":[0,2,2,1,0],"height":[0,15,15,13,0],"texture":[63,17,63],"angle":35,"vertical":true},"lights":{"section_segments":8,"offset":{"x":10,"y":41,"z":4},"position":{"x":[-2,-2,7,7],"y":[0,0,50,50],"z":[0,0,-9,-9]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"angle":90,"texture":[63,17,63]},"lights2":{"section_segments":8,"offset":{"x":10,"y":46.5,"z":4},"position":{"x":[-4,-4,7,7],"y":[0,0,50,50],"z":[1,1,-9,-9]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"angle":90,"texture":[63,17,63]}},"wings":{"main":{"offset":{"x":0,"y":50,"z":6},"length":[70],"width":[40,35],"angle":[-10],"position":[0,-15],"doubleside":true,"bump":{"position":30,"size":5},"texture":[18]},"main_lights":{"offset":{"x":0,"y":48,"z":6},"length":[70],"width":[40,35],"angle":[-10],"position":[0,-15],"doubleside":true,"bump":{"position":30,"size":0},"texture":[17]},"main2":{"offset":{"x":0,"y":50,"z":6.7},"length":[61],"width":[20,15],"angle":[-10],"position":[0,-13],"doubleside":true,"bump":{"position":40,"size":10},"texture":[63]}},"typespec":{"name":"Daedalus","level":1,"model":2,"code":102,"specs":{"shield":{"capacity":[510,510],"reload":[6,6]},"generator":{"capacity":[120,120],"reload":[88,88]},"ship":{"mass":290,"speed":[120,120],"rotation":[80,80],"acceleration":[100,100]}},"shape":[1.65,1.579,1.398,1.088,3.506,3.44,3.246,2.976,2.779,2.629,2.531,2.479,2.463,2.483,2.54,2.611,2.722,2.951,3.183,3.399,3.309,2.139,2.071,2.471,2.586,2.555,2.586,2.471,2.071,2.139,3.309,3.399,3.183,2.951,2.722,2.611,2.54,2.483,2.464,2.479,2.531,2.629,2.779,2.976,3.246,3.44,3.506,1.088,1.398,1.579],"lasers":[{"x":1.785,"y":-3,"z":-0.24,"angle":0,"damage":[40,40],"rate":1,"type":1,"speed":[150,180],"number":1,"spread":0,"error":1,"recoil":90},{"x":-1.785,"y":-3,"z":-0.24,"angle":0,"damage":[40,40],"rate":1,"type":1,"speed":[150,180],"number":1,"spread":0,"error":1,"recoil":90},{"x":1.8,"y":-3,"z":-0.24,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[150,160],"number":1,"spread":0,"error":1,"recoil":0},{"x":-1.8,"y":-3,"z":-0.24,"angle":0,"damage":[20,20],"rate":1,"type":1,"speed":[150,160],"number":1,"spread":0,"error":1,"recoil":0},{"x":1.11,"y":-0.3,"z":-0.225,"angle":0,"damage":[8,8],"rate":6.2,"type":2,"speed":[160,180],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.11,"y":-0.3,"z":-0.225,"angle":0,"damage":[8,8],"rate":6.2,"type":2,"speed":[160,180],"number":1,"spread":0,"error":3,"recoil":0}],"radius":3.506}}',
                    '{"name":"Dugares","level":1,"model":3,"size":1.2,"specs":{"shield":{"capacity":[665,665],"reload":[5,5]},"generator":{"capacity":[120,120],"reload":[84,84]},"ship":{"mass":340,"speed":[128,128],"rotation":[90,90],"acceleration":[70,70]}},"bodies":{"main":{"section_segments":[-180,-90,-50,-45,-40,40,45,50,90,180],"offset":{"x":0,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-156,-155,-150,-135,-120,-110,60,59.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2.142857142857143,5.714285714285714,7.857142857142858,9.285714285714286,10.714285714285715,14.285714285714286,0],"height":[0,2,3,8,12,14,24,0],"propeller":0,"texture":[2,4,3,3,3,3,4]},"main1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-15,"z":-2.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-156,-155,-150,-135,-120,-110,60,59.5],"z":[2.5,1.6,0,0,0,0,0,0,0,0,0]},"width":[0,3,8,11,13,15,20,0],"height":[0,1.25,3.75,5,7.5,10,15,0],"propeller":0,"texture":[2,3,2,3,3,3,4]},"main2":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-150,-150,-143,-110,-45,0,60,60],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8.399999999999999,12.6,16.799999999999997,23.799999999999997,37.8,37.8,0],"height":[0,4.8,6,13.2,15.6,15.6,15.6,0],"propeller":0,"texture":[3.9,2.9,3.9,2.9,3.9,2.9]},"main25":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-15,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-150,-150,-143,-110,-45,0,50,50],"z":[3,3,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10.26,15.39,20.52,29.07,46.17,46.17,0],"height":[0,1.2,6,9.6,15.6,15.6,15.6,0],"propeller":0,"texture":[4,3,4,3,4,3]},"main3":{"section_segments":[60,65,70,110,115,120,220,225,230,310,315,320],"offset":{"x":0,"y":-15,"z":-9},"position":{"x":[-14,-14,-17,-31,-30,-30,-5,-5],"y":[-103,-100,-45,0,0,30,59,59],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0.1,6,9,12,27,27,30,0],"height":[4,10,12,14,14,14,14,0],"propeller":0,"texture":[3,3,3,3,3,3,4]},"main35":{"section_segments":[40,45,50,130,135,140,240,245,250,290,295,300],"offset":{"x":0,"y":-15,"z":-9},"position":{"x":[14,14,17,31,30,30,5,5],"y":[-103,-100,-45,0,0,30,59,59],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0.1,6,9,12,27,27,30,0],"height":[4,10,12,14,14,14,14,0],"propeller":0,"texture":[3.2,3.2,3.2,3.2,3.2,3.2,4]},"guns":{"section_segments":10,"offset":{"x":47.5,"y":-10,"z":-9},"position":{"x":[0,0,0,0],"y":[-18,-20,0,0],"z":[0,0,0,0]},"width":[0,4,5,0],"height":[0,4,5,0],"texture":[3]},"guns_front":{"section_segments":10,"offset":{"x":14,"y":-115,"z":-9},"position":{"x":[-3,-3,0,0],"y":[-35,-32,0,0],"z":[0,0,0,0]},"width":[0,4,5,0],"height":[0,4,5,0],"texture":[4]},"cannons":{"section_segments":12,"offset":{"x":61,"y":-17,"z":-16.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-30,-56,-56,-56,-55,-49,-47,-40,-36,-32,0,1,2],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,2.5,2.5,3.7,5.3,5.3,3.5,3.5,6,6,6,3,0],"height":[0,2,2.5,2.5,3.7,5.3,5.3,3.5,3.5,6,6,6,3,0],"texture":[3,3,4,4,4,4,4,3,4],"laser":{"damage":[21,21],"rate":3.5,"type":1,"speed":[120,120],"number":1,"error":0}},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-40,"z":14},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,60,70,85,84.5],"z":[0,0.2,-2,-1,-1,3]},"width":[0,7,10,10,10,5],"height":[0,2,12,14,14,0],"texture":[7,8.98,4,4,4]},"cockpit_deco":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":2,"y":40,"z":18},"position":{"x":[0,0,0,0],"y":[0,0,2.5,2.5],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[3],"angle":90},"back_plate":{"section_segments":[45,135,225,315],"offset":{"x":3,"y":43,"z":37.4},"position":{"x":[0,0,0,0,0,0],"y":[0,0,30,50,90,90],"z":[-5,-5,0,0,-3,-3]},"width":[0,12,12,12,9,0],"height":[0,1,1,1,1,0],"texture":[3],"angle":0},"back_plate2":{"section_segments":[0,45,90,90],"offset":{"x":0,"y":43,"z":33},"position":{"x":[-11.5,-11.5,-11.5,-11.5,-8.5,-8.5],"y":[-7,-7,30,50,100,100],"z":[-6.2,-6.2,0,0,-3.5,-3.5]},"width":[5,5,5,5,5,0],"height":[5,5,5,5,5,0],"texture":[3]},"back_plate3":{"section_segments":[-90,-45,0,0],"offset":{"x":0,"y":43,"z":33},"position":{"x":[11.5,11.5,11.5,11.5,8.5,8.5],"y":[-7,-7,30,50,100,100],"z":[-6.2,-6.2,0,0,-3.5,-3.5]},"width":[5,5,5,5,5,0],"height":[5,5,5,5,5,0],"texture":[3]},"back_plate4":{"section_segments":[45,135,225,315],"offset":{"x":16,"y":43,"z":22.8},"position":{"x":[0,0,0,0,0,-3,-3],"y":[-7,-7,5,30,50,90,100],"z":[3.2,3.2,-1.6,0,0,-3.5,6.8]},"width":[0,0.5,0.5,0.5,0.5,1,1],"height":[0,1,11,15,15,15,0.1],"texture":[3]},"back_deco":{"section_segments":4,"offset":{"x":0,"y":53,"z":26},"position":{"x":[0,0,0,0],"y":[-16,-16,16,16],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,2,2,0],"texture":[8],"angle":90},"turbine":{"section_segments":[-140,-120,-100,-50,-45,-40,40,45,50,100,120,140,180],"offset":{"x":0,"y":49,"z":8},"position":{"x":[30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],"y":[24,18,0,6,18,54,62.4,72,72,72,42,42,42,48,42,42],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"height":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"texture":[4,3,3,3,4,3,3,17],"propeller":true},"turbine2":{"section_segments":[-140,-120,-100,-50,-45,-40,40,45,50,100,120,140,180],"offset":{"x":0,"y":49,"z":8},"position":{"x":[-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30,-30],"y":[24,18,0,6,18,54,62.4,72,72,72,42,42,42,48,42,42],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"height":[0,14.399999999999999,14.399999999999999,18,18,18,18,15.6,13.799999999999999,13.2,6,7.199999999999999,6,4.8,1.2,0],"texture":[4,3,3,3,4,3,3,17],"propeller":true},"engine":{"section_segments":12,"offset":{"x":30,"y":47,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-1.5,-1.5,-1,-1,0,10,10],"z":[0,0,0,0,0,0,0]},"width":[0,5.5,6,8,10,10,0],"height":[0,5.5,6,8,10,10,0],"texture":[2,4,3,3,4,3,37]},"turbinedeco":{"section_segments":[43,45,47,90,270,310,313,315,317],"offset":{"x":0,"y":89,"z":21},"position":{"x":[0,0,0,0],"y":[0,0,22,22],"z":[0,0,0,0]},"width":[0,27,27,0],"height":[0,15,15,0],"texture":[3],"angle":0},"turbinedeco2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":45,"y":73,"z":14},"position":{"x":[0,0,0,0],"y":[0,0,11,11],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,4,4,0],"texture":[4]},"grill":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":18,"y":67,"z":27},"position":{"x":[0,0,0,0,0,0],"y":[0,0,0,0,19,19],"z":[0,0,0,0,0,0]},"width":[0,3,5,6,6,0],"height":[0,2.5,5,6,6,0],"texture":[3,4,3],"angle":-15},"stab":{"section_segments":[45,135,225,315],"offset":{"x":10,"y":125,"z":33.5},"position":{"x":[-2,-2,-2,-2.5,-2.5,-2.5,-2.5,-2.5],"y":[-32,-30,2,6,16,20,21.5,21.5],"z":[1,2,0,1,2,1.5,0.5,0]},"width":[1.2,2,2,2,2,2,2,0],"height":[5,5,5,6,4,4,2.5,0],"texture":[4]},"winglet":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-120},"position":{"x":[0,0,0,0],"y":[0,0,40,40],"z":[0,1,-21,-21]},"width":[0,2,2,0],"height":[0,42,6,0],"texture":[3],"vertical":true,"angle":65},"winglet_lights":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-117},"position":{"x":[0,0,0,0],"y":[0,3,42,42],"z":[0,-2,-23,-21]},"width":[0,1.5,1.5,0],"height":[0,42,6,0],"texture":[17,17,4],"vertical":true,"angle":65},"winglet1":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-120},"position":{"x":[0,0,0,0],"y":[0,5,35,40],"z":[0,1,-17,-21]},"width":[0,2.1,2.1,0],"height":[0,26,0.1,0],"texture":[4],"vertical":true,"angle":65},"winglet2":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":25,"z":-155},"position":{"x":[0,0,0,0],"y":[0,0,8,8],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,15,15,0],"texture":[3],"vertical":true,"angle":65},"winglet3":{"section_segments":[45,135,225,315],"offset":{"x":45.5,"y":36.7,"z":-151},"position":{"x":[0,0,0,0],"y":[0,0,12,12],"z":[0,0,6,0]},"width":[0,2,2,0],"height":[0,12,12,0],"texture":[3],"vertical":true,"angle":65},"winglet3_lights":{"section_segments":[45,135,225,315],"offset":{"x":45.5,"y":36.7,"z":-151},"position":{"x":[0,0,0,0],"y":[0,0,13.9,13.9],"z":[0,0,6,6]},"width":[0,1.5,1.5,0],"height":[0,12,10,0],"texture":[17,17,4],"vertical":true,"angle":65},"winglet4":{"section_segments":[45,135,225,315],"offset":{"x":20,"y":24,"z":-154},"position":{"x":[0,0,0,0],"y":[0,0,30,30],"z":[0,0,5,0]},"width":[0,0.5,0.5,0],"height":[0,12,8,0],"texture":[4],"vertical":true,"angle":65},"wing":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-85},"position":{"x":[0,0,0,0],"y":[0,0,60,60],"z":[0,-4,-55,-55]},"width":[0,3,3,0],"height":[0,34,4,0],"texture":[4],"vertical":true,"angle":130},"wing1":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-85},"position":{"x":[0,0,0,0],"y":[0,15,60,60],"z":[0,10,-50,-55]},"width":[0,3,3,0],"height":[0,20,4,0],"texture":[4],"vertical":true,"angle":130},"wing2":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-70},"position":{"x":[0,0,0,0],"y":[25,25,67,67],"z":[3,3,-58,-58]},"width":[0,4,4,0],"height":[0,30,25,0],"texture":[3],"vertical":true,"angle":130},"wing2_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-70},"position":{"x":[0,0,0,0],"y":[25,25,69,69],"z":[3,8,-59,-60]},"width":[0,3.5,3.5,0],"height":[0,30,27,0],"texture":[3,17],"vertical":true,"angle":130},"wing3":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-45},"position":{"x":[0,0,0,0],"y":[25,25,55,55],"z":[6,6,-55,-55]},"width":[0,4,4,0],"height":[0,30,10,0],"texture":[3],"vertical":true,"angle":130},"wing3_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-45},"position":{"x":[0,0,0,0],"y":[25,25,57.5,57.5],"z":[10,10,-55,-55]},"width":[0,3.5,3.5,0],"height":[0,30,10,0],"texture":[3,17],"vertical":true,"angle":130},"wing4":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":4},"position":{"x":[0,0,0,0],"y":[25,25,45,45],"z":[6,6,-73,-73]},"width":[0,4,4,0],"height":[0,40,0,0],"texture":[3],"vertical":true,"angle":130},"wing4_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":4},"position":{"x":[0,0,0,0],"y":[25,25,47.5,45],"z":[6,6,-73,-73]},"width":[0,3.5,3.5,0],"height":[0,50,0,0],"texture":[3,17],"vertical":true,"angle":130},"wing5":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-80},"position":{"x":[0,0,0,0],"y":[0,0,30,30],"z":[0,1,20,20]},"width":[0,3,3,0],"height":[0,20,33,0],"texture":[4],"vertical":true,"angle":130},"wing5_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":-80},"position":{"x":[0,0,0,0],"y":[0,0,30,30],"z":[0,1,20,20]},"width":[0,2.5,2.5,0],"height":[0,23,36,0],"texture":[4,17,4],"vertical":true,"angle":130},"wing6":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":8},"position":{"x":[0,0,0,0],"y":[25,25,32,32],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,50,42,0],"texture":[3],"vertical":true,"angle":130},"wing7_lights":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":8},"position":{"x":[0,0,0,0],"y":[25,25,34,32],"z":[0,0,0,0]},"width":[0,3.5,3.5,0],"height":[0,50,39,0],"texture":[3,17],"vertical":true,"angle":130},"wing7":{"section_segments":[45,135,225,315],"offset":{"x":43,"y":-3,"z":8},"position":{"x":[0,0,0,0],"y":[18,18,25,25],"z":[0,0,0,0]},"width":[0,4,4,0],"height":[0,33,50,0],"texture":[3],"vertical":true,"angle":130},"wing_block":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":60,"y":-18,"z":-0.5},"position":{"x":[0,0,-12,-12],"y":[0,0,15,15],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,17,17,0],"texture":[8],"vertical":true},"main_deco":{"section_segments":[45,135,225,315],"offset":{"x":22,"y":6.5,"z":-32},"position":{"x":[0,0,4,4],"y":[0,0,5,5],"z":[0,4,0,0]},"width":[0,5,5,0],"height":[0,23,17,0],"texture":[4],"vertical":true},"ring0":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":-10,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring20":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":-10,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring1":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":-4,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring21":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":-4,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring2":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":2,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring22":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":2,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring3":{"section_segments":[30,75,165,210,255,345],"offset":{"x":0,"y":8,"z":-12},"position":{"x":[55,55,55,55],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0},"ring23":{"section_segments":[-30,15,105,150,195,285],"offset":{"x":0,"y":8,"z":-12},"position":{"x":[-54,-54,-54,-54],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,13,13,0],"texture":[3.9],"angle":0}},"wings":{"main":{"length":[20,15],"width":[85,60,5],"angle":[-10,-20],"position":[40,20,30],"doubleside":true,"offset":{"x":0,"y":-103,"z":-4},"bump":{"position":40,"size":5},"texture":[3]},"main_lights":{"length":[20,15],"width":[85,60,5],"angle":[-10,-20],"position":[40,20,30],"doubleside":true,"offset":{"x":0,"y":-105,"z":-4},"bump":{"position":40,"size":4},"texture":[17]},"main2":{"length":[10,0,20],"width":[16,14,45,7],"angle":[-30,-30,-30],"position":[-5,0,15,28],"doubleside":true,"offset":{"x":43,"y":77,"z":8},"bump":{"position":0,"size":5},"texture":[3,3]},"main2_lights":{"length":[10,0,20],"width":[16,14,45,7],"angle":[-30,-30,-30],"position":[-2,1,15,28],"doubleside":true,"offset":{"x":43,"y":75,"z":8},"bump":{"position":0,"size":4},"texture":[17,3,17]}},"typespec":{"name":"Dugares","level":1,"model":3,"code":103,"specs":{"shield":{"capacity":[665,665],"reload":[5,5]},"generator":{"capacity":[120,120],"reload":[84,84]},"ship":{"mass":340,"speed":[128,128],"rotation":[90,90],"acceleration":[70,70]}},"shape":[4.104,3.838,2.709,2.26,1.905,2.274,2.349,2.122,1.983,1.898,1.822,1.749,1.708,1.736,1.818,1.928,2.097,2.351,2.765,3.664,4.255,4.056,3.957,3.984,4.03,3.523,4.03,3.984,3.957,4.056,4.255,3.664,2.765,2.351,2.097,1.928,1.818,1.736,1.708,1.749,1.822,1.898,1.983,2.122,2.349,2.274,1.905,2.26,2.709,3.838],"lasers":[{"x":1.464,"y":-1.752,"z":-0.396,"angle":0,"damage":[21,21],"rate":3.5,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.464,"y":-1.752,"z":-0.396,"angle":0,"damage":[21,21],"rate":3.5,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.255}}',
                    '{"name":"Goliath","level":1,"model":4,"size":1.25,"specs":{"shield":{"capacity":[645,645],"reload":[8,8]},"generator":{"capacity":[140,140],"reload":[72,72]},"ship":{"mass":390,"speed":[110,110],"rotation":[75,75],"acceleration":[135,135]}},"bodies":{"ball":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":7,"y":0,"z":-35},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-9,-8.559508646656381,-7.281152949374527,-5.2900672706322585,-2.781152949374527,-5.51091059616309e-16,2.781152949374526,5.290067270632258,7.281152949374526,8.559508646656381,9],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"height":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"texture":17,"vertical":1,"angle":0},"ball2":{"section_segments":30,"offset":{"x":53,"y":14,"z":-22},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-1,-0.9510565162951535,-0.8090169943749475,-0.5877852522924731,-0.30901699437494745,-6.123233995736766e-17,0.30901699437494734,0.587785252292473,0.8090169943749473,0.9510565162951535,1],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"height":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"texture":17,"vertical":1,"angle":0},"main":{"section_segments":8,"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,35,100,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,20,20,20,20,20,17,14.5,0],"height":[0,5,15,15,15,15,16,16,15,12.5,0],"texture":[4,3,3,3,3,4,4,18,16.97],"propeller":true},"main2":{"section_segments":8,"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,35,90,90],"z":[0,0,0,0,0,0,0,0,1.5,0,0]},"width":[0,10.5,21,21,21,21,21,21,17.85,15.225000000000001,0],"height":[0,2.5,7.5,7.5,7.5,7.5,8,8,10,6.25,0],"texture":[63],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":16,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,0,20,40,90,92],"z":[-7,-5,-4,-4,-6,0]},"width":[0,10,10,10,10,0],"height":[0,10,10,12,12,0],"texture":[9,9,9,4]},"claws":{"section_segments":6,"offset":{"x":50,"y":-35,"z":0},"position":{"x":[-33,-25,5,20,25,20,20,20,0,0,0,-50],"y":[-105,-100,-70,-40,-10,20,20,20,48,48,48,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,19,19,15,0,0,0,0,15,14],"height":[0,5,15,16,15,15,0,0,0,0,13,0],"texture":[17,3.9,11,2.9,11,3.9,1,1,1,3.9,18]},"claws2":{"section_segments":6,"offset":{"x":51,"y":-35,"z":0},"position":{"x":[-33,-25,5,20,25,20,20,20,0,0,0,-50],"y":[-105,-100,-70,-40,-10,20,20,20,48,48,48,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,19,19,15,0,0,0,0,15,14],"height":[0,5,15,16,15,15,0,0,0,0,13,0],"texture":[63,10,18,8,18,3.9,1,1,1,3.9,18]},"claw_joint":{"section_segments":[45,135,225,315],"offset":{"x":82,"y":20,"z":0},"position":{"x":[29,29,4,4],"y":[0,0,35,35],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,8,8,0],"texture":[17],"angle":180},"claw_joint2":{"section_segments":[45,135,225,315],"offset":{"x":65,"y":20,"z":0},"position":{"x":[28,28,4,4],"y":[0,0,35,35],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,8,8,0],"texture":[17],"angle":180},"claws_color":{"section_segments":6,"offset":{"x":47,"y":-35,"z":0},"position":{"x":[-27.5,-21,5,20,25,20,20,20,0,-50],"y":[-100,-95,-70,-40,-10,20,20,48,48,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,15,19,19,15,0,0,15,12],"height":[0,2,2,2,2,2,0,0,2,0],"texture":[63,63,63,63,63,4,4,4,63]},"cannon":{"section_segments":6,"offset":{"x":0,"y":40,"z":-30},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-70,-70,-20,0,20,30],"z":[0,0,0,0,0,0,20]},"width":[0,4,5,8,8,7,5],"height":[0,4,5,8,8,10,5],"texture":[16.9,16.9,10,1,1],"laser":{"damage":[11,11],"rate":0.8,"type":1,"speed":[170,170],"number":9,"recoil":30}},"side_cannons":{"section_segments":6,"offset":{"x":75,"y":-60,"z":-18},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,-10,10,20,30],"z":[0,0,0,0,0,20]},"width":[0,2,3,4,4,3],"height":[0,2,3,4,4,3],"texture":[16.9,16.9,10,1,1],"laser":{"damage":[3,3],"rate":1,"type":2,"speed":[160,200],"number":2,"angle":5,"error":0}},"tri_deco":{"section_segments":[20,30,40,140,150,160,300,310,320],"offset":{"x":0,"y":0,"z":-25},"position":{"x":[55,55,55,55,55,55,55,55,55,55],"y":[-13.636363636363635,-13.636363636363635,-13.636363636363635,-13.636363636363635,0,13.636363636363635,13.636363636363635,13.636363636363635,13.636363636363635],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,15,0],"propeller":false,"texture":[2.9,3,3,4,4,3,3,3],"vertical":true},"tri_deco2":{"section_segments":[20,30,40,140,150,160,300,310,320],"offset":{"x":0,"y":0,"z":-25},"position":{"x":[55,55,55,55,55,55,55,55,55,55],"y":[-13.636363636363635,-13.636363636363635,-13.636363636363635,-13.636363636363635,0,13.636363636363635,13.636363636363635,13.636363636363635,13.636363636363635],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,15,0],"propeller":false,"texture":[2.9,3,3,4,4,3,3,3],"vertical":true,"angle":180},"disc2":{"section_segments":18,"offset":{"x":53,"y":13,"z":-22},"position":{"x":[0,0,0,0],"y":[0,0,2,2],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,5,5,0],"texture":[[15]],"vertical":true},"cannon_ring0":{"section_segments":6,"offset":{"x":0,"y":-25,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5,6,6,5,5],"height":[5,6,6,5,5],"texture":[17]},"cannon_ring1":{"section_segments":6,"offset":{"x":0,"y":-19,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.5,6.5,6.5,5.5,5.5],"height":[5.5,6.5,6.5,5.5,5.5],"texture":[17]},"cannon_ring2":{"section_segments":6,"offset":{"x":0,"y":-13,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[6,7,7,6,6],"height":[6,7,7,6,6],"texture":[17]},"cannon_ring3":{"section_segments":6,"offset":{"x":0,"y":-7,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[6.5,7.5,7.5,6.5,6.5],"height":[6.5,7.5,7.5,6.5,6.5],"texture":[17]},"cannon_ring4":{"section_segments":6,"offset":{"x":0,"y":-1,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[7,8,8,7,7],"height":[7,8,8,7,7],"texture":[17]},"cannon_ring5":{"section_segments":6,"offset":{"x":0,"y":5,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[7.5,8.5,8.5,7.5,7.5],"height":[7.5,8.5,8.5,7.5,7.5],"texture":[17]},"cannon_ring6":{"section_segments":6,"offset":{"x":0,"y":11,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[8,9,9,8,8],"height":[8,9,9,8,8],"texture":[17]},"cannon_ring7":{"section_segments":6,"offset":{"x":0,"y":17,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[8.5,9.5,9.5,8.5,8.5],"height":[8.5,9.5,9.5,8.5,8.5],"texture":[17]},"cannon_ring8":{"section_segments":6,"offset":{"x":0,"y":23,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[9,10,10,9,9],"height":[9,10,10,9,9],"texture":[17]},"cannon_ring9":{"section_segments":6,"offset":{"x":0,"y":29,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[9.5,10.5,10.5,9.5,9.5],"height":[9.5,10.5,10.5,9.5,9.5],"texture":[17]},"cannon_ring10":{"section_segments":6,"offset":{"x":0,"y":35,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[10,11,11,10,10],"height":[10,11,11,10,10],"texture":[17]},"cannon_ring11":{"section_segments":6,"offset":{"x":0,"y":41,"z":-30},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[10.5,11.5,11.5,10.5,10.5],"height":[10.5,11.5,11.5,10.5,10.5],"texture":[17]},"body_joint0":{"section_segments":6,"offset":{"x":16,"y":53,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]},"body_joint1":{"section_segments":6,"offset":{"x":16.5,"y":68,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]},"body_joint2":{"section_segments":6,"offset":{"x":17,"y":83,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]},"body_joint3":{"section_segments":6,"offset":{"x":17.5,"y":98,"z":1},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3,3,5,5],"z":[0,0,0,0,0,0]},"width":[0,6,6,6,6,0],"height":[0,6,6,6,6,0],"texture":[16.9,16.9,63]}},"wings":{"side":{"doubleside":true,"offset":{"x":80,"y":-35,"z":0},"length":[50],"width":[53,10],"angle":[-5],"position":[-20,0],"texture":[3],"bump":{"position":30,"size":5}},"side2":{"doubleside":true,"offset":{"x":80,"y":-35,"z":0},"length":[52],"width":[58,12],"angle":[-5],"position":[-20,0],"texture":[17],"bump":{"position":30,"size":0}},"side3":{"doubleside":true,"offset":{"x":80,"y":-32.2,"z":1.8},"length":[50],"width":[23.6,10],"angle":[-5],"position":[-4.5,-3],"texture":[18],"bump":{"position":20,"size":5}},"back":{"doubleside":true,"offset":{"x":0,"y":105,"z":-1},"length":[90],"width":[80,10],"angle":[0],"position":[-35,0],"texture":[18],"bump":{"position":30,"size":5}},"back2":{"doubleside":true,"offset":{"x":0,"y":104,"z":-1},"length":[92],"width":[82,12],"angle":[0],"position":[-35,0],"texture":[17],"bump":{"position":40,"size":0}},"back3":{"doubleside":true,"offset":{"x":0,"y":106,"z":-0.1},"length":[75],"width":[66.66666666666667,8.333333333333334],"angle":[0],"position":[-29.166666666666668,0],"texture":[[15.8]],"bump":{"position":30,"size":7}},"back4":{"doubleside":true,"offset":{"x":0,"y":106,"z":1.3},"length":[56.25],"width":[50,6.25],"angle":[0],"position":[-21.875,0],"texture":[18],"bump":{"position":30,"size":9}},"top":{"doubleside":true,"offset":{"x":17,"y":90,"z":0},"length":[0,-8.4,-3.5999999999999996,-1.2,-14.399999999999999,-3.5999999999999996,0],"width":[0,26,26,78,78,52,13,0],"angle":[280,280,255,315,325,350,0],"position":[0,0,0,-20,-20,-8.125,8.125,8.125],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":17,"y":92,"z":0},"length":[0,-8.4,-3.5999999999999996,-1.2,-14.399999999999999,-3.5999999999999996,0],"width":[0,26,26,78,78,52,13,0],"angle":[280,280,255,315,325,350,0],"position":[0,0,0,-20,-20,-8.125,8.125,8.125],"texture":[63,63,63,17,4,17,63],"bump":{"position":30,"size":-4}}},"typespec":{"name":"Goliath","level":1,"model":4,"code":104,"specs":{"shield":{"capacity":[645,645],"reload":[8,8]},"generator":{"capacity":[140,140],"reload":[72,72]},"ship":{"mass":390,"speed":[110,110],"rotation":[75,75],"acceleration":[135,135]}},"shape":[0.751,3.529,3.479,3.328,3.208,3.145,3.003,2.985,3.104,3.295,3.451,3.402,1.96,1.77,1.86,1.842,1.711,1.623,1.566,3.585,3.556,3.26,3.043,2.892,2.906,2.881,2.906,2.892,3.043,3.26,3.556,3.585,1.566,1.623,1.711,1.842,1.86,1.77,1.96,3.402,3.451,3.295,3.104,2.985,3.003,3.145,3.208,3.328,3.479,3.529],"lasers":[{"x":0,"y":-0.75,"z":-0.75,"angle":0,"damage":[11,11],"rate":0.8,"type":1,"speed":[170,170],"number":9,"spread":0,"error":0,"recoil":30},{"x":1.875,"y":-1.75,"z":-0.45,"angle":0,"damage":[3,3],"rate":1,"type":2,"speed":[160,200],"number":2,"spread":5,"error":0,"recoil":0},{"x":-1.875,"y":-1.75,"z":-0.45,"angle":0,"damage":[3,3],"rate":1,"type":2,"speed":[160,200],"number":2,"spread":5,"error":0,"recoil":0}],"radius":3.585}}',
                    '{"name":"Romulus","level":1,"model":5,"size":1.32,"specs":{"shield":{"capacity":[560,560],"reload":[5,6]},"generator":{"capacity":[80,123],"reload":[73,73]},"ship":{"mass":260,"speed":[128,128],"rotation":[69,69],"acceleration":[105,105]}},"bodies":{"ring":{"section_segments":8,"offset":{"x":10,"y":-64,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[4,4,63],"angle":0},"ring2":{"section_segments":8,"offset":{"x":11.7,"y":-54,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8.5,9,9.5,9.75,9.5,9,8.5,8,7.5,7.25,7.5,8,8.5],"vertical":0,"texture":[4,4,63],"angle":0},"ring3":{"section_segments":8,"offset":{"x":13.5,"y":-44,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[9,9.5,10,10.25,10,9.5,9,8.5,8,7.75,8,8.5,9],"vertical":0,"texture":[4,4,63],"angle":0},"ring4":{"section_segments":8,"offset":{"x":15.8,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[9.5,10,10.5,10.75,10.5,10,9.5,9,8.5,8.25,8.5,9,9.5],"vertical":0,"texture":[4,4,63],"angle":0},"ring7":{"section_segments":8,"offset":{"x":10,"y":42,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"vertical":0,"texture":[4,4,17,17,4,4],"angle":0},"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-124,-96,-98,-60,8,65,68,80,80,70],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.4,4.4,12,27,24,24,22,21,0],"height":[0,2.4,4.4,11,16,16,16,14,13,0],"texture":[6,17,63,10,2,17,13,17],"propeller":true,"laser":{"damage":[120,120],"rate":1,"type":1,"speed":[100,100],"recoil":250,"number":1,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":4,"z":11},"position":{"x":[0,0,0,0,0,0],"y":[-36,-34,-15,4,12,16],"z":[0,0,0,0,0,0]},"width":[0,6,12,12,8,0],"height":[0,6,12,12,8,0],"texture":[7,9,9,4]},"shield":{"section_segments":[0,60,120,180],"offset":{"x":-8,"y":-5,"z":15},"position":{"x":[6,6,0,0,0.5,0.5],"y":[-30,-30,-6,13,30,30],"z":[-3.5,-3.5,0,0,-8,-8]},"width":[0,3,10,10,9,0],"height":[0,4,5,5,4,0],"texture":[16.9,3.9,18,63,3.9]},"cannons":{"section_segments":6,"offset":{"x":63.2,"y":44,"z":-9.6},"position":{"x":[0,0,0,0,0,0,0,2.4,4],"y":[-36,-44,-44,-16,0,24,45.6,49.6,52.8],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3.2,4,4.8,4.8,4.8,4.8,2.4,0],"height":[0,2.4,3.2,4.8,5.6,5.6,3.2,2.4,0],"texture":[16.9,16.9,4,10,18],"laser":{"damage":[4,6.5],"rate":7,"type":2,"speed":[110,175],"number":1,"error":1}},"cannons2":{"section_segments":6,"offset":{"x":63.3,"y":44,"z":-9.6},"position":{"x":[0,0,0,0,0,0,0,2.4,4],"y":[-36,-44,-44,-16,0,24,45.6,49.6,52.8],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3.2,4,4.8,4.8,4.8,4.8,2.4,0],"height":[0,2.4,3.2,4.8,5.6,5.6,3.2,2.4,0],"texture":[16.9,16.9,11,10,18]},"propellers":{"section_segments":12,"offset":{"x":24.8,"y":-40,"z":-11.44},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[53.6,56,80,96,100,108,108,98],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2.4,6.4,6.4,6,4.6,3.8,0],"height":[0,1.6,8,9.6,9.2,7.8,7,0],"texture":[4,10,1,11,12,17],"propeller":true},"lights":{"section_segments":6,"offset":{"x":0,"y":-15,"z":10},"position":{"x":[0,0,0,0],"y":[-10,-10,65,65],"z":[0,3.6,-1.8,0]},"width":[0,4,3,0],"height":[0,3,3,0],"texture":[17],"angle":180},"reactor":{"section_segments":6,"offset":{"x":0,"y":0,"z":-26.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,11,22,22,20,20,20],"z":[0,0,0,-4,-4,-4,-4,-4]},"width":[0,21.126760563380284,21.126760563380284,9.15492957746479,7.042253521126761,7.042253521126761,5.633802816901409,0],"height":[0,22.22222222222222,22.22222222222222,10,7.777777777777778,8.333333333333334,6.666666666666666,0],"texture":[2.9,2.9,10.6,16.92,3.9,3,16.92],"vertical":true},"reactor2":{"section_segments":6,"offset":{"x":0,"y":0,"z":-26.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-10,-10,11,22,22.1,20.1,20,20],"z":[0,0,0,-4,-4,-4,-4,-4]},"width":[0,20.97902097902098,20.97902097902098,9.090909090909092,7.6923076923076925,6.993006993006993,5.594405594405595,0],"height":[0,23.529411764705884,23.529411764705884,10.588235294117647,8.647058823529411,8.823529411764707,7.0588235294117645,0],"texture":[2.9,2.9,18,17.92,3.9,63,16.92],"vertical":true},"bar":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":7.5,"z":-29},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,2,2,2,0],"height":[0,10,10,8,0],"texture":[63,17,63],"angle":50,"vertical":true},"hexagon":{"section_segments":6,"offset":{"x":15,"y":0,"z":11.4},"position":{"x":[0,0,0,0,0],"y":[0,0,2.5,2.5,0],"z":[0,0,0,0,0]},"width":[5.4,7.2,7.2,5.4,5.4],"height":[6,8,8,6,6],"texture":[17]},"hexagon2":{"section_segments":6,"offset":{"x":15,"y":-5.5,"z":11.4},"position":{"x":[0,0,0,0,0],"y":[0,0,2.5,2.5,0],"z":[0,0,0,0,0]},"width":[5.4,7.2,7.2,5.4,5.4],"height":[6,8,8,6,6],"texture":[17]},"cannon_ring2":{"section_segments":6,"offset":{"x":64,"y":34,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4,5,5,4,4],"height":[4,5,5,4,4],"texture":[17]},"cannon_ring2.5":{"section_segments":6,"offset":{"x":64,"y":40,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4.25,5.25,5.25,4.25,4.25],"height":[4.25,5.25,5.25,4.25,4.25],"texture":[17]},"cannon_ring3":{"section_segments":6,"offset":{"x":64,"y":46,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4.5,5.5,5.5,4.5,4.5],"height":[4.5,5.5,5.5,4.5,4.5],"texture":[17]},"cannon_ring3.5":{"section_segments":6,"offset":{"x":64,"y":52,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[4.75,5.75,5.75,4.75,4.75],"height":[4.75,5.75,5.75,4.75,4.75],"texture":[17]},"cannon_ring4":{"section_segments":6,"offset":{"x":64,"y":58,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5,6,6,5,5],"height":[5,6,6,5,5],"texture":[17]},"cannon_ring4.5":{"section_segments":6,"offset":{"x":64,"y":64,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.25,6.25,6.25,5.25,5.25],"height":[5.25,6.25,6.25,5.25,5.25],"texture":[17]},"cannon_ring5":{"section_segments":6,"offset":{"x":64,"y":70,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.5,6.5,6.5,5.5,5.5],"height":[5.5,6.5,6.5,5.5,5.5],"texture":[17]},"cannon_ring5.5":{"section_segments":6,"offset":{"x":64,"y":76,"z":-8.5},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[5.75,6.75,6.75,5.75,5.75],"height":[5.75,6.75,6.75,5.75,5.75],"texture":[17]},"spike0":{"section_segments":6,"offset":{"x":0,"y":-138,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[1,2,2,1,1],"height":[1,2,2,1,1],"texture":[17]},"spike1":{"section_segments":6,"offset":{"x":0,"y":-132,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[1.5,2.5,2.5,1.5,1.5],"height":[1.5,2.5,2.5,1.5,1.5],"texture":[17]},"spike2":{"section_segments":6,"offset":{"x":0,"y":-126,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[2,3,3,2,2],"height":[2,3,3,2,2],"texture":[17]},"spike3":{"section_segments":6,"offset":{"x":0,"y":-120,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,2,2,0],"z":[0,0,0,0,0]},"width":[2.5,3.5,3.5,2.5,2.5],"height":[2.5,3.5,3.5,2.5,2.5],"texture":[17]}},"wings":{"main":{"doubleside":true,"offset":{"x":12,"y":6.4,"z":0},"length":[72],"width":[72,48],"angle":[-10],"position":[8,80],"texture":[11],"bump":{"position":10,"size":10}},"mainw":{"doubleside":true,"offset":{"x":12,"y":7.4,"z":0},"length":[72],"width":[72,48],"angle":[-10],"position":[8,80],"texture":[18],"bump":{"position":0,"size":11}},"main_lights":{"doubleside":true,"offset":{"x":12,"y":3.4,"z":0},"length":[72],"width":[72,48],"angle":[-10],"position":[8,80],"texture":[17],"bump":{"position":10,"size":0}},"top":{"doubleside":true,"offset":{"x":12,"y":24.8,"z":4},"length":[64],"width":[56,24],"angle":[15],"position":[0,60],"texture":[63],"bump":{"position":10,"size":10}},"top_lights":{"doubleside":true,"offset":{"x":12,"y":21,"z":4},"length":[66],"width":[56,25],"angle":[15],"position":[0,64],"texture":[17],"bump":{"position":10,"size":0}},"winglets":{"doubleside":true,"offset":{"x":67.2,"y":46.4,"z":-9.6},"length":[0,16],"width":[0,120,48],"angle":[-10,-10],"position":[-8.8,-8.8,40],"texture":[17,63],"bump":{"position":40,"size":7}},"winglets_lights":{"doubleside":true,"offset":{"x":67.2,"y":46.4,"z":-9.6},"length":[0,17.5],"width":[0,121,48],"angle":[-10,-10],"position":[-8.8,-8.8,40],"texture":[4,17],"bump":{"position":40,"size":0}}},"typespec":{"name":"Romulus","level":1,"model":5,"code":105,"specs":{"shield":{"capacity":[560,560],"reload":[5,6]},"generator":{"capacity":[80,123],"reload":[73,73]},"ship":{"mass":260,"speed":[128,128],"rotation":[69,69],"acceleration":[105,105]}},"shape":[3.802,2.81,1.931,1.545,1.285,1.107,0.959,0.887,0.829,0.793,1.874,1.863,1.892,1.956,2.058,2.216,2.421,2.738,3.056,3.491,3.669,2.767,1.987,1.888,1.613,1.587,1.613,1.888,1.987,2.767,3.669,3.491,3.056,2.738,2.421,2.216,2.058,1.956,1.892,1.863,1.874,0.793,0.829,0.887,0.959,1.107,1.285,1.545,1.931,2.81],"lasers":[{"x":0,"y":-3.802,"z":0,"angle":0,"damage":[120,120],"rate":1,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":250},{"x":1.668,"y":0,"z":-0.253,"angle":0,"damage":[4,6.5],"rate":7,"type":2,"speed":[110,175],"number":1,"spread":0,"error":1,"recoil":0},{"x":-1.668,"y":0,"z":-0.253,"angle":0,"damage":[4,6.5],"rate":7,"type":2,"speed":[110,175],"number":1,"spread":0,"error":1,"recoil":0}],"radius":3.802}}',
                    '{"name":"Ulysses","level":1,"model":6,"size":1.22,"specs":{"shield":{"capacity":[160,480],"reload":[4,4]},"generator":{"capacity":[30,145],"reload":[71,71]},"ship":{"mass":140,"speed":[100,140],"rotation":[50,85],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":[10,15,20,140,160,180,200,220,340,345,350],"offset":{"x":0,"y":-50,"z":-1},"position":{"x":[0,0,0,0,0,0,0],"y":[-72,-70,-40,20,80,135,135],"z":[0,0,0,4,4,4,4]},"width":[0,3,10,20,20,20,0],"height":[0,1,4,7,7,7,0],"texture":[2.8,3.8,2.8,3.8,3.8]},"main2":{"section_segments":[90,140,180,220,270,360],"offset":{"x":0,"y":-50,"z":1.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-72,-70,-40,20,80,140,140],"z":[-3,-3,-5.5,-4,-4,-4,-4]},"width":[0,1.875,6.25,12.5,12.5,12.5,0],"height":[0,1,4,7,7,7,0],"texture":[3,4,3,4,4]},"detail17":{"section_segments":12,"offset":{"x":100,"y":39,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[0,-3,-5,3,5,10,10],"z":[0,0,0,0,0,0,0]},"width":[0,3.5,4,4,5,4,0],"height":[0,3.5,4,4,5,4,0],"texture":[17,2,2,63],"angle":2,"laser":{"damage":[13,13],"rate":4.7,"type":2,"speed":[140,180],"number":1,"angle":2,"recoil":10,"error":0}},"detail1":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":-35,"z":2.37},"position":{"x":[0,-0.3,0,3,0],"y":[-55,-55,-50,5,0],"z":[0,0,0.5,6.75,0]},"width":[0,0.5,0.9,0.9,0],"height":[0,1,1,1,0],"texture":[63]},"detail2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-23,"z":2.9},"position":{"x":[0,0,0],"y":[-30,-7,-7],"z":[-2.6,0,0]},"width":[0.01,9.7,0],"height":[10,10,0],"texture":[4]},"detail3":{"section_segments":12,"offset":{"x":7,"y":-41,"z":3.5},"position":{"x":[0,0,0,-0.2,0],"y":[-15,-15,-14,5,5],"z":[0,0,0,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,1.5,1.5,1.5,0],"texture":[4,63,2],"angle":-2,"laser":{"damage":[40,40],"rate":1.2,"type":2,"speed":[140,160],"number":1,"angle":0,"error":1}},"detail4":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-18,"z":4},"position":{"x":[0,0,0,0,0],"y":[-28,-12,-12,45,45],"z":[-2.3,-0.4,-0.4,6.4,0.4]},"width":[0.01,7.7,8.7,8.7,0],"height":[10,10,10,0],"texture":[3]},"detail5":{"section_segments":6,"offset":{"x":0,"y":-35,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[4,16,32,52,60,60,64],"z":[2.12,2.8,3,2,2,2,0]},"width":[1.2,4,4.8,4.8,4.8,4.8,0],"height":[0,4,6,6,6,6,0],"texture":[9,9,4]},"detail6":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":18,"z":7.600000000000001},"position":{"x":[2,2,6.5,0,0],"y":[-25,-25,-20,-7,-7],"z":[0,0,0,0,0]},"width":[0,1,1,1,0],"height":[0,30,30,30,0],"texture":[4],"vertical":true},"detail7":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":18,"z":29.5},"position":{"x":[2,2,6.5,0,0],"y":[-25,-25,-20,-7,-7],"z":[0,0,0,0,0]},"width":[0,1,1,1,0],"height":[0,1,1,1,0],"texture":[63],"vertical":true},"detail8":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,50,50,45,15,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,18.2,2],"angle":90},"detail85":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.1},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,33.333333333333336,33.333333333333336,30,10,0],"height":[0,1,1,1,1,0],"texture":[1,18,63],"angle":90},"detail852":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.2},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,20,20,18,6,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,18.2,1],"angle":90},"detail88":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.3},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,8.333333333333334,8.333333333333334,7.5,2.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,63],"angle":90},"detail881":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":9.35},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,1.6666666666666667,1.6666666666666667,1.5,0.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,17],"angle":90},"detail882":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":43,"z":9.35},"position":{"x":[12,12,12.5,6,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,1.6666666666666667,1.6666666666666667,1.5,0.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,17],"angle":90},"detail883":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":80,"z":9.35},"position":{"x":[12,12,12.5,9,10,10],"y":[-30,-30,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,1.6666666666666667,1.6666666666666667,1.5,0.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,17],"angle":90},"detail9":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":-9},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[2,2,-5,-7,9,9]},"width":[0,50,50,45,15,0],"height":[0,1,1,1,1,0],"texture":[1,18,4,18.2,2],"angle":90},"detail95":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":49,"z":-8.5},"position":{"x":[0,0,0,-5,-15,-15],"y":[-30,-30,-10,10,60,60],"z":[2,2,-5,-7,9,9]},"width":[0,25,25,22.5,7.5,0],"height":[0,1,1,1,1,0],"texture":[1,18,63],"angle":90},"detail10":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":41,"z":9},"position":{"x":[26,26,26,18,-13,-13],"y":[-31,-31,-10,10,60,60],"z":[0,0,2,12,-9,-9]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail11":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":61,"z":9},"position":{"x":[-22,-22,-22,-24,-13,-13],"y":[-30,-30,-10,10,58,58],"z":[0,0,2,12,-8,-8]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail12":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":41,"z":-9},"position":{"x":[26,26,26,18,-13,-13],"y":[-30,-30,-10,10,60,60],"z":[0,2,-5,-7,9,9]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail13":{"section_segments":[45,135,225,315],"offset":{"x":36.8,"y":61,"z":-9},"position":{"x":[-22,-22,-22,-24,-13,-13],"y":[-30,-30,-10,10,58,58],"z":[0,2,-5,-7,8,8]},"width":[0,2,2,2,2,0],"height":[0,2,2,2,2,0],"texture":[[15]],"angle":90},"detail14":{"section_segments":12,"offset":{"x":0,"y":96.6,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-15,-9,-7,-5,-4,-3,-1,0,1,3,4,10,10,5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,13,13,11,11,13,11,11,13,11,11,13,13,11,0],"height":[0,13,13,11,11,13,11,11,13,11,11,13,13,11,0],"texture":[4,4,4,7,[15],[15],7,[15],[15],7,4,4,17],"propeller":true},"detail15":{"section_segments":[15,65,115,165,195,245,295,345],"offset":{"x":100,"y":63,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-17,-17,-15,15,17,17,7],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,10,10,8,0],"height":[0,18,18,18,18,16,0],"texture":[[15],63,3,63,16.94],"propeller":true},"detail16":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":100,"y":44.900000000000006,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,0,1],"z":[0,0,0,0]},"width":[8,6.5,6.5,8],"height":[8,6.5,6.5,8],"texture":[2]},"detail18":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":65,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-25,-25,-8,18,20,20],"z":[-5,-5,0,0,0,0]},"width":[0,11,11,11,11,0],"height":[0,0.1,12,12,12,0],"texture":[3,3,3,63,17.99]},"detail19":{"section_segments":12,"offset":{"x":19.5,"y":80,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-10,6,11,13,13,6.5],"z":[0,0,0,0,0,0,0]},"width":[0,7,7,9,9,8,0],"height":[0,9,9,11,9,8,0],"texture":[7,7,3,7,16.99,16.99],"propeller":true},"detail20":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":40,"z":11},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-10,-8,20],"z":[0,0,0,0,0]},"width":[0,7,8,8,8],"height":[0,2,3,3,3],"texture":[5,2,63,2]},"detail21":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":92,"z":23},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,0,5,10,10],"z":[0,0,5,6,5,5]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail21_5":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":92,"z":23},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,0,5,10,10],"z":[0,0,5,6,5,5]},"width":[0,2.8,2.8,2.8,1.0499999999999998,0],"height":[0,0.5,0.5,0.5,0.5,0],"texture":[17]},"detail22":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":92,"z":15.2},"position":{"x":[0,0,5,6,5,5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail22_5":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":92,"z":15.2},"position":{"x":[0,0,5,6,5,5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2.8,2.8,2.8,1.0499999999999998,0],"height":[0,0.5,0.5,0.5,0.5,0],"texture":[17]},"detail23":{"section_segments":[45,135,225,315],"offset":{"x":14,"y":92,"z":15.2},"position":{"x":[0,0,-5,-6,-5,-5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail23_5":{"section_segments":[45,135,225,315],"offset":{"x":14,"y":92,"z":15.2},"position":{"x":[0,0,-5,-6,-5,-5],"y":[-5,-5,0,5,10,10],"z":[0,0,0,0,0,0]},"width":[0,2.8,2.8,2.8,1.0499999999999998,0],"height":[0,0.5,0.5,0.5,0.5,0],"texture":[17]},"detail24":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":92,"z":7},"position":{"x":[0,0,0,0,0,0],"y":[-5,-5,0,5,10,10],"z":[0,0,-5,-6,-5,-5]},"width":[0,2,2,2,0.75,0],"height":[0,1,1,1,1,0],"texture":[63,63,4,3]},"detail29":{"section_segments":[45,135,225,315],"offset":{"x":19.5,"y":14,"z":-70},"position":{"x":[0,0,0,0,0],"y":[0,0,13.333333333333334,12.333333333333334,12.333333333333334],"z":[0,0,0,0,0]},"width":[0,10,3.3333333333333335,0.6666666666666666,0],"height":[0,20,16,5.333333333333334,0],"angle":0,"vertical":true,"texture":[17,4,16.93]},"disc":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":76,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":65,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":70.5,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc3_5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":19.5,"y":59.5,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.75,3.75,0.5,0.5,0.5,1,3,3.75,3.75,3.75],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10.5,10.5,10.5,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,12.600000000000001,10.5,10.5],"height":[8,8,8,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,9.600000000000001,8,8],"texture":[4,4,4,4,4,17,4,4]},"disc4":{"section_segments":[20,40,60,120,140,160,180,200,220,240,260,280,300,320,340,360],"offset":{"x":9,"y":4.5,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":60},"disc5":{"section_segments":[20,40,60,120,140,160,180,200,220,240,260,280,300,320,340,360],"offset":{"x":9,"y":4.5,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":60},"disc6":{"section_segments":6,"offset":{"x":1,"y":9,"z":-41.599999999999994},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[5.555555555555555,5.555555555555555,5.555555555555555,6.666666666666666,6.666666666666666,6.666666666666666,6.666666666666666,6.666666666666666,5.555555555555555,5.555555555555555],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":90},"disc7":{"section_segments":10,"offset":{"x":-1,"y":36,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":false,"angle":135},"disc8":{"section_segments":6,"offset":{"x":0.9,"y":9,"z":-29},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":90},"disc9":{"section_segments":6,"offset":{"x":0.01,"y":48.3,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[2.5,2.5,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.6666666666666666,2,2.5,2.5,2.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":false,"angle":70},"disc10":{"section_segments":6,"offset":{"x":0,"y":9,"z":-65},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.32,1.32,-1.0633333333333335,-1.0633333333333335,-1.0633333333333335,-0.6966666666666668,0.77,1.32,1.32,1.32],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[3.3333333333333335,3.3333333333333335,3.3333333333333335,4,4,4,4,4,3.3333333333333335,3.3333333333333335],"height":[17.500000000000004,17.500000000000004,17.500000000000004,21,21,21,21,21,17.500000000000004,17.500000000000004],"texture":[4,16.8,4,4,4,16.8,3.8,4],"vertical":true,"angle":90},"disc11":{"section_segments":20,"offset":{"x":99,"y":59.5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[6.25,6.25,6.25,7.5,7.5,7.5,7.5,7.5,6.25,6.25],"height":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"texture":[4,4,4,4,4,17,4,4]},"disc12":{"section_segments":20,"offset":{"x":99,"y":63.5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[6.25,6.25,6.25,7.5,7.5,7.5,7.5,7.5,6.25,6.25],"height":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"texture":[4,4,4,4,4,17,4,4]},"disc13":{"section_segments":[15,65,115,165,195,245,295,345],"offset":{"x":100,"y":72,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"height":[15.384615384615383,15.384615384615383,15.384615384615383,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,15.384615384615383,15.384615384615383],"texture":[17,17.87,17,17,17,17.87,17,17]},"disc14":{"section_segments":[15,65,115,165,195,245,295,345],"offset":{"x":100,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[3,3,0.4,0.4,0.4,0.8,2.4,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[9.09090909090909,9.09090909090909,9.09090909090909,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,10.909090909090908,9.09090909090909,9.09090909090909],"height":[15.384615384615383,15.384615384615383,15.384615384615383,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,18.46153846153846,15.384615384615383,15.384615384615383],"texture":[17,17.87,17,17,17,17.87,17,17]},"rod":{"section_segments":[65,155,245,335],"offset":{"x":10.5,"y":-10,"z":5.5},"position":{"x":[0,0,0,0,0.2,0.5,0,0,0,0.5,0.2,0,0,0,0],"y":[-10,-10,-8.5,-7,-5,-4,-2,0,2,4,5,7,8.5,10,10],"z":[0,0,0,0,-0.5,-1,0,0,0,-1,-0.5,0,0,0,0]},"width":[0,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0],"height":[0,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0],"texture":[4]},"circ":{"section_segments":30,"offset":{"x":4.5,"y":2,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,8,8,8,8,8],"z":[0,0,0,0,0,0,0]},"width":[0,2.4,2.4,1.8,0.4,0],"height":[0,2.4,2.4,1.8,0.4,0],"angle":60,"vertical":true,"texture":[17,4,16.93,17.93]},"circ2":{"section_segments":30,"offset":{"x":4.5,"y":2,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,8,8,8,8,8],"z":[0,0,0,0,0,0,0]},"width":[0,2.4,2.4,1.8,0.4,0],"height":[0,2.4,2.4,1.8,0.4,0],"angle":60,"vertical":true,"texture":[17,4,16.93,17.93]},"circ3":{"section_segments":30,"offset":{"x":4.5,"y":2,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[0,0,8,8,8,8,8],"z":[0,0,0,0,0,0,0]},"width":[0,2.4,2.4,1.8,0.4,0],"height":[0,2.4,2.4,1.8,0.4,0],"angle":60,"vertical":true,"texture":[17,4,16.93,17.93]},"hub":{"section_segments":20,"offset":{"x":0,"y":10,"z":-70},"position":{"x":[0,0,0,0,0,0,0],"y":[0,5,2.5,2.5,5,3],"z":[0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,0],"height":[9,7.5,6.5,6,5,0],"texture":[18,17,17,18,18],"vertical":true},"hub2":{"section_segments":20,"offset":{"x":106,"y":10,"z":-63},"position":{"x":[0,0,0,0,0,0,0],"y":[0,3.3333333333333335,1.6666666666666667,1.6666666666666667,3.3333333333333335,2],"z":[0,0,0,0,0,0,0]},"width":[6,5,4.333333333333333,4,3.3333333333333335,0],"height":[6,5,4.333333333333333,4,3.3333333333333335,0],"texture":[18,17,17,18,18],"vertical":true,"angle":55},"bar":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":4,"y":20,"z":10},"position":{"x":[4,4,4,4,2,2,0,0,0],"y":[-4,-4,0,18,22,30,35,60,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,2.5,2.5,2.5,2.5,2.5,2.5,0],"height":[0,0.5,2.5,2.5,2.5,2.5,2.5,2.5,0],"texture":[18.17,17,18.17,4,18.17,17,4]},"bar2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0.001,"y":20,"z":10},"position":{"x":[4,4,3,3,2,2,0,0,0],"y":[-4,-4,0,18,22,30,35,50,50],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2.598,4.5465,4.5465,3.2474999999999996,3.2474999999999996,3.2474999999999996,3.2474999999999996,0],"height":[0,0.25,1.25,1.25,1.25,1.25,1.25,1.25,0],"texture":[[15]]},"bar3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":107,"y":47.5,"z":0},"position":{"x":[0,0,0,0,1.5,0],"y":[0,0,7.692307692307692,23.076923076923077,30.769230769230766,30.769230769230766],"z":[0,0,0,0,0,0]},"width":[0,3,6,6,1,0],"height":[0,6,6,6,6,0],"texture":[8,8,4,8]},"bar4":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":109,"y":55.5,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,3.5714285714285716,10.714285714285715,14.285714285714286,14.285714285714286],"z":[0,0,0,0,0,0]},"width":[0,3,6,6,3,0],"height":[0,7,7,7,7,0],"texture":[3,3,17.95,3]},"engine_detail":{"section_segments":[45,135,225,315],"offset":{"x":17,"y":32,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,8,10,12,15,17,20,22,22],"z":[0,0,10,10,10,10,10,10,10]},"width":[0,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,0],"height":[0,2,2,2,2,2,2,2,2,0],"texture":[5,18.2,13,18,13,18,13,18]},"engine_detail2":{"section_segments":[45,135,225,315],"offset":{"x":22,"y":32,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,8,10,12,15,17,20,22,22],"z":[0,0,10,10,10,10,10,10,10]},"width":[0,1.5,1.5,1.5,1.5,1.5,1.5,1.5,1.5,0],"height":[0,2,2,2,2,2,2,2,2,0],"texture":[5,18.2,13,18,13,18,13,18]},"engine_shield1":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":45,"vertical":true},"engine_shield2":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":90,"vertical":true},"engine_shield3":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":135,"vertical":true},"engine_shield4":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":180,"vertical":true},"engine_shield5":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":225,"vertical":true},"engine_shield6":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":270,"vertical":true},"engine_shield7":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":315,"vertical":true},"engine_shield8":{"section_segments":[0,45,55,125,135,225,235,305,315],"offset":{"x":0,"y":0,"z":-104},"position":{"x":[0,0,0,0,0,0],"y":[10,10,15,15,15,16],"z":[0,0,0,-6,-6,-6]},"width":[-1,1,1,3,1.7000000000000002,-1],"height":[0,1,1,11,9.7,0],"texture":[17.8,17.8,[15],16.8,[15]],"angle":360,"vertical":true},"eqwe00":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":42,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe01":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":42,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe10":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":46,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe11":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":46,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe20":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":50,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe21":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":50,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe30":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":54,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe31":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":54,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140},"eqwe40":{"section_segments":[45,135,225,315],"offset":{"x":21.7,"y":58,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":140},"eqwe41":{"section_segments":[45,135,225,315],"offset":{"x":17.4,"y":58,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[1.3636363636363635,1.3636363636363635,0.18181818181818182,0.18181818181818182,0.18181818181818182,0.36363636363636365,1.0909090909090908,1.3636363636363635,1.3636363636363635,1.3636363636363635],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"height":[1.8181818181818181,1.8181818181818181,1.8181818181818181,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,2.1818181818181817,1.8181818181818181,1.8181818181818181],"texture":[4,4,4,4,4,17,4,4],"angle":-140}},"wings":{"main":{"doubleside":true,"offset":{"x":100,"y":75,"z":7},"length":[0,4],"width":[0,40,0],"angle":[90,90],"position":[0,-30,-10],"texture":[63],"bump":{"position":35,"size":20}},"main2":{"doubleside":true,"offset":{"x":100,"y":75,"z":-7},"length":[0,4],"width":[0,40,0],"angle":[-90,-90],"position":[0,-30,-10],"texture":[63],"bump":{"position":35,"size":20}},"main3":{"doubleside":true,"offset":{"x":100,"y":75,"z":7.01},"length":[0,3],"width":[0,42,0],"angle":[90,90],"position":[0,-30,-10],"texture":[17],"bump":{"position":35,"size":20}},"main4":{"doubleside":true,"offset":{"x":100,"y":75,"z":-7.1},"length":[0,0.2],"width":[0,44,0],"angle":[90,90],"position":[0,-30,-10],"texture":[17],"bump":{"position":35,"size":20}},"sides":{"length":[35],"width":[13,8],"angle":[130],"position":[0,30],"doubleside":true,"offset":{"x":92,"y":65,"z":5},"bump":{"position":10,"size":20},"texture":[3]},"sides2":{"length":[2],"width":[7.6,7],"angle":[130],"position":[0,0],"doubleside":true,"offset":{"x":70,"y":95,"z":31.7},"bump":{"position":0,"size":0},"texture":[63]},"sides3":{"length":[35],"width":[13,8],"angle":[-130],"position":[0,30],"doubleside":true,"offset":{"x":92,"y":65,"z":0},"bump":{"position":10,"size":20},"texture":[3]},"sides4":{"length":[2],"width":[7.8,6.5],"angle":[-130],"position":[0,0],"doubleside":true,"offset":{"x":69.4,"y":95,"z":-26},"bump":{"position":0,"size":0},"texture":[63]}},"typespec":{"name":"Ulysses","level":1,"model":6,"code":106,"specs":{"shield":{"capacity":[160,480],"reload":[4,4]},"generator":{"capacity":[30,145],"reload":[71,71]},"ship":{"mass":140,"speed":[100,140],"rotation":[50,85],"acceleration":[100,130]}},"shape":[2.977,2.281,1.327,0.941,0.814,0.64,0.539,0.472,0.426,0.393,0.372,0.356,0.349,0.349,2.533,2.732,3.171,3.289,3.3,2.895,2.954,2.448,2.536,2.599,2.897,2.874,2.897,2.599,2.536,2.448,2.954,2.895,3.3,3.289,3.171,2.732,2.533,0.349,0.349,0.356,0.372,0.393,0.426,0.472,0.539,0.64,0.814,0.941,1.327,2.281],"lasers":[{"x":2.436,"y":0.83,"z":0,"angle":2,"damage":[13,13],"rate":4.7,"type":2,"speed":[140,180],"number":1,"spread":2,"error":0,"recoil":10},{"x":-2.436,"y":0.83,"z":0,"angle":-2,"damage":[13,13],"rate":4.7,"type":2,"speed":[140,180],"number":1,"spread":2,"error":0,"recoil":10},{"x":0.184,"y":-1.366,"z":0.085,"angle":-2,"damage":[40,40],"rate":1.2,"type":2,"speed":[140,160],"number":1,"spread":0,"error":1,"recoil":0},{"x":-0.184,"y":-1.366,"z":0.085,"angle":2,"damage":[40,40],"rate":1.2,"type":2,"speed":[140,160],"number":1,"spread":0,"error":1,"recoil":0}],"radius":3.3}}',
                    '{"name":"Zirnitron","level":1,"model":7,"size":1,"specs":{"shield":{"capacity":[210,430],"reload":[6,6]},"generator":{"capacity":[100,145],"reload":[73,73]},"ship":{"mass":120,"speed":[148,148],"rotation":[60,60],"acceleration":[110,110]}},"bodies":{"main":{"section_segments":[30,60,120,150,210,240,300,330,360],"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-173,-172,-158,-125,70,120,125,125,115],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,1,6,13,18,23,17,16,0],"height":[0,1,9,13,18,18,13,12,0],"texture":[2,2,2,2,2,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-115,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,32,45],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9,9,9,4]},"engines":{"section_segments":18,"offset":{"x":19,"y":44,"z":-1.2},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-45,-45,0,25,50,52,43,43,49,48],"z":[2,2,1,0,0,0,3,3,3,3]},"width":[0,10,10,10,10,9,3,2,1,0],"height":[0,10,10,10,10,9,3,2,1,0],"texture":[3,3,3,3,3,13,17,13],"angle":182},"backengines":{"section_segments":18,"offset":{"x":20.5,"y":110,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-40,-30,20,25,25,15],"z":[0,0,0,0,0,0,0]},"width":[0,9,13,13,10,9,0],"height":[0,9,13,13,10,9,0],"propeller":true,"texture":[3,3,3,17,17]},"backengines2":{"section_segments":18,"offset":{"x":21,"y":110,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-40,-30,20,25,25,15],"z":[0,0,0,0,0,0,0]},"width":[0,9,13,13,10,9,0],"height":[0,9,13,13,10,9,0],"texture":[3,3,8,17,17]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[17,17],"rate":4,"recoil":30,"type":1,"speed":[170,190],"number":1}},"cannon2":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[7.5,7.5],"rate":10,"recoil":20,"type":1,"speed":[220,220],"number":1}},"cannon3":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[7.5,7.5],"rate":8,"recoil":20,"type":1,"speed":[240,240],"number":1}},"cannon4":{"section_segments":6,"offset":{"x":0,"y":-110,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[7.5,7.5],"rate":6,"recoil":20,"type":1,"speed":[200,200],"number":1}},"frontsupport":{"section_segments":6,"offset":{"x":1,"y":-61,"z":-7},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-20,-13,-9,-5,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,15,10,10,0,0],"height":[0,1,5,7,5,5,5,5,0],"angle":90,"texture":[17,11,1]},"topsupport":{"section_segments":[30,60,90,120,150,210,240,300,330,360],"offset":{"x":5,"y":-30,"z":10},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-8,-8,0,2,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,0,5,30,0,0,0,0,0],"height":[0,1,5,7,0,5,5,5,0],"angle":-90,"texture":[4]},"wingsRail":{"section_segments":12,"offset":{"x":38,"y":-20,"z":-2},"position":{"x":[-0.8,0,0,0.8],"y":[-20,-17,0.4,2],"z":[0,0,0,0]},"width":[0,1.5,1.5,0],"height":[0,1,1,0],"texture":[[15]]},"wingsRail2":{"section_segments":12,"offset":{"x":74,"y":97,"z":-18},"position":{"x":[-2,0,0,0,1],"y":[-34.5,-28,30,45,46],"z":[-4,-4,-1,-5,-5]},"width":[0,1.5,1.5,1.5,0],"height":[0,1,1,1,0],"texture":[[15]]},"lights":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":70,"z":12.4},"position":{"x":[0,0,0,0],"y":[-65,-65,150,150],"z":[6,6,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[17],"angle":180},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":70,"z":12.4},"position":{"x":[0,0,0,0],"y":[-65,-65,150,150],"z":[6,6,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[[15]],"angle":180},"lights3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":70,"z":12.4},"position":{"x":[0,0,0,0],"y":[-65,-65,150,150],"z":[6,6,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[18],"angle":180},"ring":{"section_segments":16,"offset":{"x":19.5,"y":65,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring2":{"section_segments":16,"offset":{"x":19,"y":55,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring3":{"section_segments":16,"offset":{"x":19,"y":45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring4":{"section_segments":16,"offset":{"x":18.6,"y":35,"z":-0.8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring5":{"section_segments":16,"offset":{"x":18,"y":25,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"height":[9,10,11,11.5,11,10,9,8,7,6.5,7,8,9],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring6":{"section_segments":16,"offset":{"x":0,"y":120,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-6.75,-5.25,-3.75,0,3.75,5.25,6.75,5.25,3.75,0,-3.75,-5.25,-6.75],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[27,28,29,29.5,29,28,27,26,25,24.5,25,26,27],"height":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"vertical":0,"texture":[4,4,16,16,4,4,4],"angle":0},"ring7":{"section_segments":16,"offset":{"x":0,"y":90,"z":8.1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-6.75,-5.25,-3.75,0,3.75,5.25,6.75,5.25,3.75,0,-3.75,-5.25,-6.75],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[27,28,29,29.5,29,28,27,26,25,24.5,25,26,27],"height":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"vertical":0,"texture":[4,4,16,16,4,4,4],"angle":0},"ring8":{"section_segments":16,"offset":{"x":0,"y":4,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring9":{"section_segments":16,"offset":{"x":0,"y":15,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring10":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":24,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring11":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":32,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring12":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":11},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring13":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":48,"z":11},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring14":{"section_segments":[45,135,225,315],"offset":{"x":30,"y":115,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,5.7,6.4,6.75,6.4,5.7,5,4.3,3.6,3.25,3.6,4.3,5],"height":[13,13.7,14.4,14.75,14.4,13.7,13,12.3,11.6,11.25,11.6,12.3,13],"vertical":0,"texture":[17],"angle":0},"ring15":{"section_segments":[45,135,225,315],"offset":{"x":30,"y":105,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,5.7,6.4,6.75,6.4,5.7,5,4.3,3.6,3.25,3.6,4.3,5],"height":[13,13.7,14.4,14.75,14.4,13.7,13,12.3,11.6,11.25,11.6,12.3,13],"vertical":0,"texture":[17],"angle":0},"ring16":{"section_segments":[45,135,225,315],"offset":{"x":30,"y":95,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,5.7,6.4,6.75,6.4,5.7,5,4.3,3.6,3.25,3.6,4.3,5],"height":[13,13.7,14.4,14.75,14.4,13.7,13,12.3,11.6,11.25,11.6,12.3,13],"vertical":0,"texture":[17],"angle":0},"ring17":{"section_segments":18,"offset":{"x":18.5,"y":101.5,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.125,-0.875,-0.625,0,0.625,0.875,1.125,0.875,0.625,0,-0.625,-0.875,-1.125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.3,8.6,8.75,8.6,8.3,8,7.7,7.4,7.25,7.4,7.7,8],"height":[6,6.3,6.6,6.75,6.6,6.3,6,5.7,5.4,5.25,5.4,5.7,6],"vertical":0,"texture":[17,4,17,4,17,4],"angle":25},"ring18":{"section_segments":18,"offset":{"x":19,"y":104.5,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.125,-0.875,-0.625,0,0.625,0.875,1.125,0.875,0.625,0,-0.625,-0.875,-1.125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.3,8.6,8.75,8.6,8.3,8,7.7,7.4,7.25,7.4,7.7,8],"height":[6,6.3,6.6,6.75,6.6,6.3,6,5.7,5.4,5.25,5.4,5.7,6],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring19":{"section_segments":18,"offset":{"x":18.5,"y":107.5,"z":13},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.125,-0.875,-0.625,0,0.625,0.875,1.125,0.875,0.625,0,-0.625,-0.875,-1.125],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.3,8.6,8.75,8.6,8.3,8,7.7,7.4,7.25,7.4,7.7,8],"height":[6,6.3,6.6,6.75,6.6,6.3,6,5.7,5.4,5.25,5.4,5.7,6],"vertical":0,"texture":[17,4,17,4,17,4],"angle":-25},"ring20":{"section_segments":6,"offset":{"x":8,"y":-50,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring21":{"section_segments":6,"offset":{"x":8,"y":-60,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring22":{"section_segments":6,"offset":{"x":8,"y":-70,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[8,8.5,9,9.25,9,8.5,8,7.5,7,6.75,7,7.5,8],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"ring23":{"section_segments":6,"offset":{"x":0,"y":-75,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[3,3.5,4,4.25,4,3.5,3,2.5,2,1.75,2,2.5,3],"vertical":0,"texture":[17,4,4,4,17,4],"angle":0},"ring24":{"section_segments":6,"offset":{"x":0,"y":-65,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[3,3.5,4,4.25,4,3.5,3,2.5,2,1.75,2,2.5,3],"vertical":0,"texture":[17,4,4,4,17,4],"angle":0},"ring25":{"section_segments":6,"offset":{"x":0,"y":-55,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.5,7,7.25,7,6.5,6,5.5,5,4.75,5,5.5,6],"height":[3,3.5,4,4.25,4,3.5,3,2.5,2,1.75,2,2.5,3],"vertical":0,"texture":[17,4,4,4,17,4],"angle":0},"reactor":{"section_segments":16,"offset":{"x":13,"y":13,"z":-105},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"hub":{"section_segments":8,"offset":{"x":13,"y":6,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"hub2":{"section_segments":8,"offset":{"x":13,"y":6,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"deco":{"section_segments":[45,135,225,315],"offset":{"x":-5,"y":105,"z":6},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8,-5,2,2],"z":[-2,-2,0,0,0,0]},"width":[0,25.5,25.5,25.5,25.5,0],"height":[0,15,15,10,10,0],"texture":[0.9,18,16.9,15,3.9],"angle":89},"wings_bottom":{"section_segments":10,"offset":{"x":-3,"y":75,"z":6},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8,-5,2,2],"z":[-2,-2,0,0,0,0]},"width":[0,15,15,15,15,0],"height":[0,15,15,10,10,0],"texture":[0.9,18,16.9,15,3.9],"angle":89},"front_streak":{"section_segments":[45,135,225,315],"offset":{"x":1,"y":1,"z":65},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,25,25,23,0],"texture":[63,17,63],"angle":20,"vertical":true},"back_streak":{"section_segments":[45,135,225,315],"offset":{"x":1,"y":5,"z":-105},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,25,25,18,0],"texture":[63,17,63],"angle":20,"vertical":true}},"wings":{"main":{"offset":{"x":0,"y":255,"z":5},"length":[100,1.5,5],"width":[170,50,50,5],"angle":[-20,0,0],"position":[-230,-130,-128,-100],"texture":[6.28,17,[15]],"doubleside":true,"bump":{"position":30,"size":4}},"main2":{"offset":{"x":0,"y":256,"z":5},"length":[100,1.5,5],"width":[170,50,50,5],"angle":[-20,0,0],"position":[-230,-130,-128,-100],"texture":[3.28,17,[15]],"doubleside":true,"bump":{"position":30,"size":4}},"main3":{"offset":{"x":0,"y":252,"z":4},"length":[100,1.5],"width":[170,50,50],"angle":[-20,0],"position":[-230,-130,-128],"texture":[17],"doubleside":true,"bump":{"position":30,"size":0}},"headwings":{"doubleside":true,"offset":{"x":0,"y":-55,"z":1},"length":[50,1],"width":[50,10,10],"angle":[-5,20],"position":[-20,40,41],"texture":[6.3,17],"bump":{"position":30,"size":4}},"headwings2":{"doubleside":true,"offset":{"x":0,"y":-57,"z":0.8},"length":[50,1],"width":[50,10,10],"angle":[-5,20],"position":[-20,40,41],"texture":[17],"bump":{"position":30,"size":0}},"headwings3":{"doubleside":true,"offset":{"x":0,"y":-54,"z":1},"length":[50,1],"width":[50,10,10],"angle":[-5,20],"position":[-20,40,41],"texture":[3.3,17],"bump":{"position":30,"size":4}},"rear":{"offset":{"x":-0.01,"y":100,"z":15},"length":[19,9,9,9,8,7,14],"width":[85,60,45,34,25,20,15,0],"angle":[90,90,90,90,90,90,90],"position":[-10,10,19,28,34,40,45,63],"texture":[3],"bump":{"position":30,"size":5}},"top":{"doubleside":true,"offset":{"x":15,"y":50,"z":10},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":15,"y":51,"z":10},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,4,17,63],"bump":{"position":30,"size":-4}}},"typespec":{"name":"Zirnitron","level":1,"model":7,"code":107,"specs":{"shield":{"capacity":[210,430],"reload":[6,6]},"generator":{"capacity":[100,145],"reload":[73,73]},"ship":{"mass":120,"speed":[148,148],"rotation":[60,60],"acceleration":[110,110]}},"shape":[3.5,2.555,1.814,1.406,1.283,1.191,1.135,1.098,1.081,1.098,1.091,1.048,0.733,0.794,0.89,1.028,1.242,1.572,2.235,3.042,3.75,3.753,3.06,2.77,2.815,3.26,2.815,2.77,3.06,3.753,3.75,3.042,2.235,1.572,1.242,1.028,0.89,0.794,0.733,1.048,1.091,1.098,1.081,1.098,1.135,1.191,1.283,1.406,1.814,2.555],"lasers":[{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[17,17],"rate":4,"type":1,"speed":[170,190],"number":1,"spread":0,"error":0,"recoil":30},{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[7.5,7.5],"rate":10,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":20},{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[7.5,7.5],"rate":8,"type":1,"speed":[240,240],"number":1,"spread":0,"error":0,"recoil":20},{"x":0,"y":-3.5,"z":-0.28,"angle":0,"damage":[7.5,7.5],"rate":6,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":20}],"radius":3.753}}',
                    '{"name":"Brotaur","level":1,"model":8,"size":1.03,"specs":{"shield":{"capacity":[300,520],"reload":[9,7]},"generator":{"capacity":[150,150],"reload":[80,80]},"ship":{"mass":260,"speed":[90,122],"rotation":[65,78],"acceleration":[90,140]}},"bodies":{"main":{"section_segments":[30,60,120,150,210,240,300,330,360],"offset":{"x":0,"y":80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-240,-240,-228,-175,10,60,63,63,58],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,1,6,17,20,24,16,15,0],"height":[0,1,9,13,18,18,13,12,0],"texture":[2,2,2,2,2,13,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-110,"z":9},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,32,45],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9,9,9,4]},"frontsupport":{"section_segments":6,"offset":{"x":1,"y":-56,"z":-7},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-20,-13,-9,-5,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,15,10,10,0,0],"height":[0,1,5,7,5,5,5,5,0],"angle":90,"texture":[1,2,2]},"topsupport":{"section_segments":[30,60,90,120,150,210,240,300,330,360],"offset":{"x":5,"y":-30,"z":10},"position":{"x":[-5,17,17,9,17,15,10,0,0],"y":[0,-8,-8,0,2,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,0,5,30,0,0,0,0,0],"height":[0,1,5,7,0,5,5,5,0],"angle":-90,"texture":[4]},"engines":{"section_segments":[40,45,50,130,135,140,220,225,230,270,310,315,320],"offset":{"x":20,"y":54,"z":0},"position":{"x":[0,-2,0,1,22,22,0],"y":[-45,-45,0,75,120,119],"z":[0,0,0,0,0,0,0]},"width":[0,10,10,10,10,0],"height":[0,12.5,12.5,10,10,0],"texture":[3,3,3,12,15],"angle":180},"backengines":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":22,"y":135,"z":0},"position":{"x":[0,0,0,0,0],"y":[-70,-40,10,10,5],"z":[0,0,0,0,0]},"width":[0,11,11,9,0],"height":[0,14,14,12,0],"propeller":true,"texture":[3,3,17],"angle":0},"grill_toploader":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":18,"y":-13,"z":0},"position":{"x":[0,0,0,2,22,12,0],"y":[0,0,0,-0.7,16,5],"z":[0,0,0,0,0,1,0]},"width":[0,0,0,28.1,14,0],"height":[0,0,0,10.1,10,0],"texture":[1,1,1,4,4],"angle":120},"cannon":{"section_segments":6,"offset":{"x":0,"y":-105,"z":-14},"position":{"x":[0,0,0,0,0,0],"y":[-55,-65,-20,0,20,30],"z":[3,3,2,1,0,20]},"width":[0,0.7,2,2,1.5,0],"height":[0,0.7,2,2,1.5,0],"angle":0,"propeller":false,"texture":[2.8,2.8,2.8,2.8],"laser":{"damage":[32,32],"rate":1,"type":1,"speed":[160,180],"number":3,"error":0,"angle":0,"recoil":30}},"side_propellers":{"section_segments":8,"offset":{"x":90,"y":55,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-30,-24,-24,-34,-35,-35,-20,45,45,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,4,7,9,9,12,11,10,0],"height":[0,3,4,9,11,11,13,12,11,0],"propeller":true,"texture":[13,17,13,3,17,3,3,17],"laser":{"damage":[8,8],"rate":5.3,"type":1,"speed":[170,200],"recoil":0,"number":2,"angle":3,"error":0}},"wingsRail":{"section_segments":[45,135,225,315],"offset":{"x":135,"y":85,"z":-13},"position":{"x":[0,0,0,1.2],"y":[-7,-5,12.1,13.6],"z":[-1,-1,-0.7,-0.7]},"width":[1,2,2,0],"height":[1,2,2,0],"texture":[63],"angle":0},"wingsRail2":{"section_segments":[45,135,225,315],"offset":{"x":86.5,"y":45,"z":4},"position":{"x":[0,0,0,0],"y":[-7,-5,9,10],"z":[-2,0,0,-1]},"width":[1,2,2,0],"height":[0,2,2,0],"texture":[63],"angle":0},"wingsRail3":{"section_segments":[45,135,225,315],"offset":{"x":93.5,"y":45,"z":4},"position":{"x":[0,0,0,0],"y":[-7,-5,9,10],"z":[-2,0,0,0]},"width":[1,2,2,0],"height":[0,2,2,0],"texture":[63],"angle":0},"wingsRail4":{"section_segments":[45,135,225,315],"offset":{"x":59,"y":117,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,4,5],"z":[0,0,-1,-1,0,0,0,0,0]},"width":[1,1.6,1.6,0],"height":[1,1.6,1.6,0],"texture":[63],"angle":0},"wingsRail5":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":25,"z":8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,5,7],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,1.7,1.7,0],"height":[1,1.7,1.7,0],"texture":[63],"angle":87},"wingsRail6":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":14,"z":8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,4,6],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,1.7,1.7,0],"height":[1,1.7,1.7,0],"texture":[63],"angle":87},"wingsRail7":{"section_segments":6,"offset":{"x":28.8,"y":143.2,"z":51},"position":{"x":[4,4,3,3,0,0,0,0],"y":[-3,-2,4,4.5],"z":[-3,-3,-3,-3,0,0,0,0,0]},"width":[0.5,0.7,0.7,0],"height":[1,2,2,0],"texture":[63],"angle":10},"wingsRail8":{"section_segments":[45,135,225,315],"offset":{"x":72,"y":25,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3,-1,4,6],"z":[0,0,0,0,0,0,0,0,0]},"width":[1,1.7,1.7,0],"height":[1,1.7,1.7,0],"texture":[63]},"wingstail":{"section_segments":6,"offset":{"x":65.5,"y":77.3,"z":-4},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-41,-39,19,20],"z":[10.5,10.5,0,0,0,0,0,0,0]},"width":[1,2,2,0],"height":[1,2,2,0],"texture":[4],"angle":74},"wingstail2":{"section_segments":8,"offset":{"x":115,"y":90.7,"z":-11},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-17,-15,23,23],"z":[4,4,-3,-3,0,0,0,0,0]},"width":[1,1.5,1.5,0],"height":[1,1,1,0],"texture":[4],"angle":75},"box":{"section_segments":[45,135,225,315],"offset":{"x":21.5,"y":-1,"z":-50},"position":{"x":[0,0,0,0,0],"y":[0,0,13.333333333333334,12.333333333333334,12.333333333333334],"z":[0,0,0,0,0]},"width":[0,10,5,1,0],"height":[0,33.333333333333336,26.666666666666668,8.88888888888889,0],"angle":0,"vertical":true,"texture":[17,4,16.93]},"ring":{"section_segments":16,"offset":{"x":25,"y":60,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,7,8,8.5,8,7,6,5,4,3.5,4,5,6],"height":[7,8,9,9.5,9,8,7,6,5,4.5,5,6,7],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring2":{"section_segments":16,"offset":{"x":25,"y":50,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,7,8,8.5,8,7,6,5,4,3.5,4,5,6],"height":[7,8,9,9.5,9,8,7,6,5,4.5,5,6,7],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring3":{"section_segments":16,"offset":{"x":25,"y":40,"z":5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,7,8,8.5,8,7,6,5,4,3.5,4,5,6],"height":[7,8,9,9.5,9,8,7,6,5,4.5,5,6,7],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring4":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":25,"y":-3,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.7,7.4,7.75,7.4,6.7,6,5.3,4.6,4.25,4.6,5.3,6],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":25,"y":-11,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.7,7.4,7.75,7.4,6.7,6,5.3,4.6,4.25,4.6,5.3,6],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring6":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":29,"y":116,"z":-1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14,14.7,15.4,15.75,15.4,14.7,14,13.3,12.6,12.25,12.6,13.3,14],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring7":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":29,"y":109,"z":-1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,10.7,11.4,11.75,11.4,10.7,10,9.3,8.6,8.25,8.6,9.3,10],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":29,"y":102,"z":-1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.7,7.4,7.75,7.4,6.7,6,5.3,4.6,4.25,4.6,5.3,6],"height":[4,4.7,5.4,5.75,5.4,4.7,4,3.3,2.6,2.25,2.6,3.3,4],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":6.5,"z":-100},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[20,21,22,22.5,22,21,20,19,18,17.5,18,19,20],"height":[24,25,26,26.5,26,25,24,23,22,21.5,22,23,24],"vertical":1,"texture":[4,17,[15],[15],17,4,4],"angle":90},"ring10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":100,"z":6.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[24,25,26,26.5,26,25,24,23,22,21.5,22,23,24],"height":[20,21,22,22.5,22,21,20,19,18,17.5,18,19,20],"vertical":0,"texture":[4,17,[15],[15],17,4,4],"angle":0},"ring11":{"section_segments":16,"offset":{"x":89.7,"y":75,"z":6.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[10,10.6,11.2,11.5,11.2,10.6,10,9.4,8.8,8.5,8.8,9.4,10],"height":[5,5.6,6.2,6.5,6.2,5.6,5,4.4,3.8,3.5,3.8,4.4,5],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":90},"ring12":{"section_segments":16,"offset":{"x":0,"y":-3,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring13":{"section_segments":16,"offset":{"x":0,"y":8,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.7,17.4,17.75,17.4,16.7,16,15.3,14.6,14.25,14.6,15.3,16],"height":[7,7.7,8.4,8.75,8.4,7.7,7,6.3,5.6,5.25,5.6,6.3,7],"vertical":0,"texture":[4,17,4,4,17,4,4],"angle":0},"ring14":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":19,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring15":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":27,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring16":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":35,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring17":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":43,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,63,63,4,4,4],"angle":0},"ring18":{"section_segments":16,"offset":{"x":0,"y":130,"z":10.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.5749999999999997,-1.125,0,1.125,1.5749999999999997,2.025,1.5749999999999997,1.125,0,-1.125,-1.5749999999999997,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,11.7,12.4,12.75,12.4,11.7,11,10.3,9.6,9.25,9.6,10.3,11],"height":[8,8.7,9.4,9.75,9.4,8.7,8,7.3,6.6,6.25,6.6,7.3,8],"vertical":0,"texture":[4,4,17,17,4,4,4],"angle":0},"reactor":{"section_segments":20,"offset":{"x":0,"y":10,"z":-100},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor_top":{"section_segments":10,"offset":{"x":0,"y":23,"z":-100},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,1.8,1.4,1.4,2,1.4,1.6],"z":[0,0,0,0,0,0,0,0]},"width":[3.6,3,2.6,2.4,2,0.4,0],"height":[3.6,3,2.6,2.4,2,0.4,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":16,"z":-60},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,2.0999999999999996,2.4000000000000004],"z":[0,0,0,0,0,0,0,0]},"width":[14.4,12,10.4,9.6,8,1.6,0],"height":[14.4,12,10.4,9.6,8,1.6,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor3":{"section_segments":20,"offset":{"x":10,"y":16,"z":-130},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,2.0999999999999996,2.4000000000000004],"z":[0,0,0,0,0,0,0,0]},"width":[5.4,4.5,3.9000000000000004,3.5999999999999996,3,0.6000000000000001,0],"height":[5.4,4.5,3.9000000000000004,3.5999999999999996,3,0.6000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":15},"propeller_reactor":{"section_segments":8,"offset":{"x":89.7,"y":1,"z":-65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"height":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"propeller_reactor2":{"section_segments":8,"offset":{"x":89.7,"y":1,"z":-85},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"height":[0,3.5999999999999996,3.5999999999999996,4.8,4.8,6,6,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"hub":{"section_segments":8,"offset":{"x":13,"y":6,"z":3},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"hub2":{"section_segments":8,"offset":{"x":13,"y":6,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,3,3,4,4,5,5,0],"height":[0,3,3,4,4,5,5,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":208},"lights":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":75,"z":12.4},"position":{"x":[0,0,0,0],"y":[-10,-10,150,150],"z":[0,4.1,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[17],"angle":180},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":2,"y":75,"z":12.4},"position":{"x":[0,0,0,0],"y":[-10,-10,150,150],"z":[0,4.1,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[[15]],"angle":180},"lights3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":75,"z":12.4},"position":{"x":[0,0,0,0],"y":[-10,-10,150,150],"z":[0,4.1,0,0]},"width":[0,1.5,1.5,0],"height":[0,2,2,0],"texture":[18],"angle":180}},"wings":{"headwings":{"doubleside":true,"offset":{"x":12,"y":120,"z":0},"length":[50],"width":[40,10,40],"angle":[-5,20],"position":[-20,0,0],"texture":[3.2],"bump":{"position":40,"size":12}},"headwings_lights":{"doubleside":true,"offset":{"x":12,"y":118.5,"z":-0.3},"length":[50],"width":[40,10,40],"angle":[-5,20],"position":[-20,0,0],"texture":[17],"bump":{"position":40,"size":0}},"topwings":{"doubleside":true,"offset":{"x":15,"y":140,"z":0},"length":[55],"width":[40,10,40],"angle":[70,70],"position":[-30,5,0],"texture":3.2,"bump":{"position":40,"size":30}},"headwings2":{"doubleside":true,"offset":{"x":20,"y":20,"z":0},"length":[45,10],"width":[30,15,10],"angle":[-5,-5],"position":[-35,0,8],"texture":[8,4],"bump":{"position":45,"size":10}},"headwings2_lights":{"doubleside":true,"offset":{"x":20,"y":18,"z":-0.5},"length":[45,10],"width":[30,15,10],"angle":[-5,-5],"position":[-35,0,8],"texture":[17],"bump":{"position":45,"size":0}},"back":{"offset":{"x":0,"y":210,"z":9},"length":[80,50,10.5],"width":[70,44,23,18],"angle":[-10,-9.5,-9.5],"position":[-175,-143,-125.5,-122],"texture":[8.12,3,4],"doubleside":true,"bump":{"position":35,"size":5}},"back2":{"offset":{"x":0,"y":212,"z":8.9},"length":[80,60],"width":[70,44,26],"angle":[-10,-9.5],"position":[-175,-143,-121],"texture":[18],"doubleside":true,"bump":{"position":35,"size":5}},"back3":{"offset":{"x":0,"y":208,"z":8.8},"length":[80,60],"width":[70,44,26],"angle":[-10,-9.5],"position":[-175,-143,-118],"texture":[17],"doubleside":true,"bump":{"position":35,"size":0}},"top":{"doubleside":true,"offset":{"x":15,"y":65,"z":13},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":15,"y":66,"z":13},"length":[0,-3,-3,-1,-12,-3,0],"width":[0,40,40,120,120,40,20,0],"angle":[280,280,255,315,335,350,0],"position":[7,7,7,-32,-32,3,3,3],"texture":[63,63,63,17,4,17,63],"bump":{"position":30,"size":-4}},"diamond":{"doubleside":true,"offset":{"x":5,"y":130,"z":10},"length":[15,3,3,-1],"width":[12,12,35,15,0],"angle":[140,140,140,140],"position":[0,0,-8,-6,4],"texture":[4,4,18,17],"bump":{"position":30,"size":25}},"diamond2":{"doubleside":true,"offset":{"x":5,"y":129,"z":10},"length":[15,3,3,-1],"width":[12,12,35,15,0],"angle":[140,140,140,140],"position":[0,0,-8,-6,4],"texture":[4,4,4,17],"bump":{"position":30,"size":25}}},"typespec":{"name":"Brotaur","level":1,"model":8,"code":108,"specs":{"shield":{"capacity":[300,520],"reload":[9,7]},"generator":{"capacity":[150,150],"reload":[80,80]},"ship":{"mass":260,"speed":[90,122],"rotation":[65,78],"acceleration":[90,140]}},"shape":[3.502,2.705,1.784,1.056,0.955,0.884,0.837,0.774,0.799,0.835,0.895,0.983,1.105,1.28,2.13,2.257,2.389,3.512,3.559,2.928,2.673,2.873,2.835,3.168,3.041,2.952,3.041,3.168,2.835,2.873,2.673,2.928,3.559,3.512,2.389,2.257,2.13,1.28,1.105,0.983,0.895,0.835,0.799,0.774,0.837,0.884,0.955,1.056,1.784,2.705],"lasers":[{"x":0,"y":-3.502,"z":-0.288,"angle":0,"damage":[32,32],"rate":1,"type":1,"speed":[160,180],"number":3,"spread":0,"error":0,"recoil":30},{"x":1.854,"y":0.412,"z":-0.144,"angle":0,"damage":[8,8],"rate":5.3,"type":1,"speed":[170,200],"number":2,"spread":3,"error":0,"recoil":0},{"x":-1.854,"y":0.412,"z":-0.144,"angle":0,"damage":[8,8],"rate":5.3,"type":1,"speed":[170,200],"number":2,"spread":3,"error":0,"recoil":0}],"radius":3.559}}',
                    '{"name":"Icarus","level":1,"model":9,"size":2.4,"specs":{"shield":{"capacity":[625,625],"reload":[4,6]},"generator":{"capacity":[100,145],"reload":[60,77]},"ship":{"mass":360,"speed":[90,110],"rotation":[80,95],"acceleration":[70,90]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-61.5,-61,-64.8,-65,-59,-55,-20,-20,-5,40,40,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,1,2.7,3,8,9,11,11,11,11,11,0],"height":[0,1,1.7,2,6,7,9,9,8,8,8,0],"texture":[17,17,17,63,63,10,10,1,11,2,18]},"main2":{"section_segments":8,"offset":{"x":0,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-61.5,-60,-63,-59,-55,-20,-20,-5,39.5,39.5,39.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,2,5.333333333333333,6,7.333333333333333,7.333333333333333,7.333333333333333,7.333333333333333,7.333333333333333,0],"height":[0,2.4,2.4,6.6,8.4,10.799999999999999,10.799999999999999,9.6,9.6,9.6,0],"texture":[17,17,63,63,3,4,4,18],"propeller":true,"laser":{"damage":[9,9],"rate":4.5,"type":1,"speed":[160,200],"number":1,"recoil":0,"error":0}},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-20,"z":15.8},"position":{"x":[0,0,0,0,0,0],"y":[-25,-10,4,7.5,15],"z":[0.5,-2.7,-2.5,-1.5,-2]},"width":[3,6,6,5,4],"height":[3,10,10,8,1],"texture":[9,9,4]},"motor":{"section_segments":8,"offset":{"x":6,"y":-25,"z":10},"position":{"x":[0,0,0,0,0],"y":[5,10,15,60,52],"z":[0,0,0,-2.5,-2.5]},"width":[0,10,10,10,0],"height":[0,5,5,8,0],"texture":[63,63,18,4]},"propulsors":{"section_segments":8,"offset":{"x":10,"y":-17,"z":7.5},"position":{"x":[0,0,0,0],"y":[15,55,56,52],"z":[0,0,0,0]},"width":[4,4,3.2,0],"height":[5,5,4.2,0],"propeller":true,"texture":[12,17]},"propulsors2":{"section_segments":8,"offset":{"x":0,"y":-15,"z":10},"position":{"x":[0,0,0,0],"y":[15,55,56,50],"z":[0,0,0,0]},"width":[6,6,5.2,0],"height":[7,7,6.2,0],"propeller":false,"texture":[12,17]},"wing_holders":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":-5},"position":{"x":[0,0,0,0,0,0],"y":[15,15,20,25,25],"z":[0,0,-5,-10,-10,0]},"width":[0,10,10,10,0],"height":[0,12.5,12.5,12.5,0],"vertical":true,"texture":[1,17.955,4]},"lights":{"section_segments":8,"offset":{"x":0,"y":-10,"z":14},"position":{"x":[0,0,0,0],"y":[10,10,50,50],"z":[0,1.9,-0.4,0]},"width":[0,3.7,2.5,0],"height":[0,5,5,0],"texture":[17],"angle":180},"wings":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":7,"y":-40,"z":13},"position":{"x":[0,5,0,0],"y":[0,0,6,6],"z":[0,0,-5,-5]},"width":[0,5,4,0],"height":[0,1,1,0],"texture":[2],"angle":90},"cannons":{"section_segments":10,"offset":{"x":14,"y":35.5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-91,-89,-88,-80,-80,-73,-72,-71.5,-72],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,2,2.5,2,2,2.3,2.3,1.5,0],"height":[0,2,2.5,2,2,2.3,2.3,1.5,0],"texture":[17,1,17,4,17,8,63,18],"angle":0,"laser":{"damage":[52,52],"rate":1,"type":2,"speed":[120,140],"recoil":0,"number":1,"error":1}},"wing_cross":{"section_segments":10,"offset":{"x":0,"y":16,"z":26.6},"position":{"x":[0,0,0,0],"y":[-6,-6,8,8],"z":[1.5909090909090908,1.5909090909090908,-0.13636363636363635,0]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,1,1,0],"texture":[5,17],"angle":180},"wing_cross2":{"section_segments":10,"offset":{"x":0,"y":3,"z":26.6},"position":{"x":[0,0,0,0],"y":[-6,-6,0.4,0.4],"z":[-1.3636363636363635,-1.3636363636363635,-0.045454545454545456,0]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,0.45454545454545453,0.45454545454545453,0],"texture":[5,17],"angle":0},"wing_cross3":{"section_segments":10,"offset":{"x":0,"y":6,"z":28},"position":{"x":[0,0,0,0],"y":[-9.09090909090909,-9.09090909090909,-2.2727272727272725,-2.2727272727272725],"z":[0,0,-1.3636363636363635,-1.3636363636363635]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,0.45454545454545453,0.45454545454545453,0],"texture":[5,17],"angle":90},"wing_cross4":{"section_segments":10,"offset":{"x":0,"y":6,"z":28},"position":{"x":[0,0,0,0],"y":[-9.09090909090909,-9.09090909090909,-2.2727272727272725,-2.2727272727272725],"z":[0,0,-1.3636363636363635,-1.3636363636363635]},"width":[0,2.727272727272727,2.727272727272727,0],"height":[0,0.45454545454545453,0.45454545454545453,0],"texture":[5,17],"angle":-90},"reactor":{"section_segments":30,"offset":{"x":0,"y":32,"z":-6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-6.4935064935064934,-4.220779220779221,-3.2467532467532467,-3.8961038961038956,-4.058441558441558,-3.2467532467532467,-3.2467532467532467,-3.8961038961038956],"z":[0,0,0,0,0,0,0,0]},"width":[5.416666666666667,5.416666666666667,4.166666666666667,3.75,2.5,1.7500000000000002,1.6666666666666667,0],"height":[5.416666666666667,5.416666666666667,4.166666666666667,3.75,2.5,1.7500000000000002,1.6666666666666667,0],"texture":[1,3,18,17,18,16,17],"vertical":true}},"wings":{"main":{"offset":{"x":0,"y":0,"z":10},"length":[33.333333333333336,8.333333333333334,0,4.166666666666667,0,2.5,12.5,25],"width":[60,35,29,14,14,35,32,5],"angle":[-10,20,20,0,0,0,0],"position":[0,12.5,15,18.333333333333336,20,15.833333333333334,17.5,34.16666666666667],"doubleside":true,"bump":{"position":30,"size":10},"texture":[18,63,17,4,17,4]},"main2":{"offset":{"x":0,"y":-1,"z":10},"length":[33.333333333333336,8.333333333333334,0,4.166666666666667,0,2.5,10.833333333333334,25],"width":[60,35,29,14,14,35,32,5],"angle":[-10,20,20,0,0,0,0],"position":[0,12.5,15,18.333333333333336,20,15.833333333333334,17.5,34.16666666666667],"doubleside":true,"bump":{"position":30,"size":10},"texture":[8.06,63,17,18,17,17,63]},"main_lights":{"offset":{"x":0,"y":-2,"z":10},"length":[33.333333333333336,8.333333333333334,0,4.166666666666667,0,2.5,12.5,25],"width":[60,35,29,14,14,35,32,5],"angle":[-10,20,20,0,0,0,0],"position":[0,12.5,15,18.333333333333336,20,15.833333333333334,17.5,34.16666666666667],"doubleside":true,"bump":{"position":30,"size":0},"texture":[17]},"detail4":{"doubleside":true,"offset":{"x":23,"y":18,"z":5},"length":[0,5,3.5,3.5,5,0],"width":[0,8,20,40,20,8,0],"angle":[0,0,0,0,-1.5,-1.5],"position":[-2.5,-2.5,-1,-7.5,0,4.5,4.5],"texture":[63,63,17,63,4],"bump":{"position":35,"size":15}},"detail41":{"doubleside":true,"offset":{"x":11,"y":15,"z":6.8},"length":[0,5.882352941176471,4.11764705882353,4.11764705882353,5.882352941176471,0],"width":[0,9.6,24,48,24,9.6,0],"angle":[0,0,0,0,-1.5,-1.5],"position":[-2.5,-2.5,-1,-7.5,0,4.5,4.5],"texture":[63,63,63,4,4],"bump":{"position":35,"size":15}},"top":{"doubleside":true,"offset":{"x":0,"y":20,"z":25},"length":[12.5,1,25,0,3,0,5],"width":[35,35,30,25,10,10,27,20],"angle":[7.5,-25,-25,-25,-25,-25,10],"position":[-7.5,-7.5,-6.5,0,2,3,0,5],"texture":[4,17,4,17,4,4],"bump":{"position":35,"size":10}},"top2":{"doubleside":true,"offset":{"x":0,"y":19.5,"z":25},"length":[12.5,1,25,0,3,0,4.3],"width":[35,35,30,25,10,10,27,20],"angle":[7.5,-25,-25,-25,-25,-25,10],"position":[-7.5,-7.5,-6.5,0,2,3,0,5],"texture":[4,17,18,17,13,17],"bump":{"position":35,"size":10}}},"typespec":{"name":"Icarus","level":1,"model":9,"code":109,"specs":{"shield":{"capacity":[625,625],"reload":[4,6]},"generator":{"capacity":[100,145],"reload":[60,77]},"ship":{"mass":360,"speed":[90,110],"rotation":[80,95],"acceleration":[70,90]}},"shape":[3.363,3.277,2.771,2.468,1.249,1.226,1.238,1.282,1.334,1.425,1.579,1.752,2.278,2.422,2.627,2.932,3.276,3.368,2.728,2.252,1.907,1.788,1.976,1.968,1.984,1.972,1.984,1.968,1.976,1.788,1.907,2.252,2.728,3.368,3.276,2.932,2.627,2.422,2.278,1.752,1.579,1.425,1.334,1.282,1.238,1.226,1.249,2.468,2.771,3.277],"lasers":[{"x":0,"y":-3.264,"z":0.48,"angle":0,"damage":[9,9],"rate":4.5,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":0.672,"y":-2.664,"z":0.384,"angle":0,"damage":[52,52],"rate":1,"type":2,"speed":[120,140],"number":1,"spread":0,"error":1,"recoil":0},{"x":-0.672,"y":-2.664,"z":0.384,"angle":0,"damage":[52,52],"rate":1,"type":2,"speed":[120,140],"number":1,"spread":0,"error":1,"recoil":0}],"radius":3.368}}',
                    '{"name":"Ragnarok","level":1,"model":10,"size":1,"specs":{"shield":{"capacity":[400,450],"reload":[5,5]},"generator":{"capacity":[150,165],"reload":[90,90]},"ship":{"mass":160,"speed":[110,120],"rotation":[45,80],"acceleration":[85,100]}},"bodies":{"ring":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-130,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"ring2":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-115,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"ring3":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-100,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"disc4":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-85,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"disc5":{"section_segments":[45,135,225,315],"offset":{"x":13,"y":-70,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-18,24,24,24,24,24,24,24,12,8,6,8,12,16],"height":[0,16.5,16.5,16.5,16.5,16.5,16.5,16.5,9,6,4.5,6,9,12],"vertical":false,"texture":[4,4,17,4,17,4],"angle":0},"disc6":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":-56.5,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[11,12,13,13.5,13,12,11,10,9,8.5,9,10,11],"height":[14,15,16,16.5,16,15,14,13,12,11.5,12,13,14],"vertical":false,"texture":[4,17,4,4,17,4],"angle":0},"disc7":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-40,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-40,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc11":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":-20,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc12":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":9,"y":0,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.875,-1.125,-0.3,0.3,1.125,2.025,2.025,2.025,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-6.75,9,9,9,9,9,9,9,4.5,3,2.25,3,4.5,6],"height":[0,8.8,8.8,8.8,8.8,8.8,8.8,8.8,4.800000000000001,3.2,2.4000000000000004,3.2,4.800000000000001,6.4],"vertical":false,"texture":[4,4,17,4,17,4],"angle":90},"disc13":{"section_segments":6,"offset":{"x":0,"y":-63,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"disc14":{"section_segments":6,"offset":{"x":0,"y":-77,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"disc15":{"section_segments":6,"offset":{"x":0,"y":-91,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"disc16":{"section_segments":6,"offset":{"x":0,"y":-106,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.625,-3.125,-1.875,-0.5,0.5,1.875,3.375,3.375,3.375,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[-9.9,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,13.200000000000001,6.6000000000000005,4.4,3.3000000000000003,4.4,6.6000000000000005,8.8],"height":[0,13.2,13.2,13.2,13.2,13.2,13.2,13.2,7.199999999999999,4.8,3.5999999999999996,4.8,7.199999999999999,9.6],"vertical":false,"texture":[3,3,3,3,63,63],"angle":180},"hub":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":122},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub2":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":107},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub3":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":92},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub4":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":77},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub5":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub6":{"section_segments":[45,135,225,315],"offset":{"x":24,"y":6,"z":134},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,3.6,2.8,2.8,4,2.4,2.8],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub7":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":25,"z":40},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,1.7999999999999998,2.0999999999999996],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub8":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":25,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,1.7999999999999998,2.0999999999999996],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub9":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,2.7,2.0999999999999996,2.0999999999999996,3,1.7999999999999998,2.0999999999999996],"z":[0,0,0,0,0,0,0,0]},"width":[7.2,6,5.2,4.8,4,0.8,0],"height":[7.2,6,5.2,4.8,4,0.8,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":55,"y":20,"z":-126},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,7,7,10,6,7],"z":[0,0,0,0,0,0,0,0]},"width":[28.8,24,20.8,19.2,16,3.2,0],"height":[28.8,24,20.8,19.2,16,3.2,0],"texture":[18,17,17,18,18,17],"vertical":true,"angle":0},"hub11":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":-35,"y":126,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,7,7,10,6,7],"z":[0,0,0,0,0,0,0,0]},"width":[28.8,24,20.8,19.2,16,3.2,0],"height":[28.8,24,20.8,19.2,16,3.2,0],"texture":[18,17,17,18,18,17],"vertical":false,"angle":90},"main":{"section_segments":6,"offset":{"x":0,"y":-180,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,-10,-10,30,70,120,100],"z":[0,0,0,0,0,0,0,0]},"width":[0,19,20,30,30,30,0],"height":[0,4,5,20,25,25,0],"texture":[15,17,4,3,8,17],"propeller":true},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-180,"z":15},"position":{"x":[0,0,0,0,0],"y":[0,30,70,120,115],"z":[-8,-1,0,0,0]},"width":[3,11,14,14,0],"height":[0,10,15,15,0],"texture":[9,9,4]},"cockpit_shield":{"section_segments":[0,60,120,180],"offset":{"x":-12,"y":-110,"z":12},"position":{"x":[2,2,0,0,0,0,0],"y":[-40,-38,0,44,46,50,50],"z":[0,1,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,14,14,14,14,0],"texture":[17.3,1,18,63,4,63]},"cockpit_shield2":{"section_segments":[0,60,120,180],"offset":{"x":-11.95,"y":-110,"z":12},"position":{"x":[2,2,0,0,0,0,0],"y":[-40,-38,0,38,40,50,50],"z":[0,1,0,0,0,0,0]},"width":[0,5,10,10,10,10,0],"height":[0,5,14,14,14,14,0],"texture":[63]},"cannons":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-180,"z":-5},"position":{"x":[-10,-10,-10,-3,-3,-3,-3,-3],"y":[20,11,10,40,70,120,100],"z":[0,0,0,0,0,0,0,0]},"width":[0,4,5,10,10,10,0],"height":[0,4,5,15,15,15,0],"texture":[17,17,3,2,2,2,17]},"tong_joints":{"section_segments":8,"offset":{"x":61.8,"y":-20,"z":0},"position":{"x":[-14,-14,-25,-15,0,0.6,0,0],"y":[-120,-120,-40,-30,100,120,120],"z":[-5,-5,-3.5,0,0,0,0,0]},"width":[0,7,7,7,7,4,0],"height":[0,10,10,25,30,30,0],"texture":[4,63,63],"angle":10},"tong_joints_deco":{"section_segments":8,"offset":{"x":40,"y":-50,"z":0},"position":{"x":[0,0,0,0],"y":[100,100,110,110],"z":[0,0,0,0]},"width":[1,8,8,1],"height":[1,31,31,1],"texture":[17,[15],17],"angle":17},"tong_joints_deco2":{"section_segments":8,"offset":{"x":34.099999999999994,"y":-70,"z":0},"position":{"x":[0,0,0,0],"y":[100,100,110,110],"z":[0,0,0,0]},"width":[1,8,8,1],"height":[0,30,30,0],"texture":[17,[15],17],"angle":17},"tong_joints_deco3":{"section_segments":8,"offset":{"x":28.199999999999996,"y":-90,"z":0},"position":{"x":[0,0,0,0],"y":[100,100,110,110],"z":[0,0,0,0]},"width":[1,8,8,1],"height":[-1,29,29,-1],"texture":[17,[15],17],"angle":17},"shields":{"section_segments":12,"offset":{"x":64,"y":-60,"z":-125},"position":{"x":[10,10,20,25,20,10,10],"y":[20,20,40,60,80,100,100],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,50,50,50,50,50,0],"vertical":true,"angle":0,"texture":[3,8,8,8,8,3]},"shields_deco":{"section_segments":6,"offset":{"x":65,"y":-60,"z":-105},"position":{"x":[10,10,20,25,20,10,10],"y":[20,20,40,60,80,100,100],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,12.5,12.5,12.5,12.5,12.5,0],"vertical":true,"texture":[2.9,63,63,63,63,2.9]},"shields_deco2":{"section_segments":6,"offset":{"x":65,"y":-60,"z":-145},"position":{"x":[10,10,20,25,20,10,10],"y":[20,20,40,60,80,100,100],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,12.5,12.5,12.5,12.5,12.5,0],"vertical":true,"texture":[2.9,63,63,63,63,2.9]},"shields_deco3":{"section_segments":12,"offset":{"x":66,"y":-30,"z":-125},"position":{"x":[10,10,20,25,20,10,10],"y":[10,10,20,30,40,50,50],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,25,25,25,25,25,0],"vertical":true,"angle":0,"texture":[63]},"joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-48,-48,-10,0,10,48,48],"z":[0,0,20,20,20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"angle":90,"texture":[13,13,3,3,13,13]},"joint2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,20,20,20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"angle":90,"texture":[13,13,3,3,13,13]},"joint3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-48,-48,-10,0,10,48,48],"z":[0,0,-20,-20,-20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"joint4":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,-20,-20,-20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"joint5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,20,20,20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"joint6":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,-10,0,10,50,50],"z":[0,0,-20,-20,-20,0,0]},"width":[0,8,8,8,8,8,0],"height":[0,8,8,8,8,8,0],"propeller":false,"angle":90,"texture":[13,13,3,3,13,13]},"propeller1":{"section_segments":8,"offset":{"x":68,"y":80,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller2":{"section_segments":8,"offset":{"x":68,"y":80,"z":-12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller3":{"section_segments":8,"offset":{"x":42,"y":80,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller4":{"section_segments":8,"offset":{"x":42,"y":80,"z":-12},"position":{"x":[0,0,0,0,0,0],"y":[-4,0,90,90,94,85],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,14,14,14,13,0],"propeller":true,"texture":[12,13,13,17,17]},"propeller_band":{"section_segments":[30,60,120,150,210,240,300,330],"offset":{"x":55,"y":102,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-4.5,-7,-7,-4.5,4.5,7,4.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[27,27,29,32,34,34,32,29,27,27],"height":[27,27,29,32,34,34,32,29,27,27],"texture":[7]},"propeller_band2":{"section_segments":[30,60,120,150,210,240,300,330],"offset":{"x":55,"y":150,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-4.5,-7,-7,-4.5,4.5,7,4.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[27,27,29,32,34,34,32,29,27,27],"height":[27,27,29,32,34,34,32,29,27,27],"texture":[7]},"propeller_front":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":-75,"y":80,"z":0},"position":{"x":[10,10,10,-5,-10,-10],"y":[-4,0,20,40,42,42],"z":[0,0,0,0,0,0]},"width":[0,14,14,14,13,0],"height":[0,18,18,18,17,0],"angle":90,"texture":[7]},"cannon_rear":{"section_segments":12,"offset":{"x":0,"y":-80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-112.5,-90,-93,-94.5,-90,-67.5,-70.5,-73.5,-67.5,-45,-49.5,-52.5,-45,-22.5,-27,-30,-22.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,3,4,6,3,4,6,8,5,6,7,11,7,8,12,15,8,10],"height":[0,2,3,4,6,3,4,6,8,5,6,7,11,7,8,12,15,8,10],"angle":180,"propeller":false,"texture":[4,4,8,13,17,4,2,2,17,4,2,2,17,4,2,2,17,4]},"disc":{"section_segments":6,"offset":{"x":0,"y":-57,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-5,-3,-3,3,3,5,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24.200000000000003,24.200000000000003,24.200000000000003,27.500000000000004,27.500000000000004,27.500000000000004,27.500000000000004,24.200000000000003,24.200000000000003,24.200000000000003],"height":[26.4,26.4,26.4,30,30,30,30,26.4,26.4,26.4],"texture":[18,18,18,18,18,17]},"backrecoil":{"section_segments":12,"offset":{"x":55,"y":140,"z":0},"position":{"x":[1,1],"y":[1,5],"z":[1,1]},"width":[1,1],"height":[1,1],"angle":180,"laser":{"damage":[28,28],"rate":1.5,"type":2,"speed":[180,230],"number":2,"angle":3,"error":2,"recoil":80}},"backrecoil2":{"section_segments":12,"offset":{"x":0,"y":30,"z":0},"position":{"x":[0,0],"y":[1,5],"z":[0,0]},"width":[1,1],"height":[1,1],"angle":180,"laser":{"damage":[13,13],"rate":6,"type":2,"speed":[180,200],"number":1,"angle":0,"error":5,"recoil":30}}},"typespec":{"name":"Ragnarok","level":1,"model":10,"code":110,"specs":{"shield":{"capacity":[400,450],"reload":[5,5]},"generator":{"capacity":[150,165],"reload":[90,90]},"ship":{"mass":160,"speed":[110,120],"rotation":[45,80],"acceleration":[85,100]}},"shape":[3.808,3.816,3.144,2.27,1.693,1.375,1.37,1.346,1.276,1.235,1.212,1.224,1.258,1.343,1.405,1.563,1.712,1.989,2.522,2.995,3.521,3.927,3.868,3.659,3.543,0.651,3.543,3.659,3.868,3.927,3.521,2.995,2.522,1.989,1.712,1.563,1.405,1.343,1.258,1.224,1.212,1.235,1.276,1.346,1.37,1.375,1.693,2.27,3.144,3.816],"lasers":[{"x":1.08,"y":2.78,"z":0,"angle":180,"damage":[28,28],"rate":1.5,"type":2,"speed":[180,230],"number":2,"spread":3,"error":2,"recoil":80},{"x":-1.08,"y":2.78,"z":0,"angle":-180,"damage":[28,28],"rate":1.5,"type":2,"speed":[180,230],"number":2,"spread":3,"error":2,"recoil":80},{"x":0,"y":0.58,"z":0,"angle":180,"damage":[13,13],"rate":6,"type":2,"speed":[180,200],"number":1,"spread":0,"error":5,"recoil":30}],"radius":3.927}}',
                ]
            },
            {
                TIER: 2,
                SHIPS: [                    
                    '{"name":"Vanquisher","level":2,"model":1,"size":2.2,"specs":{"shield":{"capacity":[730,730],"reload":[7,7]},"generator":{"capacity":[280,280],"reload":[135,135]},"ship":{"mass":460,"speed":[70,70],"rotation":[50,50],"acceleration":[170,170]}},"bodies":{"main":{"section_segments":12,"offset":{"x":50,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-40,-80,-37,-30,-17,-10,10,17,30,40,40,45,45,80,80,85,85,99,99,90,86],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6.7,6.7,12.5,12.5,15,15,20,25,25,23,23,25,25,20,20,25,22,17,15,0],"height":[0,6.7,6.7,12.5,12.5,15,15,20,25,25,23,23,25,25,20,20,25,22,17,15,0],"texture":[12,18,8,10,1,17,4,18,8,4,17,4,13,4,17,4,63,63,12,17],"propeller":1,"laser":{"damage":[22.22,22.22],"rate":0.5,"type":1,"speed":[210,210],"recoil":40,"number":5,"error":0.1}},"main1":{"section_segments":12,"offset":{"x":0,"y":-20,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-42,-46,-45,-35,-15,30,65,65,80,79,85,84,93,93,85],"z":[0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,5,5]},"width":[10,13,15,18,22,24,22,24,23,20,20,15,15,10,0],"height":[0,7,10,15,15,15,15,24,23,20,20,15,15,10,0],"texture":[17,63,63,4,3,4,3,2,17,3,17,4,18,17],"propeller":1},"main2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":12,"y":-20,"z":-15},"position":{"x":[-1,-1,0,2,4,5,5,5],"y":[-50,-50,-45,-35,-15,30,55,65,55],"z":[-1,-1,2,3,8,8,8,8,0]},"width":[0,5,5,5,5,5,5,5,0],"height":[0,6,11,11,7,7,7,7,0],"texture":[63]},"main2b":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":11.8,"y":-20.5,"z":-14},"position":{"x":[-1,-1,0,2,4,5,0,0],"y":[-50,-50,-45,-35,-15,30,5,65,55],"z":[-1,-1,2,3,8,8,0,0,0]},"width":[0,2,2,2,2,2,2,2,0],"height":[0,6,11,11,7,7,7,7,0],"texture":[3]},"Connector":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":22,"y":-10,"z":-28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-16,-20,-20,-13,-8,11,17,23,23,23],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,3,5,5,5,5,5,5,3,0],"height":[12,12,10,20,23,23,23,10,16,16,0],"texture":[12.06,17,4,63,17,18,17,63,63,17],"angle":70,"vertical":1},"Connector2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":22,"y":-15,"z":37},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-16,-20,-20,-13,-8,11,17,23,23,23],"z":[0,0,0,0,0,0,-5,-5,-5,0,0,0,0,0]},"width":[0,3,3,3,3,3,3,3,3,3,0],"height":[0,3,3,3,3,3,3,3,3,3,0],"texture":[17],"angle":70,"vertical":1},"Connector3":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":22,"y":-15,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-16,-20,-20,-13,-8,11,17,23,23,23],"z":[0,0,0,0,0,0,-5,-5,-5,0,0,0,0,0]},"width":[0,3,3,3,3,3,3,3,3,3,0],"height":[0,3,3,3,3,3,3,3,3,3,0],"texture":[17],"angle":70,"vertical":1},"cockpitTop":{"section_segments":[45,125,235,315],"offset":{"x":0,"y":-29.5,"z":9},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-17,-11.5,10,30,30],"z":[0,0,0,-1.5,0,0,0,0,0]},"width":[0,9.5,16.5,17,0],"height":[1.8,2,2,4,0],"texture":[3]},"cockpitTop2":{"section_segments":[45,125,235,315],"offset":{"x":5,"y":-29.5,"z":9.5},"position":{"x":[-3,-1,3,3,0,0,0,0,0],"y":[-12,-7,10,30,30],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[0.5,2,3,3,0],"height":[1.8,2,2,4,0],"texture":[63]},"cockpitTop3":{"section_segments":[45,125,235,315],"offset":{"x":0,"y":-29.5,"z":9.5},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-5,0,10,30,30],"z":[0,0,0,-1.5,0,0,0,0,0]},"width":[0.5,2,4,4,0],"height":[1.8,2,2,4,0],"texture":[4]},"windshield":{"section_segments":3,"offset":{"x":0,"y":-30,"z":4},"position":{"x":[-30,-11,10,15,10,-11,-30],"y":[-14,-12,-7,0,7,12,14],"z":[0,0,0,0,0,0,0]},"width":[0,20,10,10,10,20,0],"height":[0,5,5,5,5,5,0],"texture":[7,8.7,8.3,8.3,8.7,7],"angle":90},"cockpitbottom":{"section_segments":[45,132,228,315],"offset":{"x":0,"y":-29.5,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-24,-18.5,-5,30,30],"z":[0,0,0,1.5,0,0,0,0,0]},"width":[0,10.5,18,20,0],"height":[5,5,5,7,0],"texture":[4]},"disc":{"section_segments":6,"offset":{"x":50,"y":-106,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-10,-7,-7,7,7,10,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[5.199999999999999,5.199999999999999,5.199999999999999,9.2,9.2,9.2,9.2,5.199999999999999,5.199999999999999,5.199999999999999],"height":[6,6,6,10,10,10,10,6,6,6],"texture":[1,1,1,1,16.9,1],"propeller":0},"ring1":{"section_segments":8,"offset":{"x":50,"y":37,"z":31},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-17,-15,-5,-4,4,5,10,8,5,5],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,9,9,9,10,10,10,8,5,5,0],"height":[0,9,9,9,10,10,10,8,5,5,0],"texture":[63,63,8,63,18,4,10,63,17],"propeller":false},"ring2":{"section_segments":8,"offset":{"x":50,"y":1,"z":31},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-3,-2,-2,2,2,3,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[8,8,8,9,9,9,9,8,8,8],"height":[8,8,8,9,9,9,9,8,8,8],"texture":[1,1,1,1,63,1],"propeller":false},"ring3":{"section_segments":16,"offset":{"x":50,"y":75,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,0,-3,-7,-5,5,10,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[13,13,13,25,26,28,27,13,20,20],"height":[13,13,13,25,26,28,27,13,20,20],"texture":[17,17,17,63,8,63,17,1],"propeller":false},"rocketlauncherguns1":{"section_segments":8,"offset":{"x":50,"y":15,"z":35},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-38,-35,-20,-17,10],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,3,2.8,3,4,4,0],"height":[0,2,3,3,3,2.8,3,4,4,0],"texture":[17,3,17,13,2,2,3,17,3],"laser":{"damage":[7,7],"rate":10,"type":2,"speed":[160,160],"number":1,"angle":0,"error":1,"recoil":5}},"rocketlauncherguns2":{"section_segments":8,"offset":{"x":54,"y":15,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-38,-35,-20,-17,10],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,3,2.8,3,4,4,0],"height":[0,2,3,3,3,2.8,3,4,4,0],"texture":[17,3,17,13,2,2,3,17,3],"laser":{"damage":[10,10],"rate":4,"type":2,"speed":[180,180],"number":1,"angle":0,"error":1,"recoil":5}},"rocketlauncherguns3":{"section_segments":8,"offset":{"x":46,"y":15,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-38,-35,-20,-17,10],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,2,3,3,3,2.8,3,4,4,0],"height":[0,2,3,3,3,2.8,3,4,4,0],"texture":[17,3,17,13,2,2,3,17,3],"laser":{"damage":[10,10],"rate":5,"type":2,"speed":[190,190],"number":1,"angle":0,"error":1,"recoil":5}},"cannon":{"section_segments":8,"offset":{"x":50,"y":-33,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,-10,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,8,10,10,8,0],"height":[0,8,9,9,8,0],"angle":0,"texture":[3,3,17,3,3]},"cannon2":{"section_segments":8,"offset":{"x":60,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,-10,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,0,9,9,8,0],"height":[0,8,10,10,8,0],"angle":0,"texture":[3,3,17,3,3]},"cannon3":{"section_segments":8,"offset":{"x":40,"y":-34,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,-10,-10,10,20,30],"z":[0,0,0,0,0,0]},"width":[0,0,9,9,8,0],"height":[0,8,10,10,8,0],"angle":0,"texture":[3,3,17,3,3]},"cannon4":{"section_segments":[45,135,225,315],"offset":{"x":55,"y":-5,"z":18},"position":{"x":[0,0,0,0,0,2],"y":[0,0,0,10,12,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon5":{"section_segments":[45,135,225,315],"offset":{"x":45,"y":-5,"z":18},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,10,12,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon6":{"section_segments":[45,135,225,315],"offset":{"x":63,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,4],"y":[0,0,0,10,12,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon7":{"section_segments":[45,135,225,315],"offset":{"x":-37,"y":-5,"z":10},"position":{"x":[0,0,0,0,0,4],"y":[0,0,0,10,12,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,7,0],"height":[0,0,0,5,5,0],"angle":180,"texture":[63]},"cannon8":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-24,"z":3},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,20,20,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,5,0],"height":[0,6,0,5,5,0],"angle":180,"texture":[63]},"cannon9":{"section_segments":[45,135,225,315],"offset":{"x":-62.5,"y":-24,"z":3},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,20,20,40],"z":[0,0,0,0,0,0]},"width":[0,0,0,5,5,0],"height":[0,6,0,5,5,0],"angle":180,"texture":[63]},"cannon10":{"section_segments":[45,135,225,315],"offset":{"x":-60,"y":-24,"z":9},"position":{"x":[0,0,0,0,0,-2],"y":[0,0,0,18,20,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"cannon11":{"section_segments":[45,135,225,315],"offset":{"x":54,"y":-24,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[0,0,0,18,20,28],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"cannon12":{"section_segments":[45,135,225,315],"offset":{"x":-46,"y":-24,"z":12},"position":{"x":[0,0,0,0,0,0],"y":[0,0,0,18,20,28],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"cannon13":{"section_segments":[45,135,225,315],"offset":{"x":-40,"y":-24,"z":9},"position":{"x":[0,0,0,0,0,2],"y":[0,0,0,18,20,35],"z":[0,0,0,0,0,0]},"width":[0,0,0,0,2,0],"height":[0,6,0,0,5,0],"angle":180,"texture":[63]},"Gunsnsnss":{"section_segments":[45,135,225,315],"offset":{"x":33,"y":-5,"z":0},"position":{"x":[0,0,0,-10,-10],"y":[34,34,90,100,100],"z":[0,0,0,0,0]},"width":[0,2,2,2,2],"height":[0,2,2,2,2],"texture":[17],"angle":180},"Gunsnsnss2":{"section_segments":[45,135,225,315],"offset":{"x":67,"y":-5,"z":0},"position":{"x":[0,0,0,10,10],"y":[34,34,90,100,100],"z":[0,0,0,0,0]},"width":[0,2,2,2,2],"height":[0,2,2,2,2],"texture":[17],"angle":180},"Holder":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":50,"y":25,"z":22},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4,4,4,63,4,4],"angle":0},"Holder2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":50,"y":34,"z":22},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4,4,4,63,4,4],"angle":0},"Holder3":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":48,"y":63,"z":24},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,-2,-2,-2,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,10,10,10],"height":[0,0,0,3,3,0,0,0],"texture":[4],"angle":90},"Holder4":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":73,"y":0,"z":-63},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,-2,-2,-2,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,3,3,0,0,0],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0,"vertical":1},"Holder5":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":26,"y":0,"z":-63},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,-2,-2,-2,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,3,3,0,0,0],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0,"vertical":1},"Side":{"section_segments":10,"offset":{"x":83,"y":24,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-24,-22,-17,-7,-7,17,17,27,32,34],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,10,8,8,10,10,7,0],"height":[0,7,10,10,8,8,10,10,7,0],"texture":[11,63,18,4,17,4,18,63,11],"angle":0},"side2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":17,"y":-38,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-22,-17,-7,-7,17,17,27,32,34],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,10,8,8,10,10,7,0],"height":[0,7,10,10,8,8,10,10,7,0],"texture":[17,63,18,4,17,4,18,63,11],"angle":0},"d1":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":83,"y":-2,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[25,25,25,27,27,25,25,25],"texture":[63],"angle":0,"vertical":10},"d2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":79.5,"y":0,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,1,1,1,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[25,25,25,27,27,25,25,25],"texture":[63],"angle":90,"vertical":10},"d3":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":70,"y":11,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[15,15,15,18,18,15,15,15],"texture":[4],"angle":0},"d4":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":70,"y":41,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[15,15,15,18,18,15,15,15],"texture":[4],"angle":0},"d5":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":5,"y":-45,"z":-6},"position":{"x":[0,0,0,0,0,0,0,0],"y":[3,0,0,0,3,3,3,2],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,5,5,25,17,5,5,5],"height":[5,5,5,7,7,5,5,5],"texture":[3],"angle":95},"d6":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":10,"y":-10,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[8,8,8,12,12,8,8,8],"texture":[17],"angle":0},"d7":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":10,"y":-20,"z":-8},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[8,8,8,12,12,8,8,8],"texture":[17],"angle":0},"d8":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":10,"y":-30,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[8,8,8,12,12,8,8,8],"height":[8,8,8,12,12,8,8,8],"texture":[17],"angle":0},"d9":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":0,"y":46,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[10,10,10,17,17,10,10,10],"height":[8,8,8,12,12,8,8,8],"texture":[4],"angle":0},"d10":{"section_segments":8,"offset":{"x":25,"y":30,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[12,12,12,19,19,12,12,12],"height":[10,10,10,17,17,10,10,10],"texture":[3],"angle":0},"d11":{"section_segments":8,"offset":{"x":25,"y":20,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[12,12,12,19,19,12,12,12],"height":[10,10,10,17,17,10,10,10],"texture":[3],"angle":0},"C1":{"section_segments":[45,85,135,225,275,315],"offset":{"x":0,"y":22,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-24,-24,-18,-13,-10,20,23,30,34,34],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,23,23,18,18,23,23,22,0],"height":[0,20,23,23,18,18,23,23,22,0],"texture":[3,63,4,4,17,4,8,63,63],"angle":0},"C2":{"section_segments":[45,125,235,315],"offset":{"x":7,"y":20.5,"z":11},"position":{"x":[0,0,-4,-4,0,0,-1,-1,0],"y":[-12,-5,0,12,16,30,70,70],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[4,4,4,4,4,4,2,0],"height":[4,4,4,4,4,4,2,0],"texture":[63]},"C3":{"section_segments":[45,125,235,315],"offset":{"x":11,"y":20.5,"z":9},"position":{"x":[0,0,0,0,0,0,-2,-2,0],"y":[-12,-5,0,12,16,30,60,60],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[3,3,3,3,3,3,2,0],"height":[4,4,4,4,4,4,2,0],"texture":[3.1]},"C4":{"section_segments":[45,125,235,315],"offset":{"x":19,"y":20.5,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-12,-5,0,12,16,30],"z":[0,0,0,0.5,0,0,0,0,0]},"width":[3,3,3,3,3,3,0],"height":[4,4,4,4,4,4,0],"texture":[63]},"C5":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":8,"y":14,"z":1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0},"C6":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":8,"y":24,"z":1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0},"C7":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":8,"y":34,"z":1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[5,0,0,0,5,5,5,5],"z":[0,0,0,0,0,0,0,0,0]},"width":[15,15,15,17,17,15,15,15],"height":[10,10,10,12,12,10,10,10],"texture":[4],"angle":0}},"wings":{"main1":{"doubleside":true,"offset":{"x":50,"y":-83,"z":10},"length":[2,8,0,5],"width":[10,12,10,61,10],"angle":[70,30,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[0,8,13,63],"bump":{"position":35,"size":10}},"main2":{"doubleside":true,"offset":{"x":-50,"y":-83,"z":10},"length":[2,8,0,5],"width":[10,12,10,61,10],"angle":[70,30,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[0,8,13,63],"bump":{"position":35,"size":10}},"main3":{"doubleside":true,"offset":{"x":-58,"y":-78,"z":-20},"length":[1,8,0,5],"width":[10,12,10,80,10],"angle":[0,40,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[63,63,63,63],"bump":{"position":35,"size":10}},"main4":{"doubleside":true,"offset":{"x":43,"y":-78,"z":-20},"length":[1,8,0,5],"width":[10,12,10,80,10],"angle":[0,40,20,28],"position":[-26,7.5,0,-17.5,2.5],"texture":[63,63,63,63],"bump":{"position":35,"size":10}}},"typespec":{"name":"Vanquisher","level":2,"model":1,"code":201,"specs":{"shield":{"capacity":[730,730],"reload":[7,7]},"generator":{"capacity":[280,280],"reload":[135,135]},"ship":{"mass":460,"speed":[70,70],"rotation":[50,50],"acceleration":[170,170]}},"shape":[2.91,3.149,6.058,6.368,6.018,5.209,4.722,4.128,3.719,3.462,3.263,3.236,3.305,4.102,4.185,4.359,4.644,4.651,4.605,5.046,4.852,4.429,4.133,3.932,3.996,3.99,3.996,3.932,4.133,4.429,4.852,5.046,4.605,4.651,4.644,4.359,4.185,4.102,3.652,3.236,3.263,3.462,3.719,4.128,4.722,5.209,6.018,6.368,6.058,3.149],"lasers":[{"x":2.2,"y":-5.016,"z":0,"angle":0,"damage":[22.22,22.22],"rate":0.5,"type":1,"speed":[210,210],"number":5,"spread":0,"error":0.1,"recoil":40},{"x":-2.2,"y":-5.016,"z":0,"angle":0,"damage":[22.22,22.22],"rate":0.5,"type":1,"speed":[210,210],"number":5,"spread":0,"error":0.1,"recoil":40},{"x":2.2,"y":-1.012,"z":1.54,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[160,160],"number":1,"spread":0,"error":1,"recoil":5},{"x":-2.2,"y":-1.012,"z":1.54,"angle":0,"damage":[7,7],"rate":10,"type":2,"speed":[160,160],"number":1,"spread":0,"error":1,"recoil":5},{"x":2.376,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":4,"type":2,"speed":[180,180],"number":1,"spread":0,"error":1,"recoil":5},{"x":-2.376,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":4,"type":2,"speed":[180,180],"number":1,"spread":0,"error":1,"recoil":5},{"x":2.024,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":5,"type":2,"speed":[190,190],"number":1,"spread":0,"error":1,"recoil":5},{"x":-2.024,"y":-1.012,"z":1.232,"angle":0,"damage":[10,10],"rate":5,"type":2,"speed":[190,190],"number":1,"spread":0,"error":1,"recoil":5}],"radius":6.368}}',
                    '{"name":"Sunder","level":2,"model":2,"size":1.6,"specs":{"shield":{"capacity":[800,800],"reload":[8,8]},"generator":{"capacity":[230,235],"reload":[180,180]},"ship":{"mass":555,"speed":[65,65],"rotation":[25,25],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":6,"offset":{"x":0,"y":15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-195,-160,-80,0,80,120,141,141,131],"z":[6,2,0,0,0,0,0,0,0]},"width":[10,25,30,30,30,10,13,12,0],"height":[0,20,20,20,20,20,16,15,0],"texture":[63,1.9,1.9,1.9,1.9,4,16.9],"propeller":true},"center_ridge":{"section_segments":7,"offset":{"x":0,"y":15,"z":18},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-197,-195,-190,-160,-156,0,80,120,140,140],"z":[-11,-11,-10,0,0,0,0,-4,0,0]},"width":[4,8,12,20,20,20,20,17,17,0],"height":[0,2,3,13,13,13,13,10,6,0],"texture":[63,63,7,63,2.9,2.9,8,12.9]},"big_guns":{"section_segments":8,"offset":{"x":30,"y":-35,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-110,-130,-125,-50,-46,-20,-16,-16],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,7,7,8,8,7,0],"height":[0,5,7,7,8,8,7,0],"texture":[17,63,2,13,3,63,2],"laser":{"damage":[14,14],"recoil":0,"speed":[220,220],"error":0,"angle":0,"rate":10,"number":1}},"turret_platforms":{"section_segments":[45,135,225,315],"angle":90,"offset":{"x":45,"y":15,"z":0},"position":{"x":[0,0,0,-20,-10,-10,0,0],"y":[-20,-20,10,10,25,25],"z":[0,0,0,0,-10,-10,0,0]},"width":[0,120,80,50,35,0],"height":[0,10,5,3,3,0],"texture":[2,1,63]},"angled_plate_thing":{"section_segments":[45,135,225,315],"angle":47.5,"offset":{"x":67,"y":-26,"z":3},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3},"angled_plate_thing1":{"section_segments":[45,135,225,315],"angle":47.5,"offset":{"x":67,"y":-26,"z":3.1},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,0.5,0.5,0],"height":[0,4,4,0],"texture":17},"angled_plate_thing2":{"section_segments":[45,135,225,315],"angle":133.5,"offset":{"x":67,"y":55,"z":3},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3},"angled_plate_thing3":{"section_segments":[45,135,225,315],"angle":133.5,"offset":{"x":67,"y":55,"z":3.1},"position":{"x":[0,0,0,0],"y":[-60,-60,-20,-20],"z":[3,3,0,0]},"width":[0,0.5,0.5,0],"height":[0,4,4,0],"texture":17},"bigbaccengines1":{"section_segments":12,"offset":{"x":25,"y":110,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,5,-1,1,15,20,40,45,60,60,50],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,9,10,11,11,10,9,6,5,0],"height":[0,7,9,10,11,11,10,9,6,5,0],"texture":[3,17,4,2,17,2,17,4,17],"propeller":true},"bigbaccengines2":{"section_segments":12,"offset":{"x":40,"y":50,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,5,-1,1,15,20,40,45,60,60,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,9,10,11,11,10,9,6,5,0],"height":[0,3,4,5,6,6,5,4,3,2,0],"texture":[3,17,4,2,17,2,17,4,17],"propeller":true},"ring1":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-79,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring2":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-73,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring3":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-67,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring4":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-61,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring5":{"vertical":false,"section_segments":6,"offset":{"x":30,"y":-55,"z":-10},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[5,10,10,5],"height":[5,10,10,5],"texture":[1.9,16.9,1.9,1.9],"angle":0},"ring7":{"vertical":false,"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-70,"z":18},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[10,20,20,10],"height":[10,20,20,10],"texture":[2,17,2,2],"angle":90},"ring8":{"vertical":false,"section_segments":20,"offset":{"x":0,"y":-70,"z":17},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[10,20,20,10],"height":[7.5,15,15,7.5],"texture":[2,17,2,2],"angle":0},"ring9":{"vertical":false,"section_segments":20,"offset":{"x":0,"y":128,"z":15},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[8.5,17,17,8.5],"height":[6,12,12,6],"texture":[2,17,2,2],"angle":0},"ring10":{"vertical":false,"section_segments":[-95,-90,-80,-70,-60,-50,-40,-30,-20,-10,0,10,20,30,40,50,60,70,80,90,95],"offset":{"x":0,"y":153.1,"z":13},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[8.5,17,17,8.5],"height":[7.5,15,15,7.5],"texture":[2,17,2,2],"angle":0},"tubething1":{"section_segments":6,"offset":{"x":30,"y":-11,"z":95},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":20},"tubething2":{"section_segments":6,"offset":{"x":30,"y":-11,"z":112},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":20},"tubething3":{"section_segments":6,"offset":{"x":0,"y":24,"z":-15},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":0},"tubething4":{"section_segments":6,"offset":{"x":0,"y":24,"z":20},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":0},"tubething5":{"section_segments":6,"offset":{"x":0,"y":24,"z":-50},"position":{"x":[0,0,0,0,0],"y":[0,0,8,8,10],"z":[0,0,0,0,0]},"width":[0,6,6,4,0],"height":[0,6,6,4,0],"texture":[2.9,2.9,16.9,2.9,1.9],"vertical":true,"angle":0},"plate1":{"section_segments":[45,135,225,315],"offset":{"x":32,"y":-104,"z":-6},"position":{"x":[0,0,0,0],"y":[-4,-4,4,4],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3,"angle":0},"plate2":{"section_segments":[45,135,225,315],"offset":{"x":32,"y":-137,"z":-4.5},"position":{"x":[0,0,0,0],"y":[-23,-23,23,23],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":3,"angle":0},"plate3":{"section_segments":[45,135,225,315],"offset":{"x":52,"y":15,"z":3},"position":{"x":[0,0,0,0],"y":[-55,-55,55,55],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,4,4,0],"texture":3,"angle":0},"plate4":{"section_segments":[45,135,225,315],"offset":{"x":19.7,"y":-25,"z":12},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,1,1,0],"texture":63,"angle":0},"plate5":{"section_segments":[45,135,225,315],"offset":{"x":52,"y":15,"z":3.1},"position":{"x":[0,0,0,0],"y":[-55,-55,55,55],"z":[0,0,0,0]},"width":[0,0.5,0.5,0],"height":[0,4,4,0],"texture":17,"angle":0},"deco1":{"vertical":true,"section_segments":[-140,-130,-50,-40,40,50,130,140],"offset":{"x":32,"y":-4,"z":138},"position":{"x":[0,0,0,0],"y":[-2,-2,2,2],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,20,20,0],"texture":[3,2,16.99,17],"angle":20},"deco2":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":17.7,"y":20,"z":-94},"position":{"x":[0,0,0,0],"y":[-9,-9,9,9],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":63,"angle":-19},"deco3":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":7.7,"y":30,"z":-94},"position":{"x":[0,0,0,0],"y":[-8.4,-8.4,8.4,8.4],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":63,"angle":-74},"cover1":{"section_segments":6,"offset":{"x":25,"y":155,"z":18},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-3,-3]},"width":[0,5,2,0],"height":[0,1,1,0],"texture":2.9,"angle":0},"cover2":{"section_segments":6,"offset":{"x":25,"y":155,"z":18.5},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-3,-3]},"width":[0,1.5,0.5,0],"height":[0,1,1,0],"texture":16.9,"angle":0},"cover3":{"section_segments":6,"offset":{"x":25,"y":155,"z":2},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,3,3]},"width":[0,5,2,0],"height":[0,1,1,0],"texture":2.9,"angle":0},"cover4":{"section_segments":6,"offset":{"x":33.1,"y":155,"z":10},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1.5,0.5,0],"texture":16.9,"angle":0},"cover5":{"section_segments":6,"offset":{"x":33,"y":155,"z":10},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,5,2,0],"texture":2.9,"angle":0},"cover6":{"section_segments":6,"offset":{"x":17,"y":155,"z":10},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,5,2,0],"texture":2.9,"angle":0},"cover7":{"section_segments":6,"offset":{"x":16.9,"y":155,"z":10},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1.5,0.5,0],"texture":16.9,"angle":0},"cover8":{"section_segments":6,"offset":{"x":40,"y":95,"z":3},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-1,-1]},"width":[0,4,1.8,0],"height":[0,1,0.5,0],"texture":2.9,"angle":0},"cover9":{"section_segments":6,"offset":{"x":40,"y":95,"z":3.2},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-1,-1]},"width":[0,1.6,0.5,0],"height":[0,1,0.5,0],"texture":16.9,"angle":0},"cover10":{"section_segments":6,"offset":{"x":40,"y":95,"z":-5},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,1,1]},"width":[0,4,1.8,0],"height":[0,1,0.5,0],"texture":2.9,"angle":0},"cover11":{"section_segments":6,"offset":{"x":40,"y":95,"z":-5},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,1,1]},"width":[0,4,1.8,0],"height":[0,1,0.5,0],"texture":2.9,"angle":0},"cover12":{"section_segments":6,"offset":{"x":48,"y":95,"z":-1},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,0.5,0],"height":[0,3,1.8,0],"texture":2.9,"angle":0},"cover13":{"section_segments":6,"offset":{"x":48.1,"y":95,"z":-1},"position":{"x":[0,0,-4,-4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,0.5,0],"height":[0,1.4,0.8,0],"texture":16.9,"angle":0},"cover14":{"section_segments":6,"offset":{"x":32.2,"y":95,"z":-1},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,1,0.5,0],"height":[0,3,1.8,0],"texture":2.9,"angle":0},"cover15":{"section_segments":6,"offset":{"x":32,"y":95,"z":-1},"position":{"x":[0,0,4,4],"y":[0,0,25,25],"z":[0,0,0,0]},"width":[0,0.8,0.5,0],"height":[0,1.8,1.4,0],"texture":16.9,"angle":0},"front":{"section_segments":6,"offset":{"x":1,"y":-145,"z":31},"position":{"x":[4,7,13,0,16,16],"y":[-35,-30,0,0,58,58],"z":[-24,-22,-6,-0.7,-6,-6]},"width":[0,2,3,2,2,0],"height":[0,2,2,2,2,0],"texture":63,"angle":0},"front2":{"section_segments":6,"offset":{"x":17,"y":-87,"z":26},"position":{"x":[0,0,2,2],"y":[0,0,15,15],"z":[-1,-1,-13,-13]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":63,"angle":0},"bacc":{"section_segments":6,"offset":{"x":0,"y":128,"z":25},"position":{"x":[0,0,0,0],"y":[0,0,25,25],"z":[0,0,-2,-2]},"width":[0,4,4,0],"height":[0,1,1,0],"texture":[[15]],"angle":0},"back":{"section_segments":6,"offset":{"x":0,"y":94,"z":27},"position":{"x":[0,0,0,0],"y":[0,0,35,35],"z":[0,0,-2,-2]},"width":[0,8,4,0],"height":[0,6.5,1,0],"texture":[[15]],"angle":0},"top":{"section_segments":6,"offset":{"x":0,"y":-70,"z":27},"position":{"x":[0,0,0,0],"y":[0,0,165,165],"z":[0,0,0,0]},"width":[0,8,8,0],"height":[0,4,4,0],"texture":[[15]],"angle":0},"top2":{"section_segments":6,"offset":{"x":0,"y":-145,"z":27},"position":{"x":[0,0,0,0],"y":[-35,3,75,75],"z":[-22,3,1,0]},"width":[3,3,8,0],"height":[4,4,4,0],"texture":[63,15.1],"angle":0},"base2":{"section_segments":20,"offset":{"x":37,"y":2,"z":29},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base22":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":29},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand2":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-85},"stand22":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":5},"circle2":{"section_segments":20,"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":5},"circle22":{"section_segments":20,"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":5},"rails2":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-85,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails22":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-85},"outerplating2":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-85},"outerplating22":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":-29,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-85},"base3":{"section_segments":20,"offset":{"x":37,"y":2,"z":-0.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base23":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":-0.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand3":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-90},"stand23":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":0},"circle3":{"section_segments":20,"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"circle23":{"section_segments":20,"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"rails3":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails23":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90},"outerplating3":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"outerplating23":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":0.5,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"base4":{"section_segments":20,"offset":{"x":37,"y":2,"z":-29.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base24":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":-29.5},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand4":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-90},"stand24":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":0},"circle4":{"section_segments":20,"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"circle24":{"section_segments":20,"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":0},"rails4":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails24":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-90},"outerplating4":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"outerplating24":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":29.5,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-90},"base5":{"section_segments":20,"offset":{"x":37,"y":2,"z":-59},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,8.399999999999999,8.399999999999999,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"vertical":true},"base25":{"section_segments":20,"offset":{"x":37,"y":2.2,"z":-59},"position":{"x":[0,0,0,0],"y":[0,0,7,7],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,7,7,0],"texture":17,"vertical":true},"stand5":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-95},"stand25":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0,0,0],"y":[-11.2,-11.2,-9.799999999999999,9.799999999999999,11.2,11.2],"z":[-1.4,-1.4,1.4,1.4,-1.4,-1.4]},"width":[0,2.8,2.8,2.8,2.8,0],"height":[0,5.6,5.6,5.6,5.6,0],"texture":3,"angle":-5},"circle5":{"section_segments":20,"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0],"y":[-4.8999999999999995,-4.8999999999999995,-3.5,-3.5],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":-5},"circle25":{"section_segments":20,"offset":{"x":37,"y":59,"z":2},"position":{"x":[0,0,0,0],"y":[3.5,3.5,4.8999999999999995,4.8999999999999995],"z":[5,5,5,5]},"width":[0,5.6,5.6,0],"height":[0,8.399999999999999,8.399999999999999,0],"texture":4,"angle":-5},"rails5":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997,0.9599999999999997],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-95,"laser":{"damage":[6,6],"speed":[160,200],"number":1,"rate":6.5,"error":3,"angle":0}},"rails25":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1,-1.1],"y":[-11.76,-11.76,-8.959999999999999,-3.36,-0.5599999999999999,2.8,5.6,5.6],"z":[6.9,6.9,6.9,6.9,6.9,6.9,6.9,6.9]},"width":[0,0.7,0.7,0.7,0.7,0.7,0.7,0],"height":[0,2.8,2.8,2.8,2.8,2.8,2.8,0],"texture":[4,4,17,4,17,4,4,4],"angle":-95},"outerplating5":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[-2.94,-2.94,-2.94,-2.38,-2.38,-2.38],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-95},"outerplating25":{"section_segments":[45,135,225,315],"offset":{"x":37,"y":59,"z":2},"position":{"x":[2.94,2.94,2.94,1.54,1.54,2.94],"y":[-11.620000000000001,-11.620000000000001,2.38,2.38,6.58,6.58],"z":[7,7,7,7,7,7]},"width":[0,0.7,0.7,2.8,2.8,0],"height":[0,2.8,2.8,2.8,2.8,0],"texture":3,"angle":-95},"reactorsegment0":{"section_segments":4,"offset":{"x":0,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":0,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment1":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":30,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment2":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":60,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment3":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":90,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment4":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":120,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment5":{"section_segments":4,"offset":{"x":0.001,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":150,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactorsegment6":{"section_segments":4,"offset":{"x":0,"y":15,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":180,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment0":{"section_segments":4,"offset":{"x":0,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":0,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment1":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":30,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment2":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":60,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment3":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":90,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment4":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":120,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment5":{"section_segments":4,"offset":{"x":0.001,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":150,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor2segment6":{"section_segments":4,"offset":{"x":0,"y":50,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":180,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment0":{"section_segments":4,"offset":{"x":0,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":0,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment1":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":30,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment2":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":60,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment3":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":90,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment4":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":120,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment5":{"section_segments":4,"offset":{"x":0.001,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":150,"texture":[18,17,17,17,16,2,2,17,17,63]},"reactor3segment6":{"section_segments":4,"offset":{"x":0,"y":-20,"z":31.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,5.714285714285714,6.666666666666666,7.619047619047619,8.571428571428571,10,11.904761904761905,13.333333333333332,13.809523809523808,13.809523809523808,14.285714285714285,7.142857142857142,0],"z":[0,0,2.5,2.5,2,3,3.1,0,0,-7.5,-10,-10.5,-10.5]},"width":[0,1.5311382424635582,1.7863279495408177,2.0415176566180775,2.2967073636953375,2.679491924311227,3.1898713384657467,3.5726558990816355,3.7002507526202657,3.7002507526202657,3.8278456061588955,1.9139228030794477,0,null],"height":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"angle":180,"texture":[18,17,17,17,16,2,2,17,17,63]},"W1":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":0,"y":37,"z":-118},"position":{"x":[0,0,0,0,0,0,0],"y":[-60,-60,-30,0,0,10,10],"z":[-30,-30,-15,0,3,7,0]},"width":[0,2,2,2,2,2,0],"height":[0,15,20,25,20,20,0],"texture":[63,63,11,4,3,4],"angle":180,"vertical":1},"W2":{"section_segments":[40,50,130,140,140,220,230,310,320],"offset":{"x":0,"y":37,"z":-118},"position":{"x":[0,0,0,0,0,0,0],"y":[-55,-55,-30,0,0,10,10],"z":[-36,-36,-23,-8,0,7,0]},"width":[0,3,3,3,3,3,0],"height":[0,7,10,15,10,10,0],"texture":[4,4,4,3],"angle":180,"vertical":1}},"typespec":{"name":"Sunder","level":2,"model":2,"code":202,"specs":{"shield":{"capacity":[800,800],"reload":[8,8]},"generator":{"capacity":[230,235],"reload":[180,180]},"ship":{"mass":555,"speed":[65,65],"rotation":[25,25],"acceleration":[100,120]}},"shape":[5.825,5.637,5.397,3.874,2.872,2.308,2.179,2.206,2.175,2.005,1.889,1.816,2.038,2.257,2.311,2.406,2.554,2.748,2.769,2.836,3.017,3.59,4.096,5.457,5.839,5.104,5.839,5.457,4.096,3.59,3.017,2.836,2.769,2.748,2.554,2.406,2.311,2.257,2.038,1.816,1.889,2.005,2.175,2.206,2.179,2.308,2.872,3.874,5.397,5.637],"lasers":[{"x":0.96,"y":-5.28,"z":-0.32,"angle":0,"damage":[14,14],"rate":10,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.96,"y":-5.28,"z":-0.32,"angle":0,"damage":[14,14],"rate":10,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.562,"y":-0.93,"z":0.064,"angle":-85,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.562,"y":-0.93,"z":0.064,"angle":85,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":1.56,"y":0.047,"z":0.064,"angle":-90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.56,"y":0.047,"z":0.064,"angle":90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":1.56,"y":0.975,"z":0.064,"angle":-90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.56,"y":0.975,"z":0.064,"angle":90,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":1.556,"y":1.951,"z":0.064,"angle":-95,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0},{"x":-1.556,"y":1.951,"z":0.064,"angle":95,"damage":[6,6],"rate":6.5,"speed":[160,200],"number":1,"spread":0,"error":3,"recoil":0}],"radius":5.839}}',
                    '{"name":"Cairngorgon","level":2,"model":3,"size":1.3,"specs":{"shield":{"capacity":[740,740],"reload":[9,9]},"generator":{"capacity":[210,210],"reload":[100,100]},"ship":{"mass":470,"speed":[110,110],"rotation":[50,50],"acceleration":[40,40]}},"bodies":{"sideEngineBody":{"section_segments":10,"offset":{"x":100,"y":-135,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[30,0,20,30,100,130,190,220,290,300,320,320,290],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,30,40,40,40,0,0,40,40,40,30,28,0],"height":[0,30,40,40,40,0,0,40,40,40,30,28,0],"texture":[17,3.9,2,10,3.9,3.9,3.9,10,2,4,17],"propeller":true,"laser":{"damage":[90,90],"rate":0.8,"type":1,"recoil":10,"speed":[100,100],"number":1,"error":0}},"sideEngineBody1":{"section_segments":10,"offset":{"x":0,"y":-215,"z":-10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[30,0,20,30,100,130,190,220,290,340,360,360,348],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,45,55,55,55,55,55,55,55,55,45,43,0],"height":[0,30,40,40,40,40,40,40,40,40,32,30,0],"texture":[17,3.9,2,10,3.9,3.9,3.9,10,2,4,17],"propeller":true},"sideEngineTop":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":100,"y":-135,"z":24},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[20,25,100,120,200,220,295,300],"z":[0,0,0,20,20,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,0],"texture":[3,3,4,16,4,3]},"sideEngineBottom":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":100,"y":-135,"z":-44},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[20,25,100,120,200,220,295,300],"z":[0,0,0,-20,-20,0,0,0,0,0,0,0,0,0]},"width":[0,20,20,20,20,20,20,0],"height":[0,15,15,15,15,15,15,0],"texture":[4,4,4,16,4]},"reactor_cubes":{"section_segments":4,"offset":{"x":100,"y":-10,"z":-25},"position":{"x":[0,0,0,0,0,20,20,-20,-20],"y":[-20,20,20,-20,-20,-19.9,20,-19.9,20],"z":[-20,-20,20,20,-20,0,0,0,0]},"width":[20,20,20,20,20,0,0,0,0],"height":[0,0,0,0,0,20,20,20,20],"texture":[177],"vertical":true,"angle":45,"propeller":false},"cockpit":{"section_segments":[40,90,180,270,320],"offset":{"x":0,"y":-135,"z":29},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-25,0,25,60,190,230],"z":[0,0,0,0,-10,-10,0]},"width":[0,20,20,20,40,40,0],"height":[0,10,12,12,20,20,0],"texture":[9,8.98,8.98,3,8.18,8.18]},"backsupport":{"section_segments":10,"offset":{"x":0,"y":-285,"z":6},"position":{"x":[0,0,0,0],"y":[360,340,410,420],"z":[0,0,-1,-10]},"width":[40,50,40,50],"height":[0,30,30,0],"texture":[3,4]},"cannons":{"section_segments":12,"offset":{"x":40,"y":35,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-130,-140,-140,-70,-10,0,10,70,80,85],"z":[-4,-4,-3,-2,0,0,0,0,0,0]},"width":[0,11,12,13,14,18,20,20,18,0],"height":[0,11,12,13,14,18,20,20,18,0],"laser":{"damage":[15,15],"rate":3,"recoil":0,"type":2,"speed":[130,130],"number":1,"error":2},"texture":[17,4,4,4,2,4,17,4]},"cannons1":{"section_segments":12,"offset":{"x":30,"y":45,"z":40},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-140,-140,-70,-10,0,10,50,60,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,6,7,8,12,14,14,14,0],"height":[0,5,6,7,8,12,14,14,14,0],"laser":{"damage":[10,10],"rate":3,"recoil":0,"type":2,"speed":[140,140],"number":1,"error":0},"texture":[17,4,4,4,2,4,17,4]},"cannon_deco":{"section_segments":10,"offset":{"x":26.5,"y":-25,"z":45},"position":{"x":[0,0,-2.2,-2.2],"y":[-70,-70,80,80],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[63]},"cannon_deco2":{"section_segments":10,"offset":{"x":25,"y":-25,"z":45.5},"position":{"x":[0,0.2,-2.2,-2.2],"y":[-80,-80,70,70],"z":[0,0.6,0.1,0.1]},"width":[0,0.5,0.5,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"cannon_deco3":{"section_segments":10,"offset":{"x":33.5,"y":-25,"z":44.8},"position":{"x":[0,0,2.2,2.2],"y":[-70,-70,80,80],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[63]},"cannon_deco4":{"section_segments":10,"offset":{"x":35,"y":-25,"z":45.5},"position":{"x":[0,-0.4,2.2,2.2],"y":[-80,-80,70,70],"z":[0,0.4,0.2,0]},"width":[0,0.5,0.5,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"cannon_deco5":{"section_segments":10,"offset":{"x":47,"y":-25,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[0,0,4,0]},"width":[0,1.5,1.5,0],"height":[0,1.5,1.5,0],"texture":[63]},"cannon_deco6":{"section_segments":10,"offset":{"x":45.5,"y":-35,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[4.5,4.5,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[17],"angle":180},"cannon_deco7":{"section_segments":10,"offset":{"x":33,"y":-25,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[0,0,4,0]},"width":[0,1.5,1.5,0],"height":[0,1.5,1.5,0],"texture":[63]},"cannon_deco8":{"section_segments":10,"offset":{"x":34.5,"y":-35,"z":33},"position":{"x":[0,0,0,0],"y":[-80,-80,70,70],"z":[4.5,4.5,0,0]},"width":[0,1,1,0],"height":[0,1,1,0],"texture":[17],"angle":180},"hub":{"section_segments":20,"offset":{"x":100,"y":32,"z":90},"position":{"x":[0,0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,4.375,6.875],"z":[0,0,0,0,0,0]},"width":[10,10,8,8,3,0],"height":[10,10,8,8,3,0],"texture":[3,17,3,18,17],"vertical":true},"hub2":{"section_segments":20,"offset":{"x":100,"y":32,"z":55},"position":{"x":[0,0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,4.375,6.875],"z":[0,0,0,0,0,0]},"width":[10,10,8,8,3,0],"height":[10,10,8,8,3,0],"texture":[3,17,3,18,17],"vertical":true},"hub3":{"section_segments":20,"offset":{"x":100,"y":32,"z":-143},"position":{"x":[0,0,0,0,0,0],"y":[-2.75,8.25,8.25,7.562500000000001,4.8125,7.562500000000001,null],"z":[0,0,0,0,0,0]},"width":[11,11,8.8,8.8,3.3000000000000003,0,null],"height":[11,11,8.8,8.8,3.3000000000000003,0,null],"texture":[3,17,3,18,17],"vertical":true},"hub4":{"section_segments":20,"offset":{"x":100,"y":32,"z":-104.50000000000001},"position":{"x":[0,0,0,0,0,0],"y":[-2.75,8.25,8.25,7.562500000000001,4.8125,7.562500000000001,null],"z":[0,0,0,0,0,0]},"width":[11,11,8.8,8.8,3.3000000000000003,0,null],"height":[11,11,8.8,8.8,3.3000000000000003,0,null],"texture":[3,17,3,18,17],"vertical":true},"hub_joints":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":-73,"z":31.4},"position":{"x":[0,0,0,0],"y":[-10,-10,11,11],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[8]},"hub_joints2":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":124.30000000000001,"z":31.4},"position":{"x":[0,0,0,0],"y":[-11,-11,12.100000000000001,12.100000000000001,null],"z":[0,0,0,0]},"width":[0,11,11,0,null],"height":[0,11,11,0,null],"texture":[8]},"hub_joints_deco":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":-77,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,-8,8,10,10],"z":[-5,-5,0,0,-5,-5]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[1,1,10,1,1],"angle":90},"hub_joints_deco2":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":-68,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,-8,8,10,10],"z":[-5,-5,0,0,-5,-5]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[1,1,10,1,1],"angle":90},"hub_joints_deco3":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":117.70000000000002,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8.8,8.8,11,11,null],"z":[-5.5,-5.5,0,0,-5.5,-5.5,null]},"width":[0,2.2,2.2,2.2,2.2,0,null],"height":[0,3.3000000000000003,3.3000000000000003,3.3000000000000003,3.3000000000000003,0,null],"texture":[1,1,10,1,1],"angle":90},"hub_joints_deco4":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":128.70000000000002,"z":38},"position":{"x":[0,0,0,0,0,0],"y":[-11,-11,-8.8,8.8,11,11,null],"z":[-5.5,-5.5,0,0,-5.5,-5.5,null]},"width":[0,2.2,2.2,2.2,2.2,0,null],"height":[0,3.3000000000000003,3.3000000000000003,3.3000000000000003,3.3000000000000003,0,null],"texture":[1,1,10,1,1],"angle":90},"front_deco":{"section_segments":[45,135,225,315],"offset":{"x":42,"y":-129.5,"z":16},"position":{"x":[0,0,0,0,0,0,-5.5,-5.5,-5.5,-5.5,0,0,-11,-11,-11,-11,0,0,-16.5,-16.5,-16.5,-16.5,0,0,-22,-22,-22,-22,0,0,-27.5,-27.5,-27.5,-27.5,0,0,-34,-33,-33,-33,0,0,-38.5,-38.5,-38.5,-38.5,0,0,-44,-44,-44,-44],"y":[-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10,0,0,-10,-10,10,10],"z":[-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0,-15,-15,0,0,0,0]},"width":[0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0,0,0,0,2.5,2.5,0],"height":[0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0,0,0,0,5,10,0],"texture":[4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16,4,17,4,16],"angle":270},"front_deco_joints":{"section_segments":[45,135,225,315],"offset":{"x":32,"y":-151,"z":22},"position":{"x":[0,0,0,0],"y":[-27,-27,27,27],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":[1,7,1]},"front_deco_joints2":{"section_segments":[45,135,225,315],"offset":{"x":51,"y":-151,"z":3},"position":{"x":[0,0,0,0],"y":[-27,-27,27,27],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,2,2,0],"texture":[1,7,1]},"back":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":10,"z":37},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-62,-62,-42,-32,12,22,45,45],"z":[-1,-1,0,0,0,0,-3,-3]},"width":[0,21,20,20,20,20,12,0],"height":[0,4,5,5,5,5,2,0],"texture":[7,7,8,5,8,7]},"back2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":15,"z":37.1},"position":{"x":[0,0,0,0],"y":[-12,-12,12,12],"z":[0,0,0,0]},"width":[0,19.9,19.9,0],"height":[0,5,5,0],"texture":[5,17,5]},"back3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-15,"z":37.1},"position":{"x":[0,0,0,0],"y":[-12,-12,12,12],"z":[0,0,0,0]},"width":[0,19.9,19.9,0],"height":[0,5,5,0],"texture":[5,17,5],"angle":180},"back4":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":-27,"z":37},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,17,17,0],"height":[0,10,10,0],"texture":[63],"angle":180},"back5":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":-5.5,"z":36},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,16,16,0],"height":[0,10,10,0],"texture":[63],"angle":180},"back6":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":5.5,"z":36},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,16,16,0],"height":[0,10,10,0],"texture":[63],"angle":180},"back7":{"section_segments":[45,50,55,60,65,70,105,255,290,295,300,305,310,315],"offset":{"x":0,"y":27,"z":37},"position":{"x":[0,0,0,0],"y":[-1.5,-1.5,1,1],"z":[0,0,0,0]},"width":[0,17,17,0],"height":[0,10,10,0],"texture":[63],"angle":180},"front":{"section_segments":[45,135,225,315],"offset":{"x":12.6,"y":-72,"z":36.7},"position":{"x":[1,1,1,6,1,1,6,1,0.2,0.2],"y":[-38,-38,-25,-20,-15,5,10,15,40,40],"z":[0,0,0,0,0,0,0,0,2,2]},"width":[0,2,2,2,2,2,2,2,2,0],"height":[0,3,3,3,3,3,3,3,3,0],"texture":[63]},"front2":{"section_segments":[45,135,225,315],"offset":{"x":12.7,"y":42,"z":39},"position":{"x":[0,0,-5.6,-5.6],"y":[-10,-10,13,13],"z":[0,0,-5.6,-5.6]},"width":[0,2,2,0],"height":[0,3,3,0],"texture":[63]},"front3":{"section_segments":[45,135,225,315],"offset":{"x":5,"y":-72,"z":36},"position":{"x":[1,1,1,6,1,1,6,1,1,1],"y":[-38,-38,-25,-20,-15,5,10,15,20,20],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,10,10,10,10,10,10,10,0],"height":[0,3,3,2,3,3,2,3,4,0],"texture":[7,7,13,13,7,13,13,7,7]},"front4":{"section_segments":4,"offset":{"x":6,"y":-110,"z":36},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,13,13,23,23,23,43,43,53,53,78,78],"z":[0,0,0,0,0,0,0,0,0,0,0,2,2]},"width":[0,7,7,0,0,0,7,7,0,0,7,7,0],"height":[0,3,4,0,0,0,4,4,0,0,4,4,0],"texture":[7]},"front5":{"section_segments":4,"offset":{"x":6,"y":42,"z":36},"position":{"x":[0,0,0,-6,-6],"y":[-10,-10,-9,13,13],"z":[1.7,1.7,2.5,-2.5,-2.5]},"width":[0,8,7,7,0],"height":[0,4,4,4,0],"texture":[7]},"diamond":{"section_segments":4,"offset":{"x":0,"y":38.7,"z":92},"position":{"x":[0,0,0],"y":[-1,-1,0],"z":[0,0,0]},"width":[0,4,0],"height":[0,4,0],"texture":[17],"vertical":true},"diamond2":{"section_segments":4,"offset":{"x":0,"y":38.7,"z":62},"position":{"x":[0,0,0],"y":[-1,-1,0],"z":[0,0,0]},"width":[0,4,0],"height":[0,4,0],"texture":17,"vertical":true}},"wings":{"topjoin":{"offset":{"x":0,"y":-95,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[0],"position":[0,0,0,50],"texture":[1],"bump":{"position":10,"size":30}},"topjoin_lights":{"offset":{"x":0,"y":-98,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[0],"position":[0,0,0,50],"texture":[17],"bump":{"position":10,"size":0}},"bottomjoin":{"offset":{"x":0,"y":-95,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[1],"bump":{"position":-10,"size":30}},"bottomjoin_lights":{"offset":{"x":0,"y":-98,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[17],"bump":{"position":-10,"size":0}},"topjoin1":{"offset":{"x":0,"y":135,"z":0},"doubleside":true,"length":[100],"width":[40,40],"angle":[0],"position":[-210,0,0,50],"texture":[11],"bump":{"position":10,"size":30}},"topjoin1_lights":{"offset":{"x":0,"y":131,"z":0},"doubleside":true,"length":[100],"width":[40,40],"angle":[0],"position":[-210,0,0,50],"texture":[17],"bump":{"position":10,"size":0}},"bottomjoin1":{"offset":{"x":0,"y":98,"z":0},"doubleside":true,"length":[100],"width":[60,60],"angle":[-25],"position":[-210,0,0,50],"texture":[11],"bump":{"position":-10,"size":30}},"bottomjoin1_lights":{"offset":{"x":0,"y":94,"z":0},"doubleside":true,"length":[100],"width":[60,60],"angle":[-25],"position":[-210,0,0,50],"texture":[17],"bump":{"position":-10,"size":0}}},"typespec":{"name":"Cairngorgon","level":2,"model":3,"code":203,"specs":{"shield":{"capacity":[740,740],"reload":[9,9]},"generator":{"capacity":[210,210],"reload":[100,100]},"ship":{"mass":470,"speed":[110,110],"rotation":[50,50],"acceleration":[40,40]}},"shape":[5.601,5.691,5.7,4.409,4.155,4.555,4.846,4.751,4.433,4.092,3.86,3.703,3.021,3.362,3.443,3.535,3.412,4.427,4.914,5.605,5.857,5.697,5.315,3.931,3.838,3.777,3.838,3.931,5.315,5.697,5.857,5.605,4.914,4.427,3.412,3.535,3.443,3.362,3.021,3.703,3.86,4.092,4.433,4.751,4.846,4.555,4.155,4.409,5.7,5.691],"lasers":[{"x":2.6,"y":-3.51,"z":-0.26,"angle":0,"damage":[90,90],"rate":0.8,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":10},{"x":-2.6,"y":-3.51,"z":-0.26,"angle":0,"damage":[90,90],"rate":0.8,"type":1,"speed":[100,100],"number":1,"spread":0,"error":0,"recoil":10},{"x":1.04,"y":-2.73,"z":0.65,"angle":0,"damage":[15,15],"rate":3,"type":2,"speed":[130,130],"number":1,"spread":0,"error":2,"recoil":0},{"x":-1.04,"y":-2.73,"z":0.65,"angle":0,"damage":[15,15],"rate":3,"type":2,"speed":[130,130],"number":1,"spread":0,"error":2,"recoil":0},{"x":0.78,"y":-2.47,"z":1.04,"angle":0,"damage":[10,10],"rate":3,"type":2,"speed":[140,140],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.78,"y":-2.47,"z":1.04,"angle":0,"damage":[10,10],"rate":3,"type":2,"speed":[140,140],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.857}}',
                    '{"name":"Epiloguer","level":2,"model":4,"size":1.2,"specs":{"shield":{"capacity":[650,650],"reload":[6,6]},"generator":{"capacity":[320,330],"reload":[110,110]},"ship":{"mass":330,"speed":[100,100],"rotation":[105,105],"acceleration":[180,180]}},"bodies":{"ball":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":113,"vertical":false,"angle":0},"ball2":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":17,"vertical":false,"angle":45},"ball3":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":17,"vertical":false,"angle":90},"ball4":{"section_segments":30,"offset":{"x":0,"y":9,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-14.265847744427303,-12.135254915624213,-8.816778784387097,-4.635254915624212,-9.18485099360515e-16,4.63525491562421,8.816778784387095,12.13525491562421,14.265847744427303,15],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"height":[0,4.635254915624211,8.816778784387097,12.135254915624213,14.265847744427303,15,14.265847744427305,12.135254915624213,8.816778784387099,4.635254915624213,1.83697019872103e-15],"texture":17,"vertical":false,"angle":135},"ring":{"section_segments":6,"offset":{"x":27,"y":18,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":0},"ring2":{"section_segments":6,"offset":{"x":27,"y":0,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":0},"ring3":{"section_segments":6,"offset":{"x":18,"y":-20.5,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":50},"ring4":{"section_segments":6,"offset":{"x":18,"y":38,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,9,10,10.5,10,9,8,7,6,5.5,6,7,8],"height":[23,24,25,25.5,25,24,23,22,21,20.5,21,22,23],"vertical":0,"texture":[4,17,63,63,17,4],"angle":-50},"ring5":{"section_segments":16,"offset":{"x":25,"y":15,"z":-49},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[12,12.5,13,13.25,13,12.5,12,11.5,11,10.75,11,11.5,12],"height":[10,10.5,11,11.25,11,10.5,10,9.5,9,8.75,9,9.5,10],"vertical":1,"texture":17,"angle":5},"ring6":{"section_segments":12,"offset":{"x":32,"y":-46,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[7,7.5,8,8.25,8,7.5,7,6.5,6,5.75,6,6.5,7],"height":[13,13.5,14,14.25,14,13.5,13,12.5,12,11.75,12,12.5,13],"vertical":0,"texture":17,"angle":0},"ring7":{"section_segments":12,"offset":{"x":32,"y":-56,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.8,-1.4000000000000001,-1,0,1,1.4000000000000001,1.8,1.4000000000000001,1,0,-1,-1.4000000000000001,-1.8],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[7,7.5,8,8.25,8,7.5,7,6.5,6,5.75,6,6.5,7],"height":[13,13.5,14,14.25,14,13.5,13,12.5,12,11.75,12,12.5,13],"vertical":0,"texture":17,"angle":0},"reactor":{"section_segments":20,"offset":{"x":0,"y":20,"z":-91},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor2":{"section_segments":20,"offset":{"x":12,"y":15,"z":48},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":10},"uwu":{"section_segments":6,"offset":{"x":0,"y":-53,"z":11.5},"position":{"x":[0,0,0,0,0,0],"y":[-3,-3,-2,2,3,3],"z":[0,0,0,0,0,0]},"width":[0,15,15,15,15,0],"height":[0,10,10,10,10,0],"texture":[3.9,16.9,18,3.9,3.9]},"back":{"section_segments":6,"offset":{"x":0,"y":27,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[16,26,36,48,60,75,90,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[30,38,40,40,40,43,34,32,0],"height":[15,23,25,28,29,28,20,18,0],"texture":[13,[15],3.9,63,3.9,18,16.9,16.9,16.9],"propeller":0},"back_sides":{"section_segments":6,"offset":{"x":0,"y":27,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[16,26,36,48,60,75,90,90,80],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[30.3,38.38,40.4,40.4,40.4,43.43,34.34,34.34,0],"height":[14.285714285714285,21.904761904761905,23.80952380952381,26.666666666666664,27.619047619047617,26.666666666666664,19.047619047619047,17.142857142857142,0],"texture":[13,[15],3.9,63,2.9,3.9,16.9,16.9,16.9]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-48,"z":2},"angle":180,"position":{"x":[0,0,0,0,0],"y":[10,40,66,84,95],"z":[-8,-3,-7,-7,-10]},"width":[13,18,16,6,0],"height":[5,15,15,8,0],"texture":[7,9,9,4],"propeller":false},"core_shield":{"angle":180,"section_segments":6,"vertical":true,"offset":{"x":0,"y":15,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-9.1,-6.5,-6.5,-5.2,0,26,32.5,35.1,26,0,-9.1],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[30,40,42,45,50,50,45,30,25,25,30],"height":[42,56,58.8,62.99999999999999,70,70,62.99999999999999,42,35,35,42],"texture":[17.95,17,4,[15],4,[15],18,4,112.9,3.9]},"main":{"section_segments":8,"offset":{"x":0,"y":-85,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-13.2,-7.199999999999999,0,12,24,33.6,54,30],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,26,28,32,32,32,32,0],"height":[0,15,18,20,20,19,20,0],"texture":[18,4,8,63,4,[15],17]},"main2":{"section_segments":8,"offset":{"x":0,"y":-130,"z":-5},"position":{"x":[0,0,0,0,0,0,0],"y":[0,-15,-15,20,45,45,45],"z":[0,0,0,0,8,8,8]},"width":[0,7.2,9,20.7,23.400000000000002,0],"height":[0,1.5,2.5,11.5,5,0],"texture":[17,17,3,18,12]},"cannons":{"section_segments":12,"offset":{"x":30,"y":-77,"z":0},"position":{"x":[0,0,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0],"y":[-51.61290322580645,-21.93548387096774,-22.58064516129032,-23.225806451612904,-23.870967741935484,-21.93548387096774,-20.64516129032258,-7.741935483870967,1.2903225806451613,3.225806451612903,12.903225806451612,16.129032258064516,35.483870967741936,38.70967741935484,48.387096774193544,51.61290322580645,50.32258064516129],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,4,6,8,5,3,3,3,5,8,8,8,8,8,8,0],"height":[0,2,4,6,8,5,3,3,5,10,14,15,15,15,15,15,0],"texture":[17,4,4,4,4,17,18,8,13,18,17,8,17,18,17,18],"laser":{"damage":[16,16],"rate":1.7,"recoil":30,"type":1,"speed":[216,284],"number":4,"error":3}},"cannon_discs":{"section_segments":12,"offset":{"x":30,"y":-115,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5,-5,-3.3333333333333335,-3.3333333333333335,0,0,1.6666666666666667,1.6666666666666667,5,5,6.666666666666667,6.666666666666667,10,10,11.666666666666668,11.666666666666668],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,0,0,3.3333333333333335,3.3333333333333335,0,0,4.166666666666667,4.166666666666667,0,0,5,5,0],"height":[0,2.5,2.5,0,0,3.3333333333333335,3.3333333333333335,0,0,4.166666666666667,4.166666666666667,0,0,5,5,0],"texture":[4,17,4,4,4,17,4,4,4,17,4,4,4,17,4],"laser":{"damage":[1,1],"rate":8,"recoil":0,"type":1,"speed":[206,204],"number":5,"error":0}},"poker":{"section_segments":12,"offset":{"x":2,"y":3,"z":0},"position":{"x":[0,0,0,0,0],"y":[9,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1.5,3,4.5,6,0],"height":[0,1.5,3,4.5,6,0],"angle":120,"texture":[18,17,4]},"poker2":{"section_segments":12,"offset":{"x":2,"y":15,"z":0},"position":{"x":[0,0,0,0,0],"y":[9,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1.5,3,4.5,6,0],"height":[0,1.5,3,4.5,6,0],"angle":60,"texture":[18,17,4]},"poker3":{"section_segments":12,"offset":{"x":0,"y":7,"z":0},"position":{"x":[0,0,0,0,0],"y":[12.6,28,29.4,32.199999999999996,33.599999999999994],"z":[0,0,0,0,0]},"width":[0,1.8,3.6,5.4,7.2,0],"height":[0,1.8,3.6,5.4,7.2,0],"angle":180,"texture":[18,17,4]},"poker4":{"section_segments":12,"offset":{"x":0,"y":11,"z":0},"position":{"x":[0,0,0,0,0],"y":[12.6,28,29.4,32.199999999999996,33.599999999999994],"z":[0,0,0,0,0]},"width":[0,1.8,3.6,5.4,7.2,0],"height":[0,1.8,3.6,5.4,7.2,0],"angle":0,"texture":[18,17,4]},"circle":{"section_segments":12,"offset":{"x":-12,"y":-42,"z":-70},"position":{"x":[0,0,0,0,0,0,0],"y":[-68.5,-71,-72.5,-72.5,-67.5,-61.5,-52.5,-47.5],"z":[0,0,0,0,0,0,0]},"width":[0,2.5,4,4,4,4,7,0],"height":[0,2.5,4,4,4,4,7,0],"texture":[17,16,18,18],"angle":195,"vertical":true},"box":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":10,"y":75,"z":10},"position":{"x":[0,0,0,0,0],"y":[-30,-5,15,25],"z":[2,0,-4,-5]},"width":[15,20,20,15],"height":[0,18,18,0],"texture":[17,17.96,17],"angle":90},"box2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-70,"z":9.5},"position":{"x":[0,0,0,0,0],"y":[-25,-15,15,25],"z":[-5,-4,-4,-5]},"width":[15,15,15,15],"height":[0,18,18,0],"texture":[63,17.96,63],"angle":90},"hubs2":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":0,"y":-2,"z":65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[15,25,23.5,23.5,25,27,25],"z":[0,0,0,0,0,0,-4,0]},"width":[8,5,3,3,3,0.2,0],"height":[18,15,13,13,13,-4,-5],"texture":[4,17,17,18,18,18,17]},"hubs":{"vertical":true,"section_segments":[45,135,225,315],"offset":{"x":5.5,"y":1,"z":-79.55},"position":{"x":[0,0,0,0,0,0,0],"y":[15,25,23.5,23.5,25,28],"z":[0,0,0,0,0,0,0]},"width":[8,5,3,3,3,0],"height":[23,20,18,18,18,0],"texture":[63,17,17,18],"angle":25},"disc1":{"section_segments":12,"offset":{"x":20,"y":68,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc2":{"section_segments":12,"offset":{"x":20,"y":85,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc3":{"section_segments":12,"offset":{"x":20,"y":77,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc4":{"section_segments":12,"offset":{"x":5,"y":-63,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"disc5":{"section_segments":12,"offset":{"x":5,"y":-72,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3,3,0,0,0,0,0,3,3,3],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[10,10,10,12,12,12,12,12,10,10],"texture":[17]},"wire":{"section_segments":8,"angle":90,"offset":{"x":30,"y":92,"z":15},"position":{"x":[-10,-10,-10,-2,-2,-2,-2,0,1,0,0],"y":[-30,-30,-21.5,-10,-8,-1,4,7,10,11.5],"z":[8,8,7,6,6,3,1,-2,-12,-12,-12]},"width":[4,4,4,4,4,4,4,4,4,0],"height":[0,4,4,4,4,4,4,4,10,0],"propeller":false,"texture":[13,13,13,13,17,13,17,13,17]},"wire2":{"section_segments":12,"angle":0,"offset":{"x":30,"y":80,"z":5},"position":{"x":[5,5,5,3,3,5,6,6,7,7,7],"y":[-65,-64,-51.5,-40,-28,-18,-8,2,12,11],"z":[0,0,0,-1,-2,-1,1,1,0,0,0]},"width":[4,4,4,4,4,4,4,4,3,0],"height":[0,3,3,3,3,3,3,3,3,0],"propeller":false,"texture":[13,13,17,13,17,13,17,13,17]},"wire3":{"section_segments":12,"angle":0,"offset":{"x":30,"y":80,"z":-2},"position":{"x":[5,5,5,3,3,5,6,6,7,7,7],"y":[-65,-64,-51.5,-40,-28,-18,-8,2,12,11],"z":[0,0,0,-2,-3,-3,-2,-2,0,0,0]},"width":[4,4,4,4,4,4,4,4,3,0],"height":[0,3,3,3,3,3,3,3,3,0],"propeller":false,"texture":[13,17,13,17,13,17,13,17,13]},"wire4":{"section_segments":8,"angle":90,"offset":{"x":20,"y":-45,"z":15},"position":{"x":[2,2,5,3,1,-2,-2,0,1,0,0],"y":[-18,-18,-14,-10,-8,-1,4,7,10,11.5],"z":[0,0.5,0.5,3,3,3,1,-2,-12,-12,-12]},"width":[4,4,4,4,4,4,4,4,4,0],"height":[0,4,4,4,4,4,4,4,10,0],"propeller":false,"texture":[13,13,13,13,17,13,17,13,17]},"back_propeller":{"section_segments":6,"offset":{"x":0,"y":137,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[34],"height":[18],"propeller":1}},"wings":{"main":{"offset":{"x":40,"y":-43,"z":9},"length":[0,22,0,22,2,22,16,0,7,0,20],"width":[55,55,55,146,320,333,167,122,35,35,192,10],"angle":[15,-35,11,11,-28,-28,-8,-8,-28,-28,0],"position":[52,50,66,54,47,47,89,80,85,93,70,130],"texture":[4,8,17,18,17,4,3,17,18,17,4],"doubleside":true,"bump":{"position":20,"size":5}},"main2":{"offset":{"x":40,"y":-41,"z":9},"length":[0,22,0,22,2,20,16,0,9,0,18.5],"width":[55,55,55,146,320,333,167,122,35,35,160,40],"angle":[15,-35,11,11,-28,-28,-8,-8,-28,-28,0],"position":[52,50,66,54,47,47,89,80,85,93,70,100],"texture":[4,12,17,4,17,63,3,17,4,17,63],"doubleside":true,"bump":{"position":20,"size":5}},"main_deco":{"offset":{"x":100.5,"y":-24,"z":-7},"length":[12,0],"width":[87,52,35],"angle":[-7,0],"position":[60,64,64],"texture":[63],"doubleside":true,"bump":{"position":50,"size":7}},"main_deco2":{"offset":{"x":62,"y":-63,"z":0},"length":[10,8,0],"width":[81,87,85,35],"angle":[20,20,0],"position":[61,65,45,64],"texture":[63],"doubleside":true,"bump":{"position":50,"size":7}},"main_deco3":{"offset":{"x":67,"y":62,"z":0},"length":[15,0],"width":[30,50],"angle":[43,43,0],"position":[16,40,40,50],"texture":[63],"doubleside":true,"bump":{"position":-50,"size":15}},"main_lights":{"offset":{"x":40,"y":-46,"z":9},"length":[0,22,0,22,2,23.5,16.5,0,9,-4,21],"width":[55,55,55,151,325,338,166,119,29,26,197,47],"angle":[15,-35,11,11,-28,-28,-9,-8,-28,-28,0],"position":[52,50,66,54,47,47,89,80,85,93,75,116],"texture":[17],"doubleside":true,"bump":{"position":20,"size":0}}},"typespec":{"name":"Epiloguer","level":2,"model":4,"code":204,"specs":{"shield":{"capacity":[650,650],"reload":[6,6]},"generator":{"capacity":[320,330],"reload":[110,110]},"ship":{"mass":330,"speed":[100,100],"rotation":[105,105],"acceleration":[180,180]}},"shape":[3.487,3.478,3.17,2.656,4.48,3.869,3.409,3.088,3.387,3.369,3.261,3.205,3.246,3.353,3.515,3.712,3.938,4.128,4.2,4.249,4.153,4.578,2.707,2.897,2.859,2.813,2.859,2.897,2.707,4.578,4.153,4.249,4.2,4.128,3.938,3.712,3.515,3.353,3.246,3.205,3.261,3.369,3.387,3.088,3.409,3.869,4.48,2.656,3.17,3.478],"lasers":[{"x":0.72,"y":-3.087,"z":0,"angle":0,"damage":[16,16],"rate":1.7,"type":1,"speed":[216,284],"number":4,"spread":0,"error":3,"recoil":30},{"x":-0.72,"y":-3.087,"z":0,"angle":0,"damage":[16,16],"rate":1.7,"type":1,"speed":[216,284],"number":4,"spread":0,"error":3,"recoil":30},{"x":0.72,"y":-2.88,"z":0,"angle":0,"damage":[1,1],"rate":8,"type":1,"speed":[206,204],"number":5,"spread":0,"error":0,"recoil":0},{"x":-0.72,"y":-2.88,"z":0,"angle":0,"damage":[1,1],"rate":8,"type":1,"speed":[206,204],"number":5,"spread":0,"error":0,"recoil":0}],"radius":4.578}}',
                    '{"name":"Vuaniha","level":2,"model":5,"size":0.6,"specs":{"shield":{"capacity":[460,610],"reload":[9,9]},"generator":{"capacity":[320,350],"reload":[70,100]},"ship":{"mass":370,"speed":[70,85],"rotation":[50,90],"acceleration":[130,130]}},"bodies":{"ring":{"section_segments":6,"offset":{"x":100,"y":-400,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[30.5,30.5,30.5,36.6,36.6,36.6,36.6,36.6,30.5,30.5],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"ring2":{"section_segments":6,"offset":{"x":100,"y":-360,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"reactor":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":85,"y":27,"z":230},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":-30},"reactor2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":85,"y":27,"z":260},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[18,15,13,12,10,2,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":-30},"ring3":{"section_segments":6,"offset":{"x":101,"y":-265,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"ring4":{"section_segments":6,"offset":{"x":101,"y":-235,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":16.9,"angle":0,"vertical":0},"reactor3":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":114,"y":30,"z":50},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[23.400000000000002,19.5,16.900000000000002,15.6,13,2.6,0],"height":[23.400000000000002,19.5,16.900000000000002,15.6,13,2.6,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":30},"ring5":{"section_segments":6,"offset":{"x":99,"y":-63.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":3.9,"angle":0,"vertical":0},"ring6":{"section_segments":6,"offset":{"x":99,"y":-23.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9.299999999999999,9.299999999999999,0,0,0,0,0,9.299999999999999,9.299999999999999,9.299999999999999],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":3.9,"angle":0,"vertical":0},"ring7":{"section_segments":[45,135,225,315],"offset":{"x":65,"y":20,"z":39},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[1,1,1,1.2,1.2,1.2,1.2,1.2,1,1],"height":[20,20,20,24,24,24,24,24,20,20],"texture":4,"angle":65,"vertical":1},"reactor4":{"section_segments":12,"offset":{"x":141,"y":0,"z":35},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"height":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"reactor5":{"section_segments":12,"offset":{"x":141,"y":0,"z":5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"height":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"reactor6":{"section_segments":12,"offset":{"x":141,"y":0,"z":-25},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"height":[12.6,10.5,9.1,8.4,7,1.4000000000000001,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"ring8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":45,"y":210,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[12,12,0,0,0,0,0,12,12,12],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[50,50,50,60,60,60,60,60,50,50],"height":[45,45,45,54,54,54,54,54,45,45],"texture":17.96,"angle":-40,"vertical":0},"ring9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":37,"y":160,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[12,12,0,0,0,0,0,12,12,12],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[50,50,50,60,60,60,60,60,50,50],"height":[44,44,44,52.8,52.8,52.8,52.8,52.8,44,44],"texture":17.96,"angle":38,"vertical":0},"reactor7":{"section_segments":[-40,-30,-20,80,90,100,200,210,220],"offset":{"x":55,"y":30,"z":-188},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[28.8,24,20.8,19.2,16,3.2,0],"texture":[17.7,16.7,16.7,17.7,17.7,16.7],"vertical":1,"angle":0},"reactor8":{"section_segments":[27,37,47,147,157,167,267,277,287],"offset":{"x":35,"y":25,"z":-135},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[17.7,16.7,16.7,17.7,17.7,16.7],"vertical":1,"angle":0},"reactor9":{"section_segments":[27,37,47,127,137,147,257,267,277],"offset":{"x":32,"y":30,"z":-240},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[18,15,13,12,10,2,0],"height":[25.2,21,18.2,16.8,14,2.8000000000000003,0],"texture":[17.7,16.7,16.7,17.7,17.7,16.7],"vertical":1,"angle":0},"ring10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":42.5,"y":212.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[4.5,4.5,0,0,0,0,0,4.5,4.5,4.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[51,51,51,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,51,51],"height":[46,46,46,55.199999999999996,55.199999999999996,55.199999999999996,55.199999999999996,55.199999999999996,46,46],"texture":17,"angle":-40,"vertical":0},"ring11":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":38,"y":163,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[4.5,4.5,0,0,0,0,0,4.5,4.5,4.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[51,51,51,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,61.199999999999996,51,51],"height":[45,45,45,54,54,54,54,54,45,45],"texture":17,"angle":38,"vertical":0},"reactor10":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":178,"y":19,"z":65},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[19.8,16.5,14.3,13.2,11,2.2,0],"height":[36,30,26,24,20,4,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":-30},"ring12":{"section_segments":6,"offset":{"x":191,"y":-85,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8.4,8.4,0,0,0,0,0,8.4,8.4,8.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[29.5,29.5,29.5,35.4,35.4,35.4,35.4,35.4,29.5,29.5],"height":[29,29,29,34.8,34.8,34.8,34.8,34.8,29,29],"texture":16.9,"angle":0,"vertical":0},"ring13":{"section_segments":6,"offset":{"x":191,"y":-55,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[8.4,8.4,0,0,0,0,0,8.4,8.4,8.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[29.5,29.5,29.5,35.4,35.4,35.4,35.4,35.4,29.5,29.5],"height":[29,29,29,34.8,34.8,34.8,34.8,34.8,29,29],"texture":16.9,"angle":0,"vertical":0},"ring14":{"section_segments":[45,135,225,315],"offset":{"x":166,"y":-5,"z":40},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[12,12,0,0,0,0,0,12,12,12],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[70,70,70,84,84,84,84,84,70,70],"texture":16.9,"angle":0,"vertical":1},"reactor11":{"section_segments":[70,75,80,160,165,170,250,255,260,340,345,350],"offset":{"x":0,"y":40,"z":-55},"position":{"x":[105,105,105,105,105,105,105,105],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor12":{"section_segments":[10,15,20,100,105,110,190,195,200,280,285,290],"offset":{"x":0,"y":40,"z":-55},"position":{"x":[-105,-105,-105,-105,-105,-105,-105,-105],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"ring15":{"section_segments":6,"offset":{"x":95,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[36,36,36,43.199999999999996,43.199999999999996,43.199999999999996,43.199999999999996,43.199999999999996,36,36],"height":[30,30,30,36,36,36,36,36,30,30],"texture":16.9,"angle":210,"vertical":0},"bottom":{"section_segments":6,"offset":{"x":0,"y":-50,"z":-200},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,-0.16000000000000003,-0.6400000000000001,-1.4400000000000004,-2.5600000000000005,-4,-5.760000000000002,-7.840000000000002,-10.240000000000002,-12.96,-12.96,-7.248000000000003,-2.208000000000002,2.1599999999999984,5.856000000000002,8.88,11.232,12.912,13.920000000000002,14.256000000000002],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,16,24,32,40,48,56,64,72,79.2,70.4,61.60000000000001,52.800000000000004,44,35.2,26.400000000000002,17.6,8.8,0],"height":[0,8,16,24,32,40,48,56,64,72,79.2,70.4,61.60000000000001,52.800000000000004,44,35.2,26.400000000000002,17.6,8.8,0],"texture":[1,1,1,1,1,1,1,1,1,1,16.9,[15.9]],"angle":180,"vertical":1},"ball":{"section_segments":12,"offset":{"x":104,"y":145,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-19.02113032590307,-16.18033988749895,-11.755705045849464,-6.180339887498949,-1.2246467991473533e-15,6.180339887498947,11.75570504584946,16.180339887498945,19.02113032590307,20],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"height":[0,6.180339887498948,11.755705045849464,16.18033988749895,19.02113032590307,20,19.021130325903073,16.18033988749895,11.755705045849465,6.18033988749895,2.4492935982947065e-15],"texture":[4,4,4,4,4,4,17,4,17,4],"vertical":0,"angle":25},"ball2":{"section_segments":16,"offset":{"x":158,"y":107,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-9,-8.559508646656381,-7.281152949374527,-5.2900672706322585,-2.781152949374527,-5.51091059616309e-16,2.781152949374526,5.290067270632258,7.281152949374526,8.559508646656381,9],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":4,"vertical":0,"angle":25},"ball3":{"section_segments":16,"offset":{"x":197,"y":88,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-8,-7.608452130361228,-6.47213595499958,-4.702282018339785,-2.4721359549995796,-4.898587196589413e-16,2.4721359549995787,4.702282018339784,6.472135954999579,7.608452130361228,8],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"height":[0,2.472135954999579,4.702282018339785,6.47213595499958,7.608452130361228,8,7.608452130361229,6.47213595499958,4.702282018339786,2.47213595499958,9.797174393178826e-16],"texture":4,"vertical":0,"angle":30},"ball4":{"section_segments":16,"offset":{"x":225.5,"y":79,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":4,"vertical":0,"angle":30},"ball5":{"section_segments":16,"offset":{"x":225,"y":110,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-16,-15.216904260722456,-12.94427190999916,-9.40456403667957,-4.944271909999159,-9.797174393178826e-16,4.944271909999157,9.404564036679568,12.944271909999157,15.216904260722456,16],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,4.944271909999158,9.40456403667957,12.94427190999916,15.216904260722456,16,15.216904260722458,12.94427190999916,9.404564036679572,4.94427190999916,1.959434878635765e-15],"height":[0,4.944271909999158,9.40456403667957,12.94427190999916,15.216904260722456,16,15.216904260722458,12.94427190999916,9.404564036679572,4.94427190999916,1.959434878635765e-15],"texture":[4],"vertical":0,"angle":30},"ring16":{"section_segments":10,"offset":{"x":210,"y":105,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":16.9,"angle":120,"vertical":0},"ring17":{"section_segments":10,"offset":{"x":223,"y":97,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[10,10,10,12,12,12,12,12,10,10],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":16.9,"angle":120,"vertical":0},"reactor13":{"section_segments":[20,25,30,110,115,120,200,205,210,290,295,300],"offset":{"x":0,"y":25,"z":-285},"position":{"x":[135,135,135,135,135,135,135,135],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[27,22.5,19.5,18,15,3,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor14":{"section_segments":[20,25,30,110,115,120,200,205,210,290,295,300],"offset":{"x":0,"y":25,"z":-305},"position":{"x":[130,130,130,130,130,130,130,130],"y":[0,9,7,7,10,7,8],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor15":{"section_segments":[60,65,70,150,155,160,240,245,250,330,335,340],"offset":{"x":0,"y":25,"z":-285},"position":{"x":[-135,-135,-135,-135,-135,-135,-135,-135],"y":[0,6.3,4.8999999999999995,4.8999999999999995,7,4.8999999999999995,5.6000000000000005],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[27,22.5,19.5,18,15,3,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor16":{"section_segments":12,"offset":{"x":205,"y":19,"z":-14},"position":{"x":[20,20,20,20,20,20,20,20],"y":[0,10.8,8.399999999999999,8.399999999999999,12,8.399999999999999,9.600000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"ring18":{"section_segments":8,"offset":{"x":103,"y":75,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[35,35,35,42,42,42,42,42,35,35],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":120,"vertical":0},"ring19":{"section_segments":8,"offset":{"x":118,"y":68,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":120,"vertical":0},"ring20":{"section_segments":[45,135,225,315],"offset":{"x":138,"y":310,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":-20,"vertical":0},"ring21":{"section_segments":[45,135,225,315],"offset":{"x":144,"y":290,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7.5,7.5,0,0,0,0,0,7.5,7.5,7.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[33,33,33,39.6,39.6,39.6,39.6,39.6,33,33],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":17,"angle":-20,"vertical":0},"ring22":{"section_segments":[10,100,190,280],"offset":{"x":120,"y":0,"z":-300},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[16.5,16.5,0,0,0,0,0,16.5,16.5,16.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[13,13,13,15.6,15.6,15.6,15.6,15.6,13,13],"height":[25,25,25,30,30,30,30,30,25,25],"texture":17,"angle":0,"vertical":1},"ring23":{"section_segments":6,"offset":{"x":205,"y":13,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[15,15,0,0,0,0,0,15,15,15],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,0,0,54,54,54,54,54,0,0],"height":[0,0,0,42,42,42,42,42,0,0],"texture":18,"angle":90,"vertical":0},"ring24":{"section_segments":14,"offset":{"x":32,"y":8,"z":-240},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring25":{"section_segments":14,"offset":{"x":32,"y":-8,"z":-245},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring26":{"section_segments":14,"offset":{"x":210,"y":-12,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[9,9,0,0,0,0,0,9,9,9],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[30,30,30,36,36,36,36,36,30,30],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring27":{"section_segments":14,"offset":{"x":213,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,24,24,24,24,24,20,20],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring28":{"section_segments":14,"offset":{"x":213,"y":4,"z":-30},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[30,30,30,36,36,36,36,36,30,30],"texture":17,"angle":0,"vertical":1},"ring29":{"section_segments":14,"offset":{"x":150,"y":43,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[22,22,22,26.4,26.4,26.4,26.4,26.4,22,22],"height":[35,35,35,42,42,42,42,42,35,35],"texture":18,"angle":-68,"vertical":0},"ring30":{"section_segments":14,"offset":{"x":170,"y":33,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[22,22,22,26.4,26.4,26.4,26.4,26.4,22,22],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":18,"angle":-68,"vertical":0},"ring31":{"section_segments":14,"offset":{"x":190,"y":23,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6,6,0,0,0,0,0,6,6,6],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[22,22,22,26.4,26.4,26.4,26.4,26.4,22,22],"height":[34,34,34,40.8,40.8,40.8,40.8,40.8,34,34],"texture":18,"angle":-68,"vertical":0},"cannons":{"section_segments":6,"offset":{"x":100,"y":-125,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-200,-200,-295,-295,-280,-220,-200,-190,-50,-45,-55,30,25,30,120,144,152,176,176],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,23.5,25,35,40,40,40,40,35,0,0,35,40,40,40,40,40,0],"height":[0,4,28.5,30,40,40,40,40,40,35,0,0,35,40,40,40,40,40,0],"texture":[16.9,3.9,17,3.9,3.9,3.9,16.9,18,16.9,112.9,1,112.9,16.9,18,3.9,16.9,3.9],"laser":{"damage":[30,30],"rate":10,"type":1,"speed":[10,180],"recoil":90,"error":3,"number":1}},"side_cannons":{"section_segments":6,"offset":{"x":190,"y":-170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[48,53,55,70,65,70,118,174,174],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,18.18181818181818,27.27272727272727,27.27272727272727,31.818181818181817,36.36363636363636,36.36363636363636,36.36363636363636,0],"height":[0,16.666666666666668,25,25,29.166666666666668,33.333333333333336,33.333333333333336,33.333333333333336,0],"texture":[3.9,16.9,16,18,16.9,3.9,18]},"rear_cannons":{"section_segments":12,"offset":{"x":130,"y":200,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[70,59,60,70,65,70,120,160],"z":[0,0,0,0,0,0,0,0]},"width":[0,20,23.076923076923077,23.076923076923077,26.923076923076923,30.769230769230766,30.769230769230766,0],"height":[0,20,23.076923076923077,23.076923076923077,26.923076923076923,30.769230769230766,30.769230769230766,0],"texture":[4,17,16,18,17,4],"angle":-155},"blocc":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":195,"y":230,"z":0},"position":{"x":[10,10,5,5,5,0,0,0,0,0,0],"y":[84,85.5,93,93,105,105,108,124.5,132,180,180],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,9.5,11,12.5,20,20,20,20,20,0],"height":[0,10,16.666666666666668,18.333333333333332,18.333333333333332,22.22222222222222,22.22222222222222,22.22222222222222,22.22222222222222,22.22222222222222,0],"texture":[4,4,17,18,4,17,4,17,4],"angle":-155},"antenna":{"section_segments":12,"offset":{"x":157,"y":125,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,10,15,90,92],"z":[0,0,0,0,0,0]},"width":[0,5,3,3,1.5,0],"height":[0,5,3,3,1.5,0],"texture":[4,4,18,17,4],"angle":-335},"antenna2":{"section_segments":12,"offset":{"x":147,"y":130,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,20,22,70,72],"z":[0,0,0,0,0,0]},"width":[0,5,3,2,1.5,0],"height":[0,5,3,2,1.5,0],"texture":[4,4,4,17,4],"angle":-335},"pipe":{"section_segments":12,"offset":{"x":155,"y":104.5,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,7,18,25,25],"z":[0,0,0,0,0,0]},"width":[0,5,5,5,5,0],"height":[0,5,5,5,5,0],"texture":[4,17,4,17,4,17,4,17,4],"angle":-155},"pipe2":{"section_segments":6,"offset":{"x":220,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,37.5,45,62.5,62.5],"z":[0,0,0,0,0,0]},"width":[0,16.666666666666668,16.666666666666668,16.666666666666668,16.666666666666668,0],"height":[0,25,25,25,25,0],"texture":[4,4,17,4,4,17,4,17,4],"angle":-155},"pipe3":{"section_segments":10,"offset":{"x":200,"y":95,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,10.5,15,42,45,52.5,52.5],"z":[0,0,0,0,0,0,0,0]},"width":[0,7,7,7,7,9,9,0],"height":[0,7,7,7,7,9,9,0],"texture":[4,4,17,4,4,4],"angle":-155},"pipe4":{"section_segments":10,"offset":{"x":228,"y":85,"z":20},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,9,10.5,15,42,45,67.5,67.5],"z":[0,0,0,0,0,0,0,0]},"width":[0,9,9,9,9,11,11,0],"height":[0,9,9,9,9,11,11,0],"texture":[4,4,17,4,4,4],"angle":-155},"pipe5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":220,"y":100,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,37.5,45,62.5,62.5],"z":[0,0,0,0,0,0]},"width":[0,20.4,30,30,30,0],"height":[0,12.5,12.5,12.5,12.5,0],"texture":[4,4,17,4,4,17,4,17,4],"angle":-155},"pipe6":{"section_segments":[60,75,90,150,165,180,240,255,270,330,345,360],"offset":{"x":225,"y":0,"z":-110},"position":{"x":[0,0,0,0,0,0,0],"y":[-3,-3,-2,1,3,5,5],"z":[0,0,0,0,0,0,0]},"width":[0,10,20,20,15,10,0],"height":[0,10,20,20,15,10,0],"texture":[4,18,17,18,4],"vertical":true},"shield":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":40,"y":60,"z":0},"position":{"x":[0,0,0,0,4,5,0,0,0],"y":[-5,-5,5,20,45,55,85,85,85],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,10,20,30,30,30,30,8,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":20},"shield2":{"section_segments":12,"offset":{"x":95,"y":210,"z":5},"position":{"x":[-7,-7,-6,-5,0,0,0,0,0],"y":[-4.166666666666667,-4.166666666666667,4.166666666666667,16.666666666666668,33.333333333333336,41.66666666666667,62.5,70.83333333333334,70.83333333333334],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,8.333333333333334,16.666666666666668,25,25,25,16.666666666666668,6.666666666666667,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":-20},"shield3":{"section_segments":12,"offset":{"x":84,"y":168,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-4.166666666666667,-4.166666666666667,4.166666666666667,16.666666666666668,33.333333333333336,41.66666666666667,62.5,70.83333333333334,70.83333333333334],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,8.333333333333334,16.666666666666668,25,25,25,16.666666666666668,6.666666666666667,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":0},"shield4":{"section_segments":12,"offset":{"x":81,"y":130,"z":-9},"position":{"x":[-7,-7,-6,-5,0,0,0,0,0],"y":[-4.166666666666667,-4.166666666666667,4.166666666666667,16.666666666666668,33.333333333333336,41.66666666666667,62.5,70.83333333333334,70.83333333333334],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,3,8,14,15,15,13,4,0],"height":[0,8.333333333333334,16.666666666666668,25,25,25,16.666666666666668,6.666666666666667,0],"texture":[4,4,4,4,17,4,4,4,17],"angle":0},"head":{"section_segments":[30,45,60,120,135,150,210,225,240,300,315,330],"offset":{"x":0.001,"y":105,"z":0},"position":{"x":[0,0,5,0,0,0,0,0,0,0,0,5,0,0],"y":[-60,-60,-30,-22.5,-15,-15,-7.5,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,15,15,30,30,50,50,50,50,30,30,15,15,0],"height":[0,15,15,30,30,50,50,50,50,30,30,15,15,0],"texture":[4,13,4,17,17.97,4,17,4,17.97,17,4,13,4],"angle":90},"disc":{"section_segments":14,"offset":{"x":0,"y":22,"z":-187},"position":{"x":[0,0,0,0,0,0],"y":[0,0,20,20,20,25],"z":[0,0,0,0,0,0]},"width":[0,36,36,33.6,24,0],"height":[0,48,36,33.6,24,0],"texture":[1,13,17,18.03,13],"vertical":true},"disc2":{"section_segments":14,"offset":{"x":0,"y":25,"z":-260},"position":{"x":[0,0,0,0,0,0],"y":[0,0,20,20,20,25],"z":[0,0,0,0,0,0]},"width":[0,11.538461538461538,11.538461538461538,10.769230769230768,7.692307692307692,0],"height":[0,11.538461538461538,11.538461538461538,10.769230769230768,7.692307692307692,0],"texture":[1,13,17,18.03,13],"vertical":true},"back":{"section_segments":6,"offset":{"x":0,"y":270,"z":35},"position":{"x":[2,2,-10,2,2],"y":[-20,-20,0,20,20],"z":[-7,-7,0,-7,-7]},"width":[0,11,11,11,0],"height":[0,10,10,10,0],"texture":[4,4,4,4],"angle":90},"backtop":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":236,"z":33},"position":{"x":[0,0,0,-10,0,0,0],"y":[-15,-15,-10,0,10,15,15],"z":[0,0,0,5,0,0,0]},"width":[0,50,50,50,50,50,0],"height":[0,10,10,10,10,10,0],"texture":[4,17,4,4,17,4],"angle":90},"back_front":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":35,"z":-160},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,-15,-10,0,10,10,12],"z":[0,0,0,0,0,0,0]},"width":[0,23,23,23,23,18,0],"height":[0,60,60,60,60,55,0],"texture":[4,17,4,4,17,4],"vertical":true},"main":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0.1,"y":191,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,75,85,85],"z":[0,0,0,0,0]},"width":[0,1,50,40,0],"height":[0,50,50,40,0],"texture":[1,4,17,4],"angle":30},"main2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0.1,"y":190,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,70,80,80],"z":[0,0,0,0,0]},"width":[0,1,70,60,0],"height":[0,50,50,40,0],"texture":[1,4,17,4],"angle":90},"main3":{"section_segments":8,"offset":{"x":0,"y":30,"z":-160},"position":{"x":[0,0,0,0,0],"y":[0,0,60,60,60],"z":[0,0,0,0,0]},"width":[0,85,85,85,0],"height":[0,60,60,60,0],"texture":[4],"angle":180,"vertical":true},"hook":{"section_segments":[45,135,225,315],"offset":{"x":42,"y":50,"z":0},"position":{"x":[-5,-5,0,0,0,-20,-20],"y":[-12,-10,-5,30,70,99,99],"z":[0,0,0,0,0,0,0]},"width":[0,5,5,5,5,5,0],"height":[0,15,25,50,49,47,0],"texture":[4,17,4,4,18,4],"angle":30},"arm":{"section_segments":6,"offset":{"x":200,"y":20,"z":0},"position":{"x":[-15,-15,0,0,0,0],"y":[-30,-30,-5,140,140,155],"z":[0,0,0,0,0,0]},"width":[0,1.4,42,42,42,42],"height":[0,33,40,40,40,30],"texture":[4,3.9,3.9,18],"angle":-63},"arm2":{"section_segments":12,"offset":{"x":260,"y":0,"z":0},"position":{"x":[1,1,0,0],"y":[5,5,50,50],"z":[0,0,0,0]},"width":[0,24,37,0],"height":[0,20,30,0],"texture":[4,3.9,3.9,18],"angle":-70},"arm2_shield":{"section_segments":[30,45,60,120,135,150,210,225,240,300,315,330],"offset":{"x":250,"y":-20,"z":0},"position":{"x":[-50,-50,0,0,0,0,0,0,-85,-85],"y":[-20,-20,5,5,22,28,45,45,70,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,10,7,7,7,7,15,20,0],"height":[0,20,24,24,28,26,18,15,10,0],"texture":[4,16,16,17.9,17,17.9,16],"angle":20},"arm_deco":{"section_segments":[45,135,225,315],"offset":{"x":120,"y":40,"z":10},"position":{"x":[0,0,0,0],"y":[0,0,96.5,69.5],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,34,34,0],"texture":[17],"angle":117},"arm_deco2":{"section_segments":[45,135,225,315],"offset":{"x":120,"y":75,"z":10},"position":{"x":[0,0,0,0],"y":[0,0,96.5,69.5],"z":[0,0,0,0]},"width":[0,5,5,0],"height":[0,34,34,0],"texture":[17],"angle":117},"box":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":135,"y":-90,"z":0},"position":{"x":[0,-8,0,0,0],"y":[0,0,40,140,140],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,17,19,19,0],"texture":[5,5,17]},"box2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":90,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[0,0,6,54,60,60],"z":[0,0,0,0,0,0]},"width":[0,23.076923076923077,30.769230769230766,30.769230769230766,23.076923076923077,0],"height":[0,53,55,55,53,0],"texture":[4],"angle":30},"deco":{"section_segments":6,"offset":{"x":100,"y":-5,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,65,65],"z":[0,0,0,0]},"width":[0,40,40,0],"height":[0,40,40,0],"texture":[16.9],"angle":180.5},"propeller":{"section_segments":[30,45,60,120,135,150,210,225,240,300,315,330],"offset":{"x":0,"y":250,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-50,40,60,62,50,45],"z":[0,0,0,0,0,0,0]},"width":[0,50,50,40,35,35,0],"height":[0,35,35,30,25,25,0],"texture":[18,17.9,4,17,16,17],"propeller":true},"reactor_deco":{"section_segments":6,"offset":{"x":100,"y":-130,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[20],"height":[20],"propeller":true},"tube":{"section_segments":6,"offset":{"x":100,"y":-95,"z":24},"position":{"x":[0,0,0,0,0,23,23],"y":[0,0,90,0,0,0,90,90],"z":[2,2,2,0,0,-11,-11]},"width":[0,6,6,0,0,6,6],"height":[0,6,6,0,0,6,6],"texture":[3.9],"angle":180},"tube2":{"section_segments":6,"offset":{"x":100,"y":-95,"z":24},"position":{"x":[-23,-23,-23,-23,0,-23,-23],"y":[0,0,90,0,0,0,90,90],"z":[0,-37,-37,-32,0,-11,-11]},"width":[0,6,6,0,0,6,6],"height":[0,6,6,0,0,6,6],"texture":[3.9],"angle":180},"tube3":{"section_segments":6,"offset":{"x":100,"y":-95,"z":24},"position":{"x":[23,23,23,23,0,0,0],"y":[0,0,90,0,0,0,90,90],"z":[0,-37,-37,-32,0,-50,-50]},"width":[0,6,6,0,0,6,6],"height":[0,6,6,0,0,6,6],"texture":[3.9],"angle":180},"wire":{"section_segments":10,"offset":{"x":60,"y":-108,"z":10},"position":{"x":[12,12,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-117,-117,-91,-65,-39,-13,13,39,65,91,117,156,156],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6,6,6,6,6,6,6,6,6,6,6,0],"height":[0,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,0],"propeller":false,"texture":[13,13,17,13,17,13,17,13,17,13,17]},"wire2":{"section_segments":10,"offset":{"x":60,"y":-108,"z":-10},"position":{"x":[12,12,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-117,-117,-91,-65,-39,-13,13,39,65,91,117,156,156],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6,6,6,6,6,6,6,6,6,6,6,0],"height":[0,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,7.2,0],"propeller":false,"texture":[13,13,17,13,17,13,17,13,17,13,17]},"rear_propellers":{"section_segments":10,"offset":{"x":130,"y":280,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[30,30,56,60,62,65,65,55],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,27.27272727272727,27.27272727272727,27.27272727272727,24.545454545454543,24.545454545454543,22.727272727272727,0],"height":[0,27.27272727272727,27.27272727272727,27.27272727272727,24.545454545454543,24.545454545454543,22.727272727272727,0],"texture":[4,4,18,17,16,17],"angle":0,"propeller":true},"rear_propellers2":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":153,"y":255,"z":0},"position":{"x":[15,15,0,0,0,0,0,0,0],"y":[-16,-15,0,75,75,84],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,6,36,36,36,0],"height":[0,24,36,36,36,0],"texture":[4,4,4,18,4,16,17],"angle":-18},"rear_propellers_joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":80,"y":255,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,75,75],"z":[5,5,0,0]},"width":[0,11,11,0],"height":[0,15,25,0],"texture":[4],"angle":55},"rear_propellers_joint2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":80,"y":235,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,75,75],"z":[5,5,0,0]},"width":[0,11,11,0],"height":[0,15,25,0],"texture":[4],"angle":55},"rear_propellers_deco":{"section_segments":[20,30,40,100,110,110,285,295,305],"offset":{"x":0,"y":0,"z":-280},"position":{"x":[137,137,137,137,137,137,137,137],"y":[-32,-32,32,32,32,32,32],"z":[0,0,0,0,0,0,0,0]},"width":[0,27.27272727272727,27.27272727272727,22.727272727272727,18.18181818181818,13.636363636363635,0],"height":[0,33,33,27.500000000000004,22,16.5,0],"texture":[4,4,17,4,17,4],"vertical":true},"rear_propellers_deco2":{"section_segments":[20,30,40,100,110,110,285,295,305],"offset":{"x":0,"y":0,"z":-280},"position":{"x":[137,137,137,137,137,137,137],"y":[-32,-32,-32,-32,-32,32,32],"z":[0,0,0,0,0,0,0]},"width":[0,13.636363636363635,18.18181818181818,22.727272727272727,27.27272727272727,27.27272727272727,0],"height":[0,16.5,22,27.500000000000004,33,33,0],"texture":[4,17,4,17,4],"vertical":true,"angle":180},"rear_propellers_deco3":{"section_segments":12,"offset":{"x":125,"y":0,"z":-250},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-35,-35,-10,-5,15,20,35,37,40,41],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,8,8,8,8,8,6,3,0],"height":[0,8,8,8,8,8,8,6,3,0],"texture":[4,4,17,4,17,4,18,4,18],"vertical":true},"wing_main0600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,165,165,165,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":180},"wing_main20600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,165,165],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":180},"wing_deco0600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":180},"wing_deco20600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":180},"wing_deco30600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco40600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco50600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco60600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":180},"wing_deco70600":{"section_segments":[45,135,225,315],"offset":{"x":100,"y":430,"z":0},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":180},"wing_main40500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,220,220,220,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":220},"wing_main240500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,220,220],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":220},"wing_deco40500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":220},"wing_deco240500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":220},"wing_deco340500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco440500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco540500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco640500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":220},"wing_deco740500":{"section_segments":[45,135,225,315],"offset":{"x":235,"y":330,"z":-5},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":220},"wing_main65370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,220,220,220,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":245},"wing_main265370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,220,220],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":245},"wing_deco65370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":245},"wing_deco265370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":245},"wing_deco365370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco465370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco565370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco665370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":245},"wing_deco765370":{"section_segments":[45,135,225,315],"offset":{"x":310,"y":200,"z":-15},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":245},"wing_main110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[3,3,0,-3,-6.5,-6.5,-6.5,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],"y":[0,0,15,160,165,220,220,220,39,39,40,40,45,45,46,46,51,51,52,52,57,57,58,58,63,63,64,64,69,69,70,70],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0,0,0,4,4,0,0,4,4,0,0,4.5,4.5,0,0,4.5,4.5,0,0,5,5,0,0,5,5,5],"height":[0,3,3,3,3,3,0,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,0,0,3.1,3.1,3.1],"texture":[4,4,4,4,4,4,4,4,1],"angle":290},"wing_main2110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[4.5,4.5,1.5,-1.5,-5,-5,-5],"y":[0,0,15,160,165,220,220],"z":[0,0,0,0,0,0,0]},"width":[0,2,6,11,6,6,0],"height":[0,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,2.727272727272727,0],"texture":[4,1,1,1,1,4],"angle":290},"wing_deco110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[-1,4.5,-1,-1,-1,-1,5],"y":[74,74,80,80,150,150,153,153],"z":[0,0,0,0,0,0,0,0]},"width":[0,1.5,1.3,1,1,1.7,2,0],"height":[0,3.1,3.1,3.1,3.1,3.1,3.1,0],"texture":[1],"angle":290},"wing_deco2110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[4,4,7,7,7,7,4],"y":[27,27,30,30,155,155,157,157],"z":[0,0,0,0,0,0,0,0]},"width":[0,2.5,2.5,1.5,1.5,2.5,2.5,0],"height":[0,2.6,2.6,3.1,3.1,2.6,2.6,0],"texture":[4,4,17],"angle":290},"wing_deco3110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[139,142,142,147,147,150,150,275,275,277,277],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco4110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[119,122,122,127,127,130,130,255,255,257,257],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco5110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[99,102,102,107,107,110,110,235,235,237,237],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco6110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[9,9,9,9,9,9,9],"y":[79,82,82,87,87,90,90,215,215,217,217],"z":[0,0,0,0,0,0,0]},"width":[4.5,4.5,0,0,4.5,4.5,0],"height":[3.2,3.2,0,0,3.2,3.2,0],"texture":[17],"angle":290},"wing_deco7110205":{"section_segments":[45,135,225,315],"offset":{"x":320,"y":35,"z":0},"position":{"x":[7,12,12,12,2,12,12,12],"y":[35,45,150,150,160],"z":[0,0,0,0,0,0,0]},"width":[1.5,1.5,1.5,1.5,3.5],"height":[1.5,1.5,1.5,1.5,1.5],"texture":[4,17],"angle":290}},"wings":{"main":{"offset":{"x":0,"y":200,"z":48},"length":[2,20,2,2],"width":[65,65,65,65,65],"angle":[0,-15,-15,-15],"position":[-3,0,20,25,20],"doubleside":true,"bump":{"position":30,"size":10},"texture":[4,18,4]}},"typespec":{"name":"Vuaniha","level":2,"model":5,"code":205,"specs":{"shield":{"capacity":[460,610],"reload":[9,9]},"generator":{"capacity":[320,350],"reload":[70,100]},"ship":{"mass":370,"speed":[70,85],"rotation":[50,90],"acceleration":[130,130]}},"shape":[0,5.131,5.247,5.065,3.789,3.008,2.408,2.109,2.883,2.916,2.858,2.893,3.165,3.895,3.892,3.3,3.245,4.437,3.935,3.432,4.868,4.449,4.531,5.293,3.762,3.751,3.762,5.293,4.531,4.449,4.868,3.432,3.935,4.437,3.223,3.3,3.892,3.895,3.165,2.893,2.858,2.916,2.883,2.109,2.408,3.008,3.789,5.065,5.247,5.131],"lasers":[{"x":1.2,"y":-5.04,"z":0,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[10,180],"number":1,"spread":0,"error":3,"recoil":90},{"x":-1.2,"y":-5.04,"z":0,"angle":0,"damage":[30,30],"rate":10,"type":1,"speed":[10,180],"number":1,"spread":0,"error":3,"recoil":90}],"radius":5.293}}',
                    '{"name":"Raigeki","level":2,"model":6,"size":2.2,"zoom":0.9,"specs":{"shield":{"capacity":[480,580],"reload":[6,6]},"generator":{"capacity":[320,360],"reload":[850,850]},"ship":{"mass":280,"speed":[120,120],"rotation":[64,64],"acceleration":[80,80]}},"bodies":{"ring":{"section_segments":12,"offset":{"x":41,"y":93,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"height":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring2":{"section_segments":12,"offset":{"x":41,"y":73.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.6999999999999997,-2.1,-1.5,0,1.5,2.1,2.6999999999999997,2.1,1.5,0,-1.5,-2.1,-2.6999999999999997],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"height":[14.2,15.2,16.2,16.7,16.2,15.2,14.2,13.2,12.2,11.7,12.2,13.2,14.2],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring3":{"section_segments":12,"offset":{"x":9.8,"y":93,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring4":{"section_segments":12,"offset":{"x":9.8,"y":86,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring5":{"section_segments":12,"offset":{"x":12.4,"y":93,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring6":{"section_segments":12,"offset":{"x":12.4,"y":86,"z":-9},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3275000000000001,-1.0325000000000002,-0.7375,0,0.7375,1.0325000000000002,1.3275000000000001,1.0325000000000002,0.7375,0,-0.7375,-1.0325000000000002,-1.3275000000000001],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"height":[6,6.8,7.6,8,7.6,6.8,6,5.2,4.4,4,4.4,5.2,6],"vertical":0,"texture":[4,17,18,18,17,4,4],"angle":0},"ring7":{"section_segments":[45,135,225,315],"offset":{"x":42.4,"y":1,"z":-85},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[19.5,20.3,21.1,21.5,21.1,20.3,19.5,18.7,17.9,17.5,17.9,18.7,19.5],"height":[12,12.8,13.6,14,13.6,12.8,12,11.2,10.4,10,10.4,11.2,12],"vertical":1,"texture":[17],"angle":45},"ring8":{"section_segments":[45,135,225,315],"offset":{"x":42.4,"y":-1,"z":-85},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9250000000000003,-2.275,-1.625,0,1.625,2.275,2.9250000000000003,2.275,1.625,0,-1.625,-2.275,-2.9250000000000003],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[19.5,20.3,21.1,21.5,21.1,20.3,19.5,18.7,17.9,17.5,17.9,18.7,19.5],"height":[12,12.8,13.6,14,13.6,12.8,12,11.2,10.4,10,10.4,11.2,12],"vertical":1,"texture":[17],"angle":125},"ball":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":113,"vertical":false,"angle":0},"ball2":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":17,"vertical":false,"angle":45},"ball3":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":17,"vertical":false,"angle":90},"ball4":{"section_segments":30,"offset":{"x":0,"y":21,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-9.510565162951535,-8.090169943749475,-5.877852522924732,-3.0901699437494745,-6.123233995736766e-16,3.0901699437494736,5.87785252292473,8.090169943749473,9.510565162951535,10],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"height":[0,3.090169943749474,5.877852522924732,8.090169943749475,9.510565162951535,10,9.510565162951536,8.090169943749475,5.877852522924733,3.090169943749475,1.2246467991473533e-15],"texture":17,"vertical":false,"angle":135},"ring9":{"section_segments":12,"offset":{"x":0,"y":2.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,2.1,2.2,2.25,2.2,2.1,2,1.9,1.8,1.75,1.8,1.9,2],"height":[2,2.1,2.2,2.25,2.2,2.1,2,1.9,1.8,1.75,1.8,1.9,2],"vertical":0,"texture":113,"angle":0},"ring10":{"section_segments":12,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"height":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"vertical":0,"texture":113,"angle":0},"ring11":{"section_segments":12,"offset":{"x":0,"y":7.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"height":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"vertical":0,"texture":113,"angle":0},"ring12":{"section_segments":12,"offset":{"x":16,"y":31.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,2.2,2.4,2.5,2.4,2.2,2,1.8,1.6,1.5,1.6,1.8,2],"height":[2,2.2,2.4,2.5,2.4,2.2,2,1.8,1.6,1.5,1.6,1.8,2],"vertical":0,"texture":113,"angle":60},"ring13":{"section_segments":12,"offset":{"x":11,"y":28.8,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"height":[1,1.2,1.4,1.5,1.4,1.2,1,0.8,0.6,0.5,0.6,0.8,1],"vertical":0,"texture":113,"angle":60},"ring14":{"section_segments":12,"offset":{"x":13.5,"y":30.15,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-0.675,-0.5250000000000001,-0.37500000000000006,0,0.37500000000000006,0.5250000000000001,0.675,0.5250000000000001,0.37500000000000006,0,-0.37500000000000006,-0.5250000000000001,-0.675],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"height":[1.5,1.7,1.9,2,1.9,1.7,1.5,1.3,1.1,1,1.1,1.3,1.5],"vertical":0,"texture":113,"angle":60},"ring15":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":21.5,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.8,9.6,10,9.6,8.8,8,7.2,6.4,6,6.4,7.2,8],"height":[10,10.8,11.6,12,11.6,10.8,10,9.2,8.4,8,8.4,9.2,10],"vertical":0,"texture":[4,17,63,63,17,4],"angle":30},"ring16":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":15,"y":7,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.8,9.6,10,9.6,8.8,8,7.2,6.4,6,6.4,7.2,8],"height":[10,10.8,11.6,12,11.6,10.8,10,9.2,8.4,8,8.4,9.2,10],"vertical":0,"texture":[4,17,63,63,17,4],"angle":30},"ring17":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":10,"y":42.5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.8,9.6,10,9.6,8.8,8,7.2,6.4,6,6.4,7.2,8],"height":[10,10.8,11.6,12,11.6,10.8,10,9.2,8.4,8,8.4,9.2,10],"vertical":0,"texture":[4,17,63,63,17,4],"angle":90},"main":{"section_segments":8,"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-80,-60,-60,-22,-20,-20,-20,34.5,34.5,36.5,50,51.5,70,68],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,18.5,20,19,20,0,0,0,60,60,40,40,16,15],"height":[0,8,8.5,10,11,12,0,0,0,12,12,20,20,15,0],"texture":[3,2,17,8,17,4,17,4,4,4,63,17,18,17]},"head":{"section_segments":[0,30,90,150,180],"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,-4,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,6,5],"height":[0,0,6.5,6],"texture":[2]},"head2":{"section_segments":[180,210,270,330,360],"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,4,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,6,5],"height":[0,0,6.5,6],"texture":[2],"angle":0},"head3":{"section_segments":8,"offset":{"x":0,"y":4,"z":0},"position":{"x":[0,0,0,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,6,5],"height":[0,0,5,6],"texture":[16],"angle":0},"head4":{"section_segments":[-30,30,45,135,225,315],"offset":{"x":0.01,"y":4,"z":0},"position":{"x":[0,0,0,0],"y":[-130,-130,-80,-80],"z":[0,0,0,0]},"width":[0,0,3,5],"height":[0,0,8.5,6],"texture":[2],"angle":0},"side":{"section_segments":[152,272,392],"offset":{"x":0,"y":-16,"z":0},"position":{"x":[16,16,48,48],"y":[0,0,55,55],"z":[0,0,0,0]},"width":[0,4,11,0],"height":[0,9,9.1,0],"texture":[4]},"side2":{"section_segments":[332,452,572],"offset":{"x":0,"y":-16,"z":0},"position":{"x":[-16.5,-16.5,-48.5,-48.5],"y":[0,0,55,55],"z":[0,0,0,0]},"width":[0,4,11,0],"height":[0,9,9.1,0],"texture":[4]},"box2":{"vertical":true,"angle":45,"section_segments":[45,135,225,315],"offset":{"x":17,"y":4,"z":34},"position":{"x":[0,0,0,0,0],"y":[-5,-1,1,1,1],"z":[0,0,0,0,0]},"width":[3.3333333333333335,4.666666666666667,3.3333333333333335,2,2],"height":[26,26,19.5,16.900000000000002,0],"texture":[4,17.95,17,15]},"joint":{"section_segments":6,"offset":{"x":11,"y":-25,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-2,0.7,2,2,-2,-2],"z":[0,0,0,0,0,0]},"width":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"height":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"texture":[3.9,63,3.9]},"joint2":{"section_segments":6,"offset":{"x":11,"y":-43,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-2,0.7,2,2,-2,-2],"z":[0,0,0,0,0,0]},"width":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"height":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"texture":[3.9,63,3.9]},"joint3":{"section_segments":6,"offset":{"x":11,"y":-34,"z":3},"position":{"x":[0,0,0,0,0,0],"y":[-2,0.7,2,2,-2,-2],"z":[0,0,0,0,0,0]},"width":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"height":[7.199999999999999,7.199999999999999,7.199999999999999,4.8,4.8,7.199999999999999],"texture":[3.9,63,3.9]},"box":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":0,"z":33.5},"position":{"x":[0,0,0,0,0],"y":[-5,-5,12,13,13],"z":[0,0,0,0,0]},"width":[0,3,3,1.8,0],"height":[0,18,18,16.2,0],"texture":[63,4,63,17],"angle":30,"vertical":true},"pipe":{"section_segments":12,"offset":{"x":15,"y":-17,"z":2},"position":{"x":[0,0,0,0,0,-0.5,-1,-1.5,-2,0],"y":[0,0,10,20,30,40,50,60,70],"z":[0,0,0,0,0,0,-0.5,-1,-3]},"width":[0,3,3,3,3,3,3,3,3,3],"height":[0,3,3,3,3,3,3,3,3],"texture":[17,17,18,17,18,17,18,17],"angle":36},"gap":{"section_segments":[45,135,225,315],"offset":{"x":12,"y":-16,"z":0},"position":{"x":[0,0,29.5,30],"y":[0,0,55,55],"z":[0,0,0,0]},"width":[0,2.8,1.1,0],"height":[0,12,12,0],"texture":[4]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-40,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-32.5,-12.5,0,12.5,13.2,25,25,25],"z":[0,0,0,0,-0.2,-0.2,-2,-5]},"width":[0,5,7.5,5,6.2,8,7.5,5],"height":[0,7.5,10,5,5,5,5,5],"texture":[9,9,9,17,4,63,3]},"core_shield":{"section_segments":[115,120,125,235,240,245,355,360,365],"offset":{"x":0,"y":5,"z":-22},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-2.9411764705882355,-2.9411764705882355,-2.9411764705882355,-2.3529411764705883,-2.3529411764705883,11.764705882352942,14.705882352941178,17.647058823529413,11.764705882352942,0,-2.9411764705882355],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[28.57142857142857,38.095238095238095,41.904761904761905,47.61904761904762,47.61904761904762,47.61904761904762,42.857142857142854,28.57142857142857,23.80952380952381,23.80952380952381,28.57142857142857],"height":[30,40,44,50,50,50,45,30,25,25,30],"texture":[[15.7],16.7,17.7,3.7,63,3.7,[15.7],17.7,112.7,17.7],"angle":180,"vertical":true},"cannons":{"section_segments":6,"offset":{"x":50,"y":36,"z":-9.5},"position":{"x":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-15,-20,-20,-20,-20,-20],"y":[-93,-97,-97,-92,-90,-49,-47,-45,-10,0,10,10,10,10,10],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5.5,6,7,6.7,6.7,8,8,12.5,12,7,7,7,7,0,0],"height":[0,3.5,4,5,3,3,4,5,12.5,15,7,7,7,7,0,0],"texture":[16.9,16.9,16,12,11,5,17,1,4],"laser":{"damage":[65,65],"rate":0.5,"type":1,"speed":[210,200],"recoil":180,"number":1,"error":0}},"cannons2":{"section_segments":6,"offset":{"x":49.5,"y":36,"z":-9.5},"position":{"x":[-10,-10,-10,-10,-10,-10,-10,-10,-10,-15,-20,-20,-20,-20,-20],"y":[-93,-97,-97,-92,-90,-49,-47,-45,-10,0,10,10,10,10,10],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5.5,6,7,6.7,6.7,8,8,12.5,12,7,7,7,7,0,0],"height":[0,3.5,4,5,3,3,4,5,12.5,15,7,7,7,7,0,0],"texture":[16.9,16.9,16,12,18,5,17,4,4]},"cannon_deco":{"section_segments":8,"offset":{"x":43.5,"y":-12,"z":-7},"position":{"x":[0,0,0,0],"y":[0,0,44,0],"z":[-0.5,-0.5,0,0]},"width":[0,1.5,1.5,0],"height":[0,1,1,0],"texture":[17],"angle":189},"cannon_deco2":{"section_segments":8,"offset":{"x":36.5,"y":-12,"z":-7},"position":{"x":[0,0,0,0],"y":[0,0,44,0],"z":[-0.5,-0.5,0,0]},"width":[0,1.5,1.5,0],"height":[0,1,1,0],"texture":[17],"angle":-189},"poker":{"section_segments":12,"offset":{"x":0,"y":20,"z":0},"position":{"x":[0,0,0,0,0],"y":[9,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1,2,3,4,0],"height":[0,1,2,3,4,0],"angle":180,"texture":[18,17,4]},"poker2":{"section_segments":12,"offset":{"x":1,"y":23,"z":0},"position":{"x":[0,0,0,0,0],"y":[8,20,21,23,24],"z":[0,0,0,0,0]},"width":[0,1,2,3,4,0],"height":[0,1,2,3,4,0],"angle":60,"texture":[18,17,4]},"main_engine":{"section_segments":8,"offset":{"x":0,"y":36.14285714285711,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[0,14.285714285714286,25.714285714285715,37.142857142857146,44.57142857142857,45.714285714285715,57.142857142857146,57.142857142857146,42.857142857142854],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,17.142857142857142,17.142857142857142,12.857142857142858,11.428571428571429,11.428571428571429,10,9.142857142857142,0],"height":[0,12.857142857142858,12.857142857142858,12.857142857142858,11.428571428571429,11.428571428571429,10,9.142857142857142,0],"texture":[3.9,3.9,3.9,8,17,2.9,17],"propeller":true},"engine_top":{"section_segments":8,"offset":{"x":9.714285714285714,"y":56.14285714285711,"z":10.285714285714286},"position":{"x":[-9.714285714285714,-9.714285714285714,-2,0,0,0,0,0,0,0,0,0],"y":[0,2.857142857142857,14.285714285714286,22.857142857142858,24.285714285714285,25.714285714285715,41.42857142857143,42.857142857142854,51.42857142857143,54.285714285714285,54.285714285714285,42.857142857142854],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8.571428571428571,10.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"height":[0,8.571428571428571,8.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"texture":[4,4,4,4,17,18,17,[15],17,17],"propeller":true},"engine_bottom":{"section_segments":8,"offset":{"x":12.571428571428571,"y":56.14285714285711,"z":-8.571428571428571},"position":{"x":[-9.714285714285714,-9.714285714285714,-2,0,0,0,0,0,0,0,0,0],"y":[0,2.857142857142857,14.285714285714286,22.857142857142858,24.285714285714285,25.714285714285715,41.42857142857143,42.857142857142854,51.42857142857143,54.285714285714285,54.285714285714285,42.857142857142854],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8.571428571428571,10.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"height":[0,8.571428571428571,8.571428571428571,8.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,6.571428571428571,7.142857142857143,5.714285714285714,4.857142857142857,0],"texture":[4,4,4,4,17,18,17,[15],17,17],"propeller":true},"side_engine":{"section_segments":8,"offset":{"x":50,"y":-16,"z":0},"position":{"x":[-25,-9,-9,-9,-9,-9],"y":[60,80,82,120,122,110],"z":[0,0,0,0,0,0]},"width":[8,15,15,15,13,0],"height":[8,15,15,15,13,0],"texture":[4,17,18,17,17],"propeller":true},"hubs":{"vertical":true,"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":41,"y":11,"z":-83},"position":{"x":[0,0,0,0,0,0,0],"y":[0,5,4,4,5,4.5],"z":[0,0,0,0,0,0,0]},"width":[10.588235294117647,8.823529411764707,7.647058823529412,7.0588235294117645,5.882352941176471,0],"height":[10.588235294117647,8.823529411764707,7.647058823529412,7.0588235294117645,5.882352941176471,0],"texture":[11,18,17,18,18]},"lights":{"section_segments":[90,180,270,360],"offset":{"x":0.01,"y":-115,"z":0},"position":{"x":[0,18.5,10,0,0],"y":[-59,-59,-39,10,10],"z":[0,0,0,0,0]},"width":[0,0.5,0.5,0.4,0],"height":[0,0.2,0.2,0.2,0],"texture":[17],"angle":180},"lights2":{"section_segments":[90,180,270,360],"offset":{"x":0.01,"y":-115,"z":0},"position":{"x":[11,12.9,6.7,0,0],"y":[-59,-59,-39,10,10],"z":[0,5.4,5.3,0,0]},"width":[0,0.75,0.75,0.4,0],"height":[0,1,1,0.2,0],"texture":[17],"angle":180},"lights3":{"section_segments":[90,180,270,360],"offset":{"x":19,"y":-36,"z":0},"position":{"x":[0,0,-0.9,0],"y":[-20,-20,20,20],"z":[0.5,0.5,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.2,0.2,0],"texture":[17],"angle":180},"lights4":{"section_segments":[90,180,270,360],"offset":{"x":4.7,"y":-25,"z":10},"position":{"x":[0,-1,1.5,0],"y":[-10,-10,5,5],"z":[-0.4,-0.4,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.2,0.2,0],"texture":[17],"angle":180},"lights5":{"section_segments":[90,180,270,360],"offset":{"x":0,"y":-22,"z":11.35},"position":{"x":[0,0,0,0],"y":[-6,-6,5,5],"z":[0,0,0.4,0.4]},"width":[0,0.75,0.75,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"lights6":{"section_segments":[90,180,270,360],"offset":{"x":19.5,"y":-11,"z":0},"position":{"x":[-40,-40,0,0],"y":[-50,-50,5,5],"z":[0,0,0.4,0.4]},"width":[0,0.75,0.75,0],"height":[0,0.5,0.5,0],"texture":[17],"angle":180},"lights7":{"section_segments":4,"offset":{"x":13.5,"y":-11,"z":8},"position":{"x":[-29,-29,0,0],"y":[-49.5,-49.5,5,5],"z":[0,0,0.3,0.3]},"width":[0,0.75,0.75,0],"height":[0,0.8,0.5,0],"texture":[17],"angle":180},"lights8":{"section_segments":[90,180,270,360],"offset":{"x":40,"y":65,"z":0},"position":{"x":[25,25,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.8,0.8,0],"texture":[17],"angle":180},"lights9":{"section_segments":[90,180,270,360],"offset":{"x":28,"y":65,"z":14},"position":{"x":[17,17,0,0],"y":[-10,-10,10,10],"z":[-3,-3,0,0]},"width":[0,0.75,0.75,0],"height":[0,0.8,0.8,0],"texture":[17],"angle":180},"lights10":{"section_segments":[90,180,270,360],"offset":{"x":0,"y":-115,"z":0},"position":{"x":[0,0,0,0],"y":[-49,-39,5,5],"z":[7.7,7.5,0,0]},"width":[0.75,0.75,0.75,0],"height":[0.8,0.8,0.8,0],"texture":[17],"angle":180},"lights11":{"section_segments":20,"offset":{"x":40,"y":1,"z":-5},"position":{"x":[0,0,0,0],"y":[-39,-39,10,10],"z":[9.7,9.7,0,0]},"width":[0.75,0.75,0.75,0],"height":[0.8,0.8,0.8,0],"texture":[17],"angle":180},"lights12":{"section_segments":20,"offset":{"x":13.5,"y":-45.900000000000006,"z":6.5},"position":{"x":[0,0.5,0,0],"y":[-29,-29,10,10],"z":[0,0.8,0.2,0]},"width":[0.75,0.75,0.75,0],"height":[0.8,0.8,0.8,0],"texture":[17],"angle":180},"propeller_main":{"section_segments":16,"offset":{"x":0,"y":110,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[15],"height":[10],"texture":[0],"propeller":true},"end_laser":{"section_segments":4,"offset":{"x":30,"y":-900,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[20,20],"rate":0.5,"speed":[0.0001,123],"number":1}},"end_laser2":{"section_segments":4,"offset":{"x":30,"y":-900,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[20,20],"rate":0.5,"speed":[-60,-60],"number":1}},"laser1":{"section_segments":4,"offset":{"x":30,"y":-150,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,30],"number":1}},"laser2":{"section_segments":4,"offset":{"x":30,"y":-200,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,35],"number":1}},"laser3":{"section_segments":4,"offset":{"x":30,"y":-250,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,40],"number":1}},"laser4":{"section_segments":4,"offset":{"x":30,"y":-300,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,45],"number":1}},"laser5":{"section_segments":4,"offset":{"x":30,"y":-350,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,50],"number":1}},"laser6":{"section_segments":4,"offset":{"x":30,"y":-400,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,55],"number":1}},"laser7":{"section_segments":4,"offset":{"x":30,"y":-450,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,60],"number":1}},"laser8":{"section_segments":4,"offset":{"x":30,"y":-500,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,65],"number":1}},"laser9":{"section_segments":4,"offset":{"x":30,"y":-550,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,70],"number":1}},"laser10":{"section_segments":4,"offset":{"x":30,"y":-600,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,75],"number":1}},"laser11":{"section_segments":4,"offset":{"x":30,"y":-650,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,80],"number":1}},"laser12":{"section_segments":4,"offset":{"x":30,"y":-700,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,85],"number":1}},"laser13":{"section_segments":4,"offset":{"x":30,"y":-750,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,90],"number":1}},"laser14":{"section_segments":4,"offset":{"x":30,"y":-800,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,95],"number":1}},"laser15":{"section_segments":4,"offset":{"x":30,"y":-850,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[1],"height":[1],"laser":{"damage":[5,5],"rate":0.5,"speed":[0.0001,100],"number":1}}},"wings":{"main":{"doubleside":true,"offset":{"x":2,"y":15,"z":-10},"length":[45,0,1.5,6],"width":[0,0,33.333333333333336,66.66666666666667,33.333333333333336],"angle":[0,0,0,0],"position":[16.666666666666668,25,-25,-25,8.333333333333334],"texture":[0,4,17,63],"bump":{"position":75,"size":17}}},"typespec":{"name":"Raigeki","level":2,"model":6,"code":206,"specs":{"shield":{"capacity":[480,580],"reload":[6,6]},"generator":{"capacity":[320,360],"reload":[850,850]},"ship":{"mass":280,"speed":[120,120],"rotation":[64,64],"acceleration":[80,80]}},"shape":[5.544,4.28,3.109,2.638,3.179,3.34,3.175,2.862,2.685,2.524,2.421,2.366,2.361,2.416,2.472,2.575,2.73,3.185,3.14,3.86,4.591,5.234,5.154,4.903,4.925,4.868,4.925,4.903,5.154,5.234,4.591,3.86,3.14,3.185,2.73,2.575,2.472,2.416,2.361,2.366,2.421,2.524,2.685,2.862,3.175,3.34,3.179,2.638,3.109,4.28],"lasers":[{"x":1.76,"y":-2.684,"z":-0.418,"angle":0,"damage":[65,65],"rate":0.5,"type":1,"speed":[210,200],"number":1,"spread":0,"error":0,"recoil":180},{"x":-1.76,"y":-2.684,"z":-0.418,"angle":0,"damage":[65,65],"rate":0.5,"type":1,"speed":[210,200],"number":1,"spread":0,"error":0,"recoil":180},{"x":1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[0.0001,123],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[0.0001,123],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[-60,-60],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-39.6,"z":0,"angle":0,"damage":[20,20],"rate":0.5,"speed":[-60,-60],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-6.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,30],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-6.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,30],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-8.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,35],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-8.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,35],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-11,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-11,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,40],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-13.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,45],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-13.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,45],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-15.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,50],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-15.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,50],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-17.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,55],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-17.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,55],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-19.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,60],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-19.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,60],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-22,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,65],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-22,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,65],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-24.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,70],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-24.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,70],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-26.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,75],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-26.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,75],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-28.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,80],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-28.6,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,80],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-30.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,85],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-30.8,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,85],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-33,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,90],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-33,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,90],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-35.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,95],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-35.2,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,95],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.32,"y":-37.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,100],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.32,"y":-37.4,"z":0,"angle":0,"damage":[5,5],"rate":0.5,"speed":[0.0001,100],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.544}}',
                    '{"name":"Tiaramisu","level":2,"model":7,"size":1.2,"specs":{"shield":{"capacity":[530,630],"reload":[8,8]},"generator":{"capacity":[310,310],"reload":[130,130]},"ship":{"mass":330,"speed":[95,95],"rotation":[70,70],"acceleration":[100,100]}},"bodies":{"ring":{"section_segments":[45,135,225,315],"offset":{"x":90,"y":74,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,13,18,20.5,18,13,8,3,-2,-4.5,-2,3,8],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":90},"ring2":{"section_segments":6,"offset":{"x":122.2,"y":-80,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5.4,-4.2,-3,-0.8,0.8,3,4.2,5.4,4.2,3,0,-3,-4.2,-5.4],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6.800000000000001,8,8.4,8.4,8.4,8.4,8,7.6000000000000005,6,5.2,4.800000000000001,5.2,6,6.800000000000001],"height":[4,5,5.5,5.5,5.5,5.5,5,4.5,3,2,1.5,2,3,4],"vertical":0,"texture":[4,17,4,17,4,17,4],"angle":9},"ring3":{"section_segments":6,"offset":{"x":119.7,"y":-100,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5.4,-4.2,-3,-0.8,0.8,3,4.2,5.4,4.2,3,0,-3,-4.2,-5.4],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5.949999999999999,7,7.35,7.35,7.35,7.35,7,6.6499999999999995,5.25,4.55,4.199999999999999,4.55,5.25,5.949999999999999],"height":[3.28,4.1,4.51,4.51,4.51,4.51,4.1,3.69,2.46,1.64,1.23,1.64,2.46,3.28],"vertical":0,"texture":[4,17,4,17,4,17,4],"angle":10},"ring4":{"section_segments":6,"offset":{"x":116.7,"y":-120,"z":-3},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-5.4,-4.2,-3,-0.8,0.8,3,4.2,5.4,4.2,3,0,-3,-4.2,-5.4],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4.760000000000001,5.6000000000000005,5.880000000000001,5.880000000000001,5.880000000000001,5.880000000000001,5.6000000000000005,5.32,4.2,3.6400000000000006,3.3600000000000003,3.6400000000000006,4.2,4.760000000000001],"height":[3.04,3.8,4.18,4.18,4.18,4.18,3.8,3.42,2.2800000000000002,1.52,1.1400000000000001,1.52,2.2800000000000002,3.04],"vertical":0,"texture":[4,17,4,17,4,17,4],"angle":9},"ring5":{"section_segments":6,"offset":{"x":126,"y":40,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":17,"angle":0},"ring6":{"section_segments":6,"offset":{"x":125,"y":29,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":17,"angle":0},"ring7":{"section_segments":[45,135,225,315],"offset":{"x":119,"y":63,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,13,18,20.5,18,13,8,3,-2,-4.5,-2,3,8],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":94},"ring8":{"section_segments":6,"offset":{"x":137,"y":68,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[7,12,17,19.5,17,12,7,2,-3,-5.5,-3,2,7],"vertical":0,"texture":16.9,"angle":5},"ring9":{"section_segments":6,"offset":{"x":136,"y":55,"z":2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[6.3,11.3,16.3,18.8,16.3,11.3,6.3,1.2999999999999998,-3.7,-6.2,-3.7,1.2999999999999998,6.3],"vertical":0,"texture":16.9,"angle":5},"ring10":{"section_segments":6,"offset":{"x":130,"y":1,"z":1},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"vertical":0,"texture":16.9,"angle":10},"ring11":{"section_segments":6,"offset":{"x":128.7,"y":-11,"z":0.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"height":[4.5,9.5,14.5,17,14.5,9.5,4.5,-0.5,-5.5,-8,-5.5,-0.5,4.5],"vertical":0,"texture":16.9,"angle":10},"ring12":{"section_segments":6,"offset":{"x":127.4,"y":-24,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[2,7,12,14.5,12,7,2,-3,-8,-10.5,-8,-3,2],"height":[3,8,13,15.5,13,8,3,-2,-7,-9.5,-7,-2,3],"vertical":0,"texture":16.9,"angle":10},"ring13":{"section_segments":6,"offset":{"x":126.8,"y":-37,"z":0.6},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,6,11,13.5,11,6,1,-4,-9,-11.5,-9,-4,1],"height":[0.5,5.5,10.5,13,10.5,5.5,0.5,-4.5,-9.5,-12,-9.5,-4.5,0.5],"vertical":0,"texture":16.9,"angle":10},"ring14":{"section_segments":6,"offset":{"x":0,"y":133,"z":50},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-2.025,-1.575,-1.125,0,1.125,1.575,2.025,1.575,1.125,0,-1.125,-1.575,-2.025],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[14,14.5,15,15.25,15,14.5,14,13.5,13,12.75,13,13.5,14],"height":[5,5.5,6,6.25,6,5.5,5,4.5,4,3.75,4,4.5,5],"vertical":0,"texture":16.9,"angle":90},"ring15":{"section_segments":[25,155,225,315],"offset":{"x":36,"y":80,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"height":[10,15,20,22.5,20,15,10,5,0,-2.5,0,5,10],"vertical":0,"texture":16.9,"angle":0},"ring16":{"section_segments":[25,155,225,315],"offset":{"x":36,"y":70,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-4.5,-3.5,-2.5,0,2.5,3.5,4.5,3.5,2.5,0,-2.5,-3.5,-4.5],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[5,10,15,17.5,15,10,5,0,-5,-7.5,-5,0,5],"height":[10,15,20,22.5,20,15,10,5,0,-2.5,0,5,10],"vertical":0,"texture":16.9,"angle":0},"reactor":{"section_segments":[45,135,225,315],"offset":{"x":91,"y":0,"z":-74},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":90},"reactor2":{"section_segments":[45,135,225,315],"offset":{"x":118,"y":0,"z":-63},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":270},"lips":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":58,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"height":[21.6,18,15.600000000000001,14.399999999999999,12,2.4000000000000004,0],"texture":17,"vertical":0,"angle":180},"reactor3":{"section_segments":16,"offset":{"x":144,"y":38,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":0,"angle":95},"reactor4":{"section_segments":16,"offset":{"x":142,"y":18,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,4.5,3.5,3.5,5,3.5,4],"z":[0,0,0,0,0,0,0,0]},"width":[9,7.5,6.5,6,5,1,0],"height":[9,7.5,6.5,6,5,1,0],"texture":[18,17,17,18,18,17],"vertical":0,"angle":95},"reactor5":{"section_segments":16,"offset":{"x":0,"y":47,"z":-145},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"height":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor6":{"section_segments":16,"offset":{"x":0,"y":47,"z":-121},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"height":[8.1,6.75,5.8500000000000005,5.3999999999999995,4.5,0.9,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":0},"reactor7":{"section_segments":16,"offset":{"x":35,"y":17,"z":-116},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,5.4,4.199999999999999,4.199999999999999,6,4.199999999999999,4.800000000000001],"z":[0,0,0,0,0,0,0,0]},"width":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"height":[10.8,9,7.800000000000001,7.199999999999999,6,1.2000000000000002,0],"texture":[18,17,17,18,18,17],"vertical":1,"angle":15},"main":{"section_segments":[45,135,245,295],"offset":{"x":2.5,"y":115,"z":0},"position":{"x":[0,0,18.5,16.5,16.5,16.5],"y":[-145,-145,-60,-60,60,60],"z":[0,0,0,0,0,0]},"width":[0,1,25,27,27,0],"height":[0,1,26,26,26,0],"texture":[17,2.8,2.8,2.8,16.8],"laser":{"damage":[20,25],"rate":1,"type":1,"speed":[200,200],"number":1,"angle":1,"recoil":40,"error":0}},"lights":{"section_segments":[45,135,225,315],"offset":{"x":3.5,"y":-75,"z":0},"position":{"x":[0,0,1,1],"y":[-140,-140,-60,-60],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,20,0.5,0],"texture":[17],"angle":180},"cockpit":{"section_segments":6,"offset":{"x":0,"y":65,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-10,-2,20,30,110,110],"z":[0,0,0,0,0,0]},"width":[0,10,13,13,13,0],"height":[0,8,11,13,13,0],"propeller":false,"texture":[7,9,9,4,4]},"propeller":{"section_segments":6,"offset":{"x":0,"y":148,"z":0},"position":{"x":[0,0,0,0,0],"y":[0,0,30,30,25],"z":[0,0,0,0,0]},"width":[0,40,35,28,0],"height":[0,19,19,17,0],"propeller":true,"texture":[16.9]},"stand":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":75,"z":33},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[27,28,30,45,45,70,85,88,90],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,20.4,28.799999999999997,33.6,33.6,33.6,28.799999999999997,18,0],"height":[0,5,7.5,10,10,10,8.5,6.5,0],"texture":[2,2,2,2,10,2]},"shield":{"section_segments":[0,50,130,180],"offset":{"x":-20,"y":128,"z":0},"position":{"x":[14,14,8.5,0,0,0,0,0,0,-6.5,-7.5,-7.5],"y":[-145,-145,-105,-73,-70,-43,-40,17,20,56,59,50],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,22.5,35,35,35,35,35,35,25,23,10],"height":[0,3.5,12,20,20.3,22,22,25,25,25,23,0],"texture":[16.9,4,18,17,3.9,17,18,17,3.9,16.9]},"shield2":{"section_segments":[0,50,130,180],"offset":{"x":-19.9,"y":128,"z":0},"position":{"x":[14,8.5,0,0,0,-6.5,-6.5,-6.5],"y":[-145,-105,-73,-40,20,56,56,47],"z":[0,0,0,0,0,0,0,0]},"width":[5,22.5,35,35,35,25,25,25],"height":[3.5,12,20,22,25,25,25,25],"texture":[3.6]},"shield3":{"section_segments":[0,50,130,180],"offset":{"x":-20.1,"y":128,"z":0},"position":{"x":[14,8.5,0,0,0,-6.5,-6.5,-6.5],"y":[-145,-105,-73,-40,20,56,56,47],"z":[0,0,0,0,0,0,0,0]},"width":[5,22.5,35,35,35,25,25,25],"height":[3.1818181818181817,10.909090909090908,18.18181818181818,20,22.727272727272727,22.727272727272727,22.727272727272727,22.727272727272727],"texture":[3.6,17.6,3.6,17.6,3.6]},"deco":{"section_segments":[0,50,130,180],"offset":{"x":-22,"y":157,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[8,33,33,8],"height":[0,25.8,25.8,0],"texture":[63]},"deco2":{"section_segments":[0,50,130,180],"offset":{"x":-25,"y":170,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,3,3],"z":[0,0,0,0]},"width":[3,28,28,3],"height":[0,25.4,25.4,0],"texture":[63]},"arm":{"section_segments":6,"offset":{"x":131,"y":47,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-105,-104,-100,-30,0,30,34,36],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,12,17,17,17,10,0],"height":[0,5,10,20,21,22,10,0],"texture":[3.9,3.9,18,3.9,18,3.9],"angle":5},"arm2":{"section_segments":6,"offset":{"x":122,"y":-83,"z":-3},"position":{"x":[-6,-6,0,0],"y":[-80,-80,30,30],"z":[0,0,0,0]},"width":[0,2,10,0],"height":[0,2,5,0],"texture":[16.9,2.9],"angle":5,"laser":{"damage":[8,8],"rate":8,"type":2,"speed":[140,200],"number":1,"angle":0,"error":2}},"arm3":{"section_segments":6,"offset":{"x":122,"y":-83,"z":-3},"position":{"x":[-6,-6.5,-4,0],"y":[-60,-60,30,30],"z":[0,0,0,0]},"width":[0,1.5,5,0],"height":[0,4,8,0],"texture":[16.9,63],"angle":5},"arm4":{"section_segments":6,"offset":{"x":110,"y":-132,"z":-3},"position":{"x":[0.5,0.5,0,0],"y":[-80,-80,30,30],"z":[0,0,0,0]},"width":[0,1,1,0],"height":[0,4.5,1.5,0],"texture":[16.9],"angle":185},"arm5":{"section_segments":6,"offset":{"x":131.5,"y":47,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-105,-104,-100,-30,0,30,34,36],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,12,17,17,17,10,0],"height":[0,5,10,20,21,22,10,0],"texture":[2.9,2.9,8,2.9,8,3.9],"angle":5},"arm6":{"section_segments":6,"offset":{"x":134,"y":6.5,"z":10},"position":{"x":[-6,-6.5,-6.5,-6.5,-6.5],"y":[-60,-60,10,70,70],"z":[0,-3,3.5,5.5,5.5]},"width":[0,3,5,5,0],"height":[0,4,8,8,0],"texture":[16.9,63],"angle":5},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":120,"y":-23,"z":0},"position":{"x":[0,5,7,0],"y":[-50,-50,29,29],"z":[0,0,0,0]},"width":[0,2,2,0],"height":[0,5,1.5,0],"texture":[17],"angle":180},"box":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":38,"z":-133},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,8,6,6],"z":[0,0,0,0,0,0]},"width":[0,4.666666666666667,4.666666666666667,2,0.6666666666666666,0.6666666666666666],"height":[0,31.5,31.5,27.3,25.200000000000003,0],"texture":[3,3,63,17],"vertical":true,"angle":30},"box2":{"section_segments":[45,135,225,315],"offset":{"x":8,"y":13,"z":-106},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,8,6,6],"z":[0,0,0,0,0,0]},"width":[0,4.666666666666667,4.666666666666667,2,0.6666666666666666,0.6666666666666666],"height":[0,31.5,31.5,27.3,25.200000000000003,0],"texture":[3,3,63,17],"vertical":true,"angle":30},"joint":{"section_segments":6,"offset":{"x":142,"y":18,"z":0},"position":{"x":[-90,-90,0,0],"y":[-150,-150,0,0],"z":[0,0,0,0]},"width":[0,20,20,0],"height":[0,7,7,0],"texture":[1,8],"angle":90},"joint2":{"section_segments":[45,135,225,315],"offset":{"x":142,"y":18,"z":0},"position":{"x":[-90,-90,0,0],"y":[-150,-150,0,0],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,9,9,0],"texture":[17],"angle":90},"joint_box":{"section_segments":[45,135,225,315],"offset":{"x":90,"y":72,"z":0},"position":{"x":[-42,-42,0,0],"y":[-70,-70,0,0],"z":[0,0,0,0]},"width":[0,16,16,0],"height":[0,13,13,0],"texture":[1,2],"angle":90},"joint_box2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":90,"y":77,"z":0},"position":{"x":[-42,-42,0,0],"y":[-70,-70,0,2],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,14,14,0],"texture":[3],"angle":90},"joint3":{"section_segments":[45,135,225,315],"offset":{"x":121,"y":57,"z":0},"position":{"x":[-20,-20,0,0],"y":[-30,-30,0,0],"z":[0,0,0,0]},"width":[0,7,7,0],"height":[0,5,5,0],"texture":[9.96],"angle":90},"cannon":{"section_segments":6,"offset":{"x":0,"y":150,"z":43},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-93,-97,-97,-92,-90,-49,-47,-40,5,8,8],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,6,7,6,6,6,11,11,0],"height":[0,3,4,5,3,3,5,7,8,0],"texture":[16.9,16.9,16.9,4,18,4,16.9,3.9],"laser":{"damage":[8,8],"rate":6,"type":2,"speed":[140,200],"number":2,"error":0,"angle":6}},"propeller_sides":{"section_segments":6,"offset":{"x":35,"y":205,"z":0},"position":{"x":[0],"y":[0],"z":[0]},"width":[14],"height":[23],"propeller":true},"bump":{"section_segments":[45,135,225,315],"offset":{"x":70,"y":65,"z":9},"position":{"x":[0,0,0,0,0],"y":[-1,-1,12,20,20],"z":[-4.9,-4.9,-1,0,0]},"width":[0,3,3,3,0],"height":[0,4,4,4,0],"texture":[63,63,4],"angle":30},"bump2":{"section_segments":[45,135,225,315],"offset":{"x":60,"y":71,"z":9},"position":{"x":[0,0,0,0,0],"y":[-1,-1,12,20,20],"z":[-4.9,-4.9,-1,0,0]},"width":[0,3,3,3,0],"height":[0,4,4,4,0],"texture":[63,63,4],"angle":30},"flap1":{"section_segments":6,"offset":{"x":114.66666666666667,"y":-130,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-13,-13,-10,-2,-2],"z":[0,0,0,0,0]},"width":[0,5.5,4.5,4.5,0],"height":[0,1,1.5,1.5,0],"texture":[111,16.9,[15]],"angle":90},"flap2":{"section_segments":6,"offset":{"x":115.33333333333333,"y":-110,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-13.5,-13.5,-10,-1,-1],"z":[0,0,0,0,0]},"width":[0,6,5,5,0],"height":[0,1,2,2,0],"texture":[111,16.9,[15]],"angle":90},"flap3":{"section_segments":6,"offset":{"x":116,"y":-90,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-14,-14,-10,0,0],"z":[0,0,0,0,0]},"width":[0,6.5,5.5,5.5,0],"height":[0,1,2.5,2.5,0],"texture":[111,16.9,[15]],"angle":90},"flap4":{"section_segments":6,"offset":{"x":116.66666666666667,"y":-70,"z":-3},"position":{"x":[0,0,0,0,0],"y":[-14.5,-14.5,-10,1,1],"z":[0,0,0,0,0]},"width":[0,7,6,6,0],"height":[0,1,3,3,0],"texture":[111,16.9,[15]],"angle":90},"a0":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[0,1,2,2.5,2,1,0,-1,-2,-2.5,-2,-1,0],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c0":{"section_segments":6,"offset":{"x":0,"y":63,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0,5.5,7,7,0],"height":[0,3.5,5,5,0],"texture":[[15],16.9]},"a1":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[2.5,3.5,4.5,5,4.5,3.5,2.5,1.5,0.5,0,0.5,1.5,2.5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c1":{"section_segments":6,"offset":{"x":0,"y":69.5,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0.25,5.75,7.25,7.25,0.25],"height":[0.25,3.75,5.25,5.25,0.25],"texture":[[15],16.9]},"a2":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[5,6,7,7.5,7,6,5,4,3,2.5,3,4,5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c2":{"section_segments":6,"offset":{"x":0,"y":76,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0.5,6,7.5,7.5,0.5],"height":[0.5,4,5.5,5.5,0.5],"texture":[[15],16.9]},"a3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[7.5,8.5,9.5,10,9.5,8.5,7.5,6.5,5.5,5,5.5,6.5,7.5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c3":{"section_segments":6,"offset":{"x":0,"y":82.5,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[0.75,6.25,7.75,7.75,0.75],"height":[0.75,4.25,5.75,5.75,0.75],"texture":[[15],16.9]},"a4":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[10,11,12,12.5,12,11,10,9,8,7.5,8,9,10],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c4":{"section_segments":6,"offset":{"x":0,"y":89,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[1,6.5,8,8,1],"height":[1,4.5,6,6,1],"texture":[[15],16.9]},"a5":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[12.5,13.5,14.5,15,14.5,13.5,12.5,11.5,10.5,10,10.5,11.5,12.5],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c5":{"section_segments":6,"offset":{"x":0,"y":95.5,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[1.25,6.75,8.25,8.25,1.25],"height":[1.25,4.75,6.25,6.25,1.25],"texture":[[15],16.9]},"a6":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":50,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-3.375,-2.625,-1.875,0,1.875,2.625,3.375,2.625,1.875,0,-1.875,-2.625,-3.375],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[1,2,3,3.5,3,2,1,0,-1,-1.5,-1,0,1],"height":[15,16,17,17.5,17,16,15,14,13,12.5,13,14,15],"vertical":0,"texture":[17,4,17,4,17,4],"angle":0},"c6":{"section_segments":6,"offset":{"x":0,"y":102,"z":43},"position":{"x":[0,0,0,0,0],"y":[-2,-2,-2,0,0],"z":[0,0,0,0,0]},"width":[1.5,7,8.5,8.5,1.5],"height":[1.5,5,6.5,6.5,1.5],"texture":[[15],16.9]}},"wings":{"top":{"doubleside":true,"offset":{"x":35,"y":105,"z":14.5},"length":[0,0,-6,-1,-19,-1.5,-1.5,-10],"width":[0,40,40,40,40,120,60,60,0],"angle":[280,280,255,295,300,300,300,0],"position":[50,50,50,50,50,8,28,28,50],"texture":[63,63,63,17,11,17,63],"bump":{"position":30,"size":-4}},"top2":{"doubleside":true,"offset":{"x":35,"y":106,"z":14.5},"length":[0,0,-6,-1,-19,-1.5,-1.5,-10],"width":[0,40,40,40,40,120,60,60,0],"angle":[280,280,255,295,300,300,300,0],"position":[50,50,50,50,50,8,28,28,50],"texture":[63,63,63,17,18,17,63],"bump":{"position":30,"size":-4}}},"typespec":{"name":"Tiaramisu","level":2,"model":7,"code":207,"specs":{"shield":{"capacity":[530,630],"reload":[8,8]},"generator":{"capacity":[310,310],"reload":[130,130]},"ship":{"mass":330,"speed":[95,95],"rotation":[70,70],"acceleration":[100,100]}},"shape":[0.721,0.725,0.632,0.546,0.486,4.716,4.347,3.98,3.719,3.55,3.449,3.413,3.437,3.558,3.693,3.811,4.005,3.948,3.043,3.043,2.884,2.866,3.631,4.617,4.569,4.28,4.569,4.617,3.631,2.866,2.884,3.043,3.043,3.948,4.005,3.811,3.693,3.558,3.437,3.413,3.449,3.55,3.719,3.98,4.347,4.716,0.486,0.546,0.632,0.725],"lasers":[{"x":0.06,"y":-0.72,"z":0,"angle":0,"damage":[20,25],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":1,"error":0,"recoil":40},{"x":-0.06,"y":-0.72,"z":0,"angle":0,"damage":[20,25],"rate":1,"type":1,"speed":[200,200],"number":1,"spread":1,"error":0,"recoil":40},{"x":2.617,"y":-3.892,"z":-0.072,"angle":5,"damage":[8,8],"rate":8,"type":2,"speed":[140,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":-2.617,"y":-3.892,"z":-0.072,"angle":-5,"damage":[8,8],"rate":8,"type":2,"speed":[140,200],"number":1,"spread":0,"error":2,"recoil":0},{"x":0,"y":1.272,"z":1.032,"angle":0,"damage":[8,8],"rate":6,"type":2,"speed":[140,200],"number":2,"spread":6,"error":0,"recoil":0}],"radius":4.716}}',
                    '{"name":"Tsimtsum","level":2,"model":8,"size":1,"specs":{"shield":{"capacity":[520,520],"reload":[7,7]},"generator":{"capacity":[270,270],"reload":[110,115]},"ship":{"mass":240,"speed":[125,125],"rotation":[95,95],"acceleration":[90,90]}},"bodies":{"ring":{"section_segments":12,"offset":{"x":0,"y":-100,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[4.2,4.2,0,0,0,0,0,4.2,4.2,4.2],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[10,10,10,12,12,12,12,12,10,10],"texture":17,"angle":0.2,"vertical":0},"ring2":{"section_segments":12,"offset":{"x":19,"y":-117,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.5999999999999996,3.5999999999999996,0,0,0,0,0,3.5999999999999996,3.5999999999999996,3.5999999999999996],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"height":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"texture":17,"angle":0,"vertical":0},"ring3":{"section_segments":12,"offset":{"x":19,"y":-107,"z":14},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[3.5999999999999996,3.5999999999999996,0,0,0,0,0,3.5999999999999996,3.5999999999999996,3.5999999999999996],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"height":[7,7,7,8.4,8.4,8.4,8.4,8.4,7,7],"texture":17,"angle":0,"vertical":0},"main":{"section_segments":8,"offset":{"x":0,"y":90,"z":-5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-215,-210,-200,-170,10,30,55,75,75,60],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,8,45,35,40,35,30,25,24,0],"height":[0,6,20,20,20,20,20,20,19,0],"propeller":true,"texture":[4,63,4,4,4,4,12,17]},"side_main":{"section_segments":8,"offset":{"x":0.4,"y":90,"z":-5.48},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-215,-210,-200,-170,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,45,35,40,35,30,25,0],"height":[0,6,20,20,20,20,20,20,0],"texture":[4,4,4,18,4,4,4,17]},"head":{"section_segments":[0,55,90,150,210,270,305],"offset":{"x":0,"y":-220,"z":-5},"position":{"x":[0,0,0,0],"y":[0,100,120,140],"z":[0,0,0,0]},"width":[0,50,50,0],"height":[0,25,25,0],"propeller":false,"texture":[63]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":-150,"z":12},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-27.85,-17,17.85,37.71,50,50],"z":[-8.25,-7.46,0,0,0,0]},"width":[0,8.92,13.39,13.39,13,0],"height":[0,8.92,13.39,15.71,14,0],"texture":[7,9,9,4]},"shield":{"section_segments":[0,60,120,180],"offset":{"x":-9,"y":-105,"z":0},"position":{"x":[5,5,-2,-2,-2,-2],"y":[-73,-73,-30,-15,5,5],"z":[0,-1,1,5,5,5]},"width":[0,5,15,15,15,0],"height":[0,11,20,20,20,0],"texture":[16.9,3.9,18,2.9]},"bars":{"section_segments":8,"offset":{"x":30,"y":90,"z":10},"position":{"x":[10,10,5,-2,0,-4,-5,-10,-12,-12,-12,-12,-12],"y":[-215,-210,-200,-170,-53,-40,0,10,30,30,30,30],"z":[-3,-3,-8,0,0,0,2,0,-10,-10,-10,-10]},"width":[0,2,7.5,7.5,7.5,8.75,8.75,8.75,8.75,5,5,0],"height":[0,1.5,5,5,5,5,5,5,5,5,5,0],"propeller":false,"texture":[4,63,18,4,18,8,18,17,13,4]},"under_bars":{"section_segments":8,"offset":{"x":30,"y":90,"z":-20},"position":{"x":[10,10,5,-2,0,0,-12,-12,-12,-12,-12],"y":[-205,-200,-200,-170,-60,-20,30,30,30,30],"z":[9,9,9,0,0,10,10,10,10,10]},"width":[0,2,7.5,7.5,7.5,8.75,8.75,5,5,0],"height":[0,1.5,5,5,5,5,5,5,5,0],"propeller":false,"texture":[4,63,18,4,4,17,13,4]},"cannons":{"section_segments":12,"offset":{"x":160,"y":99,"z":36},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-65,-70,-57,-55,-3,0,5,10,30,30,20],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,12,15,15,13,15,16,16,12,12,11,0],"height":[0,12,15,15,13,15,16,16,12,12,11,0],"texture":[3,17,63,63,4,63,63,63,13,17],"propeller":true,"angle":4,"laser":{"damage":[18,18],"rate":3,"type":1,"speed":[160,200],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":90,"y":84,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-65,-70,-57,-55,-3,0,5,10,25,25,15],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,12.5,12.5,10.83,12.5,13.3,13.3,10,10,9,0],"height":[0,10,12.5,12.5,10.83,12.5,13.3,13.3,10,10,9,0],"texture":[3,17,63,63,4,63,63,63,13,17],"propeller":true,"angle":3,"laser":{"damage":[7,7],"rate":7,"type":2,"speed":[180,180],"number":2,"angle":2,"error":0}},"side_propeller":{"section_segments":8,"offset":{"x":30,"y":110,"z":-5},"position":{"x":[0,0,0,-2,-2,-2,-2],"y":[-50,10,20,36,50,50,40],"z":[10,0,0,0,0,0,0]},"width":[0,6,7.5,7.5,6.5,5,0],"height":[0,12,15,15,13,11.5,0],"texture":[3,17,3,13,17,17],"propeller":true},"wing_holders":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-20,"z":-125},"position":{"x":[0,0,0,0,0,0],"y":[30,30,40,50,50],"z":[0,0,-10,-20,-20,0]},"width":[0,20,20,20,0],"height":[0,25,25,25,0],"propeller":false,"vertical":true,"texture":[3]},"blocc":{"section_segments":[45,135,225,315],"offset":{"x":0.01,"y":-89.99,"z":15.01},"position":{"x":[0,0,0,0,0,0],"y":[-25,-25,-20,0,0,0],"z":[0,0,0,0,0,0]},"width":[0,12,12,12,12,12,0],"height":[0,3,3,3,3,0],"texture":[3,3,17,3,3],"angle":270},"bars2":{"section_segments":[45,90,135,225,270,315],"offset":{"x":18,"y":-49,"z":12},"position":{"x":[5,5,0,0,0,-8,-8],"y":[-50,-50,-30,50,86,49,55],"z":[-5,-5,0,0,0,0,-5]},"width":[0,12,12,12,12,12,0,0],"height":[0,5,5,5,5,0,0],"texture":[63,63,3,63,3]},"box":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-41.5,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-40,-40,10,12.5,15,15],"z":[0,0,0,0,0,0]},"width":[0,13,13,13,13,0],"height":[0,5,5,5,5,0],"texture":[1,18.2,17,3]},"back_support":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":4.5,"z":17.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-18,-14,-4,0,7.5,7.5],"z":[-3.5,-2.5,-2,-2,-2,-5.4,-5.4]},"width":[5,5,5,5,5,5,0],"height":[2,2,2,2,2,2,2,0],"texture":[3,63,4,63,3],"angle":90},"back_support2":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":34.5,"z":17.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-18,-14,-4,0,8,8.5],"z":[-3.5,-2.5,-2,-2,-2,-4,-4]},"width":[5,5,5,5,5,5,0],"height":[2,2,2,2,2,2,2,0],"texture":[3,63,4,63,3],"angle":90},"back_support3":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":19.5,"z":17.5},"position":{"x":[0,0,0,0,0,0,0],"y":[-27,-18,-14,-4,0,8,8.5],"z":[-3.5,-2.5,-2,-2,-2,-4,-4]},"width":[5,5,5,5,5,5,0],"height":[2,2,2,2,2,2,2,0],"texture":[3,63,4,63,3],"angle":90},"back_lights":{"section_segments":4,"offset":{"x":0,"y":21,"z":14},"position":{"x":[0,0,0,0,0,0],"y":[-13,-13,-5,2,10,10],"z":[0,0,0,0,0,0]},"width":[0,8,8,8,8,0],"height":[0,1,1,1,1,0],"texture":[17]},"reactor":{"section_segments":12,"offset":{"x":0,"y":28,"z":12.5},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-20,-13,-10,-12,-12.5,-10,-10,-12],"z":[0,0,0,0,0,0,0,0]},"width":[13,13,10,9,6,4.2,4,0],"height":[13,13,10,9,6,4.2,4,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"reactor_joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-12,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-15,-15,-5,10,15,15],"z":[0,1.2,0,0,-2.8,-2.8]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[4]},"reactor_joint2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":-12.5,"z":16},"position":{"x":[0,0,0,0,0,0],"y":[-15,-15,-10,10,15,15],"z":[-2.8,-2.8,0,0,-2.8,-2.8]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[4],"angle":90},"reactor2":{"section_segments":12,"offset":{"x":0,"y":50,"z":-150},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-14.285714285714286,-9.285714285714286,-7.142857142857143,-8.571428571428571,-8.928571428571429,-7.142857142857143,-7.142857142857143,-8.571428571428571],"z":[0,0,0,0,0,0,0,0]},"width":[13,13,10,9,6,4.2,4,0],"height":[13,13,10,9,6,4.2,4,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"back":{"section_segments":[40,45,50,130,135,140,220,225,310,315,320],"offset":{"x":15,"y":53,"z":15},"position":{"x":[0,3,3,0,0,0,0,0],"y":[-15.5,-15,-10,5,30,45,50,52],"z":[0,-1.8,0,0,0,0,0,0]},"width":[0,12,12,12,12,12,10.5,0],"height":[0,5,5,5,5,5,5,0],"texture":[63,63,3,13,3,63]},"back_bars":{"section_segments":[45,135,225,315],"offset":{"x":27,"y":53,"z":18},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,-3.5,3.5,7,7],"z":[0,0,0,-2,-5,-5]},"width":[0,3.5,3.5,3.5,3.5,0],"height":[0,3,3,3,3,0],"texture":[4],"angle":90},"back_bars2":{"section_segments":[45,135,225,315],"offset":{"x":25,"y":88,"z":18},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,-3.5,3.5,7,7],"z":[0,0,0,-2,-5,-5]},"width":[0,3.5,3.5,3.5,3.5,0],"height":[0,3,3,3,3,0],"texture":[4],"angle":90},"back_hubs":{"section_segments":12,"offset":{"x":18,"y":33,"z":-77},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-20,-13,-11,-12,-12.5,-10,-10,-12],"z":[0,0,0,0,0,0,0,0]},"width":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"height":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"back_hubs2":{"section_segments":12,"offset":{"x":18,"y":33,"z":-64},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-20,-13,-11,-12,-12.5,-10,-10,-12],"z":[0,0,0,0,0,0,0,0]},"width":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"height":[5.333333333333333,5.333333333333333,4.666666666666667,4,2.6666666666666665,0.7999999999999999,0.6666666666666666,0],"texture":[1,3,18,17,18,16,17],"vertical":true},"cannon_lights":{"section_segments":[45,135,225,315],"offset":{"x":166,"y":71,"z":47.3},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,30,30],"z":[-2,-2,-1.5,0,0]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[3,3,63],"angle":4},"cannon_lights2":{"section_segments":[45,135,225,315],"offset":{"x":150,"y":71,"z":47.3},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,30,30],"z":[-2,-2,-1.5,0,0]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[3,3,63],"angle":4},"cannon_lights3":{"section_segments":[45,135,225,315],"offset":{"x":165,"y":71,"z":47.3},"position":{"x":[0,0,0,0],"y":[-30,-30,30,30],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[17],"angle":4},"cannon_lights4":{"section_segments":[45,135,225,315],"offset":{"x":151,"y":71,"z":47.3},"position":{"x":[0,0,0,0],"y":[-30,-30,30,30],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[17],"angle":4},"cannon_light":{"section_segments":[45,135,225,315],"offset":{"x":158,"y":71,"z":49},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[18],"angle":18},"cannon_light2":{"section_segments":[45,135,225,315],"offset":{"x":158,"y":71,"z":49},"position":{"x":[0,0,0,0],"y":[-30,-30,27,27],"z":[-2,-2,0,0]},"width":[0,1.5,1.5,1.5,0],"height":[0,3,3,3,3,0],"texture":[18],"angle":-9},"lower_cannon_lights":{"section_segments":[45,135,225,315],"offset":{"x":96,"y":56.5,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,25,25],"z":[-3,-3,-3.5,-2.5,-2.5]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[4,4,63],"angle":4},"lower_cannon_lights2":{"section_segments":[45,135,225,315],"offset":{"x":81,"y":56.5,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-30,-30,-25,25,25],"z":[-3,-3,-3.5,-2.5,-2.5]},"width":[0,1.5,1.5,1.5,1.5,0],"height":[0,3,3,3,3,3,0],"texture":[4,4,63],"angle":2},"lower_cannon_lights3":{"section_segments":[45,135,225,315],"offset":{"x":94.5,"y":56.5,"z":-4.4},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3.4,-2.5,-2.5]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[17],"angle":4},"lower_cannon_lights4":{"section_segments":[45,135,225,315],"offset":{"x":82.5,"y":56.5,"z":-5},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3,-2.5,-2.5]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[17],"angle":2},"lower_cannon_lights5":{"section_segments":[45,135,225,315],"offset":{"x":89,"y":56.5,"z":-2.6},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3,-2.5,-2.5]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[18],"angle":17},"lower_cannon_lights6":{"section_segments":[45,135,225,315],"offset":{"x":87.2,"y":56.5,"z":-2.9},"position":{"x":[0,0,0,0],"y":[-30,-30,25,25],"z":[-3,-3,-3,-3]},"width":[0,1.5,1.5,0],"height":[0,3,3,0],"texture":[18],"angle":-12},"wing_cross":{"section_segments":10,"offset":{"x":0,"y":165,"z":35},"position":{"x":[0,0,0,0],"y":[-15,-15,20,20],"z":[0,3.5,-0.3,0]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":180},"wing_cross2":{"section_segments":10,"offset":{"x":0,"y":145,"z":35},"position":{"x":[0,0,0,0],"y":[-15,-15,1,1],"z":[0,-3,-0.1,0]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":0},"wing_cross3":{"section_segments":10,"offset":{"x":0,"y":150,"z":38},"position":{"x":[0,0,0,0],"y":[-20,-20,-5,-5],"z":[0,0,-3,-3]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":90},"wing_cross4":{"section_segments":10,"offset":{"x":0,"y":150,"z":38},"position":{"x":[0,0,0,0],"y":[-20,-20,-5,-5],"z":[0,0,-3,-3]},"width":[0,6,6,0],"height":[0,1,1,0],"texture":[5,17],"angle":-90},"wing_cross5":{"section_segments":10,"offset":{"x":3,"y":150,"z":35},"position":{"x":[0,0,0,0],"y":[-20,-20,30,30],"z":[0,-1,4.5,4.5]},"width":[0,0.5,0.5,0],"height":[0,1,1,0],"texture":[5],"angle":0},"wing_cross6":{"section_segments":10,"offset":{"x":0,"y":152,"z":35},"position":{"x":[0,0,0,0,0],"y":[-20,-20,0,20,20],"z":[4,4,0.8,4,4]},"width":[0,0.5,0.5,0.5,0],"height":[0,1,1,1,0],"texture":[5],"angle":90},"wing_cross7":{"section_segments":10,"offset":{"x":0,"y":147,"z":35},"position":{"x":[0,0,0,0,0],"y":[-20,-20,0,20,20],"z":[4,4,0.5,4,4]},"width":[0,0.5,0.5,0.5,0],"height":[0,1,1,1,0],"texture":[5],"angle":90},"wing_bump":{"section_segments":6,"offset":{"x":75,"y":186,"z":15},"position":{"x":[0,0,0,0,0],"y":[-3,4,4,-3,-3],"z":[0,0,0,0,0]},"width":[13,13,11,11,13],"height":[5,5,0,0,5],"angle":90,"texture":[17,4]},"wing_bump2":{"section_segments":6,"offset":{"x":85,"y":188,"z":17},"position":{"x":[0,0,0,0,0],"y":[-3,4,4,-3,-3],"z":[0,0,0,0,0]},"width":[11,11,9,9,11],"height":[5,5,0,0,5],"angle":90,"texture":[17,4]},"lights":{"section_segments":[45,135,225,315],"offset":{"x":14,"y":5,"z":38},"position":{"x":[0,0,0,0,0],"y":[-5,-5,15,16,16],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,53,53,51,0],"texture":[63,17,63],"angle":40,"vertical":true},"lights2":{"section_segments":[45,135,225,315],"offset":{"x":3,"y":16,"z":59},"position":{"x":[0,0,0,0,0],"y":[-5,-5,5,6,6],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,23,23,21,0],"texture":[63,17,63],"angle":30,"vertical":true},"lights3":{"section_segments":[45,135,225,315],"offset":{"x":4,"y":13,"z":-77},"position":{"x":[0,0,0,0,0],"y":[-5,-5,5,6,6],"z":[0,0,0,0,0]},"width":[0,3,3,2,0],"height":[0,33,33,31,0],"texture":[63,17,63],"angle":30,"vertical":true},"asa0":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-75,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as0":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-73.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa1":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-65,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as1":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-63.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa2":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-55,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as2":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-53.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa3":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-45,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as3":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-43.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90},"asa4":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-35,"z":18.8},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[63],"angle":90},"as4":{"section_segments":[45,135,225,315],"offset":{"x":19,"y":-33.2,"z":18.7},"position":{"x":[0,0,0,0,0],"y":[-10,-10,-7,10,10],"z":[0,0,-0.5,-10,-10]},"width":[0,2.5,2.5,2.5,0],"height":[0,1,1,1,0],"texture":[[15]],"angle":90}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":70,"z":0},"length":[45,2,20,2,12,2,20,2,55],"width":[70,61,61,61,61,58,58,55,55,45],"angle":[15,15,15,15,15,15,15,15,15],"position":[0,0,0,0,0,0,0,0,0,0],"texture":[8,17,4,17,18,17,8,17,18],"bump":{"position":20,"size":10}},"main_lights":{"doubleside":true,"offset":{"x":0,"y":68,"z":0},"length":[45,2,20,2,12,2,20,2,55],"width":[70,61,61,61,61,58,58,55,55,45],"angle":[15,15,15,15,15,15,15,15,15],"position":[0,0,0,0,0,0,0,0,0,0],"texture":[17],"bump":{"position":30,"size":0}},"main2":{"doubleside":true,"offset":{"x":0,"y":71,"z":0},"length":[45,2,20,2,12,2,20,2,54],"width":[70,61,61,61,61,58,58,55,55,45],"angle":[15,15,15,15,15,15,15,15,15],"position":[0,0,0,0,0,0,0,0,0,0],"texture":[8,17,4,17,4,17,3,17,4],"bump":{"position":20,"size":10}},"bottom":{"doubleside":true,"offset":{"x":0,"y":70,"z":5},"length":[35,50],"width":[67.5,57.5,47.5],"angle":[-15,-10],"position":[0,-10,-17.5],"texture":[4,17.8],"bump":{"position":30,"size":10}},"bottom_lights":{"doubleside":true,"offset":{"x":0,"y":68,"z":5},"length":[35,50],"width":[67.5,57.5,47.5],"angle":[-15,-10],"position":[0,-10,-17.5],"texture":[17],"bump":{"position":30,"size":0}},"top":{"doubleside":true,"offset":{"x":0,"y":170,"z":30},"length":[25,2,50,2,35,100],"width":[70,60,60,50,48,20],"angle":[15,-30,-30,20,20],"position":[-15,-13,-13,10,10,20],"texture":[4,17,18,17,4],"bump":{"position":35,"size":10}},"top_lights":{"doubleside":true,"offset":{"x":0,"y":168,"z":30},"length":[25,2,50,2,35,100],"width":[70,60,60,50,48,20],"angle":[15,-30,-30,20,20],"position":[-15,-13,-13,10,10,20],"texture":[17],"bump":{"position":35,"size":0}}},"typespec":{"name":"Tsimtsum","level":2,"model":8,"code":208,"specs":{"shield":{"capacity":[520,520],"reload":[7,7]},"generator":{"capacity":[270,270],"reload":[110,115]},"ship":{"mass":240,"speed":[125,125],"rotation":[95,95],"acceleration":[90,90]}},"shape":[4.4,3.908,3.238,2.799,2.348,1.342,1.142,0.993,0.903,0.832,0.792,1.742,3.095,3.277,3.517,3.692,4.002,4.299,4.322,2.968,2.83,4.508,4.444,4.284,3.895,3.8,3.895,4.284,4.444,4.508,2.83,2.968,4.322,4.299,4.002,3.692,3.517,3.277,3.095,1.742,0.792,0.832,0.903,0.993,1.142,1.342,2.348,2.799,3.238,3.908],"lasers":[{"x":3.054,"y":-0.115,"z":0.72,"angle":4,"damage":[18,18],"rate":3,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.054,"y":-0.115,"z":0.72,"angle":-4,"damage":[18,18],"rate":3,"type":1,"speed":[160,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.695,"y":-0.317,"z":-0.3,"angle":3,"damage":[7,7],"rate":7,"type":2,"speed":[180,180],"number":2,"spread":2,"error":0,"recoil":0},{"x":-1.695,"y":-0.317,"z":-0.3,"angle":-3,"damage":[7,7],"rate":7,"type":2,"speed":[180,180],"number":2,"spread":2,"error":0,"recoil":0}],"radius":4.508}}',
                    '{"name":"Pusat","level":2,"model":9,"size":1.3,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[240,240],"reload":[88,88]},"ship":{"mass":240,"speed":[130,130],"rotation":[75,75],"acceleration":[90,90]}},"bodies":{"ring":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":34.5,"y":79,"z":1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13,13.6,14.2,14.5,14.2,13.6,13,12.4,11.8,11.5,11.8,12.4,13],"height":[12,12.6,13.2,13.5,13.2,12.6,12,11.4,10.8,10.5,10.8,11.4,12],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":34.5,"y":69,"z":1.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[13,13.6,14.2,14.5,14.2,13.6,13,12.4,11.8,11.5,11.8,12.4,13],"height":[12,12.6,13.2,13.5,13.2,12.6,12,11.4,10.8,10.5,10.8,11.4,12],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring3":{"section_segments":[45,135,225,315],"offset":{"x":38.5,"y":5,"z":-74},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8.1,8.7,9.299999999999999,9.6,9.299999999999999,8.7,8.1,7.5,6.8999999999999995,6.6,6.8999999999999995,7.5,8.1],"height":[7,7.6,8.2,8.5,8.2,7.6,7,6.4,5.8,5.5,5.8,6.4,7],"vertical":1,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring4":{"section_segments":[45,135,225,315],"offset":{"x":38.5,"y":-2,"z":-74},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8.1,8.7,9.299999999999999,9.6,9.299999999999999,8.7,8.1,7.5,6.8999999999999995,6.6,6.8999999999999995,7.5,8.1],"height":[7,7.6,8.2,8.5,8.2,7.6,7,6.4,5.8,5.5,5.8,6.4,7],"vertical":1,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring5":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-95,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring6":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-90,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring7":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-85,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring8":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-80,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring9":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-75,"z":-8.7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"height":[4.5,5.1,5.7,6,5.7,5.1,4.5,3.9,3.3,3,3.3,3.9,4.5],"vertical":0,"texture":[[15],17,[15],[15],17,[15],[15],17,[15]],"angle":0},"ring10":{"section_segments":6,"offset":{"x":0,"y":40,"z":9.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.6,17.2,17.5,17.2,16.6,16,15.4,14.8,14.5,14.8,15.4,16],"height":[16,16.6,17.2,17.5,17.2,16.6,16,15.4,14.8,14.5,14.8,15.4,16],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring11":{"section_segments":6,"offset":{"x":0,"y":50,"z":14.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[16,16.6,17.2,17.5,17.2,16.6,16,15.4,14.8,14.5,14.8,15.4,16],"height":[6,6.6,7.2,7.5,7.2,6.6,6,5.4,4.8,4.5,4.8,5.4,6],"vertical":0,"texture":[18,17,18,18,17,18,18,17,18],"angle":0},"ring12":{"section_segments":8,"offset":{"x":12,"y":45,"z":14.5},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.575,-1.2249999999999999,-0.875,0,0.875,1.2249999999999999,1.575,1.2249999999999999,0.875,0,-0.875,-1.2249999999999999,-1.575],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[8,8.6,9.2,9.5,9.2,8.6,8,7.4,6.8,6.5,6.8,7.4,8],"height":[8,8.6,9.2,9.5,9.2,8.6,8,7.4,6.8,6.5,6.8,7.4,8],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":0},"ring13":{"section_segments":8,"offset":{"x":7,"y":68,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3499999999999999,-1.05,-0.75,0,0.75,1.05,1.3499999999999999,1.05,0.75,0,-0.75,-1.05,-1.3499999999999999],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"height":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":0},"ring14":{"section_segments":8,"offset":{"x":0,"y":61,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3499999999999999,-1.05,-0.75,0,0.75,1.05,1.3499999999999999,1.05,0.75,0,-0.75,-1.05,-1.3499999999999999],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"height":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":90},"ring15":{"section_segments":8,"offset":{"x":0,"y":75,"z":19},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-1.3499999999999999,-1.05,-0.75,0,0.75,1.05,1.3499999999999999,1.05,0.75,0,-0.75,-1.05,-1.3499999999999999],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"height":[4,4.5,5,5.25,5,4.5,4,3.5,3,2.75,3,3.5,4],"vertical":0,"texture":[[15],[15],63,63,[15]],"angle":90},"front":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-126,-126,-115,-70,-23,-5,-5,-5],"z":[0,0,0,0,0,0,0,0]},"width":[0,6,9.6,25,25,25,23,0],"height":[0,5.3,8.4,20,20,15,13,0],"texture":[12,2,3.9,18,10,63,4],"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[240,240],"number":1,"error":0,"recoil":10}},"back":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-20,-20,-10,-8,40,70,80,90,100,100,100,85],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,25,25,25,25,25,35,35,35,30,28,0],"height":[0,15,20,20,19,20,20,20,20,15,13,0],"texture":[63,18,17,4,18,3.9,3.9,4.9,4.9,16.84],"propeller":true},"head":{"section_segments":6,"offset":{"x":0,"y":-2,"z":0},"position":{"x":[0,0,0,0,0],"y":[-130,-128,-115,-70,-70],"z":[0,0,0,0,0]},"width":[0,5,10,25,25],"height":[0,4.545454545454545,7.363636363636362,18.18181818181818,18.18181818181818],"texture":[3.9]},"head_top":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-115,-115,-115,-70,-70],"z":[0,0,0,0,0]},"width":[0,0,8.615384615384615,22.307692307692307,19.23076923076923],"height":[0,0,9.240000000000002,22,22],"texture":[17,63,3]},"head_top2":{"section_segments":5,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-115,-115,-115,-70,-70],"z":[0,0,1.1,2.4,0]},"width":[0,0,8,20.714285714285715,17.857142857142858],"height":[0,0,8.4,20,20],"texture":[17,18]},"head_top3":{"section_segments":5,"offset":{"x":0,"y":0,"z":-0.1},"position":{"x":[0,0,0,0,0],"y":[-115,-115,-115,-70,-70],"z":[0,0,1.1,2.4,0]},"width":[0,0,8.615384615384615,22.307692307692307,19.23076923076923],"height":[0,0,8.4,20,20],"texture":[63,63,17]},"bottom":{"section_segments":6,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[0,-80,-30,-25,0,20,50,80],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,0,0,20,30,30,25,0],"height":[0,2,15,15,20,20,20,0],"texture":[4,3,2,3,11,18]},"cockpit":{"section_segments":6,"offset":{"x":0,"y":30,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-20,0,10,20,30,48],"z":[0,0,-2,-4,0,-9,0]},"width":[0,10,15,15,15,10,0],"height":[0,10,15,15,5,10,0],"texture":[9,9,9,4,4]},"cannons_main":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-100,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[5,0,0,30,35,45,47,74,76,97,102,173],"z":[-17,-17,-17,-17,-10,-10,-10,-11,-10,-10,-10,-10,-10]},"width":[0,5,6.5,6.5,7,7,0,0,7,7,10,10],"height":[0,3.5,5,5,8,10,0,0,10,10,8,8],"texture":[17,17,13,4,8,18,1,18,7,7,7,8],"propeller":false,"laser":{"damage":[9,9],"rate":8,"type":2,"speed":[280,280],"number":1,"error":2,"recoil":4}},"joints":{"section_segments":[45,135,225,315],"offset":{"x":16,"y":8.5,"z":-25},"position":{"x":[0,0,0,0,0,0],"y":[-7,-7,6,8,6,6],"z":[0,0,0,0,0,0]},"width":[0,7,7,3,1,1],"height":[0,35.699999999999996,35.699999999999996,30.939999999999998,28.56,0],"texture":[8,8,63,17,18],"vertical":true,"angle":30},"sides":{"section_segments":[0,60,120,180],"offset":{"x":-14,"y":32,"z":14},"position":{"x":[0,0,0,0,0,0,-8,-8],"y":[-20,-20,4,6,18,20,35,35],"z":[-7,-4,-4,-3,-3,-3,-6,-6]},"width":[0,5,15,15,15,15,5,0],"height":[0,5,10,10,10,10,3,0],"texture":[16.9,4,63,18,63,4]},"joins":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-54.5,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-10,-5,0,5,10,15,20,25,30,35,40],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,1,5,1,5,1,5,1,5,1,0],"height":[0,1,7,1,7,1,7,1,7,1,0],"texture":[17,18,17,18,17,18,17,18,17,18],"propeller":false},"cannon_joint":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":-13.5,"z":49},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[5,5,19,19,0,0,5,5,19,19,0,0,5,5,19,19,0,0,5,5,19,19,0,0,5,5,19,19],"z":[0,0,0,0,0,0,-5,-5,-5,-5,0,0,-10,-10,-10,-10,0,0,-15,-15,-15,-15,0,0,-20,-20,-20,-20]},"width":[0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0,0,0,0,7,7,0],"height":[0,1.3,1.3,0,0,0,0,1.3,1.3,0,0,0,0,1.3,1.3,0,0,0,0,1.3,1.3,0,0,0,0,1.3,1.3,0],"texture":[17,18,17,18,17,18,17,18,17,18,17,18,1,18,17,18,17,18,17,18,17,18,17,18,17,18,17,18],"propeller":false,"vertical":true},"cannon_joint_side":{"section_segments":[80,90,100],"offset":{"x":-20,"y":-55,"z":-2},"position":{"x":[53,53,53,53],"y":[-0.3,-0.3,31,31],"z":[0,0,0,0]},"width":[8,8,8,8],"height":[0,42,42,0],"texture":[3],"propeller":false},"cannon_joint_side2":{"section_segments":[-100,-90,-80],"offset":{"x":-10.52,"y":-55,"z":-2},"position":{"x":[38,38,38,38],"y":[-0.3,-0.3,31,31],"z":[0,0,0,0]},"width":[8,8,8,8],"height":[0,42,42,0],"texture":[3],"propeller":false},"rear_cannon":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":40,"y":65,"z":-3},"position":{"x":[-5,0,0,0,0],"y":[-40,-20,0,10,20],"z":[0,0,10,0,0]},"width":[4,4,4,4,4],"height":[5,5,5,5,5],"texture":[3,18,4,8,9],"propeller":false},"rear_cannon1":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":40,"y":65,"z":-3},"position":{"x":[-5,0,0],"y":[-40,-20,0],"z":[0,0,0]},"width":[4,4.01,4.01],"height":[5,5,5],"texture":[3,18,4],"propeller":false},"rear_cannon2":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":30,"y":65,"z":-3},"position":{"x":[-5,0,0,0,0],"y":[-40,-20,0,10,20],"z":[0,0,10,0,0]},"width":[4,4,4,4,4],"height":[5,5,5,5,5],"texture":[3,18,4,8,9],"propeller":false},"rear_propeller":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":34.5,"y":75.5,"z":1.7},"position":{"x":[0,0,0,0,0,-4,-4,-4],"y":[-10,-10,-8,5,7,20,20,10],"z":[0,0,0,0,0,0,0,0]},"width":[0,12,13,13,13,13,12,0],"height":[5,12,12,12,12,10,9,0],"texture":[3,17,13,17,5,17],"propeller":true},"rear_propeller2":{"section_segments":[45,135,225,315],"offset":{"x":21,"y":0,"z":25},"position":{"x":[-10,-10,-4,-4],"y":[0,0,94,94],"z":[-5,-5,-11,-10]},"width":[0,3,1.3,0],"height":[0,2,0.3,0],"texture":[17],"angle":180},"hubs":{"section_segments":8,"offset":{"x":5,"y":17,"z":-45},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-3.5714285714285716,-5,-2.857142857142857,-2.857142857142857,-4.285714285714286,-4.285714285714286,5.714285714285714,5.714285714285714],"z":[0,0,0,0,0,0,0,0]},"width":[-2.1052631578947367,2.1052631578947367,2.1052631578947367,2.6315789473684212,2.6315789473684212,3.1578947368421053,3.1578947368421053,0],"height":[-2.1052631578947367,2.1052631578947367,2.1052631578947367,2.6315789473684212,2.6315789473684212,3.1578947368421053,3.1578947368421053,0],"vertical":true,"texture":[17,18,18,18,63,4],"angle":205},"reactor":{"section_segments":12,"angle":0,"offset":{"x":0,"y":14,"z":-68},"position":{"x":[0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,6.875],"z":[0,0,0,0,0]},"width":[10.4,10.4,9.4,9.4,9.4],"height":[10.4,10.4,9.4,9.4,0],"texture":[17,2,17,11],"vertical":true},"reactor_top":{"section_segments":8,"angle":0,"offset":{"x":0,"y":19,"z":-68},"position":{"x":[0,0,0,0],"y":[-10,-10,0,5],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,10,10,0],"texture":[18],"vertical":true},"reactor_bottom":{"section_segments":12,"angle":0,"offset":{"x":0,"y":13,"z":-68},"position":{"x":[0,0,0,0,0],"y":[-2.5,7.5,7.5,6.875,6.875],"z":[0,0,0,0,0]},"width":[16,16,14,14,0],"height":[16,16,14,14,0],"texture":[3,17,3,18],"vertical":true},"reactor_reactor":{"section_segments":8,"offset":{"x":10,"y":16.5,"z":-68},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"height":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"reactor_reactor2":{"section_segments":8,"offset":{"x":0,"y":16.5,"z":-58},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"height":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"reactor_reactor3":{"section_segments":8,"offset":{"x":0,"y":16.5,"z":-78},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-5,-7,-5.5,-5.5,-6,-6,8,8],"z":[0,0,0,0,0,0,0,0]},"width":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"height":[0,2,2,2.6666666666666665,2.6666666666666665,3.3333333333333335,3.3333333333333335,0],"vertical":true,"texture":[17,17,18,4,63,[15]],"angle":180},"body_deco":{"section_segments":[45,135,225,315],"offset":{"x":12,"y":-15,"z":14},"position":{"x":[0,0,0,5,5,5],"y":[-40,-40,-5,5,25,25],"z":[2,2,1,0,0,0]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[3]},"body_deco2":{"section_segments":[45,135,225,315],"offset":{"x":11.2,"y":-15,"z":13.99},"position":{"x":[-5,-5,0,0,0,0],"y":[-4.95,-4.95,5,40,40,39.95],"z":[0,0,1,2,2,2,2]},"width":[0,2,2,2,2,0],"height":[0,3,3,3,3,0],"texture":[7,18,17,7,7],"angle":180},"body_deco3":{"section_segments":[45,135,225,315],"offset":{"x":11.2,"y":-15,"z":13.99},"position":{"x":[5,5,5],"y":[5,25,25],"z":[0,0,0]},"width":[2,2,2],"height":[3,3,3],"texture":[17]},"cannon_base":{"section_segments":[45,135,225,315],"angle":0,"offset":{"x":0,"y":-48,"z":17},"position":{"x":[0,0,0,0,0,0],"y":[-22,-22,-10,-5,25,25],"z":[0,0,0,0,-1,-1]},"width":[0,10,12.5,9,9,0],"height":[0,5,5,5,5,0],"texture":[7]},"cannon_base_deco":{"section_segments":[45,135,225,315],"angle":0,"offset":{"x":0,"y":-31,"z":19},"position":{"x":[0,0,0,0],"y":[-7.5,-7.5,7.5,7.5],"z":[0,0,0,0]},"width":[0,6,6,0],"height":[0,2.5,2.5,0],"texture":[4,15,4]},"cannon_base_deco2":{"section_segments":[45,135,225,315],"angle":0,"offset":{"x":5,"y":-62.4,"z":20},"position":{"x":[0.5,2,0,0.5,0.5,0.5],"y":[-7.6,4.5,8.5,14,39.5,39.5],"z":[0,0,0,0,-0.8,-0.8]},"width":[0.8,1,1,1,1,0],"height":[1,1,1,1,1,0],"texture":[63]},"cannon_front":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":20,"z":23},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-93,-96,-92,-90,-53,-50,-48,-43.5,-43.5],"z":[0,0,0,0,0,0,0,-2,-2]},"width":[0,3.5999999999999996,4.2,4.02,4.02,4.8,4.8,4.8,0],"height":[0,2.4,3,1.7999999999999998,1.7999999999999998,2.4,3,3,0],"texture":[17,13,5,1,5,17,3,4],"laser":{"damage":[80,80],"rate":1,"type":1,"speed":[240,260],"number":1,"error":0,"recoil":130}},"front_cannon_deco":{"section_segments":8,"offset":{"x":0,"y":-32.5,"z":24},"position":{"x":[-2.3,-2.3,-2.4,-2.2],"y":[0,0,38,0],"z":[0,0,0,0]},"width":[0,0.8999999999999999,0.8999999999999999,0],"height":[0,0.6,0.6,0],"texture":[7.5],"angle":187},"front_cannon_deco2":{"section_segments":8,"offset":{"x":0,"y":-32.5,"z":24},"position":{"x":[2.3,2.3,2.4,2.2],"y":[0,0,38,0],"z":[0,0,0,0]},"width":[0,0.8999999999999999,0.8999999999999999,0],"height":[0,0.6,0.6,0],"texture":[7.5],"angle":-187},"stripe1":{"section_segments":[45,135,225,315],"offset":{"x":8.5,"y":-71.5,"z":11.5},"position":{"x":[0,0,0,0,0],"y":[-5,-5,7,8,8],"z":[0,0,-6.8,-6.8,-6.8]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[11,11,17],"angle":90},"stripe2":{"section_segments":[45,135,225,315],"offset":{"x":8.25,"y":-78,"z":10.799999999999999},"position":{"x":[0,0,0,0,0],"y":[-5,-5,5.5,6.5,6.5],"z":[0,-1,-6.8999999999999995,-6.8999999999999995,-6.8999999999999995]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[11,11,17],"angle":90},"stripe3":{"section_segments":[45,135,225,315],"offset":{"x":8,"y":-84.5,"z":10.1},"position":{"x":[0,0,0,0,0],"y":[-5,-5,4,5,5],"z":[0,-2,-7,-7,-7]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[8,8,17],"angle":90},"stripe4":{"section_segments":[45,135,225,315],"offset":{"x":7.75,"y":-91,"z":9.399999999999999},"position":{"x":[0,0,0,0,0],"y":[-5,-5,2.5,3.5,3.5],"z":[0,-3,-7.3,-7.3,-7.3]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[18,18,17],"angle":90},"stripe5":{"section_segments":[45,135,225,315],"offset":{"x":7.5,"y":-97.5,"z":8.7},"position":{"x":[0,0,0,0,0],"y":[-5,-5,1,2,2],"z":[0,-4,-7.5,-7.5,-7.5]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[8,8,17],"angle":90},"stripe6":{"section_segments":[45,135,225,315],"offset":{"x":7.25,"y":-104,"z":8},"position":{"x":[0,0,0,0,0],"y":[-5,-5,-0.5,0.5,0.5],"z":[0,-5,-7.7,-7.7,-7.7]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[18,18,17],"angle":90},"stripe7":{"section_segments":[45,135,225,315],"offset":{"x":7,"y":-110.5,"z":7.300000000000001},"position":{"x":[0,0,0,0,0],"y":[-5,-5,-2,-1,-1],"z":[0,-6,-7.9,-7.9,-7.9]},"width":[0,2,2,1,0],"height":[0,12,12,10,0],"texture":[8,8,17],"angle":90}},"wings":{"winglets":{"doubleside":true,"offset":{"x":10,"y":60,"z":5},"length":[30],"width":[50,30],"angle":[60],"position":[0,50],"texture":[3],"bump":{"position":10,"size":10}},"winglets2":{"doubleside":true,"offset":{"x":10,"y":61,"z":5},"length":[30],"width":[50,30],"angle":[60],"position":[0,50],"texture":[18],"bump":{"position":10,"size":9}},"back":{"doubleside":true,"offset":{"x":10,"y":70,"z":10},"length":[30],"width":[40,20],"angle":[3],"position":[0,60],"texture":[63],"bump":{"position":10,"size":10}},"back2":{"doubleside":true,"offset":{"x":10,"y":75,"z":10},"length":[30],"width":[40,20],"angle":[3],"position":[0,60],"texture":[7],"bump":{"position":10,"size":9}},"main":{"doubleside":true,"offset":{"x":25,"y":-70,"z":14},"length":[1,25],"width":[0,190,76],"angle":[10,20],"position":[30,70,130],"texture":[63,63],"bump":{"position":20,"size":7}},"main2":{"doubleside":true,"offset":{"x":22.8,"y":-70,"z":14},"length":[1,25],"width":[0,190,36],"angle":[10,20],"position":[30,70,130],"texture":[63,17],"bump":{"position":20,"size":7}},"main3":{"doubleside":true,"offset":{"x":25,"y":-65,"z":13},"length":[0,30],"width":[0,184,76],"angle":[10,20],"position":[30,70,130],"texture":[63,7],"bump":{"position":20,"size":6}},"top_loader":{"doubleside":true,"offset":{"x":4,"y":75,"z":15},"length":[0,6,12,0],"width":[0,50,50,30,20],"angle":[0,0,-10,-10],"position":[-20,-6,-13,-20,-20],"texture":[12,17,8.3,3.9],"bump":{"position":-45,"size":5}},"top_loader2":{"doubleside":true,"offset":{"x":4,"y":70,"z":15},"length":[0,6,12,0],"width":[0,50,50,30,20],"angle":[0,0,-10,-10],"position":[-20,-6,-13,-20,-20],"texture":[17],"bump":{"position":-45,"size":5}}},"typespec":{"name":"Pusat","level":2,"model":9,"code":209,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[240,240],"reload":[88,88]},"ship":{"mass":240,"speed":[130,130],"rotation":[75,75],"acceleration":[90,90]}},"shape":[3.432,3.133,2.734,2.754,2.173,1.715,1.474,1.348,1.261,1.212,1.183,1.181,1.207,1.251,1.326,1.438,1.569,1.706,1.894,2.168,2.568,3.014,3.358,3.911,3.187,2.605,3.187,3.911,3.358,3.014,2.568,2.168,1.894,1.706,1.569,1.438,1.326,1.251,1.207,1.181,1.183,1.212,1.261,1.348,1.474,1.715,2.173,2.754,2.734,3.133],"lasers":[{"x":0,"y":-3.276,"z":0,"angle":0,"damage":[20,20],"rate":3,"type":1,"speed":[240,240],"number":1,"spread":0,"error":0,"recoil":10},{"x":0.78,"y":-2.6,"z":0.208,"angle":0,"damage":[9,9],"rate":8,"type":2,"speed":[280,280],"number":1,"spread":0,"error":2,"recoil":4},{"x":-0.78,"y":-2.6,"z":0.208,"angle":0,"damage":[9,9],"rate":8,"type":2,"speed":[280,280],"number":1,"spread":0,"error":2,"recoil":4},{"x":0,"y":-1.976,"z":0.598,"angle":0,"damage":[80,80],"rate":1,"type":1,"speed":[240,260],"number":1,"spread":0,"error":0,"recoil":130}],"radius":3.911}}',
                    '{"name":"Trisbaena","level":2,"model":10,"size":0.7,"zoom":0.8,"specs":{"shield":{"capacity":[655,655],"reload":[9,9]},"generator":{"capacity":[250,250],"reload":[88,88]},"ship":{"mass":455,"speed":[80,80],"rotation":[50,50],"acceleration":[120,120]}},"bodies":{"main":{"section_segments":[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5,382.5],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-330,-330,-350,-350,-310,-310,-300,-300,-270,-266,-230,-230,-200,-200,-180,-180,-150,-150,-130,-130,-100,-100,-80,-80,-50,-50,-30,-30,0,0,40,44,230,230,270,270,370,370,350,350],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,50,50,60,60,58,58,61,61,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,80,80,70,70,50,50,45,45,0],"height":[0,50,50,60,60,58,58,61,61,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,55,55,65,65,80,80,70,70,50,50,45,45,0],"texture":[4,11,18.1,18.1,4,17,4,18.1,4,4,4,18,17,17,17,18,17,17,17,18,17,17,17,18,17,17,17,18,4,18.1,18.1,4,18.1,18.1,4,18.1,17,18,17],"propeller":true,"laser":{"damage":[50,50],"rate":1,"type":1,"speed":[280,280],"number":1,"angle":0,"error":0,"recoil":100}},"front_spike":{"section_segments":[35,55,125,145,215,235,305,325],"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-340,-340,-335,-330,-330,-340,-340,-345,-330],"z":[0,0,0,0,0,0,0,0,0]},"width":[20,40,45,45,20,20,0,0,10],"height":[20,40,45,45,20,20,0,0,10],"laser":{"damage":[250,250],"rate":1,"type":1,"speed":[240,240],"number":1,"angle":0,"error":0,"recoil":600},"texture":[17,3,1,2,4,81]},"cockpit":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":0,"y":0,"z":50},"position":{"x":[0,0,0,0,0],"y":[60,65,100,140,165],"z":[0,0,0,0,20]},"width":[0,35,35,35,0],"height":[0,30,60,64,0],"texture":[7,7,7,4]},"cockpit_detail1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":90,"z":98},"position":{"x":[0,0,0,0],"y":[-40,10,50,50],"z":[-35,-3,0,0]},"width":[3,3,3,0],"height":[3,3,3,0],"texture":[4]},"cockpit_detail2":{"section_segments":[90,180,270,360],"offset":{"x":23,"y":90,"z":97},"position":{"x":[0,0,0,0],"y":[-40,10,50,50],"z":[-35,-3,0,0]},"width":[3,3,3,0],"height":[3,3,3,0],"texture":[4]},"cockpit_detail3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":140,"z":98},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-27,-27,-23,-23,23,23,27,27],"z":[-11,-11,0,0,0,0,-11,-11]},"width":[0,3,3,3,3,3,3,0],"height":[0,13,3,3,3,3,13,0],"texture":[4],"angle":90},"cockpit_detail4":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":100,"z":95},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-27,-27,-23,-23,23,23,27,27],"z":[-12,-12,0,0,0,0,-12,-12]},"width":[0,3,3,3,3,3,3,0],"height":[0,15,3,3,3,3,15,0],"texture":[4],"angle":90},"cockpit_back1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-10,"z":60},"position":{"x":[0,0,0,0,0],"y":[120,120,180,190,190],"z":[0,0,0,0,0,0,0]},"width":[0,60,60,60,0],"height":[0,40,40,30,0],"texture":[3,[15],[15]]},"cockpit_back2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-10,"z":40},"position":{"x":[0,0,0,0],"y":[130,130,195,195],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,70,70,0],"height":[0,60,60,0],"texture":[3,17]},"cockpit_back3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-10,"z":35},"position":{"x":[0,0,0,0],"y":[140,140,205,205],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,80,80,0],"height":[0,60,60,0],"texture":[3,18]},"back_joint1":{"section_segments":[40,45,50,130,135,140,220,225,230,310,315,320],"offset":{"x":15,"y":195,"z":69},"position":{"x":[0,0,0,0,0],"y":[0,0,30,60,60],"z":[0,0,0,-10,-10]},"width":[0,10,10,10,0],"height":[0,10,10,10,0],"texture":[17,17.95,17,4]},"back_joint2":{"section_segments":[90,180,270,360],"offset":{"x":37,"y":195,"z":60},"position":{"x":[0,0,0,-5,-5],"y":[0,0,30,60,60],"z":[0,0,0,-5,-5]},"width":[0,10,10,10,0],"height":[0,10,10,10,0],"texture":[17,17.95,17,4]},"back_joint3":{"section_segments":[90,180,270,360],"offset":{"x":57,"y":195,"z":40},"position":{"x":[0,0,0,-5,-5],"y":[0,0,30,60,60],"z":[0,0,0,-5,-5]},"width":[0,10,10,10,0],"height":[0,10,10,10,0],"texture":[17,17.95,17,4]},"wing_shields1":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":0,"y":95,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,30,50,50,60,60,90,105,125,125],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,100,130,130,120,123,140,140,120,115,0],"height":[0,30,30,30,25,25,25,25,25,25,0],"texture":[18,3,4,4,4,4,18.1,4,3]},"wing_shields2":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":0.01,"y":95,"z":7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[1,0,30,50,50,59,59,90,105,125,126],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,100,130,130,120,123,140,140,120,115,0],"height":[0,6,6,6,5,5,5,5,5,5,0],"texture":[63]},"wing_shields3":{"section_segments":[35,45,55,125,135,145,215,225,235,305,315,325],"offset":{"x":0.01,"y":95,"z":-7},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[1,0,30,50,50,59,59,90,105,125,126],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,100,130,130,120,123,140,140,120,115,0],"height":[0,6,6,6,5,5,5,5,5,5,0],"texture":[63]},"joint1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":150,"z":0},"position":{"x":[0,0,0,0],"y":[-5,10,30,50],"z":[0,0,0,0]},"width":[0,210,210,0],"height":[0,15,15,0],"texture":[3]},"joint2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":150,"z":5},"position":{"x":[0,0,0,0],"y":[-5,10,30,50],"z":[0,0,0,0]},"width":[0,211,211,0],"height":[0,3,3,0],"texture":[63]},"joint3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":150,"z":-5},"position":{"x":[0,0,0,0],"y":[-5,10,30,50],"z":[0,0,0,0]},"width":[0,211,211,0],"height":[0,3,3,0],"texture":[63]},"disc1":{"section_segments":12,"offset":{"x":80,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"height":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"texture":[4,4,4,4,4,4,17,4],"angle":-90},"disc2":{"section_segments":12,"offset":{"x":90,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"height":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"texture":[4,4,4,4,4,4,17,4],"angle":-90},"disc3":{"section_segments":12,"offset":{"x":100,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"height":[24,24,24,28.8,28.8,28.8,28.8,28.8,24,24],"texture":[4,4,4,4,4,4,17,4],"angle":-90},"disc4":{"section_segments":12,"offset":{"x":115,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[16],"angle":90},"disc5":{"section_segments":12,"offset":{"x":125,"y":170,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[6.4,6.4,0,0,0,0,0,6.4,6.4,6.4],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[16],"angle":90},"disc6":{"section_segments":16,"offset":{"x":0,"y":200,"z":75},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[6,6,6,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,6,6],"texture":[4,4,4,4,4,17,4]},"disc7":{"section_segments":16,"offset":{"x":0,"y":210,"z":75},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[6,6,6,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,7.199999999999999,6,6],"texture":[4,4,4,4,4,17,4]},"disc8":{"section_segments":16,"offset":{"x":45,"y":200,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":[4,4,4,4,4,17,4]},"disc9":{"section_segments":16,"offset":{"x":45,"y":210,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[7,7,0,0,0,2,5,7,7,7],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[15,15,15,18,18,18,18,18,15,15],"height":[17,17,17,20.4,20.4,20.4,20.4,20.4,17,17],"texture":[4,4,4,4,4,17,4]},"disc10":{"section_segments":16,"offset":{"x":45,"y":90,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,24,24,24,24,24,20,20],"height":[20,20,20,24,24,24,24,24,20,20],"texture":[4,4,4,4,17,4,17,4]},"disc11":{"section_segments":16,"offset":{"x":45,"y":70,"z":47},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,24,24,24,24,24,20,20],"height":[20,20,20,24,24,24,24,24,20,20],"texture":[4,4,4,4,17,4,17,4]},"disc12":{"section_segments":16,"offset":{"x":50,"y":50,"z":-160},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[16,16,16,19.200000000000003,19.200000000000003,19.200000000000003,19.200000000000003,19.200000000000003,16,16],"height":[20,20,20,24,24,24,24,24,20,20],"texture":[4,4,4,4,17,4,17,18],"angle":45,"vertical":true},"disc13":{"section_segments":24,"offset":{"x":0,"y":160,"z":80},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[4,4,4,4,4,17,4,4],"angle":180},"disc14":{"section_segments":24,"offset":{"x":0,"y":160,"z":80},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,0,0,0,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[40,40,40,48,48,48,48,48,40,40],"height":[15,15,15,18,18,18,18,18,15,15],"texture":[4,4,4,4,4,17,4,4]},"disc15":{"section_segments":6,"offset":{"x":0,"y":-17.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc16":{"section_segments":6,"offset":{"x":0,"y":-12.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc17":{"section_segments":6,"offset":{"x":0,"y":-67.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc18":{"section_segments":6,"offset":{"x":0,"y":-62.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc19":{"section_segments":6,"offset":{"x":0,"y":-117.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc20":{"section_segments":6,"offset":{"x":0,"y":-112.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc21":{"section_segments":6,"offset":{"x":0,"y":-167.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc22":{"section_segments":6,"offset":{"x":0,"y":-162.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"disc23":{"section_segments":6,"offset":{"x":0,"y":-217.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4]},"disc24":{"section_segments":6,"offset":{"x":0,"y":-212.5,"z":57},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[10.5,10.5,1.5,1.5,1.5,3,7.5,10.5,10.5,10.5],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[18,18,18,21.6,21.6,21.6,21.6,21.6,18,18],"height":[5,5,5,6,6,6,6,6,5,5],"texture":[3,3,3,3,3,17,4,4],"angle":180},"box":{"section_segments":[45,135,225,315],"offset":{"x":50,"y":35,"z":-85},"position":{"x":[0,0,0,0,0],"y":[-10,15,15,19,19],"z":[0,0,0,0,0]},"width":[10,10,20,20,20],"height":[30,30,50,35,0],"texture":[4,4,18,17],"vertical":true,"angle":50},"hubs1":{"section_segments":20,"offset":{"x":80,"y":20,"z":-128},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[18,15,13,12,10,0],"height":[18,15,13,12,10,0],"texture":[18,17,17,18,18],"vertical":true},"hubs2":{"section_segments":20,"offset":{"x":80,"y":15,"z":-204},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[12.6,10.5,9.1,8.399999999999999,7,0],"height":[12.6,10.5,9.1,8.399999999999999,7,0],"texture":[18,17,17,18,18],"vertical":true},"hubs3":{"section_segments":20,"offset":{"x":0,"y":45,"z":-310},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[32.4,27,23.400000000000002,21.6,18,0],"height":[32.4,27,23.400000000000002,21.6,18,0],"texture":[18,17,17,18,18],"vertical":true},"hubs4":{"section_segments":20,"offset":{"x":50,"y":55,"z":-160},"position":{"x":[0,0,0,0,0,0,0],"y":[0,10,5,5,10,6],"z":[0,0,0,0,0,0,0]},"width":[18,15,13,12,10,0],"height":[18,15,13,12,10,0],"texture":[18,17,17,18,18],"vertical":true,"angle":70},"hubs5":{"section_segments":20,"offset":{"x":35,"y":-15,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs6":{"section_segments":20,"offset":{"x":35,"y":-65,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs7":{"section_segments":20,"offset":{"x":35,"y":-115,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs8":{"section_segments":20,"offset":{"x":35,"y":-165,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"hubs9":{"section_segments":20,"offset":{"x":35,"y":-215,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[23,29,28,28,29,28],"z":[0,0,0,0,0,0,0]},"width":[15.600000000000001,13,10.4,9.1,6.5,0],"height":[15.600000000000001,13,10.4,9.1,6.5,0],"texture":[18,18,17,17,18],"angle":90},"propeller1":{"section_segments":10,"offset":{"x":20,"y":350,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,30,30,30,20],"z":[0,0,0,0,0,0]},"width":[0,15,15,13,13,0],"height":[0,15,15,13,13,0],"propeller":true,"texture":[3,3,16.9]},"propeller2":{"section_segments":10,"offset":{"x":20,"y":350,"z":-15},"position":{"x":[0,0,0,0,0,0],"y":[-10,-10,30,30,30,20],"z":[0,0,0,0,0,0]},"width":[0,15,15,13,13,0],"height":[0,10,15,13,13,0],"propeller":true,"texture":[3,3,16.9]},"propeller_joint1":{"section_segments":4,"offset":{"x":10,"y":261,"z":-5},"position":{"x":[0,0,-30,-50,-50],"y":[0,0,60,70,70],"z":[0,0,0,-20,-20]},"width":[0,10,10,13,0],"height":[0,10,10,10,0],"angle":90,"texture":[17,18,17,17]},"propeller_joint2":{"section_segments":4,"offset":{"x":30,"y":305,"z":-5},"position":{"x":[0,0,-15,-30,-30],"y":[0,0,30,40,40],"z":[0,0,0,-20,-20]},"width":[0,10,10,13,0],"height":[0,10,10,10,0],"angle":90,"texture":[17,18,17,17]},"propeller_joint3":{"section_segments":4,"offset":{"x":10,"y":280,"z":-56},"position":{"x":[0,0,0,-30,-50,-50],"y":[0,0,20,60,70,70],"z":[15,15,0,0,20,20]},"width":[0,10,10,10,13,0],"height":[0,10,10,10,10,0],"angle":90,"texture":[4,4,18]},"propeller_joint4":{"section_segments":4,"offset":{"x":10,"y":310,"z":-56},"position":{"x":[0,0,0,-20,-40,-40],"y":[0,0,20,50,50,50],"z":[15,15,0,0,20,20]},"width":[0,10,10,10,13,0],"height":[0,10,10,10,10,0],"angle":90,"texture":[4,4,18]},"propeller_side":{"section_segments":16,"offset":{"x":80,"y":290,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,14,4,0,-6,0,60,66,48,48,48,78,78,72],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,20,20,22.5,25,25,20,20,19,14,10,9,0],"height":[0,5,20,20,22.5,25,25,20,20,19,14,10,9,0],"propeller":true,"texture":[3,12,4,3,4,18,4,18,17,17,3,17]},"propeller_side2":{"section_segments":16,"offset":{"x":80,"y":380,"z":-40},"position":{"x":[0],"y":[0],"z":[0]},"width":[25],"height":[25],"propeller":true},"top":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-220,"z":52.9},"position":{"x":[0,0,0,0],"y":[-20,-20,240,180],"z":[0,0,0,0]},"width":[0,35,35,0],"height":[0,10,10,0],"texture":[4]},"bottom":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":-235,"z":-52.9},"position":{"x":[0,0,0,0],"y":[0,0,240,180],"z":[0,0,0,0]},"width":[0,35,35,0],"height":[0,10,10,0],"texture":[4]},"side":{"section_segments":[45,135,225,315],"offset":{"x":52.9,"y":-235,"z":0},"position":{"x":[0,0,0,0],"y":[0,0,240,180],"z":[0,0,0,0]},"width":[0,10,10,0],"height":[0,35,35,0],"texture":[4]},"propeller_support1":{"section_segments":[45,135,225,315],"offset":{"x":15,"y":10,"z":-300},"position":{"x":[0,0,0,0],"y":[0,0,40,40],"z":[0,0,0,0]},"width":[0,25,10,0],"height":[0,100,80,0],"angle":45,"vertical":true,"texture":[17,4,17]},"propeller_support2":{"section_segments":[45,135,225,315],"offset":{"x":15,"y":-10,"z":-300},"position":{"x":[0,0,0,0],"y":[0,0,40,40],"z":[0,0,0,0]},"width":[0,25,10,0],"height":[0,100,80,0],"angle":135,"vertical":true,"texture":[17,4,17]},"gun_holder1":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":10},"position":{"x":[0,0,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,20,20,0],"height":[0,80,90,0],"texture":[1]},"gun_holder2":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":0},"position":{"x":[0,0,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,100,90,0],"height":[0,20,20,0],"angle":180,"texture":[1]},"gun_holder3":{"section_segments":[45,135,225,315],"offset":{"x":0,"y":40,"z":-10},"position":{"x":[0,0,0,0],"y":[-10,-10,10,10],"z":[0,0,0,0]},"width":[0,20,20,0],"height":[0,80,90,0],"texture":[1]},"bars_top1":{"section_segments":6,"offset":{"x":31,"y":-110,"z":41},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]},"bars_top2":{"section_segments":6,"offset":{"x":40,"y":-110,"z":32},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]},"bars_bottom1":{"section_segments":6,"offset":{"x":31,"y":-110,"z":-41},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]},"bars_bottom2":{"section_segments":6,"offset":{"x":40,"y":-110,"z":-32},"position":{"x":[0,0,0,0],"y":[-120,-120,120,120],"z":[0,0,0,0]},"width":[0,3,3,0],"height":[0,3,3,0],"texture":[13]}},"wings":{"main":{"length":[40,2,70,2,40],"width":[40,88,90,90,88,40],"angle":[50,90,90,130,130],"position":[0,0,0,0,0,0],"doubleside":true,"offset":{"x":120,"y":170,"z":-65},"bump":{"position":0,"size":15},"texture":[4,17,18,17,4]}},"typespec":{"name":"Trisbaena","level":2,"model":10,"code":210,"specs":{"shield":{"capacity":[655,655],"reload":[9,9]},"generator":{"capacity":[250,250],"reload":[88,88]},"ship":{"mass":455,"speed":[80,80],"rotation":[50,50],"acceleration":[120,120]}},"shape":[4.91,4.961,4.207,2.72,2.004,1.569,1.405,1.229,1.039,0.978,0.964,0.925,0.903,0.847,0.867,0.903,1.05,1.276,2.89,3.386,3.636,3.217,4.755,5.304,5.342,5.331,5.342,5.304,4.755,3.217,3.636,3.386,2.89,1.276,1.05,0.903,0.867,0.847,0.903,0.925,0.964,0.978,1.039,1.229,1.405,1.569,2.004,2.72,4.207,4.961],"lasers":[{"x":0,"y":-4.9,"z":0,"angle":0,"damage":[50,50],"rate":1,"type":1,"speed":[280,280],"number":1,"spread":0,"error":0,"recoil":100},{"x":0,"y":-4.83,"z":0,"angle":0,"damage":[250,250],"rate":1,"type":1,"speed":[240,240],"number":1,"spread":0,"error":0,"recoil":600}],"radius":5.342}}',
                ]
            }
            */
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
