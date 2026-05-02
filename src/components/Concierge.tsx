"use client";
import { useState, useEffect } from "react";
import styles from "./Concierge.module.css";
import Image from "next/image";

export default function Concierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    // Show greeting after 3 seconds
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const openWhatsApp = () => {
    window.open("https://wa.me/919371116165?text=Hi, I am interested in Uprank Digital services.", "_blank");
  };

  return (
    <div className={styles.wrapper}>
      {/* Greeting Bubble */}
      {showGreeting && !isOpen && (
        <div className={styles.greetingBubble}>
          <span className={styles.wavingHand}>👋</span>
          Hi! Need help scaling your brand?
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.agentInfo}>
              <div className={styles.avatarWrap}>
                <Image src="/img/logo-header.png" alt="URD Agent" width={40} height={40} className={styles.avatar} />
                <span className={styles.onlineDot}></span>
              </div>
              <div className={styles.agentMeta}>
                <span className={styles.agentName}>URD Concierge</span>
                <span className={styles.agentStatus}>Online | Replies instantly</span>
              </div>
            </div>
            <button className={styles.close} onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className={styles.messages}>
            <div className={styles.systemNote}>The team typically replies in a few minutes.</div>
            
            <div className={styles.aiMsg}>
              <div className={styles.agentLabel}>AI Agent</div>
              Hello! I&apos;m your URD Concierge. How can we help you grow today?
              <div className={styles.msgTime}>14:32</div>
            </div>

            <div className={styles.handoffCard}>
              <p>Want to speak with a human expert directly?</p>
              <button className={styles.handoffBtn} onClick={openWhatsApp}>
                Message us on WhatsApp
              </button>
            </div>
          </div>

          <div className={styles.quickChips}>
            <button onClick={openWhatsApp}>SEO Audit</button>
            <button onClick={openWhatsApp}>Web Design</button>
            <button onClick={openWhatsApp}>Scale with AI</button>
          </div>

          <div className={styles.whatsappDirect} onClick={openWhatsApp}>
            <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" width={20} height={20} />
            Continue to WhatsApp
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button 
        className={styles.launcher} 
        onClick={() => {
          setIsOpen(!isOpen);
          setShowGreeting(false);
        }} 
        aria-label="Toggle Concierge"
      >
        {isOpen ? (
          <span style={{ fontSize: '24px', color: 'white' }}>✕</span>
        ) : (
          <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className={styles.waIcon} width={32} height={32} />
        )}
      </button>
    </div>
  );
}
