<template>
  <div class="user-management-container">
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
                <th scope="col">Nombre</th>
                <th scope="col" class="text-center">Rol Actual</th>
                <th scope="col" class="text-center">Cambiar Rol A</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in userList" :key="user.uid">
                <td class="fw-bold">{{ user.email }}</td>
                <td>{{ user.displayName }}</td>
                <td class="text-center">
                  <span :class="getRoleClass(user.rol)">
                    {{ user.rol }}
                  </span>
                </td>
                <td class="text-center">
                  <div
                    v-if="updatingUserId === user.uid"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span class="visually-hidden">Actualizando...</span>
                  </div>

                  <div v-else class="dropdown" :ref="(el) => (dropdownRefs[user.uid] = el)">
                    <button
                      class="btn btn-sm btn-outline-secondary dropdown-toggle"
                      type="button"
                      aria-expanded="false"
                      :disabled="authStore.user && user.uid === authStore.user.uid"
                      :title="
                        user.uid === authStore.user.uid
                          ? 'No puedes cambiar tu propio rol'
                          : 'Cambiar rol'
                      "
                      @click.stop="toggleDropdown(user.uid)"
                    >
                      Seleccionar...
                    </button>
                    <ul class="dropdown-menu" v-if="openDropdownUid === user.uid">
                      <li v-for="rol in roles" :key="rol">
                        <a
                          class="dropdown-item"
                          href="#"
                          @click.prevent="changeRole(user, rol)"
                          :class="{ disabled: user.rol === rol }"
                        >
                          {{ rol }}
                        </a>
                      </li>
                    </ul>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
// 1. Importar todas las notificaciones necesarias
import { showConfirmDialog, showSuccessToast, showErrorToast } from '@/stores/notifications.js'

const authStore = useAuthStore()
const { userList, loadingUsers, usersError } = storeToRefs(authStore)

const updatingUserId = ref(null)
const roles = ['admin', 'moderador', 'user']

const openDropdownUid = ref(null)
const dropdownRefs = ref({})

const toggleDropdown = (uid) => {
  openDropdownUid.value = openDropdownUid.value === uid ? null : uid
}

const closeDropdowns = (event) => {
  if (openDropdownUid.value && !dropdownRefs.value[openDropdownUid.value]?.contains(event.target)) {
    openDropdownUid.value = null
  }
}

const getRoleClass = (rol) => ({
  'badge text-bg-danger': rol === 'admin',
  'badge text-bg-warning': rol === 'moderador',
  'badge text-bg-secondary': rol === 'user',
})

// 2. Modificar changeRole para usar las nuevas notificaciones
const changeRole = async (user, nuevoRol) => {
  if (user.rol === nuevoRol) return

  // Reemplazamos el 'confirm' nativo por nuestro diálogo personalizado
  const confirmed = await showConfirmDialog(
    `¿Cambiar rol?`,
    `Estás a punto de cambiar el rol de ${user.email} a "${nuevoRol}".`,
  )

  if (confirmed) {
    openDropdownUid.value = null
    updatingUserId.value = user.uid
    const result = await authStore.updateUserRole(user.uid, nuevoRol)

    // Mostramos notificaciones de éxito o error según el resultado
    if (result.success) {
      showSuccessToast('Rol actualizado correctamente.')
    } else {
      showErrorToast(`Error: ${result.error}`)
    }

    updatingUserId.value = null
  }
}

onMounted(() => {
  if (userList.value.length === 0) {
    authStore.fetchAllUsers()
  }
  document.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped>
/* Tus estilos no necesitan cambios */
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
.dropdown-menu[style],
.dropdown-menu[v-if] {
  display: block;
}
.dropdown-menu .disabled {
  pointer-events: none;
  background-color: #e9ecef;
  color: #adb5bd;
}
</style>
