from celery import shared_task
import time
from datetime import datetime, timedelta
import flask_excel
from backend.models import User, ServiceRequest
from backend.celery.mail_service import send_email

@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = User.query.all()

    task_id = self.request.id
    filename = f'user_data_{task_id}.csv'
    column_names = [column.name for column in User.__table__.columns]
    print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)
    
    return filename

@shared_task(ignore_result = True)
def email_reminder(to, subject, content):
    send_email(to, subject, content)

# Task to generate and send monthly reports to customers
@shared_task(ignore_result=False)
def send_monthly_reports():
    one_month_ago = datetime.now() - timedelta(days=30)
    customers = User.query.filter(User.roles.any(name='Customer')).all()

    for customer in customers:
        service_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.date_of_completion >= one_month_ago,
            ServiceRequest.service_status == 'closed'
        ).all()

        if service_requests:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'customer_report_{customer.id}_{timestamp}.csv'
            column_names = ['Service', 'Professional', 'Date of Completion', 'Rating']
            data = [
                {
                    'Service': req.service.name,
                    'Professional': req.professional.name,
                    'Date of Completion': req.date_of_completion.strftime('%Y-%m-%d'),
                    'Rating': req.rating
                }
                for req in service_requests
            ]

            csv_out = flask_excel.make_response_from_records(data, column_names=column_names, file_type='csv')
            filepath = f'./backend/celery/customer-reports/{filename}'
            with open(filepath, 'wb') as file:
                file.write(csv_out.data)

            # Send report via email
            send_email(
                to=customer.email,
                subject="Monthly Service Report",
                content=f"Dear {customer.name},\n\nPlease find your monthly service report attached.\n\nThank you!",
                attachment=filepath
            )
# Task to send daily reminders to professionals
@shared_task(ignore_result=True)
def send_daily_reminders():
    professionals = User.query.filter(User.roles.any(name='Service Professional')).all()

    for professional in professionals:
        pending_requests = ServiceRequest.query.filter(
            ServiceRequest.professional_id == professional.id,
            ServiceRequest.service_status == 'requested'
        ).all()

        if pending_requests:
            content = "<h1>Pending Service Requests</h1><ul>"
            for req in pending_requests:
                content += f"<li>Service: {req.service.name}, Customer: {req.customer.name}, Requested On: {req.date_of_request.strftime('%Y-%m-%d')}</li>"
            content += "</ul>"

            send_email(
                to=professional.email,
                subject="Daily Reminder: Pending Service Requests",
                content=content
            )