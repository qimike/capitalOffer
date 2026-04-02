from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q, OuterRef, Subquery, Max
from django.http import HttpResponse

from app.models import User, Lender, Offer, OfferDecision, ShortlistItem, Notification


@api_view(['GET'])
def health(request):
    """Health check endpoint."""
    return HttpResponse(status=200)
from app.serializers import (
    UserSerializer, AuthTokenSerializer,
    LenderSerializer, OfferSerializer, OfferDetailSerializer,
    OfferCreateSerializer, OfferDecisionSerializer,
    ShortlistSerializer, NotificationSerializer
)
from django.contrib.auth import authenticate
from django.contrib.auth.models import Permission


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """Custom permission to allow read-only access to unauthenticated users."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().exclude(username='admin')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LenderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to view lenders.
    """
    queryset = Lender.objects.all()
    serializer_class = LenderSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class OfferViewSet(viewsets.ModelViewSet):
    """
    API endpoint for offers.
    """
    queryset = Offer.objects.all().select_related('lender', 'user')
    serializer_class = OfferSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter offers based on query parameters."""
        user = self.request.user
        
        # For browse_list action, show public offers only
        if getattr(self, 'action', '') == 'browse_list':
            queryset = Offer.objects.filter(visibility='public')
        elif self.request.user.is_authenticated and self.action == 'list':
            # Only show offers for the logged-in user
            queryset = Offer.objects.filter(user=user)
        else:
            queryset = Offer.objects.all()

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by lender
        lender_filter = self.request.query_params.get('lender', None)
        if lender_filter:
            queryset = queryset.filter(lender__slug=lender_filter)

        # Sort offers
        sort_by = self.request.query_params.get('sort', 'id')
        if sort_by == 'amount_desc':
            queryset = queryset.order_by('-loan_amount')
        elif sort_by == 'amount_asc':
            queryset = queryset.order_by('loan_amount')
        elif sort_by == 'rate_asc':
            queryset = queryset.order_by('interest_rate')
        elif sort_by == 'rate_desc':
            queryset = queryset.order_by('-interest_rate')
        elif sort_by == 'expiry_asc':
            queryset = queryset.order_by('expiry_date')
        elif sort_by == 'expiry_desc':
            queryset = queryset.order_by('-expiry_date')
        else:
            queryset = queryset.order_by('-id')

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return OfferCreateSerializer
        elif self.action == 'retrieve':
            return OfferDetailSerializer
        return OfferSerializer

    def create(self, request, *args, **kwargs):
        # Only allow admin or staff to create offers
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to create offers'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class OfferDetailEndpoint(APIView):
    """Detailed view of a single offer with unified action handling."""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            offer = Offer.objects.select_related('lender', 'user').get(pk=pk)
        except Offer.DoesNotExist:
            return Response(
                {'error': 'Offer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OfferDetailSerializer(offer, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk, action):
        """Handle offer actions via unified endpoint."""
        try:
            offer = Offer.objects.get(pk=pk)
        except Offer.DoesNotExist:
            return Response(
                {'error': 'Offer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if action == 'accept':
            offer.status = 'accepted'
            decision = OfferDecision.objects.create(
                offer=offer,
                decision='accepted'
            )
            user = offer.user
            
            # Create acceptance notification
            Notification.objects.create(
                user=user,
                offer=offer,
                message=f'Your offer from {offer.lender.name} has been accepted!'
            )

        elif action == 'decline':
            offer.status = 'declined'
            reason = request.data.get('reason', 'Not interested')
            decision = OfferDecision.objects.create(
                offer=offer,
                decision='declined',
                decline_reason=reason
            )

        elif action == 'shortlist':
            ShortlistItem.objects.get_or_create(
                user=request.user,
                offer=offer
            )
        
        elif action == 'details':
            serializer = OfferDetailSerializer(offer, context={'request': request})
            return Response(serializer.data)

        offer.save()
        return Response({'status': 'success'})


class ShortlistViewSet(viewsets.ModelViewSet):
    """API endpoint for shortlisted offers."""
    serializer_class = ShortlistSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ShortlistItem.objects.filter(user=self.request.user).select_related('offer')
        return ShortlistItem.objects.none()


class NotificationViewSet(viewsets.ModelViewSet):
    """API endpoint for user notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Notification.objects.filter(user=self.request.user).select_related('offer')
        return Notification.objects.none()


class HealthCheckView(APIView):
    """Health check endpoint."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'status': 'healthy', 'message': 'CapitalOffer API is running'}, status=200)


class AuthLoginView(generics.GenericAPIView):
    """User login endpoint."""
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthTokenSerializer

    def post(self, request):
        username = request.data.get('username', request.data.get('email', ''))
        password = request.data.get('password', '')

        user = authenticate(username=username, password=password)

        if user is None:
            # Try email authentication
            try:
                user = User.objects.get(email=username)
                user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        if user is None:
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


class AuthSignupView(generics.CreateAPIView):
    """User signup endpoint."""
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class AuthLogoutView(APIView):
    """User logout endpoint."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # For JWT, we don't need to delete tokens server-side
        # The frontend will remove them from localStorage
        return Response({'status': 'Logged out successfully'})


class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    """User profile update endpoint."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Update only specific fields (name and phone)."""
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # If first_name or last_name is provided, set them on the user model
        if serializer.validated_data.get('first_name'):
            instance.first_name = serializer.validated_data['first_name']
        if serializer.validated_data.get('last_name'):
            instance.last_name = serializer.validated_data['last_name']
        if serializer.validated_data.get('phone'):
            instance.phone = serializer.validated_data['phone']
        instance.save()

        return Response(serializer.data)
