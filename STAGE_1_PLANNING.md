# base-app/STAGE_1_PLANNING.md

## 2. Base Feature List

### 2.1 Frontend Pages (Base)

This section describes the frontend pages built with **Vue 3** and **Bootstrap 5** for the capitalOffer application.

#### 2.1.1 Authentication Pages

##### Login Page (`/login`)
- **Purpose**: User authentication interface
- **Components**:
  - Email input field (required, email validation)
  - Password input field (required, min 8 characters)
  - "Remember me" checkbox option
  - Submit button with loading state
- **Behavior**:
  - Validates email format and password length client-side
  - Shows error messages on authentication failure
  - Redirects to `/offers` page on successful login
  - Provides link to signup page for new users
- **Bootstrap 5 Features**:
  - Form validation classes (`was-validated`)
  - Bootstrap Icons for input fields
  - Spacing utilities for layout
  - Disabled button state during authentication

##### Signup Page (`/signup`)
- **Purpose**: New user registration
- **Components**:
  - Full name input field (required, 2-50 characters)
  - Email input field (required, email validation, unique check)
  - Password input field (required, min 8 characters, strength indicator)
  - Password confirmation field (required, matches password validation)
  - Terms and conditions checkbox (required)
  - Submit button with loading state
- **Behavior**:
  - Client-side validation for all fields
  - Real-time email availability check
  - Password strength meter (weak, medium, strong)
  - Fields match validation for password and confirmation
  - Redirects to `/login` page on successful registration
  - Shows detailed error messages for server-side validation
- **Bootstrap 5 Features**:
  - Floating label forms
  - Progress bars for password strength
  - Validation feedback tooltips
  - Responsive grid layout

#### 2.1.2 Main Application Pages

##### Offer List Page (`/offers`)
- **Purpose**: Browse and filter available loan offers
- **Page Layout**:
  - Top section: Filter bar and pagination controls
  - Middle section: Paginated offer cards grid
  - Bottom section: Page navigation (previous, next, page numbers)
- **Offer Card Components**:
  - Lender name and rating (★/5 stars)
  - Loan amount displayed prominently
  - Interest rate (APR percentage)
  - Loan term (months/years)
  - Status badge (color-coded):
    - New offer (green badge)
    - Accepted offer (blue badge)
    - Expired offer (gray badge)
    - Pending offer (yellow badge)
  - Offer expiry date
  - "View Details" button
- **Filtering & Sorting**:
  - Filter by status (dropdown)
  - Sort by: amount (high to low / low to high), interest rate, expiry date
  - Current filters display bar with option to clear
- **Pagination**:
  - Shows page numbers and total pages
  - Previous/Next buttons with disabled states
  - Page size selector (10, 25, 50 per page)
- **Behavior**:
  - Fetches offers from backend API with pagination
  - Shows loading skeleton before data loads
  - Shows empty state message if no offers available
  - Real-time filter updates without page reload
- **Bootstrap 5 Features**:
  - Card components for offer display
  - Badge components for status indicators
  - Pagination component with active state
  - Card groups for responsive layout
  - Grid system (col-md-4 for 3 cards per row)
  - Responsive utilities for mobile

##### Offer Detail Page (`/offers/:id`)
- **Purpose**: View complete information about a specific loan offer
- **Page Layout**:
  - Breadcrumb navigation (Offers → Offer Details)
  - Offer header section (lender, status, expiry)
  - Full offer information panel (split into sections)
  - Action buttons section
- **Offer Information Sections**:
  - **Loan Details**:
    - Loan amount (formatted with currency symbols)
    - Interest rate (APR percentage with tooltip)
    - Loan term (duration with monthly payment calculator)
    - Monthly payment amount (calculated from above)
  - **Terms & Conditions**:
    - Early repayment policy
    - Prepayment penalties
    - Grace period details
    - Late payment fees
  - **Lender Information**:
    - Lender name
    - Rating and reviews count
    - Contact information
    - Business history
  - **Offer Metadata**:
    - Offer ID
    - Creation date
    - Last updated date
    - Expiry date
    - Status history timeline
- **Action Buttons**:
  - "Accept Offer" button (disabled for expired offers)
  - "Decline Offer" button
  - "View Contract" button (generates PDF)
  - "Share Offer" dropdown (email, SMS, copy link)
- **Breadcrumb Navigation**:
  - Returns to Offer List
  - Shows current offer status in context
- **Behavior**:
  - Validates offer status before allowing actions
  - Shows confirmation dialogs for critical actions
  - Displays loading spinner while data fetches
  - Shows error states for network failures
  - Updates UI when offer status changes
- **Bootstrap 5 Features**:
  - Card components for information sections
  - Progress bars for loan term visualization
  - List groups for terms and conditions
  - Modal for confirmation dialogs
  - Tooltips for explanatory text
  - Alert components for important notices
  - Accordion for expandable sections

##### Profile Page (`/profile`)
- **Purpose**: View-only display of user profile information
- **Page Layout**:
  - User avatar (default or uploaded)
  - User information grouped in sections
  - Contact information card
  - Account activity overview
- **Profile Sections**:
  - **Personal Information**:
    - Full name
    - Email address (read-only)
    - Phone number
    - Date of birth
  - **Address Information**:
    - Street address
    - City, State, ZIP
    - Verification status
  - **Account Information**:
    - Account creation date
    - Login history (last login, last 5 logins)
    - Account status (active, suspended, pending)
    - Two-factor authentication status
  - **Security Settings**:
    - Password change option (link to password change)
    - Security questions indicator
    - Trusted device list
- **User Avatar**:
  - Default avatar icon (Bootstrap Icons)
  - Optional upload feature (future enhancement)
  - Preview with current selection
- **Behavior**:
  - All fields are read-only on frontend
  - Shows loading state during data fetch
  - Displays empty states for missing information
- **Bootstrap 5 Features**:
  - Avatar component (circle component for user image)
  - List groups for organized information
  - Badges for verification status
  - Progress bars for activity levels
  - Responsive grid for layout adaptation

#### 2.1.3 Navigation & Layout

##### Sticky Navbar
- **Components**:
  - Logo image on the left (brand identifier)
  - Navigation links (Offer, Shortlist, Profile) in the center
  - Username display (right)
  - Logout button (right)
- **Behavior**:
  - Sticks to top of screen when scrolling
  - Collapses into hamburger menu on mobile devices
  - Shows dropdown menu for mobile navigation
  - Updates based on authentication state
  - Highlights current page
- **Bootstrap 5 Features**:
  - Navbar component with `fixed-top` class
  - Collapse component for mobile menu
  - Bootstrap Icons for visual elements
  - Flex utilities for alignment
  - Color utilities for branding

##### Responsive Layout
- **Desktop (≥992px)**:
  - Full navigation visible
  - 3 cards per offer card row
  - Sidebar for filters
- **Tablet (≥768px to <992px)**:
  - Full navigation visible
  - 2 cards per offer card row
  - Filters in responsive container
- **Mobile (<768px)**:
  - Hamburger menu for navigation
  - 1 card per offer card row
  - Filters in collapsible section
- **Bootstrap 5 Features**:
  - Grid system with breakpoints
  - Responsive sizing utilities
  - Display utilities (d-none, d-md-block)
  - Flexbox utilities

##### Footer
- **Components**:
  - Brand name and logo
  - Copyright text
  - Disclaimer about loan terms
  - Links to terms of service, privacy policy
- **Bootstrap 5 Features**:
  - Center content using flex utilities
  - Text utilities for styling
  - Spacing utilities for vertical margins

##### Authentication Guard
- **Behavior**:
  - Checks authentication status on page load
  - Redirects unauthenticated users to `/login`
  - Stores redirect URL to return after login
  - Shows toast notification on authentication failure
- **Implementation**:
  - Vue Router guards with `beforeEach` navigation guard
  - Local storage for auth token
  - Session expiration handling
- **Bootstrap 5 Features**:
  - Toast notification component
  - Alert dismiss component
  - Loading spinner component

### 2.2 Component Library

#### Reusable Components

##### `OfferCard.vue`
- **Purpose**: Display individual loan offer summary
- **Props**:
  - `offer`: Object containing offer data
  - `showStatus`: Boolean to show/hide status badge
- **Emits**:
  - `click`: Triggered when clicking offer details
- **Features**:
  - Auto-calculates monthly payment from loan parameters
  - Displays status badge with color coding
  - Shows loan term as progress bar
  - Conditional rendering based on status
- **Bootstrap 5 Classes**:
  - Card component
  - Badge component
  - Progress bar
  - Grid utilities

##### `StatusBadge.vue`
- **Purpose**: Display offer status with color coding
- **Props**:
  - `status`: String (new, accepted, expired, pending)
  - `text`: Optional custom text override
- **Bootstrap 5 Classes**:
  - Badge component (`bg-success`, `bg-info`, etc.)
  - Text alignment utilities

##### `Pagination.vue`
- **Purpose**: Handle pagination navigation
- **Props**:
  - `currentPage`: Current page number
  - `totalPages`: Total number of pages
  - `itemsPerPage`: Number of items per page
- **Emits**:
  - `page-change`: New page number
- **Bootstrap 5 Classes**:
  - Pagination component
  - Active state handling
  - Disabled state handling

##### `LoadingSpinner.vue`
- **Purpose**: Display loading state
- **Props**:
  - `text`: Optional loading message
- **Bootstrap 5 Classes**:
  - Spinner component
  - Animation utilities
  - Text alignment

##### `ValidationError.vue`
- **Purpose**: Display form validation errors
- **Props**:
  - `message`: Error message string
  - `type`: Error type (warning, error, info)
- **Bootstrap 5 Classes**:
  - Alert component
  - Icon utility
  - Dismissible feature

### 2.3 State Management

#### Vue Composition API Setup
- **State**:
  - `useAuth`: Authentication user state (token, user, isAuthenticated)
  - `useOffers`: Offers list state (offers, loading, error, pagination)
  - `useFilters`: Filter and sort state (filter values, sort order)
- **Actions**:
  - `login`: Authenticate user
  - `logout`: Clear auth state
  - `fetchOffers`: Fetch offers from API
  - `setFilter`: Update filter state
  - `setPagination`: Update pagination state

#### Component Communication
- **Props**: Data flow from parent to child
- **Events**: Data flow from child to parent
- **Provide/Inject**: Hierarchical data sharing
- **Pinia Store**: Centralized state management for authentication and global data

### 2.4 Routing Configuration

#### Vue Router Setup
- **Routes**:
  - `/login`: Login page
  - `/signup`: Signup page  
  - `/offers`: Offer list page
  - `/offers/:id`: Offer detail page
  - `/profile`: User profile page
  - `/`: Redirect to `/offers` if authenticated else `/login`
- **Guards**:
  - `beforeEach`: Navigation guard for authentication checks
  - `afterEach`: Analytics/telemetry tracking
- **Navigation**:
  - Link component for page navigation
  - Router link for SPA navigation
  - Programmatic navigation with `router.push()`
