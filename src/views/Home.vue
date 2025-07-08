<template>
  <div class="home-layout">
    <div class="music-container">
      <div class="music-header">
        <h2>Canciones</h2>
        <img src="@/assets/img/lupa.png" class="lupa" alt="Buscar" title="Buscar (Próximamente)" />
      </div>

      <div v-if="isLoading" class="loading-songs">
        <div class="spinner-border spinner-border-sm" role="status"></div>
        <span>Cargando canciones...</span>
      </div>

      <div v-else class="music-grid">
        <div
          v-for="song in songs"
          :key="song.id"
          class="track"
          @click="requestSong(song)"
          title="Solicitar esta canción"
        >
          <img :src="song.coverImage" class="track-cover" :alt="song.title" @error="onImageError" />
          <div class="track-info">
            <span class="track-title">{{ song.title }}</span>
            <span class="track-artist">{{ song.artist }}</span>
          </div>
          <span class="track-duration">{{ song.duration }}</span>
        </div>
      </div>
    </div>

    <ScheduleWidget />
  </div>

  <VideoPreview />
  <PodcastPreview />
</template>

<script setup>
import VideoPreview from '@/components/VideoPreview.vue'
import PodcastPreview from '@/components/PodcastPreview.vue'
import ScheduleWidget from '@/components/ScheduleWidget.vue'

import { onMounted } from 'vue'
import { useSongStore } from '@/stores/songs'
import { storeToRefs } from 'pinia'

const songStore = useSongStore()
const { songs, isLoading } = storeToRefs(songStore)

// Llamamos a la acción para solicitar la canción
const requestSong = (song) => {
  songStore.requestSong(song)
}

// Función para manejar errores de carga de imágenes y mostrar una por defecto
const onImageError = (event) => {
  event.target.src = new URL('@/assets/img/Blanci.png', import.meta.url).href
}

onMounted(() => {
  songStore.fetchSongs()
})
</script>

<style scoped>
.home-layout {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  /* Controla la altura para que los hijos puedan usar el 100% */
  height: calc(100vh - 70px - 90px); /* vh - header - bottomPlayer */
}

.music-container {
  flex: 1; /* Ocupa el espacio disponible */
  min-width: 300px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-family: 'Sulphur Point', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

.music-header {
  position: relative;
  background-color: #0d4d98;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
}

.music-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: white;
  font-weight: 700;
}

.lupa {
  position: absolute;
  right: 20px;
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
  cursor: pointer;
}

.loading-songs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
  color: #6c757d;
  font-weight: 600;
}

/* Contenedor de la cuadrícula con scroll */
.music-grid {
  display: grid;
  /* Crea columnas de 4 filas y luego fluye horizontalmente */
  grid-auto-flow: column;
  grid-template-rows: repeat(4, auto);
  /* Cada columna tendrá un ancho mínimo de 300px */
  grid-auto-columns: minmax(300px, 1fr);
  gap: 0 20px;
  padding: 10px;
  /* El scroll ahora es solo horizontal */
  overflow-x: auto;
  overflow-y: hidden;
  height: 100%;
}

.track {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.track:hover {
  background-color: #f8f9fa;
}

/* Quita la línea del último elemento de cada "columna" visual */
.track:nth-child(4n) {
  border-bottom: none;
}
.track:last-child {
  border-bottom: none;
}

.track-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #eee;
}

.track-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  min-width: 0;
}

.track-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #343a40;
}

.track-artist {
  font-size: 0.85rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: #6c757d;
  font-size: 0.9rem;
  margin-left: auto;
  padding-left: 1rem;
}

/* Scrollbar personalizado */
.music-grid::-webkit-scrollbar {
  height: 8px;
}
.music-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.music-grid::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}
.music-grid::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}

/* Media Query para diseño en móviles */
@media screen and (max-width: 812px) {
  .home-layout {
    flex-direction: column;
    height: auto;
  }
  .music-container {
    width: 100%;
    /* En móvil, limitamos la altura y permitimos scroll vertical */
    max-height: 400px;
  }
  .music-grid {
    /* En móvil, cambiamos a una sola columna con scroll vertical */
    grid-auto-flow: row;
    grid-template-columns: 1fr;
    grid-template-rows: unset;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 0;
  }
  .track {
    border-bottom: 1px solid #f0f0f0 !important;
  }
}
</style>
