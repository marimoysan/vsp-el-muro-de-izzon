/**
 * Reduce una foto en el navegador antes de subirla.
 *
 * Las funciones de Vercel rechazan cuerpos de más de ~4,5 MB y las fotos de
 * móvil suelen superarlo. Las fotos se imprimen en A4 (hueco de ~28 × 14 cm),
 * así que 3000 px en el lado largo dan ~270 ppp tras recortar. Si el JPEG
 * resultante supera `maxBytes`, se baja la calidad progresivamente.
 */
export async function compressImage(
  file: File,
  { maxSide = 3000, quality = 0.85, minQuality = 0.6, maxBytes = 3.8 * 1024 * 1024 } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let q = quality;
  let blob = await toJpeg(canvas, q);
  while (blob.size > maxBytes && q > minQuality) {
    q = Math.max(minQuality, q - 0.1);
    blob = await toJpeg(canvas, q);
  }
  return blob;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen"))),
      "image/jpeg",
      quality,
    ),
  );
}
