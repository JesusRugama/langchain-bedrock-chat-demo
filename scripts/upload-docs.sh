#!/bin/bash
set -e

# Upload documents from ./knowledge to S3 source bucket
# Usage: ./scripts/upload-docs.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
KNOWLEDGE_DIR="$PROJECT_ROOT/knowledge"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

echo "📚 Uploading documents to S3 source bucket..."

# Check if knowledge directory exists and has files
if [ ! -d "$KNOWLEDGE_DIR" ]; then
  echo "❌ Error: knowledge directory not found at $KNOWLEDGE_DIR"
  exit 1
fi

if [ -z "$(ls -A "$KNOWLEDGE_DIR")" ]; then
  echo "⚠️  Warning: knowledge directory is empty"
  echo "   Add documents to ./knowledge/ before running this script"
  exit 1
fi

# Get S3 bucket name from Terraform outputs
cd "$TERRAFORM_DIR"
BUCKET_NAME=$(terraform output -raw knowledge_source_bucket 2>/dev/null)

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: Could not get S3 bucket name from Terraform"
  echo "   Make sure Terraform is initialized and applied"
  exit 1
fi

echo "📦 Target bucket: $BUCKET_NAME"
echo "📁 Source directory: $KNOWLEDGE_DIR"

# Count files
FILE_COUNT=$(find "$KNOWLEDGE_DIR" -type f | wc -l | tr -d ' ')
echo "📄 Found $FILE_COUNT file(s) to upload"

# Sync files to S3
echo "🚀 Syncing files..."
aws s3 sync "$KNOWLEDGE_DIR" "s3://$BUCKET_NAME/" \
  --delete \
  --exclude ".*" \
  --exclude "*.DS_Store"

echo "✅ Upload complete!"
echo ""
echo "Next step: Run ./scripts/trigger-ingestion.sh to process the documents"