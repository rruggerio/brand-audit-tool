# Start Your BrandChecker Server - Quick Guide

## The Issue

You're seeing "Safari cannot connect to the server" because the backend server isn't running yet.

## Quick Fix (3 Steps)

### Step 1: Open Terminal

Open Terminal.app on your Mac

### Step 2: Navigate and Start Server

```bash
# Go to the backend directory
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool/backend

# Start the server
npm run dev
```

### Step 3: Wait for Success Message

You should see:
```
🚀 Brand Audit Tool API server running on port 3001
📝 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

## Now Test in Browser

**Visit these URLs:**

1. **http://localhost:3001/**
   - Should show API information

2. **http://localhost:3001/api/health**
   - Should show: `{"success": true, "data": {...}}`

## If You See Errors

### Error: "Cannot find module"

**Solution:** Install dependencies first
```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool/backend
npm install
npm run dev
```

### Error: "EADDRINUSE" (Port already in use)

**Solution:** Kill the process on port 3001
```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

### Error: Missing .env file

**Solution:** Create environment file
```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and add your API keys (optional for basic testing)

### Error: TypeScript errors

**Solution:** These are expected - the service implementations aren't complete yet
- The server will still start
- Basic endpoints will work
- You can test the API

## What You'll Be Able to Test

Once the server is running:

✅ **Health Check**
- URL: http://localhost:3001/api/health
- Shows server status

✅ **API Info**
- URL: http://localhost:3001/
- Shows available endpoints

⚠️ **Other Endpoints**
- Will return errors because services aren't implemented yet
- This is expected - we built the structure, not the full logic

## Complete Startup Commands

**Copy and paste these:**

```bash
# Navigate to backend
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool/backend

# Install dependencies (if not done)
npm install

# Create required directories
mkdir -p uploads logs screenshots reports

# Start the server
npm run dev
```

## What Success Looks Like

**In Terminal:**
```
[nodemon] starting `ts-node src/server.ts`
🚀 Brand Audit Tool API server running on port 3001
📝 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

**In Browser (http://localhost:3001/):**
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

## Keep Server Running

**Important:**
- Keep the terminal window open
- Don't close it or press Ctrl+C
- The server needs to stay running to test in browser

## To Stop Server

When you're done testing:
```bash
# Press Ctrl+C in the terminal
```

## Next Steps After Server Starts

1. ✅ Test http://localhost:3001/
2. ✅ Test http://localhost:3001/api/health
3. ✅ Verify JSON responses
4. 🎉 Your backend is working!

Then you can start building the frontend UI components.

## Quick Troubleshooting

**Server won't start?**
```bash
# Check if dependencies are installed
ls node_modules

# If empty, install:
npm install
```

**Still having issues?**
```bash
# Check what's in the terminal
# Copy any error messages
# We can troubleshoot from there
```

## Ready to Start?

Run these commands now:

```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool/backend
npm run dev
```

Then visit: **http://localhost:3001/** in your browser! 🚀