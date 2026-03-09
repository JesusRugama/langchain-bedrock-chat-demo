import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage } from "@langchain/core/messages";

export type StrategyName = "sliding-window" | "summarization" | "rag";

export type MemoryStrategy = (
  history: InMemoryChatMessageHistory
) => Promise<BaseMessage[]>;
