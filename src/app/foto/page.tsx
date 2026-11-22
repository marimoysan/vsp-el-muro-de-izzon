import { Screen } from "@/components/Screen";
import { PhotoUploader } from "./PhotoUploader";

/**
 * Flujo "Sube tu foto": elegir foto de la galería → compressImage() → POST /api/photo.
 * Versión de prueba sin selección de equipo.
 */
export default function FotoPage() {
  return (
    <Screen compact>
      <PhotoUploader />
    </Screen>
  );
}
