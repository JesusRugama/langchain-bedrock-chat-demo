## Project Summary

LangChainBedrockChat is a minimal, production-ready starter for a conversational chatbot built with:
- **LangChain.js** (`ChatPromptTemplate`, LCEL, `RunnableWithMessageHistory`)
- **Amazon Bedrock** via `ChatBedrockConverse`
- **Node.js + TypeScript**
- **In-memory chat history**

The goal is to provide a clean baseline that is easy to understand, run, and extend.

## Scope

This document covers **Phase 1 only**:
- CLI conversational chatbot
- LangChain.js + AWS Bedrock (Converse API)
- LCEL chain with message history
- TypeScript/Node.js architecture

No roadmap or future planning content is included here.

## Current Features (Phase 1)

- Multi-turn conversational chat in a CLI loop
- Chat history memory per session
- Runtime model selection support
- Configurable system prompt
- Clear separation of concerns across modules

## Architecture (Current)

~~~
Entry Point (CLI)
      ↓
  Chain Layer (LCEL pipeline)
      ↓
  ┌──────┬─────────┬────────┐
  │ LLM  │ Prompts │ Memory │
  └──────┴─────────┴────────┘
      ↓
 LangChain Bedrock Integration
      ↓
 AWS Bedrock (Converse API)
~~~

## Source Structure (Current)

~~~
src/
  config/   # env variables and constants
  llm/      # ChatBedrockConverse setup
  prompts/  # system + chat templates
  memory/   # in-memory message history
  chain/    # LCEL chain + history wrapper
  index.ts  # CLI entry point (REPL loop)
~~~

## Runtime Flow

1. User enters a message in CLI
2. Message is added to session history
3. Chain runs with history + new input
4. Bedrock returns assistant response
5. Response is printed and stored in history
6. Loop continues
