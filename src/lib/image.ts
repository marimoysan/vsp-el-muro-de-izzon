/**
 * Reduce una foto en el navegador antes de subirla.
 * Las funciones de Vercel rechazan cuerpos de más de ~4,5 MB y las fotos de
 * móvil suelen superarlo, así que redimensionamos y re-codificamos a JPEG.
 */
export async function compressImage(
  file: File,
  { maxSide = 2048, quality = 0.85 } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen"))),
      "image/jpeg",
      quality,
    ),
  );
}
