import { describe, expect, test } from "bun:test";
import path from "path";
import { weaveFromGridPng } from "./parsers";

describe("png grid input", () => {
  test("it generates a weave blob for user with given id", async () => {
    const result = await weaveFromGridPng(
      path.resolve("sample-images", "heaven-or-las-vegas-pregen.png"),
    );

    // expect 140 x 140
    console.log(result);
    expect(false).toBe(true);
  });
});
