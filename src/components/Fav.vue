<template>
  <div v-if="isAuthenticated" class="menu-container">
    <div class="menu-button" @click="toggleMenu">
      <img src="@/assets/img/gusta.png" class="menu-icon" alt="Menú" />
    </div>

    <!-- Overlay oscuro -->
    <transition name="fade">
      <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu"></div>
    </transition>

    <!-- Menú desplegable -->
    <transition name="slide">
      <div v-if="isMenuOpen" class="menu-content">
        <!-- Botón de cierre (X) - Solo visible en móviles -->
        <button class="close-button" @click="closeMenu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- headere del menu -->
        <div class="header-menu">
          <div class="circulo-menu">
            <img src="@/assets/img/logo-urg.png" alt="img-menu" />
          </div>
        </div>
        <!-- Contenido del menú -->
        <div class="menu-sections">
          <div class="menu-section">
            <span class="section-title" style="border-radius: 0 0 10px 0">Historial</span>
            <ul>
              <li>Título del video/podcast visto recientemente</li>
              <li>Título del video/podcast visto recientemente</li>
              <li>Título del video/podcast visto recientemente</li>
            </ul>
          </div>

          <div class="menu-section">
            <h3 class="section-title">Favoritos</h3>
            <div class="search-box">
              <input
                type="text"
                placeholder="Buscar..."
                class="form-control text-center"
                style="box-shadow: none"
              />
              <img src="@/assets/img/lupa.png" class="search-icon" alt="Buscar" />
            </div>
            <ul>
              <li>Título del Video</li>
              <li>Título del video/podcast visto recientemente</li>
              <li>Título del video/podcast visto recientemente</li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

//mostrar Menu si estas iniciado
let isAuthenticated = ref(false)
onMounted(() => {
  let auth = getAuth()
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user
  })
  onUnmounted(() => {
    unsubscribe()
  })
})
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
      closeMenu()
    }
  })
})
</script>

<style scoped>
/* Contenedor principal */
.menu-container {
  position: fixed;
  top: 150px;
  left: 0;
  z-index: 1000; /* Alto z-index para que esté sobre todo */
}

/* Botón del menú */
.menu-button {
  width: 40px;
  height: 40px;
  background-color: #0d4d98;
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-button:hover {
  background-color: #0a3d7a;
}

.menu-icon {
  width: 26px;
  height: 26px;
}

/* Overlay oscuro */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999; /* Debajo del menú pero sobre todo lo demás */
}

/* Contenido del menú */
.header-menu {
  width: 100%;
  background-color: #0d4d98;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10%;
}
.circulo-menu {
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  width: 65px;
  height: 65px;
}
.circulo-menu > img {
  width: 50px;
  height: 50px;
  object-fit: scale-down;
}
.menu-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 455px;
  height: 100vh;
  background: #fc802e;
  z-index: 1000; /* Más alto que el overlay y header */
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  border-radius: 0 20px 20px 0;
}

/* Botón de cierre (X) */
.close-button {
  display: none; /* Oculto por defecto */
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  padding: 5px;
}

.close-button svg {
  stroke: white;
}

/* Secciones del menú */
.menu-sections {
  height: 90%;
}
.menu-section {
  height: 50%;
  align-items: center;
  display: flex;
  flex-direction: column;
}

.section-title {
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
  border-radius: 0 10px 10px 0;
  background-color: #ff971c;
  color: #ffffff;
  font-size: 1.2rem;
  font-family: 'Sulphur Point', sans-serif;
  padding: 10px 20px;
  margin: 0;
  border: 2px solid #ff7700;
}

.menu-content ul {
  padding: 0;
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin: 10px 0;
  color: white;
}

.menu-content li {
  padding: 12px 0px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-content li:hover {
  background-color: #ff6a1ce6;
  border-radius: 20px;
  width: 85%;
}

/* Buscador */
.search-box {
  position: relative;
  padding: 10px 20px;
}

.search-box input {
  width: 100%;
  padding: 8px 35px 8px 15px;
  border: 1px solid #dddddd00;
  border-radius: 20px;
  background-color: rgba(255, 205, 179, 0.21);
  outline: none;
  color: white;
}
.search-box input::placeholder {
  color: rgb(255, 255, 255);
}
.search-icon {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #0d4d98;
  width: 15px;
  cursor: pointer;
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* Media Queries */
@media screen and (max-width: 550px) {
  .menu-content {
    width: 100%;
    height: 100%;
  }

  .close-button {
    display: block; /* Mostrar el botón X solo en móviles */
  }
}

@media screen and (max-width: 266px) {
  ul > li {
    width: 195px;
  }
}
</style>
