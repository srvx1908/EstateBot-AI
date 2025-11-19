import React from 'react';
import { motion } from 'framer-motion';
import './glass.css';

const GlassCard = ({ children }) => {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;