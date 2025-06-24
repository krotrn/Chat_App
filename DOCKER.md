# Docker Setup for Chat App

This document explains how to run the Chat App using Docker for both development and production environments.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Production Setup

1. **Copy environment file:**

   ```bash
   cp .env.docker .env
   ```

2. **Update environment variables in `.env`:**

   - Set your actual API keys and secrets
   - Configure authentication providers
   - Set up Cloudinary credentials

3. **Build and run the application:**

   ```bash
   npm run docker:up
   ```

4. **Run database migrations:**

   ```bash
   npm run docker:prisma-migrate
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Database: localhost:5432

### Development Setup

1. **Start development environment:**

   ```bash
   npm run docker:dev
   ```

2. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec app-dev npx prisma migrate dev
   ```

## Available Docker Commands

| Command                         | Description                        |
| ------------------------------- | ---------------------------------- |
| `npm run docker:build`          | Build the production Docker image  |
| `npm run docker:run`            | Run the built image locally        |
| `npm run docker:up`             | Start production environment       |
| `npm run docker:down`           | Stop production environment        |
| `npm run docker:dev`            | Start development environment      |
| `npm run docker:dev-down`       | Stop development environment       |
| `npm run docker:logs`           | View application logs              |
| `npm run docker:exec`           | Access application container shell |
| `npm run docker:prisma-migrate` | Run Prisma migrations              |
| `npm run docker:prisma-studio`  | Open Prisma Studio                 |

## Architecture

### Production Environment

- **App Container**: Next.js application running in production mode
- **PostgreSQL Container**: Database with persistent volume
- **Network**: Isolated Docker network for service communication

### Development Environment

- **App Container**: Next.js with hot reloading and volume mounting
- **PostgreSQL Container**: Development database
- **Volumes**: Source code mounted for live reload

### Optional Variables

- Authentication provider credentials (GitHub, Google)
- Email service configuration (Resend)
- File upload service (Cloudinary)

## Database Management

### Running Migrations

```bash
# Production
npm run docker:prisma-migrate

# Development
docker-compose -f docker-compose.dev.yml exec app-dev npx prisma migrate dev
```

### Accessing Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U chatapp_user -d chatapp
```

### Prisma Studio

```bash
# Production
npm run docker:prisma-studio

# Development
docker-compose -f docker-compose.dev.yml exec app-dev npx prisma studio
```

## Troubleshooting

### Container Issues

```bash
# View logs
docker-compose logs app
docker-compose logs postgres

# Restart services
docker-compose restart

# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues

1. Ensure PostgreSQL container is running
2. Check environment variables
3. Verify network connectivity between containers

### Permission Issues

```bash
# Fix file permissions (if needed)
sudo chown -R $USER:$USER .
```

## Production Deployment

### Building for Production

```bash
# Build optimized image
docker build -t chat-app:latest .

# Tag for registry
docker tag chat-app:latest your-registry/chat-app:latest

# Push to registry
docker push your-registry/chat-app:latest
```

### Environment-Specific Configs

Create separate environment files:

- `.env.development`
- `.env.staging`
- `.env.production`

## Security Considerations

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Database**: Use strong passwords in production
3. **Secrets**: Rotate secrets regularly
4. **Network**: Use proper firewall rules in production
5. **Images**: Regularly update base images for security patches

## Performance Optimization

1. **Multi-stage Build**: Dockerfile uses multi-stage builds for smaller images
2. **Standalone Output**: Next.js standalone output reduces image size
3. **Alpine Images**: Uses Alpine Linux for smaller footprint
4. **Layer Caching**: Optimized layer order for better caching

## Monitoring

### Health Checks

Add health checks to docker-compose.yml:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logs

```bash
# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs app
docker-compose logs postgres
```
