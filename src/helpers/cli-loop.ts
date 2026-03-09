import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import { StrategyName } from "../strategies/types.js";

/**
 * Callback function type for handling user messages in the chat loop.
 * @param message - The user's input message
 * @returns A promise that resolves when the message has been processed
 */
export type OnRequest = (message: string) => Promise<void>;

/**
 * Exits the CLI application gracefully.
 * Prints a goodbye message and terminates the process.
 */
function exitCLI(): void {
  console.log(chalk.gray("\n\nGoodbye!"));
  process.exit(0);
}

/**
 * Prompts the user to select a memory strategy at CLI startup.
 */
export async function selectStrategy(): Promise<StrategyName> {
  const answer = await prompts(
    {
      type: "select",
      name: "strategy",
      message: "Select a memory strategy",
      choices: [
        { title: "Sliding Window", description: "Keep last N messages, drop older ones", value: "sliding-window" },
        { title: "Summarization", description: "Summarize older messages, keep recent ones", value: "summarization" },
        { title: "RAG (Hybrid)", description: "Sliding window + vector search for key facts", value: "rag" },
      ],
      initial: 0,
    },
    { onCancel: exitCLI }
  );

  return answer.strategy;
}

/**
 * Runs the interactive chat loop for the CLI application.
 * Displays a startup spinner, prompts for user input in a loop,
 * and invokes the provided callback for each message.
 *
 * @param onRequest - Callback function to handle each user message
 * @returns A promise that resolves when the chat loop exits
 *
 * @example
 * ```typescript
 * await runChatLoop(async (message) => {
 *   console.log("User said:", message);
 * });
 * ```
 */
export async function runChatLoop(onRequest: OnRequest): Promise<void> {
  const spinner = ora("Bootstrapping CLI...").start();
  await new Promise((resolve) => setTimeout(resolve, 450));
  spinner.succeed("CLI ready");

  console.log(chalk.gray("Type 'exit' or 'quit' to end the session. Press Ctrl+C to quit.\n"));

  while (true) {
    const answer = await prompts(
      {
        type: "text",
        name: "message",
        message: ">",
      },
      {
        onCancel: exitCLI,
      },
    );

    const message = typeof answer.message === "string" ? answer.message.trim() : "";

    if (!message) {
      continue;
    }

    if (["exit", "quit"].includes(message.toLowerCase())) {
      exitCLI();
    }

    await onRequest(message);
  }
}
