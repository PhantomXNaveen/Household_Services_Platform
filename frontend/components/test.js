export default {
  template: `
    <div class="container mt-5">
      <!-- Filter Users by Role and Name -->
      <div v-if="$store.state.role === 'Admin'" class="mb-4 row">
        <div class="col-md-6">
          <label for="roleFilter" class="form-label">Filter by Role</label>
          <select id="roleFilter" class="form-select" v-model="selectedRole" @change="filterUsers">
            <option value="">Select Role</option>
            <option value="Customer">Customer</option>
            <option value="Service Professional">Professional</option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="nameQuery" class="form-label">Search by Name</label>
          <div class="input-group">
            <input
              id="nameQuery"
              type="text"
              class="form-control"
              placeholder="Enter name"
              v-model="nameQuery"
            />
            <button class="btn btn-primary" @click="filterUsers">Search</button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div>
        <h3 class="mb-4">Users</h3>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
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
              <th>Actions</th>
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
              <td>{{ user.experience || 'N/A' }}</td>
              <td>{{ user.permission || 'N/A' }}</td>
              <td>{{ user.roles.join(', ') }}</td>
              <td>
                <button class="btn btn-info btn-sm" @click="editUser(user)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit User Modal -->
      <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <form @submit.prevent="updateUser">
                <div class="form-group mb-3">
                  <label for="name">Name</label>
                  <input type="text" class="form-control" id="name" v-model="form.name" required />
                </div>
                <div class="form-group mb-3">
                  <label for="address">Address</label>
                  <input type="text" class="form-control" id="address" v-model="form.address" />
                </div>
                <div class="form-group mb-3">
                  <label for="pin_code">Pin Code</label>
                  <input type="text" class="form-control" id="pin_code" v-model="form.pin_code" />
                </div>
                <div class="form-group mb-3">
                  <label for="service">Service</label>
                  <select class="form-control" id="service" v-model="form.service_id">
                    <option disabled value="">Select a service</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">
                      {{ service.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group mb-3">
                  <label for="experience">Experience (Years)</label>
                  <input type="number" class="form-control" id="experience" v-model="form.experience" />
                </div>
                <div class="form-group mb-3">
                  <label for="permission">Permission</label>
                  <select id="permission" class="form-control" v-model="form.permission">
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                  </select>
                  </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      users: [],
      filteredUsers: [],
      services: [],
      selectedRole: "",
      nameQuery: "", // Default to an empty string
      form: {
        id: null,
        name: "",
        address: "",
        pin_code: "",
        service_id: null,
        experience: null,
        permission: "",
      },
      errorMessage: null,
    };
  },
  async created() {
    try {
      const usersResponse = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });
      if (usersResponse.ok) {
        this.users = await usersResponse.json();


        this.filteredUsers = this.users; // Initialize filteredUsers with all users
      } else {
        this.errorMessage = 'Failed to fetch users.';
      }

      const servicesResponse = await fetch('/api/services', {
        method: 'GET',
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });
      if (servicesResponse.ok) {
        this.services = await servicesResponse.json();
      } else {
        this.errorMessage = 'Failed to fetch services.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred while fetching data.';
    }
  },
  methods: {
    filterUsers() {
      const lowerNameQuery = this.nameQuery ? this.nameQuery.toLowerCase() : "";
      this.filteredUsers = this.users.filter((user) => {
        const userName = user.name ? user.name.toLowerCase() : ""; // Safe access
        const matchesRole = this.selectedRole
          ? user.roles[0].includes(this.selectedRole)
          : true;
        const matchesName = lowerNameQuery
          ? userName.includes(lowerNameQuery)
          : true;
        return matchesRole && matchesName;
      });
    },
    editUser(user) {
      this.form = { ...user };
      const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
      modal.show();
    },
    async updateUser() {
      try {
        const response = await fetch(`/api/users/${this.form.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(this.form),
        });

        if (response.ok) {
          const updatedUser = await response.json();
          this.users = this.users.map((u) =>
            u.id === updatedUser.id ? updatedUser : u
          );
          this.filterUsers(); // Reapply the filter after updating
          const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
          if (modal) modal.hide();
        } else {
          this.errorMessage = 'Failed to update user.';
        }
      } catch (error) {
        this.errorMessage = 'An error occurred while updating the user.';
      }
    },
    getServiceName(serviceId) {
      const service = this.services.find((s) => s.id === serviceId);
      return service ? service.name : 'Unknown Service';
    },
  },
};
