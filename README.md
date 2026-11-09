# Kamae 構え

Catálogo web de equipamiento para **Kendo e Iaido** (shinai, bokken, iaito, tsubas impresas en 3D, indumentaria y accesorios), pensado para **revender de forma local**.

**Sitio:** https://kamae-ar.web.app

## La idea

Kamae no tiene carrito ni pasarela de pago. Funciona como una vidriera: el comprador elige el producto y **contacta directamente al vendedor por WhatsApp**, con un mensaje que ya incluye el producto, la variante, el precio y el link. El pago, la entrega y cualquier duda se acuerdan en esa conversación.

- **Sin intermediarios ni comisiones:** no hay pagos online ni datos de tarjetas.
- **Contacto directo:** cada producto tiene el WhatsApp de quien lo vende, así que varios vendedores pueden publicar en el mismo catálogo.
- **Vendedores con aprobación:** cualquiera puede crear una cuenta de vendedor, pero solo publica cuando un administrador lo aprueba y verificó su email. Cada vendedor gestiona solo sus productos.
- **Lista de consulta:** el comprador puede juntar varios productos y mandarlos en un solo mensaje, uno por vendedor.
- **Panel de administración:** alta y edición de productos desde el celular, con fotos, variantes (talles o colores), precios en ARS o USD y disponibilidad (disponible, agotado o a pedido). Un producto se publica solo cuando está completo; si le falta algún dato, queda como borrador.

## Tecnología

React + Vite + Tailwind CSS · Firebase (Firestore, Authentication, Hosting) · Cloudinary para las imágenes · Deploy automático con GitHub Actions.

La seguridad está en las reglas de Firestore: el catálogo es de solo lectura para los visitantes y solo los administradores autorizados pueden escribir. Las reglas tienen tests automáticos que corren antes de cada deploy.

## Desarrollo local

Requisitos: Node 24+ y Java 21 (para los emuladores de Firebase).

```bash
cd kamae-catalog
npm install
npm run emulators   # terminal 1: Firestore + Auth locales
npm run seed        # terminal 2: datos de prueba
npm run dev         # terminal 2: http://localhost:5173
```

En desarrollo todo corre contra los emuladores, nunca contra producción. `npm run test:rules` corre los tests de seguridad.

## Normativa argentina a tener en cuenta

Aunque la venta se cierre por WhatsApp, ofrecer productos en un sitio web es una **venta a distancia**, y aplica la normativa de defensa del consumidor. Estos son los puntos que deberían estar presentes:

| Norma | Qué exige | Estado |
|---|---|---|
| **Ley 24.240** de Defensa del Consumidor | Información cierta, clara y detallada del producto y sus condiciones de venta (art. 4). Derecho a revocar la compra dentro de los **10 días** en ventas a distancia (art. 34). Garantía legal sobre lo vendido (art. 11). | Parcial: el catálogo muestra precio, disponibilidad y tiempos. Falta informar el derecho de revocación y la garantía. |
| **Res. SCI 424/2020** "Botón de arrepentimiento" | Un link visible en la página principal, rotulado **"Botón de arrepentimiento"**, para pedir la revocación sin registrarse. El proveedor debe responder con un código de trámite. | Pendiente |
| **Res. GMC Mercosur 21/2004** (comercio electrónico) | Mostrar los datos del proveedor: nombre o razón social, CUIT, domicilio y un medio de contacto. Las condiciones de venta tienen que poder consultarse. | Pendiente: hoy solo figura el WhatsApp de cada producto. |
| **Res. SC 7/2002** de exhibición de precios | Precio final, con impuestos incluidos, expresado en **moneda de curso legal (pesos)**. | A revisar: los productos cargados en USD deberían mostrar también su precio en pesos. |
| **ARCA (ex AFIP), RG 1415/2003**: "Data Fiscal" | Los sitios que venden bienes deben exhibir el código QR del **Formulario 960/D "Data Fiscal"**. | Pendiente: requiere estar inscripto en ARCA. |
| **Ley 25.326** de Protección de Datos Personales | Informar qué datos se recolectan y para qué (política de privacidad). | Parcial: el sitio no guarda datos de compradores, pero usa Google Analytics (cookies) y guarda la lista de consulta en el navegador. Falta el aviso. |

> Esta tabla es orientativa y no reemplaza el asesoramiento de un profesional. Antes de operar comercialmente, conviene validar con un contador (inscripción en ARCA y Data Fiscal) y un abogado (condiciones de venta y defensa del consumidor). Los requisitos también pueden variar según la provincia.
