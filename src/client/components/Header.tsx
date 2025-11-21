import React from 'react';
import { motion } from 'framer-motion';
import './Header.css';

const Header: React.FC = () => {
  return (
    <motion.header 
      className="header glass-dark"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-content">
        <div className="logo">
          <motion.div 
            className="logo-icon"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ⚡
          </motion.div>
          <div className="logo-text">
            <h1>OmniForge</h1>
            <span className="subtitle">Multi-LLM Council</span>
          </div>
        </div>
        <div className="status">
          <div className="status-indicator online" />
          <span>Council Active</span>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
