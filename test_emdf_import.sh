#!/bin/bash

# Test script for the import_emdf edge function
# This creates a test EMDF file and tests the full import flow

set -e

echo "🧪 Testing EMDF import edge function..."

# Get current user from Supabase
USER_ID=$(supabase auth get-user | grep '"id"' | cut -d'"' -f4)
if [ -z "$USER_ID" ]; then
    echo "❌ No authenticated user found. Please run: supabase auth login"
    exit 1
fi

echo "📝 Using user ID: $USER_ID"

# Create test EMDF file from villa fixture
TEST_FILE="test_villa_import.zip"
cd tests/regress/fixtures/villa_project
zip -r "../../../../$TEST_FILE" DF_Common.xml DF_Project.xml Option0/
cd ../../../../

echo "📦 Created test file: $TEST_FILE"

# Upload test file to storage
STORAGE_PATH="$USER_ID/$(date +%s)_$TEST_FILE"
echo "⬆️  Uploading to storage path: $STORAGE_PATH"

supabase storage upload emdf_imports "$STORAGE_PATH" "$TEST_FILE" \
    --project-ref bptmvznotgunewboppnl

# Test the edge function
echo "🚀 Invoking import_emdf function..."

supabase functions invoke import_emdf \
    --project-ref bptmvznotgunewboppnl \
    --no-verify-jwt \
    --body "{
        \"name\": \"$STORAGE_PATH\",
        \"bucket\": \"emdf_imports\",
        \"metadata\": {
            \"user_id\": \"$USER_ID\",
            \"proj_name\": \"Villa Test Import\"
        }
    }"

# Clean up
echo "🧹 Cleaning up test file..."
rm -f "$TEST_FILE"

echo "✅ Test completed! Check your projects list for the new import."