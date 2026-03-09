import { BaseMessage } from "@langchain/core/messages";
import { BedrockLogger } from "./logger.js";

function serializeMessage(msg: BaseMessage) {
  return {
    role: msg._getType(),
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
  };
}

export async function logChatInvocation(
  logger: BedrockLogger | undefined,
  data: {
    modelId: string;
    messagesToSend: BaseMessage[];
    aiMessage: BaseMessage;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs: number;
  }
): Promise<void> {
  await logger?.logInvocation({
    timestamp: Date.now(),
    model: data.modelId,
    messageCount: data.messagesToSend.length,
    messages: [
      ...data.messagesToSend.map(serializeMessage),
      serializeMessage(data.aiMessage),
    ],
    inputTokens: data.inputTokens,
    outputTokens: data.outputTokens,
    latencyMs: data.latencyMs,
  });
}

export async function logChatError(
  logger: BedrockLogger | undefined,
  data: {
    modelId: string;
    messageCount: number;
    latencyMs: number;
    error: string;
  }
): Promise<void> {
  await logger?.logInvocation({
    timestamp: Date.now(),
    model: data.modelId,
    messageCount: data.messageCount,
    latencyMs: data.latencyMs,
    error: data.error,
  });
}
