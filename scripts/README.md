# Knowledge Base Scripts

Scripts for managing document uploads and ingestion into AWS Bedrock Knowledge Base.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform infrastructure deployed (`cd terraform && terraform apply`)
- `jq` installed for JSON parsing (`brew install jq` on macOS)

## Scripts

### 1. upload-docs.sh

Uploads all documents from `./knowledge` directory to the S3 source bucket.

```bash
./scripts/upload-docs.sh
```

**What it does:**
- Syncs all files from `./knowledge/` to S3
- Deletes files from S3 that no longer exist locally
- Excludes hidden files and .DS_Store

### 2. trigger-ingestion.sh

Triggers the Knowledge Base to process uploaded documents and generate embeddings.

```bash
./scripts/trigger-ingestion.sh
```

**What it does:**
- Starts an ingestion job in AWS Bedrock
- Monitors job status and waits for completion
- Shows statistics when complete

## Workflow

```bash
# 1. Add documents to the knowledge directory
cp my-docs/*.pdf knowledge/

# 2. Upload to S3
./scripts/upload-docs.sh

# 3. Trigger ingestion
./scripts/trigger-ingestion.sh
```

## Notes

- The ingestion process is **incremental** - only new or modified files are processed
- Ingestion can take several minutes depending on document count and size
- After ingestion completes, documents are ready for querying via the Knowledge Base API
