import ServiceCard from "../components/ServiceCard.js";
import ServiceRequestCard from "../components/ServiceRequestCard.js";
import Profile from "../components/Profile.js";


export default {
  props: ['id'],
  template: `
    <div class="dashboard">

        <div class="sections-container">
            <!-- Section 2: Profile -->
            <div class="section">
                <h2>Profile</h2>
                    <Profile />
            </div>

            <!-- Section 3: Services -->
            <div class="section">
                <h2>Services</h2>
                <div class="scrollable">
                    <div v-if="services.length">
                        <ServiceCard
                            :services="services" 
                            :fetchServices="fetchServices"
                        />
                    </div>
                    <p v-else>No services available or an error occurred.</p>
                </div>
            </div>
            <!-- Section 1: Service Requests -->
          </div>
            <h2>Services History</h2>
            <ServiceRequestCard
                        :services_requests="services_requests"
            />
    </div>
    `,
  data() {
    return {
      services: [],
      services_requests: [],
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
    async fetchServiceRequests() {
      const token = this.$store.state.auth_token;
      const user_id = this.$store.state.user_id;  // Assuming the customer_id is saved in the store
    
      if (!token || !user_id) {
        console.warn('Authentication token or customer ID not found. Redirecting to login...');
        this.$router.push('/login'); // Redirect to login if not found
        return;
      }
    
      try {
        const res = await fetch(`${location.origin}/api/service_requests`, {
          headers: {
            'Authentication-Token': token,
          },
        });
    
        if (!res.ok) {
          throw new Error(`Failed to fetch service requests: ${res.statusText}`);
        }
    
        const serviceRequests = await res.json();
        console.log(serviceRequests);
    
        // Filter the service requests by customer_id
        this.services_requests = serviceRequests.filter((e) =>e.customer_id===user_id);

      } catch (error) {
        console.error(error.message);
        this.services_requests = [];
      }
    }
    
    
  },
  components: {
    ServiceCard,
    Profile,
    ServiceRequestCard,
  },
  style: `
  
  `
};
