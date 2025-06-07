<template>
  <!-- Barra del reproductor -->
  <div class="player-bar" :class="{ 'static-mode': playerStore.isFooterVisible }">
    <!-- Botón central desplegable -->
    <div class="center-button-container">
      <button @click.stop="toggleMetadata" class="center-button" :class="{ active: showMetadata }">
        <img
          src="@/assets/img/anadir.png"
          alt="Mostrar metadatos"
          class="center-icon"
          :class="{ rotated: showMetadata }"
        />
      </button>
    </div>

    <!-- Panel de metadatos -->
    <transition name="slide-fade">
      <div v-if="showMetadata" class="metadata-panel" @click.stop>
        <div class="logo-container">
          <img src="@/assets/img/logo-urg.png" alt="UNIMAR Radio" class="station-logo" />
        </div>
        <h2 class="song-title">{{ currentTrack.title }}</h2>
        <h3 class="song-artist">{{ currentTrack.artist }}</h3>
      </div>
    </transition>

    <!-- Controles principales -->
    <div class="player-controls">
      <!-- Botón play/pause -->
      <button @click="togglePlay" class="play-button">
        <img v-if="isPlaying" src="@/assets/img/pausa.png" alt="Pausa" class="play-icon" />
        <img v-else src="@/assets/img/reproducir.png" alt="Reproducir" class="play-icon" />
      </button>

      <!-- Línea decorativa -->
      <div class="decorative-line"></div>

      <!-- Contador -->
      <span class="time-display">{{ formatTime(songDuration) }}</span>

      <!-- Control de volumen -->
      <div class="volume-control">
        <img
          v-if="isMuted"
          src="@/assets/img/shhh.png"
          alt="Silencio"
          class="volume-icon"
          @click="toggleMute"
        />
        <img
          v-else
          src="@/assets/img/audio.png"
          alt="Volumen"
          class="volume-icon"
          @click="toggleMute"
        />
        <div class="volume-slider-vertical">
          <input
            type="range"
            v-model="volume"
            min="0"
            max="1"
            step="0.01"
            @input="setVolume"
            class="vertical-slider"
            orient="vertical"
          />
        </div>
      </div>
    </div>

    <!-- Elemento de audio oculto -->
    <audio
      ref="audioElement"
      :src="streamUrl"
      @play="onPlay"
      @pause="onPause"
      @error="onError"
      autoplay
      preload="none"
      crossorigin="anonymous"
      hidden
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePlayerStore } from '../stores/player'

// Inicializa el store
const playerStore = usePlayerStore()

// Añade esta función para debuggear
watch(
  () => playerStore.isFooterVisible,
  (visible) => {
    console.log('Footer visible (desde Repro):', visible)
  },
)

// Configuración
const streamUrl = 'https://stream.zeno.fm/xmah2zunhgmtv'
const metadataUrl = 'https://api.zeno.fm/mounts/metadata/subscribe/xmah2zunhgmtv'

// Estado del reproductor
const audioElement = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(0.8)
const songDuration = ref(0)
const currentTrack = ref({
  title: 'Programación en vivo',
  artist: 'UNIMAR RADIO',
})
const error = ref(null)
const showMetadata = ref(false)
let eventSource = null
let songTimer = null
// Control del panel de metadatos
const toggleMetadata = () => {
  showMetadata.value = !showMetadata.value
}

const closeMetadata = () => {
  showMetadata.value = false
}

// Directiva para cerrar al hacer clic fuera
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  },
}

// Parseo de metadatos
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

// Formatear tiempo (MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// Temporizador de canción
const startSongTimer = () => {
  clearInterval(songTimer)
  songDuration.value = 0
  songTimer = setInterval(() => {
    songDuration.value++
  }, 1000)
}

// Reiniciar stream para live edge
const restartStream = () => {
  if (audioElement.value) {
    const wasPlaying = !audioElement.value.paused
    const userPaused = !isPlaying.value

    audioElement.value.pause()
    audioElement.value.src = `${streamUrl}?t=${Date.now()}`

    if (wasPlaying && !userPaused) {
      audioElement.value.play().catch(console.error)
    }
  }
}

// Controles de audio
const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    restartStream()
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

// Manejadores de eventos de audio
const onPlay = () => {
  isPlaying.value = true
  error.value = null
}

const onPause = () => {
  isPlaying.value = false
}

const onError = () => {
  error.value = 'Error en la transmisión'
  isPlaying.value = false
}

// Conexión SSE para metadatos
const connectSSE = () => {
  error.value = null

  eventSource = new EventSource(metadataUrl)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.streamTitle) {
        const newTrack = parseMetadata(data.streamTitle)
        if (newTrack && newTrack.title !== currentTrack.value.title) {
          currentTrack.value = newTrack
          startSongTimer()
          if (isPlaying.value) {
            restartStream()
          }
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

const retryConnection = () => {
  error.value = null
  connectSSE()
  restartStream()
}

// Ciclo de vida
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (
      showMetadata.value &&
      !e.target.closest('.center-button-container') &&
      !e.target.closest('.metadata-panel')
    ) {
      showMetadata.value = false
    }
  })
  connectSSE()
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
  startSongTimer()
})

onUnmounted(() => {
  if (eventSource) eventSource.close()
  if (audioElement.value) {
    audioElement.value.pause()
  }
  clearInterval(songTimer)
})
</script>

<style scoped>
/* Estilos generales */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 15px 15px 0 0;
  height: 50px;
  background: #4f90d1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border: 2px solid #0d4d98;
  transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.5, 1.3) !important;
}

.player-bar.static-mode {
  position: relative;
  bottom: -60px;
  width: 100%;
}
.player-controls {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
}

/* Botón play/pause */
.play-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
}

.play-button:hover .play-icon {
  transform: scale(1.1);
}

/* Línea decorativa */
.decorative-line {
  flex: 1;
  height: 5px;
  border-radius: 20px;
  background: rgb(255 255 255);
  margin: 0 15px;
}

/* Contador de tiempo */
.time-display {
  font-family: monospace;
  color: white;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
  font-weight: 600;
}

/* Control de volumen */
.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-icon:hover {
  transform: scale(1.1);
}

.volume-slider-vertical {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 5px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
}

.volume-control:hover .volume-slider-vertical {
  opacity: 1;
  pointer-events: auto;
}

.vertical-slider {
  -webkit-appearance: slider-vertical;
  width: 8px;
  height: 80px;
  background: transparent;
}

.vertical-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

/* Botón central */
.center-button-container {
  position: absolute;
  left: 50%;
  top: -30px;
  transform: translateX(-50%);
  z-index: 1001;
}

.center-button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(145deg, #4f90d1, #3a6b9d);
  border: 3px solid #0d4d98;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.center-button.active {
  background: linear-gradient(145deg, #3a6b9d, #4f90d1);
}

.center-icon {
  width: 25px;
  height: 25px;
  transition: transform 0.3s ease;
}

.center-icon.rotated {
  transform: rotate(135deg);
}

/* Panel de metadatos */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.metadata-panel {
  position: absolute;
  bottom: 48px;
  left: 0;
  width: 100%;
  max-width: 500px;
  left: 50%;
  transform: translateX(-50%);
  background: #4f90d1;
  backdrop-filter: blur(10px);
  border: 2px solid #0d4d98;
  border-bottom: none;
  padding: 45px 25px;
  border-radius: 15px 15px 0 0;
  z-index: 1000;
}

.logo-container {
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin: 0 auto 20px;
  width: fit-content;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.station-logo {
  height: 100px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.song-title {
  color: white;
  font-size: 1.6rem;
  margin: 0 0 8px;
  text-align: center;
  font-weight: 600;
}

.song-artist {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3rem;
  margin: 0;
  text-align: center;
  font-weight: 500;
}
</style>
