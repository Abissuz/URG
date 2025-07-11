<template>
  <div class="podcast-detail-container py-4">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="podcast" class="container">
      <div class="row">
        <div class="col-md-4 text-center">
          <img :src="podcast.coverImage" class="img-fluid rounded shadow-lg" :alt="podcast.title" />
        </div>
        <div class="col-md-8">
          <h1 class="display-5 fw-bold text-primary">{{ podcast.title }}</h1>
          <div class="host-info d-flex align-items-center my-3">
            <img
              v-if="podcast.host && podcast.host.image"
              :src="podcast.host.image"
              alt="Foto del host"
              class="host-avatar"
            />
            <p class="lead mb-0 ms-3">{{ podcast.host.name }}</p>
          </div>
          <hr />
          <p>{{ podcast.description }}</p>
        </div>
      </div>

      <div class="mt-5">
        <h3 class="mb-4">Episodios</h3>
        <p class="text-muted">Haz clic en un episodio para ver o dejar comentarios.</p>
        <ul class="list-group">
          <li
            v-for="episode in episodes"
            :key="episode.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ 'active-episode': selectedEpisodeForComments?.id === episode.id }"
            @click="selectEpisodeForComments(episode)"
          >
            <span>{{ episode.title }}</span>
            <div class="d-flex align-items-center gap-3">
              <button
                @click.stop="favoritesStore.toggleEpisodeFavorite(podcastId, episode)"
                class="btn-favorite"
              >
                <i
                  :class="[
                    'fas',
                    'fa-heart',
                    { 'is-favorite': favoritesStore.isEpisodeFavorite(episode.id) },
                  ]"
                ></i>
              </button>
              <button @click.stop="playEpisode(episode)" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-play me-2"></i>Reproducir
              </button>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="selectedEpisodeForComments" class="comments-section-wrapper mt-5">
        <div
          v-if="!selectedEpisodeForComments.commentsEnabled"
          class="alert alert-info text-center"
        >
          Los comentarios están desactivados para este episodio.
        </div>
        <div v-else>
          <h3 class="mb-4">
            Comentarios para:
            <span class="text-primary">{{ selectedEpisodeForComments.title }}</span>
          </h3>

          <div v-if="authStore.isLoggedIn" class="card mb-4">
            <div class="card-body">
              <form @submit.prevent="postComment">
                <textarea
                  v-model="newCommentText"
                  class="form-control"
                  rows="3"
                  placeholder="Escribe tu comentario..."
                  required
                ></textarea>
                <button type="submit" class="btn btn-primary mt-2" :disabled="isPostingComment">
                  {{ isPostingComment ? 'Publicando...' : 'Publicar Comentario' }}
                </button>
              </form>
            </div>
          </div>
          <div v-else class="alert alert-light text-center">
            <router-link to="/login">Inicia sesión</router-link> para dejar un comentario.
          </div>

          <div
            v-if="authStore.canUpdateContent && comments.length > 0"
            class="moderation-bar card card-body bg-light mb-3"
          >
            <div class="d-flex justify-content-between align-items-center">
              <span>Modo de moderación activado</span>
              <button
                @click="deleteSelectedComments"
                :disabled="selectedComments.size === 0"
                class="btn btn-sm btn-danger"
              >
                Eliminar seleccionados ({{ selectedComments.size }})
              </button>
            </div>
          </div>

          <div v-if="commentsLoading" class="text-center">
            <div class="spinner-border spinner-border-sm" role="status"></div>
          </div>
          <div v-else-if="comments.length === 0" class="text-center text-muted">
            Sé el primero en comentar.
          </div>
          <ul v-else class="list-unstyled">
            <li
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item card card-body mb-3"
            >
              <div class="d-flex align-items-start">
                <input
                  v-if="authStore.canUpdateContent"
                  type="checkbox"
                  class="form-check-input me-3"
                  :checked="selectedComments.has(comment.id)"
                  @change="toggleCommentSelection(comment.id)"
                />
                <div class="flex-grow-1">
                  <p class="mb-1">{{ comment.text }}</p>
                  <small class="text-muted">
                    <strong>{{ comment.authorName }}</strong> -
                    {{ formatDate(comment.createdAt?.toDate()) }}
                  </small>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="alert alert-warning">Podcast no encontrado.</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { usePlayerStore } from '@/stores/player'
import { usePodcastStore } from '@/stores/counter'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthStore } from '@/stores/auth'
import { showSuccessToast, showErrorToast, showConfirmDialog } from '@/stores/notifications.js'

const route = useRoute()
const playerStore = usePlayerStore()
const podcastStore = usePodcastStore()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()

const podcast = ref(null)
const episodes = ref([])
const loading = ref(true)
const podcastId = route.params.id
let unsubscribeEpisodes = null

const selectedEpisodeForComments = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const newCommentText = ref('')
const isPostingComment = ref(false)
let unsubscribeComments = null

const selectedComments = ref(new Set())

const playEpisode = (episode) => playerStore.playOnDemandTrack(episode)
const naturalSort = (a, b) =>
  a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' })
const formatDate = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

const selectEpisodeForComments = (episode) => {
  if (selectedEpisodeForComments.value?.id === episode.id) {
    selectedEpisodeForComments.value = null
    if (unsubscribeComments) unsubscribeComments()
    comments.value = []
    return
  }
  selectedEpisodeForComments.value = episode
  if (unsubscribeComments) unsubscribeComments()
  comments.value = []
  selectedComments.value.clear()

  if (episode.commentsEnabled) {
    commentsLoading.value = true
    const commentsQuery = query(
      collection(db, 'podcasts', podcastId, 'episodes', episode.id, 'comments'),
      orderBy('createdAt', 'desc'),
    )
    unsubscribeComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        comments.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        commentsLoading.value = false
      },
      (error) => {
        console.error('Error cargando comentarios:', error)
        showErrorToast('Error al cargar los comentarios')
        commentsLoading.value = false
      },
    )
  }
}

const postComment = async () => {
  if (!newCommentText.value.trim() || !selectedEpisodeForComments.value) return
  isPostingComment.value = true
  try {
    const commentsCol = collection(
      db,
      'podcasts',
      podcastId,
      'episodes',
      selectedEpisodeForComments.value.id,
      'comments',
    )
    await addDoc(commentsCol, {
      text: newCommentText.value,
      authorName: authStore.user.displayName || authStore.user.email,
      authorUid: authStore.user.uid,
      createdAt: serverTimestamp(),
    })
    newCommentText.value = ''
    showSuccessToast('Comentario publicado con éxito')
  } catch (error) {
    console.error('Error al publicar comentario:', error)
    showErrorToast('No se pudo publicar tu comentario')
  } finally {
    isPostingComment.value = false
  }
}

const toggleCommentSelection = (commentId) => {
  if (selectedComments.value.has(commentId)) {
    selectedComments.value.delete(commentId)
  } else {
    selectedComments.value.add(commentId)
  }
}

const deleteSelectedComments = async () => {
  const count = selectedComments.value.size
  if (count === 0) return

  const confirmed = await showConfirmDialog(
    '¿Eliminar comentarios?',
    `Estás a punto de eliminar ${count} comentario(s). Esta acción no se puede deshacer.`,
  )
  if (!confirmed) return

  try {
    const deletePromises = []
    selectedComments.value.forEach((commentId) => {
      const commentRef = doc(
        db,
        'podcasts',
        podcastId,
        'episodes',
        selectedEpisodeForComments.value.id,
        'comments',
        commentId,
      )
      deletePromises.push(deleteDoc(commentRef))
    })

    await Promise.all(deletePromises)
    showSuccessToast(`${count} comentario(s) eliminado(s) correctamente.`)
    selectedComments.value.clear()
  } catch (error) {
    console.error('Error eliminando comentarios:', error)
    showErrorToast('Ocurrió un error al eliminar los comentarios.')
  }
}

onMounted(async () => {
  try {
    let foundPodcast = podcastStore.podcasts.find((p) => p.id === podcastId)
    if (!foundPodcast) {
      const podcastRef = doc(db, 'podcasts', podcastId)
      const docSnap = await getDoc(podcastRef)
      if (docSnap.exists()) {
        foundPodcast = { id: docSnap.id, ...docSnap.data() }
      }
    }
    if (!foundPodcast) {
      loading.value = false
      return
    }
    podcast.value = foundPodcast
    const episodesCol = collection(db, 'podcasts', podcastId, 'episodes')
    const q = query(episodesCol)
    unsubscribeEpisodes = onSnapshot(q, (episodesSnapshot) => {
      let fetchedEpisodes = episodesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      fetchedEpisodes.sort(naturalSort)
      episodes.value = fetchedEpisodes
      loading.value = false
    })
  } catch (error) {
    console.error('Error al cargar la página del podcast:', error)
    showErrorToast('No se pudo cargar la información del podcast.')
    loading.value = false
  }
})

onUnmounted(() => {
  if (unsubscribeEpisodes) unsubscribeEpisodes()
  if (unsubscribeComments) unsubscribeComments()
})
</script>

<style scoped>
/* Tus estilos existentes no han sido modificados */
.img-fluid {
  max-height: 350px;
  border-radius: 1rem !important;
}
.text-primary {
  color: #0d4d98 !important;
}
.list-group-item {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}
.btn-outline-primary {
  color: #0d4d98;
  border-color: #0d4d98;
}
.btn-outline-primary:hover {
  background-color: #0d4d98;
  color: white;
}
.btn-favorite {
  background: none;
  border: none;
  color: #adb5bd;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  transition:
    color 0.2s,
    transform 0.2s;
}
.btn-favorite:hover {
  color: #ff4d6d;
}
.btn-favorite .is-favorite {
  color: #ff4d6d;
  animation: bounce 0.3s ease;
}
.host-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #0d4d98;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
.list-group-item-action {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.list-group-item-action.active-episode {
  background-color: #0075ffa8;
  color: white;
  border-color: #0075ffa8;
}
.comments-section-wrapper {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}
.comment-item {
  background-color: #fff;
  border: 1px solid #dee2e6;
}
.moderation-bar {
  border-color: #ffc107;
}
.form-check-input {
  cursor: pointer;
  transform: scale(1.2);
  margin-top: 0.25rem;
  border: 2px solid #0d4d98 !important;
  box-shadow: none !important;
}
</style>
