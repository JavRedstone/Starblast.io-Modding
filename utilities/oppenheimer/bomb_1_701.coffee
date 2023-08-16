return model =
  name: 'Bomb 1'
  level: 7
  model: 1
  size: 2.2
  specs:
    shield:
      capacity: [300,400]
      reload: [12,15]
    generator:
      capacity: [250,250]
      reload: [75,75]
    ship:
      mass: 300
      speed: [120,120]
      rotation: [60,60]
      acceleration: [45,45]
  bodies: main:
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
    laser:
      damage: [249.9,249.9]
      rate: 2
      type: 2
      speed: [200,200]
      recoil: 70
      number: 1
      error: 0
  wings:
    fin1:
      doubleside: true
      offset:
        x: 0
        y: 20
        z: 0
      length: [ 21 ]
      width: [15,9]
      angle: [ -45 ]
      position: [0,9]
      texture: 63
      bump:
        position: 0
        size: 15
    fin2:
      doubleside: true
      offset:
        x: 0
        y: 20
        z: 0
      length: [ 21 ]
      width: [15,9]
      angle: [ 45 ]
      position: [0,9]
      texture: 63
      bump:
        position: 0
        size: 15
