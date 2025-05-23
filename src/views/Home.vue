<template>
  <div class="main">
    <div class="music-container">
      <!-- Cabecera -->
      <div class="music-header">
        <h2>Canciones</h2>
        <img src="@/assets/img/lupa.png" class="lupa" alt="Buscar" />
      </div>

      <!-- Lista de canciones -->
      <div class="music-table">
        <div v-for="i in 12" :key="i" class="track">
          <img :src="logoUrl" class="track-cover" alt="Album" />
          <div class="track-info">
            <span class="track-title">Canción ejemplo {{ i }}</span>
            <span class="track-artist">Artista {{ i }}</span>
            <span class="track-duration">3:{{ i < 10 ? '0' + i : i }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Historial -->
    <div class="historial-container">
      <!-- Cabecera -->
      <div class="historial-header">
        <h2>Historial</h2>
      </div>
      <!-- Lista de canciones -->
      <div class="music-table">
        <div v-for="i in 12" :key="i" class="track">
          <img :src="logoUrl" class="track-cover" alt="Album" />
          <div class="track-info">
            <span class="track-title">Canción ejemplo {{ i }}</span>
            <span class="track-artist">Artista {{ i }}</span>
            <span class="track-duration">3:{{ i < 10 ? '0' + i : i }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Cronograma -->
    <!-- Historial -->
    <div class="cronograma-container">
      <!-- Cabecera -->
      <div class="cronograma-header">
        <h2>Cronograma</h2>
      </div>
      <!-- Lista de canciones -->
      <div class="music-table">
        <div v-for="i in 12" :key="i" class="track">
          <img :src="logoUrl" class="track-cover" alt="Album" />
          <div class="track-info">
            <span class="track-title">Los Kemonitos {{ i }}</span>
            <span class="track-artist">Autor: Flavio y Mariano {{ i }}</span>
            <span class="track-duration">Fecha: {{ i < 10 ? '0' + i : i }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logoUrl from '@/assets/img/logo-urg.png' // Importación correcta de la imagen
</script>

<style scoped>
.main {
  display: flex;
  height: 100%;
  gap: 25px;
}
.music-container {
  width: 430px;
  height: 530px;
  border: 1px solid #0d4d98;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Sulphur Point', sans-serif; /* Aplicado globalmente */
}

.music-header {
  position: relative; /* Necesario para posicionar la lupa */
  z-index: 30; /* Valor alto para que siempre esté arriba */
  background-color: #0d4d98;
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.music-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-family: 'Sulphur Point', sans-serif;
  color: white;
}

/* Lupa - Posicionada absolutamente dentro del header */
.lupa {
  position: absolute;
  right: 20px;
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
  z-index: 31; /* Un punto más que el header */
  cursor: pointer;
}
.music-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}
/* Historial */
.historial-container {
  width: 430px;
  height: 530px;
  border: 1px solid #0d4d98;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Sulphur Point', sans-serif; /* Aplicado globalmente */
}

.historial-header {
  background-color: #0d4d98;
  color: white;
  padding: 15px 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.historial-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

/* End historial */
/* Cronograma */
.cronograma-container {
  width: 430px;
  height: 530px;
  border: 1px solid #0d4d98;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Sulphur Point', sans-serif; /* Aplicado globalmente */
}

.cronograma-header {
  background-color: #0d4d98;
  color: white;
  padding: 15px 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cronograma-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

/* End cronograma */
.music-table {
  height: calc(100% - 53px);
  overflow-y: auto;
  background: white;
}

.track {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 12px 11px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.track:hover {
  background-color: #f0f8ff; /* Color más suave al hacer hover */
}

.track-cover {
  width: 85px;
  height: 85px;
  border-radius: 5px;
  object-fit: scale-down;
  border: 1px solid #eee;
}

.track-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Necesario para ellipsis */
}

.track-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
  color: #333;
}

.track-artist {
  font-size: 0.8em;
  color: #666;
}

.track-duration {
  color: #666;
  font-size: 0.9em;
  font-family: monospace; /* Para alinear mejor los números */
}

/* Scroll personalizado mejorado */
.music-table::-webkit-scrollbar {
  width: 6px;
}
.music-table::-webkit-scrollbar-thumb {
  background: #80868c5c;
  border-radius: 3px;
}
.music-table::-webkit-scrollbar-track {
  background: #f1f1f1;
}
@media screen and (max-width: 1385px) {
  .main {
    width: 95%;
  }
  .music-container,
  .historial-container,
  .cronograma-container {
    width: 80%;
  }
}
@media screen and (max-width: 1041px) {
  .main {
    /* display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px; */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 60px;
  }
}
</style>
