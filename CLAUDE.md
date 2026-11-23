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
npm run test:e2e                                  # sube una foto real a Drive vía localhost:3000
npm run test:e2e -- https://<app>.vercel.app foto.jpg   # contra producción
```

Comando de Claude `/check` ejecuta tipos + lint + build. Con `npm run dev` arrancado, los errores del servidor quedan en `.next/dev/logs/next-development.log` (útil para diagnosticar sin ver la terminal de Marina).

## Estado actual (23-nov-2026)

- ✅ Flujo con equipo: `/` "¿Qué equipo sois?" → `/equipo` (rejilla de 30 equipos: NEGRO, BLANCO, BEIGE) → `/equipo/<icono>-<color>` (acciones) → `/equipo/<id>/foto`. Las fotos se guardan como `<icono>-<color>_<timestamp>.jpg`.
- ✅ Acción completada: se recuerda en `localStorage` del móvil (`lib/progress.ts`) y el botón pasa a "✓ Foto enviada" (borde beige). Es por dispositivo.
- ⏳ Despliegue en Vercel: repo en GitHub (`marimoysan/vsp-el-muro-de-izzon`), Marina está creando el proyecto en Vercel con `APPS_SCRIPT_URL` y `APPS_SCRIPT_SECRET`. Siguiente paso: probar desde el móvil.
- ⏸️ Respuesta a la pregunta / Google Sheets: **aparcado a petición de Marina**. El botón "Responde a la pregunta" está inactivo; `/api/answer` existe pero no se usa ni se ha probado.

## Estructura

```
src/
  app/
    page.tsx              Entrada desde el QR: "¿Qué equipo sois?"
    equipo/page.tsx       Selector de equipo (30 iconos en 3 secciones de color)
    equipo/[team]/page.tsx          Acciones del equipo: "Sube tu foto" / "Responde a la pregunta" (inactivo)
    equipo/[team]/ActionButtons.tsx Cliente: marca como hechas las acciones completadas
    equipo/[team]/foto/PhotoUploader.tsx  Cliente: elegir de galería → vista previa → compressImage → POST /api/photo
    api/photo/route.ts    POST multipart {photo, team} → Drive
    api/answer/route.ts   POST JSON {team, answer} → Sheets (sin usar todavía)
  components/Screen.tsx   Marco común: cabecera Evoluzzión + contenido + logo IZZON Lab
  lib/google.ts           Llama a Apps Script para Drive/Sheets (server-only)
  lib/teams.ts            30 equipos (10 iconos × negro/blanco/beige), texto de la pregunta, límite
  lib/progress.ts         Acciones completadas por equipo (localStorage)
  lib/image.ts            Compresión de fotos en el navegador antes de subir
apps-script/Code.gs       Copia versionada del Apps Script (lo que se ejecuta es lo pegado en script.google.com)
scripts/e2e.sh            Prueba rápida de /api/photo con curl (no sustituye a probar en el móvil)
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
- **Límite de 4,5 MB por petición en Vercel:** las fotos se comprimen en el cliente (`compressImage`: hasta 4032 px —nunca menos de 3508 px, 300 ppp en A4, si el original lo permite—, la calidad JPEG más alta que quepa en ~4 MB, sin EXIF) antes de enviarlas; la ruta rechaza >4 MB. Vercel → Apps Script va en base64 (+33 %), sin problema.
- **Sheets:** `asText()` en el script antepone `'` a textos que empiezan por `= + - @` para que no se interpreten como fórmulas.
- Las fotos se imprimen después en A4, una por equipo, en una plantilla con hueco panorámico (~2:1).
- Validar siempre en servidor el equipo (`isTeamId`) y la longitud de la respuesta, no fiarse del cliente.
- No guardar datos personales de los participantes: solo nombre de equipo, respuesta y foto.

## Configuración de Apps Script (lecciones del primer montaje)

- **Código** = pegar `apps-script/Code.gs` tal cual. `getProperty("SECRET")` es el *nombre* de la propiedad: nunca sustituirlo por el valor.
- **Propiedades del script** (⚙️ Configuración del proyecto): `SECRET`, `FOLDER_ID` (y `SHEET_ID`, `SHEET_NAME` cuando se active Sheets). Hay que pulsar *Guardar propiedades del script*. Se leen en cada llamada: cambiarlas no requiere reimplementar.
- **Implementación**: aplicación web, *Ejecutar como: Yo*, *Acceso: Cualquier usuario*. Cambiar el código sí requiere *Gestionar implementaciones → ✏️ → Versión nueva*.
- **URL**: debe ser `https://script.google.com/macros/s/<id>/exec`. La forma de Workspace `/a/macros/<dominio>/s/...` exige login y da 403. Prueba rápida: abrirla en incógnito debe mostrar "Función de script no encontrada: doGet".
- **Secreto**: copiar/pegar a mano lo corrompió varias veces. Usar `openssl rand -hex 32 | pbcopy` y pegar en ambos sitios; para Vercel, `grep '^APPS_SCRIPT_SECRET=' .env.local | cut -d= -f2- | tr -d '"\n' | pbcopy`.
- **Diagnóstico** (mensajes en el log de `/api/photo`):
  - `Falta la variable de entorno …` → no existe `.env.local` o el nombre no coincide (en Vercel: redeploy tras añadir variables).
  - `Respuesta no JSON (HTTP 403)` → acceso no público o URL `/a/macros/…`.
  - `unauthorized (recibida: N, esperada: M | sin propiedad SECRET)` → secreto distinto o propiedad no guardada / en otro proyecto.
- `.env.example` es solo plantilla con valores ficticios; antes de commitearlo, comprobar que no contiene la URL real del script.

## Pendiente / por decidir

- ¿Qué nombre de equipo se escribe en la hoja? Ahora sería "Hoja Negro", etc.
- Sustituir `public/brand/evoluzzion-annual-meeting-2026.svg` por la versión con texto convertido a contornos que entregará Marina (la actual pesa ~3,7 MB y usa texto vivo).
- Pantallas de confirmación / error definitivas (ahora hay un "¡Foto recibida!" y un texto de error básicos).
- Avisar en la pantalla de subida de que la foto sea horizontal (la plantilla A4 tiene hueco ~2:1).
- `.env.example` local tiene la URL real del script sin commitear: restaurar con `git checkout -- .env.example`.
