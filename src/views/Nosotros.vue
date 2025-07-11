<template>
  <div class="nosotros-page">
    <img src="@/assets/img/radio_banner1.png" class="banner-image" alt="Banner Radio" />

    <div class="content-container">
      <header class="text-center mb-5">
        <h1 class="display-4 fw-bold text-primary">¡Bienvenido a Unimar Radio Global!</h1>
        <p class="lead text-muted">
          Tu ventana al conocimiento y la innovación desde la Universidad de Margarita
        </p>
      </header>

      <section class="mb-5">
        <div class="card shadow-sm border-0 intro-card">
          <div class="card-body p-4">
            <p class="card-text fs-5">
              Unimar Radio Global es mucho más que una emisora universitaria; es tu conexión directa
              con el saber, la cultura y la vanguardia. Desde el corazón de la Universidad de
              Margarita, nuestra radio en línea abre un espacio de comunicación donde estudiantes,
              profesores, egresados y el personal administrativo comparten conocimientos y
              experiencias para contribuir con una mejor sociedad.
            </p>
          </div>
        </div>
      </section>

      <section class="mb-5 text-section">
        <h2 class="section-title">El origen de Unimar Radio Global</h2>
        <p class="section-text">
          En el 2020, enfrentamos el reto de modernizar nuestra radio universitaria para adaptarla a
          los tiempos de cambio. Gracias al apoyo del <strong>Consejo Superior</strong>, en el 2024
          dimos un gran paso hacia el futuro, trabajando arduamente para lanzar Unimar Radio Global
          en el 2025. Hoy, estamos orgullosos de ser una emisora que no solo se escucha, sino que
          también inspira y educa.
        </p>
      </section>

      <section class="mb-5 text-section">
        <h3 class="section-subtitle">Nuestra misión y objetivos</h3>
        <p class="section-text">
          Tenemos el firme propósito de llevar el conocimiento más allá de las fronteras físicas de
          la universidad, llegando a cualquier persona alrededor del mundo que desee aprender.
          Difundimos información generada en el campus por nuestros protagonistas: los estudiantes,
          profesores y expertos que hacen de la Universidad de Margarita un epicentro del saber.
        </p>
      </section>

      <section class="mb-5 text-section">
        <h3 class="section-subtitle">Un estilo único</h3>
        <p class="section-text">
          Con nuestro eslogan <strong>"La radio como a ti te gusta"</strong>, nos distinguimos por
          ofrecer contenido variado y enriquecedor a través de plataformas de streaming y el
          circuito interno en el campus universitario. Creamos una experiencia radial adaptada a los
          gustos y necesidades de la audiencia global.
        </p>
      </section>

      <section class="mb-5 text-center">
        <div class="card border-0 bg-primary text-white cta-card">
          <div class="card-body p-4">
            <h3 class="h4 fw-bold mb-2">¡Escucha Unimar Radio Global!</h3>
            <p class="mb-0 fs-5">Forma parte de esta aventura de aprendizaje</p>
          </div>
        </div>
      </section>

      <section class="team-section">
        <h2 class="section-title text-center">Nuestro Equipo</h2>
        <div class="row justify-content-center mt-4">
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card team-card border-0 text-center h-100">
              <div class="team-member-img">
                <img src="@/assets/img/MA.jpg" alt="Manuel Aceituno" class="img-fluid" />
              </div>
              <div class="card-body">
                <h5 class="card-title fw-bold">Director General</h5>
                <p class="card-text text-muted">Manuel Aceituno</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card team-card border-0 text-center h-100">
              <div class="team-member-img">
                <img src="@/assets/img/GB.jpg" alt="Giancarlo Bedetti" class="img-fluid" />
              </div>
              <div class="card-body">
                <h5 class="card-title fw-bold">Subdirector</h5>
                <p class="card-text text-muted">Giancarlo Bedetti</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card team-card border-0 text-center h-100">
              <div class="team-member-img">
                <img src="@/assets/img/JC.jpg" alt="Juancarlos Rodriguez" class="img-fluid" />
              </div>
              <div class="card-body">
                <h5 class="card-title fw-bold">Gerente de Producción</h5>
                <p class="card-text text-muted">Juancarlos Rodriguez</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card team-card border-0 text-center h-100">
              <div class="team-member-img">
                <img src="@/assets/img/AH.jpg" alt="Alejandro Hernández" class="img-fluid" />
              </div>
              <div class="card-body">
                <h5 class="card-title fw-bold">Operador</h5>
                <p class="card-text text-muted">Alejandro Hernández</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// El script no necesita cambios, solo la estructura del template
</script>

<style scoped>
.nosotros-page {
  font-family: 'Sulphur Point', sans-serif;
  background-color: #ffffff;
}

.banner-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
}

.content-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.text-primary {
  color: #0d4d98 !important;
}

/* [MODIFICADO] Clase unificada para las secciones de texto */
.text-section {
  padding-left: 1.5rem;
  border-left: 3px solid #0d4d98;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 700;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d4d98;
  margin-bottom: 1rem;
}

.section-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #343a40;
}

.intro-card,
.card {
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.intro-card:hover,
.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.cta-card {
  transition: transform 0.3s ease;
}
.cta-card:hover {
  transform: scale(1.03);
}

.team-section {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.team-card {
  background-color: #f8f9fa;
}

.team-member-img {
  width: 150px;
  height: 150px;
  margin: 1.5rem auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.team-member-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-card .card-title {
  font-size: 1.1rem;
  color: #212529;
}
</style>
