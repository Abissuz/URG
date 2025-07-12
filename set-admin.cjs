// functions/set-admin.js

const admin = require('firebase-admin')

// IMPORTANTE: Usa la ruta correcta a tu archivo de "llave maestra"
// El que me mostraste antes se llamaba 'unimar-radio-global-firebase-adminsdk-....json'
const serviceAccount = require('./unimar-radio-global-firebase-adminsdk-fbsvc-efa6e925a9.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

// --- ¡Pega tu UID aquí! ---
const uid = '7qKV0p8Wppd5NFZz7yfLf4Qepu22'

// Este script asigna el Custom Claim 'admin' al usuario especificado
admin
  .auth()
  .setCustomUserClaims(uid, { rol: 'admin' })
  .then(() => {
    console.log(`\n¡Éxito! Se asignó el rol de 'admin' al usuario: ${uid}`)
    console.log('Ahora debes actualizar el rol también en la base de datos de Firestore.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nError al asignar el rol:', error)
    process.exit(1)
  })
