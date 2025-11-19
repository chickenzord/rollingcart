# Deployment Guide

This guide covers deploying RollingCart using Docker.

## Environment Variables

### Required
- `RAILS_MASTER_KEY` - Rails credentials master key (from `config/master.key`)

### Database Configuration
- `DATABASE_URL` - PostgreSQL connection URL (e.g., `postgresql://rollingcart:password@localhost/rollingcart`)
  - If not set, defaults to SQLite at `storage/production.sqlite3`
- `DATABASE_PATH` - Custom SQLite database path (default: `storage/production.sqlite3`)
- `CACHE_DATABASE_URL` - PostgreSQL URL for Solid Cache (optional)
- `QUEUE_DATABASE_URL` - PostgreSQL URL for Solid Queue (optional)
- `CABLE_DATABASE_URL` - PostgreSQL URL for Solid Cable (optional)

### Application Configuration
- `APP_HOST` - Application hostname (e.g., `rollingcart.example.com`)
- `ALLOWED_HOSTS` - Comma-separated allowed hostnames (e.g., `rollingcart.example.com`)
- `CORS_ORIGINS` - Comma-separated allowed CORS origins (default: `http://localhost:3000`)
- `PORT` - Server port (default: 3000, Thruster uses 80)
- `RAILS_LOG_LEVEL` - Log level (default: `info`)

### Optional
- `RAILS_MAX_THREADS` - Puma max threads (default: 5)
- `WEB_CONCURRENCY` - Puma worker processes (default: 1)
- `SOLID_QUEUE_IN_PUMA` - Run Solid Queue in Puma process (default: true)

## Docker Deployment

### Option 1: Docker Run (Single Container)

**With Thruster (HTTP/2, recommended):**
```bash
# Build
docker build -t rollingcart .

# Run
docker run -d \
  -p 80:80 \
  -e RAILS_MASTER_KEY=your-master-key \
  -e APP_HOST=rollingcart.example.com \
  -e ALLOWED_HOSTS=rollingcart.example.com \
  -e CORS_ORIGINS=https://rollingcart.example.com \
  -v rollingcart_storage:/rails/storage \
  --name rollingcart \
  rollingcart
```

**Without Thruster (Puma only):**
```bash
# Build
docker build -t rollingcart .

# Run
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e RAILS_MASTER_KEY=your-master-key \
  -e APP_HOST=rollingcart.example.com \
  -e ALLOWED_HOSTS=rollingcart.example.com \
  -e CORS_ORIGINS=https://rollingcart.example.com \
  -v rollingcart_storage:/rails/storage \
  --name rollingcart \
  rollingcart ./bin/rails server
```

### Option 2: Docker Compose (Recommended)

**SQLite (Simple setup):**

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      RAILS_MASTER_KEY: ${RAILS_MASTER_KEY}
      APP_HOST: rollingcart.example.com
      ALLOWED_HOSTS: rollingcart.example.com
      CORS_ORIGINS: https://rollingcart.example.com
    volumes:
      - storage:/rails/storage
    restart: unless-stopped

volumes:
  storage:
```

Run:
```bash
RAILS_MASTER_KEY=$(cat config/master.key) docker-compose up -d
```

**PostgreSQL (Better performance):**

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rollingcart
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: rollingcart
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  app:
    build: .
    ports:
      - "80:80"
    environment:
      RAILS_MASTER_KEY: ${RAILS_MASTER_KEY}
      DATABASE_URL: postgresql://rollingcart:${DB_PASSWORD}@db/rollingcart
      APP_HOST: rollingcart.example.com
      ALLOWED_HOSTS: rollingcart.example.com
      CORS_ORIGINS: https://rollingcart.example.com
    volumes:
      - storage:/rails/storage
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
  storage:
```

Create `.env` file:
```bash
RAILS_MASTER_KEY=your-master-key-here
DB_PASSWORD=your-db-password-here
```

Run:
```bash
docker-compose up -d
```

## Initial Setup

After first deployment, create your user and seed catalog:

```bash
# Docker run
docker exec -it rollingcart bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
docker exec -it rollingcart bin/rails catalog:seed EMAIL=you@example.com

# Docker compose
docker-compose exec app bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
docker-compose exec app bin/rails catalog:seed EMAIL=you@example.com
```

## Management Commands

### View logs
```bash
# Docker run
docker logs -f rollingcart

# Docker compose
docker-compose logs -f app
```

### Access Rails console
```bash
# Docker run
docker exec -it rollingcart bin/rails console

# Docker compose
docker-compose exec app bin/rails console
```

### Run database migrations
```bash
# Docker run
docker exec rollingcart bin/rails db:migrate

# Docker compose
docker-compose exec app bin/rails db:migrate
```

### Restart application
```bash
# Docker run
docker restart rollingcart

# Docker compose
docker-compose restart app
```

## Reverse Proxy Setup

### Nginx
```nginx
server {
    listen 80;
    server_name rollingcart.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rollingcart.example.com;

    ssl_certificate /etc/letsencrypt/live/rollingcart.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rollingcart.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Caddy (Automatic HTTPS)
```
rollingcart.example.com {
    reverse_proxy localhost:80
}
```

## Backup

### SQLite
```bash
# Backup storage volume
docker run --rm -v rollingcart_storage:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz /data

# Restore
docker run --rm -v rollingcart_storage:/data -v $(pwd):/backup alpine tar xzf /backup/backup-YYYYMMDD.tar.gz -C /
```

### PostgreSQL
```bash
# Backup
docker-compose exec db pg_dump -U rollingcart rollingcart > backup-$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U rollingcart rollingcart < backup-YYYYMMDD.sql
```

## Health Check

Visit: `https://rollingcart.example.com/up`

Expected response: "OK" with HTTP 200 status.

## Troubleshooting

### Check application status
```bash
docker ps
docker-compose ps
```

### View recent logs
```bash
docker logs --tail 100 rollingcart
docker-compose logs --tail 100 app
```

### Reset database (⚠️ DESTRUCTIVE)
```bash
# Docker run
docker exec rollingcart bin/rails db:reset
docker exec rollingcart bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
docker exec rollingcart bin/rails catalog:seed EMAIL=you@example.com

# Docker compose
docker-compose exec app bin/rails db:reset
docker-compose exec app bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
docker-compose exec app bin/rails catalog:seed EMAIL=you@example.com
```
