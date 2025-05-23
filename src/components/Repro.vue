<template>
  <div class="radio-container">
    <!-- Reproductor de audio -->
    <audio ref="audioPlayer" controls class="audio-player">
      <source :src="streamUrl" type="audio/mpeg" />
    </audio>

    <!-- Información de la transmisión -->
    <div class="metadata-display">
      <h3>UNIMAR RADIO GLOBAL</h3>
      <div class="track-info">
        <p class="now-playing">EN VIVO:</p>
        <p class="title">{{ currentTrack.title }}</p>
        <p class="artist">{{ currentTrack.artist }}</p>
        <p class="listeners">👂 {{ currentTrack.listeners || '--' }} oyentes</p>
      </div>
      <p v-if="connectionStatus" class="status">{{ connectionStatus }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  setup() {
    // Configuración
    const streamUrl = ref('https://stream.zeno.fm/xmah2zunhgmtv')
    const currentTrack = ref({
      title: 'Programación en vivo',
      artist: 'UNIMAR RADIO GLOBAL',
      listeners: null,
    })
    const connectionStatus = ref('')
    const error = ref(null)

    // Intento de conexión WebSocket (con manejo de errores mejorado)
    onMounted(() => {
      connectionStatus.value = 'Conectando a metadatos...'

      try {
        const socket = new WebSocket('wss://api.zeno.fm/mounts/metadata/subscribe/xmah2zunhgmtv')

        socket.onopen = () => {
          connectionStatus.value = 'Conectado a metadatos'
        }

        socket.onmessage = (event) => {
          try {
            currentTrack.value = JSON.parse(event.data)
            error.value = null
          } catch (e) {
            console.error('Error parseando metadatos:', e)
          }
        }

        socket.onerror = (err) => {
          error.value = 'Error de conexión con metadatos'
          connectionStatus.value = 'Usando información básica'
          console.error('WebSocket error:', err)

          // Implementación de fallback
          currentTrack.value = {
            title: 'Transmisión en vivo',
            artist: 'UNIMAR RADIO GLOBAL',
            listeners: null,
          }
        }
      } catch (err) {
        error.value = 'Error al iniciar conexión'
        console.error('Error inicializando WebSocket:', err)
      }
    })

    return {
      streamUrl,
      currentTrack,
      connectionStatus,
      error,
    }
  },
}
</script>

<style scoped>
.radio-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #0d4d98 0%, #082b56 100%);
  border-radius: 12px;
  color: white;
  font-family: 'Segoe UI', sans-serif;
}

.audio-player {
  width: 100%;
  margin-bottom: 20px;
  border-radius: 8px;
}

.metadata-display {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.track-info {
  margin: 15px 0;
}

.now-playing {
  font-size: 0.9em;
  opacity: 0.8;
}

.title {
  font-size: 1.3em;
  font-weight: bold;
  margin: 8px 0;
}

.artist {
  font-size: 1.1em;
  opacity: 0.9;
}

.listeners {
  margin-top: 10px;
  font-size: 0.9em;
}

.status {
  font-size: 0.8em;
  color: #aaa;
  margin-top: 10px;
}

.error {
  color: #ff6b6b;
  margin-top: 10px;
}
</style>
