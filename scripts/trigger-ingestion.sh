#!/bin/bash
set -e

# Trigger Knowledge Base ingestion job
# Usage: ./scripts/trigger-ingestion.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/terraform"

echo "🔄 Triggering Knowledge Base ingestion..."

cd "$TERRAFORM_DIR"

# Get outputs from Terraform
KB_ID=$(terraform output -raw knowledge_base_id 2>/dev/null)
DS_ID=$(terraform output -raw data_source_id 2>/dev/null)

if [ -z "$KB_ID" ] || [ -z "$DS_ID" ]; then
  echo "❌ Error: Could not get Knowledge Base or Data Source ID from Terraform"
  echo "   Make sure Terraform is initialized and applied"
  exit 1
fi

echo "📚 Knowledge Base ID: $KB_ID"
echo "📊 Data Source ID: $DS_ID"

# Start ingestion job
echo "🚀 Starting ingestion job..."
INGESTION_JOB=$(aws bedrock-agent start-ingestion-job \
  --knowledge-base-id "$KB_ID" \
  --data-source-id "$DS_ID" \
  --region us-east-1 \
  --output json)

JOB_ID=$(echo "$INGESTION_JOB" | jq -r '.ingestionJob.ingestionJobId')

echo "✅ Ingestion job started!"
echo "📋 Job ID: $JOB_ID"
echo ""
echo "Monitoring job status..."

# Poll for job completion
while true; do
  JOB_STATUS=$(aws bedrock-agent get-ingestion-job \
    --knowledge-base-id "$KB_ID" \
    --data-source-id "$DS_ID" \
    --ingestion-job-id "$JOB_ID" \
    --region us-east-1 \
    --output json)

  STATUS=$(echo "$JOB_STATUS" | jq -r '.ingestionJob.status')

  case $STATUS in
    COMPLETE)
      echo "✅ Ingestion complete!"
      STATS=$(echo "$JOB_STATUS" | jq -r '.ingestionJob.statistics')
      echo "📊 Statistics: $STATS"
      exit 0
      ;;
    FAILED)
      echo "❌ Ingestion failed!"
      FAILURE_REASONS=$(echo "$JOB_STATUS" | jq -r '.ingestionJob.failureReasons // []')
      echo "❌ Failure reasons: $FAILURE_REASONS"
      exit 1
      ;;
    IN_PROGRESS|STARTING)
      echo "⏳ Status: $STATUS..."
      sleep 10
      ;;
    *)
      echo "⚠️  Unknown status: $STATUS"
      sleep 10
      ;;
  esac
done