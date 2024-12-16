export default {
    template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg">
            <div class="card-header bg-success text-black text-center">
              <h4>Register</h4>
            </div>
            <div class="card-body">
            
              <!-- Error/Success Messages -->
              <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
              <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>

              <!-- Name Field -->
              <div class="form-group mb-3">
                <label for="name">Name</label>
                <input type="text" class="form-control" id="name" placeholder="Enter your name" v-model="form.name" />
              </div>

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
  
              <!-- Address Field -->
              <div class="form-group mb-3">
                <label for="address">Address</label>
                <input type="text" class="form-control" id="address" placeholder="Enter your address" v-model="form.address" />
              </div>
  
              <!-- Pin Code Field -->
              <div class="form-group mb-3">
                <label for="pin_code">Pin Code</label>
                <input type="text" class="form-control" id="pin_code" placeholder="Enter your pin code" v-model="form.pin_code" />
              </div>
  
              <!-- Role Selection -->
              <div class="form-group mb-3">
                <label for="role">Select Role:</label>
                <select class="form-control" id="role" v-model="form.role" @change="onRoleChange">
                  <option disabled value="">Please select a role</option>
                  <option value="Customer">Customer</option>
                  <option value="Service Professional">Service Professional</option>
                </select>
              </div>
  
              <!-- Conditional Fields for Service Professionals -->
              <div v-if="form.role === 'Service Professional'">
                <div class="form-group mb-3">
                  <label for="service">Service</label>
                  <select class="form-control" id="service" v-model="form.service_id">
                    <option disabled value="">Select a service</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                  </select>
                </div>
  
                <div class="form-group mb-3">
                  <label for="experience">Experience (Years)</label>
                  <input type="number" class="form-control" id="experience" placeholder="Enter your experience" v-model="form.experience" />
                </div>
  
                <div class="form-group mb-3">
                  <label for="description">Description</label>
                  <textarea class="form-control" id="description" placeholder="Enter a description" v-model="form.description"></textarea>
                </div>
                <div class="form-group mb-3">
                  <label for="document">Document</label>
                  <input type="file" class="form-control" id="document" placeholder="Upload"/>
                </div>
              </div>
  
              <!-- Submit Button -->
              <div class="d-flex justify-content-center">
              <button class="btn btn-primary text-light btn-lg" @click="submitRegister" :disabled="!isFormComplete">Register</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
      return {
        form: {
          name: '',
          email: '',
          password: '',
          role: '',
          address: '',
          pin_code: '',
          service_id: null,   // For Service Professionals
          experience: null,   // For Service Professionals
          description: '',    // For Service Professionals
          document: '',    // For Service Professionals
        },
        services: [],  // List of available services from API
        errorMessage: null,
        successMessage: null,
      };
    },
    computed: {
      isFormComplete() {
        return (
          this.form.name &&
          this.form.email &&
          this.form.password &&
          this.form.role &&
          this.form.address &&
          this.form.pin_code &&
          (this.form.role !== 'Service Professional' || (this.form.service_id && this.form.description && this.form.experience))
        );
      }
    },
    async created() {
      try {
        const response = await fetch(location.origin + '/api/services');

        if (response.ok) {
          this.services = await response.json(); // Fetch services from API
        } else {
          console.error('Failed to fetch services:', response.status);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    },
    methods: {
      onRoleChange() {
        if (this.form.role !== 'Service Professional') {
          this.form.service_id = null;
          this.form.experience = null;
          this.form.description = '';
        }
      },
      async submitRegister() {
        const registerData = { ...this.form };
        this.errorMessage = null; // Reset error message before submitting
        this.successMessage = null; // Reset success message before submitting
  
        try {
          const res = await fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
          });
  
          const responseData = await res.json();
  
          if (res.ok) {
            this.successMessage = responseData.message || 'Registration successful!';
            this.clearFormFields();
          } else {
            this.errorMessage = responseData.message || 'Registration failed.';
          }
        } catch (error) {
          this.errorMessage = 'Network error. Please try again later.';
          console.error('Error during registration:', error);
        }
      },
      clearFormFields() {
        this.form = {
            service_id: null,
            experience: null,
            description: '',
            name: '',
            email: '',
            password: '',
            address: '',
            pin_code: '',
            role: '',
        };

      },
    },
  };
  