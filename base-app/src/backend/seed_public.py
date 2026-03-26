#!/usr/bin/env python
import os
import django
import datetime

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

# Create a test user
print("\nCreating test user...")
test_user, created = User.objects.get_or_create(
    username='testuser',
    email='test@example.com'
)
if created:
    test_user.set_password('testpass123')
    test_user.full_name = 'Test User'
    test_user.save()
    print(f"  Created user: testuser (password: testpass123)")
else:
    print("  User already exists")

# Create offers for the test user
print("\nCreating offers...")
offer_templates = [
    {"amount": 10000, "rate": 5.9, "apr": 6.2, "term": 36, "fee": 50, "status": "new"},
    {"amount": 15000, "rate": 4.9, "apr": 5.1, "term": 48, "fee": 75, "status": "new"},
    {"amount": 25000, "rate": 7.9, "apr": 8.1, "term": 60, "fee": 100, "status": "new"},
    {"amount": 5000, "rate": 8.9, "apr": 9.2, "term": 24, "fee": 25, "status": "new"},
]

for i, offer_data in enumerate(offer_templates):
    for j, lender in enumerate(Lender.objects.all()):
        user_id = test_user.id
        lender_id = lender.id
        loan_amount = offer_data['amount']
        interest_rate = offer_data['rate']
        apr = offer_data['apr']
        term_months = offer_data['term']
        origination_fee = offer_data['fee']
        status = offer_data['status']
        
        # Calculate monthly payment
        monthly_payment = loan_amount * (interest_rate / 100 / 12) / (1 - (1 + interest_rate / 100 / 12) ** -term_months)
        
        # Set expiry date (30 days from now for new offers)
        if status == 'new':
            expiry_date = datetime.datetime.now() + datetime.timedelta(days=30)
        elif status == 'accepted':
            expiry_date = datetime.datetime.now() - datetime.timedelta(days=60)
        elif status == 'expired':
            expiry_date = datetime.datetime.now() - datetime.timedelta(days=10)
        else:
            expiry_date = datetime.datetime.now() + datetime.timedelta(days=15)
        
        offer = Offer.objects.create(
            user_id=user_id,
            lender_id=lender_id,
            loan_amount=loan_amount,
            interest_rate=interest_rate,
            apr=apr,
            term_months=term_months,
            origination_fee=origination_fee,
            monthly_payment=round(monthly_payment, 2),
            status=status,
            expiry_date=expiry_date
        )
        print(f"  Created offer: ${loan_amount} from {lender.name}")

print("\n✅ Seed data created successfully!")
print("\nTest user credentials:")
print("  Username: testuser")
print("  Password: testpass123")
print("\nYou can now login at http://localhost:3000/api/auth/login/")
