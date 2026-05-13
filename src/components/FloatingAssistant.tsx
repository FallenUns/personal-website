import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AssistantIcon from './AssistantIcon';
import ChatWindow from './ChatWindow';
import { llmService } from '../api/llmService';
import type { LLMMessage } from '../api/types';
import { hudLog } from '../hooks/useHudBus';
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

  // The orb click handles all chat interactions
  const handleOrbClick = () => {
    // If AI is currently typing, do nothing - don't interrupt
    if (isAITyping) {
      hudLog('> assistant.click ignored: response in progress', 'warn');
      return;
    }
    
    // If chat is closed, open it
    if (!isChatOpen) {
      setIsChatOpen(true);
      hudLog('> assistant.panel open', 'ok');
      // Show previous messages if any
      if (messages.length > 0) {
        setShowOutput(true);
      }
      return;
    }
    
    // If chat is open and AI is done, toggle closed
    setIsChatOpen(false);
    setShowOutput(false);
    hudLog('> assistant.panel close', 'info');
  };

  // This handles closing when clicking outside the chat windows.
  const handleCloseChat = () => {
    // Don't allow closing while AI is typing
    if (isAITyping) {
      return;
    }
    setIsChatOpen(false);
    setShowOutput(false);
    hudLog('> assistant.panel dismissed', 'info');
    // Don't clear messages or history - keep them for when user reopens
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isAITyping) return;
    const preview = input.trim().replace(/\s+/g, ' ').slice(0, 56);

    // Hide the previous output and disable input
    setShowOutput(false);
    setIsAITyping(true);
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    hudLog(`> assistant.query "${preview}"`, 'info');

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
        hudLog(`> assistant.response ready (${response.message.length} chars)`, 'ok');
      } else {
        // Handle API error
        const errorMessage = response.error || 'Sorry, I encountered an error. Please try again.';
        setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage}` }]);
        hudLog(`> assistant.response error: ${errorMessage}`, 'warn');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Sorry, I\'m having trouble connecting. Please check your configuration and try again.';
      
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage}` }]);
      hudLog(`> assistant.transport error: ${errorMessage}`, 'warn');
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
