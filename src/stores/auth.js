// src/stores/auth.js

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db, functions } from '@/firebase/config'
import { httpsCallable } from 'firebase/functions'
// 1. Importar las notificaciones
import { showSuccessToast, showErrorToast } from '@/stores/notifications.js'

export const useAuthStore = defineStore('auth', () => {
  // --- Estado ---
  const user = ref(null)
  const userRole = ref(null)
  const loading = ref(true)
  const dashboardStats = ref(null)
  const loadingStats = ref(false)
  const statsError = ref(null)
  const userList = ref([])
  const loadingUsers = ref(false)
  const usersError = ref(null)
  const hasNewSongRequest = ref(false)
  const songRequests = ref([])

  // --- Getters ---
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isModerator = computed(() => userRole.value === 'moderador')
  const canUpdateContent = computed(() => isAdmin.value || isModerator.value)
  const userInitial = computed(() => {
    if (user.value?.displayName) return user.value.displayName.charAt(0).toUpperCase()
    if (user.value?.email) return user.value.email.charAt(0).toUpperCase()
    return '?'
  })

  // --- Acciones ---
  const fetchUser = () => {
    const auth = getAuth()
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        const docSnap = await getDoc(userDocRef)
        if (docSnap.exists() && docSnap.data().rol) {
          userRole.value = docSnap.data().rol
        } else {
          userRole.value = 'user'
        }
      } else {
        user.value = null
        userRole.value = null
      }
      loading.value = false
    })
  }

  const logout = async () => {
    try {
      await signOut(getAuth())
      songRequests.value = []
      // 2. Notificación de éxito al cerrar sesión
      showSuccessToast('Has cerrado sesión. ¡Vuelve pronto!')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // 3. Notificación de error
      showErrorToast('No se pudo cerrar la sesión.')
    }
  }

  const waitForAuthInit = () => {
    return new Promise((resolve) => {
      if (!loading.value) {
        resolve()
      } else {
        const unwatch = watch(loading, (newVal) => {
          if (!newVal) {
            unwatch()
            resolve()
          }
        })
      }
    })
  }

  const fetchDashboardStats = async () => {
    loadingStats.value = true
    statsError.value = null
    try {
      const auth = getAuth()
      if (!auth.currentUser) {
        throw new Error('La sesión no está activa o ha expirado.')
      }
      await auth.currentUser.getIdToken(true)
      const getDashboardStats = httpsCallable(functions, 'getDashboardStats')
      const result = await getDashboardStats()
      dashboardStats.value = result.data
    } catch (error) {
      console.error('Error detallado al obtener estadísticas:', error)
      statsError.value = error.message
      // 4. Notificación de error al cargar estadísticas
      showErrorToast('No se pudieron cargar las estadísticas.')
    } finally {
      loadingStats.value = false
    }
  }

  const fetchAllUsers = async () => {
    loadingUsers.value = true
    usersError.value = null
    try {
      const getAllUsers = httpsCallable(functions, 'getAllUsers')
      const result = await getAllUsers()
      userList.value = result.data.sort((a, b) => a.email.localeCompare(b.email))
    } catch (error) {
      console.error('Error al obtener la lista de usuarios:', error)
      usersError.value = error.message
      // 5. Notificación de error al cargar usuarios
      showErrorToast('No se pudo cargar la lista de usuarios.')
    } finally {
      loadingUsers.value = false
    }
  }

  const updateUserRole = async (uid, nuevoRol) => {
    try {
      const updateUserRoleCallable = httpsCallable(functions, 'updateUserRole')
      await updateUserRoleCallable({ uid, nuevoRol })
      const userIndex = userList.value.findIndex((user) => user.uid === uid)
      if (userIndex !== -1) {
        userList.value[userIndex].rol = nuevoRol
      }
      // NOTA: La lógica de notificación para esta acción ya la pusimos en UserManagementView.vue.
      // Lo ideal sería moverla aquí. Si lo hicieras, se vería así:
      // showSuccessToast('Rol de usuario actualizado.');
      return { success: true }
    } catch (error) {
      console.error('Error al actualizar el rol:', error)
      // Y el error se manejaría aquí también:
      // showErrorToast(`Error: ${error.message}`);
      return { success: false, error: error.message }
    }
  }

  const setHasNewSongRequest = (status) => {
    hasNewSongRequest.value = status
  }

  const clearNewSongRequest = () => {
    if (hasNewSongRequest.value) {
      hasNewSongRequest.value = false
    }
  }

  return {
    user,
    userRole,
    loading,
    isLoggedIn,
    isAdmin,
    isModerator,
    canUpdateContent,
    userInitial,
    fetchUser,
    logout,
    waitForAuthInit,
    dashboardStats,
    loadingStats,
    statsError,
    fetchDashboardStats,
    userList,
    loadingUsers,
    usersError,
    fetchAllUsers,
    updateUserRole,
    hasNewSongRequest,
    setHasNewSongRequest,
    clearNewSongRequest,
    songRequests,
  }
})
