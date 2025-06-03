<template>
  <div class="player-container">
    <div class="custom-audio-controls">
      <button @click="togglePlay" class="play-button">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <div class="volume-control">
        <span class="volume-icon">{{ isMuted ? '🔇' : '🔊' }}</span>
        <input
          type="range"
          v-model="volume"
          min="0"
          max="1"
          step="0.01"
          @input="setVolume"
          class="volume-slider"
        />
      </div>
    </div>

    <audio
      ref="audioElement"
      :src="streamUrl"
      @play="onPlay"
      @pause="onPause"
      @error="onError"
      @timeupdate="updateProgress"
      hidden
    ></audio>

    <div class="metadata-container">
      <div v-if="error" class="error-badge">
        ⚠️ {{ error }}
        <button @click="retryConnection" class="retry-button">Reintentar</button>
      </div>

      <div class="status-badge" :class="connectionClass">
        {{ connectionStatus }}
        <span v-if="isPlaying" class="live-badge">● EN VIVO</span>
      </div>

      <div class="track-info">
        <h3 class="track-title">{{ currentTrack.title }}</h3>
        <p class="track-artist">{{ currentTrack.artist }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Estado del reproductor
const streamUrl = 'https://stream.zeno.fm/xmah2zunhgmtv'
const audioElement = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(0.7)
const currentTrack = ref({
  title: 'Programación en vivo',
  artist: 'UNIMAR RADIO',
})
const connectionStatus = ref('Conectando...')
const error = ref(null)
let eventSource = null

// Parseo de metadatos mejorado
const parseMetadata = (title) => {
  if (!title) return null
  const patterns = [/Now On Air:\s*(.+?)\s*-\s*(.+)/, /(.+?)\s*:\s*(.+)/, /(.+?)\s*-\s*(.+)/]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match)
      return {
        artist: match[1].trim(),
        title: match[2].trim(),
      }
  }
  return { title, artist: 'UNIMAR RADIO' }
}

// Controles de audio
const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play().catch((err) => {
      error.value = 'Haz clic para reproducir (requiere interacción)'
    })
  }
}

const setVolume = () => {
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

// Manejo de eventos del reproductor
const onPlay = () => {
  isPlaying.value = true
  error.value = null
  connectionStatus.value = 'Transmisión en vivo'
}

const onPause = () => {
  isPlaying.value = false
}

const onError = () => {
  error.value = 'Error en la transmisión'
  isPlaying.value = false
}

// Conexión SSE con reinicio de audio al cambiar canción
const connectSSE = () => {
  connectionStatus.value = 'Conectando a metadatos...'
  error.value = null

  eventSource = new EventSource('https://api.zeno.fm/mounts/metadata/subscribe/xmah2zunhgmtv')

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.streamTitle) {
        const newTrack = parseMetadata(data.streamTitle)
        if (newTrack && newTrack.title !== currentTrack.value.title) {
          currentTrack.value = newTrack
          restartStream() // Reiniciamos el stream al cambiar canción
        }
      }
    } catch (e) {
      console.error('Error parsing metadata:', e)
    }
  }

  eventSource.onerror = () => {
    error.value = 'Error en conexión de metadatos'
    setTimeout(connectSSE, 3000)
  }
}

// Reinicia el stream para evitar problemas de buffer
const restartStream = () => {
  if (audioElement.value) {
    const wasPlaying = !audioElement.value.paused
    audioElement.value.pause()
    audioElement.value.src = streamUrl
    if (wasPlaying) {
      audioElement.value.play().catch(console.error)
    }
  }
}

const retryConnection = () => {
  error.value = null
  connectSSE()
  restartStream()
}

// Configuración inicial
onMounted(() => {
  connectSSE()
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
})

onUnmounted(() => {
  if (eventSource) eventSource.close()
  if (audioElement.value) {
    audioElement.value.pause()
  }
})
</script>

<style scoped>
.player-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, #2b3a4e 0%, #1a2639 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
}

.custom-audio-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.play-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #4a6fa5;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.play-button:hover {
  background: #5a8fd3;
  transform: scale(1.05);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
}

.volume-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #4a6fa5;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

.metadata-container {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.error-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border-radius: 8px;
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.retry-button {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.status-badge {
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.status-success {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.status-warning {
  background: rgba(255, 165, 2, 0.2);
  color: #ffa502;
}

.live-badge {
  color: #ff4757;
  font-size: 0.7rem;
}

.track-info {
  margin-top: 0.5rem;
}

.track-title {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
  color: white;
  font-weight: 600;
}

.track-artist {
  font-size: 1.1rem;
  color: #8ab6d6;
}
</style>
