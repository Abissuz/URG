<template>
  <div class="container-fluid py-4">
    <h1 class="text-center mb-4 text-primary">Catálogo de Videos</h1>

    <!-- Barra de búsqueda con lupa -->
    <div class="mb-4 position-relative busca">
      <input
        v-model="searchQuery"
        id="buscar"
        type="text"
        class="form-control form-control-lg ps-4 pe-5"
        @focus="inputFocused = true"
        @blur="inputFocused = false"
      />
      <label for="buscar" class="caret" :class="{ hidden: inputFocused || searchQuery }"
        >Buscar...</label
      >
      <img src="@/assets/img/lupa.png" class="lupa" alt="Buscar" @click="filterVideos" />
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando videos...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="alert alert-danger text-center">
      <p class="mb-0">⚠️ {{ error }}</p>
      <button @click="fetchVideos" class="btn btn-primary mt-2">Reintentar</button>
    </div>

    <!-- Grid de videos (filtrados) -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="video in filteredVideos" :key="video.id" class="col">
        <div class="card h-100 shadow-sm">
          <div class="ratio ratio-16x9">
            <iframe
              :src="'https://www.youtube.com/embed/' + video.id"
              allowfullscreen
              class="rounded-top"
            ></iframe>
          </div>
          <div class="card-body">
            <h5 class="card-title">
              <a
                :href="'https://www.youtube.com/watch?v=' + video.id"
                target="_blank"
                class="text-decoration-none text-primary"
              >
                {{ video.title }}
              </a>
            </h5>
            <p class="card-text text-muted small">
              {{ truncateDescription(video.description) }}
            </p>
          </div>
          <div class="card-footer bg-transparent border-top-0">
            <small class="text-muted"> Publicado: {{ formatDate(video.publishedAt) }} </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje si no hay resultados -->
    <div v-if="!loading && !error && filteredVideos.length === 0" class="text-center py-5">
      <p class="text-muted">No se encontraron videos con "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'

const API_KEY = import.meta.env.VITE_APP_YOUTUBE_API_KEY
const PLAYLIST_ID = import.meta.env.VITE_APP_YOUTUBE_PLAYLIST_ID

// Estados
const videos = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const inputFocused = ref(false)

// Cache
let memoryCache = null

// Videos filtrados (solo por título)
const filteredVideos = computed(() => {
  if (!searchQuery.value.trim()) return videos.value

  const query = searchQuery.value.toLowerCase()
  return videos.value.filter((video) => video.title.toLowerCase().includes(query))
})

// Formateadores
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const truncateDescription = (desc) => {
  if (!desc) return ''
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
}

// Fetch de videos (igual que antes)
const fetchVideos = async () => {
  try {
    loading.value = true
    error.value = null

    if (memoryCache) {
      videos.value = memoryCache
      await nextTick()
      loading.value = false
      return
    }

    const cached = JSON.parse(localStorage.getItem(`ytVideos_${PLAYLIST_ID}`) || 'null')
    if (cached?.timestamp && Date.now() - cached.timestamp < 3600000) {
      videos.value = cached.items
      memoryCache = cached.items
      await nextTick()
      loading.value = false
      return
    }

    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=20&playlistId=${PLAYLIST_ID}&key=${API_KEY}`,
    )
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)

    const data = await res.json()
    videos.value = data.items.map((item) => ({
      id: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    }))

    memoryCache = videos.value
    localStorage.setItem(
      `ytVideos_${PLAYLIST_ID}`,
      JSON.stringify({
        timestamp: Date.now(),
        items: videos.value,
      }),
    )
  } catch (err) {
    error.value = 'No se pudieron cargar los videos. Por favor intenta más tarde.'
    console.error('Error fetching videos:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.container-fluid {
  font-family: 'Sulphur Point', sans-serif;
}
.busca {
  max-width: 500px;
  width: 35%;
  min-width: 300px;
  align-self: center;
  justify-self: center;
}
/* Estilos para la lupa */
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

/* Estilos para el input de búsqueda */
.form-control {
  border-radius: 50px;
  padding: 10px 20px;
  border: 1px solid #0d4d98;
  background-color: rgba(13, 77, 152, 0.68);
  color: white;
  text-align: center;
}

.form-control:focus {
  border: 1px solid #0d4d98;
  background-color: rgba(13, 77, 152, 0.68);
  box-shadow: none;
  color: white;
}
.caret {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  pointer-events: none;
  font-size: 22px;
  font-family: 'Sulphur Point', sans-serif;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Pseudoelemento para el caret parpadeante */
.caret::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 20px;
  background-color: white;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Asegura que el texto "Buscar..." esté alineado */
.caret {
  white-space: nowrap;
}
.caret.hidden {
  opacity: 0;
}

.card-title a:hover {
  color: var(--bs-orange) !important;
  text-decoration: underline !important;
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
</style>
