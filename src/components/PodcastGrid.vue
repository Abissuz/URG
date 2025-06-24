<template>
  <div class="podcast-grid-container">
    <div v-if="podcastStore.loading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
    </div>
    <div v-else-if="filteredPodcasts.length === 0" class="text-center py-5">
      <p class="text-muted">No se encontraron podcasts con tu búsqueda.</p>
    </div>
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="podcast in filteredPodcasts" :key="podcast.id" class="col">
        <div class="card h-100 shadow-sm video-card">
          <router-link :to="`/podcast/${podcast.id}`" class="text-decoration-none">
            <img :src="podcast.coverImage" class="card-img-top" :alt="podcast.title" />
          </router-link>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title text-primary mb-0">
                <router-link
                  :to="`/podcast/${podcast.id}`"
                  class="text-decoration-none text-primary"
                  >{{ podcast.title }}</router-link
                >
              </h5>
              <!-- Botón de Favorito -->
              <button
                @click.stop="favoritesStore.togglePodcastFavorite(podcast.id)"
                class="btn-favorite"
              >
                <i
                  :class="[
                    'fas',
                    'fa-heart',
                    { 'is-favorite': favoritesStore.isPodcastFavorite(podcast.id) },
                  ]"
                ></i>
              </button>
            </div>
            <p class="card-text text-muted small mt-2">
              {{ truncateDescription(podcast.description) }}
            </p>
          </div>
          <div class="card-footer bg-transparent border-top-0">
            <small class="text-muted">Presentado por: {{ podcast.host.name }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePodcastStore } from '@/stores/counter'
import { useFavoritesStore } from '@/stores/favorites' // Se importa el nuevo store

const props = defineProps({ searchQuery: { type: String, default: '' } })
const podcastStore = usePodcastStore()
const favoritesStore = useFavoritesStore() // Se inicializa el nuevo store

const filteredPodcasts = computed(() => {
  if (!props.searchQuery.trim()) return podcastStore.podcasts
  const query = props.searchQuery.toLowerCase()
  return podcastStore.podcasts.filter((p) => p.title.toLowerCase().includes(query))
})

const truncateDescription = (desc) =>
  desc && desc.length > 100 ? `${desc.substring(0, 100)}...` : desc
</script>

<style scoped>
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

.card-title {
  color: #f8f9fa;
}
.text-primary {
  color: #0d4d98 !important;
}
/* Estos estilos son heredados del componente principal, pero puedes añadir específicos si lo necesitas */
.video-card {
  border: 1px solid #343a405e;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}
.video-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-title {
  color: #f8f9fa;
}
.card-title:hover {
  color: #ff8a00 !important;
}
.text-primary {
  color: #0d4d98 !important;
}
</style>
