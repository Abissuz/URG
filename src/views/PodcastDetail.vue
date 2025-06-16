<template>
  <div class="podcast-detail-container py-4">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="podcast" class="container">
      <div class="row">
        <div class="col-md-4 text-center">
          <img :src="podcast.coverImage" class="img-fluid rounded shadow-lg" :alt="podcast.title" />
        </div>
        <div class="col-md-8">
          <h1 class="display-5 fw-bold text-primary">{{ podcast.title }}</h1>
          <p class="lead">{{ podcast.host.name }}</p>
          <hr />
          <p>{{ podcast.description }}</p>
        </div>
      </div>

      <div class="mt-5">
        <h3 class="mb-4">Episodios</h3>
        <ul class="list-group">
          <li
            v-for="episode in episodes"
            :key="episode.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{{ episode.title }}</span>
            <button @click="playEpisode(episode)" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-play me-2"></i>Reproducir
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="alert alert-warning">Podcast no encontrado.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { usePlayerStore } from '@/stores/player'
import { usePodcastStore } from '@/stores/counter'

const route = useRoute()
const playerStore = usePlayerStore()
const podcastStore = usePodcastStore()

const episodes = ref([])
const loading = ref(true)
const podcastId = route.params.id

const podcast = computed(() => {
  return podcastStore.podcasts.find((p) => p.id === podcastId)
})

// ¡FUNCIÓN CORREGIDA!
const playEpisode = (episode) => {
  playerStore.playOnDemandTrack(episode)
}

onMounted(async () => {
  // Asegurarse de que los podcasts estén cargados antes de continuar
  if (podcastStore.podcasts.length === 0) {
    await podcastStore.fetchPodcasts()
  }

  try {
    const episodesCol = collection(db, 'podcasts', podcastId, 'episodes')
    const q = query(episodesCol, orderBy('publishDate', 'desc'))
    const episodesSnapshot = await getDocs(q)
    episodes.value = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching episodes:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.podcast-detail-container {
  color: #333;
}
.img-fluid {
  max-height: 350px;
  border-radius: 1rem !important;
}
.text-primary {
  color: #0d4d98 !important;
}
.list-group-item {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}
.btn-outline-primary {
  color: #0d4d98;
  border-color: #0d4d98;
}
.btn-outline-primary:hover {
  background-color: #0d4d98;
  color: white;
}
</style>
