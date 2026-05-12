#!/bin/bash
echo "Starting DeepShield..."

# Start backend
cd ~/Desktop/deepshield/backend
python3 app.py &

# Wait for backend to start
sleep 2

# Start frontend
cd ~/Desktop/deepshield/frontend
npm start
