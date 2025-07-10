// src/router/index.js - VERSIÓN FINAL CORREGIDA

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/Home.vue'
import UpdateContentView from '@/views/UpdateContentView.vue'
import FAQView from '@/views/FAQView.vue' // Importa la nueva vista
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
      component: () => import('@/views/Programas.vue'),
    },
    {
      path: '/nosotros',
      name: 'nosotros',
      component: () => import('@/views/Nosotros.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { oculto: true },
    },
    {
      path: '/podcast/:id',
      name: 'podcast-detail',
      component: () => import('@/views/PodcastDetail.vue'),
    },
    {
      path: '/favoritos',
      name: 'favoritos',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/actualizar-contenido',
      name: 'actualizar-contenido',
      component: UpdateContentView,
      meta: { requiresAuth: true, requiredRole: ['admin', 'moderador'] },
    },
    {
      path: '/faq',
      name: 'faq',
      component: FAQView,
    },
  ],
})

// [EL PORTERO MEJORADO Y CORREGIDO]
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.waitForAuthInit()

  const isLoggedIn = authStore.isLoggedIn

  // --- [LA CORRECCIÓN ESTÁ AQUÍ] ---
  // Se usa 'userRole' (con R mayúscula) para que coincida con el store.
  const userRole = authStore.userRole

  // REGLA #1: La ruta requiere un ROL específico (o varios)?
  if (to.meta.requiredRole) {
    if (!isLoggedIn) {
      next('/login')
    } else {
      const allowedRoles = Array.isArray(to.meta.requiredRole)
        ? to.meta.requiredRole
        : [to.meta.requiredRole]

      if (allowedRoles.includes(userRole)) {
        next() // ¡Sí está! Puede pasar.
      } else {
        console.warn(
          `Acceso denegado a '${to.path}'. Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}]. El usuario tiene el rol '${userRole}'.`,
        )
        next('/')
      }
    }
    // REGLA #2: La ruta solo requiere estar LOGUEADO?
  } else if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      next()
    } else {
      console.warn(`Acceso denegado a '${to.path}'. Se requiere iniciar sesión.`)
      next('/login')
    }
  } else {
    // Si la ruta no tiene reglas, todos pueden pasar.
    next()
  }
})

export default router
