import { describe, expect, test } from "bun:test";
import path from "path";
import { patternFromGridPng, patternFromImage } from "./weave-generators";
// import db from "../models/index";
// import Coord from "../util/coord";
// import { Drawing } from "../util/draw";

import sharp from "sharp";

describe("png grid input", () => {
  test("it generates a pattern", async () => {
    const pattern = await patternFromGridPng(
      path.resolve("sample-images", "heaven-or-las-vegas-pregen.png"),
    );

    expect(Object.keys(pattern).length).toBe(140);
    for (const row of Object.values(pattern)) {
      expect(Object.keys(row).length).toBe(140);
    }
  });
});

describe("jpeg image input", () => {
  test("it generates a pattern at given dimensions", async () => {
    const buffer = await Bun.file(
      path.resolve("sample-images", "oregon-river.jpg"),
    ).arrayBuffer();

    const width = 150;
    const height = 100;
    await sharp(buffer)
      .resize(width, height)
      .toFile(path.resolve("tmp", "resized.jpg"));
    const pattern = await patternFromImage(buffer, width, height);

    expect(Object.keys(pattern).length).toBe(height);
    for (const row of Object.values(pattern)) {
      expect(Object.keys(row).length).toBe(width);
    }

    // Debug stuff
    // const drawing = new Drawing();
    // for (const [y, row] of Object.entries(pattern)) {
    //   for (const [x, cell] of Object.entries(row)) {
    //     const color = await db.Color.findByPk(cell.c);
    //     if (color) {
    //       drawing.drawCircle(
    //         new Coord(parseInt(x) * 6, parseInt(y) * 6),
    //         3,
    //         color,
    //       );
    //     }
    //   }
    // }

    // await drawing.save(path.resolve("tmp", "debug.png"));
  });
});
