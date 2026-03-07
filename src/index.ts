import { ChatBedrockConverse } from "@langchain/aws";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import chalk from "chalk";
import ora from "ora";
import { runChatLoop } from "./cli.js";

// Ensure window size is odd to guarantee starting with HumanMessage
let windowSize = parseInt(process.env.CHAT_HISTORY_WINDOW || "10", 10);
if (windowSize % 2 === 0) {
  windowSize += 1;
}
const CHAT_HISTORY_WINDOW = windowSize;

/**
 * Applies sliding window mitigation to chat history.
 * Keeps only the last N messages (N is always odd to ensure starting with HumanMessage).
 * 
 * @param history - The chat message history
 * @returns Messages to send to the model (recent messages only)
 */
async function applySlidingWindow(history: InMemoryChatMessageHistory): Promise<BaseMessage[]> {
  const allMessages = await history.getMessages();
  
  // If within window size, return all messages
  if (allMessages.length <= CHAT_HISTORY_WINDOW) {
    return allMessages;
  }
  
  // Keep only last N messages (N is odd, so always starts with HumanMessage)
  return allMessages.slice(-CHAT_HISTORY_WINDOW);
}

async function main(): Promise<void> {
  const model = new ChatBedrockConverse({
    model: process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0",
    region: process.env.AWS_REGION || "us-east-1",
  });

  const history = new InMemoryChatMessageHistory();

  await runChatLoop(async (message) => {
    const thinkingSpinner = ora("Thinking...").start();
    try {
      await history.addMessage(new HumanMessage(message));
      
      const messagesToSend = await applySlidingWindow(history);
      const response = await model.invoke(messagesToSend);
      
      await history.addMessage(new AIMessage(response.content.toString()));
      
      thinkingSpinner.stop();
      console.log(chalk.cyan("assistant:"), chalk.white(response.content + "\n"));
    } catch (error) {
      thinkingSpinner.fail("Error");
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
    }
  });
}

void main();
