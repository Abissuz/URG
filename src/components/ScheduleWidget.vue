<template>
  <div class="schedule-widget-container cronograma-container">
    <div class="widget-header">
      <h2 class="section-title">Cronograma</h2>
      <div class="view-tabs">
        <button @click="activeView = 'upcoming'" :class="{ active: activeView === 'upcoming' }">
          Próximamente
        </button>
        <button @click="activeView = 'byDay'" :class="{ active: activeView === 'byDay' }">
          Ver por Día
        </button>
      </div>
    </div>

    <div class="widget-content">
      <div v-if="activeView === 'upcoming'">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
        <ul v-else-if="upcomingItems.length > 0" class="schedule-list">
          <li
            v-for="(item, index) in upcomingItems"
            :key="index"
            class="schedule-item upcoming-item"
          >
            <div class="item-time-day">
              <span>{{ item.formattedTime }}</span>
              <span class="day-badge">{{ item.dayLabel }}</span>
            </div>
            <div class="item-details">
              <span class="item-title">{{ item.programTitle }}</span>
              <span class="item-host">por {{ item.hostName }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-center text-muted py-3">No hay programas agendados próximamente.</p>
      </div>

      <div v-if="activeView === 'byDay'">
        <div class="day-selector">
          <button
            v-for="day in weekdays"
            :key="day"
            @click="selectedDayIndex = getDayIndex(day)"
            :class="{ active: selectedDayIndex === getDayIndex(day) }"
          >
            {{ day.substring(0, 3) }}
          </button>
        </div>
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
        <ul v-else-if="itemsForSelectedDay.length > 0" class="schedule-list">
          <li v-for="(item, index) in itemsForSelectedDay" :key="index" class="schedule-item">
            <span class="item-time">{{ formatTime(item.time) }}</span>
            <div class="item-details">
              <span class="item-title">{{ item.programTitle }}</span>
              <span class="item-host">por {{ item.hostName }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-center text-muted py-3">No hay programas agendados para este día.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { showInfoToast, showErrorToast } from '@/stores/notifications.js'

const activeView = ref('upcoming')
const loading = ref(true)
const schedule = ref({})
// La semana completa se mantiene para cálculos internos con new Date().getDay()
const fullWeek = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábado']
// La lista de días laborables se mantiene, ya es correcta
const weekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']

// [MODIFICADO] Se eliminan los días del fin de semana que no se usarán
const shortDays = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
}

// [MODIFICADO] Función para establecer el día por defecto
const getInitialDayIndex = () => {
  const today = new Date().getDay() // 0 para Domingo, 6 para Sábado
  // Si es fin de semana, por defecto muestra Lunes (índice 1)
  return today === 0 || today === 6 ? 1 : today
}

const selectedDayIndex = ref(getInitialDayIndex())
const currentTimeRef = ref(new Date())
let timeInterval = null
const isInitialLoad = ref(true)

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTimeRef.value = new Date()
  }, 60000)

  const scheduleRef = doc(db, 'schedule', 'main')
  onSnapshot(
    scheduleRef,
    (docSnap) => {
      if (docSnap.exists()) {
        schedule.value = docSnap.data()
        if (isInitialLoad.value) {
          isInitialLoad.value = false
        } else {
          showInfoToast('El cronograma ha sido actualizado')
        }
      } else {
        console.warn('Documento de cronograma no encontrado.')
      }
      loading.value = false
    },
    (error) => {
      console.error('Error cargando el cronograma:', error)
      showErrorToast('No se pudo cargar el cronograma')
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const date = new Date()
  date.setHours(hours, minutes, 0)
  return date.toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const getDayIndex = (dayName) => {
  return fullWeek.indexOf(dayName)
}

// La lógica de upcomingItems ya filtraba los fines de semana, por lo que se mantiene igual.
const upcomingItems = computed(() => {
  const now = currentTimeRef.value
  const todayIndex = now.getDay()
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()

  let allFutureItems = []

  for (let i = 0; i < 7; i++) {
    const dayIndex = (todayIndex + i) % 7
    const dayName = fullWeek[dayIndex]

    if (dayName === 'sábado' || dayName === 'domingo') {
      continue // Esta línea ya excluía los fines de semana
    }

    const itemsForDay = schedule.value[dayName] || []
    const filteredItems = itemsForDay
      .map((item) => {
        const [hours, minutes] = item.time.split(':')
        return { ...item, timeInMinutes: parseInt(hours) * 60 + parseInt(minutes) }
      })
      .filter((item) => (i === 0 ? item.timeInMinutes >= currentTimeInMinutes : true))
      .map((item) => ({
        ...item,
        dayIndex: dayIndex,
        formattedTime: formatTime(item.time),
        dayLabel: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : shortDays[dayName],
      }))
    allFutureItems.push(...filteredItems)
  }

  allFutureItems.sort((a, b) => {
    let dayDiffA = a.dayIndex - todayIndex
    let dayDiffB = b.dayIndex - todayIndex
    if (dayDiffA < 0) dayDiffA += 7
    if (dayDiffB < 0) dayDiffB += 7
    if (dayDiffA !== dayDiffB) return dayDiffA - dayDiffB
    return a.timeInMinutes - b.timeInMinutes
  })

  return allFutureItems.slice(0, 6)
})

const itemsForSelectedDay = computed(() => {
  const dayName = fullWeek[selectedDayIndex.value]
  const items = schedule.value[dayName] || []
  return items.sort((a, b) => a.time.localeCompare(b.time))
})
</script>

<style scoped>
/* Tus estilos no necesitan cambios */
.cronograma-container {
  width: 50%;
}
.schedule-widget-container {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 0.75rem;
  font-family: 'Sulphur Point', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 0.5rem;
  overflow: hidden;
  overflow-y: auto;
}
.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}
.section-title {
  color: #0d4b94;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
}
.view-tabs {
  display: flex;
  background-color: #e9ecef;
  border-radius: 50px;
  padding: 4px;
}
.view-tabs button {
  background: transparent;
  border: none;
  padding: 6px 16px;
  font-size: clamp(12px, 1vw, 20px);
  font-weight: 600;
  cursor: pointer;
  border-radius: 50px;
  color: #495057;
  transition: all 0.3s ease;
}
.view-tabs button.active {
  background-color: white;
  color: #0d4d98;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.day-selector {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  background-color: #e9ecef;
  border-radius: 8px;
  padding: 6px;
  margin-bottom: 1rem;
}
.day-selector button {
  flex-grow: 1;
  text-align: center;
  background: transparent;
  border: none;
  padding: 8px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 6px;
  color: #495057;
  text-transform: uppercase;
  transition: all 0.3s ease;
}
.day-selector button.active {
  background-color: #0d4d98;
  color: white;
}
.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e9ecef;
}
.schedule-item:last-child {
  border-bottom: none;
}
.item-time {
  font-weight: bold;
  font-size: 0.9em;
  color: #0d4d98;
  width: 80px;
  flex-shrink: 0;
}
.item-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: 1.3;
}
.item-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #343a40;
}
.item-host {
  font-size: 0.85em;
  color: #6c757d;
}
.upcoming-item .item-time-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 75px;
  flex-shrink: 0;
  text-align: center;
}
.upcoming-item .item-time-day span:first-child {
  font-weight: 700;
  font-size: 1em;
  color: #0d4d98;
}
.day-badge {
  font-size: 0.7em;
  font-weight: 700;
  color: white;
  background-color: #ff8a00;
  padding: 3px 7px;
  border-radius: 4px;
  text-transform: uppercase;
}
@media screen and (max-width: 1220px) {
  .widget-header {
    flex-direction: column;
    gap: 5px;
  }
}
@media screen and (max-width: 812px) {
  .main {
    flex-direction: column;
  }
  .music-container,
  .cronograma-container {
    width: 100%;
  }
}
@media screen and (max-width: 768px) {
  .item-time {
    width: 70px;
  }
  .upcoming-item .item-time-day {
    width: 55px;
  }
}
</style>
