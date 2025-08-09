return model =
  name: 'Flag'
  level: 1
  model: 1
  size: 1
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
    flag:
      section_segments: [44,45,46,135,225,310,315,320]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,1.6,1.6,1.6,-1.6,-1.6,-1.6,1.6,1.6,1.6,-1.6,-1.6,-1.6,0]
        y: [0,0,14.4,16,17.6,30.4,32,33.6,46.4,48,49.6,62.4,64,65.6,65.6]
        z: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      width: [0,2.4,2.4,2.4,2.4,2.4,2.4,2.4,2.4,2.4,2.4,2.4,2.4,2.4,0]
      height: [0,32,32,32,32,32,32,32,32,32,32,32,32,32,0]
      texture: 63
      vertical: true
      angle: 90
    flagpole:
      section_segments: 10
      offset:
        x: 0
        y: -25
        z: 0
      position:
        x: [0,0,0,0]
        y: [0,0,80,80]
        z: [0,0,0,0]
      width: [0,3.2,3.2,0]
      height: [0,3.2,3.2,0]
      texture: 2
