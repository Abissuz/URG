import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/firebase/config'
// 1. Importar las notificaciones necesarias
import { showInfoToast, showErrorToast } from '@/stores/notifications.js'

export const usePodcastStore = defineStore('podcasts', () => {
  const podcasts = ref([])
  const loading = ref(true)
  let unsubscribePodcasts = null
  // 2. Variable para controlar la carga inicial
  const isInitialLoad = ref(true)

  const listenForPodcasts = () => {
    if (unsubscribePodcasts) return

    loading.value = true
    const podcastsCollection = collection(db, 'podcasts')
    const q = query(podcastsCollection)

    unsubscribePodcasts = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedPodcasts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        fetchedPodcasts.sort((a, b) => a.title.localeCompare(b.title))
        podcasts.value = fetchedPodcasts
        loading.value = false

        // 3. Lógica de notificación de actualización
        if (isInitialLoad.value) {
          isInitialLoad.value = false
        } else {
          showInfoToast('La lista de podcasts ha sido actualizada')
        }
      },
      (error) => {
        console.error('Error escuchando los podcasts:', error)
        // 4. Notificación de error
        showErrorToast('No se pudieron cargar los podcasts')
        loading.value = false
      },
    )
  }

  const initialize = () => {
    listenForPodcasts()
  }

  return { podcasts, loading, initialize }
})
