# 🚀 Birdnest Shop - Deployment Guide

This guide covers the complete deployment setup for the Birdnest Shop application, including local development, staging, and production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) and **npm** (v8+)
- **Git** (v2.30+)

### Required Services
- **PostgreSQL Database** (v15+)
- **Redis** (v7+) - for caching and sessions
- **Domain/SSL Certificates** (for production)

## 🏠 Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd birdnest-shop
   ```

2. **Setup environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your local settings
   
   # Frontend
   cp frontend/env.example frontend/.env.local
   # Edit frontend/.env.local with your local settings
   ```

3. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Health Check: http://localhost:8080/health
   - Swagger Docs: http://localhost:8080/swagger

### Manual Development Setup

1. **Backend Setup**
   ```bash
   cd birdnest-backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run start:dev
   ```

2. **Frontend Setup**
   ```bash
   cd birdnest-frontend
   npm install
   npm run dev
   ```

## 🌐 Production Deployment

### Option 1: Docker Deployment

1. **Build and deploy**
   ```bash
   # Make deployment script executable
   chmod +x scripts/deploy.sh
   
   # Deploy with existing images
   ./scripts/deploy.sh
   
   # Build and deploy
   ./scripts/deploy.sh --build
   ```

2. **Manual deployment**
   ```bash
   # Build images
   docker build -t birdnest-backend:latest ./backend
   docker build -t birdnest-frontend:latest ./frontend
   
   # Deploy with production compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 2: Cloud Platform Deployment

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Render
```bash
# Connect your GitHub repository to Render
# Configure build settings:
# - Build Command: npm install && npm run build
# - Start Command: npm start
```

#### Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

### Option 3: VPS Deployment

1. **Server setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd birdnest-shop
   
   # Setup environment
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env.local
   
   # Edit environment files with production values
   nano backend/.env
   nano frontend/.env.local
   
   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🔐 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Application
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://yourdomain.com

# Security
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# External Services
STRIPE_SECRET_KEY=sk_live_...
UPLOADTHING_SECRET=sk_live_...
RESEND_API_KEY=re_...
```

### Frontend (.env.local)
```bash
# Application
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
UPLOADTHING_SECRET=sk_live_...
```

## 🏥 Health Checks

### Backend Health Endpoints
- **Overall Health**: `GET /health`
- **Readiness**: `GET /health/ready`
- **Liveness**: `GET /health/live`

### Frontend Health Endpoint
- **Health Check**: `GET /api/health`

### Docker Health Checks
```bash
# Check container health
docker ps

# View health check logs
docker inspect <container-name> | grep -A 10 "Health"
```

## 📊 Monitoring

### Application Monitoring
- **Health Checks**: Built-in endpoints for monitoring
- **Logs**: Docker logs and application logs
- **Metrics**: Performance monitoring via NestJS interceptors

### External Monitoring (Optional)
- **UptimeRobot**: Monitor API endpoints
- **Sentry**: Error tracking and performance monitoring
- **Logtail**: Centralized logging

### Setup UptimeRobot
1. Create account at [UptimeRobot](https://uptimerobot.com)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://yourdomain.com/health`
   - Interval: 5 minutes
   - Alert: Email/SMS

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

#### Port Conflicts
```bash
# Check port usage
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :3000

# Kill process using port
sudo kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Rebuild images
docker-compose build --no-cache
```

#### SSL Certificate Issues
```bash
# Generate self-signed certificate for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Logs and Debugging

#### View Application Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

#### Debug Mode
```bash
# Enable debug logging
export DEBUG=*
docker-compose up
```

## 🔄 CI/CD Pipeline

### GitHub Actions
The project includes a complete CI/CD pipeline:

1. **On Push/PR**: Runs tests and builds
2. **On Main Branch**: Builds and pushes Docker images
3. **Security**: Runs vulnerability scans

### Required Secrets
Set these in your GitHub repository:
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password/token

## 📈 Performance Optimization

### Production Optimizations
- **Caching**: Redis for session and data caching
- **Compression**: Nginx gzip compression
- **CDN**: Static asset delivery
- **Database**: Connection pooling and indexing

### Monitoring Commands
```bash
# Check resource usage
docker stats

# Monitor application performance
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8080/health"

# Database performance
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 🆘 Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs
3. Verify environment variables
4. Check Docker container health

---

**Happy Deploying! 🚀** 