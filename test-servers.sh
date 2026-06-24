#!/bin/bash

# Brand Audit Tool - Server Health Check Script

echo "🔍 Testing Brand Audit Tool Servers..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test backend
echo -e "${BLUE}Testing Backend (http://localhost:3001)...${NC}"
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)

if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is running and healthy${NC}"
    # Get backend info
    BACKEND_INFO=$(curl -s http://localhost:3001/ 2>/dev/null)
    echo "   Response: $BACKEND_INFO"
else
    echo -e "${RED}❌ Backend is not responding (HTTP $BACKEND_RESPONSE)${NC}"
    echo "   Expected: HTTP 200"
    echo "   Try: ./start-dev.sh"
fi

echo ""

# Test frontend
echo -e "${BLUE}Testing Frontend (http://localhost:3003)...${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 2>/dev/null)

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not responding (HTTP $FRONTEND_RESPONSE)${NC}"
    echo "   Expected: HTTP 200"
    echo "   Try: ./start-dev.sh"
fi

echo ""

# Test API endpoints
if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${BLUE}Testing API Endpoints...${NC}"
    
    # Test guidelines endpoint
    GUIDELINES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/guidelines 2>/dev/null)
    if [ "$GUIDELINES_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Guidelines API working${NC}"
    else
        echo -e "${RED}❌ Guidelines API failed (HTTP $GUIDELINES_RESPONSE)${NC}"
    fi
    
    # Test audits endpoint
    AUDITS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/audits 2>/dev/null)
    if [ "$AUDITS_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Audits API working${NC}"
    else
        echo -e "${RED}❌ Audits API failed (HTTP $AUDITS_RESPONSE)${NC}"
    fi
    
    # Test reports endpoint
    REPORTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/reports 2>/dev/null)
    if [ "$REPORTS_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Reports API working${NC}"
    else
        echo -e "${RED}❌ Reports API failed (HTTP $REPORTS_RESPONSE)${NC}"
    fi
fi

echo ""
echo "=========================================="

# Summary
if [ "$BACKEND_RESPONSE" = "200" ] && [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "🌐 Open in browser:"
    echo "   http://localhost:3003"
    echo ""
    echo "📚 API Documentation:"
    echo "   http://localhost:3001"
else
    echo -e "${RED}❌ Some services are not running${NC}"
    echo ""
    echo "🔧 To start servers:"
    echo "   ./start-dev.sh"
    echo ""
    echo "📝 To check logs:"
    echo "   tail -f logs/backend.log"
    echo "   tail -f logs/frontend.log"
fi

echo "=========================================="

# Made with Bob
