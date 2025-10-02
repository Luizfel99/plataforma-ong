#!/usr/bin/env bash
# Start the simple static server and open the default browser (Linux/macOS)
set -e

PORT=3000
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js (node) not found in PATH. Please install Node.js." >&2
  exit 1
fi

export PORT

echo "Starting static server on http://127.0.0.1:$PORT/ (background)"
node "$PROJECT_ROOT/scripts/simple_static_server.js" &
PID=$!
sleep 1

URL="http://127.0.0.1:$PORT/"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 || true
else
  echo "No system browser opener found. Please open: $URL"
fi

echo "Server started (PID: $PID). Press Enter to stop."
read -r

kill "$PID" 2>/dev/null || true
echo "Server stopped."
