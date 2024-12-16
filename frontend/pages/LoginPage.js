export default {
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg">
            <div class="card-header bg-primary text-white text-center">
              <h4>Login</h4>
            </div>
            <div class="card-body">
              <!-- Email Field -->
              <div class="form-group mb-3">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" placeholder="Enter your email" v-model="form.email" />
              </div>
  
              <!-- Password Field -->
              <div class="form-group mb-3">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Enter your password" v-model="form.password" />
              </div>
  
              <!-- Submit Button -->
              <div class="d-flex justify-content-center">
                <button class="btn btn-success text-light btn-lg" @click="submitLogin" :disabled="!isFormComplete">Login</button>
              </div>
  
              <!-- Error/Success Messages -->
              <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
              <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      errorMessage: null,
      successMessage: null,
    };
  },
  computed: {
    isFormComplete() {
      return this.form.email && this.form.password;
    },
  },
  methods: {
    async submitLogin() {
      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.form),
        });

        const responseData = await res.json();

        if (res.ok) {
          this.successMessage = 'Login successful!';
          localStorage.setItem('user', JSON.stringify(responseData));  // Store response in localStorage
          this.$store.commit('setUser')

          // Determine the user's role
          const role = Array.isArray(responseData.roles) ? responseData.roles[0] : responseData.roles;

          // Redirect based on role
          if (role === 'Admin') {
            this.$router.push('/admin');
          } else if (role === 'Customer') {
            this.$router.push('/customer');
          } else if (role === 'Service Professional') {
            this.$router.push('/professional');
          } else {
            this.errorMessage = 'Unknown role. Please contact support.';
          }

          // Clear success message after a delay
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);

        } else {
          this.errorMessage = responseData.message || 'Login failed.';
        }
      } catch (error) {
        this.errorMessage = 'Network error. Please try again later.';
        console.error('Error during login:', error);
      }
    },
  },
};
