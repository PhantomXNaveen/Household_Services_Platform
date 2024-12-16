export default {
    template: `
      <div>
  
        <div class="charts mt-5">
          <div class="updateGraphSize">
            <h3>Service Requests by Status</h3>
            <canvas ref="serviceStatusChart"></canvas>
          </div>
          <div class="summary-cards">
            <div class="card makeCardCenter">
              <h2>Total Service Requests</h2>
              <p>{{ totalRequests }}</p>
            </div>
          </div>
          <div class="mt-5 updateChartSize">
            <h3>Assigned Professionals</h3>
            <canvas ref="professionalChart"></canvas>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        totalRequests: 0,
        statusCounts: {}, // Distribution of service request statuses
        professionalCounts: {}, // Distribution of assigned professionals
      };
    },
  
    mounted() {
      this.fetchCustomerSummary();
    },
  
    methods: {
      async fetchCustomerSummary() {
        try {
          const token = this.$store.state.auth_token;
  
          // Fetch service requests for the logged-in customer
          const response = await fetch(location.origin + '/api/service_requests', {
            headers: { 'Authentication-Token': token },
          });
  
          if (!response.ok) {
            throw new Error(`Failed to fetch service requests: ${response.statusText}`);
          }
  
          const serviceRequests = await response.json();
  
          // Update total service requests
          this.totalRequests = serviceRequests.length;
  
          // Calculate service request statuses
          this.statusCounts = serviceRequests.reduce((counts, request) => {
            counts[request.service_status] = (counts[request.service_status] || 0) + 1;
            return counts;
          }, {});
  
          // Calculate professional assignment counts
          this.professionalCounts = serviceRequests.reduce((counts, request) => {
            const professionalId = request.professional_name || 'Unassigned';
            counts[professionalId] = (counts[professionalId] || 0) + 1;
            return counts;
          }, {});
  
          // Render the charts
          this.renderCharts();
        } catch (error) {
          console.error('Error fetching customer summary:', error);
        }
      },
  
      renderCharts() {
        // Service Requests by Status
        const statusChartCtx = this.$refs.serviceStatusChart.getContext('2d');
        const statusLabels = Object.keys(this.statusCounts);
        const statusData = Object.values(this.statusCounts);
  
        new Chart(statusChartCtx, {
          type: 'bar',
          data: {
            labels: statusLabels,
            datasets: [
              {
                label: 'Service Requests by Status',
                data: statusData,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: { title: { display: true, text: 'Status' } },
              y: { title: { display: true, text: 'Count' }, beginAtZero: true },
            },
          },
        });
  
        // Assigned Professionals
        const professionalChartCtx = this.$refs.professionalChart.getContext('2d');
        const professionalLabels = Object.keys(this.professionalCounts);
        const professionalData = Object.values(this.professionalCounts);
  
        new Chart(professionalChartCtx, {
          type: 'pie',
          data: {
            labels: professionalLabels,
            datasets: [
              {
                label: 'Assigned Professionals',
                data: professionalData,
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF',
                  '#FF9F40',
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
            },
          },
        });
      },
    },
  };
  