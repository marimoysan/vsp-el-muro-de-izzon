# El muro de IZZON · Evoluzzión 2026

Web móvil para la dinámica de team building del **Annual Meeting 2026 de IZZON Lab** ("Evoluzzión — La fuerza de crecer juntos"). Los equipos entran escaneando un QR y pueden:

1. **Subir una foto de equipo**, que se guarda en una carpeta de Google Drive.
2. **Responder a la pregunta** *"¿Qué nos impulsa a seguir evolucionando juntos?"*, que se añade a una hoja de Google Sheets (columnas: Equipo | Respuesta).

## Stack

Next.js (App Router, TypeScript) desplegado en Vercel. Las llamadas a Google se hacen desde rutas API del servidor con una service account.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena las variables
npm run dev                  # http://localhost:3000
```

## Configuración de Google

1. En Google Cloud, crea un proyecto, habilita **Google Drive API** y **Google Sheets API** y crea una **service account** con una clave JSON.
2. **Drive:** crea la carpeta de fotos dentro de una **Unidad compartida** y añade el email de la service account como *Gestor de contenido*. (Una service account no tiene cuota propia: en "Mi unidad" la subida falla.)
3. **Sheets:** crea la hoja con una pestaña `Respuestas` y cabeceras `Equipo | Respuesta`, y compártela con la service account como *Editor*.
4. Copia el email, la clave privada y los IDs de carpeta y hoja a `.env.local` (y a Vercel).

## Despliegue

Importa el repositorio de GitHub en Vercel, añade las variables de entorno de `.env.example` y despliega. Cada push a `main` se despliega a producción.
