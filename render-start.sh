#!/usr/bin/env bash
set -e
echo "Starting render-start script..."
if [ -z "$DATABASE_URL" ]; then
  DB_PATH="${DATABASE_STORAGE:-./database.sqlite}"
  if [ ! -f "$DB_PATH" ]; then
    echo "Seeding SQLite DB at $DB_PATH"
    npm run seed || true
  fi
else
  echo "Detected DATABASE_URL - running idempotent seed"
  npm run seed || true
fi
npm start
