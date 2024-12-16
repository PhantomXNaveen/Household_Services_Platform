export default {
    template: `
      <div class="summary_Card_Chart_Container">
    
    
        <div class="summary-cards summary_cards_Dupli1">
          <div class="card">
            <h2>Total Service Requests</h2>
            <p>{{ totalRequests }}</p>
          </div>
          <div class="card">
            <h2>Accepted Requests</h2>
            <p>{{ acceptedRequests }}</p>
          </div>
          <div class="card">
            <h2>Rejected Requests</h2>
            <p>{{ rejectedRequests }}</p>
          </div>
          <div class="card">
            <h2>Closed Requests</h2>
            <p>{{ closedRequests }}</p>
          </div>
        </div>
    
        <div class="charts mt-5 chartsDupli1">
          <div>
            <h3>Requests by Status</h3>
            <canvas ref="serviceStatusChart"></canvas>
          </div>
          <div class="mt-5">
            <div>
              <h3>Ratings Distribution</h3>
              <canvas ref="ratingChart"></canvas>
            </div>
            <div>
              <div class="card makeCardCenter">
                <h2 class="makeCardCenter">Average Rating</h2>
                <p class="makeCardCenter">{{ averageRating.toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <div class="mt-5 updateChartSize">
            <h3>Customer Requests Summary</h3>
            <canvas ref="customerRequestChart"></canvas>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        totalRequests: 0,
        acceptedRequests: 0,
        rejectedRequests: 0,
        closedRequests: 0,
        averageRating: 0,  // Average rating of all requests
        statusCounts: {}, // Distribution of request statuses
        customerRequestCounts: {}, // Track requests by each customer
        ratings: [], // List of ratings for each request
      };
    },
  
    mounted() {
      this.fetchProfessionalSummary();
    },
  
    methods: {
      async fetchProfessionalSummary() {
        try {
          const token = this.$store.state.auth_token;
          const loggedInProfessionalId = this.$store.state.user_id; // Get the logged-in professional's ID
    
          // Fetch service requests for the logged-in professional
          const requestsResponse = await fetch(location.origin + '/api/service_requests', {
            headers: { 'Authentication-Token': token },
          });
    
          if (!requestsResponse.ok) {
            throw new Error(`Failed to fetch service requests: ${requestsResponse.statusText}`);
          }
    
          const serviceRequests = await requestsResponse.json();
    
          // Filter service requests for the logged-in professional's customers
          const professionalRequests = serviceRequests.filter(
            (req) => req.professional_id === loggedInProfessionalId
          );
    
          // Calculate total, accepted, rejected, and closed requests
          this.totalRequests = professionalRequests.length;
          this.acceptedRequests = professionalRequests.filter(req => req.service_status === 'accepted').length;
          this.rejectedRequests = professionalRequests.filter(req => req.service_status === 'rejected').length;
          this.closedRequests = professionalRequests.filter(req => req.service_status === 'closed').length;
    
          // Calculate service request statuses
          this.statusCounts = professionalRequests.reduce((counts, request) => {
            counts[request.service_status] = (counts[request.service_status] || 0) + 1;
            return counts;
          }, {});
    
          // Count requests by customer
          this.customerRequestCounts = professionalRequests.reduce((counts, request) => {
            const customerId = request.customer_name || request.customerId;
            counts[customerId] = (counts[customerId] || 0) + 1;
            return counts;
          }, {});
    
         // Extract ratings and calculate average (only non-zero ratings)
          this.ratings = professionalRequests.map(req => req.rating).filter(rating => rating > 0); // Filter out zero ratings
          this.averageRating = this.ratings.length > 0 
            ? this.ratings.reduce((sum, rating) => sum + rating, 0) / this.ratings.length 
            : 0;
          // Render the charts
          this.renderCharts();
        } catch (error) {
          console.error('Error fetching professional summary:', error);
        }
      },
    
  
      renderCharts() {
        // Requests by Status
        const statusChartCtx = this.$refs.serviceStatusChart.getContext('2d');
        const statusLabels = Object.keys(this.statusCounts);
        const statusData = Object.values(this.statusCounts);
  
        new Chart(statusChartCtx, {
          type: 'bar',
          data: {
            labels: statusLabels,
            datasets: [
              {
                label: 'Requests by Status',
                data: statusData,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
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
  
        // Customer Request Summary
        const customerChartCtx = this.$refs.customerRequestChart.getContext('2d');
        const customerLabels = Object.keys(this.customerRequestCounts);
        const customerData = Object.values(this.customerRequestCounts);
  
        new Chart(customerChartCtx, {
          type: 'pie',
          data: {
            labels: customerLabels,
            datasets: [
              {
                label: 'Customer Requests',
                data: customerData,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
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
  
        // Ratings Distribution
        const ratingChartCtx = this.$refs.ratingChart.getContext('2d');
        const ratingDistribution = [0, 0, 0, 0, 0]; // Track the count for each rating (1 to 5)
        
        this.ratings.forEach(rating => {
          ratingDistribution[rating - 1] += 1;
        });
  
        new Chart(ratingChartCtx, {
          type: 'bar',
          data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [
              {
                label: 'Ratings Distribution',
                data: ratingDistribution,
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
              x: { title: { display: true, text: 'Rating' } },
              y: { title: { display: true, text: 'Count' }, beginAtZero: true },
            },
          },
        });
      },
    },
  };
  