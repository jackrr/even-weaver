import sharp from "sharp";
import { Queue } from "../util/queue";

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

class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  equals(o: Color) {
    return this.r === o.r && this.g === o.g && this.b === o.b;
  }

  near(o: Color) {
    const NEAR_THRESHOLD = 16;
    if (this.r < o.r - NEAR_THRESHOLD || this.r > o.r + NEAR_THRESHOLD)
      return false;
    if (this.g < o.g - NEAR_THRESHOLD || this.g > o.g + NEAR_THRESHOLD)
      return false;
    if (this.b < o.b - NEAR_THRESHOLD || this.b > o.b + NEAR_THRESHOLD)
      return false;

    return true;
  }

  toString() {
    return `${this.r},${this.g},${this.b}`;
  }
}

class Shape {
  coords: Map<string, Coord>;
  color: Color;
  id: string;

  private xBounds: [number, number];
  private yBounds: [number, number];

  constructor(c: Coord, color: Color) {
    this.coords = new Map();
    this.coords.set(c.toString(), c);
    this.color = color;
    this.id = c.toString();
    this.xBounds = [c.x, c.x];
    this.yBounds = [c.y, c.y];
  }

  addCoord(c: Coord) {
    this.coords.set(c.toString(), c);

    if (c.x < this.xBounds[0]) this.xBounds[0] = c.x;
    if (c.x > this.xBounds[1]) this.xBounds[1] = c.x;
    if (c.y < this.yBounds[0]) this.yBounds[0] = c.y;
    if (c.y > this.xBounds[1]) this.yBounds[1] = c.y;
  }

  width() {
    return this.xBounds[1] - this.xBounds[0];
  }

  height() {
    return this.yBounds[1] - this.yBounds[0];
  }

  isSquare() {
    return this.height() === this.width();
  }

  minX() {
    return this.xBounds[0];
  }

  minY() {
    return this.yBounds[0];
  }
}

/*
 Find the shapes of contiguous color that are large enough to constitute a "cell"
 */
function findCells(
  pixels: Uint8ClampedArray<ArrayBufferLike>,
  width: number,
  height: number,
) {
  const CELL_MIN_LENGTH = 9;
  const PIXEL_SIZE = 4;
  const shapes: Shape[] = [];
  const visited = new Map<string, Coord>();
  const toProcess = new Queue<Coord>();

  function colorAt(c: Coord): Color {
    const offset = (c.y * width + c.x) * PIXEL_SIZE;
    return new Color(
      pixels[offset] as number,
      pixels[offset + 1] as number,
      pixels[offset + 2] as number,
    );
  }

  let nextCoord: Coord | null = new Coord(0, 0);
  while (nextCoord !== null) {
    const shape = new Shape(nextCoord, colorAt(nextCoord));
    visited.set(nextCoord.toString(), nextCoord);

    // DFS traverse contiguous region of same color
    // Add all unvisited bounding pixel coordinates (other color
    // pixels) to the outer queue to kick off other shapes from
    const unvistedNeighbors = nextCoord
      .neighbors(width, height)
      .filter((n) => !visited.has(n.toString()));
    while (unvistedNeighbors.length > 0) {
      const next = unvistedNeighbors.pop() as Coord;

      if (colorAt(next).near(shape.color)) {
        visited.set(next.toString(), next);
        toProcess.remove(next); // it's possible this was enqueued by another shape process pass

        shape.addCoord(next);

        next.neighbors(width, height).forEach((n) => {
          if (!visited.has(n.toString())) {
            unvistedNeighbors.push(n);
          }
        });
      } else {
        toProcess.enqueue(next);
      }
    }

    if (shape.width() > CELL_MIN_LENGTH && shape.height() > CELL_MIN_LENGTH) {
      shapes.push(shape);
    }
    nextCoord = toProcess.dequeue();

    if (shapes.length % 1000 === 0) {
      console.log(
        `Next: ${nextCoord?.toString()}. ${shapes.length} total shapes, ${toProcess.items.size} coordinates enqueued`,
      );
    }
  }

  return shapes;
}

export async function weaveFromGridPng(imagePath: string) {
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelArray = new Uint8ClampedArray(data.buffer);

  const cells = findCells(pixelArray, info.width, info.height);
  console.log(cells.length, 140 * 140);

  // 3. establish relative coordinate grid for shapes
  for (const cell of cells) {
    console.log(cell);

    if (cell.minY() > 1000) break;
  }

  // 1. Walk grid
  // 2. Map grid color to db color
  // 3. Convert to "Weave" format
  // 4. accept inputs of weave name and user id to attach to
}
