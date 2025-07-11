return model =
  name: 'Alien-Base'
  level: 7
  model: 1
  size: 2
  specs:
    shield:
      capacity: [500,500]
      reload: [8,8]
    generator:
      capacity: [0,0]
      reload: [0,0]
    ship:
      mass: 2500
      speed: [0,0]
      rotation: [0,0]
      acceleration: [0,0]
  bodies:
    Base_triangle:
      section_segments: [120,240,380]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0]
        y: [-100,-100,100,100]
        z: [0,0,0,0]
      width: [0,200,200,0]
      height: [0,70,70,0]
      texture: [3.2,3.74,3.2]
      propeller: 0
      vertical: 1
    Depot_Base_square:
      section_segments: [45,135,225,315]
      offset:
        x: 0
        y: 45
        z: 0
      position:
        x: [0,0,0,0]
        y: [-12.5,-12.5,12.5,12.5]
        z: [0,0,0,0]
      width: [0,200,200,0]
      height: [0,100,100,0]
      texture: [4,10,4]
      propeller: 0
      vertical: 0
    Depot_base_square_rounded:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: 70
        z: 0
      position:
        x: [0,0,0,0]
        y: [-12.5,-12.5,12.5,12.5]
        z: [0,0,0,0]
      width: [0,225,225,0]
      height: [0,130,130,0]
      texture: [1,1,11]
      propeller: 0
      vertical: 0
    Spawn_Base_square:
      section_segments: [45,135,225,315]
      offset:
        x: 0
        y: -150
        z: 0
      position:
        x: [-180,-180,-180,-180]
        y: [-12.5,-12.5,12.5,12.5]
        z: [0,0,0,0]
      width: [0,60,60,0]
      height: [0,100,100,0]
      texture: [4,10,4]
      propeller: 0
      vertical: 0
      angle: 45
    Spawn_base_square_rounded:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: -185
        z: 0
      position:
        x: [-205,-205,-205,-205]
        y: [-12.5,-12.5,12.5,12.5]
        z: [0,0,0,0]
      width: [0,100,100,0]
      height: [0,130,130,0]
      texture: [11,1,1]
      propeller: 0
      vertical: 0
      angle: 45
    Alien_Base_square:
      section_segments: [45,135,225,315]
      offset:
        x: 0
        y: -50
        z: 0
      position:
        x: [60,60,60,60]
        y: [-12.5,-12.5,12.5,12.5]
        z: [0,0,0,0]
      width: [0,150,150,0]
      height: [0,100,100,0]
      texture: [4,10,4]
      propeller: 0
      vertical: 0
      angle: -23
    Alien_base_square_rounded:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: -76
        z: 0
      position:
        x: [70,70,70,70]
        y: [-12.5,-12.5,12.5,12.5]
        z: [0,0,0,0]
      width: [0,180,180,0]
      height: [0,130,130,0]
      texture: [11,1,1]
      propeller: 0
      vertical: 0
      angle: -23
