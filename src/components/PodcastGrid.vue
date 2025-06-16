<template>
  <div class="podcast-grid-container">
    <!-- Estado de carga -->
    <div v-if="podcastStore.loading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
      <p class="mt-2">Cargando podcasts...</p>
    </div>

    <!-- Mensaje si no hay resultados -->
    <div v-else-if="filteredPodcasts.length === 0" class="text-center py-5">
      <p class="text-muted">No se encontraron podcasts con tu búsqueda.</p>
    </div>

    <!-- Cuadrícula de Podcasts -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="podcast in filteredPodcasts" :key="podcast.id" class="col">
        <!-- Cada tarjeta de podcast podría ser un enlace a su propia página de detalle en el futuro -->
        <router-link :to="`/podcast/${podcast.id}`" class="text-decoration-none">
          <div class="card h-100 shadow-sm video-card">
            <img :src="podcast.coverImage" class="card-img-top" :alt="podcast.title" />
            <div class="card-body">
              <h5 class="card-title text-primary">{{ podcast.title }}</h5>
              <p class="card-text text-muted small">
                {{ truncateDescription(podcast.description) }}
              </p>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <small class="text-muted">Presentado por: {{ podcast.host.name }}</small>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePodcastStore } from '@/stores/counter' // Asegúrate que esta ruta es correcta

// Definimos las props que este componente espera recibir del padre
const props = defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const podcastStore = usePodcastStore()

// Filtra los podcasts basándose en la búsqueda del componente padre
const filteredPodcasts = computed(() => {
  if (!props.searchQuery.trim()) {
    return podcastStore.podcasts
  }
  const query = props.searchQuery.toLowerCase()
  return podcastStore.podcasts.filter((podcast) => podcast.title.toLowerCase().includes(query))
})

const truncateDescription = (desc) => {
  if (!desc) return ''
  return desc.length > 100 ? `${desc.substring(0, 100)}...` : desc
}
</script>

<style scoped>
/* Estos estilos son heredados del componente principal, pero puedes añadir específicos si lo necesitas */
.video-card {
  background-color: #212529;
  border: 1px solid #343a40;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}
.video-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}
.card-img-top {
  aspect-ratio: 16 / 9;
  object-fit: cover;
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
