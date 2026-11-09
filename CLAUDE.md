# Proyecto Kamae (kamae.web.app)

Catálogo e-commerce liviano de equipamiento para Kendo e Iaido (shinai, bokken, iaito, tsubas impresas en 3D personalizadas, indumentaria). **Sin pasarela de pago**: la compra se deriva a WhatsApp con un mensaje precargado.

## Stack
- React + Vite, Tailwind CSS (estética minimalista Dojo/Zen, mobile-first), ESLint, React Router.
- Firebase: Firestore (inventario), Auth (solo admin), Hosting.
- Imágenes: **DECISIÓN PENDIENTE** — Firebase Storage requiere plan Blaze desde feb-2026. Opciones: (a) Blaze + alertas de presupuesto, (b) Cloudinary/ImageKit gratis guardando solo la URL en Firestore, (c) imágenes estáticas en `/public`. Preguntar antes de implementar la subida.

## Convenciones
- Idioma del código: nombres de dominio en español (productos, precio, disponibilidad), código técnico en inglés está bien.
- Variables de entorno con prefijo `VITE_` en `.env` (no commitear `.env`): config de Firebase, `VITE_WHATSAPP` (formato 549XXXXXXXXXX), `VITE_ADMIN_UID`.
- Estructura: `src/components`, `src/pages`, `src/firebase`, `src/hooks`, `src/utils`.
- Desarrollo contra Firebase Emulator Suite, no contra producción.

## Modelo de datos — colección `productos`
```js
{
  nombre, slug,                    // slug único para /producto/:slug
  descripcion,
  disciplina: ['kendo'|'iaido'],   // array
  categoria: 'shinai'|'bokken'|'iaito'|'tsuba'|'bogu'|'indumentaria'|'accesorios',
  precio: Number, moneda: 'ARS',
  disponibilidad: 'disponible'|'agotado'|'a_pedido',
  tiempoProduccion: String,        // para a_pedido (ej. '7-10 días')
  variantes: [{ etiqueta, precio?, disponible }],  // talles shinai, colores tsuba, etc.
  visible: Boolean,                // publicado vs borrador (distinto de stock)
  destacado: Boolean, orden: Number,
  imagenes: [{ url, path, alt }],  // path permite borrar el archivo
  fechaCreacion, fechaActualizacion // serverTimestamp()
}
```
No usar la palabra "Armas" como categoría.

## Rutas
- `/` catálogo (grilla + filtros por disciplina y categoría; solo `visible == true`)
- `/producto/:slug` detalle con selector de variante y CTA WhatsApp
- `/login`
- `/admin` tabla CRUD (protegida)
- `/admin/nuevo` y `/admin/editar/:id` (mismo formulario reutilizado)
- `*` página 404
- `firebase.json`: rewrite `"**" -> "/index.html"`

## Seguridad (crítico)
- La ruta privada en React es solo UX. La seguridad real está en las reglas.
- Firestore: lectura pública solo de productos `visible == true`; escritura solo si `request.auth.uid` es el UID admin. NO usar `request.auth != null` como criterio de admin (cualquiera puede crearse una cuenta).
- Si se usa Storage: misma regla de admin + límite de tamaño (<2MB) y `contentType` image/*.

## WhatsApp
- `https://wa.me/${VITE_WHATSAPP}?text=${encodeURIComponent(msg)}`
- El mensaje incluye nombre, variante, precio y link al producto.
- "Lista de consulta" en localStorage (carrito sin pago) para consultar varios productos en un solo mensaje.
- Registrar evento de analytics `click_whatsapp` con el producto (única métrica de conversión).

## Rendimiento
- Catálogo público con `getDocs` (no `onSnapshot`); tiempo real solo en admin.
- Comprimir imágenes en el cliente antes de subir (`browser-image-compression`, WebP), `loading="lazy"` en la grilla.

## Roadmap
1. ✅ Setup Vite + React + Tailwind + ESLint
2. ✅ Estructura base, React Router, Git
3. Firebase: SDK, `.env`, Emulators, decidir hosting de imágenes
3.5. Reglas de seguridad Firestore/Storage + pruebas en emulador
4. Públicos: Navbar, Footer, ProductCard, grilla, filtros, detalle, WhatsApp, lista de consulta, analytics
5. Admin: login, ruta protegida, CRUD completo (alta, edición, borrado incl. imágenes), compresión
6. Deploy: build, rewrites, verificar que el site ID `kamae` esté libre, GitHub Actions
7. QA en móviles reales + Lighthouse

## Deuda técnica conocida
- SPA: las previews de links por WhatsApp/Instagram no muestran datos del producto (OG tags). Evaluar prerender o migrar a Astro/Next más adelante.
- Contenido pendiente: guía de talles de shinai, envíos, tiempos de pedidos personalizados, "Sobre Kamae".
