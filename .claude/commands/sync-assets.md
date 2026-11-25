---
description: Copia logos e iconos nuevos de raw-assets/ a public/ con nombres normalizados
---

1. Lista lo que hay en `raw-assets/` y en `public/brand/` y `public/icons/`.
2. Convierte a `public/icons/` los PNG de `raw-assets/iconografía/` que falten, en WebP de 264 × 264 px (calidad 88, con PIL) y renombrados en minúsculas, sin tildes y con guiones (`HOJA_NEGRO.png` → `hoja-negro.webp`).
3. Copia a `public/brand/` los logos SVG nuevos con nombres descriptivos en kebab-case.
4. No borres ni sobrescribas nada en `public/` sin preguntar primero.
5. Si aparece un icono nuevo, recuerda actualizar `TEAMS` en `src/lib/teams.ts`.
