# Water Framework Website - Docker Setup

This directory contains Docker configuration to run the Water Framework website using Python's built-in HTTP server.

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the container:**
   ```bash
   cd docker
   docker-compose up --build
   ```

2. **Access the website:**
   Open your browser and go to: http://localhost:8080

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   cd docker
   docker build -t water-framework-website -f Dockerfile ..
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8080:8080 --name water-framework-website water-framework-website
   ```

3. **Access the website:**
   Open your browser and go to: http://localhost:8080

4. **Stop and remove the container:**
   ```bash
   docker stop water-framework-website
   docker rm water-framework-website
   ```

## Configuration

### Environment Variables

- `PORT`: Port number for the server (default: 8080)
- `PYTHONUNBUFFERED`: Set to 1 for unbuffered Python output

### Port Mapping

The default configuration maps port 8080 on the host to port 8080 in the container. You can change this by modifying the `docker-compose.yml` file or using the `-p` flag with docker run.

### Volumes

- `./logs:/app/logs`: Mounts a logs directory for persistent logging
- For development, you can uncomment the volume mount in `docker-compose.yml` to enable live reload

## Development

### Live Reload (Development Mode)

To enable live reload during development, uncomment the volume mount in `docker-compose.yml`:

```yaml
volumes:
  - ../:/app  # Uncomment this line
  - ./logs:/app/logs
```

### Health Checks

The container includes health checks that verify the website is accessible. You can check the health status with:

```bash
docker ps
```

## Troubleshooting

### Container won't start

1. Check if port 8080 is already in use:
   ```bash
   lsof -i :8080
   ```

2. Check container logs:
   ```bash
   docker logs water-framework-website
   ```

### Website not accessible

1. Verify the container is running:
   ```bash
   docker ps
   ```

2. Check if the port is correctly mapped:
   ```bash
   docker port water-framework-website
   ```

3. Test the health check:
   ```bash
   docker exec water-framework-website curl -f http://localhost:8080/
   ```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (nginx, Apache) in front of the Python server
2. **Using a production WSGI server** like Gunicorn instead of the built-in server
3. **Setting up SSL/TLS** certificates
4. **Configuring proper logging** and monitoring
5. **Using environment-specific configurations**

## Files

- `Dockerfile`: Main Docker configuration
- `docker-compose.yml`: Docker Compose configuration for easy management
- `requirements.txt`: Python dependencies (currently empty, using built-in modules)
- `.dockerignore`: Files to exclude from Docker build context
- `README.md`: This documentation file 