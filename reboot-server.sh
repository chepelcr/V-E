#!/bin/bash
# Local dev runner for the V&E site (public site + admin CMS).
# Mirrors the pacific-code-labs pattern.

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

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

PORT="${PORT:-5000}"

# Kill EVERY process listening on $PORT, tree-killing children (pnpm -> node).
kill_port() {
  local port="$1" pids pid
  if command -v netstat >/dev/null 2>&1 && command -v taskkill >/dev/null 2>&1; then
    pids=$(netstat -ano 2>/dev/null | grep -i LISTENING \
      | awk -v p=":$port\$" '$2 ~ p {print $5}' | sort -u)
    for pid in $pids; do
      [ -n "$pid" ] && taskkill /F /T /PID "$pid" >/dev/null 2>&1 || true
    done
  else
    pids=$(lsof -ti tcp:"$port" 2>/dev/null | sort -u)
    for pid in $pids; do [ -n "$pid" ] && kill -9 "$pid" 2>/dev/null || true; done
  fi
}

port_listening() {
  if command -v netstat >/dev/null 2>&1; then
    netstat -ano 2>/dev/null | grep -i LISTENING | awk -v p=":$1\$" '$2 ~ p' | grep -q .
  else
    lsof -ti tcp:"$1" >/dev/null 2>&1
  fi
}

echo -e "${GREEN}🔄 Rebooting V&E site...${NC}"

echo "Freeing port $PORT..."
kill_port "$PORT"
# Wait until the port is actually free (up to ~10s).
for _ in $(seq 1 20); do
  port_listening "$PORT" || break
  kill_port "$PORT"
  sleep 0.5
done
if port_listening "$PORT"; then
  echo -e "${RED}⚠ Port $PORT is still in use by another process and could not be freed.${NC}"
  echo "   Listeners:"
  netstat -ano 2>/dev/null | grep -i LISTENING | awk -v p=":$PORT\$" '$2 ~ p'
  echo "   Set a different port with:  PORT=5050 ./reboot-server.sh"
  exit 1
fi

echo "Cleaning Vite cache..."
rm -rf artifacts/construction-site/node_modules/.vite artifacts/construction-site/.vite

mkdir -p logs

echo -e "${GREEN}🚀 Starting dev server (public site + admin dashboard)...${NC}"
export PORT
export BASE_PATH=/
nohup pnpm --filter @workspace/construction-site run dev > logs/site.log 2>&1 &

# Wait for the server to actually bind the port (not just the wrapper to exist).
started=""
for _ in $(seq 1 40); do
  if port_listening "$PORT"; then started=1; break; fi
  sleep 0.5
done

if [ -n "$started" ]; then
  echo -e "${GREEN}✅ Dev server is listening on port $PORT${NC}"
  echo ""
  echo -e "${YELLOW}URLs:${NC}"
  echo -e "  • Public site:     ${CYAN}http://localhost:$PORT/${NC}"
  echo -e "  • Admin dashboard: ${CYAN}http://localhost:$PORT/admin${NC}"
  echo ""
  echo -e "${YELLOW}Logs:${NC} ./view-logs.sh    ${YELLOW}Stop:${NC} ./stop-server.sh"
else
  echo -e "${RED}❌ Server did not start. Last log lines:${NC}"
  tail -25 logs/site.log
  exit 1
fi
