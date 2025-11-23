# Quick Start Guide

Get up and running with OmniForge Council Enterprise Edition in minutes.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

Optional for full features:
- **Docker** (for containerized deployment)
- **PostgreSQL** (for database features)
- **Redis** (for caching)

---

## Installation Methods

### Method 1: NPM (Development)

**Best for**: Local development and testing

```bash
# Clone repository
git clone https://github.com/MASSIVEMAGNETICS/agi_council.git
cd agi_council

# Install dependencies
npm install

# Start development server
npm run dev
```

Access at: **http://localhost:3000**

---

### Method 2: Docker (Production)

**Best for**: Production deployment and quick setup

```bash
# Clone repository
git clone https://github.com/MASSIVEMAGNETICS/agi_council.git
cd agi_council

# Start all services
docker-compose up -d
```

Access at: **http://localhost**  
API at: **http://localhost:3001**

---

### Method 3: Pre-built Executable (Windows)

**Best for**: End users on Windows

1. Download latest release: [Windows Installer](https://github.com/MASSIVEMAGNETICS/agi_council/releases)
2. Run `OmniForge-Council-Enterprise-2.0.0-win-x64.exe`
3. Follow installation wizard
4. Launch from Start Menu or Desktop

---

## First Steps

### 1. Verify Installation

```bash
# Check API health
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

### 2. Open Web Interface

Navigate to **http://localhost:3000** in your browser.

### 3. Make Your First Query

1. Select operational modes (e.g., "Debate", "Research")
2. Enter your question in the text area
3. Click "Submit" or press Enter
4. Watch the multi-agent council process your query

**Example Query:**
```
"What are the benefits and risks of AI in healthcare?"
Modes: Debate, Research, Oracle
```

---

## Development Workflow

### Start Development Server

```bash
# Start both API and web UI with hot reload
npm run dev

# Or start separately:
npm run dev:server  # API on port 3001
npm run dev:client  # UI on port 3000
```

### Build for Production

```bash
# Build all components
npm run build

# Or build individually:
npm run build:core     # Core engine
npm run build:api      # API server
npm run build:web      # Web PWA
npm run build:desktop  # Windows executable
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Lint Code

```bash
npm run lint
```

---

## Configuration

### Basic Configuration

Create `.env` file in project root:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS (allow frontend origin)
CORS_ORIGIN=http://localhost:3000
```

### Advanced Configuration

```env
# Database (when using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/omniforge

# Redis (when using cache)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-here

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

---

## Docker Setup

### Start Services

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included

- **API Server**: `http://localhost:3001`
- **Web UI**: `http://localhost`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

## Platform-Specific Setup

### iOS Development

```bash
# Build web assets
npm run build:web

# Add iOS platform
npx cap add ios

# Sync changes
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Android Development

```bash
# Build web assets
npm run build:web

# Add Android platform
npx cap add android

# Sync changes
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Windows Desktop

```bash
# Build desktop application
npm run build:desktop

# Output: release/OmniForge-Council-Enterprise-*.exe
```

---

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=3002
```

### Dependencies Installation Failed

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# Restart Docker service
# macOS: Docker Desktop > Restart
# Linux: sudo systemctl restart docker
# Windows: Docker Desktop > Restart
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist
npm run build
```

---

## Next Steps

### Explore Documentation

- [Architecture Guide](../ARCHITECTURE.md) - System design
- [Deployment Guide](../DEPLOYMENT.md) - Production deployment
- [API Reference](API.md) - REST and WebSocket APIs
- [Features Guide](FEATURES.md) - All enterprise features

### Customize

- Modify agent configurations
- Add custom operational modes
- Customize UI theme
- Configure integrations

### Deploy

- Set up production environment
- Configure SSL/TLS
- Set up monitoring
- Configure backups

---

## Common Use Cases

### 1. Software Architecture Design

```
Query: "Design a scalable microservices platform for e-commerce"
Modes: Build, Audit, Engineer
```

### 2. Strategic Planning

```
Query: "What are risks and opportunities in AI regulation?"
Modes: Debate, Strategist, Oracle
```

### 3. Research & Analysis

```
Query: "Compare approaches to climate change mitigation"
Modes: Research, Oracle, Quant
```

### 4. Future Prediction

```
Query: "Predict quantum computing breakthroughs in next 5 years"
Modes: Predict, Research, Quant
```

---

## Getting Help

### Resources

- **Documentation**: https://docs.omniforge.app
- **GitHub Issues**: https://github.com/MASSIVEMAGNETICS/agi_council/issues
- **Discord**: https://discord.gg/omniforge
- **Email**: support@massivemagnetics.com

### Support Tiers

- **Community**: GitHub Issues, Discord
- **Professional**: Email support, 24-hour response
- **Enterprise**: Dedicated support, SLA guarantees

---

## What's Next?

You're ready to use OmniForge Council! Here are some suggestions:

1. **Try different operational modes** to see how agents collaborate
2. **Explore the API** for programmatic access
3. **Deploy to production** using Docker or cloud platforms
4. **Join the community** on Discord to share experiences
5. **Contribute** to the project on GitHub

---

**Version**: 2.0.0  
**Last Updated**: November 2024

**Ready to begin your journey with the council?**  
*"Prime Architect, what shall the Council examine next?"*
