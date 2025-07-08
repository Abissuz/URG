<template>
  <!-- Si la ruta tiene la meta 'oculto' (como el login), solo muestra el RouterView -->
  <RouterView v-if="$route.meta.oculto" />

  <!-- Layout principal para el resto de la aplicación -->
  <div v-else class="app-layout-container">
    <aside class="sidebar" :class="{ 'is-mobile-open': isMobileMenuOpen }">
      <button @click="toggleMobileMenu" class="sidebar-close-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="28px" height="28px">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          ></path>
        </svg>
      </button>

      <router-link to="/">
        <div class="logo-area">
          <img src="@/assets/img/Blanci.png" alt="Logo UNIMAR Radio" class="unimar-logo" />
        </div>
      </router-link>

      <div class="sidebar-content">
        <nav class="navigation-menu">
          <ul class="nav-list">
            <!-- ENLACES ESTÁTICOS (Siempre visibles) -->
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

            <!-- MEJORA DE UX - ESTADO DE CARGA -->
            <li v-if="authStore.loading && authStore.isLoggedIn" class="nav-item-placeholder">
              <div class="placeholder-icon"></div>
              <div class="placeholder-text"></div>
            </li>
            <li v-if="!authStore.loading && authStore.canUpdateContent">
              <router-link to="/actualizar-contenido" class="nav-item" active-class="active">
                <svg viewBox="0 0 24 24" class="nav-icon">
                  <path
                    fill="currentColor"
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83l3.75 3.75l1.83-1.83z"
                  ></path>
                </svg>
                <span>Actualizar Contenido</span>

                <span v-if="authStore.hasNewSongRequest" class="notification-dot"></span>
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
            <li>
              <router-link to="/favoritos" class="nav-item" active-class="active">
                <svg viewBox="0 0 24 24" class="nav-icon">
                  <path
                    fill="currentColor"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  ></path>
                </svg>
                <span>Favoritos</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>

    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="toggleMobileMenu"></div>

    <div class="main-content-wrapper" ref="mainContentRef">
      <header class="main-header">
        <div class="header-grid">
          <div class="header-left">
            <button @click="toggleMobileMenu" class="mobile-menu-toggle">
              <img src="@/assets/img/menu.png" alt="Menu" />
            </button>
            <div class="desktop-player-controls">
              <button
                @click="playerStore.togglePlay()"
                class="control-btn play-pause-btn"
                :title="playerStore.isPlaying ? 'Pausa' : 'Reproducir'"
              >
                <svg v-if="playerStore.isPlaying" viewBox="0 0 24 24" fill="white">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"></path></svg>
              </button>
              <div class="desktop-track-info">
                <div class="marquee-wrapper">
                  <span class="track-title-desktop">{{ playerStore.currentTrack.title }}</span>
                </div>
                <span class="track-artist-desktop">{{ playerStore.currentTrack.artist }}</span>
              </div>
              <button
                v-if="!playerStore.isLiveStreaming"
                @click="playerStore.switchToLiveStream()"
                class="live-btn"
              >
                Volver al Vivo
              </button>
            </div>
          </div>

          <router-link to="/" class="header-center">
            <img src="@/assets/img/urg-logo.png" alt="UNIMAR Radio Global" class="header-logo" />
          </router-link>

          <div class="header-right">
            <div class="volume-control">
              <button
                @click="playerStore.toggleMute()"
                class="control-btn volume-icon"
                title="Volumen"
              >
                <svg
                  v-if="playerStore.isMuted || playerStore.volume == 0"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path
                    d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                  ></path>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="white">
                  <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  ></path>
                </svg>
              </button>
              <input
                type="range"
                :value="playerStore.volume"
                @input="updateVolume"
                min="0"
                max="1"
                step="0.01"
                class="volume-slider"
              />
            </div>

            <div v-if="authStore.loading" class="user-menu-placeholder"></div>
            <!-- [MODIFICADO] Se agrupan los botones de login bajo un solo <template> para que el v-if funcione correctamente -->
            <template v-else-if="!authStore.isLoggedIn">
              <router-link to="/login" class="login-btn">Iniciar Sesión</router-link>
              <router-link to="/login" class="login-btn-mobile">
                <img src="@/assets/img/login-mobile.png" alt="Iniciar Sesión" />
              </router-link>
            </template>
            <div v-else class="user-menu" ref="userMenuRef">
              <button @click.stop="toggleDropdown" class="user-profile-btn">
                <span class="user-name">{{
                  authStore.user.displayName || authStore.user.email
                }}</span>
                <div class="user-avatar">{{ authStore.userInitial }}</div>
              </button>
              <transition name="dropdown-fade">
                <div v-if="showDropdown" class="dropdown-menu">
                  <div class="dropdown-item" @click="cerrarSesion">
                    <svg viewBox="0 0 24 24" class="dropdown-icon">
                      <path
                        fill="currentColor"
                        d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"
                      />
                    </svg>
                    Cerrar sesión
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </header>

      <main class="page-content">
        <RouterView />
      </main>

      <Footer />
    </div>

    <audio ref="audioTag" autoplay preload="auto" crossorigin="anonymous" hidden></audio>
    <BottomPlayer />
  </div>
</template>

<script setup>
// --- Importaciones ---
import { ref, onMounted, onUnmounted, provide, watch } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { usePlayerStore } from './stores/player.js'
import { useAuthStore } from './stores/auth.js'
import { usePodcastStore } from './stores/counter.js'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/firebase/config'

import Footer from './components/Footer.vue'
import BottomPlayer from './components/BottomPlayer.vue'

// --- Inicialización de Stores y Router ---
const router = useRouter()
const route = useRoute()
const playerStore = usePlayerStore()
const authStore = useAuthStore()
const podcastStore = usePodcastStore()

// --- Lógica de Scroll ---
const mainContentRef = ref(null)
const scrollTop = () => {
  mainContentRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
provide('scrollTop', scrollTop)
watch(
  () => route.path,
  () => {
    scrollTop()
  },
)

// --- [LÓGICA DE NOTIFICACIONES CORREGIDA Y SIMPLIFICADA] ---
let unsubscribeRequests = null

// Este "vigilante" ahora observa directamente el ROL del usuario.
watch(
  () => authStore.userRole,
  (newRole) => {
    const isStaff = newRole === 'admin' || newRole === 'moderador'

    // Si el usuario AHORA es staff y no estábamos escuchando...
    if (isStaff && !unsubscribeRequests) {
      console.log(`Usuario es ${newRole}. Iniciando listener de peticiones...`)

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const q = query(collection(db, 'song_requests'), where('timestamp', '>=', twentyFourHoursAgo))

      unsubscribeRequests = onSnapshot(q, (snapshot) => {
        const currentRequestCount = authStore.songRequests.length
        if (snapshot.docs.length > currentRequestCount && currentRequestCount > 0) {
          authStore.setHasNewSongRequest(true)
        }
        authStore.songRequests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      })
    }
    // Si el usuario AHORA NO es staff y SÍ estábamos escuchando...
    else if (!isStaff && unsubscribeRequests) {
      console.log('Usuario ya no es Staff. Deteniendo listener de peticiones.')
      unsubscribeRequests()
      unsubscribeRequests = null
    }
  },
)

// --- Lógica del Componente (sin cambios) ---
const audioTag = ref(null)
const userMenuRef = ref(null)
const isMobileMenuOpen = ref(false)
const showDropdown = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}
const updateVolume = (event) => {
  playerStore.setVolume(parseFloat(event.target.value))
}
const handleClickOutside = (event) => {
  if (showDropdown.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}
const cerrarSesion = async () => {
  showDropdown.value = false
  await authStore.logout()
  router.push('/')
}

onMounted(() => {
  playerStore.init(audioTag.value)
  podcastStore.initialize()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (unsubscribeRequests) unsubscribeRequests()
})
</script>

<style>
/* Tus estilos no necesitan cambios */
html,
body,
#app {
  height: 100%;
  margin: 0;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}
.app-layout-container {
  display: flex;
  height: 100vh;
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
  background-color: #0d4d98;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #282828;
  flex-shrink: 0;
}
.page-content {
  flex-grow: 1;
}
.sidebar {
  width: 240px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease-in-out;
}
/* Añade esto al final del <style> en App.vue */
.nav-item {
  position: relative; /* Necesario para posicionar el punto */
}

.notification-dot {
  position: absolute;
  top: 10px;
  right: 15px; /* Ajustado para que se vea bien */
  width: 10px;
  height: 10px;
  background-color: #dc3545; /* Rojo de Bootstrap */
  border-radius: 50%;
  border: 2px solid #ffffff; /* Borde blanco para que resalte */
  box-shadow: 0 0 5px rgba(220, 53, 69, 0.7);
}
.sidebar-content {
  padding: 1.5rem 0.75rem;
  height: 90%;
  border-right: #3491ff82 solid 1px;
}
.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 70px;
  background-color: #0d4d98;
}
.unimar-logo {
  height: auto;
  width: 100%;
  max-width: 180px;
  object-fit: contain;
}
.nav-list {
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 3px;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: #555555;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}
.nav-item:hover,
.nav-item.active {
  background-color: #0075ffa8;
  color: #fff;
}
.nav-icon {
  width: 24px;
  height: 24px;
  margin-right: 1rem;
}
.nav-item-placeholder {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  gap: 1rem;
}
.placeholder-icon,
.placeholder-text {
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.placeholder-icon {
  width: 24px;
  height: 24px;
}
.placeholder-text {
  width: 120px;
  height: 16px;
}
.user-menu-placeholder {
  width: 150px;
  height: 40px;
  background-color: #e0e0e0;
  border-radius: 50px;
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
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
}
.header-right {
  justify-content: flex-end;
  gap: 1.5rem;
}
.header-center {
  flex: 1;
  text-align: center;
}
.header-logo {
  height: 50px;
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
.login-btn-mobile {
  display: none;
}
.login-btn:hover {
  transform: scale(1.05);
}
.user-menu {
  position: relative;
}
.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  transition: background 0.2s;
}
.user-profile-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4f90d1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 120%;
  margin-top: 0.5rem;
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  min-width: 200px;
  z-index: 1051;
  overflow: hidden;
  border: 1px solid #404040;
  display: block !important;
}
.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background: #404040;
}
.dropdown-icon {
  width: 18px;
  height: 18px;
  margin-right: 0.75rem;
}
.dropdown-header {
  padding: 0.5rem 1rem;
  color: #b3b3b3;
  font-size: 0.8rem;
  border-bottom: 1px solid #404040;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.desktop-track-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 250px;
}
.marquee-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
.track-title-desktop {
  display: inline-block;
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  animation: marquee 15s linear infinite;
}
.track-artist-desktop {
  font-size: 0.8rem;
  color: #b3b3b3;
}
@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.mobile-menu-toggle,
.sidebar-close-btn,
.mobile-overlay {
  display: none;
}
.desktop-player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(-100%);
    z-index: 1002;
    width: 260px;
  }
  .sidebar.is-mobile-open {
    transform: translateX(0);
  }
  .sidebar-close-btn {
    display: block;
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
  }
  .mobile-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1001;
  }
  .sidebar.is-mobile-open ~ .mobile-overlay {
    display: block;
  }
  .mobile-menu-toggle {
    display: block;
    background: none;
    border: none;
    padding: 0;
  }
  .mobile-menu-toggle img {
    width: 30px;
    height: 30px;
  }
  .header-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }
  .header-left {
    justify-content: flex-start;
  }
  .header-center {
    justify-self: center;
  }
  .header-right {
    justify-content: flex-end;
  }
  .main-header {
    padding: 0 1rem;
  }
  .desktop-player-controls,
  .volume-control {
    display: none;
  }
  .login-btn-mobile {
    display: block;
  }
  .login-btn-mobile > img {
    width: 35px;
    height: 35px;
  }
  .login-btn {
    display: none;
  }
  .user-name {
    display: none;
  }
}
@media screen and (max-width: 700px) {
  .sidebar.is-mobile-open {
    width: 100%;
  }
  .sidebar-close-btn {
    display: flex;
  }
}
.live-btn {
  background-color: #ff8a00;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  margin-left: 1rem;
  transition: background-color 0.2s ease;
}
.live-btn:hover {
  background-color: #e67a00;
}
</style>
