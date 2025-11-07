import sharp from "sharp";
import Color from "./color";
import Coord from "./coord";

type Circle = {
  center: Coord;
  radius: number;
  color: Color;
};

export class Drawing {
  circles: Circle[];
  width: number;
  height: number;

  constructor() {
    this.circles = [];
    this.width = 0;
    this.height = 0;
  }

  drawCircle(center: Coord, radius: number, color: Color) {
    this.width = Math.max(this.width, center.x + radius);
    this.height = Math.max(this.height, center.y + radius);

    this.circles.push({ center, radius, color });
  }

  circleSvg(c: Circle) {
    const { x, y } = c.center;
    const { r, g, b } = c.color;
    return `<circle cx="${x}" cy="${y}" r="${c.radius}" fill="rgb(${r},${g},${b})" />`;
  }

  async save(path: string) {
    const svg = `
      <svg width="${this.width}" height="${this.height}">
        ${this.circles.map((c) => this.circleSvg(c)).join("\n")}
      </svg>
    `;

    await sharp(Buffer.from(svg)).png().toFile(path);
  }
}
