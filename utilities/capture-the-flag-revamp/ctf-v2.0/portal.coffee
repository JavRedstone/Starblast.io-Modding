return model =
  tori: circle:
    segments: 20
    radius: 190
    section_segments: 4
    offset:
      x: 0
      y: 0
      z: 0
    position:
      x: [0]
      y: [0]
      z: [0]
    width: [34]
    height: [30]
    texture: [11.5,9.5,8,9.5,11.5,11.5,9.5,8,9.5,11.5,11.5,9.5,8,9.5,11.5,11.5,9.5,8,9.5,11.5,]
  bodies:
    main:
      section_segments: 52
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0]
        y: [1,0]
        z: [0,0]
      width: [185,0]
      height: [185,0]
      texture: [17]
      propeller: false
    pillars:
      section_segments: 8
      offset:
        x: 158
        y: 30
        z: -158
      position:
        x: [0,0,0,0,0,0,0,0,0]
        y: [-130,-80,-50,25,40,65,80,115,80]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,40,35,35,30,30,35,24,0]
      height: [0,35,35,35,35,35,35,24,0]
      texture: [13,12,10,11,9,11,12,17]
      propeller: false
    pillars2:
      section_segments: 8
      offset:
        x: 158
        y: 30
        z: 158
      position:
        x: [0,0,0,0,0,0,0,0,0]
        y: [-130,-80,-50,25,40,65,80,115,80]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,40,35,35,30,30,35,24,0]
      height: [0,35,35,35,35,35,35,24,0]
      texture: [13,12,10,11,9,11,12,17]
      propeller: false
