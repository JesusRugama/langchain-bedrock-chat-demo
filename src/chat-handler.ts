import { ChatBedrockConverse } from "@langchain/aws";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { BedrockLogger } from "./helpers/logger.js";
import { applySlidingWindow } from "./helpers/sliding-window.js";
import { logChatInvocation, logChatError } from "./helpers/chat-logger.js";

export interface ChatHandlerConfig {
  model: ChatBedrockConverse;
  history: InMemoryChatMessageHistory;
  windowSize: number;
  logger?: BedrockLogger;
  modelId: string;
}

export interface ChatResponse {
  content: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

export async function handleChatMessage(
  message: string,
  config: ChatHandlerConfig
): Promise<ChatResponse> {
  const { model, history, windowSize, logger, modelId } = config;
  const startTime = Date.now();

  try {
    await history.addMessage(new HumanMessage(message));

    const messagesToSend = await applySlidingWindow(history, windowSize);
    const response = await model.invoke(messagesToSend);

    const aiMessage = new AIMessage(response.content.toString());
    await history.addMessage(aiMessage);

    const latencyMs = Date.now() - startTime;

    await logChatInvocation(logger, {
      modelId,
      messagesToSend,
      aiMessage,
      inputTokens: response.usage_metadata?.input_tokens,
      outputTokens: response.usage_metadata?.output_tokens,
      latencyMs,
    });

    return {
      content: response.content.toString(),
      latencyMs,
      inputTokens: response.usage_metadata?.input_tokens,
      outputTokens: response.usage_metadata?.output_tokens,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await logChatError(logger, {
      modelId,
      messageCount: (await history.getMessages()).length,
      latencyMs,
      error: errorMessage,
    });

    throw error;
  }
}
