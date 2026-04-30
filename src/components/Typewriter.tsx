"use client";
import { useState, useEffect } from "react";

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export default function Typewriter({
  words,
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseTime = 2000,
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleTyping = () => {
      const currentFullWord = words[currentWordIndex];
      
      if (isDeleting) {
        setCurrentText(prev => prev.slice(0, -1));
        
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          timeout = setTimeout(handleTyping, typingSpeed);
        } else {
          timeout = setTimeout(handleTyping, deletingSpeed);
        }
      } else {
        setCurrentText(currentFullWord.slice(0, currentText.length + 1));
        
        if (currentText === currentFullWord) {
          timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        } else {
          timeout = setTimeout(handleTyping, typingSpeed);
        }
      }
    };

    timeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span>
      {currentText}
      <span style={{ 
        borderLeft: "2px solid currentColor", 
        marginLeft: "2px",
        animation: "blink 1s step-end infinite",
        display: "inline-block",
        verticalAlign: "middle",
        height: "1em"
      }}></span>
    </span>
  );
}
