return model =
  name: 'Alien Turret'
  designer: 'ÆTHER'
  level: 5
  model: 6
  size: 1.2
  zoom: 1
  specs:
    shield:
      capacity: [275,340]
      reload: [5,7]
    generator:
      capacity: [50,50]
      reload: [35,50]
    ship:
      mass: 225
      speed: [85,98]
      rotation: [70,95]
      acceleration: [90,120]
  bodies:
    Turret_Base_booty_plug:
      section_segments: 8
      angle: 0
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        y: [0,15,25,25,32,35,50,55,60,70,72,78,80,90,95,95]
        z: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      width: [0,10,10,15,15,10,10,15,30,30,25,25,30,30,28,0]
      height: [0,10,10,15,15,10,10,15,30,30,25,25,30,30,28,0]
      texture: [4,63,17,8,4,13,4,8,63,13,16,13,63,2,4,0]
      vertical: true
    Turret_Top:
      section_segments: 3
      angle: 0
      offset:
        x: 0
        y: 85
        z: 0
      position:
        x: [0,0,0,0,null]
        y: [10,15,11,12,null]
        z: [0,0,0,0,null]
      width: [25,20,15,0,null]
      height: [25,20,15,0,null]
      texture: [63,12,63]
      vertical: true
    cannons_base:
      section_segments: [35,55,125,145,215,235,305,325,395]
      offset:
        x: 0
        y: -20
        z: 75
      position:
        x: [0,0,0,0]
        y: [-30,25,28,25]
        z: [0,0,0,0]
      width: [25,25,0,0]
      height: [10,10,0,0]
      texture: [63,4,4]
      angle: 180
    ring1:
      section_segments: [35,55,125,145,215,235,305,325,395]
      offset:
        x: 0
        y: -140
        z: 75
      position:
        x: [0,0,0,0,0,0,0,0]
        y: [0,-5,-5,-2.5,2.5,5,1,0]
        z: [0,0,0,0,0,0,0,0]
      width: [0,15,20,25,25,20,15,0]
      height: [0,10,12,15,15,12,10,0]
      texture: [16.9,63,3.9,9.9,3.9,63,16.9,0]
      propeller: 0
      vertical: 0
    ring2:
      section_segments: [35,55,125,145,215,235,305,325,395]
      offset:
        x: 0
        y: -120
        z: 75
      position:
        x: [0,0,0,0,0,0,0,0]
        y: [0,-5,-5,-2.5,2.5,5,1,0]
        z: [0,0,0,0,0,0,0,0]
      width: [0,15,20,25,25,20,15,0]
      height: [0,10,12,15,15,12,10,0]
      texture: [16.9,63,3.9,9.9,3.9,63,16.9,0]
      propeller: 0
      vertical: 0
    cannons:
      section_segments: 8
      offset:
        x: 8
        y: -55
        z: 75
      position:
        x: [0,0,0,0,0,0,0,null]
        y: [-80,-100,-25,-25,0,10,20,null]
        z: [0,0,0,0,0,0,0,null]
      width: [0,6,6,8,8,8,0,null]
      height: [0,6,6,8,8,8,0,null]
      texture: [17,3,17,8]
      angle: 0
      laser:
        damage: [50,50]
        rate: 2
        type: 1
        speed: [160,180]
        number: 1
        error: 5
     You_could_probably_put_secret_bomb_codes_in_a_ships_code_and_get_away_with_it_lol:
      section_segments: [35,55,125,145,215,235,305,325,395]
      offset:
        x: 0
        y: 10
        z: 75
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-20,25,25,25,50,50,60,60,70,75]
        z: [0,0,0,0,0,0,0,0,0,0]
      width: [15,15,35,35,35,15,15,35,35,0]
      height: [10,10,25,25,25,10,10,25,25,0]
      texture: [63,4,4,4,17,63,17,4,63]
      angle: 0
     I_NEED_MORE_BOOLETS:
      section_segments: 12
      offset:
        x: 0
        y: -5
        z: 75
      position:
        x: [70,70,70,70,70,70,70,70,70,70]
        y: [0,0,5,30,30,40,40,65,70,70,0]
        z: [0,0,0,0,0,0,0,0,0,0,0]
      width: [0,20,30,30,20,20,30,30,25,0]
      height: [0,20,30,30,20,20,30,30,25,0]
      texture: [3,63,4,17,13,17,4,63,3]
    TRIANGLE4:
      section_segments: [140,170,260,280,380,400]
      offset:
        x: 0
        y: 48
        z: 75
      position:
        x: [33,33,33,33,33,33,33,33]
        y: [0,-8,-8,-2.5,2.5,8,8,0]
        z: [0,0,0,0,0,0,0,0]
      width: [35,45,50,65,65,50,45,35]
      height: [35,45,50,65,65,50,45,35]
      texture: [63,63,3.7,63,3.7,63,63,0]
      propeller: 0
      vertical: 0
      angle: 0
    BOOLET1:
      section_segments: 4
      offset:
        x: 0
        y: 0
        z: 75
      position:
        x: [40,40,40,40,40]
        y: [0,15,17,19,25]
        z: [0,0,0,0,0]
      width: [0,2,0.5,2,0]
      height: [0,2,0.5,2,0]
      texture: [6,63,4,0,17]
    BOOLET2:
      section_segments: 4
      offset:
        x: 0
        y: -5
        z: 75
      position:
        x: [38,38,38,38,38]
        y: [0,15,17,19,25]
        z: [0,0,0,0,0]
      width: [0,2,0.5,2,0]
      height: [0,2,0.5,2,0]
      texture: [6,63,4,0,17]
      angle:-5
    BOOLET3:
      section_segments: 4
      offset:
        x: 0
        y: -8
        z: 75
      position:
        x: [35,35,35,35,35]
        y: [0,15,17,19,25]
        z: [0,0,0,0,0]
      width: [0,2,0.5,2,0]
      height: [0,2,0.5,2,0]
      texture: [6,63,4,0,17]
      angle:-7
    BOOLET4:
      section_segments: 4
      offset:
        x: 0
        y: -7.5
        z: 75
      position:
        x: [31,31,31,31,31]
        y: [0,15,17,19,25]
        z: [0,0,0,0,0]
      width: [0,2,0.5,2,0]
      height: [0,2,0.5,2,0]
      texture: [6,63,4,0,17]
      angle:-5
    BOOLET5:
      section_segments: 4
      offset:
        x: 0
        y: -5
        z: 75
      position:
        x: [26,26,26,26,26]
        y: [0,15,17,19,25]
        z: [0,0,0,0,0]
      width: [0,2,0.5,2,0]
      height: [0,2,0.5,2,0]
      texture: [6,63,4,0,17]
      angle:0
