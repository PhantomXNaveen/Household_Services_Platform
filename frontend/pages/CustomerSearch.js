import ServiceCard from "../components/ServiceCard.js";

export default {
    props: ['id'],
    template: `
        <div>
        <div class="container mt-4">
        <!-- Filters -->
        <div class="row mb-3">
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
    </div>
    `,
    async mounted() {
        const token = this.$store.state.auth_token || JSON.parse(localStorage.getItem('user'));
    
        if (!token) {
          console.warn('No authentication token found. Redirecting to login...');
          this.$router.push('/login'); // Redirect to login
          return;
        }
    
        await this.fetchServices();
      },
      methods: {
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
    },
    data(){
        return{
            services:[],
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
        }
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
        
      },
    components: {
        ServiceCard
    }
}