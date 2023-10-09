// Starblast optifine dynamic lights (warning, may be laggy af)

/*
    @author JavRedstone
    @version 1.0.0
*/

const C = {
    GAME_OPTIONS: {
        ROOT_MODE: '',
        MAP_SIZE: 60,
        MAP: '  9           9999999                  9999999            8 \n'+
        '   7  9       9999999                  9999999       96    5\n'+
        '    5 15                                            51 3    \n'+
        '246    2      999 999                  999 999      2   9 4 \n'+
        '   4999999    999 999999999999999999999999 999    999999  89\n'+
        '       999    999 999999999999999999999999 999    999 5     \n'+
        '7    7  99    999 996666969969969999666699 999    99    5   \n'+
        ' 4     2 9    999 999996969969969999699999 999    9 2    2  \n'+
        '  946    9        996666966669966669666699        9       8 \n'+
        '3  8 3 1 9    999 996999969969969999699999 999    9 1 679  5\n'+
        '89            999 996666966669966679666699 999         357  \n'+
        '  7           999 999999999999999999999999 999            4 \n'+
        '   4          999 999999999999999999999999 999        2    9\n'+
        '    94  69        5          66          5        96   8    \n'+
        '89    9  9     5    9  6  6  55  6  6  9    5     9     5   \n'+
        ' 579     9      2   4  5  8  99  8  5  4   2      9 3    257\n'+
        '   5    99       81  5 4  79 66 97  4 5  18       99  3     \n'+
        '4      999        33 2 1            1 2 33        999 699   \n'+
        ' 9  999999                                        999999 8  \n'+
        '  79                    5 5      5 5                      57\n'+
        '    7  1    3            5        5            3    1      9\n'+
        '4    4  6    3           999    999           3    6   82   \n'+
        ' 9      61    5          959    959          5    16     8  \n'+
        '  8  65  76   21         5995555995         12   67  56   57\n'+
        '      935  4       5    55        55    5       4  539      \n'+
        '47                  59955    66    55995                    \n'+
        '  4     5    48    5 959  5      5  959 5    84    5      9 \n'+
        '   9 8   31          999   5 66 5   999          13   8    8\n'+
        '    7 8    9 831      95            59      138 9    8      \n'+
        '5                   6  5 5 5    5 5 5  6                2   \n'+
        ' 2                  6  5 5 5    5 5 5  6                 9 4\n'+
        '  8   8    9 831      95            59      138 9    8      \n'+
        '     8   31          999   5 66 5   999          13   8     \n'+
        '        5    48    5 959  5      5  959 5    84    5     5  \n'+
        '  4                 59955    66    55995                  9 \n'+
        '   94 935  4       5    55        55    5       4  539     8\n'+
        '    765  76   21         5995555995         12   67  566    \n'+
        '58      61    5          959    959          5    16    3 7 \n'+
        '        6    3           999    999           3    6     9 4\n'+
        '       1    3            5        5            3    1       \n'+
        '9    93                 5 5      5 5                        \n'+
        ' 79 999999                                        999999 5  \n'+
        '  47   999        33 2 1            1 2 33        999     25\n'+
        '    4   99       81  5 4  79 66 97  4 5  18       99  92    \n'+
        '2        9      2   4  5  8  99  8  5  4   2      9    69   \n'+
        ' 8       9     5    9  6  6  55  6  6  9    5     9         \n'+
        '    9   69        5          66          5        96       4\n'+
        '7    6        999 999999999999999999999999 999              \n'+
        ' 4            999 999999999999999999999999 999          82  \n'+
        '  9           999 996666966669966679666699 999            8 \n'+
        '   7   1 9    999 996999969969969999699999 999    9 1 6    5\n'+
        '    4    9        996666966669966669666699        9    3    \n'+
        '2      2 9    999 999996969969969999699999 999    9 2     4 \n'+
        '   3    99    999 996666969969969999666699 999    99  9    9\n'+
        '       999    999 999999999999999999999999 999    999 5     \n'+
        '7   999999    999 999999999999999999999999 999    9999995   \n'+
        ' 4     2      999 999                  999 999      2    2  \n'+
        '  946 15                                            51    8 \n'+
        '   8 39       9999999                  9999999       96 9  5\n'+
        '89            9999999                  9999999         3 7  ',
        CRYSTAL_VALUE: 0,

        FRIENDLY_COLORS: 2,

        RADAR_ZOOM: 1,

        SPEED_MOD: 1.4,
        FRICTION_RATIO: 1,

        WEAPONS_STORE: false,
        PROJECTILE_SPEED: 1,

        STARTING_SHIP: 800,
        RESET_TREE: false,
        CHOOSE_SHIP: [701, 702, 703, 704],
        SHIP_NAMES: [],
        SHIP_CODES: [],
        SHIPS: [],

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
        SHIP_MANAGER: 40,

        MESSAGE_TIME: 120,

        DEBUG: false,
        LIGHT_LEVEL: 10,
        MAX_LIGHT_LEVEL: 15
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
                emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/grid.png'
            }
        },
        LIGHT: {
            id: 'light',
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
            types: [
                {
                    id: 'light-1',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_1.png'
                },
                {
                    id: 'light-2',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_2.png'
                },
                {
                    id: 'light-3',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_3.png'
                },
                {
                    id: 'light-4',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_4.png'
                },
                {
                    id: 'light-5',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_5.png'
                },
                {
                    id: 'light-6',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_6.png'
                },
                {
                    id: 'light-7',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_7.png'
                },
                {
                    id: 'light-8',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_8.png'
                },
                {
                    id: 'light-9',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_9.png'
                },
                {
                    id: 'light-10',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_10.png'
                },
                {
                    id: 'light-11',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_11.png'
                },
                {
                    id: 'light-12',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_12.png'
                },
                {
                    id: 'light-13',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_13.png'
                },
                {
                    id: 'light-14',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_14.png'
                },
                {
                    id: 'light-15',
                    obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                    emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/sb-optifine/light_15.png'
                }
            ]
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
        MAX_AMOUNT: 30,
        SPAWN_RATE: 1200
    }
};

class Game {
    ships = [];
    teams = [];

    aliens = [];
    asteroids = [];

    oldLights = [];
    lights = [];
    spawnArea = [];

    constructor() {
        this.reset();
    }

    tick() {
        this.manageShips();
        // this.spawnAliens();
        // this.spawnCollectibles();

        this.spawnActiveObjects();
        
        this.manageEntities();
    }

    reset() {
        this.deleteEverything();
        this.spawnInactiveObjects();
        this.selectRandomTeams();
        this.resetShips();

        this.resetLightObjects();
        this.resetLights();
        this.resetSpawnArea();
        this.setSpawnArea();
    }

    resetSpawnArea() {
        this.spawnArea = [];
        for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
            let spawnAreaRow = [];
            for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                spawnAreaRow.push(false);
            }
            this.spawnArea.push(spawnAreaRow);
        }
    }
    setSpawnArea() {
        let map = C.GAME_OPTIONS.MAP.split('\n');
        for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
            for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                let char = map[i].charAt(j);
                if (char == ' ') {
                    this.spawnArea[i][j] = true;
                }
            }
        }
    
        if (C.GAME_OPTIONS.DEBUG) {
            for (let i = 0; i < spawnArea.length; i++) {
                let grid = Helper.deepCopy(C.OBJECTS.GRID);
                grid.id = `${C.OBJECTS.GRID.id}-${i}`;
                grid.position.x = spawnArea[i].x * 10;
                grid.position.y = spawnArea[i].y * 10;
                game.setObject(grid);
            }
        }
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
        this.spawningArea = [];
        this.totalSpawnArea = [];
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
        if (resetTeam) {
            if (this.teams[0].numShips <= this.teams[1].numShips) {
                ship.setTeam(this.teams[0]);
                this.teams[0].numShips++;
            }
            else {
                ship.setTeam(this.teams[1]);
                this.teams[1].numShips++;
            }

            ship.setType(Helper.getRandomArrayElement(C.GAME_OPTIONS.SHIP_CODES));
        }

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

    spreadLight(x, y, level) {
        if (level == 0 || this.lights[y][x].level >= level || !this.spawnArea[y][x]) {
            return;
        }
        this.lights[y][x].level = level;
        let lc = this.getLeftCoordinate(x, y);
        let rc = this.getRightCoordinate(x, y);
        let tc = this.getTopCoordinate(x, y);
        let bc = this.getBottomCoordinate(x, y);
        this.spreadLight(lc.x, lc.y, level - 1);
        this.spreadLight(rc.x, rc.y, level - 1);
        this.spreadLight(tc.x, tc.y, level - 1);
        this.spreadLight(bc.x, bc.y, level - 1);
    }

    getLeftCoordinate(x, y) {
        let x1 = x - 1;
        if (x <= 0) {
            x1 = C.GAME_OPTIONS.MAP_SIZE - 1;
        }
        return new Vector2(x1, y);
    }

    getRightCoordinate(x, y) {
        let x1 = x + 1;
        if (x >= C.GAME_OPTIONS.MAP_SIZE - 1) {
            x1 = 0;
        }
        return new Vector2(x1, y);
    }

    getTopCoordinate(x, y) {
        let y1 = y - 1;
        if (y <= 0) {
            y1 = C.GAME_OPTIONS.MAP_SIZE - 1;
        }
        return new Vector2(x, y1);
    }

    getBottomCoordinate(x, y) {
        let y1 = y + 1;
        if (y >= C.GAME_OPTIONS.MAP_SIZE - 1) {
            y1 = 0;
        }
        return new Vector2(x, y1);
    }

    printLights() {
        let str = '';
        for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
            for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                let s = `${this.lights[j][i].level}`;
                str += s.length == 1 ? ` ${s} ` : `${s} `;
            }
            str += '\n';
        }
        console.log(str);
    }

    resetLights() {
        this.lights = [];
        for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
            let lightRow = [];
            for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                lightRow.push(new Light(j, i, 0));
            }
            this.lights.push(lightRow);
        }
    }

    resetLightObjects() {
        if (this.lights.length > 0) {
            for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
                for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                    this.lights[i][j].clear();
                }
            }
        }
    }

    updateLights() {
        for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
            for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                let light = this.lights[i][j];
                let oldLight = this.oldLights[i][j];
                if (oldLight.level != light.level) {
                    if (oldLight.object != null) {
                        oldLight.object.obj.position.z = -10000;
                        oldLight.object.obj.scale.x *= 0.00001;
                        oldLight.object.obj.scale.y *= 0.00001;
                        oldLight.object.obj.scale.z *= 0.00001;
                        game.setObject(oldLight.object.obj);
                        game.removeObject(oldLight.object.obj.id);
                    }
                    if (light.level != 0) {
                        light.spawn();
                    }
                    else {
                        light.object = null;
                    }
                }
                else {
                    let oldObj = oldLight.object;
                    if (oldObj != null) {
                        light.object = new Obj(
                            oldObj.obj.id,
                            oldObj.obj.type,
                            oldObj.obj.position,
                            oldObj.obj.rotation,    
                            oldObj.obj.scale,
                        );
                    }
                }
            }
        }
        this.oldLights = this.lights;
    }

    manageShips() {
        if (game.step % C.GAME_OPTIONS.SHIP_MANAGER === 0) {
            this.oldLights = Helper.deepCopy(this.lights);
            this.resetLights();
            for (let ship of this.ships) {
                if (!ship.done) {
                    this.resetShip(ship, true);
                    ship.done = true;
                }
                this.spreadLight(
                    Math.floor((Helper.clamp(ship.ship.x, -C.GAME_OPTIONS.MAP_SIZE / 2 * 10, C.GAME_OPTIONS.MAP_SIZE / 2 * 10 - 1) + C.GAME_OPTIONS.MAP_SIZE / 2 * 10) / 10),
                    Math.floor((Helper.clamp(-ship.ship.y, -C.GAME_OPTIONS.MAP_SIZE / 2 * 10, C.GAME_OPTIONS.MAP_SIZE / 2 * 10 - 1) + C.GAME_OPTIONS.MAP_SIZE / 2 * 10) / 10),
                    C.GAME_OPTIONS.LIGHT_LEVEL
                );

                ship.sendUI(Helper.deepCopy(C.UIS.LIVES_BLOCKER));

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
            for (let ship of this.ships) {
                let different = false;
                for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
                    for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                        let oldLight = this.oldLights[i][j];
                        let light = this.lights[i][j];
                        if (oldLight.level != light.level) {
                            different = true;
                            break;
                        }
                    }
                    if (different) {
                        break;
                    }
                }
                if (different) {
                    let radarBackground = Helper.deepCopy(C.UIS.RADAR_BACKGROUND);
                    for (let i = 0; i < C.GAME_OPTIONS.MAP_SIZE; i++) {
                        for (let j = 0; j < C.GAME_OPTIONS.MAP_SIZE; j++) {
                            let light = this.lights[i][j];
                            if (light.level != 0) {
                                radarBackground.components.push({
                                    type: 'box',
                                    position: Helper.getRadarSpotPosition(
                                        (light.x - C.GAME_OPTIONS.MAP_SIZE / 2 + 0.5) * 10,
                                        (C.GAME_OPTIONS.MAP_SIZE / 2 - 0.5 - light.y) * 10,
                                        10,
                                        10
                                    ),
                                    fill: `rgba(255, 255, 0, ${light.level / C.GAME_OPTIONS.MAX_LIGHT_LEVEL})`
                                });
                            }
                        }
                    }
                    ship.sendUI(radarBackground);
                }
            }
            this.updateLights();
            this.printLights();
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

class Light {
    x = 0;
    y = 0;
    level = 0;

    object = null;

    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
    }

    spawn() {
        let light = Helper.deepCopy(C.OBJECTS.LIGHT);
        light.id = `light-${Helper.getRandomFloat(-1, 1)}`;
        light.position.x = (this.x - C.GAME_OPTIONS.MAP_SIZE / 2 + 0.5) * 10;
        light.position.y = (C.GAME_OPTIONS.MAP_SIZE / 2 - 0.5 - this.y) * 10;
        this.object = new Obj(
            light.id,
            light.types[this.level - 1],
            light.position,
            light.rotation,
            light.scale
        );
        this.object.update()
    }

    clear() {
        if (this.object != null) {
            this.object.destroySelf();
        }
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
