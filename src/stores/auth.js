// src/stores/auth.js - VERSIÓN FINAL Y COMPLETA

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db, functions } from '@/firebase/config'
import { httpsCallable } from 'firebase/functions'

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

  // --- [CORRECCIÓN] ---
  // Inicializamos songRequests como un arreglo vacío para evitar errores.
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
      // [MEJORA] Al cerrar sesión, limpiamos la lista de peticiones
      songRequests.value = []
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
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
        throw new Error('La sesión no está activa o ha expirado. Intenta iniciar sesión de nuevo.')
      }
      await auth.currentUser.getIdToken(true)
      const getDashboardStats = httpsCallable(functions, 'getDashboardStats')
      const result = await getDashboardStats()
      dashboardStats.value = result.data
    } catch (error) {
      console.error('Error detallado al obtener estadísticas:', error)
      statsError.value = error.message
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
    } finally {
      loadingUsers.value = false
    }
  }

  const updateUserRole = async (uid, nuevoRol) => {
    try {
      const updateUserRoleCallable = httpsCallable(functions, 'updateUserRole')
      const result = await updateUserRoleCallable({ uid, nuevoRol })
      const userIndex = userList.value.findIndex((user) => user.uid === uid)
      if (userIndex !== -1) {
        userList.value[userIndex].rol = nuevoRol
      }
      console.log(result.data.message)
      return { success: true }
    } catch (error) {
      console.error('Error al actualizar el rol:', error)
      return { success: false, error: error.message }
    }
  }

  // --- [NUEVAS] Acciones para manejar las notificaciones ---
  const setHasNewSongRequest = (status) => {
    hasNewSongRequest.value = status
  }

  const clearNewSongRequest = () => {
    if (hasNewSongRequest.value) {
      hasNewSongRequest.value = false
    }
  }
  // --- Se exporta todo para que esté disponible en la aplicación ---
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

    // [NUEVO] Exportamos la nueva variable
    songRequests,
  }
})
