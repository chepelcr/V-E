#!/bin/bash
# Stop the local V&E dev server.

GREEN='\033[0;32m'; NC='\033[0m'
PORT=5000

echo "Stopping V&E site on port $PORT..."
if command -v taskkill >/dev/null 2>&1; then
  pid=$(netstat -ano 2>/dev/null | grep ":$PORT" | grep LISTENING | awk '{print $5}' | head -1)
  [ -n "$pid" ] && taskkill //F //PID "$pid" 2>/dev/null || true
else
  pid=$(lsof -ti tcp:$PORT 2>/dev/null | head -1)
  [ -n "$pid" ] && kill -9 "$pid" 2>/dev/null || true
fi

echo -e "${GREEN}Done.${NC}"
