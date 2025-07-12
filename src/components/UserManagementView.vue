<template>
  <div class="user-management-container mt-5">
    <hr />
    <h2 class="mb-4">Gestión de Usuarios</h2>

    <div v-if="loadingUsers" class="text-center py-5">
      <div class="spinner-border text-secondary" role="status"></div>
      <p class="mt-2 text-muted">Cargando lista de usuarios...</p>
    </div>

    <div v-else-if="usersError" class="alert alert-warning">
      <p class="fw-bold">Ocurrió un error al cargar los usuarios:</p>
      <code>{{ usersError }}</code>
    </div>

    <div v-else-if="userList.length > 0" class="card shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">Email del Usuario</th>
                <th scope="col" class="text-center">Rol Actual</th>
                <th scope="col" class="text-center">Cambiar Rol A</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userList" :key="user.uid">
                <td class="fw-bold">{{ user.email }}</td>
                <td class="text-center">
                  <span :class="getRoleClass(user.rol)">{{ user.rol }}</span>
                </td>
                <td class="text-center">
                  <div
                    v-if="updatingUserId === user.uid"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span class="visually-hidden">Actualizando...</span>
                  </div>

                  <div v-else class="dropdown">
                    <button
                      class="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      :disabled="authStore.user && user.uid === authStore.user.uid"
                      :title="
                        authStore.user && user.uid === authStore.user.uid
                          ? 'No puedes cambiar tu propio rol'
                          : 'Cambiar rol'
                      "
                      @click.stop="toggleDropdown(user, $event)"
                    >
                      Seleccionar...
                    </button>

                    <Teleport to="body">
                      <ul
                        class="dropdown-menu"
                        v-if="openDropdown.user?.uid === user.uid"
                        :style="openDropdown.style"
                      >
                        <li v-for="rol in roles" :key="rol">
                          <a
                            class="dropdown-item"
                            href="#"
                            @click.prevent="changeRole(openDropdown.user, rol)"
                            :class="{ disabled: openDropdown.user.rol === rol }"
                          >
                            {{ rol }}
                          </a>
                        </li>
                      </ul>
                    </Teleport>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info">
      No se encontraron usuarios registrados en la plataforma.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { showConfirmDialog, showSuccessToast, showErrorToast } from '@/stores/notifications.js'

const authStore = useAuthStore()
const { userList, loadingUsers, usersError } = storeToRefs(authStore)

const updatingUserId = ref(null)
const roles = ['admin', 'moderador', 'user']

// --- [LÓGICA CORREGIDA PARA DROPDOWN] ---
const openDropdown = ref({ user: null, style: {} }) // Guarda el usuario y el estilo en un solo objeto
let currentButtonRef = null

const toggleDropdown = async (user, event) => {
  if (openDropdown.value.user?.uid === user.uid) {
    openDropdown.value.user = null
    currentButtonRef = null
  } else {
    openDropdown.value.user = user
    currentButtonRef = event.currentTarget
    await nextTick()
    updateDropdownPosition()
  }
}

const updateDropdownPosition = () => {
  if (!openDropdown.value.user || !currentButtonRef) return

  const rect = currentButtonRef.getBoundingClientRect()
  // Se modifica el objeto 'style' directamente dentro del ref
  openDropdown.value.style = {
    display: 'block',
    top: `${rect.bottom + window.scrollY + 2}px`,
    left: `${rect.left + window.scrollX}px`,
  }
}

const closeDropdowns = () => {
  openDropdown.value.user = null
  currentButtonRef = null
}
// ----------------------------------------------------

const getRoleClass = (rol) => ({
  'badge badge-admin': rol === 'admin', // [CAMBIO] Clase personalizada para Admin
  'badge text-bg-info': rol === 'moderador', // Azul Claro para Moderador
  'badge text-bg-secondary': rol === 'user', // Gris para User
})

const changeRole = async (user, nuevoRol) => {
  if (user.rol === nuevoRol) return
  const confirmed = await showConfirmDialog(
    `¿Cambiar rol?`,
    `Estás a punto de cambiar el rol de ${user.email} a "${nuevoRol}".`,
  )
  if (confirmed) {
    closeDropdowns()
    updatingUserId.value = user.uid
    const result = await authStore.updateUserRole(user.uid, nuevoRol)
    if (result.success) {
      showSuccessToast('Rol actualizado correctamente.')
    } else {
      showErrorToast(`Error: ${result.error}`)
    }
    updatingUserId.value = null
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateDropdownPosition, true)
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped>
.user-management-container {
  padding-bottom: 2rem;
}
.table thead th {
  font-weight: 600;
  white-space: nowrap;
}
.badge {
  font-size: 0.9em;
  padding: 0.4em 0.7em;
}
.dropdown-menu {
  position: fixed;
  z-index: 1100;
  width: 150px;
}
.dropdown-menu .disabled {
  pointer-events: none;
  background-color: #e9ecef;
  color: #adb5bd;
}
.badge-admin {
  background-color: rgb(253 137 0) !important;
  color: white; /* Añadimos color blanco al texto para un mejor contraste */
}
.text-bg-info {
  background-color: #0075ffa8 !important;
  color: white !important;
}
</style>
