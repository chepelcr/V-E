#!/bin/bash
# Tail the local V&E dev server logs.

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
LOG_FILE="logs/site.log"

if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Log file not found: $LOG_FILE — start the server with ./reboot-server.sh"
  exit 1
fi

echo -e "${GREEN}📋 Tailing $LOG_FILE${NC} (${YELLOW}Ctrl+C to exit${NC})"
echo ""
tail -f "$LOG_FILE"
