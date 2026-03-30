#!/usr/bin/env python
"""
Seed notifications for users.
Creates notifications for various offer events.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from datetime import timedelta
from django.utils import timezone
from app.models import User, Offer, Notification

print("Seeding notifications...")

# Get all users (excluding admins)
users = User.objects.filter(is_superuser=False, is_staff=False)

# Clear existing notifications
Notification.objects.all().delete()
print("  Cleared existing notifications")

now = timezone.now()
notification_templates = [
    # Alice's notifications
    ('alice', 'Your offer from CapitalOne has been accepted!'),
    ('alice', 'Your offer from LendingClub has been declined.'),
    ('alice', 'New notification: Your shortlisted offer from SoFi is expiring soon.'),
    ('alice', 'New funding alert: CapitalOne just posted a new offer for you!'),
    ('alice', 'Notification: Please review your declined offer from Chase Personal Loans.'),
    
    # Mike's notifications  
    ('mike', 'Your offer from LendingClub has been accepted!'),
    ('mike', 'New notification: Your offer from Chase Personal Loans has been declined.'),
    ('mike', 'New funding alert: LendingClub just posted a new offer for you!'),
    ('mike', 'Notification: Your shortlisted offer from CapitalOne is expiring soon.'),
    ('mike', 'New funding alert: CapitalBank just posted a new offer for you!'),
]

notification_count = 0
for username, message in notification_templates:
    try:
        user = User.objects.get(username=username)
        # Create notification with random time within last 7 days
        notification = Notification.objects.create(
            user=user,
            message=message,
            is_read=False,
            created_at=now - timedelta(hours=(notification_count * 60) % 168)
        )
        notification_count += 1
        print(f'  Created: [{notification.is_read}] "{message}" for {username}')
    except User.DoesNotExist:
        print(f'  User {username} not found, skipping')

print(f"\nTotal notifications created: {notification_count}")
