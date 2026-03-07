import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import prompts from "prompts";

const program = new Command();

program
  .name("langchain-bedrock-chat-demo")
  .description("Basic CLI scaffold for the Phase 1 chat app")
  .parse();

function exitCLI(): void {
  console.log(chalk.gray("\n\nGoodbye!"));
  process.exit(0);
}

async function main(): Promise<void> {
  // Spinner
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

    console.log(chalk.cyan("assistant:"), chalk.white(`You typed: ${message}\n`));
  }
}

void main();
