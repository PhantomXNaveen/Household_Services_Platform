export default {
  props: ['id'], // Accepts the service_request ID as a prop
  template: `
    <div class="service-request-container" style="padding:5px 20px; border:1px solid black; margin:5px 20px;">
      <h1 class="service-title">{{ service_request.service_name }}</h1>
      
      <div class="service-request-section">
        <p><strong>Id:</strong> {{ service_request.id }}</p>
        <p><strong>Professional Name:</strong> {{ service_request.professional_name }}</p>
        <p><strong>Customer Name:</strong> {{ service_request.customer_name }}</p>
        <p><strong>Service ID:</strong> {{ service_request.service_id }}</p>
        <p><strong>Customer ID:</strong> {{ service_request.customer_id }}</p>
        <p><strong>Professional ID:</strong> {{ service_request.professional_id }}</p>
        <p><strong>Date of Request:</strong> {{ service_request.date_of_request }}</p>
        <p><strong>Date of Completion:</strong> {{ service_request.date_of_completion }}</p>
        <p><strong>Service Status:</strong> {{ service_request.service_status }}</p>
        <p><strong>Rating:</strong> {{ service_request.rating }}</p>
        <p><strong>Customer Phone:</strong> {{ service_request.customer_phone }}</p>
        <p><strong>Customer Msg:</strong> {{ service_request.customer_msg }}</p>
      </div>
    </div>
  `,
  data() {
    return {
      service_request: {}, // Object to hold the service_request details
    };
  },
  async mounted() {
    try {
      const res = await fetch(`${location.origin}/api/service_request/${this.id}`, {
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });

      if (res.ok) {
        this.service_request = await res.json(); // Assign to the correct property
      } else {
        console.error(`Failed to fetch service request details: ${res.status}`);
      }
    } catch (error) {
      console.error('Error fetching service request details:', error);
    }
  },
  style: `
    .service-request-container {
      font-family: Arial, sans-serif;
      max-width: 700px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: red;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .service-title {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }

    .service-request-section {
      max-height: 400px;
      overflow-y: auto;
      padding: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .service-request-section p {
      margin: 12px 0;
      font-size: 16px;
      color: #555;
    }

    .service-request-section p strong {
      color: #333;
      font-weight: bold;
    }
  `
};
