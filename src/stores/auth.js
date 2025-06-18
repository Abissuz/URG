import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config' // Asegúrate que esta ruta es correcta para tu proyecto
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  // --- ESTADO (State) ---
  // Almacena la información del usuario obtenida de Firebase Auth.
  const user = ref(null)
  // Almacena el rol del usuario obtenido de Firestore.
  const userRole = ref(null)
  // Indica si la comprobación inicial del usuario está en curso.
  const loading = ref(true)
  // Instancia del router para poder redirigir.
  const router = useRouter()

  // --- GETTERS (Propiedades Computadas) ---

  // Devuelve `true` si hay un usuario autenticado.
  const isLoggedIn = computed(() => !!user.value)

  // Devuelve `true` si el rol del usuario es 'admin'.
  const isAdmin = computed(() => userRole.value === 'admin')

  // Devuelve `true` si el rol del usuario es 'moderador'.
  const isModerator = computed(() => userRole.value === 'moderador')

  // Devuelve `true` si el usuario tiene permisos de 'admin' O 'moderador'.
  // Esta es la propiedad recomendada para usar en los v-if de la UI.
  const canUpdateContent = computed(() => isAdmin.value || isModerator.value)

  // Devuelve la inicial del nombre o email del usuario para avatares.
  const userInitial = computed(() => {
    if (user.value?.displayName) return user.value.displayName.charAt(0).toUpperCase()
    if (user.value?.email) return user.value.email.charAt(0).toUpperCase()
    return '?'
  })

  // --- ACCIONES (Actions) ---

  /**
   * Se suscribe a los cambios de estado de autenticación de Firebase.
   * Esta función es el corazón del store, se ejecuta al inicio y mantiene
   * la información del usuario y su rol siempre sincronizada.
   */
  const fetchUser = () => {
    const auth = getAuth()
    loading.value = true
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // El usuario ha iniciado sesión.
        // ==========================================================
        // 👇 AÑADE ESTA LÍNEA PARA LA PRUEBA DEFINITIVA 👇
        console.log('Firebase dice que el usuario activo es:', firebaseUser)
        // ==========================================================
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        }

        // Ahora, buscamos el documento del usuario en Firestore para obtener su rol.
        const userDocRef = doc(db, 'users', firebaseUser.uid)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists() && docSnap.data().rol) {
          // Si el documento existe y tiene un campo 'rol', lo asignamos.
          userRole.value = docSnap.data().rol
        } else {
          // Si no, asignamos un rol por defecto para evitar errores.
          userRole.value = 'user'
          console.warn(
            `El usuario con UID ${firebaseUser.uid} no tiene un documento de rol en Firestore. Se asignó el rol por defecto 'user'.`,
          )
        }
      } else {
        // El usuario ha cerrado sesión o no está autenticado.
        user.value = null
        userRole.value = null
      }
      // Marcamos que la carga inicial ha terminado.
      loading.value = false
    })
  }

  /**
   * Cierra la sesión del usuario actual y redirige a la página de inicio.
   */
  const logout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      // No es necesario limpiar user y userRole aquí,
      // onAuthStateChanged se disparará automáticamente y lo hará.
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // --- VALORES DE RETORNO ---
  // Exponemos el estado, los getters y las acciones para que puedan ser
  // utilizados por los componentes de Vue.
  return {
    user,
    userRole,
    loading,
    isLoggedIn,
    isAdmin,
    isModerator,
    canUpdateContent, // <-- ¡Listo para usar!
    userInitial,
    fetchUser,
    logout,
  }
})
