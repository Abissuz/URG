<template>
  <div class="dashboard-container p-3">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Estadísticas de la Plataforma</h2>
      <button
        @click="fetchStats(true)"
        class="btn btn-sm btn-outline-secondary"
        :disabled="loading"
        title="Refrescar datos"
      >
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
        <span class="d-none d-sm-inline ms-2">Refrescar</span>
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Cargando estadísticas desde el servidor...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <p class="fw-bold">Ocurrió un error al cargar las estadísticas.</p>
      <button @click="fetchStats(true)" class="btn btn-sm btn-danger mt-2">Reintentar</button>
    </div>

    <div v-else-if="stats">
      <div class="stats-grid mb-5">
        <div class="stat-card">
          <h3>Total de Podcasts</h3>
          <p class="stat-number">{{ stats.totalPodcasts }}</p>
        </div>
        <div class="stat-card">
          <h3>Total de Usuarios</h3>
          <p class="stat-number">{{ stats.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Administradores</h3>
          <p class="stat-number">{{ stats.adminCount }}</p>
        </div>
        <div class="stat-card">
          <h3>Moderadores</h3>
          <p class="stat-number">{{ stats.moderatorCount }}</p>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h3 class="card-title mb-0">Estadísticas por Podcast</h3>
              <button
                class="btn btn-primary btn-sm"
                @click="generateReport"
                :disabled="selectedPodcasts.size === 0 || isGeneratingReport"
              >
                <i class="fas fa-file-pdf me-2"></i>
                {{
                  isGeneratingReport ? 'Generando...' : `Generar Reporte (${selectedPodcasts.size})`
                }}
              </button>
            </div>
            <div class="card-body table-responsive p-0">
              <div class="table-wrapper">
                <table class="table table-hover align-middle mb-0 responsive-table">
                  <thead class="table-light">
                    <tr>
                      <th class="text-center" style="width: 50px">
                        <input
                          type="checkbox"
                          class="form-check-input styled-checkbox"
                          @click="toggleSelectAll"
                          :checked="
                            selectedPodcasts.size === sortedPodcastDetails.length &&
                            sortedPodcastDetails.length > 0
                          "
                          title="Seleccionar todos"
                        />
                      </th>
                      <th style="width: 50px"></th>
                      <th @click="sortBy('title')" class="sortable">
                        Podcast <i class="fas" :class="sortIcon('title')"></i>
                      </th>
                      <th @click="sortBy('totalEpisodes')" class="sortable text-center">
                        Episodios <i class="fas" :class="sortIcon('totalEpisodes')"></i>
                      </th>
                      <th @click="sortBy('totalFavorites')" class="sortable text-center">
                        Favoritos <i class="fas" :class="sortIcon('totalFavorites')"></i>
                      </th>
                      <th @click="sortBy('totalComments')" class="sortable text-center">
                        Comentarios <i class="fas" :class="sortIcon('totalComments')"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="podcast in sortedPodcastDetails" :key="podcast.id">
                      <tr @click="togglePodcastExpansion(podcast.id)" class="expandable-row">
                        <td class="text-center">
                          <input
                            type="checkbox"
                            class="form-check-input styled-checkbox"
                            :value="podcast.id"
                            v-model="selectedPodcasts"
                            @click.stop
                          />
                        </td>
                        <td class="text-center">
                          <i
                            class="fas fa-chevron-right chevron-icon"
                            :class="{ 'is-expanded': expandedPodcastId === podcast.id }"
                          ></i>
                        </td>
                        <td>
                          <div>{{ podcast.title }}</div>
                          <small class="text-muted">por {{ podcast.host?.name }}</small>
                        </td>
                        <td class="text-center fw-bold">
                          {{ podcast.totalEpisodes }}
                        </td>
                        <td class="text-center fw-bold">
                          {{ podcast.totalFavorites }}
                        </td>
                        <td class="text-center fw-bold">
                          {{ podcast.totalComments }}
                        </td>
                      </tr>
                      <tr v-if="expandedPodcastId === podcast.id" class="details-row">
                        <td colspan="6" class="p-0">
                          <div class="episode-details-container">
                            <h4 class="episode-details-title">Desglose de Episodios</h4>
                            <table class="table table-sm table-borderless mb-0">
                              <thead>
                                <tr>
                                  <th>Episodio</th>
                                  <th class="text-center">Favoritos</th>
                                  <th class="text-center">Comentarios</th>
                                  <th class="text-center">Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="episode in podcast.episodes" :key="episode.id">
                                  <td>{{ episode.title }}</td>
                                  <td class="text-center">{{ episode.favoriteCount }}</td>
                                  <td class="text-center">{{ episode.commentCount }}</td>
                                  <td class="text-center">
                                    <span
                                      v-if="episode.commentsEnabled"
                                      title="Comentarios Habilitados"
                                      class="status-icon enabled"
                                      >✔</span
                                    >
                                    <span
                                      v-else
                                      title="Comentarios Deshabilitados"
                                      class="status-icon disabled"
                                      >✖</span
                                    >
                                  </td>
                                </tr>
                                <tr v-if="!podcast.episodes || podcast.episodes.length === 0">
                                  <td colspan="4" class="text-center text-muted fst-italic py-3">
                                    Este podcast no tiene episodios.
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoURL from '@/assets/img/LOGO-PNG-GLOBAL-RADIO (1).png'

// --- STORES Y ESTADO ---
const authStore = useAuthStore()
const { dashboardStats: stats, loadingStats: loading, statsError: error } = storeToRefs(authStore)
const expandedPodcastId = ref(null)
const selectedPodcasts = ref(new Set())
const isGeneratingReport = ref(false)
const sortKey = ref('title')
const sortAsc = ref(true)

// --- MÉTODOS ---
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    sortedPodcastDetails.value.forEach((p) => selectedPodcasts.value.add(p.id))
  } else {
    selectedPodcasts.value.clear()
  }
}

const generateReport = () => {
  isGeneratingReport.value = true
  const doc = new jsPDF()
  // ... (el resto del script no cambia)
  doc.save(`Reporte-URG-${new Date().toLocaleDateString()}.pdf`)
  isGeneratingReport.value = false
}

const fetchStats = (isManualRefresh = false) => {
  authStore.fetchDashboardStats()
  if (isManualRefresh) console.log('Refrescando datos...')
}

const togglePodcastExpansion = (podcastId) => {
  expandedPodcastId.value = expandedPodcastId.value === podcastId ? null : podcastId
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const sortIcon = (key) => {
  if (sortKey.value !== key) return 'fa-sort'
  return sortAsc.value ? 'fa-sort-up' : 'fa-sort-down'
}

const sortedPodcastDetails = computed(() => {
  if (!stats.value || !stats.value.podcastDetails) return []
  return [...stats.value.podcastDetails].sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]
    if (typeof valA === 'string') {
      valA = valA.toLowerCase()
      valB = b[sortKey.value].toLowerCase()
    }
    if (valA < valB) return sortAsc.value ? -1 : 1
    if (valA > valB) return sortAsc.value ? 1 : -1
    return 0
  })
})
</script>

<style scoped>
/* ESTILOS ORIGINALES (SIN CAMBIOS) */
.dashboard-container {
  background-color: #f8f9fa;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}
.stat-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 1px solid #e9ecef;
}
.stat-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}
.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0d4d98;
}
.card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}
.card-header {
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 700;
}
th.sortable {
  cursor: pointer;
  user-select: none;
}
th.sortable:hover {
  background-color: #f1f3f5;
}
th .fas {
  margin-left: 0.5rem;
  color: #adb5bd;
}
.table {
  margin-bottom: 0;
}
.expandable-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.expandable-row:hover {
  background-color: #f8f9fa;
}
.chevron-icon {
  transition: transform 0.3s ease;
  font-size: 0.8em;
  color: #6c757d;
}
.chevron-icon.is-expanded {
  transform: rotate(90deg);
}
.details-row > td {
  padding: 0 !important;
  border-top: 2px solid #0d4d98 !important;
}
.episode-details-container {
  background-color: #f8f9fa;
  padding: 1rem 1.5rem 1rem 3.5rem;
}
.episode-details-container .table {
  background-color: transparent;
  font-size: 0.9rem;
}
.episode-details-container th {
  font-weight: 600;
  color: #6c757d;
  border: none;
}
.episode-details-container td {
  border-top: 1px solid #e9ecef;
}
.episode-details-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #495057;
}
.status-icon {
  font-weight: bold;
  font-size: 1.2rem;
}
.status-icon.enabled {
  color: #198754;
}
.status-icon.disabled {
  color: #dc3545;
}
.styled-checkbox {
  transform: scale(1.2);
  border: 2px solid #0d4d98 !important;
  box-shadow: none !important;
}
.styled-checkbox:checked {
  background-color: #0d4d98 !important;
  border-color: #0d4d98 !important;
}

/* --- [NUEVO] ESTILO RESPONSIVO CON SCROLL HORIZONTAL --- */
@media (max-width: 992px) {
  .table-wrapper {
    overflow-x: auto; /* Habilita el scroll horizontal */
    -webkit-overflow-scrolling: touch; /* Scroll más suave en dispositivos iOS */
  }
  .responsive-table {
    /* Asegura que la tabla tenga un ancho mínimo antes de que aparezca el scroll */
    min-width: 800px;
  }
  .episode-details-container {
    padding: 1rem;
  }
}
</style>
