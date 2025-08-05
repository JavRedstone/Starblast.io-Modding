return model =
  name: 'powercore_tv2'
  designer: 'Nerd69420'
  level: 1
  model: 1
  size: 1
  specs:
    shield:
      capacity: [10,10]
      reload: [10,10]
    generator:
      capacity: [10,10]
      reload: [10,10]
    ship:
      mass: 10
      speed: [10,10]
      rotation: [10,10]
      acceleration: [10,10]
  bodies:
    containmentring:
      section_segments: 12
      offset:
        x: 0
        y: -100
        z: 0
      position:
        x: [0,0,0,0,0,0]
        y: [0,-18,-52,-55,0,0]
        z: [0,0,0,0,0,0,0]
      width: [90,100,103,110,110,90]
      height: [90,100,103,110,110,90]
      texture:[6,17,6,6,4]
      propeller: false
    base:
      section_segments: 16
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0]
        y: [10,-13,-19,-18,-10,-8,10,30,10]
        z: [0,0,0,0,0,0,0,0,0,0]
      width: [100,110,140,240,255,280,290,205,100]
      height: [100,110,140,240,255,280,290,205,100]
      texture: [4,4,15.01,17,4,4,15.99,15.1]
      propeller: false
    under:
      section_segments: 12
      offset:
        x: 0
        y: 10
        z: 0
      position:
        x: [0,0,0]
        y: [0,-30,0]
        z: [0,0,0]
      width: [120,0,130]
      height: [120,0,130]
      texture: [17,4]
      angle:180
    lith:
      section_segments: [45,135,225,315]
      offset:
        x: 185
        y: 0
        z: 0
      position:
        x: [-30,-23,-16,-11,-8,-5.5,-3,0,0]
        y: [-275,-275,-230,-195,-175,-160,-140,-120,0]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,10,22,31,36,40,45,50,105]
      height: [40,40,40,40,40,40,40,40,40]
      texture: [17,6,2,17,1,17,1,10]
      propeller: false
    lith2:
      section_segments: [45,135,225,315]
      offset:
        x: 0
        y: 0
        z: 185
      position:
        x: [0,0,0,0,0,0,0,0,0]
        y: [-275,-275,-230,-195,-175,-160,-140,-120,0]
        z: [-30,-23,-16,-11,-8,-5.5,-3,0,0]
      width: [40,40,40,40,40,40,40,40,40]
      height: [0,10,22,31,36,40,45,50,105]
      texture: [17,6,1,17,1,17,1,10]
      propeller: false
    lith3:
      section_segments: [45,135,225,315]
      offset:
        x: 0
        y: 0
        z: -185
      position:
        x: [0,0,0,0,0,0,0,0,0]
        y: [-275,-275,-230,-195,-175,-160,-140,-120,0]
        z: [30,23,16,11,8,5.5,3,0,0]
      width: [40,40,40,40,40,40,40,40,40]
      height: [0,10,22,31,36,40,45,50,105]
      texture: [17,6,2,17,1,17,1,10]
      propeller: false
    rod1:
      section_segments: 6
      offset:
        x: 0
        y: 0
        z: 125
      position:
        x: [0,0]
        y: [-150,150]
        z: [0,0]
      width: [7,7]
      height: [7,7]
      texture: [6]
      propeller: false
      vertical:true
    rod2:
      section_segments: 6
      offset:
        x: 0
        y: -125
        z: 0
      position:
        x: [0,0]
        y: [-150,150]
        z: [0,0]
      width: [7,7]
      height: [7,7]
      texture: [6]
      propeller: false
      angle:90
