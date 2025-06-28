# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file from docker directory
COPY docker/requirements.txt .

# Install Python dependencies (if any)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the website files
COPY . /app/

# Create a simple Python server script
RUN echo '#!/usr/bin/env python3\n\
import http.server\n\
import socketserver\n\
import os\n\
\n\
# Change to the directory containing the website files\n\
os.chdir("/app")\n\
\n\
# Set up the server\n\
PORT = int(os.environ.get("PORT", 8080))\n\
Handler = http.server.SimpleHTTPRequestHandler\n\
\n\
# Add CORS headers for development\n\
class CORSHTTPRequestHandler(Handler):\n\
    def end_headers(self):\n\
        self.send_header("Access-Control-Allow-Origin", "*")\n\
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")\n\
        self.send_header("Access-Control-Allow-Headers", "Content-Type")\n\
        super().end_headers()\n\
\n\
print(f"Starting Water Framework website server on port {PORT}")\n\
print("Website will be available at: http://localhost:{PORT}")\n\
\n\
with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:\n\
    print("Server started successfully!")\n\
    httpd.serve_forever()\n\
' > /app/server.py

# Make the server script executable
RUN chmod +x /app/server.py

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Run the server
CMD ["python", "/app/server.py"] 