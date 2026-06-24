#!/bin/bash

# Brand Audit Tool - Development Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Brand Audit Tool Development Servers..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Must run from brand-audit-tool directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: backend/.env not found${NC}"
    echo "   Creating from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}   Please edit backend/.env with your API keys${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Check if ports are already in use
if check_port 3001; then
    echo -e "${YELLOW}⚠️  Port 3001 (backend) is already in use${NC}"
    echo "   Kill the process? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        lsof -ti:3001 | xargs kill -9
        echo -e "${GREEN}✓ Killed process on port 3001${NC}"
    fi
fi

if check_port 3003; then
    echo -e "${YELLOW}⚠️  Port 3003 (frontend) is already in use${NC}"
    echo "   Kill the process? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        lsof -ti:3003 | xargs kill -9
        echo -e "${GREEN}✓ Killed process on port 3003${NC}"
    fi
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi
cd ..

# Install frontend dependencies  
cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi
cd ..

echo ""
echo -e "${GREEN}✓ Dependencies ready${NC}"
echo ""

# Create log directory
mkdir -p logs

# Start backend
echo "🔧 Starting Backend Server (port 3001)..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend server started (PID: $BACKEND_PID)${NC}"
    echo "   Logs: logs/backend.log"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    echo "   Check logs/backend.log for errors"
    cat logs/backend.log
    exit 1
fi

# Start frontend
echo ""
echo "🎨 Starting Frontend Server (port 3003)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend server started (PID: $FRONTEND_PID)${NC}"
    echo "   Logs: logs/frontend.log"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    echo "   Check logs/frontend.log for errors"
    cat logs/frontend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 URLs:"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3003"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or run: ./stop-dev.sh"
echo ""
echo "💡 Tip: Open http://localhost:3003 in your browser"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid

# Keep script running and show logs
echo "Press Ctrl+C to stop watching logs (servers will keep running)"
echo ""
tail -f logs/backend.log logs/frontend.log

# Made with Bob
