# Análisis UX/UI de Kamae

2026-11-23 · Cristian

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
