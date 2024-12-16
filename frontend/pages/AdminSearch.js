import User from "../components/User.js";
import ServiceRequestCard from "../components/ServiceRequestCard.js";
import ServiceCard from "../components/ServiceCard.js";

export default {
    props: ['id'],
    template: `
        <div>
            <User />
            <div class="dashboard">
                <div class="sections-container">

                    <!-- Section 3: Services -->
                    <div class="section">
                        <h2>Service </h2>
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
                    <div class="section">
                        <h2>Service Requests</h2>
                        <div class="scrollable">
                            <ServiceRequestCard :services_requests="services_requests" />
                        </div>
                    </div>            
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            services_requests: [],
            services: [],
        };
    },
    methods: {
        async fetchServices() {
            const token = this.getToken();
            if (!token) return;

            try {
                const res = await fetch(`${location.origin}/api/services`, {
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
            const token = this.getToken();
            if (!token) return;

            try {
                const res = await fetch(`${location.origin}/api/service_requests`, {
                    headers: {
                        'Authentication-Token': token,
                    },
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch service requests: ${res.statusText}`);
                }

                this.services_requests = await res.json();
            } catch (error) {
                console.error(error.message);
                this.services_requests = [];
            }
        },

        getToken() {
            const token = this.$store.state.auth_token || JSON.parse(localStorage.getItem('user'));
            if (!token) {
                console.warn('No authentication token found. Redirecting to login...');
                this.$router.push('/login'); // Redirect to login
            }
            return token;
        },

        async initializeData() {
            await Promise.all([this.fetchServices(), this.fetchServiceRequests()]);
        },
    },
    async mounted() {
        await this.initializeData();
    },
    components: {
        User,
        ServiceRequestCard,
        ServiceCard,
    },
};