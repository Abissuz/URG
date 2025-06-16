<template>
  <div class="main">
    <div class="music-container">
      <!-- Cabecera de la sección -->
      <div class="music-header">
        <h2>Canciones</h2>
        <img src="@/assets/img/lupa.png" class="lupa" alt="Buscar" />
      </div>

      <!-- Cuadrícula de canciones con scroll horizontal -->
      <div class="music-grid">
        <div v-for="i in 15" :key="i" class="track">
          <img :src="logoUrl" class="track-cover" alt="Album" />
          <div class="track-info">
            <span class="track-title">Canción Ejemplo {{ i }}</span>
            <span class="track-artist">Artista {{ i }}</span>
          </div>
          <span class="track-duration">3:{{ i < 10 ? '0' + i : i }}</span>
        </div>
      </div>
    </div>
    <!-- Historial
    <div class="historial-container">
      <div class="historial-header">
        <h2>Historial</h2>
      </div>
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
    </div> -->
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

  <VideoPreview />
</template>

<script setup>
import logoUrl from '@/assets/img/logo-urg.png' // Importación correcta de la imagen
import VideoPreview from '@/components/VideoPreview.vue'
</script>

<style scoped>
.main {
  display: flex;
  /* height: 100%; */
  padding: 1.5rem;
  gap: 25px;
}
.music-container {
  width: 50%;
  border: 1px solid #0d4d98;
  border-radius: 10px;
  font-family: 'Sulphur Point', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.music-header {
  position: relative;
  background-color: #0d4d98;
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  flex-shrink: 0; /* Evita que el header se encoja */
}

.music-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-family: 'Sulphur Point', sans-serif;
  color: white;
  font-weight: 700;
}

.lupa {
  position: absolute;
  right: 20px;
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
  cursor: pointer;
}

/* Contenedor de la cuadrícula de canciones con scroll horizontal */
.music-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(4, auto);
  grid-auto-columns: minmax(300px, 1fr);
  gap: 0 20px;
  height: 100%;
  padding: 0 13px 13px 13px;
  overflow-x: auto;
  overflow-y: hidden;
}

/* Estilos de cada "casilla" de canción */
.track {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 12px 11px;
  border-bottom: 1px solid #a3a3a3a6;
  border-top: solid 1px #a3a3a3a6;
  transition: background-color 0.2s ease;
}

/* Quitar la línea del último elemento de cada "columna" visual */
.track:nth-child(4n) {
  border-bottom: none;
}
/* Asegurarse que el último elemento NUNCA tenga borde */
.track:last-child {
  border-bottom: none;
}

.track-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0;
}

.track-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Ocupa el espacio disponible */
  overflow: hidden; /* Para que el ellipsis funcione */
}

.track-title {
  color: #ffffff;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  color: #b3b3b3;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: #b3b3b3;
  font-size: 0.9rem;
  margin-left: auto; /* Empuja la duración al final */
  padding-left: 15px;
}

/* Scrollbar personalizado */
.music-grid::-webkit-scrollbar {
  height: 6px;
}
.music-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* border-radius: 4px; */
}
.music-grid::-webkit-scrollbar-thumb {
  background-color: #80868c5c;
  border-radius: 3px;
}

/* .music-grid:-webkit-scrollbar {
  width: 6px;
}
.music-grid::-webkit-scrollbar-thumb {
  background: #80868c5c;
  border-radius: 3px;
}
.music-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
} */

/* Historial */
/* .historial-container {
  width: 430px;
  height: 530px;
  border: 1px solid #0d4d98;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Sulphur Point', sans-serif;
}

.historial-header {
  background-color: #0069e2;
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
} */

/* End historial */
/* Cronograma */
.cronograma-container {
  width: 50%;
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
/* @media screen and (max-width: 1041px) {
  .main {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 60px;
  }
} */
@media screen and (max-width: 812px) {
  .main {
    flex-direction: column;
  }
  .music-container,
  .cronograma-container {
    width: 100%;
  }
}
</style>
