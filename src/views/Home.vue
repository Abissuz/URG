<template>
  <div class="home-layout">
    <SongRequestSystem />

    <ScheduleWidget />
  </div>

  <VideoPreview />
  <PodcastPreview />
</template>

<script setup>
// Home.vue ahora solo importa los componentes que usa directamente
import SongRequestSystem from '@/components/SongRequestSystem.vue'
import ScheduleWidget from '@/components/ScheduleWidget.vue'
import VideoPreview from '@/components/VideoPreview.vue'
import PodcastPreview from '@/components/PodcastPreview.vue'
</script>

<style scoped>
/* Home.vue solo define la maquetación principal */
.home-layout {
  display: flex;
  padding: 1.5rem;
  gap: 1.5rem;
  height: calc(100vh - 70px - 90px);
}

/* Media Query para la maquetación general */
@media screen and (max-width: 812px) {
  .home-layout {
    flex-direction: column;
    height: auto;
  }
}
</style>
