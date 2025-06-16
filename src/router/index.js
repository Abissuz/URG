import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import LoginView from '../views/LoginView.vue'
import Programas from '@/views/Programas.vue'
import Nosotros from '@/views/Nosotros.vue'
import PodcastDetail from '@/views/PodcastDetail.vue'

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
      meta: { oculto: true },
    },
    {
      path: '/programas',
      name: 'programas',
      component: Programas,
    },
    {
      path: '/nosotros',
      name: 'nosotros',
      component: Nosotros,
    },
    {
      path: '/podcast/:id',
      name: 'podcast-detail',
      component: PodcastDetail,
      props: true,
    },
  ],
})

export default router
