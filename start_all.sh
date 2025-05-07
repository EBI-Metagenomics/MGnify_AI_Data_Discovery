#!/bin/bash

SECRET_FILE="secret.txt"

# Function to get a key from the file
get_key() {
    local key="$1"
    grep "^${key}=" "$SECRET_FILE" 2>/dev/null | cut -d'=' -f2-
}

# Read existing keys
OPENAI_API_KEY=$(get_key "OPENAI_API_KEY")
DEEPSEEK_API_KEY=$(get_key "DEEPSEEK_API_KEY")

# Install modules needed for backend
if [ -f $SECRET_FILE ]; then
    pip install -r $(dirname $0)/back_end/requirements.txt
fi

# Prompt for missing keys
if [ -z "$OPENAI_API_KEY" ]; then
    read -p "Enter your OPENAI_API_KEY: " OPENAI_API_KEY
    # Append to file
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> "$SECRET_FILE"
fi

if [ -z "$DEEPSEEK_API_KEY" ]; then
    read -p "Enter your DEEPSEEK_API_KEY: " DEEPSEEK_API_KEY
    # Append to file
    echo "DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY" >> "$SECRET_FILE"
fi

# Export the keys for use in this shell session
export OPENAI_API_KEY
export DEEPSEEK_API_KEY

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
