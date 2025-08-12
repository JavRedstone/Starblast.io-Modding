/*
    Starblast Base Wars (SBW)

    @author JavRedstone
    @version 1.0.0

    Developed in 2025

    Special thanks to ÆTHER and Nerd69420 for some of the 3D objects used in this mod

    Ships from Vanilla Revamp (V3)
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
            MAP: " 36     6         1                                                              1         6     63 \n"+
                "3  9  3   8     1             99 99 99  2       3  3       2  99 99 99             1     8   3  9  3\n"+
                "6           99  7    999999   99 99 99    4    9 99 9    4    99 99 99   999999    7  99           6\n"+
                " 9    4    99             2 8 99 99 99    4              4    99 99 99 8 2             99    4    9 \n"+
                "        9 99      71 6                   4 6            6 4                   6 17      99 9        \n"+
                "          99              5   6    1                            1    6   5              99          \n"+
                " 3 4     4 99         1       21     7    3    9    9    3    7     12       1         99 4     4 3 \n"+
                "         6  99       9   4    1  9     9        9  9        9     9  1    4   9       99  6         \n"+
                "6   9        99      99       3            7     99     7            3       99      99        9   6\n"+
                "      46   7      3   99    1 9         9      36  63      9         9 1    99   3      7   64      \n"+
                " 8  99        3        99     5    8    6  9    3223    9  6    8    5     99        3        99  8 \n"+
                "   9999  7    82    6               8   3249   1 99 1   9423   8               6    28    7  9999   \n"+
                "  99  99         5  26      2 4        14 298  229922  892 41        4 2      62  5         99  99  \n"+
                "  9    99      221 3    6     52   6  64       8    8       46  6   25     6    3 122      99    9  \n"+
                "        9 38     8         99   99  9   5                  5   9  99   99         8     83 9        \n"+
                "           2 2          7 99   992                                299   99 7          2 2           \n"+
                " 17          2    8     359        3                            3        953     8    2          71 \n"+
                "            518        1   71  5 7                                7 5  17   1        815            \n"+
                "1   7    3      8    7   46 63                                        36 64   7    8      3    7   1\n"+
                "    1        3           6   1                                        1   6           3        1    \n"+
                "           62         6    2                                            2    6         26           \n"+
                "  9 6  99   6     7     27                                                72     7     6   99  6 9  \n"+
                "  9   1 99          6    7                                                7    6          99 1   9  \n"+
                "  9      99      1                                                                1      99      9  \n"+
                "  9       9  6 73    2                                                        2    37 6  9       9  \n"+
                "  9    4        5 46 77                                                      77 64 5        4    9  \n"+
                "  92 5         99 6                                                              6 99         5 29  \n"+
                "              99 7  2                                                          2  7 99              \n"+
                "   8     1  2 9  16                                                              61  9 2  1     8   \n"+
                "                  31                                                            13                  \n"+
                " 999 621395 45                                                                        54 593126 999 \n"+
                " 999  1      2 9 5                            99999999                            5 9 2      1  999 \n"+
                "              99                           8    9999    8                           99              \n"+
                " 999   9      92 7                                                                7 29      9   999 \n"+
                " 999                                         9        9                                         999 \n"+
                "     1    8  6  3                     9  8       77       8  9                     3  6  8    1     \n"+
                " 999       8  9                       99    9          9    99                       9  8       999 \n"+
                " 999  7                                99  9    4  4    9  99                                7  999 \n"+
                "             6                     99   9999            9999   99                     6             \n"+
                "       9    14                      99   9       99       9   99                      41    9       \n"+
                " 2       9634 5                      99       3  99  3       99                      5 4369       2 \n"+
                "    4      2                       8  99   9 7   99   7 9   99  8                       2      4    \n"+
                "  44  3    42                         9   99    9999    99   9                         24    3  44  \n"+
                "    6   7 999                   8    99  99  7 99  99 7  99  99    8                   999 7   6    \n"+
                "            8                       9         99911999         9                       8            \n"+
                "                                  9      7 7 99 9  9 99 7 7      9                                  \n"+
                "                               9        3   99  9  9  99   3        9                               \n"+
                "  9   9  3 128                 9           99   4994   99           9                 821 3  9   9  \n"+
                " 3     9 63 2                  99    4    999994 99 499999    4    99                  2 36 9     3 \n"+
                "  9     9 299                  99  7   9999 1  999999  1 9999   7  99                  992 9     9  \n"+
                "  9     9 299                  99  7   9999 1  999999  1 9999   7  99                  992 9     9  \n"+
                " 3     9 63 2                  99    4    999994 99 499999    4    99                  2 36 9     3 \n"+
                "  9   9  3 128                 9           99   4994   99           9                 821 3  9   9  \n"+
                "                               9        3   99  9  9  99   3        9                               \n"+
                "                                  9      7 7 99 9  9 99 7 7      9                                  \n"+
                "            8                       9         99911999         9                       8            \n"+
                "    6   7 999                   8    99  99  7 99  99 7  99  99    8                   999 7   6    \n"+
                "  44  3    42                         9   99    9999    99   9                         24    3  44  \n"+
                "    4      2                       8  99   9 7   99   7 9   99  8                       2      4    \n"+
                " 2       9634 5                      99       3  99  3       99                      5 4369       2 \n"+
                "       9    14                      99   9       99       9   99                      41    9       \n"+
                "             6                     99   9999            9999   99                     6             \n"+
                " 999  7                                99  9    4  4    9  99                                7  999 \n"+
                " 999       8  9                       99    9          9    99                       9  8       999 \n"+
                "     1    8  6  3                     9  8       77       8  9                     3  6  8    1     \n"+
                " 999                                         9        9                                         999 \n"+
                " 999   9      92 7                                                                7 29      9   999 \n"+
                "              99                           8    9999    8                           99              \n"+
                " 999  1      2 9 5                            99999999                            5 9 2      1  999 \n"+
                " 999 621395 45                                                                        54 593126 999 \n"+
                "                  31                                                            13                  \n"+
                "   8     1  2 9  16                                                              61  9 2  1     8   \n"+
                "              99 7  2                                                          2  7 99              \n"+
                "  92 5         99 6                                                              6 99         5 29  \n"+
                "  9    4        5 46 77                                                      77 64 5        4    9  \n"+
                "  9       9  6 73    2                                                        2    37 6  9       9  \n"+
                "  9      99      1                                                                1      99      9  \n"+
                "  9   1 99          6    7                                                7    6          99 1   9  \n"+
                "  9 6  99   6     7     27                                                72     7     6   99  6 9  \n"+
                "           62         6    2                                            2    6         26           \n"+
                "    1        3           6   1                                        1   6           3        1    \n"+
                "1   7    3      8    7   46 63                                        36 64   7    8      3    7   1\n"+
                "            518        1   71  5 7                                7 5  17   1        815            \n"+
                " 17          2    8     359        3                            3        953     8    2          71 \n"+
                "           2 2          7 99   992                                299   99 7          2 2           \n"+
                "        9 38     8         99   99  9   5                  5   9  99   99         8     83 9        \n"+
                "  9    99      221 3    6     52   6  64       8    8       46  6   25     6    3 122      99    9  \n"+
                "  99  99         5  26      2 4        14 298  229922  892 41        4 2      62  5         99  99  \n"+
                "   9999  7    82    6               8   3249   1 99 1   9423   8               6    28    7  9999   \n"+
                " 8  99        3        99     5    8    6  9    3223    9  6    8    5     99        3        99  8 \n"+
                "      46   7      3   99    1 9         9      36  63      9         9 1    99   3      7   64      \n"+
                "6   9        99      99       3            7     99     7            3       99      99        9   6\n"+
                "         6  99       9   4    1  9     9        9  9        9     9  1    4   9       99  6         \n"+
                " 3 4     4 99         1       21     7    3    9    9    3    7     12       1         99 4     4 3 \n"+
                "          99              5   6    1                            1    6   5              99          \n"+
                "        9 99      71 6                   4 6            6 4                   6 17      99 9        \n"+
                " 9    4    99             2 8 99 99 99    4              4    99 99 99 8 2             99    4    9 \n"+
                "6           99  7    999999   99 99 99    4    9 99 9    4    99 99 99   999999    7  99           6\n"+
                "3  9  3   8     1             99 99 99  2       3  3       2  99 99 99             1     8   3  9  3\n"+
                " 36     6         1                                                              1         6     63 ",

            ASTEROIDS_STRENGTH: 1,
            RELEASE_CRYSTAL: true,
            CRYSTAL_DROP: 1,
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
                { text: "You", icon:"\u004e", key:"O" },
                { text: "Me", icon:"\u004f", key:"E" },
                { text: "Yes", icon:"\u004c", key:"Y" },
                { text: "No", icon:"\u004d", key:"N" },

                { text: "Attack", icon: "\u0049", key: "A" },
                { text: "Alien", icon:"\u0030", key:"L" },
                { text: "Follow", icon:"\u0050", key:"F" },
                { text: "Mine", icon:"\u0044", key:"M" },
                { text: "Defend", icon:"\u0025", key:"D" },

                { text: "Wait", icon:"\u0048", key:"T" },
                { text: "Kill", icon:"\u005b", key:"K" },
                { text: "Base", icon:"\u0034", key:"B" },
                { text: "Hmm", icon:"\u004b", key:"Q" },

                { text: "Good Game", icon:"GG", key:"G" },
                { text: "No Problem", icon:"\u0047", key:"P" },
                { text: "Thanks", icon:"\u0041", key:"X" },
                { text: "Sorry", icon:"\u00a1", key:"S" }
            ]
        },
        TICKS: {
            TICKS_PER_SECOND: 60,
            MILLISECONDS_PER_TICK: 1000 / 60,

            ENTITY_MANAGER: 60,
            SHIP_MANAGER: 30,
            SHIP_MANAGER_FAST: 15,

            BASE_MANAGER_SLOW: 600,
            BASE_MANAGER_MEDIUM: 30,
            BASE_MANAGER_FAST: 10,

            RESET_STAGGER: 5,
            BASE_STAGGER: 15,
            BASE_STAGGER_FAST: 3,

            GAME_MANAGER: 30
        },
        IS_DEBUGGING: false,
    }

    static setShipGroups(shipGroups) {
        Game.C.OPTIONS.SHIPS = ['{"name":"Invisible","level":1,"model":2,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Invisible","level":1,"model":2,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'];
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

        this.manageBases();

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
            this.spawnBases();
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

    spawnBases() {
        for (let team of this.teams) {
            team.spawnBase();
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        let bothBasesSpawning = true;
        for (let team of this.teams) {
            if (team.base && !team.base.spawning) {
                bothBasesSpawning = false;
                break;
            }
        }
        if (!bothBasesSpawning) {
            for (let i = 0; i < this.ships.length; i++) {
                let ship = this.ships[i];
                this.shipResetQueue.add(() => {
                    this.resetShip(ship);
                });
            }
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
                        let bothBasesSpawning = true;
                        for (let team of this.teams) {
                            if (team.base && !team.base.spawning) {
                                bothBasesSpawning = false;
                                break;
                            }
                        }
                        if (!bothBasesSpawning) {
                            this.shipResetQueue.add(() => {
                                ship.isResetting = true;
                                this.resetShip(ship);
                            });
                        }
                    }

                    if (!ship.isResetting) {
                        if (ship.selectingTeam) {
                            ship.setType(102);
                            ship.setCrystals(0);
                            ship.setPosition(new Vector2());
                            ship.setIdle(true);
                            ship.setCollider(false);
                        }

                        this.handleShipDepotEnterLerp(ship);

                        this.handleWeaponsStore(ship);

                        if (ship.team && ship.inDepot) {
                            if (ship.team.base.spawning) {
                                let nearestDepot = null;
                                let nearestDistance = Infinity;
                                for (let depot of ship.team.base.depotBaseModules) {
                                    if (depot.ready) {
                                        let distance = depot.pose.position.getDistanceTo(ship.getPose().position);
                                        if (distance < nearestDistance) {
                                            nearestDistance = distance;
                                            nearestDepot = depot;
                                        }
                                    }
                                }
                                if (nearestDepot) {
                                    ship.inDepot = nearestDepot;
                                    ship.lerp = null;
                                    ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.ENTER_DEPOT.NAME, nearestDepot.pose, ShipLerp.C.TYPES.ENTER_DEPOT.BLEND_FACTOR, nearestDepot, false);
                                }
                            } else if (ship.inDepot.dead) {
                                this.handleShipDepotExitLerp(ship);
                            }
                        }

                        if (ship.upgradeHistory.length == 0 || ship.upgradeHistory[ship.upgradeHistory.length - 1].code != ship.ship.type) {
                            ship.upgradeHistory.push({code: ship.ship.type, stats: 0, tick: game.step});
                        }
                        if (ship.upgradeHistory.length > 0) {
                            ship.upgradeHistory[ship.upgradeHistory.length - 1].stats = ship.ship.stats;
                        }
                        
                        this.handleShipScoreboardTeamSelection(ship);
                        this.handleShipRadar(ship);
                    }
                }
            }
        }
        if (game.step % Game.C.TICKS.SHIP_MANAGER_FAST === 0) {
            for (let ship of this.ships) {
                if (!ship.resetting) {
                    this.handleShipUpgradeBlockers(ship);
                    this.handleShipTurretUse(ship);
                    this.handleShipDoorUse(ship);
                }

                ship.tick();
            }
        }
    }

    manageBases() {
        if (game.step % Game.C.TICKS.BASE_MANAGER_SLOW == 0) {
            for (let team of this.teams) {
                if (team.base) {
                    team.base.tick();

                    if (!team.base.spawning && !team.base.dead) {
                        let baseAlive = false;
                        for (let subBase of team.base.subBaseModules) {
                            if (!subBase.dead) {
                                baseAlive = true;
                                break;
                            }
                        }
                        if (!baseAlive) {
                            team.base.dead = true;
                            for (let ship of team.ships) {
                                ship.gameOver();
                            }
                            this.sendNotifications('Base Destroyed', `${team.name}'s base has been destroyed!`, this.getOppTeam(team));

                            this.timeouts.push(new TimeoutCreator(() => {
                                this.gameOver();
                            }, Game.C.TICKS.BASE_MANAGER_SLOW).start());
                        }
                    }
                }
            }
        }
        if (game.step % Game.C.TICKS.BASE_MANAGER_SLOW == Game.C.TICKS.BASE_MANAGER_SLOW - 1) {
            for (let team of this.teams) {
                if (team.base) {
                    team.base.refreshSelf();
                }
            }
            game.removeObject();
        }
        if (game.step % Game.C.TICKS.BASE_MANAGER_MEDIUM == 0) {
            let prevResettingAliens = this.resettingAliens;
            for (let team of this.teams) {
                if (team.base) {
                    for (let safeAlien of team.base.safeAliens) {
                        safeAlien.tick();
                    }
                    for (let gameAlien of game.aliens) {
                        let safeAlien = this.findSafeAlien(gameAlien);
                        if (safeAlien) {
                            safeAlien.tick();
                        } else {
                            this.resettingAliens = true;
                        }
                    }

                    if (this.resettingAliens && !team.base.spawning) {
                        for (let gameAlien of game.aliens) {
                            gameAlien.set({ kill: true });
                        }
                    }
                }
            }

            if (!prevResettingAliens && this.resettingAliens) {
                for (let team of this.teams) {
                    if (team.base) {
                        g.timeouts.push(new TimeoutCreator(() => {
                            for (let safeAlien of team.base.safeAliens) {
                                safeAlien.reset();
                            }
                            this.resettingAliens = false;
                        }, Game.C.TICKS.BASE_MANAGER_SLOW).start());
                    }
                }
            }
        }
        if (game.step % Game.C.TICKS.BASE_MANAGER_FAST == 0) {
            for (let team of this.teams) {
                if (team.base) {
                    for (let turretBaseModule of team.base.turretBaseModules) {
                        turretBaseModule.tick();
                    }
                    for (let doorModule of team.base.doorBaseModules) {
                        doorModule.tick();
                    }
                }
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

    handleShipUpgradeBlockers(ship) {
        if (ship && ship.team && ship.team.base) {
            if (ship.getLevel() >= 7) {
                if (ship.inDepot) {
                    this.handleShipDepotExitLerp(ship);
                }
            }
            let allowedTiers = Base.C.ALLOWED_TIERS[ship.team.base.baseLevel - 1];
            let maxAllowed = allowedTiers[allowedTiers.length - 1];
            let lastUpgradeShip = ship.upgradeHistory[ship.upgradeHistory.length - 1];
            if (ship.team.base.baseLevel == 4 && ship.team.base.reachedMaxLevel && ship.team.base.maxRecords.length > 0) {
                let lastMaxRecord = ship.team.base.maxRecords[ship.team.base.maxRecords.length - 1];
                if (lastMaxRecord.type == 'lost') {
                    if (lastMaxRecord.tick <= lastUpgradeShip.tick) {
                        maxAllowed = 6;
                    } else {
                        maxAllowed = 7;
                    }
                } else {
                    maxAllowed = 7;
                }
            }
            if (ship.getLevel() > maxAllowed) {
                let successfullySet = false;
                for (let i = ship.upgradeHistory.length - 1; i >= 0; i--) {
                    let upgradeCode = ship.upgradeHistory[i];
                    if (Math.floor(upgradeCode.code / 100) <= maxAllowed) {
                        ship.setType(upgradeCode.code);
                        ship.setStats(upgradeCode.stats)
                        successfullySet = true;
                        break;
                    }
                }
                if (!successfullySet) {
                    ship.setType(101);
                }
                ship.setCrystals(ship.getMaxCrystals() / 2);
            }
        }
    }

    handleShipScoreboardTeamSelection(ship) {
        let scoreboards = [];

        for (let t = 0; t < this.teams.length; t++) {
            let team = this.teams[t];
            let scoreboard = Helper.deepCopy(UIComponent.C.UIS.SCOREBOARD);

            scoreboard.components[0].fill = team.hex + '20';
            let orbitCenter = new Vector2(scoreboard.components[1].position[0] + scoreboard.components[1].position[2] / 2, scoreboard.components[1].position[1] + scoreboard.components[1].position[3] / 2);
            let orbitRadius = scoreboard.components[1].position[2] / 2 - scoreboard.components[1].width / 2;
            scoreboard.components[2].value = 'L' + team.base.baseLevel;
            scoreboard.components[2].color += team.base.doorsOpened ? '' : '80';
            scoreboard.components[3].value = team.base.doorsOpened ? '' : '🔒';
            scoreboard.components[4].value = team.name;
            scoreboard.components[5].value = (ship.team ? ((team.team == ship.team.team ? 'ALLIES' : 'ENEMIES') + ' | ') : '') + team.ships.length + '♟';
            scoreboard.components[6].value = team.base.crystals + '/' + Base.C.MAX_CRYSTALS[team.base.baseLevel - 1] + '💎';
            scoreboard.components[8].fill = ship.team ? (team.team == ship.team.team ? '#00ff00BF' : '#ff0000BF') : '#ffffffBF';
            scoreboard.components[8].position[2] = team.base.crystals / Base.C.MAX_CRYSTALS[team.base.baseLevel - 1] * scoreboard.components[7].position[2];
            for (let subBaseModule of team.base.subBaseModules) {
                let angleToBase = subBaseModule.pose.position.getAngleTo(team.base.pose.position);
                let baseW = 5;
                let baseH = 5;
                let basePosition = [
                    orbitCenter.x - Math.cos(angleToBase) * orbitRadius - baseW / 2,
                    orbitCenter.y + Math.sin(angleToBase) * orbitRadius - baseH / 2,
                    baseW,
                    baseH
                ];
                scoreboard.components.push(
                    {
                        type: 'round',
                        position: basePosition,
                        fill: subBaseModule.dead ? '#ff000040' : Helper.interpolateColor('#ff0000', '#ffffff', subBaseModule.health / subBaseModule.maxHealth)
                    },
                    {
                        type: 'text',
                        position: [basePosition[0] + 0.5, basePosition[1] + 0.5, basePosition[2] - 1, basePosition[3] - 1],
                        value: subBaseModule.dead ? '⨯' : Math.round(subBaseModule.health / subBaseModule.maxHealth * 100),
                        color: subBaseModule.dead ? '#ff000080' : '#000000'
                    }
                );
            }

            let teamShips = [...team.ships];
            teamShips.sort((a, b) => b.ship.score - a.ship.score);

            for (let i = 0; i < teamShips.length; i++) {
                let player = teamShips[i];
                let height = 6.5;
                let pos = [0, 30 + height * i, 100, height];
                if (player.ship.id == ship.ship.id) {
                    scoreboard.components.push({
                        type: 'box',
                        position: pos,
                        fill: '#ffffff20'
                    });
                }
                let shipInfo = player.getShipInfo();
                scoreboard.components.push(
                    {
                        type: 'text',
                        position: [pos[0] + 20,  pos[1] + 0.5, pos[2] - 55, pos[3] - 1],
                        value: '',
                        color: '#ffffff',
                        align: 'left'
                    },
                    {
                        type: 'player',
                        position: [pos[0] + 22.5, pos[1] + 0.5, pos[2] - 22.5 * 2, pos[3] - 1],
                        id: player.ship.id,
                        color: Helper.interpolateColor('#ff3636', '#ffffff', (player.ship.shield + player.ship.crystals) / (player.getMaxShield() + player.getMaxCrystals())),
                        align: 'left'
                    },
                    {
                        type: 'text',
                        position: [pos[0] + 2.5, pos[1] + 0.5, pos[2] - 82.5, pos[3] - 1],
                        value: 'T' + player.getLevel() + ' ' + (shipInfo ? shipInfo.ABBREVIATION : ''),
                        color: Helper.interpolateColor('#ffffff', '#ffff00', player.getLevel() / 7),
                        align: 'left'
                    },
                    {
                        type: 'text',
                        position: [pos[0] + 85, pos[1] + 0.5, pos[2] - 85 - 2.5, pos[3] - 1],
                        value: Helper.getCounterValue(player.ship.score),
                        color: Helper.interpolateColor('#ffffff', '#ffff00', (player.ship.score / (team.getMaxScore()) || 1)),
                        align: 'right'
                    },
                );
            }

            scoreboards.push(scoreboard);
        }

        let selectedScoreboard = null;
        if (ship.scoreboardTeam) {
            selectedScoreboard = scoreboards[ship.scoreboardTeam.team];
        } else if (ship.team) {
            selectedScoreboard = Helper.deepCopy(UIComponent.C.UIS.SCOREBOARD);
            selectedScoreboard.components = [
                {
                    type: 'box',
                    position: [0, 0, 100, 100],
                    fill: ship.team.hex + '20'
                },
                {
                    type: 'text',
                    position: [5, 2.5, 15, 5],
                    value: 'TIER',
                    color: '#ffffff',
                },
                {
                    type: 'box',
                    position: [5, 9, 15, 15],
                    fill: ship.team.hex + '40',
                    stroke: ship.team.hex + '80',
                    width: 1,
                },
                {
                    type: 'text',
                    position: [7.5, 11.5, 10, 10],
                    value: ship.getLevel(),
                    color: Helper.interpolateColor('#ffffff', '#ffff00', ship.getLevel() / 7),
                },
                {
                    type: 'text',
                    position: [25, 2.5, 60, 6.5],
                    value: '',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'player',
                    position: [25, 2.5, 60, 6.5],
                    id: ship.ship.id,
                    color: Helper.interpolateColor('#ff3636', '#ffffff', (ship.ship.shield + ship.ship.crystals) / (ship.getMaxShield() + ship.getMaxCrystals())),
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [25, 10, 60, 9],
                    value: ship.getShipName().toUpperCase(),
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [25, 20, 60, 5],
                    value: ship.highScore ? 'HIGH SCORE: ' + Helper.getCounterValue(ship.highScore) : 'HIGH SCORE: 0',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'box',
                    position: [5, 27.5, 90, 0],
                    stroke: '#ffffff80',
                    width: 1
                },
                {
                    type: 'text',
                    position: [5, 30, 90, 5],
                    value: ship.kills + ' KILLS',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 35, 90, 5],
                    value: ship.deaths + ' DEATHS',
                    color: '#ffffff',
                    align: 'left'
                },
                ...UIComponent.transformUIComponents(Helper.deepCopy(UIComponent.C.UIS.TWO_TO_ONE).components, new Vector2(30, 32.5), new Vector2(1, 0.75)),
                {
                    type: 'text',
                    position: [55, 32.5, 52.5, 5],
                    value: Math.floor(ship.kills / (ship.deaths || 1) * 100) / 100 + ' K/D',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'box',
                    position: [5, 42.5, 90, 0],
                    stroke: '#ffffff80',
                    width: 1
                },
                {
                    type: 'text',
                    position: [5, 45, 90, 5],
                    value: Helper.getCounterValue(ship.credits) + ' CREDITS',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 50, 90, 5],
                    value: Helper.getCounterValue(ship.totalContributed) + ' TOTAL CONTRIBUTED',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'box',
                    position: [5, 57.5, 90, 0],
                    stroke: '#ffffff80',
                    width: 1
                }
            ];
            
            let shipInfo = ship.getShipInfo();
            if (shipInfo) {
                let shipTierComponents = [
                    {
                        type: 'text',
                        position: [0, 0, 20, 5],
                        color: '#ffffff',
                    }
                ];
                let shipNameComponents = [
                    {
                        type: 'box',
                        position: [0, 0, 20, 5],
                        fill: ship.team.hex + '40',
                        stroke: ship.team.hex + '80',
                        width: 1,
                    },
                    {
                        type: 'text',
                        position: [2.5, 0.5, 15, 4],
                        color: '#ffffff',
                        align: 'center'
                    }
                ];
                let upgradeCodes = ShipGroup.getUpgrades(ship.ship.type);
                shipTierComponents[0].value = 'TIER ' + ship.getLevel();
                shipNameComponents[1].value = shipInfo.ABBREVIATION;
                shipTierComponents[0].color = Helper.interpolateColor('#ffffff', '#ffff00', ship.getLevel() / 7);
                selectedScoreboard.components.push(
                    ...UIComponent.transformUIComponents(Helper.deepCopy(shipTierComponents), new Vector2(5, 60)),
                    ...UIComponent.transformUIComponents(Helper.deepCopy(shipNameComponents), new Vector2(5, 78.75))
                );
                if (upgradeCodes && upgradeCodes.length > 0) {
                    let tier = Math.floor(upgradeCodes[0] / 100);
                    shipTierComponents[0].value = 'TIER ' + tier;
                    shipTierComponents[0].color = Helper.interpolateColor('#ffffff', '#ffff00', tier / 7);
                    selectedScoreboard.components.push(
                        ...UIComponent.transformUIComponents(Helper.deepCopy(shipTierComponents), new Vector2(40, 60))
                    );
                    selectedScoreboard.components.push(
                        ...UIComponent.transformUIComponents(Helper.deepCopy(UIComponent.C.UIS.ONE_TO_TWO).components, new Vector2(27.5, 73.75), new Vector2(0.5, 2))
                    );
                    let shownThirdTier = false;
                    for (let i = 0; i < upgradeCodes.length; i++) {
                        let upgradeCode = upgradeCodes[i];
                        let upgradeShipInfo = ShipGroup.getShipInfo(upgradeCode);
                        shipNameComponents[1].value = upgradeShipInfo ? upgradeShipInfo.ABBREVIATION : '';
                        selectedScoreboard.components.push(
                            ...UIComponent.transformUIComponents(Helper.deepCopy(shipNameComponents), new Vector2(40, 71.25 + i * 15)),
                        );
                        let nextUpgradeCodes = ShipGroup.getUpgrades(upgradeCode);
                        if (nextUpgradeCodes && nextUpgradeCodes.length > 0) {
                            if (!shownThirdTier) {
                                shownThirdTier = true;
                                let tier = Math.floor(nextUpgradeCodes[0] / 100);
                                shipTierComponents[0].value = 'TIER ' + tier;
                                shipTierComponents[0].color = Helper.interpolateColor('#ffffff', '#ffff00', tier / 7);
                                selectedScoreboard.components.push(
                                    ...UIComponent.transformUIComponents(Helper.deepCopy(shipTierComponents), new Vector2(75, 60))
                                );
                            }
                            selectedScoreboard.components.push(
                                ...UIComponent.transformUIComponents(Helper.deepCopy(UIComponent.C.UIS.ONE_TO_TWO).components, new Vector2(62.5, 70 + i * 15), new Vector2(0.5, 1)),
                            );
                            for (let j = 0; j < nextUpgradeCodes.length; j++) {
                                let nextUpgradeCode = nextUpgradeCodes[j];
                                let nextUpgradeShipInfo = ShipGroup.getShipInfo(nextUpgradeCode);
                                shipNameComponents[1].value = nextUpgradeShipInfo ? nextUpgradeShipInfo.ABBREVIATION : '';
                                selectedScoreboard.components.push(
                                    ...UIComponent.transformUIComponents(Helper.deepCopy(shipNameComponents), new Vector2(75, 67.5 + (i * 2 + j) * 7.5)),
                                );
                            }
                        }
                    }
                }
            }
        }

        
        if (ship && ship.team) {
            ship.sendUI(selectedScoreboard);
        }

        if (ship.selectingTeam) {
            for (let i = 0; i < this.teams.length; i++) {
                let team = this.teams[i];
                let teamSelection = Helper.deepCopy(UIComponent.C.UIS.TEAM_SELECTION);
                teamSelection.id += '-' + i;
                teamSelection.shortcut = String.fromCharCode(i == 0 ? 188 : 190);
                teamSelection.position = Helper.getGridUIPosition(21, 25, 2.5, 0, i, 0, this.teams.length, 1);
                teamSelection.components = Helper.deepCopy(scoreboards[i]).components;
                teamSelection.components[0].fill = this.teams[i].hex + '40';
                teamSelection.components[0].stroke = this.teams[i].hex + '80';
                teamSelection.components[0].width = 4;
                
                teamSelection.components.push(
                    {
                        type: 'box',
                        position: [i == 0 ? 0 : 90, 90, 10, 10],
                        fill: '#00000040'
                    },
                    {
                        type: 'text',
                        position: [i == 0 ? 1 : 91, 91, 8, 8],
                        value: i == 0 ? ',' : '.',
                        color: '#ffffff',
                    }
                );

                if (team.getBalancerMetric() > this.getOppTeam(team).getBalancerMetric()) {
                    teamSelection.clickable = false;
                    teamSelection.components.push(
                        {
                            type: 'box',
                            position: [0, 0, 100, 100],
                            fill: '#00000080'
                        },
                        {
                            type: 'text',
                            position: [10, 70, 80, 20],
                            value: '🔒',
                            color: '#ffffff',
                        }
                    );
                }

                ship.sendUI(teamSelection);
            }
        }
    }

    handleShipRadar(ship) {
        if (ship) {
            let radarBackground = Helper.deepCopy(UIComponent.C.UIS.RADAR_BACKGROUND);
            for (let team of this.teams) {
                if (team.base && !team.base.dead && team.base.pose) {
                    radarBackground.components.push(
                        {
                            type: 'round',
                            position: Helper.getRadarSpotPosition(team.base.pose.position, new Vector2(1, 1).multiply(2 * Base.C.RADII[team.base.baseLevel - 1])),
                            fill: team.hex + '20',
                            stroke: team.hex + '80',
                            width: 1
                        },
                        {
                            type: 'text',
                            position: Helper.getRadarSpotPosition(team.base.pose.position, new Vector2(1, 1).multiply(Base.C.RADII[team.base.baseLevel - 1])),
                            value: 'L' + team.base.baseLevel,
                            color: team.hex + (team.base.doorsOpened ? '' : '80'),
                        },
                        {
                            type: 'text',
                            position: Helper.getRadarSpotPosition(team.base.pose.position, new Vector2(1, 1).multiply(Base.C.RADII[team.base.baseLevel - 1])),
                            value: team.base.doorsOpened ? '' : '🔒',
                            color: team.hex + '80',
                        }
                    );

                    let shipPose = ship.getPose();
                    if (shipPose) {
                        let offEdge = (Game.C.OPTIONS.MAP_SIZE + 40) * Game.C.OPTIONS.RADAR_ZOOM;
                        let offEdgeScaled = (Game.C.OPTIONS.MAP_SIZE + 40 * Base.C.SCALES[team.base.baseLevel - 1]) * Game.C.OPTIONS.RADAR_ZOOM;
                        let flipX = false;
                        let xDiff = Math.abs(shipPose.position.x - team.base.pose.position.x);
                        let xDiffFlipped = Math.abs(xDiff - Game.C.OPTIONS.MAP_SIZE * 10);
                        if (xDiffFlipped < xDiff) {
                            flipX = true;
                        }
                        let flipY = false;
                        let yDiff = Math.abs(shipPose.position.y - team.base.pose.position.y);
                        let yDiffFlipped = Math.abs(yDiff - Game.C.OPTIONS.MAP_SIZE * 10);
                        if (yDiffFlipped < yDiff) {
                            flipY = true;
                        }
                        if ((xDiff >= offEdgeScaled && xDiffFlipped >= offEdgeScaled) || (yDiff >= offEdgeScaled && yDiffFlipped >= offEdgeScaled)) {
                            let radarRectangle = new Rectangle(shipPose.position, new Vector2(1, 1).multiply(offEdge * 2 * 0.7));
                            let edgePoint = radarRectangle.mapPointToEdge(team.base.pose.position);
                            if (flipX) {
                                edgePoint.x = shipPose.position.x - (edgePoint.x - shipPose.position.x);
                            }
                            if (edgePoint.x >= Game.C.OPTIONS.MAP_SIZE * 5) {
                                edgePoint.x -= Game.C.OPTIONS.MAP_SIZE * 5;
                            } else if (edgePoint.x <= Game.C.OPTIONS.MAP_SIZE * -5) {
                                edgePoint.x -= Game.C.OPTIONS.MAP_SIZE * -5;
                            }
                            if (flipY) {
                                edgePoint.y = shipPose.position.y - (edgePoint.y - shipPose.position.y);
                            }
                            if (edgePoint.y >= Game.C.OPTIONS.MAP_SIZE * 5) {
                                edgePoint.y -= Game.C.OPTIONS.MAP_SIZE * 5;
                            } else if (edgePoint.y <= Game.C.OPTIONS.MAP_SIZE * -5) {
                                edgePoint.y -= Game.C.OPTIONS.MAP_SIZE * -5;
                            }
                            radarBackground.components.push(
                                {
                                    type: 'text',
                                    position: Helper.getRadarSpotPosition(edgePoint, new Vector2(1, 1).multiply(30)),
                                    value: '▲',
                                    color: team.hex,
                                    align: 'center'
                                },
                            );
                        }
                    }

                    for (let subBaseModule of team.base.subBaseModules) {
                        if (subBaseModule && subBaseModule.pose && subBaseModule.ready) {
                            radarBackground.components.push({
                                type: 'round',
                                position: Helper.getRadarSpotPosition(subBaseModule.pose.position, new Vector2(1, 1).multiply(15 * Base.C.SCALES[team.base.baseLevel - 1])),
                                fill: subBaseModule.dead ? '#ff000040' : Helper.interpolateColor('#ff0000', '#ffffff', subBaseModule.health / subBaseModule.maxHealth)
                            });
                        }
                    }
                }
            }
            ship.sendUI(radarBackground);
        }
    }

    handleShipSpawnLerp(ship) {
        if (ship && ship.team && ship.team.base) {
            let spawnModule = Helper.getRandomArrayElement(ship.team.base.spawnBaseModules.filter(module => module && module.ready && !module.dead));
            if (spawnModule && spawnModule.ready) {
                let spawnInitialPose = spawnModule.pose.clone();
                spawnInitialPose.position = spawnInitialPose.position.add(new Vector2(SpawnBaseModule.C.SPAWN_INITIAL_OFFSET.x, SpawnBaseModule.C.SPAWN_INITIAL_OFFSET.y).multiplyComponents(new Vector2(spawnModule.pose.scale.x, spawnModule.pose.scale.y)).rotateBy(spawnModule.pose.rotation));
                ship.setPosition(spawnInitialPose.position);
                ship.setVelocity(new Vector2(0, 0));

                let spawnFinalPose = spawnModule.pose.clone();
                spawnFinalPose.position = spawnFinalPose.position.add(new Vector2(SpawnBaseModule.C.SPAWN_FINAL_OFFSET.x, SpawnBaseModule.C.SPAWN_FINAL_OFFSET.y).multiplyComponents(new Vector2(spawnModule.pose.scale.x, spawnModule.pose.scale.y)).rotateBy(spawnModule.pose.rotation));
                spawnFinalPose.rotation += Math.PI;
                ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.EXIT_SPAWN.NAME, spawnFinalPose, ShipLerp.C.TYPES.EXIT_SPAWN.BLEND_FACTOR, spawnModule, true, SpawnBaseModule.C.SPAWN_DELAY);
            }
        }
    }

    handleShipDepotEnterLerp(ship) {
        if (ship && ship.team && ship.team.base && ship.getLevel() < 7) {
            let depotModules = ship.team.base.depotBaseModules;
            for (let depotModule of depotModules) {
                if (depotModule && depotModule.ready && !depotModule.dead) {
                    let suckRectangle = new Rectangle(new Vector2(DepotBaseModule.C.SUCK_RECTANGLE.CENTER.x, DepotBaseModule.C.SUCK_RECTANGLE.CENTER.y).multiplyComponents(new Vector2(depotModule.pose.scale.x, depotModule.pose.scale.y)).rotateBy(depotModule.pose.rotation).add(depotModule.pose.position), new Vector2(DepotBaseModule.C.SUCK_RECTANGLE.SIZE.x, DepotBaseModule.C.SUCK_RECTANGLE.SIZE.y).multiplyComponents(new Vector2(depotModule.pose.scale.x, depotModule.pose.scale.y)), depotModule.pose.rotation);
                    let shipPosition = ship.getPosition();
                    if (shipPosition && suckRectangle.containsPoint(shipPosition) && !ship.lerp && Helper.angleWithinThreshold(ship.getPose().rotation, depotModule.pose.rotation, DepotBaseModule.C.ANGLE_THRESHOLD)) {
                        ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.ENTER_DEPOT.NAME, depotModule.pose, ShipLerp.C.TYPES.ENTER_DEPOT.BLEND_FACTOR, depotModule, false);
                        ship.lastContributedAmount = 0;
                        ship.conditions.push(new ConditionCreator(() => {
                            return (!ship.lerp || (ship.lerp && ship.lerp.isAcceptable))
                        }, () => {
                            ship.inDepot = ship.lerp ? depotModule : null;
                        }).start());
                    }
                }
            }
        }
    }

    handleShipDepotExitLerp(ship) {
        if (ship && ship.team && ship.team.base && ship.inDepot && ship.inDepot.ready && ship.ship.alive) {
            let depotModule = ship.inDepot;
            let depotFinalPose = depotModule.pose.clone();
            depotFinalPose.position = depotFinalPose.position.add(new Vector2(DepotBaseModule.C.DEPOT_FINAL_OFFSET.x, DepotBaseModule.C.DEPOT_FINAL_OFFSET.y).multiplyComponents(new Vector2(depotModule.pose.scale.x, depotModule.pose.scale.y)).rotateBy(depotModule.pose.rotation));
            depotFinalPose.rotation += Math.PI;
            ship.inDepot.subBase.depotExitQueue.add(() => {
                ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.EXIT_DEPOT.NAME, depotFinalPose, ShipLerp.C.TYPES.EXIT_DEPOT.BLEND_FACTOR, depotModule, true);
                ship.inDepot = null;
                ship.isDonating = false;
                ship.conditions.push(new ConditionCreator(() => {
                    return !ship.lerp
                }, () => {
                    ship.hideUI(UIComponent.C.UIS.BOTTOM_MESSAGE);
                    if (ship.lastContributedAmount > 0) {
                        this.sendNotifications("Ship Contributed", `${ship.ship.name} has contributed ${ship.lastContributedAmount} crystals to your team!`, ship.team, ship.team);
                    }
                    for (let item of ship.selectedItems) {
                        let shipPosition = ship.getPosition();
                        if (item && shipPosition) {
                            new Collectible(shipPosition, item.CODE);
                        }
                    }
                    ship.selectedItems = [];
                }).start());
            })
        }
    }

    handleWeaponsStore(ship) {
        if (!ship || (ship.team && ship.team.base && ship.team.base.dead) || !ship.inDepot || !ship.ship.alive) {
            ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE);
            ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE_DONATE);
            ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE_EXIT);
            ship.hideUI(UIComponent.C.UIS.WEAPONS_STORE_EMPTY);

            ship.hideUIsIncludingID(UIComponent.C.UIS.WEAPONS_STORE_TAB);
            ship.hideUIsIncludingID(UIComponent.C.UIS.WEAPONS_STORE_ITEM);
            ship.hideUIsIncludingID(UIComponent.C.UIS.WEAPONS_STORE_SLOT);

            ship.inDepot = false;
            ship.weaponsStoreTime = -1;
            ship.isDonating = false;
            return;
        }

        if (ship.weaponsStoreTime == -1) {
            ship.weaponsStoreTime = game.step;
        } else if (game.step - ship.weaponsStoreTime >= DepotBaseModule.C.WEAPONS_STORE_TIME) {
            this.handleShipDepotExitLerp(ship);
        }

        if (ship.isDonating) {
            if (ship.ship.crystals > 0) {
                let shipLevel = ship.getLevel();
                let donateAmount = Math.round(shipLevel * DepotBaseModule.C.DONATE_SPEED_MULTIPLIER * Math.pow(ship.team.base.baseUpgrades[5].default.MULTIPLIER, ship.team.base.baseUpgrades[5].level));
                let realDonateAmount = Math.min(donateAmount, ship.ship.crystals);
                ship.setCrystals(Math.max(0, ship.ship.crystals - realDonateAmount));
                ship.credits += realDonateAmount;
                ship.totalContributed += realDonateAmount;
                ship.setScore(ship.ship.score + realDonateAmount);
                ship.lastContributedAmount += realDonateAmount;
                if (ship.team) {
                    if (!ship.team.base.dead) {
                        ship.team.base.crystals += realDonateAmount;
                        if (ship.team.base.crystals >= Base.C.MAX_CRYSTALS[ship.team.base.baseLevel - 1]) {
                            if (ship.team.base.baseLevel < 4) {
                                ship.team.base.baseLevel += 1;
                                ship.team.base.crystals = 0;
                                ship.team.base.spawnBase();
                                this.sendNotifications("Base Upgrade", ship.team.name + " has upgraded their base to level " + ship.team.base.baseLevel + "!", null, ship.team);
                            } else {
                                ship.team.base.crystals = Base.C.MAX_CRYSTALS[ship.team.base.baseLevel - 1];
                                if (!ship.team.base.reachedMaxLevel || ship.team.base.maxRecords[ship.team.base.maxRecords.length - 1].type == 'lost') {
                                    ship.team.base.reachedMaxLevel = true;
                                    ship.team.base.maxRecords.push({ type: 'maxed', tick: game.step });
                                    this.sendNotifications("Base Maxed Out", ship.team.name + " has maxed out their base at level " + ship.team.base.baseLevel + "!", null, ship.team);
                                }
                            }
                        }
                    }
                }
            } else {
                ship.setCrystals(0);
            }
        }
        
        let weaponsStore = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE);
        weaponsStore.components[2].value = ship.team.name + ' - Weapons Store | ' + Helper.formatTime(DepotBaseModule.C.WEAPONS_STORE_TIME - (game.step - ship.weaponsStoreTime));
        weaponsStore.components[2].position[2] = Math.min(95, weaponsStore.components[2].value.length * 2);
        ship.sendUI(weaponsStore);

        let weaponsStoreSecondaryTab = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_TAB);
        weaponsStoreSecondaryTab.id += '-0';
        weaponsStoreSecondaryTab.components[1].value = 'SECONDARIES';
        weaponsStoreSecondaryTab.components[0].fill += (ship.selectedTab == 0 ? 'BF' : '40');
        ship.sendUI(weaponsStoreSecondaryTab);

        let weaponsStoreBaseTab = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_TAB);
        weaponsStoreBaseTab.id += '-1';
        weaponsStoreBaseTab.components[1].value = 'BASE UPGRADES';
        weaponsStoreBaseTab.position[0] += weaponsStoreBaseTab.position[2];
        weaponsStoreBaseTab.components[0].fill += (ship.selectedTab == 1 ? 'BF' : '40');
        ship.sendUI(weaponsStoreBaseTab);

        let weaponsStoreDonate = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_DONATE);
        weaponsStoreDonate.components[1].position[2] = ship.ship.crystals / ship.getMaxCrystals() * 100;
        weaponsStoreDonate.components[2].value = ship.ship.crystals + '💎➔ ' + ship.credits + ' 💳';
        ship.sendUI(weaponsStoreDonate);

        let weaponsStoreExit = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_EXIT);
        ship.sendUI(weaponsStoreExit);

        let weaponsStoreHealing = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_EMPTY);
        ship.sendUI(weaponsStoreHealing);

        let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
        bottomMessage.components[0].fill = '#0080FFBF';
        bottomMessage.components[1].value = "Make sure to clear your weapons to free up slots to buy new items!";
        ship.sendUI(bottomMessage);

        if (ship.selectedTab == 0) {
            let numCols = 5;
            let numRows = 2;
            for (let i = 0; i < numRows; i++) {
                for (let j = 0; j < numCols; j++) {
                    let index = i * numCols + j;

                    if (index < 0 || index >= DepotBaseModule.C.WEAPONS_STORE_SECONDARIES.length) {
                        continue;
                    }

                    let secondary = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_ITEM);
                    secondary.id += '-' + index + '-' + ship.selectedTab;
                    
                    let position = Helper.getGridUIPosition(27.5, 35, 1, 3, j, i, numCols, numRows);
                    secondary.position = position;
                    secondary.components[1].value = DepotBaseModule.C.WEAPONS_STORE_SECONDARIES[index].ICON;
                    secondary.components[2].value = 'x' + DepotBaseModule.C.WEAPONS_STORE_SECONDARIES[index].FREQUENCY;
                    secondary.components[3].value = DepotBaseModule.C.WEAPONS_STORE_SECONDARIES[index].BASE_COST + ' 💳';
                    secondary.components[5].value = DepotBaseModule.C.WEAPONS_STORE_SECONDARIES[index].NAME;

                    let enoughCredits = ship.credits >= DepotBaseModule.C.WEAPONS_STORE_SECONDARIES[index].BASE_COST;
                    if (enoughCredits && ship.selectedItems.length < ship.getMaxSecondaries() && ship.ship.alive) {
                        secondary.components[0].fill = '#009400bf';
                    } else {
                        secondary.components[0].fill = '#2C2C2Cbf';
                        secondary.clickable = false;
                    }

                    ship.sendUI(secondary);
                }
            }
        } else if (ship.selectedTab == 1) {
            let numCols = 3;
            let numRows = 2;
            for (let i = 0; i < numRows; i++) {
                for (let j = 0; j < numCols; j++) {
                    let index = i * numCols + j;

                    if (index < 0 || index >= DepotBaseModule.C.WEAPONS_STORE_BASE_UPGRADES.length) {
                        continue;
                    }

                    let baseUpgradeInfo = ship.team.base.baseUpgrades[index];

                    let baseUpgrade = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_ITEM);
                    baseUpgrade.id += '-' + index + '-' + ship.selectedTab;
                    
                    let position = Helper.getGridUIPosition(27.5, 35, 1, 3, j, i, numCols, numRows);
                    baseUpgrade.position = position;
                    baseUpgrade.components[1].value = baseUpgradeInfo.default.ICON;
                    baseUpgrade.components[2].value = baseUpgradeInfo.level + '/' + baseUpgradeInfo.default.ALLOWED;
                    baseUpgrade.components[3].value = baseUpgradeInfo.level < baseUpgradeInfo.default.ALLOWED ? baseUpgradeInfo.default.BASE_COST * (baseUpgradeInfo.level + 1) + ' 💳' : 'MAXED OUT';
                    baseUpgrade.components[5].value = 'x' + baseUpgradeInfo.default.MULTIPLIER + ' ' + baseUpgradeInfo.default.NAME;

                    let enoughCredits = ship.credits >= baseUpgradeInfo.default.BASE_COST;
                    if (enoughCredits && ship.ship.alive && baseUpgradeInfo.level < baseUpgradeInfo.default.ALLOWED) {
                        baseUpgrade.components[0].fill = '#009400bf';
                    } else {
                        baseUpgrade.components[0].fill = '#2C2C2Cbf';
                        baseUpgrade.clickable = false;
                    }

                    ship.sendUI(baseUpgrade);
                }
            }
        }

        let numSlots = 6;
        for (let i = 0; i < numSlots; i++) {
            let slot = Helper.deepCopy(UIComponent.C.UIS.WEAPONS_STORE_SLOT);
            slot.id += '-' + i;
            slot.clickable = ship.selectedItems[i];
            let position = Helper.getGridUIPosition(30, 0, 0.5, 0, i, 0, numSlots, 1);
            slot.position = [position[0], slot.position[1], position[2], slot.position[3]];
            slot.components[1].value = ship.selectedItems[i] ? ship.selectedItems[i].ICON : '';
            if (i >= ship.getMaxSecondaries()) {
                slot.components[0].fill = '#2C2C2C80';
                slot.components[0].stroke = '#2C2C2Cbf';
                slot.components[1].value = '▧';
                slot.components[1].position = [-40, -40, 180, 180];
                slot.components[1].color = '#2C2C2Cbf';
            } else if (ship.selectedItems[i]) {
                slot.components.push(
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000080',
                    },
                    {
                        type: 'text',
                        value: '-',
                        position: [0, 0, 100, 100],
                        color: '#ffffff'
                    }
                );
            }
            ship.sendUI(slot);
        }
    }

    handleShipTurretUse(ship) {
        // if (ship && ship.team && ship.team.base) {
        //     let turretModules = ship.team.base.turretBaseModules;
        //     for (let turretModule of turretModules) {
        //         let rectangle = turretModule.isUpper ? TurretBaseModule.C.CONTROL_RECTANGLES.UPPER : TurretBaseModule.C.CONTROL_RECTANGLES.LOWER;
        //         let controlRectangle = new Rectangle(new Vector2(rectangle.CENTER.x, rectangle.CENTER.y).multiplyComponents(new Vector2(turretModule.pose.scale.x, turretModule.pose.scale.y)).rotateBy(turretModule.container.pose.rotation).add(turretModule.pose.position), new Vector2(rectangle.SIZE.x, rectangle.SIZE.y).multiplyComponents(new Vector2(turretModule.pose.scale.x, turretModule.pose.scale.y)), turretModule.container.pose.rotation);
        //         let shipPosition = ship.getPosition();
        //         if (shipPosition && controlRectangle.containsPoint(shipPosition) && !ship.lerp) {
        //             turretModule.setPose(new Pose(turretModule.pose.position, ship.getPose().rotation + Math.PI, turretModule.pose.scale), true);
        //         }
        //     }
        // }
    }

    handleShipDoorUse(ship) {
        if (ship && ship.team && ship.team.base) {
            let doorModules = [...ship.team.base.doorBaseModules, ...this.getOppTeam(ship.team).base.doorBaseModules]
            for (let doorModule of doorModules) {
                if (!doorModule.base.doorsOpened && doorModule.ready && !doorModule.dead) {
                    let rectangle = DoorBaseModule.C.REPULSE_RECTANGLE;
                    let repulseRectangle = new Rectangle(new Vector2(rectangle.CENTER.x, rectangle.CENTER.y).multiplyComponents(new Vector2(doorModule.pose.scale.x, doorModule.pose.scale.y)).rotateBy(doorModule.container.pose.rotation).add(doorModule.pose.position), new Vector2(rectangle.SIZE.x, rectangle.SIZE.y).multiplyComponents(new Vector2(doorModule.pose.scale.x, doorModule.pose.scale.y)), doorModule.container.pose.rotation);
                    let shipPosition = ship.getPosition();
                    if (shipPosition && repulseRectangle.containsPoint(shipPosition) && !ship.lerp) {
                        let respulseFinalPose = doorModule.pose.clone();
                        respulseFinalPose.position = respulseFinalPose.position.add(new Vector2(DoorBaseModule.C.REPULSE_FINAL_OFFSET.x, DoorBaseModule.C.REPULSE_FINAL_OFFSET.y).multiplyComponents(new Vector2(doorModule.pose.scale.x, doorModule.pose.scale.y)).rotateBy(doorModule.pose.rotation));
                        respulseFinalPose.rotation += Math.PI;
                        ship.lerp = new ShipLerp(ship, ShipLerp.C.TYPES.REPULSE_DOOR.NAME, respulseFinalPose, ShipLerp.C.TYPES.REPULSE_DOOR.BLEND_FACTOR, doorModule, true, 0, false);
                        
                        let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                        bottomMessage.components[0].fill = '#ff000080';
                        bottomMessage.components[1].value = 'Base gates are currently closed!';
                        ship.sendTimedUI(bottomMessage);
                    }
                }
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
            if (id.includes(UIComponent.C.UIS.TEAM_SELECTION.id)) {
                if (ship.selectingTeam) {
                    let teamIndex = parseInt(id.split('-')[1]);
                    if (teamIndex >= 0 && teamIndex < this.teams.length) {
                        let selectedTeam = this.teams[teamIndex];
                        let selectedOppTeam = this.getOppTeam(selectedTeam);
                        if (selectedTeam.getBalancerMetric() <= selectedOppTeam.getBalancerMetric()) {
                            if (ship.team) {
                                ship.team.removeShip(ship);
                            }
                            ship.setTeam(selectedTeam);
                            ship.setType(101);
                            ship.setIdle(false);
                            ship.setCollider(true);
                            this.handleShipSpawnLerp(ship);

                            ship.selectingTeam = false;
                            ship.hideUIsIncludingID(UIComponent.C.UIS.TEAM_SELECTION);
                        }
                    }
                }
            }
            if (id == UIComponent.C.UIS.SCOREBOARD_SWITCH.id) {
                if (ship.scoreboardTeam) {
                    if (ship.scoreboardTeam.team == ship.team.team) {
                        ship.scoreboardTeam = this.getOppTeam(ship.scoreboardTeam);
                    } else if (ship.scoreboardTeam.team == this.getOppTeam(ship.team).team) {
                        ship.scoreboardTeam = null;
                    }
                } else {
                    ship.scoreboardTeam = ship.team;
                }
                this.handleShipScoreboardTeamSelection(ship);
            }
            if (id.includes(UIComponent.C.UIS.WEAPONS_STORE_TAB.id)) {
                if (ship.inDepot) {
                    let tabIndex = parseInt(id.split('-')[1]);
                    if (tabIndex >= 0 && tabIndex < 2) {
                        ship.selectedTab = tabIndex;
                        ship.hideUIsIncludingID(UIComponent.C.UIS.WEAPONS_STORE_ITEM);
                    }
                }
            }
            if (id == UIComponent.C.UIS.WEAPONS_STORE_DONATE.id) {
                if (ship.inDepot) {
                    ship.isDonating = !ship.isDonating;
                }
            }
            if (id == UIComponent.C.UIS.WEAPONS_STORE_EXIT.id) {
                if (ship.inDepot) {
                    this.handleShipDepotExitLerp(ship);
                }
            }
            if (id == UIComponent.C.UIS.WEAPONS_STORE_EMPTY.id) {
                if (ship.inDepot) {
                    ship.ship.emptyWeapons();
                }
            }
            if (id.includes(UIComponent.C.UIS.WEAPONS_STORE_ITEM.id)) {
                let index = parseInt(id.split('-')[1]);
                let tabIndex = parseInt(id.split('-')[2]);
                if (ship.inDepot && ship.ship.alive) {
                    if (tabIndex == 0 && ship.selectedItems.length < ship.getMaxSecondaries()) {
                        let selectedItem = DepotBaseModule.C.WEAPONS_STORE_SECONDARIES[index];
                        if (ship.credits >= selectedItem.BASE_COST) {
                            ship.selectedItems.push(selectedItem);
                            ship.credits -= selectedItem.BASE_COST;
                            if (ship.credits < 0) {
                                ship.credits = 0;
                            }
                        }
                    } else if (tabIndex == 1 && ship.team && ship.team.base) {
                        let baseUpgrade = ship.team.base.baseUpgrades[index];
                        if (baseUpgrade && baseUpgrade.level < baseUpgrade.default.ALLOWED && ship.credits >= baseUpgrade.default.BASE_COST) {
                            ship.team.base.baseUpgrades[index].level++;
                            ship.credits -= baseUpgrade.default.BASE_COST;
                            if (ship.credits < 0) {
                                ship.credits = 0;
                            }
                            this.sendNotifications("Base Stats Upgrade", ship.ship.name + ' has bought a base upgrade for ' + 'x' + baseUpgrade.default.MULTIPLIER + ' ' + baseUpgrade.default.NAME + ' (' + baseUpgrade.level + '/' + baseUpgrade.default.ALLOWED + ')!', ship.team, ship.team);
                        }
                    }
                }
            }
            if (id.includes(UIComponent.C.UIS.WEAPONS_STORE_SLOT.id)) {
                if (ship.inDepot) {
                    let index = parseInt(id.split('-')[1]);
                    ship.credits += ship.selectedItems[index].COST;
                    Helper.deleteFromArray(ship.selectedItems, ship.selectedItems[index]);
                }
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

    getBalancerMetric() {
        return this.ships.length + this.getKD() * 0.75 + this.getTotalLevel() * 0.5;
    }
}

const ShipGroup = class {
    tier = 0;
    ships = [];
    normalShips = [];
    idleShips = [];

    static C = {
        SHIPS: {
            '1': {
                '101': { // When adding fly, add the `next: [201, 202] fields`
                    SHIP: '{"name":"Fly","level":1,"model":1,"size":1.05,"next":[201,202],"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-65,-60,-50,-20,10,30,55,75,60],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,8,10,30,25,30,18,15,0],"height":[0,6,8,12,20,20,18,15,0],"propeller":true,"texture":[4,63,10,1,1,1,12,17]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":0,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,0,20,30,60],"z":[0,0,0,0,0]},"width":[0,13,17,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":[7,9,9,4,4]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-15,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,30],"z":[0,0,0,0,0,20]},"width":[0,5,8,11,7,0],"height":[0,5,8,11,10,0],"angle":0,"laser":{"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"error":2.5},"propeller":false,"texture":[3,3,10,3]}},"wings":{"main":{"length":[60,20],"width":[100,50,40],"angle":[-10,10],"position":[0,20,10],"doubleside":true,"offset":{"x":0,"y":10,"z":5},"bump":{"position":30,"size":20},"texture":[11,63]}},"typespec":{"name":"Fly","level":1,"model":1,"code":101,"next":[201,202],"specs":{"shield":{"capacity":[75,100],"reload":[2,3]},"generator":{"capacity":[40,60],"reload":[10,15]},"ship":{"mass":60,"speed":[125,145],"rotation":[110,130],"acceleration":[100,120]}},"shape":[1.368,1.368,1.093,0.965,0.883,0.827,0.791,0.767,0.758,0.777,0.847,0.951,1.092,1.667,1.707,1.776,1.856,1.827,1.744,1.687,1.525,1.415,1.335,1.606,1.603,1.578,1.603,1.606,1.335,1.415,1.525,1.687,1.744,1.827,1.856,1.776,1.707,1.667,1.654,0.951,0.847,0.777,0.758,0.767,0.791,0.827,0.883,0.965,1.093,1.368],"lasers":[{"x":0,"y":-1.365,"z":-0.21,"angle":0,"damage":[5,6],"rate":4,"type":1,"speed":[160,180],"number":1,"spread":0,"error":2.5,"recoil":0}],"radius":1.856}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 3, y: 3 } },
                    ABBREVIATION: 'FLY'
                },
            },
            '2': {
                '201': {
                    SHIP: '{"name":"Delta-Fighter","level":2,"model":1,"code":201,"next":[301,302],"size":1.3,"specs":{"shield":{"capacity":[100,150],"reload":[3,4]},"generator":{"capacity":[50,80],"reload":[15,25]},"ship":{"mass":80,"speed":[110,135],"rotation":[80,100],"acceleration":[110,120]}},"bodies":{"cockpit":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-20,"z":12},"position":{"x":[0,0,0,0,0],"y":[-20,-10,0,10,20],"z":[-7,-3,0,5,3]},"width":[3,12,18,16,3],"height":[3,6,8,6,3],"texture":[9]},"cockpit2":{"angle":0,"section_segments":8,"offset":{"x":0,"y":-10,"z":12},"position":{"x":[0,0,0,0],"y":[-10,0,10,40],"z":[0,0,5,3]},"width":[5,18,16,3],"height":[5,12,10,5],"texture":[9,2,11]},"propulsor":{"section_segments":8,"offset":{"x":0,"y":35,"z":10},"position":{"x":[0,0,0,0,0,0],"y":[0,10,20,30,40,30],"z":[0,0,0,0,0]},"width":[5,15,10,10,10,0],"height":[15,15,15,15,10,0],"texture":[63,63,4,5,12],"propeller":true},"bumps":{"section_segments":8,"offset":{"x":40,"y":40,"z":5},"position":{"x":[0,0,0,0,0,0],"y":[-40,-10,0,10,40,45],"z":[0,0,0,0,0,0]},"width":[0,5,8,12,5,0],"height":[0,25,28,22,15,0],"texture":[63]},"gunsupport":{"section_segments":8,"offset":{"x":30,"y":-40,"z":5},"position":{"x":[-30,-20,-10,0,0,0],"y":[-20,-15,-5,10,40,55],"z":[-20,-20,-10,0,0,0]},"width":[3,5,8,4,5,0],"height":[3,5,8,12,15,0],"texture":63},"gun":{"section_segments":8,"offset":{"x":0,"y":-60,"z":-15},"position":{"x":[0,0,0,0],"y":[-20,-10,5,10],"z":[0,0,0,0]},"width":[3,7,8,3],"height":[3,7,8,3],"texture":[6,4,5],"laser":{"damage":[3,5],"rate":3,"type":1,"speed":[100,130],"number":3,"angle":15,"error":0}}},"wings":{"main":{"doubleside":true,"offset":{"x":0,"y":-25,"z":5},"length":[100],"width":[120,30,40],"angle":[0,20],"position":[30,90,85],"texture":11,"bump":{"position":30,"size":20}}},"typespec":{"name":"Delta-Fighter","level":2,"model":1,"code":201,"next":[301,302],"specs":{"shield":{"capacity":[100,150],"reload":[3,4]},"generator":{"capacity":[50,80],"reload":[15,25]},"ship":{"mass":80,"speed":[110,135],"rotation":[80,100],"acceleration":[110,120]}},"shape":[2.081,1.969,1.501,1.455,1.403,1.368,1.263,1.192,1.095,1.063,1.128,1.209,1.352,1.545,1.85,2.348,2.965,3.211,3.33,2.93,2.496,2.442,2.441,1.866,1.967,1.954,1.967,1.866,2.441,2.442,2.496,2.93,3.33,3.211,2.965,2.348,1.85,1.545,1.352,1.209,1.128,1.063,1.095,1.192,1.263,1.368,1.403,1.455,1.501,1.969],"lasers":[{"x":0,"y":-2.08,"z":-0.39,"angle":0,"damage":[3,5],"rate":3,"type":1,"speed":[100,130],"number":3,"spread":15,"error":0,"recoil":0}],"radius":3.33}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 5, y: 3 } },
                    ABBREVIATION: 'DELTA'

                },
                '202': {
                    SHIP: '{"name":"Trident","level":2,"model":2,"code":202,"next":[303,304],"size":1.2,"specs":{"shield":{"capacity":[125,175],"reload":[3,5]},"generator":{"capacity":[50,80],"reload":[15,20]},"ship":{"mass":100,"speed":[110,135],"rotation":[70,85],"acceleration":[90,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-100,-50,0,30,70,100,90],"z":[0,0,0,0,0,0,0]},"width":[1,25,15,30,30,20,10],"height":[1,20,20,30,30,10,0],"texture":[1,1,10,2,3],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-40,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,30,40],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,10,15,12,0],"texture":[9],"propeller":false},"cannons":{"section_segments":12,"offset":{"x":50,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"laser":{"damage":[4,8],"rate":2.5,"type":1,"speed":[110,160],"number":1,"angle":0,"error":0},"propeller":false,"texture":[4,4,10,4,63,4]}},"wings":{"main":{"offset":{"x":0,"y":60,"z":0},"length":[80,30],"width":[70,50,60],"texture":[4,63],"angle":[0,0],"position":[10,-20,-50],"bump":{"position":-10,"size":15}},"winglets":{"length":[30,20],"width":[10,30,0],"angle":[50,20],"position":[90,80,50],"texture":[63],"bump":{"position":10,"size":30},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Trident","level":2,"model":2,"code":202,"next":[303,304],"specs":{"shield":{"capacity":[125,175],"reload":[3,5]},"generator":{"capacity":[50,80],"reload":[15,20]},"ship":{"mass":100,"speed":[110,135],"rotation":[70,85],"acceleration":[90,110]}},"shape":[2.4,2.164,1.784,1.529,1.366,0.981,0.736,0.601,0.516,0.457,0.415,2.683,2.66,2.66,2.724,2.804,2.763,2.605,2.502,2.401,2.596,2.589,2.426,2.448,2.443,2.52,2.443,2.448,2.426,2.589,2.596,2.401,2.502,2.605,2.763,2.804,2.724,2.66,2.66,2.683,0.415,0.457,0.516,0.601,0.736,0.981,1.366,1.529,1.784,2.164],"lasers":[{"x":1.2,"y":-0.24,"z":0,"angle":0,"damage":[4,8],"rate":2.5,"type":1,"speed":[110,160],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.2,"y":-0.24,"z":0,"angle":0,"damage":[4,8],"rate":2.5,"type":1,"speed":[110,160],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.804}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 5, y: 3 } },
                    ABBREVIATION: 'TRI'
                },
            },
            '3': {
                '301': {
                    SHIP: '{"name":"Y-Defender","level":3,"model": 1,"code":301,"next":[401,402],"size":1.5,"specs":{"shield":{"capacity":[175,225],"reload":[4,6]},"generator":{"capacity":[50,80],"reload":[18,26]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-100,-95,-50,-40,-20,-10,30,70,65],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,10,20,15,20,0],"height":[0,10,20,15,15,20,25,15,0],"texture":[1,2,2,63,2,10,2,12],"laser":{"damage":[20,40],"rate":2,"type":1,"speed":[140,190],"number":1,"recoil":75,"error":0}},"propulsors":{"section_segments":8,"offset":{"x":50,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-30,-25,20,25,40,50,60,100,90],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,20,15,5,25,20,15,15,0],"height":[0,20,15,5,25,20,20,10,0],"texture":[63,63,63,2,2,3,4,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-70,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,10,20],"z":[0,0,0,0,0]},"width":[0,10,10,10,0],"height":[0,10,15,12,0],"texture":[9],"propeller":false}},"wings":{"join":{"offset":{"x":14,"y":0,"z":0},"length":[25],"width":[20,10],"angle":[0],"position":[0,0,0,50],"texture":[63],"bump":{"position":10,"size":40}},"join2":{"offset":{"x":14,"y":50,"z":0},"length":[25],"width":[20,10],"angle":[0],"position":[0,0,0,50],"texture":[3],"bump":{"position":10,"size":40}},"winglets":{"offset":{"x":5,"y":40,"z":10},"length":[10,20],"width":[15,30,50],"angle":[60,-20],"position":[0,5,60],"texture":[63],"bump":{"position":10,"size":60}}},"typespec":{"name":"Y-Defender","level":3,"model":1,"code":301,"next":[401,402],"specs":{"shield":{"capacity":[175,225],"reload":[4,6]},"generator":{"capacity":[50,80],"reload":[18,26]},"ship":{"mass":200,"speed":[80,100],"rotation":[40,60],"acceleration":[70,80]}},"shape":[3,2.959,2.915,2.203,1.734,0.652,0.639,1.358,1.816,2.118,2.23,2.139,2.06,2.016,2.023,2.04,2.551,2.584,2.67,3.055,3.578,3.552,3.315,3.834,2.269,2.104,2.269,3.834,3.315,3.552,3.578,3.055,2.67,2.584,2.551,2.04,2.023,2.016,2.06,2.139,2.23,2.118,1.816,1.358,0.639,0.652,1.734,2.203,2.915,2.959],"lasers":[{"x":0,"y":-3,"z":0,"angle":0,"damage":[20,40],"rate":2,"type":1,"speed":[140,190],"number":1,"spread":0,"error":0,"recoil":75}],"radius":3.834}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 3, y: 6 } },
                    ABBREVIATION: 'YDEF'
                },
                '302': {
                    SHIP: '{"name":"Pulse-Fighter","level":3,"model": 2,"code":302,"next":[402,403],"size":1.3,"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":135,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-75,-50,0,50,105,90],"z":[0,0,0,0,0,0,0]},"width":[0,15,25,30,35,20,0],"height":[0,10,15,25,25,20,0],"propeller":true,"texture":[63,1,1,10,2,12]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,10,30,60],"z":[0,0,0,0,0]},"width":[0,10,15,10,5],"height":[0,18,25,18,5],"propeller":false,"texture":9},"cannon":{"section_segments":6,"offset":{"x":0,"y":-40,"z":-10},"position":{"x":[0,0,0,0,0,0],"y":[-40,-50,-20,0,20,50],"z":[0,0,0,0,0,0]},"width":[0,5,10,10,15,0],"height":[0,5,15,15,10,0],"angle":0,"laser":{"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"error":0},"propeller":false,"texture":3},"deco":{"section_segments":8,"offset":{"x":50,"y":50,"z":-10},"position":{"x":[0,0,5,5,0,0,0],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,5,5,0],"height":[0,5,10,15,10,5,0],"angle":0,"laser":{"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0},"propeller":false,"texture":4}},"wings":{"main":{"length":[80,20],"width":[120,50,40],"angle":[-10,20],"position":[30,50,30],"doubleside":true,"bump":{"position":30,"size":10},"texture":[11,63],"offset":{"x":0,"y":0,"z":0}},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-40,-60,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}},"stab":{"length":[40,10],"width":[50,20,20],"angle":[40,30],"position":[70,75,80],"doubleside":true,"texture":63,"bump":{"position":0,"size":20},"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Pulse-Fighter","level":3,"model":2,"code":302,"next":[402,403],"specs":{"shield":{"capacity":[150,200],"reload":[3,5]},"generator":{"capacity":[60,90],"reload":[20,30]},"ship":{"mass":135,"speed":[105,120],"rotation":[60,80],"acceleration":[80,100]}},"shape":[2.343,2.204,1.998,1.955,2.088,1.91,1.085,0.974,0.895,0.842,0.829,0.95,1.429,2.556,2.618,2.726,2.851,2.837,2.825,2.828,2.667,2.742,2.553,2.766,2.779,2.735,2.779,2.766,2.553,2.742,2.667,2.828,2.825,2.837,2.851,2.726,2.618,2.556,1.43,0.95,0.829,0.842,0.895,0.974,1.085,1.91,2.088,1.955,1.998,2.204],"lasers":[{"x":0,"y":-2.34,"z":-0.26,"angle":0,"damage":[15,30],"rate":1,"type":2,"speed":[150,175],"number":1,"spread":0,"error":0,"recoil":0},{"x":1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.3,"y":-0.052,"z":-0.26,"angle":0,"damage":[3,6],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.851}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 5, y: 5 } },
                    ABBREVIATION: 'PULSE'
                },
                '303': {
                    SHIP: '{"name":"Side-Fighter","level":3,"model": 3,"code":303,"next":[404,405],"size":1.5,"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,36]},"ship":{"mass":100,"speed":[100,130],"rotation":[50,70],"acceleration":[100,130]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-30,-22,-15,0,15,22,40,30],"z":[0,0,0,0,0,0,0,0,0]},"width":[5,10,25,30,25,17,15,0],"height":[5,10,25,30,25,17,15,0],"texture":[5,63,63,63,63,12,12],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,-8,0],"z":[0,0,0]},"width":[0,10,10],"height":[0,10,10],"texture":[9],"propeller":false,"laser":{"damage":[4,7],"rate":10,"type":1,"speed":[150,240],"number":1,"error":20}}},"wings":{"wings1":{"doubleside":true,"offset":{"x":60,"y":0,"z":-80},"length":[0,50,50,50],"width":[0,0,100,100,0],"angle":[95,90,90,95],"position":[0,0,0,0,0],"texture":[7],"bump":{"position":0,"size":8}},"join":{"offset":{"x":0,"y":0,"z":0},"length":[61],"width":[10,6],"angle":[0],"position":[0,0,0,50],"texture":[8],"bump":{"position":10,"size":20}}},"typespec":{"name":"Side-Fighter","level":3,"model":3,"code":303,"next":[404,405],"specs":{"shield":{"capacity":[125,175],"reload":[2,4]},"generator":{"capacity":[75,125],"reload":[20,36]},"ship":{"mass":100,"speed":[100,130],"rotation":[50,70],"acceleration":[100,130]}},"shape":[0.902,0.912,0.888,0.892,0.731,0.749,0.779,2.343,2.255,2.136,2.061,2.022,2.038,2.04,2.022,2.061,2.136,2.255,2.343,0.836,0.924,1.106,1.282,1.262,1.222,1.202,1.222,1.262,1.282,1.106,0.924,0.836,2.343,2.255,2.136,2.061,2.022,2.038,2.04,2.022,2.061,2.136,2.255,2.343,0.779,0.749,0.731,0.892,0.888,0.912],"lasers":[{"x":0,"y":-0.9,"z":0,"angle":0,"damage":[4,7],"rate":10,"type":1,"speed":[150,240],"number":1,"spread":0,"error":20,"recoil":0}],"radius":2.343}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 4, y: 4 } },
                    ABBREVIATION: 'S-FGT'
                },
                '304': {
                    SHIP: '{"name":"Shadow X-1","level":3,"model": 4,"code":304,"next":[405,406],"size":0.97,"specs":{"shield":{"capacity":[120,150],"reload":[4,6]},"generator":{"capacity":[30,60],"reload":[14,26]},"ship":{"mass":210,"speed":[120,160],"rotation":[55,75],"acceleration":[110,150]}},"bodies":{"main":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-98,-95,-70,-40,0,40,70,80,90,100],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,30,40,20,20,40,40,40,20,0],"height":[0,4,4,20,20,10,10,15,15,15,10,10],"texture":[12,5,63,4,4,63,4,4,5]},"back":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,19,2],"height":[3,5,7,8,2],"texture":[63],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-25,"z":15},"position":{"x":[0,0,0,0,0,0],"y":[-45,-40,-25,0,5],"z":[0,0,0,0,0,0]},"width":[0,13,17,11,0],"height":[0,10,13,5,0],"texture":[9]},"laser":{"section_segments":10,"offset":{"x":70,"y":10,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,5,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[3,4,10,3],"propeller":true,"laser":{"damage":[5,8],"rate":10,"type":1,"speed":[170,215],"number":1}}},"wings":{"top":{"offset":{"x":0,"y":50,"z":5},"length":[0,30],"width":[0,70,30],"angle":[90,90],"position":[0,0,50],"texture":[4],"bump":{"position":10,"size":10}},"side_joins":{"offset":{"x":0,"y":30,"z":-3},"length":[100],"width":[100,40],"angle":[0],"position":[-50,50],"texture":[4],"bump":{"position":10,"size":10}}},"typespec":{"name":"Shadow X-1","level":3,"model":4,"code":304,"next":[405,406],"specs":{"shield":{"capacity":[90,130],"reload":[4,6]},"generator":{"capacity":[40,70],"reload":[17,29]},"ship":{"mass":195,"speed":[115,130],"rotation":[50,70],"acceleration":[100,115]}},"shape":[1.9,1.879,1.843,1.559,1.351,1.198,1.092,0.89,0.817,0.841,0.871,1.373,1.541,1.614,1.653,1.699,2.014,2.346,2.602,2.682,1.973,1.697,1.877,1.933,2.024,2.179,2.024,1.933,1.877,1.697,1.973,2.682,2.602,2.346,2.014,1.699,1.653,1.614,1.541,1.373,0.871,0.841,0.817,0.89,1.092,1.198,1.351,1.559,1.843,1.879],"lasers":[{"x":1.33,"y":-0.19,"z":-0.38,"angle":0,"damage":[3,6],"rate":8,"type":1,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.33,"y":-0.19,"z":-0.38,"angle":0,"damage":[3,6],"rate":8,"type":1,"speed":[170,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":2.682}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 3, y: 3 } },
                    ABBREVIATION: 'X1'
                }
            },
            '4': {
                '401': {
                    SHIP: '{"name":"Vanguard","level":4,"model":1,"code":401,"next":[501,502],"size":1.2,"specs":{"shield":{"capacity":[140,190],"reload":[3,4]},"generator":{"capacity":[80,140],"reload":[25,35]},"ship":{"mass":200,"speed":[75,90],"rotation":[90,120],"acceleration":[75,100]}},"bodies":{"main":{"section_segments":11,"offset":{"x":0,"y":-47,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[0,6,12,48,77,110,137,141],"z":[0,0,0,0,0,0,0,0]},"width":[0,22,24,35,37,34,23,0],"height":[0,22,24,35,37,34,23,0],"texture":[9,3,2,8,3,2,3]},"engines":{"section_segments":12,"offset":{"x":28,"y":-27,"z":-10},"position":{"x":[25,-2,-4,-2,0,0],"y":[0,40,74,98,108,105],"z":[18,10,0,0,0,0]},"width":[9,10,9,14,11,0],"height":[2,10,9,14,11,0],"texture":[3,3,3,3,17],"propeller":true},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-30,"z":15},"position":{"x":[0,0,0,0,0],"y":[0,40,66,84,89],"z":[-8,-2,-1,1,20]},"width":[20,30,30,23,0],"height":[20,30,30,23,0],"texture":[9],"propeller":false},"cannons":{"section_segments":8,"offset":{"x":18,"y":-183,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[5,0,23,27,62,62,97,102,163],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,7,7,4,4,7,7],"height":[0,5,5,7,7,4,4,7,7],"texture":[12,13,4,8,4,4,3,8],"propeller":false,"laser":{"damage":[18,25],"rate":3,"type":2,"speed":[130,210],"recoil":70,"number":1,"error":0}}},"wings":{"outer":{"offset":{"x":37,"y":-115,"z":15},"length":[0,12,12,22,4,38],"width":[165,235,246,232,167,122,35],"angle":[-15,-15,-15,-8,-8,-8],"position":[20,54,54,47,79,100,101],"texture":[4,3,4,4,1,8],"doubleside":true,"bump":{"position":30,"size":4}},"inner":{"offset":{"x":-37,"y":-115,"z":15},"length":[12],"width":[165,112],"angle":[0],"position":[20,0],"texture":[63,63],"doubleside":true,"bump":{"position":30,"size":4}},"winglet":{"offset":{"x":104,"y":-13,"z":55},"length":[45,15,15,45],"width":[25,70,35,70,25],"angle":[-70,-70,-110,-110],"position":[0,0,0,0,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":5}}},"typespec":{"name":"Vanguard","level":4,"model":1,"code":401,"next":[501,502],"specs":{"shield":{"capacity":[140,190],"reload":[3,4]},"generator":{"capacity":[80,140],"reload":[25,35]},"ship":{"mass":200,"speed":[75,90],"rotation":[80,110],"acceleration":[75,100]}},"shape":[1.128,4.427,4.643,4.646,4.01,3.568,3.144,2.81,2.808,3.088,3.087,3.077,3.045,2.998,2.935,2.552,2.417,2.317,1.954,1.88,1.891,2.158,2.148,2.228,2.236,2.256,2.236,2.228,2.148,2.158,1.891,1.88,1.954,2.317,2.417,2.552,2.935,2.998,3.045,3.077,3.087,3.088,2.808,2.81,3.144,3.568,4.01,4.646,4.643,4.427],"lasers":[{"x":0.432,"y":-4.392,"z":0.192,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[130,210],"number":1,"spread":0,"error":0,"recoil":70},{"x":-0.432,"y":-4.392,"z":0.192,"angle":0,"damage":[18,25],"rate":3,"type":2,"speed":[130,210],"number":1,"spread":0,"error":0,"recoil":70}],"radius":4.646}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 5, y: 7 } },
                    ABBREVIATION: 'VANG'
                },
                '402': {
                    SHIP: '{"name": "Pegasus", "level": 4, "model": 2,"code":402,"next":[502,503], "size": 1.65, "zoom": 1, "specs": {"shield": {"capacity": [170, 240], "reload": [4, 6]}, "generator": {"capacity": [80, 130], "reload": [20, 30]}, "ship": {"mass": 260, "speed": [70, 90], "rotation": [40, 60], "acceleration": [80, 95]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 5, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-124, -129, -104, -75, -46, -20, 40, 83, 105, 95], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 24, 30, 26, 38, 38, 34, 18, -2], "height": [0, 4, 16, 23, 26, 25, 25, 24, 12, -8], "texture": [6, 4, 3, 2, 63, 2, 10, 63, 17], "propeller": true, "laser": {"damage": [55, 100], "rate": 1, "type": 2, "speed": [155, 200], "number": 1, "error": 0}}, "thrusters": {"section_segments": 8, "offset": {"x": 56, "y": 9, "z": 0}, "position": {"x": [-1, -1, -1, 10, 13, 5, 3, 0], "y": [-80, -68, -74, -40, 3, 55, 70, 65], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 4, 10, 16, 18, 16, 11, -4], "height": [0, 4, 12, 17, 19, 17, 12, -4], "texture": [6, 3, 3, 63, 4, 4, 17], "propeller": true, "laser": {"damage": [3, 5], "rate": 4, "type": 1, "speed": [170, 220], "number": 1, "error": 2}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 5, "z": 18.9}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-105, -80, -56, -25, 20, 55], "z": [-2, 0, 0, -6, -7, -10]}, "width": [4, 13, 10, 23, 24, 12], "height": [0, 12, 9, 20, 20, 10], "texture": [9, 9, 3, 11, 4], "propeller": false}}, "wings": {"wing": {"doubleside": true, "length": [44, 20, 25], "width": [92, 70, 70, 30], "angle": [10, -10, -20], "position": [28, 0, 20, 55], "offset": {"x": 13, "y": -5, "z": 0}, "bump": {"position": 30, "size": 8}, "texture": [11, 4, 63]}, "winglet_top": {"doubleside": true, "length": [25, 10], "width": [60, 25, 15], "angle": [35, 0], "position": [-10, 18, 8], "offset": {"x": 9, "y": 76, "z": 20}, "bump": {"position": 9, "size": 7}, "texture": [4, 63]}, "winglet_front": {"doubleside": true, "length": [25], "width": [70, 30], "angle": [-20], "position": [0, -35], "offset": {"x": 10, "y": -65, "z": 0}, "bump": {"position": 6, "size": 9}, "texture": [63]}}, "typespec": {"name": "Pegasus", "level": 4, "model": 2, "code": 402, "next":[502,503],"specs": {"shield": {"capacity": [170, 240], "reload": [4, 6]}, "generator": {"capacity": [80, 130], "reload": [19, 29]}, "ship": {"mass": 260, "speed": [70, 90], "rotation": [40, 60], "acceleration": [80, 95]}}, "shape": [4.099, 4.059, 3.953, 3.574, 2.226, 2.964, 3.033, 3.003, 2.916, 2.888, 2.893, 2.831, 2.825, 2.965, 3.228, 3.53, 3.744, 3.923, 3.363, 3.483, 3.382, 3.088, 3.514, 3.647, 3.678, 3.637, 3.678, 3.647, 3.514, 3.088, 3.382, 3.483, 3.363, 3.923, 3.744, 3.53, 3.228, 2.965, 2.825, 2.831, 2.893, 2.888, 2.916, 3.003, 3.033, 2.964, 2.226, 3.574, 3.953, 4.059], "lasers": [{"x": 0, "y": -4.092, "z": 0, "angle": 0, "damage": [75, 120], "rate": 1, "type": 2, "speed": [155, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 1.815, "y": -2.343, "z": 0, "angle": 0, "damage": [3, 5], "rate": 4, "type": 1, "speed": [180, 210], "number": 1, "spread": 0, "error": 2, "recoil": 0}, {"x": -1.815, "y": -2.343, "z": 0, "angle": 0, "damage": [3, 5], "rate": 4, "type": 1, "speed": [170, 220], "number": 1, "spread": 0, "error": 2, "recoil": 0}], "radius": 4.099}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 6 } },
                    ABBREVIATION: 'PEGA'
                },
                '403': {
                    SHIP: '{"name": "Mercury", "level": 4, "model": 3,"code":403,"next":[504,505], "size": 1.3, "specs": {"shield": {"capacity": [150, 200], "reload": [3, 6]}, "generator": {"capacity": [100, 120], "reload": [30, 55]}, "ship": {"mass": 260, "speed": [90, 100], "rotation": [60, 90], "acceleration": [60, 80]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-45, -50, -40, -30, 0, 50, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [1, 5, 15, 20, 30, 35, 20, 0], "height": [1, 5, 10, 15, 25, 15, 10, 0], "texture": [1, 4, 3, 63, 11, 10, 12], "propeller": true, "laser": {"damage": [20, 40], "rate": 1, "type": 2, "speed": [150, 210], "number": 1, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 20, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-40, -20, 0, 20, 50], "z": [0, 0, 0, 0, 0]}, "width": [0, 10, 15, 10, 0], "height": [0, 18, 25, 18, 0], "texture": [4, 9, 4, 4], "propeller": false}, "sides": {"section_segments": 8, "offset": {"x": 70, "y": 0, "z": -10}, "position": {"x": [0, 0, 0, 10, -5, 0, 0, 0], "y": [-115, -80, -100, -30, 0, 30, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [1, 5, 10, 15, 15, 20, 10, 0], "height": [1, 5, 15, 20, 35, 30, 10, 0], "texture": [6, 6, 4, 63, 63, 4, 12], "angle": 0, "propeller": true}, "wingends": {"section_segments": 8, "offset": {"x": 115, "y": 25, "z": -5}, "position": {"x": [0, 2, 4, 2, 0, 0], "y": [-20, -10, 0, 10, 20, 15], "z": [0, 0, 0, 0, 0, 0]}, "width": [2, 3, 6, 3, 4, 0], "height": [5, 15, 22, 17, 5, 0], "texture": [4, 4, 4, 4, 6], "propeller": true, "angle": 2, "laser": {"damage": [3, 5], "rate": 4, "type": 1, "speed": [150, 180], "number": 1, "error": 0}}}, "wings": {"main": {"length": [80, 40], "width": [40, 30, 20], "angle": [-10, 20], "position": [30, 50, 30], "texture": [11, 11], "bump": {"position": 30, "size": 10}, "offset": {"x": 0, "y": 0, "z": 0}}, "font": {"length": [80, 30], "width": [20, 15], "angle": [-10, 20], "position": [-20, -40], "texture": [63], "bump": {"position": 30, "size": 10}, "offset": {"x": 0, "y": 0, "z": 0}}}, "typespec": {"name": "Mercury", "level": 4, "model": 3, "code": 403,"next":[504,505],"specs": {"shield": {"capacity": [150, 200], "reload": [3, 6]}, "generator": {"capacity": [100, 120], "reload": [30, 55]}, "ship": {"mass": 260, "speed": [90, 100], "rotation": [60, 90], "acceleration": [60, 80]}}, "shape": [1.303, 1.306, 1.221, 1.135, 3.514, 3.457, 3.283, 3.008, 2.819, 2.69, 2.614, 2.461, 2.233, 3.14, 3.312, 3.323, 3.182, 2.865, 2.958, 3.267, 3.33, 3.079, 2.187, 2.651, 2.647, 2.605, 2.647, 2.651, 2.187, 3.079, 3.33, 3.267, 2.958, 2.865, 3.182, 3.323, 3.312, 3.14, 2.233, 2.461, 2.614, 2.69, 2.819, 3.008, 3.283, 3.457, 3.514, 1.135, 1.221, 1.306], "lasers": [{"x": 0, "y": -1.3, "z": 0.26, "angle": 0, "damage": [20, 40], "rate": 1, "type": 2, "speed": [150, 210], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.972, "y": 0.13, "z": -0.13, "angle": 2, "damage": [3, 5], "rate": 4, "type": 1, "speed": [150, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.972, "y": 0.13, "z": -0.13, "angle": -2, "damage": [3, 5], "rate": 4, "type": 1, "speed": [150, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.514}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 7, y: 6 } },
                    ABBREVIATION: 'MERC'
                },
                '404': {
                    SHIP: '{"name": "X-Warrior", "level": 4, "model": 4,"code":404,"next":[505,506], "size": 1.6, "specs": {"shield": {"capacity": [150, 200], "reload": [3, 5]}, "generator": {"capacity": [90, 150], "reload": [35, 60]}, "ship": {"mass": 240, "speed": [75, 100], "rotation": [50, 90], "acceleration": [90, 110]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-100, -99, -50, 0, 10, 30, 50, 80, 100, 90], "z": [-10, -10, -5, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 30, 35, 25, 30, 50, 50, 20, 0], "height": [0, 5, 20, 20, 20, 20, 20, 20, 10, 0], "texture": [4, 2, 10, 2, 63, 11, 4, 63, 12], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-30, -20, 0, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 10, 15, 10, 0], "height": [0, 18, 25, 18, 0], "texture": 9, "propeller": false}, "frontcannons": {"section_segments": 12, "offset": {"x": 30, "y": -70, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [-30, -20, 0, 20, 30], "z": [0, 0, 0, 0, 0]}, "width": [3, 5, 5, 5, 3], "height": [3, 5, 15, 15, 3], "texture": [6, 4, 4, 6], "angle": 0, "laser": {"damage": [5, 9], "rate": 3, "type": 1, "speed": [120, 200], "number": 1, "error": 0}}, "wingendtop": {"section_segments": 12, "offset": {"x": 105, "y": 50, "z": 40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-65, -70, -20, 0, 20, 30, 5], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 2, 3, 7, 7, 5, 0], "height": [0, 2, 3, 7, 7, 5, 0], "texture": [12, 63, 63, 11, 63, 12], "angle": 0}, "wingendbottom": {"section_segments": 12, "offset": {"x": 105, "y": 50, "z": -40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-65, -70, -20, 0, 20, 30, 25], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 2, 3, 7, 7, 5, 0], "height": [0, 2, 3, 7, 7, 5, 0], "texture": [12, 63, 63, 11, 63, 12], "angle": 0, "laser": {"damage": [3, 6], "rate": 2.5, "type": 1, "speed": [100, 180], "number": 1, "error": 0}}, "propellers": {"section_segments": 12, "offset": {"x": 40, "y": 60, "z": 0}, "position": {"x": [0, 0, 5, 3, 5, 0, 0], "y": [-35, -40, -30, 0, 40, 50, 40], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 15, 10, 0], "height": [0, 5, 25, 30, 25, 5, 0], "texture": 4, "angle": 0, "propeller": true}}, "wings": {"xwing1": {"doubleside": true, "offset": {"x": 0, "y": 70, "z": 0}, "length": [80, 35], "width": [50, 40, 30], "angle": [20, 20], "position": [0, -10, -20], "texture": [1, 10], "bump": {"position": 10, "size": 20}}, "xwing2": {"doubleside": true, "offset": {"x": 0, "y": 70, "z": 0}, "length": [80, 35], "width": [50, 40, 30], "angle": [-20, -20], "position": [0, -10, -20], "texture": [1, 1], "bump": {"position": 10, "size": 20}}, "winglets2": {"offset": {"x": 30, "y": -40, "z": 0}, "length": [20, 10], "width": [30, 20, 5], "angle": [-10, 20], "position": [0, 0, 0], "texture": 63, "bump": {"position": 30, "size": 10}}}, "typespec": {"name": "X-Warrior", "level": 4, "model": 5, "code": 405,"next":[505,506], "specs": {"shield": {"capacity": [150, 200], "reload": [3, 5]}, "generator": {"capacity": [90, 150], "reload": [35, 60]}, "ship": {"mass": 240, "speed": [75, 100], "rotation": [50, 90], "acceleration": [90, 110]}}, "shape": [3.2, 3.096, 3.365, 3.37, 2.625, 2.149, 2.266, 2.325, 2.329, 1.208, 1.156, 3.483, 3.455, 3.472, 3.565, 3.811, 4.087, 4.351, 4.352, 3.594, 3.502, 3.848, 3.867, 3.701, 3.258, 3.206, 3.258, 3.701, 3.867, 3.848, 3.502, 3.594, 4.352, 4.351, 4.087, 3.811, 3.565, 3.472, 3.455, 3.483, 1.156, 1.208, 2.329, 2.325, 2.266, 2.149, 2.625, 3.37, 3.365, 3.096], "lasers": [{"x": 0.96, "y": -3.2, "z": 0, "angle": 0, "damage": [5, 9], "rate": 3, "type": 1, "speed": [120, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.96, "y": -3.2, "z": 0, "angle": 0, "damage": [5, 9], "rate": 3, "type": 1, "speed": [120, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 3.36, "y": -0.64, "z": -1.28, "angle": 0, "damage": [3, 6], "rate": 2.5, "type": 1, "speed": [100, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -3.36, "y": -0.64, "z": -1.28, "angle": 0, "damage": [3, 6], "rate": 2.5, "type": 1, "speed": [100, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 4.352}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 8 } },
                    ABBREVIATION: 'X-WAR'
                },
                '405': {
                    SHIP: '{"name": "Side-Interceptor", "level": 4, "model": 5,"code":405,"next":[507,508], "size": 1.6, "specs": {"shield": {"capacity": [175, 225], "reload": [3, 6]}, "generator": {"capacity": [100, 150], "reload": [30, 40]}, "ship": {"mass": 140, "speed": [95, 125], "rotation": [50, 100], "acceleration": [110, 140]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-30, -22, -15, 0, 15, 22, 30, 20], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [5, 10, 25, 30, 25, 10, 15, 0], "height": [5, 10, 25, 30, 25, 10, 15, 0], "texture": [1, 3, 63, 63, 3, 4, 12], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, -8, 0], "z": [0, 0, 0]}, "width": [0, 10, 10], "height": [0, 10, 10], "texture": [5, 9, 5], "propeller": false}, "cannons": {"section_segments": 12, "offset": {"x": 60, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-25, -30, -20, 0, 20, 30, 20], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 3, 5, 5, 5, 3, 0], "height": [0, 3, 5, 5, 5, 3, 0], "texture": [12, 6, 63, 63, 6, 12], "angle": 0, "laser": {"damage": [5, 7], "rate": 7, "type": 1, "speed": [125, 225], "number": 1, "error": 5}}}, "wings": {"wings1": {"doubleside": true, "offset": {"x": 60, "y": 20, "z": 0}, "length": [-20, -10, -40], "width": [50, 50, 130, 30], "angle": [280, 315, 315], "position": [0, 0, -50, 0], "texture": 4, "bump": {"position": 10, "size": -10}}, "wings2": {"doubleside": true, "offset": {"x": 60, "y": 20, "z": 0}, "length": [20, 10, 40], "width": [50, 50, 130, 30], "angle": [-100, -135, -135], "position": [0, 0, -50, 0], "texture": 4, "bump": {"position": 10, "size": 10}}, "join": {"doubleside": true, "offset": {"x": 0, "y": 0, "z": 0}, "length": [61], "width": [10, 6], "angle": [0], "position": [0, 0, 0, 50], "texture": 63, "bump": {"position": 10, "size": 20}}}, "typespec": {"name": "Side-Interceptor", "level": 4, "model": 5, "code": 405, "next":[507,508], "specs": {"shield": {"capacity": [175, 225], "reload": [3, 6]}, "generator": {"capacity": [100, 150], "reload": [30, 40]}, "ship": {"mass": 140, "speed": [95, 125], "rotation": [50, 100], "acceleration": [110, 140]}}, "shape": [0.962, 0.973, 0.948, 0.951, 3.427, 3.044, 2.657, 2.383, 2.207, 2.233, 2.2, 2.147, 2.096, 2.096, 2.147, 2.2, 2.233, 2.37, 2.4, 1.63, 1.451, 1.323, 1.061, 1.009, 0.977, 0.962, 0.977, 1.009, 1.061, 1.323, 1.451, 1.63, 2.4, 2.37, 2.233, 2.2, 2.147, 2.096, 2.096, 2.147, 2.2, 2.233, 2.207, 2.383, 2.657, 3.044, 3.427, 0.951, 0.948, 0.973], "lasers": [{"x": 1.92, "y": -0.96, "z": 0, "angle": 0, "damage": [5, 7], "rate": 7, "type": 1, "speed": [125, 225], "number": 1, "spread": 0, "error": 5, "recoil": 0}, {"x": -1.92, "y": -0.96, "z": 0, "angle": 0, "damage": [5, 7], "rate": 7, "type": 1, "speed": [125, 225], "number": 1, "spread": 0, "error": 5, "recoil": 0}], "radius": 3.427}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 6 } },
                    ABBREVIATION: 'S-INT'
                },
                '406': {
                    SHIP: '{"name": "Pioneer", "level": 4, "model": 6,"code":406,"next":[508,509], "size": 1.6, "specs": {"shield": {"capacity": [175, 230], "reload": [4, 7]}, "generator": {"capacity": [50, 100], "reload": [25, 30]}, "ship": {"mass": 280, "speed": [90, 120], "rotation": [40, 80], "acceleration": [50, 100]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-100, -60, -10, 0, 20, 50, 80, 100, 90], "z": [-10, -5, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [5, 50, 50, 30, 40, 50, 50, 20, 0], "height": [5, 20, 20, 20, 30, 30, 20, 10, 0], "texture": [2, 10, 2, 4, 11, 11, 63, 12], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -40, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-30, -20, 0, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 10, 15, 10, 0], "height": [0, 18, 25, 18, 0], "texture": [9], "propeller": false}, "cannons": {"section_segments": 12, "offset": {"x": 30, "y": -70, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [-30, -20, 0, 20, 30], "z": [0, 0, 0, 0, 0]}, "width": [3, 5, 5, 5, 3], "height": [3, 5, 15, 15, 3], "texture": [6, 4, 4, 6], "angle": 0, "laser": {"damage": [6, 11], "rate": 3, "type": 1, "speed": [120, 180], "number": 1, "error": 0}}, "shield": {"section_segments": 12, "offset": {"x": 60, "y": -40, "z": 0}, "position": {"x": [0, 5, 3, 5, 0, 0], "y": [-30, -20, 0, 20, 30, 20], "z": [0, 0, 0, 0, 0, 0]}, "width": [5, 10, 10, 10, 5, 0], "height": [5, 25, 30, 25, 5, 0], "propeller": true, "texture": 4, "angle": 0}, "shield2": {"section_segments": 12, "offset": {"x": 60, "y": 60, "z": 0}, "position": {"x": [0, 5, 3, 5, 0, 0], "y": [-30, -20, 0, 20, 30, 20], "z": [0, 0, 0, 0, 0, 0]}, "width": [5, 10, 10, 10, 5, 0], "height": [5, 25, 30, 25, 5, 0], "propeller": true, "texture": 4, "angle": 0}}, "wings": {"join": {"offset": {"x": 40, "y": -40, "z": 0}, "length": [31], "width": [40, 20], "angle": [0], "position": [0, 0, 0, 50], "texture": [63], "bump": {"position": 0, "size": 10}}, "join2": {"offset": {"x": 40, "y": 60, "z": 0}, "length": [31], "width": [40, 20], "angle": [0], "position": [0, 0, 0, 50], "texture": [63], "bump": {"position": 0, "size": 10}}}, "typespec": {"name": "Pioneer", "level": 4, "model": 6, "code": 406,"next":[508,509], "specs": {"shield": {"capacity": [175, 230], "reload": [4, 7]}, "generator": {"capacity": [50, 100], "reload": [25, 30]}, "ship": {"mass": 280, "speed": [90, 120], "rotation": [40, 80], "acceleration": [50, 100]}}, "shape": [3.204, 3.168, 3.365, 3.37, 2.625, 2.907, 3.057, 3.073, 2.942, 2.664, 2.548, 2.441, 1.29, 1.032, 1.136, 1.287, 2.732, 2.911, 3.245, 3.523, 3.553, 3.411, 3.132, 3.263, 3.258, 3.206, 3.258, 3.263, 3.132, 3.411, 3.553, 3.523, 3.245, 2.911, 2.732, 1.287, 1.136, 1.032, 1.29, 2.441, 2.548, 2.664, 2.942, 3.073, 3.057, 2.907, 2.625, 3.37, 3.365, 3.168], "lasers": [{"x": 0.96, "y": -3.2, "z": 0, "angle": 0, "damage": [6, 11], "rate": 3, "type": 1, "speed": [120, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.96, "y": -3.2, "z": 0, "angle": 0, "damage": [6, 11], "rate": 3, "type": 1, "speed": [120, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.553}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 4, y: 6 } },
                    ABBREVIATION: 'PION'
                }
            },
            '5': {
                '501': {
                    SHIP: '{"name": "Khepri", "level": 5, "model": 1, "code":501, "next":[601,602], "size": 1.5, "specs": {"shield": {"capacity": [150, 250], "reload": [5, 7]}, "generator": {"capacity": [60, 90], "reload": [21, 43]}, "ship": {"mass": 240, "speed": [85, 105], "rotation": [35, 65], "acceleration": [130, 170]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -30, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-85, -80, -85, -60, -35, -4, 38, 53, 86, 125, 120], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7, 9, 17, 22, 25, 27, 29, 25, 22, 0], "height": [0, 7, 8, 13, 23, 26, 26, 24, 22, 17, 0], "texture": [17, 4, 13, 63, 4, 10, 63, 4, 12, 17], "propeller": true, "laser": {"damage": [20, 30], "rate": 10, "type": 1, "speed": [150, 200], "number": 1, "error": 3}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 30, "z": 19}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-95, -63, -31, -16, -4, -5], "z": [-6, 1, 0, -3, -3, 0]}, "width": [11, 14, 13, 10, 3, 0], "height": [10, 12, 16, 17, 16, 0], "texture": [9, 9, 63, 3, 63], "propeller": false}, "Thrusters": {"section_segments": 12, "offset": {"x": 27, "y": 20, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-65, -50, -25, -8, 40, 60, 50], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 7, 8, 8, 7, 0], "height": [0, 5, 9, 12, 8, 9, 0], "texture": [4, 63, 4, 18, 13, 12], "propeller": true, "angle": 0}}, "wings": {"wing0": {"doubleside": true, "length": [16, 20, 0, 32], "width": [98, 87, 77, 113, 3], "angle": [-1, -5, -5, -6], "position": [-19, 35, 50, 50, -10], "offset": {"x": 23, "y": 25, "z": 3}, "bump": {"position": 40, "size": 7}, "texture": [3, 4, 13, 63]}, "wing1": {"doubleside": true, "length": [2, 35], "width": [77, 53, 17], "angle": [10, 0, 11], "position": [25, 25, -10], "offset": {"x": 25, "y": 0, "z": -8}, "bump": {"position": 0, "size": 5}, "texture": [13, 13]}, "winglets": {"offset": {"x": 0, "y": 33, "z": 22}, "length": [9, 18], "width": [15, 25, 80], "angle": [0, -20], "position": [0, -5, 30], "texture": [4, 63], "bump": {"position": 10, "size": 30}}, "winglets2": {"offset": {"x": 0, "y": 33, "z": 22}, "length": [9, 13], "width": [15, 25, 120], "angle": [90, 90, 0], "position": [0, -5, 50], "texture": [4, 63], "bump": {"position": 10, "size": 30}}}, "typespec": {"name": "Khepri", "level": 5, "model": 1, "code":501, "next":[601,602], "specs": {"shield": {"capacity": [175, 250], "reload": [5, 7]}, "generator": {"capacity": [60, 90], "reload": [21, 43]}, "ship": {"mass": 240, "speed": [85, 105], "rotation": [40, 70], "acceleration": [130, 170]}}, "shape": [3.457, 3.461, 2.734, 2.099, 1.652, 1.541, 1.408, 1.316, 1.204, 1.127, 1.94, 1.918, 1.874, 1.828, 2.767, 2.771, 2.83, 2.933, 3.106, 3.347, 3.702, 4.214, 4.323, 3.167, 2.901, 4.259, 2.901, 3.167, 4.323, 4.214, 3.702, 3.347, 3.106, 2.933, 2.83, 2.771, 2.767, 1.828, 1.874, 1.918, 1.94, 1.127, 1.204, 1.316, 1.408, 1.541, 1.652, 2.099, 2.734, 3.461], "lasers": [{"x": 0, "y": -3.45, "z": 0, "angle": 0, "damage": [20, 30], "rate": 10, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 7, "recoil": 75}], "radius": 4.323}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 4, y: 6 } },
                    ABBREVIATION: 'KHEP'
                },
                '502': {
                    SHIP: '{"name": "U-Sniper", "level": 5, "model": 2, "code":502, "next":[602,603], "size": 1.8, "specs": {"shield": {"capacity": [200, 300], "reload": [4, 6]}, "generator": {"capacity": [80, 160], "reload": [40, 60]}, "ship": {"mass": 200, "speed": [70, 90], "rotation": [50, 70], "acceleration": [60, 110]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [0, -10, 40, 100, 90, 100], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 23, 10, 0], "height": [0, 5, 23, 10, 0], "texture": [12, 1, 10, 12], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 30}, "position": {"x": [0, 0, 0, 0], "y": [20, 40, 80], "z": [-4, 0, -6]}, "width": [5, 10, 5], "height": [0, 8, 0], "texture": [9]}, "uwings": {"section_segments": 8, "offset": {"x": 50, "y": -20, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-90, -100, 40, 80, 90, 100], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 25, 20, 0], "height": [0, 5, 25, 20, 0], "texture": [12, 2, 3, 4]}, "cannons": {"section_segments": 12, "offset": {"x": 70, "y": 20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-60, -70, -20, 0, 20, 50, 45], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 6, 10, 15, 5, 0], "height": [0, 5, 5, 10, 10, 5, 0], "angle": 0, "laser": {"damage": [40, 60], "rate": 2, "type": 2, "speed": [190, 240], "recoil": 200, "number": 1, "error": 0}, "propeller": false, "texture": [4, 4, 10, 4, 63, 4]}, "side_propulsors": {"section_segments": 10, "offset": {"x": 30, "y": 30, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [0, 10, 13, 25, 30, 40, 60, 50], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 5, 5, 10, 5, 0], "height": [0, 5, 10, 10, 10, 5, 5, 10, 5, 0], "propeller": true, "texture": [5, 2, 11, 2, 63, 11, 12]}}, "typespec": {"name": "U-Sniper", "level": 5, "model": 2, "code": 502,"next":[602, 603], "specs": {"shield": {"capacity": [250, 350], "reload": [4, 6]}, "generator": {"capacity": [80, 160], "reload": [40, 60]}, "ship": {"mass": 220, "speed": [70, 90], "rotation": [55, 75], "acceleration": [70, 120]}}, "shape": [0.361, 0.366, 0.378, 4.774, 4.83, 4.17, 3.608, 3.248, 3.245, 3.083, 2.915, 2.807, 2.751, 2.829, 2.976, 3.22, 3.412, 3.521, 3.693, 3.681, 3.138, 2.937, 3.473, 3.407, 3.618, 3.607, 3.618, 3.407, 3.473, 2.937, 3.138, 3.681, 3.693, 3.521, 3.412, 3.22, 2.976, 2.829, 2.751, 2.807, 2.915, 3.083, 3.245, 3.248, 3.608, 4.17, 4.83, 4.774, 0.378, 0.366], "lasers": [{"x": 2.52, "y": -1.8, "z": 0, "angle": 0, "damage": [40, 60], "rate": 2, "type": 2, "speed": [210, 260], "number": 1, "spread": 0, "error": 0, "recoil": 220}, {"x": -2.52, "y": -1.8, "z": 0, "angle": 0, "damage": [40, 60], "rate": 2, "type": 2, "speed": [210, 240], "number": 1, "spread": 0, "error": 0, "recoil": 220}], "radius": 4.83}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 7 } },
                    ABBREVIATION: 'U-SNI'
                },
                '503': {
                    SHIP: '{"name": "Toscain", "level": 5, "model": 3, "code":503, "next":[604,605], "size": 1.7, "zoom": 1.08, "specs": {"shield": {"capacity": [275, 350], "reload": [5, 8]}, "generator": {"capacity": [75, 100], "reload": [32, 45]}, "ship": {"mass": 320, "speed": [70, 90], "rotation": [50, 75], "acceleration": [80, 110]}}, "bodies": {"front": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [-100, -95, -25, 0, 25], "z": [0, 0, 0, 0, 0]}, "width": [0, 20, 40, 40, 20], "height": [0, 10, 35, 20, 5], "texture": [63, 11, 2, 63], "laser": {"damage": [25, 45], "rate": 1, "type": 2, "speed": [200, 275], "number": 1, "recoil": 50, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0], "y": [-70, -70, -25, 0, 100], "z": [0, 0, 0, 0, 10]}, "width": [0, 10, 15, 15, 10], "height": [0, 15, 35, 20, 0], "texture": [9, 9, 9, 4]}, "lasers": {"section_segments": 8, "angle": 15, "offset": {"x": 1, "y": -5, "z": -3}, "position": {"x": [0, 0, 0], "y": [-90, -70, -100], "z": [0, 0, 0]}, "width": [5, 5, 0], "height": [5, 5, 0], "texture": [6], "laser": {"damage": [4, 6], "rate": 2, "type": 1, "speed": [100, 130], "number": 2, "angle": 35, "error": 0}}, "motor": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [10, 20, 30, 100, 95], "z": [0, 0, 0, 0, 0]}, "width": [0, 40, 50, 50, 0], "height": [0, 10, 15, 20, 0], "texture": [63, 63, 10, 4]}, "propulsors": {"section_segments": 8, "offset": {"x": 25, "y": 0, "z": 0}, "position": {"x": [0, 0, 0], "y": [30, 105, 100], "z": [0, 0, 0]}, "width": [15, 15, 0], "height": [10, 10, 0], "propeller": true, "texture": [12]}}, "wings": {"main": {"doubleside": true, "offset": {"x": 30, "y": 80, "z": 0}, "length": [70, 20], "width": [80, 20], "angle": [0, 0], "position": [-20, 0], "texture": [11], "bump": {"position": 20, "size": 10}}, "winglets": {"doubleside": true, "offset": {"x": 98, "y": 81, "z": -20}, "length": [20, 50, 20], "width": [20, 35, 20], "angle": [90, 90, 90], "position": [0, 0, 0, 0], "texture": [63], "bump": {"position": 30, "size": 50}}}, "typespec": {"name": "Toscain", "level": 5, "model": 3, "code":503, "next":[604,605], "zoom": 1.08, "specs": {"shield": {"capacity": [275, 350], "reload": [5, 8]}, "generator": {"capacity": [75, 100], "reload": [35, 53]}, "ship": {"mass": 280, "speed": [70, 100], "rotation": [55, 80], "acceleration": [85, 115]}}, "shape": [3.4, 3.354, 3.556, 2.748, 2.336, 2.055, 1.858, 1.732, 1.634, 1.548, 1.462, 1.404, 1.371, 1.36, 1.241, 1.161, 1.723, 4.485, 5.01, 4.795, 4.111, 3.842, 3.82, 3.753, 3.634, 3.407, 3.634, 3.753, 3.82, 3.842, 4.111, 4.795, 5.01, 4.485, 1.723, 1.161, 1.241, 1.353, 1.371, 1.404, 1.462, 1.548, 1.634, 1.732, 1.858, 2.055, 2.336, 2.748, 3.556, 3.354], "lasers": [{"x": 0, "y": -3.4, "z": 0, "angle": 0, "damage": [30, 50], "rate": 1, "type": 2, "speed": [190, 220], "number": 1, "spread": 0, "error": 0, "recoil": 50}, {"x": -0.846, "y": -3.454, "z": -0.102, "angle": 15, "damage": [4, 6], "rate": 2, "type": 1, "speed": [100, 130], "number": 2, "spread": 35, "error": 0, "recoil": 0}, {"x": 0.846, "y": -3.454, "z": -0.102, "angle": -15, "damage": [4, 6], "rate": 2, "type": 1, "speed": [100, 130], "number": 2, "spread": 35, "error": 0, "recoil": 0}], "radius": 5.01}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 7 } },
                    ABBREVIATION: 'TOSC'
                },
                '504': {
                    SHIP: '{"name": "FuryStar", "level": 5, "model": 4, "code":504, "next":[605,606],  "size": 1.5, "zoom": 1.08, "specs": {"shield": {"capacity": [200, 275], "reload": [6, 7]}, "generator": {"capacity": [100, 150], "reload": [30, 45]}, "ship": {"mass": 260, "speed": [80, 110], "rotation": [120, 180], "acceleration": [150, 180]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-50, -45, 0, 10, 15, 35, 55, 40], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 20, 25, 17, 25, 20, 15, 0], "height": [0, 15, 15, 15, 20, 20, 15, 0], "texture": [1, 4, 63, 4, 2, 12, 17], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -43, "z": 5}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, -4, 10], "z": [-5, 0, 0]}, "width": [1, 18, 20], "height": [1, 15, 10], "texture": [9]}, "missiles": {"section_segments": 12, "offset": {"x": 35, "y": -5, "z": 10}, "position": {"x": [0, 0, 0, 0, 0], "y": [-30, -23, 0, 23, 30], "z": [0, 0, 0, 0, 0]}, "width": [0, 5, 5, 5, 0], "height": [0, 5, 5, 5, 0], "texture": [6, 4, 4, 10], "angle": 0, "laser": {"damage": [1, 2], "rate": 4, "type": 1, "speed": [100, 125], "number": 1, "error": 0}}, "cannon": {"section_segments": 6, "offset": {"x": 15, "y": -10, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-40, -50, -20, 0, 20, 30], "z": [0, 0, 0, 0, 0, 20]}, "width": [0, 5, 8, 11, 7, 0], "height": [0, 5, 8, 11, 10, 0], "angle": 0, "laser": {"damage": [14, 20], "rate": 2, "type": 1, "speed": [200, 250], "number": 1, "error": 0}, "propeller": false, "texture": [3, 3, 10, 3]}, "top_propulsors": {"section_segments": 10, "offset": {"x": 75, "y": 45, "z": 40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "propeller": true, "texture": [4, 4, 2, 2, 5, 63, 5, 63, 17]}, "bottom_propulsors": {"section_segments": 10, "offset": {"x": 100, "y": 0, "z": -40}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "propeller": true, "texture": [4, 4, 2, 2, 5, 63, 5, 4, 17]}}, "wings": {"rooftop": {"doubleside": true, "offset": {"x": 0, "y": -20, "z": 20}, "length": [20, 15, 25, 25, 5], "width": [50, 40, 35, 35, 35, 30], "angle": [0, -20, 30, 30, 30], "position": [0, 10, 20, 50, 80, 100], "texture": [8, 63, 3, 3], "bump": {"position": -40, "size": 5}}, "bottom": {"doubleside": true, "offset": {"x": 10, "y": -20, "z": 0}, "length": [30, 30, 30], "width": [60, 50, 50, 50], "angle": [-27, -27, -27], "position": [0, 10, 30, 40], "texture": [1], "bump": {"position": -40, "size": 5}}, "topwinglets": {"doubleside": true, "offset": {"x": 80, "y": 87, "z": 45}, "length": [20], "width": [40, 30], "angle": [60], "position": [0, 50], "texture": [63], "bump": {"position": 10, "size": 10}}, "bottomwinglets": {"doubleside": true, "offset": {"x": 100, "y": 50, "z": -45}, "length": [20], "width": [40, 30], "angle": [-60], "position": [0, 50], "texture": [4], "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "FuryStar", "level": 5, "model": 4, "code": 504, "zoom": 1.08, "next":[605,606], "specs": {"shield": {"capacity": [200, 275], "reload": [6, 7]}, "generator": {"capacity": [100, 150], "reload": [27, 42]}, "ship": {"mass": 240, "speed": [75, 105], "rotation": [110, 160], "acceleration": [150, 175]}}, "shape": [1.59, 1.832, 1.891, 1.874, 1.458, 1.479, 1.524, 1.571, 1.645, 1.757, 1.925, 3.322, 3.427, 3.455, 3.48, 3.666, 3.822, 4.057, 4.521, 4.774, 5.039, 5.299, 1.577, 1.71, 1.679, 1.653, 1.679, 1.71, 1.577, 5.299, 5.039, 4.774, 4.521, 4.057, 3.822, 3.666, 3.48, 3.455, 3.428, 3.322, 1.925, 1.757, 1.645, 1.571, 1.524, 1.479, 1.458, 1.874, 1.891, 1.832], "lasers": [{"x": 1.05, "y": -1.05, "z": 0.3, "angle": 0, "damage": [1, 2], "rate": 4, "type": 1, "speed": [100, 125], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.05, "y": -1.05, "z": 0.3, "angle": 0, "damage": [1, 2], "rate": 4, "type": 1, "speed": [100, 125], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.45, "y": -1.8, "z": -0.45, "angle": 0, "damage": [14, 20], "rate": 2, "type": 1, "speed": [200, 250], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.45, "y": -1.8, "z": -0.45, "angle": 0, "damage": [14, 20], "rate": 2, "type": 1, "speed": [200, 250], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 5.299}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 7, y: 6 } },
                    ABBREVIATION: 'FURY'
                },
                '505': {
                    SHIP: '{"name": "T-Warrior", "level": 5, "model": 5, "code":505, "next":[606,607],"size": 1.6, "specs": {"shield": {"capacity": [225, 325], "reload": [4, 7]}, "generator": {"capacity": [80, 140], "reload": [35, 50]}, "ship": {"mass": 280, "speed": [90, 110], "rotation": [50, 80], "acceleration": [90, 120]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-95, -100, -98, -70, 0, 90, 91], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 6, 20, 30, 20, 3], "height": [0, 2, 4, 20, 30, 25, 3], "texture": [12, 5, 63, 1, 10, 12]}, "cannon": {"section_segments": 6, "offset": {"x": 0, "y": -45, "z": -15}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-40, -50, -20, 0, 20, 30], "z": [0, 0, 0, 0, 0, 20]}, "width": [0, 5, 8, 11, 7, 0], "height": [0, 5, 8, 11, 10, 0], "angle": 0, "laser": {"damage": [7, 12], "rate": 5, "type": 1, "speed": [130, 160], "number": 5, "angle": 30, "error": 0}, "propeller": false, "texture": [3, 3, 10, 3]}, "back": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0], "y": [90, 95, 95], "z": [0, 0, 0]}, "width": [15, 18, 2], "height": [18, 23, 2], "texture": [63]}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-50, -40, -25, 0, 5], "z": [0, 0, 0, 0, 9, 9]}, "width": [0, 10, 15, 10, 0], "height": [0, 10, 15, 16, 0], "texture": [9]}, "top_propulsor": {"section_segments": 10, "offset": {"x": 0, "y": 30, "z": 60}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "height": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "texture": [4, 63, 1, 1, 1, 63, 1, 1, 12], "propeller": true}, "side_propulsors": {"section_segments": 10, "offset": {"x": 80, "y": 30, "z": -30}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 100, 90], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "height": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "texture": [4, 63, 1, 1, 1, 63, 1, 1, 12], "propeller": true}}, "wings": {"top_join": {"offset": {"x": 0, "y": 50, "z": 0}, "length": [60], "width": [70, 30], "angle": [90], "position": [0, 0, 0, 50], "texture": [11], "bump": {"position": 10, "size": 20}}, "side_joins": {"offset": {"x": 0, "y": 50, "z": 0}, "length": [80], "width": [70, 30], "angle": [-20], "position": [0, 0, 0, 50], "texture": [11], "bump": {"position": 10, "size": 20}}}, "typespec": {"name": "T-Warrior", "level": 5, "model": 5, "code":505, "next":[606,607], "specs": {"shield": {"capacity": [225, 325], "reload": [4, 7]}, "generator": {"capacity": [80, 140], "reload": [35, 50]}, "ship": {"mass": 280, "speed": [85, 105], "rotation": [50, 80], "acceleration": [90, 120]}}, "shape": [3.204, 3.125, 2.591, 2.145, 1.713, 1.46, 1.282, 1.155, 1.073, 1.009, 0.977, 0.955, 0.957, 2.594, 3.217, 3.408, 3.55, 3.898, 4.204, 4.633, 5.051, 4.926, 2.67, 2.95, 4.171, 4.168, 4.171, 2.95, 2.67, 4.926, 5.051, 4.633, 4.204, 3.898, 3.55, 3.408, 3.217, 2.594, 0.96, 0.955, 0.977, 1.009, 1.073, 1.155, 1.282, 1.46, 1.713, 2.145, 2.591, 3.125], "lasers": [{"x": 0, "y": -3.04, "z": -0.48, "angle": 0, "damage": [7, 12], "rate": 5, "type": 1, "speed": [130, 160], "number": 5, "spread": 30, "error": 0, "recoil": 0}], "radius": 5.051}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 7 } },
                    ABBREVIATION: 'T-WAR'
                },
                '506': {
                    SHIP: '{"name": "Aetos", "level": 5, "model": 6, "code":506, "next":[607,608], "size": 1.5, "zoom": 0.96, "specs": {"shield": {"capacity": [200, 300], "reload": [5, 7]}, "generator": {"capacity": [80, 140], "reload": [35, 47]}, "ship": {"mass": 175, "speed": [90, 120], "rotation": [70, 90], "acceleration": [110, 130]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-100, -99, -98, -50, 0, 100, 80], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 6, 17, 28, 20, 0], "height": [0, 2, 4, 15, 25, 25, 0], "texture": [4, 6, 10, 10, 11, 12], "propeller": true, "laser": {"damage": [6, 11], "rate": 5, "type": 1, "speed": [140, 200], "number": 1, "angle": 0, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -60, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-10, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 0], "height": [0, 5, 10, 12, 0], "texture": [9]}, "lasers": {"section_segments": 8, "offset": {"x": 81, "y": -15, "z": -30}, "position": {"x": [0, 0, 0, 0, 0], "y": [25, 70, 10, 80, 90], "z": [0, 0, 0, 0, 0]}, "width": [5, 0, 0, 5, 0], "height": [5, 5, 0, 5, 0], "texture": [63, 63, 6], "angle": 2, "laser": {"damage": [6, 11], "rate": 5, "type": 1, "speed": [120, 180], "number": 1, "angle": 0, "error": 0}}}, "wings": {"top": {"doubleside": true, "offset": {"x": 15, "y": 40, "z": 0}, "length": [50], "width": [70, 30], "angle": [70], "position": [0, 30], "texture": [63], "bump": {"position": 10, "size": 10}}, "main": {"doubleside": true, "offset": {"x": 0, "y": 25, "z": 15}, "length": [90, 40], "width": [70, 50, 30], "angle": [-30, -40], "position": [30, 20, -20], "texture": [8, 63], "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "Aetos", "level": 5, "model": 6, "zoom": 0.96, "code":506, "next":[607,608], "specs": {"shield": {"capacity": [200, 300], "reload": [5, 7]}, "generator": {"capacity": [80, 140], "reload": [45, 55]}, "ship": {"mass": 250, "speed": [90, 110], "rotation": [70, 90], "acceleration": [110, 120]}}, "shape": [3, 2.917, 2.069, 1.61, 1.343, 1.158, 1.037, 0.95, 0.895, 0.853, 0.83, 0.824, 3.271, 3.283, 3.312, 3.232, 3.135, 3.283, 3.38, 3.09, 2.882, 2.75, 2.726, 3.059, 3.054, 3.006, 3.054, 3.059, 2.726, 2.75, 2.882, 3.09, 3.38, 3.283, 3.135, 3.232, 3.312, 3.283, 3.271, 0.824, 0.83, 0.853, 0.895, 0.95, 1.037, 1.158, 1.343, 1.61, 2.069, 2.917], "lasers": [{"x": 0, "y": -3, "z": 0, "angle": 0, "damage": [6, 11], "rate": 5, "type": 1, "speed": [140, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.44, "y": -0.15, "z": -0.9, "angle": 2, "damage": [6, 11], "rate": 5, "type": 1, "speed": [120, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.44, "y": -0.15, "z": -0.9, "angle": -2, "damage": [6, 11], "rate": 5, "type": 1, "speed": [120, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.38}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 7 } },
                    ABBREVIATION: 'AETOS'
                },
                '507': {
                    SHIP: '{"name": "Shadow X-2", "level": 5, "model": 7, "code":507, "next":[608,609],"size": 1.3, "specs": {"shield": {"capacity": [150, 220], "reload": [5, 7]}, "generator": {"capacity": [80, 145], "reload": [20, 34]}, "ship": {"mass": 150, "speed": [110, 145], "rotation": [35, 55], "acceleration": [90, 130]}}, "bodies": {"main": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-100, -98, -95, -70, -40, 0, 40, 70, 80, 90, 100], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 20, 30, 20, 20, 30, 30, 30, 20, 0], "height": [0, 4, 4, 20, 20, 10, 10, 15, 15, 15, 10, 10], "texture": [12, 5, 63, 4, 4, 3, 4, 4, 5]}, "thrusters": {"section_segments": 10, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0], "y": [90, 95, 100, 105, 90], "z": [0, 0, 0, 0, 0]}, "width": [10, 15, 18, 19, 2], "height": [3, 5, 7, 8, 2], "texture": [63], "propeller": true}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -25, "z": 12}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-45, -40, -25, 0, 5], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 5, 0], "height": [0, 10, 15, 5, 0], "texture": [9]}, "laser": {"section_segments": 10, "offset": {"x": 50, "y": 10, "z": -13}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-30, -25, 0, 10, 20, 25, 30, 40, 70, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 10, 15, 10, 0], "height": [0, 10, 15, 15, 15, 10, 10, 15, 5, 0], "texture": [6, 4, 10, 3, 4, 3, 2], "propeller": true, "laser": {"damage": [5, 7], "rate": 10, "type": 1, "speed": [160, 190], "number": 1}}}, "wings": {"top": {"doubleside": true, "offset": {"x": 10, "y": 60, "z": 5}, "length": [30], "width": [50, 30], "angle": [60], "position": [0, 50], "texture": [3], "bump": {"position": 10, "size": 10}}, "side": {"doubleside": true, "offset": {"x": 10, "y": 70, "z": 5}, "length": [30], "width": [40, 20], "angle": [-13], "position": [0, 60], "texture": [63], "bump": {"position": 10, "size": 10}}, "wings": {"offset": {"x": 0, "y": 35, "z": 0}, "length": [80], "width": [100, 70], "angle": [0], "position": [-80, 50], "texture": [4], "bump": {"position": 10, "size": 15}}}, "typespec": {"name": "Shadow X-2", "level": 5, "model": 7, "code":507, "next":[608,609], "specs": {"shield": {"capacity": [170, 240], "reload": [5, 7]}, "generator": {"capacity": [80, 145], "reload": [20, 34]}, "ship": {"mass": 200, "speed": [110, 145], "rotation": [35, 55], "acceleration": [90, 130]}}, "shape": [2.6, 2.53, 2.111, 1.751, 1.503, 1.341, 1.272, 1.223, 1.201, 1.404, 1.587, 1.596, 1.62, 1.674, 1.725, 1.848, 2.231, 2.565, 2.842, 3.253, 3.735, 2.463, 3.297, 3.78, 3.139, 2.735, 3.139, 3.78, 3.297, 2.463, 3.735, 3.253, 2.842, 2.565, 2.231, 1.848, 1.725, 1.674, 1.621, 1.596, 1.587, 1.404, 1.201, 1.223, 1.272, 1.341, 1.503, 1.751, 2.111, 2.53], "lasers": [{"x": 1.3, "y": -0.52, "z": -0.338, "angle": 0, "damage": [5, 7], "rate": 10, "type": 1, "speed": [160, 190], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.3, "y": -0.52, "z": -0.338, "angle": 0, "damage": [5, 7], "rate": 10, "type": 1, "speed": [160, 190], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.78}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 4, y: 5 } },
                    ABBREVIATION: 'X2'
                },
                '508': {
                    SHIP: '{"name": "Howler", "level": 5, "model": 8, "code":508, "next":[610,611],"size": 1.4, "zoom": 1, "specs": {"shield": {"capacity": [275, 340], "reload": [5, 7]}, "generator": {"capacity": [80, 110], "reload": [35, 53]}, "ship": {"mass": 300, "speed": [85, 100], "rotation": [70, 95], "acceleration": [90, 120]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-145, -135, -125, -130, -100, -55, 5, 60, 85, 120, 118], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 5, 8, 20, 30, 35, 35, 30, 22, 0], "height": [0, 5, 5, 8, 15, 20, 33, 30, 30, 22, 0], "texture": [17, 4, 13, 3, 2, 1, 10, 31, 12, 17], "propeller": true, "laser": {"damage": [3, 5], "rate": 6, "speed": [160, 210], "number": 2, "recoil": 0, "type": 1}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -80, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -16, 30, 60], "z": [-4, -4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 16, 12], "height": [0, 4, 16, 12], "texture": [2, 9, 31]}, "front1": {"section_segments": 8, "offset": {"x": 22, "y": -125, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, -5], "y": [-22.5, -12, -4.5, -7.5, 22.5, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 4.5, 4.5, 6, 12, 9], "height": [0, 4.5, 4.5, 6, 12, 9], "texture": [17, 4, 3], "laser": {"damage": [11, 20], "rate": 1, "speed": [150, 200], "number": 1, "recoil": 25, "type": 2}}, "front2": {"section_segments": 10, "offset": {"x": 32, "y": -95, "z": 0}, "position": {"x": [-4, -4, 0, -1], "y": [0, -12, 22.5, 60], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 7.5, 12, 9], "height": [0, 12, 18, 15], "texture": [13, 2, 63], "angle": 0}, "propulsors": {"section_segments": 8, "offset": {"x": 40, "y": 30, "z": -5}, "position": {"x": [-12, -12, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-90, -100, -60, 20, 50, 48], "z": [5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 3.6, 12, 24, 14.4, 0], "height": [0, 3.6, 15.6, 24, 14.4, 0], "texture": [4, 31, 10, 13, 17], "propeller": true}, "uwing": {"section_segments": [0, 60, 120, 180], "offset": {"x": -20, "y": -30, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-65, -70, 40, 80, 110], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 5, 25, 25, 0], "height": [0, 10, 25, 25, 20], "texture": [4]}}, "wings": {"main": {"doubleside": true, "offset": {"x": 20, "y": -20, "z": 5}, "length": [89, 0], "width": [130, 60], "angle": [-12, -12], "position": [0, 80, 80], "texture": 18, "bump": {"position": 20, "size": 5}}, "sides": {"doubleside": true, "offset": {"x": 20, "y": -20, "z": 10}, "length": [84, -3, 5, 12, -5], "width": [25, 25, 140, 140, 50, 50], "angle": [-12, 5, 5, 5, 5], "position": [40, 85, 55, 55, 70, 70], "texture": [63, 4, 63, 4, 17], "bump": {"position": 35, "size": 15}}}, "typespec": {"name": "Howler", "level": 5, "model": 8, "code":508, "next":[610,611], "specs": {"shield": {"capacity": [275, 340], "reload": [5, 7]}, "generator": {"capacity": [80, 110], "reload": [32, 50]}, "ship": {"mass": 320, "speed": [77, 102], "rotation": [70, 95], "acceleration": [80, 110]}}, "shape": [4.62, 4.176, 3.92, 3.153, 2.641, 2.233, 1.931, 1.892, 1.901, 1.948, 3.077, 3.059, 3.111, 3.216, 3.358, 3.503, 3.728, 3.918, 4.079, 4.141, 2.709, 2.652, 2.475, 2.867, 2.85, 2.805, 2.85, 2.867, 2.475, 2.652, 2.709, 4.141, 4.079, 3.918, 3.728, 3.503, 3.358, 3.216, 3.111, 3.059, 3.077, 1.948, 1.901, 1.892, 1.931, 2.233, 2.641, 3.153, 3.92, 4.176], "lasers": [{"x": 0, "y": -4.62, "z": 0, "angle": 0, "damage": [2, 4], "rate": 6, "type": 1, "speed": [160, 210], "number": 2, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.616, "y": -4.13, "z": 0, "angle": 0, "damage": [11, 16], "rate": 1, "type": 2, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 25}, {"x": -0.616, "y": -4.13, "z": 0, "angle": 0, "damage": [11, 16], "rate": 1, "type": 2, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 25}], "radius": 4.62}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 5, y: 7 } },
                    ABBREVIATION: 'HOWL'
                },
                '509': {
                    SHIP: '{"name":"Bat-Defender","level":5,"model":9,"code":509, "next":[611,612],"size":1.8,"specs":{"shield":{"capacity":[300,400],"reload":[7,10]},"generator":{"capacity":[70,100],"reload":[25,35]},"ship":{"mass":400,"speed":[70,90],"rotation":[40,70],"acceleration":[80,90]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-99,-100,-97,-45,-40,-25,-23,15,20,55,50],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,5,30,17,27,25,25,27,15,5],"height":[0,2,2,25,27,27,25,25,27,20,0],"texture":[6,5,1,4,6,4,63,6,2,12]},"propulsors":{"section_segments":8,"offset":{"x":30,"y":-20,"z":0},"position":{"x":[-5,-2,0,0,0,0,0,0,0,0,0],"y":[30,55,60,80,95,100,90,95],"z":[0,0,0,0,0,0,0,0]},"width":[12,14,14,10,12,10,0],"height":[5,14,14,10,12,10,0],"texture":[2,6,4,11,6,12],"propeller":true},"lasers":{"section_segments":8,"offset":{"x":70,"y":-40,"z":10},"position":{"x":[0,0,0,0,0],"y":[25,90,10,50,60],"z":[0,0,0,0,0]},"width":[5,5,0,10,5],"height":[5,1,0,0,5],"texture":[63,6],"angle":3,"laser":{"damage":[10,15],"rate":2.5,"type":1,"speed":[150,200],"number":1,"error":0},"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-45,"z":8},"position":{"x":[0,0,0,0,0,0],"y":[-50,-40,-25,0,5],"z":[-10,-5,0,0,0]},"width":[0,5,10,10,0],"height":[0,10,15,16,0],"texture":[9]}},"wings":{"wings":{"offset":{"x":20,"y":0,"z":0},"length":[35,15,20,15],"width":[100,50,50,40,45],"angle":[-10,20,0,0],"position":[0,0,10,30,0],"texture":[11,4],"bump":{"position":-20,"size":15}},"side":{"doubleside":true,"offset":{"x":105,"y":30,"z":-30},"length":[30,10,30],"width":[40,60,60,40],"angle":[90,110,110,90],"position":[0,-30,-30,0],"texture":[63],"bump":{"position":0,"size":15}}},"typespec":{"name":"Bat-Defender","level":5,"model":9,"code":509, "next":[611,612],"specs":{"shield":{"capacity":[350,450],"reload":[9,12]},"generator":{"capacity":[70,120],"reload":[30,45]},"ship":{"mass":380,"speed":[65,80],"rotation":[55,75],"acceleration":[80,105]}},"shape":[3.604,3.424,2.813,2.415,2.149,1.968,1.913,1.973,2.073,2.759,3.932,3.974,4.081,4.084,4.04,4.116,4.187,3.661,2.16,2.365,2.719,3.22,3.183,3.028,2.016,1.984,2.016,3.028,3.183,3.22,2.719,2.365,2.16,3.661,4.187,4.116,4.04,4.081,4.084,3.974,3.932,2.759,2.073,1.973,1.913,1.968,2.149,2.415,2.813,3.424],"lasers":[{"x":2.539,"y":-1.08,"z":0.36,"angle":3,"damage":[15,20],"rate":2.5,"type":1,"speed":[175,225],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.539,"y":-1.08,"z":0.36,"angle":-3,"damage":[15,20],"rate":2.5,"type":1,"speed":[175,225],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.187}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 6 } },
                    ABBREVIATION: 'B-DEF'
                }
            },
            '6': {
                '601': {
                    SHIP: '{"name": "Scorpion", "level": 6, "model": 1,"code":601, "next":[701,702],"size": 2, "specs": {"shield": {"capacity": [225, 400], "reload": [5, 7]}, "generator": {"capacity": [80, 175], "reload": [38, 50]}, "ship": {"mass": 450, "speed": [75, 90], "rotation": [50, 70], "acceleration": [80, 100]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-90, -40, -30, 0, 50, 100, 120, 110], "z": [-10, -5, 0, 0, 0, 0, 20, 20]}, "width": [0, 12, 20, 15, 25, 10, 5], "height": [0, 10, 15, 25, 15, 10, 5], "texture": [1, 4, 63, 11, 11, 4], "propeller": false}, "tail": {"section_segments": 14, "offset": {"x": 0, "y": 70, "z": 50}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-70, -25, -10, 20, 40, 50], "z": [0, 0, 0, 0, -10, -20]}, "width": [0, 5, 35, 25, 5, 5], "height": [0, 5, 25, 20, 5, 5], "texture": [6, 4, 63, 10, 4], "laser": {"damage": [50, 100], "rate": 0.9, "type": 2, "speed": [170, 230], "number": 1, "angle": 0, "error": 0, "recoil": 100}}, "cockpit": {"section_segments": 8, "offset": {"x": 13, "y": -44, "z": 12}, "position": {"x": [-5, 0, 0, 0, 0], "y": [-15, -5, 0, 5, 15], "z": [0, 0, 0, 1, 0]}, "width": [0, 8, 10, 8, 0], "height": [0, 5, 5, 5, 0], "texture": [6, 5], "propeller": false}, "deco": {"section_segments": 8, "offset": {"x": 70, "y": 0, "z": -10}, "position": {"x": [0, 0, 0, 10, -5, 0, 0, 0], "y": [-115, -80, -100, -60, -30, -10, 20, 0], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [1, 5, 10, 15, 15, 20, 10, 0], "height": [1, 5, 15, 20, 35, 30, 10, 0], "texture": [6, 6, 1, 1, 11, 2, 12], "laser": {"damage": [2, 3], "rate": 1.8, "type": 1, "speed": [130, 170], "number": 2, "angle": 5, "error": 0}, "propeller": true}, "wingends": {"section_segments": 8, "offset": {"x": 105, "y": -80, "z": -10}, "position": {"x": [0, 2, 4, 2, 0], "y": [-20, -10, 0, 10, 20], "z": [0, 0, 0, 0, 0]}, "width": [2, 3, 6, 3, 2], "height": [5, 15, 22, 17, 5], "texture": 4, "angle": 0, "propeller": false}}, "wings": {"main": {"length": [80, 30], "width": [40, 30, 20], "angle": [-10, 20], "position": [30, -50, -80], "texture": 63, "bump": {"position": 30, "size": 10}, "offset": {"x": 0, "y": 0, "z": 0}}, "font": {"length": [80, 30], "width": [20, 15], "angle": [-10, 20], "position": [-20, -40], "texture": 4, "bump": {"position": 30, "size": 10}, "offset": {"x": 0, "y": 0, "z": 0}}}, "typespec": {"name": "Scorpion", "level": 6, "model": 1, "code": 601,"next":[701, 702], "specs": {"shield": {"capacity": [225, 400], "reload": [5, 7]}, "generator": {"capacity": [80, 175], "reload": [38, 50]}, "ship": {"mass": 450, "speed": [75, 90], "rotation": [50, 70], "acceleration": [80, 100]}}, "shape": [3.6, 2.846, 2.313, 2.192, 5.406, 5.318, 5.843, 5.858, 5.621, 4.134, 3.477, 3.601, 3.622, 3.464, 3.351, 3.217, 1.458, 1.391, 1.368, 1.37, 1.635, 2.973, 3.47, 3.911, 4.481, 4.804, 4.481, 3.911, 3.47, 2.973, 1.635, 1.37, 1.368, 1.391, 1.458, 3.217, 3.351, 3.464, 3.622, 3.601, 3.477, 4.134, 5.621, 5.858, 5.843, 5.318, 5.406, 2.192, 2.313, 2.846], "lasers": [{"x": 0, "y": 0, "z": 2, "angle": 0, "damage": [50, 100], "rate": 0.9, "type": 2, "speed": [180, 230], "number": 1, "spread": 0, "error": 0, "recoil": 100}, {"x": 2.8, "y": -4.6, "z": -0.4, "angle": 0, "damage": [2, 3], "rate": 1.8, "type": 1, "speed": [130, 170], "number": 2, "spread": 5, "error": 0, "recoil": 0}, {"x": -2.8, "y": -4.6, "z": -0.4, "angle": 0, "damage": [2, 3], "rate": 1.8, "type": 1, "speed": [130, 170], "number": 2, "spread": 5, "error": 0, "recoil": 0}], "radius": 5.858}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 8 } },
                    ABBREVIATION: 'SCORP'
                },
                '602': {
                    SHIP: '{"name": "Xenolith", "level": 6, "model": 2,"code":602, "next":[702,703], "size": 1.7, "specs": {"shield": {"capacity": [230, 320], "reload": [5, 8]}, "generator": {"capacity": [110, 180], "reload": [38, 55]}, "ship": {"mass": 300, "speed": [80, 110], "rotation": [50, 70], "acceleration": [85, 100]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": -20, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-86, -90, -50, 0, 30, 70, 120, 110], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 25, 25, 30, 30, 25, 0], "height": [0, 10, 20, 20, 30, 30, 10, 0], "texture": [12, 2, 10, 11, 3, 8, 17], "propeller": true, "laser": {"damage": [28, 35], "speed": [110, 165], "rate": 4, "type": 1, "number": 1, "angle": 0, "recoil": 100}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -40, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -30, 10, 30, 40], "z": [0, 0, 0, 0, 0]}, "width": [7, 15, 17, 17, 0], "height": [5, 15, 15, 12, 0], "texture": [9, 9, 4], "propeller": false}, "propeller": {"section_segments": 12, "offset": {"x": 75, "y": 50, "z": -45}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-38, -35, -20, 0, 10, 40, 35], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 13, 0], "height": [0, 10, 13, 13, 13, 13, 0], "texture": [13, 3, 4, 18, 63, 13], "propeller": true}, "Side": {"section_segments": 9, "offset": {"x": 25, "y": 30, "z": -12}, "position": {"x": [-5, -5, -2, 0, -4, -4], "y": [-90, -100, -60, 20, 50, 58], "z": [5, 5, 5, 0, 0, 0, 0, 0]}, "width": [0, 8, 12, 24, 14, 0], "height": [0, 4, 15.6, 24, 14, 0], "texture": [4, 4, 63, 4, 3]}, "cannon": {"section_segments": 12, "offset": {"x": 0, "y": 50, "z": 45}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-40, -48, -45, -20, 0, 20, 40, 35], "z": [0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 10, 15, 15, 15, 10, 0], "height": [0, 6, 10, 13, 13, 13, 13, 0], "angle": 0, "laser": {"damage": [10, 25], "speed": [100, 150], "rate": 4, "type": 1, "number": 1, "angle": 0, "error": 0}, "propeller": true, "texture": [6, 2, 3, 4, 12, 63, 13]}}, "wings": {"main": {"offset": {"x": 0, "y": 20, "z": 0}, "length": [80, 0, 20], "width": [70, 50, 60, 50], "texture": [11, 63, 63], "angle": [-20, -40, -40], "position": [10, 40, 40, 40], "doubleside": 1, "bump": {"position": -10, "size": 15}}, "main2": {"offset": {"x": 0, "y": 20, "z": 0}, "length": [80, 0, 20], "width": [70, 50, 60, 50], "texture": [11, 63, 63], "angle": [-40, -20, -20], "position": [10, 40, 40, 40], "doubleside": 1, "bump": {"position": -10, "size": 15}}, "main3": {"offset": {"x": 15, "y": 20, "z": 0}, "length": [40, 0, 20], "width": [70, 50, 60, 50], "texture": [11, 63, 63], "angle": [90, 100, 100], "position": [10, 40, 40, 40], "doubleside": 1, "bump": {"position": -30, "size": 15}}, "main4": {"doubleside": true, "offset": {"x": 10, "y": -5, "z": -10}, "length": [0, 35, 20, 0], "width": [0, 160, 70, 30, 30], "angle": [-40, -30, -20, -20], "position": [30, -20, 30, 60, 60], "texture": [13, 63, 13, 8], "bump": {"position": 35, "size": 10}}, "front": {"doubleside": true, "offset": {"x": -5, "y": -90, "z": 5}, "length": [20, 15, 0, 20], "width": [40, 40, 90, 100, 30], "angle": [-30, -30, -30, -30], "position": [30, 30, 10, 5, 30], "texture": [13, 2, 13, 4], "bump": {"position": 35, "size": 7}}, "winglets": {"offset": {"x": 74, "y": 58, "z": -8}, "length": [25, 15, 15, 25], "width": [25, 100, 105, 100, 25], "angle": [-60, -70, -110, -120], "position": [0, 0, 0, 0, 0], "texture": [63, 4, 4, 63], "doubleside": true, "bump": {"position": 0, "size": 5}}}, "typespec": {"name": "Xenolith", "level": 6, "model": 2, "code": 602,"next":[702, 703], "specs": {"shield": {"capacity": [230, 320], "reload": [5, 8]}, "generator": {"capacity": [110, 180], "reload": [38, 55]}, "ship": {"mass": 300, "speed": [80, 115], "rotation": [50, 75], "acceleration": [85, 115]}}, "shape": [3.747, 4.67, 4.632, 3.735, 3.18, 2.697, 2.268, 1.599, 1.484, 1.43, 1.411, 1.44, 1.492, 3.157, 3.276, 3.453, 3.726, 4.007, 4.37, 4.881, 4.867, 3.286, 3.013, 3.505, 3.461, 3.407, 3.461, 3.505, 3.013, 3.286, 4.867, 4.881, 4.37, 4.007, 3.726, 3.453, 3.276, 3.157, 1.498, 1.44, 1.411, 1.43, 1.484, 1.599, 2.268, 2.697, 3.18, 3.735, 4.632, 4.67], "lasers": [{"x": 0, "y": -3.74, "z": 0, "angle": 0, "damage": [28, 35], "rate": 4, "type": 1, "speed": [110, 165], "number": 1, "spread": 0, "error": 0, "recoil": 100}, {"x": 0, "y": 0.068, "z": 1.53, "angle": 0, "damage": [10, 25], "rate": 4, "type": 1, "speed": [100, 150], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 4.881}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 8 } },
                    ABBREVIATION: 'XENO'
                },
                '603': {
                    SHIP: '{"name":"Advanced-Fighter","level":6,"model":3,"code":603, "next":[703,704],"size":2,"specs":{"shield":{"capacity":[200,350],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":400,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":0,"z":10},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-100,-80,-90,-50,0,50,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,15,25,40,25,20,0],"height":[0,5,10,30,25,20,10,0],"propeller":true,"texture":[4,4,1,1,10,1,1],"laser":{"damage":[90,150],"rate":1,"type":2,"speed":[180,240],"number":1,"recoil":150,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-35,"z":33},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-20,10,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,12,15,10,0],"height":[0,12,18,12,0],"propeller":false,"texture":[7,9,9,7]},"side_propellers":{"section_segments":10,"offset":{"x":30,"y":30,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-50,-20,0,20,80,70],"z":[0,0,0,0,0,0]},"width":[15,20,10,25,10,0],"height":[10,15,15,10,5,0],"angle":0,"propeller":true,"texture":[3,63,4,10,3]},"cannons":{"section_segments":12,"offset":{"x":70,"y":50,"z":-30},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,50,55],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,10,15,10,0],"height":[0,5,15,15,10,5,0],"angle":0,"propeller":false,"texture":[4,4,10,4,63,4],"laser":{"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}},"cannons2":{"section_segments":12,"offset":{"x":95,"y":50,"z":-40},"position":{"x":[0,0,0,0],"y":[-50,-20,40,50],"z":[0,0,0,0]},"width":[2,5,5,2],"height":[2,15,15,2],"angle":0,"propeller":false,"texture":6,"laser":{"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"error":0}}},"wings":{"main":{"length":[100,30,20],"width":[100,50,40,30],"angle":[-25,20,25],"position":[30,70,50,50],"bump":{"position":-20,"size":20},"offset":{"x":0,"y":0,"z":0},"texture":[11,11,63],"doubleside":true},"winglets":{"length":[40],"width":[40,20,30],"angle":[10,-10],"position":[-50,-70,-65],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":0,"y":0,"z":0}}},"typespec":{"name":"Advanced-Fighter","level":6,"model":3,"code":603,"next":[703, 704], "specs":{"shield":{"capacity":[200,350],"reload":[4,6]},"generator":{"capacity":[120,200],"reload":[50,60]},"ship":{"mass":400,"speed":[70,80],"rotation":[30,50],"acceleration":[70,100]}},"shape":[4,3.65,3.454,3.504,3.567,2.938,1.831,1.707,1.659,1.943,1.92,1.882,1.896,3.96,5.654,5.891,6.064,5.681,5.436,5.573,5.122,4.855,4.675,4.626,4.479,4.008,4.479,4.626,4.675,4.855,5.122,5.573,5.436,5.681,6.064,5.891,5.654,3.96,3.88,1.882,1.92,1.943,1.659,1.707,1.831,2.938,3.567,3.504,3.454,3.65],"lasers":[{"x":0,"y":-4,"z":0.4,"angle":0,"damage":[90,150],"rate":1,"type":2,"speed":[190,260],"number":1,"spread":0,"error":0,"recoil":150},{"x":2.8,"y":0,"z":-1.2,"angle":0,"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.8,"y":0,"z":-1.2,"angle":0,"damage":[6,12],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.8,"y":0,"z":-1.6,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.8,"y":0,"z":-1.6,"angle":0,"damage":[4,10],"rate":3,"type":1,"speed":[100,150],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.064}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 9, y: 8 } },
                    ABBREVIATION: 'ADV-F'
                },
                '604': {
                    SHIP: '{"name": "Condor", "level": 6, "model": 4, "code":604, "next":[703,704],"size": 1.5, "zoom": 0.96, "specs": {"shield": {"capacity": [225, 400], "reload": [7, 10]}, "generator": {"capacity": [70, 130], "reload": [30, 48]}, "ship": {"mass": 200, "speed": [95, 120], "rotation": [50, 70], "acceleration": [80, 120]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-110, -95, -100, -100, -45, -40, -25, -23, 15, 20, 55, 80, 100, 90], "z": [-10, -9, -8, -7, -6, -4, -2, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 2, 5, 10, 25, 27, 27, 25, 25, 27, 40, 35, 30, 0], "height": [0, 2, 5, 10, 25, 27, 27, 25, 25, 27, 20, 15, 10, 0], "texture": [6, 2, 3, 10, 5, 63, 5, 2, 5, 3, 63, 11, 4], "propeller": true, "laser": {"damage": [30, 60], "rate": 2, "type": 2, "speed": [150, 200], "number": 1, "angle": 0, "error": 0}}, "cannons": {"section_segments": 12, "offset": {"x": 75, "y": 30, "z": -25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -45, -20, 0, 20, 50, 55], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 10, 10, 0], "height": [0, 5, 15, 15, 10, 5, 0], "angle": 0, "laser": {"damage": [3, 6], "rate": 4, "type": 1, "speed": [100, 130], "number": 1, "angle": 0, "error": 0}, "propeller": false, "texture": [6, 4, 10, 4, 63, 4]}, "cockpit": {"section_segments": 12, "offset": {"x": 0, "y": -60, "z": 8}, "position": {"x": [0, 0, 0, 0], "y": [-25, -8, 20, 65], "z": [0, 0, 0, 0]}, "width": [0, 10, 10, 0], "height": [0, 12, 15, 5], "texture": [9]}}, "wings": {"back": {"offset": {"x": 0, "y": 25, "z": 10}, "length": [90, 40], "width": [70, 50, 30], "angle": [-30, 40], "position": [0, 20, 0], "texture": [11, 63], "doubleside": true, "bump": {"position": 10, "size": 20}}, "front": {"offset": {"x": 0, "y": 55, "z": 10}, "length": [90, 40], "width": [70, 50, 30], "angle": [-30, -40], "position": [-60, -20, -20], "texture": [11, 63], "doubleside": true, "bump": {"position": 10, "size": 10}}}, "typespec": {"name": "Condor", "level": 6, "model": 4, "code":604, "next":[703,704], "zoom": 0.96, "specs": {"shield": {"capacity": [225, 400], "reload": [7, 10]}, "generator": {"capacity": [70, 130], "reload": [30, 48]}, "ship": {"mass": 260, "speed": [95, 110], "rotation": [50, 80], "acceleration": [80, 110]}}, "shape": [3.3, 3.015, 2.45, 1.959, 1.658, 1.477, 1.268, 1.11, 1.148, 1.237, 2.34, 2.448, 2.489, 3.283, 3.363, 3.501, 3.586, 3.333, 3.496, 3.502, 3.154, 2.52, 3.016, 3.132, 3.054, 3.006, 3.054, 3.132, 3.016, 2.52, 3.154, 3.502, 3.496, 3.333, 3.586, 3.501, 3.363, 3.283, 2.49, 2.448, 2.34, 1.237, 1.148, 1.11, 1.268, 1.477, 1.658, 1.959, 2.45, 3.015], "lasers": [{"x": 0, "y": -3.3, "z": 0, "angle": 0, "damage": [30, 60], "rate": 2, "type": 2, "speed": [165,225], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.25, "y": -0.6, "z": -0.75, "angle": 0, "damage": [3, 6], "rate": 4, "type": 1, "speed": [100, 130], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.25, "y": -0.6, "z": -0.75, "angle": 0, "damage": [3, 6], "rate": 4, "type": 1, "speed": [100, 130], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.586}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 7, y: 7 } },
                    ABBREVIATION: 'COND'
                },
                '605': {
                    SHIP: '{"name": "A-Speedster", "level": 6, "model": 5, "code":605, "next":[704,705], "size": 1.6, "specs": {"shield": {"capacity": [200, 300], "reload": [6, 8]}, "generator": {"capacity": [80, 140], "reload": [30, 45]}, "ship": {"mass": 230, "speed": [90, 130], "rotation": [60, 85], "acceleration": [90, 140]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-100, -95, 0, 0, 70, 65], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 40, 20, 20, 0], "height": [0, 5, 30, 30, 15, 0], "texture": [6, 11, 5, 63, 12], "propeller": true, "laser": {"damage": [38, 84], "rate": 1, "type": 2, "speed": [175, 230], "recoil": 50, "number": 1, "error": 0}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -60, "z": 15}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-20, 0, 20, 40, 50], "z": [-7, -5, 0, 0, 0]}, "width": [0, 10, 10, 10, 0], "height": [0, 10, 15, 12, 0], "texture": [9]}, "side_propulsors": {"section_segments": 10, "offset": {"x": 50, "y": 25, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-20, -15, 0, 10, 20, 25, 30, 40, 80, 70], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "height": [0, 15, 20, 20, 20, 15, 15, 20, 10, 0], "propeller": true, "texture": [4, 4, 2, 2, 5, 63, 5, 4, 12]}, "cannons": {"section_segments": 12, "offset": {"x": 30, "y": 40, "z": 45}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-50, -45, -20, 0, 20, 30, 40], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 7, 10, 3, 5, 0], "height": [0, 5, 7, 8, 3, 5, 0], "angle": -10, "laser": {"damage": [8, 12], "rate": 2, "type": 1, "speed": [100, 130], "number": 1, "angle": -10, "error": 0}, "propeller": false, "texture": [6, 4, 10, 4, 63, 4]}}, "wings": {"join": {"offset": {"x": 0, "y": 0, "z": 10}, "length": [40, 0], "width": [10, 20], "angle": [-1], "position": [0, 30], "texture": [63], "bump": {"position": 0, "size": 25}}, "winglets": {"offset": {"x": 0, "y": -40, "z": 10}, "doubleside": true, "length": [45, 10], "width": [5, 20, 30], "angle": [50, -10], "position": [90, 80, 50], "texture": [4], "bump": {"position": 10, "size": 30}}}, "typespec": {"name": "A-Speedster", "level": 6, "model": 5, "code": 605,"next":[704, 705], "specs": {"shield": {"capacity": [200, 300], "reload": [6, 8]}, "generator": {"capacity": [80, 140], "reload": [30, 45]}, "ship": {"mass": 235, "speed": [90, 120], "rotation": [60, 90], "acceleration": [90, 135]}}, "shape": [3.2, 3.109, 2.569, 2.082, 1.786, 1.589, 1.439, 1.348, 1.278, 1.24, 1.222, 1.338, 1.372, 1.801, 2.197, 2.375, 2.52, 2.637, 3.021, 3.288, 3.665, 3.862, 3.713, 2.645, 2.28, 2.244, 2.28, 2.645, 3.713, 3.862, 3.665, 3.288, 3.021, 2.637, 2.52, 2.375, 2.197, 1.801, 1.372, 1.338, 1.222, 1.24, 1.278, 1.348, 1.439, 1.589, 1.786, 2.082, 2.569, 3.109], "lasers": [{"x": 0, "y": -3.2, "z": 0, "angle": 0, "damage": [38, 84], "rate": 1, "type": 2, "speed": [175, 230], "number": 1, "spread": 0, "error": 0, "recoil": 50}, {"x": 1.238, "y": -0.296, "z": 1.44, "angle": -10, "damage": [8, 12], "rate": 2, "type": 1, "speed": [100, 130], "number": 1, "spread": -10, "error": 0, "recoil": 0}, {"x": -1.238, "y": -0.296, "z": 1.44, "angle": 10, "damage": [8, 12], "rate": 2, "type": 1, "speed": [100, 130], "number": 1, "spread": -10, "error": 0, "recoil": 0}], "radius": 3.862}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 7 } },
                    ABBREVIATION: 'A-SPD'
                },
                '606': {
                    SHIP: '{"name": "T-Fighter", "level": 6, "model": 6, "code":606, "next":[705,706], "size": 2.25, "zoom": 0.96, "specs": {"shield": {"capacity": [220, 350], "reload": [6, 8]}, "generator": {"capacity": [120, 170], "reload": [35, 60]}, "ship": {"mass": 325, "speed": [85, 105], "rotation": [50, 70], "acceleration": [80, 110]}}, "bodies": {"main": {"section_segments": 12, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-95, -65, -47, -20, 15, 17, 29, 50, 60, 75, 72], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 11, 15, 20, 25, 25, 25, 22, 20, 15, 0], "height": [0, 6, 8, 12, 20, 20, 20, 20, 18, 15, 0], "propeller": true, "texture": [2, 63, 63, 11, 5, 3, 63, 4, 13, 17]}, "cockpit": {"section_segments": 7, "offset": {"x": 0, "y": -59, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0], "y": [-15, 0, 16, 35, 50], "z": [-7, -6, -7, -1, -1]}, "width": [0, 5, 10, 8, 5], "height": [0, 6, 11, 6, 5], "propeller": false, "texture": [7, 9, 9, 4, 4]}, "cannon_wing_top": {"section_segments": 8, "offset": {"x": 0, "y": 60, "z": 40}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-25, -30, -10, 10, 20, 15], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 3, 4.8, 6.6, 4.2, 0], "height": [0, 2.5, 4, 5.5, 5, 0], "angle": 0, "laser": {"damage": [5, 10], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "error": 0, "angle": 0}, "propeller": 0, "texture": [6, 4, 10, 13, 17]}, "side_thruster": {"section_segments": 8, "offset": {"x": 19, "y": 57, "z": -10}, "position": {"x": [1, 1, 1, 0, 0, 0], "y": [-45, -30, -10, 10, 20, 15], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 3.25, 5.2, 7.15, 4.55, 0], "height": [0, 2.5, 4, 5.5, 5, 0], "angle": 0, "propeller": true, "texture": [4, 4, 10, 13, 17]}, "cannon_side": {"section_segments": 8, "offset": {"x": 10, "y": -43, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, -2], "y": [-35, -40, -20, 10, 25, 40], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 3.2, 5.6, 8, 4.8, 0], "height": [0, 2.4, 4.2, 6, 4.2, 0], "angle": 0, "laser": {"damage": [10, 15], "rate": 4, "type": 1, "speed": [100, 155], "number": 5, "error": 0, "angle": 25}, "propeller": false, "texture": [4, 4, 11, 4]}, "cannon_wings": {"section_segments": 8, "offset": {"x": 56, "y": 50, "z": -3}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-66.5, -59.5, -56, -60.2, -52.5, -47.6, -44.8, -44.8, -31.5, -10.5, 7, 17.5, 14.7], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 1.35, 0, 2.7, 4.5, 5.4, 6.93, 6.93, 7.65, 8.55, 6.75, 4.5, 0], "height": [0, 1.35, 0, 2.7, 4.5, 5.4, 6.93, 6.93, 7.65, 8.55, 6.75, 4.5, 0], "texture": [63, 63, 13, 4, 4, 63, 8, 10, 8, 4, 13, 17], "angle": 0, "laser": {"damage": [6, 7], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "angle": 3.5, "error": 0}, "propeller": 0}, "cannon_pulse_fix": {"section_segments": 0, "offset": {"x": 0, "y": 0, "z": 0}, "position": {"x": [0], "y": [0], "z": [0]}, "width": [0], "height": [0], "texture": [0], "angle": 0, "laser": {"damage": [100, 150], "rate": 10, "type": 1, "speed": [1, 1], "number": 100, "error": 0, "angle": 0}, "propeller": false}}, "wings": {"main": {"length": [60, 15, 5], "width": [80, 30, 20, 20], "angle": [0, 40, 0], "position": [10, 24, 3, -10], "doubleside": true, "texture": [11, 63, 4], "offset": {"x": 1, "y": 13, "z": -5.31}, "bump": {"position": 10, "size": 10}}, "winglets": {"length": [19, 3], "width": [30, 30, 59], "angle": [0, 50, 0], "position": [-20, 23, 50], "doubleside": true, "texture": [3], "offset": {"x": 1, "y": -58, "z": 0}, "bump": {"position": 30, "size": 15}}, "winglets_cannon_top_2": {"length": [13, 3], "width": [15, 15, 20], "angle": [30, 30, 0], "position": [-12, 0, -2], "doubleside": true, "texture": [4, 13], "offset": {"x": 1, "y": 65, "z": 40}, "bump": {"position": 10, "size": 10}}, "top": {"doubleside": true, "offset": {"x": 0, "y": 44, "z": 20}, "length": [0, 20], "width": [0, 50, 20], "angle": [0, 90], "position": [0, 0, 20], "texture": [63], "bump": {"position": 0, "size": 10}}}, "typespec": {"name": "T-Fighter", "level": 6, "model": 6, "code": 606,"next":[705, 706], "zoom": 0.96, "specs": {"shield": {"capacity": [220, 350], "reload": [6, 8]}, "generator": {"capacity": [120, 170], "reload": [35, 60]}, "ship": {"mass": 310, "speed": [85, 105], "rotation": [50, 70], "acceleration": [80, 110]}}, "shape": [4.275, 3.782, 3.409, 2.591, 2.202, 1.865, 1.634, 1.434, 1.279, 1.172, 2.627, 2.691, 3.501, 3.514, 3.536, 3.488, 3.469, 3.55, 3.852, 4.079, 3.941, 3.014, 3.521, 3.623, 3.527, 3.605, 3.527, 3.623, 3.521, 3.014, 3.941, 4.079, 3.852, 3.55, 3.469, 3.488, 3.536, 3.514, 3.501, 2.691, 2.627, 1.172, 1.279, 1.434, 1.634, 1.865, 2.202, 2.591, 3.409, 3.782], "lasers": [{"x": 0, "y": 1.35, "z": 1.8, "angle": 0, "damage": [5, 10], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.45, "y": -3.735, "z": -0.45, "angle": 0, "damage": [10, 15], "rate": 4, "type": 1, "speed": [100, 155], "number": 5, "spread": 25, "error": 0, "recoil": 0}, {"x": -0.45, "y": -3.735, "z": -0.45, "angle": 0, "damage": [10, 15], "rate": 4, "type": 1, "speed": [100, 155], "number": 5, "spread": 25, "error": 0, "recoil": 0}, {"x": 2.52, "y": -0.743, "z": -0.135, "angle": 0, "damage": [6, 7], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "spread": 3.5, "error": 0, "recoil": 0}, {"x": -2.52, "y": -0.743, "z": -0.135, "angle": 0, "damage": [6, 7], "rate": 2, "type": 1, "speed": [150, 200], "number": 1, "spread": 3.5, "error": 0, "recoil": 0}, {"x": 0, "y": 0, "z": 0, "angle": 0, "damage": [100, 150], "rate": 10, "type": 1, "speed": [1, 1], "number": 100, "spread": 0, "error": 0, "recoil": 0}], "radius": 4.275}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 7, y: 7 } },
                    ABBREVIATION: 'T-FGT'
                },
                '607': {
                    SHIP: '{"name":"H-Mercury","level":6,"model":7,"code":607, "next":[706,707], "size":1.85, "zoom": 0.96,"specs":{"shield":{"capacity":[250,320],"reload":[6,8]},"generator":{"capacity":[100,150],"reload":[45,61]},"ship":{"mass":500,"speed":[75,95],"rotation":[50,60],"acceleration":[65,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-70,-60,-40,0,50,110,100],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,10,20,30,25,10,0],"height":[1,5,10,15,25,20,10,0],"texture":[6,4,4,63,11,63,12],"propeller":true,"laser":{"damage":[5,9],"rate":8,"type":1,"speed":[100,150],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":35},"position":{"x":[0,0,0,0,0,0,0],"y":[-20,-10,0,15,25],"z":[0,0,0,0,0]},"width":[0,10,12,10,5],"height":[0,10,13,12,5],"texture":[9,9,4,4],"propeller":false},"arms":{"section_segments":8,"offset":{"x":60,"y":-10,"z":-10},"position":{"x":[0,0,0,5,10,0,0,-10],"y":[-85,-70,-80,-30,0,30,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[1,5,6,15,15,15,10,0],"height":[1,5,6,20,30,25,10,0],"texture":[6,4,4,4,4,4,12],"angle":1,"propeller":true,"laser":{"damage":[3,5],"rate":4,"type":1,"speed":[150,200],"number":1,"error":0}},"canon":{"section_segments":12,"offset":{"x":100,"y":17,"z":5},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-45,-20,0,20,30,40],"z":[0,0,0,0,0,0,0]},"width":[0,5,7,7,3,5,0],"height":[0,5,15,15,3,5,0],"angle":3,"laser":{"damage":[5,11],"rate":2,"type":1,"speed":[150,200],"number":1,"error":0},"propeller":false,"texture":[6,4,10,4,4,4]}},"wings":{"main":{"offset":{"x":0,"y":-25,"z":20},"length":[60,40],"width":[60,30,20],"angle":[-20,10],"position":[30,50,30],"texture":[11,11],"bump":{"position":30,"size":10}},"font":{"length":[60],"width":[20,15],"angle":[-10,20],"position":[-20,-40],"texture":[63],"bump":{"position":30,"size":10},"offset":{"x":0,"y":-10,"z":0}},"font2":{"offset":{"x":0,"y":30,"z":8},"length":[60],"width":[20,15],"angle":[-10,20],"position":[20,40],"texture":[63],"bump":{"position":30,"size":10}}},"typespec":{"name":"H-Mercury", "level":6,"model":7,"code":607,"next":[706, 707], "zoom": 0.96, "specs":{"shield":{"capacity":[250,330],"reload":[6,8]},"generator":{"capacity":[170,220],"reload":[60,78]},"ship":{"mass":350,"speed":[71,95],"rotation":[51,75],"acceleration":[81,105]}},"shape":[3.206,3.202,2.648,2.29,4.484,4.459,4.216,3.914,3.713,3.585,4.258,4.248,4.244,4.307,4.355,4.529,4.673,4.676,3.99,4.494,4.598,4.267,3.073,3.218,4.02,4.008,4.02,3.218,3.073,4.267,4.598,4.494,3.99,4.676,4.673,4.529,4.355,4.307,4.244,4.248,4.258,3.585,3.713,3.914,4.216,4.459,4.484,2.29,2.648,3.202],"lasers":[{"x":0,"y":-3.2,"z":0.8,"angle":0,"damage":[14,20],"rate":2,"type":1,"speed":[175,205],"number":1,"spread":0,"error":0,"recoil":120},{"x":2.341,"y":-3.799,"z":-0.4,"angle":1,"damage":[12,18],"rate":2,"type":1,"speed":[155,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.341,"y":-3.799,"z":-0.4,"angle":-1,"damage":[12,18],"rate":2,"type":1,"speed":[155,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":3.895,"y":-1.317,"z":0.2,"angle":3,"damage":[3,6],"rate":6,"type":1,"speed":[175, 205],"number":1,"spread":0,"error":0,"recoil":0},{"x":-3.895,"y":-1.317,"z":0.2,"angle":-3,"damage":[3,6],"rate":6,"type":1,"speed":[175,205],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.676}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 8 } },
                    ABBREVIATION: 'H-MRC'
                },
                '608': {
                    SHIP: '{"name": "Typhoon", "level": 6, "model": 8, "code":608, "next":[707,708], "size": 1.85, "specs": {"shield": {"capacity": [215, 335], "reload": [4, 7]}, "generator": {"capacity": [175, 250], "reload": [45, 70]}, "ship": {"mass": 375, "speed": [70, 95], "rotation": [35, 58], "acceleration": [85, 100]}}, "bodies": {"body": {"section_segments": 8, "offset": {"x": 0, "y": -12.5, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-110, -105, -90, -40, -20, 0, 20, 78, 120, 137, 130], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 16, 25, 25, 32, 35, 35, 25, 20, 0], "height": [0, 17, 26, 35, 35, 35, 35, 35, 24, 20, 0], "texture": [4, 63, 10, 63, 63, 3, 10, 63, 3, 17], "propeller": true}, "sidethrusters": {"section_segments": 8, "offset": {"x": 30, "y": 27.5, "z": 0}, "position": {"x": [-10, -5, 4, -3, -3], "y": [-70, -50, 0, 90, 80], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 15, 16, 10, 0], "height": [0, 15, 16, 10, 0], "texture": [4, 11, 1, 17], "propeller": true}, "cannons1": {"section_segments": 8, "offset": {"x": 83, "y": 22.5, "z": -25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 63, 4, 3], "propeller": false, "angle": -2, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [110, 160], "number": 1}}, "cannons2": {"section_segments": 8, "offset": {"x": 45, "y": 46.5, "z": 25}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 3, 4, 3], "propeller": false, "angle": -1, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1}}, "cannons3": {"section_segments": 8, "offset": {"x": 20, "y": -62.5, "z": 0}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 3, 4, 3], "propeller": false, "angle": -0.5, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [150, 200], "number": 1}}, "cannons4": {"section_segments": 8, "offset": {"x": 60, "y": -12.5, "z": -38}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-37, -29, 0, 45, 60, 61], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 8, 0], "height": [0, 5, 10, 10, 8, 0], "texture": [6, 4, 3, 4, 3], "propeller": false, "angle": -1.5, "laser": {"damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1}}, "cockpit": {"section_segments": 8, "offset": {"x": 0, "y": -46.5, "z": 26}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-50, -30, 0, 40, 70, 100], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 14, 14, 13, 0], "height": [0, 10, 16, 14, 10, 0], "texture": [4, 9, 9, 63, 4]}}, "wings": {"wingsmain": {"offset": {"x": 30, "y": 37.5, "z": 6}, "length": [60, 10, 0, 25], "width": [100, 80, 60, 100, 55], "angle": [-30, -30, -30, -30], "position": [-20, 0, 16, 10, 40], "texture": [3, 13, 17, 63], "doubleside": true, "bump": {"position": -20, "size": 4}}, "wingsmain2": {"offset": {"x": 20, "y": 57.5, "z": 20}, "length": [30, 10, 0, 15], "width": [70, 60, 50, 90, 35], "angle": [10, 10, 10, 10], "position": [-20, 0, 16, 10, 40], "texture": [2, 13, 17, 63], "doubleside": true, "bump": {"position": -20, "size": 5}}, "wingsmain3": {"offset": {"x": 10, "y": -12.5, "z": -10}, "length": [50], "width": [70, 50], "angle": [-30, 0], "position": [-20, 5], "texture": [2], "doubleside": true, "bump": {"position": -20, "size": 5}}}, "typespec": {"name": "Typhoon", "level": 6, "model": 8, "code": 608,"next":[707, 708], "specs": {"shield": {"capacity": [230, 350], "reload": [4, 7]}, "generator": {"capacity": [220, 280], "reload": [44, 60]}, "ship": {"mass": 375, "speed": [67, 85], "rotation": [40, 70], "acceleration": [85, 95]}}, "shape": [4.533, 4.403, 3.757, 3.197, 2.589, 2.187, 2.193, 2.905, 2.886, 2.804, 2.7, 3.219, 3.385, 3.606, 3.905, 4.354, 4.737, 5.13, 5.688, 5.657, 5.063, 5.03, 4.467, 4.558, 4.666, 4.615, 4.666, 4.558, 4.467, 5.03, 5.063, 5.657, 5.688, 5.13, 4.737, 4.354, 3.905, 3.606, 3.385, 3.219, 2.7, 2.804, 2.886, 2.905, 2.193, 2.187, 2.589, 3.197, 3.757, 4.403], "lasers": [{"x": 3.119, "y": -0.536, "z": -0.925, "angle": -2, "damage": [8, 12], "rate": 3, "type": 1, "speed": [110, 160], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -3.119, "y": -0.536, "z": -0.925, "angle": 2, "damage": [8, 12], "rate": 3, "type": 1, "speed": [110, 160], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 1.689, "y": 0.352, "z": 0.925, "angle": -1, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -1.689, "y": 0.352, "z": 0.925, "angle": 1, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.752, "y": -3.681, "z": 0, "angle": -0.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.752, "y": -3.681, "z": 0, "angle": 0.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [150, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 2.256, "y": -1.831, "z": -1.406, "angle": -1.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -2.256, "y": -1.831, "z": -1.406, "angle": 1.5, "damage": [8, 12], "rate": 3, "type": 1, "speed": [130, 180], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 5.688}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 7, y: 7 } },
                    ABBREVIATION: 'TYPH'
                },
                '609': {
                    SHIP: '{"name": "Marauder", "level": 6, "model": 9, "code":609, "next":[708,709], "size": 1.4, "zoom": 0.96, "specs": {"shield": {"capacity": [210, 350], "reload": [8, 11]}, "generator": {"capacity": [85, 160], "reload": [25, 45]}, "ship": {"mass": 280, "speed": [85, 115], "rotation": [60, 80], "acceleration": [80, 120]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": -20, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-65, -75, -55, -40, 0, 30, 60, 80, 90, 80], "z": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 18, 23, 30, 25, 25, 30, 35, 0], "height": [0, 5, 10, 12, 12, 20, 15, 15, 15, 0], "texture": [6, 4, 1, 10, 1, 1, 11, 12, 17], "propeller": true, "laser": {"damage": [10, 16], "rate": 10, "type": 1, "speed": [170, 200], "recoil": 0, "number": 1, "error": 0}}, "cockpit": {"section_segments": [40, 90, 180, 270, 320], "offset": {"x": 0, "y": -85, "z": 22}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [15, 35, 60, 95, 125], "z": [-1, -2, -1, -1, 3]}, "width": [5, 12, 14, 15, 5], "height": [0, 12, 15, 15, 0], "texture": [8.98, 8.98, 4]}, "outriggers": {"section_segments": 10, "offset": {"x": 25, "y": 0, "z": -10}, "position": {"x": [-5, -5, 8, -5, 0, 0, 0, 0, 0, 0], "y": [-100, -125, -45, 0, 30, 40, 70, 80, 100, 90], "z": [10, 10, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 6, 10, 10, 15, 15, 15, 15, 10, 0], "height": [0, 10, 20, 25, 25, 25, 25, 25, 20, 0], "texture": [13, 4, 4, 63, 4, 18, 4, 13, 17], "laser": {"damage": [4, 8], "rate": 3, "type": 1, "speed": [110, 140], "recoil": 0, "number": 1, "error": 0}, "propeller": true}, "intake": {"section_segments": 12, "offset": {"x": 25, "y": -5, "z": 10}, "position": {"x": [0, 0, 5, 0, -3, 0, 0, 0, 0, 0], "y": [-10, -30, -5, 35, 60, 70, 85, 100, 85], "z": [0, -6, 0, 0, 0, 0, 0, 0, 0, 0]}, "width": [0, 5, 10, 10, 15, 10, 10, 5, 0], "height": [0, 15, 15, 20, 20, 15, 15, 5, 0], "texture": [6, 4, 63, 4, 63, 18, 4, 17]}}, "wings": {"main": {"length": [20, 70, 35], "width": [50, 55, 40, 20], "angle": [0, -20, 0], "position": [20, 20, 70, 25], "texture": [3, 18, 63], "doubleside": true, "bump": {"position": 30, "size": 15}, "offset": {"x": 0, "y": 0, "z": 13}}, "spoiler": {"length": [20, 45, 0, 5], "width": [40, 40, 20, 30, 0], "angle": [0, 20, 90, 90], "position": [60, 60, 80, 80, 90], "texture": [10, 11, 63], "doubleside": true, "bump": {"position": 30, "size": 18}, "offset": {"x": 0, "y": 0, "z": 30}}, "font": {"length": [37], "width": [40, 15], "angle": [-10], "position": [0, -45], "texture": [63], "doubleside": true, "bump": {"position": 30, "size": 10}, "offset": {"x": 35, "y": -20, "z": 10}}, "shields": {"doubleside": true, "offset": {"x": 12, "y": 60, "z": -15}, "length": [0, 15, 45, 20], "width": [30, 30, 65, 65, 30, 30], "angle": [30, 30, 90, 150], "position": [10, 10, 0, 0, 10], "texture": [4], "bump": {"position": 0, "size": 4}}}, "typespec": {"name": "Marauder", "level": 6, "model": 9, "code": 609,"next":[708,709], "zoom": 0.96, "specs": {"shield": {"capacity": [210, 350], "reload": [8, 11]}, "generator": {"capacity": [85, 160], "reload": [30, 50]}, "ship": {"mass": 270, "speed": [85, 115], "rotation": [60, 80], "acceleration": [80, 120]}}, "shape": [2.665, 3.563, 3.573, 2.856, 2.359, 2.03, 2.85, 2.741, 2.228, 1.71, 1.404, 1.199, 1.11, 3.408, 3.491, 3.521, 3.44, 3.385, 3.439, 3.481, 3.181, 2.932, 2.962, 2.944, 2.85, 2.244, 2.85, 2.944, 2.962, 2.932, 3.181, 3.481, 3.439, 3.385, 3.44, 3.521, 3.491, 3.408, 1.11, 1.199, 1.404, 1.71, 2.228, 2.741, 2.85, 2.03, 2.359, 2.856, 3.573, 3.563], "lasers": [{"x": 0, "y": -2.66, "z": 0.28, "angle": 0, "damage": [10, 16], "rate": 10, "type": 1, "speed": [170, 200], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": 0.56, "y": -3.5, "z": -0.28, "angle": 0, "damage": [4, 8], "rate": 3, "type": 1, "speed": [110, 140], "number": 1, "spread": 0, "error": 0, "recoil": 0}, {"x": -0.56, "y": -3.5, "z": -0.28, "angle": 0, "damage": [4, 8], "rate": 3, "type": 1, "speed": [110, 140], "number": 1, "spread": 0, "error": 0, "recoil": 0}], "radius": 3.573}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 6, y: 7 } },
                    ABBREVIATION: 'MARA'
                },
                '610': {
                    SHIP: '{"name": "Rock-Tower", "level": 6, "model": 10, "code":610, "next":[708,709], "size": 2.1, "specs": {"shield": {"capacity": [300, 500], "reload": [8, 11]}, "generator": {"capacity": [120, 140], "reload": [34, 52]}, "ship": {"mass": 400, "speed": [85, 105], "rotation": [50, 70], "acceleration": [80, 90]}}, "bodies": {"main": {"section_segments": 8, "offset": {"x": 0, "y": 0, "z": 10}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "y": [-90, -85, -70, -60, -20, -25, 40, 85, 70], "z": [-10, -8, -5, 0, 0, 0, 0, 0, 0]}, "width": [0, 40, 45, 10, 12, 30, 30, 20, 0], "height": [0, 10, 12, 8, 12, 10, 25, 20, 0], "texture": [4, 63, 4, 4, 4, 11, 10, 12], "propeller": true}, "cockpit": {"section_segments": 12, "offset": {"x": 0, "y": 30, "z": 20}, "position": {"x": [0, 0, 0, 0, 0, 0, 0, 0], "y": [-30, -20, 0, 10, 20, 30], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 10, 5], "height": [0, 10, 15, 15, 10, 5], "texture": 9, "propeller": false}, "dimeds_banhammer": {"section_segments": 6, "offset": {"x": 25, "y": -70, "z": -10}, "position": {"x": [0, 0, 0, 0, 0, 0], "y": [-20, -10, -20, 0, 10, 12], "z": [0, 0, 0, 0, 0, 0]}, "width": [0, 0, 5, 7, 6, 0], "height": [0, 0, 5, 7, 6, 0], "texture": [6, 6, 6, 10, 12], "angle": 0, "laser": {"damage": [4, 6], "rate": 8, "type": 1, "speed": [150, 230], "number": 1, "error": 5}}, "propulsors": {"section_segments": 8, "offset": {"x": 30, "y": 50, "z": 0}, "position": {"x": [0, 0, 5, 5, 0, 0, 0], "y": [-45, -50, -20, 0, 20, 50, 40], "z": [0, 0, 0, 0, 0, 0, 0]}, "width": [0, 10, 15, 15, 15, 10, 0], "height": [0, 15, 20, 25, 20, 10, 0], "texture": [11, 2, 3, 4, 5, 12], "angle": 0, "propeller": true}}, "wings": {"main": {"length": [55, 15], "width": [60, 40, 30], "angle": [-10, 20], "position": [30, 40, 30], "texture": 63, "doubleside": true, "offset": {"x": 0, "y": 20, "z": -5}, "bump": {"position": 30, "size": 20}}, "finalizer_fins": {"length": [20], "width": [20, 10], "angle": [-70], "position": [-42, -30], "texture": 63, "doubleside": true, "offset": {"x": 35, "y": -35, "z": 0}, "bump": {"position": 0, "size": 30}}}, "typespec": {"name": "Rock-Tower", "level": 6, "model": 10, "code": 610,"next":[708, 709], "specs": {"shield": {"capacity": [300, 500], "reload": [8, 11]}, "generator": {"capacity": [120, 140], "reload": [36, 54]}, "ship": {"mass": 400, "speed": [85, 103], "rotation": [50, 70], "acceleration": [80, 90]}}, "shape": [3.78, 3.758, 3.974, 3.976, 3.946, 3.508, 1.532, 1.64, 1.556, 1.426, 1.347, 1.298, 1.269, 1.764, 1.894, 2.075, 3.269, 3.539, 3.933, 3.989, 4.058, 4.127, 4.524, 4.416, 3.634, 3.577, 3.634, 4.416, 4.524, 4.127, 4.058, 3.989, 3.933, 3.539, 3.269, 2.075, 1.894, 1.764, 1.68, 1.298, 1.347, 1.426, 1.556, 1.64, 1.532, 3.508, 3.946, 3.976, 3.974, 3.758], "lasers": [{"x": 1.05, "y": -3.78, "z": -0.42, "angle": 0, "damage": [5, 8], "rate": 8, "type": 1, "speed": [150, 230], "number": 1, "spread": 0, "error": 3, "recoil": 0}, {"x": -1.05, "y": -3.78, "z": -0.42, "angle": 0, "damage": [5, 8], "rate": 8, "type": 1, "speed": [150, 230], "number": 1, "spread": 0, "error": 5, "recoil": 0}], "radius": 4.524}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 4, y: 7 } },
                    ABBREVIATION: 'RT'
                },
                '611': {
                    SHIP: '{"name":"Barracuda","level":6,"model":11,"code":611, "next":[709,710],"size":2.4,"specs":{"shield":{"capacity":[300,500],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[8,14]},"ship":{"mass":675,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"bodies":{"body":{"section_segments":12,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-90,-100,-60,-10,0,20,50,80,100,90],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,20,25,35,40,40,35,30,0],"height":[0,5,40,45,40,60,70,60,30,0],"texture":[10,2,10,2,3,13,13,63,12],"propeller":true},"front":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-20],"z":[0,0,0,0,0]},"width":[0,40,45,10,12],"height":[0,15,18,8,12],"texture":[8,63,4,4,4],"propeller":true},"propeller":{"section_segments":10,"offset":{"x":40,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,20,15,0],"height":[0,10,15,15,15,10,10,18,8,0],"texture":[4,4,10,3,3,63,4,63,12],"propeller":true},"sides":{"section_segments":6,"angle":90,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-80,-75,-60,-50,-10,10,50,60,75,80],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,30,35,10,12,12,10,35,30,0],"height":[0,10,12,8,12,12,8,12,10,0],"texture":[4,63,4,4,4,4,4,63,4]},"cockpit":{"section_segments":12,"offset":{"x":0,"y":-20,"z":30},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-50,-20,0,10,30,50],"z":[0,0,0,0,0,0]},"width":[0,12,18,20,15,0],"height":[0,20,22,24,20,0],"texture":[9]}},"wings":{"top":{"doubleside":true,"offset":{"x":0,"y":20,"z":15},"length":[70],"width":[70,30],"angle":[90],"position":[0,30],"texture":[63],"bump":{"position":10,"size":30}},"top2":{"doubleside":true,"offset":{"x":0,"y":51,"z":5},"length":[70],"width":[50,20],"angle":[90],"position":[0,60],"texture":[63],"bump":{"position":10,"size":30}}},"typespec":{"name":"Barracuda","level":6,"model":11,"code":611,"specs":{"shield":{"capacity":[300,500],"reload":[8,12]},"generator":{"capacity":[100,150],"reload":[8,14]},"ship":{"mass":675,"speed":[70,90],"rotation":[30,45],"acceleration":[130,150],"dash":{"rate":2,"burst_speed":[160,200],"speed":[120,150],"acceleration":[70,70],"initial_energy":[50,75],"energy":[20,30]}}},"shape":[5.28,5.25,5.332,5.393,4.944,1.997,1.745,1.556,1.435,3.587,3.81,3.779,3.838,3.84,3.779,3.81,3.587,3.205,3.571,3.9,5.132,5.888,5.835,5.551,4.886,5.808,4.886,5.551,5.835,5.888,5.132,3.9,3.571,3.205,3.587,3.81,3.779,3.838,3.84,3.779,3.81,3.587,1.435,1.556,1.745,1.997,4.944,5.393,5.332,5.25],"lasers":[],"radius":5.888}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 5, y: 7 } },
                    ABBREVIATION: 'CUDA'
                },
                '612': {
                    SHIP: '{"name":"O-Defender","level":6,"model":12,"code":612, "next":[710,711],"size":2.2, "zoom": 0.96,"specs":{"shield":{"capacity":[400,550],"reload":[9,13]},"generator":{"capacity":[70,100],"reload":[25,40]},"ship":{"mass":550,"speed":[70,80],"rotation":[30,40],"acceleration":[80,110]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-90,-88,0,40,90,95,100,90],"z":[0,0,0,0,0,0,0,0]},"width":[5,6,25,25,15,18,15,0],"height":[2,10,40,40,20,18,15,0],"texture":[63,1,4,10,63,63,17],"propeller":true,"laser":{"damage":[35,60],"rate":2,"type":2,"speed":[145,225],"number":1,"angle":0,"error":0}},"side":{"section_segments":10,"offset":{"x":50,"y":0,"z":0},"position":{"x":[-40,-5,15,25,20,0,-50],"y":[-100,-70,-40,-10,20,50,90],"z":[0,0,0,0,0,0,0]},"width":[5,20,20,20,20,20,5],"height":[15,25,30,30,30,25,15],"texture":[0,1,2,3,4,63]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":18},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,5,10,10,0],"height":[0,5,10,12,0],"texture":[9]},"innersides":{"section_segments":8,"offset":{"x":20,"y":-100,"z":0},"position":{"x":[-3,0,0,0,0,-5,-5],"y":[70,75,100,120,150,175,175],"z":[0,0,0,0,0,0,0]},"width":[0,10,20,22,20,10,0],"height":[0,20,25,25,25,15,0],"propeller":false,"texture":[2,3,63,11,1]}},"wings":{"join":{"offset":{"x":0,"y":20,"z":0},"length":[80,0],"width":[130,50],"angle":[-1],"position":[0,-30],"texture":[8],"bump":{"position":-20,"size":15}}},"typespec":{"name":"O-Defender","level":6,"model":12,"code":612, "next":[710,711], "zoom": 0.96,"specs":{"shield":{"capacity":[450,550],"reload":[11,14]},"generator":{"capacity":[70,110],"reload":[30,50]},"ship":{"mass":500,"speed":[65,75],"rotation":[42,54],"acceleration":[75,95]}},"shape":[4.409,4.448,4.372,4.204,4.119,4.136,4.174,4.107,4.066,4.094,4.073,4.141,4.16,4.062,4.015,3.966,3.83,3.76,3.742,3.591,3.502,3.494,3.575,3.764,4.449,4.409,4.449,3.764,3.575,3.494,3.502,3.591,3.742,3.76,3.83,3.966,4.015,4.062,4.16,4.141,4.073,4.094,4.066,4.107,4.174,4.136,4.119,4.204,4.372,4.448],"lasers":[{"x":0,"y":-3.96,"z":0,"angle":0,"damage":[35,60],"rate":2,"type":2,"speed":[215,275],"number":1,"spread":0,"error":0,"recoil":0}],"radius":4.449}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 7, y: 7 } },
                    ABBREVIATION: 'O-DEF'
                }
            },
            '7': {
                '701': {
                    SHIP: '{"name":"Odyssey","level":7,"model":1,"size":3.1,"specs":{"shield":{"capacity":[600,600],"reload":[12,12]},"generator":{"capacity":[320,320],"reload":[110,110]},"ship":{"mass":520,"speed":[60,60],"rotation":[30,30],"acceleration":[130,130]}},"tori":{"circle":{"segments":20,"radius":95,"section_segments":8,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],"height":[8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],"texture":[63,63,4,10,4,4,10,4,63,63,63,63,3,10,3,3,10,3,63]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-105,-105,-65,-53,-45,-36,-20,-25,40,40,100,90],"z":[0,0,0,0,0,0,0,0,0,1,3,3]},"width":[0,20,40,40,32,15,15,30,30,40,30,0],"height":[0,16,25,25,23,20,16,25,25,20,10,0],"texture":[4,15,63,3,2,4,4,11,10,4,12]},"cannonmain":{"section_segments":6,"offset":{"x":0,"y":-90,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,19,19,7],"height":[0,10,17,7],"texture":[5.9,5.9,2,17],"laser":{"damage":[230,230],"rate":2,"type":1,"speed":[95,95],"number":1,"error":0,"recoil":350}},"laser1":{"section_segments":8,"offset":{"x":109,"y":0,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,3,5,5],"height":[0,3,5,5],"texture":[12,6,63],"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"error":0}},"laser2":{"section_segments":8,"offset":{"x":109,"y":0,"z":0},"position":{"x":[0,0,0,0],"y":[-25,-30,-20,0],"z":[0,0,0,0]},"width":[0,3,5,5],"height":[0,3,5,5],"texture":[12,6,63],"angle":180,"laser":{"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"error":0}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":0,"z":15},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-10,0,10,30],"z":[0,0,0,0,0]},"width":[0,12,15,10,0],"height":[0,20,22,18,0],"texture":[9]},"bumpers":{"section_segments":8,"offset":{"x":85,"y":20,"z":0},"position":{"x":[-10,-5,5,10,5,-10,-15],"y":[-90,-85,-40,0,20,60,65],"z":[0,0,0,0,0,0,0]},"width":[0,10,15,15,15,5,0],"height":[0,20,35,35,25,15,0],"texture":[11,2,63,4,3],"angle":0},"frontbumpers":{"section_segments":8,"offset":{"x":23,"y":-100,"z":0},"position":{"x":[-7.5,-3.5,0,11,2,-8,-8],"y":[-44,-41,10,27,45,60,85],"z":[0,0,0,0,0,0,0]},"width":[0,7,14,13,14,9,7],"height":[0,10,19,29,29,17,8],"texture":[2,2,63,4,4,1],"angle":0},"toppropulsors":{"section_segments":10,"offset":{"x":17,"y":55,"z":15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-20,-15,-5,10,20,25,30,40,50,40],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,10,0],"texture":[3,4,10,3,3,63,4],"propeller":true},"bottompropulsors":{"section_segments":8,"offset":{"x":17,"y":55,"z":-5},"position":{"x":[0,0,0,0,0],"y":[-20,30,40,50,40],"z":[0,0,0,0,0]},"width":[0,12,17,12,0],"height":[0,12,17,12,0],"texture":[3,4,4],"propeller":true}},"wings":{"topjoin":{"offset":{"x":0,"y":-3,"z":0},"doubleside":true,"length":[99],"width":[20,20],"angle":[25],"position":[0,0,0,50],"texture":[1],"bump":{"position":10,"size":30}},"bottomjoin":{"offset":{"x":0,"y":-3,"z":0},"doubleside":true,"length":[100],"width":[20,20],"angle":[-25],"position":[0,0,0,50],"texture":[1],"bump":{"position":-10,"size":30}},"winglets":{"length":[25],"width":[41,26,30],"angle":[10,-10],"position":[-40,-56,-55],"bump":{"position":0,"size":30},"texture":63,"offset":{"x":27,"y":-23.5,"z":-6}}},"typespec":{"name":"Odyssey","level":7,"model":1,"code":701,"specs":{"shield":{"capacity":[600,600],"reload":[12,12]},"generator":{"capacity":[320,320],"reload":[110,110]},"ship":{"mass":520,"speed":[55,55],"rotation":[25,25],"acceleration":[130,130]}},"shape":[7.454,8.98,8.835,6.801,6.568,5.972,2.858,6.866,6.883,6.673,7.189,7.184,7.124,7.124,7.184,7.189,6.945,6.851,6.966,7.014,6.83,4.817,6.436,6.754,6.627,6.523,6.627,6.754,6.436,4.817,6.83,7.014,6.966,6.851,6.945,7.189,7.184,7.124,7.124,7.184,7.189,6.673,6.883,6.866,2.858,5.972,6.568,6.801,8.835,8.98],"lasers":[{"x":0,"y":-7.44,"z":0,"angle":0,"damage":[230,230],"rate":2,"type":1,"speed":[95,95],"number":1,"spread":0,"error":0,"recoil":350},{"x":6.758,"y":-1.86,"z":0,"angle":0,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-6.758,"y":-1.86,"z":0,"angle":0,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":6.758,"y":1.86,"z":0,"angle":180,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0},{"x":-6.758,"y":1.86,"z":0,"angle":-180,"damage":[20,20],"rate":3,"type":1,"speed":[200,200],"number":1,"spread":0,"error":0,"recoil":0}],"radius":8.98}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 12, y: 12 } },
                    ABBREVIATION: 'ODDY'
                },
                '702': {
                    SHIP: '{"name":"Weaver","level":7,"model":2,"size":2.9,"specs":{"shield":{"capacity":[350,350],"reload":[7,7]},"generator":{"capacity":[205,205],"reload":[75,75]},"ship":{"mass":300,"speed":[105,105],"rotation":[65,65],"acceleration":[85,85]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-22,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-70,-68,-15,0,30,40,60,70,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,21,18,20,20,18,15,0],"height":[0,5,20,21,18,20,20,18,15,0],"texture":[11,2,63,3,4,8,15,63,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-42,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-25,-20,0,25,60,62],"z":[-3.2,-3,0,0,0,0]},"width":[4,8,11,8,5,0],"height":[0,2,6,8,4,0],"propeller":false,"texture":[4,9,9,63,4]},"deco":{"section_segments":8,"offset":{"x":50,"y":43,"z":-10},"position":{"x":[-3,-2,5,8,5,0,0],"y":[-62,-60,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,5,10,9,10,5,0],"height":[0,5,10,9,10,5,0],"angle":0,"propeller":false,"texture":[11,2,8,10,63,4]},"cannons":{"section_segments":8,"offset":{"x":38,"y":43,"z":-10},"position":{"x":[0,0,0,0,0,10,10],"y":[-52,-50,-20,0,20,40,42],"z":[0,0,0,0,0,0,0]},"width":[0,4,5,10,10,5,0],"height":[0,8,8,13,13,5,0],"angle":0,"laser":{"damage":[80,80],"rate":2,"type":1,"speed":[225,225],"number":1,"recoil":130},"propeller":false,"texture":[17,13,4,10,63,4]},"bottompropulsors":{"section_segments":12,"offset":{"x":16,"y":-12,"z":-1},"position":{"x":[0,0,0,0,0,0,0,0],"y":[15,5,13,25,30,40,60,50],"z":[5,6,0.1,0,0,0,0,0]},"width":[0,5,10,10,10,7,7,0],"height":[0,5,10,10,10,7,7,0],"propeller":true,"texture":[3,2,10,63,4,8,17]},"toppropulsors":{"section_segments":8,"offset":{"x":46.5,"y":28,"z":-2},"position":{"x":[0,0,0,0,0,0,0,0],"y":[11,7,13,25,30,40,60,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,5,10,10,10,7,7,0],"height":[0,5,10,10,10,7,7,0],"propeller":true,"texture":[4,2,15,63,4,8,17]}},"wings":{"main":{"length":[22],"width":[17,18],"angle":[-40],"position":[1,15],"doubleside":true,"bump":{"position":0,"size":15},"texture":[18,63],"offset":{"x":20,"y":4,"z":5.8}},"main2":{"length":[50],"width":[20,20],"angle":[-20],"position":[-40,30],"doubleside":true,"bump":{"position":30,"size":15},"texture":[63,63],"offset":{"x":0,"y":42,"z":10}},"sides":{"doubleside":true,"offset":{"x":59,"y":23,"z":-10},"length":[-3,5,13,10],"width":[5,10,60,30,10],"angle":[5,5,25,35],"position":[0,0,20,45,58],"texture":[4,3,11,63],"bump":{"position":30,"size":10}},"front":{"length":[-3,20],"width":[0,90,10],"angle":[0,-10],"position":[0,0,40],"doubleside":true,"bump":{"position":30,"size":10},"texture":[15,3.3],"offset":{"x":10,"y":-67,"z":0}},"top":{"doubleside":true,"offset":{"x":14,"y":30,"z":11},"length":[0,15],"width":[0,30,15],"angle":[0,40],"position":[0,0,20],"texture":[11],"bump":{"position":30,"size":10}}},"typespec":{"name":"Weaver","level":7,"model":2,"code":702,"specs":{"shield":{"capacity":[350,350],"reload":[9,9]},"generator":{"capacity":[205,205],"reload":[75,75]},"ship":{"mass":300,"speed":[105,105],"rotation":[65,65],"acceleration":[85,85]}},"shape":[6.509,6.483,4.633,3.665,3.081,2.694,2.417,2.121,1.445,2.963,3.23,3.269,3.366,3.525,3.758,4.071,4.51,5.202,6.441,6.851,5.786,5.973,5.641,3.475,3.424,3.37,3.424,3.475,5.641,5.973,5.786,6.851,6.441,5.202,4.51,4.071,3.758,3.525,3.366,3.269,3.23,2.963,1.445,2.121,2.417,2.694,3.081,3.665,4.633,6.483],"lasers":[{"x":2.204,"y":-0.522,"z":-0.58,"angle":0,"damage":[80,80],"rate":2,"type":1,"speed":[227,227],"number":1,"spread":0,"error":0,"recoil":130},{"x":-2.204,"y":-0.522,"z":-0.58,"angle":0,"damage":[80,80],"rate":2,"type":1,"speed":[225,225],"number":1,"spread":0,"error":0,"recoil":130}],"radius":6.851}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 10, y: 11 } },
                    ABBREVIATION: 'WEAV'
                },
                '703': {
                    SHIP: '{"name":"Ballista","level":7,"model":3,"size":2.9,"specs":{"shield":{"capacity":[450,450],"reload":[8,8]},"generator":{"capacity":[300,300],"reload":[70,70]},"ship":{"mass":500,"speed":[77,77],"rotation":[42,42],"acceleration":[100,100]}},"bodies":{"main_body":{"section_segments":12,"offset":{"x":0,"y":25,"z":11},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-145,-135,-115,-60,-30,10,30,50,60,70,65],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[2,7,12,25,20,20,25,26.5,20,18,0],"height":[0,8,16,23,20,20,25,26.5,20,18,0],"texture":[4,63,10,1,11,2,13,2,4,17],"propeller":true},"top_pew1":{"section_segments":10,"offset":{"x":0,"y":30,"z":55},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-50,-27,-35,10,20,25,30,40,80,70],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,7,8,14,20,14,14,18,9,0],"height":[0,7,9,15,17,15,15,20,10,0],"texture":[6,16.9,10,3,1,63,2,1,16.9],"propeller":true,"laser":{"damage":[20,20],"rate":1,"speed":[185,185],"number":11,"recoil":20,"type":2}},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-60,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-15,-3,25,43,55,100],"z":[0,0,0,0,-1,1,0,0,1,0,0,0]},"width":[1,7,12.4,11,9.5,0],"height":[1,8,15,11,12,0],"texture":[7,9,9,8,31]},"gun1":{"section_segments":8,"offset":{"x":85,"y":15,"z":-22},"position":{"x":[0,0,0,0,0,0,-1],"y":[-28,-40,-34,-14,-5,22,40],"z":[0,0,0,0,0,0,5]},"width":[0,3.4,5,5.5,8,5,0],"height":[0,3.4,5,5.5,8,5,0],"texture":[17,63,4,8,2,3],"angle":4,"laser":{"damage":[15,15],"rate":3,"speed":[185,185],"number":1,"recoil":0,"type":1}},"side_inner":{"section_segments":8,"offset":{"x":56,"y":45,"z":-5},"position":{"x":[-8,-4,-7,0,0,-10,-15],"y":[-60,-45,-25,-14,22.5,40,50],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,9,9,7,0],"height":[0,8,15,15,15,12,0],"texture":[2,3,63,13,63,2],"angle":5},"propulsors":{"section_segments":8,"offset":{"x":38,"y":50,"z":0},"position":{"x":[-15,-15,-8,-12.5,-12,-5,0,-1,-1,-1,0,0,0,0,0],"y":[-95,-100,-80,-50,-40,-20,20,39,50,48],"z":[2.5,2.5,5,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,10,10,20,20,11,10,0],"height":[0,10,13,15,15,20,20,16,12,0],"texture":[6,63,2,13,63,10,2,13,17],"propeller":true}},"wings":{"main":{"doubleside":true,"offset":{"x":57,"y":45,"z":-5},"length":[29,10,20],"width":[70,42,42,15],"angle":[-20,-15,10],"position":[0,-20,-31,-10],"texture":[11,63,4],"bump":{"position":10,"size":10}},"stab":{"length":[13,2,15],"width":[40,30,75,10],"angle":[-20,0,10],"position":[35,45,30,55],"doubleside":true,"texture":[8,4,63],"bump":{"position":20,"size":10},"offset":{"x":5,"y":-125,"z":12}},"join":{"offset":{"x":0,"y":10,"z":23},"length":[0,37,0,34],"width":[0,28,45,45,10],"angle":[90,90,90,-10],"position":[0,10,40,40,65],"texture":[8,8,63],"doubleside":true,"bump":{"position":20,"size":8}}},"typespec":{"name":"Ballista","level":7,"model":3,"code":703,"specs":{"shield":{"capacity":[450,450],"reload":[10,10]},"generator":{"capacity":[280,280],"reload":[70,70]},"ship":{"mass":500,"speed":[75,75],"rotation":[45,45],"acceleration":[100,100]}},"shape":[6.961,7.765,7.01,5.56,4.628,3.222,3.058,2.951,2.85,2.551,5.185,5.203,5.675,6.156,6.803,7.035,5.852,5.959,5.497,5.65,5.949,6.403,6.409,6.098,6.399,6.393,6.399,6.098,6.409,6.403,5.949,5.65,5.497,5.959,5.852,7.035,6.803,6.156,5.675,5.203,5.185,2.551,2.85,2.951,3.058,3.222,4.628,5.56,7.01,7.765],"lasers":[{"x":0,"y":-1.66,"z":3.19,"angle":0,"damage":[20,20],"rate":1,"type":2,"speed":[185,185],"number":11,"spread":0,"error":0,"recoil":20},{"x":4.768,"y":-1.444,"z":-1.276,"angle":4,"damage":[15,15],"rate":3,"type":1,"speed":[185,185],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.768,"y":-1.444,"z":-1.276,"angle":-4,"damage":[15,15],"rate":3,"type":1,"speed":[185,185],"number":1,"spread":0,"error":0,"recoil":0}],"radius":7.765}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 10, y: 12 } },
                    ABBREVIATION: 'BLIST'
                },
                '704': {
                    SHIP: '{"name":"Icarus","level":7,"model":4,"size":2.5,"specs":{"shield":{"capacity":[350,350],"reload":[11,11]},"generator":{"capacity":[250,250],"reload":[52,52]},"ship":{"mass":300,"speed":[110,110],"rotation":[55,55],"acceleration":[90,90]}},"bodies":{"main":{"section_segments":20,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-128,-115,-70,-40,0,40,60,75,90,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,5,10,20,24,20,20,27,29,26,20,0],"height":[0,5,13,30,20,10,10,15,15,15,10,0],"texture":[18,3,13,4,63,63,3,4,63,13,17],"propeller":true,"laser":{"damage":[170,170],"rate":1,"type":1,"speed":[150,150],"number":1,"error":0,"recoil":350}},"air":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-80,-83,-80,-30,-10,10,30,50],"z":[0,0,0,0,0,0,0,0]},"width":[0,23,25,35,30,30,32,20],"height":[0,10,10,10,10,10,10,10,15,15,15,10,10],"texture":[4,63,4,3,2,63,3]},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":18},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-65,-25,0,25,60,90,100],"z":[0,0,0,0,-10,-8,-10]},"width":[0,10,13,10,20,15,10],"height":[0,15,20,10,10,10,10],"texture":[9,9,9,10,63,3]},"laser":{"section_segments":10,"offset":{"x":90,"y":0,"z":-19},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,40,70,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,4,3,13,17],"propeller":true,"angle":4,"laser":{"damage":[14,14],"rate":2,"type":1,"speed":[220,220],"number":1}},"laser2":{"section_segments":10,"offset":{"x":50,"y":-20,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-30,-25,0,10,20,25,30,40,70,65],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,12,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,4,3,13,17],"propeller":true,"angle":2,"laser":{"damage":[23,23],"rate":2,"type":1,"speed":[190,190],"number":1}}},"wings":{"wings":{"offset":{"x":10,"y":0,"z":0},"length":[35,15,30,25],"width":[100,50,60,50,40],"angle":[-10,20,0,0],"position":[0,0,10,30,-10],"texture":[4,63,18,63],"doubleside":true,"bump":{"position":-20,"size":15}},"wings2":{"offset":{"x":10,"y":0,"z":0},"length":[35,15,30,20],"width":[100,50,60,50,25],"angle":[-10,20,0,0],"position":[0,0,10,30,65],"texture":[4,63,18,4],"doubleside":true,"bump":{"position":-20,"size":15}}},"typespec":{"name":"Icarus","level":7,"model":4,"code":704,"specs":{"shield":{"capacity":[400,400],"reload":[9,9]},"generator":{"capacity":[250,250],"reload":[52,52]},"ship":{"mass":300,"speed":[110,110],"rotation":[55,55],"acceleration":[90,90]}},"shape":[6.5,6.068,4.366,3.971,3.26,2.789,3.551,3.705,3.653,3.495,5.873,5.858,5.721,5.7,5.6,5.739,6.19,6.669,5.933,3.646,3.265,2.741,4.401,5.099,5.09,5.01,5.09,5.099,4.401,2.741,3.265,3.646,5.933,6.669,6.19,5.739,5.6,5.7,5.721,5.858,5.873,3.495,3.653,3.705,3.551,2.789,3.26,3.971,4.366,6.068],"lasers":[{"x":0,"y":-6.5,"z":0,"angle":0,"damage":[170,170],"rate":1,"type":1,"speed":[152,152],"number":1,"spread":0,"error":0,"recoil":350},{"x":4.395,"y":-1.496,"z":-0.95,"angle":4,"damage":[14,14],"rate":2,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.395,"y":-1.496,"z":-0.95,"angle":-4,"damage":[14,14],"rate":2,"type":1,"speed":[220,220],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.448,"y":-2.499,"z":-1,"angle":2,"damage":[23,23],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.448,"y":-2.499,"z":-1,"angle":-2,"damage":[23,23],"rate":2,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":6.669}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 11, y: 11 } },
                    ABBREVIATION: 'ICAR'
                },
                '705': {
                    SHIP: '{"name":"Kyvos","level":7,"model":5,"size":1.4,"zoom":0.97,"specs":{"shield":{"capacity":[280,280],"reload":[8,8]},"generator":{"capacity":[220,220],"reload":[60,60]},"ship":{"mass":250,"speed":[130,130],"rotation":[70,70],"acceleration":[130,130]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-20,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-157,-150,-114,-72,-22,5,20,80,102,130,160,150],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,11,26,30,37,38,31,29,28,26,24,0],"height":[0,11,25,26,29,35,39,30,27,26,24,0],"texture":[4,9,9,10,2,4,11,63,2,12,17],"laser":{"damage":[140,140],"rate":2,"type":1,"speed":[60,60],"number":1,"recoil":0},"propeller":true},"tubes":{"section_segments":8,"offset":{"x":35,"y":57,"z":0},"position":{"x":[-9,-11,-6,-9,-11,-13,-15,0,0,0],"y":[-188,-140,-99,-72,-36,0,49,75,115,110],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,22,21,25,22,23,30,16,12,0],"height":[0,13,16,18,15,15,14,14,13,0],"texture":[2,3,2,63,10,63,3,12,17],"propeller":true},"outsidethings":{"section_segments":8,"offset":{"x":36,"y":8,"z":0},"position":{"x":[-3,20,42,29,-7],"y":[-91,-60,-5,50,88],"z":[0,0,0,0,0,0,0]},"width":[13,13,16,16,20],"height":[8,11,13,13,8],"texture":[2,63,4,63],"propeller":false},"toptube":{"section_segments":8,"offset":{"x":0,"y":45,"z":27},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-110,-86,-44,16,39,60],"z":[-9,-4,0,0,-4,-12]},"width":[17,18,19,18,15,13],"height":[10,16,16,12,11,11],"texture":[3,63,11,3,13],"propeller":false}},"wings":{"wing0":{"doubleside":true,"length":[43,30,30],"width":[170,128,70,40],"angle":[0,-16,-19],"position":[0,28,54,54],"offset":{"x":40,"y":19,"z":0},"bump":{"position":25,"size":4},"texture":[4,3.3,63]},"nothing":{"doubleside":true,"length":[36,0],"width":[150,70,0],"angle":[-7,-7],"position":[0,0,0],"offset":{"x":40,"y":18,"z":-5},"bump":{"position":-22,"size":5},"texture":[111]},"winglet0":{"doubleside":true,"length":[34,23],"width":[70,59,30],"angle":[25,20],"position":[10,25,35],"offset":{"x":6,"y":46,"z":20},"bump":{"position":28,"size":7},"texture":[18,63]},"winglet1":{"doubleside":true,"length":[26,20],"width":[50,35,22],"angle":[-12,-12],"position":[8,20,18],"offset":{"x":46,"y":130,"z":-6},"bump":{"position":10,"size":6},"texture":[4,63]}},"typespec":{"name":"Kyvos","level":7,"model":5,"code":705,"specs":{"shield":{"capacity":[280,280],"reload":[9,9]},"generator":{"capacity":[220,220],"reload":[60,60]},"ship":{"mass":250,"speed":[130,130],"rotation":[70,70],"acceleration":[130,130]}},"shape":[4.956,4.773,3.84,3.194,2.808,2.59,2.49,2.435,2.409,2.367,2.396,2.47,2.59,2.773,3.065,4.221,4.479,4.711,4.608,4.373,4.755,5.13,5.101,4.993,4.903,3.927,4.903,4.993,5.101,5.13,4.755,4.373,4.608,4.711,4.479,4.221,3.065,2.773,2.59,2.47,2.396,2.367,2.409,2.435,2.49,2.59,2.808,3.194,3.84,4.773],"lasers":[{"x":0,"y":-4.956,"z":0,"angle":0,"damage":[140,140],"rate":2,"type":1,"speed":[65,65],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.13}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 9 } },
                    ABBREVIATION: 'KYVOS'
                },
                '706': {
                    SHIP: '{"name":"Bass-Cannon","level":7,"model":6,"size":3.4,"specs":{"shield":{"capacity":[600,600],"reload":[10,10]},"generator":{"capacity":[330,330],"reload":[120,120]},"ship":{"mass":520,"speed":[76,76],"rotation":[30,30],"acceleration":[70,70]}},"bodies":{"mainCannon":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-128,-127.5,-125,-127.5,-130,-125,-115,-80,80,95,90],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,3,7.5,15,20,25,27.5,27.5,25,20,0],"height":[0,3,7.5,15,20,25,25,25,25,20,0],"texture":[63,4,3,4,2,3,11,3,13,17],"propeller":true,"laser":{"damage":[60,60],"rate":0.36,"type":1,"speed":[115,115],"number":1,"angle":0,"error":0,"recoil":220}},"cannon2":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0],"y":[-128],"z":[0]},"width":[0],"height":[0],"texture":[63],"propeller":true,"laser":{"damage":[45,45],"rate":0.36,"type":1,"speed":[137,137],"number":2,"angle":6,"error":0}},"cannon3":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0],"y":[-128],"z":[0]},"width":[0],"height":[0],"texture":[63],"propeller":true,"laser":{"damage":[30,30],"rate":0.36,"type":1,"speed":[119,119],"number":6,"angle":35,"error":0}},"cockpit":{"section_segments":12,"offset":{"x":0,"y":70,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-90,-75,-60,-45,-30,0,15,20],"z":[7.5,3,3,0,0,0,0,-4,0,0]},"width":[3,9,11,12,18,15,10,0],"height":[0,10,12,15,15,15,10,0],"texture":[9,9,9,4,10,63,4,3,63]},"side":{"section_segments":8,"offset":{"x":30,"y":10,"z":0},"position":{"x":[-5,-3,-1,0,0,0,0,0,-9],"y":[-100,-90,-70,-50,-15,20,35,60,95],"z":[0,0,0,0,0,0,0,0,3]},"width":[0,12,15,15,17,35,36,28,0],"height":[0,15,15,15,15,15,15,15,0],"texture":[3,63,3,10,63,4,11,2,13,3],"propeller":false},"side2":{"section_segments":8,"offset":{"x":20,"y":10,"z":5},"position":{"x":[-3,0,0,0,0,0,-3],"y":[-85,-45,0,40,75,95],"z":[10,0,0,0,0,0,0]},"width":[0,15,17,28,15,0],"height":[0,15,18,16,15,0],"angle":0,"propeller":false,"texture":[4,2,3,63,3,4]},"mid":{"section_segments":10,"offset":{"x":0,"y":-25,"z":15},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-80,-70,-44,-5,40,80,115,120],"z":[8,1,1,0,0,0,0,0]},"width":[0,13,18,20,20,20,20,0],"height":[0,15,18,18,18,16,15,0],"angle":0,"propeller":false,"texture":[63,4,3,11,4,63,4]}},"wings":{"winglet":{"doubleside":true,"offset":{"x":10,"y":55,"z":30},"length":[20],"width":[50,35],"angle":[0],"position":[0,0],"texture":[3.5],"bump":{"position":10,"size":5}},"winglet2":{"doubleside":true,"offset":{"x":20,"y":-100,"z":0},"length":[17],"width":[30,20],"angle":[0],"position":[0,0],"texture":[3],"bump":{"position":10,"size":10}},"winglet3":{"doubleside":true,"offset":{"x":43,"y":-25,"z":0},"length":[16],"width":[80,125],"angle":[0],"position":[0,0],"texture":[3.5],"bump":{"position":10,"size":1}}},"typespec":{"name":"Bass-Cannon","level":7,"model":6,"code":706,"specs":{"shield":{"capacity":[600,600],"reload":[10,10]},"generator":{"capacity":[330,330],"reload":[110,110]},"ship":{"mass":520,"speed":[75,75],"rotation":[30,30],"acceleration":[75,75]}},"shape":[8.176,8.273,8.138,7.892,6.066,7.176,6.29,5.485,4.945,4.54,4.294,4.14,4.034,4.034,4.14,4.538,5.071,5.48,5.765,6.182,6.278,6.484,6.816,7.281,7.268,7.154,7.268,7.281,6.816,6.484,6.278,6.182,5.765,5.48,5.071,4.538,4.14,4.034,4.034,4.14,4.294,4.54,4.945,5.485,6.29,7.176,6.066,7.892,8.138,8.273],"lasers":[{"x":0,"y":-8.16,"z":0,"angle":0,"damage":[60,60],"rate":0.33,"type":1,"speed":[120,120],"number":1,"spread":0,"error":0,"recoil":220},{"x":0,"y":-8.024,"z":0,"angle":0,"damage":[45,45],"rate":0.33,"type":1,"speed":[142,142],"number":2,"spread":6,"error":0,"recoil":0},{"x":0,"y":-8.024,"z":0,"angle":0,"damage":[30,30],"rate":0.33,"type":1,"speed":[124,124],"number":6,"spread":35,"error":0,"recoil":0}],"radius":8.273}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 12 } },
                    ABBREVIATION: 'BASS'
                },
                '707': {
                    SHIP: '{"name":"Bastion","level":7,"model":7,"size":3.2,"zoom":1.03,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[300,300],"reload":[95,95]},"ship":{"mass":420,"speed":[80,80],"rotation":[30,30],"acceleration":[90,90]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":30,"z":10},"position":{"x":[0,0,0,0,0,0,0],"y":[-40,-50,-20,0,20,40,25],"z":[0,0,0,0,0,0,0]},"width":[0,5,22,18,16,15,0],"height":[0,2,12,16,16,15,0],"texture":[10,1,1,10,8,17],"propeller":true},"thrusters":{"section_segments":8,"offset":{"x":40,"y":23,"z":-24},"position":{"x":[0,0,0,0,0,0],"y":[-25,-20,0,20,40,30],"z":[0,0,0,0,0,0]},"width":[0,8,12,8,8,0],"height":[0,12,12,8,8,0],"texture":[63,2,2,2,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":10,"z":20},"position":{"x":[0,0,0,0,0,0,0],"y":[-15,-10,0,11,35],"z":[-5,-3,-1,0,0]},"width":[0,5,10,10,0],"height":[0,3,5,7,0],"texture":[9]},"cannon1":{"section_segments":4,"offset":{"x":10,"y":-100,"z":1},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,2,4,7,3],"height":[0,1,3,6,0],"texture":[17,4],"laser":{"damage":[6,6],"rate":6,"type":1,"speed":[160,160],"number":1}},"cannon2":{"section_segments":4,"offset":{"x":42.5,"y":-149,"z":8},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,2,4,7,3],"height":[0,1,3,6,0],"texture":[17,4],"angle":2,"laser":{"damage":[8,8],"rate":4,"type":1,"speed":[165,165],"number":1}},"cannon3":{"section_segments":4,"offset":{"x":75,"y":-125,"z":-8},"position":{"x":[0,0,0,0,0,0,0],"y":[-10,0,20,30,40],"z":[0,0,0,0,0]},"width":[0,2,4,7,3],"height":[0,1,3,6,0],"texture":[17,4],"angle":4,"laser":{"damage":[18,18],"rate":1.2,"type":1,"speed":[180,180],"number":1}}},"wings":{"main1":{"doubleside":true,"offset":{"x":9,"y":-5,"z":0},"length":[0,15,0,7],"width":[0,160,70,30,30],"angle":[0,20,0,-10],"position":[30,-20,30,30,30],"texture":[13,63,13,8],"bump":{"position":35,"size":5}},"main2":{"doubleside":true,"offset":{"x":30,"y":-5,"z":0},"length":[0,15,0,20],"width":[0,80,90,200,30],"angle":[30,30,30,30],"position":[30,30,10,-45,30],"texture":[13,3,13,4],"bump":{"position":35,"size":7}},"main3":{"doubleside":true,"offset":{"x":0,"y":5,"z":-7},"length":[45,35,0,20],"width":[40,40,40,200,40],"angle":[-20,20,-20,-5],"position":[20,30,0,-30,10],"texture":[0,8,13,63],"bump":{"position":35,"size":20}}},"typespec":{"name":"Bastion","level":7,"model":7,"code":707,"specs":{"shield":{"capacity":[500,500],"reload":[10,10]},"generator":{"capacity":[300,300],"reload":[95,95]},"ship":{"mass":420,"speed":[80,80],"rotation":[30,30],"acceleration":[90,90]}},"shape":[4.867,7.069,10.527,9.455,9.861,9.25,8.281,7.253,6.749,6.417,6.187,6.076,6.095,6.133,6.28,6.485,6.469,6.534,6.727,6.796,5.069,4.774,4.582,4.582,4.561,4.489,4.561,4.582,4.582,4.774,5.069,6.796,6.727,6.534,6.469,6.485,6.28,6.133,6.095,6.076,6.187,6.417,6.749,7.253,8.281,9.25,9.861,9.455,10.527,7.069],"lasers":[{"x":0.64,"y":-7.04,"z":0.064,"angle":0,"damage":[6,6],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-0.64,"y":-7.04,"z":0.064,"angle":0,"damage":[6,6],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":2.698,"y":-10.176,"z":0.512,"angle":2,"damage":[8,8],"rate":4,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":-2.698,"y":-10.176,"z":0.512,"angle":-2,"damage":[8,8],"rate":4,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":0},{"x":4.755,"y":-8.638,"z":-0.512,"angle":4,"damage":[18,18],"rate":1.2,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":0},{"x":-4.755,"y":-8.638,"z":-0.512,"angle":-4,"damage":[18,18],"rate":1.2,"type":1,"speed":[180,180],"number":1,"spread":0,"error":0,"recoil":0}],"radius":10.527}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 11, y: 11 } },
                    ABBREVIATION: 'BAST'
                },
                '708': {
                    SHIP: '{"name":"Shadow X-3","level":7,"model":8,"size":1.8,"zoom":1,"specs":{"shield":{"capacity":[260,260],"reload":[11,11]},"generator":{"capacity":[170,170],"reload":[58,58]},"ship":{"mass":220,"speed":[140,140],"rotation":[58,58],"acceleration":[105,105]}},"bodies":{"main":{"section_segments":20,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-125,-123,-110,-70,-40,0,40,70,80,90,100],"z":[0,0,0,-2,0,0,0,0,0,0,0]},"width":[0,5,10,20,30,20,20,30,30,30,20,0],"height":[0,5,10,20,20,20,20,15,15,15,10,10],"texture":[12,4,15,4,63,3,4,4,5]},"air":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,-80,-30,-10,10,30,50],"z":[0,0,0,0,0,0,0]},"width":[0,5,35,30,30,32,20],"height":[0,15,10,10,10,10,10,15,15,15,10,10],"texture":[4,3,2,2,2,3]},"back":{"section_segments":10,"offset":{"x":0,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[90,95,100,105,90],"z":[0,0,0,0,0]},"width":[10,15,18,22,2],"height":[3,5,7,8,2],"texture":[63],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-30,"z":18},"position":{"x":[0,0,0,0,0,0,0,0],"y":[-40,-25,0,25,60,90,100],"z":[0,0,0,0,-10,-8,-10]},"width":[0,10,15,10,20,15,10],"height":[0,10,20,20,20,15,10],"texture":[9,9,9,10,63,3]},"booster1":{"section_segments":10,"offset":{"x":32.5,"y":-15,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,-5,-10],"y":[-35,-25,0,10,20,25,30,40,70,90],"z":[0,0,0,0,0,0,0,0,5,10]},"width":[0,10,15,15,15,10,10,15,10,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[6,4,10,3,4,3,4,3,4],"propeller":false,"laser":{"damage":[13,13],"rate":10,"type":1,"speed":[190,190],"number":1}},"booster2":{"section_segments":10,"offset":{"x":55,"y":5,"z":-15},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-35,-25,0,10,20,25,30,40,70,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,15,15,10,10,15,12,0],"height":[0,10,15,15,15,10,10,15,5,0],"texture":[4,4,10,3,4,3,13],"propeller":true}},"wings":{"wings":{"doubleside":true,"offset":{"x":10,"y":0,"z":5},"length":[28,10,15,40],"width":[100,60,80,50,70],"angle":[-10,5,0,-40],"position":[-40,0,40,10,70],"texture":[4,4,4,4],"bump":{"position":-20,"size":15}},"sideBack":{"doubleside":true,"offset":{"x":20,"y":68,"z":0},"length":[30],"width":[30,15],"angle":[-13],"position":[0,30],"texture":[63],"bump":{"position":10,"size":10}},"sideFront":{"doubleside":true,"offset":{"x":10,"y":-95,"z":0},"length":[30],"width":[30,15],"angle":[-13],"position":[0,40],"texture":[63],"bump":{"position":10,"size":10}},"top":{"doubleside":true,"offset":{"x":10,"y":60,"z":5},"length":[30],"width":[50,30],"angle":[50],"position":[0,50],"texture":[3],"bump":{"position":10,"size":10}}},"typespec":{"name":"Shadow X-3","level":7,"model":8,"code":708,"specs":{"shield":{"capacity":[260,260],"reload":[11,11]},"generator":{"capacity":[185,185],"reload":[55,55]},"ship":{"mass":235,"speed":[140,140],"rotation":[58,58],"acceleration":[105,105]}},"shape":[4.5,4.212,3.527,3.123,2.846,2.634,2.103,2.078,1.937,2.348,2.431,2.421,2.571,2.813,3.153,3.601,3.826,4.136,4.602,5.054,3.503,4.162,4.191,4.622,3.892,3.787,3.892,4.622,4.191,4.162,3.503,5.054,4.602,4.136,3.826,3.601,3.153,2.813,2.582,2.421,2.431,2.348,1.937,2.078,2.103,2.634,2.846,3.123,3.527,4.212],"lasers":[{"x":1.17,"y":-1.8,"z":-0.54,"angle":0,"damage":[13,13],"rate":10,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0},{"x":-1.17,"y":-1.8,"z":-0.54,"angle":0,"damage":[13,13],"rate":10,"type":1,"speed":[190,190],"number":1,"spread":0,"error":0,"recoil":0}],"radius":5.054}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 8, y: 9 } },
                    ABBREVIATION: 'X3'
                },
                '709': {
                    SHIP: '{"name":"Inertia","level":7,"model":9,"size":2.7,"zoom":1.04,"specs":{"shield":{"capacity":[550,550],"reload":[12,12]},"generator":{"capacity":[220,220],"reload":[80,80]},"ship":{"mass":500,"speed":[90,90],"rotation":[45,45],"acceleration":[63,63]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":10,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0,0],"y":[-125,-120,-110,-85,-70,-60,-20,0,40,70,90,100,95],"z":[0,0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,15,25,30,37,36,35,33,32,28,20,0],"height":[0,15,25,27,28,27,26,25,23,22,18,15,0],"texture":[4,31,11,1,31,3,2,4,11,3,31,17],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-50,"z":25},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-35,-25,-7,15,50,70,100],"z":[0,0,0,0,0,-1,-1.8]},"width":[0,8,13,15,18,16,5],"height":[0,10,15,15,12,11,5],"texture":[9,9,9,11,63,4,4]},"topengines":{"section_segments":8,"offset":{"x":25,"y":60,"z":18},"position":{"x":[-5,-5,-4,-2,-2,-2,-2,-2],"y":[-60,-55,-40,-6,15,45,58,53],"z":[-10,-10,-8,-2,-1,0,0,0]},"width":[0,7,9.5,12,12,11,9,0],"height":[0,7,9.5,10,10,11,9,0],"texture":[31,4,2,8,63,4,17],"propeller":true},"cannons":{"section_segments":12,"offset":{"x":36.1,"y":-50,"z":0},"position":{"x":[0,0.95,1,2,3,5,2,1,0,0],"y":[-30,-40,-38,-20,0,20,30,40,42],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,5,5,6,10,10,8,4,0],"height":[0,5,5,6,10,10,8,5,0],"texture":[17,31,12,31,8,3,3,31],"propeller":false,"angle":0,"laser":{"damage":[40,40],"rate":6,"type":1,"speed":[165,165],"recoil":85,"number":1,"error":0,"angle":0}},"sidetopengines":{"section_segments":8,"offset":{"x":50,"y":70,"z":28},"position":{"x":[0,0,0,0,0,0,0,0,0],"y":[-65,-55,-60,-45,-15,10,45,58,53],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,7,10,15,14,15,12,9,0],"height":[0,7,10,15,12,14,12,9,0],"texture":[4,17,63,3,4,10,3,17],"propeller":true,"angle":0},"sidebottomengines":{"section_segments":8,"offset":{"x":65,"y":60,"z":-28},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-65,-55,-60,-40,5,25,45,58,53],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,7,10,15,13,14,12,9,0],"height":[0,7,10,15,13,14,12,9,0],"texture":[4,17,4,11,31,2,4,17],"propeller":true,"angle":0},"sides":{"section_segments":8,"offset":{"x":10,"y":-20,"z":0},"position":{"x":[-10,-2,0,5,7,0],"y":[-95,-90,-80,-40,-30,10],"z":[0,0,0,0,0,0]},"width":[0,10,15,20,20,0],"height":[0,15,22,26,21,0],"propeller":false,"texture":[4,31,10,31,31,2,12]}},"wings":{"cannonjointop":{"doubleside":true,"offset":{"x":6,"y":-50,"z":15},"length":[32,25],"width":[50,60,20],"angle":[-25,-20],"position":[20,0,15],"texture":[18,63],"bump":{"position":10,"size":5}},"cannonjoinbottom":{"doubleside":true,"offset":{"x":6,"y":-50,"z":-15},"length":[32,25],"width":[50,60,20],"angle":[25,20],"position":[20,0,15],"texture":[18,63],"bump":{"position":10,"size":5}},"enginejointop":{"doubleside":true,"offset":{"x":15,"y":55,"z":5},"length":[50],"width":[50,60],"angle":[38],"position":[20,0],"texture":[63],"bump":{"position":10,"size":10}},"enginejoinbottom":{"doubleside":true,"offset":{"x":15,"y":55,"z":0},"length":[62],"width":[50,60],"angle":[-30],"position":[20,0],"texture":[63],"bump":{"position":10,"size":10}}},"typespec":{"name":"Inertia","level":7,"model":9,"code":709,"specs":{"shield":{"capacity":[550,550],"reload":[12,12]},"generator":{"capacity":[220,220],"reload":[80,80]},"ship":{"mass":500,"speed":[85,85],"rotation":[45,45],"acceleration":[68,68]}},"shape":[6.21,6.114,5.861,5.364,5.334,4.452,4.145,4.029,3.901,3.6,2.613,2.308,3.695,4.212,4.458,4.613,4.865,5.229,5.808,6.607,7.481,7.531,7.611,7.268,6.487,5.952,6.487,7.268,7.611,7.531,7.481,6.607,5.808,5.229,4.865,4.613,4.458,4.212,4.05,2.308,2.613,3.6,3.901,4.029,4.145,4.452,5.334,5.364,5.861,6.114],"lasers":[{"x":2.001,"y":-4.86,"z":0,"angle":0,"damage":[40,40],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":85},{"x":-2.001,"y":-4.86,"z":0,"angle":0,"damage":[40,40],"rate":6,"type":1,"speed":[165,165],"number":1,"spread":0,"error":0,"recoil":85}],"radius":7.611}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 10, y: 12 } },
                    ABBREVIATION: 'INERT'
                },
                '710': {
                    SHIP: '{"name":"Sagittarius","level":7,"model":10,"size":1.6,"specs":{"shield":{"capacity":[400,400],"reload":[6,6]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":450,"speed":[80,80],"rotation":[30,30],"acceleration":[80,80]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":45,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-130,-125,-90,-45,5,50,100,140,130],"z":[-6,-6,-6,-6,0,0,0,0,0,0,0]},"width":[0,12,20,22,35,45,30,25,0],"height":[0,6,15,15,18,22,24,20,0],"texture":[9,9,9,2,10,63,8,17],"propeller":true},"propulors":{"section_segments":8,"offset":{"x":48,"y":75,"z":5},"position":{"x":[-5,-5,0,0,0,0,0,0,0,0],"y":[-105,-95,-50,-10,30,100,140,130],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,14,25,22,30,35,25,0],"height":[0,14,25,22,30,35,25,0],"texture":[2,63,4,11,4,2,17],"propeller":true,"angle":0},"reinforcements":{"section_segments":8,"offset":{"x":100,"y":-115,"z":-30},"position":{"x":[0,0,0,20,5,8],"y":[-100,-93,-70,-20,35,100],"z":[-15,-15,-10,0,0,0]},"width":[0,10,14,18,13,0],"height":[0,10,14,15,13,0],"texture":[4,63,2,3,4],"propeller":false,"angle":45},"exhausts":{"section_segments":8,"offset":{"x":60,"y":25,"z":-20},"position":{"x":[0,0,-5,0,-10,-10,0,10,10,20,20],"y":[-130,-125,-80,-30,-10,10,40,60,100,130,110],"z":[-6,-6,-6,-6,-3,0,6,6,6,0,0]},"width":[0,10,15,20,20,15,15,20,25,20,0],"height":[0,10,15,20,20,15,15,20,25,20,0],"texture":[63,4,3,3,63,4,63,10,4,13],"propeller":false,"angle":15},"exhausts2":{"section_segments":8,"offset":{"x":70,"y":-15,"z":-40},"position":{"x":[-5,-5,-10,-10,0,-8,-4,8,10,20,20],"y":[-130,-125,-95,-60,-30,10,40,60,100,130,110],"z":[-6,-6,-6,-6,-6,-3,0,6,6,6,0,0]},"width":[0,10,15,20,20,15,20,25,25,20,0],"height":[0,10,15,20,20,15,20,25,25,20,0],"texture":[63,4,13,1,3,4,63,3,4,13],"propeller":false,"angle":30},"impulse":{"section_segments":12,"offset":{"x":0,"y":-65,"z":-40},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0,0],"y":[-160,-120,-140,-120,-100,-85,-70,-30,0,20,50,40],"z":[0,0,0,0,0,0,0,0,0,0,0,0]},"width":[0,10,20,24,30,20,30,40,30,25,25,0],"height":[0,10,20,24,30,20,30,40,30,25,25,0],"texture":[6,18,13,4,63,63,8,4,4],"propeller":true,"angle":0,"laser":{"damage":[60,60],"rate":4,"type":1,"speed":[305,305],"number":1,"error":0,"angle":0,"recoil":150}}},"wings":{"topppp":{"offset":{"x":5,"y":85,"z":-2},"length":[60,60,80],"width":[100,90,60,20],"angle":[60,0,-30],"position":[-20,50,80,145],"texture":[3,11,3],"doubleside":true,"bump":{"position":0,"size":10}},"main":{"offset":{"x":0,"y":-15,"z":-35},"length":[50,60,120],"width":[100,70,50,20],"angle":[-40,0,30],"position":[-40,20,80,155],"texture":[2,63,1],"doubleside":true,"bump":{"position":0,"size":10}},"mainmain":{"offset":{"x":0,"y":-45,"z":-35},"length":[50,60,70],"width":[100,70,40,20],"angle":[-10,0,-30],"position":[-20,20,70,100],"texture":[2,4,1],"doubleside":true,"bump":{"position":0,"size":10}},"wing":{"offset":{"x":0,"y":-175,"z":-20},"length":[120],"width":[60,20],"angle":[-20],"position":[80,0],"texture":[63],"doubleside":true,"bump":{"position":0,"size":12}},"lets":{"offset":{"x":0,"y":-175,"z":-20},"length":[130],"width":[40,15],"angle":[-5],"position":[100,75],"texture":[63],"doubleside":true,"bump":{"position":0,"size":12}}},"typespec":{"name":"Sagittarius","level":7,"model":10,"code":710,"specs":{"shield":{"capacity":[500,500],"reload":[9,9]},"generator":{"capacity":[200,200],"reload":[60,60]},"ship":{"mass":450,"speed":[80,80],"rotation":[30,30],"acceleration":[80,80]}},"shape":[7.2,6.591,6.154,5.938,6.933,6.732,5.953,5.661,5.541,5.676,5.866,3.021,3.342,4.051,5.491,5.82,5.969,7.996,8.057,6.169,9.307,8.58,7.266,7.234,7.004,5.931,7.004,7.234,7.266,8.58,9.307,6.169,8.057,7.996,5.969,5.82,5.491,4.051,3.342,3.021,5.866,5.676,5.541,5.661,5.953,6.732,6.933,5.938,6.154,6.591],"lasers":[{"x":0,"y":-7.2,"z":-1.28,"angle":0,"damage":[60,60],"rate":4,"type":1,"speed":[305,305],"number":1,"spread":0,"error":0,"recoil":150}],"radius":9.307}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 10, y: 10 } },
                    ABBREVIATION: 'SAGI'
                },
                '711': {
                    SHIP: '{"name":"Aries","level":7,"model":11,"size":3.9,"specs":{"shield":{"capacity":[750,750],"reload":[13,13]},"generator":{"capacity":[200,200],"reload":[95,95]},"ship":{"mass":600,"speed":[65,65],"rotation":[35,35],"acceleration":[95,95]}},"bodies":{"main":{"section_segments":12,"offset":{"x":0,"y":-5,"z":8},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-60,-40,-30,-15,0,15,25,45,70],"z":[0,0,0,0,0,0,0,0,0]},"width":[0,15,20,22,22,18,15,10,0],"height":[0,10,13,15,15,15,12,10,0],"texture":[2,15,15,3,4,3,63,15]},"mainlow":{"section_segments":6,"angle":0,"offset":{"x":0,"y":5,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0,0],"y":[-100,-95,-80,-70,-10,10,60,70,85,90,85],"z":[0,0,0,0,0,0,0,0,0,0,0]},"width":[0,20,25,10,12,12,15,20,20,16,0],"height":[0,10,12,8,12,12,8,12,10,7,0],"texture":[3.9,63,3.9,3.9,3.9,3.9,3.9,63,12.9,16.9],"propeller":true},"cockpit":{"section_segments":8,"offset":{"x":0,"y":-20,"z":7},"position":{"x":[0,0,0,0,0,0,0],"y":[-30,-15,0,30,60],"z":[9,0,0,3,5]},"width":[3,12,15,10,0],"height":[0,20,24,19,0],"texture":[9,9,63,4]},"frontjoin":{"section_segments":6,"angle":45,"offset":{"x":8,"y":0,"z":-3},"position":{"x":[0,0,0,0],"y":[-60,-55,-40,-30],"z":[0,0,0,0]},"width":[0,10,15,10],"height":[0,10,12,8],"texture":[3.9,63,3.9]},"arm110":{"section_segments":6,"angle":110,"offset":{"x":10,"y":-10,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-10],"z":[0,0,0,0,0]},"width":[0,18,22,10,12],"height":[0,10,12,8,12],"texture":[3.9,63,3.9]},"arm140":{"section_segments":6,"angle":140,"offset":{"x":10,"y":0,"z":0},"position":{"x":[0,0,0,0,0],"y":[-90,-85,-70,-60,-10],"z":[0,0,0,0,0]},"width":[0,18,22,10,12],"height":[0,10,12,8,12],"texture":[3.9,63,3.9]},"cannon":{"section_segments":6,"offset":{"x":0,"y":-68,"z":0},"position":{"x":[0,0,0],"y":[-28,-30,-20],"z":[0,0,0]},"width":[0,10,8],"height":[0,5,5],"texture":[5.9],"laser":{"damage":[120,120],"rate":3,"type":1,"speed":[155,155],"number":1,"error":0,"recoil":150}},"spike1":{"section_segments":6,"offset":{"x":59,"y":15.5,"z":9},"position":{"x":[0,0,0,0,0,0],"y":[-35,-30,-20,0,10,12],"z":[0,0,0,0,-5,-10]},"width":[0,3,5,7,6,0],"height":[0,3,5,7,6,0],"texture":[2,3,12.9,3.9],"angle":-120,"laser":{"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"error":0,"recoil":0,"angle":180}},"spike2":{"section_segments":6,"offset":{"x":40,"y":58,"z":11},"position":{"x":[0,0,0,0,0,0],"y":[-35,-30,-20,0,10,12],"z":[0,0,0,0,-5,-10]},"width":[0,3,5,7,6,0],"height":[0,3,5,7,6,0],"texture":[2,3,12.9,3.9],"angle":215,"laser":{"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"error":0,"recoil":0,"angle":180}},"frontside":{"section_segments":6,"offset":{"x":38,"y":-35,"z":0},"position":{"x":[0,0,0,0,0,0,0],"y":[-50,-35,-20,0,20,35,50],"z":[0,0,0,0,0,0,0]},"width":[0,7,10,10,10,7,0],"height":[10,15,15,15,15,15,0],"texture":[2.9,63,3.9,3.9,63,2.9],"angle":18}},"wings":{"side_joins":{"offset":{"x":0,"y":5,"z":5},"length":[40,30],"width":[50,30,0],"angle":[30,-10],"position":[0,0,50],"texture":[11,3],"bump":{"position":10,"size":20}}},"typespec":{"name":"Aries","level":7,"model":11,"code":711,"specs":{"shield":{"capacity":[750,750],"reload":[13,13]},"generator":{"capacity":[200,200],"reload":[95,95]},"ship":{"mass":600,"speed":[63,63],"rotation":[35,35],"acceleration":[95,95]}},"shape":[7.659,7.674,7.149,6.467,6.039,5.561,5.132,4.793,4.558,4.415,4.346,4.278,5.332,5.896,6.029,7.427,5.82,5.603,6.593,6.339,8.225,7.32,6.398,7.159,7.488,7.425,7.488,7.159,6.398,7.32,8.225,6.339,6.593,5.603,5.82,7.427,6.029,5.896,5.332,4.278,4.346,4.415,4.558,4.793,5.132,5.561,6.039,6.467,7.149,7.674],"lasers":[{"x":0,"y":-7.644,"z":0,"angle":0,"damage":[120,120],"rate":3,"type":1,"speed":[155,155],"number":1,"spread":0,"error":0,"recoil":150},{"x":6.966,"y":2.574,"z":0.702,"angle":-120,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0},{"x":-6.966,"y":2.574,"z":0.702,"angle":120,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0},{"x":4.686,"y":6.76,"z":0.858,"angle":215,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0},{"x":-4.686,"y":6.76,"z":0.858,"angle":-215,"damage":[15,15],"rate":2,"type":1,"speed":[155,155],"number":1,"spread":180,"error":0,"recoil":0}],"radius":8.225}}',
                    HITBOX: { CENTER: { x: 0, y: 0 }, SIZE: { x: 10, y: 12 } },
                    ABBREVIATION: 'ARIES'
                }
            }
        },
        EPSILON: 0.0001,
    }

    constructor(tier, shipMap) {
        this.tier = tier;

        this.processShips(shipMap);
    }

    processShips(shipMap) {
        let tierLength = Object.values(shipMap).length;
        let i = 0;
        for (let value of Object.values(shipMap)) {
            let ship = value.SHIP;
            this.ships.push(ship);

            let jship = JSON.parse(ship);

            jship.model = i + 1;
            jship.typespec.model = jship.model;
            jship.typespec.code = jship.level * 100 + jship.model;

            this.normalShips.push(JSON.stringify(jship));

            jship.model = jship.model + tierLength;
            jship.typespec.model = jship.model;
            jship.typespec.code = jship.level * 100 + jship.model;
            
            jship.next = [];
            jship.typespec.next = [];

            jship.typespec.specs.generator.capacity[0] = ShipGroup.C.EPSILON;
            jship.typespec.specs.generator.capacity[1] = ShipGroup.C.EPSILON;
            jship.specs.generator.capacity[0] = ShipGroup.C.EPSILON;
            jship.specs.generator.capacity[1] = ShipGroup.C.EPSILON;
            jship.typespec.specs.generator.reload[0] = ShipGroup.C.EPSILON;
            jship.typespec.specs.generator.reload[1] = ShipGroup.C.EPSILON;
            jship.specs.generator.reload[0] = ShipGroup.C.EPSILON;
            jship.specs.generator.reload[1] = ShipGroup.C.EPSILON;
            jship.typespec.specs.ship.speed[0] = ShipGroup.C.EPSILON;
            jship.typespec.specs.ship.speed[1] = ShipGroup.C.EPSILON;
            jship.specs.ship.speed[0] = ShipGroup.C.EPSILON;
            jship.specs.ship.speed[0] = ShipGroup.C.EPSILON;
            jship.typespec.specs.ship.acceleration[0] = ShipGroup.C.EPSILON;
            jship.typespec.specs.ship.acceleration[1] = ShipGroup.C.EPSILON;
            jship.specs.ship.acceleration[0] = ShipGroup.C.EPSILON;
            jship.specs.ship.acceleration[1] = ShipGroup.C.EPSILON;

            let idleShip = JSON.stringify(jship);
            // this.idleShips.push(idleShip);

            i++;
        }
        
        this.ships.push(...Helper.deepCopy(this.normalShips));
        this.ships.push(...Helper.deepCopy(this.idleShips));
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

    static getUpgrades(type) {
        let level = Math.floor(type / 100);
        let currentShip = ShipGroup.C.SHIPS[`${level}`][`${type}`];
        if (!currentShip) {
            return [];
        }
        else {
            let jShip = JSON.parse(currentShip.SHIP);
            let nextShips = jShip.next;
            if (!nextShips || nextShips.length === 0) {
                return [];
            }
            return nextShips;
        }
    }
}

const ShipLerp = class {
    ship = null;
    
    name = '';

    startPose = null;
    targetPose = null;

    t = 0;
    
    baseModule = null;
    targetDifference = null;

    autoStop = true;
    holdFor = 0;
    isAcceptable = false;

    invulnerable = false;

    duration = 0;

    running = true;

    prevTime = -1;

    static C = {
        TYPES: {
            EXIT_SPAWN: {
                NAME: 'exit-spawn',
                BLEND_FACTOR: 0.25
            },
            ENTER_DEPOT: {
                NAME: 'enter-depot',
                BLEND_FACTOR: 0.5
            },
            EXIT_DEPOT: {
                NAME: 'exit-depot',
                BLEND_FACTOR: 0.25
            },
            REPULSE_DOOR: {
                NAME: 'repulse-door',
                BLEND_FACTOR: 0.25
            },
        },
        MAX_VEL: 0.5,
        AUTO_STOP_THRESHOLD: 5,
        AUTO_STOP_TIMEOUT: 100
    }

    constructor(ship, name, targetPose, t = 0.1, baseModule = null, autoStop = true, holdFor = 0, invulnerable = true) {
        this.ship = ship;
        this.name = name;
        this.startPose = ship.getPose();
        this.targetPose = targetPose;
        this.t = t;
        this.baseModule = baseModule;
        this.autoStop = autoStop;
        this.holdFor = holdFor;
        this.invulnerable = invulnerable;

        if (this.baseModule) {
            this.targetDifference = this.targetPose.subtract(this.baseModule.pose);
        }

        this.running = true;
        this.prevTime = game.step;
    }

    tick() {
        if (this.prevTime < 0) {
            this.prevTime = game.step; 
            return;
        }
        if (this.running) {
            this.ship.setIdle(true);
            if (this.invulnerable) {
                this.ship.setInvulnerable(Ship.C.INVULNERABLE_TIME);
            }
            this.ship.setCollider(false);
            this.ship.setAngle(this.targetPose.rotation);
            if (this.holdFor > 0) {
                this.holdFor -= game.step - this.prevTime;
                this.ship.setPosition(this.startPose.position);
                this.ship.setVelocity(new Vector2());
                this.prevTime = game.step;
                return;
            }

            let shipPose = this.ship.getPose();
            if (shipPose) {
                this.isAcceptable = this.targetPose.subtract(shipPose).position.length() < ShipLerp.C.AUTO_STOP_THRESHOLD;
                if (this.autoStop && (this.isAcceptable || this.duration - this.holdFor > ShipLerp.C.AUTO_STOP_TIMEOUT)) {
                    this.stop();
                    return;
                }

                if (this.baseModule) {
                    this.targetPose = this.baseModule.pose.add(this.targetDifference);
                }
                
                let lerpPose = shipPose.lerp(this.targetPose, this.t, ShipLerp.C.MAX_VEL);
                let poseDifference = lerpPose.subtract(shipPose);
                if (poseDifference.position.x > game.mapSize * 5 || poseDifference.position.x < -game.mapSize * 5 ||
                    poseDifference.position.y > game.mapSize * 5 || poseDifference.position.y < -game.mapSize * 5) {
                    let norm = poseDifference.position.normalize();
                    poseDifference.position = norm.multiply(poseDifference.position.length() - game.mapSize * 10);
                }
                let velocity = poseDifference.position.divide(game.step - this.prevTime);
                if (velocity.length() > ShipLerp.C.MAX_VEL) {
                    velocity = velocity.normalize().multiply(ShipLerp.C.MAX_VEL);
                }
                // this.ship.setPosition(lerpPose.position); // It's more clunky but more accurate
                this.ship.setVelocity(velocity);

                this.duration += game.step - this.prevTime;
                this.prevTime = game.step;
            } else {
                this.stop();
                return;
            }
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

    inDepot = null;
    weaponsStoreTime = -1;
    isDonating = false;
    lastContributedAmount = 0;
    credits = 0;
    totalContributed = 0;
    selectedItems = [];
    selectedTab = 0;
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

        this.inDepot = null;
        this.weaponsStoreTime = -1;
        this.isDonating = false;
        this.credits = 0;
        this.lastContributedAmount = 0;
        this.selectedItems = [];
        this.selectedTab = 0;
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

const Base = class {
    team = null;
    pose = null;

    objs = [];

    baseModules = [];

    allBaseModules = [];
    powerCore = null;
    subBaseModules = [];
    containerBaseModules = [];
    alienBaseModules = [];
    spawnBaseModules = [];
    depotBaseModules = [];
    turretBaseModules = [];
    doorBaseModules = [];
    powercoreBaseModules = [];
    staticBaseModules = [];

    safeAliens = [];

    crystals = 0;
    baseLevel = 1;
    dead = false;
    reachedMaxLevel = false;
    maxRecords = [];
    
    spawning = false;

    doorsOpened = true;
    canHeal = true;

    lastAttackTime = -1;

    baseUpgrades = [];

    static C = {
        SCALES: [
            0.9,
            1,
            1.25,
            1.5
        ],
        NUM_SIDES: [
            2,
            3,
            3,
            4
        ],
        MAX_CRYSTALS: [
            720,
            1440,
            2880,
            5760
        ],
        RADII: [
            30,
            35,
            45,
            50,
        ],
        ORBIT_RADIUS: 280, // 2/3
        ALLOWED_TIERS: [
            [1, 2, 3],
            [4],
            [5],
            [6]
        ],
        ROTATION_RATE: -Math.PI / (60 * 5),
        ORBIT_RATE: Math.PI / (60 * 10),
        INITIAL_ORBIT_ROTATION: Math.PI / 2,
        ATTACK_DURATION: 60 * 30
    };

    constructor(team) {
        this.team = team;
        let angle = (this.team.team * 2 * Math.PI) / Game.C.OPTIONS.FRIENDLY_COLORS;
        this.pose = new Pose(
            new Vector2(
                Math.cos(angle) * Base.C.ORBIT_RADIUS,
                Math.sin(angle) * Base.C.ORBIT_RADIUS
            ).rotateBy(Base.C.INITIAL_ORBIT_ROTATION),
            Math.PI * this.team.team
        );

        for (let baseUpgrade of DepotBaseModule.C.WEAPONS_STORE_BASE_UPGRADES) {
            this.baseUpgrades.push({
                level: 0,
                default: baseUpgrade
            });
        }
    }

    clearContainers() {
        this.objs = [];

        this.baseModules = [];

        this.allBaseModules = [];
        this.powerCore = null;
        this.subBaseModules = [];
        this.containerBaseModules = [];
        this.alienBaseModules = [];
        this.spawnBaseModules = [];
        this.depotBaseModules = [];
        this.turretBaseModules = [];
        this.staticBaseModules = [];

        this.safeAliens = [];
    }

    spawnBase() {
        this.spawning = true;
        this.destroySelf();
        this.dead = false;
        this.clearContainers();
        g.timeouts.push(new TimeoutCreator(() => {
            this.spawnObjs();
            this.spawnModules();
        }, Game.C.TICKS.BASE_STAGGER).start());
        return this;
    }

    spawnObjs() {
        // let basePose = new Pose(
        //     this.pose.position,
        //     this.pose.rotation,
        //     new Vector3(1, 1, 1).multiply(Base.C.RADII[this.baseLevel - 1] * 2.5)
        // );
        // let baseGlow = Helper.deepCopy(Obj.C.OBJS.BASE_GLOW);
        // let baseGlowObj = new Obj(baseGlow.id, baseGlow.type, baseGlow.position, baseGlow.rotation, baseGlow.scale, true, true, this.team.hex);
        // baseGlowObj.setPoseTransformed(basePose);
        // this.objs.push(baseGlowObj.update());
    }

    spawnModules() {
        if (this.baseLevel > 1 && this.canHeal) {
            this.powerCore = new PowercoreBaseModule(this, null, new Pose(new Vector2(), 0, new Vector3(1, 1, 1).multiply(10)));
            this.baseModules.push(this.powerCore);
        }
        for (let i = 0; i < Base.C.NUM_SIDES[this.baseLevel - 1]; i++) {
            let angle = (i * 2 * Math.PI) / Base.C.NUM_SIDES[this.baseLevel - 1];
            let subBase = new SubBaseModule(
                this,
                new Pose(
                    new Vector2(
                        Math.cos(angle),
                        Math.sin(angle)
                    ).multiply(Base.C.RADII[this.baseLevel - 1]),
                    angle,
                    new Vector3(1, 1, 1).multiply(Base.C.SCALES[this.baseLevel - 1])
                ),
            );
            subBase.baseModules.push(
                new StaticBaseModule(this, subBase, new Pose(new Vector2(), Math.PI * 9/8, new Vector3(1, 1, 1).multiply(5))),
                new SpawnBaseModule(this, subBase, new Pose(new Vector2(0.5, 10.5), Math.PI * -1.9 / 3, new Vector3(1, 1, 1).multiply(5))),
                new AlienBaseModule(this, subBase, new Pose(new Vector2(9, -2.5), Math.PI, new Vector3(1, 1, 1).multiply(10))),
                new TurretBaseModule(this, subBase, new Pose(new Vector2(0, 1), Math.PI, new Vector3(1, 1, 1).multiply(4)))
            );
            let depotAngle = Math.PI * 1 / 8;
            for (let j = 0; j < 2; j++) {
                let depotPose = new Pose(
                    new Vector2(
                        -5 + Math.cos(depotAngle + Math.PI / 2) * j * DepotBaseModule.C.STEP,
                        -6.5 + Math.sin(depotAngle + Math.PI / 2) * j * DepotBaseModule.C.STEP
                    ),
                    depotAngle,
                    new Vector3(1, 1, 1).multiply(5)
                );
                let depotModule = new DepotBaseModule(this, subBase, depotPose, i == Base.C.NUM_SIDES[this.baseLevel - 1] - 1 && j == 1 && this.baseLevel == 1 ? () => {
                    this.spawning = false;
                } : () => {});
                subBase.baseModules.push(depotModule);
            }
            // let turretAngle = Math.PI * 1 / 12;
            // for (let j = 0; j < 2; j++) {
            //     let turretPose = new Pose(
            //         new Vector2(
            //             1 + Math.cos(turretAngle + Math.PI / 2) * j * TurretBaseModule.C.STEP,
            //             -4 + Math.sin(turretAngle + Math.PI / 2) * j * TurretBaseModule.C.STEP
            //         ),
            //         turretAngle + Math.PI,
            //         new Vector3(1, 1, 1).multiply(3.5)
            //     );
            //     let turretModule = new TurretBaseModule(this, subBase, turretPose, j == 0, i == Base.C.NUM_SIDES[this.baseLevel - 1] - 1 && j == 1 && this.baseLevel == 1 ? () => {
            //             this.spawning = false;
            //         } : () => {});
            //     subBase.baseModules.push(turretModule);
            // }
            if (this.baseLevel > 1) {
                let doorStart = new Vector2(-5, 7);
                let doorEnd = (new Vector2(Base.C.RADII[this.baseLevel - 1], 0).divide(Base.C.SCALES[this.baseLevel - 1]).add(new Vector2(3, -9))).rotateBy((2 * Math.PI) / Base.C.NUM_SIDES[this.baseLevel - 1]).subtract(new Vector2(Base.C.RADII[this.baseLevel - 1], 0).divide(Base.C.SCALES[this.baseLevel - 1]));
                let doorDims = doorEnd.subtract(doorStart).divide(DoorBaseModule.C.NUM_DOORS);
                let doorAngle = doorStart.getAngleTo(doorEnd) + Math.PI / 2;
                for (let j = 0; j < DoorBaseModule.C.NUM_DOORS; j++) {
                    let doorPose = new Pose(
                        new Vector2(
                            doorStart.x + doorDims.x * (1/2 + j),
                            doorStart.y + doorDims.y * (1/2 + j)
                        ),
                        doorAngle,
                        new Vector3(1, 1, 1).multiply(doorDims.length())
                    );
                    let doorModule = new DoorBaseModule(this, subBase, doorPose, i == Base.C.NUM_SIDES[this.baseLevel - 1] - 1 && j == DoorBaseModule.C.NUM_DOORS - 1 ? () => {
                        this.spawning = false;
                    } : () => {});
                    subBase.baseModules.push(doorModule);
                }
            }
            this.baseModules.push(subBase);
            for (let baseModule of subBase.baseModules) {
                baseModule.container = subBase;
            }
        }

        for (let i = 0; i < this.baseModules.length; i++) {
            g.timeouts.push(new TimeoutCreator(() => {
                this.baseModules[i].spawnBaseModule();
            }, Game.C.TICKS.BASE_STAGGER * i).start());
        }
    }

    tick() {
        this.pose.rotation += Base.C.ROTATION_RATE;
        this.pose.position = this.pose.position.rotateBy(Base.C.ORBIT_RATE);
        for (let obj of this.objs) {
            obj.setPose(new Pose(this.pose.position, obj.getPose().rotation, obj.getPose().scale));
            obj.update();
        }
        for (let baseModule of this.baseModules) {
            baseModule.tick();
        }
        this.checkDoorConditions();
        return this;
    }

    checkDoorConditions() {
        let oppTeam = g.getOppTeam(this.team);
        if (this.baseLevel > 1 && oppTeam && oppTeam.base) {
            let diffCrystals = this.getTotalCrystals() - oppTeam.base.getTotalCrystals();
            if (!this.doorsOpened && (diffCrystals <= Base.C.MAX_CRYSTALS[oppTeam.base.baseLevel - 1] * DoorBaseModule.C.OPENING_DIFF || (this.reachedMaxLevel || oppTeam.base.reachedMaxLevel))) {
                g.sendNotifications('Base Gates Opening!', 'The doors of your base are opening due to crystals being more equalized.', this.team, this.team);
                this.doorsOpened = true;
            }
            if (this.doorsOpened && diffCrystals >= Base.C.MAX_CRYSTALS[oppTeam.base.baseLevel - 1] * DoorBaseModule.C.CLOSING_DIFF && oppTeam.base.baseLevel < 4) {
                g.sendNotifications('Base Gates Closing!', 'The doors of your base are closing due to the enemy team having far less crystals than you.', this.team, this.team);
                this.doorsOpened = false;
            }
        }
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

    getTotalCrystals() {
        let totalCrystals = 0;
        for (let i = 0; i < this.baseLevel - 1; i++) {
            totalCrystals += Base.C.MAX_CRYSTALS[i];
        }
        return totalCrystals + this.crystals;
    }

    refreshSelf() {
        for (let baseModule of this.baseModules) {
            baseModule.refreshSelf();
        }
    }

    destroySelf() {
        for (let obj of this.objs) {
            obj.destroySelf();
        }
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

const BaseModule = class {
    base = null;
    subBase = null;
    container = null;
    type = '';
    relativePose = new Pose();
    pose = new Pose();
    objs = [];
    ready = false;
    dead = false;
    spawnCallback = null;

    static C = {
        TYPES: {
            SUB: 'sub',
            CONTAINER: 'container',
            ALIEN: 'alien',
            SPAWN: 'spawn',
            DEPOT: 'depot',
            TURRET: 'turret',
            DOOR: 'door',
            POWERCORE: 'powercore',
            STATIC: 'static',
        },
    };

    constructor(base, subBase, type, relativePose, spawnCallback = null) {
        this.base = base;
        this.subBase = subBase;
        this.container = subBase ? subBase : base;
        this.type = type;
        this.relativePose = relativePose;
        this.spawnCallback = spawnCallback;

        this.base.allBaseModules.push(this);
    }

    tick() {
        if (!this.ready) return this;
        this.setAbsolutePose();
        this.updateObjs();
        return this;
    }
    
    spawnBaseModule() {
        this.ready = true;
        this.setAbsolutePose();
        this.createObjs();
        if (this.spawnCallback) {
            this.spawnCallback();
        }
        return this;
    }

    createObjs() {
        for (let obj of this.objs) {
            obj.destroySelf();
        }
        this.objs = [];
        return this;
    }

    updateObjs(preventDefaultFor = []) {
        if (this.ready) {
            for (let obj of this.objs) {
                if (obj) {
                    if (preventDefaultFor.includes(obj)) continue;
                    obj.setPoseTransformed(this.pose, true);
                    obj.update();
                }
            }
        }
        return this;
    }

    createUShape() {
        let uShape = Helper.deepCopy(Obj.C.OBJS.U_SHAPE);
        let uShapeObj = new Obj(uShape.id, uShape.type, uShape.position, uShape.rotation, uShape.scale, true, true, this.base.team.hex);
        uShapeObj.setPoseTransformed(this.pose, true);
        this.objs.push(uShapeObj.update());
        return this;
    }

    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.container.pose);
        return this;
    }

    setPose(pose, updateImmediately = false) {
        this.relativePoseDifference = this.pose.subtract(this.relativePose);
        this.relativePose = pose.subtract(this.relativePoseDifference);
        this.setAbsolutePose();
        if (updateImmediately) {
            this.updateObjs();
        }
        return this;
    }

    deactivate() {
        this.dead = true;  // NEED TO MODIFY THIS LOGIC IF BASES CAN BE HEALED
        let removedObjs = [];
        let addedObjs = [];
        for (let obj of this.objs) {
            obj.destroySelf();
            removedObjs.push(obj);
            let deactivatedObj = new Obj(obj.originalObj.id, obj.originalObj.type, obj.originalObj.position, obj.originalObj.rotation, obj.originalObj.scale, true, true, '#4d4d4d');
            deactivatedObj.setPoseTransformed(this.pose, true);
            addedObjs.push(deactivatedObj);
        }
        for (let obj of removedObjs) {
            Helper.deleteFromArray(this.objs, obj);
        }
        for (let obj of addedObjs) {
            this.objs.push(obj.update());
        }
        return this;
    }

    reactivate() {
        this.dead = false;
        for (let obj of this.objs) {
            obj.destroySelf();
        }
        this.objs = [];
        this.createObjs();
        return this;
    }
    
    refreshSelf() {
        if (!this.ready) return;
        for (let obj of this.objs) {
            if (obj) {
                obj.destroySelf();
            }
        }
        return this;
    }

    destroySelf() {
        this.dead = true;
        for (let obj of this.objs) {
            obj.destroySelf();
        }
        return this;
    }
}

const ContainerBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.CONTAINER;
    baseModules = [];

    constructor(base, subBase, relativePose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.CONTAINER, relativePose, spawnCallback);

        this.base.containerBaseModules.push(this);
    }

    tick() {
        super.tick();
        for (let i = 0; i < this.baseModules.length; i++) {
            g.timeouts.push(new TimeoutCreator(() => {
                if (!this.baseModules[i]) return;
                this.baseModules[i].tick();
            }, Game.C.TICKS.BASE_STAGGER_FAST * i).start());
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
        for (let i = 0; i < this.baseModules.length; i++) {
            g.timeouts.push(new TimeoutCreator(() => {
                if (!this.baseModules[i]) return;
                this.baseModules[i].spawnBaseModule();
            }, Game.C.TICKS.BASE_STAGGER * i).start());
        }
        return this;
    }
    
    setAbsolutePose() {
        this.pose = this.relativePose.getAbsolutePose(this.container.pose);
        
        for (let i = 0; i < this.baseModules.length; i++) {
            g.timeouts.push(new TimeoutCreator(() => {
                if (!this.baseModules[i]) return;
                this.baseModules[i].setAbsolutePose();
            }, Game.C.TICKS.BASE_STAGGER * i).start());
        }
        return this;
    }

    createObjs() {
        super.createObjs();
        for (let i = 0; i < this.baseModules.length; i++) {
            g.timeouts.push(new TimeoutCreator(() => {
                if (!this.baseModules[i]) return;
                this.baseModules[i].createObjs();
            }, Game.C.TICKS.BASE_STAGGER * i).start());
        }
        return this;
    }

    deactivate() {
        super.deactivate();
        for (let i = 0; i < this.baseModules.length; i++) {
            g.timeouts.push(new TimeoutCreator(() => {
                if (!this.baseModules[i]) return;
                this.baseModules[i].deactivate();
            }, Game.C.TICKS.BASE_STAGGER * i).start());
        }
    }

    refreshSelf() {
        super.refreshSelf();
        for (let baseModule of this.baseModules) {
            baseModule.refreshSelf();
        }
        return this;
    }

    destroySelf() {
        super.destroySelf();
        for (let baseModule of this.baseModules) {
            baseModule.destroySelf();
        }
        this.baseModules = [];
        return this;
    }
}

const SubBaseModule = class extends ContainerBaseModule {
    type = BaseModule.C.TYPES.SUB;
    health = 0;
    maxHealth = SubBaseModule.C.MAX_HEALTH[0];
    healingRate = 0;

    depotExitQueue = null;

    static C = {
        MAX_HEALTH: [
            800,
            1000,
            2000,
            3000
        ],
        HEALING_RATE: [
            200, // Prevents trolling
            100,
            150,
            200
        ],
        DEPOT_EXIT_QUEUE_TIME: 15
    }

    constructor(base, relativePose, spawnCallback = null) {
        super(base, null, relativePose, spawnCallback);
        this.health = SubBaseModule.C.MAX_HEALTH[base.baseLevel - 1];
        this.type = BaseModule.C.TYPES.SUB;

        this.depotExitQueue = new StaggeredQueueCreator(SubBaseModule.C.DEPOT_EXIT_QUEUE_TIME);

        this.base.subBaseModules.push(this);
    }

    tick() {
        super.tick();
        this.maxHealth = SubBaseModule.C.MAX_HEALTH[this.base.baseLevel - 1] * Math.pow(this.base.baseUpgrades[0].default.MULTIPLIER, this.base.baseUpgrades[0].level);
        this.healingRate = SubBaseModule.C.HEALING_RATE[this.base.baseLevel - 1] * Math.pow(this.base.baseUpgrades[1].default.MULTIPLIER, this.base.baseUpgrades[1].level);
        if (!this.dead && this.health > 0) {
            this.health += this.healingRate;
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
        }
        return this;
    }

    manageQueues() {
        this.depotExitQueue.tick();
    }
}

const PowercoreBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.POWERCORE;
    powercoreObj = null;
    safeAlien = null;
    health = PowercoreBaseModule.C.MAX_HEALTH[0];

    static C = {
        MAX_HEALTH: [
            1000,
            1500,
            2500,
            3000
        ],
    }

    constructor(base, subBase, pose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.POWERCORE, pose, spawnCallback);

        this.health = PowercoreBaseModule.C.MAX_HEALTH[base.baseLevel - 1];
    }

    createSafeAlien() {
        this.safeAlien = new SafeAlien(new Pose(new Vector2()), this);
        if (this.base) {
            this.base.safeAliens.push(this.safeAlien);
        }
    }

    spawnBaseModule() {
        super.spawnBaseModule();
        this.createSafeAlien();
        if (this.safeAlien) {
            this.safeAlien.spawnAlien();
        }
        return this;
    }

    createObjs() {
        super.createObjs();
        let powercore = Helper.deepCopy(Obj.C.OBJS.POWERCORE);
        let powercoreObj = new Obj(powercore.id, powercore.type, powercore.position, powercore.rotation, powercore.scale, true, true, this.base.team.hex);
        let nonRotatedPose = new Pose(
            this.pose.position,
            0,
            this.pose.scale
        );
        powercoreObj.setPoseTransformed(nonRotatedPose, false);
        this.objs.push(powercoreObj.update());
        this.powercoreObj = powercoreObj;
        return this;
    }

    updateObjs() {
        super.updateObjs([this.powercoreObj]);
        if (this.powercoreObj) {
            let nonRotatedPose = new Pose(
                this.pose.position,
                0,
                this.pose.scale
            );
            this.powercoreObj.setPoseTransformed(nonRotatedPose, false);
            this.powercoreObj.update();
        }
    }

    deactivate() {
        super.deactivate();
        this.base.canHeal = false;
    }
}

const AlienBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.ALIEN;
    safeAlien = null;

    constructor(base, subBase, pose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.ALIEN, pose, spawnCallback);

        this.base.alienBaseModules.push(this);
    }

    createSafeAlien() {
        this.safeAlien = new SafeAlien(new Pose(new Vector2(-0.5, 0)), this);
        if (this.base) {
            this.base.safeAliens.push(this.safeAlien);
        }
    }
    
    spawnBaseModule() {
        super.spawnBaseModule();
        this.createSafeAlien();
        if (this.safeAlien) {
            this.safeAlien.spawnAlien();
        }
        return this;
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
    }

    deactivate() {
        super.deactivate();
        if (this.safeAlien) {
            this.safeAlien.destroySelf();
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

const SpawnBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.SPAWN;

    spawnGlow = null;

    static C = {
        SPAWN_INITIAL_OFFSET: {
            x: 1,
            y: 0
        },
        SPAWN_FINAL_OFFSET: {
            x: -3,
            y: 0
        },
        SPAWN_DELAY: 60
    }

    constructor(base, subBase, pose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.SPAWN, pose, spawnCallback);

        this.base.spawnBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
        this.createSpawnGlow();
    }

    createSpawnGlow() {
        let spawnGlow = Helper.deepCopy(Obj.C.OBJS.SPAWN_GLOW);
        let spawnGlowObj = new Obj(spawnGlow.id, spawnGlow.type, spawnGlow.position, spawnGlow.rotation, spawnGlow.scale, true, true, this.base.team.hex);
        spawnGlowObj.setPoseTransformed(this.pose, true);
        this.objs.push(spawnGlowObj.update());
        this.spawnGlow = spawnGlowObj;
        return this;
    }

    deactivate() {
        if (this.spawnGlow) {
            this.spawnGlow.destroySelf();
            Helper.deleteFromArray(this.objs, this.spawnGlow);
            this.spawnGlow = null;
        }
        super.deactivate();
    }
}

const DepotBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.DEPOT;

    depotGlow = null;

    static C = {
        STEP: 8,
        SUCK_RECTANGLE: {
            CENTER: {
                x: -1,
                y: 0
            },
            SIZE: {
                x: 2,
                y: 1
            }
        },
        DEPOT_FINAL_OFFSET: {
            x: -3,
            y: 0
        },
        ANGLE_THRESHOLD: Math.PI / 6,
        WEAPONS_STORE_TIME: 3600,
        DONATE_SPEED_MULTIPLIER: 3,
        WEAPONS_STORE_SECONDARIES: [
            {
                NAME: 'Rocket',
                ICON: '🚀',
                BASE_COST: 100,
                FREQUENCY: 4,
                CODE: 10
            },
            {
                NAME: 'Space Mine',
                ICON: '💣',
                BASE_COST: 100,
                FREQUENCY: 8,
                CODE: 20
            },
            {
                NAME: 'Mining Pod',
                ICON: '🔧',
                BASE_COST: 120,
                FREQUENCY: 1,
                CODE: 40
            },
            {
                NAME: 'Attack Pod',
                ICON: '⚔️',
                BASE_COST: 120,
                FREQUENCY: 1,
                CODE: 41
            },
            {
                NAME: 'Defense Pod',
                ICON: '🛡️',
                BASE_COST: 120,
                FREQUENCY: 1,
                CODE: 42
            },
            {
                NAME: 'Energy Refill',
                ICON: '⚡💊',
                BASE_COST: 200,
                FREQUENCY: 2,
                CODE: 90
            },
            {
                NAME: 'Shield Refill',
                ICON: '🛡️💊',
                BASE_COST: 200,
                FREQUENCY: 2,
                CODE: 91
            },
            {
                NAME: 'Heavy Mines',
                ICON: '💣💣',
                BASE_COST: 200,
                FREQUENCY: 4,
                CODE: 21
            },
            {
                NAME: 'Missiles',
                ICON: '🚀🚀',
                BASE_COST: 250,
                FREQUENCY: 2,
                CODE: 11
            },
            {
                NAME: 'Torpedo',
                ICON: '🚀🚀🚀',
                BASE_COST: 500,
                FREQUENCY: 1,
                CODE: 12
            }
        ],
        WEAPONS_STORE_BASE_UPGRADES: [
            {
                ID: 1,
                NAME: 'Health',
                MULTIPLIER: 1.25,
                ICON: '❤️',
                BASE_COST: 500,
                ALLOWED: 3
            },
            {
                ID: 2,
                NAME: 'Heal Rate',
                MULTIPLIER: 1.25,
                ICON: '💖',
                BASE_COST: 500,
                ALLOWED: 3
            },
            {
                ID: 3,
                NAME: 'Turret Range',
                MULTIPLIER: 1.25,
                ICON: '🔭',
                BASE_COST: 400,
                ALLOWED: 3
            },
            {
                ID: 4,
                NAME: 'Turret Damage',
                MULTIPLIER: 1.25,
                ICON: '💥',
                BASE_COST: 400,
                ALLOWED: 3
            },
            {
                ID: 5,
                NAME: 'Turret Shoot Delay',
                MULTIPLIER: 0.75,
                ICON: '🔥',
                BASE_COST: 400,
                ALLOWED: 3
            },
            {
                ID: 6,
                NAME: 'Credit Multiplier',
                MULTIPLIER: 1.25,
                ICON: '💰',
                BASE_COST: 600,
                ALLOWED: 1
            },
        ]
    }

    constructor(base, subBase, pose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.DEPOT, pose, spawnCallback);

        this.base.depotBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createUShape();
        this.createDepotGlow();
    }

    createDepotGlow() {
        let depotGlow = Helper.deepCopy(Obj.C.OBJS.DEPOT_GLOW);
        let depotGlowObj = new Obj(depotGlow.id, depotGlow.type, depotGlow.position, depotGlow.rotation, depotGlow.scale, true, true, this.base.team.hex);
        depotGlowObj.setPoseTransformed(this.pose, true);
        this.depotGlow = depotGlowObj;
        this.objs.push(depotGlowObj.update());
        return this;
    }

    deactivate() {
        if (this.depotGlow) {
            this.depotGlow.destroySelf();
            Helper.deleteFromArray(this.objs, this.depotGlow);
            this.depotGlow = null;
        }
        super.deactivate();
    }
}

const TurretBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.TURRET;
    isUpper = false;
    isShooting = false;
    turretRange = null;
    laserRange = 0;
    laserDamage = 0;
    laserShootDelay = 0;
    lasers = [];

    shotTime = 0;
    lastFired = 'lower';

    static C = {
        STEP: 8,
        CONTROL_RECTANGLES: { // NEED TO UPDATE WITH SCALING CHANGES
            UPPER: {
                CENTER: {
                    x: 0,
                    y: -10
                },
                SIZE: {
                    x: 10,
                    y: 10
                }
            },
            LOWER: {
                CENTER: {
                    x: -10,
                    y: 10
                },
                SIZE: {
                    x: 10,
                    y: 10
                }
            }
        },
        OFFSETS: {
            BASE: {
                x: -1.5,
                y: 0
            },
            UPPER: {
                x: 0,
                y: -0.25
            },
            LOWER: {
                x: 0,
                y: 0.25
            }
        },
        LASERS: [
            {
                DAMAGE: 8,
                RANGE: 25,
                SHOOT_DELAY: 80
            },
            {
                DAMAGE: 12,
                RANGE: 30,
                SHOOT_DELAY: 80
            },
            {
                DAMAGE: 20,
                RANGE: 35,
                SHOOT_DELAY: 80
            },
            {
                DAMAGE: 30,
                RANGE: 40,
                SHOOT_DELAY: 80
            }
        ],
        MIN_SHIP_VELOCITY: 0.6,
        OVERESTIMATION_FACTOR: 0.3,
        LERP: {
            BLEND_FACTOR: 0.75,
            MAX_ANG_VEL: 0.75
        }
    }

    constructor(base, subBase, pose, isUpper = false, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.TURRET, pose, spawnCallback);
        this.isUpper = isUpper;

        this.base.turretBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createTurret();
        this.createTurretRange();
    }

    createTurret() {
        let turret = Helper.deepCopy(Obj.C.OBJS.TURRET);
        let turretObj = new Obj(turret.id, turret.type, turret.position, turret.rotation, turret.scale, true, true, this.base.team.hex);
        turretObj.setPoseTransformed(this.pose, true);
        this.objs.push(turretObj.update());
        return this;
    }

    createTurretRange() {
        let turretRange = Helper.deepCopy(Obj.C.OBJS.TURRET_RANGE);
        let turretRangeObj = new Obj(turretRange.id, turretRange.type, turretRange.position, turretRange.rotation, turretRange.scale, true, true, this.base.team.hex);
        turretRangeObj.setPoseTransformed(new Pose(this.pose.position, 0, new Vector3(this.laserRange * 2, this.laserRange * 2, 1)), true);
        this.objs.push(turretRangeObj.update());
        this.turretRange = turretRangeObj;
        return this;
    }

    tick() {
        super.tick();

        this.laserRange = TurretBaseModule.C.LASERS[this.base.baseLevel - 1].RANGE * Math.pow(this.base.baseUpgrades[2].default.MULTIPLIER, this.base.baseUpgrades[2].level);
        this.laserDamage = TurretBaseModule.C.LASERS[this.base.baseLevel - 1].DAMAGE * Math.pow(this.base.baseUpgrades[3].default.MULTIPLIER, this.base.baseUpgrades[3].level);
        this.laserShootDelay = TurretBaseModule.C.LASERS[this.base.baseLevel - 1].SHOOT_DELAY / Math.pow(this.base.baseUpgrades[4].default.MULTIPLIER, this.base.baseUpgrades[4].level);

        this.aimAndShoot();
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
        return this;
    }

    updateObjs() {
        super.updateObjs([this.turretRange]);
        if (this.turretRange) {
            this.turretRange.setPoseTransformed(new Pose(this.pose.position, 0, new Vector3(this.laserRange * 2, this.laserRange * 2, 1)), true);
            this.turretRange.update();
        }
        return this;
    }

    aimAndShoot() {
        if (this.base && !this.base.dead && this.ready && !this.dead) {
            let baseLaserPose = this.pose.add(new Pose(new Vector2(TurretBaseModule.C.OFFSETS.BASE.x, TurretBaseModule.C.OFFSETS.BASE.y).multiplyComponents(this.pose.scale).rotateBy(this.pose.rotation), 0));
            let oppTeam = g.getOppTeam(this.base.team);
            if (oppTeam) {
                let closestShip = null;
                let closestDistance = Infinity;
                for (let ship of oppTeam.ships) {
                    let shipPos = ship.getPosition();
                    if (shipPos == null || ship.lerp || ship.ship.alive == false) continue;
                    let distance = shipPos.getDistanceTo(baseLaserPose.position);
                    if (!closestShip || distance < closestDistance) {
                        closestShip = ship;
                        closestDistance = distance;
                    }
                }
                if (closestShip && closestDistance < this.laserRange) {
                    let turretPose = this.pose.clone();
                    turretPose.rotation = closestShip.getPosition().getAngleTo(baseLaserPose.position);
                    this.setPose(turretPose, true);

                    if (game.step - this.shotTime >= this.laserShootDelay && game.step % Game.C.TICKS.BASE_MANAGER_SLOW < Game.C.TICKS.BASE_MANAGER_SLOW - 1 - Obj.C.OBJS.LASER.EXISTENCE_TIME) {
                        let offset;
                        if (!this.lastFired || this.lastFired === 'lower') {
                            offset = TurretBaseModule.C.OFFSETS.UPPER;
                            this.lastFired = 'upper';
                        } else {
                            offset = TurretBaseModule.C.OFFSETS.LOWER;
                            this.lastFired = 'lower';
                        }
                        let firePose = baseLaserPose.add(new Pose(new Vector2(offset.x, offset.y).rotateBy(this.pose.rotation)));
                        this.lasers.push(new Laser(firePose.position, this.pose.rotation, closestDistance, this.base.team.hex).spawn());
                        this.shotTime = game.step;

                        closestShip.takeDamage(this.laserDamage);
                    }
                }
            }
        }
    }

    deactivate() {
        if (this.turretRange) {
            this.turretRange.destroySelf();
            Helper.deleteFromArray(this.objs, this.turretRange);
            this.turretRange = null;
        }
        super.deactivate();
    }

    destroySelf() {
        super.destroySelf();
        for (let laser of this.lasers) {
            laser.destroySelf();
        }
        this.lasers = [];
        return this;
    }
}

const DoorBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.DOOR;
    doorFrame = null;
    door = null;

    currentStepAmount = 0;
    doorOpened = false;
    lastOpenedTime = -1;

    static C = {
        NUM_DOORS: 2,
        DOOR_HEIGHT: 2.5,
        DOOR_CYCLE_STEPS: 5,
        CLOSING_DIFF: 0.25,
        OPENING_DIFF: 0.1,
        REPULSE_RECTANGLE: {
            CENTER: {
                x: 0,
                y: 0
            },
            SIZE: {
                x: 1.5,
                y: 0.5
            }
        },
        REPULSE_FINAL_OFFSET: {
            x: -0.5,
            y: 0
        }
    }

    constructor(base, subBase, pose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.DOOR, pose, spawnCallback);

        this.base.doorBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createDoorFrame();
        this.createDoor();
    }

    createDoorFrame() {
        let doorFrame = Helper.deepCopy(Obj.C.OBJS.DOOR_FRAME);
        let doorFrameObj = new Obj(doorFrame.id, doorFrame.type, doorFrame.position, doorFrame.rotation, doorFrame.scale, true, true, this.base.team.hex);
        doorFrameObj.setPoseTransformed(this.pose, true);
        this.objs.push(doorFrameObj.update());
        this.doorFrame = doorFrameObj;
        return this;
    }

    createDoor() {
        let door = Helper.deepCopy(Obj.C.OBJS.DOOR);
        let doorObj = new Obj(door.id, door.type, door.position, door.rotation, door.scale, true, true, this.base.team.hex);
        doorObj.setPoseTransformed(this.pose, true);
        this.objs.push(doorObj.update());
        this.door = doorObj;
        return this;
    }

    updateObjs() {
        super.updateObjs([this.door]);
    }

    tick() {
        super.tick();
        if (this.door) {
            let doorHeight = DoorBaseModule.C.DOOR_HEIGHT * this.door.obj.scale.z;
            let doorZPos = -this.currentStepAmount / DoorBaseModule.C.DOOR_CYCLE_STEPS * doorHeight;
            if (this.base.doorsOpened) {
                if (this.currentStepAmount < DoorBaseModule.C.DOOR_CYCLE_STEPS) {
                    this.currentStepAmount++;
                }
            } else {
                if (this.currentStepAmount > 0) {
                    this.currentStepAmount--;
                }
            }
            this.door.setPoseTransformed(this.pose, true);
            this.door.obj.position.z = Obj.C.OBJS.DOOR.position.z + doorZPos;   
            this.door.update();
        }
        return this;
    }

    deactivate() {
        super.deactivate();
        for (let obj of this.objs) {
            if (obj.obj.id.includes(Obj.C.OBJS.DOOR.id)) {
                this.door = obj;
                this.doorOpened = true;
            } else if (obj.obj.id.includes(Obj.C.OBJS.DOOR_FRAME.id)) {
                this.doorFrame = obj;
            }
        }
    }
}

const StaticBaseModule = class extends BaseModule {
    type = BaseModule.C.TYPES.STATIC; // Essentially will house all the other objects that do nothing but look pretty

    constructor(base, subBase, pose, spawnCallback = null) {
        super(base, subBase, BaseModule.C.TYPES.STATIC, pose, spawnCallback);

        this.base.staticBaseModules.push(this);
    }

    createObjs() {
        super.createObjs();
        this.createTriangle();
    }

    createTriangle() {
        let triangle = Helper.deepCopy(Obj.C.OBJS.TRIANGLE);
        let triangleObj = new Obj(triangle.id, triangle.type, triangle.position, triangle.rotation, triangle.scale, true, true, this.base.team.hex);
        triangleObj.setPoseTransformed(this.pose, true);
        this.objs.push(triangleObj.update());
        return this;
    }
}

const Laser = class {
    laser = null;
    running = false;
    
    laserRotation = null;
    laserDistance = null;
    hex = null;
    existenceTime = null;

    constructor(pos, laserRotation, laserDistance, hex, existenceTime = Obj.C.OBJS.LASER.EXISTENCE_TIME) {
        this.pos = pos;
        this.laserRotation = laserRotation;
        this.laserDistance = laserDistance;
        this.hex = hex;
        this.existenceTime = existenceTime;
    }

    spawn() {
        this.laser = new TimedObj(
            new Obj(
                Obj.C.OBJS.LASER.id,
                Obj.C.OBJS.LASER.type,
                new Vector3(this.pos.x - Math.cos(this.laserRotation) * this.laserDistance / 2, this.pos.y - Math.sin(this.laserRotation) * this.laserDistance / 2, Obj.C.OBJS.LASER.position.z),
                new Vector3(Obj.C.OBJS.LASER.rotation.x, Obj.C.OBJS.LASER.rotation.y, this.laserRotation + Math.PI / 2),
                new Vector3(Obj.C.OBJS.LASER.scale.x, this.laserDistance, Obj.C.OBJS.LASER.scale.z),
                true,
                true,
                Helper.adjustBrightness(this.hex, 0.5)
            ),
            this.existenceTime
        ).spawn();
        g.timedObjs.push(this.laser);

        this.running = true;
        return this;
    }

    tick() {
        if (this.laser) {
            if (!this.laser.running) {
                this.destroySelf();
            }
        }
    }

    destroySelf() {
        if (this.laser) {
            this.laser.destroySelf();
        }
        this.laser = null;
        this.running = false;
        return this;
    }
}

const Bullet = class {
    laser = null;
    initialPose = null;
    speed = null;
    damage = null;
    range = 0;
    
    team = null;

    prevTime = -1;

    dead = false;

    constructor(initialPose, speed, damage, range, team = null) {
        this.initialPose = initialPose;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.team = team;
    }

    spawn() {
        let laser = Helper.deepCopy(Obj.C.OBJS.BULLET);
        laser = this.initialPose.transformObj(laser);
        this.laser = new Obj(laser.id, laser.type, laser.position, laser.rotation, laser.scale, true, true, this.team.hex).update();
        return this;
    }

    tick() {
        if (this.prevTime < 0) {
            this.prevTime = game.step;
            return;
        }

        let dt = game.step - this.prevTime;

        if (this.laser) {
            let laserPose = this.laser.getPose();
            if (laserPose.position.getDistanceTo(this.initialPose.position) >= this.range) {
                this.destroySelf();
                return;
            }
            this.laser.setPose(laserPose.add(new Pose(new Vector2(this.speed * dt, 0).rotateBy(this.laser.getPose().rotation))));
            this.laser.update();

            this.checkCollisions();
        }

        this.prevTime = game.step;
    }

    checkCollisions() {
        let oppTeam = this.team ? g.getOppTeam(this.team) : null;
        if (oppTeam) {
            for (let ship of oppTeam.ships) {
                if (ship.ship.alive) {
                    let shipPose = ship.getPose();
                    if (shipPose) {
                        let rectangle = ShipGroup.C.SHIPS[`${ship.getLevel()}`][`${ship.ship.type}`].HITBOX;
                        let shipRectangle = new Rectangle(new Vector2(rectangle.CENTER.x, rectangle.CENTER.y).rotateBy(shipPose.rotation).add(shipPose.position), new Vector2(rectangle.SIZE.x, rectangle.SIZE.y), shipPose.rotation);
                        if (shipRectangle.containsPoint(this.laser.getPose().position)) {
                            ship.takeDamage(this.damage);
                            this.destroySelf();
                            return;
                        }
                    }
                }
            }
        }
    }

    destroySelf() {
        if (this.laser) {
            this.laser.destroySelf();
        }
        this.laser = null;
        this.dead = true;
        return this;
    }
}

const SafeAlien = class {
    alien = null;
    relativePose = null;
    pose = null;
    baseModule = null;
    baseLevelFields = SafeAlien.C.BASE_LEVELS[0];
    lastSetShield = -1;
    dead = false;

    timeouts = [];

    static C = {
        TICKS: {
            SPAWN_DELAY: 10,
            SHIELD_RESET_TIME: 60 * 5
        },
        ALL: {
            POINTS: 0,
            CRYSTAL_DROP: 0,
            VELOCITY: {
                x: 0,
                y: 0
            },
            DAMAGE: 1,
            LASER_SPEED: 1,
            RATE: 0.1
        },
        BASE_LEVELS: [
            {
                SUB_BASE: {
                    NAME: 'Chicken',
                    SHIELD: 50,
                    SCORE: 25,
                    CRYSTALS_BASE_REMOVED: 10,
                    REGEN: 2,
                    CODE: 10,
                    LEVEL: 2
                }
            },
            {
                POWERCORE: {
                    NAME: 'Saucer',
                    SHIELD: 500,
                    SCORE: 100,
                    REGEN: 30,
                    CODE: 19,
                    LEVEL: 0
                },
                SUB_BASE: {
                    NAME: 'Saucer',
                    SHIELD: 75,
                    SCORE: 32,
                    CRYSTALS_BASE_REMOVED: 20,
                    REGEN: 5,
                    CODE: 19,
                    LEVEL: 0
                }
            },
            {
                POWERCORE: {
                    NAME: 'Saucer',
                    SHIELD: 500,
                    SCORE: 100,
                    REGEN: 40,
                    CODE: 19,
                    LEVEL: 0
                },
                SUB_BASE: {
                    NAME: 'Saucer',
                    SHIELD: 100,
                    SCORE: 50,
                    CRYSTALS_BASE_REMOVED: 30,
                    REGEN: 10,
                    CODE: 19,
                    LEVEL: 1
                }
            },
            {
                POWERCORE: {
                    NAME: 'Saucer',
                    SHIELD: 500,
                    SCORE: 100,
                    REGEN: 50,
                    CODE: 19,
                    LEVEL: 0
                },
                SUB_BASE: {
                    NAME: 'Saucer',
                    SHIELD: 150,
                    SCORE: 75,
                    CRYSTALS_BASE_REMOVED: 40,
                    REGEN: 12,
                    CODE: 19,
                    LEVEL: 1
                }
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
        if (!this.dead) {
            this.setAbsolutePose();
            if (this.pose && this.baseModule && this.baseModule.base && this.baseModule.base.team) {
                this.baseLevelFields = SafeAlien.C.BASE_LEVELS[this.baseModule.base.baseLevel - 1];
                if (this.baseModule.type === BaseModule.C.TYPES.POWERCORE) {
                    this.baseLevelFields = this.baseLevelFields.POWERCORE;
                } else {
                    this.baseLevelFields = this.baseLevelFields.SUB_BASE;
                }
                this.alien = new Alien(this.pose.position, new Vector2(SafeAlien.C.ALL.VELOCITY.x, SafeAlien.C.ALL.VELOCITY.y), this.baseLevelFields.NAME, this.baseLevelFields.CODE, this.baseLevelFields.LEVEL, SafeAlien.C.ALL.POINTS, SafeAlien.C.ALL.CRYSTAL_DROP, this.baseLevelFields.WEAPON_DROP);
                this.alien.setID(`${this.baseModule.base.team.team}-${Helper.getRandomString(10)}`);
                this.alien.setPosition(this.pose.position);
            }
            this.lastSetShield = -1;
        }
        return this;
    }

    tick() {
        this.setAbsolutePose();
        this.tickTimeouts();
        if (this.alien && game.aliens.includes(this.alien.alien)) {
            if (this.lastSetShield == -1 || game.step - this.lastSetShield >= SafeAlien.C.TICKS.SHIELD_RESET_TIME) {
                this.lastSetShield = game.step;
                this.timeouts.push(new TimeoutCreator(() => {
                    this.alien.setShield(this.baseLevelFields.SHIELD);
                    this.alien.setPosition(this.pose.position);
                    this.alien.setVelocity(new Vector2(SafeAlien.C.ALL.VELOCITY.x, SafeAlien.C.ALL.VELOCITY.y));
                    this.alien.setRegen(SafeAlien.C.ALL.REGEN);
                    this.alien.setDamage(SafeAlien.C.ALL.DAMAGE);
                    this.alien.setLaserSpeed(SafeAlien.C.ALL.LASER_SPEED);
                    this.alien.setRate(SafeAlien.C.ALL.RATE);
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
                let ship = g.findShip(gameShip);
                let spawn = true;
                if (ship) {
                    if (ship.team) {
                        if (ship.team.team != this.baseModule.base.team.team) {
                            if (this.baseModule.base.lastAttackTime == -1 || game.step - this.baseModule.base.lastAttackTime >= Base.C.ATTACK_DURATION) {
                                this.baseModule.base.lastAttackTime = game.step;
                                g.sendNotifications('Base Under Attack', 'Your base is under attack! Defend it!', this.baseModule.base.team, ship.team);
                            }
                            ship.setScore(ship.ship.score + this.baseLevelFields.SCORE);
                            if (this.baseModule.subBase) {
                                this.baseModule.subBase.health -= this.baseLevelFields.SHIELD;
                                this.baseModule.base.crystals -= this.baseLevelFields.CRYSTALS_BASE_REMOVED;
                                if (this.baseModule.base.baseLevel == 4 && this.baseModule.base.maxRecords.length > 0 && this.baseModule.base.maxRecords[this.baseModule.base.maxRecords.length - 1].type == 'maxed') {
                                    this.baseModule.base.maxRecords.push({ type: 'lost', tick: game.step });
                                }
                                if (this.baseModule.base.crystals < 0) {
                                    this.baseModule.base.crystals = 0;
                                }
                                if (this.baseModule.subBase.health <= 0) {
                                    this.baseModule.subBase.deactivate();
                                    spawn = false;
                                }
                            } else if (this.baseModule.type == BaseModule.C.TYPES.POWERCORE) {
                                this.baseModule.base.powerCore.health -= this.baseLevelFields.SHIELD;
                                if (this.baseModule.base.powerCore.health <= 0) {
                                    this.baseModule.base.powerCore.deactivate();
                                    spawn = false;
                                }
                            }
                        } else {
                            let bottomMessage = Helper.deepCopy(UIComponent.C.UIS.BOTTOM_MESSAGE);
                            bottomMessage.components[0].fill = '#0000ff80';
                            bottomMessage.components[1].value = "Destroying your own base's alien does nothing!"
                            ship.sendTimedUI(bottomMessage);
                        }
                    }
                }
                if (spawn) {
                    this.spawnAlien();
                }
            }
        }
        return this;
    }

    reset() {
        if (this.alien) {
            this.alien.destroySelf();
        }
        this.spawnAlien();
    }

    destroySelf() {
        if (this.alien) {
            this.alien.destroySelf();
            this.dead = true;
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
                    z: 5
                },
                type: {
                    id: 'u_shape',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/u_shape.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    physics: {
                        mass: 500,
                        shape: [0,0,0,1.235,1.155,1.044,0.957,0.868,0.805,0.766,0.739,0.726,0.732,0.754,0.785,0.833,0.902,0.989,1,0.875,0.904,0.962,0,0,0,0,0,0,0,0.962,0.904,0.875,1,0.989,0.902,0.833,0.785,0.754,0.732,0.726,0.739,0.766,0.805,0.868,0.957,1.044,1.155,1.235,0,0]
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
                    z: 5
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
            },
            TURRET: {
                id: 'turret',
                position: {
                    x: 0,
                    y: 0,
                    z: 7
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
                    id: 'turret',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/turret.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    // physics: {
                    //     mass: 500,
                    //     shape: [1.553,1.556,0.816,0.517,0.479,0.378,0.32,0.296,0.285,0.279,0.28,0.313,0.999,1.008,1.031,1.075,1.14,1.166,1.106,0.949,0.844,0.665,0.85,0.846,0.842,0.85,0.842,0.846,0.85,0.665,0.534,0.3,0.296,0.285,0.279,0.28,0.287,0.299,0.3,0.287,0.28,0.279,0.285,0.296,0.32,0.378,0.479,0.517,0.816,1.556]
                    // }
                }
            },
            DOOR_FRAME: {
                id: 'door_frame',
                position: {
                    x: 0,
                    y: 0,
                    z: 4
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 0.1,
                    y: 0.25,
                    z: 4
                },
                type: {
                    id: 'door_frame',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/door_frame.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    // physics: {
                    //     mass: 500,
                    //     shape: [0.527,0.533,0.549,0.576,0.612,0.679,0.759,0.878,1.074,1.427,2.02,2.013,1.965,1.965,2.013,2.02,1.427,1.074,0.878,0.759,0.679,0.612,0.576,0.549,0.533,0.527,0.533,0.549,0.576,0.612,0.679,0.759,0.878,1.074,1.427,2.02,2.013,1.965,1.965,2.013,2.02,1.427,1.074,0.878,0.759,0.679,0.612,0.576,0.549,0.533]
                    // }
                },
            },
            DOOR: {
                id: 'door',
                position: {
                    x: 0,
                    y: 0,
                    z: 4
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 0.1,
                    y: 0.25,
                    z: 4
                },
                type: {
                    id: 'door',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/door.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                    // physics: {
                    //     mass: 500,
                    //     shape: [0.071,0,0,0.078,0.063,0,0.097,0.085,0.122,0.181,0.275,0.536,1.663,1.663,0.536,0.275,0.181,0.122,0.085,0.097,0,0.063,0.078,0,0,0.071,0,0,0.078,0.063,0,0.097,0.085,0.122,0.181,0.275,0.536,1.663,1.663,0.536,0.275,0.181,0.122,0.085,0.097,0,0.063,0.078,0,0]
                    // }
                }
            },
            POWERCORE: {
                id: 'powercore',
                position: {
                    x: 0,
                    y: 0,
                    z: -5
                },
                rotation: {
                    x: 0,
                    y: Math.PI / 2,
                    z: 0
                },
                scale: {
                    x: 0.4,
                    y: 0.4,
                    z: 0.4
                },
                type: {
                    id: 'powercore',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/powercore.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                }
            },
            BULLET: {
                id: 'laser',
                position: {
                    x: 0,
                    y: 0,
                    z: 7
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                scale: {
                    x: 5,
                    y: 5,
                    z: 5
                },
                type: {
                    id: 'laser',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/teams-2.0/laser.obj',
                    diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/diffuse.png',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/capture-the-flag-revamp/ctf-v2.0/emissive.png',
                    transparent: false,
                }
            },
            LASER: {
                id: 'laser',
                position: {
                    x: 0,
                    y: 0,
                    z: 7
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: {
                    x: 0.1,
                    y: 0.1,
                    z: 0.1
                },
                type: {
                    id: 'laser',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/capture-the-flag-revamp/ctf-v3.0/laser.obj',
                    transparent: false
                },
                EXISTENCE_TIME: 10,
            },
            BASE_GLOW: {
                id: 'base_glow',
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
                    id: 'base_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/teams-2.0/base_glow.png',
                }
            },
            SPAWN_GLOW: {
                id: 'spawn_glow',
                position: {
                    x: -0.75,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: Math.PI / 2
                },
                scale: {
                    x: 3.5,
                    y: 3.5,
                    z: 3.5
                },
                type: {
                    id: 'spawn_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/teams-2.0/spawn_glow.png',
                }
            },
            DEPOT_GLOW: {
                id: 'depot_glow',
                position: {
                    x: -0.75,
                    y: 0,
                    z: 0
                },
                rotation: {
                    x: 0,
                    y: 0,
                    z: Math.PI / 2
                },
                scale: {
                    x: 3.5,
                    y: 3.5,
                    z: 3.5
                },
                type: {
                    id: 'depot_glow',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/teams-2.0/depot_glow.png',
                }
            },
            TURRET_RANGE: {
                id: 'turret_range',
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
                    x: 1.6,
                    y: 1.6,
                    z: 1.6
                },
                type: {
                    id: 'turret_range',
                    obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/refs/heads/main/utilities/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/teams-2.0/turret_range.png',
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
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                    },
                    {
                        type: 'round',
                        position: [5, 5, 20, 20],
                        stroke: '#ffffff80',
                        width: 2,
                    },
                    {
                        type: 'text',
                        position: [10, 10, 10, 10],
                        color: '#ffffff',
                    },
                    {
                        type: 'text',
                        position: [10, 10, 10, 10],
                        color: '#ffffff80',
                    },
                    {
                        type: 'text',
                        position: [30, 5, 65, 10],
                        color: '#ffffff',
                        align: 'left'
                    },
                    {
                        type: 'text',
                        position: [30, 15, 32.5, 5],
                        color: '#ffffff',
                        align: 'left',
                    },
                    {
                        type: 'text',
                        position: [62.5, 15, 32.5, 5],
                        color: '#ffffff',
                        align: 'right',
                    },
                    {
                        type: 'box',
                        position: [30, 20, 65, 2.5],
                        stroke: '#ffffff80',
                        width: 2,
                    },
                    {
                        type: 'box',
                        position: [30, 20, 65, 2.5],
                    },
                    {
                        type: 'box',
                        position: [21, 27.5, 0, 70],
                        stroke: '#ffffff40',
                        width: 1,
                    },
                    {
                        type: 'box',
                        position: [84, 27.5, 0, 70],
                        stroke: '#ffffff40',
                        width: 1,
                    },
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
            TEAM_SELECTION: {
                id: "team_selection",
                visible: true,
                clickable: true,
                components: []
            },
            WEAPONS_STORE: {
                id: "weapons_store",
                position: [25, 25, 50, 60],
                visible: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        stroke: '#0080ffBF',
                        width: 4
                    },
                    {
                        type: 'box',
                        position: [0, 0, 100, 10],
                        fill: '#0080ffBF',
                    },
                    {
                        type: "text",
                        position: [2.5, 0, 20, 10],
                        color: '#ffffff'
                    }
                ]
            },
            WEAPONS_STORE_TAB: {
                id: "weapons_store_tab",
                position: [25, 20, 10, 5],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#0080ff'
                    },
                    {
                        type: "text",
                        position: [2.5, 2.5, 95, 95],
                        color: '#ffffff',
                    }
                ]
            },
            WEAPONS_STORE_DONATE: {
                id: "weapons_store_donate",
                position: [27.5, 70, 45, 5],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#00000040',
                        stroke: '#00ff0080',
                        width: 4
                    },
                    {
                        type: 'box',
                        position: [0, 0, 0, 100],
                        fill: '#00ff0080',
                    },
                    {
                        type: "text",
                        position: [10, 10, 80, 80],
                        color: '#ffffff'
                    }
                ]
            },
            WEAPONS_STORE_EXIT: {
                id: "weapons_store_exit",
                position: [65, 80, 10, 5],
                visible: true,
                clickable: true,
                shortcut: 'W',
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#0080FFBF',
                    },
                    {
                        type: "text",
                        position: [5, 5, 90, 90],
                        value: 'EXIT [W]',
                        color: '#ffffff'
                    }
                ]
            },
            WEAPONS_STORE_EMPTY: {
                id: "weapons_store_empty",
                position: [25, 80, 20, 5],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#0080FFBF',
                    },
                    {
                        type: "text",
                        position: [5, 5, 90, 90],
                        value: 'CLEAR WEAPONS',
                        color: '#ffffff'
                    }
                ]
            },
            WEAPONS_STORE_ITEM: {
                id: "weapons_store_item",
                position: [0, 0, 10, 10],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                    },
                    {
                        type: "text",
                        position: [2.5, 20, 95, 25],
                        color: '#ffffff',
                    },
                    {
                        type: "text",
                        position: [2.5, 2.5, 95, 12.5],
                        color: '#ffffff',
                    },
                    {
                        type: "text",
                        position: [2.5, 50, 95, 17.5],
                        color: '#ffffff',
                    },
                    {
                        type: 'box',
                        position: [0, 70, 100, 30],
                        fill: '#000000BF'
                    },
                    {
                        type: "text",
                        position: [10, 75, 80, 20],
                        color: '#ffffff',
                    }
                ]
            },
            WEAPONS_STORE_SLOT: {
                id: "weapons_store_slot",
                position: [0, 0, 7.5, 10],
                visible: true,
                clickable: true,
                components: [
                    {
                        type: 'box',
                        position: [0, 0, 100, 100],
                        fill: '#0080ff40',
                        stroke: '#0080ff80',
                        width: 4,
                    },
                    {
                        type: "text",
                        position: [5, 5, 90, 90],
                        color: '#ffffff'
                    },
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
