export default {
  props: ['services_requests'],
  template: `
    <div class="container mt-4">
      <table class="table table-striped shadow-sm">
        <thead class="bg-primary text-light">
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Status</th>
            <th>Customer Name</th>
            <th>Professional Name</th>
            <th>
              <template v-if="$store.state.role === 'Customer'">Status</template>
              <template v-else>Actions</template>
            </th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="services_request in services_requests" :key="services_request.id">
          <td>{{ services_request.id }}</td>
          <td 
            @click="$router.push('/service_request/' + services_request.id)" 
            class="text-primary" 
            style="cursor: pointer;"
          >
            {{ services_request.service_name }}
          </td>
          <td>{{ services_request.service_status }}</td>
          <td>{{ services_request.customer_name }}</td>
          <td>{{ services_request.professional_name }}</td>
          <td>
            <!-- Customer Actions -->
            <template v-if="$store.state.role === 'Customer'">
              <div>
                <template v-if="services_request.service_status === 'accepted'">
                  <button>Close</button>
                </template>
                <template v-else>
                  {{ services_request.service_status }}
                </template>
              </div>
            </template>
            
            <!-- Service Professional Actions -->
            <template v-else-if="$store.state.role === 'Service Professional'">
              <div>
                <!-- Request Status Actions -->
                <template v-if="services_request.service_status === 'requested'">
                  <button class="btn btn-info btn-sm" @click="updateStatus('accepted', services_request.id)">
                    Accept
                  </button>
                  <button class="btn btn-info btn-sm" @click="updateStatus('rejected', services_request.id)">
                    Reject
                  </button>
                </template>
                <!-- Closed Status Actions -->
                <template v-else>
                  <button v-if="services_request.service_status !== 'closed'" class="btn btn-info btn-sm" @click="updateStatus('closed', services_request.id)">
                    Close
                  </button>
                  <button v-else class="btn btn-info btn-sm" @click="download()">
                    Download
                  </button>
                </template>
              </div>
            </template>
      
            <!-- Admin or Other Role Actions -->
            <template v-else>
              <button 
                class="btn btn-info btn-sm" 
                @click="viewDetails(services_request.service_id)"
              >
                Flag
              </button>
            </template>
          </td>
        </tr>
      </tbody>
      
      </table>
    </div>
  `,
  methods: {
    viewDetails(id) {
      this.$router.push(`/service_request/${id}`);
    },
    async updateStatus(status, service_request_id){
      try {
        const response = await fetch(`/api/service_request/${service_request_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify({"service_status":status}),
        });
        window.location.reload();
        if (response.ok) {
            const x = await response.json();
            console.log(x);
    
        } else {
            const errorData = await response.json();
            this.errorMessage = errorData.message || 'Failed to update status.';
        }
      } catch (error) {
          this.errorMessage = 'An error occurred while adding the service.';
      }
    },
    
    
  },
  
  mounted() {
    // Inject styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
      .table {
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .table th, .table td {
        vertical-align: middle;
      }
      .table tbody tr:hover {
        background-color: #f1f1f1;
      }
    `;
    document.head.appendChild(style);
  },
};
