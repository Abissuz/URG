<template>
  <div class="container-fluid py-4">
    <h1 class="text-center mb-4 text-primary">Programas</h1>

    <div class="view-toggle-container">
      <div class="toggle-switch">
        <button @click="setActiveView('videos')" :class="{ active: activeView === 'videos' }">
          Videos
        </button>
        <button @click="setActiveView('podcasts')" :class="{ active: activeView === 'podcasts' }">
          Podcasts
        </button>
        <div class="glider" :class="{ 'on-podcasts': activeView === 'podcasts' }"></div>
      </div>
    </div>

    <div class="mb-4 position-relative busca">
      <input
        v-model="searchQuery"
        id="buscar"
        type="text"
        class="form-control form-control-lg"
        :placeholder="`Buscar en ${activeView}...`"
      />
      <img src="@/assets/img/lupa.png" class="lupa" alt="Buscar" />
    </div>

    <div v-if="activeView === 'videos'">
      <div v-if="videoLoading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
        <p class="mt-2">Cargando videos...</p>
      </div>
      <div v-else-if="videoError" class="alert alert-danger text-center">
        <p class="mb-0">⚠️ {{ videoError }}</p>
        <button @click="fetchAllVideos(true)" class="btn btn-primary mt-2">Reintentar</button>
      </div>
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div
          v-for="video in paginatedVideos"
          :key="video.id"
          @click="openVideoModal(video.id)"
          class="col"
        >
          <div class="card h-100 shadow-sm video-card">
            <div class="thumbnail-wrapper">
              <img :src="video.thumbnail" class="card-img-top" :alt="video.title" />
            </div>
            <div class="card-body">
              <h5 class="card-title text-primary">{{ video.title }}</h5>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <small class="text-muted">Publicado: {{ formatDate(video.publishedAt) }}</small>
            </div>
          </div>
        </div>
      </div>
      <nav v-if="videoTotalPages > 1 && !videoLoading" aria-label="Page navigation">
        <ul class="pagination justify-content-center mt-4">
          <li class="page-item" :class="{ disabled: videoCurrentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="goToVideoPage(videoCurrentPage - 1)"
              >Anterior</a
            >
          </li>
          <li
            v-for="page in videoPages"
            :key="page"
            class="page-item"
            :class="{ active: page === videoCurrentPage, disabled: page === '...' }"
          >
            <span v-if="page === '...'" class="page-link">...</span>
            <a v-else class="page-link" href="#" @click.prevent="goToVideoPage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: videoCurrentPage === videoTotalPages }">
            <a class="page-link" href="#" @click.prevent="goToVideoPage(videoCurrentPage + 1)"
              >Siguiente</a
            >
          </li>
        </ul>
      </nav>
    </div>

    <div v-else-if="activeView === 'podcasts'">
      <PodcastGrid :search-query="searchQuery" />
    </div>
  </div>

  <VideoModal v-if="selectedVideoId" :video-id="selectedVideoId" @close="closeVideoModal" />
</template>

<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue'
import { useRoute } from 'vue-router'
import PodcastGrid from '@/components/PodcastGrid.vue'
import VideoModal from '@/components/VideoModal.vue'
// 1. Importar las notificaciones
import { showSuccessToast, showErrorToast } from '@/stores/notifications.js'

const scrollTop = inject('scrollTop')
const route = useRoute()
const activeView = ref('videos')
const searchQuery = ref('')

const setActiveView = (view) => {
  activeView.value = view
  searchQuery.value = ''
}

const setViewFromQuery = (query) => {
  if (query.view === 'podcasts') {
    activeView.value = 'podcasts'
  } else {
    activeView.value = 'videos'
  }
}

watch(
  () => route.query,
  (newQuery) => {
    setViewFromQuery(newQuery)
  },
)

// --- LÓGICA PARA VIDEOS DE YOUTUBE ---
const API_KEY = import.meta.env.VITE_APP_YOUTUBE_API_KEY
const CHANNEL_ID = import.meta.env.VITE_APP_YOUTUBE_CHANNEL_ID
const UPLOADS_PLAYLIST_ID = CHANNEL_ID ? `UU${CHANNEL_ID.substring(2)}` : null
const VIDEOS_PER_PAGE = 9

const allVideos = ref([])
const videoLoading = ref(true)
const videoError = ref(null)
const videoCurrentPage = ref(1)
const selectedVideoId = ref(null)

const openVideoModal = (videoId) => {
  selectedVideoId.value = videoId
}
const closeVideoModal = () => {
  selectedVideoId.value = null
}

const filteredVideos = computed(() => {
  if (!searchQuery.value.trim()) return allVideos.value
  const query = searchQuery.value.toLowerCase()
  if (videoCurrentPage.value !== 1) videoCurrentPage.value = 1
  return allVideos.value.filter((video) => video.title.toLowerCase().includes(query))
})

const videoTotalPages = computed(() => Math.ceil(filteredVideos.value.length / VIDEOS_PER_PAGE))
const paginatedVideos = computed(() => {
  const start = (videoCurrentPage.value - 1) * VIDEOS_PER_PAGE
  const end = start + VIDEOS_PER_PAGE
  return filteredVideos.value.slice(start, end)
})

const videoPages = computed(() => {
  const pages = []
  if (videoTotalPages.value <= 7) {
    for (let i = 1; i <= videoTotalPages.value; i++) pages.push(i)
  } else {
    if (videoCurrentPage.value < 5) return [1, 2, 3, 4, 5, '...', videoTotalPages.value]
    if (videoCurrentPage.value > videoTotalPages.value - 4)
      return [
        1,
        '...',
        videoTotalPages.value - 4,
        videoTotalPages.value - 3,
        videoTotalPages.value - 2,
        videoTotalPages.value - 1,
        videoTotalPages.value,
      ]
    return [
      1,
      '...',
      videoCurrentPage.value - 1,
      videoCurrentPage.value,
      videoCurrentPage.value + 1,
      '...',
      videoTotalPages.value,
    ]
  }
  return pages
})

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

// 2. Modificar fetchAllVideos para manejar notificaciones
const fetchAllVideos = async (isManualRetry = false) => {
  videoLoading.value = true
  videoError.value = null
  let nextPageToken = null
  const fetchedVideos = []
  try {
    if (!UPLOADS_PLAYLIST_ID) throw new Error('ID de canal de YouTube no configurado.')
    do {
      let url = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${UPLOADS_PLAYLIST_ID}&key=${API_KEY}`
      if (nextPageToken) url += `&pageToken=${nextPageToken}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
      const data = await res.json()
      const newVideos = data.items
        .filter((item) => item.snippet.title !== 'Private video' && item.snippet.thumbnails)
        .map((item) => ({
          id: item.contentDetails.videoId,
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        }))
      fetchedVideos.push(...newVideos)
      nextPageToken = data.nextPageToken
    } while (nextPageToken)
    allVideos.value = fetchedVideos
    // 3. Si fue un reintento manual exitoso, notificar
    if (isManualRetry) {
      showSuccessToast('¡Videos cargados correctamente!')
    }
  } catch (err) {
    videoError.value = 'No se pudieron cargar los videos.'
    // 4. Si hay un error, siempre notificar
    showErrorToast('No se pudieron cargar los videos.')
  } finally {
    videoLoading.value = false
  }
}

const goToVideoPage = (page) => {
  if (page >= 1 && page <= videoTotalPages.value) {
    videoCurrentPage.value = page
    if (scrollTop) {
      scrollTop()
    }
  }
}

onMounted(() => {
  setViewFromQuery(route.query)
  // Se llama sin parámetros para la carga inicial
  fetchAllVideos()
})
</script>

<style scoped>
/* Tus estilos no necesitan cambios */
.thumbnail-wrapper {
  position: relative;
  display: block;
}
.thumbnail-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50%;
  border-radius: 50%;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
  opacity: 0.8;
}
.video-card:hover .thumbnail-wrapper::after {
  transform: translate(-50%, -50%) scale(1.1);
  background-color: rgb(251 136 0 / 65%);
  opacity: 1;
}
.view-toggle-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.toggle-switch {
  position: relative;
  display: flex;
  background-color: rgba(13, 77, 152, 0.3);
  border-radius: 50px;
  padding: 5px;
  border: 1px solid #0d4d98;
}
.toggle-switch button {
  background: transparent;
  border: none;
  color: #fff;
  padding: 8px 24px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
}
.toggle-switch button.active {
  color: #0d4d98;
}
.glider {
  position: absolute;
  top: 5px;
  height: calc(100% - 10px);
  width: 50%;
  background-color: #fff;
  border-radius: 50px;
  z-index: 1;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.toggle-switch .glider.on-podcasts {
  transform: translateX(90%);
}
.container-fluid {
  font-family: 'Sulphur Point', sans-serif;
}
.busca {
  max-width: 500px;
  width: 35%;
  min-width: 300px;
  margin: 0 auto 2rem;
}
.lupa {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
  cursor: pointer;
}
.form-control {
  border-radius: 50px;
  padding: 10px 20px;
  border: 1px solid #0d4d98;
  background-color: rgba(13, 77, 152, 0.68);
  color: #fff;
  text-align: center;
}
.form-control:focus {
  border: 1px solid #0d4d98;
  background-color: rgba(13, 77, 152, 0.68);
  box-shadow: none;
  color: #fff;
}
.form-control::placeholder {
  color: white;
}
.video-card {
  border: 1px solid #343a4063;
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
.btn-primary {
  background-color: #0d4d98;
  border-color: #0d4d98;
}
.btn-primary:hover {
  background-color: #0b3d7a;
  border-color: #0b3d7a;
}
.pagination .page-link {
  border-color: #343a4060;
  color: #0d4d98;
}
.pagination .page-link:hover {
  background-color: #60b0ff66;
  color: #0d4d98;
}
.pagination .page-item.active .page-link {
  background-color: #0d4d98;
  border-color: #0d4d98;
  color: #fff;
}
.pagination .page-item.disabled .page-link {
  border-color: #343a4060;
  color: #6c757d;
  pointer-events: none;
}
.page-link:focus {
  box-shadow: none;
}
</style>
