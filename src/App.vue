<script setup>
import Header from '@/components/Header.vue'
import Fav from '@/components/Fav.vue'
import Foot from '@/components/Footer.vue'
import Repro from '@/components/Repro.vue'
</script>

<template>
  <Header v-if="!$route.meta.oculto"></Header>
  <Fav v-if="!$route.meta.oculto" />
  <div class="content-with-header" :class="{ 'reduced-padding': $route.meta.reducedPadding }">
    <RouterView />
  </div>
  <!-- <Repro v-if="!$route.meta.oculto" /> -->
  <Foot v-if="!$route.meta.oculto" />
</template>

<style>
.content-with-header {
  padding-top: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content-with-header.reduced-padding {
  padding-top: 0px; /* Padding reducido solo en login */
}

@media (max-width: 992px) {
  .content-with-header {
    padding-top: 120px; /* Altura para móviles */
  }
}
</style>
