import { ChatBedrockConverse } from "@langchain/aws";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import chalk from "chalk";
import ora from "ora";
import { runChatLoop } from "./cli.js";

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
      
      const messages = await history.getMessages();
      const response = await model.invoke(messages);
      
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
