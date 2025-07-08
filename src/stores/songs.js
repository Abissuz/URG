// src/stores/songs.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'

export const useSongStore = defineStore('songs', () => {
  // --- ESTADO ---
  const songs = ref([])
  const isLoading = ref(false)
  // Guarda el timestamp de la última petición de un usuario para una canción específica
  // Formato: { songId1: 1678886400000, songId2: 1678886500000 }
  const lastRequestTimestamps = ref({})

  // --- ACCIONES ---

  /**
   * Obtiene la lista completa de canciones desde Firestore y la guarda en el estado.
   */
  const fetchSongs = async () => {
    // Evita volver a cargar si ya las tenemos
    if (songs.value.length > 0) return

    isLoading.value = true
    try {
      const songsCollection = collection(db, 'songs')
      const querySnapshot = await getDocs(songsCollection)
      const fetchedSongs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Ordena las canciones alfabéticamente por título
      songs.value = fetchedSongs.sort((a, b) => a.title.localeCompare(b.title))
    } catch (error) {
      console.error('Error al obtener las canciones:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Registra la petición de una canción por parte de un usuario.
   * Incluye la lógica de cooldown de 10 minutos.
   * @param {string} songId - El ID de la canción solicitada.
   * @param {string} songTitle - El título de la canción solicitada.
   */
  // Dentro de src/stores/songs.js

  // REEMPLAZA TU FUNCIÓN requestSong ACTUAL POR ESTA:
  const requestSong = async (song) => {
    // Ahora recibe el objeto 'song' completo
    const authStore = useAuthStore()
    const userId = authStore.user ? authStore.user.uid : 'anonymous'

    const now = Date.now()
    const lastRequestTime = lastRequestTimestamps.value[song.id]
    const tenMinutesInMillis = 10 * 60 * 1000

    if (lastRequestTime && now - lastRequestTime < tenMinutesInMillis) {
      alert(`¡Petición recibida! Ya has solicitado "${song.title}" hace poco.`)
      return
    }

    try {
      await addDoc(collection(db, 'song_requests'), {
        songId: song.id,
        songTitle: song.title,
        artist: song.artist, // [NUEVO] Guardamos también el artista
        userId,
        timestamp: serverTimestamp(),
      })

      lastRequestTimestamps.value[song.id] = now
      alert(`¡Gracias por tu petición para "${song.title}"! Se ha enviado a la radio.`)
    } catch (error) {
      console.error('Error al registrar la petición:', error)
      alert('Ocurrió un error al enviar tu petición. Por favor, inténtalo de nuevo.')
    }
  }

  return {
    songs,
    isLoading,
    fetchSongs,
    requestSong,
  }
})
