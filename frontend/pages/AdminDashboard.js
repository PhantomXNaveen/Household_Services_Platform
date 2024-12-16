import ServiceCard from "../components/ServiceCard.js";
import ServiceRequestCard from "../components/ServiceRequestCard.js";
import BookService from "./BookService.js";

export default {
  props: ['id'],
  template: `
  <div class="dashboard">
    <!-- Section: Professionals -->
    <button @click="create_csv"> Get User Data </button>

    <h2>Professionals</h2>
    <BookService />

      <div class="sections-container">
        <!-- Section: Services -->
        <div class="section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2>Services</h2>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addServiceModal">
              Add Service
            </button>
          </div>
          <div class="scrollable">
            <div v-if="services.length">
              <ServiceCard :services="services" :fetchServices="fetchServices" />
            </div>
            <p v-else class="text-muted">No services available or an error occurred.</p>
          </div>
        </div>

        <!-- Section: Service Requests -->
        <div class="section">
          <h2>Service Requests</h2>
          <div class="scrollable">
            <ServiceRequestCard :services_requests="services_requests" />
          </div>
        </div>
 

            
            
        <!-- Add Service Modal -->
        <div class="modal fade" id="addServiceModal" tabindex="-1" aria-labelledby="addServiceModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addServiceModalLabel">Add Service</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                    <div class="form-group mb-3">
                        <label for="serviceName">Service Name</label>
                        <input type="text" class="form-control" id="serviceName" v-model="newService.name" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="basePrice">Base Price</label>
                        <input type="number" class="form-control" id="basePrice" v-model="newService.base_price" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="timeRequired">Time Required (hours)</label>
                        <input type="number" class="form-control" id="timeRequired" v-model="newService.time_required" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="description">Description</label>
                        <textarea class="form-control" id="description" v-model="newService.description"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="addService">Add Service</button>
                </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      services: [],
      services_requests: [],
      newService: {
        name: '',
        base_price: null,
        time_required: null,
        description: '',
      },
      errorMessage: null,
    };
  },
  async mounted() {
    const token = this.$store.state.auth_token || JSON.parse(localStorage.getItem('user'));

    if (!token) {
      console.warn('No authentication token found. Redirecting to login...');
      this.$router.push('/login'); // Redirect to login
      return;
    }

    await this.fetchServices();
    await this.fetchServiceRequests();
  },
  methods: {
    // Fetch the list of services
    async create_csv(){
      const res = await fetch(location.origin + '/create-csv', {
          headers : {
              'Authentication-Token' : this.$store.state.auth_token
          }
      })
      const task_id = (await res.json()).task_id

      const interval = setInterval(async() => {
          const res = await fetch(`${location.origin}/get-csv/${task_id}` )
          if (res.ok){
              console.log('data is ready')
              window.open(`${location.origin}/get-csv/${task_id}`)
              clearInterval(interval)
          }

      }, 100)
      
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

    // Fetch the list of service requests
    async fetchServiceRequests() {
      const token = this.$store.state.auth_token
      try {
        const res = await fetch(location.origin + '/api/service_requests', {
          headers: {
            'Authentication-Token': token,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch service_requests: ${res.statusText}`);
        }

        this.services_requests = await res.json();
      } catch (error) {
        console.error(error.message);
        this.services_requests = [];
      }
    },

    // Add a new service
    async addService() {
        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token,
                },
                body: JSON.stringify(this.newService),
            });

            if (response.ok) {
                const addedService = await response.json();
                this.services.push(addedService); // Add new service to the list
                this.resetNewServiceForm();
                window.location.reload();
                this.fetchServices();
            } else {
                const errorData = await response.json();
                this.errorMessage = errorData.message || 'Failed to add service.';
            }
        } catch (error) {
            this.errorMessage = 'An error occurred while adding the service.';
        }
    },

    // Reset the new service form
    resetNewServiceForm() {
      this.newService = { name: '', base_price: null, time_required: null, description: '' }; // Reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
      if (modal) modal.hide(); // Close the modal
    },

    // Update an existing service
    async handleServiceUpdate(updatedService) {
      const index = this.services.findIndex((s) => s.id === updatedService.id);
      if (index !== -1) {
        this.$set(this.services, index, updatedService);
      }

      try {
        const response = await fetch(`/api/services/${updatedService.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify(updatedService),
        });
      }
      catch (error) {
        this.errorMessage = 'An error occurred while updating the service.';
      }
    },
  },
  components: {
    ServiceCard,
    ServiceRequestCard,
    BookService
  },
};
