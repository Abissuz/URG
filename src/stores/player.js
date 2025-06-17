import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // --- ESTADO CENTRALIZADO ---
  const audioElement = ref(null)
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const volume = ref(0.5)
  const currentTrack = ref({ title: 'Programación en vivo', artist: 'UNIMAR RADIO' })
  const songDuration = ref(0)
  const isLiveStreaming = ref(true)

  let eventSource = null
  let songTimer = null

  const liveStreamUrl = 'https://stream.zeno.fm/xmah2zunhgmtv'
  const metadataUrl = 'https://api.zeno.fm/mounts/metadata/subscribe/xmah2zunhgmtv'

  // --- ACCIONES CENTRALIZADAS ---
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

  const playOnDemandTrack = (episode) => {
    if (audioElement.value) audioElement.value.pause()
    isLiveStreaming.value = false
    currentTrack.value = { title: episode.title, artist: 'Podcast' }
    audioElement.value.src = episode.audioURL
    audioElement.value.play().catch(console.error)
    startSongTimer()
  }

  const switchToLiveStream = () => {
    if (audioElement.value) audioElement.value.pause()
    isLiveStreaming.value = true
    currentTrack.value = { title: 'Cargando en vivo...', artist: 'UNIMAR RADIO' } // Título temporal
    audioElement.value.src = `${liveStreamUrl}?t=${Date.now()}`
    audioElement.value.play().catch(console.error)
    startSongTimer()
    // LA SOLUCIÓN: Forzamos la reconexión para obtener los metadatos al instante.
    connectSSE()
  }

  const togglePlay = () => {
    if (!audioElement.value) return
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      if (isLiveStreaming.value) {
        audioElement.value.src = `${liveStreamUrl}?t=${Date.now()}`
      }
      audioElement.value.play().catch(console.error)
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
    if (eventSource) eventSource.close() // Cierra cualquier conexión anterior
    eventSource = new EventSource(metadataUrl)
    eventSource.onmessage = (event) => {
      if (isLiveStreaming.value) {
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
    eventSource.onerror = () => setTimeout(connectSSE, 5000)
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
