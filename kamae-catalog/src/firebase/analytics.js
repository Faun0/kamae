import { app, usarEmuladores } from './app.js'

// Analytics se carga bajo demanda y solo en producción con measurementId configurado.
let analyticsPromise

function cargarAnalytics() {
  if (usarEmuladores || !app.options.measurementId) return Promise.resolve(null)

  analyticsPromise ??= import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported, logEvent }) =>
      (await isSupported()) ? { analytics: getAnalytics(app), logEvent } : null,
    )
    .catch(() => null)

  return analyticsPromise
}

export async function registrarEvento(nombre, params) {
  const sdk = await cargarAnalytics()
  if (sdk) sdk.logEvent(sdk.analytics, nombre, params)
  else if (import.meta.env.DEV) console.debug('[analytics]', nombre, params)
}
