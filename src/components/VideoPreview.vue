<template>
  <div class="video-preview-container">
    <!-- Cabecera de la sección -->
    <div class="section-header">
      <h2 class="section-title">Programas Destacados</h2>
      <router-link to="/programas" class="see-all-link">Ver todos &rarr;</router-link>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="alert alert-dark text-center">
      <p class="mb-0">⚠️ No se pudieron cargar los videos.</p>
    </div>

    <!-- Cuadrícula de videos -->
    <div v-else class="video-grid">
      <a
        v-for="video in videos"
        :key="video.id"
        :href="'https://www.youtube.com/watch?v=' + video.id"
        target="_blank"
        rel="noopener noreferrer"
        class="text-decoration-none"
      >
        <div class="video-card">
          <div class="thumbnail-wrapper">
            <img :src="video.thumbnail" class="video-thumbnail" :alt="video.title" />
          </div>
          <div class="video-info">
            <h6 class="video-title">{{ video.title }}</h6>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_KEY = import.meta.env.VITE_APP_YOUTUBE_API_KEY
const CHANNEL_ID = import.meta.env.VITE_APP_YOUTUBE_CHANNEL_ID
const UPLOADS_PLAYLIST_ID = CHANNEL_ID ? `UU${CHANNEL_ID.substring(2)}` : null

const videos = ref([])
const loading = ref(true)
const error = ref(null)

const fetchLatestVideos = async () => {
  loading.value = true
  error.value = null
  try {
    if (!UPLOADS_PLAYLIST_ID) throw new Error('ID de canal no configurado.')

    const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=6&playlistId=${UPLOADS_PLAYLIST_ID}&key=${API_KEY}`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    const data = await res.json()
    videos.value = data.items
      .filter((item) => item.snippet.title !== 'Private video' && item.snippet.thumbnails)
      .map((item) => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      }))
  } catch (err) {
    error.value = err.message
    console.error('Error fetching latest videos:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchLatestVideos)
</script>

<style scoped>
.video-preview-container {
  font-family: 'Sulphur Point', sans-serif;
}
/* Contenedor para la imagen y el ícono */
.thumbnail-wrapper {
  position: relative; /* Clave para posicionar el ícono de play encima */
  display: block;
}

/* El ícono de 'Play' (usando un pseudo-elemento ::after) */
.thumbnail-wrapper::after {
  content: ''; /* Requerido para que se muestre el pseudo-elemento */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Centrado perfecto */

  /* Apariencia del ícono */
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50%;
  border-radius: 50%;

  /* Transición suave */
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;

  /* El ícono está presente pero es sutil */
  opacity: 0.8;
}

/* Efecto al pasar el cursor sobre la tarjeta de video */
.video-card:hover .thumbnail-wrapper::after {
  transform: translate(-50%, -50%) scale(1.1); /* Se agranda un poco */
  background-color: rgb(251 136 0 / 65%);
  opacity: 1;
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

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.video-card {
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #343a405b;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.video-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.video-info {
  padding: 1rem;
  color: #0d4d98 !important;
}

.video-title {
  color: #0d4d98 !important;
  font-weight: 600;
  margin: 0;
  /* Lógica para truncar texto largo */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media screen and (max-width: 1310px) {
  .video-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive por defecto */
  }
}
</style>
