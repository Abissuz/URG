<template>
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
    <div v-else class="content-body">
      <div class="panel-detail">
        <div v-if="selectedSong" class="song-details-card">
          <img
            :src="selectedSong.coverImage"
            class="details-cover"
            :alt="selectedSong.title"
            @error="onImageError"
          />
          <span class="details-title">{{ selectedSong.title }}</span>
          <span class="details-artist">{{ selectedSong.artist }}</span>
          <button
            @click="confirmRequest(selectedSong)"
            class="btn-request-icon"
            title="Solicitar esta canción"
          >
            +
          </button>
        </div>
      </div>
      <div class="panel-list">
        <div
          v-for="song in filteredSongs"
          :key="song.id"
          class="track"
          :class="{ selected: song.id === selectedSongId }"
          @click="selectSong(song)"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useSongStore } from '@/stores/songs'
import { storeToRefs } from 'pinia'

const songStore = useSongStore()
const { songs, isLoading } = storeToRefs(songStore)

const selectedSongId = ref(null)
const isSearchActive = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

watch(
  songs,
  (newSongs) => {
    if (newSongs && newSongs.length > 0 && !selectedSongId.value) {
      selectedSongId.value = newSongs[0].id
    }
  },
  { immediate: true },
) // <-- AÑADE ESTA LÍNEA

const selectedSong = computed(
  () => songs.value.find((song) => song.id === selectedSongId.value) || null,
)
const filteredSongs = computed(() => {
  if (!searchQuery.value) return songs.value
  const query = searchQuery.value.toLowerCase()
  return songs.value.filter(
    (song) => song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query),
  )
})

const selectSong = (song) => {
  selectedSongId.value = song.id
}
const confirmRequest = (song) => {
  songStore.requestSong(song)
}
const toggleSearch = async () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    searchQuery.value = ''
  }
}
const onImageError = (event) => {
  event.target.src = new URL('@/assets/img/Blanci.png', import.meta.url).href
}

onMounted(() => {
  songStore.fetchSongs()
})
</script>

<style scoped>
/* ESTILOS ORIGINALES PRESERVADOS */
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
.close-search {
  font-size: 2.2rem;
  line-height: 1;
  color: #ccc;
  cursor: pointer;
  font-weight: 300;
  padding: 0 0 0 15px;
  transition: color 0.2s ease;
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
.loading-songs,
.no-results {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-weight: 600;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
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

/* NUEVA ESTRUCTURA INTERNA */
.content-body {
  display: flex;
  height: calc(100% - 60px); /* Altura restante */
  width: 100%;
}
.panel-detail,
.panel-list {
  flex: 1; /* Divide el espacio a la mitad */
  padding: 10px;
  min-width: 0;
}
.panel-list {
  border-left: 1px solid #f0f0f0;
  overflow-y: auto;
}
.panel-detail {
  display: flex;
  align-items: center;
  justify-content: center;
}
.song-details-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.details-cover {
  width: 220px;
  height: 220px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 1rem;
}
/* Reutilizando estilos existentes para mantener coherencia */
.details-title {
  font-weight: 900;
  font-size: 1.5rem;
  color: #343a40;
}
.details-artist {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}
.btn-request-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: #0d4d98;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-request-icon:hover {
  transform: scale(1.1);
}
.track.selected {
  background-color: #e7f3ff;
}
</style>
