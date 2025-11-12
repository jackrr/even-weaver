import { Pattern } from "@/util/pattern";

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

function deserializeWeave(weave: ServerWeave): Weave {
  return {
    ...weave,
    pattern: Pattern.deserialize(weave.pattern),
  };
}

export async function fetchColors() {
  const res = await fetch("/api/colors");
  return res.json() as Promise<Color[]>;
}

export async function createWeave({
  name,
  pattern,
}: {
  name: string;
  pattern: Pattern;
}) {
  const res = await fetch("/api/weaves", {
    method: "post",
    body: JSON.stringify({ name, pattern: pattern.serialize() }),
  });
  return res.json() as Promise<Weave>;
}

export async function fetchWeaves(): Promise<Weave[]> {
  const res = await fetch("/api/weaves");
  const weavesIsh = await res.json();
  return weavesIsh.map(deserializeWeave);
}

export async function fetchWeave(id: string): Promise<Weave> {
  const res = await fetch(`/api/weaves/${id}`);
  const weave = await res.json();
  return deserializeWeave(weave);
}

export async function updateWeave(id: string, name: string, pattern: Pattern) {
  const res = await fetch(`/api/weaves/${id}`, {
    method: "put",
    body: JSON.stringify({
      name,
      pattern: pattern.serialize(),
    }),
  });

  const weave = await res.json();
  return deserializeWeave(weave);
}
