@AGENTS.md

# El muro de IZZON · Evoluzzión 2026

## Qué es

Web móvil (mobile-first, se abre desde un QR impreso en un póster A2) para el team building del **Annual Meeting 2026 de IZZON Lab**, lema *"Evoluzzión — La fuerza de crecer juntos"*. Cada equipo participante:

1. **Sube una foto de equipo** → se guarda en una carpeta de **Google Drive**.
2. **Responde a la pregunta** *"¿Qué nos impulsa a seguir evolucionando juntos?"* (máx. 250 caracteres) → se añade una fila a **Google Sheets** con dos columnas: `Equipo | Respuesta`.

Es una app de un solo evento: prioriza que sea sencilla, rápida en móvil y fiable el día del evento por encima de abstracciones o escalabilidad.

## Stack y comandos

- **Next.js 16** (App Router, TypeScript, CSS Modules, sin Tailwind) desplegado en **Vercel** desde GitHub (push a `main` = producción).
- Next 16 tiene cambios incompatibles con versiones anteriores (ver `AGENTS.md`): consulta `node_modules/next/dist/docs/` antes de usar APIs de Next. `cacheComponents` está activado en `next.config.ts`.
- Drive y Sheets vía una **aplicación web de Google Apps Script** (`apps-script/Code.gs`) que se ejecuta con la cuenta de Google de la organizadora. Las rutas API de Vercel la llaman desde el servidor con un secreto compartido. Sin Google Cloud, sin service account, sin `googleapis`.

```
Móvil → Vercel /api/photo | /api/answer → Apps Script (doPost) → Drive / Sheets
```

```bash
npm run dev     # desarrollo en localhost:3000
npm run build   # build de producción (lo mismo que hace Vercel)
npm run lint
npx tsc --noEmit
npm run test:e2e                                  # prueba real contra Drive/Sheets (local)
npm run test:e2e -- https://<app>.vercel.app foto.jpg   # contra producción
```

Comando de Claude `/check` ejecuta tipos + lint + build.

## Estructura

```
src/
  app/
    page.tsx              Pantalla de inicio: "Sube tu foto" / "Responde a la pregunta"
    foto/page.tsx         Flujo de subida de foto (pendiente)
    pregunta/page.tsx     Flujo de respuesta (pendiente)
    api/photo/route.ts    POST multipart {team, photo} → Drive
    api/answer/route.ts   POST JSON {team, answer} → Sheets
  components/Screen.tsx   Marco común: cabecera Evoluzzión + contenido + logo IZZON Lab
  lib/google.ts           Llama a Apps Script para Drive/Sheets (server-only)
  lib/teams.ts            Lista de equipos/iconos, texto de la pregunta, límite de caracteres
  lib/image.ts            Compresión de fotos en el navegador antes de subir
apps-script/Code.gs       Copia versionada del Apps Script (lo que se ejecuta es lo pegado en script.google.com)
scripts/e2e.sh            Prueba end-to-end de las rutas API
public/brand/             Logos (Evoluzzión Annual Meeting 2026, IZZON Lab)
public/icons/             Iconografía: <icono>-<negro|blanco|beige>.png
raw-assets/               Originales de diseño (.ai, .jpg, .svg). Solo en local, NO se versiona (.gitignore)
```

## Diseño (fuente de verdad: `raw-assets/LANDING_PAGE.jpg`)

5 pantallas móviles, todas con fondo negro, cabecera Evoluzzión arriba y logo IZZON Lab abajo:

1. **Inicio**: cabecera grande + botones "SUBE TU FOTO" y "RESPONDE A LA PREGUNTA".
2. **Pregunta**: cabecera compacta, pregunta en mayúsculas y textarea gris oscuro "Máx 250 caracteres."
3. **¿Qué equipo sois?**: botón que abre el selector de equipo.
4-5. **Selector de equipo**: rejilla de 3 columnas con iconos circulares (hoja, tubo, molécula, gota, matraz, frasco, engranaje, camión, cuentagotas, ZZ), en sección **NEGRO** y sección **BLANCO**, con scroll.

Tokens en `src/app/globals.css`: negro `#000`, beige `#c6c3b7` (botones tipo píldora y logo IZZON), superficie `#2b2b2b`. Tipografía **Montserrat** (cargada con `next/font`). Textos de UI en **español**.

`raw-assets/A2_QR.png` es el póster impreso con el QR que apunta a la URL de producción.

## Reglas importantes

- **Secretos solo en servidor.** `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET` nunca con prefijo `NEXT_PUBLIC_`, y no importes `lib/google.ts` desde un componente cliente (lleva `import "server-only"`). Valores reales en `.env.local` (ignorado por git) y en Vercel. IDs de carpeta/hoja y el secreto viven en las *Propiedades del script*, no en el código.
- **Apps Script:** responde siempre HTTP 200 con `{ok, error}`; `lib/google.ts` convierte `ok:false` en excepción. Si cambias `apps-script/Code.gs`, hay que pegarlo en script.google.com y publicar una **nueva versión del despliegue existente** (si se crea un despliegue nuevo, cambia la URL).
- **Límite de 4,5 MB por petición en Vercel:** las fotos se comprimen en el cliente (`compressImage`: 3000 px, calidad adaptativa ≤3,8 MB, ~270 ppp para el A4) antes de enviarlas; la ruta rechaza >4 MB. Vercel → Apps Script va en base64 (+33 %), sin problema.
- **Sheets:** `asText()` en el script antepone `'` a textos que empiezan por `= + - @` para que no se interpreten como fórmulas.
- Las fotos se imprimen después en A4, una por equipo, en una plantilla con hueco panorámico (~2:1).
- Validar siempre en servidor el equipo (`isTeamId`) y la longitud de la respuesta, no fiarse del cliente.
- No guardar datos personales de los participantes: solo nombre de equipo, respuesta y foto.

## Pendiente / por decidir

- Lista definitiva de equipos: ¿son los 10 iconos, o 20 (10 iconos × negro/blanco)? ¿Qué nombre se escribe en la hoja?
- Orden exacto del flujo (¿se elige equipo antes o después de la foto/respuesta?) y uso de la variante beige (¿estado seleccionado?).
- Sustituir `public/brand/evoluzzion-annual-meeting-2026.svg` por la versión con texto convertido a contornos que entregará Marina (la actual pesa ~3,7 MB y usa texto vivo).
- Pantallas de confirmación / error tras enviar.
