from flask import current_app as app, jsonify, render_template, request, send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import Service, db
from datetime import datetime
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult


datastore = app.security.datastore  # Use this instead of userdatastore
cache = app.cache

@app.route('/')
def home():
    return render_template('index.html')

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id' : task.id}


@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message' : 'task not ready'}, 405

@auth_required('token') 
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time': str(datetime.now())}

@app.route('/protected', methods=['GET'])
@auth_required('token')
def protected():
    """
    This is a protected route only accessible by authenticated users.
    """
    return '<h1>Only accessible by authenticated users</h1>'

@app.route('/login', methods=['POST'])
def login():
    """
    Login route using Flask-Security's token authentication.
    """
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if user.verify_and_update_password(password):
        # Generate the authentication token
        token = user.get_auth_token()

        # Return only the first role, if any
        roles = [user.roles[0].name] if user.roles else []

        return jsonify({
            "token": token,
            "email": user.email,
            "roles": roles,
            "id": user.id
        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Extract fields
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    address = data.get('address')
    pin_code = data.get('pin_code')

    # Validate role input
    if role not in ['Customer', 'Service Professional']:
        return jsonify({"message": "Invalid role, must be 'Customer' or 'Service Professional'"}), 400

    # Validate required fields
    if not email or not password or not address or not pin_code:
        return jsonify({"message": "Email, password, address, and pin code are required"}), 400

    # Validate Service Professional-specific fields
    if role == 'Service Professional':
        service_id = data.get('service_id')
        experience = data.get('experience')
        description = data.get('description')
        document = data.get('document')

        if not service_id or not experience or not description :
            return jsonify({"message": "Service ID, experience, and description are required for Service Professionals"}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 409

    # Create new user
    try:
        # Create base user
        new_user = datastore.create_user(
            name=name,
            email=email,
            password=hash_password(password),
            roles=[role],
            address=address,
            pin_code=pin_code,
            active=True
        )

        # Additional setup for Service Professionals
        if role == 'Service Professional':
            service = Service.query.get(service_id)  # Ensure the service exists
            if not service:
                return jsonify({"message": "Invalid service ID"}), 400

            new_user.service_id = service_id
            new_user.experience = experience
            new_user.description = description
            new_user.document = document

        # Commit to database
        db.session.commit()

        return jsonify({"message": f"{role} created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating user", "error": str(e)}), 500



@app.route('/logout', methods=['POST'])
@auth_required('token')  # Ensure the user is authenticated
def logout():
    """
    This route signals the frontend to clear the user's token. 
    As tokens are stateless, the backend does not invalidate the token directly.
    """
    return jsonify({"message": "Logged out successfully"}), 200

