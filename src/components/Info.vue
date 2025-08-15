<template>
  <div>
    <button @click="openPanel" class="info-toggle-button" title="Acerca de este Proyecto">!</button>

    <Transition name="fade">
      <div v-if="isPanelOpen" @click="closePanel" class="info-overlay"></div>
    </Transition>

    <Transition name="modal-pop">
      <div v-if="isPanelOpen" class="info-panel">
        <div class="info-panel-header">
          <h3>Acerca de este proyecto</h3>
          <button @click="closePanel" class="close-button">&times;</button>
        </div>

        <div class="info-panel-body">
          <div class="slider-wrapper">
            <button
              @click="prevSlide"
              :disabled="currentSlide === 0"
              class="slider-arrow-button prev"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="slider-content">
              <div v-if="currentSlide === 0" class="slide">
                <h4>¡Bienvenido a mi Proyecto!</h4>
                <p>
                  Hola, mi nombre es <strong>André Mendoza</strong>. Lo que estás viendo es la
                  demostración funcional de mi proyecto de tesis para optar por el título de
                  <strong>Ingeniero en Sistemas</strong>.
                </p>
                <p>
                  Esta es una plataforma para mejorar la interacción, alcance y accesibilidad de la
                  Radio de la universidad. Utiliza los controles de navegación para conocer más
                  sobre las tecnologías que usé y mi rol en el desarrollo.
                </p>
              </div>

              <div v-if="currentSlide === 1" class="slide">
                <h4>Tecnologías Utilizadas</h4>
                <ul>
                  <li><strong>Frontend:</strong> Vue.js 3 (Composition API)</li>
                  <li><strong>Gestión de Estado:</strong> Pinia</li>
                  <li>
                    <strong>Backend (BaaS):</strong> Firebase (Authentication, Firestore, Storage)
                  </li>
                  <li><strong>Routing:</strong> Vue Router</li>
                  <li><strong>UI Framework:</strong> Bootstrap 5</li>
                  <li><strong>Entorno de Desarrollo:</strong> Vite</li>
                  <li><strong>APIs Externas:</strong> YouTube Data API v3, Zeno.fm</li>
                </ul>
              </div>

              <div v-if="currentSlide === 2" class="slide">
                <h4>Prueba la Experiencia</h4>
                <p>
                  Para explorar los diferentes roles, puedes usar las siguientes credenciales de
                  acceso:
                </p>
                <div class="credentials-list">
                  <div class="credential-item">
                    <strong>Rol Usuario:</strong>
                    <code>user@unimar.edu.ve</code>
                    <span>Contraseña: <code>user123</code></span>
                  </div>
                  <div class="credential-item">
                    <strong>Rol Moderador:</strong>
                    <code>moderador@unimar.edu.ve</code>
                    <span>Contraseña: <code>moderador123</code></span>
                  </div>
                  <div class="credential-item">
                    <strong>Rol Administrador:</strong>
                    <code>admin@unimar.edu.ve</code>
                    <span>Contraseña: <code>admin123</code></span>
                  </div>
                </div>
              </div>

              <div v-if="currentSlide === 3" class="slide">
                <h4>Mi Rol en el Proyecto</h4>
                <p>
                  Fui responsable del <strong>ciclo completo de desarrollo (full-stack)</strong>:
                  desde la investigación y definición de requerimientos documentados en la tesis,
                  hasta el diseño de la arquitectura, la codificación del frontend, la configuración
                  del backend en Firebase y el despliegue final.
                </p>
                <p><strong>¡Gracias por visitar!</strong></p>
              </div>
            </div>

            <button
              @click="nextSlide"
              :disabled="currentSlide === totalSlides - 1"
              class="slider-arrow-button next"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="slider-nav">
            <div class="slider-dots">
              <span
                v-for="index in totalSlides"
                :key="index"
                class="dot"
                :class="{ active: currentSlide === index - 1 }"
                @click="goToSlide(index - 1)"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isPanelOpen = ref(false)
const currentSlide = ref(0)
const totalSlides = 4

const openPanel = () => {
  isPanelOpen.value = true
}
const closePanel = () => {
  isPanelOpen.value = false
}
const nextSlide = () => {
  if (currentSlide.value < totalSlides - 1) currentSlide.value++
}
const prevSlide = () => {
  if (currentSlide.value > 0) currentSlide.value--
}
const goToSlide = (slideIndex) => {
  currentSlide.value = slideIndex
}

onMounted(() => {
  if (!sessionStorage.getItem('hasSeenPortfolioInfo')) {
    setTimeout(() => {
      openPanel()
      sessionStorage.setItem('hasSeenPortfolioInfo', 'true')
    }, 3000)
  }
})
</script>

<style scoped>
/* --- Botón Fijo --- */
.info-toggle-button {
  position: fixed;
  top: 25%;
  right: 0;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: white;
  border: 2px solid #0d6efd;
  border-right: none;
  border-radius: 8px 0 0 8px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  font-size: 2rem;
  font-weight: bold;
  color: #0d6efd;
  cursor: pointer;
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 5px;
}

/* --- Modal y Overlay --- */
.info-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  height: auto;
  background-color: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  z-index: 1052;
  display: flex;
  flex-direction: column;
}
.info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1051;
}

/* --- Estructura del Modal --- */
.info-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}
.info-panel-header h3 {
  margin: 0;
  font-size: 1.2rem;
}
.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #888;
}
.info-panel-body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* --- Slider y Navegación --- */
.slider-wrapper {
  position: relative;
  flex-grow: 1;
  /* [AJUSTE FINAL] Se crea el margen lateral para las flechas */
  padding: 0 60px;
}
.slider-content {
  /* [AJUSTE FINAL] Se elimina el padding para que el wrapper lo controle */
  padding: 0;
  line-height: 1.6;
}
.slide h4 {
  color: #0d6efd;
  margin-bottom: 1rem;
}
.slider-arrow-button {
  position: absolute;
  top: 50%;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 1rem;
  transition: all 0.2s ease;
}
.slider-arrow-button:hover:not(:disabled) {
  background-color: #0d6efd;
  color: white;
  transform: translateY(-50%) scale(1.1);
}
.slider-arrow-button:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}
.slider-arrow-button.prev {
  /* [AJUSTE FINAL] Se centra la flecha en el margen izquierdo */
  left: 30px;
  transform: translate(-50%, -50%);
}
.slider-arrow-button.next {
  /* [AJUSTE FINAL] Se centra la flecha en el margen derecho */
  right: 30px;
  transform: translate(50%, -50%);
}
.slider-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}
.slider-dots {
  display: flex;
  gap: 10px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.dot:hover {
  background-color: #aaa;
}
.dot.active {
  background-color: #0d6efd;
}

/* --- Contenido Específico (Credenciales) --- */
.credentials-list {
  margin-top: 1rem;
}
.credential-item {
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}
.credential-item strong {
  margin-bottom: 5px;
}
.credential-item code {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  color: #c7254e;
}
.slider-arrow-button:hover:not(:disabled) {
  background-color: #0d6efd;
  color: white;
  transform: translate(50%, -50%);
}
/* --- Transiciones de Vue --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: all 0.3s ease;
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
