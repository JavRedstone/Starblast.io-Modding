return model =
  name: 'Alien Turret Bullet'
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
    BOOLET:
      section_segments: 4
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0]
        y: [0,15,17,19,25]
        z: [0,0,0,0,0]
      width: [0,2,0.5,2,0]
      height: [0,2,0.5,2,0]
      texture: [6,63,4,0,17]
      angle:0
