import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
// [NUEVO] Se importa 'onSnapshot'
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  onSnapshot,
} from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

export const useFavoritesStore = defineStore('favorites', () => {
  // --- ESTADO ---
  const favoritePodcasts = ref(new Set())
  const favoriteEpisodes = ref([])
  const loading = ref(true)
  const userId = ref(null)
  let unsubscribeFavorites = null // [NUEVO] Para guardar la función de des-suscripción

  // --- ACCIONES ---

  // [MODIFICADO] Esta función ahora se llama 'listenForFavorites' para reflejar su nueva naturaleza
  const listenForFavorites = (uid) => {
    // Si ya hay una suscripción activa, la cancelamos para evitar duplicados
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

    // [MODIFICADO] Se reemplaza getDoc con onSnapshot
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
          // Si el documento no existe, se puede crear aquí si es necesario
          // setDoc(userDocRef, { favoritos: { podcasts: [], episodios: [] } }, { merge: true });
        }
        loading.value = false
      },
      (error) => {
        console.error('Error escuchando los favoritos:', error)
        loading.value = false
      },
    )
  }

  const togglePodcastFavorite = async (podcastId) => {
    if (!userId.value) return
    const userDocRef = doc(db, 'users', userId.value)

    if (favoritePodcasts.value.has(podcastId)) {
      await updateDoc(userDocRef, { 'favoritos.podcasts': arrayRemove(podcastId) })
      // No es necesario actualizar el estado local, onSnapshot lo hará
    } else {
      await updateDoc(userDocRef, { 'favoritos.podcasts': arrayUnion(podcastId) })
      // No es necesario actualizar el estado local, onSnapshot lo hará
    }
  }

  const toggleEpisodeFavorite = async (podcastId, episode) => {
    if (!userId.value || !episode.id) return
    const userDocRef = doc(db, 'users', userId.value)

    // Es crucial que el objeto que guardamos y el que eliminamos sean idénticos.
    // Buscamos el episodio exacto en el estado local para asegurar consistencia.
    const existingEpisode = favoriteEpisodes.value.find((fav) => fav.id === episode.id)

    if (existingEpisode) {
      await updateDoc(userDocRef, { 'favoritos.episodios': arrayRemove(existingEpisode) })
      // No es necesario actualizar el estado local, onSnapshot lo hará
    } else {
      const episodeToSave = { ...episode, podcastId: podcastId }
      await updateDoc(userDocRef, { 'favoritos.episodios': arrayUnion(episodeToSave) })
      // No es necesario actualizar el estado local, onSnapshot lo hará
    }
  }

  const isPodcastFavorite = (podcastId) => favoritePodcasts.value.has(podcastId)
  const isEpisodeFavorite = (episodeId) =>
    favoriteEpisodes.value.some((fav) => fav.id === episodeId)

  // [MODIFICADO] onAuthStateChanged ahora llama a la nueva función de escucha
  onAuthStateChanged(auth, (user) => {
    userId.value = user ? user.uid : null
    listenForFavorites(userId.value) // Se establece o se limpia el listener
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
