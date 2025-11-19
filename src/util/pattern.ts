export type Status = "todo" | "done";

interface Stitch {
  c: number;
  s: Status;
}

function toggleDone(s: Stitch) {
  s.s = s.s === "done" ? "todo" : "done";
}

export class Pattern {
  width: number;
  height: number;
  stitches: Stitch[];

  constructor(width: number, height: number, stitches: Stitch[]) {
    this.width = width;
    this.height = height;
    this.stitches = stitches;
  }

  static empty(width: number, height: number) {
    return new Pattern(
      width,
      height,
      new Array(width * height).fill({ c: 0, s: "todo" }),
    );
  }

  static deserialize(val: string) {
    const res = JSON.parse(val);
    if (!("width" in res) && typeof res.width !== "number")
      throw new Error("Width should be a number");
    if (!("height" in res) && typeof res.height !== "number")
      throw new Error("Height should be a number");
    if (!("stitches" in res && res.stitches.length !== res.width * res.length))
      throw new Error("Stitches of incorrect length");

    return new Pattern(res.width, res.height, res.stitches as Stitch[]);
  }

  serialize(): string {
    return JSON.stringify({
      width: this.width,
      height: this.height,
      stitches: this.stitches,
    });
  }

  getStitch(x: number, y: number): Stitch {
    if (x >= this.width) throw new Error(`${x} is out of bounds!`);
    if (y >= this.height) throw new Error(`${y} is out of bounds!`);
    return this.stitches[y * this.width + x]!;
  }

  setStitch(x: number, y: number, s: Stitch) {
    if (x >= this.width) throw new Error(`${x} is out of bounds!`);
    if (y >= this.height) throw new Error(`${y} is out of bounds!`);
    this.stitches[y * this.width + x] = s;
  }

  toggleStitch(x: number, y: number) {
    toggleDone(this.getStitch(x, y));
  }

  mapStitches<T>(
    cb: (d: { stitch: Stitch; x: number; y: number; index: number }) => T,
  ): T[] {
    const result = [];
    let index = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        result.push(cb({ stitch: this.getStitch(x, y), x, y, index }));
        index += 1;
      }
    }
    return result;
  }

  eachStitch(
    cb: (d: { stitch: Stitch; x: number; y: number; index: number }) => void,
  ) {
    this.mapStitches(cb);
  }
}
