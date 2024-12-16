export default {
  props: ['services_requests'],
  template: `
    <div class="container mt-4">
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>


      <!-- Filters -->
      <div class="d-flex justify-content-between align-items-center mb-3" v-if="this.$route.path === '/professionalSearch' || 'adminSearch'" v-if="this.$route.path !== '/professional'">
        <div>
          <label for="statusFilter" class="form-label">Filter by Status</label>
          <select 
            id="statusFilter" 
            class="form-select" 
            v-model="filters.status"
            @change="applyFilters"
          >
            <option value="">All</option>
            <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div v-if="this.$route.path === '/professionalSearch'">
          <label for="customerFilter" class="form-label">Filter by Customer Name</label>
          <input 
            id="customerFilter" 
            type="text" 
            class="form-control" 
            v-model="filters.customerName"
            @input="applyFilters"
            placeholder="Enter customer name"
          />
        </div>
      </div>


      <table class="table table-striped shadow-sm">
        <thead class="bg-primary text-light">
          <tr>
            <th>ID</th>
            <th>Service Name</th>
            <th>Customer Name</th>
            <th>Professional Name</th>
            <th>Status</th>      
          </tr>
        </thead>
        <tbody>
        <tr v-for="services_request in filteredRequests" :key="services_request.id">
          <td>{{ services_request.id }}</td>
          <td 
            @click="$router.push('/service_request/' + services_request.id)" 
            class="text-primary" 
            style="cursor: pointer;"
          >
            {{ services_request.service_name }}
          </td>
          <td>{{ services_request.customer_name }}</td>
          <td>{{ services_request.professional_name }}</td>
          <td>
            <!-- Customer Actions -->
            <template v-if="$store.state.role === 'Customer'">
              <div>
                <template v-if="services_request.service_status === 'accepted'">
                  <button class="btn btn-success mt-3" data-bs-toggle="modal" data-bs-target="#editRequestModal" @click="giveCustomerId(services_request.id)">Close</button>
                </template>
                <template v-else>
                  {{ services_request.service_status }}
                </template>
              </div>
            </template>
            <template v-else-if="$store.state.role === 'Admin'">
                  {{ services_request.service_status }}
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
                  <button class="btn btn-info btn-sm" @click="$router.push('/service_request/' + services_request.id)">
                    View
                  </button>
                </template>
              </div>
            </template>
      
          </td>
        </tr>

        </tbody>
        <!-- Modal -->
        <div class="modal fade" id="editRequestModal" tabindex="-1" aria-labelledby="editRequestModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editRequestModalLabel">Request Closure</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <div class="form-group mb-3">
                <label for="rating">Rating</label>
                <input type="number" class="form-control" id="rating" v-model="form.rating" />
              </div>
              <div class="form-group mb-3">
                <label for="remarks">Remarks</label>
                <input type="string" class="form-control" id="remarks" v-model="form.remarks" />
              </div>
              <div class="form-group mb-3">
                <label for="customer_phone">Phone Number</label>
                <input type="number" class="form-control" id="customer_phone" v-model="form.customer_phone" />
              </div>
              <div class="form-group mb-3">
                <label for="cutomer_msg">Message</label>
                <input type="text" class="form-control" id="cutomer_msg" v-model="form.cutomer_msg" />
              </div>            
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Back</button>
              <button type="button" class="btn btn-primary" @click="closeRequest()">Close Request</button>
            </div>
          </div>
        </div>
        </div>
      </table>
    </div>
  `,
  computed: {
    // Get unique statuses for the dropdown
    uniqueStatuses() {
      return [...new Set(this.services_requests.map(request => request.service_status))];
    },
    // Filtered requests based on selected filters
    filteredRequests() {
      return this.services_requests.filter(request => {
        const matchesStatus = this.filters.status
          ? request.service_status === this.filters.status
          : true;
        const matchesCustomerName = this.filters.customerName
          ? request.customer_name
              .toLowerCase()
              .includes(this.filters.customerName.toLowerCase())
          : true;
        return matchesStatus && matchesCustomerName;
      });
    },
  },
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
    async closeRequest(id){
      try {
        // Reset both messages before sending the request
        this.errorMessage = null;
        this.successMessage = null;

        const response = await fetch(`/api/service_request/${this.idx}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({"remarks":this.form.remarks,
            "customer_phone": Number(this.form.customer_phone),
            "customer_msg": this.form.customer_msg,
            "rating": Number(this.form.rating),
            "service_status":this.form.service_status}),
        });
        
        if (response.ok) {
          const updatedRequest = await response.json();
          this.request = { ...updatedRequest };
    
          // Show success message and hide modal
          this.successMessage = 'Request Closed successfully!';
          setTimeout(()=>{
            window.location.reload();
          }, 500);
          const modal = bootstrap.Modal.getInstance(document.getElementById('editRequestModal'));
          if (modal) modal.hide(); // Ensure modal is only hidden if instance exists
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.message || 'Failed to update profile.';
          console.error(this.errorMessage);
        }
      } catch (error) {
        // Log unexpected errors
        this.errorMessage = 'An unexpected error occurred while closing the request.';
        console.error(this.errorMessage, error);
      }

    },
    giveCustomerId(serviceRequestId){
      this.idx = serviceRequestId;
    },
    applyFilters() {
      // Triggered when filters are updated
    },
    
    
  },
  data() {
    return {
      request: {},
      idx:null,
      form: {
        remarks: '',
        customer_phone: null,
        customer_msg: '',
        rating: null,
        service_status:'accepted'    
      },
      filters: {
        status: '',
        customerName: '',
      },
      errorMessage: null,
      successMessage: null,
    };
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
