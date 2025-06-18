<template>
  <div class="admin-panel">
    <header class="panel-header">
      <h1>Panel de Actualización de Contenido</h1>
      <p>Selecciona un podcast para editarlo o crea uno nuevo.</p>
    </header>

    <div class="panel-layout">
      <!-- Columna Izquierda: Lista de Podcasts -->
      <aside class="list-column">
        <div class="list-header">
          <h2>Podcasts</h2>
          <button @click="prepareNewPodcast" class="add-new-btn" title="Añadir nuevo podcast">
            +
          </button>
        </div>
        <div v-if="isLoading" class="loading-indicator">Cargando podcasts...</div>
        <ul v-else class="podcast-list">
          <li
            v-for="podcast in podcasts"
            :key="podcast.id"
            class="podcast-list-item"
            :class="{ active: selectedPodcast && selectedPodcast.id === podcast.id }"
            @click="selectPodcast(podcast)"
          >
            {{ podcast.title }}
          </li>
        </ul>
      </aside>

      <!-- Columna Derecha: Formulario de Edición -->
      <main class="form-column">
        <div v-if="!selectedPodcast" class="form-placeholder">
          <p>← Selecciona un podcast o haz clic en '+' para crear uno nuevo.</p>
        </div>

        <form v-else @submit.prevent="saveChanges" class="edit-form">
          <h2>{{ form.id ? 'Editando: ' + form.title : 'Creando Nuevo Podcast' }}</h2>

          <div class="form-grid">
            <div class="form-group">
              <label for="title">Título del Podcast</label
              ><input type="text" id="title" v-model="form.title" required />
            </div>
            <div class="form-group">
              <label for="hostName">Nombre del Autor/Host</label
              ><input type="text" id="hostName" v-model="form.host.name" required />
            </div>
            <div class="form-group full-width">
              <label for="description">Descripción</label
              ><textarea id="description" v-model="form.description" rows="4"></textarea>
            </div>
            <div class="form-group">
              <label for="coverImage">URL de la Imagen de Portada</label
              ><input
                type="url"
                id="coverImage"
                v-model="form.coverImage"
                placeholder="https://ejemplo.com/cover.png"
              />
            </div>
            <div class="form-group">
              <label for="hostImage">URL de la Foto del Autor</label
              ><input
                type="url"
                id="hostImage"
                v-model="form.host.image"
                placeholder="https://ejemplo.com/autor.png"
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
            <p v-if="saveSuccess" class="save-success-message">¡Guardado con éxito!</p>
          </div>

          <hr />
          <!-- Sección de gestión de episodios -->
          <div class="episodes-section">
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
            <ul v-else-if="episodes.length > 0" class="episode-list">
              <li v-for="episode in episodes" :key="episode.id" class="episode-item">
                <span class="episode-title">{{ episode.title }}</span>
                <!-- [NUEVO] Contenedor para los botones de acción del episodio -->
                <div class="episode-actions">
                  <!-- Interruptor para habilitar/deshabilitar comentarios -->
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
            <p v-else-if="form.id">Este podcast aún no tiene episodios.</p>
            <p v-else class="text-muted">Guarda el nuevo podcast para poder añadirle episodios.</p>
          </div>
        </form>
      </main>
    </div>

    <!-- Modal para añadir nuevo episodio -->
    <div v-if="isEpisodeModalOpen" class="modal-overlay" @click="closeNewEpisodeModal">
      <!-- ... contenido del modal ... -->
    </div>
  </div>
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
} from 'firebase/firestore'
import { db } from '@/firebase/config'

// --- ESTADO REACTIVO ---
const podcasts = ref([])
const selectedPodcast = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const saveSuccess = ref(false)
const form = ref({
  id: null,
  title: '',
  description: '',
  coverImage: '',
  host: { name: '', image: '' },
})
const episodes = ref([])
const episodesLoading = ref(false)
const isEpisodeModalOpen = ref(false)
const isSavingEpisode = ref(false)
const newEpisodeForm = ref({ title: '', audioURL: '' })
let unsubscribeEpisodes = null

// --- CICLO DE VIDA ---
onMounted(() => {
  const podcastsCollection = collection(db, 'podcasts')
  onSnapshot(podcastsCollection, (querySnapshot) => {
    const fetchedPodcasts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    fetchedPodcasts.sort((a, b) => a.title.localeCompare(b.title))
    podcasts.value = fetchedPodcasts
    isLoading.value = false
  })
})

watch(
  selectedPodcast,
  (newVal) => {
    if (unsubscribeEpisodes) unsubscribeEpisodes()
    if (newVal && newVal.id) {
      form.value = JSON.parse(JSON.stringify(newVal))
      episodesLoading.value = true
      const episodesCollection = collection(db, 'podcasts', newVal.id, 'episodes')
      const q = query(episodesCollection)
      unsubscribeEpisodes = onSnapshot(q, (snapshot) => {
        const fetchedEpisodes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        fetchedEpisodes.sort((a, b) => a.title.localeCompare(b.title))
        episodes.value = fetchedEpisodes
        episodesLoading.value = false
      })
    } else {
      resetForm()
      episodes.value = []
    }
  },
  { deep: true },
)

const toggleComments = async (episode) => {
  try {
    const episodeRef = doc(db, 'podcasts', form.value.id, 'episodes', episode.id)
    const newStatus = !episode.commentsEnabled
    await updateDoc(episodeRef, {
      commentsEnabled: newStatus,
    })
    // onSnapshot se encargará de actualizar la UI
  } catch (error) {
    console.error('Error al actualizar el estado de los comentarios:', error)
    alert('No se pudo cambiar el estado de los comentarios.')
  }
}
// --- FUNCIONES ---
const selectPodcast = (podcast) => {
  selectedPodcast.value = podcast
  saveSuccess.value = false
}

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    description: '',
    coverImage: '',
    host: { name: '', image: '' },
  }
}

const prepareNewPodcast = () => {
  selectedPodcast.value = {} // Dispara el watcher para limpiar el formulario
}

const saveChanges = async () => {
  if (!form.value.title) return alert('El título del podcast es obligatorio.')
  isSaving.value = true
  saveSuccess.value = false
  try {
    const podcastData = {
      title: form.value.title,
      description: form.value.description,
      coverImage: form.value.coverImage,
      host: { name: form.value.host.name, image: form.value.host.image },
      isActive: form.value.isActive !== undefined ? form.value.isActive : true,
    }

    if (form.value.id) {
      // Editando...
      const podcastRef = doc(db, 'podcasts', form.value.id)
      await updateDoc(podcastRef, podcastData)
    } else {
      // Creando...
      const newDocRef = await addDoc(collection(db, 'podcasts'), podcastData)
      // [MEJORADO] Se actualiza el estado local y se selecciona el nuevo podcast
      // para permitir añadir episodios inmediatamente.
      const newPodcast = { id: newDocRef.id, ...podcastData }
      // onSnapshot actualizará la lista de podcasts.value, no es necesario hacer push manual.
      selectPodcast(newPodcast)
    }

    saveSuccess.value = true
    setTimeout(() => (saveSuccess.value = false), 3000)
  } catch (error) {
    console.error('Error guardando podcast:', error)
    alert('Ocurrió un error al guardar.')
  } finally {
    isSaving.value = false
  }
}

// --- Funciones para el modal de episodios ---
const openNewEpisodeModal = () => {
  newEpisodeForm.value = { title: '', audioURL: '' }
  isEpisodeModalOpen.value = true
}

const closeNewEpisodeModal = () => {
  isEpisodeModalOpen.value = false
}

const saveNewEpisode = async () => {
  if (!newEpisodeForm.value.title || !newEpisodeForm.value.audioURL) {
    return alert('Ambos campos son obligatorios.')
  }
  isSavingEpisode.value = true
  try {
    const episodesCollection = collection(db, 'podcasts', form.value.id, 'episodes')
    await addDoc(episodesCollection, {
      title: newEpisodeForm.value.title,
      audioURL: newEpisodeForm.value.audioURL,
      publishedDate: serverTimestamp(),
    })
    closeNewEpisodeModal()
  } catch (error) {
    console.error('Error al guardar el episodio:', error)
    alert('Ocurrió un error al guardar el episodio.')
  } finally {
    isSavingEpisode.value = false
  }
}

const deleteEpisode = async (episodeId) => {
  if (
    !confirm(
      `¿Estás seguro de que quieres eliminar este episodio? Esta acción no se puede deshacer y también lo eliminará de los favoritos de todos los usuarios.`,
    )
  ) {
    return
  }
  try {
    const episodeRef = doc(db, 'podcasts', form.value.id, 'episodes', episodeId)
    await deleteDoc(episodeRef)
    const usersCollectionRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersCollectionRef)
    const updatePromises = []
    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data()
      if (userData.favoritos && Array.isArray(userData.favoritos.episodios)) {
        const favoriteEpisodes = userData.favoritos.episodios
        const updatedFavorites = favoriteEpisodes.filter((fav) => fav.id !== episodeId)
        if (updatedFavorites.length < favoriteEpisodes.length) {
          const userDocRef = doc(db, 'users', userDoc.id)
          updatePromises.push(updateDoc(userDocRef, { 'favoritos.episodios': updatedFavorites }))
        }
      }
    })
    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error al eliminar el episodio y limpiar favoritos:', error)
    alert('Ocurrió un error durante la eliminación.')
  }
}

const deletePodcast = async () => {
  const podcastId = form.value.id
  if (!podcastId) return

  if (
    !confirm(
      `¿Estás SEGURO de que quieres eliminar el podcast "${form.value.title}"?\n\n¡Esta acción es PERMANENTE y eliminará todos sus episodios y los favoritos asociados de todos los usuarios!`,
    )
  ) {
    return
  }

  try {
    isSaving.value = true
    const podcastRef = doc(db, 'podcasts', podcastId)
    const episodesRef = collection(podcastRef, 'episodes')
    const episodesSnapshot = await getDocs(episodesRef)

    const deleteEpisodePromises = []
    episodesSnapshot.forEach((episodeDoc) => {
      deleteEpisodePromises.push(deleteDoc(episodeDoc.ref))
    })
    await Promise.all(deleteEpisodePromises)

    await deleteDoc(podcastRef)

    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)
    const updateFavoritesPromises = []
    const episodeIdsToDelete = episodesSnapshot.docs.map((d) => d.id)

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data()
      const userFavorites = userData.favoritos || {}
      let needsUpdate = false

      const favoritePodcasts = (userFavorites.podcasts || []).filter((id) => id !== podcastId)
      if (favoritePodcasts.length < (userFavorites.podcasts || []).length) {
        needsUpdate = true
      }

      const favoriteEpisodes = (userFavorites.episodios || []).filter(
        (ep) => !episodeIdsToDelete.includes(ep.id),
      )
      if (favoriteEpisodes.length < (userFavorites.episodios || []).length) {
        needsUpdate = true
      }

      if (needsUpdate) {
        updateFavoritesPromises.push(
          updateDoc(userDoc.ref, {
            'favoritos.podcasts': favoritePodcasts,
            'favoritos.episodios': favoriteEpisodes,
          }),
        )
      }
    })
    await Promise.all(updateFavoritesPromises)

    alert(`El podcast "${form.value.title}" ha sido eliminado exitosamente.`)
    selectedPodcast.value = null
  } catch (error) {
    console.error('Error al eliminar el podcast:', error)
    alert('Ocurrió un error al eliminar el podcast. Revisa la consola.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* Tus estilos existentes... */
.admin-panel {
  padding: 2rem;
  background-color: #f4f6f8;
  height: calc(100vh - 70px);
  overflow: hidden;
}
.panel-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
}
.panel-header h1 {
  font-size: 2rem;
  margin: 0;
  color: #333;
}
.panel-header p {
  margin: 0.25rem 0 0;
  color: #666;
}
.panel-layout {
  display: flex;
  gap: 2rem;
  height: calc(100% - 110px);
}
.list-column,
.form-column {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  overflow-y: auto;
}
.list-column {
  flex: 0 0 300px;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.list-header h2 {
  margin: 0;
}
.add-new-btn {
  background-color: #0d4d98;
  color: white;
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
.podcast-list {
  list-style: none;
  padding: 0;
  margin: 0;
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
  color: white;
  font-weight: bold;
}
.form-column {
  flex-grow: 1;
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
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
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
}
.save-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.save-btn:hover {
  background-color: #218838;
}
.save-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.delete-podcast-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.delete-podcast-btn:hover {
  background-color: #c82333;
}
.save-success-message {
  color: #28a745;
  font-weight: bold;
}
hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 2rem 0;
}
.episodes-section {
  margin-top: 2rem;
}
.episodes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.add-episode-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.add-episode-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.episode-list {
  list-style: none;
  padding: 0;
}
.episode-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}
.episode-title {
  flex-grow: 1;
}
.delete-episode-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
}
.delete-episode-btn:hover {
  background-color: #fbebee;
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
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-content h3 {
  margin-top: 0;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}
.text-muted {
  color: #6c757d !important;
}
.episode-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.comment-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: #ccc;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.comment-toggle.active {
  background-color: #28a745; /* Verde */
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease-in-out;
}

.comment-toggle.active .toggle-knob {
  transform: translateX(20px);
}

.delete-episode-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-episode-btn:hover {
  background-color: #fbebee;
}
</style>
