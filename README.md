# El muro de IZZON · Evoluzzión 2026

Web móvil para la dinámica de team building del **Annual Meeting 2026 de IZZON Lab** ("Evoluzzión — La fuerza de crecer juntos"). Los equipos entran escaneando un QR y pueden:

1. **Subir una foto de equipo**, que se guarda en una carpeta de Google Drive.
2. **Responder a la pregunta** *"¿Qué nos impulsa a seguir evolucionando juntos?"*, que se añade a una hoja de Google Sheets (columnas: Equipo | Respuesta).

## Stack

Next.js (App Router, TypeScript) desplegado en Vercel. Las rutas API del servidor llaman a una aplicación web de Google Apps Script ([apps-script/Code.gs](apps-script/Code.gs)), que guarda las fotos en Drive y las respuestas en Sheets con la cuenta de Google de la organizadora.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena las variables
npm run dev                  # http://localhost:3000
npm run test:e2e             # sube una foto y una respuesta de prueba
```

## Configuración de Google (Apps Script)

1. **Drive:** crea una carpeta para las fotos y copia su ID (lo que va después de `/folders/` en la URL).
2. **Sheets:** crea una hoja con una pestaña `Respuestas` y cabeceras `Equipo | Respuesta` en la fila 1. Copia su ID (entre `/d/` y `/edit` en la URL).
3. **Script:** en [script.google.com](https://script.google.com) crea un proyecto nuevo y pega el contenido de `apps-script/Code.gs` en `Código.gs`.
4. **Propiedades:** en *Configuración del proyecto → Propiedades del script* añade `SECRET` (genera uno con `openssl rand -hex 32`), `FOLDER_ID`, `SHEET_ID` y `SHEET_NAME` (`Respuestas`).
5. **Publicar:** *Implementar → Nueva implementación → Aplicación web*, con *Ejecutar como: Yo* y *Quién tiene acceso: Cualquier usuario*. Autoriza los permisos y copia la URL que termina en `/exec`.
6. En `.env.local` (y en Vercel) pon `APPS_SCRIPT_URL` = esa URL y `APPS_SCRIPT_SECRET` = el mismo `SECRET`.

Para cambiar el script después: *Implementar → Gestionar implementaciones → editar → Versión nueva*. Así se mantiene la misma URL.

## Despliegue

Importa el repositorio de GitHub en Vercel, añade las variables de entorno de `.env.example` y despliega. Cada push a `main` se despliega a producción.
