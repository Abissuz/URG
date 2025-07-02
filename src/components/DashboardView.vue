<template>
  <div class="dashboard-container p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Panel de Administración</h1>
      <button
        @click="fetchStats"
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
      <p class="fw-bold">Ocurrió un error al cargar las estadísticas:</p>
      <code>{{ error }}</code>
      <button @click="fetchStats" class="btn btn-sm btn-danger mt-2">Reintentar</button>
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
        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-header">
              <h3 class="card-title mb-0">Estadísticas por Podcast</h3>
            </div>
            <div class="card-body table-responsive">
              <table class="table table-hover table-striped mb-0">
                <thead>
                  <tr>
                    <th @click="sortBy('title')" class="sortable">
                      Podcast <i class="fas" :class="sortIcon('title')"></i>
                    </th>
                    <th @click="sortBy('episodeCount')" class="sortable text-center">
                      Episodios <i class="fas" :class="sortIcon('episodeCount')"></i>
                    </th>
                    <th @click="sortBy('commentCount')" class="sortable text-center">
                      Comentarios <i class="fas" :class="sortIcon('commentCount')"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="podcast in sortedPodcastDetails" :key="podcast.title">
                    <td>{{ podcast.title }}</td>
                    <td class="text-center fw-bold">{{ podcast.episodeCount }}</td>
                    <td class="text-center fw-bold">{{ podcast.commentCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h3 class="card-title mb-0">Equipo de Moderadores</h3>
            </div>
            <ul
              v-if="stats.moderatorEmails && stats.moderatorEmails.length > 0"
              class="list-group list-group-flush"
            >
              <li v-for="email in stats.moderatorEmails" :key="email" class="list-group-item">
                {{ email }}
              </li>
            </ul>
            <div v-else class="card-body">
              <p class="text-muted mb-0">No hay moderadores asignados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

// 1. Conexión con el store de Pinia (nuestra fuente de verdad)
const authStore = useAuthStore()

// 2. Extraemos las variables del store y les damos un alias para que coincidan con la plantilla
const { dashboardStats: stats, loadingStats: loading, statsError: error } = storeToRefs(authStore)

// 3. Creamos una función local que simplemente llama a la acción del store
const fetchStats = () => {
  authStore.fetchDashboardStats()
}

// 4. Lógica para ordenar la tabla (copiada de tu plantilla)
const sortKey = ref('title')
const sortAsc = ref(true)

const sortedPodcastDetails = computed(() => {
  if (!stats.value || !stats.value.podcastDetails) return []

  return [...stats.value.podcastDetails].sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]

    if (typeof valA === 'string') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }

    if (valA < valB) return sortAsc.value ? -1 : 1
    if (valA > valB) return sortAsc.value ? 1 : -1
    return 0
  })
})

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

// 5. Cuando el componente se monta, busca los datos iniciales
onMounted(() => {
  // Solo busca los datos si no los tenemos ya
  if (!stats.value) {
    fetchStats()
  }
})
</script>

<style scoped>
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
  transition: color 0.2s;
}
th.sortable:hover .fas {
  color: #343a40;
}
.table {
  margin-bottom: 0;
}
</style>
