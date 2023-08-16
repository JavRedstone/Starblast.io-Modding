return model =
  name: 'Bomb 2'
  level: 7
  model: 1
  size: 2.2
  specs:
    shield:
      capacity: [300,400]
      reload: [12,15]
    generator:
      capacity: [500,500]
      reload: [150,150]
    ship:
      mass: 300
      speed: [120,120]
      rotation: [60,60]
      acceleration: [45,45]
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
      width: [0,6,12,13.5,12.75,12,10.5,9,6,0]
      height: [0,6,12,13.5,12.75,12,10.5,9,6,0]
      texture: [4,63,18,17,15.1,17,63,12,17]
      propeller: 1
    circle:
      section_segments: [40,50,130,140,220,230,310,320,400]
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
      texture: [4,16,4,63,4,4]
      propeller: false
      vertical: false
    things1:
      section_segments: 10
      offset:
        x: 2
        y: -3
        z: 0
      position:
        x: [0,0,0,0,0,0]
        y: [7,12,11,12,12]
        z: [0,0,0,0,0,0]
      width: [8,7,4,3,0]
      height: [8,7,4,3,0]
      texture: [63,16.9,5,16.9]
      vertical: false
      angle: 90
      laser:
        damage: [82.5,82.5]
        rate: 2
        type: 2
        speed: [200,200]
        recoil: 0
        number: 3
        angle: 15
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
