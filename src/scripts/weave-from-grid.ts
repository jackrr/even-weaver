import sharp from "sharp";

const { data, info } = await sharp(Bun.argv[2])
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixelArray = new Uint8ClampedArray(data.buffer);

console.log({ info });
console.log(pixelArray.length);
console.log(pixelArray[18]);

// TODO: implement me!
// 1. Walk "grid" of cells
// 2. Map grid color to db color
// 3. Convert to "Weave" format
// 4. accept inputs of weave name and user id to attach to
