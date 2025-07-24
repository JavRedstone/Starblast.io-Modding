return model =
  name: 'Door Frame'
  designer: 'ÆTHER'
  level: 1
  model: 1
  size: 1
  zoom: 1
  specs:  
    shield:
      capacity: [150,150]
      reload: [5,5]
    generator:
      capacity: [50,50]
      reload: [50,50]
    ship:
      mass: 225
      speed: [50,50]
      rotation: [50,50]
      acceleration: [50,50]
  bodies:
    Frame:
      section_segments: [45,135,225,315]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0]
        y: [0,-20,-20,-10,10,20,20,0]
        z: [0,0,0,0,0,0,0,0]
      width: [240,235,275,275,275,275,235,240]
      height: [240,235,275,275,275,275,235,240]
      texture: [11,2,3,17,3,2,11]
      propeller: 0
      vertical: 0
      angle: 0
