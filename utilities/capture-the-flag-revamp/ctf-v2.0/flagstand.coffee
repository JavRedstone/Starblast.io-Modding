Array::add = (mod) -> @map (val) -> val + mod
for key, value of []
  delete Array::[key]
  Object.defineProperty Array::, key,
    value: value
    configurable: true
    enumerable: false
model =
  bodies:
    reactor:  
      section_segments: 6
      offset:
        x: 0
        y: 0
        z: 0
      position:
        x: [0,0,0,0,0,0,0,0,0]
        y: [-20,-20,-13,-10,-12,-12.5,-10,-10,-12].add(15)
      width: [0,16,13,12,10.5,8,7.2,7,0]
      height: [0,16,13,12,10.5,8,7.2,7,0]
      texture: [[15],[15],3.9,16.875,17.875,3.9,113,16.875]
      vertical: true        
return model;       
