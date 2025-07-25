#!/bin/bash

# Leipzig Bürgerbüro System Setup Script
# Author: Adnan EL Hoshy

set -e

echo "🏛️  Setting up Leipzig Bürgerbüro Application Tracking System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root${NC}" 
   exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Python is installed (for local development)
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed. Docker setup will still work."
else
    PYTHON_VERSION=$(python3 --version | cut -d" " -f2 | cut -d"." -f1,2)
    print_status "Found Python $PYTHON_VERSION"
fi

# Check if Node.js is installed (for frontend development)
if ! command -v node &> /dev/null; then
    print_warning "Node.js is not installed. Frontend development will be limited to Docker."
else
    NODE_VERSION=$(node --version)
    print_status "Found Node.js $NODE_VERSION"
fi

# Create project directory structure
print_status "Creating project directory structure..."

# Backend structure
mkdir -p backend/app/{models,schemas,api/v1,core,utils}
mkdir -p backend/tests
mkdir -p backend/alembic/versions
mkdir -p backend/uploads

# Frontend structure
mkdir -p frontend/{public,src/{components/{common,citizen,staff},pages,services,utils,styles}}

# Mobile structure
mkdir -p mobile/{android,ios,src/{components,screens,services,navigation}}

# Documentation
mkdir -p documentation

# Scripts
mkdir -p scripts

# Monitoring
mkdir -p monitoring

# Nginx
mkdir -p nginx

print_success "Directory structure created!"

# Create environment files
print_status "Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_success "Backend .env file created from template"
else
    print_warning "Backend .env file already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
REACT_APP_SUPPORTED_LANGUAGES=de,en,ar,fr,es
REACT_APP_DEFAULT_LANGUAGE=de
EOF
    print_success "Frontend .env file created"
else
    print_warning "Frontend .env file already exists"
fi

# Generate secret key for backend
print_status "Generating secret key..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || openssl rand -base64 32)
sed -i '' "s/hfkljewhflkewhfkewfhlekwrfgoewrgfkerwgklwrbgkowegbklwebgkwebgekbgkwem/$SECRET_KEY/" backend/.env


# Set up pre-commit hooks (if available)
if command -v pre-commit &> /dev/null; then
    print_status "Setting up pre-commit hooks..."
    pre-commit install
    print_success "Pre-commit hooks installed"
fi

# Create initial database migration
print_status "Setting up database migrations..."
if [ -d "backend/venv" ]; then
    cd backend
    source venv/bin/activate
    alembic init alembic 2>/dev/null || print_warning "Alembic already initialized"
    cd ..
fi

# Build and start services
print_status "Building Docker containers..."
docker compose build

print_status "Starting services..."
docker compose up -d db redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Run database migrations
print_status "Running database migrations..."
docker compose run --rm backend alembic upgrade head || print_warning "No migrations to run yet"

# Create admin user (optional)
read -p "Do you want to create an admin user? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating admin user..."
    # This would be implemented in a separate script
    print_warning "Admin user creation script not implemented yet"
fi

# Start all services
print_status "Starting all services..."
docker compose up -d

# Display status
echo
print_success "🎉 Leipzig Bürgerbüro System setup completed!"
echo
echo "Services:"
echo "  📊 Backend API: http://localhost:8000"
echo "  📚 API Documentation: http://localhost:8000/docs"
echo "  🖥️  Database: localhost:5432"
echo "  🔧 Redis: localhost:6379"
echo "  📧 Mailhog (Email testing): http://localhost:8025"
echo
echo "Development commands:"
echo "  🐳 Start all services: docker-compose up -d"
echo "  🛑 Stop all services: docker-compose down"
echo "  📝 View logs: docker-compose logs -f [service_name]"
echo "  🔄 Restart service: docker-compose restart [service_name]"
echo
print_status "To view real-time logs: docker-compose logs -f"
print_status "To stop all services: docker-compose down"
echo
print_success "Happy coding! 🚀"