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
            <div class="d-flex align-items-center gap-3">
              <button
                @click.stop="favoritesStore.toggleEpisodeFavorite(podcastId, episode)"
                class="btn-favorite"
              >
                <i
                  :class="[
                    'fas',
                    'fa-heart',
                    { 'is-favorite': favoritesStore.isEpisodeFavorite(episode.id) },
                  ]"
                ></i>
              </button>
              <button @click="playEpisode(episode)" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-play me-2"></i>Reproducir
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="alert alert-warning">Podcast no encontrado.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { usePlayerStore } from '@/stores/player'
import { usePodcastStore } from '@/stores/counter'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const playerStore = usePlayerStore()
const podcastStore = usePodcastStore()
const favoritesStore = useFavoritesStore()

const episodes = ref([])
const loading = ref(true)
const podcastId = route.params.id
let unsubscribeEpisodes = null

const podcast = computed(() => podcastStore.podcasts.find((p) => p.id === podcastId))
const playEpisode = (episode) => playerStore.playOnDemandTrack(episode)

onMounted(async () => {
  if (podcastStore.podcasts.length === 0) {
    await podcastStore.fetchPodcasts()
  }

  try {
    const episodesCol = collection(db, 'podcasts', podcastId, 'episodes')
    const q = query(episodesCol)

    unsubscribeEpisodes = onSnapshot(q, (episodesSnapshot) => {
      const fetchedEpisodes = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // [NUEVO] Se ordenan los episodios alfabéticamente por título en el lado del cliente.
      // Esto asegura que todos los episodios se muestren, independientemente de sus campos,
      // y se presenten en un orden consistente.
      fetchedEpisodes.sort((a, b) => a.title.localeCompare(b.title))

      episodes.value = fetchedEpisodes
      loading.value = false
    })
  } catch (error) {
    console.error('Error fetching episodes:', error)
    loading.value = false
  }
})

onUnmounted(() => {
  if (unsubscribeEpisodes) {
    unsubscribeEpisodes()
  }
})
</script>

<style scoped>
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
.btn-favorite {
  background: none;
  border: none;
  color: #adb5bd;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  transition:
    color 0.2s,
    transform 0.2s;
}
.btn-favorite:hover {
  color: #ff4d6d;
}
.btn-favorite .is-favorite {
  color: #ff4d6d;
  animation: bounce 0.3s ease;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>
