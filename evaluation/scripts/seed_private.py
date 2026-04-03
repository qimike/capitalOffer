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
        user.set_password('private@456')
        user.save()
        print(f"  Created user: {user.username} (password: private@456)")
    else:
        print(f"  User already exists: {user.username}")

# Create offers for the private users
# Total: 10 offers per user, all displayed on a single page (limit=10)
# Lender distribution: 4 EliteCapital, 3 PrivateLend, 3 PremierFinance
print("\nCreating private offers...")
offer_list = [
    {"amount": 50000, "rate": 4.9, "apr": 5.2, "term": 60, "fee": 200, "status": "expired",  "lender_slug": "premierfinance"},
    {"amount": 40000, "rate": 5.2, "apr": 5.5, "term": 48, "fee": 200, "status": "pending",   "lender_slug": "privatelend"},
    {"amount": 35000, "rate": 5.8, "apr": 6.1, "term": 60, "fee": 175, "status": "new",       "lender_slug": "premierfinance"},
    {"amount": 30000, "rate": 6.5, "apr": 6.8, "term": 48, "fee": 150, "status": "accepted",  "lender_slug": "privatelend"},
    {"amount": 28000, "rate": 6.2, "apr": 6.5, "term": 36, "fee": 140, "status": "accepted",  "lender_slug": "premierfinance"},
    {"amount": 25000, "rate": 6.0, "apr": 6.3, "term": 36, "fee": 125, "status": "new",       "lender_slug": "privatelend"},
    {"amount": 22000, "rate": 5.9, "apr": 6.2, "term": 48, "fee": 110, "status": "new",       "lender_slug": "elitecapital"},
    {"amount": 20000, "rate": 5.5, "apr": 5.8, "term": 36, "fee": 100, "status": "new",       "lender_slug": "elitecapital"},
    {"amount": 18000, "rate": 6.8, "apr": 7.1, "term": 24, "fee": 90,  "status": "accepted",  "lender_slug": "elitecapital"},
    {"amount": 15000, "rate": 7.5, "apr": 7.8, "term": 24, "fee": 75,  "status": "expired",   "lender_slug": "elitecapital"},
]

lender_map = {l.slug: l for l in Lender.objects.filter(slug__in=['privatelend', 'elitecapital', 'premierfinance'])}

for user in User.objects.filter(username__in=['jane', 'tina']):
    print(f"\nCreating offers for user: {user.username}")
    
    for offer_data in offer_list:
        loan_amount = offer_data['amount']
        interest_rate = offer_data['rate']
        apr = offer_data['apr']
        term_months = offer_data['term']
        origination_fee = offer_data['fee']
        status = offer_data['status']
        lender = lender_map[offer_data['lender_slug']]
        
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
print("  Password: private@456")
print("  Username: tina")
print("  Password: private@456")
print("\nYou can now login at http://localhost:3000/api/auth/login/")
