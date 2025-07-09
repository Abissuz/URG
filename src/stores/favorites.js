import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
// 1. Importar las notificaciones
import { showSuccessToast, showErrorToast } from '@/stores/notifications.js'

export const useFavoritesStore = defineStore('favorites', () => {
  // --- ESTADO ---
  const favoritePodcasts = ref(new Set())
  const favoriteEpisodes = ref([])
  const loading = ref(true)
  const userId = ref(null)
  let unsubscribeFavorites = null

  // --- ACCIONES ---
  const listenForFavorites = (uid) => {
    if (unsubscribeFavorites) {
      unsubscribeFavorites()
    }
    if (!uid) {
      favoritePodcasts.value.clear()
      favoriteEpisodes.value = []
      loading.value = false
      return
    }

    loading.value = true
    const userDocRef = doc(db, 'users', uid)

    unsubscribeFavorites = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().favoritos) {
          const favs = docSnap.data().favoritos
          favoritePodcasts.value = new Set(favs.podcasts || [])
          favoriteEpisodes.value = favs.episodios || []
        } else {
          favoritePodcasts.value.clear()
          favoriteEpisodes.value = []
        }
        loading.value = false
      },
      (error) => {
        console.error('Error escuchando los favoritos:', error)
        // 2. Notificación si falla la carga de favoritos
        showErrorToast('No se pudieron cargar tus favoritos')
        loading.value = false
      },
    )
  }

  // 3. Modificado para añadir notificaciones
  const togglePodcastFavorite = async (podcastId, podcastTitle) => {
    if (!userId.value) return
    const userDocRef = doc(db, 'users', userId.value)
    const isCurrentlyFavorite = favoritePodcasts.value.has(podcastId)

    try {
      if (isCurrentlyFavorite) {
        await updateDoc(userDocRef, { 'favoritos.podcasts': arrayRemove(podcastId) })
        showSuccessToast(`'${podcastTitle}' eliminado de favoritos`)
      } else {
        await updateDoc(userDocRef, { 'favoritos.podcasts': arrayUnion(podcastId) })
        showSuccessToast(`'${podcastTitle}' añadido a favoritos`)
      }
    } catch (error) {
      console.error('Error al actualizar favoritos de podcast:', error)
      showErrorToast('No se pudo actualizar tus favoritos')
    }
  }

  // 4. Modificado para añadir notificaciones
  const toggleEpisodeFavorite = async (podcastId, episode) => {
    if (!userId.value || !episode.id) return
    const userDocRef = doc(db, 'users', userId.value)
    const existingEpisode = favoriteEpisodes.value.find((fav) => fav.id === episode.id)

    try {
      if (existingEpisode) {
        await updateDoc(userDocRef, { 'favoritos.episodios': arrayRemove(existingEpisode) })
        showSuccessToast(`Episodio eliminado de favoritos`)
      } else {
        const episodeToSave = { ...episode, podcastId: podcastId }
        await updateDoc(userDocRef, { 'favoritos.episodios': arrayUnion(episodeToSave) })
        showSuccessToast(`Episodio añadido a favoritos`)
      }
    } catch (error) {
      console.error('Error al actualizar favoritos de episodio:', error)
      showErrorToast('No se pudo actualizar tus favoritos')
    }
  }

  const isPodcastFavorite = (podcastId) => favoritePodcasts.value.has(podcastId)
  const isEpisodeFavorite = (episodeId) =>
    favoriteEpisodes.value.some((fav) => fav.id === episodeId)

  onAuthStateChanged(auth, (user) => {
    userId.value = user ? user.uid : null
    listenForFavorites(userId.value)
  })

  return {
    favoritePodcasts,
    favoriteEpisodes,
    loading,
    togglePodcastFavorite,
    toggleEpisodeFavorite,
    isPodcastFavorite,
    isEpisodeFavorite,
  }
})
