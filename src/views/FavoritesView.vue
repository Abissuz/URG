<template>
  <div class="container-fluid py-4">
    <h1 class="text-center mb-5 text-primary">Mis Favoritos</h1>

    <!-- Sección de Podcasts Favoritos -->
    <section v-if="favoritePodcasts.length > 0" class="mb-5">
      <h3 class="mb-4">Programas Favoritos</h3>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="podcast in favoritePodcasts" :key="podcast.id" class="col">
          <router-link :to="`/podcast/${podcast.id}`" class="text-decoration-none">
            <div class="card h-100 shadow-sm video-card">
              <img :src="podcast.coverImage" class="card-img-top" :alt="podcast.title" />
              <div class="card-body">
                <h5 class="card-title text-primary">{{ podcast.title }}</h5>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- INICIO DE LA SECCIÓN CORREGIDA: Episodios Favoritos -->
    <section v-if="favoritesStore.favoriteEpisodes.length > 0">
      <h3 class="mb-4">Episodios Favoritos</h3>
      <ul class="list-group">
        <li
          v-for="episode in favoritesStore.favoriteEpisodes"
          :key="episode.id"
          class="list-group-item d-flex justify-content-between align-items-center favorite-episode-item"
        >
          <router-link
            :to="`/podcast/${episode.podcastId}`"
            class="text-decoration-none text-dark flex-grow-1 episode-link"
          >
            <div>
              <div class="fw-bold episode-title">{{ episode.title }}</div>
              <small class="text-muted">{{ episode.podcastTitle }}</small>
            </div>
          </router-link>

          <div class="d-flex align-items-center">
            <button
              @click.stop="favoritesStore.toggleEpisodeFavorite(episode.podcastId, episode)"
              class="btn-favorite me-3"
            >
              <i class="fas fa-heart is-favorite"></i>
            </button>
            <button
              @click="playerStore.playOnDemandTrack(episode)"
              class="btn btn-sm btn-outline-primary"
            >
              <i class="fas fa-play me-2"></i>Reproducir
            </button>
          </div>
        </li>
      </ul>
    </section>
    <!-- FIN DE LA SECCIÓN CORREGIDA -->

    <div
      v-if="favoritePodcasts.length === 0 && favoritesStore.favoriteEpisodes.length === 0"
      class="text-center py-5"
    >
      <p class="text-muted">Aún no has añadido nada a tus favoritos.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { usePodcastStore } from '@/stores/counter'
import { usePlayerStore } from '@/stores/player'

const favoritesStore = useFavoritesStore()
const podcastStore = usePodcastStore()
const playerStore = usePlayerStore()

const favoritePodcasts = computed(() => {
  return podcastStore.podcasts.filter((p) => favoritesStore.isPodcastFavorite(p.id))
})
</script>

<style scoped>
/* Estilos similares a los de tu catálogo */
.video-card {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}
.video-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-title {
  color: #0d4d98;
}
.text-primary {
  color: #0d4d98 !important;
}
.list-group-item {
  background-color: #fff;
  border-color: #dee2e6;
  padding: 0.75rem 1.25rem;
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
.btn-favorite .is-favorite {
  color: #ff4d6d;
}

/* NUEVOS ESTILOS PARA EL ENLACE DEL EPISODIO */
.episode-link {
  transition: background-color 0.2s ease;
  margin: -0.75rem 0 -0.75rem -1.25rem; /* Expande el área del enlace */
  padding: 0.75rem 0 0.75rem 1.25rem;
  border-radius: 0.375rem 0 0 0.375rem;
}
.episode-link:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
.episode-link:hover .episode-title {
  color: #0d4d98;
}
.episode-title {
  color: #212529;
  transition: color 0.2s ease;
}
</style>
