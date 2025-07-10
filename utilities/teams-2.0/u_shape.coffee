return model =
  name: 'U-Sniper Mk 2'
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
      section_segments: [0,45,90,135,180]
      offset:
        x: -55
        y: -30
        z: 0
      position:
        x: [0,0,0,0,0,0]
        y: [-90,-100,40,80,90,100]
        z: [0,0,0,0,0,0]
      width: [0,0,25,20,0]
      height: [0,5,25,20,0]
      texture: [12,1,11,3]
  wings:
    inner:
      offset:
        x: -58
        y: -20
        z: 0
      length: [ 10 ]
      width: [165,165]
      angle: [ 0 ]
      position: [20,-30]
      texture: [17,63]
      doubleside: true
      bump:
        position: 30
        size: 4
