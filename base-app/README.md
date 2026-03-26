# base-app

CapitalOffer Full Stack Application with Python 3.13, Django 5.x, Vue 3, Bootstrap 5, PostgreSQL 14.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.13+ (for local backend development)

## 📋 Backend Setup (Python 3.13, Django 5.x)

### Using Docker

```bash
cd /Users/jane/Desktop/capitalOffer/base-app

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Seed database (optional)
docker-compose exec backend python seed_offers.py
```

### Local Development (Python 3.13)

```bash
cd /Users/jane/Desktop/capitalOffer/base-app/src/backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver 0.0.0.0:3000
```

## 🎨 Frontend Setup (Vue 3)

```bash
cd /Users/jane/Desktop/capitalOffer/base-app/src/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Frontend will be available at http://localhost:5173
```

## 🧪 Testing (Playwright)

```bash
cd /Users/jane/Desktop/capitalOffer/base-app/src/frontend

# Install Playwright browsers
npx playwright install

# Run all tests
npm run test

# Run with UI mode
npm run test:ui

# View test report
npm run test:report
```

## 📚 Project Structure

```
base-app/
├── src/
│   ├── backend/          # Django backend (Python 3.13, Django 5.x)
│   │   ├── app/         # Django app
│   │   ├── seed_offers.py  # Database seeding script
│   │   ├── requirements.txt  # Python dependencies
│   │   └── manage.py
│   └── frontend/        # Vue 3 frontend
│       ├── src/
│       ├── tests/       # Playwright E2E tests
│       ├── package.json
│       └── playwright.config.ts
├── docker-compose.yml
├── Dockerfile.backend
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/signup/` - User registration
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `POST /api/token/` - JWT token obtain pair
- `POST /api/token/refresh/` - JWT token refresh

### Offers
- `GET /api/offers/` - List offers
- `GET /api/offers/{id}/` - Get offer details
- `POST /api/offers/` - Create offer
- `PUT /api/offers/{id}/` - Update offer
- `DELETE /api/offers/{id}/` - Delete offer
- `POST /api/offers/{id}/actions/accept/` - Accept offer
- `POST /api/offers/{id}/actions/decline/` - Decline offer
- `POST /api/offers/{id}/actions/shortlist/` - Shortlist offer

### Profile
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile

### Lenders
- `GET /api/lenders/` - List lenders

## 🗃️ Database

PostgreSQL 14 is used for production data storage.

### Access Database

```bash
# With Docker
docker-compose exec db psql -U postgres -d capitaloffer

# View tables
docker-compose exec db psql -U postgres -d capitaloffer -c "\dt"

# View users
docker-compose exec db psql -U postgres -d capitaloffer -c "SELECT * FROM auth_user;"
```

### Local Database Access

```bash
# Connect to PostgreSQL (default credentials)
psql -U postgres -d capitaloffer -h localhost -p 5433

# Or with Docker exposed port
PQPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d capitaloffer
```

## 🔐 Test Credentials

### Public Users
- **Username**: alice
  - Email: test@gmail.com
  - Password: test@123
  - Offers: 4 offers (2 new, 1 accepted, 1 expired)

- **Username**: mike
  - Email: test@gmail.com
  - Password: test@123
  - Offers: 4 offers

### Private Users
- **Username**: jane
  - Email: test@gmail.com
  - Password: test@123
  - Offers: 4 offers (private)

- **Username**: tina
  - Email: test@gmail.com
  - Password: test@123
  - Offers: 4 offers (private)

## 🚦 Available Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Vue 3 + Bootstrap 5 application |
| Backend | http://localhost:3000 | Django REST API |
| PostgreSQL | localhost:5433 | Database server |
| Redis | localhost:6379 | Cache server |

## 🛠️ Environment Variables

### Backend (.env)
```
DEBUG=1
SECRET_KEY=your-secret-key
DB_HOST=db
DB_PORT=5432
DB_NAME=capitaloffer
DB_USER=postgres
DB_PASSWORD=postgres
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=capitalOffer
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild backend
docker-compose build backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute command in container
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run dev

# Access database
docker-compose exec db psql -U postgres -d capitaloffer

# View containers
docker-compose ps
```

## 🔄 Database Migration

```bash
# Create migration
python manage.py makemigrations

# Apply migration
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Reset database (DEVELOPMENT ONLY)
python manage.py flush
python seed_offers.py
```

## 📝 Notes

- **Python Version**: 3.13
- **Django Version**: 5.x (5.0 - 5.2 compatible)
- **PostgreSQL Version**: 14
- **Vue Version**: 3.4+
- **Playwright Version**: 1.58.2

## 📄 License

Private - CapitalOffer Project
