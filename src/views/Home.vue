<template>
  <div class="home-layout">
    <div class="music-container">
      <div class="music-header">
        <transition name="header-fade" mode="out-in">
          <h2 v-if="!isSearchActive">Canciones</h2>

          <div v-else class="search-bar">
            <input
              ref="searchInputRef"
              type="text"
              v-model="searchQuery"
              placeholder="Buscar por título o artista..."
              class="search-input"
            />
            <span class="close-search" @click="toggleSearch" title="Cerrar búsqueda">&times;</span>
          </div>
        </transition>

        <img
          v-if="!isSearchActive"
          src="@/assets/img/lupa.png"
          class="lupa"
          alt="Buscar"
          title="Buscar"
          @click="toggleSearch"
        />
      </div>

      <div v-if="isLoading" class="loading-songs">
        <div class="spinner-border spinner-border-sm" role="status"></div>
        <span>Cargando canciones...</span>
      </div>

      <div v-else class="music-grid">
        <div
          v-for="song in filteredSongs"
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
        <div v-if="filteredSongs.length === 0 && !isLoading" class="no-results">
          No se encontraron canciones que coincidan.
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

import { ref, computed, onMounted, nextTick } from 'vue'
import { useSongStore } from '@/stores/songs'
import { storeToRefs } from 'pinia'

// --- Lógica de Pinia y Estado del Store ---
const songStore = useSongStore()
const { songs, isLoading } = storeToRefs(songStore)

// --- Estado y Lógica para la Búsqueda ---
const isSearchActive = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

const filteredSongs = computed(() => {
  if (!searchQuery.value) {
    return songs.value
  }
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(
    (song) => song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query),
  )
})

const toggleSearch = async () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    searchQuery.value = ''
  }
}

// --- Acciones del Componente ---
const requestSong = (song) => {
  songStore.requestSong(song)
}

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
  height: calc(100vh - 70px - 90px);
}
.music-container {
  flex: 1;
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
.loading-songs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
  color: #6c757d;
  font-weight: 600;
}
.music-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(4, auto);
  grid-auto-columns: minmax(300px, 1fr);
  gap: 0 20px;
  padding: 10px;
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

/* --- ESTILOS MODIFICADOS Y AÑADIDOS --- */
.music-header {
  position: relative;
  background-color: #0d4d98;
  padding: 0 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  flex-shrink: 0;
  height: 60px;
  overflow: hidden;
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
  transition: transform 0.2s ease;
  z-index: 2;
}
.lupa:hover {
  transform: scale(1.1);
}
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
}
.search-input {
  width: 100%;
  border: none;
  border-bottom: 2px solid #5cb3ff;
  background: transparent;
  color: white;
  font-size: 1.2rem;
  padding: 5px 0;
  outline: none;
}
.search-input::placeholder {
  color: #ccc;
  font-weight: 300;
}
.close-search {
  font-size: 2.2rem;
  line-height: 1;
  color: #ccc;
  cursor: pointer;
  font-weight: 300;
  padding: 0 0 0 15px;
  transition: color 0.2s ease;
}
.close-search:hover {
  color: white;
}
.no-results {
  width: 100%;
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  grid-column: 1 / -1;
}

/* --- Animaciones con <transition> --- */
.header-fade-enter-active,
.header-fade-leave-active {
  transition: all 0.35s ease-in-out;
}
.header-fade-leave-to {
  transform: translateX(-50px);
  opacity: 0;
}
.header-fade-enter-from {
  transform: translateX(50px);
  opacity: 0;
}

/* --- Media Query --- */
@media screen and (max-width: 812px) {
  .home-layout {
    flex-direction: column;
    height: auto;
  }
  .music-container {
    width: 100%;
    max-height: 400px;
  }
  .music-grid {
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
