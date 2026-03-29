from rest_framework import serializers
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import Permission
from app.models import User, Lender, Offer, OfferDecision, ShortlistItem, Notification


class UserSerializer(serializers.ModelSerializer):
    """User serializer for authentication and profile."""
    offers_count = serializers.SerializerMethodField()
    shortlist_count = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'phone',
            'employment_status', 'annual_income', 'credit_band',
            'date_joined', 'offers_count', 'shortlist_count', 'password'
        ]
        read_only_fields = ['id', 'date_joined', 'offers_count', 'shortlist_count']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow partial updates for profile editing
        if isinstance(self.context.get('request'), type(None)) or \
           self.context.get('request').method != 'PATCH':
            # For full updates, require certain fields
            pass

    def get_offers_count(self, obj):
        if hasattr(obj, 'offers'):
            return obj.offers.count()
        return 0

    def get_shortlist_count(self, obj):
        if hasattr(obj, 'shortlist'):
            return obj.shortlist.count()
        return 0

    def get_full_name(self, obj):
        """Get full name from first_name and last_name fields of Django User model."""
        if hasattr(obj, 'first_name') and hasattr(obj, 'last_name'):
            return f"{obj.first_name} {obj.last_name}".strip()
        return ""

    def create(self, validated_data):
        """Create a new user account."""
        password = validated_data.pop('password', None)
        if password:
            user = User.objects.create_user(
                username=validated_data.pop('username'),
                email=validated_data.pop('email', ''),
                password=password,
                **validated_data
            )
        else:
            user = User.objects.create(**validated_data)
        return user


class AuthTokenSerializer(serializers.Serializer):
    """Serializer for authentication token response."""
    token = serializers.CharField()
    user = UserSerializer(read_only=True)


class LenderSerializer(serializers.ModelSerializer):
    """Lender serializer."""
    offers_count = serializers.SerializerMethodField()

    class Meta:
        model = Lender
        fields = ['id', 'name', 'slug', 'description', 'logo_url', 'offers_count']

    def get_offers_count(self, obj):
        return obj.offers.count()


class OfferSerializer(serializers.ModelSerializer):
    """Offer serializer for listing and detail views."""
    lender = LenderSerializer(read_only=True)
    user = serializers.SlugRelatedField(
        slug_field='username', 
        read_only=True
    )
    has_decision = serializers.SerializerMethodField()
    eligibility_label = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'user', 'lender', 'loan_amount',
            'interest_rate', 'apr', 'term_months',
            'origination_fee', 'monthly_payment', 'status',
            'expiry_date', 'lender_notes', 'created_at',
            'has_decision', 'eligibility_label'
        ]

    def get_has_decision(self, obj):
        return hasattr(obj, 'decision')

    def get_eligibility_label(self, obj):
        """Calculate eligibility label based on user profile and offer details."""
        from decimal import Decimal
        
        user = obj.user
        offer = obj
        
        # Scoring logic
        score = 0
        
        # Credit band scoring (40 points max)
        credit_bands = {'excellent': 40, 'good': 30, 'fair': 20, 'poor': 10}
        score += credit_bands.get(user.credit_band.lower(), 20)
        
        # Income vs loan amount (30 points max)
        if user.annual_income:
            income_ratio = float(user.annual_income) / float(offer.loan_amount)
            if income_ratio >= 5:
                score += 30
            elif income_ratio >= 3:
                score += 25
            elif income_ratio >= 2:
                score += 20
            elif income_ratio >= 1.5:
                score += 15
            else:
                score += 10
        
        # Employment status (20 points max)
        employment_bands = {'employed_full_time': 20, 'employed_part_time': 15, 'self_employed': 15, 'unemployed': 5}
        score += employment_bands.get(user.employment_status.lower(), 10)
        
        # Interest rate factor (10 points max)
        ir = offer.interest_rate
        if ir <= 5:
            score += 10
        elif ir <= 7:
            score += 8
        elif ir <= 9:
            score += 5
        else:
            score += 2
        
        # Determine label
        if score >= 70:
            return 'Good Fit'
        elif score >= 55:
            return 'Possible'
        else:
            return 'Unlikely'


class OfferDetailSerializer(serializers.ModelSerializer):
    """Detailed offer serializer."""
    lender = LenderSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    decision = serializers.SerializerMethodField()
    shortlisted = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'user', 'lender', 'loan_amount',
            'interest_rate', 'apr', 'term_months',
            'origination_fee', 'monthly_payment', 'status',
            'expiry_date', 'lender_notes', 'created_at',
            'updated_at', 'decision', 'shortlisted'
        ]

    def get_decision(self, obj):
        try:
            return {
                'decision': obj.decision.decision,
                'reason': obj.decision.decline_reason,
                'decided_at': obj.decision.decided_at
            }
        except OfferDecision.DoesNotExist:
            return None

    def get_shortlisted(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return ShortlistItem.objects.filter(
                user=request.user,
                offer=obj
            ).exists()
        return False


class OfferCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new offers."""
    class Meta:
        model = Offer
        fields = [
            'lender', 'loan_amount', 'interest_rate',
            'apr', 'term_months', 'origination_fee',
            'monthly_payment', 'status', 'expiry_date', 'lender_notes'
        ]


class OfferDecisionSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating offer decisions."""
    class Meta:
        model = OfferDecision
        fields = ['decision', 'decline_reason']

    def create(self, validated_data):
        offer = self.context['offer']
        return OfferDecision.objects.create(offer=offer, **validated_data)


class ShortlistSerializer(serializers.ModelSerializer):
    """Serializer for shortlist items."""
    offer = OfferSerializer(read_only=True)

    class Meta:
        model = ShortlistItem
        fields = ['id', 'offer', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    class Meta:
        model = Notification
        fields = ['id', 'offer', 'message', 'is_read', 'created_at']
