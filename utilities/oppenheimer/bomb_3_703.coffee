return model =
  name: 'Bomb 3'
  level: 7
  model: 3
  size: 5
  specs:
    shield:
      capacity: [600,700]
      reload: [12,15]
    generator:
      capacity: [400,600]
      reload: [120,150]
    ship:
      mass: 600
      speed: [100,145]
      rotation: [80,80]
      acceleration: [120,120]
      dash:
        rate: 5
        burst_speed: [500,750]
        speed: [500,750]
        acceleration: [400,500]
        initial_energy: [200,300]
        energy: [30,60]
  bodies:
    main:
      section_segments: 8
      offset:
        x: 0
        y: -30
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,3,12,42.5,42.5,47.5,47.5,60,65,60]
        z: [0,0,0,0,0,0,0,0,0,0]
      width: [0,6,18,20,12.75,12,10.5,9,6,0]
      height: [0,6,18,20,12.75,12,10.5,9,6,0]
      texture: [4,63,18,17,15.1,17,63,12,17]
      propeller: 1
    circle:
      section_segments: 6
      offset:
        x: 0
        y: 40
        z: 0
      position:
        x: [0,0,0,0,0,0]
        y: [-15,-3,-15,-15,-3,-3]
        z: [0,0,0,0,0,0]
      width: [25,25,25,30,30,25]
      height: [25,25,25,30,30,25]
      texture: [4,63,3.9,63,3.9,4]
      propeller: false
      vertical: false
    toppropulsors:
      section_segments: 10
      offset:
        x: 17
        y: 25
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-7,-6,0,4,8,12,15,17,19,15]
        z: [0,0,0,0,0,0,0,0,0,0]
      width: [0,3,5,5,6,3,3,5,4,0]
      height: [0,3,5,5,6,3,3,5,4,0]
      texture: [3,4,10,3,3,63,4,12,17]
      propeller: true
    toppropulsors2:
      section_segments: 10
      offset:
        x: 0
        y: 25
        z: 20
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-7,-6,0,4,8,12,15,17,19,15]
        z: [0,0,0,0,0,0,0,0,0,0]
      width: [0,3,5,5,6,3,3,5,4,0]
      height: [0,3,5,5,6,3,3,5,4,0]
      texture: [3,4,10,3,3,63,4,12,17]
      propeller: true
    toppropulsors3:
      section_segments: 10
      offset:
        x: 0
        y: 25
        z: -20
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-7,-6,0,4,8,12,15,17,19,15]
        z: [0,0,0,0,0,0,0,0,0,0]
      width: [0,3,5,5,6,3,3,5,4,0]
      height: [0,3,5,5,6,3,3,5,4,0]
      texture: [3,4,10,3,3,63,4,12,17]
      propeller: true
  wings:
    fin1:
      doubleside: true
      offset:
        x: 0
        y: 20
        z: 0
      length: [ 25 ]
      width: [15,9]
      angle: [ -45 ]
      position: [0,11]
      texture: 63
      bump:
        position: 0
        size: 25
    fin2:
      doubleside: true
      offset:
        x: 0
        y: 20
        z: 0
      length: [ 25 ]
      width: [15,9]
      angle: [ 45 ]
      position: [0,11]
      texture: 63
      bump:
        position: 0
        size: 25
