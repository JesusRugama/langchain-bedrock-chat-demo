import { ChatBedrockConverse } from "@langchain/aws";
import chalk from "chalk";
import ora from "ora";
import { runChatLoop } from "./cli.js";

async function main(): Promise<void> {
  const model = new ChatBedrockConverse({
    model: process.env.BEDROCK_MODEL_ID || "us.amazon.nova-lite-v1:0",
    region: process.env.AWS_REGION || "us-east-1",
  });

  await runChatLoop(async (message) => {
    const thinkingSpinner = ora("Thinking...").start();
    try {
      const response = await model.invoke(message);
      thinkingSpinner.stop();
      console.log(chalk.cyan("assistant:"), chalk.white(response.content + "\n"));
    } catch (error) {
      thinkingSpinner.fail("Error");
      console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
    }
  });
}

void main();
