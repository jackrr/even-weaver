import { type Pattern } from "@/models/weave";

export type Color = {
  id: number;
  name: string;
  key: string;
  r: number;
  g: number;
  b: number;
  hex: string;
};

export type Weave = {
  id: number;
  name: string;
  pattern: Pattern;
  userId: string;
};

type ServerWeave = Weave & {
  pattern: string;
};

export async function fetchColors() {
  const res = await fetch("/api/colors");
  return res.json() as Promise<Color[]>;
}

export async function createWeave({
  name,
  pattern,
}: {
  name: string;
  pattern: object;
}) {
  const res = await fetch("/api/weaves", {
    method: "post",
    body: JSON.stringify({ name, pattern: JSON.stringify(pattern) }),
  });
  return res.json() as Promise<Weave>;
}

export async function fetchWeaves(): Promise<Weave[]> {
  const res = await fetch("/api/weaves");
  const weavesIsh = await res.json();
  return weavesIsh.map((weave: ServerWeave) => ({
    ...weave,
    pattern: JSON.parse(weave.pattern),
  }));
}

export async function fetchWeave(id: string): Promise<Weave> {
  const res = await fetch(`/api/weaves/${id}`);
  const weave = await res.json();
  return {
    ...weave,
    pattern: JSON.parse(weave.pattern),
  };
}
