export default {
  props: ['services', 'fetchServices'],
  data() {
    return {
      editService: {
        id: null,
        name: '',
        base_price: null,
        description: '',
        time_required: null,
      },
      filter: {
        name: '', // Filter by name
        id: '', // Filter by id
      },
      errorMessage: '', // To display validation errors
    };
  },
  computed: {
    filteredServices() {
      return this.services.filter((service) => {
        const matchesName = service.name
          .toLowerCase()
          .includes(this.filter.name.toLowerCase());
        const matchesId =
          this.filter.id === '' || service.id.toString().includes(this.filter.id);
        return matchesName && matchesId;
      });
    },
    // Check if the current route is the admin search page
    isAdminSearchPage() {
      return this.$route.path === '/adminSearch' ; // Adjust based on your route setup
    },
  },
  methods: {
    openEditModal(service) {
      this.editService = {
        id: service.id,
        name: service.name,
        base_price: service.base_price,
        time_required: service.time_required,
        description: service.description,
      };
      this.errorMessage = '';
      const modal = new bootstrap.Modal(
        document.getElementById(`EditServiceModal-${service.id}`)
      );
      modal.show();
    },
    async saveChanges() {
      if (!this.editService.name || !this.editService.base_price) {
        this.errorMessage = 'Both name and price are required.';
        return;
      }

      try {
        const response = await fetch(`/api/services/${this.editService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({
            name: this.editService.name,
            base_price: this.editService.base_price,
            description: this.editService.description,
            time_required: this.editService.time_required,
          }),
        });
        this.fetchServices();

        if (!response.ok) {
          throw new Error('Failed to save changes');
        }

        this.$emit('update-service', { ...this.editService });

        const modal = bootstrap.Modal.getInstance(
          document.getElementById(`EditServiceModal-${this.editService.id}`)
        );
        modal.hide();
      } catch (error) {
        console.error(error.message);
        this.errorMessage = 'An error occurred while saving changes.';
      }
    },
    async deleteServiceFun(serviceId) {
      try {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
        this.fetchServices();
        if (response.ok) {
          this.$emit('service-deleted', serviceId);
        } else {
          throw new Error('Failed to delete service');
        }
      } catch (error) {
        this.errorMessage = 'An error occurred while deleting the service.';
      }
    },
  },
  template: `
    <div>
      <div class="container mt-4">
        <!-- Filters -->
        <div v-if="isAdminSearchPage" class="row mb-3">
          <div class="col-md-6">
            <input
              type="text"
              class="form-control"
              v-model="filter.name"
              placeholder="Filter by name"
            />
          </div>
          <div class="col-md-6">
            <input
              type="text"
              class="form-control"
              v-model="filter.id"
              placeholder="Filter by ID"
            />
          </div>
        </div>

        <!-- Services Table -->
        <table class="table table-striped shadow-sm">
          <thead class="bg-primary text-light">
            <tr>
              <th>Service Name</th>
              <th>Service ID</th>
              <th>Service Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in filteredServices" :key="service.id">
              <td
                @click="$router.push('/services/' + service.id)"
                class="text-primary"
                style="cursor: pointer;"
              >
                {{ service.name }}
              </td>
              <td>{{ service.id }}</td>
              <td>{{ service.base_price }}</td>
              <td>
                <button
                  v-if="$store.state.role === 'Admin'"
                  class="btn btn-primary"
                  @click="openEditModal(service)"
                >
                  Edit
                </button>
                <button
                  v-if="$store.state.role === 'Admin'"
                  class="btn btn-danger"
                  @click="deleteServiceFun(service.id)"
                >
                  Delete
                </button>
                <button
                  v-if="$store.state.role === 'Customer'"
                  class="btn btn-primary"
                  @click="$router.push('/bookService/' + service.id)"
                >
                  Book
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit Modals -->
      <div
        class="modal fade"
        v-for="service in services"
        :id="'EditServiceModal-' + service.id"
        tabindex="-1"
        aria-labelledby="EditServiceModalLabel"
        aria-hidden="true"
        :key="'modal-' + service.id"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="EditServiceModalLabel">Edit Service</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <div class="form-group mb-3">
                <label for="serviceName">Service Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="serviceName"
                  v-model="editService.name"
                />
              </div>
              <div class="form-group mb-3">
                <label for="basePrice">Base Price</label>
                <input
                  type="number"
                  class="form-control"
                  id="basePrice"
                  v-model="editService.base_price"
                />
              </div>
              <div class="form-group mb-3">
                <label for="time_required">Time Required</label>
                <input
                  type="number"
                  class="form-control"
                  id="time_required"
                  v-model="editService.time_required"
                />
              </div>
              <div class="form-group mb-3">
                <label for="description">Description</label>
                <input
                  type="text"
                  class="form-control"
                  id="description"
                  v-model="editService.description"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button type="button" class="btn btn-primary" @click="saveChanges">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
