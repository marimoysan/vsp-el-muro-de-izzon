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
Móvil → Vercel /api/photo | /api/answer | /api/status → Apps Script (doPost) → Drive / Sheets
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

## Estado actual (25-nov-2026)

- ✅ Desplegado en Vercel (`vsp-el-muro-de-izzon.vercel.app`, push a `main` = producción) y foto probada desde el móvil.
- ✅ Flujo: `/` "¿Qué equipo sois?" → `/equipo` (30 equipos en NEGRO, BLANCO, BEIGE) → `/equipo/<icono>-<color>` (acciones) → `/equipo/<id>/foto` o `/equipo/<id>/pregunta`. Tras completar una acción vuelve a la pantalla del equipo.
- ✅ Fotos: se guardan en Drive con el nombre del equipo, p. ej. `Hoja Negro.jpg` (si sube otra, Drive guarda dos con el mismo nombre). `compressImage` reintenta y usa `<img>` como alternativa si Android falla al descodificar ("The source image could not be decoded", visto en real); si todo falla, sugiere usar el móvil de otro compañero/a.
- ✅ Acción completada: se decide con **Drive y Sheets** (`/api/status` → acción `status` del Apps Script): foto hecha si hay un archivo `<Equipo>.<ext>` en la carpeta; respuesta hecha si hay una fila con el equipo en la columna A y texto en la B. El botón pasa a "✓ Foto enviada" / "✓ Respuesta enviada" (borde beige). Con las dos: pantalla "¡Completado! Podéis seguir disfrutando del Coffee Break" (sin flecha atrás) y el equipo sale en gris en el selector (no pulsable). La consulta (~3 s) se lanza ya en la landing (`PrefetchStatus`) y se guarda en memoria (`lib/status.ts`): selector y pantalla del equipo la muestran al instante y la refrescan en segundo plano; tras enviar, `markDone` la actualiza sin esperar a Google. Mientras no hay datos o si la consulta falla, la pantalla del equipo usa `localStorage` (`lib/progress.ts`), sin pantalla de espera, y el selector muestra todos activos. Borrar foto/fila en Google reactiva el equipo. Reenviar crea otra fila / otra foto.
- ✅ Acción `status` publicada en Apps Script (23-nov); `/api/status` probado en local (~3 s). Falta probar el gris/completado en el móvil.
- ✅ Navegación: flecha ‹ arriba a la izquierda (`BackLink` en `Screen.tsx`, prop `back`) en vez de enlaces "Volver". No hay flecha en `/` ni en la pantalla de completado.
- 🧪 Pregunta: 50–250 caracteres con contador → `/api/answer` → Sheets, fila `Equipo | Respuesta | Fecha y hora`. Pendiente de probar con la hoja real (requiere `SHEET_ID`/`SHEET_NAME` en Propiedades del script y nueva versión del Apps Script con la columna de fecha).
- 🎨 Cabecera grande (`Screen` sin `compact`, en `/`, pantalla del equipo y foto) al 160 % del ancho para que "EVOLUZZIÓN" ocupe ~3/4 de la pantalla como en el diseño (la imagen tiene mucho margen). Compacta en selector y pregunta.
- ⚡ Iconos en WebP 264 px (779 → 227 KB los 30), `unoptimized` (sin optimizador de Vercel), carga inmediata en el selector y precargados desde `/` (`PrefetchStatus`).
- 🎨 Cabecera: `public/brand/evoluzzion-annual-meeting-2026.png` (135 KB), sacada del PNG que mandó la diseñadora el 25-nov (`raw-assets/Attachments-Fwd_ …/LOGO_AANUAL_MEETING_2026_p01.png`, 1501 px, textos ya en Montserrat). Recortada sin el logo IZZON LAB de abajo ni el filo transparente, con fundido al negro en los últimos 120 px. Sustituye al SVG antiguo (1,9 MB, textos en Times). Si llega una versión al doble de resolución, se recorta igual.

## Estructura

```
src/
  app/
    page.tsx              Entrada desde el QR: "¿Qué equipo sois?"
    equipo/page.tsx       Selector de equipo (30 iconos en 3 secciones de color)
    equipo/TeamSections.tsx  Cliente: rejilla; equipos completados (Drive+Sheets) en gris vía TeamLink
    equipo/[team]/page.tsx          Acciones del equipo: "Sube tu foto" / "Responde a la pregunta"
    equipo/[team]/pregunta/AnswerForm.tsx  Cliente: textarea con contador → POST /api/answer
    equipo/[team]/ActionButtons.tsx Cliente: acciones hechas / pantalla de completado (según /api/status)
    equipo/[team]/foto/PhotoUploader.tsx  Cliente: elegir de galería → vista previa → compressImage → POST /api/photo
    api/photo/route.ts    POST multipart {photo, team} → Drive
    api/answer/route.ts   POST JSON {team, answer} → Sheets (valida equipo y 50–250 caracteres)
    api/status/route.ts   GET → {photo: TeamId[], answer: TeamId[]} leyendo Drive y Sheets (nunca cacheado)
  components/Screen.tsx   Marco común: cabecera Evoluzzión + contenido + logo IZZON Lab; `back` / `BackLink` = flecha atrás
  lib/google.ts           Llama a Apps Script para Drive/Sheets (server-only)
  lib/teams.ts            30 equipos (10 iconos × negro/blanco/beige), texto de la pregunta, límite
  lib/status.ts           Cliente: caché en memoria de /api/status; prefetchTeamStatus() (landing), useTeamStatus(), noteSaved()
  lib/progress.ts         Acciones completadas en este móvil (localStorage); solo respaldo si falla /api/status
  lib/image.ts            Compresión de fotos en el navegador antes de subir
apps-script/Code.gs       Copia versionada del Apps Script (lo que se ejecuta es lo pegado en script.google.com)
scripts/e2e.sh            Prueba rápida de /api/photo con curl (no sustituye a probar en el móvil)
public/brand/             Logos (Evoluzzión Annual Meeting 2026, IZZON Lab)
public/icons/             Iconografía: <icono>-<negro|blanco|beige>.webp (264 px, ~7 KB)
raw-assets/               Originales de diseño (.ai, .jpg, .svg). Solo en local, NO se versiona (.gitignore)
```

## Diseño (fuente de verdad: `raw-assets/LANDING_PAGE.jpg`)

5 pantallas móviles, todas con fondo negro, cabecera Evoluzzión arriba y logo IZZON Lab abajo:

Orden real del recorrido: 3 → 4-5 → 1 → (foto | 2).

1. **Acciones del equipo** (`/equipo/<id>`): cabecera grande + "SUBE TU FOTO" y "RESPONDE A LA PREGUNTA". Añadido: icono y nombre del equipo arriba (enlace para cambiar de equipo).
2. **Pregunta**: cabecera compacta, pregunta en mayúsculas y textarea gris oscuro. Añadido: contador, botón "Enviar" y flecha ‹ atrás.
3. **¿Qué equipo sois?** (`/`, entrada desde el QR): botón que abre el selector.
4-5. **Selector de equipo**: rejilla de 3 columnas con iconos circulares (hoja, tubo, molécula, gota, matraz, frasco, engranaje, camión, cuentagotas, ZZ) en secciones **NEGRO**, **BLANCO** y **BEIGE** (el diseño solo muestra dos; hay 30 equipos), con scroll. Los iconos negros llevan un aro gris sutil para distinguirse del fondo.

Tokens en `src/app/globals.css`: fondo `#060606`, beige `#c6c3b7` (botones tipo píldora y logo IZZON), superficie `#2b2b2b`. Tipografía **Montserrat** (cargada con `next/font`). Textos de UI en **español**.

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
- Probar en el móvil el gris del selector y la pantalla de completado.
- Probar la pregunta end-to-end en el móvil con la hoja real.
- Avisar en la pantalla de subida de que la foto sea horizontal (la plantilla A4 tiene hueco ~2:1).
- `.env.example` local tiene la URL real del script sin commitear: restaurar con `git checkout -- .env.example`.
