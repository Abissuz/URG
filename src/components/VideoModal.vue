<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">
        <img src="@/assets/img/cerrar-simbolo-de-boton-circular.png" alt="Buscar" />
      </button>
      <div class="video-container">
        <iframe
          :src="youtubeEmbedUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  videoId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

// CORRECIÓN FINAL Y DEFINITIVA: Se usa la URL oficial de YouTube para incrustar.
// DESPUÉS (Correcto)
const youtubeEmbedUrl = computed(() => {
  return `https://www.youtube.com/embed/${props.videoId}?autoplay=1&rel=0`
})

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 920px;
}

.close-button {
  position: absolute;
  top: -15px;
  right: -15px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-weight: bold;
  cursor: pointer;
  line-height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* Proporción 16:9 */
  height: 0;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
