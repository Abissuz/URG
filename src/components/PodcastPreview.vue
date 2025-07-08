<template>
  <div class="podcast-preview-container">
    <!-- Cabecera de la sección -->
    <div class="section-header">
      <h2 class="section-title">Últimos Podcasts</h2>
      <!-- [MODIFICADO] El enlace ahora incluye un parámetro para la vista -->
      <router-link to="/programas?view=podcasts" class="see-all-link">Ver todos &rarr;</router-link>
    </div>

    <!-- Estado de carga (usando el estado del store) -->
    <div v-if="podcastStore.loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Cuadrícula de podcasts -->
    <div v-else class="podcast-grid">
      <router-link
        v-for="podcast in limitedPodcasts"
        :key="podcast.id"
        :to="`/podcast/${podcast.id}`"
        class="text-decoration-none"
      >
        <div class="podcast-card">
          <img :src="podcast.coverImage" class="podcast-thumbnail" :alt="podcast.title" />
          <div class="podcast-info">
            <h6 class="podcast-title">{{ podcast.title }}</h6>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePodcastStore } from '@/stores/counter'

const podcastStore = usePodcastStore()

const limitedPodcasts = computed(() => {
  return podcastStore.podcasts.slice(0, 6)
})
</script>

<style scoped>
/* Tus estilos no necesitan cambios */
.podcast-preview-container {
  font-family: 'Sulphur Point', sans-serif;
  margin-top: 30px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #9b9b9b59;
  padding: 0 1.5rem;
}
.section-title {
  color: #0d4b94;
  font-weight: 700;
  font-size: 1.5rem;
}
.see-all-link {
  color: #0d4d98;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}
.see-all-link:hover {
  color: #ff8a00;
}
.podcast-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}
.podcast-card {
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #343a405b;
}
.podcast-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}
.podcast-thumbnail {
  width: 100%;
  display: block;
}
.podcast-info {
  padding: 1rem;
}
.podcast-title {
  color: #0d4d98 !important;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media screen and (max-width: 1310px) {
  .podcast-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}
</style>
