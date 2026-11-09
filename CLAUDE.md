# Proyecto Kamae (kamae.web.app)

Catálogo e-commerce liviano de equipamiento para Kendo e Iaido (shinai, bokken, iaito, tsubas impresas en 3D personalizadas, indumentaria). **Sin pasarela de pago**: la compra se deriva a WhatsApp con un mensaje precargado.

## Stack
- React + Vite, Tailwind CSS (estética minimalista Dojo/Zen, mobile-first), ESLint, React Router.
- Firebase: Firestore (inventario), Auth (solo admin), Hosting.
- Imágenes: **Cloudinary** (plan gratis; Firebase Storage exigiría Blaze). Subida desde el navegador con un *upload preset* sin firma; en Firestore se guarda `publicId` + `url`. URLs con `f_auto,q_auto` vía `src/utils/cloudinary.js`.
  - El preset debe restringir: carpeta `kamae/productos`, formatos de imagen, tamaño máx. y transformación entrante (ej. `c_limit,w_1600`). Cualquiera que vea el preset podría subir archivos: es un riesgo aceptado (no expone ni borra lo existente).
  - **Pendiente Fase 5**: borrar en Cloudinary requiere firma con el API secret (no puede ir en el cliente, y Cloud Functions requieren Blaze). Opciones: `delete_token` (solo sirve 10 min post-subida), limpieza manual/periódica de huérfanos con un script local, o Blaze.

## Firebase en el código
- `src/firebase/app.js`: `initializeApp`. En dev exige un proyecto `demo-*` (nunca toca producción).
- `src/firebase/db.js`: Firestore **lite** para el catálogo público (solo `getDocs`/`getDoc`, bundle chico).
- `src/firebase/admin.js`: Firestore completo + Auth. Importar **solo** desde páginas lazy de `/login` y `/admin`.
- `src/firebase/analytics.js`: `registrarEvento()`, carga Analytics bajo demanda solo en producción.
- `src/firebase/productos.js`: el catálogo público se trae **completo una vez por sesión** (`visible == true`) y se filtra/ordena en memoria (destacados primero, luego `orden`); sin índices compuestos. Los datos llegan por **loaders de React Router** (`router.jsx`), no por `useEffect`. Filtros en la URL (`?disciplina=&categoria=`).
- Lista de consulta: store sobre localStorage (`utils/listaConsulta.js`) + `useSyncExternalStore` (`hooks/useListaConsulta.js`); sin Context.
- Dev: `npm run emulators` (Auth 9099, Firestore 8080, UI 4000) y `npm run seed` (admin `admin@kamae.test` / `kamae123`, uid `admin-dev`, + productos de prueba con un borrador). `.env.development` se commitea (sin secretos); `.env` con la config real no.

## Convenciones
- Idioma del código: nombres de dominio en español (productos, precio, disponibilidad), código técnico en inglés está bien.
- Variables de entorno con prefijo `VITE_` en `.env` (no commitear `.env`): config de Firebase, `VITE_WHATSAPP` (formato 549XXXXXXXXXX), Cloudinary. El admin NO va en `.env` (ver Seguridad).
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
  imagenes: [{ url, publicId, alt }],  // publicId de Cloudinary (transformaciones y borrado)
  fechaCreacion, fechaActualizacion // serverTimestamp()
}
```
No usar la palabra "Armas" como categoría.

## Rutas
- `/` catálogo (grilla + filtros por disciplina y categoría; solo `visible == true`)
- `/producto/:slug` detalle con selector de variante y CTA WhatsApp
- `/consulta` lista de consulta (carrito sin pago)
- `/login`
- `/admin` tabla CRUD (protegida)
- `/admin/nuevo` y `/admin/editar/:id` (mismo formulario reutilizado)
- `*` página 404
- `firebase.json`: rewrite `"**" -> "/index.html"`

## Seguridad (crítico)
- La ruta privada en React es solo UX. La seguridad real está en las reglas.
- Firestore: lectura pública solo de productos `visible == true`; escritura solo para admins. NO usar `request.auth != null` como criterio de admin (cualquiera puede crearse una cuenta).
- **Admin = UID con documento en `admins/{uid}`** (allowlist; las reglas usan `exists()`). En producción se da de alta creando ese doc a mano en la Firebase Console. Desde el cliente nadie puede escribir ni listar `admins`; cada usuario solo puede leer su propio doc (así el frontend sabe si es admin, sin `VITE_ADMIN_UID`).
- Las reglas también validan el esquema de `productos` (campos exactos, tipos, enums, `fechaCreacion`/`fechaActualizacion` con `serverTimestamp()`, inmutabilidad de `fechaCreacion`). Si se agrega un campo al modelo, actualizar `firestore.rules` y sus tests.
- Tests de reglas: `tests/firestore.rules.test.js`. `npm run test:rules` levanta su propio emulador; si `npm run emulators` ya está corriendo, usar `npx vitest run` (usa otro projectId, no pisa el seed).
- Imágenes en Cloudinary: las restricciones van en el upload preset (ver Stack); no hay reglas de Storage.

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
3. ✅ Firebase: SDK, `.env`, Emulators, decidir hosting de imágenes (→ Cloudinary)
3.5. ✅ Reglas de seguridad Firestore + pruebas en emulador (Storage no aplica: imágenes en Cloudinary)
4. ✅ Públicos: Navbar, Footer, ProductCard, grilla, filtros, detalle, WhatsApp, lista de consulta, analytics (falta: probar con imágenes reales de Cloudinary)
5. Admin: login, ruta protegida, CRUD completo (alta, edición, borrado incl. imágenes), compresión
6. Deploy: build, rewrites, verificar que el site ID `kamae` esté libre, GitHub Actions
7. QA en móviles reales + Lighthouse

## Deuda técnica conocida
- SPA: las previews de links por WhatsApp/Instagram no muestran datos del producto (OG tags). Evaluar prerender o migrar a Astro/Next más adelante.
- Contenido pendiente: guía de talles de shinai, envíos, tiempos de pedidos personalizados, "Sobre Kamae".
