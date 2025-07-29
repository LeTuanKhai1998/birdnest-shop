#!/bin/bash

# =============================================================================
# BIRDNEST SHOP - PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="birdnest-shop"
BACKEND_IMAGE="birdnest-backend"
FRONTEND_IMAGE="birdnest-frontend"
REGISTRY="your-registry.com"  # Change this to your registry

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Build backend
    log_info "Building backend image..."
    docker build -t $REGISTRY/$BACKEND_IMAGE:latest ./backend
    docker push $REGISTRY/$BACKEND_IMAGE:latest
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t $REGISTRY/$FRONTEND_IMAGE:latest ./frontend
    docker push $REGISTRY/$FRONTEND_IMAGE:latest
    
    log_success "Images built and pushed successfully"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."
    
    # Pull latest images
    docker pull $REGISTRY/$BACKEND_IMAGE:latest
    docker pull $REGISTRY/$FRONTEND_IMAGE:latest
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Production deployment completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# Database migration
run_migrations() {
    log_info "Running database migrations..."
    
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
    
    log_success "Database migrations completed"
}

# Main deployment process
main() {
    log_info "Starting deployment process for $PROJECT_NAME..."
    
    # Check prerequisites
    check_docker
    
    # Build and push images (if needed)
    if [ "$1" = "--build" ]; then
        build_and_push_images
    fi
    
    # Run migrations
    run_migrations
    
    # Deploy to production
    deploy_production
    
    # Health checks
    health_check
    
    log_success "Deployment completed successfully!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:8080"
    log_info "Health Check: http://localhost:8080/health"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --build    Build and push Docker images before deployment"
    echo "  --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Deploy with existing images"
    echo "  $0 --build      # Build and deploy"
}

# Parse command line arguments
case "$1" in
    --help)
        usage
        exit 0
        ;;
    --build)
        main --build
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac 