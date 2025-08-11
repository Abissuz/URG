import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
// 1. Importar las notificaciones
import { showSuccessToast, showErrorToast } from '@/stores/notifications.js'

export const usePlayerStore = defineStore('player', () => {
  // --- ESTADO ---
  const audioElement = ref(null)
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const volume = ref(0.5)
  const currentTrack = ref({ title: 'Programación en vivo', artist: 'UNIMAR RADIO' })
  const songDuration = ref(0)
  const isLiveStreaming = ref(true)

  let eventSource = null
  let songTimer = null
  let sseErrorNotified = false // Para evitar spam de notificaciones de error

  const liveStreamUrl = 'https://stream.zeno.fm/xmah2zunhgmtv'
  const metadataUrl = 'https://api.zeno.fm/mounts/metadata/subscribe/xmah2zunhgmtv'

  // --- ACCIONES ---
  const init = (audioTag) => {
    if (!audioElement.value) {
      audioElement.value = audioTag
      audioElement.value.volume = volume.value
      audioElement.value.onplaying = () => (isPlaying.value = true)
      audioElement.value.onpause = () => (isPlaying.value = false)
      connectSSE()
      startSongTimer()
    }
  }

  // Ahora la función recibe el episodio Y el podcast al que pertenece
  const playOnDemandTrack = async (episode, podcast) => {
    if (audioElement.value) audioElement.value.pause()
    isLiveStreaming.value = false
    // Usamos el título del podcast como el artista
    currentTrack.value = { title: episode.title, artist: podcast.title }
    audioElement.value.src = episode.audioURL
    try {
      await audioElement.value.play()
      showSuccessToast(`Reproduciendo: ${episode.title}`)
      startSongTimer()
    } catch (error) {
      console.error('Error al reproducir podcast:', error)
      showErrorToast('No se pudo reproducir el episodio.')
    }
  }

  const switchToLiveStream = async () => {
    if (audioElement.value) audioElement.value.pause()
    isLiveStreaming.value = true
    currentTrack.value = { title: 'Cargando en vivo...', artist: 'UNIMAR RADIO' }
    audioElement.value.src = `${liveStreamUrl}?t=${Date.now()}`
    try {
      await audioElement.value.play()
      // 4. Notificación de éxito al cambiar a la radio
      showSuccessToast('Sintonizando la transmisión en vivo')
      startSongTimer()
      connectSSE()
    } catch (error) {
      console.error('Error al conectar al stream en vivo:', error)
      // 5. Notificación de error si no se puede conectar
      showErrorToast('No se pudo conectar a la radio en vivo.')
    }
  }

  const togglePlay = async () => {
    if (!audioElement.value) return
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      if (isLiveStreaming.value) {
        audioElement.value.src = `${liveStreamUrl}?t=${Date.now()}`
      }
      try {
        await audioElement.value.play()
      } catch (error) {
        console.error('Error de reproducción:', error)
        // 6. Notificación de error genérica de reproducción
        showErrorToast('Error de reproducción. Revisa tu conexión.')
      }
    }
  }

  const setVolume = (newVolume) => {
    volume.value = newVolume
    if (audioElement.value) {
      audioElement.value.volume = volume.value
      isMuted.value = volume.value === 0
    }
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (audioElement.value) {
      audioElement.value.muted = isMuted.value
    }
  }

  const parseMetadata = (title) => {
    if (!title) return { title: 'Programación en vivo', artist: 'UNIMAR RADIO' }
    const parts = title.split(' - ')
    if (parts.length > 1) return { artist: parts[0].trim(), title: parts[1].trim() }
    return { title: title.trim(), artist: 'UNIMAR RADIO' }
  }

  const startSongTimer = () => {
    clearInterval(songTimer)
    songDuration.value = 0
    songTimer = setInterval(() => {
      if (!audioElement.value?.paused) {
        songDuration.value++
      }
    }, 1000)
  }

  const connectSSE = () => {
    if (eventSource) eventSource.close()
    eventSource = new EventSource(metadataUrl)
    eventSource.onmessage = (event) => {
      if (isLiveStreaming.value) {
        sseErrorNotified = false // Se resetea el flag de error si la conexión es exitosa
        try {
          const newTrack = parseMetadata(JSON.parse(event.data).streamTitle)
          if (newTrack && newTrack.title !== currentTrack.value.title) {
            currentTrack.value = newTrack
            startSongTimer()
          }
        } catch (e) {
          /* silent fail */
        }
      }
    }
    eventSource.onerror = () => {
      // 7. Notificación de error de metadatos (solo una vez para no molestar)
      if (!sseErrorNotified) {
        showErrorToast('Error de conexión con los metadatos.')
        sseErrorNotified = true
      }
      setTimeout(connectSSE, 5000)
    }
  }

  onUnmounted(() => {
    if (eventSource) eventSource.close()
    clearInterval(songTimer)
  })

  return {
    init,
    isPlaying,
    isMuted,
    volume,
    currentTrack,
    songDuration,
    isLiveStreaming,
    togglePlay,
    setVolume,
    toggleMute,
    playOnDemandTrack,
    switchToLiveStream,
  }
})
