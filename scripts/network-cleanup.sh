#!/bin/bash
# Network cleanup script for TOGETHER Blog System
# This script safely cleans up Docker network endpoints and containers
# to prevent "endpoint not found" errors during deployment
# Author: TOGETHER Team
# Version: 1.0

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project name from argument or use default
PROJECT_NAME="${1:-together-blog}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TOGETHER Blog - Network Cleanup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Project: ${PROJECT_NAME}${NC}"
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

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    error "Docker daemon is not running"
    exit 1
fi

# Warning before proceeding
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Stop all containers matching project name: ${PROJECT_NAME}"
echo "  2. Remove stopped containers"
echo "  3. Prune unused Docker networks"
echo ""
read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Cleanup cancelled by user"
    exit 0
fi

echo ""

# Step 1: List all containers matching the project name
info "Step 1: Finding containers for project: ${PROJECT_NAME}..."
CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" --format "{{.ID}}\t{{.Names}}\t{{.Status}}" 2>/dev/null || true)

if [ -z "$CONTAINERS" ]; then
    info "No containers found for project: ${PROJECT_NAME}"
else
    echo ""
    echo "Found containers:"
    echo "$CONTAINERS" | while IFS=$'\t' read -r id name status; do
        echo "  - $name (ID: ${id:0:12}, Status: $status)"
    done
    echo ""
fi

# Step 2: Stop running containers
info "Step 2: Stopping running containers..."
RUNNING_CONTAINERS=$(docker ps --filter "name=${PROJECT_NAME}" --format "{{.ID}}" 2>/dev/null || true)

if [ -z "$RUNNING_CONTAINERS" ]; then
    info "No running containers to stop"
else
    echo "$RUNNING_CONTAINERS" | while read container_id; do
        CONTAINER_NAME=$(docker inspect --format='{{.Name}}' "$container_id" | sed 's/\///')
        info "Stopping container: $CONTAINER_NAME (${container_id:0:12})"
        docker stop "$container_id" &> /dev/null || warning "Failed to stop $CONTAINER_NAME"
    done
    success "All containers stopped"
fi

# Step 3: Remove stopped containers
info "Step 3: Removing stopped containers..."
STOPPED_CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" --filter "status=exited" --format "{{.ID}}" 2>/dev/null || true)

if [ -z "$STOPPED_CONTAINERS" ]; then
    info "No stopped containers to remove"
else
    echo "$STOPPED_CONTAINERS" | while read container_id; do
        CONTAINER_NAME=$(docker inspect --format='{{.Name}}' "$container_id" 2>/dev/null | sed 's/\///' || echo "unknown")
        info "Removing container: $CONTAINER_NAME (${container_id:0:12})"
        docker rm "$container_id" &> /dev/null || warning "Failed to remove $CONTAINER_NAME"
    done
    success "All stopped containers removed"
fi

# Step 4: Prune unused networks
info "Step 4: Pruning unused Docker networks..."
PRUNED_NETWORKS=$(docker network prune -f 2>&1 | grep "Deleted Networks:" || echo "")

if [ -z "$PRUNED_NETWORKS" ]; then
    info "No unused networks to prune"
else
    success "Unused networks pruned"
fi

# Step 5: Verify cleanup
info "Step 5: Verifying cleanup..."
REMAINING_CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}" --format "{{.Names}}" 2>/dev/null || true)

if [ -z "$REMAINING_CONTAINERS" ]; then
    success "All containers cleaned up successfully"
else
    warning "Some containers still exist:"
    echo "$REMAINING_CONTAINERS" | while read container; do
        STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        echo "  - $container (status: $STATUS)"
    done
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Cleanup Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
success "Network cleanup completed!"
echo ""
info "Next steps:"
echo -e "  ${BLUE}1. On Dokploy Web UI: Click 'Redeploy' button${NC}"
echo -e "  ${BLUE}2. Or via CLI in project directory: docker compose up -d${NC}"
echo ""
info "The 'endpoint not found' error should now be resolved."
echo ""
