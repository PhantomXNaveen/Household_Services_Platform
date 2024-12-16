export default {
  template: `
    <div class="container mt-5">
      <!-- Profile Card -->
      <div class="card shadow-lg">
        <div class="card-header bg-primary text-light">
          <h4>Profile</h4>
        </div>
        <div class="card-body">
          <ul class="list-group">
            <li class="list-group-item"><strong>Name:</strong> {{ user.name }}</li>
            <li class="list-group-item"><strong>Email:</strong> {{ user.email }}</li>
            <li class="list-group-item"><strong>Address:</strong> {{ user.address }}</li>
            <li class="list-group-item"><strong>Pin Code:</strong> {{ user.pin_code }}</li>
            <li v-if="$store.state.role === 'Service Professional'" class="list-group-item"><strong>Service:</strong> {{ getServiceName(user.service_id) }}</li>
            <li v-if="$store.state.role === 'Service Professional'" class="list-group-item"><strong>Experience:</strong> {{ user.experience }} years</li>
            <li v-if="$store.state.role === 'Service Professional'" class="list-group-item"><strong>Description:</strong> {{ user.description }}</li>
          </ul>
          <!-- Edit Profile Button -->
          <button class="btn btn-success mt-3" data-bs-toggle="modal" data-bs-target="#editProfileModal">Edit Profile</button>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editProfileModalLabel">Edit Profile</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <div class="form-group mb-3">
                <label for="name">Name</label>
                <input type="text" class="form-control" id="name" v-model="form.name" />
              </div>
              <div class="form-group mb-3">
                <label for="address">Address</label>
                <input type="text" class="form-control" id="address" v-model="form.address" />
              </div>
              <div class="form-group mb-3">
                <label for="pin_code">Pin Code</label>
                <input type="text" class="form-control" id="pin_code" v-model="form.pin_code" />
              </div>
              <div v-if="$store.state.role === 'Service Professional'">
                <div class="form-group mb-3">
                  <label for="service">Service</label>
                  <select class="form-control" id="service" v-model="form.service_id">
                    <option disabled value="">Select a service</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
                  </select>
                </div>
                <div class="form-group mb-3">
                  <label for="experience">Experience (Years)</label>
                  <input type="number" class="form-control" id="experience" v-model="form.experience" />
                </div>
                <div class="form-group mb-3">
                  <label for="description">Description</label>
                  <textarea class="form-control" id="description" v-model="form.description"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" @click="updateProfile">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      user: {},
      services: [],
      form: {
        name: '',
        address: '',
        pin_code: '',
        service_id: null,
        experience: null,
        description: '',
      },
      errorMessage: null,
      successMessage: null,
    };
  },
  async created() {
    try {
      const userId = this.$store.state.user_id;
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });

      if (response.ok) {
        this.user = await response.json();
        this.form = { ...this.user };
      } else {
        const errorData = await response.json();
        this.errorMessage = errorData.message || 'Failed to fetch user data.';
      }
    } catch (error) {
      this.errorMessage = 'Error fetching user data.';
    }
  },
  async mounted(){
    await this.fetchServices();
  },
  methods: {
    async updateProfile() {
      try {
        // Reset both messages before sending the request
        this.errorMessage = null;
        this.successMessage = null;
    
        const userId = this.user.id;
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(this.form),
        });
    
        if (response.ok) {
          const updatedUser = await response.json();
          this.user = { ...updatedUser };
    
          // Show success message and hide modal
          this.successMessage = 'Profile updated successfully!';
          console.log('Update attempt completed');
          const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
          if (modal) modal.hide(); // Ensure modal is only hidden if instance exists
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.message || 'Failed to update profile.';
          console.error(this.errorMessage);
        }
      } catch (error) {
        // Log unexpected errors
        this.errorMessage = 'An unexpected error occurred while updating the profile.';
        console.error(this.errorMessage, error);
      }
    },
    async fetchServices(){
      const token = this.$store.state.auth_token;
      try {
        const res = await fetch(location.origin + '/api/services', {
          headers: {
            'Authentication-Token': token,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch services: ${res.statusText}`);
        }

        this.services = await res.json();
      } catch (error) {
        console.error(error.message);
        this.services = [];
      }
    },
    getServiceName(serviceId) {
      const service = this.services.find((s) => s.id === serviceId);
      return service ? service.name : 'Unknown Service';
    },
  },
};
