import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

export const useFavoritesStore = defineStore('favorites', () => {
  // --- ESTADO ---
  const favoritePodcasts = ref(new Set())
  const favoriteEpisodes = ref([]) // Un array de objetos de episodio completos
  const loading = ref(true)
  const userId = ref(null)

  // --- ACCIONES ---
  const fetchFavorites = async (uid) => {
    if (!uid) {
      favoritePodcasts.value.clear()
      favoriteEpisodes.value = []
      loading.value = false
      return
    }
    loading.value = true
    const userDocRef = doc(db, 'users', uid)
    const docSnap = await getDoc(userDocRef)

    if (docSnap.exists() && docSnap.data().favoritos) {
      const favs = docSnap.data().favoritos
      favoritePodcasts.value = new Set(favs.podcasts || [])
      favoriteEpisodes.value = favs.episodios || []
    } else {
      favoritePodcasts.value.clear()
      favoriteEpisodes.value = []
      await setDoc(userDocRef, { favoritos: { podcasts: [], episodios: [] } }, { merge: true })
    }
    loading.value = false
  }

  const togglePodcastFavorite = async (podcastId) => {
    if (!userId.value) return
    const userDocRef = doc(db, 'users', userId.value)

    if (favoritePodcasts.value.has(podcastId)) {
      await updateDoc(userDocRef, { 'favoritos.podcasts': arrayRemove(podcastId) })
      favoritePodcasts.value.delete(podcastId)
    } else {
      await updateDoc(userDocRef, { 'favoritos.podcasts': arrayUnion(podcastId) })
      favoritePodcasts.value.add(podcastId)
    }
  }

  // ¡LÓGICA CORREGIDA PARA GUARDAR EPISODIOS!
  const toggleEpisodeFavorite = async (podcastId, episode) => {
    if (!userId.value || !episode.id) return
    const userDocRef = doc(db, 'users', userId.value)

    // Añadimos el ID del podcast al objeto del episodio para futuras referencias
    const episodeToSave = { ...episode, podcastId: podcastId }

    const existingIndex = favoriteEpisodes.value.findIndex((fav) => fav.id === episode.id)

    if (existingIndex > -1) {
      const episodeToRemove = favoriteEpisodes.value[existingIndex]
      await updateDoc(userDocRef, { 'favoritos.episodios': arrayRemove(episodeToRemove) })
      favoriteEpisodes.value.splice(existingIndex, 1)
    } else {
      await updateDoc(userDocRef, { 'favoritos.episodios': arrayUnion(episodeToSave) })
      favoriteEpisodes.value.push(episodeToSave)
    }
  }

  const isPodcastFavorite = (podcastId) => favoritePodcasts.value.has(podcastId)
  const isEpisodeFavorite = (episodeId) =>
    favoriteEpisodes.value.some((fav) => fav.id === episodeId)

  onAuthStateChanged(auth, (user) => {
    userId.value = user ? user.uid : null
    fetchFavorites(userId.value)
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
