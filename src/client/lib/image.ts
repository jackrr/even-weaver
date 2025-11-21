import { type Color as ColorResponseType } from "./api";
import { Pattern, Status } from "@/util/pattern";
import Color from "@/util/color";

export function imageToPattern(
  file: File,
  colors: ColorResponseType[],
  maxWidth: number,
  maxHeight: number,
) {
  return new Promise<Pattern>((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return reject("Failed to get 2d canvas context");

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
      }
      width = Math.round(width);
      height = Math.round(height);

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data; // Uint8ClampedArray
      const PIXEL_SIZE = 4;

      const pattern = Pattern.empty(width, height);
      const colorCache: { [colorString: string]: number } = {};

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * PIXEL_SIZE;
          const color = new Color(
            pixels[offset] as number,
            pixels[offset + 1] as number,
            pixels[offset + 2] as number,
          );

          let colorId = colorCache[color.toString()];
          if (!colorId) {
            colorId = colors[0]!.id as number;
            let minDistance = 100000;
            for (const c of colors) {
              const dist = color.distance(c);

              if (dist < minDistance) {
                colorId = c.id;
                minDistance = dist;
              }
            }

            colorCache[color.toString()] = colorId;
          }

          pattern.setStitch(x, y, [colorId, Status.TODO]);
        }
      }

      resolve(pattern);
    };

    img.src = URL.createObjectURL(file);
  });
}
