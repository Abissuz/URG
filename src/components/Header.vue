<!-- 
  AppLayout.vue
  Este componente define la estructura principal de la aplicación con el nuevo diseño de header.
-->
<template>
  <div class="app-layout-container">
    <!-- BARRA LATERAL DE NAVEGACIÓN (SIDEBAR) -->
    <aside class="sidebar" :class="{ 'is-mobile-open': isMobileMenuOpen }">
      <div class="sidebar-content">
        <div class="logo-area">
          <img src="@/assets/img/logo-urg.png" alt="Logo UNIMAR Radio" class="unimar-logo" />
        </div>
        <nav class="navigation-menu">
          <ul class="nav-list">
            <li>
              <router-link to="/" class="nav-item" active-class="active">
                <svg viewBox="0 0 24 24" class="nav-icon">
                  <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
                </svg>
                <span>Inicio</span>
              </router-link>
            </li>
            <li>
              <router-link to="/programas" class="nav-item" active-class="active">
                <svg viewBox="0 0 24 24" class="nav-icon">
                  <path
                    fill="currentColor"
                    d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H8v-2h4V6h2v4h4v2z"
                  ></path>
                </svg>
                <span>Programas</span>
              </router-link>
            </li>
            <li>
              <router-link to="/nosotros" class="nav-item" active-class="active">
                <svg viewBox="0 0 24 24" class="nav-icon">
                  <path
                    fill="currentColor"
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  ></path>
                </svg>
                <span>Nosotros</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <!-- CONTENEDOR PRINCIPAL (Este es el único elemento que tendrá scroll) -->
    <div class="main-content-wrapper">
      <!-- HEADER CON REPRODUCTOR MODIFICADO -->
      <header class="main-header">
        <div class="header-grid">
          <!-- Izquierda: Menú móvil, Play/Pausa, Modal -->
          <div class="header-left">
            <img src="@/assets/img/menu.png" @click="toggleMobileMenu" class="mobile-menu-toggle" />
            <button
              @click="togglePlay"
              class="control-btn play-pause-btn"
              :title="isPlaying ? 'Pausa' : 'Reproducir'"
            >
              <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"></path>
              </svg>
            </button>
            <button
              @click="toggleMetadata"
              class="control-btn arrow-btn"
              title="Mostrar información"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
              </svg>
            </button>
            <transition name="modal-fade">
              <div v-if="showMetadataModal" class="metadata-modal">
                <div class="modal-content">
                  <span class="track-title-modal">{{ currentTrack.title }}</span>
                  <span class="track-artist-modal">{{ currentTrack.artist }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Centro: Logo -->
          <div class="header-center">
            <img src="@/assets/img/urg-logo.png" alt="UNIMAR Radio Global" class="header-logo" />
          </div>

          <!-- Derecha: Volumen y Usuario -->
          <div class="header-right">
            <div class="volume-control">
              <button @click="toggleMute" class="control-btn volume-icon" title="Volumen">
                <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                  ></path>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  ></path>
                </svg>
              </button>
              <input
                type="range"
                class="volume-slider"
                v-model="volume"
                min="0"
                max="1"
                step="0.01"
                @input="setVolume"
              />
            </div>
            <router-link v-if="!isAuthenticated" to="/login" class="login-btn">
              Iniciar Sesión
            </router-link>
            <div v-else class="user-menu">
              <button @click="toggleDropdown" class="user-avatar-btn">A</button>
              <div v-if="showDropdown" class="dropdown-menu">
                <a href="#" @click.prevent="cerrarSesion">Cerrar Sesión</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Área de Contenido de la Página -->
      <main class="page-content">
        <slot />
        <!-- Aquí es donde App.vue insertará el <RouterView> -->
      </main>

      <!-- Footer ahora es parte de este layout -->
      <Footer />
    </div>

    <!-- Elemento de audio global para toda la app -->
    <audio
      ref="audioElement"
      :src="streamUrl"
      autoplay
      preload="auto"
      crossorigin="anonymous"
      hidden
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import Footer from './Footer.vue'

// Lógica de UI (Menú móvil, Modal)
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
const showMetadataModal = ref(false)
const toggleMetadata = () => {
  showMetadataModal.value = !showMetadataModal.value
}

// Lógica de Autenticación
const isAuthenticated = ref(false)
const showDropdown = ref(false)
const router = useRouter()
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  isAuthenticated.value = !!user
})
const cerrarSesion = async () => {
  await signOut(auth)
  router.push('/')
}
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Lógica del Reproductor
const streamUrl = 'https://stream.zeno.fm/xmah2zunhgmtv'
const metadataUrl = 'https://api.zeno.fm/mounts/metadata/subscribe/xmah2zunhgmtv'
const audioElement = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(0.5)
const currentTrack = ref({ title: 'Programación en vivo', artist: 'UNIMAR RADIO' })
let eventSource = null

const togglePlay = () => {
  if (!audioElement.value) return
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.src = `${streamUrl}?t=${Date.now()}`
    audioElement.value.play().catch(console.error)
  }
}
const setVolume = () => {
  if (audioElement.value) audioElement.value.volume = volume.value
  isMuted.value = volume.value === 0
}
const toggleMute = () => {
  if (audioElement.value) {
    audioElement.value.muted = !audioElement.value.muted
    isMuted.value = audioElement.value.muted
  }
}
const parseMetadata = (title) => {
  if (!title) return { title: 'Programación en vivo', artist: 'UNIMAR RADIO' }
  const parts = title.split(' - ')
  if (parts.length > 1) {
    return { artist: parts[0].trim(), title: parts[1].trim() }
  }
  return { title: title.trim(), artist: 'UNIMAR RADIO' }
}
const connectSSE = () => {
  if (eventSource) eventSource.close()
  eventSource = new EventSource(metadataUrl)
  eventSource.onmessage = (event) => {
    try {
      const newTrack = parseMetadata(JSON.parse(event.data).streamTitle)
      if (newTrack && newTrack.title !== currentTrack.value.title) {
        currentTrack.value = newTrack
      }
    } catch (e) {
      /* silent fail */
    }
  }
  eventSource.onerror = () => setTimeout(connectSSE, 5000)
}
onMounted(() => {
  connectSSE()
  if (audioElement.value) {
    audioElement.value.volume = volume.value
    audioElement.value.onplaying = () => (isPlaying.value = true)
    audioElement.value.onpause = () => (isPlaying.value = false)
  }
})
onUnmounted(() => {
  if (eventSource) eventSource.close()
})
</script>

<style>
/* Estilos del Layout Principal */
.app-layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.main-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.main-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 70px;
  background-color: #181818;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #282828;
  flex-shrink: 0;
}
.page-content {
  flex-grow: 1;
  padding: 1.5rem;
  background-color: #121212;
}
/* Estilos de la Barra Lateral (Sidebar) */
.sidebar {
  width: 240px;
  background-color: #000;
  border-right: 1px solid #282828;
  padding: 1.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.logo-area {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  margin-bottom: 2.5rem;
}
.unimar-logo {
  height: auto;
  width: 100%;
  max-width: 180px;
  object-fit: contain;
}
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #b3b3b3;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}
.nav-item:hover {
  background-color: #1a1a1a;
  color: #fff;
}
.nav-item.active {
  background-color: #282828;
  color: #fff;
}
.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 1rem;
}
/* Estilos del Header Modificado */
.header-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}
.header-right {
  justify-content: flex-end;
  gap: 1.5rem;
}
.header-center {
  flex: 0 1 auto;
}
.header-logo {
  height: 45px;
  width: auto;
}
.control-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  padding: 4px;
  display: flex;
}
.control-btn:hover {
  color: #fff;
}
.control-btn svg {
  width: 24px;
  height: 24px;
}
.play-pause-btn svg {
  width: 28px;
  height: 28px;
}
.volume-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.volume-slider {
  width: 100px;
}
.login-btn {
  background-color: #fff;
  color: #000;
  padding: 8px 24px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: transform 0.1s ease;
}
.login-btn:hover {
  transform: scale(1.05);
}
.user-menu {
  position: relative;
}
.user-avatar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0d4d98;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.dropdown-menu {
  position: absolute;
  top: 140%;
  right: 0;
  background-color: #282828;
  border-radius: 4px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 10;
}
.dropdown-menu a {
  display: block;
  padding: 0.5rem 1rem;
  color: #fff;
  text-decoration: none;
}
.dropdown-menu a:hover {
  background-color: #404040;
}
.header-left {
  position: relative;
}
.metadata-modal {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  background-color: #2c2c2e;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  border: 1px solid #3a3a3c;
  width: 300px;
  z-index: 1001;
}
.modal-content {
  display: flex;
  flex-direction: column;
}
.track-title-modal {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.track-artist-modal {
  font-size: 0.9rem;
  color: #b3b3b3;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
/* Estilos Responsivos */
.mobile-menu-toggle {
  display: none;
}
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
    z-index: 1000;
  }
  .sidebar.is-mobile-open {
    transform: translateX(0);
  }
  .mobile-menu-toggle {
    display: block;
    background: none;
    border: none;
    color: #b3b3b3;
  }
  .mobile-menu-toggle svg {
    width: 28px;
    height: 28px;
  }
  .header-grid {
    display: flex;
    justify-content: space-between;
  }
  .header-left {
    flex: 0 1 auto;
  }
  .header-right {
    flex: 0 1 auto;
  }
  /* .header-center,
  .header-left .play-pause-btn,
  .header-left .arrow-btn {
    display: none;
  } */
}
</style>
