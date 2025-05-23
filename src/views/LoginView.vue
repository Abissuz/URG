<template>
  <div class="content">
    <!-- Navbar fijo en la parte superior -->
    <nav class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
      <div class="container">
        <a
          class="navbar-brand"
          href="https://www.unimar.edu.ve/portalunimar/public/home"
          target="_blank"
        >
          <img
            class="title-app"
            src="https://www.unimar.edu.ve/portalunimar/public/image/logounimar-22.jpg"
            alt="Logo Unimar"
            style="width: 150px"
          />
        </a>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <span class="title-app nav-link">Bienvenid@</span>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido principal centrado -->
    <main class="main-content">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-xl-5">
            <div class="card shadow">
              <div class="card-header lol">
                <img
                  class="img-login"
                  src="https://www.unimar.edu.ve/portalunimar/public/image/user.png"
                  alt="user"
                />
                <span class="title-login">Inicio de sesión</span>
              </div>
              <div class="card-body">
                <form method="POST" action="https://www.unimar.edu.ve/portalunimar/public/login">
                  <input
                    type="hidden"
                    name="_token"
                    value="wMe6myv6l0PICNWrabvYoCcrZcGIsTI5JheNyHPK"
                  />

                  <div class="mb-3 row">
                    <label for="email" class="col-md-4 col-form-label text-md-end"
                      >Correo electrónico</label
                    >
                    <div class="col-md-6">
                      <input
                        id="email"
                        type="email"
                        class="form-control"
                        name="email"
                        required
                        autofocus
                      />
                    </div>
                  </div>

                  <div class="mb-3 row">
                    <label for="password" class="col-md-4 col-form-label text-md-end"
                      >Contraseña</label
                    >
                    <div class="col-md-6 position-relative">
                      <input
                        id="password"
                        type="password"
                        class="form-control"
                        name="password"
                        minlength="5"
                        required
                      />
                      <i class="bi bi-eye-slash" id="togglePassword"></i>
                    </div>
                  </div>

                  <div class="mb-3 row">
                    <div class="col-md-6 offset-md-4">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          name="remember"
                          id="remember"
                        />
                        <label class="form-check-label" for="remember">Recuerdame</label>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3 row justify-content-center">
                    <div class="col-7 col-sm-5">
                      <button type="submit" class="btn btn-primary w-100" id="btn-login">
                        Iniciar sesión
                      </button>
                    </div>
                  </div>

                  <div class="mb-0 row text-center">
                    <div class="col-sm-12">
                      <a href="#" onclick="registerSteps()" class="a-link">Regístrate</a><br />
                      <a
                        href="https://www.unimar.edu.ve/portalunimar/public/password/reset"
                        class="a-link"
                        >¿Olvidaste tu contraseña?</a
                      >
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
// No se requiere lógica adicional para este componente básico
</script>

<style scoped>
.lol {
  position: relative;
}
.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}
/* Estilos para el contenido principal */
.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.a-link {
  text-decoration: none;
}
/* Estilos personalizados existentes */
.title-app {
  font-family: 'Sulphur Point', sans-serif;
  font-weight: 500;
}

.img-login {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #2b629c;
  text-align: center;
  padding-top: 50px;
  padding-bottom: 20px;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.title-login {
  display: block;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 10px;
}

.form-check-label {
  font-size: 0.9rem;
}

#btn-login {
  background-color: #2b629c;
  border-color: #2b629c;
}

#btn-login:hover {
  background-color: #244f7a;
  border-color: #244f7a;
}

.bi-eye-slash {
  position: absolute;
  right: 15px;
  top: 35px;
  cursor: pointer;
}

.position-relative {
  position: relative;
}

/* Ajustes para móviles */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px;
  }

  .card-header {
    padding-top: 40px;
  }

  .img-login {
    width: 80px;
    height: 80px;
    margin-top: -40px;
  }
}
</style>
