// functions/index.js - VERSIÓN FINAL Y COMPLETA

const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

initializeApp()

// --- Función del Dashboard ---
exports.getDashboardStats = onCall(async (request) => {
  // 1. Verificación de seguridad
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Petición no autenticada.')
  }
  const db = getFirestore()
  const adminUserDoc = await db.collection('users').doc(request.auth.uid).get()
  if (adminUserDoc.data().rol !== 'admin') {
    throw new HttpsError('permission-denied', 'Permiso denegado.')
  }

  // 2. Lógica principal de la función
  try {
    const [usersSnapshot, podcastsSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('podcasts').get(),
    ])

    const allUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    let adminCount = 0
    let moderatorCount = 0
    const moderatorEmails = []
    allUsers.forEach((user) => {
      if (user.rol === 'admin') adminCount++
      if (user.rol === 'moderador') {
        moderatorCount++
        moderatorEmails.push(user.email)
      }
    })

    const podcastDetailsPromises = podcastsSnapshot.docs.map(async (podcastDoc) => {
      const podcastData = podcastDoc.data()

      // Obtenemos los episodios y los ordenamos por número de episodio
      const episodesQuery = podcastDoc.ref.collection('episodes').orderBy('episodeNumber', 'asc')
      const episodesSnapshot = await episodesQuery.get()

      let totalComments = 0
      const episodeDetailsPromises = episodesSnapshot.docs.map(async (episodeDoc) => {
        const episodeData = episodeDoc.data()
        const commentsSnapshot = await episodeDoc.ref.collection('comments').get()
        const commentCount = commentsSnapshot.size
        totalComments += commentCount

        let favoriteCount = 0
        allUsers.forEach((user) => {
          if (user.favoritos?.episodios?.some((fav) => fav.id === episodeDoc.id)) {
            favoriteCount++
          }
        })

        return {
          id: episodeDoc.id,
          title: episodeData.title,
          commentCount,
          favoriteCount,
          commentsEnabled: episodeData.commentsEnabled,
        }
      })

      const episodes = await Promise.all(episodeDetailsPromises)

      let totalFavorites = 0
      allUsers.forEach((user) => {
        if (user.favoritos?.podcasts?.includes(podcastDoc.id)) {
          totalFavorites++
        }
      })

      return {
        id: podcastDoc.id,
        title: podcastData.title,
        host: podcastData.host,
        totalEpisodes: episodes.length,
        totalComments,
        totalFavorites,
        episodes,
      }
    })

    const podcastDetails = await Promise.all(podcastDetailsPromises)

    // 3. Devolvemos el objeto completo con todos los datos
    return {
      totalUsers: allUsers.length,
      adminCount,
      moderatorCount,
      moderatorEmails,
      totalPodcasts: podcastsSnapshot.size,
      podcastDetails,
    }
  } catch (error) {
    console.error('Error en getDashboardStats:', error)
    throw new HttpsError('internal', 'Error interno del servidor al procesar las estadísticas.')
  }
})

// --- Función para obtener todos los usuarios ---
exports.getAllUsers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Petición no autenticada.')
  }
  const db = getFirestore()
  const adminUserDoc = await db.collection('users').doc(request.auth.uid).get()
  if (adminUserDoc.data().rol !== 'admin') {
    throw new HttpsError('permission-denied', 'Permiso denegado.')
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
    throw new HttpsError('internal', 'Error al obtener la lista de usuarios.')
  }
})

// --- Función para actualizar el rol ---
exports.updateUserRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Petición no autenticada.')
  }
  const db = getFirestore()
  const adminUserDoc = await db.collection('users').doc(request.auth.uid).get()
  if (adminUserDoc.data().rol !== 'admin') {
    throw new HttpsError('permission-denied', 'Permiso denegado.')
  }

  const { uid, nuevoRol } = request.data
  if (!uid || !nuevoRol) {
    throw new HttpsError('invalid-argument', "Faltan argumentos 'uid' o 'nuevoRol'.")
  }
  const rolesPermitidos = ['admin', 'moderador', 'user']
  if (!rolesPermitidos.includes(nuevoRol)) {
    throw new HttpsError('invalid-argument', 'El rol asignado no es válido.')
  }

  const esAutoModificacion = request.auth.uid === uid
  const estaRenunciando = adminUserDoc.data().rol === 'admin' && nuevoRol !== 'admin'

  if (esAutoModificacion && estaRenunciando) {
    const adminsQuery = db.collection('users').where('rol', '==', 'admin')
    const adminsSnapshot = await adminsQuery.get()
    if (adminsSnapshot.size <= 1) {
      throw new HttpsError(
        'failed-precondition',
        'No puedes quitarte el rol porque eres el único administrador. Primero, asciende a otro usuario.',
      )
    }
  }

  try {
    const userRef = db.collection('users').doc(uid)
    await userRef.update({ rol: nuevoRol })
    return { success: true, message: `Rol del usuario ${uid} actualizado a ${nuevoRol}.` }
  } catch (error) {
    console.error(`Error al actualizar rol para ${uid}:`, error)
    throw new HttpsError('internal', `Error al actualizar el rol para el usuario ${uid}.`)
  }
})
