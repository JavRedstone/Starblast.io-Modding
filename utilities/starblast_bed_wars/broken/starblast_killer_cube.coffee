return model =
  name: 'Killer-Cube',
  level: 7,
  model: 1
  size: 2,
  zoom: 1,
  specs:
    shield:
      capacity: [400,400]
      reload: [15, 15]
    generator:
      capacity: [200, 200]
      reload: [50, 50]
    ship:
      mass: 100
      speed: [150, 150]
      rotation: [100, 100]
      acceleration: [150, 150]
  bodies:
    cube:
      section_segments: [40, 45, 135, 140, 220, 225, 315, 320]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0, 0, 0, 0]
        y: [0, 0, 140, 0]
        z: [0, 0, 0, 0]
      width: [0, 50, 50, 0]
      height: [0, 50, 50, 0]
      propeller: true
      texture: [63, 63, 17]
    cannon:
      section_segments: 5
      offset:
        x: 0
        y: 100
        z: 50
      position:
        x: [0 ,0 ,0 ,0 ,0]
        y: [-80, -50, -20, 0, 20]
        z: [0, 0, 0, 0, 0]
      width: [0, 5, 5, 10, 0]
      height: [0, 5, 5, 10, 0]
      angle: 0
      laser:
        damage: [20, 20]
        rate: 10
        type: 1
        speed: [250, 250]
        number: 1
        error: 5
      texture: [4,3,17,6]
