import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

export const usePodcastStore = defineStore('podcasts', () => {
  const podcasts = ref([])
  const loading = ref(true) // Cambiado a true para mostrar el spinner inicial

  const fetchPodcasts = async () => {
    if (podcasts.value.length > 0) return
    loading.value = true
    try {
      const querySnapshot = await getDocs(collection(db, 'podcasts'))
      podcasts.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching podcasts:', error)
    } finally {
      loading.value = false
    }
  }

  // Llama a la función para obtener los datos cuando el store se usa por primera vez.
  onMounted(() => {
    fetchPodcasts()
  })

  return { podcasts, loading, fetchPodcasts }
})
