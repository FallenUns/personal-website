import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AssistantIcon from './AssistantIcon';
import ChatWindow from './ChatWindow';

// Define the shape of a message
interface Message {
  role: 'user' | 'model';
  text: string;
}

const FloatingAssistant: React.FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // State management for the chat flow
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsComponentVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // The orb click is now a simple toggle for the entire chat UI.
  const handleOrbClick = () => {
    setIsChatOpen(prev => {
      const newChatState = !prev;
      // If we are closing the chat, also hide the output window.
      if (!newChatState) {
        setShowOutput(false);
      } else {
        // When opening, reset messages for a new session.
        setMessages([]);
      }
      return newChatState;
    });
  };

  // This handles closing when clicking outside the chat windows.
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setShowOutput(false);
  };

  const handleSendMessage = (input: string) => {
    if (!input.trim() || isAITyping) return;

    // Hide the previous output and disable input
    setShowOutput(false);
    setIsAITyping(true);
    setMessages(prev => [...prev, { role: 'user', text: input }]);

    // Simulate AI response
    setTimeout(() => {
      const responseText = "Excellent! The input bar remains while I respond, and the old output is replaced. When you're finished, click the orb to close everything.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      
      // Show the new output and re-enable the input
      setShowOutput(true);
      setIsAITyping(false);
    }, 1500);
  };

  if (!isComponentVisible || isLoading) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed bottom-[-40px] right-[-40px] z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', type: 'spring', stiffness: 100, damping: 20 }}
      >
        <AssistantIcon
          onClick={handleOrbClick}
          isThinking={isAITyping}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
        />
      </motion.div>
      <ChatWindow
        isChatOpen={isChatOpen}
        showOutput={showOutput}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClose={handleCloseChat}
        isPressed={isPressed}
        isAITyping={isAITyping}
      />
    </>
  );
};

export default FloatingAssistant;