#!/bin/bash
# Local dev runner for the V&E site (public site + admin CMS).
# Mirrors the pacific-code-labs pattern.

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

# Stop Git Bash (MSYS) from rewriting the "/" BASE_PATH into a Windows path.
export MSYS_NO_PATHCONV=1

# MSYS_NO_PATHCONV breaks the corepack `pnpm` shim (it passes an unconverted
# /c/... path to Windows node). Use the standalone pnpm in PNPM_HOME instead.
if [ -n "$PNPM_HOME" ] && [ -x "$PNPM_HOME/pnpm" ]; then
  export PATH="$PNPM_HOME:$PATH"
elif [ -x "/e/node-tooling/pnpm-bin/pnpm" ]; then
  export PATH="/e/node-tooling/pnpm-bin:$PATH"
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT" || exit 1

PORT=5000

echo -e "${GREEN}🔄 Rebooting V&E site...${NC}"

# Stop anything already on the dev port
echo "Stopping processes on port $PORT..."
if command -v taskkill >/dev/null 2>&1; then
  pid=$(netstat -ano 2>/dev/null | grep ":$PORT" | grep LISTENING | awk '{print $5}' | head -1)
  [ -n "$pid" ] && taskkill //F //PID "$pid" 2>/dev/null || true
else
  pid=$(lsof -ti tcp:$PORT 2>/dev/null | head -1)
  [ -n "$pid" ] && kill -9 "$pid" 2>/dev/null || true
fi
sleep 1

# Clean Vite cache
echo "Cleaning Vite cache..."
rm -rf artifacts/construction-site/node_modules/.vite artifacts/construction-site/.vite

mkdir -p logs

echo -e "${GREEN}🚀 Starting dev server (public site + admin dashboard)...${NC}"
export PORT
export BASE_PATH=/
nohup pnpm --filter @workspace/construction-site run dev > logs/site.log 2>&1 &
PID=$!
sleep 4

if ps -p $PID > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Dev server started (PID $PID)${NC}"
  echo ""
  echo -e "${YELLOW}URLs:${NC}"
  echo -e "  • Public site:     ${CYAN}http://localhost:$PORT/${NC}"
  echo -e "  • Admin dashboard: ${CYAN}http://localhost:$PORT/admin${NC}"
  echo ""
  echo -e "${YELLOW}Logs:${NC} ./view-logs.sh    ${YELLOW}Stop:${NC} ./stop-server.sh"
else
  echo "❌ Failed to start. Last log lines:"
  tail -20 logs/site.log
  exit 1
fi
