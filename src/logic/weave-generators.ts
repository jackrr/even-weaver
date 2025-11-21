import sharp from "sharp";
import { Pattern, Status } from "@/util/pattern";
import Color from "../util/color";
import Coord from "../util/coord";
import db from "../models/index";

type GridCell = {
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

  const cells: GridCell[] = [];
  const X_START_OFFSET = 7;
  const X_SKIP = 15.2;
  const Y_START_OFFSET = 7;
  const Y_SKIP = 15.2;

  let x = X_START_OFFSET;
  let y = Y_START_OFFSET;
  let gridX = 0;
  let gridY = 0;

  while (y < height) {
    gridX = 0;

    while (x < width) {
      const center = new Coord(Math.round(x), Math.round(y));
      cells.push({
        center,
        color: colorAt(center),
        gridPos: new Coord(gridX, gridY),
      });
      x += X_SKIP;
      gridX += 1;
    }

    x = X_START_OFFSET;
    y += Y_SKIP;
    gridY += 1;
  }

  return { cells, width: gridX, height: gridY };
}

export async function patternFromGridPng(imagePath: string): Promise<Pattern> {
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: srcWidth, height: srcHeight } = info;
  const pixels = new Uint8ClampedArray(data.buffer);

  const { cells, width, height } = findCellsDumb(pixels, srcWidth, srcHeight);

  const colors = await db.Color.findAll();
  if (colors.length === 0)
    throw new Error("Expected at least 1 color in the DB");

  const pattern = Pattern.empty(width, height);
  const colorCache: { [colorString: string]: number } = {};
  for (const cell of cells) {
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

    const { x, y } = cell.gridPos;
    pattern.setStitch(x, y, [colorId, Status.TODO]);
  }

  return pattern;
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

  const pattern = Pattern.empty(width, height);
  const colorCache: { [colorString: string]: number } = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * PIXEL_SIZE;
      const color = new Color(
        pixels[offset] as number,
        pixels[offset + 1] as number,
        pixels[offset + 2] as number,
      );

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

      pattern.setStitch(x, y, [colorId, Status.TODO]);
    }
  }

  return pattern;
}
