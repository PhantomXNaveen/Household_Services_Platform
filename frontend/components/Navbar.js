export default {
    template: `
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
          <router-link class="navbar-brand" to="/">Home</router-link>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <!-- Links for logged-out users -->
              <li v-if="!isLoggedIn" class="nav-item">
                <router-link class="nav-link" to="/login">Login</router-link>
              </li>
              <li v-if="!isLoggedIn" class="nav-item">
                <router-link class="nav-link" to="/register">Register</router-link>
              </li>
  
              <!-- Links for logged-in users -->
              <template v-if="isLoggedIn">
                <!-- Links for Customers -->
                <template v-if="userRole === 'Customer'">
                  <li class="nav-item">
                    <router-link class="nav-link" to="/customer">Dashboard</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/customerSearch">Search</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/customerSummary">Summary</router-link>
                  </li>
                </template>
  
                <!-- Links for Admin -->
                <template v-if="userRole === 'Admin'">
                  <li class="nav-item">
                    <router-link class="nav-link" to="/admin">Dashboard</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/adminSearch">Search</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/adminSummary">Summary</router-link>
                  </li>
                </template>
  
                <!-- Links for Professionals -->
                <template v-if="userRole === 'Service Professional'">
                  <li class="nav-item">
                    <router-link class="nav-link" to="/professional">Dashboard</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/professionalSearch">Search</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/professionalSummary">Summary</router-link>
                  </li>
                </template>
  
                <!-- Logout Button -->
                <li class="nav-item">
                  <button @click="handleLogout" class="btn btn-danger nav-link">Logout</button>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </nav>
    `,
    computed: {
      isLoggedIn() {
        return this.$store.state.loggedIn;
      },
      userRole() {
        return this.$store.state.role; // Assuming `role` is stored in Vuex
      },
    },
    methods: {
      handleLogout() {
        this.$store.commit('logout');
        this.$router.push('/login');
      },
    },
  };
  