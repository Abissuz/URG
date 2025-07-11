<template>
  <div class="container-fluid py-4 faq-page">
    <header class="text-center mb-5">
      <h1 class="display-5 fw-bold text-primary">Preguntas Frecuentes (FAQ)</h1>
      <p class="lead text-muted">
        Encuentra respuestas a las dudas más comunes sobre Unimar Radio Global.
      </p>
    </header>

    <div class="faq-tabs">
      <button @click="activeTab = 'usuarios'" :class="{ active: activeTab === 'usuarios' }">
        Para Oyentes
      </button>

      <button
        v-if="authStore.canUpdateContent"
        @click="activeTab = 'moderadores'"
        :class="{ active: activeTab === 'moderadores' }"
      >
        Para Moderadores
      </button>

      <button
        v-if="authStore.isAdmin"
        @click="activeTab = 'admins'"
        :class="{ active: activeTab === 'admins' }"
      >
        Para Administradores
      </button>
    </div>

    <div v-if="activeTab === 'usuarios'" class="faq-content mt-4">
      <div
        class="accordion-category"
        v-for="(section, sectionIndex) in faqSections"
        :key="'user-' + sectionIndex"
      >
        <div class="card shadow-sm">
          <div class="card-header category-header" @click="toggleCategory('user-' + sectionIndex)">
            <h2 class="mb-0">{{ section.category }}</h2>
            <img
              src="@/assets/img/mas2.png"
              alt="toggle"
              class="accordion-icon"
              :class="{ 'is-open': openCategoryKey === 'user-' + sectionIndex }"
            />
          </div>
          <transition name="slide-down">
            <div v-if="openCategoryKey === 'user-' + sectionIndex" class="category-content">
              <div class="accordion-inner">
                <div
                  v-for="(item, itemIndex) in section.questions"
                  :key="'user-q-' + itemIndex"
                  class="accordion-item"
                  :class="{ 'is-open': openQuestionKey === 'user-q-' + itemIndex }"
                >
                  <button class="accordion-header" @click="toggleQuestion('user-q-' + itemIndex)">
                    <span>{{ item.q }}</span>
                    <img
                      src="@/assets/img/mas2.png"
                      alt="toggle"
                      class="accordion-icon-inner"
                      :class="{ 'is-open': openQuestionKey === 'user-q-' + itemIndex }"
                    />
                  </button>
                  <transition name="slide-down-inner">
                    <div v-if="openQuestionKey === 'user-q-' + itemIndex" class="accordion-content">
                      <p v-html="item.a"></p>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'moderadores'" class="faq-content mt-4">
      <div
        class="accordion-category"
        v-for="(section, sectionIndex) in faqModerators"
        :key="'mod-' + sectionIndex"
      >
        <div class="card shadow-sm">
          <div class="card-header category-header" @click="toggleCategory('mod-' + sectionIndex)">
            <h2 class="mb-0">{{ section.category }}</h2>
            <img
              src="@/assets/img/mas2.png"
              alt="toggle"
              class="accordion-icon"
              :class="{ 'is-open': openCategoryKey === 'mod-' + sectionIndex }"
            />
          </div>
          <transition name="slide-down">
            <div v-if="openCategoryKey === 'mod-' + sectionIndex" class="category-content">
              <div class="accordion-inner">
                <div
                  v-for="(item, itemIndex) in section.questions"
                  :key="'mod-q-' + itemIndex"
                  class="accordion-item"
                  :class="{ 'is-open': openQuestionKey === 'mod-q-' + itemIndex }"
                >
                  <button class="accordion-header" @click="toggleQuestion('mod-q-' + itemIndex)">
                    <span>{{ item.q }}</span>
                    <img
                      src="@/assets/img/mas2.png"
                      alt="toggle"
                      class="accordion-icon-inner"
                      :class="{ 'is-open': openQuestionKey === 'mod-q-' + itemIndex }"
                    />
                  </button>
                  <transition name="slide-down-inner">
                    <div v-if="openQuestionKey === 'mod-q-' + itemIndex" class="accordion-content">
                      <p v-html="item.a"></p>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'admins'" class="faq-content mt-4">
      <div
        class="accordion-category"
        v-for="(section, sectionIndex) in faqAdmins"
        :key="'admin-' + sectionIndex"
      >
        <div class="card shadow-sm">
          <div class="card-header category-header" @click="toggleCategory('admin-' + sectionIndex)">
            <h2 class="mb-0">{{ section.category }}</h2>
            <img
              src="@/assets/img/mas2.png"
              alt="toggle"
              class="accordion-icon"
              :class="{ 'is-open': openCategoryKey === 'admin-' + sectionIndex }"
            />
          </div>
          <transition name="slide-down">
            <div v-if="openCategoryKey === 'admin-' + sectionIndex" class="category-content">
              <div class="accordion-inner">
                <div
                  v-for="(item, itemIndex) in section.questions"
                  :key="'admin-q-' + itemIndex"
                  class="accordion-item"
                  :class="{ 'is-open': openQuestionKey === 'admin-q-' + itemIndex }"
                >
                  <button class="accordion-header" @click="toggleQuestion('admin-q-' + itemIndex)">
                    <span>{{ item.q }}</span>
                    <img
                      src="@/assets/img/mas2.png"
                      alt="toggle"
                      class="accordion-icon-inner"
                      :class="{ 'is-open': openQuestionKey === 'admin-q-' + itemIndex }"
                    />
                  </button>
                  <transition name="slide-down-inner">
                    <div
                      v-if="openQuestionKey === 'admin-q-' + itemIndex"
                      class="accordion-content"
                    >
                      <p v-html="item.a"></p>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const activeTab = ref('usuarios')

// Lógica para que la pestaña por defecto cambie según el rol
watch(
  () => authStore.userRole,
  (newRole) => {
    if (newRole === 'admin') {
      activeTab.value = 'admins'
    } else if (newRole === 'moderador') {
      activeTab.value = 'moderadores'
    } else {
      activeTab.value = 'usuarios'
    }
  },
  { immediate: true },
)

// --- DATOS PARA CADA SECCIÓN ---

const faqSections = ref([
  {
    category: 'Uso General',
    questions: [
      {
        q: '¿Cómo puedo escuchar la radio en vivo?',
        a: "Simplemente presiona el botón de 'Play' en el reproductor. ¡Nuestra transmisión en vivo está disponible 24/7!",
      },
      {
        q: '¿Puedo escuchar programas anteriores?',
        a: "Sí. Todos nuestros programas grabados se publican como <strong>podcasts</strong>. Puedes encontrarlos en la sección 'Programas' y escucharlos cuando quieras.",
      },
      {
        q: '¿Cómo solicito una canción?',
        a: "Ve a la sección 'Canciones' en la página de inicio, busca la que te gusta y haz clic en ella para enviarnos tu petición.",
      },
    ],
  },
  {
    category: 'Cuenta y Personalización',
    questions: [
      {
        q: '¿Cómo me registro en la plataforma?',
        a: 'Usa tu <strong>correo institucional de UNIMAR</strong> para iniciar sesión a través de Google. El registro es automático para la comunidad universitaria.',
      },
      {
        q: '¿Cómo guardo mis favoritos?',
        a: "Inicia sesión, busca el podcast o episodio que te guste y haz clic en el ícono del corazón (♡). Todo aparecerá en tu sección de 'Favoritos'.",
      },
      {
        q: '¿Se pueden crear playlists personales?',
        a: 'No, actualmente no se pueden crear listas de reproducción personales.',
      },
      {
        q: '¿Se pueden dejar comentarios en los episodios?',
        a: '¡Sí! Para comentar, inicia sesión, ve a la página del podcast, selecciona el episodio y encontrarás la sección de comentarios abajo.',
      },
    ],
  },
  {
    category: 'Colaboración',
    questions: [
      {
        q: '¿Cómo puedo participar en la radio?',
        a: '¡Nos encantaría! Si eres miembro de la comunidad UNIMAR, puedes acercarte al departamento de la URG en el campus o escribirnos un correo a <strong>uniradio@unimar.edu.ve</strong>.',
      },
    ],
  },
])

const faqModerators = ref([
  {
    category: 'Rol y Permisos Generales',
    questions: [
      {
        q: '¿Cuál es la diferencia entre un usuario común y un moderador?',
        a: 'Un moderador tiene acceso al panel de "Actualizar Contenido" desde el menú lateral. Desde allí, puedes gestionar podcasts, editar el cronograma de la radio, ver las peticiones de canciones en tiempo real y moderar (eliminar) comentarios inapropiados en los episodios.',
      },
    ],
  },
  {
    category: 'Gestión de Contenido',
    questions: [
      {
        q: '¿Cómo creo un nuevo podcast?',
        a: 'Ve al panel de "Actualizar Contenido". En la pestaña "Gestionar Podcasts", verás la lista de todos los programas. Haz clic en el ícono de <strong>+</strong> para abrir el formulario y añadir un nuevo podcast.',
      },
      {
        q: '¿Cómo añado un programa al cronograma semanal?',
        a: 'En "Actualizar Contenido", ve a la pestaña "Gestionar Cronograma". Selecciona el día de la semana que deseas editar. Usa el formulario en la parte inferior para seleccionar un podcast y la hora, y luego haz clic en "Añadir".',
      },
      {
        q: '¿Cómo elimino un programa de un día específico?',
        a: 'Dentro de la pestaña "Gestionar Cronograma", selecciona el día correspondiente. Verás la lista de programas agendados para ese día. Al final de cada fila, encontrarás un ícono de una <strong>X</strong>. Haz clic en él para eliminar ese programa del horario.',
      },
    ],
  },
  {
    category: 'Moderación e Interacción',
    questions: [
      {
        q: '¿Cómo sé cuándo hay una nueva petición de canción?',
        a: 'El sistema te avisará visualmente. Verás un <strong>círculo rojo de notificación</strong> junto a los enlaces "Actualizar Contenido" y "Peticiones" en el menú lateral.',
      },
      {
        q: '¿Cómo activo o desactivo los comentarios para un episodio?',
        a: 'En el panel de "Gestionar Podcasts", selecciona el podcast que quieres editar. En la lista de episodios, verás un <strong>interruptor (toggle)</strong> junto a cada uno que te permite habilitar o deshabilitar sus comentarios con un solo clic.',
      },
      {
        q: '¿Cómo elimino uno o varios comentarios inapropiados?',
        a: 'Ve a la página pública del podcast y selecciona el episodio con los comentarios que quieres moderar. Como moderador, verás <strong>casillas de selección (checkbox)</strong> junto a cada comentario. Marca los que deseas eliminar y luego presiona el botón "Eliminar seleccionados".',
      },
    ],
  },
])

const faqAdmins = ref([
  {
    category: 'Gestión de Roles y Permisos',
    questions: [
      {
        q: '¿Cuál es la diferencia principal entre un Administrador y un Moderador?',
        a: 'Un administrador tiene todos los poderes de un moderador, pero adicionalmente, solo los administradores pueden acceder a la pestaña "Dashboard y Usuarios" para ver estadísticas y, lo más importante, <strong>gestionar los roles de todos los usuarios.</strong>',
      },
      {
        q: '¿Cómo promuevo a un usuario para que sea Moderador?',
        a: 'Ve al panel y entra en la pestaña "Dashboard y Usuarios". Busca al usuario en la lista y, en la columna "Cambiar Rol A", utiliza el menú desplegable para seleccionar la opción "moderador". El cambio se aplicará inmediatamente.',
      },
      {
        q: '¿Puedo eliminar mi propio rol de Administrador?',
        a: 'No. Por seguridad, el sistema te impide cambiar tu propio rol si eres el último administrador que queda. Para poder cambiar tu rol, primero debes ascender a otro usuario a "admin".',
      },
    ],
  },
  {
    category: 'Visión General y Estadísticas',
    questions: [
      {
        q: '¿Para qué sirve la sección "Dashboard"?',
        a: 'El Dashboard te ofrece un resumen visual y rápido del estado de la plataforma: número total de podcasts, usuarios, administradores y moderadores.',
      },
      {
        q: '¿Cómo funciona el "Ranking de Peticiones"?',
        a: 'El ranking muestra las canciones más pedidas por <strong>usuarios únicos</strong>. Se divide en dos: "En Caliente" (últimos 30 minutos) para decisiones inmediatas, y "Del Día" (últimas 24 horas) para ver tendencias generales.',
      },
    ],
  },
  {
    category: 'Acciones Críticas y Seguridad',
    questions: [
      {
        q: '¿Qué pasa si elimino un podcast?',
        a: 'Eliminar un podcast es una acción <strong>permanente e irreversible</strong>. Al hacerlo, se borra el programa, todos sus episodios asociados y se elimina de las listas de favoritos de todos los usuarios que lo hayan guardado.',
      },
    ],
  },
])

// --- Lógica del Acordeón ---
const openCategoryKey = ref('user-0') // Clave única para la categoría abierta
const openQuestionKey = ref(null) // Clave única para la pregunta abierta

const toggleCategory = (key) => {
  openCategoryKey.value = openCategoryKey.value === key ? null : key
  openQuestionKey.value = null
}

const toggleQuestion = (key) => {
  openQuestionKey.value = openQuestionKey.value === key ? null : key
}
</script>

<style scoped>
/* Tus estilos no necesitan cambios */
.faq-page {
  font-family: 'Sulphur Point', sans-serif;
  max-width: 900px;
  margin: 0 auto;
}
.text-primary {
  color: #0d4d98 !important;
}
.faq-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 2px solid #dee2e6;
  margin-bottom: 2rem;
}
.faq-tabs button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: -2px;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}
.faq-tabs button:hover {
  color: #0d4d98;
}
.faq-tabs button.active {
  color: #0d4d98;
  border-bottom-color: #0d4d98;
}
.faq-tabs button:disabled {
  color: #adb5bd;
  cursor: not-allowed;
}
.accordion-category {
  margin-bottom: 1rem;
}
.card-header {
  padding: 1rem 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
}
.card-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #343a40;
}
.accordion-icon {
  width: 28px;
  height: 28px;
  transition: transform 0.3s ease;
}
.accordion-icon.is-open {
  transform: rotate(45deg);
}
.category-content {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  overflow: hidden;
}
.accordion-inner {
  padding: 1rem 1.5rem;
}
.accordion-item {
  border-bottom: 1px solid #e9ecef;
}
.accordion-item:last-child {
  border-bottom: none;
}
.accordion-header {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 1.25rem 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #212529;
}
.accordion-item.is-open .accordion-header {
  color: #0d4d98;
}
.accordion-icon-inner {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 1rem;
}
.accordion-item.is-open .accordion-icon-inner {
  transform: rotate(45deg);
}
.accordion-content {
  overflow: hidden;
  padding: 0 1.5rem;
  background-color: #ffffff;
  border-left: 4px solid #0075ffa8;
}
.accordion-content p {
  margin: 0;
  padding: 1.5rem 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #343a40;
}
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.4s ease-out;
  max-height: 1000px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
}
.slide-down-inner-enter-active,
.slide-down-inner-leave-active {
  transition: all 0.4s ease-out;
  max-height: 500px;
}
.slide-down-inner-enter-from,
.slide-down-inner-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
/* --- [NUEVO] MEDIA QUERY PARA RESPONSIVIDAD MÓVIL --- */

@media (max-width: 768px) {
  /* En pantallas de 768px o menos (tablets y móviles)... */

  .faq-page {
    /* Reducimos el padding en los lados para dar más espacio */
    padding: 2rem 1rem;
  }

  .display-5 {
    /* Hacemos el título principal un poco más pequeño */
    font-size: 2rem;
  }

  .faq-tabs {
    /* Hacemos que las pestañas se apilen en lugar de estar en línea */
    flex-direction: column;
    align-items: stretch; /* Hacemos que los botones ocupen todo el ancho */
    border-bottom: none; /* Quitamos la línea de abajo */
    gap: 0.5rem; /* Añadimos un pequeño espacio entre los botones */
  }

  .faq-tabs button {
    text-align: center;
    border-bottom: 1px solid #dee2e6; /* Añadimos un separador simple */
    border-radius: 6px;
    margin-bottom: 0;
  }

  .faq-tabs button.active {
    /* Cambiamos el indicador de 'activo' de una línea a un fondo */
    border-bottom-color: transparent;
    background-color: #0d4d98;
    color: white;
  }

  .card-header h2 {
    font-size: 1.2rem;
  }

  .accordion-header {
    font-size: 1rem;
    padding: 1rem 0.25rem;
  }
}
</style>
