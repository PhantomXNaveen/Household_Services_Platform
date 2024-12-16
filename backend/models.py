from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from sqlalchemy import Enum as SQLAlchemyEnum  # General ENUM for other databases


db = SQLAlchemy()

# Association table for many-to-many relationship between users and roles
users_role = db.Table(
    'users_role',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

# Role model
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)  # Role names: 'Admin', 'Service Professional', 'Customer'
    description = db.Column(db.String(255))

# User model (Admin, Customer, Service Professional)
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    # Flask-Security specific fields
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=True)
    permission = db.Column(db.Boolean(),default=False)

    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationship to manage multiple roles, making future additions easy
    roles = db.relationship('Role', secondary=users_role, backref=db.backref('users', lazy='dynamic'))

    name = db.Column(db.String(255))
    address = db.Column(db.String(255))
    pin_code = db.Column(db.String(10))

    # Additional fields for service professionals
    experience = db.Column(db.Integer)  # Experience in years
    description = db.Column(db.String(255))
    document = db.Column(db.String(255), nullable=True)

    # Proficiency in a single service at a time
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=True)
    service = db.relationship('Service', backref=db.backref('professionals', lazy='dynamic'))  # Link to the single service user is proficient in

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    base_price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer)  # In minutes
    description = db.Column(db.String(255))

    # Relationship to service requests using 'back_populates'
    requests = db.relationship('ServiceRequest', back_populates='service', cascade="all, delete", passive_deletes=True)

class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id', ondelete="CASCADE"))
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date_of_request = db.Column(db.DateTime, default=db.func.current_timestamp(), index=True)
    date_of_completion = db.Column(db.DateTime, nullable=True)

    # Restrict status to specific values using Enum
    service_status = db.Column(
        SQLAlchemyEnum('requested', 'accepted', 'rejected', 'closed', name='service_status_enum'),
        default='requested',
        nullable=False,
        index=True
    )
    remarks = db.Column(db.Text, nullable=True, default='')

    # Relationships
    service = db.relationship('Service', back_populates='requests')
    customer = db.relationship('User', foreign_keys=[customer_id], backref=db.backref('service_requests', lazy='dynamic'))
    professional = db.relationship('User', foreign_keys=[professional_id], backref=db.backref('assigned_requests', lazy='dynamic'))

    # Feedback fields
    rating = db.Column(db.Integer, nullable=True)  # Rating scale (1-5)
    customer_phone = db.Column(db.String(20), nullable=True)
    customer_msg = db.Column(db.Text, nullable=True)

