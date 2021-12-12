return model =
  name: 'Bed',
  bodies:
    cover:
      section_segments: [45, 135, 225, 315]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0, 0, 0, 0, 0]
        y: [-100, -100, -50, 150, 150]
        z: [0, 0, 0, 0]
      width: [0, 100, 100, 100, 0]
      height: [0, 20, 20, 20, 0]
      texture: [1, 1, 63]
    base:
      section_segments: [45, 135, 225, 315]
      offset:
        x: 0
        y: 0
        z: -50
      position:
        x: [0, 0, 0, 0, 0]
        y: [-100, -100, 150, 150]
        z: [29, 29, 29, 29]
      width: [0, 100, 100, 0]
      height: [0, 10, 10, 0]
      texture: [6]
    legs1:
      section_segments: [45, 135, 225, 315]
      offset:
          x: 63.7
          y: -95
          z: -42
      position:
          x: [0, 0, 0, 0, 0]
          y: [-5, -5, 10, 10]
          z: [0, 0, 0, 0]
      width: [0, 10, 10, 0]
      height: [0, 20, 20, 0]
      texture: [6]
    legs2:
      section_segments: [45, 135, 225, 315]
      offset:
          x: 63.7
          y: 140
          z: -42
      position:
          x: [0, 0, 0, 0, 0]
          y: [-5, -5, 10, 10]
          z: [0, 0, 0, 0]
      width: [0, 10, 10, 0]
      height: [0, 20, 20, 0]
      texture: [6]
