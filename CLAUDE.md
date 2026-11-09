# Proyecto Kamae (kamae.web.app)

Catálogo e-commerce liviano de equipamiento para Kendo e Iaido (shinai, bokken, iaito, tsubas impresas en 3D personalizadas, indumentaria). **Sin pasarela de pago**: la compra se deriva a WhatsApp con un mensaje precargado.

## Stack
- React + Vite, Tailwind CSS (estética minimalista Dojo/Zen, mobile-first), ESLint, React Router.
- Firebase: Firestore (inventario), Auth (solo admin), Hosting.
- Imágenes: **Cloudinary** (plan gratis; Firebase Storage exigiría Blaze). Subida desde el navegador con un *upload preset* sin firma; en Firestore se guarda `publicId` + `url`. URLs con `f_auto,q_auto` vía `src/utils/cloudinary.js`.
  - Preset `kamae_productos` (`VITE_CLOUDINARY_UPLOAD_PRESET`), ya creado y verificado: **Unsigned**, asset folder `kamae/productos`, public ID auto-generado (aleatorio), formatos permitidos jpg/png/**webp** (webp es obligatorio: el cliente convierte todo a WebP), **"Return delete token" activado**. Cualquiera que vea el preset podría subir archivos: riesgo aceptado (no expone ni borra lo existente).
  - Subida: `utils/cloudinarySubida.js` comprime en el cliente a WebP (máx. 1600px, `browser-image-compression` con import dinámico) y sube con el preset.
  - Borrado (decidido en Fase 5): borrar en Cloudinary requiere el API secret (no puede ir en el cliente; Functions requieren Blaze). Se usa el `delete_token` (~10 min): al quitar una imagen recién subida o al cancelar el formulario se borra. Las imágenes ya guardadas que se quitan, y las de productos borrados, **quedan huérfanas** en Cloudinary. Pendiente: script local de limpieza de huérfanos (compara `publicId` en Firestore vs carpeta en Cloudinary; usa el API secret solo en la máquina del admin).

## Firebase en el código
- `src/firebase/app.js`: `initializeApp`. En dev exige un proyecto `demo-*` (nunca toca producción).
- `src/firebase/db.js`: Firestore **lite** para el catálogo público (solo `getDocs`/`getDoc`, bundle chico).
- `src/firebase/admin.js`: Firestore completo + Auth. Importar **solo** desde páginas lazy de `/login` y `/admin`.
- `src/firebase/analytics.js`: `registrarEvento()`, carga Analytics bajo demanda solo en producción.
- `src/firebase/productos.js`: el catálogo público se trae **completo una vez por sesión** (`visible == true`) y se filtra/ordena en memoria (destacados primero, luego `orden`); sin índices compuestos. Los datos llegan por **loaders de React Router** (`router.jsx`), no por `useEffect`. Filtros en la URL (`?disciplina=&categoria=`).
- Admin: `firebase/sesion.js` (store de sesión: usuario + `esAdmin` leyendo `admins/{uid}`) + `hooks/useSesion.js`; `components/admin/AdminLayout.jsx` es la guardia lazy de `/admin` (redirige a `/login`, muestra "Sin acceso" si no es admin). CRUD en `firebase/productosAdmin.js` (tabla con `onSnapshot`; tras escribir llama `invalidarCatalogo()`). El formulario arma el doc con **exactamente** los campos que validan las reglas (`aFirestore` en `ProductoForm.jsx`).
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
  nombre,                          // obligatorio siempre (incluso en borrador)
  slug,                            // automático desde el nombre al crear, único (-2, -3…); NO cambia al editar (links compartidos)
  descripcion,
  disciplina: ['kendo'|'iaido'],   // array
  categoria: ''|'shinai'|'bokken'|'iaito'|'tsuba'|'bogu'|'indumentaria'|'accesorios',  // '' solo en borrador
  precio: Number|null,             // null solo en borrador; las variantes usan la misma moneda
  moneda: 'ARS'|'USD',
  disponibilidad: 'disponible'|'agotado'|'a_pedido',
  tiempoProduccion: String,        // para a_pedido (ej. '7-10 días')
  variantes: [{ etiqueta, precio?, disponible }],  // talles shinai, colores tsuba, etc.
  visible: Boolean,                // NO lo elige el admin: true solo si está completo (ver abajo)
  imagenes: [{ url, publicId, alt }],  // publicId de Cloudinary (transformaciones y borrado)
  whatsapp: String,                // '549' + 10 dígitos, o '' en borrador. Cada producto tiene su número (varios vendedores)
  fechaCreacion, fechaActualizacion // serverTimestamp(); el catálogo y el admin ordenan por fechaCreacion desc
}
```
No usar la palabra "Armas" como categoría.
- **Publicación automática**: al guardar, el producto se publica (`visible: true`) solo si tiene descripción, disciplina, categoría, precio, ≥1 imagen y WhatsApp; si falta algo queda como borrador y el admin muestra qué falta. Criterio duplicado en `utils/completitud.js` y `productoCompleto()` de `firestore.rules`: mantenerlos sincronizados.
- **Sin "destacado" ni "orden" manual** (decisión del usuario): con varios admins se pisarían el orden entre sí.
- Lista de consulta: el total se muestra separado por moneda (nunca sumar ARS con USD).

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
- `https://wa.me/${producto.whatsapp}?text=${encodeURIComponent(msg)}` — **el número es por producto** (lo carga el admin en el formulario; se precompleta con el último usado en ese navegador).
- `VITE_WHATSAPP` es **opcional**: solo el link general del footer (si está vacío, no se muestra).
- El mensaje incluye nombre, variante, precio y link al producto.
- "Lista de consulta" en localStorage (carrito sin pago): se agrupa por número de WhatsApp → un mensaje/botón por vendedor.
- Registrar evento de analytics `click_whatsapp` con el producto (única métrica de conversión).

## Rendimiento
- Catálogo público con `getDocs` (no `onSnapshot`); tiempo real solo en admin.
- Comprimir imágenes en el cliente antes de subir (`browser-image-compression`, WebP), `loading="lazy"` en la grilla.

## Roadmap
1. ✅ Setup Vite + React + Tailwind + ESLint
2. ✅ Estructura base, React Router, Git
3. ✅ Firebase: SDK, `.env`, Emulators, decidir hosting de imágenes (→ Cloudinary)
3.5. ✅ Reglas de seguridad Firestore + pruebas en emulador (Storage no aplica: imágenes en Cloudinary)
4. ✅ Públicos: Navbar, Footer, ProductCard, grilla, filtros, detalle, WhatsApp, lista de consulta, analytics
5. ✅ Admin: login, ruta protegida, CRUD completo (alta, edición, borrado incl. imágenes), compresión. Subida real verificada (JPEG 379 KB → WebP 1600 px, 64 KB) y borrado por delete token al quitar/cancelar.
6. ✅ Deploy en **https://kamae-ar.web.app** (proyecto Firebase `kamae-ar`, Firestore en `southamerica-east1`, plan Spark). Admin de producción: `cris.javi.05@gmail.com` con doc `admins/{uid}`. API key web restringida por referrer (`kamae-ar.web.app`, `kamae-ar.firebaseapp.com`). Pendiente opcional: desactivar el sign-up de Auth desde la consola; sitio extra `kamae.web.app` (el usuario lo descartó por ahora).
7. QA en móviles reales + Lighthouse

## Deploy
- **Automático**: `.github/workflows/deploy.yml` (raíz del repo) en cada push a `main` que toque `kamae-catalog/`: `npm ci` → lint → `test:rules` → build → Firebase Hosting. Si algo falla, no publica. Secret de GitHub: `FIREBASE_SERVICE_ACCOUNT_KAMAE_AR` (creado con `firebase init hosting:github`).
- **Reglas de Firestore: a mano** tras cambiar `firestore.rules`: `npx firebase deploy --only firestore:rules` (desde `kamae-catalog/`). El workflow no las despliega.
- `.env.production` se commitea (config pública); `vite.config.js` corta el build de producción si faltan variables.
- Repo público (github.com/Faun0/kamae): GitHub marca la API key web de Firebase como "secreto"; es pública por diseño (va en el JS) y está restringida por referrer. Nunca commitear el API Secret de Cloudinary ni claves de cuentas de servicio.
7. QA en móviles reales + Lighthouse

## Deuda técnica conocida
- SPA: las previews de links por WhatsApp/Instagram no muestran datos del producto (OG tags). Evaluar prerender o migrar a Astro/Next más adelante.
- Contenido pendiente: guía de talles de shinai, envíos, tiempos de pedidos personalizados, "Sobre Kamae".
