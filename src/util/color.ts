export interface Colorish {
  r: number;
  g: number;
  b: number;
}

class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  equals(o: Colorish) {
    return this.r === o.r && this.g === o.g && this.b === o.b;
  }

  near(o: Colorish) {
    const NEAR_THRESHOLD = 16;
    if (this.r < o.r - NEAR_THRESHOLD || this.r > o.r + NEAR_THRESHOLD)
      return false;
    if (this.g < o.g - NEAR_THRESHOLD || this.g > o.g + NEAR_THRESHOLD)
      return false;
    if (this.b < o.b - NEAR_THRESHOLD || this.b > o.b + NEAR_THRESHOLD)
      return false;

    return true;
  }

  distance(m: Colorish) {
    return (
      Math.abs(this.r - m.r) + Math.abs(this.g - m.g) + Math.abs(this.b - m.b)
    );
  }

  toString() {
    return `${this.r},${this.g},${this.b}`;
  }
}

export default Color;
