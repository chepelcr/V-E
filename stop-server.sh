#!/bin/bash
# Stop the local V&E dev server (kills ALL listeners on the port + their trees).

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
# Match reboot-server.sh so taskkill flags (/F /T /PID) aren't path-mangled.
export MSYS_NO_PATHCONV=1
PORT="${PORT:-5000}"

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

echo "Stopping V&E site on port $PORT..."
kill_port "$PORT"
for _ in $(seq 1 10); do
  port_listening "$PORT" || break
  kill_port "$PORT"
  sleep 0.5
done

if port_listening "$PORT"; then
  echo -e "${YELLOW}⚠ Port $PORT still has a listener (a non-dev app?).${NC}"
else
  echo -e "${GREEN}Done — port $PORT is free.${NC}"
fi
