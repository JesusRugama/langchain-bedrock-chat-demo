import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

describe("Chat Message History", () => {
  let history: InMemoryChatMessageHistory;

  beforeEach(() => {
    history = new InMemoryChatMessageHistory();
  });

  it("should start with empty history", async () => {
    const messages = await history.getMessages();
    expect(messages).toHaveLength(0);
  });

  it("should add human message to history", async () => {
    await history.addMessage(new HumanMessage("Hello"));
    
    const messages = await history.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toBeInstanceOf(HumanMessage);
    expect(messages[0].content).toBe("Hello");
  });

  it("should add AI message to history", async () => {
    await history.addMessage(new AIMessage("Hi there!"));
    
    const messages = await history.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toBeInstanceOf(AIMessage);
    expect(messages[0].content).toBe("Hi there!");
  });

  it("should maintain conversation order", async () => {
    await history.addMessage(new HumanMessage("Hello"));
    await history.addMessage(new AIMessage("Hi there!"));
    await history.addMessage(new HumanMessage("How are you?"));
    await history.addMessage(new AIMessage("I'm doing well!"));
    
    const messages = await history.getMessages();
    expect(messages).toHaveLength(4);
    expect(messages[0]).toBeInstanceOf(HumanMessage);
    expect(messages[0].content).toBe("Hello");
    expect(messages[1]).toBeInstanceOf(AIMessage);
    expect(messages[1].content).toBe("Hi there!");
    expect(messages[2]).toBeInstanceOf(HumanMessage);
    expect(messages[2].content).toBe("How are you?");
    expect(messages[3]).toBeInstanceOf(AIMessage);
    expect(messages[3].content).toBe("I'm doing well!");
  });

  it("should send all messages to model on each invocation", async () => {
    // Simulate conversation flow
    await history.addMessage(new HumanMessage("Message 1"));
    let messages = await history.getMessages();
    expect(messages).toHaveLength(1);
    
    await history.addMessage(new AIMessage("Response 1"));
    messages = await history.getMessages();
    expect(messages).toHaveLength(2);
    
    await history.addMessage(new HumanMessage("Message 2"));
    messages = await history.getMessages();
    expect(messages).toHaveLength(3);
    
    await history.addMessage(new AIMessage("Response 2"));
    messages = await history.getMessages();
    expect(messages).toHaveLength(4);
    
    // Verify all messages are present
    expect(messages.map(m => m.content)).toEqual([
      "Message 1",
      "Response 1",
      "Message 2",
      "Response 2"
    ]);
  });
});
