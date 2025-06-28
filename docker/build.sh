#!/bin/bash

# Water Framework Website Docker Build Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Using Docker directly."
    USE_COMPOSE=false
else
    USE_COMPOSE=true
fi

# Function to build and run with Docker Compose
build_with_compose() {
    print_status "Building and running with Docker Compose..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start
    docker-compose up --build -d
    
    print_success "Container started successfully!"
    print_status "Website is available at: http://localhost:8080"
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Function to build and run with Docker directly
build_with_docker() {
    print_status "Building with Docker..."
    
    # Stop and remove existing container
    docker stop water-framework-website 2>/dev/null || true
    docker rm water-framework-website 2>/dev/null || true
    
    # Build the image with water-site tag
    docker build -t water-site -f Dockerfile ..
    
    # Run the container
    docker run -d -p 8080:8080 --name water-framework-website water-site
    
    print_success "Container started successfully!"
    print_status "Website is available at: http://localhost:8080"
    print_status "To view logs: docker logs -f water-framework-website"
    print_status "To stop: docker stop water-framework-website"
}

# Main execution
print_status "Starting Water Framework Website Docker build..."

# Change to docker directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the docker directory."
    exit 1
fi

# Build and run
if [ "$USE_COMPOSE" = true ]; then
    build_with_compose
else
    build_with_docker
fi

print_success "Build completed successfully!" 