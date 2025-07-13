<template>
  <div class="admin-panel">
    <header class="panel-header">
      <h1>Panel de Administración</h1>
      <div class="admin-tabs">
        <button
          @click="activeAdminView = 'podcasts'"
          :class="{ active: activeAdminView === 'podcasts' }"
        >
          Gestionar Podcasts
        </button>
        <button
          @click="activeAdminView = 'schedule'"
          :class="{ active: activeAdminView === 'schedule' }"
        >
          Gestionar Cronograma
        </button>
        <button @click="viewRequests" :class="{ active: activeAdminView === 'requests' }">
          Peticiones
          <span v-if="authStore.hasNewSongRequest" class="notification-dot-tab"></span>
        </button>
        <button
          v-if="authStore.isAdmin"
          @click="activeAdminView = 'dashboard'"
          :class="{ active: activeAdminView === 'dashboard' }"
        >
          Dashboard y Usuarios
        </button>
      </div>
    </header>

    <div
      v-if="activeAdminView === 'podcasts'"
      class="panel-layout"
      :class="{ 'is-editing-mobile': isEditingMobile }"
    >
      <aside class="list-column">
        <div class="list-header">
          <h2>Podcasts</h2>
          <button @click="prepareNewPodcast" class="add-new-btn" title="Añadir nuevo podcast">
            <img src="@/assets/img/mas.png" alt="Añadir" class="plus" />
          </button>
        </div>
        <div v-if="isLoading" class="loading-indicator">Cargando podcasts...</div>
        <ul v-else class="podcast-list">
          <li
            v-for="podcast in podcasts"
            :key="podcast.id"
            class="podcast-list-item"
            :class="{ active: selectedPodcastInfo && selectedPodcastInfo.id === podcast.id }"
            @click="selectPodcast(podcast)"
          >
            {{ podcast.title }}
          </li>
        </ul>
      </aside>
      <main class="form-column">
        <div v-if="!selectedPodcastInfo" class="form-placeholder">
          <p>← Selecciona un podcast o haz clic en '+' para crear uno nuevo.</p>
        </div>
        <form v-else @submit.prevent="saveChanges" class="edit-form">
          <button @click="isEditingMobile = false" type="button" class="back-to-list-btn">
            &larr; Volver a la lista
          </button>
          <h2>{{ form.id ? 'Editando: ' + form.title : 'Creando Nuevo Podcast' }}</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="title">Título del Podcast</label>
              <input type="text" id="title" v-model="form.title" required />
            </div>
            <div class="form-group">
              <label for="hostName">Nombre del Autor/Host</label>
              <input type="text" id="hostName" v-model="form.host.name" required />
            </div>
            <div class="form-group full-width">
              <label for="description">Descripción</label>
              <textarea id="description" v-model="form.description" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label>Imagen de Portada</label>
              <label for="coverImageFile" class="file-upload-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"></path>
                </svg>
                <span>{{ coverImageFile ? coverImageFile.name : 'Subir Portada' }}</span>
              </label>
              <input
                type="file"
                id="coverImageFile"
                @change="handleCoverImageSelection"
                accept="image/jpeg, image/png, image/webp"
                class="file-upload-input"
              />
              <img
                v-if="coverPreview"
                :src="coverPreview"
                alt="Vista previa de la portada"
                class="image-preview"
              />
            </div>

            <div class="form-group">
              <label>Foto del Autor</label>
              <label for="hostImageFile" class="file-upload-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"></path>
                </svg>
                <span>{{ hostImageFile ? hostImageFile.name : 'Subir Foto' }}</span>
              </label>
              <input
                type="file"
                id="hostImageFile"
                @change="handleHostImageSelection"
                accept="image/jpeg, image/png, image/webp"
                class="file-upload-input"
              />
              <img
                v-if="hostPreview"
                :src="hostPreview"
                alt="Vista previa del autor"
                class="image-preview"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="isSaving" class="save-btn">
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button v-if="form.id" @click="deletePodcast" type="button" class="delete-podcast-btn">
              Eliminar Podcast
            </button>
          </div>
          <hr />
          <div v-if="form.id" class="episodes-section">
            <div class="episodes-header">
              <h3>Episodios</h3>
              <button
                @click="openNewEpisodeModal"
                type="button"
                class="add-episode-btn"
                :disabled="!form.id"
              >
                Añadir Episodio
              </button>
            </div>
            <div v-if="episodesLoading" class="loading-indicator-small">Cargando episodios...</div>

            <div v-if="episodes.length > 0" class="episode-list-header">
              <span>Episodio</span>
              <span class="text-center">Comentarios</span>
              <span class="text-center">Eliminar</span>
            </div>

            <ul v-if="episodes.length > 0" class="episode-list">
              <li v-for="episode in episodes" :key="episode.id" class="episode-item">
                <span class="episode-title">{{ episode.title }}</span>
                <div class="action-cell">
                  <button
                    @click="toggleComments(episode)"
                    type="button"
                    class="comment-toggle"
                    :class="{ active: episode.commentsEnabled }"
                    :title="
                      episode.commentsEnabled ? 'Deshabilitar comentarios' : 'Habilitar comentarios'
                    "
                  >
                    <span class="toggle-knob"></span>
                  </button>
                </div>
                <div class="action-cell">
                  <button
                    @click="deleteEpisode(episode.id)"
                    type="button"
                    class="delete-episode-btn"
                    title="Eliminar episodio"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        fill="currentColor"
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      ></path>
                    </svg>
                  </button>
                </div>
              </li>
            </ul>
            <p v-else>Este podcast aún no tiene episodios.</p>
          </div>
          <p v-else class="text-muted mt-4">
            Guarda el nuevo podcast para poder añadirle episodios.
          </p>
        </form>
      </main>
    </div>

    <div v-else-if="activeAdminView === 'schedule'" class="schedule-manager-layout">
      <aside class="day-tabs">
        <button
          v-for="day in weekdays"
          :key="day"
          class="day-tab-item"
          :class="{ active: selectedDayForEditing === day }"
          @click="selectedDayForEditing = day"
        >
          {{ day.charAt(0).toUpperCase() + day.slice(1) }}
        </button>
      </aside>
      <main class="schedule-content">
        <div v-if="scheduleLoading" class="loading-indicator">Cargando...</div>
        <div v-else>
          <ul v-if="schedule[selectedDayForEditing]?.length > 0" class="schedule-list-admin">
            <li
              v-for="(item, index) in schedule[selectedDayForEditing]"
              :key="index"
              class="schedule-item-admin"
            >
              <div class="item-info-admin">
                <span class="item-time">{{ formatTime(item.time) }}</span>
                <div class="item-details">
                  <span class="item-title">{{ item.programTitle }}</span>
                  <span class="item-host">por {{ item.hostName }}</span>
                </div>
              </div>
              <button
                @click="removeScheduleItem(selectedDayForEditing, item)"
                class="delete-schedule-item"
                title="Eliminar"
              >
                &times;
              </button>
            </li>
          </ul>
          <p v-else class="text-muted text-center py-4">No hay programas para este día.</p>
          <hr />
          <form @submit.prevent="addScheduleItem" class="add-schedule-form">
            <h4 class="mb-3">
              Añadir a
              {{ selectedDayForEditing.charAt(0).toUpperCase() + selectedDayForEditing.slice(1) }}
            </h4>
            <input type="time" v-model="newScheduleItem.time" required />
            <select v-model="newScheduleItem.podcastId" required>
              <option disabled value="">Selecciona un podcast...</option>
              <option v-for="p in podcasts" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
            <button type="submit" class="add-schedule-btn" title="Añadir programa">
              <img src="@/assets/img/mas.png" alt="Añadir" class="plus" />
            </button>
          </form>
        </div>
      </main>
    </div>

    <div v-else-if="activeAdminView === 'requests'">
      <SongRequestsView />
    </div>
    <div v-else-if="activeAdminView === 'dashboard'">
      <DashboardView />
      <UserManagementView />
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isEpisodeModalOpen" class="modal-overlay" @click="closeNewEpisodeModal">
      <div class="modal-content" @click.stop>
        <h3>Añadir Nuevo Episodio</h3>
        <form @submit.prevent="saveNewEpisode">
          <div class="form-group">
            <label for="episodeTitle">Título del Episodio</label>
            <input type="text" id="episodeTitle" v-model="newEpisodeForm.title" required />
          </div>

          <div class="form-group">
            <label for="episodeAudioFile">Archivo de Audio (MP3)</label>
            <input
              type="file"
              id="episodeAudioFile"
              @change="handleFileSelection"
              accept="audio/mp3,audio/mpeg"
              required
            />
          </div>

          <div v-if="isUploading" class="progress-bar-container">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
            <span>Subiendo... {{ uploadProgress.toFixed(0) }}%</span>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeNewEpisodeModal" class="cancel-btn">Cancelar</button>
            <button type="submit" :disabled="isSavingEpisode || isUploading" class="save-btn">
              {{
                isUploading ? 'Subiendo...' : isSavingEpisode ? 'Guardando...' : 'Guardar Episodio'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  getDocs,
  arrayRemove,
} from 'firebase/firestore'
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/components/DashboardView.vue'
import UserManagementView from '@/components/UserManagementView.vue'
import SongRequestsView from '@/components/SongRequestsView.vue'
import { getAuth } from 'firebase/auth'
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showConfirmDialog,
} from '@/stores/notifications.js'

const authStore = useAuthStore()
const activeAdminView = ref('podcasts')

const podcasts = ref([])
const isLoading = ref(true)
const selectedPodcastInfo = ref(null)
const form = ref({
  id: null,
  title: '',
  description: '',
  coverImage: '',
  host: { name: '', image: '' },
})
const isSaving = ref(false)
const episodes = ref([])
const episodesLoading = ref(false)
const isEpisodeModalOpen = ref(false)
const isSavingEpisode = ref(false)
const isEditingMobile = ref(false)

const newEpisodeForm = ref({
  title: '',
  file: null,
})
const isUploading = ref(false)
const uploadProgress = ref(0)

let unsubscribeEpisodes = null

const schedule = ref({})
const scheduleLoading = ref(true)
const weekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
const selectedDayForEditing = ref('lunes')
const newScheduleItem = ref({ time: '', podcastId: '' })

const coverImageFile = ref(null)
const hostImageFile = ref(null)
const coverPreview = ref('')
const hostPreview = ref('')

const viewRequests = () => {
  activeAdminView.value = 'requests'
  authStore.clearNewSongRequest()
}

const naturalSort = (a, b) =>
  a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })

onMounted(() => {
  if (authStore.isAdmin) {
    activeAdminView.value = 'dashboard'
  } else if (authStore.isModerator) {
    activeAdminView.value = 'requests'
  }

  const podcastsCollection = collection(db, 'podcasts')
  onSnapshot(
    podcastsCollection,
    (querySnapshot) => {
      const fetchedPodcasts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      fetchedPodcasts.sort(naturalSort)
      podcasts.value = fetchedPodcasts
      isLoading.value = false
      if (podcasts.value.length > 0 && !selectedPodcastInfo.value) {
        selectPodcast(podcasts.value[0])
      }
    },
    (error) => showErrorToast('Error al cargar podcasts.'),
  )

  const scheduleRef = doc(db, 'schedule', 'main')
  onSnapshot(
    scheduleRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        weekdays.forEach((day) => {
          if (!data[day]) data[day] = []
        })
        schedule.value = data
      } else {
        schedule.value = weekdays.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
      }
      scheduleLoading.value = false
    },
    (error) => showErrorToast('Error al cargar cronograma.'),
  )
})

watch(activeAdminView, (newView) => {
  if (newView === 'dashboard') {
    authStore.fetchDashboardStats()
    authStore.fetchAllUsers()
  }
})

watch(
  selectedPodcastInfo,
  (newVal) => {
    if (!newVal) isEditingMobile.value = false
    if (unsubscribeEpisodes) unsubscribeEpisodes()
    if (newVal && newVal.id) {
      form.value = JSON.parse(JSON.stringify(newVal))
      coverPreview.value = newVal.coverImage || ''
      hostPreview.value = newVal.host.image || ''
      coverImageFile.value = null
      hostImageFile.value = null

      episodesLoading.value = true
      const episodesCollection = collection(db, 'podcasts', newVal.id, 'episodes')
      const q = query(episodesCollection)
      unsubscribeEpisodes = onSnapshot(q, (snapshot) => {
        let fetchedEpisodes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        fetchedEpisodes.sort(naturalSort)
        episodes.value = fetchedEpisodes
        episodesLoading.value = false
      })
    } else {
      form.value = {
        id: null,
        title: '',
        description: '',
        coverImage: '',
        host: { name: '', image: '' },
      }
      coverPreview.value = ''
      hostPreview.value = ''
      coverImageFile.value = null
      hostImageFile.value = null

      episodes.value = []
    }
  },
  { deep: true },
)

const handleCoverImageSelection = (event) => {
  const file = event.target.files[0]
  if (file) {
    coverImageFile.value = file
    coverPreview.value = URL.createObjectURL(file)
  }
}

const handleHostImageSelection = (event) => {
  const file = event.target.files[0]
  if (file) {
    hostImageFile.value = file
    hostPreview.value = URL.createObjectURL(file)
  }
}

const selectPodcast = (podcast) => {
  selectedPodcastInfo.value = podcast
  isEditingMobile.value = true
}

const prepareNewPodcast = () => {
  selectedPodcastInfo.value = {}
  isEditingMobile.value = true
}

const saveChanges = async () => {
  if (!form.value.title) return showWarningToast('El título es obligatorio.')
  isSaving.value = true

  try {
    const storage = getStorage()

    if (coverImageFile.value) {
      const coverPath = `podcast-covers/${Date.now()}_${coverImageFile.value.name}`
      const coverUploadRef = storageRef(storage, coverPath)
      const uploadTask = await uploadBytesResumable(coverUploadRef, coverImageFile.value)
      form.value.coverImage = await getDownloadURL(uploadTask.ref)
    }

    if (hostImageFile.value) {
      const hostPath = `host-photos/${Date.now()}_${hostImageFile.value.name}`
      const hostUploadRef = storageRef(storage, hostPath)
      const uploadTask = await uploadBytesResumable(hostUploadRef, hostImageFile.value)
      form.value.host.image = await getDownloadURL(uploadTask.ref)
    }

    const podcastData = { ...form.value }
    delete podcastData.id

    if (form.value.id) {
      await updateDoc(doc(db, 'podcasts', form.value.id), podcastData)
    } else {
      const newDocRef = await addDoc(collection(db, 'podcasts'), podcastData)
      selectPodcast({ id: newDocRef.id, ...podcastData })
    }

    showSuccessToast('¡Podcast guardado con éxito!')
  } catch (error) {
    console.error('Error al guardar el podcast:', error)
    showErrorToast('No se pudo guardar el podcast.')
  } finally {
    isSaving.value = false
    coverImageFile.value = null
    hostImageFile.value = null
  }
}

const deletePodcast = async () => {
  const podcastId = form.value.id
  if (!podcastId) return
  const confirmed = await showConfirmDialog(
    `¿Eliminar Podcast?`,
    `Estás a punto de eliminar "${form.value.title}" y todos sus episodios. Esta acción es irreversible.`,
  )
  if (!confirmed) return

  isSaving.value = true
  try {
    const podcastRef = doc(db, 'podcasts', podcastId)
    const episodesSnapshot = await getDocs(collection(podcastRef, 'episodes'))
    const episodeIdsToDelete = episodesSnapshot.docs.map((d) => d.id)

    const deletePromises = episodesSnapshot.docs.map((eDoc) => deleteDoc(eDoc.ref))
    await Promise.all(deletePromises)
    await deleteDoc(podcastRef)

    const usersSnapshot = await getDocs(collection(db, 'users'))
    const favoriteUpdates = usersSnapshot.docs
      .map((userDoc) => {
        const favs = userDoc.data().favoritos || {}
        const updatedPodcasts = (favs.podcasts || []).filter((id) => id !== podcastId)
        const updatedEpisodes = (favs.episodios || []).filter(
          (ep) => !episodeIdsToDelete.includes(ep.id),
        )
        if (
          updatedPodcasts.length < (favs.podcasts || []).length ||
          updatedEpisodes.length < (favs.episodios || []).length
        ) {
          return updateDoc(userDoc.ref, {
            'favoritos.podcasts': updatedPodcasts,
            'favoritos.episodios': updatedEpisodes,
          })
        }
      })
      .filter(Boolean)

    await Promise.all(favoriteUpdates)
    showSuccessToast(`El podcast "${form.value.title}" ha sido eliminado.`)
    selectedPodcastInfo.value = null
  } catch (error) {
    showErrorToast('Ocurrió un error al eliminar el podcast.')
  } finally {
    isSaving.value = false
  }
}

const openNewEpisodeModal = () => {
  newEpisodeForm.value = { title: '', file: null }
  isUploading.value = false
  uploadProgress.value = 0
  isEpisodeModalOpen.value = true
}

const closeNewEpisodeModal = () => {
  isEpisodeModalOpen.value = false
}

const handleFileSelection = (event) => {
  const file = event.target.files[0]
  if (file) {
    newEpisodeForm.value.file = file
  }
}

const saveNewEpisode = async () => {
  if (!newEpisodeForm.value.title || !newEpisodeForm.value.file) {
    return showWarningToast('Debes proporcionar un título y seleccionar un archivo de audio.')
  }

  isSavingEpisode.value = true
  isUploading.value = true
  uploadProgress.value = 0

  try {
    const file = newEpisodeForm.value.file
    const podcastId = selectedPodcastInfo.value.id
    const filePath = `podcasts/${podcastId}/${file.name}`
    const storage = getStorage()
    const sRef = storageRef(storage, filePath)

    const uploadTask = uploadBytesResumable(sRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      },
      (error) => {
        console.error('Error en la subida:', error)
        showErrorToast('Error al subir el archivo de audio.')
        isUploading.value = false
        isSavingEpisode.value = false
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

        const episodesCollection = collection(db, 'podcasts', podcastId, 'episodes')
        await addDoc(episodesCollection, {
          title: newEpisodeForm.value.title,
          audioURL: downloadURL,
          commentsEnabled: true,
          publishedDate: serverTimestamp(),
        })

        showSuccessToast('Episodio añadido correctamente.')
        closeNewEpisodeModal()
        isUploading.value = false
        isSavingEpisode.value = false
      },
    )
  } catch (error) {
    showErrorToast('Ocurrió un error al guardar el episodio.')
    isUploading.value = false
    isSavingEpisode.value = false
  }
}

const deleteEpisode = async (episodeId) => {
  const confirmed = await showConfirmDialog(
    '¿Eliminar Episodio?',
    'Esta acción no se puede deshacer.',
  )
  if (!confirmed) return
  try {
    await deleteDoc(doc(db, 'podcasts', selectedPodcastInfo.value.id, 'episodes', episodeId))
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const favoriteUpdates = usersSnapshot.docs
      .map((userDoc) => {
        const userFavorites = userDoc.data().favoritos?.episodios
        if (!Array.isArray(userFavorites) || userFavorites.length === 0) return
        const originalLength = userFavorites.length
        let updatedFavorites
        if (typeof userFavorites[0] === 'string') {
          updatedFavorites = userFavorites.filter((id) => id !== episodeId)
        } else if (typeof userFavorites[0] === 'object' && userFavorites[0] !== null) {
          updatedFavorites = userFavorites.filter((fav) => fav.id !== episodeId)
        } else {
          updatedFavorites = userFavorites
        }
        if (updatedFavorites.length < originalLength) {
          return updateDoc(userDoc.ref, { 'favoritos.episodios': updatedFavorites })
        }
      })
      .filter(Boolean)
    await Promise.all(favoriteUpdates)
    showSuccessToast('Episodio eliminado.')
  } catch (error) {
    showErrorToast('Ocurrió un error al eliminar el episodio.')
  }
}

const toggleComments = async (episode) => {
  try {
    await updateDoc(doc(db, 'podcasts', selectedPodcastInfo.value.id, 'episodes', episode.id), {
      commentsEnabled: !episode.commentsEnabled,
    })
    showSuccessToast(`Comentarios ${!episode.commentsEnabled ? 'habilitados' : 'deshabilitados'}.`)
  } catch (error) {
    showErrorToast('No se pudo actualizar el estado.')
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':')
  const date = new Date()
  date.setHours(hours, minutes, 0)
  return date.toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const addScheduleItem = async () => {
  const day = selectedDayForEditing.value
  const timeToAdd = newScheduleItem.value.time
  const podcastToAddId = newScheduleItem.value.podcastId
  if (!timeToAdd || !podcastToAddId) {
    return showWarningToast('Por favor, selecciona una hora y un podcast.')
  }
  if (schedule.value[day]?.some((item) => item.time === timeToAdd)) {
    return showErrorToast(`La hora ${formatTime(timeToAdd)} ya está ocupada.`)
  }
  const selectedP = podcasts.value.find((p) => p.id === podcastToAddId)
  if (!selectedP) return
  const newItem = {
    time: timeToAdd,
    programTitle: selectedP.title,
    podcastId: selectedP.id,
    hostName: selectedP.host.name,
  }
  const scheduleRef = doc(db, 'schedule', 'main')
  const updatedSchedule = [...(schedule.value[day] || []), newItem].sort((a, b) =>
    a.time.localeCompare(b.time),
  )
  try {
    await updateDoc(scheduleRef, { [day]: updatedSchedule })
    showSuccessToast('Programa añadido al cronograma.')
    newScheduleItem.value = { time: '', podcastId: '' }
  } catch (error) {
    showErrorToast('No se pudo añadir el programa.')
  }
}

const removeScheduleItem = async (day, itemToRemove) => {
  const confirmed = await showConfirmDialog(
    '¿Eliminar del Cronograma?',
    `Vas a quitar "${itemToRemove.programTitle}" de la programación.`,
  )
  if (!confirmed) return
  try {
    const scheduleRef = doc(db, 'schedule', 'main')
    await updateDoc(scheduleRef, { [day]: arrayRemove(itemToRemove) })
    showSuccessToast('Programa eliminado del cronograma.')
  } catch (error) {
    showErrorToast('No se pudo eliminar el programa.')
  }
}
</script>

<style scoped>
/* [NUEVO] ESTILOS PARA BOTÓN DE SUBIDA */
.file-upload-input {
  display: none;
}
.file-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #0075ffa8;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
}

.file-upload-btn span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}
.file-upload-btn svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: white;
}
.image-preview {
  width: 100%;
  max-width: 200px; /* Ancho máximo para la preview */
  height: auto;
  aspect-ratio: 16 / 9; /* Mantiene la proporción */
  margin-top: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  object-fit: cover;
}

/* Estilos para la barra de progreso */
.progress-bar-container {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin: 1rem 0;
  position: relative;
  height: 20px;
  text-align: center;
  color: #333;
  font-weight: bold;
}
.progress-bar {
  background-color: #4caf50;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}
.progress-bar-container span {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  line-height: 20px;
}

/* Estilos existentes... */
.admin-panel {
  padding: 2rem;
  background-color: #f4f6f8;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  margin-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
  flex-shrink: 0;
}
.panel-header h1 {
  font-size: 2rem;
  margin: 0;
  color: #333;
}
.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
  overflow-x: scroll;
}
.admin-tabs button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}
.admin-tabs button:hover {
  color: #0d4d98;
}
.admin-tabs button.active {
  color: #0d4d98;
  border-bottom-color: #0d4d98;
}
.panel-layout,
.schedule-manager-layout {
  display: flex;
  gap: 2rem;
  flex-grow: 1;
  overflow: hidden;
}
.list-column,
.form-column,
.day-tabs,
.schedule-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  height: 100%;
}
.list-column,
.day-tabs {
  flex: 0 0 300px;
  padding: 0.5rem;
}
.form-column,
.schedule-content {
  flex-grow: 1;
  padding: 1.5rem;
}
.list-header {
  padding: 1rem 1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notification-dot-tab {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: #dc3545;
  border-radius: 50%;
  animation: pulse-sm 1.5s infinite;
}
@keyframes pulse-sm {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(220, 53, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
  }
}
.list-header h2 {
  margin: 0;
}
.add-new-btn {
  background-color: #0d4d98;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.plus {
  width: 25px;
  height: 25px;
}
.podcast-list {
  list-style: none;
  padding: 0;
  margin-top: 8px;
}
.podcast-list-item {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}
.podcast-list-item:hover {
  background-color: #f5f5f5;
}
.podcast-list-item.active {
  background-color: #0075ffa8;
  color: #fff;
  font-weight: 700;
}
.form-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-size: 1.2rem;
}
.edit-form h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}
.form-group input,
.form-group textarea,
.add-schedule-form input,
.add-schedule-form select {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0075ffa8;
}
.form-actions {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.save-btn,
.delete-podcast-btn,
.cancel-btn,
.add-episode-btn {
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}
.save-btn {
  background-color: #0075ffa8;
}
.save-btn:hover {
  background-color: #0265d6a8;
}
.save-btn:disabled,
.add-episode-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.delete-podcast-btn {
  background-color: #dc3545;
}
.delete-podcast-btn:hover {
  background-color: #c82333;
}
.cancel-btn {
  background-color: #6c757d;
}
.add-episode-btn {
  padding: 0.5rem 1rem;
  background-color: #0075ffa8;
}
.episodes-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}
.episodes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.episodes-header h3 {
  margin: 0;
  font-size: 1.25rem;
}
.episode-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.delete-episode-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.delete-episode-btn svg {
  display: block;
}
.comment-toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: #ccc;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
  padding: 0;
}
.comment-toggle.active {
  background-color: #28a745;
}
.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}
.comment-toggle.active .toggle-knob {
  transform: translateX(20px);
}
.loading-indicator,
.loading-indicator-small {
  padding: 1rem;
  text-align: center;
  color: #888;
}
.back-to-list-btn {
  display: none;
  background: none;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #333;
}
.back-to-list-btn:hover {
  background-color: #f0f0f0;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
}
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #333;
}
.modal-content .form-group {
  margin-bottom: 1.5rem;
}
.modal-content .form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}
.modal-content input[type='text'],
.modal-content input[type='url'] {
  width: 100%;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.modal-actions .cancel-btn {
  background-color: #6c757d;
}
.modal-actions .cancel-btn:hover {
  background-color: #5a6268;
}
.modal-actions .save-btn {
  background-color: #28a745;
}
.modal-actions .save-btn:hover {
  background-color: #218838;
}
.schedule-manager-layout {
  padding: 0;
}
.day-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-right: 1px solid #e0e0e0;
  padding: 1rem 0.5rem;
}
.day-tab-item {
  width: 100%;
  padding: 0.75rem 1rem;
  font-weight: 600;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}
.day-tab-item.active {
  background-color: #0075ffa8;
  color: #fff;
}
.schedule-content {
  display: flex;
  flex-direction: column;
}
.schedule-list-admin {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}
.schedule-item-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}
.item-info-admin {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
}
.item-time {
  font-weight: 700;
  font-size: 0.9em;
  color: #0d4d98;
  flex-shrink: 0;
}
.item-details {
  display: flex;
  flex-direction: column;
}
.item-title {
  font-weight: 600;
}
.item-host {
  font-size: 0.8rem;
  color: #6c757d;
}
.delete-schedule-item {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem;
}
.add-schedule-form {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}
.add-schedule-form h4 {
  grid-column: 1 / -1;
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.add-schedule-btn {
  background-color: #0075ffa8;
  border-radius: 8px;
  border-color: #0000004f;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 992px) {
  .admin-panel {
    overflow-y: auto;
    padding: 1rem;
    height: auto;
  }
  .panel-layout {
    height: auto;
    overflow: visible;
    gap: 1rem;
  }
  .panel-layout .form-column {
    display: none;
  }
  .panel-layout .list-column {
    flex-basis: 100%;
    width: 100%;
  }
  .panel-layout.is-editing-mobile .list-column {
    display: none;
  }
  .panel-layout.is-editing-mobile .form-column {
    display: block;
    flex-basis: 100%;
    width: 100%;
  }
  .back-to-list-btn {
    display: inline-block;
  }
  .schedule-manager-layout {
    flex-direction: column;
    height: auto;
    overflow: visible;
    gap: 1rem;
  }
  .day-tabs {
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.5rem;
    flex: unset;
  }
  .day-tab-item {
    white-space: nowrap;
  }
  .list-column,
  .form-column,
  .day-tabs,
  .schedule-content {
    overflow-y: visible;
    height: auto;
    flex-basis: auto !important;
  }
}
@media (max-width: 768px) {
  .admin-panel {
    padding: 0.5rem;
  }
  .form-column,
  .schedule-content {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .panel-header h1 {
    font-size: 1.5rem;
  }
  .admin-tabs button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .form-actions button {
    width: 100%;
  }
  .add-schedule-form {
    grid-template-columns: 1fr;
  }
}

.episode-list-header,
.episode-item {
  display: grid;
  grid-template-columns: 1fr 120px 80px;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid #f0f0f0;
}
.episode-list-header {
  padding: 0.5rem 0.25rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #6c757d;
  border-bottom: 2px solid #e0e0e0;
  text-transform: uppercase;
  font-size: clamp(0.7rem, 1.5vw, 0.8rem);
}
.episode-item:last-child {
  border-bottom: none;
}
.episode-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  padding-right: 1rem;
}
.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
.text-center {
  text-align: center;
}
</style>
