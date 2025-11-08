import { describe, expect, test } from "bun:test";
import Color from "./color";

describe("color", () => {
  test("has a smaller distance for nearer colors", () => {
    const red = new Color(255, 0, 0);
    const purple = new Color(255, 0, 255);
    const green = new Color(0, 255, 0);

    expect(red.distance(purple)).toBeLessThan(purple.distance(green));
  });
});
