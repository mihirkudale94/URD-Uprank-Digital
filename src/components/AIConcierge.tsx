"use client";

import { useState } from "react";
import styles from "./AIConcierge.module.css";

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: "user" | "ai", text: string}[]>([
    { role: "ai", text: "Hi! I am the Uprank AI Concierge. How can I help you grow your business today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Call the actual AI backend route
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", text: userMessage }] }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "ai", text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", text: "I'm having trouble connecting to my brain. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Chat Window */}
      {isOpen && (
        <div className={`glass ${styles.chatWindow}`}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.pulse}></span>
              <h3>AI Concierge</h3>
            </div>
            <button onClick={toggleChat} className={styles.closeBtn}>×</button>
          </div>
          
          <div className={styles.messagesContainer}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.ai}`}>
                <div className={styles.typingIndicator}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.inputArea}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className={styles.input}
            />
            <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Widget Button */}
      {!isOpen && (
        <button onClick={toggleChat} className={styles.widgetBtn}>
          <span className={styles.pulse}></span>
          Ask our AI Concierge
        </button>
      )}
    </div>
  );
}
