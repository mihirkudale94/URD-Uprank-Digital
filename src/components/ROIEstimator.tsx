"use client";
import { useState } from "react";
import styles from "./ROIEstimator.module.css";

export default function ROIEstimator() {
  const [budget, setBudget] = useState(50000);

  const calculateROI = () => {
    // A simplified agency logic for current estimation
    const estimatedTraffic = Math.floor(budget / 12);
    const estimatedLeads = Math.floor(estimatedTraffic * 0.08);
    return { estimatedTraffic, estimatedLeads };
  };

  const { estimatedTraffic, estimatedLeads } = calculateROI();

  return (
    <div className={styles.container}>
      <div>
        <h3 className={styles.title}>Growth Estimator</h3>
        <p className={styles.subtitle}>Adjust your monthly budget to see your estimated digital &quot;Spark&quot; and market reach.</p>
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.budgetLabel}>
          Monthly Investment: ₹{budget.toLocaleString()}
          <span>Scale your growth →</span>
        </div>
        <input
          type="range"
          min="10000"
          max="500000"
          step="10000"
          value={budget}
          onChange={(e) => setBudget(parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard}>
          <span className={styles.val}>{estimatedTraffic.toLocaleString()}+</span>
          <span className={styles.lab}>Monthly Traffic</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.val}>{estimatedLeads.toLocaleString()}+</span>
          <span className={styles.lab}>Potential Leads</span>
        </div>
      </div>

      <div className={styles.foot}>*Estimates based on current market benchmarks and industry averages.</div>
    </div>
  );
}
