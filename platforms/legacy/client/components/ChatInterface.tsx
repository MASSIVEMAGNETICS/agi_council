import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store';
import { CouncilMode } from '../../shared/types';
import AgentMessageCard from './AgentMessageCard';
import PhaseDisplay from './PhaseDisplay';
import './ChatInterface.css';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedModes, setSelectedModes] = useState<CouncilMode[]>([CouncilMode.DEBATE]);
  const { sessionMessages, isProcessing, sendQuery } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      sendQuery(input, selectedModes);
      setInput('');
    }
  };

  const toggleMode = (mode: CouncilMode) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        <div className="messages">
          <AnimatePresence>
            {sessionMessages.map((message, index) => (
              <PhaseDisplay key={index} message={message} index={index} />
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div
              className="processing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="spinner" />
              <span>Council deliberating...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area glass-dark">
        <div className="mode-selector">
          {Object.values(CouncilMode).map(mode => (
            <button
              key={mode}
              className={`mode-chip ${selectedModes.includes(mode) ? 'active' : ''}`}
              onClick={() => toggleMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your directive for the Council..."
            className="message-input"
            disabled={isProcessing}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isProcessing}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
