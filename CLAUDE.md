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
- `googleapis` para Drive y Sheets, autenticado con una **service account** (solo en servidor).

```bash
npm run dev     # desarrollo en localhost:3000
npm run build   # build de producción (lo mismo que hace Vercel)
npm run lint
npx tsc --noEmit
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
  lib/google.ts           Cliente Drive/Sheets (server-only)
  lib/teams.ts            Lista de equipos/iconos, texto de la pregunta, límite de caracteres
  lib/image.ts            Compresión de fotos en el navegador antes de subir
public/brand/             Logos (Evoluzzión Annual Meeting 2026, IZZON Lab)
public/icons/             Iconografía: <icono>-<negro|blanco|beige>.png
raw-assets/               Originales de diseño (.ai, .jpg, .svg). No se sirven; fuente de verdad visual
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

- **Credenciales solo en servidor.** Nunca uses `NEXT_PUBLIC_` para variables de Google ni importes `lib/google.ts` desde un componente cliente (lleva `import "server-only"`). Las variables están en `.env.example`; los valores reales en `.env.local` (ignorado por git) y en Vercel.
- **Drive + service account:** la carpeta destino debe estar en una **Unidad compartida** y las llamadas llevan `supportsAllDrives: true`. En "Mi unidad" falla por falta de cuota.
- **Límite de 4,5 MB por petición en Vercel:** las fotos se comprimen en el cliente (`compressImage`) antes de enviarlas; la ruta rechaza >4 MB.
- **Sheets:** usar `valueInputOption: "RAW"` para que las respuestas no se interpreten como fórmulas.
- Validar siempre en servidor el equipo (`isTeamId`) y la longitud de la respuesta, no fiarse del cliente.
- No guardar datos personales de los participantes: solo nombre de equipo, respuesta y foto.

## Pendiente / por decidir

- Lista definitiva de equipos: ¿son los 10 iconos, o 20 (10 iconos × negro/blanco)? ¿Qué nombre se escribe en la hoja?
- Orden exacto del flujo (¿se elige equipo antes o después de la foto/respuesta?) y uso de la variante beige (¿estado seleccionado?).
- La cabecera `public/brand/evoluzzion-annual-meeting-2026.svg` pesa ~3,7 MB y usa texto vivo en Montserrat, que no se renderiza con la fuente correcta dentro de `<img>`. Exportar una versión con el texto convertido a contornos y optimizada (o un PNG/WebP), o maquetar el texto en HTML.
- Pantallas de confirmación / error tras enviar.
