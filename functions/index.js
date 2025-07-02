// functions/index.js - VERSIÓN FINAL CON LÓGICA DE "ÚLTIMO ADMIN"

const { onCall } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

initializeApp()

// --- Función del Dashboard (sin cambios) ---
exports.getDashboardStats = onCall(async (request) => {
  // ... (el código de esta función se mantiene igual)
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Petición no autenticada.')
  }
  const db = getFirestore()
  const adminUserDoc = await db.collection('users').doc(request.auth.uid).get()
  if (adminUserDoc.data().rol !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Permiso denegado.')
  }
  try {
    const usersSnapshot = await db.collection('users').get()
    const totalUsers = usersSnapshot.size
    let adminCount = 0,
      moderatorCount = 0
    const moderatorEmails = []
    usersSnapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.rol === 'admin') adminCount++
      if (userData.rol === 'moderador') {
        moderatorCount++
        moderatorEmails.push(userData.email)
      }
    })
    const podcastsSnapshot = await db.collection('podcasts').get()
    const totalPodcasts = podcastsSnapshot.size
    const podcastDetailsPromises = podcastsSnapshot.docs.map(async (podcastDoc) => {
      const episodesSnapshot = await podcastDoc.ref.collection('episodes').get()
      const commentPromises = episodesSnapshot.docs.map((doc) =>
        doc.ref.collection('comments').get(),
      )
      const commentSnapshots = await Promise.all(commentPromises)
      const commentCount = commentSnapshots.reduce((acc, snap) => acc + snap.size, 0)
      return { title: podcastDoc.data().title, episodeCount: episodesSnapshot.size, commentCount }
    })
    const podcastDetails = await Promise.all(podcastDetailsPromises)
    return {
      totalUsers,
      adminCount,
      moderatorCount,
      moderatorEmails,
      totalPodcasts,
      podcastDetails,
    }
  } catch (error) {
    console.error('Error en getDashboardStats:', error)
    throw new functions.https.HttpsError('internal', 'Error interno del servidor.')
  }
})

// --- Función para obtener todos los usuarios (sin cambios) ---
exports.getAllUsers = onCall(async (request) => {
  // ... (el código de esta función se mantiene igual)
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Petición no autenticada.')
  }
  const db = getFirestore()
  const adminUserDoc = await db.collection('users').doc(request.auth.uid).get()
  if (adminUserDoc.data().rol !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Permiso denegado.')
  }
  try {
    const listUsersResult = await getAuth().listUsers(1000)
    const userPromises = listUsersResult.users.map(async (userRecord) => {
      const userDoc = await db.collection('users').doc(userRecord.uid).get()
      const userRol = userDoc.exists && userDoc.data().rol ? userDoc.data().rol : 'user'
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'Sin nombre',
        rol: userRol,
      }
    })
    return await Promise.all(userPromises)
  } catch (error) {
    console.error('Error en getAllUsers:', error)
    throw new functions.https.HttpsError('internal', 'Error al obtener usuarios.')
  }
})

// --- [FUNCIÓN MEJORADA] Lógica para actualizar el rol ---
exports.updateUserRole = onCall(async (request) => {
  // 1. Seguridad básica (igual que antes)
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Petición no autenticada.')
  }
  const db = getFirestore()
  const adminUserDoc = await db.collection('users').doc(request.auth.uid).get()
  if (adminUserDoc.data().rol !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Permiso denegado.')
  }

  // 2. Validación de datos (igual que antes)
  const { uid, nuevoRol } = request.data
  if (!uid || !nuevoRol) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "Faltan argumentos 'uid' o 'nuevoRol'.",
    )
  }
  const rolesPermitidos = ['admin', 'moderador', 'user']
  if (!rolesPermitidos.includes(nuevoRol)) {
    throw new functions.https.HttpsError('invalid-argument', 'El rol asignado no es válido.')
  }

  // --- 3. Medida de seguridad INTELIGENTE: Regla del "Último Administrador" ---
  const esAutoModificacion = request.auth.uid === uid
  const estaRenunciando = adminUserDoc.data().rol === 'admin' && nuevoRol !== 'admin'

  if (esAutoModificacion && estaRenunciando) {
    console.log(
      `El admin ${request.auth.uid} intenta renunciar a su rol. Verificando si es el último...`,
    )
    const adminsQuery = db.collection('users').where('rol', '==', 'admin')
    const adminsSnapshot = await adminsQuery.get()

    if (adminsSnapshot.size <= 1) {
      // Si el conteo de admins es 1 o menos, es él mismo. Se bloquea la operación.
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No puedes quitarte el rol porque eres el único administrador. Primero, asciende a otro usuario.',
      )
    }
    console.log(`Verificación superada. Hay ${adminsSnapshot.size} administradores en total.`)
  }

  // 4. Lógica de actualización (igual que antes)
  try {
    const userRef = db.collection('users').doc(uid)
    await userRef.update({ rol: nuevoRol })
    return { success: true, message: `Rol del usuario ${uid} actualizado a ${nuevoRol}.` }
  } catch (error) {
    console.error(`Error al actualizar rol para ${uid}:`, error)
    throw new functions.https.HttpsError(
      'internal',
      `Error al actualizar el rol para el usuario ${uid}.`,
    )
  }
})
