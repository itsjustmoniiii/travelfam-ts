import React from "react";
import styles from "../styles/Spinner.module.css";

const Spinner = () => {
  return (
    <div className={styles.spinner_container}>
      <div className={styles.spinner}></div>
    </div>
  );
};

export default Spinner;
