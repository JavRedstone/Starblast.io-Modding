model =
  name: 'STARSHIP'
  level: 7
  model: 2
  size: 1.5
  specs:
    shield:
      capacity: [1000,2000]
      reload: [50,100]
    generator:
      capacity: [500,800]
      reload: [100,200]
    ship:
      mass: 1500
      speed: [90,90]
      rotation: [100,100]
      acceleration: [100,100]
      dash:
        rate: 1
        burst_speed: [500,500]
        speed: [350,350]
        acceleration: [100,100]
        initial_energy: [200,200]
        energy: [200,200]
  bodies:
    main:
      section_segments: 360
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-400,-394,-370,-330]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,6,22,35,40,40,0]
      height: [0,6,22,35,40,40,0]
      texture: [4,4,4,3]
    main2:
      section_segments: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-400,-394,-370,-330,-280,-10,-10,-25,-25]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,6,22,35,40,40,38,38,0]
      height: [0,6,22,35,40,40,38,38,0]
      texture: [4,4,4,4,4,4,4]
    main3:
      section_segments: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-400,-394,-370,-330,-280,-10,-10,-25,-25]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,6,22,35,40,40,38,38,0]
      height: [0,6,22,35,40,40,38,38,0]
      texture: [4,4,4,2,2,2,4]
    main_wing:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-340,-340,-295,-270,-270]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,46,85,85,0]
      height: [0,5,5,5,0]
      texture: [4]
      laser:
        damage: [100,100]
        rate: 10
        type: 1
        speed: [120,180]
        number: 1
        angle: 0
        error: 0
    main_wing2:
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: 220
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-340,-340,-285,-230,-230]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,46,85,85,0]
      height: [0,5,5,5,0]
      texture: [4]
      laser:
        damage: [100,100]
        rate: 10
        type: 1
        speed: [120,180]
        number: 1
        angle: 0
        error: 0
    main_1proeller1:
      section_segments: 360
      offset:
        x: 0
        y: -30
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
      section_segments: 360
      offset:
        x: 5
        y: -30
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
      section_segments: 360
      offset:
        x: 0
        y: -30
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
      section_segments: 360
      offset:
        x: 22.51666
        y: -30
        z: -13
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,8,10,0]
      height: [0,8,10,0]
      texture: [3]
      propeller: true
#booster
    booster:
      section_segments: 360
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [-10,-10,15,370,400,400,375,375]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,40,40,40,40,38,38,0]
      height: [0,40,40,40,40,38,38,0]
      texture: [3,3,2,3,3,4]
      propeller: true

      #propeller: true
    booster_landinggear:
      vertical: true
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: 0
        z: -310
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [40,40,45,45]
        z: [0,0,-4,-4,0,0,0,0,0]
      width: [0,10,6,0]
      height: [0,90,84,0]
      texture: [2]
      angle: 180
    booster_landinggear2:
      vertical: true
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: 0
        z: -310
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [40,40,45,45]
        z: [0,0,-4,-4,0,0,0,0,0]
      width: [0,10,6,0]
      height: [0,90,84,0]
      texture: [2]
      angle: 60
    booster_landinggear3:
      vertical: true
      section_segments: [40,50,130,140,220,230,310,320,400]
      offset:
        x: 0
        y: 0
        z: -310
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [40,40,45,45]
        z: [0,0,-4,-4,0,0,0,0,0]
      width: [0,10,6,0]
      height: [0,90,84,0]
      texture: [2]
      angle: 300
      
#20
#10
#3
    booster_3proeller1:
      section_segments: 360
      offset:
        x: 0
        y: 380
        z: 31
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller2:
      section_segments: 360
      offset:
        x: 9.58
        y: 380
        z: 29.482
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller3:
      section_segments: 360
      offset:
        x: 18.22
        y: 380
        z: 25.09
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller4:
      section_segments: 360
      offset:
        x: 25.09
        y: 380
        z: 18.22
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller5:
      section_segments: 360
      offset:
        x: 29.482
        y: 380
        z: 9.58
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller6:
      section_segments: 360
      offset:
        x: 31
        y: 380
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    #bottomside
    booster_3proeller1b:
      section_segments: 360
      offset:
        x: 0
        y: 380
        z: -31
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller2b:
      section_segments: 360
      offset:
        x: 9.58
        y: 380
        z: -29.482
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller3b:
      section_segments: 360
      offset:
        x: 18.22
        y: 380
        z: -25.09
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller4b:
      section_segments: 360
      offset:
        x: 25.09
        y: 380
        z: -18.22
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_3proeller5b:
      section_segments: 360
      offset:
        x: 29.482
        y: 380
        z: -9.58
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_1proeller1:
      section_segments: 360
      offset:
        x: 0
        y: 380
        z: -5.8
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_1proeller2:
      section_segments: 360
      offset:
        x: 5
        y: 380
        z: 2.9
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_2proeller1:
      section_segments: 360
      offset:
        x: 0
        y: 380
        z: 18
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_2proeller2:
      section_segments: 360
      offset:
        x: 10.58
        y: 380
        z: 14.56
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_2proeller3:
      section_segments: 360
      offset:
        x: 17.12
        y: 380
        z: 5.56
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    #b
    booster_2proeller3b:
      section_segments: 360
      offset:
        x: 17.12
        y: 380
        z: -5.56
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_2proeller2b:
      section_segments: 360
      offset:
        x: 10.58
        y: 380
        z: -14.56
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
    booster_2proeller1b:
      section_segments: 360
      offset:
        x: 0
        y: 380
        z: -18
      position:
        x: [0,0,0,0,0,0,0,0,0,0]
        y: [0,0,20,10]
        z: [0,0,0,0,0,0,0,0,0]
      width: [0,4,5,0]
      height: [0,4,5,0]
      texture: [3]
      propeller: true
return model;