# Análisis UX/UI de Kamae

2026-11-23 · Cristian

## Estado de implementación (2026-11-23)

Las etapas 1 y 2 de este análisis están implementadas y publicadas (detalle en `CLAUDE.md`, §6.7 y sección "Diseño"). Lo que sigue abierto es el formato de búsqueda y filtros de la última sección. Los hallazgos de abajo se conservan tal como se escribieron.

- **Alta prioridad (1 a 5):** hechas. Vendedor visible en tarjeta y detalle, aclaración bajo el botón, foto entera en el detalle, áreas táctiles de 44 px y barra fija con el CTA en celular.
- **Media prioridad (1 a 7):** hechas. Menú ☰ en celular, "Volver al catálogo" con filtros, búsqueda y orden, bordes `sumi/50` y texto `text-shu-texto`, `prefers-reduced-motion`, fuente propia y botón "✓ En tu consulta".
- **Baja prioridad:** hecha la carga prioritaria de las primeras 4 imágenes. Sin verificar: tiempo de fabricación en la grilla y texto de 12 px.
- **Home:** hechos el hero con 構, las tarjetas 剣道 / 居合道, el paso 4 atenuado y el borde fino en las fotos.
- **Condición y ciudad:** hechas (`condicion` en productos y `vendedores/{uid}` con nombre y ciudad).
- **Pendiente:** buscador en el header y filtros en una sola fila (última sección).

## Alcance y resumen

La base visual de Kamae es sólida; los problemas importantes son de confianza entre comprador y vendedor y de tamaño de los elementos táctiles en mobile.

**Qué se revisó:** capturas de escritorio de `/` y `/producto/shinai-38` en kamae-ar.web.app, y el código de las vistas públicas (catálogo, detalle, navbar, footer y estilos).

**Qué no se revisó:** la versión mobile renderizada (no se pudo cambiar el tamaño de la ventana), `/consulta`, `/login` y el panel de administración.

**Método:** marco de prioridades del skill UI/UX Pro Max (accesibilidad, interacción, rendimiento, estilo, layout, tipografía, animación, formularios, navegación). Su script de búsqueda no estaba disponible, así que se aplicó desde conocimiento general, sin consultar su base de datos.

**Lo que funciona:** paleta con tokens semánticos (washi, sumi, shu), tipografía con jerarquía, foco visible, imágenes optimizadas con espacio reservado, esqueleto de carga, barra de progreso al navegar y estados vacíos y de error cuidados.

## Alta prioridad

Cinco hallazgos afectan la confianza del comprador, la fidelidad de las fotos y el uso desde el celular.

1. **No se sabe quién vende.** El detalle del producto lleva directo a un WhatsApp sin mostrar nombre, ciudad ni nada del vendedor. En un sitio comunitario con varios vendedores, el visitante debería saber con quién va a hablar antes de hacer clic. Mostrar al menos nombre y ciudad en la tarjeta y en el detalle, y así preparar el terreno para las valoraciones futuras.
2. **Falta aclarar que Kamae no participa de la venta, junto al botón.** Un texto corto bajo el CTA ("Coordinás directo con el vendedor; Kamae no interviene en la venta") fija la expectativa y apoya lo legal. Hoy esa aclaración solo existirá en la home futura, y mucha gente llega directo a un producto.
3. **El detalle recorta las fotos.** La imagen principal usa `object-cover` dentro de un cuadrado, así que una foto vertical o con el producto al borde pierde partes. Como cada vendedor sube lo que puede, el detalle debería mostrar la foto entera (`object-contain` sobre un fondo neutro). La grilla puede seguir recortando.
4. **Elementos táctiles chicos.** Según el código, los chips de filtro miden unos 34 px de alto, los links de la navbar unos 20 px y los del footer menos. La referencia es 44×44 px. Es lo primero que conviene medir en un celular real.
5. **El botón principal queda lejos en mobile.** Con la imagen a ancho completo, "Consultar por WhatsApp" probablemente queda bajo el pliegue. Una barra fija inferior con el CTA resuelve la acción clave. Falta verificarlo en un celular.

## Media prioridad

Siete ajustes de navegación, contraste, animación y feedback que conviene resolver antes de que crezca el catálogo.

1. **Navegación de la home planificada.** Con Inicio, Catálogo, Sobre Kamae, Consulta y Panel en la barra, en 390 px de ancho va a faltar espacio. Opciones: mover "Sobre Kamae" al footer o usar un menú compacto.
2. **"Volver al catálogo" pierde los filtros.** Si alguien filtró por Iaido y abre un producto, vuelve a la lista completa.
3. **Sin búsqueda ni orden.** No molesta con 3 productos, pero con varios vendedores la gente va a buscar por texto ("shinai 38"). Conviene planificarlo desde ahora.
4. **Contraste de elementos no textuales.** Los bordes de los chips (`sumi/20`) y del botón secundario (`sumi/30`) son muy suaves contra el fondo. Los textos sí pasan: el bermellón sobre washi da unos 5:1 por cálculo propio. El badge "A pedido" (texto chico, bermellón sobre un tinte claro) está en el límite y conviene verificarlo con una herramienta de contraste.
5. **Animación sin `prefers-reduced-motion`.** La barra de progreso y el zoom de 500 ms en las tarjetas no se desactivan para quien lo pide.
6. **La fuente serif no se carga.** `Noto Serif JP` está declarada en CSS pero no importada: el logo y los títulos cambian según el equipo.
7. **Feedback débil al agregar a la consulta.** El aviso aparece abajo como texto. Mejor que el botón cambie de estado ("✓ En tu consulta") y evite agregar dos veces sin querer.

## Baja prioridad

Tres detalles menores que se pueden resolver al pasar.

- **Texto de 12 px con mayúsculas y espaciado** (etiquetas de filtros, conteo de productos): legible, pero está en el mínimo.
- **Tiempo de fabricación en la grilla:** el badge "Disponible" se oculta en la grilla y solo aparece en el detalle, lo cual es buena decisión. En cambio, conviene mostrar el tiempo de fabricación de los productos "a pedido".
- **Carga de imágenes de la home:** las de la primera fila deberían cargar con prioridad; hoy todas son lazy.

## Sobre la home planificada

La home planificada en `README-home.md` es viable sin fotos propias si se apoya en tipografía y en el motivo 構.

- **Hero sin foto:** que sea tipográfico y use el 構 como motivo. Evitar rellenar con una imagen de stock.
- **Tarjetas Kendo / Iaido:** sin fotos propias, pueden usar 剣道 y 居合道 como elemento gráfico grande, y se mantiene la estética sin depender de imágenes.
- **Paso 4 "Valorá (próximamente)":** estilarlo atenuado, con borde punteado, para que parezca planificado y no roto.
- **Últimos agregados:** como las fotos van a ser muy dispares, ayuda un borde fino alrededor de cada una, sin intentar unificarlas.
- **Corrección a una observación anterior:** la grilla "desbalanceada" con 3 productos no es un defecto de diseño. Es resultado de tener poco inventario y se corrige sola al crecer.

## Una idea que puede importar

Si la comunidad va a vender equipo usado, el modelo de datos no tiene un campo de **condición** (nuevo / usado) ni de **ciudad**, y en reventa local son datos que la gente pregunta primero.

Es una hipótesis, no un hallazgo: queda por confirmar si aplica a los productos que se van a publicar.

## Búsqueda y filtros del catálogo: formato elegido

**Decisión (2026-11-23):** buscador en el header, visible solo en `/catalogo` por ahora, y filtros en una sola fila (opción B). Mockup de escritorio: https://claude.ai/artifact/XHBXeD4Knkbi9AwJuLQCSN. La versión mobile no está dibujada: se especifica abajo. Estado: **implementado** (2026-11-23), con los pendientes resueltos como se indica al final.

### Problema que resuelve

- Los filtros apilados ocupan unos 345 px de alto. En una ventana de 695 px, la primera fila de productos empieza recién en y≈642.
- Cuatro filas (buscar, disciplina, categoría, condición), cada una con su etiqueta y su chip "Todas": tres "Todas" repetidos.
- Callejón sin salida: Indumentaria + Usado da 0 productos, porque las categorías ofrecidas no dependen de la condición.

### Escritorio (desde 1024 px)

**Header:** logo, buscador (flexible, máximo 420 px) y navegación a la derecha. El buscador solo se muestra en `/catalogo`; en el resto de las páginas el header queda como hoy.

**Página:** título "Catálogo", toolbar de una fila, contador y grilla. Se elimina el subtítulo "Equipamiento para Kendo e Iaido." y las etiquetas en mayúsculas de cada grupo (pasan a ser el nombre accesible del grupo).

**Toolbar, de izquierda a derecha:**

`[ Todo | Kendo | Iaido ]  │  Shinai  Bogu  Indumentaria  │  Nuevo  Usado  ········  Ordenar por [Más nuevos ▾]`

| Elemento | Medida |
|---|---|
| Header | 64 px de alto |
| Buscador, chips, segmented, select | 44 px de alto (regla del proyecto: áreas táctiles de 44 px también en escritorio) |
| Separadores entre grupos | 1 × 24 px |
| Espacio entre grupos / entre chips | 12 px / 8 px |

Resultado esperado: la primera fila de productos arranca cerca de y≈245 en lugar de y≈642.

### Componentes y estados

| Componente | Comportamiento | Reposo | Activo |
|---|---|---|---|
| Disciplina (segmented) | Selección única: Todo / Kendo / Iaido. "Todo" es el estado por defecto y equivale a quitar el filtro. | Texto `sumi-soft`, sin fondo | Fondo `sumi`, texto `washi` |
| Categoría (chips) | Interruptores: tocar el activo lo desactiva. Sin chip "Todas". Hoy selección única. | Borde `sumi/50`, texto `sumi` | Fondo `sumi`, texto `washi` |
| Condición (chips) | Igual que Categoría: Nuevo / Usado. | Ídem | Ídem |
| Buscador | Lupa a la izquierda; placeholder "Buscar shinai, tsuba, keikogi…"; botón ✕ para limpiar cuando hay texto. | Borde `sumi/50`, fondo blanco | Foco: outline de 2 px en `shu`, offset 2 px (ya global) |
| Ordenar | `<select>` nativo: Más nuevos (por defecto), Precio de menor a mayor, Precio de mayor a menor. | Borde `sumi/50`, fondo blanco | — |

El borde `sumi/50` ya es el estándar del proyecto para controles (3,2:1 sobre `washi`).

### Comportamiento

- **Todo en la URL**, para poder compartirlo: `?q=&disciplina=&categoria=&condicion=&orden=`, con `orden=menor-precio` o `mayor-precio` (sin el parámetro, más nuevos). Se mantiene `replace: true` y que cambiar filtros no revalide el loader.
- **Búsqueda** sobre nombre, descripción, categoría y opciones, sin distinguir mayúsculas ni acentos (ya implementado). Se combina (Y) con los filtros.
- **Estado local con espera de 300 ms**: al mover el campo al header, conservar el patrón actual (estado local que actualiza la URL con 300 ms de espera). Leer la URL en cada tecla hace perder letras.
- **Orden por precio:** ARS antes que USD, sin mezclar monedas (como hoy).
- **Contador** con `aria-live="polite"`: "N productos", o "N resultados para «texto»" si hay búsqueda.
- **Filtros activos** (escritorio): cuando hay alguno, el contador pasa a "N productos · Shinai ✕ · Usado ✕ · Limpiar". En mobile alcanza con "Limpiar".
- **Estado vacío:** además de "Ver todo el catálogo", ofrecer quitar el filtro o la búsqueda que causó el 0 ("Quitar filtro: Usado", "Quitar «texto»").
- **Volver desde el detalle:** ya conserva filtros, búsqueda y orden (`location.state.volverA`); mantenerlo con los parámetros nuevos.

### Mobile (hasta 767 px)

1. **Header:** hoy muestra logo, Consulta (con contador) y el menú ☰. Se suma un botón de lupa de 44 × 44 px (`aria-expanded`), solo en `/catalogo`. Al tocarlo se despliega bajo el header el campo a ancho completo (44 px) con foco automático. Consulta sigue siempre visible.
2. **Disciplina:** segmented control a ancho completo, segmentos de 44 px.
3. **Categoría y Condición:** una fila con scroll horizontal, chips de 44 px, separador entre grupos y un degradé en el borde derecho como pista de que hay más.
4. **Fila de estado:** "N productos · Limpiar" a la izquierda y select "Ordenar: Más nuevos" (44 px) a la derecha.
5. **Grilla:** 2 columnas.
6. **Tablet (768 a 1023 px):** el toolbar pasa a dos filas: segmented y orden arriba, chips abajo.

### Accesibilidad

- Buscador con `<label>` oculto a la vista (`sr-only`) y contenedor `role="search"`.
- Cada grupo con `role="group"` y `aria-label` (Disciplina, Categoría, Condición); los botones con `aria-pressed`.
- Texto con contraste de 4,5:1 o más; bordes de controles de 3:1 o más.
- Áreas táctiles de 44 px (`min-h-11`).
- Transiciones con `motion-safe:` (`prefers-reduced-motion`).

### Criterios de aceptación

1. En 1280 × 695 px la primera fila de productos se ve completa sin hacer scroll.
2. Desde 1024 px los filtros ocupan una sola fila.
3. No hay tres "Todas": un único "Todo".
4. La URL refleja búsqueda, filtros y orden, y al compartirla se abre igual.
5. Ninguna combinación muestra 0 productos sin una salida clara.
6. Todo se puede operar con teclado.
7. En mobile no hay scroll horizontal de la página; solo de la fila de chips.

### Pendientes de decisión (resueltos al implementar; se pueden revisar)

- **Callejones sin salida:** se deshabilitan las opciones que darían 0 productos con los demás filtros y la búsqueda (sin conteos en los chips), y el estado vacío ofrece salidas para los links compartidos.
- **Categoría:** selección única, como hoy.
- **Buscador:** solo en `/catalogo`.

Preguntas originales:

- Evitar callejones sin salida: mostrar conteos en cada chip ("Usado · 1"), deshabilitar los que dan 0, o resolverlo solo con el estado vacío.
- Si Categoría admite selección múltiple.
- Cuándo llevar el buscador a todas las páginas (hoy solo catálogo).
