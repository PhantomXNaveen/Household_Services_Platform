from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal, marshal_with, reqparse
from flask_security import auth_required, current_user
from backend.models import Service, ServiceRequest, User ,Role, db
from datetime import datetime, timezone

cache = app.cache

api = Api(prefix='/api')

# Fields for marshaling the response data
service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'base_price': fields.Float,
    'time_required': fields.Integer,
    'description': fields.String,
}


service_request_fields = {
    'id': fields.Integer,
    'service_id': fields.Integer,
    'service_name': fields.String(attribute=lambda x: x.service.name if x.service else None),
    'professional_name': fields.String(attribute=lambda x: x.professional.name if x.professional else "Unassigned"),
    'customer_name': fields.String(attribute=lambda x: x.customer.name if x.customer else "Unknown Customer"),
    'customer_id': fields.Integer,
    'professional_id': fields.Integer,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'service_status': fields.String,
    'remarks': fields.String,
    'rating': fields.Integer,
    'customer_phone': fields.String,
    'customer_msg': fields.String,
}


user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
    'description': fields.String,
    'experience': fields.Integer,
    'address': fields.String,
    'pin_code': fields.String,
    'service_id': fields.Integer,
    'active': fields.Boolean,
    'permission': fields.Boolean,
    'roles': fields.List(fields.String, attribute=lambda user: [role.name for role in user.roles])  # Custom attribute to extract role names
}


class UserAPI(Resource):
    # Fetch , delete and update of one user
    @auth_required('token')
    @marshal_with(user_fields)
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        return user

    @auth_required('token')
    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        if user.id == current_user.id:
            db.session.delete(user)
            db.session.commit()
            return {"message": "User deleted successfully"}, 200
        else:
            return {"message": "Not authorized to delete this user"}, 403

    @auth_required('token')
    def put(self, user_id):
        data = request.get_json()
        user = User.query.get(user_id)

        if not user:
            return {"message": "User not found"}, 404

        if current_user.id != user_id and 'Admin' not in [role.name for role in current_user.roles]:
            return {"message": "Not authorized to update this profile"}, 403

        try:
            # Update fields based on input data
            user.name = data.get('name', user.name)
            user.address = data.get('address', user.address)
            user.pin_code = data.get('pin_code', user.pin_code)
            user.service_id = data.get('service_id', user.service_id)
            user.experience = data.get('experience', user.experience)
            user.description = data.get('description', user.description)
            user.permission = data.get('permission', user.permission)
            user.active = data.get('active', user.active)

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500

        return marshal(user, user_fields), 200

class UserListAPI(Resource):
    # Fetch all and create one
    @auth_required('token')
    @marshal_with(user_fields)
    def get(self):
        users = User.query.offset(1).all()
        return users

    @auth_required('token')
    def post(self):
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {"message": "Not authorized to create a user"}, 403

        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return {"message": "Email and password are required"}, 400

        user = User(email=email, password=password)
        db.session.add(user)
        db.session.commit()

        return {"message": "User created successfully"}, 201

class ServiceAPI(Resource):
    # Two methods       ->Fetch and Delete of Single Service
    @auth_required('token')
    @marshal_with(service_fields)
    def get(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404
        return service

    @auth_required('token')
    def delete(self, service_id):
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {"message": "Not authorized to delete this service"}, 403

        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        # Delete all service requests associated with the service
        service_requests = ServiceRequest.query.filter_by(service_id=service_id).all()
        for request in service_requests:
            db.session.delete(request)

        # Now delete the service
        db.session.delete(service)
        db.session.commit()

        return {"message": "Service and associated service requests deleted successfully"}, 200

    
    # Update a single service
    @auth_required('token')
    def put(self, service_id):  # Add `service_id` to method signature
        if not service_id:
            return {"message": "Service ID is required"}, 400

        if 'Admin' not in [role.name for role in current_user.roles]:
            return {"message": "Not authorized to edit this service"}, 403

        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        data = request.get_json()

        # Update fields if provided
        if 'name' in data:
            service.name = data['name']
        if 'base_price' in data:
            service.base_price = data['base_price']
        if 'time_required' in data:
            service.time_required = data['time_required']
        if 'description' in data:
            service.description = data['description']

        db.session.commit()
        return {"message": "Service updated successfully"}, 200


class ServiceListAPI(Resource):
        # Two Methods       ->  Fetch for All services and Post/Create of One Service
    @marshal_with(service_fields)
    @cache.cached(timeout=1)
    def get(self):
        services = Service.query.all()
        return services

    @auth_required('token')
    def post(self):
        if 'Admin' not in [role.name for role in current_user.roles]:
            return {"message": "Not authorized to create a service"}, 403

        data = request.get_json()
        name = data.get('name')
        base_price = data.get('base_price')
        time_required = data.get('time_required')
        description = data.get('description')

        if not all([name, base_price, time_required, description]):
            return {"message": "Missing required fields"}, 400

        service = Service(name=name, base_price=base_price, time_required=time_required, description=description)
        db.session.add(service)
        db.session.commit()

        return {"message": "Service created successfully"}, 201



class ServiceRequestAPI(Resource):
        # Three Methods         -> Fetch ,Updation and Deletion of One Service Request
    @auth_required('token')
    @marshal_with(service_request_fields)
    def get(self, service_request_id):
        """
        Get a specific service request by its ID.
        """
        service_request = ServiceRequest.query.get(service_request_id)
        if not service_request:
            return {"message": "Service request not found"}, 404
        return service_request

    @auth_required('token')
    def delete(self, service_request_id):
        """
        Delete a service request if the user is an admin.
        """
        service_request = ServiceRequest.query.get(service_request_id)
        if not service_request:
            return {"message": "Service request not found"}, 404

        if 'Admin' in [role.name for role in current_user.roles]:
            db.session.delete(service_request)
            db.session.commit()
            return {"message": "Service request deleted successfully"}, 200
        else:
            return {"message": "Not authorized to delete this service request"}, 403

    @auth_required('token')
    def put(self, service_request_id):
        """
        Update the status of a service request (e.g., accept/reject by professional, close by customer).
        """
        service_request = ServiceRequest.query.get(service_request_id)
        if not service_request:
            return {"message": "Service request not found"}, 404

        data = request.get_json()
        service_status = data.get('service_status')

        # Professionals can accept or reject requests
        if service_request.professional_id == current_user.id:
            if service_status == 'accepted':  # Professional accepts the request
                service_request.service_status = 'accepted'
            elif service_status == 'rejected':  # Professional rejects the request
                service_request.service_status = 'rejected'
            elif service_status == 'closed':  # Professional rejects the request
                service_request.service_status = 'closed'
                service_request.date_of_completion = datetime.now(timezone.utc)
            else:
                return {"message": "Invalid status for professional action"}, 400

        # Customers can close the request with feedback
        elif service_request.customer_id == current_user.id:
            if service_status == 'accepted':  # Customer closes the request
                remarks = data.get('remarks')
                rating = data.get('rating')
                customer_phone = data.get('customer_phone')
                customer_msg = data.get('customer_msg')

                if not remarks or not customer_phone:
                    return {
                        "message": "Valid remarks, rating (1-5), and phone number are required to close the request."
                    }, 400

                service_request.service_status = 'closed'
                service_request.date_of_completion = datetime.now(timezone.utc)
                service_request.remarks = remarks
                service_request.rating = rating
                service_request.customer_phone = customer_phone
                service_request.customer_msg = customer_msg
            else:
                return {"message": "Invalid status for customer action"}, 400
        else:
            return {"message": "Not authorized to update this service request"}, 403

        db.session.commit()
        return {"message": "Service request updated successfully"}, 200



class ServiceRequestListAPI(Resource):
    # Two Methods                   -> Fetching of All Service requests and Creation of one Service request 
    @auth_required('token')
    @marshal_with(service_request_fields)
    def get(self):
        """
        Get all service requests.
        """
        service_requests = ServiceRequest.query.all()
        return service_requests

    @auth_required('token')
    def post(self):
        """
        Create a new service request (Only Customer can create service requests).
        """
        # Check if the current user is a Customer
        if 'Customer' not in [role.name for role in current_user.roles]:
            return {"message": "Not authorized to create a service request"}, 403

        data = request.get_json()

        # Validate required fields
        service_id = data.get('service_id')
        professional_id = data.get('professional_id')

        if not service_id:
            return {"message": "Service ID is required"}, 400
        if not professional_id:
            return {"message": "Professional ID is required"}, 400

        # Check if the service exists
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        # Create the service request
        service_request = ServiceRequest(
            service_id=service_id,
            customer_id=current_user.id,
            professional_id=professional_id,
            service_status='requested'  # Default status
        )

        # Save the service request
        try:
            db.session.add(service_request)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating service request", "error": str(e)}, 500

        return {
            "message": "Service request created successfully",
            "service_request_id": service_request.id
        }, 201
    
# Adding the resources to the API

api.add_resource(ServiceListAPI, '/services')
api.add_resource(ServiceAPI, '/services/<int:service_id>')

api.add_resource(ServiceRequestListAPI, '/service_requests')
api.add_resource(ServiceRequestAPI, '/service_request/<int:service_request_id>')

api.add_resource(UserAPI, '/users/<int:user_id>')
api.add_resource(UserListAPI, '/users')


