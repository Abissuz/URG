import { defineStore } from 'pinia'
import { ref } from 'vue'
// [MODIFICADO] Se importa 'onSnapshot' y se quita 'getDocs'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/firebase/config'

export const usePodcastStore = defineStore('podcasts', () => {
  const podcasts = ref([])
  const loading = ref(true)
  let unsubscribePodcasts = null // Variable para manejar la des-suscripción

  const listenForPodcasts = () => {
    // Si ya estamos escuchando, no hacemos nada para evitar duplicados.
    if (unsubscribePodcasts) return

    loading.value = true
    const podcastsCollection = collection(db, 'podcasts')
    const q = query(podcastsCollection)

    // [MODIFICADO] Se establece el listener en tiempo real con onSnapshot
    unsubscribePodcasts = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedPodcasts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Se ordenan los podcasts alfabéticamente para mantener la consistencia
        fetchedPodcasts.sort((a, b) => a.title.localeCompare(b.title))

        podcasts.value = fetchedPodcasts
        loading.value = false
      },
      (error) => {
        console.error('Error escuchando los podcasts:', error)
        loading.value = false
      },
    )
  }

  // [MODIFICADO] La acción ahora se asegura de que el listener se inicie.
  // La llamaremos desde App.vue para que los datos estén disponibles en toda la app.
  const initialize = () => {
    listenForPodcasts()
  }

  return { podcasts, loading, initialize }
})
