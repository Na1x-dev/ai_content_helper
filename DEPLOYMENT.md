# Production deployment

This guide deploys the React SPA, Django API, Celery worker, PostgreSQL, Redis and Caddy TLS gateway using Docker Compose.

## Requirements

- A Linux server with Docker Engine and the Docker Compose plugin.
- A domain name with DNS A/AAAA records pointing to the server.
- Inbound TCP ports 80 and 443 available for Caddy's automatic HTTPS certificates.

## Configure secrets

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and replace all placeholder values. Generate a Django secret, for example with `python -c "import secrets; print(secrets.token_urlsafe(50))"`. Use unique strong passwords for PostgreSQL and the initial administrator. Configure the Google OAuth authorized origin and redirect URI for your domain in Google Cloud Console.

Set `DOMAIN`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, and `CORS_ALLOWED_ORIGINS` to your actual domain. Keep `DEBUG=False` and `AI_MOCK_MODE=False` for real AI generation. Do not commit `.env.production`.

## Start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml config
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f web gateway
```

Only the gateway publishes ports. PostgreSQL and Redis are internal to the Compose network and are not exposed publicly. Caddy obtains and renews HTTPS certificates automatically once DNS and ports are configured.

## Operations

```bash
# Follow application logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f

# Apply application updates
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# Back up PostgreSQL (store the dump securely off-server)
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
```

Do not use `docker compose down -v` on a production instance: it deletes persistent database, Redis and Caddy data. Establish tested off-site backups and a restore procedure before handling real user data.

## Before exposing the service

- Verify Google OAuth callbacks and the frontend API URL.
- Confirm the `init` management command is safe to rerun, as the web container runs it on startup.
- Review billing, email delivery, monitoring, log retention, and database backup/restore for your operating requirements.
- Run the frontend lint/build and backend checks in CI; this deployment change has not been exercised against a live server.
