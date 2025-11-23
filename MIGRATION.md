# Migration Guide: v1.0 → v2.0

This guide helps you migrate from OmniForge Council v1.0 (legacy) to v2.0 (enterprise edition).

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Code Updates](#code-updates)
5. [Configuration Changes](#configuration-changes)
6. [Testing Migration](#testing-migration)
7. [Rollback Plan](#rollback-plan)

---

## Overview

### What's Changing?

Version 2.0 is a complete architectural overhaul that:
- Adds multi-platform support (iOS, Android, Windows Desktop)
- Introduces enterprise-grade features (auth, database, caching)
- Restructures the codebase for better maintainability
- Preserves the legacy runtime as an optional fallback

### Migration Timeline

- **Preparation**: 1-2 hours (review this guide)
- **Implementation**: 2-4 hours (update code and config)
- **Testing**: 1-2 hours (verify functionality)
- **Total**: 4-8 hours for typical installation

---

## Breaking Changes

### 1. Directory Structure

**v1.0:**
```
src/
├── server/
│   ├── index.ts
│   └── orchestrator.ts
├── client/
│   └── ...
└── shared/
    └── types.ts
```

**v2.0:**
```
src/
├── api/           # New API layer
│   ├── index.ts
│   └── ApiServer.ts
├── core/          # New core engine
│   └── CouncilEngine.ts
├── client/        # Same as v1
│   └── ...
└── shared/        # Same as v1
    └── types.ts

platforms/
├── legacy/        # Your old v1 code
├── web/           # PWA
├── mobile/        # iOS/Android
└── desktop/       # Windows
```

### 2. Import Paths

**v1.0:**
```typescript
import { CouncilOrchestrator } from './server/orchestrator';
```

**v2.0:**
```typescript
import { CouncilEngine } from './core/CouncilEngine';
import { ApiServer } from './api/ApiServer';
```

### 3. API Endpoints

**v1.0:**
```
POST /api/council/query
GET  /api/council/state
POST /api/council/config
```

**v2.0:**
```
POST /api/v1/council/query    # Versioned
GET  /api/v1/council/state
POST /api/v1/council/config

# Legacy endpoints redirect to v1
POST /api/council/query → /api/v1/council/query
```

### 4. Configuration

**v1.0** `.env`:
```env
PORT=3001
NODE_ENV=development
```

**v2.0** `.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# New: Database
DATABASE_URL=postgresql://user:password@localhost:5432/omniforge

# New: Redis
REDIS_URL=redis://localhost:6379

# New: Security
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:3000

# New: Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

---

## Step-by-Step Migration

### Option A: Fresh Installation (Recommended)

This is the safest approach for production systems.

#### Step 1: Backup Current Installation

```bash
# Backup your current v1.0 installation
cp -r /path/to/agi_council /path/to/agi_council_v1_backup

# Export any important data
# (if you have custom configurations or data files)
```

#### Step 2: Install v2.0 Alongside v1.0

```bash
# Clone v2.0 to a new directory
git clone https://github.com/MASSIVEMAGNETICS/agi_council.git agi_council_v2
cd agi_council_v2

# Install dependencies
npm install

# Copy your v1.0 environment settings
cp ../agi_council_v1_backup/.env .env

# Add new required environment variables
cat >> .env << EOF

# Database (new in v2.0)
DATABASE_URL=postgresql://localhost:5432/omniforge

# Redis (new in v2.0)
REDIS_URL=redis://localhost:6379

# Security (new in v2.0)
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=http://localhost:3000
EOF
```

#### Step 3: Set Up Infrastructure

```bash
# Option 1: Using Docker (recommended)
docker-compose up -d postgres redis

# Option 2: Install locally
# Install PostgreSQL and Redis on your system
```

#### Step 4: Build and Test

```bash
# Build the application
npm run build

# Run tests
npm test

# Start in development mode
npm run dev
```

#### Step 5: Verify Functionality

```bash
# Test API health
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":...}

# Test council query
curl -X POST http://localhost:3001/api/v1/council/query \
  -H "Content-Type: application/json" \
  -d '{"content":"Test query","modes":["Debate"],"userId":"test"}'
```

#### Step 6: Deploy to Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use Docker
docker-compose up -d
```

### Option B: In-Place Upgrade

This upgrades your existing installation.

#### Step 1: Backup

```bash
# Create backup
tar -czf agi_council_backup_$(date +%Y%m%d).tar.gz /path/to/agi_council
```

#### Step 2: Update Repository

```bash
cd /path/to/agi_council

# Stash any local changes
git stash

# Pull v2.0
git fetch origin
git checkout v2.0.0

# Restore your local changes (if any)
git stash pop
```

#### Step 3: Update Dependencies

```bash
# Remove old node_modules
rm -rf node_modules package-lock.json

# Install new dependencies
npm install
```

#### Step 4: Update Configuration

```bash
# Update .env with new required variables
# See "Configuration Changes" section below
```

#### Step 5: Build and Start

```bash
npm run build
npm start
```

---

## Code Updates

### Updating Server Code

If you have custom server code, update imports:

**Before (v1.0):**
```typescript
import { CouncilOrchestrator } from './server/orchestrator';
import { CouncilState } from './shared/types';

const orchestrator = new CouncilOrchestrator(6, 'Prime Architect');
const state = orchestrator.getState();
```

**After (v2.0):**
```typescript
import { CouncilEngine } from './core/CouncilEngine';
import { ApiServer } from './api/ApiServer';
import { CouncilState } from './shared/types';

// Option 1: Use the full API server
const server = new ApiServer({ port: 3001 });
await server.start();

// Option 2: Use just the council engine
const engine = new CouncilEngine({
  councilSize: 6,
  primeArchitect: 'Prime Architect',
  enableMetrics: true
});

const state = engine.getState();
```

### Updating Client Code

Client code remains largely compatible, but API calls need updating:

**Before (v1.0):**
```typescript
const response = await fetch('http://localhost:3001/api/council/query', {
  method: 'POST',
  body: JSON.stringify(query)
});
```

**After (v2.0):**
```typescript
// Use versioned endpoint
const response = await fetch('http://localhost:3001/api/v1/council/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query)
});

// Or legacy endpoint (redirects to v1)
const response = await fetch('http://localhost:3001/api/council/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query)
});
```

### Updating WebSocket Code

WebSocket connections remain the same:

```typescript
// Works in both v1.0 and v2.0
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle message
};
```

---

## Configuration Changes

### Environment Variables

Create or update `.env` file:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3001
NODE_ENV=production  # or 'development'

# ============================================
# DATABASE (New in v2.0)
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/omniforge

# For Docker:
# DATABASE_URL=postgresql://omniforge:omniforge@postgres:5432/omniforge

# ============================================
# REDIS CACHE (New in v2.0)
# ============================================
REDIS_URL=redis://localhost:6379

# For Docker:
# REDIS_URL=redis://redis:6379

# ============================================
# SECURITY (New in v2.0)
# ============================================

# Generate with: openssl rand -base64 32
JWT_SECRET=your-secret-key-here

# Allowed origins for CORS
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com

# ============================================
# RATE LIMITING (New in v2.0)
# ============================================
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15  # minutes

# ============================================
# OPTIONAL FEATURES
# ============================================

# Enable/disable features
ENABLE_COMPRESSION=true
ENABLE_HELMET=true
ENABLE_RATE_LIMITING=true
ENABLE_LOGGING=true
ENABLE_METRICS=true

# Max request body size
MAX_REQUEST_SIZE=10mb
```

### Docker Configuration

If using Docker, create `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  api:
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=postgresql://omniforge:changeme@postgres:5432/omniforge
      - REDIS_URL=redis://redis:6379
  
  postgres:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-changeme}
  
  # Add custom services here
```

---

## Testing Migration

### 1. Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### 2. Integration Tests

```bash
# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/v1/council/state

# Test query processing
curl -X POST http://localhost:3001/api/v1/council/query \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test migration",
    "modes": ["Debate", "Build"],
    "userId": "migration-test"
  }'
```

### 3. WebSocket Tests

```bash
# Install wscat for testing
npm install -g wscat

# Test WebSocket connection
wscat -c ws://localhost:3001/ws

# Send test message
> {"type":"query","payload":{"content":"Test","modes":["Debate"],"userId":"test"}}
```

### 4. Load Testing

```bash
# Install apache bench
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test API performance
ab -n 1000 -c 10 http://localhost:3001/health
ab -n 100 -c 5 -p query.json -T application/json http://localhost:3001/api/v1/council/query
```

---

## Rollback Plan

If you encounter issues, you can rollback to v1.0:

### Option 1: Using Backup

```bash
# Stop v2.0
npm stop  # or docker-compose down

# Restore backup
rm -rf /path/to/agi_council
tar -xzf agi_council_backup_YYYYMMDD.tar.gz -C /path/to

# Start v1.0
cd /path/to/agi_council
npm start
```

### Option 2: Using Legacy Runtime

v2.0 includes the legacy runtime:

```bash
# Stop v2.0 API
npm stop

# Start legacy runtime
npm run start:legacy
```

### Option 3: Git Revert

```bash
# Revert to v1.0
git checkout v1.0.0

# Reinstall dependencies
rm -rf node_modules
npm install

# Start
npm start
```

---

## Troubleshooting

### Problem: Build Fails

**Solution:**
```bash
# Clear caches
rm -rf node_modules dist
npm cache clean --force
npm install
npm run build
```

### Problem: Database Connection Fails

**Solution:**
```bash
# Check PostgreSQL is running
docker ps  # or: sudo service postgresql status

# Test connection
psql -h localhost -U omniforge -d omniforge

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### Problem: Port Already in Use

**Solution:**
```bash
# Find process using port
lsof -i :3001  # or: netstat -ano | findstr :3001 (Windows)

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

### Problem: WebSocket Connection Refused

**Solution:**
```bash
# Check firewall
sudo ufw allow 3001  # Linux
# Or configure Windows Firewall

# Check CORS settings in .env
CORS_ORIGIN=*  # Allow all (development only)
```

---

## Getting Help

If you encounter issues during migration:

1. **Check Logs**: `docker-compose logs -f` or `npm run dev`
2. **Review Documentation**: [ARCHITECTURE.md](ARCHITECTURE.md), [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Search Issues**: [GitHub Issues](https://github.com/MASSIVEMAGNETICS/agi_council/issues)
4. **Ask Community**: [Discord](https://discord.gg/omniforge)
5. **Contact Support**: support@massivemagnetics.com

---

## Post-Migration Checklist

- [ ] All tests passing
- [ ] API endpoints responding correctly
- [ ] WebSocket connections working
- [ ] Database connected and migrated
- [ ] Redis cache operational
- [ ] Frontend loading properly
- [ ] Authentication working (if enabled)
- [ ] Performance metrics acceptable
- [ ] Error tracking configured
- [ ] Monitoring dashboards set up
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on new features

---

**Last Updated**: November 2024  
**Version**: 2.0.0
