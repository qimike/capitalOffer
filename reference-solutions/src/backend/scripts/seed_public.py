#!/usr/bin/env python
import os
import sys
import django
import datetime

# Ensure the parent directory (backend root) is on the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from app.models import Lender, Offer

# Create lenders
lenders = [
    {"name": "CapitalOne", "slug": "capitalone", "description": "Leading financial services company"},
    {"name": "SoFi", "slug": "sofi", "description": "Modern financial services platform"},
    {"name": "LendingClub", "slug": "lendingclub", "description": "Peer-to-peer lending marketplace"},
    {"name": "Prosper", "slug": "prosper", "description": "Personal loan marketplace"},
    {"name": "Upstart", "slug": "upstart", "description": "AI-powered lending platform"},
    {"name": "Discover", "slug": "discover", "description": "Financial services and retail banking"},
]

print("Creating lenders...")
for lender_data in lenders:
    lender, created = Lender.objects.get_or_create(
        slug=lender_data['slug'],
        defaults=lender_data
    )
    if created:
        print(f"  Created lender: {lender.name}")
    else:
        print(f"  Lender already exists: {lender.name}")

# Create public test users (alice and mike)
print("\nCreating public test users...")
public_users = [
    {
        'username': 'alice',
        'email': 'alice@capitaloffer.com',
        'first_name': 'Alice',
        'last_name': 'User',
    },
    {
        'username': 'mike',
        'email': 'mike@capitaloffer.com',
        'first_name': 'Mike',
        'last_name': 'User',
    }
]

users = []
for user_data in public_users:
    user, created = User.objects.get_or_create(
        username=user_data['username'],
        defaults=user_data
    )
    if created:
        user.set_password('test@123')
        user.save()
        print(f"  Created user: {user.username} (password: test@123)")
    else:
        print(f"  User already exists: {user.username}")
    users.append(user)

# Create 10 offers for each public user
print("\nCreating offers for public users...")
offer_templates = [
    {"amount": 10000, "rate": 5.9, "apr": 6.2, "term": 36, "fee": 50, "status": "new"},
    {"amount": 15000, "rate": 4.9, "apr": 5.1, "term": 48, "fee": 75, "status": "new"},
    {"amount": 25000, "rate": 7.9, "apr": 8.1, "term": 60, "fee": 100, "status": "accepted"},
    {"amount": 5000, "rate": 8.9, "apr": 9.2, "term": 24, "fee": 25, "status": "expired"},
    {"amount": 20000, "rate": 6.5, "apr": 6.8, "term": 36, "fee": 100, "status": "new"},
    {"amount": 30000, "rate": 5.5, "apr": 5.8, "term": 48, "fee": 150, "status": "pending"},
    {"amount": 8000, "rate": 7.2, "apr": 7.5, "term": 24, "fee": 40, "status": "new"},
    {"amount": 12000, "rate": 6.0, "apr": 6.3, "term": 36, "fee": 60, "status": "new"},
    {"amount": 18000, "rate": 5.8, "apr": 6.1, "term": 48, "fee": 90, "status": "accepted"},
    {"amount": 22000, "rate": 6.8, "apr": 7.1, "term": 60, "fee": 110, "status": "new"},
]

lenders_list = list(Lender.objects.all()[:3])  # Use first 3 lenders

for user in users:
    print(f"\n  Creating 10 offers for {user.username}...")
    for i, offer_data in enumerate(offer_templates):
        # Cycle through lenders
        lender = lenders_list[i % len(lenders_list)]
        
        loan_amount = offer_data['amount']
        interest_rate = offer_data['rate']
        apr = offer_data['apr']
        term_months = offer_data['term']
        origination_fee = offer_data['fee']
        status = offer_data['status']
        
        # Calculate monthly payment
        monthly_payment = loan_amount * (interest_rate / 100 / 12) / (1 - (1 + interest_rate / 100 / 12) ** -term_months)
        
        # Set expiry date based on status
        if status == 'new':
            expiry_date = datetime.datetime.now() + datetime.timedelta(days=30)
        elif status == 'accepted':
            expiry_date = datetime.datetime.now() + datetime.timedelta(days=60)
        elif status == 'expired':
            expiry_date = datetime.datetime.now() - datetime.timedelta(days=10)
        else:
            expiry_date = datetime.datetime.now() + datetime.timedelta(days=15)
        
        offer = Offer.objects.create(
            user=user,
            lender=lender,
            loan_amount=loan_amount,
            interest_rate=interest_rate,
            apr=apr,
            term_months=term_months,
            origination_fee=origination_fee,
            monthly_payment=round(monthly_payment, 2),
            status=status,
            expiry_date=expiry_date
        )
        print(f"    Created offer {i+1}: ${loan_amount} from {lender.name} ({status})")

print(f"\n✅ Seed data created successfully!")
print(f"\nTotal offers in database: {Offer.objects.count()}")
print(f"Alice's offers: {Offer.objects.filter(user=users[0]).count()}")
print(f"Mike's offers: {Offer.objects.filter(user=users[1]).count()}")
print("\nTest user credentials:")
print("  Username: alice")
print("  Password: test@123")
print("  Username: mike")
print("  Password: test@123")
print("\nYou can now login at http://localhost:3000/api/auth/login/")
