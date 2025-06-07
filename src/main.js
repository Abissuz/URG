import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css' // ✅ Estilos CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // ✅ JS (incluye Popper)

// Letras
import '@fontsource/sulphur-point/300.css'
import '@fontsource/sulphur-point/400.css'
import '@fontsource/sulphur-point/700.css'
import '@fontsource/sofia-sans-extra-condensed/400.css'
import '@fortawesome/fontawesome-free/css/all.css'
const app = createApp(App)
const pinia = createPinia() // Crea la instancia de Pinia
app.use(pinia) // Registra Pinia antes de montar la app
app.use(router)
app.mount('#app')
