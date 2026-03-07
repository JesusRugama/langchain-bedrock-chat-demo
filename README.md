## Project Summary

A CLI chatbot demo built with LangChain.js and AWS Bedrock, exploring conversation memory management patterns.

**Stack:**
- **LangChain.js** for LLM orchestration
- **Amazon Bedrock** (Converse API) with Nova Lite model
- **Node.js + TypeScript**
- **In-memory chat history** with sliding window
- **CloudWatch** for optional request logging
- **Terraform** for infrastructure as code

## Features

- **Multi-turn conversations** — CLI-based chat loop with persistent session memory
- **Sliding window memory** — Configurable context window to manage token limits (keeps last N messages)
- **CloudWatch logging** — Optional structured logging of all Bedrock invocations (messages, tokens, latency)
- **AWS SSO integration** — Uses credential chain for authentication
- **Infrastructure as code** — Terraform setup for CloudWatch log groups

## Architecture

```
CLI Input
    ↓
Add to History
    ↓
Apply Sliding Window (keep last N messages)
    ↓
Invoke Bedrock Model
    ↓
Log to CloudWatch (optional)
    ↓
Display Response
```

## Project Structure

```
src/
  index.ts           # Main entry point and chat loop
  cli.ts             # CLI interface utilities
  logger.ts          # CloudWatch logging client
  sliding-window.ts  # Memory management helpers
  __tests__/         # Test suite

terraform/
  cloudwatch.tf      # Log group resources
  provider.tf        # AWS provider config
  variables.tf       # Configuration variables
  outputs.tf         # Resource outputs
  backend.tf         # S3 backend for state
```

## How It Works

1. User enters a message in the CLI
2. Message is added to in-memory history
3. Sliding window keeps only the last N messages (configurable, defaults to 11)
4. Filtered messages are sent to Bedrock
5. Response is logged to CloudWatch (if enabled)
6. Response is displayed and added to history
7. Loop continues

## Configuration

Environment variables (`.env`):

```bash
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-lite-v1:0
CHAT_HISTORY_WINDOW=10  # Will be adjusted to 11 (odd number)
CLOUDWATCH_LOG_GROUP=/aws/bedrock/basic-langchain-demo  # Optional
```

## Setup

**Install dependencies:**
```bash
npm install
```

**Configure AWS credentials:**
```bash
aws sso login --profile <your-profile>
```

**Deploy infrastructure (optional, for CloudWatch logging):**
```bash
cd terraform
terraform init
terraform apply
```

**Run the chatbot:**
```bash
npm run cli
```

## Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
```

## Design Notes

**Why sliding window?**
- Simple and predictable memory management
- No LLM calls needed for summarization
- Works well for short-to-medium conversations (most use cases)
- Transparent behavior (always keeps last N messages)

**When to use alternatives:**
- **Summarization** — For very long conversations where early context matters
- **RAG/vector search** — For cross-session memory or large knowledge bases
- **Hybrid** — Combine sliding window + retrieval for specific facts
