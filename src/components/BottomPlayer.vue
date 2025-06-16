<template>
  <div class="player-bar-container">
    <!-- Modal de Metadatos -->
    <transition name="slide-fade">
      <div v-if="showMetadata" class="metadata-panel" ref="metadataPanelRef">
        <div class="logo-container">
          <img src="@/assets/img/logo-urg.png" alt="UNIMAR Radio" class="station-logo" />
        </div>
        <h2 class="song-title">{{ playerStore.currentTrack.title }}</h2>
        <h3 class="song-artist">{{ playerStore.currentTrack.artist }}</h3>
      </div>
    </transition>

    <!-- Barra Principal del Reproductor -->
    <div class="player-bar">
      <div class="center-button-container" ref="metadataToggleRef">
        <button
          @click.stop="toggleMetadata"
          class="center-button"
          :class="{ active: showMetadata }"
        >
          <img
            src="@/assets/img/anadir.png"
            alt="Mostrar metadatos"
            class="center-icon"
            :class="{ rotated: showMetadata }"
          />
        </button>
      </div>

      <div class="player-controls">
        <button @click="playerStore.togglePlay()" class="play-button">
          <img
            v-if="playerStore.isPlaying"
            src="@/assets/img/pausa.png"
            alt="Pausa"
            class="play-icon"
          />
          <img v-else src="@/assets/img/reproducir.png" alt="Reproducir" class="play-icon" />
        </button>

        <div class="decorative-line"></div>
        <span class="time-display">{{ formatTime(playerStore.songDuration) }}</span>

        <div class="volume-control" ref="volumeControlRef">
          <img
            v-if="playerStore.isMuted || playerStore.volume == 0"
            src="@/assets/img/shhh.png"
            alt="Silencio"
            class="volume-icon"
            @click.stop="toggleVolumeSlider"
          />
          <img
            v-else
            src="@/assets/img/audio.png"
            alt="Volumen"
            class="volume-icon"
            @click.stop="toggleVolumeSlider"
          />

          <transition name="slide-fade-fast">
            <div v-if="showVolumeSlider" class="volume-slider-vertical">
              <input
                type="range"
                :value="playerStore.volume"
                @input="updateVolume"
                min="0"
                max="1"
                step="0.01"
                class="vertical-slider"
                orient="vertical"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
    <!-- ¡El elemento <audio> ya no está aquí! Se ha movido a App.vue -->
  </div>
</template>

<script setup>
// ... (El resto del script de BottomPlayer se mantiene igual) ...
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const showMetadata = ref(false)
const showVolumeSlider = ref(false)
const volumeControlRef = ref(null)
const metadataPanelRef = ref(null)
const metadataToggleRef = ref(null)

const toggleMetadata = () => {
  showMetadata.value = !showMetadata.value
}
const toggleVolumeSlider = () => {
  showVolumeSlider.value = !showVolumeSlider.value
}

const handleClickOutside = (event) => {
  if (
    showVolumeSlider.value &&
    volumeControlRef.value &&
    !volumeControlRef.value.contains(event.target)
  ) {
    showVolumeSlider.value = false
  }
  if (
    showMetadata.value &&
    metadataToggleRef.value &&
    !metadataToggleRef.value.contains(event.target) &&
    (!metadataPanelRef.value ||
      (metadataPanelRef.value && !metadataPanelRef.value.contains(event.target)))
  ) {
    showMetadata.value = false
  }
}

const updateVolume = (event) => {
  playerStore.setVolume(parseFloat(event.target.value))
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* El resto de los estilos se mantiene igual */
.player-bar-container {
  display: none;
}
@media (max-width: 992px) {
  .player-bar-container {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
  }
}
.player-bar {
  position: relative;
  height: 50px;
  background: #4f90d1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid #0d4d98;
  border-bottom: none;
  border-radius: 15px 15px 0 0;
  padding: 0 20px;
}
.player-controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
}
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
.decorative-line {
  flex: 1;
  height: 5px;
  border-radius: 20px;
  background: white;
  margin: 0 15px;
}
.time-display {
  font-family: monospace;
  color: white;
  font-size: 14px;
  min-width: 50px;
  text-align: center;
  font-weight: 600;
}
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
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 5px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
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
.center-button-container {
  position: absolute;
  left: 50%;
  top: -30px;
  transform: translateX(-50%);
  z-index: 701;
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
.metadata-panel {
  position: absolute;
  bottom: 48px;
  left: 50%;
  width: 100%;
  max-width: 500px;
  transform: translateX(-50%);
  background: #4f90d1;
  backdrop-filter: blur(10px);
  border: 2px solid #0d4d98;
  border-bottom: none;
  padding: 45px 25px 25px;
  border-radius: 15px 15px 0 0;
  z-index: 700;
  text-align: center;
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
  font-weight: 600;
}
.song-artist {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.3rem;
  margin: 0;
  font-weight: 500;
}
.slide-fade-enter-active,
.slide-fade-fast-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active,
.slide-fade-fast-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
.slide-fade-fast-enter-active {
  transition: all 0.2s ease-out;
}
.slide-fade-fast-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-fast-enter-from,
.slide-fade-fast-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
