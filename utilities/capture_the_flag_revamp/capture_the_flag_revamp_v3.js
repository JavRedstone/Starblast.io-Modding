class Round {
  constructor({
    id: ID,
    map: MAP,
    colors: COLORS
  }) {
    this.id = ID;
    this.map = MAP;
    this.team = {
      colors: COLORS,
      scores: [0, 0],
      flags: {
        holders: [],
        positions: [{
          x: this.map.flags[0].x,
          y: this.map.flags[0].y
        }, {
          x: this.map.flags[1].x,
          y: this.map.flags[1].y
        }]
      }
    };
  }
}
