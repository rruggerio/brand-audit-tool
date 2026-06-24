# Brand Audit Tool - Quick Start Guide

Get up and running with the Brand Compliance Auditing Tool in minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check PostgreSQL (need 14+)
psql --version

# Check npm
npm --version
```

## 5-Minute Setup

### 1. Clone and Install

```bash
# Navigate to the project
cd brand-audit-tool

# Install all dependencies
npm run install:all
```

### 2. Set Up Database

```bash
# Create database
createdb brand_audit

# Or if you need to use psql
psql -U postgres -c "CREATE DATABASE brand_audit;"
```

### 3. Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit with your API keys
nano backend/.env
```

**Minimum required configuration:**
```env
# Database
DB_NAME=brand_audit
DB_USER=postgres
DB_PASSWORD=your_password

# API Keys (get these from the providers)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# JWT Secret (any random string)
JWT_SECRET=your-random-secret-string
```

### 4. Create Directories

```bash
mkdir -p backend/uploads backend/logs backend/screenshots backend/reports
```

### 5. Start the Application

```bash
# Start both backend and frontend
npm run dev
```

**That's it!** 🎉

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## First Audit in 3 Steps

### Step 1: Access the Application
Open http://localhost:3000 in your browser

### Step 2: Configure Guidelines
1. Click "Guidelines" in the navigation
2. Either:
   - Upload your brand guidelines PDF, or
   - Use IBM Brand Guidelines (pre-configured)

### Step 3: Run an Audit
1. Click "New Audit"
2. Enter a URL (e.g., `https://www.ibm.com`)
3. Select analysis types:
   - ✅ Visual (colors, typography, layout)
   - ✅ Component (design system usage)
   - ✅ Content (messaging, tone)
   - ✅ Accessibility (WCAG compliance)
4. Click "Start Audit"
5. Wait for results (typically 30-60 seconds)

## Understanding Results

### Dashboard View
- **Overall Score**: 0-100 compliance rating
- **Category Scores**: Individual scores for each analysis type
- **Issue Count**: Total issues by severity

### Detailed Analysis
- **Critical Issues**: Must fix immediately
- **High Priority**: Fix soon
- **Medium Priority**: Address when possible
- **Low Priority**: Nice to have improvements

### Reports
- **PDF Report**: Executive summary with screenshots
- **CSV Export**: Detailed issue list for tracking
- **JSON**: Raw data for integration

## Common Use Cases

### Use Case 1: Brand Rollout Validation
```
Goal: Ensure new brand guidelines are properly implemented
Steps:
1. Upload new brand guidelines PDF
2. Audit all main pages
3. Generate PDF report for stakeholders
4. Track issues in CSV for development team
```

### Use Case 2: Design System Compliance
```
Goal: Verify IBM Carbon Design System usage
Steps:
1. Select IBM Carbon guidelines
2. Run component analysis
3. Review component usage issues
4. Fix non-compliant components
```

### Use Case 3: Accessibility Audit
```
Goal: Ensure WCAG AA compliance
Steps:
1. Configure accessibility guidelines
2. Run accessibility-only analysis
3. Review WCAG violations
4. Prioritize fixes by severity
```

## Tips & Tricks

### Faster Audits
- Start with single pages before full site audits
- Use specific analysis types instead of "all"
- Run during off-peak hours for better performance

### Better Results
- Ensure pages are fully loaded (avoid loading states)
- Use production URLs, not development
- Provide detailed brand guidelines for accurate analysis

### Troubleshooting
```bash
# Check backend logs
tail -f backend/logs/combined.log

# Check for errors
tail -f backend/logs/error.log

# Restart services
npm run dev
```

## API Usage (Advanced)

### Create Audit via API
```bash
curl -X POST http://localhost:3001/api/audits \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "guidelineId": "guideline-id-here",
    "analysisTypes": ["visual", "component", "content", "accessibility"]
  }'
```

### Get Audit Status
```bash
curl http://localhost:3001/api/audits/{audit-id}/status
```

### Download Report
```bash
curl http://localhost:3001/api/reports/{report-id}/download -o report.pdf
```

## Next Steps

1. **Explore Features**: Try all analysis types
2. **Customize Guidelines**: Upload your own brand guidelines
3. **Integrate**: Use the API in your CI/CD pipeline
4. **Scale**: Set up for team usage with authentication

## Getting Help

- **Setup Issues**: See [SETUP.md](./SETUP.md)
- **API Documentation**: http://localhost:3001/api/docs
- **Logs**: Check `backend/logs/` directory
- **Common Errors**: See troubleshooting section in SETUP.md

## What's Next?

- [ ] Run your first audit
- [ ] Upload custom brand guidelines
- [ ] Generate your first report
- [ ] Set up automated audits
- [ ] Integrate with your workflow

Happy auditing! 🚀