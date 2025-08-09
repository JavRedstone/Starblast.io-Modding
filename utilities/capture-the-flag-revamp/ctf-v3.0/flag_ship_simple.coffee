return model =
  name: 'Flag'
  level: 1
  model: 1
  size: 1,
  next: []
  specs:
    shield:
      capacity: [1,1]
      reload: [1,1]
    generator:
      capacity: [1,1]
      reload: [1,1]
    ship:
      mass: 1
      speed: [1,1]
      rotation: [1,1]
      acceleration: [1,1]
  bodies:
    flagpole:
      section_segments: 10
      offset:
        x: 0
        y: -25
        z: 0
      position:
        x: [-25,-25,-25,-25]
        y: [0,0,80,80]
        z: [0,0,0,0]
      width: [0,3.2,3.2,0]
      height: [0,3.2,3.2,0]
      texture: 2
  wings:
    main:
      doubleside: true
      offset:
        x: 0
        y: 0
        z: 0
      length: [25]
      width: [40,40,40]
      angle: [0,0]
      position: [0,0,0]
      texture: 63
      bump:
        position: 0
        size: 0
