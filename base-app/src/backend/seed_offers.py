#!/usr/bin/env python
import os
import django
import datetime
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from app.models import Lender, Offer, Notification

# Clear existing data for fresh seed
print("Clearing existing data...")
Lender.objects.all().delete()
Offer.objects.all().delete()
Notification.objects.all().delete()
print("✅ Data cleared")

LENDER_COUNT = 0  # Track total lenders created

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_lender(name, slug, description):
    """Create a lender and return its ID."""
    global LENDER_COUNT
    lender, created = Lender.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'description': description
        }
    )
    if created:
        print(f"  ✅ Created lender: {lender.name}")
        LENDER_COUNT += 1
    else:
        print(f"  📦 Lender exists: {lender.name}")
    return lender.id, lender

def create_user(username, email, password, first_name, last_name, phone):
    """Create a user and return user data."""
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone
        }
    )
    if created:
        user.set_password(password)
        user.save()
        print(f"  ✅ Created user: {user.username} (password: {password})")
    else:
        print(f"  📦 User exists: {user.username}")
    return user

def create_offer(user, lender_id, amount, rate, apr, term, fee, status):
    """Create an offer and associated notification."""
    loan_amount = amount
    interest_rate = rate
    apr = apr
    term_months = term
    origination_fee = fee
    
    # Calculate monthly payment using standard loan formula
    if interest_rate > 0:
        monthly_payment = loan_amount * (interest_rate / 100 / 12) / (1 - (1 + interest_rate / 100 / 12) ** -term_months)
    else:
        monthly_payment = loan_amount / term_months
    
    # Set expiry and notification time based on status
    now = datetime.datetime.now()
    if status == 'new':
        expiry_date = now + datetime.timedelta(days=30)
        notification_time = "Just now"
    elif status == 'accepted':
        expiry_date = now - datetime.timedelta(days=30)
        notification_time = "2 hours ago"
    elif status == 'expired':
        expiry_date = now - datetime.timedelta(days=10)
        notification_time = "5 days ago"
    else:
        expiry_date = now + datetime.timedelta(days=15)
        notification_time = "1 day ago"
    
    # Get lender name from ID
    try:
        lender = Lender.objects.get(id=lender_id)
        lender_name = lender.name
    except:
        # If lender_id is empty or invalid, try to get by name
        try:
            lender = Lender.objects.get(name=lender_id)
            lender_name = lender.name
            lender_id = lender.id
        except:
            lender_name = "Unknown Lender"
            lender_id = None
        
        # If still no lender found, return early
        if lender_id is None:
            print(f"  ❌ Cannot find lender for offer creation")
            return None
    
    # Create the offer
    offer = Offer.objects.create(
        user=user,
        lender_id=lender_id,
        loan_amount=loan_amount,
        interest_rate=interest_rate,
        apr=apr,
        term_months=term_months,
        origination_fee=origination_fee,
        monthly_payment=round(monthly_payment, 2),
        status=status,
        expiry_date=expiry_date,
        lender_notes=f"Pre-approved offer from {lender_name}"
    )
    
    # Create notification
    Notification.objects.create(
        user=user,
        offer=offer,
        message=f"New offer from {lender_name}: ${loan_amount} at {interest_rate}% interest rate"
    )
    
    print(f"  ✅ Created offer: ${loan_amount} from {lender_name} for {user.username} ({status})")
    return offer

# ============================================================================
# PUBLIC DATASET - alice and mike (2 public users)
# ============================================================================
print("\n" + "="*70)
print("PUBLIC DATASET - alice & mike")
print("="*70)

# Create 3 public lenders
print("\n📋 Creating 3 public lenders...")
lender_ids = {}
names = [
    ("CapitalOne", "capitalone", "Leading financial services company"),
    ("SoFi", "sofi", "Modern financial services platform"),
    ("LendingClub", "lendingclub", "Peer-to-peer lending marketplace"),
]

for name, slug, desc in names:
    lender_id, _ = create_lender(name, slug, desc)
    lender_ids[name] = lender_id

# Create 2 public users: alice and mike
print("\n👥 Creating 2 public users (alice & mike)...")
public_users = {}
usernames_public = ['alice', 'mike']
first_names = ['Alice', 'Mike']

for i, username in enumerate(usernames_public):
    user = create_user(
        username=username,
        email='test@gmail.com',
        password='test@123',
        first_name=first_names[i],
        last_name='User',
        phone='555-0100'
    )
    public_users[username] = user

    # Create 4 offers per public user (2 new, 1 accepted, 1 expired)
print("\n💼 Creating 4 offers for each public user...")

# Alice's offers (2 new, 1 accepted, 1 expired)
alice_offer_configs = [
    {'lender_name': 'CapitalOne', 'amount': 15000, 'rate': 5.9, 'apr': 6.2, 'term': 36, 'fee': 75, 'status': 'new'},
    {'lender_name': 'SoFi', 'amount': 25000, 'rate': 4.9, 'apr': 5.1, 'term': 48, 'fee': 100, 'status': 'new'},
    {'lender_name': 'LendingClub', 'amount': 10000, 'rate': 6.9, 'apr': 7.2, 'term': 24, 'fee': 50, 'status': 'accepted'},
    {'lender_name': 'CapitalOne', 'amount': 20000, 'rate': 8.9, 'apr': 9.2, 'term': 60, 'fee': 125, 'status': 'expired'},
]

# Mike's offers (2 new, 1 accepted, 1 expired)
mike_offer_configs = [
    {'lender_name': 'SoFi', 'amount': 30000, 'rate': 5.4, 'apr': 5.7, 'term': 60, 'fee': 150, 'status': 'new'},
    {'lender_name': 'LendingClub', 'amount': 12000, 'rate': 6.5, 'apr': 6.8, 'term': 36, 'fee': 60, 'status': 'new'},
    {'lender_name': 'CapitalOne', 'amount': 18000, 'rate': 7.5, 'apr': 7.8, 'term': 48, 'fee': 90, 'status': 'accepted'},
    {'lender_name': 'SoFi', 'amount': 8000, 'rate': 9.9, 'apr': 10.2, 'term': 24, 'fee': 40, 'status': 'expired'},
]

print(f"\n--- Creating offers for alice ---")
for offer_data in alice_offer_configs:
    # Look up existing lender by name
    try:
        lender = Lender.objects.get(name=offer_data['lender_name'])
        create_offer(public_users['alice'], lender.id, 
                     offer_data['amount'], offer_data['rate'], offer_data['apr'],
                     offer_data['term'], offer_data['fee'], offer_data['status'])
    except Lender.DoesNotExist:
        print(f"  ❌ Lender {offer_data['lender_name']} not found!")

print(f"\n--- Creating offers for mike ---")
for offer_data in mike_offer_configs:
    # Look up existing lender by name
    try:
        lender = Lender.objects.get(name=offer_data['lender_name'])
        create_offer(public_users['mike'], lender.id,
                     offer_data['amount'], offer_data['rate'], offer_data['apr'],
                     offer_data['term'], offer_data['fee'], offer_data['status'])
    except Lender.DoesNotExist:
        print(f"  ❌ Lender {offer_data['lender_name']} not found!")

# ============================================================================
# PRIVATE DATASET - jane and tina (2 private users)
# ============================================================================
print("\n" + "="*70)
print("PRIVATE DATASET - jane & tina")
print("="*70)

# Create 3 private lenders (different from public)
print("\n📋 Creating 3 private lenders...")
private_lender_ids = {}
private_names = [
    ("Chase Personal Loans", "chase-personal", "Trusted banking institution"),
    ("Wells Fargo Personal", "wellsfargo-personal", "Traditional banking with competitive rates"),
    ("Bank of America Personal", "bofa-personal", "Comprehensive financial services"),
]

for name, slug, desc in private_names:
    lender_id, _ = create_lender(name, slug, desc)
    private_lender_ids[name] = lender_id

# Create 2 private users: jane and tina
print("\n👥 Creating 2 private users (jane & tina)...")
private_users = {}
usernames_private = ['jane', 'tina']
first_names_private = ['Jane', 'Tina']

for i, username in enumerate(usernames_private):
    user = create_user(
        username=username,
        email='test@gmail.com',
        password='test@123',
        first_name=first_names_private[i],
        last_name='User',
        phone='555-0200'
    )
    private_users[username] = user

# Create 4 offers per private user (2 new, 1 accepted, 1 expired)
print("\n💼 Creating 4 offers for each private user...")

# Jane's offers (2 new, 1 accepted, 1 expired)
jane_offer_configs = [
    {'lender_name': 'Chase Personal Loans', 'amount': 22000, 'rate': 5.2, 'apr': 5.5, 'term': 48, 'fee': 110, 'status': 'new'},
    {'lender_name': 'Wells Fargo Personal', 'amount': 16000, 'rate': 6.1, 'apr': 6.4, 'term': 36, 'fee': 80, 'status': 'new'},
    {'lender_name': 'Bank of America Personal', 'amount': 14000, 'rate': 7.2, 'apr': 7.5, 'term': 24, 'fee': 70, 'status': 'accepted'},
    {'lender_name': 'Chase Personal Loans', 'amount': 19000, 'rate': 8.5, 'apr': 8.8, 'term': 60, 'fee': 95, 'status': 'expired'},
]

# Tina's offers (2 new, 1 accepted, 1 expired)
tina_offer_configs = [
    {'lender_name': 'Wells Fargo Personal', 'amount': 28000, 'rate': 4.8, 'apr': 5.0, 'term': 60, 'fee': 140, 'status': 'new'},
    {'lender_name': 'Bank of America Personal', 'amount': 11000, 'rate': 6.8, 'apr': 7.1, 'term': 36, 'fee': 55, 'status': 'new'},
    {'lender_name': 'Chase Personal Loans', 'amount': 21000, 'rate': 7.8, 'apr': 8.1, 'term': 48, 'fee': 105, 'status': 'accepted'},
    {'lender_name': 'Wells Fargo Personal', 'amount': 9000, 'rate': 9.5, 'apr': 9.8, 'term': 24, 'fee': 45, 'status': 'expired'},
]

print(f"\n--- Creating offers for jane ---")
for offer_data in jane_offer_configs:
    # Look up existing lender by name
    try:
        lender = Lender.objects.get(name=offer_data['lender_name'])
        create_offer(private_users['jane'], lender.id,
                     offer_data['amount'], offer_data['rate'], offer_data['apr'],
                     offer_data['term'], offer_data['fee'], offer_data['status'])
    except Lender.DoesNotExist:
        print(f"  ❌ Lender {offer_data['lender_name']} not found!")

print(f"\n--- Creating offers for tina ---")
for offer_data in tina_offer_configs:
    # Look up existing lender by name
    try:
        lender = Lender.objects.get(name=offer_data['lender_name'])
        create_offer(private_users['tina'], lender.id,
                     offer_data['amount'], offer_data['rate'], offer_data['apr'],
                     offer_data['term'], offer_data['fee'], offer_data['status'])
    except Lender.DoesNotExist:
        print(f"  ❌ Lender {offer_data['lender_name']} not found!")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "="*70)
print("🎉 SEEDING COMPLETE!")
print("="*70)

print("\n📊 DATA SUMMARY:")
print(f"  ✓ Lenders: {LENDER_COUNT} (3 public + 3 private)")
print(f"  ✓ Users: 4")
print(f"  ✓ Offers: 16 (4 per user)")
print(f"  ✓ Notifications: Created for all offers")

print("\n🔐 TEST CREDENTIALS:")
print("\nPublic Users:")
for username in ['alice', 'mike']:
    print(f"  Username: {username}")
    print(f"  Email: test@gmail.com")
    print(f"  Password: test@123")

print("\nPrivate Users:")
for username in ['jane', 'tina']:
    print(f"  Username: {username}")
    print(f"  Email: test@gmail.com")
    print(f"  Password: test@123")

print("\n🌐 API ENDPOINTS:")
print("  - Login: http://localhost:3000/api/auth/login/")
print("  - Offers: http://localhost:3000/api/offers/")
print("  - Profile: http://localhost:3000/api/profile/")
print("  - Health: http://localhost:3000/health/")

print("\n📱 FRONTEND:")
print("  - Offers Page: http://localhost:5173/offers")
print("  - Login Page: http://localhost:5173/login")
print("  - Signup Page: http://localhost:5173/signup")
print("  - Profile Page: http://localhost:5173/profile")

print("\n✅ Database seeded successfully! You can now login and view offers.")
