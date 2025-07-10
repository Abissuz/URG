<template>
  <div class="requests-container mt-4">
    <hr class="mb-4" />
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-secondary" role="status"></div>
      <p class="mt-2 text-muted">Escuchando peticiones en tiempo real...</p>
    </div>

    <div v-else>
      <div class="row g-4">
        <div class="col-lg-6 d-flex flex-column">
          <h3 class="mb-3">🔥 Ranking en Caliente (Últimos 30 min)</h3>
          <div v-if="hotRanking.length > 0" class="card shadow-sm flex-grow-1">
            <div class="card-body d-flex flex-column">
              <div class="table-responsive flex-grow-1">
                <table class="table table-striped table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" class="text-center">#</th>
                      <th scope="col">Canción</th>
                      <th scope="col" class="text-center">Peticiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(song, index) in paginatedHotRanking" :key="song.songId">
                      <td class="text-center fw-bold">
                        {{ (hotRankingCurrentPage - 1) * ITEMS_PER_PAGE + index + 1 }}
                      </td>
                      <td>
                        <div>{{ song.songTitle }}</div>
                        <small class="text-muted">{{ song.artist }}</small>
                      </td>
                      <td class="text-center fs-5 fw-bold">{{ song.requestCount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <nav v-if="hotRankingTotalPages > 1" aria-label="Page navigation" class="mt-3">
                <ul class="pagination justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: hotRankingCurrentPage === 1 }">
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="goToHotPage(hotRankingCurrentPage - 1)"
                      >Anterior</a
                    >
                  </li>
                  <li
                    v-for="page in hotRankingPages"
                    :key="'hot-' + page"
                    class="page-item"
                    :class="{ active: page === hotRankingCurrentPage, disabled: page === '...' }"
                  >
                    <span v-if="page === '...'" class="page-link">...</span>
                    <a v-else class="page-link" href="#" @click.prevent="goToHotPage(page)">{{
                      page
                    }}</a>
                  </li>
                  <li
                    class="page-item"
                    :class="{ disabled: hotRankingCurrentPage === hotRankingTotalPages }"
                  >
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="goToHotPage(hotRankingCurrentPage + 1)"
                      >Siguiente</a
                    >
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div v-else class="alert alert-info">No hay peticiones "en caliente".</div>
        </div>

        <div class="col-lg-6 d-flex flex-column">
          <h3 class="mb-3">📈 Más Pedidas del Día (Últimas 24h)</h3>
          <div v-if="dailyRanking.length > 0" class="card shadow-sm flex-grow-1">
            <div class="card-body d-flex flex-column">
              <div class="table-responsive flex-grow-1">
                <table class="table table-striped table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" class="text-center">#</th>
                      <th scope="col">Canción</th>
                      <th scope="col" class="text-center">Peticiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(song, index) in paginatedDailyRanking" :key="song.songId">
                      <td class="text-center fw-bold">
                        {{ (dailyRankingCurrentPage - 1) * ITEMS_PER_PAGE + index + 1 }}
                      </td>
                      <td>
                        <div>{{ song.songTitle }}</div>
                        <small class="text-muted">{{ song.artist }}</small>
                      </td>
                      <td class="text-center fs-5 fw-bold">{{ song.requestCount }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <nav v-if="dailyRankingTotalPages > 1" aria-label="Page navigation" class="mt-3">
                <ul class="pagination justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: dailyRankingCurrentPage === 1 }">
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="goToDailyPage(dailyRankingCurrentPage - 1)"
                      >Anterior</a
                    >
                  </li>
                  <li
                    v-for="page in dailyRankingPages"
                    :key="'daily-' + page"
                    class="page-item"
                    :class="{ active: page === dailyRankingCurrentPage, disabled: page === '...' }"
                  >
                    <span v-if="page === '...'" class="page-link">...</span>
                    <a v-else class="page-link" href="#" @click.prevent="goToDailyPage(page)">{{
                      page
                    }}</a>
                  </li>
                  <li
                    class="page-item"
                    :class="{ disabled: dailyRankingCurrentPage === dailyRankingTotalPages }"
                  >
                    <a
                      class="page-link"
                      href="#"
                      @click.prevent="goToDailyPage(dailyRankingCurrentPage + 1)"
                      >Siguiente</a
                    >
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div v-else class="alert alert-info">Aún no hay peticiones hoy.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { songRequests: rawRequests, loading: isLoading } = storeToRefs(authStore)

// --- [AJUSTADO] Máximo 5 items por página ---
const ITEMS_PER_PAGE = 5
const hotRankingCurrentPage = ref(1)
const dailyRankingCurrentPage = ref(1)

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
  return processAndRank(
    rawRequests.value.filter(
      (req) => req.timestamp && req.timestamp.toDate().getTime() >= thirtyMinutesAgo,
    ),
  )
})
const dailyRanking = computed(() => processAndRank(rawRequests.value))

const hotRankingTotalPages = computed(() => Math.ceil(hotRanking.value.length / ITEMS_PER_PAGE))
const dailyRankingTotalPages = computed(() => Math.ceil(dailyRanking.value.length / ITEMS_PER_PAGE))

const paginatedHotRanking = computed(() => {
  const start = (hotRankingCurrentPage.value - 1) * ITEMS_PER_PAGE
  return hotRanking.value.slice(start, start + ITEMS_PER_PAGE)
})
const paginatedDailyRanking = computed(() => {
  const start = (dailyRankingCurrentPage.value - 1) * ITEMS_PER_PAGE
  return dailyRanking.value.slice(start, start + ITEMS_PER_PAGE)
})

const generatePageList = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage < 5) {
    return [1, 2, 3, 4, 5, '...', totalPages]
  }
  if (currentPage > totalPages - 4) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
}

const hotRankingPages = computed(() =>
  generatePageList(hotRankingCurrentPage.value, hotRankingTotalPages.value),
)
const dailyRankingPages = computed(() =>
  generatePageList(dailyRankingCurrentPage.value, dailyRankingTotalPages.value),
)

const goToHotPage = (page) => {
  if (page >= 1 && page <= hotRankingTotalPages.value) {
    hotRankingCurrentPage.value = page
  }
}
const goToDailyPage = (page) => {
  if (page >= 1 && page <= dailyRankingTotalPages.value) {
    dailyRankingCurrentPage.value = page
  }
}

watch(hotRanking, () => {
  hotRankingCurrentPage.value = 1
})
watch(dailyRanking, () => {
  dailyRankingCurrentPage.value = 1
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
.card {
  min-height: 410px; /* Altura ajustada para 5 items */
}
.pagination {
  --bs-pagination-font-size: 0.9rem;
  --bs-pagination-color: #0d4d98;
  --bs-pagination-hover-color: #0d4d98;
  --bs-pagination-focus-color: #0d4d98;
  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  --bs-pagination-active-bg: #0d4d98;
  --bs-pagination-active-border-color: #0d4d98;
}
.page-item.disabled .page-link {
  pointer-events: none;
  color: #6c757d;
}
</style>
