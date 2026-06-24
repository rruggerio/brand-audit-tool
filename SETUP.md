# Brand Audit Tool - Setup Guide

This guide will help you set up and run the Brand Compliance Auditing Tool.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Required API Keys

You'll need API keys from:

1. **OpenAI** - For GPT-4 Vision analysis
   - Sign up at: https://platform.openai.com/
   - Create an API key in your account settings

2. **Anthropic** - For Claude analysis
   - Sign up at: https://www.anthropic.com/
   - Create an API key in your account settings

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb brand_audit

# Or using psql
psql -U postgres
CREATE DATABASE brand_audit;
\q
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit the .env file with your settings
nano backend/.env  # or use your preferred editor
```

Update the following values in `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brand_audit
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# API Keys
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# JWT Secret (generate a random string)
JWT_SECRET=your-secure-random-string-here
```

### 4. Create Required Directories

```bash
# Create directories for uploads and logs
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p backend/screenshots
mkdir -p backend/reports
```

### 5. Run Database Migrations

```bash
cd backend
npm run migrate  # This will be implemented
cd ..
```

## Running the Application

### Development Mode

Run both backend and frontend in development mode:

```bash
# From root directory
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

### Production Mode

```bash
# Build both applications
npm run build

# Start backend
cd backend
npm start

# Start frontend (in another terminal)
cd frontend
npm start
```

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "environment": "development"
  }
}
```

### 2. Check Frontend

Open http://localhost:3000 in your browser. You should see the Brand Audit Tool dashboard.

## Common Issues

### Port Already in Use

If ports 3000 or 3001 are already in use:

```bash
# Change backend port in backend/.env
PORT=3002

# Change frontend port
# Edit frontend/package.json or set PORT environment variable
PORT=3001 npm run dev
```

### Database Connection Error

1. Verify PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check database credentials in `backend/.env`

3. Ensure database exists:
   ```bash
   psql -U postgres -l | grep brand_audit
   ```

### Puppeteer Installation Issues

If Puppeteer fails to install:

```bash
# Install Chromium dependencies (Linux)
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils

# macOS - no additional dependencies needed
```

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Next Steps

1. **Upload Brand Guidelines**: Navigate to the Guidelines section and upload your IBM brand guidelines PDF
2. **Configure IBM Carbon**: The system will automatically fetch IBM Carbon Design System guidelines
3. **Run Your First Audit**: Enter a URL and select analysis preferences
4. **Review Results**: Explore the dashboard and generate reports

## Support

For issues or questions:
- Check the [README.md](./README.md) for project overview
- Review the API documentation at http://localhost:3001/api/docs (when implemented)
- Check logs in `backend/logs/` directory

## Development Tips

### Hot Reload

Both frontend and backend support hot reload in development mode. Changes will automatically restart the servers.

### Debugging

- Backend logs: `backend/logs/combined.log`
- Error logs: `backend/logs/error.log`
- Frontend console: Browser DevTools

### Database Management

```bash
# View database
psql -U postgres -d brand_audit

# Common queries
\dt  # List tables
\d table_name  # Describe table
SELECT * FROM audits LIMIT 10;  # View recent audits
```

## Security Notes

- Never commit `.env` files to version control
- Rotate API keys regularly
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for production deployments