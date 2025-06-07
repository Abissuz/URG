<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark custom-bg fixed-top shadow-sm"
    style="z-index: 9999"
  >
    <div class="container-fluid d-flex align-items-center">
      <!-- Botón móvil -->
      <button
        class="navbar-toggler order-1"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Logo Centrado -->
      <!-- Menú Distribuido -->
      <div class="collapse navbar-collapse order-3" id="navbarContent">
        <div class="navbar-nav w-100 justify-content-between px-6">
          <router-link to="/" class="nav-link text-center letras" active-class="active" exact>
            Inicio
          </router-link>

          <router-link
            to="/catalogos"
            class="nav-link text-center letras"
            active-class="active"
            exact
          >
            Catálogos
          </router-link>
          <router-link
            to="/"
            class="text-center letras"
            style="margin: 0px; position: relative; width: 140px"
          >
            <div
              class="order-2 order-lg-1 mx-auto mx-lg-0 flex-grow-1 flex-lg-grow-0 text-center"
              style="position: absolute; top: 32px"
            >
              <div class="circulo">
                <img src="@/assets/img/logo-urg.png" alt="Unimar Radio" class="logo-img" />
              </div>
            </div>
          </router-link>

          <router-link
            to="/nosotros"
            class="nav-link text-center letras"
            active-class="active"
            exact
          >
            Nosotros
          </router-link>

          <router-link
            v-if="isAuthenticated"
            to="#"
            class="nav-link text-center letras"
            @click.prevent="cerrarSesion"
          >
            Cerrar Sesión
          </router-link>

          <router-link v-else to="/login" class="nav-link text-center letras">
            Iniciar Sesión
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const isAuthenticated = ref(false) // Estado reactivo

// Verifica si el usuario está logeado
onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user // true si hay usuario, false si no
  })
})

const router = useRouter()

const cerrarSesion = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
    router.push('/') // Redirige a la página principal
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
.custom-bg {
  background-color: #0d4d98;
  padding-top: 28px;
  padding-bottom: 20px;
  border-radius: 0px 0px 6px 6px;
  border: solid 1px black;
}

.circulo {
  width: 140px;
  height: 141px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4px solid #0d4d98;
  margin: -60px auto 0;
}

.logo-img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}
.px-6 {
  padding: 0 100px !important;
}
.nav-link {
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  font-weight: 500;
  display: inline-block;
  position: relative;
  padding-bottom: 4px;
}

.nav-link:hover::after,
.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-color: #ff8a00;
}
.letras {
  font-size: clamp(23px, 2vw, 28px);
  font-family: 'Sofia Sans', sans-serif;
}
/* Ajustes para móviles */
@media (max-width: 992px) {
  .circulo {
    margin: -30px auto 10px;
    width: 100px;
    height: 100px;
  }

  .navbar-nav {
    flex-direction: column;
    align-items: center;
  }

  .nav-link {
    width: 100%;
    margin: 0.25rem 0;
  }
}

/* Ordenamiento de elementos */
.navbar-toggler {
  order: 1;
}

.navbar-brand {
  order: 2;
}

.navbar-collapse {
  order: 3;
}

@media (min-width: 992px) {
  .navbar-brand {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .navbar-nav {
    width: 100%;
    padding: 0 150px; /* Ajusta según el tamaño de tu logo */
  }
}
</style>
