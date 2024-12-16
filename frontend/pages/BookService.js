import User from "../components/User.js";

export default {
  props: ['service_id'],
  template: `
    <div class="container mt-5">
        <div>
            <div>
                <h3 v-if="$store.state.role === 'Admin'" class="mb-4">Professional's Requests</h3>
                <h3 v-else class="mb-4">User </h3>
            </div>
            <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
            
            <!-- Search bar -->
            <div class="mb-3" v-if="this.$store.state.role==='Customer'">
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search by name..." 
                    v-model="searchQuery" 
                />
            </div>

            <table class="table table-striped shadow-sm">
                <thead class="bg-primary text-light">
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Pin Code</th>
                        <th>Service</th>
                        <th>Experience</th>
                        <th>Permission</th>
                        <th>Roles</th>
                        <th v-if="$store.state.role === 'Customer'">Rating</th>
                        <th>Access</th>
                    </tr>
                </thead>
                <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.address }}</td>
                        <td>{{ user.pin_code }}</td>
                        <td>{{ getServiceName(user.service_id) }}</td>
                        <td>{{ user.experience }}</td>
                        <td>{{ user.permission }}</td>
                        <td>{{ user.roles.join(', ') }}</td>
                        <td v-if="$store.state.role === 'Customer'">{{ user.rating }}</td>
                        <td>
                            <button v-if="$store.state.role === 'Customer'" class="btn btn-info btn-sm" @click="bookfun(user.id)">Book</button>
                            <button v-if="$store.state.role === 'Admin'" class="btn btn-info btn-sm" @click="flag(user.id, !user.permission)">{{ user.permission ? 'Deny' : 'Give' }}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <router-link to="/customerSearch" v-if="$store.state.role === 'Customer'" class="btn btn-info btn-sm">Back To Services</router-link>
    </div>
  `,
  async mounted() {
    await this.fetchUsersFun();
    await this.fetchServices();

    // For professionals
    if (this.$store.state.role === 'Customer') {
      await this.fetchServiceRequests();
    }

    if(this.$route.path==='/admin'){
      this.Users = this.Users.filter((x)=>x.permission==false);
      console.log(this.Users);
    }
  },
  data() {
    return {
      Users: [],
      errorMessage: '',
      services: [],
      searchQuery: '', // Stores search input
      successMessage:null
    };
  },
  computed: {
    filteredUsers() {
      return this.Users.filter(user => 
        user.name && user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    async fetchUsersFun() {
      try {
        const usersResponse = await fetch('/api/users', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
        if (usersResponse.ok) {
          let a = await usersResponse.json();
          let b = a.filter((x) => x.roles[0] === 'Service Professional');
          this.Users = b;
          if (this.$store.state.role === 'Customer') {
            this.Users = b.filter((x) => x.service_id == this.service_id);
          }
        } else {
          this.errorMessage = 'Failed to fetch users.';
        }
      } catch (error) {
        this.errorMessage = 'An error occurred while fetching data.';
      }
    },
    async bookfun(professional_id) {
      try {
        const response = await fetch('/api/service_requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({ service_id: this.service_id, professional_id }),
        });

        if (response.ok) {
          const addedService = await response.json();
          this.successMessage = addedService.message || 'Service Booked';
          setTimeout(()=>{
            this.successMessage = null;
          }, 500)
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.message || 'Failed to Book service.';
        }
      } catch (error) {
        this.errorMessage = 'An error occurred while adding the service.';
      }
    },
    async flag(user_id, flagval) {
      try {
        const response = await fetch(`/api/users/${user_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({ permission: flagval }),
        });
        this.fetchUsersFun();
        // window.location.reload();
        if (response.ok) {
          const addedService = await response.json();
          console.log(addedService.message);
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.message || 'Failed to add service.';
        }
      } catch (error) {
        this.errorMessage = 'An error occurred while adding the service.';
      }
    },
    getServiceName(serviceId) {
      const service = this.services.find((s) => s.id === serviceId);
      return service ? service.name : 'Unknown Service';
    },
    async fetchServices() {
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
    async fetchServiceRequests() {
      const token = this.$store.state.auth_token;
      try {
        const res = await fetch(location.origin + '/api/service_requests', {
          headers: {
            'Authentication-Token': token,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch services: ${res.statusText}`);
        }

        let allRequests = await res.json();
        let profeAvgRatArr = []; // Array of professional_id and avgRating
        for (let i = 0; i < this.Users.length; i++) {
          const professionalRequests = allRequests.filter(request => request.professional_id === this.Users[i].id);

          let totalRating = 0;
          let validRatingCount = 0;

          professionalRequests.forEach(request => {
            if (request.rating > 0) {
              totalRating += request.rating;
              validRatingCount++;
            }
          });

          const avgRating = validRatingCount > 0 ? (totalRating / validRatingCount).toFixed(2) : 0;

          profeAvgRatArr.push({ professional_id: this.Users[i].id, avgRating });
        }

        profeAvgRatArr.sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));

        let newUsers = [];
        for (let i = 0; i < profeAvgRatArr.length; i++) {
          let pickDataAccProffId = this.Users.filter((x) => x.id === profeAvgRatArr[i].professional_id);
          pickDataAccProffId[0].rating = profeAvgRatArr[i].avgRating;
          newUsers.push(pickDataAccProffId[0]);
        }
        this.Users = newUsers;

      } catch (error) {
        console.error(error.message);
        this.services = [];
      }
    },
  },
  components: {
    User
  }
};
