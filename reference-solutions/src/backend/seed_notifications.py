#!/usr/bin/env python3
import os
import sys
import django
import datetime

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from app.models import Lender, Offer, Notification

print("Creating notifications for public and private users...")

# Get all users (public and private)
public_users = [
    User.objects.get(username='alice'),
    User.objects.get(username='mike')
]
private_users = [
    User.objects.get(username='jane'),
    User.objects.get(username='tina')
]
all_users = public_users + private_users

# Get some offers to create notifications from
offers = Offer.objects.all()[:5]

# Lender names for notifications
lenders_list = list(Lender.objects.all())[:5]

# Notification templates for each user
notification_templates = {
    'alice': [
        ('Your offer from CapitalOne has been accepted!', 'accepted'),
        ('Your offer from LendingClub has been declined.', 'declined'),
        ('CapitalOne has a new offer for you!', 'new'),
        ('LendingClub has updated their offer terms.', 'new'),
        ('Your shortlisted offer from Chase Personal Loans has received a notification.', 'new'),
    ],
    'mike': [
        ('Your offer from Bank of America has been accepted!', 'accepted'),
        ('Chase Personal Loans has sent you a new offer.', 'new'),
        ('Your shortlisted offer has been updated.', 'new'),
        ('PrimeLending has modified their interest rate.', 'new'),
        ('Federal Credit Union sent you a new opportunity.', 'new'),
    ],
    'jane': [
        ('Your offer from PrivateLend has been accepted!', 'accepted'),
        ('EliteCapital has sent you a new offer.', 'new'),
        ('Your offer from PremierFinance has been declined.', 'declined'),
        ('PrivateLend has updated their loan terms.', 'new'),
        ('EliteCapital has a new exclusive offer for you!', 'new'),
    ],
    'tina': [
        ('Your offer from EliteCapital has been accepted!', 'accepted'),
        ('PremierFinance has a new opportunity for you.', 'new'),
        ('Your shortlisted offer from PrivateLend has been updated.', 'new'),
        ('EliteCapital has modified their interest rates.', 'new'),
        ('PremierFinance has accepted your offer!', 'accepted'),
    ]
}

# Create notifications
print("\nCreating notifications...")
for user in all_users:
    print(f"\n  Creating notifications for {user.username}...")
    templates = notification_templates.get(user.username, [])
    
    for i, (message, _) in enumerate(templates):
        # Find an offer related to this notification
        offer = offers[i % len(offers)] if offers else None
        
        # Create notification
        notification, created = Notification.objects.get_or_create(
            user=user,
            offer=offer,
            message=message,
            defaults={
                'is_read': False,
                'created_at': datetime.datetime.now() - datetime.timedelta(hours=i*2)
            }
        )
        
        if created:
            status = "Created"
        else:
            status = "Updated"
        print(f"    {status}: {message}")

print("\n✅ Notifications created successfully!")
print("\nNotification summary:")
for user in all_users:
    count = Notification.objects.filter(user=user).count()
    unread_count = Notification.objects.filter(user=user, is_read=False).count()
    print(f"  {user.username}: Total={count}, Unread={unread_count}")

print("\nYou can verify notifications at:" if all_users else "")
print("  http://localhost:5173/notifications")
