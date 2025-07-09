import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.css' // Importa los estilos base

// Creamos una instancia de "Toast" con la configuración que queremos para todas
// nuestras notificaciones. Son pequeñas, en la esquina y desaparecen solas.
const Toast = Swal.mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 3000, // Las notificaciones se cierran después de 3 segundos
  timerProgressBar: true,
  didOpen: (toast) => {
    // Esto pausa el temporizador si el usuario pone el mouse sobre la notificación
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  },
})

// Ahora, exportamos funciones específicas para cada tipo de notificación
// que queramos usar en la aplicación.

/**
 * Muestra una notificación de éxito.
 * @param {string} title - El mensaje a mostrar.
 */
export const showSuccessToast = (title) => {
  Toast.fire({
    icon: 'success',
    title: title || '¡Operación exitosa!',
  })
}
export const showInfoToast = (title) => {
  Toast.fire({
    icon: 'info',
    title: title,
  })
}

/**
 * Muestra una notificación de error.
 * @param {string} title - El mensaje a mostrar.
 */
export const showErrorToast = (title) => {
  Toast.fire({
    icon: 'error',
    title: title || 'Ha ocurrido un error.',
  })
}

/**
 * Muestra una notificación de advertencia.
 * @param {string} title - El mensaje a mostrar.
 */
export const showWarningToast = (title) => {
  Toast.fire({
    icon: 'warning',
    title: title,
  })
}

/**
 * Muestra un diálogo de confirmación.
 * @param {string} title - El título del diálogo.
 * @param {string} text - El texto del cuerpo del diálogo.
 * @returns {Promise<boolean>} - True si el usuario confirma, false si cancela.
 */
export const showConfirmDialog = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
  })
  return result.isConfirmed
}
