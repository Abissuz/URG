import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
// [CORREGIDO] Se elimina la importación y el uso de 'useRouter'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref(null)
  const loading = ref(true)
  // [CORREGIDO] Se elimina 'const router = useRouter()'

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => userRole.value === 'admin')
  const isModerator = computed(() => userRole.value === 'moderador')
  const canUpdateContent = computed(() => isAdmin.value || isModerator.value)
  const userInitial = computed(() => {
    if (user.value?.displayName) return user.value.displayName.charAt(0).toUpperCase()
    if (user.value?.email) return user.value.email.charAt(0).toUpperCase()
    return '?'
  })

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
      const auth = getAuth()
      await signOut(auth)
      // [CORREGIDO] La redirección se elimina de aquí.
      // El store ya no se encarga de la navegación.
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const waitForAuthInit = () => {
    return new Promise((resolve) => {
      if (loading.value === false) {
        resolve()
      } else {
        const unwatch = watch(loading, (newVal) => {
          if (newVal === false) {
            unwatch()
            resolve()
          }
        })
      }
    })
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
  }
})
