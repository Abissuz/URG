<template>
  <div class="requests-container mt-4">
    <hr class="mb-4" />
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-secondary" role="status"></div>
      <p class="mt-2 text-muted">Escuchando peticiones en tiempo real...</p>
    </div>

    <div v-else>
      <div class="row g-4">
        <div class="col-lg-6">
          <h3 class="mb-3">🔥 Ranking en Caliente (Últimos 30 min)</h3>
          <div v-if="hotRanking.length > 0" class="card shadow-sm">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" class="text-center">#</th>
                      <th scope="col">Canción</th>
                      <th scope="col" class="text-center">Peticiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(song, index) in hotRanking" :key="song.songId">
                      <td class="text-center fw-bold">{{ index + 1 }}</td>
                      <td>
                        <div>{{ song.songTitle }}</div>
                        <small class="text-muted">{{ song.artist }}</small>
                      </td>
                      <td class="text-center fs-5 fw-bold">{{ song.requestCount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div v-else class="alert alert-info">No hay peticiones "en caliente".</div>
        </div>

        <div class="col-lg-6">
          <h3 class="mb-3">📈 Más Pedidas del Día (Últimas 24h)</h3>
          <div v-if="dailyRanking.length > 0" class="card shadow-sm">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" class="text-center">#</th>
                      <th scope="col">Canción</th>
                      <th scope="col" class="text-center">Peticiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(song, index) in dailyRanking" :key="song.songId">
                      <td class="text-center fw-bold">{{ index + 1 }}</td>
                      <td>
                        <div>{{ song.songTitle }}</div>
                        <small class="text-muted">{{ song.artist }}</small>
                      </td>
                      <td class="text-center fs-5 fw-bold">{{ song.requestCount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div v-else class="alert alert-info">Aún no hay peticiones hoy.</div>
        </div>
      </div>
    </div>
  </div>
</template>

// Reemplaza el
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

// 1. Nos conectamos al store
const authStore = useAuthStore()

// 2. Extraemos la lista de peticiones que App.vue ya está actualizando
const { songRequests: rawRequests } = storeToRefs(authStore)

// ¡Ya no necesitamos isLoading, onMounted, ni onUnmounted aquí!

// 3. Las propiedades computadas ahora funcionan con los datos del store
const processAndRank = (requests) => {
  const songCounts = {}
  requests.forEach((req) => {
    if (!songCounts[req.songId]) {
      songCounts[req.songId] = {
        songId: req.songId,
        songTitle: req.songTitle,
        artist: req.artist,
        requestors: new Set(),
      }
    }
    songCounts[req.songId].requestors.add(req.userId)
  })
  const rankedList = Object.values(songCounts).map((song) => ({
    ...song,
    requestCount: song.requestors.size,
  }))
  return rankedList.sort((a, b) => b.requestCount - a.requestCount)
}

const hotRanking = computed(() => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
  const recentRequests = rawRequests.value.filter(
    (req) => req.timestamp && req.timestamp.toDate().getTime() >= thirtyMinutesAgo,
  )
  return processAndRank(recentRequests)
})

const dailyRanking = computed(() => {
  return processAndRank(rawRequests.value)
})
</script>

<style scoped>
.requests-container {
  padding-top: 1rem;
}
.table thead th {
  font-weight: 600;
  white-space: nowrap;
}
.table small {
  font-size: 0.85em;
}
</style>
