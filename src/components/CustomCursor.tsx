"use client";
import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    document.body.style.cursor = "none";

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const moveDot = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      }
      requestAnimationFrame(animateRing);
    };

    const handleHoverIn = () => {
      if (dotRef.current) dotRef.current.classList.add(styles.hovered);
      if (ringRef.current) ringRef.current.classList.add(styles.hovered);
    };
    const handleHoverOut = () => {
      if (dotRef.current) dotRef.current.classList.remove(styles.hovered);
      if (ringRef.current) ringRef.current.classList.remove(styles.hovered);
    };

    window.addEventListener("mousemove", moveDot);
    const raf = requestAnimationFrame(animateRing);

    // Add hover effect to interactive elements
    const interactives = document.querySelectorAll("a, button, [data-cursor]");
    interactives.forEach(el => {
      el.addEventListener("mouseenter", handleHoverIn);
      el.addEventListener("mouseleave", handleHoverOut);
    });

    return () => {
      window.removeEventListener("mousemove", moveDot);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      interactives.forEach(el => {
        el.removeEventListener("mouseenter", handleHoverIn);
        el.removeEventListener("mouseleave", handleHoverOut);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.dot} aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true" />
    </>
  );
}
