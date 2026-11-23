/**
 * Prepara una foto en el navegador para subirla con la máxima calidad posible
 * dentro del límite de Vercel (~4,5 MB por petición; la ruta acepta ≤4 MB).
 *
 * - Resolución: hasta 4032 px en el lado largo (la nativa de un móvil de
 *   12 MP, sin reescalar). Un A4 a 300 ppp necesita ~3508 px, así que no se
 *   baja de ahí salvo que la foto original sea más pequeña. 4032 px también
 *   mantiene el lienzo por debajo del máximo de Safari en iOS (16,7 MP).
 * - Calidad JPEG: la más alta (hasta 0,95) que quepa en `maxBytes`, buscada por
 *   bisección. Solo si ni con `minQuality` cabe, se reduce la resolución.
 * - Al pasar por el lienzo se eliminan los metadatos EXIF (ubicación GPS, etc.)
 *   y la orientación queda aplicada a los píxeles.
 */
export async function compressImage(
  file: File,
  {
    maxSide = 4032,
    minSide = 3508,
    maxQuality = 0.95,
    minQuality = 0.8,
    maxBytes = 4 * 1024 * 1024 - 16 * 1024,
  } = {},
): Promise<Blob> {
  const bitmap = await openImage(file);
  const longSide = Math.max(bitmap.width, bitmap.height);
  let side = Math.min(longSide, maxSide);

  try {
    for (;;) {
      const canvas = draw(bitmap, side / longSide);

      let last = await toJpeg(canvas, maxQuality);
      if (last.size <= maxBytes) return last;

      // Bisección: la calidad más alta entre minQuality y maxQuality que quepa.
      let lo = minQuality;
      let hi = maxQuality;
      let fits: Blob | null = null;
      for (let i = 0; i < 5; i++) {
        const q = (lo + hi) / 2;
        last = await toJpeg(canvas, q);
        if (last.size <= maxBytes) {
          fits = last;
          lo = q;
        } else {
          hi = q;
        }
      }
      if (!fits) {
        last = await toJpeg(canvas, minQuality);
        if (last.size <= maxBytes) fits = last;
      }
      if (fits) return fits;

      // Ni con la calidad mínima cabe: reducir resolución (primero hasta
      // minSide; por debajo, seguir reduciendo para no fallar la subida).
      const next = Math.round(side * 0.9);
      if (next < 1000) return last;
      side = side > minSide && next < minSide ? minSide : next;
    }
  } finally {
    bitmap.close();
  }
}

export const UNREADABLE_PHOTO_MESSAGE =
  "No hemos podido leer la foto. Probad a elegirla otra vez o subidla desde el móvil de otro compañero/a.";

type Decoded = { source: CanvasImageSource; width: number; height: number; close(): void };

/**
 * Abre la foto para poder dibujarla. En Android a veces falla de forma
 * puntual ("The source image could not be decoded"): foto de Google Fotos aún
 * descargándose, o poca memoria libre. Por eso se prueba en este orden:
 *  1. createImageBitmap con el archivo tal cual.
 *  2. Tras una pausa, otra vez, pero leyendo antes el archivo entero a memoria.
 *  3. Con un <img> normal (otro descodificador del navegador).
 * Si los tres fallan, se lanza un error con un mensaje para el equipo.
 */
async function openImage(file: File): Promise<Decoded> {
  try {
    return fromBitmap(await createImageBitmap(file));
  } catch (err) {
    console.warn("createImageBitmap falló, reintentando", err);
  }

  let copy: Blob;
  try {
    await new Promise((r) => setTimeout(r, 600));
    copy = new Blob([await file.arrayBuffer()], { type: file.type });
  } catch (err) {
    console.warn("No se pudo leer el archivo", err);
    throw new Error(UNREADABLE_PHOTO_MESSAGE);
  }

  try {
    return fromBitmap(await createImageBitmap(copy));
  } catch (err) {
    console.warn("Reintento con createImageBitmap falló, probando con <img>", err);
  }

  const url = URL.createObjectURL(copy);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      close: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    console.warn("Tampoco se pudo abrir con <img>", err);
    throw new Error(UNREADABLE_PHOTO_MESSAGE);
  }
}

function fromBitmap(bitmap: ImageBitmap): Decoded {
  return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
}

function draw(bitmap: Decoded, scale: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap.source, 0, 0, canvas.width, canvas.height);
  return canvas;
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
