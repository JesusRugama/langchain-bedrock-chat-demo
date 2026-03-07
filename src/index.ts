import { ChatBedrockConverse } from "@langchain/aws";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import chalk from "chalk";
import ora from "ora";
import { runChatLoop } from "./cli.js";
import { BedrockLogger } from "./logger.js";
import { applySlidingWindow, normalizeWindowSize } from "./sliding-window.js";

const CHAT_HISTORY_WINDOW = normalizeWindowSize(
  parseInt(process.env.CHAT_HISTORY_WINDOW || "10", 10)
);

async function main(): Promise<void> {
  const region = process.env.AWS_REGION || "us-east-1";
  const model = new ChatBedrockConverse({
    model: process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0",
    region,
  });

  const history = new InMemoryChatMessageHistory();

  let logger: BedrockLogger | undefined;
  if (process.env.CLOUDWATCH_LOG_GROUP) {
    logger = new BedrockLogger(region, process.env.CLOUDWATCH_LOG_GROUP);
    await logger.initialize();
    console.log(chalk.gray(`CloudWatch logging enabled: ${process.env.CLOUDWATCH_LOG_GROUP}\n`));
  }

  await runChatLoop(async (message) => {
    const thinkingSpinner = ora("Thinking...").start();
    const startTime = Date.now();
    try {
      await history.addMessage(new HumanMessage(message));
      
      const messagesToSend = await applySlidingWindow(history, CHAT_HISTORY_WINDOW);
      const response = await model.invoke(messagesToSend);
      
      const aiMessage = new AIMessage(response.content.toString());
      await history.addMessage(aiMessage);
      
      const latencyMs = Date.now() - startTime;
      
      if (logger) {
        await logger.logInvocation({
          timestamp: Date.now(),
          model: process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0",
          messageCount: messagesToSend.length,
          messages: [
            ...messagesToSend.map(msg => ({
              role: msg._getType(),
              content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            })),
            {
              role: 'ai',
              content: response.content.toString(),
            },
          ],
          inputTokens: response.usage_metadata?.input_tokens,
          outputTokens: response.usage_metadata?.output_tokens,
          latencyMs,
        });
      }
      
      thinkingSpinner.stop();
      console.log(chalk.cyan("assistant:"), chalk.white(response.content + "\n"));
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      if (logger) {
        await logger.logInvocation({
          timestamp: Date.now(),
          model: process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0",
          messageCount: (await history.getMessages()).length,
          latencyMs,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      
      thinkingSpinner.fail("Error");
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
    }
  });
}

void main();
