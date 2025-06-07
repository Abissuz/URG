import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  // En tu store (Pinia)
  state: () => ({
    isFooterVisible: false,
    isLocked: false, // Bloquea cambios durante el scroll
  }),
  actions: {
    setFooterVisibility(visible) {
      if (this.isLocked) return
      this.isLocked = true
      this.isFooterVisible = visible

      // Desbloquea después de 300ms (ajusta según necesidad)
      setTimeout(() => {
        this.isLocked = false
      }, 300)
    },
  },
})
// En tu store (Pinia)
