import sharp from "sharp";

export async function weaveFromGridPng(imagePath: string) {
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelArray = new Uint8ClampedArray(data.buffer);

  // how to find cells
  //
  // ideas:
  // - hardcode width, height, gap, and offset
  // - scan across horizontally:
  //   if color never changes, it's a gap

  // TODO: implement me!
  // 0. build grid of cells
  // 1. Walk "grid" of cells
  // 2. Map grid color to db color
  // 3. Convert to "Weave" format
  // 4. accept inputs of weave name and user id to attach to

  console.log({ info });
  console.log(pixelArray.length);
  console.log(pixelArray[18]);
}

const imagePath = Bun.argv[2];

if (typeof imagePath === "string") {
  await weaveFromGridPng(imagePath);
} else {
  console.error("Missing image path argument");
  // process.exit(1);
}
