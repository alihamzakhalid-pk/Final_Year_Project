# Multi-stage Dockerfile for Railway deployment
# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy React app files
COPY botme-ui-react/package*.json ./
RUN npm install

# Copy source code
COPY botme-ui-react/ ./

# Build the React app
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy built React app to Flask static folder
COPY --from=frontend-build /app/frontend/dist ./static

# Create necessary directories
RUN mkdir -p uploads/voice_samples chroma_db flask_session instance

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production
ENV FLASK_APP=app.py

# Run the Flask application
CMD ["python", "app.py"]