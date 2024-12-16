export default {
    props: ['id'], // Accepts the service ID from the route Accepts the service ID as a prop
    template: `
      <div style="padding:5px 20px; border:1px solid black; margin:5px 20px;">
          <h1>{{ service.name }}</h1>
          <p>ID: ₹{{ service.id }}</p>
          <p>Price: ₹{{ service.base_price }}</p>
          <p>Time Required: {{ service.time_required }} minutes</p>
          <p>Description: {{ service.description }}</p>
      </div>
    `,
    data() {
      return {
        service: {}, // Object to hold the service details
      };
    },
    async mounted() {
      try {
        const res = await fetch(`${location.origin}/api/services/${this.id}`, {
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
  
        if (res.ok) {
          this.service = await res.json();
        } else {
          console.error(`Failed to fetch service details: ${res.status}`);
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
      }
    },
  };
  