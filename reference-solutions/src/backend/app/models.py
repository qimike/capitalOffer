from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify


class User(AbstractUser):
    """User model with additional fields for capitalOffer."""
    # Add related_names to avoid clashes with auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='capitaloffer_user_groups',
        blank=True,
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='capitaloffer_user_permissions',
        blank=True,
        verbose_name='user permissions'
    )
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    employment_status = models.CharField(
        max_length=20,
        choices=[
            ('employed', 'Employed'),
            ('self_employed', 'Self-Employed'),
            ('unemployed', 'Unemployed')
        ],
        blank=True,
        null=True
    )
    annual_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Annual income in dollars"
    )
    credit_band = models.CharField(
        max_length=20,
        choices=[
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('fair', 'Fair'),
            ('poor', 'Poor')
        ],
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.username} ({self.email})"

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class Lender(models.Model):
    """Lender information model."""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'lenders'
        verbose_name = 'Lender'
        verbose_name_plural = 'Lenders'
        ordering = ['name']


class Offer(models.Model):
    """Loan offer model."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ]
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offers')
    lender = models.ForeignKey(Lender, on_delete=models.CASCADE, related_name='offers')
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    apr = models.DecimalField(max_digits=5, decimal_places=2)
    term_months = models.IntegerField()
    origination_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    expiry_date = models.DateTimeField()
    lender_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        visibility_str = 'Public' if self.visibility == 'public' else 'Private'
        return f"{visibility_str} Offer ${self.loan_amount} from {self.lender.name} for {self.user.username}"

    class Meta:
        db_table = 'offers'
        verbose_name = 'Offer'
        verbose_name_plural = 'Offers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['user_id']),
            models.Index(fields=['lender_id']),
            models.Index(fields=['visibility']),
        ]


class OfferDecision(models.Model):
    """User's decision on an offer."""
    DECISION_CHOICES = [
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ]

    offer = models.OneToOneField(Offer, on_delete=models.CASCADE, related_name='decision')
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    decline_reason = models.TextField(blank=True, null=True)
    decided_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.offer.user.username} {self.decision} offer ${self.offer.loan_amount}"

    class Meta:
        db_table = 'offer_decisions'
        verbose_name = 'Offer Decision'
        verbose_name_plural = 'Offer Decisions'


class ShortlistItem(models.Model):
    """User's shortlisted offers."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shortlist')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='shortlist_items')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} shortlisted {self.offer.lender.name}"

    class Meta:
        db_table = 'shortlist_items'
        verbose_name = 'Shortlist Item'
        verbose_name_plural = 'Shortlist Items'
        unique_together = [['user', 'offer']]
        ordering = ['-created_at']


class Notification(models.Model):
    """User notifications."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    offer = models.ForeignKey(Offer, on_delete=models.SET_NULL, null=True, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
