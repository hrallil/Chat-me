#!/bin/bash
set -e

DATA_DIR="$HOME/chat-data"
mkdir -p "$DATA_DIR"

cleanup() {
    echo ""
    echo "Shutting down..."
    sudo docker compose down
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "Starting Docker services..."
sudo docker compose up -d --remove-orphans

export PATH=$PATH:/home/hrallil/.dotnet
export PATH=$PATH:$(npm bin -g 2>/dev/null || echo "/usr/local/bin")

echo "Starting Azure Functions..."
cd "$(dirname "$0")/Functions/Home.Chat"

AzureWebJobsStorage="UseDevelopmentStorage=true" \
FUNCTIONS_WORKER_RUNTIME="dotnet-isolated" \
SQLite__DatabasePath="$DATA_DIR/chat.db" \
LLM__BaseUrl="http://localhost:11434" \
LLM__Model="llama3.2" \
SEQ_SERVER_URL="http://localhost:5341" \
func start
