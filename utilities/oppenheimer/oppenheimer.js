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
        RESET_TREE: true,
        CHOOSE_SHIP: [601, 602, 603],
        SHIPS: [
            // Bomb 101
            '{"name":"Bomb","level":1,"model":1,"size":1.5,"specs":{"shield":{"capacity":[15,15],"reload":[300,300]},"generator":{"capacity":[150,150],"reload":[45,45]},"ship":{"mass":3000,"speed":[120,120],"rotation":[60,60],"acceleration":[15,15]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,3,12,42.5,42.5,47.5,47.5,60,65,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,12,13.5,12.75,12,10.5,9,6,0],"height":[0,6,12,13.5,12.75,12,10.5,9,6,0],"texture":[4,11,10,17,15.1,17,11,12,17],"propeller":1}},"wings":{"fin1":{"doubleside":true,"offset":{"x":0,"y":18,"z":0},"length":[21],"width":[15,9],"angle":[-45],"position":[0,9],"texture":11,"bump":{"position":0,"size":15}},"fin2":{"doubleside":true,"offset":{"x":0,"y":18,"z":0},"length":[21],"width":[15,9],"angle":[45],"position":[0,9],"texture":11,"bump":{"position":0,"size":15}}},"typespec":{"name":"Bomb","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[15,15],"reload":[300,300]},"generator":{"capacity":[150,150],"reload":[45,45]},"ship":{"mass":3000,"speed":[120,120],"rotation":[60,60],"acceleration":[15,15]}},"shape":[0.9,0.874,0.836,0.762,0.699,0.654,0.571,0.502,0.458,0.427,0.407,0.393,0.387,0.391,0.404,0.424,0.449,0.491,0.552,0.582,0.829,1.045,1.041,1.042,1.065,1.052,1.065,1.042,1.041,1.045,0.829,0.582,0.552,0.491,0.449,0.424,0.404,0.391,0.387,0.393,0.407,0.427,0.458,0.502,0.571,0.654,0.699,0.762,0.836,0.874],"lasers":[],"radius":1.065}}',

            // Bomb 1 601
            '{"name":"Bomb 1","level":6,"model":1,"size":8,"specs":{"shield":{"capacity":[500,600],"reload":[15,20]},"generator":{"capacity":[200,300],"reload":[150,200]},"ship":{"mass":600,"speed":[75,100],"rotation":[100,150],"acceleration":[100,150]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,3,12,42.5,42.5,47.5,47.5,60,65,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,12,13.5,12.75,12,10.5,9,6,0],"height":[0,6,12,13.5,12.75,12,10.5,9,6,0],"texture":[4,63,18,17,15.1,17,63,12,17],"propeller":1,"laser":{"damage":[2,3],"rate":1,"type":2,"speed":[200,200],"recoil":10,"number":100,"error":0}}},"wings":{"fin1":{"doubleside":true,"offset":{"x":0,"y":20,"z":0},"length":[21],"width":[15,9],"angle":[-45],"position":[0,9],"texture":63,"bump":{"position":0,"size":15}},"fin2":{"doubleside":true,"offset":{"x":0,"y":20,"z":0},"length":[21],"width":[15,9],"angle":[45],"position":[0,9],"texture":63,"bump":{"position":0,"size":15}}},"typespec":{"name":"Bomb 1","level":6,"model":1,"code":601,"specs":{"shield":{"capacity":[500,600],"reload":[15,20]},"generator":{"capacity":[200,300],"reload":[150,200]},"ship":{"mass":600,"speed":[75,100],"rotation":[100,150],"acceleration":[100,150]}},"shape":[4.8,4.661,4.458,4.062,3.727,3.489,3.046,2.675,2.444,2.278,2.169,2.095,2.064,2.088,2.156,2.26,2.396,2.617,2.944,3.106,3.395,5.575,5.863,5.555,5.682,5.611,5.682,5.555,5.863,5.575,3.395,3.106,2.944,2.617,2.396,2.26,2.156,2.088,2.064,2.095,2.169,2.278,2.444,2.675,3.046,3.489,3.727,4.062,4.458,4.661],"lasers":[{"x":0,"y":-4.8,"z":0,"angle":0,"damage":[2,3],"rate":1,"type":2,"speed":[200,200],"number":100,"spread":0,"error":0,"recoil":10}],"radius":5.863}}',
            // Bomb 2 602
            '{"name":"Bomb 2","level":6,"model":2,"size":8,"specs":{"shield":{"capacity":[500,600],"reload":[15,20]},"generator":{"capacity":[300,500],"reload":[200,240]},"ship":{"mass":400,"speed":[75,100],"rotation":[100,150],"acceleration":[100,150]}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,3,12,42.5,42.5,47.5,47.5,60,65,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,12,13.5,12.75,12,10.5,9,6,0],"height":[0,6,12,13.5,12.75,12,10.5,9,6,0],"texture":[4,63,18,17,15.1,17,63,12,17],"propeller":1,"laser":{"damage":[10,15],"rate":10,"type":2,"speed":[300,400],"recoil":0,"number":1,"error":10}},"circle":{"section_segments":[40,50,130,140,220,230,310,320,400],"offset":{"x":0,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-15,-3,-15,-15,-3,-3],"z":[0,0,0,0,0,0]},"width":[25,25,25,30,30,25],"height":[25,25,25,30,30,25],"texture":[4,16,4,63,4,4],"propeller":false,"vertical":false},"things1":{"section_segments":10,"offset":{"x":2,"y":-3,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[7,12,11,12,12],"z":[0,0,0,0,0,0]},"width":[8,7,4,3,0],"height":[8,7,4,3,0],"texture":[63,16.9,5,16.9],"vertical":false,"angle":160,"laser":{"damage":[15,20],"rate":10,"type":2,"speed":[-100,-200],"recoil":0,"number":5,"angle":75}}},"wings":{"fin1":{"doubleside":true,"offset":{"x":0,"y":20,"z":0},"length":[25],"width":[15,9],"angle":[-45],"position":[0,11],"texture":63,"bump":{"position":0,"size":25}},"fin2":{"doubleside":true,"offset":{"x":0,"y":20,"z":0},"length":[25],"width":[15,9],"angle":[45],"position":[0,11],"texture":63,"bump":{"position":0,"size":25}}},"typespec":{"name":"Bomb 2","level":6,"model":2,"code":602,"specs":{"shield":{"capacity":[500,600],"reload":[15,20]},"generator":{"capacity":[300,500],"reload":[200,240]},"ship":{"mass":400,"speed":[75,100],"rotation":[100,150],"acceleration":[100,150]}},"shape":[4.8,4.661,4.458,4.062,3.727,3.489,3.046,2.691,2.444,2.278,2.169,2.095,2.064,2.088,2.156,2.26,2.396,2.617,2.944,5.766,6.855,6.969,6.542,6.221,6.023,5.932,6.023,6.221,6.542,6.969,6.855,5.766,2.944,2.617,2.396,2.26,2.156,2.088,2.064,2.095,2.169,2.278,2.444,2.691,3.046,3.489,3.727,4.062,4.458,4.661],"lasers":[{"x":0,"y":-4.8,"z":0,"angle":0,"damage":[10,15],"rate":10,"type":2,"speed":[300,400],"number":1,"spread":0,"error":10,"recoil":0},{"x":0.703,"y":-1.532,"z":0,"angle":160,"damage":[15,20],"rate":10,"type":2,"speed":[-100,-200],"number":5,"spread":75,"error":0,"recoil":0},{"x":-0.703,"y":-1.532,"z":0,"angle":-160,"damage":[15,20],"rate":10,"type":2,"speed":[-100,-200],"number":5,"spread":75,"error":0,"recoil":0}],"radius":6.969}}',
            // Bomb 3 603
            '{"name":"Bomb 3","level":6,"model":3,"size":8,"specs":{"shield":{"capacity":[500,600],"reload":[25,50]},"generator":{"capacity":[400,600],"reload":[50,75]},"ship":{"mass":500,"speed":[100,150],"rotation":[100,150],"acceleration":[100,120],"dash":{"rate":2,"burst_speed":[200,300],"speed":[150,200],"acceleration":[400,500],"initial_energy":[150,300],"energy":[200,300]}}},"bodies":{"main":{"section_segments":8,"offset":{"x":0,"y":-30,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[0,3,12,42.5,42.5,47.5,47.5,60,65,60],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,6,18,20,12.75,12,10.5,9,6,0],"height":[0,6,18,20,12.75,12,10.5,9,6,0],"texture":[4,63,18,17,15.1,17,63,12,17],"propeller":1},"circle":{"section_segments":6,"offset":{"x":0,"y":40,"z":0},"position":{"x":[0,0,0,0,0,0],"y":[-15,-3,-15,-15,-3,-3],"z":[0,0,0,0,0,0]},"width":[25,25,25,30,30,25],"height":[25,25,25,30,30,25],"texture":[4,63,3.9,63,3.9,4],"propeller":false,"vertical":false},"toppropulsors":{"section_segments":10,"offset":{"x":17,"y":25,"z":0},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-7,-6,0,4,8,12,15,17,19,15],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,6,3,3,5,4,0],"height":[0,3,5,5,6,3,3,5,4,0],"texture":[3,4,10,3,3,63,4,12,17],"propeller":true},"toppropulsors2":{"section_segments":10,"offset":{"x":0,"y":25,"z":20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-7,-6,0,4,8,12,15,17,19,15],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,6,3,3,5,4,0],"height":[0,3,5,5,6,3,3,5,4,0],"texture":[3,4,10,3,3,63,4,12,17],"propeller":true},"toppropulsors3":{"section_segments":10,"offset":{"x":0,"y":25,"z":-20},"position":{"x":[0,0,0,0,0,0,0,0,0,0],"y":[-7,-6,0,4,8,12,15,17,19,15],"z":[0,0,0,0,0,0,0,0,0,0]},"width":[0,3,5,5,6,3,3,5,4,0],"height":[0,3,5,5,6,3,3,5,4,0],"texture":[3,4,10,3,3,63,4,12,17],"propeller":true}},"wings":{"fin1":{"doubleside":true,"offset":{"x":0,"y":20,"z":0},"length":[25],"width":[15,9],"angle":[-45],"position":[0,11],"texture":63,"bump":{"position":0,"size":25}},"fin2":{"doubleside":true,"offset":{"x":0,"y":20,"z":0},"length":[25],"width":[15,9],"angle":[45],"position":[0,11],"texture":63,"bump":{"position":0,"size":25}}},"typespec":{"name":"Bomb 3","level":6,"model":3,"code":603,"specs":{"shield":{"capacity":[500,600],"reload":[25,50]},"generator":{"capacity":[400,600],"reload":[50,75]},"ship":{"mass":500,"speed":[100,150],"rotation":[100,150],"acceleration":[100,120],"dash":{"rate":2,"burst_speed":[200,300],"speed":[150,200],"acceleration":[400,500],"initial_energy":[150,300],"energy":[200,300]}}},"shape":[4.8,4.661,4.458,4.258,4.114,4.044,4.073,3.947,3.605,3.373,3.213,3.108,3.069,3.119,3.216,3.377,3.61,3.774,3.4,6.516,7.234,7.787,7.78,7.402,7.066,7.054,7.066,7.402,7.78,7.787,7.234,6.516,3.4,3.774,3.61,3.377,3.216,3.119,3.069,3.108,3.213,3.373,3.605,3.947,4.073,4.044,4.114,4.258,4.458,4.661],"lasers":[],"radius":7.787}}'
        ],

        VOCABULARY: [
            { text: 'Help', icon:'\u00a5', key:'H' },
            { text: 'Me', icon:'\u004f', key:'E' },
            { text: 'Safe Zone', icon:'\u002a', key:'B' },
            { text: 'Wait', icon:'\u0048', key:'T' },
            { text: 'Yes', icon:'\u004c', key:'Y' },
            { text: 'No', icon:'\u004d', key:'N' },
            { text: 'Sorry', icon:'\u00a1', key:'S' },
            { text: 'Attack', icon:'\u0049', key:'A' },
            { text: 'Follow Me', icon:'\u0050', key:'F' },
            { text: 'Good Game', icon:'\u00a3', key:'G' },
            { text: 'Bruh', icon:'\u{1F480}', key:'I' },
            { text: 'Ability', icon:'\u0028', key:'J' },
            { text: 'Hmm?', icon:'\u004b', key:'Q' },
            { text: 'No Problem', icon:'\u0047', key:'P' },
            { text: 'Defend', icon:'\u0025', key:'D' },
            { text: 'Nerd', icon:'\u{1F913}', key:'L' }
        ],

        TICKS_PER_SECOND: 60,
        MILLISECONDS_PER_TICK: 1000 / 60,
    },
    TEAM_OPTIONS: {
        TEAMS: [
            [   
                {
                    TEAM: 0,
                    COLOR: 'Red',
                    HEX: '#ff0000',
                    NAME: 'Anarchist Concord Vega',
                    HUE: 0,
                    IS_DEFENDING: true
                },
                {
                    TEAM: 1,
                    COLOR: 'Blue',
                    HEX: '#0000ff',
                    NAME: 'Andromeda Union',
                    HUE: 240,
                    IS_DEFENDING: false
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Yellow',
                    HEX: '#ffff00',
                    NAME: 'Solaris Dominion',
                    HUE: 60,
                    IS_DEFENDING: true
                },
                {
                    TEAM: 1,
                    COLOR: 'Purple',
                    HEX: '#ff00ff',
                    NAME: 'Galactic Empire',
                    HUE: 300,
                    IS_DEFENDING: false
                }
            ],
            [
                {
                    TEAM: 0,
                    COLOR: 'Green',
                    HEX: '#00ff00',
                    NAME: 'Rebel Alliance',
                    HUE: 120,
                    IS_DEFENDING: true
                },
                {
                    TEAM: 1,
                    COLOR: 'Orange',
                    HEX: '#ff8000',
                    NAME: 'Sovereign Trappist Colonies',
                    HUE: 30,
                    IS_DEFENDING: false
                }
            ]
        ]
    },
    UIS: {
        LOGO: {
            id: 'logo',
            position: [35, 10, 30, 15],
            visible: true,
            components: [
                {
                    type: 'box',
                    position: [0, 0, 100, 100],
                    stroke: '#ffffff',
                    fill: '#00000080',
                    width: 2
                },
                {
                    type: 'text',
                    position: [5, 5, 90, 22.5],
                    value: 'Oppenheimer Mod',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [5, 27.5, 90, 22.5],
                    value: '💣',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [5, 50, 90, 22.5],
                    value: 'A solo project by JavRedstone',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [5, 72.5, 90, 22.5],
                    value: 'Ships by JavRedstone and Aether',
                    color: '#ffffff'
                }
            ]
        },
        WAIT: {
            id: 'wait',
            position: [3, 42.5, 20, 10],
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
                    position: [5, 0, 90, 50],
                    value: 'Waiting for more players',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [10, 50, 80, 50],
                    value: '0 players required to start',
                    color: '#ffffff'
                }
            ]
        },
        INSTRUCTIONS: {
            id: 'instructions',
            visible: true,
            clickable: true,
            position: [25, 35, 50, 50],
            components: [
                {
                    type: 'box',
                    position: [0, 0, 100, 100],
                    stroke: '#ffffff',
                    fill: '#00000080',
                    width: 2
                },
                {
                    type: 'box',
                    position: [0, 0, 100, 10],
                    stroke: '#ffffff',
                    width: 2
                },
                {
                    type: 'text',
                    position: [0, 0.5, 100, 9],
                    value: 'Instructions',
                    color: '#ffffff',
                },
                {
                    type: 'box',
                    position: [40, 85, 20, 10],
                    stroke: '#ffffff',
                    width: 2
                },
                {
                    type: 'text',
                    position: [42.5, 85, 15, 10],
                    value: 'Have fun!',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [5, 15, 90, 7.5],
                    value: '➢ You are assigned to one of two teams: Defending the bomb or Exposing it.',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 22.5, 90, 10],
                    value: '➢ The main bomb spawns in the middle of the map.',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 30, 90, 10],
                    value: '➢ If you are on the defending team, your job is to collect enough small bombs to prevent the exposers from triggering the main bomb.',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 37.5, 90, 10],
                    value: '➢ If you are on the exposing team, your job is to attack the main bomb enough to trigger it!',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 45, 90, 10],
                    value: '➢ Your score is determined by the number of bombs you pick up.',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 52.5, 90, 10],
                    value: '➢ Each round passes with a certain amount of time, dictated by the round timer.',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 60, 90, 10],
                    value: '➢ There are periodic blasts that occur based off the blast timer.',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 67.5, 90, 10],
                    value: '➢ Safe zones open close to the blasts. Hide in them to avoid getting blasted!',
                    color: '#ffffff',
                    align: 'left'
                },
                {
                    type: 'text',
                    position: [5, 75, 90, 10],
                    value: '➢ Make sure to not stay in the safe zones when closed, they will damage you!',
                    color: '#ffffff',
                    align: 'left'
                }
            ]
        },
        BLAST_TIMER: {
            id: 'blast_timer',
            position: [87, 42.5, 10, 10],
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
                    position: [5, 50, 90, 50],
                    value: '0:00',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [5, -25, 90, 100],
                    value: 'Next Blast',
                    color: '#ffffff'
                }
            ]
        },
        ROUND_TIMER: {
            id: 'round_timer',
            position: [3, 42.5, 10, 10],
            visible: true,
            components: [
                {
                    type: 'box',
                    position: [0, 0, 100, 100],
                    stroke: '#0000ff',
                    fill: '#0000ff80',
                    width: 2
                },
                {
                    type: 'text',
                    position: [5, 50, 90, 50],
                    value: '0:00',
                    color: '#ffffff'
                },
                {
                    type: 'text',
                    position: [5, -25, 90, 100],
                    value: 'Next Round',
                    color: '#ffffff'
                }
            ]
        },
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
                    position: [0, 0, 50, 100 / 12],
                    color: '#000000',
                    value: 'DEFENDERS'
                },
                {
                    type: 'text',
                    position: [50, 0, 50, 100 / 12],
                    color: '#ffffff',
                    value: ''
                },
                {
                    type: 'box',
                    position: [0, 50, 100, 100 / 12],
                    stroke: '#ffffff',
                    fill: '#ffffff'
                },
                {
                    type: 'text',
                    position: [0, 50, 50, 100 / 12],
                    color: '#000000',
                    value: 'ATTACKERS'
                },
                {
                    type: 'text',
                    position: [50, 50, 50, 100 / 12],
                    color: '#000000',
                    value: ''
                },
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
        SAFE_ZONE_STATE: {
            id: 'safe_zone_state',
            position: [40, 25, 20, 5],
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
                    value: 'The safe zone is closed!',
                    color: '#ffffff'
                }
            ]
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
        MAIN_BOMB_SHIELD_BAR: {
            id: 'main_bomb_shield_bar',
            position: [25, 5, 50, 15],
            visible: true,
            components: [
                {
                    type: 'box',
                    position: [0, 0, 100, 100],
                    stroke: '#ffffff',
                    fill: '#00000080',
                    width: 2
                },
                {
                    type: 'text',
                    position: [5, 0, 90, 100 / 3],
                    value: 'Main Bomb Shield: 0 / 0',
                    color: '#ffffff'
                },
                {
                    type: 'box',
                    position: [0, 100 / 3, 100, 100 / 3],
                    stroke: '#ff0000', // change based on defending or not
                    fill: '#ff000080',
                    width: 2
                },
                {
                    type: 'box',
                    position: [0, 100 / 3, 100, 100 / 3],
                    fill: '#ff0000'
                },
                {
                    type: 'text',
                    position: [5, 200 / 3, 90, 100 / 3],
                    value: 'Predicted winner:',
                    color: '#ffffff'
                }
            ]
        },
        RADAR_BACKGROUND: {
            id: 'radar_background',
            visible: true,
            components: [
                { // MAIN BOMB
                    type: 'round',
                    position: [0, 0, 10 * 5, 10 * 5],
                    stroke: '#ff0000',
                    fill: '##ff000033' // 20%
                },
                { // MAIN BOMB
                    type: 'text',
                    position: [0, 0, 10 * 5, 10 * 5],
                    value: '💣',
                    color: '#ffffff'
                },
                { // SAFE ZONE 1
                    type: 'box',
                    position: [0, -30 * 10, 10 * 32, 10 * 26],
                    stroke: '#ff0000',
                    fill: '#ff000033'
                },
                { // SAFE ZONE 2
                    type: 'box',
                    position: [0, 30 * 10, 10 * 32, 10 * 26],
                    stroke: '#ff0000',
                    fill: '#ff000033'
                },
                { // SAFE ZONE 1
                    type: 'text',
                    position: [0, -20 * 10, 10 * 30, 10 * 24],
                    value: 'SAFE ZONE',
                    color: '#ffffff'
                },
                { // SAFE ZONE 2
                    type: 'text',
                    position: [0, 20 * 10, 10 * 30, 10 * 24],
                    value: 'SAFE ZONE',
                    color: '#ffffff'
                }
            ]
        }
    },
    OBJECTS: {
        OPPENHEIMER_LOGO: {
            id: 'oppenheimer_logo',
            type: {
                id: 'oppenheimer_logo',
                obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/oppenheimer_logo.png'
            },
            position: { x: 0, y: 0, z: -500 },
            rotation: { x: 0, y: Math.PI, z: Math.PI },
            scale: { x: 500, y: 500, z: 1 }
        },
        SAFE_ZONE: {
            id: 'safe_zone',
            type: {
                id: 'safe_zone',
                obj: 'https://starblast.data.neuronality.com/mods/objects/plane.obj',
                emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/oppenheimer_safe_zone.png'
            },
            position: { x: 0, y: 30 * 10, z: -10 },
            rotation: { x: 0, y: Math.PI, z: Math.PI },
            scale: { x: 100, y: 100, z: 1 }
        },
        MAIN_BOMB: {
            id: 'main_bomb',
            type: {
                id: 'main_bomb',
                obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/bomb.obj',
                emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/emissive.png',
                diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/diffuse.png'
            },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: Math.PI / 2, z: 0 },
            scale: { x: 50, y: 50, z: 50 }
        },
        SMALL_BOMB: {
            id: 'small_bomb',
            type: {
                id: 'small_bomb',
                obj: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/bomb.obj',
                emissive: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/emissive.png',
                diffuse: 'https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/oppenheimer/diffuse.png'
            },
            position: { x: 0, y : 0, z: 0 },
            rotation: { x: 0, y : 0, z: 0 },
            scale: { x: 10, y : 10, z: 10 }
        }
    },
    MAIN_BOMB_OPTIONS: {
        POSITION: { x: 0, y: 0 },
        VELOCITY: { x: 0, y: 0 },

        POINTS: 100,
        CRYSTAL_DROP: 0,
        WEAPON_DROP: 0,
        
        LASER_RATE: 0.1,
        LASER_DAMAGE: 1,
        LASER_SPEED: 1,

        MAX_SHIELD: 10000,
        INDIVIDUAL_SHIELD: 250,

        WINNING_THRESHOLD: 1000
    },
    SMALL_BOMB_OPTIONS: {
        SPAWN_CENTER: { x: 0, y: 0 },
        SPAWN_RADIUS: 10 * 5,
        SPAWN_RATE: 60,
        MAX_AMOUNT: 5,

        PICKUP_RADIUS: 10,
        SCORE: 100,
        HEAL: 250
    },
    SAFE_ZONE_OPTIONS: {
        OPEN: 1 / 8,
        CLOSE: 7 / 8,

        SHIELD_DROP: 50,
        CRYSTAL_DROP: 25,

        BOUND_X: 16 * 10,
        BOUND_Y: 17 * 10
    },
    ROUND_OPTIONS: {
        MIN_PLAYERS: 2,
        STARTING_POSITION: { x: 0, y: 0 },
        STARTING_VELOCITY: { x: 0, y: 0 },

        ROUND_RATE: 60 * 60 * 6,
        MAX_ROUNDS: 3,
        SHIP_UPDATE: 60,
        MAIN_BOMB_MAINTENANCE: 2,
        ENTITY_MANAGER: 60,
        UI_TEMP: 15 * 1000,

        INVULERNABLE: 60 * 5,

        WINNING_THRESHOLD: 0.25,
        WINNING_SCORE: 10000,
        WINNING_INVULNERABLE: 60 * 10,

        MESSAGE_TIME: 60 * 3
    },
    BLAST_OPTIONS: {
        ORIGIN: {
            IMPLOSION: { x: 0, y: 0 },
            SHOCKWAVE: { x: 0, y: 0 },
            CLOUD: { x: 0, y: 0 }
        },
        AMOUNT: {
            IMPLOSION: 200,
            SHOCKWAVE: 175,
            CLOUD: 50
        },
        SPEED: {
            IMPLOSION: {
                MIN: -5,
                MAX: -5
            },
            SHOCKWAVE: {
                MIN: 5,
                MAX: 5
            },
            CLOUD: {
                MIN: 0.5,
                MAX: 1
            }
        },
        SIZE: {
            IMPLOSION: {
                MIN: 20,
                MAX: 20
            },
            SHOCKWAVE: {
                MIN: 35,
                MAX: 35
            },
            CLOUD: {
                MIN: 40,
                MAX: 60
            }
        },
        RADIUS: {
            IMPLOSION: {
                MIN: 15 * 10,
                MAX: 15 * 10
            },
            SHOCKWAVE: {
                MIN: 0,
                MAX: 0
            },
            CLOUD: {
                MIN: 0,
                MAX: 0
            }
        },
        TIME: {
            IMPLOSION: 0,
            SHOCKWAVE: 60 * 1.5,
            CLOUD: 60 * 1.5,
            DESTROY: 60 * 10
        },
        BLAST_RATE: 60 * 60 * 4,
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
                LEVELS: [0, 1],
                POINTS: [1000, 2500],
                CRYSTAL_DROPS: [100, 200],
                WEAPON_DROPS: [21, 12]
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

    blast = null;
    blastEnd = false;

    mainBomb = null;
    mainBombReady = false;
    mainBombShield = C.MAIN_BOMB_OPTIONS.MAX_SHIELD;

    smallBombs = [];

    waitingForPlayers = false;
    waitingEndTime = 0;

    safeZoneOpen = true;

    numRounds = 0;

    constructor() {
        this.reset();
    }

    tick() {
        this.manageRounds();

        this.manageShips();
        this.spawnAliens();
        this.spawnCollectibles();

        this.spawnActiveObjects();
        
        this.manageEntities();
    }

    reset() {
        this.deleteEverything();
        this.resetMainBomb();
        this.spawnInactiveObjects();
        this.selectRandomTeams();
        this.resetShips();
    }

    deleteEverything() {
        for (let alien of game.aliens) {
            alien.set({ kill: true });
        }
        for (let asteroid of game.asteroids) {
            asteroid.set({ kill: true });
        }
        for (let ship of game.ships) {
            ship.emptyWeapons();
        }
        if (game.objects.length > 0) {
            game.removeObject();
        }
    }

    resetMainBomb() {
        this.mainBomb = null;
        this.mainBombReady = false;
        this.mainBombShield = C.MAIN_BOMB_OPTIONS.MAX_SHIELD;
        this.spawnNewMainBomb();
    }

    spawnNewMainBomb() {
        let alien = C.ALIEN_OPTIONS.ALIENS[7];
        let level = alien.LEVELS[0];
        this.mainBomb = new Alien(
            new Vector2(C.MAIN_BOMB_OPTIONS.POSITION.x, C.MAIN_BOMB_OPTIONS.POSITION.y),
            new Vector2(C.MAIN_BOMB_OPTIONS.VELOCITY.x, C.MAIN_BOMB_OPTIONS.VELOCITY.y),

            alien.NAME,
            alien.CODE,
            level,

            C.MAIN_BOMB_OPTIONS.POINTS,
            C.MAIN_BOMB_OPTIONS.CRYSTAL_DROP,
            C.MAIN_BOMB_OPTIONS.WEAPON_DROP
        );

        this.mainBombReady = false;
    }

    spawnInactiveObjects() {
        let oppenheimerLogo = Helper.deepCopy(C.OBJECTS.OPPENHEIMER_LOGO);
        new Obj(
            oppenheimerLogo.id,

            oppenheimerLogo.type,

            new Vector3(oppenheimerLogo.position.x, oppenheimerLogo.position.y, oppenheimerLogo.position.z),
            new Vector3(oppenheimerLogo.rotation.x, oppenheimerLogo.rotation.y, oppenheimerLogo.rotation.z),
            new Vector3(oppenheimerLogo.scale.x, oppenheimerLogo.scale.y, oppenheimerLogo.scale.z)
        );

        let safeZone1 = Helper.deepCopy(C.OBJECTS.SAFE_ZONE);
        safeZone1.id = C.OBJECTS.SAFE_ZONE.id + '_' + 1;
        safeZone1.type.id = C.OBJECTS.SAFE_ZONE.type.id + '_' + 1;
        safeZone1.position.y = -C.GAME_OPTIONS.MAP_SIZE / 2 * 10;
        let safeZone2 = Helper.deepCopy(C.OBJECTS.SAFE_ZONE);
        safeZone2.id = C.OBJECTS.SAFE_ZONE.id + '_' + 2;
        safeZone2.type.id = C.OBJECTS.SAFE_ZONE.type.id + '_' + 2;
        safeZone2.position.y = C.GAME_OPTIONS.MAP_SIZE / 2 * 10;
        new Obj(
            safeZone1.id,

            safeZone1.type,

            new Vector3(safeZone1.position.x, safeZone1.position.y, safeZone1.position.z),
            new Vector3(safeZone1.rotation.x, safeZone1.rotation.y, safeZone1.rotation.z),
            new Vector3(safeZone1.scale.x, safeZone1.scale.y, safeZone1.scale.z)
        );
        new Obj(
            safeZone2.id,

            safeZone2.type,

            new Vector3(safeZone2.position.x, safeZone2.position.y, safeZone2.position.z),
            new Vector3(safeZone2.rotation.x, safeZone2.rotation.y, safeZone2.rotation.z),
            new Vector3(safeZone2.scale.x, safeZone2.scale.y, safeZone2.scale.z)
        );

        let mainBombObj = Helper.deepCopy(C.OBJECTS.MAIN_BOMB);
        new Obj(
            mainBombObj.id,
            
            mainBombObj.type,

            new Vector3(mainBombObj.position.x, mainBombObj.position.y, mainBombObj.position.z),
            new Vector3(mainBombObj.rotation.x, mainBombObj.rotation.y, mainBombObj.rotation.z),
            new Vector3(mainBombObj.scale.x, mainBombObj.scale.y, mainBombObj.scale.z)
        );
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
                    teamOption.HUE,
                    teamOption.IS_DEFENDING
                )
            );
        }
    }

    resetShips() {
        this.ships = Helper.shuffleArray(this.ships);
        for (let ship of this.ships) {
            this.resetShip(ship);
        }
    }

    resetShip(ship) {
        ship.setCrystals(ship.getMaxCrystals());
        ship.setShield(999999);
        ship.setStats(99999999);

        let teamCopy = Helper.deepCopy(this.teams);
        teamCopy.sort((a, b) => {
            return a.numShips - b.numShips;
        });
        let t = null;
        for (let team of this.teams) {
            if (team.team == teamCopy[0].team) {
                t = team;
                break;
            }
        }
        ship.setTeam(t);
        ship.team.numShips++;

        ship.setPosition(new Vector2(C.ROUND_OPTIONS.STARTING_POSITION.x, C.ROUND_OPTIONS.STARTING_POSITION.y));
        ship.setVelocity(new Vector2(C.ROUND_OPTIONS.STARTING_VELOCITY.x, C.ROUND_OPTIONS.STARTING_VELOCITY.y));
    }

    manageRounds() {
        if (this.ships.length < C.ROUND_OPTIONS.MIN_PLAYERS) {
            this.waitingForPlayers = true;
            this.waitingEndTime = 0;
        }
        else {
            this.waitingForPlayers = false;
            if (this.waitingEndTime === 0) {
                this.waitingEndTime = game.step;
            }
        }

        if (!this.waitingForPlayers) {
            if (this.numRounds < C.ROUND_OPTIONS.MAX_ROUNDS && (this.mainBombShield <= 0 || (game.step - this.waitingEndTime + 1) % C.ROUND_OPTIONS.ROUND_RATE === 0)) {
                if (this.mainBombShield <= C.ROUND_OPTIONS.WINNING_THRESHOLD * C.MAIN_BOMB_OPTIONS.MAX_SHIELD) {
                    this.mainBombShield = C.MAIN_BOMB_OPTIONS.MAX_SHIELD;
                    this.blast = new Blast(2);
                    this.blastEnd = true;

                    for (let ship of this.ships) {
                        if (!ship.team.isDefending) {
                            ship.setInvulnerable(C.ROUND_OPTIONS.WINNING_INVULNERABLE);
                            ship.setScore(ship.ship.score + C.ROUND_OPTIONS.WINNING_SCORE);
                            ship.setRoundsWon(ship.roundsWon + 1);
                            ship.sendMessage('You won the round! The bomb is now triggered!', '#00ff00');
                        }
                        else {
                            ship.setRoundsLost(ship.roundsLost + 1);
                            ship.sendMessage('You lost the round! The bomb is now triggered!', '#ff0000');
                        }
                    }
                }
                else {
                    this.blast = null;
                    this.reset();

                    for (let ship of this.ships) {
                        if (ship.team.isDefending) {
                            ship.setScore(ship.ship.score + C.ROUND_OPTIONS.WINNING_SCORE);
                            ship.setRoundsWon(ship.roundsWon + 1);
                            ship.sendMessage('You won the round! The bomb is now protected!', '#00ff00');
                        }
                        else {
                            ship.setRoundsLost(ship.roundsLost + 1);
                            ship.sendMessage('You lost the round! The bomb is now protected!', '#ff0000');
                        }
                    }
                }

                this.numRounds++;
                this.waitingEndTime = game.step;
            }
            if (this.numRounds >= C.ROUND_OPTIONS.MAX_ROUNDS && game.step - this.waitingEndTime >= C.ROUND_OPTIONS.MESSAGE_TIME) {
                for (let gameShip of game.ships) { // we do raw here
                    let ship = this.findShip(gameShip);
                    let gameOver = {
                        'Thank you for playing': 'Oppenheimer',
                        score: gameShip.score
                    };
                    if (ship != null) {
                        gameOver['Rounds Won'] = ship.roundsWon;
                        gameOver['Rounds Lost'] = ship.roundsLost;
                    }
                    gameShip.gameover(
                        gameOver
                    );
                }
            }

            if ((game.step - this.waitingEndTime + 1) % C.BLAST_OPTIONS.BLAST_RATE === 0) {
                this.blast = new Blast(1);
                for (let ship of this.ships) {
                    ship.sendMessage('The bomb is exploding!', '#0000ff');
                }
            }

            if (
                (game.step - this.waitingEndTime + 1) % C.BLAST_OPTIONS.BLAST_RATE >= C.SAFE_ZONE_OPTIONS.OPEN * C.BLAST_OPTIONS.BLAST_RATE &&
                (game.step - this.waitingEndTime + 1) % C.BLAST_OPTIONS.BLAST_RATE <= C.SAFE_ZONE_OPTIONS.CLOSE * C.BLAST_OPTIONS.BLAST_RATE
            ) {
                this.safeZoneOpen = false;
            }
            else {
                this.safeZoneOpen = true;
            }

            if ((game.step - this.waitingEndTime + 1) % C.BLAST_OPTIONS.BLAST_RATE == C.SAFE_ZONE_OPTIONS.CLOSE * C.BLAST_OPTIONS.BLAST_RATE) {
                for (let ship of this.ships) {
                    ship.sendMessage('The bomb is about to explode! Hide in the safe zone!', '#0000ff');
                }
            }
        }

        if (this.blast != null) {
            if (this.blast.running) {
                this.blast.tick();
            }
            else {
                this.blast = null;
                if (this.blastEnd) {
                    this.blastEnd = false;
                    this.reset();
                }
            }
        }

        if (game.step % C.ROUND_OPTIONS.MAIN_BOMB_MAINTENANCE === 0) {
            if (this.mainBomb != null && game.aliens.includes(this.mainBomb.alien) && this.mainBomb.alien.id != -1) { // making sure init
                if (!this.mainBombReady) {
                    this.mainBomb
                        .setRate(C.MAIN_BOMB_OPTIONS.LASER_RATE)
                        .setDamage(C.MAIN_BOMB_OPTIONS.LASER_DAMAGE)
                        .setLaserSpeed(C.MAIN_BOMB_OPTIONS.LASER_SPEED)
                        .setShield(C.MAIN_BOMB_OPTIONS.INDIVIDUAL_SHIELD)
                    this.mainBombReady = true;
                }
                this.mainBomb
                    .setPosition(new Vector2(C.MAIN_BOMB_OPTIONS.POSITION.x, C.MAIN_BOMB_OPTIONS.POSITION.y),)
                    .setVelocity(new Vector2(C.MAIN_BOMB_OPTIONS.VELOCITY.x, C.MAIN_BOMB_OPTIONS.VELOCITY.y),)
            }

            this.mainBombShield = Helper.clamp(this.mainBombShield, 0, C.MAIN_BOMB_OPTIONS.MAX_SHIELD);
        }
    }
    
    manageEntities() {
        if (game.step % C.ROUND_OPTIONS.ENTITY_MANAGER === 0) {
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
                    Helper.deleteFromArray(this.ships, ship);
                    ship.team.numShips--;
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
        if (game.step % C.ROUND_OPTIONS.SHIP_UPDATE === 0) {
            for (let ship of this.ships) {
                if (!ship.isMaxed &&
                    !(
                        ship.ship.x == 0 &&
                        ship.ship.y == 0 &&
                        ship.ship.vx == 0 &&
                        ship.ship.vy == 0 &&
                        ship.ship.r == 0 &&
                        !ship.ship.alive
                    )
                ) { // if not during ship selection screen
                    this.resetShip(ship);

                    ship.sendUI(Helper.deepCopy(C.UIS.LIVES_BLOCKER));

                    ship.setInvulnerable(C.ROUND_OPTIONS.INVULERNABLE);
                    ship.sendUI(Helper.deepCopy(C.UIS.LOGO));
                    ship.sendUI(Helper.deepCopy(C.UIS.INSTRUCTIONS));

                    ship.isMaxed = true;
                }

                if (ship.isMaxed && ship.doneInstructions) {
                    if (!this.waitingForPlayers) {
                        ship.hideUI(Helper.deepCopy(C.UIS.WAIT));
                        ship.setIdle(false);
                        ship.setCollider(true);

                        let roundTimer = Helper.deepCopy(C.UIS.ROUND_TIMER);
                        roundTimer.components[1].value = Helper.formatTime(C.ROUND_OPTIONS.ROUND_RATE - ((game.step - this.waitingEndTime + 1) % C.ROUND_OPTIONS.ROUND_RATE));
                        ship.sendUI(roundTimer);
        
                        let blastTimer = Helper.deepCopy(C.UIS.BLAST_TIMER);
                        blastTimer.components[1].value = Helper.formatTime(C.BLAST_OPTIONS.BLAST_RATE - ((game.step - this.waitingEndTime + 1) % C.BLAST_OPTIONS.BLAST_RATE));
                        ship.sendUI(blastTimer);

                        let mainBombShieldBar = Helper.deepCopy(C.UIS.MAIN_BOMB_SHIELD_BAR);
                        mainBombShieldBar.components[1].value = `Round ${this.numRounds + 1} | Main Bomb Shield: ${this.mainBombShield} / ${C.MAIN_BOMB_OPTIONS.MAX_SHIELD} | You are ${ship.team.isDefending ? 'defending' : 'attacking'}`;
                        mainBombShieldBar.components[2].stroke = ship.team.isDefending ? '#00ff00' : '#ff0000';
                        mainBombShieldBar.components[2].fill = ship.team.isDefending ? '#00ff0080' : '#ff000080';
                        mainBombShieldBar.components[3].fill = ship.team.isDefending ? '#00ff00' : '#ff0000';
                        mainBombShieldBar.components[3].position[2] = this.mainBombShield / C.MAIN_BOMB_OPTIONS.MAX_SHIELD * 100;
                        mainBombShieldBar.components[4].value = `Predicted winner: ${this.mainBombShield <= C.ROUND_OPTIONS.WINNING_THRESHOLD * C.MAIN_BOMB_OPTIONS.MAX_SHIELD ? `Team ${this.teams[1].color} | Attackers` : `Team ${this.teams[0].color} | Defenders`}`
                        ship.sendUI(mainBombShieldBar);

                        for (let sb of this.smallBombs) {
                            let smallBomb = sb.obj;
                            if (ship.team.isDefending && new Vector2(smallBomb.position.x, smallBomb.position.y).getDistanceTo(new Vector2(ship.ship.x, ship.ship.y)) <= C.SMALL_BOMB_OPTIONS.PICKUP_RADIUS) {
                                sb.destroySelf();
                                Helper.deleteFromArray(this.smallBombs, sb);

                                this.mainBombShield += C.SMALL_BOMB_OPTIONS.HEAL;
                                ship.setScore(ship.ship.score + C.SMALL_BOMB_OPTIONS.SCORE);
                            }
                        }

                        let safeZoneState = Helper.deepCopy(C.UIS.SAFE_ZONE_STATE);
                        safeZoneState.components[0].stroke = this.safeZoneOpen ? '#00ff00' : '#ff0000';
                        safeZoneState.components[0].fill = this.safeZoneOpen ? '#00ff0080' : '#ff000080';
                        safeZoneState.components[1].value = this.safeZoneOpen ? 'The safe zone is open!' : 'The safe zone is closed!';
                        ship.sendUI(safeZoneState);
                        if (
                            !this.safeZoneOpen &&
                            ship.ship.x >= -C.SAFE_ZONE_OPTIONS.BOUND_X &&
                            ship.ship.x <= C.SAFE_ZONE_OPTIONS.BOUND_X &&
                            (
                                ship.ship.y <= -C.SAFE_ZONE_OPTIONS.BOUND_Y ||
                                ship.ship.y >= C.SAFE_ZONE_OPTIONS.BOUND_Y
                            )
                        ) {
                            if (ship.ship.shield - C.SAFE_ZONE_OPTIONS.SHIELD_DROP > 0) {
                                ship.setShield(ship.ship.shield - C.SAFE_ZONE_OPTIONS.SHIELD_DROP);
                            }
                            else if (ship.ship.crystals - C.SAFE_ZONE_OPTIONS.CRYSTAL_DROP > 0) {
                                ship.setShield(0);
                                ship.setCrystals(ship.ship.crystals - C.SAFE_ZONE_OPTIONS.CRYSTAL_DROP);
                            }
                            else {
                                ship.destroySelf();
                            }

                            ship.sendMessage('The safe zone is closed! Your ship will take damage!', '#ff0000');
                        }
                    }
                    else {
                        this.hideShipUIs(ship);
    
                        let wait = Helper.deepCopy(C.UIS.WAIT);
                        wait.components[2].value = `${C.ROUND_OPTIONS.MIN_PLAYERS} players required to start`;
                        ship.sendUI(wait);
                        ship.setIdle(true);
                        ship.setCollider(false);
                        ship.setInvulnerable(C.ROUND_OPTIONS.INVULERNABLE);
                        ship.setPosition(new Vector2(C.ROUND_OPTIONS.STARTING_POSITION.x, C.ROUND_OPTIONS.STARTING_POSITION.y));
                        ship.setVelocity(new Vector2(C.ROUND_OPTIONS.STARTING_VELOCITY.x, C.ROUND_OPTIONS.STARTING_VELOCITY.y));
                    }
                }
                else {
                    this.hideShipUIs(ship);
                }

                let radarBackground = Helper.deepCopy(C.UIS.RADAR_BACKGROUND);
                for (let component of radarBackground.components) {
                    component.position = Helper.getRadarSpotPosition(component.position[0], component.position[1], component.position[2], component.position[3]);
                }
                radarBackground.components[0].stroke = ship.team.isDefending ? '#00ff00' : '#ff0000';
                radarBackground.components[0].fill = ship.team.isDefending ? '#00ff0080' : '#ff000080';
                radarBackground.components[2].stroke = this.safeZoneOpen ? '#00ff00' : '#ff0000';
                radarBackground.components[2].fill = this.safeZoneOpen ? '#00ff0033' : '#ff000033';
                radarBackground.components[3].stroke = this.safeZoneOpen ? '#00ff00' : '#ff0000';
                radarBackground.components[3].fill = this.safeZoneOpen ? '#00ff0033' : '#ff000033';

                for (let sb of this.smallBombs) {
                    let smallBomb = sb.obj;
                    radarBackground.components.push({ // SMALL BOMBS
                        type: 'round',
                        position: Helper.getRadarSpotPosition(smallBomb.position.x, smallBomb.position.y, 10 * 2, 10 * 2),
                        stroke: ship.team.isDefending ? '#00ff00' : '#ff0000',
                        fill: ship.team.isDefending ? '#00ff0033' : '#ff000033'
                    });

                    radarBackground.components.push({
                        type: 'text',
                        position: Helper.getRadarSpotPosition(smallBomb.position.x, smallBomb.position.y, 10 * 2, 10 * 2),
                        value: '🧨',
                        color: '#ffffff'
                    });
                }
                ship.sendUI(radarBackground);

                let scoreboard = Helper.deepCopy(C.UIS.SCOREBOARD);
                scoreboard.components[0].fill = this.teams[0].hex;
                scoreboard.components[3].fill = this.teams[1].hex;
                let players1 = [];
                let players2 = [];
                for (let ship of this.ships) {
                    if (ship.team != null) {
                        if (ship.team.team == 0) {
                            players1.push(ship.ship);
                        }
                        else if (ship.team.team == 1) {
                            players2.push(ship.ship);
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
                            id: players1[i].id,
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
                            id: players2[i].id,
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
        ship.hideUI(Helper.deepCopy(C.UIS.ROUND_TIMER));
        ship.hideUI(Helper.deepCopy(C.UIS.BLAST_TIMER));
        ship.hideUI(Helper.deepCopy(C.UIS.SAFE_ZONE_STATE));
        ship.hideUI(Helper.deepCopy(C.UIS.MAIN_BOMB_SHIELD_BAR));
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
        if (
            game.step % C.SMALL_BOMB_OPTIONS.SPAWN_RATE === 0 &&
            this.smallBombs.length < C.SMALL_BOMB_OPTIONS.MAX_AMOUNT
        ) {
            let p = Helper.getRandomRadialCoordinate(C.SMALL_BOMB_OPTIONS.SPAWN_RADIUS, new Vector2(C.SMALL_BOMB_OPTIONS.SPAWN_CENTER.x, C.SMALL_BOMB_OPTIONS.SPAWN_CENTER.y));
            let pos = new Vector3(p.x, p.y, C.OBJECTS.SMALL_BOMB.position.z);
            let smallBomb = Helper.deepCopy(C.OBJECTS.SMALL_BOMB);

            smallBomb.id = C.OBJECTS.SMALL_BOMB.id + '_' + Math.random();
            smallBomb.type.id = C.OBJECTS.SMALL_BOMB.type.id + '_' + Math.random();

            let obj = new Obj(
                smallBomb.id,
                
                smallBomb.type,

                pos,
                new Vector3(smallBomb.rotation.x, smallBomb.rotation.y, Helper.getRandomAngle()),
                new Vector3(smallBomb.scale.x, smallBomb.scale.y, smallBomb.scale.z)
            );

            this.smallBombs.push(
                obj
            );
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
        if (this.findShip(gameShip) == null) {
            let ship = new Ship(gameShip);
            this.ships.push(ship);
        }
        else { // on respawn
            let ship = this.findShip(gameShip);
            ship.setCrystals(ship.getMaxCrystals());
            ship.setShield(999999);
            ship.setStats(99999999);
            ship.setPosition(new Vector2(C.ROUND_OPTIONS.STARTING_POSITION.x, C.ROUND_OPTIONS.STARTING_POSITION.y));
            ship.setVelocity(new Vector2(C.ROUND_OPTIONS.STARTING_VELOCITY.x, C.ROUND_OPTIONS.STARTING_VELOCITY.y));
        }
    }

    onShipDestroyed(gameShip) {
        // Nothing
    }

    onUIComponentClicked(gameShip, id) {
        let ship = this.findShip(gameShip);
        if (ship != null) {
            if (id == C.UIS.INSTRUCTIONS.id) {
                ship.doneInstructions = true;
                ship.hideUI(Helper.deepCopy(C.UIS.LOGO));
                ship.hideUI(Helper.deepCopy(C.UIS.INSTRUCTIONS));
            }
        }
    }

    onAlienDestroyed(gameAlien, gameShip) {
        if (this.mainBomb != null &&
            (
                this.mainBomb.alien == gameAlien ||
                this.mainBomb.alien.id == gameAlien.id
            )
        ) {
            this.mainBomb = null;
            this.mainBombReady = false;
            let ship = this.findShip(gameShip);
            if (ship != null && !ship.team.isDefending) {
                this.mainBombShield -= C.MAIN_BOMB_OPTIONS.INDIVIDUAL_SHIELD;
            }
            this.spawnNewMainBomb();
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
            if (game.step - this.startTime >= C.ROUND_OPTIONS.MESSAGE_TIME) {
                this.ship.hideUI(Helper.deepCopy(C.UIS.MESSAGE));
                this.running = false;
            }
        }
    }
}

class Blast {
    startTime = 0;
    running = false;
    
    intensity = 0;

    constructor(intensity) {
        this.intensity = intensity;
        this.startTime = game.step;
        this.running = true;
    }

    tick() {
        if (this.running) {
            if (game.step - this.startTime == C.BLAST_OPTIONS.TIME.IMPLOSION) {
                this.spawnAsteroidRing(
                    C.BLAST_OPTIONS.AMOUNT.IMPLOSION,
                    C.BLAST_OPTIONS.SPEED.IMPLOSION,
                    C.BLAST_OPTIONS.SIZE.IMPLOSION,
                    C.BLAST_OPTIONS.RADIUS.IMPLOSION,
                    C.BLAST_OPTIONS.TIME.IMPLOSION
                );
            }
            if (game.step - this.startTime == C.BLAST_OPTIONS.TIME.SHOCKWAVE) {
                this.spawnAsteroidRing(
                    C.BLAST_OPTIONS.AMOUNT.SHOCKWAVE,
                    C.BLAST_OPTIONS.SPEED.SHOCKWAVE,
                    C.BLAST_OPTIONS.SIZE.SHOCKWAVE,
                    C.BLAST_OPTIONS.RADIUS.SHOCKWAVE,
                    C.BLAST_OPTIONS.TIME.SHOCKWAVE
                );
            }
            if (game.step - this.startTime == C.BLAST_OPTIONS.TIME.CLOUD) {
                this.spawnAsteroidRing(
                    C.BLAST_OPTIONS.AMOUNT.CLOUD,
                    C.BLAST_OPTIONS.SPEED.CLOUD,
                    C.BLAST_OPTIONS.SIZE.CLOUD,
                    C.BLAST_OPTIONS.RADIUS.CLOUD,
                    C.BLAST_OPTIONS.TIME.CLOUD
                );
            }
            if (game.step - this.startTime >= C.BLAST_OPTIONS.TIME.DESTROY) {
                this.destroyAsteroids();
                this.running = false;
            }
        }
    }

    spawnAsteroidRing(amount, speed, size, radius) {
        for (let i = 0; i < 2 * Math.PI; i += 2 * Math.PI / amount) {
            new Asteroid(
                new Vector2(
                    Math.cos(i) * Helper.getRandomFloat(radius.MIN, radius.MAX),
                    Math.sin(i) * Helper.getRandomFloat(radius.MIN, radius.MAX)
                ),
                new Vector2(
                    Math.cos(i) * Helper.getRandomFloat(speed.MIN, speed.MAX) * this.intensity,
                    Math.sin(i) * Helper.getRandomFloat(speed.MIN, speed.MAX) * this.intensity
                ),
                Helper.getRandomInt(size.MIN, size.MAX)
            )
        }
    }

    destroyAsteroids() {
        for (let i = 0; i < game.asteroids.length; i++) {
            game.asteroids[i].set({ size: 1, kill: true });
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

    isDefending = false;

    constructor(name, team, color, hex, hue, isDefending) {
        this.name = name;
        this.team = team;
        this.color = color;
        this.hex = hex;
        this.hue = hue;
        this.isDefending = isDefending;
    }

    setScore(score) {
        this.score = score;
    }
}

class Ship {
    doneInstructions = false;
    isMaxed = false;

    team = null;
    ship = null;

    message = null;

    roundsWon = 0;
    roundsLost = 0;

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
        if (game.ships.includes(this.ship)) {
            this.ship.set({ score: score });
        }
        return this;
    }

    setRoundsWon(roundsWon) {
        this.roundsWon = roundsWon;
        return this;
    }

    setRoundsLost(roundsLost) {
        this.roundsLost = roundsLost;
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

        game.setObject(this.obj);
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