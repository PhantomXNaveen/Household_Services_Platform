from celery.schedules import crontab
from flask import current_app as app

from backend.celery.tasks import email_reminder, send_daily_reminders, send_monthly_reports

celery_app = app.extensions['celery']


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):

    # daily message at 3:15 pm, everyday
    sender.add_periodic_task(crontab(hour=15, minute=8), email_reminder.s('students@gmail', 'reminder to login', '<h1> hello everyone </h1>'), name='daily reminder' )

    # weekly messages
    sender.add_periodic_task(crontab(hour=15, minute=8, day_of_week='tuesday'), email_reminder.s('students@gmail', 'Reminder to Deadline', '<h1> hello everyone </h1>'), name = 'weekly reminder' )
    
    # weekly messages
    sender.add_periodic_task(crontab(hour=15, minute=8, day_of_month=3), email_reminder.s('students@gmail', 'Reminder to Submit', '<h1> hello everyone </h1>'), name = 'monthly reminder' )

    # Monthly reports
    sender.add_periodic_task(
        crontab(hour=15, minute=3, day_of_month=4),
        send_monthly_reports.s(),
        name="Monthly customer reports"
    )
    # Daily reminders
    sender.add_periodic_task(
        crontab(hour=15, minute=3),
        send_daily_reminders.s(),
        name="Daily reminders for professionals"
    )

