import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage } from "@langchain/core/messages";

export type MemoryStrategy = (
  history: InMemoryChatMessageHistory
) => Promise<BaseMessage[]>;
