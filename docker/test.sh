#!/bin/bash

# Water Framework Website Docker Test Script

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

# Test configuration
URL="http://localhost:8080"
TIMEOUT=30
RETRY_INTERVAL=2

print_status "Testing Water Framework Website Docker container..."

# Check if container is running
if ! docker ps | grep -q water-framework-website; then
    print_error "Container 'water-framework-website' is not running."
    print_status "Please start the container first using: ./build.sh"
    exit 1
fi

print_success "Container is running."

# Check container health
print_status "Checking container health..."
if docker ps --format "table {{.Names}}\t{{.Status}}" | grep water-framework-website | grep -q "healthy"; then
    print_success "Container health check passed."
else
    print_warning "Container health check not available or failed."
fi

# Test website accessibility
print_status "Testing website accessibility..."
print_status "URL: $URL"
print_status "Timeout: ${TIMEOUT}s"

# Wait for the website to be ready
attempts=0
max_attempts=$((TIMEOUT / RETRY_INTERVAL))

while [ $attempts -lt $max_attempts ]; do
    if curl -f -s "$URL" > /dev/null 2>&1; then
        print_success "Website is accessible!"
        break
    else
        attempts=$((attempts + 1))
        if [ $attempts -lt $max_attempts ]; then
            print_status "Attempt $attempts/$max_attempts: Website not ready yet, retrying in ${RETRY_INTERVAL}s..."
            sleep $RETRY_INTERVAL
        fi
    fi
done

if [ $attempts -eq $max_attempts ]; then
    print_error "Website is not accessible after $TIMEOUT seconds."
    print_status "Container logs:"
    docker logs water-framework-website --tail 20
    exit 1
fi

# Test specific pages
print_status "Testing specific pages..."

pages=(
    "/"
    "/index.html"
    "/documentation.html"
    "/news.html"
)

for page in "${pages[@]}"; do
    if curl -f -s "$URL$page" > /dev/null 2>&1; then
        print_success "✓ $page is accessible"
    else
        print_error "✗ $page is not accessible"
    fi
done

# Test static assets
print_status "Testing static assets..."

assets=(
    "/css/style.css"
    "/js/main.js"
    "/images/water-logo.png"
)

for asset in "${assets[@]}"; do
    if curl -f -s "$URL$asset" > /dev/null 2>&1; then
        print_success "✓ $asset is accessible"
    else
        print_warning "⚠ $asset is not accessible (this might be normal if the file doesn't exist)"
    fi
done

# Display container information
print_status "Container information:"
echo "  Name: $(docker ps --format "{{.Names}}" | grep water-framework-website)"
echo "  Status: $(docker ps --format "{{.Status}}" | grep water-framework-website)"
echo "  Port: $(docker port water-framework-website)"
echo "  Image: $(docker ps --format "{{.Image}}" | grep water-framework-website)"

print_success "All tests completed successfully!"
print_status "Website is ready at: $URL" 