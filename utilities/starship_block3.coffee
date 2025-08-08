model =
  name: 'SpaceX Starship V3'
  designer: 'Nerd69420'
  level: 7
  model: 2
  size: 1.5
  specs:
    shield:
      capacity: [600,600]
      reload: [6,6]
    generator:
      capacity: [300,300]
      reload: [100,100]
    ship:
      mass: 350
      speed: [150,150]
      rotation: [100,100]
      acceleration: [30,30]
  bodies:
    blackmain:
      section_segments: 16
      offset:
        x: 0
        y: 0
        z: -1
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-200,-194,-170,-130,-80,190,190,175,175]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,6,22,35,40,40,38,38,0]
      height: [0,6,22,35,40,40,38,38,0]
      texture: [4,4,4,4,4,4,4]
    whitemain:
      section_segments: 16
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0]
        y: [-194,-170,-130,-80,190]
        z: [-1,-1,0,0,0,0]
      width: [6,22,35,40,40]
      height: [6,22,35,40,40]
      texture: [4,1]
    line:
      section_segments: 10
      offset:
        x: 15
        y: 0
        z: 36
      position:
        x: [0,0,0,0,0,0,0,0]
        y: [-64,-60,-45,-40,138,145,170,174]
        z: [0,0,0,0,0,0,0,0]
      width: [0,6,6,4,4,6,6,0]
      height: [0,5,5,4,4,5,5,0]
      texture: [1,1,2,1,2,1]
      laser:
        damage: [10,10]
        rate: 10
        type: 1
        speed: [300,300]
        number: 1
        angle: 0
        error: 0
    main_wing:
      section_segments: 0
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0]
        y: [0]
        z: [0]
      width: [0]
      height: [0]
      texture: [1]
    main_wingwhite:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 53
        y: 221
        z: 1
      position:
        x: [-14,-14,0,0,0]
        y: [-140,-140,-85,-30,-30]
        z: [0,0,0,0,0]
      width: [0,1,20,20,0]
      height: [0,2,2,2,0]
      texture: [4,1]
    main_wingblack:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 53
        y: 221
        z: -2
      position:
        x: [-14,-14,0,0,0]
        y: [-140,-140,-85,-30,-30]
        z: [0,0,0,0,0]
      width: [0,1,20,20,0]
      height: [0,2,2,2,0]
      texture: [4]
    main_1proeller1:
      section_segments: 16
      offset:
        x: 0
        y: 170
        z: -5.8
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    main_1proeller2:
      section_segments: 16
      offset:
        x: 5
        y: 170
        z: 2.9
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    main_2proeller1:
      section_segments: 16
      offset:
        x: 0
        y: 170
        z: 26
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,8,10,0]
      height: [0,8,10,0]
      texture: [3]
      propeller: true
    main_2proeller2:
      section_segments: 16
      offset:
        x: 22.51666
        y: 170
        z: -13
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,8,10,0]
      height: [0,8,10,0]
      texture: [3]
      propeller: true
  wings:
    wingwhite:
      doubleside:true
      offset:
        x: 22
        y: -133
        z: -5.9
      length: [50]
      width: [70,25]
      angle: [40]
      position: [0,15]
      texture: [1]
      bump:
        position: 40
        size: 20
    wingblack:
      doubleside:true
      offset:
        x: 22
        y: -133
        z: -6
      length: [50]
      width: [70,25]
      angle: [40]
      position: [0,15]
      texture: [4]
      bump:
        position: 40
        size: 20
return model;
