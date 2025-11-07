import { weaveFromGridPng } from "../logic/parsers";

const imagePath = Bun.argv[2];

if (typeof imagePath === "string") {
  await weaveFromGridPng(imagePath);
} else {
  console.error("Missing image path argument");
  process.exit(1);
}
