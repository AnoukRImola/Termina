#!/bin/bash
set -a
source /home/anouk/Escritorio/termina/dashboard/.env.local
set +a
node generate-pem.mjs
