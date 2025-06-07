<template>
  <div class="flexy">
    <img src="@/assets/img/radio_banner1.png" class="banner1" alt="Buscar" />
    <div class="container py-5">
      <!-- Cabecera -->
      <header class="text-center">
        <h1 class="display-4 fw-bold text-primary">¡Bienvenido a Unimar Radio Global!</h1>
        <p class="lead text-muted">
          Tu ventana al conocimiento y la innovación desde la Universidad de Margarita
        </p>
      </header>

      <!-- Sección principal -->
      <section class="row mb-5">
        <div class="col-lg-8 mx-auto">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <p class="card-text fs-5">
                Unimar Radio Global es mucho más que una emisora universitaria; es tu conexión
                directa con el saber, la cultura y la vanguardia. Desde el corazón de la Universidad
                de Margarita, nuestra radio en línea abre un espacio de comunicación donde
                estudiantes, profesores, egresados y el personal administrativo comparten
                conocimientos y experiencias para contribuir con una mejor sociedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Historia -->
      <section class="row mb-5 mt-5">
        <div class="col-lg-8 mx-auto">
          <h2 class="h3 fw-bold border-bottom pb-2 mb-4">El origen de Unimar Radio Global</h2>
          <div class="ps-lg-4">
            <p>
              En el 2020, enfrentamos el reto de modernizar nuestra radio universitaria para
              adaptarla a los tiempos de cambio. Gracias al apoyo del
              <strong>Consejo Superior</strong>, en el 2024 dimos un gran paso hacia el futuro,
              trabajando arduamente para lanzar Unimar Radio Global en el 2025. Hoy, estamos
              orgullosos de ser una emisora que no solo se escucha, sino que también inspira y
              educa.
            </p>
          </div>
        </div>
      </section>

      <!-- Misión -->
      <section class="row mb-5">
        <div class="col-lg-8 mx-auto">
          <h3 class="h4 fw-bold text-primary mb-3">Nuestra misión y objetivos</h3>
          <div class="card bg-light border-0">
            <div class="card-body p-4">
              <p class="mb-0">
                Tenemos el firme propósito de llevar el conocimiento más allá de las fronteras
                físicas de la universidad, llegando a cualquier persona alrededor del mundo que
                desee aprender. Difundimos información generada en el campus por nuestros
                protagonistas: los estudiantes, profesores y expertos que hacen de la Universidad de
                Margarita un epicentro del saber.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Estilo único -->
      <section class="row mb-5">
        <div class="col-lg-8 mx-auto">
          <h3 class="h4 fw-bold text-primary mb-3">Un estilo único</h3>
          <div class="card border-0" style="background-color: #f0f8ff">
            <div class="card-body p-4">
              <p class="mb-0">
                Con nuestro eslogan <strong>"La radio como a ti te gusta"</strong>, nos distinguimos
                por ofrecer contenido variado y enriquecedor a través de plataformas de streaming y
                el circuito interno en el campus universitario. Creamos una experiencia radial
                adaptada a los gustos y necesidades de la audiencia global.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Llamado a acción -->
      <section class="row">
        <div class="col-lg-8 mx-auto text-center">
          <div class="card border-0 bg-primary text-white">
            <div class="card-body p-4">
              <h3 class="h4 fw-bold mb-3">¡Escucha Unimar Radio Global!</h3>
              <p class="mb-0 fs-5">Forma parte de esta aventura de aprendizaje</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.flexy {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  font-family: 'Sulphur Point', sans-serif;
}
.banner1 {
  width: 100%;
}
.text-primary {
  color: #0d4d98 !important;
}

.card {
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.bg-light {
  background-color: #f8f9fa !important;
}
</style>
