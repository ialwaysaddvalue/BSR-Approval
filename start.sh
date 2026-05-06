#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Installing dependencies..."
pip install -q -r requirements.txt

echo "Starting BookLaunch Pro on http://localhost:8000"
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
