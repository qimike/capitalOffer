# capitalOffer - Full Stack Application

A complete full-stack loan offer platform built with Django 4.2 (Python 3.13), Vue 3, Bootstrap 5, and PostgreSQL 14.

## 🚀 Quick Start

### Prerequisites

- **Python 3.13** (Install using Homebrew if needed):
  ```bash
  brew install python@3.13
  ```

- **npm** (Node.js)

- **PostgreSQL 14** (Optional - SQLite used for development by default)

### Setup Instructions

#### 1. Backend Setup

```bash
cd /capitalOffer/base-app/src/backend

# Fix Homebrew permissions (if needed for Python 3.13)
sudo chown -R michael /opt/homebrew /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew/locks
chmod u+w /opt/homebrew /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew/locks

# Install Python 3.13 (if not already installed)
brew install python@3.13

# Create virtual environment with Python 3.13
python3.13 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (.env file already exists)
# .env file contains PostgreSQL Docker configuration:
#   DB_HOST=db
#   DB_PORT=5432
#   DB_NAME=capitaloffer
#   DB_USER=postgres
#   DB_PASSWORD=postgres

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver 0.0.0.0:3000
```

#### 2. Start PostgreSQL with Docker

```bash
# Navigate to base-app directory
cd /capitalOffer/base-app

# Start PostgreSQL and Redis containers
docker-compose up -d db redis

# Check container status
docker-compose ps

# View database logs
docker-compose logs -f db
```

#### 3. Frontend Setup

```bash
cd /capitalOffer/base-app/src/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📖 Running the Application

### Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
cd /capitalOffer/base-app
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Stop and remove all containers, volumes
docker-compose down -v
```

### Running Services Separately

#### Backend (Django)

```bash
cd /capitalOffer/base-app/src/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:3000
```

The backend API will be available at **http://localhost:3000**

**Available Commands:**
- Run migrations: `python manage.py migrate`
- Create superuser: `python manage.py createsuperuser`
- Run tests: `python manage.py test`
- Collect static files: `python manage.py collectstatic`

### Frontend (Vue 3)

```bash
cd /capitalOffer/base-app/src/frontend
npm run dev
```

The frontend will be available at **http://localhost:5173**

**Available Commands:**
- Development: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## 🌐 Access the Application

- **Frontend UI**: http://localhost:5173
  - Login: http://localhost:5173/login
  - Signup: http://localhost:5173/signup
  - Offers: http://localhost:5173/offers

- **Backend API**: http://localhost:3000
  - Health check: http://localhost:3000/health
  - API docs: http://localhost:3000/api

- **Django Admin**: http://localhost:3000/admin (use superuser credentials)

## 🛠️ Project Structure

```
base-app/
├── src/
│   ├── backend/               # Django backend
│   │   ├── app/              # Main Django app
│   │   ├── manage.py         # Django management script
│   │   ├── settings.py       # Django settings
│   │   ├── requirements.txt  # Python dependencies
│   │   └── .env             # Environment variables
│   └── frontend/             # Vue 3 frontend
│       ├── src/
│       │   ├── components/   # Reusable components
│       │   ├── views/        # Page components
│       │   ├── router/       # Vue Router config
│       │   └── main.js       # App entry point
│       ├── package.json      # Node.js dependencies
│       └── vite.config.js    # Vite configuration
├── docker-compose.yml        # Development Docker config
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file in the `src/backend/` directory:

```env
DEBUG=1
SECRET_KEY=your-secret-key-here
# PostgreSQL Docker configuration
DB_HOST=db
DB_PORT=5432
DB_NAME=capitaloffer
DB_USER=postgres
DB_PASSWORD=postgres
```

## 📝 Testing

### Backend Tests

```bash
cd /capitalOffer/base-app/src/backend
source venv/bin/activate
python manage.py test
```

### Frontend Tests

```bash
cd /capitalOffer/base-app/src/frontend
npm run test
```

## 🐳 Docker Development (Optional)

```bash
# Start all services with Docker Compose
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

