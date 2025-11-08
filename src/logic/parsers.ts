import sharp from "sharp";
import type { Pattern } from "../models/weave";
import { Queue } from "../util/queue";
import Color from "../util/color";
import Coord from "../util/coord";
import db from "../models/index";

// import { Drawing } from "../util/draw";
// import path from "path";

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

  center() {
    return new Coord(
      this.xBounds[0] + this.width() / 2,
      this.yBounds[0] + this.height() / 2,
    );
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

type Cell = {
  color: Color;
  center: Coord;
  gridPos: Coord;
};

/*
Walk the image to sample colors, skipping at configured offsets
 */
function findCellsDumb(
  pixels: Uint8ClampedArray<ArrayBufferLike>,
  width: number,
  height: number,
) {
  const PIXEL_SIZE = 4;

  function colorAt(c: Coord): Color {
    const offset = (c.y * width + c.x) * PIXEL_SIZE;
    return new Color(
      pixels[offset] as number,
      pixels[offset + 1] as number,
      pixels[offset + 2] as number,
    );
  }

  const cells: Cell[] = [];
  const X_START_OFFSET = 7;
  const X_SKIP = 15.2;
  const Y_START_OFFSET = 7;
  const Y_SKIP = 15.2;

  let x = X_START_OFFSET;
  let y = Y_START_OFFSET;
  let gridX = 0;
  let gridY = 0;

  while (y < height) {
    while (x < width) {
      const center = new Coord(Math.round(x), Math.round(y));
      cells.push({
        center,
        color: colorAt(center),
        gridPos: new Coord(x, y),
      });
      x += X_SKIP;
      gridX += 1;
    }

    x = X_START_OFFSET;
    gridX = 0;
    y += Y_SKIP;
    gridY += 1;
  }

  return cells;
}

export async function patternFromGridPng(imagePath: string): Promise<Pattern> {
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelArray = new Uint8ClampedArray(data.buffer);

  const cells = findCellsDumb(pixelArray, info.width, info.height);

  // Debug stuff
  // const drawing = new Drawing();
  // for (const cell of cells) {
  //   drawing.drawCircle(cell.center, 6, cell.color);
  // }
  // await drawing.save(path.resolve("tmp", "debug.png"));
  const colors = await db.Color.findAll();
  if (colors.length === 0)
    throw new Error("Expected at least 1 color in the DB");

  const output: Pattern = {};
  const colorCache: { [colorString: string]: number } = {};
  for (const cell of cells) {
    const { x, y } = cell.center;

    if (!output[y]) output[y] = {};

    let colorId = colorCache[cell.color.toString()];
    if (!colorId) {
      colorId = colors[0]!.id as number;
      let minDistance = 100000;

      for (const color of colors) {
        const dist = cell.color.distance(color);
        if (dist < minDistance) colorId = color.id;
      }
      colorCache[cell.color.toString()] = colorId;
    }

    output[y][x] = {
      colorId,
      state: "todo",
    };
  }

  return output;
}
