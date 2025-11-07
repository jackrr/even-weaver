class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  equals(o: Color) {
    return this.r === o.r && this.g === o.g && this.b === o.b;
  }

  near(o: Color) {
    const NEAR_THRESHOLD = 16;
    if (this.r < o.r - NEAR_THRESHOLD || this.r > o.r + NEAR_THRESHOLD)
      return false;
    if (this.g < o.g - NEAR_THRESHOLD || this.g > o.g + NEAR_THRESHOLD)
      return false;
    if (this.b < o.b - NEAR_THRESHOLD || this.b > o.b + NEAR_THRESHOLD)
      return false;

    return true;
  }

  toString() {
    return `${this.r},${this.g},${this.b}`;
  }
}

export default Color;
