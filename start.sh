#!/bin/bash
# Quick start script for Isaiah's MRT Adventure
# This starts a local web server to run the app

echo ""
echo "=========================================="
echo "  Isaiah's MRT Food Adventure"
echo "=========================================="
echo ""
echo "Starting local web server..."
echo ""
echo "  Open your browser and go to:"
echo "  http://localhost:8080"
echo ""
echo "  Press Ctrl+C to stop the server"
echo ""
echo "=========================================="
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8080
