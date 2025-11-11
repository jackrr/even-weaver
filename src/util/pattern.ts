export type Status = "todo" | "done";

class Cell {
  c: number;
  s: Status;

  constructor(c: number, s: Status) {
    this.c = c;
    this.s = s;
  }

  isDone() {
    return this.s === "done";
  }

  toggleDone() {
    this.isDone() ? (this.s = "todo") : (this.s = "done");
  }
}

export class Pattern {
  width: number;
  height: number;
  cells: Cell[];

  constructor(width: number, height: number, cells: Cell[]) {
    this.width = width;
    this.height = height;
    this.cells = cells;
  }

  getCell(x: number, y: number): Cell {
    if (x >= this.width) throw new Error(`${x} is out of bounds!`);
    if (y >= this.height) throw new Error(`${y} is out of bounds!`);
    return this.cells[y * this.width + x]!;
  }

  toggleCell(x: number, y: number) {
    this.getCell(x, y).toggleDone();
  }

  mapCells<T>(cb: (d: { cell: Cell; x: number; y: number }) => T): T[] {
    const result = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        result.push(cb({ cell: this.getCell(x, y), x, y }));
      }
    }
    return result;
  }

  eachCell(cb: (d: { cell: Cell; x: number; y: number }) => void) {
    this.mapCells(cb);
  }
}
