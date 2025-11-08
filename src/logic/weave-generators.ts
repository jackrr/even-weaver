import sharp from "sharp";
import type { Pattern } from "../models/weave";
import Color from "../util/color";
import Coord from "../util/coord";
import db from "../models/index";

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
  const { width, height } = info;
  const pixels = new Uint8ClampedArray(data.buffer);

  const cells = findCellsDumb(pixels, width, height);

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
        if (dist < minDistance) {
          colorId = color.id;
          minDistance = dist;
        }
      }
      colorCache[cell.color.toString()] = colorId;
    }

    output[y][x] = {
      c: colorId,
      s: "todo",
    };
  }

  return output;
}

export async function patternFromImage(
  image: ArrayBuffer,
  width: number,
  height: number,
): Promise<Pattern> {
  const { data, info } = await sharp(image)
    .resize(width, height)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = new Uint8ClampedArray(data.buffer);
  const PIXEL_SIZE = info.channels;

  const colors = await db.Color.findAll();
  if (colors.length === 0)
    throw new Error("Expected at least 1 color in the DB");

  const output: Pattern = {};
  const colorCache: { [colorString: string]: number } = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * PIXEL_SIZE;
      const color = new Color(
        pixels[offset] as number,
        pixels[offset + 1] as number,
        pixels[offset + 2] as number,
      );

      if (!output[y]) output[y] = {};

      let colorId = colorCache[color.toString()];
      if (!colorId) {
        colorId = colors[0]!.id as number;
        let minDistance = 100000;
        for (const c of colors) {
          const dist = color.distance(c);

          if (dist < minDistance) {
            colorId = c.id;
            minDistance = dist;
          }
        }

        colorCache[color.toString()] = colorId;
      }

      output[y][x] = {
        c: colorId,
        s: "todo",
      };
    }
  }

  return output;
}
