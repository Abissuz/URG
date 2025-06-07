<template>
  <div>
    <!-- Footer principal -->
    <footer class="unimar-footer" ref="footerElement">
      <div class="footer-container">
        <!-- Logo en desktop (izquierda) -->
        <div class="desktop-logo">
          <a
            href="https://www.unimar.edu.ve/portalunimar/public/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="@/assets/img/logo.png" alt="Logo UNIMAR" class="logo-img" />
          </a>
        </div>

        <!-- Contenido principal del footer -->
        <div class="main-footer-content">
          <div class="container">
            <!-- Acordeón para móviles -->
            <div class="footer-accordion">
              <div class="accordion-item" v-for="(column, index) in columns" :key="index">
                <button class="accordion-header" @click="toggleAccordion(index)">
                  {{ column.title }}
                  <span class="accordion-icon">{{ isOpen[index] ? '−' : '+' }}</span>
                </button>
                <transition name="slide">
                  <ul class="accordion-content" v-show="isOpen[index]">
                    <li v-for="(item, i) in column.items" :key="i">{{ item }}</li>
                  </ul>
                </transition>
              </div>
            </div>

            <!-- Grid para desktop (oculto en móviles) -->
            <div class="footer-grid">
              <!-- Columnas del footer -->
              <div class="footer-column" v-for="(column, index) in columns" :key="'d-' + index">
                <h3 class="footer-title">{{ column.title }}</h3>
                <ul class="footer-list">
                  <li v-for="(item, i) in column.items" :key="'d-' + i">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Logo en móviles -->
          <div class="mobile-logo">
            <a
              href="https://www.unimar.edu.ve/portalunimar/public/home"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="@/assets/img/logo.png" alt="Logo UNIMAR" class="logo-img" />
            </a>
          </div>
        </div>
      </div>
      <!-- Franja de redes sociales -->
      <div class="social-bar">
        <div class="social-icons">
          <a href="mailto:info@unimar.edu.ve" class="social-icon"
            ><i class="fa-solid fa-envelope"></i
          ></a>
          <a
            href="https://www.facebook.com/univdemargarita/?rdid=PknVtMySq1R6QgO0&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CJrXgVUPe%2F"
            class="social-icon"
          >
            <i class="fa-brands fa-square-facebook"></i
          ></a>
          <a href="https://www.twitter.com/somosunimar" class="social-icon"
            ><i class="fa-brands fa-square-x-twitter"></i
          ></a>
          <a href="https://www.instagram.com/unimaradioglobal/" class="social-icon"
            ><i class="fa-brands fa-square-instagram"></i
          ></a>
          <a href="https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw" class="social-icon"
            ><i class="fa-brands fa-square-youtube"></i
          ></a>
          <a href="https://www.linkedin.com/company/univdemargarita" class="social-icon"
            ><i class="fa-brands fa-linkedin"></i
          ></a>
        </div>
      </div>
      <!-- Dirección y Copyright -->
      <div class="footer-bottom">
        <div class="footer-address">
          <p>
            Av. Concepción Mariño, Sector II Tópico, El Valle del Espíritu Santo, Edo. Nueva
            Esparta, Venezuela.
          </p>
        </div>
        <div class="footer-copyright">
          <p>
            © Copyright 2001-2025 Universidad de Margarita, RIF. J-55050040-0, Isla de Margarita -
            Venezuela.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Importaciones
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { usePlayerStore } from '@/stores/player'

// export default {
//   name: 'UnimarFooter',
//   setup() {
const columns = ref([
  {
    title: 'NUESTRA INSTITUCIÓN',
    items: ['Rectorado', 'Vicerrectorados', 'Decanatos'],
  },
  {
    title: 'OFERTAS DE ESTUDIOS',
    items: ['Pregrado', 'Postgrado', 'Diplomados', 'Cursos y Talleres'],
  },
  {
    title: 'SERVICIOS WEB',
    items: ['Académicos', 'Biblioteca UNIMAR', 'Educación Virtual', 'Pagos Online'],
  },
  {
    title: 'ACCESOS RÁPIDOS',
    items: [
      'Directora Académica',
      'Calendario Académico',
      'Contáctanos a través de',
      'Bienestar Estudiantil',
    ],
  },
])

const isOpen = ref(columns.value.map(() => false))
const footerElement = ref(null)
const playerStore = usePlayerStore()

// Métodos
const toggleAccordion = (index) => {
  isOpen.value[index] = !isOpen.value[index]
}

// Intersection Observer
let observer
let lastY = 0
const scrollThreshold = 5 // Pixeles de margen de error

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      const currentY = entry.boundingClientRect.y

      // Solo actúa si el cambio de posición es significativo
      if (Math.abs(currentY - lastY) > scrollThreshold) {
        playerStore.setFooterVisibility(entry.isIntersecting)
        lastY = currentY
      }
    },
    {
      threshold: [0, 0.5, 1], // Dispara en 0%, 50% y 100% de visibilidad
      rootMargin: '0px 0px 0px 0px', // Margen negativo ajustado
    },
  )

  if (footerElement.value) {
    observer.observe(footerElement.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Franja de redes sociales */
.social-bar {
  background-color: #0d4d98;
  padding: 15px 0;
  display: flex;
  justify-content: center;
  position: relative;
}
.social-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px; /* Grosor del borde */
  background: linear-gradient(to right, transparent, #ffffff53, /* Color del borde */ transparent);
}

.social-icons {
  display: flex;
  gap: 20px;
}

.social-icon {
  color: #ffffff;
  font-size: 1.5rem;
  transition: transform 0.3s;
}

.social-icon:hover {
  transform: scale(1.2);
  color: #ff971c;
}

/* Footer principal */
.unimar-footer {
  margin-top: 60px;
  background-color: #0d4d98;
  color: white;
  padding: 2rem 0;
  font-family: 'Arial', sans-serif;
  position: relative;
}

.footer-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  align-items: flex-start;
  gap: 2rem;
}

/* Logo en desktop */
.desktop-logo {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
}

/* Logo en móviles */
.mobile-logo {
  display: none;
}

.logo-img {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
}

.main-footer-content {
  flex: 1;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Grid para desktop */
.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-column {
  padding: 0 10px;
}

.footer-title {
  color: #ff971c;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ff7700;
  text-transform: uppercase;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.footer-list li:hover {
  color: #ff971c;
}

/* Acordeón para móviles */
.footer-accordion {
  display: none;
}

.accordion-item {
  margin-bottom: 1rem;
}

.accordion-header {
  width: 100%;
  background: transparent;
  border: none;
  color: #ff971c;
  font-size: 1rem;
  text-align: left;
  padding: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: bold;
}

.accordion-icon {
  font-size: 1.2rem;
}

.accordion-content {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 1rem;
}

.accordion-content li {
  padding: 0.3rem 0;
  color: white;
}

/* Dirección y Copyright */
.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-address p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.footer-copyright p {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Animaciones */
.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
}

/* Responsive */

@media (max-width: 1100px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
  }

  .desktop-logo {
    display: none;
  }

  .mobile-logo {
    display: block;
    text-align: center;
    margin: 1.5rem 0;
  }

  .footer-grid {
    display: none;
  }

  .footer-accordion {
    display: block;
  }

  .footer-title {
    font-size: 1rem;
  }
}
</style>
