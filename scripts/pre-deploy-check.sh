#!/bin/bash
# Pre-deployment check script for TOGETHER Blog System
# This script validates the environment before deploying to Dokploy
# Author: TOGETHER Team
# Version: 1.0

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TOGETHER Blog - Pre-Deployment Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print info message
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root (optional, warn only)
if [ "$EUID" -eq 0 ]; then 
    warning "Running as root. Consider using a non-root user with Docker permissions."
fi

# 1. Check Docker installation
info "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    success "Docker found: $DOCKER_VERSION"
else
    error "Docker is not installed"
    exit 1
fi

# 2. Check Docker Compose installation
info "Checking Docker Compose installation..."
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version | awk '{print $4}')
    success "Docker Compose found: $COMPOSE_VERSION"
else
    error "Docker Compose is not installed"
    exit 1
fi

# 3. Check if Docker daemon is running
info "Checking Docker daemon status..."
if docker info &> /dev/null; then
    success "Docker daemon is running"
else
    error "Docker daemon is not running"
    exit 1
fi

# 4. Validate docker-compose.yml syntax
info "Validating docker-compose.yml syntax..."
if docker compose config &> /dev/null; then
    success "docker-compose.yml syntax is valid"
else
    error "docker-compose.yml has syntax errors"
    docker compose config
    exit 1
fi

# 5. Check environment variables
info "Checking environment variables..."
if [ -f .env ]; then
    success ".env file found"
    
    # Check critical variables
    if grep -q "^DOMAIN=" .env; then
        DOMAIN_VALUE=$(grep "^DOMAIN=" .env | cut -d '=' -f2)
        success "DOMAIN is set: $DOMAIN_VALUE"
    else
        warning "DOMAIN not set in .env, will use default: 171780.xyz"
    fi
    
    if grep -q "^DB_PASSWORD=" .env; then
        DB_PASS=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2)
        if [ "$DB_PASS" = "YOUR_SECURE_PASSWORD_HERE" ] || [ "$DB_PASS" = "change_this_password" ]; then
            error "Database password is using default value! Please change it for security."
            exit 1
        else
            success "Database password is configured"
        fi
    else
        warning "DB_PASSWORD not set in .env, will use default (NOT RECOMMENDED for production)"
    fi
else
    warning ".env file not found, will use default values from docker-compose.yml"
fi

# 6. Check for Docker network conflicts
info "Checking for Docker network conflicts..."
PROJECT_NAME=${COMPOSE_PROJECT_NAME:-together-blog}

# Check if dokploy-network exists
if docker network inspect dokploy-network &> /dev/null; then
    success "dokploy-network exists"
else
    warning "dokploy-network not found. Make sure you're running on a Dokploy-managed server."
fi

# 7. Check for port conflicts (if deploying locally)
if [ "${CHECK_PORTS:-false}" = "true" ]; then
    info "Checking for port conflicts..."
    
    if lsof -Pi :80 -sTCP:LISTEN -t &> /dev/null; then
        warning "Port 80 is already in use"
    else
        success "Port 80 is available"
    fi
    
    if lsof -Pi :443 -sTCP:LISTEN -t &> /dev/null; then
        warning "Port 443 is already in use"
    else
        success "Port 443 is available"
    fi
fi

# 8. Check for old containers
info "Checking for old containers..."
OLD_CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" --format "{{.Names}}" 2>/dev/null || true)

if [ -n "$OLD_CONTAINERS" ]; then
    warning "Found existing containers:"
    echo "$OLD_CONTAINERS" | while read container; do
        STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        echo "  - $container (status: $STATUS)"
    done
    
    echo ""
    echo -e "${YELLOW}Recommendation: Run the network cleanup script before deploying:${NC}"
    echo -e "  ${BLUE}./scripts/network-cleanup.sh ${PROJECT_NAME}${NC}"
else
    success "No old containers found"
fi

# 9. Check disk space
info "Checking disk space..."
AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
AVAILABLE_SPACE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

if [ "$AVAILABLE_SPACE_GB" -lt 5 ]; then
    warning "Low disk space: $AVAILABLE_SPACE available (recommend at least 5GB)"
else
    success "Sufficient disk space: $AVAILABLE_SPACE available"
fi

# 10. Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Pre-Deployment Check Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
success "All critical checks passed!"
echo ""
info "Project: TOGETHER Blog System"
info "Deployment ready: YES"
echo ""
echo -e "${GREEN}You can now proceed with deployment:${NC}"
echo -e "  ${BLUE}1. On Dokploy Web UI: Click 'Deploy' button${NC}"
echo -e "  ${BLUE}2. Or via CLI: docker compose up -d${NC}"
echo ""
