import React from 'react';
import { motion } from 'framer-motion';
import { AgentMessage } from '../../shared/types';
import './AgentMessageCard.css';

interface AgentMessageCardProps {
  message: AgentMessage;
  index: number;
}

const AgentMessageCard: React.FC<AgentMessageCardProps> = ({ message, index }) => {
  return (
    <motion.div
      className="agent-message-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{ borderLeftColor: message.color }}
    >
      <div className="agent-header">
        <div 
          className="agent-avatar" 
          style={{ background: message.color }}
        >
          {message.agentName.charAt(0)}
        </div>
        <div className="agent-info">
          <h4 className="agent-name">{message.agentName}</h4>
          <span className="agent-archetype">{message.archetype}</span>
        </div>
      </div>
      <div className="message-content">
        {message.content}
      </div>
    </motion.div>
  );
};

export default AgentMessageCard;
