#!/bin/bash

# Load environment variables from .env files
set -a
[ -f ./front_end/.env ] && . ./front_end/.env
[ -f ./back_end/.env ] && . ./back_end/.env
set +a

# Start frontend in the background
echo "Starting frontend on port $PORT..."
cd front_end
export PORT
export REACT_APP_BACKEND_PORT
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Start backend in the foreground
echo "Starting backend on port $FLASK_RUN_PORT..."
cd back_end
export FLASK_APP=src/oxford_mgnify.api.app
export FLASK_RUN_PORT
export FRONTEND_PORT

if [ -z "$OPENAI_API_KEY" ]; then
  read -s -p "Enter your OPENAI_API_KEY: " OPENAI_API_KEY
  export OPENAI_API_KEY
  echo
fi

flask run --port=$FLASK_RUN_PORT
cd ..

# Optionally, clean up frontend when backend stops
kill $FRONTEND_PID 2>/dev/null
