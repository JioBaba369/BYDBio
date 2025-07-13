import { type Area } from 'react-easy-crop';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // to prevent cross-origin issues
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Crops and resizes an image on the client side.
 * @param imageSrc The source of the image to crop.
 * @param pixelCrop The area to crop in pixels.
 * @param outputType The desired output format.
 * @param quality The quality for JPEG compression (0 to 1).
 * @param maxSize The maximum dimensions (width/height) for the output image.
 * @returns A base64 data URL of the cropped and resized image.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputType: 'image/jpeg' | 'image/png' = 'image/png',
  quality = 0.9,
  maxSize: { width: number; height: number } = { width: 4096, height: 4096 }
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Calculate final dimensions while maintaining aspect ratio
  let outputWidth = pixelCrop.width;
  let outputHeight = pixelCrop.height;
  const aspectRatio = pixelCrop.width / pixelCrop.height;

  if (outputWidth > maxSize.width) {
    outputWidth = maxSize.width;
    outputHeight = outputWidth / aspectRatio;
  }
  if (outputHeight > maxSize.height) {
    outputHeight = maxSize.height;
    outputWidth = outputHeight * aspectRatio;
  }
  
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped image onto the canvas at the new, resized dimensions
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Return as data URL
  return canvas.toDataURL(outputType, quality);
}
