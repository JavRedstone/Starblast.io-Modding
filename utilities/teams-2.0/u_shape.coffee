return model =
  name: 'U-Shape'
  level: 1
  model: 1
  size: 1.8
  specs:
    shield:
      capacity: [250,300]
      reload: [4,6]
    generator:
      capacity: [100,160]
      reload: [50,60]
    ship:
      mass: 200
      speed: [125,145]
      rotation: [50,70]
      acceleration: [60,110]
  bodies:
    uwings:
      section_segments: [0,90,180]
      offset:
        x: -55
        y: -30
        z: 0
      position:
        x: [0,0,0,0,0,0]
        y: [-60,-50,40,80,90,100]
        z: [0,0,0,0,0,0]
      width: [0,5,20,25,25]
      height: [0,5,60,80,85]
      texture: [4,13,10.6,10]
  wings:
    forward:
      offset:
        x: -55
        y: -15
        z: 0
      length: [ 10 ]
      width: [150,200]
      angle: [ 0 ]
      position: [0, 0]
      texture: [17,17]
      doubleside: true
      bump:
        position: 30
        size: 0
