#!/bin/bash

# Brand Audit Tool - Stop Development Servers

echo "🛑 Stopping Brand Audit Tool Development Servers..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for PID files
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Stopped backend server (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend server not running${NC}"
    fi
    rm logs/backend.pid
else
    # Try to find and kill by port
    BACKEND_PID=$(lsof -ti:3001)
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Stopped backend server on port 3001${NC}"
    fi
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Stopped frontend server (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend server not running${NC}"
    fi
    rm logs/frontend.pid
else
    # Try to find and kill by port
    FRONTEND_PID=$(lsof -ti:3003)
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Stopped frontend server on port 3003${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Servers stopped${NC}"

# Made with Bob
