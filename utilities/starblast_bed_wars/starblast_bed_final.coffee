return model =
  name: 'Bed'
  bodies:
    headrest:
      section_segments: [35, 45, 135, 225, 315, 325]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0, 0, 0, 0]
        y: [0, 0, 50, 50]
        z: [0, 0, 0, 0]
      width: [0, 100, 100, 0]
      height: [0, 20, 20, 0]
      texture: [0]
    body:
      section_segments: [35, 45, 135, 225, 315, 325]
      offset:
        x: 0
        y: 50
        z: 0
      position:
        x: [0, 0, 0, 0]
        y: [0, 0, 150, 150]
        z: [0, 0, 0, 0]
      width: [0, 100, 100, 0]
      height: [0, 20, 20, 0]
      texture: [63]
    frame:
      section_segments: [45, 135, 225, 315]
      offset:
        x: 0
        y: 0
        z: -21
      position:
        x: [0, 0, 0, 0]
        y: [0, 0, 200, 200]
        z: [0, 0, 0, 0]
      width: [0, 100, 100, 0]
      height: [0, 10, 10, 0]
      texture: [6]
    legsfront:
      section_segments: [45, 135, 225, 315]
      offset:
        x: 63.64
        y: 0
        z: -42
      position:
        x: [0, 0, 0, 0]
        y: [0, 0, 15, 15]
        z: [0, 0, 0, 0]
      width: [0, 10, 10, 0]
      height: [0, 20, 20, 0]
      texture: [6]
    legsback:
      section_segments: [45, 135, 225, 315]
      offset:
        x: 63.64
        y: 185
        z: -42
      position:
        x: [0, 0, 0, 0]
        y: [0, 0, 15, 15]
        z: [0, 0, 0, 0]
      width: [0, 10, 10, 0]
      height: [0, 20, 20, 0]
      texture: [6]
