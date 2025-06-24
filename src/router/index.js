import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Se importa el store de autenticación
import HomeView from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/programas',
      name: 'programas',
      component: () => import('../views/Programas.vue'),
    },
    {
      path: '/nosotros',
      name: 'nosotros',
      component: () => import('../views/Nosotros.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { oculto: true },
    },
    // [NUEVO] Se añade la ruta para la vista de detalle del podcast
    {
      path: '/podcast/:id', // Define la ruta dinámica
      name: 'podcast-detail',
      component: () => import('../views/PodcastDetail.vue'),
      // Esta ruta es pública, por lo que no necesita meta-información de seguridad
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      component: () => import('../views/FavoritesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/actualizar-contenido',
      name: 'actualizar-contenido',
      component: () => import('../views/UpdateContentView.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})

// [EL PORTERO] Este código se ejecuta ANTES de cada cambio de ruta.
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Se espera a que la comprobación inicial de Firebase termine
  await authStore.waitForAuthInit()

  const isLoggedIn = authStore.isLoggedIn
  const canUpdateContent = authStore.canUpdateContent

  // REGLA 2: ¿La ruta requiere ser admin?
  if (to.meta.requiresAdmin) {
    if (isLoggedIn && canUpdateContent) {
      next() // El usuario es admin, puede pasar.
    } else {
      console.warn('Acceso denegado: Se requieren permisos de administrador.')
      next('/')
    }
    // REGLA 1: ¿La ruta requiere solo iniciar sesión?
  } else if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      next() // El usuario ha iniciado sesión, puede pasar.
    } else {
      console.warn('Acceso denegado: Se requiere iniciar sesión.')
      next('/login')
    }
  } else {
    // Si la ruta no tiene ninguna regla especial, todos pueden pasar.
    next()
  }
})

export default router
