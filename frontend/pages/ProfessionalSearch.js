import ServiceRequestCard from "../components/ServiceRequestCard.js";

export default {
    props: ['id'],
    template: `
      <div>
        <ServiceRequestCard v-if="services_requests.length" :services_requests="services_requests" />
        <p v-else>No service requests available.</p>
      </div>
    `,
    data() {
      return {
        services_requests: [],
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
  
      await this.fetchServiceRequests(token);
    },
    methods: {
      // Fetch the list of service requests
      async fetchServiceRequests(token) {
        try {
          const res = await fetch(`${location.origin}/api/service_requests`, {
            headers: {
              'Authentication-Token': token,
            },
          });
  
          if (!res.ok) {
            throw new Error(`Failed to fetch service requests: ${res.statusText}`);
          }
          let a = await res.json();
          console.log(this.$store.state.user_id);

          this.services_requests = a.filter((x)=>this.$store.state.user_id===x.professional_id);
        } catch (error) {
          console.error(error.message);
          this.errorMessage = 'Unable to fetch service requests. Please try again later.';
        }
      },
    },
    components: {
        ServiceRequestCard
    }
  };
  