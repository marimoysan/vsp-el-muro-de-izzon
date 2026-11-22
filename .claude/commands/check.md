---
description: Comprueba tipos, lint y build antes de hacer commit o desplegar
---

Ejecuta en orden y para en el primer fallo, explicando la causa y proponiendo el arreglo:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

Si todo pasa, resume en una línea que el proyecto está listo para desplegar en Vercel.
