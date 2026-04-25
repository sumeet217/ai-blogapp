# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /frontend

# Install node deps first (layer cache)
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Python base

FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Stage 3: Python dependencies

FROM base AS deps

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 4: Final production image

FROM deps AS app

# Copy Django backend
COPY . .

# Copy built React dist from frontend-builder stage
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Collect Django static files
RUN SECRET_KEY=build-time-placeholder python manage.py collectstatic --noinput

EXPOSE 8000

# Run migrations then start gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn blogs.wsgi:application --bind 0.0.0.0:8000 --workers 2"]
