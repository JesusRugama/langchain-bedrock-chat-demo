import { ChatBedrockConverse } from "@langchain/aws";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import chalk from "chalk";
import ora from "ora";
import { runChatLoop } from "./helpers/cli-loop.js";
import { BedrockLogger } from "./helpers/logger.js";
import { normalizeWindowSize } from "./helpers/sliding-window.js";
import { handleChatMessage } from "./chat-handler.js";

const CHAT_HISTORY_WINDOW = normalizeWindowSize(
  parseInt(process.env.CHAT_HISTORY_WINDOW || "10", 10)
);

async function main(): Promise<void> {
  const region = process.env.AWS_REGION || "us-east-1";
  const modelId = process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0";
  const model = new ChatBedrockConverse({
    model: modelId,
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

    try {
      const response = await handleChatMessage(message, {
        model,
        history,
        windowSize: CHAT_HISTORY_WINDOW,
        logger,
        modelId,
      });

      thinkingSpinner.stop();
      console.log(chalk.cyan("assistant:"), chalk.white(response.content + "\n"));
    } catch (error) {
      thinkingSpinner.fail("Error");
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
    }
  });
}

void main();
