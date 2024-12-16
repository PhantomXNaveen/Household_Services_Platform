from flask import current_app as app
from backend.models import db, User, Role, Service, ServiceRequest
from flask_security import SQLAlchemyUserDatastore, hash_password
from datetime import datetime

# Initialize the user data store
userdatastore: SQLAlchemyUserDatastore = app.security.datastore

with app.app_context():
    # Create all tables
    db.create_all()

    # Define roles
    roles = [
        {'name': 'Admin', 'description': 'superuser'},
        {'name': 'Customer', 'description': 'general customer'},
        {'name': 'Service Professional', 'description': 'service provider'}
    ]

    # Create roles if they don't exist
    for role_data in roles:
        if not userdatastore.find_role(role_data['name']):
            userdatastore.create_role(name=role_data['name'], description=role_data['description'])

    # Commit roles to the database
    db.session.commit()

    # Create an admin user if not already present
    if not userdatastore.find_user(email='admin@study.iitm.ac.in'):
        admin_user = userdatastore.create_user(
            email='admin@study.iitm.ac.in',
            password=hash_password('pass')
        )
        userdatastore.add_role_to_user(admin_user, 'Admin')

    # Create a test customer user if not already present
    if not userdatastore.find_user(email='customer@study.iitm.ac.in'):
        customer_user = userdatastore.create_user(
            email='customer@study.iitm.ac.in',
            password=hash_password('pass')
        )
        userdatastore.add_role_to_user(customer_user, 'Customer')

    # Add default services if they don't exist
    services = [
        {
            'name': 'AC Servicing',
            'description': 'Air conditioning servicing and maintenance',
            'base_price': 500,
            'time_required': 60
        },
        {
            'name': 'Plumbing',
            'description': 'Plumbing services including pipe and fixture repairs',
            'base_price': 350,
            'time_required': 45
        },
        {
            'name': 'Carpentry',
            'description': 'Woodwork, furniture repairs, and custom carpentry solutions',
            'base_price': 400,
            'time_required': 90
        },
        {
            'name': 'Electrical Repairs',
            'description': 'Electrical fixture repairs, wiring, and installations',
            'base_price': 300,
            'time_required': 60
        },
        {
            'name': 'House Cleaning',
            'description': 'Thorough cleaning services for homes and offices',
            'base_price': 250,
            'time_required': 120
        },
        {
            'name': 'Pest Control',
            'description': 'Eradication and prevention of pests like rodents and insects',
            'base_price': 800,
            'time_required': 75
        },
        {
            'name': 'Gardening',
            'description': 'Lawn mowing, tree trimming, and general garden maintenance',
            'base_price': 600,
            'time_required': 90
        },
        {
            'name': 'Painting',
            'description': 'Interior and exterior painting services for homes and offices',
            'base_price': 1000,
            'time_required': 180
        },
        {
            'name': 'Home Appliance Repair',
            'description': 'Servicing and repairs for refrigerators, washing machines, and more',
            'base_price': 500,
            'time_required': 90
        },
        {
            'name': 'IT Support',
            'description': 'Computer repairs, software installations, and network troubleshooting',
            'base_price': 700,
            'time_required': 60
        },
        {
            'name': 'Car Servicing',
            'description': 'Comprehensive car maintenance and repair services',
            'base_price': 1500,
            'time_required': 120
        },
        {
            'name': 'Event Photography',
            'description': 'Professional photography for events like weddings and parties',
            'base_price': 2000,
            'time_required': 240
        },
        {
            'name': 'Personal Training',
            'description': 'Customized fitness training and diet plans',
            'base_price': 1000,
            'time_required': 60
        },
        {
            'name': 'Tutoring',
            'description': 'Private tutoring services for various subjects and skills',
            'base_price': 400,
            'time_required': 60
        }
    ]


    for service_data in services:
        service = Service.query.filter_by(name=service_data['name']).first()
        if not service:
            # Create the service
            service = Service(name=service_data['name'], description=service_data['description'],
                              base_price=service_data['base_price'], time_required=service_data['time_required'])
            db.session.add(service)

    # Commit all services to the database
    db.session.commit()

    data = [
        {
            "id": 1,
            "service_id": 1,
            "customer_id": 2,
            "professional_id": 3,
            "date_of_request": "2023-12-03T10:15:30",
            "date_of_completion": "2023-12-04T14:30:00",
            "service_status": "accepted",
            "remarks": "The service request was successfully processed.",
            "rating": 5,
            "customer_phone": "+1234567890",
            "customer_msg": "Excellent service! Highly recommended."
        },
        {
            "id": 2,
            "service_id": 1,
            "customer_id": 2,
            "professional_id": 3,
            "date_of_request": "2023-12-01T09:00:00",
            "date_of_completion": "2023-12-04T14:30:00",
            "service_status": "requested",
            "remarks": "Pending acceptance by the professional.",
            "rating": None,
            "customer_phone": "+0987654321",
            "customer_msg": None
        },
        {
            "id": 3,
            "service_id": 1,
            "customer_id": 2,
            "professional_id": 3,
            "date_of_request": "2023-12-02T14:45:15",
            "date_of_completion": "2023-12-03T18:00:00",
            "service_status": "closed",
            "remarks": "Service completed without any issues.",
            "rating": 4,
            "customer_phone": "+1122334455",
            "customer_msg": "Good service, but there’s room for improvement."
        }
    ]




    for service_request in data:
        for entry in data:
            # Check if the ServiceRequest already exists
            existing_request = ServiceRequest.query.get(entry['id'])
            if not existing_request:
                # Create a new ServiceRequest object
                service_request = ServiceRequest(
                    id=entry['id'],
                    service_id=entry['service_id'],
                    customer_id=entry['customer_id'],
                    professional_id=entry['professional_id'],
                    date_of_request=datetime.fromisoformat(entry['date_of_request']),
                    date_of_completion=datetime.fromisoformat(entry['date_of_completion']) if entry['date_of_completion'] else None,
                    service_status=entry['service_status'],
                    remarks=entry['remarks'],
                    rating=entry['rating'],
                    customer_phone=entry['customer_phone'],
                    customer_msg=entry['customer_msg']
                )
                # Add to the session
                db.session.add(service_request)

    # Commit all changes to the database
    db.session.commit()

    # Create a test service professional if not already present
    if not userdatastore.find_user(email='professional@study.iitm.ac.in'):
        professional_user = userdatastore.create_user(
            email='professional@study.iitm.ac.in',
            password=hash_password('pass')
        )
        userdatastore.add_role_to_user(professional_user, 'Service Professional')

        # Assign a specific service to the service professional
        ac_servicing = Service.query.filter_by(name='AC Servicing').first()
        if ac_servicing:
            professional_user.service_id = ac_servicing.id
            db.session.commit()


    # Create a sample service request
    if not ServiceRequest.query.first():  # Check if service requests already exist
        customer = User.query.filter_by(email='customer@study.iitm.ac.in').first()
        professional = User.query.filter_by(email='professional@study.iitm.ac.in').first()
        ac_servicing = Service.query.filter_by(name='AC Servicing').first()

        if customer and professional and ac_servicing:
            service_request = ServiceRequest(
                service_id=ac_servicing.id,
                customer_id=customer.id,
                professional_id=professional.id,
                date_of_request=db.func.current_timestamp(),
                service_status='requested',
                remarks='Initial service request for testing'
            )
            db.session.add(service_request)

    # Commit all changes to the database
    db.session.commit()
