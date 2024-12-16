import Profile from "../components/Profile.js";
import ServiceRequestCard from "../components/ServiceRequestCard.js";
export default {
    props: ['id'],
    template: `
      <div class="dashboard">
          <Profile />
          <div class="section">
              <h2>Requests </h2>
              <div class="scrollable">
                  <ServiceRequestCard
                      :services_requests="requested_requests"
                  />
              </div>
          </div>
          <div class="section">
              <h2>Accepted </h2>
              <div class="scrollable">
                  <ServiceRequestCard
                  :services_requests="accepted_requests"
                  />
              </div>
          </div>
          <div class="section">
              <h2>Closed Services </h2>
              <div class="scrollable">
                  <ServiceRequestCard
                      :services_requests="closed_requests"
                  />
              </div>
          </div>
      </div>
    `,
    data() {
      return {
        requested_requests:[],
        accepted_requests: [],
        closed_requests: []
      };
    },
    async mounted() {
      const token = this.$store.state.auth_token || JSON.parse(localStorage.getItem('user'));
  
      if (!token) {
        console.warn('No authentication token found. Redirecting to login...');
        this.$router.push('/login'); // Redirect to login
        return;
      }
  
      await this.fetchServiceRequests();
    },
    methods:{
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
      
          // Filter the service requests by professional_id
          let serviceRequests1 = serviceRequests.filter((e) =>e.professional_id===user_id);
          
          this.requested_requests= serviceRequests1.filter((e) =>e.service_status==="requested");
          this.accepted_requests= serviceRequests1.filter((e) =>e.service_status==="accepted");
          this.closed_requests = serviceRequests1.filter((e) =>e.service_status==="closed");
  
        } catch (error) {
          console.error(error.message);
          this.services_requests = [];
        }
      }
      
    },
    components:{
      Profile,
      ServiceRequestCard
    }
};