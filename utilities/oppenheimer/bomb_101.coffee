return model =
  name: 'Bomb'
  level: 1
  model: 1
  size: 1.5
  specs:
    shield:
      capacity: [15,15]
      reload: [300,300]
    generator:
      capacity: [150,150]
      reload: [45,45]
    ship:
      mass: 3000
      speed: [120,120]
      rotation: [60,60]
      acceleration: [15,15]
  bodies: main:
    section_segments: 8
    offset:
      x: 0
      y: -37.5
      z: 0
    position:
      x: [0,0,0,0,0,0,0,0,0,0]
      y: [0,3,12,42.5,42.5,47.5,47.5,60,67.5,65]
      z: [0,0,0,0,0,0,0,0,0,0]
    width: [0,6,12,13.5,12.75,12,10.5,9,6,0]
    height: [0,6,12,13.5,12.75,12,10.5,9,6,0]
    texture: [2,2,1,3,3,3,1,2,4]
  wings:
    fin1:
      doubleside: true
      offset:
        x: 0
        y: 18
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
        y: 18
        z: 0
      length: [ 21 ]
      width: [15,9]
      angle: [ 45 ]
      position: [0,9]
      texture: 63
      bump:
        position: 0
        size: 15
