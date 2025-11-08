import { describe, expect, test } from "bun:test";
import path from "path";
import { patternFromGridPng } from "./parsers";

describe("png grid input", () => {
  test("it generates a weave blob for user with given id", async () => {
    const pattern = await patternFromGridPng(
      path.resolve("sample-images", "heaven-or-las-vegas-pregen.png"),
    );

    expect(Object.keys(pattern).length).toBe(140);
    for (const row of Object.values(pattern)) {
      expect(Object.keys(row).length).toBe(140);
    }
  });
});
