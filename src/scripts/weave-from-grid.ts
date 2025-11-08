import { patternFromGridPng } from "../logic/weave-generators";

const imagePath = Bun.argv[2];

if (typeof imagePath === "string") {
  const pattern = await patternFromGridPng(imagePath);
  // TODO: attach to specified user
} else {
  console.error("Missing image path argument");
  process.exit(1);
}
