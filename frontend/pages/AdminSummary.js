export default {
  template: `
    <div class="summary_Card_Chart_Container">
      <div class="summary-cards summary_cards_Dupli2">
        <div class="card">
          <h2>Total Users</h2>
          <p>{{ totalUsers }}</p>
        </div>
        <div class="card">
          <h2>Total Services</h2>
          <p>{{ totalServices }}</p>
        </div>
        <div class="card">
          <h2>Total Service Requests</h2>
          <p>{{ totalRequests }}</p>
        </div>
      </div>
  
      <div class="charts chartsDupli2">
        <div class="updateChartSizeAdmin">
          <h3>Users by Role</h3>
          <canvas ref="userRoleChart"></canvas>
        </div>
        <div class="updateGraphSizeAdmin">
          <h3>Service Requests by Status</h3>
          <canvas ref="serviceStatusChart"></canvas>
        </div>
        <div class="updateGraphSizeAdmin">
          <h3>Service Requests per Service</h3>
          <canvas ref="serviceRequestPerServiceChart"></canvas>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      totalUsers: 0,
      totalServices: 0,
      totalRequests: 0,
      roleCounts: {}, // To store user role distribution
      statusCounts: {}, // To store request status distribution
      serviceRequestCounts: {}, // To store service request counts by service
    };
  },

  mounted() {
    this.fetchSummaryData();
  },

  methods: {
    async fetchSummaryData() {
      try {
        const token = this.$store.state.auth_token;

        // Fetch total users
        const usersResponse = await fetch(location.origin + '/api/users', {
          headers: { 'Authentication-Token': token },
        });

        if (!usersResponse.ok) {
          throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
        }

        const users = await usersResponse.json();
        this.totalUsers = users.length;

        // Calculate role counts
        this.roleCounts = users.reduce((acc, user) => {
          user.roles.forEach((role) => {
            acc[role] = (acc[role] || 0) + 1;
          });
          return acc;
        }, {});

        // Fetch total services
        const servicesResponse = await fetch(location.origin + '/api/services', {
          headers: { 'Authentication-Token': token },
        });

        if (!servicesResponse.ok) {
          throw new Error(`Failed to fetch services: ${servicesResponse.statusText}`);
        }

        const services = await servicesResponse.json();
        this.totalServices = services.length;

        // Fetch total service requests
        const requestsResponse = await fetch(location.origin + '/api/service_requests', {
          headers: { 'Authentication-Token': token },
        });

        if (!requestsResponse.ok) {
          throw new Error(`Failed to fetch service requests: ${requestsResponse.statusText}`);
        }

        const requests = await requestsResponse.json();
        this.totalRequests = requests.length;

        // Calculate status counts
        this.statusCounts = requests.reduce((acc, request) => {
          acc[request.service_status] = (acc[request.service_status] || 0) + 1;
          return acc;
        }, {});

        // Calculate service request counts by service
        this.serviceRequestCounts = requests.reduce((acc, request) => {
          acc[request.service_id] = (acc[request.service_id] || 0) + 1;
          return acc;
        }, {});

        // Render charts
        this.renderCharts(services);

      } catch (error) {
        console.error('Error fetching summary data:', error);
      }
    },

    renderCharts(services) {
      const userRoleCanvas = this.$refs.userRoleChart;
      const serviceStatusCanvas = this.$refs.serviceStatusChart;
      const serviceRequestPerServiceCanvas = this.$refs.serviceRequestPerServiceChart;

      // Users by Role Chart
      if (userRoleCanvas) {
        const userRoleData = {
          labels: Object.keys(this.roleCounts),
          datasets: [
            {
              label: 'Users by Role',
              data: Object.values(this.roleCounts),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
          ],
        };

        new Chart(userRoleCanvas, {
          type: 'pie',
          data: userRoleData,
        });
      }

      // Service Requests by Status Chart
      if (serviceStatusCanvas) {
        const serviceStatusData = {
          labels: Object.keys(this.statusCounts),
          datasets: [
            {
              label: 'Service Requests by Status',
              data: Object.values(this.statusCounts),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
          ],
        };

        new Chart(serviceStatusCanvas, {
          type: 'bar',
          data: serviceStatusData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          },
        });
      }

      // Service Requests per Service Chart
      if (serviceRequestPerServiceCanvas) {
        const serviceRequestData = {
          labels: services.map((service) => service.name), // Use service names for labels
          datasets: [
            {
              label: 'Service Requests per Service',
              data: services.map((service) => this.serviceRequestCounts[service.id] || 0),
              backgroundColor: '#36A2EB',
            },
          ],
        };

        new Chart(serviceRequestPerServiceCanvas, {
          type: 'bar',
          data: serviceRequestData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    },
  },
};
