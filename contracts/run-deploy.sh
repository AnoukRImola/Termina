#!/bin/bash
# Load mnemonic from dashboard .env.local and run deploy

ENV_FILE="/home/anouk/Escritorio/termina/dashboard/.env.local"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
  echo "Loaded environment from $ENV_FILE"
  node deploy.mjs
else
  echo "Error: $ENV_FILE not found"
  exit 1
fi
