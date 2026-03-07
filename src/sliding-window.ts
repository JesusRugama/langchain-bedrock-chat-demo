import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { BaseMessage } from "@langchain/core/messages";

/**
 * Applies sliding window mitigation to chat history.
 * Keeps only the last N messages (N is always odd to ensure starting with HumanMessage).
 * 
 * @param history - The chat message history
 * @param windowSize - Maximum number of messages to keep (will be adjusted to odd if even)
 * @returns Messages to send to the model (recent messages only)
 */
export async function applySlidingWindow(
  history: InMemoryChatMessageHistory,
  windowSize: number
): Promise<BaseMessage[]> {
  const allMessages = await history.getMessages();
  
  // If within window size, return all messages
  if (allMessages.length <= windowSize) {
    return allMessages;
  }
  
  // Keep only last N messages (N is odd, so always starts with HumanMessage)
  return allMessages.slice(-windowSize);
}

/**
 * Ensures window size is odd to guarantee starting with HumanMessage
 */
export function normalizeWindowSize(size: number): number {
  return size % 2 === 0 ? size + 1 : size;
}
