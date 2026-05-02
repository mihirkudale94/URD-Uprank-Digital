"use client";
import { useState, useEffect } from 'react';
import styles from './ROIEstimator.module.css';

export default function ROIEstimator() {
  const [adSpend, setAdSpend] = useState(50000);
  const [currentCPL, setCurrentCPL] = useState(500);
  const [estimatedLeads, setEstimatedLeads] = useState(0);
  const [aiLeads, setAiLeads] = useState(0);

  useEffect(() => {
    const baselineLeads = Math.floor(adSpend / currentCPL);
    // 2026 Benchmark: AI optimization usually increases lead volume by 30-60% for the same spend
    const improvedLeads = Math.floor(baselineLeads * 1.45);
    setEstimatedLeads(baselineLeads);
    setAiLeads(improvedLeads);
  }, [adSpend, currentCPL]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>AI Growth Estimator</h3>
        <p className={styles.subtitle}>See how much more you can scale with URD AI</p>
      </div>

      <div className={styles.calculator}>
        <div className={styles.inputGroup}>
          <label>Monthly Ad Spend (₹)</label>
          <input 
            type="range" 
            min="10000" 
            max="1000000" 
            step="10000" 
            value={adSpend} 
            onChange={(e) => setAdSpend(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.valDisplay}>₹{adSpend.toLocaleString()}</div>
        </div>

        <div className={styles.inputGroup}>
          <label>Target Cost Per Lead (₹)</label>
          <input 
            type="range" 
            min="100" 
            max="5000" 
            step="50" 
            value={currentCPL} 
            onChange={(e) => setCurrentCPL(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.valDisplay}>₹{currentCPL}</div>
        </div>

        <div className={styles.results}>
          <div className={styles.resultItem}>
            <span className={styles.resLabel}>Current Lead Volume</span>
            <span className={styles.resVal}>{estimatedLeads}</span>
          </div>
          <div className={`${styles.resultItem} ${styles.highlight}`}>
            <span className={styles.resLabel}>Estimated AI Volume</span>
            <span className={styles.resVal}>{aiLeads}</span>
            <span className={styles.growthBadge}>+45% Efficiency</span>
          </div>
        </div>
        
        <p className={styles.disclaimer}>*Estimates based on average 2026 AI-driven campaign performance.</p>
      </div>
    </div>
  );
}
