// src/stores/songs.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './auth'

// 1. Se añaden todas las notificaciones necesarias
import { showSuccessToast, showErrorToast, showWarningToast } from '@/stores/notifications.js'

export const useSongStore = defineStore('songs', () => {
  // --- ESTADO ---
  const songs = ref([])
  const isLoading = ref(false)
  const lastRequestTimestamps = ref({})

  // --- ACCIONES ---

  const fetchSongs = async () => {
    if (songs.value.length > 0) return
    isLoading.value = true
    try {
      const songsCollection = collection(db, 'songs')
      const querySnapshot = await getDocs(songsCollection)
      const fetchedSongs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      songs.value = fetchedSongs.sort((a, b) => a.title.localeCompare(b.title))
    } catch (error) {
      console.error('Error al obtener las canciones:', error)
      showErrorToast('No se pudieron cargar las canciones') // [NUEVO] Notificación de error
    } finally {
      isLoading.value = false
    }
  }

  const requestSong = async (song) => {
    const authStore = useAuthStore()
    const userId = authStore.user ? authStore.user.uid : 'anonymous'
    const now = Date.now()
    const lastRequestTime = lastRequestTimestamps.value[song.id]
    const tenMinutesInMillis = 10 * 60 * 1000

    if (lastRequestTime && now - lastRequestTime < tenMinutesInMillis) {
      // 2. Se reemplaza alert por showWarningToast
      showWarningToast(`Ya solicitaste "${song.title}" hace poco`)
      return
    }

    try {
      await addDoc(collection(db, 'song_requests'), {
        songId: song.id,
        songTitle: song.title,
        artist: song.artist,
        userId,
        timestamp: serverTimestamp(),
      })

      lastRequestTimestamps.value[song.id] = now
      // 3. Se reemplaza alert por showSuccessToast
      showSuccessToast(`¡Petición para "${song.title}" recibida!`)
    } catch (error) {
      console.error('Error al registrar la petición:', error)
      // 4. Se reemplaza alert por showErrorToast
      showErrorToast('Ocurrió un error al enviar tu petición')
    }
  }

  return {
    songs,
    isLoading,
    fetchSongs,
    requestSong,
  }
})
