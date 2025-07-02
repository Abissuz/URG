// src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth' // <--- IMPORTANTE: Importamos el store

// Importaciones de estilos (sin cambios)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fontsource/sulphur-point/300.css'
import '@fontsource/sulphur-point/400.css'
import '@fontsource/sulphur-point/700.css'
import '@fontsource/sofia-sans-extra-condensed/400.css'
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// --- [LA CORRECCIÓN MÁGICA ESTÁ AQUÍ] ---
// Inmediatamente después de instalar Pinia, le decimos al store de autenticación
// que empiece a escuchar los cambios en el estado de la sesión.
const authStore = useAuthStore()
authStore.fetchUser()
// -----------------------------------------

app.use(router)

app.mount('#app')
