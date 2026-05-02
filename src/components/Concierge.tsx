"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Concierge.module.css";
import Image from "next/image";

export default function Concierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([
    { 
      role: "assistant", 
      content: "Hi! We are Uprank Digital. How can we help you grow your business today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, time: now }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, time: now }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm offline. Please reach out via WhatsApp directly.", time: now }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/919371116165?text=Hi, I am interested in Uprank Digital services.", "_blank");
  };

  return (
    <div className={styles.wrapper}>
      {isOpen && (
        <div className={`${styles.chatWindow} animate-fade-in`}>
          <div className={styles.header}>
            <div className={styles.agentInfo}>
              <div className={styles.avatarWrap}>
                <Image src="/img/favcon.png" alt="Uprank Digital" className={styles.avatar} width={40} height={40} />
                <span className={styles.onlineDot}></span>
              </div>
              <div className={styles.agentMeta}>
                <span className={styles.agentName}>Uprank Digital</span>
                <span className={styles.agentStatus}>Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.close} aria-label="Close chat">✕</button>
          </div>
          
          <div className={styles.messages} ref={scrollRef}>
            <div className={styles.systemNote}>Messages are end-to-end encrypted. No one outside of this chat can read them.</div>
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? styles.userMsg : styles.aiMsg}>
                <div className={styles.msgContent}>{m.content}</div>
                <div className={styles.msgTime}>
                  {m.time}
                  {m.role === "user" && <span className={styles.check}>✓✓</span>}
                </div>
              </div>
            ))}
            {isLoading && <div className={styles.aiMsg}>Typing...</div>}
          </div>

          <div className={styles.inputArea}>
            <input 
              type="text" 
              placeholder="Type a message" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} disabled={isLoading} className={styles.sendBtn} aria-label="Send message">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
            </button>
          </div>

          <button className={styles.whatsappDirect} onClick={openWhatsApp}>
            <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={20} height={20} />
            Continue to WhatsApp Chat
          </button>
        </div>
      )}
      
      <button className={styles.launcher} onClick={() => setIsOpen(!isOpen)} aria-label="Open chat widget">
        <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className={styles.waIcon} width={32} height={32} />
        <span className={styles.badge}>1</span>
      </button>
    </div>
  );
}
