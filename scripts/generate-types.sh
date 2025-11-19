#!/bin/bash

# Check if project ref is provided
if [ -z "$1" ]; then
  echo "Usage: ./generate-types.sh <project-ref>"
  echo "Example: ./generate-types.sh abcdefghijklmnop"
  exit 1
fi

PROJECT_REF=$1

echo "Generating types for project: $PROJECT_REF"

# Login check
if ! supabase projects list > /dev/null 2>&1; then
    echo "Please run 'supabase login' first."
    exit 1
fi

# Generate types
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > types/database.types.ts

echo "✅ Types generated in types/database.types.ts"
