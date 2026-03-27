#!/usr/bin/env python
import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from app.models import Lender, Offer

# Create private lenders
private_lenders = [
    {"name": "PrivateLend", "slug": "privatelend", "description": "Exclusive private lending services"},
    {"name": "EliteCapital", "slug": "elitecapital", "description": "Premium financial solutions for qualified borrowers"},
    {"name": "PremierFinance", "slug": "premierfinance", "description": "High-value personalized lending"},
]

print("Creating private lenders...")
for lender_data in private_lenders:
    lender, created = Lender.objects.get_or_create(
        slug=lender_data['slug'],
        defaults=lender_data
    )
    if created:
        print(f"  Created lender: {lender.name}")
    else:
        print(f"  Lender already exists: {lender.name}")

# Create private test users
print("\nCreating private test users...")
private_users = [
    {
        'username': 'jane',
        'email': 'jane@capitaloffer.com',
        'first_name': 'Jane',
        'last_name': 'Private',
    },
    {
        'username': 'tina',
        'email': 'tina@capitaloffer.com',
        'first_name': 'Tina',
        'last_name': 'Private',
    }
]

for user_data in private_users:
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

# Create offers for the private users
print("\nCreating private offers...")
offer_templates = [
    {"amount": 20000, "rate": 5.5, "apr": 5.8, "term": 36, "fee": 100, "status": "new"},
    {"amount": 30000, "rate": 6.5, "apr": 6.8, "term": 48, "fee": 150, "status": "accepted"},
    {"amount": 50000, "rate": 4.9, "apr": 5.2, "term": 60, "fee": 200, "status": "expired"},
    {"amount": 15000, "rate": 7.5, "apr": 7.8, "term": 24, "fee": 75, "status": "new"},
]

for user in User.objects.filter(username__in=['jane', 'tina']):
    print(f"\nCreating offers for user: {user.username}")
    
    for i, offer_data in enumerate(offer_templates):
        for j, lender in enumerate(Lender.objects.filter(slug__in=['privatelend', 'elitecapital', 'premierfinance'])):
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
                expiry_date = datetime.datetime.now() - datetime.timedelta(days=60)
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
            print(f"  Created offer: ${loan_amount} from {lender.name} (status: {status})")

print("\n✅ Private seed data created successfully!")
print("\nPrivate test user credentials:")
print("  Username: jane")
print("  Password: test@123")
print("  Username: tina")
print("  Password: test@123")
print("\nYou can now login at http://localhost:3000/api/auth/login/")
