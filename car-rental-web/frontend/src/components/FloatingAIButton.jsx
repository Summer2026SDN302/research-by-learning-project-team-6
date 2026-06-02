import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const FloatingAIButton = () => {
  const handleAIClick = () => {
    toast('AI Chat feature coming soon! 🤖', {
      icon: '⏳',
      duration: 3000
    });
  };

  return (
    <motion.button
      onClick={handleAIClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-[0_8px_32px_rgba(212,175,55,0.4)] flex items-center justify-center transition-shadow hover:shadow-[0_12px_40px_rgba(212,175,55,0.6)]"
      title="AI Assistant (Coming Soon)"
    >
      <motion.div
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 15 }}
        transition={{ duration: 0.3 }}
      >
        <Bot size={24} />
      </motion.div>
    </motion.button>
  );
};

export default FloatingAIButton;
