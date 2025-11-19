import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css'; // Assuming you will create a Loader.css for styling

const Loader = () => {
  return (
    <motion.div 
      className="loader-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loader">
        <div className="spinner"></div>
      </div>
    </motion.div>
  );
};

export default Loader;