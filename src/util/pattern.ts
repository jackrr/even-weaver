import Color, { type Colorish } from "./color";

export enum Status {
  TODO = 0,
  DONE = 1,
}

export type Stitch = [number, Status];

export function toggleDone(s: Stitch) {
  s[1] = s[1] === Status.DONE ? Status.TODO : Status.DONE;
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
      new Array(width * height).fill([0, Status.TODO]),
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
    return this.stitches.map((stitch, index) =>
      cb({
        stitch,
        index,
        x: index % this.width,
        y: Math.floor(index / this.width),
      }),
    );
  }

  eachStitch(
    cb: (d: { stitch: Stitch; x: number; y: number; index: number }) => void,
  ) {
    this.mapStitches(cb);
  }

  remapToNearest(colorId: number, colorIndex: { [id: number]: Colorish }) {
    // 1. find nearest color in pattern
    const foundColors = new Set<number>();
    for (const stitch of this.stitches) {
      foundColors.add(stitch[0]);
    }

    let nearestId: number;
    let minDist = 10000000;
    const current = colorIndex[colorId]!;
    for (const fid of foundColors) {
      const ish = colorIndex[fid]!;
      const color = new Color(ish.r, ish.g, ish.b);
      if (color.distance(current) < minDist) {
        nearestId = fid;
      }
    }

    // 2. update all entries of prev to be nearest
    for (const stitch of this.stitches) {
      if (stitch[0] === colorId) {
        stitch[0] = nearestId!;
      }
    }
  }

  simplifyColors(
    maxColorCount: number,
    colorIndex: { [id: string]: Colorish },
  ) {
    type CountedColor = {
      count: number;
      color: Color;
    };

    const colorCounts: { [id: string]: CountedColor } = {};
    for (const cell of this.stitches) {
      if (colorCounts[cell[0]]) {
        colorCounts[cell[0]]!.count += 1;
      } else {
        const color = colorIndex[cell[0]]!;
        colorCounts[cell[0]] = {
          color: new Color(color.r, color.g, color.b),
          count: 1,
        };
      }
    }

    function nextToKill() {
      let minCount = 100000000;
      let minColorId: string;
      for (const [id, color] of Object.entries(colorCounts)) {
        if (color.count < minCount) {
          minColorId = id;
          minCount = color.count;
        }
      }

      return minColorId!;
    }

    const colorMapping: { [src: string]: string } = {};

    while (Object.keys(colorCounts).length > maxColorCount) {
      let nextId = nextToKill();
      const next = colorCounts[nextId]!;
      let minDist = 100000000;
      let nearest: CountedColor;
      let nearestId: string;
      for (const [id, cc] of Object.entries(colorCounts)) {
        if (id === nextId) continue;

        if (cc.color.distance(next.color) < minDist) {
          minDist = cc.color.distance(next.color);
          nearest = cc;
          nearestId = id;
        }
      }

      nearest!.count += next.count;
      delete colorCounts[nextId];

      colorMapping[nextId] = nearestId!;

      for (const [src, target] of Object.entries(colorMapping)) {
        if (target === nextId) {
          colorMapping[src] = nearestId!;
        }
      }
    }

    // Remap all colors in pattern according to mapping
    for (const stitch of this.stitches) {
      if (stitch[0] in colorMapping) {
        stitch[0] = parseInt(colorMapping[stitch[0]]!);
      }
    }
  }
}
