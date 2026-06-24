# How to Start and Test BrandChecker

## Important Note

⚠️ **The frontend UI is not fully built yet.** We've created the structure and configuration, but the actual UI components (Dashboard, forms, etc.) still need to be built.

However, you CAN:
- ✅ Start the backend API server
- ✅ Test API endpoints in your browser
- ✅ Verify the backend is working
- ✅ See the basic frontend structure

## Quick Start Guide

### Step 1: Install Dependencies

```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool

# Install all dependencies (this will take a few minutes)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your API keys
nano backend/.env
# Or use any text editor you prefer
```

**Add your API keys to backend/.env:**
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=brand_audit
DB_USER=postgres
DB_PASSWORD=your_password

# Add your actual API keys here
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

JWT_SECRET=your-random-secret-string

CORS_ORIGIN=http://localhost:3000
```

### Step 3: Create Required Directories

```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool
mkdir -p backend/uploads backend/logs backend/screenshots backend/reports
```

### Step 4: Start the Backend API

```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool/backend
npm run dev
```

You should see:
```
🚀 Brand Audit Tool API server running on port 3001
📝 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

### Step 5: Test the Backend in Browser

**Open your browser and visit:**

**Health Check:**
http://localhost:3001/api/health

You should see:
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

**API Root:**
http://localhost:3001/

You should see:
```json
{
  "name": "Brand Audit Tool API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health",
    "guidelines": "/api/guidelines",
    "audits": "/api/audits",
    "reports": "/api/reports"
  }
}
```

### Step 6: Start the Frontend (Optional)

**In a NEW terminal window:**

```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool/frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Open browser:**
http://localhost:3000/

⚠️ **You'll see a basic page or errors** because the UI components aren't built yet. This is expected!

## What You Can Test Now

### 1. Backend API Health
✅ http://localhost:3001/api/health

### 2. API Documentation
✅ http://localhost:3001/

### 3. Test with cURL or Postman

**Test Guidelines Endpoint:**
```bash
curl http://localhost:3001/api/guidelines
```

**Test Audits Endpoint:**
```bash
curl http://localhost:3001/api/audits
```

## What's Working vs. What's Not

### ✅ Working Now:
- Backend API server
- API routes and endpoints
- Health check
- Error handling
- Logging
- CORS configuration

### ⚠️ Not Yet Built:
- Frontend UI components (Dashboard, forms, etc.)
- Database models and migrations
- Service implementations (AuditService, GuidelinesService, ReportService)
- Actual audit functionality
- Report generation

### 🔧 Still Need to Build:
- Frontend pages and components
- Database setup
- Complete service logic
- Form handling
- Data visualization

## Quick Test Script

Save this as `test-api.sh` in the brand-audit-tool folder:

```bash
#!/bin/bash

echo "Testing BrandChecker API..."
echo ""

echo "1. Testing Health Endpoint:"
curl -s http://localhost:3001/api/health | json_pp
echo ""

echo "2. Testing Root Endpoint:"
curl -s http://localhost:3001/ | json_pp
echo ""

echo "3. Testing Guidelines Endpoint:"
curl -s http://localhost:3001/api/guidelines | json_pp
echo ""

echo "Done!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Troubleshooting

### "Cannot find module"
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

### "Port already in use"
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

### "ECONNREFUSED" or Database Errors
- The database isn't set up yet
- This is expected - database functionality comes later
- API will still work for basic endpoints

## Next Steps to Make It Fully Functional

1. **Build Frontend Components** (Dashboard, forms, etc.)
2. **Set Up Database** (PostgreSQL with migrations)
3. **Implement Services** (AuditService, GuidelinesService, ReportService)
4. **Connect Frontend to Backend** (API calls, state management)
5. **Add Authentication** (JWT, user management)
6. **Test End-to-End** (Full audit workflow)

## Summary

**Right now you can:**
- ✅ Start the backend API
- ✅ Test API endpoints in browser
- ✅ Verify the server is working
- ✅ See the project structure

**To make it fully functional, you need to:**
- Build the frontend UI components
- Implement the service logic
- Set up the database
- Connect everything together

The foundation is solid - now it's time to build the features! 🚀

## Quick Commands Reference

```bash
# Start backend only
cd brand-audit-tool/backend && npm run dev

# Start frontend only
cd brand-audit-tool/frontend && npm run dev

# Start both (in separate terminals)
# Terminal 1:
cd brand-audit-tool/backend && npm run dev
# Terminal 2:
cd brand-audit-tool/frontend && npm run dev

# Test API
curl http://localhost:3001/api/health