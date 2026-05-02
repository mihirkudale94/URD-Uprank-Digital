"use client";
import styles from "./Concierge.module.css";
import Image from "next/image";

export default function Concierge() {
  const openWhatsApp = () => {
    window.open("https://wa.me/919371116165?text=Hi, I am interested in Uprank Digital services.", "_blank");
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.launcher} onClick={openWhatsApp} aria-label="Chat on WhatsApp">
        <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className={styles.waIcon} width={32} height={32} />
      </button>
    </div>
  );
}
