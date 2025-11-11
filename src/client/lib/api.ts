export type Color = {
  id: number;
  name: string;
  key: string;
  r: number;
  g: number;
  b: number;
  hex: string;
};

export async function fetchColors() {
  const res = await fetch("/colors");
  return res.json() as Promise<Color[]>;
}
