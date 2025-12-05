import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AssistantIcon from './AssistantIcon';
import ChatWindow from './ChatWindow';
import { llmService } from '../api/llmService';
import type { LLMMessage } from '../api/types';
import './mobile-optimizations.css';

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
  const [conversationHistory, setConversationHistory] = useState<LLMMessage[]>([]);

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
      // If we are closing the chat, just hide the output window but keep messages
      if (!newChatState) {
        setShowOutput(false);
        // Don't clear messages or history - keep them for when user reopens
      } else {
        // When opening, show output if we have messages from previous session
        if (messages.length > 0) {
          setShowOutput(true);
        }
      }
      return newChatState;
    });
  };

  // This handles closing when clicking outside the chat windows.
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setShowOutput(false);
    // Don't clear messages or history - keep them for when user reopens
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isAITyping) return;

    // Hide the previous output and disable input
    setShowOutput(false);
    setIsAITyping(true);
    setMessages(prev => [...prev, { role: 'user', text: input }]);

    // Add user message to conversation history (keep only last 6 messages)
    const newConversationHistory: LLMMessage[] = [
      ...conversationHistory.slice(-5), // Keep last 5 messages to make room for new one
      { role: 'user', content: input }
    ];

    try {
      // Send message to LLM API
      const response = await llmService.sendMessage(newConversationHistory);
      
      if (response.success && response.message) {
        // Add AI response to messages and conversation history
        setMessages(prev => [...prev, { role: 'model', text: response.message! }]);
        setConversationHistory([
          ...newConversationHistory,
          { role: 'assistant', content: response.message! }
        ]);
      } else {
        // Handle API error
        const errorMessage = response.error || 'Sorry, I encountered an error. Please try again.';
        setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage}` }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Sorry, I\'m having trouble connecting. Please check your configuration and try again.';
      
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage}` }]);
    } finally {
      // Show the new output and re-enable the input
      setShowOutput(true);
      setIsAITyping(false);
    }
  };

  if (!isComponentVisible || isLoading) {
    return null;
  }

  return (
    <>
      <motion.div
        className="fixed z-50 assistant-icon-container"
        style={{
          right: '20px', // Fixed 20px from right edge
          bottom: '20px', // Fixed 20px from bottom edge
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="assistant-icon-wrapper">
          <AssistantIcon
            onClick={handleOrbClick}
            isThinking={isAITyping}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
          />
        </div>
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