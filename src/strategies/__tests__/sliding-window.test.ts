import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { applySlidingWindow } from "../sliding-window.js";

describe("Sliding Window Mitigation", () => {
  let history: InMemoryChatMessageHistory;
  const WINDOW_SIZE = 10; // 5 turns

  beforeEach(() => {
    history = new InMemoryChatMessageHistory();
  });

  it("should return all messages when within window size", async () => {
    await history.addMessage(new HumanMessage("Message 1"));
    await history.addMessage(new AIMessage("Response 1"));
    await history.addMessage(new HumanMessage("Message 2"));
    await history.addMessage(new AIMessage("Response 2"));
    
    const result = await applySlidingWindow(history, WINDOW_SIZE);
    
    expect(result).toHaveLength(4);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[0].content).toBe("Message 1");
  });

  it("should return only last N messages when exceeding window size", async () => {
    // Add 12 messages (6 turns) - exceeds window of 10
    for (let i = 1; i <= 6; i++) {
      await history.addMessage(new HumanMessage(`Message ${i}`));
      await history.addMessage(new AIMessage(`Response ${i}`));
    }
    
    const result = await applySlidingWindow(history, WINDOW_SIZE);
    
    // Should have exactly 10 messages (last 5 turns)
    expect(result).toHaveLength(10);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[0].content).toBe("Message 2");
  });

  it("should keep exactly last N messages", async () => {
    // Add 12 messages (6 turns)
    for (let i = 1; i <= 6; i++) {
      await history.addMessage(new HumanMessage(`Message ${i}`));
      await history.addMessage(new AIMessage(`Response ${i}`));
    }
    
    const result = await applySlidingWindow(history, WINDOW_SIZE);
    
    expect(result).toHaveLength(10);
    
    // First message should be from turn 2 (messages 1-2 were dropped)
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[0].content).toBe("Message 2");
    
    // Last message should be from turn 6
    expect(result[9]).toBeInstanceOf(AIMessage);
    expect(result[9].content).toBe("Response 6");
  });

  it("should drop oldest messages first", async () => {
    // Add 20 messages (10 turns)
    for (let i = 1; i <= 10; i++) {
      await history.addMessage(new HumanMessage(`Message ${i}`));
      await history.addMessage(new AIMessage(`Response ${i}`));
    }
    
    const result = await applySlidingWindow(history, WINDOW_SIZE);
    
    expect(result).toHaveLength(10);
    
    // Messages 1-5 should be dropped
    const messageContents = result.map(m => m.content);
    expect(messageContents).not.toContain("Message 1");
    expect(messageContents).not.toContain("Response 1");
    expect(messageContents).not.toContain("Message 5");
    
    // Messages 6-10 should be kept
    expect(messageContents).toContain("Message 6");
    expect(messageContents).toContain("Response 10");
  });

  it("should handle different window sizes", async () => {
    // Add 10 messages
    for (let i = 1; i <= 5; i++) {
      await history.addMessage(new HumanMessage(`Message ${i}`));
      await history.addMessage(new AIMessage(`Response ${i}`));
    }
    
    // Test with window size of 4 (2 turns)
    const result = await applySlidingWindow(history, 4);
    
    expect(result).toHaveLength(4);
    expect(result[0]).toBeInstanceOf(HumanMessage);
    expect(result[0].content).toBe("Message 4");
    expect(result[3].content).toBe("Response 5");
  });
});
