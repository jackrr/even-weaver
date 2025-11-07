class Coord {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(o: Coord) {
    return this.x === o.x && this.y === o.y;
  }

  toString() {
    return `${this.x}x${this.y}`;
  }

  neighbors(boundX: number, boundY: number) {
    const neighbors = [];
    for (const x of [-1, 0, 1]) {
      for (const y of [-1, 0, 1]) {
        if (x === 0 && y === 0) continue;

        const coord = new Coord(this.x + x, this.y + y);
        if (coord.x < 0 || coord.x >= boundX) continue;
        if (coord.y < 0 || coord.y >= boundY) continue;

        neighbors.push(coord);
      }
    }

    return neighbors;
  }
}

export default Coord;
