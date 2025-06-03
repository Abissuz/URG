import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import LoginView from '../views/LoginView.vue'
import Catalogos from '@/views/Catalogos.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, reducedPadding: true, oculto: true }, // Opcional: para rutas públicas
    },
    {
      path: '/catalogos',
      name: 'catalogo',
      component: Catalogos,
    },
  ],
})

// Añade esta línea para exportar por defecto
export default router
