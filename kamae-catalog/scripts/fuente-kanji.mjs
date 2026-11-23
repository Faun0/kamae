// Genera src/fuente-kanji.css: solo los fragmentos de Noto Serif JP (peso 400) que cubren
// los caracteres japoneses usados en src/ e index.html.
//
// Por qué: el CSS completo de @fontsource/noto-serif-jp declara ~120 fragmentos por peso
// y suma ~200 kB de CSS que bloquea el render, para usar apenas un puñado de kanji.
// Uso: `npm run fuente:kanji` cada vez que se agregue un kanji/kana nuevo al sitio.
// (Si no se regenera, ese carácter se ve con la fuente japonesa del sistema: no se rompe.)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PESO = '400'
const PAQUETE = 'node_modules/@fontsource/noto-serif-jp'
const SALIDA = 'src/fuente-kanji.css'

const esJapones = (cp) =>
  (cp >= 0x3040 && cp <= 0x30ff) || // hiragana y katakana
  (cp >= 0x3400 && cp <= 0x9fff) // kanji (CJK)

function archivosFuente(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name)
    if (e.isDirectory()) return archivosFuente(ruta)
    return /\.(jsx?|html)$/.test(e.name) ? [ruta] : []
  })
}

const caracteres = new Set()
for (const archivo of [...archivosFuente('src'), 'index.html']) {
  for (const ch of readFileSync(archivo, 'utf8')) {
    if (esJapones(ch.codePointAt(0))) caracteres.add(ch)
  }
}

const cubre = (rango, cp) =>
  rango.split(',').some((parte) => {
    const [desde, hasta] = parte.trim().replace(/U\+/i, '').split('-').map((x) => parseInt(x, 16))
    return cp >= desde && cp <= (hasta ?? desde)
  })

const css = readFileSync(`${PAQUETE}/${PESO}.css`, 'utf8')
const bloques = css.match(/@font-face\s*{[^}]*}/g) ?? []
const elegidos = new Map() // bloque → caracteres que cubre

for (const ch of caracteres) {
  const cp = ch.codePointAt(0)
  const bloque = bloques.find((b) => {
    const rango = /unicode-range:\s*([^;]+);/.exec(b)?.[1]
    return rango && cubre(rango, cp)
  })
  if (bloque) elegidos.set(bloque, (elegidos.get(bloque) ?? '') + ch)
  else console.warn(`⚠ Sin fragmento para "${ch}"`)
}

// Las rutas ./files/... del paquete se reescriben relativas a src/ para que Vite las empaquete.
const salida = [
  '/* GENERADO por scripts/fuente-kanji.mjs (npm run fuente:kanji). No editar a mano. */',
  `/* Caracteres: ${[...caracteres].join(' ')} */`,
  ...[...elegidos].map(
    ([bloque, chars]) =>
      `/* ${chars} */\n${bloque.replaceAll('./files/', `../${PAQUETE}/files/`)}`,
  ),
  '',
].join('\n')

writeFileSync(SALIDA, salida)
console.log(`✔ ${SALIDA}: ${elegidos.size} fragmentos para ${caracteres.size} caracteres (${[...caracteres].join(' ')})`)
