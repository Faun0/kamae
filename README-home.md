# Página de inicio y "Sobre Kamae" — plan

> Estado: **implementado** (2026-11-23) en `/`, `/catalogo` y `/sobre`. Los textos siguen siendo un predeterminado para revisar y reescribir: están en `kamae-catalog/src/pages/Home.jsx`, `Sobre.jsx` y `src/utils/contenido.js`.
>
> Decisiones tomadas al implementar: "Contacto" y "Quién está detrás" no se muestran por ahora; "Qué significa el nombre" está armada pero oculta (`SOBRE_PUBLICAR.significadoNombre` en `contenido.js`) hasta confirmarla; en celular el menú es desplegable (☰); la fuente se sirve desde el propio sitio; las fotos llevan un borde fino neutro. Texto corregido en "¿Tenés algo para mostrar?": el email lo verifica el propio vendedor ("verificás tu email y yo apruebo tu perfil").

## 1. Posicionamiento

Kamae es una **vidriera comunitaria sin fines de lucro** para la gente de Kendo e Iaido de Argentina.

- La comunidad muestra lo que fabrica, tiene o consigue, sin tener que publicar en muchos lugares distintos.
- **No es intermediaria**: no cobra comisión y no participa del pago ni de la entrega.
- Nace para acercar equipamiento que es difícil de conseguir en el país.
- Cada vendedor es responsable de lo que publica y de la venta.
- El proyecto lo desarrolla y mantiene Cristian Pérez (Córdoba) y también funciona como muestra de su trabajo en desarrollo y gestión de proyectos.

> ✅ La introducción del README ya refleja este posicionamiento.

## 2. Rutas

| Ruta | Contenido |
|---|---|
| `/` | **Nueva home** |
| `/catalogo` | Catálogo (hoy vive en `/`) |
| `/sobre` | Página "Sobre Kamae" |
| `/producto/:slug`, `/consulta`, `/login`, `/admin/*` | Sin cambios |

Impacto técnico al mover el catálogo:

- Cambiar el link "Catálogo" de la navbar, el logo (apunta a la home), "Volver al catálogo" y el link del 404.
- Agregar "Inicio" y "Sobre Kamae" a la navbar.
- Los links compartidos con filtros (`/?disciplina=kendo`) deben **redirigir a `/catalogo` conservando los parámetros**.
- La home reutiliza `obtenerCatalogo()` (ya cacheado por sesión): no suma lecturas a Firestore.
- Actualizar `<title>`, `description` y metadatos de la home.

## 3. Estructura de la home

1. **Hero**
2. **Cómo funciona**
3. **Explorar** (Kendo / Iaido)
4. **Últimos agregados** (3 o 4 productos más nuevos, ordenados por `fechaCreacion`; no hay campo "destacado")
5. **Qué hay detrás de Kamae** (resumen + link a `/sobre`)
6. **¿Tenés algo para mostrar?** (invitación a publicar, link a `/login`)
7. Footer existente

Fuera de alcance por ahora: preguntas frecuentes y testimonios (se agregan cuando haya contenido real).

## 4. Textos predeterminados

Voz: **primera persona del singular, voseo cercano**.

### Hero
**Título:** La vidriera de la comunidad de Kendo e Iaido.

**Subtítulo:** Acá se muestra lo que la comunidad arma, fabrica o consigue: shinai, bogu, indumentaria, tsubas hechas a pedido y más. Elegís, escribís por WhatsApp y coordinás directo con quien lo tiene.

**Botones:** `Ver catálogo` · `Cómo funciona`

### Cómo funciona
1. **Elegí.** Mirá el catálogo y encontrá el producto y la opción que necesitás.
2. **Consultá.** Escribile por WhatsApp a quien lo publicó, o sumá varios productos a tu lista de consulta y mandá un solo mensaje.
3. **Coordiná.** El precio, el pago y la entrega los acordás directamente con el vendedor. Kamae no participa de la venta.
4. **Valorá** *(próximamente)*. Contá cómo te fue, para que la comunidad sepa con quién conviene tratar.

### Explorar
Dos tarjetas grandes, `Kendo` e `Iaido`, que llevan a `/catalogo?disciplina=...`.

### Últimos agregados
Título: "Lo último que se sumó". Link: `Ver todo el catálogo →`.

### Qué hay detrás de Kamae
> Kamae es una vidriera de la comunidad, sin fines de lucro. Nació porque buena parte del equipamiento de Kendo e Iaido es difícil de conseguir en el país, y porque cada uno termina publicando lo que tiene en muchos lugares distintos. Acá se junta todo en un solo sitio. No cobro comisión ni intervengo en las ventas: cada vendedor se hace cargo de lo que publica.

Link: `Conocé más →` (a `/sobre`).

### ¿Tenés algo para mostrar?
> Si fabricás, tenés o conseguís equipamiento, podés publicarlo en Kamae. Creás tu cuenta, verifico tu email y apruebo tu perfil, y desde ahí gestionás tus productos con tu propio WhatsApp.

Botón: `Quiero publicar` (a `/login`).

## 5. Página "Sobre Kamae" (`/sobre`)

Secciones:

1. **Qué es Kamae**: la vidriera comunitaria (ver posicionamiento).
2. **Por qué existe**: el equipamiento es difícil de conseguir en el país y publicar en muchos lugares es incómodo para la comunidad.
3. **Qué significa el nombre**: borrador abajo.
4. **Cómo funciona**: los cuatro pasos de la home, con más detalle.
5. **Responsabilidades**: Kamae solo ofrece la vidriera. Cada vendedor es responsable de lo que publica, de la venta y de la entrega. No hay comisiones ni pagos dentro del sitio.
6. **Quién está detrás**: Cristian Pérez, Córdoba. `[Completar: relación con el Kendo / Iaido]`. Kamae también es un proyecto propio para mostrar mi trabajo en desarrollo web y gestión de proyectos.
7. **Contacto**.

### Borrador sobre el nombre (revisar con un sensei o alguien que hable japonés antes de publicar)
> 構え (*kamae*) es la postura de guardia: la posición desde la que empieza todo en Kendo y en Iaido. Estar listo, firme y atento antes de actuar. Elegí ese nombre porque quiero que el sitio sea eso para la comunidad: el punto de partida para conseguir y mostrar el equipamiento. El mismo carácter se usa en 店構え (*misegamae*), la fachada o vidriera de un local, que también encaja con la idea del proyecto.

## 6. Decisiones de diseño

- **No unificar las fotos.** Cada vendedor sube lo que tiene; el catálogo no debe retocarlas ni forzar un fondo común. Que la foto se note contra el fondo es aceptable.
- **Único ajuste propuesto:** un borde fino o fondo neutro detrás de la imagen, para que las fotos de fondo blanco no parezcan flotar. No toca la foto. *(A decidir al trabajar el visual.)*
- **Hero sin foto real por ahora.** Resolver con tipografía y el motivo 構え, y sumar la foto cuando exista.
- **Cargar la fuente serif** (Noto Serif JP, subset latín y kanji, pocos pesos): hoy solo está declarada en CSS.
- Respetar `prefers-reduced-motion` si se agregan animaciones.

## 7. Futuro: valoraciones de vendedores

El paso 4 de "Cómo funciona" se muestra como **próximamente**. Antes de construirlo hay que decidir:

- **Problema de fondo:** la venta ocurre fuera del sitio, así que no se puede verificar que quien reseña haya comprado.
- **Opciones:** recomendaciones con comentario corto en vez de estrellas; email verificado y una reseña por vendedor; moderación del administrador; perfil público de vendedor con sus productos y valoraciones.
- **Implica:** colecciones nuevas en Firestore, reglas de seguridad con tests, perfil de vendedor y un criterio de moderación. Es un proyecto aparte.

## 8. Pendientes

- [ ] Reescribir y ajustar los textos a mi voz.
- [ ] Completar "Quién está detrás" en `/sobre`.
- [ ] Confirmar el significado del nombre con un sensei o alguien que hable japonés.
- [ ] Foto real para el hero.
- [ ] Revisar con un contador o abogado el texto de responsabilidades y la normativa pendiente (ver tabla del README principal).
- [x] Actualizar `CLAUDE.md` y la introducción del README tras implementar.
- [ ] Definir el medio de contacto para `/sobre`.
- [ ] Cuando se confirme el nombre: poner `significadoNombre: true` en `src/utils/contenido.js`.
